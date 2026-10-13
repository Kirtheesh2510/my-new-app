import React, { useState } from 'react';
import { 
  Search, 
  DoorClosed, 
  Users, 
  Zap, 
  Wind, 
  Lightbulb, 
  Tv, 
  ShieldCheck, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoomDetailsView } from './RoomDetailsView';
import { Room } from '../../types';

export const RoomsList: React.FC = () => {
  const { 
    rooms, 
    selectedRoomId, 
    setSelectedRoomId, 
    toggleEquipment 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('ALL');

  // If a room is selected, render RoomDetailsView
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  if (selectedRoom) {
    return <RoomDetailsView room={selectedRoom} onBack={() => setSelectedRoomId(null)} />;
  }

  const blocks = ['ALL', ...Array.from(new Set(rooms.map(r => r.block)))];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.id.toLowerCase().includes(search.toLowerCase()) ||
      room.name.toLowerCase().includes(search.toLowerCase());
    const matchesBlock = selectedBlock === 'ALL' || room.block === selectedBlock;
    return matchesSearch && matchesBlock;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Controls: Search & Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DoorClosed className="w-5 h-5 text-blue-600" />
            Classrooms & Monitored Spaces Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any classroom to view the simulated camera feed, sensor telemetry, and Kindness Rule overrides.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>

          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            aria-label="Filter Rooms by Academic Block"
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden cursor-pointer"
          >
            {blocks.map(b => (
              <option key={b} value={b}>
                {b === 'ALL' ? 'All Blocks' : b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const { decision } = room;
          const hasWaste = decision.isProbableWaste;
          const isConflict = decision.isConflictingEvidence;

          return (
            <div
              key={room.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                hasWaste
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isConflict
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : room.override.isOverridden
                  ? 'border-indigo-300 ring-1 ring-indigo-200'
                  : 'border-slate-200/80 hover:border-blue-300'
              }`}
            >
              <div>
                {/* Header: ID, Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-blue-700 border border-slate-200">
                    {room.id}
                  </span>

                  {room.override.isOverridden ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" /> Override Active
                    </span>
                  ) : isConflict ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-amber-600" /> Conflict Flagged
                    </span>
                  ) : hasWaste ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-600" /> Waste Detected
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Order
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm tracking-tight line-clamp-1">
                  {room.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {room.block} • {room.floor}
                </p>

                {/* Key Sensors Bar */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans uppercase">Occupants</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {room.sensors.cameraDetectedCount} detected
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans uppercase">Timetable</span>
                    <span className={`font-semibold text-[11px] block mt-0.5 truncate ${
                      room.timetable.isActiveNow ? 'text-emerald-700' : 'text-slate-600'
                    }`}>
                      {room.timetable.isActiveNow ? 'Active' : 'Ended'}
                    </span>
                  </div>
                </div>

                {/* Equipment Status Mini-Bar */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Active Equipment:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`p-1 rounded ${room.equipment.lights ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
                      <Lightbulb className="w-3 h-3" />
                    </span>
                    <span className={`p-1 rounded ${room.equipment.ac ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400'}`}>
                      <Wind className="w-3 h-3" />
                    </span>
                    <span className={`p-1 rounded ${room.equipment.projector ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'}`}>
                      <Tv className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="font-mono">
                  <span className="text-[10px] text-slate-400 block">Heuristic Waste</span>
                  <span className={`text-xs font-bold ${hasWaste ? 'text-rose-600' : 'text-slate-700'}`}>
                    {decision.wasteScore}% ({decision.equipmentWasteKw} kW)
                  </span>
                </div>

                <button
                  onClick={() => setSelectedRoomId(room.id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1"
                >
                  Inspect Room
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
