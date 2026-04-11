import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Home, PhoneCall } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom'; // 👈 Ye add kiya navigation ke liye

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate(); // 👈 Navigation hook
  const location = useLocation(); // 👈 Current page check karne ke liye

  // Bhasha badalne ka function
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const scrollToSection = (id) => {
    // Agar hum login page par hain aur koi Home/Features dabaye, toh pehle home page par jao
    if (location.pathname !== "/") {
      navigate("/");
      // Thoda delay taaki page load hone ke baad scroll ho
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }} animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100 px-6 py-4 flex justify-between items-center"
    >
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
        <img src="/logo.png" alt="Saksham Logo" className="h-10 w-auto" />
        <span className="text-2xl font-black text-emerald-800 tracking-tighter">SAKSHAM</span>
      </div>

      <div className="hidden md:flex items-center gap-8 font-bold text-slate-600">
        <button onClick={() => scrollToSection('home')} className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
          <Home size={18} /> {t('nav_home')}
        </button>
        <button onClick={() => scrollToSection('features')} className="hover:text-emerald-600 transition-colors">
          {t('nav_features')}
        </button>
        <button onClick={() => scrollToSection('pricing')} className="hover:text-emerald-600 transition-colors">
          {t('nav_pricing')}
        </button>
        <button onClick={() => scrollToSection('about')} className="hover:text-emerald-600 transition-colors">
          {t('nav_about')}
        </button>
        
        <button onClick={() => scrollToSection('contact')} className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
          <PhoneCall size={18} /> {t('nav_contact')}
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Button */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full hover:bg-emerald-100 transition-all"
        >
          <Globe size={16} /> 
          {i18n.language === 'en' ? 'HINDI' : 'ENGLISH'}
        </button>

        {/* Admin Login Button - Ab ye login page par le jayega */}
        <button 
          onClick={() => navigate('/login')} // 👈 Ye navigation line add kar di
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
        >
          {t('btn_admin')}
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;