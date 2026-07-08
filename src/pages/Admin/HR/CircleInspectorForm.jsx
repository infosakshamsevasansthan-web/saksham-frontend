import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Building, CheckSquare, Save } from 'lucide-react';
import axios from 'axios';

const CircleInspectorForm = ({ staff, onClose, onSuccess }) => {
    const [circles, setCircles] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedCircle, setSelectedCircle] = useState('');
    const tenantId = localStorage.getItem('tenantId');

    useEffect(() => {
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`).then(res => setCircles(res.data.data));
    }, []);

    const handleCircle = (id) => {
        setSelectedCircle(id);
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards-by-circle/${tenantId}/${id}`).then(res => setWards(res.data.data));
    };

    const handleSubmit = async () => {
        const payload = {
            tenant_id: tenantId,
            staff_id: staff.id,
            post_type: 'CIRCLE_INSP',
            circle_ids: JSON.stringify([selectedCircle]),
            ward_ids: JSON.stringify(wards.map(w => w.id))
        };
        await axios.post('https://saksham-backend-9719.onrender.com/api/admin/work-assignment/inspector/save', payload);
        onSuccess("Circle Inspector Assigned Successfully!");
    };

    return (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl text-left">
                <div className="p-7 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Building className="text-blue-400" size={24}/>
                        <h3 className="font-black uppercase italic">Circle Jurisdiction</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X/></button>
                </div>
                <div className="p-10 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Assign Circle</label>
                        <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" onChange={(e) => handleCircle(e.target.value)}>
                            <option value="">Select Administrative Circle</option>
                            {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                        </select>
                    </div>
                    
                    {wards.length > 0 && (
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                            <p className="text-[10px] font-black text-blue-800 uppercase mb-4 flex items-center gap-2"><CheckSquare size={14}/> Wards under this Circle:</p>
                            <div className="grid grid-cols-2 gap-3">
                                {wards.map(w => (
                                    <div key={w.id} className="bg-white p-3 rounded-xl text-[10px] font-bold text-slate-600 border border-blue-100">Ward No: {w.ward_no}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={handleSubmit} className="w-full p-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 shadow-xl transition-all">
                        Establish Circle Command
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
export default CircleInspectorForm;
