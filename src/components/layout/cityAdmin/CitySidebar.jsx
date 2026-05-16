import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Map, MapPin, Users, Truck, AlertCircle, 
  Settings, ChevronDown, ChevronRight, FileText, UserPlus, 
  QrCode, ClipboardList, Navigation, Home, Droplets, PieChart, ShieldCheck, Smartphone
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // API कॉल के लिए ज़रूरी है

const CitySidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSub, setOpenSub] = useState(null);
  
  // डिफ़ॉल्ट डेटा (शुरुआत में साक्षम दिखेगा, फिर तुरंत अपडेट हो जाएगा)
  const [tenantData, setTenantData] = useState({
    name: "SAKSHAM", 
    logo: "/logo.png",
    plan: "Municipal Standard"
  });

  useEffect(() => {
    const getBranding = async () => {
      // 1. आपके LocalStorage से सीधा tenantId उठा रहे हैं
      const tId = localStorage.getItem('tenantId'); 
      console.log("Fetching data for Tenant ID:", tId);

      if (tId) {
        try {
          // 2. बैकएंड से उस टेनेंट की पूरी जानकारी मांग रहे हैं
          const response = await axios.get(`https://saksham-backend-9719.onrender.com/api/admin/profile-details/${tId}`);
          
          if (response.data) {
            console.log("Database Response:", response.data);
            setTenantData({
              // आपके डेटाबेस टेबल की कॉलम का नाम 'municipality_name' है
              name: response.data.municipality_name || "SAKSHAM",
              // डेटाबेस का पाथ + बैकएंड का URL
              logo: response.data.muni_logo_url 
                    ? `https://saksham-backend-9719.onrender.com${response.data.muni_logo_url}` 
                    : "/logo.png",
              plan: response.data.plan_id || "Municipal Standard"
            });
          }
        } catch (error) {
          console.error("Sidebar API Error:", error);
          // अगर API फेल हो जाए तो कम से कम नाम दिखा दो
          const uName = localStorage.getItem('userName');
          setTenantData(prev => ({ ...prev, name: uName || "SAKSHAM" }));
        }
      }
    };

    getBranding();
  }, []);

  // --- MASTER MENU CONFIGURATION ---
  const menuItems = [
    { id: 'dash', label: 'Dashboard Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { 
      id: 'live', label: 'Live Tracking (Map)', icon: Navigation,
      subItems: [
        { label: 'Staff Live Location', path: '/admin/live-staff' },
        { label: 'Vehicle Movement', path: '/admin/live-vehicles' },
        { label: 'Sulabh Sauchalay Map', path: '/admin/live-toilets' },
        { label: 'Garbage Dump Points', path: '/admin/live-gvps' }
      ]
    },
    { 
      id: 'ward', label: 'Ward & Households', icon: Home,
      subItems: [
        { label: 'Ward Definition', path: '/admin/wards' },
        { label: 'GIS Boundary Mapping', path: '/admin/mapping' },
        { label: 'Road Hierarchy Entry', path: '/admin/roads' },
        { label: 'Household Registry', path: '/admin/households' },
        { label: 'Bulk QR Generator', path: '/admin/qr-management' }
      ]
    },
    { 
      id: 'vehicle_mgmt', label: 'Vehicle Management', icon: Truck,
      subItems: [
        { label: 'Add New Vehicle', path: '/admin/vehicles/inventory' },
        { label: 'Fleet Requests', path: '/admin/vehicles/fleetrequest' },
        { label: 'Ward Deployment', path: '/admin/vehicles/assign-ward' },
        { label: 'Vehicle Maintenance', path: '/admin/vehicles/maintenance' },
        { label: 'Fuel & Coupon Logs', path: '/admin/vehicles/fuel-management' },
        { label: 'Maintenance & Insurance', path: '/admin/vehicles/fitness-docs' },
        { label: 'GPS Device Status', path: '/admin/vehicles/gps-health' }
      ]
    },
    { 
      id: 'staff_mgmt', label: 'Human Resources', icon: Users,
      subItems: [
        { label: 'Organization Hierarchy', path: '/admin/hierarchy' },
        { label: 'Role Management', path: '/admin/roles' },
        { label: 'User & Staff List', path: '/admin/users' },
        { label: 'Work Assignment', path: '/admin/assign-work' },
        { label: 'Smart Attendance', path: '/admin/attendance' }
      ]
    },
    { 
      id: 'swm', label: 'SWM Operations', icon: Truck,
      subItems: [
        { label: 'D2D Collection Logs', path: '/admin/swm-logs' },
        { label: 'Route Optimization', path: '/admin/routes' },
        { label: 'Waste Processing Plant', path: '/admin/processing' },
         { label: 'MRF Intelligence', path: '/admin/mrf' }
      ]
    },
    { id: 'grievance', label: 'Grievance Redressal', icon: AlertCircle, path: '/admin/complaints' },
    { 
      id: 'reports', label: 'Report Centre', icon: FileText,
      subItems: [
        { label: 'Collection Reports', path: '/admin/reports/collection' },
        { label: 'Staff Performance', path: '/admin/reports/staff' },
        { label: 'Complaint Analytics', path: '/admin/reports/grievance' },
        { label: 'Fuel & Mileage Analysis', path: '/admin/reports/fuel-analysis' },
        { label: 'Saksham AI', path: '/admin/reports/ai' }
      ]
    },
    { id: 'config', label: 'System Configuration', icon: Settings, path: '/admin/settings' },
    { id: 'device', label: 'Device & Control', icon: Smartphone, path: '/admin/device-control' },
    { 
      id: 'iec', label: 'IEC Operations', icon: Truck,
      subItems: [
        { label: 'Training Program', path: '/admin/swm-logs' },
        { label: 'Route Optimization', path: '/admin/routes' },
        { label: 'Waste Processing Plant', path: '/admin/processing' }
      ]
    },
  ];

  return (
    <motion.aside 
      animate={{ width: isOpen ? 280 : 90 }}
      className="bg-emerald-900 h-screen sticky top-0 overflow-hidden text-white z-[100] shadow-[10px_0_40px_rgba(0,0,0,0.1)] flex flex-col"
    >
      {/* Brand Section - यह हिस्सा अब पूरी तरह Dynamic है */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10 h-20 bg-emerald-950/50">
        <img 
          src={tenantData.logo} 
          className="w-10 h-10 object-contain rounded-lg shadow-sm" 
          alt="Brand Logo" 
          onError={(e) => { e.target.src = "/logo.png" }} 
        />
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-[14px] font-black tracking-tighter uppercase leading-none block text-white truncate max-w-[165px]">
              {tenantData.name}
            </span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1 block">City Admin Pro</span>
          </motion.div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar pt-6">
        {menuItems.map((item) => (
          <div key={item.id}>
            <div 
              onClick={() => item.subItems ? (isOpen && setOpenSub(openSub === item.id ? null : item.id)) : navigate(item.path)}
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-300
                ${location.pathname === item.path ? 'bg-white text-emerald-900 shadow-xl scale-[1.02]' : 'text-emerald-50 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`${location.pathname === item.path ? 'text-emerald-700' : 'text-emerald-300'}`}>
                  <item.icon size={22} />
                </div>
                {isOpen && <span className="font-bold text-[13px] tracking-tight">{item.label}</span>}
              </div>
              {isOpen && item.subItems && (
                <motion.div animate={{ rotate: openSub === item.id ? 180 : 0 }}>
                  <ChevronDown size={14} className="opacity-50" />
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {isOpen && item.subItems && openSub === item.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden ml-10 mt-2 space-y-1"
                >
                  {item.subItems.map((sub, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => navigate(sub.path)} 
                      className="p-2.5 text-[12px] font-bold text-emerald-300 hover:text-white cursor-pointer flex items-center gap-2 transition-colors group"
                    >
                       <div className="w-1.5 h-1.5 border border-emerald-500 rounded-full group-hover:bg-emerald-400 group-hover:border-emerald-400 transition-all" /> 
                       {sub.label}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      {isOpen && (
        <div className="p-2 bg-emerald-950/30 border-t border-white/3">
           <div className="bg-emerald-800/50 p-2 rounded-2xl border border-emerald-700/50">
              <div className="flex items-center gap-2 mb-1">
                 <ShieldCheck size={14} className="text-emerald-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Active Plan</span>
              </div>
              <p className="text-xs font-bold text-white uppercase">{tenantData.plan}</p>
           </div>
        </div>
      )}
    </motion.aside>
  );
};

export default CitySidebar;
