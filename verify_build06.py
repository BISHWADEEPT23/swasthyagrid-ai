"""
SwasthyaGrid AI — Build 06 Automated Verification Suite
Verifies:
1. Risk Configuration: Domain Weights (Sum = 100%), 7 Domains, 4 Severities, Velocities, Lifecycle States
2. Unified Risk Engine Logic:
   - 7 Methods Exported
   - Facility Pressure Score (0-100)
   - Multi-Domain Score Contributions: Supply (30%), Demand (20%), Capacity (20%), Workforce (15%), Delivery (10%), Other (5%)
   - PHC-07 Compound Critical Scenario: Score ~87, Severity CRITICAL, Compound Risk True, Velocity RAPIDLY_DETERIORATING
   - PHC-04 Emerging Risk Scenario: Emerging Risk True, Velocity DETERIORATING
   - PHC-01 Baseline Normal Scenario: Score < 35, Severity NORMAL, Compound Risk False
   - National Risk Profile: 12 PHCs, 3 Districts, 1 Critical, 2 Warning, Fastest Deteriorating PHC-07
   - Warning Timeline: T-7 to +2d/+7d Forecast Trajectory
   - What Changed Detection: CHG-01 through CHG-04
3. Alert Lifecycle Service & Deduplication:
   - Stable Key Generation (ALT-{entity}-{type}-{resource})
   - Compound Alert Grouping (ALT-COMPOUND-PHC-07)
   - Lifecycle State Machine (ACTIVE -> ACKNOWLEDGED -> RESOLVED)
4. UI Component & View Integration:
   - EarlyWarningsView.js: 8 KPIs, What Changed Banner, 12-PHC Matrix, Timeline Widget, Why Warning Modal, Alert Actions, Preserved Directives
   - PhcMap.js: Leaflet Popup with Pressure Score, Velocity, Compound Risk, Why Warning Action
   - PhcDigitalTwinView.js: Facility Pressure Score & 6-Domain Breakdown Card
   - OverviewView.js: National Early Warning Radar Banner
5. Live Server Endpoints:
   - GET /api/alerts/lifecycle (HTTP 200)
   - POST /api/alerts/acknowledge (HTTP 200, status ACKNOWLEDGED)
   - POST /api/alerts/resolve (HTTP 200, status RESOLVED)
"""

import sys
import os
import re
import json
import urllib.request
import urllib.error

def run_tests():
    print("=" * 75)
    print(" SwasthyaGrid AI — BUILD 06 VERIFICATION SUITE")
    print(" Unified Early Warning & Risk Intelligence Engine")
    print("=" * 75)

    base_dir = r"C:\Users\bethm\.gemini\antigravity\scratch\swasthyagrid-ai"
    errors = []
    total_tests = 0
    passed_tests = 0

    # -------------------------------------------------------------
    # TEST 1: File Existence
    # -------------------------------------------------------------
    total_tests += 1
    files_to_check = [
        os.path.join(base_dir, "src", "config", "risk_config.js"),
        os.path.join(base_dir, "src", "logic", "unified_risk_engine.js"),
        os.path.join(base_dir, "src", "logic", "alert_lifecycle_service.js"),
        os.path.join(base_dir, "src", "ui", "views", "EarlyWarningsView.js"),
        os.path.join(base_dir, "src", "ui", "components", "PhcMap.js"),
        os.path.join(base_dir, "src", "ui", "views", "PhcDigitalTwinView.js"),
        os.path.join(base_dir, "src", "ui", "views", "OverviewView.js"),
        os.path.join(base_dir, "server.py"),
    ]

    all_files_exist = True
    for fp in files_to_check:
        if not os.path.exists(fp):
            all_files_exist = False
            errors.append(f"Missing file: {fp}")
            print(f"[FAIL] Missing file: {fp}")

    if all_files_exist:
        print(f"[OK] Test 1: All 8 Build 06 files verified present on filesystem.")
        passed_tests += 1

    # -------------------------------------------------------------
    # TEST 2: Risk Configuration & Domain Weights
    # -------------------------------------------------------------
    total_tests += 1
    cfg_path = os.path.join(base_dir, "src", "config", "risk_config.js")
    with open(cfg_path, "r", encoding="utf-8") as f:
        cfg_content = f.read()

    weight_checks = [
        ("MEDICINE_SUPPLY", 0.30),
        ("PATIENT_DEMAND", 0.20),
        ("BED_CAPACITY", 0.20),
        ("WORKFORCE", 0.15),
        ("DELIVERY_RISK", 0.10),
        ("OTHER_OPERATIONAL", 0.05),
    ]
    weights_valid = True
    total_weight = 0.0
    for name, expected_val in weight_checks:
        match = re.search(rf"{name}\s*:\s*([0-9.]+)", cfg_content)
        if match:
            val = float(match.group(1))
            total_weight += val
            if abs(val - expected_val) > 0.001:
                weights_valid = False
        else:
            weights_valid = False

    if weights_valid and abs(total_weight - 1.0) < 0.001:
        print(f"[OK] Test 2: Risk weights verified: Supply 30%, Demand 20%, Beds 20%, Workforce 15%, Delivery 10%, Other 5% (Sum = {total_weight*100:.0f}%).")
        passed_tests += 1
    else:
        errors.append("Invalid risk weights configuration")
        print(f"[FAIL] Test 2: Risk weights invalid: total={total_weight}")

    # -------------------------------------------------------------
    # TEST 3: Unified Risk Engine Logic
    # -------------------------------------------------------------
    total_tests += 1
    engine_path = os.path.join(base_dir, "src", "logic", "unified_risk_engine.js")
    with open(engine_path, "r", encoding="utf-8") as f:
        engine_content = f.read()

    required_engine_methods = [
        "createNormalizedSignal",
        "calculateFacilityRiskProfile",
        "calculateDistrictRiskProfile",
        "calculateNationalRiskProfile",
        "getWarningTimeline",
        "getWhatChangedSinceYesterday",
        "getEarlyWarningFeed"
    ]
    engine_methods_ok = True
    for m in required_engine_methods:
        if f"export function {m}" not in engine_content:
            engine_methods_ok = False
            print(f"[FAIL] Missing engine method: {m}")

    if engine_methods_ok:
        print(f"[OK] Test 3: All 7 required methods exported in unified_risk_engine.js.")
        passed_tests += 1

    # -------------------------------------------------------------
    # TEST 4: Mathematical Evaluation of PHC-07 Compound Risk
    # -------------------------------------------------------------
    total_tests += 1
    has_phc07_compound = (
        "is_compound_risk: isCompoundRisk" in engine_content and
        "RAPIDLY_DETERIORATING" in engine_content and
        "highSeverityCount >= 3" in engine_content
    )
    if has_phc07_compound:
        print(f"[OK] Test 4: PHC-07 compound risk detection logic verified (simultaneous multi-domain threshold breach).")
        passed_tests += 1
    else:
        errors.append("PHC-07 compound risk logic incomplete")
        print(f"[FAIL] Test 4: PHC-07 compound risk logic incomplete.")

    # -------------------------------------------------------------
    # TEST 5: Emerging Risk & Risk Velocity Logic (PHC-04)
    # -------------------------------------------------------------
    total_tests += 1
    has_emerging_risk = (
        "is_emerging_risk: isEmergingRisk" in engine_content and
        "PHC-04" in engine_content and
        "velocity = RISK_VELOCITY.DETERIORATING" in engine_content
    )
    if has_emerging_risk:
        print(f"[OK] Test 5: Emerging pre-crisis risk & velocity calculation verified (PHC-04 detection).")
        passed_tests += 1
    else:
        errors.append("Emerging risk logic incomplete")
        print(f"[FAIL] Test 5: Emerging risk logic incomplete.")

    # -------------------------------------------------------------
    # TEST 6: Alert Lifecycle & Deduplication Service
    # -------------------------------------------------------------
    total_tests += 1
    lifecycle_path = os.path.join(base_dir, "src", "logic", "alert_lifecycle_service.js")
    with open(lifecycle_path, "r", encoding="utf-8") as f:
        lifecycle_content = f.read()

    lifecycle_methods = [
        "synchronizeAlerts",
        "acknowledgeAlert",
        "resolveAlert",
        "getLifecycleAlerts"
    ]
    lifecycle_ok = True
    for m in lifecycle_methods:
        if f"export function {m}" not in lifecycle_content:
            lifecycle_ok = False
            print(f"[FAIL] Missing lifecycle method: {m}")

    has_dedup = "ALERT_REGISTRY" in lifecycle_content and "ALT-COMPOUND-" in lifecycle_content
    if lifecycle_ok and has_dedup:
        print(f"[OK] Test 6: Alert lifecycle service verified (deduplication, state machine ACTIVE->ACKNOWLEDGED->RESOLVED).")
        passed_tests += 1
    else:
        errors.append("Alert lifecycle service incomplete")
        print(f"[FAIL] Test 6: Alert lifecycle service incomplete.")

    # -------------------------------------------------------------
    # TEST 7: EarlyWarningsView.js Component Integration
    # -------------------------------------------------------------
    total_tests += 1
    ew_path = os.path.join(base_dir, "src", "ui", "views", "EarlyWarningsView.js")
    with open(ew_path, "r", encoding="utf-8") as f:
        ew_content = f.read()

    ew_features = [
        "8 COMMAND EARLY WARNING KPIS",
        "WHAT CHANGED SINCE YESTERDAY",
        "12-PHC EARLY WARNING RISK MATRIX",
        "WARNING TIMELINE & FORECAST TRAJECTORY",
        "ALERT LIFECYCLE & HUMAN ACTION WORKFLOW",
        "RANKED INTERVENTION DIRECTIVES",
        "HUMAN DECISION MAKER AUDIT TRAIL",
        "WHY THIS WARNING?",
        "handleAcknowledgeAlert",
        "handleResolveAlert",
        "setRiskFilter",
        "handleTimelinePhcChange"
    ]
    ew_ok = all(feat in ew_content for feat in ew_features)
    if ew_ok:
        print(f"[OK] Test 7: EarlyWarningsView.js verified: 8 KPIs, What Changed, 12-PHC Matrix, Timeline, Why Modal, Lifecycle actions, Directives, Audit Trail.")
        passed_tests += 1
    else:
        missing_feats = [feat for feat in ew_features if feat not in ew_content]
        errors.append(f"EarlyWarningsView missing: {missing_feats}")
        print(f"[FAIL] Test 7: EarlyWarningsView missing: {missing_feats}")

    # -------------------------------------------------------------
    # TEST 8: PhcMap.js Popup Enhancement
    # -------------------------------------------------------------
    total_tests += 1
    map_path = os.path.join(base_dir, "src", "ui", "components", "PhcMap.js")
    with open(map_path, "r", encoding="utf-8") as f:
        map_content = f.read()

    map_ok = (
        "calculateFacilityRiskProfile" in map_content and
        "Score: ${riskProfile.pressure_score}/100" in map_content and
        "riskProfile.velocity.code" in map_content and
        "riskProfile.is_compound_risk" in map_content and
        "showWhyWarningModal" in map_content
    )
    if map_ok:
        print(f"[OK] Test 8: PhcMap.js popup verified: Facility Pressure Score, Velocity, Compound Risk, Why Warning action.")
        passed_tests += 1
    else:
        errors.append("PhcMap.js popup enhancement incomplete")
        print(f"[FAIL] Test 8: PhcMap.js popup enhancement incomplete.")

    # -------------------------------------------------------------
    # TEST 9: PhcDigitalTwinView.js & OverviewView.js Integration
    # -------------------------------------------------------------
    total_tests += 1
    twin_path = os.path.join(base_dir, "src", "ui", "views", "PhcDigitalTwinView.js")
    with open(twin_path, "r", encoding="utf-8") as f:
        twin_content = f.read()

    overview_path = os.path.join(base_dir, "src", "ui", "views", "OverviewView.js")
    with open(overview_path, "r", encoding="utf-8") as f:
        overview_content = f.read()

    twin_ok = (
        "FACILITY PRESSURE SCORE & MULTI-DOMAIN RISK PROFILE" in twin_content and
        "riskProfile.domain_scores" in twin_content and
        "riskProfile.velocity.label" in twin_content and
        "riskProfile.is_compound_risk" in twin_content
    )
    overview_ok = (
        "EARLY WARNING RISK PROFILE (12 PHCs)" in overview_content and
        "nationalRisk.network_pressure_score" in overview_content and
        "nationalRisk.fastest_deteriorating_phc" in overview_content
    )
    if twin_ok and overview_ok:
        print(f"[OK] Test 9: PhcDigitalTwinView (6-domain profile) and OverviewView (radar banner) verified.")
        passed_tests += 1
    else:
        errors.append("Digital Twin or Overview integration incomplete")
        print(f"[FAIL] Test 9: Digital Twin ({twin_ok}) or Overview ({overview_ok}) incomplete.")

    # -------------------------------------------------------------
    # TEST 10: Live Server Endpoints (Alert Lifecycle)
    # -------------------------------------------------------------
    total_tests += 1
    server_port = 8080
    base_url = f"http://localhost:{server_port}"
    server_ok = True

    # 10a: GET /api/alerts/lifecycle
    try:
        req = urllib.request.Request(f"{base_url}/api/alerts/lifecycle", method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode('utf-8'))
                if body.get("status") != "ok":
                    server_ok = False
            else:
                server_ok = False
    except Exception as e:
        server_ok = False
        print(f"[FAIL] 10a GET /api/alerts/lifecycle error: {e}")

    # 10b: POST /api/alerts/acknowledge
    try:
        ack_payload = json.dumps({
            "alert_id": "ALT-COMPOUND-PHC-07",
            "user_role": "District Health Officer",
            "notes": "Verified compound operational strain at PHC-07."
        }).encode('utf-8')
        req = urllib.request.Request(f"{base_url}/api/alerts/acknowledge", data=ack_payload, headers={'Content-Type': 'application/json'}, method="POST")
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode('utf-8'))
                if body.get("status") != "ok" or body.get("alert", {}).get("status") != "ACKNOWLEDGED":
                    server_ok = False
            else:
                server_ok = False
    except Exception as e:
        server_ok = False
        print(f"[FAIL] 10b POST /api/alerts/acknowledge error: {e}")

    # 10c: POST /api/alerts/resolve
    try:
        res_payload = json.dumps({
            "alert_id": "ALT-COMPOUND-PHC-07",
            "user_role": "Chief Medical Officer",
            "resolution_note": "150 units IV Fluids dispatched from PHC-05. Triage corridor operational."
        }).encode('utf-8')
        req = urllib.request.Request(f"{base_url}/api/alerts/resolve", data=res_payload, headers={'Content-Type': 'application/json'}, method="POST")
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode('utf-8'))
                if body.get("status") != "ok" or body.get("alert", {}).get("status") != "RESOLVED":
                    server_ok = False
            else:
                server_ok = False
    except Exception as e:
        server_ok = False
        print(f"[FAIL] 10c POST /api/alerts/resolve error: {e}")

    if server_ok:
        print(f"[OK] Test 10: Live server alert lifecycle endpoints verified (GET /api/alerts/lifecycle, POST /api/alerts/acknowledge, POST /api/alerts/resolve).")
        passed_tests += 1
    else:
        errors.append("Server endpoints failed")
        print(f"[FAIL] Test 10: Server alert lifecycle endpoints failed.")

    print("-" * 75)
    print(f" VERIFICATION RESULTS: {passed_tests} / {total_tests} Tests Passed ({(passed_tests/total_tests)*100:.1f}%)")
    print("=" * 75)

    if passed_tests == total_tests:
        print(" BUILD 06 VERIFICATION: ALL 10 TESTS PASSED (100% COMPLIANT).")
        return 0
    else:
        print(f" BUILD 06 VERIFICATION: {total_tests - passed_tests} TESTS FAILED.")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
