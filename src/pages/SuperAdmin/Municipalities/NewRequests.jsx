import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Calendar, User, Smartphone, Building2, Send } from 'lucide-react';

const NewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null); // Kis request ko approve kar rahe hain
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Data State
  const [approvalData, setApprovalData] = useState({
    start_date: '',
    end_date: '',
    admin_name: '',
    admin_mobile: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    fetch('https://saksham-backend-9719.onrender.com/api/super-admin/dashboard-stats')
      .then(res => res.json())
      .then(data => setRequests(data.pendingRequestsList));
  };

  // Approval Modal Open karne ka function
  const openApprovalForm = (req) => {
    setSelectedReq(req);
    setApprovalData({
      admin_name: req.full_name, // Default wahi naam jo request mein tha
      admin_mobile: req.phone,   // Default wahi mobile
      start_date: new Date().toISOString().split('T')[0], // Aaj ki date
      end_date: ''
    });
    setShowModal(true);
  };

  const handleFinalSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await fetch('https://saksham-backend-9719.onrender.com/api/super-admin/finalize-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: selectedReq.tenant_id,
        ...approvalData
      })
    });
    
    const result = await res.json();

    if (result.success) {
      alert("Mubarak ho! City Active ho gayi hai.");
      setShowModal(false);
      fetchRequests(); // List refresh karo
    } else {
      // 👈 Ab yahan asli error dikhayega
      alert("Backend Error: " + result.message);
    }
  } catch (err) {
    alert("Connection Error: Server se baat nahi ho pa rahi!");
  } finally {
    setLoading(false);
  }
};
  return (
    <AdminLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-black text-slate-800">Onboarding Requests</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Awaiting Master Approval</p>
        </header>

        {/* Requests Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((req) => (
            <motion.div key={req.id} className="bg-white rounded-[40px] p-6 border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 font-black text-xl">
                {req.municipality_name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 text-lg">{req.municipality_name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase">{req.tenant_id}</p>
              </div>
              <div className="flex gap-2">
                {/* 🟢 Click par Modal khulega */}
                <button 
                  onClick={() => openApprovalForm(req)}
                  className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all"
                >
                  <Check size={20} />
                </button>
                <button className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Approval Form Modal --- */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative z-10"
              >
                <div className="p-8 bg-emerald-600 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black">Finalize Activation</h2>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-1">{selectedReq?.municipality_name}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20}/></button>
                </div>

                <form onSubmit={handleFinalSubmit} className="p-8 space-y-6">
                  {/* 1. Dates Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Subscription Start</label>
                      <input 
                        type="date" required 
                        value={approvalData.start_date}
                        onChange={(e) => setApprovalData({...approvalData, start_date: e.target.value})}
                        className="w-full p-3 bg-slate-50 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold text-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Subscription End</label>
                      <input 
                        type="date" required 
                        value={approvalData.end_date}
                        onChange={(e) => setApprovalData({...approvalData, end_date: e.target.value})}
                        className="w-full p-3 bg-slate-50 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold text-sm" 
                      />
                    </div>
                  </div>

                  {/* 2. Admin Info Grid */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Assigned City Admin Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-300" size={18} />
                        <input 
                          required 
                          value={approvalData.admin_name}
                          onChange={(e) => setApprovalData({...approvalData, admin_name: e.target.value})}
                          className="w-full pl-10 p-3 bg-slate-50 rounded-xl border-none ring-1 ring-slate-200 font-bold text-sm" 
                          placeholder="Full Name" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Admin Contact Number (for OTP)</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-3 text-slate-300" size={18} />
                        <input 
                          required 
                          value={approvalData.admin_mobile}
                          onChange={(e) => setApprovalData({...approvalData, admin_mobile: e.target.value})}
                          className="w-full pl-10 p-3 bg-slate-50 rounded-xl border-none ring-1 ring-slate-200 font-bold text-sm" 
                          placeholder="Mobile" 
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                    {loading ? "Activating..." : "Approve & Go Live"} <Send size={20} />
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
};

export default NewRequests;