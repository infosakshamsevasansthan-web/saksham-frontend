import React from 'react';

const DashboardFooter = () => {
  return (
    <footer className="px-8 py-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center bg-white/50 gap-4">
      <div className="text-slate-400 text-xs font-bold">
        © 2026 <span className="text-emerald-600">SAKSHAM CITY</span> MANAGEMENT SYSTEM. v1.0.4
      </div>
      <div className="flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <a href="#" className="hover:text-emerald-600">System Status</a>
        <a href="#" className="hover:text-emerald-600">Privacy Policy</a>
        <a href="#" className="hover:text-emerald-600">Support</a>
      </div>
    </footer>
  );
};

export default DashboardFooter;