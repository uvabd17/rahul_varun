/* profile-mf pure helpers. */
(function (global) {
  'use strict';

  function initialsOf(firstName, lastName) {
    const f = (firstName || '').trim();
    const l = (lastName || '').trim();
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || '?';
  }

  // Renders "2019 – 2022", "2020 – Present", or the single year, honouring
  // the `current` flag on experience rows.
  function formatYearRange(startYear, endYear, current) {
    if (!startYear && !endYear) return '';
    if (current) return `${startYear || '?'} – Present`;
    if (startYear && endYear) return `${startYear} – ${endYear}`;
    return String(startYear || endYear);
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // Turn a year <input> value into either an int or null (empty).
  function intOrNull(raw) {
    if (raw === '' || raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }

  function isValidUrl(value) {
    if (!value) return true;   // empty means "no picture" — allowed
    try { new URL(value); return true; }
    catch (_) { return false; }
  }

  global.ProfileMfUtils = Object.freeze({
    initialsOf,
    formatYearRange,
    escapeHtml,
    deepClone,
    intOrNull,
    isValidUrl,
  });
})(window);
