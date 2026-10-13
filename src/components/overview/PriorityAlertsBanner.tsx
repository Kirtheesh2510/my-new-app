import React from 'react';
import { 
  AlertTriangle, 
  ChevronRight, 
  Check, 
  HelpCircle, 
  Clock, 
  Flame,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AlertItem } from '../../types';

export const PriorityAlertsBanner: React.FC = () => {
  const { alerts, updateAlertStatus, setSelectedRoomId, setActiveTab } = useApp();

  const activeAlerts = alerts.filter(a => a.status === 'TRIGGERED');

  if (activeAlerts.length === 0) {
    return null;
  }

  const handleInspectAlert = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('rooms');
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-200/90 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              High-Priority Verification & Waste Queue
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {activeAlerts.length} Unresolved
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Discrepancies identified by the multi-sensor heuristic requiring operator verification.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('alerts')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
        >
          View All Alerts
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {activeAlerts.slice(0, 3).map((alert: AlertItem) => {
          const isCritical = alert.priority === 'CRITICAL';
          const isWarning = alert.priority === 'WARNING';

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                isCritical
                  ? 'bg-rose-50/50 border-rose-200/80 hover:bg-rose-50'
                  : 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md mt-0.5 shrink-0 border ${
                    isCritical
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {alert.id}
                </span>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-900">
                      {alert.title}
                    </h4>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {alert.roomId}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {alert.relativeTime}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {alert.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => updateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                  className="px-2.5 py-1.5 rounded-lg text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Acknowledge
                </button>

                <button
                  onClick={() => handleInspectAlert(alert.roomId)}
                  className="px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                >
                  Inspect Room
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
