import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Room, 
  AlertItem, 
  AppSettings, 
  ScenarioPreset, 
  EquipmentState, 
  HumanOverride, 
  AlertStatus 
} from '../types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_ALERTS, 
  getScenarioRooms, 
  buildRoomsWithDecisions 
} from '../data/mockData';
import { evaluateRoomDecision } from '../utils/decisionEngine';

interface AppContextType {
  rooms: Room[];
  alerts: AlertItem[];
  settings: AppSettings;
  currentScenario: ScenarioPreset;
  selectedRoomId: string | null;
  activeTab: 'overview' | 'rooms' | 'analytics' | 'alerts' | 'settings';
  // Actions
  setActiveTab: (tab: 'overview' | 'rooms' | 'analytics' | 'alerts' | 'settings') => void;
  setSelectedRoomId: (id: string | null) => void;
  setScenario: (preset: ScenarioPreset) => void;
  toggleEquipment: (roomId: string, equipmentKey: keyof EquipmentState) => void;
  setHumanOverride: (roomId: string, overrideData: Partial<HumanOverride>) => void;
  clearHumanOverride: (roomId: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  updateRoomOccupancy: (roomId: string, count: number, confidence: number) => void;
  markRoomSafe: (roomId: string) => void;
  resetAll: () => void;
  // Computed aggregations
  totalMonitoredRooms: number;
  roomsNeedingVerification: number;
  totalAvoidableKw: number;
  totalHourlyCostInr: number;
  activeAlertsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('phantom_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [currentScenario, setCurrentScenario] = useState<ScenarioPreset>('DEFAULT');
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem('phantom_rooms');
      if (saved) {
        const parsed = JSON.parse(saved);
        return buildRoomsWithDecisions(parsed, settings.powerRatings, settings.electricityTariffInr);
      }
    } catch {
      // fallback
    }
    return getScenarioRooms('DEFAULT', settings.powerRatings, settings.electricityTariffInr);
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    try {
      const saved = localStorage.getItem('phantom_alerts');
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'analytics' | 'alerts' | 'settings'>('overview');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('phantom_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('phantom_rooms', JSON.stringify(rooms));
    } catch (e) {
      console.error(e);
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem('phantom_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error(e);
    }
  }, [alerts]);

  // Recalculate room decisions whenever settings change
  const recomputeRooms = (currentRoomsList: Room[], currentSettings: AppSettings): Room[] => {
    return currentRoomsList.map(r => ({
      ...r,
      decision: evaluateRoomDecision(
        r.equipment,
        r.sensors,
        r.timetable,
        r.override,
        currentSettings.powerRatings,
        currentSettings.electricityTariffInr
      )
    }));
  };

  const setScenario = (preset: ScenarioPreset) => {
    setCurrentScenario(preset);
    const newRooms = getScenarioRooms(preset, settings.powerRatings, settings.electricityTariffInr);
    setRooms(newRooms);
  };

  const toggleEquipment = (roomId: string, equipmentKey: keyof EquipmentState) => {
    setRooms(prevRooms => {
      const updated = prevRooms.map(room => {
        if (room.id !== roomId) return room;
        const newEquipment = {
          ...room.equipment,
          [equipmentKey]: !room.equipment[equipmentKey]
        };
        const newDecision = evaluateRoomDecision(
          newEquipment,
          room.sensors,
          room.timetable,
          room.override,
          settings.powerRatings,
          settings.electricityTariffInr
        );
        return {
          ...room,
          equipment: newEquipment,
          decision: newDecision
        };
      });
      return updated;
    });
  };

  const setHumanOverride = (roomId: string, overrideData: Partial<HumanOverride>) => {
    setRooms(prevRooms => {
      const updated = prevRooms.map(room => {
        if (room.id !== roomId) return room;
        const newOverride: HumanOverride = {
          isOverridden: true,
          overrideType: overrideData.overrideType || 'INTENTIONALLY_OCCUPIED',
          reason: overrideData.reason || 'Manual override recorded by facility operator.',
          overriddenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          overriddenBy: overrideData.overriddenBy || 'Facility Admin',
          suppressSwitchOff: true
        };
        const newDecision = evaluateRoomDecision(
          room.equipment,
          room.sensors,
          room.timetable,
          newOverride,
          settings.powerRatings,
          settings.electricityTariffInr
        );
        return {
          ...room,
          override: newOverride,
          decision: newDecision
        };
      });
      return updated;
    });
  };

  const clearHumanOverride = (roomId: string) => {
    setRooms(prevRooms => {
      const updated = prevRooms.map(room => {
        if (room.id !== roomId) return room;
        const newOverride: HumanOverride = {
          isOverridden: false,
          overrideType: 'NONE',
          suppressSwitchOff: false
        };
        const newDecision = evaluateRoomDecision(
          room.equipment,
          room.sensors,
          room.timetable,
          newOverride,
          settings.powerRatings,
          settings.electricityTariffInr
        );
        return {
          ...room,
          override: newOverride,
          decision: newDecision
        };
      });
      return updated;
    });
  };

  const markRoomSafe = (roomId: string) => {
    setRooms(prevRooms => {
      return prevRooms.map(room => {
        if (room.id !== roomId) return room;
        // Turn off all equipment in room to make safe
        const safeEquipment: EquipmentState = {
          lights: false,
          ac: false,
          projector: false,
          computers: false
        };
        const newDecision = evaluateRoomDecision(
          safeEquipment,
          room.sensors,
          room.timetable,
          room.override,
          settings.powerRatings,
          settings.electricityTariffInr
        );
        return {
          ...room,
          equipment: safeEquipment,
          decision: newDecision
        };
      });
    });

    // Also update any pending alerts for this room to RESOLVED
    setAlerts(prev => prev.map(a => a.roomId === roomId ? { ...a, status: 'RESOLVED' } : a));
  };

  const updateSettings = (newSettingsData: Partial<AppSettings>) => {
    const merged = { ...settings, ...newSettingsData };
    setSettings(merged);
    setRooms(prev => recomputeRooms(prev, merged));
  };

  const updateAlertStatus = (alertId: string, status: AlertStatus) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status } : a));
  };

  const updateRoomOccupancy = (roomId: string, count: number, confidence: number) => {
    setRooms(prevRooms => {
      return prevRooms.map(room => {
        if (room.id !== roomId) return room;
        const newSensors = {
          ...room.sensors,
          cameraDetectedCount: count,
          cameraConfidence: confidence
        };
        const newDecision = evaluateRoomDecision(
          room.equipment,
          newSensors,
          room.timetable,
          room.override,
          settings.powerRatings,
          settings.electricityTariffInr
        );
        return {
          ...room,
          sensors: newSensors,
          decision: newDecision
        };
      });
    });
  };


  const resetAll = () => {
    localStorage.removeItem('phantom_settings');
    localStorage.removeItem('phantom_rooms');
    localStorage.removeItem('phantom_alerts');
    setSettings(INITIAL_SETTINGS);
    setCurrentScenario('DEFAULT');
    setRooms(getScenarioRooms('DEFAULT', INITIAL_SETTINGS.powerRatings, INITIAL_SETTINGS.electricityTariffInr));
    setAlerts(INITIAL_ALERTS);
  };

  // Aggregated calculations
  const totalMonitoredRooms = rooms.length;
  const roomsNeedingVerification = rooms.filter(r => r.decision.isConflictingEvidence || r.decision.recommendation === 'VERIFY_OCCUPANCY').length;
  const totalAvoidableKw = Number(rooms.reduce((sum, r) => sum + (r.decision.isProbableWaste ? r.decision.equipmentWasteKw : 0), 0).toFixed(2));
  const totalHourlyCostInr = Number((totalAvoidableKw * settings.electricityTariffInr).toFixed(2));
  const activeAlertsCount = alerts.filter(a => a.status === 'TRIGGERED').length;

  return (
    <AppContext.Provider
      value={{
        rooms,
        alerts,
        settings,
        currentScenario,
        selectedRoomId,
        activeTab,
        setActiveTab,
        setSelectedRoomId,
        setScenario,
        toggleEquipment,
        setHumanOverride,
        clearHumanOverride,
        updateSettings,
        updateAlertStatus,
        updateRoomOccupancy,
        markRoomSafe,
        resetAll,
        totalMonitoredRooms,
        roomsNeedingVerification,
        totalAvoidableKw,
        totalHourlyCostInr,
        activeAlertsCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
