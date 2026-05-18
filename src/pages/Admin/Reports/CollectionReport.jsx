import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { FileSpreadsheet, File as FilePdf, Settings2, RefreshCcw, Loader2, Filter } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const CollectionReport = () => {
    const [data, setData] = useState([]); // Default empty array
    const [loading, setLoading] = useState(true);
    const [showColManager, setShowColManager] = useState(false);
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    const [columns, setColumns] = useState([
        { id: 'hhd_id', label: 'Household ID', visible: true },
        { id: 'ward_no', label: 'Ward No', visible: true },
        { id: 'garbage_type', label: 'Waste Type', visible: true },
        { id: 'staff_name', label: 'Collected By', visible: true },
        { id: 'collection_time', label: 'Timestamp', visible: true },
    ]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/reports/collection/${tenantId}`);
            
            // 🔥 CRASH FIX: Pehle check karein ki data array hai ya nahi
            if (res.data && Array.isArray(res.data.data)) {
                setData(res.data.data);
            } else {
                setData([]);
                console.error("Backend did not return an array:", res.data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setData([]); // Fallback to empty array
            toast.error("Database connection failed");
        } finally {
            setLoading(false);
        }
    };

    const toggleColumn = (id) => {
        setColumns(columns.map(col => col.id === id ? { ...col, visible: !col.visible } : col));
    };

    // --- EXCEL EXPORT ---
    const exportExcel = async () => {
        if (data.length === 0) return toast.error("No data to export");
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Report');
        const visibleCols = columns.filter(c => c.visible);
        sheet.columns = visibleCols.map(c => ({ header: c.label, key: c.id, width: 25 }));
        data.forEach(row => {
            const rowData = { ...row };
            rowData.collection_time = new Date(row.collection_time).toLocaleString();
            sheet.addRow(rowData);
        });
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Collection_Report.xlsx`);
    };

    // --- PDF EXPORT ---
    const exportPDF = () => {
        if (data.length === 0) return toast.error("No data to export");
        const doc = new jsPDF();
        const visibleCols = columns.filter(c => c.visible);
        const headers = [visibleCols.map(c => c.label)];
        const body = data.map(row => visibleCols.map(col => {
            if(col.id === 'collection_time') return new Date(row[col.id]).toLocaleString();
            return row[col.id] || 'N/A';
        }));
        doc.autoTable({ head: headers, body: body, startY: 20, theme: 'grid', headStyles: { fillColor: [79, 70, 229] } });
        doc.save("Collection_Report.pdf");
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Collection Report</h1>
                        <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em]">D2D Waste Tracking</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <button onClick={() => setShowColManager(!showColManager)} className="p-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-[9px] uppercase flex items-center gap-2">
                                <Settings2 size={16}/> Columns
                            </button>
                            {showColManager && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border p-4 z-[100]">
                                    {columns.map(col => (
                                        <label key={col.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 cursor-pointer">
                                            <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.id)} className="accent-emerald-500" />
                                            <span className="text-[10px] font-bold text-slate-600">{col.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={exportExcel} className="p-3 bg-emerald-50 text-emerald-600 border rounded-2xl font-black text-[9px] uppercase">Excel</button>
                        <button onClick={exportPDF} className="p-3 bg-rose-50 text-rose-600 border rounded-2xl font-black text-[9px] uppercase">PDF</button>
                    </div>
                </header>

                {/* --- TABLE AREA --- */}
                <div className="bg-white rounded-[45px] border border-slate-100 shadow-2xl overflow-hidden min-h-[400px]">
                    <div className="p-6 border-b bg-slate-50/30 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Records: {data.length}</span>
                        <button onClick={fetchData} className="p-2 bg-white rounded-full shadow-sm">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    {columns.filter(c => c.visible).map(col => (
                                        <th key={col.id} className="p-6">{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={columns.length} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr>
                                ) : (!Array.isArray(data) || data.length === 0) ? (
                                    <tr><td colSpan={columns.length} className="p-20 text-center font-black text-slate-300 uppercase tracking-[0.4em]">No Records Found</td></tr>
                                ) : data.map((row, idx) => (
                                    <tr 
                                        key={idx} 
                                        className={`
                                            transition-all duration-150 cursor-default group
                                            ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} 
                                            hover:bg-emerald-600 hover:text-white
                                        `}
                                    >
                                        {columns.filter(c => c.visible).map(col => (
                                            <td key={col.id} className="p-6 border-b border-slate-50/50">
                                                {col.id === 'garbage_type' ? (
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${row[col.id] === 'wet' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-400 group-hover:text-white'}`}>
                                                        {row[col.id]}
                                                    </span>
                                                ) : col.id === 'collection_time' ? (
                                                    <span className="opacity-70 font-bold text-xs">{new Date(row[col.id]).toLocaleString()}</span>
                                                ) : (
                                                    <span className="font-bold text-sm">{row[col.id] || '---'}</span>
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
