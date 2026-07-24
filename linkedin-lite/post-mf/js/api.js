(function (global) {
  'use strict';

  const { HttpClient } = global;
  const { ENDPOINTS } = global.PostMfConstants;

  const list       = (q)      => HttpClient.get(`${ENDPOINTS.FEED}${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  const byUser     = (userId) => HttpClient.get(ENDPOINTS.BY_USER(userId));
  const create     = (body)   => HttpClient.post(ENDPOINTS.FEED, body);
  const update     = (id, b)  => HttpClient.put(ENDPOINTS.BY_ID(id), b);
  const remove     = (id)     => HttpClient.delete(ENDPOINTS.BY_ID(id));

  global.PostMfApi = Object.freeze({ list, byUser, create, update, remove });
})(window);
