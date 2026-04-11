import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Save, RefreshCw, BellRing, Smartphone } from 'lucide-react';

const GlobalSettings = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-black text-slate-800">Global Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-lg">System Configuration</h3>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase">Site Name</label>
              <input className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 font-bold" defaultValue="Saksham City Management" />
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                <span className="text-sm font-bold text-emerald-800">Maintenance Mode</span>
                <input type="checkbox" className="w-6 h-6 accent-emerald-600" />
              </div>
            </div>
            <button className="bg-slate-900 text-white w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
              <Save size={18}/> Update System Settings
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default GlobalSettings;