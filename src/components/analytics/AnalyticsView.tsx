import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  IndianRupee, 
  Calendar, 
  ShieldAlert, 
  Zap, 
  Award,
  AlertTriangle,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { rooms, settings, totalAvoidableKw, totalHourlyCostInr } = useApp();
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('7d');

  // Simulated 24-hour / multi-day trend dataset
  const trendData = [
    { time: '08:00', totalConsumption: 8.2, avoidableWaste: 0.4 },
    { time: '09:00', totalConsumption: 14.5, avoidableWaste: 1.2 },
    { time: '10:00', totalConsumption: 18.2, avoidableWaste: 0.8 },
    { time: '11:00', totalConsumption: 19.8, avoidableWaste: totalAvoidableKw || 2.95 },
    { time: '12:00', totalConsumption: 16.4, avoidableWaste: 3.2 },
    { time: '13:00', totalConsumption: 11.0, avoidableWaste: 2.8 },
    { time: '14:00', totalConsumption: 15.6, avoidableWaste: 1.5 },
    { time: '15:00', totalConsumption: 17.1, avoidableWaste: 1.1 },
    { time: '16:00', totalConsumption: 16.8, avoidableWaste: 1.9 },
    { time: '17:00', totalConsumption: 13.2, avoidableWaste: 2.4 },
    { time: '18:00', totalConsumption: 7.5, avoidableWaste: 3.1 },
    { time: '19:00', totalConsumption: 4.2, avoidableWaste: 2.1 }
  ];

  // Device category radar data matching Image 2
  const radarData = [
    { subject: 'HVAC (AC)', current: 65, benchmark: 30 },
    { subject: 'Lighting', current: 45, benchmark: 25 },
    { subject: 'Projectors', current: 35, benchmark: 15 },
    { subject: 'Lab PCs', current: 50, benchmark: 35 },
    { subject: 'Standby Aux', current: 20, benchmark: 10 }
  ];

  // Room waste ranking data
  const rankingData = [...rooms]
    .sort((a, b) => b.decision.wasteScore - a.decision.wasteScore)
    .map(r => ({
      name: r.id,
      score: r.decision.wasteScore,
      cost: r.decision.hourlyWasteCostInr
    }));

  // Financial calculations
  const dailySavings = Math.round(totalHourlyCostInr * 8);
  const weeklySavings = Math.round(dailySavings * 6);
  const monthlySavings = Math.round(dailySavings * 26);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Range Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Campus Energy & Avoidable Waste Analytics
            </h2>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
              SIMULATED TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical heuristic models tracking campus kilowatt-hour conservation potential.
          </p>
        </div>

        {/* Date Filter & Export */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === 'today' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === '7d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === '30d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={() => alert('Exporting Synesis 26 energy audit summary report as CSV...')}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit
          </button>
        </div>
      </div>

      {/* KPI Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Daily Avoidable Cost</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">
              ₹{dailySavings.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">/ 8h day</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            Assuming {totalAvoidableKw} kW load remediated
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Weekly Savings Potential</span>
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <Zap className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">
              ₹{weeklySavings.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">/ 6 days</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-blue-600" />
            Equivalent to {(totalAvoidableKw * 48).toFixed(0)} kWh conserved
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Monthly Institutional Impact</span>
            <span className="p-1 rounded bg-indigo-50 text-indigo-600">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">
              ₹{monthlySavings.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">/ 26 days</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-indigo-600" />
            Reduces carbon footprint by ~{(monthlySavings * 0.82 / 10).toFixed(0)} kg CO₂
          </p>
        </div>
      </div>

      {/* Main Trends Area Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Hourly Power Demand vs Unoccupied Avoidable Waste
            </h3>
            <p className="text-xs text-slate-500">
              Simulated campus profile comparing total grid intake against empty classroom draw.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500"></span>
              <span className="text-slate-600">Campus Total (kW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500"></span>
              <span className="text-rose-600 font-bold">Avoidable Waste (kW)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis unit="kW" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFF',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="totalConsumption" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Power Draw" />
              <Area type="monotone" dataKey="avoidableWaste" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorWaste)" name="Avoidable Waste Load" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Recurring Problem Rooms & Equipment Category Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recurring Problem Rooms */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Recurring Problem Rooms by Waste Score
              </h3>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                Action Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ranked list of campus spaces exhibiting frequent unoccupied power consumption.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankingData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} axisLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${val}% Waste Score`, 'Severity']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="score" fill="#F43F5E" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Primary culprit: Unattended Air Conditioning in LH-101 & TR-301</span>
          </div>
        </div>

        {/* Equipment Category Radar Chart matching Image 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Equipment Waste Factor vs Benchmark Radar
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Appliance Split
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Evaluation of individual appliance power draws contributing to overall campus waste.
            </p>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar name="Active Waste Draw" dataKey="current" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                  <Radar name="Target Benchmark" dataKey="benchmark" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Active Draw
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Target Benchmark
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
