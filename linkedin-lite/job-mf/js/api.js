(function (global) {
  'use strict';

  const { HttpClient } = global;
  const { ENDPOINTS } = global.JobMfConstants;

  function search({ q, type, location } = {}) {
    const params = new URLSearchParams();
    if (q)        params.set('q', q);
    if (type)     params.set('type', type);
    if (location) params.set('location', location);
    const qs = params.toString();
    return HttpClient.get(`${ENDPOINTS.SEARCH}${qs ? `?${qs}` : ''}`);
  }

  const applied      = ()          => HttpClient.get(ENDPOINTS.APPLIED);
  const get          = (id)        => HttpClient.get(ENDPOINTS.BY_ID(id));
  const create       = (body)      => HttpClient.post(ENDPOINTS.SEARCH, body);
  const update       = (id, body)  => HttpClient.put(ENDPOINTS.BY_ID(id), body);
  const setStatus    = (id, status)=> HttpClient.patch(ENDPOINTS.STATUS(id), { status });
  const remove       = (id)        => HttpClient.delete(ENDPOINTS.BY_ID(id));
  const applyToJob   = (id)        => HttpClient.post(ENDPOINTS.APPLY(id));
  const applicants   = (id)        => HttpClient.get(ENDPOINTS.APPLICANTS(id));

  global.JobMfApi = Object.freeze({
    search, applied, get, create, update, setStatus, remove, applyToJob, applicants,
  });
})(window);
