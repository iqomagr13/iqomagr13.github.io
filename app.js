const DATA_URL = 'data/portfolio-data.json';
const THEME_KEY = 'iqoma-portfolio-theme';
let siteData = null;
let testimonialIndex = 0;
let activeStep = 0;

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

function initHero() {
  const hero = $('.hero');
  const cursor = $('.cursor-dot');
  if (!hero) return;
  const setPosition = (event) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    hero.style.setProperty('--my', `${event.clientY - rect.top}px`);
    if (cursor) {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    }
  };
  hero.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') hero.classList.add('is-inspecting');
  });
  hero.addEventListener('pointerleave', () => hero.classList.remove('is-inspecting'));
  hero.addEventListener('pointermove', setPosition, { passive: true });
  hero.addEventListener('pointerdown', (event) => {
    setPosition(event);
    hero.classList.add('is-inspecting');
    window.setTimeout(() => hero.classList.remove('is-inspecting'), 1200);
  });
}

function renderExperience() {
  const list = $('#experience-list');
  if (!list || !siteData?.experience) return;
  list.innerHTML = siteData.experience.map(item => `
    <article class="experience-card reveal">
      <div>
        <span class="spec-label">component.card</span>
        <div class="exp-period">${escapeHtml(item.period)}</div>
      </div>
      <div>
        <h3>${escapeHtml(item.company)}</h3>
        <p class="role">${escapeHtml(item.role)} · ${escapeHtml(item.location)}</p>
        <ul>${(item.highlights || []).slice(0, 2).map(point => `<li>${escapeHtml(point)}</li>`).join('')}</ul>
      </div>
    </article>
  `).join('');
}

function statusClass(status = '') {
  return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function renderProjects() {
  const grid = $('#projects-grid');
  if (!grid || !siteData?.projects) return;
  grid.innerHTML = siteData.projects.map(project => {
    const image = project.image
      ? `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} preview" loading="lazy">`
      : `<div class="detail-image-placeholder" style="min-height:100%;height:100%;font-weight:900;">${escapeHtml(project.category)}</div>`;
    return `
      <article class="project-card">
        <a class="project-link" href="portfolio-detail.html?id=${encodeURIComponent(project.id)}" aria-label="Open case study: ${escapeHtml(project.title)}">
          <div class="project-visual">${image}</div>
          <div class="project-body">
            <div class="project-topline">
              <span class="status-badge ${statusClass(project.status)}">${escapeHtml(project.status)}</span>
              <span class="pill">${escapeHtml(project.year)}</span>
            </div>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.summary)}</p>
            <div class="card-meta">
              <span class="status-badge">${escapeHtml(project.category)}</span>
              <span class="status-badge">${escapeHtml(project.role)}</span>
            </div>
            <span class="case-study-link">View case study →</span>
          </div>
        </a>
      </article>
    `;
  }).join('');
}

function initViewportSlider() {
  const slider = $('#viewport-slider');
  const label = $('#viewport-label');
  const grid = $('#projects-grid');
  if (!slider || !label || !grid) return;
  const update = () => {
    const width = Number(slider.value);
    const size = width < 560 ? 'Mobile' : width < 900 ? 'Tablet' : 'Desktop';
    label.textContent = `${size} · ${width}px`;
    grid.style.maxWidth = `${width}px`;
  };
  slider.addEventListener('input', update);
  update();
}

function renderSkills() {
  const board = $('#skill-tags');
  if (!board || !siteData?.skills) return;
  const skills = [
    ...(siteData.skills.aiWorkflow || []),
    ...siteData.skills.designExpertise,
    ...siteData.skills.software,
    ...siteData.skills.collaboration,
    ...siteData.skills.softSkills.slice(0, 8)
  ];
  const unique = [...new Set(skills)].slice(0, 24);
  const positions = [
    [4, 8], [28, 7], [54, 10], [76, 8],
    [8, 26], [35, 26], [62, 29], [78, 25],
    [5, 46], [29, 46], [53, 49], [74, 46],
    [12, 66], [37, 68], [61, 69], [78, 66],
    [20, 84], [47, 86], [70, 84], [16, 38],
    [44, 39], [65, 38], [24, 58], [48, 60]
  ];
  board.innerHTML = unique.map((skill, index) => {
    const [left, top] = positions[index] || [10 + (index % 4) * 22, 12 + Math.floor(index / 4) * 14];
    return `<button class="skill-tag" type="button" style="left:${left}%;top:${top}%;" data-skill="${escapeHtml(skill)}">${escapeHtml(skill)}</button>`;
  }).join('');
  initDragTags();
  requestAnimationFrame(drawConnectors);
}

function initDragTags() {
  const board = $('#skills-board');
  if (!board) return;
  $$('.skill-tag').forEach(tag => {
    tag.addEventListener('pointerdown', event => {
      tag.setPointerCapture(event.pointerId);
      const tagRect = tag.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      tag.dataset.dragging = 'true';
      tag.dataset.offsetX = event.clientX - tagRect.left;
      tag.dataset.offsetY = event.clientY - tagRect.top;
      tag.style.left = `${tagRect.left - boardRect.left}px`;
      tag.style.top = `${tagRect.top - boardRect.top}px`;
      tag.style.transform = 'none';
      drawConnectors();
    });
    tag.addEventListener('pointermove', event => {
      if (tag.dataset.dragging !== 'true') return;
      const boardRect = board.getBoundingClientRect();
      const maxX = boardRect.width - tag.offsetWidth - 24;
      const maxY = boardRect.height - tag.offsetHeight - 24;
      const x = event.clientX - boardRect.left - Number(tag.dataset.offsetX);
      const y = event.clientY - boardRect.top - Number(tag.dataset.offsetY);
      tag.style.left = `${Math.max(12, Math.min(x, maxX))}px`;
      tag.style.top = `${Math.max(12, Math.min(y, maxY))}px`;
      drawConnectors();
    });
    const stopDrag = () => { tag.dataset.dragging = 'false'; drawConnectors(); };
    tag.addEventListener('pointerup', stopDrag);
    tag.addEventListener('pointercancel', stopDrag);
  });
}

function drawConnectors() {
  const svg = $('#connector-layer');
  const board = $('#skills-board');
  if (!svg || !board) return;
  svg.innerHTML = '';
  const tags = $$('.skill-tag');
  const rect = board.getBoundingClientRect();
  const centers = tags.map(tag => {
    const r = tag.getBoundingClientRect();
    return {
      x: r.left - rect.left + r.width / 2,
      y: r.top - rect.top + r.height / 2,
      tag
    };
  });
  let count = 0;
  for (let i = 0; i < centers.length; i += 1) {
    for (let j = i + 1; j < centers.length; j += 1) {
      const a = centers[i];
      const b = centers[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance > 170 || count > 12) continue;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const curve = Math.max(32, Math.min(90, distance / 2));
      path.setAttribute('d', `M${a.x},${a.y} C${a.x + curve},${a.y} ${b.x - curve},${b.y} ${b.x},${b.y}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', String(Math.max(.12, 1 - distance / 210)));
      svg.appendChild(path);
      count += 1;
    }
  }
}

function renderTestimonial() {
  const quote = $('#testimonial-quote');
  const person = $('#testimonial-person');
  if (!quote || !person || !siteData?.testimonials?.length) return;
  const item = siteData.testimonials[testimonialIndex % siteData.testimonials.length];
  quote.textContent = `“${item.quote}”`;
  person.textContent = `${item.name} · ${item.role}`;
}

function initTestimonials() {
  const button = $('#resolve-testimonial');
  if (!button) return;
  button.addEventListener('click', () => {
    testimonialIndex += 1;
    const card = $('#testimonial-card');
    card.style.opacity = '0';
    window.setTimeout(() => {
      renderTestimonial();
      card.style.opacity = '1';
    }, 180);
  });
}

function renderProcess() {
  const tabs = $('#process-tabs');
  const panel = $('#process-panel');
  const steps = siteData?.caseStudy?.steps || [];
  if (!tabs || !panel || !steps.length) return;
  tabs.innerHTML = steps.map((step, index) => `<button type="button" role="tab" aria-selected="${index === activeStep}" data-step="${index}">${escapeHtml(step.label)}</button>`).join('');
  const item = steps[activeStep];
  panel.innerHTML = `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p><span class="metric">${escapeHtml(item.metric)}</span>`;
  $$('button', tabs).forEach(button => {
    button.addEventListener('click', () => {
      activeStep = Number(button.dataset.step);
      renderProcess();
    });
  });
}

function initContactForm() {
  const form = $('#contact-form');
  const status = $('#form-status');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`Portfolio inquiry from ${data.get('name')}`);
    const body = encodeURIComponent(`${data.get('message')}\n\nFrom: ${data.get('name')} (${data.get('email')})`);
    status.textContent = 'Opening email draft...';
    window.location.href = `mailto:${siteData.profile.email}?subject=${subject}&body=${body}`;
    setTimeout(() => { status.textContent = 'Success state: email draft is ready.'; }, 600);
  });
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in');
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(item => observer.observe(item));
}

function setProfileLinks() {
  if (!siteData?.profile) return;
  const summary = $('#profile-summary');
  if (summary) summary.textContent = siteData.profile.summary;
  const email = $('#email-link');
  if (email) email.href = `mailto:${siteData.profile.email}`;
  const whatsapp = $('#whatsapp-link');
  if (whatsapp) whatsapp.href = siteData.profile.whatsapp || 'https://wa.me/6285819720214';
  const linkedin = $('#linkedin-link');
  if (linkedin) linkedin.href = siteData.profile.linkedin;
  const instagram = $('#instagram-link');
  if (instagram) instagram.href = siteData.profile.instagram;
}

async function init() {
  initTheme();
  initHero();
  siteData = await loadData();
  setProfileLinks();
  renderExperience();
  renderProjects();
  initViewportSlider();
  renderSkills();
  window.addEventListener('resize', () => requestAnimationFrame(drawConnectors));
  renderTestimonial();
  initTestimonials();
  renderProcess();
  initContactForm();
  initReveal();
  $('#year').textContent = new Date().getFullYear();
}

init().catch(error => {
  console.error(error);
  const main = $('#main');
  if (main) main.innerHTML = '<section class="section-shell"><h1>Portfolio failed to load.</h1><p>Please check data/portfolio-data.json.</p></section>';
});
