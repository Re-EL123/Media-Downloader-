const apiEndpoint = 'api.php';  // our PHP proxy

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const loading = $('#loading');
const results = $('#results');
const preview = $('#preview');
const captionEl = $('#caption');
const durationEl = $('#duration');
const downloadOptions = $('#downloadOptions');
const historyList = $('#historyList');
const mediaUrlInput = $('#mediaUrl');

document.addEventListener('DOMContentLoaded', loadHistory);
$('#fetchBtn').addEventListener('click', fetchMedia);

function setLoading(on) {
  loading.classList.toggle('hidden', !on);
}

async function fetchMedia() {
  const url = mediaUrlInput.value.trim();
  if (!url) return alert('Please paste a URL.');

  // clear old
  results.classList.add('hidden');
  preview.innerHTML = '';
  downloadOptions.innerHTML = '';
  captionEl.textContent = '';
  durationEl.textContent = '';

  setLoading(true);

  try {
    const resp = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ url }),
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.message || 'Unknown API error');

    // Show thumbnail or video
    if (data.thumb) {
      preview.innerHTML = `<img src="${data.thumb}" alt="thumb" class="w-full"/>`;
    } else if (data.download_url) {
      preview.innerHTML = `<video controls src="${data.download_url}" class="w-full"></video>`;
    }

    // Meta
    captionEl.textContent = data.caption || '';
    if (data.duration) durationEl.textContent = `Duration: ${Math.round(data.duration)}s`;

    // Download buttons
    // Some endpoints return 'qualities', 'formats' or a single download_url.
    let opts = [];
    if (data.qualities) {
      opts = Object.entries(data.qualities).map(([q, link]) => ({ label: q, url: link }));
    } else if (Array.isArray(data.urls)) {
      opts = data.urls.map(u => ({ label: 'Download', url: u }));
    } else if (data.download_url) {
      opts = [{ label: 'Download (default)', url: data.download_url }];
    }

    opts.forEach(o => {
      const btn = document.createElement('a');
      btn.href = o.url;
      btn.target = '_blank';
      btn.download = '';
      btn.textContent = o.label;
      btn.className = 'block text-center py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition animate-pulse';
      downloadOptions.appendChild(btn);
    });

    results.classList.remove('hidden');
    addToHistory(url);
  }
  catch (err) {
    console.error(err);
    alert('Error fetching media: ' + err.message);
  }
  finally {
    setLoading(false);
  }
}

function addToHistory(url) {
  let hist = JSON.parse(localStorage.getItem('downloadHistory')||'[]');
  if (!hist.includes(url)) {
    hist.unshift(url);
    if (hist.length>50) hist.pop();
    localStorage.setItem('downloadHistory', JSON.stringify(hist));
    renderHistory();
  }
}

function loadHistory() {
  renderHistory();
}

function renderHistory() {
  const hist = JSON.parse(localStorage.getItem('downloadHistory')||'[]');
  historyList.innerHTML = hist.length
    ? hist.map(u => `<li><button class="hover:underline truncate w-full text-left" onclick="reuse('${u}')">${u}</button></li>`).join('')
    : '<li class="text-gray-400">No history yet.</li>';
}

function reuse(u) {
  mediaUrlInput.value = u;
  fetchMedia();
}
