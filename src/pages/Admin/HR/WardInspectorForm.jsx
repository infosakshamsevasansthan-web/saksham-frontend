import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Target, Save, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const WardInspectorForm = ({ staff, onClose, onSuccess }) => {
    const [circles, setCircles] = useState([]);
    const [wards, setWards] = useState([]);
    const [form, setForm] = useState({ circle: '', ward: '' });
    const tenantId = localStorage.getItem('tenantId');

    useEffect(() => {
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`).then(res => setCircles(res.data.data));
    }, []);

    const handleCircle = (id) => {
        setForm({...form, circle: id});
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards-by-circle/${tenantId}/${id}`).then(res => setWards(res.data.data));
    };

    const handleSubmit = async () => {
        const payload = {
            tenant_id: tenantId,
            staff_id: staff.id,
            post_type: 'WARD_INSP',
            ward_ids: JSON.stringify([form.ward])
        };
        await axios.post('https://saksham-backend-9719.onrender.com/api/admin/work-assignment/inspector/save', payload);
        onSuccess("Ward Inspector Assignment Complete!");
    };

    return (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden text-left">
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-emerald-400" size={24}/>
                        <h3 className="font-black uppercase italic text-sm">Ward Inspector Link</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X/></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Select Circle</label>
                        <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" onChange={(e) => handleCircle(e.target.value)}>
                            <option value="">Choose Circle</option>
                            {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Target Ward</label>
                        <select disabled={!form.circle} className="w-full p-4 bg-slate-50 rounded-2xl font-bold" onChange={(e) => setForm({...form, ward: e.target.value})}>
                            <option value="">Choose Ward</option>
                            {wards.map(w => <option key={w.id} value={w.id}>Ward No: {w.ward_no}</option>)}
                        </select>
                    </div>
                    <button onClick={handleSubmit} className="w-full p-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 shadow-xl transition-all">
                        Assign Ward Territory
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
export default WardInspectorForm;
