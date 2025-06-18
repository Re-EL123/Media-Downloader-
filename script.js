// script.js
const apiEndpoint = 'api.php';  // PHP proxy

const loading = document.getElementById('loading');
const results = document.getElementById('results');
const preview = document.getElementById('preview');
const captionEl = document.getElementById('caption');
const durationEl = document.getElementById('duration');
const downloadOptions = document.getElementById('downloadOptions');
const historyList = document.getElementById('historyList');
const mediaUrlInput = document.getElementById('mediaUrl');
const fetchBtn = document.getElementById('fetchBtn');

document.addEventListener('DOMContentLoaded', loadHistory);
fetchBtn.addEventListener('click', fetchMedia);

function setLoading(on) {
  loading.classList.toggle('hidden', !on);
}

async function fetchMedia() {
  const url = mediaUrlInput.value.trim();
  if (!url) return alert('Please paste a URL.');

  // Clear old
  results.classList.add('hidden');
  preview.innerHTML = '';
  downloadOptions.innerHTML = '';
  captionEl.textContent = '';
  durationEl.textContent = '';

  setLoading(true);

  try {
    const resp = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error('Invalid JSON:', err, text);
      return alert('Server returned invalid JSON. See console.');
    }

    if (data.error) {
      return alert('Error: ' + (data.message || 'Unknown'));
    }

    // Preview
    if (data.thumb) {
      preview.innerHTML = `<img src="${data.thumb}" class="w-full"/>`;
    } else if (data.download_url) {
      preview.innerHTML = `<video controls src="${data.download_url}" class="w-full"></video>`;
    }

    // Meta
    captionEl.textContent = data.caption || '';
    if (data.duration) {
      durationEl.textContent = `Duration: ${Math.round(data.duration)}s`;
    }

    // Download options
    let opts = [];
    if (data.qualities) {
      opts = Object.entries(data.qualities).map(([q, link]) => ({ label: q, url: link }));
    } else if (data.download_url) {
      opts = [{ label: 'Download', url: data.download_url }];
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
    console.error('Fetch error:', err);
    alert('Network or server error. See console.');
  }
  finally {
    setLoading(false);
  }
}

function addToHistory(url) {
  let hist = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
  if (!hist.includes(url)) {
    hist.unshift(url);
    if (hist.length > 50) hist.pop();
    localStorage.setItem('downloadHistory', JSON.stringify(hist));
  }
  renderHistory();
}

function loadHistory() {
  renderHistory();
}

function renderHistory() {
  const hist = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
  if (!hist.length) {
    historyList.innerHTML = '<li class="text-gray-400">No history yet.</li>';
    return;
  }
  historyList.innerHTML = hist.map(u =>
    `<li>
       <button class="hover:underline truncate w-full text-left" onclick="reuse('${u}')">${u}</button>
     </li>`
  ).join('');
}

function reuse(u) {
  mediaUrlInput.value = u;
  fetchMedia();
}
