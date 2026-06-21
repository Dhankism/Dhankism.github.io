/**
 * cursor.js — Custom cursor (dot + lagging ring) + magnetic buttons.
 * Self-contained IIFE; injects its own <style> (id="cursor-styles").
 * Desktop / fine-pointer only; respects prefers-reduced-motion.
 */
(function () {
	'use strict';

	/* Guards: fine pointer + hover only, motion-safe, no double init */
	if (!window.matchMedia('(pointer:fine)').matches ||
	    !window.matchMedia('(hover:hover)').matches) return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	if (document.getElementById('cursor-styles')) return;

	var ACCENT     = 'var(--accent, #2dd4bf)';
	var ACCENT_RGB = 'var(--accent-rgb, 45,212,191)';
	var EASE       = 'var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1))';

	var RING = 34, RING_HOVER = 54, DOT = 8, LERP = 0.14, MAG = 8;

	/* Elements that grow the ring on hover (main's markup) */
	var HOVER_SELECTOR = 'a, button, .button, input, textarea, select, .project-card, .image.context';
	/* Elements that pull toward the pointer (buttons only — cards already tilt) */
	var MAG_SELECTOR   = '.button, [data-magnetic]';

	var style = document.createElement('style');
	style.id = 'cursor-styles';
	style.textContent = [
		'html.has-custom-cursor, html.has-custom-cursor body,',
		'html.has-custom-cursor a, html.has-custom-cursor button,',
		'html.has-custom-cursor .button, html.has-custom-cursor input,',
		'html.has-custom-cursor textarea, html.has-custom-cursor .project-card { cursor: none !important; }',

		'#cursor-dot {',
		'  position: fixed; top: 0; left: 0; width: ' + DOT + 'px; height: ' + DOT + 'px;',
		'  border-radius: 50%; background: ' + ACCENT + '; pointer-events: none;',
		'  z-index: 99999; transform: translate(-50%, -50%); will-change: transform;',
		'  transition: opacity 0.3s ease; opacity: 0;',
		'}',

		'#cursor-ring {',
		'  position: fixed; top: 0; left: 0; width: ' + RING + 'px; height: ' + RING + 'px;',
		'  border-radius: 50%; border: 1px solid rgba(' + ACCENT_RGB + ', 0.7);',
		'  pointer-events: none; z-index: 99998; transform: translate(-50%, -50%);',
		'  will-change: transform, width, height; opacity: 0;',
		'  transition: width 0.25s ' + EASE + ', height 0.25s ' + EASE + ',',
		'    border-color 0.25s ease, background 0.25s ease, opacity 0.3s ease;',
		'}',

		'#cursor-ring.cursor-hover {',
		'  width: ' + RING_HOVER + 'px; height: ' + RING_HOVER + 'px;',
		'  border-color: rgba(' + ACCENT_RGB + ', 1); background: rgba(' + ACCENT_RGB + ', 0.08);',
		'}'
	].join('\n');
	document.head.appendChild(style);

	var dot  = document.createElement('div'); dot.id  = 'cursor-dot';
	var ring = document.createElement('div'); ring.id = 'cursor-ring';
	document.body.appendChild(dot);
	document.body.appendChild(ring);
	document.documentElement.classList.add('has-custom-cursor');

	var mx = -999, my = -999, rx = -999, ry = -999, visible = false;

	function tick() {
		rx += (mx - rx) * LERP;
		ry += (my - ry) * LERP;
		dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
		ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
		requestAnimationFrame(tick);
	}

	document.addEventListener('mousemove', function (e) {
		mx = e.clientX; my = e.clientY;
		if (!visible) { rx = mx; ry = my; dot.style.opacity = '1'; ring.style.opacity = '1'; visible = true; }
	}, { passive: true });
	document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; ring.style.opacity = '0'; }, { passive: true });
	document.addEventListener('mouseenter', function () { if (visible) { dot.style.opacity = '1'; ring.style.opacity = '1'; } }, { passive: true });

	try {
		document.querySelectorAll(HOVER_SELECTOR).forEach(function (el) {
			el.addEventListener('mouseenter', function () { ring.classList.add('cursor-hover'); }, { passive: true });
			el.addEventListener('mouseleave', function () { ring.classList.remove('cursor-hover'); }, { passive: true });
		});
	} catch (e) {}

	var MAG_TRANSITION = 'transform 0.35s ' + EASE;
	try {
		document.querySelectorAll(MAG_SELECTOR).forEach(function (el) {
			el.addEventListener('mousemove', function (ev) {
				var r = el.getBoundingClientRect();
				var nx = Math.max(-1, Math.min(1, (ev.clientX - (r.left + r.width / 2)) / (r.width / 2)));
				var ny = Math.max(-1, Math.min(1, (ev.clientY - (r.top + r.height / 2)) / (r.height / 2)));
				el.style.transform = 'translate(' + (nx * MAG) + 'px,' + (ny * MAG) + 'px)';
				el.style.transition = MAG_TRANSITION;
			}, { passive: true });
			el.addEventListener('mouseleave', function () {
				el.style.transform = 'translate(0,0)';
				el.style.transition = MAG_TRANSITION;
			}, { passive: true });
		});
	} catch (e) {}

	requestAnimationFrame(tick);
}());
