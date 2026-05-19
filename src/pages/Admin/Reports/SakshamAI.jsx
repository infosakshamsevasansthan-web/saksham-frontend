import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Sparkles, Terminal, FileSpreadsheet, File as FilePdf, Loader2, RefreshCcw, 
    Search, Database, Cpu, CheckCircle2, ListChecks, Filter, Download, Zap,
    ArrowRight, Table, LayoutPanelTop, MousePointer2, AlertCircle,
    LayoutDashboard, Users, Truck, FileJson, History, UserCheck, Coins,
    ChevronRight, Info, Settings, Trash2
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
    const [reportData, setReportData] = useState(null); // Backend se aane wala poora data
    const [visibleColumns, setVisibleColumns] = useState([]); // User jo columns select karega
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // 🟢 1. Neural Search Logic (Backend Sync)
    const handleAISearch = async (e) => {
        if(e) e.preventDefault();
        if (!prompt.trim()) return toast.error("Bhai, AI se kuch toh puchiye!");
        
        setLoading(true);
        setReportData(null);
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/reports/ai-engine', { prompt, tenantId });
            
            if (res.data.data && res.data.data.length > 0) {
                setReportData(res.data);
                // Default: Saare columns dikhao
                setVisibleColumns(Object.keys(res.data.data[0]));
                toast.success("Intelligence Report Taiyar Hai! ✨");
            } else {
                toast.error("Database mein koi record nahi mila.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Neural Engine failure");
        } finally { setLoading(false); }
    };

    // 🟢 2. Header / Column Manager Logic
    const toggleColumn = (colName) => {
        setVisibleColumns(prev => 
            prev.includes(colName) 
            ? prev.filter(c => c !== colName) 
            : [...prev, colName]
        );
    };

    // 🟢 3. Excel Export Logic (Sirf Visible Columns)
    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('AI_Report');
        
        sheet.columns = visibleColumns.map(col => ({
            header: col.replace("_", " ").toUpperCase(),
            key: col,
            width: 25
        }));

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', fillType: 'solid', fgColor: { argb: '4F46E5' } };

        reportData.data.forEach(item => {
            const row = {};
            visibleColumns.forEach(c => row[c] = item[c]);
            sheet.addRow(row);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Saksham_AI_${reportData.title}.xlsx`);
    };

    // 🟢 4. PDF Export Logic (A4 Landscape)
    const exportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229);
        doc.text("SAKSHAM AI COMMAND CENTER", 14, 15);
        
        const headers = [visibleColumns.map(c => c.replace("_", " ").toUpperCase())];
        const body = reportData.data.map(row => visibleColumns.map(col => row[col] || '---'));

        doc.autoTable({
            head: headers,
            body: body,
            startY: 25,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 8 }
        });
        doc.save(`Saksham_Report_${Date.now()}.pdf`);
    };

    // 🟢 5. Smart Status Badge Logic
    const getBadgeStyle = (val) => {
        const text = String(val).toLowerCase();
        if (['active', 'resolved', 'running', 'a', 'present', 'on-duty'].includes(text)) 
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (['pending', 'open', 'maintenance', 'mixed', 'b', 'in-progress'].includes(text)) 
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        if (['inactive', 'suspended', 'breakdown', 'dry', 'absent', 'rejected'].includes(text)) 
            return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-6 space-y-10 bg-[#0a0a0f] min-h-screen font-sans text-left selection:bg-indigo-500 selection:text-white">
                
                {/* --- 📟 CYBER SEARCH INTERFACE --- */}
                <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-black rounded-[50px] p-12 text-white shadow-[0_20px_100px_rgba(0,0,0,0.8)] relative overflow-hidden border border-white/5 group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] -mr-60 -mt-60 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[120px] -ml-40 -mb-40"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-8 mb-16">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                className="w-28 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[35px] flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.5)] border-2 border-white/10"
                            >
                                <Cpu size={48} className="text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none bg-gradient-to-r from-white via-indigo-100 to-slate-500 bg-clip-text text-transparent">Saksham AI Mitra</h1>
                                <div className="flex items-center gap-4 mt-5">
                                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Neural Link Active</span>
                                    </div>
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Universal Data Stream v4.0</span>
                                </div>
                            </div>
                        </div>

                        {/* Search Input HUD */}
                        <form onSubmit={handleAISearch} className="relative max-w-6xl group">
                            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-emerald-400 transition-colors">
                                <Terminal size={36} />
                            </div>
                            <input 
                                className="w-full bg-white/5 border-2 border-white/10 rounded-full py-12 pl-32 pr-72 text-3xl font-bold placeholder:text-slate-800 outline-none focus:border-indigo-500 focus:bg-white/10 focus:shadow-[0_0_50px_rgba(79,70,229,0.2)] transition-all text-indigo-50"
                                placeholder="Gari, Staff, Kachra, ya Plant ke baare mein puchiye..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <button 
                                type="submit" disabled={loading}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-emerald-500 text-white px-16 py-8 rounded-full font-black uppercase text-sm tracking-widest transition-all active:scale-95 flex items-center gap-4 shadow-2xl disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24}/> : <Sparkles size={24}/>}
                                Generate Insight
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- 📊 REPORT DISPLAY SECTION --- */}
                <AnimatePresence mode="wait">
                    {reportData ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                            
                            {/* 🛠️ DYNAMIC COLUMN CONTROLLER */}
                            <div className="bg-slate-900/80 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/10 shadow-3xl">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                                    <div className="flex items-center gap-6">
                                        <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-2xl rotate-3"><LayoutPanelTop size={32}/></div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{reportData.title}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Database size={14} className="text-indigo-400"/>
                                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Neural Mapping: {reportData.data.length} Records found</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <ExportBtn onClick={exportExcel} icon={FileSpreadsheet} label="Excel" color="emerald" />
                                        <ExportBtn onClick={exportPDF} icon={FilePdf} label="PDF" color="rose" />
                                        <button onClick={() => setReportData(null)} className="p-5 bg-white/5 text-slate-400 rounded-3xl hover:bg-rose-500 hover:text-white transition-all border border-white/10 active:scale-90"><RefreshCcw size={24}/></button>
                                    </div>
                                </div>

                                <div className="mt-12 pt-10 border-t border-white/5">
                                    <div className="flex items-center gap-3 mb-8">
                                        <MousePointer2 size={18} className="text-indigo-400 animate-bounce" />
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Configure Intelligence Headers / कॉलम फ़िल्टर</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {Object.keys(reportData.data[0]).map(col => (
                                            <button 
                                                key={col} onClick={() => toggleColumn(col)}
                                                className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase transition-all border-2 ${visibleColumns.includes(col) ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)]' : 'bg-white/5 border-white/10 text-slate-600 hover:bg-white/10'}`}
                                            >
                                                {col.replace("_", " ")}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 📑 DATA GRID TABLE */}
                            <div className="bg-white rounded-[5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-200">
                                <div className="overflow-x-auto p-10">
                                    <table className="w-full text-left border-separate border-spacing-y-4">
                                        <thead>
                                            <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                                {visibleColumns.map(col => (
                                                    <th key={col} className="px-10 py-4">{col.replace("_", " ")}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.data.map((row, idx) => (
                                                <tr key={idx} className="group">
                                                    {visibleColumns.map(col => (
                                                        <td key={col} className="px-10 py-8 bg-slate-50 group-hover:bg-indigo-50 first:rounded-l-[2.5rem] last:rounded-r-[2.5rem] transition-all duration-300 border-y-2 border-transparent group-hover:border-indigo-100/50">
                                                            {typeof row[col] === 'string' && row[col].length < 15 ? (
                                                                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border-2 ${getBadgeStyle(row[col])}`}>
                                                                    {row[col]}
                                                                </span>
                                                            ) : (
                                                                <span className="font-bold text-slate-700 text-base leading-tight">
                                                                    {row[col] || '---'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-center items-center gap-4">
                                     <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">End of Digital Intelligence Stream</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* --- 💡 SYSTEM USAGE TIPS --- */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <TipCard icon={Truck} title="Fleet Telematics" hint="Gari ki report dikhao" color="blue" />
                            <TipCard icon={Users} title="Human Capital" hint="Active Staff list" color="emerald" />
                            <TipCard icon={Coins} title="Plant Revenue" hint="Total processing sale" color="amber" />
                            <TipCard icon={AlertCircle} title="Grievance Audit" hint="Aaj ki pending shikayat" color="rose" />
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-thumb { background: #4F46E5; border-radius: 10px; }
                ::-webkit-scrollbar-track { background: #0a0a0f; }
                .shadow-3xl { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.7); }
            `}</style>
        </CityLayout>
    );
};

// --- ✨ Sub-Components for Design Fidelity ---

const ExportBtn = ({ onClick, icon: Icon, label, color }) => (
    <button onClick={onClick} className={`flex items-center gap-4 bg-${color}-500/10 text-${color}-400 px-10 py-5 rounded-[2rem] font-black text-xs uppercase hover:bg-${color}-500 hover:text-white transition-all shadow-xl border border-${color}-500/20 active:scale-95`}>
        <Icon size={20}/> {label} Export
    </button>
);

const TipCard = ({ icon: Icon, title, hint, color }) => (
    <motion.div 
        whileHover={{ y: -10 }}
        className="bg-slate-900/40 backdrop-blur-md p-10 rounded-[3.5rem] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group shadow-2xl"
    >
        <div className={`w-16 h-16 bg-white/5 text-${color}-400 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner border border-white/5`}>
            <Icon size={32} />
        </div>
        <h4 className="text-lg font-black text-white uppercase tracking-wider mb-3">{title}</h4>
        <p className="text-slate-500 text-xs font-bold italic leading-relaxed">Ask AI: <span className="text-indigo-400">"{hint}"</span></p>
    </motion.div>
);

export default SakshamAI;
