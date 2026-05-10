import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Smartphone, ShieldCheck, ShieldAlert, Map, UserX, UserCheck, RefreshCcw, Loader2, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DeviceControl = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    useEffect(() => { fetchDevices(); }, []);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/devices/${tenantId}`);
            // Safety: Agar data na mile toh empty array set karein
            setDevices(res.data.data || []);
        } catch (err) { 
            toast.error("Database connection failed"); 
            setDevices([]); // Error case mein empty array rakhein
        }
        finally { setLoading(false); }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/devices/update-status', { id, status });
            toast.success(`Device status updated to ${status}`);
            fetchDevices();
        } catch (err) { toast.error("Update failed"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-8 text-left">
                
                {/* --- HEADER --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-xl">
                            <Smartphone size={32}/>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Device & App Control</h1>
                            <p className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                <ShieldCheck size={14}/> Safai Mitra Handset Management
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchDevices} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-600 transition-all border border-slate-100">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/>
                        </button>
                        <button 
                            onClick={() => navigate('/admin/device-control/geofence')}
                            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-emerald-100"
                        >
                            <Map size={18}/> Manage Geofencing
                        </button>
                    </div>
                </header>

                {/* --- STATS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusSummary label="Pending Requests" value={(devices || []).filter(d => d.status === 'Pending').length} color="rose" icon={ShieldAlert} />
                    <StatusSummary label="Authorized Active" value={(devices || []).filter(d => d.status === 'Active').length} color="emerald" icon={UserCheck} />
                    <StatusSummary label="Blocked Handsets" value={(devices || []).filter(d => d.status === 'Blocked').length} color="slate" icon={UserX} />
                </div>

                {/* --- DEVICE LIST TABLE --- */}
                <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Connected Device Registry</h3>
                        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100">
                            <Search size={16} className="text-slate-300 ml-2" />
                            <input className="outline-none text-xs font-bold text-slate-600 w-48" placeholder="Search Staff or ID..." />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="p-6">Safai Mitra / Staff</th>
                                    <th className="p-6">Handset Details</th>
                                    <th className="p-6">Ward Link</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-right">Access Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(devices || []).map((device) => (
                                    <tr key={device.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-6">
                                            <p className="font-black text-slate-800 text-sm uppercase">{device.staff_name || 'Unknown Staff'}</p>
                                            <p className="text-[10px] font-bold text-slate-400">ID: {device.employee_id || 'N/A'}</p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Smartphone size={14} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">{device.device_model}</span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-mono mt-1">{device.device_id}</p>
                                        </td>
                                        <td className="p-6">
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                Ward #{device.ward_no || 'NA'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                                                device.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                device.status === 'Pending' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                'bg-slate-100 text-slate-400'
                                            }`}>
                                                {device.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            {device.status === 'Pending' && (
                                                <button onClick={() => updateStatus(device.id, 'Active')} className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100"><UserCheck size={18}/></button>
                                            )}
                                            {device.status === 'Active' && (
                                                <button onClick={() => updateStatus(device.id, 'Blocked')} className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-100"><UserX size={18}/></button>
                                            )}
                                            {device.status === 'Blocked' && (
                                                <button onClick={() => updateStatus(device.id, 'Active')} className="p-3 bg-slate-900 text-white rounded-xl shadow-lg"><RefreshCcw size={18}/></button>
                                            )}
                                        </td>
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

const StatusSummary = ({ label, value, color, icon: Icon }) => (
    <div className="bg-white p-7 rounded-[40px] border border-slate-50 shadow-sm flex items-center gap-6 hover:shadow-xl transition-all">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-600 shadow-inner`}>
            <Icon size={28} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-3xl font-black text-slate-800">{value}</h4>
        </div>
    </div>
);

export default DeviceControl;
