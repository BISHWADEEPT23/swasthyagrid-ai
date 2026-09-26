/**
 * SwasthyaGrid AI — Consolidated Audit Centre & Data Quality View
 * Route: #/audit
 *
 * Provides:
 * 1. Data Quality Scorecard (Validation status, records checked, zero errors)
 * 2. Filterable Audit Events Table (Alerts, Transfers, Simulations, Federation, AI)
 */

import { getAuditEvents } from "../../logic/audit_service.js";
import { validatePlatformData } from "../../logic/data_quality_service.js";
import { getPlatformHealth } from "../../logic/system_health_service.js";

export function renderAuditView() {
  const auditEvents = getAuditEvents();
  const quality = validatePlatformData();
  const health = getPlatformHealth();

  return `
    <div class="space-y-6 pb-16 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-white">
              AUDIT & GOVERNANCE
            </span>
            <span class="text-xs text-slate-500 font-mono">RECORDS: ${auditEvents.length}</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight mt-1">
            Consolidated Platform Audit Centre
          </h2>
          <p class="text-xs text-slate-500">
            Immutable log of human approvals, simulation runs, federated learning rounds, and data quality telemetry
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            onclick="window.handleResetDemo ? window.handleResetDemo() : location.reload()"
            class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            title="Reset Audit Log to Deterministic Baseline"
          >
            <span>Reset Log</span>
          </button>
        </div>
      </div>

      <!-- Data Quality Scorecard Widget -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
            <span>Data Quality & Schema Validation Scorecard</span>
            <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              STATUS: ${quality.status}
            </span>
          </h3>
          <span class="text-xs font-mono font-bold text-emerald-700">Integrity Score: ${quality.score_pct}%</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div class="text-[10px] font-mono text-slate-500 uppercase">Records Validated</div>
            <div class="text-base font-bold text-slate-900 mt-0.5">${quality.records_checked}</div>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div class="text-[10px] font-mono text-slate-500 uppercase">Validation Errors</div>
            <div class="text-base font-bold text-emerald-600 mt-0.5">${quality.errors_count}</div>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div class="text-[10px] font-mono text-slate-500 uppercase">Integrity Warnings</div>
            <div class="text-base font-bold text-slate-700 mt-0.5">${quality.warnings_count}</div>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div class="text-[10px] font-mono text-slate-500 uppercase">Missing Values</div>
            <div class="text-base font-bold text-slate-700 mt-0.5">${quality.missing_values_count}</div>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div class="text-[10px] font-mono text-slate-500 uppercase">Data Freshness</div>
            <div class="text-base font-bold text-emerald-700 mt-0.5">${quality.freshness.freshness_status}</div>
          </div>
        </div>
      </div>

      <!-- Audit Events Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
            Platform Activity & Human Actions Log
          </h3>
          <span class="text-xs text-slate-500 font-mono">Showing ${auditEvents.length} events</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">Event ID / Time</th>
                <th class="px-4 py-3">Type</th>
                <th class="px-4 py-3">Entity</th>
                <th class="px-4 py-3">Actor / Role</th>
                <th class="px-4 py-3">Details</th>
                <th class="px-4 py-3">Severity</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${auditEvents.map(evt => {
                let badgeClass = "bg-slate-100 text-slate-700";
                if (evt.severity === "CRITICAL") badgeClass = "bg-red-100 text-red-800 border-red-200";
                else if (evt.severity === "WARNING") badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                else if (evt.severity === "INFO") badgeClass = "bg-sky-100 text-sky-800 border-sky-200";

                return `
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="px-4 py-3 font-mono">
                      <div class="font-bold text-slate-900">${evt.id}</div>
                      <div class="text-[10px] text-slate-400">${new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td class="px-4 py-3 font-mono font-bold text-slate-800 text-[11px]">
                      ${evt.event_type}
                    </td>
                    <td class="px-4 py-3 font-mono text-slate-700">
                      ${evt.entity}
                    </td>
                    <td class="px-4 py-3 text-slate-600">
                      ${evt.user_role}
                    </td>
                    <td class="px-4 py-3 text-slate-600 max-w-md leading-relaxed">
                      ${evt.details}
                    </td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${badgeClass}">
                        ${evt.severity}
                      </span>
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
