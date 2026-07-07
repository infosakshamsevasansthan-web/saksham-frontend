import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Building2, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [otpValues, setOtpValues] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const [formData, setFormData] = useState({ tenantId: '', mobile: '' });
  
  // --- Timer States ---
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuth');
    if (isAuth === 'true') {
      const role = localStorage.getItem('role');
      navigate(role === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/admin/dashboard', { replace: true });
    } else {
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  // --- OTP Countdown Logic ---
  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setCanResend(true);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://saksham-backend-9719.onrender.com/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile: formData.mobile, 
          tenant_id: formData.tenantId 
        })
      });

      const data = await response.json();
      if (data.success) {
        setStep(2);
        setTimeLeft(60); // Reset timer on success
        setCanResend(false);
      } else {
        alert(data.message || "User not found!");
      }
    } catch (error) {
      alert("Backend Server Error!");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otpValues];
    newOtp[index] = element.value;
    setOtpValues(newOtp);
    if (element.value !== "" && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) inputRefs.current[index - 1].focus();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join("");
    if (fullOtp.length < 6) return alert("Please enter 6-digit OTP");

    setLoading(true);
    try {
      const response = await fetch('https://saksham-backend-9719.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile: formData.mobile, 
          otp: fullOtp, 
          tenant_id: formData.tenantId 
        })
      });

      const data = await response.json();
      console.log(data);
      if (data.success) {
        localStorage.clear();
        localStorage.setItem("token", data.token);
        localStorage.setItem('isAuth', 'true');
        localStorage.setItem('tenantId', data.user.tenant);
        localStorage.setItem('userName', data.user.name);
        
        
        const tenant = data.user.tenant.toUpperCase();
        if (tenant === 'SUPER_ADMIN' || formData.tenantId.toUpperCase() === 'MASTER') {
          localStorage.setItem('role', 'SUPER_ADMIN');
          navigate('/super-admin/dashboard', { replace: true });
        } else {
          localStorage.setItem('role', 'TENANT_ADMIN');
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        alert(data.message || "Invalid OTP!");
      }
    } catch (error) {
      alert("Server error!");
    } finally {
      setLoading(false);
    }
  };

  // Timer format Helper
  const formatTime = (seconds) => {
    return `00:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-emerald-100 flex items-center justify-center p-6 relative overflow-hidden">
      <AnimatePresence>{loading && <Loader />}</AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl w-full max-w-[1000px] h-auto md:h-[600px] rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white z-10">
        
        {/* Left Side: Branding */}
        <div className="w-full md:w-1/2 bg-emerald-600 p-12 flex flex-col items-center justify-center text-center text-white relative">
          <div className="z-10 flex flex-col items-center">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-white/10 p-5 rounded-3xl backdrop-blur-md mb-8 shadow-xl">
              <img src="/logo.png" className="h-20 w-auto brightness-0 invert" alt="Logo" />
            </motion.div>
            <h2 className="text-4xl font-black leading-tight mb-4 tracking-tighter uppercase">Saksham <br /> Control Center</h2>
            <p className="text-emerald-100 font-medium max-w-[280px] opacity-80">High-security gateway for municipal management.</p>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                <header>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">Access Portal</h3>
                  <p className="text-slate-400 font-medium text-sm">Verify your registered mobile</p>
                </header>

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant ID</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-4 text-emerald-500" size={20} />
                      <input required name="tenantId" value={formData.tenantId} onChange={handleInputChange} className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800" placeholder="MASTER or SAK-XXX" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-4 text-emerald-500" size={20} />
                      <input required name="mobile" value={formData.mobile} onChange={handleInputChange} type="tel" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800" placeholder="9939776272" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                    Request OTP <ArrowRight size={20} />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold text-sm transition-colors group">
                  <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>
                <header>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">Verify Code</h3>
                  <p className="text-slate-400 font-medium text-sm">6-digit code sent to {formData.mobile}</p>
                </header>
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="flex gap-2 justify-between">
                    {otpValues.map((data, index) => (
                      <input key={index} type="text" maxLength="1" ref={(el) => (inputRefs.current[index] = el)} value={data} onChange={(e) => handleOtpChange(e.target, index)} onKeyDown={(e) => handleKeyDown(e, index)} className="w-10 h-14 md:w-12 md:h-16 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl text-center font-black text-2xl focus:ring-2 focus:ring-emerald-500 transition-all" />
                    ))}
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl active:scale-95">
                    Authorize Login <ShieldCheck size={20} />
                  </button>
                  
                  {/* Timer & Resend Logic */}
                  <div className="text-center text-sm font-bold text-slate-400">
                    {canResend ? (
                      <p>Didn't receive? <span onClick={handleSendOTP} className="text-emerald-600 cursor-pointer hover:underline">Resend</span></p>
                    ) : (
                      <p>Resend OTP in <span className="text-slate-800">{formatTime(timeLeft)}</span></p>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminLogin;
