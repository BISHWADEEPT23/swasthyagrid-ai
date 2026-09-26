/**
 * SwasthyaGrid AI — PHC Network Directory View
 *
 * Requirements:
 * - Display all 12 PHCs
 * - Search by PHC name or ID
 * - Filter by district (All, District North, District Central, District South)
 * - Filter by operational status (All, NORMAL, WATCH, WARNING, CRITICAL)
 * - Summary counts by NORMAL/WATCH/WARNING/CRITICAL
 * - Each card shows: PHC ID, name, district, pop served, patients today, available beds, medicine %, staff %, operational status, active alerts
 * - Clicking a PHC opens its Digital Twin (#/phc/:phcId)
 */

import { PHC_DATASET, DISTRICTS, OPERATIONAL_STATUSES } from "../../data/phc_dataset.js";
import { renderPHCCard } from "../components/PHCCard.js";

let currentSearch = "";
let selectedDistrict = "ALL";
let selectedStatus = "ALL";

export function renderPhcNetworkView() {
  // Counts
  const counts = {
    TOTAL: PHC_DATASET.length,
    NORMAL: PHC_DATASET.filter(p => p.operational_status === "NORMAL").length,
    WATCH: PHC_DATASET.filter(p => p.operational_status === "WATCH").length,
    WARNING: PHC_DATASET.filter(p => p.operational_status === "WARNING").length,
    CRITICAL: PHC_DATASET.filter(p => p.operational_status === "CRITICAL").length
  };

  // Filtered PHCs
  const filtered = PHC_DATASET.filter(phc => {
    const matchesSearch = !currentSearch || 
      phc.phc_name.toLowerCase().includes(currentSearch.toLowerCase()) || 
      phc.phc_id.toLowerCase().includes(currentSearch.toLowerCase());

    const matchesDistrict = selectedDistrict === "ALL" || phc.district === selectedDistrict;
    const matchesStatus = selectedStatus === "ALL" || phc.operational_status === selectedStatus;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  return `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            Primary Health Centre Network
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">12 FACILITIES</span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Operational registry and live digital twin access across District North, Central, and South
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <a href="#/" class="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition-colors">
            ← Back to National Command Centre
          </a>
        </div>
      </div>

      <!-- Status Summary Badges / Counters -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button 
          onclick="window.handleStatusFilter('ALL')"
          class="p-3 rounded-xl border ${selectedStatus === 'ALL' ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-400' : 'border-slate-200 bg-white hover:border-slate-300'} text-left transition-all"
        >
          <div class="text-[11px] text-slate-500 font-medium">All PHCs</div>
          <div class="text-xl font-black text-slate-900 mt-0.5">${counts.TOTAL}</div>
          <div class="text-[10px] text-slate-400 mt-1">100% Reporting</div>
        </button>

        <button 
          onclick="window.handleStatusFilter('NORMAL')"
          class="p-3 rounded-xl border ${selectedStatus === 'NORMAL' ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-400' : 'border-slate-200 bg-white hover:border-slate-300'} text-left transition-all"
        >
          <div class="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Normal
          </div>
          <div class="text-xl font-black text-emerald-700 mt-0.5">${counts.NORMAL}</div>
          <div class="text-[10px] text-emerald-600 mt-1">Healthy Capacity</div>
        </button>

        <button 
          onclick="window.handleStatusFilter('WATCH')"
          class="p-3 rounded-xl border ${selectedStatus === 'WATCH' ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-400' : 'border-slate-200 bg-white hover:border-slate-300'} text-left transition-all"
        >
          <div class="text-[11px] text-amber-800 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Watch
          </div>
          <div class="text-xl font-black text-amber-700 mt-0.5">${counts.WATCH}</div>
          <div class="text-[10px] text-amber-600 mt-1">Emerging Risk</div>
        </button>

        <button 
          onclick="window.handleStatusFilter('WARNING')"
          class="p-3 rounded-xl border ${selectedStatus === 'WARNING' ? 'border-amber-500 bg-amber-100/50 ring-1 ring-amber-500' : 'border-slate-200 bg-white hover:border-slate-300'} text-left transition-all"
        >
          <div class="text-[11px] text-amber-900 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Warning
          </div>
          <div class="text-xl font-black text-amber-800 mt-0.5">${counts.WARNING}</div>
          <div class="text-[10px] text-amber-700 mt-1">Intervention Near</div>
        </button>

        <button 
          onclick="window.handleStatusFilter('CRITICAL')"
          class="p-3 rounded-xl border ${selectedStatus === 'CRITICAL' ? 'border-red-500 bg-red-50 ring-1 ring-red-400' : 'border-slate-200 bg-white hover:border-slate-300'} text-left transition-all col-span-2 sm:col-span-1"
        >
          <div class="text-[11px] text-red-800 font-medium flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span> Critical
          </div>
          <div class="text-xl font-black text-red-700 mt-0.5 animate-pulse">${counts.CRITICAL}</div>
          <div class="text-[10px] text-red-600 mt-1">Urgent Attention (PHC-07)</div>
        </button>
      </div>

      <!-- Controls: Search & District Filters -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <input 
            type="text" 
            id="phc-search-input"
            value="${currentSearch}"
            placeholder="Search by PHC name or ID (e.g. PHC-07, Riverdale)..."
            oninput="window.handlePhcSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <!-- District Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span class="text-slate-400 text-[11px] mr-1 font-medium hidden sm:inline">District:</span>
          <button 
            onclick="window.handleDistrictFilter('ALL')"
            class="px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${selectedDistrict === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
          >
            All Districts
          </button>
          ${DISTRICTS.map(dist => `
            <button 
              onclick="window.handleDistrictFilter('${dist}')"
              class="px-2.5 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${selectedDistrict === dist ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
            >
              ${dist}
            </button>
          `).join("")}
        </div>
      </div>

      <!-- PHC Cards Grid -->
      ${filtered.length === 0 ? `
        <div class="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div class="text-slate-400 text-sm font-medium">No Primary Health Centres match your filters.</div>
          <button onclick="window.resetPhcFilters()" class="mt-3 text-xs text-sky-700 font-semibold hover:underline">
            Reset all filters
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${filtered.map(phc => renderPHCCard(phc)).join("")}
        </div>
      `}
    </div>
  `;
}

// Global Filter Handlers attached to window for smooth SPA interactivity
window.handlePhcSearch = function(val) {
  currentSearch = val;
  window.refreshCurrentRoute();
};

window.handleDistrictFilter = function(dist) {
  selectedDistrict = dist;
  window.refreshCurrentRoute();
};

window.handleStatusFilter = function(status) {
  selectedStatus = status;
  window.refreshCurrentRoute();
};

window.resetPhcFilters = function() {
  currentSearch = "";
  selectedDistrict = "ALL";
  selectedStatus = "ALL";
  window.refreshCurrentRoute();
};
