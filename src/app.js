/**
 * SwasthyaGrid AI — Application Orchestrator
 */

import { Router } from "./ui/router.js";

// Initialize Router
const router = new Router("app-root");
router.init();

// Live Clock Interval
setInterval(() => {
  const clockEl = document.getElementById("topbar-clock");
  if (clockEl) {
    clockEl.innerText = new Date().toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    });
  }
}, 1000);

console.log("SwasthyaGrid AI initialized. Mesh status: ACTIVE. Target: 12 PHCs.");
