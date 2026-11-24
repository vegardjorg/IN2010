/* ============================================================
   IN2010 guide · viz-bars.js
   Søyle-/array-visualisering for sortering, søk og heap-array.
   Verdi over søyla, indeks under, pekermerker (i, j, k, low, mid,
   high) som piller under. Klassisk script. IN.vizBars(stage, step).
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  var el = IN.el, clear = IN.clear;

  function inArr(a, i) { return Array.isArray(a) && a.indexOf(i) >= 0; }

  /* step: { array:[...], marks:{compare:[],swap:[],min:idx,sorted:[],target:idx,found:idx},
            ptrs:{ i,j,k,low,mid,high } } */
  IN.vizBars = function (stage, step, opts) {
    opts = opts || {};
    var arr = step.array || [];
    var marks = step.marks || {};
    var ptrs = step.ptrs || {};
    var max = Math.max.apply(null, arr.concat([1]));
    var minH = 22, span = 120;

    var bars = el("div", { class: "bars" });
    arr.forEach(function (v, i) {
      var col = el("div", { class: "bar-col" });
      var cls = "bar";
      if (inArr(marks.sorted, i) || marks.found === i) cls += " is-sorted";
      if (inArr(marks.compare, i)) cls += " is-compare";
      if (marks.min === i) cls += " is-min";
      if (inArr(marks.swap, i)) cls += " is-swap";
      if (marks.target === i) cls += " is-target";
      var h = Math.round(minH + (Math.max(0, v) / max) * span);
      var bar = el("div", { class: cls, style: "height:" + h + "px" });
      bar.appendChild(el("span", { class: "val", text: String(v) }));
      col.appendChild(bar);
      col.appendChild(el("div", { class: "bar-idx", text: String(i) }));

      var pbox = el("div", { class: "bar-ptrs" });
      ["i", "k", "j", "low", "mid", "high"].forEach(function (key) {
        if (ptrs[key] === i) pbox.appendChild(el("span", { class: "ptr " + key, text: key }));
      });
      col.appendChild(pbox);
      bars.appendChild(col);
    });
    clear(stage); stage.appendChild(bars);
  };
})();
