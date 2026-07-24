/* Tiny UI helpers. Kept intentionally small — this project is a learning surface,
   not a component library. */
(function (global) {
  'use strict';

  const TOAST_TTL_MS = 2400;

  function toast(message, variant) {
    const layer = ensureToastLayer();
    const el = document.createElement('div');
    el.className = `ui-toast ui-toast--${variant || 'info'}`;
    el.textContent = message;
    layer.appendChild(el);
    setTimeout(() => el.remove(), TOAST_TTL_MS);
  }

  function ensureToastLayer() {
    let layer = document.getElementById('ui-toast-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'ui-toast-layer';
      document.body.appendChild(layer);
    }
    return layer;
  }

  global.UI = Object.freeze({
    toast,
    success: (m) => toast(m, 'success'),
    error:   (m) => toast(m, 'error'),
  });
})(window);
