/* Thin fetch wrapper.
   Attaches the session header, decodes the standard envelope, normalises errors.
   Every MFE goes through this — never fetch() directly. */
(function (global) {
  'use strict';

  const { API_BASE_URL, SESSION_KEY, HEADERS } = global.SharedConstants;

  function readSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch (_) {
      return null;
    }
  }

  function writeSession(session) {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  }

  async function request(method, path, body) {
    const session = readSession();
    const headers = { 'Content-Type': 'application/json' };
    if (session?.sessionId) headers[HEADERS.SESSION_ID] = session.sessionId;

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });

    // 204 has no body.
    const payload = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
      const err = new Error(payload?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.code = payload?.code;
      err.fieldErrors = payload?.fieldErrors || [];
      throw err;
    }
    // Backend envelope: { success, data, message, timestamp } — MFE code only cares about `data`.
    return payload?.data ?? payload;
  }

  global.HttpClient = Object.freeze({
    get:    (path)         => request('GET',    path),
    post:   (path, body)   => request('POST',   path, body),
    put:    (path, body)   => request('PUT',    path, body),
    patch:  (path, body)   => request('PATCH',  path, body),
    delete: (path)         => request('DELETE', path),
    session: {
      get:   readSession,
      set:   writeSession,
      clear: () => writeSession(null),
    },
  });
})(window);
