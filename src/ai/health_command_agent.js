/**
 * SwasthyaGrid AI — Health Command Agent Client Service (Build 05)
 *
 * Connects UI components to the Gemini 3.8 Flash / Grounded Reasoning API.
 * Manages:
 * 1. Agent query dispatch with grounded structured intelligence context
 * 2. Human Decision Maker action logging and status updates
 * 3. Prepackaged contextual clinical & operational queries
 * 4. Lightweight Markdown rendering for agent responses
 */

import { buildPhcForecastPromptPayload, buildNationalBriefingPromptPayload } from "./forecast_ai_interface.js";

/**
 * Sends a query to the Health Command Agent API.
 * @param {string} prompt 
 * @param {Object} options - { phc_id, horizon, isNational }
 * @returns {Promise<Object>} Agent reply object
 */
export async function queryHealthCommandAgent(prompt, options = {}) {
  const phcId = options.phc_id || "PHC-07";
  const horizon = options.horizon || 7;
  const isNational = options.isNational || false;

  // Build grounded context payload
  const context = isNational 
    ? buildNationalBriefingPromptPayload(horizon)
    : buildPhcForecastPromptPayload(phcId, horizon);

  // Retrieve user-saved API key from localStorage if present
  const savedApiKey = localStorage.getItem("swasthya_gemini_api_key") || null;

  try {
    const response = await fetch("/api/agent/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        phc_id: phcId,
        horizon,
        context,
        api_key: savedApiKey
      })
    });

    if (!response.ok) {
      throw new Error(`Agent query failed with HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Health Command Agent query error:", err);
    return {
      status: "error",
      reply: `**Agent Connection Error**: Unable to reach Health Command Agent backend. ${err.message}`,
      model: "offline-fallback",
      mode: "error"
    };
  }
}

/**
 * Records a human decision maker sign-off or action.
 * @param {Object} actionData - { action_type, target, resource, quantity, source, user_role, notes }
 * @returns {Promise<Object>}
 */
export async function submitHumanAction(actionData) {
  try {
    const response = await fetch("/api/agent/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actionData)
    });

    if (!response.ok) {
      throw new Error(`Action recording failed with HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Failed to record human action:", err);
    return { status: "error", message: err.message };
  }
}

/**
 * Fetches audit log of all human decision maker actions.
 * @returns {Promise<Array>}
 */
export async function fetchHumanDecisions() {
  try {
    const response = await fetch("/api/agent/actions");
    if (!response.ok) throw new Error("Failed to fetch decisions");
    const data = await response.json();
    return data.decisions || [];
  } catch (err) {
    console.warn("Using local fallback decisions:", err);
    return [];
  }
}

/**
 * Returns contextual quick query pills based on current operational context.
 * @param {string} phcId 
 * @returns {Array<string>}
 */
export function getSuggestedQueries(phcId = "PHC-07") {
  if (phcId === "PHC-07") {
    return [
      "Explain PHC-07 emergency & recommended IV fluid transfers",
      "Analyze the 3.2-day IV Fluids shortage window and delivery buffer",
      "What is the projected bed saturation at PHC-07 over 7 days?",
      "Rank priority actions required for District Central today"
    ];
  }

  return [
    "Rank top 5 critical supply chain risks across all districts",
    "Which facilities have bed occupancy projected above 90%?",
    "Explain patient demand surge trajectory for the next 14 days",
    "Identify facilities with potential medicine surplus for redistribution"
  ];
}

/**
 * Simple, safe Markdown parser for rendering agent responses.
 * @param {string} markdown 
 * @returns {string} HTML string
 */
export function formatAgentMarkdown(markdown) {
  if (!markdown) return "";

  let html = markdown
    // Escape angle brackets
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers
    .replace(/^### (.*$)/gim, '<h4 class="text-sm font-black text-slate-900 mt-3 mb-1 font-mono tracking-tight">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="text-base font-black text-slate-900 mt-4 mb-2 tracking-tight">$1</h3>')
    .replace(/^# (.*$)/gim, '<h2 class="text-lg font-black text-slate-900 mt-4 mb-2 tracking-tight">$1</h2>')
    // Bold & Italics
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>')
    // Unordered lists
    .replace(/^\s*-\s(.*$)/gim, '<li class="flex items-start gap-1.5 ml-2"><span class="text-indigo-600 font-bold">•</span><span>$1</span></li>')
    .replace(/^\s*\*\s(.*$)/gim, '<li class="flex items-start gap-1.5 ml-2"><span class="text-indigo-600 font-bold">•</span><span>$1</span></li>')
    // Ordered lists
    .replace(/^\s*(\d+)\.\s(.*$)/gim, '<li class="flex items-start gap-2 ml-2"><span class="font-mono font-bold text-indigo-700 text-xs">$1.</span><span>$2</span></li>')
    // Paragraph breaks
    .replace(/\n\n/g, '<div class="my-2"></div>');

  return `<div class="space-y-1 text-xs text-slate-700 leading-relaxed font-sans">${html}</div>`;
}
