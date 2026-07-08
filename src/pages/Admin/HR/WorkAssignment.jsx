import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
  Search, Filter, Download, RefreshCcw, LayoutGrid, ChevronRight, 
  FileText, Loader2, ChevronLeft, FileSpreadsheet, Briefcase, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// --- Specialized Form Imports ---
import SuccessModal from '../../../components/SuccessModal';
import CollectorForm from './forms/CollectorForm';
import RoadAssign from './forms/RoadAssign';
import RoadSweeperForm from './forms/RoadSweeperForm';
import WardInspectorForm from './forms/WardInspectorForm';
import CircleInspectorForm from './forms/CircleInspectorForm';
import SanitationInspectorForm from './forms/SanitationInspectorForm';
import SectionInchargeForm from './forms/SectionInchargeForm';

const WorkAssignment = () => {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [posts, setPosts] = useState([]); // Dependent Dropdown Data
  const [loading, setLoading] = useState(false);
  
  // Filters State
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPost, setSelectedPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination & Rows
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Control
  const [activeForm, setActiveForm] = useState(null);
  const [targetStaff, setTargetStaff] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const tenantId = localStorage.getItem('tenantId');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Staff & Roles
      const [staffRes, rolesRes] = await Promise.all([
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-full/${tenantId}`),
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roles/${tenantId}`)
      ]);
      setStaff(staffRes.data.data || []);
      setRoles(rolesRes.data.data || []);
    } catch (e) { 
      toast.error("Data Sync Failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 🟢 Post Dependent Dropdown Logic
  useEffect(() => {
    if (selectedRole) {
      axios.get(`https://saksham-backend-9719.onrender.com/api/admin/designations/${tenantId}`)
        .then(res => {
          // Filter designations that match the selected role_id
          const filteredPosts = res.data.data.filter(p => String(p.role_id) === String(selectedRole));
          setPosts(filteredPosts);
          setSelectedPost(''); // Reset post when role changes
        });
    } else {
      setPosts([]);
    }
  }, [selectedRole, tenantId]);

  // Filtering Logic for Table
  const filteredStaff = staff.filter(s => {
    const matchSearch = s.full_name_en.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = selectedRole ? String(s.role_id) === String(selectedRole) : true;
    const matchPost = selectedPost ? String(s.designation_id) === String(selectedPost) : true;
    return matchSearch && matchRole && matchPost;
  });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStaff.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);

  const handleAction = (member) => {
    setTargetStaff(member);
    const post = member.designation_name_en?.toLowerCase() || "";
    
    if (post.includes("collector")) setActiveForm('COLLECTOR');
    else if (post.includes("sweeper") || post.includes("coolie")) setActiveForm('ROAD');
    else if (post.includes("ward inspector")) setActiveForm('W_INSP');
    else if (post.includes("circle inspector")) setActiveForm('C_INSP');
    else if (post.includes("sanitation inspector")) setActiveForm('SANI_INSP');
    else if (post.includes("incharge")) setActiveForm('SECTION');
    else toast.error("Specialized logic not found for this post");
  };

  const onAssignmentSuccess = (msg) => {
    setActiveForm(null);
    setSuccessMsg(msg);
    setShowSuccess(true);
    fetchData();
  };

  return (
    <CityLayout>
      <Toaster position="top-center" />
      <div className="p-4 md:p-6 space-y-6 bg-[#f0f4f8] min-h-screen text-left">
        
        {/* --- Top Dashboard Card --- */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-indigo-500 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-5">
              <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg"><LayoutGrid size={28} /></div>
              <div>
                 <h1 className="text-xl font-black text-slate-800 uppercase italic">Personnel Duty Allocation</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-Tenant Node: {tenantId}</p>
              </div>
           </div>
           
           <div className="flex gap-2">
              <button onClick={fetchData} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                 <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-rose-500 text-white rounded-xl font-bold text-xs uppercase transition-all hover:bg-rose-600">
                 <FileText size={16} /> PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase transition-all hover:bg-emerald-700">
                 <FileSpreadsheet size={16} /> Excel
              </button>
           </div>
        </div>

        {/* --- Advanced Filters Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-[1.5rem] shadow-md border border-slate-100">
           {/* 1. Role Dropdown */}
           <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 transition-all"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">All Roles</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
              </select>
           </div>

           {/* 2. Post Dependent Dropdown */}
           <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                disabled={!selectedRole}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 transition-all disabled:opacity-50"
                value={selectedPost}
                onChange={(e) => setSelectedPost(e.target.value)}
              >
                <option value="">{selectedRole ? 'Select Post...' : 'Choose Role First'}</option>
                {posts.map(p => <option key={p.id} value={p.id}>{p.designation_name_en}</option>)}
              </select>
           </div>
           
           {/* 3. Search Box */}
           <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search staff by Name or ID..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-indigo-500 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* --- Multi-Color Table Section --- */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em]">
                      <th className="p-6">Employee Profile</th>
                      <th className="p-6">Role & Post</th>
                      <th className="p-6">Current Status</th>
                      <th className="p-6 text-center">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {loading ? (
                     <tr>
                        <td colSpan="4" className="p-20 text-center">
                           <Loader2 className="animate-spin text-indigo-600 mx-auto" size={40} />
                        </td>
                     </tr>
                   ) : currentRows.map((s) => (
                      <motion.tr 
                        whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.05)" }}
                        key={s.id} 
                        className="transition-all"
                      >
                         <td className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-black text-white shadow-md">
                                  {s.full_name_en[0]}
                               </div>
                               <div>
                                  <p className="font-black text-slate-800 uppercase text-sm italic">{s.full_name_en}</p>
                                  <p className="text-[10px] font-bold text-slate-400">ID: {s.employee_id}</p>
                               </div>
                            </div>
                         </td>
                         <td className="p-6">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase mr-2">{s.role_name}</span>
                            <p className="text-xs font-bold text-slate-600 mt-1 uppercase">{s.designation_name_en}</p>
                         </td>
                         <td className="p-6">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${s.is_assigned ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                               <div className={`w-1.5 h-1.5 rounded-full ${s.is_assigned ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                               <span className="text-[10px] font-black uppercase tracking-widest">{s.is_assigned ? 'Allocated' : 'Waiting'}</span>
                            </div>
                         </td>
                         <td className="p-6 text-center">
                            <button 
                              onClick={() => handleAction(s)}
                              className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 shadow-lg flex items-center gap-2 mx-auto transition-all active:scale-95"
                            >
                               Configure Duty <ChevronRight size={14} />
                            </button>
                         </td>
                      </motion.tr>
                   ))}
                </tbody>
             </table>
           </div>

           {/* --- Table Footer: Row Select & Pagination --- */}
           <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-slate-400 uppercase">Rows per page:</span>
                 <select 
                    className="p-2 bg-white border border-slate-300 rounded-lg font-bold text-xs outline-none"
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                 </select>
                 <span className="text-[10px] font-black text-slate-400 uppercase ml-4">
                    Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredStaff.length)} of {filteredStaff.length}
                 </span>
              </div>

              <div className="flex gap-2">
                 <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-3 bg-white border border-slate-300 rounded-xl text-slate-500 disabled:opacity-30 hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <ChevronLeft size={20}/>
                 </button>
                 <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-3 bg-white border border-slate-300 rounded-xl text-slate-500 disabled:opacity-30 hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <ChevronRight size={20}/>
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* --- Specialized Form Modals --- */}
      <AnimatePresence>
          {activeForm === 'COLLECTOR' && <CollectorForm staff={targetStaff} onSuccess={onAssignmentSuccess} onClose={() => setActiveForm(null)} />}
          {activeForm === 'ROAD' && <RoadAssign staff={targetStaff} onSuccess={onAssignmentSuccess} onClose={() => setActiveForm(null)} />}
          {activeForm === 'W_INSP' && <WardInspectorForm staff={targetStaff} onSuccess={onAssignmentSuccess} onClose={() => setActiveForm(null)} />}
          {activeForm === 'C_INSP' && <CircleInspectorForm staff={targetStaff} onSuccess={onAssignmentSuccess} onClose={() => setActiveForm(null)} />}
          {activeForm === 'SANI_INSP' && <SanitationInspectorForm staff={targetStaff} onSuccess={onAssignmentSuccess} onClose={() => setActiveForm(null)} />}
          {activeForm === 'SECTION' && <SectionInchargeForm staff={targetStaff} onSuccess={onAssignmentSuccess} onClose={() => setActiveForm(null)} />}
          
          {showSuccess && <SuccessModal message={successMsg} onClose={() => setShowSuccess(false)} />}
      </AnimatePresence>
    </CityLayout>
  );
};

export default WorkAssignment;
