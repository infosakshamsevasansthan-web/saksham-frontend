import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Plus, ChevronRight, Filter, Navigation } from 'lucide-react';
import axios from 'axios';

const RoadHierarchy = () => {
  const navigate = useNavigate();
  const [roads, setRoads] = useState([]);
  const tenantId = "SAK-SIW-6925";

  useEffect(() => {
    fetchRoads();
  }, []);

  const fetchRoads = async () => {
    const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roads/${tenantId}`);
    setRoads(res.data.data);
  };

  // Summary Stats Logic
  const getCount = (type) => roads.filter(r => r.road_type === type).length;

  return (
    <CityLayout>
      <div className="space-y-6 p-4">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Road Hierarchy</h1>
            <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mt-1">Street Level Mapping & Classification</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-50">
                <Filter size={16}/> Filter Ward
             </button>
             <button 
               onClick={() => navigate('/admin/roads/add')}
               className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg"
             >
                <Plus size={16}/> Add New Road
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
           <div className="space-y-4">
              <RoadCategoryCard label="Principal Main Road" count={getCount('Principal Main Road')} color="border-rose-500" />
              <RoadCategoryCard label="Main Road" count={getCount('Main Road')} color="border-amber-500" />
              <RoadCategoryCard label="Street Road" count={getCount('Street Road')} color="border-emerald-500" />
              <RoadCategoryCard label="Other Road" count={getCount('Other Road')} color="border-slate-300" />
           </div>

           <div className="lg:col-span-3 bg-white rounded-[45px] border border-slate-100 shadow-sm p-8 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                      <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="pb-6">Road Name (English/Hindi)</th>
                        <th className="pb-6">Ward Details</th>
                        <th className="pb-6">Classification</th>
                        <th className="pb-6 text-right">Length (KM)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {roads.map((road) => (
                        <tr key={road.id} className="hover:bg-slate-50/50 transition-all group">
                          <td className="py-5">
                              <p className="font-black text-slate-800 uppercase text-sm tracking-tight">{road.road_name_en}</p>
                              <p className="text-[11px] font-bold text-slate-400 mt-0.5">{road.road_name_hi}</p>
                          </td>
                          <td className="py-5">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md">#{road.ward_no || 'NA'}</span>
                                <p className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">Ends @ {road.road_end_point || 'Not specified'}</p>
                              </div>
                          </td>
                          <td className="py-5">
                              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                                road.road_type === 'Principal Main Road' ? 'bg-rose-50 text-rose-600' :
                                road.road_type === 'Main Road' ? 'bg-amber-50 text-amber-600' :
                                'bg-emerald-50 text-emerald-600'
                              }`}>
                                {road.road_type}
                              </span>
                          </td>
                          <td className="py-5 text-right font-black text-slate-800 tabular-nums">
                              {road.road_length_km} km
                          </td>
                        </tr>
                      ))}
                      {roads.length === 0 && (
                        <tr><td colSpan="4" className="py-20 text-center font-bold text-slate-300 uppercase text-xs tracking-[0.3em]">No roads registered yet</td></tr>
                      )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </CityLayout>
  );
};

const RoadCategoryCard = ({ label, count, color }) => (
  <div className={`bg-white p-6 rounded-[32px] border-l-[10px] ${color} shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer h-28`}>
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
     <div className="flex justify-between items-end">
        <h4 className="text-3xl font-black text-slate-800 leading-none tabular-nums">{count}</h4>
        <div className="bg-slate-50 p-2 rounded-xl text-slate-300"><ChevronRight size={16}/></div>
     </div>
  </div>
);

export default RoadHierarchy;