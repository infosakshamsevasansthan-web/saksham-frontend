import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    Radio, ShieldCheck, Activity, Phone, Fingerprint, 
    MapPin, Layers, Crosshair, Navigation, HardHat, Clock, 
    Signal, BatteryMedium, Truck as TruckIcon, Gauge, Maximize2, RefreshCcw, Loader2
} from 'lucide-react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// --- 1. PRO TRUCK GIF ICON ---
const getTruckIcon = () => {
    return new L.Icon({
        iconUrl: '/assets/truck-icon.gif', 
        iconSize: [85, 65],
        iconAnchor: [42, 60],
        className: 'vehicle-neon-glow'
    });
};

const VehicleTracking = () => {
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    // --- DATA STATES ---
    const [circles, setCircles] = useState([]);
    const [wards, setWards] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FILTER STATES ---
    const [selCircle, setSelCircle] = useState('All');
    const [selWard, setSelWard] = useState('All');
    const [selVehicle, setSelVehicle] = useState('All');

    useEffect(() => {
        initData();
        const interval = setInterval(fetchLiveVehicles, 5000); // 5 Sec GPS Sync
        return () => clearInterval(interval);
    }, [tenantId]);

    const initData = async () => {
        setLoading(true);
        try {
            const [circRes, wardRes] = await Promise.all([
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`),
                axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`)
            ]);
            setCircles(circRes.data.data || []);
            setWards(wardRes.data.data || []);
            await fetchLiveVehicles();
        } catch (err) { 
            console.error("Using fail-safe simulation data...");
            injectMasterDummy();
        } finally { setLoading(false); }
    };

    const fetchLiveVehicles = async () => {
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/routes/status/${tenantId}`);
            if(res.data.success && res.data.data?.length > 0) {
                setVehicles(res.data.data);
            } else { generateCalibratedFleet(); }
        } catch (err) { generateCalibratedFleet(); }
    };

    // --- DUMMY LOGIC: Strictly Inside Boundary ---
    const generateCalibratedFleet = () => {
        const dummyFleet = [
            { 
                id: 1, vehicle_no: "BR06-DS-9773", driver_name: "Rahul Kumar", 
                employee_id: "SAK-DRV-001", mobile: "9876543210", fh_name: "R.P. Singh",
                ward_no: "01", ward_id: 101, circle_id: 1, circle_name: "NORTH ZONE", 
                inspector_name: "Vikas Ji", lat: 25.5945, lng: 85.1275, 
                post: "Heavy Driver", battery: 78, signal: 'Strong', status: 'On-Duty'
            },
            { 
                id: 2, vehicle_no: "BR01-CL-1225", driver_name: "Sanjeev Sahni", 
                employee_id: "SAK-DRV-442", mobile: "8877665544", fh_name: "M.L. Sahni",
                ward_no: "02", ward_id: 102, circle_id: 2, circle_name: "SOUTH ZONE", 
                inspector_name: "Rakesh Prasad", lat: 25.6012, lng: 85.1355, 
                post: "Compactor Pilot", battery: 15, signal: 'Weak', status: 'Diverted'
            }
        ];
        setVehicles(dummyFleet);
    };

    const injectMasterDummy = () => {
        setCircles([{ id: 1, circle_name: "NORTH ZONE" }, { id: 2, circle_name: "SOUTH ZONE" }]);
        setWards([
            { id: 101, ward_no: "01", circle_id: 1, boundary_coords: '[[85.12, 25.59], [85.14, 25.59], [85.14, 25.61], [85.12, 25.61]]' },
            { id: 102, ward_no: "02", circle_id: 2, boundary_coords: '[[85.13, 25.60], [85.15, 25.60], [85.15, 25.62], [85.13, 25.62]]' }
        ]);
        generateCalibratedFleet();
    };

    // --- FILTER ENGINE ---
    const filteredWards = useMemo(() => selCircle === 'All' ? wards : wards.filter(w => w.circle_id.toString() === selCircle), [selCircle, wards]);
    const filteredFleet = useMemo(() => {
        return vehicles.filter(v => {
            const cMatch = selCircle === 'All' || v.circle_id?.toString() === selCircle;
            const wMatch = selWard === 'All' || v.ward_id?.toString() === selWard;
            const vMatch = selVehicle === 'All' || v.vehicle_no === selVehicle;
            return cMatch && wMatch && vMatch;
        });
    }, [vehicles, selCircle, selWard, selVehicle]);

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="flex flex-col h-[calc(100vh-40px)] p-4 space-y-4 bg-slate-50 font-sans text-left">
                
                {/* 🟢 TOP GLASS COMMAND BAR */}
                <header className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-emerald-400 shadow-2xl relative group cursor-pointer">
                           <TruckIcon className="group-hover:translate-x-1 transition-transform" size={32} />
                           <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-ping"></div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Fleet Intelligence</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                    <Activity size={10} /> Active Units: {filteredFleet.length}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">GPS Telematics Live</span>
                            </div>
                        </div>
                    </div>

                    {/* --- DEPENDENT DROP-DOWNS --- */}
                    <div className="flex flex-wrap gap-4 bg-slate-100/50 p-2 rounded-[2.5rem] border border-slate-200 shadow-inner">
                        <FilterBox icon={Layers} label="Zone / Circle" value={selCircle} color="#8b5cf6" 
                            onChange={(e)=>{ setSelCircle(e.target.value); setSelWard('All'); setSelVehicle('All'); }} options={circles} />
                        
                        <FilterBox icon={MapPin} label="Assigned Ward" value={selWard} color="#f59e0b"
                            onChange={(e)=>{ setSelWard(e.target.value); setSelVehicle('All'); }} options={filteredWards} isWard />

                        <FilterBox icon={Gauge} label="SWM Vehicle" value={selVehicle} color="#3b82f6"
                            onChange={(e)=>setSelVehicle(e.target.value)} options={filteredFleet} isVehicle />
                        
                        <button onClick={initData} className="p-4 bg-white text-slate-400 hover:text-emerald-500 transition-all rounded-full border border-slate-100 shadow-sm active:scale-90">
                            {loading ? <Loader2 className="animate-spin" size={18}/> : <RefreshCcw size={18}/>}
                        </button>
                    </div>
                </header>

                {/* 🟢 MAP ENGINE */}
                <div className="flex-1 rounded-[4rem] overflow-hidden border-[12px] border-white shadow-2xl relative group">
                    <MapContainer center={[25.594, 85.127]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

                        {/* WARD POLYGONS */}
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

                        {/* VEHICLE MARKERS & GLASS HUD */}
                        {filteredFleet.map(v => v.lat && v.lng && (
                            <Marker key={v.id} position={[v.lat, v.lng]} icon={getTruckIcon()}>
                                <Tooltip sticky direction="top" offset={[0, -40]} opacity={1}>
                                   
                                   {/* --- ✨ CRYSTAL CLEAR GLASS HUD --- */}
                                   <div className="crystal-hud">
                                      <div className="hud-shimmer"></div>
                                      
                                      <div className="flex justify-between items-center mb-6">
                                         <div className="hud-id-tag">
                                            <Fingerprint size={12} className="text-sky-500" />
                                            <span>REG: {v.vehicle_no}</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                            <BatteryMedium size={14} className={v.battery < 20 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'} />
                                            <Signal size={14} className="text-blue-400" />
                                         </div>
                                      </div>

                                      <h3 className="hud-name-text">{v.driver_name}</h3>
                                      <p className="hud-parent-text">S/O: <span className="font-bold text-slate-700">{v.fh_name}</span></p>
                                      
                                      <div className="hud-info-grid">
                                         <HudDetail label="Pilot Role" val={v.post} color="#f59e0b" icon={HardHat} />
                                         <HudDetail label="Deployment" val={`Ward ${v.ward_no}`} color="#10b981" icon={MapPin} />
                                         <HudDetail label="Emp ID" val={v.employee_id} color="#a78bfa" icon={Fingerprint} />
                                         <HudDetail label="Live Status" val={v.status} color={v.status === 'Diverted' ? '#f43f5e' : '#3b82f6'} icon={Activity} />
                                      </div>

                                      <div className="hud-footer-action">
                                         <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-inner">
                                            <ShieldCheck size={22} className="text-emerald-500" />
                                            <div>
                                                <label className="block text-[8px] font-black text-slate-400 uppercase">Hierarchy Lead</label>
                                                <p className="text-xs font-black text-slate-700 uppercase">{v.inspector_name || 'Admin'}</p>
                                            </div>
                                         </div>
                                         <button className="w-full mt-4 flex items-center justify-center gap-3 bg-slate-900 py-4 rounded-2xl text-emerald-400 font-black text-[11px] tracking-[0.2em] shadow-xl hover:bg-emerald-600 hover:text-white transition-all">
                                            <Phone size={14} /> +91 {v.mobile}
                                         </button>
                                      </div>

                                      <div className="edge edge-tl"></div><div className="edge edge-br"></div>
                                   </div>
                                </Tooltip>
                            </Marker>
                        ))}

                        <MapFocusHandler ward={selWard} wards={wards} />
                    </MapContainer>
                    
                    {/* --- 🛠️ MAP OVERLAYS --- */}
                    <div className="absolute bottom-10 left-10 z-[1000] bg-white/90 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white shadow-2xl flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <img src="/assets/truck-icon.gif" className="w-12 h-10 object-contain" alt="v"/>
                            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest italic">Live Fleet Unit</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                .vehicle-neon-glow { filter: drop-shadow(0 15px 25px rgba(0, 247, 255, 0.4)); transition: all 5s linear; }
                .polygon-glow { filter: drop-shadow(0 0 10px rgba(0, 247, 255, 0.3)); }

                /* --- ULTIMATE CRYSTAL GLASS HUD --- */
                .crystal-hud {
                    background: rgba(255, 255, 255, 0.82);
                    backdrop-filter: blur(25px) saturate(200%);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    border-radius: 45px;
                    padding: 30px;
                    width: 340px;
                    position: relative;
                    color: #1e293b;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.12), inset 0 0 30px rgba(255,255,255,0.5);
                    overflow: hidden;
                }

                .hud-shimmer {
                    position: absolute; top: -100%; left: -100%; width: 300%; height: 300%;
                    background: linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.7) 50%, transparent 55%);
                    animation: glass-shimmer 8s infinite;
                }

                .hud-id-tag {
                    background: #f1f5f9; padding: 6px 16px; border-radius: 14px;
                    display: flex; align-items: center; gap: 10px;
                    color: #3b82f6; font-size: 10px; font-weight: 950; letter-spacing: 2px;
                    border: 1px solid #e2e8f0;
                }

                .active-glow { width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 15px #10b981; animation: h-pulse 1.5s infinite; }

                .hud-name-text { font-size: 28px; font-weight: 950; text-transform: uppercase; letter-spacing: -1.5px; margin-top: 15px; color: #0f172a; line-height: 1; }
                .hud-parent-text { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }

                .hud-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-top: 1px solid #f1f5f9; padding-top: 25px; margin-bottom: 25px; }
                .hud-detail-cell label { display: flex; align-items: center; gap: 6px; font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; }
                .hud-detail-cell p { font-size: 12px; font-weight: 950; }

                .hud-footer-action { border-top: 1px solid #f1f5f9; padding-top: 20px; }

                .edge { position: absolute; width: 35px; height: 35px; border: 5px solid #10b981; }
                .edge-tl { top: 0; left: 0; border-right: none; border-bottom: none; border-radius: 30px 0 0 0; }
                .edge-br { bottom: 0; right: 0; border-left: none; border-top: none; border-radius: 0 0 30px 0; }

                @keyframes glass-shimmer { 0% { transform: translate(-15%, -15%); } 100% { transform: translate(15%, 15%); } }
                @keyframes h-pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </CityLayout>
    );
};

// --- ✨ High-End HUD Detail Row ---
const HudDetail = ({ label, val, color, icon: Icon }) => (
    <div className="hud-detail-cell">
        <label><Icon size={10} /> {label}</label>
        <p style={{ color }}>{val || 'N/A'}</p>
    </div>
);

// --- ✨ Modern Dropdown Filter ---
const FilterBox = ({ icon: Icon, label, value, onChange, options, color, isWard, isVehicle }) => (
    <div className="flex items-center gap-4 px-6 py-2 border-r border-slate-200 last:border-none">
        <div className="p-2.5 rounded-2xl bg-white shadow-sm" style={{ color }}>
            <Icon size={20} />
        </div>
        <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <select className="bg-transparent text-[11px] font-black text-slate-700 uppercase outline-none cursor-pointer" value={value} onChange={onChange}>
                <option value="All">ALL RECORDS</option>
                {options.map(opt => (
                    <option key={opt.id} value={isVehicle ? opt.vehicle_no : opt.id}>
                        {isWard ? `WARD ${opt.ward_no}` : (isVehicle ? opt.vehicle_no : opt.circle_name)}
                    </option>
                ))}
            </select>
        </div>
    </div>
);

// --- ✨ Smooth Map Flying Logic ---
function MapFocusHandler({ ward, wards }) {
    const map = useMap();
    useEffect(() => {
        if (ward !== 'All') {
            const wardData = wards.find(w => w.id.toString() === ward);
            if (wardData && wardData.boundary_coords) {
                try {
                    const bounds = L.polygon(JSON.parse(wardData.boundary_coords).map(c => [c[1], c[0]])).getBounds();
                    map.flyToBounds(bounds, { padding: [150, 150], duration: 2 });
                } catch (e) { console.error("Boundary Mapping Fail"); }
            }
        }
    }, [ward, map, wards]);
    return null;
}

export default VehicleTracking;
