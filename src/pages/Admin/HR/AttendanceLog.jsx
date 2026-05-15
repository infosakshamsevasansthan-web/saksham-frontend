import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Clock, User, Search, X, Loader2, ChevronRight, 
    CheckCircle2, AlertCircle, CalendarRange, MapPin, 
    RefreshCcw, UserCheck, UserX, UserMinus, Camera
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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const tenantId = localStorage.getItem('tenantId');

    // 🟢 IST Time Formatter (India Standard Time)
    const formatIST = (dateString, type = 'time') => {
        if(!dateString) return '--:--';
        const date = new Date(dateString);
        if(type === 'time') {
            return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const fetchTodayStatus = async () => {
        setIsRefreshing(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/attendance/today/${tenantId}`);
            setRoster(res.data.data || []);
        } catch (err) { 
            toast.error("Live Sync Failed"); 
        } finally { 
            setLoading(false); 
            setIsRefreshing(false); 
        }
    };

    const fetchStaffHistory = async (staff) => {
        setSelectedStaff(staff);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/attendance/history/${staff.id}`);
            setHistory(res.data.data || []);
        } catch (err) { toast.error("History loading error"); }
    };

    useEffect(() => { fetchTodayStatus(); }, [tenantId]);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Present': return 'bg-emerald-500 text-white shadow-emerald-200';
            case 'Absent': return 'bg-rose-500 text-white shadow-rose-200';
            case 'Leave': return 'bg-blue-500 text-white shadow-blue-200';
            default: return 'bg-slate-400 text-white shadow-slate-100';
        }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-slate-50/50 min-h-screen">
                
                {/* 🟢 PREMIUM HEADER */}
                <header className="flex flex-col lg:flex-row items-center justify-between bg-slate-900 p-8 rounded-[35px] shadow-2xl gap-6 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 opacity-10"><Clock size={200} strokeWidth={1} /></div>
                    
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">Live Attendance</h1>
                            <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest mt-1">Real-time Face-ID Tracking Engine</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 relative z-10">
                        <StatCard icon={UserCheck} label="Present" count={roster.filter(r => r.status === 'Present').length} color="emerald" />
                        <StatCard icon={UserX} label="Absent" count={roster.filter(r => r.status === 'Absent').length} color="rose" />
                        <StatCard icon={UserMinus} label="On Leave" count={roster.filter(r => r.status === 'Leave').length} color="blue" />
                        
                        <button onClick={fetchTodayStatus} className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all border border-white/10">
                            <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                {/* 🟢 SEARCH & FILTERS */}
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20}/>
                    <input 
                        type="text" 
                        placeholder="Type Name, Employee ID or Role to search..." 
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[25px] font-bold text-sm text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 🟢 LOG TABLE */}
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="p-6">Personnel Identity</th>
                                    <th className="p-6">Current Status</th>
                                    <th className="p-6">Last Log (IST)</th>
                                    <th className="p-6">Location</th>
                                    <th className="p-6 text-center">Profile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={48}/></td></tr>
                                ) : roster.length === 0 ? (
                                    <tr><td colSpan="5" className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No logs found for today</td></tr>
                                ) : roster.filter(r => r.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())).map((r) => (
                                    <tr key={r.id} onClick={() => fetchStaffHistory(r)} className="hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 text-lg group-hover:bg-white group-hover:shadow-md transition-all">
                                                    {r.full_name_en.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-[13px] uppercase leading-none">{r.full_name_en}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1.5 tracking-tighter">ID: {r.employee_id} • {r.role_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusStyle(r.status)}`}>
                                                {r.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Clock size={14} className="text-slate-300" />
                                                <p className="text-xs font-black">{formatIST(r.check_in)}</p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
                                                <MapPin size={14} />
                                                <span className="text-[10px] font-bold uppercase">View Point</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="p-3 bg-slate-50 group-hover:bg-emerald-500 group-hover:text-white rounded-2xl transition-all inline-block shadow-inner">
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

            {/* --- DETAILED HISTORY DRAWER --- */}
            <AnimatePresence>
                {selectedStaff && (
                    <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStaff(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000]" />
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-[1001] flex flex-col overflow-hidden">
                        
                        <div className="p-8 bg-slate-900 flex justify-between items-center text-white">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">{selectedStaff.full_name_en.charAt(0)}</div>
                                <div>
                                    <h2 className="text-lg font-black uppercase italic leading-none">{selectedStaff.full_name_en}</h2>
                                    <p className="text-emerald-400 font-bold text-[10px] uppercase mt-2 tracking-widest">Attendance History</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStaff(null)} className="w-10 h-10 bg-white/10 hover:bg-rose-500 rounded-xl flex items-center justify-center transition-all"><X size={20}/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 custom-scrollbar">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <SummaryBlock label="Attendance Score" value="96%" sub="High Activity" color="emerald" />
                                <SummaryBlock label="Late Punch-ins" value="03" sub="This Month" color="rose" />
                            </div>

                            {/* Timeline Logs */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <CalendarRange size={16}/> Historical Timeline
                                </h3>
                                
                                {history.map((log) => (
                                    <div key={log.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6 hover:shadow-xl transition-all">
                                        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                                            <p className="text-sm font-black text-slate-800 uppercase italic underline underline-offset-4 decoration-emerald-500">{formatIST(log.duty_date, 'date')}</p>
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${getStatusStyle(log.status)} shadow-md`}>{log.status}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Punch In */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                                                    <Camera size={12}/> Check-In Selfie
                                                </div>
                                                <div className="aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 relative group">
                                                    {log.selfie_in ? <img src={log.selfie_in} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><User size={40}/></div>}
                                                    <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur px-3 py-2 rounded-xl border border-white shadow-sm flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-700">{formatIST(log.check_in)}</span>
                                                        <MapPin size={10} className="text-emerald-500" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Punch Out */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                                                    <Camera size={12}/> Check-Out Selfie
                                                </div>
                                                <div className="aspect-[4/5] bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 relative">
                                                    {log.selfie_out ? <img src={log.selfie_out} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><User size={40}/></div>}
                                                    <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur px-3 py-2 rounded-xl border border-white shadow-sm flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-700">{formatIST(log.check_out)}</span>
                                                        <MapPin size={10} className="text-rose-500" />
                                                    </div>
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

// 🟢 INTERNAL COMPONENTS
const StatCard = ({ icon: Icon, label, count, color }) => (
    <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4 min-w-[120px]">
        <div className={`p-2 bg-${color}-500/20 text-${color}-400 rounded-lg`}>
            <Icon size={18} />
        </div>
        <div>
            <p className="text-[9px] font-black text-white/50 uppercase leading-none mb-1">{label}</p>
            <p className="text-xl font-black text-white leading-none">{count}</p>
        </div>
    </div>
);

const SummaryBlock = ({ label, value, sub, color }) => (
    <div className={`bg-${color}-50 p-6 rounded-[28px] border border-${color}-100 shadow-inner`}>
        <p className={`text-[9px] font-black text-${color}-600 uppercase mb-2`}>{label}</p>
        <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">{sub}</p>
    </div>
);

export default AttendanceLog;
