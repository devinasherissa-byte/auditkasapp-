import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Planning from './views/Planning';
import Execution from './views/Execution';
import InternalControl from './views/InternalControl';
import Reporting from './views/Reporting';
import FieldWork from './views/FieldWork';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard />;
      case 'PLANNING': return <Planning />;
      case 'INTERNAL_CONTROL': return <InternalControl />;
      case 'EXECUTION': return <Execution />;
      case 'REPORTING': return <Reporting />;
      case 'FIELD_WORK': return <FieldWork />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;