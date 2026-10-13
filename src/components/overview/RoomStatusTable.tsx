import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Lightbulb, 
  Wind, 
  Tv, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Sliders, 
  ArrowRight,
  Power
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Room } from '../../types';

export const RoomStatusTable: React.FC = () => {
  const { 
    rooms, 
    toggleEquipment, 
    setSelectedRoomId, 
    setActiveTab,
    markRoomSafe 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.block.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'WASTE') return room.decision.isProbableWaste;
    if (filterType === 'CONFLICT') return room.decision.isConflictingEvidence;
    if (filterType === 'OVERRIDDEN') return room.override.isOverridden;
    if (filterType === 'ACTIVE') return room.timetable.isActiveNow;
    return true;
  });

  const handleInspect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('rooms');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Monitored Classrooms & Status Register
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Heuristic decision score and live equipment controls. Toggling equipment updates calculations in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search room or block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44 lg:w-56"
            />
          </div>

          {/* Filter Chips */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter Rooms by Status"
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Rooms ({rooms.length})</option>
            <option value="WASTE">Probable Waste ({rooms.filter(r => r.decision.isProbableWaste).length})</option>
            <option value="CONFLICT">Verification Conflicts ({rooms.filter(r => r.decision.isConflictingEvidence).length})</option>
            <option value="OVERRIDDEN">Kindness Overridden ({rooms.filter(r => r.override.isOverridden).length})</option>
            <option value="ACTIVE">Classes In Session ({rooms.filter(r => r.timetable.isActiveNow).length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
            <tr>
              <th className="py-3 px-4">Room & Space</th>
              <th className="py-3 px-4">Camera Count</th>
              <th className="py-3 px-4">Timetable</th>
              <th className="py-3 px-4">PIR Motion</th>
              <th className="py-3 px-4">Equipment Toggles</th>
              <th className="py-3 px-4">Waste Score</th>
              <th className="py-3 px-4">Decision Status</th>
              <th className="py-3 px-4 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRooms.map((room) => {
              const { decision } = room;
              const hasWaste = decision.isProbableWaste;
              const isConflict = decision.isConflictingEvidence;

              return (
                <tr 
                  key={room.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Room ID & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleInspect(room.id)}
                        className="font-mono font-bold text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors border border-blue-200/60"
                      >
                        {room.id}
                      </button>
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {room.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {room.block} • {room.floor}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Camera Estimate */}
                  <td className="py-3 px-4 font-mono">
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      room.sensors.cameraDetectedCount > 0 ? 'text-blue-700' : 'text-slate-500'
                    }`}>
                      {room.sensors.cameraDetectedCount} people
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {Math.round(room.sensors.cameraConfidence * 100)}% conf
                    </span>
                  </td>

                  {/* Timetable */}
                  <td className="py-3 px-4">
                    {room.timetable.isActiveNow ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          Active Class
                        </span>
                        <p className="text-[10px] text-slate-500 truncate max-w-[120px] mt-0.5">
                          {room.timetable.subject}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          Ended {room.timetable.endTime}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          No session
                        </p>
                      </div>
                    )}
                  </td>

                  {/* PIR Motion */}
                  <td className="py-3 px-4 font-mono">
                    {room.sensors.recentMotionDetected ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <div>
                        <span className="text-slate-500 font-medium text-[11px]">
                          Idle
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {room.sensors.minutesSinceLastMotion}m ago
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Equipment Toggles */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {/* Lights Toggle */}
                      <button
                        onClick={() => toggleEquipment(room.id, 'lights')}
                        title={`Lights: Click to toggle ${room.equipment.lights ? 'OFF' : 'ON'}`}
                        className={`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${
                          room.equipment.lights
                            ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-xs'
                            : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">LGT</span>
                      </button>

                      {/* AC Toggle */}
                      <button
                        onClick={() => toggleEquipment(room.id, 'ac')}
                        title={`AC: Click to toggle ${room.equipment.ac ? 'OFF' : 'ON'}`}
                        className={`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${
                          room.equipment.ac
                            ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-xs'
                            : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Wind className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">AC</span>
                      </button>

                      {/* Projector Toggle */}
                      <button
                        onClick={() => toggleEquipment(room.id, 'projector')}
                        title={`Projector: Click to toggle ${room.equipment.projector ? 'OFF' : 'ON'}`}
                        className={`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${
                          room.equipment.projector
                            ? 'bg-purple-100 border-purple-300 text-purple-800 shadow-xs'
                            : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">AV</span>
                      </button>
                    </div>
                  </td>

                  {/* Waste Score */}
                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-200 rounded-full h-2 overflow-hidden shrink-0">
                        <div
                          className={`h-full rounded-full ${
                            decision.wasteScore > 60
                              ? 'bg-red-500'
                              : decision.wasteScore > 20
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${decision.wasteScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">
                        {decision.wasteScore}
                      </span>
                    </div>
                    {hasWaste && (
                      <span className="text-[10px] text-red-600 font-semibold block mt-0.5">
                        +{decision.equipmentWasteKw} kW waste
                      </span>
                    )}
                  </td>

                  {/* Decision Status */}
                  <td className="py-3 px-4">
                    {room.override.isOverridden ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
                        <ShieldCheck className="w-3 h-3 text-indigo-600" />
                        Override Active
                      </span>
                    ) : isConflict ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-300 text-amber-800">
                        <HelpCircle className="w-3 h-3 text-amber-600" />
                        Verify Needed
                      </span>
                    ) : hasWaste ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 border border-red-300 text-red-700">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                        Ghost Room Alert
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Normal Safe
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {hasWaste && (
                        <button
                          onClick={() => markRoomSafe(room.id)}
                          title="Power down equipment & clear waste"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Power className="w-3 h-3" />
                          Safe
                        </button>
                      )}
                      <button
                        onClick={() => handleInspect(room.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[11px] border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
