(function (global) {
  'use strict';

  const initials = (name) =>
    (name || '').split(/\s+/).slice(0, 2).map((w) => w.charAt(0)).join('').toUpperCase() || '?';

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

  function formatType(t) {
    return String(t || '').replace('_', '-').toLowerCase();
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  global.JobMfUtils = Object.freeze({ initials, escapeHtml, debounce, formatType, formatDate });
})(window);
