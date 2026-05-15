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

const WardMapping = () => {
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('');
  const [boundaryColor, setBoundaryColor] = useState('#10b981'); // Default Green for Saksham
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showBoundaries, setShowBoundaries] = useState(true); // 🟢 Show/Hide Toggle State
  const mapRef = useRef(null); 
  const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925"; 

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/wards/${tenantId}`);
      if (res.data && res.data.success) setWards(res.data.data);
    } catch (err) { toast.error("Database connection failed!"); }
  };

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
          drawMarker: false, drawPolyline: false, drawCircle: false, drawCircleMarker: false,
          drawPolygon: true, drawRectangle: true, editMode: true, removalMode: true,
        });
        map.pm.setPathOptions({ color: boundaryColor, fillColor: boundaryColor, fillOpacity: 0.3 });
      }
      return () => map.removeControl(searchControl);
    }, [map, boundaryColor]);
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
        let geoData;
        if (file.name.endsWith('.kml')) {
          const kml = new DOMParser().parseFromString(content, 'text/xml');
          geoData = toGeoJSON.kml(kml);
        } else {
          geoData = JSON.parse(content);
        }
        const map = mapRef.current;
        if (map && geoData) {
          const geoLayer = L.geoJSON(geoData, {
            style: { color: boundaryColor, fillColor: boundaryColor, fillOpacity: 0.3 }
          });
          const bounds = geoLayer.getBounds();
          if (bounds.isValid()) map.flyToBounds(bounds, { padding: [50, 50] });
          geoLayer.eachLayer(layer => {
            layer.addTo(map);
            if (layer.pm) layer.pm.enable();
          });
          toast.success(`Imported: ${file.name}.`);
        }
      } catch (err) { toast.error("File error: Format not valid."); }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!selectedWardId) return toast.error("Pehle Ward select karein!");
    const map = mapRef.current;
    if (!map) return;

    const allLayers = map.pm.getGeomanLayers(); 
    const newLayers = allLayers.filter(l => !l.options.isSavedWard);

    if (newLayers.length === 0) return toast.error("Map par koi nayi boundary nahi hai!");

    const lastLayer = newLayers[newLayers.length - 1];
    const geoJsonData = lastLayer.toGeoJSON();
    
    // 🟢 Coordinate swap logic fix (Lng/Lat to Lat/Lng)
    let coords;
    if (geoJsonData.geometry.type === 'Polygon') {
        coords = geoJsonData.geometry.coordinates[0];
    } else {
        coords = geoJsonData.geometry.coordinates;
    }

    setLoading(true);
    try {
      await axios.post('https://saksham-backend-9719.onrender.com/api/admin/wards/save-boundary', {
        ward_id: selectedWardId,
        boundary_coords: JSON.stringify(coords)
      });
      toast.success("Ward Boundary saved!");
      setFileName('');
      newLayers.forEach(l => map.removeLayer(l));
      fetchWards();
    } catch (err) { toast.error("Database save failed."); }
    finally { setLoading(false); }
  };

  return (
    <CityLayout>
      <Toaster position="top-right" />
      <div className="h-[calc(100vh-80px)] flex flex-col gap-4 p-4 text-left">
        
        {/* Header Section */}
        <div className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl text-emerald-400 shadow-lg">
               <MapIcon size={24}/>
            </div>
            <div>
               <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none italic">GIS Boundary Center</h1>
               <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Tenant Control: {tenantId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* 🟢 Layer Toggle Button */}
             <button 
                onClick={() => setShowBoundaries(!showBoundaries)}
                className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 transition-all shadow-sm ${showBoundaries ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}
             >
                {showBoundaries ? <Eye size={16}/> : <EyeOff size={16}/>} 
                {showBoundaries ? 'Boundaries Visible' : 'Boundaries Hidden'}
             </button>

             <select 
               className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold text-slate-700 outline-none focus:border-emerald-500 min-w-[200px]"
               value={selectedWardId}
               onChange={(e) => setSelectedWardId(e.target.value)}
             >
                <option value="">Select Ward Number...</option>
                {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no} - {w.ward_name}</option>)}
             </select>

             <input type="color" value={boundaryColor} onChange={(e) => setBoundaryColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer bg-white p-1 border border-slate-100" />

             <div className="flex items-center gap-2">
                <label className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-5 py-3 rounded-2xl font-black text-[10px] uppercase cursor-pointer flex items-center gap-2 transition-all border border-blue-100">
                    <FileJson size={16}/> {fileName ? 'Change File' : 'Import KML'}
                    <input type="file" className="hidden" accept=".json,.geojson,.kml" onChange={handleFileUpload} />
                </label>
                {fileName && (
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                     <span className="text-[9px] font-black text-slate-500 uppercase truncate max-w-[100px]">{fileName}</span>
                     <button onClick={() => {setFileName(''); mapRef.current.pm.getGeomanLayers().forEach(l => !l.options.isSavedWard && mapRef.current.removeLayer(l))}}>
                        <XCircle size={14} className="text-red-400 hover:text-red-600" />
                     </button>
                  </div>
                )}
             </div>

             <button 
               onClick={handleSave}
               disabled={loading || !selectedWardId}
               className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
             >
                {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                {loading ? 'Processing...' : 'Save Boundary'}
             </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-slate-200 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative">
           <MapContainer center={[26.222, 84.36]} zoom={14} className="h-full w-full" zoomControl={false}>
              <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="Google Satellite" />
              <MapPlugins />

              {/* 🟢 SAVED WARDS RENDERING WITH TOGGLE */}
              {showBoundaries && wards.map(ward => {
                if(!ward.boundary_coords) return null;
                
                try {
                  const rawCoords = JSON.parse(ward.boundary_coords);
                  // Lat/Lng validation & swap: [lng, lat] -> [lat, lng]
                  const positions = rawCoords.map(c => [c[1], c[0]]);

                  return (
                    <Polygon 
                      key={ward.id} 
                      positions={positions} 
                      eventHandlers={{ click: () => setSelectedWardId(ward.id.toString()) }}
                      pathOptions={{ 
                        color: ward.id == selectedWardId ? '#f59e0b' : 'white', 
                        fillColor: ward.id == selectedWardId ? '#f59e0b' : '#10b981', 
                        fillOpacity: ward.id == selectedWardId ? 0.5 : 0.2, 
                        weight: ward.id == selectedWardId ? 4 : 2,
                        isSavedWard: true // Geoman identification
                      }}
                    >
                       <Tooltip sticky direction="center" className="ward-tooltip">
                          Ward {ward.ward_no}
                       </Tooltip>
                    </Polygon>
                  );
                } catch (e) { return null; }
              })}
           </MapContainer>

           {/* Stats Widget */}
           <div className="absolute bottom-10 left-10 z-[1000] bg-white/90 backdrop-blur-md p-5 rounded-[28px] border border-white shadow-2xl min-w-[220px]">
              <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <Target size={18} />
                 </div>
                 <span className="text-[11px] font-black uppercase text-slate-800 tracking-widest italic">Live GIS Progress</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                 <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${(wards.filter(w => w.boundary_coords).length / wards.length) * 100}%` }}
                 />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase">
                Mapped: <span className="text-emerald-600">{wards.filter(w => w.boundary_coords).length}</span> / {wards.length} Wards
              </p>
           </div>
        </div>
      </div>

      <style>{`
        .ward-tooltip { background: rgba(0,0,0,0.5) !important; border: 1px solid rgba(255,255,255,0.2) !important; border-radius: 8px !important; color: white !important; font-weight: 900; font-size: 12px; padding: 4px 8px !important; text-transform: uppercase; }
        .leaflet-geosearch-bar { position: absolute; top: 20px; right: 20px; z-index: 1000; width: 320px; }
        .leaflet-geosearch-bar form { border-radius: 16px !important; border: none !important; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important; overflow: hidden; }
        .leaflet-geosearch-bar input { height: 45px !important; font-weight: bold; }
      `}</style>
    </CityLayout>
  );
};

export default WardMapping;
