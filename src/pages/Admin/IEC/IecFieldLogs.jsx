import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Camera, MapPin, User, Clock, Image as ImageIcon, 
    RefreshCcw, Loader2, Search, ExternalLink, Calendar, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const IecFieldLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImg, setSelectedImg] = useState(null); // Full Screen Image Preview
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    useEffect(() => { fetchLogs(); }, [tenantId]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/iec/field-logs/${tenantId}`);
            setLogs(res.data.data || []);
        } catch (err) { toast.error("Logs sync fail ho gaye"); }
        finally { setLoading(false); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-slate-50 min-h-screen">
                
                {/* --- 🟢 HEADER --- */}
                <header className="bg-white p-6 rounded-[35px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                            <Camera size={30} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase italic">Field Activity Logs</h1>
                            <p className="text-rose-500 font-bold text-[9px] uppercase tracking-widest mt-1">Real-time Ground Evidence & Verification</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-emerald-50 px-5 py-2 rounded-2xl border border-emerald-100 flex flex-col justify-center">
                            <p className="text-[7px] font-black text-emerald-600 uppercase">Proofs Today</p>
                            <span className="text-sm font-black text-emerald-700">{logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length} Assets</span>
                        </div>
                        <button onClick={fetchLogs} className="p-4 bg-slate-900 text-white rounded-2xl active:scale-90 transition-all shadow-lg">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>
                </header>

                {/* --- 🟢 ACTIVITY STREAM --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin mx-auto text-rose-500" size={48}/></div>
                    ) : logs.length === 0 ? (
                        <div className="col-span-full py-40 text-center border-4 border-dashed rounded-[50px] border-slate-200">
                            <p className="text-slate-300 font-black text-xl uppercase italic">No ground activities logged yet</p>
                        </div>
                    ) : logs.map((log) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            key={log.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all group"
                        >
                            {/* Image Preview */}
                            <div className="h-56 bg-slate-100 relative overflow-hidden">
                                {log.photo_url ? (
                                    <img 
                                        src={log.photo_url} 
                                        onClick={() => setSelectedImg(log.photo_url)}
                                        className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-500" 
                                        alt="Activity" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={40}/></div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black uppercase text-rose-600 shadow-sm border border-white">
                                    {log.activity_type || 'General'}
                                </div>
                                <button 
                                    onClick={() => window.open(`https://maps.google.com/?q=${log.lat},${log.lng}`)}
                                    className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl text-white hover:bg-emerald-500 transition-all shadow-xl"
                                >
                                    <MapPin size={16} />
                                </button>
                            </div>

                            {/* Info Area */}
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><User size={10}/> Field Staff</p>
                                        <h4 className="text-sm font-black text-slate-800 uppercase">{log.staff_name}</h4>
                                    </div>
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Ward {log.ward_no}</span>
                                </div>

                                <p className="text-xs font-bold text-slate-500 line-clamp-2 italic leading-relaxed">"{log.description}"</p>

                                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={12}/>
                                        <span className="text-[10px] font-bold">{new Date(log.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-500">
                                        <CheckCircle size={12}/>
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Verified Link</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- 🟢 IMAGE PREVIEW MODAL --- */}
            <AnimatePresence>
                {selectedImg && (
                    <div className="fixed inset-0 z-[2000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setSelectedImg(null)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative max-w-4xl w-full h-[80vh]">
                            <img src={selectedImg} className="w-full h-full object-contain rounded-3xl" alt="Preview" />
                            <button className="absolute -top-10 right-0 text-white font-black uppercase text-xs">Close [X]</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

export default IecFieldLogs;
