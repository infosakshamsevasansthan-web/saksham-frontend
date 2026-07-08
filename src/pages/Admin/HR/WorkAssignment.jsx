import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
  Search, Filter, Download, RefreshCcw, LayoutGrid, ChevronRight, FileText, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// --- 🛡️ Path Fixes: Aapke GitHub Screenshot ke anusaar ---
import SuccessModal from '../../../../components/SuccessModal';
import CollectorForm from './forms/CollectorForm';
import RoadSweeperForm from './forms/RoadSweeperForm';
import WardInspectorForm from './forms/WardInspectorForm';
import CircleInspectorForm from './forms/CircleInspectorForm';
import SanitationInspectorForm from './forms/SanitationInspectorForm';
import SectionInchargeForm from './forms/SectionInchargeForm';

const WorkAssignment = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeForm, setActiveForm] = useState(null);
  const [targetStaff, setTargetStaff] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const tenantId = localStorage.getItem('tenantId');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-full/${tenantId}`);
      setStaff(res.data.data || []);
    } catch (e) { 
      toast.error("Data Sync Failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = (member) => {
    setTargetStaff(member);
    const post = member.designation_name_en?.toLowerCase() || "";
    
    // Yahan logic aapke GitHub file names se match kar raha hai
    if (post.includes("collector")) setActiveForm('COLLECTOR');
    else if (post.includes("sweeper") || post.includes("coolie")) setActiveForm('ROAD');
    else if (post.includes("ward inspector")) setActiveForm('W_INSP');
    else if (post.includes("circle inspector")) setActiveForm('C_INSP');
    else if (post.includes("sanitation inspector")) setActiveForm('SANI_INSP');
    else if (post.includes("incharge")) setActiveForm('SECTION');
    else toast.error("Is post ke liye assignment logic set nahi hai");
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
      <div className="p-4 md:p-8 space-y-6 bg-[#f8fafc] min-h-screen text-left">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center">
           <div className="flex items-center gap-5">
              <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-200"><LayoutGrid size={30} /></div>
              <div>
                 <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-none">Work Allocation</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Operational Node: {tenantId}</p>
              </div>
           </div>
           <button onClick={fetchData} className="p-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-indigo-50 transition-all active:scale-95">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>

        {/* Table Data */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
           {loading ? (
             <div className="p-20 text-center flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="font-bold text-slate-400 text-xs uppercase tracking-widest">Building Personnel Data...</p>
             </div>
           ) : (
             <table className="w-full text-left">
              <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                 <tr>
                    <th className="p-6">Employee Profile</th>
                    <th className="p-6">Designation</th>
                    <th className="p-6">Assignment Status</th>
                    <th className="p-6 text-center">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {staff.filter(s => s.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())).map((s) => (
                    <tr key={s.id} className="hover:bg-indigo-50/50 transition-all group">
                       <td className="p-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">{s.full_name_en[0]}</div>
                             <div>
                                <p className="font-black text-slate-800 uppercase text-sm italic leading-none">{s.full_name_en}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">ID: {s.employee_id}</p>
                             </div>
                          </div>
                       </td>
                       <td className="p-6"><span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{s.designation_name_en}</span></td>
                       <td className="p-6">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${s.is_assigned ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                             <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{s.is_assigned ? 'Allocated' : 'Waiting Area'}</span>
                          </div>
                       </td>
                       <td className="p-6 text-center">
                          <button onClick={() => handleAction(s)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 shadow-lg flex items-center gap-2 mx-auto transition-all active:scale-95">Configure <ChevronRight size={14} /></button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
           )}
        </div>
      </div>

      {/* --- Specialized Form Modals --- */}
      <AnimatePresence>
          {activeForm === 'COLLECTOR' && <CollectorForm staff={targetStaff} onSuccess={onAssignmentSuccess} onClose={() => setActiveForm(null)} />}
          {activeForm === 'ROAD' && <RoadSweeperForm staff={targetStaff} onSuccess={onAssignmentSuccess} onClose={() => setActiveForm(null)} />}
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
