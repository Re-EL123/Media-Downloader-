// script.js

const loading = document.getElementById('loading');
const results = document.getElementById('results');
const preview = document.getElementById('preview');
const captionEl = document.getElementById('caption');
const durationEl = document.getElementById('duration');
const downloadOptions = document.getElementById('downloadOptions');
const historyList = document.getElementById('historyList');
const mediaUrlInput = document.getElementById('mediaUrl');
const fetchBtn = document.getElementById('fetchBtn');

const API_URL = 'https://netsnatcher-api.p.rapidapi.com/download';
const HEADERS = {
  'Content-Type': 'application/json',
  'x-rapidapi-host': 'netsnatcher-api.p.rapidapi.com',
  'x-rapidapi-key': '82ae10db11mshb41ccacdd991130p108a22jsnf3ae22b94bbd'
};

document.addEventListener('DOMContentLoaded', renderHistory);
fetchBtn.addEventListener('click', fetchMedia);

function setLoading(on) {
  loading.classList.toggle('hidden', !on);
}

async function fetchMedia() {
  const url = mediaUrlInput.value.trim();
  if (!url) return alert('Please paste a URL.');

  // reset UI
  results.classList.add('hidden');
  preview.innerHTML = '';
  downloadOptions.innerHTML = '';
  captionEl.textContent = '';
  durationEl.textContent = '';

  setLoading(true);
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ url })
    });

    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Invalid JSON:', text);
      return alert('Server returned invalid JSON. Check console.');
    }

    if (data.error) {
      return alert('API Error: ' + (data.message || 'Unknown'));
    }

    // show preview
    if (data.thumb) {
      preview.innerHTML = `<img src="${data.thumb}" class="w-full h-full object-cover"/>`;
    } else if (data.download_url) {
      preview.innerHTML = `<video controls src="${data.download_url}" class="w-full h-full object-cover"></video>`;
    }

    // show meta
    captionEl.textContent = data.caption || '';
    if (data.duration) {
      durationEl.textContent = `Duration: ${Math.round(data.duration)}s`;
    }

    // download options
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

  } catch (err) {
    console.error('Fetch error:', err);
    alert('Network or server error. See console.');
  } finally {
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
