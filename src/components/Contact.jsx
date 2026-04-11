import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 👈 Naya Import

const Contact = () => {
  const { t } = useTranslation(); // 👈 Hook initialize kiya

  return (
    <section id="contact" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-6">
            {t('contact_title')} {/* 👈 Translated */}
          </h2>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">
            {t('contact_desc')} {/* 👈 Translated */}
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl">
              <div className="bg-emerald-600 p-3 rounded-xl text-white">
                <Phone size={24}/>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">
                  {t('contact_call_label')} {/* 👈 Translated */}
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
                  {t('contact_email_label')} {/* 👈 Translated */}
                </p>
                <p className="font-bold text-slate-800">sales@sakshamsevasansthan.in</p>
              </div>
            </div>
          </div>
        </div>

        <form className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 shadow-xl space-y-4">
          <input 
            className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500" 
            placeholder={t('placeholder_name')} // 👈 Translated
          />
          <input 
            className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500" 
            placeholder={t('placeholder_phone')} // 👈 Translated
          />
          <textarea 
            className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 h-32" 
            placeholder={t('placeholder_message')} // 👈 Translated
          ></textarea>
          <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
            {t('btn_submit')} <Send size={18}/> {/* 👈 Translated */}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;