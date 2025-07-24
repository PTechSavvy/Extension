const API_BASE_URL = "https://novelty-backend.onrender.com"; // Use your deployed backend
const DEFAULT_APPROVED_APPS = [
  "docs.google.com",
  "drive.google.com",
  "outlook.office.com",
  "teams.microsoft.com"
];
const DEFAULT_USER = "hackathon-user@example.com";

// On extension install, initialize approved apps
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ approvedApps: DEFAULT_APPROVED_APPS }, () => {
    console.log("Approved apps initialized in local storage.");
  });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    handleTabUpdate(tab.url, tabId);
  }
});

// Handle logic when a tab is updated
function handleTabUpdate(url, tabId) {
  const domain = new URL(url).hostname;

  chrome.storage.local.get("approvedApps", (data) => {
    const approvedApps = data.approvedApps || [];
    const isApproved = approvedApps.includes(domain);

    if (isApproved) {
      clearBadge(tabId);
    } else {
      flagUnapprovedSite(tabId, domain);
      logUnapprovedDomain(domain);
    }
  });
}

// Set red badge + popup for unapproved domains
function flagUnapprovedSite(tabId, domain) {
  chrome.action.setBadgeText({ tabId, text: "!" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
  chrome.action.setPopup({ tabId, popup: "popup.html" }); // ✅ Only set popup for unapproved
  chrome.storage.local.set({ lastUnapproved: domain });
}

// Clear badge + popup for approved domains
function clearBadge(tabId) {
  chrome.action.setBadgeText({ tabId, text: "" });
  chrome.action.setPopup({ tabId, popup: "" }); // ✅ Remove popup on approved pages
}

// Send log to server
function logUnapprovedDomain(domain) {
  fetch(`${API_BASE_URL}/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      domain: domain,
      userAgent: navigator.userAgent,
      user: DEFAULT_USER
    })
  }).catch(err => console.error("Failed to log to backend:", err));
}
