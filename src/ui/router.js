/**
 * SwasthyaGrid AI — Client-Side Hash Router
 * Supports:
 * - #/ or "" (National Dashboard / Overview)
 * - #/network (PHC Network Directory)
 * - #/phc/:phcId (PHC Digital Twin e.g. #/phc/PHC-07)
 * - #/inventory (Medicine Inventory)
 * - Subsections with placeholder views for future build iterations
 */

import { renderOverviewView, mountOverviewView } from "./views/OverviewView.js";
import { renderPhcNetworkView } from "./views/PhcNetworkView.js";
import { renderPhcDigitalTwinView, mountPhcDigitalTwinView } from "./views/PhcDigitalTwinView.js";
import { renderMedicineView } from "./views/MedicineView.js";
import { renderPatientDemandView, mountPatientDemandView } from "./views/PatientDemandView.js";
import { renderEarlyWarningsView, mountEarlyWarningsView } from "./views/EarlyWarningsView.js";
import { renderRedistributionView, mountRedistributionView } from "./views/RedistributionView.js";
import { renderSimulatorView } from "./views/SimulatorView.js";
import { renderFederationView } from "./views/FederationView.js";
import { renderReportsView } from "./views/ReportsView.js";
import { renderArchitectureView } from "./views/ArchitectureView.js";
import { renderAuditView } from "./views/AuditView.js";
import { initHealthCommandCopilot } from "./components/HealthCommandCopilot.js";
import { renderSidebar } from "./components/Sidebar.js";
import { renderTopBar, setActiveRole } from "./components/TopBar.js";
import { PHC_DATASET } from "../data/phc_dataset.js";
import { resetSystemHealth } from "../logic/system_health_service.js";
import { resetAuditLog } from "../logic/audit_service.js";

export class Router {
  constructor(appContainerId) {
    this.container = document.getElementById(appContainerId);
    this.currentRoute = "";
    
    // Initialize global Health Command Copilot drawer
    initHealthCommandCopilot();
    
    // Bind global helpers
    window.refreshCurrentRoute = () => this.handleRoute();
    window.handleRoleChange = (role) => {
      setActiveRole(role);
      this.handleRoute();
    };

    // Global Reset Demo Handler (Build 10)
    window.handleResetDemo = async () => {
      try {
        resetSystemHealth();
        resetAuditLog();
        if (window.handleResetSimulation) window.handleResetSimulation();
        if (window.handleResetFederation) window.handleResetFederation();

        // Notify server
        try {
          await fetch("/api/demo/reset", { method: "POST" });
        } catch (e) {
          console.warn("Local server reset API offline or skipped:", e);
        }

        // Display brief toast / banner
        const toast = document.createElement("div");
        toast.className = "fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce";
        toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> SwasthyaGrid AI Demo Reset to Deterministic Baseline`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);

        this.handleRoute();
      } catch (err) {
        console.error("Error during demo reset:", err);
      }
    };

    window.addEventListener("hashchange", () => this.handleRoute());
  }

  init() {
    this.handleRoute();
  }

  parseHash() {
    const hash = window.location.hash || "#/";
    const path = hash.replace(/^#\/?/, "");
    const parts = path.split("/").filter(Boolean);
    return {
      raw: hash,
      path: parts[0] || "",
      param: parts[1] || null
    };
  }

  handleRoute() {
    const route = this.parseHash();
    let contentHtml = "";
    let navId = "overview";
    let breadcrumbs = [{ label: "Overview", hash: "#/" }];
    let mountFn = null;

    if (!route.path || route.path === "") {
      navId = "overview";
      breadcrumbs = [{ label: "National Command Centre", hash: "#/" }];
      contentHtml = renderOverviewView();
      mountFn = mountOverviewView;
    } else if (route.path === "network") {
      navId = "network";
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "PHC Network", hash: "#/network" }
      ];
      contentHtml = renderPhcNetworkView();
    } else if (route.path === "phc") {
      navId = "network";
      const phcId = route.param || "PHC-07";
      const phc = PHC_DATASET.find(p => p.phc_id === phcId) || { phc_name: phcId };

      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "PHC Network", hash: "#/network" },
        { label: `${phcId} (${phc.phc_name})`, hash: `#/phc/${phcId}` }
      ];

      contentHtml = renderPhcDigitalTwinView(phcId);
      mountFn = () => mountPhcDigitalTwinView(phcId);
    } else if (route.path === "inventory") {
      navId = "inventory";
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "Medicine Inventory", hash: "#/inventory" }
      ];
      contentHtml = renderMedicineView();
    } else if (route.path === "demand") {
      navId = "demand";
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "Patient Demand Intelligence", hash: "#/demand" }
      ];
      contentHtml = renderPatientDemandView();
      mountFn = mountPatientDemandView;
    } else if (route.path === "warnings") {
      navId = "warnings";
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "AI Early Warnings & Health Command", hash: "#/warnings" }
      ];
      contentHtml = renderEarlyWarningsView();
      mountFn = mountEarlyWarningsView;
    } else if (route.path === "redistribution") {
      navId = "redistribution";
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "Resource Redistribution & Logistics", hash: "#/redistribution" }
      ];
      contentHtml = renderRedistributionView();
      mountFn = mountRedistributionView;
    } else if (route.path === "simulator") {
      navId = "simulator";
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "Emergency Simulation & Stress Testing", hash: "#/simulator" }
      ];
      contentHtml = renderSimulatorView();
    } else if (route.path === "federation") {
      navId = "federation";
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "BRICS Federated Health Intelligence", hash: "#/federation" }
      ];
      contentHtml = renderFederationView();
    } else if (route.path === "reports") {
      navId = "reports";
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "Executive Resilience Report", hash: "#/reports" }
      ];
      contentHtml = renderReportsView();
    } else if (route.path === "architecture") {
      navId = "architecture";
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "Architecture & Data Lineage", hash: "#/architecture" }
      ];
      contentHtml = renderArchitectureView();
    } else if (route.path === "audit") {
      navId = "audit";
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: "Consolidated Audit Centre", hash: "#/audit" }
      ];
      contentHtml = renderAuditView();
    } else {
      // Placeholder for upcoming builds (Beds, Workforce, Federation, etc.)
      navId = route.path;
      const title = route.path.charAt(0).toUpperCase() + route.path.slice(1);
      breadcrumbs = [
        { label: "Overview", hash: "#/" },
        { label: title, hash: `"#/${route.path}"` }
      ];
      contentHtml = `
        <div class="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto my-12">
          <div class="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-4 font-black text-lg">
            SG
          </div>
          <h2 class="text-xl font-bold text-slate-900">${title} Module</h2>
          <p class="text-xs text-slate-500 mt-2 max-w-md mx-auto">
            This module interface is provisioned and will be activated in subsequent build phases. All live operational metrics are active in the Command Centre and PHC Network.
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <a href="#/" class="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors">
              Return to Command Centre
            </a>
            <a href="#/network" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">
              Explore PHC Network
            </a>
          </div>
        </div>
      `;
    }

    // Assemble application layout
    this.container.innerHTML = `
      <div class="flex h-screen overflow-hidden bg-slate-50">
        <!-- Sidebar Navigation -->
        ${renderSidebar(navId)}

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <!-- Top Bar -->
          ${renderTopBar(breadcrumbs)}

          <!-- Page Body -->
          <main class="flex-1 p-6 max-w-7xl w-full mx-auto">
            ${contentHtml}
          </main>
        </div>
      </div>
    `;

    // Mount post-render hooks (Charts, Maps, etc.)
    if (mountFn) {
      setTimeout(() => mountFn(), 50);
    }
  }
}
