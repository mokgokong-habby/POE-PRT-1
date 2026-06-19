(function () {
  'use strict';

  const MAX_LEN = 60;
  const SUBMIT_COOLDOWN_MS = 800;

  const lastSubmitAt = { t: 0 };

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function safeText(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.setAttribute('data-state', msg === 'Not found' ? 'error' : 'ok');
  }

  function normalize(str) {
    return String(str || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Redirect mapping based on keywords present in existing page content.
  function resolveRoute(query) {
    const q = normalize(query);
    if (!q) return { found: false, href: null };

    const hasAny = (arr) => arr.some((k) => q.includes(k));

    // Pricing / enquiry
    if (
      hasAny([
        'price',
        'pricing',
        'plan',
        'plans',
        'starter',
        'standard',
        'premium',
        'monthly',
        'month',
        'year',
        'enquiry',
        'enquire',
        'payment',
      ])
    ) {
      return { found: true, href: 'enquiry.html' };
    }

    // Motivation / about
    if (hasAny(['motivation', 'discipline', 'disciplined', 'success', 'stay disciplined', 'proverbs'])) {
      return { found: true, href: 'about.html' };
    }

    // Contact
    if (hasAny(['contact', 'email', 'phone', 'location', 'biccard', 'street', 'south africa'])) {
      return { found: true, href: 'contact.html' };
    }

    // Services
    if (
      hasAny([
        'service',
        'services',
        'tutoring',
        'tutor',
        'programming',
        'network',
        'networking',
        'database',
        'finance',
        'accounting',
        'commerce',
        'law',
      ])
    ) {
      return { found: true, href: 'service.html' };
    }

    // Keywords used on index page
    if (hasAny(['home', 'unlock', 'academic', 'students', 'mission', 'study', 'materials'])) {
      return { found: true, href: 'index.html' };
    }

    return { found: false, href: null };
  }

  function attachSearch() {
    const searchForm = qs('#siteSearchForm');
    const input = qs('#siteSearch');
    const msg = qs('#searchMessage');
    if (!searchForm || !input) return;

    // Prevent form auto-submit on accidental Enter spamming.
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const now = Date.now();
      if (now - lastSubmitAt.t < SUBMIT_COOLDOWN_MS) return;
      lastSubmitAt.t = now;

      // basic sanitization: remove angle brackets to limit injection attempts
      const raw = input.value;
      const cleaned = String(raw || '').replace(/[<>]/g, '').slice(0, MAX_LEN);

      const resolved = resolveRoute(cleaned);

      if (!resolved.found || !resolved.href) {
        safeText(msg, 'Not found');
        return;
      }

      safeText(msg, '');
      // Redirect
      window.location.assign(resolved.href);
    });

    // Update message state while typing (no HTML injection)
    input.addEventListener('input', function () {
      const msgState = qs('#searchMessage');
      if (!msgState) return;
      // Only clear if user starts typing something meaningful.
      const v = normalize(input.value);
      if (!v) safeText(msgState, '');
      else if (msgState.textContent === 'Not found') safeText(msgState, '');
    });
  }

  // Simple security hardening: block unexpected inline script execution (best-effort)
  // Note: CSP must be set by server/headers; we only prevent some obvious issues client-side.

  document.addEventListener('DOMContentLoaded', attachSearch);
})();

