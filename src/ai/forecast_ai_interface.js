/**
 * SwasthyaGrid AI — AI Forecast Abstraction Interface (Build 04)
 *
 * Provides a clean abstraction boundary between deterministic forecasting calculations
 * and future Gemini / LLM natural language reasoning and executive briefings.
 *
 * STRICT PRINCIPLE:
 * - Mathematical forecasting is ALWAYS deterministic and computed by `forecasting_service.js`.
 * - Gemini / LLM models are NEVER used to calculate numbers or make statistical predictions.
 * - This interface packages deterministic forecast outputs into structured, clinical-grade
 *   prompts and context payloads for future LLM integration.
 */

import { forecastPatientDemand, forecastMedicineConsumption, forecastBedOccupancy, getNationalForecastSummary } from "../logic/forecasting_service.js";
import { PHC_DATASET } from "../data/phc_dataset.js";

/**
 * Builds a structured, grounded payload for an LLM to generate an executive clinical briefing
 * for a specific Primary Health Centre.
 * 
 * @param {string} phcId 
 * @param {number} horizon 
 * @returns {Object} Grounded context payload
 */
export function buildPhcForecastPromptPayload(phcId, horizon = 7) {
  const phc = PHC_DATASET.find(p => p.phc_id === phcId) || PHC_DATASET[6];
  const demandForecast = forecastPatientDemand(phc.phc_id, horizon);
  const bedForecast = forecastBedOccupancy(phc.phc_id, horizon);
  
  // High-risk medicines for this PHC
  const keyMeds = ["MED-01", "MED-02", "MED-03", "MED-07"]; // Paracetamol, Amoxicillin, ORS, IV Fluids
  const medicineForecasts = keyMeds.map(medId => forecastMedicineConsumption(phc.phc_id, medId, horizon));

  return {
    system_role: "Public Health Supply Chain & Operational Resilience Advisor",
    task: "Generate a concise executive operational briefing and priority mitigation checklist based strictly on the provided deterministic telemetry and forecast.",
    grounded_context: {
      facility: {
        phc_id: phc.phc_id,
        phc_name: phc.phc_name,
        district: phc.district,
        population_served: phc.population_served,
        operational_status: phc.operational_status
      },
      forecast_horizon_days: horizon,
      patient_demand: {
        current_today: demandForecast.current_today,
        baseline_7day: demandForecast.baseline_7day,
        surge_percentage: demandForecast.surge_percentage,
        surge_classification: demandForecast.surge_classification.level,
        avg_projected_daily: demandForecast.avg_projected_daily,
        peak_projected_daily: demandForecast.peak_projected_daily,
        confidence: `${demandForecast.confidence_percentage}% (${demandForecast.confidence_label})`,
        drivers: demandForecast.whyThisForecast
      },
      bed_capacity: {
        total_beds: bedForecast.total_beds,
        current_occupied: bedForecast.current_occupied,
        current_occupancy_rate: `${bedForecast.current_occupancy_rate}%`,
        peak_projected_rate: `${bedForecast.peak_occupancy_rate}%`,
        peak_pressure: bedForecast.peak_pressure.level,
        drivers: bedForecast.whyThisForecast
      },
      critical_medicines: medicineForecasts.map(m => ({
        medicine_name: m.medicine_name,
        current_stock: m.current_stock,
        static_burn_rate: `${m.daily_consumption}/day`,
        forecast_burn_rate: `${m.forecast_daily_consumption}/day`,
        static_days_of_stock: m.static_days_of_stock,
        forecast_days_of_stock: m.forecast_days_of_stock,
        predicted_stockout_date: m.predicted_stockout_date,
        next_delivery_date: m.next_delivery_date,
        shortage_window_days: m.shortage_window_days,
        risk_level: m.risk_level,
        drivers: m.whyThisForecast
      }))
    },
    constraints: [
      "Do NOT fabricate any metrics or dates outside the grounded context.",
      "Highlight the IV Fluids shortage window if present.",
      "Recommend proactive redistribution before stockout occurs."
    ]
  };
}

/**
 * Builds a structured payload for national-level executive briefing.
 * @param {number} horizon 
 * @returns {Object}
 */
export function buildNationalBriefingPromptPayload(horizon = 7) {
  const summary = getNationalForecastSummary(horizon);

  return {
    system_role: "National Chief Medical Logistics Officer AI",
    task: "Generate national-scale situational report and inter-district reallocation directives.",
    grounded_context: {
      forecast_horizon_days: horizon,
      total_patients_today: summary.total_patients_today,
      projected_avg_daily_patients: summary.avg_projected_daily_national,
      net_growth_percentage: `${summary.net_patient_growth_pct}%`,
      facilities_in_critical_surge: summary.facilities_in_critical_surge_count,
      facilities_at_capacity_risk: summary.facilities_at_capacity_risk_count,
      predicted_stockouts_count: summary.predicted_critical_stockouts_count,
      high_priority_stockouts: summary.stockout_risks.slice(0, 5).map(s => ({
        phc_id: s.phc_id,
        medicine: s.medicine_name,
        current_stock: s.current_stock,
        forecast_days_left: s.forecast_days_of_stock,
        shortage_window: `${s.shortage_window_days} days`
      }))
    }
  };
}

/**
 * Deterministic preview template of an AI clinical briefing.
 * Demonstrates the exact output format that will be rendered when live Gemini calls are enabled.
 * 
 * @param {Object} payload - Produced by buildPhcForecastPromptPayload
 * @returns {string} Markdown text
 */
export function generateMockAiExecutiveBriefing(payload) {
  const ctx = payload.grounded_context;
  const ivFluids = ctx.critical_medicines.find(m => m.medicine_name.includes("IV Fluids"));

  return `### Operational Intelligence Briefing — ${ctx.facility.phc_id} (${ctx.facility.phc_name})
**Generated via Grounded Deterministic Telemetry**

1. **Patient Surge Dynamics**:
   - Facility is experiencing a **+${ctx.patient_demand.surge_percentage}% demand surge** (${ctx.patient_demand.current_today} patients vs. ${ctx.patient_demand.baseline_7day} baseline).
   - Forecast projects an average daily inflow of **${ctx.patient_demand.avg_projected_daily} patients/day** (Peak: **${ctx.patient_demand.peak_projected_daily}**) over the next ${ctx.forecast_horizon_days} days.
   - Clinical driver: Active gastrointestinal/waterborne cluster in ${ctx.facility.district}.

2. **Supply Chain Vulnerability (IV Fluids)**:
   - Current static burn rate (48/day) gives 2.2 days of stock, but **forecast-adjusted burn rate rises to ${ivFluids ? ivFluids.forecast_burn_rate : '58/day'}**.
   - **Dynamic Stock Coverage is reduced to ${ivFluids ? ivFluids.forecast_days_of_stock : '1.8'} days** (Predicted stockout: **${ivFluids ? ivFluids.predicted_stockout_date : '2026-09-22'}**).
   - Scheduled delivery is ${ivFluids ? ivFluids.next_delivery_date.split('T')[0] : '2026-09-25'}, creating a **${ivFluids ? ivFluids.shortage_window_days : '3.2'}-day unbuffered shortage window**.

3. **Immediate Directives**:
   - Initiate immediate cross-facility transfer request of 150 units of IV Fluids from District Central buffer facilities (e.g. PHC-05 / PHC-06).
   - Activate secondary triage to manage bed occupancy (projected to reach ${ctx.bed_capacity.peak_projected_rate}).`;
}
