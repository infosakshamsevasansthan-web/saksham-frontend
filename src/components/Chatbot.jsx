import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-80 h-96 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col"
          >
            <div className="bg-emerald-600 p-4 rounded-t-3xl flex justify-between items-center text-white">
              <span className="font-bold">Saksham AI Assistant</span>
              <button onClick={() => setIsOpen(false)}><X size={20}/></button>
            </div>
            <div className="flex-1 p-4 text-sm text-slate-500 italic">
              Namaste! Main Saksham Assistant hoon. Main aapki kaise madad kar sakta hoon?
            </div>
            <div className="p-4 border-t">
               <input className="w-full border rounded-full px-4 py-2 text-sm focus:outline-emerald-500" placeholder="Type a message..." />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform"
      >
        <MessageCircle size={32} />
      </button>
    </div>
  );
};

export default Chatbot;