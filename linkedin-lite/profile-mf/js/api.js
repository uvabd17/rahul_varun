/* profile-mf HTTP calls. Every request goes through shared HttpClient
   so the session header is attached in one place. */
(function (global) {
  'use strict';

  const { HttpClient } = global;
  const { ENDPOINTS } = global.ProfileMfConstants;

  async function fetchMine() {
    return HttpClient.get(ENDPOINTS.ME);
  }

  async function fetchOne(userId) {
    return HttpClient.get(ENDPOINTS.BY_ID(userId));
  }

  async function updateProfile(userId, payload) {
    return HttpClient.put(ENDPOINTS.BY_ID(userId), payload);
  }

  async function updatePicture(userId, url) {
    return HttpClient.post(ENDPOINTS.PICTURE(userId), { url });
  }

  global.ProfileMfApi = Object.freeze({ fetchMine, fetchOne, updateProfile, updatePicture });
})(window);
