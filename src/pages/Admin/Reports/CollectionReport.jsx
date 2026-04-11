import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { FileSpreadsheet, File as FilePdf, Settings2, Download, Filter, RefreshCcw, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CollectionReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showColManager, setShowColManager] = useState(false);
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // 1. All Possible Columns (Headers)
    const allColumns = [
        { id: 'hhd_id', label: 'House ID', visible: true },
        { id: 'ward_no', label: 'Ward No', visible: true },
        { id: 'garbage_type', label: 'Waste Type', visible: true },
        { id: 'weight_kg', label: 'Weight (KG)', visible: true },
        { id: 'collection_time', label: 'Collected At', visible: true },
    ];
    const [columns, setColumns] = useState(allColumns);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/reports/collection/${tenantId}`);
            setData(res.data || []);
        } catch (err) { toast.error("Database sync failed"); }
        finally { setLoading(false); }
    };

    // --- COLUMN TOGGLE LOGIC ---
    const toggleColumn = (id) => {
        setColumns(columns.map(col => col.id === id ? { ...col, visible: !col.visible } : col));
    };

    // --- EXPORTS ---
    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Report');
        const visibleCols = columns.filter(c => c.visible);
        sheet.columns = visibleCols.map(c => ({ header: c.label, key: c.id, width: 20 }));
        sheet.addRows(data);
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Collection_Report.xlsx`);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                
                {/* --- HEADER --- */}
                <header className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Collection Report</h1>
                        <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">D2D Waste Tracking Analytics</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Header Manager Button */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowColManager(!showColManager)}
                                className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 font-black text-[10px] uppercase shadow-inner"
                            >
                                <Settings2 size={18}/> Manage Columns
                            </button>
                            
                            {showColManager && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-[100] animate-in fade-in slide-in-from-top-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-3 border-b pb-2">Select Visible Headers</p>
                                    <div className="space-y-2">
                                        {columns.map(col => (
                                            <label key={col.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                                                <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.id)} className="w-4 h-4 rounded accent-emerald-500" />
                                                <span className="text-xs font-bold text-slate-600">{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={exportExcel} className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 font-black text-[10px] uppercase">
                            <FileSpreadsheet size={18}/> Export Excel
                        </button>
                    </div>
                </header>

                {/* --- TABLE AREA --- */}
                <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Filter size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {data.length} Records</span>
                        </div>
                        <button onClick={fetchData} className="p-2 text-slate-400 hover:text-emerald-500 transition-all"><RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/></button>
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
                                    <tr><td colSpan={columns.length} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={columns.length} className="p-20 text-center font-black text-slate-300 uppercase tracking-[0.4em]">No Data Available</td></tr>
                                ) : data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                                        {columns.filter(c => c.visible).map(col => (
                                            <td key={col.id} className="p-6">
                                                {col.id === 'garbage_type' ? (
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${row[col.id] === 'Wet' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        {row[col.id]}
                                                    </span>
                                                ) : col.id === 'collection_time' ? (
                                                    <span className="text-slate-400 font-bold text-xs">{new Date(row[col.id]).toLocaleString()}</span>
                                                ) : (
                                                    <span className="font-bold text-slate-700 text-sm">{row[col.id] || '---'}</span>
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

export default CollectionReport;