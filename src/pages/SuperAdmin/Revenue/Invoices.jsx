import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import { FileText, Download, Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Backend se active cities ka data hi invoices ki tarah fetch karenge
    fetch('https://saksham-backend-9719.onrender.com/api/super-admin/active-tenants')
      .then(res => res.json())
      .then(res => {
        setInvoices(res.data);
        setLoading(false);
      });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <header className="flex flex-col md:row-reverse md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Billing & Invoices</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Manage municipal payments and tax receipts</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium text-sm" placeholder="Search Invoice or City..." />
            </div>
            <button className="p-2.5 bg-white rounded-xl ring-1 ring-slate-200 text-slate-400 hover:text-emerald-600 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </header>

        {/* Invoice Table Style */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
                  <th className="p-6">Invoice ID</th>
                  <th className="p-6">Municipality</th>
                  <th className="p-6">Bill Date</th>
                  <th className="p-6">Amount</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={inv.tenant_id} 
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                          <FileText size={18} />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-500 uppercase">INV-{inv.tenant_id.split('-')[2]}-{new Date().getFullYear()}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-slate-700 text-sm uppercase">{inv.municipality_name}</p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">{inv.tenant_id}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-slate-600">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-slate-800 text-lg">₹{inv.total_price.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Includes 18% GST</p>
                    </td>
                    <td className="p-6">
                       <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
                          <CheckCircle size={12} /> PAID
                       </span>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 active:scale-95">
                          <Download size={14} /> Download PDF
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {invoices.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <AlertCircle size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No Billing History Found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Invoices;