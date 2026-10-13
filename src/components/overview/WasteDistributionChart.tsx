import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { Zap, IndianRupee, PieChart as PieIcon, BarChart2 } from 'lucide-react';

export const WasteDistributionChart: React.FC = () => {
  const { rooms, settings } = useApp();

  // Prepare room waste comparison data
  const barData = rooms.map(room => ({
    name: room.id,
    fullName: room.name,
    wasteKw: room.decision.isProbableWaste ? room.decision.equipmentWasteKw : 0,
    wasteScore: room.decision.wasteScore,
    activeKw: Number((
      (room.equipment.lights ? settings.powerRatings.lights : 0) +
      (room.equipment.ac ? settings.powerRatings.ac : 0) +
      (room.equipment.projector ? settings.powerRatings.projector : 0) +
      (room.equipment.computers ? settings.powerRatings.computers : 0)
    ).toFixed(2))
  }));

  // Equipment category waste breakdown
  let lightsWaste = 0;
  let acWaste = 0;
  let projectorWaste = 0;
  let computersWaste = 0;

  rooms.forEach(r => {
    if (r.decision.isProbableWaste) {
      if (r.equipment.lights) lightsWaste += settings.powerRatings.lights;
      if (r.equipment.ac) acWaste += settings.powerRatings.ac;
      if (r.equipment.projector) projectorWaste += settings.powerRatings.projector;
      if (r.equipment.computers) computersWaste += settings.powerRatings.computers;
    }
  });

  const pieData = [
    { name: 'HVAC / AC Units', value: Number(acWaste.toFixed(2)), color: '#3B82F6' },
    { name: 'Lighting Arrays', value: Number(lightsWaste.toFixed(2)), color: '#F59E0B' },
    { name: 'Laser Projectors', value: Number(projectorWaste.toFixed(2)), color: '#8B5CF6' },
    { name: 'Lab Computers', value: Number(computersWaste.toFixed(2)), color: '#10B981' }
  ].filter(d => d.value > 0);

  const totalWasteKw = Number((acWaste + lightsWaste + projectorWaste + computersWaste).toFixed(2));
  const hourlySavingsInr = Number((totalWasteKw * settings.electricityTariffInr).toFixed(2));
  const dailySavingsInr = Math.round(hourlySavingsInr * 8); // 8 working hours

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Bar Chart: Room Waste Ranking (2 Columns) */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Active Load vs Avoidable Waste by Room (kW)
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Telemetry Heuristic
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Comparison of total electrical load draw vs quantified waste identified by unoccupied states.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  unit="kW"
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} kW`,
                    name === 'wasteKw' ? 'Avoidable Waste' : 'Total Power Draw'
                  ]}
                  labelFormatter={(label) => `Room ${label}`}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFF',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="activeKw" fill="#94A3B8" radius={[4, 4, 0, 0]} name="activeKw" />
                <Bar dataKey="wasteKw" fill="#EF4444" radius={[4, 4, 0, 0]} name="wasteKw" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-400"></span>
            <span>Total Active Power (kW)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span className="font-semibold text-red-600">Avoidable Waste (kW)</span>
          </div>
        </div>
      </div>

      {/* Potential Savings & Device Breakdown Panel (1 Column) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <PieIcon className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Waste by Equipment Type
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Distribution of unoccupied electrical load across appliances.
          </p>

          {/* Donut chart */}
          {pieData.length > 0 ? (
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val} kW`, 'Waste Load']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      color: '#FFF',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl">
              <span className="w-3 h-3 rounded-full bg-emerald-500 mb-2"></span>
              <p className="text-xs font-semibold text-slate-700">Zero Avoidable Waste</p>
              <p className="text-[11px] text-slate-400">All equipment properly configured for occupancy.</p>
            </div>
          )}

          {/* Legend rows */}
          <div className="space-y-1.5 mt-2">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-800">{item.value} kW</span>
              </div>
            ))}
          </div>
        </div>

        {/* Potential Savings Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              Potential Savings
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-300">
              Immediate Action
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-emerald-800 font-sans">
                ₹{dailySavingsInr}
              </span>
              <span className="text-xs text-emerald-700 ml-1 font-medium">/ 8h day</span>
            </div>
            <span className="text-xs text-emerald-800 font-semibold font-mono">
              {(totalWasteKw * 8).toFixed(1)} kWh/day
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
