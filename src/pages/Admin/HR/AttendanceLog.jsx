import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Clock, User, Search, X, Loader2, ChevronRight, 
    Calendar, MapPin, Camera, UserCheck, UserX, UserMinus, 
    Filter, RefreshCcw, ExternalLink, Award, CalendarRange,
    CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const AttendanceLog = () => {
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [history, setHistory] = useState([]);
    const [mainDate, setMainDate] = useState(new Date().toISOString().split('T')[0]);
    const [drawerFilterDate, setDrawerFilterDate] = useState(''); // 🟢 Drawer Date Filter
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925";

    // 🟢 Precision IST Timing Logic
    const formatIST = (dateStr, type = 'time') => {
        if (!dateStr) return '--:--';
        const date = new Date(dateStr);
        if (type === 'time') return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/attendance/report/${tenantId}?date=${mainDate}`);
            setRoster(res.data.data || []);
        } catch (err) { toast.error("Live Sync Failed"); }
        finally { setLoading(false); setIsRefreshing(false); }
    };

    const fetchStaffHistory = async (staff) => {
        setSelectedStaff(staff);
        setDrawerFilterDate(''); // Reset filter on new selection
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/attendance/history/${staff.id}`);
            setHistory(res.data.data || []);
        } catch (err) { toast.error("History retrieval failed"); }
    };

    useEffect(() => { fetchData(); }, [tenantId, mainDate]);

    // 🟢 Internal Filter for Drawer History
    const filteredHistory = history.filter(log => 
        !drawerFilterDate || log.duty_date.startsWith(drawerFilterDate)
    );

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-[#f8fafc] min-h-screen">
                
                {/* 🟢 TOP DASHBOARD HEADER */}
                <header className="bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-left border-b-4 border-emerald-500">
                    <div className="absolute top-[-10%] right-[-5%] opacity-5 text-white"><Clock size={280}/></div>
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                                <Clock size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Attendance Control</h1>
                                <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-1">Live Face-ID Verification Hub</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            <StatChip icon={UserCheck} label="Present" count={roster.filter(r => r.status === 'Present').length} color="emerald" />
                            <StatChip icon={UserX} label="Absent" count={roster.filter(r => r.status === 'Absent').length} color="rose" />
                            <StatChip icon={UserMinus} label="Leave" count={roster.filter(r => r.status === 'Leave').length} color="blue" />
                            <button onClick={fetchData} className="w-14 h-14 bg-white/10 hover:bg-emerald-500 rounded-2xl flex items-center justify-center transition-all border border-white/10">
                                <RefreshCcw size={22} className={isRefreshing ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* 🟢 MAIN PAGE FILTERS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                        <input type="text" placeholder="Search by name, ID or post..." className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[25px] font-bold text-sm shadow-sm outline-none focus:ring-4 ring-emerald-500/5 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[25px] flex items-center px-6 shadow-sm">
                        <Calendar size={18} className="text-emerald-500 mr-4" />
                        <input type="date" value={mainDate} className="w-full bg-transparent py-4 font-black text-xs text-slate-700 outline-none cursor-pointer" onChange={(e) => setMainDate(e.target.value)} />
                    </div>
                </div>

                {/* 🟢 STAFF LOG TABLE */}
                <div className="bg-white rounded-[45px] border border-slate-200 shadow-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr><th className="p-6">Personnel Information</th><th className="p-6">Verification</th><th className="p-6">IST Timestamp</th><th className="p-6 text-center">Inspect</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr> : 
                                roster.filter(r => r.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())).map((r) => (
                                <tr key={r.id} onClick={() => fetchStaffHistory(r)} className="hover:bg-emerald-50/20 cursor-pointer transition-all group">
                                    <td className="p-6 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-lg uppercase shadow-inner group-hover:bg-white transition-all">{r.full_name_en.charAt(0)}</div>
                                        <div><p className="font-black text-slate-800 text-[13px] uppercase leading-none">{r.full_name_en}</p><p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase">ID: {r.employee_id} • {r.role_name}</p></div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${r.status === 'Present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-300 text-white'}`}>{r.status || 'Pending'}</span>
                                    </td>
                                    <td className="p-6 font-black text-xs text-slate-600 italic">{formatIST(r.check_in)}</td>
                                    <td className="p-6 text-center"><div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner"><ChevronRight size={18} /></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 🟢 PLATINUM DETAIL DRAWER --- */}
            <AnimatePresence>
                {selectedStaff && (
                    <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStaff(null)} className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[1000]" />
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-[1001] flex flex-col overflow-hidden">
                        
                        {/* Drawer Header */}
                        <div className="p-8 bg-slate-900 flex justify-between items-center text-white border-b border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-emerald-500/30">{selectedStaff.full_name_en.charAt(0)}</div>
                                <div><h2 className="text-xl font-black uppercase italic leading-none">{selectedStaff.full_name_en}</h2><p className="text-emerald-400 font-bold text-[10px] uppercase mt-2 tracking-widest">Master Identity Record</p></div>
                            </div>
                            <button onClick={() => setSelectedStaff(null)} className="w-12 h-12 bg-white/10 hover:bg-rose-500 rounded-2xl flex items-center justify-center transition-all"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#fbfcfd] custom-scrollbar text-left">
                            {/* 1. Monthly Score Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex flex-col items-center">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3"><TrendingUp size={20}/></div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Score</p>
                                    <p className="text-2xl font-black text-slate-800">26 <span className="text-[10px] text-slate-400">Days</span></p>
                                </div>
                                <div className="bg-emerald-500 p-6 rounded-[35px] shadow-xl shadow-emerald-100 flex flex-col items-center">
                                    <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center mb-3"><Award size={20}/></div>
                                    <p className="text-[9px] font-black text-white/70 uppercase mb-1">Rating</p>
                                    <p className="text-2xl font-black text-white">98%</p>
                                </div>
                            </div>

                            {/* 2. 🟢 DRAWER CALENDAR FILTER */}
                            <div className="relative group">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-2 flex items-center gap-2">
                                    <Filter size={12}/> History Date Filter
                                </p>
                                <div className="relative">
                                    <CalendarRange className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                    <input 
                                        type="date" 
                                        value={drawerFilterDate}
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-xs text-slate-700 outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                                        onChange={(e) => setDrawerFilterDate(e.target.value)}
                                    />
                                    {drawerFilterDate && (
                                        <button onClick={() => setDrawerFilterDate('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 font-black text-xs">RESET</button>
                                    )}
                                </div>
                            </div>

                            {/* 3. VERIFICATION CARDS */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                                    <Camera size={16} className="text-emerald-500" /> Timeline & Proofs
                                </h3>
                                
                                {filteredHistory.length === 0 ? (
                                    <div className="py-20 text-center opacity-30 uppercase font-black text-xs tracking-widest flex flex-col items-center gap-4">
                                        <Calendar size={48} strokeWidth={1}/><p>No records for this date</p>
                                    </div>
                                ) : filteredHistory.map((log) => (
                                    <div key={log.id} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm space-y-6 border-l-4 border-l-emerald-500">
                                        <div className="flex justify-between items-center border-b pb-4">
                                            <p className="text-sm font-black text-slate-800 uppercase italic flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-300"/> {formatIST(log.duty_date, 'date')}
                                            </p>
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${log.status === 'Present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{log.status}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Check-In card */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 uppercase">Check-In</span><span className="text-[10px] font-black text-emerald-600">{formatIST(log.check_in)}</span></div>
                                                <div className="aspect-[3/4] bg-slate-50 rounded-3xl overflow-hidden border-2 border-white shadow-lg relative group/item">
                                                    {log.selfie_in ? <img src={log.selfie_in} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><User size={40}/></div>}
                                                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur p-2 rounded-lg text-white"><MapPin size={10}/></div>
                                                </div>
                                            </div>

                                            {/* Check-Out card */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 uppercase">Check-Out</span><span className="text-[10px] font-black text-rose-600">{formatIST(log.check_out)}</span></div>
                                                <div className="aspect-[3/4] bg-slate-50 rounded-3xl overflow-hidden border-2 border-white shadow-lg relative group/item">
                                                    {log.selfie_out ? <img src={log.selfie_out} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><User size={40}/></div>}
                                                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur p-2 rounded-lg text-white"><MapPin size={10}/></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                    </>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// 🟢 Platinum UI Stat Chip
const StatChip = ({ icon: Icon, label, count, color }) => (
    <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-5 min-w-[150px] shadow-inner transition-all hover:bg-white/10">
        <div className={`p-3 bg-${color}-500/20 text-${color}-400 rounded-2xl`}>
            <Icon size={22} />
        </div>
        <div>
            <p className="text-[9px] font-black text-white/50 uppercase leading-none mb-1.5 tracking-tighter">{label}</p>
            <p className="text-2xl font-black text-white leading-none">{count}</p>
        </div>
    </div>
);

export default AttendanceLog;
