/* ============================================================
   IN2010 guide · pseudocode.js
   Pseudokode i eksamensformat (algorithm2e-stil):
   tokenizer, renderer med linjemarkering, nivåstyrt linjeforklarer,
   Big-O-boks og Parsons-øving ("sorter linjene"). Klassisk script.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  var el = IN.el, clear = IN.clear;

  IN.algos = IN.algos || {};

  /* ---------- Tokenizer ---------- */
  var KEYWORDS = {
    Procedure:1, Function:1, "for":1, to:1, downto:1, "do":1, "while":1, "if":1, then:1,
    "else":1, elseif:1, "return":1, and:1, or:1, not:1, "new":1, swap:1, "true":1, "false":1,
    "null":1, "break":1, "continue":1, append:1, "in":1, is:1, mod:1, repeat:1, until:1,
    each:1, of:1, "then":1, error:1, yield:1
  };
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var RE = /(\/\/[^\n]*)|([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9']*|\[[^\]\n]*\])+)|(\d+)|([A-Za-z_][A-Za-z0-9_']*)|(\s+)|([\s\S])/g;

  function tokenize(code) {
    var out = "", m;
    RE.lastIndex = 0;
    while ((m = RE.exec(code)) !== null) {
      if (m[1] != null)      out += '<span class="cmt">' + esc(m[1]) + "</span>";
      else if (m[2] != null) out += '<span class="mono">' + esc(m[2]) + "</span>";
      else if (m[3] != null) out += esc(m[3]);
      else if (m[4] != null) {
        var w = m[4];
        if (KEYWORDS[w]) out += '<span class="kw">' + esc(w) + "</span>";
        else if (/^[A-Z]/.test(w)) out += '<span class="mono">' + esc(w) + "</span>";
        else out += '<span class="var">' + esc(w) + "</span>";
      }
      else if (m[5] != null) out += m[5];
      else                   out += esc(m[6]);
    }
    return out;
  }
  IN.pseudo = IN.pseudo || {};
  IN.pseudo.tokenize = tokenize;

  /* ---------- Hover-tooltip for pseudokodelinjer ----------
     Delt, flytende boks. Viser nivåstyrt forklaring for linja man peker på,
     slik at man kan sjekke raskt uten å gå ned til linjeforklareren. */
  function tipEl() {
    var t = document.getElementById("pc-tip");
    if (!t) {
      t = el("div", { id: "pc-tip", class: "pc-tip", role: "tooltip" });
      t.hidden = true;
      document.body.appendChild(t);
    }
    return t;
  }
  function attachTooltips(box, lines) {
    var tip = tipEl();
    function textFor(n) {
      var l = lines[n - 1];
      if (!l || l.proc) return "";
      var txt = IN.level.pick({ eli5: l.eli5, normal: l.normal, teknisk: l.teknisk }) || "";
      return txt + grenseHTML(l.grense);
    }
    function show(row, n) {
      var txt = textFor(n);
      if (!txt) { hide(); return; }
      tip.innerHTML = txt;
      tip.hidden = false;
      var r = row.getBoundingClientRect();
      var tw = tip.getBoundingClientRect().width;
      var vw = document.documentElement.clientWidth;
      var left = window.pageXOffset + r.left;
      var maxLeft = window.pageXOffset + vw - tw - 10;
      if (left > maxLeft) left = Math.max(window.pageXOffset + 8, maxLeft);
      tip.style.left = left + "px";
      tip.style.top = (window.pageYOffset + r.bottom + 6) + "px";
    }
    function hide() { tip.hidden = true; }
    IN.qsa(".pc-line", box).forEach(function (row) {
      var n = +row.getAttribute("data-line");
      if (!textFor(n)) return;
      row.classList.add("has-tip");
      row.addEventListener("mouseenter", function () { show(row, n); });
      row.addEventListener("mouseleave", hide);
      row.addEventListener("focus", function () { show(row, n); });
      row.addEventListener("blur", hide);
    });
  }

  function indentGuides(n) {
    var s = "";
    for (var i = 0; i < n; i++) s += '<span class="indent">│  </span>';
    return s;
  }

  /* Normaliser linjer: Procedure-linja er linje 1, kropp fra 2. */
  function allLines(algo) {
    var head = { code: "Procedure " + algo.name + "(" + (algo.params || "") + ")", indent: 0, proc: true };
    return [head].concat(algo.lines.map(function (l) {
      return {
        code: l.code, indent: l.indent || 0,
        eli5: l.eli5, normal: l.normal != null ? l.normal : l.what,
        teknisk: l.teknisk != null ? l.teknisk : l.why,
        grense: l.grense || null
      };
    }));
  }

  /* «Hvorfor n − 1 og ikke n?» – valgfritt felt på en linje: { q, a }.
     a er en streng (samme på alle nivåer) eller { eli5, normal, teknisk }.
     Brukes bare der grensen (±1, < vs ≤, start på 0 vs 1) er en naturlig felle. */
  function grenseHTML(g, lvl) {
    if (!g) return "";
    var a = typeof g.a === "string" ? g.a : IN.level.pick(g.a, lvl);
    if (!a) return "";
    return '<div class="pc-grense"><span class="pc-grense-q">' + g.q + "</span> " + a + "</div>";
  }
  IN.pseudo.grenseHTML = grenseHTML;

  /* ---------- render(host, algo, opts) ---------- */
  IN.pseudo.render = function (host, algo, opts) {
    if (typeof host === "string") host = IN.qs(host);
    opts = opts || {};
    var lines = allLines(algo);
    var box = el("div", { class: "pseudo" + (opts.interactive ? " interactive" : "") });

    if (opts.head !== false) {
      var head = el("div", { class: "pc-head" });
      if (algo.input)  head.appendChild(el("span", { class: "pc-io", html: "<b>Input:</b> " + esc(algo.input) }));
      if (algo.output) head.appendChild(el("span", { class: "pc-io", html: "<b>Output:</b> " + esc(algo.output) }));
      if (algo.input || algo.output) box.appendChild(head);
    }

    lines.forEach(function (l, i) {
      var lineNo = i + 1;
      var row = el("div", { class: "pc-line", "data-line": lineNo });
      row.appendChild(el("span", { class: "ln", text: String(lineNo) }));
      row.appendChild(el("span", { class: "code", html: indentGuides(l.indent) + tokenize(l.code) }));
      if (l.grense) {
        row.classList.add("has-grense");
        row.appendChild(el("span", { class: "pc-grense-mark", title: l.grense.q, "aria-hidden": "true", text: "?" }));
      }
      if (opts.interactive) {
        row.tabIndex = 0;
        row.setAttribute("role", "button");
        row.setAttribute("aria-label", "Linje " + lineNo);
      }
      box.appendChild(row);
    });
    clear(host); host.appendChild(box);

    var clickHandlers = [];
    function rowByNo(n) { return box.querySelector('.pc-line[data-line="' + n + '"]'); }
    function fire(n) {
      var data = lines[n - 1];
      clickHandlers.forEach(function (fn) { fn(n, data); });
    }
    if (opts.interactive) {
      IN.qsa(".pc-line", box).forEach(function (row) {
        var n = +row.getAttribute("data-line");
        row.addEventListener("click", function () { fire(n); });
        row.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fire(n); }
        });
      });
    }
    // Hover-forklaring (på som standard; av i linjeforklareren som alt har sidepanel).
    if (opts.tooltips !== false) attachTooltips(box, lines);

    return {
      el: box,
      lines: lines,
      highlight: function (n) {
        IN.qsa(".pc-line.is-active", box).forEach(function (r) { r.classList.remove("is-active"); });
        var r = rowByNo(n); if (r) r.classList.add("is-active");
      },
      select: function (n) {
        IN.qsa(".pc-line.sel", box).forEach(function (r) { r.classList.remove("sel"); });
        var r = rowByNo(n); if (r) { r.classList.add("sel"); }
      },
      clear: function () { IN.qsa(".pc-line.is-active", box).forEach(function (r) { r.classList.remove("is-active"); }); },
      onLineClick: function (fn) { clickHandlers.push(fn); },
      rowByNo: rowByNo
    };
  };

  /* ---------- Big-O-boks ---------- */
  IN.pseudo.bigO = function (algo, opts) {
    var b = algo.bigO;
    if (!b) return null;
    if (opts && opts.compact) return bigOCompact(b);
    var box = el("div", { class: "card bigo" });
    box.appendChild(el("h3", { text: "Kjøretid og minne", style: "margin-top:.2rem" }));
    var grid = el("div", { class: "bigo-grid" });
    function cell(lbl, val) {
      if (val == null) return;
      grid.appendChild(el("div", { class: "bigo-cell" }, [
        el("div", { class: "bigo-lbl", text: lbl }),
        el("div", { class: "bigo-val", html: val })
      ]));
    }
    cell("Best", b.best); cell("Snitt", b.avg); cell("Verst", b.worst); cell("Minne", b.space);
    box.appendChild(grid);
    if (b.stable != null || b.inplace != null) {
      var flags = el("div", { class: "pills", style: "margin:.5rem 0" });
      if (b.stable != null)  flags.appendChild(el("span", { class: "pill", html: '<span class="k">stabil</span> ' + (b.stable ? "ja" : "nei") }));
      if (b.inplace != null) flags.appendChild(el("span", { class: "pill", html: '<span class="k">in-place</span> ' + (b.inplace ? "ja" : "nei") }));
      box.appendChild(flags);
    }
    if (b.why) {
      var why = el("div", { class: "bigo-why" });
      box.appendChild(why);
      var paint = function () { why.innerHTML = "<b>Hvorfor:</b> " + IN.level.pick(b.why); };
      paint(); IN.level.onChange(paint);
    }
    return box;
  };

  /* Kompakt variant: ligger rett under pseudokoden, så kjøretiden er synlig mens man øver.
     Én rad med Best/Snitt/Verst/Minne, egenskaper som piller, og «Hvorfor?» sammenfoldet. */
  function bigOCompact(b) {
    var box = el("div", { class: "bigo bigo-compact" });
    var head = el("div", { class: "bigo-head" }, [el("span", { class: "bigo-title", text: "Kjøretid og minne" })]);
    if (b.stable != null || b.inplace != null) {
      var flags = el("div", { class: "pills" });
      if (b.stable != null)  flags.appendChild(el("span", { class: "pill", html: '<span class="k">stabil</span> ' + (b.stable ? "ja" : "nei") }));
      if (b.inplace != null) flags.appendChild(el("span", { class: "pill", html: '<span class="k">in-place</span> ' + (b.inplace ? "ja" : "nei") }));
      head.appendChild(flags);
    }
    box.appendChild(head);
    var grid = el("div", { class: "bigo-grid" });
    [["Best", b.best], ["Snitt", b.avg], ["Verst", b.worst], ["Minne", b.space]].forEach(function (p) {
      if (p[1] == null) return;
      grid.appendChild(el("div", { class: "bigo-cell" }, [
        el("div", { class: "bigo-lbl", text: p[0] }),
        el("div", { class: "bigo-val", html: p[1] })
      ]));
    });
    box.appendChild(grid);
    if (b.why) {
      var det = el("details", { class: "bigo-why" });
      var body = el("div");
      det.appendChild(el("summary", { text: "Hvorfor?" }));
      det.appendChild(body);
      box.appendChild(det);
      var paint = function () { body.innerHTML = IN.level.pick(b.why); };
      paint(); IN.level.onChange(paint);
    }
    return box;
  }

  /* ---------- Nivåstyrt linjeforklarer ---------- */
  IN.pseudo.explainer = function (host, algo, opts) {
    if (typeof host === "string") host = IN.qs(host);
    opts = opts || {};
    clear(host);
    var wrap = el("div", { class: "pc-explainer" });
    var left = el("div");
    var right = el("div", { class: "panel" });
    wrap.appendChild(left); wrap.appendChild(right);
    host.appendChild(wrap);

    var handle = IN.pseudo.render(left, algo, { interactive: true, tooltips: false });
    var head = el("div", { class: "pc-exp-head" });
    var scope = IN.levelScope({ initial: opts.initial || null });
    var body = el("div", { class: "pc-exp-body" });
    right.appendChild(head); right.appendChild(body);

    var sel = opts.start || 1;
    var procText = {
      eli5: "Dette er starten på oppskriften. Vi gir den et navn og sier hva den trenger å få inn for å virke.",
      normal: "Prosedyrens signatur: navnet og parameteren den tar inn.",
      teknisk: "Prosedyredeklarasjon. Input/Output står over; kjøretiden oppgis i Big-O-boksen."
    };
    function expl(n) {
      var l = handle.lines[n - 1];
      if (l.proc) return procText;
      return { eli5: l.eli5, normal: l.normal, teknisk: l.teknisk };
    }
    function paint() {
      var lvl = scope.get();
      clear(head);
      head.appendChild(el("span", { class: "tag", text: "Linje " + sel }));
      head.appendChild(scope.el);
      var e = expl(sel);
      var txt = IN.level.pick(e, lvl);
      clear(body);
      if (txt) body.appendChild(el("p", { html: txt }));
      else body.appendChild(el("p", { class: "pc-exp-hint", text: "Klikk en linje for forklaring." }));
      var g = handle.lines[sel - 1].grense;
      if (g) body.insertAdjacentHTML("beforeend", grenseHTML(g, lvl));
      handle.select(sel); handle.highlight(sel);
    }
    handle.onLineClick(function (n) { sel = n; paint(); });
    left.addEventListener("keydown", function (ev) {
      var dir = ev.key === "ArrowDown" ? 1 : ev.key === "ArrowUp" ? -1 : 0;
      if (!dir) return;
      ev.preventDefault();
      sel = Math.max(1, Math.min(handle.lines.length, sel + dir));
      var r = handle.rowByNo(sel); if (r) r.focus();
      paint();
    });
    scope.onChange(paint);
    paint();
    return { paint: paint, handle: handle, scope: scope };
  };

  /* ---------- Parsons ("sorter linjene") ---------- */
  IN.pseudo.parsons = function (host, algo, opts) {
    if (typeof host === "string") host = IN.qs(host);
    opts = opts || {};
    clear(host);
    var body = algo.lines.map(function (l, i) {
      return { code: l.code, indent: l.indent || 0, idx: i };
    });

    // Fasit: original rekkefølge + innrykk. Start: stokket, innrykk nullstilt til 1.
    var order = body.slice();
    for (var s = order.length - 1; s > 0; s--) { var j = Math.floor(Math.random() * (s + 1)); var t = order[s]; order[s] = order[j]; order[j] = t; }
    var state = order.map(function (o) { return { idx: o.idx, code: o.code, indent: 1 }; });

    var fixed = el("div", { class: "parsons-fixed muted small", html: tokenize("Procedure " + algo.name + "(" + (algo.params || "") + ")") });
    var list = el("div", { class: "parsons" });
    var controls = el("div", { class: "btn-row" }, [
      el("button", { class: "btn primary sm", type: "button", text: "Sjekk", onclick: check }),
      el("button", { class: "btn sm", type: "button", text: "Vis fasit", onclick: solve }),
      el("button", { class: "btn sm", type: "button", text: "Stokk på nytt", onclick: function () { reshuffle(); } })
    ]);
    var status = el("div", { class: "muted small", "aria-live": "polite", style: "margin-top:.3rem" });

    host.appendChild(el("p", { class: "muted small", text: "Dra linjene i riktig rekkefølge. Du kan justere innrykk med ← →, men bare rekkefølgen teller ved sjekk." }));
    host.appendChild(fixed);
    host.appendChild(list);
    host.appendChild(controls);
    host.appendChild(status);

    function draw() {
      clear(list);
      state.forEach(function (row, pos) {
        var line = el("div", { class: "parsons-line", draggable: "true", "data-pos": pos });
        line.appendChild(el("span", { class: "grip", "aria-hidden": "true", text: "☰" }));
        line.appendChild(el("div", { class: "mv" }, [
          el("button", { class: "btn sm", type: "button", title: "Flytt opp", text: "↑", onclick: function () { move(pos, -1); } }),
          el("button", { class: "btn sm", type: "button", title: "Flytt ned", text: "↓", onclick: function () { move(pos, 1); } })
        ]));
        line.appendChild(el("div", { class: "mv" }, [
          el("button", { class: "btn sm", type: "button", title: "Mindre innrykk", text: "←", onclick: function () { indent(pos, -1); } }),
          el("button", { class: "btn sm", type: "button", title: "Mer innrykk", text: "→", onclick: function () { indent(pos, 1); } })
        ]));
        line.appendChild(el("div", { class: "pcode", html: indentGuides(row.indent) + tokenize(row.code) }));
        attachDrag(line, pos);
        list.appendChild(line);
      });
    }
    function move(pos, d) {
      var np = pos + d; if (np < 0 || np >= state.length) return;
      var tmp = state[pos]; state[pos] = state[np]; state[np] = tmp; draw();
    }
    function indent(pos, d) {
      state[pos].indent = Math.max(0, Math.min(8, state[pos].indent + d)); draw();
    }
    var dragFrom = null, dropIndex = null;
    function clearIndicators() {
      IN.qsa(".parsons-line", list).forEach(function (l) { l.classList.remove("drop-above", "drop-below"); });
    }
    function attachDrag(line, pos) {
      line.addEventListener("dragstart", function (e) {
        dragFrom = pos; line.classList.add("dragging");
        if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", String(pos)); } catch (err) {} }
      });
      line.addEventListener("dragend", function () { line.classList.remove("dragging"); clearIndicators(); dragFrom = null; dropIndex = null; });
      line.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        var rect = line.getBoundingClientRect();
        var after = e.clientY > rect.top + rect.height / 2;
        clearIndicators();
        line.classList.add(after ? "drop-below" : "drop-above");
        dropIndex = after ? pos + 1 : pos;
      });
      line.addEventListener("drop", function (e) {
        e.preventDefault();
        clearIndicators();
        if (dragFrom == null) return;
        var target = (dropIndex == null) ? pos : dropIndex;
        if (dragFrom < target) target--;           // juster indeks etter at elementet fjernes
        var item = state.splice(dragFrom, 1)[0];
        target = Math.max(0, Math.min(state.length, target));
        state.splice(target, 0, item);
        dragFrom = null; dropIndex = null;
        draw();
      });
    }
    function check() {
      var orderOk = true, indentOff = false;
      IN.qsa(".parsons-line", list).forEach(function (line, pos) {
        var row = state[pos];
        var good = row.idx === pos;            // tilgivende: kun rekkefølgen teller
        line.classList.remove("ok", "bad");
        line.classList.add(good ? "ok" : "bad");
        if (!good) orderOk = false;
        else if (row.indent !== body[pos].indent) indentOff = true;
      });
      status.textContent = orderOk
        ? (indentOff
            ? "Riktig rekkefølge! (Innrykket avviker litt fra fasiten, men det teller ikke her.)"
            : "Riktig! Rekkefølgen stemmer.")
        : "Ikke helt – se de røde linjene (rekkefølgen).";
      if (orderOk && IN.progress) IN.progress.solved("parsons", host.id || algo.name, 1, 1);
    }
    function solve() {
      state = body.map(function (o) { return { idx: o.idx, code: o.code, indent: o.indent }; });
      draw();
      IN.qsa(".parsons-line", list).forEach(function (line) { line.classList.add("ok"); });
      status.textContent = "Fasit vist.";
    }
    function reshuffle() {
      var arr = body.slice();
      for (var s2 = arr.length - 1; s2 > 0; s2--) { var j2 = Math.floor(Math.random() * (s2 + 1)); var t2 = arr[s2]; arr[s2] = arr[j2]; arr[j2] = t2; }
      state = arr.map(function (o) { return { idx: o.idx, code: o.code, indent: 1 }; });
      status.textContent = ""; draw();
    }
    draw();
  };
})();
