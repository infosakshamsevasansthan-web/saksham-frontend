import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Plus, Trash2, GitBranch, Save, ChevronRight, 
    ShieldCheck, Layers, Loader2, Edit3, Award, X, Users, Briefcase
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

    // 🟢 AUTO-HINDI LOGIC (Transliteration)
    const handleEnglishChange = async (e) => {
        const val = e.target.value;
        setFormData({ ...formData, name_en: val });

        // Agar user ne space dabaya ya word khatam kiya
        if (val.endsWith(' ')) {
            try {
                const res = await axios.get(
                    `https://inputtools.google.com/request?text=${val.trim()}&itc=hi-t-i0-und&num=1`
                );
                if (res.data[0] === 'SUCCESS') {
                    const hindiSuggestion = res.data[1][0][1][0];
                    setFormData(prev => ({ ...prev, name_hi: hindiSuggestion }));
                }
            } catch (err) {
                console.error("Transliteration Error");
            }
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/designations/${tenantId}`);
            setDesignations(res.data.data || []);
        } catch (err) { toast.error("Data load nahi hua"); }
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
                toast.success(isEditing ? "Updated!" : "Authorized!");
                setShowModal(false);
                setFormData({ name_en: '', name_hi: '', parent_id: '', role_id: '5' });
                setIsEditing(false);
                fetchData();
            }
        } catch (err) { toast.error("Action failed"); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this post?")) return;
        try {
            await axios.delete(`https://saksham-backend-9719.onrender.com/api/admin/designations/delete/${id}`);
            toast.success("Deleted");
            fetchData();
        } catch (err) { toast.error("Delete failed - Check child posts"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-6 space-y-8 text-left bg-slate-50 min-h-screen">
                
                {/* HEADER */}
                <header className="flex items-center justify-between bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase italic">Command Structure</h1>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Reporting Hierarchy Master</p>
                        </div>
                    </div>
                    <button onClick={() => { setIsEditing(false); setShowModal(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all">
                        <Plus size={16} /> Create New Post
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: LIST */}
                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase px-2 tracking-widest">Designation Registry</h3>
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? <Loader2 className="animate-spin mx-auto mt-10 text-emerald-500" /> : designations.map((d) => (
                                <div key={d.id} className="bg-white p-4 rounded-[25px] border border-slate-100 shadow-sm group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase">{d.designation_name_en}</p>
                                            <p className="text-[10px] font-bold text-emerald-600">{d.designation_name_hi}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleDelete(d.id)} className="p-2 text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={12}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: VISUAL CHART */}
                    <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-200 p-10 min-h-[600px] shadow-inner relative overflow-hidden">
                        <div className="absolute top-6 left-8 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual Organization Map</p>
                        </div>
                        
                        <div className="mt-12">
                            {designations.filter(d => !d.parent_id).map(root => (
                                <TreeNode key={root.id} node={root} allNodes={designations} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[45px] shadow-2xl overflow-hidden text-left">
                            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 uppercase italic">Authorize Post</h2>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm font-black">X</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-10 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Post Name (English)</label>
                                            <input 
                                                required 
                                                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none font-bold text-sm focus:border-emerald-500 transition-all" 
                                                placeholder="Type & Press Space..." 
                                                value={formData.name_en}
                                                onChange={handleEnglishChange} 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Post Name (हिन्दी)</label>
                                            <input 
                                                required 
                                                className="w-full p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 outline-none font-bold text-sm text-emerald-700" 
                                                placeholder="Auto-converted" 
                                                value={formData.name_hi}
                                                onChange={(e)=>setFormData({...formData, name_hi: e.target.value})} 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Reporting Boss</label>
                                        <select className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none font-bold text-sm" value={formData.parent_id} onChange={(e)=>setFormData({...formData, parent_id: e.target.value})}>
                                            <option value="">Top Level (Head of Dept)</option>
                                            {designations.map(d => <option key={d.id} value={d.id}>{d.designation_name_en}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">System Role</label>
                                        <select className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none font-bold text-sm" value={formData.role_id} onChange={(e)=>setFormData({...formData, role_id: e.target.value})}>
                                            <option value="2">Admin / Executive</option>
                                            <option value="3">Inspector Level</option>
                                            <option value="4">Supervisor Level</option>
                                            <option value="5">Field Staff / Driver</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[25px] font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3">
                                    <Save size={18}/> Authorize Designation
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// TREE COMPONENT
const TreeNode = ({ node, allNodes, level = 0 }) => {
    const children = allNodes.filter(d => d.parent_id === node.id);
    return (
        <div className={`ml-${level === 0 ? '0' : '10'} border-l-2 border-slate-100 pl-8 py-3 relative`}>
            {level > 0 && <div className="absolute left-0 top-10 w-6 h-0.5 bg-slate-200" />}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center max-w-sm hover:border-emerald-500 transition-all">
                <div>
                    <p className="text-[11px] font-black text-slate-700 uppercase">{node.designation_name_en}</p>
                    <p className="text-[9px] font-bold text-emerald-600">{node.designation_name_hi}</p>
                </div>
            </div>
            {children.length > 0 && (
                <div className="mt-2">
                    {children.map(child => <TreeNode key={child.id} node={child} allNodes={allNodes} level={level + 1} />)}
                </div>
            )}
        </div>
    );
};

export default HierarchySetup;
