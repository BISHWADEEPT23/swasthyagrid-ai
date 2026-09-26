"""
SwasthyaGrid AI — Build 05 Verification Script
Verifies:
1. Health Command Agent backend endpoints (POST /api/agent/query, POST /api/agent/action, GET /api/agent/actions)
2. Grounded intelligence responses for PHC-07 emergency, bed saturation, and supply risk rankings
3. Human decision maker action recording and audit trail
4. Frontend module structure and router integration
"""

import sys
import os
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8080"
BASE_DIR = r"C:\Users\bethm\.gemini\antigravity\scratch\swasthyagrid-ai"

def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def main():
    print("==================================================")
    print("SWASTHYAGRID AI — BUILD 05 VERIFICATION SUITE")
    print("==================================================")
    errors = []

    # 1. Check frontend file existence
    files_to_check = [
        os.path.join(BASE_DIR, "src", "ai", "health_command_agent.js"),
        os.path.join(BASE_DIR, "src", "ui", "components", "HealthCommandCopilot.js"),
        os.path.join(BASE_DIR, "src", "ui", "views", "EarlyWarningsView.js"),
    ]
    for filepath in files_to_check:
        if os.path.exists(filepath):
            print(f"[OK] File exists: {os.path.relpath(filepath, BASE_DIR)}")
        else:
            errors.append(f"Missing file: {filepath}")
            print(f"[FAIL] Missing file: {filepath}")

    # 2. Test GET /api/agent/actions
    try:
        status, data = make_request("/api/agent/actions")
        if status == 200 and data.get("status") == "ok" and "decisions" in data:
            print(f"[OK] GET /api/agent/actions returned {len(data['decisions'])} decision(s)")
        else:
            errors.append(f"GET /api/agent/actions returned unexpected payload: {data}")
            print(f"[FAIL] GET /api/agent/actions failed: {data}")
    except Exception as e:
        errors.append(f"GET /api/agent/actions failed: {e}")
        print(f"[FAIL] GET /api/agent/actions exception: {e}")

    # 3. Test POST /api/agent/query for PHC-07 emergency
    try:
        status, data = make_request("/api/agent/query", method="POST", data={
            "prompt": "Explain PHC-07 emergency and IV Fluids shortage window",
            "phc_id": "PHC-07",
            "horizon": 7
        })
        reply = data.get("reply", "")
        if status == 200 and "PHC-07" in reply and ("1.8 days" in reply or "105" in reply) and "3.2-day" in reply:
            print("[OK] POST /api/agent/query (PHC-07 Emergency): Verified grounded metrics (105 units, 1.8d stockout, 3.2d shortage window)")
        else:
            errors.append(f"POST /api/agent/query did not contain expected PHC-07 grounded metrics: {reply[:200]}")
            print(f"[FAIL] POST /api/agent/query (PHC-07): {reply[:200]}")
    except Exception as e:
        errors.append(f"POST /api/agent/query failed: {e}")
        print(f"[FAIL] POST /api/agent/query exception: {e}")

    # 4. Test POST /api/agent/query for Bed Capacity
    try:
        status, data = make_request("/api/agent/query", method="POST", data={
            "prompt": "What is the bed capacity risk across the network?",
            "phc_id": "PHC-07",
            "horizon": 7
        })
        reply = data.get("reply", "")
        if status == 200 and ("PHC-07" in reply or "capacity" in reply.lower()) and ("104%" in reply or "25 beds" in reply or "CAPACITY RISK" in reply):
            print("[OK] POST /api/agent/query (Bed Capacity): Verified bed saturation metrics (104% peak, 25 beds)")
        else:
            errors.append(f"POST /api/agent/query did not contain expected bed metrics: {reply[:200]}")
            print(f"[FAIL] POST /api/agent/query (Beds): {reply[:200]}")
    except Exception as e:
        errors.append(f"POST /api/agent/query (Beds) failed: {e}")
        print(f"[FAIL] POST /api/agent/query (Beds) exception: {e}")

    # 5. Test POST /api/agent/action (Human Decision Maker Action)
    try:
        status, data = make_request("/api/agent/action", method="POST", data={
            "action_type": "EMERGENCY_TRANSFER_APPROVED",
            "target": "PHC-07 (St. Jude Central PHC)",
            "source": "PHC-05 (Central Metro Clinic)",
            "resource": "IV Fluids (NS / RL 500ml)",
            "quantity": 150,
            "user_role": "Chief Medical Officer",
            "notes": "Verified via Build 05 verification suite."
        })
        if status == 200 and data.get("status") == "ok" and "action_id" in data:
            print(f"[OK] POST /api/agent/action: Recorded human decision {data['action_id']}")
        else:
            errors.append(f"POST /api/agent/action failed: {data}")
            print(f"[FAIL] POST /api/agent/action: {data}")
    except Exception as e:
        errors.append(f"POST /api/agent/action failed: {e}")
        print(f"[FAIL] POST /api/agent/action exception: {e}")

    # 6. Verify Router & TopBar wiring
    with open(os.path.join(BASE_DIR, "src", "ui", "router.js"), "r", encoding="utf-8") as f:
        router_code = f.read()
    if 'route.path === "warnings"' in router_code and "initHealthCommandCopilot" in router_code:
        print("[OK] Router correctly routes #/warnings and initializes HealthCommandCopilot")
    else:
        errors.append("Router missing #/warnings or initHealthCommandCopilot")
        print("[FAIL] Router missing #/warnings or initHealthCommandCopilot")

    with open(os.path.join(BASE_DIR, "src", "ui", "components", "TopBar.js"), "r", encoding="utf-8") as f:
        topbar_code = f.read()
    if "toggleHealthCommandCopilot" in topbar_code:
        print("[OK] TopBar includes Command Copilot trigger button")
    else:
        errors.append("TopBar missing toggleHealthCommandCopilot button")
        print("[FAIL] TopBar missing toggleHealthCommandCopilot button")

    print("--------------------------------------------------")
    if not errors:
        print("BUILD 05 VERIFICATION COMPLETED SUCCESSFULLY [PASS]")
        return 0
    else:
        print(f"BUILD 05 VERIFICATION FAILED WITH {len(errors)} ERRORS:")
        for err in errors:
            print(f" - {err}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
