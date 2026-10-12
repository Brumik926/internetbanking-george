import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/bank/AppShell";
import { WorldClock } from "@/components/WorldClock";

export const Route = createFileRoute("/_authenticated/svetovy-cas")({
  head: () => ({
    meta: [
      { title: "Svetový čas | George" },
      {
        name: "description",
        content: "Digitálne hodiny zobrazujúce čas v rôznych časových pásmach po celom svete.",
      },
      { property: "og:title", content: "Svetový čas | George" },
      {
        property: "og:description",
        content: "Digitálne hodiny zobrazujúce čas v rôznych časových pásmach po celom svete.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SvetovyCas,
});

function SvetovyCas() {
  return (
    <AppShell>
      <div className="min-h-screen bg-background pb-6 font-sans text-foreground">
        <header className="px-4 py-6 border-b border-border">
          <h1 className="text-3xl font-bold">Svetový čas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sleduj aktuálny čas v najdôležitejších mestách sveta
          </p>
        </header>

        <main className="px-4 py-6">
          <WorldClock />
        </main>
      </div>
    </AppShell>
  );
}
