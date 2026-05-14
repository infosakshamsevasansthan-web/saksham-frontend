import React, { useState, useEffect } from 'react';
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

    // 🟢 1. ROBUST HINDI TRANSLITERATION LOGIC
    // Ye function English text ko Hindi mein badalta hai (Space dabane par)
    const translateToHindi = async (text) => {
        if (!text.trim()) return;
        try {
            // Google Input Tools API Call
            const response = await fetch(
                `https://inputtools.google.com/request?text=${text}&itc=hi-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`
            );
            const data = await response.json();
            if (data[0] === 'SUCCESS') {
                return data[1][0][1][0]; // Pehla Hindi suggestion uthao
            }
        } catch (error) {
            console.error("Transliteration Error:", error);
            return "";
        }
    };

    const handleEnglishChange = async (e) => {
        const value = e.target.value;
        setFormData({ ...formData, name_en: value });

        // Logic: Agar user ne Space dabaya, toh convert karo
        if (value.endsWith(' ')) {
            const lastWord = value.trim().split(" ").pop();
            if (lastWord) {
                const hindiResult = await translateToHindi(lastWord);
                if (hindiResult) {
                    setFormData(prev => ({
                        ...prev,
                        name_hi: prev.name_hi ? prev.name_hi + " " + hindiResult : hindiResult
                    }));
                }
            }
        }
    };
// handleEdit function define karein
const handleEdit = (node) => {
    setIsEditing(true);
    setEditId(node.id);
    setFormData({
        name_en: node.designation_name_en,
        name_hi: node.designation_name_hi,
        parent_id: node.parent_id || '',
        role_id: node.role_id || '5'
    });
    setShowModal(true);
};
    // 🟢 2. DATABASE OPERATIONS (Fetch, Add, Update, Delete)
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/designations/${tenantId}`);
            setDesignations(res.data.data || []);
        } catch (err) { toast.error("Command structure loading failed!"); }
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
                toast.success(isEditing ? "Post Modified! ✨" : "New Post Authorized! ✅");
                setShowModal(false);
                resetForm();
                fetchData();
            }
        } catch (err) { toast.error("Submission failed. Check your API."); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Warning: Delete karne se hierarchy toot sakti hai. Kya aap sure hain?")) return;
        try {
            const res = await axios.delete(`https://saksham-backend-9719.onrender.com/api/admin/designations/delete/${id}`);
            if(res.data.success) {
                toast.success("Designation removed!");
                fetchData();
            }
        } catch (err) { toast.error(err.response?.data?.message || "Delete failed!"); }
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
                
                {/* 🟢 HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-[35px] border border-slate-200 shadow-xl shadow-slate-200/40 gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 rounded-[22px] flex items-center justify-center text-emerald-400 shadow-2xl">
                            <Layers size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight leading-none">Command Structure</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-md tracking-tighter">Tenant ID: {tenantId}</span>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">Organization Master</p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => { resetForm(); setShowModal(true); }} 
                        className="bg-emerald-500 text-white px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl active:scale-95"
                    >
                        <Plus size={20} /> Authorize New Post
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* 🟢 LEFT SIDE: REGISTRY LIST */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 flex items-start gap-3">
                            <AlertTriangle size={20} className="text-amber-600 mt-1" />
                            <p className="text-[10px] font-black text-amber-800 uppercase leading-relaxed">
                                <b>Imp:</b> Top posts (जैसे Commissioner) pehle banayein, phir staff/labour level.
                            </p>
                        </div>
                        
                        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
                            {loading ? <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={32} /></div> : 
                                designations.map((d) => (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={d.id} className="group bg-white p-5 rounded-[28px] border border-slate-200 hover:border-emerald-400 transition-all shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                <Award size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{d.designation_name_en}</p>
                                                <p className="text-[10px] font-bold text-emerald-600 italic">{d.designation_name_hi}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => { setIsEditing(true); setEditId(d.id); setFormData({name_en: d.designation_name_en, name_hi: d.designation_name_hi, parent_id: d.parent_id || '', role_id: d.role_id}); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-500"><Edit3 size={14}/></button>
                                            <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* 🟢 RIGHT SIDE: VISUAL TREE MAP */}
                    <div className="lg:col-span-8 bg-white rounded-[45px] border border-slate-200 p-10 min-h-[700px] shadow-sm relative overflow-hidden">
                        <div className="absolute top-8 left-10 flex items-center gap-3">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Command Hierarchy Chart</p>
                        </div>
                        
                        <div className="mt-16">
                            {designations.length === 0 && !loading ? (
                                <div className="flex flex-col items-center justify-center py-40 opacity-20">
                                    <GitBranch size={80} strokeWidth={1} />
                                    <p className="text-sm font-black uppercase tracking-widest mt-4 text-center">Structure Empty<br/><small className="text-xs">Start by adding top level post</small></p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {designations.filter(d => !d.parent_id).map(root => (
                                        <TreeNode key={root.id} node={root} allNodes={designations} handleEdit={handleEdit} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟢 MODAL: ADD/EDIT POST */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 text-left">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-xl rounded-[45px] shadow-2xl overflow-hidden border border-white/20">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">{isEditing ? 'Modify Authority' : 'Define Authority Post'}</h2>
                                
<button 
    onClick={() => handleEdit(d)} 
    className="p-2 text-slate-400 hover:text-blue-500"
>
    <Edit3 size={14}/>
</button>                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Post Name (English)</label>
                                        <input 
                                            value={formData.name_en}
                                            required 
                                            className="w-full p-5 bg-slate-50 rounded-[22px] border border-slate-200 outline-none font-bold text-slate-700 focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                                            placeholder="Type English (Space for Hindi)" 
                                            onChange={handleEnglishChange} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Post Name (हिन्दी)</label>
                                        <input 
                                            value={formData.name_hi}
                                            required 
                                            className="w-full p-5 bg-emerald-50/40 rounded-[22px] border border-emerald-100 outline-none font-bold text-emerald-800 shadow-inner" 
                                            placeholder="हिन्दी नाम" 
                                            onChange={(e)=>setFormData({...formData, name_hi: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Reporting Boss (Reports To)</label>
                                    <select 
                                        value={formData.parent_id}
                                        className="w-full p-5 bg-slate-50 rounded-[22px] border border-slate-200 outline-none font-bold text-slate-700 focus:border-emerald-500 appearance-none shadow-inner" 
                                        onChange={(e)=>setFormData({...formData, parent_id: e.target.value})}
                                    >
                                        <option value="">No Boss (Department Head)</option>
                                        {designations.filter(d => d.id !== editId).map(d => (
                                            <option key={d.id} value={d.id}>{d.designation_name_en}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Access Rights (System Role)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: '2', label: 'Admin', icon: ShieldCheck },
                                            { id: '3', label: 'Inspector', icon: Users },
                                            { id: '4', label: 'Supervisor', icon: GitBranch },
                                            { id: '5', label: 'Field Staff', icon: Briefcase }
                                        ].map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setFormData({...formData, role_id: role.id})}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.role_id === role.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-md shadow-emerald-100' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                <role.icon size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-tight">{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 text-white p-6 rounded-[25px] font-black uppercase text-xs tracking-[0.25em] hover:bg-emerald-500 transition-all shadow-2xl flex items-center justify-center gap-4 mt-4">
                                    <Save size={20}/> {isEditing ? 'Confirm Update' : 'Authorize & Add Post'}
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
const TreeNode = ({ node, allNodes, level = 0, handleEdit }) => {
    const children = allNodes.filter(d => d.parent_id === node.id);
    const hasChildren = children.length > 0;

    return (
        <div className="relative">
            {/* Lines logic */}
            {level > 0 && <div className="absolute -left-10 top-10 w-10 h-[2px] bg-slate-200" />}
            <div className={`flex flex-col ml-${level === 0 ? '0' : '10'} mb-6 relative`}>
                {level > 0 && <div className="absolute -left-10 -top-10 w-[2px] h-[calc(100%+50px)] bg-slate-200" />}

                <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-5 rounded-[28px] border-2 border-slate-100 shadow-md flex items-center gap-4 max-w-sm relative z-10 group transition-all hover:border-emerald-500">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${level === 0 ? 'bg-slate-900 shadow-lg' : 'bg-emerald-500 shadow-lg'}`}>
                        {level === 0 ? <ShieldCheck size={20} /> : <Users size={18} />}
                    </div>
                    <div className="flex-1">
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{node.designation_name_en}</p>
                        <p className="text-[9px] font-bold text-emerald-600 mt-1 italic">{node.designation_name_hi}</p>
                    </div>
                    <button onClick={() => handleEdit(node)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-emerald-500 transition-all">
                        <Edit3 size={12} />
                    </button>
                </motion.div>

                {hasChildren && <div className="mt-4">{children.map(child => <TreeNode key={child.id} node={child} allNodes={allNodes} level={level + 1} handleEdit={handleEdit} />)}</div>}
            </div>
        </div>
    );
};

export default HierarchySetup;
