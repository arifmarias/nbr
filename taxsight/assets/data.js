/* TaxSight AI · synthetic Tax Zone 10 dataset
   Deterministic generator. Every name, number and building here is synthetic.
   Used by every view of the demo so figures stay consistent across screens. */
(function (root) {
  'use strict';

  // ---------- seeded random ----------
  let seed = 20261102;
  const R = () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rnd = (a = 0, b = 1) => a + (b - a) * R();
  const ri = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = (a) => a[Math.floor(R() * a.length)];
  const chance = (p) => R() < p;
  const gauss = () => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const TAX_RATE = 0.15;              // effective rental income tax rate (concept note assumption)
  const SQM_TO_SQFT = 10.7639;

  // ---------- names (synthetic) ----------
  const FIRST = [['Rahim', 'রহিম'], ['Karim', 'করিম'], ['Jamal', 'জামাল'], ['Kamal', 'কামাল'], ['Nasir', 'নাসির'], ['Shafiq', 'শফিক'], ['Habib', 'হাবিব'], ['Anwar', 'আনোয়ার'], ['Mizanur', 'মিজানুর'], ['Faruk', 'ফারুক'], ['Delwar', 'দেলোয়ার'], ['Masud', 'মাসুদ'], ['Iqbal', 'ইকবাল'], ['Alamgir', 'আলমগীর']];
  const FIRSTF = [['Farhana', 'ফারহানা'], ['Nasrin', 'নাসরিন'], ['Shirin', 'শিরীন'], ['Rokeya', 'রোকেয়া'], ['Salma', 'সালমা'], ['Tahmina', 'তাহমিনা'], ['Sultana', 'সুলতানা'], ['Morjina', 'মরজিনা']];
  const LAST = [['Hossain', 'হোসেন'], ['Rahman', 'রহমান'], ['Chowdhury', 'চৌধুরী'], ['Ahmed', 'আহমেদ'], ['Khan', 'খান'], ['Islam', 'ইসলাম'], ['Sarker', 'সরকার'], ['Mia', 'মিয়া'], ['Uddin', 'উদ্দিন'], ['Talukder', 'তালুকদার'], ['Bhuiyan', 'ভূঁইয়া'], ['Mollah', 'মোল্লা']];
  const MID = [['Abdul', 'আবদুল'], ['Md.', 'মো.'], ['Nur', 'নূর'], ['Shah', 'শাহ']];

  const SHOPS = [
    ['আল-আমিন ফার্মেসি', 'Al-Amin Pharmacy', 'Pharmacy'], ['রহমান ট্রেডার্স', 'Rahman Traders', 'Wholesale'],
    ['সাত্তার কোচিং সেন্টার', 'Sattar Coaching Centre', 'Coaching'], ['ডায়মন্ড ডেন্টাল কেয়ার', 'Diamond Dental Care', 'Clinic'],
    ['নিউ সানরাইজ রেস্তোরাঁ', 'New Sunrise Restaurant', 'Restaurant'], ['তাজ ইলেকট্রনিক্স', 'Taj Electronics', 'Retail'],
    ['মা মনি ক্লিনিক', 'Ma Moni Clinic', 'Clinic'], ['ফাইভ স্টার ফ্যাশন', 'Five Star Fashion', 'Retail'],
    ['বসুন্ধরা বুক হাউস', 'Bashundhara Book House', 'Retail'], ['হক টেইলার্স', 'Haque Tailors', 'Service'],
    ['গ্রীন লাইফ ডায়াগনস্টিক', 'Green Life Diagnostic', 'Clinic'], ['স্মার্ট আইটি সলিউশন', 'Smart IT Solution', 'Office'],
    ['মেট্রো মোবাইল পয়েন্ট', 'Metro Mobile Point', 'Retail'], ['সোনার তরী জুয়েলার্স', 'Sonar Tori Jewellers', 'Retail'],
    ['ঢাকা স্টেশনারি', 'Dhaka Stationery', 'Retail'], ['আরিফ ফার্নিচার', 'Arif Furniture', 'Retail'],
    ['প্রগতি কনসাল্টিং', 'Progoti Consulting', 'Office'], ['লাকি বেকারি', 'Lucky Bakery', 'Restaurant'],
    ['শাপলা ডেকোরেটর্স', 'Shapla Decorators', 'Service'], ['ইউনিক বিউটি পার্লার', 'Unique Beauty Parlour', 'Service'],
    ['হেলথ প্লাস ল্যাব', 'Health Plus Lab', 'Clinic'], ['তিতাস কুরিয়ার', 'Titas Courier', 'Service']
  ];

  const personName = (female) => {
    const f = female ? pick(FIRSTF) : pick(FIRST), l = pick(LAST);
    const m = !female && chance(0.35) ? pick(MID) : null;
    return { en: (m ? m[0] + ' ' : '') + f[0] + ' ' + l[0], bn: (m ? m[1] + ' ' : '') + f[1] + ' ' + l[1], last: l };
  };

  // ---------- layout ----------
  const W = 1800, H = 1800;
  const AREAS = [{ id: 'Basila', x0: 0, x1: 600 }, { id: 'Adabor', x0: 600, x1: 1200 }, { id: 'Rayer Bazar', x0: 1200, x1: 1800 }];
  const areaAt = (x) => (x < 600 ? 'Basila' : x < 1200 ? 'Adabor' : 'Rayer Bazar');
  const BASE_RATE = { 'Adabor': 24, 'Rayer Bazar': 21, 'Basila': 19 }; // Tk / sq ft / month, residential

  // road centrelines
  const roadsX = [], roadsY = [];
  (function () {
    let x = 0, i = 0; while (x < W + 40) { roadsX.push({ p: x, w: i % 4 === 0 ? 16 : 8, art: i % 4 === 0 }); x += 150 + (i % 4 === 3 ? 0 : rnd(-6, 6)); i++; }
    let y = 0; i = 0; while (y < H + 40) { roadsY.push({ p: y, w: i % 4 === 0 ? 16 : 8, art: i % 4 === 0 }); y += 150 + rnd(-6, 6); i++; }
  })();
  const CANAL = { y0: 1010, y1: 1034 };       // water strip
  const PARKS = new Set(['3,5', '8,2', '6,9', '10,7']);

  // ---------- model ----------
  // Per-floor use pattern, drives AI rent model
  function floorUses(b, floors) {
    const u = [];
    for (let i = 0; i < floors; i++) {
      if (b.use === 'res') u.push('res');
      else if (b.use === 'mix') u.push(i < 2 ? 'com' : 'res');
      else u.push(i < 4 ? 'com' : (i < 7 ? 'off' : 'res'));
    }
    return u;
  }
  const USE_MULT = { res: 1, off: 1.55 };
  const comMult = (i) => (i === 0 ? 2.8 : i === 1 ? 1.7 : 1.35);

  /** Explainable rent model: returns estimate, range and additive contributions (Tk / month). */
  function rentModel(b, o = {}) {
    const floors = o.floors ?? b.floors, roadW = o.roadW ?? b.roadW;
    const amen = o.amen ?? b.amen, transit = o.transit ?? b.transitM;
    const occ = o.occ ?? b.occ;
    const sqft = b.areaM2 * SQM_TO_SQFT * 0.78;
    const base = BASE_RATE[b.area];
    const roadF = 1 + 0.012 * (roadW - 6);
    const amenF = 1 + 0.045 * amen;               // 0..3: lift, generator, parking
    const transitF = 1 - clamp((transit - 200) / 300, 0, 1) * 0.1;
    const uses = floorUses({ use: o.use ?? b.use }, floors);
    let raw = 0, comPart = 0;
    uses.forEach((u, i) => {
      const m = u === 'com' ? comMult(i) : (USE_MULT[u] || 1);
      const v = sqft * base * m;
      raw += v; if (u !== 'res') comPart += v - sqft * base;
    });
    const total = raw * roadF * amenF * transitF * occ * b.k;
    const unit = raw === 0 ? 0 : total / raw;
    const conf = b.conf;
    const half = (1 - conf);
    const kk = occ * b.k;
    const baseOnly = sqft * base * floors * kk;
    const contrib = [
      { k: 'Floor area and floors', v: baseOnly },
      { k: 'Commercial use on lower floors', v: (raw - sqft * base * floors) * kk },
      { k: 'Road width', v: raw * (roadF - 1) * kk },
      { k: 'Lift, generator, parking', v: raw * roadF * (amenF - 1) * kk },
      { k: 'Distance to transit', v: raw * roadF * amenF * (transitF - 1) * kk }
    ];
    return { est: total, lo: total * (1 - half), hi: total * (1 + half), conf, contrib, uses, sqft, unit };
  }

  // ---------- buildings ----------
  const buildings = [];
  let seq = 0;
  const hero = { placed: false };

  for (let by = 0; by < roadsY.length - 1; by++) {
    for (let bx = 0; bx < roadsX.length - 1; bx++) {
      const rx0 = roadsX[bx], rx1 = roadsX[bx + 1], ry0 = roadsY[by], ry1 = roadsY[by + 1];
      const x0 = rx0.p + rx0.w / 2 + 3, x1 = rx1.p - rx1.w / 2 - 3;
      const y0 = ry0.p + ry0.w / 2 + 3, y1 = ry1.p - ry1.w / 2 - 3;
      if (x1 > W || y1 > H) continue;
      if (y1 > CANAL.y0 - 14 && y0 < CANAL.y1 + 14) continue;       // canal band
      if (PARKS.has(bx + ',' + by)) continue;
      const bw = x1 - x0, bh = y1 - y0;
      const pw = rnd(15, 21), pd = rnd(19, 26);
      const nx = Math.max(1, Math.floor(bw / pw)), ny = Math.max(1, Math.floor(bh / pd));
      const cw = bw / nx, ch = bh / ny;
      const artNear = rx0.art || rx1.art || ry0.art || ry1.art;
      const roadW = Math.max(rx0.w, rx1.w, ry0.w, ry1.w) === 16 && artNear ? 16 : 8;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        if (chance(0.07)) continue;
        const onEdge = (i === 0 && rx0.art) || (i === nx - 1 && rx1.art) || (j === 0 && ry0.art) || (j === ny - 1 && ry1.art);
        const inset = rnd(1.2, 2.6);
        const w = cw - inset * 2 - rnd(0, 2.2), d = ch - inset * 2 - rnd(0, 3);
        const cx = x0 + (i + 0.5) * cw + rnd(-0.6, 0.6), cy = y0 + (j + 0.5) * ch + rnd(-0.6, 0.6);
        const rot = rnd(-0.04, 0.04);
        const co = Math.cos(rot), si = Math.sin(rot);
        const pts = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([px, py]) => [cx + px * co - py * si, cy + px * si + py * co]);
        const area = areaAt(cx);
        const use = onEdge ? (chance(0.5) ? 'mix' : chance(0.5) ? 'com' : 'res') : (chance(0.1) ? 'mix' : chance(0.03) ? 'com' : 'res');
        let floors = onEdge ? ri(5, 11) : ri(3, 7);
        if (chance(0.025)) floors = ri(11, 17);
        const b = {
          idx: buildings.length, id: 'ZN10-' + String(++seq).padStart(5, '0'),
          x: cx, y: cy, w, d, pts, area, use, floors, onEdge: !!onEdge, roadW: onEdge ? 16 : 8,
          areaM2: w * d, amen: clamp(Math.round((floors - 3) / 3 + gauss() * 0.7), 0, 3),
          transitM: Math.round(clamp(rnd(150, 1100), 120, 1500)), occ: clamp(rnd(0.82, 0.97), 0.7, 1),
          k: clamp(1 + gauss() * 0.06, 0.88, 1.15), conf: clamp(rnd(0.7, 0.95), 0.6, 0.97),
          adds: [], owner: null
        };
        // compliance status (ground truth hidden from "rules only")
        const pU = 0.13 + (onEdge ? 0.06 : 0) + (floors > 8 ? 0.04 : 0);
        const pD = 0.27 + (onEdge ? 0.1 : 0) + (floors > 6 ? 0.04 : 0);
        const r = R();
        b.status = r < pU ? 2 : r < pU + pD ? 1 : 0;          // 0 declared · 1 under-declared · 2 undeclared
        // vertical growth since 2019 (only for non-compliant mostly)
        if (b.status > 0 && chance(0.6)) { let left = Math.min(ri(1, 3), b.floors - 2); while (left > 0) { const n = Math.min(left, ri(1, 2)); b.adds.push({ yr: ri(2020, 2025), n }); left -= n; } }
        if (b.status === 0 && chance(0.05)) b.adds.push({ yr: ri(2020, 2023), n: 1 });
        b.footprintChange = b.status > 0 && chance(0.25) ? ri(8, 40) : 0;   // m² added
        buildings.push(b);
      }
    }
  }

  // ---------- featured building for the 5-minute demo ----------
  (function () {
    let best = null, bd = 1e9;
    buildings.forEach((b) => { if (b.area === 'Adabor' && b.onEdge) { const d = Math.hypot(b.x - 900, b.y - 720); if (d < bd && b.w > 15 && b.d > 18) { bd = d; best = b; } } });
    const b = best;
    b.hero = true; b.use = 'mix'; b.floors = 9; b.status = 1; b.amen = 2; b.roadW = 16; b.transitM = 260; b.occ = 0.95; b.k = 1; b.conf = 0.87;
    b.adds = [{ yr: 2021, n: 2 }, { yr: 2023, n: 2 }];
    b.footprintChange = 0;
    // normalise footprint so the model lands near Tk 8.4 lakh / month
    const f = Math.sqrt(1);
    hero.b = b;
  })();

  // ---------- derive per-building economics ----------
  buildings.forEach((b) => {
    b.addedFloors = b.adds.reduce((s, a) => s + a.n, 0);
    b.floors0 = b.floors - b.addedFloors;
    b.floorsAt = (yr) => b.floors - b.adds.filter((a) => a.yr > yr).reduce((s, a) => s + a.n, 0);
    const m = rentModel(b);
    b.model = m; b.rentEst = m.est;
    // declared figures
    if (b.status === 0) { b.declFloors = b.floors; b.rentDecl = m.est * rnd(0.92, 1.06); }
    else if (b.status === 1) { b.declFloors = Math.max(1, b.floors - Math.max(1, b.addedFloors || ri(1, 2))); b.rentDecl = m.est * rnd(0.22, 0.62); }
    else { b.declFloors = 0; b.rentDecl = 0; }
    if (b.hero) { b.declFloors = 5; b.rentDecl = 120000; }
    b.units = b.use === 'res' ? b.floors * ri(2, 3) : b.use === 'mix' ? 2 * ri(3, 5) + (b.floors - 2) * ri(2, 3) : 4 * ri(4, 6) + (b.floors - 4) * ri(1, 3);
    b.gapMonthly = Math.max(0, b.rentEst - b.rentDecl);
    b.gapAnnual = b.gapMonthly * 12 * TAX_RATE;
    if (b.status === 0) b.gapAnnual *= 0.04;            // residual noise for declared buildings
  });

  // ---------- shops, signage, utilities ----------
  const REG_PREFIX = 'BIN-';
  buildings.forEach((b) => {
    b.shops = [];
    if (b.use !== 'res') {
      const n = b.hero ? 14 : b.use === 'mix' ? ri(2, 8) : ri(5, 14);
      const used = new Set();
      for (let i = 0; i < n; i++) {
        let s; do { s = pick(SHOPS); } while (used.has(s[1]) && used.size < SHOPS.length); used.add(s[1]);
        const reg = chance(b.status === 0 ? 0.8 : b.status === 1 ? 0.45 : 0.2);
        b.shops.push({ bn: s[0], en: s[1], cat: s[2], floor: i < n * 0.6 ? 0 : 1, vat: reg && chance(0.85), tl: reg || chance(0.2), conf: Math.round(rnd(84, 99)), box: [rnd(0.06, 0.5), rnd(0.62, 0.84), rnd(0.2, 0.34), rnd(0.07, 0.12)] });
      }
    }
    const comFloors = b.use === 'com' ? 4 : b.use === 'mix' ? 2 : 0;
    b.util = {
      elec: [{ meter: 'DESCO-' + ri(100000, 999999), tariff: 'Residential', n: Math.max(1, b.units - b.shops.length) }].concat(b.shops.length ? [{ meter: 'DESCO-' + ri(100000, 999999), tariff: 'Commercial', n: Math.ceil(b.shops.length * (b.status === 0 ? 1 : 0.4)) }] : []),
      gas: b.shops.length && b.status > 0 ? 'Residential' : (b.shops.length ? 'Commercial' : 'Residential'),
      water: 'Domestic'
    };
    b.tariffMismatch = b.shops.length > 0 && b.util.gas === 'Residential';
    b.comFloors = comFloors;
  });

  // ---------- owners & families ----------
  const owners = []; const companies = []; let pid = 0, cid = 0;
  const mkPerson = (female, last) => {
    const n = personName(female); if (last) { n.en = n.en.replace(/\S+$/, last[0]); n.bn = n.bn.replace(/\S+$/, last[1]); n.last = last; }
    return { id: 'P' + (++pid), type: 'person', name: n.en, bn: n.bn, tin: chance(0.8) ? String(ri(100000000000, 999999999999)) : null, nid: '•••• •••• ' + ri(1000, 9999), phone: '01' + ri(3, 9) + ri(10000000, 99999999) };
  };
  const clusters = [];
  const byArea = { 'Basila': [], 'Adabor': [], 'Rayer Bazar': [] };
  buildings.forEach((b) => byArea[b.area].push(b));
  const pool = buildings.filter((b) => b.status > 0 || chance(0.08));
  const shuffled = pool.sort(() => R() - 0.5);
  const free = new Set(shuffled.map((b) => b.idx));

  function makeCluster(forced) {
    const seedB = forced || buildings[[...free][Math.floor(R() * free.size)]];
    if (!seedB) return null;
    const last = forced ? LAST.find((l) => l[0] === 'Talukder') : pick(LAST);
    const head = mkPerson(false, last), spouse = mkPerson(true, last);
    const kids = Array.from({ length: ri(1, 3) }, () => mkPerson(chance(0.5), last));
    const company = chance(0.55) ? { id: 'C' + (++cid), type: 'company', name: last[0] + ' ' + pick(['Properties', 'Holdings', 'Enterprise', 'Developers']) + ' Ltd.', bn: last[1] + ' প্রপার্টিজ লিমিটেড', tin: String(ri(100000000000, 999999999999)) } : null;
    const members = [head, spouse, ...kids].concat(company ? [company] : []);
    members.forEach((m) => owners.push(m));
    if (company) companies.push(company);
    const n = forced ? 7 : ri(2, 6);
    const near = byArea[seedB.area].filter((b) => free.has(b.idx) && Math.hypot(b.x - seedB.x, b.y - seedB.y) < 650).slice(0, 80);
    const picks = [seedB]; free.delete(seedB.idx);
    while (picks.length < n && near.length) { const k = Math.floor(R() * near.length); const c = near.splice(k, 1)[0]; if (free.has(c.idx)) { picks.push(c); free.delete(c.idx); } }
    picks.forEach((b, i) => { const m = members[i % members.length]; b.owner = m; });
    const cl = { id: clusters.length + 1, head, members, buildings: picks, company, ties: [] };
    // ties: shared phone / address between family members
    if (spouse) cl.ties.push({ a: head.id, b: spouse.id, t: 'Spouse' });
    kids.forEach((k) => cl.ties.push({ a: head.id, b: k.id, t: 'Child' }));
    if (company) { cl.ties.push({ a: head.id, b: company.id, t: 'Director' }); if (kids[0]) cl.ties.push({ a: kids[0].id, b: company.id, t: 'Director' }); }
    if (chance(0.5) && kids[0]) { kids[0].phone = head.phone; cl.ties.push({ a: head.id, b: kids[0].id, t: 'Shared phone' }); }
    clusters.push(cl);
    return cl;
  }
  const heroCluster = makeCluster(hero.b);
  heroCluster.head.name = 'Mizanur Rahman Talukder'; heroCluster.head.bn = 'মিজানুর রহমান তালুকদার';
  for (let i = 0; i < 170; i++) makeCluster();
  // everyone else: single owner
  buildings.forEach((b) => { if (!b.owner) { const p = mkPerson(chance(0.3)); owners.push(p); b.owner = p; } });
  buildings.forEach((b) => { b.holding = 'H-' + String(ri(1000, 9999)) + '/' + ri(1, 30); b.tin = b.owner.tin; if (b.status === 2) b.tin = null; });

  // each cluster: portfolio size and TIN gap
  clusters.forEach((c) => {
    c.count = c.buildings.length;
    c.gapAnnual = c.buildings.reduce((s, b) => s + b.gapAnnual, 0);
    c.names = new Set(c.buildings.map((b) => b.owner.id)).size;
    c.hidden = c.buildings.filter((b) => b.status === 2 || (b.owner.tin == null)).length;
  });
  buildings.forEach((b) => { b.cluster = null; });
  clusters.forEach((c) => c.buildings.forEach((b) => (b.cluster = c)));

  // ---------- AI scoring vs rules-only baseline ----------
  const effortHours = (b) => 5 + b.floors * 0.6 + Math.min(b.units, 30) * 0.15 + (b.use !== 'res' ? 3 : 0);
  buildings.forEach((b) => {
    const trueGap = b.gapAnnual;
    // field outcome: does a notice on this building lead to extra tax? (latent truth, simulated)
    const pt = b.status === 0 ? 0.03 : clamp(0.12 + 0.66 * (1 - Math.exp(-trueGap / 560000)), 0, 0.8);
    b.violation = R() < pt;
    // AI estimate sees many signals => low noise ; rules sees growth and footprint only
    b.aiGap = Math.max(0, trueGap * (1 + gauss() * 0.28) + (b.violation ? 0 : gauss() * 12000));
    b.rulesScore = (b.addedFloors * 22 + (b.footprintChange ? 18 : 0) + (b.status === 2 ? 25 : 0) + Math.abs(gauss()) * 70 + (b.floors > 8 ? 10 : 0));
    b.pSuccess = clamp(0.28 + b.conf * 0.55 + (b.shops.length && b.tariffMismatch ? 0.08 : 0) + (b.addedFloors ? 0.07 : 0) + gauss() * 0.04, 0.3, 0.96);
    b.hours = effortHours(b);
    b.expRecovery = b.aiGap * b.pSuccess;
    b.priority = b.expRecovery / b.hours;                // Tk per officer hour
    b.risk = clamp(Math.round(100 * (1 - Math.exp(-b.aiGap / 380000)) * 0.65 + (b.status === 2 ? 22 : b.status === 1 ? 10 : 0) + (b.tariffMismatch ? 6 : 0) + (b.addedFloors ? 5 : 0)), 3, 99);
    if (b.status === 0) b.risk = clamp(Math.round(b.risk * 0.35), 2, 34);
    b.reasons = [];
    if (b.addedFloors) b.reasons.push({ k: b.addedFloors + ' floor' + (b.addedFloors > 1 ? 's' : '') + ' added since 2019, not on filing', w: Math.min(34, 12 + b.addedFloors * 7) });
    if (b.status === 2) b.reasons.push({ k: 'No tax record for this holding', w: 30 });
    if (b.shops.length && b.status > 0) b.reasons.push({ k: b.shops.length + ' shops read from signboards, ' + b.shops.filter((s) => !s.vat).length + ' without VAT', w: 18 });
    if (b.tariffMismatch) b.reasons.push({ k: 'Commercial use on residential gas tariff', w: 11 });
    if (b.status > 0 && b.rentDecl < b.rentEst * 0.5) b.reasons.push({ k: 'AI rent about ' + (b.rentEst / Math.max(b.rentDecl, 1)).toFixed(1).replace('Infinity', 'n/a') + 'x declared', w: 22 });
    if (b.cluster && b.cluster.count > 2 && b.status > 0) b.reasons.push({ k: 'Owner linked to ' + (b.cluster.count - 1) + ' other buildings', w: 14 });
    b.reasons.sort((a, c) => c.w - a.w);
  });
  hero.b.pSuccess = 0.91; hero.b.hours = 13.5; hero.b.expRecovery = hero.b.aiGap * hero.b.pSuccess; hero.b.priority = hero.b.expRecovery / hero.b.hours;

  // pin hero reasons to match the demo script
  (function () {
    const b = hero.b;
    b.reasons = [
      { k: '4 floors built since 2019, not on filing', w: 31 },
      { k: '14 shops read from signboards; 6 have no VAT record', w: 24 },
      { k: 'AI rent 7x declared rent', w: 21 },
      { k: 'Commercial use on residential gas tariff', w: 13 },
      { k: 'Owner linked to 6 other buildings', w: 11 }
    ];
    b.tariffMismatch = true; b.util.gas = 'Residential';
  })();

  const rank = (key) => buildings.slice().sort((a, c) => c[key] - a[key]);
  const byPriority = rank('priority'); const byRules = rank('rulesScore');
  byPriority.forEach((b, i) => (b.rankAI = i + 1)); byRules.forEach((b, i) => (b.rankRules = i + 1));
  const hitRate = (list, n) => list.slice(0, n).filter((b) => b.violation).length / n;

  // ---------- zone, league & series ----------
  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
  const total = buildings.length;
  const counts = [0, 0, 0]; buildings.forEach((b) => counts[b.status]++);
  const gapTotal = sum(buildings, (b) => b.gapAnnual);

  const ZONES = Array.from({ length: 25 }, (_, i) => {
    const n = i + 1; const rel = i === 9 ? 1 : rnd(0.55, 1.4);
    return { n, name: 'Tax Zone ' + n, live: n === 10, rel, buildings: i === 9 ? 10000 : Math.round(rnd(6500, 14500)), gapCr: 0 };
  });
  ZONES.forEach((z) => { z.gapCr = z.live ? gapTotal / 1e7 * (10000 / total) : (gapTotal / 1e7) * (z.buildings / total) * z.rel; });

  // 12-week pilot curve (simulated): notices, hit rate, extra tax per hit
  const pilot = (function () {
    const weeks = []; let notices = 0, hits = 0, taka = 0, collected = 0, appeal = 0;
    for (let w = 1; w <= 12; w++) {
      const ramp = w < 4 ? 0.3 + 0.2 * w : 1;
      const nW = Math.round(78 * ramp * (w > 10 ? 0.8 : 1));
      const h = Math.round(nW * clamp(0.54 + w * 0.0075 + gauss() * 0.015, 0.54, 0.64));
      notices += nW; hits += h; taka += h * 150000 * (1 + gauss() * 0.04);
      collected = taka * (0.2 + w * 0.045); appeal = Math.round(notices * (w < 3 ? 0.01 : 0.06));
      weeks.push({ w, notices, hits, hitRate: hits / notices, taka, collected: Math.min(collected, taka * 0.72), appeal, rulesHit: 0.3 });
    }
    return weeks;
  })();

  // model registry
  const MODELS = [
    { name: 'floor-extension-seg', ver: 'v1.8', task: 'LiDAR + satellite segmentation', metric: 'Floor accuracy', val: '96.4%', stage: 'Production', drift: 0.04, upd: '3 days ago' },
    { name: 'signage-ocr-bn', ver: 'v2.3', task: 'Bangla + English shopfront OCR', metric: 'Char accuracy', val: '97.1%', stage: 'Production', drift: 0.07, upd: '6 days ago' },
    { name: 'entity-resolver', ver: 'v1.5', task: 'Owner to TIN matching', metric: 'Match precision', val: '95.8%', stage: 'Production', drift: 0.05, upd: '1 day ago' },
    { name: 'rent-gbm', ver: 'v3.1', task: 'Fair rent per unit', metric: 'MAPE', val: '11.9%', stage: 'Production', drift: 0.09, upd: '9 days ago' },
    { name: 'anomaly-iforest', ver: 'v1.2', task: 'Neighbourhood outliers', metric: 'Precision@100', val: '71%', stage: 'Staging', drift: 0.12, upd: '2 days ago' },
    { name: 'target-ranker', ver: 'v4.0', task: 'Recovery per officer hour', metric: 'Hit rate top 300', val: '61%', stage: 'Production', drift: 0.06, upd: 'today' },
    { name: 'notice-llm-bn', ver: 'v0.9', task: 'Bangla notice drafting (in-country LLM)', metric: 'Approved with minor edits', val: '84%', stage: 'Production', drift: 0.03, upd: '4 days ago' }
  ];

  // roles
  const ROLES = {
    admin: { name: 'Demo: full access', scope: 'Everything in the demo', pii: 'Masked, unmask logged', views: ['command', 'map', 'targeting', 'owners', 'gap', 'copilot', 'ask', 'business', 'field', 'platform', 'governance'] },
    commissioner: { name: 'Zone Commissioner', scope: 'All of Zone 10', pii: 'Masked, unmask logged', views: ['command', 'map', 'targeting', 'owners', 'gap', 'copilot', 'ask', 'governance'] },
    officer: { name: 'Assessment Officer', scope: 'Adabor ward cluster', pii: 'Masked, unmask logged', views: ['map', 'gap', 'targeting', 'copilot', 'owners', 'business', 'ask'] },
    inspector: { name: 'Field Inspector', scope: 'Assigned route only', pii: 'Masked', views: ['field', 'map'] },
    rmd: { name: 'RMD Leadership', scope: 'All zones, aggregate', pii: 'Aggregated only', views: ['command', 'platform', 'governance', 'ask'] }
  };

  const api = {
    W, H, AREAS, roadsX, roadsY, CANAL, PARKS, buildings, owners, clusters, heroCluster, hero: hero.b, rentModel, TAX_RATE,
    byPriority, byRules, hitRate, counts, total, gapTotal, ZONES, pilot, MODELS, ROLES, SHOPS, BASE_RATE, effortHours, areaAt, personName
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TS = api;
})(typeof window !== 'undefined' ? window : globalThis);
