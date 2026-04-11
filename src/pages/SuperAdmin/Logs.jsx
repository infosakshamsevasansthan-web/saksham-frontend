import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { History, Terminal } from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('https://saksham-backend-9719.onrender.com/api/super-admin/logs')
      .then(res => res.json()).then(res => setLogs(res.data || []));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-4"><History /> Audit Logs</h1>
        <div className="bg-slate-900 rounded-[40px] p-8 text-emerald-400 font-mono text-sm overflow-x-auto shadow-2xl">
          {logs.length > 0 ? logs.map(log => (
            <div key={log.id} className="mb-2">
              <span className="text-slate-500">[{new Date(log.created_at).toLocaleString()}]</span> 
              <span className="text-blue-400"> {log.user_name}</span> 
              <span className="text-white"> executed </span> 
              <span className="text-emerald-400">{log.action}</span>
            </div>
          )) : <div className="text-slate-500 italic font-bold">No system activity recorded yet...</div>}
        </div>
      </div>
    </AdminLayout>
  );
};
export default Logs;