import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, User, Phone, Mail, ArrowRight, CheckCircle, ReceiptText, Hash, LayoutGrid } from 'lucide-react';

const SubscriptionForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    municipality_name: '',
    full_name: '',
    designation: '',
    email: '',
    phone: '',
    plan_id: '' // Naya field
  });

  const [plans, setPlans] = useState([]); // Database se aane wale plans
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [households, setHouseholds] = useState(5000);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState('');

  // --- 1. Database se Plans Fetch karo ---
  useEffect(() => {
    if (isOpen) {
      fetch('https://saksham-backend-9719.onrender.com/api/super-admin/plans')
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setPlans(res.data);
            // Default 1st plan select kar lo
            if (res.data.length > 0) {
              setSelectedPlan(res.data[0]);
              setFormData(prev => ({ ...prev, plan_id: res.data[0].id }));
            }
          }
        });
    }
  }, [isOpen]);

  // --- 2. Dynamic Price Calculation ---
  const pricePerHousehold = selectedPlan ? selectedPlan.price_per_household : 0;
  const subtotal = households * pricePerHousehold;
  const gstAmount = subtotal * 0.18;
  const totalWithGst = subtotal + gstAmount;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Agar plan badla hai toh selectedPlan state bhi update karo taaki price badle
    if (name === 'plan_id') {
      const plan = plans.find(p => p.id === parseInt(value));
      setSelectedPlan(plan);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      households,
      base_price: subtotal,
      gst_amount: gstAmount,
      total_price: totalWithGst
    };

    try {
      const response = await fetch('https://saksham-backend-9719.onrender.com/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        setRequestId(result.tenant_id);
        setSubmitted(true);
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("Backend se connect nahi ho pa raha!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-all z-10"><X size={24} /></button>

            {/* Left Side: Pricing Summary */}
            <div className="md:w-2/5 bg-emerald-600 p-10 text-white flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-black mb-4 leading-tight text-white">Saksham Estimate</h2>
                <div className="bg-white/10 p-6 rounded-3xl border border-white/20 space-y-4 backdrop-blur-sm">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-emerald-100 text-sm font-bold uppercase tracking-widest">Plan Selected</span>
                    <span className="font-black text-sm">{selectedPlan?.plan_name || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Base Amount</span><span className="font-bold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-200 text-sm">
                    <span>GST (18%)</span><span className="font-bold">+ ₹{gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 mt-2 border-t-2 border-dashed border-white/20">
                    <p className="text-[10px] font-black uppercase text-emerald-200 mb-1">Grand Total</p>
                    <h3 className="text-5xl font-black tracking-tighter">₹{totalWithGst.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex items-center gap-2 opacity-60"><ReceiptText size={20} /><p className="text-[10px] font-bold uppercase tracking-widest">Official Tax Invoice provided</p></div>
            </div>

            {/* Right Side: Form */}
            <div className="md:w-3/5 p-10 bg-white max-h-[90vh] overflow-y-auto">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <header><h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Onboarding Request</h3></header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Plan Selection Dropdown */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choose Service Plan</label>
                        <div className="relative">
                            <LayoutGrid className="absolute left-4 top-4 text-emerald-500" size={18} />
                            <select name="plan_id" value={formData.plan_id} onChange={handleChange} className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold appearance-none">
                                {plans.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.plan_name} (₹{plan.price_per_household})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Municipality Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Municipality Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-4 text-emerald-500" size={18} />
                            <input required name="municipality_name" value={formData.municipality_name} onChange={handleChange} className="w-full pl-12 p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="Nagar Nigam Name" />
                        </div>
                    </div>
                  </div>

                  {/* Households Slider */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Household Units</label>
                    <input type="range" min="1000" max="200000" step="500" value={households} onChange={(e) => setHouseholds(parseInt(e.target.value))} className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between mt-2 font-black text-emerald-600 uppercase text-xs"><span>Units:</span> <span>{households.toLocaleString()} households</span></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input required name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold" placeholder="Admin Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</label>
                      <input required name="designation" value={formData.designation} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold" placeholder="e.g. Commissioner" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                      <input required name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold" placeholder="admin@city.gov.in" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile No.</label>
                      <input required name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-200 font-bold" placeholder="94306 08992" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl">
                    {loading ? "Processing Request..." : "Request Access Now"} <ArrowRight size={24} />
                  </button>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center py-10 px-6">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"><CheckCircle size={48} /></div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Request Received!</h3>
                  <div className="bg-slate-50 border-2 border-dashed border-emerald-200 p-6 rounded-[32px] my-6 w-full max-w-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Your Tracking ID</p>
                    <h4 className="text-3xl font-black text-emerald-700 font-mono tracking-tighter">{requestId}</h4>
                  </div>
                  <p className="text-slate-500 mb-8 font-bold text-emerald-600 italic">Hamari team jald hi aapse sampark karegi.</p>
                  <button onClick={onClose} className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black shadow-lg">Back to Home</button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionForm;