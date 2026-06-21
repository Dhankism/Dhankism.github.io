/**
 * lightbox.js — Self-contained glass-on-dark lightbox for portfolio gallery pages.
 * Operates on: <a class="gallery-item" href="IMG_URL" data-caption="..."> inside .gallery containers.
 * Injects its own <style id="lb-styles"> and builds overlay DOM. No external dependencies.
 */
(function () {
  'use strict';

  /* ─── 1. Guard: inject styles only once ─────────────────────────────────── */
  if (!document.getElementById('lb-styles')) {
    var styleEl = document.createElement('style');
    styleEl.id = 'lb-styles';
    styleEl.textContent = [
      ':root {',
      '  --lb-accent:       var(--accent,       #2dd4bf);',
      '  --lb-accent-rgb:   var(--accent-rgb,   45,212,191);',
      '  --lb-text:         var(--text,         #e7eef5);',
      '  --lb-text-soft:    var(--text-soft,    #aab6c2);',
      '  --lb-text-dim:     var(--text-dim,     #6c7886);',
      '  --lb-border:       var(--border-2,     rgba(255,255,255,0.16));',
      '  --lb-ease:         var(--ease,         cubic-bezier(0.22,1,0.36,1));',
      '  --lb-radius:       var(--radius,       18px);',
      '  --lb-font:         var(--font-body,    "Inter", sans-serif);',
      '}',

      /* Backdrop */
      '#lb-overlay {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 10002;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  background: rgba(4,6,10,0.90);',
      '  backdrop-filter: blur(14px);',
      '  -webkit-backdrop-filter: blur(14px);',
      '  opacity: 0;',
      '  pointer-events: none;',
      '  transition: opacity 0.28s var(--lb-ease);',
      '}',
      '#lb-overlay.lb-open {',
      '  opacity: 1;',
      '  pointer-events: all;',
      '}',

      /* Inner container (prevents click-through to backdrop on image) */
      '#lb-container {',
      '  position: relative;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  max-width: 88vw;',
      '  max-height: 82vh;',
      '  transform: scale(0.93);',
      '  transition: transform 0.28s var(--lb-ease);',
      '}',
      '#lb-overlay.lb-open #lb-container {',
      '  transform: scale(1);',
      '}',

      /* Image wrapper — handles per-image fade */
      '#lb-img-wrap {',
      '  position: relative;',
      '  max-width: 88vw;',
      '  max-height: 82vh;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '}',
      '#lb-img {',
      '  max-width: 88vw;',
      '  max-height: 75vh;',
      '  object-fit: contain;',
      '  border-radius: var(--lb-radius);',
      '  box-shadow: 0 8px 48px rgba(0,0,0,0.65), 0 0 0 1px var(--lb-border);',
      '  display: block;',
      '  opacity: 1;',
      '  transition: opacity 0.18s var(--lb-ease), transform 0.18s var(--lb-ease);',
      '}',
      '#lb-img.lb-switching {',
      '  opacity: 0;',
      '  transform: scale(0.96);',
      '}',

      /* Caption row */
      '#lb-caption-row {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  width: 100%;',
      '  margin-top: 14px;',
      '  gap: 16px;',
      '  font-family: var(--lb-font);',
      '}',
      '#lb-caption {',
      '  color: var(--lb-text-soft);',
      '  font-size: 0.88rem;',
      '  line-height: 1.45;',
      '  flex: 1;',
      '  text-align: center;',
      '}',
      '#lb-counter {',
      '  color: var(--lb-text-dim);',
      '  font-size: 0.78rem;',
      '  white-space: nowrap;',
      '  font-family: var(--lb-font);',
      '  flex-shrink: 0;',
      '}',

      /* Shared glass button */
      '.lb-btn {',
      '  position: absolute;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 44px;',
      '  height: 44px;',
      '  border-radius: 50%;',
      '  border: 1px solid var(--lb-border);',
      '  background: rgba(255,255,255,0.06);',
      '  backdrop-filter: blur(6px);',
      '  -webkit-backdrop-filter: blur(6px);',
      '  color: var(--lb-text);',
      '  cursor: pointer;',
      '  font-size: 1.15rem;',
      '  line-height: 1;',
      '  transition: border-color 0.18s, color 0.18s, background 0.18s;',
      '  z-index: 10003;',
      '  user-select: none;',
      '  -webkit-user-select: none;',
      '}',
      '.lb-btn:hover, .lb-btn:focus-visible {',
      '  border-color: var(--lb-accent);',
      '  color: var(--lb-accent);',
      '  background: rgba(var(--lb-accent-rgb),0.10);',
      '  outline: none;',
      '}',

      /* Close button — top-right of overlay */
      '#lb-close {',
      '  position: fixed;',
      '  top: 20px;',
      '  right: 24px;',
      '  font-size: 1.4rem;',
      '}',

      /* Arrow buttons — flanking the image wrapper */
      '#lb-prev {',
      '  left: -58px;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '}',
      '#lb-next {',
      '  right: -58px;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '}',

      /* Reduced-motion overrides */
      '@media (prefers-reduced-motion: reduce) {',
      '  #lb-overlay,',
      '  #lb-container,',
      '  #lb-img,',
      '  .lb-btn {',
      '    transition: none !important;',
      '  }',
      '}',

      /* Small-screen: tuck arrows below on narrow viewports */
      '@media (max-width: 600px) {',
      '  #lb-prev { left: 4px; }',
      '  #lb-next { right: 4px; }',
      '  .lb-btn { width: 36px; height: 36px; font-size: 1rem; }',
      '}',
    ].join('\n');
    document.head.appendChild(styleEl);
  }

  /* ─── 2. Collect gallery items ──────────────────────────────────────────── */
  var items = Array.prototype.slice.call(
    document.querySelectorAll('.gallery .gallery-item')
  );
  if (items.length === 0) return; // no galleries — done

  /* ─── 3. Build overlay DOM ──────────────────────────────────────────────── */
  var overlay   = document.createElement('div');  overlay.id = 'lb-overlay';
  var container = document.createElement('div');  container.id = 'lb-container';
  var imgWrap   = document.createElement('div');  imgWrap.id = 'lb-img-wrap';
  var img       = document.createElement('img');  img.id = 'lb-img'; img.alt = '';
  var capRow    = document.createElement('div');  capRow.id = 'lb-caption-row';
  var caption   = document.createElement('span'); caption.id = 'lb-caption';
  var counter   = document.createElement('span'); counter.id = 'lb-counter';
  var btnClose  = document.createElement('button'); btnClose.id = 'lb-close';  btnClose.className = 'lb-btn'; btnClose.setAttribute('aria-label', 'Close lightbox'); btnClose.innerHTML = '&times;';
  var btnPrev   = document.createElement('button'); btnPrev.id  = 'lb-prev';   btnPrev.className  = 'lb-btn'; btnPrev.setAttribute('aria-label', 'Previous image'); btnPrev.innerHTML = '&#8592;';
  var btnNext   = document.createElement('button'); btnNext.id  = 'lb-next';   btnNext.className  = 'lb-btn'; btnNext.setAttribute('aria-label', 'Next image');     btnNext.innerHTML = '&#8594;';

  imgWrap.appendChild(img);
  imgWrap.appendChild(btnPrev);
  imgWrap.appendChild(btnNext);
  capRow.appendChild(caption);
  capRow.appendChild(counter);
  container.appendChild(imgWrap);
  container.appendChild(capRow);
  overlay.appendChild(btnClose);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  /* ─── 4. State ──────────────────────────────────────────────────────────── */
  var current = 0;
  var isOpen  = false;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── 5. Helpers ────────────────────────────────────────────────────────── */
  function updateContent(index, animate) {
    try {
      var item = items[index];
      var src  = item.getAttribute('href') || (item.querySelector('img') || {}).src || '';
      var cap  = item.getAttribute('data-caption') || '';

      counter.textContent = (index + 1) + ' / ' + items.length;

      if (!animate || prefersReducedMotion) {
        img.src = src;
        caption.textContent = cap;
        return;
      }

      /* Fade out → swap → fade in */
      img.classList.add('lb-switching');
      var delay = parseFloat(getComputedStyle(img).transitionDuration) * 1000 || 180;
      setTimeout(function () {
        try {
          img.src = src;
          caption.textContent = cap;
          img.classList.remove('lb-switching');
        } catch (e) { /* defensive */ }
      }, delay);

      /* Preload neighbors */
      preloadNeighbors(index);
    } catch (e) { /* never throw */ }
  }

  function preloadNeighbors(index) {
    try {
      [index - 1, index + 1].forEach(function (i) {
        var ni = (i + items.length) % items.length;
        if (ni === index) return;
        var pImg = new Image();
        pImg.src = items[ni].getAttribute('href') || '';
      });
    } catch (e) { /* ignore preload errors */ }
  }

  function openAt(index) {
    try {
      current = ((index % items.length) + items.length) % items.length;
      updateContent(current, false);
      overlay.classList.add('lb-open');
      document.body.style.overflow = 'hidden';
      isOpen = true;
      btnClose.focus();
    } catch (e) { /* defensive */ }
  }

  function close() {
    try {
      overlay.classList.remove('lb-open');
      document.body.style.overflow = '';
      isOpen = false;
    } catch (e) { /* defensive */ }
  }

  function navigate(delta) {
    try {
      current = ((current + delta) + items.length) % items.length;
      updateContent(current, true);
    } catch (e) { /* defensive */ }
  }

  /* ─── 6. Wire gallery item clicks ──────────────────────────────────────── */
  items.forEach(function (item, idx) {
    item.addEventListener('click', function (e) {
      try {
        e.preventDefault();
        openAt(idx);
      } catch (ex) { /* never throw */ }
    });
  });

  /* ─── 7. Controls ───────────────────────────────────────────────────────── */
  btnClose.addEventListener('click', function (e) {
    e.stopPropagation();
    close();
  });

  btnPrev.addEventListener('click', function (e) {
    e.stopPropagation();
    navigate(-1);
  });

  btnNext.addEventListener('click', function (e) {
    e.stopPropagation();
    navigate(1);
  });

  /* Backdrop click (outside container) */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  /* Keyboard */
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    try {
      switch (e.key) {
        case 'Escape':    close();        break;
        case 'ArrowLeft': navigate(-1);   break;
        case 'ArrowRight':navigate(1);    break;
      }
    } catch (ex) { /* defensive */ }
  });

  /* Touch swipe (optional, lightweight) */
  (function () {
    var startX = null;
    overlay.addEventListener('touchstart', function (e) {
      try { startX = e.touches[0].clientX; } catch (ex) {}
    }, { passive: true });
    overlay.addEventListener('touchend', function (e) {
      try {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) navigate(dx < 0 ? 1 : -1);
      } catch (ex) {}
    }, { passive: true });
  }());

})();
