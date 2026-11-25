/* ============================================================
   IN2010 guide · viz-bars.js
   Søyle-/array-visualisering for sortering, søk og heap-array.
   Verdi over søyla, indeks under, pekermerker (i, j, k, lo, mid,
   hi …) som piller under. Klassisk script. IN.vizBars(stage, step).
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  var el = IN.el, clear = IN.clear;

  function inArr(a, i) { return Array.isArray(a) ? a.indexOf(i) >= 0 : a === i; }

  /* Én tilstand per celle, slik at en aktiv markering aldri skjules av en bakgrunnsmarkering:
     bytte > sammenligning > minste > mål/skrives > ferdig > delsortert. */
  function stateOf(marks, i) {
    if (inArr(marks.swap, i)) return "swap";
    if (inArr(marks.compare, i)) return "compare";
    if (marks.min === i) return "min";
    if (inArr(marks.target, i)) return "target";
    if (inArr(marks.sorted, i) || marks.found === i) return "sorted";
    if (inArr(marks.part, i)) return "part";
    return "";
  }

  var PTR_KEYS = ["i", "k", "j", "left", "right", "lo", "low", "mid", "hi", "high"];

  /* Små celler (hjelpearray L/R, nøkkel holdt til side). cell: { v, cls, ptr } */
  function cellRow(label, cells, note) {
    var row = el("div", { class: "vb-row" });
    row.appendChild(el("span", { class: "vb-lbl mono", text: label }));
    var box = el("div", { class: "vb-cells" });
    if (!cells.length) box.appendChild(el("span", { class: "vb-empty muted small", text: "(tom)" }));
    cells.forEach(function (c) {
      var col = el("div", { class: "vb-ccol" });
      col.appendChild(el("span", { class: "vb-cell" + (c.cls ? " is-" + c.cls : ""), text: String(c.v) }));
      col.appendChild(el("span", { class: "vb-ptr", text: c.ptr || "" }));
      box.appendChild(col);
    });
    row.appendChild(box);
    if (note) row.appendChild(el("span", { class: "vb-note muted small", html: note }));
    return row;
  }

  /* Tilstanden til plassen en variabel peker på (samme forrang som søylene), for prikken i variabellinja.
     v.row = "L"/"R" peker inn i en hjelpearray-rad i stedet for i A. Utenfor gyldig område: ingen prikk. */
  function dotState(step, v) {
    if (v.row) {
      var r = (step.rows || []).filter(function (x) { return x.label === v.row; })[0];
      var c = r && r.cells && r.cells[v.idx];
      return c ? (c.cls || "default") : null;
    }
    var arr = step.array || [], marks = step.marks || {};
    if (v.idx < 0 || v.idx >= arr.length) return null;
    return stateOf(marks, v.idx) || (inArr(marks.stale, v.idx) ? "stale" : "default");
  }

  /* ---------- Løkkespenn (step.ranges) ----------
     Én tynn rad per aktiv løkke under søylene: ┌ j ──────┐ fra kant til kant av cellene from..to.
     Heltrukket = for-løkke, stiplet = while-løkke, tykk = kallets delområde (rekursjon).
     Posisjonen regnes ut fra cellene selv (getBoundingClientRect), og regnes på nytt når
     størrelsen endres (ResizeObserver), så spennet følger søylene i alle bredder. */
  var RO = typeof ResizeObserver === "function" ? new ResizeObserver(function (ents) {
    ents.forEach(function (e) {
      var vr = e.target.__vr;
      if (!vr || !document.contains(e.target)) { RO.unobserve(e.target); return; }
      layoutRanges(vr);
    });
  }) : null;
  if (!RO) window.addEventListener("resize", function () {
    var all = document.querySelectorAll(".vr");
    for (var z = 0; z < all.length; z++) layoutRanges(all[z]);
  });

  function layoutRanges(vr) {
    var base = vr.getBoundingClientRect();
    if (!base.width) return; // skjult (annen fane, eller variabellinja er slått av)
    (vr.__items || []).forEach(function (it) {
      var a = vr.__cols[it.r.from], b = vr.__cols[it.r.to];
      if (!a || !b || it.r.from > it.r.to) { it.el.style.display = "none"; return; }
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var left = ra.left - base.left, width = Math.max(0, rb.right - ra.left);
      it.el.style.display = "";
      it.el.style.left = left + "px";
      it.el.style.width = width + "px";
      // Får ikke navnet plass mellom endestrekene, står det utenfor: til høyre, eller til venstre ved høyre kant
      var lbl = it.el.firstChild;
      lbl.classList.remove("is-right", "is-left");
      if (lbl.offsetWidth + 14 > width) lbl.classList.add(left + width + lbl.offsetWidth + 6 <= base.width ? "is-right" : "is-left");
    });
  }

  function findVar(step, name, row) {
    var vs = step.vars || [];
    for (var z = 0; z < vs.length; z++) {
      var v = vs[z];
      if (v && v.name === name && (v.row || null) === (row || null)) return v;
    }
    return null;
  }

  /* list: [{ name, from, to, dashed?, call?, row?, label? }], cols: cellene spennet måles mot */
  function rangeBox(step, list, cols, ownerEls) {
    var vr = el("div", { class: "vr", "aria-hidden": "true" });
    vr.__cols = cols; vr.__items = []; vr.__vr = vr;
    list.forEach(function (r) {
      var row = el("div", { class: "vr-row" });
      var br = el("span", { class: "vr-br" + (r.dashed ? " is-dashed" : "") + (r.call ? " is-call" : "") });
      var lbl = el("span", { class: "vr-lbl" });
      var v = findVar(step, r.name, r.row);
      var cls = v && v.idx != null ? dotState(step, v) : null;
      if (cls) lbl.appendChild(el("i", { class: "vl-dot is-" + cls }));
      lbl.appendChild(document.createTextNode(r.label || r.name));
      br.appendChild(lbl);
      row.appendChild(br);
      vr.appendChild(row);
      vr.__items.push({ r: r, el: br });
    });
    if (RO) { RO.observe(vr); (ownerEls || []).forEach(function (o) { o.__vr = vr; RO.observe(o); }); }
    return vr;
  }

  /* Søylebredde etter plassen: hele arrayen skal få plass i scenen uten vannrett scroll.
     Standardbredden (CSS, 46/34/26 px) brukes når den får plass; ellers krymper søyle og mellomrom
     ned til minst MIN_W px. Først under det scroller scenen (siste utvei). */
  var MIN_W = 14, SLACK = 8; /* SLACK: luft til pekerpiller som stikker litt ut på kantsøylene */
  function fitBars(bars) {
    var sp = bars.closest(".sp-stage");
    var n = bars.children.length;
    if (!sp || !n) return;
    var cs = getComputedStyle(sp);
    var avail = sp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - SLACK;
    if (!(avail > 0)) return;
    bars.classList.remove("is-fit", "is-small", "is-tiny");
    bars.style.removeProperty("--bw"); bars.style.removeProperty("--bg");
    var w0 = bars.children[0].offsetWidth;
    var g0 = parseFloat(getComputedStyle(bars).columnGap) || 0;
    if (n * w0 + (n - 1) * g0 <= avail) return;
    var g = Math.max(2, Math.min(g0, Math.floor(avail / n * 0.2)));
    var w = Math.max(MIN_W, Math.min(w0, Math.floor((avail - (n - 1) * g) / n)));
    if (w === MIN_W) g = Math.max(2, Math.min(g, Math.floor((avail - n * w) / Math.max(1, n - 1))));
    bars.style.setProperty("--bw", w + "px");
    bars.style.setProperty("--bg", g + "px");
    bars.classList.add("is-fit");
    if (w < 24) bars.classList.add("is-small");
    if (w < 18) bars.classList.add("is-tiny");
  }
  /* Ny tilpasning når scenen endrer bredde (vindu, sidepanel, faner). Bare bredden teller,
     så en høydeendring fra selve tilpasningen gir ingen løkke. */
  var FIT = typeof ResizeObserver !== "undefined" ? new ResizeObserver(function (es) {
    es.forEach(function (e) {
      var sp = e.target;
      if (!sp.isConnected) { FIT.unobserve(sp); return; }
      var w = sp.clientWidth;
      if (w === sp.__fitW) return;
      sp.__fitW = w;
      sp.querySelectorAll(".bars").forEach(fitBars);
      sp.querySelectorAll(".vr").forEach(layoutRanges);
    });
  }) : null;
  function watchFit(bars) {
    var sp = bars.closest(".sp-stage");
    if (!sp) return;
    sp.__fitW = sp.clientWidth;
    if (FIT && !sp.__fitObs) { sp.__fitObs = true; FIT.observe(sp); }
    else if (!FIT && !sp.__fitObs) {
      sp.__fitObs = true;
      window.addEventListener("resize", function () { sp.querySelectorAll(".bars").forEach(fitBars); sp.querySelectorAll(".vr").forEach(layoutRanges); });
    }
  }

  /* step: { array:[...], marks:{compare:[],swap:[],min:idx,sorted:[],target:idx|[],found:idx,part:[],stale:[]},
            ptrs:{ i,j,k,lo,mid,hi,low,high,left,right }, ptrCls:{ k:"target" },
            vars:[{ name, value, idx?, row?, cls? }] – variabellinja øverst (varline.js),
            varsPrev – variablene i steget før (uthever endringer), frame – prosedyren vi står i,
            hold:{ label, v, cls } – en verdi holdt til side (key i insertion),
            rows:[{ label, cells:[{v,cls,ptr}], note }] – hjelpearrayer under søylene,
            ranges:[{ name, from, to, dashed?, call?, row?, label? }] – løkkespenn under søylene
              (eller under raden row = "L"/"R"); ytterste først, nærmest søylene }
     opts.varHost: elementet linja skal ligge øverst i (standard: stage). */
  IN.vizBars = function (stage, step, opts) {
    opts = opts || {};
    var arr = step.array || [];
    var marks = step.marks || {};
    var ptrs = step.ptrs || {};
    var ptrCls = step.ptrCls || {};
    var max = Math.max.apply(null, arr.concat([1]));
    var minH = 22, span = 120;
    var vhost = opts.varHost || stage;
    var vl = null;
    if (step.vars && IN.varLine) {
      vl = IN.varLine.attach(vhost);
      vl.update(step.vars, step.varsPrev, { frame: step.frame, dot: function (v) { return dotState(step, v); } });
    } else if (IN.varLine && vhost === stage) IN.varLine.detach(stage);

    var bars = el("div", { class: "bars" });
    arr.forEach(function (v, i) {
      var col = el("div", { class: "bar-col" });
      var st = stateOf(marks, i);
      var cls = "bar" + (st ? " is-" + st : "") + (inArr(marks.stale, i) ? " is-stale" : "");
      var h = Math.round(minH + (Math.max(0, v) / max) * span);
      var bar = el("div", { class: cls, style: "height:" + h + "px" });
      bar.appendChild(el("span", { class: "val", text: String(v) }));
      col.appendChild(bar);
      col.appendChild(el("div", { class: "bar-idx", text: String(i) }));

      var pbox = el("div", { class: "bar-ptrs" });
      PTR_KEYS.forEach(function (key) {
        if (ptrs[key] === i) pbox.appendChild(el("span", { class: "ptr " + key + (ptrCls[key] ? " as-" + ptrCls[key] : ""), text: key }));
      });
      col.appendChild(pbox);
      bars.appendChild(col);
    });

    if (vl && vhost === stage) IN.varLine.clearStage(stage); else clear(stage);
    var ranges = step.ranges || [];
    var extra = step.hold || (step.rows && step.rows.length) || ranges.length;
    if (!extra) { stage.appendChild(bars); fitBars(bars); watchFit(bars); return; }
    function rangesFor(row) { return ranges.filter(function (r) { return (r.row || null) === row; }); }
    var toLayout = [];

    var wrap = el("div", { class: "vb" });
    if (step.hold) {
      var top = el("div", { class: "vb-top" });
      top.appendChild(el("span", { class: "vb-hold" }, [
        el("span", { class: "vb-lbl mono", text: step.hold.label }),
        el("span", { class: "vb-cell" + (step.hold.cls ? " is-" + step.hold.cls : ""), text: String(step.hold.v) })
      ]));
      wrap.appendChild(top);
    }
    wrap.appendChild(bars);
    var aR = rangesFor(null);
    if (aR.length) {
      var vrA = rangeBox(step, aR, Array.prototype.slice.call(bars.children), [bars]);
      wrap.appendChild(vrA); toLayout.push(vrA);
    }
    (step.rows || []).forEach(function (r) {
      var rowEl = cellRow(r.label, r.cells || [], r.note);
      wrap.appendChild(rowEl);
      var rR = rangesFor(r.label);
      if (rR.length) {
        var vrR = rangeBox(step, rR, Array.prototype.slice.call(rowEl.querySelectorAll(".vb-ccol")), [rowEl]);
        wrap.appendChild(vrR); toLayout.push(vrR);
      }
    });
    stage.appendChild(wrap);
    fitBars(bars); watchFit(bars);
    toLayout.forEach(layoutRanges);
  };
  IN.vizBars.dotState = dotState;
})();
