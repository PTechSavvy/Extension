const API_BASE_URL = "https://novelty-backend.onrender.com";
const DEFAULT_APPROVED_APPS = [
  "docs.google.com",
  "drive.google.com",
  "outlook.office.com",
  "teams.microsoft.com"
];
const DEFAULT_USER = "hackathon-user@example.com";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ approvedApps: DEFAULT_APPROVED_APPS }, () => {
    console.log("Approved apps initialized.");
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const domain = new URL(tab.url).hostname;
    chrome.storage.local.get("approvedApps", (data) => {
      const approved = data.approvedApps || [];
      const isApproved = approved.includes(domain);
      if (!isApproved) {
        chrome.action.setBadgeText({ tabId, text: "!" });
        chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
        chrome.storage.local.set({ lastUnapproved: domain });
        logUnapproved(domain);
      } else {
        chrome.action.setBadgeText({ tabId, text: "" });
      }
    });
  }
});

function logUnapproved(domain) {
  fetch(`${API_BASE_URL}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain,
      userAgent: navigator.userAgent,
      user: DEFAULT_USER
    })
  }).catch(err => console.error("Log error:", err));
}
