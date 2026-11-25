/* ============================================================
   IN2010 guide · viz-buckets.js
   Bøtte-visualisering for bøttesortering og radix sort:
   arrayet A øverst, bøttene B[0..N−1] under (elementene stables i den
   rekkefølgen de ble lagt inn – bakerst = nederst). Klassisk script.

   Steg-objekt (fra steggeneratoren):
     { line, A: [item], B: [[item]], labels?: [string],
       active?: { where: "A"|"B", i, k },   // elementet vi jobber med nå
       done?: [i],      // indekser i A som alt er fordelt (vises falmet)
       written?: [i],   // indekser i A som er skrevet tilbake i samlefasen
       bucket?: k,      // bøtta som er i fokus
       src?: i,         // plassen i A elementet kommer fra (utheves også når den er falmet)
       hideUnwritten?: true, // samlefasen: plasser i A som ikke er skrevet ennå, vises tomme
       digit?: p,       // radix: posisjon fra høyre (0 = enerplass) som skal utheves
       vars?: [{ name, value, idx?, where?: "A"|"B" }], varsPrev?,  // variabellinja (varline.js)
       text, tag }
   item: { v: number|string, key: number, tag?: "a"|"b"|… (viser opprinnelig rekkefølge) }
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  var el = IN.el, clear = IN.clear;

  function hue(k) { return (k * 47 + 200) % 360; }

  function chip(item, opts) {
    opts = opts || {};
    var cls = "bk-chip" + (opts.active ? " is-active" : "") + (opts.done ? " is-done" : "") + (opts.written ? " is-written" : "");
    var c = el("span", { class: cls });
    if (opts.colorByKey) c.style.setProperty("--bk-h", hue(item.key));
    else c.classList.add("neutral");
    var val = String(item.v);
    if (opts.digit != null && /^\d+$/.test(val)) {
      // Uthev sifferet på posisjon «digit» fra høyre (fyll ut med 0 til venstre ved behov)
      var w = Math.max(val.length, opts.digit + 1, opts.width || 0);
      var padded = val; while (padded.length < w) padded = "0" + padded;
      var pos = padded.length - 1 - opts.digit;
      var html = "";
      for (var i = 0; i < padded.length; i++) {
        var ch = padded.charAt(i), lead = i < padded.length - val.length;
        html += i === pos ? '<u class="bk-dig">' + ch + "</u>" : (lead ? '<span class="bk-pad">' + ch + "</span>" : ch);
      }
      c.appendChild(el("b", { html: html }));
    } else {
      c.appendChild(el("b", { text: val }));
    }
    if (item.tag) c.appendChild(el("small", { text: item.tag }));
    return c;
  }

  /* Prikken i variabellinja: samme markering som cella i A (aktiv = gul, skrevet tilbake = grønn,
     fordelt = falmet) eller bøtta (i fokus = gul). */
  function dotState(s, v) {
    if (v.where === "B") {
      if (v.idx < 0 || v.idx >= (s.B || []).length) return null;
      return (s.bucket === v.idx || (s.active && s.active.where === "B" && s.active.k === v.idx)) ? "compare" : "default";
    }
    if (v.idx < 0 || v.idx >= s.A.length) return null;
    if (s.src === v.idx || (s.active && s.active.where === "A" && s.active.i === v.idx)) return "compare";
    if ((s.written || []).indexOf(v.idx) >= 0) return "sorted";
    if ((s.done || []).indexOf(v.idx) >= 0) return "used";
    return "default";
  }

  IN.vizBuckets = function (stage, s, opts) {
    opts = opts || {};
    if (s && s.A && s.vars && IN.varLine) {
      IN.varLine.attach(stage).update(s.vars, s.varsPrev, { frame: s.frame, dot: function (v) { return dotState(s, v); } });
      IN.varLine.clearStage(stage);
    } else {
      if (IN.varLine) IN.varLine.detach(stage);
      clear(stage);
    }
    if (!s || !s.A) return;
    var root = el("div", { class: "bk" + (opts.compact ? " bk-compact" : "") });
    var done = {}, written = {};
    (s.done || []).forEach(function (i) { done[i] = 1; });
    (s.written || []).forEach(function (i) { written[i] = 1; });
    var width = 0;
    if (s.digit != null) {
      var all = s.A.slice();
      (s.B || []).forEach(function (b) { all = all.concat(b); });
      all.forEach(function (it) { if (it) width = Math.max(width, String(it.v).length); });
    }

    // Arrayet A
    var row = el("div", { class: "bk-zone" }, [el("span", { class: "bk-cap", text: "Arrayet A" })]);
    var cells = el("div", { class: "bk-cells" });
    s.A.forEach(function (it, i) {
      var src = s.src === i || (s.active && s.active.where === "A" && s.active.i === i);
      var cell = el("div", { class: "bk-cell" + (src ? " is-src" : "") });
      // I samlefasen er plassene som ikke er skrevet ennå, tomme (det gamle innholdet er ikke lenger i bruk)
      var hide = s.hideUnwritten && !written[i];
      if (it && !hide) cell.appendChild(chip(it, {
        colorByKey: opts.colorByKey !== false && s.digit == null,
        active: src,
        done: !!done[i] && !src, written: !!written[i], digit: s.digit, width: width
      }));
      else cell.appendChild(el("span", { class: "bk-empty" }));
      cell.appendChild(el("span", { class: "bk-idx", text: String(i) }));
      cells.appendChild(cell);
    });
    row.appendChild(cells);
    root.appendChild(row);

    // Bøttene: hver bøtte er en kø – forrest øverst, nye legges inn nederst
    var bzone = el("div", { class: "bk-zone" }, [el("span", { class: "bk-cap", text: "Bøttene B  ·  forrest øverst, nye legges bakerst (nederst)" })]);
    var bs = el("div", { class: "bk-buckets" });
    (s.B || []).forEach(function (bucket, k) {
      var focus = s.bucket === k || (s.active && s.active.where === "B" && s.active.k === k);
      var col = el("div", { class: "bk-bucket" + (focus ? " is-focus" : "") + (bucket.length ? "" : " is-emptyb") });
      col.appendChild(el("span", { class: "bk-blbl", text: (s.labels && s.labels[k] != null) ? s.labels[k] : "B[" + k + "]" }));
      var stack = el("div", { class: "bk-stack" });
      bucket.forEach(function (it, j) {
        stack.appendChild(chip(it, {
          colorByKey: opts.colorByKey !== false && s.digit == null,
          active: s.active && s.active.where === "B" && s.active.k === k && s.active.i === j,
          digit: s.digit, width: width
        }));
      });
      col.appendChild(stack);
      bs.appendChild(col);
    });
    bzone.appendChild(bs);
    root.appendChild(bzone);
    stage.appendChild(root);
  };
})();
