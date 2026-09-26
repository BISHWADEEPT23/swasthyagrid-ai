/**
 * SwasthyaGrid AI — Medicine Supply Risk Panel Component
 * Highlights critical stock shortages and rapid burn rate risks across the network.
 */

import { getNetworkSupplyRisks } from "../../logic/inventory_service.js";
import { getStockStatusInfo } from "../../logic/calculations.js";

export function renderMedicineRiskPanel() {
  const risks = getNetworkSupplyRisks().slice(0, 5); // Top 5 critical items

  return `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Medicine Supply Risks</h3>
            <p class="text-xs text-slate-500">Facilities with urgent stockout trajectory</p>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">
            ${risks.length} At-Risk Items
          </span>
        </div>

        <div class="space-y-2.5">
          ${risks.map(item => {
            const statusInfo = getStockStatusInfo(item.stock_status, item.days_of_stock);
            const isCritical = item.stock_status === "CRITICAL" || item.days_of_stock < 2;

            return `
              <div 
                onclick="window.location.hash = '#/phc/${item.phc_id}'"
                class="cursor-pointer p-3 rounded-lg border ${isCritical ? "border-red-200 bg-red-50/40" : "border-slate-100 bg-slate-50"} hover:border-sky-400 transition-colors flex items-center justify-between gap-2"
              >
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-800">
                      ${item.phc_id}
                    </span>
                    <span class="text-xs font-bold text-slate-900">${item.medicine_name}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-1">
                    Burn: <span class="font-mono text-slate-700">${item.daily_consumption}/day</span> • Stock: <span class="font-mono text-slate-700">${item.current_stock}</span>
                  </div>
                </div>

                <div class="text-right flex flex-col items-end">
                  <span class="text-xs font-mono font-bold ${isCritical ? "text-red-700 font-extrabold animate-pulse" : "text-amber-800"}">
                    ${item.days_of_stock} Days Left
                  </span>
                  <span class="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded mt-1 border ${statusInfo.badgeClass}">
                    ${statusInfo.label}
                  </span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span class="text-slate-400 text-[11px]">Updated every 15 mins from inventory nodes</span>
        <a href="#/inventory" class="font-semibold text-sky-700 hover:text-sky-800">
          View All Inventory →
        </a>
      </div>
    </div>
  `;
}
