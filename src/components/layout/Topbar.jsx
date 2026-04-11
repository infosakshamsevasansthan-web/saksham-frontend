import React, { useState, useEffect } from 'react';
import { Menu, User, Bell, Shield, MoreVertical, LogOut, X, Save, Loader2, MapPin, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const Topbar = ({ toggleSidebar }) => {
  const [activeMenu, setActiveMenu] = useState(null); 
  const [showModal, setShowModal] = useState(null); 
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const t_id = localStorage.getItem("tenantId");

  // 1. Database se Data Lena
  const fetchProfileData = async () => {
    if (!t_id) return;
    try {
      const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/profile-details/${t_id}`);
      if (res.data.success) {
        setProfileData(res.data.data);
      }
    } catch (err) {
      console.error("Database connection error:", err);
    }
  };

  useEffect(() => {
    fetchProfileData();
    // Click outside listener
    const closeAll = () => setActiveMenu(null);
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, [t_id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://saksham-backend-9719.onrender.com/api/admin/update-profile', {
        tenant_id: t_id,
        ...profileData
      });
      toast.success("Profile Updated Successfully! ✅");
      setShowModal(null);
    } catch (err) {
      toast.error("Database update failed ❌");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header className="h-20 bg-white flex items-center justify-between px-8 sticky top-0 shadow-sm border-b border-slate-100 z-[100]">
      <Toaster position="top-right" />
      
      <button onClick={(e) => { e.stopPropagation(); toggleSidebar(); }} className="p-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all border border-emerald-100">
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-5">
        {/* PROFILE DROPDOWN */}
        <div className="relative">
          <div onClick={(e) => { 
              e.stopPropagation(); // Yeh jaruri hai
              setActiveMenu(activeMenu === 'profile' ? null : 'profile'); 
            }} 
            className={`flex items-center gap-3 cursor-pointer p-1.5 rounded-2xl border transition-all ${activeMenu === 'profile' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100 hover:shadow-md'}`}>
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg font-black text-sm">
               {profileData?.full_name?.charAt(0) || 'CA'}
            </div>
            <div className="hidden md:block text-left pr-2">
               <p className="text-xs font-black text-slate-800 leading-none">{profileData?.full_name || 'City Admin'}</p>
               <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1">{t_id}</p>
            </div>
            <MoreVertical size={16} className="text-slate-400" />
          </div>

          <AnimatePresence>
            {activeMenu === 'profile' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }} 
                className="absolute right-0 mt-4 w-64 bg-white rounded-[32px] shadow-2xl border border-slate-100 p-2 z-[110]"
                onClick={(e) => e.stopPropagation()} // Menu par click karne se menu band na ho
              >
                <div className="p-4 border-b border-slate-50 mb-2 text-center bg-slate-50/50 rounded-t-[24px]">
                  <p className="text-sm font-black text-slate-800 tracking-tight">Admin Menu</p>
                </div>

                <div className="space-y-1">
                  {/* PROFILE BUTTON FIXED */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Profile Modal Opening..."); // Debug log
                      setShowModal('profile');
                      setActiveMenu(null);
                    }} 
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-emerald-50 text-slate-600 font-bold text-xs uppercase transition-all"
                  >
                    <User size={18} /> My Profile
                  </button>

                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowModal('security'); setActiveMenu(null); }} 
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-emerald-50 text-slate-600 font-bold text-xs uppercase transition-all"
                  >
                    <Shield size={18} /> Security
                  </button>

                  <div className="h-px bg-slate-100 my-2 mx-4" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-rose-50 text-rose-600 font-bold text-xs uppercase transition-all">
                    <LogOut size={18} /> Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- INTEGRATED MODAL (STRICT Z-INDEX) --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-800 uppercase italic">
                  {showModal === 'profile' ? 'Account Profile' : 'System Security'}
                </h2>
                <button onClick={() => setShowModal(null)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8">
                {showModal === 'profile' ? (
                  <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModalInput label="Full Name" icon={User} value={profileData?.full_name} onChange={(v)=>setProfileData({...profileData, full_name:v})} />
                    <ModalInput label="Email" icon={Mail} value={profileData?.email} onChange={(v)=>setProfileData({...profileData, email:v})} />
                    <ModalInput label="Mobile" icon={Phone} value={profileData?.mobile} onChange={(v)=>setProfileData({...profileData, mobile:v})} />
                    <ModalInput label="Office Address" icon={MapPin} value={profileData?.muni_address} onChange={(v)=>setProfileData({...profileData, muni_address:v})} full />
                    
                    <button type="submit" disabled={loading} className="md:col-span-2 bg-emerald-600 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all">
                      {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                      Update Database
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Shield size={30} />
                    </div>
                    <p className="text-slate-800 font-black uppercase">Security & MFA</p>
                    <p className="text-slate-400 text-xs">Password changes are currently disabled. Contact Super Admin.</p>
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

const ModalInput = ({ label, icon: Icon, value, onChange, full }) => (
  <div className={full ? "md:col-span-2 space-y-2" : "space-y-2"}>
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:bg-white transition-all">
      <Icon size={16} className="text-slate-300" />
      <input className="bg-transparent w-full outline-none font-bold text-slate-700 text-sm" value={value || ''} onChange={(e)=>onChange(e.target.value)} />
    </div>
  </div>
);

export default Topbar;