/**
 * effects.js — third-party flair, loaded from CDN.
 *   • Lenis — smooth momentum scrolling (site-wide)
 * Skipped under prefers-reduced-motion. Self-contained; no build step.
 */
(function () {
	'use strict';

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	function loadScript(src, cb) {
		var s = document.createElement('script');
		s.src = src; s.async = true;
		s.onload = cb || function () {};
		s.onerror = function () { /* CDN unreachable — fail silently */ };
		document.head.appendChild(s);
	}

	/* ── Lenis smooth scroll ───────────────────────────────────────────────── */
	function initLenis() {
		if (typeof window.Lenis !== 'function') return;

		var css = document.createElement('style');
		css.textContent =
			'html.lenis, html.lenis body { height: auto; }' +
			'.lenis.lenis-smooth { scroll-behavior: auto !important; }' +
			'.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }' +
			'.lenis.lenis-stopped { overflow: hidden; }';
		document.head.appendChild(css);

		var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.5 });
		function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
		requestAnimationFrame(raf);
		window.__lenis = lenis;

		document.addEventListener('click', function (e) {
			var a = e.target.closest && e.target.closest('a[href^="#"]');
			if (!a) return;
			var id = a.getAttribute('href');
			if (id && id.length > 1) {
				var target = document.querySelector(id);
				if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -10 }); }
			}
		});
	}
	loadScript('https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js', initLenis);
}());
