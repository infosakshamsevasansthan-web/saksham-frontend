import React, { useState, useEffect, useCallback } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Plus, Trash2, GitBranch, Save, ChevronRight, 
    ShieldCheck, Layers, Loader2, Edit3, Users, 
    Briefcase, Award, X, Info, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const HierarchySetup = () => {
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const tenantId = localStorage.getItem('tenantId');

    const [formData, setFormData] = useState({
        name_en: '', name_hi: '', parent_id: '', role_id: '5'
    });

    // 🟢 FAST TRANSLITERATION LOGIC (Optimized)
    // Jab user type karke 300ms ke liye rukega, tabhi call jayegi (Super Fast Performance)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (formData.name_en.trim() !== "" && !isEditing) {
                try {
                    const res = await axios.get(
                        `https://inputtools.google.com/request?text=${formData.name_en}&itc=hi-t-i0-und&num=1`
                    );
                    if (res.data[0] === 'SUCCESS') {
                        const hindiSuggestion = res.data[1][0][1][0];
                        setFormData(prev => ({ ...prev, name_hi: hindiSuggestion }));
                    }
                } catch (err) {
                    console.log("Transliteration service busy");
                }
            }
        }, 300); // 300ms delay for smoothness

        return () => clearTimeout(delayDebounceFn);
    }, [formData.name_en, isEditing]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/designations/${tenantId}`);
            setDesignations(res.data.data || []);
        } catch (err) { toast.error("Command structure fetch failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditing 
                ? `https://saksham-backend-9719.onrender.com/api/admin/designations/update/${editId}`
                : 'https://saksham-backend-9719.onrender.com/api/admin/designations/add';
            
            const res = await axios[isEditing ? 'put' : 'post'](url, { ...formData, tenant_id: tenantId });
            
            if(res.data.success) {
                toast.success(isEditing ? "Updated Successfully" : "New Authority Authorized");
                setShowModal(false);
                resetForm();
                fetchData();
            }
        } catch (err) { toast.error("Process failed"); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Warning: Is designation ko delete karne se reporting chain toot sakti hai. Continue?")) return;
        try {
            const res = await axios.delete(`https://saksham-backend-9719.onrender.com/api/admin/designations/delete/${id}`);
            if(res.data.success) {
                toast.success("Post removed");
                fetchData();
            }
        } catch (err) { toast.error("Error: Niche wale posts pehle delete karein"); }
    };

    const resetForm = () => {
        setFormData({ name_en: '', name_hi: '', parent_id: '', role_id: '5' });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-6 space-y-6 text-left bg-slate-50 min-h-screen">
                
                {/* 1. TOP HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-[35px] border border-slate-200 shadow-xl shadow-slate-200/30 gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 rounded-[22px] flex items-center justify-center text-emerald-400 shadow-2xl">
                            <Layers size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase italic leading-none tracking-tight">Command Structure</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-md tracking-widest">Active City: {tenantId}</span>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">Reporting Master</p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => { resetForm(); setShowModal(true); }} 
                        className="bg-emerald-500 text-white px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.1em] flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl active:scale-95"
                    >
                        <Plus size={20} /> Authorize New Post
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* 2. LEFT: SIDEBAR REGISTRY */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 flex items-start gap-3">
                            <AlertTriangle size={20} className="text-amber-600 mt-1" />
                            <p className="text-[10px] font-black text-amber-800 uppercase leading-relaxed">
                                <b>Imp:</b> Pehle top hierarchy (Admin) create karein, fir Inspector/Supervisor.
                            </p>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Designation List ({designations.length})</h3>
                        </div>
                        
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" /></div> : 
                                designations.map((d) => (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={d.id} className="group bg-white p-5 rounded-[28px] border border-slate-200 hover:border-emerald-400 transition-all shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-black text-slate-800 uppercase">{d.designation_name_en}</p>
                                            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{d.designation_name_hi}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => { setIsEditing(true); setEditId(d.id); setFormData({name_en: d.designation_name_en, name_hi: d.designation_name_hi, parent_id: d.parent_id || '', role_id: d.role_id}); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Edit3 size={14}/></button>
                                            <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* 3. RIGHT: TREE MAP */}
                    <div className="lg:col-span-8 bg-white rounded-[45px] border border-slate-200 p-10 min-h-[700px] shadow-sm relative overflow-hidden">
                        <div className="absolute top-8 left-10 flex items-center gap-3">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Visual Hierarchy Map</p>
                        </div>
                        
                        <div className="mt-16">
                            {designations.length === 0 && !loading ? (
                                <div className="flex flex-col items-center justify-center py-40 opacity-20">
                                    <GitBranch size={80} strokeWidth={1} />
                                    <p className="text-sm font-black uppercase tracking-widest mt-4">No structure defined</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {designations.filter(d => !d.parent_id).map(root => (
                                        <TreeNode key={root.id} node={root} allNodes={designations} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE/EDIT MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[1000] flex items-center justify-center p-6 text-left">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-xl rounded-[45px] shadow-2xl overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">{isEditing ? 'Modify Post' : 'Define Authority Post'}</h2>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-500 font-black shadow-sm transition-all hover:scale-110">X</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Post Name (English)</label>
                                        <input 
                                            value={formData.name_en}
                                            required 
                                            className="w-full p-5 bg-slate-50 rounded-[20px] border border-slate-200 outline-none font-bold text-slate-700 focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                                            placeholder="e.g. Commissioner" 
                                            onChange={(e) => setFormData({...formData, name_en: e.target.value})} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Post Name (हिन्दी)</label>
                                        <input 
                                            value={formData.name_hi}
                                            required 
                                            className="w-full p-5 bg-emerald-50/40 rounded-[20px] border border-emerald-100 outline-none font-bold text-emerald-800 shadow-inner" 
                                            placeholder="Auto Translating..." 
                                            onChange={(e)=>setFormData({...formData, name_hi: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Reporting Boss (Authority)</label>
                                    <select 
                                        value={formData.parent_id}
                                        className="w-full p-5 bg-slate-50 rounded-[20px] border border-slate-200 outline-none font-bold text-slate-700 focus:border-emerald-500 appearance-none shadow-inner" 
                                        onChange={(e)=>setFormData({...formData, parent_id: e.target.value})}
                                    >
                                        <option value="">No Boss (Department Head)</option>
                                        {designations.filter(d => d.id !== editId).map(d => (
                                            <option key={d.id} value={d.id}>{d.designation_name_en}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">System Access Rights</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: '2', label: 'Admin', icon: ShieldCheck },
                                            { id: '3', label: 'Inspector', icon: Users },
                                            { id: '4', label: 'Supervisor', icon: GitBranch },
                                            { id: '5', label: 'Staff', icon: Briefcase }
                                        ].map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setFormData({...formData, role_id: role.id})}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.role_id === role.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                                            >
                                                <role.icon size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-tight">{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 text-white p-6 rounded-[25px] font-black uppercase text-xs tracking-[0.25em] hover:bg-emerald-500 transition-all shadow-2xl flex items-center justify-center gap-4 mt-4">
                                    <Save size={20}/> {isEditing ? 'Save Changes' : 'Authorize Post'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// 🟢 RECURSIVE TREE NODE
const TreeNode = ({ node, allNodes, level = 0 }) => {
    const children = allNodes.filter(d => d.parent_id === node.id);
    const hasChildren = children.length > 0;

    return (
        <div className="relative">
            {level > 0 && <div className="absolute -left-10 top-10 w-10 h-[2px] bg-slate-100" />}
            <div className={`flex flex-col ml-${level === 0 ? '0' : '10'} mb-4 relative`}>
                {level > 0 && <div className="absolute -left-10 -top-10 w-[2px] h-[calc(100%+40px)] bg-slate-100" />}
                <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-5 rounded-[28px] border-2 border-slate-100 shadow-sm flex items-center gap-4 max-w-sm relative z-10 group transition-all hover:border-emerald-400">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${level === 0 ? 'bg-slate-900' : 'bg-emerald-500'}`}>
                        {level === 0 ? <ShieldCheck size={20} /> : <Users size={18} />}
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{node.designation_name_en}</p>
                        <p className="text-[9px] font-bold text-emerald-600 mt-1 italic">{node.designation_name_hi}</p>
                    </div>
                </motion.div>
                {hasChildren && <div className="mt-4">{children.map(child => <TreeNode key={child.id} node={child} allNodes={allNodes} level={level + 1} />)}</div>}
            </div>
        </div>
    );
};

export default HierarchySetup;
