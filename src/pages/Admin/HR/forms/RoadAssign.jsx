

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Route, MapPin, Navigation, Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const RoadAssign = ({ staff, onClose }) => {
    const [circles, setCircles] = useState([]);
    const [wards, setWards] = useState([]);
    const [roads, setRoads] = useState([]);
    
    const [formData, setFormData] = useState({
        circle_id: '', ward_id: '', road_id: '',
        start_point_hi: '', end_point_hi: ''
    });

    const tenantId = localStorage.getItem('tenantId');

    useEffect(() => {
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`)
            .then(res => setCircles(res.data.data));
    }, []);

    // Fetch Wards
    useEffect(() => {
        if(formData.circle_id) {
            axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards-by-circle/${tenantId}/${formData.circle_id}`)
                .then(res => setWards(res.data.data));
        }
    }, [formData.circle_id]);

    // Fetch Roads
    useEffect(() => {
        if(formData.ward_id) {
            axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roads-by-ward/${tenantId}/${formData.ward_id}`)
                .then(res => setRoads(res.data.data));
        }
    }, [formData.ward_id]);

    const handleSubmit = async () => {
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/work-assignment/road/save', {
                ...formData, staff_id: staff.id, tenant_id: tenantId
            });
            toast.success("Road Assignment Success!");
            onClose();
        } catch (e) { toast.error("Error saving"); }
    };

    return (
        <motion.div className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500 rounded-2xl"><Route size={24}/></div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Road Sweeping Duty</h3>
                            <p className="text-xs font-bold text-indigo-300">Staff: {staff.full_name_en}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X/></button>
                </div>

                <div className="p-10 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <select className="p-4 bg-slate-50 rounded-2xl font-bold text-sm" onChange={(e) => setFormData({...formData, circle_id: e.target.value})}>
                            <option>Select Circle</option>
                            {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                        </select>
                        <select className="p-4 bg-slate-50 rounded-2xl font-bold text-sm" onChange={(e) => setFormData({...formData, ward_id: e.target.value})}>
                            <option>Select Ward</option>
                            {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no}</option>)}
                        </select>
                    </div>

                    <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm border-2 border-indigo-100" onChange={(e) => setFormData({...formData, road_id: e.target.value})}>
                        <option>Select Road Hierarchy</option>
                        {roads.map(r => <option key={r.id} value={r.id}>{r.road_name_en}</option>)}
                    </select>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18}/>
                            <input 
                                placeholder="शुरुआत का स्थान (Start Area - Hindi)" 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-emerald-500/20"
                                onChange={(e) => setFormData({...formData, start_point_hi: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18}/>
                            <input 
                                placeholder="समाप्ति का स्थान (End Area - Hindi)" 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-rose-500/20"
                                onChange={(e) => setFormData({...formData, end_point_hi: e.target.value})}
                            />
                        </div>
                    </div>

                    <button onClick={handleSubmit} className="w-full p-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3">
                        <Save size={20}/> Confirm Allocation
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default RoadAssign;
