/* profile-mf constants. Endpoints, messages, empty-item factories. */
(function (global) {
  'use strict';

  global.ProfileMfConstants = Object.freeze({
    ENDPOINTS: Object.freeze({
      ME:      '/profile/me',
      BY_ID:   (id) => `/profile/${id}`,
      PICTURE: (id) => `/profile/${id}/picture`,
    }),

    MESSAGES: Object.freeze({
      SAVED:         'Profile saved',
      LOAD_FAILED:   'Could not load your profile',
      SAVE_FAILED:   'Could not save the profile',
      INVALID_URL:   'Enter a valid URL',
      REQUIRED:      'This field is required',
    }),

    // Empty item shape when the user clicks "+ Add".
    // Kept as functions so each row gets a fresh object reference.
    EMPTY_SKILL:      () => ({ name: '' }),
    EMPTY_EDUCATION:  () => ({ school: '', degree: '', field: '', startYear: null, endYear: null }),
    EMPTY_EXPERIENCE: () => ({
      title: '', company: '', location: '',
      startYear: null, endYear: null,
      current: false, description: '',
    }),
  });
})(window);
