/* Shell-scoped constants. Route → MFE mapping lives here so adding a new
   MFE is a one-place edit. Each MFE is self-describing: it lists its own
   stylesheets and scripts inside its index.html, so the manifest just
   points at that entry file. */
(function (global) {
  'use strict';

  const { ROUTES } = global.SharedConstants;

  const MFE_MANIFEST = Object.freeze({
    'auth-mf': {
      routes:   [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.HOME],
      htmlPath: '/auth-mf/index.html',
    },
    'profile-mf': {
      routes:   [ROUTES.PROFILE],
      htmlPath: '/profile-mf/index.html',
    },
  });

  global.ShellConstants = Object.freeze({
    MFE_MANIFEST,
    MOUNT_SELECTOR:      '#mfe-root',
    NAV_SELECTOR:        '#site-nav',
    LOADING_MARKUP:      '<div class="mfe-loading">Loading…</div>',
    NOT_FOUND_MARKUP:    '<div class="mfe-loading">No screen matches this route.</div>',
    DEFAULT_ROUTE_AUTH:  ROUTES.HOME,
    DEFAULT_ROUTE_GUEST: ROUTES.LOGIN,
  });
})(window);
