import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, Calendar, Activity, Lock, Unlock, Database } from 'lucide-react';

const CityControlPanel = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState(null);

  useEffect(() => {
    fetch(`https://saksham-backend-9719.onrender.com/api/super-admin/tenant-details/${tenantId}`)
      .then(res => res.json())
      .then(res => setCity(res.data));
  }, [tenantId]);

  if (!city) return <AdminLayout>Loading City Config...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold transition-all"
        >
          <ArrowLeft size={20} /> Back to Cities
        </button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-emerald-200">
              {city.municipality_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{city.municipality_name}</h1>
              <p className="text-emerald-600 font-black text-sm font-mono">{city.tenant_id}</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 hover:text-white transition-all">
                <Lock size={16}/> Deactivate City
             </button>
             <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl">
                <Database size={16}/> Force Sync
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatMini label="Start Date" value={new Date(city.start_date).toLocaleDateString()} icon={Calendar} color="text-blue-500" />
           <StatMini label="End Date" value={new Date(city.end_date).toLocaleDateString()} icon={Clock} color="text-rose-500" />
           <StatMini label="Active Wards" value="0" icon={MapPin} color="text-emerald-500" />
           <StatMini label="Staff Count" value="0" icon={Users} color="text-amber-500" />
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[200px]">
           <Activity size={40} className="text-slate-200 mb-4 animate-pulse" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Live Logs & Usage Statistics Coming Soon</p>
        </div>
      </div>
    </AdminLayout>
  );
};

const StatMini = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <Icon size={16} className={color} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <h3 className="text-xl font-black text-slate-800 tracking-tight">{value}</h3>
  </div>
);

const Clock = ({size, className}) => <Activity size={size} className={className} />; // Temporary fallback

export default CityControlPanel;