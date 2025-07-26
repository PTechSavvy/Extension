const API_BASE_URL = "https://novelty-backend.onrender.com";
const DEFAULT_USER = "hackathon-user@example.com";

// Load appData
importScripts("appData.js");

// Detect unapproved domains on tab update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    handleTabUpdate(tab.url, tabId);
  }
});

// Check if the domain is unapproved
function handleTabUpdate(url, tabId) {
  const domain = new URL(url).hostname.replace("www.", "");
  const match = appData.unapprovedApps.find(app => domain.includes(app.domain));

  if (match) {
    chrome.action.setPopup({ tabId, popup: "popup.html" });
    chrome.action.setBadgeText({ tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#FF0000" });
    chrome.storage.local.set({ lastUnapproved: domain });
    logUnapprovedDomain(domain);
  } else {
    chrome.action.setBadgeText({ tabId, text: "" });
    chrome.action.setPopup({ tabId, popup: "popup.html" });
  }
}

// Log to backend
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

// Handle VirusTotal scan request from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scanFile") {
    const blob = new Blob([message.buffer]);
    const formData = new FormData();
    formData.append("file", blob, message.name);

    fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: {
        "x-apikey": "98cce6e7426f335d3dc3abf374e6d183919a69777b1f8bfeec24795c6579bf88"
      },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data?.data?.id) {
          sendResponse({ scanId: data.data.id });
        } else {
          sendResponse({ error: "⚠️ Failed to get scan ID." });
        }
      })
      .catch(err => {
        console.error("Scan error:", err);
        sendResponse({ error: "❌ Error uploading file." });
      });

    return true;
  }
});
