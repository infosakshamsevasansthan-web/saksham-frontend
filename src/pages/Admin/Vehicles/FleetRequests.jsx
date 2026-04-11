import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { AlertCircle, CheckCircle, XCircle, Truck, MapPin, RefreshCcw, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const FleetRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const tenantId = localStorage.getItem('tenantId');

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/fleet-requests/pending/${tenantId}`);
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (err) { 
            toast.error("Database connection failed!"); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchRequests(); }, [tenantId]);

    const updateStatus = async (id, status) => {
        try {
            const res = await axios.patch(`https://saksham-backend-9719.onrender.com/api/admin/fleet-requests/status/${id}`, { status });
            if (res.data.success) {
                toast.success(`Request ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`);
                fetchRequests();
            }
        } catch (err) { toast.error("Action failed"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                {/* HEADER */}
                <header className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase italic">Fleet Requests</h1>
                        <p className="text-rose-500 font-bold text-[10px] uppercase tracking-[0.3em]">Inspector Requirement Panel</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchRequests} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-emerald-600 transition-all border border-slate-100"><RefreshCcw size={20}/></button>
                        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-3">
                            Pending: {requests.length}
                        </div>
                    </div>
                </header>

                {/* DATA TABLE / LIST */}
                <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b">
                            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-6">Inspector Info</th>
                                <th className="p-4">Requirement</th>
                                <th className="p-4">Reason / Priority</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan="4" className="p-32 text-center">
                                    <Truck size={48} className="mx-auto text-slate-100 mb-4" />
                                    <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No pending requests found</p>
                                </td></tr>
                            ) : requests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center font-black uppercase">{req.ins_en.charAt(0)}</div>
                                            <div>
                                                <p className="font-black text-slate-800 text-xs uppercase">{req.ins_en}</p>
                                                <p className="text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1"><MapPin size={10}/> Ward: {req.ward_no}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-black text-slate-700 text-xs uppercase">{req.vehicle_type}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(req.created_at).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${req.priority === 'Emergency' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-700'}`}>{req.priority}</span>
                                        <p className="text-[11px] text-slate-500 italic mt-2">"{req.reason}"</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => updateStatus(req.id, 'approved')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 transition-all flex items-center gap-2">
                                                <CheckCircle size={14}/> Approve
                                            </button>
                                            <button onClick={() => updateStatus(req.id, 'rejected')} className="bg-rose-50 text-rose-500 p-2 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                                                <XCircle size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </CityLayout>
    );
};

export default FleetRequests;