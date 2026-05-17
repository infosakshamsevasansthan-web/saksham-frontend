import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    ArrowLeft, MapPin, User, Calendar, Phone, CheckCircle2, Loader2, 
    Send, FileText, History, Image as ImageIcon, X, ShieldCheck, 
    Clock, Briefcase, MessageSquare, UserUp, Camera, Upload, Reply
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const GrievanceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Core States
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [officials, setOfficials] = useState([]);
    
    // Action Form States
    const [actionTab, setActionTab] = useState('forward'); // 'forward' or 'resolve'
    const [remarks, setRemarks] = useState('');
    const [selectedOfficial, setSelectedOfficial] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [showPhoto, setShowPhoto] = useState(false);

    const tenantId = localStorage.getItem('tenantId');

    const fetchData = async () => {
        try {
            // 1. Fetch Case Details & Officials list simultaneously
            const [caseRes, offRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/grievance/detail/${id}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/grievance/officials-list/${tenantId}`)
            ]);
            
            if(caseRes.data.success) {
                setComplaint(caseRes.data.data);
                setRemarks(caseRes.data.data.admin_remarks || '');
            }
            setOfficials(offRes.data.data || []);
        } catch (err) {
            toast.error("Data retrieval error");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleMovement = async (e) => {
        e.preventDefault();
        if(!remarks.trim()) return toast.error("Please add instructions/remarks");
        
        setUpdating(true);
        const formData = new FormData();
        formData.append('grievance_id', complaint.id);
        formData.append('from_user', localStorage.getItem('userId') || 1); // Current Admin ID
        formData.append('remarks', remarks);
        
        if (actionTab === 'forward') {
            if(!selectedOfficial) return toast.error("Please select an official");
            formData.append('action', 'Forwarded');
            formData.append('to_user', selectedOfficial);
        } else {
            if(!proofFile) return toast.error("Resolution proof photo is required");
            formData.append('action', 'Resolved');
            formData.append('proof', proofFile);
        }

        try {
            const res = await axios.post(`https://saksham-backend-9719.onrender.com/api/admin/grievance/move`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if(res.data.success) {
                toast.success(actionTab === 'forward' ? "Case Forwarded Successfully!" : "Case Resolved & Closed!");
                setTimeout(() => navigate('/admin/complaints'), 2000);
            }
        } catch (err) {
            toast.error("Action processing failed");
        } finally { setUpdating(false); }
    };

    if (loading) return (
        <CityLayout>
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={50} />
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Encrypted Case File...</p>
            </div>
        </CityLayout>
    );

    if (!complaint) return <CityLayout><div className="p-40 text-center font-black text-slate-300">CASE NOT FOUND</div></CityLayout>;

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-6 max-w-[1500px] mx-auto space-y-6 text-left font-sans bg-[#f8fafc] min-h-screen">
                
                {/* 🟢 TOP NAVIGATION & STATUS */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                            <ArrowLeft size={20}/>
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-800 italic uppercase">{complaint.ticket_id}</h1>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${complaint.status === 'Open' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                    {complaint.status}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nagar Nigam Case Registry • {new Date(complaint.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Assigned Department</p>
                            <p className="text-xs font-bold text-slate-700">{complaint.department_en || 'GENERAL'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- LEFT: DETAILS (8 COLS) --- */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Issue Details */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-10 opacity-5"><FileText size={120}/></div>
                             <div className="relative z-10">
                                <SectionHeader icon={MessageSquare} label="Complaint Details / शिकायत का विवरण" color="rose" />
                                <h2 className="text-3xl font-black text-slate-800 uppercase italic mb-8 mt-4 leading-tight">{complaint.subject}</h2>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-dashed border-slate-200">
                                        <p className="text-slate-600 text-lg leading-relaxed">"{complaint.description}"</p>
                                    </div>
                                    {complaint.description_hi && (
                                        <div className="bg-emerald-50/40 p-8 rounded-[2.5rem] border border-emerald-100">
                                            <p className="text-emerald-900 text-xl font-bold italic">"{complaint.description_hi}"</p>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>

                        {/* Maps & Logistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailCard icon={MapPin} label="Location Analysis" color="emerald">
                                <div className="space-y-4 pt-2">
                                    <InfoRow label="Ward No" val={complaint.ward_no} />
                                    <InfoRow label="Citizen Address" val={complaint.address_hi || complaint.address_en} />
                                    <button className="w-full mt-2 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-200">Open GIS Map</button>
                                </div>
                            </DetailCard>
                            <DetailCard icon={History} label="Timing Matrix" color="blue">
                                <div className="space-y-4 pt-2">
                                    <InfoRow label="Filed At" val={new Date(complaint.created_at).toLocaleTimeString()} />
                                    <InfoRow label="Wait Time" val="2h 15m" />
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Priority Level</p>
                                        <p className="text-xs font-bold text-blue-700">NORMAL SERVICE LEVEL</p>
                                    </div>
                                </div>
                            </DetailCard>
                        </div>

                        {/* Hierarchy Trail (Timeline) */}
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
                            <SectionHeader icon={Reply} label="Hierarchy Movement Trail / पेपर ट्रेल" color="indigo" />
                            <div className="mt-10 relative pl-12 space-y-12">
                                <div className="absolute left-5 top-2 bottom-2 w-1 bg-slate-50" />
                                <TimelineNode icon={User} title="Case Opened" time={new Date(complaint.created_at).toLocaleString()} active desc={`Citizen ${complaint.applicant_name} filed from App`} />
                                <TimelineNode icon={ShieldCheck} title="Tenant Verified" time="System Auto" active desc={`Validated by ${complaint.tenant_id} Admin`} />
                                <TimelineNode icon={Settings} title="Current Status" time={complaint.status} active={complaint.status !== 'Open'} desc={complaint.admin_remarks || 'Case is currently under active review'} />
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: ACTIONS & CITIZEN (4 COLS) --- */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Action Center - The Logic Engine */}
                        <div className="bg-slate-900 rounded-[3.5rem] p-1 text-white shadow-2xl overflow-hidden">
                             <div className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center"><UserUp size={24}/></div>
                                    <h3 className="text-xl font-black uppercase italic">Action Center</h3>
                                </div>

                                {/* Tab Switcher */}
                                <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl mb-8">
                                    <button 
                                        onClick={() => setActionTab('forward')}
                                        className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${actionTab === 'forward' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-white'}`}
                                    >Forward Case</button>
                                    <button 
                                        onClick={() => setActionTab('resolve')}
                                        className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${actionTab === 'resolve' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-white'}`}
                                    >Close / Resolve</button>
                                </div>

                                <form onSubmit={handleMovement} className="space-y-6">
                                    {actionTab === 'forward' ? (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Select Field Official</label>
                                                <select 
                                                    required value={selectedOfficial} onChange={(e) => setSelectedOfficial(e.target.value)}
                                                    className="w-full bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 text-emerald-100 outline-none transition-all"
                                                >
                                                    <option value="">Choose Official...</option>
                                                    {officials.map(o => (
                                                        <option key={o.id} value={o.id}>{o.full_name_en} - {o.designation_name_en}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Resolution Proof (Photo)</label>
                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-3xl cursor-pointer hover:bg-white/5 transition-all group">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        {proofFile ? <CheckCircle2 className="text-emerald-500 mb-2" /> : <Camera className="text-slate-500 group-hover:text-emerald-400 mb-2" />}
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase">{proofFile ? proofFile.name : 'Upload Work Evidence'}</p>
                                                    </div>
                                                    <input type="file" className="hidden" onChange={(e) => setProofFile(e.target.files[0])} />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Notes / Instructions</label>
                                        <textarea 
                                            rows="4" required value={remarks} onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Write case notes here..."
                                            className="w-full bg-slate-800 border-none rounded-3xl p-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500 text-slate-200 outline-none placeholder:text-slate-600"
                                        ></textarea>
                                    </div>

                                    <button 
                                        disabled={updating}
                                        className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 ${actionTab === 'forward' ? 'bg-white text-slate-900 hover:bg-emerald-400' : 'bg-emerald-500 text-white hover:bg-emerald-400'} disabled:opacity-50 active:scale-95`}
                                    >
                                        {updating ? <Loader2 className="animate-spin" /> : (actionTab === 'forward' ? <UserUp size={20}/> : <Send size={20}/>)} 
                                        {actionTab === 'forward' ? 'Authorize Movement' : 'Verify & Close File'}
                                    </button>
                                </form>
                             </div>
                        </div>

                        {/* Citizen Mini HUD */}
                        <div className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-24 bg-rose-500/5" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-slate-900 rounded-full mx-auto border-[6px] border-white shadow-2xl flex items-center justify-center text-white text-3xl font-black mb-4 group hover:rotate-12 transition-transform cursor-pointer">
                                    {complaint.applicant_name?.charAt(0)}
                                </div>
                                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{complaint.applicant_name}</h4>
                                <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                                    <InfoItem icon={Phone} label="Contact Mobile" value={`+91 ${complaint.mobile}`} />
                                    <button 
                                        onClick={() => setShowPhoto(true)}
                                        className="w-full bg-slate-50 text-slate-600 p-4 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-2 border border-slate-100"
                                    >
                                        <ImageIcon size={16}/> View Attached Evidence
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
                            <div className="h-[650px] bg-slate-100 flex items-center justify-center">
                                {complaint.photo_url ? <img src={complaint.photo_url} className="w-full h-full object-contain" /> : <p className="font-black text-slate-300 tracking-widest uppercase">NO IMAGE LOGGED</p>}
                                <button onClick={() => setShowPhoto(false)} className="absolute top-8 right-8 p-4 bg-black/20 text-white rounded-full hover:bg-rose-500 transition-all"><X/></button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

// --- ✨ High-End Helper Components ---

const SectionHeader = ({ icon: Icon, label, color }) => (
    <div className={`flex items-center gap-4 text-${color}-500`}>
        <div className={`p-3 rounded-2xl bg-${color}-50 shadow-inner`}><Icon size={24}/></div>
        <h3 className="text-[12px] font-black uppercase tracking-[0.4em]">{label}</h3>
    </div>
);

const DetailCard = ({ icon: Icon, label, children, color }) => (
    <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600`}><Icon size={20}/></div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</h4>
        </div>
        {children}
    </div>
);

const InfoRow = ({ label, val }) => (
    <div className="flex justify-between items-start border-b border-slate-50 pb-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
        <p className="text-xs font-black text-slate-800 text-right uppercase max-w-[200px] leading-tight">{val || 'NA'}</p>
    </div>
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

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 text-left">
        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-slate-100"><Icon size={20}/></div>
        <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-xs font-black text-slate-800 uppercase truncate">{value}</p>
        </div>
    </div>
);

export default GrievanceDetail;
