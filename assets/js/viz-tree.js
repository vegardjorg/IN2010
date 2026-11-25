/* ============================================================
   IN2010 guide · viz-tree.js
   Felles trevisualisering (SVG) for binærtrær, søketrær, AVL,
   Huffman, prefikstrær og generelle trær. Flyttet ut av
   04-traer.html, slik at eksamenskort (IN.mountExamDemo, motor
   «tree») og andre sider kan bruke den. Klassisk script.

   IN.vizTree(stage, step, opts)
     step: { tree | forest, marks:{cur,alt,found,fresh,rot[],warn[],del[],done[],path[],queued[],sub[],dim[]},
             (dim = tonet ned, f.eks. et subtre som hoppes over; kanter til en nedtonet node tones også ned)
             lab:{id:tekst}, sup:{id:tekst}, edges:[[a,b]], bits, info:[{label,items,kind}], counter }
     info.kind: "queue" | "stack" (brikker) | "frames" (kallstakk med rammer {name, note, ret}, bunn → topp)
     Noder: binære { id, k, l, r } eller generelle { id, k, ch: [...] }.
     opts: { onNode(id), ariaLabel }
     step.vars / varsPrev / frame: variabellinja (varline.js) øverst i scenen, bare når steget har vars.
   IN.vizTree.infoRow(row) / IN.vizTree.framesRow(row): panelradene under treet.
   Animerer flytting av noder mellom to kall på samme stage (stage.__tvPos).
   Lastes etter core.js.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  var el = IN.el, qsa = IN.qsa;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Fast høyde i stegdemoene (felles for viz-tree.js og data-heap.js; den som lastes først, definerer) ----------
     Demoen skal ikke hoppe opp og ned når man blar. Generatorene setter step.__all = hele steglista (linkVars).
     IN.vlReserve(stage, step, draw): første gang en ny steglista vises (og når bredden eller variabel-bryteren endres),
     tegnes alle stegene én gang i scenen og den største høyden settes som min-height. Så tegnes det aktuelle steget igjen.
     IN.vlPaint(stage, step, dot): variabellinja. Steg uten vars i en demo som ellers har dem, får en tom linje
     med samme høyde (variablene fra nærmeste steg med vars, usynlige), så innholdet under ikke flytter seg. */
  if (!IN.vlReserve) (function () {
    var stages = [];
    function measure(stage) {
      var cur = stage.__resCur;
      if (!cur || !cur.s || !cur.s.__all || !stage.isConnected) return;
      var all = cur.s.__all, pos0 = stage.__tvPos, max = 0;
      stage.__resBusy = true;
      try {
        stage.style.minHeight = "";
        for (var z = 0; z < all.length; z++) {
          stage.__tvPos = null;
          cur.draw(all[z]);
          if (stage.__tvRaf) { cancelAnimationFrame(stage.__tvRaf); stage.__tvRaf = 0; }
          max = Math.max(max, stage.offsetHeight);
        }
      } finally {
        stage.__tvPos = pos0;
        stage.__resBusy = false;
      }
      stage.__resAll = all;
      stage.__resW = stage.clientWidth;
      stage.__resOn = IN.varLine ? IN.varLine.isOn() : true;
      if (max > 0) stage.style.minHeight = max + "px";
      cur.draw(cur.s);
    }
    var RO = typeof ResizeObserver === "function" ? new ResizeObserver(function (es) {
      es.forEach(function (e) {
        var st = e.target;
        if (!st.isConnected) { RO.unobserve(st); return; }
        if (st.__resBusy || st.clientWidth === st.__resW) return;
        measure(st);
      });
    }) : null;
    // Variabel-bryteren endrer høyden på linja (og skjuler spennene): mål på nytt i alle åpne demoer
    function remeasureAll() {
      stages = stages.filter(function (st) { return st.isConnected; });
      var on = IN.varLine ? IN.varLine.isOn() : true;
      stages.forEach(function (st) { if (st.__resOn !== on) measure(st); });
    }
    document.addEventListener("click", function (e) {
      if (e.target && e.target.closest && e.target.closest(".vl-tog")) setTimeout(remeasureAll, 0);
    });
    window.addEventListener("storage", function (e) { if (e.key === "in2010:vis-variabler") setTimeout(remeasureAll, 0); });
    if (!RO) window.addEventListener("resize", function () {
      stages.forEach(function (st) { if (st.isConnected && st.clientWidth !== st.__resW) measure(st); });
    });
    IN.vlReserve = function (stage, s, draw) {
      if (stage.__resBusy || !s || !s.__all) return;
      stage.__resCur = { s: s, draw: draw };
      if (stages.indexOf(stage) < 0) { stages.push(stage); if (RO) RO.observe(stage); }
      var on = IN.varLine ? IN.varLine.isOn() : true;
      if (stage.__resAll === s.__all && stage.__resW === stage.clientWidth && stage.__resOn === on) return;
      measure(stage);
    };
    function refStep(s) {
      var all = s.__all;
      if (!all) return null;
      var i = all.indexOf(s), z;
      if (i < 0) i = 0;
      for (z = i; z < all.length; z++) if (all[z].vars) return all[z];
      for (z = i - 1; z >= 0; z--) if (all[z].vars) return all[z];
      return null;
    }
    IN.vlPaint = function (stage, s, dot) {
      if (!IN.varLine) return null;
      var src = s.vars ? s : refStep(s);
      if (!src) { IN.varLine.detach(stage); return null; }
      var vl = IN.varLine.attach(stage);
      vl.update(src.vars, s.vars ? s.varsPrev : null, { frame: src.frame, dot: s.vars ? dot : null });
      vl.el.classList.toggle("is-ghost", !s.vars);
      return vl;
    };
    /* Navnene på alle løkkespenn i demoen, i rekkefølge: én fast rad per løkkevariabel */
    IN.vlRangeNames = function (s) {
      var names = [];
      (s.__all || [s]).forEach(function (st) { (st.ranges || []).forEach(function (r) { if (names.indexOf(r.name) < 0) names.push(r.name); }); });
      return names;
    };
  })();

  var R = 16, DX = 44, PADX = 24;
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function layout(s) {
    var roots = s.forest ? s.forest : (s.tree ? [s.tree] : []);
    var pos = {}, nodes = [], edges = [], x = 0, maxY = 0;
    roots.forEach(function (r, ri) {
      if (!r) return;
      if (ri > 0) x += 0.5;
      if (r.ch) {
        (function w(v, d) {
          nodes.push(v); maxY = Math.max(maxY, d);
          if (!v.ch.length) { pos[v.id] = { x: x++, y: d }; return; }
          v.ch.forEach(function (c) { edges.push({ a: v.id, b: c.id }); w(c, d + 1); });
          pos[v.id] = { x: (pos[v.ch[0].id].x + pos[v.ch[v.ch.length - 1].id].x) / 2, y: d };
        })(r, 0);
      } else {
        (function w(v, d) {
          if (!v) return;
          maxY = Math.max(maxY, d);
          if (v.l) { edges.push({ a: v.id, b: v.l.id, bit: "0" }); w(v.l, d + 1); }
          pos[v.id] = { x: x++, y: d }; nodes.push(v);
          if (v.r) { edges.push({ a: v.id, b: v.r.id, bit: "1" }); w(v.r, d + 1); }
        })(r, 0);
      }
    });
    return { pos: pos, nodes: nodes, edges: edges, w: Math.max(1, x), h: maxY + 1 };
  }
  function inA(a, id) { return Array.isArray(a) ? a.indexOf(id) >= 0 : a === id; }
  function svgString(L, s, pos, opts, W, H, DY, TOP) {
    var m = s.marks || {}, lab = s.lab || {}, sup = s.sup || {};
    var hot = {};
    (s.edges || []).forEach(function (e) { hot[e[0] + ">" + e[1]] = 1; hot[e[1] + ">" + e[0]] = 1; });
    function X(id) { return PADX + pos[id].x * DX; }
    function Y(id) { return TOP + pos[id].y * DY; }
    var out = '<svg class="tv-svg" viewBox="0 0 ' + W + " " + H + '" style="max-width:' + Math.max(W, 160) * 1.25 + 'px" role="img" aria-label="' + esc(opts.ariaLabel || ariaOf(L)) + '">';
    if (!L.nodes.length) out += '<text class="tv-empty" x="' + W / 2 + '" y="' + (TOP + 4) + '" text-anchor="middle">(tomt tre)</text>';
    L.edges.forEach(function (e) {
      if (!pos[e.a] || !pos[e.b]) return;
      var c = "tv-edge";
      if (hot[e.a + ">" + e.b]) c += " hot";
      else if (inA(m.path, e.a) && inA(m.path, e.b)) c += " on";
      else if (inA(m.dim, e.a) || inA(m.dim, e.b)) c += " dim";
      out += '<line class="' + c + '" x1="' + X(e.a) + '" y1="' + Y(e.a) + '" x2="' + X(e.b) + '" y2="' + Y(e.b) + '"/>';
      if (s.bits && e.bit) {
        var mx = (X(e.a) + X(e.b)) / 2, my = (Y(e.a) + Y(e.b)) / 2;
        out += '<text class="tv-bit" x="' + (mx + (e.bit === "0" ? -9 : 9)) + '" y="' + (my - 3) + '" text-anchor="middle">' + e.bit + "</text>";
      }
    });
    L.nodes.forEach(function (v) {
      if (!pos[v.id]) return;
      var c = "tv-node";
      if (inA(m.done, v.id)) c += " is-done";
      if (inA(m.queued, v.id)) c += " is-queued";
      if (inA(m.sub, v.id)) c += " is-sub";
      if (inA(m.path, v.id)) c += " is-path";
      if (inA(m.alt, v.id)) c += " is-alt";
      if (inA(m.del, v.id)) c += " is-del";
      if (m.cur === v.id) c += " is-cur";
      if (m.fresh === v.id) c += " is-fresh";
      if (m.found === v.id) c += " is-found";
      if (inA(m.rot, v.id)) c += " is-rot";
      if (inA(m.warn, v.id)) c += " is-warn";
      if (inA(m.dim, v.id)) c += " is-dim";
      var x = X(v.id), y = Y(v.id), txt = String(v.k);
      if (opts.onNode) c += " click";
      out += '<g class="' + c + '" data-id="' + esc(v.id) + '"' + (opts.onNode ? ' tabindex="0" role="button" aria-label="Node ' + esc(txt) + '"' : "") + ">" +
        '<circle cx="' + x + '" cy="' + y + '" r="' + R + '"/>' +
        '<text class="k' + (txt.length > 2 ? " sm" : "") + '" x="' + x + '" y="' + y + '" text-anchor="middle">' + esc(txt) + "</text></g>";
      if (sup[v.id] != null) out += '<text class="tv-sup" x="' + (x + R + 2) + '" y="' + (y - R + 3) + '">' + esc(sup[v.id]) + "</text>";
      if (lab[v.id] != null) out += '<text class="tv-lab" x="' + x + '" y="' + (y + R + 13) + '" text-anchor="middle">' + esc(lab[v.id]) + "</text>";
    });
    return out + "</svg>";
  }
  /* Prikkfargen til en nodepeker i variabellinja: samme tilstand som noden er tegnet med
     (samme rekkefølge som CSS-reglene for .tv-node). Noden finnes ikke i tegningen: ingen prikk. */
  function dotOf(L, m, id) {
    if (id == null || !L.pos[id]) return null;
    if (inA(m.rot, id) || inA(m.warn, id)) return "swap";
    if (m.found === id) return "target";
    if (m.fresh === id) return "min";
    if (m.cur === id) return "compare";
    if (inA(m.done, id)) return "sorted";
    if (inA(m.alt, id)) return "alt";
    if (inA(m.del, id)) return "del";
    if (inA(m.path, id) || inA(m.sub, id)) return "seen";
    if (inA(m.queued, id)) return "queued";
    if (inA(m.dim, id)) return "stale";
    return "default";
  }
  function ariaOf(L) { return L.nodes.length ? "Tre med " + L.nodes.length + " noder" : "Tomt tre"; }
  // Kallstakk som rammer (som n!-demoen i 00-begreper): items er bunn → topp, toppen tegnes øverst.
  function framesRow(row) {
    var items = row.items || [], stack = el("div", { class: "callstack tv-frames" });
    items.forEach(function (f, i) {
      var top = i === items.length - 1;
      stack.appendChild(el("div", { class: "frame" + (f.ret ? " ret" : "") + (top ? " top" : ""),
        html: '<span class="mono cs-name">' + esc(f.name) + '</span><span class="cs-body small">' + esc(f.note || "") + "</span>" }));
    });
    if (!items.length) stack.appendChild(el("div", { class: "tv-none small", text: "(tom – ingen kall er i gang)" }));
    return el("div", { class: "cs-wrap tv-cs", role: "group", "aria-label": row.label + ", " + items.length + " rammer" }, [
      el("div", { class: "tv-cs-head small" }, [el("b", { text: row.label }), el("span", { class: "muted", text: " · ↑ toppen: kallet som jobber nå" })]),
      stack,
      el("div", { class: "cs-end muted small", text: "bunnen: første kall" })
    ]);
  }
  function infoRow(row) {
    if (row.kind === "frames") return framesRow(row);
    var d = el("div", { class: "tv-info" });
    d.appendChild(el("span", { class: "lbl", text: row.label + ":" }));
    if (!row.items || !row.items.length) d.appendChild(el("span", { class: "tv-none", text: row.kind === "queue" ? "tom kø" : row.kind === "stack" ? "tom" : "ingen ennå" }));
    else row.items.forEach(function (it, i) {
      d.appendChild(el("span", { class: "tv-chip" + ((row.kind === "queue" && i === 0) || (row.kind === "stack" && i === row.items.length - 1) ? " first" : ""), text: String(it) }));
    });
    return d;
  }
  function vizTree(stage, s, opts) {
    opts = opts || {}; s = s || {};
    var L = layout(s);
    var hasLab = s.lab && Object.keys(s.lab).length;
    var DY = hasLab ? 64 : 54, TOP = R + 10;
    var prev = stage.__tvPos;
    var maxX = L.w - 1;
    if (prev) Object.keys(L.pos).forEach(function (id) { if (prev[id]) maxX = Math.max(maxX, prev[id].x); });
    var W = PADX * 2 + maxX * DX, H = TOP + (L.h - 1) * DY + R + (hasLab ? 22 : 10);
    if (stage.__tvRaf) { cancelAnimationFrame(stage.__tvRaf); stage.__tvRaf = 0; }
    stage.__tvPos = L.pos;

    var wrap = el("div", { class: "tv" });
    if (s.counter) wrap.appendChild(el("div", { class: "tv-counter", text: s.counter }));
    var svgHost = el("div");
    wrap.appendChild(svgHost);
    (s.info || []).forEach(function (row) { wrap.appendChild(infoRow(row)); });
    // Variabellinja (varline.js): s.vars = [{ name, value, idx }], idx = node-id-en prikken henter farge fra
    var m = s.marks || {};
    if (IN.vlPaint(stage, s, function (v) { return dotOf(L, m, v.idx); })) IN.varLine.clearStage(stage);
    else IN.clear(stage);
    stage.appendChild(wrap);
    // Fast høyde gjennom hele demoen (måles etter at treet er tegnet)
    function reserve() { IN.vlReserve(stage, s, function (st) { vizTree(stage, st, opts); }); }

    function draw(pos, final) {
      svgHost.innerHTML = svgString(L, s, pos, opts, W, H, DY, TOP);
      if (final && opts.onNode) qsa("g[data-id]", svgHost).forEach(function (g) {
        var id = g.getAttribute("data-id");
        g.addEventListener("click", function () { opts.onNode(id); });
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); opts.onNode(id); } });
      });
    }
    var moved = false;
    if (prev && !REDUCE) Object.keys(L.pos).forEach(function (id) { var p = prev[id]; if (p && (p.x !== L.pos[id].x || p.y !== L.pos[id].y)) moved = true; });
    if (!moved) { draw(L.pos, true); reserve(); return; }
    var t0 = null, DUR = 420;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var u = Math.min(1, (ts - t0) / DUR), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, pos = {};
      Object.keys(L.pos).forEach(function (id) {
        var a = prev[id] || L.pos[id], b = L.pos[id];
        pos[id] = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
      });
      draw(pos, u >= 1);
      stage.__tvRaf = u < 1 ? requestAnimationFrame(frame) : 0;
    }
    draw((function () { var p = {}; Object.keys(L.pos).forEach(function (id) { p[id] = prev[id] || L.pos[id]; }); return p; })(), false);
    stage.__tvRaf = requestAnimationFrame(frame);
    reserve();
  }
  vizTree.infoRow = infoRow;
  // Prikkfargen til en nodepeker (for sider som tegner treet i et underelement, f.eks. renderIter i 04)
  vizTree.dot = function (s, id) { return dotOf(layout(s || {}), (s && s.marks) || {}, id); };
  vizTree.framesRow = framesRow;
  IN.vizTree = vizTree;
})();
