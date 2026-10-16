import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  Search, 
  BarChart2, 
  Plus, 
  FileEdit,
  CreditCard,
  QrCode,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/bank/AppShell";
import { balance, formatDate, formatEur, MONTHS, useBank, type Txn } from "@/lib/bank-store";

export const Route = createFileRoute("/_authenticated/platby")({
  head: () => ({
    meta: [
      { title: "Účet a transakcie | George" },
      { name: "description", content: "História transakcií a správa účtu George" },
    ],
  }),
  component: UcetDetail,
});

function SlspLogoIcon() {
  return (
    <div className="w-10 h-10 rounded-full bg-[#196ee6] dark:bg-[#2a5ee8] flex items-center justify-center text-white shrink-0 shadow-sm">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <circle cx="12" cy="6" r="2.2" />
        <rect x="7" y="10" width="10" height="2.5" rx="1.2" />
        <rect x="7" y="14" width="10" height="2.5" rx="1.2" />
        <rect x="7" y="18" width="10" height="2.5" rx="1.2" />
      </svg>
    </div>
  );
}

function splitAmount(val: number) {
  const abs = Math.abs(val);
  const [w, d] = abs.toFixed(2).split(".");
  return {
    whole: Number(w).toLocaleString("sk-SK"),
    cents: d,
    isNegative: val < 0,
  };
}

export default function UcetDetail() {
  const s = useBank();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"transakcie" | "funkcie" | "karty" | "info">("transakcie");

  // Reálny zostatok z databázy
  const currentBalance = balance(s);
  const balanceParts = splitAmount(currentBalance);
  const formattedOwnResources = `${balanceParts.isNegative ? "-" : ""}${balanceParts.whole},${balanceParts.cents} € vlastné zdroje`;

  // Dynamické zoskupenie reálnych transakcií z databázy podľa mesiaca a roka
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: { label: string; items: Txn[] } } = {};

    const sorted = [...s.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sorted.forEach((txn) => {
      const d = new Date(txn.date);
      const monthIdx = d.getUTCMonth();
      const year = d.getUTCFullYear();
      const monthName = MONTHS[monthIdx] || "Neznámy";
      const key = `${year}-${String(monthIdx).padStart(2, "0")}`;
      const label = `${monthName} ${year}`;

      if (!groups[key]) {
        groups[key] = { label, items: [] };
      }
      groups[key].items.push(txn);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((k) => groups[k])
      .filter((g): g is { label: string; items: Txn[] } => Boolean(g));
  }, [s.transactions]);

  const copyIban = () => {
    if (s.iban) {
      navigator.clipboard.writeText(s.iban);
      toast.success("IBAN skopírovaný do schránky");
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f4f6f9] dark:bg-[#0e0e12] text-slate-900 dark:text-white pb-32 font-sans transition-colors duration-300">
        
        {/* Fuchsiová hlavička účtu s bielou šípkou späť */}
        <div className="bg-[#be0055] px-4 pt-3 pb-16 text-white transition-colors">
          <div className="flex items-center py-2">
            <Link 
              to="/" 
              className="p-1 -ml-1 text-white hover:opacity-80 active:scale-95 transition"
              aria-label="Späť na prehľad"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </Link>
          </div>
        </div>

        <div className="px-4 -mt-10 space-y-3">
          {/* Karta účtu s reálnym zostatkom */}
          <div className="rounded-3xl bg-white dark:bg-[#1c1c24] p-5 shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[17px] font-semibold text-slate-900 dark:text-white">SPACE účet</h1>
                
                <div className={`mt-1 flex items-baseline tracking-tight ${balanceParts.isNegative ? "text-[#e11d48] dark:text-[#ff5a70]" : "text-slate-900 dark:text-white"}`}>
                  <span className="text-[32px] font-bold leading-none">
                    {balanceParts.isNegative ? "-" : ""}{balanceParts.whole},
                  </span>
                  <sup className="text-[18px] font-bold leading-none top-[-0.45em] ml-0.5 select-none">
                    {balanceParts.cents}
                  </sup>
                  <span className="text-[22px] font-semibold leading-none ml-1 select-none">
                    €
                  </span>
                </div>

                <p className="mt-1.5 text-[13px] text-slate-500 dark:text-gray-400">
                  {formattedOwnResources}
                </p>
              </div>

              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-gray-800">
                <img
                  src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=120&auto=format&fit=crop&q=80"
                  alt="SPACE Účet"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Záložky: Transakcie, Funkcie, Karty, Info */}
          <div className="flex items-center justify-between gap-1 pt-1 pb-1 text-[14px]">
            <button
              type="button"
              onClick={() => setActiveTab("transakcie")}
              className={`rounded-full px-4 py-2 font-semibold transition ${
                activeTab === "transakcie"
                  ? "bg-[#eef3ff] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff]"
                  : "text-[#196ee6] dark:text-[#4f95ff] hover:opacity-80"
              }`}
            >
              Transakcie
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("funkcie")}
              className={`rounded-full px-4 py-2 font-medium transition ${
                activeTab === "funkcie"
                  ? "bg-[#eef3ff] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff]"
                  : "text-[#196ee6] dark:text-[#4f95ff] hover:opacity-80"
              }`}
            >
              Funkcie
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("karty")}
              className={`rounded-full px-4 py-2 font-medium transition ${
                activeTab === "karty"
                  ? "bg-[#eef3ff] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff]"
                  : "text-[#196ee6] dark:text-[#4f95ff] hover:opacity-80"
              }`}
            >
              Karty
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`rounded-full px-4 py-2 font-medium transition ${
                activeTab === "info"
                  ? "bg-[#eef3ff] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff]"
                  : "text-[#196ee6] dark:text-[#4f95ff] hover:opacity-80"
              }`}
            >
              Info
            </button>
          </div>

          {/* Obsah záložky Transakcie */}
          {activeTab === "transakcie" && (
            <div className="space-y-4">
              {/* Platobné príkazy a rezervácie */}
              <div className="flex items-center gap-3.5 rounded-3xl bg-white dark:bg-[#1c1c24] p-4 shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
                <div className="text-[#f43f5e] shrink-0">
                  <FileEdit className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                    Platobné príkazy a rezervácie
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-gray-400 mt-0.5">
                    0 nezrealizovaných platieb & 0 rezervácií
                  </p>
                </div>
              </div>

              {/* Transakcie zoskupené po mesiacoch */}
              {groupedTransactions.length === 0 ? (
                <div className="rounded-3xl bg-white dark:bg-[#1c1c24] p-8 text-center text-slate-400 border border-slate-100 dark:border-white/5">
                  Zatiaľ žiadne zaznamenané transakcie.
                </div>
              ) : (
                groupedTransactions.map((group) => (
                  <div key={group.label} className="space-y-2 pt-1">
                    <h2 className="text-[14px] font-semibold text-slate-800 dark:text-gray-200 px-1">
                      {group.label}
                    </h2>
                    <div className="space-y-2">
                      {group.items.map((t) => {
                        const isIn = t.type === "in";
                        const isSlspFee = t.category === "Poplatky" || t.counterparty?.toLowerCase().includes("poplatok");
                        const txParts = splitAmount(t.amount);

                        return (
                          <div
                            key={t.id}
                            onClick={() => navigate({ to: "/transakcia/$id", params: { id: t.id } })}
                            className="cursor-pointer flex items-center justify-between rounded-3xl bg-white dark:bg-[#1c1c24] p-4 shadow-sm border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-[#22222c] transition"
                          >
                            <div className="flex items-center gap-3">
                              {isSlspFee ? (
                                <SlspLogoIcon />
                              ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                  isIn 
                                    ? "bg-[#e8fbf0] dark:bg-[#102b1f] text-[#16a34a] dark:text-[#4ade80]" 
                                    : "bg-[#edf4ff] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff]"
                                }`}>
                                  {isIn ? (
                                    <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
                                  ) : (
                                    <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                                  )}
                                </div>
                              )}
                              
                              <div>
                                <p className="text-[15px] font-semibold text-slate-900 dark:text-white">
                                  {t.counterparty}
                                </p>
                                <p className="text-[12px] text-slate-500 dark:text-gray-400">
                                  {formatDate(t.date)}
                                </p>
                                {t.vs && (
                                  <p className="text-[12px] text-slate-500 dark:text-gray-400">
                                    KS / VS: {t.vs}
                                  </p>
                                )}
                                <div className="mt-1">
                                  <span className="inline-block rounded-full border border-slate-200 dark:border-white/10 px-2 py-0.5 text-[11px] text-slate-600 dark:text-gray-300">
                                    {t.category}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`text-[15px] font-bold flex items-baseline justify-end ${
                                isIn 
                                  ? "text-[#16a34a] dark:text-[#4ade80]" 
                                  : "text-slate-900 dark:text-white"
                              }`}>
                                <span>{isIn ? "+" : "−"}</span>
                                <span>{txParts.whole}</span>
                                <span>,</span>
                                <sup className="text-[10px] font-semibold top-[-0.4em] ml-0.5 leading-none">
                                  {txParts.cents}
                                </sup>
                                <span className="ml-0.5 text-xs font-normal">€</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Obsah záložky Funkcie */}
          {activeTab === "funkcie" && (
            <div className="space-y-2.5">
              {[
                { title: "Trvalé príkazy", desc: "Správa opakovaných platieb", icon: QrCode },
                { title: "Výber z bankomatu mobilom", desc: "Kód pre bezkartový výber", icon: SlidersHorizontal },
                { title: "Výpisy z účtu", desc: "Mesačné a ročné PDF výpisy", icon: FileEdit },
              ].map((f) => (
                <div key={f.title} className="flex items-center justify-between rounded-3xl bg-white dark:bg-[#1c1c24] p-4 shadow-sm border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <f.icon className="w-5 h-5 text-[#196ee6] dark:text-[#4f95ff]" />
                    <div>
                      <p className="text-[15px] font-medium text-slate-900 dark:text-white">{f.title}</p>
                      <p className="text-[12px] text-slate-500 dark:text-gray-400">{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Obsah záložky Karty */}
          {activeTab === "karty" && (
            <div className="rounded-3xl bg-white dark:bg-[#1c1c24] p-5 shadow-sm border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-slate-500 dark:text-gray-400">Virtuálna karta</p>
                  <p className="text-[16px] font-bold text-slate-900 dark:text-white mt-0.5">VISA Debit ···· 2269</p>
                </div>
                <CreditCard className="w-8 h-8 text-[#196ee6] dark:text-[#4f95ff]" />
              </div>
            </div>
          )}

          {/* Obsah záložky Info */}
          {activeTab === "info" && (
            <div className="rounded-3xl bg-white dark:bg-[#1c1c24] p-5 shadow-sm border border-slate-100 dark:border-white/5 space-y-4">
              <div>
                <p className="text-[12px] text-slate-500 dark:text-gray-400">Majiteľ účtu</p>
                <p className="text-[15px] font-medium text-slate-900 dark:text-white">{s.owner || "Tomáš Lizák"}</p>
              </div>
              <div>
                <p className="text-[12px] text-slate-500 dark:text-gray-400">Názov účtu</p>
                <p className="text-[15px] font-medium text-slate-900 dark:text-white">SPACE účet</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-slate-500 dark:text-gray-400">IBAN</p>
                  <p className="text-[14px] font-mono font-medium text-slate-900 dark:text-white">{s.iban || "SK83 0900 0000 0052 0892 1207"}</p>
                </div>
                <button
                  type="button"
                  onClick={copyIban}
                  className="p-2 text-[#196ee6] dark:text-[#4f95ff] hover:opacity-80 transition"
                  aria-label="Kopírovať IBAN"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Plávajúca spodná akčná lišta (Floating Bottom Action Bar) */}
        <div className="fixed inset-x-0 bottom-5 z-50 mx-auto w-full max-w-[420px] px-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center justify-between rounded-full bg-white/95 dark:bg-[#1c1c24]/95 p-2 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] border border-slate-200/80 dark:border-white/10 backdrop-blur-xl">
            {/* Dve okrúhle ikony: Vyhľadávanie a Štatistika */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex w-11 h-11 items-center justify-center rounded-full bg-[#f0f4fd] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff] hover:opacity-85 transition active:scale-95"
                aria-label="Vyhľadať v transakciách"
              >
                <Search className="w-5 h-5 stroke-[2.2]" />
              </button>

              <button
                type="button"
                className="flex w-11 h-11 items-center justify-center rounded-full bg-[#f0f4fd] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff] hover:opacity-85 transition active:scale-95"
                aria-label="Prehľad výdavkov a štatistika"
              >
                <BarChart2 className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* Plávajúce tlačidlo Nová platba so zväčšeným pluskom */}
            <Link
              to="/nova-platba"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#196ee6] hover:bg-[#155fc7] dark:bg-[#2a5ee8] dark:hover:bg-[#196ee6] pl-4 pr-5 py-2.5 text-[15px] font-bold text-white shadow-md shadow-[#196ee6]/25 transition active:scale-95"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Nová platba</span>
            </Link>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
