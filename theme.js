/* Theme switcher — cycles auto → light → dark.
   "auto" removes html[data-theme] so CSS light-dark() follows the browser
   preference; explicit modes pin color-scheme via the attribute. The chosen
   mode persists in localStorage and is re-applied before first paint by the
   inline snippet in each page's <head>. */
(function () {
  var root = document.documentElement;
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;

  var ORDER = ['auto', 'light', 'dark'];
  var LABELS = {
    auto: 'Theme: auto, follows browser setting',
    light: 'Theme: light',
    dark: 'Theme: dark'
  };

  function current() {
    var t = root.getAttribute('data-theme');
    return t === 'light' || t === 'dark' ? t : 'auto';
  }

  function apply(mode) {
    if (mode === 'auto') {
      root.removeAttribute('data-theme');
      try { localStorage.removeItem('theme'); } catch (e) {}
    } else {
      root.setAttribute('data-theme', mode);
      try { localStorage.setItem('theme', mode); } catch (e) {}
    }
    btn.setAttribute('aria-label', LABELS[mode] + '. Activate to switch.');
    btn.title = LABELS[mode];
  }

  btn.addEventListener('click', function () {
    apply(ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length]);
  });

  apply(current());
})();
