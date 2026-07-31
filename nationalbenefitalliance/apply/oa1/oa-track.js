/* apply/oa1/oa-track.js
 * OpenAI-source funnel conversion tracking.
 *
 * Fires the OpenAI "registration_completed" conversion whenever a visitor
 * clicks an OpenAI call button (tel:+12394569477). This is a PASSIVE listener:
 * it never calls preventDefault / stopPropagation, so the phone dials normally
 * and nothing about the link's native behavior changes.
 *
 * The OpenAI Pixel (window.oaiq) is loaded in the <head> of every apply/oa1
 * page; if for any reason it isn't ready yet, this no-ops silently.
 *
 * Only the OpenAI line fires the event — the footer main-site line
 * (tel:+18006058906) is intentionally ignored.
 */
(function () {
  var OPENAI_TEL = 'tel:+12394569477';
  document.addEventListener('click', function (e) {
    var a = (e.target && e.target.closest) ? e.target.closest('a[href^="tel:"]') : null;
    if (!a) return;
    if (a.getAttribute('href') !== OPENAI_TEL) return;   // only the OpenAI number
    if (typeof window.oaiq !== 'function') return;        // pixel not ready -> do nothing
    try {
      window.oaiq('measure', 'registration_completed', { type: 'customer_action' });
    } catch (err) { /* never interfere with the call */ }
  }, true);
})();
