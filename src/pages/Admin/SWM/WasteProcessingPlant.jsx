import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Factory, Scale, Truck, RefreshCcw, Loader2, Zap, Users, 
    PackageCheck, ShoppingCart, BarChart3, Database, Image as ImageIcon,
    Activity, Gauge, TrendingUp, Layers, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const WasteProcessingPlant = () => {
    const [data, setData] = useState({ intake: [], production: [], segregation: [], dispatch: [], operational: [] });
    const [loading, setLoading] = useState(true);
    const tenantId = localStorage.getItem('tenantId');

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/plant/dashboard-summary/${tenantId}`);
            if (res.data.success) {
                setData(res.data);
            }
        } catch (err) { toast.error("Plant systems sync failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAllData(); }, [tenantId]);

    // Derived Logic for Advanced Metrics
    const totalIntake = data.intake.reduce((acc, curr) => acc + parseFloat(curr.weight_in_tons || 0), 0).toFixed(1);
    const segregation = data.segregation[0] || { plastic: 0, paper: 0, metal: 0, inert: 0 };
    const totalRecycled = (parseFloat(segregation.plastic || 0) + parseFloat(segregation.paper || 0) + parseFloat(segregation.metal || 0)).toFixed(0);
    const opStatus = data.operational[0] || { electricity_reading: 0, labour_count: 0, machine_status: 'Offline' };
    
    // Diversion Rate: % of waste saved from landfill
    const diversionRate = totalIntake > 0 ? ((totalRecycled / (totalIntake * 1000)) * 100).toFixed(1) : 0;

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-[#f8fafc] min-h-screen font-sans">
                
                {/* --- 🟢 1. SMART INDUSTRIAL HEADER --- */}
                <header className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-emerald-400 shadow-2xl relative group">
                            <Factory size={32} className="group-hover:rotate-12 transition-transform" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">WPP Command Center</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em]">Industrial Resource Intelligence v2.1</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100">
                        <StatusChip icon={Zap} label="Energy" value={`${opStatus.electricity_reading} U`} color="amber" />
                        <StatusChip icon={Users} label="Workforce" value={`${opStatus.labour_count} On-Site`} color="blue" />
                        <button onClick={fetchAllData} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-emerald-500 transition-all shadow-lg active:scale-90">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>
                </header>

                {/* --- 🟢 2. CORE KPI GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard label="Total Intake" value={totalIntake} unit="TONS" icon={Scale} color="blue" trend="+12% vs Yesterday" />
                    <MetricCard label="Material Recovery" value={totalRecycled} unit="KG" icon={TrendingUp} color="emerald" trend="Plastic/Paper/Metal" />
                    <MetricCard label="Diversion Rate" value={`${diversionRate}%`} unit="LANDFILL SAVED" icon={PackageCheck} color="indigo" trend="Eco Efficiency" />
                    <MetricCard label="Plant Health" value={opStatus.machine_status} unit="AUTO-LOG" icon={Activity} color={opStatus.machine_status === 'Running' ? 'emerald' : 'rose'} trend="Operational status" />
                </div>

                {/* --- 3. MAIN WORKFLOW SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: Live Intake & Logistics (8 Columns) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg"><Truck size={20}/></div>
                                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Weighbridge & Gate-Pass Evidence</h3>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase bg-white px-4 py-1.5 rounded-full border border-slate-100">Live Mobile Feed</div>
                            </div>
                            
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white z-20 border-b">
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="p-6">Vehicle & ID</th>
                                            <th className="p-4">Waste Insight</th>
                                            <th className="p-4">Logistics Evidence</th>
                                            <th className="p-4">Staff Status</th>
                                            <th className="p-4">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.intake.length === 0 ? (
                                            <tr><td colSpan="5" className="p-40 text-center text-slate-300 font-bold uppercase italic">No intake recorded via app today</td></tr>
                                        ) : data.intake.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-50/80 transition-all group">
                                                <td className="p-6">
                                                    <p className="text-[10px] font-black text-blue-500 mb-1">{log.gate_pass_no}</p>
                                                    <p className="font-black text-slate-800 text-base group-hover:translate-x-1 transition-transform">{log.vehicle_no}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Ward {log.ward_no}</p>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-1.5 h-10 rounded-full ${log.waste_type === 'Wet' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800">{log.weight_in_tons} <span className="text-[10px] text-slate-400">T</span></p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{log.waste_type} Waste</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Odometer Photo Evidence */}
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                                                            {log.meter_photo_url ? <img src={log.meter_photo_url} className="w-full h-full object-cover" /> : <Gauge size={16} className="text-slate-300"/>}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800">{log.meter_reading || '0'} KM</p>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase italic">Reading Logged</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] font-black uppercase text-slate-400">Op: {log.driver_name}</span>
                                                        <span className={`px-3 py-0.5 rounded-lg text-[9px] font-black uppercase inline-block w-fit ${log.status === 'processed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <p className="font-mono text-xs font-black text-slate-700">{new Date(log.entry_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <RefreshCcw size={8} className="text-emerald-500" />
                                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Mobile Sync</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Inventory & Segregation HUD (4 Columns) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* 📦 PRODUCTION INVENTORY HUD */}
                        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Database size={150}/></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                                        <PackageCheck className="text-emerald-400" /> Final Inventory
                                    </h3>
                                    <div className="bg-white/10 p-2 rounded-xl"><Layers size={18}/></div>
                                </div>
                                
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data.production.length === 0 ? (
                                        <p className="text-slate-500 text-xs font-black text-center py-10 uppercase italic">No production logs synced</p>
                                    ) : data.production.map(p => (
                                        <div key={p.id} className="bg-white/5 border border-white/10 p-5 rounded-[2.5rem] hover:bg-white/10 transition-all border-l-4 border-l-emerald-500">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-sm font-black uppercase text-white leading-none">{p.product_name}</p>
                                                    <p className="text-[9px] font-bold text-white/30 mt-2 uppercase">Batch ID: {p.batch_no}</p>
                                                </div>
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${p.quality_grade === 'A' ? 'bg-emerald-500 text-slate-900' : 'bg-white/10 text-white'}`}>GRADE {p.quality_grade}</span>
                                            </div>
                                            <div className="flex justify-between items-end mt-4">
                                                <p className="text-3xl font-black text-emerald-400 tracking-tighter">{p.current_stock_kg} <span className="text-xs">KG</span></p>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-white/20 uppercase">MFG Date</p>
                                                    <p className="text-[10px] font-bold text-white/60">{new Date(p.mfg_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
                                    <History size={20} className="text-emerald-400" />
                                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">Inventory stock is automatically deducted upon Dispatch/Sale entry from App.</p>
                                </div>
                            </div>
                        </div>

                        {/* 📊 RECOVERY BREAKDOWN */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <BarChart3 size={14} className="text-indigo-500" /> Material Breakdown (Today)
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <SmallStat label="Plastic" value={`${segregation.plastic || 0} Kg`} color="blue" />
                                <SmallStat label="Paper" value={`${segregation.paper || 0} Kg`} color="amber" />
                                <SmallStat label="Metal" value={`${segregation.metal || 0} Kg`} color="rose" />
                                <SmallStat label="Inert" value={`${segregation.inert || 0} Kg`} color="slate" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </CityLayout>
    );
};

// --- ✨ Sub-Components for Clean Code ---

const MetricCard = ({ label, value, unit, icon: Icon, color, trend }) => (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all group relative overflow-hidden">
        <div className={`absolute -right-4 -bottom-4 opacity-5 text-${color}-600 group-hover:scale-125 transition-transform`}><Icon size={120} /></div>
        <div className="relative z-10">
            <div className={`w-14 h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                <Icon size={28} />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">{value}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic tracking-tighter">{unit}</p>
        </div>
        <div className="mt-6 flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 animate-pulse`} />
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{trend}</span>
        </div>
    </div>
);

const StatusChip = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-4 px-5 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
        <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}><Icon size={18}/></div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1.5 tracking-widest">{label}</p>
            <p className="text-xs font-black text-slate-800 uppercase leading-none">{value}</p>
        </div>
    </div>
);

const SmallStat = ({ label, value, color }) => (
    <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{label}</p>
        <p className={`text-sm font-black text-${color}-600`}>{value}</p>
    </div>
);

export default WasteProcessingPlant;
