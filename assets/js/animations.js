/* Portfolio animations — scroll-reveal, typing, particles, counters, parallax, transitions */

(function () {
	'use strict';

	var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ── Intersection Observer: scroll-reveal ─────────────────────────────── */

	function initScrollReveal() {
		if (!('IntersectionObserver' in window)) {
			document.querySelectorAll('.reveal, .reveal-left').forEach(function (el) {
				el.classList.add('is-visible');
			});
			return;
		}
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12 });
		document.querySelectorAll('.reveal, .reveal-left').forEach(function (el) {
			observer.observe(el);
		});
	}

	/* ── Section heading watcher ──────────────────────────────────────────── */

	function initSectionHeadings() {
		if (!('IntersectionObserver' in window)) {
			document.querySelectorAll('section').forEach(function (s) {
				s.classList.add('is-visible');
			});
			return;
		}
		var sectionObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					sectionObserver.unobserve(entry.target);
				}
			});
		}, { threshold: 0.08 });
		document.querySelectorAll('section').forEach(function (s) {
			sectionObserver.observe(s);
		});
	}

	/* ── Typing effect ────────────────────────────────────────────────────── */

	function typeText(el, lines, charDelay, lineDelay) {
		var fullText = lines.join('\n');
		var cursor = document.createElement('span');
		cursor.className = 'typing-cursor';
		el.innerHTML = '';
		el.appendChild(cursor);
		var charIndex = 0;

		function typeNext() {
			if (charIndex >= fullText.length) {
				setTimeout(function () {
					if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
				}, 900);
				return;
			}
			var ch = fullText[charIndex++];
			if (ch === '\n') {
				el.insertBefore(document.createElement('br'), cursor);
				setTimeout(typeNext, lineDelay);
			} else {
				el.insertBefore(document.createTextNode(ch), cursor);
				setTimeout(typeNext, charDelay);
			}
		}
		typeNext();
	}

	function initTypingEffect() {
		var h1 = document.querySelector('#header h1[data-typing-target]');
		if (!h1) return;
		setTimeout(function () {
			typeText(h1, ['Dharik', 'Purohit'], 75, 120);
		}, 300);
	}

	/* ── Canvas particles in sidebar ──────────────────────────────────────── */

	function initParticles() {
		/* Skip on pages with model-viewer — 2D canvas ctx creation can trigger
		   WebGL context loss on some browsers/drivers, breaking the 3D viewer. */
		if (document.querySelector('model-viewer')) return;
		var header = document.getElementById('header');
		if (!header) return;

		var canvas = document.createElement('canvas');
		canvas.setAttribute('aria-hidden', 'true');
		canvas.style.cssText = [
			'position:absolute',
			'top:0', 'left:0',
			'width:100%', 'height:100%',
			'pointer-events:none',
			'z-index:0'
		].join(';');
		header.insertBefore(canvas, header.firstChild);

		var ctx = canvas.getContext('2d');
		var N = 30;
		var particles = [];

		function resize() {
			canvas.width  = header.offsetWidth;
			canvas.height = header.offsetHeight;
		}

		function makeParticle(initial) {
			return {
				x:     Math.random() * canvas.width,
				y:     initial ? Math.random() * canvas.height : canvas.height + 8,
				r:     Math.random() * 1.5 + 0.4,
				vx:    (Math.random() - 0.5) * 0.25,
				vy:    -(Math.random() * 0.35 + 0.12),
				alpha: Math.random() * 0.28 + 0.05
			};
		}

		for (var i = 0; i < N; i++) particles.push(makeParticle(true));

		var animating = true;

		function animate() {
			if (!animating) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (var j = 0; j < particles.length; j++) {
				var p = particles[j];
				p.x += p.vx;
				p.y += p.vy;
				if (p.y < -5) particles[j] = makeParticle(false);
				if (p.x < 0)            p.x = canvas.width;
				if (p.x > canvas.width) p.x = 0;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
				ctx.fillStyle = 'rgba(45,212,191,' + p.alpha + ')';
				ctx.fill();
			}
			requestAnimationFrame(animate);
		}

		resize();
		animate();

		window.addEventListener('resize', function () {
			resize();
			particles = particles.map(function (p) {
				return p.x > canvas.width ? makeParticle(true) : p;
			});
		});

		/* Pause when tab is hidden to save CPU */
		document.addEventListener('visibilitychange', function () {
			animating = !document.hidden;
			if (animating) animate();
		});
	}

	/* ── Scroll indicator ─────────────────────────────────────────────────── */

	function initScrollIndicator() {
		var indicator = document.getElementById('scroll-indicator');
		if (!indicator) return;
		window.addEventListener('scroll', function () {
			indicator.classList.toggle('hidden', window.pageYOffset > 90);
		}, { passive: true });
	}

	/* ── Animated counters ────────────────────────────────────────────────── */

	function initCounters() {
		var items = document.querySelectorAll('.stat-item[data-count]');
		if (!items.length) return;

		var container = document.getElementById('stats');
		if (!container) return;

		function animateCounter(el) {
			var target  = parseInt(el.getAttribute('data-count'), 10);
			var suffix  = el.getAttribute('data-suffix') || '';
			var display = el.querySelector('.stat-number');
			if (!display) return;

			var duration  = 1400;
			var startTime = null;

			function step(ts) {
				if (!startTime) startTime = ts;
				var progress = Math.min((ts - startTime) / duration, 1);
				var eased    = 1 - Math.pow(1 - progress, 3);
				display.textContent = Math.floor(eased * target) + (progress < 1 ? '' : suffix);
				if (progress < 1) requestAnimationFrame(step);
				else display.textContent = target + suffix;
			}
			requestAnimationFrame(step);
		}

		function startAll() { items.forEach(animateCounter); }

		/* Trigger counters when scroll-reveal adds is-visible to #stats */
		if (container.classList.contains('is-visible')) {
			startAll();
			return;
		}

		var mo = new MutationObserver(function (mutations) {
			mutations.forEach(function (m) {
				if (m.type === 'attributes' && container.classList.contains('is-visible')) {
					setTimeout(startAll, 100);
					mo.disconnect();
				}
			});
		});
		mo.observe(container, { attributes: true, attributeFilter: ['class'] });
	}

	/* ── Parallax section headings ────────────────────────────────────────── */

	function initParallax() {
		var headings = document.querySelectorAll('h2.parallax-heading');
		if (!headings.length) return;

		var ticking = false;

		function update() {
			var scrollY = window.pageYOffset;
			headings.forEach(function (el) {
				var rect       = el.getBoundingClientRect();
				var sectionTop = rect.top + scrollY;
				var offset     = (scrollY - sectionTop) * 0.05;
				el.style.transform = 'translateY(' + offset + 'px)';
			});
			ticking = false;
		}

		window.addEventListener('scroll', function () {
			if (!ticking) {
				requestAnimationFrame(update);
				ticking = true;
			}
		}, { passive: true });

		update();
	}

	/* ── Page transition overlay ──────────────────────────────────────────── */

	function initPageTransitions() {
		var overlay = document.getElementById('page-transition');
		if (!overlay) return;

		/* Clear overlay if page is restored from bfcache (back button) */
		window.addEventListener('pageshow', function (e) {
			if (e.persisted) overlay.classList.remove('active');
		});

		document.addEventListener('click', function (e) {
			var link = e.target.closest('a[href]');
			if (!link) return;
			var href = link.getAttribute('href');
			if (!href) return;
			/* Skip anchors, mailto, external, and blank-target links */
			if (href.startsWith('#') || href.startsWith('mailto:') || href.indexOf('://') !== -1) return;
			if (link.target === '_blank') return;

			e.preventDefault();
			overlay.classList.add('active');
			var dest = link.href;
			setTimeout(function () { window.location.href = dest; }, 380);
		});
	}

	/* ── Constellation background particles ───────────────────────────────── */

	function initBgParticles() {
		/* Skip on pages with model-viewer to avoid WebGL context issues */
		if (document.querySelector('model-viewer')) return;

		var canvas = document.createElement('canvas');
		canvas.setAttribute('aria-hidden', 'true');
		canvas.style.cssText = [
			'position:fixed',
			'top:0', 'left:0',
			'width:100%', 'height:100%',
			'pointer-events:none',
			'z-index:1'
		].join(';');
		document.body.insertBefore(canvas, document.body.firstChild);

		var ctx  = canvas.getContext('2d');
		var N    = 65;
		var LINK = 135;      /* max distance for particle–particle lines */
		var CURSOR_LINK = 170; /* max distance for cursor lines          */
		var particles = [];
		var mouse = { x: -9999, y: -9999, active: false };

		function resize() {
			canvas.width  = window.innerWidth;
			canvas.height = window.innerHeight;
		}

		function makeParticle(initial) {
			return {
				x:     Math.random() * canvas.width,
				y:     initial ? Math.random() * canvas.height : canvas.height + 8,
				r:     Math.random() * 2 + 0.5,
				vx:    (Math.random() - 0.5) * 0.28,
				vy:    -(Math.random() * 0.35 + 0.1),
				alpha: Math.random() * 0.18 + 0.06
			};
		}

		for (var i = 0; i < N; i++) particles.push(makeParticle(true));

		var animating = true;

		function animate() {
			if (!animating) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			/* Move particles */
			for (var j = 0; j < particles.length; j++) {
				var p = particles[j];
				p.x += p.vx;
				p.y += p.vy;
				if (p.y < -5)            particles[j] = makeParticle(false);
				if (p.x < 0)             p.x = canvas.width;
				if (p.x > canvas.width)  p.x = 0;
			}

			/* Draw particle–particle constellation lines */
			ctx.lineWidth = 0.7;
			for (var a = 0; a < particles.length - 1; a++) {
				for (var b = a + 1; b < particles.length; b++) {
					var dx   = particles[a].x - particles[b].x;
					var dy   = particles[a].y - particles[b].y;
					var dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < LINK) {
						var t = 1 - dist / LINK;
						ctx.beginPath();
						ctx.moveTo(particles[a].x, particles[a].y);
						ctx.lineTo(particles[b].x, particles[b].y);
						ctx.strokeStyle = 'rgba(45,212,191,' + (t * t * 0.18) + ')';
						ctx.stroke();
					}
				}
			}

			/* Draw cursor–particle lines when mouse is over the page */
			if (mouse.active) {
				ctx.lineWidth = 1;
				for (var k = 0; k < particles.length; k++) {
					var dx   = mouse.x - particles[k].x;
					var dy   = mouse.y - particles[k].y;
					var dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < CURSOR_LINK) {
						var t = 1 - dist / CURSOR_LINK;
						ctx.beginPath();
						ctx.moveTo(mouse.x, mouse.y);
						ctx.lineTo(particles[k].x, particles[k].y);
						ctx.strokeStyle = 'rgba(45,212,191,' + (t * t * 0.38) + ')';
						ctx.stroke();
					}
				}
			}

			/* Draw particles on top of lines */
			for (var j = 0; j < particles.length; j++) {
				var p = particles[j];
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
				ctx.fillStyle = 'rgba(45,212,191,' + p.alpha + ')';
				ctx.fill();
			}

			requestAnimationFrame(animate);
		}

		resize();
		animate();

		window.addEventListener('resize', function () {
			resize();
			particles = particles.map(function (p) {
				return p.x > canvas.width ? makeParticle(true) : p;
			});
		});

		window.addEventListener('mousemove', function (e) {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			mouse.active = true;
		}, { passive: true });

		window.addEventListener('mouseleave', function () {
			mouse.active = false;
		});

		document.addEventListener('visibilitychange', function () {
			animating = !document.hidden;
			if (animating) animate();
		});
	}

	/* ── Scroll progress bar ──────────────────────────────────────────────── */

	function initScrollProgress() {
		var bar = document.getElementById('scroll-progress');
		if (!bar) return;
		window.addEventListener('scroll', function () {
			var scrollTop  = window.pageYOffset || document.documentElement.scrollTop;
			var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
			var pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
			bar.style.width = pct + '%';
		}, { passive: true });
	}

	/* ── 3-D card tilt on hover ────────────────────────────────────────────── */

	function initCardTilt() {
		var cards = document.querySelectorAll('.project-card');
		cards.forEach(function (card) {
			card.addEventListener('mousemove', function (e) {
				var rect  = card.getBoundingClientRect();
				var rotX  = ((e.clientY - rect.top)  / rect.height - 0.5) * -7;
				var rotY  = ((e.clientX - rect.left) / rect.width  - 0.5) *  7;
				card.style.transform  = 'perspective(700px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-6px)';
				card.style.transition = 'transform 0.08s ease, box-shadow 0.3s ease, border-color 0.3s ease';
			});
			card.addEventListener('mouseleave', function () {
				card.style.transform  = '';
				card.style.transition = '';
			});
		});
	}

	/* ── Init ─────────────────────────────────────────────────────────────── */

	/* Load the custom-cursor module (self-contained; guards its own support) */
	function loadCursor() {
		var self = document.querySelector('script[src*="animations.js"]');
		var base = self ? self.src.replace(/animations\.js.*$/, '') : 'assets/js/';
		var s = document.createElement('script');
		s.src = base + 'cursor.js';
		s.async = true;
		document.head.appendChild(s);
	}

	function init() {
		loadCursor();

		if (prefersReducedMotion) {
			document.querySelectorAll('.reveal, .reveal-left').forEach(function (el) {
				el.classList.add('is-visible');
			});
			document.querySelectorAll('section').forEach(function (s) {
				s.classList.add('is-visible');
			});
			return;
		}

		initScrollProgress();
		initBgParticles();
		initScrollReveal();
		initSectionHeadings();
		initTypingEffect();
		initParticles();
		initScrollIndicator();
		initCounters();
		initParallax();
		initPageTransitions();
		initCardTilt();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

})();
