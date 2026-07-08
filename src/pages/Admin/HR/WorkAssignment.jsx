import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
  Search, Filter, Download, RefreshCcw, UserPlus, 
  Map, Road, Shield, Building, ChevronRight, FileText, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// --- Specialized Form Imports ---
import CollectorForm from './forms/CollectorForm';
import RoadSweeperForm from './forms/RoadSweeperForm';
import WardInspectorForm from './forms/WardInspectorForm';
import CircleInspectorForm from './forms/CircleInspectorForm';
import SectionInchargeForm from './forms/SectionInchargeForm';

const WorkAssignment = () => {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters State
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPost, setSelectedPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal Flow Control
  const [activeForm, setActiveForm] = useState(null); // 'COLLECTOR', 'ROAD', 'W_INSP', 'C_INSP', 'SECTION'
  const [targetStaff, setTargetStaff] = useState(null);

  const tenantId = localStorage.getItem('tenantId');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-full/${tenantId}`);
      setStaff(res.data.data);
      setRoles([
          {id: 3, name: 'Inspector'}, 
          {id: 4, name: 'Supervisor'}, 
          {id: 5, name: 'Staff'}
      ]);
    } catch (e) { toast.error("Sync Failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Intelligence: Kis post par kaunsa button/form dikhana hai
  const getActionType = (postName) => {
    const p = postName?.toLowerCase() || "";
    if (p.includes("collector")) return 'COLLECTOR';
    if (p.includes("sweeper") || p.includes("coolie")) return 'ROAD';
    if (p.includes("ward inspector")) return 'W_INSP';
    if (p.includes("circle inspector") || p.includes("sanitation inspector")) return 'C_INSP';
    if (p.includes("incharge")) return 'SECTION';
    return 'GENERAL';
  };

  const handleAction = (member) => {
    setTargetStaff(member);
    setActiveForm(getActionType(member.designation_name_en));
  };

  return (
    <CityLayout>
      <Toaster position="top-center" />
      <div className="p-4 md:p-8 space-y-6 bg-[#f8fafc] min-h-screen text-left">
        
        {/* --- Top Dashboard Card --- */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-5">
              <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-200">
                 <LayoutGrid size={30} />
              </div>
              <div>
                 <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Work Allocation Engine</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Smart Multi-Tenant Resource Mapping</p>
              </div>
           </div>
           
           <div className="flex gap-3">
              <button onClick={fetchData} className="p-4 bg-slate-50 text-slate-500 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                 <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl transition-all">
                 <FileText size={18} /> Export Data
              </button>
           </div>
        </div>

        {/* --- Advanced Filters --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-[2rem] shadow-sm">
           <select className="p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="">All Roles</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
           </select>
           
           <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search staff by name or employee ID..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-indigo-500/20"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <select className="p-4 bg-slate-100 rounded-2xl font-bold text-sm outline-none" onChange={(e) => setRowsPerPage(e.target.value)}>
              <option value="10">10 Rows</option>
              <option value="50">50 Rows</option>
              <option value="100">100 Rows</option>
           </select>
        </div>

        {/* --- Multi-Color Table --- */}
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-900 text-white">
                    <th className="p-6 font-black uppercase text-[10px] tracking-widest">Employee Profile</th>
                    <th className="p-6 font-black uppercase text-[10px] tracking-widest">Designation</th>
                    <th className="p-6 font-black uppercase text-[10px] tracking-widest">Duty Status</th>
                    <th className="p-6 font-black uppercase text-[10px] tracking-widest text-center">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {staff.filter(s => s.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, rowsPerPage).map((s, idx) => (
                    <tr key={s.id} className="hover:bg-indigo-50/50 transition-all group">
                       <td className="p-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                {s.full_name_en[0]}
                             </div>
                             <div>
                                <p className="font-black text-slate-800 uppercase text-sm italic">{s.full_name_en}</p>
                                <p className="text-[10px] font-bold text-slate-400">ID: {s.employee_id} | 📞 {s.mobile}</p>
                             </div>
                          </div>
                       </td>
                       <td className="p-6">
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase">{s.designation_name_en}</span>
                       </td>
                       <td className="p-6">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${s.is_assigned ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                                {s.is_assigned ? 'Allocated' : 'Waiting Area'}
                             </p>
                          </div>
                       </td>
                       <td className="p-6 text-center">
                          <button 
                            onClick={() => handleAction(s)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 shadow-lg transition-all flex items-center gap-2 mx-auto"
                          >
                             Configure Assignment <ChevronRight size={14} />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* --- Intelligent Form Modals --- */}
      <AnimatePresence>
          {activeForm === 'COLLECTOR' && <CollectorForm staff={targetStaff} onClose={() => setActiveForm(null)} />}
          {activeForm === 'ROAD' && <RoadSweeperForm staff={targetStaff} onClose={() => setActiveForm(null)} />}
          {activeForm === 'W_INSP' && <WardInspectorForm staff={targetStaff} onClose={() => setActiveForm(null)} />}
          {activeForm === 'C_INSP' && <CircleInspectorForm staff={targetStaff} onClose={() => setActiveForm(null)} />}
          {activeForm === 'SECTION' && <SectionInchargeForm staff={targetStaff} onClose={() => setActiveForm(null)} />}
      </AnimatePresence>

    </CityLayout>
  );
};

export default WorkAssignment;
