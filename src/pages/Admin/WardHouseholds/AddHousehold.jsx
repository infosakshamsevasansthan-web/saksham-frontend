import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Home, User, MapPin, Phone, Save, ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddHousehold = () => {
  const navigate = useNavigate();
  const [wards, setWards] = useState([]); // Database se wards yahan aayenge
  const [roads, setRoads] = useState([]); // Selected ward ki roads yahan aayenge
  const [formData, setFormData] = useState({
    ward_id: '', road_id: '', muni_house_no: '', mobile: '',
    owner_name: '', guardian_name: '', address: '', hhd_id: 'AUTO-GENERATING...'
  });

  const tenantId = "SAK-SIW-6925";
  const API_BASE = "https://saksham-backend-9719.onrender.com";

  // 1. Load All Wards on Mount
  useEffect(() => {
    axios.get(`${API_BASE}/api/admin/wards/${tenantId}`)
      .then(res => {
        if(res.data.success) setWards(res.data.data);
      })
      .catch(err => console.error("Error fetching wards"));
  }, []);

  // 2. Fetch Roads & HHD_ID when Ward Changes (Dependent Logic)
  const handleWardChange = async (wardId) => {
    setFormData(prev => ({ ...prev, ward_id: wardId, road_id: '', hhd_id: 'GENERATING...' }));
    setRoads([]); // Purani roads clear karein

    if (!wardId) return;

    try {
      // Get Dependent Roads
      const roadRes = await axios.get(`${API_BASE}/api/admin/roads-by-ward/${tenantId}/${wardId}`);
      if(roadRes.data.success) setRoads(roadRes.data.data);

      // Get Generated HHD ID
      const hhdRes = await axios.get(`${API_BASE}/api/admin/generate-hhd-id/${tenantId}/${wardId}`);
      setFormData(prev => ({ ...prev, hhd_id: hhdRes.data.hhd_id }));
    } catch (err) {
      console.error("Error updating ward dependent data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/admin/households/add`, { ...formData, tenant_id: tenantId });
      alert("Household Registered Successfully!");
      navigate('/admin/households');
    } catch (err) { alert("Error adding household"); }
  };

  return (
    <CityLayout>
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase hover:text-slate-800 transition-all">
          <ArrowLeft size={16}/> Back to Registry
        </button>

        <header className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex justify-between items-center">
           <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">NEW REGISTRATION</h1>
              <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mt-1">Manual Household Entry Form</p>
           </div>
           <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase">System HHD ID</p>
              <p className="text-lg font-black text-slate-800 tracking-tighter">{formData.hhd_id}</p>
           </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-8">
                <div className="bg-slate-900 p-2 rounded-xl text-white"><MapPin size={20}/></div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Property Location</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* WARD DROPDOWN (Now Dynamic) */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ward Number</label>
                   <select 
                    required
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={formData.ward_id}
                    onChange={(e) => handleWardChange(e.target.value)}
                   >
                      <option value="">Select Ward</option>
                      {wards.map(w => (
                        <option key={w.id} value={w.id}>Ward {w.ward_no} - {w.ward_name}</option>
                      ))}
                   </select>
                </div>

                {/* ROAD DROPDOWN (Now Dependent) */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Road / Street</label>
                   <select 
                    required
                    disabled={!formData.ward_id}
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:opacity-50"
                    value={formData.road_id}
                    onChange={(e) => setFormData({...formData, road_id: e.target.value})}
                   >
                      <option value="">{formData.ward_id ? "Select Road" : "Select Ward First"}</option>
                      {roads.map(r => (
                        <option key={r.id} value={r.id}>{r.road_name_en}</option>
                      ))}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Muni House No.</label>
                   <input 
                    type="text" required placeholder="Ex: 124/B"
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    onChange={(e) => setFormData({...formData, muni_house_no: e.target.value})}
                   />
                </div>
             </div>
          </div>

          {/* Owner details section wahi rahega jo aapne diya tha... */}
          {/* ... (Baaki Form Same hai) ... */}
          <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-8">
                <div className="bg-emerald-500 p-2 rounded-xl text-white"><User size={20}/></div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Owner Details</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Owner Full Name (English)</label>
                   <input 
                    type="text" required placeholder="Enter Name"
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Father / Husband Name</label>
                   <input 
                    type="text" required placeholder="Guardian Name"
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mobile Number</label>
                   <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                      <input 
                        type="tel" required placeholder="10 Digit Mobile"
                        className="w-full bg-slate-50 border-none p-4 pl-12 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Full Address</label>
                   <textarea 
                    rows="1" placeholder="Address Details"
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                   ></textarea>
                </div>
             </div>

             <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
                   <Info size={16}/>
                   <span className="text-[10px] font-black uppercase">Other details will be updated via Nagrik App</span>
                </div>
                <button type="submit" className="bg-slate-900 text-white px-12 py-4 rounded-[25px] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
                   <Save size={18}/> Save Household
                </button>
             </div>
          </div>
        </form>
      </div>
    </CityLayout>
  );
};

export default AddHousehold;
