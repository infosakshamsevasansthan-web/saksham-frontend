import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      
      {/* 🟢 Container for Logos (Bada size) */}
      <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
        
        {/* 1. Outer Ring (Saksham City Seal) 
           - Visible immediately
           - Continuous Rotation
        */}
        <motion.img 
          src="/logo-ring.png" 
          alt="Ring"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{ 
            opacity: { duration: 0.8 },
            scale: { duration: 0.8 },
            rotate: { duration: 8, repeat: Infinity, ease: "linear" } 
          }}
          style={{ width: '150px', height: '150px' }} // 🟢 Custom Size (approx w-38)
          className="absolute z-20"
        />

        {/* 2. Inner City Logo (Isometric City)
           - Visible along with the ring
           - Cinematic Blur-to-Clear Effect (5 Seconds)
        */}
        <motion.img 
          src="/logo-city.png" 
          alt="City"
          initial={{ 
            opacity: 0, 
            filter: "blur(15px)", // 🟢 Shuru mein blur rahega
            scale: 0.8 
          }}
          animate={{ 
            opacity: 1, 
            filter: "blur(0px)", // 🟢 5 sec mein clear ho jayega
            scale: 1 
          }}
          transition={{ 
            duration: 5, // 🟢 Slow cinematic transition
            ease: "easeInOut"
          }}
          style={{ width: '100px', height: '100px' }} // 🟢 Inside Ring alignment
          className="absolute z-10 object-contain"
        />

        {/* Soft emerald glow in background */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute w-40 h-40 bg-emerald-400 rounded-full blur-3xl z-0"
        ></motion.div>
      </div>

      {/* 3. Progress Dots Animation */}
      <div className="flex gap-3 mb-8">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: index * 0.15 
            }}
            className="w-2.5 h-2.5 bg-emerald-500 rounded-full"
          />
        ))}
      </div>
      
      {/* 4. Text Branding */}
      <div className="text-center space-y-2">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-slate-800 font-black tracking-[0.6em] text-xs uppercase"
        >
          Saksham City
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5 }}
          className="text-emerald-600 font-bold text-[9px] uppercase tracking-[0.3em]"
        >
          Syncing Master Engine Data...
        </motion.p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-10 opacity-30">
        <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest">
          Secured Digital Core • 2026
        </p>
      </div>
    </div>
  );
};

export default Loader;
