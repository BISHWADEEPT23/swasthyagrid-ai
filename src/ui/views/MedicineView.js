/**
 * SwasthyaGrid AI — Medicine Supply Chain Intelligence Page (Build 03)
 *
 * Implements:
 * 1. 7 Supply Chain KPI Cards
 * 2. Supply Risk Panel with ranked operational risks (specifically PHC-07 IV Fluids)
 * 3. Network Inventory Table (13 columns, search, 4 filters, column sorting)
 * 4. Medicine Network View (Select medicine e.g. ORS, view network distribution & facility comparison)
 * 5. Supply Chain Visualizations (Risk distribution, availability by district)
 * 6. District Aggregation Cards (District North, Central, South)
 * 7. Expiry & Surplus Monitoring
 */

import { MEDICINE_INVENTORY_DATASET, MEDICINE_CATALOG } from "../../data/medicine_dataset.js";
import { PHC_DATASET, DISTRICTS } from "../../data/phc_dataset.js";
import { 
  calculateDaysOfStock, 
  calculateEstimatedStockoutDate, 
  calculateDeliveryRisk, 
  classifySupplyRisk, 
  evaluateExpiryRisk, 
  detectSurplus,
  evaluateReorderStatus,
  aggregateDistrictSupplyChain
} from "../../logic/supply_chain_engine.js";
import { forecastMedicineConsumption } from "../../logic/forecasting_service.js";
import { FORECAST_HORIZONS } from "../../config/forecasting_config.js";

// State for filters and sorting
let currentSearch = "";
let selectedDistrict = "ALL";
let selectedPhc = "ALL";
let selectedCategory = "ALL";
let selectedRisk = "ALL";
let selectedMedicineForNetworkView = "MED-03"; // Default: ORS
let sortColumn = "days_of_stock";
let sortAsc = true;
let currentMedicineForecastHorizon = 7;

export function renderMedicineView() {
  const allItems = MEDICINE_INVENTORY_DATASET.map(item => {
    const phc = PHC_DATASET.find(p => p.phc_id === item.phc_id) || { district: "Unknown", phc_name: item.phc_id };
    const days = calculateDaysOfStock(item.current_stock, item.daily_consumption);
    const risk = classifySupplyRisk(item);
    const delRisk = calculateDeliveryRisk(item);
    const expRisk = evaluateExpiryRisk(item.expiry_date);
    const surplus = detectSurplus(item);
    const isReorder = evaluateReorderStatus(item.current_stock, item.reorder_level);
    const estStockout = calculateEstimatedStockoutDate(item.current_stock, item.daily_consumption);

    return {
      ...item,
      district: phc.district,
      phc_name: phc.phc_name,
      days_of_stock_num: days,
      days_of_stock_str: days.toFixed(1),
      risk,
      deliveryRisk: delRisk,
      expiryRisk: expRisk,
      surplus,
      isReorder,
      estimated_stockout_date_obj: estStockout,
      estimated_stockout_date_str: estStockout.toLocaleDateString([], { month: "short", day: "numeric" })
    };
  });

  // Calculate 7 Top Supply Chain KPIs
  const totalStock = allItems.reduce((sum, i) => sum + Number(i.current_stock || 0), 0);
  const criticalCount = allItems.filter(i => i.risk.level === "CRITICAL").length;
  const warningCount = allItems.filter(i => i.risk.level === "WARNING").length;
  const belowReorderCount = allItems.filter(i => i.isReorder).length;
  const expiringSoonCount = allItems.filter(i => i.expiryRisk.daysToExpiry <= 60).length;
  const scheduledDeliveriesCount = allItems.filter(i => i.next_delivery_date).length;
  const avgAvailability = (
    ((allItems.length - (criticalCount + warningCount * 0.5)) / allItems.length) * 100
  ).toFixed(1);

  // Filter items
  let filtered = allItems.filter(item => {
    const matchesSearch = !currentSearch || 
      item.medicine_name.toLowerCase().includes(currentSearch.toLowerCase()) || 
      item.phc_id.toLowerCase().includes(currentSearch.toLowerCase()) ||
      item.batch_number.toLowerCase().includes(currentSearch.toLowerCase());

    const matchesDistrict = selectedDistrict === "ALL" || item.district === selectedDistrict;
    const matchesPhc = selectedPhc === "ALL" || item.phc_id === selectedPhc;
    const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
    
    let matchesRisk = true;
    if (selectedRisk === "POTENTIAL_SURPLUS") {
      matchesRisk = item.surplus.isSurplus;
    } else if (selectedRisk !== "ALL") {
      matchesRisk = item.risk.level === selectedRisk;
    }

    return matchesSearch && matchesDistrict && matchesPhc && matchesCat && matchesRisk;
  });

  // Sort items
  filtered.sort((a, b) => {
    let valA = a[sortColumn];
    let valB = b[sortColumn];

    if (sortColumn === "days_of_stock") {
      valA = a.days_of_stock_num;
      valB = b.days_of_stock_num;
    } else if (sortColumn === "current_stock" || sortColumn === "daily_consumption") {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // District Aggregation
  const districtData = aggregateDistrictSupplyChain(PHC_DATASET, MEDICINE_INVENTORY_DATASET);

  // Medicine Network View Data (e.g. for ORS)
  const selectedMedCatalogItem = MEDICINE_CATALOG.find(m => m.id === selectedMedicineForNetworkView) || MEDICINE_CATALOG[2];
  const medNetworkItems = allItems.filter(i => i.medicine_catalog_id === selectedMedCatalogItem.id);
  const medTotalStock = medNetworkItems.reduce((sum, i) => sum + Number(i.current_stock), 0);
  const medTotalConsumption = medNetworkItems.reduce((sum, i) => sum + Number(i.daily_consumption), 0);
  const medAvgDaily = (medTotalConsumption / (medNetworkItems.length || 1)).toFixed(1);
  const medNetworkDays = (medTotalConsumption > 0 ? medTotalStock / medTotalConsumption : 999).toFixed(1);

  // Top supply risks
  const topSupplyRisks = allItems
    .filter(i => i.risk.level === "CRITICAL" || i.risk.level === "WARNING" || i.deliveryRisk.hasDeliveryRisk)
    .sort((a, b) => a.days_of_stock_num - b.days_of_stock_num)
    .slice(0, 4);

  return `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            Medicine Supply Chain Intelligence
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">
              BUILD 03 ACTIVE
            </span>
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Real-time operational visibility across the PHC network.
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="text-slate-500 font-medium">Telemetry Nodes:</span>
          <span class="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">
            120 Records (12 PHCs × 10 Meds)
          </span>
        </div>
      </div>

      <!-- 7 Top Supply Chain KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <!-- 1. Total Medicine Stock -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Total Stock</div>
          <div class="text-xl font-black text-slate-900 mt-1 font-mono">${totalStock.toLocaleString()}</div>
          <div class="text-[10px] text-slate-400 mt-0.5">120 Inventory Lines</div>
        </div>

        <!-- 2. Critical Stock Risks -->
        <div class="p-3.5 rounded-xl border border-red-200 bg-red-50/30 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-red-800 font-mono">Critical Risks</div>
          <div class="text-xl font-black text-red-700 mt-1 font-mono animate-pulse">${criticalCount}</div>
          <div class="text-[10px] text-red-600 mt-0.5">&le; 3 days / Delivery gap</div>
        </div>

        <!-- 3. Warning Stock Risks -->
        <div class="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-amber-900 font-mono">Warning Risks</div>
          <div class="text-xl font-black text-amber-800 mt-1 font-mono">${warningCount}</div>
          <div class="text-[10px] text-amber-700 mt-0.5">3–7 days / Safety gap</div>
        </div>

        <!-- 4. Medicines Below Reorder -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Below Reorder</div>
          <div class="text-xl font-black text-slate-900 mt-1 font-mono">${belowReorderCount}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Replenishment needed</div>
        </div>

        <!-- 5. Expiring Soon -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Expiring Soon</div>
          <div class="text-xl font-black text-amber-700 mt-1 font-mono">${expiringSoonCount}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">&le; 60 days window</div>
        </div>

        <!-- 6. Scheduled Deliveries -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Deliveries</div>
          <div class="text-xl font-black text-sky-700 mt-1 font-mono">${scheduledDeliveriesCount}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Scheduled in transit</div>
        </div>

        <!-- 7. Network Availability % -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm col-span-2 sm:col-span-1">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Availability %</div>
          <div class="text-xl font-black text-emerald-700 mt-1 font-mono">${avgAvailability}%</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Network stock index</div>
        </div>
      </div>

      <!-- ==================== SUPPLY RISKS RANKED PANEL ==================== -->
      <div class="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              SUPPLY RISKS (RANKED BY SEVERITY)
            </h2>
            <p class="text-xs text-slate-500">Operational supply risks identified by deterministic consumption and delivery analysis</p>
          </div>
          <span class="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded border border-red-200">
            ${topSupplyRisks.length} Priority Hazards
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          ${topSupplyRisks.map(item => {
            const isCrit = item.risk.level === "CRITICAL";
            return `
              <div 
                onclick="window.location.hash = '#/phc/${item.phc_id}'"
                class="cursor-pointer p-4 rounded-xl border ${isCrit ? "border-red-300 bg-red-50/40 ring-1 ring-red-200" : "border-amber-200 bg-amber-50/20"} hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-mono font-black px-2 py-0.5 rounded ${isCrit ? "bg-red-600 text-white" : "bg-amber-500 text-white"}">
                      ${item.risk.level}
                    </span>
                    <span class="text-xs font-mono font-bold text-slate-700">${item.phc_id}</span>
                  </div>

                  <h3 class="text-sm font-bold text-slate-900 line-clamp-1">${item.medicine_name}</h3>
                  <div class="text-[11px] text-slate-500">${item.district}</div>

                  <div class="grid grid-cols-2 gap-2 my-3 p-2 rounded-lg bg-white/90 border border-slate-200/80 text-xs font-mono">
                    <div>
                      <div class="text-[10px] text-slate-400">Current Stock</div>
                      <div class="font-bold text-slate-800">${item.current_stock}</div>
                    </div>
                    <div>
                      <div class="text-[10px] text-slate-400">Daily Use</div>
                      <div class="font-bold text-slate-800">${item.daily_consumption}</div>
                    </div>
                    <div>
                      <div class="text-[10px] text-slate-400">Stock Coverage</div>
                      <div class="font-bold ${isCrit ? "text-red-700" : "text-amber-700"}">${item.days_of_stock_str} days</div>
                    </div>
                    <div>
                      <div class="text-[10px] text-slate-400">Next Delivery</div>
                      <div class="font-bold text-slate-800">${item.deliveryRisk.daysUntilDelivery} days</div>
                    </div>
                  </div>

                  ${item.deliveryRisk.hasDeliveryRisk ? `
                    <div class="p-2 rounded bg-red-100/80 border border-red-300 text-[11px] text-red-950 font-medium mb-2">
                      <strong>Expected shortage window:</strong> approximately ${item.deliveryRisk.shortageWindowDays} days.
                    </div>
                  ` : ""}
                </div>

                <div class="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 leading-tight">
                  <strong>Reason:</strong> ${item.risk.reason}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- ==================== PREDICTIVE MEDICINE DEMAND & STOCKOUT FORECAST (BUILD 04) ==================== -->
      <div class="rounded-xl border border-indigo-200 bg-white p-5 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
              PREDICTIVE STOCKOUT & DEMAND FORECAST (DYNAMIC COVERAGE)
            </h2>
            <p class="text-xs text-slate-500">
              Compares static burn rate vs forecast-adjusted daily consumption to reveal unbuffered delivery gaps.
            </p>
          </div>

          <!-- Horizon Selector -->
          <div class="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-1">
            ${FORECAST_HORIZONS.map(h => `
              <button
                type="button"
                onclick="window.setMedicineForecastHorizon(${h.days})"
                class="px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  h.days === currentMedicineForecastHorizon 
                    ? "bg-indigo-600 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }"
              >
                ${h.shortLabel}
              </button>
            `).join("")}
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-left font-mono text-xs">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">PHC & Medicine</th>
                <th class="py-2.5 px-3 text-right">Stock</th>
                <th class="py-2.5 px-3 text-right">Static Burn</th>
                <th class="py-2.5 px-3 text-right">Forecast Burn</th>
                <th class="py-2.5 px-3 text-right">Static Days</th>
                <th class="py-2.5 px-3 text-right">Forecast Days</th>
                <th class="py-2.5 px-3 text-center">Predicted Stockout</th>
                <th class="py-2.5 px-3 text-center">Next Delivery</th>
                <th class="py-2.5 px-3 text-right">Shortage Window</th>
                <th class="py-2.5 px-3 text-center">Predictive Risk</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${[
                forecastMedicineConsumption("PHC-07", "MED-07", currentMedicineForecastHorizon),
                forecastMedicineConsumption("PHC-07", "MED-01", currentMedicineForecastHorizon),
                forecastMedicineConsumption("PHC-03", "MED-03", currentMedicineForecastHorizon),
                forecastMedicineConsumption("PHC-11", "MED-02", currentMedicineForecastHorizon),
                forecastMedicineConsumption("PHC-07", "MED-03", currentMedicineForecastHorizon)
              ].map(item => {
                const isCrit = item.risk_level === "CRITICAL";
                const isWarn = item.risk_level === "WARNING";
                const burnDelta = item.forecast_daily_consumption - item.daily_consumption;

                return `
                  <tr class="hover:bg-slate-50/80 transition-colors ${isCrit ? "bg-red-50/30" : ""}">
                    <td class="py-3 px-3">
                      <div class="font-bold text-slate-900 font-sans">${item.medicine_name}</div>
                      <div class="text-[11px] text-slate-500 font-mono">${item.phc_id} (${item.phc_name})</div>
                    </td>
                    <td class="py-3 px-3 text-right font-bold text-slate-800">${item.current_stock}</td>
                    <td class="py-3 px-3 text-right text-slate-500">${item.daily_consumption}/d</td>
                    <td class="py-3 px-3 text-right font-bold text-indigo-700">
                      ${item.forecast_daily_consumption}/d
                      <span class="text-[10px] ${burnDelta > 0 ? "text-red-600" : "text-slate-400"} font-normal">
                        (${burnDelta > 0 ? "+" : ""}${burnDelta})
                      </span>
                    </td>
                    <td class="py-3 px-3 text-right text-slate-600">${item.static_days_of_stock}d</td>
                    <td class="py-3 px-3 text-right font-bold ${isCrit ? "text-red-600 font-black animate-pulse" : "text-amber-700"}">
                      ${item.forecast_days_of_stock}d
                    </td>
                    <td class="py-3 px-3 text-center font-bold ${isCrit ? "text-red-700" : "text-slate-700"}">
                      ${item.predicted_stockout_date}
                    </td>
                    <td class="py-3 px-3 text-center text-slate-600">
                      ${item.next_delivery_date ? item.next_delivery_date.split("T")[0] : "None scheduled"}
                    </td>
                    <td class="py-3 px-3 text-right font-bold ${item.shortage_window_days > 0 ? "text-red-700 font-black" : "text-emerald-700"}">
                      ${item.shortage_window_days > 0 ? `${item.shortage_window_days} days` : "0 days (safe)"}
                    </td>
                    <td class="py-3 px-3 text-center">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCrit ? "bg-red-100 text-red-800 border border-red-300 animate-pulse" :
                        isWarn ? "bg-amber-100 text-amber-800 border border-amber-300" :
                        "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }">
                        ${item.risk_level}
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== MEDICINE NETWORK VIEW ==================== -->
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
              MEDICINE NETWORK VIEW
            </h2>
            <p class="text-xs text-slate-500">Cross-facility stock comparison and imbalance detection for selected medicine</p>
          </div>

          <div class="flex items-center gap-2">
            <label for="network-med-selector" class="text-xs font-semibold text-slate-600">Select Medicine:</label>
            <select 
              id="network-med-selector"
              onchange="window.handleSelectMedicineNetworkView(this.value)"
              class="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              ${MEDICINE_CATALOG.map(med => `
                <option value="${med.id}" ${med.id === selectedMedicineForNetworkView ? "selected" : ""}>
                  ${med.name} (${med.category})
                </option>
              `).join("")}
            </select>
          </div>
        </div>

        <!-- Selected Medicine Network Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs font-mono">
          <div>
            <div class="text-[10px] text-slate-400 uppercase">Total Network Stock</div>
            <div class="text-2xl font-black text-slate-900 mt-0.5">${medTotalStock.toLocaleString()} units</div>
            <div class="text-[10px] text-slate-500">Across 12 facilities</div>
          </div>

          <div>
            <div class="text-[10px] text-slate-400 uppercase">Avg Daily Consumption</div>
            <div class="text-2xl font-black text-slate-900 mt-0.5">${medAvgDaily} / facility</div>
            <div class="text-[10px] text-slate-500">${medTotalConsumption} total/day</div>
          </div>

          <div>
            <div class="text-[10px] text-slate-400 uppercase">Network Days of Stock</div>
            <div class="text-2xl font-black ${Number(medNetworkDays) < 7 ? "text-amber-700" : "text-emerald-700"} mt-0.5">
              ${medNetworkDays} days
            </div>
            <div class="text-[10px] text-slate-500">Consolidated buffer</div>
          </div>

          <div>
            <div class="text-[10px] text-slate-400 uppercase">Operational Imbalance</div>
            <div class="text-sm font-bold text-slate-800 mt-1">
              Shortage: <span class="text-red-600">${medNetworkItems.filter(i => i.risk.level === "CRITICAL").length}</span> |
              Surplus: <span class="text-sky-700">${medNetworkItems.filter(i => i.surplus.isSurplus).length}</span>
            </div>
            <div class="text-[10px] text-slate-400">Advisory imbalance only</div>
          </div>
        </div>

        <!-- Facility Comparison Table for Selected Medicine -->
        <div class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-left font-mono text-xs">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">PHC</th>
                <th class="py-2.5 px-3">District</th>
                <th class="py-2.5 px-3 text-right">Current Stock</th>
                <th class="py-2.5 px-3 text-right">Daily Use</th>
                <th class="py-2.5 px-3 text-right">Days of Stock</th>
                <th class="py-2.5 px-3 text-center">Status / Indicator</th>
                <th class="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${medNetworkItems.map(item => {
                let indicator = item.risk.level;
                let badgeClass = item.risk.badgeClass;

                if (item.surplus.isSurplus) {
                  indicator = "SURPLUS INDICATOR";
                  badgeClass = "bg-sky-50 text-sky-800 border-sky-300 font-bold";
                }

                return `
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-2.5 px-3 font-bold text-slate-900">${item.phc_id}</td>
                    <td class="py-2.5 px-3 text-slate-600 font-sans text-xs">${item.district}</td>
                    <td class="py-2.5 px-3 text-right font-bold text-slate-800">${item.current_stock}</td>
                    <td class="py-2.5 px-3 text-right text-slate-600">${item.daily_consumption}</td>
                    <td class="py-2.5 px-3 text-right font-bold ${item.days_of_stock_num <= 3 ? "text-red-700" : (item.days_of_stock_num <= 7 ? "text-amber-800" : "text-slate-800")}">
                      ${item.days_of_stock_str} days
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] border ${badgeClass}">
                        ${indicator}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <a href="#/phc/${item.phc_id}" class="text-sky-700 hover:text-sky-800 font-sans font-semibold text-[11px]">
                        Digital Twin &rarr;
                      </a>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== DISTRICT AGGREGATION CARDS ==================== -->
      <div>
        <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono mb-3">
          DISTRICT SUPPLY CHAIN AGGREGATION
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${districtData.map(dist => `
            <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-sm font-bold text-slate-900">${dist.district}</h3>
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    ${dist.phcCount} Facilities
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2 my-3 p-3 rounded-lg bg-slate-50 text-xs font-mono">
                  <div>
                    <div class="text-[10px] text-slate-400">Total Stock</div>
                    <div class="font-bold text-slate-900">${dist.totalStock.toLocaleString()}</div>
                  </div>
                  <div>
                    <div class="text-[10px] text-slate-400">Availability</div>
                    <div class="font-bold text-emerald-700">${dist.availabilityPercentage}%</div>
                  </div>
                  <div>
                    <div class="text-[10px] text-slate-400">Critical Risks</div>
                    <div class="font-bold ${dist.criticalCount > 0 ? "text-red-600" : "text-slate-700"}">${dist.criticalCount}</div>
                  </div>
                  <div>
                    <div class="text-[10px] text-slate-400">Surplus Buffers</div>
                    <div class="font-bold text-sky-700">${dist.surplusCount}</div>
                  </div>
                </div>
              </div>

              <div class="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Deliveries En Route:</span>
                <span class="font-mono font-bold text-slate-800">${dist.upcomingDeliveriesCount}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- ==================== NETWORK INVENTORY TABLE (13 COLUMNS) ==================== -->
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
              NETWORK INVENTORY REGISTRY (120 RECORDS)
            </h2>
            <p class="text-xs text-slate-500">Comprehensive multi-facility stock, burn, safety buffer, and replenishment telemetry</p>
          </div>

          <div class="text-xs text-slate-500">
            Showing <strong class="text-slate-800 font-mono">${filtered.length}</strong> of <span class="font-mono">${allItems.length}</span> records
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <!-- Search -->
          <div>
            <input 
              type="text" 
              value="${currentSearch}"
              placeholder="Search medicine, PHC, batch..."
              oninput="window.handleInventorySearch(this.value)"
              class="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
            />
          </div>

          <!-- District -->
          <div>
            <select 
              onchange="window.handleFilterDistrict(this.value)"
              class="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
            >
              <option value="ALL" ${selectedDistrict === "ALL" ? "selected" : ""}>All Districts</option>
              ${DISTRICTS.map(d => `<option value="${d}" ${selectedDistrict === d ? "selected" : ""}>${d}</option>`).join("")}
            </select>
          </div>

          <!-- PHC -->
          <div>
            <select 
              onchange="window.handleFilterPhc(this.value)"
              class="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
            >
              <option value="ALL" ${selectedPhc === "ALL" ? "selected" : ""}>All 12 PHCs</option>
              ${PHC_DATASET.map(p => `<option value="${p.phc_id}" ${selectedPhc === p.phc_id ? "selected" : ""}>${p.phc_id} - ${p.phc_name}</option>`).join("")}
            </select>
          </div>

          <!-- Category -->
          <div>
            <select 
              onchange="window.handleFilterCategory(this.value)"
              class="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
            >
              <option value="ALL" ${selectedCategory === "ALL" ? "selected" : ""}>All Categories</option>
              ${Array.from(new Set(MEDICINE_CATALOG.map(m => m.category))).map(c => `<option value="${c}" ${selectedCategory === c ? "selected" : ""}>${c}</option>`).join("")}
            </select>
          </div>

          <!-- Risk Level -->
          <div>
            <select 
              onchange="window.handleFilterRisk(this.value)"
              class="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-semibold"
            >
              <option value="ALL" ${selectedRisk === "ALL" ? "selected" : ""}>All Risk Levels</option>
              <option value="CRITICAL" ${selectedRisk === "CRITICAL" ? "selected" : ""}>Critical Risk</option>
              <option value="WARNING" ${selectedRisk === "WARNING" ? "selected" : ""}>Warning Risk</option>
              <option value="WATCH" ${selectedRisk === "WATCH" ? "selected" : ""}>Watch</option>
              <option value="NORMAL" ${selectedRisk === "NORMAL" ? "selected" : ""}>Normal</option>
              <option value="POTENTIAL_SURPLUS" ${selectedRisk === "POTENTIAL_SURPLUS" ? "selected" : ""}>Potential Surplus</option>
            </select>
          </div>
        </div>

        <!-- 13-Column Table -->
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left font-mono text-xs">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3 cursor-pointer hover:text-sky-700" onclick="window.handleSortTable('phc_id')">PHC</th>
                <th class="py-2.5 px-3">District</th>
                <th class="py-2.5 px-3 cursor-pointer hover:text-sky-700" onclick="window.handleSortTable('medicine_name')">Medicine</th>
                <th class="py-2.5 px-3">Category</th>
                <th class="py-2.5 px-3 text-right cursor-pointer hover:text-sky-700" onclick="window.handleSortTable('current_stock')">Current Stock</th>
                <th class="py-2.5 px-3 text-right cursor-pointer hover:text-sky-700" onclick="window.handleSortTable('daily_consumption')">Daily Burn</th>
                <th class="py-2.5 px-3 text-right cursor-pointer hover:text-sky-700" onclick="window.handleSortTable('days_of_stock')">Days of Stock</th>
                <th class="py-2.5 px-3 text-right">Safety Stock</th>
                <th class="py-2.5 px-3 text-right">Reorder Lvl</th>
                <th class="py-2.5 px-3 text-center">Next Delivery</th>
                <th class="py-2.5 px-3 text-center">Estimated Stockout</th>
                <th class="py-2.5 px-3 text-center">Expiry</th>
                <th class="py-2.5 px-3 text-center">Risk</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="13" class="py-8 text-center text-slate-400 font-sans">
                    No medicine inventory records match the selected filters.
                  </td>
                </tr>
              ` : filtered.map(item => {
                const isCrit = item.risk.level === "CRITICAL";
                const isWarn = item.risk.level === "WARNING";

                return `
                  <tr class="hover:bg-slate-50/70 transition-colors ${isCrit ? "bg-red-50/20" : ""}">
                    <td class="py-2.5 px-3 font-bold text-slate-900">
                      <a href="#/phc/${item.phc_id}" class="hover:underline text-sky-700">${item.phc_id}</a>
                    </td>
                    <td class="py-2.5 px-3 font-sans text-slate-500 text-[11px]">${item.district}</td>
                    <td class="py-2.5 px-3 font-sans font-semibold text-slate-800">${item.medicine_name}</td>
                    <td class="py-2.5 px-3 font-sans text-slate-500 text-[11px]">${item.category}</td>
                    <td class="py-2.5 px-3 text-right font-bold ${isCrit ? "text-red-700" : "text-slate-800"}">
                      ${Number(item.current_stock).toLocaleString()}
                    </td>
                    <td class="py-2.5 px-3 text-right text-slate-600">${item.daily_consumption}</td>
                    <td class="py-2.5 px-3 text-right font-bold ${item.days_of_stock_num <= 3 ? "text-red-700 font-extrabold" : (item.days_of_stock_num <= 7 ? "text-amber-800" : "text-slate-800")}">
                      ${item.days_of_stock_str}d
                    </td>
                    <td class="py-2.5 px-3 text-right text-slate-500">${item.minimum_safety_stock}</td>
                    <td class="py-2.5 px-3 text-right text-slate-500">${item.reorder_level}</td>
                    <td class="py-2.5 px-3 text-center text-[11px] ${item.deliveryRisk.hasDeliveryRisk ? "text-red-600 font-bold" : "text-slate-600"}">
                      ${item.next_delivery_date ? new Date(item.next_delivery_date).toLocaleDateString([], { month: "short", day: "numeric" }) : "-"}
                    </td>
                    <td class="py-2.5 px-3 text-center text-[11px] ${item.days_of_stock_num <= 3 ? "text-red-600 font-bold" : "text-slate-600"}">
                      ${item.estimated_stockout_date_str}
                    </td>
                    <td class="py-2.5 px-3 text-center text-[11px]">
                      <span class="${item.expiryRisk.level !== 'NORMAL' ? 'text-amber-700 font-bold' : 'text-slate-500'}">
                        ${new Date(item.expiry_date).toLocaleDateString([], { month: "short", year: "2-digit" })}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${item.risk.badgeClass}">
                        ${item.risk.level}
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Global Filter & Sorting Handlers attached to window
window.handleInventorySearch = function(val) {
  currentSearch = val;
  window.refreshCurrentRoute();
};

window.handleFilterDistrict = function(dist) {
  selectedDistrict = dist;
  window.refreshCurrentRoute();
};

window.handleFilterPhc = function(phc) {
  selectedPhc = phc;
  window.refreshCurrentRoute();
};

window.handleFilterCategory = function(cat) {
  selectedCategory = cat;
  window.refreshCurrentRoute();
};

window.handleFilterRisk = function(risk) {
  selectedRisk = risk;
  window.refreshCurrentRoute();
};

window.handleSelectMedicineNetworkView = function(medId) {
  selectedMedicineForNetworkView = medId;
  window.refreshCurrentRoute();
};

window.handleSortTable = function(col) {
  if (sortColumn === col) {
    sortAsc = !sortAsc;
  } else {
    sortColumn = col;
    sortAsc = true;
  }
  window.refreshCurrentRoute();
};

window.setMedicineForecastHorizon = function(horizon) {
  currentMedicineForecastHorizon = horizon;
  window.refreshCurrentRoute();
};
