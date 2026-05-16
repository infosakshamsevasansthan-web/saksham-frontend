import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Trash2, Layers, RefreshCcw, Loader2, ChevronLeft, ChevronRight, 
    User, ShieldCheck, Phone, CheckCircle2, AlertTriangle, TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';
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
        setLoading(true);
        try {
            // 1. Working API (Circles)
            const circRes = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`);
            setCircles(circRes.data.data || []);

            // 2. D2D API (Handling 404 Error gracefully)
            try {
                const sumRes = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/d2d-command/${tenantId}`);
                setSummary(sumRes.data.data || []);
            } catch (err) {
                console.warn("Backend API 404: Using Mock Data for UI presentation");
                // 🔥 MOCK DATA: Jab tak backend thik nahi hota, ye logic dikhega
                setSummary([
                    {
                        ward_no: "01", ward_name: "Gandhi Nagar", total_hhd: 450, dry_count: 320, wet_count: 280,
                        staff_name: "Rahul Kumar", staff_mobile: "9876543210", ins_name: "Amit Singh", ins_mobile: "8877665544",
                        last_scan: new Date().toISOString(), circle_id: "1"
                    },
                    {
                        ward_no: "12", ward_name: "Shanti Kunj", total_hhd: 600, dry_count: 150, wet_count: 145,
                        staff_name: "Suresh Pal", staff_mobile: "9988776655", ins_name: "Amit Singh", ins_mobile: "8877665544",
                        last_scan: new Date().toISOString(), circle_id: "2"
                    }
                ]);
            }
        } catch (err) {
            toast.error("Network Error: Backend is down");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tenantId]);

    const filtered = summary.filter(w => selectedCircle ? w.circle_id == selectedCircle : true);
    const current = filtered[activeIdx];

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-6 space-y-6 bg-[#f8fafc] min-h-screen">
                
                {/* --- PRO HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 animate-pulse">
                            <CheckCircle2 size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">D2D MONITORING</h1>
                            <p className="text-emerald-500 font-bold text-[9px] uppercase tracking-[0.3em]">Live QR Scan Intelligence</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <select 
                            className="pl-5 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs uppercase focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none"
                            value={selectedCircle}
                            onChange={(e) => { setSelectedCircle(e.target.value); setActiveIdx(0); }}
                        >
                            <option value="">Filter By Circle (अंचल)</option>
                            {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                        </select>
                        <button onClick={fetchData} className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg active:scale-90 transition-all">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                {/* --- BEST UI LOGIC: 3D D2D BINS --- */}
                {loading && summary.length === 0 ? (
                    <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={50}/></div>
                ) : current ? (
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <div className="bg-slate-900 text-white px-8 py-3 rounded-full flex items-center gap-4 shadow-2xl">
                                <span className="bg-emerald-500 text-slate-900 px-3 py-1 rounded-lg font-black text-xs">WARD {current.ward_no}</span>
                                <span className="font-black text-lg uppercase tracking-tight">{current.ward_name}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto py-10">
                            <D2DBin type="DRY" count={current.dry_count} total={current.total_hhd} color="#3b82f6" data={current} />
                            <D2DBin type="WET" count={current.wet_count} total={current.total_hhd} color="#10b981" data={current} />
                        </div>

                        {/* PAGER */}
                        <div className="flex justify-center items-center gap-6">
                            <button onClick={() => setActiveIdx(p => Math.max(0, p-1))} disabled={activeIdx === 0} className="p-5 bg-white rounded-3xl shadow-lg border border-slate-100 disabled:opacity-20"><ChevronLeft/></button>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Record {activeIdx + 1} / {filtered.length}</div>
                            <button onClick={() => setActiveIdx(p => Math.min(filtered.length-1, p+1))} disabled={activeIdx === filtered.length - 1} className="p-5 bg-white rounded-3xl shadow-lg border border-slate-100 disabled:opacity-20"><ChevronRight/></button>
                        </div>
                    </div>
                ) : (
                    <div className="py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 text-center">
                         <AlertTriangle size={50} className="mx-auto text-amber-400 mb-4" />
                         <p className="text-slate-300 font-black text-xl uppercase italic">Database Sync Error - Check Backend Routes</p>
                    </div>
                )}
            </div>
        </CityLayout>
    );
};

const D2DBin = ({ type, count, total, color, data }) => {
    const perc = Math.round((count / total) * 100) || 0;
    return (
        <div className="flex flex-col items-center">
            <h4 style={{ color }} className="font-black text-xs uppercase tracking-[0.5em] mb-10">{type} WASTE PROGRESS</h4>
            
            <motion.div 
                className="relative w-72 h-[380px] cursor-pointer"
                style={{ perspective: '1200px' }}
                whileHover="hover"
            >
                {/* 1. LIQUID FILL EFFECT (Logic) */}
                <div className="absolute inset-x-4 bottom-8 top-8 bg-slate-50 rounded-t-lg rounded-b-[70px] overflow-hidden z-0">
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${perc}%` }}
                        style={{ backgroundColor: color }}
                        className="absolute bottom-0 inset-x-0 opacity-20 transition-all duration-[2000ms]"
                    />
                </div>

                {/* 2. DATA POP-UP CARD */}
                <motion.div 
                    variants={{ initial: { y: 30, opacity: 0 }, hover: { y: -160, opacity: 1 } }}
                    className="absolute inset-x-4 top-0 bg-white p-6 rounded-[2.5rem] shadow-2xl border-2 border-slate-50 z-20 text-left"
                >
                    <div className="bg-slate-50 p-3 rounded-2xl mb-4 flex justify-between items-center border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Efficiency</span>
                        <span style={{ color }} className="text-lg font-black">{perc}%</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-500"><span>Target:</span> <span>{total} HH</span></div>
                        <div className="flex justify-between text-xs font-black text-slate-800"><span>Collected:</span> <span style={{ color }}>{count} HH</span></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 text-[8px] font-bold text-slate-400 text-center uppercase tracking-widest">
                        Sync: {new Date(data.last_scan).toLocaleTimeString()}
                    </div>
                </motion.div>

                {/* 3. FRONT WALL (Personnel Info) */}
                <div 
                    className="absolute top-6 inset-x-0 h-80 rounded-t-lg rounded-b-[80px] border-x-[14px] border-b-[24px] z-30 shadow-2xl bg-white/80 flex flex-col p-6"
                    style={{ borderColor: color }}
                >
                    <div className="flex-1 space-y-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1"><User size={10}/> Field Collector</p>
                            <p className="text-xs font-black text-slate-800 uppercase truncate">{data.staff_name || 'Unassigned'}</p>
                            <p className="text-[9px] font-bold text-emerald-600 mt-1 flex items-center gap-1"><Phone size={8}/> {data.staff_mobile}</p>
                        </div>
                        <div className="bg-slate-900 p-4 rounded-2xl shadow-inner">
                            <p className="text-[8px] font-black text-emerald-400 uppercase mb-1 flex items-center gap-1"><ShieldCheck size={10}/> Monitor</p>
                            <p className="text-xs font-black text-white uppercase truncate">{data.ins_name}</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="inline-block px-4 py-1 rounded-full bg-slate-50 font-black text-xl mb-2" style={{ color }}>{perc}%</div>
                    </div>
                </div>

                {/* 4. LID */}
                <motion.div 
                    variants={{ initial: { rotateX: 0 }, hover: { rotateX: -110 } }}
                    style={{ backgroundColor: color, transformOrigin: 'top' }}
                    className="absolute top-0 inset-x-0 h-14 rounded-t-[50px] z-[40] shadow-xl flex items-center justify-center border-b-8 border-black/5"
                >
                    <div className="w-16 h-2 bg-white/30 rounded-full" />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default D2DCollectionLogs;
