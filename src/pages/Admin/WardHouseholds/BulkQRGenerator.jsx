import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { QRCodeCanvas } from 'qrcode.react';
import { Loader2, ChevronLeft, ChevronRight, Play, MapPin, CheckSquare, Square } from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const BulkQRGenerator = () => {
  const [households, setHouseholds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewId, setPreviewId] = useState(null); 
  const [generatingId, setGeneratingId] = useState(null); 
  const [muniData, setMuniData] = useState({ name: "Loading...", logo: "" });
  const rowsPerPage = 5;

  const API_BASE = "https://saksham-backend-9719.onrender.com";
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const tenantId = storedUser.tenant || localStorage.getItem('tenantId');

  const fetchMuniProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/profile-details/${tenantId}`);
      if (res.data.success) {
        const d = res.data.data;
        setMuniData({
          name: d.muni_name || "Municipality",
          logo: d.muni_logo_url ? `${API_BASE}${d.muni_logo_url}` : "https://cdn-icons-png.flaticon.com/512/1150/1150643.png"
        });
      }
    } catch (err) { console.error("Profile fetch error"); }
  };

  const fetchHouseholds = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/households/${tenantId}`);
      const data = res.data.data || [];
      setHouseholds(data);
      if (data.length > 0) setPreviewId(data[0].hhd_id);
    } catch (err) { toast.error("Data fetch error"); }
  };

  useEffect(() => {
    if(tenantId) {
        fetchMuniProfile();
        fetchHouseholds();
    }
  }, [tenantId]);

  const totalPages = Math.ceil(households.length / rowsPerPage);
  const currentRows = households.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSelectAll = () => {
    if (selectedIds.length === households.length) setSelectedIds([]);
    else setSelectedIds(households.map(h => h.hhd_id));
  };

  // 🚀 Logic to Start Generation with Auto-Pagination
  const startGeneration = async () => {
    if (selectedIds.length === 0) return toast.error("Pehle households select karein!");
    setIsGenerating(true);
    const zip = new JSZip();
    const selectedData = households.filter(h => selectedIds.includes(h.hhd_id));
    const toastId = toast.loading(`Initializing ${selectedData.length} Cards...`);

    try {
      for (let i = 0; i < selectedData.length; i++) {
        const household = selectedData[i];
        
        // 1. AUTO-PAGINATION LOGIC
        const overallIndex = households.findIndex(h => h.hhd_id === household.hhd_id);
        const targetPage = Math.floor(overallIndex / rowsPerPage) + 1;
        if (currentPage !== targetPage) {
          setCurrentPage(targetPage);
        }

        // 2. State update for Highlight & Preview
        setGeneratingId(household.hhd_id);
        setPreviewId(household.hhd_id);
        
        toast.loading(`Capturing: ${household.hhd_id} (${i + 1}/${selectedData.length})`, { id: toastId });

        // ⏱️ Essential Wait: Time for Page change + DOM Re-render
        await new Promise(r => setTimeout(r, 800)); 

        const cardElement = document.getElementById(`qr-card-capture-area`);
        
        if (cardElement) {
          const canvas = await html2canvas(cardElement, { 
            scale: 3, // High Resolution for Printing
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            width: 300, 
            height: 460,
            logging: false
          });
          
          const imgData = canvas.toDataURL("image/png", 1.0).split(',')[1];
          zip.file(`ID_${household.hhd_id}.png`, imgData, { base64: true });
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `SAKSHAM_QR_CARDS_${tenantId}.zip`;
      link.click();
      toast.success("All Cards Downloaded! 🚀", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Process interrupted!", { id: toastId });
    } finally {
      setIsGenerating(false);
      setGeneratingId(null);
    }
  };

  const activeRowData = households.find(h => h.hhd_id === previewId);

  return (
    <CityLayout>
      <Toaster position="top-right" />
      <div className="p-4 space-y-6">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-4 text-left">
             <div className="w-14 h-14 bg-white rounded-xl p-1 border border-slate-100 flex items-center justify-center overflow-hidden">
                <img src={muniData.logo} className="w-full h-full object-contain" alt="Logo" crossOrigin="anonymous" />
             </div>
             <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">{muniData.name}</h1>
                <p className="text-emerald-600 font-bold text-[8px] uppercase tracking-[0.3em] mt-1">SWM Digital ID Generator</p>
             </div>
          </div>
          <div className="flex gap-3">
             <button onClick={handleSelectAll} disabled={isGenerating} className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-white transition-all shadow-sm">
                {selectedIds.length === households.length ? <CheckSquare size={16} className="text-emerald-600"/> : <Square size={16}/>}
                SELECT ALL ({selectedIds.length})
             </button>
             <button onClick={startGeneration} disabled={isGenerating || selectedIds.length === 0} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-30 active:scale-95">
                {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Play size={16}/>}
                {isGenerating ? 'GENERATE ZIP...' : 'DOWNLOAD SELECTED'}
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LIVE PREVIEW CARD (Animations Removed for Capture Stability) */}
          <div className="lg:col-span-4 flex flex-col items-center">
             <div className="sticky top-28 space-y-4">
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Output Preview</p>
                <div className="bg-slate-100 p-8 rounded-[55px] shadow-inner border-2 border-white overflow-hidden h-[540px] flex items-center justify-center relative">
                    <div id="qr-card-capture-area">
                        <IDCard data={activeRowData} muniName={muniData.name} logo={muniData.logo} />
                    </div>
                </div>
             </div>
          </div>

          {/* HOUSEHOLD TABLE WITH HIGHLIGHTING */}
          <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[620px]">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Records Found: {households.length}</span>
               <div className="flex items-center gap-3">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} / {totalPages}</div>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={isGenerating} className="p-2 bg-white rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-30"><ChevronLeft size={16}/></button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={isGenerating} className="p-2 bg-white rounded-lg border border-slate-100 hover:bg-slate-50 disabled:opacity-30"><ChevronRight size={16}/></button>
                  </div>
               </div>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="bg-white sticky top-0 z-10 border-b">
                  <tr className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-5 text-center">CHECK</th>
                    <th className="p-4">WARD / HOUSE</th>
                    <th className="p-4">RESIDENT</th>
                    <th className="p-4">HHD ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentRows.map((h) => {
                    const isGeneratingThis = generatingId === h.hhd_id;
                    const isSelected = selectedIds.includes(h.hhd_id);
                    
                    return (
                        <tr 
                            key={h.hhd_id} 
                            onClick={() => {
                                if(isGenerating) return;
                                setSelectedIds(prev => isSelected ? prev.filter(i => i !== h.hhd_id) : [...prev, h.hhd_id]);
                                setPreviewId(h.hhd_id); 
                            }} 
                            className={`transition-all duration-300 ${isGeneratingThis ? 'bg-emerald-600 text-white scale-[1.01] shadow-lg z-20 relative font-bold' : isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50/50'} cursor-pointer`}
                        >
                        <td className="p-5 text-center">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? (isGeneratingThis ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white') : 'border-slate-200'}`}>
                                {(isSelected || isGeneratingThis) && <CheckSquare size={12} />}
                            </div>
                        </td>
                        <td className="p-4">
                            <p className={`font-black text-xs ${isGeneratingThis ? 'text-white' : 'text-slate-800'}`}>W-{h.ward_no || h.ward_id || '--'}</p>
                            <p className={`text-[8px] font-bold uppercase ${isGeneratingThis ? 'text-emerald-100' : 'text-slate-400'}`}>{h.muni_house_no}</p>
                        </td>
                        <td className="p-4">
                            <p className={`font-black uppercase text-[11px] truncate max-w-[150px] ${isGeneratingThis ? 'text-white' : 'text-slate-800'}`}>{h.owner_name_en}</p>
                            <p className={`text-[8px] font-bold ${isGeneratingThis ? 'text-emerald-100' : 'text-slate-400'}`}>{h.mobile}</p>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-md text-[9px] font-black ${isGeneratingThis ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{h.hhd_id}</span>
                                {isGeneratingThis && <Loader2 size={12} className="animate-spin" />}
                            </div>
                        </td>
                        </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </CityLayout>
  );
};

// --- 🟢 ID CARD COMPONENT (Design Exactly as Requested) ---
const IDCard = ({ data, muniName, logo }) => (
  <div 
    style={{ 
        width: '300px', height: '460px', backgroundColor: '#ffffff', borderRadius: '40px', 
        overflow: 'hidden', display: 'flex', flexDirection: 'column', 
        border: '4px solid #10b981', position: 'relative'
    }}
  >
    {/* Dynamic Header */}
    <div style={{ height: '128px', background: 'linear-gradient(to bottom right, #059669, #34d399)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '4px', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
            <img src={logo} alt="L" style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
        </div>
        <div style={{ textAlign: 'center', padding: '0 12px' }}>
            <h2 style={{ color: '#ffffff', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px', lineHeight: '1.2' }}>{muniName}</h2>
            <p style={{ color: '#ffffff', fontWeight: '800', fontSize: '7.5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Solid Waste Management</p>
        </div>
    </div>

    {/* QR Area */}
    <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '28px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', marginTop: '-35px', zIndex: '10', alignSelf: 'center', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}>
      <QRCodeCanvas 
        value={data?.hhd_id || 'SAK-VOID'} 
        size={145}
        level="H"
        fgColor="#064e3b"
      />
    </div>

    {/* Content Area */}
    <div style={{ flex: '1', padding: '15px 25px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
          <div>
             <p style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>House No</p>
             <p style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b' }}>{data?.muni_house_no}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <p style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' }}>Ward No</p>
             <p style={{ fontSize: '11px', fontWeight: '900', color: '#059669' }}>{data?.ward_no || data?.ward_id || '--'}</p>
          </div>
       </div>

       <div>
          <p style={{ fontSize: '7px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Primary Resident</p>
          <p style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', lineHeight: '1.1', height: '34px', overflow: 'hidden' }}>
             {data?.owner_name_en}
          </p>
       </div>

       <div style={{ marginTop: 'auto' }}>
          <p style={{ color: '#059669', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
            <MapPin size={8} style={{ display: 'inline' }}/> ID: {data?.hhd_id}
          </p>
          <p style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', lineHeight: '1.2', height: '24px', overflow: 'hidden' }}>
            {data?.full_address_en}
          </p>
       </div>
    </div>

    <div style={{ backgroundColor: '#f8fafc', padding: '10px 0', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
       <p style={{ fontSize: '7px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Smart City Digitization • Saksham</p>
    </div>
  </div>
);
 
export default BulkQRGenerator;
