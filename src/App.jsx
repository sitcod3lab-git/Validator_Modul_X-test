import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import { darkThemeConfig } from './theme/darkTheme';
import AppLayout from './components/Layout/AppLayout';
import SingleValidator from './components/Validator/SingleValidator';
import BulkValidator from './components/Validator/BulkValidator';
import AnalyticsDashboard from './components/Validator/AnalyticsDashboard';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import './styles/global.css';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'validation':
        return <SingleValidator />;
      case 'pipeline':
        return <BulkValidator />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return (
          <div className="p-12 text-center bg-[#0D121F]/40 border border-slate-900 rounded-xl max-w-lg mx-auto mt-20 select-none cyber-panel">
            <h3 className="font-mono text-sm text-cyan-400 font-bold uppercase tracking-widest glow-text-cyan mb-3">
              View {activePage.toUpperCase()} - Coming Soon
            </h3>
            <p className="text-xs text-slate-500 font-mono max-w-xs mx-auto leading-relaxed">
              This interactive operations control module is currently being configured by the engineering automation system.
            </p>
          </div>
        );
    }
  };

  return (
    <ConfigProvider theme={darkThemeConfig}>
      <AppLayout activePage={activePage} onPageChange={setActivePage}>
        {renderContent()}
      </AppLayout>
    </ConfigProvider>
  );
}
