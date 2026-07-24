/* Bootstraps the shell after the DOM is ready. */
(function () {
  'use strict';

  function boot() {
    window.ShellNav.bindDelegatedClicks();
    window.ShellNav.render();
    window.ShellRouter.handle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
