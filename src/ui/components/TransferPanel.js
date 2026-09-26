/**
 * SwasthyaGrid AI — Recommended Resource Transfers Panel (National Dashboard)
 * Advisory display only; automated execution is disabled in this prototype.
 */

import { getRecommendedTransfers } from "../../logic/transfer_service.js";

export function renderTransferPanel() {
  const transfers = getRecommendedTransfers();

  return `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Recommended Resource Transfers</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
              OPTIMIZED MUTUAL AID
            </span>
          </div>
          <p class="text-xs text-slate-500">Cross-facility balance suggestions to mitigate stockouts without depleting source facilities</p>
        </div>
        <div class="flex items-center gap-2">
          <a
            href="#/redistribution"
            class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors border border-indigo-200 flex items-center gap-1"
          >
            Open Redistribution Hub →
          </a>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50">
              <th class="py-2.5 px-3">Transfer ID</th>
              <th class="py-2.5 px-3">Source Facility (Surplus)</th>
              <th class="py-2.5 px-3">Target Facility (Deficit)</th>
              <th class="py-2.5 px-3">Resource & Quantity</th>
              <th class="py-2.5 px-3 text-center">Transit ETA</th>
              <th class="py-2.5 px-3">Projected Impact</th>
              <th class="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${transfers.map(tx => `
              <tr class="hover:bg-slate-50/70 transition-colors">
                <td class="py-2.5 px-3 font-mono font-bold text-slate-800 text-[11px]">${tx.transfer_id}</td>
                <td class="py-2.5 px-3">
                  <div class="font-bold text-slate-900">${tx.source_phc_id}</div>
                  <div class="text-[11px] text-slate-500">${tx.source_phc_name}</div>
                </td>
                <td class="py-2.5 px-3">
                  <div class="font-bold text-slate-900">${tx.target_phc_id}</div>
                  <div class="text-[11px] text-slate-500">${tx.target_phc_name}</div>
                </td>
                <td class="py-2.5 px-3">
                  <div class="font-semibold text-slate-900">${tx.medicine_name || tx.resource}</div>
                  <div class="font-mono text-sky-700 font-bold text-[11px]">${tx.recommended_quantity || tx.quantity} Units</div>
                </td>
                <td class="py-2.5 px-3 text-center font-mono font-bold text-slate-700 text-[11px]">
                  ${tx.logistics?.transit_time_label || tx.estimated_transit_time || "45 mins"}
                </td>
                <td class="py-2.5 px-3 text-[11px] text-slate-600 max-w-xs">
                  ${tx.impact_summary || tx.impact}
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${tx.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : tx.status === 'IN_TRANSIT' ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}">
                    ${tx.status}
                  </span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
