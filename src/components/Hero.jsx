import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 👈 Naya Import
import CityAnimation from './CityAnimation';

const Hero = () => {
  const { t } = useTranslation(); // 👈 Hook initialize kiya

  return (
    <section id="home" className="pt-32 pb-20 px-6 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
          <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 inline-block">
            {t('hero_tag')} {/* 👈 Translated */}
          </span>
          <h1 className="text-6xl font-black text-slate-900 leading-tight mb-6">
            {t('hero_title_1')} <br />
            <span className="text-emerald-600">{t('hero_title_2')}</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 leading-relaxed">
            {t('hero_subtitle')} {/* 👈 Translated */}
          </p>
          <div className="flex gap-4">
            <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200">
              {t('btn_demo')} {/* 👈 Translated */}
            </button>
            <button className="flex items-center gap-3 bg-white text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg border border-slate-200">
              <Play fill="currentColor" size={20} /> {t('btn_video')} {/* 👈 Translated */}
            </button>
          </div>
        </motion.div>

        <div className="relative">
          <CityAnimation />
        </div>
      </div>
    </section>
  );
};

export default Hero;