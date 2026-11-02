/* TaxSight AI · core helpers, icons, charts, router */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const tk = (n, d = 1) => { const a = Math.abs(n); if (a >= 1e7) return 'Tk ' + (n / 1e7).toFixed(d) + ' crore'; if (a >= 1e5) return 'Tk ' + (n / 1e5).toFixed(d) + ' lakh'; return 'Tk ' + fmt(n); };
  const lakh = (n, d = 1) => (n / 1e5).toFixed(d) + ' lakh';
  const pct = (n, d = 0) => (n * 100).toFixed(d) + '%';
  const STATUS = ['Declared', 'Under-declared', 'Undeclared'];
  const st = (s) => '<span class="st s' + s + '"><i></i>' + STATUS[s] + '</span>';
  const AREA_BN = { 'Adabor': 'আদাবর', 'Rayer Bazar': 'রায়েরবাজার', 'Basila': 'বসিলা' };

  const P = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    building: '<path d="M5 21V4h9v17M14 9h5v12M3 21h18M8 8h3M8 12h3M8 16h3"/>',
    network: '<circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M11 7 6 16M13 7l5 9M7.5 18h9"/>',
    scale: '<path d="M12 4v16M6 20h12M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    doc: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
    store: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9c0 2 2 2.5 4 2.5S12 11 12 9c0 2 2 2.5 4 2.5S20 11 20 9M10 20v-5h4v5"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', layers: '<path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5"/>', rotate: '<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v4h-4"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', alert: '<path d="M12 4 2.5 20h19zM12 10v4.5M12 17.5v.01"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>', send: '<path d="M3 11 21 3l-8 18-2-7z"/>',
    cam: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', down: '<path d="m6 9 6 6 6-6"/>', home: '<path d="M4 11 12 4l8 7v9H4zM10 20v-6h4v6"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6 8-6s7 1.5 8 6"/>', bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>', db: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', refresh: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>', pen: '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
    wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5v.01"/>'
  };
  const icon = (n, cls = '') => '<svg viewBox="0 0 24 24" aria-hidden="true" class="' + cls + '">' + (P[n] || '') + '</svg>';

  // ---------- state ----------
  const S = { sel: TS.hero, role: 'admin', view: null, theme: 'light', tour: null, audit: [] };
  const bus = {}; const on = (e, f) => (bus[e] = bus[e] || []).push(f); const emit = (e, d) => (bus[e] || []).forEach((f) => f(d));
  const pickB = (b, opts = {}) => { S.sel = b; emit('select', b); };

  // ---------- theme ----------
  function setTheme(t) {
    S.theme = t; document.documentElement.dataset.theme = t; try { localStorage.setItem('ts-theme', t); } catch (e) { }
    const bt = $('#themeBtn'); if (bt) bt.innerHTML = icon(t === 'dark' ? 'sun' : 'moon') + '<span>' + (t === 'dark' ? 'Light' : 'Dark') + '</span>';
    emit('theme', t);
  }
  function initTheme() {
    let t = null; try { t = localStorage.getItem('ts-theme'); } catch (e) { }
    if (!t) t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const q = new URLSearchParams(location.search).get('theme'); if (q === 'dark' || q === 'light') t = q;
    setTheme(t);
  }

  // ---------- ui bits ----------
  let toastT; function toast(msg) { const t = $('#toast'); t.textContent = msg; if (window.gsap) { gsap.killTweensOf(t); gsap.fromTo(t, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.25 }); clearTimeout(toastT); toastT = setTimeout(() => gsap.to(t, { opacity: 0, y: 10, duration: 0.3 }), 2600); } else { t.style.opacity = 1; } }
  function tip(el, html) { el.dataset.tip = html; }
  function bindTips(root) {
    const t = $('#tip');
    root.addEventListener('mousemove', (e) => { const el = e.target.closest('[data-tip]'); if (!el) { t.style.opacity = 0; return; } t.innerHTML = el.dataset.tip; t.style.opacity = 1; const w = t.offsetWidth; t.style.left = Math.min(innerWidth - w - 10, e.clientX + 14) + 'px'; t.style.top = e.clientY + 14 + 'px'; });
    root.addEventListener('mouseleave', () => (t.style.opacity = 0));
  }
  function countUp(el, to, o = {}) {
    const f = o.fmt || fmt; const d = o.dec || 0; const obj = { v: o.from || 0 };
    if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = f(to); return; }
    gsap.to(obj, { v: to, duration: o.dur || 1.4, ease: 'power3.out', onUpdate: () => (el.textContent = f(obj.v)) });
  }
  function scramble(el, finalText, dur = 0.7) {
    const chars = '0123456789#%&*'; const o = { p: 0 };
    if (!window.gsap) { el.textContent = finalText; return; }
    gsap.to(o, { p: 1, duration: dur, ease: 'none', onUpdate: () => { const k = Math.floor(o.p * finalText.length); el.textContent = finalText.slice(0, k) + finalText.slice(k).replace(/[^\s•-]/g, () => chars[Math.floor(Math.random() * chars.length)]); }, onComplete: () => (el.textContent = finalText) });
  }
  function maskedHTML(text, label) { return '<span class="mask" data-unmask="' + text + '" data-label="' + (label || 'PII') + '" tabindex="0" role="button" aria-label="Reveal ' + (label || 'value') + ' (logged)">' + text + '</span>'; }
  function audit(who, what) { const t = new Date(); const rec = { t: t.toTimeString().slice(0, 8), who, what, hash: Math.random().toString(16).slice(2, 10) }; S.audit.unshift(rec); emit('audit', rec); return rec; }
  function splitReveal(el, delay = 0) {
    if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const txt = el.textContent; el.setAttribute('aria-label', txt); el.innerHTML = [...txt].map((c) => '<span aria-hidden="true" style="display:inline-block;white-space:pre">' + (c === ' ' ? ' ' : c) + '</span>').join('');
    gsap.from(el.children, { yPercent: 70, opacity: 0, duration: 0.55, ease: 'power3.out', stagger: 0.018, delay });
  }
  function spotlight(root) { root.addEventListener('pointermove', (e) => { const c = e.target.closest('.spot'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }); }

  // ---------- charts ----------
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function scaleLin(d0, d1, r0, r1) { return (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0); }
  function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v || 1))); const m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
  /** series: [{name, color, pts:[[x,y]], area?, dash?, width?}] */
  function lineChart({ w = 560, h = 220, series, xTicks, yFmt = fmt, yMax, xFmt = (x) => x, pad = { l: 38, r: 10, t: 10, b: 22 }, marks = [] }) {
    const xs = series.flatMap((s) => s.pts.map((p) => p[0])); const ys = series.flatMap((s) => s.pts.map((p) => p[1]));
    const x0 = Math.min(...xs), x1 = Math.max(...xs); const y1 = yMax || niceMax(Math.max(...ys));
    const X = scaleLin(x0, x1, pad.l, w - pad.r), Y = scaleLin(0, y1, h - pad.b, pad.t);
    let o = '<svg class="ch" viewBox="0 0 ' + w + ' ' + h + '" role="img">';
    for (let i = 0; i <= 4; i++) { const v = (y1 / 4) * i, y = Y(v); o += '<line class="grid-l" x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (pad.l - 6) + '" y="' + (y + 3.5) + '" text-anchor="end">' + yFmt(v) + '</text>'; }
    (xTicks || xs.filter((_, i, a) => i % Math.ceil(a.length / 8) === 0).filter((v, i, a) => a.indexOf(v) === i)).forEach((t) => (o += '<text x="' + X(t) + '" y="' + (h - 6) + '" text-anchor="middle">' + xFmt(t) + '</text>'));
    series.forEach((s) => {
      const d = s.pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('');
      if (s.area) o += '<path d="' + d + 'L' + X(s.pts[s.pts.length - 1][0]) + ' ' + Y(0) + 'L' + X(s.pts[0][0]) + ' ' + Y(0) + 'Z" fill="' + s.color + '" opacity=".1"/>';
      o += '<path class="ln" d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="' + (s.width || 2) + '" stroke-linejoin="round" stroke-linecap="round"' + (s.dash ? ' stroke-dasharray="' + s.dash + '"' : '') + '/>';
    });
    marks.forEach((m) => { o += '<line x1="' + X(m.x) + '" x2="' + X(m.x) + '" y1="' + pad.t + '" y2="' + (h - pad.b) + '" stroke="' + m.color + '" stroke-dasharray="3 4"/><text x="' + (X(m.x) + 4) + '" y="' + (pad.t + 9) + '" fill="' + m.color + '" style="fill:' + m.color + '">' + m.label + '</text>'; });
    return o + '</svg>';
  }
  function barChart({ w = 560, h = 200, bars, color = css('--brand'), yFmt = fmt, horizontal = false, pad = { l: 38, r: 10, t: 8, b: 24 } }) {
    const ymax = niceMax(Math.max(...bars.map((b) => b.v))); const n = bars.length; const bw = (w - pad.l - pad.r) / n;
    const Y = scaleLin(0, ymax, h - pad.b, pad.t); let o = '<svg class="ch" viewBox="0 0 ' + w + ' ' + h + '" role="img">';
    for (let i = 0; i <= 4; i++) { const v = (ymax / 4) * i, y = Y(v); o += '<line class="grid-l" x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (pad.l - 6) + '" y="' + (y + 3.5) + '" text-anchor="end">' + yFmt(v) + '</text>'; }
    bars.forEach((b, i) => { const x = pad.l + i * bw + bw * 0.18, ww = bw * 0.64, y = Y(b.v); o += '<rect class="bar-r" x="' + x + '" y="' + y + '" width="' + ww + '" height="' + (h - pad.b - y) + '" rx="3" fill="' + (b.color || color) + '" data-tip="' + (b.tip || b.label + ': ' + yFmt(b.v)) + '"/><text x="' + (x + ww / 2) + '" y="' + (h - 8) + '" text-anchor="middle">' + b.label + '</text>'; });
    return o + '</svg>';
  }
  function spark(vals, color, w = 90, h = 26) { const mx = Math.max(...vals), mn = Math.min(...vals); const X = scaleLin(0, vals.length - 1, 1, w - 1), Y = scaleLin(mn, mx, h - 2, 2); return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><path d="' + vals.map((v, i) => (i ? 'L' : 'M') + X(i) + ' ' + Y(v)).join('') + '" fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }

  // ---------- router ----------
  const VIEWS = {}; const NAV = [
    ['Overview', [['command', 'Command Centre', 'grid']]],
    ['Investigate', [['map', '3D Map', 'map'], ['p360', 'Property 360', 'building'], ['owners', 'Owner Graph', 'network']]],
    ['Decide', [['gap', 'Revenue Gap Engine', 'scale'], ['targeting', 'Smart Targeting', 'target'], ['ask', 'Ask the Data', 'chat']]],
    ['Act', [['copilot', 'Notice Copilot', 'doc'], ['field', 'Field App', 'phone'], ['business', 'Business Discovery', 'store']]],
    ['Platform', [['platform', 'Data and AI Engine', 'cpu'], ['governance', 'Governance', 'shield']]]
  ];
  function buildNav() {
    const r = TS.ROLES[S.role]; const allowed = (id) => r.views.includes(id) || (id === 'p360' && r.views.includes('map'));
    $('#nav').innerHTML = NAV.map(([g, items]) => { const its = items.filter(([id]) => allowed(id)); if (!its.length) return ''; return '<div class="grp">' + g + '</div>' + its.map(([id, t, ic]) => '<button class="nav" data-view="' + id + '"' + (S.view === id ? ' aria-current="page"' : '') + '>' + icon(ic) + '<span>' + t + '</span></button>').join(''); }).join('');
  }
  let current = null;
  function go(id, opts = {}) {
    const r = TS.ROLES[S.role]; const ok = r.views.includes(id) || (id === 'p360' && r.views.includes('map'));
    if (!ok && !current) { go(r.views[0]); return; }
    if (!ok) { toast('Your role (' + r.name + ') cannot open this view. Access is enforced by role and zone.'); audit(r.name, 'Blocked: tried to open ' + id); return; }
    if (current && current.destroy) current.destroy();
    S.view = id; const v = VIEWS[id]; const el = $('#view'); el.className = 'view' + (v.flush ? ' flush' : ''); el.scrollTop = 0;
    el.innerHTML = ''; current = v.render(el, opts) || v;
    $('#title').textContent = v.title; $('#crumb').textContent = v.crumb || '';
    buildNav();
    if (window.gsap && !v.flush && !matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.from(el.querySelectorAll(':scope > .grid > *, :scope > .card, :scope > .head, :scope > * > .card'), { y: 12, opacity: 0, duration: 0.45, ease: 'power2.out', stagger: 0.04, clearProps: 'transform,opacity' });
    history.replaceState(null, '', '#' + id); emit('view', id);
  }
  const reg = (id, def) => (VIEWS[id] = def);

  window.TX = { $, $$, fmt, tk, lakh, pct, st, STATUS, AREA_BN, icon, S, on, emit, pickB, setTheme, initTheme, toast, tip, bindTips, countUp, scramble, maskedHTML, audit, splitReveal, spotlight, lineChart, barChart, spark, css, buildNav, go, reg, VIEWS, scaleLin, niceMax };
})();
