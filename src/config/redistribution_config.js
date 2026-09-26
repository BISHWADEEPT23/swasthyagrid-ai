/**
 * SwasthyaGrid AI — Resource Redistribution & Logistics Configuration (Build 07)
 *
 * Centralizes:
 * 1. Donor Buffer Preservation Constraints (Strict protection against secondary stockouts)
 * 2. Multi-Criteria Optimization Weights (Urgency, Distance, Donor Buffer, FEFO Expiry)
 * 3. Logistics & Transit Parameters (Haversine-to-Road multiplier, average fleet speeds)
 * 4. Transfer Lifecycle State Machine (PROPOSED -> APPROVED -> DISPATCHED -> IN_TRANSIT -> DELIVERED)
 * 5. Priority Urgency Thresholds
 */

export const DONOR_BUFFER_CONSTRAINTS = {
  // Minimum days of stock a donor facility MUST retain after transfer
  MIN_DAYS_OF_STOCK_RETAINED: 4.0,
  // Minimum safety stock percentage donor must preserve (cannot dip below 100% safety buffer)
  MIN_SAFETY_STOCK_PERCENT: 100,
  // Maximum percentage of surplus stock a single transfer can consume
  MAX_SURPLUS_CONSUMPTION_PCT: 75
};

export const REDISTRIBUTION_WEIGHTS = {
  DEFICIT_URGENCY: 0.35,          // 35% - How severe is target deficit (<48h gets max points)
  PROXIMITY_TRANSIT_TIME: 0.25,   // 25% - Travel distance & transit time
  DONOR_BUFFER_RETENTION: 0.25,   // 25% - Safety margin left at donor facility
  FEFO_EXPIRY_ROTATION: 0.15      // 15% - Prioritize transferring near-expiry batches from surplus donors
};

export const LOGISTICS_PARAMETERS = {
  AVERAGE_SPEED_KMH: 30,          // Urban & suburban road network speed
  ROAD_DISTANCE_MULTIPLIER: 1.25, // Multiplier applied to Haversine great-circle distance
  BASE_DISPATCH_TIME_MINS: 15,    // Packing, verification & vehicle loading overhead
  MAX_TRANSIT_DISTANCE_KM: 60     // Maximum feasible inter-facility emergency transfer range
};

export const TRANSFER_STATUS = {
  PROPOSED: "PROPOSED",
  APPROVED: "APPROVED",
  DISPATCHED: "DISPATCHED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};

export const URGENCY_LEVELS = {
  CRITICAL_EMERGENCY: {
    code: "CRITICAL_EMERGENCY",
    label: "Critical Emergency",
    max_runway_hours: 48,
    color: "red",
    badge: "bg-red-600 text-white"
  },
  HIGH_URGENCY: {
    code: "HIGH_URGENCY",
    label: "High Urgency",
    max_runway_hours: 96,
    color: "amber",
    badge: "bg-amber-500 text-white"
  },
  ROUTINE_BALANCING: {
    code: "ROUTINE_BALANCING",
    label: "Routine Balancing",
    max_runway_hours: 168,
    color: "sky",
    badge: "bg-sky-600 text-white"
  }
};
