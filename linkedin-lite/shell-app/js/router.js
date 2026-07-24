/* Hash router. Watches location.hash, looks up the owning MFE,
   guards protected routes, and delegates to the loader. */
(function (global) {
  'use strict';

  const { ROUTES } = global.SharedConstants;
  const { DEFAULT_ROUTE_AUTH, DEFAULT_ROUTE_GUEST } = global.ShellConstants;
  const { currentHash, findMfeForRoute } = global.ShellUtils;
  const { HttpClient } = global;

  // Routes that never require a session.
  const PUBLIC_ROUTES = new Set([ROUTES.LOGIN, ROUTES.REGISTER]);

  async function handle() {
    const session = HttpClient.session.get();
    let hash = currentHash();

    // Empty hash → land on the sensible default.
    if (!hash) {
      location.hash = session ? DEFAULT_ROUTE_AUTH : DEFAULT_ROUTE_GUEST;
      return;
    }

    // Guard protected routes.
    if (!session && !PUBLIC_ROUTES.has(hash)) {
      location.hash = DEFAULT_ROUTE_GUEST;
      return;
    }
    // If already signed in, skip the auth screens.
    if (session && PUBLIC_ROUTES.has(hash)) {
      location.hash = DEFAULT_ROUTE_AUTH;
      return;
    }

    const match = findMfeForRoute(hash);
    if (!match) {
      global.ShellLoader.notFound();
      return;
    }
    const [key, cfg] = match;

    // Same MFE already mounted → let it handle the new hash via its own
    // hashchange listener. Re-mounting would tear down its live DOM state.
    if (global.ShellLoader.getCurrent() === key) return;

    await global.ShellLoader.mount(key, cfg);
  }

  window.addEventListener('hashchange', handle);

  global.ShellRouter = Object.freeze({ handle });
})(window);
