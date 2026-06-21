(function () {
  'use strict';

  var STYLE_ID = 'skills-styles';
  var SECTION_ID = 'skills';

  var SKILL_GROUPS = [
    {
      label: 'Design & CAD',
      skills: ['SolidWorks', 'CAD', 'GD&T', 'DFM', 'Rapid Prototyping', '3D Printing']
    },
    {
      label: 'Software',
      skills: ['Python', 'ROS2', 'C#', 'MATLAB', 'Git', 'Linux']
    },
    {
      label: 'Engineering',
      skills: ['Mechatronics', 'FEA', 'Fluid Dynamics', 'Control Systems', 'System Integration']
    }
  ];

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      /* Group label */
      '.skills-group-label {',
      '  display: block;',
      '  font-size: 0.7em;',
      '  font-weight: 600;',
      '  letter-spacing: 0.1em;',
      '  text-transform: uppercase;',
      '  color: var(--ink-soft, #4b5563);',
      '  margin: 1.2em 0 0.5em;',
      '}',
      '.skills-group-label:first-child {',
      '  margin-top: 0;',
      '}',

      /* Chip container */
      '.skills-chip-row {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 0.45em;',
      '  margin-bottom: 0.25em;',
      '}',

      /* Individual chip */
      '.skill-tag {',
      '  background: rgba(45, 212, 191, 0.1);',
      '  border: 1px solid rgba(45, 212, 191, 0.32);',
      '  color: var(--accent, #2dd4bf);',
      '  border-radius: 2em;',
      '  padding: 0.4em 0.9em;',
      '  font-size: 0.78em;',
      '  letter-spacing: 0.05em;',
      '  cursor: default;',
      '  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;',
      '}',
      '.skill-tag:hover {',
      '  background: rgba(45, 212, 191, 0.22);',
      '  border-color: var(--accent, #2dd4bf);',
      '  transform: translateY(-2px);',
      '}',

      /* Entry animation — chips start invisible and shifted down */
      '.skill-tag[data-animate] {',
      '  opacity: 0;',
      '  transform: translateY(12px);',
      '  transition:',
      '    opacity 0.5s var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1)),',
      '    transform 0.5s var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1));',
      '}',
      '#skills.in-view .skill-tag[data-animate] {',
      '  opacity: 1;',
      '  transform: translateY(0);',
      '}',

      /* Reduced-motion: skip animation entirely */
      '@media (prefers-reduced-motion: reduce) {',
      '  .skill-tag[data-animate] {',
      '    opacity: 1;',
      '    transform: none;',
      '    transition: none;',
      '    transition-delay: 0ms !important;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function buildSection() {
    var section = document.createElement('section');
    section.id = SECTION_ID;

    /* Heading — matches site pattern for parallax + underline-reveal */
    var header = document.createElement('header');
    header.className = 'major';
    var h2 = document.createElement('h2');
    h2.className = 'parallax-heading';
    var span = document.createElement('span');
    span.className = 'section-heading';
    span.textContent = 'Tech Stack';
    h2.appendChild(span);
    header.appendChild(h2);
    section.appendChild(header);

    var chipIndex = 0;

    SKILL_GROUPS.forEach(function (group) {
      /* Group label */
      var label = document.createElement('span');
      label.className = 'skills-group-label';
      label.textContent = group.label;
      section.appendChild(label);

      /* Chip row */
      var row = document.createElement('div');
      row.className = 'skills-chip-row';

      group.skills.forEach(function (skill) {
        var chip = document.createElement('span');
        chip.className = 'skill-tag';
        chip.textContent = skill;

        /* Staggered delay via inline style; skipped in reduced-motion via CSS */
        chip.setAttribute('data-animate', '');
        chip.style.transitionDelay = (chipIndex * 40) + 'ms';
        chipIndex++;

        row.appendChild(chip);
      });

      section.appendChild(row);
    });

    return section;
  }

  function attachObserver(section) {
    if (!('IntersectionObserver' in window)) {
      /* Fallback: just make everything visible */
      section.classList.add('in-view');
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(section);
  }

  function init() {
    /* Homepage-only guard */
    var about = document.getElementById('about');
    if (!about) return;

    /* Double-init guard */
    if (document.getElementById(SECTION_ID)) return;

    injectStyles();

    var section = buildSection();

    /* If reduced-motion, mark visible immediately so CSS override takes effect */
    if (prefersReducedMotion()) {
      section.classList.add('in-view');
    }

    /* Insert immediately after #about */
    var next = about.nextSibling;
    about.parentNode.insertBefore(section, next);

    /* Attach scroll observer (no-op in reduced-motion since already in-view) */
    if (!prefersReducedMotion()) {
      attachObserver(section);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
