import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { ShieldCheck, Search, Loader2, Plus, Truck, AlertCircle, Calendar, FileText, BadgeCheck } from 'lucide-react';
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

    const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925";

    const fetchFleetHealth = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/fleet-compliance/${tenantId}`);
            setFleet(res.data.data || []);
        } catch (err) { toast.error("Compliance Sync Failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchFleetHealth(); }, [tenantId]);

    const handleRenew = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/vehicles/renew-docs', {
                id: selectedVhl.id,
                ...renewData
            });
            toast.success("Digital Locker Updated! 🔒");
            setShowRenewModal(false);
            fetchFleetHealth();
        } catch (err) { toast.error("Update Error"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-slate-50 min-h-screen">
                
                {/* 🟢 COMPACT ANALYTICS HEADER */}
                <header className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="text-blue-400" size={24} />
                            <h1 className="text-lg font-black uppercase tracking-tight">Compliance</h1>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Legal Document Audit</p>
                    </div>
                    
                    <ComplianceStat label="Expired Documents" count={fleet.filter(v => isExpired(v.insurance_expiry) || isExpired(v.fitness_expiry)).length} color="rose" />
                    <ComplianceStat label="Expiring in 15 Days" count={fleet.filter(v => isExpiringSoon(v.insurance_expiry) || isExpiringSoon(v.fitness_expiry)).length} color="amber" />
                    <ComplianceStat label="Fully Compliant" count={fleet.filter(v => !isExpired(v.insurance_expiry) && !isExpired(v.fitness_expiry)).length} color="emerald" />
                </header>

                {/* 🟢 SEARCH & ACTIONS */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                        <input 
                            type="text" placeholder="Search by Vehicle Number..." 
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchFleetHealth} className="px-6 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase hover:bg-slate-100 transition-all">Refresh Audit</button>
                </div>

                {/* 🟢 COMPLIANCE TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="p-5">Vehicle Details</th>
                                    <th className="p-5">Insurance Audit</th>
                                    <th className="p-5">Fitness / PUC</th>
                                    <th className="p-5">Road Tax</th>
                                    <th className="p-5 text-center">Update</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-24 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40}/></td></tr>
                                ) : fleet.filter(v => v.vehicle_no.toLowerCase().includes(searchTerm.toLowerCase())).map((v) => (
                                    <tr key={v.id} className="hover:bg-blue-50/20 transition-all group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all"><Truck size={20}/></div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm uppercase leading-none">{v.vehicle_no}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{v.vehicle_type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-[10px] font-black text-slate-400 mb-1">POLICY: {v.policy_no || 'NOT ENTERED'}</p>
                                            <ComplianceTag date={v.insurance_expiry} />
                                        </td>
                                        <td className="p-5 space-y-2">
                                            <div className="flex items-center gap-2"><span className="text-[8px] font-black text-slate-400">FIT:</span> <ComplianceTag date={v.fitness_expiry} /></div>
                                            <div className="flex items-center gap-2"><span className="text-[8px] font-black text-slate-400">PUC:</span> <ComplianceTag date={v.pollution_expiry} /></div>
                                        </td>
                                        <td className="p-5">
                                            <ComplianceTag date={v.road_tax_expiry} />
                                        </td>
                                        <td className="p-5 text-center">
                                            <button 
                                                onClick={() => { setSelectedVhl(v); setShowRenewModal(true); }}
                                                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                            >
                                                <Plus size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 🟢 UPDATED RENEW MODAL */}
            <AnimatePresence>
                {showRenewModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-[35px] shadow-2xl overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="text-sm font-black uppercase text-slate-800 italic">Document Locker</h2>
                                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Vehicle: {selectedVhl?.vehicle_no}</p>
                                </div>
                                <button onClick={() => setShowRenewModal(false)} className="text-slate-400 hover:text-rose-500 font-bold text-xl">×</button>
                            </div>
                            <form onSubmit={handleRenew} className="p-8 space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Audit Type</label>
                                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500/10" onChange={(e) => setRenewData({...renewData, type: e.target.value})}>
                                        <option value="insurance">Insurance Policy</option>
                                        <option value="fitness">Fitness Certificate</option>
                                        <option value="pollution">Pollution (PUC)</option>
                                        <option value="road_tax">Road Tax Receipt</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Certificate / Policy No.</label>
                                    <input required type="text" placeholder="Enter doc number..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none" onChange={(e) => setRenewData({...renewData, no: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Valid Until (Expiry Date)</label>
                                    <input required type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none" onChange={(e) => setRenewData({...renewData, expiry: e.target.value})} />
                                </div>
                                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl">
                                    Upload to Locker
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// --- Helpers ---
const isExpired = (date) => date && new Date(date) < new Date();
const isExpiringSoon = (date) => {
    if(!date) return false;
    const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 15;
};

const ComplianceTag = ({ date }) => {
    const expired = isExpired(date);
    const soon = isExpiringSoon(date);
    
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit ${expired ? 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse' : soon ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
            {expired ? <AlertCircle size={10}/> : soon ? <Calendar size={10}/> : <BadgeCheck size={10}/>}
            <span className="text-[9px] font-black uppercase tracking-tight">{date ? new Date(date).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : 'NOT RECORDED'}</span>
        </div>
    );
};

const ComplianceStat = ({ label, count, color }) => (
    <div className={`bg-white p-5 rounded-3xl border-b-4 border-${color}-500 shadow-sm flex items-center justify-between`}>
        <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
            <p className={`text-2xl font-black text-${color}-600 leading-none`}>{count}</p>
        </div>
        <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center text-${color}-600`}><FileText size={18}/></div>
    </div>
);

export default MaintenanceInsurance;
