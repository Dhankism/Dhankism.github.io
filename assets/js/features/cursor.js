/**
 * cursor.js — Premium custom cursor + magnetic buttons
 * Self-contained IIFE. Injects its own <style> tag (id="cursor-styles").
 * Glass-on-dark portfolio, teal accent #2dd4bf.
 */
(function () {
  'use strict';

  // --- Guards ---
  // Only activate on fine-pointer + hover-capable devices
  if (
    !window.matchMedia('(pointer:fine)').matches ||
    !window.matchMedia('(hover:hover)').matches
  ) {
    return;
  }

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Skip if already initialised (e.g. HMR / duplicate script load)
  if (document.getElementById('cursor-styles')) {
    return;
  }

  // --- Design tokens (with fallbacks) ---
  var ACCENT       = 'var(--accent, #2dd4bf)';
  var ACCENT_RGB   = 'var(--accent-rgb, 45,212,191)';
  var EASE         = 'var(--ease, cubic-bezier(0.22,1,0.36,1))';

  // Numeric values used in JS calculations
  var RING_SIZE         = 36;   // px – default ring diameter
  var RING_SIZE_HOVER   = 56;   // px – expanded ring on hover
  var DOT_SIZE          = 8;    // px – dot diameter
  var LERP_FACTOR       = 0.12; // ring lag (lower = more lag)
  var MAG_STRENGTH      = 8;    // max px offset for magnetic pull

  // --- Inject styles ---
  var style = document.createElement('style');
  style.id = 'cursor-styles';
  style.textContent = [
    /* Hide OS cursor while custom cursor is active */
    'html.has-custom-cursor,',
    'html.has-custom-cursor body,',
    'html.has-custom-cursor a,',
    'html.has-custom-cursor button,',
    'html.has-custom-cursor .btn,',
    'html.has-custom-cursor [data-magnetic],',
    'html.has-custom-cursor .project,',
    'html.has-custom-cursor .filter-pill,',
    'html.has-custom-cursor input {',
    '  cursor: none !important;',
    '}',

    /* Dot */
    '#cursor-dot {',
    '  position: fixed;',
    '  top: 0; left: 0;',
    '  width: ' + DOT_SIZE + 'px;',
    '  height: ' + DOT_SIZE + 'px;',
    '  border-radius: 50%;',
    '  background: ' + ACCENT + ';',
    '  pointer-events: none;',
    '  z-index: 99999;',
    '  transform: translate(-50%, -50%);',
    '  will-change: transform;',
    '  transition: opacity 0.3s ease;',
    '}',

    /* Ring */
    '#cursor-ring {',
    '  position: fixed;',
    '  top: 0; left: 0;',
    '  width: ' + RING_SIZE + 'px;',
    '  height: ' + RING_SIZE + 'px;',
    '  border-radius: 50%;',
    '  border: 1px solid rgba(' + ACCENT_RGB + ', 0.7);',
    '  pointer-events: none;',
    '  z-index: 99998;',
    '  transform: translate(-50%, -50%);',
    '  will-change: transform, width, height;',
    '  transition:',
    '    width  0.25s ' + EASE + ',',
    '    height 0.25s ' + EASE + ',',
    '    border-color 0.25s ease,',
    '    background   0.25s ease,',
    '    opacity      0.3s ease;',
    '}',

    /* Ring – hover state */
    '#cursor-ring.cursor-hover {',
    '  width: ' + RING_SIZE_HOVER + 'px;',
    '  height: ' + RING_SIZE_HOVER + 'px;',
    '  border-color: rgba(' + ACCENT_RGB + ', 1);',
    '  background: rgba(' + ACCENT_RGB + ', 0.08);',
    '}',

    /* Hide both elements initially to avoid flash at (0,0) */
    '#cursor-dot, #cursor-ring {',
    '  opacity: 0;',
    '}',
  ].join('\n');

  document.head.appendChild(style);

  // --- Build DOM ---
  var dot  = document.createElement('div');
  dot.id   = 'cursor-dot';

  var ring = document.createElement('div');
  ring.id  = 'cursor-ring';

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  // Tell CSS we're active (hides OS cursor)
  document.documentElement.classList.add('has-custom-cursor');

  // --- State ---
  var mouseX = -999, mouseY = -999; // off-screen until first move
  var ringX  = -999, ringY  = -999;
  var visible = false;
  var rafId   = null;

  // --- Animation loop ---
  function tick() {
    // Lerp ring toward mouse
    ringX += (mouseX - ringX) * LERP_FACTOR;
    ringY += (mouseY - ringY) * LERP_FACTOR;

    dot.style.left  = mouseX + 'px';
    dot.style.top   = mouseY + 'px';
    ring.style.left = ringX  + 'px';
    ring.style.top  = ringY  + 'px';

    rafId = requestAnimationFrame(tick);
  }

  // --- Mouse tracking ---
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!visible) {
      // First move: snap both to position and reveal
      ringX = mouseX;
      ringY = mouseY;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
      visible = true;
    }
  }, { passive: true });

  // Hide when mouse leaves the viewport
  document.addEventListener('mouseleave', function () {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  }, { passive: true });

  document.addEventListener('mouseenter', function () {
    if (visible) {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
  }, { passive: true });

  // --- Interactive element selectors for hover state ---
  var HOVER_SELECTOR = 'a, button, .btn, [data-magnetic], .project, .filter-pill, input';

  function onInteractiveEnter() {
    ring.classList.add('cursor-hover');
  }

  function onInteractiveLeave() {
    ring.classList.remove('cursor-hover');
  }

  // Attach hover listeners to all interactive elements at init
  try {
    var interactiveEls = document.querySelectorAll(HOVER_SELECTOR);
    interactiveEls.forEach(function (el) {
      el.addEventListener('mouseenter', onInteractiveEnter, { passive: true });
      el.addEventListener('mouseleave', onInteractiveLeave, { passive: true });
    });
  } catch (e) { /* never throw */ }

  // --- Magnetic effect ---
  var MAG_SELECTOR = '.btn, [data-magnetic]';
  var MAG_TRANSITION = 'transform 0.35s ' + EASE;

  function onMagMove(e) {
    try {
      var el   = this;
      var rect = el.getBoundingClientRect();
      var cx   = rect.left + rect.width  / 2;
      var cy   = rect.top  + rect.height / 2;
      var dx   = e.clientX - cx;
      var dy   = e.clientY - cy;
      // Normalise by half-size, clamp to [-1, 1]
      var nx   = Math.max(-1, Math.min(1, dx / (rect.width  / 2)));
      var ny   = Math.max(-1, Math.min(1, dy / (rect.height / 2)));
      el.style.transform  = 'translate(' + (nx * MAG_STRENGTH) + 'px, ' + (ny * MAG_STRENGTH) + 'px)';
      el.style.transition = MAG_TRANSITION;
    } catch (err) { /* never throw */ }
  }

  function onMagLeave() {
    try {
      this.style.transform  = 'translate(0,0)';
      this.style.transition = MAG_TRANSITION;
    } catch (err) { /* never throw */ }
  }

  try {
    var magEls = document.querySelectorAll(MAG_SELECTOR);
    magEls.forEach(function (el) {
      el.addEventListener('mousemove',  onMagMove,  { passive: true });
      el.addEventListener('mouseleave', onMagLeave, { passive: true });
    });
  } catch (e) { /* never throw */ }

  // --- Start loop ---
  rafId = requestAnimationFrame(tick);

  // --- Cleanup helper (exposed for optional teardown) ---
  window.__cursorCleanup = function () {
    try {
      cancelAnimationFrame(rafId);
      dot.remove();
      ring.remove();
      var s = document.getElementById('cursor-styles');
      if (s) s.remove();
      document.documentElement.classList.remove('has-custom-cursor');
    } catch (e) { /* never throw */ }
  };

}());
