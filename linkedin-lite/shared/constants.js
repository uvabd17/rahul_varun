/* Cross-MFE constants. Anything the shell and every MFE agree on lives here. */
(function (global) {
  'use strict';

  global.SharedConstants = Object.freeze({
    API_BASE_URL: 'http://localhost:8080',

    SESSION_KEY: 'll.session',

    ROUTES: Object.freeze({
      LOGIN:    '#/login',
      REGISTER: '#/register',
      HOME:     '#/home',
      PROFILE:  '#/profile',
    }),

    EVENTS: Object.freeze({
      USER_REGISTERED:          'USER_REGISTERED',
      USER_LOGIN:               'USER_LOGIN',
      USER_LOGOUT:              'USER_LOGOUT',
      PROFILE_UPDATED:          'PROFILE_UPDATED',
      POST_CREATED:             'POST_CREATED',
      POST_UPDATED:             'POST_UPDATED',
      POST_DELETED:             'POST_DELETED',
      CONNECTION_REQUEST_SENT:  'CONNECTION_REQUEST_SENT',
      CONNECTION_ACCEPTED:      'CONNECTION_ACCEPTED',
      CONNECTION_REJECTED:      'CONNECTION_REJECTED',
      JOB_POSTED:               'JOB_POSTED',
      JOB_UPDATED:              'JOB_UPDATED',
      JOB_APPLIED:              'JOB_APPLIED',
    }),

    HEADERS: Object.freeze({
      SESSION_ID: 'X-Session-Id',
    }),
  });
})(window);
