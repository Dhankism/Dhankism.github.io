/**
 * effects.js — third-party flair, loaded from CDN.
 *   • Lenis   — smooth momentum scrolling (site-wide)
 *   • Vanta.js NET — animated WebGL background on the dark sidebar (homepage)
 * Both are skipped under prefers-reduced-motion. Self-contained; no build step.
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

		/* Recommended Lenis base CSS */
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

		/* Make existing in-page anchor links scroll smoothly via Lenis */
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

	/* ── Vanta.js NET on the sidebar (homepage only) ───────────────────────── */
	function initVanta() {
		var header = document.getElementById('header');
		if (!header) return;
		/* Skip when a model-viewer is present to avoid competing WebGL contexts */
		if (document.querySelector('model-viewer')) return;
		if (!window.VANTA || !window.VANTA.NET) return;

		/* Remove the hand-rolled particle canvas so they don't stack */
		var old = header.querySelector('canvas');
		if (old) old.remove();

		try {
			window.__vanta = window.VANTA.NET({
				el: header,
				mouseControls: true,
				touchControls: true,
				gyroControls: false,
				minHeight: 200.0,
				minWidth: 200.0,
				scale: 1.0,
				scaleMobile: 1.0,
				color: 0x2dd4bf,
				backgroundColor: 0x111827,
				points: 8.0,
				maxDistance: 20.0,
				spacing: 16.0,
				showDots: true
			});
		} catch (e) { /* WebGL unavailable — fail silently */ }
	}
	loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js', function () {
		loadScript('https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.net.min.js', initVanta);
	});
}());
