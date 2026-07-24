/* auth-mf entry.
   Wires DOM elements, submits forms, renders the correct view for the
   current hash, and re-hydrates the home screen with the session data. */
(function () {
  'use strict';

  const {
    SharedConstants,
    HttpClient,
    UI,
    AuthMfConstants,
    AuthMfUtils,
    AuthMfValidation,
    AuthMfApi,
    AuthMfEvents,
  } = window;

  const { ROUTES } = SharedConstants;
  const { ROLES, VIEWS, ROUTE_TO_VIEW, MESSAGES, SEARCH_DEBOUNCE_MS } = AuthMfConstants;
  const { formatDate, debounce, scoped, scopedAll } = AuthMfUtils;

  // Root scope — everything auth-mf touches lives inside these panels.
  const root = document;   // panels are direct children of mfe-root
  const $ = scoped(root);
  const $$ = scopedAll(root);

  // Cache the elements that never change identity per render.
  const els = {
    panels:      $$('.auth-panel'),
    loginForm:   $('form[data-form="login"]'),
    regForm:     $('form[data-form="register"]'),
    homeWelcome: $('[data-hook="home-welcome"]'),
    factName:    $('[data-hook="fact-name"]'),
    factEmail:   $('[data-hook="fact-email"]'),
    factRole:    $('[data-hook="fact-role"]'),
    factSince:   $('[data-hook="fact-since"]'),
    adminPanel:  $('[data-hook="admin-panel"]'),
    adminTbody:  $('[data-hook="admin-tbody"]'),
    adminSearch: $('[data-hook="admin-search"]'),
  };

  // ------------------------------------------------------------------
  // View switching
  // ------------------------------------------------------------------
  function showView(view) {
    els.panels.forEach((panel) => {
      panel.hidden = panel.dataset.view !== view;
    });
  }

  function renderForCurrentHash() {
    const view = ROUTE_TO_VIEW[location.hash] || VIEWS.LOGIN;
    showView(view);
    if (view === VIEWS.HOME) hydrateHome();
  }

  // ------------------------------------------------------------------
  // Forms
  // ------------------------------------------------------------------
  function readForm(form) {
    const data = new FormData(form);
    const obj = {};
    for (const [k, v] of data.entries()) obj[k] = typeof v === 'string' ? v.trim() : v;
    return obj;
  }

  function paintFieldErrors(form, errors) {
    form.querySelectorAll('[data-error-for]').forEach((el) => (el.textContent = ''));
    form.querySelectorAll('input').forEach((el) => el.removeAttribute('aria-invalid'));

    Object.entries(errors).forEach(([field, message]) => {
      const slot = form.querySelector(`[data-error-for="${field}"]`);
      const input = form.querySelector(`[name="${field}"]`);
      if (slot) slot.textContent = message;
      if (input) input.setAttribute('aria-invalid', 'true');
    });
  }

  async function onLoginSubmit(e) {
    e.preventDefault();
    const payload = readForm(els.loginForm);
    const errors = AuthMfValidation.validateLogin(payload);
    if (Object.keys(errors).length) return paintFieldErrors(els.loginForm, errors);
    paintFieldErrors(els.loginForm, {});

    const submitBtn = els.loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const session = await AuthMfApi.login(payload);
      HttpClient.session.set(session);
      AuthMfEvents.emitLogin(session);
      UI.success(MESSAGES.LOGIN_OK);
      location.hash = ROUTES.HOME;
    } catch (err) {
      handleApiError(err, els.loginForm);
    } finally {
      submitBtn.disabled = false;
    }
  }

  async function onRegisterSubmit(e) {
    e.preventDefault();
    const raw = readForm(els.regForm);
    const payload = {
      firstName: raw.firstName,
      lastName:  raw.lastName,
      email:     raw.email,
      password:  raw.password,
      // Checkbox → role. Only "on" indicates admin — everything else is USER.
      role: raw.asAdmin === 'on' ? ROLES.ADMIN : ROLES.USER,
    };

    const errors = AuthMfValidation.validateRegister(payload);
    if (Object.keys(errors).length) return paintFieldErrors(els.regForm, errors);
    paintFieldErrors(els.regForm, {});

    const submitBtn = els.regForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const user = await AuthMfApi.register(payload);
      AuthMfEvents.emitRegistered(user);
      UI.success(MESSAGES.REGISTER_OK);
      // Prefill the login form's email so the user just types their password.
      els.loginForm.querySelector('[name="email"]').value = payload.email;
      location.hash = ROUTES.LOGIN;
    } catch (err) {
      handleApiError(err, els.regForm);
    } finally {
      submitBtn.disabled = false;
    }
  }

  function handleApiError(err, form) {
    if (err.fieldErrors?.length) {
      const errors = Object.fromEntries(err.fieldErrors.map((f) => [f.field, f.message]));
      paintFieldErrors(form, errors);
      return;
    }
    UI.error(err.message || MESSAGES.GENERIC_ERROR);
  }

  // ------------------------------------------------------------------
  // Home + admin
  // ------------------------------------------------------------------
  function hydrateHome() {
    const session = HttpClient.session.get();
    if (!session) return;

    const { firstName, lastName, email, role, createdAt } = session.user;
    els.homeWelcome.textContent = `Welcome, ${firstName}`;
    els.factName.textContent    = `${firstName} ${lastName}`;
    els.factEmail.textContent   = email;
    els.factRole.innerHTML      = rolePill(role);
    els.factSince.textContent   = formatDate(createdAt);

    if (role === ROLES.ADMIN) {
      els.adminPanel.hidden = false;
      loadAdminUsers('');
    } else {
      els.adminPanel.hidden = true;
    }
  }

  async function loadAdminUsers(query) {
    try {
      const users = await AuthMfApi.listUsers(query);
      els.adminTbody.replaceChildren(...users.map(userRow));
      if (!users.length) {
        els.adminTbody.innerHTML =
          '<tr><td colspan="5" class="home-admin__empty">No users match.</td></tr>';
      }
    } catch (err) {
      els.adminTbody.innerHTML =
        `<tr><td colspan="5" class="home-admin__empty">Failed to load users: ${err.message}</td></tr>`;
    }
  }

  function userRow(user) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(`${user.firstName} ${user.lastName}`)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${rolePill(user.role)}</td>
      <td>${statusPill(user.status)}</td>
      <td>${formatDate(user.createdAt)}</td>
    `;
    return tr;
  }

  function rolePill(role) {
    const cls = role === ROLES.ADMIN ? 'role-pill--admin' : 'role-pill--user';
    return `<span class="role-pill ${cls}">${role}</span>`;
  }

  function statusPill(status) {
    const cls = status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive';
    return `<span class="status-pill ${cls}">${status}</span>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  // ------------------------------------------------------------------
  // Bind + boot
  // ------------------------------------------------------------------
  els.loginForm.addEventListener('submit', onLoginSubmit);
  els.regForm.addEventListener('submit', onRegisterSubmit);
  els.adminSearch.addEventListener('input',
    debounce((e) => loadAdminUsers(e.target.value), SEARCH_DEBOUNCE_MS));

  // Re-render when the hash flips between routes this MFE owns.
  // Remove any prior listener from an earlier mount so handlers don't stack
  // when the shell tears this MFE down and re-mounts it.
  if (window.__authMfHashListener) {
    window.removeEventListener('hashchange', window.__authMfHashListener);
  }
  window.__authMfHashListener = renderForCurrentHash;
  window.addEventListener('hashchange', renderForCurrentHash);

  renderForCurrentHash();
})();
