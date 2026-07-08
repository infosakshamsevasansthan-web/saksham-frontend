import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, Save, Layers } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SectionInchargeForm = ({ staff, onClose }) => {
    const [depts, setDepts] = useState([]);
    const [sections, setSections] = useState([]);
    const [subs, setSubs] = useState([]);
    
    const [form, setForm] = useState({ dept: '', sec: '', sub: '' });
    const tenantId = localStorage.getItem('tenantId');

    useEffect(() => {
        // Fetch Departments
        axios.get('https://saksham-backend-9719.onrender.com/api/admin/departments').then(res => setDepts(res.data.data));
    }, []);

    const fetchSections = (did) => {
        setForm({...form, dept: did});
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/sections/${did}`).then(res => setSections(res.data.data));
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-2xl"><Building2 size={24}/></div>
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight">Section Authorization</h2>
                            <p className="text-xs font-bold text-blue-300 tracking-widest uppercase">Admin Post: {staff.full_name_en}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X/></button>
                </div>

                <div className="p-10 space-y-6 text-left">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Department</label>
                       <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" onChange={(e) => fetchSections(e.target.value)}>
                           <option value="">Select Department</option>
                           {depts.map(d => <option key={d.id} value={d.id}>{d.dept_name_en}</option>)}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Section</label>
                       <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" onChange={(e) => setForm({...form, sec: e.target.value})}>
                           <option value="">Select Section</option>
                           {sections.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sub-Section / Cell</label>
                       <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" onChange={(e) => setForm({...form, sub: e.target.value})}>
                           <option value="">Select Sub-Section</option>
                           {subs.map(sb => <option key={sb.id} value={sb.id}>{sb.sub_name}</option>)}
                       </select>
                    </div>

                    <button onClick={() => toast.success("Section Mapped!")} className="w-full p-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 mt-4 hover:bg-blue-600 transition-all">
                       <Save size={20}/> Authenticate Role
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
export default SectionInchargeForm;
