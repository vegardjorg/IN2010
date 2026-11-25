/* ============================================================
   IN2010 guide · viz-hash.js  (Blokk 5 · Hashing)
   Liten visualiseringsmotor for hashtabeller. Klassisk script, ingen avhengigheter.

   IN.vizHash(stage, step, opts) tegner et steg. step = {
     parts: [
       { type: "probe", label, N, cells: [ {k, v?} | {tomb:true} | {ref:n} | null ],
         marks: { cur, found, fresh, hole, miss, home, keep, occ:[], moved:[] }, clusters: bool },
         (keep = husket slettet-merke p ved innsetting med merker: stiplet ramme + «p»-merke)
       { type: "chain", label, N, rows: [ [ {k, v} … ] | null ],
         marks: { row, miss, cur:[r, j], found:[r, j], fresh:[r, j], repl:[r, j], seen:[[r, j]…] } },
       { type: "entries", label, items: [ {k, v} ], marks: { cur, fresh, repl, found } },
       { type: "arr", label, items: [...], marks: { cur, done:[] } },
       { type: "map", label, pairs: [ [k, verdi] ], marks: { cur, best } },
       { type: "note", html }
     ],
     info: [ { label, html } ]          // f.eks. «h(13) = 13 mod 10 = 3», «Load factor 7/10»
   }
   Ren DOM (div/span), så den virker på file:// og krymper pent på smal skjerm.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  var el = IN.el;

  function has(a, x) { return Array.isArray(a) && a.indexOf(x) >= 0; }
  function same(p, r, j) { return Array.isArray(p) && p[0] === r && p[1] === j; }
  function txt(x) { return x == null ? "" : String(x); }

  /* Sammenhengende segmenter av opptatte plasser (rundt enden også). Returnerer {i: "start"|"mid"|"end"|"solo"} */
  function runs(cells) {
    var N = cells.length, out = {}, occ = function (i) { return cells[(i + N) % N] != null; };
    if (cells.every(function (c) { return c != null; })) { for (var a = 0; a < N; a++) out[a] = "mid"; return out; }
    for (var i = 0; i < N; i++) {
      if (!occ(i)) continue;
      var l = occ(i - 1), r = occ(i + 1);
      out[i] = l && r ? "mid" : l ? "end" : r ? "start" : "solo";
    }
    return out;
  }

  function probePart(p) {
    var m = p.marks || {}, N = p.N || p.cells.length;
    var wrap = el("div", { class: "hs-part" + (p.dim ? " dim" : "") });
    if (p.label) wrap.appendChild(el("div", { class: "hs-cap", html: p.label }));
    var row = el("div", { class: "hs-row" + (N > 12 ? " dense" : ""), role: "list", "aria-label": (p.label ? p.label.replace(/<[^>]+>/g, "") + ": " : "") + "array med " + N + " plasser" });
    row.style.setProperty("--n", N);
    var rr = p.clusters ? runs(p.cells) : {};
    for (var i = 0; i < N; i++) {
      var c = p.cells[i], cls = "hs-cell";
      var main = "", sub = "", aria;
      if (c == null) { cls += " empty"; main = "_"; aria = "plass " + i + ": tom"; }
      else if (c.tomb) { cls += " tomb"; main = "×"; aria = "plass " + i + ": merket som slettet"; }
      else if (c.ref != null) { main = txt(c.ref); aria = "plass " + i + ": peker til entries[" + c.ref + "]"; }
      else { main = txt(c.k); if (c.v != null) sub = txt(c.v); aria = "plass " + i + ": " + main + (sub ? " med verdi " + sub : ""); }
      if (m.home === i) cls += " is-home";
      if (has(m.occ, i)) cls += " is-occ";
      if (has(m.moved, i)) cls += " is-moved";
      if (m.cur === i) cls += " is-cur";
      if (m.fresh === i) cls += " is-fresh";
      if (m.found === i) cls += " is-found";
      if (m.hole === i) cls += " is-hole";
      if (m.miss === i) cls += " is-miss";
      if (m.keep === i) { cls += " is-keep"; aria += " (husket merke p)"; }
      if (rr[i]) cls += " run-" + rr[i];
      var cell = el("div", { class: cls, role: "listitem", "aria-label": aria });
      if (m.home === i) cell.appendChild(el("span", { class: "hs-homemark", "aria-hidden": "true", text: "h" }));
      if (m.keep === i) cell.appendChild(el("span", { class: "hs-keepmark", "aria-hidden": "true", text: "p" }));
      cell.appendChild(el("span", { class: "hs-k" + (main.length > 3 ? " sm" : ""), text: main }));
      if (sub) cell.appendChild(el("span", { class: "hs-v", text: sub }));
      cell.appendChild(el("span", { class: "hs-i", text: String(i) }));
      row.appendChild(cell);
    }
    wrap.appendChild(row);
    return wrap;
  }

  function pair(o) { return "(" + txt(o.k) + ", " + txt(o.v) + ")"; }

  function chainPart(p) {
    var m = p.marks || {}, N = p.N || p.rows.length;
    var wrap = el("div", { class: "hs-part" });
    if (p.label) wrap.appendChild(el("div", { class: "hs-cap", html: p.label }));
    var box = el("div", { class: "hs-chains", role: "list" });
    for (var r = 0; r < N; r++) {
      var B = p.rows[r], cls = "hs-crow";
      if (m.row === r) cls += " is-row";
      if (m.miss === r) cls += " is-miss";
      var line = el("div", { class: cls, role: "listitem" });
      line.appendChild(el("span", { class: "hs-ci", text: String(r) }));
      line.appendChild(el("span", { class: "hs-arrow", "aria-hidden": "true", text: "→" }));
      if (!B) line.appendChild(el("span", { class: "hs-null", text: "null" }));
      else if (!B.length) line.appendChild(el("span", { class: "hs-null", text: "[ ]" }));
      else B.forEach(function (o, j) {
        var c = "hs-node";
        if (Array.isArray(m.seen) && m.seen.some(function (s) { return s[0] === r && s[1] === j; })) c += " is-occ";
        if (same(m.cur, r, j)) c += " is-cur";
        if (same(m.found, r, j)) c += " is-found";
        if (same(m.fresh, r, j)) c += " is-fresh";
        if (same(m.repl, r, j)) c += " is-repl";
        if (j > 0) line.appendChild(el("span", { class: "hs-link", "aria-hidden": "true", text: "→" }));
        line.appendChild(el("span", { class: c, text: o.v != null ? pair(o) : txt(o.k) }));
      });
      box.appendChild(line);
    }
    wrap.appendChild(box);
    return wrap;
  }

  function entriesPart(p) {
    var m = p.marks || {};
    var wrap = el("div", { class: "hs-part" });
    if (p.label) wrap.appendChild(el("div", { class: "hs-cap", html: p.label }));
    var box = el("div", { class: "hs-entries", role: "list" });
    if (!p.items.length) box.appendChild(el("span", { class: "hs-null", text: "[ ] (tom)" }));
    p.items.forEach(function (o, j) {
      var c = "hs-entry";
      if (m.cur === j) c += " is-cur";
      if (m.found === j) c += " is-found";
      if (m.fresh === j) c += " is-fresh";
      if (m.repl === j) c += " is-repl";
      box.appendChild(el("div", { class: c, role: "listitem" }, [
        el("span", { class: "hs-ek", text: pair(o) }), el("span", { class: "hs-i", text: String(j) })
      ]));
    });
    wrap.appendChild(box);
    return wrap;
  }

  function arrPart(p) {
    var m = p.marks || {};
    var wrap = el("div", { class: "hs-part" });
    if (p.label) wrap.appendChild(el("div", { class: "hs-cap", html: p.label }));
    var box = el("div", { class: "hs-arr", role: "list" });
    p.items.forEach(function (x, i) {
      var c = "hs-acell";
      if (has(m.done, i)) c += " is-done";
      if (m.cur === i) c += " is-cur";
      box.appendChild(el("div", { class: c, role: "listitem" }, [el("span", { class: "hs-k", text: txt(x) }), el("span", { class: "hs-i", text: String(i) })]));
    });
    wrap.appendChild(box);
    return wrap;
  }

  function mapPart(p) {
    var m = p.marks || {};
    var wrap = el("div", { class: "hs-part" });
    if (p.label) wrap.appendChild(el("div", { class: "hs-cap", html: p.label }));
    var box = el("div", { class: "hs-map", role: "list" });
    if (!p.pairs.length) box.appendChild(el("span", { class: "hs-null", text: "{ } (tomt)" }));
    p.pairs.forEach(function (pr) {
      var c = "hs-chip";
      if (m.cur === pr[0]) c += " is-cur";
      if (m.best === pr[0]) c += " is-found";
      box.appendChild(el("span", { class: c, role: "listitem", text: txt(pr[0]) + " ↦ " + txt(pr[1]) }));
    });
    wrap.appendChild(box);
    return wrap;
  }

  var PARTS = { probe: probePart, chain: chainPart, entries: entriesPart, arr: arrPart, map: mapPart };

  /* Prikken i variabellinja får fargen til cella/bøtta/noden variabelen peker på.
     v.idx = plass (probe/arr/entries) eller bøtte (chain), v.at = [r, j] for en node i bøtte r,
     v.part = hvilken del av steget (standard 0). Leser klassene fra den ferdig tegnede cella. */
  var DOT = [["is-cur", "compare"], ["is-row", "compare"], ["is-found", "target"], ["is-fresh", "min"], ["is-moved", "min"],
    ["is-repl", "min"], ["is-hole", "swap"], ["is-miss", "swap"], ["is-occ", "occ"], ["is-done", "sorted"]];
  function dotOf(partEls, v) {
    var pe = partEls[v.part || 0];
    if (!pe) return null;
    var cell = null;
    if (v.at) {
      var row = pe.querySelectorAll(".hs-crow")[v.at[0]];
      cell = row ? row.querySelectorAll(".hs-node")[v.at[1]] : null;
    } else {
      var cells = pe.querySelectorAll(".hs-cell, .hs-crow, .hs-acell, .hs-entry");
      cell = cells[v.idx];
    }
    if (!cell) return null;
    for (var z = 0; z < DOT.length; z++) if (cell.classList.contains(DOT[z][0])) return DOT[z][1];
    return "default";
  }

  IN.vizHash = function (stage, step, opts) {
    opts = opts || {};
    step = step || {};
    var vl = !opts.compact && step.vars && IN.varLine ? IN.varLine.attach(stage) : null;
    var v = el("div", { class: "hs-viz" + (opts.compact ? " compact" : "") });
    var partEls = [];
    (step.parts || []).forEach(function (p) {
      if (p.type === "note") { var nt = el("div", { class: "hs-note small", html: p.html }); v.appendChild(nt); partEls.push(nt); return; }
      var f = PARTS[p.type]; var pe = f ? f(p) : null; partEls.push(pe); if (pe) v.appendChild(pe);
    });
    if (step.info && step.info.length) {
      var inf = el("div", { class: "hs-info" });
      step.info.forEach(function (r) {
        inf.appendChild(el("span", { class: "hs-pill" }, [el("span", { class: "lbl", text: r.label }), el("span", { class: "val", html: r.html })]));
      });
      v.appendChild(inf);
    }
    if (vl) {
      IN.varLine.clearStage(stage);
      stage.appendChild(v);
      vl.update(step.vars, step.varsPrev, { frame: step.frame, dot: function (x) { return dotOf(partEls, x); } });
    } else {
      if (IN.varLine && !opts.compact) IN.varLine.detach(stage);
      IN.clear(stage);
      stage.appendChild(v);
    }
    return v;
  };
})();
