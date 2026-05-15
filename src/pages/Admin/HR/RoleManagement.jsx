import React, { useState, useEffect } from 'react';
import CityLayout from '../../../components/layout/cityAdmin/CityLayout';
import { 
    ShieldCheck, UserCheck, Layers, MapPin, Truck, Users, 
    Settings, X, Save, Plus, Loader2, Info, ChevronRight, 
    LayoutGrid, Droplets, AlertCircle, CheckCircle2, Circle,
    Map, FileText, Smartphone, Megaphone, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState({});
    const tenantId = localStorage.getItem('tenantId');

    // 🟢 Exact match with your sidebar menus & sub-menus
    const menuList = [
        { 
            id: 'dashboard', label: 'Dashboard Overview', icon: LayoutGrid,
            submenus: [] 
        },
        { 
            id: 'live_tracking', label: 'Live Tracking (Map)', icon: Map,
            submenus: [
                { id: 'lt_staff', label: 'Staff Live Location' },
                { id: 'lt_vehicle', label: 'Vehicle Movement' },
                { id: 'lt_toilet', label: 'Sulabh Sauchalay Map' },
                { id: 'lt_dump', label: 'Garbage Dump Points' }
            ]
        },
        { 
            id: 'ward_households', label: 'Ward & Households', icon: Layers,
            submenus: [
                { id: 'wh_def', label: 'Ward Definition' },
                { id: 'wh_gis', label: 'GIS Boundary Mapping' },
                { id: 'wh_road', label: 'Road Hierarchy Entry' },
                { id: 'wh_registry', label: 'Household Registry' },
                { id: 'wh_qr', label: 'Bulk QR Generator' }
            ]
        },
        { 
            id: 'vehicle_mgt', label: 'Vehicle Management', icon: Truck,
            submenus: [
                { id: 'vm_add', label: 'Add New Vehicle' },
                { id: 'vm_req', label: 'Fleet Requests' },
                { id: 'vm_deploy', label: 'Ward Deployment' },
                { id: 'vm_maint', label: 'Vehicle Maintenance' },
                { id: 'vm_fuel', label: 'Fuel & Coupon Logs' },
                { id: 'vm_ins', label: 'Maintenance & Insurance' },
                { id: 'vm_gps', label: 'GPS Device Status' }
            ]
        },
        { 
            id: 'hr', label: 'Human Resources', icon: Users,
            submenus: [
                { id: 'hr_org', label: 'Organization Hierarchy' },
                { id: 'hr_role', label: 'Role Management' },
                { id: 'hr_staff', label: 'User & Staff List' },
                { id: 'hr_work', label: 'Work Assignment' },
                { id: 'hr_att', label: 'Smart Attendance' }
            ]
        },
        { 
            id: 'swm_ops', label: 'SWM Operations', icon: Droplets,
            submenus: [
                { id: 'swm_logs', label: 'D2D Collection Logs' },
                { id: 'swm_route', label: 'Route Optimization' },
                { id: 'swm_plant', label: 'Waste Processing Plant' }
            ]
        },
        { 
            id: 'grievance', label: 'Grievance Redressal', icon: AlertCircle,
            submenus: [] 
        },
        { 
            id: 'reports', label: 'Report Centre', icon: BarChart3,
            submenus: [
                { id: 'rep_coll', label: 'Collection Reports' },
                { id: 'rep_staff', label: 'Staff Performance' },
                { id: 'rep_comp', label: 'Complaint Analytics' },
                { id: 'rep_fuel', label: 'Fuel & Mileage Analysis' },
                { id: 'rep_ai', label: 'Saksham AI' }
            ]
        },
        { 
            id: 'sys_config', label: 'System Configuration', icon: Settings,
            submenus: [] 
        },
        { 
            id: 'device_control', label: 'Device & Control', icon: Smartphone,
            submenus: [] 
        },
        { 
            id: 'iec_ops', label: 'IEC Operations', icon: Megaphone,
            submenus: [] 
        }
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/roles/${tenantId}`);
            const rolesData = res.data.data || [];
            setRoles(rolesData);
            if (rolesData.length > 0) handleRoleSelect(rolesData[0]);
        } catch (err) { 
            console.error("API Error:", err);
            toast.error("Role Sync Failed"); 
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tenantId]);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        try {
            const parsed = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
            setPermissions(parsed || {});
        } catch (e) {
            setPermissions({});
        }
    };

    const togglePermission = (id, parentId = null) => {
        setPermissions(prev => {
            const newState = { ...prev, [id]: !prev[id] };
            if (!parentId) {
                const parentMenu = menuList.find(m => m.id === id);
                parentMenu?.submenus?.forEach(sub => {
                    newState[sub.id] = newState[id];
                });
            } else {
                if (newState[id]) newState[parentId] = true;
            }
            return newState;
        });
    };

    const saveRoleConfig = async () => {
        if (!selectedRole) return;
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

    const handleCreateRole = async (roleName) => {
        try {
            await axios.post('https://saksham-backend-9719.onrender.com/api/admin/roles/create', {
                tenant_id: tenantId,
                role_name: roleName
            });
            toast.success("New Role Created! 🚀");
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error("Role creation failed");
        }
    };

    return (
        <CityLayout>
            <Toaster position="top-right" />
            <div className="p-4 space-y-6 text-left">
                
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
                    <button 
                        onClick={() => {
                            const name = prompt("Enter New Role Name:");
                            if(name) handleCreateRole(name);
                        }}
                        className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-md"
                    >
                        <Plus size={16}/> Define New Role
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
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
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">LVL: {role.id}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className={selectedRole?.id === role.id ? 'text-emerald-500' : 'text-slate-300'} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase italic">Configure Permissions</h2>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Editing: {selectedRole?.role_name}</p>
                            </div>
                            <button onClick={saveRoleConfig} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl">
                                <Save size={18}/> Authorize Changes
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 h-[520px] overflow-y-auto custom-scrollbar">
                            {menuList.map(menu => (
                                <div key={menu.id} className={`p-6 rounded-3xl border-2 transition-all ${permissions[menu.id] ? 'border-emerald-100 bg-white shadow-md' : 'border-slate-50 bg-slate-50 opacity-60'}`}>
                                    <div className="flex items-center gap-5 cursor-pointer" onClick={() => togglePermission(menu.id)}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${permissions[menu.id] ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'}`}>
                                            <menu.icon size={22}/>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-xs font-black uppercase ${permissions[menu.id] ? 'text-emerald-700' : 'text-slate-400'}`}>{menu.label}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Main Module</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${permissions[menu.id] ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white'}`}>
                                            {permissions[menu.id] && <CheckCircle2 size={14} />}
                                        </div>
                                    </div>

                                    {menu.submenus.length > 0 && permissions[menu.id] && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                                            {menu.submenus.map(sub => (
                                                <div 
                                                    key={sub.id} 
                                                    onClick={() => togglePermission(sub.id, menu.id)}
                                                    className="flex items-center justify-between p-2 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Circle size={8} className={permissions[sub.id] ? 'fill-emerald-500 text-emerald-500' : 'text-slate-300'} />
                                                        <span className={`text-[10px] font-bold uppercase ${permissions[sub.id] ? 'text-emerald-600' : 'text-slate-400'}`}>{sub.label}</span>
                                                    </div>
                                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${permissions[sub.id] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 bg-white'}`}>
                                                        {permissions[sub.id] && <CheckCircle2 size={10} />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            <Info size={18} className="text-blue-500" />
                            Security Alert: Only checked sub-modules will appear on the staff's mobile device.
                        </div>
                    </div>
                </div>
            </div>
        </CityLayout>
    );
};

export default RoleManagement;
