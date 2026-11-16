/* ==========================================================================
   Támogatás-kereső (services.html#segito)
   Pár kérdésből megmondja, melyik támogatás vonatkozik a látogatóra, mekkora
   az összeg, mit kell csatolni, és hogyan igényelheti. Csak a nyilvános
   támogatási adatokból dolgozik (i18n: support.*, wiz.*). Nem küld semmit
   sehova, a válaszok csak a böngészőben léteznek.
   JS nélkül a szekció rejtve marad; a támogatások listája alatta úgyis látszik.
   ========================================================================== */
(function () {
  "use strict";
  const root = document.querySelector("[data-wizard]");
  if (!root || !window.VK) return;
  const { t, getLang } = window.VK;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICONS = {
    birth: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"/>',
    school: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5M9 7.5h7"/>',
    camp: '<path d="M2.5 20.5 12 4l9.5 16.5h-19Z"/><path d="m12 13.5-3.4 7M12 13.5l3.4 7"/>',
    funeral: '<path d="M9 10.5h6V21H9z"/><path d="M12 3c1.7 2.1 1.7 3.8 0 5.4-1.7-1.6-1.7-3.3 0-5.4Z"/><path d="M6 21h12"/>',
    sick: '<path d="M14 14.6V5a2 2 0 1 0-4 0v9.6a4 4 0 1 0 4 0Z"/><path d="M12 10v6"/>',
    emergency: '<path d="M12 3.5 2.5 20h19L12 3.5Z"/><path d="M12 10v4.5M12 17.3v.2"/>',
    travel: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>',
    loan: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6"/>',
    rest: '<circle cx="12" cy="9" r="3.6"/><path d="M12 2.5v1.2M5.6 5.1l.9.9M18.4 5.1l-.9.9M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/>'
  };
  const icon = (k) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[k] + "</svg>";

  /* ---------- Támogatások (a szabályzatok nyilvános adatai) ----------
     v: összeg Ft-ban (szám) vagy szöveges kulcs; per: szorzó (kids/nights);
     t: cím kulcsa; c: feltételek; p: csatolandó; how: igénylés módja.     */
  const SOCIAL = ["wiz.c.monthly"];
  const ITEMS = {
    birth: { v: 25000, per: "kids", t: "support.s1.t", c: ["wiz.c.birth.1"].concat(SOCIAL), p: "wiz.p.birth" },
    school: { v: 15000, per: "kids", t: "support.s2.t", c: ["wiz.c.school.1", "wiz.c.school.2", "wiz.c.either"].concat(SOCIAL) },
    camp: { v: 20000, per: "kids", t: "support.s3.t", c: ["wiz.c.camp.1", "wiz.c.either"].concat(SOCIAL), p: "wiz.p.camp" },
    funeralD: { v: 50000, t: "support.s4.t", c: ["wiz.c.funeral.1", "wiz.c.funeral.2"].concat(SOCIAL) },
    funeralC: { v: 20000, t: "support.s4.t", c: ["wiz.c.funeral.1", "wiz.c.funeral.2"].concat(SOCIAL) },
    sick: { v: 15000, from: true, t: "support.s5.t", c: ["wiz.c.sick.1", "wiz.c.sick.2", "wiz.c.sick.3"].concat(SOCIAL) },
    emergency: { v: 50000, upto: true, t: "support.s6.t", c: ["wiz.c.emergency.1"].concat(SOCIAL), p: "wiz.p.emergency" },
    travel: { v: "wiz.travel.v", t: "support.s7.t", c: ["wiz.c.travel.1", "wiz.c.travel.2"].concat(SOCIAL), p: "wiz.p.travel" },
    loan: { v: 60000, t: "support.s8.t", c: ["wiz.c.loan.1", "wiz.c.loan.2"], how: "wiz.r.how.loan" },
    r1: { v: 15000, t: "support.r1.t", c: ["wiz.c.r1.1", "wiz.c.rest.once"], how: "wiz.r.how.rest" },
    r2: { v: 5000, per: "nights", t: "support.r2.t", c: ["wiz.c.r2.1", "wiz.c.rest.once"], how: "wiz.r.how.rest" },
    r3: { v: 20000, t: "support.r3.t", c: ["wiz.c.r3.1", "wiz.c.rest.once"], how: "wiz.r.how.rest" },
    r4: { v: "wiz.wellness.v", t: "support.r4.t", c: ["wiz.c.r4.1"], how: "wiz.r.how.wellness" }
  };

  /* ---------- Kérdések ---------- */
  const Q = {
    what: { type: "choice", q: "wiz.q.what", grid: true,
      opts: ["birth", "school", "camp", "funeral", "sick", "emergency", "travel", "loan", "rest"].map((k) => ({ v: k, l: "wiz.o." + k, ico: k })) },
    kids: { type: "count", q: "wiz.q.kids", key: "kids", min: 1, max: 8, unit: "wiz.unit.kids" },
    relative: { type: "choice", q: "wiz.q.relative",
      opts: [{ v: "D", l: "wiz.o.direct", s: "wiz.o.direct.s" }, { v: "C", l: "wiz.o.collateral", s: "wiz.o.collateral.s" }] },
    rest: { type: "choice", q: "wiz.q.rest",
      opts: [1, 2, 3, 4].map((n) => ({ v: "r" + n, l: "support.r" + n + ".t", s: "support.r" + n + ".v" })) },
    nights: { type: "count", q: "wiz.q.nights", key: "nights", min: 1, max: 14, unit: "wiz.unit.nights" },
    company: { type: "choice", q: "wiz.q.company",
      opts: [{ v: "sanofi", l: "wiz.o.sanofi", s: "wiz.o.sanofi.s" }, { v: "euroapi", l: "wiz.o.euroapi" }, { v: "opella", l: "wiz.o.opella", s: "wiz.o.opella.s" }, { v: "other", l: "wiz.o.other" }] },
    member: { type: "choice", q: "wiz.q.member",
      opts: [{ v: "m3", l: "wiz.o.m3" }, { v: "new", l: "wiz.o.mnew" }, { v: "retired", l: "wiz.o.retired" }, { v: "none", l: "wiz.o.none" }] }
  };

  const fresh = () => ({ what: null, kids: 1, relative: null, rest: null, nights: 2, company: null, member: null });
  let S = fresh();
  let pos = 0;          // az aktuális kérdés indexe; flow().length = eredmény
  let lastDir = 1;

  function flow() {
    const f = ["what"];
    if (S.what === "birth" || S.what === "school" || S.what === "camp") f.push("kids");
    if (S.what === "funeral") f.push("relative");
    if (S.what === "rest") { f.push("rest"); if (S.rest === "r2") f.push("nights"); f.push("company"); }
    f.push("member");
    return f;
  }
  function itemId() {
    if (S.what === "funeral") return S.relative === "C" ? "funeralC" : "funeralD";
    if (S.what === "rest") return S.rest;
    return S.what;
  }
  function status() {
    const funeral = S.what === "funeral";
    if (S.what === "rest" && S.company === "other") return { k: "no", msg: "wiz.r.msg.other" };
    if (S.member === "retired" && !funeral) return { k: "no", msg: "wiz.r.msg.retired" };
    if (S.member === "none") return { k: "join", msg: funeral ? "wiz.r.msg.joinFuneral" : "wiz.r.msg.join", extra: S.what === "rest" && S.company === "opella" ? "wiz.r.msg.opella" : null };
    if (S.member === "new" && !funeral) return { k: "wait", msg: "wiz.r.msg.wait", extra: S.what === "rest" && S.company === "opella" ? "wiz.r.msg.opella" : null };
    if (S.what === "rest" && S.company === "opella") return { k: "check", msg: "wiz.r.msg.opella" };
    return { k: "ok" };
  }

  /* ---------- Formázás ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const fill = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => (k in o ? o[k] : ""));
  function money(n) {
    const en = getLang() === "en";
    const num = new Intl.NumberFormat(en ? "en-GB" : "hu-HU").format(n);
    return en ? "HUF " + num : num + " Ft";
  }
  function amountParts(it) {
    if (typeof it.v === "string") return { text: t(it.v), num: null };
    const mult = it.per ? S[it.per] : 1;
    const total = it.v * mult;
    const en = getLang() === "en";
    let pre = "", post = "";
    if (it.from) { if (en) pre = "from "; else post = "-tól"; }
    if (it.upto) pre = en ? "up to " : "max. ";
    return { num: total, pre, post, sub: it.per ? fill(t(it.per === "kids" ? "wiz.r.kids" : "wiz.r.nights"), { n: mult }) : "" };
  }

  /* ---------- Felépítés ---------- */
  root.innerHTML =
    '<div class="wz-top">' +
      '<button type="button" class="wz-back" data-wz-back><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg><span data-wz-t="wiz.back"></span></button>' +
      '<div class="wz-progress" aria-hidden="true"><i></i></div>' +
      '<span class="wz-count" data-wz-count></span>' +
    "</div>" +
    '<div class="wz-body" data-wz-body></div>' +
    '<p class="wz-live visually-hidden" aria-live="polite" data-wz-live></p>';
  const body = root.querySelector("[data-wz-body]");
  const back = root.querySelector("[data-wz-back]");
  const bar = root.querySelector(".wz-progress i");
  const count = root.querySelector("[data-wz-count]");
  const live = root.querySelector("[data-wz-live]");
  root.closest("section").hidden = false;

  function optHTML(o, id, i) {
    const on = S[id] === o.v;
    return '<button type="button" class="wz-opt' + (o.ico ? " wz-opt--ico" : "") + (on ? " is-on" : "") + '" aria-pressed="' + on + '" data-v="' + o.v + '" style="--i:' + i + '">' +
      (o.ico ? '<span class="wz-ico">' + icon(o.ico) + "</span>" : "") +
      '<span class="wz-opt-l">' + esc(t(o.l)) + (o.s ? "<small>" + esc(t(o.s)) + "</small>" : "") + "</span>" +
      '<span class="wz-tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>' +
    "</button>";
  }

  function questionHTML(id) {
    const q = Q[id];
    let h = '<h3 class="wz-q" tabindex="-1">' + esc(t(q.q)) + "</h3>";
    if (q.type === "choice") {
      h += '<div class="wz-opts' + (q.grid ? " wz-opts--grid" : "") + '" role="group" aria-label="' + esc(t(q.q)) + '">' + q.opts.map((o, i) => optHTML(o, id, i)).join("") + "</div>";
    } else {
      const v = S[q.key];
      h += '<div class="wz-count-row">' +
        '<div class="wz-stepper" role="group" aria-label="' + esc(t(q.q)) + '">' +
          '<button type="button" class="wz-step" data-d="-1" aria-label="' + esc(t("wiz.minus")) + '"' + (v <= q.min ? " disabled" : "") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 12h12"/></svg></button>' +
          '<output class="wz-val" aria-live="polite"><b>' + v + "</b><span>" + esc(t(q.unit)) + "</span></output>" +
          '<button type="button" class="wz-step" data-d="1" aria-label="' + esc(t("wiz.plus")) + '"' + (v >= q.max ? " disabled" : "") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 12h12M12 6v12"/></svg></button>' +
        "</div>" +
        '<p class="wz-preview"><span>' + esc(t("wiz.preview")) + "</span><b>" + esc(money(ITEMS[itemId()].v * v)) + "</b></p>" +
        '<button type="button" class="btn btn--volt wz-next" data-wz-next><span>' + esc(t("wiz.next")) + '</span><svg class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
      "</div>";
    }
    return h;
  }

  function resultHTML() {
    const it = ITEMS[itemId()];
    const st = status();
    const a = amountParts(it);
    const lockMsg = st.k === "no";
    let h = '<div class="wz-result wz-result--' + st.k + '">';
    h += '<div class="wz-res-head">' +
      '<span class="wz-badge">' + esc(t("wiz.r." + st.k)) + "</span>" +
      '<h3 class="wz-res-t" tabindex="-1">' + esc(t(it.t)) + "</h3>" +
      '<p class="wz-amount">' + (a.num != null
        ? (a.pre ? '<span class="wz-pre">' + esc(a.pre) + "</span>" : "") + '<b data-to="' + a.num + '" data-post="' + esc(a.post) + '">' + esc(money(reduce ? a.num : 0) + a.post) + "</b>"
        : "<b>" + esc(a.text) + "</b>") + "</p>" +
      (a.sub ? '<p class="wz-sub">' + esc(a.sub) + "</p>" : "") +
      (st.msg ? '<p class="wz-msg">' + esc(t(st.msg)) + (st.extra ? " " + esc(t(st.extra)) : "") + "</p>" : "") +
    "</div>";
    h += '<div class="wz-res-cols">';
    h += '<div class="wz-col"><h4>' + esc(t("wiz.r.conds")) + '</h4><ul class="wz-list">' + it.c.map((k) => "<li>" + esc(t(k)) + "</li>").join("") + "</ul>" +
      (it.p ? "<h4>" + esc(t("wiz.r.proof")) + '</h4><p class="wz-proof">' + esc(t(it.p)) + "</p>" : "") + "</div>";
    if (!lockMsg) {
      h += '<div class="wz-col"><h4>' + esc(t("wiz.r.how")) + "</h4>" + (it.how
        ? '<p class="wz-proof">' + esc(t(it.how)) + "</p>"
        : '<ol class="wz-how">' + [1, 2, 3].map((n) => "<li><span>" + n + "</span>" + esc(t("wiz.r.how." + n)) + "</li>").join("") + "</ol>") + "</div>";
    }
    h += "</div>";
    const arrow = '<svg class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    let cta = "";
    if (st.k === "join") cta = '<a class="btn btn--volt" href="join.html"><span>' + esc(t("wiz.r.join.cta")) + "</span>" + arrow + "</a>";
    else if (st.k === "no") cta = '<a class="btn btn--volt" href="#tamogatasok"><span>' + esc(t("wiz.r.all")) + "</span>" + arrow + "</a>" + '<a class="btn btn--line" href="contact.html"><span>' + esc(t("wiz.r.ask")) + "</span></a>";
    else cta = '<a class="btn btn--volt" href="login.html"><span>' + esc(t("wiz.r.forms")) + "</span>" + arrow + "</a>";
    h += '<div class="wz-cta">' + cta + '<button type="button" class="wz-restart" data-wz-restart><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>' + esc(t("wiz.restart")) + "</button></div>";
    h += '<p class="wz-note">' + esc(t("wiz.r.note")) + "</p>";
    return h + "</div>";
  }

  function countUp() {
    const b = body.querySelector("[data-to]");
    if (!b || reduce) return;
    const to = +b.dataset.to, t0 = performance.now(), dur = 900;
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      b.textContent = money(Math.round((to * e) / 100) * 100 || 0) + b.dataset.post;
      if (k < 1 && b.isConnected) requestAnimationFrame(step); else b.textContent = money(to) + b.dataset.post;
    })(t0);
  }

  function render(focus) {
    const f = flow();
    const done = pos >= f.length;
    const total = f.length;
    root.classList.toggle("is-result", done);
    root.querySelectorAll("[data-wz-t]").forEach((el) => (el.textContent = t(el.dataset.wzT)));
    back.hidden = pos === 0;
    bar.style.transform = "scaleX(" + (done ? 1 : pos / total) + ")";
    count.textContent = done ? "" : fill(t("wiz.count"), { i: pos + 1, n: total });
    body.innerHTML = done ? resultHTML() : questionHTML(f[pos]);
    body.classList.remove("wz-in", "wz-in--back");
    if (!reduce) { void body.offsetWidth; body.classList.add(lastDir < 0 ? "wz-in--back" : "wz-in"); }
    if (done) countUp();
    if (focus) {
      const h = body.querySelector("[tabindex='-1']");
      if (h) h.focus({ preventScroll: true });
      live.textContent = done ? t("wiz.r." + status().k) : count.textContent;
      const top = root.getBoundingClientRect().top;
      if (top < 70) window.scrollBy({ top: top - 100, behavior: reduce ? "auto" : "smooth" });
    }
  }

  function go(dir) {
    lastDir = dir;
    const f = flow();
    pos = Math.max(0, Math.min(f.length, pos + dir));
    render(true);
  }

  root.addEventListener("click", (e) => {
    const opt = e.target.closest(".wz-opt");
    if (opt) {
      const id = flow()[pos];
      const prev = S[id];
      S[id] = opt.dataset.v;
      // Ha a korábbi válasz más ágat nyitott, a későbbi válaszok elavultak.
      if (id === "what" && prev !== S.what) Object.assign(S, { relative: null, rest: null, company: null });
      if (id === "rest" && prev !== S.rest) S.company = null;
      body.querySelectorAll(".wz-opt").forEach((b) => { const on = b === opt; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on); });
      root.classList.add("is-busy");
      setTimeout(() => { root.classList.remove("is-busy"); go(1); }, reduce ? 0 : 260);
      return;
    }
    const step = e.target.closest(".wz-step");
    if (step) {
      const q = Q[flow()[pos]];
      S[q.key] = Math.max(q.min, Math.min(q.max, S[q.key] + +step.dataset.d));
      const out = body.querySelector(".wz-val b");
      out.textContent = S[q.key];
      body.querySelector(".wz-preview b").textContent = money(ITEMS[itemId()].v * S[q.key]);
      body.querySelectorAll(".wz-step").forEach((b) => (b.disabled = +b.dataset.d < 0 ? S[q.key] <= q.min : S[q.key] >= q.max));
      if (step.disabled) body.querySelector(".wz-step:not([disabled])").focus();
      return;
    }
    if (e.target.closest("[data-wz-next]")) return go(1);
    if (e.target.closest("[data-wz-back]")) return go(-1);
    if (e.target.closest("[data-wz-restart]")) { S = fresh(); pos = 0; lastDir = -1; return render(true); }
  });
  root.addEventListener("keydown", (e) => {
    if (root.classList.contains("is-busy")) return;
    const opts = Array.from(body.querySelectorAll(".wz-opt"));
    const i = opts.indexOf(document.activeElement);
    if (i < 0) return;
    const cols = getComputedStyle(body.querySelector(".wz-opts")).gridTemplateColumns.split(" ").length;
    const m = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (m) { e.preventDefault(); const n = opts[Math.max(0, Math.min(opts.length - 1, i + m))]; n.focus(); }
  });
  document.addEventListener("langchange", () => render(false));
  render(false);
})();
