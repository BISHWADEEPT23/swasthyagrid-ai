/**
 * SwasthyaGrid AI — Recommended Resource Transfers Service (Build 07)
 *
 * Integrates with:
 * - Redistribution Engine (src/logic/redistribution_engine.js)
 * - Server Transfer State Machine (server.py)
 *
 * Implements:
 * 1. Dynamic transfer recommendations generated from multi-criteria optimization
 * 2. In-memory transfer registry with lifecycle tracking (PROPOSED -> DISPATCHED -> IN_TRANSIT -> DELIVERED)
 * 3. 1-Click Dispatch & Delivery management
 * 4. "What-If" Transfer Simulation binding
 */

import { generateRedistributionPlan, simulateTransferImpact, getTransitLogistics } from "./redistribution_engine.js";
import { TRANSFER_STATUS } from "../config/redistribution_config.js";

// In-memory active transfer registry
let ACTIVE_TRANSFERS_REGISTRY = null;

function initTransferRegistry() {
  if (ACTIVE_TRANSFERS_REGISTRY) return ACTIVE_TRANSFERS_REGISTRY;

  const plan = generateRedistributionPlan();
  ACTIVE_TRANSFERS_REGISTRY = new Map();

  plan.recommendations.forEach(rec => {
    ACTIVE_TRANSFERS_REGISTRY.set(rec.transfer_id, {
      ...rec,
      status: TRANSFER_STATUS.PROPOSED,
      created_at: "2026-09-20T12:00:00Z",
      dispatched_at: null,
      delivered_at: null,
      driver_name: null,
      vehicle_no: null
    });
  });

  return ACTIVE_TRANSFERS_REGISTRY;
}

/**
 * Returns all active transfer proposals and in-transit shipments.
 */
export function getRecommendedTransfers() {
  const registry = initTransferRegistry();
  return Array.from(registry.values());
}

/**
 * Dispatches a transfer, transitioning state to IN_TRANSIT.
 */
export function dispatchTransfer(transferId, driverName = "Driver R. Kumar", vehicleNo = "DL-1VA-4482") {
  const registry = initTransferRegistry();
  const tx = registry.get(transferId);
  if (tx) {
    tx.status = TRANSFER_STATUS.IN_TRANSIT;
    tx.dispatched_at = new Date().toISOString();
    tx.driver_name = driverName;
    tx.vehicle_no = vehicleNo;
    tx.updated_at = new Date().toISOString();
    return tx;
  }
  return null;
}

/**
 * Delivers a transfer, transitioning state to DELIVERED.
 */
export function deliverTransfer(transferId, receivedBy = "Head Pharmacist") {
  const registry = initTransferRegistry();
  const tx = registry.get(transferId);
  if (tx) {
    tx.status = TRANSFER_STATUS.DELIVERED;
    tx.delivered_at = new Date().toISOString();
    tx.received_by = receivedBy;
    tx.updated_at = new Date().toISOString();
    return tx;
  }
  return null;
}

/**
 * Simulates transfer impact between two facilities.
 */
export function simulateTransfer(sourcePhcId, targetPhcId, medicineId, quantity) {
  return simulateTransferImpact(sourcePhcId, targetPhcId, medicineId, quantity);
}
