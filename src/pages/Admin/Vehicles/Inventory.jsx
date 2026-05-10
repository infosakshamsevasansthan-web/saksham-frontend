import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Plus, Truck, MoreVertical, Loader2, X, Fuel, QrCode 
} from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react'; // Istemal ke liye sabse stable library

const VehicleInventory = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false); 
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const tenantId = localStorage.getItem('tenantId') || "SAK-SIW-6925";
    const API_URL = "https://saksham-backend-9719.onrender.com/api/admin";

    const [vehicleFormData, setVehicleFormData] = useState({
        vehicle_no: '', vehicle_type: 'Tipper', load_capacity_tons: '', fuel_type: 'Diesel'
    });

    const [couponCode, setCouponCode] = useState('');

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await axios.get(`${API_URL}/vehicles/${tenantId}`);
                setVehicles(res.data.data || []);
            } catch (err) { console.error("Error fetching vehicles:", err); }
            finally { setLoading(false); }
        };
        fetchVehicles();
    }, [tenantId]);

    const handleVehicleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/vehicles/add`, {
                ...vehicleFormData, tenant_id: tenantId, status: 'active'
            });
            toast.success("Vehicle Added! 🚛");
            setShowModal(false);
            window.location.reload(); 
        } catch (err) { toast.error("Submission failed"); }
    };

    // --- MODAL PORTAL ---
    const ModalPortal = ({ children, isOpen, onClose }) => {
        if (!isOpen) return null;
        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden z-10"
                >
                    {children}
                </motion.div>
            </div>,
            document.body
        );
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left relative">
                <header className="flex justify-between items-center bg-white p-6 rounded-[35px] border shadow-sm relative z-20">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase italic">Vehicle Inventory</h1>
                        <p className="text-emerald-600 font-bold text-[9px] uppercase tracking-widest">Fleet Management</p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setShowModal(true)} 
                        className="bg-[#10b981] hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase shadow-lg cursor-pointer relative z-30"
                    >
                        <Plus size={18} className="inline mr-1" /> Add Vehicle
                    </button>
                </header>

                <div className="bg-white rounded-[40px] border overflow-hidden min-h-[400px]">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b font-black text-[10px] text-slate-400 uppercase">
                            <tr>
                                <th className="p-6">Details</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="2" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
                            ) : vehicles.map((v) => (
                                <tr key={v.id} className="border-b hover:bg-slate-50">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Truck size={20}/></div>
                                            <p className="font-black text-slate-800 uppercase">{v.vehicle_no}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            type="button"
                                            onClick={(e) => { 
                                                e.preventDefault();
                                                setSelectedVehicle(v); 
                                                setCouponCode("FUEL-" + Math.floor(1000 + Math.random() * 9000));
                                                setShowFuelModal(true); 
                                            }} 
                                            className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all cursor-pointer"
                                        >
                                            <Fuel size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD VEHICLE MODAL */}
            <ModalPortal isOpen={showModal} onClose={() => setShowModal(false)}>
                <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-black text-slate-800 uppercase italic">Add Vehicle</h2>
                    <button onClick={() => setShowModal(false)}><X className="text-rose-500" /></button>
                </div>
                <form onSubmit={handleVehicleSubmit} className="p-8 space-y-4">
                    <input required className="w-full p-4 rounded-xl border font-bold uppercase" placeholder="Reg No" onChange={(e) => setVehicleFormData({...vehicleFormData, vehicle_no: e.target.value})} />
                    <select className="w-full p-4 rounded-xl border font-bold" onChange={(e) => setVehicleFormData({...vehicleFormData, vehicle_type: e.target.value})}>
                        <option value="Tipper">Tipper</option>
                        <option value="Compactor">Compactor</option>
                    </select>
                    <input required type="number" className="w-full p-4 rounded-xl border font-bold" placeholder="Tons" onChange={(e) => setVehicleFormData({...vehicleFormData, load_capacity_tons: e.target.value})} />
                    <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase">Save Asset</button>
                </form>
            </ModalPortal>

            {/* FUEL MODAL (FIXED CRASH) */}
            <ModalPortal isOpen={showFuelModal} onClose={() => setShowFuelModal(false)}>
                <div className="flex flex-col md:flex-row bg-slate-900 text-white p-10 items-center gap-10">
                    <div className="bg-white p-4 rounded-2xl flex items-center justify-center">
                        {/* Yahan fix kiya hai: QRCodeSVG use karke */}
                        <QRCodeSVG value={couponCode || "EMPTY"} size={150} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-emerald-400 tracking-wider">{couponCode}</h2>
                        <p className="text-sm font-bold text-slate-400 mt-2 uppercase">{selectedVehicle?.vehicle_no || 'N/A'}</p>
                        <button 
                            type="button" 
                            onClick={() => setShowFuelModal(false)} 
                            className="mt-6 w-full bg-rose-500 p-3 rounded-xl font-black uppercase text-[10px] cursor-pointer"
                        >
                            Close Modal
                        </button>
                    </div>
                </div>
            </ModalPortal>
        </CityLayout>
    );
};

export default VehicleInventory;
