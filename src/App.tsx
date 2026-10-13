import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/overview/OverviewView';
import { RoomsList } from './components/rooms/RoomsList';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AlertsView } from './components/alerts/AlertsView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* Dark Navy Persistent Sidebar */}
      <Sidebar />

      {/* Main Right Viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header with Breadcrumbs, Scenarios, and Badges */}
        <Header />

        {/* Scrollable Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'rooms' && <RoomsList />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'alerts' && <AlertsView />}
          {activeTab === 'settings' && <SettingsView />}

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <div>
              <span className="font-semibold text-slate-600">Phantom Classrooms</span>
              <span> • Campus Energy Intelligence • Built for Synesis 26</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Local Mock Engine</span>
              </span>
              <span>Zero Cloud Dependency</span>
              <span>Tariff: INR ₹/kWh</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
