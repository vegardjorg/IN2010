/* ============================================================
   IN2010 guide · viz-graph.js
   Grafvisualisering i ren SVG: faste nodeposisjoner, rettet eller urettet,
   valgfrie vekter, markering av noder og kanter per steg, og et sidepanel
   med kø / stakk / mengder og en liten tabell (f.eks. dist). Klassisk script.
   Måler aldri DOM-en, så den kan tegne i en vert som ikke er montert ennå
   (eksamensfigurer via IN.oppg).

   IN.vizGraph(stage, step, opts)
   step: {
     g: { nodes: [{ id, x, y, label?, lp?, w? }], // label "" = umerket node; lp: "t"|"b"|"l"|"r" (plassering for lab);
                                                  // w = bredde → noden tegnes som boks (lange etiketter)
          edges: [[u, v, w?, o?]],                 // o: { bend, t } – bøy kurven / flytt vekten langs kanten
          directed: bool },
     nodes?: { id: "cur"|"seen"|"queued"|"done"|"warn"|"src"|"dim" },
     comp?:  { id: k },                            // komponentfarge k = 0, 1, 2 …
     edges?: { "u>v": "tree"|"hot"|"back"|"dim"|"cand"|"done" },  // urettet: begge retninger godtas
     lab?:   { id: tekst },                        // liten etikett ved noden (dist, nummer …)
     panel?: [{ label, items: [tekst], kind?: "queue"|"stack"|"set", first?: bool }],
     table?: { head: [tekst], rows: [[tekst]], hi?: kolonneindeks, cap? },
     note?:  html
   }
   opts: { scale: tall (fast målestokk: bredde = viewBox-bredde · scale px),
           ariaLabel, weights: false (skjul vekter), R: radius }
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  var el = IN.el, clear = IN.clear;
  var NS = "http://www.w3.org/2000/svg";

  function S(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  // Urettet graf: nøkkelen kan stå begge veier. Har begge retninger en tilstand, vinner den
  // sterkeste, så kanten vi sjekker nå (hot) eller sykelkanten (back) aldri skjules av en trekant.
  var RANK = { hot: 6, back: 5, cand: 4, tree: 3, done: 3, dim: 1 };
  function edgeState(map, u, v, directed) {
    if (!map) return null;
    var a = map[u + ">" + v] || null;
    if (directed) return a;
    var b = map[v + ">" + u] || null;
    if (!a || !b) return a || b;
    return (RANK[b] || 0) > (RANK[a] || 0) ? b : a;
  }
  function unit(dx, dy) { var l = Math.sqrt(dx * dx + dy * dy) || 1; return [dx / l, dy / l]; }

  IN.vizGraph = function (stage, s, opts) {
    opts = opts || {};
    clear(stage);
    if (!s || !s.g) return;
    var g = s.g, R = opts.R || 16, dir = !!g.directed;
    var pos = {};
    g.nodes.forEach(function (n) { pos[n.id] = n; });

    // Grenser for viewBox (ekstra plass over/ved siden av for etiketter)
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    g.nodes.forEach(function (n) {
      var hw = n.w ? n.w / 2 - R : 0;   // bokser stikker ut mer enn en sirkel
      minX = Math.min(minX, n.x - hw); maxX = Math.max(maxX, n.x + hw);
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
    });
    // Avstand fra sentrum til kanten av noden i retning (ux, uy)
    function reach(n, ux, uy) {
      if (!n.w) return n.label === "" ? R * 0.55 : R;
      var hw = n.w / 2, hh = R - 2;
      return Math.min(Math.abs(ux) > 1e-6 ? hw / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? hh / Math.abs(uy) : Infinity);
    }
    var hasLab = s.lab && Object.keys(s.lab).length;
    var padX = R + (hasLab ? 16 : 8), padY = R + (hasLab ? 18 : 8);
    var vx = minX - padX, vy = minY - padY, vw = (maxX - minX) + 2 * padX, vh = (maxY - minY) + 2 * padY;

    var svg = S("svg", { class: "gv-svg", viewBox: [vx, vy, vw, vh].map(Math.round).join(" "),
      role: "img", "aria-label": opts.ariaLabel || ((dir ? "Rettet" : "Urettet") + " graf med " + g.nodes.length + " noder") });
    if (opts.scale) { svg.style.width = Math.round(vw * opts.scale) + "px"; svg.style.maxWidth = "100%"; }
    else svg.style.maxWidth = Math.round(vw * 1.5) + "px";

    // Finnes motsatt kant? Da bøyes begge, så pilene ikke ligger oppå hverandre.
    var has = {};
    g.edges.forEach(function (e) { has[e[0] + ">" + e[1]] = 1; });

    var gE = S("g", { class: "gv-edges" }), gW = S("g", { class: "gv-weights" }), gN = S("g", { class: "gv-nodes" });
    g.edges.forEach(function (e) {
      var u = e[0], v = e[1], w = e[2], o = e[3] || {};
      var p = pos[u], q = pos[v];
      if (!p || !q) return;
      var st = edgeState(s.edges, u, v, dir);
      var cls = "gv-e" + (st ? " is-" + st : "");
      var bend = o.bend != null ? o.bend : (dir && has[v + ">" + u] ? 14 : 0);
      var d = unit(q.x - p.x, q.y - p.y), perp = [-d[1], d[0]];
      var mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      var cx = mx + perp[0] * bend * 2, cy = my + perp[1] * bend * 2;   // kontrollpunkt (kurven når halvveis)
      var path = bend ? "M" + p.x + " " + p.y + " Q" + cx + " " + cy + " " + q.x + " " + q.y
                      : "M" + p.x + " " + p.y + " L" + q.x + " " + q.y;
      gE.appendChild(S("path", { class: cls, d: path }));
      if (dir) {
        var ad = bend ? unit(q.x - cx, q.y - cy) : d, ap = [-ad[1], ad[0]];
        var rr = reach(q, ad[0], ad[1]) + 1;
        var tx = q.x - ad[0] * rr, ty = q.y - ad[1] * rr;
        var bx = tx - ad[0] * 10, by = ty - ad[1] * 10;
        gE.appendChild(S("polygon", { class: "gv-arr" + (st ? " is-" + st : ""),
          points: [tx, ty, bx + ap[0] * 5, by + ap[1] * 5, bx - ap[0] * 5, by - ap[1] * 5].map(function (z) { return Math.round(z * 10) / 10; }).join(" ") }));
      }
      if (w != null && opts.weights !== false) {
        var tt = o.t != null ? o.t : 0.5, a = 1 - tt;
        var lx = bend ? a * a * p.x + 2 * a * tt * cx + tt * tt * q.x : p.x + (q.x - p.x) * tt;
        var ly = bend ? a * a * p.y + 2 * a * tt * cy + tt * tt * q.y : p.y + (q.y - p.y) * tt;
        var txt = String(w), bw = txt.length * 7 + 6;
        var wg = S("g", { class: "gv-w" + (st ? " is-" + st : "") });
        wg.appendChild(S("rect", { x: lx - bw / 2, y: ly - 8, width: bw, height: 16, rx: 4 }));
        wg.appendChild(S("text", { x: lx, y: ly, "text-anchor": "middle" }, txt));
        gW.appendChild(wg);
      }
    });

    g.nodes.forEach(function (n) {
      var st = s.nodes && s.nodes[n.id];
      var k = s.comp && s.comp[n.id];
      var cls = "gv-n" + (st ? " is-" + st : "") + (k != null ? " gv-k gv-k" + (k % 6) : "");
      var ng = S("g", { class: cls, transform: "translate(" + n.x + " " + n.y + ")" });
      if (n.w) ng.appendChild(S("rect", { class: "gv-box", x: -n.w / 2, y: -(R - 2), width: n.w, height: 2 * (R - 2), rx: 6 }));
      else ng.appendChild(S("circle", { r: n.label === "" ? R * 0.55 : R }));
      var label = n.label != null ? n.label : n.id;
      if (label !== "") ng.appendChild(S("text", { class: "k" + (n.w ? " bx" : String(label).length > 2 ? " sm" : ""), "text-anchor": "middle" }, label));
      gN.appendChild(ng);
      if (s.lab && s.lab[n.id] != null && s.lab[n.id] !== "") {
        var lp = n.lp || "t", lx = n.x, ly = n.y - R - 6, an = "middle";
        if (lp === "b") ly = n.y + R + 13;
        else if (lp === "l") { lx = n.x - R - 4; ly = n.y + 4; an = "end"; }
        else if (lp === "r") { lx = n.x + R + 4; ly = n.y + 4; an = "start"; }
        gN.appendChild(S("text", { class: "gv-lab", x: lx, y: ly, "text-anchor": an }, String(s.lab[n.id])));
      }
    });
    svg.appendChild(gE); svg.appendChild(gW); svg.appendChild(gN);

    var root = el("div", { class: "gv" });
    var fig = el("div", { class: "gv-fig" }); fig.appendChild(svg); root.appendChild(fig);

    // Sidepanel: kø/stakk/mengder + tabell
    if ((s.panel && s.panel.length) || s.table || s.note) {
      var side = el("div", { class: "gv-side" });
      (s.panel || []).forEach(function (row) {
        var r = el("div", { class: "tv-info gv-row" }, [el("span", { class: "lbl", text: row.label })]);
        var items = row.items || [];
        if (!items.length) r.appendChild(el("span", { class: "tv-none", text: row.empty || "tom" }));
        items.forEach(function (it, i) {
          var first = row.first !== false && i === (row.kind === "stack" ? items.length - 1 : 0) && (row.kind === "queue" || row.kind === "stack");
          r.appendChild(el("span", { class: "tv-chip" + (first ? " first" : ""), html: String(it) }));
        });
        side.appendChild(r);
      });
      if (s.table) {
        var tb = el("table", { class: "gv-tab" });
        if (s.table.cap) tb.appendChild(el("caption", { text: s.table.cap }));
        var hr = el("tr");
        s.table.head.forEach(function (h, i) { hr.appendChild(el("th", { class: i === s.table.hi ? "is-hi" : null, html: String(h) })); });
        tb.appendChild(hr);
        s.table.rows.forEach(function (row) {
          var tr = el("tr");
          row.forEach(function (c, i) { tr.appendChild(el(i === 0 ? "th" : "td", { class: i === s.table.hi ? "is-hi" : null, html: String(c) })); });
          tb.appendChild(tr);
        });
        side.appendChild(el("div", { class: "gv-tabwrap" }, [tb]));
      }
      if (s.note) side.appendChild(el("div", { class: "gv-note small", html: s.note }));
      root.appendChild(side);
    }
    stage.appendChild(root);
    return svg;
  };
})();
