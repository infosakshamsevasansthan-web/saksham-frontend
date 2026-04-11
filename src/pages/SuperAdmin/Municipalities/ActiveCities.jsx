import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import { ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActiveCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveCities();
  }, []);

  const fetchActiveCities = async () => {
    try {
      const res = await fetch('https://saksham-backend-9719.onrender.com/api/super-admin/active-tenants');
      const result = await res.json();
      if (result.success) setCities(result.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Active Municipalities</h1>
            <p className="text-slate-400 font-bold text-xs uppercase mt-1">Real-time managed cities</p>
          </div>
          <button onClick={fetchActiveCities} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-emerald-600 hover:rotate-180 transition-all duration-500">
            <RefreshCw size={20} />
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map((city) => (
              <motion.div key={city.tenant_id} whileHover={{ y: -10 }} className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 group-hover:bg-emerald-500 transition-all duration-500"></div>
                 
                 <div className="relative z-10">
                   <ShieldCheck className="text-emerald-500 mb-6 group-hover:text-white transition-colors" size={32} />
                   <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 uppercase">{city.municipality_name}</h3>
                   <p className="text-xs font-black text-emerald-600 font-mono tracking-tighter uppercase mb-6">{city.tenant_id}</p>
                   
                   <div className="space-y-4 pt-6 border-t border-slate-50 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Households</span>
                        <span className="font-bold text-slate-700">{city.households.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</span>
                        <span className="font-bold text-slate-700">{city.full_name}</span>
                      </div>
                   </div>

                   {/* Navigate to City Control Panel */}
                   <button 
                    onClick={() => navigate(`/super-admin/control-panel/${city.tenant_id}`)}
                    className="w-full mt-8 flex items-center justify-center gap-2 py-4 bg-slate-50 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                   >
                      Open Control Panel <ExternalLink size={14} />
                   </button>
                 </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActiveCities;