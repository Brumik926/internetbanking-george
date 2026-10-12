import React, { useState } from 'react';
import { ArrowLeft, Edit3, Search, BarChart2, Plus } from 'lucide-react';
​const AccountTransactions = () => {
const [activeTab, setActiveTab] = useState('Transakcie');
​const tabs = ['Transakcie', 'Funkcie', 'Karty', 'Info'];
​return (
<div className="min-h-screen bg-[#f4f6f9] text-gray-900 font-sans pb-24 relative">
​{/* Hlavička s informáciami o účte */}
<div className="bg-[#2a5ee8] pt-6 pb-20 px-4 text-white">
<button className="mb-6 p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
<ArrowLeft size={24} />
</button>
​<div className="flex justify-between items-start mb-2">
<h1 className="text-[22px] font-bold">Účet</h1>
<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shadow-sm">
<img src="https://images.unsplash.com/photo-1506744626753-1fa7604eb412?w=100&h=100&fit=crop" alt="Mesto" className="w-full h-full object-cover" />
</div>
</div>
​<div className="mb-1">
<div className="text-[34px] font-bold text-[#ff6b6b] flex items-start tracking-tight leading-none">
-18 310,<sup className="text-[20px] mt-1 ml-0.5">75</sup> <span className="ml-1 text-[26px] mt-1">€</span>
</div>
<div className="text-[13px] text-white/70 mt-2">-18 310,75 € vlastné zdroje</div>
</div>
</div>
​{/* Hlavný obsah prekrývajúci hlavičku */}
<main className="-mt-6 relative z-10">
​{/* Navigácia (Taby) */}
<div className="flex overflow-x-auto hide-scrollbar px-2 mb-4">
{tabs.map((tab) => (
<button
key={tab}
onClick={() => setActiveTab(tab)}
className={px-5 py-2.5 mx-1 whitespace-nowrap rounded-full text-[14px] font-bold transition-all ${ activeTab === tab  ? 'bg-white text-[#2a5ee8] shadow-sm'  : 'text-white/80 hover:text-white' }}
>
{tab}
</button>
))}
</div>
​{activeTab === 'Transakcie' && (
<div className="px-4">
​{/* Blok: Platobné príkazy a rezervácie */}
<div className="bg-white rounded-3xl p-4 flex items-center gap-4 mb-6 shadow-sm border border-gray-100">
<div className="bg-[#eef3ff] p-2.5 rounded-xl">
<Edit3 size={24} className="text-[#2a5ee8]" />
</div>
<div>
<h3 className="font-bold text-gray-900 text-[15px]">Platobné príkazy a rezervácie</h3>
<p className="text-[13px] text-gray-500">Načítavanie...</p>
</div>
</div>
​{/* Zoznam transakcií (Zoskupené podľa mesiacov) */}
​{/* September 2026 */}
<div className="mb-6">
<h4 className="text-[15px] font-bold text-gray-900 mb-3 px-1">September 2026</h4>
<div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-start justify-between">
<div className="flex gap-4">
<div className="w-12 h-12 rounded-full bg-[#2a5ee8] flex items-center justify-center text-white shrink-0 shadow-inner">
<span className="font-serif italic text-2xl font-bold leading-none mt-1">s</span>
</div>
<div>
<h5 className="font-bold text-gray-900 text-[16px]">Poplatok</h5>
<p className="text-[13px] text-gray-500 leading-tight mt-0.5">30.09.2026</p>
<p className="text-[13px] text-gray-500 leading-tight mt-0.5 mb-2">KS: 0898</p>
<span className="inline-block border border-gray-200 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">Poplatky</span>
</div>
</div>
<div className="text-[16px] font-bold text-gray-900 mt-1 whitespace-nowrap">
-7,00 €
</div>
</div>
</div>
​{/* August 2026 */}
<div className="mb-6">
<h4 className="text-[15px] font-bold text-gray-900 mb-3 px-1">August 2026</h4>
<div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-start justify-between">
<div className="flex gap-4">
<div className="w-12 h-12 rounded-full bg-[#2a5ee8] flex items-center justify-center text-white shrink-0 shadow-inner">
<span className="font-serif italic text-2xl font-bold leading-none mt-1">s</span>
</div>
<div>
<h5 className="font-bold text-gray-900 text-[16px]">Poplatok</h5>
<p className="text-[13px] text-gray-500 leading-tight mt-0.5">31.08.2026</p>
<p className="text-[13px] text-gray-500 leading-tight mt-0.5 mb-2">KS: 0898</p>
<span className="inline-block border border-gray-200 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">Poplatky</span>
</div>
</div>
<div className="text-[16px] font-bold text-gray-900 mt-1 whitespace-nowrap">
-7,00 €
</div>
</div>
</div>
​{/* Júl 2026 (Ukážka spodného okraja) */}
<div className="mb-24">
<h4 className="text-[15px] font-bold text-gray-900 mb-3 px-1">Júl 2026</h4>
<div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-start justify-between">
<div className="flex gap-4">
<div className="w-12 h-12 rounded-full bg-[#2a5ee8] flex items-center justify-center text-white shrink-0 shadow-inner">
<span className="font-serif italic text-2xl font-bold leading-none mt-1">s</span>
</div>
<div>
<h5 className="font-bold text-gray-900 text-[16px]">Poplatok</h5>
<p className="text-[13px] text-gray-500 leading-tight mt-0.5">31.07.2026</p>
</div>
</div>
<div className="text-[16px] font-bold text-gray-900 mt-1 whitespace-nowrap">
-7,00 €
</div>
</div>
</div>
​</div>
)}
</main>
​{/* Floating Bottom Action Bar (ako v obrázku 9994) */}
<div className="fixed bottom-6 left-0 w-full px-4 z-50 flex justify-between items-center pointer-events-none">
​{/* Ľavé rýchle akcie */}
<div className="flex gap-2 pointer-events-auto">
<button className="w-12 h-12 bg-white rounded-full flex justify-center items-center text-[#2a5ee8] shadow-lg border border-gray-100 hover:bg-gray-50">
<Search size={22} strokeWidth={2.5} />
</button>
<button className="w-12 h-12 bg-white rounded-full flex justify-center items-center text-[#2a5ee8] shadow-lg border border-gray-100 hover:bg-gray-50">
<BarChart2 size={22} strokeWidth={2.5} />
</button>
</div>
​{/* Hlavné tlačidlo Nová platba */}
<button className="bg-[#2a5ee8] text-white px-6 py-3.5 rounded-full font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-colors pointer-events-auto">
<Plus size={20} strokeWidth={3} />
<span>Nová platba</span>
</button>
</div>
​</div>
);
};
​export default AccountTransactions;