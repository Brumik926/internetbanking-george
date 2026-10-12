import React from 'react';
import {
ArrowLeft, Plane, Heart, ShoppingBag, Medal, Calculator,
TrendingUp, User, Smartphone, Contact, FileText, Bell,
Users, Layout, Globe, AppWindow, Type, Camera, Info,
ShieldCheck, UserX, CreditCard
} from 'lucide-react';
​// Pomocný komponent pre položku v zozname, aby sme neopakovali kód
const ListItem = ({ icon: Icon, title, subtitle, badge, isLast = false }) => (
<button className={w-full flex items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''} hover:bg-gray-50/50 transition-colors text-left}>
<div className="flex items-center gap-4">
<Icon size={24} className="text-[#2a5ee8]" strokeWidth={1.5} />
<div>
<div className="text-[16px] font-bold text-[#111827]">{title}</div>
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
​const ProfileSettings = () => {
return (
<div className="min-h-screen bg-[#f4f6f9] text-gray-900 font-sans pb-10">
​{/* Hlavička */}
<div className="flex justify-between items-center pt-6 px-4 pb-4">
<button className="p-2 -ml-2 text-[#2a5ee8] hover:bg-blue-50 rounded-full transition-colors">
<ArrowLeft size={24} />
</button>
<button className="text-[#2a5ee8] font-bold text-[15px] hover:underline">
Odhlásiť
</button>
</div>
​<main className="px-4 max-w-md mx-auto">
​<h1 className="text-[28px] font-bold text-[#111827] mb-6">Profil</h1>
​{/* Karta Používateľa /}
<div className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-gray-100 flex justify-between items-center">
<span className="text-[18px] font-bold text-gray-900">Tomáš Lizák</span>
<div className="w-14 h-14 bg-black rounded-full overflow-hidden flex items-center justify-center">
{/ Tu by bol reálny avatar, zatiaľ použijeme emoji medveďa z obrázka */}
<span className="text-3xl">🐻</span>
</div>
</div>
​{/* Sekcia: Doplnky */}
<div className="mb-8">
<h2 className="text-[14px] font-bold text-gray-900 mb-3 px-1">Doplnky</h2>
<div className="bg-white rounded-3xl px-5 py-1 shadow-sm border border-gray-100">
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
<h2 className="text-[14px] font-bold text-gray-900 mb-3 px-1">Profil</h2>
<div className="bg-white rounded-3xl px-5 py-1 shadow-sm border border-gray-100">
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
<h2 className="text-[14px] font-bold text-gray-900 mb-3 px-1">Aplikácia</h2>
<div className="bg-white rounded-3xl px-5 py-1 shadow-sm border border-gray-100">
<ListItem icon={Layout} title="Prispôsobiť prehľad" />
<ListItem icon={Globe} title="Zmeniť jazyk" />
<ListItem icon={AppWindow} title="Ikona aplikácie" />
<ListItem icon={Type} title="Prispôsobenie vzhľadu" />
<ListItem icon={Camera} title="Snímky obrazovky" isLast={true} />
</div>
</div>
​{/* Sekcia: O aplikácii */}
<div className="mb-8">
<h2 className="text-[14px] font-bold text-gray-900 mb-3 px-1">O aplikácii</h2>
<div className="bg-white rounded-3xl px-5 py-1 shadow-sm border border-gray-100">
<ListItem icon={Info} title="Informácie" />
<ListItem icon={ShieldCheck} title="Kontrola zabezpečenia" />
<ListItem icon={UserX} title="Zrušiť elektronické služby" isLast={true} />
</div>
</div>
​{/* Sekcia: Ďalšie aplikácie */}
<div className="mb-10">
<h2 className="text-[14px] font-bold text-gray-900 mb-3 px-1">Ďalšie aplikácie</h2>
<div className="bg-white rounded-3xl px-5 py-1 shadow-sm border border-gray-100">
<ListItem icon={CreditCard} title="Google Pay" subtitle="Nakupujte šikovnejšie" isLast={true} />
</div>
</div>
​{/* Pätička (Footer) */}
<div className="text-center pb-8 flex flex-col items-center">
<div className="flex items-center justify-center gap-1 mb-4 text-[#111827]">
<span className="font-bold text-[15px] tracking-tight">SLOVENSKÁ</span>
<div className="w-5 h-5 bg-black text-white flex items-center justify-center rounded-sm">
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
};
​export default ProfileSettings;