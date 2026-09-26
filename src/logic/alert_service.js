/**
 * SwasthyaGrid AI — Alert Service (Build 03)
 * Manages active alerts, alert history, and automatically generates
 * operational supply-chain alerts from inventory calculations.
 */

import { ALERT_HISTORY_DATASET } from "../data/alert_history_dataset.js";
import { MEDICINE_INVENTORY_DATASET } from "../data/medicine_dataset.js";
import { 
  classifySupplyRisk, 
  calculateDeliveryRisk, 
  evaluateExpiryRisk,
  calculateSafetyStockGap,
  evaluateReorderStatus 
} from "./supply_chain_engine.js";
import {
  forecastPatientDemand,
  forecastMedicineConsumption,
  forecastBedOccupancy
} from "./forecasting_service.js";
import { PHC_DATASET } from "../data/phc_dataset.js";

/**
 * Automatically generates predictive operational alerts using forecasting models (Build 04).
 * @returns {Array} List of dynamically generated predictive alerts
 */
export function generatePredictiveAlerts() {
  const alerts = [];

  // 1. Predictive Medicine Stockout Alerts
  MEDICINE_INVENTORY_DATASET.forEach(item => {
    const medForecast = forecastMedicineConsumption(item.phc_id, item.medicine_catalog_id, 7);
    if (medForecast.stockout_before_delivery && medForecast.shortage_window_days >= 1.0) {
      alerts.push({
        alert_id: `ALT-PRED-${item.medicine_id}-STOCKOUT`,
        timestamp: "2026-09-20T12:00:00Z",
        phc_id: item.phc_id,
        medicine_id: item.medicine_id,
        resource_category: `Predictive Supply / ${item.medicine_name.split(" ")[0]}`,
        severity: "CRITICAL",
        alert_type: "PREDICTED_STOCKOUT",
        message: `Predictive model forecasts complete stockout in ${medForecast.forecast_days_of_stock} days (${medForecast.predicted_stockout_date}), creating a ${medForecast.shortage_window_days}-day zero-stock shortage window before next scheduled delivery.`,
        status: "ACTIVE",
        supporting_metrics: {
          forecast_days_of_stock: medForecast.forecast_days_of_stock,
          predicted_stockout_date: medForecast.predicted_stockout_date,
          shortage_window_days: medForecast.shortage_window_days,
          forecast_burn_rate: medForecast.forecast_daily_consumption
        }
      });
    }
  });

  // 2. Predictive Patient Demand Surge & Bed Capacity Alerts
  PHC_DATASET.forEach(phc => {
    const demandForecast = forecastPatientDemand(phc.phc_id, 7);
    if (demandForecast.surge_percentage >= 25) {
      alerts.push({
        alert_id: `ALT-PRED-${phc.phc_id}-SURGE`,
        timestamp: "2026-09-20T12:00:00Z",
        phc_id: phc.phc_id,
        resource_category: "Epidemiological Surge",
        severity: demandForecast.surge_percentage >= 30 ? "CRITICAL" : "WARNING",
        alert_type: "DEMAND_SURGE",
        message: `Sustained demand surge (+${demandForecast.surge_percentage}% over baseline). Projected average: ${demandForecast.avg_projected_daily} patients/day (Peak: ${demandForecast.peak_projected_daily}).`,
        status: "ACTIVE",
        supporting_metrics: {
          current_today: demandForecast.current_today,
          baseline: demandForecast.baseline_7day,
          surge_pct: demandForecast.surge_percentage,
          avg_projected: demandForecast.avg_projected_daily
        }
      });
    }

    const bedForecast = forecastBedOccupancy(phc.phc_id, 7);
    if (bedForecast.peak_occupancy_rate >= 90) {
      alerts.push({
        alert_id: `ALT-PRED-${phc.phc_id}-BEDS`,
        timestamp: "2026-09-20T12:00:00Z",
        phc_id: phc.phc_id,
        resource_category: "Bed Capacity Risk",
        severity: "CRITICAL",
        alert_type: "BED_CAPACITY_RISK",
        message: `Projected bed occupancy reaches ${bedForecast.peak_occupancy_rate}% (${bedForecast.peak_occupied_projected}/${bedForecast.total_beds} beds). Imminent saturation risk.`,
        status: "ACTIVE",
        supporting_metrics: {
          current_occupancy_rate: bedForecast.current_occupancy_rate,
          peak_projected_rate: bedForecast.peak_occupancy_rate,
          total_beds: bedForecast.total_beds
        }
      });
    }
  });

  return alerts;
}

/**
 * Automatically generates operational supply-chain alerts based on deterministic calculations.
 * Avoids duplicate alerts for the same condition.
 * @returns {Array} List of dynamically generated supply-chain alerts
 */
export function generateSupplyChainAlerts() {
  const alerts = [];

  MEDICINE_INVENTORY_DATASET.forEach(item => {
    const risk = classifySupplyRisk(item);
    const delRisk = calculateDeliveryRisk(item);
    const expRisk = evaluateExpiryRisk(item.expiry_date);
    const safetyGap = calculateSafetyStockGap(item.current_stock, item.minimum_safety_stock);
    const isReorder = evaluateReorderStatus(item.current_stock, item.reorder_level);

    // 1. Critical stock-out before delivery alert
    if (delRisk.hasDeliveryRisk && delRisk.shortageWindowDays >= 1.0) {
      alerts.push({
        alert_id: `ALT-SC-${item.medicine_id}-DELIV`,
        timestamp: "2026-09-20T11:45:00Z",
        phc_id: item.phc_id,
        medicine_id: item.medicine_id,
        resource_category: `Supply Chain / ${item.medicine_name.split(" ")[0]}`,
        severity: "CRITICAL",
        alert_type: "DELIVERY_RISK",
        message: `Projected stock depletion occurs ${delRisk.shortageWindowDays} days before scheduled delivery. Stock: ${item.current_stock}, Burn: ${item.daily_consumption}/day.`,
        status: "ACTIVE",
        supporting_metrics: {
          days_of_stock: risk.daysOfStock,
          days_until_delivery: delRisk.daysUntilDelivery,
          shortage_window_days: delRisk.shortageWindowDays
        }
      });
    } 
    // 2. Critical stock coverage alert (< 3 days)
    else if (risk.level === "CRITICAL") {
      alerts.push({
        alert_id: `ALT-SC-${item.medicine_id}-CRIT`,
        timestamp: "2026-09-20T11:30:00Z",
        phc_id: item.phc_id,
        medicine_id: item.medicine_id,
        resource_category: `Supply Chain / ${item.medicine_name.split(" ")[0]}`,
        severity: "CRITICAL",
        alert_type: "CRITICAL_STOCK",
        message: `Critical stock coverage: only ${risk.daysOfStock} days remaining (${item.current_stock} units).`,
        status: "ACTIVE",
        supporting_metrics: {
          days_of_stock: risk.daysOfStock,
          current_stock: item.current_stock
        }
      });
    }

    // 3. Below minimum safety stock alert (WARNING)
    if (safetyGap < 0 && risk.level !== "CRITICAL") {
      alerts.push({
        alert_id: `ALT-SC-${item.medicine_id}-GAP`,
        timestamp: "2026-09-20T10:15:00Z",
        phc_id: item.phc_id,
        medicine_id: item.medicine_id,
        resource_category: `Supply Chain / ${item.medicine_name.split(" ")[0]}`,
        severity: "WARNING",
        alert_type: "SAFETY_GAP",
        message: `Stock below minimum safety threshold (${item.current_stock} vs ${item.minimum_safety_stock} required). Deficit: ${Math.abs(safetyGap)} units.`,
        status: "ACTIVE",
        supporting_metrics: {
          safety_gap: safetyGap,
          current_stock: item.current_stock,
          minimum_safety_stock: item.minimum_safety_stock
        }
      });
    }

    // 4. Expiry risk alert
    if (expRisk.level === "CRITICAL" || expRisk.level === "WARNING") {
      alerts.push({
        alert_id: `ALT-SC-${item.medicine_id}-EXP`,
        timestamp: "2026-09-20T08:00:00Z",
        phc_id: item.phc_id,
        medicine_id: item.medicine_id,
        resource_category: `Cold Chain & Shelf Life`,
        severity: expRisk.level,
        alert_type: "EXPIRY_RISK",
        message: `Batch ${item.batch_number} of ${item.medicine_name} expires in ${expRisk.daysToExpiry} days (${item.current_stock} units affected).`,
        status: "ACTIVE",
        supporting_metrics: {
          days_to_expiry: expRisk.daysToExpiry,
          batch_number: item.batch_number
        }
      });
    }
  });

  return alerts;
}

/**
 * Get active alerts across the entire network (merging telemetry + supply chain).
 * @returns {Array} List of active alerts sorted by severity
 */
export function getActiveAlerts() {
  const severityWeight = { CRITICAL: 4, WARNING: 3, WATCH: 2, NORMAL: 1 };
  const staticAlerts = ALERT_HISTORY_DATASET.filter(a => a.status === "ACTIVE");
  const scAlerts = generateSupplyChainAlerts();
  const predAlerts = generatePredictiveAlerts();

  // Avoid duplicate alert IDs
  const seen = new Set();
  const merged = [];

  [...staticAlerts, ...scAlerts, ...predAlerts].forEach(a => {
    if (!seen.has(a.alert_id)) {
      seen.add(a.alert_id);
      merged.push(a);
    }
  });

  return merged.sort((a, b) => (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0));
}

/**
 * Get alert history for a specific PHC.
 * @param {string} phcId
 * @returns {Array}
 */
export function getAlertsForPhc(phcId) {
  const staticPhcAlerts = ALERT_HISTORY_DATASET.filter(a => a.phc_id === phcId);
  const scAlerts = generateSupplyChainAlerts().filter(a => a.phc_id === phcId);
  const predAlerts = generatePredictiveAlerts().filter(a => a.phc_id === phcId);

  const seen = new Set();
  const merged = [];

  [...staticPhcAlerts, ...scAlerts, ...predAlerts].forEach(a => {
    if (!seen.has(a.alert_id)) {
      seen.add(a.alert_id);
      merged.push(a);
    }
  });

  return merged;
}

/**
 * Returns severity badge styling.
 * @param {string} severity
 * @returns {Object}
 */
export function getSeverityStyle(severity) {
  switch (severity) {
    case "CRITICAL":
      return {
        badge: "bg-red-100 text-red-800 border-red-300 font-bold",
        dot: "bg-red-600",
        border: "border-l-4 border-l-red-600"
      };
    case "WARNING":
      return {
        badge: "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
        dot: "bg-amber-500",
        border: "border-l-4 border-l-amber-500"
      };
    case "WATCH":
      return {
        badge: "bg-amber-50 text-amber-800 border-amber-200",
        dot: "bg-amber-400",
        border: "border-l-4 border-l-amber-400"
      };
    default:
      return {
        badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
        dot: "bg-emerald-500",
        border: "border-l-4 border-l-emerald-500"
      };
  }
}
