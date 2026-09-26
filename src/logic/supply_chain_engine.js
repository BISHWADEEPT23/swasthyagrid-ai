/**
 * SwasthyaGrid AI — Supply Chain Intelligence & Calculation Engine (Build 03)
 *
 * Deterministic business logic calculations:
 * 1. Days of Stock
 * 2. Stock Coverage
 * 3. Safety Stock Gap
 * 4. Reorder Status
 * 5. Estimated Stock-out Date
 * 6. Delivery Risk & Shortage Window
 * 7. Expected Stock Before & After Delivery
 * 8. Expiry Risk
 * 9. Surplus Detection
 * 10. PHC Medicine Supply Pressure Score (0–100)
 * 11. District Aggregation
 * 12. Data Validation
 */

import { SUPPLY_CHAIN_CONFIG } from "../config/supply_chain_config.js";

const REF_DATE = new Date(SUPPLY_CHAIN_CONFIG.REFERENCE_DATE);

/**
 * Calculates days of stock remaining.
 * days_of_stock = current_stock / daily_consumption
 * Handles zero consumption safely.
 * @param {number} currentStock
 * @param {number} dailyConsumption
 * @returns {number} Float (e.g. 2.1875)
 */
export function calculateDaysOfStock(currentStock, dailyConsumption) {
  const stock = Number(currentStock) || 0;
  const consumption = Number(dailyConsumption) || 0;

  if (consumption <= 0) {
    return stock > 0 ? 999.0 : 0.0;
  }
  return stock / consumption;
}

/**
 * Returns formatted days of stock (1 decimal place, e.g. "2.2").
 * @param {number} currentStock
 * @param {number} dailyConsumption
 * @returns {string}
 */
export function formatDaysOfStock(currentStock, dailyConsumption) {
  const days = calculateDaysOfStock(currentStock, dailyConsumption);
  return days.toFixed(1);
}

/**
 * Calculates safety stock gap.
 * safety_stock_gap = current_stock - minimum_safety_stock
 * @param {number} currentStock
 * @param {number} minimumSafetyStock
 * @returns {number}
 */
export function calculateSafetyStockGap(currentStock, minimumSafetyStock) {
  const stock = Number(currentStock) || 0;
  const safety = Number(minimumSafetyStock) || 0;
  return stock - safety;
}

/**
 * Checks if medicine requires replenishment.
 * current_stock <= reorder_level
 * @param {number} currentStock
 * @param {number} reorderLevel
 * @returns {boolean}
 */
export function evaluateReorderStatus(currentStock, reorderLevel) {
  const stock = Number(currentStock) || 0;
  const reorder = Number(reorderLevel) || 0;
  return stock <= reorder;
}

/**
 * Calculates estimated stock-out date.
 * estimated_stockout_date = current_date + days_of_stock
 * @param {number} currentStock
 * @param {number} dailyConsumption
 * @param {Date} currentDate
 * @returns {Date}
 */
export function calculateEstimatedStockoutDate(currentStock, dailyConsumption, currentDate = REF_DATE) {
  const days = calculateDaysOfStock(currentStock, dailyConsumption);
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(currentDate.getTime() + ms);
}

/**
 * Evaluates delivery risk and expected stock before & after scheduled delivery.
 * @param {Object} item - Inventory item
 * @param {Date} currentDate
 * @returns {Object} Delivery risk analysis
 */
export function calculateDeliveryRisk(item, currentDate = REF_DATE) {
  const currentStock = Number(item.current_stock) || 0;
  const dailyConsumption = Number(item.daily_consumption) || 0;
  const expectedQty = Number(item.expected_delivery_quantity) || 0;
  const nextDelivery = item.next_delivery_date ? new Date(item.next_delivery_date) : null;

  if (!nextDelivery || isNaN(nextDelivery.getTime())) {
    return {
      hasDeliveryRisk: false,
      daysUntilDelivery: 0,
      shortageWindowDays: 0,
      estimatedStockAtDelivery: currentStock,
      projectedPostDeliveryStock: currentStock + expectedQty
    };
  }

  const daysUntilDelivery = Math.max(0, (nextDelivery.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
  const daysOfStock = calculateDaysOfStock(currentStock, dailyConsumption);

  // estimated_stock_at_delivery = current_stock - (daily_consumption * days_until_delivery)
  const estimatedStockAtDelivery = currentStock - (dailyConsumption * daysUntilDelivery);

  // projected_post_delivery_stock = estimated_stock_at_delivery + expected_delivery_quantity
  const projectedPostDeliveryStock = estimatedStockAtDelivery + expectedQty;

  const hasDeliveryRisk = daysOfStock < daysUntilDelivery;
  const shortageWindowDays = hasDeliveryRisk ? Number((daysUntilDelivery - daysOfStock).toFixed(1)) : 0;

  return {
    hasDeliveryRisk,
    daysUntilDelivery: Number(daysUntilDelivery.toFixed(1)),
    shortageWindowDays,
    estimatedStockAtDelivery: Math.round(estimatedStockAtDelivery),
    projectedPostDeliveryStock: Math.round(projectedPostDeliveryStock)
  };
}

/**
 * Classifies supply chain risk level (CRITICAL | WARNING | WATCH | NORMAL).
 * Deterministic operational rules based on SUPPLY_CHAIN_CONFIG.
 * @param {Object} item
 * @param {Date} currentDate
 * @returns {Object} Risk classification details
 */
export function classifySupplyRisk(item, currentDate = REF_DATE) {
  const days = calculateDaysOfStock(item.current_stock, item.daily_consumption);
  const safetyGap = calculateSafetyStockGap(item.current_stock, item.minimum_safety_stock);
  const deliveryRisk = calculateDeliveryRisk(item, currentDate);
  const isReorder = evaluateReorderStatus(item.current_stock, item.reorder_level);

  const cfg = SUPPLY_CHAIN_CONFIG.STOCK_COVERAGE_THRESHOLDS;

  // CRITICAL: days <= 3 OR stockout occurs before scheduled delivery
  if (days <= cfg.CRITICAL_DAYS || (deliveryRisk.hasDeliveryRisk && deliveryRisk.shortageWindowDays >= 1.0)) {
    let reason = `Stock coverage critical (${days.toFixed(1)} days remaining).`;
    if (deliveryRisk.hasDeliveryRisk) {
      reason = `Projected stock depletion occurs before scheduled delivery (shortage window: ~${deliveryRisk.shortageWindowDays} days).`;
    }
    return {
      level: "CRITICAL",
      reason,
      daysOfStock: Number(days.toFixed(1)),
      shortageWindowDays: deliveryRisk.shortageWindowDays,
      ...SUPPLY_CHAIN_CONFIG.STATUS_STYLES.CRITICAL
    };
  }

  // WARNING: days <= 7 OR stock below minimum safety stock
  if (days <= cfg.WARNING_DAYS || safetyGap < 0) {
    let reason = `Stock coverage below warning threshold (${days.toFixed(1)} days).`;
    if (safetyGap < 0) {
      reason = `Stock deficit below minimum safety stock (${Math.abs(safetyGap)} units deficit).`;
    }
    return {
      level: "WARNING",
      reason,
      daysOfStock: Number(days.toFixed(1)),
      shortageWindowDays: 0,
      ...SUPPLY_CHAIN_CONFIG.STATUS_STYLES.WARNING
    };
  }

  // WATCH: days <= 14 OR stock <= reorder level
  if (days <= cfg.WATCH_DAYS || isReorder) {
    let reason = `Stock approaching reorder level (${days.toFixed(1)} days of stock).`;
    return {
      level: "WATCH",
      reason,
      daysOfStock: Number(days.toFixed(1)),
      shortageWindowDays: 0,
      ...SUPPLY_CHAIN_CONFIG.STATUS_STYLES.WATCH
    };
  }

  // NORMAL: days > 14 and above configured safety & reorder thresholds
  return {
    level: "NORMAL",
    reason: `Adequate stock coverage (${days.toFixed(1)} days) and healthy safety buffer.`,
    daysOfStock: Number(days.toFixed(1)),
    shortageWindowDays: 0,
    ...SUPPLY_CHAIN_CONFIG.STATUS_STYLES.NORMAL
  };
}

/**
 * Evaluates expiry risk based on calendar days to expiry date.
 * @param {string} expiryDateStr
 * @param {Date} currentDate
 * @returns {Object} Expiry risk evaluation
 */
export function evaluateExpiryRisk(expiryDateStr, currentDate = REF_DATE) {
  if (!expiryDateStr) {
    return { level: "NORMAL", daysToExpiry: 999, label: "NORMAL" };
  }

  const exp = new Date(expiryDateStr);
  if (isNaN(exp.getTime())) {
    return { level: "NORMAL", daysToExpiry: 999, label: "NORMAL" };
  }

  const daysToExpiry = Math.ceil((exp.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
  const cfg = SUPPLY_CHAIN_CONFIG.EXPIRY_THRESHOLDS;

  if (daysToExpiry <= cfg.CRITICAL_DAYS) {
    return {
      level: "CRITICAL",
      daysToExpiry,
      label: `CRITICAL EXPIRY (${daysToExpiry}d)`,
      badgeClass: "bg-red-100 text-red-800 border-red-300 font-bold animate-pulse"
    };
  }
  if (daysToExpiry <= cfg.WARNING_DAYS) {
    return {
      level: "WARNING",
      daysToExpiry,
      label: `WARNING EXPIRY (${daysToExpiry}d)`,
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300 font-semibold"
    };
  }
  if (daysToExpiry <= cfg.WATCH_DAYS) {
    return {
      level: "WATCH",
      daysToExpiry,
      label: `WATCH EXPIRY (${daysToExpiry}d)`,
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200"
    };
  }
  return {
    level: "NORMAL",
    daysToExpiry,
    label: "ADEQUATE SHELF-LIFE",
    badgeClass: "bg-slate-100 text-slate-700"
  };
}

/**
 * Detects potential surplus inventory.
 * Criteria: days_of_stock > 30 and current_stock > minimum_safety_stock * 1.5
 * @param {Object} item
 * @returns {Object}
 */
export function detectSurplus(item) {
  const days = calculateDaysOfStock(item.current_stock, item.daily_consumption);
  const safety = Number(item.minimum_safety_stock) || 0;
  const stock = Number(item.current_stock) || 0;

  const cfg = SUPPLY_CHAIN_CONFIG.SURPLUS_CRITERIA;
  const isSurplus = days > cfg.MINIMUM_SURPLUS_DAYS && stock > (safety * cfg.SAFETY_STOCK_MULTIPLIER);

  return {
    isSurplus,
    daysOfStock: Number(days.toFixed(1)),
    label: isSurplus ? "POTENTIAL SURPLUS" : "BALANCED",
    badgeClass: isSurplus ? "bg-sky-50 text-sky-800 border-sky-300 font-bold" : ""
  };
}

/**
 * Calculates the Medicine Supply Pressure Score for a PHC.
 * Deterministic weighted score normalized 0–100.
 * 0 = minimal pressure, 100 = severe supply pressure.
 * @param {string} phcId
 * @param {Array} phcInventory
 * @param {Date} currentDate
 * @returns {Object} Pressure score and breakdown
 */
export function calculatePhcPressureScore(phcId, phcInventory = [], currentDate = REF_DATE) {
  if (!phcInventory.length) {
    return { score: 0, status: "LOW", label: "Nominal" };
  }

  const weights = SUPPLY_CHAIN_CONFIG.PRESSURE_WEIGHTS;
  let rawScore = 0;
  let criticalCount = 0;
  let warningCount = 0;
  let deliveryRiskCount = 0;
  let safetyGapCount = 0;

  phcInventory.forEach(item => {
    const risk = classifySupplyRisk(item, currentDate);
    const delRisk = calculateDeliveryRisk(item, currentDate);
    const gap = calculateSafetyStockGap(item.current_stock, item.minimum_safety_stock);

    if (risk.level === "CRITICAL") {
      criticalCount++;
      rawScore += weights.CRITICAL_ITEM_WEIGHT;
    } else if (risk.level === "WARNING") {
      warningCount++;
      rawScore += weights.WARNING_ITEM_WEIGHT;
    }

    if (delRisk.hasDeliveryRisk) {
      deliveryRiskCount++;
      rawScore += weights.DELIVERY_RISK_WEIGHT;
    }

    if (gap < 0) {
      safetyGapCount++;
      rawScore += weights.SAFETY_GAP_WEIGHT;
    }
  });

  // Normalize to 0 - 100
  const normalizedScore = Math.min(weights.MAX_SCORE, Math.round(rawScore));

  let status = "LOW";
  let statusClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (normalizedScore >= 75) {
    status = "SEVERE";
    statusClass = "text-red-700 bg-red-50 border-red-300 animate-pulse font-bold";
  } else if (normalizedScore >= 45) {
    status = "ELEVATED";
    statusClass = "text-amber-800 bg-amber-50 border-amber-300 font-semibold";
  } else if (normalizedScore >= 20) {
    status = "MODERATE";
    statusClass = "text-amber-700 bg-amber-50/60 border-amber-200";
  }

  return {
    score: normalizedScore,
    status,
    statusClass,
    criticalCount,
    warningCount,
    deliveryRiskCount,
    safetyGapCount
  };
}

/**
 * Validates an inventory record and flags data anomalies.
 * @param {Object} item
 * @returns {Object} Validation result with flagged issues
 */
export function validateInventoryRecord(item) {
  const issues = [];

  if (!item.medicine_id) issues.push("Missing medicine_id");
  if (!item.phc_id) issues.push("Missing phc_id");
  if (Number(item.current_stock) < 0) issues.push("Negative stock quantity");
  if (Number(item.daily_consumption) < 0) issues.push("Negative daily consumption");
  if (Number(item.minimum_safety_stock) < 0) issues.push("Negative minimum safety stock");

  if (item.last_delivery_date && item.next_delivery_date) {
    const last = new Date(item.last_delivery_date);
    const next = new Date(item.next_delivery_date);
    if (!isNaN(last.getTime()) && !isNaN(next.getTime()) && next < last) {
      issues.push("next_delivery_date earlier than last_delivery_date");
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Aggregates supply chain indicators across the 3 districts.
 * @param {Array} phcDataset
 * @param {Array} fullInventory
 * @param {Date} currentDate
 * @returns {Array} District aggregated metrics
 */
export function aggregateDistrictSupplyChain(phcDataset, fullInventory, currentDate = REF_DATE) {
  const districts = ["District North", "District Central", "District South"];

  return districts.map(district => {
    const districtPhcs = phcDataset.filter(p => p.district === district);
    const phcIdSet = new Set(districtPhcs.map(p => p.phc_id));
    const districtInventory = fullInventory.filter(item => phcIdSet.has(item.phc_id));

    let totalStock = 0;
    let criticalCount = 0;
    let warningCount = 0;
    let surplusCount = 0;
    let upcomingDeliveriesCount = 0;

    districtInventory.forEach(item => {
      totalStock += Number(item.current_stock) || 0;
      const risk = classifySupplyRisk(item, currentDate);
      if (risk.level === "CRITICAL") criticalCount++;
      if (risk.level === "WARNING") warningCount++;

      const surplus = detectSurplus(item);
      if (surplus.isSurplus) surplusCount++;

      if (item.next_delivery_date) upcomingDeliveriesCount++;
    });

    const totalItems = districtInventory.length;
    const availabilityRate = totalItems > 0 
      ? (((totalItems - (criticalCount + warningCount * 0.5)) / totalItems) * 100).toFixed(1)
      : "100.0";

    return {
      district,
      phcCount: districtPhcs.length,
      totalStock,
      criticalCount,
      warningCount,
      surplusCount,
      upcomingDeliveriesCount,
      availabilityPercentage: Number(availabilityRate)
    };
  });
}
