import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Briefcase, MapPin, Users, Search, X, CheckCircle2, Loader2, Layers, Navigation, AlertCircle, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const WorkAssignment = () => {
    const [staffList, setStaffList] = useState([]);
    const [wards, setWards] = useState([]);
    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Assignment States
    const [selectedCircleId, setSelectedCircleId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    
    const tenantId = localStorage.getItem('tenantId');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, wardRes, circleRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/work-assignment/list/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`)
            ]);
            setStaffList(staffRes.data.data || []);
            setWards(wardRes.data.data || []);
            setCircles(circleRes.data.data || []);
        } catch (err) { toast.error("Database connection failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    // 🟢 Logic: Filter Wards based on selected Circle
    const filteredWards = wards.filter(w => w.circle_id == selectedCircleId);

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if(!selectedWardId) return toast.error("Please select a ward!");

        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/work-assignment/save', {
                tenant_id: tenantId,
                staff_id: selectedStaff.id,
                assign_type: 'WARD', // Defaulting to WARD level
                target_id: selectedWardId
            });
            if(res.data.success) {
                toast.success("Duty Mapping Established! 🔗");
                setShowModal(false);
                setSelectedCircleId('');
                setSelectedWardId('');
                fetchData();
            }
        } catch (err) { toast.error("Assignment Error"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left animate-in fade-in duration-500">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 shadow-lg">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Duty Allocation</h1>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Circle & Ward Wise Deployment</p>
                        </div>
                    </div>
                </header>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                    <input 
                        type="text" 
                        placeholder="Search personnel to assign duty..." 
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Staff Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></div>
                    ) : staffList.filter(s => s.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())).map((s) => (
                        <motion.div whileHover={{ y: -5 }} key={s.id} className="bg-white p-6 rounded-[35px] border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-2 h-full ${s.current_task ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 font-black text-sm">{s.full_name_en.charAt(0)}</div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-sm uppercase leading-none">{s.full_name_en}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.role_name || 'Staff'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setSelectedStaff(s); setShowModal(true); }}
                                    className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-sm active:scale-90"
                                >
                                    <Settings2 size={18}/>
                                </button>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Location Map:</p>
                                {s.current_task ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-500 border border-slate-100 shadow-sm"><MapPin size={16}/></div>
                                        <p className="text-[10px] font-black text-slate-700 uppercase leading-none">
                                            Ward No: {s.current_task.split(':')[1]}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-[10px] font-bold text-slate-300 uppercase italic">Unassigned - On Waiting</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- HIERARCHY SETUP MODAL --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden text-left border border-slate-200">
                            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase italic">Setup Duty Point</h2>
                                    <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest mt-1">Member: {selectedStaff?.full_name_en}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm font-black">X</button>
                            </div>

                            <form onSubmit={handleAssignSubmit} className="p-8 space-y-6">
                                {/* 1. CIRCLE DROPDOWN */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                                        <Layers size={14}/> 1. Select Circle (अंचल चुनें)
                                    </label>
                                    <select 
                                        required 
                                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-sm text-slate-700 appearance-none" 
                                        value={selectedCircleId}
                                        onChange={(e) => { setSelectedCircleId(e.target.value); setSelectedWardId(''); }} // Reset ward on circle change
                                    >
                                        <option value="">Choose Circle / Zone...</option>
                                        {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                                    </select>
                                </div>

                                {/* 2. WARD DROPDOWN (Filtered) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                                        <MapPin size={14}/> 2. Select Ward (वार्ड चुनें)
                                    </label>
                                    <select 
                                        required 
                                        disabled={!selectedCircleId}
                                        className={`w-full p-4 border-2 border-transparent rounded-2xl outline-none font-bold text-sm text-slate-700 appearance-none transition-all ${!selectedCircleId ? 'bg-slate-100 opacity-50' : 'bg-slate-50 focus:border-emerald-500/20'}`} 
                                        value={selectedWardId}
                                        onChange={(e) => setSelectedWardId(e.target.value)}
                                    >
                                        <option value="">Choose Targeted Ward...</option>
                                        {filteredWards.map(w => <option key={w.id} value={w.id}>Ward No: {w.ward_no} - {w.ward_name}</option>)}
                                    </select>
                                </div>

                                <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 flex gap-4">
                                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-1" />
                                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider leading-relaxed">
                                        Note: Finalizing this mapping will sync the staff member's mobile app to work only within the selected Circle and Ward.
                                    </p>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[28px] font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3 mt-4 active:scale-95">
                                    Finalize Duty Assignment
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </CityLayout>
    );
};

export default WorkAssignment;