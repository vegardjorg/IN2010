/* ============================================================
   IN2010 guide · viz-list.js  (Lister & stakk)
   Tegner steg fra data-lister.js: arrays (dynamisk array), lenkede
   noder (enkelt/dobbelt, med eller uten feltene next/prev), stakk,
   kø, en rad med tagger og små hashmap-«chips».
   IN.vizList(host, step, opts)   step = { parts:[…], info:[{label, html}] }
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  var el = IN.el, clear = IN.clear;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function has(list, x) { return Array.isArray(list) ? list.indexOf(x) >= 0 : list === x; }
  function cap(p, box) { if (p.label) box.appendChild(el("p", { class: "ls-cap", html: p.label })); }

  /* ---------- Array: celler 0..|A|−1, de første n er i bruk ---------- */
  function drawArray(p) {
    var box = el("div", { class: "ls-part" + (p.dim ? " dim" : "") }); cap(p, box);
    var row = el("div", { class: "ls-arr", role: "list" });
    var m = p.marks || {}, ptrs = p.ptrs || {}, n = p.n == null ? p.cells.length : p.n;
    p.cells.forEach(function (v, i) {
      var cls = "ls-cell";
      if (i >= n) cls += " free"; else cls += " occ";
      if (has(m.cur, i)) cls += " is-cur";
      if (has(m.fresh, i)) cls += " is-fresh";
      if (has(m.moved, i)) cls += " is-moved";
      if (has(m.hole, i)) cls += " is-hole";
      var c = el("div", { class: cls, role: "listitem" });
      c.appendChild(el("span", { class: "ls-v", text: v == null ? "–" : String(v) }));
      c.appendChild(el("span", { class: "ls-i", text: String(i) }));
      if (ptrs[i]) c.appendChild(el("span", { class: "ls-ptr", text: ptrs[i] }));
      row.appendChild(c);
    });
    if (!p.cells.length) row.appendChild(el("span", { class: "ls-null", text: "(tomt)" }));
    box.appendChild(row);
    return box;
  }

  /* ---------- Lenkede noder ----------
     nodes: [{ id, v, next, prev, sentinel, fresh, gone, cur, found }] i radrekkefølge.
     fields: vis next/prev som tekst i boksen (pekerne kan da være «midt i» en endring).
     ptrs: { id: "it" | ["v","u"] }, hl: { id: "next" | "prev" | ["next","prev"] } */
  function drawLinked(p) {
    var box = el("div", { class: "ls-part" + (p.dim ? " dim" : "") }); cap(p, box);
    var row = el("div", { class: "ls-chain" + (p.fields ? " fields" : ""), role: "list" });
    var byId = {}; p.nodes.forEach(function (nd) { byId[nd.id] = nd; });
    function name(id) { if (id == null) return "null"; var t = byId[id]; return t ? (t.sentinel ? t.v : String(t.v)) : "?"; }
    var ptrs = p.ptrs || {}, hl = p.hl || {};
    if (p.first && !p.nodes.length) row.appendChild(el("span", { class: "ls-null", text: p.first + " = null (tom liste)" }));
    p.nodes.forEach(function (nd, k) {
      var cls = "ls-node";
      if (nd.sentinel) cls += " sentinel";
      if (nd.fresh) cls += " is-fresh";
      if (nd.cur) cls += " is-cur";
      if (nd.found) cls += " is-found";
      if (nd.gone) cls += " gone";
      var b = el("div", { class: cls, role: "listitem", "data-id": nd.id });
      var pl = ptrs[nd.id]; if (p.first && k === 0 && !nd.sentinel) pl = [p.first].concat(pl ? [].concat(pl) : []);
      if (pl) b.appendChild(el("span", { class: "ls-ptr", text: [].concat(pl).join(", ") }));
      b.appendChild(el("span", { class: "ls-elem", text: nd.sentinel ? nd.v : String(nd.v) }));
      if (p.fields) {
        var f = el("span", { class: "ls-fields" });
        if (p.double) f.appendChild(el("span", { class: "ls-f" + (has(hl[nd.id], "prev") ? " hl" : ""), text: "prev: " + name(nd.prev) }));
        f.appendChild(el("span", { class: "ls-f" + (has(hl[nd.id], "next") ? " hl" : ""), text: "next: " + name(nd.next) }));
        b.appendChild(f);
      }
      row.appendChild(b);
      var nx = p.nodes[k + 1];
      if (nx) {
        var fw = nd.next === nx.id, bw = p.double && nx.prev === nd.id, sym = fw && bw ? "⇄" : fw ? "→" : bw ? "←" : "";
        row.appendChild(el("span", { class: "ls-link" + (sym ? "" : " broken"), "aria-hidden": "true", text: sym || "·" }));
      } else if (!p.double && !nd.sentinel) {
        row.appendChild(el("span", { class: "ls-link", "aria-hidden": "true", text: nd.next == null ? "→ null" : "" }));
      }
    });
    box.appendChild(row);
    return box;
  }

  /* ---------- Stakk: items fra bunn til topp, toppen tegnes øverst ---------- */
  function drawStack(p) {
    var box = el("div", { class: "ls-part ls-stackpart" }); cap(p, box);
    var wrap = el("div", { class: "ls-stackwrap" });
    var col = el("div", { class: "ls-stack", role: "list", "aria-label": "Stakk, toppen øverst" });
    var items = p.items || [], m = p.mark || {};
    if (!items.length) col.appendChild(el("span", { class: "ls-null", text: "(tom)" }));
    for (var i = items.length - 1; i >= 0; i--) {
      var top = i === items.length - 1, cls = "ls-sitem";
      if (top && m.top) cls += " is-" + m.top;
      var it = el("div", { class: cls, role: "listitem" }, [el("span", { class: "ls-v", text: String(items[i]) })]);
      if (top) it.appendChild(el("span", { class: "ls-toplbl", text: "← topp" }));
      col.appendChild(it);
    }
    wrap.appendChild(col);
    if (p.out != null) wrap.appendChild(el("div", { class: "ls-out" + (p.outBad ? " bad" : "") }, [el("span", { class: "lbl", text: p.outLabel || "tatt ut" }), el("span", { class: "ls-v", text: String(p.out) })]));
    box.appendChild(wrap);
    return box;
  }

  /* ---------- Kø: forrest til venstre, bakerst til høyre ---------- */
  function drawQueue(p) {
    var box = el("div", { class: "ls-part" }); cap(p, box);
    var row = el("div", { class: "ls-queue", role: "list", "aria-label": "Kø, forrest til venstre" });
    var items = p.items || [], m = p.mark || {};
    if (!items.length) row.appendChild(el("span", { class: "ls-null", text: "(tom)" }));
    items.forEach(function (v, i) {
      var cls = "ls-qitem";
      if (i === items.length - 1 && m.back) cls += " is-" + m.back;
      var it = el("div", { class: cls, role: "listitem" }, [el("span", { class: "ls-v", text: String(v) })]);
      if (i === 0) it.appendChild(el("span", { class: "ls-ptr", text: "forrest" }));
      if (i === items.length - 1) it.appendChild(el("span", { class: "ls-ptr below", text: "bakerst" }));
      row.appendChild(it);
    });
    var wrap = el("div", { class: "ls-stackwrap" }, [row]);
    if (p.out != null) wrap.appendChild(el("div", { class: "ls-out" }, [el("span", { class: "lbl", text: p.outLabel || "tatt ut" }), el("span", { class: "ls-v", text: String(p.out) })]));
    box.appendChild(wrap);
    return box;
  }

  /* ---------- Tagger (input-arrayet A) ---------- */
  function drawTags(p) {
    var box = el("div", { class: "ls-part" }); cap(p, box);
    var row = el("div", { class: "ls-tags", role: "list" });
    (p.items || []).forEach(function (tg, i) {
      var cls = "ls-tag" + (/^<\//.test(tg) ? " close" : " open");
      if (i === p.cur) cls += p.bad ? " is-bad" : " is-cur";
      else if (p.cur != null && i < p.cur) cls += " done";
      else if (p.cur == null && p.allDone) cls += " done";
      row.appendChild(el("span", { class: cls, role: "listitem" }, [el("span", { text: tg }), el("span", { class: "ls-i", text: String(i) })]));
    });
    box.appendChild(row);
    return box;
  }

  /* ---------- Hashmap som chips: nøkkel ↦ verdi ---------- */
  function drawMap(p) {
    var box = el("div", { class: "ls-part" }); cap(p, box);
    var row = el("div", { class: "ls-map" });
    if (!(p.entries || []).length) row.appendChild(el("span", { class: "ls-null", text: "(tomt)" }));
    (p.entries || []).forEach(function (e) {
      var cls = "ls-chip";
      if (e[0] === p.cur) cls += " is-cur";
      if (e[0] === p.fresh) cls += " is-fresh";
      if (e[0] === p.gone) cls += " gone";
      row.appendChild(el("span", { class: cls, html: esc(e[0]) + " ↦ " + esc(e[1]) }));
    });
    box.appendChild(row);
    return box;
  }

  var DRAW = { array: drawArray, linked: drawLinked, stack: drawStack, queue: drawQueue, tags: drawTags, map: drawMap };

  /* Prikken i variabellinja får fargen til cella/noden/taggen variabelen peker på.
     v.idx = plass (array, tagger) eller node-id (lenkede noder), v.part = hvilken del (standard 0). */
  var DOT = [["is-bad", "swap"], ["is-hole", "swap"], ["is-cur", "compare"], ["is-found", "target"], ["is-fresh", "min"],
    ["is-moved", "min"], ["gone", "stale"], ["done", "sorted"]];
  function dotOf(partEls, v) {
    var pe = partEls[v.part || 0];
    if (!pe) return null;
    var cell = null;
    if (typeof v.idx === "string") {
      var all = pe.querySelectorAll(".ls-node");
      for (var z = 0; z < all.length; z++) if (all[z].getAttribute("data-id") === v.idx) { cell = all[z]; break; }
    } else cell = pe.querySelectorAll(".ls-cell, .ls-tag")[v.idx];
    if (!cell) return null;
    for (var k = 0; k < DOT.length; k++) if (cell.classList.contains(DOT[k][0])) return DOT[k][1];
    return "default";
  }

  IN.vizList = function (host, step, opts) {
    if (typeof host === "string") host = IN.qs(host);
    opts = opts || {};
    var vl = !opts.compact && step && step.vars && IN.varLine ? IN.varLine.attach(host) : null;
    if (vl) IN.varLine.clearStage(host);
    else { if (IN.varLine && !opts.compact) IN.varLine.detach(host); clear(host); }
    var v = el("div", { class: "ls-viz" + (opts.compact ? " compact" : "") + (step && step.side ? " side" : "") });
    var partEls = [];
    ((step && step.parts) || []).forEach(function (p) { var f = DRAW[p.type]; var pe = f ? f(p) : null; partEls.push(pe); if (pe) v.appendChild(pe); });
    if (step && step.info && step.info.length) {
      var inf = el("div", { class: "hs-info ls-info" });
      step.info.forEach(function (r) {
        inf.appendChild(el("span", { class: "hs-pill" + (r.bad ? " ls-bad" : "") }, [el("span", { class: "lbl", text: r.label }), el("span", { class: "val", html: r.html })]));
      });
      v.appendChild(inf);
    }
    host.appendChild(v);
    if (vl) vl.update(step.vars, step.varsPrev, { frame: step.frame, dot: function (x) { return dotOf(partEls, x); } });
    return v;
  };
  IN.vizList.esc = esc;
})();
