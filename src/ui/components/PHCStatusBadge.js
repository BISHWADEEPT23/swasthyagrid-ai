/**
 * SwasthyaGrid AI — Reusable PHC Status Badge Component
 */

export function renderStatusBadge(status) {
  const map = {
    NORMAL: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "NORMAL"
    },
    WATCH: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-400",
      label: "WATCH"
    },
    WARNING: {
      bg: "bg-amber-100",
      text: "text-amber-900",
      border: "border-amber-300",
      dot: "bg-amber-500",
      label: "WARNING"
    },
    CRITICAL: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-300",
      dot: "bg-red-600",
      label: "CRITICAL",
      extra: "animate-pulse"
    }
  };

  const style = map[status] || map.NORMAL;

  return `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} ${style.extra || ""}">
      <span class="w-1.5 h-1.5 rounded-full ${style.dot}"></span>
      ${style.label}
    </span>
  `;
}
