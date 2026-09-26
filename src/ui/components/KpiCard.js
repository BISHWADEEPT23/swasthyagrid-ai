/**
 * SwasthyaGrid AI — Reusable Top KPI Card Component
 */

export function renderKpiCard({ title, value, subtext, status, badge, iconSvg }) {
  let statusBorder = "border-slate-200";
  let statusBg = "bg-white";
  let badgeClass = "bg-slate-100 text-slate-700";

  if (status === "CRITICAL") {
    statusBorder = "border-red-300 ring-1 ring-red-200";
    statusBg = "bg-red-50/20";
    badgeClass = "bg-red-100 text-red-800 font-bold";
  } else if (status === "WARNING") {
    statusBorder = "border-amber-300";
    statusBg = "bg-amber-50/20";
    badgeClass = "bg-amber-100 text-amber-800";
  } else if (status === "WATCH") {
    statusBorder = "border-blue-200";
    badgeClass = "bg-blue-100 text-blue-800";
  } else if (status === "NORMAL") {
    badgeClass = "bg-emerald-50 text-emerald-800";
  }

  return `
    <div class="rounded-xl border ${statusBorder} ${statusBg} p-4 shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
      <div class="flex items-center justify-between gap-2 mb-2">
        <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">${title}</span>
        ${badge ? `<span class="text-[11px] px-2 py-0.5 rounded font-medium ${badgeClass}">${badge}</span>` : ""}
      </div>
      <div class="flex items-baseline justify-between mt-1">
        <div class="text-2xl font-bold text-slate-900 tracking-tight">${value}</div>
        ${iconSvg ? `<div class="text-slate-400 p-1.5 rounded-lg bg-slate-50">${iconSvg}</div>` : ""}
      </div>
      <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <span>${subtext}</span>
      </div>
    </div>
  `;
}
