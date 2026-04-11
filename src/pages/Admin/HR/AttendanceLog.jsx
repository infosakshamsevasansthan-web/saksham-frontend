import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Clock, Calendar, User, Search, Camera, X, Loader2, ChevronRight, CheckCircle2, AlertCircle, CalendarRange } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const AttendanceLog = () => {
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [history, setHistory] = useState([]);
    const tenantId = localStorage.getItem('tenantId');

    const fetchTodayStatus = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/attendance/today/${tenantId}`);
            setRoster(res.data.data || []);
        } catch (err) { toast.error("Sync Failed"); }
        finally { setLoading(false); }
    };

    const fetchStaffHistory = async (staff) => {
        setSelectedStaff(staff);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/attendance/history/${staff.id}`);
            setHistory(res.data.data || []);
        } catch (err) { toast.error("History Error"); }
    };

    useEffect(() => { fetchTodayStatus(); }, [tenantId]);

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Present': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Absent': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Leave': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-4 text-left bg-slate-50 min-h-screen">
                
                {/* 🟢 COMPACT HEADER WITH 3 STATUS CARDS */}
                <header className="flex flex-col md:flex-row items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 shadow-md">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">Attendance Log</h1>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Personnel Tracking Center</p>
                        </div>
                    </div>
                    
                    {/* 🟢 STATUS CHIPS CONTAINER */}
                    <div className="flex flex-wrap gap-2">
                        <StatChip label="Present" count={roster.filter(r => r.status === 'Present').length} color="emerald" />
                        <StatChip label="Absent" count={roster.filter(r => r.status === 'Absent').length} color="rose" />
                        {/* Naya Leave Card yahan hai */}
                        <StatChip label="On Leave" count={roster.filter(r => r.status === 'Leave').length} color="blue" />
                    </div>
                </header>

                {/* 🟢 SLEEK SEARCH */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Search name or ID..." 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 🟢 DATA TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-4">Personnel Identity</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Log Time (IST)</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="4" className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32}/></td></tr>
                            ) : roster.filter(r => r.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())).map((r) => (
                                <tr key={r.id} onClick={() => fetchStaffHistory(r)} className="hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 uppercase text-xs">
                                                {r.full_name_en.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm uppercase leading-none">{r.full_name_en}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">ID: {r.employee_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border tracking-widest ${getStatusStyle(r.status)}`}>
                                            {r.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-xs font-black text-slate-700">{r.check_in ? new Date(r.check_in).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 group-hover:text-emerald-600 transition-all inline-block">
                                            <ChevronRight size={16}/>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- DRILLDOWN DRAWER --- */}
            <AnimatePresence>
                {selectedStaff && (
                    <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStaff(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000]" />
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[1001] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-20">
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">{selectedStaff.full_name_en.charAt(0)}</div>
                                <div>
                                    <h2 className="text-base font-black text-slate-800 uppercase leading-none">{selectedStaff.full_name_en}</h2>
                                    <p className="text-emerald-600 font-bold text-[9px] uppercase mt-1 tracking-widest">Attendance Profile</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStaff(null)} className="text-rose-500 font-bold">X</button>
                        </div>

                        <div className="p-6 space-y-6 text-left">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Score</p>
                                    <p className="text-xl font-black text-slate-800">24 <span className="text-[10px] text-slate-400 italic">Days</span></p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                    <p className="text-[8px] font-black text-blue-600 uppercase mb-1">Leaves</p>
                                    <p className="text-xl font-black text-slate-800">02 <span className="text-[10px] text-slate-400 italic">Total</span></p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {history.map((log) => (
                                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-black text-slate-800 uppercase">{new Date(log.duty_date).toLocaleDateString('en-GB', {day:'numeric', month:'short'})}</p>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getStatusStyle(log.status)}`}>{log.status}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Check-In Selfie</p>
                                                <div className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                                                    {log.selfie_in ? <img src={log.selfie_in} className="w-full h-full object-cover" /> : <X size={12} className="text-slate-300"/>}
                                                </div>
                                                <p className="text-center font-black text-slate-700 text-[10px]">{log.check_in ? new Date(log.check_in).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[8px] font-black text-slate-400 uppercase">Check-Out Selfie</p>
                                                <div className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                                                    {log.selfie_out ? <img src={log.selfie_out} className="w-full h-full object-cover" /> : <X size={12} className="text-slate-300"/>}
                                                </div>
                                                <p className="text-center font-black text-slate-700 text-[10px]">{log.check_out ? new Date(log.check_out).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</p>
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

// 🟢 StatChip Helper Component
const StatChip = ({ label, count, color }) => (
    <div className={`bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm min-w-[100px]`}>
        <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`} />
        <div>
            <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">{label}</p>
            <p className={`text-base font-black text-slate-800 leading-none`}>{count}</p>
        </div>
    </div>
);

export default AttendanceLog;