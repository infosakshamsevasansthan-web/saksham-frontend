import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import { Zap, Award, Crown, Check, Plus, Loader2 } from 'lucide-react';

// Icon Map taaki database ke string ko component mein badal sakein
const iconMap = { Zap, Award, Crown };

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://saksham-backend-9719.onrender.com/api/super-admin/plans')
      .then(res => res.json())
      .then(res => {
        if(res.success) setPlans(res.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <AdminLayout><Loader2 className="animate-spin mx-auto mt-20" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-10">
        <header className="flex justify-between items-center px-4">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Subscription Tiers</h1>
          <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2">
            <Plus size={20} /> Create New Plan
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
          {plans.map((plan) => {
            const IconComponent = iconMap[plan.icon_name] || Zap;
            return (
              <motion.div 
                key={plan.id}
                whileHover={{ y: -10 }}
                className={`bg-white rounded-[48px] p-10 border-2 ${plan.is_popular ? 'border-emerald-500 shadow-2xl' : 'border-slate-100'} relative flex flex-col`}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white px-8 py-2 rounded-bl-[24px] font-black text-[10px] tracking-widest uppercase">Popular Choice</div>
                )}

                <div className={`w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-800 mb-8`}>
                  <IconComponent size={32} />
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-2">{plan.plan_name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-slate-900">
                    {plan.price_per_household > 0 ? `₹${plan.price_per_household}` : 'Custom'}
                  </span>
                  <span className="text-slate-400 font-bold text-sm">/ household</span>
                </div>

                <ul className="space-y-4 flex-1 mb-10 text-sm font-bold text-slate-500">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Check size={12} strokeWidth={4} /></div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-slate-50 text-slate-600 hover:bg-emerald-600 hover:text-white transition-all">
                  Configure Plan
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionPlans;