/**
 * SwasthyaGrid AI — Platform Architecture & Data Lineage View
 * Route: #/architecture
 *
 * Features:
 * 1. Visual End-to-End Pipeline
 * 2. Step-by-Step Data Lineage Case Study (PHC-07 IV Fluids)
 * 3. Interoperability & Canonical Model Architecture
 * 4. Explicit Prototype Claim Boundaries
 */

export function renderArchitectureView() {
  return `
    <div class="space-y-8 pb-16 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              TECHNICAL ARCHITECTURE & LINEAGE
            </span>
            <span class="text-xs text-slate-500 font-mono">SPEC-V1.0</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight mt-1">
            System Architecture & Data Lineage
          </h2>
          <p class="text-xs text-slate-500">
            End-to-end data pipeline, healthcare interoperability adapters, and explainable decision trace
          </p>
        </div>
      </div>

      <!-- 1. System Pipeline Architecture Flowchart -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono border-b border-slate-100 pb-2">
          1. Platform Architecture & Data Pipeline
        </h3>

        <!-- Flow Visualizer -->
        <div class="space-y-4">
          <!-- Primary Linear Pipeline -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div class="font-bold text-slate-900 font-mono text-[11px]">DATA SOURCES</div>
              <div class="text-[10px] text-slate-500">12 PHCs Telemetry, Footfall, Stock, Beds, Staff</div>
            </div>
            <div class="flex items-center justify-center font-black text-slate-400">→</div>
            <div class="p-3 bg-sky-50 rounded-lg border border-sky-200 space-y-1">
              <div class="font-bold text-sky-900 font-mono text-[11px]">INTEROPERABILITY</div>
              <div class="text-[10px] text-sky-700">FHIR JSON / CSV / REST Adapters + Validation</div>
            </div>
            <div class="flex items-center justify-center font-black text-slate-400">→</div>
            <div class="p-3 bg-indigo-50 rounded-lg border border-indigo-200 space-y-1">
              <div class="font-bold text-indigo-900 font-mono text-[11px]">CANONICAL MODEL</div>
              <div class="text-[10px] text-indigo-700">15 Standard Entities (Facility, Inventory, Delivery)</div>
            </div>
          </div>

          <div class="flex justify-center text-slate-400 font-black text-xs">↓</div>

          <!-- Processing Engines Grid -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-xs">
            <div class="p-3 bg-indigo-50/70 rounded-lg border border-indigo-200 space-y-1">
              <div class="font-bold text-indigo-900 font-mono text-[11px]">FORECASTING ENGINE</div>
              <div class="text-[10px] text-indigo-700">7-Day Horizon, Dynamic Burn, Bed Projection</div>
            </div>
            <div class="p-3 bg-amber-50/70 rounded-lg border border-amber-200 space-y-1">
              <div class="font-bold text-amber-900 font-mono text-[11px]">SUPPLY CHAIN ENGINE</div>
              <div class="text-[10px] text-amber-700">Stock Coverage, Depletion Gap, Expiry Track</div>
            </div>
            <div class="p-3 bg-red-50/70 rounded-lg border border-red-200 space-y-1">
              <div class="font-bold text-red-900 font-mono text-[11px]">UNIFIED RISK ENGINE</div>
              <div class="text-[10px] text-red-700">Compound Severity, Early Warnings, Alert Lifecycle</div>
            </div>
            <div class="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200 space-y-1">
              <div class="font-bold text-emerald-900 font-mono text-[11px]">REDISTRIBUTION</div>
              <div class="text-[10px] text-emerald-700">Haversine Matrix, Safe Donor Buffers, Routing</div>
            </div>
          </div>

          <div class="flex justify-center text-slate-400 font-black text-xs">↓</div>

          <!-- AI & Human Decision -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
            <div class="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-1">
              <div class="font-bold text-purple-900 font-mono text-[11px]">GEMINI HEALTH COPILOT</div>
              <div class="text-[10px] text-purple-700">Dual-Mode Grounded Explanations & Directives</div>
            </div>
            <div class="flex items-center justify-center font-black text-slate-400">→</div>
            <div class="p-3 bg-emerald-100 rounded-lg border border-emerald-300 space-y-1">
              <div class="font-bold text-emerald-950 font-mono text-[11px]">HUMAN DECISION MAKER</div>
              <div class="text-[10px] text-emerald-800 font-semibold">Chief Medical Officer / DHO Sign-Off & Execution</div>
            </div>
          </div>

          <!-- Parallel Branches -->
          <div class="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-3 bg-amber-50/40 rounded-lg border border-amber-200">
              <div class="font-bold text-amber-900 font-mono text-[11px]">PARALLEL: EMERGENCY SIMULATION ENGINE</div>
              <div class="text-[11px] text-slate-600 mt-1">
                Zero-side-effect sandbox allowing administrators to stress-test the network under severe shocks (e.g. +85% surge) without modifying baseline data.
              </div>
            </div>
            <div class="p-3 bg-indigo-50/40 rounded-lg border border-indigo-200">
              <div class="font-bold text-indigo-900 font-mono text-[11px]">PARALLEL: BRICS FEDERATED INTELLIGENCE</div>
              <div class="text-[11px] text-slate-600 mt-1">
                Simulated cross-border collaborative model updates (FedAvg) where raw facility/patient data remains strictly within national borders.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. End-to-End Data Lineage Deep Dive: PHC-07 IV Fluids -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
            <span>2. End-to-End Data Lineage Case Study: PHC-07 IV Fluids</span>
            <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-sky-100 text-sky-800">EXPLAINABILITY TRACE</span>
          </h3>
          <span class="text-xs font-mono text-slate-500">10 Discrete Pipeline Steps</span>
        </div>

        <p class="text-xs text-slate-600">
          This lineage trace demonstrates how raw operational telemetry at a single facility is ingested, validated, forecasted, and escalated into an actionable human decision:
        </p>

        <div class="relative border-l-2 border-sky-400 pl-4 ml-2 space-y-4 text-xs">
          <!-- Step 1 -->
          <div class="relative space-y-1">
            <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-white"></div>
            <div class="font-bold text-slate-900 font-mono text-[11px]">Step 1: Raw Synthetic Inventory Ingested</div>
            <div class="text-slate-600">
              PHC-07 reports <strong>105 units of IV Fluids (NS / RL 500ml)</strong> in stock. Next scheduled delivery from Supplier SUP-01 is <strong>Sept 25 (5.0 days away)</strong>.
            </div>
          </div>

          <!-- Step 2 -->
          <div class="relative space-y-1">
            <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-white"></div>
            <div class="font-bold text-slate-900 font-mono text-[11px]">Step 2: Data Quality & Integrity Validation</div>
            <div class="text-slate-600">
              <code>DataQualityService</code> validates stock > 0, verifies foreign keys <code>phc_id: "PHC-07"</code> and <code>medicine_id: "MED-001"</code>, confirms valid delivery date. Status: <strong>PASSED (100%)</strong>.
            </div>
          </div>

          <!-- Step 3 -->
          <div class="relative space-y-1">
            <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-white"></div>
            <div class="font-bold text-slate-900 font-mono text-[11px]">Step 3: Dynamic Consumption Calculation</div>
            <div class="text-slate-600">
              Static baseline burn is 48 units/day. Due to a surge in dehydration presentations, <code>supply_chain_engine</code> adjusts consumption rate dynamically to <strong>58 units/day (+21% acceleration)</strong>.
            </div>
          </div>

          <!-- Step 4 -->
          <div class="relative space-y-1">
            <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-white"></div>
            <div class="font-bold text-slate-900 font-mono text-[11px]">Step 4: 7-Day Patient Demand Forecasting</div>
            <div class="text-slate-600">
              <code>forecasting_service</code> detects an inflow surge (+35% footfall, 286 patients vs 212 baseline) with 92% confidence, projecting bed saturation to reach <strong>104% (25/24 beds)</strong>.
            </div>
          </div>

          <!-- Step 5 -->
          <div class="relative space-y-1">
            <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-white"></div>
            <div class="font-bold text-slate-900 font-mono text-[11px]">Step 5: Stock-Out & Depletion Projection</div>
            <div class="text-slate-600">
              With 105 units at 58 units/day, current stock will be exhausted in <strong>1.8 days (Sept 22, 06:00 UTC)</strong>. Since replenishment arrives Sept 25, an <strong>unbuffered 3.2-day stockout window</strong> is identified.
            </div>
          </div>

          <!-- Step 6 -->
          <div class="relative space-y-1">
            <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-white"></div>
            <div class="font-bold text-slate-900 font-mono text-[11px]">Step 6: Risk Signal Formulation</div>
            <div class="text-slate-600">
              <code>unified_risk_engine</code> aggregates demand surge, bed saturation, and stock depletion into a <strong>Compound Operational Risk</strong> (Severity: 94/100, Velocity: Rapid Deterioration).
            </div>
          </div>

          <!-- Step 7 -->
          <div class="relative space-y-1">
            <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
            <div class="font-bold text-red-900 font-mono text-[11px]">Step 7: Early Warning Alert Triggered</div>
            <div class="text-slate-600">
              Alert <code>ALT-COMPOUND-PHC-07</code> is published to National Command Centre and District Central dashboards.
            </div>
          </div>

          <!-- Step 8 -->
          <div class="relative space-y-1">
            <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-white"></div>
            <div class="font-bold text-slate-900 font-mono text-[11px]">Step 8: Redistribution Optimization</div>
            <div class="text-slate-600">
              <code>redistribution_engine</code> runs Haversine proximity matrix. It identifies <strong>PHC-05 (Central Metro Clinic)</strong> with 320 units. Transferring 150 units leaves PHC-05 with 4.5 days of safe buffer (above the 4.0-day minimum limit). Transit time: 45 minutes.
            </div>
          </div>

          <!-- Step 9 -->
          <div class="relative space-y-1">
            <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white"></div>
            <div class="font-bold text-purple-900 font-mono text-[11px]">Step 9: Gemini Health Copilot Synthesis</div>
            <div class="text-slate-600">
              When queried, Gemini 3.8 Flash synthesizes the clinical context, explains why static burn is misleading, and details the trade-offs of donor buffers.
            </div>
          </div>

          <!-- Step 10 -->
          <div class="relative space-y-1">
            <div class="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white"></div>
            <div class="font-bold text-emerald-950 font-mono text-[11px]">Step 10: Human Decision Maker Authorization</div>
            <div class="text-slate-600">
              Chief Medical Officer reviews transfer proposal <code>TX-REC-001</code>, clicks <strong>Approve Transfer</strong>, assigns Driver R. Kumar (Vehicle DL-1VA-4482), and records sign-off in the immutable audit log.
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Explicit Claim Boundaries & Non-Goals -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono border-b border-slate-100 pb-2">
          3. Explicit Prototype Claim Boundaries & Guardrails
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div class="p-4 bg-emerald-50/70 rounded-lg border border-emerald-200 space-y-2">
            <div class="font-bold text-emerald-950 font-mono text-[11px] flex items-center gap-1.5">
              <span class="text-emerald-700">✔</span> WHAT SWASTHYAGRID AI DELIVERS
            </div>
            <ul class="space-y-1 text-slate-700 list-disc list-inside text-[11px]">
              <li>Predictive public-health supply chain & demand resilience</li>
              <li>Dual-mode AI reasoning grounded in facility telemetry</li>
              <li>Deterministic inter-facility redistribution optimization</li>
              <li>Controlled emergency stress-testing without baseline corruption</li>
              <li>Privacy-preserving federated intelligence simulation (FedAvg)</li>
              <li>FHIR-compatible canonical operational data model</li>
              <li>Strict human-in-the-loop governance for all physical actions</li>
            </ul>
          </div>

          <div class="p-4 bg-red-50/70 rounded-lg border border-red-200 space-y-2">
            <div class="font-bold text-red-950 font-mono text-[11px] flex items-center gap-1.5">
              <span class="text-red-700">✖</span> STRICT PROTOTYPE BOUNDARIES (NON-CLAIMS)
            </div>
            <ul class="space-y-1 text-slate-700 list-disc list-inside text-[11px]">
              <li>NO real Protected Health Information (PHI) or patient records</li>
              <li>NO clinical diagnostic or therapeutic recommendations</li>
              <li>NO autonomous physical procurement or delivery dispatch</li>
              <li>NO live connection to real government hospital ERPs</li>
              <li>NO production cryptographically-hardened SMPC or homomorphic encryption</li>
              <li>NO claim of production federated network deployment</li>
              <li>NO replacement of clinical or administrative leadership</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}
