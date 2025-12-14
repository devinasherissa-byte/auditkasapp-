import React, { useState, useRef } from 'react';
import { Transaction } from '../types';
import { analyzeFraudRisks } from '../services/geminiService';
import { UploadCloud, CheckCheck, AlertCircle, RefreshCw, Wand2, FileSpreadsheet, ShieldCheck, Banknote } from 'lucide-react';

// --- DATASET SIMULATION ---
const CSV_DATASET_STRING = `ID,Date,Description,Amount,Type,Source
L001,2023-10-01,Payment to Vendor A,5000,CREDIT,LEDGER
L002,2023-10-02,Daily Sales,12000,DEBIT,LEDGER
L003,2023-10-03,Utility Bill,450.50,CREDIT,LEDGER
L004,2023-10-04,Petty Cash Replenish,200,CREDIT,LEDGER
L005,2023-10-05,Consulting Fee Split 1,4999,CREDIT,LEDGER
L006,2023-10-05,Consulting Fee Split 2,4999,CREDIT,LEDGER
L007,2023-10-06,Unknown Expense,10000,CREDIT,LEDGER
L008,2023-10-07,Office Supplies,150.00,CREDIT,LEDGER
L009,2023-10-07,Client Dinner,340.00,CREDIT,LEDGER
B001,2023-10-01,Check #454 Vendor A,5000,CREDIT,BANK
B002,2023-10-02,Deposit Branch 1,12000,DEBIT,BANK
B003,2023-10-04,Utility Auto-Pay,450.50,CREDIT,BANK
B004,2023-10-04,Cash Withdrawal,200,CREDIT,BANK
B005,2023-10-05,Wire Transfer 998,9998,CREDIT,BANK
B006,2023-10-07,Office Depot POS,150.00,CREDIT,BANK
B007,2023-10-09,Late Deposit,340.00,DEBIT,BANK
`;

const parseCSV = (csv: string): Transaction[] => {
    // Robust splitting for \n or \r\n and filtering empty lines
    const lines = csv.trim().split(/\r?\n/).filter(line => line.trim() !== '');
    
    // Skip header and map
    return lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        return {
            id: values[0] || `UNK-${index}`,
            date: values[1] || new Date().toISOString().split('T')[0],
            description: values[2] || 'Unknown Transaction',
            amount: parseFloat(values[3]) || 0,
            type: (values[4] as 'DEBIT' | 'CREDIT') || 'CREDIT',
            source: (values[5] as 'LEDGER' | 'BANK') || 'LEDGER',
            status: 'PENDING'
        };
    });
};

const Execution: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INGEST' | 'RECON' | 'CASH_OPNAME' | 'FRAUD'>('INGEST');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<{ summary: string; findings: {id: string, reason: string}[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cash Opname State
  const [denominations, setDenominations] = useState<{[key: number]: number}>({
      100000: 12, 50000: 4, 20000: 5, 10000: 10, 5000: 0, 2000: 0, 1000: 0, 500: 0, 200: 0, 100: 0
  });
  const [bookBalance, setBookBalance] = useState(1600000); // Mock book balance

  const handleCsvLoad = () => {
      setIsProcessing(true);
      setTimeout(() => {
          const parsed = parseCSV(CSV_DATASET_STRING);
          setTransactions(parsed);
          setIsProcessing(false);
          setActiveTab('RECON');
      }, 800);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        try {
            const parsed = parseCSV(text);
            if (parsed.length === 0) {
                alert("No valid transactions found in CSV.");
            } else {
                setTransactions(parsed);
                setActiveTab('RECON');
            }
        } catch (error) {
            console.error("CSV Parse Error", error);
            alert("Error parsing CSV. Please ensure it matches the required format.");
        }
      }
      setIsProcessing(false);
      // Reset input value to allow re-uploading the same file if needed
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const runReconciliation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newTransactions = [...transactions];
      const ledger = newTransactions.filter(t => t.source === 'LEDGER');
      const bank = newTransactions.filter(t => t.source === 'BANK');

      ledger.forEach(l => {
        // Step 1: Exact Match
        const match = bank.find(b => b.amount === l.amount && (b.date === l.date || b.status === 'PENDING') && b.type === l.type && b.status !== 'MATCHED');
        if (match) {
          l.status = 'MATCHED';
          match.status = 'MATCHED';
        } else {
             // Step 2: Tolerance (Simplified)
             const softMatch = bank.find(b => b.amount === l.amount && b.type === l.type && b.status !== 'MATCHED');
             if (softMatch) {
                 l.status = 'MATCHED';
                 l.flagReason = 'Timing Difference (Auto-Resolved)';
                 softMatch.status = 'MATCHED';
             } else {
                 l.status = 'UNMATCHED';
             }
        }
      });
      
      // Mark remaining bank items as unmatched
      bank.forEach(b => {
          if (b.status === 'PENDING') b.status = 'UNMATCHED';
      });

      setTransactions(newTransactions);
      setIsProcessing(false);
    }, 1200);
  };

  const runFraudDetection = async () => {
    setIsProcessing(true);
    const result = await analyzeFraudRisks(transactions.filter(t => t.source === 'LEDGER'));
    if (result) {
        setAiResult({
            summary: result.summary,
            findings: result.findings || []
        });
        
        const newTrans = [...transactions];
        const flaggedIds = new Set(result.flaggedIds || []);
        newTrans.forEach(t => {
            if (flaggedIds.has(t.id)) {
                t.status = 'FLAGGED';
                const finding = result.findings?.find((f: any) => f.id === t.id);
                t.flagReason = finding ? finding.reason : 'AI Flagged Anomaly';
            }
        });
        setTransactions(newTrans);
    }
    setIsProcessing(false);
  };

  const calculateTotalOpname = () => {
      return Object.entries(denominations).reduce((acc, [denom, count]) => acc + (Number(denom) * Number(count)), 0);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Execution Phase</h2>
          <p className="text-slate-500 text-sm">Data Ingestion, Reconciliation, Cash Opname & Fraud Detection</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
           {(['INGEST', 'RECON', 'CASH_OPNAME', 'FRAUD'] as const).map(tab => (
               <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
               >
                   {tab === 'INGEST' ? 'Dataset' : tab === 'RECON' ? 'Recon' : tab === 'CASH_OPNAME' ? 'Opname' : 'Fraud AI'}
               </button>
           ))}
        </div>
      </header>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {activeTab === 'INGEST' && (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="p-6 bg-emerald-50 rounded-full mb-4">
                    <UploadCloud size={48} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Import Transaction Data</h3>
                <p className="text-slate-500 max-w-md mb-8">
                    Load a dataset containing Ledger and Bank transactions (CSV format) to begin the audit.
                </p>
                
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-4">
                        <button 
                            onClick={handleCsvLoad}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                        >
                            {isProcessing ? <RefreshCw className="animate-spin" size={18}/> : <FileSpreadsheet size={18} />}
                            Load Sample Dataset
                        </button>

                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept=".csv" 
                            className="hidden" 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessing}
                            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
                        >
                            <UploadCloud size={18} />
                            Upload Custom CSV
                        </button>
                    </div>
                    
                    <div className="text-xs text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <strong>Required Columns:</strong> ID, Date, Description, Amount, Type (DEBIT/CREDIT), Source (LEDGER/BANK)
                    </div>
                </div>

                {transactions.length > 0 && (
                     <p className="mt-4 text-emerald-600 font-medium animate-fade-in">
                         ✓ {transactions.length} records loaded successfully
                     </p>
                )}
            </div>
        )}

        {activeTab === 'CASH_OPNAME' && (
            <div className="flex h-full">
                <div className="w-1/2 p-8 border-r border-slate-100 overflow-y-auto">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Banknote size={20} className="text-emerald-600"/> Physical Cash Count
                    </h3>
                    <div className="space-y-3">
                        {Object.keys(denominations).map(d => Number(d)).sort((a,b) => b-a).map((denom) => (
                            <div key={denom} className="flex items-center gap-4">
                                <span className="w-24 text-right font-mono font-medium text-slate-600">
                                    {denom.toLocaleString('id-ID')}
                                </span>
                                <span className="text-slate-400">x</span>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={denominations[denom]}
                                    onChange={(e) => setDenominations({...denominations, [denom]: parseInt(e.target.value) || 0})}
                                    className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                <span className="text-slate-400">=</span>
                                <span className="flex-1 text-right font-mono font-bold text-slate-800">
                                    {(denom * (denominations[denom] || 0)).toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-1/2 p-8 bg-slate-50 flex flex-col justify-center">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Total Physical Cash</p>
                            <p className="text-3xl font-bold text-emerald-600 font-mono">
                                IDR {calculateTotalOpname().toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500 mb-1 block">System Book Balance</label>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-mono">IDR</span>
                                <input 
                                    type="number" 
                                    value={bookBalance}
                                    onChange={(e) => setBookBalance(Number(e.target.value))}
                                    className="bg-transparent border-b border-slate-300 font-mono text-xl text-slate-800 focus:border-emerald-500 outline-none w-full"
                                />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                             <div className="flex justify-between items-center">
                                 <span className="font-bold text-slate-700">Variance</span>
                                 <span className={`text-xl font-bold font-mono ${calculateTotalOpname() - bookBalance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                     {(calculateTotalOpname() - bookBalance).toLocaleString('id-ID')}
                                 </span>
                             </div>
                             {calculateTotalOpname() !== bookBalance && (
                                 <p className="text-xs text-rose-500 mt-2 text-right">Discrepancy detected. Please recount or explain.</p>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'RECON' && (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Matched</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Unmatched</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Pending</span>
                    </div>
                    <button 
                        onClick={runReconciliation}
                        disabled={isProcessing || transactions.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <CheckCheck size={16} />}
                        Run Auto-Match
                    </button>
                </div>
                {transactions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <FileSpreadsheet size={48} className="mb-2 opacity-50"/>
                        <p>No data loaded. Go to 'Dataset' tab.</p>
                    </div>
                ) : (
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                                    <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                    <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
                                    <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Source</th>
                                    <th className="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
                                    <th className="p-3 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50">
                                        <td className="p-3 text-sm font-mono text-slate-500">{t.id}</td>
                                        <td className="p-3 text-sm text-slate-700">{t.date}</td>
                                        <td className="p-3 text-sm text-slate-700">{t.description}</td>
                                        <td className="p-3">
                                            <span className={`text-xs px-2 py-1 rounded font-medium ${t.source === 'LEDGER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {t.source}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-slate-700 text-right font-mono">
                                            {t.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                                t.status === 'MATCHED' ? 'bg-emerald-100 text-emerald-700' :
                                                t.status === 'UNMATCHED' ? 'bg-rose-100 text-rose-700' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'FRAUD' && (
            <div className="flex flex-col h-full relative">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-700">AI-Powered Anomaly Detection</h3>
                    <button 
                        onClick={runFraudDetection}
                        disabled={isProcessing || transactions.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} />}
                        Scan for Anomalies
                    </button>
                </div>

                <div className="flex-1 p-6 overflow-auto">
                    {transactions.length === 0 && (
                        <div className="text-center text-slate-400 py-12">
                            <p>No transactions to analyze. Please load data first.</p>
                        </div>
                    )}
                    
                    {aiResult && (
                        <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                            <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                <Wand2 size={16} /> Analysis Summary
                            </h4>
                            <p className="text-sm text-indigo-800 leading-relaxed">{aiResult.summary}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {transactions.filter(t => t.status === 'FLAGGED').length === 0 && !isProcessing && transactions.length > 0 && (
                            <div className="text-center text-slate-400 py-12">
                                <ShieldCheck size={48} className="mx-auto mb-2 text-slate-300" />
                                <p>No anomalies detected yet or scan not run.</p>
                            </div>
                        )}
                        
                        {transactions.filter(t => t.status === 'FLAGGED').map(t => (
                            <div key={t.id} className="bg-white border-l-4 border-amber-500 shadow-sm rounded-r-lg p-4 flex justify-between items-start animate-fade-in">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle size={16} className="text-amber-500" />
                                        <span className="font-bold text-slate-800">{t.description}</span>
                                        <span className="text-xs text-slate-400 font-mono">({t.id})</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2">
                                        Amount: <span className="font-mono font-medium text-slate-900">{t.amount.toLocaleString()}</span> • Date: {t.date}
                                    </p>
                                    <p className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded inline-block">
                                        Reason: {t.flagReason}
                                    </p>
                                </div>
                                <button className="text-xs text-blue-600 hover:underline">Investigate</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Execution;