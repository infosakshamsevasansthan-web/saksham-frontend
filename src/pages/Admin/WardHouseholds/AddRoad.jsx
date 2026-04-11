import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { ArrowLeft, Save, MapPin, Navigation, Info, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const AddRoad = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState([]);
  const tenantId = "SAK-SIW-6925"; 

  const [formData, setFormData] = useState({
    ward_id: '',
    road_name_en: '',
    road_name_hi: '',
    road_type: 'Street Road',
    road_length_km: '',
    road_end_point: ''
  });

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`);
    setWards(res.data.data);
  };

  // English to Hindi Auto-Translation Logic
  const handleEnglishNameChange = async (val) => {
    setFormData({ ...formData, road_name_en: val });
    if (val.length > 2) {
      try {
        // Simple Public Translation API (Free)
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${val}&langpair=en|hi`);
        const data = await res.json();
        if (data.responseData.translatedText) {
          setFormData(prev => ({ ...prev, road_name_hi: data.responseData.translatedText, road_name_en: val }));
        }
      } catch (err) { console.log("Translation error"); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/roads/add', {
        ...formData,
        tenant_id: tenantId
      });
      if (res.data.success) {
        toast.success("Nayi Sadak successfully add ho gayi!");
        setTimeout(() => navigate('/admin/roads'), 1500);
      }
    } catch (err) {
      toast.error("Road add karne me error aayi");
    } finally { setLoading(false); }
  };

  return (
    <CityLayout>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-800 transition-all">
            <div className="bg-white p-2 rounded-xl shadow-sm"><ArrowLeft size={16}/></div> Back to Hierarchy
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">ADD NEW ROAD</h1>
            <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest mt-1">Classification & Street Details</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-[45px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
             <div>
                <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-1">Road Registration</p>
                <h2 className="text-xl font-bold italic opacity-90">Enter Road Metrics</h2>
             </div>
             <Navigation className="text-emerald-400" size={32}/>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Ward Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Ward</label>
                <select 
                  required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-slate-700"
                  value={formData.ward_id}
                  onChange={(e) => setFormData({...formData, ward_id: e.target.value})}
                >
                  <option value="">Select Ward Number...</option>
                  {wards.map(w => <option key={w.id} value={w.id}>Ward No. {w.ward_no} - {w.ward_name}</option>)}
                </select>
              </div>

              {/* Road Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Road Classification</label>
                <select 
                  required className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-slate-700"
                  value={formData.road_type}
                  onChange={(e) => setFormData({...formData, road_type: e.target.value})}
                >
                  <option value="Principal Main Road">Principal Main Road</option>
                  <option value="Main Road">Main Road</option>
                  <option value="Street Road">Street Road</option>
                  <option value="Other Road">Other Road</option>
                </select>
              </div>

              {/* English Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Road Name (English)</label>
                <input 
                  type="text" required placeholder="e.g. Gandhi Path"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-slate-700"
                  value={formData.road_name_en}
                  onChange={(e) => handleEnglishNameChange(e.target.value)}
                />
              </div>

              {/* Hindi Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Road Name (Hindi - Auto Fill)</label>
                <input 
                  type="text" required placeholder="उदा. गांधी पथ"
                  className="w-full p-4 bg-emerald-50/30 border-2 border-emerald-100/50 focus:border-emerald-500 rounded-2xl outline-none font-bold text-slate-700"
                  value={formData.road_name_hi}
                  onChange={(e) => setFormData({...formData, road_name_hi: e.target.value})}
                />
              </div>

              {/* Length */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Length (in KM)</label>
                <input 
                  type="number" step="0.01" required placeholder="0.00"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-slate-700"
                  value={formData.road_length_km}
                  onChange={(e) => setFormData({...formData, road_length_km: e.target.value})}
                />
              </div>

              {/* End Point */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">End Point (landmark/shop)</label>
                <input 
                  type="text" placeholder="e.g. Near Sharma Sweets"
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-slate-700"
                  value={formData.road_end_point}
                  onChange={(e) => setFormData({...formData, road_end_point: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" disabled={loading}
                className="bg-slate-900 text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                {loading ? 'Processing...' : 'Register Road Details'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </CityLayout>
  );
};

export default AddRoad;