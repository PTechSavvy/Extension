const API_BASE_URL = "https://novelty-backend.onrender.com";
const DEFAULT_USER = "hackathon-user@example.com";

// Load unapproved app data from appData.js
importScripts("appData.js");

// Default approved apps (can be overridden via admin panel)
const DEFAULT_APPROVED_APPS = [
  "docs.google.com",
  "drive.google.com",
  "outlook.office.com",
  "teams.microsoft.com"
];

// When extension is installed, set default approved apps
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ approvedApps: DEFAULT_APPROVED_APPS });
});

// Handle tab updates to detect unapproved domains
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.startsWith("http")) {
    handleTabUpdate(tab.url, tabId);
  }
});

// Core logic: determine if domain is approved
function handleTabUpdate(url, tabId) {
  const domain = new URL(url).hostname.replace("www.", "");

  chrome.storage.local.get("approvedApps", (data) => {
    const approvedApps = data.approvedApps || DEFAULT_APPROVED_APPS;
    const isApproved = approvedApps.some(approved => domain.includes(approved));

    if (!isApproved) {
      // Show badge and store unapproved domain
      chrome.action.setPopup({ tabId, popup: "popup.html" });
      chrome.action.setBadgeText({ tabId, text: "!" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });

      chrome.storage.local.set({ lastUnapproved: domain });

      // Log only unapproved domains
      logUnapprovedDomain(domain);
    } else {
      // Clear badge and ensure popup still works for scanning
      chrome.action.setBadgeText({ tabId, text: "" });
      chrome.action.setPopup({ tabId, popup: "popup.html" });
      chrome.storage.local.remove("lastUnapproved");
    }
  });
}

// Receive request from popup.js for domain status
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkUnapproved") {
    const tabDomain = new URL(sender.tab.url).hostname.replace("www.", "");
    const match = appData.unapprovedApps.find(app => tabDomain.includes(app.domain));
    sendResponse({ isUnapproved: !!match, domain: match?.domain || null });
    return true;
  }
});

// Log visit of unapproved site to backend
function logUnapprovedDomain(domain) {
  fetch(`${API_BASE_URL}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain,
      userAgent: navigator.userAgent,
      user: DEFAULT_USER
    })
  })
    .then(() => console.log(`📡 Logged unapproved domain: ${domain}`))
    .catch(err => console.error("❌ Failed to log to backend:", err));
}
