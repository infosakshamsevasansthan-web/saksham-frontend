import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Portal import kiya
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Plus, Truck, Search, MoreVertical, Loader2, X, Fuel, Signal, QrCode 
} from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import QRCode from "react-qr-code";

const VehicleInventory = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false); 
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925";
    const API_URL = "https://saksham-backend-9719.onrender.com/api/admin";

    const [isCustomType, setIsCustomType] = useState(false);
    const [vehicleFormData, setVehicleFormData] = useState({
        vehicle_no: '', vehicle_type: 'Tipper', custom_type: '', load_capacity_tons: '', fuel_type: 'Diesel', gps_device_id: '', status: 'active'
    });

    const [fuelData, setFuelData] = useState({ qty: '', driver: '', driverId: '', helper: '', helperId: '' });
    const [staffResults, setStaffResults] = useState({ drivers: [], helpers: [] });
    const [couponCode, setCouponCode] = useState('');

    const fetchVehicles = async () => {
        try {
            const res = await axios.get(`${API_URL}/vehicles/${tenantId}`);
            setVehicles(res.data.data || []);
        } catch (err) { console.error("Error fetching vehicles:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchVehicles(); }, []);

    const generateCoupon = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        let res = "";
        for (let i = 0; i < 3; i++) res += letters.charAt(Math.floor(Math.random() * letters.length));
        for (let i = 0; i < 3; i++) res += nums.charAt(Math.floor(Math.random() * nums.length));
        setCouponCode(res);
    };

    const searchStaff = async (val, type) => {
        if (val.length < 1) return setStaffResults(prev => ({ ...prev, [type]: [] }));
        try {
            const res = await axios.get(`${API_URL}/staff-search/${tenantId}?q=${val}`);
            const data = res.data.data || [];
            if (type === 'drivers') {
                const filtered = data.filter(s => s.post?.toLowerCase().includes('driver'));
                setStaffResults(prev => ({ ...prev, drivers: filtered }));
            } else {
                setStaffResults(prev => ({ ...prev, helpers: data }));
            }
        } catch (err) { console.error(err); }
    };

    const handleVehicleSubmit = async (e) => {
        e.preventDefault();
        const finalType = isCustomType ? vehicleFormData.custom_type : vehicleFormData.vehicle_type;
        try {
            await axios.post(`${API_URL}/vehicles/add`, {
                ...vehicleFormData, vehicle_type: finalType, tenant_id: tenantId
            });
            toast.success("Vehicle Added! 🚛");
            setShowModal(false);
            fetchVehicles();
        } catch (err) { toast.error("Submission failed"); }
    };

    // --- MODAL COMPONENT USING PORTAL ---
    const ModalPortal = ({ children, isOpen, onClose }) => {
        if (typeof window === 'undefined' || !isOpen) return null;
        return createPortal(
            <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto px-4 py-10">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden z-[1000000] my-auto"
                >
                    {children}
                </motion.div>
            </div>,
            document.body
        );
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            
            <div className="p-4 space-y-6 text-left relative z-10">
                {/* --- HEADER --- */}
                <header className="flex justify-between items-center bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm relative z-[9999] pointer-events-auto">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase italic">Vehicle Inventory</h1>
                        <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-[0.3em]">Fleet Asset Database</p>
                    </div>
                    
                    {/* FIXED BUTTON: pointer-events-auto added */}
                    <button 
    type="button"
    onClick={() => {
        alert("BUTTON CLICK WORKING");
        setShowModal(true);
    }}
                        className="relative z-[10000] pointer-events-auto cursor-pointer bg-[#10b981] hover:bg-[#059669] text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                        <Plus size={18} /> ADD VEHICLE
                    </button>
                </header>

                {/* --- TABLE --- */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b">
                            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-6">Vehicle Details</th>
                                <th className="p-4">Specs & Capacity</th>
                                <th className="p-4">GPS Device</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={30}/></td></tr>
                            ) : vehicles.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="p-6 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Truck size={20}/></div>
                                        <div>
                                            <p className="font-black text-slate-800 uppercase text-sm leading-none">{v.vehicle_no}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{v.vehicle_type}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-xs font-black text-slate-700">{v.load_capacity_tons} TONS</p>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{v.fuel_type}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Signal size={14} className={v.gps_device_id ? "text-emerald-500" : "text-rose-400"} />
                                            <span className="text-[10px] font-bold">{v.gps_device_id || 'Not Assigned'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => { setSelectedVehicle(v); generateCoupon(); setShowFuelModal(true); }}
                                                className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <Fuel size={18}/>
                                            </button>
                                            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-200 transition-all"><MoreVertical size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD VEHICLE MODAL PORTAL --- */}
            <AnimatePresence>
                {showModal && (
                    <ModalPortal isOpen={showModal} onClose={() => setShowModal(false)}>
                        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase italic">Add New Asset</h2>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Register vehicle to fleet</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleVehicleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Registration No.</label>
                                    <input required className="w-full p-4 rounded-2xl border border-slate-200 font-bold uppercase bg-slate-50" placeholder="BR01-1234" onChange={(e) => setVehicleFormData({...vehicleFormData, vehicle_no: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Vehicle Type</label>
                                    <select className="w-full p-4 rounded-2xl border border-slate-200 font-bold bg-slate-50" onChange={(e) => {
                                        if(e.target.value === "Other") setIsCustomType(true);
                                        else { setIsCustomType(false); setVehicleFormData({...vehicleFormData, vehicle_type: e.target.value}); }
                                    }}>
                                        <option>Tipper</option><option>Refuse Compactor</option><option>Dumper Placer</option><option value="Other">+ Other</option>
                                    </select>
                                </div>
                                {isCustomType && (
                                    <div className="col-span-2"><input required className="w-full p-4 rounded-2xl border border-emerald-200 font-bold bg-emerald-50" placeholder="Custom type..." onChange={(e) => setVehicleFormData({...vehicleFormData, custom_type: e.target.value})} /></div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Load Capacity</label>
                                    <input required type="number" step="0.1" className="w-full p-4 rounded-2xl border border-slate-200 font-bold bg-slate-50" placeholder="Tons" onChange={(e) => setVehicleFormData({...vehicleFormData, load_capacity_tons: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Fuel Type</label>
                                    <select className="w-full p-4 rounded-2xl border border-slate-200 font-bold bg-slate-50" onChange={(e) => setVehicleFormData({...vehicleFormData, fuel_type: e.target.value})}>
                                        <option>Diesel</option><option>CNG</option><option>Petrol</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-xs hover:bg-emerald-600 transition-all">Register Asset</button>
                        </form>
                    </ModalPortal>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

export default VehicleInventory;
