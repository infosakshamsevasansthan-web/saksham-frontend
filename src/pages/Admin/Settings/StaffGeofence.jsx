import React, { useState, useEffect, useRef } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { MapContainer, TileLayer, Polygon, useMap, FeatureGroup, Tooltip } from 'react-leaflet';
import { Target, Users, Map as MapIcon, Save, RefreshCcw, MousePointer2, Info, CheckCircle2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const StaffGeofence = () => {
    const [wards, setWards] = useState([]);
    const [selectedWard, setSelectedWard] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [loading, setLoading] = useState(false);
    const mapRef = useRef(null);
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    useEffect(() => { fetchWards(); }, []);

    const fetchWards = async () => {
        const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`);
        setWards(res.data.data);
    };

    const handleWardChange = async (wardId) => {
        const ward = wards.find(w => w.id == wardId);
        setSelectedWard(ward);
        setSelectedStaffId(''); // Reset staff selection
        
        // Load Staff for this Ward
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/staff-by-ward/${wardId}`);
            setStaffList(res.data.data);
        } catch (err) { toast.error("Staff load failed"); }
    };

    // --- Drawing Controls Logic ---
    const DrawingTools = () => {
        const map = useMap();
        useEffect(() => {
            if (!map || !map.pm) return;
            mapRef.current = map;

            map.pm.addControls({
                position: 'topleft',
                drawMarker: false,
                drawPolygon: true,
                drawRectangle: true,
                editMode: true,
                removalMode: true,
            });

            // Set drawing style for Staff Area (Blue Color)
            map.pm.setPathOptions({ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.4 });

            // Auto Zoom to Ward Boundary
            if (selectedWard && selectedWard.boundary_coords) {
                const coords = JSON.parse(selectedWard.boundary_coords);
                const bounds = L.polygon(coords.map(c => [c[1], c[0]])).getBounds();
                map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
            }
        }, [map, selectedWard]);
        return null;
    };

    const handleSaveArea = async () => {
        if (!selectedStaffId) return toast.error("Pehle Staff select karein!");
        
        const map = mapRef.current;
        const drawnLayers = map.pm.getGeomanDrawLayers();
        
        if (drawnLayers.length === 0) return toast.error("Staff ka area draw karein!");

        const lastLayer = drawnLayers[drawnLayers.length - 1];
        const coords = JSON.stringify(lastLayer.toGeoJSON().geometry.coordinates[0]);

        setLoading(true);
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/geofence/save-staff-area', {
                tenant_id: tenantId,
                staff_id: selectedStaffId,
                ward_id: selectedWard.id,
                area_coords: coords
            });
            toast.success("Staff Work Area Mapped Successfully!");
            drawnLayers.forEach(l => map.removeLayer(l)); // Clear temp drawing
        } catch (err) { toast.error("Database save failed"); }
        finally { setLoading(false); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="h-[calc(100vh-80px)] flex flex-col gap-4 p-4 font-sans">
                
                {/* --- HEADER CONTROLS --- */}
                <header className="bg-white p-5 rounded-[30px] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                            <Target size={28}/>
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase italic leading-none">Geofence Inspector</h1>
                            <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest mt-1">Staff-to-Boundary Assignment</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end">
                        {/* Step 1: Select Ward */}
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">1. Select Ward</span>
                            <select onChange={(e) => handleWardChange(e.target.value)} className="bg-slate-50 border-none rounded-2xl px-6 py-3 font-bold text-slate-700 outline-none focus:ring-2 ring-emerald-500 min-w-[200px]">
                                <option value="">Choose Ward Context...</option>
                                {wards.map(w => <option key={w.id} value={w.id}>Ward #{w.ward_no} - {w.ward_name}</option>)}
                            </select>
                        </div>

                        {/* Step 2: Select Staff */}
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">2. Select Staff/Device</span>
                            <select 
                                disabled={!selectedWard}
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                                className="bg-slate-50 border-none rounded-2xl px-6 py-3 font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500 min-w-[220px] disabled:opacity-30"
                            >
                                <option value="">Select Mitra for Mapping...</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name_en} ({s.employee_id})</option>)}
                            </select>
                        </div>

                        <button 
                            onClick={handleSaveArea} disabled={loading || !selectedStaffId}
                            className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-30"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16}/> Save Geofence</>}
                        </button>
                    </div>
                </header>

                {/* --- MAP AREA --- */}
                <div className="flex-1 bg-white rounded-[50px] overflow-hidden border-8 border-white shadow-2xl relative">
                    <MapContainer center={[26.222, 84.36]} zoom={14} className="h-full w-full" zoomControl={false}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="Google" />
                        
                        <DrawingTools />

                        {/* Base Ward Boundary (Green - Reference Only) */}
                        {selectedWard && selectedWard.boundary_coords && (
                            <Polygon 
                                positions={JSON.parse(selectedWard.boundary_coords).map(c => [c[1], c[0]])}
                                pathOptions={{ color: 'white', fillColor: '#10b981', fillOpacity: 0.1, weight: 2, dashArray: '5, 10' }}
                            >
                                <Tooltip permanent direction="center" className="ward-label-float">
                                    Parent Ward: {selectedWard.ward_no}
                                </Tooltip>
                            </Polygon>
                        )}
                    </MapContainer>

                    {/* Floating Overlay Helper */}
                    <div className="absolute top-6 left-6 z-[1000] bg-white/80 backdrop-blur-md p-6 rounded-[35px] border border-white shadow-xl max-w-xs pointer-events-none">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-500 p-2 rounded-xl text-white shadow-lg"><Info size={18}/></div>
                            <h4 className="font-black text-slate-800 uppercase tracking-tighter">Instructions</h4>
                        </div>
                        <ul className="space-y-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                            <li className="flex gap-2"><span className="text-blue-600">●</span> Draw a Blue polygon inside the dotted Green Ward boundary.</li>
                            <li className="flex gap-2"><span className="text-emerald-600">●</span> This defines the staff's personal work zone.</li>
                            <li className="flex gap-2"><span className="text-slate-900">●</span> Save to sync with Mobile App.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .ward-label-float {
                    background: transparent !important; border: none !important; box-shadow: none !important;
                    color: white !important; font-weight: 900; text-shadow: 2px 2px 5px black; font-size: 16px;
                }
            `}</style>
        </CityLayout>
    );
};

export default StaffGeofence;