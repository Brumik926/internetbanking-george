import { fromCents, toCents } from "@/lib/money";
import { inMonth, type BankState } from "@/lib/bank-store";

/** Monthly cash flow is accumulated in cents and converted only for screen presentation. */
export function budgetSummary(state: Pick<BankState, "transactions" | "budgets">, month: Date) {
  const rows = state.transactions.filter((txn) => txn.status !== "failed" && inMonth(txn, month));
  const categories = (type: "in" | "out") => {
    const amounts = new Map<string, number>();
    for (const txn of rows) {
      if (txn.type !== type) continue;
      const cents = txn.amount_cents ?? toCents(txn.amount);
      amounts.set(txn.category, (amounts.get(txn.category) ?? 0) + cents);
    }
    return [...amounts.entries()]
      .map(([category, cents]) => ({ category, amount: fromCents(cents) }))
      .sort((a, b) => b.amount - a.amount);
  };
  const expenses = categories("out");
  const incomes = categories("in");
  const expense = expenses.reduce((sum, row) => sum + toCents(row.amount), 0);
  const income = incomes.reduce((sum, row) => sum + toCents(row.amount), 0);
  const budget = state.budgets.reduce((sum, row) => sum + toCents(row.limit), 0);
  return {
    expenses,
    incomes,
    expense: fromCents(expense),
    income: fromCents(income),
    budget: fromCents(budget),
    remaining: fromCents(budget - expense),
    net: fromCents(income - expense),
  };
}
