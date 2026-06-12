import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    MessageSquare, AlertCircle, CheckCircle2, Clock, Plus, MapPin, 
    ChevronRight, Loader2, Headset, Settings, RefreshCcw, 
    Download, FileText, Table as TableIcon, Filter, ChevronLeft, Search, 
    LayoutGrid, Calendar, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GrievanceCenter = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('grievance'); // grievance | service
    const [loading, setLoading] = useState(true);
    const [listData, setListData] = useState([]);
    const [stats, setStats] = useState({ today: 0, pending: 0, solved: 0 });
    const [searchTerm, setSearchBar] = useState("");

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const tenantId = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id');

    // 🟢 LOGIC: Real-time Fetch based on Tab
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
            setCurrentPage(1); // Reset page on tab switch
        } catch (err) {
            console.error(err);
            toast.error("Network Sync Failed");
        } finally {
            setLoading(false);
        }
    }, [tenantId, activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 🟢 LOGIC: Search & Filter
    const filteredData = listData.filter(item => 
        (item.applicant_name || item.owner_name_en || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ticket_id || item.id || "").toString().includes(searchTerm)
    );

    // 🟢 LOGIC: Pagination calculations
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 🟢 LOGIC: Excel Export
    const exportExcel = () => {
        const fileData = filteredData.map(item => ({
            ID: item.ticket_id || item.id,
            Name: item.applicant_name || item.owner_name_en,
            Mobile: item.mobile,
            Type: item.type_name_en || item.service_type,
            Ward: item.ward_no,
            Status: item.status,
            Date: new Date(item.created_at).toLocaleDateString()
        }));
        const ws = XLSX.utils.json_to_sheet(fileData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Records");
        XLSX.writeFile(wb, `${activeTab}_report.xlsx`);
    };

    // 🟢 LOGIC: PDF Export
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text(`${activeTab.toUpperCase()} MASTER REPORT`, 14, 15);
        const tableColumn = ["ID", "Name", "Type", "Ward", "Status"];
        const tableRows = filteredData.map(item => [
            item.ticket_id || item.id,
            item.applicant_name || item.owner_name_en,
            item.type_name_en || item.service_type,
            item.ward_no,
            item.status
        ]);
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.save(`${activeTab}_report.pdf`);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-slate-50/50 min-h-screen">
                
                {/* --- 1. COMPACT HEADER --- */}
                <header className="flex flex-col lg:flex-row justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${activeTab === 'grievance' ? 'bg-rose-500 shadow-rose-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
                            {activeTab === 'grievance' ? <Headset size={24} /> : <Toolbox size={24} />}
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight italic leading-none">
                                {activeTab === 'grievance' ? 'Redressal Hub' : 'Service Desk'}
                            </h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time City Administration</p>
                        </div>
                    </div>

                    {/* 🟢 TOGGLE TAB (The Switch) */}
                    <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 shadow-inner">
                        <button 
                            onClick={() => setActiveTab('grievance')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'grievance' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Grievances
                        </button>
                        <button 
                            onClick={() => setActiveTab('service')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'service' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Services
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/admin/settings/grievance')} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100"><Settings size={20}/></button>
                        <button onClick={fetchData} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-emerald-600 transition-all border border-slate-100"><RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/></button>
                        <button 
                            onClick={() => navigate(activeTab === 'grievance' ? '/admin/complaints/add' : '/admin/services/new')}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] hover:bg-rose-600 transition-all shadow-xl flex items-center gap-2"
                        >
                            <Plus size={18}/> New Ticket
                        </button>
                    </div>
                </header>

                {/* --- 2. COMPACT STATUS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusCard label="Current Today" count={stats.today} icon={Clock} color="blue" />
                    <StatusCard label="Active Pending" count={stats.pending} icon={AlertCircle} color="rose" />
                    <StatusCard label="Case Solved" count={stats.solved} icon={CheckCircle2} color="emerald" />
                </div>

                {/* --- 3. THE COMMAND TABLE CARD --- */}
                <div className="bg-white rounded-[35px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
                    
                    {/* 🟢 TOOLBAR: Pagination + Search + Export */}
                    <div className="p-5 border-b border-slate-50 bg-slate-50/30 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Search Citizen / ID..." 
                                    className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-rose-500 transition-all w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchBar(e.target.value)}
                                />
                            </div>
                            <select 
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase outline-none"
                            >
                                {[5, 10, 20, 50].map(v => <option key={v} value={v}>Show {v}</option>)}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">
                                <TableIcon size={14}/> Excel
                            </button>
                            <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">
                                <FileText size={14}/> PDF
                            </button>
                        </div>
                    </div>

                    {/* 🟢 TABLE WITH SCROLL */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                                <tr>
                                    <th className="p-6">Profile & Contact</th>
                                    <th className="p-6">{activeTab === 'grievance' ? 'Grievance Insight' : 'Service Parameters'}</th>
                                    <th className="p-6">Location Node</th>
                                    <th className="p-6 text-center">Live Status</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode='wait'>
                                {loading ? (
                                    <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-rose-500 mb-4" size={32}/><p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Syncing Master Database...</p></td></tr>
                                ) : currentItems.length === 0 ? (
                                    <tr><td colSpan="5" className="p-20 text-center text-slate-300 font-black uppercase italic tracking-widest text-xs">No matching records found</td></tr>
                                ) : currentItems.map((item, idx) => (
                                    <motion.tr 
                                        initial={{opacity:0}} animate={{opacity:1}} transition={{delay: idx*0.03}}
                                        key={item.id} className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-all">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-xs uppercase">{item.applicant_name || item.owner_name_en || 'Citizen'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 tabular-nums">+91 {item.mobile}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md self-start border ${activeTab === 'grievance' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100'}`}>
                                                    {activeTab === 'grievance' ? item.type_name_en : item.service_type}
                                                </span>
                                                {activeTab === 'service' && (
                                                    <div className="flex gap-2 text-[9px] font-black text-slate-400 uppercase">
                                                        <span className="flex items-center gap-1"><LayoutGrid size={10}/> Qty: {item.quantity_estimate}</span>
                                                        <span className="flex items-center gap-1"><Calendar size={10}/> Sch: {item.scheduled_date}</span>
                                                    </div>
                                                )}
                                                <p className="text-[10px] font-medium text-slate-500 line-clamp-1 italic max-w-[250px]">"{item.description || item.subject || 'Standard request'}"</p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase">
                                                <MapPin size={14} className={activeTab === 'grievance' ? 'text-rose-500' : 'text-emerald-500'}/> Ward No. {item.ward_no}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border-2 ${item.status === 'Open' || item.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button 
                                                onClick={() => navigate(`/admin/${activeTab}/view/${item.id}`)}
                                                className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                            >
                                                <ChevronRight size={16}/>
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* 🟢 PAGINATION FOOTER */}
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <div className="flex gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-all shadow-sm"
                            >
                                <ChevronLeft size={16}/>
                            </button>
                            <button 
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-100 transition-all shadow-sm"
                            >
                                <ChevronRight size={16}/>
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
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
    };
    return (
        <div className="bg-white p-5 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-lg transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${themes[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-black text-slate-800 leading-none tabular-nums">{count || 0}</p>
            </div>
        </div>
    );
};

export default GrievanceCenter;
