import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Share2, Printer } from 'lucide-react';

const SuccessModal = ({ message, onClose }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-emerald-900/40 backdrop-blur-xl flex items-center justify-center p-6"
        >
            <motion.div 
                initial={{ scale: 0.5, y: 100 }} 
                animate={{ scale: 1, y: 0 }}
                className="bg-white max-w-sm w-full rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] overflow-hidden text-center p-10 border-8 border-emerald-50"
            >
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", damping: 10, delay: 0.2 }}
                    className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200"
                >
                    <CheckCircle2 size={50} className="text-white" />
                </motion.div>
                
                <h2 className="text-2xl font-black text-slate-800 uppercase italic leading-tight">Allocation<br/>Established!</h2>
                <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">{message}</p>

                <div className="mt-10 flex flex-col gap-3">
                    <button onClick={onClose} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                        Continue Operations <ChevronRight size={16}/>
                    </button>
                    <div className="flex gap-2">
                        <button className="flex-1 p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Share2 size={18} className="mx-auto"/></button>
                        <button className="flex-1 p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Printer size={18} className="mx-auto"/></button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
export default SuccessModal;
