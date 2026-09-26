/**
 * SwasthyaGrid AI — Reusable PHCCard Component
 * Used in PHC Network directory view.
 * Clicking navigates to the PHC Digital Twin view.
 */

import { renderStatusBadge } from "./PHCStatusBadge.js";
import { staffAvailability } from "../../logic/calculations.js";

export function renderPHCCard(phc) {
  const staff = staffAvailability(phc);
  const isCritical = phc.operational_status === "CRITICAL";
  const isWarning = phc.operational_status === "WARNING";

  let cardBorder = "border-slate-200 hover:border-sky-500 hover:shadow-md";
  if (isCritical) {
    cardBorder = "border-red-300 ring-1 ring-red-200 bg-red-50/10 hover:border-red-500 hover:shadow-md";
  } else if (isWarning) {
    cardBorder = "border-amber-300 bg-amber-50/10 hover:border-amber-500 hover:shadow-md";
  }

  return `
    <div 
      onclick="window.location.hash = '#/phc/${phc.phc_id}'"
      class="group cursor-pointer rounded-xl border ${cardBorder} bg-white p-5 transition-all duration-200 flex flex-col justify-between"
      role="button"
      tabindex="0"
      aria-label="View digital twin for ${phc.phc_name}"
    >
      <!-- Card Header -->
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              ${phc.phc_id}
            </span>
            <span class="text-xs text-slate-500 font-medium">${phc.district}</span>
          </div>
          ${renderStatusBadge(phc.operational_status)}
        </div>

        <h3 class="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
          ${phc.phc_name}
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">${phc.facility_type} • Pop: ${phc.population_served.toLocaleString()}</p>
      </div>

      <!-- Card Metrics Grid -->
      <div class="grid grid-cols-2 gap-2.5 my-4 pt-3 border-t border-slate-100 text-xs">
        <div class="bg-slate-50/80 rounded-lg p-2">
          <div class="text-[11px] text-slate-500">Patients Today</div>
          <div class="text-sm font-bold text-slate-900 mt-0.5">${phc.patients_today}</div>
          <div class="text-[10px] text-slate-400">Avg: ${phc.patients_7day_average}</div>
        </div>

        <div class="bg-slate-50/80 rounded-lg p-2">
          <div class="text-[11px] text-slate-500">Available Beds</div>
          <div class="text-sm font-bold ${phc.available_beds <= 2 ? "text-red-600 font-extrabold" : "text-slate-900"} mt-0.5">
            ${phc.available_beds} <span class="text-[11px] font-normal text-slate-500">/ ${phc.total_beds}</span>
          </div>
          <div class="text-[10px] text-slate-400">Total beds</div>
        </div>

        <div class="bg-slate-50/80 rounded-lg p-2">
          <div class="text-[11px] text-slate-500">Medicine Stock</div>
          <div class="text-sm font-bold ${phc.medicine_availability_percentage < 75 ? "text-red-600" : "text-slate-900"} mt-0.5">
            ${phc.medicine_availability_percentage}%
          </div>
          <div class="text-[10px] text-slate-400">10 essential meds</div>
        </div>

        <div class="bg-slate-50/80 rounded-lg p-2">
          <div class="text-[11px] text-slate-500">Staff Present</div>
          <div class="text-sm font-bold ${staff.staffAvailabilityPercentage < 80 ? "text-amber-600" : "text-slate-900"} mt-0.5">
            ${staff.staffAvailabilityPercentage}%
          </div>
          <div class="text-[10px] text-slate-400">${staff.totalPresent}/${staff.totalRequired} active</div>
        </div>
      </div>

      <!-- Card Footer -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <div class="flex items-center gap-1.5">
          ${phc.active_alerts > 0 
            ? `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                <svg class="w-3 h-3 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                ${phc.active_alerts} Alert${phc.active_alerts > 1 ? "s" : ""}
               </span>`
            : `<span class="text-[11px] text-slate-500 flex items-center gap-1">
                <svg class="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                Telemetry Normal
               </span>`
          }
        </div>
        <span class="text-sky-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
          Digital Twin →
        </span>
      </div>
    </div>
  `;
}
