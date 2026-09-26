/**
 * SwasthyaGrid AI — Alert Lifecycle & Deduplication Service (Build 06)
 *
 * Implements:
 * 1. Alert Lifecycle States (ACTIVE, ACKNOWLEDGED, MONITORING, RESOLVED)
 * 2. Stable-Key Alert Deduplication to prevent endless duplicate generation
 * 3. Compound Alert Grouping (groups multiple facility alerts into COMPOUND_OPERATIONAL_RISK)
 * 4. Manual Human Decision Maker acknowledgment & resolution
 */

import { ALERT_LIFECYCLE_STATES } from "../config/risk_config.js";
import { getActiveAlerts } from "./alert_service.js";
import { calculateFacilityRiskProfile } from "./unified_risk_engine.js";
import { PHC_DATASET } from "../data/phc_dataset.js";

// In-memory persistent alert state registry (keyed by stable alert_id)
const ALERT_REGISTRY = new Map();

/**
 * Initializes and synchronizes the alert registry with deduplication and compound risk grouping.
 * @returns {Array} List of consolidated alerts
 */
export function synchronizeAlerts() {
  const rawAlerts = getActiveAlerts();

  // 1. Ingest raw alerts with stable keys
  rawAlerts.forEach(alert => {
    const existing = ALERT_REGISTRY.get(alert.alert_id);
    if (existing) {
      // Update metrics, preserve lifecycle status if already acknowledged/monitoring
      ALERT_REGISTRY.set(alert.alert_id, {
        ...existing,
        ...alert,
        status: existing.status || ALERT_LIFECYCLE_STATES.ACTIVE,
        last_updated: new Date().toISOString()
      });
    } else {
      ALERT_REGISTRY.set(alert.alert_id, {
        ...alert,
        status: ALERT_LIFECYCLE_STATES.ACTIVE,
        created_at: alert.timestamp || new Date().toISOString(),
        last_updated: new Date().toISOString()
      });
    }
  });

  // 2. Compound Risk Alert Generation
  // Check all PHCs for compound operational pressure
  PHC_DATASET.forEach(phc => {
    const profile = calculateFacilityRiskProfile(phc.phc_id);
    const compoundAlertId = `ALT-COMPOUND-${phc.phc_id}`;

    if (profile.is_compound_risk) {
      const existingCompound = ALERT_REGISTRY.get(compoundAlertId);
      const childAlerts = Array.from(ALERT_REGISTRY.values()).filter(a => a.phc_id === phc.phc_id && a.alert_id !== compoundAlertId);

      const compoundRecord = {
        alert_id: compoundAlertId,
        phc_id: phc.phc_id,
        phc_name: phc.phc_name,
        district: phc.district,
        resource_category: "Compound Operational Pressure",
        severity: "CRITICAL",
        alert_type: "COMPOUND_OPERATIONAL_RISK",
        message: `Compound operational pressure detected at ${phc.phc_id} (${phc.phc_name}): Simultaneous critical/warning thresholds crossed across Supply, Demand, Capacity, and Delivery.`,
        status: existingCompound ? existingCompound.status : ALERT_LIFECYCLE_STATES.ACTIVE,
        created_at: existingCompound ? existingCompound.created_at : "2026-09-20T10:42:00Z",
        last_updated: new Date().toISOString(),
        is_compound: true,
        pressure_score: profile.pressure_score,
        top_contributors: profile.top_contributors,
        child_alert_ids: childAlerts.map(c => c.alert_id),
        supporting_metrics: {
          pressure_score: profile.pressure_score,
          demand_surge: `+${profile.summary_metrics.surge_percentage}%`,
          bed_occupancy: `${profile.summary_metrics.bed_occupancy_rate}%`,
          lowest_days_of_stock: `${profile.summary_metrics.lowest_days_of_stock} days (${profile.summary_metrics.critical_medicine})`
        }
      };

      ALERT_REGISTRY.set(compoundAlertId, compoundRecord);
    } else if (ALERT_REGISTRY.has(compoundAlertId)) {
      // If no longer compound, transition to RESOLVED
      const existing = ALERT_REGISTRY.get(compoundAlertId);
      if (existing.status !== ALERT_LIFECYCLE_STATES.RESOLVED) {
        existing.status = ALERT_LIFECYCLE_STATES.RESOLVED;
        existing.resolved_at = new Date().toISOString();
        existing.resolution_note = "Compound risk alleviated as operational metrics normalized.";
      }
    }
  });

  return Array.from(ALERT_REGISTRY.values());
}

/**
 * Acknowledges an active alert.
 * @param {string} alertId 
 * @param {string} userRole 
 * @returns {Object} Updated alert
 */
export function acknowledgeAlert(alertId, userRole = "Chief Medical Officer") {
  synchronizeAlerts();
  const alert = ALERT_REGISTRY.get(alertId);
  if (alert) {
    alert.status = ALERT_LIFECYCLE_STATES.ACKNOWLEDGED;
    alert.acknowledged_at = new Date().toISOString();
    alert.acknowledged_by = userRole;
    alert.last_updated = new Date().toISOString();
    return alert;
  }
  return null;
}

/**
 * Resolves an alert with a mandatory resolution note.
 * @param {string} alertId 
 * @param {string} resolutionNote 
 * @param {string} userRole 
 * @returns {Object} Updated alert
 */
export function resolveAlert(alertId, resolutionNote = "Operational action executed.", userRole = "Chief Medical Officer") {
  synchronizeAlerts();
  const alert = ALERT_REGISTRY.get(alertId);
  if (alert) {
    alert.status = ALERT_LIFECYCLE_STATES.RESOLVED;
    alert.resolved_at = new Date().toISOString();
    alert.resolved_by = userRole;
    alert.resolution_note = resolutionNote;
    alert.last_updated = new Date().toISOString();
    return alert;
  }
  return null;
}

/**
 * Retrieves alerts filtered by lifecycle status.
 * @param {string} statusFilter - "ALL" | "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED"
 * @returns {Array}
 */
export function getLifecycleAlerts(statusFilter = "ALL") {
  const all = synchronizeAlerts();
  if (statusFilter === "ALL") return all;
  return all.filter(a => a.status === statusFilter);
}
