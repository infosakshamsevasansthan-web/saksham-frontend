import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Sparkles, Terminal, FileSpreadsheet, File as FilePdf, Loader2, RefreshCcw, 
    Search, Database, Cpu, CheckCircle2, ListChecks, Filter, Download, Zap,
    ArrowRight, Table, LayoutPanelTop, MousePointer2, AlertCircle
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
    const [reportData, setReportData] = useState(null); // Full result object
    const [visibleColumns, setVisibleColumns] = useState([]); // Selected headers
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // 🟢 AI Search Logic
    const handleAISearch = async (e) => {
        if(e) e.preventDefault();
        if (!prompt.trim()) return toast.error("Bhai, AI se kuch toh puchiye!");
        
        setLoading(true);
        setReportData(null);
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/reports/ai-engine', { prompt, tenantId });
            
            if (res.data.data && res.data.data.length > 0) {
                setReportData(res.data);
                // Shuruat mein saare columns dikhayenge
                setVisibleColumns(Object.keys(res.data.data[0]));
                toast.success("Intelligence Report Taiyar Hai! ✨");
            } else {
                toast.error("Database mein koi record nahi mila.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Neural Engine failure");
        } finally { setLoading(false); }
    };

    // 🟢 Column Toggle Logic
    const toggleColumn = (colName) => {
        setVisibleColumns(prev => 
            prev.includes(colName) 
            ? prev.filter(c => c !== colName) 
            : [...prev, colName]
        );
    };

    // 🟢 Excel Export (Sirf Visible Columns)
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Saksham_AI_Report');

        // Headers setup
        sheet.columns = visibleColumns.map(col => ({
            header: col.replace("_", " ").toUpperCase(),
            key: col,
            width: 25
        }));

        // Style Headers
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', fillType: 'solid', fgColor: { argb: '4F46E5' } };

        // Add Data
        reportData.data.forEach(item => {
            const filteredRow = {};
            visibleColumns.forEach(col => filteredRow[col] = item[col]);
            sheet.addRow(filteredRow);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${reportData.title.replace(/\s+/g, '_')}.xlsx`);
        toast.success("Excel Downloaded!");
    };

    // 🟢 PDF Export (Sirf Visible Columns)
    const exportToPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229); // Indigo
        doc.text("SAKSHAM AI COMMAND CENTER", 14, 15);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Report: ${reportData.title} | Total Records: ${reportData.data.length}`, 14, 22);

        const headers = [visibleColumns.map(c => c.replace("_", " ").toUpperCase())];
        const body = reportData.data.map(row => visibleColumns.map(col => row[col] || '---'));

        doc.autoTable({
            head: headers,
            body: body,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 3 },
            alternateRowStyles: { fillColor: [245, 247, 250] }
        });

        doc.save(`${reportData.title}.pdf`);
        toast.success("PDF Audit Report Saved!");
    };

    // 🟢 Badge Color Logic
    const getBadgeStyle = (val) => {
        const text = String(val).toLowerCase();
        if (['active', 'resolved', 'running', 'a', 'present'].includes(text)) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (['pending', 'open', 'maintenance', 'mixed', 'b'].includes(text)) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        if (['inactive', 'suspended', 'breakdown', 'dry', 'absent'].includes(text)) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-6 space-y-10 bg-[#0a0a0f] min-h-screen font-sans text-left">
                
                {/* --- 🟢 AI NEURAL SEARCH HEADER --- */}
                <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-black rounded-[50px] p-12 text-white shadow-[0_20px_80px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/5">
                    {/* Animated Glow Background */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-12">
                            <motion.div 
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 5 }}
                                className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[30px] flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)]"
                            >
                                <Cpu size={48} className="text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none bg-gradient-to-r from-white via-indigo-200 to-slate-500 bg-clip-text text-transparent">Saksham AI Mitra</h1>
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                                    <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.5em]">Global Database Intelligence Engine</p>
                                </div>
                            </div>
                        </div>

                        {/* Search Input Box */}
                        <form onSubmit={handleAISearch} className="relative max-w-5xl group">
                            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-indigo-400">
                                <Terminal size={32} />
                            </div>
                            <input 
                                className="w-full bg-white/5 border-2 border-white/10 rounded-full py-12 pl-28 pr-64 text-2xl font-bold placeholder:text-slate-700 outline-none focus:border-indigo-500 focus:bg-white/10 transition-all shadow-inner text-indigo-50"
                                placeholder="Puchiye: 'Gari ka report', 'Staff attendance', 'Kachra collection'..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <button 
                                type="submit" disabled={loading}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-white hover:text-indigo-950 text-white px-14 py-7 rounded-full font-black uppercase text-sm tracking-widest transition-all active:scale-95 flex items-center gap-4 shadow-2xl shadow-indigo-500/20"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24}/> : <Sparkles size={24}/>}
                                Generate Insight
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- 🟢 RESULTS & COLUMN MANAGER --- */}
                <AnimatePresence mode="wait">
                    {reportData ? (
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            
                            {/* Header / Column Selector Panel */}
                            <div className="bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 shadow-2xl">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-indigo-500 rounded-2xl text-white shadow-lg"><LayoutPanelTop size={24}/></div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{reportData.title}</h3>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Found {reportData.data.length} Intelligent Data Nodes</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={exportToExcel} className="flex items-center gap-3 bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-white transition-all shadow-lg active:scale-95">
                                            <FileSpreadsheet size={18}/> Excel Export
                                        </button>
                                        <button onClick={exportToPDF} className="flex items-center gap-3 bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-white hover:text-rose-600 transition-all shadow-lg active:scale-95">
                                            <FilePdf size={18}/> PDF Audit
                                        </button>
                                        <button onClick={() => setReportData(null)} className="p-4 bg-white/10 text-white rounded-2xl hover:bg-indigo-500 transition-all"><RefreshCcw size={20}/></button>
                                    </div>
                                </div>

                                {/* Dynamic Column HUD */}
                                <div className="mt-10 pt-10 border-t border-white/5">
                                    <div className="flex items-center gap-3 mb-6">
                                        <MousePointer2 size={16} className="text-indigo-400" />
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Configure Data Components / हेडर्स चुनें</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {Object.keys(reportData.data[0]).map(col => (
                                            <button 
                                                key={col} onClick={() => toggleColumn(col)}
                                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${visibleColumns.includes(col) ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'bg-white/5 border-white/10 text-slate-600 hover:bg-white/10'}`}
                                            >
                                                {col.replace("_", " ")}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 🟢 MAIN DATA TABLE */}
                            <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-200">
                                <div className="overflow-x-auto p-6">
                                    <table className="w-full text-left border-separate border-spacing-y-3">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                {visibleColumns.map(col => (
                                                    <th key={col} className="px-10 py-6">{col.replace("_", " ")}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.data.map((row, idx) => (
                                                <tr key={idx} className="group transition-all duration-300">
                                                    {visibleColumns.map(col => (
                                                        <td key={col} className="px-10 py-7 bg-slate-50 group-hover:bg-indigo-50 first:rounded-l-[2rem] last:rounded-r-[2rem] transition-colors border-y border-transparent group-hover:border-indigo-100">
                                                            {/* Check if value is a "Status-like" word to show badge */}
                                                            {typeof row[col] === 'string' && row[col].length < 15 ? (
                                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getBadgeStyle(row[col])}`}>
                                                                    {row[col]}
                                                                </span>
                                                            ) : (
                                                                <span className="font-bold text-slate-700 text-sm">{row[col] || '---'}</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">End of AI Generated Data Stream</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* --- 🟢 EMPTY STATE TIPS --- */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <SmartTip icon={TruckIcon} title="Fleet Analysis" hint="Gari ki report dikhao" color="blue" />
                            <SmartTip icon={UsersIcon} title="Staff Monitoring" hint="Karmachariyon ki hazri" color="emerald" />
                            <SmartTip icon={Zap} title="Plant Production" hint="Processing plant ka paisa" color="amber" />
                            <SmartTip icon={AlertCircle} title="Grievance Audit" hint="Aaj ki pending shikayat" color="rose" />
                        </div>
                    )}
                </AnimatePresence>
            </div>
            
            <style>{`
                .animate-spin-slow { animation: spin 10s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-thumb { background: #4F46E5; border-radius: 10px; }
            `}</style>
        </CityLayout>
    );
};

// --- Reusable Sub-Components ---

const SmartTip = ({ icon: Icon, title, hint, color }) => (
    <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer group">
        <div className={`w-14 h-14 bg-white/5 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner`}>
            <Icon size={24} />
        </div>
        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">{title}</h4>
        <p className="text-slate-500 text-xs font-bold italic leading-relaxed">Try: "{hint}"</p>
    </div>
);

const TruckIcon = ({size}) => <LayoutDashboard size={size} />; 
const UsersIcon = ({size}) => <Users size={size} />; 

export default SakshamAI;
