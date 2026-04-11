import React, { useState, useEffect, useRef } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { MapContainer, TileLayer, Polygon, useMap, FeatureGroup, Tooltip } from 'react-leaflet';
import { Map as MapIcon, Save, Upload, Target, Palette, FileJson, Loader2, Search, XCircle } from 'lucide-react';
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
  const [boundaryColor, setBoundaryColor] = useState('#ef4444'); 
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(''); // File name dikhane ke liye
  const mapRef = useRef(null); 
  const tenantId = "SAK-SIW-6925"; 

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
          drawMarker: false,
          drawPolygon: true,
          editMode: true,
          removalMode: true,
        });
        map.pm.setPathOptions({ color: boundaryColor, fillColor: boundaryColor, fillOpacity: 0.3 });
      }
      return () => map.removeControl(searchControl);
    }, [map, boundaryColor]);
    return null;
  };

  // --- IMPROVED FILE IMPORT & AUTO-ZOOM ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name); // UI pe naam set karein
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
          // GeoJSON ko layer mein convert karein
          const geoLayer = L.geoJSON(geoData, {
            style: { color: boundaryColor, fillColor: boundaryColor, fillOpacity: 0.3 }
          });

          // 1. Map ko us location par zoom karein
          const bounds = geoLayer.getBounds();
          if (bounds.isValid()) {
            map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
          }

          // 2. Map par add karein aur Geoman ko bata dein ki ise Edit kiya ja sakta hai
          geoLayer.eachLayer(layer => {
            layer.addTo(map);
            if (layer.pm) layer.pm.enable(); // Ise Geoman layer bana dein taaki Save pe dikhe
          });

          toast.success(`Imported: ${file.name}. Ab save button dabayein.`);
        }
      } catch (err) { 
        console.error(err);
        toast.error("File error: Format sahi nahi hai."); 
      }
    };
    reader.readAsText(file);
  };

  // --- FINAL SAVE LOGIC ---
  const handleSave = async () => {
    if (!selectedWardId) return toast.error("Pehle upar se Ward select karein!");
    
    const map = mapRef.current;
    if (!map) return;

    // Ab hum Geoman ki saari layers check karenge (Drawn + Imported)
    const allLayers = map.pm.getGeomanLayers(); 
    
    // Sirf wo layers jo database wali nahi hain
    const newLayers = allLayers.filter(l => !l.options.isSavedWard);

    if (newLayers.length === 0) {
      toast.error("Map par koi nayi boundary nahi mili!");
      return;
    }

    const lastLayer = newLayers[newLayers.length - 1];
    const coords = JSON.stringify(lastLayer.toGeoJSON().geometry.coordinates[0]);

    setLoading(true);
    try {
      const res = await axios.post('https://saksham-backend-9719.onrender.com/api/admin/wards/save-boundary', {
        ward_id: selectedWardId,
        boundary_coords: coords
      });

      if (res.data.success) {
        toast.success("Ward Boundary saved successfully!");
        setFileName(''); // Clear file name
        // Nayi temporary layers hata dein
        newLayers.forEach(l => map.removeLayer(l));
        fetchWards(); // Database se fetch karein
      }
    } catch (err) {
      toast.error("Database save failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CityLayout>
      <Toaster position="top-right" />
      <div className="h-[calc(100vh-80px)] flex flex-col gap-4 p-4">
        
        {/* Header Section */}
        <div className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl text-emerald-400">
               <MapIcon size={24}/>
            </div>
            <div>
               <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">GIS Boundary Center</h1>
               <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Siwan Nagar Parishad</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <select 
               className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold text-slate-700 outline-none focus:border-emerald-500 min-w-[200px]"
               value={selectedWardId}
               onChange={(e) => setSelectedWardId(e.target.value)}
             >
                <option value="">Select Ward Number...</option>
                {wards.map(w => <option key={w.id} value={w.id}>Ward {w.ward_no} - {w.ward_name}</option>)}
             </select>

             <input type="color" value={boundaryColor} onChange={(e) => setBoundaryColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none" />

             {/* File Import Button with FileName Label */}
             <div className="flex items-center gap-2">
                <label className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-5 py-3 rounded-2xl font-black text-[10px] uppercase cursor-pointer flex items-center gap-2 transition-all">
                    <FileJson size={16}/> {fileName ? 'Change File' : 'Import KML/GeoJSON'}
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
                {loading ? 'Saving...' : 'Save Boundary'}
             </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-slate-200 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative">
           <MapContainer center={[26.222, 84.36]} zoom={13} className="h-full w-full" zoomControl={false}>
              <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="Google" />
              <MapPlugins />

              {/* SAVED WARDS RENDERING */}
              {wards.map(ward => (
                ward.boundary_coords && (
                  <Polygon 
                    key={ward.id} 
                    isSavedWard={true} // Taaki Save logic ise ignore kare
                    positions={JSON.parse(ward.boundary_coords).map(c => [c[1], c[0]])} 
                    pathOptions={{ 
                      color: 'white', 
                      fillColor: ward.id == selectedWardId ? '#f59e0b' : '#10b981', 
                      fillOpacity: 0.3, 
                      weight: 3,
                      isSavedWard: true // Option as well
                    }}
                  >
                     <Tooltip permanent direction="center" className="ward-tooltip">
                        Ward {ward.ward_no}
                     </Tooltip>
                  </Polygon>
                )
              ))}
           </MapContainer>

           <div className="absolute bottom-10 left-10 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white shadow-xl min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                 <Target size={16} className="text-emerald-500" />
                 <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest italic">Mapping Progress</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Wards Mapped: <span className="text-emerald-600 font-black">{wards.filter(w => w.boundary_coords).length} / {wards.length}</span></p>
           </div>
        </div>
      </div>

      <style>{`
        .ward-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; color: white !important; font-weight: 900; text-shadow: 2px 2px 4px black; font-size: 14px; text-transform: uppercase; }
        .leaflet-geosearch-bar { position: absolute; top: 10px; right: 10px; z-index: 1000; width: 300px; }
      `}</style>
    </CityLayout>
  );
};

export default WardMapping;