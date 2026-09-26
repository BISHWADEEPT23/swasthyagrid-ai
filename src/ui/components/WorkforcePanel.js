/**
 * SwasthyaGrid AI — Workforce Operational Availability Panel
 *
 * Requirements:
 * - Doctors: Required, Present, Gap
 * - Nurses: Required, Present, Gap
 * - Pharmacists: Required, Present, Gap
 * - Calculate: staff_availability_percentage via staffAvailability()
 * - Do not diagnose clinical staffing adequacy. Only report operational availability against configured requirements.
 */

import { staffAvailability } from "../../logic/calculations.js";
import { renderStatusBadge } from "./PHCStatusBadge.js";

export function renderWorkforcePanel(phc) {
  const staff = staffAvailability(phc);

  const roles = [
    { title: "Doctors", ...staff.doctors },
    { title: "Nurses", ...staff.nurses },
    { title: "Pharmacists", ...staff.pharmacists }
  ];

  return `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Workforce Availability</h3>
          <p class="text-xs text-slate-500">Operational clinical roster reporting against configured facility norms</p>
        </div>
        ${renderStatusBadge(staff.status)}
      </div>

      <!-- Staff Availability Headline -->
      <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 mb-4">
        <div>
          <div class="text-xs text-slate-500 font-medium">Overall Staff Availability</div>
          <div class="text-2xl font-bold text-slate-900 mt-0.5">
            ${staff.staffAvailabilityPercentage}%
          </div>
        </div>
        <div class="text-right text-xs">
          <span class="font-bold text-slate-800">${staff.totalPresent}</span> of <span class="text-slate-600">${staff.totalRequired}</span> Present
          ${staff.totalGap > 0 ? `<div class="text-amber-600 font-semibold mt-0.5">${staff.totalGap} Staff Shortfall</div>` : `<div class="text-emerald-600 font-semibold mt-0.5">Full Attendance</div>`}
        </div>
      </div>

      <!-- Role-wise breakdown table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th class="py-2 px-3">Role</th>
              <th class="py-2 px-3 text-center">Required</th>
              <th class="py-2 px-3 text-center">Present</th>
              <th class="py-2 px-3 text-center">Gap</th>
              <th class="py-2 px-3 text-right">Fulfillment</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${roles.map(r => {
              const pct = r.required > 0 ? Math.round((r.present / r.required) * 100) : 100;
              const hasGap = r.gap > 0;
              return `
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-2.5 px-3 font-semibold text-slate-800">${r.title}</td>
                  <td class="py-2.5 px-3 text-center text-slate-600">${r.required}</td>
                  <td class="py-2.5 px-3 text-center font-bold text-slate-900">${r.present}</td>
                  <td class="py-2.5 px-3 text-center">
                    ${hasGap ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">-${r.gap}</span>` : `<span class="text-slate-400">0</span>`}
                  </td>
                  <td class="py-2.5 px-3 text-right">
                    <span class="font-semibold ${pct < 80 ? "text-amber-700 font-bold" : "text-slate-700"}">${pct}%</span>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <div class="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
        * System reports operational attendance against configured staffing norms. Clinical adequacy is subject to local triage protocols.
      </div>
    </div>
  `;
}
