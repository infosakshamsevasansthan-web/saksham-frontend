import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    MessageSquare, AlertCircle, CheckCircle2, Clock, Plus, MapPin, 
    ChevronRight, Loader2, Headset, Settings, RefreshCcw, LayoutGrid, 
    Toolbox, User, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const GrievanceCenter = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ today: 0, pending: 0, solved: 0 });
    const [categories, setCategories] = useState([]);
    const [listData, setListData] = useState([]); // Unified list for Complaints or Requests
    const [loading, setLoading] = useState(true);
    
    // 🟢 Tab Logic: 'grievance' or 'service'
    const [activeTab, setActiveTab] = useState('grievance');

    // Default Filter Logic
    const [activeFilter, setActiveFilter] = useState({ 
        type: 'status', 
        value: 'Open', 
        label: 'All Pending / सभी लंबित' 
    });
    
    const tenantId = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id');

    const fetchData = useCallback(async () => {
        if (!tenantId) return toast.error("Session expired. Please login again.");
        
        setLoading(true);
        try {
            // Endpoints based on active tab
            const dashboardUrl = activeTab === 'grievance' 
                ? `https://saksham-backend-9719.onrender.com/api/admin/grievance/dashboard/${tenantId}`
                : `https://saksham-backend-9719.onrender.com/api/admin/service/dashboard/${tenantId}`;

            const listUrl = activeTab === 'grievance'
                ? `https://saksham-backend-9719.onrender.com/api/admin/grievance/list/${tenantId}`
                : `https://saksham-backend-9719.onrender.com/api/admin/service/list/${tenantId}`;

            const [dashRes, listRes] = await Promise.all([
                axios.get(dashboardUrl),
                axios.get(listUrl, {
                    params: {
                        filter_type: activeFilter.type,
                        filter_value: activeFilter.value
                    }
                })
            ]);
            
            if (dashRes.data.status) setStats(dashRes.data.status);
            if (dashRes.data.categories) setCategories(dashRes.data.categories);
            setListData(listRes.data.data || []);
            
        } catch (err) { 
            console.error("Fetch Error:", err);
            toast.error("Database connection failed!"); 
        } finally { 
            setLoading(false); 
        }
    }, [tenantId, activeFilter, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-rose-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-rose-200">
                            {activeTab === 'grievance' ? <Headset size={28} /> : <Toolbox size={28} />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none italic">
                                {activeTab === 'grievance' ? 'Grievance Center' : 'Service Command'}
                            </h1>
                            <p className="text-rose-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                                Citizen Redressal Engine
                            </p>
                        </div>
                    </div>

                    {/* 🟢 TAB SWITCHER */}
                    <div className="bg-slate-100 p-1.5 rounded-[22px] flex gap-1">
                        <button 
                            onClick={() => { setActiveTab('grievance'); setActiveFilter({type:'status', value:'Open', label:'All Pending Complaints'}); }}
                            className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'grievance' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Grievances
                        </button>
                        <button 
                            onClick={() => { setActiveTab('service'); setActiveFilter({type:'status', value:'Pending', label:'All Service Requests'}); }}
                            className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'service' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Services
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => navigate('/admin/complaints/settings')} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                            <Settings size={20}/>
                        </button>
                        <button onClick={fetchData} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-emerald-600 transition-all">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/>
                        </button>
                        <button 
                            onClick={() => navigate(activeTab === 'grievance' ? '/admin/complaints/add' : '/admin/services/new')} 
                            className="bg-slate-900 text-white px-8 py-4 rounded-[20px] font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-3 shadow-xl"
                        >
                            <Plus size={18}/> {activeTab === 'grievance' ? 'New Ticket' : 'Create Request'}
                        </button>
                    </div>
                </header>

                {/* --- STATUS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusCard 
                        label={activeTab === 'grievance' ? "Today's Grievances" : "Scheduled Today"} 
                        count={stats.today} icon={Clock} color="blue" 
                        onClick={() => setActiveFilter({type:'status', value: activeTab === 'grievance' ? 'Open' : 'Pending', label:"Today's List"})} 
                    />
                    <StatusCard 
                        label="Total Pending" count={stats.pending} icon={AlertCircle} color="rose" 
                        active={activeFilter.type === 'status' && (activeFilter.value === 'Open' || activeFilter.value === 'Pending')}
                        onClick={() => setActiveFilter({type:'status', value: activeTab === 'grievance' ? 'Open' : 'Pending', label:"All Pending Items"})} 
                    />
                    <StatusCard 
                        label="Work Completed" count={stats.solved} icon={CheckCircle2} color="emerald" 
                        active={activeFilter.value === 'Resolved' || activeFilter.value === 'Completed'}
                        onClick={() => setActiveFilter({type:'status', value: activeTab === 'grievance' ? 'Resolved' : 'Completed', label:"Success Records"})} 
                    />
                </div>

                {/* --- DYNAMIC TABLE --- */}
                <div className="bg-white rounded-[45px] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                        <div>
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{activeFilter.label}</span>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Live Monitor: {listData.length} entries</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"/>
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Hierarchy Sync</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="p-8">{activeTab === 'grievance' ? 'Citizen' : 'Requester'}</th>
                                    <th className="p-4">{activeTab === 'grievance' ? 'Grievance' : 'Service Info'}</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode='wait'>
                                {loading ? (
                                    <motion.tr initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><td colSpan="5" className="p-32 text-center text-rose-500"><Loader2 className="animate-spin mx-auto mb-4" size={40} /><p className="font-black text-xs uppercase tracking-widest opacity-50">Fetching Encrypted Data...</p></td></motion.tr>
                                ) : listData.length === 0 ? (
                                    <motion.tr initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><td colSpan="5" className="p-32 text-center text-slate-300 font-black uppercase text-sm tracking-[0.4em] italic opacity-50">Command Center Empty</td></motion.tr>
                                ) : listData.map((item, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={item.id} 
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{item.applicant_name || item.owner_name_en || 'Registered Citizen'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 tabular-nums">+91 {item.mobile}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] font-black uppercase tracking-tight px-2 py-0.5 rounded-md self-start border ${activeTab === 'grievance' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                                                    {activeTab === 'grievance' ? (item.type_name_en || 'Grievance') : (item.service_type || 'General Service')}
                                                </span>
                                                {activeTab === 'service' && (
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5 flex items-center gap-1">
                                                        <LayoutGrid size={10}/> Qty: {item.quantity_estimate || '1'} 
                                                        <Calendar size={10} className="ml-2"/> {item.scheduled_date}
                                                    </p>
                                                )}
                                                <p className="text-[10px] font-bold text-slate-500 line-clamp-1 max-w-[200px] leading-relaxed italic">
                                                    "{item.description || item.subject || 'Standard request submitted.'}"
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase">
                                                <MapPin size={14} className="text-emerald-500"/> Ward {item.ward_no}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 block ml-5 italic">Geo-Linked Entry</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 inline-block ${item.status === 'Open' || item.status === 'Pending' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <button 
                                                onClick={() => navigate(activeTab === 'grievance' ? `/admin/complaints/view/${item.id}` : `/admin/services/view/${item.id}`)}
                                                className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center gap-2 ml-auto"
                                            >
                                                Details <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </CityLayout>
    );
};

const StatusCard = ({ label, count, icon: Icon, color, onClick, active }) => {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600 border-blue-500 shadow-blue-50",
        rose: "bg-rose-50 text-rose-600 border-rose-500 shadow-rose-50",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-500 shadow-emerald-50"
    };

    return (
        <div 
            onClick={onClick}
            className={`p-6 rounded-[35px] border-2 cursor-pointer transition-all flex items-center gap-5 ${active ? `bg-white shadow-2xl -translate-y-1 ${colorMap[color].split(' ')[2]}` : 'border-transparent bg-white shadow-sm hover:border-slate-100 hover:-translate-y-1'}`}
        >
            <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`}>
                <Icon size={30} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
                <p className="text-3xl font-black text-slate-800 leading-none tabular-nums">{count || 0}</p>
            </div>
        </div>
    );
};

export default GrievanceCenter;
