/**
 * Command Palette — Ctrl+K / Cmd+K quick navigation overlay.
 * Self-contained IIFE. Injects its own <style> tag and self-initialises.
 * Part of the "aurora glass" portfolio theme.
 */
(function () {
  'use strict';

  // ── Guard: only init once ────────────────────────────────────────────────
  if (window.__cmdPaletteReady) return;
  window.__cmdPaletteReady = true;

  // ── Inject styles ────────────────────────────────────────────────────────
  if (!document.getElementById('cmdk-styles')) {
    var style = document.createElement('style');
    style.id = 'cmdk-styles';
    style.textContent = [
      /* ---------- CSS variables with hard-coded fallbacks ---------- */
      ':root {',
      '  --cmdk-accent:     var(--accent,     #2dd4bf);',
      '  --cmdk-accent-rgb: var(--accent-rgb, 45,212,191);',
      '  --cmdk-ink:        var(--ink,        #1f2937);',
      '  --cmdk-ink-soft:   var(--ink-soft,   #4b5563);',
      '  --cmdk-ease:       var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1));',
      '}',

      /* ---------- Backdrop ---------- */
      '#cmdk-backdrop {',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 10001;',
      '  background: rgba(15,23,42,0.45);',
      '  backdrop-filter: blur(6px);',
      '  -webkit-backdrop-filter: blur(6px);',
      '  display: flex;',
      '  justify-content: center;',
      '  align-items: flex-start;',
      '  padding-top: 12vh;',
      '  opacity: 0;',
      '  transition: opacity 180ms var(--cmdk-ease);',
      '  pointer-events: none;',
      '}',
      '#cmdk-backdrop.cmdk-open {',
      '  opacity: 1;',
      '  pointer-events: auto;',
      '}',

      /* ---------- Panel ---------- */
      '#cmdk-panel {',
      '  width: min(560px, 92vw);',
      '  background: rgba(255,255,255,0.82);',
      '  backdrop-filter: blur(24px) saturate(150%);',
      '  -webkit-backdrop-filter: blur(24px) saturate(150%);',
      '  border: 1px solid rgba(255,255,255,0.7);',
      '  border-radius: 1em;',
      '  box-shadow: 0 30px 80px rgba(15,23,42,0.35);',
      '  padding: 0.6em;',
      '  overflow: hidden;',
      '  transform: translateY(-12px) scale(0.97);',
      '  transition: transform 200ms var(--cmdk-ease);',
      '}',
      '#cmdk-backdrop.cmdk-open #cmdk-panel {',
      '  transform: translateY(0) scale(1);',
      '}',

      /* ---------- Search input ---------- */
      '#cmdk-input {',
      '  width: 100%;',
      '  border: none;',
      '  outline: none;',
      '  background: transparent;',
      '  font-size: 1.1em;',
      '  color: var(--cmdk-ink);',
      '  padding: 0.7em 0.9em;',
      '  box-sizing: border-box;',
      '  font-family: inherit;',
      '}',
      '#cmdk-input::placeholder {',
      '  color: var(--cmdk-ink-soft);',
      '}',

      /* ---------- Divider ---------- */
      '#cmdk-divider {',
      '  height: 1px;',
      '  background: rgba(var(--cmdk-accent-rgb),0.18);',
      '  margin: 0 0.5em;',
      '}',

      /* ---------- Results list ---------- */
      '#cmdk-results {',
      '  list-style: none;',
      '  margin: 0.4em 0 0;',
      '  padding: 0 0 0.2em;',
      '  max-height: 340px;',
      '  overflow-y: auto;',
      '  scrollbar-width: thin;',
      '  scrollbar-color: rgba(var(--cmdk-accent-rgb),0.3) transparent;',
      '}',
      '#cmdk-results::-webkit-scrollbar { width: 4px; }',
      '#cmdk-results::-webkit-scrollbar-thumb {',
      '  background: rgba(var(--cmdk-accent-rgb),0.35);',
      '  border-radius: 2px;',
      '}',

      /* ---------- Result item ---------- */
      '#cmdk-results li {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  padding: 0.6em 0.9em;',
      '  border-radius: 0.6em;',
      '  cursor: pointer;',
      '  color: var(--cmdk-ink);',
      '  gap: 0.5em;',
      '  border-left: 3px solid transparent;',
      '  transition: background 120ms ease, border-color 120ms ease;',
      '}',
      '#cmdk-results li.cmdk-active,',
      '#cmdk-results li:hover {',
      '  background: rgba(var(--cmdk-accent-rgb),0.14);',
      '  border-left-color: var(--cmdk-accent);',
      '}',
      '.cmdk-label {',
      '  flex: 1;',
      '  font-size: 0.95em;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '}',
      '.cmdk-hint {',
      '  font-size: 0.75em;',
      '  color: var(--cmdk-ink-soft);',
      '  white-space: nowrap;',
      '  flex-shrink: 0;',
      '}',

      /* ---------- Empty state ---------- */
      '#cmdk-empty {',
      '  padding: 1.2em 0.9em;',
      '  font-size: 0.9em;',
      '  color: var(--cmdk-ink-soft);',
      '  text-align: center;',
      '  display: none;',
      '}',

      /* ---------- Footer ---------- */
      '#cmdk-footer {',
      '  padding: 0.45em 0.9em 0.2em;',
      '  font-size: 0.72em;',
      '  color: var(--cmdk-ink-soft);',
      '  text-align: center;',
      '  letter-spacing: 0.02em;',
      '}',

      /* ---------- Reduced-motion overrides ---------- */
      '@media (prefers-reduced-motion: reduce) {',
      '  #cmdk-backdrop, #cmdk-panel, #cmdk-results li {',
      '    transition: none !important;',
      '    animation: none !important;',
      '  }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Build DOM ────────────────────────────────────────────────────────────
  function buildDOM() {
    if (document.getElementById('cmdk-backdrop')) return; // already built

    var backdrop = document.createElement('div');
    backdrop.id = 'cmdk-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Command palette');

    var panel = document.createElement('div');
    panel.id = 'cmdk-panel';

    var input = document.createElement('input');
    input.id = 'cmdk-input';
    input.type = 'text';
    input.placeholder = 'Search projects & sections…';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', 'cmdk-results');

    var divider = document.createElement('div');
    divider.id = 'cmdk-divider';

    var results = document.createElement('ul');
    results.id = 'cmdk-results';
    results.setAttribute('role', 'listbox');

    var empty = document.createElement('div');
    empty.id = 'cmdk-empty';
    empty.textContent = 'No results found.';

    var footer = document.createElement('div');
    footer.id = 'cmdk-footer';
    footer.innerHTML = '↑↓ navigate &nbsp;&middot;&nbsp; ↵ open &nbsp;&middot;&nbsp; esc close';

    panel.appendChild(input);
    panel.appendChild(divider);
    panel.appendChild(results);
    panel.appendChild(empty);
    panel.appendChild(footer);
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);

    // Close when clicking the backdrop itself (not the panel)
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closepalette();
    });

    return { backdrop: backdrop, input: input, results: results, empty: empty };
  }

  // ── Scrape items from DOM ─────────────────────────────────────────────────
  function scrapeItems() {
    var items = [];

    // 1. Section nav links
    try {
      var navLinks = document.querySelectorAll('#header nav a[href]');
      navLinks.forEach(function (a) {
        var label = (a.textContent || '').trim();
        var href = (a.getAttribute('href') || '').trim();
        if (label && href) {
          items.push({ label: label, href: href, hint: 'Section', searchStr: label.toLowerCase() });
        }
      });
    } catch (e) { /* silently ignore */ }

    // 2. Project cards (homepage only)
    try {
      var cards = document.querySelectorAll('.project-card');
      cards.forEach(function (card) {
        var h3 = card.querySelector('h3');
        var thumb = card.querySelector('a.project-thumb');
        if (!h3 || !thumb) return;

        var label = (h3.textContent || '').trim();
        var href = (thumb.getAttribute('href') || '').trim();
        if (!label || !href) return;

        // Collect tags for richer search
        var tagNodes = card.querySelectorAll('.project-tag');
        var tags = [];
        tagNodes.forEach(function (t) { tags.push((t.textContent || '').trim()); });
        var tagStr = tags.join(' ');

        items.push({
          label: label,
          href: href,
          hint: tags.length ? tags[0] : 'Project',
          searchStr: (label + ' ' + tagStr).toLowerCase(),
        });
      });
    } catch (e) { /* silently ignore */ }

    return items;
  }

  // ── State ────────────────────────────────────────────────────────────────
  var allItems = [];
  var filteredItems = [];
  var activeIndex = 0;
  var isOpen = false;

  // ── Render results ────────────────────────────────────────────────────────
  function renderResults(query) {
    var resultsEl = document.getElementById('cmdk-results');
    var emptyEl = document.getElementById('cmdk-empty');
    if (!resultsEl || !emptyEl) return;

    var q = (query || '').trim().toLowerCase();
    filteredItems = q
      ? allItems.filter(function (item) { return item.searchStr.indexOf(q) !== -1; })
      : allItems.slice();

    resultsEl.innerHTML = '';

    if (filteredItems.length === 0) {
      emptyEl.style.display = 'block';
      activeIndex = -1;
      return;
    }
    emptyEl.style.display = 'none';
    activeIndex = 0;

    filteredItems.forEach(function (item, idx) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', idx === activeIndex ? 'true' : 'false');
      if (idx === activeIndex) li.classList.add('cmdk-active');

      var labelSpan = document.createElement('span');
      labelSpan.className = 'cmdk-label';
      labelSpan.textContent = item.label;

      var hintSpan = document.createElement('span');
      hintSpan.className = 'cmdk-hint';
      hintSpan.textContent = item.hint;

      li.appendChild(labelSpan);
      li.appendChild(hintSpan);

      li.addEventListener('mouseenter', function () { setActive(idx); });
      li.addEventListener('click', function () { activateItem(filteredItems[idx]); });

      resultsEl.appendChild(li);
    });
  }

  function setActive(idx) {
    var resultsEl = document.getElementById('cmdk-results');
    if (!resultsEl) return;
    var items = resultsEl.querySelectorAll('li');
    items.forEach(function (li, i) {
      li.classList.toggle('cmdk-active', i === idx);
      li.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    activeIndex = idx;
    // Scroll into view
    if (items[idx]) {
      items[idx].scrollIntoView({ block: 'nearest' });
    }
  }

  // ── Activate (navigate to) item ───────────────────────────────────────────
  function activateItem(item) {
    if (!item || !item.href) return;
    closepalette_immediate();
    if (item.href.charAt(0) === '#') {
      try {
        var target = document.querySelector(item.href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (e) {
        window.location.href = item.href;
      }
    } else {
      window.location.href = item.href;
    }
  }

  // ── Open / close ──────────────────────────────────────────────────────────
  function openPalette() {
    if (isOpen) return;
    // Re-scrape every open so dynamically loaded content is included
    allItems = scrapeItems();

    var backdrop = document.getElementById('cmdk-backdrop');
    var input = document.getElementById('cmdk-input');
    if (!backdrop || !input) return;

    isOpen = true;
    input.value = '';
    renderResults('');

    // Force reflow so transition fires
    backdrop.getBoundingClientRect();
    backdrop.classList.add('cmdk-open');
    input.focus();
  }

  function closepalette_immediate() {
    var backdrop = document.getElementById('cmdk-backdrop');
    if (backdrop) backdrop.classList.remove('cmdk-open');
    isOpen = false;
  }

  function closepalette() {
    closepalette_immediate();
  }

  // Public alias used by event listeners
  function closepalette_evt() { closepalette(); }

  // ── Keyboard handling ─────────────────────────────────────────────────────
  function handleGlobalKey(e) {
    var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    var triggerKey = isMac ? (e.metaKey && !e.ctrlKey) : (e.ctrlKey && !e.metaKey);

    if (triggerKey && e.key === 'k') {
      e.preventDefault();
      if (isOpen) { closepalette(); } else { openPalette(); }
      return;
    }

    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closepalette();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredItems.length) {
        setActive((activeIndex + 1) % filteredItems.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredItems.length) {
        setActive((activeIndex - 1 + filteredItems.length) % filteredItems.length);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filteredItems[activeIndex]) {
        activateItem(filteredItems[activeIndex]);
      }
      return;
    }
  }

  function handleInputChange(e) {
    renderResults(e.target.value);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    buildDOM();

    var input = document.getElementById('cmdk-input');
    if (input) {
      input.addEventListener('input', handleInputChange);
    }

    document.addEventListener('keydown', handleGlobalKey);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
