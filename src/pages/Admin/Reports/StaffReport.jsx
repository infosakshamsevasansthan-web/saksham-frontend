import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { FileSpreadsheet, File as FilePdf, Settings2, RefreshCcw, Loader2, Users, UserCheck, UserX, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StaffReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showColManager, setShowColManager] = useState(false);
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // 1. All Possible Columns for Staff
    const allColumns = [
        { id: 'employee_id', label: 'Employee ID', visible: true },
        { id: 'full_name_en', label: 'Staff Name', visible: true },
        { id: 'mobile', label: 'Contact No', visible: true },
        { id: 'status', label: 'Current Status', visible: true },
        { id: 'created_at', label: 'Joining Date', visible: true },
    ];
    const [columns, setColumns] = useState(allColumns);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/reports/staff/${tenantId}`);
            setData(res.data || []);
        } catch (err) { toast.error("Staff data fetch failed"); }
        finally { setLoading(false); }
    };

    const toggleColumn = (id) => {
        setColumns(columns.map(col => col.id === id ? { ...col, visible: !col.visible } : col));
    };

    // --- EXPORTS ---
    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Staff_Report');
        const visibleCols = columns.filter(c => c.visible);
        sheet.columns = visibleCols.map(c => ({ header: c.label, key: c.id, width: 25 }));
        sheet.addRows(data);
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Staff_Performance_Report.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Staff Performance & Directory Report", 14, 15);
        const visibleCols = columns.filter(c => c.visible);
        const headers = [visibleCols.map(c => c.label)];
        const rows = data.map(row => visibleCols.map(col => row[col.id]));
        doc.autoTable({ head: headers, body: rows, startY: 20, theme: 'grid', headStyles: { fillColor: [15, 23, 42] } });
        doc.save(`Staff_Report.pdf`);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                
                {/* --- HEADER --- */}
                <header className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Staff Performance</h1>
                        <p className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Human Resource Directory & Analytics</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <button onClick={() => setShowColManager(!showColManager)} className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 font-black text-[10px] uppercase shadow-inner">
                                <Settings2 size={18}/> Table Settings
                            </button>
                            {showColManager && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-[100] animate-in fade-in slide-in-from-top-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-3 border-b pb-2">Select Headers</p>
                                    <div className="space-y-2">
                                        {columns.map(col => (
                                            <label key={col.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                                                <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.id)} className="w-4 h-4 rounded accent-blue-500" />
                                                <span className="text-xs font-bold text-slate-600">{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={exportExcel} className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase">
                            <FileSpreadsheet size={18}/> Excel
                        </button>
                        <button onClick={exportPDF} className="p-4 bg-rose-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase">
                            <FilePdf size={18}/> PDF
                        </button>
                    </div>
                </header>

                {/* --- QUICK STATS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatBox label="Total Staff" value={data.length} icon={Users} color="text-blue-600" bg="bg-blue-50" />
                    <StatBox label="Active On Field" value={data.filter(s => s.status === 'active').length} icon={UserCheck} color="text-emerald-600" bg="bg-emerald-50" />
                    <StatBox label="Inactive/Suspended" value={data.filter(s => s.status !== 'active').length} icon={UserX} color="text-rose-600" bg="bg-rose-50" />
                </div>

                {/* --- TABLE AREA --- */}
                <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl overflow-hidden min-h-[400px]">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Staff Records</span>
                        <button onClick={fetchData} className="p-2 text-slate-400 hover:text-blue-500 transition-all"><RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/></button>
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
                                    <tr><td colSpan={columns.length} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={40}/></td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={columns.length} className="p-20 text-center font-black text-slate-300 uppercase tracking-[0.4em]">No Records Found</td></tr>
                                ) : data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                        {columns.filter(c => c.visible).map(col => (
                                            <td key={col.id} className="p-6">
                                                {col.id === 'status' ? (
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${row[col.id] === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        {row[col.id]}
                                                    </span>
                                                ) : col.id === 'created_at' ? (
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Calendar size={14}/>
                                                        <span className="font-bold text-xs">{new Date(row[col.id]).toLocaleDateString()}</span>
                                                    </div>
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

const StatBox = ({ label, value, icon: Icon, color, bg }) => (
    <div className={`bg-white p-6 rounded-[35px] border border-slate-50 shadow-sm flex items-center gap-5`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color} shadow-inner`}>
            <Icon size={28} />
        </div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-3xl font-black text-slate-800 tabular-nums">{value}</h4>
        </div>
    </div>
);

export default StaffReport;