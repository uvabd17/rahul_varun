(function () {
  'use strict';

  const { HttpClient, UI, ConnectionMfConstants, ConnectionMfUtils, ConnectionMfApi, ConnectionMfEvents } = window;
  const { TABS, MESSAGES, SEARCH_DEBOUNCE_MS } = ConnectionMfConstants;
  const { initials, escapeHtml, debounce } = ConnectionMfUtils;

  const $ = (sel) => document.querySelector(sel);
  const els = {
    tabs:            Array.from(document.querySelectorAll('[data-action="tab"]')),
    panels:          Array.from(document.querySelectorAll('[data-panel]')),
    search:          $('[data-hook="search"]'),
    findList:        $('[data-hook="find-list"]'),
    pendingList:     $('[data-hook="pending-list"]'),
    connectionsList: $('[data-hook="connections-list"]'),
    pendingCount:    $('[data-hook="pending-count"]'),
  };

  let currentTab = TABS.FIND;
  // Track which users we've already sent to during this session, so
  // Connect buttons flip to "Requested" without a full reload.
  const sentTo = new Set();

  // ------------------------------------------------------------------
  // Panels
  // ------------------------------------------------------------------
  function showPanel(name) {
    els.panels.forEach((p) => (p.hidden = p.dataset.panel !== name));
    els.tabs.forEach((t) => t.classList.toggle('cn-tab--active', t.dataset.tab === name));
  }

  // ------------------------------------------------------------------
  // Find people
  // ------------------------------------------------------------------
  async function renderFind(query) {
    els.findList.innerHTML = '<div class="cn-empty">Loading…</div>';
    try {
      const users = await ConnectionMfApi.searchUsers(query);
      const myId = HttpClient.session.get()?.user?.id;
      const others = users.filter((u) => u.id !== myId);
      if (!others.length) {
        els.findList.innerHTML = `<div class="cn-empty">${MESSAGES.EMPTY_FIND}</div>`;
        return;
      }
      els.findList.replaceChildren(...others.map(userRow));
    } catch (err) {
      els.findList.innerHTML = `<div class="cn-empty">${escapeHtml(err.message || MESSAGES.LOAD_FAILED)}</div>`;
    }
  }

  function userRow(user) {
    const requested = sentTo.has(user.id);
    const row = document.createElement('div');
    row.className = 'cn-row';
    row.dataset.userId = String(user.id);
    row.innerHTML = `
      <div class="cn-row__avatar">${escapeHtml(initials(user.firstName, user.lastName))}</div>
      <div>
        <p class="cn-row__name">${escapeHtml(`${user.firstName} ${user.lastName}`)}</p>
        <p class="cn-row__meta">${escapeHtml(user.email)}</p>
      </div>
      <div class="cn-row__actions">
        <button class="cn-button ${requested ? 'cn-button--ghost' : ''}" type="button"
                data-action="connect" ${requested ? 'disabled' : ''}>
          ${requested ? 'Requested' : 'Connect'}
        </button>
      </div>
    `;
    return row;
  }

  // ------------------------------------------------------------------
  // Pending
  // ------------------------------------------------------------------
  async function renderPending() {
    els.pendingList.innerHTML = '<div class="cn-empty">Loading…</div>';
    try {
      const items = await ConnectionMfApi.listPending();
      updatePendingBadge(items.length);
      if (!items.length) {
        els.pendingList.innerHTML = `<div class="cn-empty">${MESSAGES.EMPTY_PEND}</div>`;
        return;
      }
      els.pendingList.replaceChildren(...items.map(pendingRow));
    } catch (err) {
      els.pendingList.innerHTML = `<div class="cn-empty">${escapeHtml(err.message)}</div>`;
    }
  }

  function pendingRow(c) {
    const row = document.createElement('div');
    row.className = 'cn-row';
    row.dataset.connectionId = String(c.id);
    row.innerHTML = `
      <div class="cn-row__avatar">${escapeHtml(initials(c.requesterFirstName, c.requesterLastName))}</div>
      <div>
        <p class="cn-row__name">${escapeHtml(`${c.requesterFirstName} ${c.requesterLastName}`)}</p>
        <p class="cn-row__meta">wants to connect</p>
      </div>
      <div class="cn-row__actions">
        <button class="cn-button" type="button" data-action="accept">Accept</button>
        <button class="cn-button cn-button--ghost" type="button" data-action="reject">Reject</button>
      </div>
    `;
    return row;
  }

  function updatePendingBadge(count) {
    els.pendingCount.textContent = String(count);
    els.pendingCount.hidden = count === 0;
  }

  // ------------------------------------------------------------------
  // Connections
  // ------------------------------------------------------------------
  async function renderConnections() {
    els.connectionsList.innerHTML = '<div class="cn-empty">Loading…</div>';
    try {
      const items = await ConnectionMfApi.listMine();
      if (!items.length) {
        els.connectionsList.innerHTML = `<div class="cn-empty">${MESSAGES.EMPTY_CONN}</div>`;
        return;
      }
      const myId = HttpClient.session.get()?.user?.id;
      els.connectionsList.replaceChildren(...items.map((c) => connectionRow(c, myId)));
    } catch (err) {
      els.connectionsList.innerHTML = `<div class="cn-empty">${escapeHtml(err.message)}</div>`;
    }
  }

  function connectionRow(c, myId) {
    // Show the "other" party's identity — whichever side we're on.
    const other = c.requesterId === myId
      ? { first: c.receiverFirstName,  last: c.receiverLastName }
      : { first: c.requesterFirstName, last: c.requesterLastName };

    const row = document.createElement('div');
    row.className = 'cn-row';
    row.dataset.connectionId = String(c.id);
    row.innerHTML = `
      <div class="cn-row__avatar">${escapeHtml(initials(other.first, other.last))}</div>
      <div>
        <p class="cn-row__name">${escapeHtml(`${other.first} ${other.last}`)}</p>
        <p class="cn-row__meta">Connected</p>
      </div>
      <div class="cn-row__actions">
        <button class="cn-button cn-button--danger" type="button" data-action="remove">Remove</button>
      </div>
    `;
    return row;
  }

  // ------------------------------------------------------------------
  // Delegated actions
  // ------------------------------------------------------------------
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    // Tabs
    if (btn.dataset.action === 'tab') {
      currentTab = btn.dataset.tab;
      showPanel(currentTab);
      loadTab(currentTab);
      return;
    }

    const row = btn.closest('.cn-row');
    if (!row) return;
    btn.disabled = true;
    try {
      switch (btn.dataset.action) {
        case 'connect':  return await onConnect(row, btn);
        case 'accept':   return await onAccept(row);
        case 'reject':   return await onReject(row);
        case 'remove':   return await onRemove(row);
      }
    } finally {
      btn.disabled = false;
    }
  });

  async function onConnect(row, btn) {
    const userId = Number(row.dataset.userId);
    try {
      await ConnectionMfApi.sendRequest(userId);
      sentTo.add(userId);
      ConnectionMfEvents.emitSent(HttpClient.session.get()?.user?.id, userId);
      btn.textContent = 'Requested';
      btn.classList.add('cn-button--ghost');
      UI.success(MESSAGES.SENT);
    } catch (err) {
      UI.error(err.message);
      btn.disabled = false;
    }
  }

  async function onAccept(row) {
    const id = Number(row.dataset.connectionId);
    try {
      await ConnectionMfApi.accept(id);
      ConnectionMfEvents.emitAccepted(id);
      UI.success(MESSAGES.ACCEPTED);
      renderPending();
    } catch (err) { UI.error(err.message); }
  }

  async function onReject(row) {
    const id = Number(row.dataset.connectionId);
    try {
      await ConnectionMfApi.reject(id);
      ConnectionMfEvents.emitRejected(id);
      UI.success(MESSAGES.REJECTED);
      renderPending();
    } catch (err) { UI.error(err.message); }
  }

  async function onRemove(row) {
    if (!confirm(MESSAGES.CONFIRM_REM)) return;
    const id = Number(row.dataset.connectionId);
    try {
      await ConnectionMfApi.remove(id);
      UI.success(MESSAGES.REMOVED);
      renderConnections();
    } catch (err) { UI.error(err.message); }
  }

  // ------------------------------------------------------------------
  // Tab loading
  // ------------------------------------------------------------------
  function loadTab(tab) {
    if (tab === TABS.PENDING) renderPending();
    if (tab === TABS.CONNECTIONS) renderConnections();
    // Find is search-driven; nothing to preload.
  }

  els.search.addEventListener('input',
    debounce((e) => renderFind(e.target.value.trim()), SEARCH_DEBOUNCE_MS));

  // Boot
  showPanel(currentTab);
  // Pending badge starts empty; refresh count in the background.
  renderPending();
})();
