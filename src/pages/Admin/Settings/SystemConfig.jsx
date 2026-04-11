import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Settings, Clock, ShieldCheck, BarChart3, BellRing, Save, Loader2, Info, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const SystemConfig = () => {
    const [activeTab, setActiveTab] = useState('Operations');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({});
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/config/${tenantId}`);
            const configObj = {};
            res.data.data.forEach(item => configObj[item.config_key] = item.config_value);
            setSettings(configObj);
        } catch (err) { toast.error("Configuration Load Error"); }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/admin/config/save', { tenant_id: tenantId, settings });
            toast.success("Settings Mapped to Database! 🚀");
        } catch (err) { toast.error("Save Operation Failed"); }
        finally { setLoading(false); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left max-w-7xl mx-auto">
                
                {/* --- MODERN HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[45px] shadow-sm border border-slate-100 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[22px] flex items-center justify-center text-emerald-400 shadow-2xl">
                            <Settings size={32} className="animate-spin-slow" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">System Control Hub</h1>
                            <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                                <Zap size={12} /> Master Parameters for {tenantId}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave} disabled={loading}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:shadow-2xl hover:shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                        Apply Global Changes
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* --- SIDEBAR NAVIGATION --- */}
                    <div className="space-y-3">
                        <TabButton id="Operations" icon={Clock} active={activeTab} set={setActiveTab} label="Shift & Timing" color="emerald" />
                        <TabButton id="Compliance" icon={ShieldCheck} active={activeTab} set={setActiveTab} label="SLA & Compliance" color="blue" />
                        <TabButton id="Benchmarks" icon={BarChart3} active={activeTab} set={setActiveTab} label="Waste Benchmarks" color="purple" />
                        <TabButton id="Alerts" icon={BellRing} active={activeTab} set={setActiveTab} label="Auto Notifications" color="rose" />
                        
                        <div className="mt-10 bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-all duration-700"></div>
                            <h4 className="font-black text-xs uppercase tracking-widest mb-3 relative z-10 flex items-center gap-2">
                                <Info size={14}/> Note
                            </h4>
                            <p className="text-[11px] font-bold leading-relaxed opacity-90 relative z-10">
                                Yahan badli gayi koi bhi setting real-time mein field workers ki mobile app aur live tracking ko affect karegi.
                            </p>
                        </div>
                    </div>

                    {/* --- DYNAMIC SETTINGS PANEL --- */}
                    <div className="lg:col-span-3 bg-white rounded-[60px] shadow-2xl border border-slate-50 p-12 min-h-[550px] relative overflow-hidden">
                        
                        <AnimatePresence mode="wait">
                            {activeTab === 'Operations' && (
                                <motion.div key="op" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                    <SectionHeading title="Operational Timings" desc="Define when your city beats start and end." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <InputBox label="Morning Shift Start" type="time" val={settings.morning_start} set={(v) => setSettings({...settings, morning_start: v})} />
                                        <InputBox label="Shift Closing Time" type="time" val={settings.morning_end} set={(v) => setSettings({...settings, morning_end: v})} />
                                        <InputBox label="Late Attendance Buffer (Mins)" type="number" val={settings.attendance_buffer} set={(v) => setSettings({...settings, attendance_buffer: v})} />
                                        <InputBox label="Live Tracking Sync Interval (Sec)" type="number" val={settings.sync_interval} set={(v) => setSettings({...settings, sync_interval: v})} />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Compliance' && (
                                <motion.div key="comp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                    <SectionHeading title="SLA & Redressal Rules" desc="Resolution deadlines for citizen grievances." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <InputBox label="Standard Resolution Time (Hours)" type="number" val={settings.grievance_sla_hours} set={(v) => setSettings({...settings, grievance_sla_hours: v})} />
                                        <InputBox label="Escalation Trigger Time (Hours)" type="number" val={settings.escalation_time} set={(v) => setSettings({...settings, escalation_time: v})} />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Benchmarks' && (
                                <motion.div key="bench" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                    <SectionHeading title="Quality Benchmarks" desc="Set waste segregation and cleanliness targets." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <InputBox label="Min. Segregation Target (%)" type="number" val={settings.target_segregation} set={(v) => setSettings({...settings, target_segregation: v})} />
                                        <InputBox label="GVP Cleaning Cycle (Times/Day)" type="number" val={settings.gvp_clearance_freq} set={(v) => setSettings({...settings, gvp_clearance_freq: v})} />
                                        <InputBox label="Min. Weight per HHD (KG)" type="number" step="0.1" val={settings.min_hhd_weight} set={(v) => setSettings({...settings, min_hhd_weight: v})} />
                                        <InputBox label="Route Deviation Tolerance (Meters)" type="number" val={settings.route_tolerance} set={(v) => setSettings({...settings, route_tolerance: v})} />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Alerts' && (
                                <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                    <SectionHeading title="Automated Alerts" desc="Configure when the system should notify the team." />
                                    <div className="space-y-6">
                                        <ToggleRow label="Alert Inspector on Vehicle Breakdown" active={settings.breakdown_alert === 'true'} set={(v) => setSettings({...settings, breakdown_alert: v.toString()})} />
                                        <ToggleRow label="Notify Admin on Low Collection (<50%)" active={settings.low_coll_alert === 'true'} set={(v) => setSettings({...settings, low_coll_alert: v.toString()})} />
                                        <ToggleRow label="Enable Biometric Attendance Sync" active={settings.biometric_sync === 'true'} set={(v) => setSettings({...settings, biometric_sync: v.toString()})} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-spin-slow { animation: spin 8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </CityLayout>
    );
};

// --- HELPER UI COMPONENTS ---

const TabButton = ({ id, icon: Icon, active, set, label, color }) => {
    const activeStyles = {
        emerald: "bg-emerald-600 text-white shadow-emerald-100",
        blue: "bg-blue-600 text-white shadow-blue-100",
        purple: "bg-purple-600 text-white shadow-purple-100",
        rose: "bg-rose-600 text-white shadow-rose-100"
    };
    return (
        <button 
            onClick={() => set(id)}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg ${active === id ? `${activeStyles[color]} -translate-x-2` : 'bg-white text-slate-400 hover:bg-slate-50'}`}
        >
            <Icon size={18} />
            {label}
        </button>
    );
};

const SectionHeading = ({ title, desc }) => (
    <div className="border-b border-slate-100 pb-6">
        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">{title}</h3>
        <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">{desc}</p>
    </div>
);

const InputBox = ({ label, type, val, set, step }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
            <Target size={12} className="text-emerald-500" /> {label}
        </label>
        <input 
            type={type} step={step} value={val || ''} onChange={(e) => set(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl outline-none focus:border-emerald-500/40 focus:bg-white font-bold text-slate-700 transition-all text-sm"
        />
    </div>
);

const ToggleRow = ({ label, active, set }) => (
    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[35px] border border-slate-100 hover:bg-white transition-all group">
        <span className="text-xs font-black text-slate-600 uppercase tracking-tight group-hover:text-slate-900">{label}</span>
        <button 
            onClick={() => set(!active)}
            className={`w-16 h-9 rounded-full relative transition-all duration-500 shadow-inner ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
            <div className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-500 ${active ? 'left-8' : 'left-1'}`} />
        </button>
    </div>
);

export default SystemConfig;