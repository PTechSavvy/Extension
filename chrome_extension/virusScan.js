const fileInput = document.getElementById("fileInput");
const resultElem = document.getElementById("scanResult");

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  resultElem.innerHTML = `
    <span style="color:#888">🕐 Uploading and scanning...</span>
    <div class="spinner" style="margin-top:8px; width:20px; height:20px; border:3px solid #ccc; border-top:3px solid #333; border-radius:50%; animation: spin 1s linear infinite;"></div>
  `;
  fileInput.disabled = true;

  const formData = new FormData();
  formData.append("file", file);

  try {
    // Step 1: Upload file
    const uploadRes = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: {
        "x-apikey": "98cce6e7426f335d3dc3abf374e6d183919a69777b1f8bfeec24795c6579bf88"
      },
      body: formData
    });

    const uploadData = await uploadRes.json();

    if (!uploadData.data?.id) {
      resultElem.innerHTML = `<span style="color:red;">⚠️ Failed to upload or get scan ID.</span>`;
      fileInput.disabled = false;
      return;
    }

    const analysisId = uploadData.data.id;

    // Step 2: Wait for scan result
    const pollRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      method: "GET",
      headers: {
        "x-apikey": "98cce6e7426f335d3dc3abf374e6d183919a69777b1f8bfeec24795c6579bf88"
      }
    });

    const pollData = await pollRes.json();
    const stats = pollData.data?.attributes?.stats;

    if (!stats) {
      resultElem.innerHTML = `<span style="color:red;">⚠️ Failed to retrieve analysis stats.</span>`;
      fileInput.disabled = false;
      return;
    }

    const { harmless, malicious, suspicious } = stats;

    if (malicious > 0 || suspicious > 0) {
      resultElem.innerHTML = `
        <div style="color: red; font-weight: bold;">❌ Dangerous File Detected</div>
        <div>🧪 Malicious: ${malicious}, ⚠️ Suspicious: ${suspicious}</div>
        <a href="https://www.virustotal.com/gui/file/${analysisId}" target="_blank">🔗 View Full Report</a>
      `;
    } else {
      resultElem.innerHTML = `
        <div style="color: green; font-weight: bold;">✅ File is Safe</div>
        <div>🛡 Harmless: ${harmless}</div>
        <a href="https://www.virustotal.com/gui/file/${analysisId}" target="_blank">🔗 View Full Report</a>
      `;
    }

  } catch (err) {
    console.error("VirusTotal error:", err);
    resultElem.innerHTML = `<span style="color:red;">❌ Error during scan.</span>`;
  } finally {
    fileInput.disabled = false;
  }
});
