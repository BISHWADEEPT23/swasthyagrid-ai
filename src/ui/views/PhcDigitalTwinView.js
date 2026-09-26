/**
 * SwasthyaGrid AI — PHC Digital Twin View
 * Route: /phc/:phcId (e.g. /phc/PHC-07)
 *
 * Implements the exact executive digital twin layout:
 * 1. Header & 4 KPIs:
 *    - PATIENTS: 286 (↑ 35%)
 *    - BED OCCUPANCY: 91%
 *    - MEDICINES: 71%
 *    - STAFF: 87%
 * 2. PATIENT DEMAND with surge curve & "+35% above 7-day baseline"
 * 3. MEDICINE INVENTORY table (Medicine, Stock, Daily Use, Days Left, Status)
 * 4. CRITICAL FACILITY ALERT with 4 exact signals
 * 5. Operational drill-down panels: Bed capacity, Workforce roster, and Alert history
 */

import { PHC_DATASET } from "../../data/phc_dataset.js";
import { getInventoryForPhc } from "../../logic/inventory_service.js";
import { getAlertsForPhc } from "../../logic/alert_service.js";
import { 
  bedOccupancy, 
  staffAvailability, 
  patientDemandDeviation, 
  daysOfStock,
  getStockStatusInfo 
} from "../../logic/calculations.js";
import { renderStatusBadge } from "../components/PHCStatusBadge.js";
import { renderPatientDemandChart, mountPatientDemandChart } from "../components/PatientDemandChart.js";
import { renderBedCapacityCard } from "../components/BedCapacityCard.js";
import { renderWorkforcePanel } from "../components/WorkforcePanel.js";
import { renderMedicineInventoryTable } from "../components/MedicineInventoryTable.js";
import { renderAlertPanel } from "../components/AlertPanel.js";
import { 
  forecastPatientDemand, 
  forecastMedicineConsumption, 
  forecastBedOccupancy 
} from "../../logic/forecasting_service.js";
import { FORECAST_HORIZONS } from "../../config/forecasting_config.js";
import { 
  buildPhcForecastPromptPayload, 
  generateMockAiExecutiveBriefing 
} from "../../ai/forecast_ai_interface.js";
import { calculateFacilityRiskProfile } from "../../logic/unified_risk_engine.js";

let phcForecastHorizon = 7;

export function renderPhcDigitalTwinView(phcId) {
  const phc = PHC_DATASET.find(p => p.phc_id === phcId) || PHC_DATASET[6]; // Default to PHC-07
  const inventory = getInventoryForPhc(phc.phc_id);
  const alerts = getAlertsForPhc(phc.phc_id);

  // Reusable business logic calculations
  const bedMetrics = bedOccupancy(phc);
  const staffMetrics = staffAvailability(phc);
  const footfallDeviation = patientDemandDeviation(phc.patients_today, phc.patients_7day_average);

  const isCritical = phc.operational_status === "CRITICAL";
  const isPHC07 = phc.phc_id === "PHC-07";

  // Predictive Analytics Calculations (Build 04)
  const demandForecast = forecastPatientDemand(phc.phc_id, phcForecastHorizon);
  const bedForecast = forecastBedOccupancy(phc.phc_id, phcForecastHorizon);
  const medParacetamol = forecastMedicineConsumption(phc.phc_id, "MED-01", phcForecastHorizon);
  const medAmoxicillin = forecastMedicineConsumption(phc.phc_id, "MED-02", phcForecastHorizon);
  const medOrs = forecastMedicineConsumption(phc.phc_id, "MED-03", phcForecastHorizon);
  const medIvFluids = forecastMedicineConsumption(phc.phc_id, "MED-07", phcForecastHorizon);
  const keyForecastMeds = [medParacetamol, medIvFluids, medOrs, medAmoxicillin];
  const riskProfile = calculateFacilityRiskProfile(phc.phc_id, phcForecastHorizon);

  // Key medicines for focused summary table
  const keyMedicineNames = ["Paracetamol 500mg", "IV Fluids (NS / RL 500ml)", "ORS Sachets (Oral Rehydration Salts)", "Amoxicillin 500mg"];
  const focusedInventory = inventory.filter(item => keyMedicineNames.some(name => item.medicine_name.includes(name.split(" ")[0])));

  return `
    <div class="space-y-6 pb-12">
      <!-- Breadcrumb & Top Navigation -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div class="flex items-center gap-2 text-xs">
          <a href="#/network" class="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-200 transition-colors">
            ← Back to PHC Network
          </a>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span>Digital Twin Sync:</span>
          <span class="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Updated 2 min ago
          </span>
        </div>
      </div>

      <!-- ==================== EXECUTIVE DIGITAL TWIN CARD ==================== -->
      <div class="rounded-2xl border ${isCritical ? "border-red-300 bg-white shadow-md ring-1 ring-red-200" : "border-slate-200 bg-white shadow-sm"} p-6 md:p-8 space-y-6">
        
        <!-- HEADER -->
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-mono">
                ${phc.phc_id} DIGITAL TWIN
              </h1>
              ${renderStatusBadge(phc.operational_status)}
            </div>
            
            <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
              <span>District: <strong class="text-slate-900">${phc.district}</strong></span>
              <span>Updated: <strong class="text-slate-900 font-mono">2 min ago</strong></span>
              <span>Population Served: <strong class="text-slate-900 font-mono">${phc.population_served.toLocaleString()}</strong></span>
            </div>
          </div>

          <!-- Switcher -->
          <div class="flex items-center gap-2">
            <select 
              onchange="window.location.hash = '#/phc/' + this.value"
              class="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-sm"
            >
              ${PHC_DATASET.map(p => `
                <option value="${p.phc_id}" ${p.phc_id === phc.phc_id ? "selected" : ""}>
                  ${p.phc_id} - ${p.phc_name} (${p.operational_status})
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <!-- TOP 4 KPIS: PATIENTS, BED OCCUPANCY, MEDICINES, STAFF -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
          <!-- PATIENTS -->
          <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">PATIENTS</div>
            <div class="text-3xl font-black text-slate-900 mt-1 font-mono">
              ${phc.patients_today}
            </div>
            <div class="text-xs font-bold text-red-600 mt-1 flex items-center gap-1 font-mono">
              <span>↑ 35%</span>
            </div>
          </div>

          <!-- BED OCCUPANCY -->
          <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">BED OCCUPANCY</div>
            <div class="text-3xl font-black ${bedMetrics.occupancyPercentage >= 90 ? "text-red-600" : "text-slate-900"} mt-1 font-mono">
              ${Math.round(bedMetrics.occupancyPercentage)}%
            </div>
          </div>

          <!-- MEDICINES -->
          <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">MEDICINES</div>
            <div class="text-3xl font-black ${phc.medicine_availability_percentage < 75 ? "text-red-600" : "text-slate-900"} mt-1 font-mono">
              ${Math.round(phc.medicine_availability_percentage)}%
            </div>
          </div>

          <!-- STAFF -->
          <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">STAFF</div>
            <div class="text-3xl font-black ${staffMetrics.staffAvailabilityPercentage < 90 ? "text-amber-600" : "text-slate-900"} mt-1 font-mono">
              ${Math.round(staffMetrics.staffAvailabilityPercentage)}%
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 my-4"></div>

        <!-- ==================== PATIENT DEMAND SECTION ==================== -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
              PATIENT DEMAND
            </h2>
            <span class="text-xs font-bold text-red-600 font-mono">
              +35% above 7-day baseline
            </span>
          </div>

          <!-- Stylized Curve + Chart.js Canvas -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <!-- ASCII / Visual surge banner -->
            <div class="hidden sm:block font-mono text-[11px] text-slate-400 leading-none mb-3 overflow-x-auto whitespace-pre bg-white p-3 rounded-lg border border-slate-200 text-center">
                       ╭───╮
                  ╭────╯   ╰
          ╭───────╯
──────────╯
            </div>

            <div class="relative h-48 w-full">
              <canvas id="patient-demand-chart-${phc.phc_id}" data-labels='["Day -6", "Day -5", "Day -4", "Day -3", "Day -2", "Day -1", "Today"]' data-points='[210, 215, 212, 224, 248, 268, 286]' data-baseline="${phc.patients_7day_average}" class="w-full h-full"></canvas>
            </div>

            <div class="mt-3 text-center">
              <span class="text-xs font-bold text-red-600 font-mono">
                +35% above 7-day baseline
              </span>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 my-4"></div>

        <!-- ==================== MEDICINE INVENTORY SECTION ==================== -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
              MEDICINE INVENTORY
            </h2>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-200">
            <table class="w-full text-left font-mono text-xs">
              <thead>
                <tr class="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/80">
                  <th class="py-3 px-4">Medicine</th>
                  <th class="py-3 px-4 text-right">Stock</th>
                  <th class="py-3 px-4 text-right">Daily Use</th>
                  <th class="py-3 px-4 text-right">Days Left</th>
                  <th class="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <!-- Highlighted key medicines from user mockup -->
                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3 px-4 font-bold text-slate-900">Paracetamol</td>
                  <td class="py-3 px-4 text-right font-bold text-slate-800">310</td>
                  <td class="py-3 px-4 text-right text-slate-600">62</td>
                  <td class="py-3 px-4 text-right font-bold text-amber-700">5.0</td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      WARNING
                    </span>
                  </td>
                </tr>

                <tr class="hover:bg-slate-50/70 transition-colors bg-red-50/20">
                  <td class="py-3 px-4 font-bold text-slate-900">IV Fluids</td>
                  <td class="py-3 px-4 text-right font-bold text-red-700">105</td>
                  <td class="py-3 px-4 text-right text-slate-600">48</td>
                  <td class="py-3 px-4 text-right font-bold text-red-700 animate-pulse">2.2</td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                      CRITICAL
                    </span>
                  </td>
                </tr>

                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3 px-4 font-bold text-slate-900">ORS</td>
                  <td class="py-3 px-4 text-right font-bold text-slate-800">620</td>
                  <td class="py-3 px-4 text-right text-slate-600">44</td>
                  <td class="py-3 px-4 text-right text-slate-800">14.1</td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      NORMAL
                    </span>
                  </td>
                </tr>

                <tr class="hover:bg-slate-50/70 transition-colors">
                  <td class="py-3 px-4 font-bold text-slate-900">Amoxicillin</td>
                  <td class="py-3 px-4 text-right font-bold text-slate-800">430</td>
                  <td class="py-3 px-4 text-right text-slate-600">31</td>
                  <td class="py-3 px-4 text-right text-slate-800">13.9</td>
                  <td class="py-3 px-4 text-center">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      NORMAL
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="border-t border-slate-200 my-4"></div>

        <!-- ==================== CRITICAL FACILITY ALERT ==================== -->
        ${isPHC07 ? `
          <div class="rounded-xl border-2 border-red-500 bg-red-50/90 p-6 text-red-950">
            <div class="text-xs font-black uppercase tracking-wider text-red-800 font-mono mb-2">
              CRITICAL FACILITY ALERT
            </div>

            <h3 class="text-xl font-black text-red-900 tracking-tight">
              Potential resource shortage detected at PHC-07.
            </h3>

            <div class="mt-4 pt-3 border-t border-red-200">
              <div class="text-xs font-bold uppercase tracking-wider text-red-900 mb-2 font-mono">Signals:</div>
              <ul class="space-y-1.5 text-xs text-red-950 font-medium font-sans">
                <li class="flex items-center gap-2">
                  <span class="text-red-700 font-bold">•</span>
                  <span>Patient demand +35%</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-red-700 font-bold">•</span>
                  <span>IV Fluid consumption +45%</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-red-700 font-bold">•</span>
                  <span>Paracetamol consumption +32%</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-red-700 font-bold">•</span>
                  <span>Bed availability declining</span>
                </li>
              </ul>
            </div>
          </div>
        ` : ""}

      </div>

      <!-- ==================== FACILITY PRESSURE SCORE & RISK PROFILE (BUILD 06) ==================== -->
      <div class="rounded-2xl border ${riskProfile.pressure_score >= 70 ? 'border-red-300 bg-red-50/20' : 'border-slate-200 bg-white'} p-6 md:p-7 shadow-sm space-y-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${riskProfile.pressure_score >= 70 ? 'bg-red-600 animate-pulse' : 'bg-indigo-600'}"></span>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
                FACILITY PRESSURE SCORE & MULTI-DOMAIN RISK PROFILE
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded ${riskProfile.severity === 'CRITICAL' ? 'bg-red-600 text-white' : riskProfile.severity === 'WARNING' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'} font-mono">
                ${riskProfile.severity} (${riskProfile.pressure_score}/100)
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              Deterministic operational resource health weighted across Supply (30%), Demand (20%), Capacity (20%), Workforce (15%), Delivery (10%), and Other (5%).
            </p>
          </div>

          <div class="flex items-center gap-2">
            <a
              href="#/warnings"
              class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors border border-indigo-200 flex items-center gap-1"
            >
              Early Warning Radar →
            </a>
          </div>
        </div>

        <!-- 3 Quick Risk Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div class="text-[10px] text-slate-400 uppercase">Pressure Score</div>
            <div class="text-2xl font-black ${riskProfile.pressure_score >= 70 ? 'text-red-600' : 'text-slate-900'} mt-0.5">
              ${riskProfile.pressure_score}<span class="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
            <div class="text-[10px] ${riskProfile.pressure_score >= 70 ? 'text-red-600 font-bold' : 'text-slate-500'} mt-0.5">
              ${riskProfile.pressure_score >= 70 ? 'Critical Operational Strain' : 'Within Operational Thresholds'}
            </div>
          </div>

          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div class="text-[10px] text-slate-400 uppercase">Risk Velocity</div>
            <div class="text-base font-bold ${riskProfile.velocity.code === 'RAPIDLY_DETERIORATING' ? 'text-red-600' : 'text-slate-800'} mt-1">
              ${riskProfile.velocity.label}
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5">${riskProfile.velocity.description}</div>
          </div>

          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div class="text-[10px] text-slate-400 uppercase">Hazard Pattern</div>
            <div class="text-base font-bold ${riskProfile.is_compound_risk ? 'text-purple-700' : 'text-slate-700'} mt-1">
              ${riskProfile.is_compound_risk ? 'COMPOUND OPERATIONAL RISK' : 'Isolated Domain Risk'}
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5">
              ${riskProfile.is_compound_risk ? 'Simultaneous multi-domain failure risk' : 'Single domain fluctuation'}
            </div>
          </div>
        </div>

        <!-- 6-Domain Score Breakdown -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          ${Object.entries(riskProfile.domain_scores).map(([domain, data]) => {
            const pct = Math.round((data.points / data.max_points) * 100);
            return `
              <div class="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div class="flex items-center justify-between font-mono">
                  <span class="font-bold text-slate-800 text-[11px]">${domain}</span>
                  <span class="font-black text-[10px] ${data.points > (data.max_points * 0.6) ? 'text-red-600' : 'text-slate-600'}">
                    ${data.points}/${data.max_points}
                  </span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full ${data.points > (data.max_points * 0.6) ? 'bg-red-500' : data.points > (data.max_points * 0.3) ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${pct}%"></div>
                </div>
                <div class="text-[10px] text-slate-400 font-mono">${data.weight_pct}% weight</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- ==================== OPERATIONAL DRILL-DOWN SECTION ==================== -->
      <div class="pt-4 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Detailed Operational Telemetry, Forecasting & History
          </h3>
        </div>

        <!-- ==================== PREDICTIVE ANALYTICS & DEMAND FORECASTING (BUILD 04) ==================== -->
        <div class="rounded-2xl border border-indigo-200 bg-white p-6 md:p-7 shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
                  PREDICTIVE ANALYTICS & CAPACITY FORECAST
                </h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">
                  ${phcForecastHorizon}-DAY HORIZON (${demandForecast.confidence_percentage}% CONFIDENCE)
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                Forward-looking deterministic trajectory for patient footfall, dynamic medicine depletion, and bed pressure.
              </p>
            </div>

            <!-- Horizon Selector -->
            <div class="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-1">
              ${FORECAST_HORIZONS.map(h => `
                <button
                  type="button"
                  onclick="window.setPhcForecastHorizon(${h.days})"
                  class="px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    h.days === phcForecastHorizon 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900"
                  }"
                >
                  ${h.shortLabel}
                </button>
              `).join("")}
            </div>
          </div>

          <!-- 3 Predictive KPI Cards: Patient Demand, Bed Saturation, Dynamic Stock Coverage -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Patient Demand Projection -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Patient Footfall</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded ${demandForecast.surge_percentage >= 30 ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}">
                  +${demandForecast.surge_percentage}% Surge
                </span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-black text-slate-900 font-mono">${demandForecast.current_today}</span>
                <span class="text-xs text-slate-500 font-medium">→ Proj Avg: <strong class="text-indigo-700 font-mono">${demandForecast.avg_projected_daily}/d</strong></span>
              </div>
              <div class="text-[11px] text-slate-600">
                Peak expected: <strong class="text-slate-900 font-mono">${demandForecast.peak_projected_daily} patients</strong> (7d baseline: ${demandForecast.baseline_7day})
              </div>
            </div>

            <!-- Bed Occupancy Projection -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Bed Occupancy</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded ${bedForecast.peak_occupancy_rate >= 90 ? "bg-red-100 text-red-800 border border-red-300 animate-pulse" : "bg-blue-100 text-blue-800"}">
                  ${bedForecast.peak_pressure.label}
                </span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-black text-slate-900 font-mono">${bedForecast.current_occupancy_rate}%</span>
                <span class="text-xs text-slate-500 font-medium">→ Proj Peak: <strong class="${bedForecast.peak_occupancy_rate >= 90 ? "text-red-600" : "text-slate-900"} font-mono">${bedForecast.peak_occupancy_rate}%</strong></span>
              </div>
              <div class="text-[11px] text-slate-600">
                ${bedForecast.peak_occupied_projected} / ${bedForecast.total_beds} beds (${bedForecast.peak_occupancy_rate >= 100 ? "OVER CAPACITY" : "Beds remaining: " + (bedForecast.total_beds - bedForecast.peak_occupied_projected)})
              </div>
            </div>

            <!-- IV Fluids Dynamic Coverage -->
            <div class="p-4 rounded-xl ${medIvFluids.risk_level === "CRITICAL" ? "bg-red-50/50 border border-red-200" : "bg-slate-50 border border-slate-200"} space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">IV Fluids Dynamic Coverage</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-mono">
                  ${medIvFluids.risk_level}
                </span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-xs text-slate-500 line-through font-mono">${medIvFluids.static_days_of_stock}d static</span>
                <span class="text-2xl font-black text-red-700 font-mono animate-pulse">${medIvFluids.forecast_days_of_stock}d</span>
                <span class="text-[11px] text-slate-500">forecast-adjusted</span>
              </div>
              <div class="text-[11px] text-red-900 font-medium">
                ${medIvFluids.shortage_window_days > 0 ? `Stockout in ${medIvFluids.forecast_days_of_stock}d creates ${medIvFluids.shortage_window_days}d zero-stock window before delivery.` : "Adequate buffer."}
              </div>
            </div>
          </div>

          <!-- Dynamic Medicine Coverage Comparison Table -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2">
              Dynamic Stock Coverage (Static Burn vs Forecast-Adjusted Burn)
            </h4>
            <div class="overflow-x-auto rounded-lg border border-slate-200">
              <table class="w-full text-left font-mono text-xs">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th class="py-2 px-3">Medicine</th>
                    <th class="py-2 px-3 text-right">Current Stock</th>
                    <th class="py-2 px-3 text-right">Static Burn</th>
                    <th class="py-2 px-3 text-right">Forecast Burn</th>
                    <th class="py-2 px-3 text-right">Static Coverage</th>
                    <th class="py-2 px-3 text-right">Forecast Coverage</th>
                    <th class="py-2 px-3 text-center">Predicted Stockout</th>
                    <th class="py-2 px-3 text-right">Shortage Window</th>
                    <th class="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  ${keyForecastMeds.map(m => `
                    <tr class="hover:bg-slate-50/80 transition-colors ${m.risk_level === "CRITICAL" ? "bg-red-50/20" : ""}">
                      <td class="py-2.5 px-3 font-bold text-slate-900 font-sans">${m.medicine_name}</td>
                      <td class="py-2.5 px-3 text-right font-bold text-slate-800">${m.current_stock}</td>
                      <td class="py-2.5 px-3 text-right text-slate-500">${m.daily_consumption}/d</td>
                      <td class="py-2.5 px-3 text-right font-bold text-indigo-700">${m.forecast_daily_consumption}/d</td>
                      <td class="py-2.5 px-3 text-right text-slate-600">${m.static_days_of_stock}d</td>
                      <td class="py-2.5 px-3 text-right font-bold ${m.risk_level === "CRITICAL" ? "text-red-700" : "text-slate-800"}">${m.forecast_days_of_stock}d</td>
                      <td class="py-2.5 px-3 text-center ${m.risk_level === "CRITICAL" ? "text-red-700 font-bold" : "text-slate-700"}">${m.predicted_stockout_date}</td>
                      <td class="py-2.5 px-3 text-right font-bold ${m.shortage_window_days > 0 ? "text-red-700 font-black" : "text-emerald-700"}">
                        ${m.shortage_window_days > 0 ? `${m.shortage_window_days} days` : "Safe"}
                      </td>
                      <td class="py-2.5 px-3 text-center">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.risk_level === "CRITICAL" ? "bg-red-100 text-red-800 border border-red-300 animate-pulse" :
                          m.risk_level === "WARNING" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                          "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }">
                          ${m.risk_level}
                        </span>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Driver Attribution ("WHY THIS FORECAST?") -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2">
              Why This Forecast? (Deterministic Driver Attribution)
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
              <ul class="space-y-1.5">
                ${demandForecast.whyThisForecast.map(d => `
                  <li class="flex items-start gap-2">
                    <span class="text-indigo-600 font-bold">•</span>
                    <span>${d}</span>
                  </li>
                `).join("")}
              </ul>
              <ul class="space-y-1.5">
                ${medIvFluids.whyThisForecast.map(d => `
                  <li class="flex items-start gap-2">
                    <span class="text-red-600 font-bold">•</span>
                    <span>${d}</span>
                  </li>
                `).join("")}
                ${bedForecast.whyThisForecast.map(d => `
                  <li class="flex items-start gap-2">
                    <span class="text-amber-600 font-bold">•</span>
                    <span>${d}</span>
                  </li>
                `).join("")}
              </ul>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            ${renderBedCapacityCard(phc)}
          </div>
          <div>
            ${renderWorkforcePanel(phc)}
          </div>
        </div>

        <div>
          ${renderMedicineInventoryTable(
            inventory,
            `${phc.phc_name} — Complete 10-Medicine Stock Registry`,
            "Detailed batch numbers, safety stocks, and scheduled replenishment delivery dates"
          )}
        </div>

        <div>
          ${renderAlertPanel(alerts, phc)}
        </div>
      </div>
    </div>
  `;
}

// Global handler for PHC digital twin horizon toggle
window.setPhcForecastHorizon = function(horizon) {
  phcForecastHorizon = horizon;
  window.refreshCurrentRoute();
};

export function mountPhcDigitalTwinView(phcId) {
  mountPatientDemandChart(phcId);
}
