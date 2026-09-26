/**
 * SwasthyaGrid AI — Health Command Copilot Drawer Component (Build 05)
 *
 * Universal slide-out AI assistant powered by Gemini 3.8 Flash & Grounded Intelligence.
 * Accessible from any page in the application.
 *
 * Features:
 * 1. Multi-turn conversational interface with auto-scrolling
 * 2. Real-time context awareness (attaches active facility / page telemetry)
 * 3. Prepackaged contextual suggestion pills
 * 4. Grounded Markdown rendering
 * 5. Interactive Human Decision Action Cards (1-Click Transfer Approval)
 * 6. Optional Gemini API Key configuration toggle
 */

import { 
  queryHealthCommandAgent, 
  submitHumanAction, 
  getSuggestedQueries, 
  formatAgentMarkdown 
} from "../../ai/health_command_agent.js";
import { PHC_DATASET } from "../../data/phc_dataset.js";

// Copilot State
let isOpen = false;
let activePhcId = "PHC-07";
let activeHorizon = 7;
let messages = [];
let isQuerying = false;

export function initHealthCommandCopilot() {
  // Inject drawer container into document body if not present
  if (!document.getElementById("health-command-copilot-root")) {
    const root = document.createElement("div");
    root.id = "health-command-copilot-root";
    document.body.appendChild(root);
  }

  // Initial welcome message if empty
  if (messages.length === 0) {
    messages.push({
      id: "msg-welcome",
      sender: "agent",
      text: "I am your **Health Command Agent**, grounded in live PHC network telemetry and deterministic forecasts. I am actively monitoring the **PHC-07 emergency surge** (+35% demand, 1.8-day IV Fluids stockout) and network-wide capacity risks. How can I assist your operational decisions?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      model: "gemini-3.8-flash (grounded)",
      actionCard: {
        id: "act-iv-transfer-init",
        type: "TRANSFER_RECOMMENDATION",
        title: "Priority Action: Reallocate 150 Units IV Fluids",
        source: "PHC-05 (Central Metro Clinic)",
        target: "PHC-07 (St. Jude Central PHC)",
        resource: "IV Fluids (NS / RL 500ml)",
        quantity: 150,
        rationale: "Prevents a 3.2-day zero-stock shortage window before Sept 25 supplier replenishment. Leaves PHC-05 with 4.5 days buffer."
      }
    });
  }

  // Bind global helper to open/toggle drawer
  window.toggleHealthCommandCopilot = function(phcId = null) {
    if (phcId && typeof phcId === "string") {
      activePhcId = phcId;
    } else {
      // Determine active PHC from hash if available
      const hash = window.location.hash || "";
      if (hash.includes("#/phc/")) {
        activePhcId = hash.split("#/phc/")[1].split("/")[0] || "PHC-07";
      }
    }
    isOpen = !isOpen;
    renderCopilotUi();
  };

  window.sendCopilotQuery = async function(textOverride = null) {
    const inputEl = document.getElementById("copilot-input-field");
    const queryText = textOverride || (inputEl ? inputEl.value.trim() : "");
    if (!queryText || isQuerying) return;

    if (inputEl) inputEl.value = "";

    // Add user message
    messages.push({
      id: `msg-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    isQuerying = true;
    renderCopilotUi();

    // Query agent API
    const result = await queryHealthCommandAgent(queryText, {
      phc_id: activePhcId,
      horizon: activeHorizon,
      isNational: window.location.hash === "#/" || window.location.hash === ""
    });

    // Check if response warrants an action card
    let actionCard = null;
    if (result.reply.toLowerCase().includes("150") && result.reply.toLowerCase().includes("iv fluid")) {
      actionCard = {
        id: `act-transfer-${Date.now()}`,
        type: "TRANSFER_RECOMMENDATION",
        title: "Recommended Transfer: IV Fluids to PHC-07",
        source: "PHC-05 (Central Metro Clinic)",
        target: "PHC-07 (St. Jude Central PHC)",
        resource: "IV Fluids (NS / RL 500ml)",
        quantity: 150,
        rationale: "Mitigates acute 3.2-day zero-stock deficit."
      };
    }

    messages.push({
      id: `msg-agent-${Date.now()}`,
      sender: "agent",
      text: result.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      model: result.model || "gemini-3.8-flash",
      actionCard: actionCard
    });

    isQuerying = false;
    renderCopilotUi();
  };

  window.handleApproveAction = async function(actionId, source, target, resource, quantity) {
    const cardEl = document.getElementById(`action-card-${actionId}`);
    if (cardEl) {
      cardEl.innerHTML = `
        <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-mono">
          <div class="font-bold flex items-center gap-1.5">
            <span class="text-emerald-600 font-black">✓</span> ACTION APPROVED BY HUMAN DECISION MAKER
          </div>
          <div class="text-[11px] text-emerald-700 mt-1">
            Dispatch order confirmed: <strong>${quantity} units of ${resource}</strong> from ${source} to ${target}.
            Logged in Chief Medical Officer audit trail.
          </div>
        </div>
      `;
    }

    // Call backend action API
    await submitHumanAction({
      action_type: "TRANSFER_APPROVED",
      target: target,
      source: source,
      resource: resource,
      quantity: quantity,
      user_role: "Chief Medical Officer",
      notes: `Approved via Command Copilot for emergency mitigation.`
    });
  };

  window.handleConfigureApiKey = function() {
    const currentKey = localStorage.getItem("swasthya_gemini_api_key") || "";
    const newKey = prompt("Enter your Google Gemini API Key to enable live Gemini 3.8 Flash calls (optional):", currentKey);
    if (newKey !== null) {
      if (newKey.trim()) {
        localStorage.setItem("swasthya_gemini_api_key", newKey.trim());
        alert("Gemini API Key saved successfully. Live Gemini 3.8 Flash model activated.");
      } else {
        localStorage.removeItem("swasthya_gemini_api_key");
        alert("API Key cleared. SwasthyaGrid AI will use the grounded deterministic intelligence engine.");
      }
      renderCopilotUi();
    }
  };

  renderCopilotUi();
}

function renderCopilotUi() {
  const root = document.getElementById("health-command-copilot-root");
  if (!root) return;

  const currentPhc = PHC_DATASET.find(p => p.phc_id === activePhcId) || PHC_DATASET[6];
  const suggestedQueries = getSuggestedQueries(activePhcId);
  const hasSavedKey = Boolean(localStorage.getItem("swasthya_gemini_api_key"));

  root.innerHTML = `
    <!-- Floating Trigger Button (Bottom Right) -->
    <button
      type="button"
      onclick="window.toggleHealthCommandCopilot()"
      class="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-indigo-700 to-sky-700 hover:from-indigo-800 hover:to-sky-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-xs border border-indigo-400/30 group"
      title="Open Health Command Copilot (Gemini 3.8 Flash)"
    >
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>Health Command Copilot</span>
      <span class="font-mono text-[10px] px-1.5 py-0.2 rounded bg-indigo-950/60 border border-indigo-400/40 text-indigo-200">
        AI
      </span>
    </button>

    <!-- Slide-Out Drawer Backdrop -->
    <div 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}"
      onclick="window.toggleHealthCommandCopilot()"
    ></div>

    <!-- Slide-Out Drawer Panel -->
    <div 
      class="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}"
    >
      <!-- Header -->
      <div class="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center font-black text-sm">
            AI
          </div>
          <div>
            <h3 class="font-black text-sm text-white tracking-tight flex items-center gap-2 font-mono">
              Health Command Copilot
              <span class="text-[10px] font-bold px-1.5 py-0.2 rounded ${hasSavedKey ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-indigo-950 text-indigo-300 border border-indigo-800"}">
                ${hasSavedKey ? "LIVE GEMINI" : "GROUNDED"}
              </span>
            </h3>
            <p class="text-[10px] text-slate-400">Powered by Gemini 3.8 Flash & Grounded Telemetry</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            onclick="window.handleConfigureApiKey()"
            class="text-[10px] font-mono font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Configure Gemini API Key"
          >
            ⚙ Key
          </button>
          <button
            type="button"
            onclick="window.toggleHealthCommandCopilot()"
            class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Active Context Bar -->
      <div class="px-4 py-2 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900 font-mono flex-shrink-0">
        <div class="flex items-center gap-1.5 truncate">
          <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
          <span class="font-bold">Context:</span>
          <span class="truncate">${currentPhc.phc_id} (${currentPhc.phc_name})</span>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200/70 text-indigo-800">
          ${activeHorizon}d Horizon
        </span>
      </div>

      <!-- Message History Container -->
      <div id="copilot-messages-container" class="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        ${messages.map(msg => {
          const isAgent = msg.sender === "agent";
          return `
            <div class="flex flex-col ${isAgent ? "items-start" : "items-end"}">
              <div class="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-mono">
                <span>${isAgent ? "Health Command Agent" : "Decision Officer"}</span>
                <span>•</span>
                <span>${msg.timestamp}</span>
                ${isAgent && msg.model ? `<span class="px-1 rounded bg-slate-200 text-slate-600">${msg.model}</span>` : ""}
              </div>

              <div class="max-w-[90%] rounded-2xl p-4 shadow-sm ${
                isAgent 
                  ? "bg-white border border-slate-200 text-slate-800 rounded-tl-sm" 
                  : "bg-indigo-700 text-white rounded-tr-sm text-xs font-medium"
              }">
                ${isAgent ? formatAgentMarkdown(msg.text) : `<p>${msg.text}</p>`}
              </div>

              <!-- Action Card (if attached to message) -->
              ${isAgent && msg.actionCard ? `
                <div id="action-card-${msg.actionCard.id}" class="mt-2.5 max-w-[90%] w-full rounded-xl border-2 border-indigo-500/40 bg-white p-4 shadow-md space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      HUMAN DECISION REQUIRED
                    </span>
                    <span class="text-xs font-mono font-bold text-red-600">Urgent</span>
                  </div>

                  <h4 class="text-xs font-black text-slate-900 font-sans">${msg.actionCard.title}</h4>
                  
                  <div class="grid grid-cols-2 gap-2 text-[11px] font-mono p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <span class="text-slate-400">Source:</span>
                      <div class="font-bold text-slate-800">${msg.actionCard.source}</div>
                    </div>
                    <div>
                      <span class="text-slate-400">Target:</span>
                      <div class="font-bold text-slate-800">${msg.actionCard.target}</div>
                    </div>
                    <div>
                      <span class="text-slate-400">Resource:</span>
                      <div class="font-bold text-slate-800">${msg.actionCard.resource}</div>
                    </div>
                    <div>
                      <span class="text-slate-400">Quantity:</span>
                      <div class="font-bold text-indigo-700">${msg.actionCard.quantity} units</div>
                    </div>
                  </div>

                  <p class="text-[11px] text-slate-600 font-sans leading-tight">
                    <strong>Rationale:</strong> ${msg.actionCard.rationale}
                  </p>

                  <div class="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onclick="window.handleApproveAction('${msg.actionCard.id}', '${msg.actionCard.source}', '${msg.actionCard.target}', '${msg.actionCard.resource}', ${msg.actionCard.quantity})"
                      class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1"
                    >
                      <span>✓ Approve Transfer</span>
                    </button>
                  </div>
                </div>
              ` : ""}
            </div>
          `;
        }).join("")}

        ${isQuerying ? `
          <div class="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 max-w-[70%]">
            <span class="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
            <span class="text-xs font-mono text-slate-500">Gemini 3.8 Flash is analyzing grounded context...</span>
          </div>
        ` : ""}
      </div>

      <!-- Quick Suggestion Pills -->
      <div class="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap flex gap-2 flex-shrink-0">
        ${suggestedQueries.map(q => `
          <button
            type="button"
            onclick="window.sendCopilotQuery('${q.replace(/'/g, "\\'")}')"
            class="px-2.5 py-1 text-[11px] rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-medium transition-colors border border-slate-200 flex-shrink-0"
          >
            ${q}
          </button>
        `).join("")}
      </div>

      <!-- Input Bar -->
      <div class="p-3 bg-white border-t border-slate-200 flex-shrink-0">
        <form onsubmit="event.preventDefault(); window.sendCopilotQuery();" class="flex items-center gap-2">
          <input
            id="copilot-input-field"
            type="text"
            placeholder="Ask Command Copilot about risks, forecasts, transfers..."
            class="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autocomplete="off"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  `;

  // Auto-scroll messages to bottom
  const container = document.getElementById("copilot-messages-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}
