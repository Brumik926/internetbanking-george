import React from 'react';
import { Search, CreditCard, MoreVertical, Compass, PieChart, MessageSquare, Activity } from 'lucide-react';
​const GeorgeDashboard = () => {
return (
// Hlavný kontajner - tmavé pozadie celej aplikácie
<div className="min-h-screen bg-[#0e0e12] text-white font-sans pb-24">
​{/* Hlavička (Top bar) /}
<header className="flex justify-end items-center p-4 gap-4">
<button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
<Search size={24} />
</button>
<button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
<CreditCard size={24} />
</button>
<button className="relative">
<div className="w-10 h-10 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
{/ Zástupný avatar (môžeš nahradiť vlastným obrázkom) /}
<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=George" alt="Profile" className="w-full h-full object-cover" />
</div>
{/ Červená bodka notifikácie */}
<span className="absolute top-0 right-0 w-3 h-3 bg-[#ff5252] border-2 border-[#0e0e12] rounded-full"></span>
</button>
</header>
​<main className="px-4">
{/* Nadpis */}
<h1 className="text-4xl font-bold mt-2 mb-6 tracking-tight">Prehľad</h1>
​{/* Sekcia: Výdavky a Príjmy (Dva stĺpce) /}
<div className="grid grid-cols-2 gap-3 mb-8">
{/ Výdavky */}
<div className="bg-[#1c1c24] rounded-2xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
<div className="flex justify-between items-start">
<span className="text-sm font-medium text-gray-200">Výdavky za október</span>
<div className="bg-[#242b3b] p-1.5 rounded-full">
<Activity size={16} className="text-[#4f95ff]" />
</div>
</div>
<div>
<div className="text-xl font-bold text-white flex items-start">
0,<sup className="text-sm mt-1 ml-0.5">00</sup> <span className="ml-1">€</span>
</div>
<div className="text-xs text-gray-500 mt-1">Neurčený rozpočet</div>
</div>
</div>
​{/* Príjmy */}
<div className="bg-[#1c1c24] rounded-2xl p-4 flex flex-col justify-between h-28 relative overflow-hidden">
<div className="flex justify-between items-start">
<span className="text-sm font-medium text-gray-200">Príjmy za október</span>
</div>
<div>
<div className="text-xl font-bold text-white flex items-start">
0,<sup className="text-sm mt-1 ml-0.5">00</sup> <span className="ml-1">€</span>
</div>
</div>
</div>
</div>
​{/* Sekcia: Vaše produkty */}
<h2 className="text-sm text-gray-400 mb-4 px-1">Vaše produkty</h2>
​{/* Karta: Účet (Záporný zostatok) */}
<div className="bg-[#1c1c24] rounded-3xl p-5 mb-4 shadow-lg border border-white/5">
<div className="flex justify-between items-start mb-2">
<h3 className="text-lg font-semibold text-white">Účet</h3>
<div className="w-12 h-12 rounded-full overflow-hidden">
<img src="https://images.unsplash.com/photo-1506744626753-1fa7604eb412?w=100&h=100&fit=crop" alt="Mesto" className="w-full h-full object-cover" />
</div>
</div>
<div className="mb-1">
<div className="text-3xl font-bold text-[#ff5252] flex items-start tracking-tight">
-18 310,<sup className="text-lg mt-1 ml-0.5">75</sup> <span className="ml-1 text-2xl mt-1">€</span>
</div>
<div className="text-sm text-gray-400 mt-1">-18 310,75 € vlastné zdroje</div>
</div>
​<div className="flex justify-between items-center mt-6">
<button className="bg-[#242b3b] text-[#4f95ff] px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#2a3447] transition-colors">
Nová platba
</button>
<button className="text-[#4f95ff] p-2">
<MoreVertical size={20} />
</button>
</div>
</div>
​{/* Karta: Investície */}
<div className="bg-[#1c1c24] rounded-3xl p-5 mb-4 shadow-lg border border-white/5">
<div className="flex justify-between items-start mb-2">
<h3 className="text-lg font-semibold text-white">Investície</h3>
<div className="w-12 h-12 rounded-full overflow-hidden">
<img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop" alt="Budova" className="w-full h-full object-cover" />
</div>
</div>
<div className="mb-6">
<div className="text-3xl font-bold text-white flex items-start tracking-tight">
0,<sup className="text-lg mt-1 ml-0.5">00</sup> <span className="ml-1 text-2xl mt-1">€</span>
</div>
</div>
<button className="bg-[#242b3b] text-[#4f95ff] px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#2a3447] transition-colors">
Vyhľadať a kúpiť
</button>
</div>
​</main>
​{/* Spodná navigácia (Bottom Navigation) /}
<nav className="fixed bottom-0 left-0 w-full bg-[#121216] border-t border-gray-800 pb-safe pt-2 px-2 z-50">
<div className="flex justify-around items-center pb-2">
{/ Aktívny odkaz (Prehľad) /}
<button className="flex flex-col items-center p-2 text-[#4f95ff]">
<div className="relative">
{/ Vlastná ikona pre logo George (približná náhrada) */}
<div className="font-serif italic text-2xl font-bold leading-none mb-1">g</div>
</div>
<span className="text-[10px] font-semibold mt-1">Prehľad</span>
</button>
​<button className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-300">
<Activity size={24} strokeWidth={1.5} />
<span className="text-[10px] mt-1">FIT</span>
</button>
​<button className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-300">
<PieChart size={24} strokeWidth={1.5} />
<span className="text-[10px] mt-1">Invest</span>
</button>
​<button className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-300">
<Compass size={24} strokeWidth={1.5} />
<span className="text-[10px] mt-1">Objavujte</span>
</button>
​<button className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-300">
<MessageSquare size={24} strokeWidth={1.5} />
<span className="text-[10px] mt-1">Kontakty</span>
</button>
</div>
</nav>
</div>
);
};
​export default GeorgeDashboard;