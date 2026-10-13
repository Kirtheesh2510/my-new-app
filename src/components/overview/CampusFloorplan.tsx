import React from 'react';
import { 
  Users, 
  Wind, 
  Tv, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Room } from '../../types';

export const CampusFloorplan: React.FC = () => {
  const { rooms, setSelectedRoomId, setActiveTab } = useApp();

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('rooms');
  };

  const getStatusBadge = (room: Room) => {
    if (room.override.isOverridden) {
      return {
        bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        ring: 'hover:ring-indigo-500',
        label: 'Override Active',
        dot: 'bg-indigo-500'
      };
    }
    if (room.decision.isConflictingEvidence) {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        ring: 'hover:ring-amber-500',
        label: 'Verify (Conflict)',
        dot: 'bg-amber-500'
      };
    }
    if (room.decision.isProbableWaste) {
      return {
        bg: 'bg-rose-50 border-rose-200 text-rose-800',
        ring: 'hover:ring-rose-500',
        label: `Waste (${room.decision.wasteScore}%)`,
        dot: 'bg-rose-600'
      };
    }
    if (room.timetable.isActiveNow) {
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        ring: 'hover:ring-emerald-500',
        label: 'Class In Session',
        dot: 'bg-emerald-500'
      };
    }
    return {
      bg: 'bg-slate-50 border-slate-200 text-slate-600',
      ring: 'hover:ring-slate-400',
      label: 'Standby Safe',
      dot: 'bg-slate-400'
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Interactive Campus Space Blueprint & Zone Map
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time heuristic telemetry overlay across monitored blocks. Click any zone to inspect room sensors.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Probable Waste
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Sensor Conflict
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active In Use
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Kindness Override
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Safe Standby
          </span>
        </div>
      </div>

      {/* Blueprint Schematic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-900/95 p-4 rounded-xl border border-slate-800 shadow-inner relative overflow-hidden">
        {/* Subtle architectural grid pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {rooms.map((room) => {
          const status = getStatusBadge(room);
          const hasWaste = room.decision.isProbableWaste;
          const isConflict = room.decision.isConflictingEvidence;

          return (
            <div
              key={room.id}
              onClick={() => handleSelectRoom(room.id)}
              className={`relative bg-slate-800/90 hover:bg-slate-800 border rounded-xl p-4 cursor-pointer transition-all duration-200 group flex flex-col justify-between ${
                hasWaste
                  ? 'border-rose-500/80 shadow-md shadow-rose-950/50'
                  : isConflict
                  ? 'border-amber-500/80 shadow-md shadow-amber-950/50'
                  : room.override.isOverridden
                  ? 'border-indigo-500/80'
                  : 'border-slate-700/80 hover:border-slate-500'
              }`}
            >
              <div>
                {/* Header: Room code and status badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-blue-300 border border-slate-600">
                      {room.id}
                    </span>
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[130px]">
                      {room.name.split(' ')[0]} {room.name.split(' ')[1] || ''}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${status.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                    {status.label}
                  </span>
                </div>

                {/* Subtitle / Department */}
                <p className="text-[11px] text-slate-400 mb-3">
                  {room.block} • {room.floor}
                </p>

                {/* Sensor telemetry gauges */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 mb-3 font-mono text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Occupancy</span>
                    <div className="flex items-center gap-1 text-slate-200 font-bold">
                      <Users className="w-3 h-3 text-blue-400" />
                      <span>{room.sensors.cameraDetectedCount}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Motion</span>
                    <span className={`text-[11px] font-bold ${room.sensors.recentMotionDetected ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {room.sensors.recentMotionDetected ? 'ACTIVE' : `${room.sensors.minutesSinceLastMotion}m idle`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Temp / CO2</span>
                    <span className="text-[11px] text-slate-300 font-bold">
                      {room.sensors.roomTemperatureC}°C
                    </span>
                  </div>
                </div>

                {/* Active Equipment Indicators */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[10px] text-slate-400 font-sans uppercase">Load:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      title={`Lights: ${room.equipment.lights ? 'ON (0.4kW)' : 'OFF'}`}
                      className={`p-1 rounded ${
                        room.equipment.lights
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-slate-700/50 text-slate-500'
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                    </span>
                    <span
                      title={`AC: ${room.equipment.ac ? 'ON (2.2kW)' : 'OFF'}`}
                      className={`p-1 rounded ${
                        room.equipment.ac
                          ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                          : 'bg-slate-700/50 text-slate-500'
                      }`}
                    >
                      <Wind className="w-3.5 h-3.5" />
                    </span>
                    <span
                      title={`Projector: ${room.equipment.projector ? 'ON (0.35kW)' : 'OFF'}`}
                      className={`p-1 rounded ${
                        room.equipment.projector
                          ? 'bg-purple-400/20 text-purple-300 border border-purple-400/30'
                          : 'bg-slate-700/50 text-slate-500'
                      }`}
                    >
                      <Tv className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">
                  {room.decision.isProbableWaste ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      Waste: {room.decision.equipmentWasteKw} kW (₹{room.decision.hourlyWasteCostInr}/h)
                    </span>
                  ) : (
                    <span className="text-slate-400">Heuristic Score: {room.decision.wasteScore}</span>
                  )}
                </span>
                <span className="text-blue-400 group-hover:text-blue-300 flex items-center gap-1 font-medium">
                  Inspect <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
