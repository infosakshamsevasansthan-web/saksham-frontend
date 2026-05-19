import React, { useState, useMemo } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Sparkles, Terminal, FileSpreadsheet, File as FilePdf, Loader2, RefreshCcw, 
    Search, Database, Cpu, CheckCircle2, ListChecks, Download, Zap,
    LayoutPanelTop, MousePointer2, ChevronLeft, ChevronRight, Send, Filter,
    Truck, Users, AlertCircle, Info, Table as TableIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SakshamAI = () => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null); 
    const [visibleColumns, setVisibleColumns] = useState([]); 
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // 🟢 AI Search Logic
    const handleAISearch = async (e) => {
        if(e) e.preventDefault();
        if (!prompt.trim()) return toast.error("AI se baatchit shuru karein!");
        
        setLoading(true);
        setReportData(null);
        setCurrentPage(1);
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/reports/ai-engine', { prompt, tenantId });
            if (res.data.data?.length > 0) {
                setReportData(res.data);
                setVisibleColumns(Object.keys(res.data.data[0]));
                toast.success("Intelligence Report Ready! ✨");
            } else {
                toast.error("Database mein record nahi mila.");
            }
        } catch (err) {
            toast.error("Neural Engine response error");
        } finally { setLoading(false); }
    };

    // 🟢 Pagination Logic
    const paginatedData = useMemo(() => {
        if (!reportData) return [];
        const start = (currentPage - 1) * rowsPerPage;
        return reportData.data.slice(start, start + rowsPerPage);
    }, [reportData, currentPage]);

    const totalPages = reportData ? Math.ceil(reportData.data.length / rowsPerPage) : 0;

    // 🟢 Toggle Header Logic
    const toggleCol = (col) => {
        setVisibleColumns(prev => 
            prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
        );
    };

    // 🟢 Professional Excel Export
    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('AI_Report');
        sheet.columns = visibleColumns.map(c => ({ header: c.replace("_", " ").toUpperCase(), key: c, width: 25 }));
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', fillType: 'solid', fgColor: { argb: '059669' } }; // Emerald 600
        sheet.addRows(reportData.data);
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Saksham_Report_${Date.now()}.xlsx`);
        toast.success("Excel Exported!");
    };

    // 🟢 Badge Color Logic
    const getBadgeStyle = (val) => {
        const text = String(val).toLowerCase();
        if (['active', 'resolved', 'running', 'a', 'present'].includes(text)) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (['pending', 'open', 'maintenance', 'mixed', 'b'].includes(text)) return 'bg-amber-50 text-amber-600 border-amber-100';
        if (['inactive', 'suspended', 'breakdown', 'dry', 'absent'].includes(text)) return 'bg-rose-50 text-rose-600 border-rose-100';
        return 'bg-slate-50 text-slate-500 border-slate-100';
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 bg-[#F8FAFC] min-h-screen text-left font-sans">
                
                {/* --- 🟢 COMPACT EMERALD HEADER --- */}
                <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-[35px] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><Cpu size={150} /></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white/20 rounded-[22px] flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                                <Sparkles size={32} className="text-white animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight uppercase italic leading-none">Saksham AI Mitra</h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80 mt-2">Neural Reporting Interface v4.5</p>
                            </div>
                        </div>

                        {/* ⌨️ Compact Input Box */}
                        <form onSubmit={handleAISearch} className="flex-1 max-w-2xl relative group w-full">
                            <input 
                                className="w-full bg-white rounded-full py-5 pl-14 pr-16 text-sm font-bold text-slate-800 outline-none shadow-2xl border-2 border-transparent focus:border-emerald-300 transition-all placeholder:text-slate-400"
                                placeholder="Gari ki report, Staff hazri, Kachra collection..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <Terminal className="absolute left-5 top-5 text-emerald-500" size={20} />
                            <button 
                                type="submit" disabled={loading}
                                className="absolute right-2 top-2 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-all active:scale-90 shadow-lg"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- 📊 DATA DISPLAY AREA --- */}
                <AnimatePresence mode="wait">
                    {reportData ? (
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            
                            {/* 🛠️ Column Management & Tools */}
                            <div className="bg-white p-6 rounded-[30px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <ListChecks size={18}/>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest">Select Table Components / हेडर्स चुनें</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(reportData.data[0]).map(col => (
                                            <button 
                                                key={col} onClick={() => toggleCol(col)}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${visibleColumns.includes(col) ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200'}`}
                                            >
                                                {col.replace("_", " ")}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={exportExcel} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-2 font-black text-[10px] uppercase">
                                        <FileSpreadsheet size={18}/> Excel
                                    </button>
                                    <button onClick={() => setReportData(null)} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm">
                                        <RefreshCcw size={20}/>
                                    </button>
                                </div>
                            </div>

                            {/* 📑 SCROLLABLE DATA TABLE */}
                            <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                    <h2 className="text-sm font-black text-slate-700 uppercase tracking-tighter italic">{reportData.title}</h2>
                                </div>

                                <div className="max-h-[550px] overflow-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-slate-900 text-white z-20">
                                            <tr className="text-[10px] font-black uppercase tracking-[0.2em]">
                                                {visibleColumns.map(col => <th key={col} className="p-6">{col.replace("_", " ")}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {paginatedData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-emerald-50/40 transition-colors group">
                                                    {visibleColumns.map(col => (
                                                        <td key={col} className="p-6">
                                                            {typeof row[col] === 'string' && row[col].length < 15 ? (
                                                                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase border ${getBadgeStyle(row[col])}`}>
                                                                    {row[col]}
                                                                </span>
                                                            ) : (
                                                                <span className="font-bold text-slate-700 text-xs uppercase">{row[col] || '---'}</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 📟 PAGER CONTROLS */}
                                <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center px-10">
                                    <div className="flex items-center gap-2">
                                        <TableIcon size={14} className="text-slate-400" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Total Nodes: {reportData.data.length}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                            disabled={currentPage === 1}
                                            className="p-3 bg-white rounded-xl border border-slate-200 disabled:opacity-20 hover:bg-emerald-50 transition-all"
                                        >
                                            <ChevronLeft size={18}/>
                                        </button>
                                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                            disabled={currentPage === totalPages}
                                            className="p-3 bg-white rounded-xl border border-slate-200 disabled:opacity-20 hover:bg-emerald-50 transition-all"
                                        >
                                            <ChevronRight size={18}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* --- 💡 USAGE TIPS --- */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                            <UsageTip icon={Truck} label="Fleet Analysis" hint="Gari ki report" color="emerald" />
                            <UsageTip icon={Users} label="Human Capital" hint="Staff attendance" color="blue" />
                            <UsageTip icon={Zap} label="Plant Output" hint="Compost ki sale" color="amber" />
                            <UsageTip icon={AlertCircle} label="Grievances" hint="Pending shikayat" color="rose" />
                        </div>
                    )}
                </AnimatePresence>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
            `}</style>
        </CityLayout>
    );
};

const UsageTip = ({ icon: Icon, label, hint, color }) => (
    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center text-center">
        <div className={`w-14 h-14 rounded-2xl mb-5 flex items-center justify-center bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform shadow-inner border border-${color}-100`}>
            <Icon size={24} />
        </div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">{label}</h4>
        <p className="text-slate-400 text-[10px] font-bold italic leading-relaxed">Ask AI: "{hint}"</p>
    </div>
);

export default SakshamAI;
