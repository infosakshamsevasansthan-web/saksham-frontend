import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { ShieldCheck, UserCheck, Layers, MapPin, Truck, Users, Settings, X, Save, Plus, Loader2, Info, ChevronRight, HardDrive, LayoutGrid, Droplets, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState({});
    const tenantId = localStorage.getItem('tenantId');

    // Definition of all possible menus/modules
    const menuList = [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutGridIcon },
        { id: 'fleet', label: 'Vehicle Management', icon: Truck },
        { id: 'hr', label: 'Human Resources', icon: Users },
        { id: 'swm', label: 'SWM Operations', icon: DropletsIcon },
        { id: 'ward_road', label: 'Ward & Road Management', icon: MapPin },
        { id: 'circle', label: 'Circle Administration', icon: Layers },
        { id: 'grievance', label: 'Grievance Redressal', icon: AlertCircleIcon }
    ];

    const fetchData = async () => {
    setLoading(true);
    try {
        const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roles/${tenantId}`);
        const rolesData = res.data.data || [];
        setRoles(rolesData);
        if (rolesData.length > 0) handleRoleSelect(rolesData[0]);
    } catch (err) { 
        console.error("API Error:", err); // Isse console mein asli wajah dikhegi
        toast.error("Role Sync Failed: " + (err.response?.data?.message || "Server Error")); 
    }
    finally { setLoading(false); }
};

    useEffect(() => { fetchData(); }, [tenantId]);

    const handleRoleSelect = (role) => {
    setSelectedRole(role);
    try {
        if (!role.permissions) {
            setPermissions({});
            return;
        }
        // Agar string hai toh parse karo, warna direct object use karo
        const parsedPermissions = typeof role.permissions === 'string' 
            ? JSON.parse(role.permissions) 
            : role.permissions;
        setPermissions(parsedPermissions || {});
    } catch (e) {
        console.error("Permission parse error:", e);
        setPermissions({}); // Error aane par empty object set kardo taaki crash na ho
    }
};

    const togglePermission = (menuId) => {
        setPermissions(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    const saveRoleConfig = async () => {
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/roles/save', {
                tenant_id: tenantId,
                role_name: selectedRole.role_name,
                permissions: permissions
            });
            toast.success("Permissions Synced! 🔒");
            fetchData();
        } catch (err) { toast.error("Update failed"); }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left animate-in fade-in duration-500">
                
                {/* 🟢 TOP COMMAND HEADER */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 shadow-lg">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">Access Control</h1>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Role & Permission Hierarchy Master</p>
                        </div>
                    </div>
                    <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-md active:scale-95">
                        <Plus size={16}/> Define New Role
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* 🟢 LEFT: ROLE SELECTOR (4 columns) */}
                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Select Unit Role</h3>
                        <div className="space-y-3">
                            {roles.map(role => (
                                <div 
                                    key={role.id}
                                    onClick={() => handleRoleSelect(role)}
                                    className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedRole?.id === role.id ? 'border-emerald-500 bg-emerald-50' : 'border-white bg-white hover:border-slate-200 shadow-sm'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole?.id === role.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <UserCheck size={20}/>
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black uppercase ${selectedRole?.id === role.id ? 'text-emerald-700' : 'text-slate-700'}`}>{role.role_name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Access Lvl: {role.id}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className={selectedRole?.id === role.id ? 'text-emerald-500' : 'text-slate-300'} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 🟢 RIGHT: PERMISSION MATRIX (8 columns) */}
                    <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase italic">Configure Permissions</h2>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Role: {selectedRole?.role_name}</p>
                            </div>
                            <button onClick={saveRoleConfig} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl">
                                <Save size={18}/> Authorize Changes
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px] overflow-y-auto custom-scrollbar">
                            {menuList.map(menu => (
                                <motion.div 
                                    whileTap={{ scale: 0.98 }}
                                    key={menu.id} 
                                    onClick={() => togglePermission(menu.id)}
                                    className={`p-6 rounded-3xl border-2 cursor-pointer flex items-center gap-5 transition-all ${permissions[menu.id] ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-50 bg-slate-50 opacity-60'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${permissions[menu.id] ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'}`}>
                                        <menu.icon size={22}/>
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-xs font-black uppercase ${permissions[menu.id] ? 'text-emerald-700' : 'text-slate-400'}`}>{menu.label}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Module Access</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${permissions[menu.id] ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white'}`}>
                                        {permissions[menu.id] && <CheckCircle2 size={14} />}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-auto p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                            <Info size={18} className="text-blue-500" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                                System Rule: All circles, wards, and roads linked to the assigned modules will be visible to this role. Revoking a permission will hide the entire module in the user's mobile app and dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CityLayout>
    );
};

// --- Custom Icons ---
const LayoutGridIcon = (props) => <Settings {...props} />;
const DropletsIcon = (props) => <ShieldCheck {...props} />;
const AlertCircleIcon = (props) => <Info {...props} />;
const CheckCircle2 = (props) => <ShieldCheck {...props} />;

export default RoleManagement;
