import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Home, User, MapPin, Phone, Save, ArrowLeft, Info, Edit, Trash2, Languages, Search, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HouseholdManager = () => {
    const navigate = useNavigate();
    
    // 🔐 Get Logged-in User Details (Multi-tenant support)
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

    const initialFormState = {
        hhd_id: '', ward_id: '', road_id: '', muni_house_no: '', mobile: '',
        owner_name_en: '', owner_name_hi: '', 
        guardian_name_en: '', guardian_name_hi: '',
        full_address_en: '', full_address_hi: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    // 1. Fetch Data
    useEffect(() => {
        fetchHouseholds();
        fetchWards();
    }, [tenantId]);

    const fetchHouseholds = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/admin/households/${tenantId}`);
            if (res.data.success) setHouseholds(res.data.data);
        } catch (e) { console.error("Error fetching households"); }
    };

    const fetchWards = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/admin/wards/${tenantId}`);
            if (res.data.success) setWards(res.data.data);
        } catch (e) { console.error("Error fetching wards"); }
    };

    const fetchRoadsForWard = async (wardId) => {
        if (!wardId) return;
        try {
            const res = await axios.get(`${API_BASE}/api/admin/roads-by-ward/${tenantId}/${wardId}`);
            if (res.data.success) setRoads(res.data.data);
        } catch (e) { console.error("Error fetching roads"); }
    };

    // 🌐 Auto Translation Logic
    const handleTranslate = async (text, fieldName) => {
        if (!text || formData[fieldName]) return; // Don't overwrite if user already typed in Hindi
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURI(text)}`);
            const data = await res.json();
            setFormData(prev => ({ ...prev, [fieldName]: data[0][0][0] }));
        } catch (e) { console.log("Translation failed"); }
    };

    // 🟢 handle Actions
    const handleAddNew = () => {
        setEditMode(false);
        setFormData(initialFormState);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        console.log("Editing Item:", item);
        setEditMode(true);
        fetchRoadsForWard(item.ward_id); // Load roads for this specific ward
        setFormData({
            ...item,
            owner_name_en: item.owner_name_en || '',
            owner_name_hi: item.owner_name_hi || '',
            guardian_name_en: item.guardian_name_en || '',
            guardian_name_hi: item.guardian_name_hi || '',
            full_address_en: item.full_address_en || '',
            full_address_hi: item.full_address_hi || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Danger: Kya aap sach mein is record ko delete karna chahte hain?")) {
            try {
                const res = await axios.delete(`${API_BASE}/api/admin/households/delete/${id}`);
                if (res.data.success) {
                    alert("Deleted Successfully");
                    fetchHouseholds();
                }
            } catch (e) { alert("Delete fail ho gaya"); }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editMode) {
                await axios.put(`${API_BASE}/api/admin/households/update/${formData.hhd_id}`, formData);
            } else {
                // For New Entry, you'll need to generate HHD ID or handle it in backend
                await axios.post(`${API_BASE}/api/admin/households/add`, { ...formData, tenant_id: tenantId });
            }
            alert("Success! Database Updated.");
            setShowModal(false);
            fetchHouseholds();
        } catch (err) { 
            alert("Error: " + (err.response?.data?.message || "Internal Error")); 
        } finally { setLoading(false); }
    };

    return (
        <CityLayout>
            <div className="p-6 space-y-6">
                {/* Custom Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">HOUSEHOLD REGISTRY</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-black uppercase">{tenantId}</span>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Active Database</p>
                        </div>
                    </div>
                    <button onClick={handleAddNew} className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase hover:bg-emerald-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-200">
                        <Plus size={18} /> Register New Household
                    </button>
                </div>

                {/* Search & List */}
                <div className="bg-white rounded-[45px] border border-slate-50 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input 
                                type="text" placeholder="Search by name, house no, or HHD ID..." 
                                className="w-full bg-slate-50/50 p-5 pl-14 rounded-3xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="p-8">Resident / HHD ID</th>
                                    <th>Property Location</th>
                                    <th>Contact</th>
                                    <th className="text-right p-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {households.filter(h => h.owner_name_en?.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                                    <tr key={item.hhd_id} className="hover:bg-slate-50/30 transition-all group">
                                        <td className="p-8">
                                            <div className="font-black text-slate-800">{item.owner_name_en}</div>
                                            <div className="text-[11px] text-slate-400 font-hindi mt-0.5">{item.owner_name_hi}</div>
                                            <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500">{item.hhd_id}</div>
                                        </td>
                                        <td>
                                            <div className="text-xs font-bold text-slate-600">Ward {item.ward_no} • {item.road_name_en}</div>
                                            <div className="text-[10px] text-slate-400 mt-1 uppercase">House No: {item.muni_house_no}</div>
                                        </td>
                                        <td className="text-xs font-black text-slate-500">{item.mobile}</td>
                                        <td className="p-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(item)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Edit size={18}/></button>
                                                <button onClick={() => handleDelete(item.hhd_id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL FORM */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-5xl rounded-[50px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{editMode ? 'Update Resident Profile' : 'New Household Entry'}</h2>
                                    <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">Database Management System</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="bg-white p-4 rounded-3xl shadow-sm hover:text-red-500 transition-all"><X size={24}/></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                                {/* SECTION 1: LOCATION */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ward Number</label>
                                        <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none border-none ring-1 ring-slate-100 focus:ring-emerald-500" 
                                            value={formData.ward_id} 
                                            onChange={(e) => { 
                                                const val = e.target.value;
                                                setFormData({...formData, ward_id: val, road_id: ''}); 
                                                fetchRoadsForWard(val);
                                            }}>
                                            <option value="">Select Ward</option>
                                            {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no} - {w.ward_name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Road / Street</label>
                                        <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none border-none ring-1 ring-slate-100 focus:ring-emerald-500 disabled:opacity-50" 
                                            value={formData.road_id} 
                                            disabled={!formData.ward_id}
                                            onChange={(e) => setFormData({...formData, road_id: e.target.value})}>
                                            <option value="">Select Road</option>
                                            {roads.map(r => <option key={r.id} value={r.id}>{r.road_name_en}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Muni House No.</label>
                                        <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" placeholder="Ex: 12/A" value={formData.muni_house_no} onChange={(e)=>setFormData({...formData, muni_house_no: e.target.value})} />
                                    </div>
                                </div>

                                {/* SECTION 2: DUAL LANGUAGE FIELDS */}
                                <div className="bg-emerald-50/40 p-10 rounded-[45px] space-y-10 border border-emerald-100/50 relative">
                                    <div className="absolute -top-4 left-10 bg-emerald-500 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Resident Details</div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* Name Row */}
                                        <div className="space-y-4">
                                            <div className="group">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Owner Name (English)</label>
                                                <input type="text" required className="w-full bg-white p-4 rounded-2xl font-bold border-none ring-1 ring-slate-100 focus:ring-emerald-500" 
                                                    value={formData.owner_name_en} 
                                                    onBlur={(e) => handleTranslate(e.target.value, 'owner_name_hi')}
                                                    onChange={(e)=>setFormData({...formData, owner_name_en: e.target.value})} 
                                                />
                                            </div>
                                            <div className="group">
                                                <label className="text-[10px] font-black text-emerald-600 uppercase ml-2 flex gap-2 items-center"><Languages size={12}/> Owner Name (Hindi)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border-none ring-1 ring-emerald-100 focus:ring-emerald-500" 
                                                    value={formData.owner_name_hi} 
                                                    onChange={(e)=>setFormData({...formData, owner_name_hi: e.target.value})} 
                                                />
                                            </div>
                                        </div>

                                        {/* Guardian Row */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Guardian (English)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold border-none ring-1 ring-slate-100" 
                                                    value={formData.guardian_name_en} 
                                                    onBlur={(e) => handleTranslate(e.target.value, 'guardian_name_hi')}
                                                    onChange={(e)=>setFormData({...formData, guardian_name_en: e.target.value})} 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 uppercase ml-2 flex gap-2 items-center"><Languages size={12}/> Guardian (Hindi)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border-none ring-1 ring-emerald-100" 
                                                    value={formData.guardian_name_hi} 
                                                    onChange={(e)=>setFormData({...formData, guardian_name_hi: e.target.value})} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mobile Number</label>
                                            <input type="tel" className="w-full bg-white p-4 rounded-2xl font-bold border-none ring-1 ring-slate-100" value={formData.mobile} onChange={(e)=>setFormData({...formData, mobile: e.target.value})} />
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Full Address (English)</label>
                                                <textarea className="w-full bg-white p-4 rounded-2xl font-bold border-none ring-1 ring-slate-100" rows="2" 
                                                    value={formData.full_address_en} 
                                                    onBlur={(e) => handleTranslate(e.target.value, 'full_address_hi')}
                                                    onChange={(e)=>setFormData({...formData, full_address_en: e.target.value})}></textarea>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 uppercase ml-2 flex gap-2 items-center"><Languages size={12}/> Full Address (Hindi)</label>
                                                <textarea className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border-none ring-1 ring-emerald-100" rows="2" 
                                                    value={formData.full_address_hi} 
                                                    onChange={(e)=>setFormData({...formData, full_address_hi: e.target.value})}></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white p-6 rounded-[30px] font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-300 disabled:opacity-50">
                                        {loading ? 'Processing...' : editMode ? 'Update Database Record' : 'Commit New Entry'}
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="px-12 bg-slate-100 rounded-[30px] font-black text-slate-400 uppercase text-[10px]">Close</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </CityLayout>
    );
};

export default HouseholdManager;
