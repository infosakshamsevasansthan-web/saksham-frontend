import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Megaphone, Video, Users, Share2, Camera, Plus, 
    RefreshCcw, Loader2, Calendar, MapPin, DollarSign, Image as ImageIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const IecDashboard = ({ defaultTab = 'Campaigns' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ campaigns: [], logs: [], media: [] });
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    useEffect(() => { fetchIECData(); }, [tenantId]);

    const fetchIECData = async () => {
        setLoading(true);
        try {
            // Yahan hum dashboard summary API call karenge
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/iec/dashboard/${tenantId}`);
            setData(res.data);
        } catch (err) { console.error("IEC Sync Error"); }
        finally { setLoading(false); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-slate-50 min-h-screen">
                
                {/* --- 🟢 TOP HEADER --- */}
                <header className="bg-white p-6 rounded-[35px] border border-slate-200 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                            <Megaphone size={30} className="animate-bounce" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase italic">IEC Intelligence HUD</h1>
                            <p className="text-orange-600 font-bold text-[9px] uppercase tracking-widest mt-1">Behavioral Change & Public Awareness</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchIECData} className="p-3 bg-slate-900 text-white rounded-xl active:scale-90 transition-all">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/>
                        </button>
                        <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg">
                            <Plus size={16}/> New Campaign
                        </button>
                    </div>
                </header>

                {/* --- 🟢 TABS NAVIGATION --- */}
                <div className="flex flex-wrap gap-2 bg-white p-2 rounded-[2rem] border border-slate-200 w-fit">
                    <TabBtn id="Campaigns" label="Awareness Programs" icon={Calendar} active={activeTab} set={setActiveTab} />
                    <TabBtn id="Media" label="Media & Creatives" icon={Video} active={activeTab} set={setActiveTab} />
                    <TabBtn id="Engagement" label="Jan Bhagidari" icon={Users} active={activeTab} set={setActiveTab} />
                    <TabBtn id="Digital" label="Digital Outreach" icon={Share2} active={activeTab} set={setActiveTab} />
                    <TabBtn id="Activity" label="Field Activity Logs" icon={Camera} active={activeTab} set={setActiveTab} />
                </div>

                {/* --- 🟢 MAIN CONTENT AREA --- */}
                <div className="bg-white rounded-[45px] p-8 border border-slate-100 shadow-xl min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Campaigns' && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} key="camp" className="space-y-6">
                                <h3 className="font-black uppercase text-xs text-slate-400 tracking-widest">Active & Planned Programs</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Map from data.campaigns */}
                                    <CampaignCard name="Plastic Mukt Siwan" type="Rally" ward="01" date="20-May-2026" status="Planned" />
                                    <CampaignCard name="Wet/Dry Segregation" type="Nukkad Natak" ward="12" date="Today" status="Ongoing" />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'Activity' && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} key="act" className="space-y-6">
                                <h3 className="font-black uppercase text-xs text-slate-400 tracking-widest">Live Ground Proofs (Mobile App Sync)</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="border-b">
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="p-4">Activity Info</th>
                                                <th className="p-4">Field Staff</th>
                                                <th className="p-4">Location Proof</th>
                                                <th className="p-4">Evidence</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            <ActivityRow staff="Rahul Kumar" ward="05" time="11:30 AM" desc="Posters pasted on Ward 5 main gate" />
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </CityLayout>
    );
};

// --- Sub-Components ---
const TabBtn = ({ id, label, icon: Icon, active, set }) => (
    <button 
        onClick={() => set(id)}
        className={`px-6 py-3 rounded-full flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter transition-all ${active === id ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
    >
        <Icon size={14}/> {label}
    </button>
);

const CampaignCard = ({ name, type, ward, date, status }) => (
    <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 hover:shadow-lg transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Megaphone size={80}/></div>
        <div className={`w-fit px-3 py-1 rounded-lg text-[8px] font-black uppercase mb-4 ${status === 'Ongoing' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
            {status}
        </div>
        <h4 className="text-lg font-black text-slate-800 uppercase leading-tight mb-4">{name}</h4>
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><MapPin size={12}/> WARD NO: {ward}</div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><Calendar size={12}/> DATE: {date}</div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><Users size={12}/> TYPE: {type}</div>
        </div>
    </div>
);

const ActivityRow = ({ staff, ward, time, desc }) => (
    <tr className="hover:bg-slate-50 transition-colors">
        <td className="p-4">
            <p className="text-xs font-bold text-slate-700">{desc}</p>
        </td>
        <td className="p-4">
            <p className="text-[10px] font-black uppercase text-slate-500">{staff}</p>
        </td>
        <td className="p-4">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black">WARD #{ward}</span>
        </td>
        <td className="p-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                <ImageIcon size={18}/>
            </div>
        </td>
    </tr>
);

export default IecDashboard;
