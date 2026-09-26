/**
 * SwasthyaGrid AI — National KPI Aggregation Service
 * Computes top-level Command Centre metrics across all 12 PHCs:
 * 1. PHCs Online
 * 2. Patients Today
 * 3. Available Beds
 * 4. Medicine Availability
 * 5. Staff Attendance
 * 6. Critical Alerts
 */

import { PHC_DATASET } from "../data/phc_dataset.js";
import { ALERT_HISTORY_DATASET } from "../data/alert_history_dataset.js";
import { staffAvailability } from "./calculations.js";

export function getNationalKpis(phcList = PHC_DATASET) {
  const totalPhcs = phcList.length;
  // All synthetic PHCs report online in real time
  const onlinePhcs = phcList.length;

  let totalPatientsToday = 0;
  let totalPatients7DayAvg = 0;
  let totalBeds = 0;
  let occupiedBeds = 0;
  let availableBeds = 0;
  let totalMedAvailabilitySum = 0;
  let totalRequiredStaff = 0;
  let totalPresentStaff = 0;

  phcList.forEach(phc => {
    totalPatientsToday += Number(phc.patients_today) || 0;
    totalPatients7DayAvg += Number(phc.patients_7day_average) || 0;
    totalBeds += Number(phc.total_beds) || 0;
    occupiedBeds += Number(phc.occupied_beds) || 0;
    availableBeds += Number(phc.available_beds) || 0;
    totalMedAvailabilitySum += Number(phc.medicine_availability_percentage) || 0;

    const staff = staffAvailability(phc);
    totalRequiredStaff += staff.totalRequired;
    totalPresentStaff += staff.totalPresent;
  });

  const patientDelta = totalPatients7DayAvg > 0
    ? ((totalPatientsToday - totalPatients7DayAvg) / totalPatients7DayAvg) * 100
    : 0;

  const bedOccupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
  const avgMedAvailability = totalPhcs > 0 ? totalMedAvailabilitySum / totalPhcs : 0;
  const staffAttendanceRate = totalRequiredStaff > 0 ? (totalPresentStaff / totalRequiredStaff) * 100 : 0;

  // Active Critical and Warning alerts across network
  const activeAlerts = ALERT_HISTORY_DATASET.filter(a => a.status === "ACTIVE");
  const criticalAlertsCount = activeAlerts.filter(a => a.severity === "CRITICAL" || a.severity === "WARNING").length;

  return {
    phcsOnline: {
      value: `${onlinePhcs}/${totalPhcs}`,
      subtext: "100% telemetry synced",
      status: "NORMAL",
      badge: "100% ONLINE"
    },
    patientsToday: {
      value: totalPatientsToday.toLocaleString(),
      subtext: `${patientDelta >= 0 ? "+" : ""}${patientDelta.toFixed(1)}% vs 7-day avg`,
      status: patientDelta > 15 ? "WARNING" : "NORMAL",
      badge: `${totalPatients7DayAvg.toLocaleString()} baseline`
    },
    availableBeds: {
      value: availableBeds.toString(),
      subtext: `${occupiedBeds}/${totalBeds} occupied (${bedOccupancyRate.toFixed(1)}%)`,
      status: bedOccupancyRate > 80 ? "WARNING" : "NORMAL",
      badge: `${totalBeds} total capacity`
    },
    medicineAvailability: {
      value: `${avgMedAvailability.toFixed(1)}%`,
      subtext: "Network weighted stock index",
      status: avgMedAvailability < 85 ? "WATCH" : "NORMAL",
      badge: "10 Core Meds"
    },
    staffAttendance: {
      value: `${staffAttendanceRate.toFixed(1)}%`,
      subtext: `${totalPresentStaff} of ${totalRequiredStaff} personnel active`,
      status: staffAttendanceRate < 85 ? "WATCH" : "NORMAL",
      badge: "Clinical Staff"
    },
    criticalAlerts: {
      value: criticalAlertsCount.toString(),
      subtext: "1 Critical (PHC-07), 1 Warning (PHC-11)",
      status: criticalAlertsCount > 0 ? "CRITICAL" : "NORMAL",
      badge: "Requires Action"
    }
  };
}
