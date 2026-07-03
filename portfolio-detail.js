const DATA_URL = 'data/portfolio-data.json';
const THEME_KEY = 'iqoma-portfolio-theme';
const $ = (selector, parent = document) => parent.querySelector(selector);

const icons = {
  category: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  role: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
  year: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>',
  status: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-5"/><circle cx="12" cy="12" r="9"/></svg>',
  problem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
  goal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  process: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h5l3-8 4 16 3-8h3"/></svg>',
  solution: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  impact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
  tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/></svg>'
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function statusClass(status = '') {
  return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function getProjectId() {
  return new URLSearchParams(window.location.search).get('id');
}

async function loadData() {
  const response = await fetch(DATA_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load portfolio data');
  return response.json();
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.dataset.theme = saved;
  const button = $('#theme-toggle');
  if (!button) return;
  button.textContent = saved === 'dark' ? 'Light' : 'Dark';
  button.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    button.textContent = next === 'dark' ? 'Light' : 'Dark';
  });
}

function renderList(items = [], className = 'study-list') {
  if (!items.length) return '<p>Additional details will be added soon.</p>';
  return `<ul class="${className}">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function metaCard(icon, label, value) {
  return `
    <article class="detail-card detail-meta-card">
      ${icons[icon]}
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value || '-')}</strong>
    </article>
  `;
}

function blockText(icon, label, title, body) {
  return `
    <article class="detail-card study-block">
      ${icons[icon]}
      <div class="block-label">${escapeHtml(label)}</div>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(body || 'Details will be added soon.')}</p>
    </article>
  `;
}

function blockHtml(icon, label, title, html) {
  return `
    <article class="detail-card study-block">
      ${icons[icon]}
      <div class="block-label">${escapeHtml(label)}</div>
      <h2>${escapeHtml(title)}</h2>
      ${html}
    </article>
  `;
}

function renderDetail(project, profile) {
  document.title = `${project.title} · Iqoma Gumelar`;
  const image = project.image
    ? `<div class="detail-image"><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} case study preview"></div>`
    : `<div class="detail-image detail-image-placeholder">Preview image coming soon</div>`;

  $('#detail-root').innerHTML = `
    <section class="detail-hero">
      <div>
        <div class="detail-eyebrow">Detailed Case Study</div>
        <h1>${escapeHtml(project.title)}</h1>
        <p class="detail-lead">${escapeHtml(project.summary || '')}</p>
        <div class="detail-actions">
          <a class="btn primary" href="index.html#projects">Back to Work</a>
          <a class="btn secondary" href="${escapeHtml(profile.whatsapp || 'https://wa.me/6285819720214')}" target="_blank" rel="noreferrer">Discuss on WhatsApp</a>
          <a class="btn secondary" href="mailto:${escapeHtml(profile.email)}?subject=${encodeURIComponent(`Portfolio inquiry: ${project.title}`)}">Email Me</a>
        </div>
      </div>
      ${image}
    </section>

    <section class="detail-meta-grid" aria-label="Project metadata">
      ${metaCard('category', 'Category', project.category || 'Case Study')}
      ${metaCard('role', 'Role', project.role || 'Designer')}
      ${metaCard('year', 'Year', project.year || '-')}
      <article class="detail-card detail-meta-card">
        ${icons.status}
        <span>Status</span>
        <strong><span class="status-badge ${statusClass(project.status)}">${escapeHtml(project.status || 'Published')}</span></strong>
      </article>
    </section>

    <section class="detail-content">
      <aside class="detail-card detail-sidebar">
        <h2>Case Study Map</h2>
        <p>A focused breakdown of context, process, solution, and impact.</p>
        <ul>
          <li>${icons.problem} Problem</li>
          <li>${icons.goal} Goal</li>
          <li>${icons.users} Users</li>
          <li>${icons.process} Process</li>
          <li>${icons.solution} Solution</li>
          <li>${icons.impact} Impact</li>
        </ul>
      </aside>

      <div class="detail-main">
        ${blockText('problem', '01 · Problem', 'Why this project existed', project.problem || project.summary)}
        ${blockText('goal', '02 · Goal', 'What needed to be solved', project.goal || '')}
        ${blockHtml('users', '03 · Users', 'Who it was designed for', renderList(project.users || []))}
        ${blockHtml('process', '04 · Process', 'How the solution was shaped', renderList(project.process || [], 'study-list process-timeline'))}
        ${blockHtml('solution', '05 · Solution', 'Key design decisions', renderList(project.solution || []))}
        ${(project.sections || []).map((section, index) => blockText('process', `Insight · ${String(index + 1).padStart(2, '0')}`, section.title, section.body)).join('')}
        ${blockText('impact', '06 · Impact', 'Outcome & learning', project.outcome || project.impact || '')}
        ${blockHtml('tools', 'Tools', 'Workflow stack', renderList(project.tools || []))}
      </div>
    </section>
  `;
}

function renderNotFound() {
  $('#detail-root').innerHTML = `
    <section class="detail-hero">
      <div>
        <div class="detail-eyebrow">Case Study Not Found</div>
        <h1>Project unavailable.</h1>
        <p class="detail-lead">The project detail you are looking for does not exist or has not been published yet.</p>
        <div class="detail-actions"><a class="btn primary" href="index.html#projects">Back to Portfolio</a></div>
      </div>
      <div class="detail-image detail-image-placeholder">404</div>
    </section>
  `;
}

async function init() {
  initTheme();
  const data = await loadData();
  const project = data.projects.find(item => item.id === getProjectId());
  project ? renderDetail(project, data.profile) : renderNotFound();
}

init().catch(error => {
  console.error(error);
  renderNotFound();
});
