import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import { IndianRupee, Building2, Users, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- 1. Unique Dustbin Card Component (Updated Width) ---
const DustbinCard = ({ label, value, color, icon: Icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex flex-col items-center group cursor-pointer px-4"
      whileHover={{ scale: 1.05 }}
    >
      {/* Label above bin */}
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 group-hover:text-emerald-600 transition-colors text-center">
        {label}
      </p>

      {/* Bin Lid (Dhakkan) - Width Increased to w-44 */}
      <motion.div 
        animate={{ 
          rotate: isHovered ? -35 : 0, 
          y: isHovered ? -15 : 0,
          x: isHovered ? 15 : 0 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`w-44 h-5 ${color} rounded-t-full mb-1 shadow-md border-b-2 border-black/10 relative z-20`}
      >
        <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-12 h-2 bg-black/20 rounded-full"></div>
      </motion.div>

      {/* Bin Body - Width Increased to w-40 */}
      <div className={`relative w-40 h-32 ${color} rounded-b-[2rem] shadow-xl flex flex-col items-center justify-center border-t-4 border-black/5 overflow-hidden`}>
        {/* Bin Stripes */}
        <div className="absolute inset-0 flex justify-around opacity-10">
          <div className="w-1.5 h-full bg-black"></div>
          <div className="w-1.5 h-full bg-black"></div>
          <div className="w-1.5 h-full bg-black"></div>
          <div className="w-1.5 h-full bg-black"></div>
        </div>

        {/* Content Inside Bin */}
        <div className="z-10 flex flex-col items-center text-white px-2">
          <div className="bg-white/20 p-1.5 rounded-lg mb-1">
            <Icon size={18} className="opacity-90" />
          </div>
          {/* Font size adjusted for large numbers */}
          <h2 className="text-xl font-black tracking-tighter truncate w-full text-center">
            {value}
          </h2>
        </div>
      </div>

      {/* Glow effect at bottom */}
      <div className={`mt-4 w-20 h-2 bg-slate-900 opacity-10 blur-md rounded-full transition-all group-hover:opacity-30`}></div>
    </motion.div>
  );
};

// --- 2. Main Dashboard Page ---
const SADashboard = () => {
  const [data, setData] = useState({
    stats: { totalRevenue: 0, activeTenants: 0, totalHouseholds: 0 },
    chartData: [ 
      { date: 'Mon', count: 10 }, { date: 'Tue', count: 25 }, { date: 'Wed', count: 15 },
      { date: 'Thu', count: 40 }, { date: 'Fri', count: 30 }, { date: 'Sat', count: 50 }
    ]
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('https://saksham-backend-9719.onrender.com/api/super-admin/dashboard-realtime');
      const result = await res.json();
      if (result.success) {
        setData(prev => ({
          stats: result.stats,
          chartData: result.chartData.length > 0 ? result.chartData : prev.chartData
        }));
      }
    } catch (error) {
      console.log("Using Mock Data (Backend connection pending)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-12">
        <header>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Super Admin Command Center</h1>
          <p className="text-slate-400 text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Real-time Swachh Monitoring Active
          </p>
        </header>

        {/* 🟢 Dustbin Style Small Cards Grid - Adjusted spacing */}
        <div className="flex flex-wrap justify-center gap-12 lg:gap-20 bg-white p-12 rounded-[50px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
          <DustbinCard 
            label="Total Revenue" 
            value={`₹${data.stats.totalRevenue.toLocaleString()}`} 
            color="bg-emerald-500" 
            icon={IndianRupee} 
          />
          <DustbinCard 
            label="Active Cities" 
            value={data.stats.activeTenants} 
            color="bg-blue-500" 
            icon={Building2} 
          />
          <DustbinCard 
            label="Households" 
            value={data.stats.totalHouseholds.toLocaleString()} 
            color="bg-amber-500" 
            icon={Users} 
          />
        </div>

        {/* 📊 Animated Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-10 px-4">
            <div>
              <h3 className="text-xl font-black text-slate-800">Growth Analytics</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Platform registration trend</p>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 shadow-inner">
               <TrendingUp size={20} />
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#chartColor)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default SADashboard;