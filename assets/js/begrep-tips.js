/* ============================================================
   IN2010 guide · begrep-tips.js
   Verktøytips for begreper og forkortelser i løpende tekst (DAG, BFS, in-place,
   Load factor …) og ordlista på 00-begreper.html. Ordene og tekstene står i
   begreper-data.js (IN.BEGREPER) – den eneste kilden. Lastes rett etter den.

   Slik virker det:
   - IN.begrepTips(root) går gjennom TEKSTNODER i root (aldri innerHTML) og pakker
     FØRSTE forekomst av hvert begrep per seksjon/kort inn i <span class="bt" data-bt="id">.
     Seksjon/kort = nærmeste details.examtask, .card, [data-panel], section eller main.
   - Bare tekst i vanlig prosa (p, li, td, .callout …) inne i <main>. Aldri i kode,
     pseudokode, demoer (.stepplayer), skjemafelt, lenker, knapper, overskrifter,
     quizspørsmål/-svar, eller i noe som alt har et tips (.sym, [data-tip], [title]).
     data-bt-off på et element slår det av for alt inni.
   - Filen kobler seg på IN.symbolTips (core.js): hver gang symbolene skannes
     (oppstart, nivåbytte, nye faner i eksamenskort), skannes begrepene også.
     Da trengs ingen endring i core.js. Uten core.js skanner den selv ved oppstart.
   - Ett felles tips (#bt-tip, role="tooltip") med delegerte lyttere på document:
     mus: hover viser, klikk fester · tastatur: fokus viser, Enter åpner ordlista,
     Esc lukker · touch: trykk viser, nytt trykk eller trykk utenfor lukker.
   - IN.begrepTips.ordliste(host) tegner ordlista (begreper + symboler fra symboler.js).
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  var BG = IN.BEGREPER;
  if (!BG) return;
  var LIST = BG.list;

  /* Lenker i tipset går til ordlista. Grunnadressen hentes fra denne filens egen src,
     så det virker både over file:// og GitHub Pages, og fra undermapper (plan/…). */
  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/assets\/js\/begrep-tips\.js.*$/, "") : "";
  })();
  function pageId() { return (document.body && document.body.getAttribute("data-page")) || ""; }
  function href(id) {
    var h = "#fane=ordliste&oppg=b-" + id;
    return pageId() === "begreper" ? h : BASE + "00-begreper.html" + h;
  }

  /* ---------- Mønstre ---------- */
  var WCH = "A-Za-z0-9_ÆØÅæøåÀ-ÖØ-öø-ÿ";
  var WORD = new RegExp("[" + WCH + "]");             // bokstav rett før treffet → ikke et helt ord
  var ALL = [];
  Object.keys(LIST).forEach(function (id) {
    var e = LIST[id], res = [];
    // Hel-ord-krav bak: (?![bokstav]) inne i mønsteret, så regex prøver en kortere/lengre bøyning
    // («prefikstreet», «relakseres») i stedet for å forkaste treffet.
    function rx(list, fl) { return new RegExp("(?:" + list.join("|") + ")(?![" + WCH + "])", fl); }
    if (e.m && e.m.length) res.push(rx(e.m, "gi"));
    if (e.mc && e.mc.length) res.push(rx(e.mc, "g"));
    e._re = res;
    ALL = ALL.concat(e.m || [], e.mc || []);
  });
  var PRE = new RegExp(ALL.join("|"), "i");          // grovsil: hopp over tekst uten noe kandidat

  var ALLOW = "p, li, td, dd, dt, figcaption, blockquote, .callout, .explain-body, .qz-exp, " +
    ".et-content, .et-pf-body, .pc-exp-body, .bigo-why, .lead";
  var SKIP = "code, kbd, pre, samp, var, a, button, input, textarea, select, option, label, svg, script, style, " +
    "h1, h2, h3, h4, h5, h6, summary, header, footer, nav, [contenteditable], [title], [data-tip], [aria-live], " +
    ".sym, .bt, .has-tip, .pc-tip, .mono, .kbd, .pseudo, .pcode, .parsons, .tagline, .stepplayer, " +
    ".tabs, [role=tab], [role=tablist], .badge, .pill, .chip, .lbl, .qz-prompt, .qz-choices, .qz-choice, " +
    ".et-head, .et-tabs, .bt-ordliste, [data-bt-off]";
  var SCOPE = "details.examtask, .card, [data-panel], section, main";

  function scopeOf(n) { return (n.closest && n.closest(SCOPE)) || document.body; }

  /* Treff i én tekst: [{ i, n, id }] i rekkefølge, uten overlapp (lengste treff vinner). */
  function hitsIn(text, page) {
    var hits = [];
    Object.keys(LIST).forEach(function (id) {
      var e = LIST[id];
      if (e.ikke && e.ikke.indexOf(page) >= 0) return;
      e._re.forEach(function (re) {
        re.lastIndex = 0;
        var m;
        while ((m = re.exec(text)) !== null) {
          if (!m[0]) { re.lastIndex++; continue; }
          var a = text.charAt(m.index - 1);
          if (a && WORD.test(a)) { re.lastIndex = m.index + 1; continue; }
          hits.push({ i: m.index, n: m[0].length, id: id });
        }
      });
    });
    hits.sort(function (x, y) { return x.i - y.i || y.n - x.n; });
    var out = [], end = -1;
    hits.forEach(function (h) { if (h.i >= end) { out.push(h); end = h.i + h.n; } });
    return out;
  }

  function scan(root) {
    if (!root) return;
    if (root.nodeType === 9) root = root.body;
    if (!root || root.nodeType !== 1) return;
    bind();
    if (st.cur && !st.cur.isConnected) hide();
    var page = pageId(), seenBy = [], todo = [], n;
    function seen(scope) {
      for (var k = 0; k < seenBy.length; k++) if (seenBy[k][0] === scope) return seenBy[k][1];
      var s = {};
      Array.prototype.forEach.call(scope.querySelectorAll(".bt"), function (b) {
        if (scopeOf(b.parentNode) === scope) s[b.getAttribute("data-bt")] = 1;
      });
      seenBy.push([scope, s]);
      return s;
    }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    while ((n = w.nextNode())) {
      var p = n.parentNode;
      if (!n.nodeValue || !PRE.test(n.nodeValue) || !p || !p.closest) continue;
      if (!p.closest("main, [data-bt-on]") || !p.closest(ALLOW) || p.closest(SKIP)) continue;
      todo.push(n);
    }
    todo.forEach(function (tn) {
      var text = tn.nodeValue, s = seen(scopeOf(tn.parentNode)), keep = [];
      hitsIn(text, page).forEach(function (h) { if (!s[h.id]) { s[h.id] = 1; keep.push(h); } });
      if (!keep.length) return;
      var frag = document.createDocumentFragment(), pos = 0;
      keep.forEach(function (h) {
        if (h.i > pos) frag.appendChild(document.createTextNode(text.slice(pos, h.i)));
        var sp = document.createElement("span");
        sp.className = "bt";
        sp.setAttribute("data-bt", h.id);
        sp.tabIndex = 0;
        sp.textContent = text.substr(h.i, h.n);
        frag.appendChild(sp);
        pos = h.i + h.n;
      });
      if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  /* ---------- Tipset ---------- */
  var st = { tip: null, cur: null, at: 0, ptr: "mouse", pinned: false, bound: false, timer: 0 };

  function mk(tag, cls, text) {
    var x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text != null) x.textContent = text;
    return x;
  }
  function tipEl() {
    if (st.tip) return st.tip;
    var t = st.tip = mk("div", "pc-tip bt-tip");
    t.id = "bt-tip";
    t.setAttribute("role", "tooltip");
    t.hidden = true;
    document.body.appendChild(t);
    return t;
  }
  function fill(t, id, shown) {
    var e = LIST[id];
    while (t.firstChild) t.removeChild(t.firstChild);
    var h = mk("span", "bt-tip-h");
    h.appendChild(mk("b", null, e.vis === "treff" ? shown : e.ord));
    if (e.full) h.appendChild(document.createTextNode(" – " + e.full));
    t.appendChild(h);
    var sub = e.navn && !(e.vis === "treff" && shown === e.navn) ? e.navn : null;
    if (sub) t.appendChild(mk("span", "bt-tip-n", sub));
    t.appendChild(mk("span", "bt-tip-t", e.txt));
    if (e.forveks) t.appendChild(mk("span", "bt-tip-fv", e.forveks));   // «Må ikke forveksles med …»
    var a = mk("a", "bt-tip-a", "Ordlista →");
    a.href = href(id);
    a.tabIndex = -1;                 // tastatur: Enter på begrepet åpner ordlista
    t.appendChild(a);
  }
  function show(s, pin) {
    var id = s.getAttribute("data-bt");
    if (!LIST[id]) return;
    clearTimeout(st.timer);
    var t = tipEl();
    if (st.cur !== s) fill(t, id, s.textContent);
    t.hidden = false;
    t.classList.toggle("is-pinned", !!pin);
    if (st.cur && st.cur !== s) st.cur.removeAttribute("aria-describedby");
    st.cur = s; st.at = Date.now(); st.pinned = !!pin;
    s.setAttribute("aria-describedby", "bt-tip");
    s.classList.add("is-open");
    place(s);
  }
  /* Over begrepet, sentrert og holdt innenfor skjermen; under hvis det ikke er plass over. */
  function place(s) {
    var t = st.tip;
    t.style.left = "0px"; t.style.top = "0px";
    var r = s.getClientRects()[0] || s.getBoundingClientRect();
    var tr = t.getBoundingClientRect(), vw = document.documentElement.clientWidth;
    var left = Math.max(8, Math.min(r.left + r.width / 2 - tr.width / 2, vw - tr.width - 8));
    var top = r.top - tr.height - 6;
    var sticky = IN.stickyH ? IN.stickyH() : 0;
    if (top < sticky + 4) top = r.bottom + 6;
    t.style.left = (window.pageXOffset + left) + "px";
    t.style.top = (window.pageYOffset + top) + "px";
  }
  function hide() {
    clearTimeout(st.timer);
    if (st.tip) st.tip.hidden = true;
    if (st.cur) { st.cur.removeAttribute("aria-describedby"); st.cur.classList.remove("is-open"); }
    st.cur = null; st.pinned = false;
  }
  function hideSoon() { clearTimeout(st.timer); st.timer = setTimeout(hide, 150); }

  function btOf(e) {
    var x = e.target;
    if (!x || !x.closest || x.closest(".sym")) return null;   // symbolet inni har sitt eget tips
    return x.closest(".bt");
  }
  function inTip(x) { return !!(st.tip && x && st.tip.contains(x)); }

  function bind() {
    if (st.bound) return;
    st.bound = true;
    document.addEventListener("pointerdown", function (e) { st.ptr = e.pointerType || "mouse"; }, true);
    document.addEventListener("pointerover", function (e) {
      if (e.pointerType !== "mouse") return;
      if (inTip(e.target)) { clearTimeout(st.timer); return; }
      var s = btOf(e);
      if (s && s !== st.cur && !st.pinned) show(s, false);
      else if (s && s === st.cur) clearTimeout(st.timer);
    });
    document.addEventListener("pointerout", function (e) {
      if (e.pointerType !== "mouse" || !st.cur || st.pinned) return;
      var to = e.relatedTarget;
      var from = e.target === st.cur || st.cur.contains(e.target) || inTip(e.target);
      if (from && !(to && (st.cur.contains(to) || inTip(to)))) hideSoon();
    });
    document.addEventListener("focusin", function (e) {
      var s = btOf(e);
      if (s) show(s, false);
      else if (st.cur && !inTip(e.target)) hide();
    });
    document.addEventListener("focusout", function (e) {
      if (st.cur && e.target === st.cur && !inTip(e.relatedTarget)) hide();
    });
    document.addEventListener("click", function (e) {
      if (inTip(e.target)) return;                      // lenken i tipset
      var s = btOf(e);
      if (!s) { if (st.cur) hide(); return; }
      // Touch: mouseover/klikk kommer rett etter hverandre – ikke lukk det som nettopp åpnet seg.
      if (st.cur === s && st.pinned && Date.now() - st.at > 400) hide(); else show(s, true);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && st.cur) { hide(); return; }
      if (e.key === "Enter" && e.target && e.target.classList && e.target.classList.contains("bt")) {
        var id = e.target.getAttribute("data-bt");
        if (LIST[id]) { e.preventDefault(); location.href = href(id); }
      }
    });
    document.addEventListener("dragstart", hide);
    // Rulling/ny størrelse: lukk – men ikke når tipset kom fra tastaturfokus. Tab til et begrep
    // utenfor skjermen ruller siden selv, og da skal tipset følge med, ikke forsvinne.
    function moved() {
      if (!st.cur) return;
      if (document.activeElement === st.cur && !st.pinned) place(st.cur); else hide();
    }
    window.addEventListener("scroll", moved, { passive: true });
    window.addEventListener("resize", moved);
    window.addEventListener("hashchange", markHit);
  }

  /* ---------- Ordlista (00-begreper.html, fanen «Ordliste») ---------- */
  function norm(s) { return String(s || "").toLowerCase(); }
  function ordliste(host, opts) {
    if (typeof host === "string") host = document.querySelector(host);
    if (!host) return;
    opts = opts || {};
    while (host.firstChild) host.removeChild(host.firstChild);
    host.classList.add("bt-ordliste");
    var fld = mk("label", "bt-ol-sok");
    fld.appendChild(mk("span", null, "Søk i ordlista"));
    var inp = mk("input");
    inp.type = "search"; inp.autocomplete = "off"; inp.placeholder = "f.eks. DAG, inngrad, Load factor";
    fld.appendChild(inp);
    host.appendChild(fld);
    var none = mk("p", "muted small bt-ol-tom", "Ingen treff.");
    none.hidden = true;
    var rows = [];
    function group(title, items) {
      if (!items.length) return;
      var sec = mk("div", "bt-ol-gruppe");
      sec.appendChild(mk("h3", null, title));
      var dl = mk("dl", "bt-ol");
      items.forEach(function (it) {
        var dt = mk("dt"), dd = mk("dd");
        dt.id = it.anchor;
        dt.appendChild(mk("b", null, it.ord));
        if (it.full) dt.appendChild(mk("span", "bt-ol-full", " – " + it.full));
        if (it.navn) dd.appendChild(mk("span", "bt-ol-navn", it.navn + ". "));
        dd.appendChild(document.createTextNode(it.txt));
        if (it.eks) dd.appendChild(mk("span", "bt-ol-eks", "Eksempel: " + it.eks));
        if (it.forveks) dd.appendChild(mk("span", "bt-ol-fv", it.forveks));
        if (it.se) {
          var p = mk("span", "bt-ol-se", "Les mer: ");
          var a = mk("a", null, it.se[1]);
          a.href = BASE + it.se[0];
          if (pageId() && it.se[0].indexOf(location.pathname.split("/").pop() + "#") === 0) a.href = it.se[0].replace(/^[^#]*/, "");
          p.appendChild(a);
          dd.appendChild(p);
        }
        dl.appendChild(dt); dl.appendChild(dd);
        rows.push({ dt: dt, dd: dd, sec: sec, key: norm([it.ord, it.full, it.navn, it.txt, it.forveks].join(" ")) });
      });
      sec.appendChild(dl);
      host.appendChild(sec);
    }
    BG.TEMA.forEach(function (tm) {
      var items = Object.keys(LIST).filter(function (id) { return LIST[id].tema === tm[0]; }).map(function (id) {
        var e = LIST[id];
        return { anchor: "b-" + id, ord: e.ord, full: e.full, navn: e.navn, txt: e.txt, se: e.se, forveks: e.forveks };
      }).sort(function (a, b) { return a.ord.localeCompare(b.ord, "nb"); });
      group(tm[1], items);
    });
    if (opts.symboler !== false && IN.SYMBOLER && IN.SYMBOLER.list) {
      var SL = IN.SYMBOLER.list;
      group("Symboler i pseudokode", Object.keys(SL).map(function (id) {
        var e = SL[id];
        return { anchor: "s-" + id, ord: e.vis, navn: e.navn.charAt(0).toUpperCase() + e.navn.slice(1), txt: e.txt, eks: e.eks };
      }));
    }
    host.appendChild(none);
    inp.addEventListener("input", function () {
      var q = norm(inp.value).trim(), any = false;
      rows.forEach(function (r) { var on = !q || r.key.indexOf(q) >= 0; r.dt.hidden = r.dd.hidden = !on; if (on) any = true; });
      Array.prototype.forEach.call(host.querySelectorAll(".bt-ol-gruppe"), function (g) {
        g.hidden = !g.querySelector("dt:not([hidden])");
      });
      none.hidden = any;
    });
    markHit();
  }
  /* Dyplenke #fane=ordliste&oppg=b-dag: core.js bytter fane og ruller; vi framhever oppslaget. */
  function markHit() {
    var m = location.hash.match(/oppg=([bs]-[\w-]+)/);
    var t = m && document.getElementById(m[1]);
    if (!t) return;
    t.classList.add("is-hit");
    if (t.nextElementSibling) t.nextElementSibling.classList.add("is-hit");
    setTimeout(function () {
      t.classList.remove("is-hit");
      if (t.nextElementSibling) t.nextElementSibling.classList.remove("is-hit");
    }, 2600);
  }

  /* ---------- Kobling til core.js ---------- */
  IN.begrepTips = scan;
  IN.begrepTips.ordliste = ordliste;
  IN.begrepTips.hide = hide;
  IN.begrepTips.hitsIn = hitsIn;      // til test og gjennomgang
  if (typeof IN.symbolTips === "function" && !IN.symbolTips._bt) {
    var orig = IN.symbolTips;
    IN.symbolTips = function (root) {
      var r = orig.apply(this, arguments);
      try { scan(root); } catch (err) { if (window.console) console.warn("begrep-tips:", err); }
      return r;
    };
    IN.symbolTips._bt = true;
  } else if (typeof IN.symbolTips !== "function") {
    var go = function () { scan(document); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
    window.addEventListener("load", go);
  }
  window.addEventListener("load", markHit);
})();
