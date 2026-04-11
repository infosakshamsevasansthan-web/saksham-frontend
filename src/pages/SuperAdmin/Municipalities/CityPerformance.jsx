import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import { Trophy, Star, Activity, Trash2, Loader2 } from 'lucide-react';

const CityPerformance = () => {
  const [performanceList, setPerformanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const res = await fetch('https://saksham-backend-9719.onrender.com/api/super-admin/city-performance');
      const result = await res.json();
      if (result.success) {
        setPerformanceList(result.data);
      }
    } catch (err) {
      console.error("Performance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Agar data load ho raha hai
  if (loading) return (
    <AdminLayout>
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    </AdminLayout>
  );

  // Top 3 Winners nikalna
  const top3 = performanceList.slice(0, 3);
  const others = performanceList.slice(3);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Performance Leaderboard</h1>
          <p className="text-slate-400 font-bold text-xs uppercase mt-1">Real-time Swachh Survekshan Scorecard</p>
        </header>

        {performanceList.length > 0 ? (
          <>
            {/* 🏆 Top 3 Dynamic Winners */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {top3.map((city, index) => (
                <PerformanceCard 
                  key={city.id}
                  city={city.name} 
                  rank={index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"} 
                  score={city.score} 
                  color={index === 0 ? "text-emerald-500" : index === 1 ? "text-blue-500" : "text-amber-500"} 
                  icon={index === 0 ? Trophy : index === 1 ? Star : Activity} 
                />
              ))}
            </div>

            {/* 📊 Detailed Stats for Overall Top City */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-black text-lg text-slate-800">Operational Efficiency: {top3[0]?.name}</h3>
                <Trash2 size={20} className="text-emerald-500" />
              </div>
              <div className="p-8 space-y-8">
                <Progress StatName="Waste Collection Efficiency" value={top3[0]?.collectionEfficiency} color="bg-emerald-500" />
                <Progress StatName="Grievance Resolution Rate" value={top3[0]?.grievanceRate} color="bg-blue-500" />
              </div>
            </div>

            {/* 📋 List of Other Cities (Optional) */}
            {others.length > 0 && (
              <div className="mt-8 bg-white p-6 rounded-[30px] border border-slate-100">
                <h4 className="font-bold text-slate-400 uppercase text-xs mb-4 px-4 tracking-widest">Other Participating Cities</h4>
                {others.map((city, idx) => (
                   <div key={city.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                      <span className="font-bold text-slate-700">{idx + 4}. {city.name}</span>
                      <span className="font-black text-emerald-600">{city.score}%</span>
                   </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No active cities to rank yet!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// --- Sub Components ---

const PerformanceCard = ({ city, rank, score, color, icon: Icon }) => (
  <motion.div 
    whileHover={{ y: -10, scale: 1.02 }} 
    className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 text-center relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-20 h-20 ${color.replace('text', 'bg')} opacity-5 rounded-bl-full`}></div>
    <div className={`w-16 h-16 rounded-[25px] ${color} bg-opacity-10 mx-auto flex items-center justify-center mb-6 shadow-inner group-hover:rotate-12 transition-transform`}>
      <Icon size={32} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{rank} Place</p>
    <h3 className="text-2xl font-black text-slate-800 mb-1 truncate px-2">{city}</h3>
    <p className={`text-5xl font-black ${color} tracking-tighter`}>{score}%</p>
  </motion.div>
);

const Progress = ({ StatName, value, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
      <span>{StatName}</span>
      <span className={color.replace('bg', 'text')}>{value}%</span>
    </div>
    <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${value}%` }} 
        transition={{ duration: 2, ease: "easeOut" }} 
        className={`h-full ${color} rounded-full`}
      ></motion.div>
    </div>
  </div>
);

export default CityPerformance;