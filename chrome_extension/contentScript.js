chrome.runtime.sendMessage({ action: "checkUnapproved" }, (response) => {
  if (response && response.isUnapproved) {
    const banner = document.createElement("div");
    banner.style.position = "fixed";
    banner.style.top = 0;
    banner.style.left = 0;
    banner.style.right = 0;
    banner.style.backgroundColor = "#ff4d4d";
    banner.style.color = "white";
    banner.style.padding = "10px";
    banner.style.zIndex = 9999;
    banner.style.textAlign = "center";
    banner.innerText = `⚠️ You are visiting an unapproved application: ${response.domain}`;
    
    const closeBtn = document.createElement("span");
    closeBtn.innerText = " ✖";
    closeBtn.style.marginLeft = "15px";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => banner.remove();
    banner.appendChild(closeBtn);

    document.body.prepend(banner);
  }
});
