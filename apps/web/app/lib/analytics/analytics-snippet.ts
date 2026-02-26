/**
 * Analytics Snippet Generator
 *
 * Generates a self-contained IIFE <script> tag injected into published pages.
 * The snippet:
 *   1. Generates / restores a sessionId from sessionStorage
 *   2. Detects deviceType from navigator.userAgent
 *   3. Fires a pageview event immediately (via requestIdleCallback)
 *   4. Uses IntersectionObserver to fire section_view events
 *   5. Tracks scroll depth (debounced, reports 25 / 50 / 75 / 100%)
 *   6. Tracks CTA clicks on [data-cta] elements
 *   7. Batches events and POSTs to /api/builder/analytics every 5 s
 *      or on visibilitychange (page hidden)
 *   8. Never blocks page render
 *
 * Security: token is a daily-rotating HMAC — never a secret key.
 */

export function generateAnalyticsSnippet(
  pageId: string,
  storeId: number,
  token: string
): string {
  // Sanitise values embedded in the script
  const safePageId = JSON.stringify(pageId);
  const safeStoreId = String(Number(storeId));
  const safeToken = JSON.stringify(token);

  return `<script>(function(){
  'use strict';

  /* ── Config ─────────────────────────────────────────── */
  var PAGE_ID   = ${safePageId};
  var STORE_ID  = ${safeStoreId};
  var TOKEN     = ${safeToken};
  var ENDPOINT  = '/api/builder/analytics';
  var FLUSH_MS  = 5000;

  /* ── Session ID ─────────────────────────────────────── */
  var SESSION_KEY = 'ozz_sid_' + PAGE_ID;
  var sessionId = '';
  try {
    sessionId = sessionStorage.getItem(SESSION_KEY) || '';
    if (!sessionId) {
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
  } catch(e) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  /* ── Device Detection ───────────────────────────────── */
  var ua = navigator.userAgent || '';
  var deviceType = /Mobi|Android|iPhone|iPod|BlackBerry|IEMobile/i.test(ua)
    ? 'mobile'
    : /iPad|Tablet|PlayBook/i.test(ua)
      ? 'tablet'
      : 'desktop';

  /* ── Event Queue ────────────────────────────────────── */
  var queue = [];

  function pushEvent(type, extra) {
    var evt = {
      type: type,
      sessionId: sessionId,
      deviceType: deviceType,
      referrer: document.referrer || undefined,
    };
    if (extra) {
      for (var k in extra) { if (extra[k] !== undefined) evt[k] = extra[k]; }
    }
    queue.push(evt);
    if (queue.length >= 50) flush();
  }

  /* ── Flush ──────────────────────────────────────────── */
  function flush() {
    if (!queue.length) return;
    var payload = JSON.stringify({
      pageId:  PAGE_ID,
      storeId: STORE_ID,
      token:   TOKEN,
      events:  queue.splice(0, 50),
    });
    // Use sendBeacon when available (survives page unload), else fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(function(){});
    }
  }

  /* ── Scroll Depth Tracking ──────────────────────────── */
  var scrollReported = {};
  var scrollTimer;
  function onScroll() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function() {
      var el = document.documentElement;
      var scrolled = el.scrollTop + window.innerHeight;
      var total = el.scrollHeight;
      if (!total) return;
      var pct = Math.round((scrolled / total) * 100);
      [25, 50, 75, 100].forEach(function(mark) {
        if (pct >= mark && !scrollReported[mark]) {
          scrollReported[mark] = true;
          pushEvent('scroll_depth', { scrollDepth: mark });
        }
      });
    }, 200);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Section IntersectionObserver ───────────────────── */
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          pushEvent('section_view', {
            sectionId:   el.dataset.sectionId   || undefined,
            sectionType: el.dataset.sectionType  || undefined,
          });
          sectionObs.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    function observeSections() {
      var sections = document.querySelectorAll('[data-section-id]');
      sections.forEach(function(s) { sectionObs.observe(s); });
    }
    // Observe after DOM settles
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeSections);
    } else {
      observeSections();
    }
  }

  /* ── CTA Click Tracking ─────────────────────────────── */
  document.addEventListener('click', function(e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-cta]') : null;
    if (!el) return;
    pushEvent('cta_click', {
      sectionId:   el.dataset.sectionId   || undefined,
      sectionType: el.dataset.sectionType  || undefined,
    });
  }, { passive: true });

  /* ── Page Visibility (flush on hide) ────────────────── */
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') flush();
  });

  /* ── Periodic Flush ─────────────────────────────────── */
  setInterval(flush, FLUSH_MS);

  /* ── Initial Pageview ───────────────────────────────── */
  var schedulePageview = typeof requestIdleCallback === 'function'
    ? requestIdleCallback
    : function(fn) { setTimeout(fn, 0); };

  schedulePageview(function() {
    pushEvent('pageview');
  });

})();</script>`;
}
