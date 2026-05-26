import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    UserPlus, Search, Users, X, Save, Loader2, Sparkles, Edit3, 
    Download, UploadCloud, ChevronLeft, ChevronRight, UserCog, PlusCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';

const StaffList = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [staff, setStaff] = useState([]);
    const [roles, setRoles] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [showModal, setShowModal] = useState(false);
    const [showDesigModal, setShowDesigModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    const [formData, setFormData] = useState({
        full_name_en: '', full_name_hi: '', employee_id: '', mobile: '', 
        fh_name: '', gender: 'Male', address: '', role_id: '', designation_id: ''
    });

    const [desigFormData, setDesigFormData] = useState({ role_id: '', name_en: '', name_hi: '' });

    // 1. Fetch All Data
    const loadAllData = async () => {
        setLoading(true);
        try {
            const [staffRes, roleRes, desigRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-full/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roles/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/designations/${tenantId}`)
            ]);
            setStaff(staffRes.data.data || []);
            setRoles(roleRes.data.data || []);
            setDesignations(desigRes.data.data || []);
        } catch (err) { toast.error("Data Sync Error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadAllData(); }, [tenantId]);

    // 2. ID Generator Logic
    const generateNextId = async () => {
        if (isEditMode) return; 
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-id/${tenantId}`);
            if (res.data.success) setFormData(prev => ({ ...prev, employee_id: res.data.nextId }));
        } catch (err) { console.error(err); }
    };

    useEffect(() => { if (showModal && !isEditMode) generateNextId(); }, [showModal, isEditMode]);

    // 3. Transliteration (Pro Logic)
    const handleTranslation = async (text, target) => {
        if (target === 'staff') setFormData(prev => ({ ...prev, full_name_en: text }));
        else setDesigFormData(prev => ({ ...prev, name_en: text }));

        if (text.length < 2) return;
        try {
            const res = await fetch(`https://inputtools.google.com/request?text=${text}&ime=transliteration_en_hi&num=1`);
            const data = await res.json();
            if (data[0] === 'SUCCESS') {
                if (target === 'staff') setFormData(prev => ({ ...prev, full_name_hi: data[1][0][1][0] }));
                else setDesigFormData(prev => ({ ...prev, name_hi: data[1][0][1][0] }));
            }
        } catch (error) { console.error(error); }
    };

    // 4. Submission Logic (Staff)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const tid = toast.loading("Processing...");
        try {
            const method = isEditMode ? 'put' : 'post';
            const url = isEditMode 
                ? `https://saksham-backend-9719.onrender.com/api/admin/staff/update/${selectedId}`
                : 'https://saksham-backend-9719.onrender.com/api/admin/staff/add';
            
            const res = await axios[method](url, { ...formData, tenant_id: tenantId });
            if (res.data.success) {
                toast.success(isEditMode ? "Updated!" : "Enrolled!", { id: tid });
                closeModal();
                loadAllData();
            }
        } catch (err) { toast.error("Failed!", { id: tid }); }
    };

    // 5. Designation Logic
    const handleDesigSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/designations/add', {
                ...desigFormData, tenant_id: tenantId
            });
            if (res.data.success) {
                toast.success("Pad (Designation) Added!");
                setShowDesigModal(false);
                setDesigFormData({ role_id: '', name_en: '', name_hi: '' });
                loadAllData();
            }
        } catch (e) { toast.error("Submit error"); }
    };

    const handleEditOpen = (p) => {
        setIsEditMode(true);
        setSelectedId(p.id);
        setFormData({ ...p });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditMode(false);
        setFormData({ full_name_en: '', full_name_hi: '', employee_id: '', mobile: '', fh_name: '', gender: 'Male', address: '', role_id: '', designation_id: '' });
    };

    // Pagination Logic
    const filteredStaff = staff.filter(s => s.full_name_en.toLowerCase().includes(searchTerm.toLowerCase()));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    // Template & Bulk same as before
    const downloadTemplate = () => {
        const template = [{ EmployeeID: 'Auto', NameEnglish: 'Ram Kumar', NameHindi: 'राम कुमार', FatherHusbandName: 'Shyam Kumar', RoleID: '5', DesignationID: '1', Gender: 'Male', Mobile: '9988776655', Address: 'Siwan' }];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Staff");
        XLSX.writeFile(wb, "Saksham_Staff_Template.xlsx");
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fdf = new FormData();
        formDataFile.append('file', file);
        formDataFile.append('tenant_id', tenantId);
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/staff/bulk-upload', fdf);
            if (res.data.success) { toast.success("Bulk Data Imported!"); loadAllData(); }
        } catch (err) { toast.error("Bulk upload failed"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                
                {/* --- HEADER SECTION --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg"><Users size={24} /></div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase italic">Personnel Registry</h1>
                            <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest mt-1">Staff Master Management</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setShowDesigModal(true)} className="bg-amber-50 text-amber-600 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-600 hover:text-white transition-all">
                            <UserCog size={16} /> Add Post (पद)
                        </button>
                        <button onClick={downloadTemplate} className="bg-slate-50 text-slate-600 px-5 py-3 rounded-xl font-black text-[9px] uppercase flex items-center gap-2 hover:bg-slate-200 transition-all">
                            <Download size={16} /> Template
                        </button>
                        <input type="file" hidden ref={fileInputRef} accept=".xlsx, .xls" onChange={handleBulkUpload} />
                        <button onClick={() => fileInputRef.current.click()} className="bg-blue-50 text-blue-600 px-5 py-3 rounded-xl font-black text-[9px] uppercase flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                            <UploadCloud size={16} /> Bulk Upload
                        </button>
                        <button onClick={() => { setIsEditMode(false); setShowModal(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl">
                            <UserPlus size={16} /> Register Staff
                        </button>
                    </div>
                </header>

                {/* --- TABLE SECTION --- */}
                <div className="bg-white rounded-[35px] border border-slate-200 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                            <input type="text" placeholder="Search staff..." className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 font-bold text-sm outline-none shadow-sm focus:border-emerald-400 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-white border-b">
                                <tr className="text-[9px] font-black uppercase tracking-widest">
                                    <th className="p-6">Employee Info</th>
                                    <th className="p-4">System Role</th>
                                    <th className="p-4">Mobile & Address</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={32}/></td></tr>
                                ) : currentStaff.length === 0 ? (
                                    <tr><td colSpan="4" className="p-20 text-center font-black text-slate-300 uppercase text-xs">No Records Found</td></tr>
                                ) : currentStaff.map((s, idx) => (
                                    <tr key={s.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-emerald-50 transition-colors group`}>
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">{s.full_name_en.charAt(0)}</div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm uppercase">{s.full_name_en}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600 italic">{s.employee_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                    {roles.find(r => r.id === s.role_id)?.role_name || 'GUEST'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-700">
                                                    {designations.find(d => d.id === s.designation_id)?.designation_name_en || 'Pending Post'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs font-bold text-slate-700">{s.mobile}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[150px]">{s.address}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleEditOpen(s)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:shadow-md transition-all active:scale-90"><Edit3 size={18}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- PAGER (PAGINATION) --- */}
                    <div className="p-6 bg-slate-50/50 border-t flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Page {currentPage} of {totalPages || 1}</p>
                        <div className="flex gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 bg-white rounded-lg border disabled:opacity-30 hover:bg-slate-100 transition-all"
                            >
                                <ChevronLeft size={16}/>
                            </button>
                            <button 
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 bg-white rounded-lg border disabled:opacity-30 hover:bg-slate-100 transition-all"
                            >
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STAFF REGISTER / UPDATE MODAL --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[45px] shadow-2xl overflow-hidden border">
                            <div className="p-8 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 uppercase italic leading-none">{isEditMode ? 'Update Record' : 'New Enrollment'}</h2>
                                    <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2"><Sparkles size={12}/> ID: {formData.employee_id}</p>
                                </div>
                                <button onClick={closeModal} className="w-10 h-10 bg-white rounded-xl text-rose-500 font-black shadow-sm">X</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">System Role</label>
                                    <select required value={formData.role_id} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs" onChange={(e) => setFormData({...formData, role_id: e.target.value})}>
                                        <option value="">Select Role</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Designation (Pad)</label>
                                    <select required value={formData.designation_id} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs" onChange={(e) => setFormData({...formData, designation_id: e.target.value})}>
                                        <option value="">Select Post</option>
                                        {designations.filter(d => d.role_id == formData.role_id).map(d => (
                                            <option key={d.id} value={d.id}>{d.designation_name_en}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Name (English)</label>
                                    <input required value={formData.full_name_en} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs uppercase" onChange={(e) => handleTranslation(e.target.value, 'staff')} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">नाम (हिन्दी - Auto)</label>
                                    <input required className="w-full p-4 bg-emerald-50 rounded-2xl font-bold text-xs text-emerald-700" value={formData.full_name_hi} onChange={(e)=>setFormData({...formData, full_name_hi: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Father / Husband Name</label>
                                    <input required value={formData.fh_name} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs uppercase" onChange={(e)=>setFormData({...formData, fh_name: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Gender & Mobile</label>
                                    <div className="flex gap-2">
                                        <select value={formData.gender} className="p-4 bg-slate-50 rounded-2xl font-bold text-[10px]" onChange={(e)=>setFormData({...formData, gender: e.target.value})}>
                                            <option>Male</option><option>Female</option>
                                        </select>
                                        <input required value={formData.mobile} className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold text-xs" onChange={(e)=>setFormData({...formData, mobile: e.target.value})} />
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Current Address</label>
                                    <input required value={formData.address} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs" onChange={(e)=>setFormData({...formData, address: e.target.value})} />
                                </div>
                                <button type="submit" className="col-span-1 md:col-span-2 bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                                    <Save size={18}/> {isEditMode ? 'Authorize Update' : 'Authorize Registration'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- DESIGNATION (POST) MODAL --- */}
            <AnimatePresence>
                {showDesigModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-md rounded-[45px] shadow-2xl overflow-hidden border p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black uppercase italic">Naya Pad (Post)</h2>
                                <button onClick={() => setShowDesigModal(false)}><X size={24}/></button>
                            </div>
                            <form onSubmit={handleDesigSubmit} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase">Select Base Role</label>
                                    <select required className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none" onChange={(e) => setDesigFormData({...desigFormData, role_id: e.target.value})}>
                                        <option value="">Choose Role</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase">Post Name (English)</label>
                                    <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs" placeholder="e.g. Tipper Driver" onChange={(e) => handleTranslation(e.target.value, 'desig')} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase">पद का नाम (हिन्दी)</label>
                                    <input required className="w-full p-4 bg-emerald-50 rounded-2xl font-bold text-xs text-emerald-700" value={desigFormData.name_hi} onChange={(e) => setDesigFormData({...desigFormData, name_hi: e.target.value})} />
                                </div>
                                <button type="submit" className="w-full bg-emerald-600 text-white p-5 rounded-3xl font-black uppercase text-xs shadow-lg hover:bg-slate-900 transition-all">
                                    Add Designation
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </CityLayout>
    );
};

export default StaffList;
