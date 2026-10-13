import React from 'react';
import { 
  DoorClosed, 
  AlertTriangle, 
  Zap, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert,
  Gauge
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KpiCards: React.FC = () => {
  const { 
    totalMonitoredRooms, 
    roomsNeedingVerification, 
    totalAvoidableKw, 
    totalHourlyCostInr,
    rooms,
    settings 
  } = useApp();

  // Calculate total active load vs waste
  const totalActiveLoadKw = Number(rooms.reduce((sum, r) => {
    let kw = 0;
    if (r.equipment.lights) kw += settings.powerRatings.lights;
    if (r.equipment.ac) kw += settings.powerRatings.ac;
    if (r.equipment.projector) kw += settings.powerRatings.projector;
    if (r.equipment.computers) kw += settings.powerRatings.computers;
    return sum + kw;
  }, 0).toFixed(2));

  // Projected 30-day savings assuming 8 operational hours/day
  const monthlyProjectedSavingsInr = Math.round(totalHourlyCostInr * 8 * 26); // 26 working days

  const kpis = [
    {
      id: 'monitored',
      title: 'Monitored Spaces',
      value: totalMonitoredRooms,
      unit: 'Active Rooms',
      subtext: 'Academic Block A & Tech Wing',
      trend: '100% online',
      trendUp: true,
      icon: DoorClosed,
      color: 'blue'
    },
    {
      id: 'verification',
      title: 'Verification Needed',
      value: roomsNeedingVerification,
      unit: 'Rooms Flagged',
      subtext: 'Kindness Rule: human check required',
      trend: roomsNeedingVerification > 0 ? 'Action required' : 'Sensors aligned',
      trendUp: false,
      isWarning: roomsNeedingVerification > 0,
      icon: ShieldAlert,
      color: 'amber'
    },
    {
      id: 'avoidable',
      title: 'Avoidable Waste Load',
      value: totalAvoidableKw,
      unit: 'kW (Active)',
      subtext: `Out of ${totalActiveLoadKw} kW total campus draw`,
      trend: totalAvoidableKw > 0 ? `${Math.round((totalAvoidableKw / (totalActiveLoadKw || 1)) * 100)}% avoidable` : 'Zero waste',
      trendUp: false,
      icon: Zap,
      color: 'red'
    },
    {
      id: 'cost',
      title: 'Hourly Avoidable Cost',
      value: `₹${totalHourlyCostInr.toFixed(2)}`,
      unit: '/ hr',
      subtext: `~₹${monthlyProjectedSavingsInr.toLocaleString()} / mo projected`,
      trend: `Tariff: ₹${settings.electricityTariffInr.toFixed(2)}/kWh`,
      trendUp: true,
      icon: IndianRupee,
      color: 'emerald'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    kpi.color === 'blue'
                      ? 'bg-blue-50 text-blue-600'
                      : kpi.color === 'amber'
                      ? 'bg-amber-50 text-amber-600'
                      : kpi.color === 'red'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {kpi.value}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {kpi.unit}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 truncate mr-2">
                {kpi.subtext}
              </span>
              <span
                className={`font-semibold shrink-0 px-2 py-0.5 rounded-full text-[11px] ${
                  kpi.isWarning
                    ? 'bg-amber-100 text-amber-800 font-bold'
                    : kpi.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {kpi.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
