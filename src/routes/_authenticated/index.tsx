import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  CreditCard,
  MoreVertical,
  Compass,
  PieChart,
  MessageSquare,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  ArrowLeft,
  Plane,
  Heart,
  ShoppingBag,
  Medal,
  Calculator,
  User,
  Smartphone,
  Contact,
  FileText,
  Bell,
  Users,
  Layout,
  Globe,
  AppWindow,
  Type,
  Camera,
  Info,
  ShieldCheck,
  UserX,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  balance,
  formatDate,
  formatEur,
  monthTotals,
  MONTHS,
  resetStore,
  useBank,
} from "@/lib/bank-store";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Internetbanking George | Prehľad" },
      { name: "description", content: "Prehľad účtu a financií v internetbankingu George." },
    ],
  }),
  component: GeorgePrehladModern,
});

function formatInitials(name?: string | null, fallback = "TL"): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (!first) return fallback;
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

interface ListItemProps {
  icon: any;
  title: string;
  subtitle?: string;
  badge?: string;
  isLast?: boolean;
  onClick?: () => void;
}

function ListItem({
  icon: Icon,
  title,
  subtitle,
  badge,
  isLast = false,
  onClick,
}: ListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between py-4 text-left px-1 transition-colors ${
        !isLast ? "border-b border-gray-100 dark:border-white/5" : ""
      } hover:bg-gray-50/50 dark:hover:bg-white/5`}
    >
      <div className="flex items-center gap-4">
        <Icon size={24} className="text-[#2a5ee8] dark:text-[#4f95ff]" strokeWidth={1.5} />
        <div>
          <div className="text-[16px] font-bold text-[#111827] dark:text-white">{title}</div>
          {subtitle && (
            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
      {badge && (
        <span className="bg-[#2a5ee8] dark:bg-[#4f95ff] text-white text-[12px] font-bold px-2.5 py-1 rounded-md">
          {badge}
        </span>
      )}
    </button>
  );
}

function GeorgePrehladModern() {
  const navigate = useNavigate();
  const s = useBank();
  const [currentViewMode, setCurrentViewMode] = useState<"dashboard" | "profile">("dashboard");

  const total = balance(s);
  const { income, expense } = monthTotals(s);
  const currentMonthName = (MONTHS[new Date().getUTCMonth()] ?? "tento mesiac").toLowerCase();
  const userInitials = formatInitials(s.owner);
  const userName = s.owner || "Tomáš Lizák";

  const isNegative = total < 0;
  const absVal = Math.abs(total);
  const wholeEuros = Math.floor(absVal).toLocaleString("sk-SK");
  const cents = Math.round((absVal - Math.floor(absVal)) * 100)
    .toString()
    .padStart(2, "0");

  const expWhole = Math.floor(expense).toLocaleString("sk-SK");
  const expCents = Math.round((expense - Math.floor(expense)) * 100)
    .toString()
    .padStart(2, "0");

  const incWhole = Math.floor(income).toLocaleString("sk-SK");
  const incCents = Math.round((income - Math.floor(income)) * 100)
    .toString()
    .padStart(2, "0");

  const recentTransactions = [...(s.transactions ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  async function handleLogout() {
    await supabase.auth.signOut();
    resetStore();
    navigate({ to: "/login" });
  }

  // --- OBSAH PROFILU ---
  const profileContent = (
    <div className="min-h-screen font-sans pb-16 transition-colors duration-300 bg-[#f4f6f9] dark:bg-[#0e0e12] text-gray-900 dark:text-white">
      <main className="px-4 max-w-md mx-auto pt-6">
        {/* Hlavička profilu */}
        <div className="flex justify-between items-center pb-4 mb-2">
          <button
            type="button"
            onClick={() => setCurrentViewMode("dashboard")}
            className="p-2 -ml-2 rounded-full transition-colors text-[#2a5ee8] dark:text-[#4f95ff] hover:bg-blue-50 dark:hover:bg-white/10"
            aria-label="Späť na prehľad"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="font-bold text-[15px] hover:underline flex items-center gap-1.5 text-[#2a5ee8] dark:text-[#4f95ff]"
            >
              <LogOut size={18} />
              Odhlásiť
            </button>
          </div>
        </div>

        <h1 className="text-[28px] font-bold mb-6 text-[#111827] dark:text-white">Profil</h1>

        {/* Karta používateľa */}
        <div className="rounded-3xl p-5 mb-8 shadow-sm border flex justify-between items-center bg-white dark:bg-[#1c1c24] border-gray-100 dark:border-white/5">
          <div>
            <span className="text-[18px] font-bold block text-gray-900 dark:text-white">
              {userName}
            </span>
            <span className="text-[12px] font-mono text-gray-400 mt-1 block">
              {s.iban ? s.iban.replace(/\s+/g, "").match(/.{1,4}/g)?.join(" ") : "SK31 1200 3545 0984 0539"}
            </span>
          </div>
          <div className="w-14 h-14 bg-black rounded-full overflow-hidden flex items-center justify-center border border-gray-700 shadow-sm">
            <span className="text-3xl">🐻</span>
          </div>
        </div>

        {/* Sekcia: Doplnky */}
        <div className="mb-8">
          <h2 className="text-[14px] font-bold mb-3 px-1 text-gray-900 dark:text-gray-400">
            Doplnky
          </h2>
          <div className="rounded-3xl px-5 py-1 shadow-sm border bg-white dark:bg-[#1c1c24] border-gray-100 dark:border-white/5">
            <ListItem icon={Plane} title="Travel Hub" />
            <ListItem icon={Heart} title="Odporučte Georgea" />
            <ListItem
              icon={ShoppingBag}
              title="Moneyback"
              subtitle="0,00 € na vyplatenie"
              badge="5 nových"
            />
            <ListItem icon={Medal} title="Moja odmena" />
            <ListItem icon={Calculator} title="Menová kalkulačka" />
            <ListItem
              icon={TrendingUp}
              title="Ponuka investícií"
              isLast={true}
              onClick={() => navigate({ to: "/sporenie" })}
            />
          </div>
        </div>

        {/* Sekcia: Profil nastavenia */}
        <div className="mb-8">
          <h2 className="text-[14px] font-bold mb-3 px-1 text-gray-900 dark:text-gray-400">
            Profil
          </h2>
          <div className="rounded-3xl px-5 py-1 shadow-sm border bg-white dark:bg-[#1c1c24] border-gray-100 dark:border-white/5">
            <ListItem
              icon={User}
              title="Prihlásenie a podpisovanie"
              onClick={() => navigate({ to: "/nastavenia" })}
            />
            <ListItem icon={Smartphone} title="Správa zariadení" />
            <ListItem
              icon={Contact}
              title="Vaše kontaktné údaje"
              onClick={() => navigate({ to: "/nastavenia" })}
            />
            <ListItem icon={FileText} title="Doklady totožnosti" />
            <ListItem icon={Bell} title="Notifikácie" />
            <ListItem icon={Users} title="Vaše klientske údaje" isLast={true} />
          </div>
        </div>

        {/* Sekcia: Aplikácia */}
        <div className="mb-8">
          <h2 className="text-[14px] font-bold mb-3 px-1 text-gray-900 dark:text-gray-400">
            Aplikácia
          </h2>
          <div className="rounded-3xl px-5 py-1 shadow-sm border bg-white dark:bg-[#1c1c24] border-gray-100 dark:border-white/5">
            <ListItem icon={Layout} title="Prispôsobiť prehľad" />
            <ListItem icon={Globe} title="Zmeniť jazyk" />
            <ListItem icon={AppWindow} title="Ikona aplikácie" />
            <ListItem
              icon={Type}
              title="Prispôsobenie vzhľadu"
              onClick={() => navigate({ to: "/nastavenia" })}
            />
            <ListItem icon={Camera} title="Snímky obrazovky" isLast={true} />
          </div>
        </div>

        {/* Sekcia: O aplikácii */}
        <div className="mb-8">
          <h2 className="text-[14px] font-bold mb-3 px-1 text-gray-900 dark:text-gray-400">
            O aplikácii
          </h2>
          <div className="rounded-3xl px-5 py-1 shadow-sm border bg-white dark:bg-[#1c1c24] border-gray-100 dark:border-white/5">
            <ListItem icon={Info} title="Informácie" />
            <ListItem icon={ShieldCheck} title="Kontrola zabezpečenia" />
            <ListItem icon={UserX} title="Zrušiť elektronické služby" isLast={true} />
          </div>
        </div>

        {/* Sekcia: Ďalšie aplikácie */}
        <div className="mb-10">
          <h2 className="text-[14px] font-bold mb-3 px-1 text-gray-900 dark:text-gray-400">
            Ďalšie aplikácie
          </h2>
          <div className="rounded-3xl px-5 py-1 shadow-sm border bg-white dark:bg-[#1c1c24] border-gray-100 dark:border-white/5">
            <ListItem
              icon={CreditCard}
              title="Google Pay"
              subtitle="Nakupujte šikovnejšie"
              isLast={true}
              onClick={() => navigate({ to: "/karty" })}
            />
          </div>
        </div>

        {/* Pätička */}
        <div className="text-center pb-8 flex flex-col items-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            <span className="font-bold text-[15px] tracking-tight text-[#111827] dark:text-white">
              SLOVENSKÁ
            </span>
            <div className="w-5 h-5 bg-[#2a5ee8] text-white flex items-center justify-center rounded-sm">
              <span className="font-serif text-[14px] font-bold italic leading-none">š</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mb-0.5">© 2026 Slovenská sporiteľňa, a. s.</p>
          <p className="text-[11px] text-gray-500 mb-0.5">Verzia 26.30.13 (2630130)</p>
          <p className="text-[11px] text-gray-500 mb-0.5">GID: 6.1.0.7188</p>
          <p className="text-[11px] text-gray-500">GESDK: 23.42.0</p>
        </div>
      </main>
    </div>
  );

  // --- SHELL: dashboard a profil so spoločnou spodnou navigáciou ---
  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 bg-[#f4f6f9] dark:bg-[#0e0e12] text-gray-900 dark:text-white ${currentViewMode === "profile" ? "pb-28" : "pb-28"}`}>
      {currentViewMode === "profile" ? profileContent : (
        <>
          {/* Hlavička */}
          <div className="pt-6 pb-24 px-4 transition-colors duration-300 bg-[#2a5ee8] dark:bg-[#0e0e12] text-white rounded-b-3xl dark:rounded-none">
            <header className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="font-bold text-[17px] tracking-tight">SLOVENSKÁ</span>
                <div className="w-5 h-5 bg-white text-[#2a5ee8] flex items-center justify-center rounded-sm">
                  <span className="font-serif text-[14px] font-bold italic leading-none">š</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/platby"
                  className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                  title="Hľadať platby"
                >
                  <Search size={22} />
                </Link>

                <Link
                  to="/karty"
                  className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                  title="Karty"
                >
                  <CreditCard size={22} />
                </Link>

                <button
                  type="button"
                  onClick={() => setCurrentViewMode("profile")}
                  className="relative block cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  title="Profil"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm flex items-center justify-center font-bold text-sm bg-white/20 border-white text-white dark:bg-gray-700 dark:border-gray-600">
                    🐻
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 border-2 rounded-full bg-[#e63946] border-[#2a5ee8] dark:bg-[#ff5252] dark:border-[#0e0e12]" />
                </button>
              </div>
            </header>

            {/* Nadpis */}
            <h1 className="text-[34px] font-extrabold mt-6 tracking-tight">
              Prehľad
            </h1>
          </div>

          {/* Hlavný obsah */}
          <main className="px-4 -mt-14 relative z-10">
            {/* Sekcia: Výdavky a Príjmy za aktuálny mesiac */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Výdavky */}
              <Link
                to="/rozpocet"
                className="rounded-3xl p-4 flex flex-col justify-between h-[115px] transition-colors duration-300 block active:scale-[0.98] bg-white dark:bg-[#1c1c24] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5"
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Výdavky
                  </span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-950/60 text-[#e63946] dark:text-[#ff5252]">
                    <ArrowUpRight size={15} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold flex items-baseline text-[#e63946] dark:text-[#ff5252]">
                    {expWhole},{expCents} €
                  </div>
                  <div className="text-[11px] mt-1 text-gray-500">Tento mesiac</div>
                </div>
              </Link>

              {/* Príjmy */}
              <div className="rounded-3xl p-4 flex flex-col justify-between h-[115px] transition-colors duration-300 bg-white dark:bg-[#1c1c24] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Príjmy
                  </span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <ArrowDownLeft size={15} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold flex items-baseline text-emerald-600 dark:text-emerald-400">
                    {incWhole},{incCents} €
                  </div>
                  <div className="text-[11px] mt-1 text-gray-500">Tento mesiac</div>
                </div>
              </div>
            </div>

            {/* Sekcia: Vaše produkty */}
            <h2 className="text-[13px] mb-3 px-2 font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Vaše produkty
            </h2>

            {/* Karta: SPACE účet (klikateľná plocha otvára platby) */}
            <div className="rounded-[2rem] p-5 mb-4 relative overflow-hidden transition-all duration-300 bg-white dark:bg-[#1c1c24] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 hover:shadow-md">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-[#3a2072]" />

              <Link
                to="/platby"
                className="block cursor-pointer group active:opacity-90"
                title="Otvoriť detail účtu a transakcie"
              >
                <div className="flex justify-between items-start mb-2 mt-1">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#2a5ee8] dark:group-hover:text-[#4f95ff] transition-colors">
                      SPACE účet
                    </h3>
                    <p className="text-[12px] font-mono text-gray-400 mt-0.5">
                      {s.iban ? s.iban.replace(/\s+/g, "").match(/.{1,4}/g)?.join(" ") : "SK31 1200 3545 0984 0539"}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg bg-blue-50 dark:bg-gray-800 text-[#2a5ee8] dark:text-blue-400 shadow-sm dark:shadow-none group-hover:scale-105 transition-transform">
                    g
                  </div>
                </div>

                <div className="my-3">
                  <div
                    className={`text-[32px] font-bold flex items-baseline tracking-tight ${
                      isNegative
                        ? "text-[#e63946] dark:text-[#ff5252]"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {isNegative ? "-" : ""}
                    {wholeEuros},{cents} €
                  </div>
                  <div className="text-[13px] mt-2 text-gray-500 dark:text-gray-400">
                    {formatEur(total)} vlastné zdroje
                  </div>
                </div>
              </Link>

              <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-100 dark:border-white/5 relative z-10">
                <Link
                  to="/nova-platba"
                  className="px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors bg-[#eef3ff] dark:bg-[#242b3b] text-[#2a5ee8] dark:text-[#4f95ff] hover:bg-blue-100 dark:hover:bg-[#2a3447] active:scale-95"
                >
                  Nová platba
                </Link>
                <Link
                  to="/platby"
                  className="p-2 rounded-full transition-colors text-[#2a5ee8] dark:text-[#4f95ff] hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95"
                  title="Všetky pohyby"
                >
                  <MoreVertical size={22} />
                </Link>
              </div>
            </div>

            {/* Karta: Investície a sporenie */}
            <div className="rounded-[2rem] p-5 mb-6 relative overflow-hidden transition-colors duration-300 bg-white dark:bg-[#1c1c24] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-[#3a2072]" />
              <div className="flex justify-between items-start mb-2 mt-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Investície a sporenie</h3>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl bg-gray-100 dark:bg-gray-800 shadow-sm dark:shadow-none">
                  🏢
                </div>
              </div>
              <div className="mb-4">
                <div className="text-[30px] font-bold flex items-baseline tracking-tight text-gray-900 dark:text-white">
                  0,00 €
                </div>
              </div>
              <Link
                to="/sporenie"
                className="px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors inline-block bg-[#eef3ff] dark:bg-[#242b3b] text-[#2a5ee8] dark:text-[#4f95ff] hover:bg-blue-100 dark:hover:bg-[#2a3447]"
              >
                Spravovať sporenie
              </Link>
            </div>

            {/* Sekcia: Posledné pohyby */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">
                  Posledné pohyby
                </h2>
                <Link
                  to="/platby"
                  className="text-[13px] font-semibold hover:underline text-[#2a5ee8] dark:text-[#4f95ff]"
                >
                  Zobraziť všetky
                </Link>
              </div>

              <div className="rounded-2xl divide-y overflow-hidden bg-white dark:bg-[#1c1c24] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 divide-gray-100 dark:divide-white/5 text-gray-900 dark:text-white">
                {recentTransactions.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-400">
                    Žiadne nedávne transakcie
                  </p>
                ) : (
                  recentTransactions.map((tx) => {
                    const isIncome = tx.type === "in";
                    return (
                      <Link
                        key={tx.id}
                        to="/transakcia/$id"
                        params={{ id: tx.id }}
                        className="flex items-center justify-between p-3.5 transition hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-white/5 dark:active:bg-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isIncome
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="w-5 h-5" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold line-clamp-1 text-gray-900 dark:text-white">
                              {tx.counterparty || "Platba"}
                            </p>
                            <p className="text-[12px] text-gray-400">
                              {formatDate(tx.date)} • {tx.category}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[15px] font-bold ${
                            isIncome
                              ? "text-emerald-500"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatEur(tx.amount)}
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </main>
        </>
      )}

      {/* Spodná navigácia je spoločná pre Prehľad aj Profil */}
      <nav className="fixed bottom-0 left-0 w-full pb-safe pt-2 px-2 z-50 transition-colors duration-300 bg-white dark:bg-[#121216] border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-none">
        <div className="flex justify-around items-center pb-2">
          <button
            type="button"
            onClick={() => setCurrentViewMode("dashboard")}
            className={`flex flex-col items-center p-2 transition-colors ${currentViewMode === "dashboard" ? "text-[#2a5ee8] dark:text-[#4f95ff]" : "text-[#8e95a3] hover:text-gray-600 dark:hover:text-gray-300"}`}
          >
            <div className="relative">
              <div className="font-serif italic text-2xl font-bold leading-none mb-1">
                g
              </div>
              {currentViewMode === "dashboard" && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2a5ee8] dark:bg-[#4f95ff]" />}
            </div>
            <span className="text-[11px] font-bold mt-1">Prehľad</span>
          </button>

          <Link
            to="/rozpocet"
            className="flex flex-col items-center p-2 transition-colors text-[#8e95a3] hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Activity size={24} strokeWidth={1.5} />
            <span className="text-[11px] mt-1 font-medium">FIT</span>
          </Link>

          <Link
            to="/sporenie"
            className="flex flex-col items-center p-2 transition-colors text-[#8e95a3] hover:text-gray-600 dark:hover:text-gray-300"
          >
            <PieChart size={24} strokeWidth={1.5} />
            <span className="text-[11px] mt-1 font-medium">Invest</span>
          </Link>

          <Link
            to="/karty"
            className="flex flex-col items-center p-2 transition-colors text-[#8e95a3] hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Compass size={24} strokeWidth={1.5} />
            <span className="text-[11px] mt-1 font-medium">Karty</span>
          </Link>

          <button
            type="button"
            onClick={() => setCurrentViewMode("profile")}
            className={`flex flex-col items-center p-2 transition-colors ${currentViewMode === "profile" ? "text-[#2a5ee8] dark:text-[#4f95ff]" : "text-[#8e95a3] hover:text-gray-600 dark:hover:text-gray-300"}`}
            aria-current={currentViewMode === "profile" ? "page" : undefined}
          >
            <MessageSquare size={24} strokeWidth={1.5} />
            <span className="text-[11px] mt-1 font-medium">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
 