import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DashboardFooter from './DashboardFooter';
import Loader from '../Loader';
import { AnimatePresence } from 'framer-motion';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AnimatePresence>{loading && <Loader />}</AnimatePresence>
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="min-h-[calc(100vh-200px)]">
            {children}
          </div>
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;