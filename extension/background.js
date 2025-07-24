
// background.js

const DEFAULT_APPROVED_APPS = [
  "docs.google.com",
  "drive.google.com",
  "outlook.office.com",
  "teams.microsoft.com"
];

const DEFAULT_USER = "hackathon-user@example.com";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ approvedApps: DEFAULT_APPROVED_APPS }, () => {
    console.log("Approved apps initialized in local storage.");
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    handleTabUpdate(tab.url, tabId);
  }
});

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

function flagUnapprovedSite(tabId, domain) {
  chrome.action.setBadgeText({ tabId, text: "!" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
  chrome.action.setPopup({ tabId, popup: "popup.html" });
  chrome.storage.local.set({ lastUnapproved: domain });
}

function clearBadge(tabId) {
  chrome.action.setBadgeText({ tabId, text: "" });
}

function logUnapprovedDomain(domain) {
  fetch("http://localhost:4000/log", {
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
