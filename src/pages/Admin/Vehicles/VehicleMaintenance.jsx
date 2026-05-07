import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Settings, Wrench, Calendar, Loader2, X, CheckCircle2, ShieldAlert, Truck, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const VehicleMaintenance = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedVhl, setSelectedVhl] = useState(null);

    // 🔐 Tenant ID Logic (Same as your household registry for consistency)
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = storedUser.tenant || localStorage.getItem('tenantId') || "SAK-SIW-6925";

    const [formData, setFormData] = useState({
        service_type: 'Routine Service', 
        description: '', 
        garage_name: '', 
        cost: '', 
        service_date: '', 
        next_service_date: '', 
        v_status: 'active'
    });

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/maintenance/status/${tenantId}`);
            setVehicles(res.data.data || []);
        } catch (err) { 
            toast.error("Error loading fleet data"); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { 
        if(tenantId) fetchStatus(); 
    }, [tenantId]);

    const handleOpenModal = (vhl) => {
        setSelectedVhl(vhl);
        // Reset form data for new entry
        setFormData({
            service_type: 'Routine Service', description: '', garage_name: '', 
            cost: '', service_date: '', next_service_date: '', v_status: vhl.status || 'active'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!selectedVhl) return toast.error("Please select a vehicle");
        
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/maintenance/add', { 
                ...formData, 
                tenant_id: tenantId, 
                vehicle_id: selectedVhl.id 
            });
            toast.success("Maintenance Log Saved! 🛠️");
            setShowModal(false);
            fetchStatus();
        } catch (err) { 
            toast.error("Update failed. Check server connection."); 
        }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-12 text-left bg-slate-50 min-h-screen">
                
                {/* HEADER SECTION (Sudhara hua with Add Button) */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg">
                            <Settings size={32} className="animate-spin-slow" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Fleet Health Center</h1>
                            <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-[0.3em] mt-2">Operational Maintenance Command</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex gap-2">
                            <div className="bg-rose-50 px-5 py-2 rounded-xl border border-rose-100 text-center">
                                 <p className="text-[7px] font-black text-slate-400 uppercase">Breakdown</p>
                                 <p className="text-lg font-black text-rose-600">{vehicles.filter(v => v.status === 'maintenance').length}</p>
                            </div>
                            <div className="bg-emerald-50 px-5 py-2 rounded-xl border border-emerald-100 text-center">
                                 <p className="text-[7px] font-black text-slate-400 uppercase">Operational</p>
                                 <p className="text-lg font-black text-emerald-600">{vehicles.filter(v => v.status === 'active').length}</p>
                            </div>
                        </div>
                        
                        {/* 🟢 NAYA ADD BUTTON (Jo chhoot gaya tha) */}
                        <button 
                            onClick={() => vehicles.length > 0 ? handleOpenModal(vehicles[0]) : toast.error("No vehicles found")}
                            className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl"
                        >
                            <Plus size={18}/> Add Repair Log
                        </button>
                    </div>
                </header>

                {/* TRUCK GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 pt-10">
                    {loading ? (
                        <div className="col-span-full py-40 text-center">
                            <Loader2 className="animate-spin mx-auto text-emerald-500" size={50}/>
                            <p className="mt-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Scanning Fleet Assets...</p>
                        </div>
                    ) : vehicles.length > 0 ? (
                        vehicles.map((v) => (
                            <TruckCard key={v.id} v={v} onService={() => handleOpenModal(v)} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                             <Truck size={40} className="mx-auto text-slate-200 mb-4"/>
                             <p className="font-black text-slate-400 uppercase tracking-widest">No vehicles registered in this tenant</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL (FIXED Z-INDEX & TRIGGER) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[45px] shadow-2xl overflow-hidden border border-white/20"
                        >
                            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase italic leading-none">Repair Log Entry</h2>
                                    <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-widest">Vehicle: {selectedVhl?.vehicle_no}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm font-black hover:bg-rose-50 transition-all border border-slate-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Work Category</label>
                                        <select className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.service_type} onChange={(e) => setFormData({...formData, service_type: e.target.value})}>
                                            <option>Routine Service</option>
                                            <option>Engine Repair</option>
                                            <option>Tyre Work</option>
                                            <option>Battery/Electric</option>
                                            <option>Body/Paint Work</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Estimate Cost (₹)</label>
                                        <input type="number" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="0.00" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Workshop / Garage Name</label>
                                    <input type="text" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Authorized Service Center" value={formData.garage_name} onChange={(e) => setFormData({...formData, garage_name: e.target.value})} />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Fleet Operational Status</label>
                                        <select className="w-full p-4 border-2 border-emerald-100 rounded-2xl font-black text-emerald-600 bg-emerald-50 text-xs outline-none" value={formData.v_status} onChange={(e) => setFormData({...formData, v_status: e.target.value})}>
                                            <option value="active">Active (On-Road)</option>
                                            <option value="maintenance">Maintenance (Locked)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Service Date</label>
                                        <input type="date" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-sm outline-none" value={formData.service_date} onChange={(e) => setFormData({...formData, service_date: e.target.value})} />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 mt-4 shadow-xl shadow-slate-200">
                                    <CheckCircle2 size={20}/> Authorize Entry & Update Fleet
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// --- 🟢 TRUCK SHAPED CARD ---
const TruckCard = ({ v, onService }) => {
    const isMaint = v.status === 'maintenance';

    return (
        <motion.div 
            whileHover={{ x: 30 }}
            onClick={onService} 
            className="relative flex items-end group cursor-pointer"
        >
            <div className={`w-24 h-32 rounded-tr-[40px] rounded-tl-[20px] transition-colors duration-500 shadow-lg relative z-20 ${isMaint ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                <div className="absolute top-4 right-2 w-16 h-12 bg-white/20 rounded-tr-[30px] rounded-tl-lg border border-white/30" />
                <div className="absolute top-20 right-4 w-4 h-1 bg-black/20 rounded-full" />
                <div className="absolute bottom-6 left-0 w-3 h-6 bg-amber-400 rounded-r-full shadow-[5px_0_15px_rgba(251,191,36,0.5)]" />
            </div>

            <div className={`flex-1 bg-white p-6 rounded-tr-[40px] rounded-br-[20px] border-y-4 border-r-4 transition-all duration-500 relative z-10 -ml-1 h-44 shadow-2xl ${isMaint ? 'border-rose-500 shadow-rose-100' : 'border-emerald-500 shadow-emerald-100'}`}>
                
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">{v.vehicle_no}</h3>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{v.vehicle_type}</p>
                    </div>
                    <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                        <Wrench size={18} />
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <StatusDot label="FIT" date={v.fitness_expiry} />
                    <StatusDot label="INS" date={v.insurance_expiry} />
                    <StatusDot label="POL" date={v.pollution_expiry} />
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Last Checkup: <span className="text-slate-800 ml-1">{v.last_service ? new Date(v.last_service).toLocaleDateString('en-GB', {day:'2-digit', month:'short'}) : 'N/A'}</span></p>
                    <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase ${isMaint ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {v.status}
                    </span>
                </div>
            </div>

            <div className="absolute -bottom-5 left-8 z-30 flex gap-48">
                <Tyre />
                <Tyre />
            </div>
        </motion.div>
    );
};

const Tyre = () => (
    <div className="w-12 h-12 rounded-full bg-[#111] border-[4px] border-[#222] relative flex items-center justify-center shadow-xl overflow-hidden">
        <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-slate-600 flex items-center justify-center relative">
            <div className="absolute w-full h-[1px] bg-slate-600 rotate-45" />
            <div className="absolute w-full h-[1px] bg-slate-600 -rotate-45" />
            <div className="w-2 h-2 rounded-full bg-slate-700 z-10" />
        </div>
    </div>
);

const StatusDot = ({ label, date }) => {
    const expired = date && new Date(date) < new Date();
    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${expired ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${expired ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className={`text-[7px] font-black uppercase ${expired ? 'text-rose-600' : 'text-slate-400'}`}>{label}</span>
        </div>
    );
};

export default VehicleMaintenance;
