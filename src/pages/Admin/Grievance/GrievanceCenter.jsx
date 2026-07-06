import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    MessageSquare, AlertCircle, CheckCircle2, Clock, Plus, MapPin, 
    ChevronRight, Loader2, Headset, Settings, RefreshCcw, 
    Download, FileText, Table as TableIcon, Filter, ChevronLeft, Search, 
    LayoutGrid, Calendar, User, Briefcase, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GrievanceCenter = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('grievance'); 
    const [loading, setLoading] = useState(true);
    const [listData, setListData] = useState([]);
    const [stats, setStats] = useState({ today: 0, pending: 0, solved: 0 });
    const [searchTerm, setSearchBar] = useState("");

    // --- Pagination Logic ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const tenantId = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id');

    // 🟢 LOGIC: Unified Data Fetcher (Real Data from DB)
    const fetchData = useCallback(async () => {
        if (!tenantId) return toast.error("Session Expired");
        setLoading(true);
        try {
            const prefix = activeTab === 'grievance' ? 'grievance' : 'service';
            const [statRes, listRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/${prefix}/dashboard/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/${prefix}/list/${tenantId}`)
            ]);

            setStats(statRes.data.status || { today: 0, pending: 0, solved: 0 });
            setListData(listRes.data.data || []);
            setCurrentPage(1); 
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Database Sync Failed!");
        } finally {
            setLoading(false);
        }
    }, [tenantId, activeTab]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // 🟢 LOGIC: Global Search & Filter
    const filteredData = listData.filter(item => 
        (item.applicant_name || item.owner_name_en || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ticket_id || item.id || "").toString().includes(searchTerm)
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 🟢 LOGIC: Multi-Format Export
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Master_Records");
        XLSX.writeFile(wb, `${activeTab}_report.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text(`Saksham City Admin - ${activeTab.toUpperCase()} REPORT`, 14, 15);
        const columns = ["ID", "Name", "Type/Service", "Ward", "Status"];
        const rows = filteredData.map(item => [
            item.ticket_id || item.id,
            item.applicant_name || item.owner_name_en,
            item.type_name_en || item.service_type,
            item.ward_no,
            item.status
        ]);
        doc.autoTable(columns, rows, { startY: 22 });
        doc.save(`${activeTab}_report.pdf`);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-5 text-left bg-slate-50/30 min-h-screen">
                
                {/* --- 1. COMPACT MASTER HEADER --- */}
                <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${activeTab === 'grievance' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                            {activeTab === 'grievance' ? <Headset size={24} /> : <Briefcase size={24} />}
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">Administration Hub</h1>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Node-Link: {tenantId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Pro Toggle Tab */}
                    <div className="bg-slate-100 p-1.5 rounded-[22px] flex items-center shadow-inner border border-slate-200">
                        <button 
                            onClick={() => setActiveTab('grievance')}
                            className={`px-8 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'grievance' ? 'bg-white text-rose-600 shadow-md scale-100' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Grievances
                        </button>
                        <button 
                            onClick={() => setActiveTab('service')}
                            className={`px-8 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'service' ? 'bg-white text-emerald-600 shadow-md scale-100' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Services
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* 🟢 FIXED: Settings Link based on Tab */}
                        <button 
                            onClick={() => navigate(activeTab === 'grievance' ? '/admin/complaints/settings' : '/admin/complaints/settings')} 
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                        >
                            <Settings size={20}/>
                        </button>
                        <button onClick={fetchData} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-emerald-600 transition-all border border-slate-100">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/>
                        </button>
                        <button 
                            onClick={() => navigate(activeTab === 'grievance' ? '/admin/complaints/add' : '/admin/services/new')}
                            className={`px-8 py-3.5 rounded-[20px] font-black text-[10px] uppercase tracking-widest text-white shadow-xl hover:scale-105 transition-all flex items-center gap-3 ${activeTab === 'grievance' ? 'bg-slate-900 hover:bg-rose-600' : 'bg-emerald-900 hover:bg-emerald-600'}`}
                        >
                            <Plus size={18}/> New Request
                        </button>
                    </div>
                </div>

                {/* --- 2. MINI STATUS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusCard label="Recent Entry" count={stats.today} icon={Clock} color="blue" />
                    <StatusCard label="Pending Action" count={stats.pending} icon={AlertCircle} color="rose" />
                    <StatusCard label="Work Success" count={stats.solved} icon={CheckCircle2} color="emerald" />
                </div>

                {/* --- 3. THE COMMAND TABLE CARD --- */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
                    
                    {/* Toolbar Layer */}
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:flex-none">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                <input 
                                    type="text" 
                                    placeholder="Search citizen or Ticket ID..." 
                                    className="pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-50/50 transition-all w-full lg:w-72 shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchBar(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="text-[9px] font-black text-slate-400 uppercase">Size:</span>
                                <select 
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="bg-transparent text-[10px] font-black uppercase outline-none text-slate-700 cursor-pointer"
                                >
                                    {[5, 10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full lg:w-auto justify-end">
                            <button onClick={exportExcel} className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">
                                <TableIcon size={14}/> Excel
                            </button>
                            <button onClick={exportPDF} className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">
                                <FileText size={14}/> PDF
                            </button>
                        </div>
                    </div>

                    {/* Table Viewport (Scrollable) */}
                    <div className="overflow-x-auto max-h-[600px] no-scrollbar">
                        <table className="w-full text-left min-w-[1000px] border-separate border-spacing-0">
                            <thead className="bg-slate-50/50 sticky top-0 z-10">
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="p-6 border-b border-slate-100">Requester Profile</th>
                                    <th className="p-6 border-b border-slate-100">Log Details</th>
                                    <th className="p-6 border-b border-slate-100">Zonal Territory</th>
                                    <th className="p-6 border-b border-slate-100 text-center">Status</th>
                                    <th className="p-6 border-b border-slate-100 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode='wait'>
                                {loading ? (
                                    <tr><td colSpan="5" className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-rose-500 mb-4" size={40}/><p className="font-black text-[11px] uppercase tracking-[0.4em] text-slate-400">Syncing Master Node...</p></td></tr>
                                ) : currentItems.map((item, idx) => (
                                    <motion.tr 
                                        initial={{opacity:0, y: 10}} animate={{opacity:1, y:0}} transition={{delay: idx*0.03}}
                                        key={item.id} className="hover:bg-slate-50/50 transition-all group"
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[18px] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-[13px] uppercase tracking-tighter">{item.applicant_name || item.owner_name_en || 'Citizen Node'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1.5 tabular-nums flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> +91 {item.mobile}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-tight px-3 py-1 rounded-lg border-2 ${activeTab === 'grievance' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100'}`}>
                                                        {activeTab === 'grievance' ? item.type_name_en : item.service_type}
                                                    </span>
                                                    {activeTab === 'service' && <span className="text-[9px] font-bold text-slate-400 uppercase italic">Sch: {item.scheduled_date}</span>}
                                                </div>
                                                <p className="text-[11px] font-medium text-slate-500 line-clamp-1 italic max-w-[300px]">"{item.description || item.subject || 'No extra logs.'}"</p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[12px] font-black text-slate-700 uppercase tracking-tighter">
                                                    <MapPin size={16} className={activeTab === 'grievance' ? 'text-rose-500' : 'text-emerald-500'}/> Ward No. {item.ward_no || '00'}
                                                </div>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block ml-6">Admin Level-1</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 inline-block transition-all duration-300 ${item.status === 'Open' || item.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-100/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100/50'}`}>
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            {/* 🟢 FIXED: Navigate based on Tab to stop 404 */}
                                            <button 
                                                onClick={() => navigate(activeTab === 'grievance' ? `/admin/complaints/view/${item.id}` : `/admin/services/view/${item.id}`)}
                                                className="p-3.5 bg-slate-100 text-slate-400 rounded-[20px] hover:bg-slate-900 hover:text-white hover:scale-110 transition-all shadow-sm"
                                            >
                                                <ChevronRight size={20}/>
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={16} className="text-slate-300" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Page {currentPage} of {totalPages || 1}</span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                            >
                                <ChevronLeft size={18}/>
                            </button>
                            <button 
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                            >
                                <ChevronRight size={18}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </CityLayout>
    );
};

const StatusCard = ({ label, count, icon: Icon, color }) => {
    const themes = {
        blue: "text-blue-600 bg-blue-50 border-blue-500 shadow-blue-100/50",
        rose: "text-rose-600 bg-rose-50 border-rose-500 shadow-rose-100/50",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-500 shadow-emerald-100/50"
    };
    return (
        <div className="bg-white p-5 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex-1">
            <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 ${themes[color].split(' ')[0]} ${themes[color].split(' ')[1]}`}>
                <Icon size={30} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{label}</p>
                <p className="text-3xl font-black text-slate-800 leading-none tabular-nums tracking-tighter">{count || 0}</p>
            </div>
        </div>
    );
};

export default GrievanceCenter;
