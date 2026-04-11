import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { HelpCircle, MessageSquare, AlertCircle } from 'lucide-react';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch('https://saksham-backend-9719.onrender.com/api/super-admin/tickets')
      .then(res => res.json()).then(res => setTickets(res.data || []));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-black text-slate-800">Support Center</h1>
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          {tickets.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                <tr><th className="p-6">ID</th><th className="p-6">Subject</th><th className="p-6">Priority</th><th className="p-6">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-mono text-xs font-bold text-emerald-600">#TK-{t.id}</td>
                    <td className="p-6 font-bold text-slate-700">{t.subject}</td>
                    <td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${t.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>{t.priority}</span></td>
                    <td className="p-6"><span className="text-xs font-bold text-amber-500">{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center text-slate-400 font-bold uppercase text-xs">No active tickets</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
export default Tickets;