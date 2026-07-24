(function () {
  'use strict';

  const { HttpClient, UI, JobMfConstants, JobMfUtils, JobMfApi, JobMfEvents } = window;
  const { TABS, MESSAGES, SEARCH_DEBOUNCE_MS } = JobMfConstants;
  const { initials, escapeHtml, debounce, formatType, formatDate } = JobMfUtils;

  const $ = (sel) => document.querySelector(sel);
  const els = {
    tabs:            Array.from(document.querySelectorAll('[data-action="tab"]')),
    panels:          Array.from(document.querySelectorAll('[data-panel]')),
    filtersForm:     $('form[data-form="filters"]'),
    browseList:      $('[data-hook="browse-list"]'),
    appliedList:     $('[data-hook="applied-list"]'),
    manageList:      $('[data-hook="manage-list"]'),
    composeForm:     $('form[data-form="upsert"]'),
    composeTitle:    $('[data-hook="compose-title"]'),
    composeSubmit:   $('[data-hook="compose-submit"]'),
    composeCancel:   document.querySelector('[data-action="reset-compose"]'),
    applicantsWrap:  $('[data-hook="applicants"]'),
    applicantsFor:   $('[data-hook="applicants-for"]'),
    applicantsList:  $('[data-hook="applicants-list"]'),
  };

  let currentTab = TABS.BROWSE;
  // Set of jobIds I've applied to — flips the Apply button to "Applied".
  const applied = new Set();

  const session = () => HttpClient.session.get();
  const isAdmin = () => session()?.user?.role === 'ADMIN';

  // ------------------------------------------------------------------
  // Panels + admin-only bits
  // ------------------------------------------------------------------
  function showPanel(name) {
    els.panels.forEach((p) => (p.hidden = p.dataset.panel !== name));
    els.tabs.forEach((t) => t.classList.toggle('jb-tab--active', t.dataset.tab === name));
  }

  function paintAdminChrome() {
    document.querySelectorAll('[data-admin-only]').forEach((el) => (el.hidden = !isAdmin()));
  }

  // ------------------------------------------------------------------
  // Browse
  // ------------------------------------------------------------------
  async function renderBrowse() {
    els.browseList.innerHTML = '<div class="jb-empty">Loading…</div>';
    try {
      const form = new FormData(els.filtersForm);
      const jobs = await JobMfApi.search({
        q:        form.get('q')        || '',
        type:     form.get('type')     || '',
        location: form.get('location') || '',
      });
      if (!jobs.length) {
        els.browseList.innerHTML = `<div class="jb-empty">${MESSAGES.EMPTY_BROWSE}</div>`;
        return;
      }
      els.browseList.replaceChildren(...jobs.map((j) => jobCard(j, { mode: 'browse' })));
    } catch (err) {
      els.browseList.innerHTML = `<div class="jb-empty">${escapeHtml(err.message || MESSAGES.LOAD_FAILED)}</div>`;
    }
  }

  // ------------------------------------------------------------------
  // Applied
  // ------------------------------------------------------------------
  async function renderApplied() {
    els.appliedList.innerHTML = '<div class="jb-empty">Loading…</div>';
    try {
      const apps = await JobMfApi.applied();
      apps.forEach((a) => applied.add(a.jobId));
      if (!apps.length) {
        els.appliedList.innerHTML = `<div class="jb-empty">${MESSAGES.EMPTY_APPLIED}</div>`;
        return;
      }
      els.appliedList.replaceChildren(...apps.map(applicationCard));
    } catch (err) {
      els.appliedList.innerHTML = `<div class="jb-empty">${escapeHtml(err.message)}</div>`;
    }
  }

  // ------------------------------------------------------------------
  // Manage (admin)
  // ------------------------------------------------------------------
  async function renderManage() {
    if (!isAdmin()) return;
    els.manageList.innerHTML = '<div class="jb-empty">Loading…</div>';
    try {
      const jobs = await JobMfApi.search({});
      if (!jobs.length) {
        els.manageList.innerHTML = `<div class="jb-empty">${MESSAGES.EMPTY_MANAGE}</div>`;
        return;
      }
      els.manageList.replaceChildren(...jobs.map((j) => jobCard(j, { mode: 'manage' })));
    } catch (err) {
      els.manageList.innerHTML = `<div class="jb-empty">${escapeHtml(err.message)}</div>`;
    }
  }

  // ------------------------------------------------------------------
  // Cards
  // ------------------------------------------------------------------
  function jobCard(job, { mode }) {
    const el = document.createElement('article');
    el.className = 'jb-card jb-card--collapsed';
    el.dataset.jobId = String(job.id);

    const alreadyApplied = applied.has(job.id);
    const canApply = mode === 'browse' && job.status === 'OPEN' && !alreadyApplied;
    const isOpen = job.status === 'OPEN';

    el.innerHTML = `
      <div class="jb-card__head">
        <div class="jb-card__logo">${escapeHtml(initials(job.company))}</div>
        <div>
          <h3 class="jb-card__title">${escapeHtml(job.title)}</h3>
          <p class="jb-card__company">${escapeHtml(job.company)}</p>
          <p class="jb-card__meta">
            ${escapeHtml(job.location || 'Remote')} · ${escapeHtml(formatDate(job.postedAt))}
            <span class="jb-pill jb-pill--type">${escapeHtml(formatType(job.jobType))}</span>
            <span class="jb-pill jb-pill--${isOpen ? 'open' : 'closed'}">${isOpen ? 'Open' : 'Closed'}</span>
          </p>
        </div>
        <div class="jb-card__actions">
          ${mode === 'browse' ? applyActions(job, canApply, alreadyApplied) : ''}
          ${mode === 'manage' ? manageActions(job)   : ''}
        </div>
      </div>
      <p class="jb-card__desc">${escapeHtml(job.description)}</p>
      <button class="jb-button jb-button--ghost" type="button" data-action="toggle-desc"
              style="align-self: flex-start; margin-top: 8px;">Show more</button>
    `;
    return el;
  }

  function applyActions(job, canApply, alreadyApplied) {
    if (alreadyApplied) return `<button class="jb-button jb-button--ghost" type="button" disabled>Applied</button>`;
    if (canApply)       return `<button class="jb-button" type="button" data-action="apply">Apply</button>`;
    return `<span class="jb-pill jb-pill--closed">Closed</span>`;
  }

  function manageActions(job) {
    const isOpen = job.status === 'OPEN';
    return `
      <button class="jb-button jb-button--ghost" type="button" data-action="edit">Edit</button>
      <button class="jb-button jb-button--ghost" type="button" data-action="toggle-status">
        ${isOpen ? 'Close' : 'Reopen'}
      </button>
      <button class="jb-button jb-button--ghost" type="button" data-action="view-applicants">Applicants</button>
      <button class="jb-button jb-button--danger" type="button" data-action="delete">Delete</button>
    `;
  }

  function applicationCard(app) {
    const el = document.createElement('article');
    el.className = 'jb-card';
    el.innerHTML = `
      <div class="jb-card__head">
        <div class="jb-card__logo">${escapeHtml(initials(app.jobCompany))}</div>
        <div>
          <h3 class="jb-card__title">${escapeHtml(app.jobTitle || 'Job')}</h3>
          <p class="jb-card__company">${escapeHtml(app.jobCompany || '')}</p>
          <p class="jb-card__meta">Applied ${escapeHtml(formatDate(app.appliedAt))} · Status: ${escapeHtml(app.status)}</p>
        </div>
      </div>
    `;
    return el;
  }

  function applicantRow(a) {
    const el = document.createElement('div');
    el.className = 'jb-card';
    el.innerHTML = `
      <p class="jb-card__title">${escapeHtml(`${a.applicantFirstName} ${a.applicantLastName}`)}</p>
      <p class="jb-card__meta">Applied ${escapeHtml(formatDate(a.appliedAt))} · ${escapeHtml(a.status)}</p>
    `;
    return el;
  }

  // ------------------------------------------------------------------
  // Compose (admin)
  // ------------------------------------------------------------------
  function resetComposeMode(job) {
    els.composeForm.reset();
    els.composeForm.id.value = job ? String(job.id) : '';
    els.composeTitle.textContent = job ? `Edit job` : 'Post a job';
    els.composeSubmit.textContent = job ? 'Save changes' : 'Post job';
    els.composeCancel.hidden = !job;
    if (job) {
      els.composeForm.title.value       = job.title;
      els.composeForm.company.value     = job.company;
      els.composeForm.location.value    = job.location || '';
      els.composeForm.description.value = job.description;
      els.composeForm.jobType.value     = job.jobType;
    }
  }

  async function submitCompose(e) {
    e.preventDefault();
    const form = new FormData(els.composeForm);
    const id = form.get('id');
    const payload = {
      title:       (form.get('title')       || '').toString().trim(),
      company:     (form.get('company')     || '').toString().trim(),
      location:    (form.get('location')    || '').toString().trim() || null,
      description: (form.get('description') || '').toString().trim(),
      jobType:     form.get('jobType') || 'FULL_TIME',
    };
    try {
      const job = id
        ? await JobMfApi.update(Number(id), payload)
        : await JobMfApi.create(payload);
      (id ? JobMfEvents.emitUpdated : JobMfEvents.emitPosted)(job);
      UI.success(id ? MESSAGES.UPDATED : MESSAGES.POSTED);
      resetComposeMode(null);
      renderManage();
    } catch (err) {
      UI.error(err.message);
    }
  }

  // ------------------------------------------------------------------
  // Delegated clicks
  // ------------------------------------------------------------------
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'tab') {
      currentTab = btn.dataset.tab;
      showPanel(currentTab);
      loadTab(currentTab);
      return;
    }
    if (action === 'reset-compose') return resetComposeMode(null);

    const card = btn.closest('.jb-card');
    if (!card) return;
    const jobId = Number(card.dataset.jobId);

    switch (action) {
      case 'toggle-desc':       return toggleDesc(card, btn);
      case 'apply':             return applyForJob(jobId, btn);
      case 'edit':              return editJob(jobId);
      case 'delete':            return deleteJob(jobId);
      case 'toggle-status':     return toggleJobStatus(jobId);
      case 'view-applicants':   return viewApplicants(jobId);
    }
  });

  function toggleDesc(card, btn) {
    const collapsed = card.classList.toggle('jb-card--collapsed');
    btn.textContent = collapsed ? 'Show more' : 'Show less';
  }

  async function applyForJob(id, btn) {
    btn.disabled = true;
    try {
      await JobMfApi.applyToJob(id);
      applied.add(id);
      JobMfEvents.emitApplied(id, session()?.user?.id);
      UI.success(MESSAGES.APPLIED);
      btn.textContent = 'Applied';
      btn.classList.add('jb-button--ghost');
    } catch (err) {
      UI.error(err.message);
      btn.disabled = false;
    }
  }

  async function editJob(id) {
    try {
      const job = await JobMfApi.get(id);
      resetComposeMode(job);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { UI.error(err.message); }
  }

  async function deleteJob(id) {
    if (!confirm(MESSAGES.CONFIRM_DEL)) return;
    try {
      await JobMfApi.remove(id);
      UI.success(MESSAGES.DELETED);
      renderManage();
    } catch (err) { UI.error(err.message); }
  }

  async function toggleJobStatus(id) {
    try {
      const job = await JobMfApi.get(id);
      const nextStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
      await JobMfApi.setStatus(id, nextStatus);
      UI.success(nextStatus === 'OPEN' ? MESSAGES.OPENED : MESSAGES.CLOSED);
      renderManage();
    } catch (err) { UI.error(err.message); }
  }

  async function viewApplicants(id) {
    try {
      const [job, apps] = await Promise.all([JobMfApi.get(id), JobMfApi.applicants(id)]);
      els.applicantsWrap.hidden = false;
      els.applicantsFor.textContent = `${job.title} @ ${job.company}`;
      els.applicantsList.replaceChildren(...apps.map(applicantRow));
      if (!apps.length) {
        els.applicantsList.innerHTML = '<div class="jb-empty">No applicants yet.</div>';
      }
      els.applicantsWrap.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      UI.error(err.message);
    }
  }

  // ------------------------------------------------------------------
  // Wire filters, compose
  // ------------------------------------------------------------------
  els.filtersForm.addEventListener('input', debounce(renderBrowse, SEARCH_DEBOUNCE_MS));
  els.filtersForm.addEventListener('change', renderBrowse);
  els.composeForm.addEventListener('submit', submitCompose);

  function loadTab(tab) {
    if (tab === TABS.BROWSE)  renderBrowse();
    if (tab === TABS.APPLIED) renderApplied();
    if (tab === TABS.MANAGE)  renderManage();
  }

  // Boot
  paintAdminChrome();
  showPanel(currentTab);
  renderBrowse();
})();
