/* TaxSight AI · deck engine */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IC = {
    layers: '<path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5"/>', network: '<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M11 7 6 16M13 7l5 9M7.5 18h9"/>', scale: '<path d="M12 4v16M6 20h12M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>', doc: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>', phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>', grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    building: '<path d="M5 21V4h9v17M14 9h5v12M3 21h18M8 8h3M8 12h3M8 16h3"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>', eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', flag: '<path d="M5 21V4M5 5h12l-2 4 2 4H5"/>', db: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>', bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6 8-6s7 1.5 8 6"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'
  };
  const ico = (n) => '<div class="ico"><svg viewBox="0 0 24 24">' + IC[n] + '</svg></div>';
  const tk = (n) => (n >= 1e7 ? (n / 1e7).toFixed(1) + ' crore' : n >= 1e5 ? (n / 1e5).toFixed(1) + ' lakh' : Math.round(n).toLocaleString());

  // ---------- content ----------
  const MODS = [['building', 'Property 360', 'One profile per building and owner: floors, units, tenants, filings, photos, change history.'], ['network', 'Owner Graph', 'Links people, families and companies. Finds one owner with ten flats under five names.'], ['scale', 'Revenue Gap Engine', 'AI fair rent and value per unit against declared income. Taka gap with a range.'], ['target', 'Smart Targeting', 'Ranks cases by expected recovery per officer hour. Builds daily routes.'], ['doc', 'Notice and Case Copilot', 'Drafts the notice in Bangla and English with the legal reference. Officer signs.'], ['phone', 'Field App', 'Offline photo capture with on-device AI check, Bangla voice notes, auto-sync.'], ['grid', 'Executive Command Centre', 'Live map and KPIs: revenue found, notices, collected, appealed. Zone league table.']];
  $('#mods').innerHTML = MODS.map((m, i) => '<div class="card" data-a style="padding:16px">' + ico(m[0]) + '<h3 style="font-size:15px">' + m[1] + '</h3><p style="font-size:13px">' + m[2] + '</p></div>').join('') + '<div class="card" data-a style="padding:16px;border-style:dashed;display:flex;align-items:center;justify-content:center;text-align:center"><p class="sm">Roles: commissioner, assessment officer, inspector, RMD leadership, taxpayer</p></div>';

  const CAPS = [['What is really there?', ['Floor and extension detection', 'Use classification', 'Bangla signage OCR', 'Occupancy estimation']], ['Who owns it?', ['Entity resolution', 'Owner network graph']], ['How much is owed?', ['AI rent model', 'Lifestyle vs income check']], ['Who first?', ['Anomaly detection', 'Smart targeting score']], ['What do we do now?', ['Case and notice copilot', 'Ask-the-data copilot']]];
  $('#caps').innerHTML = CAPS.map((c, i) => '<div class="card" data-a style="padding:16px;' + (i === 4 ? 'border-color:var(--brand-line);background:var(--brand-soft)' : '') + '"><div class="sm" style="margin-bottom:6px">' + ['Detection', 'Linking', 'Valuation', 'Prioritisation', 'Action'][i] + '</div><h3 style="font-size:16px;margin-bottom:12px">' + c[0] + '</h3>' + c[1].map((x) => '<div class="row" style="padding:7px 0;border-top:1px solid var(--line);font-size:13px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + IC.check + '</svg>' + x + '</div>').join('') + '</div>').join('');

  const L = [['Data sources', 'IWM survey and agency records', [['IWM survey', 'LiDAR, MMS, satellite, maps'], ['Tax and land', 'TIN, holding, e-Porcha, IGR'], ['Utilities', 'DESCO, DPDC, Titas, WASA'], ['Open data', 'Rent listings, business lists']]], ['Data platform', 'Geospatial lakehouse', [['Ingestion', 'APIs, batch, streaming'], ['Lakehouse', 'Bronze, silver, gold'], ['Geo store', 'PostGIS, Sedona, 3D Tiles'], ['Feature store', 'Building and owner features']]], ['AI layer', 'Our core contribution', [['Vision AI', 'Floors, use, Bangla OCR'], ['Entity graph', 'Owner match, network'], ['Valuation', 'Rent and value models'], ['Risk + GenAI', 'Target score, copilot']], 1], ['Applications', 'What officers use', [['Command Centre', 'Map, KPIs, forecast'], ['Officer desk', 'Property 360, queue'], ['Field app', 'Offline, on-device AI'], ['Taxpayer view', 'Evidence, dispute, pay']]]];
  $('#arch').innerHTML = L.map((l) => '<div class="lay' + (l[3] ? ' ai' : '') + '" data-a><div class="ln"><b>' + l[0] + '</b><span>' + l[1] + '</span></div><div class="bl">' + l[2].map((b, k) => '<div class="bk" style="--d:' + k * 0.4 + 's"><b>' + b[0] + '</b><span>' + b[1] + '</span></div>').join('') + '</div></div>').join('') + '<div class="lay" data-a style="margin-top:4px"><div class="ln" style="background:none;border-style:dashed"><b>Security</b><span>All layers</span></div><div class="row sm" style="gap:8px;flex-wrap:wrap">' + ['Role and zone access', 'MFA', 'PII masked', 'Immutable audit logs', 'In-country hosting', 'Open-weight LLMs on premise', 'Model audit and bias tests', 'MLOps'].map((x) => '<span class="tag">' + x + '</span>').join('') + '</div></div>';

  const sizing = (z) => { const b = z * 10000; return { b, lidar: z * 0.39, gpu: Math.ceil((b * 1.4) / 86400), cores: Math.max(8, Math.ceil((b * 46) / 86400)), tb: z * 0.42 }; };
  const SC = [['Pilot', 'Tax Zone 10', 1], ['Dhaka', '25 tax zones', 25], ['National', 'planning case', 120]];
  $('#scale').innerHTML = SC.map((s, i) => { const z = sizing(s[2]); return '<div class="card" data-a style="' + (i === 1 ? 'border-color:var(--brand-line);background:var(--brand-soft)' : '') + '"><div class="row"><h3 style="font-size:18px;margin:0">' + s[0] + '</h3><span class="sp"></span><span class="tag ' + (i === 1 ? 'brand' : '') + '">' + s[1] + '</span></div><div class="num" style="margin:16px 0 2px" data-count="' + z.b + '">' + z.b.toLocaleString() + '</div><div class="sm">buildings</div><div class="hair"></div><div class="grid g2" style="gap:10px"><div><div class="num sm2">' + (z.lidar < 10 ? z.lidar.toFixed(2) : z.lidar.toFixed(1)) + ' B</div><div class="sm">LiDAR points</div></div><div><div class="num sm2">' + (z.tb < 10 ? z.tb.toFixed(1) : Math.round(z.tb)) + ' TB</div><div class="sm">storage</div></div><div><div class="num sm2">' + z.gpu + '</div><div class="sm">GPUs for a 24 h re-score</div></div><div><div class="num sm2">' + z.cores + '</div><div class="sm">CPU cores</div></div></div></div>'; }).join('');

  const TR = [['user', 'Human in the loop', 'No notice is sent without an officer\'s review and digital signature.'], ['eye', 'Explainable', 'Every score shows its top reasons, such as "4 undeclared floors, rent 3x declared".'], ['lock', 'Data stays in Bangladesh', 'National data centre or sovereign cloud. Open-weight LLMs run on premise.'], ['shield', 'Every action logged', 'Who viewed which taxpayer, which model version scored them. Tamper-proof for audit and court.'], ['flag', 'Fairness tests', 'Bias checks by area, building type and owner group. No religion, ethnicity or politics.'], ['check', 'Accuracy tracking', 'Hit rate, false positives and appeal losses reported monthly per model.'], ['doc', 'Taxpayer rights', 'Taxpayers see the evidence behind a notice and can dispute it online.'], ['route', 'Anti-corruption', 'Case assignment is automatic and logged, which limits discretion and side deals.']];
  $('#trust').innerHTML = TR.map((t) => '<div class="card" data-a style="padding:16px">' + ico(t[0]) + '<h3 style="font-size:15px">' + t[1] + '</h3><p style="font-size:13px">' + t[2] + '</p></div>').join('');

  const ASKS = [['mail', 'Data-sharing letters', 'Formal NBR letters to e-Return and TIN, e-Porcha, IGR, DESCO, DPDC, Titas, WASA, RAJUK and the city corporations.'], ['db', 'Hosting decision', 'BCC national data centre, NBR servers or an approved cloud region. Everything else follows from this.'], ['user', 'Sponsors and focal team', 'One sponsor each in the policy and revenue management divisions, plus a Zone 10 focal team.'], ['target', 'Pilot KPIs and baseline', 'Agree hit rate, Taka per notice and entity match accuracy, with NBR\'s current numbers as baseline.']];
  $('#asks').innerHTML = ASKS.map((a, i) => '<div class="card" data-a style="display:flex;gap:16px;padding:18px 20px"><div><div class="ico" style="margin:0"><svg viewBox="0 0 24 24">' + IC[a[0]] + '</svg></div></div><div><h3 style="font-size:16px">' + (i + 1) + '. ' + a[1] + '</h3><p style="font-size:13.5px">' + a[2] + '</p></div></div>').join('');

  // hero facade + facts
  const H = TS.hero, M = H.model;
  (function () {
    const w = 312, h = 330, fl = H.floors, fh = 24, gH = 44, bw = 188, x0 = 40, base = h - 18, bh = gH + (fl - 1) * fh, top = base - bh; let s = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%"><rect width="' + w + '" height="' + h + '" fill="var(--surface-3)" rx="8"/><rect y="' + base + '" width="' + w + '" height="18" fill="var(--line-2)"/><rect x="' + x0 + '" y="' + top + '" width="' + bw + '" height="' + bh + '" fill="var(--surface)" stroke="var(--line-2)"/>';
    for (let i = 1; i < fl; i++) { const y = base - gH - i * fh, nw = i >= fl - H.addedFloors; if (nw) s += '<rect x="' + x0 + '" y="' + y + '" width="' + bw + '" height="' + fh + '" fill="var(--bad-soft)"/>'; for (let c = 0; c < 5; c++) s += '<rect x="' + (x0 + 10 + c * 35) + '" y="' + (y + 5) + '" width="26" height="' + (fh - 10) + '" rx="2" fill="' + ((i * 7 + c * 3) % 5 === 0 ? 'var(--warn-soft)' : 'var(--line)') + '"/>'; }
    s += '<rect x="' + (x0 - 1) + '" y="' + top + '" width="' + (bw + 2) + '" height="' + H.addedFloors * fh + '" fill="none" stroke="var(--bad)" stroke-width="1.5" stroke-dasharray="5 3"/><text x="' + (x0 + bw + 8) + '" y="' + (top + 14) + '" fill="var(--bad)" font-size="11" font-weight="600">+' + H.addedFloors + ' floors</text><text x="' + (x0 + bw + 8) + '" y="' + (top + 28) + '" fill="var(--ink-3)" font-size="10">since 2019</text>';
    H.shops.slice(0, 4).forEach((sh, i) => { const bx = x0 + i * 47; s += '<rect x="' + (bx + 3) + '" y="' + (base - gH + 3) + '" width="41" height="14" rx="2" fill="var(--brand)"/><text x="' + (bx + 23.5) + '" y="' + (base - gH + 13) + '" text-anchor="middle" fill="var(--brand-ink)" font-size="8" font-weight="600" font-family="\'Noto Sans Bengali\',sans-serif">' + sh.bn.split(' ')[0].slice(0, 7) + '</text><rect x="' + (bx + 3) + '" y="' + (base - gH + 20) + '" width="41" height="' + (gH - 20) + '" fill="var(--ink-3)" opacity=".5"/><rect x="' + (bx + 1) + '" y="' + (base - gH + 1) + '" width="45" height="18" fill="none" stroke="#35C79B" stroke-width="1.3" rx="3"/>'; });
    $('#fac').innerHTML = s + '</svg>';
    const facts = [['Floors built / declared', H.floors + ' / ' + H.declFloors, 'LiDAR and satellite, 2019 to 2026'], ['Shops read from signboards', H.shops.length, 'Bangla OCR, ' + H.shops.filter((x) => !x.vat).length + ' with no VAT record'], ['Owner linked to', (H.cluster.count - 1) + ' more buildings', 'Under ' + H.cluster.names + ' family and company names'], ['AI rent vs declared', 'Tk ' + tk(M.est) + ' vs Tk ' + tk(H.rentDecl), 'Per month. Range Tk ' + tk(M.lo) + ' to ' + tk(M.hi)]];
    $('#hero').innerHTML = facts.map((f) => '<div class="card flat" data-a style="padding:14px 16px"><div class="sm">' + f[0] + '</div><div class="num sm2" style="margin:4px 0">' + f[1] + '</div><div class="sm">' + f[2] + '</div></div>').join('');
    $('#gapn').textContent = 'Tk ' + tk(H.gapAnnual);
  })();

  // ---------- engine ----------
  const slides = $$('.slide'); const N = slides.length; let cur = -1, map = null, busy = false;
  const stage = $('#stage');
  const fit = () => { const k = Math.min(innerWidth / 1280, innerHeight / 720); stage.style.transform = 'scale(' + k + ') translate(-50%,-50%)'; stage.style.left = '50%'; stage.style.top = '50%'; };
  addEventListener('resize', fit); fit();

  function mountMap() {
    if (map) return; const c = $('#m1 canvas'); map = new CityMap(c); map.labels = false; map.cam.tilt = 0.88; map.cam.yaw = -0.6; map.fit(); map.cam.zoom *= 1.35; map.cam.cx -= 80; map.sweep(3.4);
    let t0 = performance.now(); const spin = () => { if (!map) return; map.cam.yaw = -0.6 + Math.sin((performance.now() - t0) / 9000) * 0.18; map.dirty = true; requestAnimationFrame(spin); }; if (!reduce) requestAnimationFrame(spin);
  }
  function unmountMap() { if (map) { map.destroy(); map = null; } }

  function show(i, dir = 1) {
    i = Math.max(0, Math.min(N - 1, i)); if (i === cur) return; const prev = slides[cur], next = slides[i]; cur = i;
    const go = () => {
      slides.forEach((s) => s.classList.remove('on')); next.classList.add('on');
      $('#cnt').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0'); $('#sec').textContent = next.dataset.sec || ''; $('#prog').style.width = ((i + 1) / N) * 100 + '%';
      history.replaceState(null, '', '#' + (i + 1));
      if (i === 0) { mountMap(); } else unmountMap();
      const items = $$('[data-a]', next);
      if (!reduce) { gsap.fromTo(items, { y: 16 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', stagger: 0.06, clearProps: 'transform,opacity' }); }
      $$('[data-count]', next).forEach((n) => { if (reduce) return; const o = { v: 0 }, to = +n.dataset.count; gsap.to(o, { v: to, duration: 1.2, ease: 'power3.out', onUpdate: () => (n.textContent = Math.round(o.v).toLocaleString()) }); });
      if (i === 1 && !reduce) { gsap.from('#b1', { width: 0, duration: 1.1, ease: 'power3.out' }); gsap.from('#b2', { width: 0, duration: 1.3, ease: 'power3.out', delay: 0.15 }); }
      busy = false;
    };
    if (prev && !reduce) { busy = true; gsap.to(prev, { opacity: 0, duration: 0.18, onComplete: () => { prev.style.opacity = ''; go(); } }); } else go();
  }
  const next = () => show(cur + 1, 1), back = () => show(cur - 1, -1);
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) return;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); back(); }
    else if (e.key === 'Home') show(0); else if (e.key === 'End') show(N - 1);
    else if (e.key === 't' || e.key === 'T') theme();
    else if (e.key === 'f' || e.key === 'F') fs();
    else if (e.key === 'p' || e.key === 'P') print();
  });
  const theme = () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('ts-theme', t); } catch (e) { } if (map) map.themeChanged(); };
  const fs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen());
  const print = () => { unmountMap(); slides.forEach((s) => (s.style.display = 'block')); window.print(); slides.forEach((s) => (s.style.display = '')); };
  $('#nx').onclick = next; $('#pv').onclick = back; $('#th').onclick = theme; $('#fs').onclick = fs; $('#pr').onclick = print; $('#hr').onclick = next; $('#hl').onclick = back;
  let sx = 0; addEventListener('touchstart', (e) => (sx = e.touches[0].clientX)); addEventListener('touchend', (e) => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) d < 0 ? next() : back(); });

  let t = null; try { t = localStorage.getItem('ts-theme'); } catch (e) { }
  const q = new URLSearchParams(location.search).get('theme'); t = q || t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = t;
  const start = Math.max(0, Math.min(N - 1, (parseInt(location.hash.slice(1)) || 1) - 1));
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { show(start); if (start === 0 && !reduce) { const h = $('#h1'); const txt = h.textContent; h.setAttribute('aria-label', txt); h.innerHTML = [...txt].map((c) => '<span aria-hidden="true" style="display:inline-block;white-space:pre">' + c + '</span>').join(''); gsap.from(h.children, { yPercent: 80, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.035, delay: 0.1 }); } });
})();
