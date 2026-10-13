import { 
  EquipmentState, 
  SensorData, 
  TimetableSlot, 
  HumanOverride, 
  DecisionEngineResult, 
  EquipmentPowerKW 
} from '../types';

export const DEFAULT_POWER_RATINGS: EquipmentPowerKW = {
  lights: 0.40,     // 400W LED array
  ac: 2.20,         // 2.2 kW Inverter AC unit
  projector: 0.35,  // 350W High-lumen Laser Projector
  computers: 1.50   // 1.5 kW Lab workstation array
};

/**
 * Evaluates the room state using the Synesis 26 transparent decision heuristic:
 * 
 * emptyConfidence = 0.40 * timetableEnded
 *                 + 0.40 * cameraReportsZeroPeople
 *                 + 0.20 * noRecentMotion
 * 
 * wasteScore = 100 * emptyConfidence * equipmentWasteFactor
 */
export function evaluateRoomDecision(
  equipment: EquipmentState,
  sensors: SensorData,
  timetable: TimetableSlot,
  override: HumanOverride,
  powerRatings: EquipmentPowerKW = DEFAULT_POWER_RATINGS,
  tariffInr: number = 8.50
): DecisionEngineResult {
  const explainableReasons: string[] = [];

  // Binary inputs per prompt formula
  // timetableEnded: 1 if class has ended or no class scheduled, 0 if class is active
  const timetableEnded = (!timetable.isActiveNow) ? 1 : 0;
  
  // cameraReportsZeroPeople: 1 if camera reports 0, 0 if camera sees people
  const cameraReportsZeroPeople = (sensors.cameraDetectedCount === 0) ? 1 : 0;
  
  // noRecentMotion: 1 if no motion detected recently, 0 if motion active
  const noRecentMotion = (!sensors.recentMotionDetected) ? 1 : 0;

  // Transparent starter heuristic (0.0 to 1.0)
  const emptyConfidence = Number((
    0.40 * timetableEnded +
    0.40 * cameraReportsZeroPeople +
    0.20 * noRecentMotion
  ).toFixed(2));

  // Determine if equipment is actually ON and consuming energy
  let totalActiveKw = 0;
  let maxPossibleKw = 0;

  if (equipment.lights) totalActiveKw += powerRatings.lights;
  maxPossibleKw += powerRatings.lights;

  if (equipment.ac) totalActiveKw += powerRatings.ac;
  maxPossibleKw += powerRatings.ac;

  if (equipment.projector) totalActiveKw += powerRatings.projector;
  maxPossibleKw += powerRatings.projector;

  if (equipment.computers) totalActiveKw += powerRatings.computers;
  maxPossibleKw += powerRatings.computers;

  // equipmentWasteFactor: 0.0 to 1.0 (proportion of power running)
  const equipmentWasteFactor = maxPossibleKw > 0 
    ? Number((totalActiveKw / maxPossibleKw).toFixed(2))
    : 0;

  // Conflicting evidence check:
  // "If camera occupancy is positive while the motion sensor reports no recent movement,
  // flag conflicting evidence and request verification."
  const isConflictingEvidence = (sensors.cameraDetectedCount > 0 && noRecentMotion === 1);

  // Compute base waste score
  let rawWasteScore = Math.round(100 * emptyConfidence * equipmentWasteFactor);
  if (totalActiveKw === 0) {
    rawWasteScore = 0;
  }

  // Equipment waste in kW & cost in INR
  const equipmentWasteKw = emptyConfidence >= 0.5 ? totalActiveKw : Number((totalActiveKw * emptyConfidence).toFixed(2));
  const hourlyWasteCostInr = Number((equipmentWasteKw * tariffInr).toFixed(2));

  // Compile explainable reasons
  if (timetableEnded === 1) {
    explainableReasons.push('Scheduled class session has concluded.');
  } else {
    explainableReasons.push(`Active session scheduled: "${timetable.subject}" (${timetable.startTime}-${timetable.endTime}).`);
  }

  if (cameraReportsZeroPeople === 1) {
    explainableReasons.push(`Simulated CCTV camera reports zero occupants (confidence: ${Math.round(sensors.cameraConfidence * 100)}%).`);
  } else {
    explainableReasons.push(`Simulated CCTV detects ${sensors.cameraDetectedCount} occupant(s).`);
  }

  if (noRecentMotion === 1) {
    explainableReasons.push(`PIR motion sensor idle for ${sensors.minutesSinceLastMotion} minutes.`);
  } else {
    explainableReasons.push('PIR sensor reports active human motion within the last 5 minutes.');
  }

  if (equipment.ac) {
    explainableReasons.push(`High-draw Air Conditioning is active (${powerRatings.ac} kW).`);
  }
  if (equipment.projector) {
    explainableReasons.push(`Laser Projector / AV display is running (${powerRatings.projector} kW).`);
  }
  if (equipment.lights) {
    explainableReasons.push(`Classroom lighting array is powered ON (${powerRatings.lights} kW).`);
  }

  // Determine recommendation & handle Human Override (Kindness Rule)
  let recommendation: DecisionEngineResult['recommendation'] = 'NORMAL';
  let finalWasteScore = rawWasteScore;

  if (override.isOverridden && override.suppressSwitchOff) {
    recommendation = 'OVERRIDDEN_SAFE';
    finalWasteScore = 0;
    explainableReasons.unshift(`[KINDNESS OVERRIDE ACTIVE] Flagged as "${override.overrideType.replace(/_/g, ' ')}" by ${override.overriddenBy || 'Facility Admin'}. Switch-off recommendation suppressed.`);
  } else if (isConflictingEvidence) {
    recommendation = 'VERIFY_OCCUPANCY';
    explainableReasons.unshift('Conflict detected: Camera senses occupants while motion sensor is idle. Human verification required before taking action.');
  } else if (emptyConfidence >= 0.60 && totalActiveKw > 0) {
    recommendation = 'SWITCH_OFF_RECOMMENDED';
    explainableReasons.unshift(`High probability ghost classroom: empty confidence ${Math.round(emptyConfidence * 100)}% with ${totalActiveKw.toFixed(1)} kW power draw.`);
  } else if (totalActiveKw === 0) {
    recommendation = 'NORMAL';
    explainableReasons.unshift('Room is in safe standby mode: all major electrical equipment is OFF.');
  } else {
    recommendation = 'NORMAL';
  }

  return {
    emptyConfidence,
    equipmentWasteFactor,
    wasteScore: finalWasteScore,
    isProbableWaste: emptyConfidence >= 0.60 && totalActiveKw > 0 && !override.suppressSwitchOff,
    isConflictingEvidence,
    recommendation,
    explainableReasons,
    equipmentWasteKw,
    hourlyWasteCostInr
  };
}
