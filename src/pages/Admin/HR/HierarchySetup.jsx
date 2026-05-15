import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Plus, Trash2, GitBranch, Save, ChevronRight, 
    ShieldCheck, Layers, Loader2, Edit3, Users, 
    Briefcase, Award, X, Info, AlertTriangle, UserCheck,
    Network, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const HierarchySetup = () => {
    const [designations, setDesignations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const tenantId = localStorage.getItem('tenantId');

    const [formData, setFormData] = useState({
        name_en: '', name_hi: '', parent_id: '', role_id: ''
    });

    // Role ke hisaab se Icon aur Color set karne ka function
    const getRoleDetails = (roleId) => {
        const role = roles.find(r => r.id == roleId);
        const name = role?.role_name?.toUpperCase() || "";
        
        if (name.includes('ADMIN')) return { icon: ShieldCheck, color: 'text-rose-500', bg: 'bg-rose-50' };
        if (name.includes('INSPECTOR')) return { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' };
        if (name.includes('SUPERVISOR')) return { icon: GitBranch, color: 'text-amber-500', bg: 'bg-amber-50' };
        return { icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    };

    const translateToHindi = async (text) => {
        if (!text.trim()) return;
        try {
            const response = await fetch(`https://inputtools.google.com/request?text=${text}&itc=hi-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`);
            const data = await response.json();
            if (data[0] === 'SUCCESS') return data[1][0][1][0];
        } catch (error) { return ""; }
    };

    const handleEnglishChange = async (e) => {
        const value = e.target.value;
        setFormData({ ...formData, name_en: value });
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const [desigRes, rolesRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/designations/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roles/${tenantId}`)
            ]);
            setDesignations(desigRes.data.data || []);
            setRoles(rolesRes.data.data || []);
        } catch (err) { toast.error("Hierarchy Load Failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditing 
                ? `https://saksham-backend-9719.onrender.com/api/admin/designations/update/${editId}`
                : 'https://saksham-backend-9719.onrender.com/api/admin/designations/add';
            
            await axios[isEditing ? 'put' : 'post'](url, { ...formData, tenant_id: tenantId });
            toast.success("Structure Updated! 🚀");
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) { toast.error("Error saving post"); }
    };

    const handleEdit = (node) => {
        setIsEditing(true);
        setEditId(node.id);
        setFormData({
            name_en: node.designation_name_en,
            name_hi: node.designation_name_hi,
            parent_id: node.parent_id || '',
            role_id: node.role_id.toString()
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Warning: Ye post aur iske niche ke links delete ho jayenge! Continue?")) return;
        try {
            await axios.delete(`https://saksham-backend-9719.onrender.com/api/admin/designations/delete/${id}`);
            toast.success("Post removed");
            fetchData();
        } catch (err) { toast.error("Delete failed"); }
    };

    const resetForm = () => {
        setFormData({ name_en: '', name_hi: '', parent_id: '', role_id: roles[0]?.id.toString() || '' });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-6 space-y-6 text-left bg-slate-50 min-h-screen">
                
                {/* 🟢 HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-[35px] border border-slate-200 shadow-xl shadow-slate-100/50 gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 rounded-[22px] flex items-center justify-center text-emerald-400 shadow-2xl">
                            <Network size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight leading-none">Authority Tree</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded tracking-widest">ID: {tenantId}</span>
                                <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest italic flex items-center gap-1">
                                    <ShieldCheck size={10}/> Admin Control Centre
                                </p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-emerald-600 text-white px-10 py-4 rounded-[22px] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl active:scale-95">
                        <Plus size={20} /> Define Authority Post
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: QUICK REGISTRY */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Award size={14}/> Registry List
                            </h3>
                            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div> : 
                                    designations.map((d) => (
                                    <div key={d.id} className="group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-emerald-400 hover:bg-white flex justify-between items-center transition-all">
                                        <div>
                                            <p className="text-[13px] font-black text-slate-800 uppercase">{d.designation_name_en}</p>
                                            <p className="text-[10px] font-bold text-slate-400 italic">{d.designation_name_hi}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(d)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><Edit3 size={14}/></button>
                                            <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: PROFESSIONAL TREE CHART */}
                    <div className="lg:col-span-8 bg-white rounded-[45px] border border-slate-200 p-12 min-h-[750px] shadow-sm relative overflow-auto custom-scrollbar">
                        <div className="absolute top-10 left-12 flex items-center gap-3">
                            <GitBranch size={16} className="text-emerald-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Operational Hierarchy Flow</p>
                        </div>
                        
                        <div className="mt-20">
                            {designations.length > 0 ? (
                                <div className="space-y-6">
                                    {designations.filter(d => !d.parent_id).map(root => (
                                        <TreeNode key={root.id} node={root} allNodes={designations} roles={roles} handleEdit={handleEdit} getRoleDetails={getRoleDetails} />
                                    ))}
                                </div>
                            ) : <div className="text-center py-40 opacity-10"><GitBranch size={100} /></div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟢 MODAL (Exact design with Close X) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[1000] flex items-center justify-center p-6 text-left">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-xl rounded-[45px] shadow-2xl overflow-hidden border border-white/20">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">{isEditing ? 'Modify Post' : 'Define Authority Post'}</h2>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-lg transition-all active:scale-90"><X size={22}/></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Post Name (English)</label>
                                        <input value={formData.name_en} required className="w-full p-5 bg-slate-50 rounded-[25px] border border-slate-200 outline-none font-bold text-slate-700 focus:border-emerald-500 transition-all shadow-inner" placeholder="E.g. Commissioner" onChange={handleEnglishChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">हिन्दी नाम (Transliterated)</label>
                                        <input value={formData.name_hi} required className="w-full p-5 bg-emerald-50/40 rounded-[25px] border border-emerald-100 outline-none font-bold text-emerald-800 shadow-inner" placeholder="नाम यहाँ आएगा" onChange={(e)=>setFormData({...formData, name_hi: e.target.value})} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Reporting Boss (Supervision)</label>
                                    <select value={formData.parent_id} className="w-full p-5 bg-slate-50 rounded-[25px] border border-slate-200 outline-none font-bold text-slate-700 shadow-inner" onChange={(e)=>setFormData({...formData, parent_id: e.target.value})}>
                                        <option value="">No Boss (Highest Authority)</option>
                                        {designations.filter(d => d.id !== editId).map(d => (
                                            <option key={d.id} value={d.id}>{d.designation_name_en}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">System Access Rights (Role Mapping)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {roles.map((role) => {
                                            const roleUI = getRoleDetails(role.id);
                                            return (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, role_id: role.id.toString()})}
                                                    className={`flex items-center gap-3 p-4 rounded-[20px] border-2 transition-all ${formData.role_id == role.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-md' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                                                >
                                                    <roleUI.icon size={18} className={formData.role_id == role.id ? 'text-emerald-500' : ''} />
                                                    <span className="text-[10px] font-black uppercase tracking-tight">{role.role_name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 text-white p-6 rounded-[28px] font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-2xl flex items-center justify-center gap-4 mt-2">
                                    <Save size={22}/> {isEditing ? 'Confirm Changes' : 'Authorize Post'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// 🟢 PROFESSIONAL TREE NODE COMPONENT
const TreeNode = ({ node, allNodes, roles, level = 0, handleEdit, getRoleDetails }) => {
    const children = allNodes.filter(d => d.parent_id === node.id);
    const roleUI = getRoleDetails(node.role_id);
    const roleName = roles.find(r => r.id == node.role_id)?.role_name || "Staff";

    return (
        <div className="relative">
            <div className={`flex flex-col ml-${level === 0 ? '0' : '16'} mb-6 relative`}>
                
                {/* 🔵 Vertical Connecting Line */}
                {level > 0 && (
                    <div className="absolute -left-16 -top-12 w-[2px] h-[calc(100%+48px)] bg-slate-100 shadow-sm" />
                )}
                
                {/* 🔵 Horizontal "Elbow" Line */}
                {level > 0 && (
                    <div className="absolute -left-16 top-9 w-16 h-[2px] bg-slate-100" />
                )}

                <motion.div 
                    whileHover={{ x: 8 }} 
                    className={`p-6 rounded-[32px] border-2 shadow-sm flex items-center gap-5 max-w-sm relative z-10 group transition-all bg-white ${level === 0 ? 'border-slate-900 shadow-slate-200' : 'border-slate-100 hover:border-emerald-400'}`}
                >
                    {/* Icon Section */}
                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shadow-lg ${level === 0 ? 'bg-slate-900 text-white' : `${roleUI.bg} ${roleUI.color}`}`}>
                        {level === 0 ? <ShieldCheck size={24} /> : <roleUI.icon size={20} />}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1">
                        <p className={`text-[13px] font-black uppercase tracking-tight leading-none text-slate-800`}>{node.designation_name_en}</p>
                        <div className="flex items-center gap-3 mt-2.5">
                            <p className="text-[10px] font-bold text-emerald-500 italic leading-none">{node.designation_name_hi}</p>
                            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${roleUI.bg} ${roleUI.color} border border-transparent group-hover:border-current/20`}>
                                {roleName}
                            </div>
                        </div>
                    </div>

                    {/* Action Section */}
                    <button onClick={() => handleEdit(node)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-emerald-500 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100">
                        <Edit3 size={14} />
                    </button>
                </motion.div>

                {/* Recursive Children */}
                {children.length > 0 && (
                    <div className="mt-4">
                        {children.map(child => (
                            <TreeNode key={child.id} node={child} allNodes={allNodes} roles={roles} level={level + 1} handleEdit={handleEdit} getRoleDetails={getRoleDetails} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HierarchySetup;
