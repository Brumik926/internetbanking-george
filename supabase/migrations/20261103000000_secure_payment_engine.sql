-- Secure payment foundation. Run with Supabase migrations before using the payment flow.
-- Historical amounts remain in EUR for backward-compatible reporting; amount_cents is canonical.

alter table public.transactions
  add column if not exists amount_cents bigint,
  add column if not exists status text not null default 'completed',
  add column if not exists idempotency_key text;

update public.transactions
set amount_cents = round(amount::numeric * 100)::bigint
where amount_cents is null;

alter table public.transactions
  alter column amount_cents set not null,
  alter column amount_cents set default 0;

alter table public.transactions
  drop constraint if exists transactions_status_check;
alter table public.transactions
  add constraint transactions_status_check
  check (status in ('pending', 'completed', 'failed'));

create unique index if not exists transactions_user_id_idempotency_key_unique
  on public.transactions (user_id, idempotency_key)
  where idempotency_key is not null;

-- Keep legacy application writes (amount in EUR) consistent during migration rollout.
create or replace function public.sync_transaction_amount_cents()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.amount_cents is null or (new.amount_cents = 0 and coalesce(new.amount, 0) <> 0) then
      new.amount_cents := round(new.amount::numeric * 100)::bigint;
    end if;
    if new.status is null then new.status := 'completed'; end if;
  elsif new.amount is distinct from old.amount and new.amount_cents is not distinct from old.amount_cents then
    new.amount_cents := round(new.amount::numeric * 100)::bigint;
  end if;
  return new;
end;
$$;

drop trigger if exists transactions_sync_amount_cents on public.transactions;
create trigger transactions_sync_amount_cents
before insert or update of amount, amount_cents on public.transactions
for each row execute function public.sync_transaction_amount_cents();

create table if not exists public.transaction_audit (
  id bigint generated always as identity primary key,
  transaction_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('payment_requested')),
  amount_cents bigint not null check (amount_cents > 0),
  created_at timestamptz not null default now()
);

alter table public.transaction_audit enable row level security;
drop policy if exists "Users can read own transaction audit" on public.transaction_audit;
create policy "Users can read own transaction audit"
  on public.transaction_audit for select to authenticated
  using (user_id = (select auth.uid()));
revoke insert, update, delete on public.transaction_audit from anon, authenticated;

create or replace function public.create_payment(
  p_counterparty text,
  p_iban text,
  p_amount_cents bigint,
  p_idempotency_key text,
  p_category text,
  p_note text default null,
  p_vs text default null
)
returns public.transactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing public.transactions%rowtype;
  v_transaction public.transactions%rowtype;
  v_balance bigint;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 or p_amount_cents > 100000000000 then
    raise exception 'Invalid payment amount' using errcode = '22023';
  end if;
  if nullif(btrim(p_counterparty), '') is null or length(p_counterparty) > 140 then
    raise exception 'Invalid recipient name' using errcode = '22023';
  end if;
  if p_iban is null or length(regexp_replace(upper(p_iban), '\\s', '', 'g')) not between 15 and 34 then
    raise exception 'Invalid recipient IBAN' using errcode = '22023';
  end if;
  if p_idempotency_key is null or p_idempotency_key !~ '^[0-9a-fA-F-]{36}$' then
    raise exception 'Invalid idempotency key' using errcode = '22023';
  end if;
  if nullif(btrim(p_category), '') is null or length(p_category) > 80 then
    raise exception 'Invalid payment category' using errcode = '22023';
  end if;

  -- Serialize balance checks for one customer so concurrent payments cannot overdraw the demo ledger.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select * into v_existing
  from public.transactions t
  where t.user_id = v_user_id and t.idempotency_key = p_idempotency_key;
  if found then
    if v_existing.amount_cents <> p_amount_cents
       or v_existing.counterparty <> btrim(p_counterparty)
       or regexp_replace(upper(coalesce(v_existing.iban, '')), '\\s', '', 'g') <> regexp_replace(upper(p_iban), '\\s', '', 'g') then
      raise exception 'Idempotency key already used for a different payment' using errcode = '22023';
    end if;
    return v_existing;
  end if;

  select coalesce(sum(case when t.type = 'in' then t.amount_cents else -t.amount_cents end), 0)::bigint
    into v_balance
  from public.transactions t
  where t.user_id = v_user_id and t.status in ('pending', 'completed');
  if v_balance < p_amount_cents then
    raise exception 'Insufficient funds' using errcode = 'P0001';
  end if;

  insert into public.transactions (
    user_id, type, counterparty, iban, amount, amount_cents, category,
    note, vs, date, status, idempotency_key
  ) values (
    v_user_id, 'out', btrim(p_counterparty), upper(regexp_replace(p_iban, '\\s', '', 'g')),
    p_amount_cents::numeric / 100, p_amount_cents, btrim(p_category),
    nullif(btrim(p_note), ''), nullif(btrim(p_vs), ''), now(), 'pending', p_idempotency_key
  ) returning * into v_transaction;

  insert into public.transaction_audit (transaction_id, user_id, event_type, amount_cents)
  values (v_transaction.id, v_user_id, 'payment_requested', p_amount_cents);
  return v_transaction;
end;
$$;

revoke all on function public.create_payment(text, text, bigint, text, text, text, text) from public, anon;
grant execute on function public.create_payment(text, text, bigint, text, text, text, text) to authenticated;
