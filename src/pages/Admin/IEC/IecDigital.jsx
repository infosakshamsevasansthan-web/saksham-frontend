import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Send, MessageSquare, Bell, Share2, Smartphone, Users, 
    History, CheckCircle2, ListChecks, RefreshCcw, Loader2, Zap, Layout
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const IecDigital = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [formData, setFormData] = useState({ channel: 'WhatsApp', ward: 'All', message: '' });
    
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    useEffect(() => { fetchLogs(); }, [tenantId]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/iec/outreach/logs/${tenantId}`);
            setLogs(res.data.data || []);
        } catch (err) { console.log("Outreach sync error"); }
        finally { setLoading(false); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/iec/outreach/send', { ...formData, tenant_id: tenantId });
            toast.success("Messages Queue-ed Successfully! 🚀");
            fetchLogs();
            setFormData({ ...formData, message: '' });
        } catch (e) { toast.error("Sending Failed"); }
        finally { setSending(false); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-slate-50 min-h-screen font-sans">
                
                {/* --- 🟢 HEADER --- */}
                <header className="bg-white p-6 rounded-[35px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-100">
                            <Share2 size={30} className="animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase italic">Digital Outreach</h1>
                            <p className="text-sky-600 font-bold text-[9px] uppercase tracking-widest mt-1">Smart Mass Communication Hub</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100 flex flex-col justify-center">
                        <p className="text-[7px] font-black text-slate-400 uppercase">Gateway Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-black text-slate-700 uppercase">API Connected</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- 🟢 CAMPAIGN CONSOLE (5 Columns) --- */}
                    <div className="lg:col-span-5 bg-white p-8 rounded-[45px] border border-slate-100 shadow-xl">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Zap size={18} className="text-sky-500" /> Launch New Alert
                        </h3>
                        
                        <form onSubmit={handleSend} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Channel</label>
                                    <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-sky-500/20" 
                                        value={formData.channel} onChange={(e)=>setFormData({...formData, channel: e.target.value})}>
                                        <option>WhatsApp</option><option>SMS Alert</option><option>App Push</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Target Ward</label>
                                    <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none"
                                        value={formData.ward} onChange={(e)=>setFormData({...formData, ward: e.target.value})}>
                                        <option value="All">All City Wards</option>
                                        <option value="1">Ward 01</option>
                                        <option value="2">Ward 02</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Message Intelligence (Hindi/English)</label>
                                <textarea 
                                    rows="6" required
                                    className="w-full p-6 bg-slate-50 border-none rounded-[2.5rem] font-bold text-sm outline-none focus:ring-2 focus:ring-sky-500/20 placeholder:text-slate-300"
                                    placeholder="Type your message here..."
                                    value={formData.message}
                                    onChange={(e)=>setFormData({...formData, message: e.target.value})}
                                ></textarea>
                            </div>

                            <button 
                                type="submit" disabled={sending}
                                className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-sky-600 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="animate-spin" /> : <Send size={18} />} Blast Outreach
                            </button>
                        </form>
                    </div>

                    {/* --- 🟢 OUTREACH LOGS (7 Columns) --- */}
                    <div className="lg:col-span-7 bg-white rounded-[45px] border border-slate-100 shadow-sm flex flex-col h-[650px] overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-3">
                                <History size={18} className="text-slate-400" /> Recent Campaign History
                            </h3>
                            <button onClick={fetchLogs} className="p-2 text-slate-400 hover:text-sky-500 transition-all"><RefreshCcw size={18}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-white sticky top-0 border-b z-10">
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-6">Channel / Target</th>
                                        <th className="p-4">Message Preview</th>
                                        <th className="p-4">Recipients</th>
                                        <th className="p-4">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-sky-500" /></td></tr>
                                    ) : logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-sky-50/30 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${log.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {log.channel === 'WhatsApp' ? <MessageSquare size={14}/> : <Bell size={14}/>}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-700 text-xs">{log.channel}</p>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase">{log.target_ward_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-[11px] font-bold text-slate-600 line-clamp-2 italic w-48">"{log.message_body}"</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-800">{log.total_recipients}</span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-[10px] font-black text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </CityLayout>
    );
};

export default IecDigital;
