import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { AppShell, BrandHeader } from "@/components/bank/AppShell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatEur, useBank } from "@/lib/bank-store";
import { supabase } from "@/integrations/supabase/client";
import { isBiometricEnabled, verifyBiometric } from "@/lib/biometric";

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

function cardNumber(iban: string) {
  const d = (iban.replace(/\D/g, "") + "4000000000000000").slice(0, 12);
  return `4${d.slice(1, 4)} ${d.slice(4, 8)} ${d.slice(8, 12)} ${iban.replace(/\D/g, "").slice(-4) || "0000"}`;
}

function CardsPage() {
  const s = useBank();
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<CardSettings>(DEFAULTS);
  const [revealed, setRevealed] = useState(false);
  const key = userId ? `george-card:${userId}` : null;

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      const raw = id ? localStorage.getItem(`george-card:${id}`) : null;
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    });
  }, []);

  const save = (next: CardSettings) => {
    setSettings(next);
    if (key) localStorage.setItem(key, JSON.stringify(next));
  };

  const full = cardNumber(s.iban || "");
  const lastFour = full.slice(-4);
  const cvv = String((Number(lastFour) * 7) % 1000).padStart(3, "0");
  const holder = s.owner || "Majiteľ účtu";
  const now = new Date();
  const expiry = `${String(now.getMonth() + 1).padStart(2, "0")}/${String((now.getFullYear() + 4) % 100).padStart(2, "0")}`;

  const toggleReveal = async () => {
    if (revealed) return setRevealed(false);
    if (userId && isBiometricEnabled(userId)) {
      const ok = await verifyBiometric(userId).catch(() => false);
      if (!ok) return toast.error("Overenie zlyhalo");
    }
    setRevealed(true);
    setTimeout(() => setRevealed(false), 30000);
  };

  return (
    <AppShell>
      <BrandHeader title="Moje karty" subtitle="Platobné karty k vášmu účtu" back />
      <div className="space-y-4 px-4">
        <div className={`rounded-2xl bg-gradient-to-br from-[#196ee6] to-[#0b3d91] p-5 text-white shadow-lg transition ${settings.blocked ? "opacity-50 grayscale" : ""}`}>
          <div className="mb-8 flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <CreditCard className="size-5" /> Debetná karta VISA
            </span>
            <span className="text-xs opacity-80">{settings.blocked ? "Dočasne blokovaná" : "Aktívna"}</span>
          </div>
          <div className="mb-4 text-lg tracking-widest">{revealed ? full : `•••• •••• •••• ${lastFour}`}</div>
          <div className="flex justify-between text-xs opacity-80">
            <span>Platnosť: {expiry}</span>
            <span>CVV: {revealed ? cvv : "•••"}</span>
            <span>{holder}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="h-12 rounded-2xl" onClick={toggleReveal}>
            {revealed ? <EyeOff /> : <Eye />} {revealed ? "Skryť údaje" : "Zobraziť údaje"}
          </Button>
          <Button
            variant={settings.blocked ? "default" : "secondary"}
            className="h-12 rounded-2xl"
            onClick={() => {
              save({ ...settings, blocked: !settings.blocked });
              toast.success(settings.blocked ? "Karta odblokovaná" : "Karta dočasne zablokovaná");
            }}
          >
            {settings.blocked ? <Unlock /> : <Lock />} {settings.blocked ? "Odblokovať" : "Zablokovať"}
          </Button>
        </div>

        <section className="space-y-6 rounded-3xl bg-surface p-5" data-no-swipe>
          <LimitRow label="Denný limit platieb" value={settings.payLimit} max={5000}
            onChange={(v) => save({ ...settings, payLimit: v })} />
          <LimitRow label="Denný limit výberov z bankomatu" value={settings.atmLimit} max={2000}
            onChange={(v) => save({ ...settings, atmLimit: v })} />
        </section>

        <p className="px-1 text-xs text-muted-foreground">Ďalšie karty si budete môcť objednať čoskoro.</p>
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
      <Slider value={[value]} min={0} max={max} step={50} onValueChange={(v) => onChange(v[0] ?? 0)} />
    </div>
  );
}
