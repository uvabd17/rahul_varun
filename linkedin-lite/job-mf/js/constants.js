(function (global) {
  'use strict';

  global.JobMfConstants = Object.freeze({
    ENDPOINTS: Object.freeze({
      SEARCH:     '/jobs',
      APPLIED:    '/jobs/applied',
      BY_ID:      (id) => `/jobs/${id}`,
      STATUS:     (id) => `/jobs/${id}/status`,
      APPLY:      (id) => `/jobs/${id}/apply`,
      APPLICANTS: (id) => `/jobs/${id}/applicants`,
    }),

    TABS:      Object.freeze({ BROWSE: 'browse', APPLIED: 'applied', MANAGE: 'manage' }),
    JOB_TYPES: Object.freeze(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),

    MESSAGES: Object.freeze({
      POSTED:        'Job posted',
      UPDATED:       'Job updated',
      DELETED:       'Job deleted',
      APPLIED:       'Application submitted',
      OPENED:        'Job re-opened',
      CLOSED:        'Job closed',
      EMPTY_BROWSE:  'No matching jobs.',
      EMPTY_APPLIED: 'You have not applied to any jobs yet.',
      EMPTY_MANAGE:  'No jobs posted yet.',
      CONFIRM_DEL:   'Delete this job?',
      LOAD_FAILED:   'Could not load',
    }),

    SEARCH_DEBOUNCE_MS: 250,
  });
})(window);
