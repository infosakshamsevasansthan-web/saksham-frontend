import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Settings, Plus, Trash2, Edit3, Layers, GitBranch, ArrowLeft, Loader2, Save, Sparkles, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const GrievanceSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [types, setTypes] = useState([]);
    const [subTypes, setSubTypes] = useState([]);
    const [activeTab, setActiveTab] = useState('main'); // 'main' or 'sub'
    const tenantId = localStorage.getItem('tenantId');

    // Form States
    const [mainForm, setMainForm] = useState({ name_en: '', name_hi: '' });
    const [subForm, setSubForm] = useState({ category_id: '', name_en: '', name_hi: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/grievance/master/${tenantId}`);
            setTypes(res.data.types);
            setSubTypes(res.data.subTypes);
        } catch (e) { toast.error("Sync Failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    const handleTranslate = async (text, target, formType) => {
        if (formType === 'main') setMainForm(prev => ({ ...prev, name_en: text }));
        else setSubForm(prev => ({ ...prev, name_en: text }));

        if (text.length < 2) return;
        try {
            const res = await fetch(`https://inputtools.google.com/request?text=${text}&ime=transliteration_en_hi&num=1`);
            const data = await res.json();
            if (data[0] === 'SUCCESS') {
                const hiText = data[1][0][1][0];
                if (formType === 'main') setMainForm(prev => ({ ...prev, name_hi: hiText }));
                else setSubForm(prev => ({ ...prev, name_hi: hiText }));
            }
        } catch (e) {}
    };

    const handleAddMain = async (e) => {
        e.preventDefault();
        await axios.post('https://saksham-backend-9719.onrender.com/api/admin/grievance/type/add', { ...mainForm, tenant_id: tenantId });
        toast.success("Main Category Added!");
        setMainForm({ name_en: '', name_hi: '' });
        fetchData();
    };

    const handleAddSub = async (e) => {
        e.preventDefault();
        await axios.post('https://saksham-backend-9719.onrender.com/api/admin/grievance/sub-type/add', { ...subForm, tenant_id: tenantId });
        toast.success("Sub-Category Added!");
        setSubForm({ category_id: '', name_en: '', name_hi: '' });
        fetchData();
    };

    const handleDelete = async (type, id) => {
        if(!window.confirm("Bhai, kya aap ise delete karna chahte hain?")) return;
        await axios.delete(`https://saksham-backend-9719.onrender.com/api/admin/grievance/${type}/${id}`);
        toast.success("Deleted!");
        fetchData();
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left animate-in fade-in duration-700 bg-[#F8FAFC] min-h-screen">
                
                {/* HEADER */}
                <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase italic">Grievance Master Settings</h1>
                            <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest mt-1">Configure Complaint Hierarchies</p>
                        </div>
                    </div>
                    <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-200 transition-all"><ArrowLeft size={20}/></button>
                </header>

                {/* TABS SECTION */}
                <div className="flex gap-4">
                    <button onClick={() => setActiveTab('main')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'main' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}><Layers size={16}/> Main Categories</button>
                    <button onClick={() => setActiveTab('sub')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'sub' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}><GitBranch size={16}/> Sub Categories</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: ENTRY FORM (5 columns) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 sticky top-24">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-slate-900 rounded-xl"><Plus size={18} className="text-emerald-400"/></div>
                                <h2 className="text-lg font-black text-slate-800 uppercase italic">Create New {activeTab === 'main' ? 'Category' : 'Sub-Category'}</h2>
                            </div>

                            {activeTab === 'main' ? (
                                <form onSubmit={handleAddMain} className="space-y-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Category Name (English)</label>
                                        <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm uppercase transition-all" placeholder="e.g. Drainage" value={mainForm.name_en} onChange={(e) => handleTranslate(e.target.value, 'name_hi', 'main')} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">नाम (हिन्दी - Auto)</label>
                                        <input required className="w-full p-4 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl outline-none font-bold text-sm text-emerald-700" value={mainForm.name_hi} onChange={(e)=>setMainForm({...mainForm, name_hi: e.target.value})} />
                                    </div>
                                    <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl"><Save size={18} className="inline mr-2"/> Save Category</button>
                                </form>
                            ) : (
                                <form onSubmit={handleAddSub} className="space-y-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Link to Main Category</label>
                                        <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm" onChange={(e)=>setSubForm({...subForm, category_id: e.target.value})}>
                                            <option value="">Select Main Group...</option>
                                            {types.map(t => <option key={t.id} value={t.id}>{t.type_name_en}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Sub-Type Name (English)</label>
                                        <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm uppercase" placeholder="e.g. Manhole Cover" value={subForm.name_en} onChange={(e) => handleTranslate(e.target.value, 'name_hi', 'sub')} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">उप-नाम (हिन्दी - Auto)</label>
                                        <input required className="w-full p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl outline-none font-bold text-sm text-blue-700" value={subForm.name_hi} onChange={(e)=>setSubForm({...subForm, name_hi: e.target.value})} />
                                    </div>
                                    <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-xl"><Save size={18} className="inline mr-2"/> Save Sub-Category</button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: LIST VIEW (7 columns) */}
                    <div className="lg:col-span-7 bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                                {activeTab === 'main' ? <Layers size={16}/> : <GitBranch size={16}/>} 
                                Registered {activeTab === 'main' ? 'Categories' : 'Sub-Categories'}
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white border-b text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-6">{activeTab === 'main' ? 'Category Name' : 'Sub-Category'}</th>
                                        {activeTab === 'sub' && <th className="p-4">Linked To</th>}
                                        <th className="p-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="3" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
                                    ) : (activeTab === 'main' ? types : subTypes).map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-6">
                                                <p className="font-black text-slate-800 text-sm uppercase">{item.type_name_en || item.sub_type_name_en}</p>
                                                <p className="text-[11px] font-bold text-emerald-600">{item.type_name_hi || item.sub_type_name_hi}</p>
                                            </td>
                                            {activeTab === 'sub' && <td className="p-4 text-[10px] font-black text-slate-400 uppercase italic">Parent: {item.parent_cat}</td>}
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <button className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:text-blue-600 transition-all"><Edit3 size={14}/></button>
                                                    <button onClick={() => handleDelete(activeTab, item.id)} className="p-2 bg-rose-50 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </CityLayout>
    );
};

export default GrievanceSettings;