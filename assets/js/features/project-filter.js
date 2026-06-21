(function () {
  'use strict';

  var STYLE_ID = 'pfilter-styles';
  var FILTER_CLASS = 'project-filters';
  var HIDDEN_CLASS = 'pf-hidden';
  var HIDING_CLASS = 'pf-hiding';
  var INIT_ATTR = 'data-pfilter-init';
  var TRANSITION_MS = 350;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      '.project-filters {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 0.5em;',
      '  margin: 0 0 1.5em;',
      '}',

      '.project-filters button {',
      '  background: rgba(255, 255, 255, 0.5);',
      '  border: 1px solid rgba(255, 255, 255, 0.7);',
      '  backdrop-filter: blur(8px);',
      '  -webkit-backdrop-filter: blur(8px);',
      '  border-radius: 2em;',
      '  padding: 0.45em 1.1em;',
      '  font-size: 0.72em;',
      '  font-weight: 600;',
      '  letter-spacing: 0.04em;',
      '  color: var(--ink-soft, #4b5563);',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '  line-height: 1.4;',
      '}',

      '.project-filters button:hover {',
      '  border-color: rgba(45, 212, 191, 0.6);',
      '  color: var(--accent, #2dd4bf);',
      '  transform: translateY(-2px);',
      '}',

      '.project-filters button[aria-pressed="true"] {',
      '  background: var(--accent, #2dd4bf);',
      '  border-color: var(--accent, #2dd4bf);',
      '  color: #062a25;',
      '  transform: none;',
      '}',

      '.project-grid .project-card {',
      '  transition: opacity 0.35s var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1)),',
      '              transform 0.35s var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1));',
      '}',

      '.project-grid .project-card.' + HIDING_CLASS + ' {',
      '  opacity: 0;',
      '  transform: scale(0.92);',
      '}',

      '.project-grid .project-card.' + HIDDEN_CLASS + ' {',
      '  display: none;',
      '}',

      '@media (prefers-reduced-motion: reduce) {',
      '  .project-grid .project-card {',
      '    transition: none;',
      '  }',
      '  .project-grid .project-card.' + HIDING_CLASS + ' {',
      '    opacity: 0;',
      '    transform: none;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function getTag(card) {
    var tagEl = card.querySelector('.project-tag');
    return tagEl ? tagEl.textContent.trim() : '';
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function hideCard(card) {
    if (prefersReducedMotion()) {
      card.classList.add(HIDDEN_CLASS);
      return;
    }
    card.classList.add(HIDING_CLASS);

    function onEnd() {
      card.removeEventListener('transitionend', onEnd);
      card.classList.add(HIDDEN_CLASS);
      card.classList.remove(HIDING_CLASS);
    }

    card.addEventListener('transitionend', onEnd);
    // Fallback timeout in case transitionend doesn't fire
    setTimeout(function () {
      card.removeEventListener('transitionend', onEnd);
      if (!card.classList.contains(HIDDEN_CLASS)) {
        card.classList.add(HIDDEN_CLASS);
        card.classList.remove(HIDING_CLASS);
      }
    }, TRANSITION_MS + 50);
  }

  function showCard(card) {
    if (prefersReducedMotion()) {
      card.classList.remove(HIDDEN_CLASS);
      card.classList.remove(HIDING_CLASS);
      return;
    }
    // Start hidden state for transition
    card.classList.add(HIDING_CLASS);
    card.classList.remove(HIDDEN_CLASS);

    // Force reflow so transition fires
    void card.offsetWidth;

    card.classList.remove(HIDING_CLASS);
  }

  function applyFilter(cards, category) {
    cards.forEach(function (card) {
      var tag = getTag(card);
      var visible = (category === 'All') || (tag === category);
      var isHidden = card.classList.contains(HIDDEN_CLASS);

      if (visible && isHidden) {
        showCard(card);
      } else if (!visible && !isHidden) {
        hideCard(card);
      }
    });
  }

  function init() {
    var grid = document.querySelector('.project-grid');
    if (!grid) return;
    if (grid.getAttribute(INIT_ATTR)) return;
    grid.setAttribute(INIT_ATTR, '1');

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.project-card'));
    if (!cards.length) return;

    // Collect unique tags in document order
    var seen = {};
    var tags = [];
    cards.forEach(function (card) {
      var tag = getTag(card);
      if (tag && !seen[tag]) {
        seen[tag] = true;
        tags.push(tag);
      }
    });

    // Build filter container
    var container = document.createElement('div');
    container.className = FILTER_CLASS;

    var categories = ['All'].concat(tags);
    var pills = [];

    categories.forEach(function (cat, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = cat;
      btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');

      btn.addEventListener('click', function () {
        pills.forEach(function (p) { p.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        applyFilter(cards, cat);
      });

      pills.push(btn);
      container.appendChild(btn);
    });

    grid.parentNode.insertBefore(container, grid);
  }

  injectStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
