import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Trash2, Layers, MapPin, RefreshCcw, Loader2, ChevronLeft, ChevronRight, 
    User, Clock, ShieldCheck, Phone, Database, Home, Ban, Lock, CheckCircle2,
    TrendingUp, Activity, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const D2DCollectionLogs = () => {
    const [summary, setSummary] = useState([]);
    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCircle, setSelectedCircle] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);
    const [liveLogs, setLiveLogs] = useState([]); // Real-time feed

    const tenantId = localStorage.getItem('tenantId');

    const fetchData = async () => {
        try {
            const [sumRes, circRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/d2d-command/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`)
            ]);
            setSummary(sumRes.data.data || []);
            setCircles(circRes.data.data || []);
            
            // Mocking live logs from summary for UI feel
            const mockLogs = (sumRes.data.data || []).slice(0, 5).map(item => ({
                id: Math.random(),
                ward: item.ward_no,
                time: new Date().toLocaleTimeString(),
                type: Math.random() > 0.5 ? 'Wet Waste' : 'Dry Waste'
            }));
            setLiveLogs(mockLogs);

        } catch (err) { 
            toast.error("Database Sync Error"); 
        } finally { 
            setLoading(false); 
        }
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
            <div className="p-4 space-y-6 text-left bg-[#f8fafc] min-h-screen font-sans">
                
                {/* --- 1. TOP SMART HEADER --- */}
                <header className="flex flex-col lg:flex-row justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                            <Activity size={28} className="animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">D2D COMMAND CENTER</h1>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em]">Monitoring {filtered.length} Live Wards</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:min-w-[250px]">
                            <select 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs uppercase outline-none focus:ring-4 focus:ring-emerald-500/10 appearance-none transition-all cursor-pointer"
                                value={selectedCircle}
                                onChange={(e) => { setSelectedCircle(e.target.value); setActiveIdx(0); }}
                            >
                                <option value="">Global Coverage (All Circles)</option>
                                {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                            </select>
                            <Layers className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                        </div>
                        <button onClick={fetchData} className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                {/* --- 2. QUICK STATS ROW --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Home className="text-blue-500"/>} label="Total Houses" value={current?.total_hhd || 0} />
                    <StatCard icon={<CheckCircle2 className="text-emerald-500"/>} label="Scanned Today" value={(current?.dry_count || 0) + (current?.wet_count || 0)} />
                    <StatCard icon={<Lock className="text-amber-500"/>} label="Locked Houses" value={current?.locked || 0} color="amber" />
                    <StatCard icon={<TrendingUp className="text-purple-500"/>} label="Avg Efficiency" value={`${Math.round(((current?.dry_count || 0) / (current?.total_hhd || 1)) * 100)}%`} />
                </div>

                {/* --- 3. MAIN DISPLAY SECTION --- */}
                {loading ? (
                    <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={48}/></div>
                ) : current ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* LEFT: 3D Visualization (8 Columns) */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10"><Trash2 size={120}/></div>
                                
                                <div className="flex flex-col items-center mb-10">
                                    <div className="bg-slate-900 text-white px-6 py-2 rounded-full font-black text-sm mb-2 shadow-xl italic tracking-widest">
                                        WARD SEC- {current.ward_no}
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{current.ward_name}</h2>
                                    <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 transition-all duration-1000" 
                                            style={{ width: `${(current.dry_count / current.total_hhd) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-12 items-center justify-center py-6">
                                    <RealisticPopUpBin count={current.dry_count} total={current.total_hhd} color="#3b82f6" type="DRY WASTE" lastScan={current.last_scan} />
                                    <RealisticPopUpBin count={current.wet_count} total={current.total_hhd} color="#10b981" type="WET WASTE" lastScan={current.last_scan} />
                                </div>

                                {/* NAVIGATION PAGER */}
                                <div className="flex justify-center items-center gap-6 mt-10">
                                    <button onClick={() => setActiveIdx(p => Math.max(0, p-1))} disabled={activeIdx === 0} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-lg disabled:opacity-20 transition-all cursor-pointer"><ChevronLeft/></button>
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Ward {activeIdx + 1} of {filtered.length}</div>
                                    <button onClick={() => setActiveIdx(p => Math.min(filtered.length-1, p+1))} disabled={activeIdx === filtered.length - 1} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-lg disabled:opacity-20 transition-all cursor-pointer"><ChevronRight/></button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Live Feed & Personnel (4 Columns) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Personnel Card */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl">
                                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Users size={14}/> On-Field Team
                                </h3>
                                <div className="space-y-4">
                                    <PersonItem name={current.staff_name} role="Lead Collector" phone={current.staff_mobile} />
                                    <div className="h-px bg-white/10" />
                                    <PersonItem name={current.ins_name} role="Area Inspector" phone={current.ins_mobile} isInspector />
                                </div>
                            </div>

                            {/* Live Activity Feed */}
                            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm h-[400px] flex flex-col">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Activity size={14}/> Live Activity Feed
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {liveLogs.map((log) => (
                                        <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px]">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <MapPin size={14} className="text-emerald-500"/>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-700">QR Scanned in Ward {log.ward}</p>
                                                <p className="text-slate-400 font-medium">{log.type} collected</p>
                                            </div>
                                            <div className="text-[9px] font-black text-slate-400 bg-white px-2 py-1 rounded-lg">{log.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-40 text-center text-slate-300 font-black uppercase text-xl border-4 border-dashed rounded-[60px] mx-10 bg-white">
                        <Database size={60} className="mx-auto mb-4 opacity-20"/>
                        No Collection Data Available for this Circle
                    </div>
                )}
            </div>
        </CityLayout>
    );
};

// --- Sub-Components for Clean Code ---

const StatCard = ({ icon, label, value, color = "blue" }) => (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center`}>{icon}</div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{label}</p>
            <p className="text-xl font-black text-slate-800">{value}</p>
        </div>
    </div>
);

const PersonItem = ({ name, role, phone, isInspector }) => (
    <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isInspector ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white'}`}>
            {isInspector ? <ShieldCheck size={20}/> : <User size={20}/>}
        </div>
        <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{role}</p>
            <p className="font-black text-sm truncate">{name || 'Not Assigned'}</p>
            <p className="text-[10px] font-bold text-white/60 flex items-center gap-1 mt-0.5 hover:text-emerald-400 cursor-pointer transition-colors">
                <Phone size={10}/> {phone || '---'}
            </p>
        </div>
    </div>
);

const RealisticPopUpBin = ({ count, total, color, type, lastScan }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div style={{ perspective: '1200px' }} className="flex flex-col items-center">
            <div className="mb-6 text-center">
                <span style={{ color }} className="font-black text-[11px] uppercase tracking-[0.3em] block mb-1">{type}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Capacity Status</span>
            </div>
            
            <motion.div 
                className="relative w-64 h-80 group cursor-pointer"
                initial="initial"
                whileHover="hover"
            >
                {/* BIN BODY (INNER) */}
                <div 
                    style={{ backgroundColor: '#fdfdfd', borderColor: color }}
                    className="absolute top-6 inset-x-0 h-72 rounded-t-lg rounded-b-[60px] border-x-[12px] border-b-[20px] z-10 shadow-inner"
                />

                {/* INFO CARD (POPS UP) */}
                <motion.div 
                    variants={{
                        initial: { y: 20, opacity: 0, scale: 0.9 },
                        hover: { y: -160, opacity: 1, scale: 1 }
                    }}
                    className="absolute inset-x-2 top-0 bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 z-20 text-center"
                >
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Last Update</p>
                    <p className="text-xs font-black text-slate-800 mb-4">{lastScan ? new Date(lastScan).toLocaleTimeString() : 'Awaiting Data'}</p>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase bg-slate-50 p-3 rounded-2xl">
                        <span className="text-slate-400">Target</span>
                        <span className="text-slate-800">{total}</span>
                    </div>
                </motion.div>

                {/* BIN FRONT WALL */}
                <div 
                    style={{ borderColor: color, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}
                    className="absolute top-6 inset-x-0 h-72 rounded-t-lg rounded-b-[60px] border-x-[12px] border-b-[20px] z-30 shadow-xl flex flex-col items-center justify-center"
                >
                    <div className="text-4xl font-black mb-1" style={{ color }}>{percentage}%</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filled</div>
                    
                    {/* Visual Progress inside Bin */}
                    <div className="absolute bottom-6 inset-x-6 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                        />
                    </div>
                </div>

                {/* BIN LID */}
                <motion.div 
                    style={{ backgroundColor: color, transformOrigin: 'top' }}
                    variants={{
                        initial: { rotateX: 0 },
                        hover: { rotateX: -115, transition: { type: 'spring', stiffness: 120 } }
                    }}
                    className="absolute top-0 inset-x-0 h-12 rounded-t-[40px] z-[35] shadow-xl flex items-center justify-center border-b-4 border-black/5"
                >
                    <div className="w-14 h-1.5 bg-white/30 rounded-full" />
                </motion.div>

                <div className="absolute -bottom-6 inset-x-12 h-4 bg-slate-900/5 rounded-full blur-xl" />
            </motion.div>
        </div>
    );
};

export default D2DCollectionLogs;
