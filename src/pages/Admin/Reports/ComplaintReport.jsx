import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { FileSpreadsheet, File as FilePdf, Settings2, RefreshCcw, Loader2, ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ComplaintReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showColManager, setShowColManager] = useState(false);
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // 1. Dynamic Headers Management
    const allColumns = [
        { id: 'grievance_no', label: 'Ref No', visible: true },
        { id: 'complainant_name', label: 'Citizen Name', visible: true },
        { id: 'issue_type', label: 'Grievance Type', visible: true },
        { id: 'ward_no', label: 'Ward', visible: true },
        { id: 'status', label: 'Status', visible: true },
        { id: 'created_at', label: 'Logged Date', visible: true },
    ];
    const [columns, setColumns] = useState(allColumns);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/reports/grievance/${tenantId}`);
            setData(Array.isArray(res.data) ? res.data : []);
        } catch (err) { toast.error("Data fetch fail ho gaya"); }
        finally { setLoading(false); }
    };

    const toggleColumn = (id) => {
        setColumns(columns.map(col => col.id === id ? { ...col, visible: !col.visible } : col));
    };

    // --- EXPORT LOGIC ---
    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Complaints');
        const visibleCols = columns.filter(c => c.visible);
        sheet.columns = visibleCols.map(c => ({ header: c.label.toUpperCase(), key: c.id, width: 20 }));
        sheet.addRows(data);
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Grievance_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Grievance Redressal Audit Report", 14, 20);
        const visibleCols = columns.filter(c => c.visible);
        const headers = [visibleCols.map(c => c.label)];
        const rows = data.map(row => visibleCols.map(col => row[col.id]));
        doc.autoTable({ head: headers, body: rows, startY: 30, theme: 'striped', headStyles: { fillColor: [225, 29, 72] } }); // Rose Color for PDF
        doc.save(`Grievance_Report.pdf`);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Complaint Analytics</h1>
                        <p className="text-rose-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Citizen Grievance Redressal Audit</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <button onClick={() => setShowColManager(!showColManager)} className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 font-black text-[10px] uppercase shadow-inner border border-slate-100">
                                <Settings2 size={18}/> Manage Headers
                            </button>
                            {showColManager && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-[100] animate-in fade-in slide-in-from-top-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-3 border-b pb-2 tracking-widest">Toggle Columns</p>
                                    <div className="space-y-2">
                                        {columns.map(col => (
                                            <label key={col.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                                                <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.id)} className="w-4 h-4 rounded accent-rose-500" />
                                                <span className="text-xs font-bold text-slate-600">{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={exportExcel} className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase">
                            <FileSpreadsheet size={18}/> Export Excel
                        </button>
                        <button onClick={exportPDF} className="p-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase">
                            <FilePdf size={18}/> Save PDF
                        </button>
                    </div>
                </header>

                {/* --- ANALYTICS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <AnalyticsCard label="Total Logged" value={data.length} icon={ClipboardList} color="text-slate-600" bg="bg-slate-100" />
                    <AnalyticsCard label="Resolved" value={data.filter(d => d.status === 'Resolved').length} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" />
                    <AnalyticsCard label="Pending/Open" value={data.filter(d => d.status === 'Open').length} icon={Clock} color="text-rose-600" bg="bg-rose-50" />
                    <AnalyticsCard label="In Progress" value={data.filter(d => d.status === 'In-Progress').length} icon={AlertCircle} color="text-amber-600" bg="bg-amber-50" />
                </div>

                {/* --- DATA TABLE --- */}
                <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Grievance Master Data Log</span>
                        <button onClick={fetchData} className="p-2 text-slate-400 hover:text-rose-500 transition-all">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    {columns.filter(c => c.visible).map(col => (
                                        <th key={col.id} className="p-6">{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={columns.length} className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-rose-500" size={40}/></td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={columns.length} className="p-32 text-center font-black text-slate-300 uppercase tracking-[0.5em]">No Complaints Found</td></tr>
                                ) : data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                                        {columns.filter(c => c.visible).map(col => (
                                            <td key={col.id} className="p-6">
                                                {col.id === 'status' ? (
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                                        row[col.id] === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                        row[col.id] === 'Open' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                        {row[col.id]}
                                                    </span>
                                                ) : col.id === 'created_at' ? (
                                                    <span className="text-slate-400 font-bold text-xs">{new Date(row[col.id]).toLocaleDateString('en-IN')}</span>
                                                ) : (
                                                    <span className="font-bold text-slate-700 text-sm uppercase">{row[col.id] || '---'}</span>
                                                )}
                                            </td>
                                        ))}
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

const AnalyticsCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-7 rounded-[35px] border border-slate-50 shadow-sm flex items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color} shadow-inner`}>
            <Icon size={28} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-3xl font-black text-slate-800 tabular-nums leading-none">{value}</h4>
        </div>
    </div>
);

export default ComplaintReport;