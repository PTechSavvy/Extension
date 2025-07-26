const API_BASE_URL = "https://novelty-backend.onrender.com";
const DEFAULT_USER = "hackathon-user@example.com";

importScripts("appData.js");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkUnapproved") {
    const tabDomain = new URL(sender.tab.url).hostname.replace("www.", "");
    const match = appData.unapprovedApps.find(app => tabDomain.includes(app.domain));
    sendResponse({ isUnapproved: !!match, domain: match?.domain || null });
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.startsWith("http")) {
    const domain = new URL(tab.url).hostname.replace("www.", "");
    const match = appData.unapprovedApps.find(app => domain.includes(app.domain));

    if (match) {
      chrome.action.setBadgeText({ tabId, text: "!" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
      chrome.action.setPopup({ tabId, popup: "popup.html" });
      chrome.storage.local.set({ lastUnapproved: domain });
      logUnapprovedDomain(domain);
    } else {
      chrome.action.setBadgeText({ tabId, text: "" });
      chrome.action.setPopup({ tabId, popup: "popup.html" });
    }
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
  }).then(() => {
    console.log(`📡 Logged unapproved domain: ${domain}`);
  }).catch(err => {
    console.error("❌ Failed to log to backend:", err);
  });
}
