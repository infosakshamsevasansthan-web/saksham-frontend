import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Plus, Truck, MoreVertical, Loader2, X, Save, Signal, Fuel, 
    User, CheckCircle, Weight, Zap, MapPin, Layers, UserCheck, Search, ChevronRight 
} from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const VehicleInventory = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925";

    // --- Add Vehicle Form State ---
    const [isCustomType, setIsCustomType] = useState(false);
    const [vehicleFormData, setVehicleFormData] = useState({
        vehicle_no: '',
        vehicle_type: 'Tipper',
        custom_type: '',
        load_capacity_tons: '',
        fuel_type: 'Diesel',
        gps_device_id: '',
        status: 'active'
    });

    // --- Staff Assignment State ---
    const [staffFormData, setStaffFormData] = useState({
        circle: '',
        ward: '',
        driverName: '',
        driverId: '',
        helperName: '',
        helperId: ''
    });
    const [staffSearchResults, setStaffSearchResults] = useState({ drivers: [], helpers: [] });

    // Fuel Form States
    const [fuelData, setFuelData] = useState({ qty: '', driver: '', driverId: '', helper: '', helperId: '' });
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

    // 🟢 Staff Search (Filtered by Role)
    const handleStaffSearch = async (val, type) => {
        if (val.length < 1) {
            setStaffSearchResults(prev => ({ ...prev, [type]: [] }));
            return;
        }
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-search/${tenantId}?q=${val}`);
            const data = res.data.data || [];
            
            // Filter: Agar driver search kar rahe ho toh post 'driver' honi chahiye
            if (type === 'drivers') {
                const filtered = data.filter(s => s.post?.toLowerCase().includes('driver'));
                setStaffSearchResults(prev => ({ ...prev, drivers: filtered }));
            } else {
                setStaffSearchResults(prev => ({ ...prev, helpers: data }));
            }
        } catch (err) { console.error(err); }
    };

    // 🟢 Submit Vehicle
    const handleVehicleSubmit = async (e) => {
        e.preventDefault();
        const finalType = isCustomType ? vehicleFormData.custom_type : vehicleFormData.vehicle_type;
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/vehicles/add', {
                ...vehicleFormData,
                vehicle_type: finalType,
                tenant_id: tenantId
            });
            toast.success("Vehicle Added! 🚛");
            setShowModal(false);
            fetchVehicles();
        } catch (err) { toast.error("Failed to add vehicle"); }
    };

    // 🟢 Submit Staff Assignment
    const handleAssignStaff = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/vehicles/assign-staff', {
                ...staffFormData,
                vehicle_id: selectedVehicle.id,
                tenant_id: tenantId
            });
            toast.success("Staff Assigned Successfully! 👥");
            setShowStaffModal(false);
        } catch (err) { toast.error("Assignment failed"); }
    };

    const generateCoupon = () => {
        const res = Math.random().toString(36).substring(2, 5).toUpperCase() + Math.floor(100 + Math.random() * 900);
        setCouponCode(res);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                {/* Header */}
                <header className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl">
                            <Truck size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 uppercase italic leading-none">Fleet Manager</h1>
                            <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-[0.3em] mt-2">Inventory & Crew Control</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200">
                        <Plus size={20} /> Register New Asset
                    </button>
                </header>

                {/* Table Section */}
                <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-8">Asset Details</th>
                                <th className="p-4">Configuration</th>
                                <th className="p-4">Connectivity</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr>
                            ) : vehicles.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white border border-slate-100 text-slate-800 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <Truck size={22}/>
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 uppercase text-base leading-none">{v.vehicle_no}</p>
                                                <p className="text-[10px] font-bold text-emerald-600 mt-1.5 uppercase tracking-wider">{v.vehicle_type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Weight size={12} className="text-slate-400" />
                                                <span className="text-xs font-black text-slate-700">{v.load_capacity_tons} TONS</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Zap size={12} className="text-amber-500" />
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{v.fuel_type} ENGINE</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <Signal size={14} className={v.gps_device_id ? "text-emerald-500 animate-pulse" : "text-rose-400"} />
                                            <span className="text-[10px] font-black text-slate-600 tracking-tighter">{v.gps_device_id || 'OFFLINE'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${v.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            ● {v.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-3">
                                            <button 
                                                onClick={() => { setSelectedVehicle(v); generateCoupon(); setShowFuelModal(true); }}
                                                className="p-3 bg-white border border-slate-100 text-amber-600 rounded-2xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                                title="Fuel Allocation"
                                            >
                                                <Fuel size={18}/>
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedVehicle(v); setShowStaffModal(true); }}
                                                className="p-3 bg-white border border-slate-100 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Assign Crew"
                                            >
                                                <UserCheck size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 1. ADD VEHICLE MODAL (DYNAMIC TYPE) --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1200] flex items-center justify-center p-4">
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl overflow-hidden border border-white/20">
                            <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 uppercase italic">New Fleet Entry</h2>
                                    <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase tracking-[0.3em]">Hardware Registration</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleVehicleSubmit} className="p-10 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Registration Number</label>
                                        <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-5 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                                            <Truck size={20} className="text-slate-400" />
                                            <input required className="w-full p-5 bg-transparent outline-none font-black text-slate-800 uppercase text-lg" placeholder="BR 01 GB 1234" value={vehicleFormData.vehicle_no} onChange={(e) => setVehicleFormData({...vehicleFormData, vehicle_no: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Type of Asset</label>
                                        <select 
                                            className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none font-black text-slate-700 focus:bg-white"
                                            value={isCustomType ? "Other" : vehicleFormData.vehicle_type}
                                            onChange={(e) => {
                                                if(e.target.value === "Other") setIsCustomType(true);
                                                else { setIsCustomType(false); setVehicleFormData({...vehicleFormData, vehicle_type: e.target.value}); }
                                            }}
                                        >
                                            <option>Tipper</option>
                                            <option>Refuse Compactor</option>
                                            <option>Dumper Placer</option>
                                            <option>Sweeping Machine</option>
                                            <option value="Other">+ Add Custom Type</option>
                                        </select>
                                    </div>

                                    {isCustomType && (
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase ml-2 tracking-widest">Enter Custom Type</label>
                                            <input required className="w-full p-5 bg-emerald-50 rounded-2xl border border-emerald-200 outline-none font-black text-slate-800 uppercase" placeholder="e.g. Excavator" onChange={(e) => setVehicleFormData({...vehicleFormData, custom_type: e.target.value})} />
                                        </motion.div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Payload (Tons)</label>
                                        <input required type="number" step="0.1" className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-200 outline-none font-black text-slate-800" placeholder="0.0" value={vehicleFormData.load_capacity_tons} onChange={(e) => setVehicleFormData({...vehicleFormData, load_capacity_tons: e.target.value})} />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 hover:bg-emerald-600 text-white p-6 rounded-[30px] font-black uppercase text-xs tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-4">
                                    <Save size={20}/> Register to Fleet Database
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- 2. STAFF ASSIGNMENT MODAL (PREMIUM DESIGN) --- */}
            <AnimatePresence>
                {showStaffModal && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1200] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-4xl rounded-[55px] shadow-2xl overflow-hidden border border-white/20">
                            <div className="flex h-[600px]">
                                {/* Left Side: Vehicle Info */}
                                <div className="w-1/3 bg-slate-900 p-10 flex flex-col justify-between text-white">
                                    <div className="space-y-8">
                                        <div className="w-20 h-20 bg-emerald-400 rounded-[30px] flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-400/20">
                                            <UserCheck size={40} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black uppercase italic leading-none">Crew Assignment</h2>
                                            <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest mt-3">Link Staff to Asset</p>
                                        </div>
                                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                                            <div>
                                                <p className="text-[9px] font-black text-white/40 uppercase">Vehicle No.</p>
                                                <p className="text-xl font-black text-emerald-400">{selectedVehicle?.vehicle_no}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-white/40 uppercase">Asset Type</p>
                                                <p className="text-xs font-bold">{selectedVehicle?.vehicle_type}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowStaffModal(false)} className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-white/50 hover:text-white transition-all">
                                        <X size={16}/> Close Window
                                    </button>
                                </div>

                                {/* Right Side: Form */}
                                <form onSubmit={handleAssignStaff} className="flex-1 p-12 overflow-y-auto space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Region Info */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                                <Layers size={14} className="text-emerald-500" /> Select Circle
                                            </label>
                                            <select required className="w-full p-5 bg-slate-50 rounded-[25px] border border-slate-200 outline-none font-bold text-slate-700 focus:bg-white" onChange={(e) => setStaffFormData({...staffFormData, circle: e.target.value})}>
                                                <option value="">Select Region</option>
                                                <option>Circle 01 - North</option>
                                                <option>Circle 02 - East</option>
                                                <option>Circle 03 - West</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                                <MapPin size={14} className="text-emerald-500" /> Ward Number
                                            </label>
                                            <select required className="w-full p-5 bg-slate-50 rounded-[25px] border border-slate-200 outline-none font-bold text-slate-700 focus:bg-white" onChange={(e) => setStaffFormData({...staffFormData, ward: e.target.value})}>
                                                <option value="">Select Ward</option>
                                                {[...Array(50)].map((_, i) => (
                                                    <option key={i} value={i+1}>Ward {i+1}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Driver Search (The requested Search-as-you-type) */}
                                        <div className="col-span-2 relative space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                                <User size={14} className="text-emerald-500" /> Primary Driver (Search Name)
                                            </label>
                                            <div className="flex items-center bg-slate-50 rounded-[25px] border border-slate-200 px-6 focus-within:bg-white focus-within:shadow-xl transition-all">
                                                <Search size={20} className="text-slate-300" />
                                                <input 
                                                    required 
                                                    className="w-full p-5 bg-transparent outline-none font-bold text-slate-800" 
                                                    placeholder="Type name to search drivers..." 
                                                    value={staffFormData.driverName}
                                                    onChange={(e) => {
                                                        setStaffFormData({...staffFormData, driverName: e.target.value});
                                                        handleStaffSearch(e.target.value, 'drivers');
                                                    }}
                                                />
                                            </div>
                                            {staffSearchResults.drivers.length > 0 && (
                                                <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-3xl mt-2 border border-slate-100 z-50 overflow-hidden py-2">
                                                    {staffSearchResults.drivers.map(s => (
                                                        <div key={s.id} onClick={() => { setStaffFormData({...staffFormData, driverName: s.full_name, driverId: s.id}); setStaffSearchResults({ ...staffSearchResults, drivers: [] }); }} className="p-4 hover:bg-emerald-50 cursor-pointer flex justify-between items-center group transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px] group-hover:bg-emerald-500 group-hover:text-white">{s.full_name.charAt(0)}</div>
                                                                <span className="text-sm font-bold text-slate-700">{s.full_name}</span>
                                                            </div>
                                                            <span className="text-[9px] bg-slate-100 px-2 py-1 rounded-lg text-slate-400 font-black uppercase">ID: {s.id}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Helper Search */}
                                        <div className="col-span-2 relative space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                                <User size={14} className="text-emerald-500" /> Assistant / Helper
                                            </label>
                                            <div className="flex items-center bg-slate-50 rounded-[25px] border border-slate-200 px-6 focus-within:bg-white focus-within:shadow-xl transition-all">
                                                <Search size={20} className="text-slate-300" />
                                                <input 
                                                    className="w-full p-5 bg-transparent outline-none font-bold text-slate-800" 
                                                    placeholder="Search helper name..." 
                                                    value={staffFormData.helperName}
                                                    onChange={(e) => {
                                                        setStaffFormData({...staffFormData, helperName: e.target.value});
                                                        handleStaffSearch(e.target.value, 'helpers');
                                                    }}
                                                />
                                            </div>
                                            {staffSearchResults.helpers.length > 0 && (
                                                <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-3xl mt-2 border border-slate-100 z-50 overflow-hidden py-2">
                                                    {staffSearchResults.helpers.map(s => (
                                                        <div key={s.id} onClick={() => { setStaffFormData({...staffFormData, helperName: s.full_name, helperId: s.id}); setStaffSearchResults({ ...staffSearchResults, helpers: [] }); }} className="p-4 hover:bg-emerald-50 cursor-pointer flex justify-between items-center group transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px] group-hover:bg-emerald-500 group-hover:text-white">{s.full_name.charAt(0)}</div>
                                                                <span className="text-sm font-bold text-slate-700">{s.full_name}</span>
                                                            </div>
                                                            <span className="text-[9px] bg-slate-100 px-2 py-1 rounded-lg text-slate-400 font-black uppercase">{s.post || 'STAFF'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-emerald-500 hover:bg-slate-900 text-white p-6 rounded-[30px] font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-4">
                                        Confirm Assignment <ChevronRight size={20}/>
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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

                            <form className="p-8 space-y-6">
                                <div className="bg-emerald-50 p-4 rounded-3xl border-2 border-dashed border-emerald-200 text-center">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Generated Coupon Code</p>
                                    <p className="text-3xl font-black text-slate-800 tracking-[0.3em]">{couponCode}</p>
                                </div>
                                {/* Baaki fuel fields yahan aayenge (same as before) */}
                                <button type="button" onClick={() => setShowFuelModal(false)} className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest">
                                    Close Window
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

export default VehicleInventory;
