import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Factory, Scale, Truck, RefreshCcw, Loader2, Zap, Users, 
    PackageCheck, ShoppingCart, BarChart3, Database, ThermometerSun 
} from 'lucide-react';
import { motion } from 'framer-motion';
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

    // Derived Stats
    const totalIntake = data.intake.reduce((acc, curr) => acc + parseFloat(curr.weight_in_tons), 0).toFixed(1);
    const recovery = data.segregation[0] || { plastic: 0, paper: 0, metal: 0, inert: 0 };
    const totalRecovered = (parseFloat(recovery.plastic || 0) + parseFloat(recovery.paper || 0) + parseFloat(recovery.metal || 0)).toFixed(0);
    const opStatus = data.operational[0] || { electricity_reading: 0, labour_count: 0, machine_status: 'Offline' };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-[#F1F5F9] min-h-screen">
                
                {/* --- 🟢 TOP NAVIGATION BAR --- */}
                <header className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-emerald-400 shadow-2xl relative">
                            <Factory size={32} />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">WPP Command Center</h1>
                            <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Industrial Waste Intelligence v2.0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-3xl border border-slate-100">
                        <StatusIcon icon={Zap} label="Power" value={`${opStatus.electricity_reading} Units`} color="amber" />
                        <StatusIcon icon={Users} label="On-Site" value={`${opStatus.labour_count} Labors`} color="blue" />
                        <button onClick={fetchAllData} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-emerald-500 transition-all shadow-lg active:scale-95">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>
                </header>

                {/* --- 🟢 PERFORMANCE METRICS --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <MetricCard label="Daily Intake" value={totalIntake} unit="TONS" icon={Scale} color="blue" />
                    <MetricCard label="Material Recovery" value={totalRecovered} unit="KG" icon={BarChart3} color="emerald" />
                    <MetricCard label="Recovery Rate" value={`${totalIntake > 0 ? ((totalRecovered / (totalIntake * 1000)) * 100).toFixed(1) : 0}%`} unit="EFFICIENCY" icon={PackageCheck} color="indigo" />
                    <MetricCard label="Machine Health" value={opStatus.machine_status} unit="SYSTEM" icon={RefreshCcw} color={opStatus.machine_status === 'Running' ? 'emerald' : 'rose'} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: Live Intake & Segregation Feed (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest flex items-center gap-3">
                                    <Truck className="text-blue-500" /> Weighbridge Logistics & Gate-Pass logs
                                </h3>
                            </div>
                            <div className="flex-1 overflow-auto custom-scrollbar p-2">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                            <th className="p-6">Gate Pass / Vehicle</th>
                                            <th className="p-4">Origin Ward</th>
                                            <th className="p-4">Load Details</th>
                                            <th className="p-4">Operator Status</th>
                                            <th className="p-4">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.intake.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-all group">
                                                <td className="p-6">
                                                    <p className="text-[10px] font-black text-blue-500 mb-1">{log.gate_pass_no}</p>
                                                    <p className="font-black text-slate-800 text-base">{log.vehicle_no}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-600">WARD #{log.ward_no || '--'}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-8 rounded-full ${log.waste_type === 'Wet' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800">{log.weight_in_tons} TONS</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{log.waste_type} Waste</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${log.status === 'processed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-[11px] text-slate-400">
                                                    {new Date(log.entry_time).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Production, Inventory & Sales (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* 📦 Live Stock HUD */}
                        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><Database size={120}/></div>
                            <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                                <PackageCheck className="text-emerald-400" /> Inventory Stock
                            </h3>
                            <div className="space-y-4">
                                {data.production.map(p => (
                                    <div key={p.id} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] hover:bg-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-black uppercase text-white">{p.product_name}</p>
                                            <span className="text-[10px] font-black bg-emerald-500 text-slate-900 px-2 py-0.5 rounded-lg">GRADE {p.quality_grade}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-2xl font-black text-emerald-400">{p.current_stock_kg} <span className="text-xs">KG</span></p>
                                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Batch: {p.batch_no}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 💰 Dispatch / Sales Feed */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <ShoppingCart className="text-indigo-500" /> Recent Dispatch
                            </h3>
                            <div className="space-y-3">
                                {data.dispatch.map(d => (
                                    <div key={d.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                                            <Truck size={20}/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-slate-800 uppercase truncate">{d.party_name}</p>
                                            <p className="text-[10px] font-bold text-emerald-600">{d.quantity_dispatched_kg} KG Sent</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400">{new Date(d.dispatch_time).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </CityLayout>
    );
};

// --- Helper Components ---
const MetricCard = ({ label, value, unit, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-xl transition-all group">
        <div className={`w-14 h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
            <Icon size={28} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{value} <span className="text-[10px] text-slate-300 ml-1">{unit}</span></p>
        </div>
    </div>
);

const StatusIcon = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}><Icon size={16}/></div>
        <div>
            <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">{label}</p>
            <p className="text-[10px] font-black text-slate-700 uppercase leading-none">{value}</p>
        </div>
    </div>
);

export default WasteProcessingPlant;
