import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, LogOut, Bell, MoreVertical, Shield, X, Save, MapPin, Mail, Phone, Loader2, Camera, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const CityTopbar = ({ toggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModal, setShowModal] = useState(null); 
  // 🟢 Fixed: Initialize with empty strings instead of null to prevent disappear on refresh
  const [profileData, setProfileData] = useState({
    full_name: '', email: '', mobile: '', muni_address: '', municipality_name: ''
  });
  const [loading, setLoading] = useState(false);
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const API_BASE = "https://saksham-backend-9719.onrender.com";
  const tenantId = localStorage.getItem('tenantId');

  const fetchProfile = async () => {
    if (!tenantId) return;
    try {
      const res = await axios.get(`${API_BASE}/api/admin/profile-details/${tenantId}`);
      if (res.data.success) {
        const d = res.data.data;
        // 🟢 Fixed: Mapping DB fields to State
        setProfileData({
          full_name: d.admin_name || d.full_name || '',
          email: d.email || '',
          mobile: d.mobile || d.phone || '',
          muni_address: d.muni_address || '',
          municipality_name: d.muni_name || d.municipality_name || ''
        });
        
        // 🟢 Fixed: Database column name is 'muni_logo_url'
        if (d.muni_logo_url) {
          setLogoPreview(`${API_BASE}${d.muni_logo_url}`);
        }
      }
    } catch (err) {
      console.error("DB Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [tenantId]);

  const handleLogoChange = (e) => {
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
    formData.append('tenant_id', tenantId);
    formData.append('full_name', profileData.full_name);
    formData.append('email', profileData.email);
    formData.append('mobile', profileData.mobile);
    formData.append('muni_address', profileData.muni_address);
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const res = await axios.post(`${API_BASE}/api/admin/update-profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        toast.success("Profile & Logo Updated! ✅");
        setShowModal(null);
        fetchProfile(); 
      }
    } catch (err) {
      toast.error("Update failed! ❌");
    }
    setLoading(false);
  };

  return (
    <header className="h-20 bg-white flex items-center justify-between px-8 sticky top-0 z-[90] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-b border-slate-50">
      <Toaster position="top-right" />
      
      <button onClick={toggleSidebar} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 active:scale-90">
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-4">
        <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="relative">
          <div onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 cursor-pointer p-1.5 bg-slate-50 border border-slate-100 rounded-2xl hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
              {logoPreview ? (
                <img src={logoPreview} alt="Muni Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="font-black text-emerald-600 uppercase">{profileData?.full_name?.charAt(0) || 'C'}</span>
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-black text-slate-800 leading-none">{profileData?.full_name || 'City Admin'}</p>
              <p className="text-[10px] font-bold text-emerald-600 mt-1 italic">{tenantId}</p>
            </div>
            <MoreVertical size={16} className="text-slate-400" />
          </div>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="absolute right-0 mt-4 w-60 bg-white rounded-[32px] shadow-2xl border border-slate-100 p-2 z-[100]">
                <div className="p-4 border-b border-slate-50 text-center mb-2">
                   <p className="text-sm font-black text-slate-800">Administrator</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{profileData?.municipality_name || 'Nagar Nigam'}</p>
                </div>
                <button onClick={() => { setShowModal('profile'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 text-slate-600 font-bold text-xs uppercase transition-all">
                  <User size={16} className="text-emerald-600" /> My Profile
                </button>
                <button onClick={() => { setShowModal('security'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 text-slate-600 font-bold text-xs uppercase transition-all">
                  <Shield size={16} className="text-emerald-600" /> Security
                </button>
                <div className="h-px bg-slate-100 my-2 mx-4" />
                <button onClick={() => {localStorage.clear(); window.location.href='/login';}} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-widest">
                  <LogOut size={16}/> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-800 uppercase italic">
                  {showModal === 'profile' ? 'Municipality Profile' : 'Security Panel'}
                </h2>
                <button onClick={() => setShowModal(null)} className="p-2 hover:bg-rose-50 text-rose-400 rounded-full transition-all"><X size={24} /></button>
              </div>

              <div className="p-8">
                {showModal === 'profile' ? (
                  <form onSubmit={handleUpdate} className="space-y-8">
                    <div className="flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-[30px] border border-dashed border-slate-200">
                        <div className="relative group">
                           <div className="w-28 h-28 bg-white rounded-3xl overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
                              {logoPreview ? (
                                <img src={logoPreview} className="w-full h-full object-contain" alt="Preview" />
                              ) : (
                                <Upload size={30} className="text-slate-300" />
                              )}
                           </div>
                           <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg hover:scale-110 transition-all active:scale-95">
                             <Camera size={18} />
                           </button>
                           <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleLogoChange} />
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] font-black text-slate-800 uppercase">Municipality Official Logo</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Recommended: PNG Square 500x500</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputBox label="Admin Full Name" icon={User} value={profileData?.full_name} onChange={(v)=>setProfileData({...profileData, full_name:v})} />
                      <InputBox label="Official Email" icon={Mail} value={profileData?.email} onChange={(v)=>setProfileData({...profileData, email:v})} />
                      <InputBox label="Contact Number" icon={Phone} value={profileData?.mobile} onChange={(v)=>setProfileData({...profileData, mobile:v})} />
                      <InputBox label="Office Address" icon={MapPin} value={profileData?.muni_address} onChange={(v)=>setProfileData({...profileData, muni_address:v})} full />
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-emerald-600 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                      Update Municipality Identity
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <Shield size={40} className="mx-auto text-rose-500" />
                    <p className="text-slate-800 font-black uppercase">System Credentials</p>
                    <p className="text-slate-400 text-xs px-10">Contact Super Admin to reset your MFA or system access tokens.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

const InputBox = ({ label, icon: Icon, value, onChange, full }) => (
  <div className={full ? "md:col-span-2 space-y-2" : "space-y-2"}>
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white transition-all">
      <Icon size={16} className="text-slate-300" />
      <input className="bg-transparent w-full outline-none font-bold text-slate-700 text-sm" value={value || ''} onChange={(e)=>onChange(e.target.value)} />
    </div>
  </div>
);

export default CityTopbar;
