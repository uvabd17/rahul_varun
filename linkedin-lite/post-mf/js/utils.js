(function (global) {
  'use strict';

  function initials(first, last) {
    return `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase() || '?';
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    if (diff < 60_000) return 'just now';
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  }

  function debounce(fn, wait) {
    let h;
    return function (...args) {
      clearTimeout(h);
      h = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  global.PostMfUtils = Object.freeze({ initials, timeAgo, escapeHtml, debounce });
})(window);
