# SwasthyaGrid AI — Visual Screenshot Manifest & UI Guide

**Platform Tagline**: *"Predict. Prepare. Redistribute. Protect."*  
**Document Focus**: Interface Architecture, Component Callouts, and Visual Reference Guide for the 8 Core Application Screens  

---

## Screen 1: National Health Command Centre (Overview)
- **Tab Identifier**: `#tab-overview`
- **Recommended Filename**: `01_national_command_centre.png`
- **Caption**: *National Health Command Centre displaying real-time GIS mesh across 12 PHCs in 3 districts, 4 master KPIs, and subsystem health indicators.*
- **Visual Layout**:
  - **Top KPI Header**: 4 high-contrast cards: Total Population (546,100), Active Facilities (12/12 Online), Inpatient Occupancy (126/194 Beds, 64.9%), Network Medicine Availability (88.4%).
  - **Main Display**: Interactive Leaflet GIS map with color-coded facility markers (Red for Critical, Yellow for Watch/Warning, Green for Normal) centered over District North, Central, and South.
  - **System Health Badge**: Green pulsing indicator: `ALL 8 SUBSYSTEMS HEALTHY (100% OPERATIONAL)`.
  - **District Rollup Sidebar**: Comparative district cards showing aggregate facility pressure scores.
- **Key Visible Data Callouts**:
  - District Central flagged as primary operational strain area.
  - PHC-07 marker pulsating in red at coordinates `[28.6139, 77.2090]`.

---

## Screen 2: PHC Digital Twin (Facility Deep Dive)
- **Tab Identifier**: `#tab-digital-twin`
- **Recommended Filename**: `02_phc_digital_twin.png`
- **Caption**: *Facility Digital Twin view for PHC-07 (St. Jude Central PHC) detailing clinical capacity, workforce attendance, and real-time patient surge telemetry.*
- **Visual Layout**:
  - **Facility Selector**: Dropdown showing all 12 PHCs with quick status indicators.
  - **Clinical Capacity Gauges**: Bed occupancy meter displaying 22 / 24 beds occupied (91.7%) with projected peak demand curve reaching 25 beds (104.2%).
  - **Workforce Attendance Cards**: Role-specific attendance tracking: Doctors (3/3, 100%), Nurses (8/10, 80% — gap of 2), Pharmacists (2/2, 100%).
  - **Footfall Velocity Chart**: Bar chart comparing today's acute footfall (286 patients) against the 7-day rolling baseline (212 patients, +34.9% surge).
  - **Operational Status Badge**: High-visibility red alert card: `STATUS: CRITICAL | PRESSURE: 88/100 | VELOCITY: RAPIDLY DETERIORATING`.

---

## Screen 3: Supply Chain Intelligence & Depletion Tracker
- **Tab Identifier**: `#tab-supply-chain`
- **Recommended Filename**: `03_supply_chain_depletion.png`
- **Caption**: *Supply Chain Depletion Tracker highlighting acute IV Fluids stockout risk and 3.2-day zero-stock shortage window at PHC-07.*
- **Visual Layout**:
  - **Essential Medicine Catalog Table**: 10 rows showing Current Stock, Minimum Safety Stock, Static Consumption, Forecast Dynamic Consumption, and Days of Stock.
  - **Highlighted Row (IV Fluids)**: Red warning highlight showing 105 units on hand, surging 58 units/day burn rate, and 1.8 days of dynamic stock.
  - **Shortage Timeline Visualization**: Dual-point timeline displaying projected stockout timestamp (Sept 22, 06:00 UTC) versus scheduled supplier delivery (Sept 25, 10:00 UTC).
  - **Shortage Window Banner**: High-contrast amber badge: `ZERO-STOCK SHORTAGE WINDOW: 3.2 DAYS (150 UNITS DEFICIT)`.

---

## Screen 4: Demand Forecasting & Predictive Analytics
- **Tab Identifier**: `#tab-forecasting`
- **Recommended Filename**: `04_demand_forecasting.png`
- **Caption**: *Multi-horizon demand forecasting comparing Holt's Linear Trend against Simple Moving Average over a 7-day projection window.*
- **Visual Layout**:
  - **Forecasting Model Controls**: Toggle buttons for 7-day, 14-day, and 30-day projection horizons; selector for Holt's Linear, SMA-7, and WMA-7.
  - **Time-Series Chart**: 90-day historical consumption curve transitioning into a dashed 7-day projected trajectory with 95% confidence intervals.
  - **Surge Acceleration Metric Card**: Dynamic indicator showing daily consumption accelerating from baseline 48/day to surging 58/day (+20.8%).
  - **Model Performance Callout**: Transparent statistical backtest score card displaying Holt's MAPE (12.27%) versus SMA-7 MAPE (13.97%).

---

## Screen 5: Unified Early Warning & Compound Risk Radar
- **Tab Identifier**: `#tab-risk-radar`
- **Recommended Filename**: `05_early_warning_radar.png`
- **Caption**: *Unified Early Warning Radar displaying 6-domain facility pressure scoring and compound operational risk detection for PHC-07 vs. PHC-04.*
- **Visual Layout**:
  - **6-Domain Hexagonal Radar Chart**: Visualizing point allocations across Supply (30), Demand (20), Bed Capacity (20), Workforce (15), Delivery (10), and Operational Context (5).
  - **Compound Risk Banner**: Red pulsating banner: `COMPOUND OPERATIONAL RISK: TRUE (3 CRITICAL DOMAINS BREACHED)`.
  - **Side-by-Side Facility Contrast Pane**:
    - **PHC-07**: Score 88/100 (CRITICAL, Rapidly Deteriorating, Acute Active Crisis).
    - **PHC-04**: Score 64/100 (WATCH, Deteriorating, Early Warning Pre-Surge Window).
  - **Velocity Trend Meters**: Visual arrows showing rate of operational score change over the prior 48 hours.

---

## Screen 6: Safety-Buffered Resource Redistribution Console
- **Tab Identifier**: `#tab-redistribution`
- **Recommended Filename**: `06_redistribution_optimizer.png`
- **Caption**: *Resource Redistribution Console presenting optimized peer-to-peer transfer from PHC-05 to PHC-07 with 4.0-day donor safety buffer enforcement.*
- **Visual Layout**:
  - **Transfer Recommendation Card (`TX-REC-001`)**:
    - **Source**: PHC-05 (Central Metro Clinic) | 320 units on hand | 38/day burn.
    - **Target**: PHC-07 (St. Jude Central PHC) | 105 units on hand | 58/day burn.
    - **Recommended Quantity**: **150 units IV Fluids**.
    - **Transit Details**: 18.0 road km / 45 minutes transit via standard medical van.
  - **Donor Safety Buffer Gauge**: Circular progress bar showing PHC-05 retaining **170 units / 4.5 days coverage** (Exceeding the mandatory $\ge 4.0$-day safety invariant).
  - **Status Badge**: `STATUS: PROPOSED | AWAITING CMO SIGN-OFF`.
  - **Action Button**: Primary action button: `Approve Transfer (Chief Medical Officer)`.

---

## Screen 7: Gemini Grounded Health Command Copilot & Audit Trail
- **Tab Identifier**: `#tab-copilot`
- **Recommended Filename**: `07_gemini_command_copilot.png`
- **Caption**: *Gemini 3.8 Flash Grounded Health Command Copilot explaining operational trade-offs and logging Chief Medical Officer human sign-off.*
- **Visual Layout**:
  - **Conversational Chat Interface**: Clean message stream displaying Chief Medical Officer queries and grounded Gemini 3.8 Flash responses.
  - **Grounded Explanation Card**: Detailed clinical-grade breakdown explaining why PHC-05 was selected, why 150 units bridges the gap, and verifying donor buffer stability.
  - **Model Attribution Footer**: Subtle badge: `Engine: Gemini 3.8 Flash (Grounded Telemetry Bridge)`.
  - **Chronological Audit Trail**: Append-only event table displaying action IDs (`ACT-101`, `ACT-102`), UTC timestamps, authorizing role (`Chief Medical Officer`), and cryptographic confirmation status (`CONFIRMED`).

---

## Screen 8: Emergency Simulation & BRICS Federated Mesh
- **Tab Identifier**: `#tab-simulation` and `#tab-federation`
- **Recommended Filename**: `08_simulation_and_federation.png`
- **Caption**: *Emergency Simulation Sandbox quantifying Net Resilience Gap (320 units) alongside sovereign BRICS Federated Intelligence Layer (Round 004).*
- **Visual Layout**:
  - **Simulation Control Panel**: Stress multiplier sliders (Demand Spike, Delivery Delay, Bed Saturation) and pre-configured scenario selector (**Severe 7-Day District Central Surge**).
  - **Net Resilience Gap Gauge**: Prominent meter showing 1,500 units deficit vs. 1,180 units safe surplus $\rightarrow$ **Net Resilience Gap: 320 Units**.
  - **Data Immutability Badge**: `SHA-256 BASELINE HASH: MATCH (100% ISOLATED)`.
  - **BRICS Federation Dashboard**: 5 sovereign national node cards (India, Brazil, South Africa, China, Russia) displaying sample counts and local error rates.
  - **Collaborative Result Card**: High-contrast banner: `ROUND 004 COMPLETE | 93,500 SAMPLES | ERROR: 15.7% -> 13.1% (+2.6% ACCURACY GAIN)`.
