import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    Radio, ShieldCheck, Activity, Phone, User, Fingerprint, 
    MapPin, Layers, Crosshair, Users, HardHat, Info 
} from 'lucide-react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import axios from 'axios';

// --- 1. PRO GENDER BASED GIF ICONS ---
const getWalkingIcon = (gender) => {
    const g = gender ? gender.toLowerCase() : 'male';
    const iconUrl = g === 'female' 
        ? '/assets/staff-walkingf.gif' 
        : '/assets/staff-walk.gif';

    return new L.Icon({
        iconUrl: iconUrl,
        iconSize: [80, 80],
        iconAnchor: [40, 70],
        className: 'marker-glow-effect'
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

    // Dropdown States
    const [selCircle, setSelCircle] = useState('All');
    const [selWard, setSelWard] = useState('All');
    const [selArea, setSelArea] = useState('All');

    useEffect(() => {
        initData();
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
            injectDummyData();
        } finally { setLoading(false); }
    };

    const fetchLiveStaff = async () => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/live-staff-tracking/${tenantId}`);
            if(res.data.data?.length > 0) setAllStaff(res.data.data);
            else generateDummyStaff();
        } catch (err) { generateDummyStaff(); }
    };

    // --- LOGIC: Dependent Filtering ---
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

    // --- DUMMY DATA FOR TESTING ---
    const injectDummyData = () => {
        setCircles([{ id: 1, circle_name: "CIRCLE NORTH" }, { id: 2, circle_name: "CIRCLE SOUTH" }]);
        setWards([
            { id: 101, ward_no: "01", ward_name: "Brahmpura", circle_id: 1, boundary_coords: '[[84.35, 26.21], [84.38, 26.21], [84.38, 26.24], [84.35, 26.24]]' },
            { id: 102, ward_no: "02", ward_name: "MIT Area", circle_id: 1, boundary_coords: '[[84.32, 26.24], [84.34, 26.24], [84.34, 26.26], [84.32, 26.26]]' }
        ]);
        setRoads([{ id: 501, road_name_en: "Main Market Road", ward_id: 101 }]);
        generateDummyStaff();
    };

    const generateDummyStaff = () => {
        setAllStaff([
            { 
                id: 1, name: "Kundan Kumar", gender: "male", fh_name: "Rajesh Singh", 
                employee_id: "EMP-9901", mobile: "9876543210", 
                ward_id: 101, ward_no: "01", circle_id: 1, circle_name: "CIRCLE NORTH", road_name: "Main Market Road",
                inspector_name: "Amit Sharma", lat: 26.221, lng: 84.364, post: "Sanitation Staff"
            },
            { 
                id: 2, name: "Suman Kumari", gender: "female", fh_name: "Late Sunil Pal", 
                employee_id: "EMP-8842", mobile: "8877665544", 
                ward_id: 102, ward_no: "02", circle_id: 1, circle_name: "CIRCLE NORTH", road_name: "MIT Hospital Road",
                inspector_name: "Vijay Singh", lat: 26.252, lng: 84.332, post: "D2D Collector"
            }
        ]);
    };

    return (
        <CityLayout>
            <div className="flex flex-col h-[calc(100vh-40px)] p-4 space-y-4 bg-slate-900 font-sans">
                
                {/* 🟢 TOP GLASS NAVIGATION */}
                <header className="bg-white/10 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                           <Radio className="animate-pulse" size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Live Unit Command</h2>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                               <Activity size={12} /> Active Agents: {filteredStaff.length}
                            </p>
                        </div>
                    </div>

                    {/* 🟢 DEPENDENT SELECTORS */}
                    <div className="flex flex-wrap gap-3 bg-black/40 p-2 rounded-[2rem] border border-white/10">
                        <div className="flex items-center gap-2 px-4 border-r border-white/10">
                            <Layers size={14} className="text-emerald-400" />
                            <select className="bg-transparent text-[11px] font-black uppercase text-emerald-100 outline-none cursor-pointer" 
                                value={selCircle} onChange={(e)=>{ setSelCircle(e.target.value); setSelWard('All'); setSelArea('All'); }}>
                                <option value="All">Global Circle</option>
                                {circles.map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.circle_name}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-4 border-r border-white/10">
                            <MapPin size={14} className="text-amber-400" />
                            <select className="bg-transparent text-[11px] font-black uppercase text-amber-100 outline-none cursor-pointer min-w-[100px]"
                                value={selWard} onChange={(e)=>{ setSelWard(e.target.value); setSelArea('All'); }}>
                                <option value="All">All Wards</option>
                                {filteredWards.map(w => <option key={w.id} value={w.id} className="bg-slate-800">Ward {w.ward_no}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-4">
                            <Crosshair size={14} className="text-sky-400" />
                            <select className="bg-transparent text-[11px] font-black uppercase text-sky-100 outline-none cursor-pointer min-w-[150px]"
                                value={selArea} onChange={(e)=>setSelArea(e.target.value)}>
                                <option value="All">Area (Roads)</option>
                                {filteredRoads.map(r => <option key={r.id} value={r.id} className="bg-slate-800">{r.road_name_en}</option>)}
                            </select>
                        </div>
                    </div>
                </header>

                {/* 🟢 MAP VIEW */}
                <div className="flex-1 rounded-[3.5rem] overflow-hidden border-[1px] border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                    <MapContainer center={[26.22, 84.36]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

                        {/* Bounday Polygons */}
                        {wards.filter(w => selWard === 'All' ? (selCircle === 'All' || w.circle_id.toString() === selCircle) : w.id.toString() === selWard)
                          .map(w => w.boundary_coords && (
                            <Polygon key={w.id} positions={JSON.parse(w.boundary_coords).map(c => [c[1], c[0]])}
                                pathOptions={{ color: '#10b981', fillOpacity: 0.1, weight: 2, dashArray: '10, 10' }} />
                        ))}

                        {/* Personnel Markers */}
                        {filteredStaff.map(staff => (
                            <Marker key={staff.id} position={[staff.lat, staff.lng]} icon={getWalkingIcon(staff.gender)}>
                                <Tooltip sticky direction="top" offset={[0, -40]} opacity={1}>
                                   
                                   {/* --- ✨ ULTIMATE TRANSPARENT GLASS HUD --- */}
                                   <div className="glass-hud">
                                      <div className="glass-scanline"></div>
                                      
                                      <div className="flex justify-between items-start mb-4">
                                         <div className="glass-id-tag">
                                            <Fingerprint size={12} className="text-sky-400" />
                                            <span>{staff.employee_id}</span>
                                         </div>
                                         <div className="glass-active-dot"></div>
                                      </div>

                                      <h3 className="glass-name">{staff.name}</h3>
                                      <p className="glass-fh-name">Parent/Spouse: <span className="text-white">{staff.fh_name}</span></p>
                                      
                                      <div className="glass-grid">
                                         <GlassItem label="Designation" icon={HardHat} val={staff.post} color="#fbbf24" />
                                         <GlassItem label="Ward" icon={MapPin} val={`Ward ${staff.ward_no}`} color="#10b981" />
                                         <GlassItem label="Area" icon={Crosshair} val={staff.road_name || 'Main City'} color="#38bdf8" />
                                         <GlassItem label="Circle" icon={Layers} val={staff.circle_name || 'Zone-A'} color="#a78bfa" />
                                      </div>

                                      <div className="glass-footer">
                                         <div className="flex items-center gap-3 bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30">
                                            <ShieldCheck size={18} className="text-emerald-400" />
                                            <div>
                                                <label className="block text-[8px] font-black text-emerald-400/60 uppercase">Ward Inspector</label>
                                                <p className="text-xs font-black text-white uppercase">{staff.inspector_name}</p>
                                            </div>
                                         </div>
                                         <div className="mt-3 flex items-center gap-2 text-sky-400 bg-sky-500/10 p-2 rounded-xl justify-center">
                                            <Phone size={12} />
                                            <span className="text-[10px] font-black tracking-widest">{staff.mobile}</span>
                                         </div>
                                      </div>

                                      <div className="edge-tl"></div><div className="edge-br"></div>
                                   </div>
                                </Tooltip>
                            </Marker>
                        ))}

                        <MapFocusHandler ward={selWard} wards={wards} />
                    </MapContainer>
                </div>
            </div>

            <style>{`
                .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                
                .marker-glow-effect { 
                    filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.6));
                    transition: transform 5s linear;
                }

                /* GLASSMORPHISM CSS */
                .glass-hud {
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(16px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 35px;
                    padding: 25px;
                    width: 320px;
                    position: relative;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05);
                    overflow: hidden;
                }

                .glass-scanline {
                    position: absolute; top: 0; left: 0; width: 100%; height: 2px;
                    background: linear-gradient(to right, transparent, #10b981, transparent);
                    animation: glass-scan 3s linear infinite;
                    opacity: 0.3;
                }

                .glass-id-tag {
                    background: rgba(56, 189, 248, 0.1);
                    padding: 5px 12px;
                    border-radius: 12px;
                    display: flex; align-items: center; gap: 8px;
                    color: #38bdf8; font-size: 11px; font-weight: 950; letter-spacing: 2px;
                    border: 1px solid rgba(56, 189, 248, 0.2);
                }

                .glass-active-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 20px #10b981; animation: glass-ping 1s infinite; }

                .glass-name { 
                    font-size: 26px; font-weight: 950; text-transform: uppercase; 
                    background: linear-gradient(to right, #fff, #94a3b8);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    letter-spacing: -1px; margin-top: 10px;
                }
                
                .glass-fh-name { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }

                .glass-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-bottom: 20px; }

                .glass-item-container { display: flex; flex-direction: column; gap: 4px; }
                .glass-item-label { display: flex; align-items: center; gap: 6px; font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; }
                .glass-item-val { font-size: 11px; font-weight: 950; }

                .glass-footer { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }

                .edge-tl { position: absolute; top: 0; left: 0; width: 30px; height: 30px; border-top: 4px solid #10b981; border-left: 4px solid #10b981; border-radius: 20px 0 0 0; }
                .edge-br { position: absolute; bottom: 0; right: 0; width: 30px; height: 30px; border-bottom: 4px solid #10b981; border-right: 4px solid #10b981; border-radius: 0 0 20px 0; }

                @keyframes glass-scan { 0% { top: -5% } 100% { top: 105% } }
                @keyframes glass-ping { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </CityLayout>
    );
};

// --- Reusable Glass Grid Item ---
const GlassItem = ({ label, icon: Icon, val, color }) => (
    <div className="glass-item-container">
        <span className="glass-item-label"><Icon size={10}/> {label}</span>
        <span className="glass-item-val" style={{ color }}>{val || 'N/A'}</span>
    </div>
);

// --- MAP FOCUS LOGIC ---
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
