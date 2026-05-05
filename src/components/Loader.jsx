import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
      
      {/* 1. Central Animated Logo Logic */}
      <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
        
        {/* Outer Rotating Ring (Saksham Seal) */}
        <motion.img 
          src="/logo-ring.png" 
          alt="Saksham Ring"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-full h-full z-20"
        />

        {/* Inner Pulsing City Icon */}
        <motion.img 
          src="/logo-city.png" 
          alt="City"
          animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 object-contain z-10"
        />

        {/* Glow Effect behind the logo */}
        <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full animate-pulse"></div>
      </div>

      {/* 2. Professional Progress Indicator (Green Balls) */}
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            animate={{ 
              y: [0, -12, 0],
              backgroundColor: ["#10b981", "#34d399", "#10b981"],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              delay: index * 0.1, 
              ease: "easeInOut" 
            }}
            className="w-3 h-3 rounded-full shadow-lg shadow-emerald-100"
          />
        ))}
      </div>
      
      {/* 3. Dynamic Text with simple fade */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-slate-800 font-black tracking-[0.3em] text-[10px] uppercase">
          Saksham Master Engine
        </p>
        <motion.p 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-emerald-600 font-bold text-[9px] uppercase mt-2 tracking-widest"
        >
          Synchronizing Data...
        </motion.p>
      </motion.div>

      {/* Bottom Footer for Loader */}
      <div className="absolute bottom-10">
        <p className="text-slate-300 font-bold text-[8px] uppercase tracking-tighter">
          Powered by Saksham Digitization 2026
        </p>
      </div>
    </div>
  );
};

export default Loader;
