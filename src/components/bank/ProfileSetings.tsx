import React, { useState } from 'react';
import {
ArrowLeft, Plane, Heart, ShoppingBag, Medal, Calculator,
TrendingUp, User, Smartphone, Contact, FileText, Bell,
Users, Layout, Globe, AppWindow, Type, Camera, Info,
ShieldCheck, UserX, CreditCard, Sun, Moon
} from 'lucide-react';
​interface ProfileSettingsProps {
onBack: () => void;
}
​export default function ProfileSettings({ onBack }: ProfileSettingsProps) {
const [isDark, setIsDark] = useState(false);
​const ListItem = ({ icon: Icon, title, subtitle, badge, isLast = false }: { icon: any, title: string, subtitle?: string, badge?: string, isLast?: boolean }) => (
<button className={
"w-full flex items-center justify-between py-4 " +
(!isLast ? (isDark ? "border-b border-white/5" : "border-b border-gray-100") : "") +
(isDark ? " hover:bg-white/5" : " hover:bg-gray-50/50") +
" transition-colors text-left px-1"
}>
<div className="flex items-center gap-4">
<Icon size={24} className={isDark ? "text-[#4f95ff]" : "text-[#2a5ee8]"} strokeWidth={1.5} />
<div>
<div className={"text-[16px] font-bold " + (isDark ? "text-white" : "text-[#111827]")}>{title}</div>
{subtitle && <div className="text-[13px] text-gray-500 mt-0.5">{subtitle}</div>}
</div>
</div>
{badge && (
<span className="bg-[#2a5ee8] text-white text-[12px] font-bold px-2.5 py-1 rounded-md">
{badge}
</span>
)}
</button>
);
​return (
<div className={"min-h-screen font-sans pb-12 transition-colors duration-300 " + (isDark ? "bg-[#0e0e12] text-white" : "bg-[#f4f6f9] text-gray-900")}>
​{/* Hlavička */}
<main className="px-4 max-w-md mx-auto pt-6">
<div className="flex justify-between items-center pb-4 mb-2">
<button
onClick={onBack}
className={"p-2 -ml-2 rounded-full transition-colors " + (isDark ? "text-[#4f95ff] hover:bg-white/10" : "text-[#2a5ee8] hover:bg-blue-50")}
>
<ArrowLeft size={24} />
</button>
​<div className="flex items-center gap-2">
<button
onClick={() => setIsDark(!isDark)}
className={"p-2 rounded-full transition-colors " + (isDark ? "text-yellow-400 hover:bg-white/10" : "text-[#2a5ee8] hover:bg-blue-50")}
>
{isDark ? <Sun size={20} /> : <Moon size={20} />}
</button>
​<button className={"font-bold text-[15px] hover:underline " + (isDark ? "text-[#4f95ff]" : "text-[#2a5ee8]")}>
Odhlásiť
</button>
</div>
</div>
​<h1 className={"text-[28px] font-bold mb-6 " + (isDark ? "text-white" : "text-[#111827]")}>Profil</h1>
​{/* Karta Používateľa */}
<div className={"rounded-3xl p-5 mb-8 shadow-sm border flex justify-between items-center " + (isDark ? "bg-[#1c1c24] border-white/5" : "bg-white border-gray-100")}>
<span className={"text-[18px] font-bold " + (isDark ? "text-white" : "text-gray-900")}>Tomáš Lizák</span>
<div className="w-14 h-14 bg-black rounded-full overflow-hidden flex items-center justify-center border border-gray-700">
<span className="text-3xl">🐻</span>
</div>
</div>
​{/* Sekcia: Doplnky */}
<div className="mb-8">
<h2 className={"text-[14px] font-bold mb-3 px-1 " + (isDark ? "text-gray-400" : "text-gray-900")}>Doplnky</h2>
<div className={"rounded-3xl px-5 py-1 shadow-sm border " + (isDark ? "bg-[#1c1c24] border-white/5" : "bg-white border-gray-100")}>
<ListItem icon={Plane} title="Travel Hub" />
<ListItem icon={Heart} title="Odporučte Georgea" />
<ListItem icon={ShoppingBag} title="Moneyback" subtitle="0,00 € na vyplatenie" badge="5 nových" />
<ListItem icon={Medal} title="Moja odmena" />
<ListItem icon={Calculator} title="Menová kalkulačka" />
<ListItem icon={TrendingUp} title="Ponuka investícií" isLast={true} />
</div>
</div>
​{/* Sekcia: Profil */}
<div className="mb-8">
<h2 className={"text-[14px] font-bold mb-3 px-1 " + (isDark ? "text-gray-400" : "text-gray-900")}>Profil</h2>
<div className={"rounded-3xl px-5 py-1 shadow-sm border " + (isDark ? "bg-[#1c1c24] border-white/5" : "bg-white border-gray-100")}>
<ListItem icon={User} title="Prihlásenie a podpisovanie" />
<ListItem icon={Smartphone} title="Správa zariadení" />
<ListItem icon={Contact} title="Vaše kontaktné údaje" />
<ListItem icon={FileText} title="Doklady totožnosti" />
<ListItem icon={Bell} title="Notifikácie" />
<ListItem icon={Users} title="Vaše klientske údaje" isLast={true} />
</div>
</div>
​{/* Sekcia: Aplikácia */}
<div className="mb-8">
<h2 className={"text-[14px] font-bold mb-3 px-1 " + (isDark ? "text-gray-400" : "text-gray-900")}>Aplikácia</h2>
<div className={"rounded-3xl px-5 py-1 shadow-sm border " + (isDark ? "bg-[#1c1c24] border-white/5" : "bg-white border-gray-100")}>
<ListItem icon={Layout} title="Prispôsobiť prehľad" />
<ListItem icon={Globe} title="Zmeniť jazyk" />
<ListItem icon={AppWindow} title="Ikona aplikácie" />
<ListItem icon={Type} title="Prispôsobenie vzhľadu" />
<ListItem icon={Camera} title="Snímky obrazovky" isLast={true} />
</div>
</div>
​{/* Sekcia: O aplikácii */}
<div className="mb-8">
<h2 className={"text-[14px] font-bold mb-3 px-1 " + (isDark ? "text-gray-400" : "text-gray-900")}>O aplikácii</h2>
<div className={"rounded-3xl px-5 py-1 shadow-sm border " + (isDark ? "bg-[#1c1c24] border-white/5" : "bg-white border-gray-100")}>
<ListItem icon={Info} title="Informácie" />
<ListItem icon={ShieldCheck} title="Kontrola zabezpečenia" />
<ListItem icon={UserX} title="Zrušiť elektronické služby" isLast={true} />
</div>
</div>
​{/* Sekcia: Ďalšie aplikácie */}
<div className="mb-10">
<h2 className={"text-[14px] font-bold mb-3 px-1 " + (isDark ? "text-gray-400" : "text-gray-900")}>Ďalšie aplikácie</h2>
<div className={"rounded-3xl px-5 py-1 shadow-sm border " + (isDark ? "bg-[#1c1c24] border-white/5" : "bg-white border-gray-100")}>
<ListItem icon={CreditCard} title="Google Pay" subtitle="Nakupujte šikovnejšie" isLast={true} />
</div>
</div>
​{/* Pätička (Footer) */}
<div className="text-center pb-8 flex flex-col items-center">
<div className="flex items-center justify-center gap-1 mb-4">
<span className={"font-bold text-[15px] tracking-tight " + (isDark ? "text-white" : "text-[#111827]")}>SLOVENSKÁ</span>
<div className="w-5 h-5 bg-[#2a5ee8] text-white flex items-center justify-center rounded-sm">
<span className="font-serif text-[14px] font-bold italic leading-none">š</span>
</div>
</div>
<p className="text-[11px] text-gray-500 mb-0.5">
© 2026 Slovenská sporiteľňa, a. s.
</p>
<p className="text-[11px] text-gray-500 mb-0.5">
Verzia 26.30.13 (2630130)
</p>
<p className="text-[11px] text-gray-500 mb-0.5">
GID: 6.1.0.7188
</p>
<p className="text-[11px] text-gray-500">
GESDK: 23.42.0
</p>
</div>
​</main>
</div>
);
}