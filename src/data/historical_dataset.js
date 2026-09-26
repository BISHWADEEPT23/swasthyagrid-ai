/**
 * SwasthyaGrid AI — Synthetic Historical Operational Dataset (Build 04)
 *
 * Provides 90 days of synthetic daily observations (Day -89 to Day 0: 2026-09-20)
 * across all 12 Primary Health Centres (1,080 daily records total).
 *
 * Schema:
 * - date: ISO string "YYYY-MM-DD"
 * - day_offset: -89 to 0
 * - phc_id: "PHC-01" to "PHC-12"
 * - phc_name: string
 * - district: "District North", "District Central", "District South"
 * - patient_footfall: integer
 * - total_beds: integer
 * - occupied_beds: integer
 * - bed_occupancy_rate: float percentage
 * - staff_required: integer
 * - staff_present: integer
 * - medicine_consumption: object mapping catalog IDs ("MED-01" to "MED-10") to daily count
 * - day_of_week: 0 (Sunday) to 6 (Saturday)
 * - seasonal_factor: float
 * - demand_event: string or null
 */

import { PHC_DATASET } from "./phc_dataset.js";
import { MEDICINE_CATALOG, MEDICINE_INVENTORY_DATASET } from "./medicine_dataset.js";

const BASE_DATE = new Date("2026-09-20T12:00:00Z");

function generate90DayHistory() {
  const records = [];

  PHC_DATASET.forEach((phc) => {
    // Collect Day 0 baseline consumption for this PHC from medicine inventory
    const phcMeds = MEDICINE_INVENTORY_DATASET.filter(m => m.phc_id === phc.phc_id);
    const day0MedConsumption = {};
    phcMeds.forEach(m => {
      day0MedConsumption[m.medicine_catalog_id] = m.daily_consumption;
    });

    const isPHC07 = phc.phc_id === "PHC-07";
    const baselineFootfall = phc.patients_7day_average || 120;
    const totalBeds = phc.total_beds;
    const doctorsReq = phc.doctors_required || 2;
    const nursesReq = phc.nurses_required || 4;
    const totalStaffReq = doctorsReq + nursesReq + (phc.pharmacists_required || 1);

    // Generate for 90 days: dayOffset from -89 to 0
    for (let dayOffset = -89; dayOffset <= 0; dayOffset++) {
      const recordDate = new Date(BASE_DATE.getTime() + dayOffset * 86400000);
      const dateStr = recordDate.toISOString().split("T")[0];
      const dayOfWeek = recordDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday

      // Day-of-week multiplier (Monday surge, weekend dip)
      let dowMultiplier = 1.0;
      if (dayOfWeek === 1) dowMultiplier = 1.15; // Monday peak
      else if (dayOfWeek === 2) dowMultiplier = 1.05;
      else if (dayOfWeek === 5) dowMultiplier = 0.95;
      else if (dayOfWeek === 6) dowMultiplier = 0.82; // Saturday
      else if (dayOfWeek === 0) dowMultiplier = 0.75; // Sunday

      // Subtle seasonal monsoon/autumn wave
      const seasonalFactor = 1.0 + 0.08 * Math.sin((dayOffset + 180) / 30);

      // Deterministic noise based on dayOffset and phcId
      const hashVal = Math.sin(dayOffset * 17 + phc.phc_id.charCodeAt(5) * 31);
      const noise = 1.0 + (hashVal * 0.05);

      let footfall = 0;
      let occupiedBeds = 0;
      let demandEvent = null;
      const medConsumption = {};

      if (dayOffset === 0) {
        // EXACT Day 0 values matching Build 01 - 03
        footfall = phc.patients_today;
        occupiedBeds = phc.occupied_beds;
        demandEvent = isPHC07 ? "SURGE_CLUSTER" : null;

        MEDICINE_CATALOG.forEach(cat => {
          medConsumption[cat.id] = day0MedConsumption[cat.id] || cat.defaultDaily;
        });
      } else if (isPHC07) {
        // PHC-07: Waterborne / Gastroenteritis cluster starts accelerating at Day -14
        if (dayOffset < -14) {
          // Normal baseline with regular variations
          footfall = Math.round(baselineFootfall * dowMultiplier * seasonalFactor * noise);
          occupiedBeds = Math.min(totalBeds, Math.round(totalBeds * 0.65 * noise));
          demandEvent = null;
        } else {
          // Accelerating surge over 14 days culminating at Day 0: 286 (+35%)
          const surgeProgress = (dayOffset + 14) / 14; // 0 to 1
          const surgeMultiplier = 1.0 + 0.35 * surgeProgress;
          footfall = Math.round(baselineFootfall * surgeMultiplier * (0.95 + 0.1 * surgeProgress));
          // Beds scale from 65% to 91% (22 beds)
          occupiedBeds = Math.min(totalBeds, Math.round(15 + 7 * surgeProgress));
          demandEvent = "SURGE_CLUSTER";
        }

        // Medicine consumption scales with footfall and surge characteristics
        MEDICINE_CATALOG.forEach(cat => {
          const targetDay0 = day0MedConsumption[cat.id] || cat.defaultDaily;
          if (dayOffset < -14) {
            // Normal consumption
            medConsumption[cat.id] = Math.round(cat.defaultDaily * (footfall / baselineFootfall));
          } else {
            // Accelerate towards Day 0 target
            const surgeProgress = (dayOffset + 14) / 14;
            const startVal = cat.defaultDaily;
            medConsumption[cat.id] = Math.round(startVal + (targetDay0 - startVal) * surgeProgress);
          }
        });
      } else {
        // General PHC historical progression
        const normalMultiplier = (phc.patients_today / baselineFootfall);
        // Smoothly interpolate towards today
        const weight = (dayOffset + 90) / 90;
        const currentTarget = baselineFootfall + (phc.patients_today - baselineFootfall) * weight;
        footfall = Math.max(10, Math.round(currentTarget * dowMultiplier * seasonalFactor * noise));

        // Occupied beds
        const targetBeds = phc.occupied_beds;
        occupiedBeds = Math.max(1, Math.min(totalBeds, Math.round(totalBeds * 0.55 * dowMultiplier * noise)));
        if (dayOffset > -7) {
          occupiedBeds = Math.min(totalBeds, Math.round(occupiedBeds * 0.5 + targetBeds * 0.5));
        }

        // Medicines
        MEDICINE_CATALOG.forEach(cat => {
          const targetDay0 = day0MedConsumption[cat.id] || cat.defaultDaily;
          const ratio = footfall / baselineFootfall;
          medConsumption[cat.id] = Math.max(5, Math.round(targetDay0 * ratio * (0.9 + 0.2 * noise)));
        });
      }

      // Staff present calculation (occasional minor absence)
      let staffPresent = totalStaffReq;
      if (dayOffset === 0) {
        staffPresent = (phc.doctors_present || 2) + (phc.nurses_present || 4) + (phc.pharmacists_present || 1);
      } else {
        const staffNoise = Math.abs(Math.cos(dayOffset * 13 + phc.phc_id.charCodeAt(5)));
        staffPresent = staffNoise > 0.85 ? Math.max(1, totalStaffReq - 1) : totalStaffReq;
      }

      records.push({
        date: dateStr,
        day_offset: dayOffset,
        phc_id: phc.phc_id,
        phc_name: phc.phc_name,
        district: phc.district,
        patient_footfall: footfall,
        total_beds: totalBeds,
        occupied_beds: occupiedBeds,
        bed_occupancy_rate: Number(((occupiedBeds / totalBeds) * 100).toFixed(1)),
        staff_required: totalStaffReq,
        staff_present: staffPresent,
        medicine_consumption: medConsumption,
        day_of_week: dayOfWeek,
        seasonal_factor: Number(seasonalFactor.toFixed(3)),
        demand_event: demandEvent
      });
    }
  });

  return records;
}

export const HISTORICAL_DATASET = generate90DayHistory();

/**
 * Helper to fetch historical observations for a specific PHC.
 * @param {string} phcId 
 * @param {number} days - Number of recent days (e.g. 7, 14, 30, 90)
 * @returns {Array} Sorted by date ascending
 */
export function getHistoryForPhc(phcId, days = 90) {
  return HISTORICAL_DATASET
    .filter(r => r.phc_id === phcId && r.day_offset >= -days + 1)
    .sort((a, b) => a.day_offset - b.day_offset);
}

/**
 * Helper to fetch district aggregate history for a given day offset.
 * @param {string} district 
 * @param {number} days 
 * @returns {Array}
 */
export function getHistoryForDistrict(district, days = 90) {
  const phcsInDistrict = PHC_DATASET.filter(p => p.district === district).map(p => p.phc_id);
  const mapByOffset = {};

  HISTORICAL_DATASET.filter(r => phcsInDistrict.includes(r.phc_id) && r.day_offset >= -days + 1).forEach(r => {
    if (!mapByOffset[r.day_offset]) {
      mapByOffset[r.day_offset] = {
        date: r.date,
        day_offset: r.day_offset,
        district: district,
        patient_footfall: 0,
        occupied_beds: 0,
        total_beds: 0,
        medicine_consumption: {}
      };
      MEDICINE_CATALOG.forEach(m => {
        mapByOffset[r.day_offset].medicine_consumption[m.id] = 0;
      });
    }
    mapByOffset[r.day_offset].patient_footfall += r.patient_footfall;
    mapByOffset[r.day_offset].occupied_beds += r.occupied_beds;
    mapByOffset[r.day_offset].total_beds += r.total_beds;
    Object.keys(r.medicine_consumption).forEach(medId => {
      mapByOffset[r.day_offset].medicine_consumption[medId] += (r.medicine_consumption[medId] || 0);
    });
  });

  return Object.values(mapByOffset).sort((a, b) => a.day_offset - b.day_offset);
}
