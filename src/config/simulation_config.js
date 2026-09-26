/**
 * SwasthyaGrid AI — Emergency Simulation & Resilience Stress Testing Configuration (Build 08)
 *
 * Centralizes:
 * 1. 5 Synthetic Emergency Scenario Definitions (strictly operational resource stress tests)
 * 2. Severity Multipliers (LOW, MODERATE, HIGH, SEVERE)
 * 3. Duration Horizons (3, 7, 14, 30 days)
 * 4. Network Resilience Score Weights (Sum = 100%)
 * 5. Competition Demo Preset Configuration
 */

export const SCENARIO_TYPES = {
  DENGUE_LIKE_SURGE: {
    id: "DENGUE_LIKE_SURGE",
    name: "Dengue-Like Demand Surge",
    description: "Acute patient demand surge with accelerated consumption of IV Fluids, Paracetamol, and ORS alongside elevated inpatient bed occupancy.",
    category: "DEMAND_SURGE",
    icon: "activity",
    effects: {
      patient_demand_multiplier: { LOW: 1.25, MODERATE: 1.45, HIGH: 1.65, SEVERE: 1.85 },
      medicine_multipliers: {
        "MED-07": { LOW: 1.30, MODERATE: 1.55, HIGH: 1.80, SEVERE: 2.10 }, // IV Fluids
        "MED-01": { LOW: 1.20, MODERATE: 1.40, HIGH: 1.60, SEVERE: 1.80 }, // Paracetamol
        "MED-03": { LOW: 1.15, MODERATE: 1.35, HIGH: 1.50, SEVERE: 1.70 }  // ORS
      },
      bed_occupancy_multiplier: { LOW: 1.15, MODERATE: 1.25, HIGH: 1.35, SEVERE: 1.50 },
      staff_availability_modifier: { LOW: 0, MODERATE: -5, HIGH: -10, SEVERE: -15 }
    }
  },

  HEATWAVE: {
    id: "HEATWAVE",
    name: "Severe Heatwave & Dehydration Wave",
    description: "Extreme temperatures drive sharp increases in dehydration treatments (ORS, IV Fluids) and cause staff heat exhaustion.",
    category: "ENVIRONMENTAL_STRESS",
    icon: "sun",
    effects: {
      patient_demand_multiplier: { LOW: 1.15, MODERATE: 1.30, HIGH: 1.50, SEVERE: 1.65 },
      medicine_multipliers: {
        "MED-03": { LOW: 1.40, MODERATE: 1.75, HIGH: 2.05, SEVERE: 2.35 }, // ORS
        "MED-07": { LOW: 1.25, MODERATE: 1.50, HIGH: 1.75, SEVERE: 2.00 }  // IV Fluids
      },
      bed_occupancy_multiplier: { LOW: 1.10, MODERATE: 1.20, HIGH: 1.30, SEVERE: 1.40 },
      staff_availability_modifier: { LOW: -8, MODERATE: -15, HIGH: -22, SEVERE: -30 }
    }
  },

  FLOOD_ACCESS_DISRUPTION: {
    id: "FLOOD_ACCESS_DISRUPTION",
    name: "Flood & Road Access Disruption",
    description: "Inundation of road networks causes delivery delays, transport fleet restrictions, and isolated facility stockouts.",
    category: "LOGISTICS_DISRUPTION",
    icon: "cloud-rain",
    effects: {
      delivery_delay_days: { LOW: 2, MODERATE: 4, HIGH: 7, SEVERE: 10 },
      transport_availability_pct: { LOW: 85, MODERATE: 65, HIGH: 45, SEVERE: 25 },
      supplier_reliability_pct: { LOW: 85, MODERATE: 70, HIGH: 55, SEVERE: 40 },
      patient_demand_multiplier: { LOW: 1.05, MODERATE: 1.15, HIGH: 1.25, SEVERE: 1.35 },
      bed_occupancy_multiplier: { LOW: 1.05, MODERATE: 1.15, HIGH: 1.25, SEVERE: 1.35 }
    }
  },

  RESPIRATORY_SURGE: {
    id: "RESPIRATORY_SURGE",
    name: "Respiratory Illness Demand Surge",
    description: "Seasonal or environmental air quality degradation drives high antibiotic and antipyretic consumption and inpatient bed saturation.",
    category: "DEMAND_SURGE",
    icon: "wind",
    effects: {
      patient_demand_multiplier: { LOW: 1.20, MODERATE: 1.38, HIGH: 1.58, SEVERE: 1.78 },
      medicine_multipliers: {
        "MED-02": { LOW: 1.35, MODERATE: 1.60, HIGH: 1.85, SEVERE: 2.10 }, // Amoxicillin
        "MED-01": { LOW: 1.25, MODERATE: 1.45, HIGH: 1.65, SEVERE: 1.85 }, // Paracetamol
        "MED-06": { LOW: 1.20, MODERATE: 1.40, HIGH: 1.60, SEVERE: 1.80 }  // Doxycycline
      },
      bed_occupancy_multiplier: { LOW: 1.20, MODERATE: 1.30, HIGH: 1.42, SEVERE: 1.55 },
      staff_availability_modifier: { LOW: -5, MODERATE: -10, HIGH: -15, SEVERE: -20 }
    }
  },

  SUPPLY_CHAIN_DISRUPTION: {
    id: "SUPPLY_CHAIN_DISRUPTION",
    name: "Regional Supplier Failure & Stock Delays",
    description: "Key pharmaceutical manufacturers experience production halts or transport strikes, halting replenishments across multiple facilities.",
    category: "LOGISTICS_DISRUPTION",
    icon: "truck",
    effects: {
      delivery_delay_days: { LOW: 3, MODERATE: 6, HIGH: 10, SEVERE: 14 },
      shipment_quantity_reduction_pct: { LOW: 20, MODERATE: 40, HIGH: 60, SEVERE: 75 },
      transport_transit_multiplier: { LOW: 1.25, MODERATE: 1.50, HIGH: 1.85, SEVERE: 2.20 }
    }
  }
};

export const SEVERITY_LEVELS = {
  LOW: { code: "LOW", label: "Low Severity", multiplier: 1.20, color: "emerald", badge: "bg-emerald-100 text-emerald-800" },
  MODERATE: { code: "MODERATE", label: "Moderate Severity", multiplier: 1.45, color: "yellow", badge: "bg-yellow-100 text-yellow-800" },
  HIGH: { code: "HIGH", label: "High Severity", multiplier: 1.75, color: "amber", badge: "bg-amber-100 text-amber-800" },
  SEVERE: { code: "SEVERE", label: "Severe Crisis", multiplier: 2.10, color: "red", badge: "bg-red-100 text-red-800 font-bold" }
};

export const DURATION_HORIZONS = [
  { days: 3, label: "3 Days (Flash Event)" },
  { days: 7, label: "7 Days (Standard Surge)" },
  { days: 14, label: "14 Days (Extended Wave)" },
  { days: 30, label: "30 Days (Prolonged Crisis)" }
];

/**
 * Transparent weights for the 0–100 Network Resilience Score.
 * Sum MUST equal 1.00 (100%).
 */
export const RESILIENCE_SCORE_WEIGHTS = {
  SUPPLY_RESILIENCE: 0.30,         // 30% - Days of stock and stockout avoidance
  BED_CAPACITY_RESILIENCE: 0.25,   // 25% - Inpatient bed overflow avoidance
  REDISTRIBUTION_CAPACITY: 0.20,   // 20% - Ability of network surplus to cover deficits
  WORKFORCE_RESILIENCE: 0.15,      // 15% - Staff attendance and ratio preservation
  DELIVERY_LOGISTICS_RESILIENCE: 0.10 // 10% - Transport network buffer
};

/**
 * Official Competition Demo Preset
 */
export const DEMO_PRESET_CONFIG = {
  id: "DEMO-DISTRICT-CENTRAL-SURGE",
  name: "District Central — Severe 7-Day Demand Surge",
  scenario_type: "DENGUE_LIKE_SURGE",
  affected_geography: "District Central",
  severity: "SEVERE",
  duration: 7,
  description: "Simulates an acute health event across District Central (PHC-05, PHC-06, PHC-07, PHC-08) driving IV Fluid burn +110%, bed occupancy +50%, and patient footfall +85%. Demonstrates emergence of multiple stockouts, partial redistribution mitigation, and a persistent 320-unit resilience gap."
};
