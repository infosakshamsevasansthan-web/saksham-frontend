import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion'; // 👈 Bas ye ek line miss ho gayi thi, maine add kar di hai
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Pricing from '../components/Pricing';
import Chatbot from '../components/Chatbot';
import Footer from '../components/Footer';
import Contact from '../components/Contact';

const LandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Navigation Bar */}
      <Navbar />
      
      {/* 2. Hero Section (id="home" iske andar hai) */}
      <Hero />
      
      {/* 3. Features Section */}
      <section id="features" className="py-24 bg-white text-center">
        <h2 className="text-4xl font-black text-slate-900">{t('features_title')}</h2>
        <p className="text-slate-500 mt-4 text-lg">{t('features_subtitle')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mt-16 px-6">
           {/* QR Collection */}
           <div className="p-10 bg-emerald-50 rounded-[40px] border border-emerald-100 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-6">S</div>
              <h3 className="font-bold text-2xl mb-4 text-emerald-800">{t('feat_qr_title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('feat_qr_desc')}</p>
           </div>
           {/* Staff Tracking */}
           <div className="p-10 bg-blue-50 rounded-[40px] border border-blue-100 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6">T</div>
              <h3 className="font-bold text-2xl mb-4 text-blue-800">{t('feat_staff_title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('feat_staff_desc')}</p>
           </div>
           {/* Grievance Portal */}
           <div className="p-10 bg-orange-50 rounded-[40px] border border-orange-100 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white mb-6">G</div>
              <h3 className="font-bold text-2xl mb-4 text-orange-800">{t('feat_portal_title')}</h3>
              <p className="text-slate-600 leading-relaxed">{t('feat_portal_desc')}</p>
           </div>
        </div>
      </section>

      {/* 4. Pricing Section */}
      <Pricing />

      {/* 5. Contact Us Section (id="contact" iske andar hai) */}
      <Contact />

      {/* 6. About Section */}
<section id="about" className="py-28 bg-gradient-to-b from-emerald-50 to-white text-center relative overflow-hidden">
  {/* Background Decoration (Light Emerald Glow) */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>

  <div className="max-w-5xl mx-auto px-6 relative z-10">
    {/* Tagline - Green color for light background */}
    <motion.p 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="text-emerald-600 font-black text-sm uppercase tracking-[0.3em] mb-4"
    >
      {t('mission_tagline')}
    </motion.p>

    {/* Main Title - Dark color for light background */}
    <h2 className="text-5xl font-black mb-8 leading-tight text-slate-900">
      {t('mission_title')}
    </h2>

    {/* Decorative Line */}
    <div className="w-24 h-1.5 bg-emerald-500 mx-auto mb-10 rounded-full shadow-sm shadow-emerald-200"></div>

    {/* Description - Slate-600 for better readability on light bg */}
    <p className="text-slate-600 text-2xl leading-relaxed italic font-medium max-w-4xl mx-auto">
      "{t('mission_desc')}"
    </p>

    {/* Vision Small Card - Solid white with shadow for light background */}
    <div className="mt-16 inline-flex items-center gap-4 bg-white border border-emerald-100 p-4 rounded-3xl shadow-xl shadow-emerald-100/50">
      <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-emerald-200">S</div>
      <div className="text-left">
        <p className="text-slate-900 font-bold">{t('about_vision_title')}</p>
        <p className="text-slate-500 text-sm font-medium">{t('about_vision_desc')}</p>
      </div>
    </div>
  </div>
</section>

      {/* 7. Floating Tools */}
      <Chatbot />
      
      {/* 8. Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;