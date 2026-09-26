/**
 * SwasthyaGrid AI — Unified Early Warning & Risk Intelligence Configuration (Build 06)
 *
 * Centralizes:
 * 1. 7 Operational Risk Domains (SUPPLY, DEMAND, CAPACITY, WORKFORCE, DELIVERY, EXPIRY, FORECAST)
 * 2. 4 Operational Severity Levels (NORMAL, WATCH, WARNING, CRITICAL)
 * 3. Facility Pressure Score Weights (Sum = 100%)
 * 4. Configurable Domain Thresholds
 * 5. Risk Velocity Classifications
 * 6. Alert Lifecycle States
 */

export const RISK_DOMAINS = {
  SUPPLY: "SUPPLY",
  DEMAND: "DEMAND",
  CAPACITY: "CAPACITY",
  WORKFORCE: "WORKFORCE",
  DELIVERY: "DELIVERY",
  EXPIRY: "EXPIRY",
  FORECAST: "FORECAST"
};

export const SEVERITY_LEVELS = {
  NORMAL: { level: "NORMAL", scoreRange: [0, 39], color: "emerald", label: "Normal" },
  WATCH: { level: "WATCH", scoreRange: [40, 59], color: "amber", label: "Watch" },
  WARNING: { level: "WARNING", scoreRange: [60, 79], color: "orange", label: "Warning" },
  CRITICAL: { level: "CRITICAL", scoreRange: [80, 100], color: "red", label: "Critical" }
};

/**
 * Configurable weights for the 0–100 Facility Pressure Score.
 * Total sum MUST equal 1.00 (100%).
 */
export const FACILITY_PRESSURE_WEIGHTS = {
  MEDICINE_SUPPLY: 0.30,   // Max 30 points
  PATIENT_DEMAND: 0.20,    // Max 20 points
  BED_CAPACITY: 0.20,      // Max 20 points
  WORKFORCE: 0.15,         // Max 15 points
  DELIVERY_RISK: 0.10,     // Max 10 points
  OTHER_OPERATIONAL: 0.05  // Max 5 points
};

/**
 * Configurable thresholds across all operational risk domains.
 */
export const DOMAIN_THRESHOLDS = {
  // Patient Demand Deviation vs 7-day Baseline
  DEMAND: {
    NORMAL_MAX: 10,       // < 10%
    WATCH_MAX: 20,        // 10% to 20%
    WARNING_MAX: 30,      // 20% to 30%
    CRITICAL_MIN: 30      // > 30%
  },

  // Bed Capacity Occupancy Rate (%)
  CAPACITY: {
    NORMAL_MAX: 70,       // < 70%
    WATCH_MAX: 80,        // 70% to 80%
    WARNING_MAX: 90,      // 80% to 90%
    CRITICAL_MIN: 90      // > 90%
  },

  // Workforce Availability Ratio (% Present vs Required)
  WORKFORCE: {
    NORMAL_MIN: 95,       // >= 95%
    WATCH_MIN: 85,        // 85% to 94%
    WARNING_MIN: 75,      // 75% to 84%
    CRITICAL_MAX: 75      // < 75%
  },

  // Medicine Days of Stock Remaining
  SUPPLY_DAYS_OF_STOCK: {
    CRITICAL_MAX: 3.0,    // <= 3.0 days
    WARNING_MAX: 7.0,     // <= 7.0 days
    WATCH_MAX: 14.0       // <= 14.0 days
  },

  // Delivery Shortage Window (Days between stock depletion and scheduled delivery)
  DELIVERY: {
    CRITICAL_MIN_SHORTAGE_DAYS: 1.0, // Deficit >= 1 day before delivery
    WARNING_MIN_SHORTAGE_DAYS: 0.1   // Any deficit before delivery
  },

  // Cold Chain & Expiry Horizon
  EXPIRY: {
    CRITICAL_DAYS: 30,    // < 30 days
    WARNING_DAYS: 60,     // < 60 days
    WATCH_DAYS: 90        // < 90 days
  },

  // Forecast Burn Rate Acceleration (% Increase in burn rate)
  FORECAST_ACCELERATION: {
    CRITICAL_MIN: 30,     // > 30% increase
    WARNING_MIN: 20,      // > 20% increase
    WATCH_MIN: 10         // > 10% increase
  }
};

export const RISK_VELOCITY = {
  IMPROVING: { code: "IMPROVING", label: "Improving", color: "emerald", icon: "↓" },
  STABLE: { code: "STABLE", label: "Stable", color: "slate", icon: "→" },
  DETERIORATING: { code: "DETERIORATING", label: "Deteriorating", color: "amber", icon: "↗" },
  RAPIDLY_DETERIORATING: { code: "RAPIDLY_DETERIORATING", label: "Rapidly Deteriorating", color: "red", icon: "↑↑" }
};

export const ALERT_LIFECYCLE_STATES = {
  ACTIVE: "ACTIVE",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  MONITORING: "MONITORING",
  RESOLVED: "RESOLVED"
};
