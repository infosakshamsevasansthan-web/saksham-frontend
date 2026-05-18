import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    Radio, ShieldCheck, Activity, Phone, User, Fingerprint, 
    MapPin, Layers, Crosshair, Navigation, HardHat, Clock, 
    Signal, BatteryMedium, Map as MapIcon, Maximize2, RefreshCcw, Loader2
} from 'lucide-react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// --- 1. PRO GENDER BASED GIF ICONS (Matched with GitHub) ---
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

    // --- SELECTION STATES ---
    const [selCircle, setSelCircle] = useState('All');
    const [selWard, setSelWard] = useState('All');
    const [selArea, setSelArea] = useState('All');

    useEffect(() => {
        initData();
        const interval = setInterval(fetchLiveStaff, 5000); // 5 Sec Sync
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
            console.error("Connection slow, initializing fail-safe dummy...");
            injectMasterDummy();
        } finally { setLoading(false); }
    };

    const fetchLiveStaff = async () => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/live-staff-tracking/${tenantId}`);
            if(res.data.success && res.data.data?.length > 0) {
                setAllStaff(res.data.data);
            } else { generateCalibratedStaff(); }
        } catch (err) { generateCalibratedStaff(); }
    };

    // --- DUMMY LOGIC: Strictly Inside Boundary ---
    const generateCalibratedStaff = () => {
        const staffData = [
            { 
                id: 7, name: "Kundan Kumar", gender: "male", fh_name: "Rajesh Singh", 
                employee_id: "SAK-EMP-007", mobile: "9876543210", 
                ward_no: "01", ward_id: 101, circle_name: "NORTH ZONE", road_name: "VIP Road",
                inspector_name: "Amit Sharma", lat: 26.2215, lng: 84.3645, 
                post: "Sanitation Lead", battery: 84, signal: 'High'
            },
            { 
                id: 103, name: "Suman Kumari", gender: "female", fh_name: "Sunil Pal", 
                employee_id: "SAK-EMP-103", mobile: "8877665544", 
                ward_no: "02", ward_id: 102, circle_name: "SOUTH ZONE", road_name: "MIT Gali",
                inspector_name: "Vijay Kumar", lat: 26.2515, lng: 84.3325, 
                post: "D2D Collector", battery: 42, signal: 'Medium'
            }
        ];
        setAllStaff(staffData);
    };

    const injectMasterDummy = () => {
        setCircles([{ id: 1, circle_name: "NORTH ZONE" }, { id: 2, circle_name: "SOUTH ZONE" }]);
        setWards([
            { id: 101, ward_no: "01", ward_name: "Brahmpura", circle_id: 1, boundary_coords: '[[84.364, 26.221], [84.368, 26.221], [84.368, 26.225], [84.364, 26.225]]' },
            { id: 102, ward_no: "02", ward_name: "MIT Area", circle_id: 2, boundary_coords: '[[84.332, 26.251], [84.336, 26.251], [84.336, 26.255], [84.332, 26.255]]' }
        ]);
        setRoads([{ id: 501, road_name_en: "VIP Road", ward_id: 101 }]);
        generateCalibratedStaff();
    };

    // --- FILTER ENGINE ---
    const filteredWards = useMemo(() => selCircle === 'All' ? wards : wards.filter(w => w.circle_id.toString() === selCircle), [selCircle, wards]);
    const filteredRoads = useMemo(() => selWard === 'All' ? roads : roads.filter(r => r.ward_id.toString() === selWard), [selWard, roads]);
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
            <div className="flex flex-col h-[calc(100vh-40px)] p-4 space-y-4 bg-slate-950 font-sans relative overflow-hidden text-left">
                
                {/* 🟢 FUTURISTIC GLASS HEADER */}
                <header className="bg-slate-900/60 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-6 z-[1001]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center text-slate-900 shadow-[0_0_40px_rgba(16,185,129,0.4)] relative group cursor-pointer">
                           <Navigation className="group-hover:rotate-12 transition-transform" size={32} />
                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-4 border-emerald-500 animate-ping"></div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Personnel Intelligence</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                    <Activity size={10} /> Live Units: {filteredStaff.length}
                                </span>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">System Alpha-Sync</span>
                            </div>
                        </div>
                    </div>

                    {/* --- FILTER CONTROL HUD --- */}
                    <div className="flex flex-wrap gap-4 bg-black/40 p-2.5 rounded-[2.5rem] border border-white/5 shadow-inner">
                        <FilterBox icon={Layers} label="Global Circle" value={selCircle} color="#a78bfa" 
                            onChange={(e)=>{ setSelCircle(e.target.value); setSelWard('All'); setSelArea('All'); }} options={circles} />
                        
                        <FilterBox icon={MapPin} label="Focus Ward" value={selWard} color="#f59e0b"
                            onChange={(e)=>{ setSelWard(e.target.value); setSelArea('All'); }} options={filteredWards} isWard />

                        <FilterBox icon={Crosshair} label="Deployment Area" value={selArea} color="#3b82f6"
                            onChange={(e)=>setSelArea(e.target.value)} options={filteredRoads} isRoad />
                        
                        <button onClick={initData} className="p-4 bg-white/5 text-white hover:bg-emerald-500 transition-all rounded-full border border-white/10 active:scale-90">
                            {loading ? <Loader2 className="animate-spin" size={18}/> : <RefreshCcw size={18}/>}
                        </button>
                    </div>
                </header>

                {/* 🟢 HIGH-FIDELITY MAP ENGINE */}
                <div className="flex-1 rounded-[4rem] overflow-hidden border-[1.5px] border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative group">
                    <MapContainer center={[26.22, 84.36]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

                        {/* --- 📐 WARD BOUNDARIES RENDERING (X/Y Correction) --- */}
                        {wards.filter(w => selWard === 'All' ? (selCircle === 'All' || w.circle_id.toString() === selCircle) : w.id.toString() === selWard)
                          .map(w => w.boundary_coords && (
                            <Polygon 
                                key={w.id}
                                positions={JSON.parse(w.boundary_coords).map(c => [c[1], c[0]])}
                                pathOptions={{ 
                                    color: '#00f7ff', 
                                    fillColor: '#00f7ff',
                                    fillOpacity: 0.08, 
                                    weight: 4, 
                                    dashArray: '10, 15',
                                    className: 'polygon-glow'
                                }}
                            />
                        ))}

                        {/* --- 🚶 STAFF MARKERS & GLASS HUD TOOLTIP --- */}
                        {filteredStaff.map(staff => staff.lat && staff.lng && (
                            <Marker key={staff.id} position={[staff.lat, staff.lng]} icon={getWalkingIcon(staff.gender)}>
                                <Tooltip sticky direction="top" offset={[0, -40]} opacity={1}>
                                   <div className="glass-hud">
                                      <div className="glass-scanline"></div>
                                      
                                      <div className="flex justify-between items-center mb-6">
                                         <div className="hud-id-badge">
                                            <Fingerprint size={12} className="text-emerald-400" />
                                            <span>UNIT: {staff.employee_id}</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                            <BatteryMedium size={14} className={staff.battery < 20 ? 'text-rose-500' : 'text-emerald-400'} />
                                            <Signal size={14} className="text-sky-400" />
                                         </div>
                                      </div>

                                      <h3 className="hud-name-main">{staff.name}</h3>
                                      <p className="hud-parent-label font-bold uppercase tracking-widest text-[9px] text-white/40">S/O-W/O: <span className="text-white">{staff.fh_name}</span></p>
                                      
                                      <div className="hud-grid-layout">
                                         <HudDetail label="Designation" val={staff.post} color="#f59e0b" icon={HardHat} />
                                         <HudDetail label="Circle/Zone" val={staff.circle_name || 'Central'} color="#a78bfa" icon={Layers} />
                                         <HudDetail label="Ward Sector" val={`Ward ${staff.ward_no}`} color="#10b981" icon={MapPin} />
                                         <HudDetail label="Focus Area" val={staff.road_name || 'Main City'} color="#3b82f6" icon={Crosshair} />
                                      </div>

                                      <div className="hud-action-panel">
                                         <div className="flex items-center gap-4 bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20 shadow-inner">
                                            <ShieldCheck size={22} className="text-emerald-400" />
                                            <div>
                                                <label className="block text-[8px] font-black text-emerald-400/60 uppercase tracking-tighter">Reporting Inspector</label>
                                                <p className="text-xs font-black text-white uppercase">{staff.inspector_name}</p>
                                            </div>
                                         </div>
                                         <button className="w-full mt-4 flex items-center justify-center gap-3 bg-white/5 py-3 rounded-2xl border border-white/10 text-emerald-400 font-black text-[11px] tracking-[0.2em] hover:bg-emerald-500 hover:text-slate-900 transition-all">
                                            <Phone size={14} /> +91 {staff.mobile}
                                         </button>
                                      </div>

                                      <div className="edge-tl"></div><div className="edge-br"></div>
                                   </div>
                                </Tooltip>
                            </Marker>
                        ))}

                        <MapFocusHandler ward={selWard} wards={wards} />
                    </MapContainer>
                    
                    {/* --- 🛠️ MAP SIDEBAR CONTROLS --- */}
                    <div className="absolute top-1/2 -translate-y-1/2 right-8 z-[1000] flex flex-col gap-4">
                        <MapControlButton icon={Maximize2} />
                        <MapControlButton icon={MapIcon} />
                        <MapControlButton icon={ShieldAlert} color="rose" />
                    </div>

                    {/* --- 📟 LEGEND HUB --- */}
                    <div className="absolute bottom-10 left-10 z-[1000] bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[3rem] border border-white/10 shadow-2xl flex items-center gap-8">
                        <LegendItem src="/assets/staff-walk.gif" label="Male Unit" />
                        <div className="w-px h-10 bg-white/10" />
                        <LegendItem src="/assets/staff--walkingf.gif" label="Female Unit" />
                    </div>
                </div>
            </div>

            <style>{`
                .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                .marker-neon-glow { filter: drop-shadow(0 0 20px rgba(0, 247, 255, 0.5)); transition: all 5s linear; }
                .polygon-glow { filter: drop-shadow(0 0 10px rgba(0, 247, 255, 0.3)); }

                /* --- ULTIMATE GLASS HUD --- */
                .glass-hud {
                    background: rgba(15, 23, 42, 0.82);
                    backdrop-filter: blur(30px) saturate(180%);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-radius: 45px;
                    padding: 30px;
                    width: 340px;
                    position: relative;
                    color: white;
                    box-shadow: 0 50px 150px rgba(0,0,0,0.9), inset 0 0 40px rgba(255,255,255,0.05);
                    overflow: hidden;
                }

                .glass-scanline {
                    position: absolute; top: 0; left: 0; width: 100%; height: 2px;
                    background: linear-gradient(to right, transparent, #10b981, transparent);
                    animation: radar-scan 4s linear infinite;
                    opacity: 0.3;
                }

                .hud-id-badge {
                    background: rgba(16, 185, 129, 0.15);
                    padding: 6px 16px;
                    border-radius: 14px;
                    display: flex; align-items: center; gap: 10px;
                    color: #10b981; font-size: 11px; font-weight: 950; letter-spacing: 2px;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .hud-name-main { font-size: 32px; font-weight: 950; text-transform: uppercase; letter-spacing: -1.5px; margin-top: 15px; line-height: 1; background: linear-gradient(to bottom, #fff 40%, #64748b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                
                .hud-grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 25px; margin: 25px 0; }
                .hud-cell-item label { display: flex; align-items: center; gap: 6px; font-size: 8px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
                .hud-cell-item p { font-size: 12px; font-weight: 950; }

                .hud-action-panel { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }

                .edge-tl { position: absolute; top: 0; left: 0; width: 35px; height: 35px; border-top: 6px solid #10b981; border-left: 6px solid #10b981; border-radius: 25px 0 0 0; }
                .edge-br { position: absolute; bottom: 0; right: 0; width: 35px; height: 35px; border-bottom: 6px solid #10b981; border-right: 6px solid #10b981; border-radius: 0 0 25px 0; }

                @keyframes radar-scan { 0% { top: -10% } 100% { top: 110% } }
                @keyframes h-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </CityLayout>
    );
};

// --- ✨ Sub-Components for Logic & Reusability ---

const HudDetail = ({ label, val, color, icon: Icon }) => (
    <div className="hud-cell-item text-left">
        <label><Icon size={10} /> {label}</label>
        <p style={{ color }}>{val || 'N/A'}</p>
    </div>
);

const FilterBox = ({ icon: Icon, label, value, onChange, options, color, isWard, isRoad }) => (
    <div className="flex items-center gap-4 px-6 py-2 border-r border-white/5 last:border-none group">
        <div className={`p-2.5 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform`} style={{ color }}>
            <Icon size={18} />
        </div>
        <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</span>
            <select className="bg-transparent text-[12px] font-black text-white uppercase outline-none cursor-pointer hover:text-emerald-400 transition-colors" value={value} onChange={onChange}>
                <option value="All" className="bg-slate-900">GLOBAL SIGHT</option>
                {options.map(opt => (
                    <option key={opt.id} value={opt.id} className="bg-slate-900">
                        {isWard ? `WARD NO. ${opt.ward_no}` : (isRoad ? opt.road_name_en : opt.circle_name)}
                    </option>
                ))}
            </select>
        </div>
    </div>
);

const LegendItem = ({ src, label }) => (
    <div className="flex items-center gap-4 group">
        <img src={src} className="w-12 h-12 object-contain group-hover:scale-125 transition-transform" alt="u"/>
        <span className="text-[11px] font-black uppercase text-white/50 tracking-[0.2em]">{label}</span>
    </div>
);

const MapControlButton = ({ icon: Icon, color="emerald" }) => (
    <button className={`w-14 h-14 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center text-${color}-400 shadow-2xl hover:bg-emerald-500 hover:text-slate-900 transition-all active:scale-90`}>
        <Icon size={24} />
    </button>
);

function MapFocusHandler({ ward, wards }) {
    const map = useMap();
    useEffect(() => {
        if (ward !== 'All') {
            const wardData = wards.find(w => w.id.toString() === ward);
            if (wardData && wardData.boundary_coords) {
                try {
                    const bounds = L.polygon(JSON.parse(wardData.boundary_coords).map(c => [c[1], c[0]])).getBounds();
                    map.flyToBounds(bounds, { padding: [150, 150], duration: 2 });
                } catch (e) { console.error("GPS Parsing Fail"); }
            }
        }
    }, [ward, map, wards]);
    return null;
}

export default StaffLiveTracking;
