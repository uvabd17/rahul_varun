/* Field-level validators. Return null when OK, or an error message string.
   Aggregated by app.js which paints per-field errors in the form. */
(function (global) {
  'use strict';

  const { MESSAGES } = global.AuthMfConstants;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function required(value) {
    return value && value.trim().length > 0 ? null : MESSAGES.REQUIRED_FIELD;
  }

  function email(value) {
    if (required(value)) return required(value);
    return EMAIL_RE.test(value.trim()) ? null : MESSAGES.INVALID_EMAIL;
  }

  function password(value) {
    if (required(value)) return required(value);
    return value.length >= 8 ? null : MESSAGES.PASSWORD_TOO_SHORT;
  }

  function validateLogin(payload) {
    return prune({
      email:    email(payload.email),
      password: required(payload.password),
    });
  }

  function validateRegister(payload) {
    return prune({
      firstName: required(payload.firstName),
      lastName:  required(payload.lastName),
      email:     email(payload.email),
      password:  password(payload.password),
    });
  }

  function prune(errors) {
    return Object.fromEntries(
      Object.entries(errors).filter(([, v]) => v !== null)
    );
  }

  global.AuthMfValidation = Object.freeze({ validateLogin, validateRegister });
})(window);
