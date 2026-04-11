import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { ShieldCheck, Search, Loader2, Plus, Truck, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const MaintenanceInsurance = () => {
    const [fleet, setFleet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [selectedVhl, setSelectedVhl] = useState(null);
    const [renewData, setRenewData] = useState({ type: 'insurance', expiry: '', no: '' });

    const tenantId = localStorage.getItem('tenantId');

    const fetchFleetHealth = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/fleet-compliance/${tenantId}`);
            setFleet(res.data.data || []);
        } catch (err) { 
            console.error(err);
            toast.error("Data load failed"); 
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchFleetHealth(); }, [tenantId]);

    const handleRenew = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/vehicles/renew-docs', {
                id: selectedVhl.id,
                type: renewData.type,
                expiry_date: renewData.expiry,
                cert_no: renewData.no
            });
            toast.success("Updated!");
            setShowRenewModal(false);
            fetchFleetHealth();
        } catch (err) { toast.error("Error"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-5 text-left bg-slate-50 min-h-screen">
                
                {/* 🟢 COMPACT HEADER */}
                <header className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">Fleet Compliance</h1>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Locker & Expiry Tracking</p>
                        </div>
                    </div>
                    <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase">System Live</span>
                    </div>
                </header>

                {/* 🟢 COMPACT SEARCH */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Search gaadi number..." 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 🟢 COMPACT TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="p-4">Gaadi / Type</th>
                                    <th className="p-4">Expiry Status</th>
                                    <th className="p-4">Service & Cost</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32}/></td></tr>
                                ) : fleet.filter(v => v.vehicle_no.toLowerCase().includes(searchTerm.toLowerCase())).map((v) => (
                                    <tr key={v.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 border border-slate-200"><Truck size={18}/></div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm uppercase leading-none">{v.vehicle_no}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{v.vehicle_type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="grid grid-cols-1 gap-1.5">
                                                <MiniTag label="FIT" date={v.fitness_expiry} />
                                                <MiniTag label="INS" date={v.insurance_expiry} />
                                                <MiniTag label="POL" date={v.pollution_expiry} />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-[10px] font-bold text-slate-700">Last: {v.last_service_date ? new Date(v.last_service_date).toLocaleDateString() : 'N/A'}</p>
                                            <p className="text-[10px] font-black text-blue-600 mt-1">₹{v.total_maint_cost || 0}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => { setSelectedVhl(v); setShowRenewModal(true); }}
                                                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                            >
                                                <Plus size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 🟢 COMPACT MODAL */}
            <AnimatePresence>
                {showRenewModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-sm font-black uppercase text-slate-700">Renew: {selectedVhl?.vehicle_no}</h2>
                                <button onClick={() => setShowRenewModal(false)} className="text-slate-400 hover:text-rose-500 font-bold">X</button>
                            </div>
                            <form onSubmit={handleRenew} className="p-5 space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Doc Type</label>
                                    <select className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none" onChange={(e) => setRenewData({...renewData, type: e.target.value})}>
                                        <option value="insurance">Insurance</option>
                                        <option value="fitness">Fitness Cert</option>
                                        <option value="pollution">Pollution (PUC)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Expiry Date</label>
                                    <input required type="date" className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none" onChange={(e) => setRenewData({...renewData, expiry: e.target.value})} />
                                </div>
                                <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-md">
                                    Update Locker
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// 🟢 Helper for Expiry Status in Table
const MiniTag = ({ label, date }) => {
    const expired = date && new Date(date) < new Date();
    return (
        <div className="flex items-center gap-2">
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${expired ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{label}</span>
            <span className={`text-[9px] font-bold ${expired ? 'text-rose-500' : 'text-slate-500'}`}>{date ? new Date(date).toLocaleDateString() : 'N/A'}</span>
            {expired && <AlertCircle size={10} className="text-rose-500 animate-pulse" />}
        </div>
    );
};

export default MaintenanceInsurance;