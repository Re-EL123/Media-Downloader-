document.getElementById("mediaForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const url = document.getElementById("mediaUrl").value.trim();
  const resultsDiv = document.getElementById("results");
  const linksDiv = document.getElementById("downloadLinks");
  linksDiv.innerHTML = "";
  resultsDiv.classList.add("hidden");

  if (!url) return alert("Please enter a URL.");

  const formData = new URLSearchParams();
  formData.append("url", url);

  try {
    const response = await fetch("https://all-media-downloader5.p.rapidapi.com/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-rapidapi-host": "all-media-downloader5.p.rapidapi.com",
        "x-rapidapi-key": "82ae10db11mshb41ccacdd991130p108a22jsnf3ae22b94bbd"
      },
      body: formData
    });

    const data = await response.json();

    if (!data || !data.medias || data.medias.length === 0) {
      linksDiv.innerHTML = "<p class='text-red-500'>No media found or unsupported URL.</p>";
    } else {
      data.medias.forEach(media => {
        const link = document.createElement("a");
        link.href = media.url;
        link.textContent = `${media.quality || "Unknown quality"} - ${media.extension}`;
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
