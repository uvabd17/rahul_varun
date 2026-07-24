/* profile-mf entry.
   Loads the current user's profile, renders view mode, and toggles to
   edit mode with typed lists for skills / education / experience. On
   save, PUT's the whole profile back and re-renders view mode. */
(function () {
  'use strict';

  const {
    HttpClient,
    UI,
    ProfileMfConstants,
    ProfileMfUtils,
    ProfileMfValidation,
    ProfileMfApi,
    ProfileMfEvents,
  } = window;

  const { MESSAGES, EMPTY_SKILL, EMPTY_EDUCATION, EMPTY_EXPERIENCE } = ProfileMfConstants;
  const {
    initialsOf, formatYearRange, escapeHtml,
    deepClone, intOrNull,
  } = ProfileMfUtils;

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  // `serverData` is what the backend last returned. `editData` is the
  // in-progress copy we mutate while the user edits.
  let serverData = null;
  let editData   = null;
  let editing    = false;

  // ------------------------------------------------------------------
  // Elements (cached at boot; the panels never disappear until unmount)
  // ------------------------------------------------------------------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const els = {
    loading:        $('[data-hook="loading"]'),
    body:           $('[data-hook="body"]'),

    // View
    avatarView:     $('[data-hook="avatar-view"]'),
    nameView:       $('[data-hook="name-view"]'),
    headlineView:   $('[data-hook="headline-view"]'),
    locationView:   $('[data-hook="location-view"]'),
    aboutView:      $('[data-hook="about-view"]'),
    experienceView: $('[data-hook="experience-view"]'),
    educationView:  $('[data-hook="education-view"]'),
    skillsView:     $('[data-hook="skills-view"]'),

    // Edit
    avatarEdit:     $('[data-hook="avatar-edit"]'),
    headerForm:     $('form[data-form="header"]'),
    bodyForm:       $('form[data-form="body"]'),
    experienceEdit: $('[data-hook="experience-edit"]'),
    educationEdit:  $('[data-hook="education-edit"]'),
    skillsEdit:     $('[data-hook="skills-edit"]'),
  };

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  async function boot() {
    try {
      const data = await ProfileMfApi.fetchMine();
      serverData = normalise(data);
      els.loading.hidden = true;
      els.body.hidden = false;
      showView('view');
      renderView();
    } catch (err) {
      els.loading.textContent = `${MESSAGES.LOAD_FAILED}: ${err.message}`;
    }
  }

  // Server may return null lists — normalise up-front so downstream code
  // can trust the shape.
  function normalise(data) {
    return {
      ...data,
      skills:     Array.isArray(data.skills)     ? data.skills     : [],
      education:  Array.isArray(data.education)  ? data.education  : [],
      experience: Array.isArray(data.experience) ? data.experience : [],
    };
  }

  // ------------------------------------------------------------------
  // View mode
  // ------------------------------------------------------------------
  function renderView() {
    const d = serverData;
    els.avatarView.replaceChildren(avatarNode(d));

    els.nameView.textContent     = `${d.firstName} ${d.lastName}`;
    els.headlineView.textContent = d.headline || 'Add a headline in edit mode.';
    els.locationView.textContent = d.location || '';

    // About
    if (d.about && d.about.trim()) {
      els.aboutView.textContent = d.about;
    } else {
      els.aboutView.innerHTML =
        '<span class="pf-empty">Nothing here yet. Click Edit profile to add a short about.</span>';
    }

    // Experience
    els.experienceView.replaceChildren(...d.experience.map(experienceItem));
    if (!d.experience.length) {
      els.experienceView.innerHTML = '<li class="pf-empty">No experience listed yet.</li>';
    }

    // Education
    els.educationView.replaceChildren(...d.education.map(educationItem));
    if (!d.education.length) {
      els.educationView.innerHTML = '<li class="pf-empty">No education listed yet.</li>';
    }

    // Skills
    els.skillsView.replaceChildren(...d.skills.map(skillChip));
    if (!d.skills.length) {
      els.skillsView.innerHTML = '<span class="pf-empty">No skills listed yet.</span>';
    }
  }

  function avatarNode(d) {
    if (d.profilePictureUrl) {
      const img = document.createElement('img');
      img.src = d.profilePictureUrl;
      img.alt = `${d.firstName} ${d.lastName}`;
      img.onerror = () => {
        // Bad URL — fall back to initials so the layout doesn't break.
        img.replaceWith(document.createTextNode(initialsOf(d.firstName, d.lastName)));
      };
      return img;
    }
    return document.createTextNode(initialsOf(d.firstName, d.lastName));
  }

  function experienceItem(item) {
    const el = document.createElement('li');
    el.className = 'pf-list__item';
    el.innerHTML = `
      <div class="pf-list__marker">${escapeHtml(initialsOf(item.company, ''))}</div>
      <div>
        <p class="pf-list__title">${escapeHtml(item.title)} <span class="pf-list__sub">at ${escapeHtml(item.company)}</span></p>
        <p class="pf-list__sub">
          ${escapeHtml(item.location || '')}
          ${item.location && (item.startYear || item.endYear || item.current) ? ' · ' : ''}
          ${escapeHtml(formatYearRange(item.startYear, item.endYear, item.current))}
        </p>
        ${item.description ? `<p class="pf-list__desc">${escapeHtml(item.description)}</p>` : ''}
      </div>`;
    return el;
  }

  function educationItem(item) {
    const el = document.createElement('li');
    el.className = 'pf-list__item';
    const sub = [item.degree, item.field].filter(Boolean).join(', ');
    el.innerHTML = `
      <div class="pf-list__marker">${escapeHtml(initialsOf(item.school, ''))}</div>
      <div>
        <p class="pf-list__title">${escapeHtml(item.school)}</p>
        <p class="pf-list__sub">
          ${escapeHtml(sub)}
          ${sub && (item.startYear || item.endYear) ? ' · ' : ''}
          ${escapeHtml(formatYearRange(item.startYear, item.endYear, false))}
        </p>
      </div>`;
    return el;
  }

  function skillChip(item) {
    const el = document.createElement('span');
    el.className = 'pf-chip';
    el.textContent = item.name;
    return el;
  }

  // ------------------------------------------------------------------
  // Edit mode
  // ------------------------------------------------------------------
  function enterEditMode() {
    editData = deepClone(serverData);
    editing = true;
    showView('edit');
    prefillHeaderForm();
    els.avatarEdit.replaceChildren(avatarNode(editData));
    prefillAboutTextarea();
    renderExperienceEdit();
    renderEducationEdit();
    renderSkillsEdit();
  }

  function cancelEdit() {
    editing = false;
    editData = null;
    showView('view');
    renderView();
  }

  function prefillHeaderForm() {
    els.headerForm.headline.value          = editData.headline || '';
    els.headerForm.location.value          = editData.location || '';
    els.headerForm.profilePictureUrl.value = editData.profilePictureUrl || '';
  }

  function prefillAboutTextarea() {
    const textarea = els.bodyForm.querySelector('textarea[name="about"]');
    if (textarea) textarea.value = editData.about || '';
  }

  function renderExperienceEdit() {
    els.experienceEdit.replaceChildren(
      ...editData.experience.map((row, index) => experienceRow(row, index))
    );
  }

  function renderEducationEdit() {
    els.educationEdit.replaceChildren(
      ...editData.education.map((row, index) => educationRow(row, index))
    );
  }

  function renderSkillsEdit() {
    els.skillsEdit.replaceChildren(
      ...editData.skills.map((row, index) => skillRow(row, index))
    );
  }

  // ------------------------------------------------------------------
  // Edit rows
  // ------------------------------------------------------------------
  function experienceRow(row, index) {
    const wrap = document.createElement('div');
    wrap.className = 'pf-editable__row';
    wrap.dataset.index = String(index);
    wrap.dataset.kind = 'experience';
    wrap.innerHTML = `
      <label class="pf-field">
        <span class="pf-field__label">Title</span>
        <input class="pf-field__input" type="text" data-key="title" maxlength="120">
      </label>
      <label class="pf-field">
        <span class="pf-field__label">Company</span>
        <input class="pf-field__input" type="text" data-key="company" maxlength="120">
      </label>
      <label class="pf-field">
        <span class="pf-field__label">Location</span>
        <input class="pf-field__input" type="text" data-key="location" maxlength="120">
      </label>
      <label class="pf-field">
        <span class="pf-field__label">Start year</span>
        <input class="pf-field__input" type="number" data-key="startYear" min="1950" max="2100" step="1">
      </label>
      <label class="pf-field">
        <span class="pf-field__label">End year</span>
        <input class="pf-field__input" type="number" data-key="endYear" min="1950" max="2100" step="1">
      </label>
      <label class="pf-editable__row__check">
        <input type="checkbox" data-key="current">
        <span>I currently work here</span>
      </label>
      <label class="pf-field pf-editable__row--wide">
        <span class="pf-field__label">Description</span>
        <textarea class="pf-field__input pf-field__textarea" data-key="description" rows="3" maxlength="2000"></textarea>
      </label>
      <button type="button" class="pf-remove-btn pf-editable__row__remove" data-action="remove-experience">Remove</button>
    `;
    // Prefill inputs
    setFieldValues(wrap, row);
    return wrap;
  }

  function educationRow(row, index) {
    const wrap = document.createElement('div');
    wrap.className = 'pf-editable__row';
    wrap.dataset.index = String(index);
    wrap.dataset.kind = 'education';
    wrap.innerHTML = `
      <label class="pf-field">
        <span class="pf-field__label">School</span>
        <input class="pf-field__input" type="text" data-key="school" maxlength="120">
      </label>
      <label class="pf-field">
        <span class="pf-field__label">Degree</span>
        <input class="pf-field__input" type="text" data-key="degree" maxlength="120">
      </label>
      <label class="pf-field">
        <span class="pf-field__label">Field</span>
        <input class="pf-field__input" type="text" data-key="field" maxlength="120">
      </label>
      <label class="pf-field">
        <span class="pf-field__label">Start year</span>
        <input class="pf-field__input" type="number" data-key="startYear" min="1950" max="2100" step="1">
      </label>
      <label class="pf-field">
        <span class="pf-field__label">End year</span>
        <input class="pf-field__input" type="number" data-key="endYear" min="1950" max="2100" step="1">
      </label>
      <button type="button" class="pf-remove-btn pf-editable__row__remove" data-action="remove-education">Remove</button>
    `;
    setFieldValues(wrap, row);
    return wrap;
  }

  function skillRow(row, index) {
    const wrap = document.createElement('span');
    wrap.className = 'pf-editable__chip-input';
    wrap.dataset.index = String(index);
    wrap.innerHTML = `
      <input type="text" data-key="name" placeholder="Add a skill" maxlength="60">
      <button type="button" class="pf-remove-btn" data-action="remove-skill" aria-label="Remove">×</button>
    `;
    setFieldValues(wrap, row);
    return wrap;
  }

  function setFieldValues(wrap, row) {
    wrap.querySelectorAll('[data-key]').forEach((input) => {
      const key = input.dataset.key;
      if (input.type === 'checkbox') input.checked = Boolean(row[key]);
      else input.value = row[key] ?? '';
    });
  }

  // ------------------------------------------------------------------
  // Collecting edit-mode state
  // ------------------------------------------------------------------
  function collectRows(container) {
    return [...container.children].map((wrap) => {
      const row = {};
      wrap.querySelectorAll('[data-key]').forEach((input) => {
        const key = input.dataset.key;
        if (input.type === 'checkbox') row[key] = input.checked;
        else if (input.type === 'number') row[key] = intOrNull(input.value);
        else row[key] = input.value.trim();
      });
      return row;
    });
  }

  function buildPayload() {
    const headerData = new FormData(els.headerForm);
    const aboutTextarea = els.bodyForm.querySelector('textarea[name="about"]');
    return {
      headline:          (headerData.get('headline')          || '').toString().trim(),
      location:          (headerData.get('location')          || '').toString().trim(),
      profilePictureUrl: (headerData.get('profilePictureUrl') || '').toString().trim(),
      about:             (aboutTextarea?.value || '').trim(),
      experience: collectRows(els.experienceEdit),
      education:  collectRows(els.educationEdit),
      skills:     collectRows(els.skillsEdit),
    };
  }

  async function save() {
    const payload = buildPayload();
    const { ok, errors } = ProfileMfValidation.validate(payload);
    if (!ok) {
      UI.error(errors[0].message);
      return;
    }

    try {
      const saved = await ProfileMfApi.updateProfile(serverData.userId, payload);
      serverData = normalise(saved);
      editing = false;
      editData = null;
      ProfileMfEvents.emitProfileUpdated(serverData);

      // Reflect the new headline in the shell nav / cached session.
      const session = HttpClient.session.get();
      if (session) HttpClient.session.set(session);   // trigger storage write (no-op logically)

      UI.success(MESSAGES.SAVED);
      showView('view');
      renderView();
    } catch (err) {
      UI.error(err.message || MESSAGES.SAVE_FAILED);
    }
  }

  // ------------------------------------------------------------------
  // View toggling
  // ------------------------------------------------------------------
  function showView(mode) {
    document.querySelectorAll('[data-view]').forEach((node) => {
      node.hidden = node.dataset.view !== mode;
    });
  }

  // ------------------------------------------------------------------
  // Wiring
  // ------------------------------------------------------------------
  // Pull all live edit-mode inputs back into editData. Called before
  // add/remove so re-rendering a list doesn't wipe values the user
  // just typed into other rows.
  function syncFromDom() {
    editData.headline          = (els.headerForm.headline?.value || '').trim();
    editData.location          = (els.headerForm.location?.value || '').trim();
    editData.profilePictureUrl = (els.headerForm.profilePictureUrl?.value || '').trim();
    const aboutTextarea = els.bodyForm.querySelector('textarea[name="about"]');
    if (aboutTextarea) editData.about = aboutTextarea.value.trim();
    editData.experience = collectRows(els.experienceEdit);
    editData.education  = collectRows(els.educationEdit);
    editData.skills     = collectRows(els.skillsEdit);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    switch (action) {
      case 'enter-edit':        return enterEditMode();
      case 'cancel-edit':       return cancelEdit();
      case 'add-experience':
        syncFromDom();
        editData.experience.push(EMPTY_EXPERIENCE());
        return renderExperienceEdit();
      case 'add-education':
        syncFromDom();
        editData.education.push(EMPTY_EDUCATION());
        return renderEducationEdit();
      case 'add-skill':
        syncFromDom();
        editData.skills.push(EMPTY_SKILL());
        return renderSkillsEdit();
      case 'remove-experience':
        return removeRow(btn, 'experience', renderExperienceEdit);
      case 'remove-education':
        return removeRow(btn, 'education', renderEducationEdit);
      case 'remove-skill':
        return removeRow(btn, 'skills', renderSkillsEdit);
      default: return;
    }
  });

  function removeRow(btn, key, rerender) {
    if (editing) syncFromDom();
    const wrap = btn.closest('[data-index]');
    const index = Number(wrap?.dataset.index);
    if (Number.isFinite(index)) {
      editData[key].splice(index, 1);
      rerender();
    }
  }

  // Both forms save the same payload — collecting from every input.
  els.headerForm.addEventListener('submit', (e) => { e.preventDefault(); save(); });
  els.bodyForm.addEventListener('submit',   (e) => { e.preventDefault(); save(); });

  boot();
})();
