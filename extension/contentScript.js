chrome.storage.local.get("lastUnapproved", (data) => {
  const domain = data.lastUnapproved;
  if (window.location.hostname === domain) {
    const banner = document.createElement("div");
    banner.textContent = `🚫 Unapproved App Detected: ${domain}`;
    Object.assign(banner.style, {
      position: "fixed", top: "0", left: "0", width: "100%",
      backgroundColor: "#ff0000", color: "white", textAlign: "center",
      fontSize: "14px", zIndex: "9999", padding: "8px"
    });
    document.body.prepend(banner);
  }
});
