/* TaxSight AI · views: Owner Graph, Revenue Gap Engine, Smart Targeting, Ask the Data */
(function () {
  'use strict';
  const { $, $$, fmt, tk, lakh, pct, st, icon, S, on, pickB, toast, countUp, audit, lineChart, barChart, maskedHTML, reg, go, css, scaleLin } = TX;

  // ===================================================================== OWNER GRAPH
  function layout(nodes, edges, W, H) {
    nodes.forEach((n, i) => { const a = (i / nodes.length) * 6.283; n.x = W / 2 + Math.cos(a) * 120 + (Math.random() - 0.5) * 20; n.y = H / 2 + Math.sin(a) * 90; n.vx = n.vy = 0; });
    for (let it = 0; it < 360; it++) {
      const k = 1 - it / 360;
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const a = nodes[i], b = nodes[j]; let dx = a.x - b.x, dy = a.y - b.y; const d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2); const f = 9500 / d2; dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f; }
      edges.forEach((e) => { const a = e.a, b = e.b; let dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) + 0.01; const f = (d - (e.len || 92)) * 0.035; dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f; });
      nodes.forEach((n) => { n.vx += (W / 2 - n.x) * 0.006; n.vy += (H / 2 - n.y) * 0.006; n.x += n.vx * 0.5 * k; n.y += n.vy * 0.5 * k; n.vx *= 0.8; n.vy *= 0.8; n.x = Math.max(60, Math.min(W - 60, n.x)); n.y = Math.max(40, Math.min(H - 52, n.y)); });
    }
  }
  const initials = (n) => n.split(' ').filter((x) => /^[A-Z]/.test(x) && x !== 'Md.').slice(0, 2).map((x) => x[0]).join('');

  reg('owners', {
    title: 'Owner Graph', crumb: 'Hidden portfolios and proxy ownership',
    render(el) {
      const list = TS.clusters.slice().sort((a, b) => (b === TS.heroCluster) - (a === TS.heroCluster) || b.gapAnnual - a.gapAnnual).slice(0, 14);
      let cur = S.sel && S.sel.cluster ? S.sel.cluster : TS.heroCluster;
      el.innerHTML = `<div class="grid" style="grid-template-columns:260px minmax(0,1fr) 280px;height:100%">
        <div class="card" style="overflow:auto;padding:12px"><div class="card-h" style="margin-bottom:6px"><div><h3>Owner groups</h3><div class="sub">Ranked by annual tax gap</div></div></div><div id="cl" class="stack" style="gap:6px"></div></div>
        <div class="card reg" style="padding:0;display:flex;flex-direction:column;min-height:520px"><div class="card-h" style="padding:14px 16px 0"><div><h3 id="gt"></h3><div class="sub" id="gs"></div></div><div class="sp"></div><div class="row-flex note wrap" style="gap:4px 12px;justify-content:flex-end;max-width:300px"><span style="white-space:nowrap"><i class="sw" style="background:var(--ink-3);border-radius:50%"></i> Person</span><span><i class="sw" style="background:var(--ink-3)"></i> Company</span><span><svg width="16" height="8"><line x1="0" x2="16" y1="4" y2="4" stroke="var(--ink-3)" stroke-dasharray="3 2"/></svg> Family or director link</span></div></div><div id="gw" style="flex:1;min-height:0"></div></div>
        <div class="stack" style="gap:14px"><div class="card" id="sum"></div><div class="card" id="nd"><div class="sub">Click a person, company or building.</div></div></div></div>`;
      el.style.padding = '20px'; el.firstElementChild.style.height = 'calc(100vh - 100px)';
      const clHTML = () => { $('#cl').innerHTML = list.map((c) => '<button class="card spot" data-c="' + c.id + '" style="text-align:left;padding:10px 12px;cursor:pointer;' + (c === cur ? 'border-color:var(--brand);background:var(--brand-soft)' : '') + '"><div class="b" style="font-size:12.5px">' + c.head.name + '</div><div class="note" style="margin-top:2px;white-space:nowrap">' + c.count + ' buildings · ' + c.names + (c.names === 1 ? ' name' : ' names') + '</div><div style="color:var(--bad);font-weight:600;font-size:12.5px">' + tk(c.gapAnnual) + ' per year</div></button>').join(''); };
      const draw = () => {
        clHTML(); const c = cur; const W = 640, H = 470;
        const nodes = [], edges = []; const map = {};
        c.members.forEach((m) => { const n = { id: m.id, kind: m.type === 'company' ? 'co' : 'p', ref: m, label: m.name.length > 20 ? m.name.split(' ').slice(0, 2).join(' ') : m.name }; nodes.push(n); map[m.id] = n; });
        c.buildings.forEach((b) => { const n = { id: b.id, kind: 'b', ref: b, label: b.id.replace('ZN10-', '#') }; nodes.push(n); map[b.id] = n; edges.push({ a: map[b.owner.id] || nodes[0], b: n, t: 'owns', len: 82 }); });
        c.ties.forEach((t) => { if (map[t.a] && map[t.b]) edges.push({ a: map[t.a], b: map[t.b], t: t.t, len: 125 }); });
        layout(nodes, edges, W, H);
        const eStyle = { owns: 'stroke:var(--line-2)', Spouse: 'stroke:var(--ink-3);stroke-dasharray:4 3', Child: 'stroke:var(--ink-3);stroke-dasharray:4 3', Director: 'stroke:var(--brand);stroke-dasharray:2 3', 'Shared phone': 'stroke:var(--bad);stroke-dasharray:2 3' };
        let svg = '<svg id="gsvg" viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">';
        svg += '<g>' + edges.map((e) => '<line class="ed" data-a="' + e.a.id + '" data-b="' + e.b.id + '" x1="' + e.a.x + '" y1="' + e.a.y + '" x2="' + e.b.x + '" y2="' + e.b.y + '" stroke-width="1.4" style="' + eStyle[e.t] + '"><title>' + e.t + '</title></line>').join('') + '</g>';
        svg += '<g>' + nodes.map((n) => {
          let sh = '';
          if (n.kind === 'p') sh = '<circle r="17" style="fill:var(--surface);stroke:var(--ink-3)" stroke-width="1.6"/><text text-anchor="middle" y="4" style="font:600 11px var(--f-title);fill:var(--ink)">' + initials(n.ref.name) + '</text>';
          else if (n.kind === 'co') sh = '<rect x="-17" y="-15" width="34" height="30" rx="5" style="fill:var(--brand-soft);stroke:var(--brand)" stroke-width="1.6"/><text text-anchor="middle" y="4" style="font:600 10px var(--f-title);fill:var(--brand)">Ltd</text>';
          else { const col = ['var(--ok)', 'var(--warn)', 'var(--bad)'][n.ref.status]; sh = '<rect x="-14" y="-15" width="28" height="30" rx="3" style="fill:' + col + '" opacity=".92"/><text text-anchor="middle" y="5" style="font:700 12px var(--f-title);fill:#fff">' + n.ref.floors + '</text>'; }
          return '<g class="nd" data-id="' + n.id + '" transform="translate(' + n.x + ',' + n.y + ')" tabindex="0" style="cursor:pointer">' + sh + '<text text-anchor="middle" y="' + (n.kind === 'b' ? 28 : 31) + '" style="font:11px var(--f-body);fill:var(--ink-2)">' + n.label + '</text></g>';
        }).join('') + '</g></svg>';
        $('#gw').innerHTML = svg;
        $('#gt').textContent = c.head.name + ' and family network'; $('#gs').textContent = c.count + ' buildings · ' + c.members.length + ' linked people and companies';
        const noTin = c.buildings.filter((b) => !b.owner.tin || b.status === 2).length;
        $('#sum').innerHTML = '<h3>Hidden portfolio</h3><div class="grid g2 mt-s" style="gap:8px"><div class="ib-grid" style="grid-column:1/-1;margin:0"><div><div class="k">Buildings</div><div class="v">' + c.count + '</div></div><div><div class="k">Under names</div><div class="v">' + c.names + '</div></div><div><div class="k">No tax record</div><div class="v" style="color:var(--bad)">' + noTin + '</div></div><div><div class="k">Gap per year</div><div class="v" style="color:var(--bad)">' + tk(c.gapAnnual) + '</div></div></div></div><div class="note mt-s">Each holding looks small alone. Linked by family ties, company directors' + (c.ties.some((t) => t.t === 'Shared phone') ? ' and a shared phone number' : '') + ', the group is one large undeclared owner.</div>';
        if (window.gsap) {
          gsap.from('#gsvg .nd', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.03, ease: 'back.out(1.6)', delay: 0.05 });
          gsap.from('#gsvg .ed', { opacity: 0, duration: 0.6, delay: 0.3 });
        }
        $$('#gsvg .nd').forEach((g) => {
          const id = g.dataset.id;
          g.addEventListener('mouseenter', () => { $$('#gsvg .ed').forEach((e) => (e.style.opacity = e.dataset.a === id || e.dataset.b === id ? 1 : 0.12)); });
          g.addEventListener('mouseleave', () => $$('#gsvg .ed').forEach((e) => (e.style.opacity = 1)));
          const act = () => { const n = nodes.find((x) => x.id === id); detail(n); };
          g.addEventListener('click', act); g.addEventListener('keydown', (e) => e.key === 'Enter' && act());
        });
      };
      const detail = (n) => {
        const r = n.ref; let h;
        if (n.kind === 'b') h = '<h3>' + r.id + '</h3><div class="note">' + r.area + ' · ' + r.floors + ' floors</div><div class="mt-s">' + st(r.status) + '</div><div class="ib-grid"><div><div class="k">Gap per year</div><div class="v">' + tk(r.gapAnnual) + '</div></div><div><div class="k">Owner on record</div><div class="v" style="font-size:12.5px">' + r.owner.name.split(' ').slice(0, 2).join(' ') + '</div></div></div><button class="btn sm primary" id="o360">Open Property 360</button>';
        else { const bs = c_buildings(r); h = '<h3>' + r.name + '</h3><div class="bn note">' + r.bn + '</div><div class="row-flex wrap mt-s" style="gap:8px">' + (n.kind === 'co' ? '<span class="tag brand">Company</span>' : '<span class="tag">Person</span>') + (r.tin ? '<span class="tag ok">TIN on file</span>' : '<span class="tag bad">No TIN</span>') + '</div><div class="note mt-s">' + (r.nid ? 'NID ' + maskedHTML(r.nid, 'NID') + '<br>' : '') + (r.phone ? 'Phone ' + maskedHTML(r.phone, 'phone') + '<br>' : '') + (r.tin ? 'TIN ' + maskedHTML(r.tin, 'TIN') : '') + '</div><div class="ib-grid"><div><div class="k">Buildings held</div><div class="v">' + bs.length + '</div></div><div><div class="k">Gap per year</div><div class="v">' + tk(bs.reduce((s, b) => s + b.gapAnnual, 0)) + '</div></div></div><div class="note">Personal data stays masked. Revealing a value is logged.</div>'; }
        $('#nd').innerHTML = h; const o = $('#o360'); o && o.addEventListener('click', () => { pickB(r); go('p360'); });
        if (window.gsap) gsap.from('#nd > *', { opacity: 0, y: 6, duration: 0.3, stagger: 0.04 });
      };
      const c_buildings = (m) => cur.buildings.filter((b) => b.owner.id === m.id);
      draw();
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; cur = TS.clusters.find((x) => x.id === +b.dataset.c); draw(); });
    }
  });

  // ===================================================================== REVENUE GAP ENGINE
  reg('gap', {
    title: 'Revenue Gap Engine', crumb: 'Explainable rent and value estimate',
    render(el) {
      const b = S.sel; const ov = { floors: b.floors, roadW: b.roadW, amen: b.amen, transit: b.transitM, occ: b.occ };
      const comps = Array.from({ length: 5 }, (_, i) => { const sq = Math.round(700 + ((b.idx * 37 + i * 211) % 900)); const r = TS.BASE_RATE[b.area] * (0.85 + (((b.idx * 13 + i * 29) % 40) / 100)) * (b.use === 'res' ? 1 : 1.6); return { a: ['Road ' + (3 + i * 2) + ', ' + b.area, 'Block ' + 'ABCDE'[i] + ', ' + b.area, 'Main Rd, ' + b.area, 'Road ' + (9 + i) + ', ' + b.area, 'Sector ' + (2 + i) + ', ' + b.area][i], sq, rent: sq * r }; });
      const head = TS.clusters.indexOf(b.cluster) >= 0 ? b.cluster.head : b.owner; const cid = b.cluster ? b.cluster.id : b.idx;
      const sig = [['Properties held', b.cluster ? b.cluster.count : 1, 'count', 9], ['Vehicles (BRATA)', 1 + (cid % 3), 'cars', 4], ['Electricity bill', 14000 + (cid * 1700) % 30000, 'tk', 60000], ['International trips (3 yrs)', cid % 5, 'trips', 6]];
      el.innerHTML = `<div class="row-flex wrap" style="margin-bottom:14px"><div><h2 class="big">How much is owed?</h2><div class="note">Building ${b.id} · ${b.area} · ${st(b.status)}. Change a input and watch the estimate move.</div></div><div class="sp"></div><button class="btn" id="reset">Reset inputs</button><button class="btn primary" id="topn">${icon('doc')}Prepare notice</button></div>
      <div class="grid g-main"><div class="stack" style="gap:14px">
        <div class="card reg"><div class="grid g3" style="gap:20px"><div class="kpi"><div class="lab">AI rent per month</div><div class="num" id="e1"></div><div class="delta" id="e1s"></div></div><div class="kpi"><div class="lab">Declared rent</div><div class="num" id="e2"></div><div class="delta">From e-Return filing</div></div><div class="kpi"><div class="lab">Tax gap per year</div><div class="num" id="e3" style="color:var(--bad)"></div><div class="delta" id="e3s"></div></div></div><div id="rb" class="mt"></div></div>
        <div class="card"><div class="card-h"><div><h3>What drives the estimate</h3><div class="sub">Each bar is Taka per month added by one factor</div></div></div><div id="wf"></div></div>
        <div class="grid g2"><div class="card"><div class="card-h"><div><h3>Comparable listings</h3><div class="sub">Scraped rental ads and broker data, same area</div></div></div><table class="t"><thead><tr><th>Location</th><th class="r">Sq ft</th><th class="r">Rent / month</th></tr></thead><tbody>${comps.map((c) => '<tr><td>' + c.a + '</td><td class="r">' + fmt(c.sq) + '</td><td class="r">' + tk(c.rent, 2) + '</td></tr>').join('')}</tbody></table></div>
        <div class="card"><div class="card-h"><div><h3>Lifestyle vs declared income</h3><div class="sub">${head.name} · wealth-audit signal</div></div></div><div class="stack" style="gap:10px">${sig.map((s) => '<div><div class="row-flex note"><span class="sp">' + s[0] + '</span><b style="color:var(--ink)">' + (s[2] === 'tk' ? tk(s[1]) : s[1]) + '</b></div><div class="bar"><i style="width:' + Math.min(100, (s[1] / s[3]) * 100) + '%"></i></div></div>').join('')}</div><div class="callout mt-s" id="life"></div></div></div>
      </div>
      <div class="card" style="align-self:start"><div class="card-h"><div><h3>What if</h3><div class="sub">Test the model. Does the answer still make sense?</div></div></div>
        ${[['floors', 'Floors', 2, 16, 1], ['roadW', 'Road width (ft)', 6, 24, 1], ['amen', 'Lift, generator, parking (0 to 3)', 0, 3, 1], ['transit', 'Distance to transit (m)', 100, 1500, 50], ['occ', 'Occupancy from utility data', 60, 100, 1]].map(([k, t, a, z, s]) => '<div class="mt-s"><div class="row-flex note"><span class="sp">' + t + '</span><b style="color:var(--ink)" id="v_' + k + '"></b></div><input type="range" class="rng" data-k="' + k + '" min="' + a + '" max="' + z + '" step="' + s + '" value="' + (k === 'occ' ? Math.round(ov.occ * 100) : ov[k]) + '" aria-label="' + t + '"></div>').join('')}
        <hr class="hr"><div class="note">Model: gradient-boosted trees trained on rental listings, with area, floor, road width, amenities and transit distance. Range reflects model confidence of <b style="color:var(--ink)">${Math.round(b.conf * 100)}%</b>.</div></div></div>`;
      const calc = () => {
        const o = { floors: ov.floors, roadW: ov.roadW, amen: ov.amen, transit: ov.transit, occ: ov.occ }; const m = TS.rentModel(b, o);
        const gapM = Math.max(0, m.est - b.rentDecl), gapY = gapM * 12 * TS.TAX_RATE;
        $('#e1').textContent = tk(m.est); $('#e1s').textContent = 'Range ' + lakh(m.lo) + ' to ' + lakh(m.hi);
        $('#e2').textContent = tk(b.rentDecl); $('#e3').textContent = tk(gapY); $('#e3s').textContent = '(' + tk(gapM) + ' extra rent) x 12 x ' + Math.round(TS.TAX_RATE * 100) + '% tax';
        // range bar
        const mxv = Math.max(m.hi, b.rentDecl) * 1.12, X = scaleLin(0, mxv, 0, 100);
        $('#rb').innerHTML = '<div style="position:relative;height:46px"><div style="position:absolute;left:0;right:0;top:20px;height:6px;background:var(--surface-3);border-radius:6px"></div><div style="position:absolute;left:' + X(m.lo) + '%;width:' + (X(m.hi) - X(m.lo)) + '%;top:16px;height:14px;border-radius:7px;background:var(--brand-soft);border:1px solid var(--brand)"></div><div style="position:absolute;left:' + X(m.est) + '%;top:12px;height:22px;width:2px;background:var(--brand)"></div><div style="position:absolute;left:' + X(b.rentDecl) + '%;top:15px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:var(--ink)"></div><div class="note" style="position:absolute;left:' + X(b.rentDecl) + '%;top:-2px;transform:translateX(-50%);white-space:nowrap">Declared</div><div class="note" style="position:absolute;left:' + X(m.est) + '%;top:-2px;transform:translateX(-50%);white-space:nowrap;color:var(--brand)">AI estimate</div></div>';
        // waterfall
        const rows = m.contrib.map((c) => c); let cum = 0; const tot = m.est; const maxv = Math.max(tot, rows.reduce((s, r) => s + Math.max(0, r.v), 0));
        const pos = rows.reduce((s, r) => s + r.v, 0); const scale = 100 / (pos * 1.04);
        $('#wf').innerHTML = rows.map((r) => { const l = cum * scale; cum += r.v; return '<div class="row-flex" style="padding:5px 0"><div style="width:190px" class="note">' + r.k + '</div><div style="flex:1;position:relative;height:16px"><div style="position:absolute;left:' + l + '%;width:' + Math.max(0.6, Math.abs(r.v) * scale) + '%;height:16px;border-radius:4px;background:' + (r.v >= 0 ? 'var(--brand)' : 'var(--warn)') + ';opacity:.9"></div></div><div style="width:92px;text-align:right;font-weight:500">' + (r.v >= 0 ? '+' : '-') + tk(Math.abs(r.v), 2).replace('Tk ', '') + '</div></div>'; }).join('') + '<div class="row-flex" style="padding:7px 0;border-top:1px solid var(--line);margin-top:4px"><div style="width:190px" class="b">Estimated rent per month</div><div class="sp"></div><div class="b" style="font-size:14px">' + tk(pos) + '</div></div>';
        $$('[data-k]').forEach((i) => { const k = i.dataset.k; $('#v_' + k).textContent = k === 'occ' ? Math.round(ov.occ * 100) + '%' : ov[k]; });
        const ratio = Math.max(0.5, (b.rentEst * 12 * 0.6) / Math.max(sig[0][1] * 4e5, 1)); $('#life').innerHTML = '<b>Lifestyle is ' + (2 + (cid % 4) + 0.4).toFixed(1) + 'x declared income.</b> Flagged for wealth audit review by an officer.';
      };
      calc();
      countUp($('#e1'), b.model.est, { fmt: (v) => tk(v), dur: 1 }); countUp($('#e3'), b.gapAnnual, { fmt: (v) => tk(v), dur: 1 });
      el.addEventListener('input', (e) => { const k = e.target.dataset.k; if (!k) return; ov[k] = k === 'occ' ? +e.target.value / 100 : +e.target.value; calc(); });
      $('#reset').addEventListener('click', () => go('gap')); $('#topn').addEventListener('click', () => go('copilot'));
    }
  });

  // ===================================================================== SMART TARGETING
  reg('targeting', {
    title: 'Smart Targeting', crumb: 'Recovery per officer hour',
    render(el) {
      let cap = 300; const WEEKS = 12; let map = null;
      const realised = (b) => (b.violation ? b.gapAnnual : 0);
      const pickByHours = (list, hours) => { let h = 0; const out = []; for (const b of list) { if (h + b.hours > hours) continue; h += b.hours; out.push(b); if (h > hours - 4) break; } return { out, h }; };
      el.innerHTML = `<div class="row-flex wrap" style="margin-bottom:14px"><div><h2 class="big">Who first?</h2><div class="note">Ranked by expected recovery x chance of success, divided by officer effort. Based on ${fmt(TS.total)} scored buildings.</div></div><div class="sp"></div>
        <label class="row-flex note">Officer hours per week <input type="range" class="rng" id="cap" min="100" max="700" step="20" value="300" style="width:170px"><b style="color:var(--ink);width:40px" id="capv">300</b></label></div>
      <div class="grid g4" id="tk"></div>
      <div class="grid g-main mt"><div class="card reg"><div class="card-h"><div><h3>Recovery gained as officers visit more cases</h3><div class="sub">Simulated field outcomes. Higher curve means less wasted effort.</div></div></div><div id="gain"></div></div>
        <div class="card" style="padding:0;overflow:hidden"><div class="card-h" style="padding:14px 16px 0;margin:0;position:absolute;z-index:2"><div><h3>Tomorrow's route</h3><div class="sub">12 buildings, nearest-first</div></div></div><div class="mapwrap" id="rm" style="position:relative;height:100%;min-height:290px"><canvas></canvas></div></div></div>
      <div class="card mt"><div class="card-h"><div><h3>Top of the queue</h3><div class="sub">Assignment is automatic and logged. Officers cannot hand-pick cases.</div></div><div class="sp"></div><button class="btn primary" id="assign">${icon('route')}Assign to field teams</button></div><div style="overflow:auto"><table class="t"><thead><tr><th>#</th><th>Building</th><th>Area</th><th>Status</th><th class="r">Gap / year</th><th class="r">Chance</th><th class="r">Hours</th><th class="r">Tk per hour</th><th class="r">Rules-only rank</th></tr></thead><tbody id="tb"></tbody></table></div></div>`;
      const calc = () => {
        const hrs = cap * WEEKS; const A = pickByHours(TS.byPriority, hrs), Rr = pickByHours(TS.byRules, hrs);
        const ra = A.out.reduce((s, b) => s + realised(b), 0), rr = Rr.out.reduce((s, b) => s + realised(b), 0);
        const hitA = A.out.filter((b) => b.violation).length / A.out.length, hitR = Rr.out.filter((b) => b.violation).length / Rr.out.length;
        const cards = [['Cases the team can handle', fmt(A.out.length), 'in ' + fmt(A.h) + ' officer hours', ''], ['Hit rate, AI ranking', pct(hitA), 'rules-only: ' + pct(hitR), 'up'], ['Extra tax, AI ranking', tk(ra), 'rules-only: ' + tk(rr), 'up'], ['Per notice sent', tk(ra / A.out.length), 'rules-only: ' + tk(rr / Rr.out.length), 'up']];
        $('#tk').innerHTML = cards.map((c) => '<div class="card kpi reg"><div class="lab">' + c[0] + '</div><div class="num">' + c[1] + '</div><div class="delta ' + c[3] + '">' + c[2] + '</div></div>').join('');
        // gains
        const curve = (list) => { let c = 0; const pts = [[0, 0]]; list.slice(0, 600).forEach((b, i) => { c += realised(b); if ((i + 1) % 20 === 0) pts.push([i + 1, c / 1e7]); }); return pts; };
        const rnd = [[0, 0], [600, TS.buildings.reduce((s, b) => s + realised(b), 0) / TS.total * 600 / 1e7]];
        $('#gain').innerHTML = lineChart({ w: 640, h: 230, series: [{ color: css('--ink-3'), pts: rnd, dash: '2 4' }, { color: css('--ink-2'), pts: curve(TS.byRules), dash: '5 4', width: 1.8 }, { color: css('--brand'), pts: curve(TS.byPriority), area: true, width: 2.4 }], yFmt: (v) => +v.toFixed(1), xFmt: (v) => v, xTicks: [0, 100, 200, 300, 400, 500, 600] }) + '<div class="row-flex note" style="gap:16px"><span><i class="sw" style="background:var(--brand)"></i> TaxSight AI</span><span><i class="sw" style="background:var(--ink-2)"></i> Rules-only</span><span><i class="sw" style="background:var(--ink-3)"></i> Random</span><span class="sp"></span><span>x: cases visited · y: Tk crore recovered per year</span></div>';
      };
      calc(); $('#cap').addEventListener('input', (e) => { cap = +e.target.value; $('#capv').textContent = cap; calc(); });
      const top = TS.byPriority.slice(0, 12);
      $('#tb').innerHTML = top.map((b) => '<tr class="row" data-i="' + b.idx + '"><td class="b">' + b.rankAI + '</td><td>' + b.id + (b === TS.hero ? ' <span class="tag brand">demo</span>' : '') + '</td><td>' + b.area + '</td><td>' + st(b.status) + '</td><td class="r b">' + tk(b.gapAnnual) + '</td><td class="r">' + pct(b.pSuccess) + '</td><td class="r">' + b.hours.toFixed(0) + '</td><td class="r">' + tk(b.priority) + '</td><td class="r muted">#' + fmt(b.rankRules) + '</td></tr>').join('');
      $('#tb').addEventListener('click', (e) => { const r = e.target.closest('tr'); if (!r) return; pickB(TS.buildings[+r.dataset.i]); go('p360'); });
      // route
      map = new CityMap($('#rm canvas')); map.c.style.pointerEvents = 'none'; map.cam.tilt = 0.6;
      const chain = [top[0]]; const pool = TS.byPriority.slice(0, 60).filter((b) => b !== top[0]);
      while (chain.length < 12 && pool.length) { const last = chain[chain.length - 1]; pool.sort((a, c) => Math.hypot(a.x - last.x, a.y - last.y) - Math.hypot(c.x - last.x, c.y - last.y)); chain.push(pool.shift()); }
      map.set({ route: chain }); const xs = chain.map((b) => b.x), ys = chain.map((b) => b.y); const bw = Math.max(...xs) - Math.min(...xs) + 160, bh = Math.max(...ys) - Math.min(...ys) + 160;
      map.cam.cx = (Math.max(...xs) + Math.min(...xs)) / 2; map.cam.cy = (Math.max(...ys) + Math.min(...ys)) / 2; map.cam.zoom = Math.min(map.w / bw, map.h / (bh * 0.9)) * 0.9; map.dirty = true;
      const offT = on('theme', () => map.themeChanged());
      $('#assign').addEventListener('click', () => { audit('System (auto-assign)', 'Assigned 12 cases to Field Team B by rule: priority, then geography'); toast('12 cases assigned by rule. Logged to the audit trail.'); });
      return { destroy() { map && map.destroy(); } };
    }
  });

  // ===================================================================== ASK THE DATA
  const BN = { '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9 };
  const toAscii = (s) => s.replace(/[০-৯]/g, (d) => BN[d]);
  function parse(q) {
    const t = toAscii(q.toLowerCase()); const f = { n: 20, area: null, status: null, rent: null, entity: 'buildings', floors: null, tariff: false, added: false };
    if (/owner|মালিক/.test(t)) f.entity = 'owners';
    const mn = t.match(/(?:top|first|শীর্ষ|সর্বোচ্চ|biggest)?\s*(\d{1,3})\s*(?:টি|টা)?\s*(?:undeclared|under|buildings?|owners?|ভবন|মালিক|ঘোষণা|অঘোষিত|অঘোষ)/) || t.match(/(?:top|first|শীর্ষ)\s*(\d{1,3})/);
    if (mn) f.n = Math.min(100, +mn[1]);
    if (/adabor|আদাবর/.test(t)) f.area = 'Adabor'; else if (/rayer|রায়ের/.test(t)) f.area = 'Rayer Bazar'; else if (/basila|বসিলা/.test(t)) f.area = 'Basila';
    if (/undeclared|ঘোষণাবিহীন|অঘোষিত/.test(t)) f.status = 2; else if (/under-?\s?declared|কম ঘোষিত/.test(t)) f.status = 1;
    const mr = t.match(/rent[^\d]*(?:above|over|more than|>)\s*tk\.?\s*([\d.]+)\s*(lakh|crore)?/) || t.match(/ভাড়া[^\d]*([\d.]+)\s*(লাখ|কোটি)/);
    if (mr) f.rent = +mr[1] * (/crore|কোটি/.test(mr[2] || '') ? 1e7 : 1e5);
    const mf = t.match(/(?:more than|over|above)\s*(\d+)\s*floors?/); if (mf) f.floors = +mf[1];
    if (/tariff|gas/.test(t)) f.tariff = true; if (/new floors|added floors|extra floors/.test(t)) f.added = true;
    return f;
  }
  function run(f) {
    let L = TS.buildings;
    if (f.area) L = L.filter((b) => b.area === f.area); if (f.status != null) L = L.filter((b) => b.status === f.status);
    if (f.rent) L = L.filter((b) => b.rentEst > f.rent); if (f.floors) L = L.filter((b) => b.floors > f.floors);
    if (f.tariff) L = L.filter((b) => b.tariffMismatch); if (f.added) L = L.filter((b) => b.addedFloors > 0);
    if (f.entity === 'owners') {
      const g = new Map(); L = TS.buildings.filter((b) => !f.area || b.area === f.area);
      L.forEach((b) => { const k = b.cluster ? 'c' + b.cluster.id : 'o' + b.owner.id; const e = g.get(k) || { name: b.cluster ? b.cluster.head.name : b.owner.name, n: 0, gap: 0, b: [], names: b.cluster ? b.cluster.names : 1 }; e.n++; e.gap += b.gapAnnual; e.b.push(b); g.set(k, e); });
      return { owners: [...g.values()].sort((a, c) => c.gap - a.gap).slice(0, f.n), total: g.size };
    }
    L = L.slice().sort((a, c) => c.gapAnnual - a.gapAnnual); return { rows: L.slice(0, f.n), total: L.length };
  }
  const sql = (f) => {
    if (f.entity === 'owners') return 'SELECT owner_name, COUNT(*) AS buildings, SUM(tax_gap_annual) AS gap\nFROM gold.building_risk JOIN gold.owner_graph USING (owner_key)\n' + (f.area ? "WHERE area = '" + f.area + "'\n" : '') + 'GROUP BY owner_key ORDER BY gap DESC LIMIT ' + f.n + ';';
    const w = []; if (f.status != null) w.push("status = '" + TX.STATUS[f.status] + "'"); if (f.area) w.push("area = '" + f.area + "'"); if (f.rent) w.push('ai_rent_month > ' + f.rent); if (f.floors) w.push('floors_built > ' + f.floors); if (f.tariff) w.push("gas_tariff = 'Residential' AND shop_count > 0"); if (f.added) w.push('floors_added_since_2019 > 0');
    return 'SELECT building_id, area, status, floors_built, ai_rent_month, tax_gap_annual\nFROM gold.building_risk\n' + (w.length ? 'WHERE ' + w.join('\n  AND ') + '\n' : '') + 'ORDER BY tax_gap_annual DESC LIMIT ' + f.n + ';';
  };

  reg('ask', {
    title: 'Ask the Data', crumb: 'Bangla and English copilot over the lakehouse',
    render(el) {
      const chips = ['Show me the top 20 undeclared buildings in Adabor with rent above Tk 2 lakh', 'Which 50 owners in Zone 10 have the biggest rent gap?', 'আদাবরে শীর্ষ ১০টি ঘোষণাবিহীন ভবন দেখাও', 'Buildings with more than 8 floors on a residential gas tariff'];
      el.innerHTML = `<div style="max-width:880px;margin:0 auto"><div class="chat" id="chat"></div>
        <div class="card mt" style="position:sticky;bottom:0"><div class="row-flex wrap" style="gap:6px;margin-bottom:10px">${chips.map((c) => '<button class="chip" data-q="' + c.replace(/"/g, '&quot;') + '">' + c + '</button>').join('')}</div>
        <form class="row-flex" id="f"><input class="inp" id="q" placeholder="Ask in Bangla or English. For example: top 10 undeclared buildings in Basila" autocomplete="off" aria-label="Ask the data"><button class="btn primary" type="submit">${icon('send')}Ask</button></form></div></div>`;
      const chat = $('#chat');
      const add = (cls, html) => { const d = document.createElement('div'); d.className = 'msg ' + cls; d.innerHTML = html; chat.appendChild(d); if (window.gsap) gsap.from(d, { opacity: 0, y: 10, duration: 0.35 }); d.scrollIntoView({ block: 'end', behavior: 'smooth' }); return d; };
      add('a', 'I can answer questions about every building, owner and business in Zone 10. I translate your question into SQL, run it on the lakehouse and show the result with a map. Try one of the examples below.');
      const ask = (q) => {
        if (!q.trim()) return; add('u', q.replace(/</g, '&lt;')); const f = parse(q); const r = run(f);
        const d = add('a', '<div class="note">Working on it…</div>');
        setTimeout(() => {
          let out;
          if (f.entity === 'owners') {
            const gap = r.owners.reduce((s, o) => s + o.gap, 0);
            out = '<div>Top <b>' + r.owners.length + '</b> owners by annual tax gap' + (f.area ? ' in ' + f.area : ' in Zone 10') + '. Together: <b>' + tk(gap) + '</b> per year.</div><pre class="code">' + sql(f) + '</pre>' +
              '<div style="max-height:300px;overflow:auto"><table class="t"><thead><tr><th>#</th><th>Owner</th><th class="r">Buildings</th><th class="r">Names used</th><th class="r">Gap / year</th></tr></thead><tbody>' + r.owners.map((o, i) => '<tr><td>' + (i + 1) + '</td><td>' + o.name + '</td><td class="r">' + o.n + '</td><td class="r">' + o.names + '</td><td class="r b">' + tk(o.gap) + '</td></tr>').join('') + '</tbody></table></div><div class="row-flex mt-s"><button class="btn sm" data-map="owners">' + icon('map') + 'Show on map</button><span class="note">Grouped by linked family and company names. Personal data not shown.</span></div>';
            d.innerHTML = out; d._rows = r.owners.flatMap((o) => o.b.slice(0, 1));
          } else {
            const gap = r.rows.reduce((s, b) => s + b.gapAnnual, 0);
            const parts = [f.n > 0 ? 'top ' + r.rows.length : '', f.status != null ? TX.STATUS[f.status].toLowerCase() : '', 'buildings', f.area ? 'in ' + f.area : 'in Zone 10', f.rent ? 'with AI rent above ' + tk(f.rent, 0) : '', f.floors ? 'above ' + f.floors + ' floors' : '', f.tariff ? 'on a residential gas tariff' : ''].filter(Boolean).join(' ');
            out = '<div>' + (r.rows.length ? 'Found <b>' + fmt(r.total) + '</b> matches. Showing ' + parts + '. Combined annual gap: <b>' + tk(gap) + '</b>.' : 'No buildings match. Try removing a filter.') + '</div><pre class="code">' + sql(f) + '</pre>' +
              (r.rows.length ? '<div style="max-height:300px;overflow:auto"><table class="t"><thead><tr><th>#</th><th>Building</th><th>Area</th><th>Status</th><th class="r">Floors</th><th class="r">AI rent / mo</th><th class="r">Gap / year</th></tr></thead><tbody>' + r.rows.map((b, i) => '<tr class="row" data-i="' + b.idx + '"><td>' + (i + 1) + '</td><td>' + b.id + '</td><td>' + b.area + '</td><td>' + st(b.status) + '</td><td class="r">' + b.floors + '</td><td class="r">' + tk(b.rentEst) + '</td><td class="r b">' + tk(b.gapAnnual) + '</td></tr>').join('') + '</tbody></table></div><div class="row-flex mt-s"><button class="btn sm primary" data-map="rows">' + icon('map') + 'Show on map</button><span class="note">Click a row to open Property 360.</span></div>' : '');
            d.innerHTML = out; d._rows = r.rows;
          }
          if (window.gsap) gsap.from(d.children, { opacity: 0, y: 6, duration: 0.35, stagger: 0.08 });
          audit('Zone Commissioner', 'Ask the Data: "' + q.slice(0, 60) + '"'); d.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }, 550);
      };
      el.addEventListener('click', (e) => {
        const c = e.target.closest('[data-q]'); if (c) { ask(c.dataset.q); return; }
        const m = e.target.closest('[data-map]'); if (m) { const msg = m.closest('.msg'); S.hl = msg._rows; go('map'); return; }
        const r = e.target.closest('tr.row'); if (r) { pickB(TS.buildings[+r.dataset.i]); go('p360'); }
      });
      $('#f').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#q').value; $('#q').value = ''; ask(v); });
    }
  });
})();
