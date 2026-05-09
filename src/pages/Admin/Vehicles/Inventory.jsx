import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Plus, Truck, Search, MoreVertical, Loader2, X, Save, Signal, Fuel, User, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const VehicleInventory = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const tenantId = localStorage.getItem('tenantId');

    // Fuel Form States
    const [fuelData, setFuelData] = useState({ qty: '', driver: '', driverId: '', helper: '', helperId: '' });
    const [staffResults, setStaffResults] = useState({ drivers: [], helpers: [] });
    const [couponCode, setCouponCode] = useState('');

    // Fetch Vehicles
    const fetchVehicles = async () => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/vehicles/${tenantId}`);
            setVehicles(res.data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchVehicles(); }, []);

    // 🟢 Generate 3 Alpha + 3 Numeric Coupon
    const generateCoupon = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        let res = "";
        for (let i = 0; i < 3; i++) res += letters.charAt(Math.floor(Math.random() * letters.length));
        for (let i = 0; i < 3; i++) res += nums.charAt(Math.floor(Math.random() * nums.length));
        setCouponCode(res);
    };

    // 🟢 Staff Search Logic
    const searchStaff = async (val, type) => {
        if (val.length < 1) return setStaffResults({ ...staffResults, [type]: [] });
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-search/${tenantId}?q=${val}`);
            setStaffResults({ ...staffResults, [type]: res.data.data });
        } catch (err) { console.error(err); }
    };

    const handleFuelSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/fuel/generate', {
                tenant_id: tenantId,
                vehicle_id: selectedVehicle.id,
                driver_id: fuelData.driverId,
                helper_id: fuelData.helperId,
                fuel_qty: fuelData.qty,
                coupon_code: couponCode
            });
            if (res.data.success) {
                toast.success(`Coupon Generated: ${couponCode}`, { duration: 6000 });
                setShowFuelModal(false);
                setFuelData({ qty: '', driver: '', driverId: '', helper: '', helperId: '' });
            }
        } catch (err) { toast.error("Error generating coupon"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                <header className="flex justify-between items-center bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase italic">Vehicle Inventory</h1>
                        <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-[0.3em]">Fleet Asset Database</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl">
                        <Plus size={18} /> Add Vehicle
                    </button>
                </header>

                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b">
                            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-6">Vehicle Details</th>
                                <th className="p-4">Specs & Capacity</th>
                                <th className="p-4">GPS Device</th>
                                <th className="p-4">Status</th>
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
                                    <td className="p-4"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{v.status}</span></td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => { setSelectedVehicle(v); generateCoupon(); setShowFuelModal(true); }}
                                                className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                                title="Fuel Coupon"
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

            {/* --- FUEL COUPON MODAL --- */}
            <AnimatePresence>
                {showFuelModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
                            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase italic leading-none">Fuel Allocation</h2>
                                    <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase tracking-widest">Gaadi: {selectedVehicle?.vehicle_no}</p>
                                </div>
                                <button onClick={() => setShowFuelModal(false)} className="p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all">X</button>
                            </div>

                            <form onSubmit={handleFuelSubmit} className="p-8 space-y-6">
                                {/* Coupon Display */}
                                <div className="bg-emerald-50 p-4 rounded-3xl border-2 border-dashed border-emerald-200 text-center">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Generated Coupon Code</p>
                                    <p className="text-3xl font-black text-slate-800 tracking-[0.3em]">{couponCode}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Fuel Quantity (Liters)</label>
                                        <input required type="number" step="0.01" className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50 focus:bg-white transition-all" placeholder="Enter quantity" onChange={(e) => setFuelData({...fuelData, qty: e.target.value})} />
                                    </div>

                                    {/* DRIVER SEARCH */}
                                    <div className="relative space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Driver Name / ID</label>
                                        <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 focus-within:bg-white transition-all">
                                            <User size={16} className="text-slate-400" />
                                            <input required value={fuelData.driver} className="w-full p-4 bg-transparent outline-none font-bold text-slate-700 text-sm" placeholder="Search Driver" onChange={(e) => { setFuelData({...fuelData, driver: e.target.value}); searchStaff(e.target.value, 'drivers'); }} />
                                        </div>
                                        {staffResults.drivers.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-2xl mt-2 border border-slate-100 z-50 overflow-hidden">
                                                {staffResults.drivers.map(s => (
                                                    <div key={s.id} onClick={() => { setFuelData({...fuelData, driver: s.full_name, driverId: s.id}); setStaffResults({...staffResults, drivers: []}); }} className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 flex justify-between items-center">
                                                        <span className="text-xs font-bold text-slate-700">{s.full_name}</span>
                                                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-black uppercase">ID: {s.id}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* HELPER SEARCH */}
                                    <div className="relative space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Helper Name / ID</label>
                                        <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 focus-within:bg-white transition-all">
                                            <User size={16} className="text-slate-400" />
                                            <input value={fuelData.helper} className="w-full p-4 bg-transparent outline-none font-bold text-slate-700 text-sm" placeholder="Search Helper" onChange={(e) => { setFuelData({...fuelData, helper: e.target.value}); searchStaff(e.target.value, 'helpers'); }} />
                                        </div>
                                        {staffResults.helpers.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-2xl mt-2 border border-slate-100 z-50 overflow-hidden">
                                                {staffResults.helpers.map(s => (
                                                    <div key={s.id} onClick={() => { setFuelData({...fuelData, helper: s.full_name, helperId: s.id}); setStaffResults({...staffResults, helpers: []}); }} className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 flex justify-between items-center">
                                                        <span className="text-xs font-bold text-slate-700">{s.full_name}</span>
                                                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-black uppercase">ID: {s.id}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 hover:bg-emerald-600 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all shadow-xl flex items-center justify-center gap-3">
                                    <CheckCircle size={20}/> Issue Coupon & Notify Pump
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* (Keep your Existing Vehicle Add Modal here...) */}
        </CityLayout>
    );
};

export default VehicleInventory;
