/**
 * SwasthyaGrid AI — Emergency Scenario Configuration
 * Focus: PHC-07 (St. Jude Central PHC) Emerging Health Emergency
 *
 * Specific metrics:
 * - Patient footfall: +35% above baseline (196 vs 145 7-day average)
 * - IV Fluid consumption: +45% (58 units/day vs 40 units/day)
 * - Paracetamol consumption: +32% (238 units/day vs 180 units/day)
 * - Available beds: rapidly decreasing (2 beds left out of 24, 91.7% occupancy)
 * - Medical demand: increasing
 * - Display: "Potential resource shortage detected at PHC-07."
 */

export const PHC07_EMERGENCY_SCENARIO = {
  phc_id: "PHC-07",
  facility_name: "St. Jude Central PHC",
  district: "District Central",
  population_served: 42600,
  operational_status: "CRITICAL",
  headline_alert: "CRITICAL FACILITY ALERT",
  primary_message: "Potential resource shortage detected at PHC-07.",
  signals: [
    {
      metric: "Patient demand",
      deviation: "+35%",
      current: 286,
      baseline: 212,
      unit: "patients/day",
      severity: "CRITICAL",
      description: "Patient footfall surge at 286 today vs 212 baseline (+35% above 7-day baseline)."
    },
    {
      metric: "IV Fluid consumption",
      deviation: "+45%",
      current: 48,
      baseline: 33,
      unit: "units/day",
      severity: "CRITICAL",
      description: "IV Fluid consumption surged +45%; 105 units in stock, 2.2 days left."
    },
    {
      metric: "Paracetamol consumption",
      deviation: "+32%",
      current: 62,
      baseline: 47,
      unit: "units/day",
      severity: "WARNING",
      description: "Paracetamol consumption surged +32%; 310 in stock, 5.0 days left."
    },
    {
      metric: "Bed availability declining",
      deviation: "91% Occupied",
      current: 2,
      baseline: 8,
      unit: "available beds",
      severity: "CRITICAL",
      description: "Inpatient bed availability rapidly declining (91% occupied, only 2 beds remaining)."
    }
  ],
  historical_7day_demand: [
    { day: "Day -6", patients: 210, bedsOccupied: 12, ivConsumption: 32 },
    { day: "Day -5", patients: 215, bedsOccupied: 13, ivConsumption: 33 },
    { day: "Day -4", patients: 212, bedsOccupied: 14, ivConsumption: 33 },
    { day: "Day -3", patients: 224, bedsOccupied: 16, ivConsumption: 36 },
    { day: "Day -2", patients: 248, bedsOccupied: 18, ivConsumption: 40 },
    { day: "Day -1", patients: 268, bedsOccupied: 20, ivConsumption: 44 },
    { day: "Today", patients: 286, bedsOccupied: 22, ivConsumption: 48 }
  ]
};
