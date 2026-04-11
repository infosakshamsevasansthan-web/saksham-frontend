import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap, Award, Crown, Check, Loader2, ArrowRight } from 'lucide-react';
import SubscriptionForm from './SubscriptionForm';

const iconMap = { Zap, Award, Crown };

const Pricing = () => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrice, setSelectedPrice] = useState(5);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('https://saksham-backend-9719.onrender.com/api/super-admin/plans');
        const result = await res.json();
        if (result.success) {
          setPlans(result.data);
        }
      } catch (error) {
        console.error("Pricing Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleOpenForm = (price) => {
    setSelectedPrice(price);
    setIsFormOpen(true);
  };

  return (
    <section id="pricing" className="py-20 px-6 bg-[#fcfdfe] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-[100px] opacity-50 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-[100px] opacity-50 -z-10"></div>
      
      <div className="max-w-5xl mx-auto text-center mb-16 relative z-10">
        <motion.span 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          className="text-emerald-600 font-bold text-sm uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full"
        >
          Simple Pricing
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-slate-900 mt-6 mb-4 tracking-tight"
        >
          {t('pricing_title')}
        </motion.h2>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          {t('pricing_subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
          {plans.map((plan) => {
            const IconComponent = iconMap[plan.icon_name] || Zap;
            const isPopular = plan.is_popular;

            return (
              <motion.div 
                key={plan.id}
                whileHover={{ y: -8 }}
                className={`relative bg-white rounded-[32px] p-8 border-2 transition-all duration-300 flex flex-col h-full ${
                  isPopular 
                  ? 'border-emerald-500 shadow-[0_20px_50px_rgba(16,185,129,0.15)] scale-[1.02]' 
                  : 'border-slate-100 shadow-sm hover:border-emerald-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-5 right-5">
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                      Best Choice
                    </span>
                  </div>
                )}

                {/* Plan Icon */}
                <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${
                  isPopular ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-emerald-600'
                }`}>
                  <IconComponent size={28} />
                </div>

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-800">
                    {plan.plan_name === 'Basic Tier' ? t('plan_basic') : 
                     plan.plan_name === 'Municipal Standard' ? t('plan_standard') : 
                     plan.plan_name === 'Enterprise Elite' ? t('plan_elite') : plan.plan_name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-black text-slate-900">
                      {plan.price_per_household > 0 ? `₹${plan.price_per_household}` : 'Custom'}
                    </span>
                    <span className="text-slate-400 font-bold text-xs uppercase">
                      {t('pricing_unit')}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="flex-1">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, i) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -5 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} className="flex items-center gap-3 text-slate-600 font-semibold text-sm"
                      >
                        <div className="bg-emerald-50 text-emerald-600 rounded-lg p-1">
                          <Check size={14} strokeWidth={3} />
                        </div>
                        {feat}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => handleOpenForm(plan.price_per_household)}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 group ${
                    isPopular 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {t('btn_start')}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <SubscriptionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        basePrice={selectedPrice} 
      />
    </section>
  );
};

export default Pricing;