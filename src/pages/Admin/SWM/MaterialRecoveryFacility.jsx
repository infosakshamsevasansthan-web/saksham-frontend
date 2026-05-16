import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    Recycle, MoveDown, ShoppingCart, BarChart, Package, 
    TrendingUp, Truck, RefreshCcw, DollarSign 
} from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const MaterialRecoveryFacility = () => {
    const [data, setData] = useState({ inventory: [], sales: [], intakeToday: 0 });
    const [loading, setLoading] = useState(true);
    const tenantId = localStorage.getItem('tenantId');

    const fetchMRFData = async () => {
        setLoading(true);
        try {
            // Backend API jo hum abhi banayenge
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/mrf/summary/${tenantId}`);
            setData(res.data);
        } catch (err) { toast.error("MRF Data sync error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMRFData(); }, [tenantId]);

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left bg-slate-50 min-h-screen">
                
                {/* --- HEADER --- */}
                <header className="bg-white p-6 rounded-[35px] border border-slate-200 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100 animate-spin-slow">
                            <Recycle size={30} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase italic">MRF Control Center</h1>
                            <p className="text-teal-600 font-bold text-[9px] uppercase tracking-widest mt-1">Dry Waste Sorting & Sales Intelligence</p>
                        </div>
                    </div>
                    <button onClick={fetchMRFData} className="p-3 bg-slate-900 text-white rounded-xl shadow-lg active:scale-90">
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/>
                    </button>
                </header>

                {/* --- STATS CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard label="Today's Intake" value="4.2" unit="TONS" color="blue" icon={Truck} />
                    <StatCard label="Sorted Stock" value="1,850" unit="KG" color="teal" icon={Package} />
                    <StatCard label="Sales Revenue" value="₹ 45,200" unit="TODAY" color="emerald" icon={DollarSign} />
                    <StatCard label="Recycle Rate" value="92%" unit="EFFICIENCY" color="indigo" icon={TrendingUp} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* INVENTORY TABLE */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm h-[600px] flex flex-col">
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6 flex items-center gap-3">
                            <BarChart size={18} className="text-teal-500" /> Current Sorted Inventory
                        </h3>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left">
                                <thead className="border-b">
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="p-4">Material Category</th>
                                        <th className="p-4">Stock Weight</th>
                                        <th className="p-4">Market Value (Est)</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <InventoryRow name="Plastic (PET Bottles)" weight="450 KG" value="₹ 13,500" color="teal" />
                                    <InventoryRow name="Cardboard / Gatta" weight="820 KG" value="₹ 12,300" color="amber" />
                                    <InventoryRow name="Metal / Iron Scrap" weight="120 KG" value="₹ 9,600" color="rose" />
                                    <InventoryRow name="Glass" weight="460 KG" value="₹ 9,800" color="blue" />
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RECENT SALES */}
                    <div className="bg-slate-900 p-8 rounded-[45px] text-white shadow-2xl flex flex-col h-[600px]">
                        <h3 className="text-sm font-black uppercase italic mb-8 flex items-center gap-3">
                            <ShoppingCart className="text-teal-400" /> Sales & Outbound
                        </h3>
                        <div className="space-y-4 flex-1 overflow-auto pr-2 custom-scrollbar">
                            <SaleItem vendor="NeoRecycling Ltd" material="Plastic" amount="₹ 12,000" weight="400kg" />
                            <SaleItem vendor="Shree Paper Mill" material="Gatta" amount="₹ 8,500" weight="600kg" />
                            <SaleItem vendor="Local Scrap Dealer" material="Metal" amount="₹ 4,200" weight="50kg" />
                        </div>
                        <div className="mt-8 p-5 bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-[10px] font-black text-teal-400 uppercase tracking-tighter mb-1">In-Charge Message</p>
                            <p className="text-[11px] text-slate-400 italic">"Plastic stocks are high, schedule a dispatch for tomorrow morning."</p>
                        </div>
                    </div>

                </div>
            </div>
        </CityLayout>
    );
};

// --- Sub-Components ---
const StatCard = ({ label, value, unit, color, icon: Icon }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-xl transition-all">
        <div className={`w-14 h-14 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center shadow-inner`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-slate-800">{value} <span className="text-[10px] text-slate-300 ml-1">{unit}</span></p>
        </div>
    </div>
);

const InventoryRow = ({ name, weight, value, color }) => (
    <tr className="hover:bg-slate-50 transition-colors">
        <td className="p-4 flex items-center gap-3">
            <div className={`w-2 h-8 rounded-full bg-${color}-500`} />
            <span className="font-black text-slate-700 text-sm uppercase">{name}</span>
        </td>
        <td className="p-4 font-black text-slate-800">{weight}</td>
        <td className="p-4 font-black text-emerald-600">{value}</td>
        <td className="p-4"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Ready for Sale</span></td>
    </tr>
);

const SaleItem = ({ vendor, material, amount, weight }) => (
    <div className="bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
        <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-black uppercase text-white">{vendor}</p>
            <span className="text-[10px] font-black text-teal-400">{amount}</span>
        </div>
        <div className="flex justify-between items-end">
            <p className="text-[9px] font-bold text-white/30 uppercase">{material}</p>
            <p className="text-[10px] font-black text-slate-400 italic">Qty: {weight}</p>
        </div>
    </div>
);

export default MaterialRecoveryFacility;
