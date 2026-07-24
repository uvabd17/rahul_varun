/* auth-mf constants. Endpoints, messages, and DOM selectors — the MFE
   never carries a bare string literal in logic code. */
(function (global) {
  'use strict';

  global.AuthMfConstants = Object.freeze({
    ENDPOINTS: Object.freeze({
      REGISTER: '/auth/register',
      LOGIN:    '/auth/login',
      LOGOUT:   '/auth/logout',
      USERS:    '/users',
    }),

    ROLES: Object.freeze({
      USER:  'USER',
      ADMIN: 'ADMIN',
    }),

    VIEWS: Object.freeze({
      LOGIN:    'login',
      REGISTER: 'register',
      HOME:     'home',
    }),

    ROUTE_TO_VIEW: Object.freeze({
      '#/login':    'login',
      '#/register': 'register',
      '#/home':     'home',
    }),

    MESSAGES: Object.freeze({
      LOGIN_OK:          'Welcome back',
      REGISTER_OK:       'Account created — please sign in',
      INVALID_LOGIN:     'Invalid email or password',
      GENERIC_ERROR:     'Something went wrong — please try again',
      REQUIRED_FIELD:    'This field is required',
      INVALID_EMAIL:     'Enter a valid email',
      PASSWORD_TOO_SHORT:'Password must be at least 8 characters',
    }),

    SEARCH_DEBOUNCE_MS: 250,
  });
})(window);
