import { Room, AlertItem, AppSettings, ScenarioPreset } from '../types';
import { evaluateRoomDecision, DEFAULT_POWER_RATINGS } from '../utils/decisionEngine';

export const INITIAL_SETTINGS: AppSettings = {
  electricityTariffInr: 8.50, // ₹8.50 per kWh
  powerRatings: DEFAULT_POWER_RATINGS,
  confidenceThreshold: 0.70,
  enableMotionGracePeriodMins: 15,
  campusName: 'Indian Institute of Technology & Science - Campus North',
  demoSimulationSpeed: '1X',
  roboflowWorkspace: 'santhosh-skandha-s-workspace',
  roboflowWorkflowId: 'room-occupancy-monitor'
};

const RAW_ROOMS_BASELINE: Omit<Room, 'decision'>[] = [
  {
    id: 'LH-101',
    name: 'Dr. APJ Abdul Kalam Lecture Hall',
    block: 'Academic Block A',
    floor: '1st Floor',
    capacity: 120,
    type: 'LECTURE_HALL',
    equipment: {
      lights: true,
      ac: true,
      projector: true,
      computers: false
    },
    sensors: {
      cameraDetectedCount: 0,
      cameraConfidence: 0.94,
      recentMotionDetected: false,
      minutesSinceLastMotion: 38,
      ambientLightLux: 420,
      roomTemperatureC: 21.5,
      co2Ppm: 410
    },
    timetable: {
      subject: 'Advanced Robotics (CS401)',
      faculty: 'Dr. R. Natarajan',
      startTime: '09:30',
      endTime: '11:00',
      isActiveNow: false,
      hasEndedRecently: true
    },
    override: {
      isOverridden: false,
      overrideType: 'NONE',
      suppressSwitchOff: false
    },
    historyWasteKw: [0.2, 0.3, 0.4, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95, 2.95]
  },
  {
    id: 'CS-204',
    name: 'Alan Turing AI & Computing Lab',
    block: 'Technology Wing B',
    floor: '2nd Floor',
    capacity: 45,
    type: 'COMPUTER_LAB',
    equipment: {
      lights: true,
      ac: true,
      projector: false,
      computers: true
    },
    sensors: {
      cameraDetectedCount: 2, // 2 students reading quietly
      cameraConfidence: 0.89,
      recentMotionDetected: false, // Conflicting! Motion = 0
      minutesSinceLastMotion: 22,
      ambientLightLux: 510,
      roomTemperatureC: 22.0,
      co2Ppm: 580
    },
    timetable: {
      subject: 'Machine Learning Lab (CS502)',
      faculty: 'Prof. Ananya Sen',
      startTime: '14:00',
      endTime: '17:00',
      isActiveNow: false,
      hasEndedRecently: false
    },
    override: {
      isOverridden: false,
      overrideType: 'NONE',
      suppressSwitchOff: false
    },
    historyWasteKw: [1.5, 1.5, 1.5, 1.8, 1.8, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2]
  },
  {
    id: 'SH-01',
    name: 'C.V. Raman Grand Auditorium',
    block: 'Main Admin Block',
    floor: 'Ground Floor',
    capacity: 250,
    type: 'SEMINAR_HALL',
    equipment: {
      lights: true,
      ac: true,
      projector: true,
      computers: false
    },
    sensors: {
      cameraDetectedCount: 78,
      cameraConfidence: 0.98,
      recentMotionDetected: true,
      minutesSinceLastMotion: 0,
      ambientLightLux: 680,
      roomTemperatureC: 23.5,
      co2Ppm: 840
    },
    timetable: {
      subject: 'Synesis 26 Keynote & Symposium',
      faculty: 'Dean of Research',
      startTime: '11:00',
      endTime: '13:30',
      isActiveNow: true,
      hasEndedRecently: false
    },
    override: {
      isOverridden: false,
      overrideType: 'NONE',
      suppressSwitchOff: false
    },
    historyWasteKw: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: 'EC-102',
    name: 'Embedded Systems & Microcontroller Lab',
    block: 'Engineering Block C',
    floor: '1st Floor',
    capacity: 35,
    type: 'ELECTRONICS_LAB',
    equipment: {
      lights: false,
      ac: false,
      projector: false,
      computers: false
    },
    sensors: {
      cameraDetectedCount: 0,
      cameraConfidence: 0.96,
      recentMotionDetected: false,
      minutesSinceLastMotion: 120,
      ambientLightLux: 45,
      roomTemperatureC: 27.8,
      co2Ppm: 390
    },
    timetable: {
      subject: 'Microcontrollers Practicum (EC302)',
      faculty: 'Dr. V. Joshi',
      startTime: '15:00',
      endTime: '17:00',
      isActiveNow: false,
      hasEndedRecently: false
    },
    override: {
      isOverridden: false,
      overrideType: 'NONE',
      suppressSwitchOff: false
    },
    historyWasteKw: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    cctvFeedUrl: '/videos/embedded-lab.mp4'
  },
  {
    id: 'TR-301',
    name: 'Mathematics Tutorial Suite 301',
    block: 'Academic Block A',
    floor: '3rd Floor',
    capacity: 25,
    type: 'TUTORIAL_ROOM',
    equipment: {
      lights: true,
      ac: true,
      projector: false,
      computers: false
    },
    sensors: {
      cameraDetectedCount: 0,
      cameraConfidence: 0.92,
      recentMotionDetected: false,
      minutesSinceLastMotion: 45,
      ambientLightLux: 380,
      roomTemperatureC: 21.0,
      co2Ppm: 420
    },
    timetable: {
      subject: 'Linear Algebra Tutorial (MA201)',
      faculty: 'Prof. K. Sharma',
      startTime: '10:00',
      endTime: '11:00',
      isActiveNow: false,
      hasEndedRecently: true
    },
    override: {
      isOverridden: false,
      overrideType: 'NONE',
      suppressSwitchOff: false
    },
    historyWasteKw: [0.4, 0.4, 2.6, 2.6, 2.6, 2.6, 2.6, 2.6, 2.6, 2.6, 2.6, 2.6]
  },
  {
    id: 'SC-105',
    name: 'Interactive Learning Studio 105',
    block: 'Science Block D',
    floor: '1st Floor',
    capacity: 60,
    type: 'SMART_CLASSROOM',
    equipment: {
      lights: true,
      ac: true,
      projector: true,
      computers: false
    },
    sensors: {
      cameraDetectedCount: 0,
      cameraConfidence: 0.95,
      recentMotionDetected: false,
      minutesSinceLastMotion: 15,
      ambientLightLux: 400,
      roomTemperatureC: 22.2,
      co2Ppm: 430
    },
    timetable: {
      subject: 'Faculty Prep & Department Review',
      faculty: 'Dr. H. Mehta',
      startTime: '11:15',
      endTime: '12:30',
      isActiveNow: false,
      hasEndedRecently: false
    },
    override: {
      isOverridden: true,
      overrideType: 'INTENTIONALLY_OCCUPIED',
      reason: 'Department Chair booked space for confidential oral evaluations starting at 12:45.',
      overriddenAt: '11:20 AM',
      overriddenBy: 'Prof. H. Mehta (HOD)',
      suppressSwitchOff: true
    },
    historyWasteKw: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
];

export function buildRoomsWithDecisions(
  rawRooms: Omit<Room, 'decision'>[] = RAW_ROOMS_BASELINE,
  powerRatings: AppSettings['powerRatings'] = DEFAULT_POWER_RATINGS,
  tariff: number = 8.50
): Room[] {
  return rawRooms.map(room => ({
    ...room,
    decision: evaluateRoomDecision(
      room.equipment,
      room.sensors,
      room.timetable,
      room.override,
      powerRatings,
      tariff
    )
  }));
}

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'AL-45602',
    triggerId: 'TR-456787',
    roomId: 'LH-101',
    roomName: 'Dr. APJ Abdul Kalam Lecture Hall',
    title: 'High Avoidable HVAC & Lighting Waste',
    description: 'Empty lecture hall detected with 2.2 kW AC and 0.75 kW lighting array active 38 minutes past scheduled timetable.',
    priority: 'CRITICAL',
    status: 'TRIGGERED',
    timestamp: '11:38 AM',
    relativeTime: '14 min ago',
    confidenceScore: 94,
    estimatedWasteKw: 2.95,
    estimatedCostInr: 25.08,
    condition: {
      metric: 'Empty Room Power Draw',
      operator: '>=',
      thresholdValue: '1.50 kW',
      trigger: 'Ghost Room Heuristic >= 80%'
    },
    target: {
      deviceCategory: 'HVAC & Lighting BACnet',
      deviceType: 'PAC & Luminaire Array',
      device: 'PAC-LH101 + LGT-ARRAY-01'
    },
    location: {
      building: 'Academic Block A',
      floor: '1st Floor'
    },
    explainableReasons: [
      'Class timetable ended at 11:00 AM (38 minutes ago).',
      'Ceiling CCTV AI reports 0 occupants (confidence: 94%).',
      'PIR sensor has reported zero motion for 38 consecutive minutes.',
      'Active equipment draw: 2.95 kW (AC + Lights + Projector).'
    ]
  },
  {
    id: 'AL-36502',
    triggerId: 'TR-456788',
    roomId: 'CS-204',
    roomName: 'Alan Turing AI & Computing Lab',
    title: 'Sensor Conflict: Occupancy Verification Required',
    description: 'CCTV camera detects 2 occupants while PIR motion sensor has reported 0 movement for 22 minutes.',
    priority: 'WARNING',
    status: 'TRIGGERED',
    timestamp: '11:42 AM',
    relativeTime: '10 min ago',
    confidenceScore: 89,
    estimatedWasteKw: 2.20,
    estimatedCostInr: 18.70,
    condition: {
      metric: 'Discrepancy (Camera vs PIR)',
      operator: '!=',
      thresholdValue: 'PIR Motion False & Camera Count > 0',
      trigger: 'Kindness Verification Rule'
    },
    target: {
      deviceCategory: 'Lab Power & HVAC',
      deviceType: 'PAC-Unit & Workstation Grid',
      device: 'PAC-CS204 + WS-GRID'
    },
    location: {
      building: 'Technology Wing B',
      floor: '2nd Floor'
    },
    explainableReasons: [
      'Camera detects 2 students working quietly at desks.',
      'PIR motion sensor idle for 22 minutes (lack of macro motion).',
      'Kindness Rule suppresses automated shutoff to prevent interrupting studying students.',
      'Manual dispatch or physical verification recommended.'
    ]
  },
  {
    id: 'AL-2874',
    triggerId: 'TR-456789',
    roomId: 'TR-301',
    roomName: 'Mathematics Tutorial Suite 301',
    title: 'Sustained Vacant Air Conditioning',
    description: 'Tutorial room AC remains operational 45 mins after Linear Algebra tutorial ended.',
    priority: 'CRITICAL',
    status: 'TRIGGERED',
    timestamp: '11:15 AM',
    relativeTime: '37 min ago',
    confidenceScore: 92,
    estimatedWasteKw: 2.60,
    estimatedCostInr: 22.10,
    condition: {
      metric: 'Idle Time with AC ON',
      operator: '>=',
      thresholdValue: '30 mins',
      trigger: 'Timetable Ended + Camera Vacant'
    },
    target: {
      deviceCategory: 'Split AC Unit',
      deviceType: 'Inverter Split',
      device: 'AC-TR301'
    },
    location: {
      building: 'Academic Block A',
      floor: '3rd Floor'
    },
    explainableReasons: [
      'Timetable ended at 11:00 AM.',
      'Camera and PIR sensors agree 100% room is completely vacant.',
      'AC + Lights active drawing 2.60 kW.'
    ]
  },
  {
    id: 'AL-45601',
    triggerId: 'TR-456790',
    roomId: 'SC-105',
    roomName: 'Interactive Learning Studio 105',
    title: 'Kindness Rule: Facility Override Active',
    description: 'Automated switch-off suppressed per Admin reservation request for upcoming viva examinations.',
    priority: 'INFO',
    status: 'OVERRIDDEN',
    timestamp: '11:20 AM',
    relativeTime: '32 min ago',
    confidenceScore: 100,
    estimatedWasteKw: 0,
    estimatedCostInr: 0,
    condition: {
      metric: 'Override Status',
      operator: '==',
      thresholdValue: 'TRUE',
      trigger: 'Human Override Policy'
    },
    target: {
      deviceCategory: 'Smart Classroom Hub',
      deviceType: 'Full Automation Suite',
      device: 'SC-105-CONTROLLER'
    },
    location: {
      building: 'Science Block D',
      floor: '1st Floor'
    },
    explainableReasons: [
      'Manually overridden by Prof. H. Mehta (HOD).',
      'Reason: Confidential oral evaluations starting at 12:45.',
      'Energy waste penalty zeroed out per institution policy.'
    ]
  }
];

export function getScenarioRooms(
  preset: ScenarioPreset,
  powerRatings: AppSettings['powerRatings'] = DEFAULT_POWER_RATINGS,
  tariff: number = 8.50
): Room[] {
  const cloned = JSON.parse(JSON.stringify(RAW_ROOMS_BASELINE)) as Omit<Room, 'decision'>[];

  switch (preset) {
    case 'GHOST_CLASSROOM':
      // Heaviest waste scenario: LH-101, TR-301, and CS-204 all left on empty
      cloned[0].equipment = { lights: true, ac: true, projector: true, computers: false };
      cloned[0].sensors.cameraDetectedCount = 0;
      cloned[0].sensors.recentMotionDetected = false;
      cloned[0].timetable.isActiveNow = false;

      cloned[4].equipment = { lights: true, ac: true, projector: false, computers: false };
      cloned[4].sensors.cameraDetectedCount = 0;
      cloned[4].sensors.recentMotionDetected = false;
      cloned[4].timetable.isActiveNow = false;
      break;

    case 'SENSOR_CONFLICT':
      // CS-204 is the primary conflict showcase
      cloned[1].sensors.cameraDetectedCount = 3;
      cloned[1].sensors.recentMotionDetected = false;
      cloned[1].sensors.minutesSinceLastMotion = 35;
      cloned[1].override.isOverridden = false;
      break;

    case 'ACTIVE_LECTURE':
      // Campus is bustling, no waste
      cloned.forEach(r => {
        r.sensors.cameraDetectedCount = Math.floor(r.capacity * 0.75);
        r.sensors.recentMotionDetected = true;
        r.timetable.isActiveNow = true;
      });
      break;

    case 'OVERNIGHT_WASTE':
      // Late night: all timetables ended, but LH-101 and CS-204 left lights/AC on
      cloned.forEach(r => {
        r.timetable.isActiveNow = false;
        r.sensors.cameraDetectedCount = 0;
        r.sensors.recentMotionDetected = false;
        r.sensors.ambientLightLux = 10;
      });
      cloned[0].equipment = { lights: true, ac: true, projector: true };
      cloned[1].equipment = { lights: false, ac: true, projector: false, computers: true };
      break;

    case 'DEFAULT':
    default:
      // standard baseline
      break;
  }

  return buildRoomsWithDecisions(cloned, powerRatings, tariff);
}
