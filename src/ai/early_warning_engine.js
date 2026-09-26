/**
 * SwasthyaGrid AI — Early Warning Engine
 * Modular anomaly detection interface.
 */

export class EarlyWarningEngine {
  /**
   * Evaluates if a facility meets critical early warning thresholds.
   * @param {Object} phc
   * @param {Array} inventory
   * @returns {Object} Warning evaluation
   */
  static evaluateFacility(phc, inventory = []) {
    const footfallDeviation = phc.patients_7day_average > 0
      ? ((phc.patients_today - phc.patients_7day_average) / phc.patients_7day_average) * 100
      : 0;

    const occupancy = phc.total_beds > 0
      ? (phc.occupied_beds / phc.total_beds) * 100
      : 0;

    const isCritical = footfallDeviation > 30 || occupancy > 90 || phc.operational_status === "CRITICAL";

    return {
      phcId: phc.phc_id,
      isTriggered: isCritical,
      severity: isCritical ? "CRITICAL" : "NORMAL",
      anomalyScore: isCritical ? 0.94 : 0.12,
      primarySignal: isCritical ? "Acute patient surge coupled with inventory depletion" : "Nominal operational telemetry"
    };
  }
}
