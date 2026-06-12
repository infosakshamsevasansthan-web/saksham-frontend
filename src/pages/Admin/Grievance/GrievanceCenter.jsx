import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    MessageSquare, AlertCircle, CheckCircle2, Clock, Plus, MapPin, 
    ChevronRight, Loader2, Headset, Settings, RefreshCcw, LayoutGrid, 
    Toolbox, User, Calendar, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const GrievanceCenter = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ today: 0, pending: 0, solved: 0 });
    const [categories, setCategories] = useState([]);
    const [listData, setListData] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // 🟢 Master State: Tab Switching
    const [activeTab, setActiveTab] = useState('grievance'); // 'grievance' or 'service'

    // Filter Logic
    const [activeFilter, setActiveFilter] = useState({ 
        type: 'status', 
        value: 'Open', 
        label: 'All Pending / सभी लंबित' 
    });
    
    const tenantId = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id');

    const fetchData = useCallback(async () => {
        if (!tenantId) return toast.error("Session expired.");
        
        setLoading(true);
        try {
            // Dynamic Endpoints
            const prefix = activeTab === 'grievance' ? 'grievance' : 'service';
            const dashboardUrl = `https://saksham-backend-9719.onrender.com/api/admin/${prefix}/dashboard/${tenantId}`;
            const listUrl = `https://saksham-backend-9719.onrender.com/api/admin/${prefix}/list/${tenantId}`;

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
            toast.error("Network sync failed!"); 
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
            <div className="p-6 space-y-8 text-left bg-slate-50/50 min-h-screen">
                
                {/* --- 1. PRO HEADER WITH TOGGLE --- */}
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${activeTab === 'grievance' ? 'bg-rose-600 shadow-rose-200 rotate-0' : 'bg-emerald-600 shadow-emerald-200 rotate-[360deg]'}`}>
                            {activeTab === 'grievance' ? <Headset size={32} /> : <Toolbox size={32} />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none italic">
                                {activeTab === 'grievance' ? 'Citizen Redressal' : 'Service Requests'}
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${activeTab === 'grievance' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Command Center Active</p>
                            </div>
                        </div>
                    </div>

                    {/* 🟢 STYLISH TOGGLE TAB (The Controller) */}
                    <div className="bg-slate-100 p-1.5 rounded-[26px] flex items-center w-full lg:w-auto shadow-inner">
                        <button 
                            onClick={() => {
                                setActiveTab('grievance');
                                setActiveFilter({ type: 'status', value: 'Open', label: 'All Pending Complaints' });
                            }}
                            className={`flex-1 lg:flex-none px-10 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'grievance' ? 'bg-white text-rose-600 shadow-lg scale-100' : 'text-slate-500 hover:bg-slate-200/50'}`}
                        >
                            <MessageSquare size={16}/> Grievances
                        </button>
                        <button 
                            onClick={() => {
                                setActiveTab('service');
                                setActiveFilter({ type: 'status', value: 'Pending', label: 'All Service Requests' });
                            }}
                            className={`flex-1 lg:flex-none px-10 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'service' ? 'bg-white text-emerald-600 shadow-lg scale-100' : 'text-slate-500 hover:bg-slate-200/50'}`}
                        >
                            <LayoutGrid size={16}/> Services
                        </button>
                    </div>

                    <div className="flex gap-3 w-full lg:w-auto">
                        <button onClick={fetchData} className="flex-1 lg:flex-none p-5 bg-slate-50 text-slate-400 rounded-3xl hover:text-emerald-600 transition-all border border-slate-100">
                            <RefreshCcw size={22} className={loading ? 'animate-spin' : ''}/>
                        </button>
                        <button 
                            onClick={() => navigate(activeTab === 'grievance' ? '/admin/complaints/add' : '/admin/services/new')}
                            className={`flex-1 lg:flex-none px-10 py-5 rounded-[25px] font-black text-[11px] uppercase tracking-widest text-white shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 ${activeTab === 'grievance' ? 'bg-slate-900 shadow-slate-200' : 'bg-emerald-900 shadow-emerald-200'}`}
                        >
                            <Plus size={20}/> {activeTab === 'grievance' ? 'New Ticket' : 'Create Request'}
                        </button>
                    </div>
                </div>

                {/* --- 2. STATUS CARDS (Adaptive Colors) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatusCard 
                        label={activeTab === 'grievance' ? "Today's Grievances" : "Scheduled Today"} 
                        count={stats.today} icon={Clock} color="blue" 
                        onClick={() => setActiveFilter({type:'status', value: activeTab === 'grievance' ? 'Open' : 'Pending', label:"Today's Summary"})} 
                    />
                    <StatusCard 
                        label="Total Pending" count={stats.pending} icon={AlertCircle} color="rose" 
                        active={activeFilter.type === 'status' && (activeFilter.value === 'Open' || activeFilter.value === 'Pending')}
                        onClick={() => setActiveFilter({type:'status', value: activeTab === 'grievance' ? 'Open' : 'Pending', label:"Pending Queue"})} 
                    />
                    <StatusCard 
                        label="Closed / Success" count={stats.solved} icon={CheckCircle2} color="emerald" 
                        active={activeFilter.value === 'Resolved' || activeFilter.value === 'Completed'}
                        onClick={() => setActiveFilter({type:'status', value: activeTab === 'grievance' ? 'Resolved' : 'Completed', label:"Successfully Handled"})} 
                    />
                </div>

                {/* --- 3. DYNAMIC TABLE SECTION --- */}
                <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl overflow-hidden transition-all duration-500">
                    <div className="p-10 border-b border-slate-50 bg-slate-50/20 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-1 h-10 rounded-full ${activeTab === 'grievance' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            <div>
                                <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">{activeFilter.label}</h2>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest italic">Database Registry: {listData.length} active nodes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                             <div className="flex items-center gap-3 bg-slate-100 px-5 py-2.5 rounded-full border border-slate-200/50 shadow-inner">
                                <Filter size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter tabular-nums">Auto-Sort: Latest First</span>
                             </div>
                             <div className="flex items-center gap-3 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"/>
                                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Hierarchy Verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                <tr>
                                    <th className="p-10">{activeTab === 'grievance' ? 'Citizen Profile' : 'Requested By'}</th>
                                    <th className="p-6">{activeTab === 'grievance' ? 'Grievance Insight' : 'Service Logistics'}</th>
                                    <th className="p-6">Territory</th>
                                    <th className="p-6 text-center">Status Badge</th>
                                    <th className="p-10 text-right">Access</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode='wait'>
                                {loading ? (
                                    <motion.tr initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                        <td colSpan="5" className="p-40 text-center">
                                            <Loader2 className={`animate-spin mx-auto mb-6 ${activeTab === 'grievance' ? 'text-rose-600' : 'text-emerald-600'}`} size={48} />
                                            <p className="font-black text-[11px] uppercase tracking-[0.5em] text-slate-300 animate-pulse">Establishing Secure Stream...</p>
                                        </td>
                                    </motion.tr>
                                ) : listData.length === 0 ? (
                                    <motion.tr initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                        <td colSpan="5" className="p-40 text-center">
                                            <AlertCircle className="mx-auto mb-6 text-slate-200" size={56} />
                                            <p className="text-slate-300 font-black uppercase text-sm tracking-[0.3em] italic opacity-50">No Activity Detected in Current Node</p>
                                        </td>
                                    </motion.tr>
                                ) : listData.map((item, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        key={item.id} 
                                        className="hover:bg-slate-50/50 transition-all duration-300 group cursor-default"
                                    >
                                        <td className="p-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${activeTab === 'grievance' ? 'bg-rose-50 border-rose-100 text-rose-500 group-hover:bg-rose-600 group-hover:text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-[13px] uppercase tracking-tighter leading-none">{item.applicant_name || item.owner_name_en || 'Node User'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1 tabular-nums italic">+91 {item.mobile}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-tight px-3 py-1 rounded-lg self-start border-2 ${activeTab === 'grievance' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                                                    {activeTab === 'grievance' ? (item.type_name_en || 'Complaint') : (item.service_type || 'Service')}
                                                </span>
                                                
                                                {/* 🟢 SERVICE LOGISTICS DATA */}
                                                {activeTab === 'service' && (
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                            <LayoutGrid size={11} className="text-emerald-500"/> Qty: <span className="text-slate-800">{item.quantity_estimate || '1'}</span>
                                                        </p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                            <Calendar size={11} className="text-blue-500"/> Sch: <span className="text-slate-800">{item.scheduled_date}</span>
                                                        </p>
                                                    </div>
                                                )}

                                                <p className="text-[10px] font-bold text-slate-500 line-clamp-1 max-w-[280px] leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                                                    "{item.description || item.subject || 'Standard system prompt response.'}"
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[12px] font-black text-slate-700 uppercase tracking-tighter">
                                                    <MapPin size={16} className={activeTab === 'grievance' ? 'text-rose-500' : 'text-emerald-500'}/> Ward No. {item.ward_no}
                                                </div>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block ml-6">Zonal Layer-1</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 inline-block transition-all duration-300 ${item.status === 'Open' || item.status === 'Pending' ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-100/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="p-10 text-right">
                                            <motion.button 
                                                whileHover={{ x: 5 }}
                                                onClick={() => navigate(activeTab === 'grievance' ? `/admin/complaints/view/${item.id}` : `/admin/services/view/${item.id}`)}
                                                className={`px-8 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl flex items-center gap-3 ml-auto transition-all ${activeTab === 'grievance' ? 'bg-slate-900 hover:bg-rose-600 shadow-rose-100' : 'bg-slate-900 hover:bg-emerald-600 shadow-emerald-100'}`}
                                            >
                                                Inspect <ChevronRight size={16} />
                                            </motion.button>
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
        blue: "bg-blue-50 text-blue-600 border-blue-500 shadow-blue-100/50",
        rose: "bg-rose-50 text-rose-600 border-rose-500 shadow-rose-100/50",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-500 shadow-emerald-100/50"
    };

    return (
        <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={onClick}
            className={`p-8 rounded-[45px] border-2 cursor-pointer transition-all flex items-center gap-6 ${active ? `bg-white shadow-2xl ${colorMap[color].split(' ')[2]}` : 'border-transparent bg-white shadow-sm hover:border-slate-100'}`}
        >
            <div className={`w-16 h-16 rounded-[26px] flex items-center justify-center ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`}>
                <Icon size={34} />
            </div>
            <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3 italic">{label}</p>
                <p className="text-4xl font-black text-slate-800 leading-none tabular-nums tracking-tighter">{count || 0}</p>
            </div>
        </motion.div>
    );
};

export default GrievanceCenter;
