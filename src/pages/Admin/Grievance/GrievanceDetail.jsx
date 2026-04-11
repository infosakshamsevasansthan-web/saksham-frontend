import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
// FIXED: Added 'Settings' to imports
import { ArrowLeft, MapPin, User, Calendar, Phone, CheckCircle2, Loader2, Send, FileText, History, Image as ImageIcon, X, UserCheck, Settings } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const GrievanceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [status, setStatus] = useState('Resolved');
    const [showUserModal, setShowUserModal] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/grievance/detail/${id}`);
                if(res.data.data) {
                    setComplaint(res.data.data);
                    // Agar status Open hai toh default Resolved set karein action ke liye
                    setStatus(res.data.data.status === 'Open' ? 'Resolved' : res.data.data.status);
                    setRemarks(res.data.data.admin_remarks || '');
                }
            } catch (err) {
                toast.error("Failed to load details");
            } finally { setLoading(false); }
        };
        fetchDetail();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if(!remarks) return toast.error("Please enter resolution remarks");
        
        setUpdating(true);
        try {
            await axios.put(`https://saksham-backend-9719.onrender.com/api/admin/grievance/update/${id}`, {
                status,
                admin_remarks: remarks
            });
            toast.success("Action Recorded!");
            setTimeout(() => navigate('/admin/complaints'), 1500);
        } catch (err) {
            toast.error("Update failed");
        } finally { setUpdating(false); }
    };

    if (loading) return <CityLayout><div className="p-20 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-rose-500" size={40}/><p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching Case Details...</p></div></CityLayout>;

    if (!complaint) return <CityLayout><div className="p-20 text-center text-slate-400 font-bold">COMPLAINT NOT FOUND</div></CityLayout>;

    return (
        <CityLayout>
            <Toaster position="top-right" />
            
            <div className="p-4 max-w-7xl mx-auto space-y-6 text-left">
                {/* Header Navigation */}
                <div className="flex justify-between items-center">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase hover:text-rose-600 transition-all">
                        <ArrowLeft size={16}/> Back to Dashboard
                    </button>
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ref No: {complaint.grievance_no || `#GRV-${complaint.id}`}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Complaint Details */}
                        <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-2xl relative overflow-hidden">
                            <div className={`absolute top-0 right-0 px-10 py-3 rounded-bl-[30px] text-[10px] font-black uppercase tracking-widest text-white ${complaint.status === 'Open' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                                {complaint.status}
                            </div>
                            
                            <div className="flex items-center gap-3 text-rose-600 mb-4">
                                <FileText size={20}/>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Issue Details / विवरण</h3>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 uppercase italic mb-4 leading-tight">
                                {complaint.type_name_en || 'General Issue'}
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed bg-slate-50 p-8 rounded-[35px] border border-dashed border-slate-200">
                                "{complaint.description || 'No detailed description provided.'}"
                            </p>
                        </div>

                        {/* Location & Address */}
                        <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-xl">
                            <div className="flex items-center gap-3 text-emerald-600 mb-6">
                                <MapPin size={20}/>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Reporting Location / पता</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <InfoItem icon={MapPin} label="Ward Assignment" value={`Ward No. ${complaint.ward_no || 'NA'}`} />
                                    <InfoItem icon={Calendar} label="Incident Time" value={new Date(complaint.created_at).toLocaleString('en-IN')} />
                                </div>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Google Map Address / पूरा पता</p>
                                    <p className="text-xs font-bold text-slate-700 leading-snug uppercase">
                                        {complaint.address_en || 'Exact address coordinates mapped on backend.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lifecycle Timeline */}
                        <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-xl">
                            <div className="flex items-center gap-3 text-blue-600 mb-8">
                                <History size={20}/>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Resolution Timeline / टाइमलाइन</h3>
                            </div>
                            
                            <div className="relative space-y-12 ml-6">
                                <div className="absolute left-4 top-2 bottom-2 w-1 bg-slate-100"></div>
                                
                                <TimelineStep 
                                    icon={User} 
                                    title="Citizen Entry" 
                                    desc={`Reported by ${complaint.complainant_name}`} 
                                    time={new Date(complaint.created_at).toLocaleTimeString()}
                                    active
                                />
                                <TimelineStep 
                                    icon={Settings} 
                                    title="Automatic Routing" 
                                    desc={`Grievance linked to Tenant Admin (${complaint.tenant_id})`} 
                                    time="Instant"
                                    active
                                />
                                <TimelineStep 
                                    icon={UserCheck} 
                                    title="Admin Redressal" 
                                    desc={complaint.status === 'Open' ? 'Under Review by Commissioner Office' : `Status updated to ${complaint.status}`} 
                                    time={complaint.status === 'Resolved' ? 'Completed' : 'Pending'}
                                    active={complaint.status !== 'Open'}
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Citizen Mini Card */}
                        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-20 bg-emerald-500/10"></div>
                            <div className="relative z-10 w-24 h-24 mx-auto bg-slate-900 rounded-full border-[6px] border-white shadow-xl flex items-center justify-center text-white text-3xl font-black mb-4">
                                {complaint.complainant_name?.charAt(0)}
                            </div>
                            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{complaint.complainant_name}</h4>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1 italic">Public Stakeholder</p>
                            
                            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4 text-left">
                                <InfoItem icon={Phone} label="Contact Mobile" value={`+91 ${complaint.mobile}`} />
                                <button 
                                    onClick={() => setShowUserModal(true)}
                                    className="w-full mt-4 bg-rose-50 text-rose-600 p-4 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-rose-100"
                                >
                                    <ImageIcon size={16}/> View Submission Photo
                                </button>
                            </div>
                        </div>

                        {/* Action Box */}
                        <div className="bg-slate-900 p-10 rounded-[45px] text-white shadow-2xl border-b-[12px] border-emerald-500">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
                                    <CheckCircle2 size={24}/>
                                </div>
                                <h3 className="font-black text-xl uppercase italic">Take Action</h3>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">New Resolution Status</label>
                                    <select 
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 text-emerald-100 outline-none"
                                    >
                                        <option value="Open">Pending / लंबित</option>
                                        <option value="In Progress">In Progress / कार्य जारी</option>
                                        <option value="Resolved">Resolved / समाधान</option>
                                        <option value="Rejected">Rejected / अस्वीकृत</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Admin Response</label>
                                    <textarea 
                                        rows="5"
                                        placeholder="Explain action taken..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="w-full bg-slate-800 border-none rounded-3xl p-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500 text-slate-100 placeholder:text-slate-600 outline-none"
                                    ></textarea>
                                </div>

                                <button 
                                    disabled={updating}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-5 rounded-[28px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50"
                                >
                                    {updating ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
                                    Finalize Update
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Evidence Photo */}
            <AnimatePresence>
                {showUserModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
                            onClick={() => setShowUserModal(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-4xl rounded-[50px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row z-10"
                        >
                            <div className="flex-1 bg-slate-100 flex items-center justify-center">
                                {/* Mapped to photo_before_url from your table */}
                                {complaint.photo_before_url ? (
                                    <img src={complaint.photo_before_url} className="w-full h-full object-contain" alt="Evidence" />
                                ) : (
                                    <div className="p-20 text-slate-300 font-black uppercase text-xs flex flex-col items-center gap-4">
                                        <ImageIcon size={60}/> No submission photo
                                    </div>
                                )}
                            </div>
                            <div className="w-full md:w-80 p-10 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 uppercase italic mb-6">Evidence File</h4>
                                    <div className="space-y-4">
                                        <InfoItem icon={User} label="Reporter" value={complaint.complainant_name} />
                                        <InfoItem icon={Calendar} label="Timestamp" value={new Date(complaint.created_at).toLocaleTimeString()} />
                                    </div>
                                </div>
                                <button onClick={() => setShowUserModal(false)} className="mt-8 bg-rose-500 text-white p-4 rounded-2xl font-black text-xs uppercase">Close Preview</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </CityLayout>
    );
};

const TimelineStep = ({ icon: Icon, title, desc, time, active }) => (
    <div className="relative pl-10">
        <div className={`absolute left-0 w-10 h-10 rounded-2xl flex items-center justify-center z-10 border-[5px] border-white shadow-xl ${active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
            <Icon size={18} />
        </div>
        <div>
            <div className="flex justify-between items-center mb-1">
                <p className={`font-black text-xs uppercase ${active ? 'text-slate-800' : 'text-slate-400'}`}>{title}</p>
                <span className="text-[9px] font-black text-slate-300 uppercase">{time}</span>
            </div>
            <p className={`text-[11px] font-bold leading-tight ${active ? 'text-slate-500' : 'text-slate-300'}`}>{desc}</p>
        </div>
    </div>
);

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm"><Icon size={18}/></div>
        <div className="min-w-0">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-xs font-black text-slate-800 uppercase truncate">{value || 'N/A'}</p>
        </div>
    </div>
);

export default GrievanceDetail;