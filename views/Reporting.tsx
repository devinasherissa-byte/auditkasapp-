import React, { useState } from 'react';
import { FileText, Download, Share2 } from 'lucide-react';
import { generateAuditSummary } from '../services/geminiService';

const Reporting: React.FC = () => {
    const [summary, setSummary] = useState<string>("Click 'Generate Report' to create an AI-powered summary of the audit engagement.");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        // Mock stats passed to AI (Updated with new modules)
        const stats = {
            totalTransactions: 16,
            unmatched: 3,
            fraudFlags: 2,
            internalControls: "3 Tested, 0 Exceptions",
            cashOpnameVariance: "IDR 0.00",
            materialityThreshold: 50000
        };
        const text = await generateAuditSummary(stats);
        setSummary(text || "Error generating report.");
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
             <header className="flex justify-between items-center">
                <div>
                <h2 className="text-2xl font-bold text-slate-800">Final Reporting</h2>
                <p className="text-slate-500 text-sm">Consolidated findings and Manager Sign-off</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate AI Summary'}
                    </button>
                    <button className="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </header>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <FileText className="text-emerald-600" size={24} />
                    <h1 className="text-xl font-bold text-slate-800">Independent Auditor's Summary on Cash</h1>
                </div>

                <div className="prose prose-slate max-w-none">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-slate-700 leading-relaxed min-h-[100px]">
                        {summary}
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Key Metrics</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between border-b border-slate-100 pb-2">
                                    <span>Transactions Audited</span>
                                    <span className="font-mono font-bold text-slate-800">16</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-100 pb-2">
                                    <span>Unreconciled Items</span>
                                    <span className="font-mono font-bold text-amber-600">3 Items</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-100 pb-2">
                                    <span>Cash Opname Variance</span>
                                    <span className="font-mono font-bold text-emerald-600">IDR 0.00</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-100 pb-2">
                                    <span>Internal Control Status</span>
                                    <span className="font-mono font-bold text-blue-600">Effective</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Sign-Off</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Prepared By</p>
                                    <div className="font-medium text-slate-800">John Doe (Senior Auditor)</div>
                                    <div className="text-xs text-slate-400">{new Date().toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Reviewed By</p>
                                    <div className="h-8 border-b border-dashed border-slate-300 w-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reporting;