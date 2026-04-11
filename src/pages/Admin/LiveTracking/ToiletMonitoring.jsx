import React from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Droplets, Star, Camera, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const ToiletMonitoring = () => {
  // Mock Data: Ye data aapke database se aayega (App photo analysis ke baad)
  const toiletData = [
    { id: 1, name: "Station Square Toilet", cleanPercent: 92, rating: "4.8", lastUpdate: "10 mins ago", inspector: "Ramesh Kumar" },
    { id: 2, name: "Bus Stand Urinal", cleanPercent: 45, rating: "2.1", lastUpdate: "2 hours ago", inspector: "Suresh Singh" },
    { id: 3, name: "City Park Complex", cleanPercent: 78, rating: "4.2", lastUpdate: "45 mins ago", inspector: "Amit Gupta" },
  ];

  return (
    <CityLayout>
      <div className="space-y-6 p-4">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Public Assets Map</h1>
            <p className="text-emerald-600 font-bold text-xs tracking-[0.2em]">REAL-TIME APP BASED PHOTO MONITORING</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-500 uppercase">System Online: Analyzing Photos</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {toiletData.map((toilet) => (
             <ToiletCard key={toilet.id} {...toilet} />
           ))}
        </div>
      </div>
    </CityLayout>
  );
};

const ToiletCard = ({ name, cleanPercent, rating, lastUpdate, inspector }) => {
  // Dynamic Colors based on Cleanliness Percentage
  const isGood = cleanPercent >= 80;
  const isAverage = cleanPercent >= 50 && cleanPercent < 80;
  const statusColor = isGood ? 'text-emerald-500' : isAverage ? 'text-amber-500' : 'text-rose-500';
  const bgColor = isGood ? 'bg-emerald-500' : isAverage ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="bg-white rounded-[45px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
      
      {/* BACKGROUND WATERMARK IMAGE (Jo aapne di hai) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500">
         <img 
            src="/assets/toilet-bg.png" 
            alt="bg" 
            className="w-full h-full object-cover grayscale"
         />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${bgColor} text-white`}>
            <Droplets size={28} />
          </div>
          
          {/* PHOTO VERIFIED BADGE */}
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                <Camera size={12} className="text-slate-400"/>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Verified by App</span>
             </div>
             <div className="flex items-center gap-1 mt-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg">
                <Star size={12} fill="currentColor" /> <span className="text-[10px] font-black">{rating}</span>
             </div>
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-800 uppercase leading-tight mb-2">{name}</h3>
        
        {/* CLEANLINESS PERCENTAGE BAR */}
        <div className="mt-6 space-y-2">
           <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cleanliness Score</span>
              <span className={`text-2xl font-black ${statusColor}`}>{cleanPercent}%</span>
           </div>
           <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${bgColor} transition-all duration-1000 ease-out`} 
                style={{ width: `${cleanPercent}%` }}
              ></div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50">
           <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase">Last Photo</p>
                <p className="text-[10px] font-bold text-slate-700">{lastUpdate}</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-slate-400" />
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase">Inspector</p>
                <p className="text-[10px] font-bold text-slate-700">{inspector}</p>
              </div>
           </div>
        </div>

        <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
           View Analysis Photo
        </button>
      </div>
    </div>
  );
};

export default ToiletMonitoring;