import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Navigation ke liye import
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
  Home, Search, Plus, FileSpreadsheet, FileText, Download, 
  ChevronLeft, ChevronRight, UserPlus, Trash2, Edit3, MoreHorizontal,
  CloudDownload, MapPin, Phone
} from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HouseholdRegistry = () => {
  const navigate = useNavigate(); // 2. Navigation initialize kiya
  
  // State Management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const tenantId = "SAK-SIW-6925"; // Aapka Tenant ID

  // Data Fetching Logic
  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Backend API call with pagination and search
      const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/households/${tenantId}?page=${page}&search=${search}`);
      setData(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) { 
      console.error("Data fetch error:", err); 
    }
    setLoading(false);
  };

  // --- FEATURE 1: DOWNLOAD EXCEL TEMPLATE ---
  const downloadTemplate = () => {
    const templateData = [{
        "Muni_House_No": "123/A",
        "Ward_ID": "Enter Ward ID",
        "Road_ID": "Enter Road ID",
        "Mobile": "9876543210",
        "Owner_Name_En": "Full Name",
        "Guardian_Name_En": "Father/Husband Name",
        "Full_Address_En": "Complete Address"
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Saksham_HHD_Template.xlsx");
  };

  // --- FEATURE 2: EXPORT TO EXCEL ---
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Households");
    XLSX.writeFile(wb, `Households_Report.xlsx`);
  };

  // --- FEATURE 3: EXPORT TO PDF ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Household Registry Report", 14, 15);
    const tableColumn = ["HHD ID", "Owner Name", "Ward", "Mobile", "Status"];
    const tableRows = data.map(h => [h.hhd_id, h.owner_name_en, h.ward_id, h.mobile, h.status]);
    doc.autoTable(tableColumn, tableRows, { startY: 25 });
    doc.save(`Households_Report.pdf`);
  };

  return (
    <CityLayout>
      <div className="space-y-6 p-4">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Household Registry</h1>
            <p className="text-emerald-600 font-bold text-xs tracking-widest uppercase mt-1">Property Database & Tax Records</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={downloadTemplate}
              className="bg-amber-50 text-amber-600 border border-amber-200 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-100 transition-all"
            >
               <CloudDownload size={16}/> Template
            </button>

            <button 
              onClick={() => navigate('/admin/households/add')} 
              className="bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-emerald-200"
            >
                <UserPlus size={16}/> Add Manual
            </button>

            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
               <FileSpreadsheet size={16}/> Bulk Upload
            </button>

            <div className="h-10 w-[1px] bg-slate-200 mx-2 self-center hidden md:block" />
            
            <button onClick={exportToExcel} className="bg-blue-50 text-blue-600 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
               <Download size={16}/> Excel
            </button>
            <button onClick={exportToPDF} className="bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
               <FileText size={16}/> PDF
            </button>
          </div>
        </header>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-[30px] shadow-sm border border-slate-100 flex gap-4 items-center">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
              <input 
                type="text" 
                placeholder="Search by HHD ID, Owner Name or Mobile..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-600"
                onChange={(e) => {setSearch(e.target.value); setPage(1);}}
              />
           </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="p-6">HHD Details</th>
                    <th className="p-6">Owner Information</th>
                    <th className="p-6">Location</th>
                    <th className="p-6">Contact</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loading ? (
                    <tr><td colSpan="6" className="p-20 text-center font-black text-slate-300 animate-pulse uppercase">Loading Records...</td></tr>
                 ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="bg-slate-100 p-3 rounded-2xl text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Home size={18}/></div>
                               <div>
                                  <p className="font-black text-slate-800 text-sm tracking-tighter uppercase">{item.hhd_id}</p>
                                  <p className="text-[10px] font-bold text-slate-400">House: {item.muni_house_no || 'N/A'}</p>
                               </div>
                            </div>
                         </td>
                         <td className="p-6">
                            <p className="font-black text-slate-700 uppercase text-xs">{item.owner_name_en}</p>
                            <p className="text-[10px] font-bold text-slate-400">Guardian: {item.guardian_name_en}</p>
                         </td>
                         <td className="p-6">
                            <p className="font-bold text-slate-600 text-xs flex items-center gap-1"><MapPin size={10}/> Ward {item.ward_id}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate w-32">{item.full_address_en}</p>
                         </td>
                         <td className="p-6 font-black text-blue-600 text-xs tracking-widest flex items-center gap-1"><Phone size={12}/> {item.mobile}</td>
                         <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                               {item.status}
                            </span>
                         </td>
                         <td className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                               <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Edit3 size={16}/></button>
                               <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                            </div>
                         </td>
                      </tr>
                    ))
                 ) : (
                    <tr><td colSpan="6" className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">No Records Found</td></tr>
                 )}
              </tbody>
           </table>

           {/* PAGINATION PANEL */}
           <div className="p-6 bg-slate-50 flex flex-col md:flex-row justify-between items-center border-t border-slate-100 gap-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing Page <span className="text-slate-800">{page}</span> of {totalPages}</p>
              <div className="flex gap-2">
                 <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                 >
                    <ChevronLeft size={18}/>
                 </button>
                 
                 {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${page === i+1 ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500'}`}
                    >
                      {i + 1}
                    </button>
                 ))}

                 <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                 >
                    <ChevronRight size={18}/>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </CityLayout>
  );
};

export default HouseholdRegistry;