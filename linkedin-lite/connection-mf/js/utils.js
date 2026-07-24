(function (global) {
  'use strict';

  const initials = (f, l) =>
    `${(f || '').charAt(0)}${(l || '').charAt(0)}`.toUpperCase() || '?';

  const escapeHtml = (s) =>
    String(s ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;').replaceAll('"', '&quot;');

  function debounce(fn, wait) {
    let h;
    return function (...args) {
      clearTimeout(h);
      h = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  global.ConnectionMfUtils = Object.freeze({ initials, escapeHtml, debounce });
})(window);
