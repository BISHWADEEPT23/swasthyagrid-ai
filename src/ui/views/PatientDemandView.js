/**
 * SwasthyaGrid AI — Patient Demand Intelligence & Forecasting View (Build 04)
 * Route: #/demand
 *
 * Implements:
 * 1. 6 Top Demand & Forecast KPI cards
 * 2. Interactive Historical vs Forecast Demand Chart (Chart.js)
 * 3. Horizon Selector (7 Days / 14 Days / 30 Days)
 * 4. Facility Filter (All / Specific PHC / District)
 * 5. Facility Demand Surge & Capacity Pressure Matrix (12 PHCs)
 * 6. "Why This Forecast?" Deterministic Driver Explainability Panel
 */

import { PHC_DATASET, DISTRICTS } from "../../data/phc_dataset.js";
import { 
  FORECAST_HORIZONS, 
  classifySurge, 
  classifyBedPressure 
} from "../../config/forecasting_config.js";
import { 
  forecastPatientDemand, 
  forecastBedOccupancy, 
  getNationalForecastSummary, 
  aggregateDistrictForecast 
} from "../../logic/forecasting_service.js";
import { getHistoryForPhc } from "../../data/historical_dataset.js";

// Page state
let currentHorizon = 7;
let selectedDistrict = "ALL";
let selectedPhcId = "ALL";
let demandChartInstance = null;

export function renderPatientDemandView() {
  const summary = getNationalForecastSummary(currentHorizon);
  const horizonConfig = FORECAST_HORIZONS.find(h => h.days === currentHorizon) || FORECAST_HORIZONS[0];

  // Calculate forecasts for all PHCs
  const allPhcForecasts = PHC_DATASET.map(phc => {
    const demand = forecastPatientDemand(phc.phc_id, currentHorizon);
    const beds = forecastBedOccupancy(phc.phc_id, currentHorizon);
    return {
      phc,
      demand,
      beds
    };
  });

  // Filter PHCs
  const filteredList = allPhcForecasts.filter(item => {
    const matchesDistrict = selectedDistrict === "ALL" || item.phc.district === selectedDistrict;
    const matchesPhc = selectedPhcId === "ALL" || item.phc.phc_id === selectedPhcId;
    return matchesDistrict && matchesPhc;
  });

  // Highlighted PHC for explainability breakdown
  const focusItem = selectedPhcId !== "ALL" 
    ? allPhcForecasts.find(i => i.phc.phc_id === selectedPhcId) || allPhcForecasts[6]
    : allPhcForecasts[6]; // Default to PHC-07

  return `
    <div class="space-y-6 pb-12">
      <!-- Header & Controls -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              Patient Demand Intelligence & Forecasting
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">PREDICTIVE LAYER</span>
            </h1>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Deterministic trend projections, surge detection, and bed saturation warning horizons.
          </p>
        </div>

        <!-- Global Forecast Horizon Toggle -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="inline-flex rounded-lg border border-slate-300 bg-white p-1 shadow-sm">
            ${FORECAST_HORIZONS.map(h => {
              const isActive = h.days === currentHorizon;
              return `
                <button
                  type="button"
                  onclick="window.setDemandHorizon(${h.days})"
                  class="px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }"
                >
                  ${h.shortLabel}
                  <span class="text-[10px] opacity-80 ml-1">(${h.confidence}% conf)</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      </div>

      <!-- Top 6 Forecasting KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Patients Today</div>
          <div class="text-2xl font-black text-slate-900 mt-1 font-mono">${summary.total_patients_today.toLocaleString()}</div>
          <div class="text-[11px] font-medium text-slate-500 mt-0.5">12 PHCs active</div>
        </div>

        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Projected Daily Inflow</div>
          <div class="text-2xl font-black text-indigo-700 mt-1 font-mono">${summary.avg_projected_daily_national.toLocaleString()}</div>
          <div class="text-[11px] font-bold ${summary.net_patient_growth_pct > 0 ? "text-red-600" : "text-emerald-600"} mt-0.5">
            ${summary.net_patient_growth_pct > 0 ? "↑" : "↓"} ${Math.abs(summary.net_patient_growth_pct)}% projected
          </div>
        </div>

        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Surge Facilities</div>
          <div class="text-2xl font-black ${summary.facilities_in_critical_surge_count > 0 ? "text-red-600" : "text-slate-900"} mt-1 font-mono">
            ${summary.facilities_in_critical_surge_count} <span class="text-xs font-normal text-slate-500">Critical</span>
          </div>
          <div class="text-[11px] text-amber-700 font-bold mt-0.5">PHC-07 (+35% surge)</div>
        </div>

        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Capacity Risk PHCs</div>
          <div class="text-2xl font-black ${summary.facilities_at_capacity_risk_count > 0 ? "text-red-600" : "text-slate-900"} mt-1 font-mono">
            ${summary.facilities_at_capacity_risk_count}
          </div>
          <div class="text-[11px] text-slate-500 mt-0.5">≥ 90% peak occupancy</div>
        </div>

        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Predicted Stockouts</div>
          <div class="text-2xl font-black ${summary.predicted_critical_stockouts_count > 0 ? "text-red-600" : "text-slate-900"} mt-1 font-mono">
            ${summary.predicted_critical_stockouts_count}
          </div>
          <div class="text-[11px] text-red-600 font-bold mt-0.5">IV Fluids at PHC-07</div>
        </div>

        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Confidence Level</div>
          <div class="text-2xl font-black text-slate-900 mt-1 font-mono">${horizonConfig.confidence}%</div>
          <div class="text-[11px] text-emerald-700 font-bold mt-0.5">${horizonConfig.confidenceLabel} (${currentHorizon}-day horizon)</div>
        </div>
      </div>

      <!-- Main Chart & Filter Card -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              Historical Trajectory vs Projected Demand Horizon
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                ${currentHorizon} Days Projected
              </span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Visualizes 14-day observed history, moving average baseline, and projected confidence bounds.
            </p>
          </div>

          <!-- District & Facility Filters -->
          <div class="flex flex-wrap items-center gap-2.5">
            <select
              onchange="window.setDemandDistrict(this.value)"
              class="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              <option value="ALL" ${selectedDistrict === "ALL" ? "selected" : ""}>All Districts</option>
              ${DISTRICTS.map(d => `<option value="${d}" ${selectedDistrict === d ? "selected" : ""}>${d}</option>`).join("")}
            </select>

            <select
              onchange="window.setDemandPhc(this.value)"
              class="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              <option value="ALL" ${selectedPhcId === "ALL" ? "selected" : ""}>Network Aggregate (All 12 PHCs)</option>
              ${PHC_DATASET.map(p => `
                <option value="${p.phc_id}" ${selectedPhcId === p.phc_id ? "selected" : ""}>
                  ${p.phc_id} - ${p.phc_name} (${p.operational_status})
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <!-- Chart Container -->
        <div class="relative h-72 w-full">
          <canvas id="patient-demand-analytics-chart" class="w-full h-full"></canvas>
        </div>

        <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="w-3 h-0.5 bg-slate-700 inline-block"></span> Observed History (Past 14 Days)
            </span>
            <span class="flex items-center gap-1.5 font-medium">
              <span class="w-3 h-0.5 bg-indigo-600 inline-block"></span> Projected Demand (${currentHorizon} Days)
            </span>
            <span class="flex items-center gap-1.5 font-medium">
              <span class="w-3 h-2 bg-indigo-100 border border-indigo-300 inline-block"></span> Confidence Bound (${horizonConfig.confidence}%)
            </span>
          </div>
          <div class="font-mono text-[11px] text-slate-400">
            Engine: Holt Linear Trend + DOW Seasonality (Deterministic)
          </div>
        </div>
      </div>

      <!-- Explainability Card ("Why This Forecast?") -->
      <div class="rounded-xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <h3 class="text-sm font-black text-indigo-950 font-mono uppercase tracking-wide">
                Forecast Explainability: ${focusItem.phc.phc_id} (${focusItem.phc.phc_name})
              </h3>
              <p class="text-xs text-indigo-700">Deterministic driver attribution explaining projected patient demand trajectory</p>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
            focusItem.demand.surge_percentage >= 30 ? "bg-red-100 text-red-800 border border-red-300" : "bg-indigo-100 text-indigo-800"
          }">
            Surge: +${focusItem.demand.surge_percentage}% (${focusItem.demand.surge_classification.label})
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white p-4 rounded-xl border border-indigo-100 space-y-2">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Statistical Drivers</div>
            <ul class="space-y-1.5 text-xs text-slate-700">
              ${focusItem.demand.whyThisForecast.map(d => `
                <li class="flex items-start gap-2">
                  <span class="text-indigo-600 font-bold">•</span>
                  <span>${d}</span>
                </li>
              `).join("")}
            </ul>
          </div>

          <div class="bg-white p-4 rounded-xl border border-indigo-100 space-y-2">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Operational Implications</div>
            <ul class="space-y-1.5 text-xs text-slate-700">
              ${focusItem.beds.whyThisForecast.map(d => `
                <li class="flex items-start gap-2">
                  <span class="text-indigo-600 font-bold">•</span>
                  <span>${d}</span>
                </li>
              `).join("")}
            </ul>
          </div>
        </div>
      </div>

      <!-- Facility Surge & Pressure Matrix Table -->
      <div class="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div class="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
              12-PHC Demand Surge & Bed Capacity Matrix
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Ranked overview of patient demand deviations and projected capacity saturation across facilities.
            </p>
          </div>
          <span class="text-xs text-slate-400 font-mono font-bold">Showing ${filteredList.length} of 12 Facilities</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/80">
                <th class="py-3 px-4">PHC ID & Name</th>
                <th class="py-3 px-4">District</th>
                <th class="py-3 px-4 text-right">Today</th>
                <th class="py-3 px-4 text-right">7d Base</th>
                <th class="py-3 px-4 text-right">Surge %</th>
                <th class="py-3 px-4 text-right">Avg Proj</th>
                <th class="py-3 px-4 text-right">Peak Proj</th>
                <th class="py-3 px-4 text-center">Bed Pressure</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${filteredList.map(item => {
                const isCrit = item.demand.surge_percentage >= 30;
                const isWarn = item.demand.surge_percentage >= 20 && !isCrit;
                const rowBg = isCrit ? "bg-red-50/20" : isWarn ? "bg-amber-50/20" : "";

                return `
                  <tr class="hover:bg-slate-50/80 transition-colors ${rowBg}">
                    <td class="py-3 px-4">
                      <div class="font-bold text-slate-900 font-sans">${item.phc.phc_name}</div>
                      <div class="text-[11px] text-slate-400 font-mono">${item.phc.phc_id}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-600 font-sans">${item.phc.district}</td>
                    <td class="py-3 px-4 text-right font-bold text-slate-900">${item.demand.current_today}</td>
                    <td class="py-3 px-4 text-right text-slate-500">${item.demand.baseline_7day}</td>
                    <td class="py-3 px-4 text-right font-bold ${
                      isCrit ? "text-red-600 animate-pulse" : isWarn ? "text-amber-600" : "text-slate-700"
                    }">
                      ${item.demand.surge_percentage > 0 ? "+" : ""}${item.demand.surge_percentage}%
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-indigo-700">${item.demand.avg_projected_daily}</td>
                    <td class="py-3 px-4 text-right text-slate-800">${item.demand.peak_projected_daily}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.beds.peak_occupancy_rate >= 90 ? "bg-red-100 text-red-800 border border-red-300" :
                        item.beds.peak_occupancy_rate >= 80 ? "bg-amber-100 text-amber-800 border border-amber-300" :
                        "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }">
                        ${item.beds.peak_occupancy_rate}% (${item.beds.peak_pressure.label})
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.phc.operational_status === "CRITICAL" ? "bg-red-100 text-red-800 border border-red-300" :
                        item.phc.operational_status === "WARNING" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                        item.phc.operational_status === "WATCH" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                        "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }">
                        ${item.phc.operational_status}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center font-sans">
                      <a 
                        href="#/phc/${item.phc.phc_id}" 
                        class="px-2.5 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[11px] border border-sky-200 transition-colors inline-block"
                      >
                        Digital Twin →
                      </a>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Global state modification handlers
window.setDemandHorizon = function(horizon) {
  currentHorizon = horizon;
  window.refreshCurrentRoute();
};

window.setDemandDistrict = function(district) {
  selectedDistrict = district;
  window.refreshCurrentRoute();
};

window.setDemandPhc = function(phcId) {
  selectedPhcId = phcId;
  window.refreshCurrentRoute();
};

export function mountPatientDemandView() {
  const canvas = document.getElementById("patient-demand-analytics-chart");
  if (!canvas || !window.Chart) return;

  if (demandChartInstance) {
    demandChartInstance.destroy();
    demandChartInstance = null;
  }

  // Generate data series based on current selection
  let historyLabels = [];
  let historyValues = [];
  let forecastLabels = [];
  let forecastValues = [];
  let lowerBounds = [];
  let upperBounds = [];

  if (selectedPhcId !== "ALL") {
    // Specific PHC
    const phc = PHC_DATASET.find(p => p.phc_id === selectedPhcId) || PHC_DATASET[6];
    const history = getHistoryForPhc(phc.phc_id, 14);
    historyLabels = history.map(h => `Day ${h.day_offset}`);
    historyValues = history.map(h => h.patient_footfall);

    const forecast = forecastPatientDemand(phc.phc_id, currentHorizon);
    forecastLabels = forecast.forecast_series.map(f => f.day_label);
    forecastValues = forecast.forecast_series.map(f => f.projected);
    lowerBounds = forecast.forecast_series.map(f => f.lower_bound);
    upperBounds = forecast.forecast_series.map(f => f.upper_bound);
  } else if (selectedDistrict !== "ALL") {
    // District Aggregate
    const distData = aggregateDistrictForecast(selectedDistrict, currentHorizon);
    // 14 days history for district
    const phcs = PHC_DATASET.filter(p => p.district === selectedDistrict);
    for (let offset = -13; offset <= 0; offset++) {
      let sum = 0;
      phcs.forEach(p => {
        const h = getHistoryForPhc(p.phc_id, 14).find(x => x.day_offset === offset);
        if (h) sum += h.patient_footfall;
      });
      historyLabels.push(`Day ${offset}`);
      historyValues.push(sum);
    }
    forecastLabels = distData.forecast_series.map(f => `Day +${f.day_offset}`);
    forecastValues = distData.forecast_series.map(f => f.projected_patients);
    lowerBounds = forecastValues.map(v => Math.round(v * 0.92));
    upperBounds = forecastValues.map(v => Math.round(v * 1.08));
  } else {
    // Network Aggregate
    for (let offset = -13; offset <= 0; offset++) {
      let sum = 0;
      PHC_DATASET.forEach(p => {
        const h = getHistoryForPhc(p.phc_id, 14).find(x => x.day_offset === offset);
        if (h) sum += h.patient_footfall;
      });
      historyLabels.push(`Day ${offset}`);
      historyValues.push(sum);
    }

    const allForecasts = PHC_DATASET.map(p => forecastPatientDemand(p.phc_id, currentHorizon));
    for (let step = 0; step < currentHorizon; step++) {
      let stepSum = 0;
      let stepLower = 0;
      let stepUpper = 0;
      allForecasts.forEach(f => {
        stepSum += f.forecast_series[step].projected;
        stepLower += f.forecast_series[step].lower_bound;
        stepUpper += f.forecast_series[step].upper_bound;
      });
      forecastLabels.push(`Day +${step + 1}`);
      forecastValues.push(stepSum);
      lowerBounds.push(stepLower);
      upperBounds.push(stepUpper);
    }
  }

  // Combined labels: 14 history days + current horizon forecast days
  const allLabels = [...historyLabels, ...forecastLabels];
  
  // History series padded with nulls for forecast period
  const historySeriesData = [...historyValues, ...Array(forecastLabels.length).fill(null)];
  
  // Connect history to forecast at Day 0: last history point is the bridge
  const forecastSeriesData = [
    ...Array(historyLabels.length - 1).fill(null),
    historyValues[historyValues.length - 1],
    ...forecastValues
  ];

  const lowerBoundData = [
    ...Array(historyLabels.length - 1).fill(null),
    historyValues[historyValues.length - 1],
    ...lowerBounds
  ];

  const upperBoundData = [
    ...Array(historyLabels.length - 1).fill(null),
    historyValues[historyValues.length - 1],
    ...upperBounds
  ];

  const ctx = canvas.getContext("2d");
  demandChartInstance = new window.Chart(ctx, {
    type: "line",
    data: {
      labels: allLabels,
      datasets: [
        {
          label: "Observed History",
          data: historySeriesData,
          borderColor: "#334155", // slate-700
          backgroundColor: "#334155",
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: "Projected Demand",
          data: forecastSeriesData,
          borderColor: "#4f46e5", // indigo-600
          backgroundColor: "#4f46e5",
          borderWidth: 2.5,
          borderDash: [5, 5],
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: "Upper Bound",
          data: upperBoundData,
          borderColor: "transparent",
          backgroundColor: "rgba(99, 102, 241, 0.12)",
          fill: "+1",
          pointRadius: 0,
          tension: 0.3
        },
        {
          label: "Lower Bound",
          data: lowerBoundData,
          borderColor: "transparent",
          backgroundColor: "transparent",
          fill: false,
          pointRadius: 0,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.raw === null || context.raw === undefined) return "";
              return `${context.dataset.label}: ${context.raw.toLocaleString()} patients`;
            }
          }
        }
      },
      scales: {
        y: {
          grid: {
            color: "#f1f5f9"
          },
          ticks: {
            font: { family: "monospace", size: 10 },
            color: "#64748b"
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { family: "monospace", size: 10 },
            color: "#64748b",
            maxRotation: 45
          }
        }
      }
    }
  });
}
