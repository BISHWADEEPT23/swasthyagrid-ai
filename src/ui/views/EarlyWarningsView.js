/**
 * SwasthyaGrid AI — Unified Early Warning & Risk Intelligence Centre (Build 06)
 * Route: #/warnings
 *
 * Implements:
 * 1. 8 Unified Early Warning KPIs:
 *    - Critical Facilities, Warning Facilities, Emerging Risks, Predicted Stock-outs,
 *      Bed Capacity Risks, Workforce Gaps, Compound Risk Facilities, Active Alert Signals
 * 2. "What Changed Since Yesterday?" Executive Shift Banner
 * 3. 12-PHC Early Warning Risk Matrix (Sortable, Filterable by Status/District/Compound/Emerging)
 * 4. Interactive Warning Timeline Widget (T-7 to +2d/+7d Forecast Trajectory)
 * 5. "Why Is This Warning?" Explainable AI Drawer / Modal with exact deterministic threshold breakdowns
 * 6. Alert Lifecycle & Human Action Center (Active, Acknowledged, Monitoring, Resolved)
 * 7. Ranked Priority Intervention Directives (DIR-2026-07A, DIR-2026-03B, DIR-2026-BED)
 * 8. Human Decision Maker Audit Trail
 */

import { PHC_DATASET, DISTRICTS } from "../../data/phc_dataset.js";
import { 
  calculateFacilityRiskProfile, 
  calculateNationalRiskProfile, 
  getWarningTimeline, 
  getWhatChangedSinceYesterday,
  getEarlyWarningFeed 
} from "../../logic/unified_risk_engine.js";
import { 
  getLifecycleAlerts, 
  acknowledgeAlert, 
  resolveAlert, 
  synchronizeAlerts 
} from "../../logic/alert_lifecycle_service.js";
import { fetchHumanDecisions, submitHumanAction } from "../../ai/health_command_agent.js";
import { renderStatusBadge } from "../components/PHCStatusBadge.js";

let currentFilter = "ALL";
let currentSort = "SCORE_DESC";
let selectedTimelinePhc = "PHC-07";

export function renderEarlyWarningsView() {
  const nationalProfile = calculateNationalRiskProfile(7);
  const alerts = getLifecycleAlerts("ALL");
  const whatChanged = getWhatChangedSinceYesterday();
  const timeline = getWarningTimeline(selectedTimelinePhc);
  const selectedProfile = calculateFacilityRiskProfile(selectedTimelinePhc, 7);

  // 8 KPIs
  const criticalCount = nationalProfile.status_counts.CRITICAL;
  const warningCount = nationalProfile.status_counts.WARNING;
  const emergingCount = nationalProfile.emerging_risks.length;
  const compoundCount = nationalProfile.compound_risks.length;
  const predictedStockoutCount = alerts.filter(a => a.alert_type === "PREDICTED_STOCKOUT" || a.resource_category === "Critical Supply Deficit").length;
  const capacityRiskCount = alerts.filter(a => a.alert_type === "BED_SATURATION_RISK" || a.resource_category === "Bed Capacity Pressure").length;
  const workforceRiskCount = nationalProfile.facility_profiles.filter(p => p.domain_scores.WORKFORCE?.points > 6).length;
  const activeAlertCount = alerts.filter(a => a.status === "ACTIVE").length;

  return `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              Unified Early Warning & Risk Intelligence Centre
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono">LIVE PRE-CRISIS RADAR</span>
            </h1>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Deterministic multi-domain pressure scoring, compound hazard detection, and explainable human decision workflows.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            onclick="window.toggleHealthCommandCopilot('PHC-07')"
            class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-2"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Launch Command Copilot →
          </button>
        </div>
      </div>

      <!-- ==================== 8 COMMAND EARLY WARNING KPIS ==================== -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <!-- 1. Critical Facilities -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Critical Facilities</div>
          <div class="text-2xl font-black text-red-600 mt-1 font-mono">${criticalCount}</div>
          <div class="text-[10px] font-semibold text-red-700 mt-0.5">Score ≥ 70 (PHC-07)</div>
        </div>

        <!-- 2. Warning Facilities -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Warning Facilities</div>
          <div class="text-2xl font-black text-amber-600 mt-1 font-mono">${warningCount}</div>
          <div class="text-[10px] text-amber-700 font-medium mt-0.5">Score 45–69 (PHC-03, 11)</div>
        </div>

        <!-- 3. Emerging Risks -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Emerging Risks</div>
          <div class="text-2xl font-black text-sky-700 mt-1 font-mono">${emergingCount}</div>
          <div class="text-[10px] text-sky-700 font-medium mt-0.5">Pre-crisis acceleration</div>
        </div>

        <!-- 4. Predicted Stock-outs -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Stockout Risks</div>
          <div class="text-2xl font-black text-slate-900 mt-1 font-mono">${predictedStockoutCount}</div>
          <div class="text-[10px] text-red-600 font-medium mt-0.5">Within 7d horizon</div>
        </div>

        <!-- 5. Bed Capacity Risks -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Bed Saturation</div>
          <div class="text-2xl font-black text-slate-900 mt-1 font-mono">${capacityRiskCount}</div>
          <div class="text-[10px] text-amber-600 font-medium mt-0.5">&gt;85% Occupancy</div>
        </div>

        <!-- 6. Workforce Gaps -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Workforce Gaps</div>
          <div class="text-2xl font-black text-slate-900 mt-1 font-mono">${workforceRiskCount}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Ratio or attendance</div>
        </div>

        <!-- 7. Compound Pressure -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Compound Risk</div>
          <div class="text-2xl font-black text-purple-700 mt-1 font-mono">${compoundCount}</div>
          <div class="text-[10px] text-purple-700 font-medium mt-0.5">Multi-domain cascade</div>
        </div>

        <!-- 8. Active Alerts -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Active Signals</div>
          <div class="text-2xl font-black text-slate-900 mt-1 font-mono">${activeAlertCount}</div>
          <div class="text-[10px] text-emerald-700 font-medium mt-0.5">Deduplicated</div>
        </div>
      </div>

      <!-- ==================== WHAT CHANGED SINCE YESTERDAY ==================== -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <h2 class="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
              WHAT CHANGED SINCE YESTERDAY? (OPERATIONAL SHIFT DETECTION)
            </h2>
          </div>
          <span class="text-[11px] font-mono text-slate-400">Telemetry cycle: T-24h → T-0</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          ${whatChanged.map(item => `
            <div class="p-3.5 rounded-xl border ${item.severity === "CRITICAL" ? "border-red-200 bg-red-50/40" : item.severity === "WARNING" ? "border-amber-200 bg-amber-50/30" : "border-sky-200 bg-sky-50/30"} space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded ${item.severity === "CRITICAL" ? "bg-red-600 text-white" : item.severity === "WARNING" ? "bg-amber-500 text-white" : "bg-sky-600 text-white"}">
                  ${item.badge}
                </span>
                <span class="text-[10px] font-mono text-slate-400">${item.timestamp}</span>
              </div>
              <div class="text-xs font-bold text-slate-900 font-sans">${item.facility}</div>
              <p class="text-[11px] text-slate-600 leading-relaxed">${item.description}</p>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- ==================== 12-PHC EARLY WARNING RISK MATRIX ==================== -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              12-PHC EARLY WARNING RISK MATRIX & PRESSURE SCORES
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Deterministic 0–100 Facility Pressure Score calculated across Supply (30%), Demand (20%), Beds (20%), Workforce (15%), Delivery (10%), Other (5%).
            </p>
          </div>

          <!-- Filters & Controls -->
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <button 
              type="button" 
              onclick="window.setRiskFilter('ALL')" 
              class="px-2.5 py-1 rounded font-mono font-bold text-[11px] transition-colors ${currentFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
            >
              All (12)
            </button>
            <button 
              type="button" 
              onclick="window.setRiskFilter('CRITICAL')" 
              class="px-2.5 py-1 rounded font-mono font-bold text-[11px] transition-colors ${currentFilter === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}"
            >
              Critical
            </button>
            <button 
              type="button" 
              onclick="window.setRiskFilter('COMPOUND')" 
              class="px-2.5 py-1 rounded font-mono font-bold text-[11px] transition-colors ${currentFilter === 'COMPOUND' ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}"
            >
              Compound Risk
            </button>
            <button 
              type="button" 
              onclick="window.setRiskFilter('EMERGING')" 
              class="px-2.5 py-1 rounded font-mono font-bold text-[11px] transition-colors ${currentFilter === 'EMERGING' ? 'bg-sky-700 text-white' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'}"
            >
              Emerging Risk
            </button>
            <button 
              type="button" 
              onclick="window.setRiskFilter('Central')" 
              class="px-2.5 py-1 rounded font-mono font-bold text-[11px] transition-colors ${currentFilter === 'Central' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
            >
              District Central
            </button>
          </div>
        </div>

        <!-- Table Container -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50/70 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th class="py-2.5 px-3">PHC Facility</th>
                <th class="py-2.5 px-3">Pressure Score</th>
                <th class="py-2.5 px-3">Status</th>
                <th class="py-2.5 px-3">Supply (30%)</th>
                <th class="py-2.5 px-3">Demand (20%)</th>
                <th class="py-2.5 px-3">Beds (20%)</th>
                <th class="py-2.5 px-3">Workforce (15%)</th>
                <th class="py-2.5 px-3">Risk Velocity</th>
                <th class="py-2.5 px-3 text-right">Explainability & Actions</th>
              </tr>
            </thead>
            <tbody id="risk-matrix-tbody" class="divide-y divide-slate-100 font-mono">
              ${renderRiskMatrixRows(nationalProfile.facility_profiles, currentFilter)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== WARNING TIMELINE WIDGET ==================== -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              WARNING TIMELINE & FORECAST TRAJECTORY
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Evolution of operational pressure from 7 days ago through today and forward 7 days.
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-500 font-medium">Select PHC:</span>
            <select 
              id="timeline-phc-select" 
              onchange="window.handleTimelinePhcChange(this.value)"
              class="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono font-bold text-xs focus:ring-1 focus:ring-indigo-500"
            >
              ${PHC_DATASET.map(p => `
                <option value="${p.phc_id}" ${p.phc_id === selectedTimelinePhc ? "selected" : ""}>
                  ${p.phc_id} (${p.phc_name}) - Score: ${calculateFacilityRiskProfile(p.phc_id).pressure_score}
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <!-- Trajectory Steps -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          ${timeline.map(step => {
            let badgeBg = "bg-slate-100 text-slate-700 border-slate-200";
            if (step.status === "CRITICAL") badgeBg = "bg-red-100 text-red-800 border-red-200 font-black";
            else if (step.status === "WARNING") badgeBg = "bg-amber-100 text-amber-800 border-amber-200";
            else if (step.status === "WATCH") badgeBg = "bg-yellow-100 text-yellow-800 border-yellow-200";

            return `
              <div class="p-3.5 rounded-xl border ${step.period === "TODAY" ? "border-indigo-400 bg-indigo-50/40 ring-1 ring-indigo-300" : "border-slate-200 bg-slate-50/40"} space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider ${step.period === "TODAY" ? "text-indigo-700 font-black" : "text-slate-500"}">
                    ${step.period}
                  </span>
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded border ${badgeBg}">
                    ${step.status}
                  </span>
                </div>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-black font-mono ${step.score >= 70 ? "text-red-600" : step.score >= 45 ? "text-amber-600" : "text-slate-800"}">
                    ${step.score}
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">/100</span>
                </div>
                <div class="text-[10px] font-mono text-slate-400">${step.date}</div>
                <p class="text-[11px] text-slate-600 leading-snug font-sans">${step.note}</p>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- ==================== ALERT LIFECYCLE & HUMAN ACTION CENTER ==================== -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              ALERT LIFECYCLE & HUMAN ACTION WORKFLOW
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Stable-key deduplicated early warnings. Transition states: Active → Acknowledged → Resolved.
            </p>
          </div>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            ${alerts.length} Total Registered Alerts
          </span>
        </div>

        <div class="space-y-3">
          ${alerts.map(a => `
            <div id="alert-row-${a.alert_id}" class="p-4 rounded-xl border ${a.severity === "CRITICAL" ? "border-red-200 bg-red-50/20" : a.severity === "WARNING" ? "border-amber-200 bg-amber-50/20" : "border-slate-200 bg-slate-50/40"} flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
              <div class="space-y-1.5 max-w-2xl">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-slate-900">${a.alert_id}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-black ${a.severity === "CRITICAL" ? "bg-red-600 text-white" : a.severity === "WARNING" ? "bg-amber-500 text-white" : "bg-sky-600 text-white"}">
                    ${a.severity}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${a.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : a.status === "ACKNOWLEDGED" ? "bg-indigo-100 text-indigo-800 border-indigo-200" : "bg-slate-100 text-slate-700 border-slate-200"}">
                    STATUS: ${a.status}
                  </span>
                  ${a.is_compound ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">COMPOUND RISK</span>' : ''}
                </div>
                <div class="text-sm font-sans font-bold text-slate-900">
                  ${a.phc_name} (${a.phc_id}) — ${a.resource_category || a.alert_type}
                </div>
                <p class="text-xs font-sans text-slate-600 leading-relaxed">
                  ${a.message}
                </p>
                ${a.notes ? `<div class="text-[11px] font-sans text-indigo-700 bg-indigo-50 p-2 rounded border border-indigo-100">Note: ${a.notes}</div>` : ''}
                ${a.resolution_note ? `<div class="text-[11px] font-sans text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100">Resolution: ${a.resolution_note}</div>` : ''}
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 flex-shrink-0">
                ${a.status === "ACTIVE" ? `
                  <button
                    type="button"
                    onclick="window.handleAcknowledgeAlert('${a.alert_id}')"
                    class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs transition-colors shadow-sm"
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    onclick="window.handleResolveAlert('${a.alert_id}')"
                    class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs transition-colors shadow-sm"
                  >
                    Resolve
                  </button>
                ` : a.status === "ACKNOWLEDGED" ? `
                  <button
                    type="button"
                    onclick="window.handleResolveAlert('${a.alert_id}')"
                    class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs transition-colors shadow-sm"
                  >
                    Mark Resolved
                  </button>
                ` : `
                  <span class="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    ✓ Closed
                  </span>
                `}
                <button
                  type="button"
                  onclick="window.showWhyWarningModal('${a.phc_id}')"
                  class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-xs transition-colors"
                >
                  Why?
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- ==================== RANKED PRIORITY INTERVENTION DIRECTIVES (BUILD 05 PRESERVED) ==================== -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              RANKED INTERVENTION DIRECTIVES (HUMAN SIGN-OFF REQUIRED)
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Synthesized with grounded trade-off analysis across distance, buffer impact, and stockout timelines.
            </p>
          </div>
        </div>

        <!-- Directive 1: PHC-07 IV Fluids Emergency Transfer -->
        <div class="rounded-xl border-2 border-red-500/60 bg-red-50/20 p-5 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white font-mono uppercase">
                  PRIORITY 1 • CRITICAL
                </span>
                <span class="text-xs font-mono font-bold text-slate-700">Directive ID: DIR-2026-07A</span>
              </div>
              <h3 class="text-base font-bold text-slate-900 tracking-tight">
                Emergency Redistribution: 150 Units IV Fluids from PHC-05 to PHC-07
              </h3>
            </div>
            <span class="text-xs font-mono font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded border border-red-200 whitespace-nowrap">
              3.2-Day Zero-Stock Window
            </span>
          </div>

          <!-- Rationale & Trade-off -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-3 bg-white rounded-lg border border-red-200 space-y-1.5">
              <div class="font-bold text-slate-800 font-mono uppercase text-[11px]">Why This Intervention? (Operational Rationale)</div>
              <p class="text-slate-600 leading-relaxed font-sans">
                PHC-07 is under acute surge (+35% demand). Current stock (105 units) at forecast burn of 58/day will deplete in <strong>1.8 days (Sept 22)</strong>. Scheduled supplier delivery is Sept 25 (5 days away), leaving a <strong>3.2-day gap with zero resuscitation fluids</strong>.
              </p>
            </div>

            <div class="p-3 bg-white rounded-lg border border-red-200 space-y-1.5">
              <div class="font-bold text-slate-800 font-mono uppercase text-[11px]">Source Impact Analysis (PHC-05)</div>
              <p class="text-slate-600 leading-relaxed font-sans">
                PHC-05 holds 320 units with 8.4 days of stock. Transferring 150 units leaves PHC-05 with <strong>170 units (4.5 days of safe buffer)</strong>, comfortably bridging until their replenishment on Sept 24. Transit time: <strong>45 minutes</strong> (18 km).
              </p>
            </div>
          </div>

          <!-- Action Bar -->
          <div id="action-container-dir-01" class="pt-3 border-t border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="text-[11px] text-slate-600 font-medium font-sans">
              Authority Required: <strong>Chief Medical Officer / District Health Officer</strong>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick="window.handleExecuteDirective('dir-01', 'PHC-05', 'PHC-07', 'IV Fluids (NS / RL 500ml)', 150)"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 font-sans"
              >
                <span>✓ Approve & Dispatch Transfer</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Directive 2: PHC-03 ORS Sachets Transfer -->
        <div class="rounded-xl border border-amber-300 bg-amber-50/20 p-5 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-white font-mono uppercase">
                  PRIORITY 2 • CRITICAL
                </span>
                <span class="text-xs font-mono font-bold text-slate-700">Directive ID: DIR-2026-03B</span>
              </div>
              <h3 class="text-base font-bold text-slate-900 tracking-tight">
                ORS Surplus Redistribution: 300 Units from PHC-11 to PHC-03
              </h3>
            </div>
            <span class="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded border border-amber-200">
              1.2-Day Shortage Window
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-3 bg-white rounded-lg border border-amber-200 space-y-1.5">
              <div class="font-bold text-slate-800 font-mono uppercase text-[11px]">Why This Intervention?</div>
              <p class="text-slate-600 leading-relaxed font-sans">
                PHC-03 has only 70 units of ORS (2.8 days left) with replenishment scheduled in 4 days. Complete stockout will occur 1.2 days before delivery without buffer assistance.
              </p>
            </div>

            <div class="p-3 bg-white rounded-lg border border-amber-200 space-y-1.5">
              <div class="font-bold text-slate-800 font-mono uppercase text-[11px]">Source Impact Analysis (PHC-11)</div>
              <p class="text-slate-600 leading-relaxed font-sans">
                PHC-11 holds 966 units (27.6 days of stock — high buffer). Reallocating 300 units leaves PHC-11 with <strong>19.0 days of stock</strong>, well above the 14-day safety threshold.
              </p>
            </div>
          </div>

          <div id="action-container-dir-02" class="pt-3 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="text-[11px] text-slate-600 font-medium font-sans">
              Authority Required: <strong>District Health Officer</strong>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                onclick="window.handleExecuteDirective('dir-02', 'PHC-11', 'PHC-03', 'ORS Sachets', 300)"
                class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 font-sans"
              >
                <span>✓ Approve & Dispatch Transfer</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Directive 3: District Central Secondary Triage & Bed Buffer -->
        <div class="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-white font-mono uppercase">
                PRIORITY 3 • WARNING
              </span>
              <span class="text-xs font-mono font-bold text-slate-700">Directive ID: DIR-2026-BED</span>
            </div>
            <span class="text-xs font-mono font-bold text-slate-600">Bed Saturation Risk</span>
          </div>
          <h3 class="text-sm font-bold text-slate-900">
            Activate Secondary Triage & Overflow Corridor for District Central
          </h3>
          <p class="text-xs text-slate-600 leading-relaxed font-sans">
            Projected bed occupancy at PHC-07 reaches 104% (25/24 beds). Direct stable mild cases to the outpatient observation area and establish bed-sharing standby with PHC-06 (10 available beds, 12 km away).
          </p>
        </div>
      </div>

      <!-- ==================== HUMAN DECISION MAKER AUDIT TRAIL ==================== -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              HUMAN DECISION MAKER AUDIT TRAIL
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Cryptographically timestamped log of signed-off operational directives and approved resource reallocations.
            </p>
          </div>
          <span id="audit-count-badge" class="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
            1 Logged Action
          </span>
        </div>

        <div id="audit-trail-container" class="space-y-3">
          <div class="p-4 text-center text-xs text-slate-400 font-mono">
            Loading decision audit log...
          </div>
        </div>
      </div>

      <!-- ==================== "WHY IS THIS WARNING?" MODAL CONTAINER ==================== -->
      <div id="why-warning-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
          <div id="why-warning-modal-content">
            <!-- Injected via showWhyWarningModal -->
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRiskMatrixRows(profiles, filter) {
  let filtered = [...profiles];
  if (filter === "CRITICAL") filtered = filtered.filter(p => p.severity === "CRITICAL");
  else if (filter === "COMPOUND") filtered = filtered.filter(p => p.is_compound_risk);
  else if (filter === "EMERGING") filtered = filtered.filter(p => p.is_emerging_risk);
  else if (filter === "Central" || filter === "North" || filter === "South") filtered = filtered.filter(p => p.district.includes(filter));

  // Sort by pressure score descending
  filtered.sort((a, b) => b.pressure_score - a.pressure_score);

  return filtered.map(p => {
    let scoreBadge = "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (p.pressure_score >= 70) scoreBadge = "bg-red-100 text-red-800 border-red-200 font-black";
    else if (p.pressure_score >= 45) scoreBadge = "bg-amber-100 text-amber-800 border-amber-200 font-bold";
    else if (p.pressure_score >= 25) scoreBadge = "bg-yellow-100 text-yellow-800 border-yellow-200";

    let velocityBadge = "text-slate-500";
    if (p.velocity.code === "RAPIDLY_DETERIORATING") velocityBadge = "text-red-600 font-black flex items-center gap-1";
    else if (p.velocity.code === "DETERIORATING") velocityBadge = "text-amber-600 font-bold flex items-center gap-1";
    else if (p.velocity.code === "IMPROVING") velocityBadge = "text-emerald-600 font-bold flex items-center gap-1";

    const supplyScore = p.domain_scores.SUPPLY?.points || 0;
    const demandScore = p.domain_scores.DEMAND?.points || 0;
    const bedScore = p.domain_scores.CAPACITY?.points || 0;
    const workScore = p.domain_scores.WORKFORCE?.points || 0;

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="py-3 px-3">
          <div class="font-bold text-slate-900 font-sans">${p.phc_name}</div>
          <div class="text-[10px] text-slate-500 font-mono">${p.phc_id} • ${p.district}</div>
        </td>
        <td class="py-3 px-3">
          <span class="px-2.5 py-1 rounded text-xs font-mono border ${scoreBadge}">
            ${p.pressure_score}/100
          </span>
        </td>
        <td class="py-3 px-3">
          <div class="flex items-center gap-1.5 flex-wrap">
            ${renderStatusBadge(p.severity)}
            ${p.is_compound_risk ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">COMPOUND</span>' : ''}
            ${p.is_emerging_risk ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-800 border border-sky-200">EMERGING</span>' : ''}
          </div>
        </td>
        <td class="py-3 px-3">
          <span class="${supplyScore >= 20 ? 'text-red-600 font-bold' : supplyScore >= 10 ? 'text-amber-600' : 'text-slate-600'}">
            ${supplyScore}/30 pts
          </span>
        </td>
        <td class="py-3 px-3">
          <span class="${demandScore >= 15 ? 'text-red-600 font-bold' : demandScore >= 8 ? 'text-amber-600' : 'text-slate-600'}">
            ${demandScore}/20 pts (${p.summary_metrics.surge_percentage >= 0 ? '+' : ''}${p.summary_metrics.surge_percentage}%)
          </span>
        </td>
        <td class="py-3 px-3">
          <span class="${bedScore >= 15 ? 'text-red-600 font-bold' : bedScore >= 8 ? 'text-amber-600' : 'text-slate-600'}">
            ${bedScore}/20 pts (${p.summary_metrics.bed_occupancy_rate}%)
          </span>
        </td>
        <td class="py-3 px-3">
          <span class="${workScore >= 10 ? 'text-amber-600 font-bold' : 'text-slate-600'}">
            ${workScore}/15 pts
          </span>
        </td>
        <td class="py-3 px-3">
          <span class="${velocityBadge}">
            ${p.velocity.label}
          </span>
        </td>
        <td class="py-3 px-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onclick="window.showWhyWarningModal('${p.phc_id}')"
              class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold transition-colors"
            >
              Why Warning?
            </button>
            <a
              href="#/phc/${p.phc_id}"
              class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] transition-colors"
            >
              Digital Twin →
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Global filter handler
window.setRiskFilter = function(filter) {
  currentFilter = filter;
  const container = document.getElementById("risk-matrix-tbody");
  if (container) {
    const nationalProfile = calculateNationalRiskProfile(7);
    container.innerHTML = renderRiskMatrixRows(nationalProfile.facility_profiles, filter);
  }
};

// Global timeline selector handler
window.handleTimelinePhcChange = function(phcId) {
  selectedTimelinePhc = phcId;
  const view = document.getElementById("app-main-content");
  if (view) {
    view.innerHTML = renderEarlyWarningsView();
    mountEarlyWarningsView();
  }
};

// Global "Why This Warning?" Modal
window.showWhyWarningModal = function(phcId) {
  const profile = calculateFacilityRiskProfile(phcId, 7);
  const modal = document.getElementById("why-warning-modal");
  const content = document.getElementById("why-warning-modal-content");
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-slate-200">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-base font-black text-slate-900 font-mono">
            WHY THIS WARNING? — ${profile.phc_id} (${profile.phc_name})
          </h3>
          <span class="px-2 py-0.5 rounded text-[10px] font-black ${profile.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}">
            ${profile.severity}
          </span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">
          Deterministic scoring audit trail & threshold breach breakdown.
        </p>
      </div>
      <button 
        type="button" 
        onclick="document.getElementById('why-warning-modal').classList.add('hidden')"
        class="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
      >
        ✕
      </button>
    </div>

    <!-- Pressure Score & Velocity -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs">
      <div>
        <div class="text-[10px] text-slate-500 uppercase">Facility Pressure Score</div>
        <div class="text-2xl font-black ${profile.pressure_score >= 70 ? 'text-red-600' : 'text-slate-900'}">
          ${profile.pressure_score}/100
        </div>
      </div>
      <div>
        <div class="text-[10px] text-slate-500 uppercase">Risk Velocity</div>
        <div class="text-sm font-bold text-slate-800 mt-1">${profile.velocity.label}</div>
        <div class="text-[10px] text-slate-400">${profile.velocity.description}</div>
      </div>
      <div>
        <div class="text-[10px] text-slate-500 uppercase">Compound Risk</div>
        <div class="text-sm font-bold ${profile.is_compound_risk ? 'text-purple-700' : 'text-slate-600'} mt-1">
          ${profile.is_compound_risk ? 'YES (Multi-Domain)' : 'NO (Isolated)'}
        </div>
      </div>
    </div>

    <!-- Domain Score Contributions -->
    <div class="space-y-3 text-xs">
      <h4 class="font-bold text-slate-900 font-mono uppercase text-[11px] tracking-wider">
        DOMAIN SCORE BREAKDOWN (TOTAL: 100 POINTS)
      </h4>
      <div class="space-y-2">
        ${Object.entries(profile.domain_scores).map(([domain, data]) => {
          const pct = Math.round((data.points / data.max_points) * 100);
          return `
            <div class="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <div class="flex items-center justify-between font-mono">
                <span class="font-bold text-slate-800">${domain} (Weight: ${data.weight_pct}%)</span>
                <span class="font-black ${data.points > (data.max_points * 0.6) ? 'text-red-600' : 'text-slate-700'}">
                  ${data.points} / ${data.max_points} pts (${data.severity})
                </span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full ${data.points > (data.max_points * 0.6) ? 'bg-red-500' : data.points > (data.max_points * 0.3) ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${pct}%"></div>
              </div>
              <p class="text-[11px] text-slate-500 font-sans mt-1">${data.notes}</p>
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <!-- Threshold Breaches -->
    <div class="space-y-2 text-xs">
      <h4 class="font-bold text-slate-900 font-mono uppercase text-[11px] tracking-wider">
        DETERMINISTIC THRESHOLDS BREACHED
      </h4>
      <div class="p-3 bg-red-50/50 rounded-lg border border-red-200 text-[11px] text-slate-700 space-y-1 font-sans">
        ${profile.is_compound_risk ? `
          <div>• <strong>Compound Hazard</strong>: 3+ domains simultaneously in WARNING/CRITICAL state.</div>
        ` : ''}
        ${profile.domain_scores.SUPPLY?.points >= 20 ? `
          <div>• <strong>Supply Risk</strong>: Stock coverage is below critical safety threshold (&lt;3.0 days).</div>
        ` : ''}
        ${profile.domain_scores.DEMAND?.points >= 15 ? `
          <div>• <strong>Demand Surge</strong>: Patient inflow exceeds 7-day baseline by &gt;20% (+${profile.summary_metrics.surge_percentage}% observed).</div>
        ` : ''}
        ${profile.domain_scores.CAPACITY?.points >= 15 ? `
          <div>• <strong>Bed Saturation</strong>: Inpatient bed occupancy exceeds 90% threshold (${profile.summary_metrics.bed_occupancy_rate}% observed).</div>
        ` : ''}
        ${profile.domain_scores.DELIVERY?.points >= 8 ? `
          <div>• <strong>Delivery Risk</strong>: Next replenishment delivery is outside the current stock depletion window.</div>
        ` : ''}
      </div>
    </div>

    <!-- Action Bar -->
    <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
      <a 
        href="#/phc/${profile.phc_id}" 
        onclick="document.getElementById('why-warning-modal').classList.add('hidden')"
        class="text-xs font-bold text-indigo-700 hover:text-indigo-800"
      >
        Open ${profile.phc_id} Digital Twin →
      </a>
      <button
        type="button"
        onclick="document.getElementById('why-warning-modal').classList.add('hidden')"
        class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold font-mono"
      >
        Close
      </button>
    </div>
  `;

  modal.classList.remove("hidden");
};

// Global Alert Lifecycle Actions
window.handleAcknowledgeAlert = async function(alertId) {
  acknowledgeAlert(alertId, "District Health Officer");
  try {
    await fetch("/api/alerts/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_id: alertId, user_role: "District Health Officer", notes: "Acknowledged via Early Warning Centre." })
    });
  } catch (e) {
    console.warn("Could not sync with server endpoint:", e);
  }

  // Re-render
  const view = document.getElementById("app-main-content");
  if (view) {
    view.innerHTML = renderEarlyWarningsView();
    mountEarlyWarningsView();
  }
};

window.handleResolveAlert = async function(alertId) {
  const note = prompt("Enter resolution notes:", "Operational action verified and executed.");
  if (note === null) return; // user cancelled

  resolveAlert(alertId, note, "Chief Medical Officer");
  try {
    await fetch("/api/alerts/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alert_id: alertId, user_role: "Chief Medical Officer", resolution_note: note })
    });
  } catch (e) {
    console.warn("Could not sync with server endpoint:", e);
  }

  // Re-render
  const view = document.getElementById("app-main-content");
  if (view) {
    view.innerHTML = renderEarlyWarningsView();
    mountEarlyWarningsView();
  }
};

// Global handler for approving directives directly from the page
window.handleExecuteDirective = async function(dirId, source, target, resource, quantity) {
  const container = document.getElementById(`action-container-${dirId}`);
  if (container) {
    container.innerHTML = `
      <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-mono w-full">
        <div class="font-bold flex items-center gap-1.5">
          <span class="text-emerald-600 font-black">✓</span> DIRECTIVE EXECUTED & APPROVED
        </div>
        <div class="text-[11px] text-emerald-700 mt-1 font-sans">
          Confirmed: <strong>${quantity} units of ${resource}</strong> from ${source} to ${target}.
          Dispatch notification transmitted to regional supply logistics hub.
        </div>
      </div>
    `;
  }

  await submitHumanAction({
    action_type: "DIRECTIVE_APPROVED",
    target: target,
    source: source,
    resource: resource,
    quantity: quantity,
    user_role: "Chief Medical Officer",
    notes: `Approved via AI Early Warnings Command Center.`
  });

  // Refresh audit log
  mountEarlyWarningsView();
};

export async function mountEarlyWarningsView() {
  const container = document.getElementById("audit-trail-container");
  const countBadge = document.getElementById("audit-count-badge");
  if (!container) return;

  const decisions = await fetchHumanDecisions();
  if (countBadge) countBadge.textContent = `${decisions.length} Logged Actions`;

  if (decisions.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-400 font-mono">
        No decisions recorded yet.
      </div>
    `;
    return;
  }

  container.innerHTML = decisions.map(d => `
    <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-900">${d.id}</span>
          <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ${d.status}
          </span>
          <span class="text-slate-400 text-[11px]">${d.timestamp}</span>
        </div>
        <div class="text-slate-800 font-sans font-semibold">
          ${d.action_type}: ${d.quantity} units of ${d.resource} (${d.source} → ${d.target})
        </div>
        <div class="text-slate-500 font-sans text-[11px]">
          ${d.notes}
        </div>
      </div>

      <div class="text-right flex-shrink-0">
        <div class="text-[11px] text-slate-400">Signed By:</div>
        <div class="font-bold text-slate-800">${d.user_role}</div>
      </div>
    </div>
  `).join("");
}
