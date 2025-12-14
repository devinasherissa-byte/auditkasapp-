import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle, CheckCircle, Search, TrendingUp } from 'lucide-react';

const data = [
  { name: 'Mon', ledger: 4000, bank: 4000, amt: 2400 },
  { name: 'Tue', ledger: 3000, bank: 2800, amt: 2210 },
  { name: 'Wed', ledger: 2000, bank: 2000, amt: 2290 },
  { name: 'Thu', ledger: 2780, bank: 2780, amt: 2000 },
  { name: 'Fri', ledger: 1890, bank: 4800, amt: 2181 }, // Discrepancy
  { name: 'Sat', ledger: 2390, bank: 2390, amt: 2500 },
  { name: 'Sun', ledger: 3490, bank: 3490, amt: 2100 },
];

const StatCard: React.FC<{ title: string; value: string; sub: string; icon: React.ReactNode; color: string }> = ({ title, value, sub, icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
      <p className={`text-xs mt-1 ${color}`}>{sub}</p>
    </div>
    <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')}`}>
      {React.cloneElement(icon as React.ReactElement, { className: color })}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Audit Dashboard</h2>
          <p className="text-slate-500 text-sm">Real-time overview of Cash Assurance</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">System Healthy</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Cash Balance (GL)" 
          value="$1,245,000" 
          sub="+2.4% vs Last Month" 
          icon={<TrendingUp size={24} />} 
          color="text-emerald-600" 
        />
        <StatCard 
          title="Unreconciled Items" 
          value="14" 
          sub="Requires Attention" 
          icon={<AlertTriangle size={24} />} 
          color="text-amber-500" 
        />
        <StatCard 
          title="Confirmed Fraud" 
          value="0" 
          sub="Clean Record (YTD)" 
          icon={<Search size={24} />} 
          color="text-slate-600" 
        />
        <StatCard 
          title="Field Evidence" 
          value="98%" 
          sub="Geo-tag Compliance" 
          icon={<CheckCircle size={24} />} 
          color="text-blue-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Daily Transaction Volume (Ledger vs Bank)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="ledger" name="Gen. Ledger" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bank" name="Bank Stmt" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Risk Heatmap</h3>
          <div className="space-y-4">
            {[
                { label: 'Existence', risk: 'Low', val: 20, col: 'bg-emerald-500' },
                { label: 'Completeness', risk: 'Medium', val: 45, col: 'bg-amber-500' },
                { label: 'Accuracy', risk: 'Low', val: 15, col: 'bg-emerald-500' },
                { label: 'Cut-off', risk: 'High', val: 80, col: 'bg-rose-500' },
                { label: 'Rights & Oblig.', risk: 'Low', val: 10, col: 'bg-emerald-500' },
            ].map((r) => (
                <div key={r.label}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 font-medium">{r.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded text-white ${r.col}`}>{r.risk}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${r.col}`} style={{ width: `${r.val}%` }}></div>
                    </div>
                </div>
            ))}
            
            <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 italic">
                    AI Insight: High risk in Cut-off assertion detected due to 5 transactions recorded on Jan 1st with Dec 31st value dates.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;