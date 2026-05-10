import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Fuel, Search, Download, ArrowUpRight, CheckCircle2, Clock, Truck, User, Hash, MoreVertical, Loader2, Droplets, Printer, Trash2, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const FuelLogs = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ totalLiters: 0, pendingCoupons: 0, consumedLiters: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // Filter by Status
    const [openMenuId, setOpenMenuId] = useState(null);
    
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
        } catch (err) { toast.error("Sync Failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, [tenantId]);

    // 🟢 Action: Coupon Print Slip
    const handlePrint = (log) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <body style="font-family: sans-serif; padding: 30px; border: 2px dashed #333; width: 300px; margin: auto;">
                    <div style="text-align:center">
                        <h1 style="margin:0">SAKSHAM CITY</h1>
                        <p style="font-size:12px">FUEL AUTHORIZATION SLIP</p>
                    </div>
                    <hr/>
                    <div style="font-size: 14px; line-height: 2;">
                        <b>Coupon:</b> ${log.coupon_code}<br/>
                        <b>Vehicle:</b> ${log.vehicle_no}<br/>
                        <b>Fuel Qty:</b> <span style="font-size: 18px">${log.fuel_qty} Liters</span><br/>
                        <b>Driver:</b> ${log.dr_name || 'N/A'}<br/>
                        <b>Date:</b> ${new Date(log.created_at).toLocaleString()}
                    </div>
                    <hr/>
                    <p style="font-size: 10px; text-align:center">Valid for one-time use at authorized pump only.</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        setOpenMenuId(null);
    };

    // 🟢 Action: Void/Cancel Coupon
    const handleCancel = async (id) => {
        if(!window.confirm("Bhai, kya aap is coupon ko void karna chahte hain?")) return;
        try {
            await axios.patch(`https://saksham-backend-9719.onrender.com/api/admin/fuel/cancel/${id}`);
            toast.success("Coupon Expired/Voided 🗑️");
            fetchLogs();
        } catch (e) { toast.error("Action Failed"); }
        setOpenMenuId(null);
    };

    // 🟢 Advanced Filter Logic
    const filteredLogs = logs.filter(log => {
        const matchesSearch = (log.vehicle_no || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (log.coupon_code || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ? true : log.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left bg-slate-50/50 min-h-screen">
                
                {/* 📊 ANALYTICS OVERVIEW */}
                <header className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                        <Fuel className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-700" size={140} />
                        <h1 className="text-2xl font-black uppercase italic leading-none">Fuel & Coupon</h1>
                        <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Fleet Audit Command</p>
                        <div className="mt-8 flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[8px] font-black uppercase">Live Monitoring</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:col-span-3 gap-6">
                        <StatCard label="Coupons Issued" value={Number(stats?.totalLiters || 0).toFixed(0)} icon={Droplets} color="#3b82f6" unit="Ltrs" />
                        <StatCard label="Filled at Pump" value={Number(stats?.consumedLiters || 0).toFixed(0)} icon={CheckCircle2} color="#10b981" unit="Ltrs" />
                        <StatCard label="Active Coupons" value={stats?.pendingCoupons || 0} icon={Clock} color="#f59e0b" unit="Units" />
                    </div>
                </header>

                {/* 🔍 FILTER CONTROL BAR */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Coupon or Vehicle..." 
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <select 
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs uppercase outline-none"
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Pending Coupons</option>
                            <option value="consumed">Filled Logs</option>
                            <option value="expired">Voided</option>
                        </select>
                        <button className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 font-bold text-xs uppercase">
                            <Download size={18}/> Export Audit
                        </button>
                    </div>
                </div>

                {/* 📜 MASTER LIST (Coupons + Logs) */}
                <div className="bg-white rounded-[50px] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-8">Coupon Detail</th>
                                <th className="p-4">Fleet Allocation</th>
                                <th className="p-4">Status & Audit</th>
                                <th className="p-4 text-center">Fuel Qty</th>
                                <th className="p-4 text-right pr-12">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center font-black text-slate-300 uppercase text-xs">No Audit Records Found</td></tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border-2 transition-all ${log.status === 'consumed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : log.status === 'expired' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                                                {log.status === 'expired' ? <AlertTriangle size={20}/> : <Hash size={20} />}
                                            </div>
                                            <div>
                                                <p className={`font-black text-lg tracking-tighter leading-none ${log.status === 'expired' ? 'line-through text-slate-300' : 'text-slate-800'}`}>{log.coupon_code}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{new Date(log.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg"><Truck size={16} className="text-slate-500"/></div>
                                            <div>
                                                <p className="font-black text-slate-700 text-sm uppercase">{log.vehicle_no}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Driver: {log.dr_name || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-2 w-fit ${
                                            log.status === 'consumed' ? 'bg-emerald-50 text-emerald-600' : 
                                            log.status === 'expired' ? 'bg-rose-50 text-rose-600' : 
                                            'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'consumed' ? 'bg-emerald-500' : log.status === 'expired' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                            {log.status === 'consumed' ? 'Redeemed' : log.status === 'expired' ? 'Voided' : 'At Pump'}
                                        </span>
                                        {log.pump_filled_at && <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase">Filled: {new Date(log.pump_filled_at).toLocaleTimeString()}</p>}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 inline-block">
                                            <p className="text-xl font-black text-slate-800 leading-none">{log.fuel_qty} <span className="text-[10px] text-slate-400">Ltrs</span></p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right pr-12 relative">
                                        <button 
                                            onClick={() => setOpenMenuId(openMenuId === log.id ? null : log.id)}
                                            className={`p-2.5 rounded-xl transition-all ${openMenuId === log.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-300 hover:text-slate-900'}`}
                                        >
                                            <MoreVertical size={18}/>
                                        </button>

                                        <AnimatePresence>
                                            {openMenuId === log.id && (
                                                <motion.div initial={{ opacity: 0, scale: 0.9, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                                    className="absolute right-24 top-0 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[100] overflow-hidden"
                                                >
                                                    <button onClick={() => handlePrint(log)} className="w-full p-4 flex items-center gap-3 text-slate-600 font-bold text-[10px] uppercase hover:bg-slate-50 transition-all border-b border-slate-50">
                                                        <Printer size={16} className="text-blue-500" /> Print Coupon
                                                    </button>
                                                    {log.status === 'active' && (
                                                        <button onClick={() => handleCancel(log.id)} className="w-full p-4 flex items-center gap-3 text-rose-500 font-bold text-[10px] uppercase hover:bg-rose-50 transition-all">
                                                            <Trash2 size={16} /> Mark as Void
                                                        </button>
                                                    )}
                                                    <div className="bg-slate-50 p-2 text-center">
                                                        <button onClick={() => setOpenMenuId(null)} className="text-[8px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500">Close Menu</button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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
            <p className="text-3xl font-black text-slate-800 leading-none">{value} <span className="text-xs text-slate-300 ml-1 uppercase">{unit}</span></p>
        </div>
    </div>
);

export default FuelLogs;
