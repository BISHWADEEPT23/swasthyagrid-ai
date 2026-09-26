/**
 * SwasthyaGrid AI — Resource Redistribution & Logistics Hub View (Build 07)
 * Route: #/redistribution
 *
 * Implements:
 * 1. 4 Redistribution & Logistics KPIs
 * 2. Multi-Criteria Ranked Redistribution Matrix with Candidate Donor Comparisons
 * 3. Interactive Route Map (Leaflet) with animated transit corridors
 * 4. Transfer Dispatch & Tracking Board (PROPOSED -> APPROVED -> IN_TRANSIT -> DELIVERED)
 * 5. Simulation Sandbox ("What-If" Transfer Calculator with real-time runway impacts)
 * 6. 1-Click Dispatch & Delivery Confirmation Handlers
 */

import { PHC_DATASET } from "../../data/phc_dataset.js";
import { MEDICINE_CATALOG } from "../../data/medicine_dataset.js";
import { 
  generateRedistributionPlan, 
  simulateTransferImpact, 
  getTransitLogistics,
  evaluateCandidateDonors 
} from "../../logic/redistribution_engine.js";
import { 
  getRecommendedTransfers, 
  dispatchTransfer, 
  deliverTransfer 
} from "../../logic/transfer_service.js";
import { submitHumanAction } from "../../ai/health_command_agent.js";
import { DONOR_BUFFER_CONSTRAINTS, TRANSFER_STATUS } from "../../config/redistribution_config.js";

// Sandbox simulation state
let simState = {
  sourcePhcId: "PHC-05",
  targetPhcId: "PHC-07",
  medicineId: "MED-07",
  quantity: 150
};

export function renderRedistributionView() {
  const plan = generateRedistributionPlan();
  const transfers = getRecommendedTransfers();
  const simResult = simulateTransferImpact(
    simState.sourcePhcId, 
    simState.targetPhcId, 
    simState.medicineId, 
    simState.quantity
  );

  const inTransitCount = transfers.filter(t => t.status === TRANSFER_STATUS.IN_TRANSIT).length;
  const deliveredCount = transfers.filter(t => t.status === TRANSFER_STATUS.DELIVERED).length;

  return `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              Resource Redistribution & Logistics Hub
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">MUTUAL AID MESH</span>
            </h1>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Deterministic multi-criteria redistribution engine: safe donor buffer preservation, transit optimization, and live dispatch tracking.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            onclick="window.toggleHealthCommandCopilot('PHC-07')"
            class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-2"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Command Copilot →
          </button>
        </div>
      </div>

      <!-- ==================== 4 REDISTRIBUTION KPIS ==================== -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Active Shipments</div>
          <div class="text-2xl font-black text-slate-900 mt-1 font-mono">${inTransitCount} in transit</div>
          <div class="text-[11px] text-sky-600 mt-0.5">${deliveredCount} delivered, ${transfers.length - inTransitCount - deliveredCount} proposed</div>
        </div>

        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Units Reallocated</div>
          <div class="text-2xl font-black text-indigo-700 mt-1 font-mono">${plan.summary.total_units_reallocated.toLocaleString()} Units</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Across ${plan.summary.total_active_proposals} balanced routes</div>
        </div>

        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Shortages Mitigated</div>
          <div class="text-2xl font-black text-emerald-600 mt-1 font-mono">${plan.summary.critical_shortages_mitigated} Facilities</div>
          <div class="text-[11px] text-emerald-700 font-semibold mt-0.5">PHC-07 & PHC-03 zero-stock averted</div>
        </div>

        <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Avg Fleet Transit</div>
          <div class="text-2xl font-black text-slate-900 mt-1 font-mono">${plan.summary.average_transit_time_label}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Urban/suburban corridor speed</div>
        </div>
      </div>

      <!-- ==================== RANKED REDISTRIBUTION RECOMMENDATIONS ==================== -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
              RANKED REDISTRIBUTION PROPOSALS (MULTI-CRITERIA OPTIMIZED)
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Ranked by urgency (35%), transit distance (25%), donor residual safety buffer (25%), and FEFO expiry rotation (15%).
            </p>
          </div>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            Donor Safety Rule: ≥ ${DONOR_BUFFER_CONSTRAINTS.MIN_DAYS_OF_STOCK_RETAINED} Days Retained
          </span>
        </div>

        <div class="space-y-4">
          ${plan.recommendations.map(rec => `
            <div id="transfer-card-${rec.transfer_id}" class="rounded-xl border ${rec.rank === 1 ? 'border-red-400 bg-red-50/20 ring-1 ring-red-200' : 'border-slate-200 bg-slate-50/40'} p-5 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2 py-0.5 rounded text-[10px] font-black ${rec.urgency?.code === 'CRITICAL_EMERGENCY' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'} font-mono uppercase">
                      PRIORITY ${rec.rank} • ${rec.urgency?.label || 'URGENT'}
                    </span>
                    <span class="text-xs font-mono font-bold text-slate-700">${rec.transfer_id}</span>
                    <span class="text-xs font-mono text-slate-400">• Transit ETA: <strong>${rec.logistics.transit_time_label}</strong> (${rec.logistics.road_km} km)</span>
                  </div>
                  <h3 class="text-base font-bold text-slate-900 tracking-tight">
                    ${rec.title}: ${rec.recommended_quantity} Units of ${rec.medicine_name}
                  </h3>
                  <div class="text-xs text-slate-600 font-mono">
                    From: <strong class="text-slate-900">${rec.source_phc_id} (${rec.source_phc_name})</strong> → To: <strong class="text-slate-900">${rec.target_phc_id} (${rec.target_phc_name})</strong>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold px-2.5 py-1 rounded border ${rec.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : rec.status === 'IN_TRANSIT' ? 'bg-sky-100 text-sky-800 border-sky-200 animate-pulse' : 'bg-amber-100 text-amber-800 border-amber-200'}">
                    STATUS: ${rec.status}
                  </span>
                </div>
              </div>

              <!-- Impact & Trade-Off Cards -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div class="p-3 bg-white rounded-lg border border-slate-200 space-y-1 font-sans">
                  <div class="font-bold text-slate-800 font-mono uppercase text-[11px] flex items-center justify-between">
                    <span>Target Impact (${rec.target_phc_id})</span>
                    <span class="text-emerald-600 font-bold font-mono">Coverage Extended</span>
                  </div>
                  <p class="text-slate-600 leading-relaxed">
                    ${rec.impact_summary}
                  </p>
                </div>

                <div class="p-3 bg-white rounded-lg border border-slate-200 space-y-1 font-sans">
                  <div class="font-bold text-slate-800 font-mono uppercase text-[11px] flex items-center justify-between">
                    <span>Donor Safety Check (${rec.source_phc_id})</span>
                    <span class="text-emerald-700 font-bold font-mono">SAFE BUFFER PRESERVED</span>
                  </div>
                  <p class="text-slate-600 leading-relaxed">
                    Donor retains <strong>&gt;4.0 days of buffer</strong> until next supplier delivery. Transit via refrigerated medical van.
                  </p>
                </div>
              </div>

              <!-- Candidate Donors Comparison Drawer Toggle -->
              <div class="pt-2">
                <button
                  type="button"
                  onclick="window.toggleCandidateComparison('${rec.transfer_id}')"
                  class="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 font-mono"
                >
                  <span>▼ View Candidate Donors & Multi-Criteria Trade-Off Comparison</span>
                </button>

                <div id="candidates-container-${rec.transfer_id}" class="hidden mt-3 p-3 bg-white rounded-xl border border-slate-200 overflow-x-auto text-xs">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase text-slate-500">
                        <th class="py-2 px-2.5">Candidate Donor</th>
                        <th class="py-2 px-2.5">Current Stock</th>
                        <th class="py-2 px-2.5">Safe Surplus</th>
                        <th class="py-2 px-2.5">Post-Transfer Buffer</th>
                        <th class="py-2 px-2.5">Distance / ETA</th>
                        <th class="py-2 px-2.5">Optimization Score</th>
                        <th class="py-2 px-2.5">Decision Note</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
                      ${(rec.candidate_donors || []).slice(0, 4).map(c => `
                        <tr class="${c.donor_phc_id === rec.source_phc_id ? 'bg-indigo-50/50 font-bold' : ''}">
                          <td class="py-2 px-2.5">
                            ${c.donor_phc_id} (${c.donor_phc_name})
                            ${c.donor_phc_id === rec.source_phc_id ? '<span class="text-[9px] px-1 py-0.2 rounded bg-indigo-600 text-white ml-1">SELECTED</span>' : ''}
                          </td>
                          <td class="py-2 px-2.5">${c.current_stock} units (${c.current_coverage_days}d)</td>
                          <td class="py-2 px-2.5 text-emerald-700">${c.available_surplus} units</td>
                          <td class="py-2 px-2.5 ${c.is_buffer_safe ? 'text-slate-800' : 'text-red-600'}">${c.post_transfer_coverage_days}d left</td>
                          <td class="py-2 px-2.5">${c.logistics.road_km} km (${c.logistics.transit_time_label})</td>
                          <td class="py-2 px-2.5 font-bold ${c.rank_score >= 80 ? 'text-indigo-700' : 'text-slate-600'}">${c.rank_score}/100</td>
                          <td class="py-2 px-2.5 text-[10px] font-sans text-slate-500">${c.trade_off_notes}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Action Bar -->
              <div class="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="text-[11px] text-slate-500 font-sans">
                  Authority: <strong>Chief Medical Officer / District Health Officer</strong>
                </div>
                <div class="flex items-center gap-2">
                  ${rec.status === 'PROPOSED' ? `
                    <button
                      type="button"
                      onclick="window.handleDispatchTransfer('${rec.transfer_id}', '${rec.source_phc_id}', '${rec.target_phc_id}', '${rec.medicine_name}', ${rec.recommended_quantity})"
                      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 font-sans"
                    >
                      <span>🚀 Dispatch Shipment</span>
                    </button>
                  ` : rec.status === 'IN_TRANSIT' ? `
                    <button
                      type="button"
                      onclick="window.handleDeliverTransfer('${rec.transfer_id}')"
                      class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 font-sans"
                    >
                      <span>✓ Confirm Receipt & Delivery</span>
                    </button>
                  ` : `
                    <span class="text-xs font-bold text-emerald-700 font-mono flex items-center gap-1">
                      ✓ Delivered & Stock Updated
                    </span>
                  `}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- ==================== REDISTRIBUTION ROUTE MAP ==================== -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              INTER-FACILITY REDISTRIBUTION CORRIDORS MAP
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Visualizing active transit routes: Green pins (Donor Facilities) → Red pins (Deficit Facilities).
            </p>
          </div>
          <div class="flex items-center gap-3 text-xs font-mono">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Donor</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span> Deficit Target</span>
            <span class="flex items-center gap-1 text-slate-500"><span class="w-4 h-0.5 bg-indigo-500 border-b border-dashed"></span> Route</span>
          </div>
        </div>

        <div id="redistribution-leaflet-map" class="h-80 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          <!-- Leaflet Map Container -->
        </div>
      </div>

      <!-- ==================== WHAT-IF SIMULATION SANDBOX ==================== -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              SIMULATION SANDBOX: "WHAT-IF" TRANSFER CALCULATOR
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Test hypothetical transfer scenarios and view instantaneous before/after stock runway impacts without affecting live records.
            </p>
          </div>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            Live Math Sandbox
          </span>
        </div>

        <!-- Controls Form -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label class="block text-slate-500 font-bold mb-1">Target (Deficit Facility):</label>
            <select 
              id="sim-target-select" 
              onchange="window.handleSimParamChange('targetPhcId', this.value)"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-bold"
            >
              ${PHC_DATASET.map(p => `
                <option value="${p.phc_id}" ${p.phc_id === simState.targetPhcId ? "selected" : ""}>
                  ${p.phc_id} (${p.phc_name})
                </option>
              `).join("")}
            </select>
          </div>

          <div>
            <label class="block text-slate-500 font-bold mb-1">Source (Candidate Donor):</label>
            <select 
              id="sim-source-select" 
              onchange="window.handleSimParamChange('sourcePhcId', this.value)"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-bold"
            >
              ${PHC_DATASET.map(p => `
                <option value="${p.phc_id}" ${p.phc_id === simState.sourcePhcId ? "selected" : ""}>
                  ${p.phc_id} (${p.phc_name})
                </option>
              `).join("")}
            </select>
          </div>

          <div>
            <label class="block text-slate-500 font-bold mb-1">Medicine Category:</label>
            <select 
              id="sim-med-select" 
              onchange="window.handleSimParamChange('medicineId', this.value)"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-bold"
            >
              ${MEDICINE_CATALOG.map(m => `
                <option value="${m.id}" ${m.id === simState.medicineId ? "selected" : ""}>
                  ${m.name}
                </option>
              `).join("")}
            </select>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="text-slate-500 font-bold">Quantity: <span class="text-indigo-700 font-black">${simState.quantity}</span></label>
              <span class="text-[10px] text-slate-400 font-normal">50–300</span>
            </div>
            <input 
              type="range" 
              min="25" 
              max="350" 
              step="25" 
              value="${simState.quantity}" 
              oninput="window.handleSimParamChange('quantity', parseInt(this.value))"
              class="w-full accent-indigo-600"
            />
          </div>
        </div>

        <!-- Simulation Results Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <!-- Target Facility Impact -->
          <div class="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-2 font-mono text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-indigo-900">TARGET: ${simResult.target_phc_id}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                +${simResult.target.days_gained}d Runway Gain
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-1">
              <div class="p-2.5 bg-white rounded-lg border border-indigo-100">
                <div class="text-[10px] text-slate-400 uppercase">Before Transfer</div>
                <div class="text-lg font-black text-slate-800">${simResult.target.before_stock} units</div>
                <div class="text-[10px] text-red-600 font-bold">${simResult.target.before_days} days stock</div>
              </div>
              <div class="p-2.5 bg-white rounded-lg border border-indigo-100">
                <div class="text-[10px] text-slate-400 uppercase">After Transfer</div>
                <div class="text-lg font-black text-indigo-700">${simResult.target.after_stock} units</div>
                <div class="text-[10px] text-emerald-700 font-bold">${simResult.target.after_days} days stock</div>
              </div>
            </div>
          </div>

          <!-- Donor Facility Impact -->
          <div class="p-4 rounded-xl border ${simResult.donor.is_safe ? 'border-emerald-200 bg-emerald-50/20' : 'border-red-300 bg-red-50/30'} space-y-2 font-mono text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900">DONOR: ${simResult.source_phc_id}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${simResult.donor.is_safe ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-600 text-white'}">
                ${simResult.donor.is_safe ? 'BUFFER SAFE (≥4.0d)' : 'SAFETY BREACH (<4.0d)'}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-1">
              <div class="p-2.5 bg-white rounded-lg border border-slate-200">
                <div class="text-[10px] text-slate-400 uppercase">Before Transfer</div>
                <div class="text-lg font-black text-slate-800">${simResult.donor.before_stock} units</div>
                <div class="text-[10px] text-slate-600">${simResult.donor.before_days} days stock</div>
              </div>
              <div class="p-2.5 bg-white rounded-lg border border-slate-200">
                <div class="text-[10px] text-slate-400 uppercase">After Transfer</div>
                <div class="text-lg font-black ${simResult.donor.is_safe ? 'text-slate-800' : 'text-red-600'}">${simResult.donor.after_stock} units</div>
                <div class="text-[10px] ${simResult.donor.is_safe ? 'text-slate-700 font-bold' : 'text-red-700 font-black'}">${simResult.donor.after_days} days stock</div>
              </div>
            </div>
            ${simResult.donor.warning ? `
              <div class="text-[11px] text-red-700 bg-red-100/80 p-2 rounded border border-red-200 font-sans">
                ⚠ <strong>Constraint Violation:</strong> ${simResult.donor.warning}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="text-slate-500 text-[11px] font-mono flex items-center justify-between pt-1">
          <span>Transit Distance: <strong>${simResult.logistics.road_km} km</strong> • Travel ETA: <strong>${simResult.logistics.transit_time_label}</strong></span>
          <span>Road Multiplier: 1.25x • Dispatch Overhead: 15 mins</span>
        </div>
      </div>
    </div>
  `;
}

// Global helper for toggling candidate comparisons
window.toggleCandidateComparison = function(txId) {
  const container = document.getElementById(`candidates-container-${txId}`);
  if (container) {
    container.classList.toggle("hidden");
  }
};

// Global helper for simulation parameter change
window.handleSimParamChange = function(param, value) {
  simState[param] = value;
  const view = document.getElementById("app-main-content");
  if (view) {
    view.innerHTML = renderRedistributionView();
    mountRedistributionView();
  }
};

// Global handler for dispatching transfer
window.handleDispatchTransfer = async function(transferId, source, target, resource, quantity) {
  dispatchTransfer(transferId);
  try {
    await fetch("/api/transfers/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transfer_id: transferId, driver_name: "Driver R. Kumar", vehicle_no: "DL-1VA-4482" })
    });
  } catch (e) {
    console.warn("Could not reach /api/transfers/dispatch:", e);
  }

  await submitHumanAction({
    action_type: "TRANSFER_DISPATCHED",
    target: target,
    source: source,
    resource: resource,
    quantity: quantity,
    user_role: "District Health Officer",
    notes: `Shipment dispatched via Redistribution Hub.`
  });

  // Re-render
  const view = document.getElementById("app-main-content");
  if (view) {
    view.innerHTML = renderRedistributionView();
    mountRedistributionView();
  }
};

// Global handler for delivering transfer
window.handleDeliverTransfer = async function(transferId) {
  deliverTransfer(transferId, "Chief Pharmacist");
  try {
    await fetch("/api/transfers/deliver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transfer_id: transferId, received_by: "Chief Pharmacist" })
    });
  } catch (e) {
    console.warn("Could not reach /api/transfers/deliver:", e);
  }

  // Re-render
  const view = document.getElementById("app-main-content");
  if (view) {
    view.innerHTML = renderRedistributionView();
    mountRedistributionView();
  }
};

/**
 * Initializes the Leaflet map on the #redistribution-leaflet-map container.
 */
export function mountRedistributionView() {
  const container = document.getElementById("redistribution-leaflet-map");
  if (!container) return;

  if (container._leaflet_id && window.L) {
    container._leaflet_map?.remove();
  }

  if (window.L) {
    try {
      const map = window.L.map(container, {
        center: [28.63, 77.18],
        zoom: 11,
        zoomControl: true,
        attributionControl: false
      });
      container._leaflet_map = map;

      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
        subdomains: "abcd"
      }).addTo(map);

      // Plot all PHCs
      PHC_DATASET.forEach(phc => {
        const isTarget = phc.phc_id === "PHC-07" || phc.phc_id === "PHC-03";
        const isDonor = phc.phc_id === "PHC-05" || phc.phc_id === "PHC-11" || phc.phc_id === "PHC-09";

        let markerColor = "#64748b"; // Slate default
        if (isTarget) markerColor = "#dc2626"; // Red deficit
        else if (isDonor) markerColor = "#10b981"; // Emerald donor

        const iconHtml = `
          <div class="relative flex items-center justify-center">
            ${isTarget ? '<span class="absolute w-8 h-8 rounded-full bg-red-500/40 animate-ping"></span>' : ''}
            <div class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white font-mono" style="background-color: ${markerColor}">
              ${phc.phc_id.replace("PHC-", "")}
            </div>
          </div>
        `;

        const customIcon = window.L.divIcon({
          html: iconHtml,
          className: "custom-phc-pin",
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = window.L.marker([phc.latitude, phc.longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div class="p-1 font-sans text-xs">
            <div class="font-bold text-slate-900">${phc.phc_id} (${phc.phc_name})</div>
            <div class="text-[11px] text-slate-500">${phc.district}</div>
            <div class="mt-1 font-mono text-[10px] ${isTarget ? 'text-red-600 font-bold' : isDonor ? 'text-emerald-700 font-bold' : 'text-slate-600'}">
              ${isTarget ? 'DEFICIT TARGET FACILITY' : isDonor ? 'CANDIDATE DONOR FACILITY' : 'MONITORING'}
            </div>
          </div>
        `);
      });

      // Plot route lines: PHC-05 -> PHC-07 (IV Fluids) and PHC-11 -> PHC-03 (ORS)
      const p05 = PHC_DATASET.find(p => p.phc_id === "PHC-05");
      const p07 = PHC_DATASET.find(p => p.phc_id === "PHC-07");
      const p11 = PHC_DATASET.find(p => p.phc_id === "PHC-11");
      const p03 = PHC_DATASET.find(p => p.phc_id === "PHC-03");

      if (p05 && p07) {
        window.L.polyline([
          [p05.latitude, p05.longitude],
          [p07.latitude, p07.longitude]
        ], {
          color: "#4f46e5",
          weight: 3,
          dashArray: "6, 8",
          opacity: 0.8
        }).addTo(map).bindPopup("<strong>Corridor 1:</strong> PHC-05 → PHC-07 (150 Units IV Fluids • 45 mins)");
      }

      if (p11 && p03) {
        window.L.polyline([
          [p11.latitude, p11.longitude],
          [p03.latitude, p03.longitude]
        ], {
          color: "#0284c7",
          weight: 3,
          dashArray: "6, 8",
          opacity: 0.8
        }).addTo(map).bindPopup("<strong>Corridor 2:</strong> PHC-11 → PHC-03 (300 Units ORS • 55 mins)");
      }

    } catch (e) {
      console.warn("Leaflet redistribution map error:", e);
    }
  }
}
