/**
 * SwasthyaGrid AI — Consolidated Audit & Activity Service
 *
 * Captures:
 * 1. Alert Lifecycle events (created, acknowledged, resolved)
 * 2. Forecast generation events
 * 3. AI Copilot queries & reasoning outputs
 * 4. Transfer recommendations, approvals, dispatches, and deliveries
 * 5. Emergency simulation runs & resets
 * 6. Federation rounds, model updates, and rollbacks
 *
 * Supports filtering by:
 * - Event type
 * - PHC
 * - District
 * - Severity
 * - User / Role
 */

// Baseline seed of realistic audit events
const INITIAL_AUDIT_EVENTS = [
  {
    id: "AUD-1001",
    timestamp: "2026-09-20T08:00:00Z",
    event_type: "SYSTEM_STARTUP",
    severity: "INFO",
    entity: "National Mesh",
    phc_id: null,
    district: "All Districts",
    user_role: "System Orchestrator",
    details: "SwasthyaGrid AI core operational mesh initialized. 12 PHCs online across 3 districts."
  },
  {
    id: "AUD-1002",
    timestamp: "2026-09-20T09:15:00Z",
    event_type: "FORECAST_GENERATED",
    severity: "INFO",
    entity: "PHC-07",
    phc_id: "PHC-07",
    district: "District Central",
    user_role: "Forecasting Engine",
    details: "7-day horizon computed. Inflow +35% surge identified. IV Fluid depletion projected in 1.8 days."
  },
  {
    id: "AUD-1003",
    timestamp: "2026-09-20T09:30:00Z",
    event_type: "ALERT_CREATED",
    severity: "CRITICAL",
    entity: "ALT-COMPOUND-PHC-07",
    phc_id: "PHC-07",
    district: "District Central",
    user_role: "Unified Risk Engine",
    details: "Critical Compound Risk: Dehydration surge (+35%), bed pressure (91.7%), IV Fluids stockout window (3.2 days)."
  },
  {
    id: "AUD-1004",
    timestamp: "2026-09-20T10:00:00Z",
    event_type: "TRANSFER_RECOMMENDED",
    severity: "WARNING",
    entity: "TX-REC-001",
    phc_id: "PHC-07",
    district: "District Central",
    user_role: "Redistribution Optimizer",
    details: "Recommended transfer of 150 units IV Fluids from PHC-05 to PHC-07 (transit: 45 mins, donor buffer: 4.5 days)."
  },
  {
    id: "AUD-1005",
    timestamp: "2026-09-20T11:50:00Z",
    event_type: "TRANSFER_APPROVED",
    severity: "INFO",
    entity: "TX-REC-001",
    phc_id: "PHC-07",
    district: "District Central",
    user_role: "Chief Medical Officer",
    details: "Human decision maker signed off on emergency transfer of 150 units IV Fluids from PHC-05 to PHC-07."
  },
  {
    id: "AUD-1006",
    timestamp: "2026-09-20T12:15:00Z",
    event_type: "FEDERATION_ROUND",
    severity: "INFO",
    entity: "GLOBAL-004",
    phc_id: null,
    district: "BRICS Mesh",
    user_role: "Federation Administrator",
    details: "Federation Round 004 completed. 4/5 sovereign nodes aggregated via FedAvg (+3.2% net accuracy gain)."
  }
];

let auditEvents = [...INITIAL_AUDIT_EVENTS];

/**
 * Record an audit event
 */
export function recordAuditEvent({
  event_type,
  severity = "INFO",
  entity = "System",
  phc_id = null,
  district = "All",
  user_role = "State/National Administrator",
  details = ""
}) {
  const event = {
    id: `AUD-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    event_type,
    severity,
    entity,
    phc_id,
    district,
    user_role,
    details
  };
  auditEvents.unshift(event);
  if (auditEvents.length > 500) auditEvents.pop();
  return event;
}

/**
 * Query audit events with optional filters
 */
export function getAuditEvents(filters = {}) {
  let filtered = [...auditEvents];

  if (filters.event_type && filters.event_type !== "ALL") {
    filtered = filtered.filter(e => e.event_type === filters.event_type);
  }
  if (filters.phc_id && filters.phc_id !== "ALL") {
    filtered = filtered.filter(e => e.phc_id === filters.phc_id);
  }
  if (filters.district && filters.district !== "ALL") {
    filtered = filtered.filter(e => e.district === filters.district || e.district === "All Districts");
  }
  if (filters.severity && filters.severity !== "ALL") {
    filtered = filtered.filter(e => e.severity === filters.severity);
  }
  if (filters.user_role && filters.user_role !== "ALL") {
    filtered = filtered.filter(e => e.user_role === filters.user_role);
  }

  return filtered;
}

/**
 * Reset audit log to deterministic baseline
 */
export function resetAuditLog() {
  auditEvents = [...INITIAL_AUDIT_EVENTS];
}
