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

  /* step: { array:[...], marks:{compare:[],swap:[],min:idx,sorted:[],target:idx|[],found:idx,part:[],stale:[]},
            ptrs:{ i,j,k,lo,mid,hi,low,high,left,right }, ptrCls:{ k:"target" },
            vars:[["i",0],…]  – piller over søylene (f.eks. rundeteller),
            hold:{ label, v, cls } – en verdi holdt til side (key i insertion),
            rows:[{ label, cells:[{v,cls,ptr}], note }] – hjelpearrayer under søylene } */
  IN.vizBars = function (stage, step, opts) {
    opts = opts || {};
    var arr = step.array || [];
    var marks = step.marks || {};
    var ptrs = step.ptrs || {};
    var ptrCls = step.ptrCls || {};
    var max = Math.max.apply(null, arr.concat([1]));
    var minH = 22, span = 120;

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

    clear(stage);
    var extra = (step.vars && step.vars.length) || step.hold || (step.rows && step.rows.length);
    if (!extra) { stage.appendChild(bars); return; }

    var wrap = el("div", { class: "vb" });
    if ((step.vars && step.vars.length) || step.hold) {
      var top = el("div", { class: "vb-top" });
      (step.vars || []).forEach(function (p) {
        top.appendChild(el("span", { class: "pill" }, [el("span", { class: "k", text: p[0] + " = " }), el("b", { text: String(p[1]) })]));
      });
      if (step.hold) {
        top.appendChild(el("span", { class: "vb-hold" }, [
          el("span", { class: "vb-lbl mono", text: step.hold.label }),
          el("span", { class: "vb-cell" + (step.hold.cls ? " is-" + step.hold.cls : ""), text: String(step.hold.v) })
        ]));
      }
      wrap.appendChild(top);
    }
    wrap.appendChild(bars);
    (step.rows || []).forEach(function (r) { wrap.appendChild(cellRow(r.label, r.cells || [], r.note)); });
    stage.appendChild(wrap);
  };
})();
