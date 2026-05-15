import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Briefcase, MapPin, Users, Search, X, CheckCircle2, 
    Loader2, Layers, Navigation, Settings2, Save, MousePointer2, 
    Map as MapIcon, Globe 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// 🟢 Map Components
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
// Geoman Imports
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

// 🟢 Geoman Toolbar Setup Component
const GeomanTools = ({ onShapeCreated }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        map.pm.addControls({
            position: 'topright',
            drawMarker: true,
            drawPolyline: false,
            drawRectangle: true,
            drawPolygon: true,
            drawCircle: false,
            editMode: true,
            removalMode: true,
        });

        map.on('pm:create', (e) => {
            const { layer } = e;
            const coords = layer.getLatLngs();
            onShapeCreated(JSON.stringify(coords));
            
            layer.on('pm:edit', () => {
                const newCoords = layer.getLatLngs();
                onShapeCreated(JSON.stringify(newCoords));
            });
        });

        return () => {
            map.pm.removeControls();
            map.off('pm:create');
        };
    }, [map]);
    return null;
};

// 🟢 Map Zoom Logic Component
const ChangeView = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            try {
                map.fitBounds(bounds);
            } catch (e) { console.error("Map Bounds Error", e); }
        }
    }, [bounds, map]);
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
    
    // Form States
    const [selectedCircleId, setSelectedCircleId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [selectedRoadId, setSelectedRoadId] = useState('');
    const [drawnCoords, setDrawnCoords] = useState(null);
    const [saving, setSaving] = useState(false);
    
    const tenantId = localStorage.getItem('tenantId');

    // 🟢 1. Fetch Basic Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, circleRes, wardRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/work-assignment/list/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`)
            ]);
            setStaffList(staffRes.data.data || []);
            setCircles(circleRes.data.data || []);
            setAllWards(wardRes.data.data || []);
        } catch (err) { toast.error("Database Connection Failed"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    // 🟢 2. Fetch Roads when Ward changes
    useEffect(() => {
        if (selectedWardId) {
            axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roads-by-ward/${tenantId}/${selectedWardId}`)
                .then(res => setRoads(res.data.data || []))
                .catch(() => setRoads([]));
        } else {
            setRoads([]);
        }
    }, [selectedWardId]);

    // 🟢 3. Filter Wards logic (Fixed Comparison)
    const filteredWards = allWards.filter(w => String(w.circle_id) === String(selectedCircleId));
    const currentWardData = allWards.find(w => String(w.id) === String(selectedWardId));

    // 🟢 4. Handle Circle Change (Reset Ward)
    const handleCircleChange = (e) => {
        setSelectedCircleId(e.target.value);
        setSelectedWardId(''); // Reset ward selection
        setSelectedRoadId('');
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if(!selectedWardId) return toast.error("Please select a Ward!");
        if(!drawnCoords) return toast.error("Please DRAW work area on the map!");

        setSaving(true);
        try {
            const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/work-assignment/save', {
                tenant_id: tenantId,
                staff_id: selectedStaff.id,
                circle_id: selectedCircleId,
                ward_id: selectedWardId,
                road_id: selectedRoadId,
                area_coords: drawnCoords
            });
            if(res.data.success) {
                toast.success("Duty Allocation Finalized! 🚀");
                setShowModal(false);
                fetchData();
            }
        } catch (err) { toast.error("Failed to save assignment"); }
        finally { setSaving(false); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                
                <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 shadow-lg">
                            <Navigation size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">Duty Allocation</h1>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-2">Circle & Ward Wise Smart Mapping</p>
                        </div>
                    </div>
                </header>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                    <input 
                        type="text" 
                        placeholder="Search personnel to assign duty..." 
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 shadow-sm"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40}/></div>
                    ) : staffList.filter(s => s.full_name_en.toLowerCase().includes(searchTerm.toLowerCase())).map((s) => (
                        <div key={s.id} className="bg-white p-6 rounded-[35px] border border-slate-200 shadow-sm relative group overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-black">{s.full_name_en.charAt(0)}</div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-sm uppercase leading-none">{s.full_name_en}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.role_name || 'Staff'}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setSelectedStaff(s); setShowModal(true); }} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95"><Settings2 size={18}/></button>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Live Location Status:</p>
                                <p className="text-[10px] font-bold text-slate-700 uppercase">
                                    {s.current_task ? `Assigned Ward: ${s.current_task.split(':')[1]}` : "Unassigned - On Waiting"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- GIS ALLOCATION MODAL --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-7xl h-[90vh] rounded-[50px] shadow-2xl overflow-hidden flex flex-col border border-white/20">
                            
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-100 bg-white flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><Globe size={24} /></div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 uppercase italic">Setup Duty Point</h2>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Staff Member: {selectedStaff?.full_name_en}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"><X size={24} /></button>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* LEFT PANEL: FORM CONTROLS */}
                                <div className="w-1/3 p-8 space-y-6 overflow-y-auto bg-[#fbfcfd] border-r border-slate-100">
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><Layers size={14}/> 1. Select Circle (अंचल चुनें)</label>
                                        <select className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-bold text-sm text-slate-700 shadow-sm" value={selectedCircleId} onChange={handleCircleChange}>
                                            <option value="">Choose Circle / Zone...</option>
                                            {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><MapPin size={14}/> 2. Select Ward (वार्ड चुनें)</label>
                                        <select disabled={!selectedCircleId} className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-bold text-sm disabled:opacity-40 shadow-sm" value={selectedWardId} onChange={(e) => setSelectedWardId(e.target.value)}>
                                            <option value="">Choose Targeted Ward...</option>
                                            {filteredWards.map(w => <option key={w.id} value={w.id}>Ward No: {w.ward_no} - {w.ward_name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2"><Navigation size={14}/> 3. Select Road (सड़क/गली चुनें)</label>
                                        <select disabled={!selectedWardId} className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-bold text-sm disabled:opacity-40 shadow-sm" value={selectedRoadId} onChange={(e) => setSelectedRoadId(e.target.value)}>
                                            <option value="">Choose Exact Working Road...</option>
                                            {roads.map(r => <option key={r.id} value={r.id}>{r.road_name_en}</option>)}
                                        </select>
                                    </div>

                                    <div className="p-6 bg-emerald-50 rounded-[30px] border border-emerald-100">
                                        <div className="flex items-center gap-3 text-emerald-700 mb-2">
                                            <MousePointer2 size={18}/>
                                            <p className="text-[10px] font-black uppercase">Instruction:</p>
                                        </div>
                                        <p className="text-[10px] font-medium text-emerald-600 leading-relaxed uppercase">Ward select karne ke baad map focus ho jayega. Use Drawing Toolbar (Top-Right) to mark the area.</p>
                                    </div>

                                    <button onClick={handleAssignSubmit} disabled={saving} className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3 mt-4">
                                        {saving ? <Loader2 className="animate-spin"/> : <CheckCircle2 size={18}/>} Finalize Allocation
                                    </button>
                                </div>

                                {/* RIGHT PANEL: INTERACTIVE MAP */}
                                <div className="flex-1 relative">
                                    <MapContainer center={[25.5941, 85.1376]} zoom={13} style={{ height: "100%", width: "100%" }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        
                                        {/* Ward Boundary Visualization */}
                                        {currentWardData?.boundary_coords && (
                                            <>
                                                <Polygon 
                                                    positions={JSON.parse(currentWardData.boundary_coords)} 
                                                    pathOptions={{ color: '#10b981', weight: 3, fillOpacity: 0.15, dashArray: '5, 10' }} 
                                                />
                                                <ChangeView bounds={JSON.parse(currentWardData.boundary_coords)} />
                                            </>
                                        )}

                                        <GeomanTools onShapeCreated={setDrawnCoords} />
                                    </MapContainer>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </CityLayout>
    );
};

export default WorkAssignment;
