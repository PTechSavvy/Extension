const API_BASE_URL = "https://novelty-backend.onrender.com"; // Replace with your actual server URL
const DEFAULT_USER = "hackathon-user@example.com";

// Load unapproved app data from appData.js
importScripts("appData.js");

// Default approved domains (can be expanded)
const DEFAULT_APPROVED_APPS = [
  "docs.google.com",
  "drive.google.com",
  "outlook.office.com",
  "teams.microsoft.com"
];

// On install, save approved domains
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ approvedApps: DEFAULT_APPROVED_APPS });
});

// When tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {
    handleTabUpdate(tab.url, tabId);
  }
});

// Check if current site is approved or unapproved
function handleTabUpdate(url, tabId) {
  const domain = new URL(url).hostname.replace("www.", "");

  chrome.storage.local.get("approvedApps", (data) => {
    const approvedApps = data.approvedApps || DEFAULT_APPROVED_APPS;
    const isApproved = approvedApps.some(approvedDomain =>
      domain.includes(approvedDomain)
    );

    if (!isApproved) {
      // Set popup and badge for unapproved app
      chrome.action.setPopup({ tabId, popup: "popup.html" });
      chrome.action.setBadgeText({ tabId, text: "!" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });

      chrome.storage.local.set({ lastUnapproved: domain });

      // Only log unapproved visits
      logUnapprovedDomain(domain);
    } else {
      // Still show popup for scanning, but no badge
      chrome.action.setBadgeText({ tabId, text: "" });
      chrome.action.setPopup({ tabId, popup: "popup.html" });

      chrome.storage.local.remove("lastUnapproved");
    }
  });
}

// Handle request from popup to check unapproved status
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkUnapproved") {
    const tabDomain = new URL(sender.tab.url).hostname.replace("www.", "");
    const match = appData.unapprovedApps.find(app =>
      tabDomain.includes(app.domain)
    );
    sendResponse({ isUnapproved: !!match, domain: match?.domain || null });
    return true;
  }
});

// Log unapproved domains to the backend
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
    .then(() => {
      console.log(`📡 Logged unapproved domain: ${domain}`);
    })
    .catch(err => {
      console.error("❌ Failed to log to backend:", err);
    });
}
