/**
 * SwasthyaGrid AI — Facility-Specific KPI Card Component
 */

export function renderFacilityKPICard({ label, value, subtext, status, badge, trend }) {
  let borderClass = "border-slate-200";
  let bgClass = "bg-white";

  if (status === "CRITICAL") {
    borderClass = "border-red-300 ring-1 ring-red-300";
    bgClass = "bg-red-50/20";
  } else if (status === "WARNING") {
    borderClass = "border-amber-300";
    bgClass = "bg-amber-50/20";
  } else if (status === "WATCH") {
    borderClass = "border-amber-200";
  }

  let trendHtml = "";
  if (trend) {
    const isPositive = trend.startsWith("+");
    const trendColor = status === "CRITICAL" || status === "WARNING" ? "text-red-600" : (isPositive ? "text-emerald-600" : "text-slate-600");
    trendHtml = `<span class="text-xs font-semibold ${trendColor}">${trend}</span>`;
  }

  return `
    <div class="rounded-xl border ${borderClass} ${bgClass} p-4 shadow-sm flex flex-col justify-between">
      <div class="flex items-center justify-between gap-2 mb-1">
        <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">${label}</span>
        ${badge ? `<span class="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">${badge}</span>` : ""}
      </div>
      <div class="flex items-baseline justify-between mt-1">
        <div class="text-2xl font-bold text-slate-900 tracking-tight">${value}</div>
        ${trendHtml}
      </div>
      ${subtext ? `<div class="mt-2 text-xs text-slate-500 truncate">${subtext}</div>` : ""}
    </div>
  `;
}
