/**
 * SwasthyaGrid AI — Reusable Bed Capacity Panel / Card
 * Uses calculations.js bedOccupancy(phc)
 */

import { bedOccupancy } from "../../logic/calculations.js";
import { renderStatusBadge } from "./PHCStatusBadge.js";

export function renderBedCapacityCard(phc) {
  const metrics = bedOccupancy(phc);
  const isCritical = metrics.status === "CRITICAL";
  const isWarning = metrics.status === "WARNING";

  let progressColor = "bg-emerald-500";
  let alertBanner = "";

  if (isCritical) {
    progressColor = "bg-red-600";
    alertBanner = `
      <div class="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
        <svg class="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
        <div>
          <span class="font-bold">CRITICAL INPATIENT SATURATION:</span>
          Only ${metrics.availableBeds} bed${metrics.availableBeds === 1 ? "" : "s"} remaining. Influx rate exceeds discharge velocity. Triage saturation imminent.
        </div>
      </div>
    `;
  } else if (isWarning) {
    progressColor = "bg-amber-500";
    alertBanner = `
      <div class="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
        <svg class="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
        <div>
          <span class="font-bold">HIGH OCCUPANCY WARNING:</span>
          Occupancy above 80%. Consider preparing contingency overflow beds.
        </div>
      </div>
    `;
  }

  return `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Bed Capacity & Inpatient Status</h3>
          <p class="text-xs text-slate-500">Real-time ward telemetry and occupancy tracking</p>
        </div>
        ${renderStatusBadge(metrics.status)}
      </div>

      <!-- Capacity Visual Progress Bar -->
      <div class="space-y-2">
        <div class="flex justify-between text-xs font-semibold text-slate-700">
          <span>Occupancy: ${metrics.occupancyPercentage}%</span>
          <span>${metrics.occupiedBeds} / ${metrics.totalBeds} Beds Occupied</span>
        </div>
        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div class="${progressColor} h-full transition-all duration-500" style="width: ${Math.min(metrics.occupancyPercentage, 100)}%"></div>
        </div>
      </div>

      <!-- Grid of numbers -->
      <div class="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
        <div class="bg-slate-50 p-2.5 rounded-lg">
          <div class="text-[11px] text-slate-500 font-medium">Total Beds</div>
          <div class="text-xl font-bold text-slate-900 mt-0.5">${metrics.totalBeds}</div>
        </div>
        <div class="bg-slate-50 p-2.5 rounded-lg">
          <div class="text-[11px] text-slate-500 font-medium">Occupied Beds</div>
          <div class="text-xl font-bold text-slate-900 mt-0.5">${metrics.occupiedBeds}</div>
        </div>
        <div class="p-2.5 rounded-lg ${isCritical ? "bg-red-50 border border-red-200" : "bg-slate-50"}">
          <div class="text-[11px] ${isCritical ? "text-red-700 font-bold" : "text-slate-500 font-medium"}">Available Beds</div>
          <div class="text-xl font-bold ${isCritical ? "text-red-600 animate-pulse" : "text-emerald-700"} mt-0.5">
            ${metrics.availableBeds}
          </div>
        </div>
      </div>

      ${alertBanner}
    </div>
  `;
}
