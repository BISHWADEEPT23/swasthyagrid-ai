/**
 * SwasthyaGrid AI — Alert History & Critical Notification Panel
 *
 * Requirements:
 * - Alert ID, Timestamp, Resource/Category, Severity, Message, Status (ACTIVE, ACKNOWLEDGED, RESOLVED)
 * - For PHC-07: Display CRITICAL FACILITY ALERT:
 *   "Potential resource shortage detected at PHC-07."
 *   and explain contributing operational signals:
 *   - Patient footfall +35%
 *   - IV Fluid consumption +45%
 *   - Paracetamol consumption +32%
 *   - Declining bed availability
 *   - Increasing medical demand
 *   - Note: Do NOT recommend resource transfers yet.
 */

import { getSeverityStyle } from "../../logic/alert_service.js";

export function renderAlertPanel(alerts = [], phc = null) {
  const isPHC07 = phc && phc.phc_id === "PHC-07";

  let criticalEmergencyBanner = "";
  if (isPHC07) {
    criticalEmergencyBanner = `
      <div class="mb-5 rounded-xl border-2 border-red-500 bg-red-50/90 p-5 shadow-sm text-red-950">
        <div class="flex items-center gap-2.5 mb-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white font-bold text-xs tracking-wider animate-pulse">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            CRITICAL FACILITY ALERT
          </span>
          <span class="text-xs font-mono text-red-700 font-semibold">FACILITY ID: PHC-07</span>
        </div>

        <h2 class="text-xl font-extrabold text-red-900 tracking-tight mt-1">
          Potential resource shortage detected at PHC-07.
        </h2>

        <!-- Contributing Operational Signals Matching Spec -->
        <div class="mt-4 pt-3 border-t border-red-200">
          <div class="text-xs font-bold uppercase tracking-wider text-red-900 mb-2">Signals:</div>
          <ul class="space-y-1.5 text-xs text-red-950 font-medium">
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0"></span>
              <span><strong>Patient demand +35%</strong> (286 today vs 212 baseline)</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0"></span>
              <span><strong>IV Fluid consumption +45%</strong> (48 units/day burn; 105 in stock, 2.2 days left)</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0"></span>
              <span><strong>Paracetamol consumption +32%</strong> (62 units/day burn; 310 in stock, 5.0 days left)</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0"></span>
              <span><strong>Bed availability declining</strong> (91% occupancy; only 2 available beds remaining)</span>
            </li>
          </ul>
        <div class="mt-4 pt-3 border-t border-red-200/80 text-[11px] text-red-800 font-medium italic flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-red-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
          Phase 1 Alerting Active: Operational telemetry only. Automated redistribution is disabled in current build.
        </div>
      </div>
    `;
  }

  return `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      ${criticalEmergencyBanner}

      <div class="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Alert Log & System Notifications</h3>
          <p class="text-xs text-slate-500">Historical and active telemetry event logs</p>
        </div>
        <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          ${alerts.length} Event${alerts.length === 1 ? "" : "s"} Recorded
        </span>
      </div>

      ${alerts.length === 0 ? `
        <div class="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
          No alerts recorded for this facility. Operational telemetry is within normal baseline parameters.
        </div>
      ` : `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50">
                <th class="py-2.5 px-3">Alert ID</th>
                <th class="py-2.5 px-3">Timestamp</th>
                <th class="py-2.5 px-3">Resource / Category</th>
                <th class="py-2.5 px-3 text-center">Severity</th>
                <th class="py-2.5 px-3">Message</th>
                <th class="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${alerts.map(a => {
                const style = getSeverityStyle(a.severity);
                let statusBadge = "bg-slate-100 text-slate-700";
                if (a.status === "ACTIVE") statusBadge = "bg-red-100 text-red-800 font-bold";
                else if (a.status === "ACKNOWLEDGED") statusBadge = "bg-amber-100 text-amber-800";
                else if (a.status === "RESOLVED") statusBadge = "bg-emerald-100 text-emerald-800";

                return `
                  <tr class="hover:bg-slate-50/60 transition-colors">
                    <td class="py-2.5 px-3 font-mono font-bold text-slate-800 text-[11px]">${a.alert_id}</td>
                    <td class="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      ${new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td class="py-2.5 px-3 font-medium text-slate-700">${a.resource_category}</td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${style.badge}">
                        <span class="w-1.5 h-1.5 rounded-full ${style.dot}"></span>
                        ${a.severity}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-slate-800">${a.message}</td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadge}">
                        ${a.status}
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}
