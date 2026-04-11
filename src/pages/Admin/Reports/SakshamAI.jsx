import React, { useState } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Sparkles, Terminal, FileSpreadsheet, File as FilePdf, Loader2, RefreshCcw, Search, Download, Database } from 'lucide-react';
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
        e.preventDefault();
        if (!prompt.trim()) return toast.error("Bhai, kuch toh puchho AI se!");
        
        setLoading(true);
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/reports/ai-engine', { prompt, tenantId });
            setReportData(res.data);
            toast.success("AI ne Report taiyar kar di hai! ✨");
        } catch (err) {
            toast.error(err.response?.data?.message || "AI logic fail ho gaya");
        } finally { setLoading(false); }
    };

    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Report');
        const headers = Object.keys(reportData.data[0]);
        sheet.columns = headers.map(h => ({ header: h.toUpperCase(), key: h, width: 20 }));
        sheet.addRows(reportData.data);
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${reportData.title}.xlsx`);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text(reportData.title, 14, 15);
        doc.autoTable({
            head: [Object.keys(reportData.data[0]).map(h => h.toUpperCase())],
            body: reportData.data.map(obj => Object.values(obj)),
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] } // Emerald Color
        });
        doc.save(`${reportData.title}.pdf`);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left">
                
                {/* --- AI PROMPT INTERFACE --- */}
                <div className="bg-slate-950 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden border-b-[10px] border-emerald-500">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3">
                                <Sparkles size={32} className="text-slate-900" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Saksham AI Engine</h1>
                                <p className="text-emerald-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Smart Natural Language Reporting</p>
                            </div>
                        </div>

                        <form onSubmit={handleAISearch} className="relative max-w-4xl group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:animate-pulse">
                                <Terminal size={24}/>
                            </div>
                            <input 
                                className="w-full bg-white/5 border-2 border-white/10 rounded-[35px] py-6 pl-16 pr-40 text-xl font-bold placeholder:text-slate-700 outline-none focus:border-emerald-500 focus:bg-white/10 transition-all shadow-inner"
                                placeholder="Puchho AI se: 'Aaj ki shikayat dikhao' ya 'Staff list'..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <button 
                                type="submit" disabled={loading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-[28px] font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-xl shadow-emerald-500/20"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>}
                                Generate
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- RESULTS SECTION --- */}
                <AnimatePresence mode="wait">
                    {reportData ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[50px] border border-slate-100 shadow-2xl overflow-hidden"
                        >
                            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-6">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">{reportData.title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Database size={14} className="text-emerald-500" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Records Found: {reportData.data.length}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={downloadExcel} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                        <FileSpreadsheet size={18}/> Excel Export
                                    </button>
                                    <button onClick={downloadPDF} className="flex items-center gap-2 bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                        <FilePdf size={18}/> Save PDF
                                    </button>
                                    <button onClick={() => setReportData(null)} className="p-3 bg-slate-200 text-slate-500 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                                        <RefreshCcw size={20}/>
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            {Object.keys(reportData.data[0]).map(key => (
                                                <th key={key} className="p-6">{key.replace("_", " ")}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reportData.data.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                                                {Object.values(row).map((val, i) => (
                                                    <td key={i} className="p-6 font-bold text-slate-600 text-sm">{val || '---'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
                            <GuideCard title="Complaints" prompt="Aaj ki pending shikayat dikhao" color="rose" />
                            <GuideCard title="Staff" prompt="Karmachariyon ki list dikhao" color="blue" />
                            <GuideCard title="Collection" prompt="Wet garbage collection details" color="emerald" />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </CityLayout>
    );
};

const GuideCard = ({ title, prompt, color }) => (
    <div className={`p-8 bg-white border-b-4 border-${color}-500 rounded-[40px] shadow-sm hover:shadow-xl transition-all cursor-pointer group`}>
        <h4 className={`text-sm font-black text-${color}-600 uppercase tracking-widest mb-3`}>{title}</h4>
        <p className="text-slate-400 text-xs italic font-bold">Try asking: "{prompt}"</p>
    </div>
);

export default SakshamAI;