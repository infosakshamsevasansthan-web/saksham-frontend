import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
  Home, Search, Save, Edit3, Trash2, X, Plus, Languages, MapPin, 
  Phone, Upload, FileText, CloudDownload, ChevronLeft, 
  ChevronRight, Info, FileSpreadsheet, Database, User, Navigation, Hash
} from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HouseholdRegistry = () => {
    // 🔐 Dynamic Tenant ID
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = storedUser.tenant || "SAK-SIW-6925"; 
    const API_BASE = "https://saksham-backend-9719.onrender.com";

    // States
    const [households, setHouseholds] = useState([]);
    const [wards, setWards] = useState([]);
    const [roads, setRoads] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5); 

    const [formData, setFormData] = useState({
        hhd_id: '', ward_id: '', road_id: '', muni_house_no: '', mobile: '',
        owner_name_en: '', owner_name_hi: '', guardian_name_en: '', guardian_name_hi: '',
        full_address_en: '', full_address_hi: ''
    });

    useEffect(() => {
        fetchData();
        fetchWards();
    }, [tenantId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/api/admin/households/${tenantId}`);
            if (res.data.success) setHouseholds(res.data.data);
        } catch (e) { console.error("Fetch Error"); }
        setLoading(false);
    };

    const fetchWards = async () => {
        const res = await axios.get(`${API_BASE}/api/admin/wards/${tenantId}`);
        if (res.data.success) setWards(res.data.data);
    };

    const fetchRoads = async (wId) => {
        const res = await axios.get(`${API_BASE}/api/admin/roads-by-ward/${tenantId}/${wId}`);
        if (res.data.success) setRoads(res.data.data);
    };

    const translate = async (text, field) => {
        if(!text) return;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURI(text)}`);
            const json = await res.json();
            setFormData(prev => ({ ...prev, [field]: json[0][0][0] }));
        } catch (e) { console.error("Translate error"); }
    };

    const handleEdit = (item) => {
        setEditMode(true);
        setFormData({ ...item });
        fetchRoads(item.ward_id);
        setShowModal(true);
    };

    const handleDelete = async (hhdId) => {
        if(window.confirm("Bhai, kya aap sach mein delete karna chahte hain?")) {
            await axios.delete(`${API_BASE}/api/admin/households/delete/${hhdId}`);
            fetchData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if(editMode) {
                await axios.put(`${API_BASE}/api/admin/households/update/${formData.hhd_id}`, formData);
            } else {
                await axios.post(`${API_BASE}/api/admin/households/add`, { ...formData, tenant_id: tenantId });
            }
            setShowModal(false);
            fetchData();
            alert("Success!");
        } catch (e) { alert("Data base sync error!"); }
    };

    const handleBulkUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            if(window.confirm(`${json.length} records found. Upload now?`)) {
                axios.post(`${API_BASE}/api/admin/households/bulk-add`, { tenant_id: tenantId, data: json })
                .then(() => { alert("Bulk Upload Success!"); fetchData(); })
                .catch(() => alert("Bulk Upload Failed"));
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const template = [{ ward_id: '', road_id: '', muni_house_no: '', mobile: '', owner_name_en: '', guardian_name_en: '', full_address_en: '' }];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "HHD_Bulk_Template.xlsx");
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(households);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Households");
        XLSX.writeFile(wb, "Household_Report.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Household Registry - " + tenantId, 14, 15);
        const tableRows = households.map(h => [h.hhd_id, h.owner_name_en, h.ward_no, h.mobile]);
        doc.autoTable({ head: [['ID', 'Owner', 'Ward', 'Mobile']], body: tableRows, startY: 20 });
        doc.save("Household_Report.pdf");
    };

    const filteredData = households.filter(h => 
        h.owner_name_en?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        h.hhd_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / pageSize);

    return (
        <CityLayout>
            <div className="p-4 space-y-6 bg-slate-50/50 min-h-screen">
                {/* Header Section */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Household Registry</h1>
                        <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest mt-1">Tenant Database Management System</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={downloadTemplate} className="bg-amber-50 text-amber-600 px-4 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 border border-amber-100"><CloudDownload size={16}/> Template</button>
                        <div className="relative">
                            <input type="file" className="hidden" id="bulk" onChange={handleBulkUpload} accept=".xlsx,.xls"/>
                            <label htmlFor="bulk" className="bg-blue-50 text-blue-600 px-4 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 cursor-pointer border border-blue-100"><Upload size={16}/> Bulk Upload</label>
                        </div>
                        <button onClick={() => { setEditMode(false); setFormData({}); setShowModal(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg shadow-slate-200"><Plus size={16}/> Add Manual</button>
                    </div>
                </header>

                {/* Controls Section */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 bg-white p-2 rounded-[25px] shadow-sm border border-slate-100 flex items-center">
                        <Search className="ml-4 text-slate-300" size={20}/>
                        <input type="text" placeholder="Search residents..." className="w-full p-4 font-bold text-slate-600 outline-none bg-transparent" onChange={(e)=>{setSearchTerm(e.target.value); setCurrentPage(1);}} />
                    </div>
                    <div className="bg-white px-4 rounded-[25px] shadow-sm border border-slate-100 flex gap-2 items-center">
                        <button onClick={exportToExcel} className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><FileSpreadsheet size={20}/></button>
                        <button onClick={exportToPDF} className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><FileText size={20}/></button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="p-6">Resident Details</th>
                                    <th>Location</th>
                                    <th>Contact</th>
                                    <th className="text-right p-6">Management</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
                                {currentItems.map((item) => (
                                    <tr key={item.hhd_id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="p-6">
                                            <p className="text-slate-900 font-black tracking-tight">{item.owner_name_en}</p>
                                            <p className="text-[10px] text-slate-400 uppercase">{item.hhd_id}</p>
                                        </td>
                                        <td className="text-xs">Ward {item.ward_no} • {item.road_name_en}</td>
                                        <td className="text-xs tracking-widest">{item.mobile}</td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(item)} className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-2xl transition-all"><Edit3 size={16}/></button>
                                                <button onClick={() => handleDelete(item.hhd_id)} className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ============================================================
                    NEW UPDATED MODAL: FIXED POSITION & HIGH Z-INDEX
                   ============================================================ */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[99999]">
                        <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">
                            
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-200">
                                        <Database size={20}/>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
                                            {editMode ? 'Update Resident Profile' : 'New Registry Entry'}
                                        </h2>
                                        <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Saksham Master Engine • {tenantId}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100">
                                    <X size={24}/>
                                </button>
                            </div>

                            {/* Form Area - Scrollable */}
                            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 bg-white">
                                
                                {/* 1. Location Details Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1"><MapPin size={10}/> Ward Number</label>
                                        <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" value={formData.ward_id} onChange={(e) => { setFormData({...formData, ward_id: e.target.value}); fetchRoads(e.target.value); }}>
                                            <option value="">Select Ward</option>
                                            {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1"><Navigation size={10}/> Road Name</label>
                                        <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" value={formData.road_id} onChange={(e) => setFormData({...formData, road_id: e.target.value})}>
                                            <option value="">Select Road</option>
                                            {roads.map(r => <option key={r.id} value={r.id}>{r.road_name_en}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1"><Hash size={10}/> House No</label>
                                        <input type="text" required placeholder="Ex: 131/125" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" value={formData.muni_house_no} onChange={(e)=>setFormData({...formData, muni_house_no: e.target.value})} />
                                    </div>
                                </div>

                                {/* 2. Names Section (English/Hindi Grouped) */}
                                <div className="p-8 rounded-[35px] bg-emerald-50/30 border border-emerald-100/50 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Owner Names */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1"><User size={10}/> Owner (English)</label>
                                                <input type="text" required className="w-full bg-white p-4 rounded-2xl font-bold border border-slate-100 shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.owner_name_en} onChange={(e)=>setFormData({...formData, owner_name_en: e.target.value})} onBlur={(e)=>translate(e.target.value, 'owner_name_hi')} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 ml-2 uppercase flex items-center gap-1"><Languages size={10}/> मालिक का नाम (Hindi)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border-2 border-emerald-100 focus:border-emerald-500 outline-none transition-all" value={formData.owner_name_hi} onChange={(e)=>setFormData({...formData, owner_name_hi: e.target.value})} />
                                            </div>
                                        </div>
                                        {/* Guardian Names */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1"><User size={10}/> Guardian (English)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold border border-slate-100 shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.guardian_name_en} onChange={(e)=>setFormData({...formData, guardian_name_en: e.target.value})} onBlur={(e)=>translate(e.target.value, 'guardian_name_hi')} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 ml-2 uppercase flex items-center gap-1"><Languages size={10}/> अभिभावक का नाम (Hindi)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border-2 border-emerald-100 focus:border-emerald-500 outline-none transition-all" value={formData.guardian_name_hi} onChange={(e)=>setFormData({...formData, guardian_name_hi: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Contact & Address */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1"><Phone size={10}/> Mobile Number</label>
                                        <input type="tel" required placeholder="9876543210" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" value={formData.mobile} onChange={(e)=>setFormData({...formData, mobile: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 ml-2 uppercase flex items-center gap-1"><Navigation size={10}/> Physical Address (English)</label>
                                        <input type="text" placeholder="House Location Detail" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all" value={formData.full_address_en} onChange={(e)=>setFormData({...formData, full_address_en: e.target.value})} onBlur={(e)=>translate(e.target.value, 'full_address_hi')} />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-600 transition-all flex justify-center items-center gap-3 shadow-xl shadow-slate-200">
                                        <Save size={18}/> {editMode ? 'Confirm Database Sync' : 'Register Into System'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </CityLayout>
    );
};

export default HouseholdRegistry;
