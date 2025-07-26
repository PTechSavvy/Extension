document.getElementById("fileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  const resultElem = document.getElementById("scanResult");

  if (!file) return;

  resultElem.innerHTML = "⏳ <em>Uploading and scanning file...</em>";

  const formData = new FormData();
  formData.append("file", file);

  try {
    // Upload file to VirusTotal
    const uploadResponse = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: {
        "x-apikey": "98cce6e7426f335d3dc3abf374e6d183919a69777b1f8bfeec24795c6579bf88"
      },
      body: formData
    });

    const uploadData = await uploadResponse.json();
    if (!uploadData.data || !uploadData.data.id) {
      resultElem.innerHTML = "⚠️ <span style='color: red;'>Failed to get scan ID.</span>";
      return;
    }

    const analysisId = uploadData.data.id;

    // Poll scan result
    resultElem.innerHTML = "🔍 <em>Scanning file, please wait...</em>";
    let analysisComplete = false;
    let finalResult;

    for (let i = 0; i < 10; i++) {
      const statusRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
        headers: {
          "x-apikey": "98cce6e7426f335d3dc3abf374e6d183919a69777b1f8bfeec24795c6579bf88"
        }
      });

      const statusData = await statusRes.json();
      if (statusData.data.attributes.status === "completed") {
        analysisComplete = true;
        finalResult = statusData;
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s before retry
    }

    if (!analysisComplete) {
      resultElem.innerHTML = "⏳ Scan still processing. <a href='https://www.virustotal.com/gui/file/" + analysisId + "' target='_blank'>Check later</a>";
      return;
    }

    const malicious = finalResult.data.attributes.stats.malicious;

    if (malicious > 0) {
      resultElem.innerHTML = `
        ❌ <strong style="color: red;">File flagged as potentially harmful!</strong><br/>
        🚨 Detections: ${malicious}<br/>
        <a href="https://www.virustotal.com/gui/file/${analysisId}" target="_blank">View full scan</a>
      `;
    } else {
      resultElem.innerHTML = `
        ✅ <strong style="color: green;">No threats found. File is safe.</strong><br/>
        <a href="https://www.virustotal.com/gui/file/${analysisId}" target="_blank">View full scan</a>
      `;
    }

  } catch (err) {
    console.error("Scan error:", err);
    resultElem.innerHTML = "❌ <span style='color: red;'>Error uploading or scanning file.</span>";
  }
});
