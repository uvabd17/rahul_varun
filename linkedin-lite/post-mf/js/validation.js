(function (global) {
  'use strict';

  const { MESSAGES } = global.PostMfConstants;

  function validateContent(text) {
    return text && text.trim().length > 0 ? null : MESSAGES.REQUIRED;
  }

  global.PostMfValidation = Object.freeze({ validateContent });
})(window);
