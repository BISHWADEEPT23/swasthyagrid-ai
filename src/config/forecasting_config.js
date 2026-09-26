/**
 * SwasthyaGrid AI — Demand Forecasting & Predictive Analytics Configuration (Build 04)
 * Centralizes all parameters, thresholds, horizon settings, and weights.
 */

export const FORECAST_HORIZONS = [
  { days: 7, label: "7-Day Forecast", shortLabel: "7 Days", confidence: 92, confidenceLabel: "High", badgeColor: "emerald" },
  { days: 14, label: "14-Day Forecast", shortLabel: "14 Days", confidence: 81, confidenceLabel: "Medium", badgeColor: "blue" },
  { days: 30, label: "30-Day Forecast", shortLabel: "30 Days", confidence: 67, confidenceLabel: "Moderate", badgeColor: "amber" }
];

export const SURGE_THRESHOLDS = {
  NORMAL: { max: 10, label: "Normal Demand", color: "emerald", severity: "NORMAL" },
  WATCH: { min: 10, max: 20, label: "Demand Watch", color: "amber", severity: "WATCH" },
  WARNING: { min: 20, max: 30, label: "Surge Warning", color: "orange", severity: "WARNING" },
  CRITICAL: { min: 30, label: "Critical Surge", color: "red", severity: "CRITICAL" }
};

export const BED_PRESSURE_THRESHOLDS = {
  NORMAL: { max: 75, label: "Normal Capacity", color: "emerald" },
  RISING: { min: 75, max: 85, label: "Rising Pressure", color: "blue" },
  HIGH: { min: 85, max: 90, label: "High Pressure", color: "amber" },
  CAPACITY_RISK: { min: 90, label: "Capacity Risk", color: "red" }
};

export const FORECAST_ALGORITHM_WEIGHTS = {
  WMA_7_WEIGHTS: [1, 2, 3, 4, 5, 6, 7], // Sum = 28
  EXP_SMOOTHING_ALPHA: 0.35,
  EXP_SMOOTHING_BETA: 0.12,
  ADMISSION_RATE_DEFAULT: 0.085, // ~8.5% of footfall requires bed admission
  AVG_LENGTH_OF_STAY_DAYS: 2.8   // Average stay duration at PHC
};

/**
 * Returns surge classification based on percentage deviation over baseline.
 * @param {number} deviationPct 
 * @returns {Object}
 */
export function classifySurge(deviationPct) {
  if (deviationPct >= SURGE_THRESHOLDS.CRITICAL.min) {
    return { level: "CRITICAL", label: SURGE_THRESHOLDS.CRITICAL.label, color: SURGE_THRESHOLDS.CRITICAL.color };
  }
  if (deviationPct >= SURGE_THRESHOLDS.WARNING.min) {
    return { level: "WARNING", label: SURGE_THRESHOLDS.WARNING.label, color: SURGE_THRESHOLDS.WARNING.color };
  }
  if (deviationPct >= SURGE_THRESHOLDS.WATCH.min) {
    return { level: "WATCH", label: SURGE_THRESHOLDS.WATCH.label, color: SURGE_THRESHOLDS.WATCH.color };
  }
  return { level: "NORMAL", label: SURGE_THRESHOLDS.NORMAL.label, color: SURGE_THRESHOLDS.NORMAL.color };
}

/**
 * Returns bed pressure classification based on projected occupancy rate.
 * @param {number} occupancyPct 
 * @returns {Object}
 */
export function classifyBedPressure(occupancyPct) {
  if (occupancyPct >= BED_PRESSURE_THRESHOLDS.CAPACITY_RISK.min) {
    return { level: "CAPACITY_RISK", label: BED_PRESSURE_THRESHOLDS.CAPACITY_RISK.label, color: BED_PRESSURE_THRESHOLDS.CAPACITY_RISK.color };
  }
  if (occupancyPct >= BED_PRESSURE_THRESHOLDS.HIGH.min) {
    return { level: "HIGH", label: BED_PRESSURE_THRESHOLDS.HIGH.label, color: BED_PRESSURE_THRESHOLDS.HIGH.color };
  }
  if (occupancyPct >= BED_PRESSURE_THRESHOLDS.RISING.min) {
    return { level: "RISING", label: BED_PRESSURE_THRESHOLDS.RISING.label, color: BED_PRESSURE_THRESHOLDS.RISING.color };
  }
  return { level: "NORMAL", label: BED_PRESSURE_THRESHOLDS.NORMAL.label, color: BED_PRESSURE_THRESHOLDS.NORMAL.color };
}
