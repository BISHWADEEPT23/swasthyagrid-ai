/**
 * SwasthyaGrid AI — BRICS Federated Intelligence Layer Configuration (Build 09)
 *
 * Centralizes:
 * 1. Configurable National Health Nodes metadata (BRICS simulated participants)
 * 2. Node lifecycle states (ONLINE, OFFLINE, TRAINING, READY, SYNCING, EXCLUDED)
 * 3. Federation Governance & Aggregation constraints (FedAvg parameters, quorum)
 * 4. Historical Federation Rounds (Rounds 001–003)
 * 5. Demonstration Federation Round (ROUND-004) preset
 * 6. Non-IID performance metrics & synthetic error profiles
 * 7. Knowledge Transfer Demonstration parameters
 * 8. Model Drift signal definitions
 *
 * STRICTLY A SIMULATION / PROTOTYPE — Zero raw facility-level or patient health records transferred.
 */

export const NODE_STATUSES = {
  ONLINE: { code: "ONLINE", label: "Online & Ready", color: "emerald", badge: "bg-emerald-100 text-emerald-800" },
  OFFLINE: { code: "OFFLINE", label: "Temporarily Offline", color: "slate", badge: "bg-slate-100 text-slate-700" },
  TRAINING: { code: "TRAINING", label: "Local Training in Progress", color: "sky", badge: "bg-sky-100 text-sky-800 animate-pulse" },
  READY: { code: "READY", label: "Update Validated & Ready", color: "indigo", badge: "bg-indigo-100 text-indigo-800" },
  SYNCING: { code: "SYNCING", label: "Synchronizing Global Model", color: "amber", badge: "bg-amber-100 text-amber-800 animate-pulse" },
  EXCLUDED: { code: "EXCLUDED", label: "Excluded from Round", color: "rose", badge: "bg-rose-100 text-rose-800" }
};

export const INITIAL_NATIONAL_NODES = [
  {
    node_id: "NODE-IN-01",
    country_name: "India",
    country_code: "IN",
    node_name: "National Node A (India)",
    region: "South Asia",
    node_status: "ONLINE",
    facilities_count: 12,
    local_dataset_size: 18500,
    local_model_version: "LOCAL-IN-003",
    last_training_round: "ROUND-003",
    model_performance: {
      local_mape: 13.5,
      federated_mape: 10.8,
      improvement_pct: 2.7,
      mae: 14.2
    },
    contribution_status: "ACTIVE",
    privacy_status: "STRICT_SOVEREIGNTY",
    last_sync: "2026-09-20T12:00:00Z",
    synthetic_pattern: "Seasonal medicine-demand variation (monsoon/vector-borne surges)",
    non_iid_factor: 1.15
  },
  {
    node_id: "NODE-BR-01",
    country_name: "Brazil",
    country_code: "BR",
    node_name: "National Node B (Brazil)",
    region: "South America",
    node_status: "ONLINE",
    facilities_count: 18,
    local_dataset_size: 24200,
    local_model_version: "LOCAL-BR-003",
    last_training_round: "ROUND-003",
    model_performance: {
      local_mape: 17.2,
      federated_mape: 12.9,
      improvement_pct: 4.3,
      mae: 18.5
    },
    contribution_status: "ACTIVE",
    privacy_status: "STRICT_SOVEREIGNTY",
    last_sync: "2026-09-20T11:45:00Z",
    synthetic_pattern: "Higher delivery variability & remote riverine transport delays",
    non_iid_factor: 1.35
  },
  {
    node_id: "NODE-ZA-01",
    country_name: "South Africa",
    country_code: "ZA",
    node_name: "National Node C (South Africa)",
    region: "Southern Africa",
    node_status: "ONLINE",
    facilities_count: 14,
    local_dataset_size: 19800,
    local_model_version: "LOCAL-ZA-003",
    last_training_round: "ROUND-003",
    model_performance: {
      local_mape: 14.8,
      federated_mape: 11.2,
      improvement_pct: 3.6,
      mae: 15.1
    },
    contribution_status: "ACTIVE",
    privacy_status: "STRICT_SOVEREIGNTY",
    last_sync: "2026-09-20T12:10:00Z",
    synthetic_pattern: "Stronger bed-capacity pressure & acute inpatient inflow surges",
    non_iid_factor: 1.20
  },
  {
    node_id: "NODE-CN-01",
    country_name: "China",
    country_code: "CN",
    node_name: "National Node D (China)",
    region: "East Asia",
    node_status: "ONLINE",
    facilities_count: 22,
    local_dataset_size: 31000,
    local_model_version: "LOCAL-CN-003",
    last_training_round: "ROUND-003",
    model_performance: {
      local_mape: 16.4,
      federated_mape: 15.8,
      improvement_pct: 0.6,
      mae: 16.9
    },
    contribution_status: "ACTIVE",
    privacy_status: "STRICT_SOVEREIGNTY",
    last_sync: "2026-09-20T12:05:00Z",
    synthetic_pattern: "Periodic demand spikes & rapid demographic density shifts",
    non_iid_factor: 1.40
  },
  {
    node_id: "NODE-RU-01",
    country_name: "Russia",
    country_code: "RU",
    node_name: "National Node E (Russia)",
    region: "Northern Eurasia",
    node_status: "OFFLINE",
    facilities_count: 16,
    local_dataset_size: 21500,
    local_model_version: "LOCAL-RU-003",
    last_training_round: "ROUND-003",
    model_performance: {
      local_mape: 15.1,
      federated_mape: 15.1,
      improvement_pct: 0.0,
      mae: 15.8
    },
    contribution_status: "EXCLUDED",
    privacy_status: "STRICT_SOVEREIGNTY",
    last_sync: "2026-09-20T08:30:00Z",
    synthetic_pattern: "Supply-chain disruption & extreme climate cold-chain logistics",
    non_iid_factor: 1.25
  }
];

export const FEDERATION_GOVERNANCE = {
  MIN_PARTICIPATING_NODES: 3,
  AGGREGATION_METHOD: "FEDERATED_AVERAGING_WEIGHTED",
  AGGREGATION_FORMULA: "W_global = Σ ((n_k / N) * W_k)",
  MODEL_ACCEPTANCE_THRESHOLD_MAPE: 25.0,
  DATA_QUALITY_MIN_SCORE: 70.0,
  MAX_UPDATE_DIVERGENCE_THRESHOLD: 3.0, // standard deviations
  ROUND_TIMEOUT_SECONDS: 60,
  PRIVACY_MECHANISM: "Zero-Raw-Data-Egress (Only local parameter updates transmitted)",
  PROVENANCE_TRACKING: "Deterministic SHA-256 update signatures"
};

export const HISTORICAL_ROUNDS = [
  {
    round_id: "ROUND-001",
    global_model_version: "GLOBAL-001",
    start_time: "2026-09-17T08:00:00Z",
    completion_time: "2026-09-17T08:14:22Z",
    participating_nodes: ["NODE-IN-01", "NODE-BR-01", "NODE-ZA-01", "NODE-CN-01", "NODE-RU-01"],
    excluded_nodes: [],
    aggregation_status: "COMPLETED",
    total_training_samples: 115000,
    average_model_mape: 18.2,
    average_improvement_pct: 1.8,
    notes: "Initial bootstrap federated round across all 5 founding national nodes."
  },
  {
    round_id: "ROUND-002",
    global_model_version: "GLOBAL-002",
    start_time: "2026-09-18T08:00:00Z",
    completion_time: "2026-09-18T08:12:45Z",
    participating_nodes: ["NODE-IN-01", "NODE-BR-01", "NODE-ZA-01", "NODE-CN-01"],
    excluded_nodes: ["NODE-RU-01"],
    aggregation_status: "COMPLETED",
    total_training_samples: 93500,
    average_model_mape: 15.6,
    average_improvement_pct: 2.6,
    notes: "Node E offline due to local infrastructure maintenance. 4 nodes aggregated successfully."
  },
  {
    round_id: "ROUND-003",
    global_model_version: "GLOBAL-003",
    start_time: "2026-09-19T08:00:00Z",
    completion_time: "2026-09-19T08:15:10Z",
    participating_nodes: ["NODE-IN-01", "NODE-BR-01", "NODE-ZA-01", "NODE-CN-01", "NODE-RU-01"],
    excluded_nodes: [],
    aggregation_status: "COMPLETED",
    total_training_samples: 115000,
    average_model_mape: 13.9,
    average_improvement_pct: 1.7,
    notes: "Full quorum restored. Supply-chain shock parameters shared across all nodes."
  }
];

export const DEMO_ROUND_004_CONFIG = {
  round_id: "ROUND-004",
  global_model_version: "GLOBAL-004",
  target_nodes_count: 5,
  participating_nodes: ["NODE-IN-01", "NODE-BR-01", "NODE-ZA-01", "NODE-CN-01"],
  excluded_nodes: ["NODE-RU-01"],
  exclusion_reason: "Node offline during synchronization window (Network Timeout)",
  aggregation_status: "READY_TO_AGGREGATE",
  expected_improvement_pct: 3.2,
  description: "Live demonstration round: 4 nodes actively participate while Node E remains offline. Demonstrates non-IID learning, weighted FedAvg, and offline node isolation."
};

export const KNOWLEDGE_TRANSFER_DEMO = {
  title: "Cross-Border Supply Shock Knowledge Transfer",
  source_node: {
    node_id: "NODE-BR-01",
    country_name: "Brazil",
    learned_pattern: "Riverine logistics disruption leading to 4.2-day delivery lag and rapid stock depletion of resuscitation fluids."
  },
  target_node: {
    node_id: "NODE-ZA-01",
    country_name: "South Africa",
    incident_simulated: "Acute coastal road flooding delaying supplier delivery of IV Fluids."
  },
  comparison: {
    local_only: {
      alert_lead_time_days: 1.5,
      shortage_window_days: 3.8,
      stockout_probability: 78,
      summary: "Local-only model fails to anticipate delivery lag until stock drops below 2.0 days."
    },
    federated_model: {
      alert_lead_time_days: 5.0,
      shortage_window_days: 0.0,
      stockout_probability: 14,
      summary: "Federated model applies learned delivery variability pattern from Brazil, triggering inter-facility transfer 5 days early and averting stockout."
    }
  }
};
