/**
 * SwasthyaGrid AI — BRICS Federated Learning Service (Build 09)
 *
 * Implements:
 * 1. Sovereign Local Training Simulation (Zero raw data egress)
 * 2. Model Update Validation & Extreme Value Protection
 * 3. Deterministic Federated Averaging (FedAvg) Weighted Aggregation
 * 4. Federation Round Orchestration (Discovery -> Training -> FedAvg -> Redistribution)
 * 5. Model Versioning & Provenance Tracking (GLOBAL-001 -> GLOBAL-004)
 * 6. Governance Rollback Simulation
 * 7. Model Drift Detection on Heterogeneous (Non-IID) Nodes
 * 8. Cross-Border Knowledge Transfer Simulation (Brazil -> South Africa)
 * 9. Immutable Audit Logging
 *
 * STRICTLY A SIMULATION / PROTOTYPE — Zero raw patient or facility health records transmitted.
 */

import { 
  INITIAL_NATIONAL_NODES, 
  FEDERATION_GOVERNANCE, 
  HISTORICAL_ROUNDS, 
  DEMO_ROUND_004_CONFIG, 
  KNOWLEDGE_TRANSFER_DEMO,
  NODE_STATUSES 
} from "../config/federation_config.js";

// In-memory state
let currentNodes = JSON.parse(JSON.stringify(INITIAL_NATIONAL_NODES));
let federationHistory = JSON.parse(JSON.stringify(HISTORICAL_ROUNDS));
let activeGlobalModel = {
  model_version: "GLOBAL-003",
  created_at: "2026-09-19T08:15:10Z",
  participating_nodes: ["NODE-IN-01", "NODE-BR-01", "NODE-ZA-01", "NODE-CN-01", "NODE-RU-01"],
  aggregation_method: FEDERATION_GOVERNANCE.AGGREGATION_METHOD,
  aggregation_formula: FEDERATION_GOVERNANCE.AGGREGATION_FORMULA,
  training_sample_equivalent: 115000,
  average_mape: 13.9,
  average_mae: 14.8,
  status: "ACTIVE"
};

// Immutable Audit Log
const AUDIT_LOG = [
  {
    timestamp: "2026-09-17T08:14:22Z",
    event_type: "ROUND_COMPLETED",
    round_id: "ROUND-001",
    model_version: "GLOBAL-001",
    details: "Bootstrap round across 5 national nodes completed. 115,000 samples aggregated."
  },
  {
    timestamp: "2026-09-18T08:12:45Z",
    event_type: "ROUND_COMPLETED",
    round_id: "ROUND-002",
    model_version: "GLOBAL-002",
    details: "Round 002 completed with 4 nodes. Node E excluded due to scheduled offline maintenance."
  },
  {
    timestamp: "2026-09-19T08:15:10Z",
    event_type: "ROUND_COMPLETED",
    round_id: "ROUND-003",
    model_version: "GLOBAL-003",
    details: "Round 003 completed with all 5 nodes. Average MAPE improved to 13.9%."
  }
];

// ==========================================
// 1. NATIONAL NODE MANAGEMENT
// ==========================================

export function getNationalNodes() {
  return JSON.parse(JSON.stringify(currentNodes));
}

export function getNodeById(nodeId) {
  return currentNodes.find(n => n.node_id === nodeId) || null;
}

export function setNodeStatus(nodeId, status) {
  const node = currentNodes.find(n => n.node_id === nodeId);
  if (node) {
    node.node_status = status;
    AUDIT_LOG.unshift({
      timestamp: new Date().toISOString(),
      event_type: "NODE_STATUS_CHANGE",
      round_id: "SYSTEM",
      model_version: activeGlobalModel.model_version,
      details: `${node.node_name} status updated to ${status}.`
    });
    return true;
  }
  return false;
}

// ==========================================
// 2. LOCAL TRAINING SIMULATION
// ==========================================

/**
 * Simulates local model training within a sovereign national node.
 * Generates an aggregated model update artifact.
 * GUARANTEE: Raw local health/facility records are NEVER included.
 */
export function simulateLocalTraining(nodeId, roundId = "ROUND-004") {
  const node = getNodeById(nodeId);
  if (!node) throw new Error(`Node ${nodeId} not found.`);

  // Generate deterministic synthetic weights delta
  const weightMagnitude = Number((0.035 + (node.non_iid_factor * 0.008)).toFixed(4));
  
  return {
    round_id: roundId,
    node_id: node.node_id,
    country_name: node.country_name,
    country_code: node.country_code,
    model_version: `LOCAL-${node.country_code}-004`,
    training_samples: node.local_dataset_size,
    update_summary: {
      weights_delta_magnitude: weightMagnitude,
      features_trained: [
        "seasonal_demand_index",
        "inpatient_admission_velocity",
        "supplier_lead_time_variance",
        "buffer_depletion_rate"
      ],
      dominant_pattern: node.synthetic_pattern
    },
    performance_metrics: {
      local_mape: node.model_performance.local_mape,
      projected_federated_mape: node.model_performance.federated_mape,
      mae: node.model_performance.mae
    },
    data_quality_score: 94.2,
    generated_at: new Date().toISOString()
  };
}

// ==========================================
// 3. MODEL UPDATE VALIDATION
// ==========================================

/**
 * Deterministically validates an incoming local model update before aggregation.
 * Protects against malformed schemas, insufficient sample counts, and extreme divergence.
 */
export function validateModelUpdate(update) {
  if (!update || !update.node_id) {
    return { isValid: false, reason: "Missing or malformed update payload." };
  }

  if (!update.training_samples || update.training_samples < 1000) {
    return { isValid: false, reason: "Insufficient local training sample count (< 1,000 samples)." };
  }

  if (update.data_quality_score < FEDERATION_GOVERNANCE.DATA_QUALITY_MIN_SCORE) {
    return { isValid: false, reason: `Data quality score ${update.data_quality_score} below minimum threshold (${FEDERATION_GOVERNANCE.DATA_QUALITY_MIN_SCORE}).` };
  }

  if (update.performance_metrics?.local_mape > FEDERATION_GOVERNANCE.MODEL_ACCEPTANCE_THRESHOLD_MAPE) {
    return { isValid: false, reason: `Local error MAPE ${update.performance_metrics.local_mape}% exceeds acceptance threshold (${FEDERATION_GOVERNANCE.MODEL_ACCEPTANCE_THRESHOLD_MAPE}%).` };
  }

  // Extreme value / divergence check
  if (update.update_summary?.weights_delta_magnitude > 0.5) {
    return { isValid: false, reason: "Update weights delta magnitude exceeds safety divergence boundary (> 0.50)." };
  }

  return { isValid: true, reason: "Update validated successfully." };
}

// ==========================================
// 4. FEDERATED AVERAGING (FedAvg) AGGREGATION
// ==========================================

/**
 * Computes Federated Averaging (FedAvg) over valid participating node updates:
 * W_global = Σ ((n_k / N) * W_k)
 */
export function aggregateFederatedUpdates(validUpdates) {
  if (!validUpdates || validUpdates.length === 0) {
    throw new Error("Cannot aggregate empty update list.");
  }

  const totalSamples = validUpdates.reduce((acc, u) => acc + u.training_samples, 0);

  // Weighted average MAPE
  let weightedMapeSum = 0;
  let weightedMaeSum = 0;

  validUpdates.forEach(u => {
    const weight = u.training_samples / totalSamples;
    weightedMapeSum += u.performance_metrics.projected_federated_mape * weight;
    weightedMaeSum += u.performance_metrics.mae * weight;
  });

  const avgMape = Number(weightedMapeSum.toFixed(1));
  const avgMae = Number(weightedMaeSum.toFixed(1));

  return {
    participating_nodes: validUpdates.map(u => u.node_id),
    total_training_samples: totalSamples,
    average_mape: avgMape,
    average_mae: avgMae,
    aggregation_weights: validUpdates.map(u => ({
      node_id: u.node_id,
      country_name: u.country_name,
      sample_count: u.training_samples,
      weight_pct: Number(((u.training_samples / totalSamples) * 100).toFixed(1))
    }))
  };
}

// ==========================================
// 5. FEDERATION ROUND ORCHESTRATION
// ==========================================

/**
 * Executes a complete federation round.
 * Demonstrates: Discovery -> Local Training -> Validation -> FedAvg -> Global Model Creation -> Distribution.
 */
export function executeFederationRound(roundNumber = 4) {
  const roundId = `ROUND-00${roundNumber}`;
  const nextGlobalVersion = `GLOBAL-00${roundNumber}`;
  const startTime = new Date().toISOString();

  // 1. Identify Eligible Nodes (Status ONLINE or READY)
  const eligibleNodes = currentNodes.filter(n => n.node_status === "ONLINE" || n.node_status === "READY");
  const offlineNodes = currentNodes.filter(n => n.node_status === "OFFLINE" || n.node_status === "EXCLUDED");

  if (eligibleNodes.length < FEDERATION_GOVERNANCE.MIN_PARTICIPATING_NODES) {
    throw new Error(`Insufficient eligible nodes (${eligibleNodes.length}). Minimum required quorum is ${FEDERATION_GOVERNANCE.MIN_PARTICIPATING_NODES}.`);
  }

  // 2. Simulate Local Training for each eligible node
  const localUpdates = eligibleNodes.map(node => simulateLocalTraining(node.node_id, roundId));

  // 3. Validate Updates
  const validUpdates = [];
  const rejectedUpdates = [];

  localUpdates.forEach(update => {
    const validation = validateModelUpdate(update);
    if (validation.isValid) {
      validUpdates.push(update);
    } else {
      rejectedUpdates.push({ ...update, rejection_reason: validation.reason });
    }
  });

  // 4. Federated Aggregation (FedAvg)
  const aggregationResult = aggregateFederatedUpdates(validUpdates);
  const completionTime = new Date().toISOString();

  // 5. Create New Global Model Version
  const newGlobalModel = {
    model_version: nextGlobalVersion,
    created_at: completionTime,
    participating_nodes: aggregationResult.participating_nodes,
    excluded_nodes: offlineNodes.map(n => n.node_id),
    aggregation_method: FEDERATION_GOVERNANCE.AGGREGATION_METHOD,
    aggregation_formula: FEDERATION_GOVERNANCE.AGGREGATION_FORMULA,
    training_sample_equivalent: aggregationResult.total_training_samples,
    average_mape: aggregationResult.average_mape,
    average_mae: aggregationResult.average_mae,
    weights_breakdown: aggregationResult.aggregation_weights,
    status: "ACTIVE"
  };

  activeGlobalModel = newGlobalModel;

  // 6. Redistribute to participating national nodes
  currentNodes.forEach(node => {
    if (aggregationResult.participating_nodes.includes(node.node_id)) {
      node.local_model_version = `LOCAL-${node.country_code}-00${roundNumber}`;
      node.last_training_round = roundId;
      node.last_sync = completionTime;
      node.contribution_status = "ACTIVE";
      node.node_status = "ONLINE";
    } else {
      // Offline nodes stay on their existing version
      node.contribution_status = "EXCLUDED";
    }
  });

  // 7. Record to History & Audit Log
  const roundSummary = {
    round_id: roundId,
    global_model_version: nextGlobalVersion,
    start_time: startTime,
    completion_time: completionTime,
    participating_nodes: aggregationResult.participating_nodes,
    excluded_nodes: offlineNodes.map(n => n.node_id),
    aggregation_status: "COMPLETED",
    total_training_samples: aggregationResult.total_training_samples,
    average_model_mape: aggregationResult.average_mape,
    average_improvement_pct: 3.2,
    rejected_updates: rejectedUpdates
  };

  federationHistory.unshift(roundSummary);

  AUDIT_LOG.unshift({
    timestamp: completionTime,
    event_type: "ROUND_COMPLETED",
    round_id: roundId,
    model_version: nextGlobalVersion,
    details: `Federation round completed. ${aggregationResult.participating_nodes.length} nodes aggregated (${aggregationResult.total_training_samples.toLocaleString()} samples). Global version ${nextGlobalVersion} deployed.`
  });

  return {
    round_id: roundId,
    global_model: newGlobalModel,
    round_summary: roundSummary,
    updated_nodes: currentNodes
  };
}

// ==========================================
// 6. GLOBAL MODEL & HISTORY
// ==========================================

export function getGlobalModel() {
  return JSON.parse(JSON.stringify(activeGlobalModel));
}

export function getActiveFederationRound() {
  return getGlobalModel();
}

export function getFederationHistory() {
  return JSON.parse(JSON.stringify(federationHistory));
}

export function getFederationAuditLog() {
  return JSON.parse(JSON.stringify(AUDIT_LOG));
}

// ==========================================
// 7. GOVERNANCE ROLLBACK SIMULATION
// ==========================================

/**
 * Simulates administrative rollback to a previous global model version.
 * Demonstrates governance and accountability without breaking production.
 */
export function simulateRollback(targetVersion = "GLOBAL-003") {
  const previousModel = federationHistory.find(r => r.global_model_version === targetVersion);
  if (!previousModel) {
    return {
      success: false,
      message: `Model version ${targetVersion} not found in historical provenance tree.`
    };
  }

  activeGlobalModel = {
    model_version: targetVersion,
    created_at: previousModel.completion_time,
    participating_nodes: previousModel.participating_nodes,
    aggregation_method: FEDERATION_GOVERNANCE.AGGREGATION_METHOD,
    training_sample_equivalent: previousModel.total_training_samples,
    average_mape: previousModel.average_model_mape,
    status: "RESTORED_VIA_ROLLBACK"
  };

  AUDIT_LOG.unshift({
    timestamp: new Date().toISOString(),
    event_type: "GOVERNANCE_ROLLBACK",
    round_id: previousModel.round_id,
    model_version: targetVersion,
    details: `Administrator simulated rollback to ${targetVersion} (Audit record: GOV-RB-${Date.now()}).`
  });

  return {
    success: true,
    message: `System successfully restored to ${targetVersion}. National nodes notified.`,
    active_model: activeGlobalModel
  };
}

// ==========================================
// 8. MODEL DRIFT DETECTION
// ==========================================

/**
 * Simulates model drift detection on a national node.
 * Demonstrates how federated learning flags localized regime changes.
 */
export function detectModelDrift() {
  // China (Node D) demonstrates demand shift drift
  const driftingNode = currentNodes.find(n => n.node_id === "NODE-CN-01");
  
  return {
    has_drift: true,
    drifting_nodes: [
      {
        node_id: "NODE-CN-01",
        country_name: "China",
        node_name: "National Node D (China)",
        drift_metric: "Patient Footfall Distribution Shift",
        baseline_variance: 0.12,
        current_variance: 0.38,
        drift_score: 82, // 0–100
        severity: "WARNING",
        description: "Localized demographic migration has induced a 28% deviation in outpatient footfall patterns. Local model error increased by +2.4 percentage points.",
        recommended_action: "Incorporate Node D's updated local parameters into the next global federation round to generalize new demographic weights."
      }
    ]
  };
}

// ==========================================
// 9. KNOWLEDGE TRANSFER DEMO
// ==========================================

export function getKnowledgeTransferDemo() {
  return JSON.parse(JSON.stringify(KNOWLEDGE_TRANSFER_DEMO));
}
