import React, { useState, useEffect, useMemo } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
  Search, Download, RefreshCcw, LayoutGrid, ChevronRight, 
  FileText, Loader2, ChevronLeft, FileSpreadsheet, Briefcase, 
  ShieldCheck, Settings2, AlertCircle, FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [masterDesignations, setMasterDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPost, setSelectedPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Table Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Control
  const [activeForm, setActiveForm] = useState(null);
  const [targetStaff, setTargetStaff] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const tenantId = localStorage.getItem('tenantId');

  // 🟢 1. Data Fetching
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
      toast.error("Server Link Failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  // 🟢 2. Post Dependent Dropdown (Fixed Logic)
  const filteredPosts = useMemo(() => {
    if (!selectedRole) return [];
    return masterDesignations.filter(p => String(p.role_id) === String(selectedRole));
  }, [selectedRole, masterDesignations]);

  // 🟢 3. Search & Filter Engine (Fixed: Comparison with Designation Name)
  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const sName = (s.full_name_en || "").toLowerCase();
      const sEmpId = (s.employee_id || "").toLowerCase();
      const query = searchTerm.toLowerCase();
      
      const matchSearch = sName.includes(query) || sEmpId.includes(query);
      const matchRole = selectedRole ? String(s.role_id) === String(selectedRole) : true;
      const matchPost = selectedPost ? String(s.designation_id) === String(selectedPost) : true;
      
      return matchSearch && matchRole && matchPost;
    });
  }, [staff, searchTerm, selectedRole, selectedPost]);

  // 🟢 4. Pagination Calculations (Fixed: No more NaN)
  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage) || 1;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStaff.slice(indexOfFirstRow, indexOfLastRow);

  // 🟢 5. Export Features (Fixed & Functional)
  const exportToExcel = () => {
    const data = filteredStaff.map(s => ({
      'Employee Name': s.full_name_en,
      'Emp ID': s.employee_id,
      'Role': s.role_name,
      'Designation': s.designation_name_en,
      'Status': s.is_assigned ? 'Assigned' : 'Pool'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StaffDuty");
    XLSX.writeFile(wb, `Staff_Duty_${tenantId}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Staff Duty Report - ${tenantId}`, 14, 10);
    doc.autoTable({
      head: [['Name', 'ID', 'Role', 'Post', 'Status']],
      body: filteredStaff.map(s => [s.full_name_en, s.employee_id, s.role_name, s.designation_name_en, s.is_assigned ? 'Yes' : 'No']),
    });
    doc.save("Duty_Report.pdf");
  };

  // 🟢 6. Form Dispatcher (Fixed: Handled Supervisor & Ward Inspector)
  const handleAction = (member) => {
    setTargetStaff(member);
    const post = (member.designation_name_en || "").toLowerCase();
    
    if (post.includes("collector")) setActiveForm('COLLECTOR');
    else if (post.includes("sweeper") || post.includes("coolie")) setActiveForm('ROAD');
    else if (post.includes("ward inspector") || post.includes("supervisor")) setActiveForm('W_INSP');
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
        
        {/* --- Dynamic Header --- */}
        <div className="bg-white px-6 py-4 rounded-[1.5rem] shadow-sm flex flex-col md:flex-row justify-between items-center border-b-4 border-indigo-600">
           <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-100"><LayoutGrid size={24} /></div>
              <div>
                 <h1 className="text-xl font-black text-slate-800 uppercase italic leading-none">Duty Assignment</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant: {tenantId}</p>
              </div>
           </div>
           
           <div className="flex gap-2">
              <button onClick={fetchInitialData} className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                 <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-rose-100">
                 <FileDown size={16} /> PDF
              </button>
              <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-emerald-100">
                 <FileSpreadsheet size={16} /> Excel
              </button>
           </div>
        </div>

        {/* --- Smart Filter Bar --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-[1.2rem] shadow-md border border-slate-100">
           <div className="md:col-span-3 relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select className="w-full pl-10 pr-3 py-3 bg-slate-50 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-indigo-500 transition-all cursor-pointer" value={selectedRole} onChange={(e) => {setSelectedRole(e.target.value); setSelectedPost(''); setCurrentPage(1);}}>
                <option value="">All Roles</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
              </select>
           </div>
           <div className="md:col-span-3 relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select disabled={!selectedRole} className="w-full pl-10 pr-3 py-3 bg-slate-50 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-indigo-500 disabled:opacity-40 transition-all cursor-pointer" value={selectedPost} onChange={(e) => {setSelectedPost(e.target.value); setCurrentPage(1);}}>
                <option value="">{selectedRole ? 'Filter Post...' : 'Select Role First'}</option>
                {filteredPosts.map(p => <option key={p.id} value={p.id}>{p.designation_name_en}</option>)}
              </select>
           </div>
           <div className="md:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Quick search by Name, Phone or ID..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-indigo-500 transition-all" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
           </div>
        </div>

        {/* --- Optimized Table Container --- */}
        <div className="bg-white rounded-[1.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
           <div className="overflow-x-auto max-h-[55vh]">
             <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20">
                   <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                      <th className="px-6 py-4">Employee Profile</th>
                      <th className="px-4 py-4">Role</th>
                      <th className="px-4 py-4">Designation (Post)</th>
                      <th className="px-4 py-4 text-center">Status</th>
                      <th className="px-4 py-4 text-center">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {loading ? (
                     <tr><td colSpan="5" className="py-24 text-center"><Loader2 className="animate-spin text-indigo-600 mx-auto" size={40} /></td></tr>
                   ) : currentRows.length === 0 ? (
                     <tr><td colSpan="5" className="py-24 text-center text-slate-300 flex flex-col items-center gap-2"><AlertCircle size={40}/><p className="font-bold text-xs uppercase">No Results Found</p></td></tr>
                   ) : currentRows.map((s) => (
                      <tr key={s.id} className="hover:bg-indigo-50/70 transition-colors group">
                         <td className="px-6 py-2.5">
                            <div className="flex items-center gap-3">
                               <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600 border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  {s.full_name_en ? s.full_name_en[0] : 'U'}
                               </div>
                               <div>
                                  <p className="font-bold text-slate-800 text-[11px] uppercase italic leading-none">{s.full_name_en}</p>
                                  <p className="text-[9px] font-black text-slate-400 mt-1 uppercase">ID: {s.employee_id}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-4 py-2.5">
                            <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md">{s.role_name}</span>
                         </td>
                         <td className="px-4 py-2.5">
                            <span className="text-[10px] font-bold text-slate-600 uppercase truncate">{s.designation_name_en}</span>
                         </td>
                         <td className="px-4 py-2.5 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${s.is_assigned ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'}`}>
                               <div className={`w-1.5 h-1.5 rounded-full ${s.is_assigned ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                               <span className="text-[9px] font-black uppercase tracking-widest">{s.is_assigned ? 'Live' : 'Pool'}</span>
                            </div>
                         </td>
                         <td className="px-4 py-2.5 text-center">
                            <button onClick={() => handleAction(s)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-100 active:scale-90 group/btn">
                               <Settings2 size={16} className="group-hover/btn:rotate-90 transition-transform" />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>

           {/* --- Professional Table Footer --- */}
           <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-5">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Per Page</span>
                    <select className="px-2 py-1 bg-white border border-slate-300 rounded-md font-bold text-[10px] outline-none" value={rowsPerPage} onChange={(e) => {setRowsPerPage(Number(e.target.value)); setCurrentPage(1);}}>
                      {[10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                 </div>
                 <div className="h-6 w-px bg-slate-300" />
                 <p className="text-[10px] font-bold text-slate-500 uppercase italic">
                    Showing <span className="text-indigo-600">{Math.min(indexOfFirstRow + 1, filteredStaff.length)}</span> - <span className="text-indigo-600">{Math.min(indexOfLastRow, filteredStaff.length)}</span> of {filteredStaff.length} Nodes
                 </p>
              </div>

              <div className="flex items-center gap-2">
                 <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all"><ChevronLeft size={18}/></button>
                 <div className="flex items-center px-4 py-1 bg-white border-2 border-indigo-600 rounded-lg font-black text-xs text-indigo-600 shadow-sm">{currentPage} / {totalPages}</div>
                 <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all"><ChevronRight size={18}/></button>
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
