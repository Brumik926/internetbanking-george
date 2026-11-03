import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fromCents, toCents } from "@/lib/money";

/** `amount` is the EUR display value retained for legacy UI callers; `amount_cents` is canonical. */
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

export type Goal = { id: string; name: string; target: number; saved: number };
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

export const CATEGORIES = ["Potraviny", "Bývanie", "Doprava", "Zábava", "Zdravie", "Poplatky", "Mzda", "Ostatné príjmy", "Sporenie", "Prevod"];

function iso(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d, 10, 0, 0)).toISOString();
}

function randomIban() {
  let digits = "";
  for (let i = 0; i < 16; i++) digits += Math.floor(Math.random() * 10);
  return `SK31 1200 ${(digits.match(/.{1,4}/g) ?? []).slice(0, 3).join(" ")}`;
}

function seedTransactions(): Omit<Txn, "id">[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  return [
    { type: "in", counterparty: "Počiatočný zostatok", amount: 41097.5, date: iso(py, pm, 1), category: "Ostatné príjmy" },
    { type: "in", counterparty: "Mzda · Karavela s.r.o.", amount: 1840, date: iso(py, pm, 5), category: "Mzda" },
    { type: "out", counterparty: "Nájom · Byt Petržalka", amount: 520, date: iso(py, pm, 8), category: "Bývanie" },
    { type: "out", counterparty: "Kino Lumière", amount: 18, date: iso(py, pm, 19), category: "Zábava" },
    { type: "out", counterparty: "Billa", amount: 68.4, date: iso(y, m, 1), category: "Potraviny" },
    { type: "in", counterparty: "Mzda · Karavela s.r.o.", amount: 1840, date: iso(y, m, 2), category: "Mzda", vs: "0100" },
    { type: "out", counterparty: "Nájom · Byt Petržalka", amount: 520, date: iso(y, m, 3), category: "Bývanie" },
    { type: "in", counterparty: "Radina Olha", iban: "SK42 1100 0000 0029 3633 0786", amount: 120, date: iso(y, m, 4), category: "Ostatné príjmy", note: "Vrátenie pôžičky" },
    { type: "out", counterparty: "Poplatok za vedenie účtu", amount: 7, date: iso(y, m, 5), category: "Poplatky", vs: "0898" },
    { type: "out", counterparty: "Slovnaft", amount: 52.1, date: iso(y, m, 6), category: "Doprava" },
  ];
}

const empty: BankState = { owner: "", iban: "", transactions: [], goals: [], budgets: [], loading: true, error: null };
let state: BankState = empty;
const listeners = new Set<() => void>();
let loadPromise: Promise<void> | null = null;
// Reuse a key after an uncertain network failure; clear it once the server confirms the result.
const paymentKeys = new Map<string, string>();

function emit() {
  state = { ...state };
  listeners.forEach((listener) => listener());
}
function num(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
function amountCents(txn: Txn) {
  return txn.amount_cents ?? toCents(txn.amount);
}
function fromDatabaseRow(row: any): Txn {
  const cents = Number(row.amount_cents ?? toCents(num(row.amount)));
  return {
    id: row.id,
    type: row.type === "in" ? "in" : "out",
    counterparty: row.counterparty,
    iban: row.iban ?? undefined,
    amount_cents: cents,
    amount: fromCents(cents),
    date: row.date,
    category: row.category,
    note: row.note ?? undefined,
    vs: row.vs ?? undefined,
    status: row.status ?? "completed",
    idempotency_key: row.idempotency_key ?? undefined,
  };
}
async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

async function seedIfNeeded(userId: string) {
  const { data: profile, error } = await supabase.from("profiles").select("owner, iban, seeded").eq("id", userId).maybeSingle();
  if (error) throw error;
  if (profile?.seeded) return profile;

  const iban = profile?.iban || randomIban();
  const [txns, goals, budgets] = await Promise.all([
    supabase.from("transactions").insert(seedTransactions().map((txn) => ({
      user_id: userId, type: txn.type, counterparty: txn.counterparty, iban: txn.iban ?? null,
      amount: txn.amount, date: txn.date, category: txn.category, note: txn.note ?? null, vs: txn.vs ?? null,
    }))),
    supabase.from("goals").insert([
      { user_id: userId, name: "Rezervný fond", target: 4000, saved: 2560 },
      { user_id: userId, name: "Dovolenka", target: 1200, saved: 340 },
    ]),
    supabase.from("budgets").insert([
      { user_id: userId, category: "Potraviny", limit_amount: 400 },
      { user_id: userId, category: "Bývanie", limit_amount: 600 },
      { user_id: userId, category: "Doprava", limit_amount: 150 },
      { user_id: userId, category: "Zábava", limit_amount: 120 },
    ]),
  ]);
  if (txns.error) throw txns.error;
  if (goals.error) throw goals.error;
  if (budgets.error) throw budgets.error;
  const { data: updated, error: profileError } = await supabase.from("profiles")
    .upsert({ id: userId, owner: profile?.owner ?? "", iban, seeded: true })
    .select("owner, iban, seeded").maybeSingle();
  if (profileError) throw profileError;
  return updated ?? { owner: profile?.owner ?? "", iban, seeded: true };
}

export async function loadAll() {
  const userId = await currentUserId();
  if (!userId) {
    state = { ...empty, loading: false, error: null };
    emit();
    return;
  }
  const profile = await seedIfNeeded(userId);
  const [txns, goals, budgets] = await Promise.all([
    supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }),
    supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    supabase.from("budgets").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
  ]);
  if (txns.error) throw txns.error;
  if (goals.error) throw goals.error;
  if (budgets.error) throw budgets.error;
  state = {
    owner: profile?.owner ?? "", iban: profile?.iban ?? "",
    transactions: (txns.data ?? []).map(fromDatabaseRow).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    goals: (goals.data ?? []).map((goal) => ({ id: goal.id, name: goal.name, target: num(goal.target), saved: num(goal.saved) })),
    budgets: (budgets.data ?? []).map((budget) => ({ category: budget.category, limit: num(budget.limit_amount) })),
    loading: false, error: null,
  };
  emit();
}

export function hydrate() {
  if (!loadPromise) {
    loadPromise = loadAll().catch((error: unknown) => {
      console.error(error);
      state = { ...empty, loading: false, error: "Údaje účtu sa nepodarilo načítať. Skontrolujte pripojenie a skúste to znova." };
      emit();
    });
  }
  return loadPromise;
}
export function resetStore() {
  loadPromise = null;
  paymentKeys.clear();
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
    return () => { listeners.delete(listener); };
  }, [snapshot.loading]);
  return snapshot;
}

export async function addTransaction(txn: Omit<Txn, "id">) {
  const userId = await currentUserId();
  if (!userId) throw new Error("Používateľ nie je prihlásený. Transakciu nie je možné uložiť.");
  const cents = txn.amount_cents ?? toCents(txn.amount);
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("Suma transakcie musí byť kladná suma v centoch.");

  let row: any;
  if (txn.type === "out") {
    const fingerprint = JSON.stringify([userId, txn.counterparty.trim(), (txn.iban ?? "").replace(/\s/g, "").toUpperCase(), cents, txn.category, txn.note ?? null, txn.vs ?? null]);
    const key = paymentKeys.get(fingerprint) ?? crypto.randomUUID();
    paymentKeys.set(fingerprint, key);
    const { data, error } = await supabase.rpc("create_payment", {
      p_counterparty: txn.counterparty.trim(), p_iban: txn.iban ?? "", p_amount_cents: cents,
      p_idempotency_key: key, p_category: txn.category, p_note: txn.note ?? undefined, p_vs: txn.vs ?? null,
    });
    if (error || !data) {
      // Keep the key for a retry if the request outcome was uncertain.
      throw new Error(error?.message ?? "Platobný príkaz sa nepodarilo vytvoriť.");
    }
    row = data;
    paymentKeys.delete(fingerprint);
  } else {
    const { data, error } = await supabase.from("transactions").insert({
      user_id: userId, type: txn.type, counterparty: txn.counterparty, iban: txn.iban ?? null,
      amount: fromCents(cents), amount_cents: cents, date: txn.date, category: txn.category,
      note: txn.note ?? null, vs: txn.vs ?? null, status: txn.status ?? "completed",
    }).select("*").single();
    if (error || !data) throw new Error(error?.message ?? "Nepodarilo sa uložiť transakciu.");
    row = data;
  }

  const saved = fromDatabaseRow(row);
  const existingIndex = state.transactions.findIndex((item) => item.id === saved.id);
  state.transactions = existingIndex >= 0
    ? state.transactions.map((item) => item.id === saved.id ? saved : item)
    : [saved, ...state.transactions];
  state.transactions.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  emit();
  void announceTransaction(saved);
  return saved;
}

async function announceTransaction(txn: Txn) {
  const { notify } = await import("@/lib/notifications");
  if (txn.type === "in") {
    await notify("in", "Prijatý prevod", `${formatEur(txn.amount)} od ${txn.counterparty}. Nový zostatok ${formatEur(balance(state))}.`);
    return;
  }
  if (txn.status === "pending") {
    await notify("out", "Platobný príkaz prijatý", `Príkaz na ${formatEur(txn.amount)} pre ${txn.counterparty} čaká na spracovanie.`);
    return;
  }
  await notify("out", "Platba spracovaná", `${formatEur(txn.amount)} pre ${txn.counterparty}. Nový zostatok ${formatEur(balance(state))}.`);
  const budget = state.budgets.find((item) => item.category === txn.category);
  if (budget && budget.limit > 0) {
    const spentCents = state.transactions.filter((item) => item.type === "out" && item.status !== "failed" && item.category === txn.category && inMonth(item))
      .reduce((sum, item) => sum + amountCents(item), 0);
    if (spentCents > toCents(budget.limit)) {
      await notify("budget", `Prekročený rozpočet · ${txn.category}`, `Tento mesiac ste utratili ${formatEur(fromCents(spentCents))} z limitu ${formatEur(budget.limit)}.`);
    }
  }
}

export async function addGoal(name: string, target: number) {
  const userId = await currentUserId();
  if (!userId) return;
  const { data, error } = await supabase.from("goals").insert({ user_id: userId, name, target, saved: 0 }).select("id").maybeSingle();
  if (error) throw error;
  state.goals = [...state.goals, { id: data?.id ?? crypto.randomUUID(), name, target, saved: 0 }];
  emit();
}
export async function depositToGoal(id: string, amount: number) {
  const goal = state.goals.find((item) => item.id === id);
  if (!goal) return;
  const saved = goal.saved + amount;
  const { error } = await supabase.from("goals").update({ saved }).eq("id", id);
  if (error) throw error;
  await addTransaction({ type: "out", counterparty: `Sporenie · ${goal.name}`, amount, date: new Date().toISOString(), category: "Sporenie" });
  state.goals = state.goals.map((item) => item.id === id ? { ...item, saved } : item);
  emit();
}
export async function setBudget(category: string, limit: number) {
  const userId = await currentUserId();
  if (!userId) return;
  const { error } = await supabase.from("budgets").upsert({ user_id: userId, category, limit_amount: limit }, { onConflict: "user_id,category" });
  if (error) throw error;
  const exists = state.budgets.some((item) => item.category === category);
  state.budgets = exists ? state.budgets.map((item) => item.category === category ? { category, limit } : item) : [...state.budgets, { category, limit }];
  emit();
}
export async function removeBudget(category: string) {
  const { error } = await supabase.from("budgets").delete().eq("category", category);
  if (error) throw error;
  state.budgets = state.budgets.filter((item) => item.category !== category);
  emit();
}
export async function saveProfile(owner: string, iban: string) {
  const userId = await currentUserId();
  if (!userId) throw new Error("Pre uloženie údajov sa prihláste.");
  const { data, error } = await supabase.from("profiles").upsert({ id: userId, owner: owner.trim(), iban: iban.trim(), seeded: true }).select("owner, iban").single();
  if (error) throw error;
  if (!data) throw new Error("Údaje účtu sa nepodarilo uložiť.");
  state.owner = data.owner;
  state.iban = data.iban;
  emit();
}

/** Available balance in EUR; sums are performed only in integer cents. */
export function balance(bankState: BankState) {
  const cents = bankState.transactions.reduce((sum, txn) => {
    if (txn.status === "failed") return sum;
    return sum + (txn.type === "in" ? amountCents(txn) : -amountCents(txn));
  }, 0);
  return fromCents(cents);
}
export function inMonth(txn: Txn, date = new Date()) {
  const value = new Date(txn.date);
  return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth();
}
/** Monthly totals in EUR for legacy presentation components; internal accumulation is cents. */
export function monthTotals(bankState: BankState, date = new Date()) {
  let income = 0;
  let expense = 0;
  for (const txn of bankState.transactions) {
    if (!inMonth(txn, date) || txn.status === "failed") continue;
    if (txn.type === "in") income += amountCents(txn);
    else expense += amountCents(txn);
  }
  return { income: fromCents(income), expense: fromCents(expense) };
}
export const MONTHS = ["Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"];
/** Format an EUR display amount. For canonical integer cents use formatCents from money.ts. */
export function formatEur(euros: number) {
  return new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(euros);
}
export function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}
export function groupByMonth(txns: Txn[]) {
  const map = new Map<string, Txn[]>();
  const sorted = [...txns].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  for (const txn of sorted) {
    const date = new Date(txn.date);
    const key = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(txn);
  }
  return [...map.entries()];
}
export async function removeTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
  state.transactions = state.transactions.filter((txn) => txn.id !== id);
  emit();
}
