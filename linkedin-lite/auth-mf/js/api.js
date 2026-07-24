/* HTTP calls owned by auth-mf. All go through the shared client so the
   session header is attached in one place. */
(function (global) {
  'use strict';

  const { HttpClient } = global;
  const { ENDPOINTS } = global.AuthMfConstants;

  async function register(payload) {
    return HttpClient.post(ENDPOINTS.REGISTER, payload);
  }

  async function login(payload) {
    return HttpClient.post(ENDPOINTS.LOGIN, payload);
  }

  async function listUsers(query) {
    const qs = query ? `?q=${encodeURIComponent(query)}` : '';
    return HttpClient.get(`${ENDPOINTS.USERS}${qs}`);
  }

  global.AuthMfApi = Object.freeze({ register, login, listUsers });
})(window);
