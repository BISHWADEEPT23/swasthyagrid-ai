# SwasthyaGrid AI — 4:25 Golden Demonstration Script

**Platform Tagline**: *"Predict. Prepare. Redistribute. Protect."*  
**Total Target Runtime**: 4 Minutes 25 Seconds  
**Format**: Live Screen Walkthrough with Presenter Narration  
**Presenter Role**: Chief Public Health Architect  

---

## Pre-Demo Checklist (T-minus 60 Seconds)

1. Verify server is running: `python server.py` (serving on `http://localhost:8080`).
2. Reset demo state to baseline: Call `POST /api/demo/reset` or click **"Reset Demo State"** in the top navigation bar.
3. Open browser to `http://localhost:8080` in full-screen mode (F11).
4. Verify browser zoom is set to 100% and console displays zero unhandled errors.

---

## Segment 1: Welcome & The National Command Centre Overview
- **Timestamp**: `0:00 - 0:30` (Duration: 30s)
- **Active View**: **Overview / National Command Centre** (`#tab-overview`)
- **UI Actions**:
  1. Hover over the 4 master KPI cards across the top header.
  2. Point cursor to the interactive Leaflet map showing District North, Central, and South.
  3. Point to the System Health Badge showing `ALL 8 SUBSYSTEMS HEALTHY`.
- **Spoken Narration**:
  > *"Good morning, esteemed judges. Across developing nations, Primary Health Centres are the front lines of healthcare. Yet when seasonal outbreaks hit, rural clinics run out of basic, life-saving medicines not because supplies don't exist in the country, but because visibility is fragmented, thresholds are static, and redistribution is chaotic.*  
  >  
  > *This is SwasthyaGrid AI—a federated public-health resilience platform that predicts shortages, safely redistributes supplies without depleting donors, and collaboratively stress-tests emergencies.*  
  >  
  > *We are currently viewing the National Command Centre. Our prototype monitors a synthetic regional network of 12 Primary Health Centres across three administrative districts, serving 546,000 citizens with 194 inpatient beds and 136 healthcare professionals. All eight core analytics subsystems are live, synchronized, and reporting healthy."*
- **Key Metrics Highlighted**:
  - 12 Facilities across 3 Districts
  - 546,100 Population Protected
  - 194 Total Beds (126 Occupied / 64.9%)
  - 8/8 Subsystems Reporting `HEALTHY`

---

## Segment 2: The Crisis at PHC-07 (St. Jude Central PHC)
- **Timestamp**: `0:30 - 1:05` (Duration: 35s)
- **Active View**: **PHC Digital Twin** (`#tab-digital-twin`)
- **UI Actions**:
  1. Select **"PHC-07 — St. Jude Central PHC"** from the Facility Dropdown.
  2. Scroll down to highlight the Bed Occupancy gauge and Staff Attendance cards.
  3. Highlight the red status badge: `CRITICAL | PRESSURE: 88/100`.
- **Spoken Narration**:
  > *"Let's zoom into our primary hotspot: PHC-07, St. Jude Central PHC in District Central. The Digital Twin reveals an acute crisis unfolding right now.*  
  >  
  > *Today's patient footfall has surged to 286 patients—a 35% surge above its 7-day baseline of 212. Bed occupancy is at 91.7%, with 22 of 24 beds filled, and our models project peak bed demand reaching 104% within 48 hours—imminent inpatient overflow.*  
  >  
  > *Meanwhile, two nurses are absent, reducing nursing capacity to 80%. When footfall surges, bed occupancy caps out, and staff is strained, medicine inventory faces immediate exhaustion."*
- **Key Metrics Highlighted**:
  - Footfall: 286 Patients (+34.9% ≈ +35% surge)
  - Bed Occupancy: 22/24 beds (91.7% today, peak 104%)
  - Facility Pressure Score: 88/100 (`CRITICAL`)
  - Risk Velocity: `Rapidly Deteriorating`

---

## Segment 3: Dynamic Demand Forecasting & The Shortage Window
- **Timestamp**: `1:05 - 1:40` (Duration: 35s)
- **Active View**: **Supply Chain & Demand Forecasting** (`#tab-forecasting` or `#tab-supply-chain`)
- **UI Actions**:
  1. Click on **IV Fluids (NS / RL 500ml)** in the inventory table.
  2. Toggle between **Static Burn Rate** and **Forecast-Adjusted Dynamic Burn Rate**.
  3. Hover over the projected depletion point and the scheduled delivery marker on the timeline chart.
- **Spoken Narration**:
  > *"Now observe how traditional supply chain systems fail. On paper, PHC-07 has 105 units of IV Fluids remaining. At its static historical consumption of 48 units a day, a legacy system calculates 2.2 days of stock and flags this as manageable.*  
  >  
  > *SwasthyaGrid's dynamic forecasting engine, powered by Holt's double exponential smoothing, captures demand acceleration. It reveals the true dynamic burn rate has surged to 58 units per day. At this rate, on-hand stock will completely exhaust in just 1.8 days—depleting at 6:00 AM on September 22nd.*  
  >  
  > *The next supplier delivery from the state warehouse isn't scheduled until September 25th—five days away. That leaves PHC-07 facing an acute 3.2-day zero-stock shortage window. Without intervention, doctors will have zero IV fluids for 76 consecutive hours."*
- **Key Metrics Highlighted**:
  - On-Hand Stock: 105 units
  - Static Burn: 48 units/day (2.2 days) vs Dynamic Burn: 58 units/day (1.8 days)
  - Projected Stockout: Sept 22 (06:00 UTC)
  - Next Delivery: Sept 25 (10:00 UTC, 5.0 days away)
  - **Zero-Stock Shortage Window: 3.2 Days (150 Units Deficit)**

---

## Segment 4: Early Warning Radar & Contrast with PHC-04
- **Timestamp**: `1:40 - 2:15` (Duration: 35s)
- **Active View**: **Early Warning & Risk Radar** (`#tab-risk-radar`)
- **UI Actions**:
  1. Point to the Multi-Domain Radar Chart for PHC-07 showing 3 critical spikes (Supply 30/30, Demand 20/20, Beds 20/20).
  2. Click on **PHC-04 (Pine Grove Health Centre)** in the comparison pane.
- **Spoken Narration**:
  > *"On our Unified Early Warning Radar, PHC-07 triggers a Compound Operational Risk alert because three distinct domains—supply, demand, and inpatient capacity—have breached critical thresholds simultaneously.*  
  >  
  > *Now look at the contrast with PHC-04 in District North. PHC-04 is in WATCH status with a score of 64. Its patient footfall is drifting upward by 12%, but its medicine availability is 84.5% with over 6 days of stock and zero shortage window.*  
  >  
  > *This demonstrates SwasthyaGrid's intelligence: PHC-07 is an acute active crisis requiring emergency mutual aid, while PHC-04 represents an early-warning window where scheduled procurement adjustments can prevent crisis altogether."*
- **Key Metrics Highlighted**:
  - PHC-07: Score 88/100, Compound Risk `TRUE`, 3.2d Shortage Window $\rightarrow$ Emergency Transfer
  - PHC-04: Score 64/100, Emerging Risk `TRUE`, 0.0d Shortage Window $\rightarrow$ Routine Reorder Adjustment

---

## Segment 5: Safety-Buffered Redistribution Optimization
- **Timestamp**: `2:15 - 2:50` (Duration: 35s)
- **Active View**: **Resource Redistribution Console** (`#tab-redistribution`)
- **UI Actions**:
  1. Highlight the top recommendation card: `TX-REC-001 (PHC-05 -> PHC-07)`.
  2. Point to the Haversine distance, travel time, and the **Donor Safety Buffer** metric.
- **Spoken Narration**:
  > *"When a shortage window is identified, our Redistribution Optimizer evaluates the entire regional road network using Haversine geodesic routing with rural terrain multipliers.*  
  >  
  > *The engine identifies PHC-05, Central Metro Clinic, just 18 kilometers away with 320 units in stock. It proposes transferring exactly 150 units.*  
  >  
  > *Crucially, observe our Donor Safety Buffer Invariant: transferring 150 units leaves PHC-05 with 170 units, or 4.5 days of safe coverage. Because our mathematical invariant requires every donor to retain at least 4.0 days of buffer, PHC-05 remains completely safe. SwasthyaGrid mathematically guarantees that mutual aid will never trigger a secondary crisis at the donor facility."*
- **Key Metrics Highlighted**:
  - Donor: PHC-05 (Central Metro Clinic) | 18.0 road km / 45 mins transit
  - Donor Stock: 320 units | Daily Burn: 38 units/day
  - Transfer Quantity: 150 units
  - **Donor Post-Transfer Buffer: 170 units / 4.5 Days (Invariant Safe: $\ge 4.0\text{d}$)**

---

## Segment 6: Human-in-the-Loop Governance & Health Command Copilot
- **Timestamp**: `2:50 - 3:25` (Duration: 35s)
- **Active View**: **Command Copilot & Human Action Log** (`#tab-copilot`)
- **UI Actions**:
  1. Open the Command Copilot chat interface.
  2. Click the quick prompt: *"Explain recommended transfer for PHC-07."*
  3. Show Gemini 3.8 Flash grounded explanation detailing rationale, transit, and buffer.
  4. Click **"Approve Transfer (Chief Medical Officer)"**.
  5. Show the action appearing immediately in the chronological audit trail.
- **Spoken Narration**:
  > *"SwasthyaGrid strictly adheres to Responsible AI principles: deterministic algorithms calculate the numbers, while Gemini 3.8 Flash acts as our grounded Command Copilot, explaining trade-offs in plain clinical language.*  
  >  
  > *Notice that the platform does not autonomously dispatch supplies. Full authority rests with licensed health administrators. As Chief Medical Officer, I click 'Approve Transfer'.*  
  >  
  > *The decision is cryptographically logged in our immutable audit trail with an exact UTC timestamp, and the transfer status shifts to Approved, ready for dispatch by regional logistics."*
- **Key Governance Highlighted**:
  - Deterministic Math + Grounded LLM Explanation
  - Mandatory Human-in-the-Loop (HITL) Sign-Off
  - Immutable Audit Event: `ACT-102 | CMO | APPROVED | 150 Units IV Fluids`

---

## Segment 7: Emergency Simulation & Resilience Sandbox
- **Timestamp**: `3:25 - 3:55` (Duration: 30s)
- **Active View**: **Emergency Simulator** (`#tab-simulation`)
- **UI Actions**:
  1. Select the scenario: **"Severe District Central Surge (7-Day)"**.
  2. Click **"Execute Stress Simulation"**.
  3. Highlight the simulated network degradation and the **Net Resilience Gap** gauge.
  4. Point to the SHA-256 Baseline Integrity badge.
- **Spoken Narration**:
  > *"To prepare before disaster strikes, administrators can enter our Emergency Simulation Sandbox. Let's execute a severe 7-day demand surge across District Central.*  
  >  
  > *In seconds, the sandbox clones state in memory and stress-tests the network. The result: District Central experiences an aggregate deficit of 1,500 units, while neighboring facilities hold 1,180 units of safe surplus.*  
  >  
  > *SwasthyaGrid identifies a Net Resilience Gap of exactly 320 units—meaning mutual aid can absorb 78% of the disaster, but 320 units must be requested from the state stockpile. And because simulations run in memory, our SHA-256 cryptographic check proves baseline operational data remains 100% untouched."*
- **Key Simulation Metrics Highlighted**:
  - Aggregate Deficit: 1,500 units | Safe Surplus: 1,180 units
  - **Net Resilience Gap: 320 units (78.7% absorbed by mutual aid)**
  - Baseline Immutability: SHA-256 Match (100% Isolated)

---

## Segment 8: BRICS Sovereign Federated Intelligence & Closing
- **Timestamp**: `3:55 - 4:25` (Duration: 30s)
- **Active View**: **BRICS Federated Mesh** (`#tab-federation`)
- **UI Actions**:
  1. Show the 5 sovereign national nodes (India, Brazil, South Africa, China, Russia).
  2. Highlight Round 004 results and the aggregation summary card.
  3. Conclude facing judges.
- **Spoken Narration**:
  > *"Finally, how do we learn across borders without violating national data sovereignty? Our BRICS Federated Intelligence Layer coordinates collaborative machine learning across sovereign health nodes in India, Brazil, South Africa, China, and Russia.*  
  >  
  > *In Round 004, four active nodes collaborated across 93,500 training samples using sample-weighted Federated Averaging. Network forecast error dropped from 15.7% to 13.1%—a 2.6 percentage point gain—with zero facility records or patient data ever crossing a national border.*  
  >  
  > *SwasthyaGrid AI delivers the future of public health logistics: grounded in verified mathematics, protected by safety invariants, guided by responsible AI, and united across sovereign borders.*  
  >  
  > *Predict. Prepare. Redistribute. Protect. Thank you, and we welcome your questions."*
- **Key Federation Metrics Highlighted**:
  - 5 Sovereign Nodes | Round 004 Active
  - 93,500 Training Samples Aggregated
  - **Forecast Error: 15.7% $\rightarrow$ 13.1% (+2.6% Net Accuracy Improvement)**
  - Zero Raw Patient or Facility Data Centralization

---

## Fallback & Emergency Procedures During Live Pitch

| Issue Encountered | Immediate Presenter Action | Spoken Fallback Line |
| :--- | :--- | :--- |
| **Browser Freezes or Tabs Unresponsive** | Press `F5` to reload page; state is cached in local session. | *"As the browser refreshes our local cache, notice how the stateless client architecture restores full situational awareness in under one second..."* |
| **External Internet Drops / Gemini API Error** | Chat falls back automatically to local deterministic engine in <5ms. | *"Notice that even with external cloud connectivity disconnected, our internal deterministic intelligence engine continues providing clinical-grade explanations from grounded telemetry."* |
| **Transfer Button Already Clicked** | Re-run `POST /api/demo/reset` or point to existing confirmed entry in audit log. | *"As you can see, our immutable audit trail has already registered this Chief Medical Officer authorization under action identifier ACT-101."* |
| **Judge Asks to Jump Directly to Redistribution** | Click directly on `#tab-redistribution` in navigation header. | *"Let's go straight to the redistribution matrix and inspect the 4.0-day donor safety buffer invariant."* |
