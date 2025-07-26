const API_BASE_URL = "https://novelty-backend.onrender.com";
const DEFAULT_USER = "hackathon-user@example.com";

importScripts("appData.js");

chrome.runtime.onInstalled.addListener(() => {
  const approvedDomains = appData.approvedApps.map(app => app.domain);
  chrome.storage.local.set({ approvedApps: approvedDomains });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.startsWith("http")) {
    handleTabUpdate(tab.url, tabId);
  }
});

function handleTabUpdate(url, tabId) {
  const hostname = new URL(url).hostname.replace("www.", "");

  const unapprovedMatch = appData.unapprovedApps.find(app =>
    hostname === app.domain || hostname.endsWith("." + app.domain)
  );

  if (unapprovedMatch) {
    // ✅ Unapproved site — show badge, popup, and log
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
    chrome.action.setPopup({ tabId, popup: "popup.html" });

    chrome.storage.local.set({ lastUnapproved: unapprovedMatch.domain });

    logUnapprovedDomain(unapprovedMatch.domain);
  } else {
    // ✅ Approved or neutral site — clear badge and mark
    chrome.action.setBadgeText({ tabId, text: "" });
    chrome.action.setPopup({ tabId, popup: "popup.html" }); // still allow file scanning
    chrome.storage.local.remove("lastUnapproved");
  }
}

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkUnapproved") {
    const tabDomain = new URL(sender.tab.url).hostname.replace("www.", "");
    const match = appData.unapprovedApps.find(app => tabDomain.includes(app.domain));
    sendResponse({ isUnapproved: !!match, domain: match?.domain || null });
    return true;
  }
});
