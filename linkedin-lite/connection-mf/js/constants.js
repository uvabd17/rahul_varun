(function (global) {
  'use strict';

  global.ConnectionMfConstants = Object.freeze({
    ENDPOINTS: Object.freeze({
      USERS:       (q)   => `/users${q ? `?q=${encodeURIComponent(q)}` : ''}`,
      CONNECTIONS: '/connections',
      PENDING:     '/connections/pending',
      REQUEST:     '/connections/request',
      ACCEPT:      (id) => `/connections/${id}/accept`,
      REJECT:      (id) => `/connections/${id}/reject`,
      REMOVE:      (id) => `/connections/${id}`,
    }),

    TABS: Object.freeze({ FIND: 'find', PENDING: 'pending', CONNECTIONS: 'connections' }),

    MESSAGES: Object.freeze({
      SENT:        'Connection request sent',
      ACCEPTED:    'Connection accepted',
      REJECTED:    'Request rejected',
      REMOVED:     'Connection removed',
      CONFIRM_REM: 'Remove this connection?',
      EMPTY_FIND:  'No matching users.',
      EMPTY_PEND:  'No pending requests.',
      EMPTY_CONN:  'No connections yet.',
      LOAD_FAILED: 'Could not load',
      SELF:        'You cannot connect with yourself.',
    }),

    SEARCH_DEBOUNCE_MS: 250,
  });
})(window);
