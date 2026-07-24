/* auth-mf pure helpers. */
(function (global) {
  'use strict';

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function debounce(fn, wait) {
    let handle;
    return function debounced(...args) {
      clearTimeout(handle);
      handle = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Element-scoped query — every lookup is inside the MFE root so it survives
  // multiple mounts side-by-side without id collisions elsewhere on the page.
  function scoped(root) {
    return (selector) => root.querySelector(selector);
  }

  function scopedAll(root) {
    return (selector) => Array.from(root.querySelectorAll(selector));
  }

  global.AuthMfUtils = Object.freeze({ formatDate, debounce, scoped, scopedAll });
})(window);
