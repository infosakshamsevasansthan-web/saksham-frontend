import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      
      {/* Logos Container */}
      <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
        
        {/* 1. The Ring (Always Present & Rotating) */}
        <motion.img 
          src="/logo-ring.png" 
          alt="Saksham Ring"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{ 
            opacity: { duration: 1 },
            scale: { duration: 1 },
            rotate: { duration: 6, repeat: Infinity, ease: "linear" } 
          }}
          className="absolute inset-0 w-full h-full z-20"
        />

        {/* 2. The City Logo (Starts Blurred and Small) */}
        <motion.img 
          src="/logo-city.png" 
          alt="City"
          initial={{ 
            opacity: 0, 
            filter: "blur(20px)", 
            scale: 0.7 
          }}
          animate={{ 
            opacity: 1, 
            filter: "blur(0px)", 
            scale: 1 
          }}
          transition={{ 
            duration: 5, // 🟢 5 Second ka slow visible effect
            ease: "easeInOut"
          }}
          className="w-28 h-28 object-contain z-10"
        />

        {/* 3. Background Glow - Ye bhi dhire dhire badhega */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0.2] }}
          transition={{ duration: 5 }}
          className="absolute w-32 h-32 bg-emerald-400 rounded-full blur-3xl z-0"
        ></motion.div>
      </div>

      {/* 4. Progress Dots */}
      <div className="flex gap-3">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            animate={{ 
              y: [0, -12, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: index * 0.2 
            }}
            className="w-3 h-3 bg-emerald-500 rounded-full"
          />
        ))}
      </div>
      
      {/* 5. Professional Text */}
      <div className="mt-12 text-center">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-slate-800 font-black tracking-[0.5em] text-sm uppercase mb-2"
        >
          Saksham City
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-emerald-600 font-bold text-[11px] uppercase tracking-[0.3em]"
        >
          Initializing Master Systems...
        </motion.p>
      </div>

      {/* Branding Footer */}
      <div className="absolute bottom-10 opacity-30">
        <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">
          Secured Municipal Infrastructure • 2026
        </p>
      </div>
    </div>
  );
};

export default Loader;
