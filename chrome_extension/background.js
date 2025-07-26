const API_BASE_URL = "https://novelty-backend.onrender.com";
const DEFAULT_USER = "hackathon-user@example.com";

// Load appData (contains unapprovedApps list)
importScripts("appData.js");

// 🔁 Main message listener (unified)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  if (request.action === "checkUnapproved") {
    const tabDomain = new URL(sender.tab.url).hostname.replace("www.", "");
    const match = appData.unapprovedApps.find(app => tabDomain.includes(app.domain));
    sendResponse({ isUnapproved: !!match, domain: match?.domain || null });

    if (match?.domain) {
      chrome.storage.local.set({ lastUnapproved: match.domain });
    }

    return true;
  }

  if (request.action === "showWarningBadge") {
    if (tabId !== undefined) {
      chrome.action.setBadgeText({ tabId, text: "!" });
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.action.setBadgeText({ tabId: tabs[0].id, text: "!" });
          chrome.action.setBadgeBackgroundColor({ tabId: tabs[0].id, color: "#FF0000" });
        }
      });
    }
  }

  if (request.action === "clearBadge") {
    if (tabId !== undefined) {
      chrome.action.setBadgeText({ tabId, text: "" });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.action.setBadgeText({ tabId: tabs[0].id, text: "" });
        }
      });
    }
  }
});

// 🔍 Tab update listener
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    handleTabUpdate(tab.url, tabId);
  }
});

// 🔁 Tab switch listener
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab?.url) {
      const domain = new URL(tab.url).hostname.replace("www.", "");
      const isUnapproved = appData.unapprovedApps?.some(app =>
        domain.includes(app.domain)
      );
      if (!isUnapproved) {
        chrome.action.setBadgeText({ tabId, text: "" });
        chrome.action.setPopup({ tabId, popup: "" });
      }
    }
  });
});

// ✅ Main function to evaluate a tab
function handleTabUpdate(url, tabId) {
  const domain = new URL(url).hostname.replace("www.", "");

  const isUnapproved = appData.unapprovedApps?.some(app =>
    domain.includes(app.domain)
  );

  if (isUnapproved) {
    chrome.action.setPopup({ tabId, popup: "popup.html" });
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
    logUnapprovedDomain(domain);
  } else {
    chrome.action.setBadgeText({ tabId, text: "" });
    chrome.action.setPopup({ tabId, popup: "" });
  }
}

// 📡 Send log to backend
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
