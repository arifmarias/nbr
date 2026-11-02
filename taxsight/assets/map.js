/* TaxSight AI · CityMap: canvas 3D extrusion renderer (no tiles, no deps) */
(function () {
  'use strict';
  const FLOOR_M = 3.2;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const rgb = (a) => 'rgb(' + a.map((v) => Math.round(v)).join(',') + ')';
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const shade = (a, f) => a.map((v) => Math.max(0, Math.min(255, v * f)));

  class CityMap {
    constructor(canvas) {
      this.c = canvas; this.ctx = canvas.getContext('2d');
      this.scene = document.createElement('canvas'); this.sctx = this.scene.getContext('2d');
      this.cam = { cx: TS.W / 2, cy: TS.H / 2, zoom: 0.5, yaw: -0.52, tilt: 0.92 };
      this.layer = 'status'; this.epoch = 2026; this.reveal = 1; this.filter = null;
      this.labels = true; this.hl = null; this.route = null; this.sel = null; this.hover = null; this.labelFor = null;
      this.dirty = true; this.running = false; this.onSelect = null; this.onHover = null; this.onView = null;
      this.sweeping = false;
      this._bind(); this.themeChanged(); this.resize(); this.fit(true);
      this._ro = new ResizeObserver(() => { this.resize(); }); this._ro.observe(canvas.parentElement);
      this.start();
    }
    destroy() { this.running = false; this._ro.disconnect(); }
    themeChanged() {
      const P = {}; const idle = hex(css('--map-idle'));
      P.idle = [rgb(idle), rgb(hex(css('--map-idle-side')))];
      const c = { s0: hex(css('--ok')), s1: hex(css('--warn')), s2: hex(css('--bad')) };
      P.st = [0, 1, 2].map((i) => { let a = c['s' + i]; if (i === 0) a = mix(a, idle, 0.38); return [rgb(a), rgb(shade(a, 0.7))]; });
      const use = { res: [106, 139, 255], mix: [176, 124, 240], com: [44, 196, 176] };
      P.use = {}; Object.keys(use).forEach((k) => (P.use[k] = [rgb(use[k]), rgb(shade(use[k], 0.68))]));
      P.ramp = (t) => { const lo = mix(idle, hex(css('--brand')), 0.25), mid = hex(css('--warn')), hi = hex(css('--bad')); const a = t < 0.5 ? mix(lo, mid, t / 0.5) : mix(mid, hi, (t - 0.5) / 0.5); return [rgb(a), rgb(shade(a, 0.68))]; };
      P.ramps = Array.from({ length: 21 }, (_, i) => P.ramp(i / 20));
      P.bg = css('--map-bg'); P.ground = css('--map-ground'); P.road = css('--map-road'); P.roadA = css('--map-road-art'); P.water = css('--map-water'); P.park = css('--map-park');
      P.brand = css('--brand'); P.ink = css('--ink'); P.surface = css('--surface'); P.ink3 = css('--ink-3'); P.bad = css('--bad');
      this.P = P; this.dirty = true;
    }
    resize() {
      const p = this.c.parentElement; const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.w = p.clientWidth; this.h = p.clientHeight; this.dpr = dpr;
      [this.c, this.scene].forEach((cv) => { cv.width = Math.round(this.w * dpr); cv.height = Math.round(this.h * dpr); });
      this.c.style.width = this.w + 'px'; this.c.style.height = this.h + 'px';
      this.dirty = true;
    }
    fit(instant) {
      this._prep(); const c = this.cam; const pts = [[0, 0], [TS.W, 0], [TS.W, TS.H], [0, TS.H]].map(([x, y]) => { const dx = x - TS.W / 2, dy = y - TS.H / 2; return [dx * this.co - dy * this.si, dx * this.si + dy * this.co]; });
      const bw = Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0])), bh = (Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1]))) * this.ct + 30 * this.st * 3.2;
      const z = Math.min(this.w / bw, this.h / bh) * 0.94;
      Object.assign(this.cam, { cx: TS.W / 2, cy: TS.H / 2, zoom: z || 0.4 }); this.dirty = true;
    }
    tween(to, dur = 0.9) {
      if (window.gsap) gsap.to(this.cam, Object.assign({ duration: dur, ease: 'power3.inOut', onUpdate: () => { this.dirty = true; this.onView && this.onView(); } }, to));
      else { Object.assign(this.cam, to); this.dirty = true; }
    }
    focus(b, zoom = 2.1, dur = 1) { this.tween({ cx: b.x, cy: b.y, zoom }, dur); }
    // ----- projection -----
    _prep() { const c = this.cam; this.co = Math.cos(c.yaw); this.si = Math.sin(c.yaw); this.ct = Math.cos(c.tilt); this.st = Math.sin(c.tilt); }
    proj(x, y, z) { const c = this.cam, dx = x - c.cx, dy = y - c.cy; const rx = dx * this.co - dy * this.si, ry = dx * this.si + dy * this.co; return [this.w / 2 + rx * c.zoom, this.h / 2 + ry * c.zoom * this.ct - z * c.zoom * this.st, ry]; }
    unproj(sx, sy) { const c = this.cam; const rx = (sx - this.w / 2) / c.zoom, ry = (sy - this.h / 2) / (c.zoom * this.ct); return [c.cx + rx * this.co + ry * this.si, c.cy - rx * this.si + ry * this.co]; }
    // ----- colour -----
    colorOf(b) {
      const P = this.P;
      if (this.reveal < 1 && (b.x + b.y) / (TS.W + TS.H) > this.reveal) return P.idle;
      switch (this.layer) {
        case 'risk': return P.ramps[Math.round(b.risk / 100 * 20)];
        case 'use': return P.use[b.use];
        case 'change': return P.idle;
        default: return P.st[b.status];
      }
    }
    // ----- scene -----
    renderScene() {
      this._prep(); const P = this.P, ctx = this.sctx, dpr = this.dpr, cam = this.cam;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, this.w, this.h);
      const poly = (pts, fill) => { ctx.beginPath(); pts.forEach((p, i) => { const s = this.proj(p[0], p[1], 0); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
      const rect = (x0, y0, x1, y1, f) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], f);
      rect(-30, -30, TS.W + 30, TS.H + 30, P.ground);
      rect(-30, TS.CANAL.y0, TS.W + 30, TS.CANAL.y1, P.water);
      const rx = TS.roadsX, ry = TS.roadsY;
      for (let by = 0; by < ry.length - 1; by++) for (let bx = 0; bx < rx.length - 1; bx++) if (TS.PARKS.has(bx + ',' + by)) rect(rx[bx].p + rx[bx].w / 2, ry[by].p + ry[by].w / 2, rx[bx + 1].p - rx[bx + 1].w / 2, ry[by + 1].p - ry[by + 1].w / 2, P.park);
      rx.forEach((r) => rect(r.p - r.w / 2, -30, r.p + r.w / 2, TS.H + 30, r.art ? P.roadA : P.road));
      ry.forEach((r) => rect(-30, r.p - r.w / 2, TS.W + 30, r.p + r.w / 2, r.art ? P.roadA : P.road));
      // area seams
      ctx.save(); ctx.setLineDash([6, 8]); ctx.strokeStyle = P.ink3; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
      [600, 1200].forEach((x) => { const a = this.proj(x, 0, 0), b = this.proj(x, TS.H, 0); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
      ctx.restore();

      // buildings (painter's algorithm)
      const list = TS.buildings; const n = list.length; const order = this._order || (this._order = new Array(n)); const depth = this._depth || (this._depth = new Float32Array(n));
      for (let i = 0; i < n; i++) { const b = list[i]; depth[i] = (b.x - cam.cx) * this.si + (b.y - cam.cy) * this.co; order[i] = i; }
      order.sort((a, b) => depth[a] - depth[b]);
      const flat = cam.tilt < 0.02; const z = cam.zoom, ep = this.epoch, filt = this.filter, chg = this.layer === 'change';
      const margin = 40;
      for (let k = 0; k < n; k++) {
        const b = list[order[k]];
        const s0 = this.proj(b.x, b.y, 0); if (s0[0] < -margin || s0[0] > this.w + margin || s0[1] < -margin - 160 || s0[1] > this.h + margin + 60) continue;
        const dim = filt && !filt(b);
        let col = dim ? P.idle : this.colorOf(b);
        const fl = b.floorsAt(ep);
        let baseF = fl, extF = 0;
        if (chg && !dim) { baseF = b.floorsAt(2019); extF = Math.max(0, fl - baseF); }
        const prism = (f0, f1, cc) => { if (f1 <= f0) return; this._prism(ctx, b, f0 * FLOOR_M, f1 * FLOOR_M, cc, flat, dim); };
        prism(0, baseF, col);
        if (extF) prism(baseF, baseF + extF, P.st[2]);
      }
      // sweep line
      if (this.sweeping && this.reveal < 1) {
        const t = this.reveal * (TS.W + TS.H); const a = this.proj(Math.max(0, t - TS.H), Math.min(TS.H, t), 0), bb = this.proj(Math.min(TS.W, t), Math.max(0, t - TS.W), 0);
        const g = ctx.createLinearGradient(a[0], a[1], bb[0], bb[1]); g.addColorStop(0, 'transparent'); g.addColorStop(0.5, P.brand); g.addColorStop(1, 'transparent');
        ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.shadowColor = P.brand; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(bb[0], bb[1]); ctx.stroke(); ctx.restore();
      }
      // area labels
      if (this.labels) ctx.save(); ctx.font = '600 11px ' + css('--f-title'); ctx.textAlign = 'center'; ctx.fillStyle = P.ink3; ctx.globalAlpha = 0.9;
      TS.AREAS.forEach((a) => { const p = this.proj((a.x0 + a.x1) / 2, TS.H - 36, 0); ctx.fillText(a.id.toUpperCase().split('').join(' '), p[0], p[1]); });
      ctx.restore();
      this.dirty = false; this.sceneDirty = false;
    }
    _prism(ctx, b, z0, z1, col, flat, dim) {
      const c = this.cam, pts = b.pts; const S = [], T = [];
      for (let i = 0; i < 4; i++) { const p = pts[i]; const dx = p[0] - c.cx, dy = p[1] - c.cy; const rx = dx * this.co - dy * this.si, ry = dx * this.si + dy * this.co; const sx = this.w / 2 + rx * c.zoom, base = this.h / 2 + ry * c.zoom * this.ct; S.push([sx, base - z0 * c.zoom * this.st]); T.push([sx, base - z1 * c.zoom * this.st]); }
      if (dim) ctx.globalAlpha = 0.45;
      if (!flat) {
        ctx.fillStyle = col[1];
        for (let i = 0; i < 4; i++) {
          const j = (i + 1) & 3; const p = pts[i], q = pts[j]; const nx = q[1] - p[1], ny = -(q[0] - p[0]);
          if (nx * this.si + ny * this.co <= 0) continue;
          ctx.beginPath(); ctx.moveTo(S[i][0], S[i][1]); ctx.lineTo(S[j][0], S[j][1]); ctx.lineTo(T[j][0], T[j][1]); ctx.lineTo(T[i][0], T[i][1]); ctx.closePath(); ctx.fill();
        }
      }
      ctx.fillStyle = col[0]; ctx.beginPath(); ctx.moveTo(T[0][0], T[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(T[i][0], T[i][1]); ctx.closePath(); ctx.fill();
      if (flat) { ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 0.5; ctx.stroke(); }
      if (dim) ctx.globalAlpha = 1;
    }
    // ----- hit test -----
    topPoly(b, zM) { const c = this.cam; return b.pts.map((p) => this.proj(p[0], p[1], zM)); }
    hit(mx, my) {
      this._prep(); const list = TS.buildings, n = list.length; const order = this._order; if (!order) return null;
      const inPoly = (poly, x, y) => { let ins = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) ins = !ins; } return ins; };
      for (let k = n - 1; k >= 0; k--) {
        const b = list[order[k]]; if (this.filter && !this.filter(b)) continue;
        const z1 = b.floorsAt(this.epoch) * FLOOR_M; const s = this.proj(b.x, b.y, 0);
        if (Math.abs(s[0] - mx) > 60 || my < s[1] - z1 * this.cam.zoom * this.st - 40 || my > s[1] + 40) continue;
        const top = this.topPoly(b, z1), bot = this.topPoly(b, 0);
        if (inPoly(top, mx, my)) return b;
        for (let i = 0; i < 4; i++) { const j = (i + 1) & 3; const p = b.pts[i], q = b.pts[j]; if ((q[1] - p[1]) * this.si - (q[0] - p[0]) * this.co <= 0) continue; if (inPoly([bot[i], bot[j], top[j], top[i]], mx, my)) return b; }
      }
      return null;
    }
    // ----- overlay & loop -----
    start() { if (this.running) return; this.running = true; const loop = (t) => { if (!this.running) return; if (this.dirty) this.renderScene(); this.frame(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    frame(t) {
      const ctx = this.ctx, dpr = this.dpr; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(this.scene, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this._prep(); const P = this.P;
      const lift = (b) => b.floorsAt(this.epoch) * FLOOR_M;
      // route
      if (this.route && this.route.length) {
        ctx.save(); ctx.lineWidth = 2.5; ctx.strokeStyle = P.brand; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t / 40; ctx.lineJoin = 'round';
        ctx.beginPath(); this.route.forEach((b, i) => { const s = this.proj(b.x, b.y, 0); i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.stroke(); ctx.restore();
      }
      const marker = (b, label, col) => {
        const s = this.proj(b.x, b.y, lift(b) + 4); const r = 9;
        ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[0], s[1] - 10); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(s[0], s[1] - 10 - r, r, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = P.surface; ctx.lineWidth = 1.5; ctx.stroke();
        if (label != null) { ctx.fillStyle = '#fff'; ctx.font = '600 10px ' + css('--f-title'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, s[0], s[1] - 10 - r + 0.5); }
      };
      if (this.hl) { let i = 0; const max = Math.min(this.hl.length, 60); for (; i < max; i++) marker(this.hl[i], this.numbered ? i + 1 : null, P.brand); }
      if (this.route) this.route.forEach((b, i) => marker(b, i + 1, P.brand));
      const outline = (b, col, w) => {
        const z1 = lift(b); const top = this.topPoly(b, z1), bot = this.topPoly(b, 0);
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round';
        ctx.beginPath(); top.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.stroke();
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(top[i][0], top[i][1]); ctx.lineTo(bot[i][0], bot[i][1]); ctx.stroke(); }
        ctx.beginPath(); bot.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.stroke(); ctx.restore();
      };
      if (this.hover && this.hover !== this.sel) outline(this.hover, P.ink, 1.4);
      if (this.sel) {
        const b = this.sel; outline(b, P.brand, 2.2);
        const s = this.proj(b.x, b.y, 0); const k = (t % 1800) / 1800; const R = (30 + k * 60) * Math.max(0.5, this.cam.zoom * 1.2);
        ctx.save(); ctx.strokeStyle = P.brand; ctx.globalAlpha = 1 - k; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(s[0], s[1], R, R * this.ct * 0.9 + 1, 0, 0, 7); ctx.stroke(); ctx.restore();
        // callout
        const a = this.proj(b.x, b.y, lift(b) + 6); const txt = b.id + '  ·  ' + b.floors + ' floors';
        ctx.save(); ctx.font = '600 11px ' + css('--f-body'); const tw = ctx.measureText(txt).width + 16;
        ctx.strokeStyle = P.brand; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0], a[1] - 22); ctx.stroke();
        ctx.fillStyle = P.brand; ctx.beginPath(); ctx.roundRect(a[0] - tw / 2, a[1] - 44, tw, 22, 6); ctx.fill();
        ctx.fillStyle = css('--brand-ink'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, a[0], a[1] - 33); ctx.restore();
      }
      this._lastFrame = t;
    }
    // ----- input -----
    _bind() {
      const c = this.c; let drag = null, moved = false;
      c.addEventListener('pointerdown', (e) => { c.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, rot: e.shiftKey || e.button === 2 || e.altKey }; moved = false; c.classList.add('drag'); });
      c.addEventListener('contextmenu', (e) => e.preventDefault());
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top;
        if (drag) {
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; drag.x = e.clientX; drag.y = e.clientY;
          if (drag.rot) { this.cam.yaw += dx * 0.006; this.cam.tilt = Math.max(0, Math.min(1.2, this.cam.tilt - dy * 0.004)); }
          else { this._prep(); const z = this.cam.zoom; const rx = -dx / z, ry = -dy / (z * this.ct); this.cam.cx += rx * this.co + ry * this.si; this.cam.cy += -rx * this.si + ry * this.co; }
          this.dirty = true; this.onView && this.onView(); return;
        }
        if (this._hq) return; this._hq = requestAnimationFrame(() => { this._hq = 0; const h = this.hit(mx, my); if (h !== this.hover) { this.hover = h; c.style.cursor = h ? 'pointer' : 'grab'; this.onHover && this.onHover(h, e.clientX, e.clientY); } else if (h) this.onHover && this.onHover(h, e.clientX, e.clientY); });
      });
      c.addEventListener('pointerleave', () => { this.hover = null; this.onHover && this.onHover(null); });
      c.addEventListener('pointerup', (e) => { c.classList.remove('drag'); if (drag && !moved) { const r = c.getBoundingClientRect(); const h = this.hit(e.clientX - r.left, e.clientY - r.top); if (h) { this.sel = h; this.onSelect && this.onSelect(h); } } drag = null; });
      c.addEventListener('dblclick', (e) => { const r = c.getBoundingClientRect(); this._prep(); const p = this.unproj(e.clientX - r.left, e.clientY - r.top); this.tween({ cx: p[0], cy: p[1], zoom: Math.min(6, this.cam.zoom * 1.8) }, 0.5); });
      c.setAttribute('tabindex', '0');
      c.addEventListener('keydown', (e) => { const k = e.key; if (k === '+' || k === '=') this.zoomBy(1.35); else if (k === '-' || k === '_') this.zoomBy(1 / 1.35); else if (k === 'ArrowLeft') this.pan(-60, 0); else if (k === 'ArrowRight') this.pan(60, 0); else if (k === 'ArrowUp') this.pan(0, -60); else if (k === 'ArrowDown') this.pan(0, 60); else if (k === 'q') this.rotate(-0.3); else if (k === 'e') this.rotate(0.3); else return; e.preventDefault(); });
      c.addEventListener('wheel', (e) => {
        e.preventDefault(); const r = c.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top; this._prep();
        const before = this.unproj(mx, my); const f = Math.exp(-e.deltaY * 0.0014); this.cam.zoom = Math.max(0.18, Math.min(6, this.cam.zoom * f));
        const after = this.unproj(mx, my); this.cam.cx += before[0] - after[0]; this.cam.cy += before[1] - after[1]; this.dirty = true; this.onView && this.onView();
      }, { passive: false });
    }
    // ----- API -----
    set(opts) { Object.assign(this, opts); this.dirty = true; }
    zoomBy(f) { this.tween({ zoom: Math.max(0.18, Math.min(6, this.cam.zoom * f)) }, 0.35); }
    pan(dx, dy) { this._prep(); const z = this.cam.zoom; const rx = dx / z, ry = dy / (z * this.ct); this.tween({ cx: this.cam.cx + rx * this.co + ry * this.si, cy: this.cam.cy - rx * this.si + ry * this.co }, 0.3); }
    rotate(d) { this.tween({ yaw: this.cam.yaw + d }, 0.6); }
    setTilt(t) { this.tween({ tilt: t }, 0.7); }
    sweep(dur = 2.6) {
      if (!window.gsap) { this.reveal = 1; this.dirty = true; return; }
      this.sweeping = true; this.reveal = 0; this.dirty = true;
      const o = { v: 0 }; gsap.to(o, { v: 1, duration: dur, ease: 'power1.inOut', onUpdate: () => { this.reveal = o.v; this.dirty = true; }, onComplete: () => { this.sweeping = false; this.reveal = 1; this.dirty = true; } });
    }
  }
  window.CityMap = CityMap; window.FLOOR_M = FLOOR_M;
})();
