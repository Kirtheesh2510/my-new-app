import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Lightbulb, 
  Wind, 
  Tv, 
  Monitor, 
  Power, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  Activity, 
  IndianRupee, 
  Zap, 
  Sliders, 
  Info,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SimulatedCameraHud } from './SimulatedCameraHud';
import { Room } from '../../types';

interface RoomDetailsViewProps {
  room: Room;
  onBack: () => void;
}

export const RoomDetailsView: React.FC<RoomDetailsViewProps> = ({ room, onBack }) => {
  const { 
    toggleEquipment, 
    setHumanOverride, 
    clearHumanOverride, 
    markRoomSafe,
    settings 
  } = useApp();

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideType, setOverrideType] = useState<any>('INTENTIONALLY_OCCUPIED');
  const [overrideReason, setOverrideReason] = useState('Faculty reserved space for project evaluations.');
  const [operatorName, setOperatorName] = useState('Prof. A. Verma');
  const [isReviewed, setIsReviewed] = useState(false);

  const { decision, sensors, timetable, override, equipment } = room;

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setHumanOverride(room.id, {
      overrideType,
      reason: overrideReason,
      overriddenBy: operatorName
    });
    setShowOverrideModal(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {room.id}
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {room.name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {room.block} • {room.floor} • Capacity: {room.capacity} seats • Type: {room.type.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {override.isOverridden ? (
            <button
              onClick={() => clearHumanOverride(room.id)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-300"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
              Clear Kindness Override
            </button>
          ) : (
            <button
              onClick={() => setShowOverrideModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-indigo-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Kindness Override
            </button>
          )}

          <button
            onClick={() => setIsReviewed(true)}
            disabled={isReviewed}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 border ${
              isReviewed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            {isReviewed ? 'Reviewed by Operator' : 'Mark Reviewed'}
          </button>

          <button
            onClick={() => markRoomSafe(room.id)}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Power className="w-3.5 h-3.5" />
            Make Safe (Power Down)
          </button>
        </div>
      </div>

      {/* Main Grid: Left CCTV HUD & Controls, Right Decision Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Camera HUD & Interactive Equipment Toggles */}
        <div className="lg:col-span-7 space-y-5">
          {/* Simulated CCTV Camera Viewport */}
          <SimulatedCameraHud room={room} />

          {/* Interactive Equipment Status & Real-time Toggles */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Equipment Power Controls & Load
                </h3>
                <p className="text-xs text-slate-500">
                  Toggle equipment state to see the decision engine recalculate avoidable waste immediately.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                Active Load: {((equipment.lights ? settings.powerRatings.lights : 0) +
                  (equipment.ac ? settings.powerRatings.ac : 0) +
                  (equipment.projector ? settings.powerRatings.projector : 0) +
                  (equipment.computers ? settings.powerRatings.computers : 0)).toFixed(2)} kW
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Lights Card Toggle */}
              <div
                onClick={() => toggleEquipment(room.id, 'lights')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  equipment.lights
                    ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Lightbulb className={`w-5 h-5 ${equipment.lights ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    equipment.lights ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {equipment.lights ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">Luminaire Array</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{settings.powerRatings.lights} kW</p>
              </div>

              {/* AC Card Toggle */}
              <div
                onClick={() => toggleEquipment(room.id, 'ac')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  equipment.ac
                    ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Wind className={`w-5 h-5 ${equipment.ac ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    equipment.ac ? 'bg-blue-200 text-blue-900' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {equipment.ac ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">Inverter AC Unit</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{settings.powerRatings.ac} kW</p>
              </div>

              {/* Projector Card Toggle */}
              <div
                onClick={() => toggleEquipment(room.id, 'projector')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  equipment.projector
                    ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Tv className={`w-5 h-5 ${equipment.projector ? 'text-purple-500' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    equipment.projector ? 'bg-purple-200 text-purple-900' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {equipment.projector ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">Laser Projector</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{settings.powerRatings.projector} kW</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Decision Engine Explanations & Financial Quantification */}
        <div className="lg:col-span-5 space-y-5">
          {/* Heuristic Score & Quantified Waste Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Decision Heuristic Score
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                decision.wasteScore > 60
                  ? 'bg-red-100 text-red-800'
                  : decision.wasteScore > 20
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {decision.wasteScore} / 100
              </span>
            </div>

            {/* Waste Score Progress Meter */}
            <div className="mt-4">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    decision.wasteScore > 60
                      ? 'bg-red-500'
                      : decision.wasteScore > 20
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${decision.wasteScore}%` }}
                />
              </div>
            </div>

            {/* Financial & Energy Quantification */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 font-mono">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">
                  Avoidable Waste
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {decision.equipmentWasteKw} kW
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">
                  Hourly Penalty
                </span>
                <span className="text-xl font-bold text-slate-900">
                  ₹{decision.hourlyWasteCostInr} / hr
                </span>
              </div>
            </div>

            {/* Formula Breakdown Panel */}
            <div className="mt-4 p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-blue-400 font-bold border-b border-slate-800 pb-1">
                <span>HEURISTIC BREAKDOWN</span>
                <span>CONFIDENCE: {Math.round(decision.emptyConfidence * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Timetable Ended (0.40):</span>
                <span className={!timetable.isActiveNow ? 'text-emerald-400' : 'text-slate-400'}>
                  {!timetable.isActiveNow ? '+0.40' : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Camera Zero People (0.40):</span>
                <span className={sensors.cameraDetectedCount === 0 ? 'text-emerald-400' : 'text-slate-400'}>
                  {sensors.cameraDetectedCount === 0 ? '+0.40' : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>No Recent Motion (0.20):</span>
                <span className={!sensors.recentMotionDetected ? 'text-emerald-400' : 'text-slate-400'}>
                  {!sensors.recentMotionDetected ? '+0.20' : '0.00'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 text-slate-400">
                <span>Equipment Factor:</span>
                <span>{decision.equipmentWasteFactor}</span>
              </div>
            </div>
          </div>

          {/* Explainable Reasons List per Section 6 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              Explainable Decision Signals
            </h4>

            <ul className="space-y-2">
              {decision.explainableReasons.map((reason, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Manual Override Modal (Kindness Rule) */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Apply Kindness Rule Override
                </h3>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Override Classification
                </label>
                <select
                  value={overrideType}
                  onChange={(e) => setOverrideType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="INTENTIONALLY_OCCUPIED">Mark Room as Intentionally Occupied</option>
                  <option value="EQUIPMENT_REQUIRED">Mark Equipment as Intentionally Required</option>
                  <option value="EVENT_EXCEPTION">Scheduled Event / Exam Exception</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Override
                </label>
                <textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operator / Faculty In-Charge
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800">
                <strong>Kindness Rule Policy:</strong> Human overrides suppress switch-off recommendations and zero out waste penalties until manually revoked.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
