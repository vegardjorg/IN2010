/* ============================================================
   IN2010 guide · kort/grafer.js
   Eksamenskortene for Grafer (06-grafer.html): én definisjon per kort, lest av temasiden og crash.html.
   Oppgavetekstene står ordrett med kildelinje (som før). Fullpoengssvar og sensorveiledning
   ligger i perfekt/grafer.js (og perfekt/delt.js for oppgaver som deles med andre sider).
   Lastes etter perfekt/*.js. Se IN.kortData i core.js.
   ============================================================ */
(function () {
  "use strict";
  var IN = window.IN, qs = IN.qs, qsa = IN.qsa, el = IN.el, A = IN.algos, G = IN.gen, GR = IN.grafer.G;
  var SIDE = "grafer";
  function def(key, meta, fn) { meta.side = SIDE; return IN.kortData.def(key, meta, fn); }

  function N(id, x, y, o) { var n = { id: id, x: x, y: y }; if (o) for (var k in o) n[k] = o[k]; return n; }
  function copy(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in (b || {})) o[k] = b[k]; return o; }
  var DASH = "transparent;border:2px dashed var(--c-compare);box-sizing:border-box";
  var RING = "transparent;border:3px solid var(--c-target);box-sizing:border-box";
  var LEG_TRAV = [{ cls: "compare", label: "Nå / kanten vi sjekker" }, { color: DASH, label: "I køen" }, { color: RING, label: "Oppdaget" },
                  { cls: "sorted", label: "Ferdig" }, { cls: "target", label: "Kant i søketreet" }];
  var LEG_DFS = [{ cls: "compare", label: "Nå / kanten vi sjekker / ny startnode" }, { color: RING, label: "Besøkt, på kallstakken" },
                 { cls: "sorted", label: "Ferdig" }, { cls: "target", label: "Kant i DFS-treet" }];
  var LEG_TOP = [{ cls: "compare", label: "Nå" }, { color: DASH, label: "På stakken" }, { cls: "sorted", label: "I output" }, { cls: "swap", label: "Kom aldri med (sykel)" }];
  var LEG_DIJ = [{ cls: "compare", label: "Nå / kanten vi relakserer" }, { color: DASH, label: "I køen" }, { cls: "sorted", label: "Ferdig (visited)" }, { cls: "target", label: "Beste kjente vei" }];
  var LEG_MST = [{ cls: "compare", label: "Kanten vi ser på" }, { cls: "sorted", label: "Med i treet" }, { cls: "target", label: "Kant i spenntreet" }];
  var LEG_KRU = [{ cls: "compare", label: "Kanten vi ser på" }, { cls: "target", label: "Valgt kant" },
                 { label: "Tre 1 (samme farge = samme tre)", color: "var(--gv-c0)" }, { label: "Tre 2", color: "var(--gv-c1)" }];
  var LEG_SCC = [{ cls: "compare", label: "Nå" }, { color: RING, label: "På kallstakken (fase 1)" }, { cls: "sorted", label: "Ferdig, lagt på stack (fase 1)" },
                 { label: "Komponent 1 (fase 2)", color: "var(--gv-c0)" }, { label: "Komponent 2", color: "var(--gv-c1)" }, { label: "Komponent 3", color: "var(--gv-c2)" }];
  var LEG_CYC = [{ cls: "compare", label: "Nå / kanten vi sjekker" }, { color: RING, label: "Besøkt" }, { cls: "sorted", label: "Ferdig" }, { cls: "swap", label: "Sykelen" }];

  // Statisk graf i en vert (kort på Begreper m.m.)
  function mini(sel, g, extra, scale) { IN.vizGraph(qs(sel), copy({ g: g }, extra), { scale: scale || 0.85 }); }
  // Figur til IN.oppg: en graf med fast målestokk
  function gFig(g, cap, extra, o) {
    o = o || {};
    return { cap: cap, cls: o.cls, draw: function (h) {
      IN.vizGraph(h, copy({ g: g }, extra), { scale: o.scale || 0.8, ariaLabel: (cap ? cap.replace(/<[^>]+>/g, "") + ": " : "") + (g.directed ? "rettet" : "urettet") + " graf" });
    } };
  }
  function pcFig(algo) { return { cls: "code", draw: function (h) { IN.pseudo.render(h, algo, { head: false, tooltips: false }); } }; }
  function demoLink(fane, demo, txt) { return '<p class="small muted">Prøv selv: <a href="#fane=' + fane + "&amp;oppg=" + demo + '">' + txt + "</a>.</p>"; }
  // Løsning: merket liste (a), (b), … + pseudokode (nøkler i IN.algos eller egne objekter)
  function sol(items, algos, o) {
    o = o || {};
    var d = el("div");
    if (o.intro) d.appendChild(el("p", { html: o.intro }));
    var ol = el(o.plain ? "ul" : "ol", o.plain ? {} : { class: "et-parts" }); items.forEach(function (x) { ol.appendChild(el("li", { html: x })); }); d.appendChild(ol);
    if (o.figs) d.appendChild(IN.oppg({ figs: o.figs }));
    (algos || []).forEach(function (key) {
      var a = typeof key === "string" ? A[key] : key;
      d.appendChild(el("h5", { style: "margin:.8rem 0 .3rem", text: "Pseudokode: " + a.name }));
      var h = el("div"); d.appendChild(h); IN.pseudo.render(h, a, typeof key === "string" ? {} : { tooltips: false });
    });
    if (o.outro) d.appendChild(el("div", { html: o.outro }));
    return d;
  }
  function P(name, params, lines) { return { name: name, params: params, lines: lines.map(function (l) { return { code: l[1], indent: l[0] }; }) }; }
  function tab(head, rows) {
    return '<div style="overflow-x:auto;max-width:100%"><table class="et-tab"><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return i ? "<td>" + c + "</td>" : '<th style="text-align:left">' + c + "</th>"; }).join("") + "</tr>"; }).join("") + "</table></div>";
  }


  /* ===================== EKSAMEN (oppgavetekst ordrett med kildelinje) ===================== */
  // Perfekt svar og sensorveiledning: assets/js/perfekt/grafer.js (IN.PERFEKT[key]).
  // Tomt prosedyreskjelett som på arket (Input/Output + «// · · ·»), rendret i .et-skel nr. i i oppgaveteksten
  function skel(node, specs) {
    var hosts = qsa(".et-skel", node);
    specs.forEach(function (sp, i) {
      if (!hosts[i]) return;
      IN.pseudo.render(hosts[i], { name: sp.name, params: sp.params, input: sp.input, output: sp.output, lines: [{ code: sp.fill || "// · · ·", indent: 1 }] }, { tooltips: false });
    });
    return node;
  }
  var SKEL = '<div class="et-skel"></div>';
  var AVVIK_PLASS = "Figurene står over eller under teksten, ikke ved siden av, fordi siden også skal fungere på en smal mobilskjerm.";
  var AVVIK_TEGNET = "Grafene er tegnet på nytt med guidens graftegning, fordi arket bare har dem som bilde. Nodene og kantene er de samme.";
  function pfKode(key, i) { var p = IN.PERFEKT && IN.PERFEKT[key]; return p && p.svar[i] && typeof p.svar[i].kode === "object" ? p.svar[i].kode : null; }
  function pfKoder(list) { return list.map(function (x) { return typeof x === "string" ? x : pfKode(x[0], x[1]); }).filter(Boolean); }
  // Svar fra sluttsteget til eldre generatorer (brukes av demo-sjekken)
  function panelOf(s, label) { var p = (s && s.panel || []).filter(function (x) { return x.label === label; })[0]; return p ? p.items : []; }
  var SV = {
    cycD: function (s) { return s ? (s.tag === "Sykel!" ? "true" : "false") : null; },
    cycU: function (s) { return panelOf(s, "Svar:")[0] || null; },
    prim: function (s) { return panelOf(s, "Totalvekt:")[0] || null; },
    runder: function (s) { return panelOf(s, "Komponenter:").filter(function (c) { return c.indexOf(",") >= 0; }).sort().join(", ") || null; },
    sisteKruskal: function (s) {
      var ok = panelOf(s, "Kanter, sortert:").filter(function (x) { return x.indexOf("✓") >= 0; });
      var m = ok.length ? /(\d+)\s*✓/.exec(ok[ok.length - 1]) : null;
      return m ? m[1] : null;
    }
  };
  var LEG_T2 = IN.grafer.LEG_T2;   // delt med kort/strategi.js (data-grafer.js)
  var LEG_2P = [{ cls: "target", label: "Sti 1 (framover i C)" }, { cls: "min", label: "Sti 2 (bakover i C)" }, { cls: "compare", label: "Nå" }, { cls: "sorted", label: "Skrevet ut" }];
  var LEG_GC = [{ cls: "compare", label: "Nå / kanten vi følger" }, { cls: "target", label: "Rot i R (ikke besøkt ennå)" }, { cls: "sorted", label: "Kan nås fra R (visited)" }, { cls: "swap", label: "Frigjort (Free)" }];
  var LEG_2C = [{ cls: "compare", label: "Nå / kanten vi sjekker" }, { color: DASH, label: "På stakken" }, { label: "Rød (R)", color: "var(--gv-c1)" }, { label: "Blå (B)", color: "var(--gv-c0)" }, { cls: "swap", label: "Naboer med samme farge" }];
  var LEG_LOG = [{ cls: "compare", label: "Nå (tatt ut av heapen)" }, { color: DASH, label: "I heapen (klar)" }, { cls: "sorted", label: "Skrevet ut" }];
  var LEG_SET = [{ cls: "compare", label: "Nå" }, { label: "Komponent 1", color: "var(--gv-c0)" }, { label: "Komponent 2", color: "var(--gv-c1)" }, { cls: "swap", label: "Summen er ikke 0" }];
  var LEG_DIA = [{ cls: "compare", label: "Nå" }, { cls: "target", label: "Startnode (inngrad 0)" }, { color: DASH, label: "På stakken" }, { cls: "sorted", label: "Besøkt i dette søket" }, { cls: "swap", label: "Nådd for andre gang: diamant" }];
  var LEG_JAZZ = [{ cls: "compare", label: "Nå / kanten vi sjekker" }, { cls: "target", label: "Deg (s)" }, { color: DASH, label: "I køen" }, { cls: "sorted", label: "Talt med" }];

  // H2020 oppg. 3: G (urettet) og H (rettet) med samme, umerkede noder
  var POS20 = [["a", 40, 162], ["b", 180, 60], ["c", 318, 60], ["d", 455, 162], ["e", 110, 267], ["f", 387, 267]];
  function g20(directed, edges) { return { directed: directed, nodes: POS20.map(function (p) { return N(p[0], p[1], p[2], { label: "" }); }), edges: edges }; }
  var G20 = g20(false, [["a", "b"], ["b", "c"], ["b", "f"], ["c", "e"], ["c", "d"], ["a", "e"], ["e", "f"]]);
  var H20 = g20(true, [["a", "b"], ["b", "c"], ["c", "d"], ["a", "e"], ["c", "e"], ["b", "f"], ["e", "f"]]);
  // H2020 oppg. 8 (e): fire små grafer på A, B, C, D (kvadrat)
  function sq(edges, w) { return { directed: false, nodes: [N("A", 0, 0), N("B", 90, 0), N("C", 0, 90), N("D", 90, 90)], edges: edges.map(function (e) { var diag = (e[0] + e[1] === "AD" || e[0] + e[1] === "BC"); return [e[0], e[1], w != null ? w : e[2], diag ? { t: e[0] === "A" ? 0.28 : 0.72 } : null]; }) }; }
  var T1 = sq([["A", "B"], ["A", "C"], ["A", "D"], ["B", "C"], ["B", "D"], ["C", "D"]], 10);
  var T2 = sq([["A", "B"], ["A", "C"], ["B", "C"], ["B", "D"], ["C", "D"]], 8);
  var T3 = sq([["A", "C"], ["A", "D"], ["B", "D"]], 3);
  var T4 = sq([["A", "D"], ["B", "C"]], 1);
  var S20 = sq([["A", "B", 8], ["C", "D", 8], ["A", "C", 3], ["B", "D", 3], ["A", "D", 1], ["B", "C", 1]]);
  // H2020 oppg. 8 (a) og (d): egen eksempelgraf med den hamiltonske sykelen A, B, C, D, E, F og to korder (delt, data-grafer.js)
  var HEX = GR.hex;
  // H2020 oppg. 8 (h): E1–E4 slått sammen (letteste kant per par; alle andre par har vekt 10 fra E1)
  var OCT = (function () {
    var pos = { A: [200, 20], B: [292, 58], C: [330, 150], D: [292, 242], E: [200, 280], F: [108, 242], G: [70, 150], H: [108, 58] }, V = "ABCDEFGH".split(""), w = {};
    function k(a, b) { return a < b ? a + b : b + a; }
    V.forEach(function (a) { V.forEach(function (b) { if (a < b) w[a + b] = 10; }); });
    function put(list, x) { list.split(" ").forEach(function (p) { w[k(p[0], p[1])] = Math.min(w[k(p[0], p[1])], x); }); }
    put("AB BC CD DE EF FG GH EH FH FA", 8); put("AC BC CD DE EF FG GH", 3); put("AD CD BD FG", 1);
    return { directed: false, nodes: V.map(function (v) { return N(v, pos[v][0], pos[v][1]); }), edges: Object.keys(w).map(function (p) { return [p[0], p[1], w[p]]; }) };
  })();
  // H2021 oppg. 11: egen graf (todelt) + en variant med en odde sykel
  var TC = { directed: false, nodes: [N("A", 20, 90), N("B", 110, 20), N("C", 110, 160), N("D", 200, 90), N("E", 290, 90), N("F", 380, 90)],
    edges: [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["D", "E"], ["E", "F"]] };
  var TC_ODD = copy(TC, { edges: TC.edges.concat([["B", "C"]]) });
  // H2021 oppg. 12: Whops!-oppgjør
  var G1W = { directed: false, nodes: [N("0", 57, 0), N("1", 0, 40), N("4", 113, 40), N("2", 22, 107), N("3", 91, 107)], edges: [["0", "1"], ["1", "2"], ["4", "3"]] };
  var G2W = { directed: false, nodes: [N("0", 0, 0), N("1", 59, 0), N("2", 0, 59), N("3", 59, 59)], edges: [["0", "2"], ["1", "3"]] };
  var T1W = { 0: 500, 1: -200, 2: -300, 3: -50, 4: 50 }, T2W = { 0: 300, 1: -250, 2: 0, 3: -50 };
  // H2021 oppg. 13: Whops!-logger (hendelsene som bokser, navn som på arket)
  var LOGG = { directed: true, nodes: [
      N("A1", 90, 20, { label: "A sent 50 to B at 1", w: 170 }), N("A4", 330, 20, { label: "A sent 100 to C at 4", w: 178 }),
      N("C3", 330, 100, { label: "C received 100 from A at 3", w: 206 }), N("C5", 570, 100, { label: "C sent 200 to B at 5", w: 178 }),
      N("B2", 90, 180, { label: "B received 50 from A at 2", w: 198 }), N("B6", 570, 180, { label: "B received 200 from C at 6", w: 206 })],
    edges: [["A1", "A4"], ["A1", "B2"], ["B2", "B6"], ["A4", "C3"], ["C3", "C5"], ["C5", "B6"]] };
  // H2022 oppg. 3: grafegenskaper
  var G1P = { directed: false, nodes: [N("A", 0, 0), N("B", 79, 0), N("C", 40, 79), N("D", 118, 79), N("E", 99, 158), N("F", 79, 237)],
    edges: [["A", "B"], ["B", "C"], ["B", "D"], ["C", "F"], ["E", "F"]] };
  var G2P = { directed: false, nodes: [N("A", 0, 0), N("B", 79, 0), N("C", 40, 79), N("D", 118, 79), N("E", 99, 158), N("F", 79, 237)],
    edges: [["A", "C"], ["B", "C"], ["C", "E"], ["C", "F"], ["D", "E"], ["E", "F"]] };
  // H2022 oppg. 8: egen objektgraf (A, E er røtter; D ↔ F er en ring ingen rot når)
  var GCG = { directed: true, nodes: [N("A", 30, 30), N("B", 160, 30), N("C", 95, 130), N("E", 30, 230), N("D", 230, 150), N("F", 330, 210), N("G", 290, 30), N("H", 160, 230)],
    edges: [["A", "B"], ["B", "C"], ["C", "A"], ["E", "C"], ["D", "F"], ["F", "D", null, { bend: 0.25 }], ["G", "B"]] };
  // H2023 oppg. 7: avhengigheter (som på arket) + egne varianter
  var SIRK = { directed: true, nodes: [N("A", 0, 60), N("B", 90, 60), N("C", 170, 0), N("D", 170, 120)], edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "B"]] };
  var DIAM = { directed: true, nodes: [N("A", 0, 60), N("B", 90, 0), N("C", 90, 120), N("D", 180, 60)], edges: [["A", "B"], ["B", "D"], ["A", "C"], ["C", "D"]] };
  var NODIAM = copy(DIAM, { edges: [["A", "B"], ["B", "D"], ["A", "C"]] });
  // H2024 oppg. 4: eget vennenettverk
  var JZ = { directed: false, nodes: [N("S", 30, 100), N("A", 130, 40), N("B", 130, 160), N("C", 230, 40), N("D", 230, 160), N("E", 330, 40), N("F", 330, 160)],
    edges: [["S", "A"], ["S", "B"], ["A", "B"], ["B", "D"], ["A", "C"], ["C", "E"], ["D", "F"]] };
  var JZM = { S: ["jazz"], A: ["jazz"], B: ["klassisk", "pop"], C: ["jazz", "folk"], D: ["pop"], E: ["klassisk"], F: ["klassisk"] };
  // H2024 oppg. 8: eget turområde (to rundturer, ingen node på to sykler)
  var DNT = { directed: true, nodes: [N("G", 20, 90), N("A", 100, 30), N("B", 200, 30), N("C", 150, 130), N("D", 250, 130), N("E", 350, 130), N("F", 300, 220), N("H", 400, 220)],
    edges: [["G", "A"], ["A", "B"], ["B", "C"], ["C", "A"], ["C", "D"], ["D", "E"], ["E", "F"], ["F", "D"], ["F", "H"]] };

  var TYPER = "<p>Type 1 er en urettet komplett graf (brevduene)<br>Type 2 er en urettet graf med en hamiltonsk sykel (sykkelstien)<br>" +
    "Type 3 er et urettet tre (nettverkskabler)<br>Type 4 er en urettet ikke-sammenhengende graf (roping)</p><p>Alle grafer i denne oppgaven har mer enn to noder.</p>";
  var INSPERA = "Svaralternativene var et flervalg i Inspera og står ikke på arket. De er hentet fra sensorveiledningen.";

    def("H2020-3", { host: "#exam-h2020-3" }, function () { return { key: "H2020-3", year: "H2020", title: "Grafegenskaper", oppgave_nr: "Oppgave 3", points: 8,
      kilde: "Oppgavetekst: UiO, IN2010, H2020, oppgave 3", ark: "Grafegenskaper", ordrett: true,
      oppgave: IN.oppg({
        intro: "<p>Vi er gitt en urettet graf G, og en rettet graf H som ser slik ut:</p>",
        figs: [gFig(G20, "G", {}, { scale: 0.6 }), gFig(H20, "H", {}, { scale: 0.6 })],
        parts: ["Må vi legge til eller fjerne kanter for at G skal bli sammenhengende?", "Må vi legge til eller fjerne kanter for at G ikke skal bli sammenhengende?",
          "Må vi legge til eller fjerne kanter for at G skal bli et tre?", "Må vi legge til eller fjerne kanter for at G ikke skal bli et tre?",
          "Må vi legge til eller fjerne kanter for at H skal bli en DAG?", "Må vi legge til eller fjerne kanter for at H ikke skal bli en DAG?",
          "Må vi legge til eller fjerne kanter for at H skal bli sterkt sammenhengende?", "Må vi legge til eller fjerne kanter for at H ikke skal bli sterkt sammenhengende?",
          { note: "Svaralternativer: «den er allerede (…), så ingenting» · «legge til kanter» · «fjerne kanter»." }]
      }),
      avvik: [AVVIK_PLASS, AVVIK_TEGNET, INSPERA, "Spørsmålene er punkter på arket. Her har de bokstaver, fordi svarene viser til dem.", "Arket og sensorveiledningen fordeler ikke de 8 poengene, så det står ingen poeng ved spørsmålene."],
      losning: sol(["<b>Ingenting.</b> G er allerede sammenhengende: alle nodene kan nås fra hverandre.",
        "<b>Fjerne.</b> Fjern alle kantene rundt én node, så blir den isolert.",
        "<b>Fjerne.</b> G har 6 noder og 7 kanter, men et tre har |V| − 1 = 5. G har sykler som må brytes.",
        "<b>Ingenting.</b> G har sykler, så den er allerede ikke et tre.",
        "<b>Ingenting.</b> H har ingen rettet sykel. Alle kantene går «framover» (venstre mot høyre eller nedover), så H er allerede en DAG.",
        "<b>Legge til.</b> En kant tilbake (for eksempel fra noden nederst til høyre opp til noden øverst til venstre) lager en sykel.",
        "<b>Legge til.</b> Noden lengst til høyre har ingen utgående kanter, så ingen andre kan nås fra den. Vi må legge til kanter.",
        "<b>Ingenting.</b> H er allerede ikke sterkt sammenhengende."]),
      kjerne: "<p>Sjekk hver definisjon: sammenheng (sti mellom alle par), tre (sammenhengende + |E| = |V| − 1), DAG (ingen rettet sykel), sterkt sammenhengende (sti begge veier mellom alle par).</p>",
      tips: ["Å fjerne kanter kan aldri gjøre en graf mer sammenhengende, og å legge til kanter kan aldri fjerne en sykel. Det avgjør ofte svaret raskt."]
    }; });

    def("H2022-3", { host: "#exam-h2022-2" }, function () { return { key: "H2022-3", year: "H2022", title: "Grafegenskaper", oppgave_nr: "Oppgave 3", points: 10,
      kilde: "Oppgavetekst: UiO, IN2010, H2022, oppgave 3", ark: "Grafegenskaper", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>Her er to grafer:</p>",
        figs: [gFig(G1P, "G1", {}, { scale: 0.75 }), gFig(G2P, "G2", {}, { scale: 0.75 })],
        parts: [{ t: "Grafen er sammenhengende", p: 1 }, { t: "Grafen er 2-sammenhengende", p: 1 }, { t: "Grafen er et tre", p: 1 },
          { t: "Grafen har mer enn to seprasjonsnoder", p: 1 }, { t: "Grafen har to (forskjellige) stier fra B til F", p: 1 },
          { t: "Grafen har to komponenter", p: 1 }, { t: "Grafen er rettet", p: 1 }, { t: "Grafen inneholder en sykel", p: 1 },
          { t: "Grafen blir ett tre hvis vi fjerner én kant", p: 1 }, { t: "Grafen er en enkel graf", p: 1 },
          { note: "Svaralternativer for hver påstand: Ingen · G1 · G2 · Begge." }]
      }),
      avvik: [AVVIK_PLASS, AVVIK_TEGNET, "Påstandene og svaralternativene var en tabell i Inspera og står ikke på arket. De er hentet fra sensorveiledningen.",
        "Sensorveiledningen sier at påstanden som var uthevet i rødt, var uklar og ble tatt ut av vurderingen. Det er «Grafen blir ett tre hvis vi fjerner én kant»."],
      losning: sol(["<b>Begge.</b>", "<b>Ingen.</b> Begge har separasjonsnoder (for eksempel B i G1 og C i G2).", "<b>G1.</b> 6 noder, 5 kanter og sammenhengende.",
        "<b>G1.</b> G1 har B, C og F. G2 har bare C og E.",
        "<b>G2.</b> B – C – F og B – C – E – F. (I et tre som G1 finnes det bare én sti.)",
        "<b>Ingen.</b> Begge er sammenhengende, altså én komponent.", "<b>Ingen.</b>", "<b>G2.</b> C – E – F – C.",
        "<b>G2.</b> Fjern en kant på sykelen C – E – F. (Tatt ut av vurderingen fordi formuleringen var uklar. Vår tolkning: G1 er alt et tre, så det er uklart om den skal telle med.)",
        "<b>Begge.</b> Ingen løkker og ingen parallelle kanter."]),
      kjerne: "<p>I et tre med minst tre noder er alle nodene som ikke er løvnoder, separasjonsnoder. En sykel gir alternative stier, og nodene på sykelen skiller ikke lenger resten av sykelen fra hverandre.</p>",
      tips: ["Tell kanter: et sammenhengende tre har |V| − 1. Én kant til gir nøyaktig én sykel."]
    }; });

    def("H2022-6", { host: "#exam-h2022-5" }, function () { return { key: "H2022-6", year: "H2022", title: "Kjøretid på grafalgoritmer", oppgave_nr: "Oppgave 6", points: 8,
      kilde: "Oppgavetekst: UiO, IN2010, H2022, oppgave 6", ark: "Kjøretid på grafalgoritmer", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>For hver grafalgoritme, kryss av på den (laveste) korrekte kjøretidskompleksiteten.</p>" +
          tab(["", "O(1)", "O(|V| + |E|)", "O((|V| + |E|) · log(|V|))", "O(|V| · |E|)"],
            [["DFSFull", "", "", "", ""], ["Prim", "", "", "", ""], ["TopSort", "", "", "", ""], ["BellmanFord", "", "", "", ""]]) +
          "<p>Korte beskrivelser av algoritmene:</p><ul><li>DFSFull: Besøker alle noder i en graf nøyaktig én gang (dybde-først)</li><li>Prim: Finner et minimalt spenntre av en gitt graf</li>" +
          "<li>TopSort: Gir en topologisk ordning av nodene i en gitt graf</li><li>BellmanFord: Finner korteste stier fra én til alle andre noder</li></ul>",
        parts: [{ note: "2p per riktig rad*." }]
      }),
      avvik: "Poengene står ikke på arket. «2 poeng per riktig svar» er hentet fra sensorveiledningen.",
      losning: sol(["DFSFull: <b>O(|V| + |E|)</b>.", "Prim: <b>O((|V| + |E|) · log(|V|))</b> (kurset skriver også O(|E| · log(|V|))).",
        "TopSort: <b>O(|V| + |E|)</b>.", "BellmanFord: <b>O(|V| · |E|)</b>."], null, { plain: true }),
      kjerne: "<p>Søk og topologisk sortering er lineære. Prioritetskø gir en log-faktor. Bellman-Ford relakserer alle kantene |V| − 1 ganger.</p>",
      tips: ["Se tabellen «Kjøretider på ett sted» over. Lær begrunnelsen, ikke bare tallet."]
    }; });

    def("H2024-4", { host: "#exam-h2024-4" }, function () { return { key: "H2024-4", year: "H2024", title: "Jazz eller klassisk?", oppgave_nr: "Oppgave 4", points: 10,
      kilde: "Oppgavetekst: UiO, IN2010, H2024, oppgave 4", ark: "Jazz eller klassisk?", ordrett: true, poengkilde: "sv",
      oppgave: skel(IN.oppg({
        intro: "<p>Du ønsker å invitere venner med på konsert, og er usikker på om du skal invitere til jazz eller klassisk, som er de to eneste sjangrene du liker. Gjennom et lite musikknettverk har du god oversikt over din egen musikksmak, musikksmaken til dine venner, dine venners venner og dine venners venners venner etc. Musikksmaken til en venn (eller en venns venn etc.) v er gitt av en ordbok M, der M[v] er en mengde av sjangre. For eksempel, kan M[v] være {\"jazz\", \"pop\", \"folk\"}.</p>",
        parts: [{ t: "Hvordan kan du representere musikknettverket som en graf? Hva representerer nodene og kantene i grafen?", p: 1 },
          { note: "Selv om du gjerne vil ha med deg mange på konsert, er det begrenset hvor perifere venner du vil ha med. Du setter en grense k som angir hvor mange venneledd du er villig til å gå gjennom. For eksempel, hvis k = 1, vil du kun invitere dine egne venner. Hvis k = 2 vil du både invitere dine egne venner og deres venner." },
          { t: "Skriv en algoritme som tar en graf G = (V, E), en ordbok M, en startnode s ∈ V, og et positivt heltall k som input. Den skal returnere \"jazz\" eller \"klassisk\" avhengig av hvilken sjanger som flest liker innen k ledd av venner. Du kan anta at det ikke er like mange som liker jazz og klassisk." + SKEL, p: 7 },
          { t: "Nå vil du sende ut invitasjoner. Du ønsker først å invitere dine egne venner, deretter dine venners venner, og så videre. Hvilken algoritme, kjent fra pensum, egner seg til å sende ut invitasjoner på denne måten?", p: 2 }]
      }), [{ name: "JazzOrClassical", params: "G, M, s, k", input: "En graf G = (V, E), en ordbok M, en startnode s ∈ V og et heltall k", output: "En streng \"jazz\" eller \"klassisk\"" }]),
      avvik: "Arket har ingen eksempelgraf. Steg-demoen kjører på vårt eget vennenettverk.",
      demo: { engine: "graph", gen: "grJazz", input: [JZ, JZM, "S", 2], inputNavn: "Eget nettverk, k = 2", presets: { "Samme nettverk, k = 3": [JZ, JZM, "S", 3] },
        pseudo: "jazzOrClassical", legend: LEG_JAZZ, label: "Kjør JazzOrClassical fra s = S med k = 2", del: "(b)", fasit: "jazz" },
      losning: sol(["Nodene er personer og kantene vennskap. Vennskap går begge veier, så grafen er urettet (en rettet graf ga like mye uttelling).",
        "Bredde-først søk fra s som lagrer avstanden (antall ledd) til hver node, og som ikke går videre fra noder på avstand k. Tell jazz og klassisk for alle nodene søket når. O(|V| + |E|).",
        "<b>Bredde-først søk (BFS)</b>: det besøker nodene lag for lag, altså venner før venners venner."], ["jazzOrClassical"],
        { outro: "<p class=\"small\">Linja <code>if dist[u] &lt; k</code> gjør at noder på avstand k blir talt med, men at vi ikke går videre fra dem. Sensors kode teller også s, fordi s ligger i visited. Arket tyder heller på at bare vennene skal telles, og valget kan avgjøre svaret: i presetet med k = 3 blir det uavgjort hvis s telles med. Si hva du velger.</p>" }),
      kjerne: "<p>«Innen k ledd» = korteste avstand i antall kanter ≤ k. Det er nøyaktig det BFS beregner.</p>",
      tips: ["Tips: velg BFS i (b). Sensorveiledningens forslag er et dybdebegrenset DFS med felles visited. I noen grafer kan det nå en venn via en lang omvei først, merke den som besøkt og så ikke gå videre fra den, selv om den egentlig er nærmere. BFS når hver node via en korteste sti først.",
        "Sensorveiledningen trekker 3 poeng i (b) hvis k ikke tas høyde for i det hele tatt."]
    }; });

    def("H2022-8", { host: "#exam-h2022-7" }, function () { return { key: "H2022-8", year: "H2022", title: "Garbage collection", oppgave_nr: "Oppgave 8", points: 8,
      kilde: "Oppgavetekst: UiO, IN2010, H2022, oppgave 8", ark: "Garbage collection", ordrett: true,
      oppgave: skel(IN.oppg({
        intro: "<p>Mange moderne programmeringsspråk har en garbage collector, som er en prosedyre som frigjør minne som garantert ikke vil brukes i programmet lenger. Du skal utlede en enkel algoritme for garbage collection.</p>" +
          "<p>Vi kan anta at alt som lagres er objekter, der et objekt kan referere til andre objekter. Vi lar en G = (V, E) være en objektgraf, der V representerer alle objektene som er opprettet, og en (rettet) kant fra u til v betyr at objektet u har en referanse til objektet v. I tillegg har vi en mengde R med alle objektene som kan refereres til direkte (typisk objekter som refereres til av programvariabler). Alle objekter i R er også i V. Objekter det ikke finnes en referanse til via objekter i R er garantert å ikke bli brukt i programmet, og skal derfor frigjøres.</p>" +
          "<p>Det betyr at ingen av objektene i R skal frigjøres, og heller ingen objekter som kan nås gjennom referanser fra objekter i R skal frigjøres. Objektene som skal frigjøres er ikke i R, og kan heller ikke nås fra noe objekt i R.</p>" +
          "<p>Anta at du har en prosedyre Free som frigjør et objekt. Du skal gi en prosedyre GarbageCollect som tar en graf G = (V, E) og en mengde R som input, og kaller Free på alle objekter det ikke kan nås fra R.</p>" + SKEL
      }), [{ name: "GarbageCollect", params: "G, R", input: "En objektgraf G = (V, E) og en mengde R med objekter", output: "Frigjør alle objekter det ikke finnes en referanse til" }]),
      avvik: "Arket har ingen eksempelgraf. Steg-demoen kjører på vår egen objektgraf.",
      demo: { engine: "graph", gen: "grGC", input: [GCG, ["A", "E"]], inputNavn: "Egen objektgraf, R = {A, E}", presets: { "R = {G}": [GCG, ["G"]] },
        pseudo: "garbageCollect", legend: LEG_GC, label: "Kjør GarbageCollect med R = {A, E}", fasit: "D, F, G, H" },
      losning: sol(["Ett søk (DFS eller BFS) med <b>alle nodene i R som startpunkter</b> og én felles visited. Det som ikke er besøkt etterpå, kan ikke nås og frigjøres. Hver node og kant behandles én gang: O(|V| + |E|)."], ["garbageCollect"]),
      kjerne: "<p>«Alt som kan nås fra en mengde» = ett søk med flere startnoder. Da er det fortsatt lineært.</p>",
      tips: ["Sensorveiledningen gir opptil 4 poeng for riktig idé og trekker 2 poeng for løsninger som er tregere enn O(|V| + |E|). Et nytt visited for hvert objekt i R er et eksempel på det.", "Frigjør først etter at søket er ferdig, ellers kan du frigjøre noe som blir nådd senere."]
    }; });

    def("H2021-11", { host: "#exam-h2021-11" }, function () { return { key: "H2021-11", year: "H2021", title: "To-fargelegge en graf", oppgave_nr: "Oppgave 11", points: 10,
      kilde: "Oppgavetekst: UiO, IN2010, H2021, oppgave 11", ark: "To-fargelegge en graf", ordrett: true,
      oppgave: skel(IN.oppg({
        intro: "<p>Du er gitt en urettet og sammenhengende graf G = (V, E). Du skal lage en algoritme som fargelegger nodene i V med to farger R(rød) og B(blå), slik at ingen naboer (u, v) ∈ E har samme farge; hvis dette ikke er mulig, så skal algoritmen skrive ut at det ikke er mulig.</p>" +
          "<p>Du kan anta at hver node i V har et felt v.color som initielt er satt til null, og at du har tilgang på en funksjon FlipColor der FlipColor(R) = B og FlipColor(B) = R.</p>" + SKEL
      }), [{ name: "TwoColor", params: "G", input: "En sammenhengende graf G = (V, E)", output: "En graf der nodene er fargelagt hvis det er mulig" }]),
      avvik: "Arket har ingen eksempelgraf. Steg-demoen kjører på vår egen graf.",
      demo: { engine: "graph", gen: "grTwoColor", input: [TC], inputNavn: "Egen graf (kan tofarges)", presets: { "Med kanten {B, C} (odde sykel)": [TC_ODD] },
        pseudo: "twoColor", legend: LEG_2C, label: "Kjør TwoColor", fasit: "A R, B B, C B, D R, E B, F R" },
      losning: sol(["Start i en vilkårlig node med farge R, og gjør et dybde-først søk der hver nabo skal ha motsatt farge av noden vi kom fra. Møter vi en node som allerede har samme farge som noden vi kom fra, finnes det en sykel med odde lengde, og to-farging er umulig. Hver node fargelegges én gang og hver kant sjekkes fra begge ender: O(|V| + |E|)."], ["twoColor"]),
      kjerne: "<p>To-farging er et dybde-først (eller bredde-først) søk der fargen veksler for hvert steg. Fargen fungerer som visited.</p>",
      tips: ["Sensorveiledningen gir opptil 7 poeng for riktig idé med vesentlige feil i pseudokoden, og opptil 3 poeng for en riktig idé med veldig dårlig kjøretid.", "Grafen er oppgitt sammenhengende, så ett søk holder. Uten den antagelsen må du starte fra hver ufargede node."]
    }; });

    def("H2021-13", { host: "#exam-h2021-13" }, function () { return { key: "H2021-13", year: "H2021", title: "Whops!-logger", oppgave_nr: "Oppgave 13", points: 10,
      kilde: "Oppgavetekst: UiO, IN2010, H2021, oppgave 13", ark: "Whops!-logger", ordrett: true,
      oppgave: IN.oppg({
        intro: "<p>Tjenesten Whops! lar brukere overføre penger mellom hverandre gjennom en app. De prøver i så stor grad som mulig å unngå å lagre informasjon om brukerene sine sentralt, og lar heller informasjonen lagres på brukeren sin egen mobiltelefon.</p>" +
          "<p>En gang i blant har de behov for å anskaffe en komplett logg av overføringer for en periode for å kunne feilsøke systemene sine. Da henter de inn lokale logger fra noen utvalgte mobiltelefoner i systemet. En lokal logg er en liste av hendelser, der hver hendelse beskriver enten at et beløp er sent eller mottatt. I tillegg inneholder hver hendelse et tidsstempel som forteller når beløpet ble sendt eller motatt. For enkelhets skyld er tidsstemplene representert som positive heltall. Her er et lite eksempel på tre logger fra mobiltelefoner A, B og C.</p>" +
          '<div style="overflow-x:auto;max-width:100%"><table class="et-tab"><tr><th>A</th><th>B</th><th>C</th></tr>' +
          "<tr><td>A sent 50 to B at 1</td><td>B received 50 from A at 2</td><td>C received 100 from A at 3</td></tr>" +
          "<tr><td>A sent 100 to C at 4</td><td>B received 200 from C at 6</td><td>C sent 200 to B at 5</td></tr></table></div>" +
          "<p>Dessverre er tidsstemplene fra mobiltelefonene upålitelige. De observerer ofte at et mottak av et beløp forekommer før beløpet ble sendt, i følge tidsstemplene. I eksempelet ovenfor mottar C et beløp på 100 før A har sendt beløpet til C.</p>" +
          "<p>For å approksimere en riktig logg lar de hver hendelse fra de lokale loggene være noder i en rettet graf G = (V, E). Dersom to hendelser u og v kommer direkte etter hverandre i en lokal logg, så finnes det en rettet kant (u, v) i grafen. For hver hendelse u som representerer at et beløp er sendt, så finnes det en rettet kant (u, v) der v er hendelsen for det korresponderende mottaket av det beløpet. Her er grafen for eksempelet ovenfor:</p>",
        figs: [gFig(LOGG, "Grafen for eksempelet", {}, { scale: 0.85, cls: "wide" })],
        outro: "<p>Den ønskede komplette loggen for dette eksempelet skal se slik ut:</p>" +
          "<p>A sent 50 to B at 1<br>B received 50 from A at 2<br>A sent 100 to C at 4<br>C received 100 from A at 3<br>C sent 200 to B at 5<br>B received 200 from C at 6</p>" +
          "<p>Hver node v kan aksessere tidsstempelet fra loggen ved v.ts. Skriv en algoritme som tar rettet graf G = (V, E) som input, og skriver ut alle noder i V i en rekkefølge slik at:</p>" +
          "<ul><li>Dersom det finnes en kant fra u til v så skal u skrives ut før v.</li><li>u skal skrives ut før v hvis u.ts &lt; v.ts, så lenge det ikke bryter med det første kravet.</li></ul>"
      }),
      avvik: [AVVIK_PLASS, "Grafen er tegnet på nytt med guidens graftegning, fordi arket bare har den som bilde. Hver boks er én hendelse, og kantene er de samme som på arket."],
      demo: { engine: "graph", gen: "grLogSort", input: [LOGG], inputNavn: "Eksempelet fra arket", presets: false,
        pseudo: "logSort", legend: LEG_LOG, label: "Kjør PrintLog på eksempelet" },
      losning: sol(["Topologisk sortering med inngrader, men der de «klare» nodene (inngrad 0) ligger i en <b>prioritetskø ordnet på ts</b> i stedet for en stakk. Krav (1) sikres av topologisk sortering, og krav (2) av at vi alltid velger den klare noden med lavest tidsstempel. Hver node settes inn og tas ut én gang: O((|V| + |E|) · log(|V|)).<br>Sjekk med eksempelet: bare A1 (ts 1) er klar. Den gjør B2 og A4 klare, og B2 kommer først. Så A4, som gjør C3 klar, så C3, C5 og B6: nøyaktig ønsket logg."], ["logSort"]),
      kjerne: "<p>Topologisk sortering der valget mellom klare noder styres av en prioritetskø.</p>",
      tips: ["Sensorveiledningen gir opptil 5 poeng for en umodifisert topologisk sortering og opptil 8 for en kvadratisk løsning. Full uttelling krever O((|V| + |E|) log |V|).", "Å bare sortere på ts gir opptil 2 trøstepoeng. Det bryter krav (1) når tidsstemplene er feil."]
    }; });

    def("H2021-7", { host: "#exam-h2021-7" }, function () { return { key: "H2021-7", year: "H2021", title: "Korteste avstander i grafer", oppgave_nr: "Oppgave 7", points: 8,
      kilde: "Oppgavetekst: UiO, IN2010, H2021, oppgave 7", ark: "Korteste avstander i grafer", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>For hver graftype, velg den raskeste algoritmen som finner korteste avstander fra en startnode til alle andre noder i grafen.</p>" +
          tab(["", "Bredde-først søk", "Dijkstra", "Topologisk Sortering", "Bellman-Ford"],
            [["Ingen negative kanter", "", "", "", ""], ["Vektet DAG", "", "", "", ""], ["Uvektet", "", "", "", ""], ["Ingen negative sykler", "", "", "", ""]]) +
          "<ul><li>Uvektet: en uvektet graf. Grafen er enten rettet eller urettet.</li><li>Vektet DAG: en vektet, rettet asyklisk graf. Kantene kan ha negativ vekt.</li>" +
          "<li>Ingen negative kanter: grafen er vektet, men ingen kanter har negativ vekt. Grafen er enten rettet eller urettet.</li><li>Ingen negative sykler: grafen er vektet, men inneholder ingen sykler med negativ vekt. Grafen er enten rettet eller urettet.</li></ul>",
        parts: [{ note: "2p per riktig rad*." }]
      }),
      avvik: "Poengene står ikke på arket. «2 poeng per riktig svar» er hentet fra sensorveiledningen.",
      losning: sol(["Ingen negative kanter: <b>Dijkstra</b>, O((|V| + |E|) · log(|V|)).",
        "Vektet DAG: <b>topologisk sortering</b>, og relakser kantene i den rekkefølgen: O(|V| + |E|). Virker også med negative vekter.",
        "Uvektet: <b>bredde-først søk</b>, O(|V| + |E|).", "Ingen negative sykler: <b>Bellman-Ford</b>, O(|V| · |E|)."], null, { plain: true }),
      kjerne: "<p>Jo mer du vet om grafen, desto raskere algoritme kan du bruke. Bellman-Ford er reserveløsningen.</p>",
      tips: ["Dijkstra virker også på en uvektet graf og en DAG med positive vekter, men er ikke raskest der."]
    }; });

    def("H2023-6", { host: "#exam-h2023-6" }, function () { return { key: "H2023-6", year: "H2023", title: "Blindern-problemet", oppgave_nr: "Oppgave 6", points: 10,
      kilde: "Oppgavetekst: UiO, IN2010, H2023, oppgave 6", ark: "Blindern-problemet", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>Blindern-problemet er en utfordring som er kjent for mange studenter ved Universitet i Oslo, som oppstår når man må gå fra en forelesning til en annen på motsatt side av campus på et knapt kvarter. Du er blitt bedt om å konsultere i UiO sitt nye prosjekt hvor det skal utvikles et tunnelsystem som forbinder alle bygningene som hører til campus.</p>" +
          "<p>Det er allerede kartlagt hvor mye det vil koste å grave tunnel mellom hvert par av bygninger (og anta at ingen av de kartlagte tunnelene kolliderer). Din oppgave er å finne den mest kostnadseffektive måten å grave et tunnelsystem på, ut ifra de kartlagte tunnelene, slik at man kan gå mellom alle bygningene kun ved å bruke tunnelsystemet.</p>",
        parts: [{ t: "Forklar kort hvordan dette problemet kan uttrykkes som et grafproblem. Svaret ditt bør inkludere:<ul><li>Hva slags graf (rettet/urettet og vektet/uvektet) egner seg her?</li><li>Hva representerer nodene?</li><li>Hva representerer kantene?</li></ul>", p: 2 },
          { t: "Oppgi en egnet algoritme, kjent fra pensum, som kan brukes til å finne den mest kostnadseffektive måten å grave ut et tunnelsystem på, slik at man kan komme seg mellom alle bygningene kun ved å bruke tunnelsystemet. For algoritmen må du oppgi:<ul><li>de mest sentrale datastrukturene den bruker,</li><li>en kort forklaring på hvordan algoritmen fungerer, og</li><li>kjøretidskompleksiteten på algoritmen.</li></ul>", p: 5 },
          { t: "Prosjektet blir ferdig i rekordfart og er klar til å brukes. Beskriv, med naturlig språk, en effektiv algoritme for å finne korteste sti fra en bygning til en annet kun ved å bruke tunnelsystemet. Du kan bruke algoritmer kjent fra pensum uten å gjøre rede for dem. Oppgi kjøretidskompleksiteten på algoritmen.", p: 3 }]
      }),
      avvik: ["Poengene står ikke på arket. De er de øvre grensene fra sensorveiledningen: opptil 2 poeng for (a), opptil 5 for (b) og opptil 3 for en løsning med BFS eller DFS i (c).", "Arket har ingen graf. Steg-demoen kjører Prim på guidens egen eksempelgraf."],
      demo: { engine: "graph", gen: "grPrim", input: [GR.w6, "A"], inputNavn: "Guidens eksempelgraf, start A", presets: false,
        pseudo: "prim", legend: LEG_MST, label: "Kjør Prim fra A", del: "(b)", svar: SV.prim, fasit: "13" },
      losning: sol(["En <b>urettet, vektet og komplett</b> graf. Nodene er bygningene, kantene er mulige tunneler, og vekten er gravekostnaden.",
        "<b>Prim</b> (eller Kruskal). Prim starter i en vilkårlig bygning og legger hele tiden til den billigste tunnelen fra en bygning som er med til en som ikke er med. En prioritetskø holder kantene ordnet på vekt, og en ordbok (parents) holder styr på hvem som er med. Kjøretid O(|E| · log(|V|)); i en komplett graf er |E| = |V| · (|V| − 1) / 2, så O(|V|² · log(|V|)).",
        "Tunnelsystemet er et <b>tre</b>, så det finnes nøyaktig én sti mellom to bygninger. Et bredde-først eller dybde-først søk fra startbygningen finner den. O(|V| + |E|) = O(|V|), siden treet har |V| − 1 kanter."]),
      kjerne: "<p>(b) er et minimalt spenntre. (c) er en felle: i et tre er den eneste stien også den korteste.</p>",
      tips: ["Sensorveiledningen gir opptil 1 poeng for Dijkstra i (c), mot opptil 3 for BFS eller DFS. Vektene er gravekostnader, ikke gangtid, og i et tre finnes det bare én sti uansett.", "Svarer du Dijkstra på (b), har du løst feil problem."]
    }; });

    def("H2025-7", { host: "#exam-h2025-6" }, function () { return { key: "H2025-7", year: "H2025", title: "Kollektivtilbudet i Oslo", oppgave_nr: "Oppgave 7", points: 15,
      kilde: "Oppgavetekst: UiO, IN2010, H2025, oppgave 7", ark: "Kollektivtilbudet i Oslo", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>I det siste bystyremøtet ble det sluttet flere vedtak vedrørende kollektivtilbudet i Oslo. La kollektivtilbudet være representert som en sammenhengende, urettet og vektet graf G = (V, E), der u ∈ V er en holdeplass, en kant {u, v} ∈ E er en strekning og vektfunksjonen w angir reisetid (i minutter) for en strekning.</p>",
        parts: [{ t: "Grafen er sammenhengende og urettet. Forklar kort hva hver av egenskapene vil si for en som reiser kollektivt i Oslo.", p: 1 },
          { t: "Bystyret har vedtatt at det skal bygges nye holdeplasser langs alle strekninger som overstiger k minutter. Under bygningsarbeidet vil det ikke være mulig å reise langs noen av disse strekningene. Skriv en algoritme som tar grafen som representerer det nåværende kollektivtilbudet, samt en grense k, og sjekker om det vil være mulig å reise mellom alle par av holdeplasser under bygningsarbeidet.", p: 4 },
          { t: "Det viser seg at algoritmen fra deloppgave (b) svarer false for k-en bystyret hadde i tankene. Gi en algoritme som bystyret kan bruke til å finne den minste verdien for k som algoritmen fra deloppgave (b) svarer true for.", p: 4 },
          { t: "Det siste året har det vært to hendelser der det har vært full stopp ved en holdeplass. Det ledet til at reisende ikke kunne nå destinasjonen sin. Bystyret har vedtatt en garanti: dersom det blir full stopp ved en holdeplass, skal det fremdeles være mulig for reisende å nå sin destinasjon via en alternativ rute. Garantien gjelder for alle holdeplasser.<br>Forklar hvordan vi kan bruke en algoritme kjent fra pensum til å sjekke om kollektivtilbudet leverer denne garantien.", p: 3 },
          { t: "Møtet til bystyret varte for lenge, så de bestilte pizza, og etter det fløt det over med nye kreative idéer. Den siste i denne rekken er følgende: for å avlaste de mest trafikkerte rutene, vil de gi negative billettpriser på de minst trafikkerte strekningene.<br>Før de setter i gang med prosjektet må de forsikre seg om at det ikke er mulig å opptjene seg vilkårlig høye summer i negative billettpriser ved å reise rundt og rundt.<br>Billettprisen for en strekning er gitt av en vektfunksjon c. En strekning kan være svært trafikkert i én retning, men lite trafikkert i den andre, derfor kan c(u, v) være ulik c(v, u) for en strekning {u, v} ∈ E.<br>Forklar hvordan vi kan bruke en algoritme kjent fra pensum til å sjekke om det finnes måter å opptjene vilkårlig høye summer i negative billettpriser.", p: 3 }],
        outro: demoLink("sammenheng", "pc-sep", "separasjonsnodene i fanen 2-sammenheng") + demoLink("dijkstra", "pc-bellman", "Bellman-Ford i fanen Korteste vei")
      }),
      avvik: "Poengene står ikke på arket. De er de øvre grensene fra sensorveiledningen.",
      losning: sol(["Sammenhengende: du kan reise mellom hvilke som helst to holdeplasser. Urettet: kan du reise fra u til v, kan du også reise tilbake.",
        "Et dybde-først (eller bredde-først) søk fra en vilkårlig holdeplass som <b>ignorerer kanter med w(u, v) &gt; k</b>. Svaret er true hvis søket når alle nodene. O(|V| + |E|), som er O(|E|) fordi grafen er sammenhengende.",
        "Den minste k er den <b>tyngste kanten i et minimalt spenntre</b>. Spenntreet bruker bare kanter med vekt ≤ den tyngste, og ingen spenntre kan klare seg med en lettere tyngste kant. Med Prim: O(|E| · log(|V|)). (Et alternativ er å binærsøke over de sorterte vektene med (b).)",
        "Garantien betyr at grafen er <b>2-sammenhengende</b>: ingen separasjonsnoder. Bruk SeparationVertices og sjekk at mengden er tom. O(|V| + |E|).",
        "Lag en rettet graf der hver strekning {u, v} blir to kanter, (u, v) med vekt c(u, v) og (v, u) med vekt c(v, u). Kjør <b>Bellman-Ford</b> fra en vilkårlig holdeplass. Finner den en negativ sykel, kan man tjene vilkårlig mye. Grafen er sammenhengende, så alle sykler kan nås fra hvilken som helst start. O(|V| · |E|)."],
        pfKoder([["H2025-7", 1], ["H2025-7", 2]]),
        { outro: "<p class=\"small\">Legg merke til at en tur fram og tilbake på én strekning også er en sykel her: er c(u, v) + c(v, u) &lt; 0, tjener man penger på å pendle. Bellman-Ford oppdager også det.</p>" }),
      kjerne: "<p>Fem deloppgaver, fem kjente verktøy: definisjoner, søk med filter, minimalt spenntre, separasjonsnoder og Bellman-Ford.</p>",
      tips: ["(b): grensen er «overstiger k», så kanter med vekt nøyaktig k er åpne. Bruk ≤ k i testen. (Sensorveiledningen skriver &lt; k, men oppgaveteksten sier at bare strekninger over k stenges.)",
        "(e): si hvor Bellman-Ford starter. Sensorveiledningen trekker 1 poeng hvis startnoden ikke er spesifisert."]
    }; });

    def("H2020-8", { host: "#exam-h2020-8" }, function () { return { key: "H2020-8", year: "H2020", title: "Fire typer grafer", oppgave_nr: "Oppgave 8", points: 38,
      kilde: "Oppgavetekst: UiO, IN2010, H2020, oppgave 8", ark: "Fire typer grafer", ordrett: true,
      oppgave: skel(IN.oppg({
        intro: "<p>Du ønsker å forbedre kommunikasjonsnettverket i en liten by. Historisk sett har all kommunikasjon mellom husstander i byen skjedd ved hjelp av brevduer. På denne måten kunne alle nå hverandres hus direkte. Men brevduer er upraktiske, så du skal finne bedre måter for husstandene å kommunisere med hverandre på. Du har utforsket følgende muligheter:</p>" +
          "<ul><li>Den nye startupen HamiltonBikes har begynt å bygge nye sykkelstier og kommer til å drifte brevlevering mellom alle hus. De garanterer at man kan ta seg en sykkeltur som går innom alle husene i byen, uten å måtte sykle forbi det samme huset to ganger.</li>" +
          "<li>Husene kan forbindes med nettverkskabel, men med hensyn til kostnaden, vil redundante forbindelser unngås.</li>" +
          "<li>Noen bor så nærme hverandre at naboer kan rope for rask én-til-én kommunikasjon.</li></ul>" +
          "<p>Du innser at hver kommunkasjonsform kan formaliseres som en graf der nodene er husstandene og kantene er forbindelsene mellom disse. Du identifiserer fire typer grafer, som hver tilsvarer en kommunikasjonsform:</p>" + TYPER,
        parts: [
          { t: "<p>Din første oppgave er å sjekke om HamiltonBikes virkelig leverer det de lover. De tilbyr å sende deg et kart over sykkelstiene og et forslag på en runde som går forbi hvert hus nøyaktig én gang. Du oversetter problemet til et avgjørelsesproblem:</p>" +
              "<p><b>Type2</b><br><b>Instans:</b> En graf G<br><b>Spørsmål:</b> Inneholder G en hamiltonsk sykel?</p>" +
              "<p>Du bestemmer deg for å lage en effektiv algoritme som verifisererer Type2. Algoritmen tar en graf og et sertifikat som input, og svarer JA hvis sertifikatet bekrefter at grafen er av type 2, NEI ellers. Algoritmen skal kjøre i polynomisk tid.</p>" +
              "<p>HamiltonBikes leverer sertifikatet som et array C av noder i G, slik at hver node er med nøyaktig én gang. Skriv pseudokode for verifikatoren Type2Verifier.</p>" +
              '<p class="small"><b>ALGORITHM: VERIFIKATOR FOR TYPE2</b></p>' + SKEL, p: 7 },
          { t: "<p>Forklar kort (maks 4 setninger) hvorfor svaret på forrige deloppgave viser at avgjørelsesproblemet Type2 er i NP. Ikke gi en detaljert kjøretidsanalyse av pseudokoden din for Type2Verifier.</p>" +
              "<p>Dersom svaret ditt på forrige deloppgave har mangler, kan du gjøre nødvendige antagelser uten å få følgefeil.</p>", p: 3 },
          { t: "<p>En fordel med sykkelstiene til HamiltonBikes er redundans: hvis for eksempel alle sykkelstiene rundt et hus må stenges på grunn av byggearbeid, så er det fortsatt mulig å sykle rundt i byen.</p>" +
              "<p>Forklar kort (maks 4 setninger) hvorfor grafer av type 2 er 2-sammenhengende.</p>", p: 3 },
          { t: "<p>Bystyret skjønner ikke grafteori, så de vil gjerne at du viser hvordan man skulle kunne komme seg rundt i byen dersom det gjøres byggearbeid. Du bestemmer deg for å lage et program som skriver ut to distinkte stier fra et gitt hus til et annet.</p>" +
              "<p>Du tar altså utgangspunkt i en graf G = (V, E) som er av type 2, og to noder s og t i grafen.</p>" +
              "<p>Skriv pseudokode for en prosedyre TwoPaths, som skriver ut to distinkte stier fra s til t.</p>" +
              "<p>Du er gitt et sertifikat C, som beskrevet i deloppgave (a).</p><p>Ikke tenk på formatet på utskriften; det viktige er at nodene skrives ut i riktig rekkefølge.</p>" +
              '<p class="small"><b>ALGORITHM: SKRIV UT TO DISTINKTE STIER FRA s TIL t</b></p>' + SKEL, p: 8 },
          { t: "<p>Vi har lyst til å få oversikt over alle kommunikasjonsmåter i byen. Derfor gir vi forskjellig vekt til de ulike kanttypene, basert på kostnad. Deretter slår vi disse sammen til en graf S. Der det er flere kanter beholder vi bare den med lavest vekt.</p>" +
              "<p>Her er fire eksempelgrafer, en av hver type, hvor</p><ul><li>kanter i T1 har vekt 10</li><li>kanter i T2 har vekt 8</li><li>kanter i T3 har vekt 3</li><li>kanter i T4 har vekt 1</li></ul>" +
              "<p>Fyll ut kantvektene i grafen S. (T1–T4 står under deloppgavene.)</p>", p: 3 },
          { t: "<p>Du konstruerer den sammenslåtte grafen G på samme måte som i forrige deloppgave utifra de følgende grafene:</p>" +
              "<ul><li>G1 av type 1, hvor alle kanter har vekt 10,</li><li>G2 av type 2, hvor alle kanter har vekt 8,</li><li>G3 av type 3, hvor alle kanter har vekt 3,</li><li>G4 av type 4, hvor alle kanter har vekt 1.</li></ul>" +
              "<p>Nå har du lyst til å finne den billigste måten å forbinde husene i byen. Derfor har du bestemt deg for å bruke Kruskals algoritme på den sammenslåtte grafen G.</p>" +
              "<p>Besvar spørsmålene nedenfor, og begrunn svaret kort (maks 4 setninger).</p>" +
              "<ul><li>Finnes det nøyaktig én billigste måte å forbinde husene i byen?</li><li>Er det mulig for alle i byen til å kommunisere bare ved bruk av roping? Med andre ord, kunne vi ha bygget et spenntre for G, med kun kanter fra G4?</li>" +
              "<li>Din kollega sier at hvis G4 ikke har noen kanter, så er det minimale spenntreet for G nøyaktig G3. Stemmer dette?</li><li>Hva er vekten på den siste kanten Kruskals algoritme velger når den bygger spenntreet?</li></ul>", p: 4 },
          { t: "<p>La G = (V, E) være en graf og la s og t være noder i V. Vi skal nå finne lengden til den korteste stien fra s til t.</p>" +
              "<ul><li>Hvilken algoritme løser problemet mest effektivt hvis du vet at G er av type 1 og alle kantene har vekt 10?</li><li>Hvilken algoritme løser problemet mest effektivt hvis du vet at G er av type 2 og alle kantene har vekt 8?</li></ul>", p: 2 },
          { t: "<p>Nå skal du finne den korteste kommunikasjonsveien fra posten (A) til alle hus i byen, formalisert som noder i en mengde V. Du har representert alle kommunikasjonstyper i de følgende kantmengdene:</p>" +
              "<ul><li>E1 inneholder en kant mellom hvert par av noder i V.<br>Alle kanter i E1 har vekt 10.</li>" +
              "<li>E2 = {{A, B}, {B, C}, {C, D}, {D, E}, {E, F}, {F, G}, {G, H}, {E, H}, {F, H}, {F, A}}<br>Alle kanter i E2 har vekt 8.</li>" +
              "<li>E3 = {{A, C}, {B, C}, {C, D}, {D, E}, {E, F}, {F, G}, {G, H}}<br>Alle kanter i E3 har vekt 3.</li>" +
              "<li>E4 = {{A, D}, {C, D}, {B, D}, {F, G}}<br>Alle kanter i E4 har vekt 1.</li><li>V = {A, B, C, D, E, F, G, H}</li></ul>" +
              "<p>Finn de korteste stiene fra A til alle andre noder. Du kan bruke kanter fra alle fire kantmengdene. Husk at det kan være flere kommunikasjonsveier mellom hus, altså at det er parallelle kanter mellom nodene.</p>" +
              "<p>Fyll ut tabellen med korrekt minimalavstand fra A for hver node i V.</p>" +
              tab(["", "A", "B", "C", "D", "E", "F", "G", "H"], [["Avstand", "", "", "", "", "", "", "", ""]]), p: 8 }],
        figsAfter: [gFig(T1, "T1 (vekt 10)", {}, { scale: 0.7 }), gFig(T2, "T2 (vekt 8)", {}, { scale: 0.7 }), gFig(T3, "T3 (vekt 3)", {}, { scale: 0.7 }), gFig(T4, "T4 (vekt 1)", {}, { scale: 0.7 })]
      }), [{ name: "Type2Verifier", params: "G, C", input: "En graf G og et array av noder C", output: "Returner JA hvis C viser at G er av type 2, NEI ellers", fill: "// Fyll ut" },
           { name: "TwoPaths", params: "G, C, s, t", input: "En graf G, to noder s og t og et sertifikat C", output: "Skriver ut to distinkte stier fra s til t", fill: "// Fyll ut" }]),
      avvik: ["Arket gjentar lista over graftypene i (c)–(g), og sier «Graftypene er gjentatt der du trenger det, så du trenger ikke å huske dem.» Her står lista bare én gang øverst, fordi hele oppgaven står på samme side.",
        "T1–T4 i (e) står under deloppgavene, ikke ved siden av teksten, fordi siden også skal fungere på en smal mobilskjerm. De er tegnet på nytt med guidens graftegning. Kantene og vektene er de samme som på arket. Arket har også en tom graf S å fylle ut. Den står ikke her.",
        "Steg-demoene for (a) og (d) kjører på vår egen eksempelgraf, fordi arket ikke har noen graf til de deloppgavene."],
      demoLabel: "Se Type2Verifier, TwoPaths, Kruskal og Dijkstra kjøre",
      demo: [
        { tab: "(a) Type2Verifier", engine: "graph", gen: "grType2", input: [HEX, ["A", "B", "C", "D", "E", "F"]], inputNavn: "C = [A, B, C, D, E, F]",
          presets: { "C = [C, B, A, D, E, F] (siste kant mangler)": [HEX, ["C", "B", "A", "D", "E", "F"]], "C = [A, B, E, D, C, F] (en kant mangler)": [HEX, ["A", "B", "E", "D", "C", "F"]] },
          pseudo: "type2Verifier", legend: LEG_T2, label: "Kjør Type2Verifier på egen graf", del: "(a)", fasit: "JA" },
        { tab: "(d) TwoPaths", engine: "graph", gen: "grTwoPaths", input: [HEX, ["A", "B", "C", "D", "E", "F"], "B", "E"], inputNavn: "s = B, t = E",
          presets: { "s = A, t = D": [HEX, ["A", "B", "C", "D", "E", "F"], "A", "D"], "s = F, t = A": [HEX, ["A", "B", "C", "D", "E", "F"], "F", "A"] },
          pseudo: "twoPaths", legend: LEG_2P, label: "Kjør TwoPaths fra B til E", del: "(d)", fasit: "B, C, D, E og B, A, F, E" },
        { tab: "(f) Kruskal på S", engine: "graph", gen: "grKruskal", input: [S20], inputNavn: "S fra (e)", presets: false,
          pseudo: "kruskal", legend: LEG_KRU, label: "Kjør Kruskal på S", del: "(f)", svar: SV.sisteKruskal, fasit: "3" },
        { tab: "(h) Dijkstra fra A", engine: "graph", gen: "grDijkstraH2020", input: [OCT, "A"], inputNavn: "E1–E4 slått sammen", presets: false,
          pseudo: "dijkstra", legend: LEG_DIJ, label: "Kjør Dijkstra fra A", del: "(h)" }
      ],
      losning: sol(["Gå gjennom C og sjekk at det går en kant mellom hver node og den neste, og fra den siste tilbake til den første (det er det <code>mod N</code> gjør). O(|V|) kantoppslag, altså polynomisk.",
        "Et problem er i NP hvis et JA-svar kan verifiseres i polynomisk tid med et sertifikat. Type2Verifier gjør nøyaktig det, så Type2 er i NP.",
        "Den hamiltonske sykelen går innom alle nodene. Fjerner vi én node, blir sykelen til en sti som fortsatt er innom alle de andre nodene, så grafen henger sammen. Ingen node er en separasjonsnode.",
        "Finn s i C. Gå framover i C (med mod N) og skriv ut nodene til du kommer til t; gå så bakover fra s til t. De to stiene går hver sin vei rundt sykelen og deler bare s og t.",
        "S (se figuren): A–B 8, C–D 8, A–C 3, B–D 3, A–D 1, B–C 1.",
        "(1) <b>Nei</b>, ikke nødvendigvis: mange kanter har samme vekt, så det kan finnes flere like billige spenntrær. (2) <b>Nei</b>: G4 er ikke sammenhengende, så den kan ikke inneholde et spenntre. (3) <b>Ja</b>: G3 er et spenntre med vekt 3 på alle kantene, og alle andre kanter er tyngre (8 eller 10). (4) <b>3</b>: G4 alene henger ikke sammen, så minst én tyngre kant trengs, og G3 gir alltid en kant med vekt 3 som kobler sammen.",
        "Type 1: alle par er naboer, så svaret er bare 10 (O(1)). Type 2: alle vektene er like, så <b>bredde-først søk</b> gir antall kanter, og lengden er 8 ganger det.",
        "<p><b>1. Slå sammen kantene.</b> Behold den letteste vekten for hvert par. Alle par har minst vekt 10 (E1). Lettere enn 10 blir: " +
          "A–D 1, B–D 1, C–D 1, F–G 1 · A–C 3, B–C 3, D–E 3, E–F 3, G–H 3 · A–B 8, A–F 8, E–H 8, F–H 8. Alle andre par har vekt 10.</p>" +
          "<p><b>2. Kjør Dijkstra fra A.</b> Start: dist[A] = 0, alle andre ∞. Naboene relakseres i alfabetisk rekkefølge, og ved lik avstand tas den eldste oppføringen ut først. Fet = endret i runden.</p>" +
          tab(["Runde", "Tatt ut", "A", "B", "C", "D", "E", "F", "G", "H"], [
            ["1", "A (0)", "0", "<b>8</b>", "<b>3</b>", "<b>1</b>", "<b>10</b>", "<b>8</b>", "<b>10</b>", "<b>10</b>"],
            ["2", "D (1)", "0", "<b>2</b>", "<b>2</b>", "1", "<b>4</b>", "8", "10", "10"],
            ["3", "B (2)", "0", "2", "2", "1", "4", "8", "10", "10"],
            ["4", "C (2)", "0", "2", "2", "1", "4", "8", "10", "10"],
            ["5", "E (4)", "0", "2", "2", "1", "4", "<b>7</b>", "10", "10"],
            ["6", "F (7)", "0", "2", "2", "1", "4", "7", "<b>8</b>", "10"],
            ["7", "G (8)", "0", "2", "2", "1", "4", "7", "8", "10"],
            ["8", "H (10)", "0", "2", "2", "1", "4", "7", "8", "10"]]) +
          "<p>Mellom rundene tar køen også ut gamle oppføringer (C:3 før runde 5, B:8 og F:8 før runde 7, E:10 og G:10 før runde 8). De er alt i visited og hoppes over. " +
          "I runde 7 gir G–H 8 + 3 = 11, som ikke er bedre enn 10, så H beholder den direkte kanten fra A.</p>" +
          "<p><b>Svar:</b> A 0, B 2, C 2, D 1, E 4, F 7, G 8, H 10.</p>" +
          "<p><b>Kjøretid:</b> Dijkstra er O((|V| + |E|) · log(|V|)). E1 gjør grafen komplett, så |E| = |V| · (|V| − 1) / 2 = 28 her, og i det generelle tilfellet blir det O(|V|² · log(|V|)).</p>"], ["type2Verifier", "twoPaths"],
        { figs: [gFig(S20, "S", {}, { scale: 0.8 })] }),
      kjerne: "<p>En lang oppgave som går gjennom mye av pensum: NP og verifikatorer, 2-sammenheng, Kruskal og korteste vei. Hver del er kort hvis du kjenner begrepet.</p>",
      tips: ["(a): glem ikke kanten fra den siste noden i C tilbake til den første. Sensorveiledningen trekker 1 poeng for det.", "(d): bruk (i − 1 + N) mod N når du går bakover, så indeksen ikke blir negativ.", "(h): skriv opp den sammenslåtte vekten for hver kant før du starter. De fleste feil kommer av at en lettere kant ble oversett."]
    }; });

    def("H2024-8", { host: "#exam-h2024-8" }, function () { return { key: "H2024-8", year: "H2024", title: "Rundtur med DNT", oppgave_nr: "Oppgave 8", points: 12,
      kilde: "Oppgavetekst: UiO, IN2010, H2024, oppgave 8", ark: "Rundtur med Den Norske Turistforeningen (DNT)", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>Fagutvalget ved institutt for informatikk har bestemt seg for å arrangere en rundtur i et vakkert norsk fjellandskap for alle IFI-studenter. Dette sammenfaller med at Den Norske Turistforeningen har lansert en ny app, sammen med offentlige datasett, slik at det er gode muligheter for å gjøre et godt informert rutevalg. Siden de fleste studenter på IFI har en forkjærlighet for grafer, er det ikke til å unngå at de vil bruke datasettet til å bygge en graf som fanger nok informasjon til å kunne algoritmisk bestemme den beste rundturen.</p>" +
          "<p>Grafen som bygges er en rettet graf G = (V, E), der hver node u ∈ V representerer en lokasjon, og en kant (u, v) ∈ E representerer en turvei fra u til v. Ingen noder har en kant til seg selv.</p>",
        parts: [{ t: "Det viser seg at grafen har en ganske spesiell egenskap: Hver node inngår i makismalt én sykel. Hver sykel representerer en rundtur.<br>Gi en algoritme som finner alle rundturene i grafen, og oppgi kjøretidskompleksiteten. Du kan kalle på algoritmer kjent fra pensum.", p: 5 },
          { t: "En av rundturene fra (a) blir valgt som reisemål, hvor t er en node i rundturen. Turen starter ved et utfartssted, som er enkelt å komme seg til med kollektivtransport. Et utfartssted er identifisert ved noder som har inngrad 0. Det siste som gjenstår i planleggingen er å velge et egnet utfartssted turen skal starte ved for å nå t.<br>" +
              "Datasettet inneholder heldigvis også informasjon om hvor lang tid en gjennomsnittlig turgåer bruker langs en turvei. Dette blir gitt som en vektfunksjon w, slik at for hver kant (u, v) ∈ E, så angir w(u, v) tidsbruk som et positivt heltall. Vi vil bruke vektene til å finne ut hvilket utfartssted som er best egnet for å komme seg til reisemålet.<br>" +
              "Input er en rettet og vektet graf G = (V, E) med vektfunksjon w, en mengde med utfartssteder U og en node t i reisemålet. Output er noden s ∈ U slik at avstanden mellom s og t er så lav som mulig.<br>" +
              "Gi en algoritme som effektivt finner utfartsstedet som har lavest avstand til t i reisemålet, og oppgi kjøretidskompleksiteten. Du kan kalle på algoritmer kjent fra pensum.", p: 7 }]
      }),
      avvik: ["«makismalt» står slik på arket.", "Poengene står ikke på arket. De er hentet fra sensorveiledningen.", "Arket har ingen graf. Steg-demoen for (a) kjører på vårt eget turområde."],
      demo: { engine: "graph", gen: "grSCC", input: [DNT], inputNavn: "Eget turområde", presets: false,
        pseudo: "scc", legend: LEG_SCC, label: "Kjør Kosaraju og finn rundturene", del: "(a)", svar: SV.runder, fasit: "{A, B, C}, {D, E, F}" },
      losning: sol(["Finn de <b>sterkt sammenhengende komponentene</b> og returner dem med mer enn én node. Siden hver node ligger på høyst én sykel, er hver slik komponent nøyaktig én rundtur. O(|V| + |E|).",
        "Snu alle kantene og kjør <b>Dijkstra én gang fra t</b> i den omvendte grafen. Da er dist[s] avstanden fra s til t i G. Velg s ∈ U med minst dist[s]. O((|V| + |E|) · log(|V|))."], pfKoder([["H2024-8", 0], ["H2024-8", 1]])),
      kjerne: "<p>(a) Sykler i en rettet graf ↔ sterkt sammenhengende komponenter. (b) Mange startsteder, ett mål: snu grafen.</p>",
      tips: ["(a): sensorveiledningen trekker 1 poeng for å ta med komponenter med bare én node. De er ikke rundturer.",
        "(b): Dijkstra fra hver s ∈ U gir opptil 4 poeng. Et annet godt alternativ: lag en ny node med kanter med vekt 0 til alle i U, og kjør Dijkstra derfra."]
    }; });

    def("H2022-12", { host: "#exam-h2022-11" }, function () { return { key: "H2022-12", year: "H2022", title: "Minimal forside", oppgave_nr: "Oppgave 12", points: 10,
      kilde: "Oppgavetekst: UiO, IN2010, H2022, oppgave 12", ark: "Minimal forside", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>Du er gitt en graf G = (V, E) som representerer et domene, der hver node representerer en side under domenet. Dersom det finnes en kant fra u til v, betyr det at det er en link på side u som linker til v.</p>" +
          "<p>Du har fått i oppdrag å lage en forside (som blir en ny node i grafen), som skal oppfylle følgende kriterer:</p><ul><li>Alle sider skal kunne nås fra forsiden.</li><li>Forsiden skal inneholde så få linker som mulig.</li></ul>" +
          "<p>Du skal beskrive algoritmer som beregner hvor mange linker den nye forsiden må inneholde avhengig av om grafen er:</p>",
        parts: [{ t: "En urettet graf. Gi en kort beskrivelse av algoritmen med naturlig språk (du kan referere til algoritmer i kurset).", p: 3 },
          { t: "En rettet og asyklisk graf. Gi en kort beskrivelse av algoritmen med naturlig språk (du kan referere til algoritmer i kurset).", p: 3 },
          { t: "En rettet graf (som kan inneholde sykler). Gi en kort beskrivelse av algoritmen med naturlig språk (du kan referere til algoritmer i kurset).", p: 4 }],
        outro: demoLink("scc", "demo-scc", "demoen for sterkt sammenhengende komponenter over")
      }),
      avvik: "Poengene står ikke på arket. De er hentet fra sensorveiledningen.",
      losning: sol(["Svaret er <b>antall komponenter</b>: én link til en vilkårlig side i hver komponent. Tell dem med DFSFull (hvert nytt søk er en ny komponent). O(|V| + |E|).",
        "Svaret er <b>antall noder med inngrad 0</b>. De kan ikke nås fra noen andre, så hver av dem trenger en link, og alle andre noder kan nås fra en av dem (følg kantene baklengs; i en DAG ender det i en node med inngrad 0). O(|V| + |E|).",
        "Finn de <b>sterkt sammenhengende komponentene</b>, og tell komponentene som ingen kant fra en annen komponent går inn til (inngrad 0 i komponentgrafen). Komponentgrafen er en DAG, så dette er (b) igjen. O(|V| + |E|)."]),
      kjerne: "<p>(c) reduseres til (b): slå sammen hver sterkt sammenhengende komponent til én node.</p>",
      tips: ["I (c) holder det ikke å telle noder med inngrad 0: en sykel uten innkommende kanter fra resten av grafen trenger også en link, selv om alle nodene på den har inngrad ≥ 1."]
    }; });

    def("H2025-3", { host: "#exam-h2025-2" }, function () { return { key: "H2025-3", year: "H2025", title: "Sykler i grafer", oppgave_nr: "Oppgave 3", points: 11,
      kilde: "Oppgavetekst: UiO, IN2010, H2025, oppgave 3", ark: "Sykler i grafer", ordrett: true, poengkilde: "sv",
      oppgave: skel(IN.oppg({
        parts: [{ t: "Anta at grafen G = (V, E) er en urettet graf. Grafen inneholder en sykel hvis det finnes en sti fra en node u tilbake til samme node u som går innom minst én annen node v.<br>Skriv en prosedyre som avgjør om grafen inneholder en sykel." + SKEL, p: 5 },
          { t: "Anta at grafen G = (V, E) er en rettet graf. Grafen inneholder en sykel hvis det finnes en sti fra en node u tilbake til samme node u.<br>Skriv en prosedyre som avgjør om grafen inneholder en sykel." + SKEL, p: 6 }]
      }), [{ name: "isCyclicUndirected", params: "G", input: "En urettet graf G = (V, E)", output: "Returnerer true hvis grafen inneholder en sykel, og false ellers", fill: "// . . ." },
           { name: "isCyclicDirected", params: "G", input: "En rettet graf G = (V, E)", output: "Returnerer true hvis grafen inneholder en sykel, og false ellers", fill: "// . . ." }]),
      avvik: ["Poengene står ikke på arket. De er hentet fra sensorveiledningen.", "Arket har ingen grafer. Steg-demoene kjører på guidens egne eksempelgrafer."],
      demoLabel: "Se sykeltestene kjøre",
      demo: [
        { tab: "(a) Urettet", engine: "graph", gen: "grCycleUndir", input: [GR.cyc], inputNavn: "Graf med sykel", presets: { "Tre (ingen sykel)": [GR.tre], "To komponenter": [GR.skog] },
          pseudo: "hasCycleFrom", legend: LEG_CYC, label: "Kjør sykeltesten (urettet)", del: "(a)", svar: SV.cycU, fasit: "true" },
        { tab: "(b) Rettet", engine: "graph", gen: "grCycleDir", input: [GR.dag7cyc], inputNavn: "Graf med sykel", presets: { "DAG (ingen sykel)": [GR.dag7] },
          pseudo: "hasCycleDirected", legend: LEG_TOP, label: "Kjør sykeltesten (rettet)", del: "(b)", svar: SV.cycD, fasit: "true" }
      ],
      losning: sol(["Dybde-først søk som husker hvilken node vi kom fra (forelderen), startet fra hver ubesøkte node så alle komponentene blir sjekket. Møter vi en besøkt nabo som ikke er forelderen, er det en sykel. O(|V| + |E|). (Alternativ: tell komponentene c; det finnes en sykel hvis og bare hvis |E| &gt; |V| − c.)",
        "Topologisk sortering som teller behandlede noder: returner processed &lt; |V|. Alternativt: DFS med tre tilstander, eller sterkt sammenhengende komponenter med mer enn én node. O(|V| + |E|)."], ["hasCycle", "hasCycleFrom", "hasCycleDirected"]),
      kjerne: "<p>Urettet: DFS + forelder. Rettet: inngradsmetoden (eller tre tilstander). Ikke bland dem.</p>",
      tips: ["(a): sensorveiledningen trekker 2 poeng hvis noden ikke må være ulik forelderen. Da finner algoritmen «sykler» i alle grafer med en kant.",
        "(b): en løsning i O(|V| · (|V| + |E|)), for eksempel et nytt søk fra hver node, gir opptil 3 poeng."]
    }; });

    def("H2023-7", { host: "#exam-h2023-7" }, function () { return { key: "H2023-7", year: "H2023", title: "Dependency hell", oppgave_nr: "Oppgave 7", points: 12,
      kilde: "Oppgavetekst: UiO, IN2010, H2023, oppgave 7", ark: "Dependency hell", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>I moderne programvareutvikling er det vanlig at en applikasjon er avhengig av mange biblioteker, som igjen kan avhenge av andre biblioteker. Et bibliotek kan ses på som en samling med kode som er designet for gjenbruk. Bibliotekene som brukes for å bygge en applikasjon kalles avhengighetene til applikasjonen. Avhengighetene mellom biblioteker er gitt som en rettet graf G = (V, E), der en node representerer et bibliotek, og hvor det går en kant fra u til v dersom u bruker v som et bibliotek.</p>" +
          "<p>Eksemplene under er situasjonener ofte omtalt som dependency hell.</p>",
        figs: [gFig(SIRK, "Sirkulær avhengighet", {}, { scale: 0.8 }), gFig(DIAM, "Diamantavhengighet", {}, { scale: 0.8 })],
        parts: [{ note: "Sykliske avhengigheter er som regel uønsket fordi en oppdatering av et av bibliotekene i en sykel vil kunne påvirke alle de andre bibliotekene i sykelen. Diamantavhengighet er også som regel uønsket fordi en oppdatering kan føre til at man blir avhengig av forskjellige versjoner av det samme biblioteket samtidig.<br>Du skal utvikle algoritmer som kan hjelpe med å identifisere slike uønskede situasjoner." },
          { t: "Mer presist sier vi at grafen inneholder en syklisk avhengighet dersom det finnes en sti fra en node v til den samme noden v som består av minst to noder.<br>Skriv en prosedyre som, gitt en rettet graf G = (V, E), returner true dersom grafen inneholder sykliske avhengigheter, og false ellers. Dersom prosedyren din benytter seg av algoritmer kjent fra pensum må du redgjøre kort for hvordan de fungerer.", p: 5 },
          { t: "I denne deloppgaven kan du anta at grafen ikke inneholder sykliske avhengigheter.<br>Mer presist sier vi at grafen inneholder en diamantavhengighet dersom det finnes to distinkte stier fra u til v. Husk at to stier er distinkte dersom de ikke deler noen noder eller kanter utenom u og v.<br>Skriv en prosedyre som, gitt en rettet asyklisk graf G = (V, E), returnerer true dersom grafen inneholder diamantavhengigheter, og false ellers.", p: 7 }]
      }),
      avvik: [AVVIK_PLASS, AVVIK_TEGNET, "Poengene står ikke på arket. De er de øvre grensene fra sensorveiledningen."],
      demoLabel: "Se sykeltesten og diamanttesten kjøre",
      demo: [
        { tab: "(a) Syklisk avhengighet", engine: "graph", gen: "grCycleDir", input: [SIRK], inputNavn: "Sirkulær avhengighet (arket)", presets: { "Diamantavhengighet (ingen sykel)": [DIAM] },
          pseudo: "hasCycleDirected", legend: LEG_TOP, label: "Kjør sykeltesten", del: "(a)", svar: SV.cycD, fasit: "true" },
        { tab: "(b) Diamant", engine: "graph", gen: "grDiamond", input: [DIAM], inputNavn: "Diamantavhengighet (arket)", presets: { "Uten kanten C → D": [NODIAM] },
          pseudo: "isDiamond", legend: LEG_DIA, label: "Kjør diamanttesten", del: "(b)", fasit: "true" }
      ],
      losning: sol(["Topologisk sortering med inngrader: tell nodene som blir behandlet. Er antallet mindre enn |V|, finnes det en sykel (nodene på sykelen får aldri inngrad 0). O(|V| + |E|). Alternativer: sterkt sammenhengende komponenter med mer enn én node, eller DFS med tre tilstander.",
        "For hver kildenode s (inngrad 0): søk fra s med et <b>nytt</b> visited, der alle naboene legges på stakken. Kommer en node ut av stakken for andre gang, kan den nås fra s på to ulike måter, og da finnes det en diamant. Det er ingen sykler, så det betyr to veier, ikke en ring. O(|V<sub>S</sub>| · (|V| + |E|)), der V<sub>S</sub> er kildenodene. Det holder å starte i kilder: enhver diamant fra u kan nås fra en kilde, og søket derfra vil nå v på to måter."], ["hasCycleDirected", "isDiamond"]),
      kjerne: "<p>(a) er sykeltest i en rettet graf. (b) bruker at en DAG ikke har sykler: å treffe en besøkt node betyr to veier, ikke en ring.</p>",
      tips: ["(a): sensorveiledningen gir opptil 3 poeng for en løsning i O(|V| · (|V| + |E|)), for eksempel et søk fra hver node.", "(b): én traversering per node i grafen (ikke bare kildene) gir opptil 5 poeng. Visited må nullstilles for hver kilde, ellers ser to uavhengige kilder ut som en diamant."]
    }; });

    def("H2021-12", { host: "#exam-h2021-12" }, function () { return { key: "H2021-12", year: "H2021", title: "Whops!-oppgjør", oppgave_nr: "Oppgave 12", points: 10,
      kilde: "Oppgavetekst: UiO, IN2010, H2021, oppgave 12", ark: "Whops!-oppgjør", ordrett: true,
      oppgave: IN.oppg({
        intro: "<p>Ansatte på Institutt for informatikk har vært på instituttseminar hvor det har sklidd helt ut med utlån av små beløp mellom hverandre. De skal alle gjøre opp for seg ved å overføre penger via tjenesten Whops!. Dessverre har det oppstått et virvar av interne stridigheter mellom de ansatte, hvor mange har endt opp med å blokkere hverandre på Whops!, som gjør det vanskelig å få oppgjøret til å gå opp. Administrasjonen ser fortvilet på situasjonen, og skjønner at dette problemet vil oppstå igjen i årene fremover, hvor det også skal ansettes vanvittig mange. De har rutiner på plass for å få oversikt over hvor mye hver ansatt har lagt ut eller skylder totalt. Nå ber de om hjelp fra studentene i IN2010 (som på dette tidspunktet har blitt eksperter på algoritmer og datastrukturer) til å finne en generell måte å sjekke om oppgjøret kan gjennomføres gjennom Whops! eller ikke, som også vil skalere etterhvert som Institutt for Informatikk får ubegripelig mange ansatte.</p>" +
          "<p>Du setter flittig i gang, og formaliserer problemet som et grafproblem. Du lar G = (V, E), der hver ansatt er representert ved en node v ∈ V, og lar det være en (urettet) kant {u, v} ∈ E mellom to ansatte dersom de ikke har blokkert hverandre på Whops!. For hver ansatt v ∈ V kan du slå opp i en tabell T, der T[v] er et heltall som angir hvor mye v skylder eller har lagt ut totalt. Dersom T[v] er negativ, betyr det at v skylder penger, men dersom T[v] er positiv betyr det at v har lagt ut penger. Du vet at summen av alle tallene i T er nøyaktig 0. Merk at det betyr at dersom alle kunne utveksle penger mellom hverandre gjennom Whops! (muligens via andre ansatte) ville oppgjøret alltid gått opp.</p>" +
          "<p>Du skal gi en algoritme som tar G og T som input og svarer true hvis oppgjøret kan gjøres gjennom Whops!, og false dersom det ikke er mulig.</p>" +
          "<p>Her er to eksempler på hvordan en G og T kan se ut. For eksempelet med G₁ og T₁ kan oppgjøret gjøres gjennom Whops!, men for G₂ og T₂ er det ikke mulig å gjøre oppgjøret gjennom Whops!.</p>",
        figs: [gFig(G1W, "G₁ og T₁: T₁[0] = 500, T₁[1] = −200, T₁[2] = −300, T₁[3] = −50, T₁[4] = 50", {}, { scale: 0.9 }), gFig(G2W, "G₂ og T₂: T₂[0] = 300, T₂[1] = −250, T₂[2] = 0, T₂[3] = −50", {}, { scale: 0.9 })]
      }),
      avvik: [AVVIK_PLASS, AVVIK_TEGNET, "Tabellene T₁ og T₂ står i figurteksten under hver graf, fordi de er små tabeller ved siden av grafene på arket."],
      demoLabel: "Se CanSettle kjøre på begge eksemplene",
      demo: [
        { tab: "G₁ og T₁", engine: "graph", gen: "grSettle", input: [G1W, T1W], inputNavn: "G₁ og T₁", presets: false,
          pseudo: "canSettle", legend: LEG_SET, label: "Kjør CanSettle på G₁ og T₁", fasit: "true" },
        { tab: "G₂ og T₂", engine: "graph", gen: "grSettle", input: [G2W, T2W], inputNavn: "G₂ og T₂", presets: false,
          pseudo: "canSettle", legend: LEG_SET, label: "Kjør CanSettle på G₂ og T₂", fasit: "false" }
      ],
      losning: sol(["Penger kan bare flyte innenfor en <b>komponent</b>. Oppgjøret går opp hvis og bare hvis summen av T er 0 i hver komponent. Finn komponentene med DFSFull/BFSFull og summer underveis. O(|V| + |E|).<br>G₁: komponentene {0, 1, 2} (500 − 200 − 300 = 0) og {3, 4} (−50 + 50 = 0) gir true. G₂: {0, 2} har sum 300 ≠ 0, så false."], ["canSettle"]),
      kjerne: "<p>«Kan penger/informasjon flyte mellom …» i en urettet graf = samme komponent.</p>",
      tips: ["Sensorveiledningen gir opptil 5 poeng for en setning med riktig idé (komponenter + sum 0). De resterende 5 krever en god og presis beskrivelse av hvordan DFS finner komponentene og hvordan summene sjekkes."]
    }; });

  // Brukes også av demoene på temasiden
  IN.kortData.felles(SIDE, { N: N, copy: copy, DASH: DASH, RING: RING, LEG_TRAV: LEG_TRAV, LEG_DFS: LEG_DFS, LEG_TOP: LEG_TOP, LEG_DIJ: LEG_DIJ, LEG_MST: LEG_MST, LEG_KRU: LEG_KRU, LEG_SCC: LEG_SCC, LEG_CYC: LEG_CYC, mini: mini, gFig: gFig, pcFig: pcFig, demoLink: demoLink, sol: sol, P: P, tab: tab });
})();
