import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Trash2, Layers, MapPin, RefreshCcw, Loader2, ChevronLeft, ChevronRight, User, Clock, ShieldCheck, Phone, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const D2DCollectionLogs = () => {
    const [summary, setSummary] = useState([]);
    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCircle, setSelectedCircle] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);

    const tenantId = localStorage.getItem('tenantId');

    const fetchData = async () => {
        try {
            const [sumRes, circRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/d2d-command/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`)
            ]);
            setSummary(sumRes.data.data || []);
            setCircles(circRes.data.data || []);
        } catch (err) { toast.error("Database Sync Error"); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [tenantId]);

    const filtered = summary.filter(w => selectedCircle ? w.circle_id == selectedCircle : true);
    const current = filtered[activeIdx];

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left bg-slate-50 min-h-screen">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase italic">Collection Control Center</h1>
                            <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest mt-1">Live Personnel & Load Tracking</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative min-w-[200px]">
                            <select 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-[10px] uppercase outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                                value={selectedCircle}
                                onChange={(e) => { setSelectedCircle(e.target.value); setActiveIdx(0); }}
                            >
                                <option value="">Filter by Circle (अंचल)</option>
                                {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                            </select>
                            <Layers className="absolute left-3 top-3.5 text-slate-400" size={16}/>
                        </div>
                        <button onClick={fetchData} className="p-3 bg-slate-900 text-white rounded-xl shadow-lg active:scale-95 transition-all">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                {/* --- MAIN DISPLAY --- */}
                {loading ? (
                    <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></div>
                ) : current ? (
                    <div className="space-y-8">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-4 bg-white px-8 py-3 rounded-full shadow-lg border border-slate-100">
                                <span className="bg-slate-900 text-emerald-400 px-4 py-1.5 rounded-xl font-black text-xl italic shadow-inner">WARD #{current.ward_no}</span>
                                <h2 className="text-xl font-black text-slate-700 uppercase tracking-tighter">{current.ward_name}</h2>
                            </div>
                        </div>

                        {/* 🟢 3D BINS ROW --- */}
                        <div className="flex flex-col lg:flex-row gap-20 items-center justify-center max-w-6xl mx-auto py-10">
                            <RealisticPopUpBin data={current} count={current.dry_count} color="#3b82f6" type="DRY" />
                            <RealisticPopUpBin data={current} count={current.wet_count} color="#10b981" type="WET" />
                        </div>

                        {/* --- PAGER --- */}
                        <div className="flex justify-center items-center gap-10 pt-10">
                            <button onClick={() => setActiveIdx(p => Math.max(0, p-1))} disabled={activeIdx === 0} className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100 hover:bg-emerald-50 disabled:opacity-20 active:scale-90 transition-all"><ChevronLeft size={24}/></button>
                            <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">WARD {activeIdx + 1} OF {filtered.length}</div>
                            <button onClick={() => setActiveIdx(p => Math.min(filtered.length-1, p+1))} disabled={activeIdx === filtered.length - 1} className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100 disabled:opacity-20 active:scale-90 transition-all"><ChevronRight size={24}/></button>
                        </div>
                    </div>
                ) : (
                    <div className="py-40 text-center text-slate-300 font-black uppercase text-xl border-2 border-dashed rounded-[60px] mx-10">No Ward Data Available</div>
                )}
            </div>
        </CityLayout>
    );
};

// --- 🟢 UPDATED: REALISTIC SANDWICH 3D BIN WITH PERSONNEL INFO ---
const RealisticPopUpBin = ({ data, count, color, type }) => {
    const total = data.total_hhd || 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div style={{ perspective: '1500px' }} className="flex flex-col items-center">
            <h4 style={{ color: color }} className="font-black text-[10px] uppercase tracking-[0.4em] mb-12">{type} WASTE BIN</h4>
            
            <motion.div 
                className="relative w-72 h-[320px] group cursor-pointer"
                initial="initial"
                whileHover="hover"
            >
                {/* 1. BACK WALL OF BIN (z-10) */}
                <div 
                    style={{ backgroundColor: '#f8fafc', borderColor: color }}
                    className="absolute top-6 inset-x-0 h-80 rounded-t-lg rounded-b-[80px] border-x-[12px] border-b-[24px] z-10 shadow-inner"
                />

                {/* 2. DATA CARD (Sandwiched - z-20) */}
                <motion.div 
                    variants={{
                        initial: { y: 40, opacity: 0 },
                        hover: { y: -180, opacity: 1 }
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="absolute inset-x-4 top-0 bg-white p-5 rounded-[30px] shadow-2xl border-2 border-slate-100 z-20 text-left"
                >
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl mb-4">
                         <span className="text-[9px] font-black text-slate-400 uppercase">Target Houses</span>
                         <span className="text-sm font-black text-slate-800">{total}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border-2 border-dashed" style={{ borderColor: color }}>
                         <span className="text-[9px] font-black text-slate-400 uppercase">Collected</span>
                         <span className="text-lg font-black" style={{ color: color }}>{count}</span>
                    </div>
                    <p className="text-[8px] font-bold text-slate-300 uppercase mt-4 text-center">Sync Time: {data.last_scan ? new Date(data.last_scan).toLocaleTimeString() : 'Waiting'}</p>
                </motion.div>

                {/* 3. FRONT WALL OF BIN (z-30 - With Personnel Info) */}
                <div 
                    style={{ borderColor: color, background: 'linear-gradient(to bottom, #ffffff 0%, #f1f5f9 100%)' }}
                    className="absolute top-6 inset-x-0 h-80 rounded-t-lg rounded-b-[80px] border-x-[12px] border-b-[24px] z-30 shadow-xl flex flex-col p-6 text-left"
                >
                    <div className="absolute top-0 inset-x-0 h-3 bg-black/5 blur-[1px]" />
                    
                    {/* Chhota Percentage Display */}
                    <div className="flex justify-center mb-6">
                        <span style={{ backgroundColor: color }} className="px-4 py-1 rounded-full text-[10px] font-black text-white shadow-lg uppercase tracking-widest">{percentage}% DONE</span>
                    </div>

                    {/* Personnel Details on Bin Front */}
                    <div className="space-y-2 pt-2">
                        {/* 1. Collector Section */}
                        <div className="bg-white/60 p-3 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[7px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><User size={10}/> Collector</p>
                            <p className="text-[11px] font-black text-slate-800 uppercase truncate">{data.staff_name || 'NOT ASSIGNED'}</p>
                            <p className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 mt-1"><Phone size={8}/> {data.staff_mobile || '---'}</p>
                        </div>

                        {/* 2. Inspector Section */}
                        <div className="bg-white-900 p-3 rounded-2xl shadow-lg relative overflow-hidden">
                            <ShieldCheck size={40} className="absolute -right-2 -bottom-2 text-white/5" />
                            <p className="text-[7px] font-black text-emerald-400 uppercase mb-1 flex items-center gap-1">Inspector</p>
                            <p className="text-[11px] font-black text-white uppercase truncate">{data.ins_name || 'NO INSPECTOR'}</p>
                            <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-1"><Phone size={8}/> {data.ins_mobile || '---'}</p>
                        </div>
                    </div>
                </div>

                {/* 4. LID (Dhakkan - z-35) */}
                <motion.div 
                    style={{ backgroundColor: color, transformOrigin: 'top' }}
                    variants={{
                        initial: { rotateX: 0 },
                        hover: { rotateX: -110 }
                    }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="absolute top-0 inset-x-0 h-12 rounded-t-[45px] z-[35] shadow-xl flex items-center justify-center border-b-8 border-black/10"
                >
                    <div className="w-16 h-1.5 bg-white/20 rounded-full" />
                </motion.div>

                <div className="absolute -bottom-10 inset-x-10 h-6 bg-black/5 rounded-full blur-xl opacity-40" />
            </motion.div>
        </div>
    );
};

export default D2DCollectionLogs;