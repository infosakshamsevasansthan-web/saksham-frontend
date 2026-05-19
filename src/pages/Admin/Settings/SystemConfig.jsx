import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Settings, Clock, ShieldCheck, BarChart3, BellRing, Save, Loader2, Info, Zap, Target, Map, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const SystemConfig = () => {
    const [activeTab, setActiveTab] = useState('Operations');
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    
    // 🧠 SMART LOGIC: Pre-defined keys for zero errors
    const [settings, setSettings] = useState({
        morning_start: '06:00', morning_end: '14:00', attendance_buffer: '15', sync_interval: '30',
        geofence_radius: '150', grievance_sla_hours: '24', escalation_time: '48',
        target_segregation: '80', gvp_clearance_freq: '2', min_hhd_weight: '0.5',
        route_tolerance: '100', breakdown_alert: 'false', low_coll_alert: 'true', 
        biometric_sync: 'false', holiday_mode: 'false'
    });

    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    useEffect(() => { fetchSettings(); }, [tenantId]);

    const fetchSettings = async () => {
        setIsFetching(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/config/${tenantId}`);
            if (res.data.success && res.data.data.length > 0) {
                const fetchedObj = {};
                res.data.data.forEach(item => fetchedObj[item.config_key] = item.config_value);
                setSettings(prev => ({ ...prev, ...fetchedObj }));
            }
        } catch (err) {
            console.error("Config Load Fail");
        } finally { setIsFetching(false); }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/config/save', { 
                tenant_id: tenantId, 
                settings 
            });
            toast.success("Global Parameters Synced! 🚀");
        } catch (err) { 
            toast.error("Cloud Save Failed"); 
        } finally { setLoading(false); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left max-w-7xl mx-auto">
                
                {/* --- PRO HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[45px] shadow-xl border border-slate-100 gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-18 h-18 bg-slate-900 rounded-[28px] flex items-center justify-center text-emerald-400 shadow-2xl relative">
                            <Settings size={36} className={loading ? 'animate-spin' : ''} />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">System Control Hub</h1>
                            <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                                <Cpu size={12} /> Master Neural Configuration for {tenantId}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave} disabled={loading || isFetching}
                        className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 shadow-2xl"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                        Authorize Changes
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* --- NAVIGATION --- */}
                    <div className="space-y-3">
                        <TabButton id="Operations" icon={Clock} active={activeTab} set={setActiveTab} label="Time & Sync" color="emerald" />
                        <TabButton id="Compliance" icon={ShieldCheck} active={activeTab} set={setActiveTab} label="SLA & Rules" color="blue" />
                        <TabButton id="Benchmarks" icon={BarChart3} active={activeTab} set={setActiveTab} label="SWM Targets" color="purple" />
                        <TabButton id="Alerts" icon={BellRing} active={activeTab} set={setActiveTab} label="AI Alerts" color="rose" />
                        
                        <div className="mt-10 bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-all duration-700"></div>
                            <h4 className="font-black text-xs uppercase tracking-widest mb-3 relative z-10 flex items-center gap-2"><Info size={14}/> Intelligence Note</h4>
                            <p className="text-[11px] font-bold leading-relaxed opacity-95 relative z-10">
                                Yahan badla gaya "Sync Interval" seedha mobile battery aur tracking accuracy par asar dalega. Optimize karein!
                            </p>
                        </div>
                    </div>

                    {/* --- MAIN PANEL --- */}
                    <div className="lg:col-span-3 bg-white rounded-[60px] shadow-2xl border border-slate-50 p-12 min-h-[600px] relative">
                        {isFetching && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-[60px]">
                                <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Cloud Config...</p>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {activeTab === 'Operations' && (
                                <motion.div key="op" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <SectionHeading title="Operational Timings" desc="Shift boundaries and real-time data frequency." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <InputBox label="Morning Shift Start" type="time" val={settings.morning_start} set={(v) => setSettings({...settings, morning_start: v})} />
                                        <InputBox label="Shift Closing Time" type="time" val={settings.morning_end} set={(v) => setSettings({...settings, morning_end: v})} />
                                        <InputBox label="Geofence Radius (Mtrs)" type="number" val={settings.geofence_radius} set={(v) => setSettings({...settings, geofence_radius: v})} />
                                        <InputBox label="GPS Ping Interval (Sec)" type="number" val={settings.sync_interval} set={(v) => setSettings({...settings, sync_interval: v})} />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Compliance' && (
                                <motion.div key="comp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <SectionHeading title="SLA & Governance" desc="Resolution deadlines and escalation matrix." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <InputBox label="Grievance SLA (Hours)" type="number" val={settings.grievance_sla_hours} set={(v) => setSettings({...settings, grievance_sla_hours: v})} />
                                        <InputBox label="Escalation Limit (Hours)" type="number" val={settings.escalation_time} set={(v) => setSettings({...settings, escalation_time: v})} />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Benchmarks' && (
                                <motion.div key="bench" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <SectionHeading title="SWM Performance" desc="Set benchmarks for waste collection quality." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <InputBox label="Segregation Target (%)" type="number" val={settings.target_segregation} set={(v) => setSettings({...settings, target_segregation: v})} />
                                        <InputBox label="Daily GVP Clearance" type="number" val={settings.gvp_clearance_freq} set={(v) => setSettings({...settings, gvp_clearance_freq: v})} />
                                        <InputBox label="Min Household Weight (KG)" type="number" step="0.1" val={settings.min_hhd_weight} set={(v) => setSettings({...settings, min_hhd_weight: v})} />
                                        <InputBox label="GPS Drift Tolerance" type="number" val={settings.route_tolerance} set={(v) => setSettings({...settings, route_tolerance: v})} />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Alerts' && (
                                <motion.div key="alerts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <SectionHeading title="System Automation" desc="Enable or disable automated smart alerts." />
                                    <div className="space-y-4 mt-8">
                                        <ToggleRow label="Alert Inspector on Vehicle Breakdown" active={settings.breakdown_alert === 'true'} set={(v) => setSettings({...settings, breakdown_alert: v.toString()})} />
                                        <ToggleRow label="Notify Admin on Low Collection (<50%)" active={settings.low_coll_alert === 'true'} set={(v) => setSettings({...settings, low_coll_alert: v.toString()})} />
                                        <ToggleRow label="Enable Public Holiday Operations Mode" active={settings.holiday_mode === 'true'} set={(v) => setSettings({...settings, holiday_mode: v.toString()})} />
                                        <ToggleRow label="Automatic Biometric Payroll Sync" active={settings.biometric_sync === 'true'} set={(v) => setSettings({...settings, biometric_sync: v.toString()})} />
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
            `}</style>
        </CityLayout>
    );
};

// --- COMPONENTS ---

const TabButton = ({ id, icon: Icon, active, set, label, color }) => {
    const clr = { emerald: 'bg-emerald-600', blue: 'bg-blue-600', purple: 'bg-purple-600', rose: 'bg-rose-600' };
    return (
        <button 
            onClick={() => set(id)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg ${active === id ? `${clr[color]} text-white -translate-x-2` : 'bg-white text-slate-400 hover:bg-slate-50'}`}
        >
            <div className="flex items-center gap-4"><Icon size={18} /> {label}</div>
            {active === id && <ChevronRight size={14} />}
        </button>
    );
};

const SectionHeading = ({ title, desc }) => (
    <div className="border-b border-slate-100 pb-8 text-left">
        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">{title}</h3>
        <p className="text-emerald-600 font-bold text-[10px] mt-2 uppercase tracking-[0.2em]">{desc}</p>
    </div>
);

const InputBox = ({ label, type, val, set, step }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
            <Target size={12} className="text-emerald-500" /> {label}
        </label>
        <input 
            type={type} step={step} value={val || ''} onChange={(e) => set(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[2rem] outline-none focus:border-emerald-500 focus:bg-white font-black text-slate-800 transition-all text-sm shadow-inner"
        />
    </div>
);

const ToggleRow = ({ label, active, set }) => (
    <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[45px] border border-slate-100 hover:bg-white transition-all shadow-sm group">
        <span className="text-sm font-black text-slate-600 uppercase tracking-tight group-hover:text-slate-900">{label}</span>
        <button 
            onClick={() => set(!active)}
            className={`w-16 h-9 rounded-full relative transition-all duration-500 ${active ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}
        >
            <div className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-all duration-500 ${active ? 'left-8' : 'left-1'}`} />
        </button>
    </div>
);

const ChevronRight = ({size}) => <ShieldAlert size={size} className="opacity-40" />; 

export default SystemConfig;
