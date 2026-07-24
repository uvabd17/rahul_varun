/* Dynamic MFE loader.
   1. Fetches the MFE's index.html.
   2. Extracts stylesheets (head) and scripts (anywhere) — every MFE is
      self-describing, no separate manifest of files per MFE.
   3. Injects the non-script body markup into the mount point.
   4. Ensures stylesheets are present exactly once.
   5. Re-loads every script in order so the MFE re-runs on each mount. */
(function (global) {
  'use strict';

  const { MOUNT_SELECTOR, LOADING_MARKUP, NOT_FOUND_MARKUP } = global.ShellConstants;
  const { ensureStylesheet, loadScriptFresh } = global.ShellUtils;

  let currentMfe = null;

  async function mount(mfeKey, mfeCfg) {
    const root = document.querySelector(MOUNT_SELECTOR);
    if (!root) return;

    root.innerHTML = LOADING_MARKUP;

    try {
      const html = await fetch(mfeCfg.htmlPath).then((r) => {
        if (!r.ok) throw new Error(`Cannot fetch ${mfeCfg.htmlPath}`);
        return r.text();
      });
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      // 1. Stylesheets from <head>.
      parsed.querySelectorAll('link[rel="stylesheet"][href]').forEach((link) => {
        ensureStylesheet(link.getAttribute('href'));
      });

      // 2. Scripts (extract before we detach body content).
      const scriptSrcs = [...parsed.querySelectorAll('script[src]')]
        .map((s) => s.getAttribute('src'));

      // 3. Body content minus scripts — scripts injected via innerHTML don't
      //    execute anyway, so removing them keeps the DOM clean.
      parsed.body.querySelectorAll('script').forEach((s) => s.remove());
      const fragment = document.createDocumentFragment();
      [...parsed.body.children].forEach((n) => fragment.appendChild(n));
      root.replaceChildren(fragment);

      // 4. Load every script in order. Sequential is important — later
      //    scripts often depend on globals set by earlier ones.
      for (const src of scriptSrcs) {
        await loadScriptFresh(src);
      }

      currentMfe = mfeKey;
    } catch (err) {
      console.error('MFE mount failed', err);
      root.innerHTML = `<div class="mfe-loading">Failed to load screen: ${err.message}</div>`;
    }
  }

  function notFound() {
    const root = document.querySelector(MOUNT_SELECTOR);
    if (root) root.innerHTML = NOT_FOUND_MARKUP;
    currentMfe = null;
  }

  global.ShellLoader = Object.freeze({
    mount,
    notFound,
    getCurrent: () => currentMfe,
  });
})(window);
