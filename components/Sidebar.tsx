import React from 'react';
import { LayoutDashboard, FileText, Activity, MapPin, ClipboardCheck, ShieldCheck, Lock } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'PLANNING', label: 'Planning & Risk', icon: <FileText size={20} /> },
    { id: 'INTERNAL_CONTROL', label: 'Internal Controls', icon: <Lock size={20} /> },
    { id: 'EXECUTION', label: 'Execution & Fraud', icon: <Activity size={20} /> },
    { id: 'FIELD_WORK', label: 'Field Audit (Mobile)', icon: <MapPin size={20} /> },
    { id: 'REPORTING', label: 'Reporting', icon: <ClipboardCheck size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-10">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <ShieldCheck className="text-emerald-400" size={28} />
        <div>
          <h1 className="font-bold text-lg tracking-tight">AuditKas</h1>
          <p className="text-xs text-slate-400">Digital Assurance</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === item.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Session Active</p>
          <p>Auditor: John Doe</p>
          <p className="truncate">Role: Manager</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;