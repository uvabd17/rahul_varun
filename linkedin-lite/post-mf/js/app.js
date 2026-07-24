(function () {
  'use strict';

  const { HttpClient, UI, PostMfConstants, PostMfUtils, PostMfValidation, PostMfApi, PostMfEvents } = window;
  const { TABS, MESSAGES, SEARCH_DEBOUNCE_MS } = PostMfConstants;
  const { initials, timeAgo, escapeHtml, debounce } = PostMfUtils;

  const $ = (sel) => document.querySelector(sel);
  const els = {
    feed:      $('[data-hook="feed"]'),
    search:    $('[data-hook="search"]'),
    form:      $('form[data-form="create"]'),
    tabs:      Array.from(document.querySelectorAll('[data-action="tab"]')),
  };

  let currentTab = TABS.FEED;
  let currentQuery = '';

  async function render() {
    els.feed.innerHTML = '<div class="pm-empty">Loading…</div>';
    try {
      const posts = currentTab === TABS.MINE
        ? await PostMfApi.byUser(HttpClient.session.get().user.id)
        : await PostMfApi.list(currentQuery);

      if (!posts.length) {
        els.feed.innerHTML = `<div class="pm-empty">${
          currentTab === TABS.MINE ? MESSAGES.EMPTY_MINE : MESSAGES.EMPTY_FEED
        }</div>`;
        return;
      }
      els.feed.replaceChildren(...posts.map(postCard));
    } catch (err) {
      els.feed.innerHTML = `<div class="pm-empty">${escapeHtml(err.message || MESSAGES.LOAD_FAILED)}</div>`;
    }
  }

  function postCard(post) {
    const session = HttpClient.session.get();
    const myId = session?.user?.id;
    const isMine = post.authorId === myId;
    const isAdmin = session?.user?.role === 'ADMIN';

    const el = document.createElement('article');
    el.className = 'pm-post';
    el.dataset.postId = String(post.id);
    el.innerHTML = `
      <div class="pm-post__head">
        <div class="pm-post__avatar">${escapeHtml(initials(post.authorFirstName, post.authorLastName))}</div>
        <div>
          <p class="pm-post__author">${escapeHtml(`${post.authorFirstName} ${post.authorLastName}`)}</p>
          <p class="pm-post__meta">${escapeHtml(timeAgo(post.createdAt))}${post.updatedAt ? ' · edited' : ''}</p>
        </div>
        <div class="pm-post__actions">
          ${isMine ? `<button class="pm-icon-btn" type="button" data-action="edit">Edit</button>` : ''}
          ${(isMine || isAdmin) ? `<button class="pm-icon-btn pm-icon-btn--danger" type="button" data-action="delete">Delete</button>` : ''}
        </div>
      </div>

      <div class="pm-post__content-view">
        <p class="pm-post__content">${escapeHtml(post.content)}</p>
        ${post.imageUrl ? `<img class="pm-post__image" src="${escapeHtml(post.imageUrl)}" alt="Post image" onerror="this.remove()">` : ''}
      </div>

      <div class="pm-post__edit">
        <textarea data-hook="edit-content" rows="3" maxlength="3000">${escapeHtml(post.content)}</textarea>
        <input type="url" data-hook="edit-url" placeholder="Image URL (optional)" value="${escapeHtml(post.imageUrl || '')}" maxlength="500">
        <div class="pm-post__edit-row">
          <button class="pm-button pm-button--ghost" type="button" data-action="cancel-edit">Cancel</button>
          <button class="pm-button" type="button" data-action="save-edit">Save</button>
        </div>
      </div>
    `;
    return el;
  }

  // ------------------------------------------------------------------
  // Form submit — create
  // ------------------------------------------------------------------
  els.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(els.form);
    const content = (data.get('content') || '').toString();
    const err = PostMfValidation.validateContent(content);
    if (err) { UI.error(err); return; }
    const btn = els.form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const post = await PostMfApi.create({
        content: content.trim(),
        imageUrl: (data.get('imageUrl') || '').toString().trim() || null,
      });
      PostMfEvents.emitCreated(post);
      UI.success(MESSAGES.POSTED);
      els.form.reset();
      currentTab = TABS.FEED;
      updateTabs();
      render();
    } catch (err) {
      UI.error(err.message || MESSAGES.REQUIRED);
    } finally {
      btn.disabled = false;
    }
  });

  // ------------------------------------------------------------------
  // Delegated actions on the feed
  // ------------------------------------------------------------------
  els.feed.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const card = btn.closest('.pm-post');
    if (!card) return;
    const id = Number(card.dataset.postId);

    switch (btn.dataset.action) {
      case 'edit':        return card.classList.add('pm-post--editing');
      case 'cancel-edit': return card.classList.remove('pm-post--editing');
      case 'save-edit':   return saveEdit(card, id);
      case 'delete':      return doDelete(id);
    }
  });

  async function saveEdit(card, id) {
    const content  = card.querySelector('[data-hook="edit-content"]').value.trim();
    const imageUrl = card.querySelector('[data-hook="edit-url"]').value.trim();
    const err = PostMfValidation.validateContent(content);
    if (err) { UI.error(err); return; }
    try {
      const post = await PostMfApi.update(id, { content, imageUrl: imageUrl || null });
      PostMfEvents.emitUpdated(post);
      UI.success(MESSAGES.UPDATED);
      render();
    } catch (err) {
      UI.error(err.message);
    }
  }

  async function doDelete(id) {
    if (!confirm(MESSAGES.CONFIRM_DEL)) return;
    try {
      await PostMfApi.remove(id);
      PostMfEvents.emitDeleted(id);
      UI.success(MESSAGES.DELETED);
      render();
    } catch (err) {
      UI.error(err.message);
    }
  }

  // ------------------------------------------------------------------
  // Tabs + search
  // ------------------------------------------------------------------
  els.tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      updateTabs();
      render();
    });
  });

  function updateTabs() {
    els.tabs.forEach((b) => b.classList.toggle('pm-tab--active', b.dataset.tab === currentTab));
  }

  els.search.addEventListener('input', debounce((e) => {
    currentQuery = e.target.value.trim();
    // Search only makes sense on Feed tab; if we're on Mine, switch to Feed.
    if (currentQuery && currentTab !== TABS.FEED) {
      currentTab = TABS.FEED;
      updateTabs();
    }
    render();
  }, SEARCH_DEBOUNCE_MS));

  // Boot
  updateTabs();
  render();
})();
