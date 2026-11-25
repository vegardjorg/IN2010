/* ============================================================
   IN2010 guide · kort/strategi.js
   Eksamenskortene for Strategi (07-strategi.html): én definisjon per kort, lest av temasiden og crash.html.
   Oppgavetekstene står ordrett med kildelinje (som før). Fullpoengssvar og sensorveiledning
   ligger i perfekt/strategi.js (og perfekt/delt.js for oppgaver som deles med andre sider).
   Lastes etter perfekt/*.js. Se IN.kortData i core.js.
   ============================================================ */
(function () {
  "use strict";
  var IN = window.IN, qs = IN.qs, qsa = IN.qsa, el = IN.el, A = IN.algos, ST = IN.strategi;
  var SIDE = "strategi";
  function def(key, meta, fn) { meta.side = SIDE; return IN.kortData.def(key, meta, fn); }

  function t(e, n, k) { return { eli5: e, normal: n, teknisk: k }; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  /* ---------- Liten grafmotor (SVG) ----------
     G = { nodes: { id: [x, y] }, edges: [[a, b, w?]], directed }
     o = { w, h, edge: { "a|b": "ok" | "bad" | "on" }, order: { id: nr }, label } */
  var MID = 0;
  function ekey(a, b, dir) { return dir || a < b ? a + "|" + b : b + "|" + a; }
  function gsvg(G, o) {
    o = o || {};
    var W = o.w || 320, H = o.h || 220, R = 15, mid = "st-arr-" + (++MID), es = o.edge || {}, ord = o.order || {};
    var s = '<svg class="st-graph" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(o.label || "Graf") + '">';
    if (G.directed) s += '<defs><marker id="' + mid + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="st-arrow" d="M0,0 L10,5 L0,10 z"/></marker></defs>';
    G.edges.forEach(function (e) {
      var p = G.nodes[e[0]], q = G.nodes[e[1]], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
      var x1 = p[0] + dx / L * R, y1 = p[1] + dy / L * R, x2 = q[0] - dx / L * (R + (G.directed ? 2 : 0)), y2 = q[1] - dy / L * (R + (G.directed ? 2 : 0));
      var st = es[ekey(e[0], e[1], G.directed)];
      s += '<line class="st-gedge' + (st ? " is-" + st : "") + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (G.directed ? ' marker-end="url(#' + mid + ')"' : "") + "/>";
      if (e[2] != null) {
        var mx = (p[0] + q[0]) / 2 - dy / L * 11, my = (p[1] + q[1]) / 2 + dx / L * 11 + 4;
        s += '<text class="st-gw' + (e[2] < 0 ? " neg" : "") + '" x="' + mx + '" y="' + my + '" text-anchor="middle">' + String(e[2]).replace("-", "−") + "</text>";
      }
    });
    Object.keys(G.nodes).forEach(function (id) {
      var p = G.nodes[id], on = ord[id] != null;
      s += '<g class="st-gnode' + (on ? " is-sel" : "") + (o.click ? " click" : "") + '" data-id="' + id + '"' + (o.click ? ' tabindex="0" role="button" aria-label="Node ' + id + (on ? ", nummer " + ord[id] + " i sertifikatet" : "") + '"' : "") + ">" +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + R + '"/><text x="' + p[0] + '" y="' + (p[1] + 5) + '" text-anchor="middle">' + id + "</text>";
      if (on) s += '<text class="st-gord" x="' + (p[0] + 15) + '" y="' + (p[1] - 12) + '" text-anchor="middle">' + ord[id] + "</text>";
      s += "</g>";
    });
    return s + "</svg>";
  }
  var HAMG = { nodes: { a: [160, 30], b: [272, 86], c: [272, 170], d: [160, 205], e: [48, 170], f: [48, 86] },
    edges: [["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"], ["f", "a"], ["a", "c"], ["b", "e"], ["d", "f"]] };

  /* ===================== EKSAMEN (oppgavetekst ordrett fra arket) =====================
     Nøkler og perfekt svar: assets/js/perfekt/strategi.js. H2020-7 og H2020-8 er delte nøkler,
     og kortene her viser bare sine deler (deler). Ordrett tekst: plan/gjennomgang/08-eksamenstekst-ordrett.md. */
  // Løsning som DOM-node: (a), (b), … som deloppgavene + pseudokode via IN.pseudo (BYGGEGUIDE 5.4)
  function sol(items, algos, o) {
    o = o || {};
    var d = el("div");
    if (o.intro) d.appendChild(el("p", { html: o.intro }));
    var ol = el(o.plain ? "ul" : "ol", o.plain ? {} : { class: "et-parts" });
    items.forEach(function (x) { ol.appendChild(el("li", { html: x })); }); d.appendChild(ol);
    (algos || []).forEach(function (key) {
      d.appendChild(el("h5", { style: "margin:.8rem 0 .3rem", text: "Pseudokode: " + A[key].name }));
      var h = el("div"); d.appendChild(h); IN.pseudo.render(h, A[key], {});
      d.appendChild(IN.pseudo.bigO(A[key], { compact: true }));
    });
    return d;
  }
  function tfParts(list) { return list.map(function (s) { return { t: s }; }); }
  function tfSol(list) { return list.map(function (x) { return "<b>" + (x[0] ? "Sant" : "Usant") + ".</b> " + x[1]; }); }
  function demoLink(fane, demo, txt) { return '<p class="small muted">Prøv selv: <a href="#fane=' + fane + "&amp;oppg=" + demo + '">' + txt + "</a>.</p>"; }
  // Pseudokode fra arket, ordrett (egen algo, ikke kursets variant)
  function sheetPc(host, algo) { IN.pseudo.render(host, algo, { tooltips: false }); }
  function Ln(code, indent) { return { code: code, indent: indent }; }

  /* ---------- H2020-7: felles innledning (ordrett) ---------- */
  var SUB_INTRO = "<p>Vi ønsker å lage en nettside for å hjelpe sleipe Scrabble-spillere. En Scrabble-spiller har noen bokstaver som de skal prøve å forme ord fra, og disse ordene må stå i en ordbok. I denne oppgaven ignorerer alle andre Scrabble-regler, og fokuserer på det vi skal kalle subanagrammer.</p>" +
    "<p>La oss anta at bokstavene man har tilgjengelig er gitt som en streng S, og at et ord W også er gitt som en streng. Vi sier at W er et subanagram av S, dersom W kan skrives ved å kun bruke bokstaver fra S.</p>" +
    "<p>Merk at vi ikke tillater gjenbruk av bokstaver fra S. For eksempel er \"hole\" et subanagram av \"ehlo\". Derimot er \"hello\" ikke et subanagram av \"ehlo\", fordi det ikke er to \"l\"-er i \"ehlo\". Både \"hole\" og \"hello\" er subanagrammer av \"hheelloo\".</p>" +
    "<p>Her er noen eksempler på subanagramer av \"aghilmort\":</p><ul><li>\"algorithm\"</li><li>\"logarithm\"</li><li>\"alright\"</li><li>\"right\"</li><li>\"math\"</li><li>\"git\"</li></ul>" +
    "<p>I oppgavene som følger ser vi på ulike måter å finne subanagrammer fra en gitt ordbok.</p>";
  var PC_SUB1 = { name: "IsSubanagramOf1", params: "W, S", input: "En streng W og en streng S", output: "Returner true hvis W et subanagram av S, false ellers",
    lines: [Ln("r ← copy of W", 1), Ln("for c in S do", 1), Ln("if c is in r then", 2), Ln("remove an occurrence of c from r", 3), Ln("return r.length = 0", 1)] };
  var PC_STRAT1 = { name: "SubanagramsOf1", params: "D, S",
    lines: [Ln("r ← empty list", 1), Ln("for i ← 0 to d − 1 do", 1), Ln("W ← D[i]", 2), Ln("if IsSubanagramOf2(W, S) then", 2), Ln("add W to r", 3), Ln("return r", 1)] };
  var PC_STRAT2 = { name: "Build", params: "D",
    lines: [Ln("M ← empty map", 1), Ln("for i ← 0 to d − 1 do", 1), Ln("sortedword ← Sort(D[i])", 2), Ln("if M.get(sortedword) is empty then", 2), Ln("M.put(sortedword, empty list)", 3), Ln("add D[i] to M.get(sortedword)", 2), Ln("return M", 1),
      { code: "Procedure SubanagramsOf2(M, S)", indent: 0 }, Ln("r ← empty list", 1), Ln("for x in sorted substrings of S do", 1), Ln("append M.get(x) to r", 2), Ln("return r", 1)] };

  function o7a() {
  var o = IN.oppg({
    intro: SUB_INTRO + '<p><b>(a)</b> <span class="et-p">(4p)</span></p><p class="small"><b>ALGORITHM: ER W ET SUBANAGRAM AV S?</b></p><div class="et-skel-7a"></div>' +
      "<p>Algoritmen ovenfor skal sjekke om ordet W kan skrives med bokstavene fra S.</p>" +
      "<ul><li>Anta at en streng fungerer akkurat som et array med bokstaver.</li><li>Å kopiere et array gjøres i lineær tid.</li><li>Å sjekke om et element er i et array gjøres i lineær tid.</li>" +
      "<li>Å fjerne et element fra et array gjøres i lineær tid.</li><li>Å finne lengden av et array gjøres i konstant tid.</li><li>Vi lar w angi størrelsen på W og s angi størrelsen på S.</li></ul>" +
      "<p>Hva er kjøretidskompleksiteten til algoritmen?</p>" +
      "<ul class=\"et-choices\"><li>O(w + s)</li><li>O(s²)</li><li>O(w log(s))</li><li>O(s · w)</li><li>O(w²)</li></ul>"
  });
  sheetPc(qs(".et-skel-7a", o), PC_SUB1);
  return o;
  }

  function o7c() {
  var o = IN.oppg({
    intro: SUB_INTRO + '<p><b>(c)</b> <span class="et-p">(6p)</span></p>' +
      '<div class="grid cols-2"><div><p class="small"><b>Strategi 1</b></p><div class="et-skel-s1"></div>' +
      "<p class=\"small\">I pseudokoden ovenfor er vi gitt en ordbok D av lengde d, som er et array av strenger. Den bruker IsSubanagramOf2 fra forrige deloppgave til å finne alle ord i ordboka som er et subanagram av S. Å finne subanagrammer med denne teknikken kjører i O(d · (w + s)), der d er størrelsen på ordboka, w er størrelsen til det største ordet i ordboka, og s er størrelsen til S.</p></div>" +
      '<div><p class="small"><b>Strategi 2</b></p><div class="et-skel-s2"></div>' +
      "<p class=\"small\">I pseudokoden ovenfor lager vi et hashmap, der hver nøkkel k er en streng med bokstaver sortert i alfabetisk rekkefølge, og verdien er en liste med anagrammer av k som finnes i ordboka. For å finne alle subanagrammer i ordboken, må vi slå opp på alle sorterte substrenger av S i hashmapet. Å finne subanagrammer med denne teknikken kjører i O(2<sup>s</sup>), altså eksponensiell tid med hensyn til størrelsen av S.</p></div></div>" +
      "<p>Drøft fordeler og ulemper mellom strategi 1 og strategi 2 med tanke på kjøretid.</p>"
  });
  sheetPc(qs(".et-skel-s1", o), PC_STRAT1);
  sheetPc(qs(".et-skel-s2", o), PC_STRAT2);
  return o;
  }

  /* ---------- H2020-8: oppgavetekst (ordrett) + steg-demo av verifikatoren ---------- */
  var TYPER = "<p><b>Type 1</b> er en urettet komplett graf (brevduene)<br><b>Type 2</b> er en urettet graf med en hamiltonsk sykel (sykkelstien)<br>" +
    "<b>Type 3</b> er et urettet tre (nettverkskabler)<br><b>Type 4</b> er en urettet ikke-sammenhengende graf (roping)</p><p>Alle grafer i denne oppgaven har mer enn to noder.</p>";
  function o8() {
  var o = IN.oppg({
    intro: "<p>Du ønsker å forbedre kommunikasjonsnettverket i en liten by. Historisk sett har all kommunikasjon mellom husstander i byen skjedd ved hjelp av brevduer. På denne måten kunne alle nå hverandres hus direkte. Men brevduer er upraktiske, så du skal finne bedre måter for husstandene å kommunisere med hverandre på. Du har utforsket følgende muligheter:</p>" +
      "<ul><li>Den nye startupen HamiltonBikes har begynt å bygge nye sykkelstier og kommer til å drifte brevlevering mellom alle hus. De garanterer at man kan ta seg en sykkeltur som går innom alle husene i byen, uten å måtte sykle forbi det samme huset to ganger.</li>" +
      "<li>Husene kan forbindes med nettverkskabel, men med hensyn til kostnaden, vil redundante forbindelser unngås.</li>" +
      "<li>Noen bor så nærme hverandre at naboer kan rope for rask én-til-én kommunikasjon.</li></ul>" +
      "<p>Du innser at hver kommunkasjonsform kan formaliseres som en graf der nodene er husstandene og kantene er forbindelsene mellom disse. Du identifiserer fire typer grafer, som hver tilsvarer en kommunikasjonsform:</p>" +
      TYPER + "<p>Graftypene er gjentatt der du trenger det, så du trenger ikke å huske dem.</p>" +
      '<p><b>(a)</b> <span class="et-p">(7p)</span></p>' +
      "<p>Din første oppgave er å sjekke om HamiltonBikes virkelig leverer det de lover. De tilbyr å sende deg et kart over sykkelstiene og et forslag på en runde som går forbi hvert hus nøyaktig én gang. Du oversetter problemet til et avgjørelsesproblem:</p>" +
      "<p><b>Type2</b><br><b>Instans:</b> En graf G<br><b>Spørsmål:</b> Inneholder G en hamiltonsk sykel?</p>" +
      "<p>Du bestemmer deg for å lage en effektiv algoritme som verifisererer Type2. Algoritmen tar en graf og et sertifikat som input, og svarer JA hvis sertifikatet bekrefter at grafen er av type 2, NEI ellers. Algoritmen skal kjøre i polynomisk tid.</p>" +
      "<p>HamiltonBikes leverer sertifikatet som et array C av noder i G, slik at hver node er med nøyaktig én gang. Skriv pseudokode for verifikatoren Type2Verifier.</p>" +
      '<p class="small"><b>ALGORITHM: VERIFIKATOR FOR TYPE2</b></p><div class="et-skel-8a"></div>' +
      '<p><b>(b)</b> <span class="et-p">(3p)</span></p>' +
      "<p>Forklar kort (maks 4 setninger) hvorfor svaret på forrige deloppgave viser at avgjørelsesproblemet Type2 er i NP. Ikke gi en detaljert kjøretidsanalyse av pseudokoden din for Type2Verifier.</p>" +
      "<p>Dersom svaret ditt på forrige deloppgave har mangler, kan du gjøre nødvendige antagelser uten å få følgefeil.</p>",
    figsAfter: [{ cap: "Eksempelgraf (egen figur, ikke fra arket)", draw: function (h) { h.innerHTML = gsvg(HAMG, { w: 320, h: 235, order: { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5 }, edge: { "a|b": "on", "b|c": "on", "c|d": "on", "d|e": "on", "e|f": "on", "a|f": "on" }, label: "Eksempelgraf med en hamiltonsk sykel a, b, c, d, e, f" }); } }],
    outro: demoLink("pnp", "ham-graf", "Vær verifikatoren")
  });
  sheetPc(qs(".et-skel-8a", o), { name: "Type2Verifier", params: "G, C", input: "En graf G og et array av noder C", output: "Returner JA hvis C viser at G er av type 2, NEI ellers", lines: [{ code: "// Fyll ut", indent: 1 }] });
  return o;
  }

  // Steg-demo: Type2Verifier på eksempelgrafen. Linjekoder som i kursets stType2Verifier (1 = Procedure-linja).
  var HAM_VG = { directed: false, nodes: Object.keys(HAMG.nodes).map(function (id) { return { id: id, x: HAMG.nodes[id][0], y: HAMG.nodes[id][1] }; }), edges: HAMG.edges };
  function genHam(inp) {
    var g = inp[0], C = inp[1].slice(), N = C.length, steps = [], ok = {};
    function snap(line, text, tag, cur, bad, res) {
      var nodes = {}, edges = {}, lab = {};
      C.forEach(function (v, k) { lab[v] = String(k); });
      Object.keys(ok).forEach(function (k) { edges[k] = "tree"; });
      if (cur) { edges[cur[0] + ">" + cur[1]] = "hot"; nodes[cur[0]] = "cur"; nodes[cur[1]] = "cur"; }
      if (bad) { nodes[bad[0]] = "warn"; nodes[bad[1]] = "warn"; }
      steps.push({ line: line, g: g, nodes: nodes, edges: edges, lab: lab, text: text, tag: tag, result: res || null,
        panel: [{ label: "C:", items: C.map(function (v, k) { return k + ": " + v; }) }] });
    }
    snap(2, t("Forslaget har " + N + " byer. Nå sjekker vi at det går en vei mellom hver by og den neste.",
      "N ← |C| = " + N + ". Tallet ved hver node er plassen i C.",
      "N ← " + N + ". Oppgaven lover at C har hver node nøyaktig én gang, så vi sjekker bare kantene."), "N = " + N);
    for (var i = 0; i < N; i++) {
      var u = C[i], v = C[(i + 1) % N], last = i === N - 1;
      var has = g.edges.some(function (e) { return (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u); });
      snap(4, t("Går det en vei mellom " + u + " og " + v + "?" + (last ? " Det er veien hjem igjen til start." : ""),
        "i = " + i + ": finnes {" + u + ", " + v + "} i E?" + (last ? " (i + 1) mod N = 0, så dette er kanten tilbake til C[0]." : ""),
        "i = " + i + ": {C[" + i + "], C[" + ((i + 1) % N) + "]} = {" + u + ", " + v + "}" + (last ? ", den lukkende kanten" : "") + "."), "i = " + i, [u, v]);
      if (!has) {
        snap(5, t("Det går ingen vei mellom " + u + " og " + v + ". Da er forslaget feil.",
          "{" + u + ", " + v + "} er ikke en kant i G. return NEI.",
          "{" + u + ", " + v + "} ∉ E, så C er ikke en sykel i G. Verifikatoren svarer NEI for dette sertifikatet og leter ikke etter et annet."), "NEI", null, [u, v], "NEI");
        return steps;
      }
      ok[u + ">" + v] = 1;
    }
    snap(6, t("Alle veiene fantes, også veien hjem. Forslaget er en tur innom alle byene.",
      "Alle " + N + " kantene finnes. return JA.",
      "Alle " + N + " kantene i den foreslåtte sykelen er i E: C er en hamiltonsk sykel. N kantoppslag, altså polynomiell tid."), "JA", null, null, "JA");
    return steps;
  }
  var HAM_DEMO = { engine: "graph", gen: genHam, input: [HAM_VG, ["a", "b", "c", "d", "e", "f"]], inputNavn: "Gyldig sykel",
    presets: { "Mangler en kant": [HAM_VG, ["a", "b", "e", "d", "c", "f"]], "Bare en sti (siste → første mangler)": [HAM_VG, ["a", "c", "b", "e", "f", "d"]] },
    pseudo: "stType2Verifier", del: "(a)", label: "Kjør Type2Verifier på eksempelgrafen",
    legend: [{ cls: "compare", label: "Kanten vi sjekker nå" }, { cls: "sorted", label: "Kanten finnes" }, { cls: "swap", label: "Kanten mangler (endene)" }],
    svar: function (s) { return s ? s.result : null; }, fasit: "JA" };

  /* ---------- Kortene ---------- */
    def("H2021-6", { host: "#exam-h2021-6" }, function () { return { key: "H2021-6", year: "H2021", title: "Litt om beregnbarhet og kompleksitet", oppgave_nr: "Oppgave 6", points: 8,
      ark: "Litt om beregnbarhet og kompleksitet", ordrett: true,
      oppgave: IN.oppg({
        intro: "<p>For alle spørsmålene nedenfor, svar Sant eller Usant.</p>",
        parts: tfParts(["Det er bevist at P = NP.", "Det er bevist at P ≠ NP.",
          "Alle NP-komplette problemer kan polynomtidsreduseres til hverandre.", "Alle problemer i P er også i NP.",
          "Alle avgjørelsesproblemer er enten i P eller NP.", "Alle problemer hvor JA-instanser kan verifiseres i polynomiell tid, er i NP.",
          "Hvis noen klarer å løse avgjørelsesproblemet Hamiltonsykel, Knapsack eller Sudoku i polynomiell tid, så har de bevist at P = NP.",
          "Alle avgjørelsesproblemer kan løses med en rask nok datamaskin."])
      }),
      losning: sol(tfSol([
        [false, "P mot NP er et åpent problem. Ingen har bevist noen av retningene."],
        [false, "Heller ikke det er bevist. De fleste tror det, men tro er ikke bevis."],
        [true, "Hvert NP-komplett problem er i NP og NP-hardt. Da kan alt i NP, også de andre NP-komplette, reduseres til det i polynomiell tid."],
        [true, "Kan du løse et problem i polynomiell tid, kan du verifisere et JA-svar ved å løse det selv. P ⊆ NP."],
        [false, "Siden P ⊆ NP, sier påstanden at alt er i NP. Men det finnes problemer utenfor NP, for eksempel uløselige problemer som stoppeproblemet (HALT)."],
        [true, "Det er selve definisjonen av NP."],
        [true, "Alle tre er NP-komplette (Knapsack som avgjørelsesproblem, Sudoku på generelle n × n-brett). En polynomiell algoritme for ett NP-komplett problem gir polynomielle algoritmer for alt i NP, og da er P = NP."],
        [false, "Stoppeproblemet (HALT) er uløselig: ingen algoritme løser det, uansett hvor rask maskinen er."]
      ])),
      kjerne: "<p>Fire fakta dekker hele oppgaven: P ⊆ NP. P vs NP er åpent. NP-komplett = i NP og NP-hardt, så alle NP-komplette reduseres til hverandre. Uløselige problemer som HALT ligger utenfor både P og NP.</p>",
      tips: ["Sensorveiledningen gir 1 poeng for riktig og −1 for galt eller blankt, med 0 som minste og 8 som største sum. Blankt koster altså like mye som galt: svar på alle åtte.",
        "Se etter ordet «bevist». Om P og NP er nesten alt som er «bevist», usant."]
    }; });

    def("H2020-8", { host: "#exam-h2020-8" }, function () { return { key: "H2020-8", deler: ["(a)", "(b)"], year: "H2020", title: "Fire typer grafer: verifikator og NP", oppgave_nr: "Oppgave 8 (a–b)", points: 10,
      ark: "Fire typer grafer", ordrett: true,
      avvik: "<p>Avvik fra eksamensarket: bare deloppgave (a) og (b) vises her, fordi resten av oppgaven handler om grafer og står på <a href=\"06-grafer.html\">Grafer</a>. Eksempelgrafen er vår egen figur, fordi arket ikke har noen figur til (a) og (b).</p>",
      oppgave: o8(),
      demo: HAM_DEMO,
      losning: sol(["Gå gjennom C med i fra 0 til N − 1, og sjekk at {C[i], C[(i + 1) mod N]} er en kant i G. Mangler én kant, returner NEI. Finnes alle, returner JA. mod N tar med kanten fra den siste noden tilbake til den første.",
        "Type2Verifier går i polynomiell tid (N = |V| kantoppslag). Altså kan en JA-instans av Type2 verifiseres i polynomiell tid når vi får et sertifikat, og det er nettopp definisjonen av at Type2 er i NP."], ["stType2Verifier"]),
      kjerne: "<p>En verifikator <b>sjekker</b> et forslag. Den skal ikke selv lete etter en sykel. Polynomiell verifikator ⇒ problemet er i NP.</p>",
      tips: ["(a): 5 poeng for å sjekke sykelens kanter i G (−1 hvis kanten tilbake til start mangler), og 2 poeng for signatur og klarhet.", "BFS eller DFS som prøver å finne en sykel, ga 0 poeng.", "(b): koble verifikatorens polynomielle kjøretid direkte til definisjonen av NP."]
    }; });

    def("H2020-7", { host: "#exam-h2020-7a" }, function () { return { key: "H2020-7", deler: ["(a)"], year: "H2020", title: "Subanagram: hva er kjøretiden?", oppgave_nr: "Oppgave 7 (a)", points: 4,
      ark: "Subanagram", ordrett: true,
      avvik: "<p>Avvik fra eksamensarket: bare deloppgave (a) vises her. (b) og (c) står på <a href=\"05-hashing.html\">Hashing</a>, og (d) på <a href=\"01-sortering.html\">Sortering</a>. Svaralternativene var et flervalg i Inspera og står ikke på arket. De er hentet fra sensorveiledningen.</p>",
      oppgave: o7a(),
      losning: sol(["<b>O(s · w).</b> Løkka går s ganger, én gang per bokstav i S. Hver runde sjekker om c er i r og fjerner kanskje en forekomst. r har opptil w tegn, så hver runde er O(w). Kopien i starten er O(w). Totalt O(w + s · w) = O(s · w)."]),
      kjerne: "<p>Runder × kostnad per runde. Her ligger den lineære kostnaden gjemt i operasjonene på r, ikke i en synlig indre løkke.</p>",
      tips: ["Se etter operasjoner på lister og strenger inni løkker: kopiere, sjekke om noe finnes og fjerne er lineære her.", "Med en frekvenstabell (hashmap fra bokstav til antall) blir det O(w + s). Det var neste deloppgave."]
    }; });

    def("H2020-7", { host: "#exam-h2020-7c" }, function () { return { key: "H2020-7", deler: ["(c)"], year: "H2020", title: "Subanagram: to strategier", oppgave_nr: "Oppgave 7 (c)", points: 6,
      ark: "Subanagram", ordrett: true,
      avvik: "<p>Avvik fra eksamensarket: bare deloppgave (c) vises her. IsSubanagramOf2 er prosedyren fra (b), som står på <a href=\"05-hashing.html\">Hashing</a>. På arket står de to strategiene i hver sin kolonne, slik som her.</p>",
      oppgave: o7c(),
      losning: sol(["Strategi 1 avhenger av d, w og s. Strategi 2 avhenger bare av s, men eksponentielt.",
        "Ordene i en ordbok er korte, mens ordboka er stor. Derfor er det d som dominerer i Strategi 1: hele ordboka må gjennomgås for hver spørring.",
        "Strategi 2 slipper å gå gjennom ordboka per spørring, men 2ˢ vokser raskt. Den lønner seg når S er kort og D er stor. For en stor engelsk ordbok lå grensen rundt s ≈ 17 i forsøkene til dem som laget oppgaven.",
        "Hashmapet i Strategi 2 koster noe å bygge, men det gjøres bare én gang og fordeles på alle spørringene.",
        "Konklusjon: velg Strategi 2 for korte S, og Strategi 1 for lange."], null, { plain: true }),
      kjerne: "<p>Forarbeid én gang mot eksponentiell avhengighet av s. Eksponentiell tid er sjelden bra, men den kan være grei når eksponenten holdes liten.</p>",
      tips: ["Det viktigste poenget (3 p) var å se at Strategi 2 lønner seg når S er liten og D er stor.", "Bruk O-notasjon (−1 hvis ikke) og definer variablene (−3 for å bruke n uten å si hva det er)."]
    }; });

    def("H2022-2", { host: "#exam-h2022-2" }, function () { return { key: "H2022-2", year: "H2022", title: "Litt av hvert", oppgave_nr: "Oppgave 2", points: 10,
      ark: "Litt av hvert", ordrett: true,
      avvik: "<p>Avvik fra eksamensarket: arket har ingen innledning til påstandene. De var sant/usant-spørsmål i Inspera, og linja «Svar Sant eller Usant» er lagt til her for å si hvordan de besvares. «kan ikke har» i (j) står slik på arket.</p>",
      oppgave: IN.oppg({
        intro: "<p class=\"small muted\">Svar Sant eller Usant på hver påstand.</p>",
        parts: tfParts(["Binære trær består av noder som har opptil to barn.", "Hvis en algoritme bruker O(n) antall steg sier vi den har lineær kjøretidskompleksitet.", "Kjøretidskompleksitet til Mergesort er O(n · log(n)).",
          "Det er umulig å sjekke om et array er sortert i O(n).", "Binærsøk på arrayer er betydelig raskere enn binærsøk på lenkede lister.",
          "Kjøretidskompleksitet sier noe om hvor mange steg en algoritme bruker i forhold til størrelsen på input.", "Dersom en algoritme har bedre kjøretidskompleksitet enn en annen algoritme, så vil den alltid bruke færre steg uansett størrelse på input.",
          "Huffman-koding brukes for å komprimere data.", "Rotnoden av et tre er den eneste noden som ikke har en forelder.", "En graf med n noder kan ikke har mer enn n kanter."])
      }),
      losning: sol(tfSol([
        [true, "Det er definisjonen av et binærtre."],
        [true, "O(n) er den lineære klassen. (Strengt tatt er O en øvre grense, men på eksamen leses «O(n) steg» som «lineær».)"],
        [true, "I alle tilfeller: log n nivåer med O(n) fletting per nivå."],
        [false, "Gå gjennom arrayet én gang og sjekk at A[i] ≤ A[i + 1] for alle naboer. Det er O(n)."],
        [true, "Binærsøk hopper til midten. Det er O(1) i et array, men krever at vi går dit steg for steg i en lenket liste."],
        [true, "Det er det kjøretidskompleksitet måler: veksten i antall steg når input vokser."],
        [false, "O sier noe om veksten for store n. For små input kan konstantene gjøre at den «dårligere» algoritmen bruker færre steg."],
        [true, "Vanlige symboler får korte koder, så teksten blir kortere."],
        [true, "Alle andre noder har nøyaktig én forelder."],
        [false, "En urettet graf kan ha opptil n(n − 1)/2 kanter, langt flere enn n."]
      ])),
      kjerne: "<p>Skill mellom veksttakt (O) og faktisk antall steg. O sier hva som skjer når n blir stor, ikke hva som er raskest for hvert input.</p>",
      tips: ["Påstander med «alltid» og «for alle» er ofte usanne. Let etter et moteksempel.", "Spør deg selv: finnes det en enkel løkke som klarer det? Da er «umulig i O(n)» usant."]
    }; });

  // Brukes også av demoene på temasiden
  IN.kortData.felles(SIDE, { t: t, esc: esc, ekey: ekey, gsvg: gsvg, HAMG: HAMG });
})();
