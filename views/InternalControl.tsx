import React, { useState } from 'react';
import { InternalControlItem } from '../types';
import { CheckCircle, XCircle, AlertCircle, MinusCircle, Save } from 'lucide-react';

const INITIAL_CONTROLS: InternalControlItem[] = [
    {
        id: 'IC-001',
        controlObjective: 'Segregation of Duties',
        controlActivity: 'Cashier does not have access to post entries to the General Ledger.',
        testProcedure: 'Observe user access rights in the accounting system for 3 random cashiers.',
        result: 'NOT_TESTED',
        notes: ''
    },
    {
        id: 'IC-002',
        controlObjective: 'Authorization',
        controlActivity: 'Cash disbursements over $5,000 require dual signature/approval.',
        testProcedure: 'Select sample of 25 payments >$5,000 and inspect for dual authorization.',
        result: 'NOT_TESTED',
        notes: ''
    },
    {
        id: 'IC-003',
        controlObjective: 'Reconciliation',
        controlActivity: 'Bank reconciliations are performed weekly and reviewed by the Controller.',
        testProcedure: 'Inspect the signature and date on the last 4 weekly reconciliations.',
        result: 'NOT_TESTED',
        notes: ''
    },
    {
        id: 'IC-004',
        controlObjective: 'Physical Security',
        controlActivity: 'Cash is stored in a fireproof safe with access restricted to the Chief Cashier.',
        testProcedure: 'Physical inspection of the safe and interview regarding key/combo possession.',
        result: 'NOT_TESTED',
        notes: ''
    }
];

const InternalControl: React.FC = () => {
    const [controls, setControls] = useState<InternalControlItem[]>(INITIAL_CONTROLS);

    const updateStatus = (id: string, status: InternalControlItem['result']) => {
        setControls(prev => prev.map(c => c.id === id ? { ...c, result: status } : c));
    };

    const updateNotes = (id: string, notes: string) => {
        setControls(prev => prev.map(c => c.id === id ? { ...c, notes } : c));
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PASS': return <CheckCircle className="text-emerald-500" size={20} />;
            case 'FAIL': return <XCircle className="text-rose-500" size={20} />;
            case 'EXCEPTION': return <AlertCircle className="text-amber-500" size={20} />;
            default: return <MinusCircle className="text-slate-300" size={20} />;
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Internal Controls</h2>
                    <p className="text-slate-500 text-sm">Test of Controls (ToC) and Design Effectiveness</p>
                </div>
                <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-2">
                    <Save size={16} /> Save Workpaper
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase w-1/4">Control Activity</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase w-1/4">Test Procedure</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase w-32">Result</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Notes / Exceptions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {controls.map((control) => (
                            <tr key={control.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 align-top">
                                    <div className="font-medium text-slate-800 text-sm mb-1">{control.controlObjective}</div>
                                    <div className="text-sm text-slate-600">{control.controlActivity}</div>
                                </td>
                                <td className="p-4 align-top text-sm text-slate-600">
                                    {control.testProcedure}
                                </td>
                                <td className="p-4 align-top">
                                    <div className="flex gap-1 mb-2">
                                        <button 
                                            onClick={() => updateStatus(control.id, 'PASS')}
                                            className={`p-1 rounded hover:bg-emerald-50 ${control.result === 'PASS' ? 'bg-emerald-100 ring-1 ring-emerald-500' : ''}`}
                                            title="Pass"
                                        >
                                            <CheckCircle className={control.result === 'PASS' ? 'text-emerald-600' : 'text-slate-300 hover:text-emerald-400'} size={20} />
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(control.id, 'FAIL')}
                                            className={`p-1 rounded hover:bg-rose-50 ${control.result === 'FAIL' ? 'bg-rose-100 ring-1 ring-rose-500' : ''}`}
                                            title="Fail"
                                        >
                                            <XCircle className={control.result === 'FAIL' ? 'text-rose-600' : 'text-slate-300 hover:text-rose-400'} size={20} />
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(control.id, 'EXCEPTION')}
                                            className={`p-1 rounded hover:bg-amber-50 ${control.result === 'EXCEPTION' ? 'bg-amber-100 ring-1 ring-amber-500' : ''}`}
                                            title="Exception with Note"
                                        >
                                            <AlertCircle className={control.result === 'EXCEPTION' ? 'text-amber-600' : 'text-slate-300 hover:text-amber-400'} size={20} />
                                        </button>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        control.result === 'PASS' ? 'bg-emerald-100 text-emerald-800' :
                                        control.result === 'FAIL' ? 'bg-rose-100 text-rose-800' :
                                        control.result === 'EXCEPTION' ? 'bg-amber-100 text-amber-800' :
                                        'bg-slate-100 text-slate-500'
                                    }`}>
                                        {control.result}
                                    </span>
                                </td>
                                <td className="p-4 align-top">
                                    <textarea 
                                        value={control.notes}
                                        onChange={(e) => updateNotes(control.id, e.target.value)}
                                        placeholder="Enter observations..."
                                        className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none h-20 resize-none bg-white"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InternalControl;