/**
 * SwasthyaGrid AI — Supply Chain Configuration & Risk Thresholds
 * Centralized configuration for deterministic operational rules.
 */

export const SUPPLY_CHAIN_CONFIG = {
  // Operational reference date for synthetic simulation
  REFERENCE_DATE: "2026-09-20T12:00:00Z",

  // Stock Coverage & Depletion Risk Thresholds (in days of stock)
  STOCK_COVERAGE_THRESHOLDS: {
    CRITICAL_DAYS: 3.0,     // days_of_stock <= 3
    WARNING_DAYS: 7.0,      // days_of_stock > 3 and <= 7
    WATCH_DAYS: 14.0        // days_of_stock > 7 and <= 14
    // NORMAL: days_of_stock > 14
  },

  // Expiry Risk Thresholds (in calendar days remaining)
  EXPIRY_THRESHOLDS: {
    CRITICAL_DAYS: 7,       // <= 7 days
    WARNING_DAYS: 30,       // 8 to 30 days
    WATCH_DAYS: 60          // 31 to 60 days
    // NORMAL: > 60 days
  },

  // Surplus Inventory Criteria
  SURPLUS_CRITERIA: {
    MINIMUM_SURPLUS_DAYS: 30.0, // > 30 days of stock remaining
    SAFETY_STOCK_MULTIPLIER: 1.5 // and current_stock > safety_stock * 1.5
  },

  // Facility Medicine Supply Pressure Score Weights (Normalized to 0 - 100)
  PRESSURE_WEIGHTS: {
    CRITICAL_ITEM_WEIGHT: 30,       // Each critical item adds weight
    WARNING_ITEM_WEIGHT: 12,        // Each warning item adds weight
    DELIVERY_RISK_WEIGHT: 35,       // Stockout projected before next delivery
    SAFETY_GAP_WEIGHT: 15,          // Deficit below minimum safety stock
    MAX_SCORE: 100
  },

  // Status Labels and Color Styles
  STATUS_STYLES: {
    CRITICAL: {
      label: "CRITICAL",
      badgeClass: "bg-red-100 text-red-800 border-red-300 font-bold animate-pulse",
      dotClass: "bg-red-600",
      textColor: "text-red-700"
    },
    WARNING: {
      label: "WARNING",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
      dotClass: "bg-amber-500",
      textColor: "text-amber-800"
    },
    WATCH: {
      label: "WATCH",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      dotClass: "bg-amber-400",
      textColor: "text-amber-700"
    },
    NORMAL: {
      label: "NORMAL",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dotClass: "bg-emerald-500",
      textColor: "text-emerald-700"
    },
    POTENTIAL_SURPLUS: {
      label: "POTENTIAL SURPLUS",
      badgeClass: "bg-sky-50 text-sky-800 border-sky-300 font-bold",
      dotClass: "bg-sky-500",
      textColor: "text-sky-700"
    }
  }
};
