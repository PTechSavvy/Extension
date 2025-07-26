document.getElementById("fileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  const resultElem = document.getElementById("scanResult");

  if (!file) return;

  resultElem.textContent = "Uploading and scanning...";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: {
        "x-apikey": "98cce6e7426f335d3dc3abf374e6d183919a69777b1f8bfeec24795c6579bf88"
      },
      body: formData
    });

    const data = await response.json();
    if (data.data && data.data.id) {
      resultElem.innerHTML = `✅ File uploaded. <a href="https://www.virustotal.com/gui/file/${data.data.id}" target="_blank">View Results</a>`;
    } else {
      resultElem.textContent = "⚠️ Failed to get scan ID.";
    }
  } catch (err) {
    console.error("Scan error:", err);
    resultElem.textContent = "❌ Error uploading file.";
  }
});
