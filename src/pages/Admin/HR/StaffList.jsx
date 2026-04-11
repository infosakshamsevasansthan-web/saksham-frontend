import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { UserPlus, Search, Users, X, Save, Loader2, Sparkles, Edit3, Download, UploadCloud, Languages, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';

const StaffList = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const tenantId = localStorage.getItem('tenantId');

    const [formData, setFormData] = useState({
        full_name_en: '', full_name_hi: '', employee_id: '', mobile: '', fh_name: '', gender: 'Male', address: ''
    });

    // 1. Fetch Staff List
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-full/${tenantId}`);
            setStaff(res.data.data || []);
        } catch (err) { toast.error("Fetch failed"); }
        finally { setLoading(false); }
    };

    // 2. Fetch Next Auto-ID when Modal opens
    const generateNextId = async () => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/next-staff-id/${tenantId}`);
            if (res.data.success) {
                setFormData(prev => ({ ...prev, employee_id: res.data.nextId }));
            }
        } catch (err) { console.error("ID Gen Error", err); }
    };

    useEffect(() => { fetchStaff(); }, [tenantId]);

    useEffect(() => {
        if (showModal) generateNextId();
    }, [showModal]);

    // 3. English to Hindi Transliteration
    const handleTranslation = async (englishText) => {
        setFormData(prev => ({ ...prev, full_name_en: englishText }));
        if (englishText.length < 2) return;
        try {
            const response = await fetch(`https://inputtools.google.com/request?text=${englishText}&ime=transliteration_en_hi&num=1`);
            const data = await response.json();
            if (data[0] === 'SUCCESS') {
                setFormData(prev => ({ ...prev, full_name_hi: data[1][0][1][0] }));
            }
        } catch (error) { console.error(error); }
    };

    // 4. Single Registration Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/staff/add', { ...formData, tenant_id: tenantId });
            if (res.data.success) {
                toast.success(`Registered! ID: ${formData.employee_id}`);
                setShowModal(false);
                setFormData({ full_name_en: '', full_name_hi: '', employee_id: '', mobile: '', fh_name: '', gender: 'Male', address: '' });
                fetchStaff();
            }
        } catch (err) { toast.error("Submission failed"); }
    };

    // 5. Bulk Upload Function
    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('file', file);
        formDataFile.append('tenant_id', tenantId);

        const toastId = toast.loading("Processing Excel Data...");
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/staff/bulk-upload', formDataFile);
            if (res.data.success) {
                toast.success(res.data.message, { id: toastId });
                fetchStaff();
            }
        } catch (err) { toast.error("Bulk upload failed", { id: toastId }); }
    };

    // 6. Download Excel Template
    const downloadTemplate = () => {
        const template = [{ EmployeeID: 'Auto', NameEnglish: 'Ram Kumar', NameHindi: 'राम कुमार', FatherHusbandName: 'Shyam Kumar', Gender: 'Male', Mobile: '9988776655', Address: 'Siwan, Bihar' }];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Staff_Template");
        XLSX.writeFile(wb, "Staff_Upload_Template.xlsx");
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left animate-in fade-in duration-500">
                
                {/* --- HEADER SECTION --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg"><Users size={24} /></div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase italic">Personnel Registry</h1>
                            <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest mt-1">Staff Master Management</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <input type="file" hidden ref={fileInputRef} accept=".xlsx, .xls" onChange={handleBulkUpload} />
                        <button onClick={downloadTemplate} className="bg-slate-50 text-slate-600 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all">
                            <Download size={16} /> Template
                        </button>
                        <button onClick={() => fileInputRef.current.click()} className="bg-blue-50 text-blue-600 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                            <UploadCloud size={16} /> Bulk Upload
                        </button>
                        <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
                            <UserPlus size={16} /> Register Staff
                        </button>
                    </div>
                </header>

                {/* --- SEARCH & TABLE SECTION --- */}
                <div className="bg-white rounded-[35px] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                            <input type="text" placeholder="Search staff..." className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 font-bold text-sm outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Records: {staff.length}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b">
                                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="p-8">ID & Full Name</th>
                                    <th className="p-4">F/H Name & Gender</th>
                                    <th className="p-4">Mobile & Address</th>
                                    <th className="p-4 text-center">Update</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32}/></td></tr>
                                ) : staff.length === 0 ? (
                                    <tr><td colSpan="4" className="p-20 text-center font-black text-slate-300 uppercase text-xs">No Data Found</td></tr>
                                ) : staff.filter(s => s.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())).map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">{s.full_name_en.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm leading-none uppercase">{s.full_name_en}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600 mt-1 italic">{s.employee_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs font-bold text-slate-600 uppercase mb-1">{s.fh_name}</p>
                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${s.gender === 'Male' ? 'bg-blue-50 text-blue-500' : 'bg-rose-50 text-rose-500'}`}>{s.gender}</span>
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            <p className="text-xs font-bold text-slate-700">{s.mobile}</p>
                                            <p className="text-[9px] font-bold text-slate-400 truncate uppercase">{s.address}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => navigate(`/admin/users/update/${s.id}`)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:shadow-md transition-all active:scale-90"><Edit3 size={18}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- REGISTER MODAL --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[45px] shadow-2xl overflow-hidden border border-slate-100">
                            <div className="p-8 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 uppercase italic leading-none">New Enrollment</h2>
                                    <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2"><Sparkles size={12}/> Auto ID: {formData.employee_id}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-11 h-11 bg-white rounded-xl text-rose-500 font-black shadow-sm">X</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Name (English)</label>
                                    <input required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-sm uppercase transition-all" placeholder="Ram Kumar" onChange={(e) => handleTranslation(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">नाम (हिन्दी - Auto)</label>
                                    <input required className="w-full p-4 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl outline-none font-bold text-sm text-emerald-700" value={formData.full_name_hi} onChange={(e)=>setFormData({...formData, full_name_hi: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Father / Husband Name</label>
                                    <input required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-sm uppercase" placeholder="F/H Name" onChange={(e)=>setFormData({...formData, fh_name: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Gender & Mobile</label>
                                    <div className="flex gap-2">
                                        <select className="p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none shadow-inner" onChange={(e)=>setFormData({...formData, gender: e.target.value})}>
                                            <option>Male</option><option>Female</option><option>Other</option>
                                        </select>
                                        <input required className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs shadow-inner" placeholder="10 Digit Mobile" onChange={(e)=>setFormData({...formData, mobile: e.target.value})} />
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Current Address</label>
                                    <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs shadow-inner" placeholder="Complete Address Details" onChange={(e)=>setFormData({...formData, address: e.target.value})} />
                                </div>
                                <button type="submit" className="col-span-1 md:col-span-2 bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3 mt-4">
                                    <Save size={18}/> Authorize Registration
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

export default StaffList;