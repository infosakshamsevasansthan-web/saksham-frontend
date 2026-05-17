import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    ArrowLeft, MapPin, User, Calendar, Phone, CheckCircle2, Loader2, 
    Send, FileText, History, Image as ImageIcon, X, ShieldCheck, 
    Clock, Briefcase, UserUp, Camera, Reply, ChevronRight, Activity, Gauge
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const GrievanceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const tenantId = localStorage.getItem('tenantId');
    const currentUserId = localStorage.getItem('userId');

    // States
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [officials, setOfficials] = useState([]);
    
    // Action Form States
    const [actionTab, setActionTab] = useState('forward'); 
    const [remarks, setRemarks] = useState('');
    const [selectedOfficial, setSelectedOfficial] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [showPhoto, setShowPhoto] = useState(false);

    const fetchData = async () => {
        try {
            const [caseRes, offRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/grievance/detail/${id}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/grievance/officials-list/${tenantId}`)
            ]);
            
            if(caseRes.data.success) {
                setComplaint(caseRes.data.data);
                setRemarks(caseRes.data.data.admin_remarks || '');
            }
            if(offRes.data.success) setOfficials(offRes.data.data);
        } catch (err) {
            toast.error("Database connection failed");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleAction = async (e) => {
        e.preventDefault();
        if(!remarks.trim()) return toast.error("Kripya remarks likhein!");
        
        setUpdating(true);
        const formData = new FormData();
        formData.append('grievance_id', complaint.id);
        formData.append('from_user', currentUserId || 1);
        formData.append('remarks', remarks);
        
        if (actionTab === 'forward') {
            if(!selectedOfficial) return toast.error("Officer select karein!");
            formData.append('action', 'Forwarded');
            formData.append('to_user', selectedOfficial);
        } else {
            formData.append('action', 'Resolved');
            if(proofFile) formData.append('proof', proofFile);
        }

        try {
            const res = await axios.post(`https://saksham-backend-9719.onrender.com/api/admin/grievance/move`, formData);
            if(res.data.success) {
                toast.success("Action Success! Case Updated.");
                setTimeout(() => navigate('/admin/complaints'), 1500);
            }
        } catch (err) {
            toast.error("Submission failed");
        } finally { setUpdating(false); }
    };

    if (loading) return (
        <CityLayout>
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={60} />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">Deciphering Case File...</p>
            </div>
        </CityLayout>
    );

    if (!complaint) return <CityLayout><div className="p-40 text-center font-black text-slate-300 text-xl italic border-4 border-dashed rounded-[50px] mx-10">CASE DATA NOT FOUND IN DB</div></CityLayout>;

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 max-w-[1600px] mx-auto space-y-6 text-left font-sans bg-[#f8fafc] min-h-screen">
                
                {/* --- 🟢 1. HEADER CONTROL BAR --- */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm group">
                            <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">{complaint.ticket_id}</h1>
                                <StatusBadge status={complaint.status} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Date: {new Date(complaint.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden lg:block">
                            <p className="text-[8px] font-black text-slate-400 uppercase">Tenant Authority</p>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-tight">{complaint.tenant_id}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg active:scale-90"><History size={20}/></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- LEFT: CORE CASE DATA (8 COLS) --- */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 📝 Issue Description */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><FileText size={150}/></div>
                             <div className="relative z-10">
                                <SectionLabel icon={Activity} label="Problem Statement / शिकायत" color="rose" />
                                <h2 className="text-3xl font-black text-slate-800 uppercase italic mb-8 mt-4 leading-tight">{complaint.subject}</h2>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-dashed border-slate-200">
                                        <p className="text-slate-600 text-lg leading-relaxed font-medium">"{complaint.description}"</p>
                                    </div>
                                    {complaint.description_hi && (
                                        <div className="bg-emerald-50/30 p-8 rounded-[2.5rem] border-l-[12px] border-emerald-500">
                                            <p className="text-emerald-900 text-xl font-bold leading-relaxed italic">"{complaint.description_hi}"</p>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>

                        {/* 🗺️ Metadata Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Location */}
                            <DetailBox icon={MapPin} label="Location Analysis" color="emerald">
                                <div className="space-y-4">
                                    <InfoRow label="Ward Assigned" val={`WARD NO. ${complaint.ward_no}`} />
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Google Map Sync Address</p>
                                        <p className="text-xs font-bold text-slate-700 uppercase leading-snug">{complaint.address_hi || complaint.address_en || 'GPS Mapped at Registry'}</p>
                                    </div>
                                    <button onClick={()=>window.open(`https://maps.google.com/?q=${complaint.lat},${complaint.lng}`)} className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100">Open GIS Visual</button>
                                </div>
                            </DetailBox>
                            
                            {/* Timing & Dept */}
                            <DetailBox icon={Clock} label="Operational Data" color="blue">
                                <div className="space-y-4">
                                    <InfoRow label="Department" val={complaint.department_en} sub={complaint.department_hi} />
                                    <InfoRow label="Category" val={complaint.category_name} />
                                    <div className="flex gap-4">
                                        <div className="flex-1 p-4 bg-slate-50 rounded-2xl">
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Logged Time</p>
                                            <p className="text-sm font-black">{new Date(complaint.created_at).toLocaleTimeString()}</p>
                                        </div>
                                        <div className="flex-1 p-4 bg-blue-50 rounded-2xl">
                                            <p className="text-[8px] font-black text-blue-400 uppercase">Wait Duration</p>
                                            <p className="text-sm font-black text-blue-700">Calculated...</p>
                                        </div>
                                    </div>
                                </div>
                            </DetailBox>
                        </div>

                        {/* 📜 Timeline / History */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                            <SectionLabel icon={History} label="Authority Paper Trail / टाइमलाइन" color="indigo" />
                            <div className="mt-12 relative pl-12 space-y-12">
                                <div className="absolute left-5 top-2 bottom-2 w-1 bg-slate-100" />
                                <TimelineNode icon={User} title="Citizen Entry" active time={new Date(complaint.created_at).toLocaleString()} desc={`Case filed by ${complaint.applicant_name} via App`} />
                                <TimelineNode icon={ShieldCheck} title="Automatic Validation" active time="System-Sync" desc={`Assigned to Department: ${complaint.department_en}`} />
                                <TimelineNode icon={CheckCircle2} title="Final Redressal" active={complaint.status !== 'Open'} time={complaint.status} desc={complaint.admin_remarks || 'Case is currently waiting for hierarchy action.'} />
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: CITIZEN HUD & ACTION PANEL (4 COLS) --- */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* 🛠️ Action Center */}
                        <div className="bg-slate-900 rounded-[3.5rem] p-1 text-white shadow-2xl overflow-hidden border-b-[12px] border-emerald-500">
                             <div className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner"><UserUp size={24}/></div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Chain of Command</h3>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl mb-8">
                                    <TabBtn active={actionTab === 'forward'} label="Forward" onClick={()=>setActionTab('forward')} />
                                    <TabBtn active={actionTab === 'resolve'} label="Resolve / Close" onClick={()=>setActionTab('resolve')} />
                                </div>

                                <form onSubmit={handleAction} className="space-y-6">
                                    {actionTab === 'forward' ? (
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Select Official In-Charge</label>
                                            <select 
                                                required value={selectedOfficial} onChange={(e)=>setSelectedOfficial(e.target.value)}
                                                className="w-full bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 text-emerald-100 outline-none transition-all"
                                            >
                                                <option value="">Choose Recipient...</option>
                                                {officials.map(o => <option key={o.id} value={o.id}>{o.full_name_en} ({o.designation_name_en})</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Work Proof Evidence</label>
                                            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-700 rounded-3xl cursor-pointer hover:bg-white/5 transition-all group overflow-hidden">
                                                {proofFile ? (
                                                    <div className="flex flex-col items-center p-4">
                                                        <CheckCircle2 className="text-emerald-500 mb-2" />
                                                        <p className="text-[10px] font-black uppercase text-emerald-400">{proofFile.name}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center pt-5 pb-6">
                                                        <Camera className="text-slate-500 mb-2" />
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase">Upload Resolution Photo</p>
                                                    </div>
                                                )}
                                                <input type="file" className="hidden" onChange={(e)=>setProofFile(e.target.files[0])} />
                                            </label>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Final Remarks / Instructions</label>
                                        <textarea 
                                            rows="5" required value={remarks} onChange={(e)=>setRemarks(e.target.value)}
                                            placeholder="Write case resolution notes here..."
                                            className="w-full bg-slate-800 border-none rounded-[2rem] p-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500 text-slate-200 outline-none placeholder:text-slate-600"
                                        ></textarea>
                                    </div>

                                    <button 
                                        disabled={updating}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-40"
                                    >
                                        {updating ? <Loader2 className="animate-spin" /> : <Send size={20}/>} {actionTab === 'forward' ? 'Process Movement' : 'Verify & Close'}
                                    </button>
                                </form>
                             </div>
                        </div>

                        {/* 👤 Citizen Profile MiniHUD */}
                        <div className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-24 bg-rose-500/5" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-slate-900 rounded-full mx-auto border-[6px] border-white shadow-2xl flex items-center justify-center text-white text-3xl font-black mb-4">
                                    {complaint.applicant_name?.charAt(0)}
                                </div>
                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{complaint.applicant_name}</h4>
                                <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                                    <div className="flex items-center justify-center gap-3 bg-slate-50 p-3 rounded-2xl">
                                        <Phone size={14} className="text-emerald-500" />
                                        <p className="text-sm font-black text-slate-700">+91 {complaint.mobile}</p>
                                    </div>
                                    <button onClick={()=>setShowPhoto(true)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-500 transition-all shadow-lg flex items-center justify-center gap-2">
                                        <ImageIcon size={16}/> View Evidence Photo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Evidence Modal */}
            <AnimatePresence>
                {showPhoto && (
                    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowPhoto(false)}>
                        <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-white max-w-5xl w-full rounded-[4rem] overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                            <div className="h-[650px] bg-slate-100 flex items-center justify-center">
                                {complaint.photo_url ? (
                                    <img src={complaint.photo_url} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-slate-300">
                                        <ImageIcon size={100} strokeWidth={1} />
                                        <p className="font-black text-xs uppercase tracking-widest">No evidence attached via app</p>
                                    </div>
                                )}
                                <button onClick={() => setShowPhoto(false)} className="absolute top-8 right-8 p-4 bg-black/20 text-white rounded-full hover:bg-rose-500 transition-all"><X/></button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </CityLayout>
    );
};

// --- ✨ Sub-Components for Cleanliness ---

const SectionLabel = ({ icon: Icon, label, color }) => (
    <div className={`flex items-center gap-4 text-${color}-500`}>
        <div className={`p-3 rounded-2xl bg-${color}-50 shadow-inner`}><Icon size={24}/></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.4em]">{label}</h3>
    </div>
);

const DetailBox = ({ icon: Icon, label, children, color }) => (
    <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600`}><Icon size={20}/></div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</h4>
        </div>
        {children}
    </div>
);

const InfoRow = ({ label, val, sub }) => (
    <div className="flex justify-between items-start border-b border-slate-50 pb-3">
        <p className="text-[10px] font-black text-slate-400 uppercase">{label}</p>
        <div className="text-right">
            <p className="text-sm font-black text-slate-800 uppercase leading-tight">{val || 'NA'}</p>
            {sub && <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1 italic">{sub}</p>}
        </div>
    </div>
);

const TabBtn = ({ active, label, onClick }) => (
    <button onClick={onClick} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${active ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
        {label}
    </button>
);

const TimelineNode = ({ icon: Icon, title, time, active, desc }) => (
    <div className="relative">
        <div className={`absolute -left-[48px] w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white ${active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
            <Icon size={18} />
        </div>
        <div className="flex justify-between items-center mb-1">
            <p className={`font-black text-[13px] uppercase ${active ? 'text-slate-800' : 'text-slate-400'}`}>{title}</p>
            <span className="text-[10px] font-black text-slate-300 uppercase">{time}</span>
        </div>
        <p className={`text-[11px] font-bold leading-relaxed ${active ? 'text-slate-500' : 'text-slate-300'}`}>{desc}</p>
    </div>
);

const StatusBadge = ({ status }) => (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
        status === 'Open' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
        status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
        'bg-blue-50 text-blue-500 border-blue-100'
    }`}>
        {status}
    </span>
);

export default GrievanceDetail;
