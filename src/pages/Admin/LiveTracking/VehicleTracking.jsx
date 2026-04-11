import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, Users, MapPin, Phone, Info, ChevronDown } from 'lucide-react';

// --- CUSTOM TRUCK ICON (Using your GIF/Image) ---
const truckIcon = new L.Icon({
    // 1. Extension .gif rakhein
    // 2. Path hamesha / se shuru karein kyunki file public folder mein hai
    iconUrl: '/assets/truck-icon.gif', 
    iconSize: [70, 50], // Aap size yahan se adjust kar sakte hain (Ch चौड़ाई, ऊँचाई)
    iconAnchor: [35, 25],
    popupAnchor: [0, -20],
});

// Mock Ward Boundary Data (Example)
const wardBoundaries = {
    "type": "FeatureCollection",
    "features": [
        { "type": "Feature", "properties": { "wardNo": "01", "name": "Ward 01" }, "geometry": { "type": "Polygon", "coordinates": [[[85.12, 25.59], [85.14, 25.59], [85.14, 25.61], [85.12, 25.61], [85.12, 25.59]]] } }
    ]
};

const VehicleTracking = () => {
    const [selectedWard, setSelectedWard] = useState('All');
    const [selectedVehicle, setSelectedVehicle] = useState('All');
    const [vehicles, setVehicles] = useState([
        { id: 1, lat: 25.594, lng: 85.127, no: "BR01-5542", driver: "Rahul Kumar", empId: "EMP-9921", father: "S.P. Singh", post: "Driver (Heavy)", mobile: "9876543210", inspector: "Vikas Ji", insMobile: "9000011122", ward: "01" },
        { id: 2, lat: 25.600, lng: 85.135, no: "BR01-9980", driver: "Sanjeev Sahni", empId: "EMP-4432", father: "R.L. Sahni", post: "Driver (Compact)", mobile: "8877665544", inspector: "Rakesh Prasad", insMobile: "9112233445", ward: "02" }
    ]);

    // Animation Effect: Simulate Movement (Real-time GPS Sync Mockup)
    useEffect(() => {
        const interval = setInterval(() => {
            setVehicles(prev => prev.map(v => ({
                ...v,
                lat: v.lat + (Math.random() - 0.5) * 0.001, // Thoda thoda move hoga
                lng: v.lng + (Math.random() - 0.5) * 0.001
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <CityLayout>
            <div className="space-y-6 p-4">
                {/* Header & Filters */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Fleet Monitoring</h1>
                        <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mt-1">Real-time GPS Telematics</p>
                    </div>

                    <div className="flex gap-3">
                        {/* Ward Dropdown */}
                        <div className="relative group">
                            <select 
                                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-6 pr-10 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                                onChange={(e) => setSelectedWard(e.target.value)}
                            >
                                <option value="All">All Wards</option>
                                <option value="01">Ward 01</option>
                                <option value="02">Ward 02</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>

                        {/* Vehicle Dropdown */}
                        <div className="relative">
                            <select 
                                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-6 pr-10 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                                onChange={(e) => setSelectedVehicle(e.target.value)}
                            >
                                <option value="All">All Vehicles</option>
                                {vehicles.map(v => <option key={v.id} value={v.no}>{v.no}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </header>

                {/* Map Container */}
                <div className="h-[650px] w-full rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative z-0">
                    <MapContainer 
                        center={[25.594, 85.127]} 
                        zoom={14} 
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; Google Maps'
                            url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        />

                        {/* Ward Boundaries */}
                        <GeoJSON data={wardBoundaries} style={{ color: '#10b981', weight: 2, fillOpacity: 0.1 }} />

                        {/* Markers (Vehicles / Staff) */}
                        {vehicles
                            .filter(v => (selectedWard === 'All' || v.ward === selectedWard))
                            .filter(v => (selectedVehicle === 'All' || v.no === selectedVehicle))
                            .map(v => (
                                <Marker key={v.id} position={[v.lat, v.lng]} icon={truckIcon}>
                                    <Tooltip direction="top" offset={[0, -20]} opacity={1} sticky>
                                        {/* HOVER CARD UI */}
                                        <div className="p-3 w-64 bg-white rounded-xl shadow-lg border-t-4 border-emerald-500">
                                            <div className="flex justify-between items-center mb-2 border-b pb-2">
                                                <span className="font-black text-slate-800 text-sm">{v.no}</span>
                                                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">LIVE</span>
                                            </div>
                                            
                                            <div className="space-y-2 text-slate-600 text-[11px]">
                                                <div className="flex items-center gap-2"><Info size={12}/> <b>Emp ID:</b> {v.empId}</div>
                                                <div className="flex items-center gap-2"><Users size={12}/> <b>Driver:</b> {v.driver}</div>
                                                <div className="flex items-center gap-2"><Info size={12}/> <b>F/H Name:</b> {v.father}</div>
                                                <div className="flex items-center gap-2"><MapPin size={12}/> <b>Post:</b> {v.post}</div>
                                                <div className="flex items-center gap-2 text-blue-600"><Phone size={12}/> <b>Mobile:</b> {v.mobile}</div>
                                            </div>

                                            <div className="mt-3 pt-2 border-t bg-amber-50 p-2 rounded-lg">
                                                <p className="text-[10px] font-black text-amber-700 uppercase">Ward Inspector</p>
                                                <p className="text-xs font-bold text-slate-800">{v.inspector}</p>
                                                <p className="text-xs text-amber-600 font-bold">{v.insMobile}</p>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </Marker>
                            ))
                        }
                    </MapContainer>
                </div>
            </div>
        </CityLayout>
    );
};

export default VehicleTracking;