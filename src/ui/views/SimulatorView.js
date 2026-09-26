/**
 * SwasthyaGrid AI — Emergency Simulation & Resilience Stress Testing View (Build 08)
 * Route: #/simulator
 *
 * Implements:
 * 1. Prominent simulation warning banner: "SIMULATED SCENARIO — NOT LIVE OPERATIONAL DATA"
 * 2. Scenario selector (5 presets + Official Competition Demo Preset)
 * 3. Granular stress parameter sliders (Demand, Beds, Staff, Medicine burn, Delivery delay)
 * 4. Before / After comparative KPI cards (Network Resilience Score, Critical PHCs, Resilience Gap)
 * 5. District Impact Matrix
 * 6. Interactive Stress Timeline (Day 0 to Day 30)
 * 7. Resource Depletion & Net Resilience Gap visualizer
 * 8. Cascade Failure Risk detection alert (donor vulnerability)
 * 9. Redistribution feasibility under stress
 * 10. Gemini AI Resilience Reasoning card
 * 11. Saved scenarios drawer & comparative delta analysis
 * 12. Instant "Reset to Baseline" button (100% data immutability)
 */

import { PHC_DATASET, DISTRICTS } from "../../data/phc_dataset.js";
import { MEDICINE_CATALOG } from "../../data/medicine_dataset.js";
import { 
  SCENARIO_TYPES, 
  SEVERITY_LEVELS, 
  DURATION_HORIZONS, 
  DEMO_PRESET_CONFIG 
} from "../../config/simulation_config.js";
import { 
  runSimulation, 
  runDemoScenario, 
  resetSimulation, 
  saveScenario, 
  getSavedScenarios, 
  compareSavedScenarios 
} from "../../logic/simulation_engine.js";

// View State
let currentSimulation = null;
let isSimulationActive = false;
let activeScenarioKey = "DENGUE_LIKE_SURGE";
let activeSeverityKey = "SEVERE";
let activeScope = "DISTRICT";
let activeTargetId = "District Central";
let activeDuration = 7;
let customSliders = {
  demandSurgePct: 85,
  bedSurgePct: 50,
  staffLossPct: 15,
  medicineBurnMult: 2.1,
  deliveryDelayDays: 0
};
let showSavedDrawer = false;

export function renderSimulatorView() {
  // Initialize with demo scenario on first render if null
  if (!currentSimulation && !isSimulationActive) {
    currentSimulation = runDemoScenario();
    isSimulationActive = true;
  }

  const sim = currentSimulation;
  const savedScenarios = getSavedScenarios();

  return `
    <div class="space-y-6 pb-16">
      <!-- ==================== PROMINENT SIMULATION BANNER ==================== -->
      <div class="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/15 border-2 border-amber-500/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-black text-xl flex-shrink-0">
            ⚠️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black px-2.5 py-0.5 rounded bg-amber-500 text-white tracking-wide font-mono">
                SIMULATED SCENARIO — NOT LIVE OPERATIONAL DATA
              </span>
              <span class="text-xs text-amber-900 font-semibold hidden md:inline">
                Build 08 Stress Testing Engine
              </span>
            </div>
            <p class="text-xs text-amber-950 mt-1 max-w-3xl">
              This sandbox tests health-resource resilience under synthetic emergency conditions without altering baseline datasets. All calculations run on deep-cloned state and can be reverted instantly.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onclick="window.handleResetSimulation()"
            class="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>🔄</span> Reset to Baseline
          </button>
          <button
            type="button"
            onclick="window.handleLoadDemoPreset()"
            class="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>⚡</span> Load Demo Preset
          </button>
        </div>
      </div>

      <!-- ==================== CONTROLS CARD ==================== -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 class="text-base font-black text-slate-900 flex items-center gap-2">
              <span>🎛️</span> Emergency Stress Configuration
            </h2>
            <p class="text-xs text-slate-500">Configure synthetic surge parameters across geography, severity, and operational horizons.</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick="window.handleOpenSavedDrawer()"
              class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>📁</span> Saved Runs (${savedScenarios.length})
            </button>
            <button
              type="button"
              onclick="window.handleSaveCurrentScenario()"
              class="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>💾</span> Save Run
            </button>
          </div>
        </div>

        <!-- Presets Row -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
          ${Object.values(SCENARIO_TYPES).map(sc => {
            const isSelected = activeScenarioKey === sc.id;
            return `
              <button
                type="button"
                onclick="window.handleSelectScenario('${sc.id}')"
                class="p-3 text-left rounded-xl border transition-all ${
                  isSelected 
                    ? "bg-amber-50/80 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 font-bold" 
                    : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100"
                }"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-black">${sc.name}</span>
                  ${isSelected ? '<span class="text-xs text-amber-600">●</span>' : ""}
                </div>
                <div class="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">${sc.description}</div>
              </button>
            `;
          }).join("")}
        </div>

        <!-- Selectors & Sliders -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100">
          <!-- Severity -->
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
              Severity Level
            </label>
            <select
              id="sim-severity-select"
              onchange="window.handleParamChange('severity', this.value)"
              class="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              ${Object.values(SEVERITY_LEVELS).map(sev => `
                <option value="${sev.code}" ${activeSeverityKey === sev.code ? "selected" : ""}>
                  ${sev.label} (${sev.multiplier}x stress)
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Target Scope -->
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
              Target Geography
            </label>
            <select
              id="sim-target-select"
              onchange="window.handleParamChange('target', this.value)"
              class="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="District Central" ${activeTargetId === "District Central" ? "selected" : ""}>District Central (4 PHCs - Epicenter)</option>
              <option value="District North" ${activeTargetId === "District North" ? "selected" : ""}>District North (4 PHCs)</option>
              <option value="District South" ${activeTargetId === "District South" ? "selected" : ""}>District South (4 PHCs)</option>
              <option value="All Facilities" ${activeTargetId === "All Facilities" ? "selected" : ""}>All Facilities (12 PHCs Network-Wide)</option>
            </select>
          </div>

          <!-- Horizon -->
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1.5">
              Simulation Horizon
            </label>
            <select
              id="sim-horizon-select"
              onchange="window.handleParamChange('duration', this.value)"
              class="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              ${DURATION_HORIZONS.map(h => `
                <option value="${h.days}" ${activeDuration === h.days ? "selected" : ""}>
                  ${h.label}
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Execute Button -->
          <div class="flex items-end">
            <button
              type="button"
              onclick="window.handleExecuteSimulation()"
              class="w-full py-2.5 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-black hover:to-indigo-900 text-white font-black text-xs rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>⚡</span> Run Stress Simulation
            </button>
          </div>
        </div>

        <!-- Fine-Tuning Sliders (Collapsible / Visible) -->
        <div class="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 p-3 rounded-lg">
          <div>
            <div class="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
              <span>Patient Footfall Surge</span>
              <span class="font-mono text-amber-700">+${customSliders.demandSurgePct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value="${customSliders.demandSurgePct}"
              oninput="window.handleSliderChange('demandSurgePct', this.value)"
              class="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div class="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
              <span>Bed Occupancy Surge</span>
              <span class="font-mono text-amber-700">+${customSliders.bedSurgePct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value="${customSliders.bedSurgePct}"
              oninput="window.handleSliderChange('bedSurgePct', this.value)"
              class="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div class="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
              <span>Staff Absence</span>
              <span class="font-mono text-amber-700">-${customSliders.staffLossPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value="${customSliders.staffLossPct}"
              oninput="window.handleSliderChange('staffLossPct', this.value)"
              class="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div class="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
              <span>IV Fluids Burn Multiplier</span>
              <span class="font-mono text-amber-700">${customSliders.medicineBurnMult}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value="${customSliders.medicineBurnMult}"
              oninput="window.handleSliderChange('medicineBurnMult', this.value)"
              class="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      <!-- ==================== BEFORE / AFTER COMPARATIVE KPIS ==================== -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <!-- 1. Network Resilience Score -->
        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Resilience Score</div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-3xl font-black font-mono ${sim.resilience_score.overall_score >= 70 ? 'text-emerald-600' : sim.resilience_score.overall_score >= 50 ? 'text-amber-600' : 'text-red-600'}">
              ${sim.resilience_score.overall_score}
            </span>
            <span class="text-xs font-mono text-slate-400">/ 100</span>
          </div>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-[11px] font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              ${sim.resilience_score.score_delta} pts
            </span>
            <span class="text-[11px] text-slate-500">vs ${sim.baseline_metrics.resilience_score} baseline</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-wider">
            Status: <span class="font-bold ${sim.resilience_score.rating === 'VULNERABLE' ? 'text-red-700' : 'text-amber-700'}">${sim.resilience_score.rating}</span>
          </div>
        </div>

        <!-- 2. Critical Facilities -->
        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Critical Facilities</div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-3xl font-black font-mono text-red-700">${sim.simulated_metrics.critical_phcs}</span>
            <span class="text-xs font-mono text-slate-400">/ 12 PHCs</span>
          </div>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-[11px] font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              +${sim.simulated_metrics.critical_phcs - sim.baseline_metrics.critical_phcs}
            </span>
            <span class="text-[11px] text-slate-500">vs ${sim.baseline_metrics.critical_phcs} baseline</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-2 font-mono">
            District Central Epicenter
          </div>
        </div>

        <!-- 3. Warning Facilities -->
        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Warning Facilities</div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-3xl font-black font-mono text-amber-600">${sim.simulated_metrics.warning_phcs}</span>
            <span class="text-xs font-mono text-slate-400">/ 12 PHCs</span>
          </div>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              +${sim.simulated_metrics.warning_phcs - sim.baseline_metrics.warning_phcs}
            </span>
            <span class="text-[11px] text-slate-500">vs ${sim.baseline_metrics.warning_phcs} baseline</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-2 font-mono">
            Highland & Delta Posts
          </div>
        </div>

        <!-- 4. Net Resilience Gap -->
        <div class="p-4 rounded-xl bg-white border-2 border-red-200 bg-red-50/20 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-red-800 font-mono">Net Resilience Gap</div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-3xl font-black font-mono text-red-700">${sim.resilience_gap.resilience_gap_units}</span>
            <span class="text-xs font-mono text-red-600">Units</span>
          </div>
          <div class="text-[11px] text-red-700 font-bold mt-1">
            IV Fluids Deficit
          </div>
          <div class="text-[10px] text-red-600 mt-2 font-mono">
            Unbridgeable by surplus
          </div>
        </div>

        <!-- 5. Network Pressure Score -->
        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Network Pressure</div>
          <div class="flex items-baseline gap-2 mt-1">
            <span class="text-3xl font-black font-mono text-indigo-900">${sim.simulated_metrics.network_pressure_score}</span>
            <span class="text-xs font-mono text-slate-400">/ 100</span>
          </div>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-[11px] font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              +${sim.simulated_metrics.network_pressure_score - sim.baseline_metrics.network_pressure_score}
            </span>
            <span class="text-[11px] text-slate-500">vs ${sim.baseline_metrics.network_pressure_score} baseline</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-2 font-mono">
            Severe System Stress
          </div>
        </div>
      </div>

      <!-- ==================== CASCADE FAILURE WARNING ==================== -->
      ${sim.cascade_risk.has_cascade_risk ? `
        <div class="p-4 rounded-xl bg-red-500/10 border-2 border-red-500/30 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
              ⚡
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-black text-red-900">
                  CASCADE FAILURE RISK DETECTED: Donor Facility Buffer Depletion
                </h3>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                  HIGH OPERATIONAL RISK
                </span>
              </div>
              <p class="text-xs text-red-800 mt-1">
                ${sim.cascade_risk.vulnerable_donors[0]?.risk_description}
              </p>
              <div class="mt-2.5 p-2.5 bg-white/80 rounded-lg border border-red-200 text-xs text-slate-800 flex items-center justify-between">
                <div>
                  <span class="font-bold text-red-900">Recommended Operational Mitigation:</span>
                  <span class="text-slate-700 ml-1">${sim.cascade_risk.vulnerable_donors[0]?.recommended_mitigation}</span>
                </div>
                <button
                  type="button"
                  onclick="window.toggleHealthCommandCopilot('PHC-05')"
                  class="ml-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded transition-colors flex-shrink-0"
                >
                  Inspect PHC-05 →
                </button>
              </div>
            </div>
          </div>
        </div>
      ` : ""}

      <!-- ==================== DISTRICT IMPACT MATRIX & RESOURCE DEPLETION ==================== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- District Impact Matrix -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 class="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
            <span>🏛️</span> District Impact Matrix (Baseline vs. Simulated)
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                  <th class="py-2">District</th>
                  <th class="py-2 text-center">Baseline Score</th>
                  <th class="py-2 text-center">Simulated Score</th>
                  <th class="py-2 text-center">Critical PHCs</th>
                  <th class="py-2 text-right">Status Shift</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${sim.district_impact_matrix.map(dist => `
                  <tr class="${dist.is_target ? 'bg-amber-50/40 font-bold' : ''}">
                    <td class="py-3 flex items-center gap-2">
                      <span>${dist.district}</span>
                      ${dist.is_target ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-mono">TARGET</span>' : ''}
                    </td>
                    <td class="py-3 text-center font-mono text-slate-500">${dist.baseline_score}/100</td>
                    <td class="py-3 text-center font-mono font-bold ${dist.simulated_score >= 65 ? 'text-red-600' : 'text-slate-800'}">
                      ${dist.simulated_score}/100
                      <span class="text-[10px] ${dist.score_change > 0 ? 'text-red-500' : 'text-slate-400'}">(+${dist.score_change})</span>
                    </td>
                    <td class="py-3 text-center font-mono">
                      <span class="px-2 py-0.5 rounded ${dist.critical_phcs > 0 ? 'bg-red-100 text-red-800 font-bold' : 'bg-slate-100 text-slate-600'}">
                        ${dist.critical_phcs} / 4
                      </span>
                    </td>
                    <td class="py-3 text-right">
                      <span class="text-[11px] font-mono px-2 py-0.5 rounded ${dist.simulated_status === 'CRITICAL' ? 'bg-red-100 text-red-800 font-bold' : dist.simulated_status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
                        ${dist.baseline_status} → ${dist.simulated_status}
                      </span>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Resource Depletion & Net Gap Breakdown -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>🧪</span> Net Resilience Gap Analysis: IV Fluids
              </h3>
              <span class="text-[10px] font-mono bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                CRITICAL DEFICIT
              </span>
            </div>
            <p class="text-xs text-slate-500 mb-4">
              Under severe surge demand, safe network redistribution leaves a persistent shortfall requiring external supply buffer mobilization.
            </p>

            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Required Buffer Units (Target Facilities)</span>
                  <span class="font-mono font-bold">${sim.resilience_gap.total_required_units.toLocaleString()} Units</span>
                </div>
                <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div class="bg-red-500 h-full rounded-full" style="width: 100%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Safe Network Surplus Available (Donors >= 4.0d)</span>
                  <span class="font-mono font-bold text-indigo-700">${sim.resilience_gap.safe_network_surplus_units.toLocaleString()} Units</span>
                </div>
                <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div class="bg-indigo-600 h-full rounded-full" style="width: ${Math.round((sim.resilience_gap.safe_network_surplus_units / sim.resilience_gap.total_required_units) * 100)}%"></div>
                </div>
              </div>

              <div class="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-900 mt-2">
                <div class="flex items-center justify-between font-bold">
                  <span>Unfulfillable Net Resilience Gap:</span>
                  <span class="font-mono text-sm text-red-700">${sim.resilience_gap.resilience_gap_units} Units</span>
                </div>
                <p class="text-[11px] text-red-700 mt-1">
                  ${sim.resilience_gap.summary}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500">Shortage Runway Deficit:</span>
            <span class="font-mono font-bold text-red-700">${sim.resilience_gap.coverage_deficit_days} Days Unbuffered</span>
          </div>
        </div>
      </div>

      <!-- ==================== INTERACTIVE STRESS TIMELINE (DAY 0–30) ==================== -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>📅</span> Simulated Stress Timeline (Day 0 to Day 30 Milestones)
            </h3>
            <p class="text-xs text-slate-500">Projected progression of stockouts, bed saturation, and recovery phases under simulated conditions.</p>
          </div>
          <span class="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            ${activeDuration}-Day Horizon
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
          ${sim.timeline.map((step, idx) => `
            <div class="p-3 rounded-xl border transition-all ${
              step.severity === 'CRITICAL' 
                ? 'bg-red-50/50 border-red-200' 
                : step.severity === 'WARNING' 
                  ? 'bg-amber-50/50 border-amber-200' 
                  : 'bg-slate-50/60 border-slate-200'
            }">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-black font-mono text-slate-900">${step.day}</span>
                <span class="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  step.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : step.severity === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }">
                  ${step.resilience_score}/100
                </span>
              </div>
              <div class="text-[11px] font-bold text-slate-800 line-clamp-1 mb-1">${step.event}</div>
              <div class="text-[10px] text-slate-500 leading-relaxed">${step.description}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- ==================== GEMINI AI RESILIENCE REASONING ==================== -->
      <div class="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-slate-200 rounded-xl p-6 shadow-md border border-indigo-800/40">
        <div class="flex items-center justify-between pb-4 border-b border-indigo-800/50 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <h3 class="text-sm font-black text-white flex items-center gap-2">
                ${sim.gemini_reasoning.title}
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  GROUNDED AI REASONING
                </span>
              </h3>
              <p class="text-[11px] text-indigo-300">Deterministic scenario synthesis powered by SwasthyaGrid AI Intelligence Bridge.</p>
            </div>
          </div>
          <button
            type="button"
            onclick="window.toggleHealthCommandCopilot('PHC-07')"
            class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>💬</span> Discuss in Copilot
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono mb-1.5">Executive Summary</div>
            <p class="text-slate-300">${sim.gemini_reasoning.executive_summary}</p>
          </div>

          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono mb-1.5">Cascade Vulnerability Analysis</div>
            <p class="text-slate-300">${sim.gemini_reasoning.cascade_analysis}</p>
          </div>

          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono mb-1.5">Recommended Directives</div>
            <ul class="space-y-1.5 text-slate-300">
              ${sim.gemini_reasoning.recommended_actions.map(act => `
                <li class="flex items-start gap-2">
                  <span class="text-indigo-400 font-bold">•</span>
                  <span>${act}</span>
                </li>
              `).join("")}
            </ul>
          </div>
        </div>
      </div>

      <!-- ==================== SAVED SCENARIOS MODAL / DRAWER ==================== -->
      ${showSavedDrawer ? `
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 class="text-base font-black text-slate-900 flex items-center gap-2">
                <span>📁</span> Saved Stress Test Scenarios
              </h3>
              <button
                type="button"
                onclick="window.handleCloseSavedDrawer()"
                class="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div class="space-y-2 max-h-80 overflow-y-auto">
              ${savedScenarios.length === 0 ? `
                <div class="text-center py-8 text-xs text-slate-400">
                  No saved scenarios found. Run a simulation and click "Save Run" to persist results.
                </div>
              ` : savedScenarios.map(s => `
                <div class="p-3 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between bg-slate-50">
                  <div>
                    <div class="text-xs font-bold text-slate-900">${s.name}</div>
                    <div class="text-[10px] text-slate-500 font-mono">Saved at: ${new Date(s.saved_at).toLocaleTimeString()}</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-mono font-bold ${s.result.resilience_score.overall_score >= 60 ? 'text-emerald-600' : 'text-red-600'}">
                      Score: ${s.result.resilience_score.overall_score}/100
                    </span>
                    <button
                      type="button"
                      onclick="window.handleLoadSavedScenario('${s.id}')"
                      class="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold rounded"
                    >
                      Load
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>

            <div class="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onclick="window.handleCloseSavedDrawer()"
                class="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

// ==========================================
// GLOBAL EVENT HANDLERS
// ==========================================

window.handleSelectScenario = (scenarioId) => {
  activeScenarioKey = scenarioId;
  const sc = SCENARIO_TYPES[scenarioId];
  if (sc && sc.effects.patient_demand_multiplier) {
    customSliders.demandSurgePct = Math.round((sc.effects.patient_demand_multiplier[activeSeverityKey] - 1) * 100);
    customSliders.bedSurgePct = Math.round((sc.effects.bed_occupancy_multiplier?.[activeSeverityKey] - 1 || 0.4) * 100);
    customSliders.staffLossPct = Math.abs(sc.effects.staff_availability_modifier?.[activeSeverityKey] || 15);
  }
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();
};

window.handleParamChange = (param, value) => {
  if (param === "severity") activeSeverityKey = value;
  if (param === "target") activeTargetId = value;
  if (param === "duration") activeDuration = parseInt(value, 10);
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();
};

window.handleSliderChange = (sliderKey, value) => {
  customSliders[sliderKey] = parseFloat(value);
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();
};

window.handleExecuteSimulation = () => {
  currentSimulation = runSimulation({
    scenario_type: activeScenarioKey,
    severity: activeSeverityKey,
    affected_geography: activeTargetId,
    duration: activeDuration,
    customParams: {
      demandMultiplier: 1 + customSliders.demandSurgePct / 100,
      bedMultiplier: 1 + customSliders.bedSurgePct / 100,
      staffModifier: -customSliders.staffLossPct,
      medicineMultipliers: {
        "MED-07": customSliders.medicineBurnMult
      }
    }
  });
  isSimulationActive = true;
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();
};

window.handleLoadDemoPreset = () => {
  activeScenarioKey = DEMO_PRESET_CONFIG.scenario_type;
  activeSeverityKey = DEMO_PRESET_CONFIG.severity;
  activeTargetId = DEMO_PRESET_CONFIG.affected_geography;
  activeDuration = DEMO_PRESET_CONFIG.duration;
  customSliders = {
    demandSurgePct: 85,
    bedSurgePct: 50,
    staffLossPct: 15,
    medicineBurnMult: 2.1,
    deliveryDelayDays: 0
  };
  currentSimulation = runDemoScenario();
  isSimulationActive = true;
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();
};

window.handleResetSimulation = () => {
  resetSimulation();
  currentSimulation = null;
  isSimulationActive = false;
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();
};

window.handleSaveCurrentScenario = () => {
  if (currentSimulation) {
    const name = prompt("Enter a name for this simulation run:", `${currentSimulation.params.scenario_name} (${activeSeverityKey})`);
    if (name) {
      saveScenario(name, currentSimulation);
      alert(`Simulation run "${name}" saved.`);
      if (window.refreshCurrentRoute) window.refreshCurrentRoute();
    }
  }
};

window.handleOpenSavedDrawer = () => {
  showSavedDrawer = true;
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();
};

window.handleCloseSavedDrawer = () => {
  showSavedDrawer = false;
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();
};

window.handleLoadSavedScenario = (savedId) => {
  const saved = getSavedScenarios().find(s => s.id === savedId);
  if (saved && saved.result) {
    currentSimulation = saved.result;
    activeScenarioKey = currentSimulation.params.scenario_key;
    activeSeverityKey = currentSimulation.params.severity_key;
    activeTargetId = currentSimulation.params.target_id;
    activeDuration = currentSimulation.params.duration_days;
    showSavedDrawer = false;
    isSimulationActive = true;
    if (window.refreshCurrentRoute) window.refreshCurrentRoute();
  }
};
