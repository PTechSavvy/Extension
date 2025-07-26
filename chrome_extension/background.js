const API_BASE_URL = "https://novelty-backend.onrender.com";
const DEFAULT_USER = "hackathon-user@example.com";

// Load unapproved app data
importScripts("appData.js");

// Default approved domains
const DEFAULT_APPROVED_APPS = [
  "docs.google.com",
  "drive.google.com",
  "outlook.office.com",
  "teams.microsoft.com"
];

// On install, store default approved list
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ approvedApps: DEFAULT_APPROVED_APPS });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.startsWith("http")) {
    checkDomain(tab.url, tabId);
  }
});

// Core function
function checkDomain(url, tabId) {
  const domain = new URL(url).hostname.replace("www.", "");

  chrome.storage.local.get("approvedApps", (data) => {
    const approvedApps = data.approvedApps || DEFAULT_APPROVED_APPS;
    const isApproved = approvedApps.some(d => domain.includes(d));

    if (!isApproved) {
      chrome.action.setBadgeText({ tabId, text: "!" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
      chrome.action.setPopup({ tabId, popup: "popup.html" });

      chrome.storage.local.set({ lastUnapproved: domain });

      // ✅ Only log unapproved domains
      logUnapproved(domain);
    } else {
      chrome.action.setBadgeText({ tabId, text: "" });
      chrome.action.setPopup({ tabId, popup: "popup.html" });
      chrome.storage.local.remove("lastUnapproved");
    }
  });
}

// Message listener (used by popup.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkUnapproved") {
    const tabDomain = new URL(sender.tab.url).hostname.replace("www.", "");
    const match = appData.unapprovedApps.find(app => tabDomain.includes(app.domain));
    sendResponse({ isUnapproved: !!match, domain: match?.domain || null });
    return true;
  }
});

// Send POST to server only for unapproved visits
function logUnapproved(domain) {
  fetch(`${API_BASE_URL}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain,
      userAgent: navigator.userAgent,
      user: DEFAULT_USER
    })
  })
    .then(() => console.log(`✅ Logged unapproved: ${domain}`))
    .catch(err => console.error("❌ Failed to log:", err));
}
