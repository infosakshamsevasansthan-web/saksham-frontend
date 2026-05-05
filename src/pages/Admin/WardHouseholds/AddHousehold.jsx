import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Home, User, MapPin, Phone, Save, ArrowLeft, Info, Edit, Trash2, Upload, Languages, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HouseholdManager = () => {
    const navigate = useNavigate();
    const tenantId = "SAK-SIW-6925";
    const API_BASE = "https://saksham-backend-9719.onrender.com";

    // States
    const [households, setHouseholds] = useState([]);
    const [wards, setWards] = useState([]);
    const [roads, setRoads] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        hhd_id: '', ward_id: '', road_id: '', muni_house_no: '', mobile: '',
        owner_name_en: '', owner_name_hi: '', 
        guardian_name_en: '', guardian_name_hi: '',
        full_address_en: '', full_address_hi: ''
    });

    // 1. Initial Load
    useEffect(() => {
        fetchHouseholds();
        fetchWards();
    }, []);

    const fetchHouseholds = async () => {
        const res = await axios.get(`${API_BASE}/api/admin/households/${tenantId}`);
        if (res.data.success) setHouseholds(res.data.data);
    };

    const fetchWards = async () => {
        const res = await axios.get(`${API_BASE}/api/admin/wards/${tenantId}`);
        if (res.data.success) setWards(res.data.data);
    };

    // 🌐 Auto Translation Logic (Simple version using Google Translate Link or similar API)
    const translateToHindi = async (text, fieldName) => {
        if (!text) return;
        try {
            // Note: In production, use a proper API key. This is a public free-to-use demo endpoint.
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURI(text)}`);
            const data = await res.json();
            const translatedText = data[0][0][0];
            setFormData(prev => ({ ...prev, [fieldName]: translatedText }));
        } catch (e) { console.log("Translation error"); }
    };

    const handleEdit = (item) => {
        setEditMode(true);
        setFormData({
            hhd_id: item.hhd_id,
            ward_id: item.ward_id,
            road_id: item.road_id,
            muni_house_no: item.muni_house_no,
            mobile: item.mobile,
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
        if (window.confirm("Are you sure? This will delete all profile data too!")) {
            await axios.delete(`${API_BASE}/api/admin/households/delete/${id}`);
            fetchHouseholds();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editMode ? `${API_BASE}/api/admin/households/update/${formData.hhd_id}` : `${API_BASE}/api/admin/households/add`;
        const method = editMode ? 'put' : 'post';

        try {
            await axios[method](url, { ...formData, tenant_id: tenantId });
            alert("Data Saved Successfully!");
            setShowModal(false);
            fetchHouseholds();
        } catch (err) { alert("Error saving data"); }
    };

    return (
        <CityLayout>
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">HOUSEHOLD REGISTRY</h1>
                        <p className="text-emerald-600 font-bold text-xs uppercase">Manage city properties and residents</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setEditMode(false); setShowModal(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all">
                            <Save size={16} /> Add New Household
                        </button>
                        <button className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 border border-emerald-100">
                            <Upload size={16} /> Bulk Import
                        </button>
                    </div>
                </div>

                {/* List & Search */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" placeholder="Search by Owner Name, Mobile or HHD ID..." 
                                className="w-full bg-slate-50 p-4 pl-12 rounded-2xl font-bold text-slate-600 outline-none"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="p-6">HHD ID</th>
                                    <th>Owner Details</th>
                                    <th>Location</th>
                                    <th>Contact</th>
                                    <th className="text-right p-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
                                {households.filter(h => h.owner_name_en?.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                                    <tr key={item.hhd_id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="p-6 text-slate-900 font-black">{item.hhd_id}</td>
                                        <td>
                                            <div className="text-sm">{item.owner_name_en}</div>
                                            <div className="text-[10px] text-slate-400 font-hindi">{item.owner_name_hi}</div>
                                        </td>
                                        <td>
                                            <div className="text-xs">Ward {item.ward_no} - {item.road_name_en}</div>
                                            <div className="text-[10px] text-slate-400">House: {item.muni_house_no}</div>
                                        </td>
                                        <td className="text-xs">{item.mobile}</td>
                                        <td className="p-6 text-right space-x-2">
                                            <button onClick={() => handleEdit(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={16}/></button>
                                            <button onClick={() => handleDelete(item.hhd_id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ADD/EDIT MODAL (DESIGNED FORM) */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{editMode ? 'Update Record' : 'Register New Household'}</h2>
                                    <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">{editMode ? 'Modifying existing entry' : 'Creating new system record'}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="bg-white p-3 rounded-2xl shadow-sm hover:text-red-500 transition-all"><X size={20}/></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                {/* SECTION: LOCATION */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Ward Selection</label>
                                        <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" onChange={(e) => setFormData({...formData, ward_id: e.target.value})} value={formData.ward_id}>
                                            <option value="">Select Ward</option>
                                            {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Muni House No</label>
                                        <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" placeholder="124/B" value={formData.muni_house_no} onChange={(e) => setFormData({...formData, muni_house_no: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Mobile No</label>
                                        <input type="tel" className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" placeholder="10 Digit Number" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
                                    </div>
                                </div>

                                {/* SECTION: NAMES (ENGLISH & HINDI AUTO) */}
                                <div className="space-y-6 bg-emerald-50/50 p-8 rounded-[35px] border border-emerald-100/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Languages size={18} className="text-emerald-600" />
                                        <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">Resident Information (Dual Language)</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Owner Name */}
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Owner Name (English)</label>
                                                <input 
                                                    type="text" required className="w-full bg-white p-4 rounded-2xl font-bold outline-none border border-slate-200 focus:ring-2 focus:ring-emerald-500" 
                                                    placeholder="Type in English..."
                                                    value={formData.owner_name_en}
                                                    onChange={(e) => { 
                                                        setFormData({...formData, owner_name_en: e.target.value});
                                                        translateToHindi(e.target.value, 'owner_name_hi');
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-emerald-600 uppercase">Owner Name (Hindi - Editable)</label>
                                                <input 
                                                    type="text" className="w-full bg-white/70 p-4 rounded-2xl font-bold font-hindi outline-none border border-emerald-100" 
                                                    value={formData.owner_name_hi} 
                                                    onChange={(e) => setFormData({...formData, owner_name_hi: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        {/* Guardian Name */}
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Father/Husband (English)</label>
                                                <input 
                                                    type="text" className="w-full bg-white p-4 rounded-2xl font-bold outline-none border border-slate-200" 
                                                    value={formData.guardian_name_en}
                                                    onChange={(e) => { 
                                                        setFormData({...formData, guardian_name_en: e.target.value});
                                                        translateToHindi(e.target.value, 'guardian_name_hi');
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-emerald-600 uppercase">Father/Husband (Hindi)</label>
                                                <input type="text" className="w-full bg-white/70 p-4 rounded-2xl font-bold font-hindi outline-none border border-emerald-100" value={formData.guardian_name_hi} onChange={(e) => setFormData({...formData, guardian_name_hi: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Address */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase">Full Address (English)</label>
                                            <textarea className="w-full bg-white p-4 rounded-2xl font-bold outline-none border border-slate-200" rows="2" value={formData.full_address_en} onChange={(e) => { setFormData({...formData, full_address_en: e.target.value}); translateToHindi(e.target.value, 'full_address_hi'); }}></textarea>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase">Full Address (Hindi)</label>
                                            <textarea className="w-full bg-white/70 p-4 rounded-2xl font-bold font-hindi outline-none border border-emerald-100" rows="2" value={formData.full_address_hi} onChange={(e) => setFormData({...formData, full_address_hi: e.target.value})}></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="flex-1 bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all flex justify-center items-center gap-3">
                                        <Save size={18}/> {editMode ? 'Update Household Record' : 'Save New Household'}
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-slate-100 rounded-3xl font-black text-slate-400 uppercase text-[10px]">Cancel</button>
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
