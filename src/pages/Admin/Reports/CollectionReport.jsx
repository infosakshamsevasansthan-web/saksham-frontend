import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { FileSpreadsheet, File as FilePdf, Settings2, RefreshCcw, Loader2, Filter, Printer } from 'lucide-react';
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

    const [columns, setColumns] = useState([
        { id: 'hhd_id', label: 'House ID', visible: true },
        { id: 'ward_no', label: 'Ward No', visible: true },
        { id: 'garbage_type', label: 'Waste Type', visible: true },
        { id: 'weight_kg', label: 'Weight (KG)', visible: true },
        { id: 'collection_time', label: 'Collected At', visible: true },
        { id: 'staff_name', label: 'Worker', visible: true },
    ]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // URL matched with new Backend route
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/reports/collection/${tenantId}`);
            if(res.data.success) {
                setData(res.data.data || []);
            } else {
                setData([]);
            }
        } catch (err) { 
            toast.error("Database sync failed"); 
            console.error(err);
        }
        finally { setLoading(false); }
    };

    const toggleColumn = (id) => {
        setColumns(columns.map(col => col.id === id ? { ...col, visible: !col.visible } : col));
    };

    // --- EXCEL EXPORT ---
    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Collection Report');
        const visibleCols = columns.filter(c => c.visible);
        
        sheet.columns = visibleCols.map(c => ({ header: c.label, key: c.id, width: 20 }));
        data.forEach(row => {
            const formattedRow = { ...row };
            if(row.collection_time) formattedRow.collection_time = new Date(row.collection_time).toLocaleString();
            sheet.addRow(formattedRow);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Collection_Report_${new Date().toLocaleDateString()}.xlsx`);
        toast.success("Excel Exported!");
    };

    // --- PDF EXPORT ---
    const exportPDF = () => {
        const doc = new jsPDF();
        const visibleCols = columns.filter(c => c.visible);
        const headers = [visibleCols.map(c => c.label)];
        const body = data.map(row => visibleCols.map(col => {
            if(col.id === 'collection_time') return new Date(row[col.id]).toLocaleString();
            return row[col.id] || '---';
        }));

        doc.text("D2D Waste Collection Report", 14, 15);
        doc.autoTable({
            head: headers,
            body: body,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] } // Emerald Green
        });
        doc.save(`Collection_Report_${new Date().getTime()}.pdf`);
        toast.success("PDF Exported!");
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Collection Report</h1>
                        <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">D2D Waste Tracking Analytics</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Manage Columns */}
                        <div className="relative">
                            <button onClick={() => setShowColManager(!showColManager)} className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2 font-black text-[9px] uppercase">
                                <Settings2 size={16}/> Columns
                            </button>
                            {showColManager && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-[100]">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-3">Visible Headers</p>
                                    <div className="space-y-1">
                                        {columns.map(col => (
                                            <label key={col.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                                                <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.id)} className="w-3 h-3 rounded accent-emerald-500" />
                                                <span className="text-[10px] font-bold text-slate-600">{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Export Buttons */}
                        <button onClick={exportExcel} className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 font-black text-[9px] uppercase">
                            <FileSpreadsheet size={16}/> Excel
                        </button>
                        <button onClick={exportPDF} className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2 font-black text-[9px] uppercase">
                            <FilePdf size={16}/> PDF
                        </button>
                    </div>
                </header>

                {/* --- TABLE AREA --- */}
                <div className="bg-white rounded-[45px] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Filter size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total {data.length} Collections Found</span>
                        </div>
                        <button onClick={fetchData} className="p-2 bg-white text-slate-400 hover:text-emerald-500 rounded-full shadow-sm transition-all">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            {/* Colorful Header (Not Black) */}
                            <thead className="bg-gradient-to-r from-slate-700 to-emerald-800 text-white text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    {columns.filter(c => c.visible).map(col => (
                                        <th key={col.id} className="p-6">{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={columns.length} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={columns.length} className="p-20 text-center font-black text-slate-300 uppercase tracking-[0.4em]">No Data in Logs</td></tr>
                                ) : data.map((row, idx) => (
                                    <tr 
                                        key={idx} 
                                        // Multi-color row logic + Hover effect
                                        className={`
                                            transition-all duration-200 group cursor-default
                                            ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} 
                                            hover:bg-emerald-500 hover:text-white
                                        `}
                                    >
                                        {columns.filter(c => c.visible).map(col => (
                                            <td key={col.id} className="p-6 border-b border-slate-50/50">
                                                {col.id === 'garbage_type' ? (
                                                    <span className={`
                                                        px-3 py-1 rounded-full text-[9px] font-black uppercase 
                                                        ${row[col.id]?.toLowerCase() === 'wet' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'}
                                                    `}>
                                                        {row[col.id]}
                                                    </span>
                                                ) : col.id === 'collection_time' ? (
                                                    <span className="opacity-70 font-bold text-xs">
                                                        {row[col.id] ? new Date(row[col.id]).toLocaleString() : 'N/A'}
                                                    </span>
                                                ) : (
                                                    <span className="font-bold text-sm tracking-tight">{row[col.id] || '---'}</span>
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
