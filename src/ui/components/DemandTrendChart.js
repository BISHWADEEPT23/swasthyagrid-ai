/**
 * SwasthyaGrid AI — National Patient Demand Trend Chart
 */

export function renderDemandTrendChart() {
  return `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">National Patient Demand Trend</h3>
          <p class="text-xs text-slate-500">Aggregated patient footfall across District North, Central, and South</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
            Last 7 Days
          </span>
        </div>
      </div>
      <div class="relative h-64 w-full">
        <canvas id="national-demand-chart" class="w-full h-full"></canvas>
      </div>
    </div>
  `;
}

export function mountDemandTrendChart() {
  const canvas = document.getElementById("national-demand-chart");
  if (!canvas || !window.Chart) return;

  if (canvas._chartInstance) canvas._chartInstance.destroy();

  const ctx = canvas.getContext("2d");
  canvas._chartInstance = new window.Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Day -6", "Day -5", "Day -4", "Day -3", "Day -2", "Day -1", "Today"],
      datasets: [
        {
          label: "District North",
          data: [410, 422, 415, 430, 428, 435, 427],
          backgroundColor: "#93c5fd",
          borderRadius: 4
        },
        {
          label: "District Central (Surge at PHC-07)",
          data: [610, 625, 630, 650, 678, 705, 732],
          backgroundColor: "#0284c7",
          borderRadius: 4
        },
        {
          label: "District South",
          data: [420, 415, 430, 425, 432, 440, 428],
          backgroundColor: "#38bdf8",
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, grid: { color: "#f1f5f9" } }
      },
      plugins: {
        legend: { position: "top", labels: { boxWidth: 12, font: { size: 11 } } }
      }
    }
  });
}
