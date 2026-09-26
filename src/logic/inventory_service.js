/**
 * SwasthyaGrid AI — Inventory Service
 * Manages medicine inventory queries, days-of-stock evaluation, and supply risk detection.
 */

import { MEDICINE_INVENTORY_DATASET } from "../data/medicine_dataset.js";
import { daysOfStock } from "./calculations.js";

/**
 * Returns all inventory items for a specific PHC, augmented with calculated days of stock.
 * @param {string} phcId
 * @returns {Array} List of inventory items with calculated metrics
 */
export function getInventoryForPhc(phcId) {
  const items = MEDICINE_INVENTORY_DATASET.filter(item => item.phc_id === phcId);
  return items.map(item => {
    const days = daysOfStock(item.current_stock, item.daily_consumption);
    return {
      ...item,
      days_of_stock: days
    };
  });
}

/**
 * Returns network-wide medicine supply risks, sorted by severity and days of stock remaining.
 * @returns {Array} List of high-risk medicines across the network
 */
export function getNetworkSupplyRisks() {
  return MEDICINE_INVENTORY_DATASET
    .map(item => {
      const days = daysOfStock(item.current_stock, item.daily_consumption);
      return {
        ...item,
        days_of_stock: days
      };
    })
    .filter(item => item.stock_status === "CRITICAL" || item.stock_status === "WARNING" || item.days_of_stock < 5)
    .sort((a, b) => a.days_of_stock - b.days_of_stock);
}
