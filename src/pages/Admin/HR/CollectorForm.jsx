import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import { X, Map as MapIcon, Save, MousePointer2 } from 'lucide-react';
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CollectorForm = ({ staff, onClose }) => {
    const [circles, setCircles] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedWard, setSelectedWard] = useState(null);
    const [drawnArea, setDrawnArea] = useState(null);
    const tenantId = localStorage.getItem('tenantId');

    useEffect(() => {
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/circles/${tenantId}`).then(res => setCircles(res.data.data));
    }, []);

    const fetchWards = (cid) => {
        axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards-by-circle/${tenantId}/${cid}`).then(res => setWards(res.data.data));
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border-4 border-white">
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <MapIcon className="text-emerald-400" size={32} />
                        <div>
                            <h2 className="text-xl font-black uppercase italic">D2D Area Mapping</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collector: {staff.full_name_en}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all"><X size={28}/></button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Controls */}
                    <div className="w-80 p-8 space-y-6 bg-slate-50 border-r border-slate-100 overflow-y-auto">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">1. Choose Circle</label>
                            <select className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-bold" onChange={(e) => fetchWards(e.target.value)}>
                                <option value="">Select Circle</option>
                                {circles.map(c => <option key={c.id} value={c.id}>{c.circle_name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">2. Select Ward</label>
                            <select className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-bold" onChange={(e) => setSelectedWard(wards.find(w => w.id == e.target.value))}>
                                <option value="">Select Ward</option>
                                {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no}</option>)}
                            </select>
                        </div>

                        <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-3">
                            <MousePointer2 className="text-emerald-600 mt-1" size={18}/>
                            <p className="text-[10px] font-bold text-emerald-800 uppercase leading-relaxed">
                                Ward select karne ke baad map focus hoga. Right side toolbar se boundary draw karein.
                            </p>
                        </div>

                        <button className="w-full p-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-600 transition-all">
                           Establish Mapping
                        </button>
                    </div>

                    {/* Interactive Map */}
                    <div className="flex-1 relative bg-slate-200">
                        <MapContainer center={[26.22, 84.36]} zoom={14} style={{ height: "100%", width: "100%" }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {selectedWard?.boundary_coords && (
                                <Polygon positions={JSON.parse(selectedWard.boundary_coords).map(c => [c[1], c[0]])} pathOptions={{ color: '#10b981', fillOpacity: 0.2 }} />
                            )}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
export default CollectorForm;
