import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio, ShieldCheck, Zap, Crosshair, Users, Map as MapIcon, ChevronRight, Activity } from 'lucide-react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- CUSTOM GIF ICONS LOGIC ---
const getWalkingIcon = (gender) => {
    return new L.Icon({
        iconUrl: gender === 'Male' ? '/assets/staff-walking.gif' : '/assets/staff--walkingf.gif',
        iconSize: [60, 60],
        iconAnchor: [30, 55],
        popupAnchor: [0, -45],
        className: 'staff-gif-marker'
    });
};

const StaffLiveTracking = () => {
    const [allStaff, setAllStaff] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedWard, setSelectedWard] = useState('All');
    const [selectedStaffId, setSelectedStaffId] = useState('All');
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // 5 सेकंड में लाइव सिंक
    useEffect(() => {
        fetchWards();
        fetchLiveStaff();
        const interval = setInterval(fetchLiveStaff, 5000); 
        return () => clearInterval(interval);
    }, [tenantId]);

    const fetchWards = async () => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`);
            setWards(res.data.data || []);
        } catch (err) { console.error("Ward Fetch Error"); }
    };

    const fetchLiveStaff = async () => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/live-staff-tracking/${tenantId}`);
            setAllStaff(res.data.data || []);
        } catch (err) { console.log("Tracking error"); }
    };

    // Filters Logic
    const currentWardData = wards.find(w => w.ward_no === selectedWard);
    const selectedStaffObj = allStaff.find(s => s.id.toString() === selectedStaffId);
    
    const filteredStaff = allStaff.filter(s => {
        const wardMatch = selectedWard === 'All' || s.ward_no === selectedWard;
        const staffMatch = selectedStaffId === 'All' || s.id.toString() === selectedStaffId;
        return wardMatch && staffMatch;
    });

    return (
        <CityLayout>
            <div className="flex flex-col h-[calc(100vh-40px)] p-4 space-y-4 bg-slate-50">
                
                {/* --- TOP CONTROL PANEL (HUD) --- */}
                <header className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl border-b-4 border-emerald-500 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 animate-pulse"></div>
                    
                    <div className="flex items-center gap-5 z-10">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                           <Radio className="animate-pulse" size={30} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                Personnel Tracking <span className="text-emerald-500 text-xs not-italic font-bold bg-emerald-500/10 px-2 py-1 rounded">LIVE</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" /> System Active: {tenantId}
                            </p>
                        </div>
                    </div>

                    {/* SELECTORS */}
                    <div className="flex gap-4 items-center bg-white/5 p-3 rounded-3xl border border-white/10 backdrop-blur-md z-10">
                        <div className="flex flex-col px-4 border-r border-white/10">
                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Sector View</span>
                           <select 
                            className="bg-transparent border-none text-sm font-black text-white outline-none cursor-pointer"
                            onChange={(e) => { setSelectedWard(e.target.value); setSelectedStaffId('All'); }}>
                                <option value="All" className="bg-slate-900">City Wide View</option>
                                {wards.map(w => <option key={w.id} value={w.ward_no} className="bg-slate-900">Ward No. {w.ward_no}</option>)}
                           </select>
                        </div>
                        
                        <div className="flex flex-col px-4">
                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Unit Focus</span>
                           <select 
                            className="bg-transparent border-none text-sm font-black text-white outline-none cursor-pointer min-w-[180px]"
                            value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)}>
                                <option value="All" className="bg-slate-900">All Deployed Units</option>
                                {allStaff.filter(s => selectedWard === 'All' || s.ward_no === selectedWard).map(s => (
                                    <option key={s.id} value={s.id} className="bg-slate-900">{s.name.toUpperCase()}</option>
                                ))}
                           </select>
                        </div>
                    </div>
                </header>

                {/* --- MAP INTERFACE --- */}
                <div className="flex-1 rounded-[3rem] overflow-hidden border-[8px] border-white shadow-2xl relative group">
                    <MapContainer center={[26.22, 84.36]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="Google Satellite" />

                        {/* WARD BOUNDARY LAYER */}
                        {currentWardData && currentWardData.boundary_coords && (
                            <Polygon 
                                positions={JSON.parse(currentWardData.boundary_coords).map(c => [c[1], c[0]])}
                                pathOptions={{ 
                                    color: '#10b981', 
                                    fillColor: '#10b981', 
                                    fillOpacity: 0.08, 
                                    weight: 3, 
                                    dashArray: '12, 12',
                                    className: 'animate-boundary'
                                }}
                            />
                        )}

                        {/* INDIVIDUAL STAFF WORKING GEOFENCE */}
                        {selectedStaffObj && selectedStaffObj.staff_geofence && (
                           <Polygon 
                             positions={JSON.parse(selectedStaffObj.staff_geofence).map(c => [c[1], c[0]])}
                             pathOptions={{ 
                                color: '#0ea5e9', 
                                fillColor: '#0ea5e9', 
                                fillOpacity: 0.25, 
                                weight: 4, 
                                lineJoin: 'round',
                                className: 'animate-geofence'
                            }}
                           />
                        )}

                        {/* STAFF MARKERS WITH GIFS */}
                        {filteredStaff.map(staff => (
                            <Marker key={staff.id} 
                                position={[staff.lat || 26.22, staff.lng || 84.36]} 
                                icon={getWalkingIcon(staff.gender)}
                            >
                                <Tooltip sticky direction="top" offset={[0, -40]} opacity={1} className="projection-tooltip-container">
                                   {/* --- HOLLYWOOD PROJECTION CARD --- */}
                                   <div className="cyber-projection">
                                      <div className="scanner-line"></div>
                                      <div className="card-top">
                                         <div className="pulse-icon"></div>
                                         <span className="serial-no">ID: {staff.employee_id}</span>
                                      </div>
                                      
                                      <div className="card-content">
                                         <h3 className="staff-name">{staff.name}</h3>
                                         <div className="grid-info">
                                            <div className="info-box"><span>Sector</span><p>Ward {staff.ward_no}</p></div>
                                            <div className="info-box"><span>Position</span><p>{staff.post || 'Field Staff'}</p></div>
                                            <div className="info-box"><span>Circle</span><p>{staff.circle_name || 'North'}</p></div>
                                            <div className="info-box"><span>Status</span><p className="text-emerald-400">On-Duty</p></div>
                                         </div>
                                         
                                         <div className="supervisor-tag">
                                            <ShieldCheck size={12} className="text-emerald-400"/>
                                            <span>In-Charge: {staff.inspector_name || 'Head Office'}</span>
                                         </div>
                                      </div>
                                      <div className="corner-tl"></div><div className="corner-br"></div>
                                   </div>
                                </Tooltip>
                            </Marker>
                        ))}

                        <MapFocusHandler staff={selectedStaffObj} ward={currentWardData} />
                    </MapContainer>
                </div>
            </div>

            <style>{`
                /* UI Reset */
                .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                
                /* Cyberpunk Projection Styling */
                .cyber-projection {
                    background: rgba(2, 6, 23, 0.85);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(16, 185, 129, 0.4);
                    border-radius: 24px;
                    padding: 20px;
                    min-width: 280px;
                    position: relative;
                    box-shadow: 0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(16,185,129,0.1);
                    color: white;
                    overflow: hidden;
                }

                .scanner-line {
                    position: absolute; top: 0; left: 0; width: 100%; h: 2px;
                    background: linear-gradient(to right, transparent, #10b981, transparent);
                    animation: scan 3s linear infinite;
                    opacity: 0.5;
                }

                .card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
                .pulse-icon { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 15px #10b981; animation: pulse-shadow 1.5s infinite; }
                .serial-no { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: #10b981; text-transform: uppercase; opacity: 0.8; }

                .staff-name {
                    font-size: 20px; font-weight: 900; text-transform: uppercase;
                    background: linear-gradient(to bottom, #fff, #94a3b8);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    margin-bottom: 15px; letter-spacing: -0.5px;
                }

                .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .info-box span { font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 1px; }
                .info-box p { font-size: 11px; font-weight: 800; color: #f8fafc; margin-top: 2px; }

                .supervisor-tag {
                    margin-top: 20px; padding: 10px; background: rgba(16, 185, 129, 0.05);
                    border-radius: 12px; border-left: 3px solid #10b981;
                    display: flex; align-items: center; gap: 10px; font-size: 10px; font-weight: 800; color: #10b981;
                    text-transform: uppercase;
                }

                /* Corner Accents */
                .corner-tl { position: absolute; top: 0; left: 0; width: 20px; height: 20px; border-top: 3px solid #10b981; border-left: 3px solid #10b981; border-radius: 20px 0 0 0; }
                .corner-br { position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; border-bottom: 3px solid #10b981; border-right: 3px solid #10b981; border-radius: 0 0 20px 0; }

                @keyframes scan { 0% { top: 0% } 100% { top: 100% } }
                @keyframes pulse-shadow { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7) } 70% { box-shadow: 0 0 0 10px rgba(16,185,129,0) } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0) } }
                
                .animate-boundary { stroke-dashoffset: 100; animation: dash 10s linear infinite; }
                @keyframes dash { to { stroke-dashoffset: 0; } }
            `}</style>
        </CityLayout>
    );
};

// --- MAP AUTO-FOCUS HANDLER ---
function MapFocusHandler({ staff, ward }) {
    const map = useMap();
    useEffect(() => {
        if (staff && staff.lat) {
            // स्टाफ पर फोकस
            map.flyTo([staff.lat, staff.lng], 18, { duration: 2, easeLinearity: 0.25 });
        } else if (ward && ward.boundary_coords) {
            // वार्ड बाउंड्री पर फोकस
            const coords = JSON.parse(ward.boundary_coords);
            const bounds = L.polygon(coords.map(c => [c[1], c[0]])).getBounds();
            map.flyToBounds(bounds, { padding: [100, 100], duration: 1.5 });
        }
    }, [staff, ward, map]);
    return null;
}

export default StaffLiveTracking;