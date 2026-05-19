import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, LogOut, Clock, Globe, Smartphone, ShieldAlert, Cpu, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SessionHub = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState("08:00:00");
    const loginTime = localStorage.getItem('loginTime') || new Date().toLocaleTimeString();

    // Logout Function
    const handleLogout = () => {
        localStorage.clear();
        toast.success("Sessions Terminated Safely");
        navigate('/login');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 text-left">
            
            {/* --- 🛡️ ACTIVE SESSION CARD --- */}
            <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[45px] shadow-2xl border border-slate-100 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-all text-emerald-600"><ShieldCheck size={150}/></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic">Active Session</h3>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Current Device Authorization</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <Clock className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Login Timestamp</p>
                                    <p className="text-sm font-bold text-slate-700">{loginTime}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-emerald-500 uppercase">Status</p>
                                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Verified Link</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Session Auto-Expiry</p>
                                <h4 className="text-2xl font-black font-mono">{timeLeft}</h4>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 transition-all active:scale-95"
                            >
                                <LogOut size={14} /> Terminate
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- 🔐 SECURITY PROTOCOLS CARD --- */}
            <motion.div 
                whileHover={{ y: -5 }}
                className="bg-slate-50 p-8 rounded-[45px] border border-slate-200 relative overflow-hidden"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase italic">Security Shield</h3>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Access Control Policies</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <SecurityToggle label="Two-Factor Authentication" active={true} />
                    <SecurityToggle label="Login Alert (Telegram)" active={true} />
                    <SecurityToggle label="IP-Whitelisting (Geo-Lock)" active={false} />
                </div>

                <div className="mt-8 p-5 bg-white rounded-3xl border border-slate-200 flex items-center gap-4 group cursor-pointer hover:border-emerald-500 transition-all">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Lock size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-800 uppercase">Change Master Password</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Update encryption keys</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const SecurityToggle = ({ label, active }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{label}</span>
        <div className={`w-10 h-5 rounded-full relative ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
        </div>
    </div>
);

export default SessionHub;
