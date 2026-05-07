import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
  Home, Search, Save, Edit3, Trash2, X, Plus, Languages, MapPin, 
  Phone, Upload, FileText, CloudDownload, ChevronLeft, 
  ChevronRight, Database, User, Navigation, Hash, Info
} from 'lucide-react';
import axios from 'axios';

const HouseholdRegistry = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = storedUser.tenant || "SAK-SIW-6925"; 
    const API_BASE = "https://saksham-backend-9719.onrender.com";

    const [households, setHouseholds] = useState([]);
    const [wards, setWards] = useState([]);
    const [roads, setRoads] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
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
            alert("Record Updated Successfully!");
        } catch (e) { alert("Server error!"); }
    };

    return (
        <CityLayout>
            <div className="p-6 bg-slate-50 min-h-screen">
                {/* Main Header */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[30px] shadow-sm mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="bg-emerald-500 p-2 rounded-xl text-white"><Home size={20}/></div>
                            HOUSEHOLD REGISTRY
                        </h1>
                    </div>
                    <button onClick={() => { setEditMode(false); setFormData({}); setShowModal(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-slate-200">
                        <Plus size={18}/> Manual Entry
                    </button>
                </header>

                {/* Search Bar */}
                <div className="bg-white p-2 rounded-[25px] shadow-sm mb-6 flex items-center">
                    <Search className="ml-4 text-slate-300" size={20}/>
                    <input type="text" placeholder="Search residents..." className="w-full p-3 font-bold text-slate-600 outline-none" onChange={(e)=>setSearchTerm(e.target.value)} />
                </div>

                {/* Table Logic (Current UI) */}
                <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                            <tr>
                                <th className="p-6">Resident Details</th>
                                <th>Ward</th>
                                <th className="text-right p-6">Management</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {households.filter(h => h.owner_name_en?.toLowerCase().includes(searchTerm.toLowerCase())).slice(0,5).map((item) => (
                                <tr key={item.hhd_id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="p-6">
                                        <p className="text-slate-900 font-black">{item.owner_name_en}</p>
                                        <p className="text-[10px] text-slate-400">{item.hhd_id}</p>
                                    </td>
                                    <td><span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold">Ward {item.ward_no}</span></td>
                                    <td className="p-6 text-right">
                                        <button onClick={() => handleEdit(item)} className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white rounded-xl transition-all">
                                            <Edit3 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ============================================================
                    DESIGNER MODAL (FIXED POSITION & HIGH Z-INDEX)
                ============================================================ */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[99999]">
                        {/* Modal Container */}
                        <div className="bg-white w-full max-w-4xl rounded-[45px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[95vh]">
                            
                            {/* 1. Header Area */}
                            <div className="p-8 bg-gradient-to-br from-slate-50 to-white flex justify-between items-center border-b border-slate-100">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
                                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Edit3 size={20}/></div>
                                        {editMode ? 'UPDATE RESIDENT PROFILE' : 'ADD NEW RESIDENT'}
                                    </h2>
                                    <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] ml-11">
                                        SAKSHAM CITY MASTER ENGINE • <span className="text-slate-400">{tenantId}</span>
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="bg-white p-4 rounded-full shadow-sm hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100">
                                    <X size={24}/>
                                </button>
                            </div>

                            {/* 2. Scrollable Form Area */}
                            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-10 bg-white">
                                
                                {/* A. Section: Geographic Identity */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                                        <MapPin size={16}/>
                                        <h3 className="text-[11px] font-black uppercase tracking-widest">Location Identity</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 ml-2">WARD NUMBER</label>
                                            <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.ward_id} onChange={(e) => { setFormData({...formData, ward_id: e.target.value}); fetchRoads(e.target.value); }}>
                                                <option value="">Select Ward</option>
                                                {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 ml-2">ROAD / STREET</label>
                                            <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.road_id} onChange={(e) => setFormData({...formData, road_id: e.target.value})}>
                                                <option value="">Select Road</option>
                                                {roads.map(r => <option key={r.id} value={r.id}>{r.road_name_en}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 ml-2">MUNI HOUSE NO</label>
                                            <div className="relative">
                                                <input type="text" required placeholder="Ex: 131/125" className="w-full bg-slate-50 p-4 pl-12 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.muni_house_no} onChange={(e)=>setFormData({...formData, muni_house_no: e.target.value})} />
                                                <Hash className="absolute left-4 top-4.5 text-slate-300" size={18}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* B. Section: Resident Profiling */}
                                <div className="p-8 bg-emerald-50/40 border border-emerald-100 rounded-[35px] space-y-8">
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <User size={16}/>
                                        <h3 className="text-[11px] font-black uppercase tracking-widest">Resident Profiling</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Owner Box */}
                                        <div className="space-y-3">
                                            <div className="group">
                                                <label className="text-[10px] font-bold text-slate-400 ml-1">OWNER NAME (ENGLISH)</label>
                                                <input type="text" required className="w-full bg-white p-4 rounded-2xl font-bold border-2 border-transparent shadow-sm focus:border-emerald-500 outline-none" value={formData.owner_name_en} onChange={(e)=>setFormData({...formData, owner_name_en: e.target.value})} onBlur={(e)=>translate(e.target.value, 'owner_name_hi')} />
                                            </div>
                                            <div className="group">
                                                <label className="text-[10px] font-black text-emerald-600 ml-1 flex items-center gap-1"><Languages size={12}/> मालिक का नाम (हिन्दी)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border-2 border-emerald-200/50 focus:border-emerald-500 outline-none" value={formData.owner_name_hi} onChange={(e)=>setFormData({...formData, owner_name_hi: e.target.value})} />
                                            </div>
                                        </div>

                                        {/* Guardian Box */}
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 ml-1">GUARDIAN NAME (ENGLISH)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold border-2 border-transparent shadow-sm focus:border-emerald-500 outline-none" value={formData.guardian_name_en} onChange={(e)=>setFormData({...formData, guardian_name_en: e.target.value})} onBlur={(e)=>translate(e.target.value, 'guardian_name_hi')} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 ml-1 flex items-center gap-1"><Languages size={12}/> अभिभावक का नाम (हिन्दी)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border-2 border-emerald-200/50 focus:border-emerald-500 outline-none" value={formData.guardian_name_hi} onChange={(e)=>setFormData({...formData, guardian_name_hi: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* C. Section: Contact & Physical Address */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1 text-rose-500">
                                            <Phone size={14}/>
                                            <label className="text-[10px] font-black uppercase tracking-widest">Mobile Number</label>
                                        </div>
                                        <input type="tel" required className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.mobile} onChange={(e)=>setFormData({...formData, mobile: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1 text-indigo-500">
                                            <Navigation size={14}/>
                                            <label className="text-[10px] font-black uppercase tracking-widest">Detailed Address (Optional)</label>
                                        </div>
                                        <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none" value={formData.full_address_en} onChange={(e)=>setFormData({...formData, full_address_en: e.target.value})} onBlur={(e)=>translate(e.target.value, 'full_address_hi')} />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-6">
                                    <button type="submit" className="w-full bg-slate-900 text-white p-6 rounded-[30px] font-black uppercase tracking-[0.3em] text-xs hover:bg-emerald-600 transition-all shadow-2xl flex items-center justify-center gap-3">
                                        <Save size={22}/> {editMode ? 'Confirm Database Sync' : 'Register Into Master Engine'}
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
