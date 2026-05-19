import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Smartphone, ShieldCheck, ShieldAlert, Map, UserX, UserCheck, 
    RefreshCcw, Loader2, Search, Gauge, Battery, Signal, 
    Clock, SmartphoneNfc, Activity, Eye, Ban, CheckCircle2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const DeviceControl = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDevice, setSelectedDevice] = useState(null); // Diagnostics Modal
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    useEffect(() => { fetchDevices(); }, [tenantId]);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/devices/${tenantId}`);
            setDevices(res.data.data || []);
        } catch (err) { 
            toast.error("Cloud Connection Failed"); 
        } finally { setLoading(false); }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/devices/update-status', { id, status });
            toast.success(`Access policy set to ${status}`);
            fetchDevices();
        } catch (err) { toast.error("System Override Failed"); }
    };

    // Filter Logic
    const filtered = devices.filter(d => 
        d.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.employee_id?.includes(searchTerm)
    );

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left bg-slate-50 min-h-screen">
                
                {/* --- 🟢 FUTURISTIC HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[45px] shadow-xl border border-slate-100 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-18 h-18 bg-slate-900 rounded-[28px] flex items-center justify-center text-emerald-400 shadow-2xl relative">
                            <Smartphone size={36} className="animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white animate-bounce" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Device Authority HUD</h1>
                            <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                                <ShieldCheck size={14}/> Mobile Handset Integrity Management
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchDevices} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-inner border border-slate-100 active:scale-95">
                            <RefreshCcw size={22} className={loading ? 'animate-spin' : ''}/>
                        </button>
                        <div className="h-14 w-px bg-slate-100 mx-2" />
                        <div className="bg-emerald-500 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-emerald-100">
                           <Activity size={18}/> {filtered.length} Connected
                        </div>
                    </div>
                </header>

                {/* --- 🟢 QUICK ANALYTICS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusBox label="Access Requests" value={devices.filter(d=>d.status==='Pending').length} icon={ShieldAlert} color="rose" />
                    <StatusBox label="Active Telemetry" value={devices.filter(d=>d.status==='Active').length} icon={UserCheck} color="emerald" />
                    <StatusBox label="Restricted Access" value={devices.filter(d=>d.status==='Blocked').length} icon={Ban} color="slate" />
                </div>

                {/* --- 🟢 DEVICE REGISTRY TABLE --- */}
                <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl overflow-hidden min-h-[550px]">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Live Handset Ecosystem</h3>
                        <div className="relative group flex-1 max-w-md">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                            <input 
                                className="w-full bg-white border-2 border-slate-100 py-4 pl-14 pr-6 rounded-[22px] outline-none text-sm font-bold text-slate-600 focus:border-emerald-500/20 focus:shadow-lg transition-all"
                                placeholder="Search via Mitra Name or Employee ID..."
                                value={searchTerm}
                                onChange={(e)=>setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="p-8">Assigned User</th>
                                    <th className="p-8">Hardware Logic</th>
                                    <th className="p-8">App Integrity</th>
                                    <th className="p-8">Sensor Health</th>
                                    <th className="p-8">Status</th>
                                    <th className="p-8 text-right">Admin Logic</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading && devices.length === 0 ? (
                                    <tr><td colSpan="6" className="p-40 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={48}/></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="6" className="p-40 text-center font-black text-slate-300 uppercase">No Handsets Found in Registry</td></tr>
                                ) : filtered.map((device) => (
                                    <tr key={device.id} className="hover:bg-emerald-50/30 transition-all duration-300 group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-emerald-500 transition-all shadow-sm">
                                                    <User size={24}/>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-base uppercase leading-none">{device.staff_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 tracking-widest">WARD #{device.ward_no || '---'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <p className="text-sm font-black text-slate-700 leading-none">{device.device_model}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1"><Smartphone size={10}/> Android {device.os_version}</p>
                                        </td>
                                        <td className="p-8">
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-100">
                                                v{device.app_version || '1.0.0'}
                                            </span>
                                            <p className="text-[8px] font-black text-slate-300 uppercase mt-2 tracking-tighter italic">Signature Verified</p>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center gap-1">
                                                    <Battery size={16} className={device.battery_level < 20 ? 'text-rose-500' : 'text-emerald-500'} />
                                                    <span className="text-[9px] font-black text-slate-500">{device.battery_level}%</span>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100" />
                                                <div className="flex flex-col items-center gap-1">
                                                    <Signal size={16} className="text-blue-500" />
                                                    <span className="text-[9px] font-black text-slate-500 uppercase">{device.signal_strength}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase inline-block w-fit shadow-sm border ${
                                                    device.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    device.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                    {device.status}
                                                </span>
                                                <p className="text-[8px] font-bold text-slate-300 uppercase flex items-center gap-1"><Clock size={10}/> Ping: {new Date(device.last_ping).toLocaleTimeString()}</p>
                                            </div>
                                        </td>
                                        <td className="p-8 text-right space-x-2">
                                            <button 
                                                onClick={() => setSelectedDevice(device)}
                                                className="p-3.5 bg-white text-slate-400 rounded-2xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                title="View Diagnostics"
                                            >
                                                <Eye size={18}/>
                                            </button>
                                            {device.status !== 'Active' ? (
                                                <button onClick={() => handleStatusUpdate(device.id, 'Active')} className="p-3.5 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 active:scale-90 transition-all"><UserCheck size={18}/></button>
                                            ) : (
                                                <button onClick={() => handleStatusUpdate(device.id, 'Blocked')} className="p-3.5 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 shadow-lg shadow-rose-100 active:scale-90 transition-all"><Ban size={18}/></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- 🟢 DEVICE DIAGNOSTICS MODAL --- */}
            <AnimatePresence>
                {selectedDevice && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedDevice(null)}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-4xl rounded-[50px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={()=>setSelectedDevice(null)} className="absolute top-6 right-6 p-3 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-full transition-all z-10"><X size={20}/></button>
                            
                            {/* Device Preview Side */}
                            <div className="w-full md:w-80 bg-slate-900 p-10 text-white flex flex-col justify-between items-center text-center">
                                <div className="space-y-6 w-full">
                                    <div className="w-24 h-24 bg-white/10 rounded-[35px] flex items-center justify-center mx-auto shadow-2xl">
                                        <SmartphoneNfc size={48} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black uppercase tracking-tighter italic">{selectedDevice.device_model}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">UUID: {selectedDevice.device_id.slice(0, 16)}...</p>
                                    </div>
                                </div>
                                <div className="w-full space-y-3">
                                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">App Version</span>
                                        <span className="text-xs font-black text-emerald-400">BETA v{selectedDevice.app_version}</span>
                                    </div>
                                    <button className="w-full py-4 bg-emerald-500 rounded-2xl font-black text-[10px] uppercase shadow-xl">Remote GPS Sync</button>
                                </div>
                            </div>

                            {/* Detailed Stats Side */}
                            <div className="flex-1 p-12 space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Gauge size={24}/></div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase italic">Handset Diagnostics</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <MetricRow label="Assigned Mitra" val={selectedDevice.staff_name} sub={`Emp ID: ${selectedDevice.employee_id}`} />
                                    <MetricRow label="Assigned Ward" val={`Ward No. ${selectedDevice.ward_no}`} sub="Geofence Active" />
                                    <MetricRow label="Last Coordinates" val={`${selectedDevice.last_lat}, ${selectedDevice.last_lng}`} sub="Google Maps Verified" />
                                    <MetricRow label="Battery Health" val={`${selectedDevice.battery_level}% Charged`} sub="Standard Drain Rate" />
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                                     <button className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase border border-slate-100">Clear Cache</button>
                                     <button className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase border border-slate-100">Force Update</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// --- ✨ Sub-Components for Clean Code ---

const StatusBox = ({ label, value, color, icon: Icon }) => (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all">
        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center bg-${color}-50 text-${color}-600 shadow-inner`}>
            <Icon size={30} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{value || 0}</h4>
        </div>
    </div>
);

const MetricRow = ({ label, val, sub }) => (
    <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-base font-black text-slate-800 uppercase">{val || 'N/A'}</p>
        <p className="text-[10px] font-bold text-emerald-600 italic leading-none">{sub}</p>
    </div>
);

export default DeviceControl;
