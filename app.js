const DATA_URL = 'data/portfolio-data.json';
const STORAGE_KEY = 'iqoma-portfolio-data-v3';
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

function slugStatus(status = '') {
  return `status-${String(status).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function getThemePreference() {
  const saved = localStorage.getItem(THEME_KEY);
  return ['system', 'light', 'dark'].includes(saved) ? saved : 'system';
}

function setThemePreference(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  const label = theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark';
  $$('#theme-toggle, .header-theme-toggle, .theme-toggle').forEach(button => {
    button.textContent = label;
    button.setAttribute('aria-label', `Color theme: ${label}. Click to change.`);
    button.title = `Theme: ${label}`;
  });
}

function initTheme() {
  setThemePreference(getThemePreference());
  $$('#theme-toggle, .header-theme-toggle, .theme-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const current = getThemePreference();
      const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
      setThemePreference(next);
    });
  });
}

async function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn('Saved portfolio data is invalid. Loading website JSON instead.', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const response = await fetch(DATA_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load portfolio data.');
  return response.json();
}

function initHeroSpotlight() {
  const hero = $('.hero');
  const cursor = $('.cursor-dot');
  if (!hero) return;

  const setPosition = (clientX, clientY) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${Math.max(0, Math.min(rect.width, clientX - rect.left))}px`);
    hero.style.setProperty('--my', `${Math.max(0, Math.min(rect.height, clientY - rect.top))}px`);
  };

  hero.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') hero.classList.add('is-inspecting');
  });
  hero.addEventListener('pointerleave', () => hero.classList.remove('is-inspecting'));
  hero.addEventListener('pointerdown', event => {
    setPosition(event.clientX, event.clientY);
    hero.classList.add('is-inspecting');
    if (event.pointerType === 'touch') {
      window.clearTimeout(hero._touchTimer);
      hero._touchTimer = window.setTimeout(() => hero.classList.remove('is-inspecting'), 1500);
    }
  });
  hero.addEventListener('pointermove', event => setPosition(event.clientX, event.clientY), { passive: true });

  window.addEventListener('pointermove', event => {
    if (!cursor) return;
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  }, { passive: true });
}

function renderProfile() {
  const profile = siteData.profile || {};
  const summary = $('#profile-summary');
  if (summary) summary.textContent = profile.summary || profile.subheadline || '';
  const email = $('#email-link');
  if (email && profile.email) email.href = `mailto:${profile.email}`;
  const wa = $('#whatsapp-link');
  if (wa && profile.whatsapp) wa.href = profile.whatsapp;
  const linkedin = $('#linkedin-link');
  if (linkedin && profile.linkedin) linkedin.href = profile.linkedin;
  const instagram = $('#instagram-link');
  if (instagram && profile.instagram) instagram.href = profile.instagram;
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
}

function renderExperience() {
  const list = $('#experience-list');
  if (!list) return;
  list.innerHTML = (siteData.experience || []).map(item => {
    const highlights = (item.highlights || []).slice(0, 2).map(point => `<li>${escapeHtml(point)}</li>`).join('');
    return `
      <article class="experience-card reveal">
        <div>
          <span class="spec-label">border-radius: 30px</span>
          <div class="exp-period">${escapeHtml(item.period)}</div>
        </div>
        <div>
          <h3>${escapeHtml(item.company)}</h3>
          <p class="role">${escapeHtml(item.role)} · ${escapeHtml(item.location || '')}</p>
          <ul>${highlights}</ul>
        </div>
      </article>`;
  }).join('');
}

function renderProjectVisual(project) {
  const image = project.image || '';
  if (image) return `<img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)} preview" loading="lazy">`;
  return `<div class="detail-image-placeholder">${escapeHtml(project.category || 'Case Study')}</div>`;
}

function renderProjects() {
  const grid = $('#projects-grid');
  if (!grid) return;
  grid.innerHTML = (siteData.projects || []).map(project => `
    <article class="project-card reveal">
      <a class="project-link" href="portfolio-detail.html?id=${encodeURIComponent(project.id)}" aria-label="Open case study: ${escapeHtml(project.title)}">
        <div class="project-visual">${renderProjectVisual(project)}</div>
        <div class="project-body">
          <div class="project-topline">
            <span class="status-badge ${slugStatus(project.status)}">${escapeHtml(project.status || 'Published')}</span>
            <span class="status-badge">${escapeHtml(project.year || '')}</span>
          </div>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.summary || '')}</p>
          <div class="card-meta">
            <span class="status-badge">${escapeHtml(project.category || 'Case Study')}</span>
            <span class="status-badge">${escapeHtml(project.role || 'Designer')}</span>
          </div>
          <span class="case-study-link">View case study →</span>
        </div>
      </a>
    </article>
  `).join('');
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
  const board = $('#skills-board');
  const tagsRoot = $('#skill-tags');
  if (!board || !tagsRoot) return;
  const skills = siteData.skills || {};
  const allSkills = [
    ...(skills.aiWorkflow || []),
    ...(skills.designExpertise || []),
    ...(skills.software || []),
    ...(skills.collaboration || []),
    ...(skills.softSkills || [])
  ];
  const uniqueSkills = [...new Set(allSkills)].slice(0, 24);
  const positions = [
    [5, 8], [29, 8], [54, 10], [75, 8],
    [9, 28], [35, 28], [58, 30], [77, 29],
    [6, 50], [29, 50], [52, 52], [74, 51],
    [12, 71], [36, 73], [60, 72], [78, 72],
    [19, 40], [45, 40], [66, 42], [20, 88],
    [45, 88], [66, 88], [4, 86], [82, 88]
  ];
  tagsRoot.innerHTML = uniqueSkills.map((skill, index) => `
    <button class="skill-tag" type="button" style="left:${positions[index][0]}%; top:${positions[index][1]}%">${escapeHtml(skill)}</button>
  `).join('');
  initDraggableSkills();
  requestAnimationFrame(drawConnectors);
  window.addEventListener('resize', drawConnectors);
}

function initDraggableSkills() {
  const board = $('#skills-board');
  if (!board) return;
  let active = null;
  let offsetX = 0;
  let offsetY = 0;

  $$('.skill-tag', board).forEach(tag => {
    tag.addEventListener('pointerdown', event => {
      active = tag;
      tag.setPointerCapture(event.pointerId);
      const rect = tag.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      tag.style.zIndex = 4;
    });
    tag.addEventListener('pointermove', event => {
      if (active !== tag) return;
      const boardRect = board.getBoundingClientRect();
      const x = Math.max(0, Math.min(event.clientX - boardRect.left - offsetX, boardRect.width - tag.offsetWidth));
      const y = Math.max(0, Math.min(event.clientY - boardRect.top - offsetY, boardRect.height - tag.offsetHeight));
      tag.style.left = `${x}px`;
      tag.style.top = `${y}px`;
      drawConnectors();
    });
    tag.addEventListener('pointerup', () => {
      if (active) active.style.zIndex = 3;
      active = null;
      drawConnectors();
    });
  });
}

function centerOf(element, parentRect) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - parentRect.left + rect.width / 2,
    y: rect.top - parentRect.top + rect.height / 2
  };
}

function drawConnectors() {
  const svg = $('#connector-layer');
  const board = $('#skills-board');
  if (!svg || !board) return;
  const tags = $$('.skill-tag', board);
  const parentRect = board.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${parentRect.width} ${parentRect.height}`);
  svg.innerHTML = '';
  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      const a = centerOf(tags[i], parentRect);
      const b = centerOf(tags[j], parentRect);
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 150) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midX = (a.x + b.x) / 2;
        path.setAttribute('d', `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1.6');
        path.setAttribute('stroke-opacity', '0.42');
        svg.appendChild(path);
      }
    }
  }
}

function renderTestimonials() {
  const quote = $('#testimonial-quote');
  const person = $('#testimonial-person');
  const button = $('#resolve-testimonial');
  const card = $('#testimonial-card');
  const testimonials = siteData.testimonials || [];
  if (!quote || !person || !button || !testimonials.length) return;

  const paint = () => {
    const item = testimonials[testimonialIndex % testimonials.length];
    quote.textContent = `“${item.quote}”`;
    person.textContent = `${item.name} · ${item.role}`;
  };
  button.addEventListener('click', () => {
    card.style.opacity = '0';
    window.setTimeout(() => {
      testimonialIndex = (testimonialIndex + 1) % testimonials.length;
      paint();
      card.style.opacity = '1';
    }, 170);
  });
  paint();
}

function renderProcess() {
  const tabs = $('#process-tabs');
  const panel = $('#process-panel');
  const steps = siteData.caseStudy?.steps || [];
  if (!tabs || !panel || !steps.length) return;

  const paint = () => {
    tabs.innerHTML = steps.map((step, index) => `
      <button type="button" role="tab" aria-selected="${index === activeStep}" data-index="${index}">${escapeHtml(step.label)}</button>
    `).join('');
    const step = steps[activeStep];
    panel.innerHTML = `
      <span class="section-kicker">${escapeHtml(step.metric || 'Progressive disclosure')}</span>
      <h3>${escapeHtml(step.title)}</h3>
      <p>${escapeHtml(step.body)}</p>
      <span class="metric">${escapeHtml(step.metric || '')}</span>
    `;
    $$('button', tabs).forEach(button => {
      button.addEventListener('click', () => {
        activeStep = Number(button.dataset.index);
        paint();
      });
    });
  };
  paint();
}

function initContactForm() {
  const form = $('#contact-form');
  const status = $('#form-status');
  if (!form || !status) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent('Portfolio inquiry');
    const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
    status.textContent = 'Opening email draft...';
    window.setTimeout(() => {
      window.location.href = `mailto:${siteData.profile?.email || 'iqomagr13@gmail.com'}?subject=${subject}&body=${body}`;
      status.textContent = 'Success state: email draft is ready.';
    }, 350);
  });
}

function initReveal() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  items.forEach(item => observer.observe(item));
}

async function init() {
  initTheme();
  initHeroSpotlight();
  siteData = await loadData();
  renderProfile();
  renderExperience();
  renderProjects();
  initViewportSlider();
  renderSkills();
  renderTestimonials();
  renderProcess();
  initContactForm();
  initReveal();
}

init().catch(error => {
  console.error(error);
  const grid = $('#projects-grid');
  if (grid) grid.innerHTML = '<p class="role">Unable to load portfolio data. Please check data/portfolio-data.json.</p>';
});
