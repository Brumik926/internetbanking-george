import React, { useState } from 'react';
import {
Search, CreditCard, MoreVertical, Compass, PieChart, MessageSquare, Activity, Sun, Moon,
ArrowLeft, Plane, Heart, ShoppingBag, Medal, Calculator, TrendingUp, User, Smartphone,
Contact, FileText, Bell, Users, Layout, Globe, AppWindow, Type, Camera, Info, ShieldCheck, UserX
} from 'lucide-react';
​export default function Index() {
const [isDark, setIsDark] = useState(false);
const [currentView, setومCurrentView] = useState('dashboard'); // 'dashboard' alebo 'profile'
const [currentViewMode, setCurrentViewMode] = useState('dashboard');
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
​if (currentViewMode === 'profile') {
return (
<div className={"min-h-screen font-sans pb-12 transition-colors duration-300 " + (isDark ? "bg-[#0e0e12] text-white" : "bg-[#f4f6f9] text-gray-900")}>
<main className="px-4 max-w-md mx-auto pt-6">
<div className="flex justify-between items-center pb-4 mb-2">
<button
onClick={() => setCurrentViewMode('dashboard')}
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
​<div className={"rounded-3xl p-5 mb-8 shadow-sm border flex justify-between items-center " + (isDark ? "bg-[#1c1c24] border-white/5" : "bg-white border-gray-100")}>
<span className={"text-[18px] font-bold " + (isDark ? "text-white" : "text-gray-900")}>Tomáš Lizák</span>
<div className="w-14 h-14 bg-black rounded-full overflow-hidden flex items-center justify-center border border-gray-700">
<span className="text-3xl">🐻</span>
</div>
</div>
​<div className="mb-8">
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
​<div className="mb-8">
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
​<div className="mb-8">
<h2 className={"text-[14px] font-bold mb-3 px-1 " + (isDark ? "text-gray-400" : "text-gray-900")}>Aplikácia</h2>
<div className={"rounded-3xl px-5 py-1 shadow-sm border " + (isDark ? "bg-[#1c1c24] border-white/5" : "bg-white border-gray-100")}>
<ListItem icon={Layout} title="Prispôsobiť prehľad" />
<ListItem icon={Globe} title="Zmeniť jazyk" />
<ListItem icon={AppWindow} title="Ikona aplikácie" />
<ListItem icon={Type} title="Prispôsobenie vzhľadu" />
<ListItem icon={Camera} title="Snímky obrazovky" isLast={true} />
</div>
</div>
​<div className="mb-8">
<h2 className={"text-[14px] font-bold mb-3 px-1 " + (isDark ? "text-gray-400" : "text-gray-900")}>O aplikácii</h2>
<div className={"rounded-3xl px-5 py-1 shadow-sm border " + (isDark ? "bg-[#1c1c24] border-white/5" : "bg-white border-gray-100")}>
<ListItem icon={Info} title="Informácie" />
<ListItem icon={ShieldCheck} title="Kontrola zabezpečenia" />
<ListItem icon={UserX} title="Zrušiť elektronické služby" isLast={true} />
</div>
</div>
​<div className="mb-10">
<h2 className={"text-[14px] font-bold mb-3 px-1 " + (isDark ? "text-gray-400" : "text-gray-900")}>Ďalšie aplikácie</h2>
<div className={"rounded-3xl px-5 py-1 shadow-sm border " + (isDark ? "bg-[#1c1c24] border-white/5" : "bg-white border-gray-100")}>
<ListItem icon={CreditCard} title="Google Pay" subtitle="Nakupujte šikovnejšie" isLast={true} />
</div>
</div>
​<div className="text-center pb-8 flex flex-col items-center">
<div className="flex items-center justify-center gap-1 mb-4">
<span className={"font-bold text-[15px] tracking-tight " + (isDark ? "text-white" : "text-[#111827]")}>SLOVENSKÁ</span>
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
}
​return (
<div className={"min-h-screen font-sans pb-24 transition-colors duration-350 " + (isDark ? "bg-[#0e0e12] text-white" : "bg-[#f4f6f9] text-gray-900")}>
<div className={"pt-6 pb-24 px-4 transition-colors duration-350 " + (isDark ? "bg-[#0e0e12] text-white" : "bg-[#2a5ee8] text-white rounded-b-3xl")}>
<header className="flex justify-between items-center">
<button
onClick={() => setIsDark(!isDark)}
className="text-white hover:bg-white/20 p-2 rounded-full transition-colors flex items-center gap-2"
>
{isDark ? <Sun size={24} /> : <Moon size={24} />}
</button>
​<div className="flex items-center gap-4">
<button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
<Search size={24} />
</button>
<button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
<CreditCard size={24} />
</button>
​<button
onClick={() => setCurrentViewMode('profile')}
className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
>
<div className={"w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm flex items-center justify-center text-xl " + (isDark ? "bg-gray-700 border-gray-600" : "bg-white/20 border-[#2a5ee8]")}>
🐻
</div>
<span className={"absolute -top-1 -right-1 w-3.5 h-3.5 border-2 rounded-full " + (isDark ? "bg-[#ff5252] border-[#0e0e12]" : "bg-[#e63946] border-[#2a5ee8]")}></span>
</button>
</div>
</header>
​<h1 className="text-[34px] font-extrabold mt-6 tracking-tight">Prehľad</h1>
</div>
​<main className="px-4 -mt-14 relative z-10">
<div className="grid grid-cols-2 gap-3 mb-8">
<div className={"rounded-3xl p-4 flex flex-col justify-between h-[110px] transition-colors duration-350 " + (isDark ? "bg-[#1c1c24] border border-white/5" : "bg-white shadow-sm border border-gray-100")}>
<div className="flex justify-between items-start">
<span className={"text-[13px] font-medium " + (isDark ? "text-gray-300" : "text-gray-700")}>Výdavky za október</span>
<div className={"p-1.5 rounded-full " + (isDark ? "bg-[#242b3b]" : "bg-[#eef3ff]")}>
<Activity size={16} className={isDark ? "text-[#4f95ff]" : "text-[#2a5ee8]"} />
</div>
</div>
<div>
<div className="text-xl font-bold flex items-start">
0,<sup className="text-sm mt-1 ml-0.5">00</sup> <span className="ml-1">€</span>
</div>
<div className="text-[11px] mt-1 text-gray-500">Neurčený rozpočet</div>
</div>
</div>
​<div className={"rounded-3xl p-4 flex flex-col justify-between h-[110px] transition-colors duration-350 " + (isDark ? "bg-[#1c1c24] border border-white/5" : "bg-white shadow-sm border border-gray-100")}>
<div className="flex justify-between items-start">
<span className={"text-[13px] font-medium " + (isDark ? "text-gray-300" : "text-gray-700")}>Príjmy za október</span>
</div>
<div>
<div className="text-xl font-bold flex items-start">
0,<sup className="text-sm mt-1 ml-0.5">00</sup> <span className="ml-1">€</span>
</div>
</div>
</div>
</div>
​<h2 className={"text-[13px] mb-3 px-2 font-medium " + (isDark ? "text-gray-400" : "text-gray-500")}>Vaše produkty</h2>
​<div className={"rounded-[2rem] p-5 mb-4 relative overflow-hidden transition-colors duration-350 " + (isDark ? "bg-[#1c1c24] border border-white/5" : "bg-white shadow-sm border border-gray-100")}>
<div className="absolute top-0 left-0 w-full h-[3px] bg-[#3a2072]"></div>
​<div className="flex justify-between items-start mb-2 mt-1">
<h3 className="text-xl font-bold">Účet</h3>
<div className={"w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-xl " + (isDark ? "bg-gray-800" : "bg-gray-100 shadow-sm")}>
🏙️
</div>
</div>
<div className="mb-2">
<div className={"text-[32px] font-bold flex items-start tracking-tight leading-none " + (isDark ? "text-[#ff5252]" : "text-[#e63946]")}>
-18 310,<sup className="text-[18px] mt-1 ml-0.5">75</sup> <span className="ml-1 text-2xl mt-1.5">€</span>
</div>
<div className={"text-[13px] mt-2 " + (isDark ? "text-gray-400" : "text-gray-500")}>-18 310,75 € vlastné zdroje</div>
</div>
​<div className="flex justify-between items-center mt-7">
<button className={"px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors " + (isDark ? "bg-[#242b3b] text-[#4f95ff] hover:bg-[#2a3447]" : "bg-[#eef3ff] text-[#2a5ee8] hover:bg-blue-100")}>
Nová platba
</button>
<button className={"p-2 rounded-full " + (isDark ? "text-[#4f95ff] hover:bg-white/5" : "text-[#2a5ee8] hover:bg-gray-50")}>
<MoreVertical size={22} />
</button>
</div>
</div>
​<div className={"rounded-[2rem] p-5 mb-4 relative overflow-hidden transition-colors duration-350 " + (isDark ? "bg-[#1c1c24] border border-white/5" : "bg-white shadow-sm border border-gray-100")}>
<div className="absolute top-0 left-0 w-full h-[3px] bg-[#3a2072]"></div>
<div className="flex justify-between items-start mb-2 mt-1">
<h3 className="text-xl font-bold">Investície</h3>
<div className={"w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-xl " + (isDark ? "bg-gray-800" : "bg-gray-100 shadow-sm")}>
🏢
</div>
</div>
<div className="mb-6">
<div className="text-[32px] font-bold flex items-start tracking-tight leading-none">
0,<sup className="text-[18px] mt-1 ml-0.5">00</sup> <span className="ml-1 text-2xl mt-1.5">€</span>
</div>
</div>
<button className={"px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors inline-block " + (isDark ? "bg-[#242b3b] text-[#4f95ff] hover:bg-[#2a3447]" : "bg-[#eef3ff] text-[#2a5ee8] hover:bg-blue-100")}>
Vyhľadať a kúpiť
</button>
</div>
</main>
​<nav className={"fixed bottom-0 left-0 w-full pb-safe pt-2 px-2 z-50 transition-colors duration-350 " + (isDark ? "bg-[#121216] border-t border-gray-800" : "bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]")}>
<div className="flex justify-around items-center pb-2">
<button className={"flex flex-col items-center p-2 " + (isDark ? "text-[#4f95ff]" : "text-[#2a5ee8]")}>
<div className="relative">
<div className="font-serif italic text-2xl font-bold leading-none mb-1">g</div>
<span className={"absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full " + (isDark ? "bg-[#4f95ff]" : "bg-[#2a5ee8]")}></span>
</div>
<span className="text-[11px] font-bold mt-1">Prehľad</span>
</button>
​<button className={"flex flex-col items-center p-2 transition-colors " + (isDark ? "text-gray-400 hover:text-gray-300" : "text-[#8e95a3] hover:text-gray-600")}>
<Activity size={24} strokeWidth={1.5} />
<span className="text-[11px] mt-1 font-medium">FIT</span>
</button>
​<button className={"flex flex-col items-center p-2 transition-colors " + (isDark ? "text-gray-400 hover:text-gray-300" : "text-[#8e95a3] hover:text-gray-600")}>
<PieChart size={24} strokeWidth={1.5} />
<span className="text-[11px] mt-1 font-medium">Invest</span>
</button>
​<button className={"flex flex-col items-center p-2 transition-colors " + (isDark ? "text-gray-400 hover:text-gray-300" : "text-[#8e95a3] hover:text-gray-600")}>
<Compass size={24} strokeWidth={1.5} />
<span className="text-[11px] mt-1 font-medium">Objavujte</span>
</button>
​<button className={"flex flex-col items-center p-2 transition-colors " + (isDark ? "text-gray-400 hover:text-gray-300" : "text-[#8e95a3] hover:text-gray-600")}>
<MessageSquare size={24} strokeWidth={1.5} />
<span className="text-[11px] mt-1 font-medium">Kontakty</span>
</button>
</div>
</nav>
</div>
);
}