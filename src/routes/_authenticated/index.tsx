import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  CreditCard,
  MoreVertical,
  Compass,
  PieChart,
  MessageSquare,
  Activity,
  Sun,
  Moon,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  balance,
  formatDate,
  formatEur,
  monthTotals,
  MONTHS,
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

function formatInitials(name?: string | null, fallback = "G"): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (!first) return fallback;
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function GeorgePrehladModern() {
  const s = useBank();
  const total = balance(s);
  const { income, expense } = monthTotals(s);
  const currentMonthName = (MONTHS[new Date().getUTCMonth()] ?? "tento mesiac").toLowerCase();
  const userInitials = formatInitials(s.owner);

  // Prepínač tmavého / svetlého režimu
  const [isDark, setIsDark] = useState(false);

  // Rozdelenie sumy na celé eurá a centy pre George typografiu
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

  // Posledné transakcie z databázy
  const recentTransactions = [...(s.transactions ?? [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div
      className={
        "min-h-screen font-sans pb-28 transition-colors duration-300 " +
        (isDark ? "bg-[#0e0e12] text-white" : "bg-[#f4f6f9] text-gray-900")
      }
    >
      {/* Hlavička */}
      <div
        className={
          "pt-6 pb-24 px-4 transition-colors duration-300 " +
          (isDark
            ? "bg-[#0e0e12] text-white"
            : "bg-[#2a5ee8] text-white rounded-b-3xl")
        }
      >
        <header className="flex justify-between items-center">
          {/* Prepínač denného/nočného režimu */}
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex items-center gap-2"
            title="Prepnúť režim"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          {/* Ikony vpravo */}
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

            <Link to="/nastavenia" className="relative block" title="Profil">
              <div
                className={
                  "w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm flex items-center justify-center font-bold text-sm " +
                  (isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white/20 border-white text-white")
                }
              >
                {userInitials}
              </div>
              <span
                className={
                  "absolute -top-0.5 -right-0.5 w-3 h-3 border-2 rounded-full " +
                  (isDark
                    ? "bg-[#ff5252] border-[#0e0e12]"
                    : "bg-[#e63946] border-[#2a5ee8]")
                }
              />
            </Link>
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
            className={
              "rounded-3xl p-4 flex flex-col justify-between h-[115px] transition-colors duration-300 block active:scale-[0.98] " +
              (isDark
                ? "bg-[#1c1c24] border border-white/5"
                : "bg-white shadow-sm border border-gray-100")
            }
          >
            <div className="flex justify-between items-start">
              <span
                className={
                  "text-[13px] font-medium " +
                  (isDark ? "text-gray-300" : "text-gray-700")
                }
              >
                Výdavky za {currentMonthName}
              </span>
              <div
                className={
                  "p-1.5 rounded-full " +
                  (isDark ? "bg-[#242b3b]" : "bg-[#eef3ff]")
                }
              >
                <Activity
                  size={16}
                  className={isDark ? "text-[#4f95ff]" : "text-[#2a5ee8]"}
                />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold flex items-start">
                {expWhole},
                <sup className="text-sm mt-1 ml-0.5">{expCents}</sup>
                <span className="ml-1">€</span>
              </div>
              <div className="text-[11px] mt-1 text-gray-500">
                {s.budgets?.length
                  ? `${s.budgets.length} nastavené limity`
                  : "Neurčený rozpočet"}
              </div>
            </div>
          </Link>

          {/* Príjmy */}
          <div
            className={
              "rounded-3xl p-4 flex flex-col justify-between h-[115px] transition-colors duration-300 " +
              (isDark
                ? "bg-[#1c1c24] border border-white/5"
                : "bg-white shadow-sm border border-gray-100")
            }
          >
            <div className="flex justify-between items-start">
              <span
                className={
                  "text-[13px] font-medium " +
                  (isDark ? "text-gray-300" : "text-gray-700")
                }
              >
                Príjmy za {currentMonthName}
              </span>
              <div
                className={
                  "p-1.5 rounded-full " +
                  (isDark ? "bg-emerald-950/60" : "bg-emerald-50")
                }
              >
                <TrendingUp
                  size={16}
                  className={isDark ? "text-emerald-400" : "text-emerald-600"}
                />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold flex items-start text-emerald-600 dark:text-emerald-400">
                {incWhole},
                <sup className="text-sm mt-1 ml-0.5">{incCents}</sup>
                <span className="ml-1">€</span>
              </div>
              <div className="text-[11px] mt-1 text-gray-500">Tento mesiac</div>
            </div>
          </div>
        </div>

        {/* Sekcia: Vaše produkty */}
        <h2
          className={
            "text-[13px] mb-3 px-2 font-medium uppercase tracking-wider " +
            (isDark ? "text-gray-400" : "text-gray-500")
          }
        >
          Vaše produkty
        </h2>

        {/* Karta: SPACE účet */}
        <div
          className={
            "rounded-[2rem] p-5 mb-4 relative overflow-hidden transition-colors duration-300 " +
            (isDark
              ? "bg-[#1c1c24] border border-white/5"
              : "bg-white shadow-sm border border-gray-100")
          }
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#3a2072]" />

          <div className="flex justify-between items-start mb-2 mt-1">
            <div>
              <h3 className="text-xl font-bold">SPACE účet</h3>
              <p className="text-[12px] font-mono text-gray-400 mt-0.5">
                {s.iban ? s.iban.replace(/\s+/g, "").match(/.{1,4}/g)?.join(" ") : "SK31 1200 3545 0984 0539"}
              </p>
            </div>
            <div
              className={
                "w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg " +
                (isDark ? "bg-gray-800 text-blue-400" : "bg-blue-50 text-[#2a5ee8] shadow-sm")
              }
            >
              g
            </div>
          </div>

          <div className="my-3">
            <div
              className={
                "text-[32px] font-bold flex items-start tracking-tight leading-none " +
                (isNegative
                  ? isDark ? "text-[#ff5252]" : "text-[#e63946]"
                  : isDark ? "text-white" : "text-gray-900")
              }
            >
              {isNegative ? "-" : ""}
              {wholeEuros},
              <sup className="text-[18px] mt-1 ml-0.5">{cents}</sup>
              <span className="ml-1 text-2xl mt-1.5">€</span>
            </div>
            <div
              className={
                "text-[13px] mt-2 " + (isDark ? "text-gray-400" : "text-gray-500")
              }
            >
              {formatEur(total)} vlastné zdroje
            </div>
          </div>

          <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-100 dark:border-white/5">
            <Link
              to="/nova-platba"
              className={
                "px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors " +
                (isDark
                  ? "bg-[#242b3b] text-[#4f95ff] hover:bg-[#2a3447]"
                  : "bg-[#eef3ff] text-[#2a5ee8] hover:bg-blue-100")
              }
            >
              Nová platba
            </Link>
            <Link
              to="/platby"
              className={
                "p-2 rounded-full transition-colors " +
                (isDark
                  ? "text-[#4f95ff] hover:bg-white/5"
                  : "text-[#2a5ee8] hover:bg-gray-50")
              }
              title="Všetky pohyby"
            >
              <MoreVertical size={22} />
            </Link>
          </div>
        </div>

        {/* Karta: Investície a sporenie */}
        <div
          className={
            "rounded-[2rem] p-5 mb-6 relative overflow-hidden transition-colors duration-300 " +
            (isDark
              ? "bg-[#1c1c24] border border-white/5"
              : "bg-white shadow-sm border border-gray-100")
          }
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#3a2072]" />
          <div className="flex justify-between items-start mb-2 mt-1">
            <h3 className="text-xl font-bold">Investície a sporenie</h3>
            <div
              className={
                "w-11 h-11 rounded-full flex items-center justify-center text-xl " +
                (isDark ? "bg-gray-800" : "bg-gray-100 shadow-sm")
              }
            >
              🏢
            </div>
          </div>
          <div className="mb-4">
            <div className="text-[30px] font-bold flex items-start tracking-tight leading-none">
              0,<sup className="text-[17px] mt-1 ml-0.5">00</sup>
              <span className="ml-1 text-2xl mt-1.5">€</span>
            </div>
          </div>
          <Link
            to="/sporenie"
            className={
              "px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors inline-block " +
              (isDark
                ? "bg-[#242b3b] text-[#4f95ff] hover:bg-[#2a3447]"
                : "bg-[#eef3ff] text-[#2a5ee8] hover:bg-blue-100")
            }
          >
            Spravovať sporenie
          </Link>
        </div>

        {/* Sekcia: Posledné pohyby */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2
              className={
                "text-[16px] font-bold " +
                (isDark ? "text-white" : "text-gray-900")
              }
            >
              Posledné pohyby
            </h2>
            <Link
              to="/platby"
              className={
                "text-[13px] font-semibold hover:underline " +
                (isDark ? "text-[#4f95ff]" : "text-[#2a5ee8]")
              }
            >
              Zobraziť všetky
            </Link>
          </div>

          <div
            className={
              "rounded-2xl divide-y overflow-hidden " +
              (isDark
                ? "bg-[#1c1c24] border border-white/5 divide-white/5 text-white"
                : "bg-white shadow-sm border border-gray-100 divide-gray-100")
            }
          >
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
                    className={
                      "flex items-center justify-between p-3.5 transition " +
                      (isDark
                        ? "hover:bg-white/5 active:bg-white/10"
                        : "hover:bg-gray-50 active:bg-gray-100")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          "w-10 h-10 rounded-full flex items-center justify-center " +
                          (isIncome
                            ? isDark
                              ? "bg-emerald-950/60 text-emerald-400"
                              : "bg-emerald-50 text-emerald-600"
                            : isDark
                            ? "bg-gray-800 text-gray-300"
                            : "bg-gray-100 text-gray-600")
                        }
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold line-clamp-1">
                          {tx.counterparty || "Platba"}
                        </p>
                        <p className="text-[12px] text-gray-400">
                          {formatDate(tx.date)} • {tx.category}
                        </p>
                      </div>
                    </div>

                    <span
                      className={
                        "text-[15px] font-bold " +
                        (isIncome
                          ? "text-emerald-500"
                          : isDark
                          ? "text-white"
                          : "text-gray-900")
                      }
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

      {/* Spodná navigácia */}
      <nav
        className={
          "fixed bottom-0 left-0 w-full pb-safe pt-2 px-2 z-50 transition-colors duration-300 " +
          (isDark
            ? "bg-[#121216] border-t border-gray-800"
            : "bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]")
        }
      >
        <div className="flex justify-around items-center pb-2">
          <Link
            to="/"
            className={
              "flex flex-col items-center p-2 " +
              (isDark ? "text-[#4f95ff]" : "text-[#2a5ee8]")
            }
          >
            <div className="relative">
              <div className="font-serif italic text-2xl font-bold leading-none mb-1">
                g
              </div>
              <span
                className={
                  "absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full " +
                  (isDark ? "bg-[#4f95ff]" : "bg-[#2a5ee8]")
                }
              />
            </div>
            <span className="text-[11px] font-bold mt-1">Prehľad</span>
          </Link>

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

          <Link
            to="/nastavenia"
            className="flex flex-col items-center p-2 transition-colors text-[#8e95a3] hover:text-gray-600 dark:hover:text-gray-300"
          >
            <MessageSquare size={24} strokeWidth={1.5} />
            <span className="text-[11px] mt-1 font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
