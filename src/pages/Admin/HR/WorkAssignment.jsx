import React, { useState, useEffect, useRef } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { MapContainer, TileLayer, Polygon, useMap, Tooltip } from 'react-leaflet';
import { 
    Briefcase, Search, X, CheckCircle2, Loader2, Layers, 
    Navigation, Settings2, Save, Globe, Eye, EyeOff, Target, MousePointer2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import * as L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

// 🟢 logic: Dropdown select karte hi Map Flying Animation
const MagicFlyZoom = ({ selectedId, wards }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedId && wards.length > 0) {
      const ward = wards.find(w => String(w.id) === String(selectedId));
      if (ward && ward.boundary_coords) {
        try {
          const raw = JSON.parse(ward.boundary_coords);
          const latLngs = raw.map(c => [c[1], c[0]]); // Swap Lng/Lat
          const bounds = L.latLngBounds(latLngs);
          if (bounds.isValid()) {
            map.flyToBounds(bounds, { padding: [100, 100], duration: 1.8 });
          }
        } catch (e) { console.error("Map fly failed", e); }
      }
    }
  }, [selectedId, wards, map]);
  return null;
};

// 🟢 logic: Drawing Toolbar
const GeomanToolbar = ({ onCreated }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.pm.addControls({ 
        position: 'topright', 
        drawMarker: true, 
        drawPolygon: true, 
        drawRectangle: true,
        editMode: true, 
        removalMode: true 
    });
    map.on('pm:create', (e) => onCreated(JSON.stringify(e.layer.getLatLngs())));
    return () => { map.pm.removeControls(); map.off('pm:create'); };
  }, [map]);
  return null;
};

const WorkAssignment = () => {
    const [staffList, setStaffList] = useState([]);
    const [circles, setCircles] = useState([]);
    const [allWards, setAllWards] = useState([]);
    const [roads, setRoads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBoundaries, setShowBoundaries] = useState(true);
    
    // Assignment Form IDs
    const [selectedCircleId, setSelectedCircleId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [selectedRoadId, setSelectedRoadId] = useState('');
    const [drawnArea, setDrawnArea] = useState(null);
    const [saving, setSaving] = useState(false);
    
    const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925";

    const fetchMasterData = async () => {
        setLoading(true);
        try {
            const [s, c, w] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/work-assignment/list/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`)
            ]);
            setStaffList(s.data.data || []);
            setCircles(c.data.data || []);
            setAllWards(w.data.data || []);
        } catch (err) { toast.error("GIS Server Sync Failed!"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMasterData(); }, []);

    // 🟢 Step 2: Fetch Roads when Ward changes (Dependent Dropdown 2)
    useEffect(() => {
        if (selectedWardId) {
            axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roads-by-ward/${tenantId}/${selectedWardId}`)
                .then(res => setRoads(res.data.data || []))
                .catch(() => setRoads([]));
        }
    }, [selectedWardId]);

    // 🟢 Step 1: Filter Wards based on Circle (Dependent Dropdown 1)
    const wardsOfCircle = allWards.filter(w => String(w.circle_id) === String(selectedCircleId));

    const handleAssignment = async (e) => {
        e.preventDefault();
        if(!selectedWardId) return toast.error("Please select a ward");
        if(!drawnArea) return toast.error("Draw work area on map first!");

        setSaving(true);
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/work-assignment/save', {
                tenant_id: tenantId,
                staff_id: selectedStaff.id,
                circle_id: selectedCircleId,
                ward_id: selectedWardId,
                road_id: selectedRoadId,
                area_coords: drawnArea
            });
            if(res.data.success) {
                toast.success("Duty Mapping Established! 🚀");
                setShowModal(false); fetchMasterData();
            }
        } catch (err) { toast.error("Error saving duty area"); }
        finally { setSaving(false); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                
                {/* Clean Header */}
                <header className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="bg-slate-900 p-3 rounded-2xl text-emerald-400 shadow-lg shadow-emerald-500/20"><Navigation size={24}/></div>
                      <div>
                         <h1 className="text-xl font-black text-slate-800 uppercase italic">Duty Allocation</h1>
                         <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em]">Operational Node: {tenantId}</p>
                      </div>
                   </div>
                   <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                      <input type="text" placeholder="Search staff..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 ring-emerald-500/20" onChange={(e) => setSearchTerm(e.target.value)} />
                   </div>
                </header>

                {/* Staff Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></div> : 
                        staffList.filter(s => s.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())).map((s) => (
                        <div key={s.id} className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full ${s.current_task ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`} />
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black text-sm uppercase shadow-inner">{s.full_name_en[0]}</div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-sm uppercase leading-none">{s.full_name_en}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{s.role_name}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setSelectedStaff(s); setShowModal(true); }} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-emerald-600 shadow-xl transition-all active:scale-90"><Settings2 size={18}/></button>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Assigned Mapping:</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${s.current_task ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <p className="text-[10px] font-black text-slate-700 uppercase italic">
                                        {s.current_task ? `Ward No: ${s.current_task.split(':')[1]}` : "Wait List / Pool"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- PLATINUM GIS ALLOCATION MODAL --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-7xl h-[90vh] rounded-[50px] shadow-2xl overflow-hidden flex flex-col">
                            
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse"><Globe size={28} /></div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 uppercase italic">Duty Area Precision</h2>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Allocating for: {selectedStaff?.full_name_en}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowBoundaries(!showBoundaries)} className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 transition-all ${showBoundaries ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                        {showBoundaries ? <Eye size={18}/> : <EyeOff size={18}/>} Boundries
                                    </button>
                                    <button onClick={() => setShowModal(false)} className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"><X size={28} /></button>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* LEFT CONTROL PANEL */}
                                <div className="w-1/3 p-10 space-y-8 overflow-y-auto bg-[#f8fafc] border-r border-slate-100">
                                    
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2 tracking-widest"><Layers size={14}/> 1. Select Circle</label>
                                        <select className="w-full p-5 bg-white rounded-2xl border border-slate-200 font-bold text-sm shadow-sm outline-none focus:ring-2 ring-emerald-500/20" value={selectedCircleId} onChange={(e) => { setSelectedCircleId(e.target.value); setSelectedWardId(''); setSelectedRoadId(''); }}>
                                            <option value="">Choose Circle...</option>
                                            {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2 tracking-widest"><Target size={14}/> 2. Select Ward</label>
                                        <select disabled={!selectedCircleId} className="w-full p-5 bg-white rounded-2xl border border-slate-200 font-bold text-sm shadow-sm disabled:opacity-40" value={selectedWardId} onChange={(e) => { setSelectedWardId(e.target.value); setSelectedRoadId(''); }}>
                                            <option value="">Choose Ward...</option>
                                            {wardsOfCircle.map(w => <option key={w.id} value={w.id}>Ward No: {w.ward_no} ({w.ward_name})</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2 tracking-widest"><Navigation size={14}/> 3. Road / Locality</label>
                                        <select disabled={!selectedWardId} className="w-full p-5 bg-white rounded-2xl border border-slate-200 font-bold text-sm shadow-sm disabled:opacity-40" value={selectedRoadId} onChange={(e) => setSelectedRoadId(e.target.value)}>
                                            <option value="">Choose Working Road...</option>
                                            {roads.map(r => <option key={r.id} value={r.id}>{r.road_name_en}</option>)}
                                        </select>
                                    </div>

                                    <div className="p-6 bg-blue-50/50 rounded-[35px] border border-blue-100 flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg"><MousePointer2 size={20}/></div>
                                        <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase">Ward select karne ke baad map focus ho jayega. Toolbar se area draw karein.</p>
                                    </div>

                                    <button onClick={handleAssignment} disabled={saving} className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 shadow-2xl flex items-center justify-center gap-4 mt-4 transition-all">
                                        {saving ? <Loader2 className="animate-spin"/> : <CheckCircle2 size={20}/>} Finalize Allocation
                                    </button>
                                </div>

                                {/* RIGHT INTERACTIVE MAP */}
                                <div className="flex-1 relative bg-slate-200">
                                    <MapContainer center={[26.22, 84.36]} zoom={14} style={{ height: "100%", width: "100%" }}>
                                        {/* 🟢 Satellite Layer like the screenshot */}
                                        <TileLayer url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} attribution="Google Hybrid" />
                                        
                                        <MagicFlyZoom selectedId={selectedWardId} wards={allWards} />
                                        <GeomanToolbar onCreated={setDrawnArea} />
                                        
                                        {/* 🟢 Rendering Existing Wards GIS Data */}
                                        {showBoundaries && allWards.map(ward => {
                                            if(!ward.boundary_coords) return null;
                                            try {
                                                const isCurrent = String(ward.id) === String(selectedWardId);
                                                const positions = JSON.parse(ward.boundary_coords).map(c => [c[1], c[0]]);
                                                return (
                                                    <Polygon key={ward.id} positions={positions} 
                                                        pathOptions={{ 
                                                            color: isCurrent ? '#facc15' : 'white', 
                                                            fillColor: isCurrent ? '#facc15' : '#10b981', 
                                                            fillOpacity: isCurrent ? 0.6 : 0.15, 
                                                            weight: isCurrent ? 5 : 2,
                                                            dashArray: isCurrent ? '10, 15' : '0',
                                                            className: isCurrent ? 'pulse-effect' : ''
                                                        }}
                                                    >
                                                        <Tooltip sticky direction="center" className="gis-tooltip">Ward {ward.ward_no}</Tooltip>
                                                    </Polygon>
                                                );
                                            } catch (e) { return null; }
                                        })}
                                    </MapContainer>

                                    {/* GIS Progress Widget from screenshot */}
                                    <div className="absolute bottom-10 left-10 z-[1000] bg-white/90 backdrop-blur-md p-6 rounded-[35px] border border-white shadow-2xl min-w-[280px]">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><Target size={22}/></div>
                                            <span className="text-[12px] font-black uppercase text-slate-800 italic">Live Mapping Status</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(allWards.filter(w => w.boundary_coords).length / (allWards.length || 1)) * 100}%` }} className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 mt-3 uppercase">MAPPED: {allWards.filter(w => w.boundary_coords).length} / {allWards.length} WARDS</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .gis-tooltip { background: rgba(0,0,0,0.8) !important; color: gold !important; font-weight: 900 !important; border: 1px solid gold !important; border-radius: 8px !important; font-size: 11px !important; }
                .pulse-effect { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { stroke-opacity: 1; fill-opacity: 0.6; } 50% { stroke-opacity: 0.4; fill-opacity: 0.4; } 100% { stroke-opacity: 1; fill-opacity: 0.6; } }
            `}</style>
        </CityLayout>
    );
};

export default WorkAssignment;
