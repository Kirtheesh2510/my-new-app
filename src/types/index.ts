export type RoomType = 
  | 'LECTURE_HALL'
  | 'COMPUTER_LAB'
  | 'SEMINAR_HALL'
  | 'ELECTRONICS_LAB'
  | 'TUTORIAL_ROOM'
  | 'SMART_CLASSROOM';

export type AlertPriority = 'CRITICAL' | 'WARNING' | 'MINOR' | 'INFO';
export type AlertStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'OVERRIDDEN';

export interface EquipmentState {
  lights: boolean;
  ac: boolean;
  projector: boolean;
  computers?: boolean;
}

export interface EquipmentPowerKW {
  lights: number;    // e.g. 0.40 kW
  ac: number;        // e.g. 2.20 kW
  projector: number; // e.g. 0.35 kW
  computers: number; // e.g. 1.50 kW
}

export interface TimetableSlot {
  subject: string;
  faculty: string;
  startTime: string; // "10:00"
  endTime: string;   // "11:30"
  isActiveNow: boolean;
  hasEndedRecently: boolean;
}

export interface SensorData {
  cameraDetectedCount: number;
  cameraConfidence: number; // 0 to 1
  recentMotionDetected: boolean;
  minutesSinceLastMotion: number;
  ambientLightLux: number;
  roomTemperatureC: number;
  co2Ppm: number;
}

export interface HumanOverride {
  isOverridden: boolean;
  overrideType: 'INTENTIONALLY_OCCUPIED' | 'EQUIPMENT_REQUIRED' | 'EVENT_EXCEPTION' | 'NONE';
  reason?: string;
  overriddenAt?: string;
  overriddenBy?: string;
  suppressSwitchOff: boolean;
}

export interface DecisionEngineResult {
  emptyConfidence: number; // 0.0 - 1.0 heuristic score
  equipmentWasteFactor: number; // 0.0 - 1.0
  wasteScore: number; // 0 - 100
  isProbableWaste: number | boolean;
  isConflictingEvidence: boolean;
  recommendation: 'NORMAL' | 'VERIFY_OCCUPANCY' | 'SWITCH_OFF_RECOMMENDED' | 'OVERRIDDEN_SAFE';
  explainableReasons: string[];
  equipmentWasteKw: number;
  hourlyWasteCostInr: number;
}

export interface Room {
  id: string; // e.g. "LH-101"
  name: string; // "Dr. APJ Abdul Kalam Hall"
  block: string; // "Academic Block A"
  floor: string; // "1st Floor"
  capacity: number;
  type: RoomType;
  equipment: EquipmentState;
  sensors: SensorData;
  timetable: TimetableSlot;
  override: HumanOverride;
  // Computed decision
  decision: DecisionEngineResult;
  historyWasteKw: number[]; // Last 12 hourly readings
  cctvFeedUrl?: string;
}

export interface AlertItem {
  id: string; // "AL-45602"
  triggerId: string; // "TR-456787"
  roomId: string;
  roomName: string;
  title: string;
  description: string;
  priority: AlertPriority;
  status: AlertStatus;
  timestamp: string;
  relativeTime: string;
  confidenceScore: number; // percentage e.g. 88
  estimatedWasteKw: number;
  estimatedCostInr: number;
  condition: {
    metric: string;
    operator: string;
    thresholdValue: string;
    trigger: string;
  };
  target: {
    deviceCategory: string;
    deviceType: string;
    device: string;
  };
  location: {
    building: string;
    floor: string;
  };
  explainableReasons: string[];
}

export interface AppSettings {
  electricityTariffInr: number; // default ₹8.50 per kWh
  powerRatings: EquipmentPowerKW;
  confidenceThreshold: number; // e.g. 0.70
  enableMotionGracePeriodMins: number; // default 15
  campusName: string;
  demoSimulationSpeed: 'PAUSED' | '1X' | '5X';
  roboflowApiKey?: string;
  roboflowWorkspace?: string;
  roboflowWorkflowId?: string;
}


export type ScenarioPreset = 
  | 'DEFAULT'
  | 'GHOST_CLASSROOM'
  | 'SENSOR_CONFLICT'
  | 'ACTIVE_LECTURE'
  | 'OVERNIGHT_WASTE';
