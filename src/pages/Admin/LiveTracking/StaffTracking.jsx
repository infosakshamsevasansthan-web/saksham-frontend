import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio, ShieldCheck, Activity, Phone, User, Fingerprint, MapPin, Layers } from 'lucide-react';
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
                
                {/* 🟢 Header: Restored to Light/Professional Theme */}
                <header className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                           <Radio className="animate-pulse" size={30} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Personnel Tracking</h2>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                               <Activity size={12} /> System Status: Real-time Live
                            </p>
                        </div>
                    </div>

                    {/* 🟢 Both Dropdowns are BACK! */}
                    <div className="flex gap-4 items-center bg-slate-50 p-3 rounded-3xl border border-slate-200">
                        {/* Ward Selector */}
                        <div className="flex items-center gap-2 px-4 border-r border-slate-200">
                            <Layers size={16} className="text-slate-400" />
                            <select 
                                className="bg-transparent border-none text-sm font-black text-slate-700 outline-none cursor-pointer"
                                value={selectedWard}
                                onChange={(e) => { setSelectedWard(e.target.value); setSelectedStaffId('All'); }}
                            >
                                <option value="All">All Wards</option>
                                {wards.map(w => <option key={w.id} value={w.ward_no}>Ward {w.ward_no}</option>)}
                            </select>
                        </div>
                        
                        {/* Staff Selector */}
                        <div className="flex items-center gap-2 px-4">
                            <MapPin size={16} className="text-slate-400" />
                            <select 
                                className="bg-transparent border-none text-sm font-black text-slate-700 outline-none cursor-pointer min-w-[150px]"
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                            >
                                <option value="All">All Deployed Units</option>
                                {allStaff.filter(s => selectedWard === 'All' || s.ward_no === selectedWard).map(s => (
                                    <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                {/* 🟢 Map Section: Restored White Border & Clean Look */}
                <div className="flex-1 rounded-[3rem] overflow-hidden border-[8px] border-white shadow-xl relative">
                    <MapContainer center={[26.22, 84.36]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

                        {/* Ward Boundary */}
                        {currentWardData && currentWardData.boundary_coords && (
                            <Polygon 
                                positions={JSON.parse(currentWardData.boundary_coords).map(c => [c[1], c[0]])}
                                pathOptions={{ color: '#10b981', fillOpacity: 0.1, weight: 3, dashArray: '10, 10' }}
                            />
                        )}

                        {filteredStaff.map(staff => (
                            <Marker key={staff.id} position={[staff.lat || 26.22, staff.lng || 84.36]} icon={getWalkingIcon(staff.gender)}>
                                <Tooltip sticky direction="top" offset={[0, -40]} opacity={1}>
                                   
                                   {/* --- ✨ Stylish Projection HUD Card --- */}
                                   <div className="hud-card">
                                      <div className="hud-scanner"></div>
                                      
                                      <div className="hud-header">
                                         <div className="hud-id">
                                            <Fingerprint size={14} />
                                            <span>UNIT ID: {staff.employee_id || 'N/A'}</span>
                                         </div>
                                         <div className="hud-status-dot"></div>
                                      </div>

                                      <h3 className="hud-name">{staff.name}</h3>
                                      
                                      <div className="hud-grid">
                                         <div className="hud-item">
                                            <label>Gender / लिंग</label>
                                            <p>{staff.gender || 'Male'}</p>
                                         </div>
                                         <div className="hud-item">
                                            <label>Mobile / संपर्क</label>
                                            <p>{staff.mobile || 'N/A'}</p>
                                         </div>
                                         <div className="hud-item">
                                            <label>Deployment</label>
                                            <p>Ward No: {staff.ward_no}</p>
                                         </div>
                                         <div className="hud-item">
                                            <label>Designation</label>
                                            <p>{staff.post || 'Field Staff'}</p>
                                         </div>
                                      </div>

                                      <div className="hud-footer">
                                         <ShieldCheck size={16} className="text-emerald-400" />
                                         <div className="hud-footer-text">
                                            <label>Supervisor In-Charge</label>
                                            <p>{staff.inspector_name || 'Control Office'}</p>
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
                .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                
                /* Stylish Projection Card CSS */
                .hud-card {
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(16, 185, 129, 0.4);
                    border-radius: 24px;
                    padding: 20px;
                    width: 280px;
                    position: relative;
                    color: white;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    overflow: hidden;
                }

                .hud-scanner {
                    position: absolute; top: 0; left: 0; width: 100%; height: 2px;
                    background: linear-gradient(to right, transparent, #10b981, transparent);
                    animation: h-scan 3s linear infinite;
                }

                .hud-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .hud-id { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 900; color: #10b981; letter-spacing: 2px; }
                .hud-status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: h-pulse 1.5s infinite; }

                .hud-name { font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 15px; color: #fff; letter-spacing: -0.5px; }

                .hud-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; }
                .hud-item label { display: block; font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
                .hud-item p { font-size: 11px; font-weight: 800; color: #f8fafc; margin-top: 2px; }

                .hud-footer {
                    margin-top: 20px; padding: 12px; background: rgba(16, 185, 129, 0.08);
                    border-radius: 15px; border-left: 4px solid #10b981;
                    display: flex; align-items: center; gap: 12px;
                }
                .hud-footer-text label { display: block; font-size: 8px; color: #10b981; font-weight: 900; text-transform: uppercase; }
                .hud-footer-text p { font-size: 11px; font-weight: 900; color: #fff; }

                .corner-tl { position: absolute; top: 0; left: 0; width: 20px; height: 20px; border-top: 3px solid #10b981; border-left: 3px solid #10b981; border-radius: 10px 0 0 0; }
                .corner-br { position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; border-bottom: 3px solid #10b981; border-right: 3px solid #10b981; border-radius: 0 0 10px 0; }

                @keyframes h-scan { 0% { top: -5% } 100% { top: 105% } }
                @keyframes h-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
                
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
