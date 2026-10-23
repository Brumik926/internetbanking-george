import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Pencil, Plus, Rss, ShoppingBasket, House, Bus, HeartPulse, CircleDollarSign, Wallet, X } from "lucide-react";
import { AppShell } from "@/components/bank/AppShell";
import { Button } from "@/components/ui/button";
import { CATEGORIES, formatEur, MONTHS, removeBudget, setBudget, useBank } from "@/lib/bank-store";
import { budgetSummary } from "@/lib/budget-summary";

export const Route = createFileRoute("/_authenticated/rozpocet")({
  head: () => ({ meta: [
    { title: "FIT · Mesačný rozpočet | George" },
    { name: "description", content: "Mesačný FIT prehľad príjmov, výdavkov a rozpočtu podľa kategórií." },
    { property: "og:title", content: "FIT · Mesačný rozpočet | George" },
    { property: "og:description", content: "Vaše výdavky, príjmy a mesačné limity na jednom mieste." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Rozpocet,
});

const field = "h-12 w-full rounded-lg border border-border bg-detail-surface px-3 text-base outline-none focus:border-detail-action";
const categoryIcons: Record<string, typeof Wallet> = { Potraviny: ShoppingBasket, Bývanie: House, Doprava: Bus, Zdravie: HeartPulse, Poplatky: CircleDollarSign };

function Rozpocet() {
  const state = useBank();
  const [month, selectMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [tab, setTab] = useState<"expenses" | "incomes" | "budget">("expenses");
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState("Potraviny");
  const [limit, setLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const summary = budgetSummary(state, month);
  const label = `${MONTHS[month.getMonth()]} ${month.getFullYear()}`;
  const rows = tab === "incomes" ? summary.incomes : summary.expenses;
  const total = tab === "incomes" ? summary.income : summary.expense;
  const shiftMonth = (direction: number) => selectMonth(new Date(month.getFullYear(), month.getMonth() + direction, 1));
  const edit = (name?: string) => {
    const budget = state.budgets.find((row) => row.category === name);
    setCategory(name ?? "Potraviny"); setLimit(budget ? String(budget.limit) : ""); setError(""); setEditing(true);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(limit.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) { setError("Zadajte limit väčší ako 0 €."); return; }
    setSaving(true);
    try { await setBudget(category, amount); setEditing(false); setLimit(""); }
    catch { setError("Limit sa nepodarilo uložiť. Skúste znova."); }
    finally { setSaving(false); }
  };

  return (
    <AppShell>
      <div className="transaction-detail min-h-screen bg-detail-background pb-6 text-foreground">
        <header className="brand-header px-5 pb-6 pt-7 text-brand-foreground">
          <div className="flex items-center justify-between"><Rss className="size-7" strokeWidth={1.8} /><span className="text-sm font-semibold">Finančný prehľad</span></div>
          <h1 className="mt-5 text-[34px] font-bold leading-none">FIT</h1>
          <p className="mt-2 text-sm">Rozpočet</p>
        </header>
        <div className="flex h-16 items-center justify-between px-4">
          <Button variant="ghost" size="icon" aria-label="Predchádzajúci mesiac" onClick={() => shiftMonth(-1)} className="text-detail-action"><ChevronLeft /></Button>
          <h2 className="text-lg font-semibold tracking-normal" aria-live="polite">{label}</h2>
          <Button variant="ghost" size="icon" aria-label="Nasledujúci mesiac" onClick={() => shiftMonth(1)} className="text-detail-action"><ChevronRight /></Button>
        </div>
        {state.loading ? <p role="status" className="px-5 py-10 text-center text-detail-muted">Načítavam finančný prehľad…</p> : state.error ? <p role="alert" className="px-5 py-10 text-expense">{state.error}</p> : <>
          <section aria-label="Mesačný prehľad" className="px-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0 rounded-lg bg-detail-surface p-4">
                <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-expense/10 text-expense"><ArrowUpRight className="size-5" /></span>
                <p className="text-sm text-detail-muted">Výdavky</p><p className="mt-1 break-words text-[21px] font-bold leading-snug" data-testid="fit-expense">{formatEur(summary.expense)}</p>
              </div>
              <div className="min-w-0 rounded-lg bg-detail-surface p-4">
                <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-income/10 text-income"><ArrowDownLeft className="size-5" /></span>
                <p className="text-sm text-detail-muted">Príjmy</p><p className="mt-1 break-words text-[21px] font-bold leading-snug" data-testid="fit-income">{formatEur(summary.income)}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 py-5 text-sm"><span className="text-detail-muted">Rozdiel príjmov a výdavkov</span><strong className={summary.net < 0 ? "text-expense" : "text-income"}>{formatEur(summary.net)}</strong></div>
          </section>
          <section aria-label="Mesačný rozpočet" className="border-y border-border bg-detail-surface px-5 py-5">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold tracking-normal">Mesačný rozpočet</h2><Button variant="ghost" size="icon" aria-label="Upraviť rozpočet" onClick={() => { setTab("budget"); edit(); }} className="text-detail-action"><Pencil /></Button></div>
            {summary.budget > 0 ? <>
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2"><p className="text-2xl font-bold" data-testid="fit-budget">{formatEur(summary.budget)}</p><span className="text-sm text-detail-muted">Súčet limitov kategórií</span></div>
              <progress className="fit-progress mt-4 block h-2 w-full" value={Math.min(summary.expense, summary.budget)} max={summary.budget} aria-label="Čerpanie mesačného rozpočtu" />
              <p className="mt-3 text-sm text-detail-muted">{summary.remaining < 0 ? "Prekročený o " : "Zostáva "}<strong className={summary.remaining < 0 ? "text-expense" : "text-foreground"}>{formatEur(Math.abs(summary.remaining))}</strong></p>
            </> : <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-detail-muted">Neurčený rozpočet</span><Button variant="link" className="px-0 text-detail-action" onClick={() => { setTab("budget"); edit(); }}>Nastaviť rozpočet</Button></div>}
          </section>
          <div role="tablist" aria-label="Finančný prehľad" className="mx-4 mt-5 grid grid-cols-3 border-b border-border">
            {([{ id: "expenses", name: "Výdavky" }, { id: "incomes", name: "Príjmy" }, { id: "budget", name: "Rozpočet" }] as const).map((item) => <Button key={item.id} variant="ghost" role="tab" id={`fit-tab-${item.id}`} aria-controls={`fit-panel-${tab}`} aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`h-12 rounded-none border-b-2 px-1 ${tab === item.id ? "border-detail-action font-bold text-detail-action" : "border-transparent text-detail-muted"}`}>{item.name}</Button>)}
          </div>
          <section role="tabpanel" id={`fit-panel-${tab}`} aria-labelledby={`fit-tab-${tab}`} className="px-4 pt-5">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold tracking-normal">{tab === "budget" ? "Limity kategórií" : "Podľa kategórií"}</h2>{tab === "budget" && <Button size="icon" variant="ghost" aria-label="Pridať limit" onClick={() => edit()} className="text-detail-action"><Plus /></Button>}</div>
            {tab === "budget" ? state.budgets.length === 0 ? <p className="py-6 text-center text-sm text-detail-muted">Zatiaľ žiadne limity.</p> : state.budgets.map((budget) => {
              const spent = summary.expenses.find((row) => row.category === budget.category)?.amount ?? 0;
              const over = spent > budget.limit;
              return <div key={budget.category} className="mb-3 rounded-lg bg-detail-surface p-4">
                <div className="flex items-center justify-between gap-2"><h3 className="min-w-0 break-words text-sm font-semibold tracking-normal">{budget.category}</h3><div className="flex shrink-0"><Button variant="ghost" size="icon" aria-label={`Upraviť limit ${budget.category}`} onClick={() => edit(budget.category)} className="text-detail-action"><Pencil /></Button><Button variant="ghost" size="icon" aria-label={`Odstrániť limit ${budget.category}`} onClick={() => { void removeBudget(budget.category); }} className="text-detail-muted"><X /></Button></div></div>
                <div className="mt-1 flex flex-wrap justify-between gap-1 text-sm"><span className={over ? "text-expense" : "text-foreground"}>{formatEur(spent)}</span><span className="text-detail-muted">z {formatEur(budget.limit)}</span></div>
                <progress className={`fit-progress mt-3 block h-2 w-full ${over ? "fit-progress-over" : ""}`} value={Math.min(spent, budget.limit)} max={budget.limit || 1} aria-label={`Čerpanie ${budget.category}`} />
                {over && <p className="mt-2 text-xs text-expense">Prekročený o {formatEur(spent - budget.limit)}</p>}
              </div>;
            }) : rows.length === 0 ? <p className="py-8 text-center text-sm text-detail-muted">{tab === "incomes" ? "Žiadne príjmy v tomto mesiaci." : "Žiadne výdavky v tomto mesiaci."}</p> : <div className="divide-y divide-border">{rows.map((row) => {
              const Icon = categoryIcons[row.category] ?? Wallet;
              return <div key={row.category} className="flex items-center gap-3 py-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-detail-action-surface text-detail-action"><Icon className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-1 text-sm"><span className="font-semibold">{row.category}</span><strong>{formatEur(row.amount)}</strong></div><div className="mt-2 flex items-center gap-3"><progress className="fit-progress block h-1.5 min-w-0 flex-1" value={row.amount} max={total || 1} aria-label={`Podiel ${row.category}`} /><span className="w-10 text-right text-xs text-detail-muted">{Math.round(row.amount / total * 100)} %</span></div></div></div>;
            })}</div>}
          </section>
        </>}
        {editing && createPortal(<div className="fixed inset-0 z-[70] flex items-end justify-center bg-fit-overlay px-3 py-6 sm:items-center" onClick={() => { if (!saving) setEditing(false); }} onKeyDown={(event) => { if (event.key === "Escape" && !saving) setEditing(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="budget-edit-title" className="max-h-[85dvh] w-full max-w-[398px] overflow-y-auto rounded-lg bg-detail-surface p-5 text-foreground" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between"><h2 id="budget-edit-title" className="text-lg font-semibold tracking-normal">Nastaviť mesačný limit</h2><Button variant="ghost" size="icon" aria-label="Zavrieť" disabled={saving} onClick={() => setEditing(false)}><X /></Button></div>
            <form onSubmit={save} className="space-y-4">
              <label className="block text-sm">Kategória<select autoFocus className={`${field} mt-2`} value={category} onChange={(event) => setCategory(event.target.value)}>{[...new Set([...CATEGORIES, ...state.budgets.map((row) => row.category)])].map((name) => <option key={name}>{name}</option>)}</select></label>
              <label className="block text-sm">Mesačný limit (€)<input className={`${field} mt-2`} inputMode="decimal" value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="0,00" required /></label>
              {error && <p role="alert" className="text-sm text-expense">{error}</p>}
              <Button type="submit" disabled={saving} className="h-12 w-full">{saving ? "Ukladám…" : "Uložiť limit"}</Button>
            </form>
          </section>
        </div>, document.body)}
      </div>
    </AppShell>
  );
}
