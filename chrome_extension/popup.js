document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const domain = new URL(tabs[0].url).hostname.replace("www.", "");
    const entry = appData.unapprovedApps.find(app => domain.includes(app.domain));
    const info = document.getElementById("info");

    if (entry) {
      info.innerHTML = `
        <div><span class="icon">❌</span><strong>Unapproved App:</strong> ${entry.domain}</div>
        <div><span class="icon">✅</span><strong>Suggested Alternative:</strong> ${entry.suggestion}</div>
        <div><span class="icon">🧾</span><strong>Reasons:</strong>
          <ul>${entry.reasons.map(r => `<li>${r}</li>`).join("")}</ul>
        </div>
        <div><span class="icon">⚠️</span><strong>Risk Score:</strong> ${entry.riskScore}</div>
        <div><span class="icon">🛡</span><strong>Vulnerabilities:</strong>
          <ul>${entry.vulnerabilities.map(v => `<li>${v}</li>`).join("")}</ul>
        </div>
      `;

      // Notify background to show badge
      chrome.runtime.sendMessage({ action: "showWarningBadge" });
    } else {
      info.innerHTML = `
        <div><span class="icon">✅</span> This domain appears safe and approved.</div>
      `;

      // Notify background to clear badge
      chrome.runtime.sendMessage({ action: "clearBadge" });
    }
  });
});
