/**
 * SwasthyaGrid AI — Health Network Status Panel Component
 * Displays operational status distribution across districts and facilities.
 */

import { PHC_DATASET, DISTRICTS } from "../../data/phc_dataset.js";
import { renderStatusBadge } from "./PHCStatusBadge.js";

export function renderNetworkStatusPanel() {
  const counts = {
    NORMAL: PHC_DATASET.filter(p => p.operational_status === "NORMAL").length,
    WATCH: PHC_DATASET.filter(p => p.operational_status === "WATCH").length,
    WARNING: PHC_DATASET.filter(p => p.operational_status === "WARNING").length,
    CRITICAL: PHC_DATASET.filter(p => p.operational_status === "CRITICAL").length
  };

  return `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Health Network Status</h3>
          <span class="text-xs font-semibold text-slate-500">12 PHCs Total</span>
        </div>

        <!-- Status Pill Summary -->
        <div class="grid grid-cols-4 gap-2 mb-4 text-center">
          <div class="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
            <div class="text-[10px] font-bold text-emerald-800 uppercase">Normal</div>
            <div class="text-lg font-extrabold text-emerald-700 mt-0.5">${counts.NORMAL}</div>
          </div>
          <div class="p-2 rounded-lg bg-amber-50 border border-amber-100">
            <div class="text-[10px] font-bold text-amber-800 uppercase">Watch</div>
            <div class="text-lg font-extrabold text-amber-700 mt-0.5">${counts.WATCH}</div>
          </div>
          <div class="p-2 rounded-lg bg-amber-100 border border-amber-200">
            <div class="text-[10px] font-bold text-amber-900 uppercase">Warning</div>
            <div class="text-lg font-extrabold text-amber-800 mt-0.5">${counts.WARNING}</div>
          </div>
          <div class="p-2 rounded-lg bg-red-100 border border-red-200">
            <div class="text-[10px] font-bold text-red-900 uppercase">Critical</div>
            <div class="text-lg font-extrabold text-red-700 mt-0.5 animate-pulse">${counts.CRITICAL}</div>
          </div>
        </div>

        <!-- District Breakdown -->
        <div class="space-y-3">
          ${DISTRICTS.map(district => {
            const districtPhcs = PHC_DATASET.filter(p => p.district === district);
            return `
              <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div class="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                  <span>${district}</span>
                  <span class="text-[11px] text-slate-500 font-normal">4 Facilities</span>
                </div>
                <div class="grid grid-cols-4 gap-1.5">
                  ${districtPhcs.map(phc => `
                    <div 
                      onclick="window.location.hash = '#/phc/${phc.phc_id}'"
                      class="cursor-pointer p-1.5 rounded bg-white border border-slate-200 hover:border-sky-500 text-center transition-colors"
                      title="${phc.phc_name} (${phc.operational_status})"
                    >
                      <div class="text-[10px] font-mono font-bold text-slate-700">${phc.phc_id}</div>
                      <div class="mt-1 flex justify-center">${renderStatusBadge(phc.operational_status)}</div>
                    </div>
                  `).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 text-right">
        <a href="#/network" class="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center justify-end gap-1">
          Open Full Network Directory →
        </a>
      </div>
    </div>
  `;
}
