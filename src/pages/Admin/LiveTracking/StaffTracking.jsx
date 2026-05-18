import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    Radio, ShieldCheck, Activity, Phone, User, Fingerprint, 
    MapPin, Layers, Crosshair, Users, ShieldAlert, Navigation, HardHat, Clock
} from 'lucide-react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// --- 1. PRO GENDER BASED GIF ICONS (Matched with GitHub Filenames) ---
const getWalkingIcon = (gender) => {
    const g = gender ? gender.toLowerCase() : 'male';
    const iconUrl = g === 'female' 
        ? '/assets/staff--walkingf.gif' 
        : '/assets/staff-walk.gif';

    return new L.Icon({
        iconUrl: iconUrl,
        iconSize: [80, 80],
        iconAnchor: [40, 70],
        className: 'marker-neon-glow'
    });
};

const StaffLiveTracking = () => {
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // --- DATA STATES ---
    const [circles, setCircles] = useState([]);
    const [wards, setWards] = useState([]);
    const [roads, setRoads] = useState([]);
    const [allStaff, setAllStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FILTER STATES ---
    const [selCircle, setSelCircle] = useState('All');
    const [selWard, setSelWard] = useState('All');
    const [selArea, setSelArea] = useState('All');

    useEffect(() => {
        initData();
        // Har 5 second mein location sync karega (Zomato Style)
        const interval = setInterval(fetchLiveStaff, 5000); 
        return () => clearInterval(interval);
    }, [tenantId]);

    const initData = async () => {
        setLoading(true);
        try {
            const [circRes, wardRes, roadRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roads/${tenantId}`)
            ]);
            setCircles(circRes.data.data || []);
            setWards(wardRes.data.data || []);
            setRoads(roadRes.data.data || []);
            await fetchLiveStaff();
        } catch (err) { 
            console.error("Using local logic due to connection...");
        } finally { setLoading(false); }
    };

    const fetchLiveStaff = async () => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/live-staff-tracking/${tenantId}`);
            if(res.data.success) {
                setAllStaff(res.data.data);
            }
        } catch (err) { console.log("Live update error"); }
    };

    // --- LOGIC: Dependent Filtering (Circle -> Ward -> Area) ---
    const filteredWards = useMemo(() => 
        selCircle === 'All' ? wards : wards.filter(w => w.circle_id.toString() === selCircle),
    [selCircle, wards]);

    const filteredRoads = useMemo(() => 
        selWard === 'All' ? roads : roads.filter(r => r.ward_id.toString() === selWard),
    [selWard, roads]);

    const filteredStaff = useMemo(() => {
        return allStaff.filter(s => {
            const cMatch = selCircle === 'All' || s.circle_id?.toString() === selCircle;
            const wMatch = selWard === 'All' || s.ward_id?.toString() === selWard;
            const aMatch = selArea === 'All' || s.road_id?.toString() === selArea;
            return cMatch && wMatch && aMatch;
        });
    }, [allStaff, selCircle, selWard, selArea]);

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="flex flex-col h-[calc(100vh-40px)] p-4 space-y-4 bg-slate-950 font-sans relative overflow-hidden">
                
                {/* 🟢 TOP GLASS COMMAND BAR */}
                <header className="bg-slate-900/60 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-6 z-[1001]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.4)] relative">
                           <Navigation className="animate-pulse" size={32} />
                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-4 border-emerald-500 animate-ping"></div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight leading-none">Personnel Intelligence</h2>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                               <Activity size={12} /> Live Sync: {filteredStaff.length} Active Units
                            </p>
                        </div>
                    </div>

                    {/* --- FILTER CONTROL GROUP --- */}
                    <div className="flex flex-wrap gap-4 bg-black/40 p-2.5 rounded-[2.5rem] border border-white/5">
                        <FilterBox icon={Layers} label="Global Circle" value={selCircle} color="#10b981" 
                            onChange={(e)=>{ setSelCircle(e.target.value); setSelWard('All'); setSelArea('All'); }} options={circles} />
                        
                        <FilterBox icon={MapPin} label="Select Ward" value={selWard} color="#f59e0b"
                            onChange={(e)=>{ setSelWard(e.target.value); setSelArea('All'); }} options={filteredWards} isWard />

                        <FilterBox icon={Crosshair} label="Deployment Area" value={selArea} color="#3b82f6"
                            onChange={(e)=>setSelArea(e.target.value)} options={filteredRoads} isRoad />
                    </div>
                </header>

                {/* 🟢 INTERACTIVE MAP ENGINE */}
                <div className="flex-1 rounded-[4rem] overflow-hidden border-[1px] border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
                    <MapContainer center={[26.22, 84.36]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

                        {/* --- 📐 WARD BOUNDARIES RENDERING --- */}
                        {wards.filter(w => selWard === 'All' ? (selCircle === 'All' || w.circle_id.toString() === selCircle) : w.id.toString() === selWard)
                          .map(w => {
                            if (!w.boundary_coords) return null;
                            try {
                                // Longitude, Latitude ko flip karke Latitude, Longitude mein convert kar rahe hain (Leaflet requirement)
                                const positions = JSON.parse(w.boundary_coords).map(c => [c[1], c[0]]);
                                return (
                                    <Polygon 
                                        key={w.id}
                                        positions={positions}
                                        pathOptions={{ 
                                            color: '#10b981', 
                                            fillColor: '#10b981',
                                            fillOpacity: 0.1, 
                                            weight: 3, 
                                            dashArray: '10, 10' 
                                        }}
                                    />
                                );
                            } catch (e) { return null; }
                        })}

                        {/* --- 🚶 STAFF LIVE MARKERS --- */}
                        {filteredStaff.map(staff => {
                            // 🛡️ CRASH PROTECTION: Agar coordinates nahi hain toh skip karo
                            if (!staff.lat || !staff.lng) return null;

                            return (
                                <Marker 
                                    key={staff.id} 
                                    position={[parseFloat(staff.lat), parseFloat(staff.lng)]} 
                                    icon={getWalkingIcon(staff.gender)}
                                >
                                    <Tooltip sticky direction="top" offset={[0, -40]} opacity={1}>
                                       
                                       {/* --- ✨ TRANSPARENT GLASS HUD CARD --- */}
                                       <div className="glass-hud">
                                          <div className="glass-scanline"></div>
                                          
                                          <div className="flex justify-between items-center mb-5">
                                             <div className="hud-id-pill">
                                                <Fingerprint size={12} className="text-emerald-400" />
                                                <span>UNIT: {staff.employee_id}</span>
                                             </div>
                                             <div className="active-glow"></div>
                                          </div>

                                          <h3 className="hud-name-label">{staff.name}</h3>
                                          <p className="hud-fh-label">Parent/Husband: <span className="text-white">{staff.fh_name || 'N/A'}</span></p>
                                          
                                          <div className="hud-metrics-grid">
                                             <HudItem label="Designation" val={staff.post || 'Field Agent'} color="#f59e0b" icon={HardHat} />
                                             <HudItem label="Ward No" val={staff.ward_no} color="#10b981" icon={MapPin} />
                                             <HudItem label="Anchal/Circle" val={staff.circle_name || 'North'} color="#a78bfa" icon={Layers} />
                                             <HudItem label="Deployment" val={staff.road_name || 'Main St.'} color="#3b82f6" icon={Crosshair} />
                                          </div>

                                          <div className="hud-footer-panel">
                                             <div className="flex items-center gap-3 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                                                <ShieldCheck size={20} className="text-emerald-400" />
                                                <div>
                                                    <label className="block text-[8px] font-black text-emerald-400/60 uppercase">Field Inspector</label>
                                                    <p className="text-xs font-black text-white uppercase">{staff.inspector_name || 'Admin Control'}</p>
                                                </div>
                                             </div>
                                             <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 font-black text-[11px] tracking-widest border-t border-white/5 pt-3">
                                                <Phone size={12} /> +91 {staff.mobile}
                                             </div>
                                          </div>

                                          <div className="corner-tl"></div><div className="corner-br"></div>
                                       </div>
                                    </Tooltip>
                                </Marker>
                            );
                        })}

                        <MapFocusHandler ward={selWard} wards={wards} />
                    </MapContainer>
                    
                    {/* --- MAP LEGEND --- */}
                    <div className="absolute bottom-10 left-10 z-[1000] bg-black/60 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <img src="/assets/staff-walk.gif" className="w-10 h-10 object-contain" alt="m"/>
                            <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Male Staff</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <img src="/assets/staff--walkingf.gif" className="w-10 h-10 object-contain" alt="f"/>
                            <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">Female Staff</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                
                /* Smooth transition for walking effect */
                .marker-neon-glow { 
                    filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.7));
                    transition: all 5s linear; 
                }

                /* --- GLASSMORPHISM HUD STYLING --- */
                .glass-hud {
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(20px) saturate(160%);
                    border: 1.5px solid rgba(255, 255, 255, 0.12);
                    border-radius: 40px;
                    padding: 25px;
                    width: 320px;
                    position: relative;
                    color: white;
                    box-shadow: 0 40px 120px rgba(0,0,0,0.95), inset 0 0 30px rgba(255,255,255,0.05);
                    overflow: hidden;
                    text-align: left;
                }

                .glass-scanline {
                    position: absolute; top: 0; left: 0; width: 100%; height: 2px;
                    background: linear-gradient(to right, transparent, #10b981, transparent);
                    animation: h-scan 4s linear infinite;
                    opacity: 0.3;
                }

                .hud-id-pill {
                    background: rgba(16, 185, 129, 0.15);
                    padding: 6px 15px;
                    border-radius: 12px;
                    display: flex; align-items: center; gap: 8px;
                    color: #10b981; font-size: 10px; font-weight: 950; letter-spacing: 2px;
                }

                .active-glow { width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 20px #10b981; animation: h-pulse 1.5s infinite; }

                .hud-name-label { font-size: 26px; font-weight: 950; text-transform: uppercase; letter-spacing: -1px; margin-top: 10px; background: linear-gradient(to bottom, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .hud-fh-label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }

                .hud-metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 25px; margin-bottom: 25px; }
                .hud-metric-cell label { display: flex; align-items: center; gap: 6px; font-size: 8px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
                .hud-metric-cell p { font-size: 11px; font-weight: 950; }

                .hud-footer-panel { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }

                .corner-tl { position: absolute; top: 0; left: 0; width: 30px; height: 30px; border-top: 4px solid #10b981; border-left: 4px solid #10b981; border-radius: 20px 0 0 0; }
                .corner-br { position: absolute; bottom: 0; right: 0; width: 30px; height: 30px; border-bottom: 4px solid #10b981; border-right: 4px solid #10b981; border-radius: 0 0 20px 0; }

                @keyframes h-scan { 0% { top: -5% } 100% { top: 105% } }
                @keyframes h-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </CityLayout>
    );
};

// --- ✨ Renders HUD Grid Items ---
const HudItem = ({ label, val, color, icon: Icon }) => (
    <div className="hud-metric-cell">
        <label><Icon size={10} /> {label}</label>
        <p style={{ color }}>{val || 'N/A'}</p>
    </div>
);

// --- ✨ Custom Dropdown Component ---
const FilterBox = ({ icon: Icon, label, value, onChange, options, color, isWard, isRoad }) => (
    <div className="flex items-center gap-3 px-5 py-2 border-r border-white/5 last:border-none">
        <Icon size={18} style={{ color }} />
        <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{label}</span>
            <select className="bg-transparent text-[11px] font-black text-white uppercase outline-none cursor-pointer" value={value} onChange={onChange}>
                <option value="All" className="bg-slate-900">ALL RECORDS</option>
                {options.map(opt => (
                    <option key={opt.id} value={opt.id} className="bg-slate-900">
                        {isWard ? `WARD ${opt.ward_no}` : (isRoad ? opt.road_name_en : opt.circle_name)}
                    </option>
                ))}
            </select>
        </div>
    </div>
);

// --- ✨ MAP FOCUS HANDLER (SMOOTH FLYING) ---
function MapFocusHandler({ ward, wards }) {
    const map = useMap();
    useEffect(() => {
        if (ward !== 'All') {
            const wardData = wards.find(w => w.id.toString() === ward);
            if (wardData && wardData.boundary_coords) {
                try {
                    const bounds = L.polygon(JSON.parse(wardData.boundary_coords).map(c => [c[1], c[0]])).getBounds();
                    map.flyToBounds(bounds, { padding: [100, 100], duration: 1.5 });
                } catch (e) { console.error("Boundary parsing error"); }
            }
        }
    }, [ward, map, wards]);
    return null;
}

export default StaffLiveTracking;
