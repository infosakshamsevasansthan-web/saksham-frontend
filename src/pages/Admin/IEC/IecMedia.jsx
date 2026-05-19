import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Video, Image as ImageIcon, Music, FileText, Download, 
    Plus, Search, RefreshCcw, Loader2, Trash2, ExternalLink, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const IecMedia = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const tenantId = localStorage.getItem('tenantId') || 'SAK-SIW-6925';

    useEffect(() => { fetchMedia(); }, [tenantId]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/iec/media/${tenantId}`);
            setMedia(res.data.data || []);
        } catch (err) { toast.error("Media sync failed"); }
        finally { setLoading(false); }
    };

    const filteredMedia = filter === 'All' ? media : media.filter(m => m.media_type === filter);

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-slate-50 min-h-screen">
                
                {/* --- 🟢 HEADER --- */}
                <header className="bg-white p-6 rounded-[35px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase italic leading-none">Media & Creatives</h1>
                        <p className="text-blue-600 font-bold text-[9px] uppercase tracking-[0.3em] mt-2">Central Awareness Asset Repository</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-3.5 text-slate-300" size={18} />
                            <input className="pl-12 pr-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-blue-400 transition-all w-64" placeholder="Search creatives..." />
                        </div>
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-slate-900 transition-all">
                            <Plus size={16}/> Add Media
                        </button>
                    </div>
                </header>

                {/* --- 🟢 CATEGORY FILTER --- */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {['All', 'Posters', 'Videos', 'Audio', 'Documents'].map((cat) => (
                        <button 
                            key={cat} onClick={() => setFilter(cat)}
                            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border ${filter === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* --- 🟢 MEDIA GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={40}/></div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="col-span-full py-40 text-center border-4 border-dashed rounded-[50px] border-slate-200">
                            <p className="text-slate-300 font-black text-xl uppercase italic">No {filter} found in library</p>
                        </div>
                    ) : filteredMedia.map((m) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            key={m.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all"
                        >
                            {/* Preview Area */}
                            <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                {m.media_type === 'Posters' ? (
                                    <img src={m.file_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="p" />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-slate-300">
                                        <MediaIcon type={m.media_type} size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black uppercase text-slate-700 shadow-sm">{m.media_type}</div>
                            </div>

                            {/* Info Area */}
                            <div className="p-6">
                                <h4 className="text-sm font-black text-slate-800 uppercase line-clamp-1">{m.title}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 line-clamp-2 leading-relaxed">{m.description}</p>
                                
                                <div className="mt-6 flex gap-2">
                                    <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all">
                                        <Download size={14}/> Download
                                    </button>
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100">
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </CityLayout>
    );
};

// --- Helper Components ---
const MediaIcon = ({ type, size }) => {
    if (type === 'Videos') return <Video size={size} />;
    if (type === 'Audio') return <Music size={size} />;
    if (type === 'Documents') return <FileText size={size} />;
    return <ImageIcon size={size} />;
};

export default IecMedia;
