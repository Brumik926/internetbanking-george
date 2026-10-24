create table public.payment_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null,
  name text not null,
  iban text not null,
  amount numeric not null default 0,
  vs text,
  created_at timestamptz not null default now()
);
alter table public.payment_templates enable row level security;
grant select, insert, update, delete on public.payment_templates to authenticated;
grant all on public.payment_templates to service_role;
create policy "own templates select" on public.payment_templates for select to authenticated using (auth.uid() = user_id);
create policy "own templates insert" on public.payment_templates for insert to authenticated with check (auth.uid() = user_id);
create policy "own templates update" on public.payment_templates for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own templates delete" on public.payment_templates for delete to authenticated using (auth.uid() = user_id);