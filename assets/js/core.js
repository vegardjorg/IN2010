/* ============================================================
   IN2010 guide · core.js
   Navigasjon, faner, DOM-hjelpere, quiz. Klassisk script.
   Alt henger på window.IN. Ingen avhengigheter, virker fra file://.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});

  /* ---------- DOM-hjelpere ---------- */
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v == null) continue;
        if (k === "class" || k === "className") e.className = v;
        else if (k === "html") e.innerHTML = v;
        else if (k === "text") e.textContent = v;
        else if (k === "dataset") { for (var d in v) e.dataset[d] = v[d]; }
        else if (k.slice(0, 2) === "on" && typeof v === "function") e.addEventListener(k.slice(2), v);
        else if (v === true) e.setAttribute(k, "");
        else if (v !== false) e.setAttribute(k, v);
      }
    }
    if (children != null) append(e, children);
    return e;
  }
  function append(parent, child) {
    if (child == null) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(parent, c); }); return; }
    if (typeof child === "string" || typeof child === "number")
      parent.appendChild(document.createTextNode(String(child)));
    else parent.appendChild(child);
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  IN.el = el; IN.qs = qs; IN.qsa = qsa; IN.clear = clear; IN.append = append;

  /* ---------- Sider / navigasjon ---------- */
  IN.PAGES = [
    { id: "index",      href: "index.html",        label: "Forside",     ready: true },
    { id: "pseudokode", href: "pseudokode.html",   label: "Pseudokode",  ready: true },
    { id: "begreper",   href: "00-begreper.html",  label: "0 · Begreper", ready: true },
    { id: "sortering",  href: "01-sortering.html", label: "1 · Sortering", ready: true },
    { id: "sok",        href: "02-sok.html",       label: "2 · Søk",     ready: true },
    { id: "heap",       href: "03-heap.html",      label: "3 · Heap",    ready: true },
    { id: "traer",      href: "04-traer.html",     label: "4 · Trær",    ready: true },
    { id: "hashing",    href: "05-hashing.html",   label: "5 · Hashing", ready: false },
    { id: "grafer",     href: "06-grafer.html",    label: "6 · Grafer",  ready: false },
    { id: "strategi",   href: "07-strategi.html",  label: "7 · Strategi", ready: false }
  ];

  function buildNav() {
    var host = qs("#topnav");
    if (!host) return;
    var active = document.body.getAttribute("data-page");
    var row = el("div", { class: "nav-row" });
    var inner = el("div", { class: "nav-inner" });
    inner.appendChild(el("a", { class: "nav-brand", href: "index.html",
      html: 'IN<span>2010</span>' }));
    IN.PAGES.forEach(function (p) {
      if (p.id === "index") return; // merket forside = brand
      var cls = "navlink" + (p.id === active ? " active" : "") + (p.ready ? "" : " kommer");
      inner.appendChild(el("a", {
        class: cls, href: p.ready ? p.href : null,
        "aria-current": p.id === active ? "page" : null, text: p.label
      }));
    });
    // Temaknapp ligger helt ute til siden (utenfor lenkeraden), med luft, så den ikke er i veien for menyen.
    row.appendChild(inner);
    clear(host);
    host.appendChild(row);
    host.appendChild(buildThemeToggle());

    // Vis vannrett scroll-hint (uttoning) på menyen bare når lenkene faktisk er bredere enn plassen.
    function syncNavScroll() {
      inner.classList.toggle("scroll-x", inner.scrollWidth > inner.clientWidth + 2);
    }
    syncNavScroll();
    window.addEventListener("resize", syncNavScroll);
    inner.addEventListener("scroll", syncNavScroll);
  }

  /* ---------- Tema (lys/mørk/system) ---------- */
  function currentTheme() { return document.documentElement.getAttribute("data-theme") || "system"; }
  function applyTheme(mode) {
    if (mode === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", mode);
    IN.store.set("in-theme", mode);
  }
  function themeIcon(mode) { return mode === "dark" ? "🌙" : mode === "light" ? "☀️" : "🖥️"; }
  function buildThemeToggle() {
    var modes = ["system", "light", "dark"];
    var btn = el("button", {
      class: "theme-toggle", type: "button", title: "Bytt tema (system → lys → mørk)",
      "aria-label": "Bytt tema", text: themeIcon(currentTheme())
    });
    btn.addEventListener("click", function () {
      var next = modes[(modes.indexOf(currentTheme()) + 1) % modes.length];
      applyTheme(next); btn.textContent = themeIcon(next);
    });
    return btn;
  }
  IN.applyTheme = applyTheme;

  /* ---------- Forklaringsnivå (5-åring / Normalt / Teknisk) ---------- */
  IN.LEVELS = [
    { id: "eli5",    label: "Som for en 5-åring", short: "5-åring" },
    { id: "normal",  label: "Normalt",            short: "Normalt" },
    { id: "teknisk", label: "Teknisk",            short: "Teknisk" }
  ];
  var levelListeners = [];
  function levelGet() {
    var l = document.documentElement.getAttribute("data-level");
    return (l === "eli5" || l === "normal" || l === "teknisk") ? l : "normal";
  }
  function levelSet(id) {
    if (id !== "eli5" && id !== "normal" && id !== "teknisk") return;
    document.documentElement.setAttribute("data-level", id);
    IN.store.set("in-level", id);
    levelListeners.forEach(function (fn) { try { fn(id); } catch (e) {} });
    try { window.dispatchEvent(new CustomEvent("in:level", { detail: id })); } catch (e) {}
  }
  IN.level = {
    get: levelGet,
    set: levelSet,
    onChange: function (fn) { levelListeners.push(fn); return fn; },
    // Velg riktig variant ut fra et objekt {eli5?, normal?, teknisk?} eller en ren streng.
    pick: function (val, lvl) {
      lvl = lvl || levelGet();
      if (val == null) return "";
      if (typeof val === "string") return val;
      return val[lvl] != null ? val[lvl]
        : val.normal != null ? val.normal
        : val.teknisk != null ? val.teknisk
        : val.eli5 != null ? val.eli5 : "";
    }
  };

  /* Lokal nivåbryter: følger toppen ("auto") til et nivå velges lokalt.
     Returnerer { el, get(), onChange(fn), setLocal(v|null) }. */
  IN.levelScope = function (opts) {
    opts = opts || {};
    var local = opts.initial || null; // null = auto (følg toppen)
    var listeners = [];
    var ctrl = el("div", { class: "level-mini", role: "group", "aria-label": "Forklaringsnivå for dette feltet" });
    var btns = {};
    IN.LEVELS.forEach(function (L) {
      var b = el("button", { class: "seg-btn", type: "button", "data-lv": L.id, text: L.short, title: L.label });
      b.addEventListener("click", function () { setLocal(L.id); });
      btns[L.id] = b; ctrl.appendChild(b);
    });
    var reset = el("button", { class: "seg-btn reset", type: "button", title: "Følg toppnivået igjen", text: "↺", hidden: true });
    reset.addEventListener("click", function () { setLocal(null); });
    ctrl.appendChild(reset);
    function eff() { return local || levelGet(); }
    function sync() {
      var e = eff();
      IN.LEVELS.forEach(function (L) {
        var on = L.id === e;
        btns[L.id].classList.toggle("on", on);
        btns[L.id].setAttribute("aria-pressed", on ? "true" : "false");
      });
      reset.hidden = (local == null);
      ctrl.classList.toggle("pinned", local != null);
    }
    function fire() { sync(); listeners.forEach(function (fn) { try { fn(eff()); } catch (e) {} }); }
    function setLocal(v) { local = v; fire(); }
    levelListeners.push(function () { if (local == null) fire(); });
    sync();
    return { el: ctrl, get: eff, onChange: function (fn) { listeners.push(fn); return fn; }, setLocal: setLocal };
  };

  /* Nivåstyrt tekstblokk med egen lokal bryter.
     variants: { eli5?, normal?, teknisk? } (streng-HTML eller DOM-node). */
  IN.explain = function (host, variants, opts) {
    if (typeof host === "string") host = qs(host);
    opts = opts || {};
    var block = el("div", { class: "explain-block" });
    var scope = IN.levelScope({ initial: opts.initial || null });
    var bar = el("div", { class: "explain-bar" }, [
      opts.label ? el("span", { class: "explain-label", text: opts.label }) : null,
      scope.el
    ]);
    var bodyEl = el("div", { class: "explain-body" });
    block.appendChild(bar); block.appendChild(bodyEl);
    function paint() {
      var v = IN.level.pick(variants, scope.get());
      clear(bodyEl);
      if (v == null || v === "") { bodyEl.appendChild(el("p", { class: "muted small", text: "(ingen forklaring på dette nivået)" })); return; }
      if (v && v.nodeType) bodyEl.appendChild(v);
      else bodyEl.innerHTML = String(v);
    }
    scope.onChange(paint); paint();
    clear(host); host.appendChild(block);
    return { el: block, paint: paint, scope: scope };
  };

  function buildLevelBar() {
    var nav = qs("#topnav");
    if (!nav) return;
    var bar = qs("#levelbar");
    if (!bar) {
      bar = el("div", { id: "levelbar" });
      nav.parentNode.insertBefore(bar, nav.nextSibling);
    }
    var cur = levelGet();
    var group = el("div", { class: "level-seg", role: "radiogroup", "aria-label": "Forklaringsnivå" });
    IN.LEVELS.forEach(function (L) {
      var b = el("button", {
        class: "seg-btn" + (L.id === cur ? " on" : ""), type: "button", role: "radio",
        "aria-checked": L.id === cur ? "true" : "false", "data-level-id": L.id,
        html: '<span class="seg-full">' + L.label + '</span><span class="seg-short">' + L.short + '</span>'
      });
      b.addEventListener("click", function () { levelSet(L.id); });
      group.appendChild(b);
    });
    var inner = el("div", { class: "level-inner" }, [
      el("span", { class: "level-label", text: "Forklaringsnivå" }),
      group,
      el("span", { class: "level-hint muted small" })
    ]);
    clear(bar); bar.appendChild(inner);

    function syncButtons(id) {
      qsa(".seg-btn", group).forEach(function (b) {
        var on = b.getAttribute("data-level-id") === id;
        b.classList.toggle("on", on);
        b.setAttribute("aria-checked", on ? "true" : "false");
      });
      var hints = { eli5: "Mest detaljert – hvert steg forklart.", normal: "Balansert forklaring.", teknisk: "Kort og presist, med kjøretid." };
      qs(".level-hint", bar).textContent = hints[id] || "";
    }
    syncButtons(cur);
    levelListeners.push(syncButtons);
    // piltaster i segmentbryteren
    group.addEventListener("keydown", function (ev) {
      var dir = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      ev.preventDefault();
      var ids = IN.LEVELS.map(function (L) { return L.id; });
      var ni = (ids.indexOf(levelGet()) + dir + ids.length) % ids.length;
      levelSet(ids[ni]);
      qsa(".seg-btn", group)[ni].focus();
    });
  }

  /* ---------- Faner (tabs) ---------- */
  // Markup: container med .tabs (knapper med [data-tab=id]) og paneler [data-panel=id].
  IN.tabs = function (root) {
    root = root || document;
    var bar = qs(".tabs", root);
    if (!bar) return;
    var btns = qsa('[data-tab]', bar);
    var panels = qsa('[data-panel]', root);

    function activate(id, push) {
      btns.forEach(function (b) {
        var on = b.getAttribute("data-tab") === id;
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.setAttribute("tabindex", on ? "0" : "-1");
      });
      panels.forEach(function (p) {
        p.hidden = p.getAttribute("data-panel") !== id;
      });
      if (push) {
        try { history.replaceState(null, "", "#fane=" + id); } catch (e) {
          location.hash = "fane=" + id;
        }
      }
      // la demoer o.l. reagere på at de blir synlige
      var panel = panels.filter(function (p) { return p.getAttribute("data-panel") === id; })[0];
      if (panel) panel.dispatchEvent(new CustomEvent("in:shown", { bubbles: true }));
    }

    btns.forEach(function (b, i) {
      b.setAttribute("role", "tab");
      b.addEventListener("click", function () { activate(b.getAttribute("data-tab"), true); });
      b.addEventListener("keydown", function (ev) {
        var dir = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        ev.preventDefault();
        var ni = (i + dir + btns.length) % btns.length;
        btns[ni].focus(); activate(btns[ni].getAttribute("data-tab"), true);
      });
    });
    panels.forEach(function (p) { p.setAttribute("role", "tabpanel"); });

    var fromHash = (location.hash.match(/fane=([\w-]+)/) || [])[1];
    var ids = btns.map(function (b) { return b.getAttribute("data-tab"); });
    var start = (fromHash && ids.indexOf(fromHash) >= 0) ? fromHash : ids[0];
    activate(start, false);

    window.addEventListener("hashchange", function () {
      var h = (location.hash.match(/fane=([\w-]+)/) || [])[1];
      if (h && ids.indexOf(h) >= 0) activate(h, false);
    });
    return { activate: activate };
  };

  /* ---------- Quiz ---------- */
  // questions: [{ q, options:[...], answer: idx, explain }]
  IN.quiz = function (host, questions) {
    if (typeof host === "string") host = qs(host);
    if (!host) return;
    clear(host);
    questions.forEach(function (item, qi) {
      var card = el("div", { class: "quiz-q" });
      card.appendChild(el("div", { class: "qtext", html: item.q }));
      var exp = el("div", { class: "quiz-exp", html: item.explain || "" });
      var opts = item.options.map(function (opt, oi) {
        return el("button", {
          class: "quiz-opt", type: "button", html: opt,
          onclick: function () {
            qsa(".quiz-opt", card).forEach(function (b) { b.disabled = true; });
            if (oi === item.answer) this.classList.add("correct");
            else {
              this.classList.add("wrong");
              qsa(".quiz-opt", card)[item.answer].classList.add("correct");
            }
            exp.classList.add("show");
          }
        });
      });
      card.appendChild(el("div", {}, opts));
      if (item.explain) card.appendChild(exp);
      host.appendChild(card);
    });
  };

  /* ---------- Sant/usant-test ----------
     items: [{ s: "påstand (html)", answer: true|false, explain: "html", blokk: "1" }]
     opts:  { id?: lagringsnøkkel, shuffle?: false }
     Prøv deg selv, få antall riktig/galt, og vis fasit/forklaring per påstand
     eller for alle samtidig. Lett grensesnitt – ingen avhengigheter. */
  IN.tfTest = function (host, items, opts) {
    if (typeof host === "string") host = qs(host);
    if (!host || !items || !items.length) return;
    opts = opts || {};
    var storeKey = opts.id ? "in-tf:" + opts.id : null;

    // Stabil identitet + gjenoppretting av svar
    items = items.map(function (it, i) { return { s: it.s, answer: !!it.answer, explain: it.explain || "", blokk: it.blokk || null, _id: i }; });
    var answers = {}; // _id -> true/false
    var checked = false;
    if (storeKey) {
      try {
        var saved = JSON.parse(IN.store.get(storeKey, "null"));
        if (saved && saved.a) { answers = saved.a; checked = !!saved.c; }
      } catch (e) {}
    }
    function persist() {
      if (!storeKey) return;
      IN.store.set(storeKey, JSON.stringify({ a: answers, c: checked }));
    }

    var order = items.map(function (it) { return it._id; });
    function shuffle() { for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; } }
    if (opts.shuffle) shuffle();

    var wrap = el("div", { class: "tftest" });
    var score = el("span", { class: "tf-score", "aria-live": "polite" });
    var bCheck = el("button", { class: "btn sm primary", type: "button", text: "Sjekk svar", onclick: doCheck });
    var bReset = el("button", { class: "btn sm", type: "button", text: "↺ Nullstill", onclick: doReset });
    var keyShown = false, expShown = false;
    var bKey = el("button", { class: "btn sm ghost", type: "button", text: "Vis alle fasit",
      onclick: function () { keyShown = !keyShown; bKey.textContent = keyShown ? "Skjul fasit" : "Vis alle fasit"; render(); } });
    var bExp = el("button", { class: "btn sm ghost", type: "button", text: "Vis alle forklaringer",
      onclick: function () { expShown = !expShown; bExp.textContent = expShown ? "Skjul forklaringer" : "Vis alle forklaringer"; render(); } });
    var bar = el("div", { class: "tf-bar" }, [bCheck, bReset, el("span", { class: "tf-sep" }), bKey, bExp, score]);
    var list = el("div", { class: "tf-list" });
    wrap.appendChild(bar); wrap.appendChild(list);
    clear(host); host.appendChild(wrap);

    function counts() {
      var right = 0, wrong = 0, blank = 0;
      items.forEach(function (it) {
        if (answers[it._id] == null) blank++;
        else if (answers[it._id] === it.answer) right++;
        else wrong++;
      });
      return { right: right, wrong: wrong, blank: blank, total: items.length };
    }
    function updateScore() {
      if (!checked) { score.textContent = ""; score.className = "tf-score"; return; }
      var c = counts();
      score.className = "tf-score show";
      score.innerHTML = '<b class="ok">' + c.right + " riktig</b> · <b class=\"no\">" + c.wrong + " galt</b>" +
        (c.blank ? ' · <span class="muted">' + c.blank + " ubesvart</span>" : "") +
        ' · ' + c.right + "/" + c.total;
    }
    function choose(id, val) {
      answers[id] = val; persist();
      if (checked) updateScore();
      render();
    }
    function doCheck() { checked = true; persist(); render(); updateScore(); }
    function doReset() { answers = {}; checked = false; keyShown = false; expShown = false; bKey.textContent = "Vis alle fasit"; bExp.textContent = "Vis alle forklaringer"; persist(); render(); updateScore(); }

    function render() {
      clear(list);
      order.forEach(function (id, pos) {
        var it = items[id];
        var sel = answers[id];
        var item = el("div", { class: "tf-item" + (sel != null ? " answered" : "") });
        var head = el("div", { class: "tf-head" });
        head.appendChild(el("span", { class: "tf-num", text: (pos + 1) }));
        var stmt = el("div", { class: "tf-stmt", html: it.s });
        if (it.blokk) stmt.appendChild(el("span", { class: "tag blokk", text: "Blokk " + it.blokk }));
        head.appendChild(stmt);
        item.appendChild(head);

        var choices = el("div", { class: "tf-choices", role: "group", "aria-label": "Sant eller usant" });
        [["Sant", true], ["Usant", false]].forEach(function (pair) {
          var val = pair[1];
          var cls = "tf-choice" + (sel === val ? " sel" : "");
          if (checked && sel === val) cls += (val === it.answer ? " correct" : " wrong");
          if (checked && keyShownMaybe(it) && val === it.answer) cls += " iskey";
          var b = el("button", { class: cls, type: "button", text: pair[0],
            "aria-pressed": sel === val ? "true" : "false",
            onclick: function () { choose(id, val); } });
          choices.appendChild(b);
        });
        item.appendChild(choices);

        // Per-påstand verktøy
        var tools = el("div", { class: "tf-tools" });
        var itemKey = !!it._showKey || keyShown;
        var itemExp = !!it._showExp || expShown;
        var tKey = el("button", { class: "linklike", type: "button", text: itemKey ? "Skjul fasit" : "Fasit",
          onclick: function () { it._showKey = !itemKey; render(); } });
        var tExp = el("button", { class: "linklike", type: "button", text: itemExp ? "Skjul forklaring" : "Forklaring",
          onclick: function () { it._showExp = !itemExp; render(); } });
        tools.appendChild(tKey);
        if (it.explain) tools.appendChild(tExp);
        item.appendChild(tools);

        if (itemKey) {
          var ok = checked && sel != null && sel === it.answer;
          var bad = checked && sel != null && sel !== it.answer;
          item.appendChild(el("div", { class: "tf-reveal key" + (ok ? " ok" : bad ? " no" : ""),
            html: "Riktig svar: <b>" + (it.answer ? "Sant" : "Usant") + "</b>" +
              (checked && sel != null ? (ok ? " – du svarte riktig ✓" : " – du svarte " + (sel ? "Sant" : "Usant") + " ✗") : "") }));
        }
        if (itemExp && it.explain) item.appendChild(el("div", { class: "tf-reveal exp", html: it.explain }));

        list.appendChild(item);
      });
    }
    function keyShownMaybe(it) { return keyShown || it._showKey; }

    render(); updateScore();
    return { check: doCheck, reset: doReset, counts: counts };
  };

  /* ---------- Eksamensoppgave (utvidbart kort) ----------
     data: {
       year: "H2023", title: "Gnome sort", points: 10, oppgave_nr: "Oppgave 5",
       oppgave:  html,                      // parafrasert oppgavetekst
       losning:  html | [ "steg", ... ],    // løsningsgjennomgang (sensorveiledning, parafrasert)
       kjerne:   html,                      // kjernepoeng / hvorfor (valgfritt)
       tips:     html | [ "tips", ... ],    // eksamenstips
       open:     false                      // start åpen?
     }
     Native <details> – virker fra file://, tastaturvennlig, ingen avhengigheter. */
  function htmlFromListish(v, ordered) {
    if (v == null) return "";
    if (Array.isArray(v)) {
      if (!v.length) return "";
      var tag = ordered ? "ol" : "ul";
      return "<" + tag + ">" + v.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</" + tag + ">";
    }
    if (v.nodeType) return v;
    return String(v);
  }
  IN.examTask = function (host, data) {
    if (typeof host === "string") host = qs(host);
    if (!host) return;
    var d = data || {};
    var card = el("details", { class: "examtask" });
    if (d.open) card.setAttribute("open", "");
    var sum = el("summary", { class: "examtask-sum" });
    if (d.year) sum.appendChild(el("span", { class: "et-year", text: d.year }));
    sum.appendChild(el("span", { class: "et-title", text: d.title || "Eksamensoppgave" }));
    if (d.oppgave_nr) sum.appendChild(el("span", { class: "et-nr muted small", text: d.oppgave_nr }));
    if (d.points != null) sum.appendChild(el("span", { class: "et-pts", text: d.points + "p" }));
    sum.appendChild(el("span", { class: "et-chev", "aria-hidden": "true" }));
    card.appendChild(sum);

    var body = el("div", { class: "examtask-body" });
    function section(label, cls, content) {
      if (content == null || content === "") return;
      var sec = el("div", { class: "et-sec " + cls });
      sec.appendChild(el("div", { class: "et-lbl", text: label }));
      var c = el("div", { class: "et-content" });
      if (content.nodeType) c.appendChild(content);
      else c.innerHTML = String(content);
      sec.appendChild(c);
      body.appendChild(sec);
    }
    section("Oppgaven", "oppgave", htmlFromListish(d.oppgave, false));
    section("Løsningsgjennomgang", "losning", htmlFromListish(d.losning, true));
    if (d.kjerne) section("Kjernepoeng", "kjerne", htmlFromListish(d.kjerne, false));
    section("Eksamenstips", "tips", htmlFromListish(d.tips, false));
    card.appendChild(body);
    host.appendChild(card);
    return card;
  };

  /* Monter en liste av eksamensoppgaver i samme vert. */
  IN.examTasks = function (host, arr) {
    if (typeof host === "string") host = qs(host);
    if (!host || !arr) return;
    clear(host);
    arr.forEach(function (d) { IN.examTask(host, d); });
  };

  /* ---------- Generelle tooltips: alle elementer med data-tip ----------
     Deler den flytende boksen #pc-tip med pseudokodelinjene, så bare én vises om gangen.
     Desktop: hover/fokus. Mobil (ingen hover): trykk for å vise, trykk igjen, utenfor
     eller scroll for å lukke. Teksten settes som ren tekst (textContent). */
  IN.tips = function (root) {
    var tip = document.getElementById("pc-tip");
    if (!tip) {
      tip = el("div", { id: "pc-tip", class: "pc-tip", role: "tooltip" });
      tip.hidden = true;
      document.body.appendChild(tip);
    }
    var st = IN.tips._st || (IN.tips._st = { current: null, shownAt: 0 });
    function show(t) {
      tip.textContent = t.getAttribute("data-tip");
      tip.hidden = false;
      var r = t.getBoundingClientRect();
      var tw = tip.getBoundingClientRect().width;
      var vw = document.documentElement.clientWidth;
      var left = window.pageXOffset + r.left;
      var maxLeft = window.pageXOffset + vw - tw - 10;
      if (left > maxLeft) left = Math.max(window.pageXOffset + 8, maxLeft);
      tip.style.left = left + "px";
      tip.style.top = (window.pageYOffset + r.bottom + 6) + "px";
      st.current = t; st.shownAt = Date.now();
    }
    function hide() { tip.hidden = true; st.current = null; }
    qsa("[data-tip]", root || document).forEach(function (t) {
      if (t._tipBound) return;
      t._tipBound = true;
      t.classList.add("has-tip");
      if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "0");
      t.addEventListener("mouseenter", function () { show(t); });
      t.addEventListener("mouseleave", hide);
      t.addEventListener("focus", function () { show(t); });
      t.addEventListener("blur", hide);
      // På touch kommer mouseenter rett før click – ikke lukk det som nettopp åpnet seg.
      t.addEventListener("click", function () {
        if (st.current === t && Date.now() - st.shownAt > 400) hide(); else show(t);
      });
    });
    if (!st.docBound) {
      st.docBound = true;
      document.addEventListener("click", function (e) {
        if (st.current && !st.current.contains(e.target)) hide();
      });
      window.addEventListener("scroll", function () { if (st.current) hide(); }, { passive: true });
    }
  };

  /* ---------- Småverktøy ---------- */
  IN.store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Oppstart ---------- */
  function boot() {
    buildNav();
    buildLevelBar();
    IN.tabs(document);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
