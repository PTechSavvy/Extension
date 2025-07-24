
// contentScript.js

chrome.storage.local.get("lastUnapproved", (data) => {
  const lastUnapproved = data.lastUnapproved;
  if (!lastUnapproved) return;

  const currentDomain = window.location.hostname;
  if (currentDomain === lastUnapproved) {
    const banner = document.createElement("div");
    banner.textContent = `🚫 Unapproved App Detected: ${currentDomain}. Please use an approved alternative.`;
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.backgroundColor = "#FF0000";
    banner.style.color = "white";
    banner.style.fontSize = "16px";
    banner.style.fontWeight = "bold";
    banner.style.textAlign = "center";
    banner.style.zIndex = "9999";
    banner.style.padding = "10px";
    document.body.prepend(banner);
  }
});
