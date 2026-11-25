/* ============================================================
   IN2010 guide · data-hashing.js  (Blokk 5 · Hashing)
   Pseudokode (IN.algos) og steg-generatorer (IN.gen) for
   Separate chaining, Linear probing (tett hullet / merk som slettet),
   rehash, Python 3.6-ordbøker og telling med hashmap.
   Alle nøkler har prefikset «hs», så de ikke kolliderer med andre sider.
   Steg: { line, parts:[…], info:[…], text:{eli5,normal,teknisk}, tag } – tegnes av viz-hash.js.
   Demoer med flere operasjoner bruker linjenummer 100·a + linje, der a er
   operasjonens plass i lista (1 = første pseudokode, 2 = andre, …).
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.algos = IN.algos || {};
  IN.gen = IN.gen || {};

  function t(eli5, normal, teknisk) { return { eli5: eli5, normal: normal, teknisk: teknisk }; }
  function reg(obj, key, val) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (window.console && console.warn) console.warn("data-hashing.js: «" + key + "» finnes fra før og beholdes.");
      return;
    }
    obj[key] = val;
  }

  /* ---------------- Hashfunksjoner og hjelpere ---------------- */
  var HS = (IN.hs = IN.hs || {});
  function mod(a, N) { return ((a % N) + N) % N; }
  // Kursets «gode» strenghash: h ← 31·h + ord(c) for hvert tegn, til slutt mod N.
  // Vi regner mod N underveis; det gir samme rest som å ta mod N av det store tallet til slutt.
  function h31(s, N) { var h = 0; for (var i = 0; i < s.length; i++) h = (31 * h + s.charCodeAt(i)) % N; return h; }
  function h31Full(s) { var h = BigInt(0); for (var i = 0; i < s.length; i++) h = BigInt(31) * h + BigInt(s.charCodeAt(i)); return h; }
  // Kursets «dårlige» strenghash: summen av tegnkodene mod N (alle anagrammer kolliderer).
  function hSum(s, N) { var h = 0; for (var i = 0; i < s.length; i++) h += s.charCodeAt(i); return mod(h, N); }
  function isNum(k) { return typeof k === "number"; }
  function hash(k, N, fixed) {
    if (fixed && Object.prototype.hasOwnProperty.call(fixed, k)) return mod(fixed[k], N);
    if (isNum(k)) return mod(k, N);
    return h31(String(k), N);
  }
  function show(k) { return isNum(k) ? String(k) : "«" + k + "»"; }
  function hText(k, N, fixed) {
    var r = hash(k, N, fixed);
    if (fixed && Object.prototype.hasOwnProperty.call(fixed, k)) return "h(" + show(k) + ", " + N + ") = " + fixed[k] + " mod " + N + " = " + r;
    if (isNum(k)) return "h(" + k + ", " + N + ") = " + k + " mod " + N + " = " + r;
    return "h(" + show(k) + ", " + N + ") = " + r;
  }
  // Ligger h i det sirkulære intervallet (i, j] (mod N)?
  function inCyc(h, i, j, N) { var a = mod(h - i, N), b = mod(j - i, N); return a > 0 && a <= b; }
  function cycList(i, j, N) { var out = [], x = mod(i + 1, N), g = 0; while (g++ <= N) { out.push(x); if (x === j) break; x = mod(x + 1, N); } return out; }
  function tries(n) { return n + (n === 1 ? " prøvd plass" : " prøvde plasser"); }
  function fmt(x) { return String(Math.round(x * 100) / 100).replace(".", ","); }
  HS.mod = mod; HS.h31 = h31; HS.h31Full = h31Full; HS.hSum = hSum; HS.hash = hash; HS.hText = hText;
  HS.inCyc = inCyc; HS.cycList = cycList; HS.fmt = fmt; HS.show = show;

  /* «21=a, ?21, -54, N=7» → { N, ops:[{op,k,v}] }. Tall blir tall, alt annet strenger. */
  HS.parseOps = function (s, o) {
    o = o || {};
    var out = { N: o.N || 10, ops: [] };
    String(s).split(/[,;\n]+/).forEach(function (raw) {
      var x = raw.trim(); if (!x) return;
      var mN = x.match(/^N\s*=\s*(\d+)$/i);
      if (mN) { out.N = Math.max(2, Math.min(o.maxN || 16, +mN[1])); return; }
      if (/^rehash$/i.test(x)) { if (o.rehash) out.ops.push({ op: "rehash" }); return; }
      var op = "ins";
      if (x[0] === "?") { op = "get"; x = x.slice(1).trim(); }
      else if (x[0] === "-" && o.del) { op = "del"; x = x.slice(1).trim(); }
      var k = x, v = null, eq = x.indexOf("=");
      if (eq > 0) { k = x.slice(0, eq).trim(); v = x.slice(eq + 1).trim(); }
      if (!k) return;
      if (/^-?\d+$/.test(k)) k = parseInt(k, 10);
      else if (o.numbers) return;
      out.ops.push({ op: op, k: k, v: v });
    });
    out.ops = out.ops.slice(0, o.maxOps || 16);
    return out.ops.length ? [out] : [];
  };

  function cloneCells(A) {
    return A.map(function (c) { return c == null ? null : c.tomb ? { tomb: true } : c.ref != null ? { ref: c.ref } : { k: c.k, v: c.v }; });
  }
  function emptyArr(N) { var a = []; for (var i = 0; i < N; i++) a.push(null); return a; }
  function cfgOf(input) { var c = Array.isArray(input) ? input[0] : input; return c || {}; }
  function pv(o) { return o.v != null ? "(" + show(o.k) + ", " + o.v + ")" : show(o.k); }

  /* ================================================================
     PSEUDOKODE
     ================================================================ */

  /* ---------- Separate chaining ---------- */
  reg(IN.algos, "hsChainInsert", {
    title: "Separate chaining: innsetting", name: "SeparateChainingInsert", params: "A, k, v",
    input: "Et array A av størrelse N (hver plass er null eller en liste), en nøkkel k og en verdi v",
    output: "Arrayet A, der (k, v) er satt inn",
    lines: [
      { code: "i ← h(k, N)", indent: 1,
        eli5: "Regn ut hvilken bøtte nøkkelen hører hjemme i.",
        normal: "Hashfunksjonen gir et tall mellom 0 og N − 1: indeksen til bøtta.",
        teknisk: "Én hashberegning, O(1). Samme nøkkel gir alltid samme bøtte, ellers ville vi aldri funnet den igjen." },
      { code: "B ← A[i]", indent: 1,
        eli5: "Gå til den bøtta og se hva som ligger der. Kanskje finnes den ikke ennå.", normal: "B er lista på plass i (eller null hvis ingen har brukt plassen ennå).",
        teknisk: "Bøttene lages først når de trengs, så A[i] kan være null." },
      { code: "if B = null then", indent: 1,
        eli5: "Har ingen nøkkel havnet på denne plassen før? Da finnes det ingen bøtte her ennå.", normal: "Første gang noe hasher til plass i, finnes det ingen liste.",
        teknisk: "Lat initialisering av bøtta. Sensor trakk poeng når det var uklart hvordan bøtta ble laget." },
      { code: "A[i] ← new list with (k, v)", indent: 2,
        eli5: "Lag en ny bøtte med bare dette paret i.", normal: "Lag en liste som inneholder (k, v), og legg den på plass i.",
        teknisk: "Ny liste med ett element, O(1)." },
      { code: "return A", indent: 2,
        eli5: "Ferdig! Bøtta var tom, så nøkkelen kunne ikke finnes fra før.", normal: "Ferdig: nøkkelen kan ikke finnes fra før, for bøtta var tom.", teknisk: "Ferdig." },
      { code: "for j ← 0 to |B| − 1 do", indent: 1,
        eli5: "Se på hvert par i bøtta, ett om gangen.", normal: "Gå gjennom alle parene i bøtta.",
        teknisk: "Lineært søk i bøtta: O(|B|). Med god hashfunksjon og lav Load factor er |B| forventet O(1).",
        grense: { q: "Hvorfor |B| − 1 og ikke |B|?", a: t(
          "Vi teller fra 0. Har bøtta 3 par, heter de 0, 1 og 2.",
          "Listene er 0-indeksert: en bøtte med |B| par har indeksene 0 til |B| − 1. Går vi til |B|, leser vi utenfor lista.",
          "0-indeksert: gyldige indekser er 0, …, |B| − 1. Er bøtta tom (|B| = 0), kjører løkka null ganger, og vi går rett til append.") } },
      { code: "if B[j].key = k then", indent: 2,
        eli5: "Er dette den samme nøkkelen som vi skal sette inn? Da skal vi ikke lage en til.", normal: "Ligger nøkkelen k allerede i bøtta?",
        teknisk: "Nøkler sammenlignes med likhet. Det er grunnen til at samme nøkkel aldri skal ligge to ganger." },
      { code: "B[j] ← (k, v)", indent: 3,
        eli5: "Bytt ut den gamle verdien med den nye.", normal: "Overskriv det gamle paret. Et hashmap har hver nøkkel bare én gang.",
        teknisk: "Overskriving i stedet for duplikat. H2025 trakk poeng for løsninger som glemte dette." },
      { code: "return A", indent: 3, eli5: "Ferdig! Vi byttet ut den gamle verdien.", normal: "Ferdig etter overskrivingen.", teknisk: "Antall par n endres ikke." },
      { code: "append (k, v) to B", indent: 1,
        eli5: "Nøkkelen fantes ikke, så vi legger paret bakerst i bøtta.", normal: "Nøkkelen fantes ikke i bøtta: legg paret til på slutten.",
        teknisk: "Append er O(1). Totalt: O(1 + |B|)." },
      { code: "return A", indent: 1, eli5: "Ferdig! Paret ligger nå bakerst i bøtta.", normal: "Ferdig.", teknisk: "n øker med 1." }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet", worst: "O(n)", space: "O(n + N)",
      why: t("Vanligvis er bøtta nesten tom, så det går fort. Men havner alt i samme bøtte, må vi lete gjennom alt.",
        "Vi må lete gjennom én bøtte. Med en god hashfunksjon og lav Load factor (n/N) er bøttene korte, så forventet tid er O(1). Hasher alle n nøklene til samme bøtte, blir det O(n).",
        "Kostnaden er O(1 + |B|). Med god hashfunksjon er forventet bøttelengde n/N, som holdes konstant ved rehash. Verste tilfelle: alle n nøkler i samme bøtte, O(n). Med rehash blir innsetting forventet amortisert O(1).") }
  });

  reg(IN.algos, "hsChainGet", {
    title: "Separate chaining: oppslag", name: "SeparateChainingGet", params: "A, k",
    input: "Et array A av størrelse N med bøtter, og en nøkkel k", output: "Verdien til k, eller null hvis k ikke finnes",
    lines: [
      { code: "i ← h(k, N)", indent: 1, eli5: "Regn ut bøttenummeret på samme måte som da nøkkelen ble lagt inn. Da havner vi i riktig bøtte.", normal: "Samme hashfunksjon som ved innsetting, så vi havner i samme bøtte.", teknisk: "O(1)." },
      { code: "B ← A[i]", indent: 1, eli5: "Hent bøtta på den plassen. Kanskje finnes den ikke.", normal: "Hent bøtta på plass i.", teknisk: "Kan være null." },
      { code: "if B = null then", indent: 1, eli5: "Er det ingen bøtte her? Da har ingen nøkkel noen gang havnet på denne plassen.", normal: "Ingen bøtte betyr at ingen nøkkel har hashet hit.", teknisk: "Da kan k umulig finnes." },
      { code: "return null", indent: 2, eli5: "Da finnes ikke nøkkelen.", normal: "k finnes ikke.", teknisk: "Mislykket oppslag i O(1)." },
      { code: "for j ← 0 to |B| − 1 do", indent: 1, eli5: "Se på parene i bøtta, ett om gangen.", normal: "Let gjennom bøtta.", teknisk: "O(|B|)." },
      { code: "if B[j].key = k then", indent: 2, eli5: "Er dette nøkkelen vi leter etter, og ikke bare en annen som havnet i samme bøtte?", normal: "Sammenlign nøkkelen.", teknisk: "Likhetssjekk." },
      { code: "return B[j].value", indent: 3, eli5: "Funnet! Gi tilbake verdien.", normal: "Funnet: returner verdien.", teknisk: "Vellykket oppslag." },
      { code: "return null", indent: 1, eli5: "Vi lette i hele bøtta uten å finne den.", normal: "Hele bøtta er sjekket: k finnes ikke.", teknisk: "Mislykket oppslag i O(1 + |B|)." }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet", worst: "O(n)", space: "O(1) ekstra",
      why: t("Som oftest er det bare et par ting i bøtta. Men havner alt i samme bøtte, må vi lete gjennom alt.", "Vi leter bare i én bøtte. Den er forventet kort, men kan i verste fall inneholde alle n nøklene.",
        "O(1 + |B|). Forventet |B| = n/N, altså O(1) når Load factor holdes konstant. Verste tilfelle O(n).") }
  });

  /* ---------- Linear probing ---------- */
  var MODN = { q: "Hvorfor «mod N»?", a: t(
    "Når vi kommer til siste plass, starter vi forfra på plass 0, som å gå rundt en klokke.",
    "Etter plass N − 1 skal vi fortsette på plass 0, ikke gå utenfor arrayet. (i + 1) mod N gir akkurat det.",
    "(N − 1 + 1) mod N = 0, så arrayet behandles som en ring. Å gå utenfor arrayet ga trekk på H2022.") };

  reg(IN.algos, "hsProbeInsert", {
    title: "Linear probing: innsetting", name: "LinearProbingInsert", params: "A, k, v",
    input: "Et array A av størrelse N som ikke er fullt (ledig plass er null), en nøkkel k og en verdi v",
    output: "Arrayet A, der (k, v) er satt inn",
    lines: [
      { code: "i ← h(k, N)", indent: 1, eli5: "Finn plassen nøkkelen helst vil ha.", normal: "Start på hjemmeplassen h(k, N).", teknisk: "0 ≤ i ≤ N − 1." },
      { code: "while A[i] ≠ null do", indent: 1,
        eli5: "Så lenge noen allerede bruker plassen, må vi lete videre …", normal: "Fortsett så lenge plassen er opptatt.",
        teknisk: "Løkka stopper fordi arrayet ikke er fullt. Rehash ved høy Load factor sørger for det." },
      { code: "if A[i].key = k then", indent: 2,
        eli5: "… men først: er det kanskje vår egen nøkkel som ligger der?", normal: "Ligger nøkkelen her fra før?", teknisk: "Samme nøkkel skal overskrives, ikke legges inn to ganger." },
      { code: "break", indent: 3, eli5: "Ja! Da stopper vi her og bytter bare verdien.", normal: "Stopp: vi skal overskrive på denne plassen.", teknisk: "Hopp ut av løkka med i på nøkkelens plass." },
      { code: "i ← (i + 1) mod N", indent: 2, eli5: "Plassen var opptatt av en annen. Vi går ett skritt til høyre. Fra den siste plassen går vi tilbake til den første.", normal: "Kollisjon: gå til neste plass, rundt til 0 etter siste plass.",
        teknisk: "Lineær probing: hjemmeplass, så +1, +2, … (mod N).", grense: MODN },
      { code: "A[i] ← (k, v)", indent: 1, eli5: "Legg paret på plassen vi stoppet på.", normal: "Enten en ledig plass, eller plassen der k lå fra før.",
        teknisk: "Én skriving. Kostnaden er antall prøvde plasser." },
      { code: "return A", indent: 1, eli5: "Ferdig! Paret ligger nå i tabellen.", normal: "Ferdig.", teknisk: "" }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet", worst: "O(n)", space: "O(N)",
      why: t("Som regel er hjemmeplassen ledig eller nesten ledig. Men står mange i kø på rad, må vi gå forbi alle.",
        "Vi går forbi opptatte plasser til vi treffer en ledig. Med lav Load factor er det få av dem. I verste fall ligger alle n i ett langt segment.",
        "Forventet O(1) når Load factor holdes under en fast grense (f.eks. 0,75) og hashfunksjonen sprer godt. Lange segmenter uten hull (clustering) gjør probingen lengre. Verste tilfelle O(n). Med rehash: forventet amortisert O(1).") }
  });

  reg(IN.algos, "hsProbeGet", {
    title: "Linear probing: oppslag", name: "LinearProbingGet", params: "A, k",
    input: "Et array A av størrelse N og en nøkkel k", output: "Verdien til k, eller null",
    lines: [
      { code: "i ← h(k, N)", indent: 1, eli5: "Start der nøkkelen hører hjemme.", normal: "Start på hjemmeplassen.", teknisk: "Samme startpunkt som innsettingen brukte." },
      { code: "while A[i] ≠ null do", indent: 1, eli5: "Så lenge det ligger noe på plassen, leter vi videre …", normal: "Let til vi treffer en ledig plass.",
        teknisk: "En ledig plass betyr at k aldri ble skjøvet forbi hit. Derfor kan vi stoppe der." },
      { code: "if A[i].key = k then", indent: 2, eli5: "Er dette nøkkelen vi leter etter, og ikke bare en annen som havnet på samme sted?", normal: "Sammenlign nøkkelen.", teknisk: "" },
      { code: "return A[i].value", indent: 3, eli5: "Funnet! Vi gir tilbake verdien som hører til nøkkelen.", normal: "Funnet: returner verdien.", teknisk: "" },
      { code: "i ← (i + 1) mod N", indent: 2, eli5: "Ikke den rette. Vi går ett skritt til høyre, og fra den siste plassen tilbake til den første.", normal: "Neste plass, rundt til 0 etter siste.", teknisk: "", grense: MODN },
      { code: "return null", indent: 1, eli5: "Vi traff en tom plass, så nøkkelen finnes ikke.", normal: "En ledig plass: k finnes ikke.",
        teknisk: "Dette er grunnen til at sletting ikke bare kan sette en plass til null. Da kan senere oppslag stoppe for tidlig." }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet", worst: "O(n)", space: "O(1) ekstra",
      why: t("Vanligvis er det bare noen få plasser å sjekke. Står mange på rad, må vi gå forbi alle.", "Som innsetting: vi går gjennom segmentet av opptatte plasser fra hjemmeplassen.",
        "Antall prøvde plasser er forventet O(1) ved begrenset Load factor. Verste tilfelle O(n).") }
  });

  reg(IN.algos, "hsProbeRemove", {
    title: "Linear probing: sletting (tett hullet)", name: "LinearProbingRemove", params: "A, k",
    input: "Et array A av størrelse N som ikke er fullt, og en nøkkel k", output: "A uten k, der alle andre nøkler fortsatt kan finnes",
    lines: [
      { code: "i ← h(k, N)", indent: 1, eli5: "Finn nøkkelen først, akkurat som ved oppslag.", normal: "Start på hjemmeplassen til k.", teknisk: "" },
      { code: "while A[i] ≠ null and A[i].key ≠ k do", indent: 1, eli5: "Gå videre til vi finner den eller en tom plass.", normal: "Let som ved oppslag.", teknisk: "" },
      { code: "i ← (i + 1) mod N", indent: 2, eli5: "Plassen var opptatt av en annen. Vi går ett skritt til høyre. Fra den siste plassen går vi tilbake til den første.", normal: "Neste plass.", teknisk: "", grense: MODN },
      { code: "if A[i] = null then", indent: 1, eli5: "Kom vi til en tom plass? Da var nøkkelen aldri her.", normal: "Traff vi en ledig plass, finnes ikke k.", teknisk: "" },
      { code: "return A", indent: 2, eli5: "Da er det ingenting å slette.", normal: "Ingenting å slette.", teknisk: "" },
      { code: "A[i] ← null", indent: 1, eli5: "Ta den bort. Nå er det et hull her.", normal: "Fjern paret. Plass i er nå et hull.",
        teknisk: "Et hull midt i et segment kan få oppslag til å stoppe for tidlig. Resten av prosedyren tetter hullet." },
      { code: "j ← (i + 1) mod N", indent: 1, eli5: "Se på dem som står etter hullet.", normal: "j går gjennom resten av segmentet etter hullet.", teknisk: "" },
      { code: "while A[j] ≠ null do", indent: 1, eli5: "Vi sjekker alle som står på rad etter hullet, helt til vi kommer til en tom plass.", normal: "Bare nøklene fram til neste ledige plass kan være berørt.",
        teknisk: "Ingen nøkkel lenger ut kan ha probet forbi hullet, fordi probingen stopper ved første null." },
      { code: "if h(A[j].key, N) ∉ (i, j] then", indent: 2, eli5: "Ville denne nøkkelen ha gått forbi hullet for å komme dit den står?",
        normal: "Hjemmeplassen til nøkkelen på plass j ligger ikke mellom hullet og j. Da passerte den hullet på veien, og må flyttes inn i det.",
        teknisk: "(i, j] er de sirkulære indeksene i + 1, …, j (mod N). Ligger hjemmeplassen der, nås j uten å passere i, og nøkkelen kan stå. Ellers passeres i, og et hull i ville gjort den usynlig.",
        grense: { q: "Hvorfor (i, j] og ikke [i, j]?", a: t(
          "Hører nøkkelen hjemme akkurat i hullet, skal den også flyttes. Da må hullet være utenfor «bli»-området.",
          "Er hjemmeplassen lik i, går probingen innom hullet først, så nøkkelen må flyttes. Derfor er i ikke med, mens j er med (en nøkkel som hører hjemme på j, står riktig).",
          "Intervallet er åpent i i og lukket i j: h = i betyr at proben starter i hullet, og h = j betyr at nøkkelen står på hjemmeplassen sin.") } },
      { code: "A[i] ← A[j]", indent: 3, eli5: "Flytt den inn i hullet, så den kan finnes igjen.", normal: "Flytt paret inn i hullet.", teknisk: "Nå kan den nås igjen fra hjemmeplassen sin." },
      { code: "A[j] ← null", indent: 3, eli5: "Nå er hullet der den sto.", normal: "Det nye hullet er på plass j.", teknisk: "" },
      { code: "i ← j", indent: 3, eli5: "Vi fortsetter å tette det nye hullet.", normal: "Fortsett med å tette det nye hullet.", teknisk: "Samme som det rekursive kallet i kursets versjon." },
      { code: "j ← (j + 1) mod N", indent: 2, eli5: "Vi går videre til neste i rekka.", normal: "Se på neste plass.", teknisk: "", grense: MODN }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet", worst: "O(n)", space: "O(1) ekstra",
      why: t("Først leter vi fram nøkkelen, og så ser vi bare på dem som står på rad etter hullet. Som regel er det få.",
        "Først et oppslag, så én gjennomgang av resten av segmentet. Begge er forventet korte.",
        "Lengden på segmentet er forventet O(1) ved begrenset Load factor, men O(n) i verste fall.") }
  });

  /* ---------- Linear probing med slettet-merker ---------- */
  reg(IN.algos, "hsMarkInsert", {
    title: "Linear probing med slettet-merker: innsetting", name: "InsertWithMarks", params: "A, k, v",
    input: "Array A (ledig = null, slettet = DELETED), nøkkel k, verdi v", output: "A med (k, v)",
    lines: [
      { code: "i ← h(k, N)", indent: 1, eli5: "Vi regner ut hvor nøkkelen helst vil bo, og begynner der.", normal: "Start på hjemmeplassen.", teknisk: "" },
      { code: "p ← null", indent: 1, eli5: "Vi har ikke sett noe merke ennå.", normal: "p husker det første slettet-merket vi går forbi.", teknisk: "" },
      { code: "while A[i] ≠ null do", indent: 1, eli5: "Vi må gå helt til en tom plass, for nøkkelen kan ligge lenger ut.", normal: "Vi må helt til en ledig plass for å vite at k ikke finnes lenger ut.",
        teknisk: "Stopper vi ved første merke, kan k ligge lenger ut, og da får vi duplikat." },
      { code: "if A[i] = DELETED then", indent: 2, eli5: "Står det en «slettet»-lapp på plassen?", normal: "Et merke kan gjenbrukes.", teknisk: "" },
      { code: "if p = null then p ← i", indent: 3, eli5: "Husk den første plassen med slettemerke. Der kan vi sette nøkkelen hvis den ikke finnes fra før.", normal: "Husk det første merket.", teknisk: "" },
      { code: "else if A[i].key = k then", indent: 2, eli5: "Bor nøkkelen allerede her? Da skal vi bare bytte verdien.", normal: "Ligger k her fra før?", teknisk: "" },
      { code: "A[i] ← (k, v)", indent: 3, eli5: "Bytt ut den gamle verdien med den nye.", normal: "Overskriv.", teknisk: "" },
      { code: "return A", indent: 3, eli5: "Ferdig! Vi byttet ut den gamle verdien.", normal: "Ferdig.", teknisk: "" },
      { code: "i ← (i + 1) mod N", indent: 2, eli5: "Plassen var opptatt av en annen. Vi går ett skritt til høyre. Fra den siste plassen går vi tilbake til den første.", normal: "Neste plass.", teknisk: "", grense: MODN },
      { code: "if p ≠ null then i ← p", indent: 1, eli5: "Fant vi et merke, bruker vi den plassen.", normal: "Gjenbruk det første merket hvis vi fant et.", teknisk: "Kortere probing neste gang." },
      { code: "A[i] ← (k, v)", indent: 1, eli5: "Legg paret her. Nøkkelen fantes ikke fra før.", normal: "Sett inn.", teknisk: "" }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet", worst: "O(n)", space: "O(N)",
      why: t("Vi går forbi opptatte plasser og plasser med slettemerke til vi finner en tom. Merkene gjør køene lengre, men vanligvis er det bare noen få steg.", "Merker teller som opptatte når vi leter, så mange merker gjør letingen lengre.",
        "Probelengden avhenger av både ekte elementer og merker. Merkene forsvinner ved neste rehash.") }
  });

  reg(IN.algos, "hsMarkGet", {
    title: "Linear probing med slettet-merker: oppslag", name: "GetWithMarks", params: "A, k",
    input: "Array A (ledig = null, slettet = DELETED), nøkkel k", output: "Verdien til k, eller null",
    lines: [
      { code: "i ← h(k, N)", indent: 1, eli5: "Vi regner ut hvor nøkkelen helst vil bo, og begynner der.", normal: "Start på hjemmeplassen.", teknisk: "" },
      { code: "while A[i] ≠ null do", indent: 1, eli5: "Vi stopper bare ved helt tomme plasser. En «slettet»-lapp betyr at vi må lete videre.", normal: "Et merke er ikke null, så vi går forbi det.", teknisk: "Det er hele poenget med merket." },
      { code: "if A[i] ≠ DELETED and A[i].key = k then", indent: 2, eli5: "Er dette nøkkelen vi leter etter? Plasser med slettemerke hopper vi over.", normal: "Sjekk nøkkelen hvis plassen ikke er et merke.", teknisk: "" },
      { code: "return A[i].value", indent: 3, eli5: "Funnet! Vi gir tilbake verdien som hører til nøkkelen.", normal: "Funnet.", teknisk: "" },
      { code: "i ← (i + 1) mod N", indent: 2, eli5: "Ikke denne. Vi går ett skritt videre, også forbi plasser med slettemerke.", normal: "Neste plass.", teknisk: "", grense: MODN },
      { code: "return null", indent: 1, eli5: "Vi kom til en helt tom plass. Hadde nøkkelen vært i tabellen, ville vi ha møtt den før dette. Den finnes ikke.", normal: "k finnes ikke.", teknisk: "" }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet", worst: "O(n)", space: "O(1) ekstra",
      why: t("Vi må gå forbi slettemerkene også, for de teller som opptatt. Har vi slettet mye, blir køene lange og oppslaget tregere. Derfor bygger man tabellen på nytt av og til.", "Merker gjør segmentene lengre, ikke kortere.", "Forventet O(1) så lenge plasser med enten element eller merke holdes under en fast andel av N.") }
  });

  reg(IN.algos, "hsMarkRemove", {
    title: "Linear probing med slettet-merker: sletting", name: "RemoveWithMark", params: "A, k",
    input: "Array A (ledig = null, slettet = DELETED), nøkkel k", output: "A der k er erstattet med et merke",
    lines: [
      { code: "i ← h(k, N)", indent: 1, eli5: "Først må vi finne nøkkelen. Vi starter der den hører hjemme.", normal: "Let som ved oppslag.", teknisk: "" },
      { code: "while A[i] ≠ null do", indent: 1, eli5: "Gå til vi finner den, eller en tom plass.", normal: "Let til en ledig plass.", teknisk: "" },
      { code: "if A[i] ≠ DELETED and A[i].key = k then", indent: 2, eli5: "Er dette nøkkelen vi skal slette? Plasser med slettemerke hopper vi over.", normal: "Fant vi k?", teknisk: "" },
      { code: "A[i] ← DELETED", indent: 3, eli5: "Sett en lapp «slettet» på plassen i stedet for å tømme den.", normal: "Marker plassen som slettet. Den er ikke null, så oppslag går videre forbi den.",
        teknisk: "Ingen elementer flyttes. Til gjengjeld blir merkene liggende til neste rehash." },
      { code: "return A", indent: 3, eli5: "Ferdig! Nøkkelen er borte, og lappen sørger for at de andre fortsatt kan finnes.", normal: "Ferdig.", teknisk: "" },
      { code: "i ← (i + 1) mod N", indent: 2, eli5: "Plassen var opptatt av en annen. Vi går ett skritt til høyre. Fra den siste plassen går vi tilbake til den første.", normal: "Neste plass.", teknisk: "", grense: MODN }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet", worst: "O(n)", space: "O(1) ekstra",
      why: t("Vi leter fram nøkkelen og legger en lapp med «slettet» der den lå. Å lete tar det meste av tiden.", "Kostnaden er oppslaget. Selve merkingen er O(1).", "Forventet O(1), verste tilfelle O(n).") }
  });

  /* ---------- Rehash ---------- */
  reg(IN.algos, "hsInsertRehash", {
    title: "Innsetting med rehash (Linear probing)", name: "Insert", params: "k, v",
    input: "Nøkkel k og verdi v. Hashmapet har arrayet A, størrelsen N og antall par n", output: "(k, v) er satt inn",
    lines: [
      { code: "if n / N ≥ 0.75 then", indent: 1, eli5: "Er tabellen minst tre fjerdedeler full? Da blir køene lange, og vi må lage mer plass.", normal: "Sjekk Load factor før innsettingen.",
        teknisk: "Kurset bruker grensen 0,75. Ideelt ligger Load factor omtrent mellom 1/2 og 3/4.",
        grense: { q: "Hvorfor sjekke før innsettingen?", a: t(
          "Da er det alltid minst én tom plass når vi skal legge inn noe.",
          "Etter sjekken er n/N < 0,75, altså n < N. Da finnes det en ledig plass, og probe-løkka stopper.",
          "Invarianten n < N gjør at while-løkka terminerer. Med grense 0,75 holdes dessuten forventet probelengde konstant.") } },
      { code: "Rehash()", indent: 2, eli5: "Lag en større tabell og flytt alt over.", normal: "Doble arrayet og sett inn alt på nytt.", teknisk: "O(n), men sjelden." },
      { code: "i ← h(k, N)", indent: 1, eli5: "Finn hjemmeplassen. Har tabellen nettopp blitt større, kan den være en annen enn før.", normal: "Hjemmeplassen med den (kanskje nye) N-en.", teknisk: "" },
      { code: "while A[i] ≠ null do", indent: 1, eli5: "Så lenge plassen er opptatt …", normal: "Linear probing som før.", teknisk: "" },
      { code: "if A[i].key = k then", indent: 2, eli5: "Bor nøkkelen allerede her? Da skal vi bare bytte verdien.", normal: "Ligger k her fra før?", teknisk: "" },
      { code: "A[i] ← (k, v)", indent: 3, eli5: "Bytt ut den gamle verdien med den nye.", normal: "Overskriv.", teknisk: "" },
      { code: "return", indent: 3, eli5: "Ferdig! Vi byttet ut verdien, så antallet i tabellen er det samme.", normal: "Ferdig (n uendret).", teknisk: "" },
      { code: "i ← (i + 1) mod N", indent: 2, eli5: "Plassen var opptatt av en annen. Vi går ett skritt til høyre. Fra den siste plassen går vi tilbake til den første.", normal: "Neste plass.", teknisk: "", grense: MODN },
      { code: "A[i] ← (k, v)", indent: 1, eli5: "Legg paret på den ledige plassen.", normal: "Sett inn på den ledige plassen.", teknisk: "" },
      { code: "n ← n + 1", indent: 1, eli5: "Nå er det én til i tabellen. Vi teller, så vi vet når den blir for full.", normal: "Tell opp antall par.", teknisk: "" }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet amortisert", worst: "O(n)", space: "O(N)",
      why: t("Nesten alltid raskt. Av og til må alt flyttes, men det skjer så sjelden at det jevner seg ut.",
        "En rehash koster O(n), men N dobles hver gang, så det skjer bare etter at vi har satt inn mange nye par siden sist. Fordelt på alle innsettingene blir det O(1) hver.",
        "Dobling gir rehash ved n ≈ 0,75 · 1, 2, 4, 8, …. Total rehash-kostnad over n innsettinger er en geometrisk rekke, O(n). Altså forventet amortisert O(1) per innsetting. Én enkelt innsetting kan likevel ta O(n).") }
  });

  reg(IN.algos, "hsRehash", {
    title: "Rehash", name: "Rehash", params: "",
    input: "Hashmapet (A, N, n)", output: "A er dobbelt så stort, og alle par er satt inn på nytt",
    lines: [
      { code: "B ← A", indent: 1, eli5: "Ta vare på den gamle tabellen.", normal: "Det gamle arrayet.", teknisk: "" },
      { code: "N ← 2 · N", indent: 1, eli5: "Den nye tabellen blir dobbelt så stor, så det blir lenge til neste gang den blir full.", normal: "Doble størrelsen.", teknisk: "",
        grense: { q: "Hvorfor doble, og ikke bare legge til litt?", a: t(
          "Gjør vi tabellen bare litt større, blir den full igjen med en gang, og vi må flytte alt hele tiden.",
          "Med N ← N + 1 måtte vi rehashet nesten ved hver innsetting, og alt ville blitt O(n). Dobling gjør rehash sjelden.",
          "Dobling gir en geometrisk rekke 1 + 2 + 4 + … < 2n flytt totalt, altså amortisert O(1). Å legge til en konstant gir O(n) amortisert.") } },
      { code: "A ← new array of size N", indent: 1, eli5: "Lag en ny, tom tabell.", normal: "Nytt array der alle plasser er null.", teknisk: "" },
      { code: "n ← 0", indent: 1, eli5: "Den nye tabellen er tom, så vi begynner å telle på null.", normal: "Insert teller opp igjen.", teknisk: "" },
      { code: "for j ← 0 to |B| − 1 do", indent: 1, eli5: "Gå gjennom hele den gamle tabellen.", normal: "Alle plassene i det gamle arrayet.", teknisk: "O(N) plasser, og O(n) innsettinger." },
      { code: "if B[j] ≠ null then", indent: 2, eli5: "Ligger det noe på denne plassen i den gamle tabellen? Tomme plasser hopper vi over.", normal: "Hopp over ledige plasser.", teknisk: "" },
      { code: "Insert(B[j].key, B[j].value)", indent: 3, eli5: "Flytt det over. Det kan havne et nytt sted!", normal: "Sett inn på nytt med h(k, N) for den nye N-en.",
        teknisk: "Nøklene må hashes på nytt, fordi hjemmeplassen avhenger av N. Insert utløser ikke ny rehash: n/N ≤ 1/2 etter doblingen." }
    ],
    bigO: { best: "O(n + N)", avg: "O(n + N)", worst: "O(n + N)", space: "O(N)",
      why: t("Når garderoben blir for full, bygger vi en dobbelt så stor og henger hver jakke opp på nytt. Det tar tid akkurat da, men det skjer sjelden.",
        "Hvert par settes inn på nytt. Rehash skjer først når n/N ≥ 0,75, så rett etter doblingen er N høyst en konstant ganger n (omtrent 8/3 · n). Altså er N = O(n), og hele rehashen er O(n).",
        "O(N) for å gå gjennom B, pluss n forventet O(1)-innsettinger. Med Load factor over en fast nedre grense er det O(n).") }
  });

  /* ---------- Python 3.6-ordbok ---------- */
  reg(IN.algos, "hsPyGet", {
    title: "Ordbok med indices og entries: oppslag", name: "DictGet", params: "k",
    input: "Nøkkel k. indices har N plasser (null eller en indeks i entries), entries er tettpakket", output: "Verdien til k, eller null",
    lines: [
      { code: "N ← |indices|", indent: 1, eli5: "Det er den store tabellen med hull vi hasher inn i.", normal: "Det er indices som har N plasser og hull.", teknisk: "entries har bare n plasser." },
      { code: "i ← h(k, N)", indent: 1, eli5: "Finn hjemmeplassen i den store tabellen med hull.", normal: "Hjemmeplass i indices.", teknisk: "" },
      { code: "while indices[i] ≠ null do", indent: 1, eli5: "Så lenge det står et tall her …", normal: "Linear probing i indices.", teknisk: "" },
      { code: "e ← entries[indices[i]]", indent: 2, eli5: "Tallet sier hvor i lista paret ligger.", normal: "Følg indeksen til paret i entries.", teknisk: "Ett ekstra oppslag, O(1)." },
      { code: "if e.key = k then", indent: 2, eli5: "Er dette nøkkelen vi leter etter, og ikke bare en annen som havnet på samme sted?", normal: "Sammenlign nøkkelen i entries.", teknisk: "" },
      { code: "return e.value", indent: 3, eli5: "Funnet! Vi gir tilbake verdien som hører til nøkkelen.", normal: "Funnet.", teknisk: "" },
      { code: "i ← (i + 1) mod N", indent: 2, eli5: "Ikke den rette. Vi går videre til neste plass i den store tabellen med hull.", normal: "Neste plass i indices.", teknisk: "", grense: MODN },
      { code: "return null", indent: 1, eli5: "Vi kom til en tom plass i den store tabellen. Hadde nøkkelen vært her, ville vi ha møtt den før dette. Den finnes ikke.", normal: "Ledig plass i indices: k finnes ikke.", teknisk: "" }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet", worst: "O(n)", space: "O(1) ekstra",
      why: t("Som vanlig Linear probing, med en ekstra titt i lista.", "Samme probing som før. Hvert steg koster ett ekstra arrayoppslag.", "Forventet O(1), verste tilfelle O(n).") }
  });

  reg(IN.algos, "hsPyInsert", {
    title: "Ordbok med indices og entries: innsetting", name: "DictInsert", params: "k, v",
    input: "Nøkkel k og verdi v", output: "(k, v) ligger i entries, og indices peker på det",
    lines: [
      { code: "N ← |indices|", indent: 1, eli5: "Vi hasher inn i den store tabellen.", normal: "Probing skjer i indices.", teknisk: "" },
      { code: "i ← h(k, N)", indent: 1, eli5: "Finn hjemmeplassen i den store tabellen med hull.", normal: "Hjemmeplass i indices.", teknisk: "" },
      { code: "while indices[i] ≠ null do", indent: 1, eli5: "Så lenge plassen er opptatt …", normal: "Linear probing.", teknisk: "" },
      { code: "e ← entries[indices[i]]", indent: 2, eli5: "Se hvilket par plassen peker på.", normal: "Følg indeksen.", teknisk: "" },
      { code: "if e.key = k then", indent: 2, eli5: "Er det samme nøkkel? Da skal vi bare bytte verdien.", normal: "Finnes k fra før?", teknisk: "" },
      { code: "entries[indices[i]] ← (k, v)", indent: 3, eli5: "Bytt verdien der den står i lista.", normal: "Overskriv i entries. Rekkefølgen beholdes.", teknisk: "indices endres ikke." },
      { code: "return", indent: 3, eli5: "Ferdig! Verdien er byttet, og paret står på samme plass i lista.", normal: "Ferdig.", teknisk: "" },
      { code: "i ← (i + 1) mod N", indent: 2, eli5: "Ikke den rette. Vi går videre til neste plass i den store tabellen.", normal: "Neste plass i indices.", teknisk: "", grense: MODN },
      { code: "indices[i] ← |entries|", indent: 1, eli5: "Skriv ned hvor i lista det nye paret kommer til å ligge.", normal: "Den ledige plassen i indices får indeksen til det nye paret.", teknisk: "",
        grense: { q: "Hvorfor |entries| og ikke |entries| − 1?", a: t(
          "Lista teller fra 0. Har den 3 par (0, 1, 2), får det nye paret nummer 3.",
          "Vi skriver indeksen før vi legger til paret. entries er 0-indeksert, så neste ledige indeks er nettopp |entries|.",
          "Før append er |entries| = n, og det nye paret havner på indeks n. Bytter du rekkefølgen på de to siste linjene, må du skrive |entries| − 1.") } },
      { code: "append (k, v) to entries", indent: 1, eli5: "Legg paret bakerst i lista.", normal: "Legg paret bakerst i entries.",
        teknisk: "Derfor husker ordboka innsettingsrekkefølgen, og entries er tettpakket." }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet amortisert", worst: "O(n)", space: "O(N + n)",
      why: t("Som regel er plassen ledig eller nesten ledig. Står mange på rad, må vi gå forbi alle. Til slutt legger vi paret bakerst i lista.", "Probing i indices pluss en append. Med rehash: forventet amortisert O(1).",
        "Append i et dynamisk array er amortisert O(1). Probingen er forventet O(1). Rehash bygger bare indices på nytt.") }
  });

  /* ---------- Telling ---------- */
  reg(IN.algos, "hsMostFrequent", {
    title: "Flest forekomster med hashmap", name: "MostFrequent", params: "A",
    input: "Et array A med n ≥ 1 elementer", output: "Et element som forekommer flest ganger",
    lines: [
      { code: "F ← empty hashmap", indent: 1, eli5: "Vi lager en tom telleliste. Der skriver vi ned hvor mange vi har sett av hvert tall.", normal: "F teller hvor mange ganger hvert element er sett.", teknisk: "Frekvenstabell: element ↦ antall." },
      { code: "m ← A[0]", indent: 1, eli5: "Gjett at det første er vinneren.", normal: "Foreløpig beste.", teknisk: "Første iterasjon teller A[0], så F.get(m) er definert når vi sammenligner." },
      { code: "for x in A do", indent: 1, eli5: "Se på hvert element én gang.", normal: "Én gjennomgang.", teknisk: "n iterasjoner." },
      { code: "if F.get(x) = null then", indent: 2, eli5: "Er dette første gang vi ser dette tallet?", normal: "Ny nøkkel?", teknisk: "" },
      { code: "F.put(x, 0)", indent: 3, eli5: "Da skriver vi tallet opp på lista, med null streker.", normal: "Start telleren på 0.", teknisk: "" },
      { code: "F.put(x, F.get(x) + 1)", indent: 2, eli5: "Sett én strek til ved tallet.", normal: "Øk telleren.", teknisk: "To forventet O(1)-operasjoner." },
      { code: "if F.get(x) > F.get(m) then", indent: 2, eli5: "Har denne nå flere enn vinneren?", normal: "Er x nå hyppigere enn m?", teknisk: "" },
      { code: "m ← x", indent: 3, eli5: "Ny vinner! Nå har dette tallet flest streker.", normal: "Ny beste.", teknisk: "" },
      { code: "return m", indent: 1, eli5: "Tallet med flest streker er vinneren.", normal: "Ferdig.", teknisk: "" }
    ],
    bigO: { best: "O(n)", avg: "O(n) forventet", worst: "O(n²)", space: "O(n)",
      why: t("Vi ser på hvert tall én gang, og hver titt i tellelista er vanligvis rask.",
        "n hashmap-operasjoner, hver forventet O(1). Med svært mange kollisjoner kan hver bli O(n).",
        "n · O(1) forventet = O(n). Verste tilfelle n · O(n) = O(n²). Et telle-array i stedet gir O(n + k), der k er største verdi.") }
  });

  reg(IN.algos, "hsSubanagram", {
    title: "Subanagram med frekvenstabeller", name: "IsSubanagramOf2", params: "W, S",
    input: "Strenger W og S", output: "true hvis W kan skrives med bokstavene i S (uten gjenbruk)",
    lines: [
      { code: "F ← FreqTable(W)", indent: 1, eli5: "Tell bokstavene i ordet.", normal: "Antall av hver bokstav i W.", teknisk: "O(w)." },
      { code: "G ← FreqTable(S)", indent: 1, eli5: "Tell bokstavene du har.", normal: "Antall av hver bokstav i S.", teknisk: "O(s)." },
      { code: "for c in W do", indent: 1, eli5: "For hver bokstav i ordet …", normal: "Sjekk hver bokstav i W.", teknisk: "w iterasjoner." },
      { code: "if F.get(c) > G.get(c) then", indent: 2, eli5: "… trenger ordet flere av den enn du har?", normal: "Trenger W flere c-er enn S har?",
        teknisk: "get gir 0 for bokstaver som ikke finnes. Snur du > eller bytter W og S, blir svaret feil." },
      { code: "return false", indent: 3, eli5: "Da går det ikke: vi har for få av den bokstaven.", normal: "W er ikke et subanagram.", teknisk: "" },
      { code: "return true", indent: 1, eli5: "Alle bokstavene holder!", normal: "Alle bokstavene finnes i nok antall.", teknisk: "Totalt O(w + s)." }
    ],
    bigO: { best: "O(w + s)", avg: "O(w + s)", worst: "O(w + s)", space: "O(w + s)",
      why: t("Vi teller hvert ord én gang og sjekker hver bokstav én gang.", "To lineære tellinger og én lineær løkke, med O(1) get.",
        "Oppgaven lot get/put være O(1). Med vanlig hashing er det forventet O(1), og O(w + s) forventet.") }
  });

  /* ================================================================
     GENERATORER
     ================================================================ */

  /* ---------- Linear probing: insert / get / delete ----------
     input: [{ N, ops:[{op:"ins"|"get"|"del", k, v}], mode:"fill"|"mark", fixed }] */
  reg(IN.gen, "hsProbeOps", function (input) {
    var cfg = cfgOf(input), N = cfg.N || 10, mark = cfg.mode === "mark", fixed = cfg.fixed;
    var A = emptyArr(N), steps = [];
    function h(k) { return hash(k, N, fixed); }
    function counts() { var n = 0, m = 0; A.forEach(function (c) { if (c) { if (c.tomb) m++; else n++; } }); return { n: n, m: m }; }
    function info(extra) {
      var c = counts(), out = [];
      if (extra) out.push(extra);
      out.push({ label: "Load factor", html: "n/N = " + c.n + "/" + N + " = " + fmt(c.n / N) });
      if (mark) out.push({ label: "Merker", html: String(c.m) });
      return out;
    }
    function snap(line, marks, text, tag, extra) {
      steps.push({ line: line, parts: [{ type: "probe", N: N, cells: cloneCells(A), marks: marks || {}, clusters: true }], info: info(extra), text: text, tag: tag });
    }
    function key(c) { return c && !c.tomb ? c.k : null; }
    function nextText(i, ni) {
      var wrapTxt = ni === 0 && i === N - 1;
      return t("Vi prøver neste plass" + (wrapTxt ? ". Etter siste plass går vi rundt til plass 0." : ", plass " + ni + "."),
        "i ← (" + i + " + 1) mod " + N + " = " + ni + (wrapTxt ? ". Vi går rundt til starten av arrayet." : "."),
        "i ← (" + i + " + 1) mod " + N + " = " + ni + (wrapTxt ? " (rundt enden)." : "."));
    }

    snap(null, {}, t("Et tomt array med " + N + " plasser. «_» er en ledig plass.",
      "Tomt array, N = " + N + ". Hashfunksjon: " + (fixed ? "fast hashverdi per nøkkel" : "h(k, N) = k mod N for tall") + ".",
      "Tomt array, N = " + N + ". Alle plasser er null." + (mark ? " Slettet-merker vises som ×." : "")), "Start");

    (cfg.ops || []).forEach(function (o) {
      var k = o.k, i = h(k), home = i, seen = [], g = 0, hx = { label: "h", html: hText(k, N, fixed) };
      var c = counts();
      if (o.op === "ins") {
        var L = 100;
        if (c.n + c.m >= N && !A.some(function (x) { return x && !x.tomb && x.k === k; })) {
          snap(null, {}, t("Tabellen er full! Da må den gjøres større først.", "Arrayet er fullt. Uten rehash finnes det ingen ledig plass, og løkka ville gått i ring.",
            "Fullt array: n = N. I praksis rehasher vi lenge før dette (Load factor ≥ 0,75)."), "Fullt"); return;
        }
        snap(L + 2, { home: i, cur: i }, t("Nøkkelen " + show(k) + " hører hjemme på plass " + i + ".",
          hText(k, N, fixed) + ". Vi starter på plass " + i + ".", hText(k, N, fixed) + ". Start på i = " + i + "."), "Sett inn " + show(k), hx);
        if (!mark) {
          while (A[i] != null && g++ < N) {
            if (A[i].k === k) {
              snap(L + 5, { home: home, found: i, occ: seen }, t("Her ligger " + show(k) + " allerede. Vi bytter bare ut verdien.",
                "A[" + i + "] har samme nøkkel. Løkka stopper, og paret skal overskrives.", "A[" + i + "].key = k: break. Paret overskrives, og n endres ikke."), "Samme nøkkel", hx);
              break;
            }
            snap(L + 4, { home: home, cur: i, occ: seen }, t("Plass " + i + " er opptatt av " + show(A[i].k) + ".",
              "A[" + i + "] er opptatt av " + show(A[i].k) + " ≠ " + show(k) + ". Kollisjon.", "A[" + i + "].key = " + show(A[i].k) + " ≠ " + show(k) + ". Kollisjon."), "Kollisjon", hx);
            seen.push(i); var ni = (i + 1) % N;
            snap(L + 6, { home: home, cur: ni, occ: seen }, nextText(i, ni), "Neste plass", hx);
            i = ni;
          }
          var isNew = A[i] == null;
          A[i] = { k: k, v: o.v };
          snap(L + 7, { home: home, fresh: i, occ: seen }, isNew
            ? t(show(k) + " legges på plass " + i + ".", "A[" + i + "] er null, så løkka stopper. " + show(k) + " settes inn på plass " + i + (i !== home ? ", " + seen.length + " steg fra hjemmeplassen " + home : ", rett på hjemmeplassen") + ".",
                "A[" + i + "] = null: løkka stopper etter " + tries(seen.length + 1) + ". Sett inn.")
            : t("Verdien er byttet ut.", "Paret på plass " + i + " er overskrevet.", "Overskrevet. Ingen duplikat."), isNew ? "Satt inn" : "Overskrevet", hx);
        } else {
          var p = null;
          snap(L + 3, { home: home, cur: i }, t("Vi har ikke sett noe merke ennå.", "p ← null. p skal huske første slettet-merke.", "p ← null."), "Sett inn " + show(k), hx);
          var done = false;
          while (A[i] != null && g++ < N) {
            if (A[i].tomb) {
              if (p === null) { p = i; snap(L + 6, { home: home, cur: i, occ: seen, hole: p }, t("Plass " + i + " er merket som slettet. Vi husker den, men leter videre i tilfelle " + show(k) + " finnes lenger ut.",
                "A[" + i + "] = DELETED. p ← " + i + ". Vi må fortsatt sjekke resten av segmentet for k.", "p ← " + i + ". Fortsett til null for å utelukke duplikat."), "Husk merket", hx); }
              else snap(L + 5, { home: home, cur: i, occ: seen, hole: p }, t("Enda et merke. Vi har allerede husket et.", "A[" + i + "] = DELETED, men p er allerede satt.", "p beholdes."), "Merke", hx);
            } else if (A[i].k === k) {
              A[i] = { k: k, v: o.v };
              snap(L + 8, { home: home, found: i, occ: seen }, t("Her ligger " + show(k) + " allerede. Vi bytter verdien.", "A[" + i + "].key = k: overskriv.", "Overskrevet."), "Overskrevet", hx);
              done = true; break;
            } else snap(L + 7, { home: home, cur: i, occ: seen, hole: p }, t("Plass " + i + " er opptatt av " + show(A[i].k) + ".", "A[" + i + "] har " + show(A[i].k) + " ≠ " + show(k) + ".", "Kollisjon."), "Kollisjon", hx);
            seen.push(i); var nj = (i + 1) % N;
            snap(L + 10, { home: home, cur: nj, occ: seen, hole: p }, nextText(i, nj), "Neste plass", hx);
            i = nj;
          }
          if (!done) {
            if (p !== null) { snap(L + 11, { home: home, cur: p, occ: seen }, t("Vi traff en tom plass, så " + show(k) + " finnes ikke. Vi bruker merket vi husket.", "A[" + i + "] = null: k finnes ikke. i ← p = " + p + ".", "Gjenbruk merket på " + p + "."), "Gjenbruk merke", hx); i = p; }
            A[i] = { k: k, v: o.v };
            snap(L + 12, { home: home, fresh: i, occ: seen }, t(show(k) + " legges på plass " + i + ".", "Sett inn på plass " + i + ".", "Sett inn."), "Satt inn", hx);
          }
        }
      } else if (o.op === "get") {
        var Lg = 200;
        snap(Lg + 2, { home: i, cur: i }, t("Vi leter etter " + show(k) + ". Vi starter der den hører hjemme, på plass " + i + ".",
          hText(k, N, fixed) + ". Start på plass " + i + ".", hText(k, N, fixed) + "."), "Søk " + show(k), hx);
        var hit = false;
        while (A[i] != null && g++ < N) {
          if (!A[i].tomb && A[i].k === k) {
            snap(Lg + 5, { home: home, found: i, occ: seen }, t("Funnet på plass " + i + "!", "A[" + i + "].key = " + show(k) + ". Funnet etter " + tries(seen.length + 1) + ".", "Vellykket oppslag."), "Funnet", hx);
            hit = true; break;
          }
          var why = A[i].tomb ? t("Plass " + i + " er merket som slettet. Vi går forbi.", "A[" + i + "] = DELETED: ikke null, så vi leter videre.", "Merket stopper ikke søket.")
            : t("Plass " + i + " har " + show(A[i].k) + ", ikke " + show(k) + ".", "A[" + i + "].key = " + show(A[i].k) + " ≠ " + show(k) + ".", "Ikke lik, fortsett.");
          snap(Lg + 4, { home: home, cur: i, occ: seen }, why, "Ikke her", hx);
          seen.push(i); var nk = (i + 1) % N;
          snap(Lg + 6, { home: home, cur: nk, occ: seen }, nextText(i, nk), "Neste plass", hx);
          i = nk;
        }
        if (!hit) snap(Lg + 7, { home: home, miss: i, occ: seen }, t("Plass " + i + " er tom. Var " + show(k) + " her, ville den ligget før denne tomme plassen. Den finnes ikke.",
          "A[" + i + "] = null: k finnes ikke. Returner null.", "Mislykket oppslag etter " + tries(seen.length + 1) + "."), "Ikke funnet", hx);
      } else if (o.op === "del") {
        var Ld = 300;
        if (mark) {
          snap(Ld + 2, { home: i, cur: i }, t("Vi skal slette " + show(k) + ". Først må vi finne den.", hText(k, N, fixed) + ".", hText(k, N, fixed) + "."), "Slett " + show(k), hx);
          var got = false;
          while (A[i] != null && g++ < N) {
            if (!A[i].tomb && A[i].k === k) {
              A[i] = { tomb: true };
              snap(Ld + 5, { home: home, hole: i, occ: seen }, t("Funnet! Vi tømmer ikke plassen, men setter en lapp på den: «slettet».",
                "A[" + i + "] ← DELETED. Plassen er ikke null, så oppslag går forbi den.", "Merket. Ingen flytting. Merket blir liggende til neste rehash."), "Merket", hx);
              got = true; break;
            }
            snap(Ld + 4, { home: home, cur: i, occ: seen }, t("Ikke her.", A[i].tomb ? "Et merke, gå videre." : "A[" + i + "] har " + show(A[i].k) + ".", "Fortsett."), "Ikke her", hx);
            seen.push(i); var nm = (i + 1) % N;
            snap(Ld + 7, { home: home, cur: nm, occ: seen }, nextText(i, nm), "Neste plass", hx);
            i = nm;
          }
          if (!got) snap(null, { home: home, miss: i, occ: seen }, t("Tom plass: " + show(k) + " finnes ikke.", "A[" + i + "] = null: ingenting å slette.", "Løkka er ferdig uten treff."), "Ikke funnet", hx);
          return;
        }
        snap(Ld + 2, { home: i, cur: i }, t("Vi skal slette " + show(k) + ". Først må vi finne den.", hText(k, N, fixed) + ". Let som ved oppslag.", hText(k, N, fixed) + "."), "Slett " + show(k), hx);
        while (A[i] != null && A[i].k !== k && g++ < N) {
          seen.push(i); var nd = (i + 1) % N;
          snap(Ld + 4, { home: home, cur: nd, occ: seen }, t("Plass " + i + " har " + show(A[i].k) + ". Videre til plass " + nd + ".",
            "A[" + i + "].key = " + show(A[i].k) + " ≠ " + show(k) + ". i ← " + nd + ".", "i ← (" + i + " + 1) mod " + N + " = " + nd + "."), "Let", hx);
          i = nd;
        }
        if (A[i] == null) { snap(Ld + 6, { home: home, miss: i, occ: seen }, t("Tom plass: " + show(k) + " finnes ikke.", "A[" + i + "] = null: ingenting å slette.", "Ingenting å gjøre."), "Ikke funnet", hx); return; }
        A[i] = null;
        snap(Ld + 7, { hole: i }, t("Funnet på plass " + i + ". Vi tar den bort. Nå er det et hull der.",
          "A[" + i + "] ← null. Hullet kan gjøre nøkler lenger ut i segmentet usynlige for oppslag, så det må tettes.",
          "A[" + i + "] ← null. Nå tetter vi hullet."), "Fjernet", hx);
        var j = (i + 1) % N;
        snap(Ld + 8, { hole: i, cur: j }, t("Vi ser på dem som står etter hullet.", "j ← " + j + ".", "j ← (" + i + " + 1) mod " + N + " = " + j + "."), "Tett hullet");
        var gg = 0;
        while (A[j] != null && gg++ < N) {
          var hk = h(A[j].k), stays = inCyc(hk, i, j, N), iv = cycList(i, j, N).join(", ");
          var hj = { label: "h", html: hText(A[j].k, N, fixed) };
          if (!stays) {
            snap(Ld + 10, { hole: i, cur: j, home: hk }, t(show(A[j].k) + " hører hjemme på plass " + hk + ". For å komme hit gikk den forbi hullet, så den må flyttes inn i hullet.",
              "h(" + show(A[j].k) + ") = " + hk + " ligger ikke i (" + i + ", " + j + "] = {" + iv + "}. Proben fra " + hk + " passerer hullet " + i + ", så nøkkelen må flyttes.",
              hk + " ∉ (" + i + ", " + j + "] = {" + iv + "}: flytt."), "Må flyttes", hj);
            A[i] = A[j]; A[j] = null;
            snap(Ld + 13, { moved: [i], hole: j }, t("Flyttet til plass " + i + ". Nå er hullet på plass " + j + ".",
              "A[" + i + "] ← A[" + j + "], A[" + j + "] ← null, i ← " + j + ". Det nye hullet må også tettes.", "Flyttet. Nytt hull i = " + j + "."), "Flyttet", hj);
            i = j;
          } else {
            snap(Ld + 10, { hole: i, cur: j, home: hk }, t(show(A[j].k) + " hører hjemme på plass " + hk + ". Den har ikke gått forbi hullet, så den kan bli stående.",
              "h(" + show(A[j].k) + ") = " + hk + " ligger i (" + i + ", " + j + "] = {" + iv + "}. Den nås uten å passere hullet, så den blir stående.",
              hk + " ∈ (" + i + ", " + j + "]: bli."), "Blir stående", hj);
          }
          var nj2 = (j + 1) % N;
          snap(Ld + 14, { hole: i, cur: nj2 }, t("Neste plass.", "j ← " + nj2 + ".", "j ← (" + j + " + 1) mod " + N + " = " + nj2 + "."), "Neste");
          j = nj2;
        }
        snap(Ld + 9, { cur: j }, t("Tom plass: ingen lenger ut kan ha gått forbi hullet. Ferdig!",
          "A[" + j + "] = null: segmentet er slutt. Alle gjenværende nøkler kan nås fra hjemmeplassen sin.",
          "Invarianten er gjenopprettet: ingen nøkkel har et hull mellom hjemmeplassen og plassen sin."), "Ferdig");
      }
    });
    var cc = counts();
    snap(null, {}, t("Ferdig! Hver nøkkel står på hjemmeplassen sin eller litt etter.",
      "Ferdig. Load factor er " + cc.n + "/" + N + ". Understreking viser segmenter av opptatte plasser uten hull.",
      "Ferdig. Lange segmenter uten hull (clustering) gir lengre probing for nøkler som hasher inn i dem."), "Ferdig");
    return steps;
  });

  /* ---------- Separate chaining: insert / get ----------
     input: [{ N, ops:[{op:"ins"|"get", k, v}] }] */
  reg(IN.gen, "hsChainOps", function (input) {
    var cfg = cfgOf(input), N = cfg.N || 10, fixed = cfg.fixed;
    var A = emptyArr(N), steps = [], n = 0;
    function rows() { return A.map(function (B) { return B ? B.map(function (o) { return { k: o.k, v: o.v }; }) : null; }); }
    function snap(line, marks, text, tag, extra) {
      var inf = []; if (extra) inf.push(extra);
      inf.push({ label: "Load factor", html: "n/N = " + n + "/" + N + " = " + fmt(n / N) });
      steps.push({ line: line, parts: [{ type: "chain", N: N, rows: rows(), marks: marks || {} }], info: inf, text: text, tag: tag });
    }
    snap(null, {}, t("Et tomt array med " + N + " plasser. Hver plass kan få sin egen bøtte (en liste).",
      "Tomt array, N = " + N + ". Alle plasser er null: bøttene lages først når noe hasher dit.", "N = " + N + ", alle plasser null."), "Start");
    (cfg.ops || []).forEach(function (o) {
      var k = o.k, i = hash(k, N, fixed), hx = { label: "h", html: hText(k, N, fixed) }, B = A[i], seen = [];
      if (o.op === "ins") {
        var L = 100, item = pv(o);
        snap(L + 2, { row: i }, t(item + " hører hjemme i bøtte " + i + ".", hText(k, N, fixed) + ".", hText(k, N, fixed) + "."), "Sett inn " + item, hx);
        if (!B) {
          A[i] = [{ k: k, v: o.v }]; n++;
          snap(L + 5, { row: i, fresh: [i, 0] }, t("Det fantes ingen bøtte her, så vi lager en ny med " + item + " i.",
            "A[" + i + "] = null: lag en ny liste som inneholder " + item + ".", "Ny bøtte på plass " + i + "."), "Ny bøtte", hx);
          return;
        }
        for (var j = 0; j < B.length; j++) {
          if (B[j].k === k) {
            var old = pv(B[j]); B[j] = { k: k, v: o.v };
            snap(L + 9, { row: i, repl: [i, j], seen: seen.slice() }, t("Nøkkelen " + show(k) + " lå der fra før. Vi bytter " + old + " med " + item + ".",
              "B[" + j + "].key = " + show(k) + ": overskriv " + old + " med " + item + ". Ingen duplikat.", "Overskrevet på plass " + j + " i bøtta. n endres ikke."), "Overskrevet", hx);
            return;
          }
          snap(L + 8, { row: i, cur: [i, j], seen: seen.slice() }, t("Er " + pv(B[j]) + " samme nøkkel? Nei.", "B[" + j + "].key = " + show(B[j].k) + " ≠ " + show(k) + ".", "Ikke lik."), "Sammenlign", hx);
          seen.push([i, j]);
        }
        B.push({ k: k, v: o.v }); n++;
        snap(L + 11, { row: i, fresh: [i, B.length - 1], seen: seen }, t("Nøkkelen fantes ikke i bøtta, så " + item + " legges bakerst.",
          "Hele bøtta er sjekket uten treff: append " + item + ". Det er en kollisjon, men den løses ved at begge ligger i samme bøtte.", "Append, O(1)."), "Lagt bakerst", hx);
      } else if (o.op === "get") {
        var Lg = 200;
        snap(Lg + 2, { row: i }, t("Vi leter etter " + show(k) + " i bøtte " + i + ".", hText(k, N, fixed) + ".", hText(k, N, fixed) + "."), "Søk " + show(k), hx);
        if (!B) { snap(Lg + 5, { miss: i }, t("Ingen bøtte her, så " + show(k) + " finnes ikke.", "A[" + i + "] = null: returner null.", "Mislykket oppslag i O(1)."), "Ikke funnet", hx); return; }
        for (var q = 0; q < B.length; q++) {
          if (B[q].k === k) { snap(Lg + 8, { row: i, found: [i, q], seen: seen.slice() }, t("Funnet: " + pv(B[q]) + ".", "B[" + q + "].key = " + show(k) + ": returner " + (B[q].v != null ? B[q].v : "verdien") + ".", "Funnet etter " + (q + 1) + (q === 0 ? " sammenligning" : " sammenligninger") + " i bøtta."), "Funnet", hx); return; }
          snap(Lg + 7, { row: i, cur: [i, q], seen: seen.slice() }, t("Ikke denne.", "B[" + q + "].key = " + show(B[q].k) + " ≠ " + show(k) + ".", "Ikke lik."), "Sammenlign", hx);
          seen.push([i, q]);
        }
        snap(Lg + 9, { row: i, miss: i, seen: seen }, t("Vi lette i hele bøtta. " + show(k) + " finnes ikke.", "Hele bøtta er sjekket: returner null.", "Mislykket oppslag, O(1 + |B|)."), "Ikke funnet", hx);
      }
    });
    snap(null, {}, t("Ferdig! Nøkler som kolliderer, deler bøtte.",
      "Ferdig. n = " + n + " par i " + A.filter(Boolean).length + " bøtter. Load factor kan bli større enn 1 med Separate chaining.",
      "Ferdig. Forventet bøttelengde er n/N = " + fmt(n / N) + "."), "Ferdig");
    return steps;
  });

  /* ---------- Rehash (Linear probing, start N, grense 0,75) ----------
     input: [{ N, keys:[…] }] */
  reg(IN.gen, "hsRehashOps", function (input) {
    var cfg = cfgOf(input), N = cfg.N || 1, keys = cfg.keys || (cfg.ops || []).filter(function (o) { return o.op === "ins"; }).map(function (o) { return o.k; });
    var A = emptyArr(N), n = 0, steps = [], cost = 0, total = 0;
    function snap(line, marks, text, tag, extraParts, extra) {
      var parts = (extraParts || []).concat([{ type: "probe", label: extraParts ? "A (nytt, N = " + N + ")" : "A (N = " + N + ")", N: N, cells: cloneCells(A), marks: marks || {} }]);
      var inf = []; if (extra) inf.push(extra);
      inf.push({ label: "Load factor", html: "n/N = " + n + "/" + N + " = " + fmt(n / N) });
      inf.push({ label: "Arbeid", html: total + " skrivinger totalt (innsettinger og flytt)" });
      steps.push({ line: line, parts: parts, info: inf, text: text, tag: tag });
    }
    function place(B, k) { var i = hash(k, B.length); while (B[i] != null) i = (i + 1) % B.length; B[i] = { k: k }; return i; }
    snap(null, {}, t("Vi starter med en bitteliten tabell med " + N + " plass" + (N > 1 ? "er" : "") + ".", "Start: N = " + N + ", n = 0. Før hver innsetting sjekker vi om n/N ≥ 0,75.", "Grense 0,75, dobling ved rehash."), "Start");
    keys.forEach(function (k) {
      var lfTxt = n + "/" + N + " = " + fmt(n / N);
      if (n / N >= 0.75) {
        snap(102, {}, t("Tabellen er for full (" + lfTxt + "). Vi må lage en større.", "n/N = " + lfTxt + " ≥ 0,75: rehash før vi setter inn " + show(k) + ".", "Rehash utløses."), "Rehash!");
        var B = A, oldN = N; N = 2 * N; A = emptyArr(N); n = 0;
        var bPart = function (mk) { return [{ type: "probe", label: "B (gammelt, N = " + oldN + ")", N: oldN, cells: cloneCells(B), marks: mk || {} }]; };
        snap(204, {}, t("En ny, tom tabell som er dobbelt så stor: " + N + " plasser.", "N ← 2 · " + oldN + " = " + N + ". Nytt array med bare null.", "N ← " + N + "."), "Dobling", bPart());
        for (var j = 0; j < B.length; j++) {
          if (!B[j]) continue;
          var nk = B[j].k, to = place(A, nk); n++; total++;
          snap(208, { fresh: to }, t(show(nk) + " flyttes over. Den havner på plass " + to + ".",
            "Sett inn " + show(nk) + " på nytt: " + hText(nk, N) + (hash(nk, N) !== to ? ", probet videre til " + to : "") + ". Med ny N kan plassen bli en annen enn før.",
            hText(nk, N) + " → plass " + to + "."), "Flytt " + show(nk), bPart({ cur: j }));
        }
      }
      var i = hash(k, N), home = i, seen = [];
      snap(104, { home: i, cur: i }, t(show(k) + " hører hjemme på plass " + i + ".", hText(k, N) + ".", hText(k, N) + "."), "Sett inn " + show(k), null, { label: "h", html: hText(k, N) });
      var dup = false;
      while (A[i] != null) {
        if (A[i].k === k) { dup = true; break; }
        seen.push(i); i = (i + 1) % N;
      }
      if (dup) { snap(107, { home: home, found: i, occ: seen }, t("Nøkkelen fantes, så vi bytter bare verdien.", "Samme nøkkel: overskriv. n endres ikke.", "Overskrevet."), "Overskrevet"); return; }
      A[i] = { k: k }; n++; total++;
      snap(111, { home: home, fresh: i, occ: seen }, t(show(k) + " legges på plass " + i + ".", "Satt inn på plass " + i + (seen.length ? " etter " + seen.length + " kollisjon" + (seen.length > 1 ? "er" : "") : "") + ". n ← " + n + ".", "n ← " + n + "."), "Satt inn");
    });
    snap(null, {}, t("Ferdig! Selv om vi flyttet alt noen ganger, ble det ikke så mye arbeid til sammen.",
      "Ferdig: " + keys.length + " innsettinger og " + (total - keys.length) + " flytt ved rehash. Fordi N dobles hver gang, blir flyttene til sammen O(n), ikke O(n²).",
      "Totalt arbeid " + total + " for " + keys.length + " innsettinger: amortisert O(1) per innsetting."), "Ferdig");
    return steps;
  });

  /* ---------- Python 3.6-ordbok: insert / get / rehash ----------
     input: [{ N, ops:[{op:"ins"|"get"|"rehash", k, v}], fixed }] */
  reg(IN.gen, "hsPyOps", function (input) {
    var cfg = cfgOf(input), N = cfg.N || 8, fixed = cfg.fixed, idx = emptyArr(N), ent = [], steps = [];
    function oldLayout() { var a = emptyArr(N); ent.forEach(function (e) { var i = hash(e.k, N, fixed); while (a[i]) i = (i + 1) % N; a[i] = { k: show(e.k), v: e.v }; }); return a; }
    function snap(line, mi, me, text, tag, extra) {
      var cells = idx.map(function (x) { return x == null ? null : { ref: x }; });
      var inf = []; if (extra) inf.push(extra);
      inf.push({ label: "Load factor", html: "n/N = " + ent.length + "/" + N + " = " + fmt(ent.length / N) });
      steps.push({ line: line, parts: [
        { type: "probe", label: "indices (N = " + N + ")", N: N, cells: cells, marks: mi || {} },
        { type: "entries", label: "entries (n = " + ent.length + ", i innsettingsrekkefølge)", items: ent.map(function (e) { return { k: show(e.k), v: e.v }; }), marks: me || {} },
        { type: "probe", label: "Til sammenligning, før 3.6: entries med N = " + N + " plasser (samme hashverdier)", N: N, cells: oldLayout(), marks: {}, dim: true }
      ], info: inf, text: text, tag: tag });
    }
    snap(null, {}, t("To lister: en stor med hull (indices) og en tett liste med parene (entries).",
      "indices har N = " + N + " plasser og brukes til Linear probing. entries er tettpakket.", "indices: N plasser med null eller en indeks. entries: n par."), "Start");
    (cfg.ops || []).forEach(function (o) {
      if (o.op === "rehash") {
        var oldN = N; N = 2 * N; idx = emptyArr(N);
        ent.forEach(function (e, j) { var i = hash(e.k, N, fixed); while (idx[i] != null) i = (i + 1) % N; idx[i] = j; });
        snap(null, {}, t("Rehash: bare den store lista med hull blir større. Parene i entries flyttes ikke.",
          "indices dobles fra " + oldN + " til " + N + ", og hver indeks j i entries settes inn på nytt med h(entries[j].key, " + N + "). entries er uendret.",
          "Rehash i den nye strukturen: entries uendret (rekkefølgen beholdes), bare indices bygges på nytt. Vi går gjennom n par, ikke N plasser."), "Rehash");
        return;
      }
      var k = o.k, i = hash(k, N, fixed), home = i, seen = [], hx = { label: "h", html: hText(k, N, fixed) };
      var L = o.op === "get" ? 100 : 200;
      snap(L + 3, { home: i, cur: i }, t(show(k) + " hører hjemme på plass " + i + " i indices.", hText(k, N, fixed) + ".", hText(k, N, fixed) + "."), (o.op === "get" ? "Søk " : "Sett inn ") + show(k), hx);
      var g = 0;
      while (idx[i] != null && g++ < N) {
        var e = ent[idx[i]];
        if (e.k === k) {
          if (o.op === "get") { snap(L + 7, { home: home, found: i, occ: seen }, { found: idx[i] }, t("Funnet: " + pv({ k: k, v: e.v }) + ".", "indices[" + i + "] = " + idx[i] + ", og entries[" + idx[i] + "] har nøkkelen. Returner " + e.v + ".", "Funnet."), "Funnet", hx); }
          else { var at = idx[i]; ent[at] = { k: k, v: o.v }; snap(L + 7, { home: home, found: i, occ: seen }, { repl: at }, t("Nøkkelen fantes. Vi bytter verdien der den står i lista.", "entries[" + at + "] ← " + pv(o) + ". indices og rekkefølgen er uendret.", "Overskrevet."), "Overskrevet", hx); }
          return;
        }
        snap(L + 5, { home: home, cur: i, occ: seen }, { cur: idx[i] }, t("Plass " + i + " peker på " + pv({ k: e.k, v: e.v }) + ". Feil nøkkel.",
          "indices[" + i + "] = " + idx[i] + " → entries[" + idx[i] + "] har " + show(e.k) + " ≠ " + show(k) + ".", "Kollisjon."), "Kollisjon", hx);
        seen.push(i); i = (i + 1) % N;
      }
      if (o.op === "get") { snap(L + 9, { home: home, miss: i, occ: seen }, {}, t("Tom plass: " + show(k) + " finnes ikke.", "indices[" + i + "] = null: returner null.", "Mislykket oppslag."), "Ikke funnet", hx); return; }
      idx[i] = ent.length;
      snap(L + 10, { home: home, fresh: i, occ: seen }, {}, t("Plass " + i + " er ledig. Vi skriver ned at paret kommer til å ligge på plass " + ent.length + " i lista.",
        "indices[" + i + "] ← |entries| = " + ent.length + ".", "indices[" + i + "] ← " + ent.length + "."), "Indeks", hx);
      ent.push({ k: k, v: o.v });
      snap(L + 11, { home: home, fresh: i, occ: seen }, { fresh: ent.length - 1 }, t(pv(o) + " legges bakerst i entries.", "append " + pv(o) + " to entries. Innsettingsrekkefølgen er bevart.", "entries er fortsatt tettpakket."), "Lagt bakerst", hx);
    });
    snap(null, {}, t("Ferdig! Lista med par har ingen hull, og den husker rekkefølgen.",
      "Ferdig. Sammenlign med den gamle layouten: der har parene N plasser, her bare n.",
      "Iterasjon går gjennom entries (n steg) i innsettingsrekkefølge, i stedet for gjennom N plasser."), "Ferdig");
    return steps;
  });

  /* ---------- Flest forekomster ----------
     input: array med tall */
  reg(IN.gen, "hsMostFrequent", function (A) {
    var steps = [], F = {}, order = [];
    if (!A || !A.length) return [{ line: null, parts: [], text: t("Tomt array.", "Tomt array.", "Tomt array."), tag: "Tomt" }];
    var m = A[0], done = [];
    function pairs() { return order.map(function (x) { return [x, F[x]]; }); }
    function snap(line, cur, text, tag) {
      steps.push({ line: line, parts: [{ type: "arr", label: "A", items: A.slice(), marks: { cur: cur, done: done.slice() } },
        { type: "map", label: "F (hashmap: element ↦ antall)", pairs: pairs(), marks: { cur: cur != null ? A[cur] : null, best: m } }],
        info: [{ label: "m", html: String(m) + (F[m] != null ? " (" + F[m] + " ganger)" : "") }], text: text, tag: tag });
    }
    snap(3, null, t("Vi gjetter at det første tallet er vinneren.", "m ← A[0] = " + m + ".", "m ← " + m + "."), "Start");
    A.forEach(function (x, i) {
      if (F[x] == null) { F[x] = 0; order.push(x); snap(6, i, t("Vi har ikke sett " + x + " før. Telleren starter på 0.", "F.get(" + x + ") = null: F.put(" + x + ", 0).", "Ny nøkkel."), "Ny"); }
      F[x]++;
      var better = F[x] > F[m];
      snap(7, i, t("Vi teller " + x + ". Nå har vi sett den " + F[x] + " gang" + (F[x] > 1 ? "er" : "") + ".", "F.put(" + x + ", " + F[x] + ").", "F[" + x + "] = " + F[x] + "."), "Tell");
      if (better) { m = x; snap(9, i, t(x + " har nå flest!", "F.get(" + x + ") > F.get(m): m ← " + x + ".", "m ← " + x + "."), "Ny beste"); }
      done.push(i);
    });
    snap(10, null, t("Ferdig! " + m + " forekommer flest ganger: " + F[m] + ".", "Returner m = " + m + " (" + F[m] + " ganger).", "n iterasjoner, hver forventet O(1): O(n) forventet."), "Ferdig");
    return steps;
  });
})();
