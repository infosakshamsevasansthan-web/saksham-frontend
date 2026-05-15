import React, { useState, useEffect, useRef } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { MapContainer, TileLayer, Polygon, useMap, Tooltip } from 'react-leaflet';
import { Map as MapIcon, Save, Target, FileJson, Loader2, XCircle, Eye, EyeOff } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import 'leaflet-geosearch/dist/geosearch.css';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import toGeoJSON from 'togeojson'; 
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

// 🟢 Helper Component: Dropdown badalne par Map ko zoom karne ke liye
const AutoZoomToWard = ({ selectedId, wards }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedId && wards.length > 0) {
      const targetWard = wards.find(w => String(w.id) === String(selectedId));
      if (targetWard && targetWard.boundary_coords) {
        try {
          const raw = JSON.parse(targetWard.boundary_coords);
          const latLngs = raw.map(c => [c[1], c[0]]); // Swap Lng/Lat to Lat/Lng
          const bounds = L.latLngBounds(latLngs);
          if (bounds.isValid()) {
            map.flyToBounds(bounds, { padding: [100, 100], duration: 1.5 });
          }
        } catch (err) { console.error("Zoom Error", err); }
      }
    }
  }, [selectedId, wards, map]);
  return null;
};

const WardMapping = () => {
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('');
  const [boundaryColor, setBoundaryColor] = useState('#10b981');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showBoundaries, setShowBoundaries] = useState(true); 
  const mapRef = useRef(null); 
  const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925"; 

  useEffect(() => { fetchWards(); }, []);

  const fetchWards = async () => {
    try {
      const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`);
      if (res.data && res.data.success) setWards(res.data.data);
    } catch (err) { toast.error("Database connection failed!"); }
  };

  // 🟢 Plugins setup (Search + Geoman)
  const MapPlugins = () => {
    const map = useMap();
    useEffect(() => {
      if (!map) return;
      mapRef.current = map;

      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider, style: 'bar', showMarker: true, autoClose: true, animateZoom: true,
      });
      map.addControl(searchControl);

      if (map.pm) {
        map.pm.addControls({
          position: 'topleft',
          drawMarker: false, drawPolyline: false, drawCircle: false,
          drawPolygon: true, drawRectangle: true, editMode: true, removalMode: true,
        });
      }
      return () => map.removeControl(searchControl);
    }, [map]);
    return null;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let geoData = file.name.endsWith('.kml') ? toGeoJSON.kml(new DOMParser().parseFromString(content, 'text/xml')) : JSON.parse(content);
        
        if (mapRef.current && geoData) {
          const geoLayer = L.geoJSON(geoData);
          mapRef.current.flyToBounds(geoLayer.getBounds(), { padding: [50, 50] });
          geoLayer.eachLayer(layer => {
            layer.addTo(mapRef.current);
            if (layer.pm) layer.pm.enable();
          });
          toast.success(`Imported: ${file.name}`);
        }
      } catch (err) { toast.error("File error!"); }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!selectedWardId) return toast.error("Pehle Ward select karein!");
    const map = mapRef.current;
    const allLayers = map.pm.getGeomanLayers().filter(l => !l.options.isSavedWard);

    if (allLayers.length === 0) return toast.error("Koyi nayi drawing nahi mili!");

    const lastLayer = allLayers[allLayers.length - 1];
    const geoJson = lastLayer.toGeoJSON();
    const coords = geoJson.geometry.type === 'Polygon' ? geoJson.geometry.coordinates[0] : geoJson.geometry.coordinates;

    setLoading(true);
    try {
      await axios.post('https://saksham-backend-9719.onrender.com/api/admin/wards/save-boundary', {
        ward_id: selectedWardId,
        boundary_coords: JSON.stringify(coords)
      });
      toast.success("Saved successfully!");
      setFileName('');
      allLayers.forEach(l => map.removeLayer(l));
      fetchWards();
    } catch (err) { toast.error("Save failed."); }
    finally { setLoading(false); }
  };

  return (
    <CityLayout>
      <Toaster position="top-right" />
      <div className="h-[calc(100vh-80px)] flex flex-col gap-4 p-4 text-left">
        
        {/* Header Section */}
        <div className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl text-emerald-400 shadow-lg"><MapIcon size={24}/></div>
            <div>
               <h1 className="text-xl font-black text-slate-800 uppercase leading-none italic">GIS Boundary Center</h1>
               <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1 tracking-widest">{tenantId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={() => setShowBoundaries(!showBoundaries)}
                className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 transition-all shadow-sm ${showBoundaries ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
             >
                {showBoundaries ? <Eye size={16}/> : <EyeOff size={16}/>} 
                {showBoundaries ? 'Boundaries Visible' : 'Boundaries Hidden'}
             </button>

             <select className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold text-slate-700 min-w-[200px]" value={selectedWardId} onChange={(e) => setSelectedWardId(e.target.value)}>
                <option value="">Select Ward Number...</option>
                {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no} - {w.ward_name}</option>)}
             </select>

             <input type="color" value={boundaryColor} onChange={(e) => setBoundaryColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer" />

             <label className="bg-blue-50 text-blue-600 px-5 py-3 rounded-2xl font-black text-[10px] uppercase cursor-pointer flex items-center gap-2 border border-blue-100">
                <FileJson size={16}/> Import KML
                <input type="file" className="hidden" accept=".json,.geojson,.kml" onChange={handleFileUpload} />
             </label>

             <button onClick={handleSave} disabled={loading || !selectedWardId} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all">
                {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                Save Boundary
             </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 bg-slate-200 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative">
           <MapContainer center={[26.22, 84.36]} zoom={14} className="h-full w-full" zoomControl={false}>
              <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="Google" />
              <MapPlugins />
              
              {/* 🟢 Logic components */}
              <AutoZoomToWard selectedId={selectedWardId} wards={wards} />

              {showBoundaries && wards.map(ward => {
                if(!ward.boundary_coords) return null;
                try {
                  const positions = JSON.parse(ward.boundary_coords).map(c => [c[1], c[0]]);
                  return (
                    <Polygon 
                      key={ward.id} positions={positions} 
                      eventHandlers={{ click: () => setSelectedWardId(ward.id.toString()) }}
                      pathOptions={{ 
                        color: String(ward.id) === String(selectedWardId) ? '#f59e0b' : 'white', 
                        fillColor: String(ward.id) === String(selectedWardId) ? '#f59e0b' : '#10b981', 
                        fillOpacity: String(ward.id) === String(selectedWardId) ? 0.5 : 0.2, 
                        weight: String(ward.id) === String(selectedWardId) ? 4 : 2,
                        isSavedWard: true 
                      }}
                    >
                       <Tooltip sticky direction="center" className="ward-tooltip">Ward {ward.ward_no}</Tooltip>
                    </Polygon>
                  );
                } catch (e) { return null; }
              })}
           </MapContainer>

           {/* Progress Widget */}
           <div className="absolute bottom-10 left-10 z-[1000] bg-white/90 backdrop-blur-md p-5 rounded-[28px] border border-white shadow-2xl min-w-[220px]">
              <div className="flex items-center gap-2 mb-2"><Target size={16} className="text-emerald-500" /><span className="text-[10px] font-black uppercase text-slate-800 tracking-widest italic">Live Mapping</span></div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                 <div className="h-full bg-emerald-500" style={{ width: `${(wards.filter(w => w.boundary_coords).length / (wards.length || 1)) * 100}%` }} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase">Mapped: {wards.filter(w => w.boundary_coords).length} / {wards.length}</p>
           </div>
        </div>
      </div>

      <style>{`
        .ward-tooltip { background: rgba(0,0,0,0.6) !important; border: none !important; color: white !important; font-weight: 900; font-size: 11px; padding: 4px 8px !important; border-radius: 6px; text-transform: uppercase; }
        .leaflet-geosearch-bar { position: absolute; top: 20px; right: 20px; z-index: 1000; width: 300px; }
        .leaflet-geosearch-bar form { border-radius: 12px !important; border: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; overflow: hidden; }
      `}</style>
    </CityLayout>
  );
};

export default WardMapping;
