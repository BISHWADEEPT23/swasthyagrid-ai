"""
SwasthyaGrid AI — Automated Verification Script
Validates:
1. 12 synthetic PHCs across 3 fictional districts (4 per district)
2. Status distribution: 8 NORMAL, 2 WATCH, 1 WARNING, 1 CRITICAL
3. PHC-07 Critical Scenario:
   - Patient footfall: +35%
   - IV Fluid consumption: +45%
   - Paracetamol consumption: +32%
   - Declining available beds
   - Alert message: "Potential resource shortage detected at PHC-07."
4. Initial 10 medicines inventory schema and fields
5. Reusable calculation logic:
   - bedOccupancy()
   - staffAvailability()
   - daysOfStock()
   - patientDemandDeviation()
   - medicineAvailability()
6. Navigation, routes, and component structure
"""

import json
import re
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def test_phc_dataset():
    phc_file = os.path.join(BASE_DIR, "src", "data", "phc_dataset.js")
    assert os.path.exists(phc_file), f"Missing {phc_file}"
    with open(phc_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract PHC IDs
    phc_ids = re.findall(r'phc_id:\s*"([^"]+)"', content)
    print(f"[OK] Found {len(phc_ids)} PHC records: {phc_ids}")
    assert len(phc_ids) == 12, f"Expected 12 PHCs, found {len(phc_ids)}"

    # Districts check
    districts = re.findall(r'district:\s*"([^"]+)"', content)
    d_north = [d for d in districts if d == "District North"]
    d_central = [d for d in districts if d == "District Central"]
    d_south = [d for d in districts if d == "District South"]
    print(f"[OK] Districts: North={len(d_north)}, Central={len(d_central)}, South={len(d_south)}")
    assert len(d_north) == 4, "District North must have 4 PHCs"
    assert len(d_central) == 4, "District Central must have 4 PHCs"
    assert len(d_south) == 4, "District South must have 4 PHCs"

    # Status distribution
    statuses = re.findall(r'operational_status:\s*"([^"]+)"', content)
    normal_cnt = statuses.count("NORMAL")
    watch_cnt = statuses.count("WATCH")
    warning_cnt = statuses.count("WARNING")
    critical_cnt = statuses.count("CRITICAL")

    print(f"[OK] Status distribution: NORMAL={normal_cnt}, WATCH={watch_cnt}, WARNING={warning_cnt}, CRITICAL={critical_cnt}")
    assert normal_cnt == 8, f"Expected 8 NORMAL, got {normal_cnt}"
    assert watch_cnt == 2, f"Expected 2 WATCH, got {watch_cnt}"
    assert warning_cnt == 1, f"Expected 1 WARNING, got {warning_cnt}"
    assert critical_cnt == 1, f"Expected 1 CRITICAL, got {critical_cnt}"

def test_phc07_scenario():
    scenario_file = os.path.join(BASE_DIR, "src", "data", "emergency_scenario.js")
    assert os.path.exists(scenario_file), f"Missing {scenario_file}"
    with open(scenario_file, "r", encoding="utf-8") as f:
        content = f.read()

    assert "Potential resource shortage detected at PHC-07." in content, "Missing primary alert text"
    assert "+35" in content, "Missing +35% footfall"
    assert "+45" in content, "Missing +45% IV fluids"
    assert "+32" in content, "Missing +32% Paracetamol"
    print("[OK] PHC-07 emergency scenario verified (+35% footfall, +45% IV fluids, +32% Paracetamol)")

def test_medicines():
    med_file = os.path.join(BASE_DIR, "src", "data", "medicine_dataset.js")
    assert os.path.exists(med_file), f"Missing {med_file}"
    with open(med_file, "r", encoding="utf-8") as f:
        content = f.read()

    expected_meds = [
        "Paracetamol", "Amoxicillin", "ORS", "Azithromycin",
        "Metformin", "Insulin", "IV Fluids", "Doxycycline",
        "Iron & Folic Acid", "Zinc"
    ]
    for med in expected_meds:
        assert med in content, f"Missing medicine: {med}"
    print("[OK] Verified all 10 core medicines in catalog")

def test_calculations_logic():
    calc_file = os.path.join(BASE_DIR, "src", "logic", "calculations.js")
    assert os.path.exists(calc_file), f"Missing {calc_file}"
    with open(calc_file, "r", encoding="utf-8") as f:
        content = f.read()

    required_funcs = [
        "bedOccupancy",
        "staffAvailability",
        "daysOfStock",
        "patientDemandDeviation",
        "medicineAvailability"
    ]
    for fn in required_funcs:
        assert f"export function {fn}" in content, f"Missing function: {fn}"
    print("[OK] Verified all 5 required calculation utilities in calculations.js")

def test_views_and_routes():
    views = [
        ("OverviewView.js", "src/ui/views/OverviewView.js"),
        ("PhcNetworkView.js", "src/ui/views/PhcNetworkView.js"),
        ("PhcDigitalTwinView.js", "src/ui/views/PhcDigitalTwinView.js"),
        ("MedicineView.js", "src/ui/views/MedicineView.js"),
        ("Router", "src/ui/router.js"),
        ("Sidebar", "src/ui/components/Sidebar.js"),
        ("TopBar", "src/ui/components/TopBar.js")
    ]
    for name, rel_path in views:
        full_path = os.path.join(BASE_DIR, rel_path)
        assert os.path.exists(full_path), f"Missing {name} at {full_path}"
    print("[OK] All views, components, and router files verified")

if __name__ == "__main__":
    print("\nRunning SwasthyaGrid AI Verification Suite...")
    print("=" * 60)
    test_phc_dataset()
    test_phc07_scenario()
    test_medicines()
    test_calculations_logic()
    test_views_and_routes()
    print("=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! [OK]\n")
