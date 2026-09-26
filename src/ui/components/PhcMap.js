/**
 * SwasthyaGrid AI — Interactive National / State PHC Map Component
 *
 * Displays all 12 PHCs across District North, District Central, and District South.
 * Markers are color-coded by operational status:
 * - NORMAL: Muted Green
 * - WATCH: Amber
 * - WARNING: Amber/Orange
 * - CRITICAL: Pulsing Red (PHC-07)
 *
 * Clicking a marker opens a summary popup with "Open Digital Twin →" action.
 */

import { PHC_DATASET } from "../../data/phc_dataset.js";
import { renderStatusBadge } from "./PHCStatusBadge.js";
import { calculateFacilityRiskProfile } from "../../logic/unified_risk_engine.js";

export function renderPhcMap() {
  return `
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">National / Regional PHC Network Map</h3>
          <p class="text-xs text-slate-500">12 Primary Health Centres across 3 administrative districts</p>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Watch</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Warning</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span> Critical</span>
        </div>
      </div>

      <div id="phc-interactive-map" class="h-80 w-full rounded-lg overflow-hidden border border-slate-100 relative bg-slate-100">
        <!-- Leaflet Map Container -->
      </div>
      <div class="mt-2 text-[11px] text-slate-400 flex justify-between items-center">
        <span>Click any facility marker to inspect live telemetry and launch its Digital Twin.</span>
        <span>Coordinates: Regional Cluster (28.48°N – 28.79°N)</span>
      </div>
    </div>
  `;
}

/**
 * Initializes the Leaflet map on the #phc-interactive-map container.
 */
export function mountPhcMap() {
  const container = document.getElementById("phc-interactive-map");
  if (!container) return;

  // Clean existing leaflet instance if mounted
  if (container._leaflet_id && window.L) {
    container._leaflet_map?.remove();
  }

  if (window.L) {
    try {
      const map = window.L.map(container, {
        center: [28.63, 77.18],
        zoom: 11,
        zoomControl: true,
        attributionControl: false
      });
      container._leaflet_map = map;

      // Carto Light tiles
      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
        subdomains: "abcd"
      }).addTo(map);

      // Add markers
      PHC_DATASET.forEach(phc => {
        const isCritical = phc.operational_status === "CRITICAL";
        const isWarning = phc.operational_status === "WARNING";
        const isWatch = phc.operational_status === "WATCH";

        let markerColor = "#10b981"; // Normal
        if (isCritical) markerColor = "#dc2626";
        else if (isWarning) markerColor = "#f59e0b";
        else if (isWatch) markerColor = "#facc15";

        const iconHtml = `
          <div class="relative flex items-center justify-center">
            ${isCritical ? '<span class="absolute w-8 h-8 rounded-full bg-red-500/40 animate-ping"></span>' : ''}
            <div class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white font-mono" style="background-color: ${markerColor}">
              ${phc.phc_id.replace("PHC-", "")}
            </div>
          </div>
        `;

        const customIcon = window.L.divIcon({
          html: iconHtml,
          className: "custom-phc-pin",
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = window.L.marker([phc.latitude, phc.longitude], { icon: customIcon }).addTo(map);

        const riskProfile = calculateFacilityRiskProfile(phc.phc_id, 7);
        const isCriticalScore = riskProfile.pressure_score >= 70;

        const popupContent = `
          <div class="p-1 text-slate-800 text-xs font-sans min-w-[220px]">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="font-mono font-bold text-slate-700">${phc.phc_id}</span>
              <span class="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${isCriticalScore ? 'bg-red-100 text-red-800 border border-red-200' : riskProfile.pressure_score >= 45 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}">
                Score: ${riskProfile.pressure_score}/100
              </span>
            </div>
            <div class="font-bold text-slate-900 text-sm mb-0.5">${phc.phc_name}</div>
            <div class="text-[11px] text-slate-500 mb-2">${phc.district} • Pop: ${phc.population_served.toLocaleString()}</div>
            
            <div class="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-50 rounded text-[11px] mb-2 font-mono">
              <div>Patients: <span class="font-bold text-slate-800">${phc.patients_today}</span></div>
              <div>Beds: <span class="font-bold ${phc.available_beds <= 2 ? 'text-red-600 font-extrabold' : 'text-slate-800'}">${phc.available_beds}/${phc.total_beds}</span></div>
              <div>Velocity: <span class="font-bold ${riskProfile.velocity.code === 'RAPIDLY_DETERIORATING' ? 'text-red-600' : 'text-slate-700'}">${riskProfile.velocity.code.replace('_', ' ')}</span></div>
              <div>Compound: <span class="font-bold ${riskProfile.is_compound_risk ? 'text-purple-700' : 'text-slate-500'}">${riskProfile.is_compound_risk ? 'YES' : 'NO'}</span></div>
            </div>

            <div class="flex items-center gap-1.5">
              <button 
                onclick="window.location.hash = '#/phc/${phc.phc_id}'"
                class="flex-1 py-1.5 px-2 bg-sky-700 hover:bg-sky-800 text-white rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1"
              >
                Digital Twin →
              </button>
              <button 
                onclick="window.location.hash = '#/warnings'; setTimeout(() => window.showWhyWarningModal && window.showWhyWarningModal('${phc.phc_id}'), 100);"
                class="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-semibold text-xs transition-colors"
                title="View deterministic score breakdown"
              >
                Why?
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
      });
    } catch (e) {
      console.warn("Leaflet map initialization error:", e);
      renderSvgFallbackMap(container);
    }
  } else {
    renderSvgFallbackMap(container);
  }
}

function renderSvgFallbackMap(container) {
  container.innerHTML = `
    <div class="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div class="text-sm font-bold text-slate-700 mb-2">Regional PHC Network Visualizer</div>
      <div class="grid grid-cols-3 gap-4 max-w-xl w-full">
        ${PHC_DATASET.map(phc => `
          <div onclick="window.location.hash = '#/phc/${phc.phc_id}'" class="cursor-pointer p-2 rounded border border-slate-200 bg-white hover:border-sky-500 text-left">
            <div class="flex justify-between items-center text-[10px] font-mono">
              <span>${phc.phc_id}</span>
              ${renderStatusBadge(phc.operational_status)}
            </div>
            <div class="text-xs font-bold text-slate-800 mt-1 truncate">${phc.phc_name}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}
