document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
});

document.getElementById("mediaForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const url = document.getElementById("mediaUrl").value.trim();
  if (!url) return;

  // Clear previous
  document.getElementById("results").classList.add("hidden");

  try {
    // Build fetch URL
    const apiUrl = new URL(
      "https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/get-info-rapidapi"
    );
    apiUrl.searchParams.set("url", url);

    const resp = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": "82ae10db11mshb41ccacdd991130p108a22jsnf3ae22b94bbd",
        "x-rapidapi-host": "instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com",
      },
    });

    const data = await resp.json();
    console.log("API response:", data);

    if (data.error) {
      throw new Error("API returned error");
    }

    // Populate UI
    document.getElementById("thumb").src = data.thumb || "";
    document.getElementById("caption").textContent = data.caption || "";
    document.getElementById("duration").textContent = data.duration
      ? `Duration: ${Math.round(data.duration)}s`
      : "";
    const dlBtn = document.getElementById("downloadBtn");
    dlBtn.href = data.download_url;
    dlBtn.download = ""; // use the URL filename by default

    document.getElementById("results").classList.remove("hidden");
    addToHistory(url);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch media. Please check the URL and try again.");
  }
});

function addToHistory(url) {
  const key = "downloadHistory";
  let history = JSON.parse(localStorage.getItem(key)) || [];
  // Avoid duplicates
  if (!history.includes(url)) {
    history.unshift(url);
    if (history.length > 50) history.pop(); // cap to 50
    localStorage.setItem(key, JSON.stringify(history));
  }
  loadHistory();
}

function loadHistory() {
  const key = "downloadHistory";
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  const history = JSON.parse(localStorage.getItem(key)) || [];
  if (!history.length) {
    list.innerHTML = "<li class='text-gray-500'>No download history yet.</li>";
    return;
  }

  history.forEach((u) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = u;
    btn.className = "text-blue-500 hover:underline text-left truncate w-full";
    btn.onclick = () => {
      document.getElementById("mediaUrl").value = u;
      document.getElementById("mediaForm").dispatchEvent(new Event("submit"));
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}
