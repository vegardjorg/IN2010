/* ============================================================
   IN2010 guide · data-grafer.js
   Pseudokode (IN.algos) og steggeneratorer (IN.gen) for blokk 6 · Grafer.
   Kodestrukturen følger kurset (forelesningene om grafer), gjengitt med egne ord.
   Forklaringer på tre nivåer per linje; «grense» bare der grensen er en naturlig felle.
   Steg-objektene tegnes med IN.vizGraph (viz-graph.js). Klassisk script.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.algos = IN.algos || {};
  IN.gen = IN.gen || {};

  function t(e, n, k) { return { eli5: e, normal: n, teknisk: k }; }
  function reg(obj, key, val) {
    if (obj[key]) { if (window.console) console.warn("data-grafer: nøkkelen finnes alt:", key); return; }
    obj[key] = val;
  }
  function L(code, indent, e, n, k, grense) {
    var o = { code: code, indent: indent, eli5: e, normal: n, teknisk: k };
    if (grense) o.grense = grense;
    return o;
  }

  /* ===================== Hjelpere for grafer ===================== */
  // Naboliste: id → [{ v, w }], naboene i alfabetisk rekkefølge (gir forutsigbare demoer)
  function adj(g) {
    var A = {};
    g.nodes.forEach(function (n) { A[n.id] = []; });
    g.edges.forEach(function (e) {
      A[e[0]].push({ v: e[1], w: e[2] });
      if (!g.directed) A[e[1]].push({ v: e[0], w: e[2] });
    });
    Object.keys(A).forEach(function (k) { A[k].sort(function (a, b) { return a.v < b.v ? -1 : a.v > b.v ? 1 : 0; }); });
    return A;
  }
  function ids(g) { return g.nodes.map(function (n) { return n.id; }); }
  function reverse(g) {
    return { directed: true, nodes: g.nodes, edges: g.edges.map(function (e) { return [e[1], e[0], e[2]]; }) };
  }
  function ek(u, v) { return u + ">" + v; }
  function keys(o) { return Object.keys(o); }
  /* Variabellinja (varline.js): en variabel som peker på en node (prikk i nodens farge), og varsPrev */
  function nv(name, id) { return id == null ? { name: name, value: null } : { name: name, value: id, idx: id }; }
  function sv(name, v) { return { name: name, value: v }; }
  function tgt(hot) { return hot ? hot.split(">")[1] : null; }
  function linkVars(steps) { for (var z = 1; z < steps.length; z++) if (steps[z].vars) steps[z].varsPrev = steps[z - 1].vars || []; return steps; }

  /* ===================== Eksempelgrafer til demoene ===================== */
  function N(id, x, y, lp) { var n = { id: id, x: x, y: y }; if (lp) n.lp = lp; return n; }
  var GR = {
    // Urettet, uvektet: BFS og DFS
    u7: { directed: false,
      nodes: [N("A", 40, 90), N("B", 130, 30), N("C", 130, 150), N("D", 230, 30), N("E", 230, 150), N("F", 320, 90), N("G", 410, 150)],
      edges: [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["C", "E"], ["D", "F"], ["E", "F"], ["F", "G"]] },
    // To komponenter: DFSFull må starte på nytt
    u2k: { directed: false,
      nodes: [N("A", 40, 40), N("B", 140, 40), N("C", 40, 140), N("D", 140, 140), N("E", 250, 40), N("F", 350, 40), N("G", 300, 140)],
      edges: [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["E", "F"], ["E", "G"], ["F", "G"]] },
    // Rettet asyklisk graf (DAG): emner og forkunnskapskrav
    dag7: { directed: true,
      nodes: [N("A", 40, 40), N("B", 40, 160), N("C", 150, 40), N("D", 150, 160), N("E", 260, 100), N("F", 260, 210, "b"), N("G", 370, 140)],
      edges: [["A", "C"], ["B", "C"], ["B", "D"], ["C", "E"], ["D", "E"], ["D", "F"], ["E", "G"], ["F", "G"]] },
    // Samme, men med kanten G → D: nå finnes det sykler
    dag7cyc: { directed: true,
      nodes: [N("A", 40, 40), N("B", 40, 160), N("C", 150, 40), N("D", 150, 160), N("E", 260, 100), N("F", 260, 210, "b"), N("G", 370, 140)],
      edges: [["A", "C"], ["B", "C"], ["B", "D"], ["C", "E"], ["D", "E"], ["D", "F"], ["E", "G"], ["F", "G"], ["G", "D", null, { bend: -22 }]] },
    // Vektet, urettet: Dijkstra, Prim og Kruskal
    w6: { directed: false,
      nodes: [N("A", 40, 100), N("B", 160, 30), N("C", 160, 170, "b"), N("D", 300, 30), N("E", 300, 170, "b"), N("F", 420, 100)],
      edges: [["A", "B", 4], ["A", "C", 2], ["B", "C", 1], ["B", "D", 5], ["C", "D", 8, { t: 0.3 }], ["C", "E", 10], ["D", "E", 2], ["D", "F", 6], ["E", "F", 3]] },
    // Rettet, vektet (samme form) – Dijkstra virker like godt med rettede kanter
    w6dir: { directed: true,
      nodes: [N("A", 40, 100), N("B", 160, 30), N("C", 160, 170, "b"), N("D", 300, 30), N("E", 300, 170, "b"), N("F", 420, 100)],
      edges: [["A", "B", 4], ["A", "C", 2], ["C", "B", 1], ["B", "D", 5], ["C", "D", 8, { t: 0.3 }], ["C", "E", 10], ["E", "D", 2], ["D", "F", 6], ["E", "F", 3]] },
    // Rettet med tre sterkt sammenhengende komponenter
    scc8: { directed: true,
      nodes: [N("A", 40, 50), N("B", 150, 50), N("C", 95, 150, "b"), N("D", 280, 50), N("E", 390, 50), N("F", 335, 150, "r"), N("G", 200, 240, "b"), N("H", 320, 240, "b")],
      edges: [["A", "B"], ["B", "C"], ["C", "A"], ["D", "E"], ["E", "F"], ["F", "D"], ["G", "H"], ["H", "G"], ["B", "D"], ["G", "F"], ["C", "G"]] },
    // Urettet med én sykel (A – B – E – D – A)
    cyc: { directed: false,
      nodes: [N("A", 40, 40), N("B", 150, 40), N("C", 260, 40), N("D", 95, 140), N("E", 205, 140), N("F", 315, 140)],
      edges: [["A", "B"], ["A", "D"], ["B", "C"], ["B", "E"], ["D", "E"], ["E", "F"]] },
    // Samme noder, men et tre (ingen sykel)
    tre: { directed: false,
      nodes: [N("A", 40, 40), N("B", 150, 40), N("C", 260, 40), N("D", 95, 140), N("E", 205, 140), N("F", 315, 140)],
      edges: [["A", "B"], ["A", "D"], ["B", "C"], ["B", "E"], ["E", "F"]] },
    // Skog: to trær, men sykel i det andre
    skog: { directed: false,
      nodes: [N("A", 40, 40), N("B", 150, 40), N("C", 95, 140), N("D", 260, 40), N("E", 370, 40), N("F", 315, 140)],
      edges: [["A", "B"], ["A", "C"], ["D", "E"], ["D", "F"], ["E", "F"]] }
  };
  IN.grafer = { G: GR, adj: adj, ids: ids, reverse: reverse };

  /* ===================== BFS ===================== */
  reg(IN.algos, "bfsVisit", {
    title: "Bredde-først søk (BFS) fra én node",
    name: "BFSVisit", params: "G, s, visited",
    input: "En graf G = (V, E), en startnode s og en mengde visited",
    output: "Ingenting – alle noder som kan nås fra s, havner i visited, lag for lag",
    lines: [
      L("add s to visited", 1,
        "Vi setter et kryss ved startnoden, så vi vet at vi har vært der.",
        "Startnoden merkes som besøkt med en gang.",
        "Vi merker noder når de <b>oppdages</b>, ikke når de tas ut av køen. Da kommer ingen node i køen to ganger."),
      L("queue ← queue containing only s", 1,
        "Startnoden stiller seg først i en kø.",
        "Køen holder nodene vi har oppdaget, men ikke sett på naboene til ennå.",
        "En FIFO-kø. Det er den som gjør søket bredde-først."),
      L("while queue is not empty do", 1,
        "Så lenge noen står i køen, fortsetter vi.",
        "Vi holder på til køen er tom.",
        "Hver node legges i køen høyst én gang, så løkka går høyst |V| ganger."),
      L("u ← queue.dequeue()", 2,
        "Den som har stått lengst i køen, får tur.",
        "Ta ut noden som har ventet lengst.",
        "Nodene tas ut i ikke-synkende avstand fra s: alle på avstand d før noen på avstand d + 1.",
        { q: "Hvorfor en kø og ikke en stakk?",
          a: t("En kø tar den som kom først. Da blir vi ferdige med de nærmeste før vi går videre utover.",
               "Køen gir nodene tilbake i den rekkefølgen de ble oppdaget, altså lag for lag. Med en stakk tas den sist oppdagede ut først, og da går vi dypt før vi går bredt.",
               "FIFO bevarer invarianten at køen inneholder noder på avstand d foran noder på avstand d + 1. Uten den gjelder ikke garantien om korteste stier i uvektede grafer.") }),
      L("for (u, v) ∈ E do", 2,
        "Vi ser på alle som henger fast i u.",
        "Gå gjennom alle naboene v til u.",
        "Med naboliste tar dette O(1 + antall naboer). Summert over alle u blir det O(|E|)."),
      L("if v ∉ visited then", 3,
        "Har vi ikke vært hos v før?",
        "Hopp over naboer vi allerede har oppdaget.",
        "Oppslag i en hashmengde er O(1) i forventning."),
      L("add v to visited", 4,
        "Vi setter kryss ved v med en gang vi ser den. Da havner ikke v i køen en gang til.",
        "Merk v som oppdaget.",
        "Å merke her (og ikke ved uttak) er det som gjør at hver node havner i køen bare én gang."),
      L("queue.enqueue(v)", 4,
        "v stiller seg bakerst i køen.",
        "Legg v bakerst i køen. Den er ett steg lenger unna s enn u.",
        "Avstanden til v er avstanden til u pluss 1. Det er derfor BFS gir korteste stier i uvektede grafer.")
    ],
    bigO: { best: "O(1)", avg: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Vi besøker hver node én gang og ser på hver kant et par ganger.",
             "Hver node går inn og ut av køen én gang, og hver kant sjekkes én gang fra hver ende. Best: s har ingen naboer.",
             "Med naboliste: O(|V|) for køoperasjonene og O(|E|) totalt for nabo-løkkene. Køen og visited tar O(|V|) plass.") }
  });

  reg(IN.algos, "bfsFull", {
    title: "Bredde-først søk (BFS) gjennom hele grafen",
    name: "BFSFull", params: "G",
    input: "En graf G = (V, E)",
    output: "Ingenting – alle noder blir besøkt, også i andre komponenter",
    lines: [
      L("visited ← empty set", 1, "Vi lager én liste med kryss som alle søkene deler, så ingen node blir besøkt to ganger.", "En felles mengde for hele søket.", "Mengden deles av alle kallene, så ingen node besøkes to ganger."),
      L("for v ∈ V do", 1, "Vi går gjennom alle nodene.", "Prøv hver node som start.", "Løkka gir O(|V|) arbeid i tillegg til selve søkene."),
      L("if v ∉ visited then", 2, "Har ingen av søkene nådd v ennå? Da starter vi et nytt søk derfra.", "Bare noder vi ikke har nådd ennå, starter et nytt søk.", "Hver gang denne testen slår til, har vi funnet en ny komponent (i en urettet graf)."),
      L("BFSVisit(G, v, visited)", 3, "Vi sprer oss ut fra v, lag for lag, og setter kryss ved alt vi når.", "Besøk alt som kan nås fra v.", "Summert over alle kall: O(|V| + |E|).")
    ],
    bigO: { best: "O(|V| + |E|)", avg: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Hver node blir besøkt én gang, og hver kant blir sett på fra begge ender. Mer arbeid enn det blir det ikke.", "Hver node besøkes én gang, og hver kant sjekkes fra begge ender.", "Den ytre løkka er O(|V|), og kallene deler visited, så til sammen blir det O(|V| + |E|).") }
  });

  reg(IN.gen, "grBFS", function (inp) {
    var g = inp[0], s = inp[1], A = adj(g), steps = [];
    var vis = [], inV = {}, Q = [], done = {}, dist = {}, tree = {}, cur = null, hot = null, U = null;
    function snap(line, text, tag) {
      var nodes = {}, edges = {}, lab = {};
      vis.forEach(function (v) { nodes[v] = done[v] ? "done" : "seen"; });
      Q.forEach(function (v) { nodes[v] = "queued"; });
      if (cur) nodes[cur] = "cur";
      keys(tree).forEach(function (k) { edges[k] = "tree"; });
      if (hot) edges[hot] = "hot";
      keys(dist).forEach(function (v) { lab[v] = dist[v]; });
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, lab: lab, text: text, tag: tag,
        vars: line == null ? [] : [nv("s", s), nv("u", U), nv("v", line === 7 || line === 9 ? tgt(hot) : null)], frame: line == null ? null : "BFSVisit",
        panel: [{ label: "Kø (front → bak):", items: Q.slice(), kind: "queue" }, { label: "visited:", items: vis.slice() }],
        note: "Tallet over en node er antall kanter fra " + s + ". BFS finner dem lag for lag." });
    }
    snap(1, t("Vi starter i " + s + ". Naboene til en node ser vi alltid på i alfabetisk rekkefølge.",
      "BFSVisit kalles med s = " + s + ". Naboene gås gjennom i alfabetisk rekkefølge.",
      "Kall BFSVisit(G, " + s + ", visited) med tom visited. Naboene gås gjennom i alfabetisk rekkefølge; rekkefølgen avgjør hvilket BFS-tre vi får."), "Start");
    vis.push(s); inV[s] = 1; dist[s] = 0;
    snap(2, t(s + " får et kryss.", s + " merkes som besøkt.", "visited = {" + s + "}."), "Merk " + s);
    Q.push(s);
    snap(3, t(s + " stiller seg i køen.", "Køen inneholder bare " + s + ".", "queue = [" + s + "]."), "Kø");
    while (Q.length) {
      var u = Q.shift(); cur = u; hot = null; U = u;
      snap(5, t(u + " får tur.", "Ta ut " + u + " fra køen.", "u ← " + u + " (avstand " + dist[u] + ")."), "Ta ut " + u);
      A[u].forEach(function (nb) {
        var v = nb.v; hot = ek(u, v);
        if (inV[v]) {
          snap(7, t(v + " har vi vært hos før. Vi går videre.", "Naboen " + v + " er alt besøkt. Hopp over.", "v = " + v + " ∈ visited, så testen på linje 7 feiler."), "Hopp over " + v);
        } else {
          vis.push(v); inV[v] = 1; Q.push(v); dist[v] = dist[u] + 1; tree[ek(u, v)] = 1;
          snap(9, t(v + " er ny! Den får kryss og stiller seg bakerst i køen.",
                    "Naboen " + v + " er ny: merk den og legg den bakerst i køen. Avstand " + dist[v] + ".",
                    v + " ∉ visited: legg til i visited og enqueue. Avstand(" + v + ") = avstand(" + u + ") + 1 = " + dist[v] + "."), "Oppdag " + v);
        }
      });
      done[u] = 1; hot = null; cur = null;
      if (Q.length) snap(4, t("Ferdig med naboene til " + u + ". Det står fortsatt noen i køen, så vi fortsetter.",
          "Alle naboene til " + u + " er sett på. Køen er ikke tom, så løkka fortsetter.",
          u + " er ferdig behandlet. Løkkevilkåret sjekkes på nytt: køen har " + Q.length + " node" + (Q.length > 1 ? "r" : "") + ", så vi går en runde til."), "Neste");
      else snap(4, t("Ferdig med naboene til " + u + ". Nå står det ingen i køen.",
          "Alle naboene til " + u + " er sett på. Køen er tom, så løkka stopper.",
          u + " er ferdig behandlet. Løkkevilkåret sjekkes på nytt: køen er tom, så while-løkka avslutter."), "Køen er tom");
    }
    snap(null, t("Køen er tom. Alle som kan nås fra " + s + ", er besøkt.", "Ferdig. Blå kanter er BFS-treet: korteste stier (i antall kanter) fra " + s + ".",
      "Ferdig: visited = {" + vis.join(", ") + "}. BFS-treet gir korteste stier i en uvektet graf."), "Ferdig");
    return linkVars(steps);
  });

  /* ===================== DFS ===================== */
  reg(IN.algos, "dfsVisit", {
    title: "Dybde-først søk (DFS) fra én node",
    name: "DFSVisit", params: "G, u, visited",
    input: "En graf G = (V, E), en node u og en mengde visited",
    output: "Ingenting – alle noder som kan nås fra u, havner i visited",
    lines: [
      L("add u to visited", 1,
        "Vi setter et kryss ved u.",
        "Merk u som besøkt.",
        "Merkingen skjer før vi går videre, så et rekursivt kall kommer aldri tilbake til u."),
      L("for (u, v) ∈ E do", 1,
        "Vi ser på alle som henger fast i u, én om gangen.",
        "Gå gjennom naboene til u.",
        "Med naboliste: O(1 + antall naboer) per node, O(|E|) totalt."),
      L("if v ∉ visited then", 2,
        "Har vi ikke vært hos v før? Bare da går vi dit. Ellers kunne vi gått i ring for alltid.",
        "Bare naboer vi ikke har besøkt, fører til et nytt kall.",
        "Uten denne testen ville DFS gått i ring i en graf med sykler."),
      L("DFSVisit(G, v, visited)", 3,
        "Vi går så langt vi kan inn til v, før vi kommer tilbake hit.",
        "Rekursivt kall: gå dypt via v før vi ser på neste nabo til u.",
        "Kallstakken er DFS-stakken. Når kallet returnerer, er alt som kan nås fra v (og ikke var besøkt), besøkt.")
    ],
    bigO: { best: "O(1)", avg: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Hver node får ett besøk, og hver kant blir sett på et par ganger.",
             "Hver node kalles én gang, og hver kant sjekkes én gang fra hver ende. Best: u har ingen naboer.",
             "O(|V|) kall og O(|E|) nabo-sjekker totalt. Kallstakken kan bli |V| dyp (en lang sti).") }
  });

  reg(IN.algos, "dfsFull", {
    title: "Dybde-først søk (DFS) gjennom hele grafen",
    name: "DFSFull", params: "G",
    input: "En graf G = (V, E)",
    output: "Ingenting – alle noder blir besøkt",
    lines: [
      L("visited ← empty set", 1, "Vi lager én liste med kryss som alle søkene deler, så ingen node blir besøkt to ganger.", "Én felles mengde for hele søket.", "Felles visited er det som gjør totalen lineær."),
      L("for v ∈ V do", 1, "Vi går gjennom alle nodene.", "Prøv hver node som start.", "O(|V|) iterasjoner."),
      L("if v ∉ visited then", 2, "Har ingen av søkene nådd v ennå? Da starter vi et nytt søk derfra.", "Start et nytt søk bare fra noder vi ikke har nådd.", "I en urettet graf: hvert nye kall her er en ny sammenhengende komponent."),
      L("DFSVisit(G, v, visited)", 3, "Vi går så dypt vi kan ut fra v og setter kryss ved alt vi når.", "Besøk alt som kan nås fra v.", "Kallene deler visited, så summen av arbeidet er O(|V| + |E|).")
    ],
    bigO: { best: "O(|V| + |E|)", avg: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Hver node blir besøkt én gang, og hver kant blir sett på fra begge ender. Mer arbeid enn det blir det ikke.", "Hver node besøkes én gang, hver kant sjekkes fra begge ender.", "Ytre løkke O(|V|) pluss O(|V| + |E|) for alle DFSVisit-kallene til sammen.") }
  });

  reg(IN.gen, "grDFS", function (inp) {
    var g = inp[0], s = inp[1], A = adj(g), steps = [];
    var vis = [], inV = {}, stack = [], done = {}, tree = {}, cur = null, hot = null, order = [], popped = null;
    function snap(line, text, tag) {
      var nodes = {}, edges = {};
      vis.forEach(function (v) { nodes[v] = done[v] ? "done" : "seen"; });
      if (cur) nodes[cur] = "cur";
      keys(tree).forEach(function (k) { edges[k] = "tree"; });
      if (hot) edges[hot] = "hot";
      var panel = [{ label: "Kallstakk (bunn → topp):", items: stack.slice(), kind: "stack" }];
      if (popped) panel.push({ label: "Tatt av stakken:", items: [popped] });
      panel.push({ label: "Besøksrekkefølge:", items: order.slice() });
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, text: text, tag: tag, panel: panel,
        vars: line == null ? [] : [nv("u", popped || cur), nv("v", line === 4 || line === 5 ? tgt(hot) : null)], frame: line == null ? null : "DFSVisit" });
    }
    function visit(u, parent) {
      stack.push(u); cur = u; hot = null;
      var first = !steps.length;
      snap(1, t((parent ? "Vi går inn til " + u + "." : "Vi begynner i " + u + ".") + (first ? " Naboene til en node ser vi alltid på i alfabetisk rekkefølge." : ""),
                "DFSVisit(" + u + ") starter." + (parent ? " Kalt fra " + parent + "." : "") + (first ? " Naboene gås gjennom i alfabetisk rekkefølge." : ""),
                "Nytt kall: DFSVisit(G, " + u + ", visited). Kallstakken er nå " + stack.join(" → ") + "." + (first ? " Naboene gås gjennom i alfabetisk rekkefølge; rekkefølgen avgjør hvilket DFS-tre vi får." : "")), "Kall " + u);
      vis.push(u); inV[u] = 1; order.push(u);
      snap(2, t(u + " får et kryss.", "Merk " + u + " som besøkt.", "visited ∪= {" + u + "}."), "Merk " + u);
      A[u].forEach(function (nb) {
        var v = nb.v; cur = u; hot = ek(u, v);
        if (inV[v]) {
          snap(4, t(v + " har vi vært hos før.", "Naboen " + v + " er besøkt. Hopp over.", "v = " + v + " ∈ visited."), "Hopp over " + v);
        } else {
          tree[ek(u, v)] = 1;
          snap(5, t(v + " er ny. Vi går dit med en gang!", "Naboen " + v + " er ikke besøkt: kall DFSVisit(" + v + ").", "Kanten (" + u + ", " + v + ") blir en kant i DFS-treet. " + u + " venter på stakken."), "Gå til " + v);
          visit(v, u);
        }
      });
      done[u] = 1; stack.pop(); popped = u; cur = stack.length ? stack[stack.length - 1] : null; hot = null;
      snap(3, t("Ingen nye naboer hos " + u + ". " + u + " tas av stakken, og vi går tilbake" + (cur ? " til " + cur + "." : "."),
                u + " er ferdig og tas av kallstakken. Kallet returnerer" + (cur ? " til " + cur + "." : "."),
                "Løkka over naboene til " + u + " er ferdig, så kallet returnerer: rammen for " + u + " poppes. " + u + " er ferdig (grønn)."), "Ferdig " + u);
      popped = null;
    }
    var Vs = [s].concat(ids(g).filter(function (x) { return x !== s; }));
    Vs.forEach(function (v, i) {
      if (inV[v]) return;
      if (i > 0) {
        cur = null; hot = null;
        steps.push({ line: null, g: g, nodes: (function () { var o = {}; vis.forEach(function (x) { o[x] = "done"; }); o[v] = "cur"; return o; })(),
          edges: (function () { var o = {}; keys(tree).forEach(function (k) { o[k] = "tree"; }); return o; })(),
          panel: [{ label: "Kallstakk (bunn → topp):", items: [], kind: "stack" }, { label: "Besøksrekkefølge:", items: order.slice() }],
          vars: [nv("v", v)], frame: "DFSFull",
          text: t(v + " ble aldri nådd. Vi starter på nytt der.", "DFSFull går videre i V og finner " + v + ", som ikke er besøkt. Ny komponent!",
                  "Ytre løkke i DFSFull: " + v + " ∉ visited, så vi kaller DFSVisit(G, " + v + ", visited). Ny sammenhengende komponent."), tag: "Ny start" });
      }
      visit(v, null);
    });
    cur = null;
    snap(null, t("Alle er besøkt.", "Ferdig. Blå kanter er DFS-treet (eller -skogen).", "Besøksrekkefølge: " + order.join(", ") + ". Blå kanter danner DFS-skogen."), "Ferdig");
    return linkVars(steps);
  });

  /* ===================== Topologisk sortering ===================== */
  var TOP_LINES = [
    L("stack ← empty stack", 1,
      "Vi lager en bunke for de som er klare.",
      "Stakken holder noder som ikke har noen gjenstående inngående kanter.",
      "Kurset bruker en stakk. En kø virker like godt; rekkefølgen blir annerledes, men fortsatt gyldig."),
    L("output ← empty list", 1,
      "Her skriver vi opp rekkefølgen.",
      "Lista vi bygger opp: den topologiske ordningen.",
      "Når en node legges i output, ligger alle nodene med kant inn til den allerede der."),
    L("for v ∈ V do", 1,
      "Vi går gjennom alle nodene én gang og teller hvor mange hver av dem venter på.",
      "Gå gjennom alle nodene én gang.",
      "Å telle inngrader for alle noder tar O(|V| + |E|)."),
    L("inDeg[v] ← indegree(v)", 2,
      "Vi teller hvor mange som må komme før v.",
      "inDeg[v] = antall kanter inn til v.",
      "Inngraden er antall kanter (x, v) ∈ E. Vi teller den ned i stedet for å fjerne kanter fra grafen."),
    L("if inDeg[v] = 0 then stack.push(v)", 2,
      "Ingen må komme før v? Da er v klar.",
      "Noder uten inngående kanter kan komme først.",
      "Finnes det ingen slik node, har grafen en sykel."),
    L("while stack is not empty do", 1,
      "Så lenge noen er klare, fortsetter vi.",
      "Gjenta til ingen flere noder er klare.",
      "Hver node pushes høyst én gang, så løkka går høyst |V| ganger."),
    L("u ← stack.pop()", 2,
      "Vi tar en av dem som ikke venter på noe. Hvem av de klare vi tar, spiller ingen rolle.",
      "Ta ut en node med inngrad 0.",
      "Hvilken vi tar, avgjør bare hvilken av de gyldige ordningene vi får."),
    L("append u to output", 2,
      "u får neste plass i rekkefølgen.",
      "Legg u bakerst i output.",
      "Alle forgjengerne til u er allerede i output, ellers ville inDeg[u] vært større enn 0."),
    L("for (u, v) ∈ E do", 2,
      "Vi ser på alle som ventet på u.",
      "Gå gjennom kantene ut fra u.",
      "Hver kant behandles høyst én gang i hele kjøringen, nøyaktig én gang hvis G er en DAG: O(|E|)."),
    L("inDeg[v] ← inDeg[v] − 1", 3,
      "v har én mindre å vente på.",
      "Kanten (u, v) er «brukt opp»: tell ned inngraden til v.",
      "Tilsvarer å fjerne kanten fra grafen, men koster bare O(1)."),
    L("if inDeg[v] = 0 then stack.push(v)", 3,
      "Venter v ikke på noen lenger? Da er v klar.",
      "Når den siste forgjengeren er tatt, blir v klar.",
      "Skjer høyst én gang per node. Noder som har inngrad 0 fra starten, ble pushet i den første løkka. Er G en DAG, blir hver node pushet nøyaktig én gang til sammen."),
    L("if |output| < |V| then error \"G har en sykel\"", 1,
      "Ble noen igjen? Da venter noen på hverandre i ring.",
      "Kom ikke alle nodene med, finnes det en sykel.",
      "Noder på en sykel får aldri inngrad 0: hver av dem venter på den forrige i sykelen.",
      { q: "Hvorfor betyr |output| < |V| at det finnes en sykel?",
        a: t("Står noen i ring og venter på hverandre, blir ingen av dem noen gang klare. Da kommer de aldri med i lista.",
             "En node kommer med bare når alle forgjengerne er med. På en sykel venter hver node på den forrige, så ingen av dem kommer med. Er grafen asyklisk, finnes det alltid en node med inngrad 0, så alle kommer med: |output| = |V|.",
             "Begge veier: i en DAG har enhver ikke-tom delgraf en node med inngrad 0, så algoritmen stopper ikke før alle er med. Har G en sykel, får ingen node på sykelen inngrad 0, så |output| < |V|. Testen er derfor både en sykelsjekk og en sjekk av at G er en DAG.") }),
    L("return output", 1,
      "Nå har vi en rekkefølge der alle kommer etter de de venter på.",
      "Returner den topologiske ordningen.",
      "For hver kant (u, v) står u før v i output.")
  ];
  reg(IN.algos, "topSort", {
    title: "Topologisk sortering (med inngrader)",
    name: "TopSort", params: "G",
    input: "En rettet graf G = (V, E)",
    output: "En liste med alle nodene der u står før v for hver kant (u, v), eller feil hvis G har en sykel",
    lines: TOP_LINES,
    bigO: { best: "O(|V| + |E|)", avg: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Hver node og hver kant blir behandlet høyst én gang.",
             "Inngradene telles én gang, hver node pushes og popes høyst én gang, og hver kant telles ned høyst én gang (nøyaktig én gang når grafen er en DAG).",
             "O(|V| + |E|) for inngradene, O(|V|) for stakkoperasjonene og O(|E|) for nedtellingene.") }
  });
  // Parsons: «stack ← empty stack» og «output ← empty list» er uavhengige og kan stå i begge rekkefølger.
  if (IN.algos.topSort) IN.algos.topSort.parsonsSwap = [[0, 1]];

  reg(IN.algos, "hasCycleDirected", {
    title: "Har en rettet graf en sykel? (via topologisk sortering)",
    name: "HasCycleDirected", params: "G",
    input: "En rettet graf G = (V, E)",
    output: "true hvis G har en sykel, ellers false",
    lines: [
      L("stack ← empty stack", 1, "En bunke for de som er klare.", "Samme oppsett som topologisk sortering.", "Vi trenger ikke selve ordningen, bare antallet."),
      L("processed ← 0", 1, "Vi teller hvor mange som blir klare.", "Antall noder som har fått inngrad 0.", "Erstatter output-lista; O(1) plass i stedet for O(|V|)."),
      L("for v ∈ V do", 1, "Vi går gjennom alle nodene og teller hvor mange hver av dem venter på.", "Tell inngrader.", "O(|V| + |E|)."),
      L("inDeg[v] ← indegree(v)", 2, "Hvor mange må komme før v?", "Antall kanter inn til v.", "Antall (x, v) ∈ E."),
      L("if inDeg[v] = 0 then stack.push(v)", 2, "Ingen før v? Da er v klar.", "Noder uten forgjengere starter.", "Ingen slik node ⇒ sykel."),
      L("while stack is not empty do", 1, "Så lenge noen er klare, fortsetter vi. Er bunken tom, er vi ferdige.", "Gjenta til stakken er tom.", "Høyst |V| runder."),
      L("u ← stack.pop()", 2, "Vi tar en av dem som ikke venter på noe lenger.", "Ta ut en node med inngrad 0.", ""),
      L("processed ← processed + 1", 2, "Vi teller at én til slapp gjennom. Til slutt ser vi om alle kom med.", "Tell u som behandlet.", ""),
      L("for (u, v) ∈ E do", 2, "Se på dem som ventet på u.", "Kantene ut fra u.", "Hver kant én gang: O(|E|)."),
      L("inDeg[v] ← inDeg[v] − 1", 3, "u er gjort, så v har én mindre å vente på.", "Tell ned inngraden til v.", ""),
      L("if inDeg[v] = 0 then stack.push(v)", 3, "Venter v ikke på noen lenger? Da legger vi v i bunken med de klare.", "Push v når den ikke venter på noen.", ""),
      L("return processed < |V|", 1,
        "Ble noen aldri klare? Da står de i ring.",
        "Har vi ikke behandlet alle nodene, finnes det en sykel.",
        "Noder på en sykel (og alt de leder til) får aldri inngrad 0.",
        { q: "Hvorfor < |V| og ikke ≤ |V|?",
          a: t("Kom alle med, er det ingen ring. Bare hvis noen mangler, er det en ring.",
               "processed kan aldri bli større enn |V|. processed = |V| betyr at alle kom med, altså ingen sykel. Med ≤ ville vi alltid svart true.",
               "processed ≤ |V| gjelder alltid, så «≤» ville gjort testen meningsløs. processed = |V| ⇔ G er en DAG.") })
    ],
    bigO: { best: "O(|V| + |E|)", avg: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Vi gjør det samme som topologisk sortering, bare at vi teller i stedet for å skrive opp rekkefølgen. Hver node og hver kant blir behandlet én gang.", "Hver node og kant behandles én gang.", "Lineært i |V| + |E|. Sammenlign: et nytt søk fra hver node ville gitt O(|V| · (|V| + |E|)).") }
  });

  // Steggenerator for begge: lines = { push0, pop, out, dec, pushv, check, ret }
  function topGen(inp, mode) {
    var g = inp[0], A = adj(g), V = ids(g), steps = [];
    var deg = {}, stack = [], out = [], removed = {}, cur = null, hot = null, U = null;
    // Linjenumrene er like i TopSort og HasCycleDirected (bare linje 3, 9, 13 og 14 skiller seg)
    var LN = { init: 5, push0: 6, pop: 8, out: 9, dec: 11, pushv: 12, check: 13, ret: 14 };
    V.forEach(function (v) { deg[v] = 0; });
    g.edges.forEach(function (e) { deg[e[1]]++; });
    var inOut = {};
    function snap(line, text, tag, extra) {
      var nodes = {}, edges = {}, lab = {};
      V.forEach(function (v) { if (!inOut[v]) lab[v] = deg[v]; });
      out.forEach(function (v) { nodes[v] = "done"; });
      stack.forEach(function (v) { nodes[v] = "queued"; });
      if (cur) nodes[cur] = "cur";
      keys(removed).forEach(function (k) { edges[k] = "dim"; });
      if (hot) edges[hot] = "hot";
      if (extra && extra.warn) extra.warn.forEach(function (v) { nodes[v] = "warn"; });
      var panel = [{ label: "Stakk (bunn → topp):", items: stack.slice(), kind: "stack" }];
      if (mode === "count") panel.push({ label: "processed:", items: [String(out.length)] });
      else panel.push({ label: "output:", items: out.slice() });
      var vars = [nv("u", U), nv("v", line === LN.pushv || line === LN.dec ? tgt(hot) : null)];
      if (mode === "count") vars.push(sv("processed", out.length));
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, lab: lab, text: text, tag: tag, panel: panel,
        vars: vars, frame: mode === "count" ? "HasCycleDirected" : "TopSort",
        note: "Tallet over en node er inngraden som gjenstår." });
    }
    snap(LN.init, t("Vi teller hvor mange piler som går inn til hver node. Nodene og pilene ut fra en node ser vi alltid på i alfabetisk rekkefølge.",
      "Inngradene er telt opp (tallet over hver node). Nodene og kantene ut fra en node gås gjennom i alfabetisk rekkefølge.",
      "inDeg: " + V.map(function (v) { return v + " = " + deg[v]; }).join(", ") + ". Nodene og kantene ut fra u gås gjennom i alfabetisk rekkefølge; rekkefølgen avgjør hvilken av de gyldige ordningene vi får."), "Tell inngrader");
    V.forEach(function (v) { if (deg[v] === 0) stack.push(v); });
    snap(LN.push0, t(stack.length ? stack.join(" og ") + " venter ikke på noen. De er klare." : "Alle venter på noen! Ingen kan starte.",
      stack.length ? "Noder med inngrad 0 legges på stakken: " + stack.join(", ") + "." : "Ingen node har inngrad 0.",
      "Startnoder (inngrad 0): {" + stack.join(", ") + "}."), "Startnoder");
    while (stack.length) {
      var u = stack.pop(); cur = u; hot = null; U = u;
      snap(LN.pop, t(u + " er klar og får tur.", "Pop " + u + " (sist lagt på stakken).", "u ← " + u + "."), "Pop " + u);
      out.push(u); inOut[u] = 1;
      snap(LN.out, t(mode === "count" ? u + " er nummer " + out.length + " vi har telt." : u + " får plass nummer " + out.length + " i rekkefølgen.", mode === "count" ? "processed = " + out.length + "." : u + " legges bakerst i output.",
        mode === "count" ? "processed ← " + out.length + "." : "output = [" + out.join(", ") + "]."), mode === "count" ? "Tell " + u : "Output " + u);
      A[u].forEach(function (nb) {
        var v = nb.v; hot = ek(u, v); deg[v]--;
        if (deg[v] === 0) {
          stack.push(v);
          snap(LN.pushv, t(v + " venter ikke på noen lenger. Nå er " + v + " klar!", "inDeg[" + v + "] blir 0, så " + v + " legges på stakken.",
            "inDeg[" + v + "] ← 0 ⇒ push(" + v + ")."), "Klar: " + v);
        } else {
          snap(LN.dec, t(v + " venter nå på " + deg[v] + " til.", "Tell ned: inDeg[" + v + "] = " + deg[v] + ".", "inDeg[" + v + "] ← " + deg[v] + " > 0, så " + v + " må vente."), "Tell ned " + v);
        }
        removed[ek(u, v)] = 1; hot = null;
      });
      cur = null;
    }
    var left = V.filter(function (v) { return !inOut[v]; });
    if (left.length) {
      snap(LN.check, t("Stakken er tom, men " + left.join(", ") + " ble aldri klare. De venter på hverandre i ring!",
        "Bare " + out.length + " av " + V.length + " noder kom med. Resten ligger på eller etter en sykel" + (mode === "count" ? ": svaret er true." : ": feil."),
        "|output| = " + out.length + " < |V| = " + V.length + ". Nodene " + left.join(", ") + " fikk aldri inngrad 0" + (mode === "count" ? " ⇒ return true." : " ⇒ error.")), "Sykel!", { warn: left });
    } else {
      snap(LN.check, t("Alle kom med. Det finnes ingen ring.", "Alle " + V.length + " nodene kom med, så grafen er en DAG" + (mode === "count" ? ": svaret er false." : "."),
        "|output| = |V| = " + V.length + (mode === "count" ? " ⇒ return false." : ", ingen feil.")), "Ingen sykel");
      if (mode !== "count") snap(LN.ret, t("Rekkefølgen er: " + out.join(", ") + ".", "Topologisk ordning: " + out.join(", ") + ".",
        "For hver kant (u, v) står u før v i " + out.join(", ") + "."), "Ferdig");
    }
    return linkVars(steps);
  }
  reg(IN.gen, "grTopSort", function (inp) { return topGen(inp, "list"); });
  reg(IN.gen, "grCycleDir", function (inp) { return topGen(inp, "count"); });

  reg(IN.algos, "dfsTopSort", {
    title: "Topologisk sortering med dybde-først søk",
    name: "DFSTopSort", params: "G",
    input: "En rettet asyklisk graf G = (V, E)",
    output: "En stakk der nodene, tatt av fra toppen, kommer i topologisk rekkefølge",
    lines: [
      L("stack ← empty stack", 1, "En bunke vi legger ferdige noder på.", "Nodene pushes når de er ferdige.", "Den sist ferdige ligger øverst."),
      L("visited ← empty set", 1, "Vi lager én liste med kryss som alle søkene deler.", "Felles visited for alle kallene.", ""),
      L("for u ∈ V do", 1, "Vi prøver hver node som start, så vi får med alle – også dem ingen peker på.", "Som DFSFull.", "O(|V|) iterasjoner."),
      L("if u ∉ visited then DFSVisit(G, u, visited, stack)", 2, "Ikke besøkt? Gå dypt derfra.", "DFS fra hver ubesøkt node. Varianten av DFSVisit pusher u når den er ferdig.", "Alle kallene til sammen: O(|V| + |E|)."),
      L("return stack", 1, "Ta av fra toppen, så får du rekkefølgen.", "Toppen av stakken er en node uten forgjengere.",
        "For hver kant (u, v) blir v ferdig før u (v er enten besøkt alt, eller besøkes inni kallet for u). Derfor ligger u over v.")
    ],
    bigO: { best: "O(|V| + |E|)", avg: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Det er et vanlig dybde-først søk gjennom hele grafen. Å legge hver node i bunken koster nesten ingenting ekstra.", "Som DFSFull, pluss én push per node.", "O(|V| + |E|). Merk: denne varianten sjekker ikke selv om G har en sykel.") }
  });
  reg(IN.algos, "dfsVisitStack", {
    title: "DFSVisit som pusher ferdige noder",
    name: "DFSVisit", params: "G, u, visited, stack",
    lines: [
      L("add u to visited", 1, "Vi setter kryss ved u, så vi ikke kommer hit igjen.", "Merk u som besøkt.", ""),
      L("for (u, v) ∈ E do", 1, "Vi ser på alle pilene ut fra u, én om gangen.", "Gå gjennom kantene ut fra u.", ""),
      L("if v ∉ visited then DFSVisit(G, v, visited, stack)", 2, "Har vi ikke vært hos denne naboen? Da går vi dit, og så langt vi kan derfra, før vi kommer tilbake.", "Rekursivt kall på ubesøkte naboer.", ""),
      L("stack.push(u)", 1, "Nå er alt etter u gjort. Legg u på bunken.", "u er ferdig: alt som kan nås fra u, ligger alt på stakken.",
        "Push skjer i <b>postorder</b>. Det er det som gjør at u havner over alle nodene den peker til.")
    ]
  });

  /* ===================== Dijkstra ===================== */
  reg(IN.algos, "dijkstra", {
    title: "Dijkstras algoritme (korteste stier, ikke-negative vekter)",
    name: "Dijkstra", params: "G, s",
    input: "En vektet graf G = (V, E) med w(u, v) ≥ 0, og en startnode s",
    output: "dist: korteste avstand fra s til hver node",
    lines: [
      L("dist ← empty map with ∞ as default", 1,
        "Vi vet ikke hvor langt det er noe sted ennå, så vi skriver «uendelig».",
        "Alle avstander starter som ∞ (ukjent).",
        "dist[v] er hele tiden en øvre grense for den korteste avstanden."),
      L("visited ← empty set", 1,
        "Her skriver vi opp stedene vi er helt sikre på avstanden til. Lista er tom i starten.",
        "Noder som er ferdige: avstanden deres er endelig.",
        "En node legges i visited første gang den tas ut av køen."),
      L("queue ← priority queue containing s with priority 0", 1,
        "Vi starter med s, og det koster 0 å være der.",
        "En prioritetskø (min-heap) med s, prioritet 0.",
        "Køen gir oss alltid noden med lavest foreløpig avstand."),
      L("dist[s] ← 0", 1, "Vi står allerede i s, så det koster ingenting å komme dit.", "Avstanden til start er 0.", ""),
      L("while queue is not empty do", 1, "Så lenge det er noe i køen …", "Gjenta til køen er tom.", "Køen kan ha flere oppføringer for samme node, høyst én per kant."),
      L("u ← RemoveMin(queue)", 2,
        "Vi tar den som er nærmest.",
        "Ta ut noden med lavest prioritet.",
        "Det grådige valget: når u tas ut første gang, er dist[u] riktig (fordi ingen vekter er negative).",
        { q: "Hvorfor holder det å ta den nærmeste?",
          a: t("Alle andre veier er minst like lange allerede, og med ikke-negative vekter kan de bare bli lengre.",
               "Alle andre noder i køen har avstand ≥ dist[u]. En omvei gjennom dem kan aldri bli kortere, fordi vektene er ≥ 0.",
               "Enhver annen sti til u må forlate den ferdige mengden via en node x med dist[x] ≥ dist[u], og resten av stien har vekt ≥ 0. Med negative vekter faller argumentet – da trengs Bellman-Ford.") }),
      L("if u ∈ visited then continue", 2,
        "Er u ferdig fra før? Da er dette en gammel lapp. Kast den.",
        "Gamle oppføringer for u hoppes over.",
        "Kurset viser to varianter: én som senker prioriteten (DecreasePriority), og denne, som legger inn v på nytt og kaster utdaterte oppføringer her. Begge gir samme svar når ingen vekter er negative. Med negative vekter kan visited-varianten gi feil svar: en node som alt er i visited, blir aldri oppdatert igjen.",
        { q: "Hva skjer med negative kanter?",
          a: t("Da kan en vei som så lang ut, plutselig bli kortere. Men vi har alt skrevet opp at vi var ferdige med noden, så vi retter det aldri.",
               "Når u er i visited, ser vi aldri på u igjen. Finner vi senere en kortere vei til u via en negativ kant, blir den ikke brukt. Svaret kan da bli feil. Bruk Bellman-Ford når det finnes negative vekter.",
               "Beviset for linje 7 bruker at resten av en sti har vekt ≥ 0. Med en negativ kant kan dist[u] være for stor når u legges i visited, og visited-testen hindrer at feilen rettes. En variant uten visited-test kan gi et annet svar på samme graf, så svaret avhenger av varianten. Med negative vekter bruker vi Bellman-Ford.") }),
      L("add u to visited", 2, "Nå vet vi sikkert hvor langt det er til u. Den avstanden endrer seg aldri mer.", "dist[u] er endelig.", ""),
      L("for (u, v) ∈ E do", 2, "Se på alle veier ut fra u.", "Gå gjennom kantene ut fra u.", "Hver kant behandles én gang (fra hver ende i en urettet graf)."),
      L("c ← dist[u] + w(u, v)", 3, "Hvor langt blir det til v hvis vi går via u?", "Lengden på stien til v via u.", ""),
      L("if c < dist[v] then", 3, "Er det kortere enn det vi visste?", "Fant vi en kortere vei til v?", "Dette kalles å <b>relaksere</b> kanten (u, v)."),
      L("dist[v] ← c", 4, "Skriv opp den nye, kortere avstanden.", "Oppdater avstanden til v.", ""),
      L("Insert(queue, v) with priority c", 4,
        "Legg en ny lapp for v i køen.",
        "Legg v inn i køen med den nye avstanden.",
        "O(log |V|) per innsetting. Den gamle oppføringen blir liggende og kastes på linje 8."),
      L("return dist", 1, "Nå vet vi hvor langt det er til alle.", "Returner avstandene.", "Noder som ikke kan nås fra s, har fortsatt dist = ∞.")
    ],
    bigO: { best: "O(1)", avg: "O((|V| + |E|) · log(|V|))", worst: "O((|V| + |E|) · log(|V|))", space: "O(|V| + |E|)",
      why: t("Hver gang vi legger en lapp i køen eller tar en ut, må køen ryddes litt. Det går fort, også når køen er stor. Vi legger inn høyst én lapp per vei vi ser på, så arbeidet vokser med antall veier og steder.",
             "Høyst én innsetting per kant og ett uttak per oppføring, hver O(log |V|). Best: s har ingen naboer.",
             "Høyst |E| + 1 oppføringer i køen. Hver Insert/RemoveMin er O(log |E|) = O(log |V|), siden |E| ≤ |V|². I tillegg O(|V| + |E|) for løkkene. Kurset skriver O((|V| + |E|) · log(|V|)).") }
  });

  function pqItems(pq, fmt, stale) {
    return pq.slice().sort(function (a, b) { return a.p - b.p || a.seq - b.seq; }).map(function (x) {
      var s = fmt(x);
      return stale(x) ? "<s>" + s + "</s>" : s;
    });
  }
  function pqPop(pq) {
    var bi = 0;
    for (var i = 1; i < pq.length; i++) if (pq[i].p < pq[bi].p || (pq[i].p === pq[bi].p && pq[i].seq < pq[bi].seq)) bi = i;
    return pq.splice(bi, 1)[0];
  }
  function fmtD(d) { return d === Infinity ? "∞" : String(d); }

  reg(IN.gen, "grDijkstra", function (inp) {
    var g = inp[0], s = inp[1], A = adj(g), V = ids(g), steps = [];
    var dist = {}, prev = {}, vis = {}, pq = [], seq = 0, cur = null, hot = null, hiV = null, U = null, C = null;
    V.forEach(function (v) { dist[v] = Infinity; });
    function snap(line, text, tag) {
      var hiN = hiV || cur;
      var nodes = {}, edges = {}, lab = {};
      V.forEach(function (v) { lab[v] = fmtD(dist[v]); });
      pq.forEach(function (x) { if (!vis[x.v]) nodes[x.v] = "queued"; });
      keys(vis).forEach(function (v) { nodes[v] = "done"; });
      if (cur) nodes[cur] = "cur";
      keys(prev).forEach(function (v) { edges[ek(prev[v], v)] = "tree"; });
      if (hot) edges[hot] = "hot";
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, lab: lab, text: text, tag: tag,
        panel: [{ label: "Prioritetskø (minst først):", items: pqItems(pq, function (x) { return x.v + ":" + x.p; }, function (x) { return vis[x.v] || x.p > dist[x.v]; }), kind: "queue" },
                { label: "visited:", items: V.filter(function (v) { return vis[v]; }) }],
        vars: line == null ? [] : [nv("s", s), nv("u", U), nv("v", line === 12 || line === 14 ? hiV : null), sv("c", line === 12 || line === 14 ? C : null)], frame: line == null ? null : "Dijkstra",
        table: { head: [""].concat(V), rows: [["dist"].concat(V.map(function (v) { return fmtD(dist[v]); }))], hi: hiN ? V.indexOf(hiN) + 1 : null },
        note: "Tallet over en node er dist. Blå kanter: beste kjente vei. Overstreket i køen = gammel oppføring. Uthevet i tabellen: avstanden vi oppdaterer eller sammenligner med (ellers noden vi står i)." });
    }
    pq.push({ v: s, p: 0, seq: seq++ }); dist[s] = 0;
    snap(5, t("Alle avstander er ukjente (∞), unntatt " + s + ", som er 0. Naboene til en node ser vi alltid på i alfabetisk rekkefølge.",
      "dist[" + s + "] = 0, alle andre ∞. Køen inneholder " + s + ":0. Naboene gås gjennom i alfabetisk rekkefølge, og like prioriteter tas ut i den rekkefølgen de ble lagt inn.",
      "Initialisering: dist[" + s + "] ← 0, queue = {(" + s + ", 0)}. Naboene gås gjennom i alfabetisk rekkefølge; ved lik prioritet tas den eldste oppføringen ut først."), "Start");
    while (pq.length) {
      var x = pqPop(pq), u = x.v; cur = u; hot = null; U = u;
      if (vis[u]) {
        snap(8, t("Lappen " + u + ":" + x.p + " er gammel. " + u + " er alt ferdig, så vi kaster den.",
          u + " er alt i visited (med dist " + dist[u] + "). Oppføringen med prioritet " + x.p + " hoppes over.",
          "RemoveMin ga (" + u + ", " + x.p + "), men " + u + " ∈ visited ⇒ continue."), "Gammel " + u);
        continue;
      }
      snap(7, t(u + " er nærmest av de i køen (" + x.p + ").", "RemoveMin gir " + u + " med prioritet " + x.p + ".", "u ← " + u + ". dist[" + u + "] = " + dist[u] + " er nå endelig."), "Ta ut " + u);
      vis[u] = 1;
      snap(9, t("Nå vet vi sikkert at det er " + dist[u] + " til " + u + ". " + u + " skrives opp som ferdig.",
        u + " er ikke i visited fra før, så den legges i visited. dist[" + u + "] = " + dist[u] + " endrer seg ikke mer.",
        "u ∉ visited, så testen på linje 8 slipper oss videre: visited ∪= {" + u + "}. dist[" + u + "] = " + dist[u] + " er endelig."), u + " i visited");
      A[u].forEach(function (nb) {
        var v = nb.v, c = dist[u] + nb.w; hot = ek(u, v); hiV = v; C = c;
        if (c < dist[v]) {
          var old = dist[v]; dist[v] = c; prev[v] = u; pq.push({ v: v, p: c, seq: seq++ });
          snap(14, t("Via " + u + " blir det " + dist[u] + " + " + nb.w + " = " + c + " til " + v + ". Det er kortere enn " + fmtD(old) + "!",
            "c = " + dist[u] + " + " + nb.w + " = " + c + " < " + fmtD(old) + ": oppdater dist[" + v + "] og legg " + v + ":" + c + " i køen.",
            "Relaksering av (" + u + ", " + v + "): " + c + " < " + fmtD(old) + " ⇒ dist[" + v + "] ← " + c + ", Insert(" + v + ", " + c + ")."), "Bedre vei til " + v);
        } else {
          snap(12, t("Via " + u + " blir det " + c + " til " + v + ". Det er ikke bedre enn " + fmtD(dist[v]) + ".",
            "c = " + dist[u] + " + " + nb.w + " = " + c + " ≥ dist[" + v + "] = " + fmtD(dist[v]) + ". Ingen endring.",
            "c = " + c + " ≥ " + fmtD(dist[v]) + ": testen på linje 12 feiler."), "Ikke bedre");
        }
      });
      hot = null; hiV = null;
    }
    cur = null;
    snap(null, t("Køen er tom. Nå vet vi korteste avstand til alle.", "Ferdig. Blå kanter danner treet av korteste stier fra " + s + ".",
      "dist = {" + V.map(function (v) { return v + ": " + fmtD(dist[v]); }).join(", ") + "}."), "Ferdig");
    return linkVars(steps);
  });

  /* ===================== Bellman-Ford ===================== */
  reg(IN.algos, "bellmanFord", {
    title: "Bellman-Ford (korteste stier, negative vekter tillatt)",
    name: "BellmanFord", params: "G, s",
    input: "En vektet rettet graf G = (V, E) og en startnode s",
    output: "dist: korteste avstand fra s til hver node, eller feil ved negativ sykel",
    lines: [
      L("dist ← empty map with ∞ as default", 1, "Alle avstander er ukjente.", "Alle starter som ∞.", ""),
      L("dist[s] ← 0", 1, "Vi står allerede i s, så det koster ingenting å komme dit.", "Avstanden til start er 0.", ""),
      L("repeat |V| − 1 times", 1,
        "Vi går over alle veiene mange ganger, så de gode nyhetene rekker å spre seg.",
        "Gjenta |V| − 1 runder.",
        "Etter runde i er dist riktig for alle noder som har en korteste sti med høyst i kanter.",
        { q: "Hvorfor |V| − 1 runder og ikke |V|?",
          a: t("Den lengste veien uten å gå i ring besøker alle nodene, og den har én kant mindre enn antall noder.",
               "En korteste sti uten sykler besøker hver node høyst én gang, så den har høyst |V| − 1 kanter. Hver runde gjør stiene én kant lengre, så |V| − 1 runder holder.",
               "Uten negative sykler finnes det en enkel korteste sti, med høyst |V| − 1 kanter. Induksjon på antall kanter gir at dist er riktig etter |V| − 1 runder. Runde nummer |V| brukes bare til å oppdage negative sykler (linje 8–9).") }),
      L("for (u, v) ∈ E do", 2, "I hver runde ser vi på hver eneste vei i hele grafen, én om gangen.", "Gå gjennom alle kantene.", "O(|E|) per runde."),
      L("c ← dist[u] + w(u, v)", 3, "Hvor langt blir det via u?", "Lengden via u.", "Med ∞ + w = ∞."),
      L("if c < dist[v] then dist[v] ← c", 3, "Er veien via u kortere enn det vi visste? Da skriver vi opp den nye, kortere avstanden.", "Relakser kanten.", ""),
      L("for (u, v) ∈ E do", 1, "Nå skal alt være riktig. Vi går gjennom alle veiene én gang til for å kontrollere det.", "Gå gjennom alle kantene én gang til.", ""),
      L("if dist[u] + w(u, v) < dist[v] then error \"negativ sykel\"", 2,
        "Blir noe fortsatt kortere? Da finnes det en ring som gjør veien kortere hver gang vi går rundt.",
        "Kan noe fortsatt forbedres, finnes det en negativ sykel som kan nås fra s.",
        "Etter |V| − 1 runder er alle enkle stier tatt med. En forbedring nå betyr en sti med minst |V| kanter som er kortere, altså en sykel med negativ total vekt."),
      L("return dist", 1, "Ingenting ble kortere i kontrollrunden. Nå vet vi hvor kort veien til hver node kan bli.", "Returner avstandene.", "")
    ],
    bigO: { best: "O(|V| · |E|)", avg: "O(|V| · |E|)", worst: "O(|V| · |E|)", space: "O(|V|)",
      why: t("Vi går over alle kantene nesten like mange ganger som det er noder.", "|V| − 1 runder, hver over alle |E| kanter.", "(|V| − 1) · |E| + |E| relakseringer à O(1): O(|V| · |E|).") }
  });

  /* ===================== Prim ===================== */
  reg(IN.algos, "prim", {
    title: "Prims algoritme (minimalt spenntre)",
    name: "Prim", params: "G",
    input: "En sammenhengende, vektet, urettet graf G = (V, E)",
    output: "parents: for hver node, forelderen i et minimalt spenntre",
    lines: [
      L("queue ← empty priority queue", 1, "En kø der den billigste kommer først.", "Prioritetskø over kanter, ordnet på vekt.", "Min-heap."),
      L("parents ← empty map", 1, "Her skriver vi opp hvem som hekter seg på hvem.", "parents[u] = noden u ble koblet til treet fra.", "Nøklene i parents er nodene som er med i treet."),
      L("Insert(queue, (null, s)) with priority 0, for an arbitrary s ∈ V", 1,
        "Vi starter et vilkårlig sted.", "Start fra en vilkårlig node s.", "Startnoden har ingen forelder (null)."),
      L("while queue is not empty do", 1, "Så lenge det er kanter igjen i køen …", "Gjenta til køen er tom.", ""),
      L("(p, u) ← RemoveMin(queue)", 2,
        "Ta den billigste kanten vi kjenner til.",
        "Ta ut den letteste kanten (p, u).",
        "Grådig valg: den letteste kanten ut av treet er alltid trygg å ta med."),
      L("if u ∉ parents then", 2,
        "Er u ikke med i treet ennå?",
        "Kanter til noder som alt er i treet, kastes. De ville laget en sykel.",
        "Begge ender i treet ⇒ kanten ville lukket en sykel."),
      L("parents[u] ← p", 3, "u blir med i treet, koblet til p med den billigste kabelen vi fant.", "Kanten (p, u) blir med i spenntreet.", ""),
      L("for (u, v) ∈ E do", 3, "Se på alle kanter ut fra u.", "Gå gjennom kantene ut fra den nye noden.", ""),
      L("Insert(queue, (u, v)) with priority w(u, v)", 4,
        "Legg dem i køen, ordnet på pris.",
        "Legg kanten inn med vekten som prioritet.",
        "Vi sjekker ikke om v alt er i treet her; det gjøres på linje 7 når kanten tas ut."),
      L("return parents", 1, "Ferdig: alle er hektet på.", "parents beskriver spenntreet.", "|V| − 1 kanter (alle unntatt startnoden har en forelder).")
    ],
    bigO: { best: "O(|E| · log(|V|))", avg: "O(|E| · log(|V|))", worst: "O(|E| · log(|V|))", space: "O(|E|)",
      why: t("Hver kant går inn og ut av køen, og det koster litt hver gang.",
             "Hver kant settes inn og tas ut høyst to ganger (én gang fra hver ende), O(log |V|) hver.",
             "O(|E|) heap-operasjoner à O(log |E|) = O(log |V|). Samme som Dijkstra; kurset skriver O(|E| · log(|V|)). For en sammenhengende graf er |E| ≥ |V| − 1, så dette er det samme som O((|V| + |E|) · log(|V|)).") }
  });

  reg(IN.gen, "grPrim", function (inp) {
    var g = inp[0], s = inp[1], A = adj(g), V = ids(g), steps = [];
    var parents = {}, order = [], pq = [], seq = 0, cur = null, hot = null, total = 0, P, U = null;
    function snap(line, text, tag) {
      var nodes = {}, edges = {};
      order.forEach(function (v) { nodes[v] = "done"; });
      if (cur) nodes[cur] = "cur";
      order.forEach(function (v) { if (parents[v] != null) edges[ek(parents[v], v)] = "tree"; });
      if (hot) edges[hot] = "hot";
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, text: text, tag: tag,
        panel: [{ label: "Prioritetskø (minst først):", items: pqItems(pq, function (x) { return "(" + (x.a || "null") + "," + x.v + "):" + x.p; }, function (x) { return parents.hasOwnProperty(x.v); }), kind: "queue" },
                { label: "I treet:", items: order.slice() }, { label: "Totalvekt:", items: [String(total)] }],
        vars: line == null ? [] : [P === undefined ? sv("p", null) : P === null ? sv("p", "null") : nv("p", P), nv("u", U)], frame: line == null ? null : "Prim",
        note: "Overstreket = kanten går til en node som alt er i treet, og blir kastet når den tas ut." });
    }
    pq.push({ a: null, v: s, p: 0, seq: seq++ });
    snap(4, t("Vi starter i " + s + ". Kablene ut fra en node ser vi alltid på i alfabetisk rekkefølge.",
      "Køen inneholder (null, " + s + ") med prioritet 0. Kantene ut fra en node legges inn i alfabetisk rekkefølge, og ved lik vekt tas den eldste ut først.",
      "Start i s = " + s + ". Naboene gås gjennom i alfabetisk rekkefølge; ved lik prioritet tas den eldste oppføringen ut først."), "Start");
    while (pq.length) {
      var x = pqPop(pq), u = x.v; cur = u; hot = x.a ? ek(x.a, u) : null; P = x.a; U = u;
      if (parents.hasOwnProperty(u)) {
        snap(7, t(u + " er alt med i treet. Kanten ville laget en ring, så vi kaster den.", "(" + x.a + ", " + u + ") tas ut, men " + u + " er alt i treet. Kastes.",
          u + " ∈ parents ⇒ hopp over. Kanten ville lukket en sykel."), "Kast");
        continue;
      }
      snap(6, t("Den billigste kanten er " + (x.a ? x.a + "–" + u + " (" + x.p + ")" : "startnoden") + ".", "RemoveMin gir (" + (x.a || "null") + ", " + u + ") med vekt " + x.p + ".",
        "(p, u) = (" + (x.a || "null") + ", " + u + ")."), "Ta ut");
      parents[u] = x.a; order.push(u); total += x.a ? x.p : 0;
      snap(8, t(u + " er med i treet nå" + (x.a ? ", hektet på " + x.a + "." : "."), "parents[" + u + "] = " + (x.a || "null") + ". Totalvekt " + total + ".",
        (x.a ? "Kanten (" + x.a + ", " + u + ") er den letteste ut av treet, så den er trygg." : "Startnoden har ingen forelder.")), "Ta med " + u);
      hot = null;
      A[u].forEach(function (nb) { pq.push({ a: u, v: nb.v, p: nb.w, seq: seq++ }); });
      snap(10, t("Alle kantene ut fra " + u + " legges i køen.", "Legg kantene fra " + u + " i køen: " + A[u].map(function (nb) { return u + "–" + nb.v + " (" + nb.w + ")"; }).join(", ") + ".",
        "Insert for alle (" + u + ", v) ∈ E, også de som går tilbake inn i treet."), "Nye kanter");
    }
    cur = null; hot = null;
    snap(null, t("Køen er tom. Alle er hektet på med billigst mulig kabler: " + total + ".", "Ferdig. Spenntreet har totalvekt " + total + ".",
      "Minimalt spenntre med " + (order.length - 1) + " kanter og totalvekt " + total + "."), "Ferdig");
    return linkVars(steps);
  });

  /* ===================== Kruskal ===================== */
  reg(IN.algos, "kruskal", {
    title: "Kruskals algoritme (minimalt spenntre / spennskog)",
    name: "Kruskal", params: "G",
    input: "En vektet, urettet graf G = (V, E)",
    output: "T: kantene i en minimal spennskog (ett spenntre hvis G er sammenhengende)",
    lines: [
      L("T ← empty set", 1, "Vi har ingen kabler ennå.", "T er kantene vi har valgt.", "Hver node er sitt eget lille tre i starten."),
      L("sort E by weight, lightest first", 1, "Vi sorterer alle kablene fra billigst til dyrest.", "Sorter kantene på vekt.", "Sorteringen koster O(|E| · log(|E|)). Siden |E| ≤ |V|², er log(|E|) ≤ 2 · log(|V|), så det er det samme som O(|E| · log(|V|)). Det er vår egen regning; kurset oppgir ikke kjøretiden til Kruskal."),
      L("for {u, v} ∈ E in sorted order do", 1, "Vi prøver kablene én etter én, billigste først.", "Gå gjennom kantene i sortert rekkefølge.", ""),
      L("if u and v are in different trees in T then", 2,
        "Henger u og v ikke sammen ennå?",
        "Kanten er med bare hvis den ikke lager en sykel.",
        "Samme tre ⇒ det finnes alt en sti mellom u og v, så kanten ville lukket en sykel."),
      L("add {u, v} to T", 3, "Ta med kabelen. Nå henger de to trærne sammen.", "Ta med kanten. To trær slås sammen til ett.", "Grådig: den letteste kanten mellom to trær er trygg."),
      L("return T", 1, "Alle kablene er prøvd. De vi tok med, kobler sammen alt så billig som mulig.", "T er en minimal spennskog.", "Er G sammenhengende, har T |V| − 1 kanter og er et spenntre.")
    ],
    bigO: { best: "O(|E| · log(|V|))", avg: "O(|E| · log(|V|))", worst: "O(|E| · log(|V|))", space: "O(|V| + |E|)",
      why: t("Det meste av tiden går med til å sortere kablene.", "Sorteringen dominerer: O(|E| · log(|E|)), forutsatt at «samme tre?» kan sjekkes raskt.",
             "Vår egen regning (kurset oppgir ikke kjøretiden til Kruskal): sortering O(|E| · log(|E|)), og log(|E|) ≤ 2 · log(|V|). Det forutsetter at «samme tre?» kan sjekkes raskt, med en egen struktur som holder styr på hvilket tre hver node er i. Leter vi etter en sti mellom u og v for hver kant, blir det tregere: O(|E| · |V|).") }
  });

  reg(IN.gen, "grKruskal", function (inp) {
    var g = inp[0], V = ids(g), steps = [];
    var E = g.edges.map(function (e, i) { return { u: e[0], v: e[1], w: e[2], i: i, st: "" }; })
      .sort(function (a, b) {
        // Lik vekt: alfabetisk på kantnavnet (minste node først), slik teksten sier
        var ka = a.u < a.v ? a.u + a.v : a.v + a.u, kb = b.u < b.v ? b.u + b.v : b.v + b.u;
        return a.w - b.w || (ka < kb ? -1 : ka > kb ? 1 : a.i - b.i);
      });
    var comp = {}, total = 0, cur = null;
    V.forEach(function (v, i) { comp[v] = i; });
    function snap(line, text, tag) {
      var edges = {}, nodes = {}, cmap = {}, seen = {}, next = 0;
      E.forEach(function (e) {
        if (e.st === "ok") edges[ek(e.u, e.v)] = "tree";
        else if (e.st === "nei") edges[ek(e.u, e.v)] = "dim";
      });
      if (cur) { edges[ek(cur.u, cur.v)] = "hot"; nodes[cur.u] = "cur"; nodes[cur.v] = "cur"; }
      // Farge per tre (bare trær med mer enn én node får farge)
      var size = {}; V.forEach(function (v) { size[comp[v]] = (size[comp[v]] || 0) + 1; });
      V.forEach(function (v) { if (size[comp[v]] > 1) { if (seen[comp[v]] == null) seen[comp[v]] = next++; cmap[v] = seen[comp[v]]; } });
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, comp: cmap, text: text, tag: tag,
        panel: [{ label: "Kanter, sortert:", items: E.map(function (e) {
          var s = e.u + "–" + e.v + " " + e.w + (e.st === "ok" ? " ✓" : e.st === "nei" ? " ✗" : "");
          return e.st === "nei" ? "<s>" + s + "</s>" : (cur === e ? "<b>" + s + "</b>" : s);
        }) }, { label: "Totalvekt:", items: [String(total)] }],
        vars: line == null ? [] : [nv("u", cur ? cur.u : null), nv("v", cur ? cur.v : null)], frame: line == null ? null : "Kruskal",
        note: "Nodene i samme tre har samme farge." });
    }
    snap(3, t("Alle kablene er sortert fra billigst til dyrest. Koster to kabler det samme, tar vi dem i alfabetisk rekkefølge.",
      "Kantene er sortert på vekt, og kanter med lik vekt står i alfabetisk rekkefølge. Hver node er sitt eget tre.",
      "Kanter med lik vekt sorteres alfabetisk. Sortert: " + E.map(function (e) { return e.u + e.v + ":" + e.w; }).join(", ") + "."), "Sortert");
    E.forEach(function (e) {
      cur = e;
      if (comp[e.u] !== comp[e.v]) {
        var from = comp[e.v], to = comp[e.u];
        V.forEach(function (x) { if (comp[x] === from) comp[x] = to; });
        e.st = "ok"; total += e.w;
        snap(6, t(e.u + "–" + e.v + " (" + e.w + ") kobler sammen to deler som ikke hang sammen. Den tar vi med!",
          e.u + " og " + e.v + " er i ulike trær: ta med " + e.u + "–" + e.v + ". Totalvekt " + total + ".",
          "{" + e.u + ", " + e.v + "} krysser mellom to trær og er den letteste slike kanten ⇒ trygg."), "Ta med");
      } else {
        e.st = "nei";
        var full = E.filter(function (f) { return f.st === "ok"; }).length === V.length - 1;
        snap(5, t(e.u + " og " + e.v + " henger alt sammen. Kabelen ville laget en ring, så vi dropper den." + (full ? " (Alle husene henger alt sammen, men vi prøver kablene som er igjen.)" : ""),
          e.u + " og " + e.v + " er i samme tre: " + e.u + "–" + e.v + " ville laget en sykel. Hopp over." + (full ? " Treet er ferdig, men løkka går til kantene er brukt opp." : ""),
          "Samme tre ⇒ sykel. Kanten forkastes." + (full ? " T har alt |V| − 1 = " + (V.length - 1) + " kanter, men for-løkka går gjennom resten av E." : "")), "Forkast");
      }
    });
    cur = null;
    snap(null, t("Ferdig! Alle henger sammen, og prisen er " + total + ".", "Ferdig. Spenntreet har totalvekt " + total + ".", "T har " + E.filter(function (e) { return e.st === "ok"; }).length + " kanter, totalvekt " + total + "."), "Ferdig");
    return linkVars(steps);
  });

  /* ===================== Sterkt sammenhengende komponenter ===================== */
  reg(IN.algos, "scc", {
    title: "Sterkt sammenhengende komponenter (Kosaraju)",
    name: "StronglyConnectedComponents", params: "G",
    input: "En rettet graf G = (V, E)",
    output: "Mengden av sterkt sammenhengende komponenter",
    lines: [
      L("stack ← DFSTopSort(G)", 1,
        "Først går vi dypt gjennom hele grafen og legger nodene i en bunke når vi er ferdige med dem.",
        "Kjør DFS-varianten av topologisk sortering. Den virker selv om G har sykler.",
        "Noden øverst på stakken ligger i en komponent som ingen annen komponent har kant inn til (en «kilde» i komponentgrafen)."),
      L("Gr ← ReverseGraph(G)", 1,
        "Så snur vi alle pilene. Hvem som hører til samme gruppe, endrer seg ikke av det.",
        "Lag den omvendte grafen: hver kant (u, v) blir (v, u).",
        "G og Gr har nøyaktig de samme sterkt sammenhengende komponentene. O(|V| + |E|)."),
      L("visited ← empty set", 1, "Ingen er besøkt i runde to.", "Ny visited for andre fase.", ""),
      L("components ← empty set", 1, "Her samler vi gruppene vi finner. Den er tom i starten.", "Komponentene vi finner.", ""),
      L("while stack is not empty do", 1, "Så lenge bunken ikke er tom …", "Gå gjennom nodene i stakk-rekkefølge.", ""),
      L("u ← stack.pop()", 2, "Vi tar den som ble ferdig sist i første runde. Den ligger øverst i bunken.", "Ta ut den som ble ferdig sist.", ""),
      L("if u ∉ visited then", 2, "Er den ikke med i en gruppe ennå?", "Bare noder som ikke er i en komponent ennå.", ""),
      L("component ← empty set", 3, "Vi starter en ny gruppe: en klubb der alle kan nå alle.", "Start en ny komponent.", ""),
      L("DFSVisit(Gr, u, visited, component)", 3,
        "Gå dypt fra u med snudde piler. Alle vi når, er i samme gruppe.",
        "DFS i Gr fra u. Alt den når (og som ikke er besøkt), er komponenten til u.",
        "I Gr kan vi fra u bare nå noder som i G kan nå u. De som alt er besøkt, ligger i komponenter vi har funnet. Resten kan også nås fra u i G, så de er i samme komponent.",
        { q: "Hvorfor den omvendte grafen?",
          a: t("Med snudde piler kommer vi ikke ut av gruppen og over i en ny gruppe ved et uhell.",
               "I G kunne et søk fra u lekke over i andre komponenter som u peker til. I Gr peker de pilene inn mot u i stedet, så søket stopper ved grensen.",
               "Topp av stakken ligger i en kilde-komponent i G, altså en sluk-komponent i Gr. DFS fra en sluk kan ikke forlate den. Etter at den er fjernet (besøkt), gjelder det samme for neste.") }),
      L("add component to components", 3, "Alle vi nådde, er med. Gruppen er ferdig, og vi legger den til de andre.", "Lagre komponenten.", ""),
      L("return components", 1, "Nå er hver node med i nøyaktig én gruppe. Vi gir tilbake alle gruppene.", "Returner alle komponentene.", "Hver node er i nøyaktig én komponent.")
    ],
    bigO: { best: "O(|V| + |E|)", avg: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V| + |E|)",
      why: t("Vi går gjennom grafen to ganger og snur alle pilene én gang. Hver av de tre jobbene ser på hver node og hver pil omtrent én gang.", "DFSTopSort, ReverseGraph og den andre DFS-en er hver O(|V| + |E|).", "Tre lineære passeringer. Gr tar O(|V| + |E|) plass.") }
  });

  reg(IN.gen, "grSCC", function (inp) {
    var g = inp[0], V = ids(g), A = adj(g), steps = [], gr = reverse(g), Ar = adj(gr);
    var vis = {}, stack = [], done = {}, cur = null, comps = [], cmap = {}, call = [], tour = [];
    function snapA(text, tag) {
      var nodes = {};
      keys(vis).forEach(function (v) { nodes[v] = done[v] ? "done" : "seen"; });
      if (cur) nodes[cur] = "cur";
      steps.push({ line: 2, g: g, nodes: nodes, text: text, tag: tag, vars: [nv("u", null)], frame: "StronglyConnectedComponents",
        panel: [{ label: "Kallstakk (bunn → topp):", items: call.slice(), kind: "stack" },
                { label: "stack, ferdige noder (bunn → topp):", items: stack.slice(), kind: "stack" },
                { label: "Besøksrekkefølge:", items: tour.slice() }],
        note: "Fase 1 (DFSTopSort i G). Ring = besøkt og ligger på kallstakken. Grønn = ferdig og lagt på stack." });
    }
    snapA(t("Først går vi dypt gjennom grafen og legger hver node i en bunke når vi er ferdige med den. Naboene til en node ser vi alltid på i alfabetisk rekkefølge.",
      "Fase 1: DFSTopSort(G). Vi holder styr på to stakker: kallstakken (nodene vi er midt i) og stack (nodene som er ferdige). Naboene gås gjennom i alfabetisk rekkefølge.",
      "Fase 1: stack ← DFSTopSort(G). Kallstakken er rekursjonen i DFSVisit; stack får nodene i postorder (når kallet returnerer). Nodene og naboene gås gjennom i alfabetisk rekkefølge."), "Start");
    // Fase 1: DFSTopSort – ett steg når en node besøkes, og ett når den blir ferdig og pushes
    function dfs(u, from) {
      vis[u] = 1; cur = u; call.push(u); tour.push(u);
      snapA(t(from ? "Fra " + from + " går vi videre til " + u + "." : "Vi starter i " + u + ".",
        (from ? "DFS går fra " + from + " til " + u : "DFSTopSort starter et søk i " + u) + ". " + u + " er besøkt og ligger på kallstakken.",
        "DFSVisit(G, " + u + ") kalles" + (from ? " fra " + from : " fra den ytre løkka") + ". Kallstakken: " + call.join(" → ") + "."), "Besøk " + u);
      A[u].forEach(function (nb) { if (!vis[nb.v]) dfs(nb.v, u); });
      done[u] = 1; call.pop(); stack.push(u); cur = u;
      snapA(t(u + " er ferdig: alle den kan gå videre til, er besøkt. " + u + " legges på bunken med ferdige noder.",
        u + " er ferdig. Den tas av kallstakken og pushes på stack.",
        "Kallet DFSVisit(G, " + u + ") returnerer, og " + u + " pushes i postorder. stack = " + stack.join(", ") + "."), "Push " + u);
    }
    V.forEach(function (v) { if (!vis[v]) dfs(v, null); });
    cur = null;
    var order = stack.slice();
    function snapB(line, text, tag, hiComp) {
      var nodes = {};
      if (cur) nodes[cur] = "cur";
      var cm = {}; keys(cmap).forEach(function (v) { cm[v] = cmap[v]; });
      steps.push({ line: line, g: gr, nodes: nodes, comp: cm, text: text, tag: tag,
        vars: line == null ? [] : [nv("u", cur)], frame: line == null ? null : "StronglyConnectedComponents",
        panel: [{ label: "stack (bunn → topp):", items: stack.slice(), kind: "stack" },
                { label: "Komponenter:", items: comps.map(function (c) { return "{" + c.join(", ") + "}"; }) }],
        note: "Pilene er snudd (Gr). Hver farge er én sterkt sammenhengende komponent." });
    }
    snapB(3, t("Nå snur vi alle pilene.", "Gr: alle kanter er snudd. Stakken fra første fase: " + order.join(", ") + " (toppen til høyre).",
      "Gr ← ReverseGraph(G). Stakken (bunn → topp): " + order.join(", ") + "."), "Snu kantene");
    vis = {};
    while (stack.length) {
      var u = stack.pop(); cur = u;
      if (vis[u]) {
        snapB(8, t(u + " er alt i en gruppe.", u + " er alt besøkt. Hopp over.", u + " ∈ visited."), "Hopp over " + u);
        continue;
      }
      var comp = [];
      (function d2(x) { vis[x] = 1; comp.push(x); Ar[x].forEach(function (nb) { if (!vis[nb.v]) d2(nb.v); }); })(u);
      comp.sort();
      comp.forEach(function (x) { cmap[x] = comps.length; });
      comps.push(comp);
      snapB(10, t("Fra " + u + " med snudde piler når vi " + comp.join(", ") + ". De er én gruppe!",
        "DFS i Gr fra " + u + " finner {" + comp.join(", ") + "}. Det er komponenten til " + u + ".",
        "DFSVisit(Gr, " + u + ") når {" + comp.join(", ") + "} blant de ubesøkte. Komponent nr. " + comps.length + "."), "Komponent");
    }
    cur = null;
    snapB(null, t("Ferdig! Vi fant " + comps.length + " grupper.", comps.length + " sterkt sammenhengende komponenter: " + comps.map(function (c) { return "{" + c.join(", ") + "}"; }).join(", ") + ".",
      "components = {" + comps.map(function (c) { return "{" + c.join(", ") + "}"; }).join(", ") + "}."), "Ferdig");
    return linkVars(steps);
  });

  /* ===================== Sykler i urettede grafer ===================== */
  reg(IN.algos, "hasCycle", {
    title: "Har en urettet graf en sykel?",
    name: "HasCycle", params: "G",
    input: "En urettet graf G = (V, E)",
    output: "true hvis G har en sykel, ellers false",
    lines: [
      L("visited ← empty set", 1, "Vi lager én liste med kryss som alle søkene deler.", "Felles visited for alle komponentene.", ""),
      L("for u ∈ V do", 1, "Grafen kan bestå av flere biter, så vi prøver å starte et søk fra hver node.", "Sjekk hver komponent.", "Grafen kan ha flere komponenter, og sykelen kan ligge i hvilken som helst av dem."),
      L("if u ∉ visited then", 2, "Har vi ikke vært her? Da har vi funnet en bit av grafen vi ikke har lett i ennå.", "Start et søk i hver ny komponent.", ""),
      L("if HasCycleFrom(G, null, u, visited) then return true", 3, "Vi leter etter en ring i denne biten. Finner vi en, er vi ferdige med en gang.", "DFS fra u. Roten har ingen forelder (null).", "Summert over alle komponentene: O(|V| + |E|)."),
      L("return false", 1, "Vi lette i alle bitene og fant ingen ring. Da er grafen et tre, eller flere trær.", "Ingen komponent hadde en sykel: G er en skog.", "")
    ],
    bigO: { best: "O(1)", avg: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Hver node besøkes høyst én gang, og hver kant ses på fra begge ender. Det tar like lang tid som et vanlig dybde-først søk.", "Hver node besøkes én gang; vi kan stoppe tidlig når vi finner en sykel.", "Som DFSFull: O(|V| + |E|), og det er svaret sensor forventer. (Ekstra, ikke pensum: før vi finner en sykel, har vi bare fulgt kanter i DFS-treet, og en skog har høyst |V| − 1 kanter. Derfor stopper søket etter O(|V|) arbeid.)") }
  });
  reg(IN.algos, "hasCycleFrom", {
    title: "DFS som leter etter en sykel (urettet)",
    name: "HasCycleFrom", params: "G, p, u, visited",
    input: "Urettet graf G, forelderen p (eller null), noden u og visited",
    output: "true hvis DFS fra u finner en sykel",
    lines: [
      L("add u to visited", 1, "Vi setter kryss ved u, så vi kjenner den igjen hvis vi kommer hit en annen vei.", "Merk u som besøkt.", ""),
      L("for (u, v) ∈ E do", 1, "Vi ser på alle som u er koblet til, én om gangen.", "Gå gjennom naboene.", ""),
      L("if v = p then continue", 2,
        "Den vi nettopp kom fra, teller ikke.",
        "Hopp over kanten tilbake til forelderen.",
        "Kanten {p, u} ligger i naboliste til begge. Uten denne linja ville hver kant sett ut som en sykel.",
        { q: "Hvorfor må forelderen hoppes over?",
          a: t("Vi kom jo fra p. At vi ser p igjen, betyr ikke at vi har gått i ring.",
               "I en urettet graf står kanten {p, u} i nabolista til u. Uten unntaket ville vi sett p som «besøkt nabo» og trodd at vi fant en sykel – også i et tre. Sensorveiledningen for H2025 trekker 2 poeng for dette.",
               "En sykel krever minst tre noder i en enkel graf. Kanten tilbake til forelderen er en kant i DFS-treet, ikke en tilbakekant.") }),
      L("if v ∈ visited then return true", 2,
        "Har vi vært hos v før, via en annen vei? Da har vi gått i ring!",
        "En besøkt nabo som ikke er forelderen, betyr en sykel.",
        "Det er en tilbakekant: v er en forfeder til u i DFS-treet, så stien v → … → u pluss kanten {u, v} er en sykel."),
      L("if HasCycleFrom(G, u, v, visited) then return true", 2,
        "Gå videre til v, og husk at vi kom fra u.", "Rekursivt kall med u som forelder til v.", "Svaret bobler opp gjennom kallstakken."),
      L("return false", 1, "Vi kom oss gjennom alle naboene til u uten å møte et kryss. Her er det ingen ring.", "Ingen sykel i subtreet under u.", "")
    ]
  });

  reg(IN.gen, "grCycleUndir", function (inp) {
    var g = inp[0], V = ids(g), A = adj(g), steps = [];
    var vis = {}, par = {}, tree = {}, done = {}, stack = [], cur = null, hot = null, found = null, popped = null, answer = null;
    function frame(x) { return x[0] + "," + (x[1] || "null"); }
    function snap(line, text, tag) {
      var nodes = {}, edges = {};
      keys(vis).forEach(function (v) { nodes[v] = done[v] ? "done" : "seen"; });
      if (cur) nodes[cur] = "cur";
      keys(tree).forEach(function (k) { edges[k] = "tree"; });
      if (hot) edges[hot] = "hot";
      if (found) { found.cyc.forEach(function (v) { nodes[v] = "warn"; }); edges[found.back] = "back"; found.cycE.forEach(function (k) { edges[k] = "back"; }); }
      var panel = [{ label: "Kallstakk (u, p), bunn → topp:", items: stack.map(frame), kind: "stack" }];
      if (popped) panel.push({ label: "Tatt av stakken:", items: [popped] });
      if (answer) panel.push({ label: "Svar:", items: [answer] });
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, text: text, tag: tag, panel: panel,
        vars: line == null ? [] : [VP == null ? sv("p", "null") : nv("p", VP), nv("u", VU), nv("v", VV)], frame: line == null ? null : "HasCycleFrom" });
    }
    var VP = null, VU = null, VV = null;
    function visit(u, p) {
      stack.push([u, p]); vis[u] = 1; par[u] = p; cur = u; hot = null;
      VP = p; VU = u; VV = null;
      var first = !steps.length;
      snap(2, t("Vi går til " + u + (p ? " fra " + p : "") + " og setter kryss." + (first ? " Naboene til en node ser vi alltid på i alfabetisk rekkefølge." : ""),
        "HasCycleFrom(p = " + (p || "null") + ", u = " + u + "): merk " + u + "." + (first ? " Naboene gås gjennom i alfabetisk rekkefølge." : ""),
        "visited ∪= {" + u + "}." + (first ? " Naboene gås gjennom i alfabetisk rekkefølge; rekkefølgen avgjør hvilken tilbakekant vi finner først." : "")), "Besøk " + u);
      for (var i = 0; i < A[u].length; i++) {
        var v = A[u][i].v; cur = u; hot = ek(u, v);
        VP = p; VU = u; VV = v;
        if (v === p) { snap(4, t(v + " er den vi kom fra. Den teller ikke.", v + " er forelderen. Hopp over.", "v = p = " + v + " ⇒ continue."), "Forelder"); continue; }
        if (vis[v]) {
          // Finn sykelen: fra u opp til v langs forelderpekerne
          var cyc = [u], cycE = [], x = u;
          while (x !== v && par[x] != null) { cycE.push(ek(par[x], x)); x = par[x]; cyc.push(x); }
          found = { cyc: cyc, cycE: cycE, back: ek(u, v) };
          snap(5, t(v + " har vi vært hos før, men ikke rett før " + u + ". Vi har gått i ring: " + cyc.reverse().join(" – ") + " – " + v + "!",
            v + " er besøkt og ikke forelderen: sykel " + cyc.join(" – ") + " – " + v + ". Returner true.",
            "Tilbakekant {" + u + ", " + v + "}. Sammen med trestien fra " + v + " til " + u + " gir den en sykel. return true bobler opp."), "Sykel!");
          return true;
        }
        tree[ek(u, v)] = 1;
        snap(6, t(v + " er ny. Vi går dit, og husker at vi kom fra " + u + ".", "Rekursivt kall: HasCycleFrom(p = " + u + ", u = " + v + ").", "{" + u + ", " + v + "} blir en kant i DFS-treet."), "Gå til " + v);
        if (visit(v, u)) return true;
      }
      done[u] = 1; popped = frame(stack.pop()); cur = stack.length ? stack[stack.length - 1][0] : null; hot = null;
      VP = p; VU = u; VV = null;
      snap(7, t("Ingen ring under " + u + ". " + u + " tas av stakken, og vi går tilbake.", u + " gir false, og rammen (" + popped + ") tas av kallstakken.",
        "Ingen tilbakekant fra subtreet under " + u + ": return false, og rammen (" + popped + ") poppes."), "false fra " + u);
      popped = null;
      return false;
    }
    var hit = false;
    for (var i = 0; i < V.length && !hit; i++) {
      if (vis[V[i]]) continue;
      if (i > 0) { cur = null; hot = null; snap(null, t("Vi har ikke vært i " + V[i] + " ennå. Vi starter et nytt søk der.", "Ny komponent: HasCycle kaller HasCycleFrom(null, " + V[i] + ").", "Ytre løkke i HasCycle: ny komponent fra " + V[i] + "."), "Ny komponent"); }
      hit = visit(V[i], null);
    }
    if (hit) {
      var depth = stack.length;
      VP = null; VU = stack[0][0]; VV = stack[1] ? stack[1][0] : null;
      stack = []; cur = null; hot = null; answer = "true";
      snap(6, t("Vi har funnet en ring, så vi er ferdige. Svaret «ja, det finnes en ring» sendes tilbake helt til start.",
        "true sendes tilbake gjennom hele kallstakken: kallene under det innerste returnerer true på linje 6, ett etter ett, og til slutt returnerer HasCycle true.",
        "Det innerste kallet returnerte true på linje 5. De " + (depth - 1) + " rammene under det returnerer true på linje 6, én etter én, og HasCycle returnerer true uten å se på resten av grafen."), "true helt opp");
    } else {
      cur = null; answer = "false";
      snap(null, t("Vi fant ingen ring. Grafen er et tre (eller flere trær).", "Ingen sykel: HasCycle returnerer false. Grafen er et tre eller en skog.", "|E| = " + g.edges.length + ", |V| = " + V.length + ": en skog har |E| = |V| − (antall komponenter)."), "Ingen sykel");
    }
    return linkVars(steps);
  });

  /* ===================== Separasjonsnoder (2-sammenheng) ===================== */
  reg(IN.algos, "sepVertices", {
    title: "Separasjonsnoder",
    name: "SeparationVertices", params: "G",
    input: "En sammenhengende urettet graf G = (V, E)",
    output: "seps: alle separasjonsnodene i G",
    lines: [
      L("depth, low, seps ← empty map, empty map, empty set", 1, "Vi gjør klar tre notatblokker: hvor dypt hver node ligger, hvor høyt den kan klatre, og hvilke noder som holder grafen sammen.", "Delte variabler for alle kallene.", "depth = dybden i DFS-treet; low[u] = laveste dybde vi kan nå fra u ved å gå nedover i DFS-treet og så følge maksimalt én tilbakekant."),
      L("r ← an arbitrary node in V", 1, "Vi velger en hvilken som helst node å starte i. Den blir roten i treet vi lager.", "Velg en rot.", ""),
      L("depth[r] ← 0", 1, "Roten ligger øverst, på dybde 0. At den har fått en dybde, betyr også at vi har vært der.", "Roten får dybde 0.", "depth fungerer også som visited: en node er besøkt når den har fått en dybde."),
      L("Visit(G, r)", 1, "Vi går dypt gjennom hele grafen.", "Ett DFS fra roten.", "O(|V| + |E|)."),
      L("if r has more than one child in the DFS tree then add r to seps", 1,
        "Roten er spesiell: den er en separasjonsnode bare hvis den har flere grener.",
        "Roten er separasjonsnode hvis den har minst to barn i DFS-treet.",
        "Barna til roten er nodene med dybde 1. To barn betyr at ingen kant går mellom subtrærne deres, ellers ville DFS funnet det andre barnet fra det første.",
        { q: "Hvorfor egen regel for roten?",
          a: t("Det finnes ingen node over roten som kunne blitt avskåret, så vi må sjekke på en annen måte.",
               "Testen depth[u] ≤ low[v] er alltid sann for roten (dybde 0). Derfor sjekker vi i stedet om roten har mer enn ett barn.",
               "For roten gir low-testen ingen informasjon, siden low ≥ 0 = depth[r] alltid. Antall DFS-barn avgjør.") }),
      L("return seps", 1, "Nå har vi alle separasjonsnodene. Fjerner vi ett av dem, faller grafen i flere deler.", "Returner separasjonsnodene.", "G er 2-sammenhengende hvis og bare hvis seps er tom.")
    ],
    bigO: { best: "O(|V| + |E|)", avg: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Vi går gjennom grafen én gang og noterer litt ekstra underveis. Det tar like lang tid som et vanlig dybde-først søk.", "Ett DFS med O(1) ekstra arbeid per kant.", "Den naive metoden (fjern hver node og sjekk sammenheng) er O(|V| · (|V| + |E|)).") }
  });
  reg(IN.algos, "sepVisit", {
    title: "Visit (separasjonsnoder)",
    name: "Visit", params: "G, u",
    lines: [
      L("low[u] ← depth[u]", 1, "Foreløpig kommer vi ikke høyere enn der vi står.", "low starter som dybden til u.", ""),
      L("for (u, v) ∈ E do", 1, "Vi ser på alle som u er koblet til, én om gangen.", "Gå gjennom naboene til u.", ""),
      L("if v ∈ depth then", 2, "Har v allerede fått en dybde? Da har vi vært hos v før.", "v er besøkt (har fått dybde).", "Kanten {u, v} går opp til en forfeder (kanskje forelderen), eller ned til en etterkommer som allerede er ferdig – samme kant sett fra den andre enden. I det siste tilfellet er depth[v] > depth[u] ≥ low[u], så Min endrer ingenting."),
      L("low[u] ← Min(low[u], depth[v])", 3, "Via denne kanten kan vi klatre til v. Ligger v høyere opp enn vi har klart før, noterer vi det.", "Oppdater low med dybden til v.", ""),
      L("else", 2, "Har vi ikke vært hos v før, blir v et nytt barn under u.", "v er ikke besøkt ennå.", "Da blir {u, v} en kant i DFS-treet."),
      L("depth[v] ← depth[u] + 1", 3, "v ligger ett hakk lenger ned i treet enn u.", "v blir barn av u i DFS-treet.", ""),
      L("Visit(G, v)", 3, "Vi går dypt fra v og finner ut hvor høyt alle under v kan klatre.", "Rekursivt kall.", ""),
      L("low[u] ← Min(low[u], low[v])", 3, "Det v kommer opp til, kommer u også opp til.", "low arves oppover fra barna.", ""),
      L("if depth[u] ≠ 0 and depth[u] ≤ low[v] then add u to seps", 3,
        "Kommer ingen under v høyere opp enn u? Da er u den eneste broen. Fjerner vi u, faller v av.",
        "Kan ingen i subtreet til v nå over u, er u en separasjonsnode.",
        "Alle stier fra subtreet til v og opp til resten av grafen må gå via u.",
        { q: "Hvorfor ≤ og ikke <?",
          a: t("Hvis det beste v klarer, er å komme opp til u selv, så må vi fortsatt gjennom u.",
               "low[v] = depth[u] betyr at subtreet til v kan nå u, men ikke høyere. Da er u fortsatt eneste vei videre, så u er en separasjonsnode.",
               "Med < ville vi gått glipp av tilfellet low[v] = depth[u], f.eks. en sykel som henger på u. Den kommer ut av subtreet bare via u.") })
    ]
  });

  /* ============================================================
     EKSAMENSOPPGAVER (bølge 2): pseudokode med forklaring og steg-demoer
     til eksamenskortene på 06-grafer.html. Egne løsninger på kursnivå.
     Linjenummer i stegene: Procedure-linja er 1, så lines[i] er linje i + 2.
     ============================================================ */
  function hasEdge(g, u, v) {
    return g.edges.some(function (e) { return (e[0] === u && e[1] === v) || (!g.directed && e[0] === v && e[1] === u); });
  }
  function indeg(g) { var d = {}; ids(g).forEach(function (v) { d[v] = 0; }); g.edges.forEach(function (e) { d[e[1]]++; }); return d; }

  /* ---------- H2020-8 (a): verifikator for hamiltonsk sykel ---------- */
  reg(IN.algos, "type2Verifier", {
    title: "Verifikator for Type2 (hamiltonsk sykel)",
    name: "Type2Verifier", params: "G, C",
    input: "En graf G og et array av noder C",
    output: "Returner JA hvis C viser at G er av type 2, NEI ellers",
    lines: [
      L("N ← |C|", 1, "Vi teller hvor mange hus som er med i forslaget.", "N er antall noder i sertifikatet.",
        "Oppgaven lover at hver node står nøyaktig én gang i C. Da er N = |V|, og det trenger vi ikke sjekke."),
      L("for i ← 0 to N − 1 do", 1, "Vi går gjennom forslaget, ett hus om gangen.", "Én runde per node i C, og dermed én runde per kant i den foreslåtte sykelen.",
        "N runder. En sykel gjennom N noder har N kanter, også kanten fra den siste noden tilbake til den første.",
        { q: "Hvorfor helt til N − 1, og ikke bare til N − 2?",
          a: t("Den siste runden sjekker veien fra det siste huset og hjem igjen til det første. Uten den har vi bare en tur, ikke en rundtur.",
               "En sti gjennom N noder har N − 1 kanter, men en sykel har N. Runden med i = N − 1 sjekker kanten fra C[N − 1] tilbake til C[0]. Stopper vi på N − 2, godtar vi en sti som ikke lukker seg.",
               "Løkka sjekker de N kantene {C[0], C[1]}, …, {C[N − 2], C[N − 1]} og {C[N − 1], C[0]}. Sensorveiledningen trekker 1 poeng for å glemme den siste.") }),
      L("if {C[i], C[(i + 1) mod N]} ∉ E then", 2, "Går det en sykkelsti fra dette huset til det neste i forslaget?",
        "Sjekk at to noder som står etter hverandre i C, har en kant mellom seg i G.",
        "Med nabomatrise er oppslaget O(1). Med naboliste koster det O(grad), og summen over alle nodene er O(|V| + |E|).",
        { q: "Hvorfor (i + 1) mod N og ikke bare i + 1?",
          a: t("Når vi står på det siste huset, finnes det ikke noe «neste». Da går vi tilbake til det første.",
               "For i = N − 1 er i + 1 = N, som er utenfor arrayet. N mod N = 0, så vi sjekker kanten tilbake til C[0].",
               "(i + 1) mod N er i + 1 for alle i < N − 1, og 0 for i = N − 1. Da dekker én og samme linje alle N kantene.") }),
      L("return NEI", 3, "Én sti som mangler, holder for å si at forslaget ikke virker.", "En manglende kant betyr at C ikke er en sykel i G.",
        "Verifikatoren svarer bare på om dette sertifikatet holder. Den prøver ikke å finne en annen sykel."),
      L("return JA", 1, "Alle stiene fantes. Forslaget går innom alle husene og hjem igjen.", "Alle N kantene finnes, så C er en hamiltonsk sykel i G.",
        "N kantoppslag, altså polynomiell tid. Det er det (b) bygger på.")
    ],
    bigO: { best: "O(1)", worst: "O(|V| + |E|)", space: "O(1)",
      why: t("Vi sjekker hvert steg i forslaget én gang.", "N = |V| runder med ett kantoppslag hver.",
             "O(|V|) med nabomatrise, O(|V| + |E|) med naboliste. Begge er polynomielle, og det er alt (b) trenger.") }
  });
  reg(IN.gen, "grType2", function (inp) {
    var g = inp[0], C = inp[1].slice(), N = C.length, steps = [], ok = {};
    function snap(line, text, tag, cur, bad, I, res) {
      var nodes = {}, edges = {}, lab = {};
      C.forEach(function (v, k) { lab[v] = "C[" + k + "]"; });
      keys(ok).forEach(function (k) { edges[k] = "tree"; nodes[k.split(">")[0]] = "done"; });
      if (cur) { edges[ek(cur[0], cur[1])] = "hot"; nodes[cur[0]] = "cur"; nodes[cur[1]] = "cur"; }
      if (bad) { nodes[bad[0]] = "warn"; nodes[bad[1]] = "warn"; }
      var st = { line: line, g: g, nodes: nodes, edges: edges, lab: lab, text: text, tag: tag,
        panel: [{ label: "C:", items: C.slice() }].concat(res ? [{ label: "Svar:", items: [res] }] : []),
        vars: line == null ? [] : [sv("N", N), sv("i", I == null ? null : I)], frame: "Type2Verifier" };
      if (res) st.svar = res;
      steps.push(st);
    }
    snap(2, t("Forslaget har " + N + " hus. Nå sjekker vi at det går en sti fra hvert hus til det neste.",
      "N ← |C| = " + N + ". Merket over hver node er plassen i C.", "N ← " + N + ". C = [" + C.join(", ") + "]."), "N = " + N);
    for (var i = 0; i < N; i++) {
      var u = C[i], v = C[(i + 1) % N], last = i === N - 1;
      snap(4, t("Går det en sti mellom " + u + " og " + v + "?" + (last ? " Det er veien hjem igjen til det første huset." : ""),
        "i = " + i + ": finnes {" + u + ", " + v + "} i E?" + (last ? " (i + 1) mod N = 0, så dette er kanten tilbake til C[0]." : ""),
        "i = " + i + ": {C[" + i + "], C[" + ((i + 1) % N) + "]} = {" + u + ", " + v + "}" + (last ? ", kanten som lukker sykelen" : "") + "."), "i = " + i, [u, v], null, i);
      if (!hasEdge(g, u, v)) {
        snap(5, t("Det går ingen sti mellom " + u + " og " + v + ". Da holder ikke forslaget.",
          "{" + u + ", " + v + "} er ikke en kant i G: return NEI.",
          "{" + u + ", " + v + "} ∉ E, så C er ikke en sykel i G. Svaret gjelder dette sertifikatet."), "NEI", null, [u, v], i, "NEI");
        return linkVars(steps);
      }
      ok[ek(u, v)] = 1;
    }
    snap(6, t("Alle stiene fantes, også den hjem igjen. Forslaget er en rundtur innom alle husene.",
      "Alle " + N + " kantene finnes: return JA.", "Alle " + N + " kantene i den foreslåtte sykelen er i E. C er en hamiltonsk sykel."), "JA", null, null, null, "JA");
    return linkVars(steps);
  });

  /* ---------- H2020-8 (d): to distinkte stier langs den hamiltonske sykelen ---------- */
  reg(IN.algos, "twoPaths", {
    title: "To distinkte stier fra s til t (langs sertifikatet)",
    name: "TwoPaths", params: "G, C, s, t",
    input: "En graf G, to noder s og t og et sertifikat C",
    output: "Skriver ut to distinkte stier fra s til t",
    lines: [
      L("N ← |C|", 1, "Vi teller husene på rundturen.", "N er antall noder i sykelen.", "C er en hamiltonsk sykel, så alle nodene står i C, også s og t."),
      L("si ← 0", 1, "Vi begynner å lete etter s fra starten av lista.", "si skal bli plassen til s i C.", ""),
      L("while C[si] ≠ s do", 1, "Er dette s? Hvis ikke, ser vi på neste plass.", "Let fram til s.", "Høyst N runder: O(|V|)."),
      L("si ← si + 1", 2, "Ett hakk videre.", "Neste plass i C.", ""),
      L("i ← si", 1, "Første tur starter i s.", "Start den første stien i s.", ""),
      L("while C[i] ≠ t do", 1, "Vi går rundt én vei til vi kommer til t.", "Gå framover i C til vi treffer t.", "Løkka stopper alltid, fordi t står et sted i C."),
      L("print(C[i])", 2, "Skriv opp huset vi står ved.", "Skriv ut noden.", ""),
      L("i ← (i + 1) mod N", 2, "Gå til neste hus på rundturen. Etter det siste kommer det første.", "Ett steg framover langs sykelen.",
        "mod N gjør at vi går fra C[N − 1] til C[0]. Kanten mellom dem er med i sykelen."),
      L("print(C[i])", 1, "Nå står vi ved t. Den skriver vi også opp.", "Skriv ut t. Første sti er ferdig.", ""),
      L("i ← si", 1, "Tilbake til s for å gå den andre veien.", "Start den andre stien i s.", ""),
      L("while C[i] ≠ t do", 1, "Nå går vi rundt motsatt vei til vi kommer til t.", "Gå bakover i C til vi treffer t.", ""),
      L("print(C[i])", 2, "Skriv opp huset vi står ved.", "Skriv ut noden.", ""),
      L("i ← (i − 1 + N) mod N", 2, "Gå til forrige hus. Før det første kommer det siste.", "Ett steg bakover langs sykelen.",
        "De to stiene bruker hver sin bue av sykelen. Bortsett fra s og t har de ingen felles noder.",
        { q: "Hvorfor + N før mod N?",
          a: t("Står vi på det første huset, skal vi hoppe til det siste, ikke til en plass før starten.",
               "For i = 0 blir i − 1 = −1. I mange språk gir −1 mod N et negativt tall. Med + N får vi N − 1, altså den siste plassen.",
               "(i − 1 + N) mod N ligger alltid i 0, …, N − 1. I pseudokode kan man skrive (i − 1) mod N og mene matematisk modulo, slik sensorveiledningen gjør. + N gjør det entydig.") }),
      L("print(C[i])", 1, "Nå står vi ved t igjen. Ferdig med begge turene.", "Skriv ut t. Andre sti er ferdig.", "To distinkte stier. Til sammen O(|V|).")
    ],
    bigO: { best: "O(|V|)", worst: "O(|V|)", space: "O(1)",
      why: t("Vi går rundt én gang i hver retning, og leter én gang etter s.", "Hver løkke går høyst N = |V| runder.", "Tre løkker à høyst |V| runder: O(|V|). Grafen G trengs ikke, sertifikatet holder.") }
  });
  reg(IN.gen, "grTwoPaths", function (inp) {
    var g = inp[0], C = inp[1].slice(), s = inp[2], tt = inp[3], N = C.length, steps = [];
    var p1 = [], p2 = [], si = 0, i = 0, cur = null;
    function snap(line, text, tag) {
      var nodes = {}, edges = {}, lab = {};
      C.forEach(function (v, k) { lab[v] = String(k); });
      for (var a = 0; a + 1 < p1.length; a++) edges[ek(p1[a], p1[a + 1])] = "tree";
      for (var b = 0; b + 1 < p2.length; b++) edges[ek(p2[b], p2[b + 1])] = "cand";
      p1.concat(p2).forEach(function (v) { nodes[v] = "done"; });
      nodes[s] = "src"; nodes[tt] = nodes[tt] || "src";
      if (cur) nodes[cur] = "cur";
      var st = { line: line, g: g, nodes: nodes, edges: edges, lab: lab, text: text, tag: tag,
        panel: [{ label: "C:", items: C.slice() }, { label: "Sti 1:", items: p1.slice() }, { label: "Sti 2:", items: p2.slice() }],
        vars: line == null ? [] : [sv("si", si), sv("i", i), nv("C[i]", C[i])], frame: "TwoPaths",
        note: "Tallet over en node er plassen i C. Blå kanter: sti 1. Stiplet: sti 2." };
      steps.push(st);
      return st;
    }
    snap(3, t("Vi skal finne to veier fra " + s + " til " + tt + ". Først leter vi etter " + s + " i lista.", "N = " + N + ", si = 0.", "N ← " + N + ", si ← 0."), "Start");
    while (C[si] !== s) { si++; i = si; cur = C[si]; snap(5, t("Plass " + si + " har " + C[si] + ".", "si ← " + si + ".", "C[" + si + "] = " + C[si] + "."), "si = " + si); }
    i = si; cur = s;
    snap(6, t(s + " står på plass " + si + ". Der starter vi den første turen.", "i ← si = " + si + ".", "s = C[" + si + "]."), "Fant s");
    while (C[i] !== tt) {
      p1.push(C[i]); cur = C[i];
      snap(8, t("Vi skriver " + C[i] + ".", "print(" + C[i] + "). Sti 1 så langt: " + p1.join(", ") + ".", "Sti 1: " + p1.join(" – ") + "."), "Skriv " + C[i]);
      i = (i + 1) % N; cur = C[i];
    }
    p1.push(C[i]);
    snap(10, t("Vi er fremme ved " + tt + ". Første tur: " + p1.join(", ") + ".", "print(" + tt + "). Sti 1 er " + p1.join(", ") + ".", "Sti 1 følger C framover: " + p1.join(" – ") + "."), "Sti 1 ferdig");
    i = si; cur = s;
    snap(11, t("Tilbake til " + s + ". Nå går vi den andre veien rundt.", "i ← si = " + si + ".", "Andre sti følger C bakover."), "Tilbake til s");
    while (C[i] !== tt) {
      p2.push(C[i]); cur = C[i];
      snap(13, t("Vi skriver " + C[i] + ".", "print(" + C[i] + "). Sti 2 så langt: " + p2.join(", ") + ".", "Sti 2: " + p2.join(" – ") + "."), "Skriv " + C[i]);
      i = (i - 1 + N) % N; cur = C[i];
    }
    p2.push(C[i]); cur = null;
    var last = snap(15, t("Fremme ved " + tt + " igjen. Andre tur: " + p2.join(", ") + ". De to turene deler bare start og mål.",
      "print(" + tt + "). Sti 2 er " + p2.join(", ") + ". De to stiene har bare " + s + " og " + tt + " felles.",
      "Sti 1: " + p1.join(" – ") + ". Sti 2: " + p2.join(" – ") + ". Hver bruker sin bue av sykelen, så de er distinkte."), "Ferdig");
    last.svar = p1.join(", ") + " og " + p2.join(", ");
    return linkVars(steps);
  });

  /* ---------- H2020-8 (h): Dijkstra på den sammenslåtte grafen ---------- */
  // Kjører grDijkstra, men tegner kantene med vekt 10 svakt og uten tall (unntatt fra A), så figuren blir lesbar.
  reg(IN.gen, "grDijkstraH2020", function (inp) {
    var g = inp[0], s = inp[1];
    var disp = { directed: false, nodes: g.nodes, edges: g.edges.map(function (e) {
      var ten = e[2] === 10, fromS = e[0] === s || e[1] === s;
      return [e[0], e[1], ten && !fromS ? null : e[2], e[3]];
    }) };
    var tens = g.edges.filter(function (e) { return e[2] === 10; });
    var steps = IN.gen.grDijkstra([g, s]);
    steps.forEach(function (st) {
      st.g = disp;
      tens.forEach(function (e) {
        var a = ek(e[0], e[1]), b = ek(e[1], e[0]);
        if (!st.edges[a] && !st.edges[b]) st.edges[a] = "dim";
      });
      st.note = (st.note || "") + " Kanter med vekt 10 er tegnet svakt og uten tall (bortsett fra kantene ut fra " + s + ").";
    });
    var last = steps[steps.length - 1];
    if (last && last.table) last.svar = last.table.head.slice(1).map(function (v, k) { return v + " " + last.table.rows[0][k + 1]; }).join(", ");
    return steps;
  });

  /* ---------- H2022-8: søppeltømming (merk alt som kan nås fra R) ---------- */
  reg(IN.algos, "garbageCollect", {
    title: "Søppeltømming: frigjør det som ikke kan nås fra R",
    name: "GarbageCollect", params: "G, R",
    input: "En objektgraf G = (V, E) og en mengde R med objekter",
    output: "Frigjør alle objekter det ikke finnes en referanse til",
    lines: [
      L("visited ← empty set", 1, "En liste over objekter som noen fortsatt kan nå. Den er tom i starten.", "Én felles mengde for alle søkene.",
        "Felles visited gjør at hvert objekt besøkes høyst én gang, uansett hvor mange røtter som når det."),
      L("for r ∈ R do", 1, "Vi starter fra hvert objekt som programmet bruker direkte.", "Gå gjennom røttene i R.", "|R| ≤ |V| runder."),
      L("if r ∉ visited then", 2, "Har vi alt nådd r fra en annen rot? Da er det ingen vits å starte der igjen.", "Start bare fra røtter vi ikke har nådd.", ""),
      L("DFSVisit(G, r, visited)", 3, "Vi følger alle pilene ut fra r, så langt de går, og setter kryss ved alt vi når.",
        "Dybde-først søk fra r. Etterpå er alt som kan nås fra r, med i visited.",
        "Kursets DFSVisit legger alle noder som kan nås fra r, i visited. Kallene deler visited, så til sammen er det O(|V| + |E|)."),
      L("for v ∈ V do", 1, "Nå går vi gjennom alle objektene.", "Gå gjennom alle objektene.", "O(|V|)."),
      L("if v ∉ visited then", 2, "Fikk ikke v et kryss? Da kan ingen nå det.", "Ikke nådd fra noen rot ⇒ søppel.",
        "Det finnes ingen sti fra noen r ∈ R til v, så programmet kan aldri bruke v igjen."),
      L("Free(v)", 3, "Kast det.", "Frigjør v.", "Også objekter som peker på hverandre i ring, blir frigjort, så lenge ingen rot når dem.")
    ],
    bigO: { best: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Vi går gjennom hver pil og hvert objekt én gang.", "Søkene deler visited, så hver node og kant behandles høyst én gang. Så én runde over V.",
             "O(|V| + |E|) for søkene og O(|V|) for løkka til slutt. Sensorveiledningen trekker 2 poeng for løsninger som er tregere enn O(|V| + |E|).") }
  });
  reg(IN.gen, "grGC", function (inp) {
    var g = inp[0], R = inp[1], V = ids(g), A = adj(g), steps = [], vis = {}, freed = [], kept = [], cur = null, hot = null, R0 = null;
    function snap(line, text, tag) {
      var nodes = {}, edges = {};
      keys(vis).forEach(function (v) { nodes[v] = "done"; });
      R.forEach(function (r) { if (!vis[r]) nodes[r] = "src"; });
      freed.forEach(function (v) { nodes[v] = "warn"; });
      if (cur) nodes[cur] = "cur";
      g.edges.forEach(function (e) { if (vis[e[0]]) edges[ek(e[0], e[1])] = "tree"; });
      if (hot) edges[hot] = "hot";
      var st = { line: line, g: g, nodes: nodes, edges: edges, text: text, tag: tag,
        panel: [{ label: "R:", items: R.slice() }, { label: "visited:", items: V.filter(function (v) { return vis[v]; }) }, { label: "Frigjort:", items: freed.slice() }],
        vars: line == null ? [] : [nv("r", R0), nv("v", line >= 7 ? cur : null)], frame: "GarbageCollect" };
      steps.push(st);
      return st;
    }
    snap(2, t("Ingen objekter har kryss ennå. Røttene i R er de programmet bruker direkte.", "visited er tom. R = {" + R.join(", ") + "}.", "visited ← ∅. Pilene ut fra et objekt følges i alfabetisk rekkefølge."), "Start");
    R.forEach(function (r) {
      R0 = r; cur = r;
      if (vis[r]) { snap(4, t(r + " har alt et kryss. Vi trenger ikke starte der.", r + " ∈ visited: hopp over.", r + " ble nådd fra en tidligere rot."), "Hopp over " + r); return; }
      var before = V.filter(function (v) { return vis[v]; }).length;
      (function d(u) { vis[u] = 1; A[u].forEach(function (nb) { if (!vis[nb.v]) d(nb.v); }); })(r);
      var got = V.filter(function (v) { return vis[v]; }).length - before;
      snap(5, t("Fra " + r + " følger vi pilene og når " + got + " objekt" + (got === 1 ? "" : "er") + ". Alle får kryss.",
        "DFSVisit(G, " + r + ", visited): " + got + " nye noder i visited.", "visited = {" + V.filter(function (v) { return vis[v]; }).join(", ") + "}."), "DFS fra " + r);
    });
    R0 = null;
    V.forEach(function (v) {
      cur = v;
      if (vis[v]) { kept.push(v); return; }
      freed.push(v);
      snap(8, t(v + " har ikke kryss. Ingen kan nå det, så det kastes.", v + " ∉ visited: Free(" + v + ").", "Ingen sti fra R til " + v + "."), "Free(" + v + ")");
    });
    cur = null;
    var last = snap(null, t("Ferdig. " + (freed.length ? freed.join(", ") + " er kastet." : "Ingenting ble kastet."),
      "Frigjort: " + (freed.join(", ") || "ingen") + ". Beholdt: " + kept.join(", ") + ".",
      "Frigjort: {" + freed.join(", ") + "}. Merk at objekter som peker på hverandre i ring, også ble frigjort når ingen rot når dem."), "Ferdig");
    last.svar = freed.join(", ");
    return linkVars(steps);
  });

  /* ---------- H2021-11: tofarging med DFS (stakk) ---------- */
  reg(IN.algos, "twoColor", {
    title: "Fargelegg med to farger (eller si fra at det ikke går)",
    name: "TwoColor", params: "G",
    input: "En sammenhengende graf G = (V, E)",
    output: "En graf der nodene er fargelagt hvis det er mulig",
    lines: [
      L("s ← an arbitrary node in V", 1, "Vi begynner hos en hvilken som helst node.", "Velg en startnode.", "Grafen er sammenhengende, så ett søk når alle nodene."),
      L("s.color ← R", 1, "Den første får rød farge.", "Startnoden blir rød.", "Valget er fritt: bytter vi alle fargene, er det fortsatt en gyldig farging."),
      L("stack ← stack containing only s", 1, "s legges i en bunke med noder vi skal se på naboene til.", "Stakken holder fargede noder vi ikke har sjekket naboene til.", ""),
      L("while stack is not empty do", 1, "Så lenge noen ligger i bunken …", "Gjenta til stakken er tom.", "Hver node pushes én gang (når den får farge), så høyst |V| runder."),
      L("u ← stack.pop()", 2, "Ta den øverste.", "Ta ut en farget node.", ""),
      L("for (u, v) ∈ E do", 2, "Se på alle naboene til u.", "Gå gjennom naboene.", "Til sammen O(|E|)."),
      L("if v.color = null then", 3, "Har naboen ingen farge ennå?", "v er ikke besøkt.", "v.color = null fungerer som «ikke besøkt»."),
      L("v.color ← FlipColor(u.color)", 4, "Da får den motsatt farge av u.", "Naboer må ha ulik farge.", "Fargen er bestemt av u, så vi har ikke noe valg her."),
      L("stack.push(v)", 4, "Og så skal vi sjekke naboene til v senere.", "Legg v på stakken.", ""),
      L("else if v.color = u.color then", 3, "Har naboen samme farge som u? Da har vi et problem.", "To naboer med samme farge.",
        "Begge fargene var tvunget fram av søket. Da finnes det en sykel med et odde antall noder, og den kan ikke fargelegges med to farger."),
      L("print(\"ikke mulig\") and return", 4, "Det går ikke. Vi sier fra og stopper.", "Skriv ut at det ikke er mulig.", ""),
      L("return G", 1, "Alle har farge, og ingen naboer er like.", "G er fargelagt.", "")
    ],
    bigO: { best: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Vi ser på hver node og hver kant høyst et par ganger.", "Vanlig DFS med en stakk: hver node én gang, hver kant fra begge ender.", "O(|V| + |E|), som et vanlig dybde-først søk.") }
  });
  reg(IN.gen, "grTwoColor", function (inp) {
    var g = inp[0], V = ids(g), A = adj(g), steps = [], col = {}, stack = [], cur = null, hot = null, bad = null, U = null;
    function snap(line, text, tag) {
      var nodes = {}, edges = {}, lab = {}, comp = {};
      keys(col).forEach(function (v) { lab[v] = col[v]; comp[v] = col[v] === "R" ? 1 : 0; });
      stack.forEach(function (v) { nodes[v] = "queued"; });
      if (cur) nodes[cur] = "cur";
      if (hot) edges[hot] = "hot";
      if (bad) { nodes[bad[0]] = "warn"; nodes[bad[1]] = "warn"; edges[ek(bad[0], bad[1])] = "back"; }
      var st = { line: line, g: g, nodes: nodes, edges: edges, lab: lab, comp: comp, text: text, tag: tag,
        panel: [{ label: "Stakk (bunn → topp):", items: stack.slice(), kind: "stack" }, { label: "Farger:", items: V.filter(function (v) { return col[v]; }).map(function (v) { return v + ": " + col[v]; }) }],
        vars: line == null ? [] : [nv("u", U), nv("v", hot ? tgt(hot) : null)], frame: "TwoColor",
        note: "Bokstaven over en node er fargen: R (rød) eller B (blå)." };
      steps.push(st);
      return st;
    }
    var s = V[0]; col[s] = "R"; stack.push(s); cur = s;
    snap(4, t(s + " blir rød og legges i bunken. Naboene ser vi alltid på i alfabetisk rekkefølge.", s + ".color ← R, stack = [" + s + "].", "Start i " + s + ". Naboene gås gjennom i alfabetisk rekkefølge."), "Start");
    while (stack.length) {
      var u = stack.pop(); U = u; cur = u; hot = null;
      snap(6, t("Nå ser vi på naboene til " + u + " (" + col[u] + ").", "Pop " + u + ", som har farge " + col[u] + ".", "u ← " + u + "."), "Pop " + u);
      for (var i = 0; i < A[u].length; i++) {
        var v = A[u][i].v; hot = ek(u, v);
        if (!col[v]) {
          col[v] = col[u] === "R" ? "B" : "R"; stack.push(v);
          snap(10, t(v + " hadde ingen farge. Den får " + (col[v] === "R" ? "rød" : "blå") + ", motsatt av " + u + ".", v + ".color ← FlipColor(" + col[u] + ") = " + col[v] + ", push " + v + ".", v + " får farge " + col[v] + " og pushes."), v + " = " + col[v]);
        } else if (col[v] === col[u]) {
          bad = [u, v]; cur = null;
          var last = snap(12, t(u + " og " + v + " er naboer og har begge farge " + col[u] + ". Det går ikke!", v + ".color = " + u + ".color = " + col[u] + ": ikke mulig.",
            "Kanten {" + u + ", " + v + "} har like farger, og begge var tvunget fram. Grafen har en sykel med odde lengde."), "Ikke mulig");
          last.svar = "ikke mulig";
          return linkVars(steps);
        }
      }
      hot = null;
    }
    cur = null; U = null;
    var fin = snap(13, t("Alle har fått farge, og ingen naboer har samme farge.", "Ferdig: " + V.map(function (v) { return v + " " + col[v]; }).join(", ") + ".",
      "Gyldig tofarging. Alle kanter går mellom en rød og en blå node."), "Ferdig");
    fin.svar = V.map(function (v) { return v + " " + col[v]; }).join(", ");
    return linkVars(steps);
  });

  /* ---------- H2021-13: logger i topologisk orden, minst tidsstempel først ---------- */
  reg(IN.algos, "logSort", {
    title: "Topologisk sortering med prioritetskø på tidsstempel",
    name: "PrintLog", params: "G",
    input: "En rettet graf G = (V, E)",
    output: "Skriver ut nodene i V slik at kantene respekteres og tidsstemplene kommer så tidlig som mulig",
    lines: [
      L("H ← empty priority queue ordered by v.ts", 1, "En kø der den med lavest tidsstempel kommer først.", "En min-heap ordnet på tidsstempel.",
        "Det er den eneste endringen fra kursets topologiske sortering: en heap i stedet for en stakk."),
      L("for v ∈ V do", 1, "Vi går gjennom alle hendelsene.", "Tell inngrader.", "O(|V| + |E|)."),
      L("inDeg[v] ← indegree(v)", 2, "Hvor mange hendelser må komme før v?", "Antall kanter inn til v.", ""),
      L("if inDeg[v] = 0 then Insert(H, v)", 2, "Ingen må komme før v? Da er v klar.", "Noder uten forgjengere legges i heapen.", "O(log |V|) per innsetting."),
      L("while H is not empty do", 1, "Så lenge noen er klare …", "Gjenta til heapen er tom.", "Hver node settes inn og tas ut nøyaktig én gang (G er en DAG)."),
      L("u ← RemoveMin(H)", 2, "Av alle som er klare, tar vi den med lavest tidsstempel.",
        "Ta ut den klare noden med minst ts.",
        "Alle noder i H har alle forgjengerne sine skrevet ut. Å ta minst ts blant dem er det grådige valget som oppfyller krav nummer to uten å bryte krav nummer én."),
      L("print(u)", 2, "Skriv den ut.", "Skriv ut u.", ""),
      L("for (u, v) ∈ E do", 2, "Se på hendelsene som ventet på u.", "Kantene ut fra u.", "Til sammen O(|E|)."),
      L("inDeg[v] ← inDeg[v] − 1", 3, "v har én mindre å vente på.", "Tell ned inngraden.", ""),
      L("if inDeg[v] = 0 then Insert(H, v)", 3, "Venter v ikke på noen lenger? Da er den klar.", "v blir klar.", "O(log |V|).")
    ],
    bigO: { best: "O((|V| + |E|) · log(|V|))", worst: "O((|V| + |E|) · log(|V|))", space: "O(|V|)",
      why: t("Som vanlig topologisk sortering, men køen må holdes sortert. Det koster litt hver gang.",
             "|V| innsettinger og |V| uttak à O(log |V|), pluss O(|V| + |E|) for kantene.",
             "O(|V| · log(|V|) + |E|), som ligger innenfor O((|V| + |E|) · log(|V|)). Det er kravet for full uttelling i sensorveiledningen.") }
  });
  reg(IN.gen, "grLogSort", function (inp) {
    var g = inp[0], V = ids(g), A = adj(g), steps = [], deg = indeg(g), H = [], out = [], cur = null, hot = null, U = null, done = {};
    var ts = {}; g.nodes.forEach(function (n) { ts[n.id] = n.ts != null ? n.ts : parseInt(String(n.id).replace(/\D/g, ""), 10); });
    function name(v) { return v + " (ts " + ts[v] + ")"; }
    function snap(line, text, tag) {
      var nodes = {}, edges = {};
      out.forEach(function (v) { nodes[v] = "done"; });
      H.forEach(function (v) { nodes[v] = "queued"; });
      if (cur) nodes[cur] = "cur";
      g.edges.forEach(function (e) { if (done[e[0]]) edges[ek(e[0], e[1])] = "dim"; });
      if (hot) edges[hot] = "hot";
      var st = { line: line, g: g, nodes: nodes, edges: edges, text: text, tag: tag,
        panel: [{ label: "H (minst ts først):", items: H.slice().sort(function (a, b) { return ts[a] - ts[b]; }).map(name), kind: "queue" }, { label: "Utskrift:", items: out.slice() }],
        vars: line == null ? [] : [nv("u", U)], frame: "PrintLog" };
      steps.push(st);
      return st;
    }
    V.forEach(function (v) { if (deg[v] === 0) H.push(v); });
    snap(5, t("Vi teller hvor mange hendelser som må skje før hver hendelse. " + H.map(name).join(", ") + " venter ikke på noen.",
      "Inngrader telt. Noder med inngrad 0 i H: " + H.join(", ") + ".", "H = {" + H.map(name).join(", ") + "}."), "Start");
    while (H.length) {
      H.sort(function (a, b) { return ts[a] - ts[b]; });
      var u = H.shift(); U = u; cur = u; hot = null;
      out.push(u); done[u] = 1;
      snap(8, t(u + " har lavest tidsstempel av de klare. Den skrives ut.", "RemoveMin gir " + name(u) + ". print(" + u + ").", "Utskrift så langt: " + out.join(", ") + "."), "Skriv " + u);
      A[u].forEach(function (nb) {
        var v = nb.v; hot = ek(u, v); deg[v]--;
        if (deg[v] === 0) { H.push(v); snap(11, t(v + " venter ikke på noen lenger. Den er klar.", "inDeg[" + v + "] = 0: Insert(H, " + v + ").", name(v) + " settes inn i heapen."), "Klar: " + v); }
        else snap(10, t(v + " venter fortsatt på " + deg[v] + ".", "inDeg[" + v + "] = " + deg[v] + ".", "Tell ned inngraden til " + v + "."), "Tell ned " + v);
      });
      hot = null;
    }
    cur = null; U = null;
    var last = snap(null, t("Alle hendelsene er skrevet ut: " + out.join(", ") + ".", "Utskrift: " + out.join(", ") + ".", "Alle kanter er respektert, og blant de klare er minst ts alltid tatt først."), "Ferdig");
    last.svar = out.join(", ");
    return linkVars(steps);
  });

  /* ---------- H2021-12: går oppgjøret opp? (komponenter som summerer til 0) ---------- */
  reg(IN.algos, "canSettle", {
    title: "Går oppgjøret opp? (summen i hver komponent er 0)",
    name: "Settleable", params: "G, T",
    input: "En graf G = (V, E) og en tabell av heltall T",
    output: "true hvis oppgjøret går opp, false ellers",
    lines: [
      L("visited ← empty set", 1, "Ingen er besøkt ennå.", "Felles mengde for alle søkene.", ""),
      L("for v ∈ V do", 1, "Vi går gjennom alle personene.", "Prøv hver node som start.", ""),
      L("if v ∉ visited then", 2, "Er v med i en gruppe vi alt har sjekket? Da hopper vi over.", "Ny komponent bare fra ubesøkte noder.", "Hver ny start her er en ny sammenhengende komponent."),
      L("C ← empty set", 3, "Vi lager en ny gruppe.", "C skal bli komponenten til v.", ""),
      L("DFSVisit(G, v, C)", 3, "Vi finner alle som henger sammen med v.", "Dybde-først søk fra v. Etterpå er C komponenten til v.", "Kursets DFSVisit legger alt som kan nås fra v, i mengden C."),
      L("add every u ∈ C to visited", 3, "Alle i gruppa er nå sjekket.", "Merk hele komponenten som besøkt.", "Hver node havner i nøyaktig én komponent, så til sammen O(|V|)."),
      L("if Σ_{u ∈ C} T[u] ≠ 0 then", 3, "Går ikke pengene i gruppa opp i null?", "Summer T over komponenten.",
        "Penger kan bare flyttes langs kanter, altså innenfor en komponent. Summen i en komponent endrer seg derfor aldri.",
        { q: "Hvorfor holder det å se på summen?",
          a: t("Innenfor en gruppe kan alle betale videre til hverandre, så det eneste som betyr noe, er om det går opp til slutt.",
               "I en sammenhengende komponent kan penger sendes langs stier til alle. Er summen 0, kan alle gjøres opp. Er den ikke 0, går det aldri, fordi penger aldri forlater komponenten.",
               "Summen per komponent er invariant under overføringer langs kanter. Summen 0 er nødvendig, og fordi komponenten er sammenhengende, er den også tilstrekkelig.") }),
      L("return false", 4, "Da går det ikke.", "Oppgjøret går ikke opp.", ""),
      L("return true", 1, "Alle gruppene gikk opp i null.", "Alle komponenter summerer til 0.", "")
    ],
    bigO: { best: "O(|V| + |E|)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Vi besøker hver person og hvert vennskap én gang.", "Ett DFS per komponent, til sammen hele grafen én gang.", "Som DFSFull: O(|V| + |E|), pluss O(|V|) for summene.") }
  });
  reg(IN.gen, "grSettle", function (inp) {
    var g = inp[0], T = inp[1], V = ids(g), A = adj(g), steps = [], vis = {}, comps = [], cmap = {}, cur = null, res = null, V0 = null, sum = null;
    function snap(line, text, tag, warn) {
      var nodes = {}, lab = {}, cm = {};
      V.forEach(function (v) { lab[v] = String(T[v]); });
      keys(cmap).forEach(function (v) { cm[v] = cmap[v]; });
      if (cur) nodes[cur] = "cur";
      (warn || []).forEach(function (v) { nodes[v] = "warn"; });
      var st = { line: line, g: g, nodes: nodes, comp: cm, lab: lab, text: text, tag: tag,
        panel: [{ label: "Komponenter:", items: comps.map(function (c) { return "{" + c.join(", ") + "}"; }) }].concat(res ? [{ label: "Svar:", items: [res] }] : []),
        vars: line == null ? [] : [nv("v", V0), sv("Σ", sum)], frame: "Settleable",
        note: "Tallet over en node er T[v]. Samme farge = samme komponent." };
      steps.push(st);
      return st;
    }
    snap(2, t("Vi skal finne gruppene av personer som henger sammen, og sjekke om pengene i hver gruppe går opp i null.", "visited ← ∅.", "T: " + V.map(function (v) { return v + " = " + T[v]; }).join(", ") + "."), "Start");
    for (var i = 0; i < V.length; i++) {
      var v = V[i];
      if (vis[v]) continue;
      var C = [];
      (function d(u) { vis[u] = 1; C.push(u); A[u].forEach(function (nb) { if (!vis[nb.v]) d(nb.v); }); })(v);
      C.sort(); C.forEach(function (u) { cmap[u] = comps.length; }); comps.push(C);
      V0 = v; cur = v; sum = null;
      snap(6, t("Fra " + v + " når vi " + C.join(", ") + ". Det er én gruppe.", "DFSVisit fra " + v + " gir C = {" + C.join(", ") + "}.", "Komponent nr. " + comps.length + ": {" + C.join(", ") + "}."), "Komponent");
      sum = C.reduce(function (a, u) { return a + T[u]; }, 0); cur = null;
      var expr = C.map(function (u) { return String(T[u]); }).join(" + ").replace(/\+ -/g, "− ");
      if (sum !== 0) {
        res = "false";
        var last = snap(9, t("Pengene i gruppa blir " + sum + ", ikke 0. Oppgjøret går ikke opp.", "Σ = " + expr + " = " + sum + " ≠ 0: return false.", "Summen i komponenten er " + sum + ", og den kan ikke endres av overføringer."), "false", C);
        last.svar = "false";
        return linkVars(steps);
      }
      snap(8, t("Pengene i gruppa går opp: " + expr + " = 0.", "Σ = " + expr + " = 0. Neste komponent.", "Komponenten summerer til 0."), "Σ = 0");
    }
    res = "true"; V0 = null; sum = null;
    var fin = snap(10, t("Alle gruppene går opp i null. Oppgjøret går opp!", "Alle " + comps.length + " komponenter summerer til 0: return true.", "Alle komponenter har sum 0."), "true");
    fin.svar = "true";
    return linkVars(steps);
  });

  /* ---------- H2023-7 (b): diamantavhengighet (søk fra hver node med inngrad 0) ---------- */
  reg(IN.algos, "isDiamond", {
    title: "Finnes det en diamantavhengighet?",
    name: "IsDiamond", params: "G",
    input: "En rettet asyklisk graf G = (V, E)",
    output: "true hvis G har en diamantavhengighet, false ellers",
    lines: [
      L("for s ∈ V do", 1, "Vi ser på alle bibliotekene.", "Finn startnodene.", ""),
      L("if indegree(s) = 0 then", 2, "Vi starter bare fra biblioteker som ingen andre bruker.", "Søk bare fra noder med inngrad 0.",
        "Enhver node kan nås fra en node med inngrad 0, fordi G er asyklisk. Da holder det å søke derfra."),
      L("visited ← empty set", 3, "Ny liste med kryss for hvert søk.", "Nytt visited for hvert søk.", "Søk fra ulike startnoder kan godt nå samme node uten at det er en diamant."),
      L("stack ← stack containing only s", 3, "Vi begynner i s.", "Stakken starter med s.", ""),
      L("while stack is not empty do", 3, "Så lenge det ligger noe i bunken …", "Gjenta til stakken er tom.", ""),
      L("u ← stack.pop()", 4, "Ta den øverste.", "Ta ut en node.", ""),
      L("if u ∈ visited then return true", 4, "Har vi vært her før i dette søket? Da fant vi to veier hit!",
        "u er nådd på to måter fra s: diamant.",
        "u ble pushet to ganger, fra to ulike forgjengere. To stier fra s til u skiller lag et sted og møtes igjen i u (eller før). Der de skilles og møtes første gang, har vi to distinkte stier.",
        { q: "Hvorfor sjekker vi visited når vi tar ut, og ikke når vi legger inn?",
          a: t("Vi vil merke det når vi kommer til samme sted for andre gang. Da må vi la begge veiene legge noden i bunken.",
               "Her pusher vi alle naboer, også besøkte. Kommer en node ut av stakken for andre gang, har den blitt pushet fra to steder, altså to veier.",
               "Testen ved uttak oppdager at u ble pushet minst to ganger. Siden G er asyklisk, betyr det to ulike stier fra s til u, ikke en sykel.") }),
      L("add u to visited", 4, "Sett kryss ved u.", "Merk u.", ""),
      L("for (u, v) ∈ E do", 4, "Se på alle bibliotekene u bruker.", "Kantene ut fra u.", ""),
      L("stack.push(v)", 5, "Legg dem i bunken, også om vi har sett dem før.", "Push alle naboene.", "Ingen sjekk her; det er det som gjør at et nytt besøk blir oppdaget."),
      L("return false", 1, "Ingen søk kom til samme sted to ganger.", "Ingen diamant.", "")
    ],
    bigO: { best: "O(|V|)", worst: "O(|V| · (|V| + |E|))", space: "O(|V| + |E|)",
      why: t("Vi gjør ett søk for hver startnode. Er det få startnoder, går det fort.",
             "Ett søk per node med inngrad 0. Hvert søk stopper så fort en node kommer for andre gang, så det er O(|V| + |E|) per søk.",
             "O(|VS| · (|V| + |E|)), der VS er nodene med inngrad 0. I verste fall O(|V| · (|V| + |E|)), men ofte langt bedre.") }
  });
  reg(IN.gen, "grDiamond", function (inp) {
    var g = inp[0], V = ids(g), A = adj(g), d = indeg(g), steps = [], vis = {}, stack = [], cur = null, S0 = null, U = null, roots = [], hit = null;
    function snap(line, text, tag) {
      var nodes = {}, edges = {};
      keys(vis).forEach(function (v) { nodes[v] = "done"; });
      stack.forEach(function (v) { if (!vis[v]) nodes[v] = "queued"; });
      if (S0) nodes[S0] = nodes[S0] === "done" ? "done" : "src";
      if (cur) nodes[cur] = "cur";
      if (hit) nodes[hit] = "warn";
      var st = { line: line, g: g, nodes: nodes, edges: edges, text: text, tag: tag,
        panel: [{ label: "Stakk (bunn → topp):", items: stack.slice(), kind: "stack" }, { label: "visited:", items: V.filter(function (v) { return vis[v]; }) }],
        vars: line == null ? [] : [nv("s", S0), nv("u", U)], frame: "IsDiamond" };
      steps.push(st);
      return st;
    }
    for (var i = 0; i < V.length; i++) {
      var s = V[i];
      if (d[s] !== 0) continue;
      roots.push(s); S0 = s; vis = {}; stack = [s]; cur = s; U = null;
      snap(5, t(s + " brukes ikke av noen. Vi starter et søk der. Naboene legges i bunken i alfabetisk rekkefølge.", "indegree(" + s + ") = 0: nytt søk med tomt visited.", "Søk fra " + s + "."), "Start i " + s);
      while (stack.length) {
        var u = stack.pop(); U = u; cur = u;
        if (vis[u]) {
          hit = u; cur = null;
          var last = snap(8, t("Vi kom til " + u + " for andre gang! Det finnes to veier fra " + s + " til " + u + ".", u + " ∈ visited: return true.", u + " ble pushet fra to ulike forgjengere: to distinkte stier."), "Diamant!");
          last.svar = "true";
          return linkVars(steps);
        }
        vis[u] = 1;
        A[u].forEach(function (nb) { stack.push(nb.v); });
        snap(11, t(u + " får kryss. " + (A[u].length ? "Vi legger " + A[u].map(function (nb) { return nb.v; }).join(" og ") + " i bunken." : "Det bruker ingen andre."),
          "Pop " + u + ", merk den, push naboene" + (A[u].length ? ": " + A[u].map(function (nb) { return nb.v; }).join(", ") : " (ingen)") + ".", "visited = {" + V.filter(function (v) { return vis[v]; }).join(", ") + "}."), "Besøk " + u);
      }
    }
    cur = null; U = null;
    var fin = snap(12, t("Ingen søk kom til samme sted to ganger. Ingen diamant.", "return false.", "Søkte fra " + roots.join(", ") + " uten å finne en node to ganger."), "false");
    fin.svar = "false";
    return linkVars(steps);
  });

  /* ---------- H2024-4 (b): jazz eller klassisk innen k ledd (BFS) ---------- */
  reg(IN.algos, "jazzOrClassical", {
    title: "Jazz eller klassisk? (BFS til dybde k)",
    name: "JazzOrClassical", params: "G, M, s, k",
    input: "En graf G = (V, E), en ordbok M, en startnode s ∈ V og et heltall k",
    output: "En streng \"jazz\" eller \"klassisk\"",
    lines: [
      L("dist ← empty map", 1, "Her skriver vi hvor mange venneledd unna hver person er.", "dist[v] = antall ledd fra s.", "dist fungerer også som visited."),
      L("dist[s] ← 0", 1, "Du selv er 0 ledd unna.", "s har avstand 0.", ""),
      L("queue ← queue containing only s", 1, "Du står først i køen.", "En vanlig FIFO-kø.", "Køen gir oss nodene lag for lag: først alle på avstand 1, så alle på avstand 2 osv."),
      L("jazz, klassisk ← 0, 0", 1, "To tellere som starter på null.", "Tell opp sjangrene.", ""),
      L("while queue is not empty do", 1, "Så lenge noen står i køen …", "Gjenta til køen er tom.", ""),
      L("u ← queue.dequeue()", 2, "Den som har stått lengst, får tur.", "Ta ut neste node.", ""),
      L("if u ≠ s and \"jazz\" ∈ M[u] then jazz ← jazz + 1", 2, "Liker u jazz? Tell en til.", "Tell jazz.", "Vi teller vennene, ikke deg selv. Sensorveiledningens kode teller også s; begge tolkninger virker rimelige."),
      L("if u ≠ s and \"klassisk\" ∈ M[u] then klassisk ← klassisk + 1", 2, "Liker u klassisk? Tell en til.", "Tell klassisk.", "En person kan like begge."),
      L("if dist[u] < k then", 2, "Er u nærmere enn k ledd? Da kan vi gå videre til vennene til u.", "Gå bare videre fra noder på avstand mindre enn k.",
        "Noder på avstand k telles, men vi går ikke videre fra dem.",
        { q: "Hvorfor < k og ikke ≤ k?",
          a: t("De som er k ledd unna, skal være med. Men vennene deres er k + 1 ledd unna, og dem vil vi ikke ha.",
               "En nabo til u får avstand dist[u] + 1. Den skal være ≤ k, altså må dist[u] < k.",
               "Med ≤ k ville BFS lagt noder på avstand k + 1 i køen, og de ville blitt telt.") }),
      L("for (u, v) ∈ E do", 3, "Se på alle vennene til u.", "Naboene til u.", ""),
      L("if v ∉ dist then", 4, "Har vi ikke sett v før?", "Bare nye noder.", "BFS finner den korteste avstanden første gang den ser v. Derfor er det trygt å merke v her."),
      L("dist[v] ← dist[u] + 1", 5, "v er ett ledd lenger unna enn u.", "Avstanden til v.", ""),
      L("queue.enqueue(v)", 5, "v stiller seg bakerst i køen.", "Legg v i køen.", ""),
      L("if jazz > klassisk then return \"jazz\"", 1, "Flest liker jazz?", "Sammenlign tellerne.", "Oppgaven lover at de ikke er like."),
      L("return \"klassisk\"", 1, "Ellers klassisk.", "Klassisk vant.", "")
    ],
    bigO: { best: "O(1)", worst: "O(|V| + |E|)", space: "O(|V|)",
      why: t("Vi ser bare på folk innen k ledd, og hver av dem én gang.", "En BFS som stopper ved dybde k. I verste fall hele grafen.", "O(|V| + |E|) i verste fall, men bare den delen av grafen som ligger innen k ledd, blir sett på.") }
  });
  reg(IN.gen, "grJazz", function (inp) {
    var g = inp[0], M = inp[1], s = inp[2], k = inp[3], V = ids(g), A = adj(g), steps = [], dist = {}, q = [s], cnt = { jazz: 0, klassisk: 0 }, counted = {}, cur = null, hot = null, U = null;
    dist[s] = 0;
    function short(v) { var m = M[v] || []; var a = []; if (m.indexOf("jazz") >= 0) a.push("J"); if (m.indexOf("klassisk") >= 0) a.push("K"); return a.join("+") || "–"; }
    function snap(line, text, tag) {
      var nodes = {}, edges = {}, lab = {};
      V.forEach(function (v) { lab[v] = (dist[v] != null ? dist[v] + " · " : "") + short(v); });
      keys(counted).forEach(function (v) { nodes[v] = "done"; });
      q.forEach(function (v) { nodes[v] = "queued"; });
      nodes[s] = nodes[s] === "queued" ? "queued" : "src";
      V.forEach(function (v) { if (dist[v] == null && !nodes[v]) nodes[v] = "dim"; });
      if (cur) nodes[cur] = "cur";
      if (hot) edges[hot] = "hot";
      var st = { line: line, g: g, nodes: nodes, edges: edges, lab: lab, text: text, tag: tag,
        panel: [{ label: "Kø:", items: q.slice(), kind: "queue" }, { label: "jazz / klassisk:", items: [cnt.jazz + " / " + cnt.klassisk] }],
        vars: line == null ? [] : [nv("u", U), sv("k", k)], frame: "JazzOrClassical",
        note: "Over en node: avstand fra " + s + " · J = liker jazz, K = liker klassisk." };
      steps.push(st);
      return st;
    }
    snap(5, t("Vi starter hos deg (" + s + "), og k = " + k + ". Vennene ser vi på i alfabetisk rekkefølge.", "dist[" + s + "] = 0, kø = [" + s + "], k = " + k + ".", "BFS fra " + s + " som stopper ved dybde " + k + "."), "Start");
    while (q.length) {
      var u = q.shift(); U = u; cur = u; hot = null;
      if (u !== s) {
        var m = M[u] || [];
        if (m.indexOf("jazz") >= 0) cnt.jazz++;
        if (m.indexOf("klassisk") >= 0) cnt.klassisk++;
        counted[u] = 1;
        snap(9, t(u + " er " + dist[u] + " ledd unna og liker " + (m.join(", ") || "ingenting") + ".", u + " (avstand " + dist[u] + "): jazz = " + cnt.jazz + ", klassisk = " + cnt.klassisk + ".", "M[" + u + "] = {" + m.join(", ") + "}."), "Tell " + u);
      }
      if (dist[u] < k) {
        A[u].forEach(function (nb) {
          var v = nb.v;
          if (dist[v] == null) { dist[v] = dist[u] + 1; q.push(v); hot = ek(u, v); snap(14, t(v + " er en ny venn, " + dist[v] + " ledd unna.", "dist[" + v + "] = " + dist[v] + ", legg " + v + " i køen.", "enqueue(" + v + ")."), "Ny: " + v); }
        });
        hot = null;
      } else {
        snap(10, t(u + " er " + k + " ledd unna. Vennene til " + u + " er for langt unna.", "dist[" + u + "] = " + k + ", ikke < k: vi går ikke videre fra " + u + ".", "Dybdegrensen stopper søket her."), "Stopp ved " + u);
      }
    }
    cur = null; U = null;
    var ans = cnt.jazz > cnt.klassisk ? "jazz" : "klassisk";
    var last = snap(cnt.jazz > cnt.klassisk ? 15 : 16, t("Innen " + k + " ledd liker " + cnt.jazz + " jazz og " + cnt.klassisk + " klassisk. Det blir " + ans + "!",
      "jazz = " + cnt.jazz + ", klassisk = " + cnt.klassisk + ": return \"" + ans + "\".", "Svar: \"" + ans + "\"."), ans);
    last.svar = ans;
    return linkVars(steps);
  });
})();
