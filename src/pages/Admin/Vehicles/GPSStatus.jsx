import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Signal, Wifi, Search, RefreshCcw, Loader2, Cpu, HardDrive, Plus, X, CheckCircle2, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const GPSStatus = () => {
    const [devices, setDevices] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]); // Modal ke liye
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [linkData, setLinkData] = useState({ v_id: '', gps_id: '', imei: '', sim: '' });
    const tenantId = localStorage.getItem('tenantId');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statusRes, vhlRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/gps-status/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/vehicles/${tenantId}`)
            ]);
            setDevices(statusRes.data.data || []);
            setAllVehicles(vhlRes.data.data || []);
        } catch (err) { toast.error("Connection error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    const handleLinkGPS = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/vehicles/link-gps', {
                vehicle_id: linkData.v_id,
                gps_id: linkData.gps_id,
                imei: linkData.imei,
                sim: linkData.sim
            });
            if(res.data.success) {
                toast.success("Old GPS Integrated! 📡");
                setShowModal(false);
                fetchData();
            }
        } catch (err) { toast.error("Integration failed"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-5 text-left bg-slate-50 min-h-screen">
                
                {/* COMPACT HEADER */}
                <header className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400">
                            <Cpu size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">GPS Signal Room</h1>
                            <p className="text-slate-400 font-bold text-[8px] uppercase tracking-widest mt-0.5">Device Health & Integration</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-md">
                            <Link2 size={14}/> Connect Old GPS
                        </button>
                        <button onClick={fetchData} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-emerald-600 border border-slate-200 transition-all">
                            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>
                </header>

                {/* SEARCH */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                    <input type="text" placeholder="Search Vehicle or IMEI..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/10" onChange={(e)=>setSearchTerm(e.target.value)} />
                </div>

                {/* DEVICES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32}/></div>
                    ) : devices.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-300 font-bold uppercase text-[10px] tracking-widest">No Integrated Devices Found</div>
                    ) : devices.filter(d => d.vehicle_no.includes(searchTerm.toUpperCase())).map((device) => (
                        <div key={device.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-500 border border-slate-100">
                                    <Signal size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-sm uppercase">{device.vehicle_no}</h3>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{device.gps_device_id}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[7px] font-black uppercase">Live</span>
                                </div>
                            </div>

                            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-[8px] font-black text-slate-400 uppercase">IMEI</span>
                                    <span className="text-[9px] font-bold text-slate-700">{device.imei_no}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[8px] font-black text-slate-400 uppercase">SIM</span>
                                    <span className="text-[9px] font-bold text-slate-700">{device.sim_no}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400 px-1">
                                <span>Last Ping: {device.last_ping ? new Date(device.last_ping).toLocaleTimeString() : 'N/A'}</span>
                                <span className="text-emerald-500">Signal: {device.signal_strength}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* INTEGRATION MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 text-left">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h2 className="text-xs font-black uppercase text-slate-700">Connect Existing Device</h2>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 font-bold text-xl">X</button>
                            </div>
                            <form onSubmit={handleLinkGPS} className="p-5 space-y-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">1. Choose Vehicle</label>
                                    <select required className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none" onChange={(e)=>setLinkData({...linkData, v_id: e.target.value})}>
                                        <option value="">Select No...</option>
                                        {allVehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">2. Existing Device ID</label>
                                    <input required className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none" placeholder="e.g. GPS-9901" onChange={(e)=>setLinkData({...linkData, gps_id: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">IMEI Number</label>
                                        <input required className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none" placeholder="15 Digit No." onChange={(e)=>setLinkData({...linkData, imei: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">SIM Number</label>
                                        <input required className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none" placeholder="SIM Number" onChange={(e)=>setLinkData({...linkData, sim: e.target.value})} />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16}/> Integrate Software
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

export default GPSStatus;