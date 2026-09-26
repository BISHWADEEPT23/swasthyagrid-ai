/**
 * SwasthyaGrid AI — Synthetic Alert History Dataset
 * Fields:
 * - alert_id
 * - phc_id
 * - timestamp
 * - resource_category
 * - severity (CRITICAL | WARNING | WATCH | NORMAL)
 * - message
 * - status (ACTIVE | ACKNOWLEDGED | RESOLVED)
 */

export const ALERT_HISTORY_DATASET = [
  // PHC-07 Alerts (Emerging Critical Health Emergency)
  {
    alert_id: "ALT-07-101",
    phc_id: "PHC-07",
    timestamp: "2026-09-20T11:30:00Z",
    resource_category: "Emergency Capacity",
    severity: "CRITICAL",
    message: "Potential resource shortage detected at PHC-07.",
    status: "ACTIVE"
  },
  {
    alert_id: "ALT-07-102",
    phc_id: "PHC-07",
    timestamp: "2026-09-20T10:45:00Z",
    resource_category: "Medicine / IV Fluids",
    severity: "CRITICAL",
    message: "IV Fluids consumption surged +45% (58 units/day). Stock projected below safety threshold in 28 hrs.",
    status: "ACTIVE"
  },
  {
    alert_id: "ALT-07-103",
    phc_id: "PHC-07",
    timestamp: "2026-09-20T09:15:00Z",
    resource_category: "Inpatient Beds",
    severity: "CRITICAL",
    message: "Bed occupancy reached 91.7% (22/24 beds occupied). Rapidly declining available capacity.",
    status: "ACTIVE"
  },
  {
    alert_id: "ALT-07-098",
    phc_id: "PHC-07",
    timestamp: "2026-09-19T16:20:00Z",
    resource_category: "Medicine / Paracetamol",
    severity: "WARNING",
    message: "Paracetamol 500mg daily consumption elevated +32% above 7-day moving baseline.",
    status: "ACKNOWLEDGED"
  },
  {
    alert_id: "ALT-07-089",
    phc_id: "PHC-07",
    timestamp: "2026-09-18T08:00:00Z",
    resource_category: "Cold Chain Storage",
    severity: "WATCH",
    message: "ILR refrigerator chamber 2 temperature transient fluctuation (+0.8°C above setpoint).",
    status: "RESOLVED"
  },

  // PHC-11 Alerts (WARNING facility)
  {
    alert_id: "ALT-11-045",
    phc_id: "PHC-11",
    timestamp: "2026-09-20T10:15:00Z",
    resource_category: "Bed Capacity",
    severity: "WARNING",
    message: "Bed occupancy at 85.0% (17/20 beds). Only 3 available beds remaining.",
    status: "ACTIVE"
  },
  {
    alert_id: "ALT-11-042",
    phc_id: "PHC-11",
    timestamp: "2026-09-20T08:30:00Z",
    resource_category: "Antibiotics / Amoxicillin",
    severity: "WARNING",
    message: "Amoxicillin stock below minimum safety threshold (255 units remaining).",
    status: "ACTIVE"
  },
  {
    alert_id: "ALT-11-039",
    phc_id: "PHC-11",
    timestamp: "2026-09-19T14:10:00Z",
    resource_category: "Workforce",
    severity: "WATCH",
    message: "Staff availability at 70% (7/10). Nurse roster shortfall on evening shift.",
    status: "ACKNOWLEDGED"
  },

  // PHC-04 Alerts (WATCH facility)
  {
    alert_id: "ALT-04-022",
    phc_id: "PHC-04",
    timestamp: "2026-09-20T09:40:00Z",
    resource_category: "Patient Footfall",
    severity: "WATCH",
    message: "OPD footfall +11.8% above 7-day average (132 vs 118 patients).",
    status: "ACTIVE"
  },
  {
    alert_id: "ALT-04-019",
    phc_id: "PHC-04",
    timestamp: "2026-09-18T11:00:00Z",
    resource_category: "Electrolytes / ORS",
    severity: "WATCH",
    message: "ORS stock nearing reorder point; buffer order generated.",
    status: "RESOLVED"
  },

  // PHC-08 Alerts (WATCH facility)
  {
    alert_id: "ALT-08-031",
    phc_id: "PHC-08",
    timestamp: "2026-09-20T09:20:00Z",
    resource_category: "Inpatient Beds",
    severity: "WATCH",
    message: "Occupancy at 75.0% (12/16 beds). Approaching watch threshold.",
    status: "ACTIVE"
  },
  {
    alert_id: "ALT-08-028",
    phc_id: "PHC-08",
    timestamp: "2026-09-19T10:15:00Z",
    resource_category: "Workforce",
    severity: "WATCH",
    message: "Staff availability at 81.8% (9/11). Pharmacist on scheduled training.",
    status: "ACKNOWLEDGED"
  }
];
