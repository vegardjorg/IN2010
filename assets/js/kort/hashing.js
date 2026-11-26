/* ============================================================
   IN2010 guide · kort/hashing.js
   Eksamenskortene for Hashing (05-hashing.html): én definisjon per kort, lest av temasiden og crash.html.
   Oppgavetekstene står ordrett med kildelinje (som før). Fullpoengssvar og sensorveiledning
   ligger i perfekt/hashing.js (og perfekt/delt.js for oppgaver som deles med andre sider).
   Lastes etter perfekt/*.js. Se IN.kortData i core.js.
   ============================================================ */
(function () {
  "use strict";
  var IN = window.IN, qs = IN.qs, qsa = IN.qsa, el = IN.el, A = IN.algos, G = IN.gen, HS = IN.hs;
  var SIDE = "hashing";
  function def(key, meta, fn) { meta.side = SIDE; return IN.kortData.def(key, meta, fn); }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var LEGEND = [
    { cls: "compare", label: "Plassen vi ser på" },
    { cls: "tried", label: "Prøvd (kollisjon)" },
    { cls: "min", label: "Satt inn / flyttet" },
    { cls: "target", label: "Funnet" },
    { cls: "swap", label: "Hull / ikke funnet" }
  ];
  var PYFIX = { timmy: 13, barry: 9, guido: 7 };   // gir plass 5, 1 og 7 med N = 8, som i H2024
  function ins(keys) { return keys.map(function (k) { return { op: "ins", k: k }; }); }
  function insKV(pairs) { return pairs.map(function (p) { return { op: "ins", k: p[0], v: p[1] }; }); }
  // Siste tilstand fra en generator, som statisk figur
  function lastStep(gen, input) { var s = G[gen](input); return s[s.length - 1]; }
  function probeState(N, keys, fixed) { return lastStep("hsProbeOps", [{ N: N, ops: ins(keys), fixed: fixed }]).parts[0].cells; }
  function chainState(N, pairs) { return lastStep("hsChainOps", [{ N: N, ops: insKV(pairs) }]).parts[0].rows; }
  function probeFig(label, cells, marks, clusters) { return { parts: [{ type: "probe", label: label, N: cells.length, cells: cells, marks: marks || {}, clusters: !!clusters }] }; }
  function draw(sel, step) { var h = typeof sel === "string" ? qs(sel) : sel; IN.vizHash(h, step, { compact: true }); return h; }
  function hashFig(step, cap, cls) { return { cap: cap, cls: cls || "wide", draw: function (h) { IN.vizHash(h, step, { compact: true }); } }; }
  var CH25 = [[21, "a"], [54, "b"], [82, "c"], [10, "d"], [20, "e"], [44, "f"], [10, "g"]];
  var PY3 = [{ op: "ins", k: "timmy", v: "red" }, { op: "ins", k: "barry", v: "green" }, { op: "ins", k: "guido", v: "blue" }];
  function pyLast(ops, N) { return lastStep("hsPyOps", [{ N: N || 8, fixed: PYFIX, ops: ops }]); }

  /* ===================== EKSAMEN (ordrett med kildelinje, se plan/gjennomgang/wp0-format.md) ===================== */
  function sol(items, algos, o) {
    o = o || {};
    var d = el("div");
    if (o.intro) d.appendChild(el("p", { html: o.intro }));
    var ol = el(o.plain ? "ul" : "ol", o.plain ? {} : { class: "et-parts" }); items.forEach(function (x) { ol.appendChild(el("li", { html: x })); }); d.appendChild(ol);
    if (o.figs) d.appendChild(IN.oppg({ figs: o.figs }));
    (algos || []).forEach(function (key) {
      d.appendChild(el("h5", { style: "margin:.8rem 0 .3rem", text: "Pseudokode: " + A[key].name }));
      var h = el("div"); d.appendChild(h); IN.pseudo.render(h, A[key], {});
    });
    return d;
  }
  function L(code, indent) { return { code: code, indent: indent }; }
  // Tomt array 0–9 som i arket
  function emptyTab(n, label) {
    var th = "", td = "";
    for (var i = 0; i < n; i++) { th += "<th>" + i + "</th>"; td += "<td>&nbsp;</td>"; }
    return "<div class=\"hs-tabwrap\"><table class=\"et-tab\" aria-label=\"" + label + "\"><tr>" + th + "</tr><tr>" + td + "</tr></table></div>";
  }
  // Pseudokode fra arket: <div class="et-skel" data-pc="navn"> fylles etter at oppgaveteksten er bygd
  function skel(key) { return "<div class=\"et-skel\" data-pc=\"" + key + "\"></div>"; }
  function fillSkel(node, map) {
    qsa(".et-skel[data-pc]", node).forEach(function (h) { var a = map[h.getAttribute("data-pc")]; if (a) IN.pseudo.render(h, a, { tooltips: false }); });
    return node;
  }
  // Sluttilstander i samme form som fullpoengssvaret (perfekt/hashing.js)
  function probeAns(s) { return s.parts[0].cells.map(function (c) { return c && !c.tomb && c.k != null ? c.k : "_"; }).join(", "); }
  function chainAns(s) {
    return s.parts[0].rows.map(function (B, i) { return B && B.length ? i + ": " + B.map(function (o) { return "(" + o.k + ", " + o.v + ")"; }).join(", ") : null; })
      .filter(Boolean).join("; ");
  }
  function pyEntries(s) { return "entries = [" + s.parts[1].items.map(function (e) { return "(\"" + String(e.k).replace(/[«»]/g, "") + "\", \"" + e.v + "\")"; }).join(", ") + "]"; }
  function pyIndices(s) { return "indices = [" + s.parts[0].cells.map(function (c) { return c && c.ref != null ? c.ref : "_"; }).join(", ") + "]"; }

  var PC = {
    // H2025 (b) og H2022 (b): bare skjelettet fra arket
    sci: { name: "SeparateChainingInsert", params: "A, k, v", input: "Et array A av størrelse N, en nøkkel k og verdi v",
      output: "Et array der (k, v) er satt inn med separate chaining", lines: [L("// . . .", 1)] },
    lpi: { name: "LinearProbingInsert", params: "A, k, v", input: "Et array A av størrelse N, en nøkkel k og verdi v",
      output: "Et array som inneholder (k, v)", lines: [L("// . . .", 1)] },
    // H2021-9
    mf1: { name: "MostFrequent1", params: "A", input: "Et array A med n positive heltall", output: "Tallet som forekommer flest ganger i A", lines: [
      L("H ← new HashMap()", 1), L("for x in A do", 1), L("H.put(x, 0)", 2), L("m ← A[0]", 1), L("for x in A do", 1),
      L("f ← H.get(x)", 2), L("H.put(x, f + 1)", 2), L("if H.get(x) > H.get(m) then", 2), L("m ← x", 3), L("return m", 1)] },
    mf2: { name: "MostFrequent2", params: "A", input: "Et array A med n positive heltall", output: "Tallet som forekommer flest ganger i A", lines: [
      L("k ← maximum element in A", 1), L("B ← array of size k + 1", 1), L("for i ← 0 to k do", 1), L("B[i] ← 0", 2), L("m ← A[0]", 1),
      L("for x in A do", 1), L("B[x] ← B[x] + 1", 2), L("if B[x] > B[m] then", 2), L("m ← x", 3), L("return m", 1)] },
    // H2020-7
    sub1: { name: "IsSubanagramOf1", params: "W, S", input: "En streng W og en streng S", output: "Returner true hvis W et subanagram av S, false ellers", lines: [
      L("r ← copy of W", 1), L("for c in S do", 1), L("if c is in r then", 2), L("remove an occurrence of c from r", 3), L("return r.length = 0", 1)] },
    sub2: { name: "IsSubanagramOf2", params: "W, S", input: "En streng W og en streng S", output: "Returner true hvis W et subanagram av S, false ellers", lines: [
      L("F ← FreqTable(W)", 1), L("// Fyll ut", 1)] },
    subs1: { name: "SubanagramsOf1", params: "D, S", lines: [
      L("r ← empty list", 1), L("for i ← 0 to d − 1 do", 1), L("W ← D[i]", 2), L("if IsSubanagramOf2(W, S) then", 2), L("add W to r", 3), L("return r", 1)] },
    // Strategi 2 står som én blokk i arket, med fortløpende linjenumre (Build 1–8, SubanagramsOf2 9–13)
    strat2: { name: "Build", params: "D", lines: [
      L("M ← empty map", 1), L("for i ← 0 to d − 1 do", 1), L("sortedword ← Sort(D[i])", 2), L("if M.get(sortedword) is empty then", 2),
      L("M.put(sortedword, empty list)", 3), L("add D[i] to M.get(sortedword)", 2), L("return M", 1),
      L("Procedure SubanagramsOf2(M, S)", 0), L("r ← empty list", 1), L("for x in sorted substrings of S do", 1), L("append M.get(x) to r", 2), L("return r", 1)] }
  };

  var PYSHEET = "d = {}\nd[\"timmy\"] = \"red\"\nd[\"barry\"] = \"green\"\nd[\"guido\"] = \"blue\"";
  var PYOLD = "entries = [(_, _),\n           (\"barry\", \"green\"),\n           (_, _),\n           (_, _),\n           (_, _),\n           (\"timmy\", \"red\"),\n           (_, _),\n           (\"guido\", \"blue\")]";
  var PYNEW = "indices = [_, 1, _, _, _, 0, _, 2]\nentries = [(\"timmy\", \"red\"), (\"barry\", \"green\"), (\"guido\", \"blue\")]";
  function pre(s, label) { return "<pre class=\"hs-sheet\" aria-label=\"" + label + "\">" + esc(s) + "</pre>"; }

  var PROBE_PC = ["hsProbeInsert", "hsProbeGet", "hsProbeRemove"];
  function probeParse(s) { return HS.parseOps(s, { numbers: true, del: true }); }

    def("H2025-2", { host: "#exam-h2025-2" }, function () { return { key: "H2025-2", year: "H2025", title: "Separate chaining", oppgave_nr: "Oppgave 2", points: 10,
      ark: "Separate chaining", ordrett: true, poengkilde: "sv",
      oppgave: fillSkel(IN.oppg({ parts: [
        { t: "<p>Vi starter med et tomt array på størrelse N = 10.</p>" + emptyTab(10, "Tomt array med plass 0 til 9") +
            "<p>Hashfunksjonen du skal bruke er h(k, N) = k mod N, som for dette eksempelet blir h(k, 10) = k mod 10. Altså hasher et tall til sitt siste siffer.</p>" +
            "<p>Bruk separate chaining til å sette inn disse nøkkel- og verdiparene i den gitte rekkefølgen:</p><p class=\"mono\">(21, a), (54, b), (82, c), (10, d), (20, e), (44, f), (10, g)</p>" +
            "Skriv ned resultatet etter siste innsetting, med hver linje på formen: <span class=\"mono\">i : (k₁, v₁), (k₂, v₂), . . .</span> der i er en indeks i arrayet, og (k₁, v₁), (k₂, v₂), . . . er nøkkel- og verdipar.", p: 3 },
        { t: "Forklar kort hvordan algoritmen for innsetting ved separate chaining fungerer, og skisser algoritmen med pseudokode. Du kan anta at du har en hashfunksjon h slik at h(k, N) gir et tall mellom 0 og N − 1 for en vilkårlig nøkkel k. Du trenger ikke ta høyde for rehashing. <span class=\"et-p\">(5p)</span>" + skel("sci") },
        { t: "Redegjør kort for kjøretidskompleksiteten til innsetting ved separate chaining.", p: 2 }
      ] }), PC),
      avvik: "Det tomme arrayet er tegnet som en rad med plass 0–9. I arket står plassene i en ring. Innholdet er det samme, og vi viser det som en rad fordi resten av siden tegner arrayer slik.",
      demo: { engine: "hash", gen: "hsChainOps", input: [{ N: 10, ops: insKV(CH25) }], inputNavn: "H2025 (a)",
        presets: { "Mange kollisjoner": [{ N: 10, ops: insKV([[3, "a"], [13, "b"], [23, "c"], [3, "d"]]) }] },
        pseudo: ["hsChainInsert", "hsChainGet"], legend: LEGEND, del: "(a)", svar: chainAns,
        label: "Kjør SeparateChainingInsert for de sju parene",
        parseInput: function (s) { return HS.parseOps(s, {}); }, inputLabel: "f.eks. 21=a, 31=b, ?21" },
      losning: sol(["<code>0: (10, g), (20, e)</code> · <code>1: (21, a)</code> · <code>2: (82, c)</code> · <code>4: (54, b), (44, f)</code>. De andre plassene er tomme. (10, g) <b>erstatter</b> (10, d) der den står i bøtta, i stedet for å legges bakerst.",
        "Regn ut i = h(k, N) og se på bøtta A[i]. Er den null, lag en ny liste som bare inneholder (k, v). Ellers: let gjennom bøtta. Finnes nøkkelen k, overskriv paret. Finnes den ikke, legg (k, v) bakerst i bøtta.",
        "Verste tilfelle <b>O(n)</b>: alle nøklene kan hashe til samme bøtte, og vi må lete gjennom hele for å se om k finnes. Forventet <b>O(1)</b> med en god hashfunksjon og lav Load factor (med rehash: forventet amortisert O(1))."],
        ["hsChainInsert"]),
      kjerne: "<p>Bøtta letes gjennom for å unngå duplikater, og det søket er det som koster O(|B|). Lik nøkkel betyr overskriving.</p>",
      tips: ["Glemmer du å overskrive like nøkler, mister du poeng både i (a) og (b).", "Vis tydelig hvordan bøtta lages første gang (null → ny liste).",
        "Uten pseudokode ga (b) inntil 3 av 5 poeng.", "(c) ga ett poeng for bare verste tilfelle og ett for bare forventet tilfelle. Begge trengs for 2 poeng."]
    }; });

    def("H2020-4", { host: "#exam-h2020-4" }, function () { return { key: "H2020-4", year: "H2020", title: "Linear probing", oppgave_nr: "Oppgave 4", points: 2,
      ark: "Linear probing", ordrett: true,
      oppgave: IN.oppg({
        intro: "<p>Vi starter med et tomt array på størrelse 10.</p>" + emptyTab(10, "Tomt array med plass 0 til 9") +
          "<p>Hashfunksjonen du skal bruke er h(k, N) = k mod N, som for dette eksempelet blir det samme som h(k) = k mod 10. Altså hasher et tall til sitt siste siffer.</p>" +
          "<p>Bruk linear probing til å sette inn disse tallene i den gitte rekkefølgen:</p><p class=\"mono\">93, 48, 74, 99, 29, 13, 45</p>" +
          "<p>Fyll ut tabellen slik den ser ut etter alle tallene er satt inn med linear probing.</p>"
      }),
      demo: { engine: "hash", gen: "hsProbeOps", input: [{ N: 10, ops: ins([93, 48, 74, 99, 29, 13, 45]) }], inputNavn: "H2020",
        presets: { "Rundt enden": [{ N: 10, ops: ins([9, 19, 29, 8]) }] },
        pseudo: PROBE_PC, legend: LEGEND, svar: probeAns, label: "Kjør LinearProbingInsert for 93, 48, 74, 99, 29, 13, 45",
        parseInput: probeParse, inputLabel: "f.eks. 21, 31, 41, -21, ?41" },
      losning: sol(["<code>29, _, _, 93, 74, 13, 45, _, 48, 99</code>. 93, 48, 74 og 99 havner rett på hjemmeplassen. 29 hører hjemme på 9, som er opptatt av 99, så den går rundt til plass 0. 13 hører hjemme på 3, men 3 og 4 er opptatt, så den havner på 5. 45 hører hjemme på 5 (nå opptatt av 13) og havner på 6."],
        null, { figs: [hashFig(probeFig("Ferdig tabell", probeState(10, [93, 48, 74, 99, 29, 13, 45]), {}, true), "Etter alle innsettingene")] }),
      kjerne: "<p>Etter siste plass går proben rundt til plass 0. Det er nøyaktig det 29 tester.</p>",
      tips: ["Tips: skriv kort hvor hver kolliderende nøkkel probet. Da ser du selv om du har hoppet over en plass."]
    }; });

    def("H2022-7", { host: "#exam-h2022-7" }, function () { return { key: "H2022-7", year: "H2022", title: "Linear probing", oppgave_nr: "Oppgave 7", points: 10,
      ark: "Linear probing", ordrett: true, poengkilde: "sv",
      oppgave: fillSkel(IN.oppg({ parts: [
        { t: "<p>Vi starter med et tomt array på størrelse 10.</p>" + emptyTab(10, "Tomt array med plass 0 til 9") +
            "<p>Hashfunksjonen du skal bruke er h(k, N) = k mod N, som for dette eksempelet blir det samme som h(k, 10) = k mod 10. Altså hasher et tall til sitt siste siffer.</p>" +
            "<p>Bruk linear probing til å sette inn disse tallene i den gitte rekkefølgen:</p><p class=\"mono\">21, 54, 82, 10, 20, 44</p>" +
            "Fyll ut tabellen slik den ser ut etter alle tallene er satt inn med linear probing. Skriv svaret som en kommaseparert liste, der _ kan brukes for å indikere en tom plass.", p: 2 },
        { t: "Forklar kort hvordan algoritmen for innsetting ved linear probing fungerer, og skisser algoritmen med pseudokode. Du kan anta at arrayet i input ikke er fullt, og at du har en hashfunksjon h slik at h(k, N) gir et tall mellom 0 og N − 1 for en vilkårlig nøkkel k. Ledig plass i arrayet er indikert ved null. <span class=\"et-p\">(8p)</span>" + skel("lpi") }
      ] }), PC),
      avvik: "Arket viser bare totalen, 10 poeng. Sensorveiledningen gir 2 poeng for (a), så (b) står med de resterende 8.",
      demo: { engine: "hash", gen: "hsProbeOps", input: [{ N: 10, ops: ins([21, 54, 82, 10, 20, 44]) }], inputNavn: "H2022 (a)",
        presets: { "Samme nøkkel igjen": [{ N: 10, ops: ins([21, 54, 82, 10, 20, 44, 20]) }] },
        pseudo: PROBE_PC, legend: LEGEND, del: "(a)", svar: probeAns, label: "Kjør LinearProbingInsert for 21, 54, 82, 10, 20, 44",
        parseInput: probeParse, inputLabel: "f.eks. 21, 31, 41, -21, ?41" },
      losning: sol(["<code>10, 21, 82, 20, 54, 44, _, _, _, _</code>. 20 hører hjemme på 0, men 0, 1 og 2 er opptatt, så den havner på 3. 44 hører hjemme på 4 og havner på 5.",
        "Start på i = h(k, N). Så lenge A[i] ikke er null: ligger nøkkelen k der, stopp (paret skal overskrives); ellers gå videre med i ← (i + 1) mod N. Sett til slutt (k, v) inn på A[i]. Løkka stopper fordi arrayet ikke er fullt."],
        ["hsProbeInsert"]),
      kjerne: "<p>Tre ting må være med: start på h(k, N), gå videre med mod N, og overskriv ved lik nøkkel.</p>",
      tips: ["(a) var alt eller ingenting.", "Trekk på (b) for å ikke overskrive lik nøkkel (−1), for å gå utenfor arrayet (−2) og for å bruke h feil (−1).",
        "En god forklaring alene ga opptil 5 poeng på (b). Full uttelling krevde også korrekt pseudokode."]
    }; });

    def("H2024-5", { host: "#exam-h2024-5" }, function () { return { key: "H2024-5", year: "H2024", title: "Python 3.6-ordbøker", oppgave_nr: "Oppgave 5", points: 10,
      ark: "Python 3.6", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>Anta at Python sine ordbøker (dict), frem til versjon 3.6, var implementert med linear probing slik det har blitt undervist i IN2010. (Dette er en liten modifikasjon av sannheten).</p>" +
          "<p>I desember 2012 kom Raymond Hettinger med et forslag til en endring av den underliggende representasjonen av ordbøker. I forslaget beskriver Hettinger at den gjeldende representasjonen er unødvendig ineffektiv. " +
          "Den organiserer dataene i et array <code>entries</code>, der hvert element har plass til en nøkkel k og en verdi v. Arrayet har størrelse N, og mye ledig plass. Hettinger foreslår å omorganisere dataene. " +
          "Nøkkel-verdi-parene bør i stedet lagres i et tettpakket, dynamisk array <code>entries</code> med n elementer, der n er antall nøkkel-verdi-par. Elementene i <code>entries</code> kan refereres til fra et annet array <code>indices</code> med N elementer (som fremdeles har mye ledig plass).</p>" +
          "<p>For eksempel, følgende ordbok:</p>" + pre(PYSHEET, "Ordboka d") + "<p>var tidligere representert slik:</p>" + pre(PYOLD, "Gammel representasjon") +
          "<p>der (_, _) indikerer en ledig plass. Forslaget er å representere den slik:</p>" + pre(PYNEW, "Ny representasjon") +
          "<p>Forslaget over førte til at implementasjonen av ordbøker i Python ble endret fra og med versjon 3.6.</p>",
        parts: [{ t: "Forklar kort, med naturlig språk, hvordan algoritmene for oppslag og innsetting med linear probing må endres for å ta høyde for den nye strukturen.", p: 4 },
          { t: "Hva er en rehash? Hva er det som forårsaker en rehash?", p: 2 },
          { t: "Hvordan vil en rehash foregå i den nye strukturen?", p: 2 },
          { t: "Hva er fordelene med den nye strukturen?", p: 2 }],
        figsAfter: [{ cls: "wide", cap: "Til hjelp (ikke i arket): gammel representasjon, entries med N = 8 plasser", draw: function (h) { draw(h, { parts: [{ type: "probe", N: 8, cells: pyLast(PY3).parts[2].cells }] }); } },
               { cls: "wide", cap: "Til hjelp (ikke i arket): ny representasjon, indices og entries", draw: function (h) { var Lp = pyLast(PY3); draw(h, { parts: [{ type: "probe", label: "indices", N: 8, cells: Lp.parts[0].cells }, { type: "entries", label: "entries", items: Lp.parts[1].items }] }); } }]
      }),
      avvik: ["Kodeblokkene står som i arket. Figurene under deloppgavene er våre egne tegninger av de samme to representasjonene, og de står ikke i arket.",
        "Hashverdiene i figurene og demoen er valgt slik at timmy, barry og guido havner på plass 5, 1 og 7, som i arket. Oppgaven sier ikke hvilken hashfunksjon Python bruker."],
      demoLabel: "Se innsetting og rehash i den nye strukturen",
      demo: [
        { tab: "(a) Innsetting", del: "(a)", engine: "hash", gen: "hsPyOps", input: [{ N: 8, fixed: PYFIX, ops: PY3 }], inputNavn: "H2024: timmy, barry, guido",
          presets: { "Med oppslag": [{ N: 8, fixed: PYFIX, ops: PY3.concat([{ op: "get", k: "barry" }]) }] },
          pseudo: ["hsPyGet", "hsPyInsert"], legend: LEGEND, fasit: "indices = [_, 1, _, _, _, 0, _, 2]", svar: pyIndices,
          label: "Sett inn timmy, barry og guido",
          parseInput: function (s) { var r = HS.parseOps(s, { rehash: true, N: 8, maxN: 16 }); if (r.length) r[0].fixed = PYFIX; return r; },
          inputLabel: "f.eks. timmy=red, ola=gul, ?ola, rehash" },
        { tab: "(c) Rehash", del: "(c)", engine: "hash", gen: "hsPyOps", input: [{ N: 8, fixed: PYFIX, ops: PY3.concat([{ op: "rehash" }]) }], inputNavn: "H2024 + rehash",
          presets: false, pseudo: ["hsPyGet", "hsPyInsert"], legend: LEGEND,
          fasit: "entries = [(\"timmy\", \"red\"), (\"barry\", \"green\"), (\"guido\", \"blue\")]", svar: pyEntries,
          label: "Rehash: indices dobles, entries står",
          parseInput: function (s) { var r = HS.parseOps(s, { rehash: true, N: 8, maxN: 16 }); if (r.length) r[0].fixed = PYFIX; return r; },
          inputLabel: "f.eks. timmy=red, ola=gul, rehash" }
      ],
      losning: sol(["Probingen skjer nå i indices, så N = |indices|. <b>Oppslag:</b> start på i = h(k, N). Er indices[i] ledig, finnes ikke k. Ellers hent paret entries[indices[i]] og sammenlign nøkkelen: ved treff returneres verdien, ellers i ← (i + 1) mod N. <b>Innsetting:</b> let på samme måte. Finnes k, overskriv paret i entries. Ellers: sett indices[i] ← |entries| på den ledige plassen vi fant, og legg (k, v) bakerst i entries.",
        "En rehash lager et større array (kurset dobler N) og setter inn alle elementene på nytt med den nye N-en. Den utløses når Load factor n/N blir for høy (kurset bruker 0,75), fordi kollisjonene og probingen da blir for mange.",
        "entries endres ikke. Bare indices lages på nytt med større N, og for hver j i entries settes j inn i indices med h(entries[j].key, N) og Linear probing.",
        "To av disse: innsettingsrekkefølgen bevares; iterasjon går gjennom n par i stedet for N plasser; rehash rører ikke parene i entries; mindre minne, fordi de ledige plassene bare er små tall i indices, ikke hele par."],
        ["hsPyGet", "hsPyInsert"]),
      kjerne: "<p>Én tabell med hull for probing (indices), og én tett tabell for dataene (entries). Alt annet følger av det.</p>",
      tips: ["Tips: si eksplisitt at N nå er størrelsen på indices, ikke på entries. Sensor skriver det også.", "(a) ga omtrent 2 poeng for oppslag og 2 for innsetting. Det viktigste for oppslaget er at du slår opp i entries via indices.",
        "(d) ga full uttelling for to fordeler.", "På (a) holder naturlig språk. Pseudokoden i løsningen er bare til hjelp."]
    }; });

    def("H2021-9", { host: "#exam-h2021-9" }, function () { return { key: "H2021-9", year: "H2021", title: "Flest forekomster", oppgave_nr: "Oppgave 9", points: 8,
      ark: "Flest forekomster", ordrett: true,
      oppgave: fillSkel(IN.oppg({
        intro: "<p class=\"et-lbl-sm\">STRATEGI 1</p>" + skel("mf1") + "<p class=\"et-lbl-sm\">STRATEGI 2</p>" + skel("mf2") +
          "<p>Ovenfor ser du to (korrekte) algoritmer som begge tar et array A med positive heltall som input, og returner tallet som forekommer flest ganger. Drøft fordeler og ulemper ved de to ulike strategiene. " +
          "Du bør oppgi både kjøretidskompleksiteten i verste tilfelle, og hva som er den forventede kjøretidskompleksiteten, med hensyn til n og k. Den bør begrunnes kort. " +
          "Du bør også oppgi hvilke situasjoner Strategi 1 bør foretrekkes over Strategi 2, og vice versa, med hensyn til konkret kjøretid. Gjøre rede for eventuelle antagelser du gjør underveis.</p>"
      }), PC),
      avvik: "I arket står de to strategiene side om side. Her står de under hverandre, så de får plass på en smal skjerm.",
      losning: sol(["<b>Strategi 1 (hashmap):</b> to løkker med n runder, og hver runde gjør et par hashmap-operasjoner. De er forventet O(1), så forventet <b>O(n)</b>. I verste tilfelle kan hver operasjon ta O(n) (alt havner på samme plass), altså <b>O(n²)</b>.",
        "<b>Strategi 2 (telle-array):</b> å finne k og gå gjennom A er O(n), og å lage og nullstille B er O(k). Totalt <b>O(n + k)</b>, både i verste og forventet tilfelle.",
        "<b>Når hvilken?</b> Er k liten (for eksempel k ≤ n), er Strategi 2 best: den er O(n) uten hashing-kostnader som hashberegning, kollisjoner og rehash. Er k mye større enn n (for eksempel k = n²), bruker Strategi 2 mye tid og minne på et stort B, og Strategi 1 er bedre.",
        "<b>Antagelser:</b> hashfunksjonen sprer godt (det gir forventet O(1)), og tallene er positive heltall, så de kan brukes direkte som indekser i B."], null, { plain: true }),
      kjerne: "<p>Hashing gir forventet O(n) uansett hvor store tallene er. Telle-arrayet gir O(n + k) garantert, men bare så lenge k er liten nok.</p>",
      tips: ["Oppgaven ber om både verste og forventet tid for begge strategiene. Tips: skriv dem opp hver for seg, så sensor ser at du har svart på begge.",
        "Sensor la vekt på at teksten er tydelig: en setning som ikke er forståelig etter to gjennomlesninger, ignoreres.", "Tips: gi en konkret situasjon for hver strategi (liten k og stor k)."]
    }; });

    def("H2020-7", { host: "#exam-h2020-7" }, function () { return { key: "H2020-7", year: "H2020", title: "Subanagram (a–c)", oppgave_nr: "Oppgave 7", points: 17,
      ark: "Subanagram", ordrett: true, deler: ["(a)", "(b)", "(c)"],
      oppgave: fillSkel(IN.oppg({
        intro: "<p>Vi ønsker å lage en nettside for å hjelpe sleipe Scrabble-spillere. En Scrabble-spiller har noen bokstaver som de skal prøve å forme ord fra, og disse ordene må stå i en ordbok. I denne oppgaven ignorerer alle andre Scrabble-regler, og fokuserer på det vi skal kalle subanagrammer.</p>" +
          "<p>La oss anta at bokstavene man har tilgjengelig er gitt som en streng S, og at et ord W også er gitt som en streng. Vi sier at W er et subanagram av S, dersom W kan skrives ved å kun bruke bokstaver fra S.</p>" +
          "<p>Merk at vi ikke tillater gjenbruk av bokstaver fra S. For eksempel er \"hole\" et subanagram av \"ehlo\". Derimot er \"hello\" ikke et subanagram av \"ehlo\", fordi det ikke er to \"l\"-er i \"ehlo\". Både \"hole\" og \"hello\" er subanagrammer av \"hheelloo\".</p>" +
          "<p>Her er noen eksempler på subanagramer av \"aghilmort\":</p><ul><li>\"algorithm\"</li><li>\"logarithm\"</li><li>\"alright\"</li><li>\"right\"</li><li>\"math\"</li><li>\"git\"</li></ul>" +
          "<p>I oppgavene som følger ser vi på ulike måter å finne subanagrammer fra en gitt ordbok.</p>",
        parts: [
          { t: "<span class=\"et-p\">(4p)</span><p class=\"et-lbl-sm\">ALGORITHM: ER W ET SUBANAGRAM AV S?</p>" + skel("sub1") +
              "<p>Algoritmen ovenfor skal sjekke om ordet W kan skrives med bokstavene fra S.</p><ul><li>Anta at en streng fungerer akkurat som et array med bokstaver.</li><li>Å kopiere et array gjøres i lineær tid.</li>" +
              "<li>Å sjekke om et element er i et array gjøres i lineær tid.</li><li>Å fjerne et element fra et array gjøres i lineær tid.</li><li>Å finne lengden av et array gjøres i konstant tid.</li>" +
              "<li>Vi lar w angi størrelsen på W og s angi størrelsen på S.</li></ul><p>Hva er kjøretidskompleksiteten til algoritmen?</p>" +
              "<p>Svaralternativer: O(w + s) · O(s²) · O(w log(s)) · O(s · w) · O(w²)</p>" },
          { t: "<span class=\"et-p\">(7p)</span><p>Du skal nå implementere et alternativ til IsSubanagramOf1. Du skal ta utgangspunkt i en frekvenstabell. Anta at du har en prosedyre FreqTable tilgjengelig, som bygger et map fra bokstaver til antall forekomster i lineær tid.</p>" +
              "<p>Hvis F er en frekvenstabell for strengen \"abbcccdddd\" vil for eksempel F.get(\"a\") returnere 1 og F.get(\"d\") returnere 4. Du kan anta at F.get(x) returnerer 0 for alle bokstaver som ikke er med i ordet frekvenstabellen bygges fra. Du kan oppdatere verdien i frekvenstabellen ved å bruke F.put, som et vanlig map. Både get og put er i O(1).</p>" +
              "<p>Fullfør implementasjonen av IsSubanagramOf2, slik at den har kjøretidskompleksitet O(w + s), der w er størrelsen av W og s er størrelsen av S.</p>" +
              "<p class=\"et-lbl-sm\">ALGORITHM: ER W ET SUBANAGRAM AV S?</p>" + skel("sub2") },
          { t: "<span class=\"et-p\">(6p)</span><p class=\"et-lbl-sm\">Strategi 1</p>" + skel("subs1") +
              "<p>I pseudokoden ovenfor er vi gitt en ordbok D av lengde d, som er et array av strenger. Den bruker IsSubanagramOf2 fra forrige deloppgave til å finne alle ord i ordboka som er et subanagram av S. Å finne subanagrammer med denne teknikken kjører i O(d · (w + s)), der d er størrelsen på ordboka, w er størrelsen til det største ordet i ordboka, og s er størrelsen til S.</p>" +
              "<p class=\"et-lbl-sm\">Strategi 2</p>" + skel("strat2") +
              "<p>I pseudokoden ovenfor lager vi et hashmap, der hver nøkkel k er en streng med bokstaver sortert i alfabetisk rekkefølge, og verdien er en liste med anagrammer av k som finnes i ordboka. For å finne alle subanagrammer i ordboken, må vi slå opp på alle sorterte substrenger av S i hashmapet. Å finne subanagrammer med denne teknikken kjører i O(2<sup>s</sup>), altså eksponensiell tid med hensyn til størrelsen av S.</p>" +
              "<p>Drøft fordeler og ulemper mellom strategi 1 og strategi 2 med tanke på kjøretid.</p>" }
        ]
      }), PC),
      avvik: ["(a) var et flervalg i Inspera. Svaralternativene er hentet fra sensorveiledningen.",
        "I arket står Strategi 1 og Strategi 2 i to kolonner side om side. Her står de under hverandre, så de får plass på en smal skjerm. Strategi 2 har fortløpende linjenumre, som i arket.",
        "Deloppgave (d) handler om sortering og står på sorteringssiden. (a) og (c) finnes også på strategisiden."],
      demo: { engine: "hash", gen: "hsSubanagramOps", input: ["hello", "ehlo"], inputNavn: "«hello» og «ehlo»",
        presets: { "«hole» og «ehlo»": ["hole", "ehlo"], "«hello» og «hheelloo»": ["hello", "hheelloo"], "«logarithm» og «aghilmort»": ["logarithm", "aghilmort"] },
        pseudo: "hsSubanagram", del: "(b)", fasit: "false", label: "Kjør IsSubanagramOf2 med to frekvenstabeller",
        legend: [{ cls: "compare", label: "Bokstaven c vi sjekker" }, { cls: "sorted", label: "Sjekket, nok i S" }],
        parseInput: function (s) { var p = String(s).split(/[,;\s]+/).map(function (x) { return x.trim(); }).filter(Boolean); return p.length >= 2 ? [p[0].slice(0, 24), p[1].slice(0, 24)] : []; },
        inputLabel: "f.eks. hole, ehlo (W, S)" },
      losning: sol(["<b>O(s · w)</b>. Kopien tar O(w). Løkka går s ganger, og hver runde gjør et lineært søk og kanskje en lineær fjerning i r, som har lengde høyst w.",
        "Bygg også G ← FreqTable(S). For hver bokstav c i W: trenger W flere c-er enn S har (F.get(c) > G.get(c)), returner false. Ellers returner true. To tellinger, O(w) + O(s), og én løkke med O(1)-oppslag, O(w): totalt O(w + s).",
        "Strategi 1 er lineær i d, w og s. Strategi 2 avhenger bare av s, men eksponentielt. I praksis er ordboka stor (d er mye større enn w og s) og bokstavene få, og da lønner Strategi 2 seg: 2<sup>s</sup> er lite for liten s, og vi slipper å gå gjennom hele D. Blir S lang, vokser 2<sup>s</sup> fort, og Strategi 1 blir bedre. Build(D) koster tid, men gjøres én gang og gjenbrukes for alle spørringer."],
        ["hsSubanagram"]),
      kjerne: "<p>Frekvenstabeller gjør «har S nok av hver bokstav?» til O(1) per bokstav. I (c) er poenget avveiningen mellom stor d og eksponentiell s.</p>",
      tips: ["(b): Å bytte om &lt; og &gt;, eller W og S, ga 2 poengs trekk hver. Å sjekke likhet (anagram i stedet for subanagram) ga bare 2 poeng totalt. Kode som ikke kjører i O(w + s), ga ingen poeng.",
        "(c): Hovedpoenget (3p) er at Strategi 2 lønner seg når S er liten og D stor. Resten gikk til velskrevet tekst, argumentasjon og rimelige antagelser.",
        "Sensor skriver at grensen i deres eksperiment med ordboka sowpods lå rundt s = 17."]
    }; });

  // Brukes også av demoene på temasiden
  IN.kortData.felles(SIDE, { esc: esc, LEGEND: LEGEND, PYFIX: PYFIX, ins: ins, insKV: insKV, lastStep: lastStep, probeState: probeState, chainState: chainState, probeFig: probeFig, draw: draw, hashFig: hashFig, CH25: CH25, PY3: PY3, pyLast: pyLast });
})();
