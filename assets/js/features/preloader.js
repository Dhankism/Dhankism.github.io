/**
 * preloader.js — Branded intro preloader for Dharik Purohit's portfolio.
 * Self-contained IIFE: injects its own <style>, builds DOM, self-initializes.
 * Glass-on-dark theme, teal accent (#2dd4bf).
 */
(function () {
  'use strict';

  // ── Guards ──────────────────────────────────────────────────────────────────

  // Only run on the homepage
  try {
    var path = window.location.pathname;
    var last = path.split('/').pop();
    if (last !== '' && last !== 'index.html') return;
  } catch (_) { return; }

  // Only run once per browser session
  var SESSION_KEY = 'dp_preloaded';
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch (_) {
    // sessionStorage blocked — continue anyway so site is usable
  }

  // ── Design tokens (hardcoded fallbacks; CSS vars resolved at runtime) ───────
  var BG       = '#080b11';
  var ACCENT   = '#2dd4bf';
  var TEXT     = '#e7eef5';
  var EASE     = 'cubic-bezier(0.22,1,0.36,1)';
  var FONT_DIS = "'Space Grotesk', sans-serif";

  // ── Inject styles ────────────────────────────────────────────────────────────
  if (!document.getElementById('pl-styles')) {
    var style = document.createElement('style');
    style.id = 'pl-styles';
    style.textContent = [
      '#pl-overlay {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 100000;',
      '  background: var(--bg, ' + BG + ');',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 0;',
      '  will-change: transform;',
      '}',

      '#pl-monogram {',
      '  font-family: ' + FONT_DIS + ';',
      '  font-size: clamp(3rem, 8vw, 5.5rem);',
      '  font-weight: 700;',
      '  letter-spacing: 0.08em;',
      '  color: var(--text, ' + TEXT + ');',
      '  line-height: 1;',
      '  text-shadow:',
      '    0 0 40px rgba(var(--accent-rgb, 45,212,191), 0.45),',
      '    0 0 80px rgba(var(--accent-rgb, 45,212,191), 0.18);',
      '  user-select: none;',
      '}',

      '#pl-counter {',
      '  font-family: ' + FONT_DIS + ';',
      '  font-size: clamp(0.85rem, 2vw, 1rem);',
      '  font-weight: 500;',
      '  letter-spacing: 0.18em;',
      '  color: var(--accent, ' + ACCENT + ');',
      '  margin-top: 1.6rem;',
      '  line-height: 1;',
      '  user-select: none;',
      '}',

      '#pl-track {',
      '  width: clamp(120px, 24vw, 220px);',
      '  height: 2px;',
      '  background: rgba(var(--accent-rgb, 45,212,191), 0.15);',
      '  border-radius: 2px;',
      '  margin-top: 0.75rem;',
      '  overflow: hidden;',
      '}',

      '#pl-bar {',
      '  height: 100%;',
      '  width: 0%;',
      '  background: var(--accent, ' + ACCENT + ');',
      '  border-radius: 2px;',
      '  box-shadow: 0 0 10px rgba(var(--accent-rgb, 45,212,191), 0.7);',
      '  will-change: width;',
      '}',

      /* Wipe-up exit animation */
      '#pl-overlay.pl-exit {',
      '  transform: translateY(-100%);',
      '  transition: transform 0.6s ' + EASE + ';',
      '}',

      /* Reduced-motion: fade instead */
      '@media (prefers-reduced-motion: reduce) {',
      '  #pl-overlay.pl-exit {',
      '    transform: none !important;',
      '    opacity: 0;',
      '    transition: opacity 0.28s linear !important;',
      '  }',
      '}'
    ].join('\n');

    (document.head || document.documentElement).appendChild(style);
  }

  // ── Build DOM ────────────────────────────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.id = 'pl-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('role', 'presentation');

  var monogram = document.createElement('div');
  monogram.id = 'pl-monogram';
  monogram.textContent = 'DP';

  var counter = document.createElement('div');
  counter.id = 'pl-counter';
  counter.textContent = '0%';

  var track = document.createElement('div');
  track.id = 'pl-track';

  var bar = document.createElement('div');
  bar.id = 'pl-bar';

  track.appendChild(bar);
  overlay.appendChild(monogram);
  overlay.appendChild(counter);
  overlay.appendChild(track);

  // Insert as first child of body (or documentElement if body not ready yet)
  function mount() {
    try {
      var target = document.body || document.documentElement;
      target.insertBefore(overlay, target.firstChild);
      document.body.style.overflow = 'hidden';
    } catch (_) { cleanup(); }
  }

  // ── Teardown ─────────────────────────────────────────────────────────────────
  function cleanup() {
    try { document.body.style.overflow = ''; } catch (_) {}
    try {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    } catch (_) {}
  }

  function exit() {
    try { document.body.style.overflow = ''; } catch (_) {}

    overlay.classList.add('pl-exit');

    // Wait for CSS transition to finish then remove
    var done = false;
    function onEnd() {
      if (done) return;
      done = true;
      try { overlay.removeEventListener('transitionend', onEnd); } catch (_) {}
      cleanup();
    }

    try {
      overlay.addEventListener('transitionend', onEnd);
    } catch (_) {}

    // Safety fallback — remove after max 800ms regardless
    setTimeout(onEnd, 800);
  }

  // ── Reduced-motion check ─────────────────────────────────────────────────────
  var reducedMotion = false;
  try {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {}

  // ── Counter animation ─────────────────────────────────────────────────────────
  var DURATION = 1400; // ms for 0→100

  function easeOut(t) {
    // Cubic ease-out: 1 - (1 - t)^3
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter() {
    var start = null;

    function step(ts) {
      try {
        if (!start) start = ts;
        var elapsed = ts - start;
        var progress = Math.min(elapsed / DURATION, 1);
        var eased = easeOut(progress);
        var val = Math.round(eased * 100);

        counter.textContent = val + '%';
        bar.style.width = val + '%';

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Counter done — trigger wipe
          exit();
        }
      } catch (_) {
        cleanup();
      }
    }

    requestAnimationFrame(step);
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  try {
    if (document.body) {
      mount();
    } else {
      // Body not ready — wait for it
      document.addEventListener('DOMContentLoaded', function onDCL() {
        document.removeEventListener('DOMContentLoaded', onDCL);
        mount();
        run();
      });
      // Early return — run() called inside the listener
      return;
    }

    run();
  } catch (_) {
    cleanup();
  }

  function run() {
    try {
      if (reducedMotion) {
        // Skip counter, quick fade
        counter.textContent = '100%';
        bar.style.width = '100%';
        setTimeout(exit, 80);
      } else {
        animateCounter();
      }
    } catch (_) {
      cleanup();
    }
  }

})();
