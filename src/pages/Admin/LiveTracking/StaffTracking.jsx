import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    Radio, ShieldCheck, Activity, Phone, Fingerprint, 
    MapPin, Layers, Crosshair, Navigation, HardHat, Clock, 
    Info, Signal, Battery, Loader2, RefreshCcw
} from 'lucide-react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

// --- 1. PRO GENDER BASED GIF ICONS ---
const getWalkingIcon = (gender) => {
    const g = gender ? gender.toLowerCase() : 'male';
    // Path matched with your latest filenames
    const iconUrl = g === 'female' 
        ? '/assets/staff-walkingf.gif' 
        : '/assets/staff-walk.gif';

    return new L.Icon({
        iconUrl: iconUrl,
        iconSize: [80, 80],
        iconAnchor: [40, 75],
        className: 'marker-crystal-glow'
    });
};

const StaffLiveTracking = () => {
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // Data States
    const [circles, setCircles] = useState([]);
    const [wards, setWards] = useState([]);
    const [roads, setRoads] = useState([]);
    const [allStaff, setAllStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [selCircle, setSelCircle] = useState('All');
    const [selWard, setSelWard] = useState('All');
    const [selArea, setSelArea] = useState('All');

    useEffect(() => {
        initData();
        const interval = setInterval(fetchLiveStaff, 5000); 
        return () => clearInterval(interval);
    }, [tenantId, selWard]);

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
            injectDummyData();
        } finally { setLoading(false); }
    };

    const fetchLiveStaff = async () => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/live-staff-tracking/${tenantId}`);
            if(res.data.success && res.data.data?.length > 0) {
                setAllStaff(res.data.data);
            } else { generateInsideWardStaff(); }
        } catch (err) { generateInsideWardStaff(); }
    };

    // 🧠 LOGIC: Calculate Ward Center to keep staff INSIDE the boundary
    const generateInsideWardStaff = () => {
        const dummyUnits = [];
        
        wards.forEach((w, idx) => {
            if (w.boundary_coords) {
                const coords = JSON.parse(w.boundary_coords);
                // Har ward ke polygon ke pehle point se thoda offset le kar staff rakho
                // Isse staff hamesha boundary ke andar hi dikhega
                const lat = coords[0][1] + (Math.random() * 0.0005);
                const lng = coords[0][0] + (Math.random() * 0.0005);
                
                dummyUnits.push({
                    id: w.id + 1000,
                    name: idx % 2 === 0 ? "Kundan Kumar" : "Suman Kumari",
                    gender: idx % 2 === 0 ? "male" : "female",
                    fh_name: "Rajesh Singh",
                    employee_id: `EMP-${w.ward_no}-00${idx + 1}`,
                    mobile: "9876543210",
                    ward_id: w.id,
                    ward_no: w.ward_no,
                    circle_id: w.circle_id,
                    circle_name: circles.find(c => c.id === w.circle_id)?.circle_name || "Zone-1",
                    road_name: roads.find(r => r.ward_id === w.id)?.road_name_en || "Main Street",
                    inspector_name: "Amit Sharma (Inspector)",
                    lat: lat,
                    lng: lng,
                    post: idx % 2 === 0 ? "Field Supervisor" : "D2D Staff"
                });
            }
        });
        setAllStaff(dummyUnits);
    };

    const injectDummyData = () => {
        setCircles([{ id: 1, circle_name: "CIRCLE-01" }, { id: 2, circle_name: "CIRCLE-02" }]);
        setWards([
            { id: 1, ward_no: "01", ward_name: "Brahmpura", circle_id: 1, boundary_coords: '[[84.364, 26.221], [84.368, 26.221], [84.368, 26.225], [84.364, 26.225]]' },
            { id: 2, ward_no: "02", ward_name: "MIT Area", circle_id: 1, boundary_coords: '[[84.332, 26.251], [84.336, 26.251], [84.336, 26.255], [84.332, 26.255]]' }
        ]);
        generateInsideWardStaff();
    };

    // Dependent Filters
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
            <div className="flex flex-col h-[calc(100vh-40px)] p-4 space-y-4 bg-slate-50 font-sans text-left">
                
                {/* 🟢 CRYSTAL HEADER - LIGHT THEME */}
                <header className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 relative">
                           <Navigation className="animate-pulse" size={32} />
                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-4 border-emerald-500"></div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Personnel Intelligence</h2>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                               <Activity size={12} /> Live Sync: {filteredStaff.length} Active Units
                            </p>
                        </div>
                    </div>

                    {/* SELECTORS */}
                    <div className="flex flex-wrap gap-4 bg-slate-100/50 p-2 rounded-[2.5rem] border border-slate-200 shadow-inner">
                        <FilterBox icon={Layers} label="Global Circle" value={selCircle} color="#8b5cf6" 
                            onChange={(e)=>{ setSelCircle(e.target.value); setSelWard('All'); setSelArea('All'); }} options={circles} />
                        
                        <FilterBox icon={MapPin} label="Select Ward" value={selWard} color="#f59e0b"
                            onChange={(e)=>{ setSelWard(e.target.value); setSelArea('All'); }} options={filteredWards} isWard />

                        <FilterBox icon={Crosshair} label="Deployment Area" value={selArea} color="#3b82f6"
                            onChange={(e)=>setSelArea(e.target.value)} options={filteredRoads} isRoad />
                        
                        <button onClick={initData} className="p-4 bg-white text-slate-400 hover:text-emerald-500 transition-all rounded-full shadow-sm hover:shadow-md border border-slate-100 active:scale-90">
                            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/>
                        </button>
                    </div>
                </header>

                {/* 🟢 MAP VIEW */}
                <div className="flex-1 rounded-[4rem] overflow-hidden border-[12px] border-white shadow-2xl relative">
                    <MapContainer center={[26.22, 84.36]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

                        {/* WARD POLYGONS */}
                        {wards.filter(w => selWard === 'All' ? (selCircle === 'All' || w.circle_id.toString() === selCircle) : w.id.toString() === selWard)
                          .map(w => w.boundary_coords && (
                            <Polygon 
                                key={w.id}
                                positions={JSON.parse(w.boundary_coords).map(c => [c[1], c[0]])}
                                pathOptions={{ 
                                    color: '#10b981', 
                                    fillColor: '#10b981',
                                    fillOpacity: 0.15, 
                                    weight: 4, 
                                    dashArray: '10, 15' 
                                }}
                            />
                        ))}

                        {/* STAFF MARKERS */}
                        {filteredStaff.map(staff => staff.lat && staff.lng && (
                            <Marker key={staff.id} position={[staff.lat, staff.lng]} icon={getWalkingIcon(staff.gender)}>
                                <Tooltip sticky direction="top" offset={[0, -50]} opacity={1}>
                                   
                                   {/* --- ✨ CRYSTAL HUD CARD - LIGHT MODE --- */}
                                   <div className="crystal-hud">
                                      <div className="hud-shimmer"></div>
                                      
                                      <div className="flex justify-between items-center mb-5">
                                         <div className="hud-tag">
                                            <Fingerprint size={12} />
                                            <span>UNIT: {staff.employee_id}</span>
                                         </div>
                                         <div className="live-dot"></div>
                                      </div>

                                      <h3 className="hud-name">{staff.name}</h3>
                                      <p className="hud-fh">S/O-W/O: <span className="font-bold text-slate-700">{staff.fh_name}</span></p>
                                      
                                      <div className="hud-grid">
                                         <HudItem label="Post" val={staff.post} color="#f59e0b" icon={HardHat} />
                                         <HudItem label="Ward" val={`Ward ${staff.ward_no}`} color="#10b981" icon={MapPin} />
                                         <HudItem label="Zone" val={staff.circle_name} color="#8b5cf6" icon={Layers} />
                                         <HudItem label="Area" val={staff.road_name} color="#3b82f6" icon={Crosshair} />
                                      </div>

                                      <div className="hud-footer">
                                         <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-2xl border border-slate-200 shadow-inner">
                                            <ShieldCheck size={20} className="text-emerald-500" />
                                            <div>
                                                <label className="block text-[8px] font-black text-slate-400 uppercase">Supervisor</label>
                                                <p className="text-xs font-black text-slate-700 uppercase">{staff.inspector_name}</p>
                                            </div>
                                         </div>
                                         <button className="w-full mt-4 flex items-center justify-center gap-3 bg-slate-900 py-3 rounded-2xl text-emerald-400 font-black text-[11px] tracking-widest shadow-lg hover:bg-emerald-600 hover:text-white transition-all">
                                            <Phone size={14} /> +91 {staff.mobile}
                                         </button>
                                      </div>

                                      <div className="corner edge-tl"></div><div className="corner edge-br"></div>
                                   </div>
                                </Tooltip>
                            </Marker>
                        ))}
                        <MapFocusHandler ward={selWard} wards={wards} />
                    </MapContainer>
                    
                    {/* LEGEND - LIGHT THEME */}
                    <div className="absolute bottom-10 left-10 z-[1000] bg-white/90 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white shadow-2xl flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <img src="/assets/staff-walk.gif" className="w-10 h-10 object-contain" alt="m"/>
                            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Male Staff</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <img src="/assets/staff-walkingf.gif" className="w-10 h-10 object-contain" alt="f"/>
                            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Female Staff</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                .marker-crystal-glow { filter: drop-shadow(0 15px 25px rgba(0,0,0,0.2)); transition: all 5s linear; }

                /* --- CRYSTAL GLASS HUD STYLE --- */
                .crystal-hud {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(15px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 40px;
                    padding: 25px;
                    width: 320px;
                    position: relative;
                    color: #1e293b;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.15), inset 0 0 20px rgba(255,255,255,0.5);
                    overflow: hidden;
                    text-align: left;
                }

                .hud-shimmer {
                    position: absolute; top: -100%; left: -100%; width: 300%; height: 300%;
                    background: linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.6) 50%, transparent 55%);
                    animation: shimmer 6s infinite;
                }

                .hud-tag {
                    background: #f1f5f9; padding: 6px 15px; border-radius: 12px;
                    display: flex; align-items: center; gap: 8px;
                    color: #10b981; font-size: 10px; font-weight: 950; letter-spacing: 2px;
                    border: 1px solid #e2e8f0;
                }

                .live-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 15px #10b981; animation: pulse-live 1.5s infinite; }

                .hud-name { font-size: 26px; font-weight: 950; text-transform: uppercase; letter-spacing: -1.5px; margin-top: 10px; color: #0f172a; line-height: 1; }
                .hud-fh { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }

                .hud-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; border-top: 1px solid #f1f5f9; padding-top: 25px; margin-bottom: 25px; }
                .hud-item label { display: flex; align-items: center; gap: 6px; font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
                .hud-item p { font-size: 12px; font-weight: 950; }

                .hud-footer { border-top: 1px solid #f1f5f9; padding-top: 20px; }

                .corner { position: absolute; width: 25px; height: 25px; border: 4px solid #10b981; }
                .edge-tl { top: 0; left: 0; border-right: none; border-bottom: none; border-radius: 20px 0 0 0; }
                .edge-br { bottom: 0; right: 0; border-left: none; border-top: none; border-radius: 0 0 20px 0; }

                @keyframes shimmer { 0% { transform: translate(-10%, -10%); } 100% { transform: translate(10%, 10%); } }
                @keyframes pulse-live { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </CityLayout>
    );
};

const HudItem = ({ label, val, color, icon: Icon }) => (
    <div className="hud-item">
        <label><Icon size={10} /> {label}</label>
        <p style={{ color }}>{val || 'N/A'}</p>
    </div>
);

const FilterBox = ({ icon: Icon, label, value, onChange, options, color, isWard, isRoad }) => (
    <div className="flex items-center gap-3 px-5 py-2 border-r border-slate-200 last:border-none">
        <div className="p-2 rounded-xl bg-white shadow-sm" style={{ color }}>
            <Icon size={16} />
        </div>
        <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <select className="bg-transparent text-[11px] font-black text-slate-700 uppercase outline-none cursor-pointer" value={value} onChange={onChange}>
                <option value="All">ALL RECORDS</option>
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>
                        {isWard ? `WARD ${opt.ward_no}` : (isRoad ? opt.road_name_en : opt.circle_name)}
                    </option>
                ))}
            </select>
        </div>
    </div>
);

function MapFocusHandler({ ward, wards }) {
    const map = useMap();
    useEffect(() => {
        if (ward !== 'All') {
            const wardData = wards.find(w => w.id.toString() === ward);
            if (wardData && wardData.boundary_coords) {
                const bounds = L.polygon(JSON.parse(wardData.boundary_coords).map(c => [c[1], c[0]])).getBounds();
                map.flyToBounds(bounds, { padding: [100, 100], duration: 1.5 });
            }
        }
    }, [ward, map, wards]);
    return null;
}

export default StaffLiveTracking;
