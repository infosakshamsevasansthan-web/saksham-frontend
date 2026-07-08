import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Route, Navigation, MapPin, Save } from 'lucide-react'; // ✅ Road hata kar Route kiya
import axios from 'axios';
import { toast } from 'react-hot-toast';

const RoadSweeperForm = ({ staff, onClose }) => {
    const [circles, setCircles] = useState([]);
    const [wards, setWards] = useState([]);
    const [roads, setRoads] = useState([]);
    const tenantId = localStorage.getItem('tenantId');

    const [form, setForm] = useState({
        circle_id: '', ward_id: '', road_id: '', start_loc: '', end_loc: ''
    });

    useEffect(() => {
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`).then(res => setCircles(res.data.data));
    }, []);

    const handleCircleChange = (cid) => {
        setForm({...form, circle_id: cid});
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards-by-circle/${tenantId}/${cid}`).then(res => setWards(res.data.data));
    };

    const handleWardChange = (wid) => {
        setForm({...form, ward_id: wid});
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roads-by-ward/${tenantId}/${wid}`).then(res => setRoads(res.data.data));
    };

    const handleSubmit = () => {
        toast.success(`Success: ${staff.full_name_en} Assigned to Road Duty!`);
        onClose();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg">
                            <Route size={24}/> {/* ✅ Yahan bhi Route kiya */}
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight">Road Sweeping Duty</h2>
                            <p className="text-xs font-bold text-slate-400">Target: {staff.full_name_en}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
                </div>

                <div className="p-10 space-y-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400">Circle</label>
                           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" onChange={(e) => handleCircleChange(e.target.value)}>
                               <option value="">Select</option>
                               {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400">Ward</label>
                           <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" onChange={(e) => handleWardChange(e.target.value)}>
                               <option value="">Select</option>
                               {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no}</option>)}
                           </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400">Road Hierarchy</label>
                       <select className="w-full p-4 bg-indigo-50 rounded-2xl font-bold text-sm border-2 border-indigo-100 outline-none" onChange={(e) => setForm({...form, road_id: e.target.value})}>
                           <option value="">Select Road</option>
                           {roads.map(r => <option key={r.id} value={r.id}>{r.road_name_en}</option>)}
                       </select>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18}/>
                            <input 
                                placeholder="शुरुआत का स्थान (Start Location - Hindi)" 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-emerald-500/20"
                                onChange={(e) => setForm({...form, start_loc: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18}/>
                            <input 
                                placeholder="समाप्ति का स्थान (End Location - Hindi)" 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-rose-500/20"
                                onChange={(e) => setForm({...form, end_loc: e.target.value})}
                            />
                        </div>
                    </div>

                    <button onClick={handleSubmit} className="w-full p-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3 mt-4 hover:bg-emerald-600 transition-all">
                       <Save size={20}/> Confirm Allocation
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default RoadSweeperForm;
