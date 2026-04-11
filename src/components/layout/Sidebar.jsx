import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Users, CreditCard, 
  Settings, ChevronDown, ChevronRight, ShieldCheck, 
  FileText, History, HelpCircle, HardDrive 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { id: 'dash', label: 'Dashboard', icon: LayoutDashboard, path: '/super-admin/dashboard' },
  { 
    id: 'muni', label: 'Municipalities', icon: Building2,
    subItems: [
      { label: 'New Requests', path: '/super-admin/requests' },
      { label: 'Active Cities', path: '/super-admin/tenants' },
      { label: 'City Performance', path: '/super-admin/performance' }
    ]
  },
  { 
    id: 'rev', label: 'Revenue & Billing', icon: CreditCard,
    subItems: [
      { label: 'All Invoices', path: '/super-admin/invoices' },
      { label: 'Subscription Plans', path: '/super-admin/plans' }
    ]
  },
  { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck, path: '/super-admin/roles' },
  { id: 'tickets', label: 'Support Tickets', icon: HelpCircle, path: '/super-admin/tickets' },
  { id: 'logs', label: 'System Logs', icon: History, path: '/super-admin/logs' },
  { id: 'settings', label: 'Global Settings', icon: Settings, path: '/super-admin/settings' },
];

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState(null);

  return (
    <motion.aside 
      animate={{ width: isOpen ? 280 : 90 }}
      className="bg-gradient-to-b from-emerald-700 to-emerald-900 h-screen sticky top-0 overflow-hidden text-white z-[100] shadow-[10px_0_30px_rgba(0,0,0,0.1)] flex flex-col"
    >
      {/* Brand Section */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10 h-20">
        <img src="/logo.png" alt="Saksham Logo" className="w-10 h-10 object-contain brightness-0 invert" />
        {isOpen && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">
            Saksham City
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <div key={item.id}>
            <div 
              onClick={() => item.subItems ? (isOpen && setOpenSubMenu(openSubMenu === item.id ? null : item.id)) : navigate(item.path)}
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all hover:bg-white/10
                ${location.pathname === item.path ? 'bg-white text-emerald-800 shadow-xl' : 'text-emerald-50'}`}
              title={!isOpen ? item.label : ""}
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} className={location.pathname === item.path ? 'text-emerald-700' : ''} />
                {isOpen && <span className="font-bold text-sm">{item.label}</span>}
              </div>
              {isOpen && item.subItems && (
                openSubMenu === item.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />
              )}
            </div>

            {/* Sub Menu */}
            <AnimatePresence>
              {isOpen && item.subItems && openSubMenu === item.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden ml-10 mt-2 space-y-1"
                >
                  {item.subItems.map((sub, idx) => (
                    <div key={idx} onClick={() => navigate(sub.path)} className="p-2 text-xs font-bold text-emerald-200 hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full" /> {sub.label}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;