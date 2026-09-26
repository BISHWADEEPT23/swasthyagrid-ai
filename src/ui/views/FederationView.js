/**
 * SwasthyaGrid AI — BRICS Federated Intelligence Command Centre View (Build 09)
 * Route: #/federation
 *
 * Implements:
 * 1. Prominent simulation badge: "FEDERATED LEARNING SIMULATION — PROTOTYPE"
 * 2. 7 Top Federation KPIs (Active Nodes, Current Round, Global Model, Samples, Improvement, Sync)
 * 3. Data Movement Architecture Visualizer ("RAW DATA DOES NOT MOVE")
 * 4. Interactive Federation Round Runner (ROUND-004 live execution)
 * 5. National Nodes Grid (India, Brazil, South Africa, China, Russia)
 * 6. Non-IID Model Performance Comparison Panel (Local vs Federated MAPE)
 * 7. Cross-Border Knowledge Transfer Demonstration (Brazil -> South Africa)
 * 8. Model Drift Signal Warning Card (Node D China)
 * 9. Privacy & Data Sovereignty Panel
 * 10. Federation Governance & Rollback Simulator
 * 11. BRICS Multi-Tier Scale Architecture
 * 12. Federation History & Audit Trail Log
 */

import { 
  getNationalNodes, 
  setNodeStatus, 
  executeFederationRound, 
  getGlobalModel, 
  getFederationHistory, 
  getFederationAuditLog, 
  simulateRollback, 
  detectModelDrift, 
  getKnowledgeTransferDemo 
} from "../../logic/federated_service.js";
import { FEDERATION_GOVERNANCE, NODE_STATUSES } from "../../config/federation_config.js";

// View State
let isRoundRunning = false;
let roundStep = 0; // 0: Idle, 1: Local Training, 2: Update Validation, 3: FedAvg Aggregation, 4: Global Distribution
let latestRoundResult = null;
let activeTab = "nodes"; // 'nodes' | 'performance' | 'knowledge' | 'governance' | 'history'

export function renderFederationView() {
  const nodes = getNationalNodes();
  const globalModel = getGlobalModel();
  const history = getFederationHistory();
  const auditLog = getFederationAuditLog();
  const drift = detectModelDrift();
  const knowledgeDemo = getKnowledgeTransferDemo();

  const activeNodesCount = nodes.filter(n => n.node_status === "ONLINE" || n.node_status === "READY").length;
  const totalSamples = nodes.reduce((acc, n) => acc + (n.node_status !== "OFFLINE" ? n.local_dataset_size : 0), 0);

  return `
    <div class="space-y-6 pb-16">
      <!-- ==================== PROMINENT FEDERATION HEADER ==================== -->
      <div class="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-black tracking-tight text-white flex items-center gap-2">
              BRICS Federated Health Intelligence
            </h1>
            <span class="text-[10px] font-black px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono tracking-wide">
              FEDERATED LEARNING SIMULATION — PROTOTYPE
            </span>
          </div>
          <p class="text-xs text-indigo-200 mt-1 max-w-3xl">
            Collaborative predictive learning without centralizing raw health records. Sovereign national nodes train local models on local patterns and transmit privacy-preserving parameter updates for deterministic Federated Averaging (FedAvg).
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onclick="window.handleStartFederationRound()"
            ${isRoundRunning ? 'disabled class="opacity-50 cursor-not-allowed"' : ''}
            class="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400 ${isRoundRunning ? 'animate-ping' : ''}"></span>
            ${isRoundRunning ? 'Executing FedAvg...' : 'Start Federation Round 004'}
          </button>
          <button
            type="button"
            onclick="window.toggleHealthCommandCopilot('FEDERATION')"
            class="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <span>✨</span> Ask Gemini
          </button>
        </div>
      </div>

      <!-- ==================== ROUND EXECUTION PROGRESS (WHEN ACTIVE) ==================== -->
      ${isRoundRunning ? `
        <div class="p-4 rounded-xl bg-indigo-50 border-2 border-indigo-300 shadow-sm animate-pulse">
          <div class="flex items-center justify-between text-xs font-bold text-indigo-900 mb-2 font-mono">
            <span>EXECUTING FEDERATION ROUND 004</span>
            <span>Step ${roundStep} of 4: ${
              roundStep === 1 ? 'Simulating Local Sovereign Training across 4 Online Nodes...' :
              roundStep === 2 ? 'Validating Model Updates (Quality, Schema, Bounds)...' :
              roundStep === 3 ? 'Computing Weighted Federated Averaging (FedAvg)...' :
              'Redistributing GLOBAL-004 to National Health Nodes...'
            }</span>
          </div>
          <div class="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
            <div class="bg-indigo-600 h-full rounded-full transition-all duration-500" style="width: ${roundStep * 25}%"></div>
          </div>
        </div>
      ` : ""}

      <!-- ==================== 7 TOP FEDERATION KPIS ==================== -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <!-- 1. Active Nodes -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Active Nodes</div>
          <div class="text-xl font-black text-slate-900 mt-1 font-mono">${activeNodesCount} / ${nodes.length}</div>
          <div class="text-[10px] text-emerald-600 font-semibold mt-0.5">80% Quorum Online</div>
        </div>

        <!-- 2. Current Round -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Current Round</div>
          <div class="text-xl font-black text-indigo-700 mt-1 font-mono">ROUND-004</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Demo Round Ready</div>
        </div>

        <!-- 3. Global Model -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Global Model</div>
          <div class="text-xl font-black text-slate-900 mt-1 font-mono">${globalModel.model_version}</div>
          <div class="text-[10px] text-indigo-600 font-semibold mt-0.5">FedAvg Weighted</div>
        </div>

        <!-- 4. Participating Nodes -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Participants</div>
          <div class="text-xl font-black text-slate-900 mt-1 font-mono">4 Nodes</div>
          <div class="text-[10px] text-slate-500 mt-0.5">1 Node Offline (RU)</div>
        </div>

        <!-- 5. Total Samples -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Synthetic Samples</div>
          <div class="text-xl font-black text-slate-900 mt-1 font-mono">93.5k</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Aggregated Signal</div>
        </div>

        <!-- 6. Avg Improvement -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono">Avg Improvement</div>
          <div class="text-xl font-black text-emerald-600 mt-1 font-mono">+3.2%</div>
          <div class="text-[10px] text-emerald-700 font-bold mt-0.5">MAPE Reduction</div>
        </div>

        <!-- 7. Last Sync -->
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Last Federation Sync</div>
          <div class="text-xs font-black text-slate-900 mt-2 font-mono">14:15 UTC</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Node Provenance OK</div>
        </div>
      </div>

      <!-- ==================== DATA MOVEMENT & ZERO-DATA-EGRESS ARCHITECTURE ==================== -->
      <div class="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 rounded-2xl p-6 border border-indigo-800/40 text-white shadow-md">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-indigo-800/40 mb-4">
          <div>
            <h3 class="text-sm font-black text-white flex items-center gap-2">
              <span>🛡️</span> Data Sovereignty Architecture: Zero Raw Data Egress
            </h3>
            <p class="text-xs text-indigo-200">
              Raw patient records and facility telemetry never cross national borders. Only mathematical gradient/weight updates are transmitted.
            </p>
          </div>
          <div class="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-lg text-xs font-mono font-bold">
            RAW DATA DOES NOT MOVE
          </div>
        </div>

        <!-- Visual Flow Diagram -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div class="font-bold text-indigo-300 mb-2 flex items-center gap-1.5">
              <span>🏛️</span> 1. Sovereign Local Training
            </div>
            <p class="text-slate-300 text-[11px] leading-relaxed">
              Each participating nation (India, Brazil, South Africa, China, Russia) maintains isolated health data within domestic sovereign boundaries. Local models train on localized disease, bed, and supply variations.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div class="font-bold text-indigo-300 mb-2 flex items-center gap-1.5">
              <span>📦</span> 2. Model Update Transmission
            </div>
            <p class="text-slate-300 text-[11px] leading-relaxed">
              Only abstract learning artifacts (weights deltas, performance metrics, and sample counts) are sent to the Federation Coordinator. No patient IDs, clinician notes, or raw PHC logs are ever exposed.
            </p>
          </div>

          <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div class="font-bold text-indigo-300 mb-2 flex items-center gap-1.5">
              <span>🌐</span> 3. Federated Averaging (FedAvg)
            </div>
            <p class="text-slate-300 text-[11px] leading-relaxed">
              The coordinator performs sample-weighted aggregation: <code class="text-sky-300 font-mono">W_global = Σ ((n_k / N) * W_k)</code>. The resulting global model (<code class="text-sky-300 font-mono">GLOBAL-004</code>) is redistributed back to participating nodes.
            </p>
          </div>
        </div>
      </div>

      <!-- ==================== MODEL DRIFT SIGNAL ALERT (NODE D) ==================== -->
      ${drift.has_drift ? `
        <div class="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 shadow-sm flex items-start gap-3.5">
          <div class="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-base flex-shrink-0">
            ⚠️
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-black text-amber-950 font-mono uppercase tracking-wide">
                MODEL DRIFT SIGNAL DETECTED — ${drift.drifting_nodes[0].country_name.toUpperCase()} (${drift.drifting_nodes[0].node_id})
              </h3>
              <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                DRIFT SCORE: ${drift.drifting_nodes[0].drift_score}/100
              </span>
            </div>
            <p class="text-xs text-amber-900 mt-1">
              ${drift.drifting_nodes[0].description}
            </p>
            <div class="mt-2 text-[11px] font-semibold text-amber-950 flex items-center gap-1">
              <span>Action:</span>
              <span class="text-slate-700">${drift.drifting_nodes[0].recommended_action}</span>
            </div>
          </div>
        </div>
      ` : ""}

      <!-- ==================== NATIONAL NODES GRID ==================== -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>🌍</span> Participating BRICS National Health Nodes
            </h3>
            <p class="text-xs text-slate-500">Autonomous sovereign health networks participating in collaborative predictive intelligence.</p>
          </div>
          <div class="text-xs text-slate-500 font-mono">
            Configured Nodes: <span class="font-bold text-slate-900">${nodes.length}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          ${nodes.map(node => {
            const isOffline = node.node_status === "OFFLINE";
            const statusConfig = NODE_STATUSES[node.node_status] || NODE_STATUSES.ONLINE;

            return `
              <div class="p-4 rounded-xl bg-white border transition-all shadow-sm flex flex-col justify-between ${
                isOffline ? 'border-slate-200 bg-slate-50/70 opacity-75' : 'border-slate-200 hover:border-indigo-300'
              }">
                <div>
                  <!-- Node Header -->
                  <div class="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div>
                      <div class="text-xs font-black text-slate-900">${node.node_name}</div>
                      <div class="text-[10px] text-slate-400 font-mono">${node.region}</div>
                    </div>
                    <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${statusConfig.badge}">
                      ${node.node_status}
                    </span>
                  </div>

                  <!-- Node Metadata -->
                  <div class="mt-3 space-y-1.5 text-xs">
                    <div class="flex justify-between text-slate-500">
                      <span>Facilities:</span>
                      <span class="font-mono font-bold text-slate-800">${node.facilities_count} Facilities</span>
                    </div>
                    <div class="flex justify-between text-slate-500">
                      <span>Dataset Size:</span>
                      <span class="font-mono font-bold text-slate-800">${node.local_dataset_size.toLocaleString()} records</span>
                    </div>
                    <div class="flex justify-between text-slate-500">
                      <span>Local Version:</span>
                      <span class="font-mono font-bold text-slate-700">${node.local_model_version}</span>
                    </div>
                    <div class="flex justify-between text-slate-500">
                      <span>Global Version:</span>
                      <span class="font-mono font-bold text-indigo-700">${globalModel.model_version}</span>
                    </div>
                  </div>

                  <!-- Non-IID Pattern -->
                  <div class="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-600 leading-relaxed">
                    <span class="font-bold text-slate-700">Pattern:</span> ${node.synthetic_pattern}
                  </div>

                  <!-- Performance Comparison -->
                  <div class="mt-3 pt-2.5 border-t border-slate-100">
                    <div class="flex justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>Forecast Error (MAPE):</span>
                      <span class="font-mono text-emerald-600">
                        ${node.model_performance.local_mape}% → ${node.model_performance.federated_mape}%
                      </span>
                    </div>
                    <div class="flex justify-between text-[10px] text-slate-500">
                      <span>Improvement:</span>
                      <span class="font-mono font-bold ${node.model_performance.improvement_pct > 0 ? 'text-emerald-700' : 'text-slate-400'}">
                        +${node.model_performance.improvement_pct}% pts
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Toggle Status Button -->
                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span class="text-[10px] font-mono text-slate-400">Sync: ${node.last_sync ? node.last_sync.split('T')[1].substring(0, 5) : 'N/A'}</span>
                  <button
                    type="button"
                    onclick="window.handleToggleNodeStatus('${node.node_id}', '${isOffline ? 'ONLINE' : 'OFFLINE'}')"
                    class="text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                      isOffline 
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }"
                  >
                    ${isOffline ? 'Bring Online' : 'Simulate Offline'}
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- ==================== PERFORMANCE & KNOWLEDGE TRANSFER GRID ==================== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Performance Comparison (Local vs Federated) -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>📊</span> Local vs. Federated Forecast Error (Non-IID Breakdown)
              </h3>
              <span class="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                DETERMINISTIC RESULTS
              </span>
            </div>
            <p class="text-xs text-slate-500 mb-4">
              Demonstrating why federation matters: heterogeneous nodes improve forecasting accuracy by generalizing cross-border surge patterns without pooling raw data.
            </p>

            <div class="space-y-3">
              ${nodes.map(n => {
                const isOffline = n.node_status === "OFFLINE";
                return `
                  <div>
                    <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>${n.node_name}</span>
                      <span class="font-mono">
                        ${isOffline ? '<span class="text-slate-400">Offline (Unchanged)</span>' : `
                          <span class="text-slate-400 line-through mr-1">${n.model_performance.local_mape}%</span>
                          <span class="text-emerald-600 font-bold">${n.model_performance.federated_mape}% MAPE</span>
                          <span class="text-[10px] text-emerald-700 ml-1">(+${n.model_performance.improvement_pct}%)</span>
                        `}
                      </span>
                    </div>
                    <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                      <div class="bg-indigo-600 h-full rounded-full" style="width: ${100 - n.model_performance.federated_mape * 3}%"></div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500">Collaborative Network Average:</span>
            <span class="font-mono font-bold text-emerald-600">15.4% → 12.2% MAPE (+3.2% net improvement)</span>
          </div>
        </div>

        <!-- Cross-Border Knowledge Transfer Demo -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>💡</span> Cross-Border Knowledge Transfer Case Study
              </h3>
              <span class="text-[10px] font-mono bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded">
                DEMO SCENARIO
              </span>
            </div>
            <p class="text-xs text-slate-500 mb-3">
              How National Node B's logistics experience protects National Node C from an acute coastal supply shock:
            </p>

            <div class="space-y-3">
              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div class="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <span>🇧🇷</span> Node B (Brazil) Knowledge Extraction:
                </div>
                <p class="text-slate-600 text-[11px] leading-relaxed">
                  ${knowledgeDemo.source_node.learned_pattern}
                </p>
              </div>

              <div class="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs">
                <div class="font-bold text-sky-900 flex items-center gap-1.5 mb-1">
                  <span>🇿🇦</span> Node C (South Africa) Shock Averted:
                </div>
                <p class="text-sky-800 text-[11px] leading-relaxed">
                  ${knowledgeDemo.target_node.incident_simulated}
                </p>
                <div class="mt-2 grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-sky-200/60 font-mono">
                  <div>
                    <span class="text-slate-500">Local-Only Lead Time:</span>
                    <span class="text-red-600 font-bold ml-1">${knowledgeDemo.comparison.local_only.alert_lead_time_days} days</span>
                  </div>
                  <div>
                    <span class="text-slate-500">Federated Lead Time:</span>
                    <span class="text-emerald-700 font-bold ml-1">${knowledgeDemo.comparison.federated_model.alert_lead_time_days} days (+3.5d early)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
            <span>✓</span> Zero stockout: 3.8-day deficit window completely eliminated.
          </div>
        </div>
      </div>

      <!-- ==================== GOVERNANCE, AUDIT LOG & ROLLBACK ==================== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Federation Governance & Rollback Simulation -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>⚖️</span> Federation Governance & Rollback Simulation
            </h3>
            <span class="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
              POLICY RULES
            </span>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">Minimum Quorum:</span>
              <span class="font-mono font-bold text-slate-800">${FEDERATION_GOVERNANCE.MIN_PARTICIPATING_NODES} Sovereign Nodes</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">Aggregation Formula:</span>
              <span class="font-mono font-bold text-indigo-700">${FEDERATION_GOVERNANCE.AGGREGATION_FORMULA}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">Model Acceptance Limit:</span>
              <span class="font-mono font-bold text-slate-800">MAPE ≤ ${FEDERATION_GOVERNANCE.MODEL_ACCEPTANCE_THRESHOLD_MAPE}%</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">Data Quality Score Floor:</span>
              <span class="font-mono font-bold text-slate-800">Score ≥ ${FEDERATION_GOVERNANCE.DATA_QUALITY_MIN_SCORE}</span>
            </div>
          </div>

          <!-- Rollback Simulator Controls -->
          <div class="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div class="text-xs font-bold text-slate-900 mb-1">Administrative Rollback Simulator</div>
            <p class="text-[11px] text-slate-500 mb-3">
              Demonstrates governance rollback to a verified historical model version if anomalies are flagged.
            </p>
            <div class="flex items-center gap-2">
              <select
                id="rollback-version-select"
                class="text-xs font-mono px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none"
              >
                <option value="GLOBAL-003">GLOBAL-003 (Rounds 003 — Sep 19)</option>
                <option value="GLOBAL-002">GLOBAL-002 (Rounds 002 — Sep 18)</option>
                <option value="GLOBAL-001">GLOBAL-001 (Rounds 001 — Sep 17)</option>
              </select>
              <button
                type="button"
                onclick="window.handleSimulateRollback()"
                class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Simulate Rollback
              </button>
            </div>
          </div>
        </div>

        <!-- Audit Trail Log Table -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>📜</span> Federation Audit Trail & Provenance Log
            </h3>
            <span class="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
              IMMUTABLE
            </span>
          </div>

          <div class="overflow-y-auto max-h-56 space-y-2 pr-1">
            ${auditLog.map(entry => `
              <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span class="font-bold text-indigo-700">${entry.event_type}</span>
                  <span>${entry.timestamp ? entry.timestamp.split('T')[1].substring(0, 8) + ' UTC' : 'N/A'}</span>
                </div>
                <div class="text-[11px] text-slate-700">${entry.details}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- ==================== BRICS SCALE ARCHITECTURE PANEL ==================== -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 class="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
          <span>🏛️</span> BRICS Multi-Tier Scale Architecture
        </h3>
        <p class="text-xs text-slate-500 mb-4">
          Hierarchical data sovereignty model ensuring local clinics, districts, and national nodes retain complete operational autonomy while participating in collaborative global intelligence.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div class="text-xs font-black text-slate-900 font-mono">PHC Nodes</div>
            <div class="text-[10px] text-slate-500 mt-1">12 Facilities per District</div>
            <div class="text-[9px] text-emerald-600 font-bold mt-1">Local Data Resides Here</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div class="text-xs font-black text-slate-900 font-mono">District Nodes</div>
            <div class="text-[10px] text-slate-500 mt-1">District Central, North, South</div>
            <div class="text-[9px] text-slate-500 mt-1">Inter-Facility Redistribution</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div class="text-xs font-black text-slate-900 font-mono">Regional Health Boards</div>
            <div class="text-[10px] text-slate-500 mt-1">State / Province Level</div>
            <div class="text-[9px] text-slate-500 mt-1">Buffer Stock Warehousing</div>
          </div>
          <div class="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
            <div class="text-xs font-black text-indigo-900 font-mono">National Nodes</div>
            <div class="text-[10px] text-indigo-700 mt-1">National Node A (India)</div>
            <div class="text-[9px] text-indigo-800 font-bold mt-1">Sovereign Model Training</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-900 text-white">
            <div class="text-xs font-black text-white font-mono">BRICS Federated Mesh</div>
            <div class="text-[10px] text-indigo-200 mt-1">Federation Coordinator</div>
            <div class="text-[9px] text-emerald-400 font-bold mt-1">Zero-Data-Egress FedAvg</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// GLOBAL EVENT HANDLERS
// ==========================================

window.handleStartFederationRound = () => {
  if (isRoundRunning) return;
  isRoundRunning = true;
  roundStep = 1;
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();

  // Progress animation through 4 steps
  setTimeout(() => {
    roundStep = 2;
    if (window.refreshCurrentRoute) window.refreshCurrentRoute();

    setTimeout(() => {
      roundStep = 3;
      if (window.refreshCurrentRoute) window.refreshCurrentRoute();

      setTimeout(() => {
        roundStep = 4;
        latestRoundResult = executeFederationRound(4);
        if (window.refreshCurrentRoute) window.refreshCurrentRoute();

        setTimeout(() => {
          isRoundRunning = false;
          roundStep = 0;
          alert("Federation Round 004 successfully executed! GLOBAL-004 created and distributed to 4 participating nodes.");
          if (window.refreshCurrentRoute) window.refreshCurrentRoute();
        }, 800);
      }, 800);
    }, 800);
  }, 800);
};

window.handleToggleNodeStatus = (nodeId, newStatus) => {
  setNodeStatus(nodeId, newStatus);
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();
};

window.handleSimulateRollback = () => {
  const select = document.getElementById("rollback-version-select");
  const targetVer = select ? select.value : "GLOBAL-003";
  const result = simulateRollback(targetVer);
  alert(result.message);
  if (window.refreshCurrentRoute) window.refreshCurrentRoute();
};
