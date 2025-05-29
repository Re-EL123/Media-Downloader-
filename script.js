document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
});

document.getElementById("mediaForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const url = document.getElementById("mediaUrl").value.trim();
  const resultsDiv = document.getElementById("results");
  const linksDiv = document.getElementById("downloadLinks");
  linksDiv.innerHTML = "";
  resultsDiv.classList.add("hidden");

  if (!url) {
    alert("Please enter a URL.");
    return;
  }

  const encodedBody = new URLSearchParams();
  encodedBody.append("url", url);

  try {
    const response = await fetch("https://all-media-downloader5.p.rapidapi.com/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-rapidapi-key": "82ae10db11mshb41ccacdd991130p108a22jsnf3ae22b94bbd",
        "x-rapidapi-host": "all-media-downloader5.p.rapidapi.com",
      },
      body: encodedBody.toString(),
    });

    const data = await response.json();
    console.log("API Response:", data);

    if (!data || !data.medias || data.medias.length === 0) {
      linksDiv.innerHTML = "<p class='text-red-500'>No media found or unsupported URL.</p>";
    } else {
      addToHistory(url);
      data.medias.forEach((media) => {
        const link = document.createElement("a");
        link.href = media.url;
        link.textContent = `${media.quality || "Unknown"} - ${media.extension}`;
        link.target = "_blank";
        link.className = "block text-blue-600 hover:underline";
        linksDiv.appendChild(link);
      });
    }

    resultsDiv.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error);
    linksDiv.innerHTML = "<p class='text-red-500'>An error occurred while fetching media.</p>";
    resultsDiv.classList.remove("hidden");
  }
});

function addToHistory(url) {
  let history = JSON.parse(localStorage.getItem("downloadHistory")) || [];
  if (!history.includes(url)) {
    history.unshift(url); // Add to top
    localStorage.setItem("downloadHistory", JSON.stringify(history));
    loadHistory();
  }
}

function loadHistory() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("downloadHistory")) || [];

  if (history.length === 0) {
    historyList.innerHTML = "<li class='text-gray-500'>No download history yet.</li>";
    return;
  }

  history.forEach((url) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = url;
    btn.className = "text-blue-500 hover:underline truncate w-full text-left";
    btn.onclick = () => {
      document.getElementById("mediaUrl").value = url;
      document.getElementById("mediaForm").dispatchEvent(new Event("submit"));
    };
    li.appendChild(btn);
    historyList.appendChild(li);
  });
      }
    
