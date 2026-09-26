/**
 * SwasthyaGrid AI — Reusable Business Logic & Operational Calculations
 *
 * Strictly separates mathematical/operational calculations from visual UI components.
 * Prepared for future API/backend bindings.
 */

/**
 * Calculates bed occupancy metrics and capacity status.
 * @param {Object} phc - Primary Health Centre record
 * @returns {Object} Bed occupancy metrics
 */
export function bedOccupancy(phc) {
  if (!phc) return { totalBeds: 0, occupiedBeds: 0, availableBeds: 0, occupancyPercentage: 0, status: "NORMAL" };

  const totalBeds = Number(phc.total_beds) || 0;
  const occupiedBeds = Number(phc.occupied_beds) || 0;
  const availableBeds = phc.available_beds !== undefined ? Number(phc.available_beds) : Math.max(0, totalBeds - occupiedBeds);
  const occupancyPercentage = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

  let status = "NORMAL";
  if (occupancyPercentage >= 90) {
    status = "CRITICAL";
  } else if (occupancyPercentage >= 80) {
    status = "WARNING";
  } else if (occupancyPercentage >= 70) {
    status = "WATCH";
  }

  return {
    totalBeds,
    occupiedBeds,
    availableBeds,
    occupancyPercentage: Number(occupancyPercentage.toFixed(1)),
    status
  };
}

/**
 * Calculates workforce attendance, role-wise gaps, and availability percentage.
 * Does NOT diagnose clinical staffing adequacy; only reports operational availability.
 * @param {Object} phc - Primary Health Centre record
 * @returns {Object} Workforce metrics
 */
export function staffAvailability(phc) {
  if (!phc) {
    return {
      doctors: { required: 0, present: 0, gap: 0 },
      nurses: { required: 0, present: 0, gap: 0 },
      pharmacists: { required: 0, present: 0, gap: 0 },
      totalRequired: 0,
      totalPresent: 0,
      totalGap: 0,
      staffAvailabilityPercentage: 100,
      status: "NORMAL"
    };
  }

  const dReq = Number(phc.doctors_required) || 0;
  const dPres = Number(phc.doctors_present) || 0;
  const dGap = Math.max(0, dReq - dPres);

  const nReq = Number(phc.nurses_required) || 0;
  const nPres = Number(phc.nurses_present) || 0;
  const nGap = Math.max(0, nReq - nPres);

  const pReq = Number(phc.pharmacists_required) || 0;
  const pPres = Number(phc.pharmacists_present) || 0;
  const pGap = Math.max(0, pReq - pPres);

  const totalRequired = dReq + nReq + pReq;
  const totalPresent = dPres + nPres + pPres;
  const totalGap = dGap + nGap + pGap;
  const staffAvailabilityPercentage = totalRequired > 0 ? (totalPresent / totalRequired) * 100 : 100;

  let status = "NORMAL";
  if (staffAvailabilityPercentage < 75) {
    status = "CRITICAL";
  } else if (staffAvailabilityPercentage < 85) {
    status = "WARNING";
  } else if (staffAvailabilityPercentage < 95) {
    status = "WATCH";
  }

  return {
    doctors: { required: dReq, present: dPres, gap: dGap },
    nurses: { required: nReq, present: nPres, gap: nGap },
    pharmacists: { required: pReq, present: pPres, gap: pGap },
    totalRequired,
    totalPresent,
    totalGap,
    staffAvailabilityPercentage: Number(staffAvailabilityPercentage.toFixed(1)),
    status
  };
}

/**
 * Calculates days of stock remaining for a medicine item.
 * days_of_stock = current_stock / daily_consumption
 * Deterministic operational calculation (not an AI prediction).
 * @param {number} currentStock
 * @param {number} dailyConsumption
 * @returns {number} Days of stock remaining (1 decimal place)
 */
export function daysOfStock(currentStock, dailyConsumption) {
  const stock = Number(currentStock) || 0;
  const consumption = Number(dailyConsumption) || 0;

  if (consumption <= 0) {
    return stock > 0 ? 999 : 0;
  }

  const days = stock / consumption;
  return Number(days.toFixed(1));
}

/**
 * Calculates the percentage deviation of current patient footfall vs baseline 7-day average.
 * @param {number} today
 * @param {number} average
 * @returns {number} Percentage deviation (e.g. +35.2 or -5.1)
 */
export function patientDemandDeviation(today, average) {
  const t = Number(today) || 0;
  const a = Number(average) || 0;

  if (a <= 0) return 0;

  const deviation = ((t - a) / a) * 100;
  return Number(deviation.toFixed(1));
}

/**
 * Evaluates medicine availability across an inventory list.
 * @param {Array} inventoryList - List of medicine inventory objects
 * @returns {Object} Aggregated medicine availability stats
 */
export function medicineAvailability(inventoryList = []) {
  if (!inventoryList.length) {
    return {
      adequateCount: 0,
      watchCount: 0,
      warningCount: 0,
      criticalCount: 0,
      totalCount: 0,
      availabilityPercentage: 100
    };
  }

  let adequateCount = 0;
  let watchCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  inventoryList.forEach(item => {
    const days = daysOfStock(item.current_stock, item.daily_consumption);
    const stock = Number(item.current_stock) || 0;
    const safety = Number(item.minimum_safety_stock) || 0;

    if (stock < safety * 0.5 || days < 2) {
      criticalCount++;
    } else if (stock < safety || days < 4) {
      warningCount++;
    } else if (stock < (item.reorder_level || safety * 1.5) || days < 7) {
      watchCount++;
    } else {
      adequateCount++;
    }
  });

  const totalCount = inventoryList.length;
  // Availability score: weighted ratio of stocked vs deficit items
  const availabilityPercentage = totalCount > 0
    ? ((adequateCount * 1.0 + watchCount * 0.85 + warningCount * 0.5 + criticalCount * 0.1) / totalCount) * 100
    : 100;

  return {
    adequateCount,
    watchCount,
    warningCount,
    criticalCount,
    totalCount,
    availabilityPercentage: Number(availabilityPercentage.toFixed(1))
  };
}

/**
 * Returns the status category and CSS classes for a given stock status or days of stock.
 * @param {string} status - NORMAL | WATCH | WARNING | CRITICAL
 * @param {number} days - Days of stock
 * @returns {Object} Status classification and badge styling
 */
export function getStockStatusInfo(status, days) {
  let effectiveStatus = status;
  if (!effectiveStatus) {
    if (days < 2) effectiveStatus = "CRITICAL";
    else if (days < 4) effectiveStatus = "WARNING";
    else if (days < 7) effectiveStatus = "WATCH";
    else effectiveStatus = "NORMAL";
  }

  const map = {
    NORMAL: {
      label: "NORMAL",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
      textColor: "text-emerald-700"
    },
    WATCH: {
      label: "WATCH",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      dotClass: "bg-amber-400",
      textColor: "text-amber-800"
    },
    WARNING: {
      label: "WARNING",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
      dotClass: "bg-amber-500",
      textColor: "text-amber-900"
    },
    CRITICAL: {
      label: "CRITICAL",
      badgeClass: "bg-red-100 text-red-800 border-red-300 font-bold animate-pulse",
      dotClass: "bg-red-600",
      textColor: "text-red-700"
    }
  };

  return map[effectiveStatus] || map.NORMAL;
}
