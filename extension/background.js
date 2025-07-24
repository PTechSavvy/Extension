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
    handleTabUpdate(tab.url, tabId);
  }
});

function handleTabUpdate(url, tabId) {
  const domain = new URL(url).hostname;

  chrome.storage.local.get("approvedApps", (data) => {
    const approvedApps = data.approvedApps || [];
    const isApproved = approvedApps.includes(domain);

    if (!isApproved) {
      chrome.action.setPopup({ tabId, popup: "popup.html" });
      chrome.storage.local.set({ lastUnapproved: domain });
      chrome.action.setBadgeText({ tabId, text: "!" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });

      fetch(\`\${API_BASE_URL}/log\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          userAgent: navigator.userAgent,
          user: DEFAULT_USER
        })
      }).catch(console.error);
    }
  });
}
