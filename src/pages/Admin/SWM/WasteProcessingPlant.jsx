import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Factory, Scale, Truck, RefreshCcw, Loader2, Image as ImageIcon, CheckCircle2, CloudCog, Package, Target, Boxes, History } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const WasteProcessingPlant = () => {
    const [logs, setLogs] = useState([]);
    const [production, setProduction] = useState([]);
    const [loading, setLoading] = useState(true);
    const tenantId = localStorage.getItem('tenantId');

    const fetchAppData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/plant/all-feeds/${tenantId}`);
            if (res.data.success) {
                setLogs(res.data.logs);
                setProduction(res.data.production);
            }
        } catch (err) { toast.error("Live feed sync failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAppData(); }, [tenantId]);

    // Simple Calculation for Stats
    const totalTons = logs.reduce((acc, curr) => acc + parseFloat(curr.weight_in_tons), 0).toFixed(1);
    const totalCompost = production.filter(p => p.product_name.includes('Compost'))
                         .reduce((acc, curr) => acc + parseFloat(curr.quantity_kg), 0);

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-[#F8FAFC] min-h-screen">
                
                {/* --- 🟢 HEADER WITH CLOUD REFRESH --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg">
                            <Factory size={28} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase italic leading-none">WPP Command Center</h1>
                            <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest mt-1">Live App Data Monitoring</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100 flex flex-col justify-center">
                            <p className="text-[7px] font-black text-slate-400 uppercase">Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-xs font-black text-slate-700 uppercase">Plant Online</span>
                            </div>
                        </div>
                        {/* 🟢 Cloud Refresh Button */}
                        <button onClick={fetchAppData} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm group">
                            <CloudCog size={22} className="group-hover:scale-110 transition-transform"/>
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>
                </header>

                {/* --- 🟢 TODAY'S PERFORMANCE STATS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard label="Daily Intake" value={totalTons} unit="TONS" icon={Scale} color="blue" />
                    <SummaryCard label="Total Output" value={totalCompost} unit="KG" icon={Package} color="emerald" />
                    <SummaryCard label="Fleet Cycles" value={logs.length} unit="TRIPS" icon={History} color="amber" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- 🟢 MAIN TABLE: LIVE WEIGHBRIDGE FEED (2 Columns) --- */}
                    <div className="lg:col-span-2 bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                                <Truck size={18} className="text-emerald-500" /> App-Logged Vehicle History
                            </h3>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-white sticky top-0 border-b z-10">
                                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-6">Vehicle & Type</th>
                                        <th className="p-4">Trip Info</th>
                                        <th className="p-4">Waste Weight</th>
                                        <th className="p-4">App Photo</th>
                                        <th className="p-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr>
                                    ) : logs.length === 0 ? (
                                        <tr><td colSpan="5" className="p-32 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">No trips recorded from app today</td></tr>
                                    ) : logs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-6">
                                                <p className="font-black text-slate-700 text-sm uppercase leading-none">{log.vehicle_no}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{log.vehicle_type}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${log.trip_no > 1 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                    Trip #{log.trip_no}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-800 text-sm">{log.weight_in_tons} TONS</span>
                                                    <span className={`text-[8px] font-black uppercase ${log.waste_type === 'Wet' ? 'text-emerald-500' : 'text-blue-500'}`}>{log.waste_type} Waste</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                    {log.photo_url ? (
                                                        <img src={log.photo_url} className="w-full h-full object-cover" alt="Scan Evidence" />
                                                    ) : (
                                                        <ImageIcon size={18} className="text-slate-300" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-xs font-bold text-slate-700">{new Date(log.entry_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                                <p className="text-[8px] font-black text-slate-300 uppercase">Synced via Mobile</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* --- 🟢 RIGHT SIDE: PRODUCTION LOGS (1 Column) --- */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-900 p-8 rounded-[45px] text-white shadow-2xl relative overflow-hidden h-full">
                             <Boxes className="absolute -right-4 -bottom-4 text-emerald-500/10" size={150} />
                             <div className="relative z-10">
                                <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
                                    <Package className="text-emerald-400" /> Final Output
                                </h3>
                                <div className="space-y-6">
                                    {production.length === 0 ? (
                                        <p className="text-slate-500 text-xs font-bold uppercase text-center py-10">No production logs found</p>
                                    ) : production.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                                            <div>
                                                <p className="text-[10px] font-bold text-white/50 uppercase leading-none mb-2">Item Type</p>
                                                <p className="text-xs font-black uppercase text-white">{item.product_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-emerald-400">{item.quantity_kg} KG</p>
                                                <p className="text-[8px] font-bold text-white/30 uppercase">Batch: {item.batch_no}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 p-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20">
                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Plant Message</p>
                                    <p className="text-[11px] text-slate-300 leading-relaxed italic">"All final products are automatically weighed and batch-ID assigned via the Processing App."</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </CityLayout>
    );
};

// --- Sub-Components ---
const SummaryCard = ({ label, value, unit, icon: Icon, color }) => (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
        <div className={`w-16 h-16 bg-${color}-50 text-${color}-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
            <Icon size={30} />
        </div>
        <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
                <span className="text-[10px] font-bold text-slate-300 uppercase">{unit}</span>
            </div>
        </div>
    </div>
);

export default WasteProcessingPlant;