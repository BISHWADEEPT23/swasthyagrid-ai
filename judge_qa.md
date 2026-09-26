# SwasthyaGrid AI — Technical Judge Q&A Document

**Platform**: SwasthyaGrid AI (*"Predict. Prepare. Redistribute. Protect."*)  
**Audience**: Healthcare Competition Judges, Technical Evaluators & System Architects  
**Purpose**: Defensible, grounded technical answers to 19 critical architecture, algorithm, and governance questions.  

---

### Q1: Why does SwasthyaGrid need AI?
**Answer**:  
Traditional public health supply chains suffer from **fragmented, lagging signals**. Facilities report stock, attendance, and patient counts into disconnected silos. A dashboard can display current inventory (e.g., "105 bottles of IV Fluids"), but humans cannot mentally correlate multi-variable trends across hundreds of facilities in real time.

SwasthyaGrid uses AI in two complementary tiers:
1. **Deterministic Machine Learning & Time-Series Analytics**: Captures non-linear demand drift, accelerates consumption burn rates during disease outbreaks, and models the exact zero-stock shortage window before supplier replenishment.
2. **Generative AI (Gemini 3.8 Flash)**: Synthesizes cross-signal telemetry (supply + footfall + bed pressure + transit logistics) into actionable natural-language executive directives, explains *why* an alert occurred, and articulates logistical trade-offs for human decision makers.

---

### Q2: Why not just use a dashboard?
**Answer**:  
A dashboard is **passive, descriptive, and retrospective**—it tells you that a health center is *already* out of medicine. By the time a red badge appears on a traditional dashboard, patients are already being turned away.

SwasthyaGrid is **predictive, prescriptive, and preemptive**:
- It computes **Forecast-Adjusted Days of Stock** days before a stockout occurs.
- It identifies **Shortage Windows** where on-hand stock will deplete before the next manufacturer shipment.
- It automatically evaluates surrounding facilities to identify **safe donors**, verifies that the donor maintains at least 4.0 days of protected stock, and computes an optimized transfer route before clinicians face a crisis.

---

### Q3: Where does Gemini add value versus deterministic code?
**Answer**:  
We maintain a strict architectural separation:
- **Deterministic Code Does the Math**: All inventory counts, days-of-stock formulas, risk thresholds, Haversine transit distances, optimization rankings, and federated averaging are executed by deterministic algorithms. We never allow an LLM to perform mathematical calculations or inventory tallies.
- **Gemini Synthesizes & Explains**: Gemini 3.8 Flash acts as the **Health Command Agent Copilot**. It translates complex multi-dimensional signals into clinical-grade executive briefings, explains the trade-offs of proposed reallocations, answers ad-hoc operational questions in natural language, and prepares contextual briefings for district health officers.

---

### Q4: How are hallucinations controlled?
**Answer**:  
Hallucinations are mitigated through four architectural barriers:
1. **Grounded Retrieval-Augmented Generation (RAG)**: The system assembles a structured operational telemetry JSON payload (active stock, daily burn, delivery dates, bed occupancy) and injects it into the prompt context with strict instructions to *only* cite provided telemetry.
2. **Deterministic Heuristic Fallback Engine**: If Gemini is offline or unconfigured, the backend invokes a deterministic heuristic engine that outputs pre-calibrated, verified operational directives directly from live telemetry.
3. **Entity Validation Boundary**: Conversational queries about non-existent facilities (e.g., PHC-99), fictional districts (District West), or unlisted medicines return a strict `Registry Lookup: Entity Not Found` notice. The model cannot invent fictional facilities.
4. **Clinical Safety Filter**: Queries attempting to elicit patient diagnoses, mortality predictions, or drug prescriptions are intercepted and refused by an automated policy guardrail.

---

### Q5: How are forecasts evaluated?
**Answer**:  
Forecasts were evaluated through **walk-forward rolling-origin backtesting** across 90 days of synthetic historical data ($N=1,080$ facility-day observations) across all 12 PHCs, comparing Holt's Linear Trend against a 7-day Simple Moving Average (SMA-7) baseline:
- **Surge Conditions (PHC-07)**: Holt's linear trend **outperformed baseline**, reducing Mean Absolute Percentage Error (MAPE) from 13.97% to 12.27% and Root Mean Squared Error (RMSE) from 36.31 to 31.10 by capturing the upward trajectory 5–7 days earlier than lagging averages.
- **Stationary Conditions (PHC-01 to PHC-03)**: On stable health centers with random daily noise, simple moving average dampened variance better, resulting in Holt underperforming baseline by 1.1–1.5% MAPE.
- **Transparency**: We do not claim universal model superiority; we report exact backtested metrics and recommend an ensemble architecture for production.

---

### Q6: How does redistribution work?
**Answer**:  
The Redistribution Engine operates on a **multi-criteria optimization objective**:
$$\text{Score} = w_{\text{urgency}} \cdot S_{\text{urgency}} + w_{\text{proximity}} \cdot S_{\text{proximity}} + w_{\text{buffer}} \cdot S_{\text{buffer}} + w_{\text{fefo}} \cdot S_{\text{fefo}}$$
1. **Urgency (35%)**: Evaluates recipient deficit severity and days until supplier delivery.
2. **Proximity & Transit Time (25%)**: Calculates geodesic road distance using the Haversine formula scaled by a 1.4 road tortuosity factor to minimize transit time.
3. **Donor Residual Safety Buffer (25%)**: Incentivizes donors with high stock runways.
4. **FEFO Expiry Rotation (15%)**: Prioritizes batches approaching expiry within 60 days to reduce network wastage.

---

### Q7: Can redistribution harm donor facilities?
**Answer**:  
**No.** The engine enforces an immutable **Donor Safety Invariant**:
$$\text{Post-Transfer Donor Days of Stock} \ge 4.0\text{ days}$$
$$\text{Max Safe Transfer Quantity} = \min(\text{Needed}, \max(0, \text{Stock} - \text{Burn Rate} \times 4.0\text{d}))$$
A facility is never permitted to donate stock if doing so would cause its own inventory to breach its safety buffer before its next replenishment delivery.

---

### Q8: What happens if no safe donor exists?
**Answer**:  
If every health center in the network has $\le 4.0$ days of stock or is facing surging demand, the Redistribution Engine **refuses to recommend any transfers**. It sets `best_donor = null`, outputs `STATUS: NO_SAFE_DONOR_AVAILABLE`, and flags a **Net Resilience Gap**. The system advises district administrators to release strategic emergency warehouse reserves or expedite emergency supplier deliveries rather than cannibalizing neighbouring clinics.

---

### Q9: What data crosses national borders?
**Answer**:  
**Zero raw facility or patient health records ever cross national borders.**  
In our BRICS federated architecture, all patient footfall, medical records, and local inventory transactions remain strictly quarantined within sovereign national boundaries. Only **anonymized model parameter deltas** (gradients and weights) and aggregated sample counts are transmitted to the coordinating server for weighted aggregation.

---

### Q10: Is federated learning really implemented?
**Answer**:  
In this prototype, federated learning is implemented as a **deterministic local architectural simulation**. The mathematical aggregation core implements true **sample-weighted Federated Averaging (FedAvg)**:
$$\bar{W} = \frac{\sum_{k=1}^K n_k \cdot W_k}{\sum_{k=1}^K n_k}$$
Verified on manual proofs ($(2\times 100 + 4\times 300)/400 = 3.5$). The simulation models realistic node dynamics: 5 sovereign nodes with heterogeneous (Non-IID) local dataset sizes, varying error baselines, network timeouts, offline node handling, and model drift detection. We do not claim cross-border physical telecom infrastructure is deployed.

---

### Q11: Is differential privacy implemented?
**Answer**:  
In the current Build 11 prototype, **formal Differential Privacy (DP-SGD with calibrated Gaussian noise addition and privacy budget $\epsilon, \delta$ tracking) is an architectural specification, not a deployed cryptographic module.**  
The current prototype ensures data sovereignty through architectural isolation: facility-level records never leave the local node. Adding formal $(\epsilon, \delta)$-differential privacy and secure multi-party computation (SMPC) is part of our production roadmap.

---

### Q12: How would this integrate with existing systems?
**Answer**:  
SwasthyaGrid includes an **Interoperability Adapter** supporting:
- **Canonical Public Health Operational Data Model (v1.0)**: Standardizes facility, inventory, and delivery entities.
- **HL7 FHIR R4 Compatibility**: Maps operational facilities to `Location`, essential medicines to `MedicationKnowledge`, and inventory snapshots to `Basic` resource bundles.
- **Government Portals**: Designed to ingest CSV/JSON extracts or REST endpoints from India's **HMIS** (Health Management Information System) and **e-Aushadhi** drug inventory portals.

---

### Q13: Is this FHIR certified?
**Answer**:  
**No.** SwasthyaGrid is an operational research and competition prototype. While our schema conforms to HL7 FHIR R4 resource definitions, it has not undergone formal ONC or HL7 regulatory compliance testing.

---

### Q14: How is privacy handled?
**Answer**:  
1. **Aggregated Operational Telemetry Only**: The platform tracks facility beds, supply counts, and total daily footfall counts. It does not ingest Patient Identifiable Information (no names, Aadhaar numbers, phone numbers, or individual patient charts).
2. **Role-Based Access Control (RBAC)**: Enforces 4 privilege tiers (`PHC Officer`, `District Health Officer`, `State/National Administrator`, `Federation Administrator`).
3. **Data Sanitization**: Frontend and backend inputs are sanitized to prevent script injection and command execution.

---

### Q15: Who approves transfers?
**Answer**:  
**Human healthcare decision makers exclusively.**  
SwasthyaGrid operates strictly as a **decision-support platform**. The AI proposes optimized redistribution candidates, but physical dispatch requires human sign-off (Chief Medical Officer or District Health Officer). The system maintains an immutable audit log recording the approving officer's ID, timestamp, and authorization notes.

---

### Q16: Can Gemini take autonomous action?
**Answer**:  
**Absolutely not.**  
Gemini and the Health Command Agent have **zero execution privileges**. They cannot modify inventory numbers, approve purchase orders, dispatch vehicles, or alter system alert states. System RBAC strictly forbids autonomous execution (`can_modify_inventory: false`, `can_execute_transfers: false`).

---

### Q17: What happens if Gemini fails?
**Answer**:  
The platform possesses **100% operational resilience against AI failures**:
- All operational calculations (forecasting, supply chain depletion, risk radar, redistribution optimization, simulation, and federated averaging) run on deterministic algorithms independent of LLMs.
- If the Gemini API is unreachable, times out, or experiences rate limits, the backend catches the error and serves deterministic grounded briefings seamlessly without application interruption.

---

### Q18: How does the prototype scale beyond 12 PHCs?
**Answer**:  
The 12-PHC network represents a validated district pilot archetype. Scaling to state or national scale (30,000+ PHCs) requires:
1. **Database Backend**: Migrating in-memory JSON state to a horizontally scalable distributed database (e.g., Google Cloud BigQuery for time-series analytics, Cloud Spanner or PostgreSQL for transactional transfer logs).
2. **Spatial Indexing**: Replacing $O(N^2)$ distance scans with **spatial R-Tree or Geohash indexing** (e.g., PostGIS) to query candidate donors within a 50 km radius in $<10\text{ ms}$.
3. **Microservices Partitioning**: Deploying the Redistribution Optimizer and Forecasting Engine as containerized microservices on Kubernetes (GKE).

---

### Q19: What would be required for real deployment?
**Answer**:  
Transforming the prototype into a production national deployment involves five steps:
1. **EHR / HMIS Integration**: Establish automated daily ETL pipelines syncing with state drug logistics portals (e.g., e-Aushadhi, DVDMS).
2. **Field Fleet Telematics**: Connect transfer tracking to state medical transport GPS systems (108 ambulance fleet / refrigerated drug vans).
3. **Cold-Chain IoT Telemetry**: Ingest real-time temperature sensor feeds for vaccine and insulin storage.
4. **Security Certification**: Complete SOC 2 Type II, ISO 27001, and Indian Digital Personal Data Protection (DPDP) Act compliance audits.
5. **Clinical Validation Trials**: Conduct a 6-month prospective field trial across 50 rural PHCs measuring stockout days averted and logistics cost savings.
