import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Navigation, Map, Navigation2, Zap, AlertTriangle, CheckCircle2, 
    Search, RefreshCcw, Loader2, ArrowRight, Fuel, Clock, User, Truck, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const RouteOptimization = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const tenantId = localStorage.getItem('tenantId');

    const fetchData = async (showToast = false) => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/routes/status/${tenantId}`);
            const data = res.data.data || [];
            setRoutes(data);
            if (data.length > 0 && !selectedRoute) setSelectedRoute(data[0]);
            if(showToast) toast.success("Logistics Updated");
        } catch (err) { 
            console.error("Fetch Error:", err);
            toast.error("Logistics sync failed - Check Backend"); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { 
        fetchData(); 
        const interval = setInterval(() => fetchData(false), 20000); // 20 sec sync
        return () => clearInterval(interval);
    }, [tenantId]);

    // Search Filtering Logic
    const filteredRoutes = routes.filter(r => 
        r.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.ward_no?.toString().includes(searchTerm)
    );

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-[#F8FAFC] min-h-screen">
                
                {/* --- 🟢 PRO HEADER --- */}
                <header className="flex flex-col md:flex-row items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg relative">
                            <Navigation size={28} />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Route Intelligence</h1>
                            <div className="flex items-center gap-2">
                                <Activity size={10} className="text-emerald-500" />
                                <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-[0.2em]">Live Logistics Management</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <StatusPill label="On Track" count={routes.filter(r=>r.live_status==='On-Track').length} color="emerald" />
                        <StatusPill label="Diverted" count={routes.filter(r=>r.live_status==='Diverted').length} color="rose" />
                        <button onClick={() => fetchData(true)} className="p-3 bg-white text-slate-600 rounded-xl hover:bg-emerald-500 hover:text-white shadow-sm transition-all active:scale-95">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* --- 🟢 LEFT: MASTER LIST (5 columns) --- */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-3 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                            <Search size={20} className="text-slate-300" />
                            <input 
                                type="text" 
                                placeholder="Search Route or Ward..." 
                                className="w-full bg-transparent outline-none font-bold text-xs uppercase"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {loading && routes.length === 0 ? (
                                <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
                            ) : filteredRoutes.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                                    <Map size={40} className="mx-auto text-slate-200 mb-2"/>
                                    <p className="text-slate-300 font-black uppercase text-[10px]">No Active Routes Found</p>
                                </div>
                            ) : filteredRoutes.map((r) => (
                                <RouteMiniCard 
                                    key={r.id} 
                                    route={r} 
                                    isActive={selectedRoute?.id === r.id} 
                                    onClick={() => setSelectedRoute(r)} 
                                />
                            ))}
                        </div>
                    </div>

                    {/* --- 🟢 RIGHT: ANALYTICS (8 columns) --- */}
                    <div className="lg:col-span-8 h-[calc(70vh+60px)]">
                        {selectedRoute ? (
                            <AnimatePresence mode='wait'>
                                <motion.div 
                                    key={selectedRoute.id}
                                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl h-full flex flex-col overflow-hidden"
                                >
                                    {/* Map Preview Area */}
                                    <div className="h-56 bg-slate-900 relative flex items-center justify-center">
                                        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                                        <div className="relative z-10 text-center text-white">
                                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                                                <Navigation2 size={40} className="text-emerald-400" />
                                            </div>
                                            <h2 className="text-xl font-black italic tracking-widest">{selectedRoute.route_name}</h2>
                                            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.3em] mt-1">Live Telematics Stream</p>
                                        </div>
                                        
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                             <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                                                 <Clock size={14} className="text-white/60"/>
                                                 <span className="text-[10px] font-black text-white uppercase">ETA: 14 Mins</span>
                                             </div>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 border-b border-slate-100">
                                        <Metric label="Fuel Efficiency" value={`${selectedRoute.fuel_efficiency_score || 0}%`} icon={Fuel} color="blue" />
                                        <Metric label="Route Adherence" value={`${selectedRoute.live_status === 'Diverted' ? '65%' : '98%'}`} icon={Activity} color="emerald" />
                                        <Metric label="Distance Cover" value={`${selectedRoute.actual_distance_km || 0} KM`} icon={Zap} color="amber" />
                                        <Metric label="Payload" value="1.2 Tons" icon={Truck} color="indigo" />
                                    </div>

                                    {/* Detailed Crew Info */}
                                    <div className="p-10 flex-1 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <h3 className="text-sm font-black text-slate-800 uppercase italic tracking-wider">Logistics Personnel</h3>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase font-mono">Trip: #RT-{selectedRoute.id}2026</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <PersonnelCard label="Commanding Driver" name={selectedRoute.driver_name} icon={<User size={20}/>} phone={selectedRoute.driver_phone} />
                                            <PersonnelCard label="SWM Vehicle Unit" name={selectedRoute.vehicle_no} icon={<Truck size={20}/>} phone="GPS: ACTIVE" color="emerald" />
                                        </div>

                                        {/* Visual Route Path */}
                                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-5"><Navigation size={100}/></div>
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="text-center group">
                                                    <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-2 mx-auto">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                                    </div>
                                                    <p className="text-[9px] font-black text-emerald-400 uppercase">DEPOT</p>
                                                    <p className="text-xs font-bold truncate w-24">{selectedRoute.start_point}</p>
                                                </div>
                                                <div className="flex-1 h-px bg-white/20 mx-4 border-t-2 border-dashed border-emerald-500/30" />
                                                <div className="text-center">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center mb-2 mx-auto text-slate-900 shadow-lg shadow-emerald-500/20">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <p className="text-[9px] font-black text-white uppercase">Ward {selectedRoute.ward_no}</p>
                                                </div>
                                                <div className="flex-1 h-px bg-white/20 mx-4 border-t-2 border-dashed border-white/10" />
                                                <div className="text-center opacity-40">
                                                    <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center mb-2 mx-auto">
                                                        <div className="w-2 h-2 rounded-full bg-white/20" />
                                                    </div>
                                                    <p className="text-[9px] font-black text-white/40 uppercase">DUMPING</p>
                                                    <p className="text-xs font-bold truncate w-24">{selectedRoute.end_point}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 p-20 text-center">
                                <div>
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                        <Navigation2 size={40} className="animate-bounce" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-300 uppercase italic">Awaiting Selection</h3>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase mt-2 tracking-widest">Select an active route to begin monitoring</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CityLayout>
    );
};

// --- Sub-Components ---

const RouteMiniCard = ({ route, isActive, onClick }) => (
    <div 
        onClick={onClick}
        className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 group ${isActive ? 'bg-slate-900 border-slate-900 shadow-2xl scale-[1.02] text-white' : 'bg-white border-white hover:border-slate-200 shadow-md'}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${isActive ? 'bg-emerald-500 text-slate-900' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 transition-colors'}`}>
                <Truck size={22} />
            </div>
            <div className="text-right">
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${route.live_status === 'Diverted' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {route.live_status || 'Pending'}
                </span>
                <p className={`text-[8px] font-bold mt-2 ${isActive ? 'text-white/40' : 'text-slate-400'}`}>Ward: {route.ward_no}</p>
            </div>
        </div>
        <h4 className="text-base font-black uppercase tracking-tight leading-tight">{route.route_name}</h4>
        
        <div className="mt-5 flex items-center justify-between gap-4">
             <div className="flex-1 h-1.5 bg-slate-100/10 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${route.fuel_efficiency_score || 0}%` }}
                    className={`h-full ${route.fuel_efficiency_score > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                />
             </div>
             <span className={`text-[10px] font-black ${isActive ? 'text-white' : 'text-slate-800'}`}>{route.fuel_efficiency_score || 0}%</span>
        </div>
    </div>
);

const Metric = ({ label, value, icon: Icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        indigo: 'bg-indigo-50 text-indigo-600'
    };
    return (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-left">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${colors[color]}`}>
                <Icon size={16}/>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-black text-slate-800 mt-1">{value}</p>
        </div>
    );
};

const PersonnelCard = ({ label, name, icon, phone, color="blue" }) => (
    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 hover:bg-white hover:shadow-lg transition-all group">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md bg-${color}-500 text-white group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-sm font-black text-slate-800 uppercase truncate">{name || 'Standby'}</p>
            <p className="text-[9px] font-bold text-emerald-600 mt-1">{phone || '---'}</p>
        </div>
    </div>
);

const StatusPill = ({ label, count, color }) => (
    <div className={`bg-white border border-slate-100 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm`}>
        <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 ${count > 0 ? 'animate-pulse' : 'opacity-20'}`} />
        <span className="text-[9px] font-black text-slate-400 uppercase">{label}: <span className="text-slate-800">{count}</span></span>
    </div>
);

const MapPin = ({size}) => <Activity size={size} />; 

export default RouteOptimization;
