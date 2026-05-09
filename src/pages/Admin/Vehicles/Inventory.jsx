import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Plus, Truck, Search, MoreVertical, Loader2, X, Save, Signal, Fuel, 
    User, CheckCircle, Weight, Zap, MapPin, Layers, UserPlus, QrCode, ChevronRight 
} from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import QRCode from "react-qr-code"; // Isko install kar lena bhai: npm install react-qr-code

const VehicleInventory = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false); // Naya Staff Modal
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925";

    // --- Add Vehicle Form States ---
    const [isCustomType, setIsCustomType] = useState(false);
    const [vehicleFormData, setVehicleFormData] = useState({
        vehicle_no: '', vehicle_type: 'Tipper', custom_type: '',
        load_capacity_tons: '', fuel_type: 'Diesel', gps_device_id: '', status: 'active'
    });

    // --- Staff Assignment States (New) ---
    const [staffFormData, setStaffFormData] = useState({
        circle: '', ward: '', driverName: '', driverId: '', helperName: '', helperId: ''
    });

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

    // 🟢 Staff Search Logic (Filtered for Driver and Helper)
    const searchStaff = async (val, type) => {
        if (val.length < 1) return setStaffResults({ ...staffResults, [type]: [] });
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-search/${tenantId}?q=${val}`);
            const data = res.data.data || [];
            if (type === 'drivers') {
                // Sirf unko dikhao jinka post 'driver' hai
                const filtered = data.filter(s => s.post?.toLowerCase().includes('driver'));
                setStaffResults(prev => ({ ...prev, drivers: filtered }));
            } else {
                setStaffResults(prev => ({ ...prev, helpers: data }));
            }
        } catch (err) { console.error(err); }
    };

    // 🟢 Add Vehicle Submit
    const handleVehicleSubmit = async (e) => {
        e.preventDefault();
        const finalType = isCustomType ? vehicleFormData.custom_type : vehicleFormData.vehicle_type;
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/vehicles/add', {
                ...vehicleFormData, vehicle_type: finalType, tenant_id: tenantId
            });
            toast.success("Vehicle Added! 🚛");
            setShowModal(false);
            fetchVehicles();
        } catch (err) { toast.error("Error adding vehicle"); }
    };

    // 🟢 Staff Assign Submit
    const handleAssignStaffSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/vehicles/assign-crew', {
                ...staffFormData, vehicle_id: selectedVehicle.id, tenant_id: tenantId
            });
            toast.success("Crew Assigned Successfully! 👥");
            setShowStaffModal(false);
        } catch (err) { toast.error("Assignment failed"); }
    };

    const generateCoupon = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const nums = "0123456789";
        let res = "";
        for (let i = 0; i < 3; i++) res += letters.charAt(Math.floor(Math.random() * letters.length));
        for (let i = 0; i < 3; i++) res += nums.charAt(Math.floor(Math.random() * nums.length));
        setCouponCode(res);
    };

    const handleFuelSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/fuel/generate', {
                tenant_id: tenantId, vehicle_id: selectedVehicle.id, driver_id: fuelData.driverId,
                helper_id: fuelData.helperId, fuel_qty: fuelData.qty, coupon_code: couponCode
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
                                                className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all"
                                                title="Fuel Coupon"
                                            >
                                                <Fuel size={18}/>
                                            </button>
                                            {/* Staff Assign Button */}
                                            <button 
                                                onClick={() => { setSelectedVehicle(v); setShowStaffModal(true); }}
                                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                                title="Assign Staff"
                                            >
                                                <UserPlus size={18}/>
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

            {/* --- FUEL COUPON MODAL (RESORED + QR ADDED) --- */}
            <AnimatePresence>
                {showFuelModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
                            
                            {/* Left: Digital Slip/QR Side */}
                            <div className="md:w-1/3 bg-slate-900 p-8 flex flex-col items-center justify-center text-center text-white">
                                <QrCode size={40} className="text-emerald-400 mb-4" />
                                <h2 className="text-xl font-black uppercase italic leading-none mb-6 tracking-tighter">Digital Fuel Slip</h2>
                                
                                <div className="bg-white p-4 rounded-3xl mb-6 shadow-2xl shadow-emerald-500/20">
                                    {/* Secure QR Content: Coupon, Vehicle No and Quantity */}
                                    <QRCode 
                                        size={180}
                                        value={`COUPON:${couponCode}|VHL:${selectedVehicle?.vehicle_no}|QTY:${fuelData.qty || 0}|TENANT:${tenantId}`}
                                        viewBox={`0 0 256 256`}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    />
                                </div>
                                <p className="text-3xl font-black text-emerald-400 tracking-[0.2em]">{couponCode}</p>
                                <p className="text-[10px] font-bold text-white/40 uppercase mt-2">{selectedVehicle?.vehicle_no}</p>
                            </div>

                            {/* Right: Allocation Form Side */}
                            <form onSubmit={handleFuelSubmit} className="flex-1 p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-black text-slate-800 uppercase italic">Fuel Allocation</h2>
                                    <button type="button" onClick={() => setShowFuelModal(false)} className="p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all">X</button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Fuel Quantity (Liters)</label>
                                        <input required type="number" step="0.01" className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50 focus:bg-white" placeholder="Enter quantity" onChange={(e) => setFuelData({...fuelData, qty: e.target.value})} />
                                    </div>

                                    <div className="relative space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Driver Name / ID</label>
                                        <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 focus-within:bg-white transition-all">
                                            <User size={16} className="text-slate-400" />
                                            <input required value={fuelData.driver} className="w-full p-4 bg-transparent outline-none font-bold text-slate-700 text-sm" placeholder="Search Driver" onChange={(e) => { setFuelData({...fuelData, driver: e.target.value}); searchStaff(e.target.value, 'drivers'); }} />
                                        </div>
                                        {staffResults.drivers.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-2xl mt-2 border border-slate-100 z-50 overflow-hidden py-2">
                                                {staffResults.drivers.map(s => (
                                                    <div key={s.id} onClick={() => { setFuelData({...fuelData, driver: s.full_name, driverId: s.id}); setStaffResults({...staffResults, drivers: []}); }} className="p-3 hover:bg-emerald-50 cursor-pointer flex justify-between items-center px-4">
                                                        <span className="text-xs font-bold text-slate-700">{s.full_name}</span>
                                                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded font-black uppercase">ID: {s.id}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Helper Name / ID</label>
                                        <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-4 focus-within:bg-white transition-all">
                                            <User size={16} className="text-slate-400" />
                                            <input value={fuelData.helper} className="w-full p-4 bg-transparent outline-none font-bold text-slate-700 text-sm" placeholder="Search Helper" onChange={(e) => { setFuelData({...fuelData, helper: e.target.value}); searchStaff(e.target.value, 'helpers'); }} />
                                        </div>
                                        {staffResults.helpers.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-2xl mt-2 border border-slate-100 z-50 overflow-hidden py-2">
                                                {staffResults.helpers.map(s => (
                                                    <div key={s.id} onClick={() => { setFuelData({...fuelData, helper: s.full_name, helperId: s.id}); setStaffResults({...staffResults, helpers: []}); }} className="p-3 hover:bg-emerald-50 cursor-pointer flex justify-between items-center px-4">
                                                        <span className="text-xs font-bold text-slate-700">{s.full_name}</span>
                                                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded font-black uppercase">ID: {s.id}</span>
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

            {/* --- STAFF ASSIGNMENT MODAL (NEW) --- */}
            <AnimatePresence>
                {showStaffModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
                            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase italic">Assign Crew</h2>
                                    <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase tracking-widest">Gaadi: {selectedVehicle?.vehicle_no} ({selectedVehicle?.vehicle_type})</p>
                                </div>
                                <button onClick={() => setShowStaffModal(false)} className="p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all">X</button>
                            </div>

                            <form onSubmit={handleAssignStaffSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1"><Layers size={12}/> Circle</label>
                                        <select required className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50" onChange={(e) => setStaffFormData({...staffFormData, circle: e.target.value})}>
                                            <option value="">Select Circle</option>
                                            <option>Circle 01</option><option>Circle 02</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1"><MapPin size={12}/> Ward</label>
                                        <select required className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50" onChange={(e) => setStaffFormData({...staffFormData, ward: e.target.value})}>
                                            <option value="">Select Ward</option>
                                            {[...Array(20)].map((_, i) => <option key={i}>Ward {i+1}</option>)}
                                        </select>
                                    </div>

                                    {/* Driver Real-time Search */}
                                    <div className="col-span-2 relative space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1"><User size={12}/> Primary Driver (Search Name)</label>
                                        <input 
                                            required className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50" 
                                            placeholder="Type name to search..." 
                                            value={staffFormData.driverName}
                                            onChange={(e) => { setStaffFormData({...staffFormData, driverName: e.target.value}); searchStaff(e.target.value, 'drivers'); }}
                                        />
                                        {staffResults.drivers.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-2xl mt-2 border border-slate-100 z-50 overflow-hidden py-2">
                                                {staffResults.drivers.map(s => (
                                                    <div key={s.id} onClick={() => { setStaffFormData({...staffFormData, driverName: s.full_name, driverId: s.id}); setStaffResults({...staffResults, drivers: []}); }} className="p-3 hover:bg-emerald-50 cursor-pointer flex justify-between items-center px-4">
                                                        <span className="text-xs font-bold text-slate-700">{s.full_name}</span>
                                                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded font-black">DRIVER ID: {s.id}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Helper Real-time Search */}
                                    <div className="col-span-2 relative space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-1"><User size={12}/> Assistant Helper</label>
                                        <input 
                                            className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50" 
                                            placeholder="Type name to search..." 
                                            value={staffFormData.helperName}
                                            onChange={(e) => { setStaffFormData({...staffFormData, helperName: e.target.value}); searchStaff(e.target.value, 'helpers'); }}
                                        />
                                        {staffResults.helpers.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-2xl mt-2 border border-slate-100 z-50 overflow-hidden py-2">
                                                {staffResults.helpers.map(s => (
                                                    <div key={s.id} onClick={() => { setStaffFormData({...staffFormData, helperName: s.full_name, helperId: s.id}); setStaffResults({...staffResults, helpers: []}); }} className="p-3 hover:bg-emerald-50 cursor-pointer flex justify-between items-center px-4">
                                                        <span className="text-xs font-bold text-slate-700">{s.full_name}</span>
                                                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded font-black">{s.post || 'STAFF'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all shadow-xl flex items-center justify-center gap-3">
                                    <Save size={20}/> Confirm Assignment <ChevronRight size={16}/>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- ADD VEHICLE MODAL (DYNAMIC TYPE ADDED) --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
                            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase italic">Add New Asset</h2>
                                    <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase tracking-widest">Register vehicle to fleet</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><X size={20}/></button>
                            </div>

                            <form onSubmit={handleVehicleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Registration Number</label>
                                        <input required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold uppercase" placeholder="e.g. BR01-1234" onChange={(e) => setVehicleFormData({...vehicleFormData, vehicle_no: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Vehicle Type</label>
                                        <select 
                                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold"
                                            onChange={(e) => {
                                                if(e.target.value === "Other") setIsCustomType(true);
                                                else { setIsCustomType(false); setVehicleFormData({...vehicleFormData, vehicle_type: e.target.value}); }
                                            }}
                                        >
                                            <option>Tipper</option><option>Refuse Compactor</option><option>Dumper Placer</option><option value="Other">+ Other (Custom)</option>
                                        </select>
                                    </div>

                                    {isCustomType && (
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[9px] font-black text-emerald-600 uppercase ml-2">Enter Custom Vehicle Type</label>
                                            <input required className="w-full p-4 bg-emerald-50 rounded-2xl border border-emerald-200 font-bold" placeholder="e.g. J.C.B or Mini Truck" onChange={(e) => setVehicleFormData({...vehicleFormData, custom_type: e.target.value})} />
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Load Capacity (Tons)</label>
                                        <input required type="number" step="0.1" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold" placeholder="0.0" onChange={(e) => setVehicleFormData({...vehicleFormData, load_capacity_tons: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Fuel Type</label>
                                        <select className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold" onChange={(e) => setVehicleFormData({...vehicleFormData, fuel_type: e.target.value})}>
                                            <option>Diesel</option><option>CNG</option><option>Petrol</option><option>Electric</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 hover:bg-emerald-600 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest transition-all">Register Vehicle</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </CityLayout>
    );
};

export default VehicleInventory;
