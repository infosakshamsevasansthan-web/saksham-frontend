import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Network, Plus, Trash2, GitBranch, Save, ChevronRight, LayoutGrid, ShieldCheck, Layers, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const HierarchySetup = () => {
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const tenantId = localStorage.getItem('tenantId');

    const [formData, setFormData] = useState({
        name_en: '', name_hi: '', parent_id: '', role_id: '5'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/designations/${tenantId}`);
            setDesignations(res.data.data || []);
        } catch (err) { toast.error("Error loading structure"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/designations/add', { ...formData, tenant_id: tenantId });
            if(res.data.success) {
                toast.success("Designation Added to Chart! ✅");
                setShowModal(false);
                setFormData({ name_en: '', name_hi: '', parent_id: '', role_id: '5' });
                fetchData();
            }
        } catch (err) { toast.error("Submission failed"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left animate-in fade-in duration-500">
                
                {/* 1. Header (Compact) */}
                <header className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-800 uppercase italic leading-none">Command Structure</h1>
                            <p className="text-emerald-600 font-bold text-[8px] uppercase tracking-widest mt-1">Designation & Reporting Master</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
                        <Plus size={16} /> Create New Post
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* 2. Left Side: Post Overview Cards (40%) */}
                    <div className="lg:col-span-5 space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Designation Registry</h3>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? <Loader2 className="animate-spin mx-auto text-emerald-500" /> : designations.map((d) => (
                                <div key={d.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all border-l-4 border-l-emerald-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase">{d.designation_name_en}</p>
                                            <p className="text-[10px] font-bold text-emerald-600">{d.designation_name_hi}</p>
                                        </div>
                                        <span className="bg-slate-50 px-2 py-1 rounded text-[8px] font-black text-slate-400 uppercase">LVL-{d.role_id}</span>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2">
                                        <GitBranch size={12} className="text-slate-300" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Reports to: <span className="text-slate-600 ml-1">{d.report_to_name || 'Top Authority'}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Right Side: Visual Org Chart (60%) */}
                    <div className="lg:col-span-7 bg-white rounded-[40px] border border-slate-100 p-8 min-h-[600px] shadow-inner relative">
                        <div className="absolute top-6 left-8 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Organization Chart</p>
                        </div>
                        
                        <div className="mt-12 space-y-2">
                            {designations.filter(d => !d.parent_id).map(root => (
                                <TreeNode key={root.id} node={root} allNodes={designations} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE POST MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 text-left">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[45px] shadow-2xl overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-800 uppercase italic">Define Authority Post</h2>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm font-black">X</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-10 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Post Name (English)</label>
                                            <input required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none font-bold text-sm" placeholder="e.g. Ward Inspector" onChange={(e)=>setFormData({...formData, name_en: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Post Name (हिन्दी)</label>
                                            <input required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none font-bold text-sm" placeholder="जांच अधिकारी" onChange={(e)=>setFormData({...formData, name_hi: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Reporting Authority (Select Boss Post)</label>
                                        <select className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 outline-none font-bold text-sm" onChange={(e)=>setFormData({...formData, parent_id: e.target.value})}>
                                            <option value="">Top Level (No Boss)</option>
                                            {designations.map(d => <option key={d.id} value={d.id}>{d.designation_name_en}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Access Level (System Role)</label>
                                        <select className="w-full p-4 bg-emerald-50 rounded-2xl border border-emerald-100 outline-none font-bold text-emerald-600 text-sm" onChange={(e)=>setFormData({...formData, role_id: e.target.value})}>
                                            <option value="1">Executive Level (Admin)</option>
                                            <option value="2">Inspector Level</option>
                                            <option value="3">Supervisor Level</option>
                                            <option value="4">Field Level (Driver/Mitra)</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[25px] font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3 mt-4">
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

// 🟢 RECURSIVE DESIGNATION NODE
const TreeNode = ({ node, allNodes, level = 0 }) => {
    const children = allNodes.filter(d => d.parent_id === node.id);
    const hasChildren = children.length > 0;

    return (
        <div className="ml-10 border-l-2 border-slate-100 pl-8 py-3 relative">
            <div className="absolute left-0 top-10 w-6 h-0.5 bg-slate-200" />
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center max-w-sm hover:border-emerald-500 transition-all group">
                <div>
                    <p className="text-xs font-black text-slate-700 uppercase leading-none">{node.designation_name_en}</p>
                    <p className="text-[9px] font-bold text-emerald-600 mt-1">{node.designation_name_hi}</p>
                </div>
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                    <ChevronRight size={14} />
                </div>
            </div>

            {hasChildren && (
                <div className="mt-3 space-y-2">
                    {children.map(child => (
                        <TreeNode key={child.id} node={child} allNodes={allNodes} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HierarchySetup;