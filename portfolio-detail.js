const DATA_URL = 'data/portfolio-data.json';
const THEME_KEY = 'iqoma-portfolio-theme';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getThemePreference() {
  const saved = localStorage.getItem(THEME_KEY);
  return ['system', 'light', 'dark'].includes(saved) ? saved : 'system';
}

function setThemePreference(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  const label = theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark';
  $$('#theme-toggle, .theme-toggle').forEach(button => {
    button.textContent = label;
    button.setAttribute('aria-label', `Color theme: ${label}. Click to change.`);
    button.title = `Theme: ${label}`;
  });
}

function initTheme() {
  setThemePreference(getThemePreference());
  $$('#theme-toggle, .theme-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const current = getThemePreference();
      const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
      setThemePreference(next);
    });
  });
}

function getProjectId() {
  return new URLSearchParams(window.location.search).get('id');
}

async function loadData() {
  const response = await fetch(DATA_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load portfolio data.');
  return response.json();
}

function icon(name) {
  const icons = {
    category: '<path d="M4 7h16M4 12h10M4 17h7"/>',
    role: '<path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/>',
    year: '<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="3"/>',
    status: '<path d="M20 6 9 17l-5-5"/>',
    problem: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
    goal: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    process: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="7" cy="6" r="2"/><circle cx="13" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    solution: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.74V17h8v-2.26A7 7 0 0 0 12 2Z"/>',
    impact: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-7"/>',
    tools: '<path d="M14.7 6.3a4 4 0 0 0-5.66 5.66L3 18v3h3l6.04-6.04A4 4 0 0 0 17.7 9.3l-3 3-3-3 3-3Z"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.category}</svg>`;
}

function statusClass(status = '') {
  return `status-${String(status).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function renderList(items = [], className = 'study-list') {
  if (!items || !items.length) return '<p>No additional detail yet.</p>';
  return `<ul class="${className}">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function metaCard(iconName, label, value) {
  return `<article class="detail-card detail-meta-card">${icon(iconName)}<span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '-')}</strong></article>`;
}

function studyBlock(iconName, label, title, content) {
  return `<article class="detail-card study-block">${icon(iconName)}<div class="block-label">${escapeHtml(label)}</div><h2>${escapeHtml(title)}</h2>${content}</article>`;
}

function renderDetail(project, profile) {
  document.title = `${project.title} · Iqoma Gumelar`;
  const root = $('#detail-root');
  const image = project.image
    ? `<div class="detail-image"><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} case study preview" loading="eager"></div>`
    : `<div class="detail-image detail-image-placeholder">Preview image coming soon</div>`;

  const sections = (project.sections || []).map((section, index) =>
    studyBlock('process', `Insight ${String(index + 1).padStart(2, '0')}`, section.title || 'Project Insight', `<p>${escapeHtml(section.body || '')}</p>`)
  ).join('');

  root.innerHTML = `
    <section class="detail-hero">
      <div>
        <div class="detail-eyebrow">Detailed Case Study</div>
        <h1>${escapeHtml(project.title)}</h1>
        <p class="detail-lead">${escapeHtml(project.summary || '')}</p>
        <div class="detail-actions">
          <a class="btn primary" href="index.html#projects">Back to Work</a>
          <a class="btn secondary" href="${escapeHtml(profile.whatsapp || 'https://wa.me/6285819720214')}" target="_blank" rel="noreferrer">Discuss on WhatsApp</a>
        </div>
      </div>
      ${image}
    </section>

    <section class="detail-meta-grid" aria-label="Project metadata">
      ${metaCard('category', 'Category', project.category)}
      ${metaCard('role', 'Role', project.role)}
      ${metaCard('year', 'Year', project.year)}
      ${metaCard('status', 'Status', project.status || 'Published')}
    </section>

    <section class="detail-content">
      <aside class="detail-card detail-sidebar">
        <h2>Case Study Map</h2>
        <p>A focused breakdown of the project context, process, solution, and result.</p>
        <ul>
          <li>${icon('problem')} Problem</li>
          <li>${icon('goal')} Goal</li>
          <li>${icon('users')} Users</li>
          <li>${icon('process')} Process</li>
          <li>${icon('solution')} Solution</li>
          <li>${icon('impact')} Impact</li>
        </ul>
      </aside>

      <div class="detail-main">
        ${studyBlock('problem', '01 · Problem', 'Why this project existed', `<p>${escapeHtml(project.problem || project.summary || '')}</p>`)}
        ${studyBlock('goal', '02 · Goal', 'What needed to be solved', `<p>${escapeHtml(project.goal || '')}</p>`)}
        ${studyBlock('users', '03 · Users', 'Who it was designed for', renderList(project.users))}
        ${studyBlock('process', '04 · Process', 'How the solution was shaped', renderList(project.process, 'study-list process-timeline'))}
        ${studyBlock('solution', '05 · Solution', 'Key design decisions', renderList(project.solution))}
        ${sections}
        ${studyBlock('impact', '06 · Impact', 'Outcome & learning', `<p>${escapeHtml(project.outcome || project.impact || '')}</p>`)}
        ${studyBlock('tools', 'Tools', 'Workflow stack', renderList(project.tools))}
      </div>
    </section>`;
}

function renderNotFound() {
  $('#detail-root').innerHTML = `
    <section class="detail-hero">
      <div>
        <div class="detail-eyebrow">Case Study Not Found</div>
        <h1>Project unavailable.</h1>
        <p class="detail-lead">The project detail does not exist or has not been published yet.</p>
        <div class="detail-actions"><a class="btn primary" href="index.html#projects">Back to Portfolio</a></div>
      </div>
      <div class="detail-image detail-image-placeholder">404</div>
    </section>`;
}

async function init() {
  initTheme();
  const data = await loadData();
  const project = (data.projects || []).find(item => item.id === getProjectId());
  if (!project) return renderNotFound();
  renderDetail(project, data.profile || {});
}

init().catch(error => {
  console.error(error);
  renderNotFound();
});
