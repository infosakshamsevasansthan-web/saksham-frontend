import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Clock, User, Search, X, Loader2, ChevronRight, 
    Calendar, MapPin, Camera, UserCheck, UserX, UserMinus, 
    Filter, RefreshCcw, ExternalLink, Award
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
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default Today
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925";

    // 🟢 IST Precision Formatting
    const formatIST = (dateStr, type = 'time') => {
        if (!dateStr) return '--:--';
        const date = new Date(dateStr);
        if (type === 'time') return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            // Hum selectedDate ke hisaab se data mangenge
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/attendance/report/${tenantId}?date=${selectedDate}`);
            setRoster(res.data.data || []);
        } catch (err) { toast.error("Sync Failed"); }
        finally { setLoading(false); setIsRefreshing(false); }
    };

    const fetchStaffHistory = async (staff) => {
        setSelectedStaff(staff);
        setHistory([]);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/attendance/history/${staff.id}`);
            setHistory(res.data.data || []);
        } catch (err) { toast.error("History loading error"); }
    };

    useEffect(() => { fetchData(); }, [tenantId, selectedDate]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Present': return 'bg-emerald-500 text-white shadow-lg shadow-emerald-200';
            case 'Absent': return 'bg-rose-500 text-white shadow-lg shadow-rose-200';
            case 'Leave': return 'bg-blue-500 text-white shadow-lg shadow-blue-200';
            default: return 'bg-slate-300 text-white';
        }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-[#f8fafc] min-h-screen">
                
                {/* 🟢 PREMIUM STATS HEADER */}
                <header className="bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-5%] opacity-10 text-white rotate-12"><Clock size={250}/></div>
                    
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/40 animate-pulse">
                                <Clock size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Attendance Log</h1>
                                <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Real-time Personnel Tracking Node</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            <StatChip icon={UserCheck} label="Present" count={roster.filter(r => r.status === 'Present').length} color="emerald" />
                            <StatChip icon={UserX} label="Absent" count={roster.filter(r => r.status === 'Absent').length} color="rose" />
                            <StatChip icon={UserMinus} label="Leave" count={roster.filter(r => r.status === 'Leave').length} color="blue" />
                            <button onClick={fetchData} className="w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all border border-white/10">
                                <RefreshCcw size={22} className={isRefreshing ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* 🟢 FILTERS & SEARCH */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20}/>
                        <input 
                            type="text" 
                            placeholder="Search by Personnel Name, Employee ID or Role..." 
                            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[25px] font-bold text-sm text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="lg:col-span-4 flex gap-3">
                        <div className="flex-1 bg-white border border-slate-200 rounded-[25px] flex items-center px-5 shadow-sm">
                            <Calendar size={18} className="text-slate-400 mr-3" />
                            <input 
                                type="date" 
                                value={selectedDate}
                                className="w-full bg-transparent py-4 font-black text-xs text-slate-700 outline-none"
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 🟢 MAIN LOG TABLE */}
                <div className="bg-white rounded-[45px] border border-slate-200 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="p-6">Staff Information</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6">Last Log (IST)</th>
                                    <th className="p-6">GPS Verification</th>
                                    <th className="p-6 text-center">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr>
                                ) : roster.length === 0 ? (
                                    <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold uppercase">No Attendance records for this date</td></tr>
                                ) : roster.filter(r => r.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())).map((r) => (
                                    <tr key={r.id} onClick={() => fetchStaffHistory(r)} className="hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 shadow-inner group-hover:bg-white group-hover:scale-110 transition-all uppercase">
                                                    {r.full_name_en.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-[13px] uppercase leading-none">{r.full_name_en}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Emp ID: {r.employee_id} • {r.role_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${getStatusStyle(r.status)}`}>
                                                {r.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-6 font-black text-xs text-slate-700">
                                            {formatIST(r.check_in)}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-600 transition-colors font-bold text-[10px] uppercase">
                                                <MapPin size={14}/> {r.in_lat ? 'Verified' : 'Manual'}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="p-3 bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white rounded-2xl transition-all shadow-inner">
                                                <ChevronRight size={18}/>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- 🟢 DRILLDOWN HISTORY & SELFIE DRAWER --- */}
            <AnimatePresence>
                {selectedStaff && (
                    <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStaff(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000]" />
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-[1001] flex flex-col">
                        
                        <div className="p-8 bg-slate-900 flex justify-between items-center text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">{selectedStaff.full_name_en.charAt(0)}</div>
                                <div>
                                    <h2 className="text-lg font-black uppercase italic leading-none">{selectedStaff.full_name_en}</h2>
                                    <p className="text-emerald-400 font-bold text-[10px] uppercase mt-2 tracking-widest flex items-center gap-2">
                                        <Award size={12}/> Verified Personnel
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStaff(null)} className="w-12 h-12 bg-white/10 hover:bg-rose-500 rounded-2xl flex items-center justify-center transition-all"><X size={24}/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#fbfcfd] custom-scrollbar">
                            {/* Analytics Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Month Attendance</p>
                                    <p className="text-2xl font-black text-slate-800">26 <span className="text-xs text-slate-400 uppercase font-bold">Days</span></p>
                                </div>
                                <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 shadow-inner text-center">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase mb-2">Performance</p>
                                    <p className="text-2xl font-black text-emerald-700">98%</p>
                                </div>
                            </div>

                            {/* Verification Timeline */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2 mb-4">
                                    <CalendarRange size={16} className="text-emerald-500" /> Duty History & Proofs
                                </h3>
                                
                                {history.length === 0 ? <p className="text-center py-10 opacity-30 uppercase font-black text-xs">No records found</p> : 
                                history.map((log) => (
                                    <div key={log.id} className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm space-y-6 group hover:shadow-xl transition-all border-l-4 border-l-emerald-500">
                                        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                                            <p className="text-sm font-black text-slate-800 uppercase italic flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-300"/> {formatIST(log.duty_date, 'date')}
                                            </p>
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-sm ${getStatusStyle(log.status)}`}>{log.status}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            {/* In-Punch */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">Check-In Selfie</span>
                                                    <span className="text-[10px] font-black text-emerald-600">{formatIST(log.check_in)}</span>
                                                </div>
                                                <div className="aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden border-2 border-white shadow-md relative group/img">
                                                    {log.selfie_in ? (
                                                        <img src={log.selfie_in} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" alt="Selfie In" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20 text-slate-400">
                                                            <Camera size={32}/><span className="text-[8px] font-bold">MISSING</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md p-2 rounded-lg text-white">
                                                        <MapPin size={10} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Out-Punch */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">Check-Out Selfie</span>
                                                    <span className="text-[10px] font-black text-rose-600">{formatIST(log.check_out)}</span>
                                                </div>
                                                <div className="aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden border-2 border-white shadow-md relative group/img">
                                                    {log.selfie_out ? (
                                                        <img src={log.selfie_out} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" alt="Selfie Out" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20 text-slate-400">
                                                            <Camera size={32}/><span className="text-[8px] font-bold">MISSING</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md p-2 rounded-lg text-white">
                                                        <MapPin size={10} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-2 flex justify-center">
                                            <button className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase hover:text-emerald-500 transition-colors">
                                                <ExternalLink size={12}/> View Detailed Tracking Log
                                            </button>
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

// 🟢 INTERNAL UI COMPONENTS
const StatChip = ({ icon: Icon, label, count, color }) => (
    <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4 min-w-[140px] shadow-inner">
        <div className={`p-3 bg-${color}-500/20 text-${color}-400 rounded-2xl`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[9px] font-black text-white/40 uppercase leading-none mb-1.5">{label}</p>
            <p className="text-2xl font-black text-white leading-none">{count}</p>
        </div>
    </div>
);

export default AttendanceLog;
