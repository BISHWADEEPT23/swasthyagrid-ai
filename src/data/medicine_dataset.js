/**
 * SwasthyaGrid AI — Extended Synthetic Medicine Inventory Dataset (Build 03)
 *
 * 12 Primary Health Centres × 10 Core Essential Medicines = 120 inventory records.
 *
 * Complete operational schema:
 * - medicine_id
 * - medicine_name
 * - category
 * - phc_id
 * - current_stock
 * - daily_consumption
 * - forecast_daily_consumption
 * - minimum_safety_stock
 * - reorder_level
 * - batch_number
 * - batch_quantity
 * - expiry_date
 * - supplier
 * - supplier_id
 * - last_delivery_date
 * - next_delivery_date
 * - expected_delivery_quantity
 * - lead_time_days
 * - stock_status
 * - last_updated
 */

export const MEDICINE_CATALOG = [
  { id: "MED-01", name: "Paracetamol 500mg", category: "Analgesic / Antipyretic", defaultDaily: 60, safetyStock: 250, reorderLevel: 400 },
  { id: "MED-02", name: "Amoxicillin 500mg", category: "Antibiotic", defaultDaily: 35, safetyStock: 150, reorderLevel: 250 },
  { id: "MED-03", name: "ORS Sachets (Oral Rehydration Salts)", category: "Electrolyte Solution", defaultDaily: 45, safetyStock: 200, reorderLevel: 350 },
  { id: "MED-04", name: "Azithromycin 250mg", category: "Antibiotic", defaultDaily: 25, safetyStock: 100, reorderLevel: 180 },
  { id: "MED-05", name: "Metformin 500mg", category: "Anti-diabetic", defaultDaily: 50, safetyStock: 200, reorderLevel: 350 },
  { id: "MED-06", name: "Insulin Regular (100IU/ml)", category: "Endocrine / Diabetes", defaultDaily: 15, safetyStock: 60, reorderLevel: 100 },
  { id: "MED-07", name: "IV Fluids (NS / RL 500ml)", category: "Critical Resuscitation", defaultDaily: 30, safetyStock: 120, reorderLevel: 200 },
  { id: "MED-08", name: "Doxycycline 100mg", category: "Antibiotic", defaultDaily: 20, safetyStock: 80, reorderLevel: 140 },
  { id: "MED-09", name: "Iron & Folic Acid Tablets", category: "Maternal Health", defaultDaily: 70, safetyStock: 300, reorderLevel: 500 },
  { id: "MED-10", name: "Zinc Sulfate 20mg", category: "Pediatric Essential", defaultDaily: 30, safetyStock: 120, reorderLevel: 200 }
];

export const SUPPLIERS = [
  { id: "SUP-01", name: "National Medical Supply Depot (Central)", leadTime: 4 },
  { id: "SUP-02", name: "District Healthcare Logistics Hub", leadTime: 2 },
  { id: "SUP-03", name: "Apex Pharmaceuticals Corp", leadTime: 5 },
  { id: "SUP-04", name: "Govt Central Medical Stores", leadTime: 3 }
];

function generate120InventoryRecords() {
  const inventory = [];
  const phcIds = [
    "PHC-01", "PHC-02", "PHC-03", "PHC-04",
    "PHC-05", "PHC-06", "PHC-07", "PHC-08",
    "PHC-09", "PHC-10", "PHC-11", "PHC-12"
  ];

  phcIds.forEach((phcId, pIdx) => {
    MEDICINE_CATALOG.forEach((med, mIdx) => {
      const supplierObj = SUPPLIERS[(pIdx + mIdx) % SUPPLIERS.length];
      let dailyConsumption = med.defaultDaily;
      let forecastConsumption = Math.round(med.defaultDaily * (1 + (pIdx % 3) * 0.05));
      let currentStock = Math.round(med.reorderLevel * (1.2 + ((pIdx * 7 + mIdx * 11) % 50) / 100));
      let stockStatus = "NORMAL";
      let expiryDate = "2027-10-15T00:00:00Z";
      let lastDeliveryDate = "2026-08-20T10:00:00Z";
      let nextDeliveryDate = "2026-09-28T10:00:00Z";
      let expectedDeliveryQty = med.reorderLevel;
      let leadTime = supplierObj.leadTime;

      // SPECIFIC OPERATIONAL CONDITIONS FOR PHC-07 (CRITICAL EMERGENCY)
      if (phcId === "PHC-07") {
        if (med.name.includes("Paracetamol")) {
          // Stock 310, Daily Use 62 -> 5.0 days left (WARNING)
          currentStock = 310;
          dailyConsumption = 62;
          forecastConsumption = 72;
          stockStatus = "WARNING";
          nextDeliveryDate = "2026-09-25T10:00:00Z"; // 5 days from 2026-09-20
          expectedDeliveryQty = 500;
          leadTime = 5;
        } else if (med.name.includes("IV Fluids")) {
          // Stock 105, Daily Use 48 -> 2.1875 ≈ 2.2 days left (CRITICAL)
          // Next delivery 5 days away -> stockout 2.8 days before delivery!
          currentStock = 105;
          dailyConsumption = 48;
          forecastConsumption = 58;
          stockStatus = "CRITICAL";
          nextDeliveryDate = "2026-09-25T10:00:00Z"; // 5 days away
          expectedDeliveryQty = 250;
          leadTime = 5;
        } else if (med.name.includes("ORS")) {
          // Stock 620, Daily Use 44 -> 14.09 ≈ 14.1 days left (NORMAL)
          currentStock = 620;
          dailyConsumption = 44;
          forecastConsumption = 48;
          stockStatus = "NORMAL";
          nextDeliveryDate = "2026-09-28T10:00:00Z";
          expectedDeliveryQty = 400;
        } else if (med.name.includes("Amoxicillin")) {
          // Stock 430, Daily Use 31 -> 13.87 ≈ 13.9 days left (NORMAL)
          currentStock = 430;
          dailyConsumption = 31;
          forecastConsumption = 35;
          stockStatus = "NORMAL";
          nextDeliveryDate = "2026-09-29T10:00:00Z";
          expectedDeliveryQty = 300;
        } else {
          currentStock = Math.round(med.safetyStock * 1.1);
          stockStatus = "NORMAL";
        }
      } 
      // SPECIFIC TEST CONDITIONS FOR OTHER PHCs (ORS Comparison from spec)
      else if (phcId === "PHC-03" && med.name.includes("ORS")) {
        // PHC-03 ORS: 2.8 days (CRITICAL)
        currentStock = 70;
        dailyConsumption = 25;
        stockStatus = "CRITICAL";
        nextDeliveryDate = "2026-09-26T10:00:00Z";
      } else if (phcId === "PHC-09" && med.name.includes("ORS")) {
        // PHC-09 ORS: 18.4 days (NORMAL)
        currentStock = 552;
        dailyConsumption = 30;
        stockStatus = "NORMAL";
      } else if (phcId === "PHC-11" && med.name.includes("ORS")) {
        // PHC-11 ORS: 27.6 days (SURPLUS INDICATOR / HIGH BUFFER)
        currentStock = 966;
        dailyConsumption = 35;
        stockStatus = "NORMAL";
      } else if (phcId === "PHC-11" && med.name.includes("Amoxicillin")) {
        // PHC-11 Amoxicillin: below safety stock (WARNING)
        currentStock = 120;
        dailyConsumption = 35;
        stockStatus = "WARNING";
      } else if (phcId === "PHC-04" && med.name.includes("Insulin")) {
        // PHC-04 Insulin: potential surplus (>30 days)
        currentStock = 650;
        dailyConsumption = 15;
        stockStatus = "NORMAL";
      } else if (phcId === "PHC-06" && med.name.includes("Doxycycline")) {
        // PHC-06 Doxycycline: Expiry in 18 days (WARNING EXPIRY)
        expiryDate = "2026-10-08T00:00:00Z";
      } else if (phcId === "PHC-08" && med.name.includes("Zinc")) {
        // PHC-08 Zinc: Expiry in 45 days (WATCH EXPIRY)
        expiryDate = "2026-11-04T00:00:00Z";
      }

      inventory.push({
        medicine_id: `${phcId}-${med.id}`,
        medicine_catalog_id: med.id,
        medicine_name: med.name,
        category: med.category,
        phc_id: phcId,
        current_stock: currentStock,
        daily_consumption: dailyConsumption,
        forecast_daily_consumption: forecastConsumption,
        minimum_safety_stock: med.safetyStock,
        reorder_level: med.reorderLevel,
        batch_number: `BAT-${2026}-${pIdx + 10}${mIdx + 101}`,
        batch_quantity: Math.round(currentStock * 1.1),
        expiry_date: expiryDate,
        supplier: supplierObj.name,
        supplier_id: supplierObj.id,
        last_delivery_date: lastDeliveryDate,
        next_delivery_date: nextDeliveryDate,
        expected_delivery_quantity: expectedDeliveryQty,
        lead_time_days: leadTime,
        stock_status: stockStatus,
        last_updated: "2026-09-20T12:00:00Z"
      });
    });
  });

  return inventory;
}

export const MEDICINE_INVENTORY_DATASET = generate120InventoryRecords();
