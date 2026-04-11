import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { FileSpreadsheet, File as FilePdf, Settings2, RefreshCcw, Loader2, Zap, Droplet, Fuel, Gauge, Filter } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FuelReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showColManager, setShowColManager] = useState(false);
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // 1. All Possible Columns (Headers)
    const allColumns = [
        { id: 'coupon_code', label: 'Coupon No', visible: true },
        { id: 'vehicle_no', label: 'Vehicle No', visible: true },
        { id: 'vehicle_type', label: 'Type', visible: true },
        { id: 'fuel_qty', label: 'Fuel (Ltrs)', visible: true },
        { id: 'billing_amount', label: 'Amount (₹)', visible: true },
        { id: 'odometer_reading', label: 'Odometer', visible: true },
        { id: 'fill_date', label: 'Date/Time', visible: true },
    ];
    const [columns, setColumns] = useState(allColumns);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/reports/fuel-analysis/${tenantId}`);
            setData(res.data || []);
        } catch (err) { toast.error("Fuel data sync failed"); }
        finally { setLoading(false); }
    };

    const toggleColumn = (id) => {
        setColumns(columns.map(col => col.id === id ? { ...col, visible: !col.visible } : col));
    };

    // --- EXPORTS ---
    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Fuel_Log');
        const visibleCols = columns.filter(c => c.visible);
        sheet.columns = visibleCols.map(c => ({ header: c.label.toUpperCase(), key: c.id, width: 20 }));
        sheet.addRows(data);
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Fuel_Analysis_Report.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Vehicle Fuel & Mileage Audit", 14, 15);
        const visibleCols = columns.filter(c => c.visible);
        const headers = [visibleCols.map(c => c.label)];
        const rows = data.map(row => visibleCols.map(col => row[col.id]));
        doc.autoTable({ head: headers, body: rows, startY: 20, theme: 'grid', headStyles: { fillColor: [245, 158, 11] } });
        doc.save(`Fuel_Report.pdf`);
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[45px] shadow-sm border border-slate-100 gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Fuel & Mileage Analysis</h1>
                        <p className="text-amber-600 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                           <Fuel size={14}/> Fleet Energy Consumption Audit
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <button onClick={() => setShowColManager(!showColManager)} className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 font-black text-[10px] uppercase border border-slate-100 shadow-inner">
                                <Settings2 size={18}/> Manage Headers
                            </button>
                            {showColManager && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 z-[100] animate-in fade-in zoom-in-95">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-3 border-b pb-2 tracking-widest">Select Visible Columns</p>
                                    <div className="space-y-2">
                                        {columns.map(col => (
                                            <label key={col.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                                                <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.id)} className="w-4 h-4 rounded accent-amber-500" />
                                                <span className="text-xs font-bold text-slate-600">{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={exportExcel} className="p-4 bg-amber-500 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-xl flex items-center gap-2 font-black text-[10px] uppercase">
                            <FileSpreadsheet size={18}/> Excel Export
                        </button>
                        <button onClick={exportPDF} className="p-4 bg-rose-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase">
                            <FilePdf size={18}/> PDF Audit
                        </button>
                    </div>
                </header>

                {/* --- ANALYTICS PODS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ReportPod label="Total Fuel Consumed" value={`${data.reduce((s, c) => s + parseFloat(c.fuel_qty || 0), 0).toFixed(1)} Ltrs`} icon={Droplet} color="amber" />
                    <ReportPod label="Total Fuel Spending" value={`₹${data.reduce((s, c) => s + parseFloat(c.billing_amount || 0), 0).toLocaleString()}`} icon={Zap} color="rose" />
                    <ReportPod label="Fleet Active" value={`${new Set(data.map(d => d.vehicle_no)).size} Vehicles`} icon={Gauge} color="blue" />
                </div>

                {/* --- DATA TABLE --- */}
                <div className="bg-white rounded-[55px] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Fuel Consumption Log</span>
                        </div>
                        <button onClick={fetchData} className="p-2 text-slate-400 hover:text-amber-500 transition-all">
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    {columns.filter(c => c.visible).map(col => (
                                        <th key={col.id} className="p-6">{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={columns.length} className="p-32 text-center text-amber-500"><Loader2 className="animate-spin mx-auto mb-4" size={40}/><p className="text-[10px] font-black uppercase tracking-widest opacity-50">Fetching Fuel Logs...</p></td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={columns.length} className="p-32 text-center font-black text-slate-300 uppercase tracking-[0.4em] italic">No Fuel Records Found</td></tr>
                                ) : data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-amber-50/30 transition-all duration-300 group">
                                        {columns.filter(c => c.visible).map(col => (
                                            <td key={col.id} className="p-6">
                                                {col.id === 'fuel_qty' ? (
                                                    <span className="font-black text-slate-800 text-base">{row[col.id]} <span className="text-[10px] text-slate-400">L</span></span>
                                                ) : col.id === 'fill_date' ? (
                                                    <span className="text-slate-400 font-bold text-xs">{new Date(row[col.id]).toLocaleString('en-IN')}</span>
                                                ) : col.id === 'billing_amount' ? (
                                                    <span className="font-black text-emerald-600">₹{row[col.id]}</span>
                                                ) : (
                                                    <span className="font-bold text-slate-600 text-sm uppercase">{row[col.id] || '---'}</span>
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

const ReportPod = ({ label, value, icon: Icon, color }) => {
    const colorMap = {
        amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50",
        rose: "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50",
        blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50"
    };
    return (
        <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`}>
                <Icon size={32} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
                <h4 className="text-3xl font-black text-slate-800 tracking-tighter tabular-nums leading-none">{value}</h4>
            </div>
        </div>
    );
};

export default FuelReport;