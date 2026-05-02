import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio, ShieldCheck, Activity, Phone, User, Fingerprint } from 'lucide-react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import axios from 'axios';

// --- 1. GENDER BASED GIF ICONS ---
const getWalkingIcon = (gender) => {
    const g = gender ? gender.toLowerCase() : 'male';
    const iconUrl = g === 'female' 
        ? '/assets/staff--walkingf.gif' 
        : '/assets/staff-walking.gif';

    return new L.Icon({
        iconUrl: iconUrl,
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

    const currentWardData = wards.find(w => w.ward_no === selectedWard);
    const selectedStaffObj = allStaff.find(s => s.id.toString() === selectedStaffId);
    
    const filteredStaff = allStaff.filter(s => {
        const wardMatch = selectedWard === 'All' || s.ward_no === selectedWard;
        const staffMatch = selectedStaffId === 'All' || s.id.toString() === selectedStaffId;
        return wardMatch && staffMatch;
    });

    return (
        <CityLayout>
            <div className="flex flex-col h-[calc(100vh-40px)] p-4 space-y-4 bg-slate-950">
                
                {/* HUD Header */}
                <header className="bg-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] border-b-2 border-emerald-500/50 flex flex-wrap items-center justify-between gap-6 relative shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-inner">
                           <Radio className="animate-pulse" size={30} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Live Unit Tracker</h2>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                               <Activity size={10} /> Operation: Active
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center bg-black/40 p-3 rounded-2xl border border-white/10">
                        <select className="bg-transparent text-sm font-black text-white outline-none" onChange={(e) => { setSelectedWard(e.target.value); setSelectedStaffId('All'); }}>
                            <option value="All">Global View</option>
                            {wards.map(w => <option key={w.id} value={w.ward_no}>Ward {w.ward_no}</option>)}
                        </select>
                        <select className="bg-transparent text-sm font-black text-white outline-none" value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)}>
                            <option value="All">All Active Units</option>
                            {allStaff.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                        </select>
                    </div>
                </header>

                {/* Map Section */}
                <div className="flex-1 rounded-[3rem] overflow-hidden border-[6px] border-slate-900 shadow-2xl relative">
                    <MapContainer center={[26.22, 84.36]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

                        {filteredStaff.map(staff => (
                            <Marker key={staff.id} position={[staff.lat || 26.22, staff.lng || 84.36]} icon={getWalkingIcon(staff.gender)}>
                                <Tooltip sticky direction="top" offset={[0, -40]} opacity={1}>
                                   
                                   {/* --- STYLISH PROJECTION CARD --- */}
                                   <div className="hud-card">
                                      <div className="hud-scanner"></div>
                                      
                                      <div className="hud-header">
                                         <div className="hud-id">
                                            <Fingerprint size={12} className="text-emerald-500" />
                                            <span>#ID-{staff.employee_id || '000'}</span>
                                         </div>
                                         <div className="hud-status-dot"></div>
                                      </div>

                                      <h3 className="hud-name">{staff.name}</h3>
                                      
                                      <div className="hud-grid">
                                         <div className="hud-item">
                                            <label>Gender</label>
                                            <p>{staff.gender || 'N/A'}</p>
                                         </div>
                                         <div className="hud-item">
                                            <label>Mobile</label>
                                            <p>{staff.mobile || '********'}</p>
                                         </div>
                                         <div className="hud-item">
                                            <label>Unit Sector</label>
                                            <p>Ward {staff.ward_no}</p>
                                         </div>
                                         <div className="hud-item">
                                            <label>Designation</label>
                                            <p>{staff.post || 'Field Agent'}</p>
                                         </div>
                                      </div>

                                      <div className="hud-footer">
                                         <ShieldCheck size={14} className="text-emerald-400" />
                                         <div className="hud-footer-text">
                                            <label>Reporting To</label>
                                            <p>{staff.inspector_name || 'Control HQ'}</p>
                                         </div>
                                      </div>
                                      
                                      {/* Decorative Corners */}
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
                .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                
                .hud-card {
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 20px;
                    padding: 18px;
                    width: 260px;
                    position: relative;
                    color: white;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                    overflow: hidden;
                }

                .hud-scanner {
                    position: absolute; top: 0; left: 0; width: 100%; height: 3px;
                    background: linear-gradient(to right, transparent, #10b981, transparent);
                    box-shadow: 0 0 15px #10b981;
                    animation: h-scan 3s linear infinite;
                    opacity: 0.6;
                }

                .hud-header { display: flex; justify-between; align-items: center; margin-bottom: 12px; }
                .hud-id { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 900; color: #10b981; letter-spacing: 1px; }
                .hud-status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: h-pulse 1.5s infinite; }

                .hud-name { font-size: 18px; font-weight: 900; text-transform: uppercase; margin-bottom: 15px; letter-spacing: -0.5px; color: #fff; }

                .hud-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; }
                .hud-item label { display: block; font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
                .hud-item p { font-size: 11px; font-weight: 800; color: #e2e8f0; margin-top: 2px; }

                .hud-footer {
                    margin-top: 15px; padding: 10px; background: rgba(16, 185, 129, 0.05);
                    border-radius: 12px; border-left: 3px solid #10b981;
                    display: flex; align-items: center; gap: 12px;
                }
                .hud-footer-text label { display: block; font-size: 7px; color: #10b981; font-weight: 900; text-transform: uppercase; }
                .hud-footer-text p { font-size: 10px; font-weight: 900; color: #fff; }

                .corner-tl { position: absolute; top: 0; left: 0; width: 15px; height: 15px; border-top: 2px solid #10b981; border-left: 2px solid #10b981; border-radius: 5px 0 0 0; }
                .corner-br { position: absolute; bottom: 0; right: 0; width: 15px; height: 15px; border-bottom: 2px solid #10b981; border-right: 2px solid #10b981; border-radius: 0 0 5px 0; }

                @keyframes h-scan { 0% { top: -5% } 100% { top: 105% } }
                @keyframes h-pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
                
                .staff-gif-marker { filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4)); }
            `}</style>
        </CityLayout>
    );
};

function MapFocusHandler({ staff, ward }) {
    const map = useMap();
    useEffect(() => {
        if (staff && staff.lat) {
            map.flyTo([staff.lat, staff.lng], 18, { duration: 2 });
        } else if (ward && ward.boundary_coords) {
            const coords = JSON.parse(ward.boundary_coords);
            const bounds = L.polygon(coords.map(c => [c[1], c[0]])).getBounds();
            map.flyToBounds(bounds, { padding: [100, 100], duration: 1.5 });
        }
    }, [staff, ward, map]);
    return null;
}

export default StaffLiveTracking;
