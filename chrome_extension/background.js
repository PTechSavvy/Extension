const API_BASE_URL = "https://novelty-backend.onrender.com";
const DEFAULT_USER = "hackathon-user@example.com";

// Load unapproved app data from appData.js
importScripts("appData.js");

chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Extension installed.");
});

// On tab update, check domain
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {
    const domain = new URL(tab.url).hostname.replace(/^www\./, "");

    const match = appData.unapprovedApps.find(app => domain.includes(app.domain));
    
    if (match) {
      // 🚩 Unapproved app: show badge + set popup
      chrome.action.setBadgeText({ tabId, text: "!" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
      chrome.action.setPopup({ tabId, popup: "popup.html" });
      chrome.storage.local.set({ lastUnapproved: domain });

      // Log to backend
      logUnapprovedVisit(domain);
    } else {
      // ✅ Approved or irrelevant site
      chrome.action.setBadgeText({ tabId, text: "" });
      chrome.action.setPopup({ tabId, popup: "popup.html" });
      chrome.storage.local.remove("lastUnapproved");
    }
  }
});

// Logging function
function logUnapprovedVisit(domain) {
  fetch(`${API_BASE_URL}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain,
      userAgent: navigator.userAgent,
      user: DEFAULT_USER,
    }),
  })
    .then(() => console.log(`📡 Logged unapproved domain: ${domain}`))
    .catch((err) => console.error("❌ Failed to log domain:", err));
}
