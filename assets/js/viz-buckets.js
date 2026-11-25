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

  function draw(stage, s, opts, lay) {
    if (s && s.A && (s.vars || (lay && lay.vars)) && IN.varLine) {
      IN.varLine.attach(stage).update(s.vars || [], s.varsPrev, { frame: s.frame, dot: function (v) { return dotState(s, v); } });
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
    return root;
  }

  /* Fast høyde: når stegene er stemplet (IN.vizBars.stamp gir s.lay), tegnes hele tracen én gang
     og den høyeste bøtteboksen og variabellinja blir min-height. Da hopper ikke demoen når
     bøttene fylles og tømmes. Mellomlageret ligger på .sp-stage og gjelder én bredde og én
     tilstand for variabelbryteren. */
  function vlOn(stage) { var v = stage.__vl && stage.__vl.el; return !v || !v.classList.contains("is-off"); }
  /* Bryteren «Variabler» gjelder alle demoer på siden: tegn de synlige demoene på nytt med en gang,
     så den reserverte høyden følger bryteren uten å vente på neste steg. */
  if (!IN.__vzLive) {
    IN.__vzLive = [];
    document.addEventListener("click", function (e) {
      if (!e.target || !e.target.closest || !e.target.closest(".vl-tog")) return;
      setTimeout(function () {
        IN.__vzLive = IN.__vzLive.filter(function (sp) { return sp.isConnected; });
        IN.__vzLive.forEach(function (sp) { if (sp.offsetParent !== null && sp.__vzLast) sp.__vzLast(); });
      }, 0);
    });
  }
  function vzLive(sp, fn) { sp.__vzLast = fn; if (IN.__vzLive.indexOf(sp) < 0) IN.__vzLive.push(sp); }
  IN.vizBuckets = function (stage, s, opts) {
    opts = opts || {};
    var lay = s && s.lay && s.lay.steps ? s.lay : null;
    if (!lay) return draw(stage, s, opts, null);
    var sp = stage.closest ? (stage.closest(".sp-stage") || stage) : stage;
    var w = sp.clientWidth, on = vlOn(stage);
    if (w > 0 && (sp.__bkLay !== lay || sp.__bkW !== w || sp.__bkOn !== on)) {
      var v0 = stage.__vl && stage.__vl.el; if (v0) v0.style.minHeight = "";
      var hMax = 0, vMax = 0;
      for (var z = 0; z < lay.steps.length; z++) {
        var node = draw(stage, lay.steps[z], opts, lay);
        if (node) hMax = Math.max(hMax, node.getBoundingClientRect().height);
        var ve = stage.__vl && stage.__vl.el;
        if (ve && ve.parentNode) vMax = Math.max(vMax, ve.getBoundingClientRect().height);
      }
      sp.__bkLay = lay; sp.__bkW = w; sp.__bkOn = on; sp.__bkH = hMax; sp.__bkV = vMax;
    }
    vzLive(sp, function () { IN.vizBuckets(stage, s, opts); });
    var out = draw(stage, s, opts, lay);
    if (out && sp.__bkLay === lay) {
      out.style.minHeight = sp.__bkH ? sp.__bkH + "px" : "";
      var vle = stage.__vl && stage.__vl.el;
      if (vle) vle.style.minHeight = sp.__bkV && vlOn(stage) ? sp.__bkV + "px" : "";
    }
    return out;
  };
})();
