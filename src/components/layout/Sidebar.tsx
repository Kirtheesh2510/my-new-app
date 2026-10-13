import React from 'react';
import { 
  LayoutDashboard, 
  DoorClosed, 
  BarChart3, 
  AlertTriangle, 
  Settings, 
  Zap, 
  ShieldCheck, 
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeAlertsCount, roomsNeedingVerification, setSelectedRoomId } = useApp();

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'rooms',
      label: 'Rooms',
      icon: DoorClosed,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? activeAlertsCount : null,
      badgeColor: 'bg-red-500 text-white'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ] as const;

  const handleNavClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    if (tabId !== 'rooms') {
      setSelectedRoomId(null);
    }
  };

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
              Phantom Class
            </h1>
            <p className="text-[11px] font-medium text-blue-400 mt-1 uppercase tracking-wider flex items-center gap-1">
              <span>Energy Intel</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-semibold border border-blue-700/40">
                Synesis 26
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Campus Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Verification Notice Card */}
      {roomsNeedingVerification > 0 && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-300">
                Kindness Rule Active
              </p>
              <p className="text-[11px] text-amber-300/80 mt-0.5 leading-snug">
                {roomsNeedingVerification} room{roomsNeedingVerification > 1 ? 's require' : ' requires'} human verification due to sensor conflict.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer System Telemetry Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-slate-400 font-mono text-[11px]">DECISION ENGINE</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60">
            ONLINE
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Heuristic v2.4</span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3 h-3 text-blue-400" /> Local Standalone
          </span>
        </div>
      </div>
    </aside>
  );
};
