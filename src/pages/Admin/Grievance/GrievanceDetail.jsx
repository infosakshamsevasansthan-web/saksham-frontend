import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    ArrowLeft, MapPin, User, Calendar, Phone, CheckCircle2, Loader2, 
    Send, FileText, History, Image as ImageIcon, X, ShieldCheck, 
    Clock, Briefcase, UserPlus, Camera, Reply, Activity, Settings, 
    Share2, Download, AlertCircle, Trash2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const GrievanceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const tenantId = localStorage.getItem('tenantId');
    const currentUserId = localStorage.getItem('userId');

    // --- STATES ---
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [officials, setOfficials] = useState([]);
    
    // --- ACTION FORM STATES ---
    const [actionTab, setActionTab] = useState('forward'); // 'forward' or 'resolve'
    const [remarks, setRemarks] = useState('');
    const [selectedOfficial, setSelectedOfficial] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [showPhoto, setShowPhoto] = useState(false);

    const fetchData = async () => {
        try {
            // 1. Fetch Case Details & Officials list together
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
            console.error("Fetch Error:", err);
            toast.error("Database connection lost");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [id, tenantId]);

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        if(!remarks.trim()) return toast.error("Kripya remarks likhein!");
        
        setUpdating(true);
        const formData = new FormData();
        formData.append('grievance_id', complaint.id);
        formData.append('from_user', currentUserId || 1);
        formData.append('remarks', remarks);
        
        if (actionTab === 'forward') {
            if(!selectedOfficial) { setUpdating(false); return toast.error("Kripya Officer chunein!"); }
            formData.append('action', 'Forwarded');
            formData.append('to_user', selectedOfficial);
        } else {
            formData.append('action', 'Resolved');
            if(proofFile) formData.append('proof', proofFile);
            else { setUpdating(false); return toast.error("Kripya photo proof upload karein!"); }
        }

        try {
            const res = await axios.post(`https://saksham-backend-9719.onrender.com/api/admin/grievance/move`, formData);
            if(res.data.success) {
                toast.success("Action Processed Successfully! 🚀");
                setTimeout(() => navigate('/admin/complaints'), 1500);
            }
        } catch (err) {
            toast.error("Process fail ho gaya");
        } finally { setUpdating(false); }
    };

    if (loading) return (
        <CityLayout>
            <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <Loader2 className="animate-spin text-emerald-500" size={64} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                </div>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em] animate-pulse">Decrypting Case Evidence...</p>
            </div>
        </CityLayout>
    );

    if (!complaint) return (
        <CityLayout>
            <div className="p-40 text-center flex flex-col items-center gap-4">
                <AlertCircle size={64} className="text-rose-400" />
                <h2 className="text-2xl font-black text-slate-300 uppercase italic tracking-tighter">Case Not Found in Digital Vault</h2>
                <button onClick={()=>navigate(-1)} className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">Go Back</button>
            </div>
        </CityLayout>
    );

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 max-w-[1600px] mx-auto space-y-6 text-left bg-[#f8fafc] min-h-screen font-sans">
                
                {/* --- 🟢 1. TOP DYNAMIC NAVIGATION --- */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm group">
                            <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">{complaint.ticket_id}</h1>
                                <StatusTag status={complaint.status} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Log: {new Date(complaint.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden lg:block">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authority Unit</p>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-tight">{tenantId}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div className="flex gap-2">
                             <ActionButton icon={Share2} />
                             <ActionButton icon={Download} />
                             <ActionButton icon={Trash2} color="rose" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- LEFT: MASTER CASE FILE (8 COLS) --- */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 📝 Core Statement */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><FileText size={150}/></div>
                             <div className="relative z-10">
                                <Label icon={Activity} text="Case Statement / शिकायत" color="rose" />
                                <h2 className="text-3xl font-black text-slate-800 uppercase italic mb-8 mt-4 leading-tight">{complaint.subject}</h2>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-dashed border-slate-200 group-hover:bg-white transition-colors">
                                        <p className="text-slate-600 text-lg leading-relaxed font-medium">"{complaint.description}"</p>
                                    </div>
                                    {complaint.description_hi && (
                                        <div className="bg-emerald-50/40 p-8 rounded-[2.5rem] border-l-[12px] border-emerald-500 shadow-inner">
                                            <p className="text-emerald-900 text-xl font-bold leading-relaxed italic">"{complaint.description_hi}"</p>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>

                        {/* 📊 Intelligence Hub (GIS + Stats) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* GIS Location */}
                            <CaseBox icon={MapPin} label="Geographic Insight" color="emerald">
                                <div className="space-y-4 pt-2">
                                    <InfoRow label="Ward Segment" val={`NO. ${complaint.ward_no}`} />
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Logged Address</p>
                                        <p className="text-xs font-bold text-slate-700 uppercase leading-snug">{complaint.address_hi || complaint.address_en || 'GPS Tagged Location'}</p>
                                    </div>
                                    <button 
                                        onClick={()=>window.open(`https://maps.google.com/?q=${complaint.lat},${complaint.lng}`)}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                                    >
                                        <MapPin size={14}/> View GIS Visuals
                                    </button>
                                </div>
                            </CaseBox>
                            
                            {/* Operations Matrix */}
                            <CaseBox icon={Briefcase} label="Departmental Matrix" color="blue">
                                <div className="space-y-4 pt-2">
                                    <InfoRow label="Assigned Dept" val={complaint.department_en} sub={complaint.department_hi} />
                                    <InfoRow label="Case Type" val={complaint.category_name} />
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <p className="text-[8px] font-black text-blue-400 uppercase">Filed Date</p>
                                            <p className="text-sm font-black text-slate-800">{new Date(complaint.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Case Status</p>
                                            <p className="text-sm font-black text-slate-800 uppercase">{complaint.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </CaseBox>
                        </div>

                        {/* 📜 Timeline / Movement Trail */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-lg relative overflow-hidden">
                            <div className="absolute -left-10 -bottom-10 opacity-5 text-indigo-500"><History size={200}/></div>
                            <Label icon={History} text="Chain of Custody / टाइमलाइन" color="indigo" />
                            <div className="mt-12 relative pl-12 space-y-12">
                                <div className="absolute left-5 top-2 bottom-2 w-1 bg-slate-50" />
                                <TrailNode icon={User} title="Case Registry" active time={new Date(complaint.created_at).toLocaleTimeString()} desc={`Registered by ${complaint.applicant_name}`} />
                                <TrailNode icon={ShieldCheck} title="Tenant Verification" active time="Instant" desc={`Validated by Municipal Server (ID: ${complaint.tenant_id})`} />
                                <TrailNode icon={Settings} title="Administrative Progress" active={complaint.status !== 'Open'} time={complaint.status} desc={complaint.admin_remarks || 'Case file is currently under review by department heads.'} />
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: COMMAND & CITIZEN HUD (4 COLS) --- */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* 🛠️ Action Command Hub */}
                        <div className="bg-slate-950 rounded-[3.5rem] p-1 text-white shadow-2xl border-b-[12px] border-emerald-500">
                             <div className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner"><UserPlus size={24}/></div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Action Hub</h3>
                                </div>

                                {/* TAB NAVIGATION */}
                                <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl mb-8">
                                    <NavTab active={actionTab === 'forward'} label="Forward Case" onClick={()=>setActionTab('forward')} />
                                    <NavTab active={actionTab === 'resolve'} label="Resolve / Close" onClick={()=>setActionTab('resolve')} />
                                </div>

                                <form onSubmit={handleActionSubmit} className="space-y-6">
                                    <AnimatePresence mode='wait'>
                                        <motion.div 
                                            key={actionTab}
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            {actionTab === 'forward' ? (
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Select Deployment Official</label>
                                                    <select 
                                                        required value={selectedOfficial} onChange={(e)=>setSelectedOfficial(e.target.value)}
                                                        className="w-full bg-slate-900 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 text-emerald-100 outline-none transition-all cursor-pointer"
                                                    >
                                                        <option value="">Search Authority...</option>
                                                        {officials.map(o => <option key={o.id} value={o.id}>{o.full_name_en} ({o.designation_name_en})</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Work Proof (JPEG/PNG)</label>
                                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-800 rounded-[2rem] cursor-pointer hover:bg-white/5 transition-all group overflow-hidden">
                                                        {proofFile ? (
                                                            <div className="flex flex-col items-center p-4">
                                                                <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                                                                <p className="text-[10px] font-black uppercase text-emerald-400 truncate w-40">{proofFile.name}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center pt-5 pb-6">
                                                                <Camera size={32} className="text-slate-600 group-hover:text-emerald-500 mb-2 transition-colors" />
                                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Attach Work Evidence</p>
                                                            </div>
                                                        )}
                                                        <input type="file" className="hidden" onChange={(e)=>setProofFile(e.target.files[0])} />
                                                    </label>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">Final Instructions / Remarks</label>
                                                <textarea 
                                                    rows="5" required value={remarks} onChange={(e)=>setRemarks(e.target.value)}
                                                    placeholder="Explain the logic behind this action..."
                                                    className="w-full bg-slate-900 border-none rounded-[2rem] p-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500 text-slate-200 outline-none placeholder:text-slate-700"
                                                ></textarea>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>

                                    <button 
                                        disabled={updating}
                                        className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 ${actionTab === 'forward' ? 'bg-white text-slate-900 hover:bg-emerald-400' : 'bg-emerald-500 text-slate-900 hover:bg-white'} disabled:opacity-40 active:scale-95`}
                                    >
                                        {updating ? <Loader2 className="animate-spin" /> : <Send size={20}/>} {actionTab === 'forward' ? 'Authorize Forward' : 'Verify & Close File'}
                                    </button>
                                </form>
                             </div>
                        </div>

                        {/* 👤 Reporting Citizen HUD */}
                        <div className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden text-center group">
                            <div className="absolute top-0 left-0 w-full h-24 bg-rose-500/5 group-hover:h-full transition-all duration-700" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-slate-900 rounded-full mx-auto border-[8px] border-white shadow-2xl flex items-center justify-center text-white text-4xl font-black mb-4 group-hover:scale-110 transition-transform">
                                    {complaint.applicant_name?.charAt(0)}
                                </div>
                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{complaint.applicant_name}</h4>
                                <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                                    <div className="flex items-center justify-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <Phone size={14} className="text-emerald-500" />
                                        <p className="text-sm font-black text-slate-700">+91 {complaint.mobile}</p>
                                    </div>
                                    <button 
                                        onClick={()=>setShowPhoto(true)}
                                        className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-50 hover:text-rose-600 transition-all shadow-lg flex items-center justify-center gap-3 border border-slate-200"
                                    >
                                        <ImageIcon size={16}/> View Attached Photo
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
                        <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white max-w-5xl w-full rounded-[4rem] overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                            <div className="h-[70vh] bg-slate-100 flex items-center justify-center relative">
                                {complaint.photo_url ? (
                                    <img src={complaint.photo_url} className="w-full h-full object-contain" alt="Case Evidence" />
                                ) : (
                                    <div className="flex flex-col items-center gap-6 text-slate-300">
                                        <ImageIcon size={120} strokeWidth={1} />
                                        <p className="font-black text-sm uppercase tracking-[0.4em]">Evidence Not Logged via App</p>
                                    </div>
                                )}
                                <button onClick={() => setShowPhoto(false)} className="absolute top-8 right-8 p-4 bg-black/40 text-white rounded-full hover:bg-rose-500 transition-all shadow-xl"><X/></button>
                            </div>
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner"><ImageIcon className="text-slate-400"/></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File Identity</p>
                                        <p className="font-bold text-slate-700">{complaint.ticket_id}_EVIDENCE.JPG</p>
                                    </div>
                                </div>
                                <button onClick={()=>window.open(complaint.photo_url)} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-emerald-600 transition-all">Download</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// --- ✨ High-End Sub-Components ---

const Label = ({ icon: Icon, text, color }) => (
    <div className={`flex items-center gap-4 text-${color}-500`}>
        <div className={`p-3 rounded-2xl bg-${color}-50 shadow-inner`}><Icon size={24}/></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.4em] tracking-tight">{text}</h3>
    </div>
);

const CaseBox = ({ icon: Icon, label, children, color }) => (
    <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm h-full flex flex-col hover:shadow-xl transition-all">
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600 shadow-inner`}><Icon size={20}/></div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</h4>
        </div>
        {children}
    </div>
);

const InfoRow = ({ label, val, sub }) => (
    <div className="flex justify-between items-start border-b border-slate-50 pb-3 mt-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
        <div className="text-right">
            <p className="text-sm font-black text-slate-800 uppercase leading-tight max-w-[200px]">{val || 'NA'}</p>
            {sub && <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1 italic">{sub}</p>}
        </div>
    </div>
);

const NavTab = ({ active, label, onClick }) => (
    <button onClick={onClick} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase transition-all duration-500 ${active ? 'bg-white text-slate-900 shadow-2xl scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
        {label}
    </button>
);

const TrailNode = ({ icon: Icon, title, time, active, desc }) => (
    <div className="relative group">
        <div className={`absolute -left-[48px] w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white transition-all ${active ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-100 text-slate-300'}`}>
            <Icon size={18} />
        </div>
        <div className="flex justify-between items-center mb-1">
            <p className={`font-black text-[13px] uppercase ${active ? 'text-slate-800' : 'text-slate-400'}`}>{title}</p>
            <span className="text-[10px] font-black text-slate-300 uppercase font-mono">{time}</span>
        </div>
        <p className={`text-[11px] font-bold leading-relaxed ${active ? 'text-slate-500' : 'text-slate-300'}`}>{desc}</p>
    </div>
);

const StatusTag = ({ status }) => (
    <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase border-2 shadow-sm ${
        status === 'Open' ? 'bg-rose-50 text-rose-500 border-rose-100 animate-pulse' : 
        status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
        'bg-blue-50 text-blue-500 border-blue-100'
    }`}>
        Status: {status}
    </span>
);

const ActionButton = ({ icon: Icon, color="slate" }) => (
    <button className={`p-4 bg-${color}-50 text-${color}-400 rounded-2xl border border-${color}-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm`}>
        <Icon size={18} />
    </button>
);

export default GrievanceDetail;
