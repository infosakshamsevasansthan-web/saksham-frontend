import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { MessageSquare, AlertCircle, CheckCircle2, Clock, Plus, MapPin, ChevronRight, Loader2, Headset, Settings, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const GrievanceCenter = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ today: 0, pending: 0, solved: 0 });
    const [categories, setCategories] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Default Filter: Saare Pending complaints dikhao
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
            // URL mein filter parameters bhej rahe hain backend ke liye
            const [dashRes, listRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/grievance/dashboard/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/grievance/list/${tenantId}`, {
                    params: {
                        filter_type: activeFilter.type,
                        filter_value: activeFilter.value
                    }
                })
            ]);
            
            // Stats aur Categories Set karein
            if (dashRes.data.status) setStats(dashRes.data.status);
            if (dashRes.data.categories) setCategories(dashRes.data.categories);
            
            // List data set karein
            setComplaints(listRes.data.data || []);
            
        } catch (err) { 
            console.error("Fetch Error:", err);
            toast.error("Database connection failed!"); 
        } finally { 
            setLoading(false); 
        }
    }, [tenantId, activeFilter]);

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
                            <Headset size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none italic">Grievance Center</h1>
                            <p className="text-rose-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                                Citizen Redressal Engine
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => navigate('/admin/complaints/settings')} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                            <Settings size={20}/>
                        </button>
                        <button onClick={fetchData} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-emerald-600 transition-all">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/>
                        </button>
                        <button onClick={() => navigate('/admin/complaints/add')} className="bg-slate-900 text-white px-8 py-4 rounded-[20px] font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-3 shadow-xl">
                            <Plus size={18}/> New Ticket
                        </button>
                    </div>
                </header>

                {/* --- STATUS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusCard 
                        label="Today's Cases" count={stats.today} icon={Clock} color="blue" 
                        onClick={() => setActiveFilter({type:'status', value:'Open', label:"Today's Complaints"})} 
                    />
                    <StatusCard 
                        label="Total Pending" count={stats.pending} icon={AlertCircle} color="rose" 
                        active={activeFilter.value === 'Open' && activeFilter.type === 'status'}
                        onClick={() => setActiveFilter({type:'status', value:'Open', label:"All Pending Complaints"})} 
                    />
                    <StatusCard 
                        label="Resolved" count={stats.solved} icon={CheckCircle2} color="emerald" 
                        active={activeFilter.value === 'Resolved'}
                        onClick={() => setActiveFilter({type:'status', value:'Resolved', label:"Resolved Cases"})} 
                    />
                </div>

                {/* --- CATEGORIES SECTION --- */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 ml-1">
                        <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Filter by Type / श्रेणी</h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {categories.map(cat => (
                            <motion.div 
                                whileHover={{ y: -5 }} 
                                whileActive={{ scale: 0.95 }}
                                key={cat.id}
                                onClick={() => setActiveFilter({type: 'type', value: cat.id, label: cat.type_name_en})}
                                className={`min-w-[200px] p-6 rounded-[32px] border-2 cursor-pointer transition-all ${activeFilter.value === cat.id ? 'border-emerald-500 bg-white shadow-2xl shadow-emerald-100' : 'border-transparent bg-white shadow-sm hover:bg-slate-50'}`}
                            >
                                <div className={`w-10 h-10 rounded-2xl mb-4 flex items-center justify-center ${activeFilter.value === cat.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <MessageSquare size={18} />
                                </div>
                                <p className="text-xs font-black text-slate-800 uppercase leading-tight">{cat.type_name_en}</p>
                                <p className="text-[10px] font-bold text-emerald-600 mt-1">{cat.type_name_hi}</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{cat.count} Issues</span>
                                    <ChevronRight size={14} className="text-slate-300" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* --- TABLE SECTION --- */}
                <div className="bg-white rounded-[45px] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                        <div>
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{activeFilter.label}</span>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Total Records: {complaints.length}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"/>
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Live Feed active</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="p-8">Citizen Details</th>
                                    <th className="p-4">Grievance Info</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-8 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-32 text-center text-rose-500"><Loader2 className="animate-spin mx-auto mb-4" size={40} /><p className="font-black text-xs uppercase tracking-widest opacity-50">Syncing Records...</p></td></tr>
                                ) : complaints.length === 0 ? (
                                    <tr><td colSpan="5" className="p-32 text-center text-slate-300 font-black uppercase text-sm tracking-[0.4em] italic opacity-50">No Complaints Found</td></tr>
                                ) : complaints.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-8">
                                            <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{c.complainant_name || 'Anonymous'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 tabular-nums">+91 {c.mobile}</p>
                                        </td>
                                        <td className="p-4">
                                            {/* 🔥 GRIEVANCE COLUMN: Type aur Description database se */}
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-black text-rose-600 uppercase tracking-tight bg-rose-50 px-2 py-0.5 rounded-md self-start border border-rose-100">
                                                    {c.type_name_en || 'Other Issue'}
                                                </span>
                                                <p className="text-[10px] font-bold text-slate-500 line-clamp-2 max-w-[250px] leading-relaxed">
                                                    {c.description || 'No specific details provided.'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase">
                                                <MapPin size={14} className="text-emerald-500"/> Ward No. {c.ward_no}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 block ml-5">Ref: {c.source || 'Portal'}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${c.status === 'Open' ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-50' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="p-8 text-right">
                                            <button 
                                                onClick={() => navigate(`/admin/complaints/view/${c.id}`)}
                                                className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:scale-105 transition-all shadow-lg active:scale-95 flex items-center gap-2 ml-auto"
                                            >
                                                Details <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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