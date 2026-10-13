import React from 'react';
import { 
  Bell, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  IndianRupee, 
  CheckCircle2, 
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScenarioPreset } from '../../types';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentScenario, 
    setScenario, 
    settings, 
    activeAlertsCount,
    resetAll 
  } = useApp();

  const tabTitles: Record<string, string> = {
    overview: 'Campus Overview & Waste Intelligence',
    rooms: 'Classrooms & Spaces Inventory',
    analytics: 'Energy Consumption & Savings Analytics',
    alerts: 'Priority Verification & Alarm Queue',
    settings: 'Decision Heuristic & Tariff Settings'
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScenario(e.target.value as ScenarioPreset);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span>Campus Intel</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold capitalize">{activeTab}</span>
        </div>
        <div className="h-4 w-px bg-slate-200 hidden md:block" />
        <span className="text-xs text-slate-600 hidden lg:inline-block">
          {tabTitles[activeTab]}
        </span>
      </div>

      {/* Right Controls: Scenario Switcher, Badges, Notifications */}
      <div className="flex items-center gap-3">
        {/* Hackathon Interactive Scenario Switcher */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline uppercase tracking-wide">
            Demo Scenario:
          </span>
          <select
            value={currentScenario}
            onChange={handleScenarioChange}
            aria-label="Demo Scenario Selector"
            className="text-xs font-medium text-slate-800 bg-transparent border-none focus:outline-hidden cursor-pointer"
          >
            <option value="DEFAULT">Normal Routine (Mixed)</option>
            <option value="GHOST_CLASSROOM">Ghost Classrooms (High Waste)</option>
            <option value="SENSOR_CONFLICT">Sensor Conflict (Kindness Verification)</option>
            <option value="ACTIVE_LECTURE">Full Session (Zero Waste)</option>
            <option value="OVERNIGHT_WASTE">Overnight Idle (Unattended Equipment)</option>
          </select>
        </div>

        {/* Simulated Data Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-semibold text-blue-700">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
          <span>SIMULATED DATA</span>
        </div>

        {/* Tariff Pill */}
        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/70 text-[11px] font-semibold text-emerald-700">
          <IndianRupee className="w-3 h-3 text-emerald-600" />
          <span>{settings.electricityTariffInr.toFixed(2)}/kWh</span>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetAll}
          title="Reset simulation to default state"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setActiveTab('alerts')}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="View priority alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white"></span>
          )}
        </button>

        {/* Facility Operator Profile */}
        <div className="pl-2 border-l border-slate-200 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
            SY
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Synesis Admin</p>
            <p className="text-[10px] text-slate-500">Facility Operations</p>
          </div>
        </div>
      </div>
    </header>
  );
};
