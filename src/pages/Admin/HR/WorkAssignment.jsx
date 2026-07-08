import React, { useState, useEffect, useMemo } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
  Search, Download, RefreshCcw, LayoutGrid, ChevronRight, 
  FileText, Loader2, ChevronLeft, FileSpreadsheet, Briefcase, 
  ShieldCheck, Settings2, AlertCircle, FileDown, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx'; // Make sure to npm install xlsx
import jsPDF from 'jspdf'; // Make sure to npm install jspdf
import 'jspdf-autotable';

// --- Forms & Components ---
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
  const [masterDesignations, setMasterDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPost, setSelectedPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Table States
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeForm, setActiveForm] = useState(null);
  const [targetStaff, setTargetStaff] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const tenantId = localStorage.getItem('tenantId');

  // 🟢 1. Load All Master Data (Link Optimized)
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [staffRes, rolesRes, desRes] = await Promise.all([
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-full/${tenantId}`),
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roles/${tenantId}`),
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/designations/${tenantId}`)
      ]);
      setStaff(staffRes.data.data || []);
      setRoles(rolesRes.data.data || []);
      setMasterDesignations(desRes.data.data || []);
    } catch (e) {
      toast.error("Cloud Server Sync Failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  // 🟢 2. Post Dependent Dropdown Logic (Strict Link)
  const filteredPosts = useMemo(() => {
    if (!selectedRole) return [];
    return masterDesignations.filter(p => String(p.role_id) === String(selectedRole));
  }, [selectedRole, masterDesignations]);

  // 🟢 3. Final Filtering Engine (Handles Search, Role, and Post)
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const searchStr = searchTerm.toLowerCase();
      const matchSearch = (s.full_name_en?.toLowerCase() || "").includes(searchStr) || 
                          (s.employee_id?.toLowerCase() || "").includes(searchStr);
      
      const matchRole = selectedRole ? String(s.role_id) === String(selectedRole) : true;
      const matchPost = selectedPost ? String(s.designation_id) === String(selectedPost) : true;

      return matchSearch && matchRole && matchPost;
    });
  }, [staff, searchTerm, selectedRole, selectedPost]);

  // 🟢 4. Pagination Data
  const currentRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredStaff.slice(start, start + rowsPerPage);
  }, [filteredStaff, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);

  // 🟢 5. Export Handlers (Excel & PDF Logic)
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredStaff.map(s => ({
      ID: s.employee_id, Name: s.full_name_en, Role: s.role_name, Post: s.designation_name_en, Status: s.is_assigned ? 'Allocated' : 'Waiting'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff_Duty");
    XLSX.writeFile(wb, `Duty_Report_${tenantId}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Personnel Duty Allocation Report", 14, 15);
    doc.autoTable({
      head: [['ID', 'Name', 'Role', 'Post', 'Status']],
      body: filteredStaff.map(s => [s.employee_id, s.full_name_en, s.role_name, s.designation_name_en, s.is_assigned ? 'Allocated' : 'Waiting']),
      startY: 20
    });
    doc.save(`Duty_Report_${tenantId}.pdf`);
  };

  // 🟢 6. Form Switcher Logic
  const handleAction = (member) => {
    setTargetStaff(member);
    const post = (member.designation_name_en || "").toLowerCase();
    
    if (post.includes("collector")) setActiveForm('COLLECTOR');
    else if (post.includes("sweeper") || post.includes("coolie") || post.includes("road")) setActiveForm('ROAD');
    else if (post.includes("ward inspector")) setActiveForm('W_INSP');
    else if (post.includes("circle inspector")) setActiveForm('C_INSP');
    else if (post.includes("sanitation inspector")) setActiveForm('SANI_INSP');
    else if (post.includes("incharge")) setActiveForm('SECTION');
    else toast.error("Logic mismatch for this post designation.");
  };

  const onAssignmentSuccess = (msg) => {
    setActiveForm(null); setSuccessMsg(msg); setShowSuccess(true); fetchInitialData();
  };

  return (
    <CityLayout>
      <Toaster position="top-center" />
      <div className="p-4 space-y-4 bg-[#f8fafc] min-h-screen text-left font-sans select-none">
        
        {/* --- Top Command Header --- */}
        <div className="bg-white px-6 py-4 rounded-[1.2rem] shadow-sm flex flex-col md:flex-row justify-between items-center border-t-4 border-indigo-600">
           <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                <LayoutGrid size={24} />
              </div>
              <div>
                 <h1 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Duty Assignment</h1>
                 <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em]">Operational Node: {tenantId}</p>
              </div>
           </div>
           
           <div className="flex gap-2 mt-4 md:mt-0">
              <button onClick={fetchInitialData} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90">
                 <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-xs uppercase hover:bg-rose-600 transition-all shadow-md">
                 <FileDown size={16} /> PDF
              </button>
              <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-emerald-700 transition-all shadow-md">
                 <FileSpreadsheet size={16} /> EXCEL
              </button>
           </div>
        </div>

        {/* --- Logic-Linked Filters --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-[1rem] shadow-md border border-slate-100">
           <div className="md:col-span-3 relative group">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
              <select 
                className="w-full pl-10 pr-3 py-3 bg-slate-50 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-indigo-500 transition-all cursor-pointer"
                value={selectedRole}
                onChange={(e) => { setSelectedRole(e.target.value); setSelectedPost(''); setCurrentPage(1); }}
              >
                <option value="">Filter by Role</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
              </select>
           </div>

           <div className="md:col-span-3 relative group">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
              <select 
                disabled={!selectedRole}
                className="w-full pl-10 pr-3 py-3 bg-slate-50 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-indigo-500 disabled:opacity-40 transition-all cursor-pointer"
                value={selectedPost}
                onChange={(e) => { setSelectedPost(e.target.value); setCurrentPage(1); }}
              >
                <option value="">{selectedRole ? 'Select Post...' : 'Select Role First'}</option>
                {filteredPosts.map(p => <option key={p.id} value={p.id}>{p.designation_name_en}</option>)}
              </select>
           </div>

           <div className="md:col-span-6 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
              <input 
                type="text" 
                placeholder="Quick search by Name, Phone or ID..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
           </div>
        </div>

        {/* --- Main Data Display Card --- */}
        <div className="bg-white rounded-[1.2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
           <div className="overflow-x-auto overflow-y-auto max-h-[55vh]">
             <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20">
                   <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                      <th className="px-6 py-4">Employee Profile</th>
                      <th className="px-4 py-4">Structure Position</th>
                      <th className="px-4 py-4">Current Mapping</th>
                      <th className="px-4 py-4 text-center">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {loading ? (
                     <tr><td colSpan="4" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-indigo-600" size={40} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Staff List...</p>
                        </div>
                     </td></tr>
                   ) : currentRows.length === 0 ? (
                     <tr><td colSpan="4" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-40">
                            <AlertCircle size={48} className="text-slate-300" />
                            <p className="font-black text-slate-400 uppercase text-xs">No records match your filters</p>
                        </div>
                     </td></tr>
                   ) : currentRows.map((s) => (
                      <motion.tr 
                        key={s.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        whileHover={{ backgroundColor: "#fcfdff" }} 
                        className="group"
                      >
                         <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                  {s.full_name_en ? s.full_name_en[0] : 'U'}
                               </div>
                               <div>
                                  <p className="font-bold text-slate-800 text-xs uppercase italic leading-none">{s.full_name_en}</p>
                                  <p className="text-[9px] font-black text-slate-400 mt-1.5 tracking-wider uppercase">EMP: {s.employee_id}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                               <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded-md w-fit">{s.role_name}</span>
                               <span className="text-[10px] font-bold text-slate-600 uppercase truncate max-w-[150px]">{s.designation_name_en}</span>
                            </div>
                         </td>
                         <td className="px-4 py-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit border ${s.is_assigned ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
                               <div className={`w-1.5 h-1.5 rounded-full ${s.is_assigned ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                               <span className="text-[10px] font-black uppercase tracking-widest">{s.is_assigned ? 'Active Duty' : 'Pool/Idle'}</span>
                            </div>
                         </td>
                         <td className="px-4 py-3 text-center">
                            <button 
                              onClick={() => handleAction(s)}
                              className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-100 active:scale-90 group/btn"
                            >
                               <Settings2 size={16} className="group-hover/btn:rotate-90 transition-transform duration-300" />
                            </button>
                         </td>
                      </motion.tr>
                   ))}
                </tbody>
             </table>
           </div>

           {/* --- Multi-Feature Pagination Footer --- */}
           <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-5">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Per Page</span>
                    <select className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-xs outline-none focus:border-indigo-500" value={rowsPerPage} onChange={(e) => {setRowsPerPage(Number(e.target.value)); setCurrentPage(1);}}>
                      {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                 </div>
                 <div className="h-6 w-px bg-slate-300" />
                 <p className="text-[10px] font-bold text-slate-500 uppercase italic">
                    Showing <span className="text-indigo-600 font-black">{Math.min(indexOfFirstRow + 1, filteredStaff.length)}</span> - <span className="text-indigo-600 font-black">{Math.min(indexOfLastRow, filteredStaff.length)}</span> of <span className="text-slate-800 font-black">{filteredStaff.length}</span> Personnel
                 </p>
              </div>

              <div className="flex items-center gap-1">
                 <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all shadow-sm"><ChevronLeft size={20}/></button>
                 <div className="flex items-center gap-1 mx-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Page</span>
                    <span className="px-4 py-1.5 bg-white border-2 border-indigo-600 rounded-lg font-black text-xs text-indigo-600 shadow-sm">{currentPage}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">of {totalPages || 1}</span>
                 </div>
                 <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all shadow-sm"><ChevronRight size={20}/></button>
              </div>
           </div>
        </div>
      </div>

      {/* --- Intelligent Form Modals Link --- */}
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

// Helper for Pagination calc
const indexOfFirstRow = (currentPage, rowsPerPage) => (currentPage - 1) * rowsPerPage;
const indexOfLastRow = (currentPage, rowsPerPage) => currentPage * rowsPerPage;

export default WorkAssignment;
