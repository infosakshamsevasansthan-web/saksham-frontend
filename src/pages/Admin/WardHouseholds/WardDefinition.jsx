import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Map, Plus, Users, Hash, Search, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Navigation ke liye

const WardDefinition = () => {
  const [wards, setWards] = useState([]);
  const navigate = useNavigate(); // Hook initialize kiya
  const tenantId = "SAK-SIW-6925"; 

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`);
      setWards(res.data.data);
    } catch (err) { console.error("Error fetching wards"); }
  };

  // --- Real Data Calculation Logic ---
  // 1. Total Households ka sum (Database se)
  const totalHHD = wards.reduce((sum, ward) => sum + (parseInt(ward.total_households) || 0), 0);
  
  // 2. Mapped Boundary (Jisme boundary_coords null nahi hai)
  const mappedCount = wards.filter(ward => ward.boundary_coords !== null && ward.boundary_coords !== "").length;

  return (
    <CityLayout>
      <div className="space-y-6 p-4">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">WARD DEFINITION</h1>
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mt-1">Manage Administrative Zones</p>
          </div>
          {/* Navigate to Add page */}
          <button 
            onClick={() => navigate('/admin/wards/add')} 
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all"
          >
            <Plus size={16}/> Add New Ward
          </button>
        </header>

        {/* Stats Row - Ab real data show karega */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard icon={<Hash/>} label="Total Wards" value={wards.length} color="bg-blue-500" />
           <StatCard icon={<Users/>} label="Total Households" value={totalHHD.toLocaleString()} color="bg-emerald-500" />
           <StatCard icon={<Map/>} label="Mapped Boundary" value={`${mappedCount} Wards`} color="bg-amber-500" />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mt-8">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="font-black text-slate-800 uppercase tracking-tighter">Registered Wards List</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input type="text" placeholder="Search Ward No..." className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none w-64" />
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50">
                   <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ward No</th>
                   <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ward Name</th>
                   <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">HHD Count</th>
                   <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                   <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {wards.length > 0 ? wards.map((ward) => (
                   <tr key={ward.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="p-6 font-black text-slate-800 text-lg">#{ward.ward_no}</td>
                     <td className="p-6 font-bold text-slate-600 uppercase">{ward.ward_name || 'N/A'}</td>
                     <td className="p-6 font-bold text-slate-600">{ward.total_households}</td>
                     <td className="p-6">
                        <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Active</span>
                     </td>
                     <td className="p-6 text-right">
                        <button className="text-slate-400 hover:text-slate-800"><MoreVertical size={18}/></button>
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan="5" className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No Wards Found. Click 'Add New Ward' to start.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </CityLayout>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-6">
     <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>{icon}</div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
     </div>
  </div>
);

export default WardDefinition;