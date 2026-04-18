import React, { useState } from 'react';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react'; // CheckCircle add kiya
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  
  // Logic ke liye states
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      name: e.target.name.value,
      mobile: e.target.mobile.value,
      message: e.target.message.value,
    };

    try {
      const res = await fetch('https://saksham-backend-9719.onrender.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true); // Success hone par thank you dikhao
      }
    } catch (err) {
      alert("Connection Error! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
        
        {/* Left Side: Wahi purana design */}
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-6">
            {t('contact_title')}
          </h2>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">
            {t('contact_desc')}
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl">
              <div className="bg-emerald-600 p-3 rounded-xl text-white">
                <Phone size={24}/>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">
                  {t('contact_call_label')}
                </p>
                <p className="font-bold text-slate-800">+91 9430608992</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl">
              <div className="bg-blue-600 p-3 rounded-xl text-white">
                <Mail size={24}/>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">
                  {t('contact_email_label')}
                </p>
                <p className="font-bold text-slate-800">sales@sakshamsevasansthan.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form area with Conditional Rendering */}
        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 shadow-xl flex flex-col justify-center">
          
          {!submitted ? (
            // Jab form submit nahi hua hai
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                name="name"
                required
                className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                placeholder={t('placeholder_name')}
              />
              <input 
                name="mobile"
                required
                className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                placeholder={t('placeholder_phone')}
              />
              <textarea 
                name="message"
                className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 h-32 outline-none" 
                placeholder={t('placeholder_message')}
              ></textarea>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                {loading ? "Sending..." : <>{t('btn_submit')} <Send size={18}/></>}
              </button>
            </form>
          ) : (
            // Mast Thank You Message Design (Design matching with Left icons)
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Thank You!</h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Aapka message humein mil gaya hai.<br/>Hum jald hi aap se contact karenge.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-emerald-600 font-bold hover:underline"
              >
                Send another message
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default Contact;
