import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building, 
  Cpu, 
  ShieldAlert, 
  Sliders, 
  Check, 
  X, 
  Eye, 
  Power,
  ChevronRight,
  Filter,
  Flame,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AlertItem, AlertStatus, AlertPriority } from '../../types';

export const AlertsView: React.FC = () => {
  const { 
    alerts, 
    updateAlertStatus, 
    setSelectedRoomId, 
    setActiveTab, 
    setHumanOverride 
  } = useApp();

  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || 'AL-45602');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0];

  const filteredAlerts = alerts.filter(a => {
    if (priorityFilter === 'ALL') return true;
    return a.priority === priorityFilter;
  });

  const handleInspectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('rooms');
  };

  const handleApplyOverrideFromAlert = (alert: AlertItem) => {
    setHumanOverride(alert.roomId, {
      overrideType: 'EVENT_EXCEPTION',
      reason: `Kindness Override applied via Alarm ${alert.id}: Operator verified active study space.`
    });
    updateAlertStatus(alert.id, 'OVERRIDDEN');
  };

  const getPriorityBadge = (priority: AlertPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-600 text-white font-bold';
      case 'WARNING':
        return 'bg-amber-500 text-white font-bold';
      case 'MINOR':
        return 'bg-blue-600 text-white font-semibold';
      case 'INFO':
      default:
        return 'bg-slate-600 text-white font-medium';
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'TRIGGERED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ACKNOWLEDGED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'OVERRIDDEN':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Prioritized Alert Queue & Sensor Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry alarm queue with condition triggers and verification-first Kindness Rule dispatch.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter Alerts by Severity"
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Priorities ({alerts.length})</option>
            <option value="CRITICAL">Critical Alarms</option>
            <option value="WARNING">Warnings</option>
            <option value="INFO">Informational / Overrides</option>
          </select>
        </div>
      </div>

      {/* Main Dual-Panel View: Left Detailed Alarm Inspector (Image 1), Right Queue List (Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Detailed Alarm Card (7 cols) - Styled Exactly Like Image 1 */}
        {selectedAlert && (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
            {/* Header: ID, Title, Status */}
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600">
                  {selectedAlert.id}
                </span>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-lg border uppercase tracking-wider font-mono ${getStatusBadge(selectedAlert.status)}`}>
                  {selectedAlert.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-2">
                {selectedAlert.title}
              </h3>

              <div className="flex items-center gap-2.5 mt-2">
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-sm tracking-wider ${getPriorityBadge(selectedAlert.priority)}`}>
                  {selectedAlert.priority}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {selectedAlert.timestamp} ({selectedAlert.relativeTime})
                </span>
              </div>
            </div>

            {/* Alarm Description */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Alarm Description
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedAlert.description}
              </p>
            </div>

            {/* Condition Grid (Trigger, Threshold, Metric, Operator, Threshold Value) */}
            <div className="pt-4 border-t border-slate-100">
              <span className="font-mono text-xs font-bold text-blue-600 block mb-2">
                {selectedAlert.triggerId}
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Condition
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Trigger</span>
                  <span className="font-semibold text-slate-800">{selectedAlert.condition.trigger}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Metric</span>
                  <span className="font-semibold text-slate-800">{selectedAlert.condition.metric}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Operator</span>
                  <span className="font-mono font-bold text-slate-900">{selectedAlert.condition.operator}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Threshold Value</span>
                  <span className="font-mono font-bold text-red-600">{selectedAlert.condition.thresholdValue}</span>
                </div>
              </div>
            </div>

            {/* Target Hardware Grid */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Target
              </h4>
              <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-[10px] text-slate-400 block">Devices category</span>
                  <span className="font-semibold text-slate-800">{selectedAlert.target.deviceCategory}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Devices type</span>
                  <span className="font-semibold text-slate-800">{selectedAlert.target.deviceType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Device</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedAlert.target.device}</span>
                </div>
              </div>
            </div>

            {/* Location Grid */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Location
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-[10px] text-slate-400 block">Building</span>
                  <span className="font-semibold text-slate-800">{selectedAlert.location.building}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Floor</span>
                  <span className="font-semibold text-slate-800">{selectedAlert.location.floor}</span>
                </div>
              </div>
            </div>

            {/* Explainable Reasons */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Explainable Decision Trail
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {selectedAlert.explainableReasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateAlertStatus(selectedAlert.id, 'ACKNOWLEDGED')}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-300"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark Reviewed
                </button>

                <button
                  onClick={() => handleApplyOverrideFromAlert(selectedAlert)}
                  className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-indigo-200"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  Kindness Override
                </button>

                <button
                  onClick={() => updateAlertStatus(selectedAlert.id, 'RESOLVED')}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors"
                >
                  Dismiss
                </button>
              </div>

              <button
                onClick={() => handleInspectRoom(selectedAlert.roomId)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                Inspect {selectedAlert.roomId}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Right Queue List (5 cols) - Styled Matching Image 1 Overlay List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Alarm Stream
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {filteredAlerts.length} items
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
            {filteredAlerts.map((alert) => {
              const isSelected = alert.id === selectedAlertId;

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600 block">
                        {alert.id}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
                        {alert.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {alert.roomId} • {alert.target.device}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded-sm tracking-wider ${getPriorityBadge(alert.priority)}`}>
                        {alert.priority}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">
                        {alert.relativeTime}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
                    <span className={`font-bold uppercase ${
                      alert.status === 'TRIGGERED' ? 'text-rose-600' : 'text-blue-600'
                    }`}>
                      {alert.status}
                    </span>
                    {alert.estimatedWasteKw > 0 && (
                      <span className="text-slate-500 font-semibold">
                        Waste: {alert.estimatedWasteKw} kW
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
