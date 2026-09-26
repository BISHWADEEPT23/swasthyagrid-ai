/**
 * SwasthyaGrid AI — System Health, Freshness & Observability Service
 *
 * Tracks:
 * 1. Platform Subsystems (Operational Dataset, Forecasting, Supply Chain, Risk Engine,
 *    Redistribution, Simulation, Gemini Service, Federation Simulator)
 * 2. Data Freshness (< 15m CURRENT, 15-60m AGING, > 60m STALE)
 * 3. Observability Log (API failures, AI failures, forecast/sim errors, client errors)
 * 4. Graceful Degradation (non-essential service failures do not crash core ops)
 */

export const SUBSYSTEMS = [
  { id: "operational_dataset", name: "Operational Baseline Dataset (12 PHCs)", critical: true },
  { id: "forecasting_engine", name: "Demand & Capacity Forecasting Engine", critical: true },
  { id: "supply_chain_engine", name: "Supply Chain & Depletion Engine", critical: true },
  { id: "risk_engine", name: "Unified Risk & Early Warning Engine", critical: true },
  { id: "redistribution_optimizer", name: "Resource Redistribution Optimizer", critical: false },
  { id: "simulation_engine", name: "Emergency Simulation Engine", critical: false },
  { id: "gemini_service", name: "Gemini Health Command Service", critical: false },
  { id: "federation_simulator", name: "BRICS Federation Learning Simulator", critical: false }
];

export const STATUS_TYPES = {
  HEALTHY: "HEALTHY",
  DEGRADED: "DEGRADED",
  UNAVAILABLE: "UNAVAILABLE"
};

export const FRESHNESS_THRESHOLDS = {
  CURRENT_MAX_MINUTES: 15,
  AGING_MAX_MINUTES: 60
};

// In-memory status registry
let subsystemStatus = {
  operational_dataset: { status: STATUS_TYPES.HEALTHY, latency_ms: 12, last_check: new Date().toISOString(), message: "12/12 PHC records online" },
  forecasting_engine: { status: STATUS_TYPES.HEALTHY, latency_ms: 45, last_check: new Date().toISOString(), message: "7-day horizon active (92% conf)" },
  supply_chain_engine: { status: STATUS_TYPES.HEALTHY, latency_ms: 28, last_check: new Date().toISOString(), message: "Depletion tracking active" },
  risk_engine: { status: STATUS_TYPES.HEALTHY, latency_ms: 32, last_check: new Date().toISOString(), message: "Compound risk radar active" },
  redistribution_optimizer: { status: STATUS_TYPES.HEALTHY, latency_ms: 64, last_check: new Date().toISOString(), message: "Haversine routing calibrated" },
  simulation_engine: { status: STATUS_TYPES.HEALTHY, latency_ms: 51, last_check: new Date().toISOString(), message: "Sandbox isolated" },
  gemini_service: { status: STATUS_TYPES.HEALTHY, latency_ms: 180, last_check: new Date().toISOString(), message: "Dual-mode reasoning ready" },
  federation_simulator: { status: STATUS_TYPES.HEALTHY, latency_ms: 72, last_check: new Date().toISOString(), message: "Round 004 active (4/5 nodes)" }
};

// Observability error event log
let observabilityLogs = [];

/**
 * Get overall platform status
 */
export function getPlatformHealth() {
  const values = Object.values(subsystemStatus);
  const hasUnavailable = values.some(s => s.status === STATUS_TYPES.UNAVAILABLE);
  const hasDegraded = values.some(s => s.status === STATUS_TYPES.DEGRADED);

  let overall = STATUS_TYPES.HEALTHY;
  if (hasUnavailable) overall = STATUS_TYPES.DEGRADED; // Still degraded if non-essential, unavailable if critical
  if (subsystemStatus.operational_dataset.status === STATUS_TYPES.UNAVAILABLE) {
    overall = STATUS_TYPES.UNAVAILABLE;
  } else if (hasDegraded || hasUnavailable) {
    overall = STATUS_TYPES.DEGRADED;
  }

  return {
    overall_status: overall,
    timestamp: new Date().toISOString(),
    subsystems: subsystemStatus,
    healthy_count: values.filter(s => s.status === STATUS_TYPES.HEALTHY).length,
    total_count: values.length,
    active_degradations: values.filter(s => s.status !== STATUS_TYPES.HEALTHY)
  };
}

/**
 * Update subsystem status (supports simulation/testing)
 */
export function setSubsystemStatus(subsystemId, status, message = "") {
  if (subsystemStatus[subsystemId]) {
    subsystemStatus[subsystemId].status = status;
    subsystemStatus[subsystemId].last_check = new Date().toISOString();
    if (message) subsystemStatus[subsystemId].message = message;
  }
}

/**
 * Check data freshness for a given timestamp (in simulated minutes)
 */
export function evaluateDataFreshness(lastUpdatedIso, ageMinutes = null) {
  let minutesOld = ageMinutes;
  if (minutesOld === null && lastUpdatedIso) {
    const updated = new Date(lastUpdatedIso).getTime();
    const now = Date.now();
    minutesOld = Math.max(0, Math.floor((now - updated) / (1000 * 60)));
  }
  if (minutesOld === null) minutesOld = 4; // default simulated freshness: 4 minutes

  let freshness_status = "CURRENT";
  let label = "Current (< 15m)";
  let badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";

  if (minutesOld > FRESHNESS_THRESHOLDS.AGING_MAX_MINUTES) {
    freshness_status = "STALE";
    label = `Stale (${minutesOld}m old)`;
    badgeClass = "bg-red-100 text-red-800 border-red-200";
  } else if (minutesOld > FRESHNESS_THRESHOLDS.CURRENT_MAX_MINUTES) {
    freshness_status = "AGING";
    label = `Aging (${minutesOld}m old)`;
    badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
  }

  return {
    source: "Simulated Mesh Telemetry",
    last_updated: lastUpdatedIso || new Date().toISOString(),
    age_minutes: minutesOld,
    freshness_status,
    label,
    badgeClass,
    is_simulated: true
  };
}

/**
 * Record an observability log event
 */
export function recordObservabilityEvent(category, severity, message, details = {}) {
  const event = {
    id: `OBS-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    timestamp: new Date().toISOString(),
    category, // 'API_FAILURE', 'AI_FAILURE', 'FORECAST_ERROR', 'SIMULATION_ERROR', 'VALIDATION_ERROR', 'CLIENT_ERROR'
    severity, // 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
    message,
    details
  };
  observabilityLogs.unshift(event);
  if (observabilityLogs.length > 100) observabilityLogs.pop();
  return event;
}

/**
 * Get recent observability logs
 */
export function getObservabilityLogs(limit = 20) {
  return observabilityLogs.slice(0, limit);
}

/**
 * Reset all health and observability telemetry to deterministic baseline
 */
export function resetSystemHealth() {
  subsystemStatus = {
    operational_dataset: { status: STATUS_TYPES.HEALTHY, latency_ms: 12, last_check: new Date().toISOString(), message: "12/12 PHC records online" },
    forecasting_engine: { status: STATUS_TYPES.HEALTHY, latency_ms: 45, last_check: new Date().toISOString(), message: "7-day horizon active (92% conf)" },
    supply_chain_engine: { status: STATUS_TYPES.HEALTHY, latency_ms: 28, last_check: new Date().toISOString(), message: "Depletion tracking active" },
    risk_engine: { status: STATUS_TYPES.HEALTHY, latency_ms: 32, last_check: new Date().toISOString(), message: "Compound risk radar active" },
    redistribution_optimizer: { status: STATUS_TYPES.HEALTHY, latency_ms: 64, last_check: new Date().toISOString(), message: "Haversine routing calibrated" },
    simulation_engine: { status: STATUS_TYPES.HEALTHY, latency_ms: 51, last_check: new Date().toISOString(), message: "Sandbox isolated" },
    gemini_service: { status: STATUS_TYPES.HEALTHY, latency_ms: 180, last_check: new Date().toISOString(), message: "Dual-mode reasoning ready" },
    federation_simulator: { status: STATUS_TYPES.HEALTHY, latency_ms: 72, last_check: new Date().toISOString(), message: "Round 004 active (4/5 nodes)" }
  };
  observabilityLogs = [];
}
