/* TaxSight AI · app shell */
(function () {
  'use strict';
  const { $, $$, S, go, on, icon, toast, audit, scramble } = TX;
  if (window.gsap) { gsap.registerPlugin(window.ScrollTrigger); }

  TX.setRole = (r, stay, silent) => {
    S.role = r; $('#role').value = r; const R = TS.ROLES[r];
    audit(R.name, 'Switched demo role'); TX.buildNav();
    const ok = R.views.includes(S.view) || (S.view === 'p360' && R.views.includes('map'));
    if (stay && R.views.includes(stay)) go(stay); else if (!ok) go(R.views[0]); else go(S.view);
    if (!silent) toast(R.name + ': sees ' + R.scope.toLowerCase() + '. Personal data: ' + R.pii.toLowerCase() + '.');
  };

  function boot() {
    TX.initTheme();
    $('#role').innerHTML = Object.entries(TS.ROLES).map(([k, r]) => '<option value="' + k + '">' + r.name + '</option>').join('');
    $('#role').value = S.role;
    $('#role').addEventListener('change', (e) => TX.setRole(e.target.value));
    $('#themeBtn').addEventListener('click', () => TX.setTheme(S.theme === 'dark' ? 'light' : 'dark'));
    $('#tourBtn').addEventListener('click', () => TX.tour.start());
    $('#nav').addEventListener('click', (e) => { const b = e.target.closest('[data-view]'); if (b) go(b.dataset.view); });
    TX.bindTips(document.body); TX.spotlight(document.body);
    // unmask personal data (logged)
    const unmask = (el) => { if (el.classList.contains('on')) return; const R = TS.ROLES[S.role]; if (!/unmask/.test(R.pii)) { toast('Your role (' + R.name + ') cannot unmask personal data.'); audit(R.name, 'Blocked: tried to unmask ' + el.dataset.label); return; } el.classList.add('on'); scramble(el, el.dataset.unmask, 0.6); const r = audit(R.name, 'Unmasked ' + el.dataset.label); toast('Revealed ' + el.dataset.label + '. This access is recorded (' + r.hash + ').'); };
    document.addEventListener('click', (e) => { const m = e.target.closest('.mask'); if (m) unmask(m); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const m = e.target.closest && e.target.closest('.mask'); if (m) unmask(m); } });
    document.addEventListener('keydown', (e) => { if (e.key === 't' && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) && !e.metaKey && !e.ctrlKey) TX.setTheme(S.theme === 'dark' ? 'light' : 'dark'); });
    const hash = location.hash.slice(1); const start = hash && TX.VIEWS[hash] ? hash : 'command';
    go(start);
    const welcome = $('#welcome');
    if (new URLSearchParams(location.search).has('skipintro') || hash) { welcome.remove(); } else {
      TX.splitReveal($('#wt'), 0.1);
      if (window.gsap) gsap.from('#welcome .wb > *:not(h1)', { opacity: 0, y: 14, duration: 0.6, stagger: 0.1, delay: 0.5 });
      $('#w1').addEventListener('click', () => { welcome.remove(); TX.tour.start(); });
      $('#w2').addEventListener('click', () => { gsap.to(welcome, { opacity: 0, duration: 0.35, onComplete: () => welcome.remove() }); });
    }
  }
  document.fonts && document.fonts.ready ? document.fonts.ready.then(boot) : boot();
})();
