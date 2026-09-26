/**
 * SwasthyaGrid AI — Left Navigation Sidebar Component
 *
 * Navigation Items:
 * 1. Overview
 * 2. PHC Network
 * 3. Medicine Inventory
 * 4. Patient Demand
 * 5. Beds & Capacity
 * 6. Workforce
 * 7. AI Early Warnings
 * 8. Resource Redistribution
 * 9. Emergency Simulator
 * 10. Federation
 * 11. Reports
 * 12. Settings
 */

export const NAV_ITEMS = [
  { id: "overview", label: "Overview", hash: "#/", icon: "dashboard" },
  { id: "network", label: "PHC Network", hash: "#/network", icon: "network" },
  { id: "inventory", label: "Medicine Inventory", hash: "#/inventory", icon: "pill" },
  { id: "demand", label: "Patient Demand", hash: "#/demand", icon: "users" },
  { id: "beds", label: "Beds & Capacity", hash: "#/beds", icon: "bed" },
  { id: "workforce", label: "Workforce", hash: "#/workforce", icon: "briefcase" },
  { id: "warnings", label: "AI Early Warnings", hash: "#/warnings", icon: "alert-triangle" },
  { id: "redistribution", label: "Resource Redistribution", hash: "#/redistribution", icon: "repeat" },
  { id: "simulator", label: "Emergency Simulator", hash: "#/simulator", icon: "activity" },
  { id: "federation", label: "Federation", hash: "#/federation", icon: "globe" },
  { id: "reports", label: "Reports & Briefing", hash: "#/reports", icon: "file-text" },
  { id: "architecture", label: "Architecture & Lineage", hash: "#/architecture", icon: "layers" },
  { id: "audit", label: "Audit & Governance", hash: "#/audit", icon: "shield" },
  { id: "settings", label: "Settings", hash: "#/settings", icon: "settings" }
];

export function renderSidebar(activeNavId = "overview") {
  return `
    <aside class="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800 select-none min-h-screen">
      <!-- Logo & Header -->
      <div class="p-5 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-black text-lg shadow-sm">
            SG
          </div>
          <div>
            <h1 class="font-black text-base tracking-tight text-white flex items-center gap-1.5">
              SwasthyaGrid <span class="text-sky-400 font-bold text-xs px-1 py-0.2 bg-sky-950/80 rounded border border-sky-800/60">AI</span>
            </h1>
            <p class="text-[10px] text-slate-400 font-medium tracking-tight">Predict. Prepare. Redistribute. Protect.</p>
          </div>
        </div>
      </div>

      <!-- Navigation List -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Operations & Resilience
        </div>

        ${NAV_ITEMS.map(item => {
          const isActive = item.id === activeNavId;
          const activeClass = isActive 
            ? "bg-sky-600/20 text-sky-400 font-bold border-l-4 border-sky-400 pl-2" 
            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 font-medium pl-3";

          return `
            <a 
              href="${item.hash}" 
              class="flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-all ${activeClass}"
            >
              <span class="text-xs">${item.label}</span>
              ${item.id === "network" ? '<span class="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">12</span>' : ""}
              ${item.id === "warnings" ? '<span class="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800/40">1</span>' : ""}
              ${item.id === "redistribution" ? '<span class="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-800/40">4</span>' : ""}
              ${item.id === "simulator" ? '<span class="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800/40">SIM</span>' : ""}
              ${item.id === "federation" ? '<span class="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/40">FED</span>' : ""}
            </a>
          `;
        }).join("")}
      </nav>

      <!-- System Telemetry Footer -->
      <div class="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
        <div class="flex items-center justify-between mb-1">
          <span class="flex items-center gap-1.5 text-emerald-400">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Grid Mesh Active
          </span>
          <span class="font-mono text-[10px] text-slate-500">v0.2.0-MVP</span>
        </div>
        <div class="text-[10px] text-slate-500">
          Node: HQ-CENTRAL-01
        </div>
      </div>
    </aside>
  `;
}
