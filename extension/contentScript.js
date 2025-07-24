chrome.storage.local.get("lastUnapproved", (data) => {
  const lastUnapproved = data.lastUnapproved;
  if (!lastUnapproved) return;

  const currentDomain = window.location.hostname;
  if (currentDomain === lastUnapproved && !document.getElementById("unapproved-banner")) {
    const banner = document.createElement("div");
    banner.id = "unapproved-banner";
    banner.innerHTML = `
      🚫 <strong>Unapproved App:</strong> ${currentDomain}. Please use an approved alternative.
      <button id="dismiss-banner" style="margin-left: 20px; background-color: white; color: red; border: none; font-weight: bold; cursor: pointer;">X</button>
    `;
    
    // Styling
    banner.style.position = "fixed";
    banner.style.top = "0";
    banner.style.left = "0";
    banner.style.width = "100%";
    banner.style.backgroundColor = "#FF4C4C";
    banner.style.color = "white";
    banner.style.fontSize = "14px";
    banner.style.fontWeight = "bold";
    banner.style.textAlign = "center";
    banner.style.zIndex = "9999";
    banner.style.padding = "12px";
    banner.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

    document.body.prepend(banner);

    // Close/dismiss button
    document.getElementById("dismiss-banner").onclick = () => {
      banner.remove();
    };
  }
});
