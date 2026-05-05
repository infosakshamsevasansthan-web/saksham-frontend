import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Home, Search, Save, Edit3, Trash2, X, Plus, Languages, MapPin, Phone, Upload, Download, FileText } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const HouseholdRegistry = () => {
    // 🔐 1. Dynamic Tenant ID (Login user ke hisaab se)
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
        const res = await axios.get(`${API_BASE}/api/admin/households/${tenantId}`);
        if (res.data.success) setHouseholds(res.data.data);
    };

    const fetchWards = async () => {
        const res = await axios.get(`${API_BASE}/api/admin/wards/${tenantId}`);
        if (res.data.success) setWards(res.data.data);
    };

    const fetchRoads = async (wId) => {
        const res = await axios.get(`${API_BASE}/api/admin/roads-by-ward/${tenantId}/${wId}`);
        if (res.data.success) setRoads(res.data.data);
    };

    // 🌐 Auto Translate logic
    const translate = async (text, field) => {
        if(!text) return;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURI(text)}`);
            const json = await res.json();
            setFormData(prev => ({ ...prev, [field]: json[0][0][0] }));
        } catch (e) { console.error("Translate error"); }
    };

    // 🟢 Action Handlers
    const handleEdit = (item) => {
        setEditMode(true);
        setFormData({ ...item });
        fetchRoads(item.ward_id);
        setShowModal(true);
    };

    const handleDelete = async (hhdId) => {
        if(window.confirm("Bhai, delete kar dein?")) {
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
        } catch (e) { alert("Save Error"); }
    };

    return (
        <CityLayout>
            <div className="p-4 space-y-6">
                <header className="flex justify-between items-center bg-white p-6 rounded-[30px] shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">HOUSEHOLD REGISTRY</h1>
                        <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">Active Tenant: {tenantId}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setEditMode(false); setFormData({}); setShowModal(true); }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all">
                            <Plus size={16}/> Add Manual
                        </button>
                    </div>
                </header>

                {/* Table List */}
                <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-50">
                        <input type="text" placeholder="Search by name or ID..." className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none" onChange={(e)=>setSearchTerm(e.target.value)} />
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">HHD ID</th>
                                <th>Owner Name</th>
                                <th>Location</th>
                                <th className="text-right p-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-bold text-slate-600">
                            {households.filter(h => h.owner_name_en?.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                                <tr key={item.hhd_id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="p-6 text-slate-900 font-black">{item.hhd_id}</td>
                                    <td>
                                        <p>{item.owner_name_en}</p>
                                        <p className="text-[10px] text-slate-400 font-hindi">{item.owner_name_hi}</p>
                                    </td>
                                    <td className="text-xs">Ward {item.ward_no} • {item.road_name_en}</td>
                                    <td className="p-6 text-right flex justify-end gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={16}/></button>
                                        <button onClick={() => handleDelete(item.hhd_id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MODAL FORM */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50">
                                <h2 className="text-2xl font-black text-slate-800 uppercase">{editMode ? 'Update Record' : 'Add New Record'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-white rounded-2xl shadow-sm"><X size={20}/></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ward</label>
                                        <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-none outline-none ring-1 ring-slate-100" value={formData.ward_id} onChange={(e) => { setFormData({...formData, ward_id: e.target.value}); fetchRoads(e.target.value); }}>
                                            <option value="">Select Ward</option>
                                            {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Road</label>
                                        <select required className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-none outline-none ring-1 ring-slate-100" value={formData.road_id} onChange={(e) => setFormData({...formData, road_id: e.target.value})}>
                                            <option value="">Select Road</option>
                                            {roads.map(r => <option key={r.id} value={r.id}>{r.road_name_en}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Muni House No</label>
                                        <input type="text" required className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-none outline-none ring-1 ring-slate-100" value={formData.muni_house_no} onChange={(e)=>setFormData({...formData, muni_house_no: e.target.value})} />
                                    </div>
                                </div>

                                <div className="bg-emerald-50/50 p-8 rounded-[40px] space-y-6 border border-emerald-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Owner (English)</label>
                                                <input type="text" required className="w-full bg-white p-4 rounded-2xl font-bold border-none outline-none" value={formData.owner_name_en} onChange={(e)=>setFormData({...formData, owner_name_en: e.target.value})} onBlur={(e)=>translate(e.target.value, 'owner_name_hi')} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 uppercase ml-2">Owner (Hindi)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border-none outline-none" value={formData.owner_name_hi} onChange={(e)=>setFormData({...formData, owner_name_hi: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Guardian (English)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold border-none outline-none" value={formData.guardian_name_en} onChange={(e)=>setFormData({...formData, guardian_name_en: e.target.value})} onBlur={(e)=>translate(e.target.value, 'guardian_name_hi')} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-emerald-600 uppercase ml-2">Guardian (Hindi)</label>
                                                <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold font-hindi border-none outline-none" value={formData.guardian_name_hi} onChange={(e)=>setFormData({...formData, guardian_name_hi: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mobile</label>
                                            <input type="tel" required className="w-full bg-white p-4 rounded-2xl font-bold border-none outline-none" value={formData.mobile} onChange={(e)=>setFormData({...formData, mobile: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Full Address (English)</label>
                                            <input type="text" className="w-full bg-white p-4 rounded-2xl font-bold border-none outline-none" value={formData.full_address_en} onChange={(e)=>setFormData({...formData, full_address_en: e.target.value})} onBlur={(e)=>translate(e.target.value, 'full_address_hi')} />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all flex justify-center items-center gap-3">
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

export default HouseholdRegistry;
