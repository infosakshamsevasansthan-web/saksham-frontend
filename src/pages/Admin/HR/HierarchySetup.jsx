import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Plus, Trash2, GitBranch, Save, ChevronRight, 
    ShieldCheck, Layers, Loader2, Edit3, Users, 
    Briefcase, Award, Trash
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/designations/${tenantId}`);
            setDesignations(res.data.data || []);
        } catch (err) { toast.error("Command structure load nahi ho paya"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    const handleEdit = (d) => {
        setFormData({
            name_en: d.designation_name_en,
            name_hi: d.designation_name_hi,
            parent_id: d.parent_id || '',
            role_id: d.role_id
        });
        setEditId(d.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Kya aap is designation ko hatana chahte hain?")) return;
        try {
            const res = await axios.delete(`https://saksham-backend-9719.onrender.com/api/admin/designations/delete/${id}`);
            if(res.data.success) {
                toast.success("Post removed successfully");
                fetchData();
            }
        } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isEditing 
                ? `https://saksham-backend-9719.onrender.com/api/admin/designations/update/${editId}`
                : 'https://saksham-backend-9719.onrender.com/api/admin/designations/add';
            
            const method = isEditing ? 'put' : 'post';
            
            const res = await axios[method](url, { ...formData, tenant_id: tenantId });
            
            if(res.data.success) {
                toast.success(isEditing ? "Structure Updated! ✨" : "New Post Authorized! ✅");
                setShowModal(false);
                resetForm();
                fetchData();
            }
        } catch (err) { toast.error("Process failed. Details check karein."); }
    };

    const resetForm = () => {
        setFormData({ name_en: '', name_hi: '', parent_id: '', role_id: '5' });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-6 space-y-8 text-left bg-slate-50/50 min-h-screen">
                
                {/* 1. HEADER SECTION */}
                <header className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg shadow-slate-900/20">
                            <Layers size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight leading-none">Command Structure</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-md tracking-tighter">Tenant ID: {tenantId}</span>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Reporting Hierarchy Master</p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => { resetForm(); setShowModal(true); }} 
                        className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-emerald-200 active:scale-95"
                    >
                        <Plus size={18} /> Create New Post
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* 2. REGISTRY SIDEBAR */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={14} /> Designation Registry
                            </h3>
                            <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500">Total: {designations.length}</span>
                        </div>
                        
                        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
                            {loading ? (
                                <div className="flex flex-col items-center py-20 gap-3">
                                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                                    <p className="text-[10px] font-black text-slate-300 uppercase">Synchronizing...</p>
                                </div>
                            ) : designations.map((d) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={d.id} 
                                    className="group bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-400 transition-all hover:shadow-2xl hover:shadow-emerald-100/50 relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{d.designation_name_en}</p>
                                            <p className="text-xs font-bold text-emerald-600 mt-0.5">{d.designation_name_hi}</p>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(d)} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(d.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                                                <GitBranch size={10} />
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Boss: <span className="text-slate-700 ml-1">{d.report_to_name || 'N/A (Root)'}</span></p>
                                        </div>
                                        <span className="text-[8px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded-md uppercase">Role ID: {d.role_id}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* 3. VISUAL CHART AREA */}
                    <div className="lg:col-span-8 bg-white rounded-[48px] border border-slate-200 p-10 min-h-[700px] shadow-sm relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', size: '20px 20px' }} />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Interactive Organization Map</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase">Active Nodes</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                {designations.length === 0 && !loading ? (
                                    <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                                        <Network size={64} strokeWidth={1} className="mb-4" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No Structure Defined Yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {designations.filter(d => !d.parent_id).map(root => (
                                            <TreeNode key={root.id} node={root} allNodes={designations} handleEdit={handleEdit} handleDelete={handleDelete} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE/EDIT MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 text-left">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20"
                        >
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 uppercase italic leading-none">{isEditing ? 'Modify Post' : 'New Authority Post'}</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{isEditing ? 'Editing existing entry' : 'Authorization Registry'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Post Name (English)</label>
                                        <input 
                                            value={formData.name_en}
                                            required 
                                            className="w-full p-5 bg-slate-50 rounded-[20px] border border-slate-200 outline-none font-bold text-slate-700 focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                                            placeholder="e.g. Ward Inspector" 
                                            onChange={(e)=>setFormData({...formData, name_en: e.target.value})} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Post Name (हिन्दी)</label>
                                        <input 
                                            value={formData.name_hi}
                                            required 
                                            className="w-full p-5 bg-slate-50 rounded-[20px] border border-slate-200 outline-none font-bold text-slate-700 focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                                            placeholder="जांच अधिकारी" 
                                            onChange={(e)=>setFormData({...formData, name_hi: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
                                        Reporting Boss <span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded text-slate-400 font-bold tracking-normal">OPTIONAL FOR HEADS</span>
                                    </label>
                                    <select 
                                        value={formData.parent_id}
                                        className="w-full p-5 bg-slate-50 rounded-[20px] border border-slate-200 outline-none font-bold text-slate-700 focus:border-emerald-500 appearance-none shadow-inner" 
                                        onChange={(e)=>setFormData({...formData, parent_id: e.target.value})}
                                    >
                                        <option value="">Top Level (No Reporting Boss)</option>
                                        {designations.filter(d => d.id !== editId).map(d => (
                                            <option key={d.id} value={d.id}>{d.designation_name_en} ({d.designation_name_hi})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">System Access Rights (Role Mapping)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: '2', label: 'Admin/Exec', icon: ShieldCheck },
                                            { id: '3', label: 'Inspector', icon: Users },
                                            { id: '4', label: 'Supervisor', icon: Network },
                                            { id: '5', label: 'Field Staff', icon: Briefcase }
                                        ].map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setFormData({...formData, role_id: role.id})}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${formData.role_id === role.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                <role.icon size={16} />
                                                <span className="text-[10px] font-black uppercase">{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 text-white p-6 rounded-[25px] font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-2xl shadow-slate-300 flex items-center justify-center gap-4 mt-6">
                                    <Save size={20}/> {isEditing ? 'Confirm Changes' : 'Authorize & Publish Post'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// 🟢 RECURSIVE DESIGNATION NODE (Best UI UX)
const TreeNode = ({ node, allNodes, level = 0, handleEdit, handleDelete }) => {
    const children = allNodes.filter(d => d.parent_id === node.id);
    const hasChildren = children.length > 0;

    return (
        <div className="relative">
            {/* Horizontal connection line for children */}
            {level > 0 && (
                <div className="absolute -left-8 top-10 w-8 h-[2px] bg-emerald-100" />
            )}

            <div className={`flex flex-col ml-${level === 0 ? '0' : '10'} mb-6 relative`}>
                {/* Vertical connection line for multiple children */}
                {level > 0 && (
                    <div className="absolute -left-8 -top-10 w-[2px] h-[calc(100%+40px)] bg-emerald-100" />
                )}

                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-5 rounded-[28px] border-2 border-slate-100 shadow-lg shadow-slate-100/50 flex justify-between items-center max-w-sm relative z-10 group transition-all hover:border-emerald-500"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${level === 0 ? 'bg-slate-900' : 'bg-emerald-500'}`}>
                            {level === 0 ? <Award size={20} /> : <Users size={18} />}
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-slate-800 uppercase leading-none">{node.designation_name_en}</p>
                            <p className="text-[9px] font-bold text-emerald-600 mt-1">{node.designation_name_hi}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => handleEdit(node)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-emerald-500 transition-colors">
                            <Edit3 size={12} />
                        </button>
                    </div>
                </motion.div>

                {hasChildren && (
                    <div className="mt-4">
                        {children.map(child => (
                            <TreeNode 
                                key={child.id} 
                                node={child} 
                                allNodes={allNodes} 
                                level={level + 1} 
                                handleEdit={handleEdit} 
                                handleDelete={handleDelete} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HierarchySetup;
