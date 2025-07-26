const API_BASE_URL = "https://novelty-backend.onrender.com";
const DEFAULT_USER = "hackathon-user@example.com";

importScripts("appData.js");

const DEFAULT_APPROVED_APPS = [
  "docs.google.com",
  "drive.google.com",
  "outlook.office.com",
  "teams.microsoft.com"
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ approvedApps: DEFAULT_APPROVED_APPS });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {
    handleTabUpdate(tab.url, tabId);
  }
});

function handleTabUpdate(url, tabId) {
  const domain = new URL(url).hostname.replace("www.", "");

  chrome.storage.local.get("approvedApps", (data) => {
    const approvedApps = data.approvedApps || DEFAULT_APPROVED_APPS;
    const isApproved = approvedApps.some(approvedDomain => domain.includes(approvedDomain));

    if (!isApproved) {
      // Unapproved site – trigger popup, badge, and logging
      chrome.action.setPopup({ tabId, popup: "popup.html" });
      chrome.action.setBadgeText({ tabId, text: "!" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });

      chrome.storage.local.set({ lastUnapproved: domain });

      logUnapprovedDomain(domain);
    } else {
      // Approved site – remove badge and unapproved markers
      chrome.action.setBadgeText({ tabId, text: "" });
      chrome.action.setPopup({ tabId, popup: "popup.html" }); // Still enable scanning popup
      chrome.storage.local.remove("lastUnapproved");
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkUnapproved") {
    const tabDomain = new URL(sender.tab.url).hostname.replace("www.", "");
    const match = appData.unapprovedApps.find(app => tabDomain.includes(app.domain));
    sendResponse({ isUnapproved: !!match, domain: match?.domain || null });
    return true;
  }
});

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
