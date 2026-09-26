/**
 * SwasthyaGrid AI — Top Command Centre Bar Component
 *
 * Provides:
 * - Real-time breadcrumbs (e.g. Overview > PHC Network > PHC-07)
 * - User Role Switcher:
 *   1. PHC Officer
 *   2. District Health Officer
 *   3. State/National Administrator
 *   4. Federation Administrator
 * - Live clock and mesh network connectivity status
 */

export const USER_ROLES = [
  "State/National Administrator",
  "District Health Officer",
  "PHC Officer",
  "Federation Administrator"
];

// Current active role stored in state or localStorage
let currentRole = localStorage.getItem("swasthya_role") || "State/National Administrator";

export function getActiveRole() {
  return currentRole;
}

export function setActiveRole(role) {
  currentRole = role;
  localStorage.setItem("swasthya_role", role);
}

export function renderTopBar(breadcrumbs = [{ label: "Overview", hash: "#/" }]) {
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return `
    <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-xs" aria-label="Breadcrumb">
        ${breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return `
            ${idx > 0 ? '<span class="text-slate-400">/</span>' : ""}
            ${isLast 
              ? `<span class="font-bold text-slate-900">${crumb.label}</span>`
              : `<a href="${crumb.hash}" class="text-slate-500 hover:text-sky-700 transition-colors">${crumb.label}</a>`
            }
          `;
        }).join("")}
      </nav>

      <!-- Right Actions: Time, Telemetry, Health, Reset Demo, Copilot, Role Switcher -->
      <div class="flex items-center gap-3">
        <!-- System Health Status Badge (Build 10) -->
        <div class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold" title="All 8 Platform Subsystems Healthy">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SYSTEM: HEALTHY</span>
        </div>

        <!-- Global Reset Demo Button (Build 10) -->
        <button
          type="button"
          onclick="window.handleResetDemo ? window.handleResetDemo() : location.reload()"
          class="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-bold transition-all shadow-sm"
          title="Reset All Scenarios (PHC-07, Emergency, Federation) to Deterministic Competition State"
        >
          <span>↺ Reset Demo</span>
        </button>

        <!-- Live Clock -->
        <div class="hidden md:flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span id="topbar-clock">${now}</span>
        </div>

        <!-- Command Copilot Trigger -->
        <button
          type="button"
          onclick="window.toggleHealthCommandCopilot()"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-sm"
          title="Toggle Health Command Copilot (Gemini 3.8 Flash)"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Command Copilot</span>
          <span class="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-200/60 text-indigo-900">AI</span>
        </button>

        <!-- Role Selector -->
        <div class="flex items-center gap-2">
          <label for="role-select" class="text-xs text-slate-500 hidden sm:inline font-medium">Role:</label>
          <select 
            id="role-select" 
            onchange="window.handleRoleChange(this.value)"
            class="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            ${USER_ROLES.map(role => `
              <option value="${role}" ${role === currentRole ? "selected" : ""}>
                ${role}
              </option>
            `).join("")}
          </select>
        </div>

        <!-- National Health Emblem / Avatar -->
        <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div class="w-8 h-8 rounded-full bg-sky-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            NA
          </div>
        </div>
      </div>
    </header>
  `;
}
