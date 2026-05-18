import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Radio, ShieldCheck, Activity, Phone, User, Fingerprint, MapPin, Layers, Crosshair, Users } from 'lucide-react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import axios from 'axios';

// --- 1. PRO GENDER BASED GIF ICONS ---
const getWalkingIcon = (gender) => {
    const g = gender ? gender.toLowerCase() : 'male';
    const iconUrl = g === 'female' 
        ? '/assets/staff-walkingf.gif' 
        : '/assets/staff-walking.gif';

    return new L.Icon({
        iconUrl: iconUrl,
        iconSize: [70, 70],
        iconAnchor: [35, 65],
        className: 'smooth-marker-move'
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
            // APIs matching your backend dump
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
            console.error("Initialization failed, using dummy data...");
            injectDummyData();
        } finally { setLoading(false); }
    };

    const fetchLiveStaff = async () => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/live-staff-tracking/${tenantId}`);
            if(res.data.data && res.data.data.length > 0) {
                setAllStaff(res.data.data);
            } else {
                injectDummyStaff(); // Testing ke liye agar DB khali ho
            }
        } catch (err) { injectDummyStaff(); }
    };

    // --- LOGIC: Dependent Data ---
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

    // --- DUMMY DATA INJECTION (FOR TESTING) ---
    const injectDummyData = () => {
        setCircles([{ id: 1, circle_name: "Circle 01" }, { id: 2, circle_name: "Circle 02" }]);
        setWards([
            { id: 101, ward_no: "01", ward_name: "Brahmpura", circle_id: 1, boundary_coords: '[[84.35, 26.21], [84.38, 26.21], [84.38, 26.24], [84.35, 26.24]]' },
            { id: 102, ward_no: "02", ward_name: "MIT Area", circle_id: 1, boundary_coords: '[[84.32, 26.24], [84.34, 26.24], [84.34, 26.26], [84.32, 26.26]]' }
        ]);
        setRoads([
            { id: 501, road_name_en: "Main Market Road", ward_id: 101 },
            { id: 502, road_name_en: "Station Gali", ward_id: 101 }
        ]);
        injectDummyStaff();
    };

    const injectDummyStaff = () => {
        setAllStaff([
            { 
                id: 1, name: "Kundan Kumar", gender: "male", fh_name: "Rajesh Singh", 
                employee_id: "EMP101", mobile: "9876543210", 
                ward_id: 101, ward_no: "01", circle_id: 1, road_id: 501, road_name: "Main Market Road",
                inspector_name: "Amit Sharma", lat: 26.225 + (Math.random() * 0.005), lng: 84.365 + (Math.random() * 0.005)
            },
            { 
                id: 2, name: "Suman Devi", gender: "female", fh_name: "Late Suresh Pal", 
                employee_id: "EMP105", mobile: "8877665544", 
                ward_id: 102, ward_no: "02", circle_id: 1, road_id: 0, road_name: "Hospital Road",
                inspector_name: "Vijay Kumar", lat: 26.250 + (Math.random() * 0.005), lng: 84.335 + (Math.random() * 0.005)
            }
        ]);
    };

    return (
        <CityLayout>
            <div className="flex flex-col h-[calc(100vh-40px)] p-4 space-y-4 bg-slate-50 font-sans">
                
                {/* 🟢 TOP CONTROL HUB */}
                <header className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg relative">
                           <Radio className="animate-pulse" size={28} />
                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase italic leading-none">Personnel Intelligence</h2>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                               <Activity size={12} /> Live Deployed: {filteredStaff.length} Units
                            </p>
                        </div>
                    </div>

                    {/* 🟢 HIERARCHICAL DROPDOWNS */}
                    <div className="flex flex-wrap gap-3 bg-slate-50 p-2 rounded-[2rem] border border-slate-200">
                        {/* 1. Circle */}
                        <div className="flex items-center gap-2 px-4 border-r border-slate-200">
                            <Layers size={14} className="text-slate-400" />
                            <select className="bg-transparent text-[11px] font-black uppercase text-slate-700 outline-none cursor-pointer" 
                                value={selCircle} onChange={(e)=>{ setSelCircle(e.target.value); setSelWard('All'); setSelArea('All'); }}>
                                <option value="All">All Circles</option>
                                {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                            </select>
                        </div>

                        {/* 2. Ward */}
                        <div className="flex items-center gap-2 px-4 border-r border-slate-200">
                            <MapPin size={14} className="text-slate-400" />
                            <select className="bg-transparent text-[11px] font-black uppercase text-slate-700 outline-none cursor-pointer min-w-[100px]"
                                value={selWard} onChange={(e)=>{ setSelWard(e.target.value); setSelArea('All'); }}>
                                <option value="All">All Wards</option>
                                {filteredWards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no}</option>)}
                            </select>
                        </div>

                        {/* 3. Area (Road) */}
                        <div className="flex items-center gap-2 px-4">
                            <Crosshair size={14} className="text-slate-400" />
                            <select className="bg-transparent text-[11px] font-black uppercase text-slate-700 outline-none cursor-pointer min-w-[150px]"
                                value={selArea} onChange={(e)=>setSelArea(e.target.value)}>
                                <option value="All">Select Deployed Area</option>
                                {filteredRoads.map(r => <option key={r.id} value={r.id}>{r.road_name_en}</option>)}
                            </select>
                        </div>
                    </div>
                </header>

                {/* 🟢 MAP VIEW */}
                <div className="flex-1 rounded-[3.5rem] overflow-hidden border-[12px] border-white shadow-2xl relative group">
                    <MapContainer center={[26.22, 84.36]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

                        {/* Ward Boundaries */}
                        {wards.filter(w => selWard === 'All' ? (selCircle === 'All' || w.circle_id.toString() === selCircle) : w.id.toString() === selWard)
                          .map(w => w.boundary_coords && (
                            <Polygon 
                                key={w.id}
                                positions={JSON.parse(w.boundary_coords).map(c => [c[1], c[0]])}
                                pathOptions={{ 
                                    color: selWard === 'All' ? '#ffffff' : '#10b981', 
                                    fillOpacity: 0.05, 
                                    weight: 2, 
                                    dashArray: '5, 10' 
                                }}
                            />
                        ))}

                        {/* Staff Markers */}
                        {filteredStaff.map(staff => (
                            <Marker key={staff.id} position={[staff.lat, staff.lng]} icon={getWalkingIcon(staff.gender)}>
                                <Tooltip sticky direction="top" offset={[0, -40]} opacity={1}>
                                   
                                   {/* --- ✨ Sleek Glass HUD Card --- */}
                                   <div className="hud-projection">
                                      <div className="hud-scan-line"></div>
                                      
                                      <div className="flex justify-between items-center mb-4">
                                         <div className="hud-badge">
                                            <Fingerprint size={12} />
                                            <span>{staff.employee_id}</span>
                                         </div>
                                         <div className="hud-pulse"></div>
                                      </div>

                                      <h3 className="hud-title">{staff.name}</h3>
                                      <p className="hud-subtitle">F/H: {staff.fh_name}</p>
                                      
                                      <div className="hud-info-grid">
                                         <div className="hud-cell">
                                            <label>Designation</label>
                                            <p>{staff.post || 'Field Agent'}</p>
                                         </div>
                                         <div className="hud-cell">
                                            <label>Ward / Area</label>
                                            <p>W-{staff.ward_no} / {staff.road_name || 'Mobile'}</p>
                                         </div>
                                         <div className="hud-cell">
                                            <label>Inspector</label>
                                            <p>{staff.inspector_name || 'N/A'}</p>
                                         </div>
                                         <div className="hud-cell">
                                            <label>Mobile</label>
                                            <p className="text-emerald-400">{staff.mobile}</p>
                                         </div>
                                      </div>

                                      <div className="hud-corner-tl"></div>
                                      <div className="hud-corner-br"></div>
                                   </div>
                                </Tooltip>
                            </Marker>
                        ))}

                        <MapFocusHandler circle={selCircle} ward={selWard} area={selArea} wards={wards} />
                    </MapContainer>
                    
                    {/* Map Legend/Overlay */}
                    <div className="absolute bottom-10 left-10 z-[1000] flex flex-col gap-3">
                         <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white shadow-xl flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <img src="/assets/staff-walking.gif" className="w-8 h-8" alt="m"/>
                                <span className="text-[10px] font-black uppercase text-slate-600">Male Staff</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <div className="flex items-center gap-2">
                                <img src="/assets/staff-walkingf.gif" className="w-8 h-8" alt="f"/>
                                <span className="text-[10px] font-black uppercase text-slate-600">Female Staff</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <style>{`
                .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                
                /* Smooth transition for marker movements */
                .smooth-marker-move { 
                    transition: all 5s linear; 
                    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.3));
                }

                /* PRO HUD CARD DESIGN */
                .hud-projection {
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 28px;
                    padding: 24px;
                    width: 300px;
                    position: relative;
                    color: white;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.6), inset 0 0 20px rgba(16, 185, 129, 0.1);
                    overflow: hidden;
                }

                .hud-scan-line {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.05), transparent);
                    background-size: 100% 4px;
                    pointer-events: none;
                }

                .hud-badge { 
                    background: rgba(16, 185, 129, 0.15);
                    padding: 4px 12px;
                    border-radius: 10px;
                    display: flex; align-items: center; gap: 8px;
                    color: #10b981; font-size: 10px; font-weight: 900; letter-spacing: 1.5px;
                }

                .hud-pulse { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 15px #10b981; animation: radar-pulse 1.5s infinite; }

                .hud-title { font-size: 24px; font-weight: 950; text-transform: uppercase; margin-bottom: 2px; letter-spacing: -1px; }
                .hud-subtitle { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 20px; }

                .hud-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
                .hud-cell label { display: block; font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
                .hud-cell p { font-size: 11px; font-weight: 800; color: #f1f5f9; }

                .hud-corner-tl { position: absolute; top: 0; left: 0; width: 25px; height: 25px; border-top: 4px solid #10b981; border-left: 4px solid #10b981; border-radius: 15px 0 0 0; }
                .hud-corner-br { position: absolute; bottom: 0; right: 0; width: 25px; height: 25px; border-bottom: 4px solid #10b981; border-right: 4px solid #10b981; border-radius: 0 0 15px 0; }

                @keyframes radar-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </CityLayout>
    );
};

// --- MAP FOCUS LOGIC ---
function MapFocusHandler({ circle, ward, area, wards }) {
    const map = useMap();
    useEffect(() => {
        if (ward !== 'All') {
            const wardData = wards.find(w => w.id.toString() === ward);
            if (wardData && wardData.boundary_coords) {
                const coords = JSON.parse(wardData.boundary_coords);
                const bounds = L.polygon(coords.map(c => [c[1], c[0]])).getBounds();
                map.flyToBounds(bounds, { padding: [100, 100], duration: 1.5 });
            }
        } else if (circle !== 'All') {
            // Focus on first ward of circle as approximation if no circle geometry exists
            const circleWards = wards.filter(w => w.circle_id.toString() === circle);
            if(circleWards.length > 0 && circleWards[0].boundary_coords) {
                const coords = JSON.parse(circleWards[0].boundary_coords);
                map.flyTo([coords[0][1], coords[0][0]], 14, { duration: 2 });
            }
        } else {
            map.flyTo([26.22, 84.36], 13, { duration: 1 }); // Default city view
        }
    }, [circle, ward, area, map, wards]);
    return null;
}

export default StaffLiveTracking;
