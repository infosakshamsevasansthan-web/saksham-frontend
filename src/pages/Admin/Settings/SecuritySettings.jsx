import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogOut, Clock, Smartphone, ShieldAlert, Cpu, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SecuritySettings = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState("Checking...");
    const loginTime = localStorage.getItem('loginTime') || new Date().toLocaleTimeString();

    useEffect(() => {
        const timer = setInterval(() => {
            const token = localStorage.getItem('token');
            if (!token) return;

            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000;
            const now = Date.now();
            const diff = expiry - now;

            if (diff <= 0) {
                handleLogout(); // 🔥 Logic: Time khatam toh turant logout
            } else {
                // Format: HH:MM:SS
                const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
                const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                setTimeLeft(`${hours}:${mins}:${secs}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
        toast.error("Session Expired - Terminated");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 text-left font-sans">
            
            {/* --- 🛡️ ACTIVE SESSION COMMAND --- */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[45px] shadow-2xl border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-all text-emerald-600"><ShieldCheck size={150}/></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic">Session Life-Cycle</h3>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Automatic Destruction Timer</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Login Details */}
                        <div className="flex justify-between items-center bg-slate-50 p-5 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <Clock className="text-slate-400" size={18} />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Logged in at</p>
                                    <p className="text-sm font-bold text-slate-700">{loginTime}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-emerald-500 uppercase">State</p>
                                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Authorized</p>
                            </div>
                        </div>

                        {/* Asli Auto-Logout Timer UI */}
                        <div className="bg-slate-950 p-7 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-emerald-500">
                            <div className="flex justify-between items-end">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                       <Timer size={12} className="animate-pulse" /> Self-Destruct In
                                    </p>
                                    <h4 className="text-4xl font-black font-mono tracking-tighter">{timeLeft}</h4>
                                </div>
                                <button onClick={handleLogout} className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 transition-all">
                                    <LogOut size={14} /> Kill Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- 🔐 MASTER SECURITY POLICY --- */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900 rounded-[45px] p-8 text-white relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 opacity-5 text-white"><ShieldAlert size={250}/></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic">Security Matrix</h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Advanced Protection Layers</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <SecurityRow label="AES-256 Bit Encryption" active={true} />
                        <SecurityRow label="Automatic Token Rotation" active={true} />
                        <SecurityRow label="Unauthorized IP Lock" active={false} />
                        <SecurityRow label="Force SSL Termination" active={true} />
                    </div>

                    <div className="mt-10 p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all">
                        <div className="p-3 bg-emerald-500 rounded-xl text-slate-900 shadow-lg shadow-emerald-500/20">
                            <Cpu size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Master Control</p>
                            <p className="text-[10px] font-bold text-slate-400">View detailed security audit logs</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const SecurityRow = ({ label, active }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
        <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight">{label}</span>
        <div className={`w-8 h-4 rounded-full relative transition-all ${active ? 'bg-emerald-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
        </div>
    </div>
);

export default SecuritySettings;
