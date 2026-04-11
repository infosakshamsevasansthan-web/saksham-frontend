import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { ShieldCheck, UserCog, Lock, Eye } from 'lucide-react';

const Roles = () => {
  const roles = [
    { id: 1, name: 'Super Admin', access: 'Full System Control', users: 2, color: 'bg-rose-500' },
    { id: 2, name: 'City Admin', access: 'Municipality Management', users: 18, color: 'bg-emerald-500' },
    { id: 3, name: 'Supervisor', access: 'Ward Monitoring', users: 145, color: 'bg-blue-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Roles & Permissions</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(role => (
            <div key={role.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
              <div className={`w-12 h-12 ${role.color} text-white rounded-2xl flex items-center justify-center mb-6`}><ShieldCheck size={24}/></div>
              <h3 className="text-xl font-black text-slate-800">{role.name}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase mt-1">{role.access}</p>
              <div className="mt-6 flex justify-between items-center text-sm font-bold text-slate-500">
                <span>Active Users: {role.users}</span>
                <button className="text-emerald-600 hover:underline">Edit Permissions</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
export default Roles;