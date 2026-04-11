import React, { useState } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { Trash2, Truck, Calendar, Clock, BarChart3, AlertTriangle, CheckCircle2, MapPin, Search } from 'lucide-react';

const GVPMap = () => {
  const [selectedYard, setSelectedYard] = useState(null);

  // Mock Database for Dumping Yards
  const dumpingYards = [
    { id: 1, name: "East Zone Main Yard", location: "Sector 5, Bypass", totalTrips: 24, capacity: "65%", status: "Active", manager: "Rajesh Sahni" },
    { id: 2, name: "West Disposal Point", location: "Industrial Area B", totalTrips: 18, capacity: "80%", status: "Near Full", manager: "Vikas Kumar" },
    { id: 3, name: "South Processing Unit", location: "Green Belt Road", totalTrips: 32, capacity: "40%", status: "Active", manager: "Manoj Singh" },
    { id: 4, name: "North GVP Collection", location: "Old City Gate", totalTrips: 0, capacity: "0%", status: "Closed", manager: "Sanjay Jha" },
  ];

  // Mock Data for Table (Vehicle Log)
  const todayLogs = [
    { id: 'V1', vehicleNo: "BR01-5542", driver: "Rahul Kumar", time: "09:15 AM", weight: "2.5 Tons", type: "Wet Waste" },
    { id: 'V2', vehicleNo: "BR01-9980", driver: "Sanjeev Sahni", time: "10:30 AM", weight: "1.8 Tons", type: "Dry Waste" },
    { id: 'V3', vehicleNo: "BR01-4421", driver: "Amit Singh", time: "11:45 AM", weight: "3.2 Tons", type: "Mixed" },
    { id: 'V4', vehicleNo: "BR01-7765", driver: "Sonu Yadav", time: "01:20 PM", weight: "2.1 Tons", type: "Wet Waste" },
  ];

  return (
    <CityLayout>
      <div className="space-y-6 p-4">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">CRITICAL GVP ZONES</h1>
            <p className="text-rose-600 font-bold text-xs uppercase tracking-widest mt-1">Dumping Yard & Disposal Management</p>
          </div>
          <div className="flex gap-2">
             <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-2xl flex items-center gap-2">
                <AlertTriangle size={16}/>
                <span className="text-xs font-black uppercase">05 Black Spots Detected</span>
             </div>
          </div>
        </header>

        {/* 4 CARD VIEW (DUMPING YARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dumpingYards.map((yard) => (
            <div 
              key={yard.id}
              onClick={() => setSelectedYard(yard)}
              className={`cursor-pointer p-6 rounded-[35px] border transition-all duration-300 transform hover:-translate-y-2 ${
                selectedYard?.id === yard.id 
                ? 'bg-slate-900 border-slate-900 shadow-2xl scale-105' 
                : 'bg-white border-slate-100 shadow-sm hover:shadow-xl'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${selectedYard?.id === yard.id ? 'bg-white/10 text-white' : 'bg-rose-50 text-rose-500'}`}>
                  <Trash2 size={24}/>
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${
                  yard.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>{yard.status}</span>
              </div>
              <h3 className={`font-black uppercase truncate ${selectedYard?.id === yard.id ? 'text-white' : 'text-slate-800'}`}>{yard.name}</h3>
              <p className={`text-[10px] font-bold mb-4 ${selectedYard?.id === yard.id ? 'text-slate-400' : 'text-slate-400'}`}>{yard.location}</p>
              
              <div className="flex justify-between items-end border-t border-slate-100/10 pt-4 mt-auto">
                 <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${selectedYard?.id === yard.id ? 'text-slate-500' : 'text-slate-400'}`}>Load Today</p>
                    <p className={`text-xl font-black ${selectedYard?.id === yard.id ? 'text-emerald-400' : 'text-slate-800'}`}>{yard.totalTrips} Trips</p>
                 </div>
                 <div className="text-right">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${selectedYard?.id === yard.id ? 'text-slate-500' : 'text-slate-400'}`}>Capacity</p>
                    <p className={`text-xs font-black ${selectedYard?.id === yard.id ? 'text-white' : 'text-slate-800'}`}>{yard.capacity}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* DETAILS TABLE SECTION (Visible only when a yard is selected) */}
        {selectedYard ? (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Table Header / Summary */}
            <div className="bg-slate-50 p-8 flex flex-col md:flex-row justify-between items-center border-b border-slate-100 gap-6">
               <div className="flex items-center gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm"><BarChart3 className="text-slate-800"/></div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase">{selectedYard.name} - Detailed Report</h2>
                    <p className="text-xs font-bold text-slate-400">Manager Incharge: <span className="text-slate-800 uppercase">{selectedYard.manager}</span></p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="text-center bg-white px-6 py-3 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase">Total Weight</p>
                     <p className="text-lg font-black text-slate-800">12.4 Tons</p>
                  </div>
                  <div className="text-center bg-white px-6 py-3 rounded-2xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase">Vehicles In</p>
                     <p className="text-lg font-black text-emerald-600">08 Today</p>
                  </div>
               </div>
            </div>

            {/* Live Table */}
            <div className="p-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Details</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver Name</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Time</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waste Category</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {todayLogs.map((log) => (
                    <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors"><Truck size={16}/></div>
                           <span className="font-black text-slate-800 uppercase">{log.vehicleNo}</span>
                        </div>
                      </td>
                      <td className="py-4 font-bold text-slate-600 text-sm uppercase">{log.driver}</td>
                      <td className="py-4">
                         <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                            <Clock size={12}/> {log.time}
                         </div>
                      </td>
                      <td className="py-4">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                           log.type === 'Wet Waste' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                         }`}>{log.type}</span>
                      </td>
                      <td className="py-4 text-right">
                         <span className="font-black text-slate-800">{log.weight}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 text-center">
               <button className="text-[10px] font-black text-slate-400 hover:text-slate-800 uppercase tracking-[0.3em] transition-all">Download Full Shift PDF Report</button>
            </div>
          </div>
        ) : (
          <div className="h-[400px] border-4 border-dashed border-slate-100 rounded-[45px] flex flex-col items-center justify-center text-slate-300">
             <Search size={48} className="mb-4 opacity-20"/>
             <p className="font-black text-xl uppercase tracking-widest opacity-20">Select a Dumping Yard to View Live Logs</p>
          </div>
        )}
      </div>
    </CityLayout>
  );
};

export default GVPMap;