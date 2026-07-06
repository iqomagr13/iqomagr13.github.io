const DATA_URL = 'data/portfolio-data.json';
const KEY = 'iqoma-portfolio-data-v3';
const LEGACY_KEY = 'iqoma-admin-data';
const THEME_KEY = 'iqoma-portfolio-theme';
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

let data;
let current = 0;
const $ = (selector, parent = document) => parent.querySelector(selector);

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function load() {
  const saved = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
  if (saved) return JSON.parse(saved);
  const response = await fetch(DATA_URL, { cache: 'no-store' });
  return response.json();
}

function persistBrowser() {
  const payload = JSON.stringify(data);
  try {
    localStorage.setItem(KEY, payload);
    localStorage.setItem(LEGACY_KEY, payload);
    return true;
  } catch (error) {
    console.warn('Unable to save to browser storage.', error);
    setUploadMessage('Browser storage is full. Export JSON or use a smaller image file.', 'error');
    return false;
  }
}

function getThemePreference() {
  const saved = localStorage.getItem(THEME_KEY);
  return ['system', 'light', 'dark'].includes(saved) ? saved : 'system';
}

function setThemePreference(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  const button = $('#theme-toggle');
  if (button) {
    const label = theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light';
    button.textContent = label;
    button.setAttribute('aria-label', `Color theme: ${label}. Click to change.`);
    button.title = `Theme: ${label}`;
  }
}

function initTheme() {
  setThemePreference(getThemePreference());
  const button = $('#theme-toggle');
  if (!button) return;
  button.onclick = () => {
    const current = getThemePreference();
    const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    setThemePreference(next);
  };
}

function imagePreviewMarkup(src, title = 'Project') {
  if (!src) return '<span>No image</span>';
  return `<img src="${esc(src)}" alt="${esc(title)} preview">`;
}

function renderList() {
  const list = $('#project-list');
  list.innerHTML = data.projects.map((project, index) => `
    <button type="button" data-i="${index}" class="${index === current ? 'is-active' : ''}">
      <span class="admin-thumb">${imagePreviewMarkup(project.image, project.title)}</span>
      <span><strong>${esc(project.title || 'Untitled Project')}</strong><br><small>${esc(project.category || 'Case Study')}</small></span>
    </button>
  `).join('');
  list.querySelectorAll('button').forEach(button => {
    button.onclick = () => {
      current = Number(button.dataset.i);
      fillForm();
      renderList();
      preview();
    };
  });
}

function setField(form, key, value) {
  if (!form.elements[key]) return;
  form.elements[key].value = Array.isArray(value) ? value.join('\n') : (value || '');
}

function fillForm() {
  const project = data.projects[current] || {};
  const form = $('#admin-form');
  ['id', 'title', 'category', 'role', 'year', 'status', 'image', 'summary', 'impact', 'problem', 'goal', 'users', 'process', 'solution', 'outcome', 'tools'].forEach(key => setField(form, key, project[key]));
  updatePhotoPreview(project.image, project.title);
}

function lines(value = '') {
  return value.split('\n').map(item => item.trim()).filter(Boolean);
}

function readForm() {
  const form = $('#admin-form');
  const existing = data.projects[current] || {};
  const project = { ...existing };
  ['id', 'title', 'category', 'role', 'year', 'status', 'image', 'summary', 'impact', 'problem', 'goal', 'outcome'].forEach(key => {
    project[key] = form.elements[key]?.value || '';
  });
  ['users', 'process', 'solution', 'tools'].forEach(key => {
    project[key] = lines(form.elements[key]?.value || '');
  });
  return project;
}

function updatePhotoPreview(src, title = 'Project') {
  $('#photo-preview').innerHTML = imagePreviewMarkup(src, title);
}

function setUploadMessage(message, type = '') {
  const messageBox = $('#upload-message');
  messageBox.className = `upload-message ${type}`.trim();
  messageBox.textContent = message;
}

function setUploadProgress(percent = 0) {
  $('#upload-bar').style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

function preview() {
  const project = readForm();
  updatePhotoPreview(project.image, project.title);
  $('#admin-preview').innerHTML = `
    <article class="project-card">
      <div class="project-visual">${project.image ? `<img src="${esc(project.image)}" alt="${esc(project.title)} preview">` : ''}</div>
      <div class="project-body">
        <div class="project-topline"><span class="status-badge">${esc(project.status)}</span><span class="status-badge">${esc(project.year)}</span></div>
        <h3>${esc(project.title)}</h3>
        <p>${esc(project.summary)}</p>
        <div class="card-meta"><span class="status-badge">${esc(project.category)}</span><span class="status-badge">${esc(project.role)}</span></div>
        <span class="case-study-link">View case study →</span>
      </div>
    </article>
  `;
}

function saveCurrentProject() {
  data.projects[current] = readForm();
  persistBrowser();
  renderList();
  fillForm();
  preview();
  setUploadMessage('Saved to browser. Export portfolio-data.json when you are ready to publish it to GitHub.', 'success');
}

function getExportPayload() {
  const latest = readForm();
  if (data.projects[current]) data.projects[current] = latest;
  persistBrowser();
  return JSON.stringify(data, null, 2);
}

function downloadJson(event) {
  if (event) event.preventDefault();

  try {
    const payload = getExportPayload();
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'portfolio-data.json';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 1200);

    setUploadMessage('portfolio-data.json downloaded. Replace data/portfolio-data.json in GitHub, then commit and push.', 'success');
  } catch (error) {
    console.error(error);
    setUploadMessage('Export failed. Use Copy JSON, then paste it manually into data/portfolio-data.json on GitHub.', 'error');
  }
}

async function copyJsonToClipboard(event) {
  if (event) event.preventDefault();

  try {
    const payload = getExportPayload();
    await navigator.clipboard.writeText(payload);
    setUploadMessage('JSON copied. Open GitHub → data/portfolio-data.json → Edit → paste → Commit changes.', 'success');
  } catch (error) {
    console.error(error);
    const payload = getExportPayload();
    const textarea = document.createElement('textarea');
    textarea.value = payload;
    textarea.style.position = 'fixed';
    textarea.style.inset = '16px';
    textarea.style.zIndex = '9999';
    textarea.style.width = 'calc(100% - 32px)';
    textarea.style.height = 'calc(100% - 32px)';
    textarea.style.padding = '16px';
    textarea.style.background = '#fff';
    textarea.style.color = '#111';
    textarea.style.border = '3px solid #2f6bff';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    setUploadMessage('Copy failed automatically. A JSON textarea is open; press Ctrl + A then Ctrl + C.', 'error');
  }
}

function validateImage(file) {
  if (!file) return 'No file selected.';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'File must be PNG, JPG, or WebP.';
  if (file.size > MAX_IMAGE_SIZE) return 'File is too large. Please use an image under 2MB for web optimization.';
  return '';
}

function useUploadedImage(file) {
  const error = validateImage(file);
  if (error) {
    setUploadProgress(0);
    setUploadMessage(error, 'error');
    return;
  }

  setUploadProgress(10);
  setUploadMessage(`Uploading ${file.name}...`);
  const reader = new FileReader();

  reader.onprogress = (event) => {
    if (!event.lengthComputable) return;
    setUploadProgress(Math.round((event.loaded / event.total) * 85));
  };

  reader.onload = () => {
    const form = $('#admin-form');
    form.elements.image.value = reader.result;
    data.projects[current] = readForm();
    persistBrowser();
    setUploadProgress(100);
    setUploadMessage('Photo uploaded and saved automatically. Open or refresh the homepage/detail page in this browser to see it immediately.', 'success');
    renderList();
    fillForm();
    preview();
  };

  reader.onerror = () => {
    setUploadProgress(0);
    setUploadMessage('Unable to read this file. Please try another image.', 'error');
  };

  reader.readAsDataURL(file);
}

function initPhotoUploader() {
  const uploader = $('#photo-uploader');
  const input = $('#photo-input');
  const choose = $('#choose-photo');
  const clear = $('#clear-photo');
  const imagePath = $('#image-path');

  choose.onclick = () => input.click();
  input.onchange = () => useUploadedImage(input.files?.[0]);
  imagePath.addEventListener('input', () => {
    setUploadProgress(0);
    setUploadMessage('Manual image path updated. Preview will follow the value in the image field.');
    preview();
  });

  clear.onclick = () => {
    $('#admin-form').elements.image.value = '';
    setUploadProgress(0);
    setUploadMessage('Photo cleared. You can upload a new photo or paste an asset path manually.');
    preview();
  };

  uploader.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    input.click();
  });
  uploader.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      input.click();
    }
  });
  ['dragenter', 'dragover'].forEach(eventName => {
    uploader.addEventListener(eventName, event => {
      event.preventDefault();
      uploader.classList.add('is-dragging');
    });
  });
  ['dragleave', 'drop'].forEach(eventName => {
    uploader.addEventListener(eventName, event => {
      event.preventDefault();
      uploader.classList.remove('is-dragging');
    });
  });
  uploader.addEventListener('drop', event => useUploadedImage(event.dataTransfer.files?.[0]));
}

function createNewProject() {
  data.projects.unshift({
    id: 'new-project',
    title: 'New Project',
    category: 'Case Study',
    role: 'Designer',
    year: '2026',
    status: 'Draft',
    summary: '',
    impact: '',
    image: '',
    problem: '',
    goal: '',
    users: [],
    process: [],
    solution: [],
    outcome: '',
    tools: []
  });
  current = 0;
  persistBrowser();
  renderList();
  fillForm();
  preview();
}

function deleteCurrentProject() {
  if (!data.projects.length) return;
  const project = data.projects[current];
  const confirmed = confirm(`Delete "${project.title || 'this project'}" from browser CMS data?`);
  if (!confirmed) return;
  data.projects.splice(current, 1);
  current = Math.max(0, Math.min(current, data.projects.length - 1));
  persistBrowser();
  renderList();
  fillForm();
  preview();
}

async function init() {
  initTheme();
  data = await load();
  if (!Array.isArray(data.projects)) data.projects = [];
  renderList();
  fillForm();
  preview();
  initPhotoUploader();

  $('#admin-form').addEventListener('input', preview);
  $('#admin-form').addEventListener('submit', event => {
    event.preventDefault();
    saveCurrentProject();
  });
  $('#new-project')?.addEventListener('click', createNewProject);
  $('#delete-project')?.addEventListener('click', deleteCurrentProject);
  $('#export-json')?.addEventListener('click', downloadJson);
  $('#copy-json')?.addEventListener('click', copyJsonToClipboard);

  window.downloadJson = downloadJson;
  window.copyJsonToClipboard = copyJsonToClipboard;
}

init().catch(error => {
  console.error(error);
  document.body.insertAdjacentHTML('afterbegin', '<p style="padding:16px;color:#dc2626">CMS failed to load. Please check data/portfolio-data.json.</p>');
});
