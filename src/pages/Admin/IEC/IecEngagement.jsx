import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Trophy, Users, Star, Gift, Calendar, MapPin, 
    Plus, RefreshCcw, Loader2, Award, TrendingUp, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const IecEngagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    useEffect(() => { fetchEngagement(); }, [tenantId]);

    const fetchEngagement = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/iec/engagement/${tenantId}`);
            setEvents(res.data.data || []);
        } catch (err) { toast.error("Events load karne mein dikkat aayi"); }
        finally { setLoading(false); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-slate-50 min-h-screen">
                
                {/* --- 🟢 HEADER --- */}
                <header className="bg-white p-6 rounded-[35px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Trophy size={30} className="animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase italic">Jan Bhagidari Hub</h1>
                            <p className="text-indigo-600 font-bold text-[9px] uppercase tracking-widest mt-1">Community Engagement & Rewards</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchEngagement} className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:text-indigo-600 transition-all shadow-inner">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/>
                        </button>
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-slate-900 transition-all">
                            <Plus size={16}/> Create Contest
                        </button>
                    </div>
                </header>

                {/* --- 🟢 STATS ROW --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryBox label="Total Participants" value="1,240+" icon={Users} color="blue" />
                    <SummaryBox label="Wards Engaged" value="18/25" icon={MapPin} color="emerald" />
                    <SummaryBox label="Active Contests" value="03" icon={Star} color="amber" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- 🟢 LEADERBOARD (6 Columns) --- */}
                    <div className="lg:col-span-7 bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm flex flex-col">
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6 flex items-center gap-3">
                            <TrendingUp size={18} className="text-emerald-500" /> Ward Performance Ranking
                        </h3>
                        <div className="space-y-4 flex-1 overflow-auto custom-scrollbar">
                            <RankRow rank="01" ward="Ward 01" score="98.5" status="Leader" color="text-emerald-600" />
                            <RankRow rank="02" ward="Ward 12" score="94.2" status="Rising" color="text-blue-600" />
                            <RankRow rank="03" ward="Ward 05" score="89.8" status="Steady" color="text-amber-600" />
                            <RankRow rank="04" ward="Ward 03" score="85.1" status="Steady" color="text-slate-400" />
                        </div>
                    </div>

                    {/* --- 🟢 RECENT WINNERS / REWARDS (5 Columns) --- */}
                    <div className="lg:col-span-5 bg-slate-900 p-8 rounded-[45px] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Award size={200}/></div>
                        <h3 className="text-sm font-black uppercase italic mb-8 flex items-center gap-3 relative z-10">
                            <Gift className="text-amber-400" /> Recent Winners & Awards
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {loading ? (
                                <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-400" /></div>
                            ) : events.filter(e => e.winner_name).map((e) => (
                                <div key={e.id} className="bg-white/5 p-5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all flex justify-between items-center group">
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">{e.event_name}</p>
                                        <h4 className="text-sm font-black uppercase">{e.winner_name}</h4>
                                        <p className="text-[9px] text-slate-400 italic mt-1">{e.reward_details}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 shadow-lg group-hover:scale-110 transition-transform">
                                        <Star size={18} fill="currentColor" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </CityLayout>
    );
};

// --- Helper Components ---
const SummaryBox = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
        <div className={`w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-${color}-600 group-hover:text-white transition-all duration-500`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-3xl font-black text-slate-800">{value}</h4>
        </div>
    </div>
);

const RankRow = ({ rank, ward, score, status, color }) => (
    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white transition-all group">
        <div className="flex items-center gap-5">
            <span className="text-lg font-black text-slate-300 group-hover:text-indigo-600 transition-colors">#{rank}</span>
            <div>
                <p className="text-sm font-black text-slate-800 uppercase">{ward}</p>
                <p className={`text-[9px] font-bold uppercase ${color}`}>{status}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-lg font-black text-slate-800 tabular-nums">{score}</p>
            <p className="text-[8px] font-black text-slate-400 uppercase">Cleanliness Index</p>
        </div>
    </div>
);

export default IecEngagement;
