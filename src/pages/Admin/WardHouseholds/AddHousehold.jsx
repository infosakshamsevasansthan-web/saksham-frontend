import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Home, User, MapPin, Phone, Save, ArrowLeft, Info, Edit, Trash2, Upload, Languages, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HouseholdManager = () => {
    const navigate = useNavigate();
    const tenantId = "SAK-SIW-6925";
    const API_BASE = "https://saksham-backend-9719.onrender.com";

    const [households, setHouseholds] = useState([]);
    const [wards, setWards] = useState([]);
    const [roads, setRoads] = useState([]); // Modal ke liye roads
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        hhd_id: '', ward_id: '', road_id: '', muni_house_no: '', mobile: '',
        owner_name_en: '', owner_name_hi: '', 
        guardian_name_en: '', guardian_name_hi: '',
        full_address_en: '', full_address_hi: ''
    });

    useEffect(() => {
        fetchHouseholds();
        fetchWards();
    }, []);

    const fetchHouseholds = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/admin/households/${tenantId}`);
            // Note: Make sure your backend JOINs profiles table to get names in list
            if (res.data.success) setHouseholds(res.data.data);
        } catch (e) { console.error("Fetch Error"); }
    };

    const fetchWards = async () => {
        const res = await axios.get(`${API_BASE}/api/admin/wards/${tenantId}`);
        if (res.data.success) setWards(res.data.data);
    };

    const fetchRoadsForWard = async (wardId) => {
        if (!wardId) return;
        const res = await axios.get(`${API_BASE}/api/admin/roads-by-ward/${tenantId}/${wardId}`);
        if (res.data.success) setRoads(res.data.data);
    };

    const handleWardChange = (wardId) => {
        setFormData({...formData, ward_id: wardId, road_id: ''});
        fetchRoadsForWard(wardId);
    };

    const translateToHindi = async (text, fieldName) => {
        if (!text) return;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURI(text)}`);
            const data = await res.json();
            setFormData(prev => ({ ...prev, [fieldName]: data[0][0][0] }));
        } catch (e) { }
    };

    // 🟢 Edit Button Click
    const handleEdit = (item) => {
        console.log("Editing:", item);
        setEditMode(true);
        fetchRoadsForWard(item.ward_id); // Ward ki roads pehle mangwao
        
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

    // 🔴 Delete Button Click
    const handleDelete = async (id) => {
        if (window.confirm("Bhai, kya aap sach mein ise delete karna chahte hain? Sabhi records ud jayenge!")) {
            try {
                const res = await axios.delete(`${API_BASE}/api/admin/households/delete/${id}`);
                if(res.data.success) {
                    alert("Deleted!");
                    fetchHouseholds();
                }
            } catch (e) { alert("Delete failed"); }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`${API_BASE}/api/admin/households/update/${formData.hhd_id}`, formData);
            } else {
                await axios.post(`${API_BASE}/api/admin/households/add`, { ...formData, tenant_id: tenantId });
            }
            alert("Success!");
            setShowModal(false);
            fetchHouseholds();
        } catch (err) { alert("Error saving record"); }
    };

    return (
        <CityLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tighter">HOUSEHOLD REGISTRY</h1>
                    <button onClick={() => { setEditMode(false); setFormData({}); setShowModal(true); }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-emerald-600 transition-all flex items-center gap-2">
                        <Save size={16} /> Register New Household
                    </button>
                </div>

                <div className="bg-white rounded-[35px] border border-slate-100 overflow-hidden shadow-sm">
                    <div className="p-6 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="text" placeholder="Search residents..." className="w-full bg-white p-4 pl-12 rounded-2xl font-bold border-none outline-none ring-1 ring-slate-100" onChange={(e)=>setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <table className="w-full">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Resident Name</th>
                                <th>Location Details</th>
                                <th>Contact</th>
                                <th className="text-right p-6">Manage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
                            {households.filter(h => h.owner_name_en?.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                                <tr key={item.hhd_id} className="hover:bg-slate-50/30 transition-all">
                                    <td className="p-6">
                                        <div className="text-slate-900">{item.owner_name_en}</div>
                                        <div className="text-[10px] text-slate-400 font-hindi">{item.owner_name_hi}</div>
                                    </td>
                                    <td>
                                        <div className="text-xs">Ward {item.ward_no} - {item.road_name_en}</div>
                                        <div className="text-[10px] text-emerald-600">{item.hhd_id}</div>
                                    </td>
                                    <td className="text-xs">{item.mobile}</td>
                                    <td className="p-6 text-right">
                                        <button onClick={() => handleEdit(item)} className="p-3 bg-slate-100 text-slate-600 rounded-xl mr-2 hover:bg-slate-900 hover:text-white transition-all"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(item.hhd_id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-4xl rounded-[45px] shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-800 uppercase">{editMode ? 'Edit Profile' : 'New Registry'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 rounded-2xl"><X size={20}/></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ward</label>
                                        <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" value={formData.ward_id} onChange={(e) => handleWardChange(e.target.value)}>
                                            <option value="">Select Ward</option>
                                            {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Road / Street</label>
                                        <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" value={formData.road_id} onChange={(e) => setFormData({...formData, road_id: e.target.value})}>
                                            <option value="">Select Road</option>
                                            {roads.map(r => <option key={r.id} value={r.id}>{r.road_name_en}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">House No</label>
                                        <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ring-1 ring-slate-100" value={formData.muni_house_no} onChange={(e) => setFormData({...formData, muni_house_no: e.target.value})} />
                                    </div>
                                </div>

                                <div className="bg-emerald-50/50 p-8 rounded-[40px] space-y-6 border border-emerald-100/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Owner (English)</label>
                                                <input type="text" required className="w-full bg-white p-4 rounded-2xl font-bold border border-slate-100 outline-none" value={formData.owner_name_en} onChange={(e) => { setFormData({...formData, owner_name_en: e.target.value}); translateToHindi(e.target.value, 'owner_name_hi'); }} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 uppercase ml-2">Owner (Hindi)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border border-emerald-100 outline-none" value={formData.owner_name_hi} onChange={(e) => setFormData({...formData, owner_name_hi: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Guardian (English)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold border border-slate-100" value={formData.guardian_name_en} onChange={(e) => { setFormData({...formData, guardian_name_en: e.target.value}); translateToHindi(e.target.value, 'guardian_name_hi'); }} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 uppercase ml-2">Guardian (Hindi)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border border-emerald-100" value={formData.guardian_name_hi} onChange={(e) => setFormData({...formData, guardian_name_hi: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mobile</label>
                                            <input type="tel" className="w-full bg-white p-4 rounded-2xl font-bold border border-slate-100" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Address (English)</label>
                                            <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold border border-slate-100" value={formData.full_address_en} onChange={(e) => { setFormData({...formData, full_address_en: e.target.value}); translateToHindi(e.target.value, 'full_address_hi'); }} />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all flex justify-center items-center gap-3 shadow-2xl shadow-slate-200">
                                    <Save size={20}/> {editMode ? 'Update Database Record' : 'Save To Registry'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </CityLayout>
    );
};

export default HouseholdManager;
