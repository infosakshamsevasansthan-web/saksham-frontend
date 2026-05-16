import React, { useState } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Sparkles, Terminal, FileSpreadsheet, File as FilePdf, Loader2, RefreshCcw, Search, Download, Database, Cpu, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
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
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    const handleAISearch = async (e) => {
        if(e) e.preventDefault();
        if (!prompt.trim()) return toast.error("Bhai, AI se baat toh karo!");
        setLoading(true);
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/reports/ai-engine', { prompt, tenantId });
            setReportData(res.data);
            toast.success("Intelligence Report Taiyar Hai! ✨");
        } catch (err) {
            toast.error(err.response?.data?.message || "AI Connection Failed");
        } finally { setLoading(false); }
    };

    // ✨ Color Badge Logic for Table
    const getBadgeStyle = (val) => {
        const text = String(val).toLowerCase();
        if (['active', 'processed', 'resolved', 'running', 'a'].includes(text)) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        if (['pending', 'open', 'maintenance', 'mixed', 'b'].includes(text)) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        if (['inactive', 'suspended', 'breakdown', 'dry'].includes(text)) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        return 'bg-slate-100 text-slate-500 border-slate-200';
    };

    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('AI_Report');
        const headers = Object.keys(reportData.data[0]);
        sheet.getRow(1).values = headers.map(h => h.toUpperCase());
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', fillType: 'solid', fgColor: { argb: '0F172A' } };
        
        reportData.data.forEach(row => sheet.addRow(Object.values(row)));
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${reportData.title}.xlsx`);
    };

    const downloadPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(18);
        doc.text("SAKSHAM AI COMMAND CENTER", 14, 15);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Report: ${reportData.title}`, 14, 22);
        
        doc.autoTable({
            head: [Object.keys(reportData.data[0]).map(h => h.toUpperCase())],
            body: reportData.data.map(obj => Object.values(obj)),
            startY: 30,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });
        doc.save(`${reportData.title}.pdf`);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-6 space-y-8 bg-[#f8fafc] min-h-screen font-sans">
                
                {/* --- FUTURISTIC AI PROMPT --- */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border-b-[12px] border-emerald-500 group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Cpu size={200}/></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
                                <Sparkles size={32} className="text-slate-900 animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Saksham AI Mitra</h1>
                                <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Real-time Autonomous Query Engine</p>
                            </div>
                        </div>

                        <form onSubmit={handleAISearch} className="relative max-w-5xl group">
                            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-emerald-500">
                                <Terminal size={26}/>
                            </div>
                            <input 
                                className="w-full bg-white/5 border-2 border-white/10 rounded-full py-8 pl-20 pr-48 text-xl font-bold placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all shadow-inner"
                                placeholder="Type anything: 'Today's dry waste', 'List active staff', 'Compost stock'..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <button 
                                type="submit" disabled={loading}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-10 py-5 rounded-full font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-2xl"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20}/> : <Cpu size={20}/>}
                                Generate Report
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- RESULTS DASHBOARD --- */}
                <AnimatePresence mode="wait">
                    {reportData ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl overflow-hidden"
                        >
                            {/* Toolbar */}
                            <div className="p-10 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center bg-slate-50/50 gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-slate-900 rounded-2xl text-emerald-400 shadow-xl"><Database size={24}/></div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">{reportData.title}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Intelligence Insight • {reportData.data.length} Records Found</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <ExportButton onClick={downloadExcel} icon={FileSpreadsheet} label="Excel" color="emerald" />
                                    <ExportButton onClick={downloadPDF} icon={FilePdf} label="PDF" color="rose" />
                                    <button onClick={() => setReportData(null)} className="p-4 bg-slate-200 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all"><RefreshCcw size={20}/></button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {Object.keys(reportData.data[0]).map(key => (
                                                <th key={key} className="px-8 py-6">{key.replace("_", " ")}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.data.map((row, idx) => (
                                            <tr key={idx} className="group transition-all">
                                                {Object.values(row).map((val, i) => (
                                                    <td key={i} className="px-8 py-6 bg-slate-50 group-hover:bg-emerald-50/50 first:rounded-l-[2rem] last:rounded-r-[2rem] transition-colors">
                                                        {typeof val === 'string' && val.length < 15 ? (
                                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getBadgeStyle(val)}`}>
                                                                {val}
                                                            </span>
                                                        ) : (
                                                            <span className="font-bold text-slate-600 text-sm">{val || '---'}</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <SmartTip title="Staff Report" tip="Aaj kitne log duty par hain?" icon={Users} color="blue" />
                            <SmartTip title="Waste Analytics" tip="Ward 01 ka kachra dikhao" icon={CheckCircle2} color="emerald" />
                            <SmartTip title="Fleet Status" tip="Vehicles with low fuel" icon={Truck} color="amber" />
                            <SmartTip title="Complaints" tip="Show all pending grievances" icon={AlertCircle} color="rose" />
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </CityLayout>
    );
};

// --- ✨ UI Sub-Components ---

const ExportButton = ({ onClick, icon: Icon, label, color }) => (
    <button onClick={onClick} className={`flex items-center gap-3 bg-${color}-50 text-${color}-600 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase hover:bg-${color}-600 hover:text-white transition-all shadow-sm border border-${color}-100`}>
        <Icon size={18}/> {label} Export
    </button>
);

const SmartTip = ({ title, tip, icon: Icon, color }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
        <div className={`w-12 h-12 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <Icon size={24}/>
        </div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">{title}</h4>
        <p className="text-slate-400 text-xs font-bold leading-relaxed italic">Ask: "{tip}"</p>
    </div>
);

const Truck = ({size}) => <Database size={size} />; // Fallback icon
const Users = ({size}) => <Cpu size={size} />; // Fallback icon

export default SakshamAI;
