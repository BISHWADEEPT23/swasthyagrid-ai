/**
 * SwasthyaGrid AI — Healthcare Interoperability & Canonical Model Adapter
 *
 * Provides:
 * 1. Conceptual FHIR-Style Resource Mappings
 *    - Organization (District Health Authority)
 *    - Location (Primary Health Centre)
 *    - HealthcareService (OPD, Inpatient, Maternal, Pharmacy)
 *    - PractitionerRole (Medical Officer, Nurse, Pharmacist)
 *    - Medication / MedicationKnowledge (Essential Medicines List)
 *    - SupplyDelivery (Inbound Shipments & Inter-Facility Transfers)
 *    - Encounter (Aggregated census/footfall only - ZERO individual patient data)
 *
 * 2. Ingestion Adapters:
 *    - FhirJsonAdapter (FHIR R4 Bundle → Canonical Model)
 *    - CsvAdapter (Tabular Inventory & Footfall → Canonical Model)
 *    - RestAdapter (State Portal Push API → Canonical Model)
 *    - SyntheticAdapter (SwasthyaGrid Baseline → Canonical Model)
 *
 * 3. Canonical Data Model Schema Definitions
 */

export const CANONICAL_ENTITIES = [
  "Facility",
  "District",
  "Medicine",
  "Inventory",
  "Consumption",
  "Capacity",
  "Workforce",
  "Delivery",
  "Forecast",
  "RiskSignal",
  "Alert",
  "TransferRecommendation",
  "SimulationScenario",
  "FederationNode",
  "ModelVersion"
];

export const FHIR_RESOURCE_MAPPINGS = {
  Organization: {
    fhir_type: "Organization",
    swasthya_concept: "District Health Administration",
    fields: {
      id: "district_id",
      name: "district_name",
      partOf: "state_or_national_authority"
    }
  },
  Location: {
    fhir_type: "Location",
    swasthya_concept: "Primary Health Centre (PHC)",
    fields: {
      id: "phc_id",
      name: "phc_name",
      position: "coordinates { lat, lng }",
      managingOrganization: "district_id",
      type: "phc_type (Community / Rural / Urban / Tribal)"
    }
  },
  HealthcareService: {
    fhir_type: "HealthcareService",
    swasthya_concept: "PHC Service Capabilities",
    fields: {
      providedBy: "phc_id",
      category: "service_type (Outpatient, Inpatient, Maternal Care, Immunization, Pharmacy)",
      active: "boolean"
    }
  },
  PractitionerRole: {
    fhir_type: "PractitionerRole",
    swasthya_concept: "Staff Attendance & Workforce Allocation",
    fields: {
      organization: "phc_id",
      code: "role_title (Medical Officer, Staff Nurse, Pharmacist, Lab Technician)",
      availableTime: "shift_schedule",
      active: "status (Present / Absent / On-Leave)"
    }
  },
  Medication: {
    fhir_type: "Medication",
    swasthya_concept: "Essential Medicine Specification",
    fields: {
      code: "medicine_id / rxnorm / atc_code",
      form: "dosage_form (vial, tablet, sachet)",
      ingredient: "generic_name (e.g. Sodium Chloride 0.9%, Paracetamol 500mg)"
    }
  },
  SupplyDelivery: {
    fhir_type: "SupplyDelivery",
    swasthya_concept: "Inbound Supply Shipment & Inter-Facility Transfer",
    fields: {
      id: "transfer_id or shipment_id",
      supplier: "source_phc_id or supplier_code",
      destination: "target_phc_id",
      suppliedItem: "{ itemCodeableConcept: medicine_id, quantity: count }",
      status: "status (PROPOSED, IN_TRANSIT, DELIVERED)",
      occurrenceDateTime: "expected_delivery_date"
    }
  },
  Encounter: {
    fhir_type: "Encounter (Aggregate Only)",
    swasthya_concept: "Daily Patient Footfall & Bed Census (ZERO Patient Identifiers)",
    fields: {
      serviceProvider: "phc_id",
      period: "reporting_date",
      class: "inpatient_count / outpatient_count",
      note: "aggregate_triage_category (e.g. dehydration cluster)"
    }
  }
};

/**
 * Adapter 1: Synthetic Baseline Adapter (Normalizes internal dataset to Canonical Model)
 */
export class SyntheticAdapter {
  static normalize(phcRaw, inventoryList = []) {
    return {
      facility: {
        id: phcRaw.phc_id,
        name: phcRaw.phc_name,
        district: phcRaw.district,
        type: phcRaw.phc_type,
        location: {
          latitude: phcRaw.coordinates.lat,
          longitude: phcRaw.coordinates.lng
        },
        contact: {
          officer_in_charge: phcRaw.medical_officer_in_charge,
          phone: phcRaw.contact_number
        }
      },
      capacity: {
        total_beds: phcRaw.bed_capacity.total_beds,
        occupied_beds: phcRaw.bed_capacity.occupied_beds,
        occupancy_rate: phcRaw.bed_capacity.occupancy_rate,
        status: phcRaw.bed_capacity.status
      },
      workforce: {
        total_staff: phcRaw.staff_attendance.total_staff,
        present: phcRaw.staff_attendance.present_today,
        attendance_rate: phcRaw.staff_attendance.attendance_rate
      },
      inventory: inventoryList
        .filter(inv => inv.phc_id === phcRaw.phc_id)
        .map(inv => ({
          medicine_id: inv.medicine_id,
          medicine_name: inv.medicine_name,
          current_stock: inv.current_stock,
          unit: inv.unit,
          daily_consumption: inv.daily_consumption_rate,
          days_of_stock: inv.days_of_stock,
          next_delivery: inv.next_delivery_date,
          batch_number: inv.batch_number,
          expiry_date: inv.expiry_date
        }))
    };
  }
}

/**
 * Adapter 2: FHIR JSON Bundle Adapter (Mock for external hospital/health system ingest)
 */
export class FhirJsonAdapter {
  static parseBundle(bundleJson) {
    if (!bundleJson || bundleJson.resourceType !== "Bundle" || !Array.isArray(bundleJson.entry)) {
      throw new Error("Invalid FHIR Bundle: expected resourceType 'Bundle' with 'entry' array");
    }

    const canonicalFacilities = [];
    const canonicalInventories = [];

    bundleJson.entry.forEach(item => {
      const resource = item.resource;
      if (!resource) return;

      if (resource.resourceType === "Location") {
        canonicalFacilities.push({
          id: resource.id,
          name: resource.name,
          district: resource.managingOrganization?.display || "Unknown District",
          type: resource.type?.[0]?.text || "Primary Health Centre",
          location: {
            latitude: resource.position?.latitude || 0,
            longitude: resource.position?.longitude || 0
          }
        });
      } else if (resource.resourceType === "SupplyDelivery") {
        canonicalInventories.push({
          transfer_id: resource.id,
          source_facility: resource.supplier?.reference,
          target_facility: resource.destination?.reference,
          medicine_id: resource.suppliedItem?.itemCodeableConcept?.coding?.[0]?.code,
          quantity: resource.suppliedItem?.quantity?.value,
          status: resource.status
        });
      }
    });

    return {
      facilities: canonicalFacilities,
      transfers: canonicalInventories,
      source_standard: "HL7 FHIR R4",
      parsed_at: new Date().toISOString()
    };
  }
}

/**
 * Adapter 3: CSV Tabular Adapter (Mock for legacy spreadsheet ingest)
 */
export class CsvAdapter {
  static parseStockCsv(csvString) {
    if (!csvString || typeof csvString !== "string") return [];
    const lines = csvString.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      if (cols.length === headers.length) {
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = cols[idx];
        });
        records.push({
          phc_id: row.phc_id || row.facility_id,
          medicine_id: row.medicine_id || row.item_code,
          current_stock: parseInt(row.stock || row.current_stock || "0", 10),
          daily_consumption: parseFloat(row.consumption || row.daily_burn || "0")
        });
      }
    }
    return records;
  }
}

/**
 * Adapter 4: REST Adapter (State Health System Webhook / API Ingestion)
 */
export class RestAdapter {
  static normalizeTelemetryPayload(payload) {
    if (!payload || !payload.facility_id) {
      throw new Error("Malformed REST telemetry payload: missing facility_id");
    }
    return {
      facility_id: payload.facility_id,
      timestamp: payload.timestamp || new Date().toISOString(),
      footfall_today: Number(payload.footfall || 0),
      bed_occupancy: Number(payload.beds_occupied || 0),
      telemetry_source: payload.system_name || "State Health Portal REST API"
    };
  }
}
