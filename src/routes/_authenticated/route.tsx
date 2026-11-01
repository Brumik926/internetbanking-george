import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BiometricLock } from "@/components/bank/BiometricLock";
import { PersistentBottomNav } from "@/components/bank/AppShell";
import { SessionTimeoutWarning } from "@/components/bank/SessionTimeoutWarning";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { next: location.href }, replace: true });
    }
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  return (
    <BiometricLock key={user.id} userId={user.id}>
      <Outlet />
      <PersistentBottomNav />
      <SessionTimeoutWarning />
    </BiometricLock>
  );
}
