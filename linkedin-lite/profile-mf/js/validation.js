/* profile-mf validators. Returns { ok: boolean, errors: [{path, message}] }
   Paths use dot notation (e.g. "experience.0.title") so callers can highlight
   the right nested input. */
(function (global) {
  'use strict';

  const { MESSAGES } = global.ProfileMfConstants;
  const { isValidUrl } = global.ProfileMfUtils;

  function validate(payload) {
    const errors = [];

    if (payload.profilePictureUrl && !isValidUrl(payload.profilePictureUrl)) {
      errors.push({ path: 'profilePictureUrl', message: MESSAGES.INVALID_URL });
    }

    (payload.skills || []).forEach((s, i) => {
      if (!s.name || !s.name.trim()) {
        errors.push({ path: `skills.${i}.name`, message: MESSAGES.REQUIRED });
      }
    });

    (payload.education || []).forEach((e, i) => {
      if (!e.school || !e.school.trim()) {
        errors.push({ path: `education.${i}.school`, message: MESSAGES.REQUIRED });
      }
    });

    (payload.experience || []).forEach((x, i) => {
      if (!x.title || !x.title.trim()) {
        errors.push({ path: `experience.${i}.title`, message: MESSAGES.REQUIRED });
      }
      if (!x.company || !x.company.trim()) {
        errors.push({ path: `experience.${i}.company`, message: MESSAGES.REQUIRED });
      }
    });

    return { ok: errors.length === 0, errors };
  }

  global.ProfileMfValidation = Object.freeze({ validate });
})(window);
