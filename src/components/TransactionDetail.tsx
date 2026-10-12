import React, { useState } from 'react';
import { ArrowLeft, Share, Tag, EyeOff, Edit3, Paperclip } from 'lucide-react';
​const TransactionDetail = () => {
const [excludeFromStats, setExcludeFromStats] = useState(false);
​return (
<div className="min-h-screen bg-[#f4f6f9] text-gray-900 font-sans pb-10">
​{/* Hlavička */}
<div className="pt-6 px-4 pb-2">
<button className="p-2 -ml-2 text-[#2a5ee8] hover:bg-blue-50 rounded-full transition-colors">
<ArrowLeft size={24} />
</button>
</div>
​<main className="px-4 mt-2 max-w-md mx-auto">
​{/* Hlavná hlavička transakcie */}
<div className="flex justify-between items-start mb-6">
<div>
<h1 className="text-[17px] font-bold text-[#111827] mb-1">Poplatok</h1>
<div className="text-[32px] font-bold text-[#111827] flex items-start tracking-tight leading-none mb-4">
-7,<sup className="text-[18px] mt-1 ml-0.5">00</sup> <span className="ml-1 text-2xl mt-1.5">€</span>
</div>
<button className="bg-[#eef3ff] text-[#2a5ee8] px-4 py-1.5 rounded-full font-bold text-[13px] flex items-center gap-2 hover:bg-blue-100 transition-colors">
<Share size={16} strokeWidth={2.5} />
Zdieľať
</button>
</div>
​{/* Logo SLSP */}
<div className="w-16 h-16 rounded-full bg-[#2a5ee8] flex items-center justify-center text-white shadow-sm mt-1">
<span className="font-serif italic text-4xl font-bold leading-none mt-2">s</span>
</div>
</div>
​{/* Akčné karty */}
<div className="space-y-2 mb-8">
​{/* Tagy */}
<button className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 text-left hover:bg-gray-50 transition-colors">
<Tag size={22} className="text-[#2a5ee8]" strokeWidth={2} />
<div className="border border-gray-200 text-gray-700 text-[13px] font-medium px-3 py-1 rounded-full">
Poplatky
</div>
</button>
​{/* Nezahrnúť do prehľadu /}
<div className="w-full bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm border border-gray-100">
<div className="flex items-center gap-4">
<EyeOff size={22} className="text-[#2a5ee8]" strokeWidth={2} />
<span className="text-[15px] font-medium text-gray-900 leading-tight">
Nezahrnúť do prehľadu
príjmov a výdavkov
</span>
</div>
{/ Toggle Switch */}
<button
onClick={() => setExcludeFromStats(!excludeFromStats)}
className={w-12 h-7 rounded-full relative transition-colors duration-200 ease-in-out ${excludeFromStats ? 'bg-[#2a5ee8]' : 'bg-gray-200'}}
>
<div className={w-6 h-6 bg-white rounded-full absolute top-0.5 shadow transition-transform duration-200 ease-in-out ${excludeFromStats ? 'left-[22px]' : 'left-0.5'}}></div>
</button>
</div>
​{/* Pridať poznámku */}
<button className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 text-left hover:bg-gray-50 transition-colors">
<Edit3 size={22} className="text-[#2a5ee8]" strokeWidth={2} />
<span className="text-[15px] font-medium text-[#8e95a3]">Pridať poznámku alebo #hashtag</span>
</button>
​{/* Nahrať prílohu */}
<button className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 text-left hover:bg-gray-50 transition-colors">
<Paperclip size={22} className="text-[#2a5ee8]" strokeWidth={2} />
<span className="text-[15px] font-medium text-[#8e95a3]">Nahrať prílohu</span>
</button>
</div>
​{/* Detaily transakcie */}
<div className="bg-[#f4f6f9]">
<div className="mb-5">
<p className="text-[13px] text-gray-500 mb-0.5">Popis transakcie</p>
<p className="text-[16px] font-bold text-gray-900">Poplatok za vedenie účtu</p>
</div>
​<div className="mb-5">
<p className="text-[13px] text-gray-500 mb-0.5">Dátum spracovania</p>
<p className="text-[16px] font-bold text-gray-900">30.09.2026</p>
</div>
​<div className="mb-5">
<p className="text-[13px] text-gray-500 mb-0.5">Konštantný symbol</p>
<p className="text-[16px] font-bold text-gray-900">0898</p>
</div>
​<div className="mb-5">
<p className="text-[13px] text-gray-500 mb-0.5">Typ transakcie</p>
<p className="text-[16px] font-bold text-gray-900">Poplatok</p>
</div>
</div>
​</main>
</div>
);
};
​export default TransactionDetail;