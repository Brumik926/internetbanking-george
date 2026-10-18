import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { AppShell, BrandHeader } from "@/components/bank/AppShell";
import { Button } from "@/components/ui/button";
import { formatEur, useBank } from "@/lib/bank-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/karty")({
  head: () => ({
    meta: [
      { title: "Moje karty | George" },
      { name: "description", content: "Prehľad platobných kariet, blokovanie karty a nastavenie limitov v George." },
      { property: "og:title", content: "Moje karty | George" },
      { property: "og:description", content: "Prehľad platobných kariet, blokovanie karty a nastavenie limitov v George." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CardsPage,
});

type CardSettings = { blocked: boolean; payLimit: number; atmLimit: number };
const DEFAULTS: CardSettings = { blocked: false, payLimit: 1500, atmLimit: 500 };

const CARDS = [
  { id: "mc-3302", label: "Virtuálna karta Mastercard", last4: "3302", expiry: "10/31" },
  { id: "mc-5739", label: "Virtuálna karta Mastercard", last4: "5739", expiry: "10/31" },
];

function CardsPage() {
  const s = useBank();
  const [userId, setUserId] = useState<string | null>(null);
  const [all, setAll] = useState<Record<string, CardSettings>>({});

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      const raw = id ? localStorage.getItem(`george-cards:${id}`) : null;
      if (raw) setAll(JSON.parse(raw));
    });
  }, []);

  const save = (cardId: string, next: CardSettings) => {
    const merged = { ...all, [cardId]: next };
    setAll(merged);
    if (userId) localStorage.setItem(`george-cards:${userId}`, JSON.stringify(merged));
  };

  const holder = s.owner || "Majiteľ účtu";

  return (
    <AppShell>
      <BrandHeader title="Moje karty" subtitle="Platobné karty k vášmu účtu" back />
      <div className="space-y-6 px-4">
        {CARDS.map((c) => {
          const st = { ...DEFAULTS, ...all[c.id] };
          return (
            <div key={c.id} className="space-y-3">
              <div className={`relative rounded-2xl bg-gradient-to-br from-[#4a4a4a] to-[#1f1f1f] p-5 text-white shadow-lg transition ${st.blocked ? "opacity-50 grayscale" : ""}`}>
                <div className="mb-8 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-semibold"><CreditCard className="size-5" /> {c.label}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1f1f1f]">{st.blocked ? "Blokovaná" : "Virtuálna"}</span>
                </div>
                <p className="text-xs opacity-70">Číslo karty</p>
                <div className="mb-4 text-lg tracking-widest">•••• •••• •••• {c.last4}</div>
                <div className="flex items-end justify-between text-xs">
                  <div><p className="opacity-70">Dátum platnosti</p><p className="text-base font-semibold">{c.expiry}</p></div>
                  <span className="opacity-80">{holder}</span>
                  <span className="flex" aria-label="Mastercard">
                    <span className="size-8 rounded-full bg-[#eb001b]" />
                    <span className="-ml-3 size-8 rounded-full bg-[#f79e1b]/90" />
                  </span>
                </div>
              </div>
              <Button
                variant={st.blocked ? "default" : "secondary"}
                className="h-12 w-full rounded-2xl"
                onClick={() => {
                  save(c.id, { ...st, blocked: !st.blocked });
                  toast.success(st.blocked ? "Karta odblokovaná" : "Karta dočasne zablokovaná");
                }}
              >
                {st.blocked ? <Unlock /> : <Lock />} {st.blocked ? "Odblokovať" : "Zablokovať"}
              </Button>
              <section className="space-y-6 rounded-3xl bg-surface p-5" data-no-swipe>
                <LimitRow label="Denný limit platieb" value={st.payLimit} max={5000} onChange={(v) => save(c.id, { ...st, payLimit: v })} />
                <LimitRow label="Denný limit výberov z bankomatu" value={st.atmLimit} max={2000} onChange={(v) => save(c.id, { ...st, atmLimit: v })} />
              </section>
            </div>
          );
        })}
        <p className="px-1 text-xs text-muted-foreground">Celé číslo karty a CVV nájdete v aplikácii vašej banky.</p>
      </div>
    </AppShell>
  );
}

function LimitRow({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-3 flex justify-between text-[14px]">
        <span>{label}</span>
        <span className="font-bold">{formatEur(value)}</span>
      </div>
      <input type="range" aria-label={label} className="h-11 w-full cursor-pointer accent-primary" value={value} min={0} max={max} step={50} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
