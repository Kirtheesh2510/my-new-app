import React, { useState } from 'react';
import { 
  Sliders, 
  IndianRupee, 
  Zap, 
  ShieldCheck, 
  Check, 
  RotateCcw, 
  Save, 
  Building2, 
  SlidersHorizontal,
  Info,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppSettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAll, rooms, clearHumanOverride } = useApp();

  const [tariff, setTariff] = useState(settings.electricityTariffInr.toString());
  const [lightsKw, setLightsKw] = useState(settings.powerRatings.lights.toString());
  const [acKw, setAcKw] = useState(settings.powerRatings.ac.toString());
  const [projectorKw, setProjectorKw] = useState(settings.powerRatings.projector.toString());
  const [computersKw, setComputersKw] = useState(settings.powerRatings.computers.toString());
  const [confidenceThreshold, setConfidenceThreshold] = useState(Math.round(settings.confidenceThreshold * 100).toString());
  const [roboflowApiKey, setRoboflowApiKey] = useState(settings.roboflowApiKey || '');
  const [roboflowWorkspace, setRoboflowWorkspace] = useState(settings.roboflowWorkspace || 'santhosh-skandha-s-workspace');
  const [roboflowWorkflowId, setRoboflowWorkflowId] = useState(settings.roboflowWorkflowId || 'room-occupancy-monitor');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      electricityTariffInr: parseFloat(tariff) || 8.50,
      powerRatings: {
        lights: parseFloat(lightsKw) || 0.40,
        ac: parseFloat(acKw) || 2.20,
        projector: parseFloat(projectorKw) || 0.35,
        computers: parseFloat(computersKw) || 1.50
      },
      confidenceThreshold: (parseFloat(confidenceThreshold) || 70) / 100,
      roboflowApiKey: roboflowApiKey.trim(),
      roboflowWorkspace: roboflowWorkspace.trim(),
      roboflowWorkflowId: roboflowWorkflowId.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const overriddenRooms = rooms.filter(r => r.override.isOverridden);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            Decision Engine Calibration & Kindness Rule Policies
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure financial tariffs, wattage estimates, and inspect all active facility overrides.
          </p>
        </div>

        <button
          onClick={resetAll}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Defaults
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Electricity Tariff & Financial Assumptions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Institutional Electricity Tariff
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Electricity Commercial Rate (₹ INR per kWh)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="50"
                  value={tariff}
                  onChange={(e) => setTariff(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Standard academic HT grid tariff for campus northern region: ₹8.50/kWh.
              </p>
            </div>

            {/* Heuristic Threshold */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghost Classroom Confidence Threshold (%)
              </label>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(e.target.value)}
                className="w-full cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                <span>Aggressive (40%)</span>
                <span className="font-bold text-blue-600">{confidenceThreshold}%</span>
                <span>Conservative (90%)</span>
              </div>
            </div>
          </div>

          {/* Equipment Power Ratings (kW) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Zap className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Classroom Equipment Wattage Specifications (kW)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lighting Luminaire Array (kW)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={lightsKw}
                  onChange={(e) => setLightsKw(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Air Conditioner PAC (kW)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={acKw}
                  onChange={(e) => setAcKw(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Laser Projector / AV (kW)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={projectorKw}
                  onChange={(e) => setProjectorKw(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lab Workstations Array (kW)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={computersKw}
                  onChange={(e) => setComputersKw(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Roboflow Workflows Serverless Integration */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  RF
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Roboflow Workflows — Room Occupancy Monitor Integration
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live computer vision model powering real-time camera occupancy counts.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Serverless API
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Roboflow API Key (Secret)
                </label>
                <input
                  type="password"
                  placeholder="rf_... or your API Key"
                  value={roboflowApiKey}
                  onChange={(e) => setRoboflowApiKey(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Sent via <code>Authorization: Bearer</code> header.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Workspace Slug
                </label>
                <input
                  type="text"
                  value={roboflowWorkspace}
                  onChange={(e) => setRoboflowWorkspace(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Workflow Slug
                </label>
                <input
                  type="text"
                  value={roboflowWorkflowId}
                  onChange={(e) => setRoboflowWorkflowId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Kindness Rule Overrides Manager */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Active Human Overrides (Kindness Rule Policy)
                </h3>
                <p className="text-xs text-slate-500">
                  Per system guidelines, manual human overrides always take precedence over automated switch-off recommendations.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {overriddenRooms.length} Overrides Active
            </span>
          </div>

          {overriddenRooms.length > 0 ? (
            <div className="mt-4 space-y-2.5">
              {overriddenRooms.map(room => (
                <div
                  key={room.id}
                  className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {room.id}
                      </span>
                      <span className="font-bold text-slate-900">{room.name}</span>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                        {room.override.overrideType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 italic">
                      "{room.override.reason}"
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Applied by {room.override.overriddenBy || 'Facility Admin'} at {room.override.overriddenAt || '11:20 AM'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => clearHumanOverride(room.id)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs shadow-2xs transition-colors shrink-0 self-end sm:self-center"
                  >
                    Revoke Override
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 p-6 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
              No active human overrides. The decision engine is currently operating strictly according to sensor heuristic values.
            </div>
          )}
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Calibration saved and recalculated across all rooms!
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Calibration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
