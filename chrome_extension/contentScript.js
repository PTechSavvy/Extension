chrome.storage.local.get("lastUnapproved", (data) => {
  const domain = window.location.hostname.replace("www.", "");
  if (data.lastUnapproved === domain) {
    const banner = document.createElement("div");
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff4d4d;
      color: white;
      padding: 10px;
      font-size: 14px;
      z-index: 9999;
      text-align: center;
    `;
    banner.textContent = "⚠️ This is an unapproved application.";
    const close = document.createElement("button");
    close.textContent = "✖";
    close.style.cssText = "margin-left: 10px; background: none; color: white; border: none; font-size: 14px;";
    close.onclick = () => banner.remove();
    banner.appendChild(close);
    document.body.appendChild(banner);
  }
});
