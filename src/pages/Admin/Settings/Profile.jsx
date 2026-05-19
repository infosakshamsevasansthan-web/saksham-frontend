import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Save, Loader2, MapPin, User, Mail, Phone, 
    Camera, Building2, ShieldCheck, Fingerprint, RefreshCcw 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const t_id = localStorage.getItem("tenantId") || 'SAK-SIW-6925';

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/profile-details/${t_id}`);
      if (res.data.success) {
        setProfileData(res.data.data);
      }
    } catch (err) {
      toast.error("Cloud data sync failed!");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [t_id]);

  // Image Selection Logic
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('tenant_id', t_id);
    formData.append('full_name', profileData.full_name);
    formData.append('email', profileData.email);
    formData.append('mobile', profileData.mobile);
    formData.append('muni_address', profileData.muni_address);
    if(logoFile) formData.append('logo', logoFile);

    try {
      const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/update-profile', formData);
      if (res.data.success) {
        // 🔥 SABSE ZAROORI: LocalStorage update karo taaki Sidebar turant badal jaye
        localStorage.setItem('userName', profileData.full_name);
        if(res.data.logo_url) {
            localStorage.setItem('muniLogo', `https://saksham-backend-9719.onrender.com${res.data.logo_url}`);
        }
        
        toast.success("Identity & Branding Synced! ✅");
        // Chota sa delay taaki user success dekh sake phir reload
        setTimeout(() => window.location.reload(), 1000); 
      }
    } catch (err) {
      toast.error("Profile update failed!");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <CityLayout>
        <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
          <Loader2 className="animate-spin text-emerald-600" size={50} />
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em]">Authenticating Authority Data...</p>
        </div>
      </CityLayout>
    );
  }

  return (
    <CityLayout>
      <Toaster position="top-right" />
      <div className="p-6 max-w-7xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700 text-left font-sans">
        
        {/* --- 🟢 HEADER SECTION --- */}
        <header className="flex justify-between items-end border-b-2 border-slate-100 pb-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Authority Profile</h1>
            <p className="text-emerald-600 text-xs font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                <ShieldCheck size={14}/> Official Municipality Identity Management
            </p>
          </div>
          <div className="hidden md:block text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital ID</p>
             <p className="text-sm font-bold text-slate-800 font-mono">{t_id}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- 🟢 LEFT: LOGO & BRANDING HUD (4 Cols) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-100 relative overflow-hidden text-center group">
               <div className="absolute top-0 left-0 w-full h-32 bg-slate-900" />
               
               {/* Image Upload Area */}
               <div className="relative z-10">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="w-40 h-40 mx-auto bg-white rounded-[45px] border-[6px] border-slate-50 shadow-2xl flex items-center justify-center overflow-hidden cursor-pointer relative"
                  >
                     {logoPreview ? (
                        <img src={logoPreview} className="w-full h-full object-contain" alt="preview" />
                     ) : profileData.muni_logo_url ? (
                        <img src={`https://saksham-backend-9719.onrender.com${profileData.muni_logo_url}`} className="w-full h-full object-contain" alt="logo" />
                     ) : (
                        <Building2 size={50} className="text-slate-200" />
                     )}
                     
                     <div className="absolute inset-0 bg-emerald-600/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white">
                        <Camera size={32} />
                        <span className="text-[9px] font-black uppercase mt-2">Change Logo</span>
                     </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>

               <div className="mt-8">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-tight">
                    {profileData.muni_name || "MUNICIPALITY UNIT"}
                  </h2>
                  <div className="mt-4 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 py-2 rounded-2xl border border-emerald-100 mx-6">
                    <Fingerprint size={14}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Instance</span>
                  </div>
               </div>
            </div>

            {/* Quick Status Card */}
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                <RefreshCcw className="absolute -right-6 -bottom-6 text-white/5" size={150} />
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">System Access</h4>
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/10 pb-3">
                        <span className="text-xs font-bold text-white/50">Subscription</span>
                        <span className="text-xs font-black uppercase">Active Pro</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs font-bold text-white/50">Last Login</span>
                        <span className="text-xs font-black uppercase">Today</span>
                    </div>
                </div>
            </div>
          </div>

          {/* --- 🟢 RIGHT: EDITABLE FORM (8 Cols) --- */}
          <div className="lg:col-span-8 bg-white p-12 rounded-[60px] shadow-sm border border-slate-100 relative">
            <div className="absolute top-10 right-10 text-slate-100"><Save size={100}/></div>
            
            <form onSubmit={handleUpdate} className="relative z-10 space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                <ProInput label="Administrative Head Name" icon={User} value={profileData.full_name} onChange={(v)=>setProfileData({...profileData, full_name:v})} />
                <ProInput label="Contact Mobile" icon={Phone} value={profileData.mobile} onChange={(v)=>setProfileData({...profileData, mobile:v})} />
                <ProInput label="Authorized Email" icon={Mail} value={profileData.email} onChange={(v)=>setProfileData({...profileData, email:v})} />
                <ProInput label="Municipality Full Address" icon={MapPin} value={profileData.muni_address} onChange={(v)=>setProfileData({...profileData, muni_address:v})} full />
              </div>

              <div className="pt-6">
                <button 
                    type="submit" disabled={loading}
                    className="w-full bg-slate-900 hover:bg-emerald-600 text-white p-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20}/>}
                    Commit & Synchronize Changes
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </CityLayout>
  );
};

// --- ✨ High-End Input Component ---
const ProInput = ({ label, icon: Icon, value, onChange, full }) => (
  <div className={full ? "md:col-span-2 space-y-3" : "space-y-3"}>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 flex items-center gap-2">
        <Icon size={12} className="text-emerald-500" /> {label}
    </label>
    <div className="relative group">
        <input 
            required
            className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[2rem] outline-none font-bold text-slate-800 text-base focus:border-emerald-500/30 focus:bg-white focus:shadow-inner transition-all" 
            value={value || ''} 
            onChange={(e)=>onChange(e.target.value)} 
        />
    </div>
  </div>
);

export default Profile;
