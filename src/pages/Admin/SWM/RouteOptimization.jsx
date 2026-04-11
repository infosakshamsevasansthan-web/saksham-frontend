import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Navigation, Map, Navigation2, Zap, AlertTriangle, CheckCircle2, Search, Filter, RefreshCcw, Loader2, ArrowRight, Fuel, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const RouteOptimization = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const tenantId = localStorage.getItem('tenantId');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/routes/status/${tenantId}`);
            setRoutes(res.data.data || []);
            if (res.data.data.length > 0) setSelectedRoute(res.data.data[0]);
        } catch (err) { 
            console.error("Fetch Error:", err);
            toast.error("Logistics sync failed"); 
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-[#F8FAFC] min-h-screen">
                
                {/* --- 🟢 COMPACT HEADER --- */}
                <header className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 shadow-lg">
                            <Navigation size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase italic leading-none">Route Intelligence</h1>
                            <p className="text-emerald-600 font-bold text-[8px] uppercase tracking-widest mt-1">AI-Powered Logistics Control</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <StatusPill label="On Track" count={routes.filter(r=>r.live_status==='On-Track').length} color="emerald" />
                        <StatusPill label="Diverted" count={routes.filter(r=>r.live_status==='Diverted').length} color="rose" />
                        <button onClick={fetchData} className="p-2.5 bg-slate-100 rounded-xl hover:bg-emerald-50 transition-all"><RefreshCcw size={18}/></button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* --- 🟢 LEFT: ROUTE MASTER LIST (5 columns) --- */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                            <Search size={18} className="text-slate-300" />
                            <input type="text" placeholder="Filter active routes..." className="w-full bg-transparent outline-none font-bold text-xs uppercase" />
                        </div>

                        <div className="space-y-4 h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
                            ) : routes.length === 0 ? (
                                <div className="text-center py-20 text-slate-300 font-black uppercase text-xs">No Routes Defined</div>
                            ) : routes.map((r) => (
                                <RouteMiniCard 
                                    key={r.id} 
                                    route={r} 
                                    isActive={selectedRoute?.id === r.id} 
                                    onClick={() => setSelectedRoute(r)} 
                                />
                            ))}
                        </div>
                    </div>

                    {/* --- 🟢 RIGHT: ROUTE DRILLDOWN & ANALYTICS (7 columns) --- */}
                    <div className="lg:col-span-7 space-y-6">
                        {selectedRoute ? (
                            <AnimatePresence mode='wait'>
                                <motion.div 
                                    key={selectedRoute.id}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full"
                                >
                                    {/* 1. Route Map Preview Header */}
                                    <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                                        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
                                        <div className="relative z-10 text-center">
                                            <Map size={48} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">GIS Route Preview: Ward {selectedRoute.ward_no}</p>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                            <span className="text-[9px] font-black text-slate-700 uppercase">Live Tracking Enabled</span>
                                        </div>
                                    </div>

                                    {/* 2. Efficiency Metrics Grid */}
                                    <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-6 border-b border-slate-50">
                                        <Metric label="Fuel Efficiency" value={`${selectedRoute.fuel_efficiency_score || 0}%`} icon={Fuel} color="blue" />
                                        <Metric label="Distance Cover" value={`${selectedRoute.actual_distance_km || 0} / ${selectedRoute.estimated_distance_km} KM`} icon={Zap} color="emerald" />
                                        <Metric label="Completion" value={`${selectedRoute.live_status || 'Pending'}`} icon={CheckCircle2} color="amber" />
                                    </div>

                                    {/* 3. Detailed Journey Logic */}
                                    <div className="p-8 flex-1 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-slate-800 uppercase italic">Active Crew & Vehicle</h3>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Trip ID: #RO-99{selectedRoute.id}</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Driver in Command</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400"><User size={20}/></div>
                                                    <p className="text-sm font-black text-slate-700 uppercase">{selectedRoute.driver_name || 'NOT ASSIGNED'}</p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Assigned Unit</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-600"><Truck size={20}/></div>
                                                    <p className="text-sm font-black text-slate-700 uppercase">{selectedRoute.vehicle_no || 'STANDBY'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Journey Timeline */}
                                        <div className="pt-4">
                                            <div className="flex items-center gap-6 justify-center">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Origin</p>
                                                    <p className="text-xs font-bold text-slate-700">{selectedRoute.start_point}</p>
                                                </div>
                                                <ArrowRight className="text-emerald-500" size={24} />
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Ward Focus</p>
                                                    <p className="text-xs font-bold text-slate-700">Ward No: {selectedRoute.ward_no}</p>
                                                </div>
                                                <ArrowRight className="text-emerald-500" size={24} />
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Destination</p>
                                                    <p className="text-xs font-bold text-slate-700">{selectedRoute.end_point}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-white rounded-[40px] border border-dashed border-slate-200">
                                <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Select a route to view intelligence</p>
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
        className={`p-5 rounded-[30px] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${isActive ? 'bg-emerald-50 border-emerald-500 shadow-lg' : 'bg-white border-white hover:border-slate-200 shadow-sm'}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                <Navigation2 size={20} />
            </div>
            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${route.live_status === 'Diverted' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                {route.live_status || 'Pending'}
            </span>
        </div>
        <h4 className="text-sm font-black text-slate-800 uppercase leading-none">{route.route_name}</h4>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">Target Distance: {route.estimated_distance_km} KM</p>
        
        {/* Efficiency bar tiny */}
        <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${route.fuel_efficiency_score || 0}%` }} className="h-full bg-emerald-500" />
        </div>
    </div>
);

const Metric = ({ label, value, icon: Icon, color }) => (
    <div className="text-left space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-${color}-50 text-${color}-600`}><Icon size={14}/></div>
            <p className="text-sm font-black text-slate-800">{value}</p>
        </div>
    </div>
);

const StatusPill = ({ label, count, color }) => (
    <div className={`bg-white border border-slate-200 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm`}>
        <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 animate-pulse`} />
        <span className="text-[9px] font-black text-slate-400 uppercase">{label}: {count}</span>
    </div>
);

const Truck = ({size}) => <Map size={size} />; // Simple fallback to avoid icon missing

export default RouteOptimization;