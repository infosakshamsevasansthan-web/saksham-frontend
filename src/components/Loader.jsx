import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      
      {/* Container for the synchronized logos */}
      <div className="relative w-40 h-40 mb-12 flex items-center justify-center">
        
        {/* 1. Outer Ring - Turant rotate hona shuru karega */}
        <motion.img 
          src="/logo-ring.png" 
          alt="Saksham Ring"
          initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 360, scale: 1, opacity: 1 }}
          transition={{ 
            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.5 },
            opacity: { duration: 0.5 }
          }}
          className="absolute inset-0 w-full h-full z-20"
        />

        {/* 2. Inner City Logo - Bina kisi delay ke Ring ke saath hi aayega */}
        <motion.img 
          src="/logo-city.png" 
          alt="City"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.6, // Tezi se aayega
            ease: "easeOut"
          }}
          className="w-24 h-24 object-contain z-10"
        />

        {/* 3. Subtle Pulse Effect - City logo ko aur highlight karne ke liye */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-24 h-24 bg-emerald-400 rounded-full blur-2xl z-0"
        ></motion.div>
      </div>

      {/* 4. Dancing Dots Animation */}
      <div className="flex gap-2.5">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            animate={{ 
              y: [0, -15, 0],
              backgroundColor: ["#059669", "#34d399", "#059669"]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              delay: index * 0.1, 
              ease: "easeInOut" 
            }}
            className="w-3.5 h-3.5 rounded-full shadow-md"
          />
        ))}
      </div>
      
      {/* 5. Professional Text */}
      <div className="mt-10 text-center">
        <h2 className="text-slate-800 font-black tracking-[0.4em] text-xs uppercase mb-2">
          Saksham City
        </h2>
        <motion.p 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em]"
        >
          Master Control Engine Suite
        </motion.p>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 opacity-40">
        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-tighter">
          Synchronizing Municipal Data Hub • 2026
        </p>
      </div>
    </div>
  );
};

export default Loader;
