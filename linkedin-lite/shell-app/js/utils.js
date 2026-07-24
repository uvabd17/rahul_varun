/* Shell-side helpers. Pure functions only. */
(function (global) {
  'use strict';

  function currentHash() {
    // Empty hash → treat as "no route selected".
    return location.hash || '';
  }

  function findMfeForRoute(hash) {
    const { MFE_MANIFEST } = global.ShellConstants;
    return Object.entries(MFE_MANIFEST)
      .find(([, cfg]) => cfg.routes.includes(hash));
  }

  function ensureStylesheet(href) {
    if (document.querySelector(`link[data-mfe-href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.mfeHref = href;
    document.head.appendChild(link);
  }

  // Removes any previous instance so re-mounting the same MFE re-runs its init.
  function loadScriptFresh(src) {
    document.querySelectorAll(`script[data-mfe-src="${src}"]`).forEach((el) => el.remove());
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src + '?t=' + performance.now();  // Bust caching between mounts.
      script.dataset.mfeSrc = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  }

  global.ShellUtils = Object.freeze({
    currentHash,
    findMfeForRoute,
    ensureStylesheet,
    loadScriptFresh,
  });
})(window);
