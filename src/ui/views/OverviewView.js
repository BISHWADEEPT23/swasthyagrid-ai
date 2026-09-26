/**
 * SwasthyaGrid AI — Overview View (National Health Command Centre)
 *
 * Contains:
 * - 6 Top KPI cards:
 *   - PHCs Online
 *   - Patients Today
 *   - Available Beds
 *   - Medicine Availability
 *   - Staff Attendance
 *   - Critical Alerts
 * - Below KPIs:
 *   - National/State PHC Map
 *   - Health Network Status Panel
 *   - Medicine Supply Risk Panel
 *   - Patient Demand Trend Chart
 *   - Bed Occupancy Trend Chart
 *   - Active AI Alerts Panel
 *   - Recommended Resource Transfers Panel
 */

import { getNationalKpis } from "../../logic/kpi_service.js";
import { renderKpiCard } from "../components/KpiCard.js";
import { renderPhcMap, mountPhcMap } from "../components/PhcMap.js";
import { renderNetworkStatusPanel } from "../components/NetworkStatusPanel.js";
import { renderMedicineRiskPanel } from "../components/MedicineRiskPanel.js";
import { renderDemandTrendChart, mountDemandTrendChart } from "../components/DemandTrendChart.js";
import { renderBedOccupancyChart, mountBedOccupancyChart } from "../components/BedOccupancyChart.js";
import { renderAlertPanel } from "../components/AlertPanel.js";
import { renderTransferPanel } from "../components/TransferPanel.js";
import { getActiveAlerts } from "../../logic/alert_service.js";
import { getNationalForecastSummary } from "../../logic/forecasting_service.js";
import { calculateNationalRiskProfile } from "../../logic/unified_risk_engine.js";
import { getPlatformHealth, evaluateDataFreshness } from "../../logic/system_health_service.js";
import { validatePlatformData } from "../../logic/data_quality_service.js";

export function renderOverviewView() {
  const kpis = getNationalKpis();
  const activeAlerts = getActiveAlerts();
  const forecastSummary = getNationalForecastSummary(7);
  const nationalRisk = calculateNationalRiskProfile(7);
  const health = getPlatformHealth();
  const freshness = evaluateDataFreshness(new Date().toISOString(), 4);
  const quality = validatePlatformData();

  return `
    <div class="space-y-6 pb-12">
      <!-- National Command Centre Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-xl font-black tracking-tight text-slate-900">
              National Health Command Centre
            </h2>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">LIVE MESH</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              HEALTH: ${health.overall_status}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${freshness.badgeClass} font-mono" title="Data freshness">
              FRESHNESS: ${freshness.freshness_status}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono" title="Schema integrity">
              DATA QUALITY: ${quality.score_pct}%
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Real-time federated operational visibility across 12 Primary Health Centres and 3 districts
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a 
            href="#/network" 
            class="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            Explore 12-PHC Network →
          </a>
        </div>
      </div>

      <!-- Top 6 KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        ${renderKpiCard({
          title: "PHCs Online",
          value: kpis.phcsOnline.value,
          subtext: kpis.phcsOnline.subtext,
          status: kpis.phcsOnline.status,
          badge: kpis.phcsOnline.badge
        })}
        ${renderKpiCard({
          title: "Patients Today",
          value: kpis.patientsToday.value,
          subtext: kpis.patientsToday.subtext,
          status: kpis.patientsToday.status,
          badge: kpis.patientsToday.badge
        })}
        ${renderKpiCard({
          title: "Available Beds",
          value: kpis.availableBeds.value,
          subtext: kpis.availableBeds.subtext,
          status: kpis.availableBeds.status,
          badge: kpis.availableBeds.badge
        })}
        ${renderKpiCard({
          title: "Medicine Availability",
          value: kpis.medicineAvailability.value,
          subtext: kpis.medicineAvailability.subtext,
          status: kpis.medicineAvailability.status,
          badge: kpis.medicineAvailability.badge
        })}
        ${renderKpiCard({
          title: "Staff Attendance",
          value: kpis.staffAttendance.value,
          subtext: kpis.staffAttendance.subtext,
          status: kpis.staffAttendance.status,
          badge: kpis.staffAttendance.badge
        })}
        ${renderKpiCard({
          title: "Critical Alerts",
          value: kpis.criticalAlerts.value,
          subtext: kpis.criticalAlerts.subtext,
          status: kpis.criticalAlerts.status,
          badge: kpis.criticalAlerts.badge
        })}
      </div>

      <!-- ==================== NATIONAL PREDICTIVE FORECAST HIGHLIGHT (BUILD 04) ==================== -->
      <div class="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white p-5 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
                7-Day Predictive Intelligence Horizon
              </span>
              <span class="text-[10px] font-bold px-2 py-0.2 rounded bg-indigo-800/80 text-indigo-200 border border-indigo-700">
                92% Confidence
              </span>
            </div>
            <h3 class="text-base font-bold text-white tracking-tight">
              Projected Inflow: <span class="text-indigo-300 font-mono">${forecastSummary.avg_projected_daily_national.toLocaleString()} patients/day</span> (${forecastSummary.net_patient_growth_pct > 0 ? "+" : ""}${forecastSummary.net_patient_growth_pct}% network growth)
            </h3>
            <p class="text-xs text-slate-300">
              Surge Hazard: <strong class="text-red-400 font-mono">PHC-07</strong> (+35% surge, IV Fluids depletion in 1.8d). High-pressure beds: <strong class="text-amber-300 font-mono">${forecastSummary.facilities_at_capacity_risk_count} facilities</strong>.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a 
              href="#/demand" 
              class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              Explore Demand Forecasting →
            </a>
          </div>
        </div>
      </div>

      <!-- ==================== NATIONAL EARLY WARNING & PRE-CRISIS RADAR (BUILD 06) ==================== -->
      <div class="rounded-xl border border-red-200 bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
            <span class="text-red-600 font-black font-mono text-sm">RADAR</span>
          </div>
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                EARLY WARNING RISK PROFILE (12 PHCs)
              </h4>
              <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 font-mono">
                1 CRITICAL (PHC-07)
              </span>
              <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                ${nationalRisk.compound_risks.length} COMPOUND RISK
              </span>
            </div>
            <p class="text-xs text-slate-600">
              Network Pressure Score: <strong class="text-slate-900 font-mono">${nationalRisk.network_pressure_score}/100</strong> • Fastest Deteriorating: <strong class="text-red-600 font-mono">${nationalRisk.fastest_deteriorating_phc.phc_id} (${nationalRisk.fastest_deteriorating_phc.velocity.label})</strong> • Emerging: <strong class="text-sky-700 font-mono">${nationalRisk.emerging_risks.map(p => p.phc_id).join(", ")}</strong>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <a
            href="#/warnings"
            class="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-colors shadow-sm whitespace-nowrap flex items-center gap-1.5 font-sans"
          >
            <span>Launch Early Warning Centre →</span>
          </a>
        </div>
      </div>

      <!-- Map + Status Breakdown (Row 1) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          ${renderPhcMap()}
        </div>
        <div>
          ${renderNetworkStatusPanel()}
        </div>
      </div>

      <!-- Trends: Patient Demand & Bed Occupancy (Row 2) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          ${renderDemandTrendChart()}
        </div>
        <div>
          ${renderBedOccupancyChart()}
        </div>
      </div>

      <!-- Supply Risk + Active Alerts (Row 3) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          ${renderMedicineRiskPanel()}
        </div>
        <div>
          ${renderAlertPanel(activeAlerts)}
        </div>
      </div>

      <!-- Recommended Transfers (Row 4) -->
      <div>
        ${renderTransferPanel()}
      </div>
    </div>
  `;
}

export function mountOverviewView() {
  mountPhcMap();
  mountDemandTrendChart();
  mountBedOccupancyChart();
}
