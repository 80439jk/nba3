(function () {
  var DELAY = 30000;
  var SESSION_KEY = 'nba_popup_shown';
  var PHONE_DISPLAY = '1-813-556-9953';
  var PHONE_TEL = 'tel:+18135569953';
  var REF_FALLBACK = '59952';

  if (sessionStorage.getItem(SESSION_KEY)) return;

  var timer;

  function getRefNumber() {
    var el = document.getElementById('refNumber');
    return (el && el.textContent.trim()) || REF_FALLBACK;
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '.nba-popup-overlay{position:fixed;inset:0;background:rgba(26,43,71,.82);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem;backdrop-filter:blur(2px)}',
      '.nba-popup-card{background:#fff;border-radius:1rem;box-shadow:0 20px 60px -10px rgba(0,0,0,.45);max-width:440px;width:100%;overflow:hidden;position:relative;animation:nba-popup-in .25s ease-out}',
      '@keyframes nba-popup-in{from{opacity:0;transform:scale(.93) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}',
      '.nba-popup-bar{height:5px;background:#f59e0b}',
      '.nba-popup-close{position:absolute;top:.85rem;right:.85rem;background:#f3f4f6;border:none;border-radius:50%;width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6b7280;transition:background .15s,color .15s}',
      '.nba-popup-close:hover{background:#e5e7eb;color:#1a2b47}',
      '.nba-popup-body{padding:1.75rem 2rem 1.75rem;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
      '.nba-popup-header{display:flex;align-items:center;gap:.75rem;margin-bottom:1rem}',
      '.nba-popup-icon{flex-shrink:0;width:2.5rem;height:2.5rem;background:#fffbeb;border:2px solid #fef3c7;border-radius:50%;display:flex;align-items:center;justify-content:center}',
      '.nba-popup-icon svg{width:1.25rem;height:1.25rem;color:#f59e0b}',
      '.nba-popup-title{font-family:"Poppins","Segoe UI",system-ui,sans-serif;font-size:1.25rem;font-weight:700;color:#1a2b47;margin:0;line-height:1.2}',
      '.nba-popup-text{font-size:.9375rem;color:#374151;line-height:1.6;margin:0 0 1rem}',
      '.nba-popup-text strong{color:#1a2b47;font-weight:600;white-space:nowrap}',
      '.nba-popup-ref{font-size:.875rem;color:#6b7280;margin:0 0 1.25rem}',
      '.nba-popup-call-btn{display:flex;align-items:center;justify-content:center;gap:.625rem;width:100%;box-sizing:border-box;padding:.875rem 1rem;background:#f59e0b;color:#1a2b47;font-family:"Poppins","Segoe UI",system-ui,sans-serif;font-size:1rem;font-weight:700;border-radius:.625rem;text-decoration:none;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(245,158,11,.35);transition:background .15s,box-shadow .15s}',
      '.nba-popup-call-btn:hover{background:#d97706;box-shadow:0 6px 18px rgba(245,158,11,.45)}',
      '.nba-popup-call-btn svg{width:1.125rem;height:1.125rem;flex-shrink:0}'
    ].join('');
    document.head.appendChild(style);
  }

  function buildPopup() {
    var phoneIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.21 12 19.79 19.79 0 0 1 1.14 3.38 2 2 0 0 1 3.11 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    var closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    var overlay = document.createElement('div');
    overlay.className = 'nba-popup-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Are you still there?');

    overlay.innerHTML =
      '<div class="nba-popup-card">' +
        '<div class="nba-popup-bar"></div>' +
        '<button class="nba-popup-close" aria-label="Close">' + closeIcon + '</button>' +
        '<div class="nba-popup-body">' +
          '<div class="nba-popup-header">' +
            '<div class="nba-popup-icon">' + phoneIcon + '</div>' +
            '<h2 class="nba-popup-title">Are you still there?</h2>' +
          '</div>' +
          '<p class="nba-popup-text">If you\'d like to speak with a Case Manager from National Benefit Alliance about your hardship and explore available assistance and benefits, please call us at <strong>' + PHONE_DISPLAY + '</strong>.</p>' +
          '<p class="nba-popup-ref">Your reference number: ' + getRefNumber() + '</p>' +
          '<a href="' + PHONE_TEL + '" class="nba-popup-call-btn">' + phoneIcon + 'Call Now</a>' +
        '</div>' +
      '</div>';

    function close() {
      sessionStorage.setItem(SESSION_KEY, '1');
      document.body.removeChild(overlay);
    }

    overlay.querySelector('.nba-popup-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    document.body.appendChild(overlay);
  }

  function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      sessionStorage.setItem(SESSION_KEY, '1');
      injectStyles();
      buildPopup();
    }, DELAY);
  }

  document.addEventListener('mousemove', resetTimer, { passive: true });
  document.addEventListener('touchstart', resetTimer, { passive: true });
  document.addEventListener('touchmove', resetTimer, { passive: true });

  resetTimer();
})();
