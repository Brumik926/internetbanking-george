import { supabase } from "@/integrations/supabase/client";
import { fromCents, toCents } from "@/lib/money";

export type Txn = {
  id: string;
  type: "in" | "out";
  counterparty: string;
  iban?: string | undefined;
  amount: number;
  amount_cents?: number;
  date: string;
  category: string;
  note?: string | undefined;
  vs?: string | undefined;
  status?: "pending" | "completed" | "failed";
  idempotency_key?: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
};

export type BudgetLimit = { category: string; limit: number };

export type BankState = {
  owner: string;
  iban: string;
  transactions: Txn[];
  goals: Goal[];
  budgets: BudgetLimit[];
  loading: boolean;
  error: string | null;
};

export const CATEGORIES = [
  "Potraviny",
  "Bývanie",
  "Doprava",
  "Zábava",
  "Zdravie",
  "Poplatky",
  "Mzda",
  "Ostatné príjmy",
  "Sporenie",
  "Prevod",
];

function iso(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d, 10, 0, 0)).toISOString();
}

function randomIban() {
  let digits = "";
  for (let i = 0; i < 16; i++) digits += Math.floor(Math.random() * 10);
  const groups = digits.match(/.{1,4}/g) ?? [];
  return `SK31 1200 ${groups.slice(0, 3).join(" ")}`;
}

function seedTransactions() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;

  const rows: Omit<Txn, "id">[] = [
    { type: "in", counterparty: "Počiatočný zostatok", amount: 41097.5, amount_cents: 4109750, date: iso(py, pm, 1), category: "Ostatné príjmy", status: "completed" },
    { type: "in", counterparty: "Mzda · Karavela s.r.o.", amount: 1840, amount_cents: 184000, date: iso(y, m, 2), category: "Mzda", vs: "0100", status: "completed" },
    { type: "out", counterparty: "Nájom · Byt Petržalka", amount: 520, amount_cents: 52000, date: iso(y, m, 3), category: "Bývanie", status: "completed" },
    { type: "in", counterparty: "Radina Olha", iban: "SK42 1100 0000 0029 3633 0786", amount: 120, amount_cents: 12000, date: iso(y, m, 4), category: "Ostatné príjmy", note: "Vrátenie pôžičky", status: "completed" },
    { type: "out", counterparty: "Poplatok za vedenie účtu", amount: 7, amount_cents: 700, date: iso(y, m, 5), category: "Poplatky", vs: "0898", status: "completed" },
    { type: "out", counterparty: "Slovnaft", amount: 52.1, amount_cents: 5210, date: iso(y, m, 6), category: "Doprava", status: "completed" },
  ];
  return rows;
}

const empty: BankState = {
  owner: "",
  iban: "",
  transactions: [],
  goals: [],
  budgets: [],
  loading: true,
  error: null,
};

let state: BankState = empty;
const listeners = new Set<() => void>();
let loadPromise: Promise<void> | null = null;

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

function num(v: unknown) {
  return typeof v === "number" ? v : Number(v ?? 0);
}

export function balance(s: BankState) {
  return s.transactions.reduce((acc, t) => {
    const cents = typeof t.amount_cents === "number" ? t.amount_cents : toCents(t.amount);
    return acc + (t.type === "in" ? cents : -cents);
  }, 0);
}

export function monthTotals(s: BankState, d = new Date()) {
  let income = 0;
  let expense = 0;

  for (const t of s.transactions) {
    if (!inMonth(t, d)) continue;
    const cents = typeof t.amount_cents === "number" ? t.amount_cents : toCents(t.amount);
    if (t.type === "in") income += cents;
    else expense += cents;
  }

  return { income, expense };
}

export function formatEur(n: number) {
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
  }).format(fromCents(n));
}

export function inMonth(t: Pick<Txn, "date">, d = new Date()) {
  const date = new Date(t.date);
  return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function seedIfNeeded(userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("owner, iban, seeded")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.seeded) return profile;

  const iban = profile?.iban && profile.iban.length > 0 ? profile.iban : randomIban();

  await supabase.from("transactions").insert(
    seedTransactions().map((t) => ({
      user_id: userId,
      type: t.type,
      counterparty: t.counterparty,
      iban: t.iban ?? null,
      amount: t.amount,
      amount_cents: typeof t.amount_cents === "number" ? t.amount_cents : toCents(t.amount),
      date: t.date,
      category: t.category,
      note: t.note ?? null,
      vs: t.vs ?? null,
      status: t.status ?? "completed",
    })),
  );

  await supabase.from("goals").insert([
    { user_id: userId, name: "Rezervný fond", target: 4000, saved: 2560 },
    { user_id: userId, name: "Dovolenka", target: 1200, saved: 340 },
  ]);

  await supabase.from("budgets").insert([
    { user_id: userId, category: "Potraviny", limit_amount: 400 },
    { user_id: userId, category: "Bývanie", limit_amount: 600 },
    { user_id: userId, category: "Doprava", limit_amount: 150 },
    { user_id: userId, category: "Zábava", limit_amount: 120 },
  ]);

  await supabase.from("profiles").upsert({ id: userId, owner: "", iban, seeded: true }, { onConflict: "id" });

  return { ...profile, iban, seeded: true };
}

async function hydrate() {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const userId = await currentUserId();
    if (!userId) {
      state = { ...empty, loading: false, error: "Používateľ nie je prihlásený." };
      emit();
      return;
    }

    const [{ data: profile }, { data: txns }, { data: goals }, { data: budgets }] = await Promise.all([
      supabase.from("profiles").select("owner, iban").eq("id", userId).maybeSingle(),
      supabase.from("transactions").select("id, type, counterparty, iban, amount, amount_cents, date, category, note, vs, status, idempotency_key").eq("user_id", userId).order("date", { ascending: false }),
      supabase.from("goals").select("id, name, target, saved").eq("user_id", userId),
      supabase.from("budgets").select("category, limit_amount").eq("user_id", userId),
    ]);

    if (profile) {
      state.owner = profile.owner ?? "";
      state.iban = profile.iban ?? "";
    }

    state.transactions = (txns ?? []).map((row) => {
      const amount = typeof row.amount === "number" ? Number(row.amount) : Number(row.amount ?? 0);
      const amountCents = typeof row.amount_cents === "number"
        ? row.amount_cents
        : toCents(amount);

      return {
        id: String(row.id),
        type: row.type,
        counterparty: String(row.counterparty ?? ""),
        iban: row.iban ?? undefined,
        amount,
        amount_cents: amountCents,
        date: String(row.date),
        category: String(row.category ?? "Ostatné príjmy"),
        note: row.note ?? undefined,
        vs: row.vs ?? undefined,
        status: (row.status as Txn["status"]) ?? "completed",
        idempotency_key: row.idempotency_key ?? undefined,
      };
    });

    state.goals = (goals ?? []).map((g) => ({
      id: String(g.id),
      name: String(g.name),
      target: Number(g.target ?? 0),
      saved: Number(g.saved ?? 0),
    }));

    state.budgets = (budgets ?? []).map((b) => ({
      category: String(b.category),
      limit: Number(b.limit_amount ?? 0),
    }));

    state.loading = false;
    state.error = null;
    emit();
  })().catch((error: unknown) => {
    console.error(error);
    state = {
      ...empty,
      loading: false,
      error: "Údaje účtu sa nepodarilo načítať. Skontrolujte pripojenie a skúste to znova.",
    };
    emit();
  });

  return loadPromise;
}

export function resetStore() {
  loadPromise = null;
  state = empty;
  emit();
}

export function useBank() {
  const [snapshot, setSnapshot] = useState<BankState>(state);
  useEffect(() => {
    const listener = () => setSnapshot(state);
    listeners.add(listener);
    if (snapshot.loading) void hydrate();
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, [snapshot.loading]);
  return snapshot;
}

export async function addTransaction(t: Omit<Txn, "id">) {
  const userId = await currentUserId();
  if (!userId) {
    throw new Error("Používateľ nie je prihlásený. Platbu nie je možné uložiť.");
  }

  const cents = typeof t.amount_cents === "number" ? t.amount_cents : toCents(t.amount);
  const idempotencyKey = t.idempotency_key ?? crypto.randomUUID();
  const status = t.status ?? "completed";

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type: t.type,
      counterparty: t.counterparty,
      iban: t.iban ?? null,
      amount: Number((cents / 100).toFixed(2)),
      amount_cents: cents,
      date: t.date,
      category: t.category,
      note: t.note ?? null,
      vs: t.vs ?? null,
      status,
      idempotency_key: idempotencyKey,
    })
    .select("id, amount, amount_cents, status, idempotency_key")
    .single();

  if (error || !data) {
    console.error("Chyba pri ukladaní transakcie do databázy:", error);
    throw new Error(error?.message || "Nepodarilo sa uložiť platbu do databázy.");
  }

  const newTxn: Txn = {
    ...t,
    id: String(data.id),
    amount: Number(data.amount ?? cents / 100),
    amount_cents: Number(data.amount_cents ?? cents),
    status: (data.status as Txn["status"]) ?? status,
    idempotency_key: data.idempotency_key ?? idempotencyKey,
  };

  state.transactions = [newTxn, ...state.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  emit();

  void announceTransaction(newTxn);
  return newTxn;
}

async function announceTransaction(t: Txn) {
  const { notify } = await import("@/lib/notifications");

  const amount = typeof t.amount_cents === "number" ? t.amount_cents : toCents(t.amount);

  if (t.type === "in") {
    await notify(
      "in",
      "Prijatý prevod",
      `${formatEur(amount)} od ${t.counterparty}. Nový zostatok ${formatEur(balance(state))}.`,
    );
  } else {
    await notify(
      "out",
      "Platba odoslaná",
      `${formatEur(amount)} pre ${t.counterparty}. Nový zostatok ${formatEur(balance(state))}.`,
    );

    const budget = state.budgets.find((b) => b.category === t.category);
    if (budget && budget.limit > 0) {
      const spent = state.transactions
        .filter((x) => x.type === "out" && x.category === t.category && inMonth(x))
        .reduce((sum, x) => sum + (typeof x.amount_cents === "number" ? x.amount_cents : toCents(x.amount)), 0);
      if (spent > toCents(budget.limit)) {
        await notify(
          "budget",
          `Prekročený rozpočet · ${t.category}`,
          `Tento mesiac ste utratili ${formatEur(spent)} z limitu ${formatEur(toCents(budget.limit))}.`,
        );
      }
    }
  }
}

export async function addGoal(name: string, target: number) {
  const userId = await currentUserId();
  if (!userId) return;
  const { data } = await supabase
    .from("goals")
    .insert({ user_id: userId, name, target, saved: 0 })
    .select("id")
    .maybeSingle();
  state.goals = [...state.goals, { id: data?.id ?? crypto.randomUUID(), name, target, saved: 0 }];
  emit();
}

export async function depositToGoal(id: string, amount: number) {
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return;
  const saved = goal.saved + amount;
  await supabase.from("goals").update({ saved }).eq("id", id);
  state.goals = state.goals.map((g) => (g.id === id ? { ...g, saved } : g));
  emit();
  await addTransaction({
    type: "out",
    counterparty: `Sporenie · ${goal.name}`,
    amount,
    amount_cents: toCents(amount),
    date: new Date().toISOString(),
    category: "Sporenie",
  });
}

export async function setBudget(category: string, limit: number) {
  const userId = await currentUserId();
  if (!userId) return;
  await supabase
    .from("budgets")
    .upsert({ user_id: userId, category, limit_amount: limit }, { onConflict: "user_id,category" });
  const exists = state.budgets.some((b) => b.category === category);
  state.budgets = exists
    ? state.budgets.map((b) => (b.category === category ? { category, limit } : b))
    : [...state.budgets, { category, limit }];
  emit();
}

export async function removeBudget(category: string) {
  await supabase.from("budgets").delete().eq("category", category);
  state.budgets = state.budgets.filter((b) => b.category !== category);
  emit();
}

export async function saveProfile(owner: string, iban: string) {
  const userId = await currentUserId();
  if (!userId) throw new Error("Pre uloženie údajov sa prihláste.");
  const { data, error } = await supabase.from("profiles")
    .upsert({ id: userId, owner: owner.trim(), iban: iban.trim(), seeded: true })
    .select("owner, iban")
    .single();
  if (error) throw error;
  if (!data) throw new Error("Údaje účtu sa nepodarilo uložiť.");
  state.owner = data.owner ?? owner.trim();
  state.iban = data.iban ?? iban.trim();
  emit();
}

export { num };
