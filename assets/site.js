/* ------------------------------------------------------------------
   NUMBERS — edit these to update every page at once.
   Last checked: 16 Oct 2026.
------------------------------------------------------------------- */
var FOLLOWERS = {
  twitch: 59067,
  youtube: 32500,
  tiktok: 51800,
  instagram: 47507,
  x: 47600
};
var MONTHLY = {
  videoViews: 5000000,   // monthly video views (YouTube + TikTok + Instagram)
  siteVisits: 100000     // monthly SkinSniper visits
};

(function () {
  var root = document.documentElement;

  /* always open a page at the top (unless the link points to a section) */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  function toTop() { if (!location.hash) { try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, 0); } } }
  toTop();
  window.addEventListener('load', toTop);
  window.addEventListener('pageshow', toTop);

  function short(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return String(n);
  }
  var total = 0;
  for (var k in FOLLOWERS) total += FOLLOWERS[k];
  var values = { total: total, monthlyViews: MONTHLY.videoViews, monthlyVisits: MONTHLY.siteVisits };
  for (var f in FOLLOWERS) values[f] = FOLLOWERS[f];
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var n = values[el.getAttribute('data-count')];
    if (typeof n === 'number') el.textContent = short(n) + (el.hasAttribute('data-plus') ? '+' : '');
  });

  /* language */
  var titles = { es: document.title, en: (document.querySelector('meta[name="title-en"]') || {}).content || document.title };
  /* SkinSniper links follow the language: /es/ pages when Spanish is selected */
  var SS = 'https://skinsniper.com';
  function skinsniperLinks(l) {
    document.querySelectorAll('a[href^="' + SS + '"]').forEach(function (a) {
      var base = a.getAttribute('data-ss') || a.getAttribute('href').replace(SS + '/es/', SS + '/').replace(/\/es$/, '');
      a.setAttribute('data-ss', base);
      a.setAttribute('href', l === 'es' ? base.replace(SS, SS + '/es') : base);
    });
  }
  function setLang(l) {
    skinsniperLinks(l);
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l);
    document.title = titles[l];
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set') === l));
    });
  }
  var saved = null;
  try { saved = localStorage.getItem('mrgb-lang'); } catch (e) {}
  setLang(saved === 'en' || saved === 'es' ? saved : 'es');
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = b.getAttribute('data-set');
      setLang(l);
      try { localStorage.setItem('mrgb-lang', l); } catch (e) {}
    });
  });

  /* mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* skin carousel: scrolls on its own, plus arrows and drag/swipe */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.car-wrap').forEach(function (wrap) {
    var c = wrap.querySelector('.carousel'), track = c.querySelector('.track');
    Array.prototype.slice.call(track.children).forEach(function (el) {
      var copy = el.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); copy.tabIndex = -1; track.appendChild(copy);
    });
    c.classList.add('js');
    var x = 0, half = 0, speed = 28, hovering = false, dragging = false, resumeAt = 0, target = null, last = 0;
    var startX = 0, startPos = 0, moved = 0, pid = null;
    function measure() { half = track.scrollWidth / 2; }
    function wrapX(v) { if (!half) return v; v = v % half; if (v > 0) v -= half; return v; }
    function step() { var first = track.children[0]; return first ? first.getBoundingClientRect().width + 12 : 200; }
    function render() { track.style.transform = 'translate3d(' + x + 'px,0,0)'; }
    function tick(now) {
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0; last = now;
      if (!dragging) {
        if (target !== null) {
          var d = target - x; x += d * Math.min(1, dt * 9);
          if (Math.abs(d) < 0.5) { x = target; target = null; }
        } else if (!reduce && !hovering && now > resumeAt) {
          x -= speed * dt;
        }
        var w = wrapX(x); if (target !== null) target += (w - x); x = w;
      }
      render(); requestAnimationFrame(tick);
    }
    function nudge(dir) {
      var base = target !== null ? target : x;
      var dest = base - dir * step() * 2;
      if (dest > 0) { x -= half; dest -= half; }
      if (dest < -half) { x += half; dest += half; }
      target = dest; resumeAt = performance.now() + 4000;
      if (reduce) { x = wrapX(dest); target = null; }
    }
    wrap.querySelector('.prev').addEventListener('click', function () { nudge(-1); });
    wrap.querySelector('.next').addEventListener('click', function () { nudge(1); });
    c.addEventListener('mouseenter', function () { hovering = true; });
    c.addEventListener('mouseleave', function () { hovering = false; });
    c.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true; target = null; moved = 0; startX = e.clientX; startPos = x; pid = e.pointerId;
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) { c.classList.add('grabbing'); try { c.setPointerCapture(pid); } catch (er) {} }
      x = startPos + dx;
      if (x > 0) { x -= half; startPos -= half; }
      if (x < -half) { x += half; startPos += half; }
    });
    function end(e) {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false; c.classList.remove('grabbing'); resumeAt = performance.now() + 3000;
    }
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    c.addEventListener('click', function (e) { if (moved > 5) { e.preventDefault(); e.stopPropagation(); } }, true);
    c.addEventListener('dragstart', function (e) { e.preventDefault(); });
    measure(); window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    requestAnimationFrame(tick);
  });

  /* screenshot galleries */
  document.querySelectorAll('.gallery').forEach(function (g) {
    var slides = g.querySelectorAll('.slide');
    var btns = g.querySelectorAll('.thumbs button');
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        slides.forEach(function (s, j) { s.hidden = j !== i; });
        btns.forEach(function (x, j) { x.setAttribute('aria-pressed', String(j === i)); });
      });
    });
  });

  /* copy email */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('data-copy'));
    var label = btn.innerHTML;
    function done(ok) {
      var en = root.getAttribute('data-lang') === 'en';
      btn.textContent = ok ? (en ? 'Copied' : 'Copiado') : (en ? 'Selected' : 'Seleccionado');
      setTimeout(function () { btn.innerHTML = label; }, 1800);
    }
    function selectIt() { var r = document.createRange(); r.selectNodeContents(target); var s = getSelection(); s.removeAllRanges(); s.addRange(r); done(false); }
    btn.addEventListener('click', function () {
      try { navigator.clipboard.writeText(target.textContent.trim()).then(function () { done(true); }, selectIt); } catch (e) { selectIt(); }
    });
  });
})();
