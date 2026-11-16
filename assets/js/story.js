/* ==========================================================================
   „720 pont” — görgetésre változó részecske-történet a főoldalon.
   Minden pont egy tag. A pontok száma a section data-members értékéből jön
   (egyetlen helyen kell frissíteni). Canvas 2D: könnyű, gyenge gépen is fut.
   JS nélkül a fejezetek sima szövegként olvashatók.
   ========================================================================== */
(function () {
  "use strict";
  const sec = document.querySelector("[data-story]");
  if (!sec) return;
  const stage = sec.querySelector(".story-stage");
  const canvas = stage && stage.querySelector("canvas");
  const ctx = canvas && canvas.getContext && canvas.getContext("2d");
  if (!ctx) return;

  const steps = Array.from(sec.querySelectorAll(".story-step"));
  const texts = steps.map((s) => s.querySelector(".story-text"));
  const dots = Array.from(sec.querySelectorAll(".story-dots i"));
  const legend = sec.querySelector(".story-legend");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const N = Math.max(50, Math.min(3000, parseInt(sec.dataset.members, 10) || 720));
  const VK = window.VK;
  const t = (k) => (VK ? VK.t(k) : k);

  /* ---------- Szövegek (a taglétszám behelyettesítésével) ---------- */
  function huArticle(n) {
    const s = String(n);
    if (n >= 1000 && n < 2000) return "az";
    return s.length === 3 && (s[0] === "1" || s[0] === "5") ? "az" : "a";
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  let counted = reduce;
  function fill() {
    sec.querySelectorAll("[data-story-t]").forEach((el) => {
      const html = esc(t(el.dataset.storyT))
        .replace("{n}", '<span class="story-num">' + (counted ? N : 0) + "</span>")
        .replace("{next}", '<span class="story-num">' + (N + 1) + "</span>")
        .replace("{a}", huArticle(N + 1));
      el.innerHTML = html;
    });
  }
  fill();
  document.addEventListener("langchange", fill);

  function countUp() {
    if (counted) return;
    counted = true;
    const el = sec.querySelector('[data-story-t="story.2.t"] .story-num');
    if (!el) return;
    const t0 = performance.now(), dur = 1500;
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      const cur = sec.querySelector('[data-story-t="story.2.t"] .story-num');
      if (cur) cur.textContent = Math.round(N * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Alakzatok ---------- */
  let seed = 7;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };

  function sphere(r) {
    const a = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.399963229728653;
      a.push([Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r]);
    }
    return a.sort((p, q) => p[0] - q[0]);
  }
  // Szétszórt pontok: a képernyő arányában (u, v ∈ 0..1), saját sodródással
  const scatter = [];
  for (let i = 0; i < N; i++) scatter.push([rnd(), rnd(), rnd() * 2 - 1, rnd() * Math.PI * 2, 0.4 + rnd() * 0.8]);
  scatter.sort((p, q) => p[0] - q[0]);
  const ball = sphere(1);
  const core = sphere(0.46);
  let glyph = null; // a „100+” felirat pontjai (betűtípus betöltése után)

  function buildGlyph() {
    const c = document.createElement("canvas"), W = 900, H = 340;
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "800 250px Unbounded, 'Arial Black', sans-serif";
    g.fillText("100+", W / 2, H / 2 + 8);
    const data = g.getImageData(0, 0, W, H).data, pts = [];
    for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) if (data[(y * W + x) * 4 + 3] > 140) pts.push([x, y]);
    if (!pts.length) return;
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const tmp = pts[i]; pts[i] = pts[j]; pts[j] = tmp; }
    const out = [];
    for (let i = 0; i < N; i++) {
      const p = pts[i % pts.length], jit = i >= pts.length ? 1.2 : 0;
      out.push([((p[0] + (rnd() - 0.5) * jit) / W - 0.5) * 2.35, ((p[1] + (rnd() - 0.5) * jit) / H - 0.5) * 0.89, (rnd() - 0.5) * 0.08]);
    }
    glyph = out.sort((p, q) => p[0] - q[0]);
  }
  if (document.fonts && document.fonts.load) document.fonts.load("800 250px Unbounded").then(buildGlyph, buildGlyph);
  else buildGlyph();

  /* ---------- Méretezés ---------- */
  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, S = 1, wide = true;
  function layout() {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    wide = W >= 900;
    // Éles pontok: a kijelző valódi felbontásán rajzolunk (max. 2x), retinán is.
    DPR = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    if (wide) { cx = W * 0.64; cy = H * 0.52; S = Math.min(W * 0.21, H * 0.33); }
    else { cx = W / 2; cy = H * 0.34; S = Math.min(W * 0.4, H * 0.22); }
  }

  // Pont-sprite: lágy fény, két színben
  // Nagy felbontású forrás: éles, fehéren izzó mag + halvány fényudvar.
  const SP = 128;
  function sprite(rgb) {
    const c = document.createElement("canvas"); c.width = c.height = SP;
    const g = c.getContext("2d"), h = SP / 2, gr = g.createRadialGradient(h, h, 0, h, h, h);
    const col = (a) => "rgba(" + rgb + "," + a + ")";
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.1, "rgba(255,255,255,0.98)");
    gr.addColorStop(0.19, col(0.95));
    gr.addColorStop(0.27, col(0.36));
    gr.addColorStop(0.45, col(0.11));
    gr.addColorStop(0.7, col(0.025));
    gr.addColorStop(1, col(0));
    g.fillStyle = gr; g.fillRect(0, 0, SP, SP); return c;
  }
  const SPR = sprite("200,238,228"), SPR_ACC = sprite("82,191,165");
  // Pontonkénti apró eltérés (méret, pislákolás), hogy élőbb legyen a felhő
  const jit = new Float32Array(N), tw = new Float32Array(N);
  for (let i = 0; i < N; i++) { jit[i] = 0.78 + rnd() * 0.44; tw[i] = rnd() * 6.283; }
  const accentIdx = new Uint8Array(N); for (let i = 0; i < N; i++) accentIdx[i] = rnd() < 0.16 ? 1 : 0;

  /* ---------- Vetítés ---------- */
  const out = { x: 0, y: 0, z: 0, k: 1 };
  function proj(p, ry, rx, scale, ox, oy) {
    const cy1 = Math.cos(ry), sy1 = Math.sin(ry), cx1 = Math.cos(rx), sx1 = Math.sin(rx);
    let x = p[0] * scale, y = p[1] * scale, z = p[2] * scale;
    const x1 = x * cy1 + z * sy1, z1 = -x * sy1 + z * cy1;
    const y1 = y * cx1 - z1 * sx1, z2 = y * sx1 + z1 * cx1;
    const k = 3.4 / (3.4 + z2);
    out.x = (ox || cx) + x1 * S * k; out.y = (oy || cy) + y1 * S * k; out.z = z2; out.k = k;
    return out;
  }

  // Egy alakzat i-edik pontjának képernyő-helye, mérete, fényereje
  function shapePos(shape, i, time, res) {
    if (shape === 0) {
      const p = scatter[i], dr = reduce ? 0 : 1;
      res.x = (p[0] + Math.sin(time * 0.17 * p[4] + p[3]) * 0.012 * dr) * W;
      res.y = (0.06 + p[1] * 0.88 + Math.cos(time * 0.13 * p[4] + p[3]) * 0.012 * dr) * H;
      res.s = 1.3 + (p[2] + 1) * 0.9; res.a = 0.22 + (p[2] + 1) * 0.16;
      return;
    }
    if (shape === 1 || shape === 4) {
      const o = proj(ball[i], time * 0.11, 0.38, 1);
      res.x = o.x; res.y = o.y; res.s = 2.5 * o.k; res.a = 0.3 + (1 - (o.z + 1) / 2) * 0.7;
      return;
    }
    if (shape === 2) {
      const src = glyph || ball;
      const o = proj(src[i], glyph ? Math.sin(time * 0.35) * 0.12 : time * 0.11, glyph ? 0 : 0.38, 1);
      res.x = o.x; res.y = o.y; res.s = 2.1 * o.k; res.a = 0.92;
      return;
    }
    // 3: tömör mag a gyűrűk közepén
    const o = proj(core[i], time * 0.16, 0.38, 1);
    res.x = o.x; res.y = o.y; res.s = 1.9 * o.k; res.a = 0.45 + (1 - (o.z + 1) / 2) * 0.55;
  }

  /* ---------- Görgetési állapot ---------- */
  let f = 0;
  function readScroll() {
    const mid = window.innerHeight / 2, c = steps.map((s) => { const r = s.getBoundingClientRect(); return r.top + r.height / 2; });
    if (mid <= c[0]) { f = 0; return; }
    for (let k = 0; k < c.length - 1; k++) if (mid <= c[k + 1]) { f = k + (mid - c[k]) / (c[k + 1] - c[k]); return; }
    f = c.length - 1;
  }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  /* ---------- Egér: finom kitérés ---------- */
  let px = -9999, py = -9999;
  const offX = new Float32Array(N), offY = new Float32Array(N);
  if (fine && !reduce) {
    stage.parentElement.addEventListener("pointermove", (e) => { const r = stage.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; }, { passive: true });
    stage.parentElement.addEventListener("pointerleave", () => { px = py = -9999; });
  }

  /* ---------- Rajzolás ---------- */
  const A = { x: 0, y: 0, s: 0, a: 0 }, B = { x: 0, y: 0, s: 0, a: 0 };
  let lastActive = -1;
  function frame(now) {
    const time = reduce ? 0 : now / 1000;
    readScroll();
    const k = Math.min(Math.floor(f), steps.length - 1), local = f - k;
    const next = Math.min(k + 1, steps.length - 1);
    const tm = reduce ? (local < 0.5 ? 0 : 1) : smooth(0.3, 0.8, local);

    // Szövegpanelek
    texts.forEach((el, i) => {
      const d = f - i, o = clamp(1 - Math.abs(d) * 1.7, 0, 1);
      el.style.opacity = o.toFixed(3);
      el.style.transform = reduce ? "" : "translate3d(0," + (-d * 36).toFixed(1) + "px,0)";
      el.style.visibility = o < 0.02 ? "hidden" : "visible";
    });
    const active = Math.round(f);
    if (active !== lastActive) { dots.forEach((d, i) => d.classList.toggle("on", i === active)); lastActive = active; }
    if (f > 0.55) countUp();

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Gyűrűk (3. fejezet): ágazati és országos szövetség
    const wR = clamp(1 - Math.abs(f - 3) * 1.5, 0, 1);
    if (wR > 0.01) drawRings(time, wR);
    else if (legend) legend.style.opacity = "0";

    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.globalCompositeOperation = "lighter";
    const R = 110;
    for (let i = 0; i < N; i++) {
      shapePos(k, i, time, A);
      let x = A.x, y = A.y, s = A.s, a = A.a;
      if (tm > 0 && next !== k) {
        shapePos(next, i, time, B);
        const tp = ease(clamp((tm - (i / N) * 0.35) / 0.65, 0, 1));
        x += (B.x - x) * tp; y += (B.y - y) * tp; s += (B.s - s) * tp; a += (B.a - a) * tp;
      }
      // egér
      let tx = 0, ty = 0;
      if (px > -9000) { const dx = x - px, dy = y - py, d2 = dx * dx + dy * dy; if (d2 < R * R) { const d = Math.sqrt(d2) || 1, push = (1 - d / R) * 26; tx = (dx / d) * push; ty = (dy / d) * push; } }
      offX[i] += (tx - offX[i]) * 0.12; offY[i] += (ty - offY[i]) * 0.12;
      x += offX[i]; y += offY[i];
      const r = s * 3.5 * jit[i];
      ctx.globalAlpha = clamp(a * (reduce ? 1 : 0.86 + 0.14 * Math.sin(time * 1.3 + tw[i])), 0, 1);
      ctx.drawImage(accentIdx[i] ? SPR_ACC : SPR, x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;

    // Az új tag (utolsó fejezet): egy pont beérkezik és csatlakozik
    const w5 = clamp((f - (steps.length - 2) - 0.35) / 0.6, 0, 1);
    if (w5 > 0) drawNewcomer(time, ease(w5));
    ctx.globalCompositeOperation = "source-over";
  }

  function drawRings(time, w) {
    const rings = [0.92, 1.38], tilt = -0.22;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(tilt);
    ctx.lineWidth = 1;
    rings.forEach((r, ri) => {
      ctx.strokeStyle = "rgba(191,233,221," + (0.28 * w).toFixed(3) + ")";
      ctx.setLineDash(ri ? [2, 6] : []);
      ctx.beginPath(); ctx.ellipse(0, 0, r * S, r * S * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.globalCompositeOperation = "lighter";
    rings.forEach((r, ri) => {
      for (let j = 0; j < 3; j++) {
        const ang = time * (ri ? 0.18 : 0.26) + (j * Math.PI * 2) / 3 + ri;
        const x = Math.cos(ang) * r * S, y = Math.sin(ang) * r * S * 0.34, s = 9;
        ctx.globalAlpha = w;
        ctx.drawImage(SPR_ACC, x - s, y - s, s * 2, s * 2);
      }
    });
    ctx.restore();
    ctx.globalAlpha = 1;
    if (legend) {
      legend.style.opacity = w.toFixed(3);
      legend.style.transform = "translate3d(" + cx.toFixed(1) + "px," + (cy + rings[1] * S * 0.34 + (wide ? 56 : 34)).toFixed(1) + "px,0) translateX(-50%)";
    }
  }

  function drawNewcomer(time, w) {
    const o = proj([0.18, -0.12, -1], time * 0.11, 0.38, 1);
    const tx = o.x, ty = o.y;
    const sx = wide ? cx - W * 0.42 : W * 0.08, sy = H * (wide ? 0.95 : 0.72);
    const qx = (sx + tx) / 2 - (wide ? 40 : 10), qy = Math.min(sy, ty) - H * 0.28;
    const at = (u) => [(1 - u) * (1 - u) * sx + 2 * (1 - u) * u * qx + u * u * tx, (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * qy + u * u * ty];
    for (let j = 10; j >= 0; j--) {
      const u = Math.max(0, w - j * 0.025), p = at(u), s = (7 - j * 0.5) * (j ? 1 : 1.4);
      ctx.globalAlpha = (1 - j / 11) * (j ? 0.5 : 1);
      ctx.drawImage(SPR_ACC, p[0] - s * 2, p[1] - s * 2, s * 4, s * 4);
    }
    if (w >= 1) {
      const pulse = reduce ? 0.5 : (Math.sin(time * 2.4) + 1) / 2, p = at(1);
      ctx.globalAlpha = 0.5 * (1 - pulse);
      ctx.strokeStyle = "rgba(82,191,165,1)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p[0], p[1], 12 + pulse * 22, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Indítás: csak ha látszik ---------- */
  let running = false, raf = 0;
  const loop = (now) => { frame(now); raf = running ? requestAnimationFrame(loop) : 0; };
  sec.classList.add("story--js");
  layout();
  if ("ResizeObserver" in window) new ResizeObserver(layout).observe(stage); else addEventListener("resize", layout);
  new IntersectionObserver((en) => {
    const vis = en[0].isIntersecting;
    if (vis && !running) { running = true; raf = requestAnimationFrame(loop); }
    else if (!vis) { running = false; cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: "100px 0px" }).observe(sec);
  document.addEventListener("visibilitychange", () => { if (document.hidden) { running = false; cancelAnimationFrame(raf); raf = 0; } else { const r = sec.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight && !running) { running = true; raf = requestAnimationFrame(loop); } } });
})();
