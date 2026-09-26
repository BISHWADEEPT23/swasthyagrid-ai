/**
 * SwasthyaGrid AI — Medicine Inventory Table Component (Build 03)
 *
 * Used in PHC Digital Twin operational drill-down and reports.
 * Displays:
 * - Medicine Name & Category
 * - Current Stock
 * - Daily Consumption
 * - Days of Stock (calculated)
 * - Safety Stock
 * - Next Delivery Date
 * - Estimated Stock-out Date
 * - Supply Risk Status Badge
 */

import { 
  calculateDaysOfStock, 
  classifySupplyRisk, 
  calculateEstimatedStockoutDate, 
  calculateDeliveryRisk 
} from "../../logic/supply_chain_engine.js";

export function renderMedicineInventoryTable(inventory = [], title = "Medicine Inventory", subtitle = "Real-time stock, burn rates, and replenishment runway") {
  return `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">${title}</h3>
          <p class="text-xs text-slate-500">${subtitle}</p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded font-mono">
            ${inventory.length} Core Items Tracked
          </span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50 text-[11px]">
              <th class="py-2.5 px-3">Medicine</th>
              <th class="py-2.5 px-3">Category</th>
              <th class="py-2.5 px-3 text-right">Current Stock</th>
              <th class="py-2.5 px-3 text-right">Daily Burn</th>
              <th class="py-2.5 px-3 text-right">Days of Stock</th>
              <th class="py-2.5 px-3 text-right">Safety Stock</th>
              <th class="py-2.5 px-3 text-center">Next Delivery</th>
              <th class="py-2.5 px-3 text-center">Estimated Stockout</th>
              <th class="py-2.5 px-3 text-center">Supply Risk</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-[11px]">
            ${inventory.map(item => {
              const days = calculateDaysOfStock(item.current_stock, item.daily_consumption);
              const risk = classifySupplyRisk(item);
              const delRisk = calculateDeliveryRisk(item);
              const estDate = calculateEstimatedStockoutDate(item.current_stock, item.daily_consumption);
              const isUrgent = risk.level === "CRITICAL";

              return `
                <tr class="hover:bg-slate-50/80 transition-colors ${isUrgent ? "bg-red-50/30" : ""}">
                  <td class="py-2.5 px-3 font-sans font-semibold text-slate-900">
                    ${item.medicine_name}
                  </td>
                  <td class="py-2.5 px-3 font-sans text-slate-500 text-[11px]">
                    ${item.category}
                  </td>
                  <td class="py-2.5 px-3 text-right font-bold ${isUrgent ? "text-red-700" : "text-slate-800"}">
                    ${Number(item.current_stock).toLocaleString()}
                  </td>
                  <td class="py-2.5 px-3 text-right text-slate-700">
                    ${Number(item.daily_consumption).toLocaleString()}
                  </td>
                  <td class="py-2.5 px-3 text-right">
                    <span class="px-2 py-0.5 rounded font-bold ${days <= 3 ? "bg-red-100 text-red-800 animate-pulse" : (days <= 7 ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-800")}">
                      ${days.toFixed(1)} d
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right text-slate-600">
                    ${Number(item.minimum_safety_stock).toLocaleString()}
                  </td>
                  <td class="py-2.5 px-3 text-center text-slate-600 text-[11px]">
                    ${item.next_delivery_date ? new Date(item.next_delivery_date).toLocaleDateString([], { month: "short", day: "numeric" }) : "-"}
                  </td>
                  <td class="py-2.5 px-3 text-center text-[11px] ${days <= 3 ? "text-red-600 font-bold" : "text-slate-600"}">
                    ${estDate.toLocaleDateString([], { month: "short", day: "numeric" })}
                  </td>
                  <td class="py-2.5 px-3 text-center font-sans">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${risk.badgeClass}">
                      <span class="w-1.5 h-1.5 rounded-full ${risk.dotClass}"></span>
                      ${risk.level}
                    </span>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <div class="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-sans">
        <div>
          Deterministic Engine: <code class="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[10px]">Days of Stock = Current Stock / Daily Consumption</code>
        </div>
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Normal (&gt;14d)</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Watch (7-14d)</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Warning (3-7d)</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-600"></span> Critical (&le;3d)</span>
        </div>
      </div>
    </div>
  `;
}
