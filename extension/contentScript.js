chrome.storage.local.get("lastUnapproved", (data) => {
  const lastUnapproved = data.lastUnapproved;
  if (!lastUnapproved) return;

  const currentDomain = window.location.hostname;
  if (currentDomain === lastUnapproved) {
    const banner = document.createElement("div");
    banner.textContent = \`🚫 Unapproved App Detected: \${currentDomain}. Please use an approved alternative.\`;
    banner.style = "position:fixed;top:0;left:0;width:100%;background-color:#FF0000;color:white;font-size:16px;font-weight:bold;text-align:center;z-index:9999;padding:10px;";
    document.body.prepend(banner);
  }
});
