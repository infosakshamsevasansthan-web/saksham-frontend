import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Truck, MapPin, User, Plus, X, CheckCircle, RefreshCcw, Loader2, RotateCcw, Clock, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const WardDeployment = () => {
    const [deployments, setDeployments] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    
    const [formData, setFormData] = useState({ vehicle_id: '', ward_id: '', shift: 'Morning' });
    const [transferData, setTransferData] = useState({ deployment_id: '', new_ward_id: '' });

    const tenantId = localStorage.getItem('tenantId');
    const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const fetchData = async () => {
        if (!tenantId) return toast.error("Tenant ID missing!");
        setLoading(true);
        try {
            // Har request ko alag se handle karte hain taaki debug ho sake
            const [depRes, vhlRes, wrdRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/dispatch/today/${tenantId}`).catch(e => { console.error("Dispatch API Error:", e); return {data: {data: []}}; }),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/vehicles/${tenantId}`).catch(e => { console.error("Vehicles API Error:", e); return {data: {data: []}}; }),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`).catch(e => { console.error("Wards API Error:", e); return {data: {data: []}}; })
            ]);

            setDeployments(depRes.data.data || []);
            setVehicles(vhlRes.data.data || []);
            setWards(wrdRes.data.data || []);
        } catch (err) { 
            toast.error("Data Fetch Failed. Check Console."); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    const handleAssign = async (e) => {
        e.preventDefault();
        const selectedVhl = vehicles.find(v => v.id == formData.vehicle_id);
        if(!selectedVhl) return toast.error("Please select a vehicle");

        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/deployments/assign', {
                tenant_id: tenantId,
                vehicle_id: formData.vehicle_id,
                ward_id: formData.ward_id,
                shift: formData.shift,
                driver_id: selectedVhl.driver_id, 
                helper_id: selectedVhl.helper_id || null 
            });
            
            if(res.data.success) {
                toast.success("Dispatch Authorized! 🚛");
                setShowModal(false);
                setFormData({ vehicle_id: '', ward_id: '', shift: 'Morning' });
                fetchData();
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Assignment Error"); 
        }
    };

    // Transfer Ward Logic
    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.patch(`https://saksham-backend-9719.onrender.com/api/admin/dispatch/transfer/${transferData.deployment_id}`, {
                new_ward_id: transferData.new_ward_id
            });
            if(res.data.success) {
                toast.success("Ward Transferred! 🔄");
                setShowTransferModal(false);
                fetchData();
            }
        } catch (err) {
            toast.error("Transfer Failed");
        }
    };

    const markReturned = async (id) => {
        try {
            await axios.patch(`https://saksham-backend-9719.onrender.com/api/admin/dispatch/return/${id}`);
            toast.success("Returned ✅");
            fetchData();
        } catch (err) { toast.error("Error marking return"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left">
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-emerald-600 rounded-[24px] flex items-center justify-center text-white shadow-lg">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 uppercase italic leading-none">Dispatch Order</h1>
                            <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Date: {todayLabel}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl">
                        <Plus size={20} /> Create Daily Order
                    </button>
                </header>

                <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Active Fleet Roster</h3>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-white border-b">
                            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-6">Vehicle & Ward</th>
                                <th className="p-4">Assigned Crew</th>
                                <th className="p-4">Shift Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr>
                            ) : deployments.length === 0 ? (
                                <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-bold uppercase text-xs">No active deployments found.</td></tr>
                            ) : deployments.map((d) => (
                                <tr key={d.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="p-6">
                                        <p className="font-black text-slate-800 uppercase text-sm">{d.vehicle_no}</p>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Ward: {d.ward_no}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-slate-800 font-bold text-xs">{d.dr_en || 'Unknown Driver'}</p>
                                        <p className="text-slate-400 font-bold text-[9px] uppercase">H: {d.hl_en || 'None'}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${d.status === 'on-duty' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {d.status} • {d.shift}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center space-x-2">
                                        {d.status === 'on-duty' && (
                                            <>
                                                {/* Transfer Button */}
                                                <button 
                                                    onClick={() => { setTransferData({ ...transferData, deployment_id: d.id }); setShowTransferModal(true); }}
                                                    title="Transfer Ward"
                                                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <ArrowRightLeft size={16}/>
                                                </button>
                                                {/* Return Button */}
                                                <button onClick={() => markReturned(d.id)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                                    <RotateCcw size={16}/>
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ASSIGN MODAL --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl overflow-hidden">
                            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-xl font-black text-slate-800 uppercase italic">Duty Order</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 text-rose-500 font-bold">X</button>
                            </div>
                            <form onSubmit={handleAssign} className="p-8 space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Choose Vehicle</label>
                                    <select required className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50" onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}>
                                        <option value="">Select No...</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Assign to Ward</label>
                                    <select required className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50" onChange={(e) => setFormData({...formData, ward_id: e.target.value})}>
                                        <option value="">Select Ward...</option>
                                        {wards.map(w => <option key={w.id} value={w.id}>Ward No: {w.ward_no}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-[#1e293b] hover:bg-emerald-600 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all shadow-xl flex items-center justify-center gap-3">
                                    <CheckCircle size={20}/> Complete Order
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- TRANSFER MODAL --- */}
            <AnimatePresence>
                {showTransferModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-blue-50/50">
                                <h2 className="text-lg font-black text-slate-800 uppercase italic">Transfer Ward</h2>
                                <button onClick={() => setShowTransferModal(false)} className="p-2 text-rose-500 font-bold text-xl">×</button>
                            </div>
                            <form onSubmit={handleTransfer} className="p-8 space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Move to New Ward</label>
                                    <select required className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50" onChange={(e) => setTransferData({...transferData, new_ward_id: e.target.value})}>
                                        <option value="">Select Ward...</option>
                                        {wards.map(w => <option key={w.id} value={w.id}>Ward No: {w.ward_no}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all shadow-xl flex items-center justify-center gap-3">
                                    <ArrowRightLeft size={20}/> Transfer Now
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

export default WardDeployment;
