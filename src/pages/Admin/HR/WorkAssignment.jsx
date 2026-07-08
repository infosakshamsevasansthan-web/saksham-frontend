import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Users, Filter, Search, Download, RefreshCcw, 
    ChevronRight, MapPin, Road, ShieldCheck, Building2,
    FileSpreadsheet, FileJson, Loader2, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// Sub-Pages/Modals for specific logic (Inhe alag files me banana)
import CollectorAssign from './forms/CollectorAssign';
import RoadAssign from './forms/RoadAssign';
import InspectorAssign from './forms/InspectorAssign';
import SectionAssign from './forms/SectionAssign';

const WorkAssignment = () => {
    const [staff, setStaff] = useState([]);
    const [roles, setRoles] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedPost, setSelectedPost] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination & View
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal Control
    const [activeModal, setActiveModal] = useState(null); // 'collector', 'road', etc.
    const [targetStaff, setTargetStaff] = useState(null);

    const tenantId = localStorage.getItem('tenantId');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sRes, rRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-full/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roles/${tenantId}`)
            ]);
            setStaff(sRes.data.data);
            setRoles(sRes.data.roles || []);
        } catch (e) { toast.error("Data fetch failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    // Post logic based on Role
    useEffect(() => {
        if (selectedRole) {
            axios.get(`https://saksham-backend-9719.onrender.com/api/admin/designations-by-role/${tenantId}/${selectedRole}`)
                .then(res => setPosts(res.data.data));
        }
    }, [selectedRole]);

    // 🟢 Action Button Logic (The Brain)
    const openAssignmentForm = (staffMember) => {
        setTargetStaff(staffMember);
        const postName = staffMember.designation_name_en?.toLowerCase() || "";
        
        if (postName.includes("collector")) setActiveModal('collector');
        else if (postName.includes("coolie") || postName.includes("sweeper")) setActiveModal('road');
        else if (postName.includes("inspector")) setActiveModal('inspector');
        else if (postName.includes("incharge")) setActiveModal('section');
        else toast.error("Specialized assignment not defined for this post");
    };

    return (
        <CityLayout>
            <Toaster />
            <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl text-white shadow-lg">
                            <Users size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Work Force Deployment</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage assignments by post & territory</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button onClick={fetchData} className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200">
                            <Download size={18} /> Export List
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-50">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-none focus:ring-2 ring-indigo-500/20"
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="">Select Role</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select 
                            disabled={!selectedRole}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-none focus:ring-2 ring-indigo-500/20 disabled:opacity-50"
                            onChange={(e) => setSelectedPost(e.target.value)}
                        >
                            <option value="">Select Post</option>
                            {posts.map(p => <option key={p.id} value={p.id}>{p.designation_name_en}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by Name or Employee ID..." 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-none focus:ring-2 ring-indigo-500/20"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Role & Post</th>
                                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Assignment Status</th>
                                <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {staff.filter(s => {
                                let match = true;
                                if(selectedRole && s.role_id != selectedRole) match = false;
                                if(selectedPost && s.designation_id != selectedPost) match = false;
                                if(searchTerm && !s.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())) match = false;
                                return match;
                            }).map((s, idx) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={s.id} 
                                    className="hover:bg-indigo-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 shadow-inner group-hover:from-indigo-500 group-hover:to-indigo-600 group-hover:text-white transition-all">
                                                {s.full_name_en[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm">{s.full_name_en}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {s.employee_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">{s.role_name}</span>
                                        <p className="text-xs font-bold text-slate-600 mt-1">{s.designation_name_en}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 ${s.current_assignment ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            <div className={`w-2 h-2 rounded-full animate-pulse ${s.current_assignment ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">
                                                {s.current_assignment ? 'Assigned' : 'Unassigned'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => openAssignmentForm(s)}
                                            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                                        >
                                            Assign <ChevronRight size={14} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Render Forms based on State */}
                <AnimatePresence>
                    {activeModal === 'collector' && <CollectorAssign staff={targetStaff} onClose={() => setActiveModal(null)} />}
                    {activeModal === 'road' && <RoadAssign staff={targetStaff} onClose={() => setActiveModal(null)} />}
                    {activeModal === 'inspector' && <InspectorAssign staff={targetStaff} onClose={() => setActiveModal(null)} />}
                    {activeModal === 'section' && <SectionAssign staff={targetStaff} onClose={() => setActiveModal(null)} />}
                </AnimatePresence>

            </div>
        </CityLayout>
    );
};

export default WorkAssignment;
