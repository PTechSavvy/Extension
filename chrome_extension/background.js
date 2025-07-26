const API_BASE_URL = "https://novelty-backend.onrender.com";

const DEFAULT_USER = "hackathon-user@example.com";

// Load appData from file
importScripts("appData.js");

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  // Check if current site is unapproved
  if (request.action === "checkUnapproved") {
    const tabDomain = new URL(sender.tab.url).hostname.replace("www.", "");
    const match = appData.unapprovedApps.find(app => tabDomain.includes(app.domain));
    sendResponse({ isUnapproved: !!match, domain: match?.domain || null });

    // Store for later use
    if (match?.domain) {
      chrome.storage.local.set({ lastUnapproved: match.domain });
    }
    return true;
  }

  // Show badge on extension icon
  if (request.action === "showWarningBadge" && tabId !== undefined) {
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
  }

  // Clear badge
  if (request.action === "clearBadge" && tabId !== undefined) {
    chrome.action.setBadgeText({ tabId, text: "" });
  }
});

// Monitor tab updates to check domain and update icon accordingly
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    handleTabUpdate(tab.url, tabId);
  }
});

// Also clear badge when switching tabs if approved
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab?.url) {
      const domain = new URL(tab.url).hostname;
      const isApproved = appData.approvedApps?.some(d => domain.includes(d));
      if (isApproved) {
        chrome.action.setBadgeText({ tabId, text: "" });
        chrome.action.setPopup({ tabId, popup: "" });
      }
    }
  });
});

// Check approval and update popup/badge
function handleTabUpdate(url, tabId) {
  const domain = new URL(url).hostname;

  const isApproved = appData.approvedApps?.some(approvedDomain => domain.includes(approvedDomain));

  if (!isApproved) {
    // Set popup for unapproved domains
    chrome.action.setPopup({ tabId, popup: "popup.html" });

    // Show red badge icon
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });

    // Log to backend
    logUnapprovedDomain(domain);
  } else {
    // Clear badge and popup for approved domains
    chrome.action.setBadgeText({ tabId, text: "" });
    chrome.action.setPopup({ tabId, popup: "" });
  }
}

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
  }).then(() => {
    console.log(`📡 Logged unapproved domain: ${domain}`);
  }).catch(err => {
    console.error("❌ Failed to log to backend:", err);
  });
}
