/* ============================================================
   IN2010 guide · symboler.js
   Symbolordliste for pseudokode og forklaringer (IN.SYMBOLER) +
   en skanner som finner symbolene i ren tekst (IN.SYMBOLER.scan).
   Lastes rett etter core.js. Selve verktøytipset (IN.symbolTips) ligger i core.js,
   og pseudocode.js bruker skanneren i tokenizeren.
   Skrivemåten følger kurset (plan/symbolbank.md, plan/gjennomgang/symboler.md). Unntak: ↦ er guidens egen.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});

  /* Hvert symbol: vis (slik det står i teksten), navn (kort), txt (én linje på kursnivå), eks (eksempel). */
  var S = {
    floor:  { vis: "⌊x⌋", navn: "gulv (rund ned)",
              txt: "Det største heltallet som er ≤ x. Vi runder alltid ned.",
              eks: "⌊7/2⌋ = ⌊3,5⌋ = 3, og ⌊6/2⌋ = 3." },
    ceil:   { vis: "⌈x⌉", navn: "tak (rund opp)",
              txt: "Det minste heltallet som er ≥ x. Vi runder alltid opp.",
              eks: "⌈7/2⌉ = ⌈3,5⌉ = 4, og ⌈6/2⌉ = 3." },
    "in":   { vis: "∈", navn: "«er element i»",
              txt: "x ∈ M betyr at x er med i mengden (samlingen) M.",
              eks: "v ∈ V: v er en av nodene. «for v ∈ V do» går gjennom alle nodene." },
    notin:  { vis: "∉", navn: "«er ikke element i»",
              txt: "x ∉ M betyr at x ikke er med i M.",
              eks: "v ∉ visited: v er ikke besøkt ennå." },
    subset: { vis: "⊆", navn: "delmengde",
              txt: "A ⊆ B betyr at alt som er i A, også er i B (A kan være lik B).",
              eks: "{1, 2} ⊆ {1, 2, 3}." },
    union:  { vis: "∪", navn: "union",
              txt: "A ∪ B er alt som er i A, i B eller i begge.",
              eks: "{1, 2} ∪ {2, 3} = {1, 2, 3}." },
    inf:    { vis: "∞", navn: "uendelig",
              txt: "Større enn alle tall. Brukes som startverdi for «ingen vei funnet ennå».",
              eks: "dist[v] ← ∞ helt til algoritmen finner en vei til v." },
    assign: { vis: "←", navn: "tilordning («settes til»)",
              txt: "x ← 5 legger verdien 5 i variabelen x. Det er ingen sammenligning – den skrives med =.",
              eks: "i ← i + 1 øker i med én." },
    neq:    { vis: "≠", navn: "ikke lik",
              txt: "a ≠ b er sant når a og b er forskjellige.",
              eks: "while v ≠ null do: fortsett så lenge det finnes en node v." },
    mod:    { vis: "mod", navn: "modulo (rest)",
              txt: "a mod N er resten når a deles på N. Svaret er alltid mellom 0 og N − 1.",
              eks: "17 mod 5 = 2, og (9 + 1) mod 10 = 0." },
    V:      { vis: "|V|", navn: "antall noder",
              txt: "|V| er antall noder i grafen G = (V, E).",
              eks: "En graf med nodene a, b og c har |V| = 3." },
    E:      { vis: "|E|", navn: "antall kanter",
              txt: "|E| er antall kanter i grafen G = (V, E).",
              eks: "O(|V| + |E|): tiden vokser med både antall noder og antall kanter." },
    card:   { vis: "|X|", navn: "størrelsen på X",
              txt: "Loddstreker rundt et navn betyr antall elementer i arrayet, lista eller mengden X.",
              eks: "Er A = [4, 8, 1], så er |A| = 3, og siste indeks er |A| − 1 = 2." },
    graph:  { vis: "G = (V, E)", navn: "en graf",
              txt: "En graf er to mengder: V er nodene og E er kantene.",
              eks: "V = {a, b, c} og E = {{a, b}, {b, c}}: tre noder og to kanter." },
    weight: { vis: "w(u, v)", navn: "vekten på kanten",
              txt: "w(u, v) er vekten (kostnaden, lengden) på kanten fra u til v.",
              eks: "w(a, b) = 4: det koster 4 å gå fra a til b." },
    deg:    { vis: "deg(v)", navn: "graden til v",
              txt: "Antall kanter som er koblet til noden v.",
              eks: "En node med tre naboer i en urettet graf har grad 3." },
    uedge:  { vis: "{u, v}", navn: "urettet kant",
              txt: "Kanten mellom u og v uten retning: {u, v} og {v, u} er samme kant.",
              eks: "En rettet kant skrives (u, v): fra u til v." },
    range:  { vis: "A[i..j]", navn: "del av et array",
              txt: "A[i..j] er elementene i A fra og med indeks i til og med indeks j.",
              eks: "A = [5, 2, 9, 4]: A[1..2] er [2, 9]." },
    sum:    { vis: "∑", navn: "sum",
              txt: "∑ betyr «legg sammen». Grensene sier hvor tellingen starter og slutter.",
              eks: "Summen av i for i fra 1 til n er 1 + 2 + … + n = n(n + 1)/2." },
    maps:   { vis: "↦", navn: "«kobles til»",
              txt: "k ↦ v betyr at nøkkelen k er koblet til verdien v (et par i et hashmap). Det er guidens skrivemåte; kurset sier det med ord.",
              eks: "«ola» ↦ 42: slår vi opp «ola», får vi 42." }
  };

  /* Enkelttegn → id. ⌊ ⌋ ⌈ ⌉ alene (uten partner på samme sted) får også forklaring. */
  var CHAR = { "∈": "in", "∉": "notin", "⊆": "subset", "∪": "union", "∞": "inf", "←": "assign",
    "≠": "neq", "∑": "sum", "↦": "maps", "⌊": "floor", "⌋": "floor", "⌈": "ceil", "⌉": "ceil" };

  /* Mønstre som dekker flere tegn. Rekkefølgen teller (første treff på samme sted vinner).
     inner: tekst mellom åpne/lukke-tegn (brukes av tokenizeren til å farge innholdet). */
  var MULTI = [
    { id: "floor",  re: /⌊[^⌊⌋\n]{1,60}⌋/g, wrap: 1 },
    { id: "ceil",   re: /⌈[^⌈⌉\n]{1,60}⌉/g, wrap: 1 },
    { id: "graph",  re: /\bG ?= ?\(V, ?E\)/g },
    { id: "card",   re: /\|[A-Z]\|/g },
    { id: "weight", re: /\bw\([a-z]\w{0,3}, ?[a-z]\w{0,3}\)/g },
    { id: "deg",    re: /\bdeg\([a-z]\w{0,3}\)/g },
    { id: "uedge",  re: /\{[uv], ?[uv]\}/g },
    { id: "range",  re: /\b[A-Za-z]\w{0,3}\[[^\[\]\n.]{1,20}\.\.[^\[\]\n.]{1,20}\]/g },
    { id: "mod",    re: /\bmod\b/g }
  ];
  var ANY = /[∈∉⊆∪∞←≠∑↦⌊⌋⌈⌉|{\[]|\bG ?=|\bw\(|\bdeg\(|\bmod\b/;

  /* Er ← en tilordning her? Krev et navn, ] eller ) rett før (med høyst ett mellomrom), så piler i
     løpende tekst («← Forrige») ikke får tilordningsforklaring. */
  function isAssign(text, i) {
    var p = text.charAt(i - 1);
    if (p === " ") p = text.charAt(i - 2);
    return /[A-Za-z0-9_\]\)'’]/.test(p);
  }

  /* scan(text) → [{ i, n, id, arg?, open?, close? }] sortert, uten overlapp.
     open/close er lengden på åpne/lukke-tegnet for mønstre med innhold (⌊…⌋, ⌈…⌉). */
  function scan(text) {
    if (!text || !ANY.test(text)) return [];
    var hits = [];
    MULTI.forEach(function (p) {
      p.re.lastIndex = 0;
      var m;
      while ((m = p.re.exec(text)) !== null) {
        var h = { i: m.index, n: m[0].length, id: p.id };
        if (p.id === "card") {
          var L = m[0].charAt(1);
          if (L === "V" || L === "E") h.id = L; else h.arg = L;
        }
        if (p.wrap) { h.open = 1; h.close = 1; }
        hits.push(h);
      }
    });
    for (var i = 0; i < text.length; i++) {
      var id = CHAR[text.charAt(i)];
      if (!id) continue;
      if (id === "assign" && !isAssign(text, i)) continue;
      hits.push({ i: i, n: 1, id: id, single: 1 });
    }
    // Lengste/første treff vinner; enkelttegn inne i et mønster forkastes.
    hits.sort(function (a, b) { return a.i - b.i || b.n - a.n; });
    var out = [], end = -1;
    hits.forEach(function (h) {
      if (h.i < end) return;
      out.push(h); end = h.i + h.n;
    });
    return out;
  }

  /* Oppslag for et treff: { vis, navn, txt, eks } (|X| får navnet satt inn). */
  function entry(id, arg) {
    var e = S[id];
    if (!e) return null;
    if (id === "card" && arg) {
      return { vis: "|" + arg + "|", navn: "størrelsen på " + arg,
        txt: "|" + arg + "| er antall elementer i " + arg + " (array, liste eller mengde).", eks: e.eks };
    }
    return e;
  }

  IN.SYMBOLER = { list: S, CHAR: CHAR, scan: scan, entry: entry };
})();
