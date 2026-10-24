import { createFileRoute, isRedirect, Link, Outlet, redirect } from "@tanstack/react-router";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PersistentBottomNav } from "@/components/bank/AppShell";
import { SwipeNav } from "@/components/bank/SwipeNav";
import { BiometricLock } from "@/components/bank/BiometricLock";
import { Button } from "@/components/ui/button";
import { useBank, balance, monthTotals, formatEur, formatDate } from "@/lib/bank-store";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";
import { reportLovableError } from "@/lib/lovable-error-reporting";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        // Neplatný/expirovaný token: vyčistiť lokálnu reláciu, aby sa používateľ mohol znova prihlásiť
        await supabase.auth.signOut({ scope: "local" }).catch(() => {});
        throw redirect({ to: "/auth" });
      }
      return { user: data.user };
    } catch (error) {
      if (isRedirect(error)) throw error;
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      throw redirect({ to: "/auth" });
    }
  },
  component: AuthenticatedLayout,
  pendingComponent: AuthLoadingComponent,
  errorComponent: AuthErrorComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <p className="text-sm text-muted-foreground">Stránka sa nenašla.</p>
    </div>
  ),
});

function AuthLoadingComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <p className="text-sm text-muted-foreground">Overujem prihlásenie…</p>
    </div>
  );
}

function AuthErrorComponent({ error }: { error: unknown }) {
  console.error(error);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-xl font-bold">Obrazovka sa nenačítala</h1>
      <p className="text-sm text-muted-foreground">Skúste to prosím znova alebo sa prihláste odznova.</p>
      <div className="flex gap-2">
        <Button
          onClick={() => window.location.reload()}
          className="h-11 rounded-xl px-4 font-semibold"
        >
          Obnoviť
        </Button>
        <Link
          to="/auth"
          className="rounded-xl border border-border bg-surface px-4 py-2.5 font-semibold text-foreground"
        >
          Prihlásenie
        </Link>
      </div>
    </div>
  );
}

class AuthenticatedErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(error);
    reportLovableError(error, {
      boundary: "authenticated_layout",
      componentStack: info.componentStack ?? "",
    });
  }

  override render() {
    if (this.state.failed) return <AuthErrorComponent error={new Error("Authenticated page failed")} />;
    return this.props.children;
  }
}

function BankDataGate({ children }: { children: ReactNode }) {
  const bank = useBank();

  if (bank.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">Načítavam údaje účtu…</p>
      </div>
    );
  }

  if (bank.error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="text-xl font-bold">Údaje sa nenačítali</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{bank.error}</p>
        <Button onClick={() => window.location.reload()} className="h-11 rounded-xl px-5 font-semibold">
          Skúsiť znova
        </Button>
      </div>
    );
  }

  return <><BankWebTools />{children}</>;
}

function BankWebTools() {
  const bank = useBank();
  useWebMCP({
    name: "get_account_summary",
    description: "Read the account balance and this month's income and expenses shown in the app.",
    annotations: { readOnlyHint: true },
    execute: () =>
      runWebMCPTool("get_account_summary", () => {
        const { income, expense } = monthTotals(bank);
        return `Zostatok ${formatEur(balance(bank))}; tento mesiac príjmy ${formatEur(income)}, výdavky ${formatEur(expense)}.`;
      }),
  });
  useWebMCP({
    name: "list_recent_transactions",
    description: "List the 20 most recent transactions on the account.",
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () =>
      runWebMCPTool("list_recent_transactions", () =>
        bank.transactions.length === 0
          ? "Žiadne transakcie."
          : bank.transactions.slice(0, 20).map((t) => `${t.id}: ${formatDate(t.date)} ${t.type === "in" ? "+" : "-"}${formatEur(t.amount)} ${t.counterparty}`).join("\n"),
      ),
  });
  return null;
}

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();

  return (
    <AuthenticatedErrorBoundary>
      <BiometricLock userId={user.id}>
        <BankDataGate>
          <div className="mx-auto min-h-screen w-full max-w-[430px] bg-background pb-28">
            <SwipeNav><Outlet /></SwipeNav>
            <PersistentBottomNav />
          </div>
        </BankDataGate>
      </BiometricLock>
    </AuthenticatedErrorBoundary>
  );
}
