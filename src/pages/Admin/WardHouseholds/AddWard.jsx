import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { ArrowLeft, Save, Hash, FileText, Loader2, Layers, MapPin, Plus, X, List, Building2, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AddWard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [circleLoading, setCircleLoading] = useState(false); // 👈 1. नया लोडिंग स्टेट यहाँ जोड़ा
  const [circles, setCircles] = useState([]);
  const [showCircleModal, setShowCircleModal] = useState(false);
  
  // Ward Form State
  const [wardForm, setWardForm] = useState({
    ward_no: '',
    ward_name: '',
    circle_id: ''
  });

  // Circle Form State
  const [newCircleData, setNewCircleData] = useState({ name: '', address: '' });

  const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925";

  // 1. Fetch Circles from DB
  const fetchCircles = async () => {
    try {
      const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`);
      if (res.data.success) setCircles(res.data.data);
    } catch (err) { console.error("Error loading circles"); }
  };

  useEffect(() => { fetchCircles(); }, [tenantId]);

  // 2. Add Circle Logic (Updated with Loading Check)
  const handleAddCircle = async (e) => {
    e.preventDefault();
    if (circleLoading) return; // 👈 दोबारा क्लिक होने से रोकेगा

    setCircleLoading(true); // 👈 लोडिंग शुरू
    try {
      const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/circles/add', {
        tenant_id: tenantId,
        circle_name: newCircleData.name,
        work_station_address: newCircleData.address
      });
      if (res.data.success) {
        toast.success('Circle registered in system! ✅');
        setNewCircleData({ name: '', address: '' });
        fetchCircles(); 
        setShowCircleModal(false);
      }
    } catch (err) { 
        toast.error(err.response?.data?.message || 'Error adding circle'); 
    } finally {
        setCircleLoading(false); // 👈 लोडिंग खत्म
    }
  };

  // 3. Add Ward Logic
  const handleWardSubmit = async (e) => {
    e.preventDefault();
    if(!wardForm.circle_id) return toast.error("Pehle Circle select karein!");
    
    setLoading(true);
    try {
      const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/wards/add', {
        ...wardForm,
        tenant_id: tenantId,
        total_households: 0
      });
      if (res.data.success) {
        toast.success('Ward linked to circle successfully! 🔗');
        setWardForm({ ward_no: '', ward_name: '', circle_id: '' });
        setTimeout(() => navigate('/admin/wards'), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving ward');
    } finally { setLoading(false); }
  };

  return (
    <CityLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto p-6 text-left space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-black text-slate-800 uppercase italic leading-none">Administrative Hierarchy</h1>
             <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Nagar Nigam Structure Management</p>
          </div>
          <button onClick={() => navigate(-1)} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all text-slate-400">
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: New Ward Enrollment Form */}
          <div className="lg:col-span-7 bg-white rounded-[45px] shadow-sm border border-slate-100 overflow-hidden">
             <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black uppercase italic">New Ward Registration</h2>
                  <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest mt-1">Step: Map Circle then Define Ward</p>
                </div>
                <button 
                  onClick={() => setShowCircleModal(true)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-white hover:text-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                >
                  <Plus size={16} /> Add Circle
                </button>
             </div>

             <form onSubmit={handleWardSubmit} className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Reporting Circle (अंचल)</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full pl-6 pr-10 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 appearance-none transition-all text-sm"
                      value={wardForm.circle_id}
                      onChange={(e) => setWardForm({...wardForm, circle_id: e.target.value})}
                    >
                      <option value="">Choose Circle...</option>
                      {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                    </select>
                    <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputBox 
                    label="Ward Number" icon={Hash} type="number" placeholder="e.g. 01" 
                    value={wardForm.ward_no} onChange={(v) => setWardForm({...wardForm, ward_no: v})}
                  />
                  <InputBox 
                    label="Ward Area Name" icon={FileText} type="text" placeholder="e.g. South End" 
                    value={wardForm.ward_name} onChange={(v) => setWardForm({...wardForm, ward_name: v})}
                  />
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save />}
                  Authorize Ward Mapping
                </button>
             </form>
          </div>

          {/* RIGHT: Circle Registry Table */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
             <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex-1">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                    <List size={16} className="text-emerald-500" /> Circle Registry
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">{circles.length} Active</span>
                </div>

                <div className="p-4 h-[450px] overflow-y-auto custom-scrollbar">
                   {circles.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3">
                        <Layers size={40} />
                        <p className="text-[10px] font-black uppercase">No Circles Registered</p>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {circles.map((c) => (
                           <motion.div 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            key={c.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-md transition-all group"
                           >
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className="text-sm font-black text-slate-800 uppercase leading-none">{c.circle_name}</p>
                                    <div className="flex items-center gap-2 mt-3 text-slate-400">
                                       <MapPin size={12} />
                                       <p className="text-[10px] font-bold uppercase">{c.work_station_address || 'Address N/A'}</p>
                                    </div>
                                 </div>
                                 <Building2 size={18} className="text-slate-200 group-hover:text-emerald-400 transition-colors" />
                              </div>
                           </motion.div>
                        ))}
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* QUICK ADD CIRCLE MODAL */}
      <AnimatePresence>
        {showCircleModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
             <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden"
             >
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                   <h3 className="font-black text-slate-800 uppercase italic">Register New Circle</h3>
                   <button onClick={() => setShowCircleModal(false)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-all"><X size={20}/></button>
                </div>
                <form onSubmit={handleAddCircle} className="p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Circle Name (अंचल का नाम)</label>
                      <input 
                        required placeholder="e.g. Circle East"
                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-sm"
                        value={newCircleData.name}
                        onChange={(e) => setNewCircleData({...newCircleData, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Station / Office Address</label>
                      <textarea 
                        placeholder="Complete office location..."
                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl outline-none font-bold text-sm h-24"
                        value={newCircleData.address}
                        onChange={(e) => setNewCircleData({...newCircleData, address: e.target.value})}
                      />
                   </div>
                   {/* 👈 2. बटन में Loading logic यहाँ जोड़ा गया है */}
                   <button 
                    type="submit"
                    disabled={circleLoading}
                    className={`w-full p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center justify-center gap-2
                      ${circleLoading ? 'bg-slate-400 cursor-not-allowed text-white' : 'bg-emerald-600 text-white hover:bg-slate-900 shadow-emerald-100'}`}
                   >
                     {circleLoading && <Loader2 size={14} className="animate-spin" />}
                     {circleLoading ? 'Registering...' : 'Establish Circle Master'}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </CityLayout>
  );
};

// Helper Input Component
const InputBox = ({ label, icon: Icon, type, placeholder, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
        <Icon size={18} />
      </div>
      <input 
        type={type} required placeholder={placeholder}
        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

export default AddWard;
