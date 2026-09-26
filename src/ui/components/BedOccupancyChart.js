/**
 * SwasthyaGrid AI — National Bed Occupancy Trend Chart
 */

export function renderBedOccupancyChart() {
  return `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Bed Occupancy Trend</h3>
          <p class="text-xs text-slate-500">Inpatient ward occupancy vs available capacity</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            Capacity Strain Watch
          </span>
        </div>
      </div>
      <div class="relative h-64 w-full">
        <canvas id="national-bed-chart" class="w-full h-full"></canvas>
      </div>
    </div>
  `;
}

export function mountBedOccupancyChart() {
  const canvas = document.getElementById("national-bed-chart");
  if (!canvas || !window.Chart) return;

  if (canvas._chartInstance) canvas._chartInstance.destroy();

  const ctx = canvas.getContext("2d");
  canvas._chartInstance = new window.Chart(ctx, {
    type: "line",
    data: {
      labels: ["Day -6", "Day -5", "Day -4", "Day -3", "Day -2", "Day -1", "Today"],
      datasets: [
        {
          label: "Occupied Beds",
          data: [102, 106, 110, 115, 122, 131, 138],
          borderColor: "#dc2626",
          backgroundColor: "rgba(220, 38, 38, 0.08)",
          fill: true,
          tension: 0.3,
          borderWidth: 2
        },
        {
          label: "Available Beds",
          data: [96, 92, 88, 83, 76, 67, 60],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          fill: true,
          tension: 0.3,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: false, grid: { color: "#f1f5f9" } }
      },
      plugins: {
        legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } }
      }
    }
  });
}
