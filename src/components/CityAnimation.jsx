import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Activity } from 'lucide-react';

const CityAnimation = () => {
  return (
    <div className="relative w-full h-[500px] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
      
      {/* 1. The Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/city-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 2. Overlay Layer (Halka sa dark shade taaki badges dikhen) */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* 3. Floating Live Status Badges (Ye software wali feel denge) */}
      
      {/* Top Left: Live Monitoring */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 20, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 left-0 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg flex items-center gap-3 border border-emerald-100"
      >
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="font-bold text-slate-800 text-sm">Live Monitoring...</span>
      </motion.div>

      {/* Top Right: Swachh Survekshan Points */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-6 right-6 bg-emerald-600 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2"
      >
        <ShieldCheck size={20} />
        <span className="font-bold text-xs">SS-2026 Verified</span>
      </motion.div>

      {/* Bottom Center: Staff Stats */}
      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-8 border border-slate-200"
      >
        <div className="flex items-center gap-2">
          <Users className="text-emerald-600" size={18} />
          <div className="text-left">
            <p className="text-[10px] text-slate-500 font-bold leading-none">ACTIVE STAFF</p>
            <p className="text-sm font-black text-slate-800">1,240</p>
          </div>
        </div>
        <div className="w-px h-6 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <Activity className="text-blue-600" size={18} />
          <div className="text-left">
            <p className="text-[10px] text-slate-500 font-bold leading-none">GARBAGE COLLECTED</p>
            <p className="text-sm font-black text-slate-800">85%</p>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default CityAnimation;