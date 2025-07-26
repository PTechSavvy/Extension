document.getElementById("fileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  const resultElem = document.getElementById("scanResult");

  if (!file) {
    resultElem.textContent = "⚠️ No file selected.";
    return;
  }

  resultElem.textContent = "⏳ Uploading and scanning...";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const uploadResponse = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: {
        "x-apikey": "98cce6e7426f335d3dc3abf374e6d183919a69777b1f8bfeec24795c6579bf88"
      },
      body: formData
    });

    const uploadData = await uploadResponse.json();

    if (!uploadData.data || !uploadData.data.id) {
      resultElem.textContent = "⚠️ File upload failed.";
      return;
    }

    const analysisId = uploadData.data.id;

    resultElem.innerHTML = "⏳ Waiting for scan results...";

    // Wait a few seconds before fetching results
    await new Promise(res => setTimeout(res, 4000));

    const resultResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      headers: {
        "x-apikey": "98cce6e7426f335d3dc3abf374e6d183919a69777b1f8bfeec24795c6579bf88"
      }
    });

    const resultData = await resultResponse.json();

    if (resultData.data && resultData.data.attributes && resultData.data.attributes.stats) {
      const { malicious, suspicious, harmless } = resultData.data.attributes.stats;
      if (malicious > 0 || suspicious > 0) {
        resultElem.innerHTML = `❌ <strong>Dangerous file!</strong><br/>Malicious: ${malicious}, Suspicious: ${suspicious}`;
      } else {
        resultElem.innerHTML = `✅ <strong>Safe file</strong><br/>Harmless: ${harmless}`;
      }
    } else {
      resultElem.textContent = "⚠️ Could not read scan results.";
    }

  } catch (err) {
    console.error("Scan error:", err);
    resultElem.textContent = "❌ Error uploading or scanning file.";
  }
});
