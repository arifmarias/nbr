/* TaxSight AI · views: Command Centre, 3D Map, Property 360 */
(function () {
  'use strict';
  const { $, $$, fmt, tk, lakh, pct, st, STATUS, icon, S, on, pickB, toast, countUp, audit, lineChart, maskedHTML, reg, go, css } = TX;

  // ---------- shared: procedural street-level facade (what the MMS camera "sees") ----------
  function facade(b, o = {}) {
    const w = o.w || 300, h = o.h || 270, fl = b.floors, added = b.addedFloors;
    const gH = 40, fh = Math.max(10, Math.min(24, (h - gH - 46) / Math.max(1, fl - 1)));
    const bw = w - 124, x0 = 40, base = h - 18, bh = gH + (fl - 1) * fh, top = base - bh;
    let s = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img" aria-label="Street-level view of ' + b.id + '">';
    s += '<rect width="' + w + '" height="' + h + '" style="fill:var(--surface-3)"/>';
    s += '<rect x="0" y="' + base + '" width="' + w + '" height="18" style="fill:var(--line-2)"/>';
    // neighbours
    s += '<rect x="2" y="' + (base - 70) + '" width="40" height="70" style="fill:var(--line)"/><rect x="' + (w - 44) + '" y="' + (base - 96) + '" width="42" height="96" style="fill:var(--line)"/>';
    s += '<rect x="' + x0 + '" y="' + top + '" width="' + bw + '" height="' + bh + '" style="fill:var(--surface);stroke:var(--line-2)"/>';
    const cols = 5, ww = (bw - 16) / cols - 7;
    for (let i = 1; i < fl; i++) {
      const y = base - gH - i * fh; const isNew = i >= fl - added;
      if (isNew && o.hl !== false) s += '<rect x="' + x0 + '" y="' + y + '" width="' + bw + '" height="' + fh + '" style="fill:var(--bad-soft)"/>';
      for (let c = 0; c < cols; c++) { const lit = (i * 7 + c * 3 + b.idx) % 5 === 0; s += '<rect x="' + (x0 + 11 + c * (ww + 7)) + '" y="' + (y + 3.5) + '" width="' + ww + '" height="' + (fh - 7) + '" rx="1.5" style="fill:' + (lit ? 'var(--warn-soft)' : 'var(--line)') + '"/>'; }
      s += '<line x1="' + x0 + '" x2="' + (x0 + bw) + '" y1="' + y + '" y2="' + y + '" style="stroke:var(--line-2)" stroke-width=".6"/>';
    }
    if (added && o.hl !== false) {
      const y1 = top, y2 = top + added * fh;
      s += '<rect x="' + (x0 - 1) + '" y="' + y1 + '" width="' + (bw + 2) + '" height="' + (y2 - y1) + '" fill="none" style="stroke:var(--bad)" stroke-width="1.4" stroke-dasharray="5 3"/>';
      s += '<text x="' + (x0 + bw + 5) + '" y="' + (y1 + 10) + '" style="fill:var(--bad);font:600 9.5px var(--f-body)">+' + added + ' floor' + (added > 1 ? 's' : '') + '</text><text x="' + (x0 + bw + 5) + '" y="' + (y1 + 21) + '" style="fill:var(--ink-3);font:9px var(--f-body)">since 2019</text>';
    }
    // rooftop
    s += '<rect x="' + (x0 + 10) + '" y="' + (top - 12) + '" width="26" height="12" style="fill:var(--line-2)"/><rect x="' + (x0 + bw - 38) + '" y="' + (top - 8) + '" width="18" height="8" style="fill:var(--line-2)"/>';
    // ground floor shops
    const shops = b.shops.slice(0, 4), n = Math.max(1, shops.length); const bay = bw / n;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * bay; const sh = shops[i];
      s += '<rect x="' + (x + 4) + '" y="' + (base - gH + 14) + '" width="' + (bay - 8) + '" height="' + (gH - 14) + '" style="fill:' + (sh ? 'var(--ink-3)' : 'var(--line-2)') + '" opacity=".55"/>';
      if (sh) {
        const sx = x + 4, sy = base - gH + 1, sw = bay - 8; s += '<rect x="' + sx + '" y="' + sy + '" width="' + sw + '" height="13" rx="2" style="fill:var(--brand);"/>';
        s += '<text x="' + (sx + sw / 2) + '" y="' + (sy + 9.5) + '" text-anchor="middle" style="fill:var(--brand-ink);font:600 7px \'Noto Sans Bengali\',var(--f-body)">' + (sh.bn.split(' ')[0].length > 8 ? sh.bn.split(' ')[0].slice(0, 7) + '…' : sh.bn.split(' ')[0]) + '</text>';
        if (o.boxes) s += '<rect x="' + (sx - 1.5) + '" y="' + (sy - 1.5) + '" width="' + (sw + 3) + '" height="16" rx="2.5" fill="none" stroke="#35C79B" stroke-width="1.5"/><text x="' + (sx) + '" y="' + (sy - 4) + '" style="fill:#35C79B;font:600 7.5px var(--f-body)">OCR ' + sh.conf + '%</text>';
      }
    }
    if (b.shops.length > 4) s += '<text x="' + (x0 + bw) + '" y="' + (base + 12) + '" text-anchor="end" style="fill:var(--ink-3);font:9px var(--f-body)">+' + (b.shops.length - 4) + ' more signs</text>';
    if (o.boxes) { s += '<g><rect x="' + (x0 - 6) + '" y="' + (top - 16) + '" width="' + (bw + 12) + '" height="' + (bh + 20) + '" fill="none" stroke="#5B8CFF" stroke-width="1.2" stroke-dasharray="3 3"/><rect x="' + (x0 - 6) + '" y="' + (top - 29) + '" width="84" height="12" rx="3" fill="#5B8CFF"/><text x="' + (x0 - 1) + '" y="' + (top - 20) + '" style="fill:#fff;font:600 8.5px var(--f-body)">building · ' + fl + ' floors</text></g>'; }
    return s + '</svg>';
  }
  window.facade = facade;

  const bnDigits = (s) => String(s).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
  window.bnDigits = bnDigits;
  window.tkBn = (n) => { const a = Math.abs(n); if (a >= 1e7) return bnDigits((n / 1e7).toFixed(1)) + ' কোটি টাকা'; if (a >= 1e5) return bnDigits((n / 1e5).toFixed(1)) + ' লাখ টাকা'; return bnDigits(fmt(n)) + ' টাকা'; };

  const reasonsHTML = (b, n = 5) => b.reasons.slice(0, n).map((r) => '<div class="reason"><div class="bar"><i style="width:' + Math.min(100, r.w * 3) + '%"></i></div><span>' + r.k + '</span></div>').join('') || '<div class="note">No material reasons. Matches filing.</div>';

  // ===================================================================== COMMAND CENTRE
  reg('command', {
    title: 'Command Centre', crumb: 'Tax Zone 10 · simulated 12-week pilot',
    render(el) {
      let wk = 9; const iv = [];
      const C = TS.counts, N = TS.total;
      el.innerHTML = `
      <div class="row-flex wrap" style="margin-bottom:14px;gap:16px">
        <div><h2 class="big" id="stmt" style="max-width:760px"></h2><div class="note" style="margin-top:4px">Simulated pilot on synthetic data, week <b id="wkl">9</b> of 12. Every figure on this page is recomputed from the demo dataset.</div></div>
        <div class="sp"></div>
        <label class="row-flex note">Pilot week <input type="range" class="rng" style="width:170px" min="1" max="12" value="9" id="wkr" aria-label="Pilot week"></label>
      </div>
      <div class="grid g4" id="kpis"></div>
      <div class="grid g-main mt">
        <div class="card reg"><div class="card-h"><div><h3>Extra tax found, cumulative</h3><div class="sub">AI-ranked notices vs a rules-only list, same officers, same notices</div></div><div class="sp"></div><span class="tag syn"><i class="dot"></i>Synthetic</span></div><div id="chart"></div></div>
        <div class="card reg" style="padding:0;overflow:hidden"><div class="card-h" style="padding:14px 16px 0;margin:0;position:absolute;z-index:2;"><div><h3>Zone 10 compliance</h3><div class="sub">${fmt(N)} buildings in this demo extract</div></div></div><div class="mapwrap" id="mini" style="position:relative;height:100%;min-height:300px"><canvas></canvas></div></div>
      </div>
      <div class="grid g3 mt">
        <div class="card"><div class="card-h"><div><h3>Zone league table</h3><div class="sub">Identified annual gap per zone. Only Zone 10 is surveyed.</div></div></div><div id="league" style="max-height:268px;overflow:auto;margin:0 -4px;padding:0 4px"></div></div>
        <div class="card"><div class="card-h"><div><h3>Compliance mix</h3><div class="sub">Status of every building, by area</div></div></div><div id="mix"></div></div>
        <div class="card"><div class="card-h"><div><h3>Live activity</h3><div class="sub">Cases moving through the system</div></div><div class="sp"></div><span class="tag ok"><i class="dot"></i>Live</span></div><div class="ticker" id="tick"></div></div>
      </div>`;

      // mini map
      const map = new CityMap($('#mini canvas')); map.c.style.pointerEvents = 'none'; map.labels = false; map.cam.tilt = 0.6; map.cam.yaw = -0.32; map.fit(); map.cam.zoom *= 1.12; map.cam.cy += 30; map.sweep(3);
      const offTheme = on('theme', () => map.themeChanged());

      const kpiHTML = () => {
        const p = TS.pilot[wk - 1]; const base = p.notices * 0.3 * 150000;
        const items = [
          ['Extra tax found per year', tk(p.taka), '+' + tk(p.taka - base) + ' vs rules-only', 'up', 'bolt'],
          ['Notices sent', fmt(p.notices), 'of 1,000 officer capacity', '', 'doc'],
          ['Hit rate of AI-ranked cases', pct(p.hitRate), 'rules-only list: 30%  ·  +' + Math.round((p.hitRate - 0.3) * 100) + ' pts', 'up', 'target'],
          ['Collected so far', tk(p.collected), fmt(p.appeal) + ' appeals open', '', 'check']
        ];
        $('#kpis').innerHTML = items.map((k, i) => '<div class="card kpi spot reg"><div class="lab">' + icon(k[4]) + k[0] + '</div><div class="num" data-i="' + i + '">' + k[1] + '</div><div class="delta ' + k[3] + '">' + k[2] + '</div></div>').join('');
        $$('#kpis svg').forEach((s) => { s.style.cssText = 'width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.6'; });
        const month = p.taka - (TS.pilot[Math.max(0, wk - 5)] ? TS.pilot[Math.max(0, wk - 5)].taka : 0);
        $('#stmt').innerHTML = 'Zone 10 found <span style="color:var(--brand)">' + tk(month) + '</span> of new taxable income this month';
        $('#wkl').textContent = wk;
      };
      const chart = () => {
        const ai = TS.pilot.map((p) => [p.w, p.taka / 1e7]), rules = TS.pilot.map((p) => [p.w, (p.notices * 0.3 * 150000) / 1e7]);
        $('#chart').innerHTML = lineChart({ w: 620, h: 232, series: [{ color: css('--ink-3'), pts: rules, dash: '5 4', width: 1.8 }, { color: css('--brand'), pts: ai, area: true, width: 2.4 }], xFmt: (x) => 'W' + x, yFmt: (v) => +v.toFixed(1), xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], marks: [{ x: wk, color: css('--brand'), label: 'Week ' + wk }] }) +
          '<div class="row-flex note" style="gap:16px;margin-top:4px"><span><i class="sw" style="background:var(--brand)"></i> TaxSight AI ranking</span><span><i class="sw" style="background:var(--ink-3)"></i> Rules-only baseline</span><span class="sp"></span><span>Tk crore per year</span></div>';
      };
      kpiHTML(); chart();
      $$('#kpis .num').forEach((n, i) => { const p = TS.pilot[wk - 1]; const to = [p.taka, p.notices, p.hitRate * 100, p.collected][i]; const f = [(v) => tk(v), fmt, (v) => v.toFixed(0) + '%', (v) => tk(v)][i]; countUp(n, to, { fmt: f, dur: 1.2 }); });
      $('#wkr').addEventListener('input', (e) => { wk = +e.target.value; kpiHTML(); chart(); });

      // league
      const zs = TS.ZONES.slice().sort((a, b) => b.gapCr - a.gapCr), mx = zs[0].gapCr;
      $('#league').innerHTML = '<table class="t"><tbody>' + zs.map((z) => '<tr' + (z.live ? ' style="background:var(--brand-soft)"' : '') + '><td style="width:78px">' + z.name.replace('Tax ', '') + '</td><td><div class="bar' + (z.live ? '' : '') + '" style="' + (z.live ? '' : 'opacity:.55') + '"><i style="width:' + (z.gapCr / mx * 100) + '%"></i></div></td><td class="r" style="width:70px">' + z.gapCr.toFixed(0) + ' cr</td><td style="width:70px">' + (z.live ? '<span class="tag brand">Live</span>' : '<span class="muted" style="font-size:11px">projected</span>') + '</td></tr>').join('') + '</tbody></table>';

      // mix
      const areas = ['Basila', 'Adabor', 'Rayer Bazar'];
      const per = areas.map((a) => { const c = [0, 0, 0]; TS.buildings.forEach((b) => b.area === a && c[b.status]++); return c; });
      $('#mix').innerHTML = '<div class="row-flex" style="height:14px;border-radius:7px;overflow:hidden;gap:2px"><i style="flex:' + C[0] + ';background:var(--ok)"></i><i style="flex:' + C[1] + ';background:var(--warn)"></i><i style="flex:' + C[2] + ';background:var(--bad)"></i></div>' +
        '<div class="row-flex wrap note" style="gap:6px 14px;margin:8px 0 12px">' + [0, 1, 2].map((i) => '<span style="white-space:nowrap">' + st(i) + ' <b style="color:var(--ink)">' + fmt(C[i]) + '</b> (' + pct(C[i] / N) + ')</span>').join('') + '</div>' +
        '<table class="t"><thead><tr><th>Area</th><th class="r">Declared</th><th class="r">Under</th><th class="r">Undecl.</th></tr></thead><tbody>' + areas.map((a, i) => '<tr><td>' + a + '</td>' + per[i].map((v) => '<td class="r">' + fmt(v) + '</td>').join('') + '</tr>').join('') + '</tbody></table>' +
        '<div class="note mt-s">Identified annual gap in extract: <b style="color:var(--ink)">' + tk(TS.gapTotal) + '</b>. Scaled to the assumed 10,000-building zone: ' + tk(TS.gapTotal * 10000 / N) + '.</div>';

      // ticker
      const AO = ['Rahman', 'Akter', 'Hossain', 'Sarker', 'Islam'], tp = [
        () => ['ok', 'Notice N-' + (2400 + Math.floor(Math.random() * 600)) + ' approved by AO ' + AO[Math.floor(Math.random() * 5)] + ', Adabor'],
        () => ['', 'Field result: ' + TS.buildings[Math.floor(Math.random() * N)].id + ' confirmed, +' + (1 + Math.floor(Math.random() * 3)) + ' floors'],
        () => ['ok', 'Payment received: ' + tk(40000 + Math.random() * 600000)],
        () => ['warn', 'Appeal filed on ' + TS.buildings[Math.floor(Math.random() * N)].id + '; evidence pack shared'],
        () => ['', 'Model target-ranker retrained on ' + (20 + Math.floor(Math.random() * 40)) + ' new field results']
      ];
      const push = () => { const [c, t] = tp[Math.floor(Math.random() * tp.length)](); const d = document.createElement('div'); d.className = 'ev'; d.innerHTML = '<time>' + new Date().toTimeString().slice(0, 8) + '</time><span class="' + (c === 'ok' ? 'up' : c === 'warn' ? '' : '') + '">' + t + '</span>'; const tkr = $('#tick'); if (!tkr) return; tkr.prepend(d); if (window.gsap) gsap.from(d, { opacity: 0, y: -10, duration: 0.4 }); while (tkr.children.length > 6) tkr.lastChild.remove(); };
      for (let i = 0; i < 5; i++) push(); iv.push(setInterval(push, 2600));
      return { destroy() { iv.forEach(clearInterval); map.destroy(); } };
    }
  });

  // ===================================================================== 3D MAP
  reg('map', {
    title: '3D Map', crumb: 'Tax Zone 10 · Basila · Adabor · Rayer Bazar', flush: true,
    render(el, opts = {}) {
      el.innerHTML = `<div class="mapwrap"><canvas aria-label="3D map of Tax Zone 10 buildings coloured by compliance"></canvas>
        <div class="ov tl"><h4>Layers</h4>
          <div id="layers">${[['status', 'Compliance'], ['risk', 'Risk score'], ['use', 'Land use'], ['change', 'Change since 2019']].map(([k, t], i) => '<button class="layer" data-l="' + k + '" aria-pressed="' + (i === 0) + '">' + icon('layers').replace('<svg', '<svg width="14" height="14" style="stroke:currentColor;fill:none;stroke-width:1.6"') + t + '</button>').join('')}</div>
          <hr class="hr"><h4>Show</h4><div id="flt" class="stack" style="gap:4px">${[0, 1, 2].map((i) => '<label class="row-flex" style="gap:8px;cursor:pointer"><input type="checkbox" data-f="' + i + '" checked> ' + st(i) + '</label>').join('')}</div>
          <hr class="hr"><div class="legend" id="legend"></div></div>
        <div class="ov ins" id="ins"></div>
        <div class="ov bl" style="display:flex;gap:4px;padding:6px;align-items:center">
          <button class="btn sm" id="zo" aria-label="Zoom out" style="width:28px;justify-content:center;font-size:15px">−</button><button class="btn sm" id="zi" aria-label="Zoom in" style="width:28px;justify-content:center;font-size:15px">+</button><button class="btn sm ghost" id="rl" aria-label="Rotate">${icon('rotate')}</button>
          <div class="seg" id="tiltseg"><button aria-pressed="false" data-t="0">2D</button><button aria-pressed="true" data-t="0.92">3D</button></div>
          <button class="btn sm" id="fit">Reset view</button><button class="btn sm primary" id="scan">${icon('bolt')}Run AI scan</button></div>
        <div class="ov bc" style="left:360px;transform:none;width:min(430px,calc(100% - 760px))"><div class="row-flex"><b style="font:600 12.5px var(--f-title)">Imagery epoch</b><span class="tag brand" id="epl">2026</span><div class="sp"></div><button class="btn sm" id="play">${icon('play')}Replay growth</button></div>
          <input type="range" class="rng mt-s" id="ep" min="2019" max="2026" step="1" value="2026" aria-label="Imagery epoch"><div class="note" id="epn"></div></div>
      </div>`;
      const map = new CityMap($('canvas', el)); S.map = map;
      const legend = () => {
        const L = { status: '<div class="note">Declared buildings are muted so the problem cases stand out.</div>', risk: '<div style="width:100%"><div style="height:8px;border-radius:4px;background:linear-gradient(90deg,var(--map-idle),var(--warn),var(--bad))"></div><div class="row-flex note" style="justify-content:space-between;margin-top:3px"><span>Low</span><span>High risk</span></div></div>', use: '<div><i class="sw" style="background:rgb(106,139,255)"></i>Residential</div><div><i class="sw" style="background:rgb(176,124,240)"></i>Mixed</div><div><i class="sw" style="background:rgb(44,196,176)"></i>Commercial</div>', change: '<div><i class="sw" style="background:var(--bad)"></i>Floors added since 2019</div><div><i class="sw" style="background:var(--map-idle)"></i>Unchanged</div>' };
        $('#legend').innerHTML = L[map.layer];
      };
      const epNote = () => { const ep = map.epoch; let n = 0, m = 0; TS.buildings.forEach((b) => { const d = b.floorsAt(ep) - b.floorsAt(2019); if (d > 0) { n += d; m++; } }); $('#epn').textContent = ep === 2019 ? 'Baseline epoch. Heights from LiDAR and satellite.' : n + ' new floors detected in ' + m + ' buildings since 2019. Drag to pan, scroll to zoom, Shift+drag to orbit.'; $('#epl').textContent = ep; };
      const ins = (b) => {
        const box = $('#ins'); if (!b) { box.innerHTML = '<div class="ih"><h4>Property inspector</h4><div class="note">Click any building. Red ones are the interesting ones.</div></div>'; return; }
        box.innerHTML = '<div class="ih"><div class="row-flex"><h4 style="margin:0">' + b.id + '</h4><div class="sp"></div>' + st(b.status) + '</div><div class="note">' + b.area + ' · Holding ' + b.holding + ' · ' + b.use.replace('res', 'Residential').replace('mix', 'Mixed use').replace('com', 'Commercial') + '</div></div><div class="ib">' +
          '<div class="ib-grid"><div><div class="k">Floors built / declared</div><div class="v">' + b.floors + ' / ' + b.declFloors + '</div></div><div><div class="k">AI rent per month</div><div class="v">' + tk(b.rentEst) + '</div></div><div><div class="k">Declared rent</div><div class="v">' + tk(b.rentDecl) + '</div></div><div><div class="k">Tax gap per year</div><div class="v" style="color:' + (b.status ? 'var(--bad)' : 'var(--ok)') + '">' + tk(b.gapAnnual) + '</div></div></div>' +
          '<div class="row-flex note"><span>Risk score</span><div class="bar ' + (b.risk > 60 ? 'bad' : b.risk > 35 ? 'warn' : 'ok') + ' sp"><i style="width:' + b.risk + '%"></i></div><b style="color:var(--ink)">' + b.risk + '</b></div>' +
          '<div class="mt-s"><div class="note" style="margin-bottom:2px">Why the score</div>' + reasonsHTML(b, 3) + '</div>' +
          '<div class="row-flex wrap mt-s"><button class="btn sm primary" data-go="p360">Open Property 360</button><button class="btn sm" data-go="owners">Owner graph</button><button class="btn sm" data-go="copilot">Prepare notice</button></div></div>';
        $$('[data-go]', box).forEach((x) => x.addEventListener('click', () => go(x.dataset.go)));
        if (window.gsap) gsap.from(box.children, { opacity: 0, y: 8, duration: 0.3, stagger: 0.05 });
      };
      map.onSelect = (b) => { pickB(b); ins(b); };
      const tipEl = $('#tip');
      map.onHover = (b, x, y) => { if (!b) { tipEl.style.opacity = 0; return; } tipEl.innerHTML = '<b>' + b.id + '</b><br>' + b.area + ' · ' + b.floors + ' floors<br>' + TX.STATUS[b.status]; tipEl.style.opacity = 1; tipEl.style.left = x + 14 + 'px'; tipEl.style.top = y + 14 + 'px'; };
      legend(); epNote(); const keep = opts.keep !== false && S.sel; ins(keep ? S.sel : null);
      if (keep) map.sel = S.sel;
      if (S.hl && S.hl.length) { const hl = S.hl; S.hl = null; map.hl = hl; map.numbered = true; const xs = hl.map((b) => b.x), ys = hl.map((b) => b.y); const bw = Math.max(...xs) - Math.min(...xs) + 200, bh = Math.max(...ys) - Math.min(...ys) + 200; setTimeout(() => map.tween({ cx: (Math.max(...xs) + Math.min(...xs)) / 2, cy: (Math.max(...ys) + Math.min(...ys)) / 2, zoom: Math.min(map.w / bw, map.h / (bh * 0.8)) }, 1.2), 600); toast('Showing ' + hl.length + ' results on the map'); }
      map.sweep(2.8);
      const offT = on('theme', () => map.themeChanged());
      $('#layers').addEventListener('click', (e) => { const b = e.target.closest('[data-l]'); if (!b) return; map.layer = b.dataset.l; $$('#layers .layer').forEach((x) => x.setAttribute('aria-pressed', x === b)); map.dirty = true; legend(); });
      $('#flt').addEventListener('change', () => { const on_ = $$('#flt input').map((i) => i.checked); map.filter = on_.every(Boolean) ? null : (b) => on_[b.status]; map.dirty = true; });
      $('#ep').addEventListener('input', (e) => { map.epoch = +e.target.value; map.dirty = true; epNote(); });
      $('#play').addEventListener('click', () => { map.layer = 'change'; $$('#layers .layer').forEach((x) => x.setAttribute('aria-pressed', x.dataset.l === 'change')); legend(); const o = { v: 2019 }; map.epoch = 2019; gsap.to(o, { v: 2026, duration: 5, ease: 'none', onUpdate: () => { map.epoch = Math.round(o.v); $('#ep').value = map.epoch; map.dirty = true; epNote(); } }); });
      $('#rl').addEventListener('click', () => map.rotate(0.6)); $('#zi').addEventListener('click', () => map.zoomBy(1.4)); $('#zo').addEventListener('click', () => map.zoomBy(1 / 1.4)); $('#fit').addEventListener('click', () => { map.fit(); map.tween({ yaw: -0.52, tilt: 0.92 }); });
      $('#tiltseg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $$('#tiltseg button').forEach((x) => x.setAttribute('aria-pressed', x === b)); map.setTilt(+b.dataset.t); });
      $('#scan').addEventListener('click', () => { map.sweep(2.6); toast('AI scan: re-classifying ' + fmt(TS.total) + ' buildings'); });
      if (opts.focus && S.sel) setTimeout(() => map.focus(S.sel, 1.9, 1.2), 900);
      return { destroy() { map.destroy(); S.map = null; tipEl.style.opacity = 0; } };
    }
  });

  // ===================================================================== PROPERTY 360
  reg('p360', {
    title: 'Property 360', crumb: 'One profile per building and owner',
    render(el) {
      const draw = () => {
        const b = S.sel; const m = b.model; const peers = TS.byPriority.slice(0, 24).filter((x) => x !== TS.hero);
        el.innerHTML = `
        <div class="row-flex wrap" style="margin-bottom:14px"><div><h2 class="big">${b.id}</h2><div class="note">${b.area}, Holding ${b.holding} · ${b.use === 'res' ? 'Residential' : b.use === 'mix' ? 'Mixed use' : 'Commercial'} · ${b.floors} floors · ${fmt(Math.round(b.areaM2))} m² footprint</div></div><div class="sp"></div>
          <label class="note row-flex">Building <select class="sel" id="pick"><option value="${TS.hero.idx}"${b === TS.hero ? ' selected' : ''}>Featured: ${TS.hero.id} (demo)</option>${peers.map((p) => '<option value="' + p.idx + '"' + (p === b ? ' selected' : '') + '>#' + p.rankAI + ' priority · ' + p.id + ' · ' + p.area + '</option>').join('')}</select></label>
          <button class="btn" id="onmap">${icon('map')}Show on map</button><button class="btn primary" id="prep">${icon('doc')}Prepare notice</button></div>
        <div class="grid" style="grid-template-columns:minmax(0,1.05fr) minmax(0,1fr) minmax(0,.9fr)">
          <div class="stack" style="gap:14px">
            <div class="card reg"><div class="card-h"><div><h3>Street view and AI reading</h3><div class="sub">Mobile mapping image · detections from vision models</div></div><div class="sp"></div><div class="switch"><span class="note" style="white-space:nowrap">AI overlay</span><button id="ov" aria-pressed="true" aria-label="Toggle AI overlay"></button></div></div><div class="facade" id="fac">${facade(b, { boxes: true })}</div>
              <div class="grid g3 mt-s" style="gap:8px"><div class="ib-grid" style="grid-column:1/-1;grid-template-columns:repeat(3,1fr);margin:0"><div><div class="k">Floors built</div><div class="v">${b.floors}</div></div><div><div class="k">Floors declared</div><div class="v" style="color:${b.floors > b.declFloors ? 'var(--bad)' : 'inherit'}">${b.declFloors}</div></div><div><div class="k">Units</div><div class="v">${b.units}</div></div></div></div></div>
            <div class="card"><div class="card-h"><div><h3>Change history</h3><div class="sub">Multi-epoch satellite and UAV LiDAR</div></div></div>${timeline(b)}</div>
          </div>
          <div class="stack" style="gap:14px">
            <div class="card"><div class="card-h"><div><h3>Signboards read (Bangla OCR)</h3><div class="sub">${b.shops.length} businesses matched against registries</div></div></div>
              ${b.shops.length ? '<table class="t"><thead><tr><th>Signboard</th><th>VAT</th><th>Licence</th><th class="r">OCR</th></tr></thead><tbody>' + b.shops.slice(0, 7).map((s) => '<tr><td><div class="bn">' + s.bn + '</div><div class="note">' + s.en + '</div></td><td>' + (s.vat ? '<span class="tag ok">Yes</span>' : '<span class="tag bad">No</span>') + '</td><td>' + (s.tl ? '<span class="tag ok">Yes</span>' : '<span class="tag warn">No</span>') + '</td><td class="r">' + s.conf + '%</td></tr>').join('') + '</tbody></table>' + (b.shops.length > 7 ? '<div class="note mt-s">+' + (b.shops.length - 7) + ' more in Business Discovery</div>' : '') : '<div class="note">No shopfront signage. Residential only.</div>'}</div>
            <div class="card"><div class="card-h"><div><h3>Utilities and tariff</h3><div class="sub">DESCO, Titas Gas, Dhaka WASA</div></div></div>
              <table class="t"><tbody>${b.util.elec.map((e) => '<tr><td>Electricity <span class="muted">' + e.meter + '</span></td><td>' + e.n + ' meters</td><td class="r"><span class="tag ' + (e.tariff === 'Commercial' ? 'brand' : '') + '">' + e.tariff + '</span></td></tr>').join('')}<tr><td>Gas (Titas)</td><td>${b.shops.length ? 'Shops present' : 'Households'}</td><td class="r"><span class="tag ${b.tariffMismatch ? 'bad' : ''}">${b.util.gas}</span></td></tr><tr><td>Water (WASA)</td><td></td><td class="r"><span class="tag">${b.util.water}</span></td></tr></tbody></table>
              ${b.tariffMismatch ? '<div class="callout mt-s" style="border-color:var(--bad);background:var(--bad-soft)"><b>Tariff mismatch:</b> commercial activity on a residential gas tariff.</div>' : ''}</div>
            <div class="card"><div class="card-h"><div><h3>Filing history</h3><div class="sub">NBR e-Return · TIN ${b.tin ? maskedHTML(b.tin, 'TIN') : '<span class="tag bad">none</span>'}</div></div></div>
              <table class="t"><thead><tr><th>Year</th><th class="r">Declared rent / month</th><th class="r">Tax paid</th></tr></thead><tbody>${[2024, 2025, 2026].map((y, i) => '<tr><td>' + y + '</td><td class="r">' + (b.rentDecl ? tk(b.rentDecl * (0.9 + i * 0.05)) : '<span class="muted">No filing</span>') + '</td><td class="r">' + (b.rentDecl ? tk(b.rentDecl * (0.9 + i * 0.05) * 12 * TS.TAX_RATE) : '<span class="muted">-</span>') + '</td></tr>').join('')}</tbody></table></div>
          </div>
          <div class="stack" style="gap:14px">
            <div class="card reg" style="border-color:${b.status ? 'var(--brand-line)' : 'var(--line)'}"><div class="card-h"><div><h3>Revenue at risk</h3><div class="sub">${st(b.status)}</div></div></div>
              <div class="kpi"><div class="lab">Tax gap per year</div><div class="num" id="gapn" style="color:${b.status ? 'var(--bad)' : 'var(--ok)'}">${tk(b.gapAnnual)}</div><div class="delta">AI rent ${tk(m.est)} vs declared ${tk(b.rentDecl)} per month</div></div>
              <div class="row-flex mt-s note"><span>Confidence</span><div class="bar sp"><i style="width:${m.conf * 100}%"></i></div><b style="color:var(--ink)">${Math.round(m.conf * 100)}%</b></div>
              <div class="row-flex note" style="margin-top:6px"><span>Risk score</span><div class="bar ${b.risk > 60 ? 'bad' : b.risk > 35 ? 'warn' : 'ok'} sp"><i style="width:${b.risk}%"></i></div><b style="color:var(--ink)">${b.risk}</b></div>
              <hr class="hr"><div class="note" style="margin-bottom:2px">Why this score, in plain words</div>${reasonsHTML(b, 5)}
              <div class="note mt-s">Human officer decides. Every score keeps its reasons for audit and appeal.</div></div>
            <div class="card"><div class="card-h"><div><h3>Owner</h3><div class="sub">Entity-resolved across e-Porcha, holding, TIN</div></div></div>
              <div class="b">${b.owner.name}</div><div class="bn note">${b.owner.bn}</div>
              <div class="row-flex wrap note mt-s" style="gap:12px"><span>NID ${maskedHTML(b.owner.nid, 'NID')}</span><span>Phone ${maskedHTML(b.owner.phone, 'phone')}</span></div>
              ${b.cluster ? '<div class="callout mt-s">Linked to <b>' + (b.cluster.count - 1) + ' other buildings</b> under ' + b.cluster.names + ' names. <a href="#" id="og" style="color:var(--brand)">Open Owner Graph</a></div>' : '<div class="note mt-s">No other holdings found.</div>'}</div>
            <div class="card flat"><div class="sub" style="margin:0">Photos from field and MMS (AI-annotated)</div><div class="pho mt-s">${[0, 1, 2].map((i) => '<figure><div class="facade" style="aspect-ratio:1;overflow:hidden">' + facade(b, { w: 180, h: 180, hl: i !== 1 }).replace('width="100%"', 'width="100%" style="transform:scale(' + (1 + i * 0.25) + ');transform-origin:50% 90%"') + '</div><figcaption>' + ['Front', 'Roof line', 'Side'][i] + '</figcaption></figure>').join('')}</div></div>
          </div>
        </div>`;
        $('#pick').addEventListener('change', (e) => { S.sel = TS.buildings[+e.target.value]; TX.emit('select', S.sel); draw(); });
        $('#onmap').addEventListener('click', () => go('map', { focus: true }));
        $('#prep').addEventListener('click', () => go('copilot'));
        const og = $('#og'); og && og.addEventListener('click', (e) => { e.preventDefault(); go('owners'); });
        $('#ov').addEventListener('click', (e) => { const p = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', p); $('#fac').innerHTML = facade(b, { boxes: p }); });
        if (window.gsap) gsap.from(el.querySelectorAll('.card'), { y: 12, opacity: 0, duration: 0.45, stagger: 0.04, clearProps: 'transform,opacity' });
        countUp($('#gapn'), b.gapAnnual, { fmt: (v) => tk(v), dur: 1 });
      };
      draw();
    }
  });
  function timeline(b) {
    const ev = [{ y: 2019, t: 'Baseline survey', d: b.floorsAt(2019) + ' floors, ' + Math.round(b.areaM2 - b.footprintChange) + ' m² footprint', c: 'var(--ink-3)' }];
    b.adds.slice().sort((a, c) => a.yr - c.yr).forEach((a) => ev.push({ y: a.yr, t: '+' + a.n + ' floor' + (a.n > 1 ? 's' : '') + ' detected', d: 'Satellite and LiDAR change detection; not on any filing', c: 'var(--bad)' }));
    if (b.footprintChange) ev.push({ y: 2024, t: 'Footprint extension', d: '+' + b.footprintChange + ' m² at ground level', c: 'var(--warn)' });
    if (b.tariffMismatch) ev.push({ y: 2025, t: 'Tariff mismatch flagged', d: 'Shops on residential gas tariff', c: 'var(--warn)' });
    ev.push({ y: 2026, t: 'Scored by TaxSight AI', d: 'Risk ' + b.risk + ', rank #' + b.rankAI + ' of ' + fmt(TS.total), c: 'var(--brand)' });
    ev.sort((a, c) => a.y - c.y);
    return '<div class="stack" style="gap:0">' + ev.map((e, i) => '<div class="row-flex" style="align-items:flex-start;gap:12px;padding-bottom:12px;position:relative"><div style="width:34px;font:500 12px var(--f-title);color:var(--ink-3)">' + e.y + '</div><div style="position:relative"><i class="sw" style="background:' + e.c + ';border-radius:50%;width:9px;height:9px;margin-top:5px"></i>' + (i < ev.length - 1 ? '<i style="position:absolute;left:4px;top:16px;bottom:-14px;width:1px;background:var(--line-2)"></i>' : '') + '</div><div><div class="b" style="font-size:12.5px">' + e.t + '</div><div class="note">' + e.d + '</div></div></div>').join('') + '</div>';
  }
  window.reasonsHTML = reasonsHTML;
})();
