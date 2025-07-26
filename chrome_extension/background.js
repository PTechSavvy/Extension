const API_BASE_URL = "https://novelty-backend.onrender.com";
const DEFAULT_USER = "hackathon-user@example.com";

// Load unapproved app data from appData.js
importScripts("appData.js");

// Set default approved apps (can be dynamic in future)
const DEFAULT_APPROVED_APPS = [
  "docs.google.com",
  "drive.google.com",
  "outlook.office.com",
  "teams.microsoft.com"
];

// On extension installed – store default approved apps
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ approvedApps: DEFAULT_APPROVED_APPS });
});

// Detect tab updates and check for unapproved domains
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {
    handleTabUpdate(tab.url, tabId);
  }
});

// Main logic to check if site is approved or not
function handleTabUpdate(url, tabId) {
  const domain = new URL(url).hostname.replace("www.", "");

  chrome.storage.local.get("approvedApps", (data) => {
    const approvedApps = data.approvedApps || DEFAULT_APPROVED_APPS;
    const isApproved = approvedApps.some(approvedDomain => domain.includes(approvedDomain));

    if (!isApproved) {
      // Flag as unapproved
      chrome.action.setPopup({ tabId, popup: "popup.html" });
      chrome.action.setBadgeText({ tabId, text: "!" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });

      chrome.storage.local.set({ lastUnapproved: domain });

      // ✅ Log only unapproved domains
      logUnapprovedDomain(domain);
    } else {
      // Clear badge if site is approved
      chrome.action.setBadgeText({ tabId, text: "" });
      chrome.action.setPopup({ tabId, popup: "popup.html" }); // Still show popup for scanning
      chrome.storage.local.remove("lastUnapproved");
    }
  });
}

// Receive messages from popup.js or other scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkUnapproved") {
    const tabDomain = new URL(sender.tab.url).hostname.replace("www.", "");
    const match = appData.unapprovedApps.find(app => tabDomain.includes(app.domain));
    sendResponse({ isUnapproved: !!match, domain: match?.domain || null });
    return true;
  }
});

// POST to backend to log unapproved visit
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
