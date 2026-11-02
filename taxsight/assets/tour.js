/* TaxSight AI · guided 5-minute demo (the script from the proposal, section 7) */
(function () {
  'use strict';
  const { $, $$, tk, lakh, S, go, pickB, toast } = TX;
  const h = TS.hero, m = h.model;
  const STEPS = [
    { t: 'Open the 3D map of Zone 10', d: 'Every building glows green, amber or red by compliance. The AI scan has classified all ' + TS.total.toLocaleString('en-US') + ' buildings in this demo extract.', run: () => go('map', { keep: false }) },
    { t: 'Pick one red building', d: 'We zoom to a nine-storey mixed-use building on a main road. Status: under-declared.', run: () => { go('map', { keep: false }); setTimeout(() => { const mp = S.map; if (!mp) return; pickB(h); mp.sel = h; mp.onSelect && mp.onSelect(h); mp.focus(h, 1.7, 1.4); }, 1500); } },
    { t: 'Property 360', d: h.floors + ' floors built, ' + h.declFloors + ' declared. ' + h.shops.length + ' shops read from signboards. Residential gas tariff on a commercial floor.', run: () => { pickB(h); go('p360'); } },
    { t: 'The Owner Graph', d: 'The same owner is linked to ' + (h.cluster.count - 1) + ' more buildings under family and company names. Alone each looks small. Together they are one large undeclared portfolio.', run: () => { pickB(h); go('owners'); } },
    { t: 'Revenue Gap Engine', d: 'Estimated rent ' + tk(m.est) + ' per month, declared ' + tk(h.rentDecl) + '. Tax gap about ' + tk(h.gapAnnual, 0) + ' per year, ' + Math.round(m.conf * 100) + '% confidence. Try the sliders.', run: () => { pickB(h); go('gap'); } },
    { t: 'Prepare the notice', d: 'The copilot drafts a notice in Bangla with the legal reference, evidence photos and a plain-language reason. The officer reviews and signs.', run: () => { pickB(h); go('copilot', { auto: true }); } },
    { t: 'Back to the Command Centre', d: 'The chairman sees the result: Zone 10 found new taxable income this month, and how the AI ranking compares with a rules-only list.', run: () => go('command') },
    { t: 'Now the engine room', d: 'The same platform runs 25 zones. Drag the scale simulator, then run a re-score.', run: () => { go('platform'); } }
  ];
  let i = -1;
  const box = () => $('#tour');
  function render() {
    const s = STEPS[i]; const b = box(); b.style.display = 'block';
    b.innerHTML = '<div class="steps">' + STEPS.map((_, k) => '<i class="' + (k <= i ? 'on' : '') + '"></i>').join('') + '</div><div class="note" style="color:inherit;opacity:.6;margin-top:8px">Step ' + (i + 1) + ' of ' + STEPS.length + '</div><h4>' + s.t + '</h4><p>' + s.d + '</p><div class="row-flex" style="margin-top:12px"><button class="btn sm" id="tb">Back</button><span class="sp"></span><button class="btn sm" id="tx">Exit tour</button><button class="btn sm primary" id="tn">' + (i === STEPS.length - 1 ? 'Finish' : 'Next') + '</button></div>';
    if (window.gsap) gsap.from(b, { y: 16, opacity: 0, duration: 0.35, ease: 'power2.out' });
    $('#tb').disabled = i === 0; $('#tb').addEventListener('click', () => step(-1)); $('#tn').addEventListener('click', () => step(1)); $('#tx').addEventListener('click', stop);
  }
  function step(d) { const n = i + d; if (n < 0) return; if (n >= STEPS.length) { stop(); toast('Tour finished. Explore the other modules from the left.'); return; } i = n; S.tour = i; STEPS[i].run(); render(); }
  function start() { S.role !== 'admin' && TX.setRole('admin', null, true); i = -1; step(1); }
  function stop() { box().style.display = 'none'; S.tour = null; i = -1; }
  document.addEventListener('keydown', (e) => { if (S.tour == null || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return; if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'Escape') stop(); });
  TX.tour = { start, stop };
})();
