import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Save, Loader2, MapPin, User, Mail, Phone } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const t_id = localStorage.getItem("tenantId");

  const fetchProfile = async () => {
    if (!t_id) {
      setFetching(false);
      return toast.error("Tenant ID Missing!");
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/profile-details/${t_id}`);
      if (res.data.success) {
        setProfileData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch profile data!");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [t_id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/update-profile', {
        tenant_id: t_id,
        full_name: profileData.full_name,
        email: profileData.email,
        mobile: profileData.mobile,
        muni_address: profileData.muni_address
      });
      toast.success("Profile Updated ✅");
    } catch (err) {
      toast.error("Update failed ❌");
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <CityLayout>
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Syncing Profile Data...</p>
        </div>
      </CityLayout>
    );
  }

  if (!profileData) {
    return (
      <CityLayout>
         <div className="flex flex-col justify-center items-center h-[60vh] text-center">
            <p className="text-rose-500 font-black uppercase text-xs mb-2">No Profile Found</p>
            <button onClick={fetchProfile} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase">Retry Fetch</button>
         </div>
      </CityLayout>
    )
  }

  return (
    <CityLayout>
      <Toaster position="top-right" />
      <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        <header>
          <h1 className="text-4xl font-black text-slate-800 uppercase italic leading-none tracking-tighter">Account Settings</h1>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Municipality Control Center</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald-600 to-emerald-400 opacity-20" />
            <div className="relative z-10 w-28 h-28 mx-auto bg-white rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-emerald-600 text-4xl font-black uppercase">
              {profileData.full_name?.charAt(0) || 'A'}
            </div>
            <h2 className="mt-6 font-black text-slate-800 uppercase text-lg leading-tight text-center">{profileData.municipality_name || "Admin Unit"}</h2>
            <div className="mt-6 space-y-4">
               <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <MapPin size={18} className="text-emerald-500 shrink-0" />
                  <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed">{profileData.muni_address || "Address Not Set"}</p>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-10 rounded-[45px] shadow-sm border border-slate-100">
            <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-8">
              <InputBox label="Admin Full Name" icon={User} value={profileData.full_name} onChange={(v)=>setProfileData({...profileData, full_name:v})} />
              <InputBox label="Official Email" icon={Mail} value={profileData.email} onChange={(v)=>setProfileData({...profileData, email:v})} />
              <InputBox label="Contact Number" icon={Phone} value={profileData.mobile} onChange={(v)=>setProfileData({...profileData, mobile:v})} />
              <InputBox label="Municipality Office Address" icon={MapPin} value={profileData.muni_address} onChange={(v)=>setProfileData({...profileData, muni_address:v})} full />
              <button type="submit" disabled={loading} className="md:col-span-2 bg-slate-900 hover:bg-emerald-600 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                Apply Profile Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </CityLayout>
  );
};

const InputBox = ({ label, icon: Icon, value, onChange, full }) => (
  <div className={full ? "md:col-span-2 space-y-2" : "space-y-2"}>
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white transition-all">
      <Icon size={18} className="text-slate-300" />
      <input className="bg-transparent w-full outline-none font-bold text-slate-700 text-sm" value={value || ''} onChange={(e)=>onChange(e.target.value)} />
    </div>
  </div>
);

export default Profile;