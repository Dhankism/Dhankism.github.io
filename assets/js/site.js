/* ============================================================================
   Dharik Purohit — Portfolio v2 core JS
   Nav · reveal · counters · filter · command palette · back-to-top · analytics
   ============================================================================ */
(function () {
	'use strict';

	/* ═══════════ CONFIG ═══════════
	   Google Analytics 4 Measurement ID — see ANALYTICS_SETUP.md.
	   Leave placeholder to disable GA (local tracking still works). */
	var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
	/* Secret admin: type this word, or triple-click the corner dot. Password
	   is a light deterrent only (visible in source). '' disables the gate. */
	var ADMIN_SECRET_WORD = 'admin';
	var ADMIN_PASSWORD    = 'dharik';

	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var $  = function (s, c) { return (c || document).querySelector(s); };
	var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

	/* ── Footer year ───────────────────────────────────────────────────────── */
	function initYear() { var y = $('#year'); if (y) y.textContent = new Date().getFullYear(); }

	/* ── Navbar: scrolled state + mobile menu ──────────────────────────────── */
	function initNav() {
		var nav = $('#nav'), toggle = $('#navToggle'), links = $('#navLinks');
		function onScroll() { if (nav) nav.classList.toggle('scrolled', window.pageYOffset > 24); }
		window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
		if (toggle && links) {
			toggle.addEventListener('click', function () {
				var open = links.classList.toggle('open');
				document.body.classList.toggle('nav-open', open);
			});
			$$('a', links).forEach(function (a) {
				a.addEventListener('click', function () {
					links.classList.remove('open');
					document.body.classList.remove('nav-open');
				});
			});
		}
	}

	/* ── Scroll progress ───────────────────────────────────────────────────── */
	function initProgress() {
		var bar = $('#progress'); if (!bar) return;
		window.addEventListener('scroll', function () {
			var h = document.documentElement.scrollHeight - window.innerHeight;
			bar.style.width = (h > 0 ? (window.pageYOffset / h) * 100 : 0) + '%';
		}, { passive: true });
	}

	/* ── Reveal on scroll ──────────────────────────────────────────────────── */
	function initReveal() {
		var els = $$('.reveal');
		if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
		var obs = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) {
				if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
			});
		}, { threshold: 0.15 });
		els.forEach(function (e) { obs.observe(e); });
	}

	/* ── Animated counters ─────────────────────────────────────────────────── */
	function initCounters() {
		var items = $$('[data-count]'); if (!items.length) return;
		function run(el) {
			var target = parseInt(el.getAttribute('data-count'), 10);
			var suffix = el.getAttribute('data-suffix') || '';
			var out = $('.num', el); if (!out) return;
			if (reduce) { out.textContent = target + suffix; return; }
			var dur = 1400, start = null;
			function step(ts) {
				if (!start) start = ts;
				var p = Math.min((ts - start) / dur, 1);
				var e = 1 - Math.pow(1 - p, 3);
				out.textContent = Math.floor(e * target) + (p < 1 ? '' : suffix);
				if (p < 1) requestAnimationFrame(step); else out.textContent = target + suffix;
			}
			requestAnimationFrame(step);
		}
		if (!('IntersectionObserver' in window)) { items.forEach(run); return; }
		var obs = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); } });
		}, { threshold: 0.4 });
		items.forEach(function (e) { obs.observe(e); });
	}

	/* ── Project filter pills ──────────────────────────────────────────────── */
	function initFilter() {
		var bar = $('#filterBar'), grid = $('#projectsGrid');
		if (!bar || !grid) return;
		var cards = $$('.project', grid);
		var tags = []; cards.forEach(function (c) { var t = c.dataset.tag; if (t && tags.indexOf(t) < 0) tags.push(t); });
		var cats = ['All'].concat(tags);
		cats.forEach(function (cat, i) {
			var b = document.createElement('button');
			b.className = 'filter-pill' + (i === 0 ? ' active' : '');
			b.textContent = cat;
			b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
			b.addEventListener('click', function () {
				$$('.filter-pill', bar).forEach(function (p) { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
				b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
				cards.forEach(function (c) {
					var show = cat === 'All' || c.dataset.tag === cat;
					if (show) { c.style.display = ''; requestAnimationFrame(function () { c.classList.remove('hide'); }); }
					else {
						c.classList.add('hide');
						if (reduce) c.style.display = 'none';
						else setTimeout(function () { if (c.classList.contains('hide')) c.style.display = 'none'; }, 400);
					}
				});
			});
			bar.appendChild(b);
		});
	}

	/* ── Command palette (Ctrl/Cmd + K) ────────────────────────────────────── */
	function initPalette() {
		var ov = document.createElement('div'); ov.id = 'cmdk';
		ov.innerHTML = '<div class="cmdk-panel glass"><input type="text" id="cmdkInput" placeholder="Search projects & sections…" autocomplete="off"><ul id="cmdkList"></ul><div class="cmdk-hint">↑↓ navigate · ↵ open · esc close</div></div>';
		document.body.appendChild(ov);
		var input = $('#cmdkInput', ov), list = $('#cmdkList', ov), sel = 0, items = [];

		function build() {
			items = [];
			$$('#navLinks a').forEach(function (a) { items.push({ label: a.textContent.trim(), hint: 'Section', href: a.getAttribute('href') }); });
			$$('.project').forEach(function (c) {
				var h = $('h3', c); items.push({ label: h ? h.textContent.trim() : 'Project', hint: c.dataset.tag || 'Project', href: c.getAttribute('href') });
			});
		}
		function render(q) {
			q = (q || '').toLowerCase();
			var f = items.filter(function (it) { return (it.label + ' ' + it.hint).toLowerCase().indexOf(q) > -1; });
			sel = 0;
			list.innerHTML = f.map(function (it, i) {
				return '<li class="' + (i === 0 ? 'sel' : '') + '" data-href="' + it.href + '"><span>' + it.label + '</span><em>' + it.hint + '</em></li>';
			}).join('') || '<li class="empty">No matches</li>';
			$$('li[data-href]', list).forEach(function (li, i) {
				li.addEventListener('mouseenter', function () { setSel(i); });
				li.addEventListener('click', function () { go(li); });
			});
		}
		function rows() { return $$('li[data-href]', list); }
		function setSel(i) { var r = rows(); if (!r.length) return; sel = (i + r.length) % r.length; r.forEach(function (li, j) { li.classList.toggle('sel', j === sel); }); r[sel].scrollIntoView({ block: 'nearest' }); }
		function go(li) {
			var href = li.getAttribute('data-href'); close();
			if (href && href.charAt(0) === '#') { var t = $(href); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
			else if (href) window.location.href = href;
		}
		function open() { build(); render(''); ov.classList.add('open'); input.value = ''; setTimeout(function () { input.focus(); }, 50); }
		function close() { ov.classList.remove('open'); }

		input.addEventListener('input', function () { render(input.value); });
		input.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowDown') { e.preventDefault(); setSel(sel + 1); }
			else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(sel - 1); }
			else if (e.key === 'Enter') { var r = rows(); if (r[sel]) go(r[sel]); }
		});
		ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
		document.addEventListener('keydown', function (e) {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ov.classList.contains('open') ? close() : open(); }
			else if (e.key === 'Escape') close();
		});
	}

	/* ── Back to top ───────────────────────────────────────────────────────── */
	function initBackToTop() {
		var b = document.createElement('button'); b.id = 'toTop'; b.setAttribute('aria-label', 'Back to top');
		b.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
		document.body.appendChild(b);
		var ticking = false;
		window.addEventListener('scroll', function () {
			if (ticking) return; ticking = true;
			requestAnimationFrame(function () { b.classList.toggle('show', window.pageYOffset > window.innerHeight * 0.8); ticking = false; });
		}, { passive: true });
		b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
	}

	/* ── Analytics: local log + optional GA4 ───────────────────────────────── */
	function gaOn() { return /^G-[A-Z0-9]{6,}$/.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX'; }
	function track() {
		try {
			var K = 'dp_analytics', d = JSON.parse(localStorage.getItem(K) || '{}'), now = Date.now();
			var page = location.pathname.split('/').pop() || 'index.html';
			d.total = (d.total || 0) + 1; d.pages = d.pages || {}; d.pages[page] = (d.pages[page] || 0) + 1;
			d.recent = d.recent || []; d.recent.unshift({ page: page, t: now, ref: document.referrer || 'direct' }); d.recent = d.recent.slice(0, 50);
			d.first = d.first || now; d.last = now; localStorage.setItem(K, JSON.stringify(d));
		} catch (e) {}
	}
	function initAnalytics() {
		track();
		if (!gaOn()) return;
		var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
		document.head.appendChild(s); window.dataLayer = window.dataLayer || [];
		window.gtag = function () { window.dataLayer.push(arguments); };
		window.gtag('js', new Date()); window.gtag('config', GA_MEASUREMENT_ID);
	}

	/* ── Secret admin panel ────────────────────────────────────────────────── */
	function initAdmin() {
		var dot = document.createElement('div'); dot.id = 'admin-dot'; document.body.appendChild(dot);
		var ov = document.createElement('div'); ov.id = 'admin-overlay';
		ov.innerHTML = '<div class="admin-panel glass"><button class="admin-close" aria-label="Close">&times;</button><div class="admin-body"></div></div>';
		document.body.appendChild(ov);
		var body = $('.admin-body', ov), unlocked = !ADMIN_PASSWORD;
		function ago(ts) { var s = Math.floor((Date.now() - ts) / 1000); if (s < 60) return s + 's ago'; var m = Math.floor(s / 60); if (m < 60) return m + 'm ago'; var h = Math.floor(m / 60); if (h < 24) return h + 'h ago'; return Math.floor(h / 24) + 'd ago'; }
		function gate() {
			body.innerHTML = '<h2>🔒 Admin access</h2><p class="admin-sub">Enter the password to view analytics.</p><div class="admin-gate"><input type="password" id="apass" placeholder="Password" autocomplete="off"><button class="btn btn-primary" id="aunlock">Unlock</button></div>';
			var inp = $('#apass', body);
			function go() { if (inp.value === ADMIN_PASSWORD) { unlocked = true; stats(); } else { inp.value = ''; inp.placeholder = 'Wrong password'; inp.style.borderColor = '#ef4444'; } }
			$('#aunlock', body).addEventListener('click', go);
			inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
			setTimeout(function () { inp.focus(); }, 60);
		}
		function stats() {
			var d = {}; try { d = JSON.parse(localStorage.getItem('dp_analytics') || '{}'); } catch (e) {}
			var pages = d.pages || {}, ent = Object.keys(pages).map(function (k) { return [k, pages[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
			var rec = d.recent || [];
			var top = ent.length ? ent.map(function (e) { return '<li><span>' + e[0] + '</span><span class="count">' + e[1] + '</span></li>'; }).join('') : '<li><span>No data yet</span><span class="count">0</span></li>';
			var recent = rec.length ? rec.slice(0, 12).map(function (r) { return '<li><span>' + r.page + '</span><span class="count">' + ago(r.t) + '</span></li>'; }).join('') : '<li><span>No visits</span><span class="count">—</span></li>';
			body.innerHTML = '<h2>📊 Visitor analytics</h2><p class="admin-sub">' + (gaOn() ? 'Google Analytics live. Local log below.' : 'Local log (this browser). Add a GA ID for worldwide data.') + '</p>' +
				'<div class="admin-metrics"><div class="admin-metric"><span class="num">' + (d.total || 0) + '</span><span class="lbl">Local views</span></div><div class="admin-metric"><span class="num">' + ent.length + '</span><span class="lbl">Pages seen</span></div><div class="admin-metric"><span class="num">' + (d.last ? ago(d.last) : '—') + '</span><span class="lbl">Last visit</span></div></div>' +
				'<div class="admin-st">Top pages</div><ul class="admin-list">' + top + '</ul>' +
				'<div class="admin-st">Recent visits</div><ul class="admin-list">' + recent + '</ul>' +
				'<div class="admin-actions"><a class="btn btn-primary" href="https://analytics.google.com/" target="_blank" rel="noopener">Open Google Analytics ↗</a><button class="btn btn-ghost" id="areset">Reset local data</button></div>' +
				'<p class="admin-note">Local stats track only this browser. Real worldwide visitor data lives in Google Analytics.' + (gaOn() ? '' : ' GA not configured — see ANALYTICS_SETUP.md.') + '</p>';
			var r = $('#areset', body); if (r) r.addEventListener('click', function () { localStorage.removeItem('dp_analytics'); stats(); });
		}
		function open() { ov.classList.add('open'); unlocked ? stats() : gate(); }
		function close() { ov.classList.remove('open'); }
		$('.admin-close', ov).addEventListener('click', close);
		ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
		var clicks = 0, ct = null;
		dot.addEventListener('click', function () { clicks++; clearTimeout(ct); ct = setTimeout(function () { clicks = 0; }, 600); if (clicks >= 3) { clicks = 0; open(); } });
		var typed = '';
		document.addEventListener('keydown', function (e) { if (e.key && e.key.length === 1) { typed = (typed + e.key.toLowerCase()).slice(-ADMIN_SECRET_WORD.length); if (typed === ADMIN_SECRET_WORD.toLowerCase()) open(); } });
	}

	/* ── Load enhancement modules (built as separate files) ────────────────── */
	function loadModules() {
		var self = document.querySelector('script[src*="site.js"]');
		var base = self ? self.src.replace(/site\.js.*$/, '') : 'assets/js/';
		['preloader', 'cursor', 'lightbox'].forEach(function (name) {
			var s = document.createElement('script'); s.src = base + 'features/' + name + '.js'; s.async = true; document.head.appendChild(s);
		});
	}

	/* ── Init ──────────────────────────────────────────────────────────────── */
	function init() {
		initYear(); initNav(); initProgress(); initReveal(); initCounters();
		initFilter(); initPalette(); initBackToTop(); initAnalytics(); initAdmin(); loadModules();
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
