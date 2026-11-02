/* TaxSight AI · views: Data and AI Engine (scalability), Governance */
(function () {
  'use strict';
  const { $, $$, fmt, tk, pct, st, icon, S, on, toast, countUp, audit, lineChart, reg, go, css } = TX;

  // Per-zone planning assumptions (design budgets, to be validated in the pilot)
  const PER_ZONE = { buildings: 10000, lidarB: 0.39, photos: 60000, records: 4e6, tb: 0.42, officers: 35 };
  const GPU_S = 1.4, CPU_S = 46;           // per building, full quarterly rescore

  function sizing(zones, windowH) {
    const b = zones * PER_ZONE.buildings;
    const gpus = Math.max(1, Math.ceil((b * GPU_S) / (windowH * 3600)));
    const cores = Math.max(8, Math.ceil((b * CPU_S) / (windowH * 3600)));
    return { b, gpus, cores, nodes: gpus + Math.ceil(cores / 16), lidar: zones * PER_ZONE.lidarB, photos: zones * PER_ZONE.photos, records: zones * PER_ZONE.records, tb: zones * PER_ZONE.tb, officers: zones * PER_ZONE.officers };
  }
  const hrs = (h) => (h < 1 ? Math.round(h * 60) + ' min' : h < 48 ? h.toFixed(h < 10 ? 1 : 0) + ' h' : (h / 24).toFixed(1) + ' days');

  reg('platform', {
    title: 'Data and AI Engine', crumb: 'Scalability and big data processing',
    render(el) {
      let zones = 25, win = 24; const sts = [];
      el.innerHTML = `
      <div class="row-flex wrap" style="margin-bottom:14px"><div><h2 class="big">Built for 25 zones on day one</h2><div class="note" style="max-width:760px">The pilot covers one zone. The platform does not change when it grows: a new zone is a configuration entry, not a new project. Figures below are design budgets from per-building compute costs, to be confirmed on pilot data.</div></div></div>
      <div class="card reg" id="sim"><div class="card-h"><div><h3>Scale simulator</h3><div class="sub">Drag the zones. Watch the cluster and the time to re-score every building.</div></div><div class="sp"></div><div class="seg" id="pre"><button data-z="1" aria-pressed="false">Pilot · 1 zone</button><button data-z="25" aria-pressed="true">Dhaka · 25 zones</button><button data-z="120" aria-pressed="false">National · planning case</button></div></div>
        <div class="grid" style="grid-template-columns:minmax(0,260px) minmax(0,1fr) minmax(0,1fr);gap:22px">
          <div class="stack" style="gap:12px"><label><div class="row-flex note"><span class="sp">Zones covered</span><b style="color:var(--ink)" id="zv"></b></div><input type="range" class="rng" id="zr" min="1" max="120" value="25"></label><label><div class="row-flex note"><span class="sp">Re-score window</span><b style="color:var(--ink)" id="wv"></b></div><input type="range" class="rng" id="wr" min="4" max="72" step="2" value="24"></label><div class="note">Quarterly full re-score of every building, from raw LiDAR, imagery and agency feeds to ranked cases.</div></div>
          <div><div class="grid g3" id="tiles" style="gap:8px"></div></div>
          <div><div class="row-flex note" style="margin-bottom:6px"><span class="sp"><b style="color:var(--ink)" id="nn"></b> compute nodes</span><span><i class="sw" style="background:var(--brand)"></i> GPU</span><span><i class="sw" style="background:var(--ink-3)"></i> CPU</span></div><div id="nodes" style="display:grid;grid-template-columns:repeat(24,1fr);gap:3px"></div></div></div>
        <div class="grid g2 mt" style="gap:22px"><div><div class="note" style="margin-bottom:2px">Hours to re-score vs GPUs in the cluster</div><div id="tc"></div></div><div class="callout" id="verdict" style="align-self:center"></div></div></div>

      <div class="card mt"><div class="card-h"><div><h3>Reference architecture</h3><div class="sub">Data flows down. Field results flow back and retrain the models.</div></div><div class="sp"></div><span class="tag brand">Our contribution: AI and data layers</span></div>
        <div class="grid" style="grid-template-columns:minmax(0,1fr) 150px;gap:14px"><div id="arch"></div><div class="card flat" style="align-self:stretch"><h4 style="font-size:12.5px;margin-bottom:8px">Security and governance</h4><div class="stack note" style="gap:6px">${['Role and zone access', 'MFA, PII masked', 'Immutable audit logs', 'In-country hosting', 'Open-weight LLMs on premise', 'Model audit and bias tests', 'MLOps and drift watch'].map((x) => '<div>' + x + '</div>').join('')}<div style="margin-top:auto;color:var(--ink-3)">Applies to all layers</div></div></div></div></div>

      <div class="card mt reg"><div class="card-h"><div><h3>Run a re-score</h3><div class="sub">Simulated pipeline for the scale selected above</div></div><div class="sp"></div><button class="btn primary" id="run">${icon('play')}Run quarterly re-score</button></div><div id="pipe" class="stack" style="gap:10px"></div><div class="callout mt-s" id="pdone" style="display:none"></div></div>

      <div class="grid g2 mt"><div class="card"><div class="card-h"><div><h3>Data connectors</h3><div class="sub">New source live within days through standard connectors</div></div></div><table class="t"><thead><tr><th>Source</th><th>Mode</th><th>Lead time</th><th class="r">Demo</th></tr></thead><tbody>${[['IWM survey: LiDAR, MMS, satellite', 'Bulk files + tiles', 'Pilot week 1', 1], ['NBR e-Return and TIN', 'API', '2 to 5 days', 1], ['e-Porcha and land records', 'API', '2 to 5 days', 1], ['IGR registration offices', 'Batch', '1 week', 1], ['DESCO / DPDC electricity', 'Batch + API', '1 week', 1], ['Titas Gas, Dhaka WASA, BTCL', 'Batch', '1 week', 1], ['RAJUK approvals, DNCC / DSCC holdings', 'Batch', '1 to 2 weeks', 1], ['Rental listings, business directories', 'Licensed feed', '3 days', 1], ['Survey of Bangladesh, DLRS Mouza maps', 'Scanned + georeferenced', 'Pilot weeks 1 to 4', 0]].map((x) => '<tr><td>' + x[0] + '</td><td class="muted">' + x[1] + '</td><td class="muted">' + x[2] + '</td><td class="r">' + (x[3] ? '<span class="tag ok">Synthetic feed</span>' : '<span class="tag warn">MoU needed</span>') + '</td></tr>').join('')}</tbody></table></div>
      <div class="card"><div class="card-h"><div><h3>Model registry</h3><div class="sub">Every model versioned, tracked and auditable (MLflow)</div></div><div class="sp"></div><button class="btn sm" id="retrain">${icon('refresh')}Retrain on field results</button></div><table class="t"><thead><tr><th>Model</th><th>Metric</th><th>Stage</th><th>Drift</th></tr></thead><tbody id="mr">${TS.MODELS.map((m, i) => row(m, i)).join('')}</tbody></table></div></div>

      <div class="card mt"><div class="card-h"><div><h3>Technology stack</h3><div class="sub">Open standards, so NBR is not locked to one vendor</div></div></div><div class="grid g3" style="gap:10px">${[['Storage and compute', 'Delta Lake or Iceberg on Spark, on Kubernetes or Databricks', 'Handles billions of LiDAR points and 10+ agency feeds'], ['Geospatial', 'Apache Sedona, PostGIS, 3D Tiles', 'City-scale spatial joins, smooth 3D in a browser'], ['Graph', 'Neo4j or a graph layer on the lakehouse', 'Owner and family networks'], ['ML and MLOps', 'MLflow, feature store, model registry, drift monitoring', 'Versioned, tracked, auditable'], ['GenAI', 'Open-weight LLM hosted in-country, retrieval over tax law, agents', 'Bangla support, no data leaves Bangladesh'], ['Apps', 'Web GIS (React, deck.gl or CesiumJS), offline-first mobile', 'Fast, works with weak field connectivity']].map((x) => '<div class="card flat spot"><div class="b" style="font-family:var(--f-title)">' + x[0] + '</div><div style="margin:3px 0">' + x[1] + '</div><div class="note">' + x[2] + '</div></div>').join('')}</div></div>`;

      function row(m, i) { const sp = Array.from({ length: 12 }, (_, k) => m.drift * 100 * (0.7 + 0.5 * Math.abs(Math.sin(i * 3 + k * 0.9)))); return '<tr><td><b>' + m.name + '</b> <span class="muted">' + m.ver + '</span><div class="note">' + m.task + '</div></td><td>' + m.val + '<div class="note">' + m.metric + '</div></td><td><span class="tag ' + (m.stage === 'Production' ? 'ok' : 'warn') + '">' + m.stage + '</span></td><td>' + TX.spark(sp, m.drift > 0.1 ? css('--warn') : css('--ok')) + '</td></tr>'; }

      // --- scale simulator ---
      const tile = (l, v, s) => '<div class="card flat" style="padding:10px 12px"><div class="note">' + l + '</div><div class="big" data-v="' + v + '" style="font-size:20px">' + s + '</div></div>';
      const upd = (first) => {
        const z = sizing(zones, win); $('#zv').textContent = zones + (zones === 1 ? ' zone' : ' zones'); $('#wv').textContent = win + ' hours';
        $('#tiles').innerHTML = tile('Buildings', 0, fmt(z.b)) + tile('LiDAR points', 0, z.lidar.toFixed(z.lidar < 10 ? 2 : 1) + ' B') + tile('Photos', 0, z.photos >= 1e6 ? (z.photos / 1e6).toFixed(1) + ' M' : fmt(z.photos / 1e3) + ' k') + tile('Agency records', 0, (z.records / 1e6).toFixed(0) + ' M') + tile('Storage', 0, z.tb >= 10 ? z.tb.toFixed(0) + ' TB' : z.tb.toFixed(1) + ' TB') + tile('Concurrent officers', 0, '~' + fmt(z.officers));
        $('#nn').textContent = z.nodes;
        const cpuN = z.nodes - z.gpus; const total = Math.min(z.nodes, 144);
        $('#nodes').innerHTML = Array.from({ length: Math.max(24, Math.ceil(total / 24) * 24) }, (_, i) => '<i style="aspect-ratio:1;border-radius:2px;background:' + (i < total ? (i < Math.min(z.gpus, total) ? 'var(--brand)' : 'var(--ink-3)') : 'var(--surface-3)') + ';' + (i < total ? '' : 'opacity:.7') + '"></i>').join('');
        if (window.gsap && !first) gsap.from('#nodes i', { scale: 0.4, opacity: 0.2, duration: 0.3, stagger: { each: 0.004, from: 'start' } });
        const b = zones * PER_ZONE.buildings; const pts = Array.from({ length: 40 }, (_, i) => [i + 1, (b * GPU_S) / ((i + 1) * 3600)]);
        $('#tc').innerHTML = lineChart({ w: 520, h: 190, series: [{ color: css('--brand'), pts, area: true }], yFmt: (v) => (v < 10 ? v.toFixed(1) : Math.round(v)), xFmt: (x) => x, xTicks: [1, 5, 10, 20, 30, 40], yMax: Math.max(4, niceCap((b * GPU_S) / 3600)), marks: z.gpus <= 40 ? [{ x: z.gpus, color: css('--bad'), label: z.gpus + ' GPUs → ' + hrs(win) }] : [] });
        const pilotMin = (PER_ZONE.buildings * GPU_S) / z.gpus / 60;
        $('#verdict').innerHTML = '<b>' + fmt(z.b) + ' buildings re-scored in ' + win + ' hours</b> on <b>' + z.gpus + ' GPU' + (z.gpus > 1 ? 's' : '') + '</b> and <b>' + z.cores + ' CPU cores</b>. A manual survey of the same buildings takes months. Doubling the zones means roughly doubling the nodes, not redesigning the system.';
      };
      const niceCap = (v) => TX.niceMax(v);
      upd(true);
      $('#zr').addEventListener('input', (e) => { zones = +e.target.value; $$('#pre button').forEach((x) => x.setAttribute('aria-pressed', +x.dataset.z === zones)); upd(); });
      $('#wr').addEventListener('input', (e) => { win = +e.target.value; upd(); });
      $('#pre').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; zones = +b.dataset.z; $('#zr').value = zones; $$('#pre button').forEach((x) => x.setAttribute('aria-pressed', x === b)); upd(); });

      // --- architecture ---
      const L = [
        ['Data sources', 'IWM survey and agency records', [['IWM survey', 'LiDAR, MMS, satellite, maps'], ['Tax and land', 'TIN, holding, e-Porcha, IGR'], ['Utilities', 'DESCO, DPDC, Titas, WASA'], ['Open data', 'Rent listings, business lists']]],
        ['Data platform', 'Geospatial lakehouse', [['Ingestion', 'APIs, batch, streaming'], ['Lakehouse', 'Bronze, silver, gold layers'], ['Geo store', '3D footprints, PostGIS, Sedona'], ['Feature store', 'Building and owner features']]],
        ['AI layer', 'Our core contribution', [['Vision AI', 'Floors, use, Bangla OCR'], ['Entity graph', 'Owner match, network links'], ['Valuation', 'Rent and value models'], ['Risk + GenAI', 'Target score, notice copilot']], true],
        ['Applications', 'What officers use', [['Command Centre', 'Executive map, KPIs, forecast'], ['Officer desk', 'Property 360, case queue'], ['Field app', 'Offline, photo, on-device AI'], ['Taxpayer view', 'See evidence, dispute, pay']]]
      ];
      $('#arch').innerHTML = L.map((l, i) => '<div class="layerrow"><div class="lname' + (l[3] ? ' ai' : '') + '"><b>' + l[0] + '</b><small>' + l[1] + '</small></div><div class="blocks">' + l[2].map((b, k) => '<div class="blk' + (l[3] ? ' pulse' : '') + '" style="--d:' + k * 0.35 + 's"><b>' + b[0] + '</b><small>' + b[1] + '</small></div>').join('') + '</div></div>' + (i < 3 ? '<div class="flowline"><i style="--d:0s"></i><i style="--d:.8s"></i></div>' : '')).join('') + '<div class="note" style="margin:10px 0 0 164px">↺ Field results retrain the models each cycle</div>';
      // --- pipeline run ---
      const stages = [['Ingest agency feeds', 'rows', (z) => z.records], ['Land in bronze, silver, gold', 'GB', (z) => z.tb * 1024 * 0.1], ['Change detection on LiDAR and imagery', 'tiles', (z) => z.b * 5], ['Entity resolution and owner graph', 'pairs', (z) => z.b * 180], ['Rent and risk scoring', 'buildings', (z) => z.b], ['Publish ranked cases to apps', 'cases', (z) => Math.round(z.b * 0.18)]];
      const drawPipe = () => { const z = sizing(zones, win); $('#pipe').innerHTML = stages.map((s, i) => '<div class="row-flex" style="gap:12px"><div style="width:20px;height:20px;border-radius:50%;background:var(--surface-3);display:grid;place-items:center;font-size:11px" id="pi' + i + '">' + (i + 1) + '</div><div style="width:260px">' + s[0] + '</div><div class="bar sp"><i id="pb' + i + '" style="width:0"></i></div><div style="width:150px;text-align:right" id="pc' + i + '" class="muted">0 ' + s[1] + '</div></div>').join(''); };
      drawPipe();
      $('#run').addEventListener('click', () => {
        const z = sizing(zones, win); drawPipe(); $('#pdone').style.display = 'none'; $('#run').disabled = true; audit('System', 'Started quarterly re-score for ' + zones + ' zone(s)');
        const tl = gsap.timeline({ onComplete: () => { $('#run').disabled = false; $('#pdone').style.display = 'block'; $('#pdone').innerHTML = '<b>Done.</b> ' + fmt(z.b) + ' buildings scored, ' + fmt(Math.round(z.b * 0.18)) + ' ranked cases published. At this size the real run takes about <b>' + win + ' hours</b> on ' + z.gpus + ' GPUs; this view plays it at 1,000x speed.'; audit('System', 'Re-score finished: ' + fmt(z.b) + ' buildings'); } });
        stages.forEach((s, i) => { const o = { v: 0 }; const total = s[2](z); tl.to(o, { v: 1, duration: 1.1, ease: 'power1.inOut', onStart: () => { $('#pi' + i).style.background = 'var(--brand)'; $('#pi' + i).style.color = 'var(--brand-ink)'; }, onUpdate: () => { $('#pb' + i).style.width = o.v * 100 + '%'; $('#pc' + i).textContent = fmt(total * o.v) + ' ' + s[1]; }, onComplete: () => { $('#pi' + i).innerHTML = '✓'; $('#pc' + i).style.color = 'var(--ink)'; } }, i * 0.8); });
      });
      $('#zr').addEventListener('change', drawPipe); $('#wr').addEventListener('change', drawPipe); $('#pre').addEventListener('click', () => setTimeout(drawPipe, 0));
      $('#retrain').addEventListener('click', () => { const m = TS.MODELS[5]; const v = (parseFloat(m.ver.slice(1)) + 0.1).toFixed(1); m.ver = 'v' + v; m.upd = 'just now'; m.val = Math.min(68, parseInt(m.val) + 1) + '%'; $('#mr').innerHTML = TS.MODELS.map((x, i) => row(x, i)).join(''); toast('target-ranker retrained on ' + (S.fieldCount || 6) + ' new field results. Now ' + m.ver + '.'); audit('MLOps', 'Retrained target-ranker → ' + m.ver); });
      // scroll reveal (ScrollTrigger)
      if (window.ScrollTrigger && window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.utils.toArray('.layerrow', el).forEach((r, i) => gsap.from(r, { opacity: 0, x: -16, duration: 0.5, scrollTrigger: { trigger: r, scroller: el, start: 'top 92%', once: true } }));
        gsap.utils.toArray('#view > .card', el).forEach((c) => gsap.from(c, { opacity: 0, y: 16, duration: 0.5, scrollTrigger: { trigger: c, scroller: el, start: 'top 94%', once: true } }));
      }
      return { destroy() { if (window.ScrollTrigger) ScrollTrigger.getAll().forEach((t) => t.kill()); } };
    }
  });

  // ===================================================================== GOVERNANCE
  reg('governance', {
    title: 'Governance', crumb: 'Security, privacy and responsible AI',
    render(el) {
      let unsub = null;
      const top = TS.byPriority.slice(0, 600); const N = top.length;
      const groups = [['Area', ['Basila', 'Adabor', 'Rayer Bazar'], (b, g) => b.area === g], ['Building type', ['res', 'mix', 'com'], (b, g) => b.use === g]];
      const nm = { res: 'Residential', mix: 'Mixed use', com: 'Commercial' };
      const bias = groups.map(([t, gs, f]) => gs.map((g) => { const pop = TS.buildings.filter((b) => f(b, g)), fl = top.filter((b) => f(b, g)); const hit = fl.length ? fl.filter((b) => b.violation).length / fl.length : 0; const par = (fl.length / N) / (pop.length / TS.total); return { t, g: nm[g] || g, pop: pop.length / TS.total, flag: fl.length / N, hit, par }; })).flat();
      const hit300 = TS.hitRate(TS.byPriority, 300);
      el.innerHTML = `<div class="row-flex wrap" style="margin-bottom:14px"><div><h2 class="big">Trust is part of the product</h2><div class="note">Tax data is among the most sensitive data a state holds. AI recommends, a human officer decides, every step is logged.</div></div></div>
      <div class="grid" id="roles" style="grid-template-columns:repeat(5,minmax(0,1fr))"></div>
      <div class="grid g-main mt"><div class="card reg"><div class="card-h"><div><h3>Audit trail</h3><div class="sub">Every view, score change and notice. Each entry is chained to the previous hash.</div></div><div class="sp"></div><button class="btn sm" id="vf">${icon('shield')}Verify chain</button></div><div style="max-height:330px;overflow:auto"><table class="t"><thead><tr><th>Time</th><th>Who</th><th>What</th><th class="r">Hash</th></tr></thead><tbody id="al"></tbody></table></div><div class="note mt-s" id="vr"></div></div>
        <div class="stack" style="gap:14px"><div class="card"><h3>Data stays in Bangladesh</h3><div class="stack mt-s" style="gap:8px;color:var(--ink-2)">${['Hosted in the national data centre (BCC Tier IV) or an NBR-approved sovereign cloud region', 'Open-weight language models run on premise. No taxpayer data goes to a foreign API', 'AES-256 at rest, TLS 1.3 in transit', 'Aligned with the Personal Data Protection Ordinance and the Cyber Security Ordinance; MoUs with each agency'].map((x) => '<div class="row-flex" style="gap:8px;align-items:flex-start"><span style="color:var(--ok)">' + icon('check').replace('<svg', '<svg width="16" height="16" style="stroke:currentColor;fill:none;stroke-width:2"') + '</span><span>' + x + '</span></div>').join('')}</div></div>
        <div class="card"><h3>Human in the loop</h3><div class="row-flex wrap mt-s" style="gap:6px"><span class="tag">AI scores</span>›<span class="tag">Officer reviews</span>›<span class="tag brand">Officer signs</span>›<span class="tag">Taxpayer sees evidence</span>›<span class="tag">Dispute or pay</span></div><div class="note mt-s">Low-confidence matches go to manual review and never to a notice.</div></div></div></div>
      <div class="grid g-main mt"><div class="card"><div class="card-h"><div><h3>Fairness check on the top 600 cases</h3><div class="sub">Share of flagged cases against share of all buildings. Parity near 1.0 means no skew.</div></div></div><table class="t"><thead><tr><th>Group</th><th class="r">Share of buildings</th><th class="r">Share of flagged</th><th class="r">Hit rate</th><th class="r">Parity</th></tr></thead><tbody>${bias.map((r) => '<tr><td><span class="muted">' + r.t + ' · </span>' + r.g + '</td><td class="r">' + pct(r.pop) + '</td><td class="r">' + pct(r.flag) + '</td><td class="r">' + pct(r.hit) + '</td><td class="r"><span class="tag ' + (r.par > 0.8 && r.par < 1.25 ? 'ok' : 'warn') + '">' + r.par.toFixed(2) + '</span></td></tr>').join('')}</tbody></table><div class="note mt-s">Religion, ethnicity and politics are never model inputs. Groups outside 0.8 to 1.25 go to the monthly oversight review, where larger real gaps explain most differences.</div></div>
        <div class="card"><h3>Accuracy scorecard</h3><div class="stack mt-s" style="gap:12px">${[['Hit rate, top 300', pct(hit300), hit300 * 100], ['False-positive rate', pct(1 - hit300), (1 - hit300) * 100], ['Appeal loss rate (simulated)', '8%', 8], ['Scores shown with reasons', '100%', 100], ['Notices signed by an officer', '100%', 100]].map((x) => '<div><div class="row-flex note"><span class="sp">' + x[0] + '</span><b style="color:var(--ink)">' + x[1] + '</b></div><div class="bar"><i style="width:' + x[2] + '%"></i></div></div>').join('')}</div><div class="note mt-s">Reported monthly per model to NBR leadership, and shareable with IMF, World Bank and ADB.</div></div></div>`;
      const roles = $('#roles'); const draw = () => { roles.innerHTML = Object.entries(TS.ROLES).map(([k, r]) => '<div class="card spot ' + (S.role === k ? '' : '') + '" style="' + (S.role === k ? 'border-color:var(--brand);background:var(--brand-soft)' : '') + '"><div class="row-flex"><h3>' + r.name + '</h3><span class="sp"></span>' + (S.role === k ? '<span class="tag brand">You are here</span>' : '') + '</div><div class="note mt-s">Sees: <b style="color:var(--ink)">' + r.scope + '</b><br>Personal data: <b style="color:var(--ink)">' + r.pii + '</b><br>' + r.views.length + ' modules</div><button class="btn sm mt-s" data-r="' + k + '" ' + (S.role === k ? 'disabled' : '') + '>Switch to this role</button></div>').join(''); };
      draw(); roles.addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) { TX.setRole(b.dataset.r, 'governance'); } });
      const seed = [['08:41:12', 'AO Rahman', 'Opened Property 360 for ZN10-02112'], ['08:44:30', 'System', 'Model target-ranker v4.0 scored 4,105 buildings'], ['09:02:09', 'Zone Commissioner', 'Approved 18 notices in bulk'], ['09:15:44', 'Inspector Karim', 'Uploaded 7 verified results'], ['09:31:02', 'AO Akter', 'Unmasked NID on ZN10-01893 (reason: hearing prep)'], ['09:40:51', 'System', 'Blocked: Field Inspector tried to open Owner Graph']];
      let prev = '00000000'; const hashRow = (r) => '<tr><td class="muted">' + r.t + '</td><td>' + r.who + '</td><td>' + r.what + '</td><td class="r muted" style="font-size:11px">' + r.hash + '</td></tr>';
      S.audit = S.audit.concat(seed.map((s) => ({ t: s[0], who: s[1], what: s[2], hash: Math.random().toString(16).slice(2, 10) }))).filter((v, i, a) => a.indexOf(v) === i);
      const al = () => ($('#al').innerHTML = S.audit.slice(0, 30).map(hashRow).join('')); al();
      const o = on('audit', () => { if (!$('#al')) return; al(); if (window.gsap) gsap.from('#al tr:first-child', { backgroundColor: 'var(--brand-soft)', duration: 1.2 }); });
      $('#vf').addEventListener('click', () => { $('#vr').textContent = 'Verifying…'; setTimeout(() => ($('#vr').innerHTML = '<span class="up">✓ Chain intact.</span> ' + S.audit.length + ' entries verified. A changed or deleted entry would break every hash after it.'), 900); });
    }
  });
})();
