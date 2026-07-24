/* Renders the top-nav based on whether there is an active session.
   Subscribes to USER_LOGIN and USER_LOGOUT so nav stays in sync. */
(function (global) {
  'use strict';

  const { HttpClient, EventBus, SharedConstants } = global;
  const { ROUTES, EVENTS } = SharedConstants;

  const navEl = () => document.querySelector(global.ShellConstants.NAV_SELECTOR);

  function render() {
    const nav = navEl();
    if (!nav) return;
    const session = HttpClient.session.get();
    nav.replaceChildren(session ? renderAuthed(session) : renderGuest());
  }

  function bindDelegatedClicks() {
    // One click listener on the nav container survives every re-render,
    // since the container element itself never gets replaced.
    const nav = navEl();
    if (nav && !nav.dataset.bound) {
      nav.addEventListener('click', onNavClick);
      nav.dataset.bound = 'true';
    }
  }

  function renderGuest() {
    const frag = document.createDocumentFragment();
    frag.appendChild(anchor('Sign in', ROUTES.LOGIN, 'site-nav__link'));
    frag.appendChild(anchor('Join now', ROUTES.REGISTER, 'site-nav__link site-nav__link--primary'));
    return frag;
  }

  function renderAuthed(session) {
    const frag = document.createDocumentFragment();

    frag.appendChild(anchor('Home',        ROUTES.HOME,        'site-nav__link'));
    frag.appendChild(anchor('Feed',        ROUTES.FEED,        'site-nav__link'));
    frag.appendChild(anchor('Connections', ROUTES.CONNECTIONS, 'site-nav__link'));
    frag.appendChild(anchor('Jobs',        ROUTES.JOBS,        'site-nav__link'));
    frag.appendChild(anchor('Profile',     ROUTES.PROFILE,     'site-nav__link'));

    const badge = document.createElement('span');
    badge.className = 'site-nav__user';
    badge.textContent = `${session.user.firstName} ${session.user.lastName}`;
    if (session.user.role === 'ADMIN') {
      const tag = document.createElement('span');
      tag.className = 'site-nav__badge';
      tag.textContent = 'Admin';
      badge.appendChild(tag);
    }
    frag.appendChild(badge);

    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'site-nav__link';
    logoutBtn.type = 'button';
    logoutBtn.dataset.action = 'logout';
    logoutBtn.textContent = 'Sign out';
    frag.appendChild(logoutBtn);

    return frag;
  }

  function anchor(text, href, cls) {
    const a = document.createElement('a');
    a.href = href;
    a.className = cls;
    a.textContent = text;
    return a;
  }

  async function onNavClick(e) {
    const btn = e.target.closest('[data-action="logout"]');
    if (!btn) return;
    e.preventDefault();
    try {
      await HttpClient.post('/auth/logout');
    } catch (err) {
      // Session is already dead as far as the user is concerned — proceed regardless.
      console.warn('Logout call failed, clearing local session anyway', err);
    }
    HttpClient.session.clear();
    EventBus.emit(EVENTS.USER_LOGOUT, {});
    global.UI.success('Signed out');
    location.hash = ROUTES.LOGIN;
    render();
  }

  // Any auth change → re-render nav.
  EventBus.on(EVENTS.USER_LOGIN,  render);
  EventBus.on(EVENTS.USER_LOGOUT, render);

  global.ShellNav = Object.freeze({ render, bindDelegatedClicks });
})(window);
