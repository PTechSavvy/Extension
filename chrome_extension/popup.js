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
    } else {
      info.innerHTML = "<p>✅ This domain appears safe and approved.</p>";
    }
  });
});

// File scan logic
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const resultElem = document.getElementById("scanResult");

  if (!file) return;

  resultElem.textContent = "Uploading and scanning...";

  const reader = new FileReader();
  reader.onload = function () {
    const arrayBuffer = reader.result;
    chrome.runtime.sendMessage(
      { action: "scanFile", name: file.name, buffer: arrayBuffer },
      (response) => {
        if (response.error) {
          resultElem.textContent = "❌ " + response.error;
        } else {
          resultElem.innerHTML = `✅ File uploaded. <a href="https://www.virustotal.com/gui/file/${response.scanId}" target="_blank">View Results</a>`;
        }
      }
    );
  };

  reader.readAsArrayBuffer(file);
});
