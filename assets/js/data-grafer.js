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
    var vis = [], inV = {}, Q = [], done = {}, dist = {}, tree = {}, cur = null, hot = null;
    function snap(line, text, tag) {
      var nodes = {}, edges = {}, lab = {};
      vis.forEach(function (v) { nodes[v] = done[v] ? "done" : "seen"; });
      Q.forEach(function (v) { nodes[v] = "queued"; });
      if (cur) nodes[cur] = "cur";
      keys(tree).forEach(function (k) { edges[k] = "tree"; });
      if (hot) edges[hot] = "hot";
      keys(dist).forEach(function (v) { lab[v] = dist[v]; });
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, lab: lab, text: text, tag: tag,
        panel: [{ label: "Kø (front → bak):", items: Q.slice(), kind: "queue" }, { label: "visited:", items: vis.slice() }],
        note: "Tallet over en node er antall kanter fra " + s + ". BFS finner dem lag for lag." });
    }
    snap(1, t("Vi starter i " + s + ".", "BFSVisit kalles med s = " + s + ".", "Kall BFSVisit(G, " + s + ", visited) med tom visited."), "Start");
    vis.push(s); inV[s] = 1; dist[s] = 0;
    snap(2, t(s + " får et kryss.", s + " merkes som besøkt.", "visited = {" + s + "}."), "Merk " + s);
    Q.push(s);
    snap(3, t(s + " stiller seg i køen.", "Køen inneholder bare " + s + ".", "queue = [" + s + "]."), "Kø");
    while (Q.length) {
      var u = Q.shift(); cur = u; hot = null;
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
      snap(4, t("Ferdig med naboene til " + u + ". Er det flere i køen?", "Alle naboene til " + u + " er sett på. Sjekk om køen er tom.",
        u + " er ferdig behandlet. Løkkevilkåret sjekkes på nytt."), Q.length ? "Neste" : "Køen er tom");
    }
    snap(null, t("Køen er tom. Alle som kan nås fra " + s + ", er besøkt.", "Ferdig. Blå kanter er BFS-treet: korteste stier (i antall kanter) fra " + s + ".",
      "Ferdig: visited = {" + vis.join(", ") + "}. BFS-treet gir korteste stier i en uvektet graf."), "Ferdig");
    return steps;
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
    var vis = [], inV = {}, stack = [], done = {}, tree = {}, cur = null, hot = null, order = [];
    function snap(line, text, tag) {
      var nodes = {}, edges = {};
      vis.forEach(function (v) { nodes[v] = done[v] ? "done" : "seen"; });
      if (cur) nodes[cur] = "cur";
      keys(tree).forEach(function (k) { edges[k] = "tree"; });
      if (hot) edges[hot] = "hot";
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, text: text, tag: tag,
        panel: [{ label: "Kallstakk (bunn → topp):", items: stack.slice(), kind: "stack" }, { label: "Besøksrekkefølge:", items: order.slice() }] });
    }
    function visit(u, parent) {
      stack.push(u); cur = u; hot = null;
      snap(1, t(parent ? "Vi går inn til " + u + "." : "Vi begynner i " + u + ".",
                "DFSVisit(" + u + ") starter." + (parent ? " Kalt fra " + parent + "." : ""),
                "Nytt kall: DFSVisit(G, " + u + ", visited). Kallstakken er nå " + stack.join(" → ") + "."), "Kall " + u);
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
      done[u] = 1; stack.pop(); cur = stack.length ? stack[stack.length - 1] : null; hot = null;
      snap(3, t("Ingen nye naboer hos " + u + ". Vi går tilbake" + (cur ? " til " + cur + "." : "."),
                u + " er ferdig. Kallet returnerer" + (cur ? " til " + cur + "." : "."),
                "Løkka over naboene til " + u + " er ferdig, så kallet returnerer. " + u + " er ferdig (grønn)."), "Ferdig " + u);
    }
    var Vs = [s].concat(ids(g).filter(function (x) { return x !== s; }));
    Vs.forEach(function (v, i) {
      if (inV[v]) return;
      if (i > 0) {
        cur = null; hot = null;
        steps.push({ line: null, g: g, nodes: (function () { var o = {}; vis.forEach(function (x) { o[x] = "done"; }); o[v] = "src"; return o; })(),
          edges: (function () { var o = {}; keys(tree).forEach(function (k) { o[k] = "tree"; }); return o; })(),
          panel: [{ label: "Kallstakk (bunn → topp):", items: [], kind: "stack" }, { label: "Besøksrekkefølge:", items: order.slice() }],
          text: t(v + " ble aldri nådd. Vi starter på nytt der.", "DFSFull går videre i V og finner " + v + ", som ikke er besøkt. Ny komponent!",
                  "Ytre løkke i DFSFull: " + v + " ∉ visited, så vi kaller DFSVisit(G, " + v + ", visited). Ny sammenhengende komponent."), tag: "Ny start" });
      }
      visit(v, null);
    });
    cur = null;
    snap(null, t("Alle er besøkt.", "Ferdig. Blå kanter er DFS-treet (eller -skogen).", "Besøksrekkefølge: " + order.join(", ") + ". Blå kanter danner DFS-skogen."), "Ferdig");
    return steps;
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
      "Hver kant behandles nøyaktig én gang i hele kjøringen: O(|E|)."),
    L("inDeg[v] ← inDeg[v] − 1", 3,
      "v har én mindre å vente på.",
      "Kanten (u, v) er «brukt opp»: tell ned inngraden til v.",
      "Tilsvarer å fjerne kanten fra grafen, men koster bare O(1)."),
    L("if inDeg[v] = 0 then stack.push(v)", 3,
      "Venter v ikke på noen lenger? Da er v klar.",
      "Når den siste forgjengeren er tatt, blir v klar.",
      "Skjer nøyaktig én gang for hver node som ikke ligger på eller etter en sykel."),
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
      why: t("Hver node og hver kant blir behandlet én gang.",
             "Inngradene telles én gang, hver node pushes og popes én gang, og hver kant telles ned én gang.",
             "O(|V| + |E|) for inngradene, O(|V|) for stakkoperasjonene og O(|E|) for nedtellingene.") }
  });

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
    var deg = {}, stack = [], out = [], removed = {}, cur = null, hot = null;
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
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, lab: lab, text: text, tag: tag, panel: panel,
        note: "Tallet over en node er inngraden som gjenstår." });
    }
    snap(LN.init, t("Vi teller hvor mange piler som går inn til hver node.", "Inngradene er telt opp (tallet over hver node).",
      "inDeg: " + V.map(function (v) { return v + " = " + deg[v]; }).join(", ") + "."), "Tell inngrader");
    V.forEach(function (v) { if (deg[v] === 0) stack.push(v); });
    snap(LN.push0, t(stack.length ? stack.join(" og ") + " venter ikke på noen. De er klare." : "Alle venter på noen! Ingen kan starte.",
      stack.length ? "Noder med inngrad 0 legges på stakken: " + stack.join(", ") + "." : "Ingen node har inngrad 0.",
      "Startnoder (inngrad 0): {" + stack.join(", ") + "}."), "Startnoder");
    while (stack.length) {
      var u = stack.pop(); cur = u; hot = null;
      snap(LN.pop, t(u + " er klar og får tur.", "Pop " + u + " (sist lagt på stakken).", "u ← " + u + "."), "Pop " + u);
      out.push(u); inOut[u] = 1;
      snap(LN.out, t(u + " får plass nummer " + out.length + ".", mode === "count" ? "processed = " + out.length + "." : u + " legges bakerst i output.",
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
        "|output| = " + out.length + " < |V| = " + V.length + ". Nodene " + left.join(", ") + " fikk aldri inngrad 0" + (mode === "count" ? " ⇒ return true." : " ⇒ error."), { warn: left }), "Sykel!");
    } else {
      snap(LN.check, t("Alle kom med. Det finnes ingen ring.", "Alle " + V.length + " nodene kom med, så grafen er en DAG" + (mode === "count" ? ": svaret er false." : "."),
        "|output| = |V| = " + V.length + (mode === "count" ? " ⇒ return false." : ", ingen feil.")), "Ingen sykel");
      if (mode !== "count") snap(LN.ret, t("Rekkefølgen er: " + out.join(", ") + ".", "Topologisk ordning: " + out.join(", ") + ".",
        "For hver kant (u, v) står u før v i " + out.join(", ") + "."), "Ferdig");
    }
    return steps;
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
        "Vi legger inn v på nytt i stedet for å senke prioriteten. Utdaterte oppføringer kastes her."),
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
    var dist = {}, prev = {}, vis = {}, pq = [], seq = 0, cur = null, hot = null;
    V.forEach(function (v) { dist[v] = Infinity; });
    function snap(line, text, tag) {
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
        table: { head: [""].concat(V), rows: [["dist"].concat(V.map(function (v) { return fmtD(dist[v]); }))], hi: cur ? V.indexOf(cur) + 1 : null },
        note: "Tallet over en node er dist. Blå kanter: beste kjente vei. Overstreket i køen = gammel oppføring." });
    }
    pq.push({ v: s, p: 0, seq: seq++ }); dist[s] = 0;
    snap(5, t("Alle avstander er ukjente (∞), unntatt " + s + ", som er 0.", "dist[" + s + "] = 0, alle andre ∞. Køen inneholder " + s + ":0.",
      "Initialisering: dist[" + s + "] ← 0, queue = {(" + s + ", 0)}."), "Start");
    while (pq.length) {
      var x = pqPop(pq), u = x.v; cur = u; hot = null;
      if (vis[u]) {
        snap(8, t("Lappen " + u + ":" + x.p + " er gammel. " + u + " er alt ferdig, så vi kaster den.",
          u + " er alt i visited (med dist " + dist[u] + "). Oppføringen med prioritet " + x.p + " hoppes over.",
          "RemoveMin ga (" + u + ", " + x.p + "), men " + u + " ∈ visited ⇒ continue."), "Gammel " + u);
        continue;
      }
      snap(7, t(u + " er nærmest av de i køen (" + x.p + ").", "RemoveMin gir " + u + " med prioritet " + x.p + ".", "u ← " + u + ". dist[" + u + "] = " + dist[u] + " er nå endelig."), "Ta ut " + u);
      vis[u] = 1;
      A[u].forEach(function (nb) {
        var v = nb.v, c = dist[u] + nb.w; hot = ek(u, v);
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
      hot = null;
    }
    cur = null;
    snap(null, t("Køen er tom. Nå vet vi korteste avstand til alle.", "Ferdig. Blå kanter danner treet av korteste stier fra " + s + ".",
      "dist = {" + V.map(function (v) { return v + ": " + fmtD(dist[v]); }).join(", ") + "}."), "Ferdig");
    return steps;
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
    var parents = {}, order = [], pq = [], seq = 0, cur = null, hot = null, total = 0;
    function snap(line, text, tag) {
      var nodes = {}, edges = {};
      order.forEach(function (v) { nodes[v] = "done"; });
      if (cur) nodes[cur] = "cur";
      order.forEach(function (v) { if (parents[v] != null) edges[ek(parents[v], v)] = "tree"; });
      if (hot) edges[hot] = "hot";
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, text: text, tag: tag,
        panel: [{ label: "Prioritetskø (minst først):", items: pqItems(pq, function (x) { return "(" + (x.a || "null") + "," + x.v + "):" + x.p; }, function (x) { return parents.hasOwnProperty(x.v); }), kind: "queue" },
                { label: "I treet:", items: order.slice() }, { label: "Totalvekt:", items: [String(total)] }],
        note: "Overstreket = kanten går til en node som alt er i treet, og blir kastet når den tas ut." });
    }
    pq.push({ a: null, v: s, p: 0, seq: seq++ });
    snap(4, t("Vi starter i " + s + ".", "Køen inneholder (null, " + s + ") med prioritet 0.", "Start i s = " + s + "."), "Start");
    while (pq.length) {
      var x = pqPop(pq), u = x.v; cur = u; hot = x.a ? ek(x.a, u) : null;
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
    cur = null;
    snap(null, t("Køen er tom. Alle er hektet på med billigst mulig kabler: " + total + ".", "Ferdig. Spenntreet har totalvekt " + total + ".",
      "Minimalt spenntre med " + (order.length - 1) + " kanter og totalvekt " + total + "."), "Ferdig");
    return steps;
  });

  /* ===================== Kruskal ===================== */
  reg(IN.algos, "kruskal", {
    title: "Kruskals algoritme (minimalt spenntre / spennskog)",
    name: "Kruskal", params: "G",
    input: "En vektet, urettet graf G = (V, E)",
    output: "T: kantene i en minimal spennskog (ett spenntre hvis G er sammenhengende)",
    lines: [
      L("T ← empty set", 1, "Vi har ingen kabler ennå.", "T er kantene vi har valgt.", "Hver node er sitt eget lille tre i starten."),
      L("sort E by weight, lightest first", 1, "Vi sorterer alle kablene fra billigst til dyrest.", "Sorter kantene på vekt.", "O(|E| · log(|E|)) = O(|E| · log(|V|))."),
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
             "Sortering O(|E| · log(|E|)), og log(|E|) ≤ 2 · log(|V|). Det forutsetter at «samme tre?» kan sjekkes raskt, med en egen struktur som holder styr på hvilket tre hver node er i.") }
  });

  reg(IN.gen, "grKruskal", function (inp) {
    var g = inp[0], V = ids(g), steps = [];
    var E = g.edges.map(function (e, i) { return { u: e[0], v: e[1], w: e[2], i: i, st: "" }; })
      .sort(function (a, b) { return a.w - b.w || a.i - b.i; });
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
        note: "Nodene i samme tre har samme farge." });
    }
    snap(3, t("Alle kablene er sortert fra billigst til dyrest.", "Kantene er sortert på vekt. Hver node er sitt eget tre.", "Sortert: " + E.map(function (e) { return e.u + e.v + ":" + e.w; }).join(", ") + "."), "Sortert");
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
        snap(5, t(e.u + " og " + e.v + " henger alt sammen. Kabelen ville laget en ring, så vi dropper den.",
          e.u + " og " + e.v + " er i samme tre: " + e.u + "–" + e.v + " ville laget en sykel. Hopp over.",
          "Samme tre ⇒ sykel. Kanten forkastes."), "Forkast");
      }
    });
    cur = null;
    snap(null, t("Ferdig! Alle henger sammen, og prisen er " + total + ".", "Ferdig. Spenntreet har totalvekt " + total + ".", "T har " + E.filter(function (e) { return e.st === "ok"; }).length + " kanter, totalvekt " + total + "."), "Ferdig");
    return steps;
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
    var vis = {}, stack = [], done = {}, cur = null, comps = [], cmap = {};
    function snapA(text, tag) {
      var nodes = {};
      keys(vis).forEach(function (v) { nodes[v] = done[v] ? "done" : "seen"; });
      if (cur) nodes[cur] = "cur";
      steps.push({ line: 2, g: g, nodes: nodes, text: text, tag: tag,
        panel: [{ label: "stack (bunn → topp):", items: stack.slice(), kind: "stack" }] });
    }
    // Fase 1: DFSTopSort – vis hver gang en node blir ferdig og pushes
    function dfs(u) {
      vis[u] = 1; cur = u;
      A[u].forEach(function (nb) { if (!vis[nb.v]) dfs(nb.v); });
      done[u] = 1; stack.push(u); cur = u;
      snapA(t(u + " er ferdig: alle den kan gå videre til, er besøkt. " + u + " legges på bunken.",
        "DFS: " + u + " er ferdig og pushes.", "Postorder-push av " + u + "."), "Push " + u);
    }
    V.forEach(function (v) { if (!vis[v]) dfs(v); });
    cur = null;
    var order = stack.slice();
    function snapB(line, text, tag, hiComp) {
      var nodes = {};
      if (cur) nodes[cur] = "cur";
      var cm = {}; keys(cmap).forEach(function (v) { cm[v] = cmap[v]; });
      steps.push({ line: line, g: gr, nodes: nodes, comp: cm, text: text, tag: tag,
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
    return steps;
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
               "I en urettet graf står kanten {p, u} i nabolista til u. Uten unntaket ville vi sett p som «besøkt nabo» og trodd at vi fant en sykel – også i et tre. Sensor trakk poeng for dette (H2025).",
               "En sykel krever minst tre noder i en enkel graf. Kanten tilbake til forelderen er DFS-trekanten selv, ikke en bakoverkant.") }),
      L("if v ∈ visited then return true", 2,
        "Har vi vært hos v før, via en annen vei? Da har vi gått i ring!",
        "En besøkt nabo som ikke er forelderen, betyr en sykel.",
        "Det er en bakoverkant: v er en forfeder til u i DFS-treet, så stien v → … → u pluss kanten {u, v} er en sykel."),
      L("if HasCycleFrom(G, u, v, visited) then return true", 2,
        "Gå videre til v, og husk at vi kom fra u.", "Rekursivt kall med u som forelder til v.", "Svaret bobler opp gjennom kallstakken."),
      L("return false", 1, "Vi kom oss gjennom alle naboene til u uten å møte et kryss. Her er det ingen ring.", "Ingen sykel i subtreet under u.", "")
    ]
  });

  reg(IN.gen, "grCycleUndir", function (inp) {
    var g = inp[0], V = ids(g), A = adj(g), steps = [];
    var vis = {}, par = {}, tree = {}, done = {}, stack = [], cur = null, hot = null, found = null;
    function snap(line, text, tag) {
      var nodes = {}, edges = {};
      keys(vis).forEach(function (v) { nodes[v] = done[v] ? "done" : "seen"; });
      if (cur) nodes[cur] = "cur";
      keys(tree).forEach(function (k) { edges[k] = "tree"; });
      if (hot) edges[hot] = "hot";
      if (found) { found.cyc.forEach(function (v) { nodes[v] = "warn"; }); edges[found.back] = "back"; found.cycE.forEach(function (k) { edges[k] = "back"; }); }
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, text: text, tag: tag,
        panel: [{ label: "Kallstakk (u, p):", items: stack.map(function (x) { return x[0] + "," + (x[1] || "null"); }), kind: "stack" }] });
    }
    function visit(u, p) {
      stack.push([u, p]); vis[u] = 1; par[u] = p; cur = u; hot = null;
      snap(2, t("Vi går til " + u + (p ? " fra " + p : "") + " og setter kryss.", "HasCycleFrom(p = " + (p || "null") + ", u = " + u + "): merk " + u + ".", "visited ∪= {" + u + "}."), "Besøk " + u);
      for (var i = 0; i < A[u].length; i++) {
        var v = A[u][i].v; cur = u; hot = ek(u, v);
        if (v === p) { snap(4, t(v + " er den vi kom fra. Den teller ikke.", v + " er forelderen. Hopp over.", "v = p = " + v + " ⇒ continue."), "Forelder"); continue; }
        if (vis[v]) {
          // Finn sykelen: fra u opp til v langs forelderpekerne
          var cyc = [u], cycE = [], x = u;
          while (x !== v && par[x] != null) { cycE.push(ek(par[x], x)); x = par[x]; cyc.push(x); }
          found = { cyc: cyc, cycE: cycE, back: ek(u, v) };
          snap(5, t(v + " har vi vært hos før, men ikke rett før " + u + ". Vi har gått i ring: " + cyc.reverse().join(" – ") + " – " + v + "!",
            v + " er besøkt og ikke forelderen: sykel " + cyc.join(" – ") + " – " + v + ". Returner true.",
            "Bakoverkant {" + u + ", " + v + "}. Sammen med trestien fra " + v + " til " + u + " gir den en sykel. return true bobler opp."), "Sykel!");
          return true;
        }
        tree[ek(u, v)] = 1;
        snap(6, t(v + " er ny. Vi går dit, og husker at vi kom fra " + u + ".", "Rekursivt kall: HasCycleFrom(p = " + u + ", u = " + v + ").", "{" + u + ", " + v + "} blir en kant i DFS-treet."), "Gå til " + v);
        if (visit(v, u)) return true;
      }
      done[u] = 1; stack.pop(); cur = stack.length ? stack[stack.length - 1][0] : null; hot = null;
      snap(7, t("Ingen ring under " + u + ". Vi går tilbake.", u + " gir false.", "Ingen bakoverkant fra subtreet under " + u + "."), "false fra " + u);
      return false;
    }
    var hit = false;
    for (var i = 0; i < V.length && !hit; i++) {
      if (vis[V[i]]) continue;
      if (i > 0) { cur = null; hot = null; snap(null, t("Vi har ikke vært i " + V[i] + " ennå. Vi starter et nytt søk der.", "Ny komponent: HasCycle kaller HasCycleFrom(null, " + V[i] + ").", "Ytre løkke i HasCycle: ny komponent fra " + V[i] + "."), "Ny komponent"); }
      hit = visit(V[i], null);
    }
    if (!hit) { cur = null; snap(null, t("Vi fant ingen ring. Grafen er et tre (eller flere trær).", "Ingen sykel: HasCycle returnerer false. Grafen er et tre eller en skog.", "|E| = " + g.edges.length + ", |V| = " + V.length + ": en skog har |E| = |V| − (antall komponenter)."), "Ingen sykel"); }
    return steps;
  });

  /* ===================== Separasjonsnoder (2-sammenheng) ===================== */
  reg(IN.algos, "sepVertices", {
    title: "Separasjonsnoder",
    name: "SeparationVertices", params: "G",
    input: "En sammenhengende urettet graf G = (V, E)",
    output: "seps: alle separasjonsnodene i G",
    lines: [
      L("depth, low, seps ← empty map, empty map, empty set", 1, "Vi gjør klar tre notatblokker: hvor dypt hver node ligger, hvor høyt den kan klatre, og hvilke noder som holder grafen sammen.", "Delte variabler for alle kallene.", "depth = dybden i DFS-treet; low = laveste dybde vi kan nå via subtreet."),
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
      L("return seps", 1, "Nå har vi alle knutepunktene. Fjerner vi ett av dem, faller grafen i flere deler.", "Returner separasjonsnodene.", "G er 2-sammenhengende hvis og bare hvis seps er tom (og |V| ≥ 3).")
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
})();
