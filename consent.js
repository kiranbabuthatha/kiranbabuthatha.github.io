/*
 * consent.js — cookie banner + consent-gated Google Tag Manager
 * kiranbabuthatha.com
 *
 * How it works
 * 1. On every page load, read the visitor's stored choice from localStorage.
 * 2. No choice yet  -> show the banner. Nothing from Google loads.
 *    "granted"       -> load GTM (GTM-W2QWPHV8). GTM then fires GA4 (G-Z27XQP488D).
 *    "denied"        -> load nothing.
 * 3. A "Cookie settings" link in the footer reopens the banner so the choice
 *    can be changed. Withdrawing consent deletes the GA cookies and reloads.
 *
 * GTM is only requested after "Accept", so no request goes to Google before
 * consent (stricter than Consent Mode "Basic"; see VG Hannover, March 2025).
 */
(function () {
  'use strict';

  var GTM_ID = 'GTM-W2QWPHV8';
  var STORAGE_KEY = 'kbt_analytics_consent'; // 'granted' | 'denied'
  var PRIVACY_URL = '/privacy/';

  // ---- storage helpers (localStorage can throw in private modes) ----------
  function readChoice() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  // ---- Google Tag Manager --------------------------------------------------
  var gtmLoaded = false;
  function loadGTM() {
    if (gtmLoaded) return;
    gtmLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }

    // Consent Mode signals, set before GTM reads the dataLayer.
    // Analytics is granted (the visitor just accepted); all ad signals stay
    // denied because this site runs no advertising.
    gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });

    // Standard GTM loader (same as Google's snippet, written out readably).
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    var first = document.getElementsByTagName('script')[0];
    first.parentNode.insertBefore(s, first);
  }

  // Remove GA cookies (_ga, _ga_XXXX) after consent is withdrawn.
  function deleteAnalyticsCookies() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        ['', '.' + host, host].forEach(function (domain) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' +
            (domain ? '; domain=' + domain : '');
        });
      }
    });
  }

  // ---- banner --------------------------------------------------------------
  var STYLE =
    '.kbt-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;' +
    'max-width:560px;margin:0 auto;padding:18px 20px;border:1px solid var(--line-strong,rgba(15,23,42,.2));' +
    'border-radius:8px;background:var(--bg,#fff);color:var(--ink,#0F172A);' +
    'box-shadow:0 8px 30px rgba(0,0,0,.12);font:15px/1.5 var(--sans,system-ui,sans-serif)}' +
    '.kbt-consent p{margin:0 0 14px}' +
    '.kbt-consent a{color:var(--accent,#0F766E);text-decoration:underline;text-underline-offset:3px}' +
    '.kbt-consent-actions{display:flex;gap:10px;flex-wrap:wrap}' +
    '.kbt-consent button{flex:1 1 140px;padding:10px 16px;border-radius:6px;cursor:pointer;' +
    'font:inherit;font-weight:600;border:1px solid var(--accent,#0F766E)}' +
    '.kbt-consent .kbt-accept{background:var(--accent,#0F766E);color:var(--accent-contrast,#fff)}' +
    '.kbt-consent .kbt-decline{background:transparent;color:var(--accent,#0F766E)}' +
    '.kbt-consent button:focus-visible{outline:2px solid var(--accent,#0F766E);outline-offset:2px}' +
    '.kbt-cookie-link{color:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer}';

  function injectStyle() {
    if (document.getElementById('kbt-consent-style')) return;
    var st = document.createElement('style');
    st.id = 'kbt-consent-style';
    st.textContent = STYLE;
    document.head.appendChild(st);
  }

  function closeBanner() {
    var el = document.getElementById('kbt-consent');
    if (el) el.parentNode.removeChild(el);
  }

  function showBanner() {
    if (document.getElementById('kbt-consent')) return;
    injectStyle();
    var box = document.createElement('div');
    box.id = 'kbt-consent';
    box.className = 'kbt-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Cookie consent');
    box.innerHTML =
      '<p>I use Google Analytics to see which pages are useful. It sets cookies and ' +
      'only runs if you accept. You can change this any time via ' +
      '“Cookie settings” in the footer. <a href="' + PRIVACY_URL + '">Privacy policy</a></p>' +
      '<div class="kbt-consent-actions">' +
      '<button type="button" class="kbt-decline">Decline</button>' +
      '<button type="button" class="kbt-accept">Accept</button>' +
      '</div>';

    box.querySelector('.kbt-accept').addEventListener('click', function () {
      saveChoice('granted');
      closeBanner();
      loadGTM();
    });
    box.querySelector('.kbt-decline').addEventListener('click', function () {
      var wasGranted = gtmLoaded;
      saveChoice('denied');
      closeBanner();
      if (wasGranted) {
        // GTM cannot be unloaded from a running page: clear cookies and reload.
        deleteAnalyticsCookies();
        location.reload();
      }
    });

    document.body.appendChild(box);
  }

  // ---- "Cookie settings" link in the footer -----------------------------
  function addSettingsLink() {
    var target = document.querySelector('.footer-inner') || document.querySelector('footer');
    if (!target || target.querySelector('.kbt-cookie-link')) return;
    injectStyle();
    var wrap = document.createElement('div');
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'kbt-cookie-link';
    link.textContent = 'Cookie settings';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      showBanner();
    });
    wrap.appendChild(link);
    target.appendChild(wrap);
  }

  // Exposed for testing in the console: kbtConsent.reset()
  window.kbtConsent = {
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      deleteAnalyticsCookies();
      location.reload();
    }
  };

  // ---- start ----------------------------------------------------------------
  function start() {
    var choice = readChoice();
    if (choice === 'granted') loadGTM();
    else if (choice !== 'denied') showBanner();
    addSettingsLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();