import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Layers, LayoutGrid, Save, Circle } from 'lucide-react';
import axios from 'axios';

const SanitationInspectorForm = ({ staff, onClose, onSuccess }) => {
    const [circles, setCircles] = useState([]);
    const [selectedCircles, setSelectedCircles] = useState([]);
    const [groupedWards, setGroupedWards] = useState({});
    const tenantId = localStorage.getItem('tenantId');

    useEffect(() => {
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`).then(res => setCircles(res.data.data));
    }, []);

    const toggleCircle = async (circle) => {
        let updated;
        if(selectedCircles.find(c => c.id === circle.id)) {
            updated = selectedCircles.filter(c => c.id !== circle.id);
            const newGroups = {...groupedWards};
            delete newGroups[circle.circle_name];
            setGroupedWards(newGroups);
        } else {
            updated = [...selectedCircles, circle];
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards-by-circle/${tenantId}/${circle.id}`);
            setGroupedWards({...groupedWards, [circle.circle_name]: res.data.data});
        }
        setSelectedCircles(updated);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl text-left h-[80vh] flex flex-col">
                <div className="p-7 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Layers className="text-emerald-400" size={24}/>
                        <h3 className="font-black uppercase italic">City-Wide Sanitation Command</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-10 space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Multiple Circles</label>
                        <div className="flex flex-wrap gap-3">
                            {circles.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => toggleCircle(c)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${selectedCircles.find(sc => sc.id === c.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                >
                                    {c.circle_name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {Object.keys(groupedWards).map(cName => (
                            <div key={cName} className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"/> {cName} - Ward Control
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {groupedWards[cName].map(w => (
                                        <span key={w.id} className="px-4 py-2 bg-white rounded-xl text-[10px] font-bold text-slate-500 border border-slate-200">Ward {w.ward_no}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100">
                    <button onClick={() => onSuccess("Sanitation Command Assigned!")} className="w-full p-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 shadow-2xl transition-all">
                        Establish Multi-Circle Authority
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
export default SanitationInspectorForm;
