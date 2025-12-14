import React, { useState } from 'react';
import { RiskProfile } from '../types';

const Planning: React.FC = () => {
  const [materiality, setMateriality] = useState({ overall: 50000, performance: 35000 });
  const [risks, setRisks] = useState<RiskProfile[]>([
    { category: 'Cash Receipts', inherentRisk: 'HIGH', controlRisk: 'MEDIUM', detectionRisk: 'LOW' },
    { category: 'Cash Disbursements', inherentRisk: 'MEDIUM', controlRisk: 'LOW', detectionRisk: 'MEDIUM' },
    { category: 'Bank Reconciliation', inherentRisk: 'LOW', controlRisk: 'LOW', detectionRisk: 'HIGH' },
  ]);

  const handleRiskChange = (index: number, field: keyof RiskProfile, value: string) => {
    const newRisks = [...risks];
    (newRisks[index] as any)[field] = value;
    setRisks(newRisks);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Planning & Risk Assessment</h2>
        <p className="text-slate-500 text-sm">Define materiality thresholds and assess inherent risks.</p>
      </header>

      {/* Materiality Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Materiality Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Overall Materiality (OM)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400">$</span>
              <input 
                type="number" 
                value={materiality.overall}
                onChange={(e) => setMateriality({...materiality, overall: Number(e.target.value)})}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">1% of Total Assets or 5% of Net Income.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Performance Materiality (PM)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400">$</span>
              <input 
                type="number" 
                value={materiality.performance}
                onChange={(e) => setMateriality({...materiality, performance: Number(e.target.value)})}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Typically 50-75% of Overall Materiality.</p>
          </div>
        </div>
      </section>

      {/* Risk Matrix */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
           <h3 className="text-lg font-bold text-slate-800">Risk of Material Misstatement (RMM)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm">
                <th className="p-4 font-semibold border-b">Audit Area</th>
                <th className="p-4 font-semibold border-b">Inherent Risk (IR)</th>
                <th className="p-4 font-semibold border-b">Control Risk (CR)</th>
                <th className="p-4 font-semibold border-b">Detection Risk (DR)</th>
                <th className="p-4 font-semibold border-b text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{risk.category}</td>
                  {(['inherentRisk', 'controlRisk', 'detectionRisk'] as const).map((field) => (
                    <td key={field} className="p-4">
                      <select 
                        value={risk[field]}
                        onChange={(e) => handleRiskChange(idx, field, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer outline-none ${getRiskColor(risk[field])}`}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </td>
                  ))}
                  <td className="p-4 text-right">
                    <button className="text-slate-400 hover:text-emerald-600 text-sm font-medium">Edit Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 text-xs text-slate-500 text-center">
          *RMM is derived automatically from IR and CR inputs in the backend model.
        </div>
      </section>
    </div>
  );
};

export default Planning;