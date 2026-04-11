import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { ArrowLeft, Save, User, Phone, MapPin, FileText, Camera, Languages, Loader2, CheckCircle, Printer, X, Copy, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const AddGrievance = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [mobileError, setMobileError] = useState(false);

    const tenantId = localStorage.getItem('tenantId');
    const [formData, setFormData] = useState({
        name_en: '', name_hi: '', mobile: '', gender: 'Male', email: '',
        ward_id: '', cat_id: '', sub_cat_id: '', 
        address_en: '', address_hi: '', 
        description_en: '', description_hi: '',
        source: 'Counter'
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [catRes, wardRes] = await Promise.all([
                    axios.get(`https://saksham-backend-9719.onrender.com/api/admin/grievance/categories/${tenantId}`),
                    axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`)
                ]);
                setCategories(catRes.data.data || []);
                setWards(wardRes.data.data || []);
            } catch (e) { toast.error("Connection Error"); }
        };
        loadData();
    }, [tenantId]);

    // 🟢 English to Hindi Auto-transliteration
    const handleTranslation = async (text, enField, hiField) => {
        setFormData(prev => ({ ...prev, [enField]: text }));
        if(text.length < 2) return;
        try {
            const res = await fetch(`https://inputtools.google.com/request?text=${text}&ime=transliteration_en_hi&num=1`);
            const data = await res.json();
            if(data[0] === 'SUCCESS') {
                setFormData(prev => ({ ...prev, [hiField]: data[1][0][1][0] }));
            }
        } catch(e) {}
    };

    // 🟢 Sub-Category Load Logic (FIXED)
    const handleCategoryChange = async (e) => {
        const catId = e.target.value;
        setFormData({...formData, cat_id: catId, sub_cat_id: ''});
        if(!catId) {
            setSubCategories([]);
            return;
        }
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/grievance/sub-types/${catId}`);
            setSubCategories(res.data.data || []);
        } catch (err) {
            toast.error("Sub-categories load failed");
        }
    };

    const handleMobileChange = (val) => {
        const cleaned = val.replace(/\D/g, '').slice(0, 10);
        setFormData({...formData, mobile: cleaned});
        if (cleaned.length > 0 && parseInt(cleaned[0]) < 6) setMobileError(true);
        else setMobileError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(mobileError || formData.mobile.length !== 10) return toast.error("Check Mobile Number");
        setLoading(true);
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/grievance/submit', { ...formData, tenant_id: tenantId });
            if(res.data.success) {
                // Success Modal mein dikhane ke liye data set karein
                setSuccessData({ 
                    ...formData, 
                    grievance_no: res.data.grievance_no,
                    ward_no: wards.find(w => w.id == formData.ward_id)?.ward_no
                });
            }
        } catch (err) { toast.error("Submission failed"); }
        finally { setLoading(false); }
    };

    // 🟢 WhatsApp Copy Logic (Formatted)
    const copyForWhatsApp = () => {
        const text = `📍 *सक्षम - शिकायत पंजीकरण रसीद*\n` +
                     `━━━━━━━━━━━━━━━━\n` +
                     `🆔 *शिकायत सं:* ${successData.grievance_no}\n` +
                     `👤 *नाम:* ${successData.name_hi}\n` +
                     `📱 *मोबाइल:* ${successData.mobile}\n` +
                     `🏘️ *वार्ड:* ${successData.ward_no}\n` +
                     `🏠 *पता:* ${successData.address_hi}\n` +
                     `📝 *शिकायत:* ${successData.description_hi}\n` +
                     `━━━━━━━━━━━━━━━━\n` +
                     `✅ *आपकी शिकायत दर्ज कर ली गई है। जल्द ही समाधान किया जाएगा।*`;
        
        navigator.clipboard.writeText(text);
        toast.success("WhatsApp मैसेज कॉपी हुआ! ✅");
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto p-4 text-left animate-in fade-in duration-700">
                <header className="flex justify-between items-center mb-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 uppercase italic">Register Grievance</h1>
                        <p className="text-rose-500 font-bold text-[9px] uppercase tracking-widest mt-1">Help-Desk Portal | सहायता केंद्र</p>
                    </div>
                    <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><ArrowLeft size={18}/></button>
                </header>

                <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-10 space-y-10">
                        
                        {/* SECTION 1: PERSONAL DETAILS */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b pb-2">1. Person Details / व्यक्तिगत विवरण</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Name (EN to HI)</label>
                                    <input required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-sm uppercase" placeholder="Full Name" onChange={(e) => handleTranslation(e.target.value, 'name_en', 'name_hi')} />
                                    <input required className="w-full p-4 mt-2 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl outline-none font-bold text-sm text-emerald-700" value={formData.name_hi} onChange={(e)=>setFormData({...formData, name_hi: e.target.value})} placeholder="हिन्दी नाम" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Mobile Number</label>
                                    <input required type="text" value={formData.mobile} className={`w-full p-4 rounded-2xl outline-none font-bold text-sm border-2 ${mobileError ? 'border-rose-500 bg-rose-50' : 'bg-slate-50 border-transparent'}`} placeholder="98765..." onChange={(e)=>handleMobileChange(e.target.value)} />
                                    {mobileError && <p className="text-[8px] text-rose-500 font-bold mt-1 ml-2 uppercase">Must start with 6-9</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Gender / लिंग</label>
                                    <select className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold text-sm" onChange={(e)=>setFormData({...formData, gender: e.target.value})}>
                                        <option>Male</option><option>Female</option><option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: CATEGORY & WARD */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b pb-2">2. Categorization / श्रेणी और वार्ड</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Category</label>
                                    <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none" onChange={handleCategoryChange}>
                                        <option value="">Select...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.type_name_hi}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Sub-Category</label>
                                    <select required className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" value={formData.sub_cat_id} onChange={(e)=>setFormData({...formData, sub_cat_id: e.target.value})} disabled={!formData.cat_id}>
                                        <option value="">Select...</option>
                                        {subCategories.map(s => <option key={s.id} value={s.id}>{s.sub_type_name_hi}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Ward No.</label>
                                    <select required className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" onChange={(e)=>setFormData({...formData, ward_id: e.target.value})}>
                                        <option value="">Choose...</option>
                                        {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: ADDRESS & DETAILS */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b pb-2">3. Detailed Address & Description</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><MapPin size={12}/> Address (EN to HI)</label>
                                    <textarea required rows="2" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-sm uppercase" placeholder="Street / House" onChange={(e) => handleTranslation(e.target.value, 'address_en', 'address_hi')} />
                                    <textarea required rows="2" className="w-full p-4 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl outline-none font-bold text-sm text-emerald-700" value={formData.address_hi} onChange={(e)=>setFormData({...formData, address_hi: e.target.value})} placeholder="हिन्दी में पता" />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><FileText size={12}/> Complaint (EN to HI)</label>
                                    <textarea required rows="2" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-sm" placeholder="Describe issue" onChange={(e) => handleTranslation(e.target.value, 'description_en', 'description_hi')} />
                                    <textarea required rows="2" className="w-full p-4 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl outline-none font-bold text-sm text-emerald-700" value={formData.description_hi} onChange={(e)=>setFormData({...formData, description_hi: e.target.value})} placeholder="विवरण हिन्दी में" />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-6 rounded-[30px] font-black uppercase text-sm tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95">
                            {loading ? <Loader2 className="animate-spin" /> : <Save />} Register & Generate ID
                        </button>
                    </form>
                </div>
            </div>

            {/* --- 🟢 SUCCESS CARD MODAL --- */}
            <AnimatePresence>
                {successData && (
                    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[50px] shadow-2xl overflow-hidden text-left border-4 border-emerald-500">
                            <div className="bg-emerald-600 p-8 text-center text-white relative">
                                <CheckCircle size={50} className="mx-auto mb-4" />
                                <h2 className="text-xl font-black uppercase italic tracking-tighter">पंजीकरण सफल</h2>
                                <div className="mt-4 bg-white/20 p-2 rounded-xl backdrop-blur-md font-black text-2xl tracking-widest">
                                    {successData.grievance_no}
                                </div>
                            </div>
                            <div className="p-10 space-y-4 font-bold text-slate-800 text-base">
                                <div className="flex justify-between border-b border-slate-100 pb-2"><span>नामः-</span> <span>{successData.name_hi}</span></div>
                                <div className="flex justify-between border-b border-slate-100 pb-2"><span>मोबाइल न0ः-</span> <span>{successData.mobile}</span></div>
                                <div className="flex justify-between border-b border-slate-100 pb-2"><span>वार्ड संः-</span> <span>{successData.ward_no}</span></div>
                                <div className="space-y-1">
                                    <span className="text-slate-400 text-[10px] uppercase font-black">पताः-</span>
                                    <p className="uppercase leading-tight text-sm">{successData.address_hi}</p>
                                </div>
                                <div className="space-y-1 pt-2">
                                    <span className="text-slate-400 text-[10px] uppercase font-black">शिकायतः-</span>
                                    <p className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 italic text-sm text-emerald-900">"{successData.description_hi}"</p>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 flex flex-col gap-3">
                                <button onClick={copyForWhatsApp} className="w-full bg-emerald-500 text-white p-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-lg hover:bg-slate-900 transition-all active:scale-95">
                                    <Copy size={18}/> Copy for WhatsApp
                                </button>
                                <div className="flex gap-3">
                                    <button onClick={() => window.print()} className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2"><Printer size={16}/> Print Slip</button>
                                    <button onClick={() => navigate('/admin/complaints')} className="flex-1 bg-slate-900 text-white p-4 rounded-2xl font-black uppercase text-[10px]">Dashboard</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

export default AddGrievance;