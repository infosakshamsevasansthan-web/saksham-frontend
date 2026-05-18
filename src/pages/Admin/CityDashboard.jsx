import React, { useState, useEffect } from 'react';
import CityLayout from '../../components/layout/cityAdmin/CityLayout';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Users, Truck, AlertTriangle, Sparkles, 
  RefreshCcw, BrainCircuit, Activity, Zap, ShieldCheck, Globe 
} from 'lucide-react';

const CityDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    activeWards: 0, activeStaff: 0, totalVehicles: 0, openGrievances: 0,
    todayTonnage: 0, todayFuel: 0, wardsMap: []
  });
  const [loading, setLoading] = useState(true);
  const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

  const fetchStats = async () => {
    try {
      const res = await fetch(`https://saksham-backend-9719.onrender.com/api/admin/dashboard-realtime/${tenantId}`);
      const result = await res.json();
      if (result.success) {
        setData({
          ...result.stats, // Ye backend ke saare counts bharega
          wardsMap: result.wards // Ye map ke liye boundaries bharega
        });
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <CityLayout>
      <div className="space-y-10 font-sans antialiased">
        {/* --- HEADER SECTION --- */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">City Command Center</h1>
            <div className="text-emerald-600 font-bold flex items-center gap-2 mt-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase">Real-Time Swachh Monitoring</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ✨ SAKSHAM AI MAGIC BUTTON */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/reports/ai')}
              className="group relative flex items-center gap-3 bg-white p-1 pr-6 rounded-2xl shadow-xl border border-emerald-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:rotate-12 transition-transform">
                <BrainCircuit size={24} className="animate-pulse" />
              </div>
              <div className="text-left relative z-10">
                <p className="text-[10px] font-black text-emerald-600 uppercase leading-none tracking-widest">Ask Saksham</p>
                <p className="text-xs font-bold text-slate-700">AI Intelligence</p>
              </div>
            </motion.button>

            {/* RELOAD BUTTON */}
            <button 
              onClick={() => {setLoading(true); fetchStats();}}
              className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 hover:rotate-180 transition-all duration-700"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </header>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <CityStatPod label="Active Wards" value={data.total_wards} icon={MapPin} color="emerald" unit="Zones" />
           <CityStatPod label="Safai Mitras" value={data.total_staff} icon={Users} color="blue" unit="On-Field" />
           <CityStatPod label="SWM Fleet" value={data.total_vehicles} icon={Truck} color="amber" unit="Vehicles" />
           <CityStatPod label="Complaints" value={data.pending_complaints} icon={AlertTriangle} color="rose" unit="Pending" />
        </div>

        {/* --- OPERATIONAL PULSE & RESOURCE HEALTH --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Live Collection Pulse (Indigo-Purple) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[50px] p-8 text-white shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex justify-between items-start mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight italic">Operational Pulse</h3>
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-70">Today's Performance Analysis</p>
                        </div>
                    </div>
                    <div className="bg-emerald-400 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg">Live</div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Garbage Tonnage</p>
                        <h4 className="text-4xl font-black">{data.today_tonnage} <span className="text-sm font-bold opacity-60 uppercase">Tons</span></h4>
                        <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-emerald-400" transition={{ duration: 2 }} />
                        </div>
                    </div>
                    <div className="space-y-2 border-l border-white/10 pl-6 text-left">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Fuel Logs</p>
                        <h4 className="text-4xl font-black">{data.today_fuel} <span className="text-sm font-bold opacity-60 uppercase">Ltrs</span></h4>
                        <p className="text-[10px] text-indigo-200 italic font-medium">Optimal consumption</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[35px] border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={14} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase">System Score</span>
                        </div>
                        <h2 className="text-3xl font-black">94%</h2>
                        <p className="text-[9px] font-bold opacity-60">High Efficiency</p>
                    </div>
                </div>
            </motion.div>

            {/* Tenant Health Card (Orange-Rose) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-orange-400 to-rose-500 rounded-[50px] p-8 text-white shadow-2xl relative overflow-hidden"
            >
                <div className="relative z-10 text-left">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck size={28} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Tenant Health</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-white/20 pb-4">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">GIS Status</p>
                            <span className="text-[10px] bg-white/20 px-3 py-1 rounded-lg font-black uppercase">Active</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/20 pb-4">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Sync State</p>
                            <span className="text-[10px] bg-white/20 px-3 py-1 rounded-lg font-black uppercase">Online</span>
                        </div>
                    </div>

                    <button 
                      onClick={() => navigate('/admin/mapping')}
                      className="w-full mt-14 bg-white text-rose-500 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                    >
                        Review GIS Map
                    </button>
                </div>
            </motion.div>
        </div>

        {/* Operational Map Section */}
        {/* --- 🟢 REAL INTERACTIVE GIS MAP SECTION --- */}
        <div className="bg-white rounded-[55px] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-slate-900 rounded-2xl text-emerald-400 shadow-lg">
                        <Globe size={24}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase italic">Interactive GIS Ward Map</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Polygon Monitoring System</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase border border-emerald-100">
                        Live Coverage
                    </div>
                </div>
            </div>
            
            <div className="h-[500px] w-full relative z-0">
                <MapContainer center={[26.22, 84.36]} zoom={13} style={{height: '100%', width: '100%'}} zoomControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    
                    {data.wardsMap && data.wardsMap.map(ward => ward.boundary_coords && (
                        <Polygon 
                            key={ward.id}
                            positions={JSON.parse(ward.boundary_coords).map(c => [c[1], c[0]])}
                            pathOptions={{ 
                                color: '#6366f1', 
                                fillColor: '#6366f1', 
                                fillOpacity: 0.1, 
                                weight: 2 
                            }}
                        >
                            <Tooltip sticky>
                                <div className="p-2 font-black uppercase text-[10px] text-left">
                                    <p className="text-indigo-600">Ward No: {ward.ward_no}</p>
                                    <p className="text-slate-600">{ward.ward_name}</p>
                                </div>
                            </Tooltip>
                        </Polygon>
                    ))}
                </MapContainer>

                {/* Floating Legend */}
                <div className="absolute bottom-6 right-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white shadow-2xl">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Mapped Polygons</span>
                     </div>
                </div>
            </div>
        </div>
      </div>
      </CityLayout>
  );
};

// --- CREATIVE COMPONENT: CityStatPod ---
const CityStatPod = ({ label, value, icon: Icon, color, unit }) => {
  const colorMap = {
    emerald: "from-emerald-400 to-emerald-600 shadow-emerald-200",
    blue: "from-blue-400 to-blue-600 shadow-blue-200",
    amber: "from-amber-400 to-amber-600 shadow-amber-200",
    rose: "from-rose-400 to-rose-600 shadow-rose-200",
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="relative bg-white p-7 rounded-[45px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden group cursor-pointer"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
        <motion.div 
          animate={{ x: [-300, 500] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-32 h-full bg-white/40 skew-x-[-25deg] blur-2xl"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={`w-16 h-16 bg-gradient-to-br ${colorMap[color]} rounded-3xl flex items-center justify-center text-white shadow-2xl mb-6 group-hover:rotate-[15deg] transition-transform duration-700`}>
          <Icon size={32} />
        </div>

        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5 leading-none">{label}</p>
        
        <div className="flex items-baseline gap-1.5">
          <h2 className="text-5xl font-black text-slate-800 tracking-tighter tabular-nums leading-none">
            {value}
          </h2>
          <span className="text-[11px] font-bold text-slate-400 uppercase italic">{unit}</span>
        </div>

        <div className="mt-5 flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
           <Sparkles size={11} className="text-emerald-500 animate-pulse" />
           <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Validated</span>
        </div>
      </div>
      <div className={`absolute -bottom-10 -right-10 w-28 h-28 bg-${color}-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10`}></div>
    </motion.div>
  );
};

export default CityDashboard;
