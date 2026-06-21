/**
 * back-to-top.js
 * Self-contained IIFE: injects styles, creates the button, and self-initializes.
 * No external dependencies. Does not modify any other file.
 */
(function () {
  'use strict';

  // Guard against double-init
  if (document.getElementById('back-to-top')) return;

  /* ------------------------------------------------------------------
     Style injection
  ------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById('btt-styles')) return;

    var style = document.createElement('style');
    style.id = 'btt-styles';
    style.textContent = [
      '#back-to-top {',
      '  position: fixed;',
      '  bottom: 2em;',
      '  right: 2em;',
      '  z-index: 9991;',
      '  width: 2.8em;',
      '  height: 2.8em;',
      '  border-radius: 50%;',
      '  border: 1px solid rgba(255,255,255,0.7);',
      '  background: rgba(255,255,255,0.55);',
      '  backdrop-filter: blur(12px) saturate(140%);',
      '  -webkit-backdrop-filter: blur(12px) saturate(140%);',
      '  box-shadow: 0 6px 20px rgba(31,41,55,0.18);',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 0;',
      '  opacity: 0;',
      '  transform: translateY(12px);',
      '  pointer-events: none;',
      '  transition:',
      '    opacity 0.3s var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1)),',
      '    transform 0.3s var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1)),',
      '    background 0.25s var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1)),',
      '    border-color 0.25s var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1)),',
      '    box-shadow 0.25s var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1));',
      '}',

      '#back-to-top.visible {',
      '  opacity: 1;',
      '  transform: translateY(0);',
      '  pointer-events: auto;',
      '}',

      '#back-to-top:hover {',
      '  background: rgba(45,212,191,0.2);',
      '  border-color: var(--accent, #2dd4bf);',
      '  transform: translateY(-3px) scale(1.08);',
      '  box-shadow: 0 0 16px rgba(45,212,191,0.4), 0 6px 20px rgba(31,41,55,0.18);',
      '}',

      '#back-to-top.visible:hover {',
      '  transform: translateY(-3px) scale(1.08);',
      '}',

      /* CSS chevron arrow */
      '#back-to-top .btt-arrow {',
      '  display: block;',
      '  width: 0.7em;',
      '  height: 0.7em;',
      '  border-top: 2.5px solid var(--accent, #2dd4bf);',
      '  border-right: 2.5px solid var(--accent, #2dd4bf);',
      '  transform: rotate(-45deg) translateY(15%);',
      '  flex-shrink: 0;',
      '}',

      /* Reduced-motion: no transitions, no transform animations */
      '@media (prefers-reduced-motion: reduce) {',
      '  #back-to-top {',
      '    transition: none;',
      '  }',
      '  #back-to-top.visible:hover {',
      '    transform: none;',
      '  }',
      '  #back-to-top:hover {',
      '    transform: none;',
      '  }',
      '}'
    ].join('\n');

    (document.head || document.documentElement).appendChild(style);
  }

  /* ------------------------------------------------------------------
     Button creation
  ------------------------------------------------------------------ */
  function createButton() {
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('type', 'button');

    var arrow = document.createElement('span');
    arrow.className = 'btt-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    btn.appendChild(arrow);

    document.body.appendChild(btn);
    return btn;
  }

  /* ------------------------------------------------------------------
     Scroll logic with rAF throttling
  ------------------------------------------------------------------ */
  function init() {
    // Double-guard (may run after DOMContentLoaded fires)
    if (document.getElementById('back-to-top')) return;

    injectStyles();
    var btn = createButton();

    var ticking = false;
    var threshold = window.innerHeight * 0.8;

    function updateVisibility() {
      threshold = window.innerHeight * 0.8; // recalculate in case of resize
      if (window.pageYOffset > threshold) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }, { passive: true });

    // Also update on resize (threshold changes)
    window.addEventListener('resize', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      try {
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      } catch (e) {
        // Fallback for very old browsers
        window.scrollTo(0, 0);
      }
    });
  }

  /* ------------------------------------------------------------------
     Bootstrap: init now if DOM is ready, otherwise wait
  ------------------------------------------------------------------ */
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (e) {
    // Never throw — silent failure
  }

}());
