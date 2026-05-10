import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Fuel, Search, Download, Calendar, ArrowUpRight, CheckCircle2, Clock, Truck, User, Hash, MoreVertical, Loader2, Droplets } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const FuelLogs = () => {
    const [logs, setLogs] = useState([]);
    // Default stats taaki app crash na ho
    const [stats, setStats] = useState({ totalLiters: 0, pendingCoupons: 0, consumedLiters: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const tenantId = localStorage.getItem('tenantId');

    const fetchLogs = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/fuel-logs/${tenantId}`);
            if (res.data.success) {
                setLogs(res.data.data || []);
                setStats(res.data.stats || { totalLiters: 0, pendingCoupons: 0, consumedLiters: 0 });
            }
        } catch (err) { 
            console.error(err);
            toast.error("Audit data fetch failed"); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchLogs(); }, [tenantId]);

    // Robust Search Logic
    const filteredLogs = logs.filter(log => 
        (log.vehicle_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.coupon_code || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left bg-slate-50/50 min-h-screen">
                
                {/* 🟢 TOP ANALYTICS HEADER */}
                <header className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                        <Fuel className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-500" size={120} />
                        <h1 className="text-2xl font-black uppercase italic leading-none">Fuel Ledger</h1>
                        <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Audit Control Room</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 md:col-span-3 gap-6">
                        {/* value.toFixed use karne se pehle Number() me convert kiya hai safety ke liye */}
                        <StatCard label="Total Allocated" value={Number(stats?.totalLiters || 0).toFixed(1)} icon={Droplets} color="#3b82f6" unit="Ltrs" />
                        <StatCard label="Redeemed @ Pump" value={Number(stats?.consumedLiters || 0).toFixed(1)} icon={CheckCircle2} color="#10b981" unit="Ltrs" />
                        <StatCard label="Live Coupons" value={stats?.pendingCoupons || 0} icon={Clock} color="#f59e0b" unit="Units" />
                    </div>
                </header>

                {/* 🟢 FILTER & SEARCH */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Gaadi No or Coupon Code..." 
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm focus:ring-2 focus:ring-emerald-500/20"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-slate-900 transition-all flex items-center gap-2 font-bold text-xs uppercase"><Download size={18}/> Export Audit</button>
                    </div>
                </div>

                {/* 🟢 LOGS TABLE */}
                <div className="bg-white rounded-[50px] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-8">Coupon Detail</th>
                                <th className="p-4">Vehicle</th>
                                <th className="p-4">Redeem Status</th>
                                <th className="p-4 text-center">Consumption Audit</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-slate-300 font-black uppercase text-xs">No logs found</td></tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-sm border-2 ${log.status === 'consumed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                                <Hash size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-lg tracking-tighter leading-none">{log.coupon_code}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{new Date(log.created_at).toLocaleString('en-GB', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Truck className="text-slate-400" size={20}/>
                                            <div>
                                                <p className="font-black text-slate-700 text-sm uppercase">{log.vehicle_no}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase italic">Crew: {log.dr_name || 'System'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-2 w-fit ${
                                            log.status === 'consumed' 
                                            ? 'bg-emerald-50 text-emerald-600' 
                                            : 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'consumed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            {log.status === 'consumed' ? 'Redeemed' : 'At Pump'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-center group-hover:scale-105 transition-transform">
                                            <p className={`text-xl font-black leading-none ${log.fuel_qty > 50 ? 'text-rose-600' : 'text-slate-800'}`}>
                                                {log.fuel_qty} <span className="text-[10px] text-slate-400">Ltrs</span>
                                            </p>
                                            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Allocated Qty</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <button className="p-2.5 text-slate-300 hover:text-slate-900 transition-all"><MoreVertical size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </CityLayout>
    );
};

// --- Sub Components ---
const StatCard = ({ label, value, icon: Icon, color, unit }) => (
    <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-slate-300 transition-all">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${color}10`, color: color }}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{value} <span className="text-xs text-slate-300 ml-1 uppercase">{unit}</span></p>
        </div>
    </div>
);

export default FuelLogs;
