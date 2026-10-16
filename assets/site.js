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
  function setLang(l) {
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

  /* skin carousel: clone the row once so it loops seamlessly */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.carousel').forEach(function (c) {
    if (reduce) return;
    var track = c.querySelector('.track');
    Array.prototype.slice.call(track.children).forEach(function (el) {
      var copy = el.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); track.appendChild(copy);
    });
    c.style.setProperty('--dur', (track.children.length * 3.2) + 's');
    c.classList.add('running');
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
