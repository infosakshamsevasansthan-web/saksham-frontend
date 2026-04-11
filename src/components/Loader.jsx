import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center">
      {/* 1. Logo Fade Animation */}
      <motion.img 
        src="/logo.png" 
        alt="Saksham Logo"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="h-20 w-auto mb-10"
      />

      {/* 2. 4 Green Balls Dancing Animation */}
      <div className="flex gap-3">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            animate={{ y: [0, -20, 0] }}
            transition={{ 
              duration: 0.6, 
              repeat: Infinity, 
              delay: index * 0.15, // Har ball thodi der baad uchelegi
              ease: "easeInOut" 
            }}
            className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200"
          />
        ))}
      </div>
      
      <p className="mt-8 text-slate-400 font-bold tracking-widest text-xs uppercase">
        Securing Connection...
      </p>
    </div>
  );
};

export default Loader;