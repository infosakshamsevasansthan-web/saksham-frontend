import React, { useState, useEffect } from 'react';
import CitySidebar from './CitySidebar';
import CityTopbar from './CityTopbar';
import Loader from '../../Loader';
import { AnimatePresence } from 'framer-motion';

const CityLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AnimatePresence>{loading && <Loader />}</AnimatePresence>

      <CitySidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Wrapper with guaranteed Z-index */}
        <div className="z-[100] relative">
          <CityTopbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CityLayout;