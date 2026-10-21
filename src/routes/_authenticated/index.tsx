import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, BarChart3 } from "lucide-react";
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
  ChevronRight,
  Wifi
} from "lucide-react";
import { SlspLogo } from "@/components/bank/SlspLogo";
import { supabase } from "@/integrations/supabase/client";
import {
  balance,
  formatDate,
  formatEur,
  monthTotals,
  MONTHS,
  resetStore,
  useBank,
  type Txn
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

function splitAmount(val: number) {
  const abs = Math.abs(val);
  const [w, d] = abs.toFixed(2).split(".");
  return {
    whole: Number(w).toLocaleString("sk-SK"),
    cents: d,
    isNegative: val < 0,
  };
}

function formatIbanDisplay(rawIban?: string | null): string {
  if (!rawIban) return "SK89 0900 0000 0052 0892 1207";
  const cleaned = rawIban.replace(/\s+/g, "");
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : rawIban;
}

function getInitials(name?: string | null): string {
  if (!name) return "??";
  const cleaned = name.replace(/[·•\-–—_/\\()[\],.:;!?@#$%^&*+='"`]/g, " ").trim();
  const words = cleaned.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return "??";
  if (words.length === 1) {
    const single = words[0]!;
    return single.length >= 2 ? single.slice(0, 2).toUpperCase() : single.toUpperCase();
  }
  return ((words[0]![0] ?? "") + (words[words.length - 1]![0] ?? "")).toUpperCase();
}

function getAvatarColor(name?: string | null): string {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200",
    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200",
  ];
  const str = name || "unknown";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length]!;
}

// Komponent loga obchodníka
function MerchantLogo({ counterparty, category }: { counterparty: string; category?: string }) {
  const name = (counterparty || "").toLowerCase();

  if (
    name.includes("sporiteľňa") || 
    name.includes("sporitelna") || 
    name.includes("slsp") || 
    name.includes("poplatok") || 
    category === "Poplatky"
  ) {
    return <SlspLogo />;
  }

  if (name.includes("kaufland")) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#d61e2b] flex items-center justify-center shrink-0 shadow-sm p-1">
        <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-[#d61e2b] text-[16px]">
          K
        </div>
      </div>
    );
  }

  if (name.includes("tesco")) {
    return (
      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center shrink-0 shadow-sm px-1">
        <span className="text-[#00539f] font-black text-[9px] tracking-tight leading-none">TESCO</span>
        <div className="flex gap-0.5 mt-0.5">
          <span className="w-1.5 h-[2px] bg-[#ee1c25] rounded-full"></span>
          <span className="w-1.5 h-[2px] bg-[#00539f] rounded-full"></span>
          <span className="w-1.5 h-[2px] bg-[#ee1c25] rounded-full"></span>
        </div>
      </div>
    );
  }

  if (name.includes("mcdonald") || name.includes("mc donald")) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#da291c] flex items-center justify-center shrink-0 shadow-sm">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#ffc72c]">
          <path d="M4.5 19.5c0-4.8 1.8-9 4-9 1.6 0 2.9 2.2 3.5 5.5.6-3.3 1.9-5.5 3.5-5.5 2.2 0 4 4.2 4 9h2c0-6-2.5-11-5.5-11-1.9 0-3.3 1.8-4 4.5-.7-2.7-2.1-4.5-4-4.5C5 8.5 2.5 13.5 2.5 19.5h2z" />
        </svg>
      </div>
    );
  }

  if (name.includes("shell")) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#fbce07] flex items-center justify-center shrink-0 shadow-sm">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#dd1d21]">
          <path d="M12 3.5c-4 0-6.5 3.5-6.5 7.5 0 2.8 1.2 5 2.5 6.5l.5.5h7l.5-.5c1.3-1.5 2.5-3.7 2.5-6.5 0-4-2.5-7.5-6.5-7.5zm0 2.2c1.8 0 3.2 1.5 3.8 3.3-.8-.3-1.8-.5-3.8-.5s-3 .2-3.8.5c.6-1.8 2-3.3 3.8-3.3zm-4.7 4.8c.8-.3 2-.6 4.7-.6s3.9.3 4.7.6c.1.6.3 1.3.3 2-.9-.2-2.3-.4-5-.4s-4.1.2-5 .4c0-.7.2-1.4.3-2zm.4 4c1-.2 2.4-.4 4.3-.4s3.3.2 4.3.4c-.4 1.5-1.4 3-2.3 4H10c-.9-1-1.9-2.5-2.3-4z"/>
        </svg>
      </div>
    );
  }

  if (name.includes("netflix")) {
    return (
      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 shadow-sm border border-white/10">
        <span className="text-[#e50914] font-black text-[18px] font-sans leading-none">N</span>
      </div>
    );
  }

  if (name.includes("spotify")) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#1ed760] flex items-center justify-center shrink-0 shadow-sm">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.75.75 0 0 1-1.033.247c-2.827-1.728-6.386-2.118-10.578-1.16a.75.75 0 1 1-.334-1.462c4.588-1.048 8.528-.606 11.7 1.342a.75.75 0 0 1 .245 1.033zm1.226-2.723a.937.937 0 0 1-1.291.309c-3.236-1.99-8.169-2.565-11.997-1.402a.938.938 0 0 1-.548-1.794c4.375-1.328 9.815-.688 13.527 1.596a.938.938 0 0 1 .309 1.291zm.106-2.835C14.04 8.583 7.64 8.37 3.935 9.495a1.125 1.125 0 1 1-.652-2.154c4.254-1.291 11.318-1.047 15.776 1.597a1.125 1.125 0 1 1-1.141 1.928z"/>
        </svg>
      </div>
    );
  }

  if (name.includes("billa")) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#ffcc00] flex items-center justify-center shrink-0 shadow-sm border border-amber-300">
        <span className="text-[#d81e05] font-black text-[11px] tracking-tight">BILLA</span>
      </div>
    );
  }

  if (name.includes("lidl")) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#0050aa] flex items-center justify-center shrink-0 shadow-sm p-0.5">
        <div className="w-full h-full bg-[#fff000] rounded-full flex items-center justify-center border border-[#d00010]">
          <span className="text-[#0050aa] font-black text-[9px] tracking-tight">LiDL</span>
        </div>
      </div>
    );
  }

  if (name.includes("slovnaft")) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#ffcc00] flex items-center justify-center shrink-0 shadow-sm border border-amber-300">
        <span className="text-black font-black text-[8px] tracking-tighter uppercase">SLOVNAFT</span>
      </div>
    );
  }

  // Fallback: farebný kruh s iniciálami
  const initials = getInitials(counterparty);
  const colorClass = getAvatarColor(counterparty);

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-[14px] shadow-sm select-none tracking-tight ${colorClass}`}>
      {initials}
    </div>
  );
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
        <Icon size={24} className="text-[#196ee6] dark:text-[#4f95ff]" strokeWidth={1.5} />
        <div>
          <div className="text-[16px] font-bold text-[#111827] dark:text-white">{title}</div>
          {subtitle && (
            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
      {badge && (
        <span className="bg-[#196ee6] dark:bg-[#4f95ff] text-white text-[12px] font-bold px-2.5 py-1 rounded-md">
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
  const userName = s.owner || "Tomáš Lizák";

  const totalParts = splitAmount(total);
  const savings = (s.goals ?? []).reduce((sum, g) => sum + (g.saved || 0), 0);
  const savParts = splitAmount(savings);
  const [hidden, setHidden] = useState(false);
  useEffect(() => { setHidden(localStorage.getItem("george-hide-balance") === "1"); }, []);
  const toggleHidden = () => setHidden((h) => { localStorage.setItem("george-hide-balance", h ? "0" : "1"); return !h; });
  const expParts = splitAmount(expense);
  const incParts = splitAmount(income);

  const cardLastFour = "3302";

  const recentTransactions = [...(s.transactions ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  async function handleLogout() {
    await supabase.auth.signOut();
    resetStore();
    navigate({ to: "/auth" });
  }

  // --- OBSAH PROFILU ---
  const profileContent = (
    <div className="min-h-screen font-sans pb-16 transition-colors duration-300 bg-[#f4f6f9] dark:bg-[#0e0e12] text-gray-900 dark:text-white">
      <main className="px-4 max-w-md mx-auto pt-6">
        <div className="flex justify-between items-center pb-4 mb-2">
          <button
            type="button"
            onClick={() => setCurrentViewMode("dashboard")}
            className="p-2 -ml-2 rounded-full transition-colors text-[#196ee6] dark:text-[#4f95ff] hover:bg-blue-50 dark:hover:bg-white/10"
            aria-label="Späť na prehľad"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="font-bold text-[15px] hover:underline flex items-center gap-1.5 text-[#196ee6] dark:text-[#4f95ff]"
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
              {formatIbanDisplay(s.iban)}
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
          <div className="flex items-center justify-center mb-4">
            <span className="font-bold text-[16px] tracking-tight text-[#111827] dark:text-white">
              Slovenská sporiteľňa
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mb-0.5">© 2026 Slovenská sporiteľňa, a. s.</p>
          <p className="text-[11px] text-gray-500 mb-0.5">Verzia 26.30.13 (2630130)</p>
          <p className="text-[11px] text-gray-500 mb-0.5">GID: 6.1.0.7188</p>
          <p className="text-[11px] text-gray-500">GESDK: 23.42.0</p>
        </div>
      </main>
    </div>
  );

  // --- SHELL: DASHBOARD ---
  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-[#f4f6f9] dark:bg-[#0e0e12] text-gray-900 dark:text-white pb-28">
      {currentViewMode === "profile" ? profileContent : (
        <>
          {/* Modrá hlavička */}
          <div className="pt-6 pb-24 px-4 transition-colors duration-300 bg-[#196ee6] dark:bg-[#0e0e12] text-white rounded-b-3xl dark:rounded-none">
            <header className="flex justify-end items-center">


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
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 border-2 rounded-full bg-[#e63946] border-[#196ee6] dark:bg-[#ff5252] dark:border-[#0e0e12]" />
                </button>
              </div>
            </header>

            <h1 className="text-[34px] font-extrabold mt-6 tracking-tight">
              Prehľad
            </h1>
          </div>

          {/* Hlavný obsah */}
          <main className="px-4 -mt-14 relative z-10">
            {/* Sekcia: Výdavky a Príjmy za aktuálny mesiac */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Link
                to="/rozpocet"
                className="rounded-3xl p-4 block active:scale-[0.98] bg-white dark:bg-[#1c1c24] shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[15px] text-[#1b2a4a] dark:text-gray-200 leading-tight">
                    Výdavky za {MONTHS[new Date().getMonth()]?.toLowerCase()}
                  </span>
                  <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-[#eef3ff] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff]">
                    <BarChart3 size={16} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="text-[20px] font-bold flex items-baseline tracking-tight text-[#1b2a4a] dark:text-white mt-1">
                  <span>{expParts.whole}</span>
                  <span>,</span>
                  <sup className="text-[11px] font-bold top-[-0.6em] ml-0.5">{expParts.cents}</sup>
                  <span className="ml-1">€</span>
                </div>
                <div className="text-[13px] text-gray-500">Neurčený rozpočet</div>
              </Link>

              <div className="rounded-3xl p-4 bg-white dark:bg-[#1c1c24] shadow-sm">
                <span className="text-[15px] text-[#1b2a4a] dark:text-gray-200 leading-tight block min-h-9">
                  Príjmy za {MONTHS[new Date().getMonth()]?.toLowerCase()}
                </span>
                <div className="text-[20px] font-bold flex items-baseline tracking-tight text-[#1b2a4a] dark:text-white mt-1">
                  <span>{incParts.whole}</span>
                  <span>,</span>
                  <sup className="text-[11px] font-bold top-[-0.6em] ml-0.5">{incParts.cents}</sup>
                  <span className="ml-1">€</span>
                </div>
              </div>
            </div>

            {/* Nadpis: Vaše produkty */}
            <h2 className="text-[15px] mb-2.5 px-1 text-gray-500 dark:text-gray-400">
              Vaše produkty
            </h2>

            {/* KARTA: ÚČET */}
            <div className="rounded-3xl p-5 mb-5 relative overflow-hidden bg-white dark:bg-[#1c1c24] shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2d2a8f]" />

              <Link to="/platby" className="block cursor-pointer active:opacity-90" title="Otvoriť detail účtu">
                <div className="flex justify-between items-start mt-1">
                  <div>
                    <h3 className="text-[19px] font-semibold text-[#1b2a4a] dark:text-white">Účet</h3>
                    <div
                      className={`mt-1 text-[32px] font-bold flex items-baseline tracking-tight ${
                        totalParts.isNegative ? "text-[#c8302f] dark:text-[#ff5252]" : "text-[#1b2a4a] dark:text-white"
                      }`}
                    >
                      {!hidden && totalParts.isNegative && <span>-</span>}
                      <span>{hidden ? "••••" : totalParts.whole}</span>
                      <span>,</span>
                      <sup className="text-[15px] font-bold top-[-0.7em] ml-0.5 leading-none select-none">
                        {hidden ? "••" : totalParts.cents}
                      </sup>
                      <span className="ml-1 select-none">€</span>
                      <button
                        type="button"
                        aria-label={hidden ? "Zobraziť zostatok" : "Skryť zostatok"}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleHidden(); }}
                        className="ml-3 self-center rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="mt-1 text-[15px] text-gray-500 dark:text-gray-400">
                      {hidden ? "•••• € vlastné zdroje" : `${formatEur(total)} vlastné zdroje`}
                    </p>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=160&auto=format&fit=crop&q=80"
                    alt=""
                    className="w-14 h-14 rounded-full object-cover shrink-0"
                  />
                </div>
              </Link>

              <div className="flex justify-between items-center mt-4">
                <Link
                  to="/nova-platba"
                  className="px-6 py-2.5 rounded-full font-semibold text-[15px] bg-[#eef3ff] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff] active:scale-95"
                >
                  Nová platba
                </Link>
                <Link to="/platby" className="p-2 rounded-full text-[#196ee6] dark:text-[#4f95ff]" title="Detail účtu">
                  <MoreVertical size={22} />
                </Link>
              </div>
            </div>

            {/* SEKCIA: KARTY A ÚVERY (Vizuál plastovej karty s odleskom a logom Visa) */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5 px-2">
                <h2 className="text-[13px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Karty a úvery
                </h2>
                <Link
                  to="/karty"
                  className="text-[12px] font-semibold text-[#196ee6] dark:text-[#4f95ff] hover:underline"
                >
                  Správa kariet
                </Link>
              </div>

              {/* Plastová karta s jemným odleskom */}
              <Link
                to="/karty"
                className="group relative block w-full rounded-3xl p-5 text-white shadow-md transition-all duration-300 hover:shadow-xl active:scale-[0.99] overflow-hidden bg-gradient-to-br from-[#121927] via-[#1a253c] to-[#0e1628] border border-white/10"
              >
                {/* Realistický jemný svetelný odlesk cez celú kartu */}
                <div className="pointer-events-none absolute -inset-full bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 transform transition-transform duration-1000 group-hover:translate-x-full" />

                {/* Horný riadok: Typ karty + Bezkontaktný symbol */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold tracking-tight text-white/95">
                      Virtuálna karta
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/80">
                      Debetná
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Wifi className="w-5 h-5 rotate-90 stroke-[2.2]" />
                  </div>
                </div>

                {/* EMV Zlatý čip s mikro-linkami */}
                <div className="relative z-10 my-2">
                  <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#e0b04c] via-[#f7d77c] to-[#b88928] p-0.5 shadow-sm border border-amber-300/40">
                    <div className="w-full h-full rounded-[3px] border border-black/20 flex flex-col justify-between p-0.5 opacity-90">
                      <div className="h-[1px] w-full bg-black/30 mt-1"></div>
                      <div className="flex justify-between">
                        <div className="w-2.5 h-[1px] bg-black/30"></div>
                        <div className="w-2.5 h-[1px] bg-black/30"></div>
                      </div>
                      <div className="h-[1px] w-full bg-black/30 mb-1"></div>
                    </div>
                  </div>
                </div>

                {/* Číslo karty (embosovaný štýl) */}
                <div className="relative z-10 mt-3 mb-4">
                  <div className="font-mono text-[17px] tracking-[0.22em] text-white/95 drop-shadow-sm font-medium">
                    •••• •••• •••• {cardLastFour}
                  </div>
                </div>

                {/* Spodný riadok: Držiteľ + Platnosť + Logo VISA */}
                <div className="flex items-end justify-between relative z-10 pt-1">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-white/50">Držiteľ karty</p>
                    <p className="text-[12px] font-semibold tracking-wide text-white/90 uppercase mt-0.5">
                      {userName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-white/50">Platnosť</p>
                    <p className="text-[11px] font-mono text-white/80 mt-0.5">10/31</p>
                  </div>

                  {/* Logo Mastercard */}
                  <div className="pl-2">
                    <svg className="h-7 w-auto" viewBox="0 0 48 30" aria-label="Mastercard">
                      <circle cx="17" cy="15" r="13" fill="#eb001b" />
                      <circle cx="31" cy="15" r="13" fill="#f79e1b" />
                      <path d="M24 4.2a13 13 0 0 1 0 21.6a13 13 0 0 1 0-21.6z" fill="#ff5f00" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Karta: Investície a sporenie */}
            <div className="rounded-3xl p-5 mb-5 relative overflow-hidden bg-white dark:bg-[#1c1c24] shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2d2a8f]" />
              <div className="flex justify-between items-start mt-1">
                <div>
                  <h3 className="text-[19px] font-semibold text-[#1b2a4a] dark:text-white">Investície</h3>
                  <div className="text-[32px] font-bold flex items-baseline tracking-tight text-[#1b2a4a] dark:text-white mt-1">
                    <span>{hidden ? "••••" : savParts.whole}</span>
                    <span>,</span>
                    <sup className="text-[15px] font-bold top-[-0.7em] ml-0.5 leading-none">{hidden ? "••" : savParts.cents}</sup>
                    <span className="ml-1">€</span>
                  </div>
                </div>
                <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=160&auto=format&fit=crop&q=80" alt="" className="w-14 h-14 rounded-full object-cover" />
              </div>
              <Link to="/sporenie" className="mt-4 px-5 py-2.5 rounded-full font-semibold text-[15px] inline-block bg-[#eef3ff] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff]">
                Vyhľadať a kúpiť
              </Link>
            </div>

            {/* Karta: Moneyback */}
            <div className="rounded-3xl p-5 mb-5 relative overflow-hidden bg-white dark:bg-[#1c1c24] shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#a94fb5]" />
              <div className="flex justify-between items-start mt-1">
                <div className="pr-3">
                  <h3 className="text-[19px] font-semibold text-[#1b2a4a] dark:text-white">Moneyback</h3>
                  <span className="mt-1 inline-block rounded-full bg-[#eef3ff] dark:bg-[#242b3b] px-2.5 py-0.5 text-[12px] font-semibold text-[#196ee6] dark:text-[#4f95ff]">7 nových ponúk</span>
                  <p className="mt-2 text-[15px] text-gray-500 dark:text-gray-400">Objavte ponuky od najlepších značiek a získajte späť časť svojich peňazí.</p>
                </div>
                <div className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center bg-[#fbeefc] dark:bg-[#3a2340] text-[#a94fb5]">
                  <ShoppingBag size={24} />
                </div>
              </div>
              <button type="button" className="mt-4 px-5 py-2.5 rounded-full font-semibold text-[15px] bg-[#eef3ff] dark:bg-[#242b3b] text-[#196ee6] dark:text-[#4f95ff]">
                Prezrite si 7 nových ponúk
              </button>
            </div>

            {/* Sekcia: Posledné pohyby */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">
                  Posledné pohyby
                </h2>
                <Link
                  to="/platby"
                  className="text-[13px] font-semibold hover:underline text-[#196ee6] dark:text-[#4f95ff]"
                >
                  Zobraziť všetky
                </Link>
              </div>

              <div className="rounded-3xl divide-y overflow-hidden bg-white dark:bg-[#1c1c24] shadow-sm border border-gray-100 dark:border-white/5 divide-gray-100 dark:divide-white/5 text-gray-900 dark:text-white">
                {recentTransactions.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-400">
                    Žiadne nedávne transakcie
                  </p>
                ) : (
                  recentTransactions.map((tx) => {
                    const isIncome = tx.type === "in";
                    const txParts = splitAmount(tx.amount);
                    return (
                      <Link
                        key={tx.id}
                        to="/transakcia/$id"
                        params={{ id: tx.id }}
                        className="flex items-center justify-between p-3.5 transition hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-white/5 dark:active:bg-white/10"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <MerchantLogo counterparty={tx.counterparty} category={tx.category} />
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold truncate text-gray-900 dark:text-white">
                              {tx.counterparty || "Platba"}
                            </p>
                            <p className="text-[12px] text-gray-500 dark:text-gray-400">
                              {formatDate(tx.date)} • {tx.category}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[15px] font-bold flex items-baseline shrink-0 tracking-tight ${
                            isIncome
                              ? "text-[#16a34a] dark:text-[#30d158]"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          <span>{isIncome ? "+" : "-"}</span>
                          <span>{txParts.whole}</span>
                          <span>,</span>
                          <sup className="text-[10px] font-semibold top-[-0.4em] ml-0.5 leading-none select-none">
                            {txParts.cents}
                          </sup>
                          <span className="ml-1 text-[13px] font-normal select-none">€</span>
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

    </div>
  );
}
