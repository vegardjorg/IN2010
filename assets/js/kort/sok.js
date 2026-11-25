/* ============================================================
   IN2010 guide · kort/sok.js
   Eksamenskortene for Søk (02-sok.html): én definisjon per kort, lest av temasiden og crash.html.
   Oppgavetekstene står ordrett med kildelinje (som før). Fullpoengssvar og sensorveiledning
   ligger i perfekt/sok.js (og perfekt/delt.js for oppgaver som deles med andre sider).
   Lastes etter perfekt/*.js. Se IN.kortData i core.js.
   ============================================================ */
(function () {
  "use strict";
  var IN = window.IN, qs = IN.qs, el = IN.el;
  var SIDE = "sok";
  function def(key, meta, fn) { meta.side = SIDE; return IN.kortData.def(key, meta, fn); }

  /* ---------- Felles tegning: søyler + info + bleking utenfor søkeområdet ---------- */
  function renderSearch(s, ctx) {
    // Variabellinja ligger øverst i scenen og gjenbrukes mellom stegene (varline.js)
    var stage = ctx.stage, vl = s.vars && IN.varLine ? IN.varLine.attach(stage) : null;
    if (vl) IN.varLine.clearStage(stage); else { if (IN.varLine) IN.varLine.detach(stage); IN.clear(stage); }
    var box = el("div", { class: "sok-viz" });
    function infoRow(st) {
      var row = el("div", { class: "sok-info" });
      st.info.forEach(function (p) { row.appendChild(el("span", { class: "pill" }, [el("span", { class: "k", text: p[0] + ": " }), el("b", { text: String(p[1]) })])); });
      return row;
    }
    var irowEl = s.info && s.info.length ? infoRow(s) : null;
    if (irowEl) box.appendChild(irowEl);
    function mapRow(st) {
      var mrow = el("div", { class: "sok-map", "aria-label": "Innholdet i hashmapet H" }, [el("span", { class: "lbl", text: "H:" })]);
      if (!st.map.length) mrow.appendChild(el("span", { class: "muted small", text: "(tomt)" }));
      st.map.forEach(function (kv) { mrow.appendChild(el("span", { class: "sok-chip" + (kv[0] === st.mapNew ? " is-new" : ""), text: kv[0] + " → " + kv[1] })); });
      return mrow;
    }
    var mrowEl = s.map ? mapRow(s) : null;
    if (mrowEl) box.appendChild(mrowEl);
    var bh = el("div"); box.appendChild(bh);
    stage.appendChild(box);
    // Hashmapet vokser for hvert steg: reserver høyden til det største, så søylene står stille
    if (mrowEl && s.lay && s.lay.steps) {
      var w = stage.clientWidth;
      if (stage.__mapLay !== s.lay || stage.__mapW !== w) {
        var mh = 0;
        s.lay.steps.forEach(function (st) {
          if (!st.map) return;
          var t = mapRow(st); box.insertBefore(t, mrowEl);
          mh = Math.max(mh, t.getBoundingClientRect().height); box.removeChild(t);
        });
        stage.__mapLay = s.lay; stage.__mapW = w; stage.__mapH = mh;
      }
      mrowEl.style.minHeight = stage.__mapH + "px";
    }
    // Info-raden kan bryte over flere linjer når teksten vokser (f.eks. «par» i to-sum): reserver høyden
    if (irowEl && s.lay && s.lay.steps) {
      var iw = stage.clientWidth;
      if (stage.__infLay !== s.lay || stage.__infW !== iw) {
        var ih = 0;
        s.lay.steps.forEach(function (st) {
          if (!st.info || !st.info.length) return;
          var t = infoRow(st); box.insertBefore(t, irowEl);
          ih = Math.max(ih, t.getBoundingClientRect().height); box.removeChild(t);
        });
        stage.__infLay = s.lay; stage.__infW = iw; stage.__infH = ih;
      }
      irowEl.style.minHeight = stage.__infH + "px";
    }
    IN.vizBars(bh, s, { varHost: stage });
    var cols = IN.qsa(".bar-col", bh);
    if (s.range) cols.forEach(function (c, i) { if (i < s.range[0] || i > s.range[1]) c.classList.add("sok-out"); });
    if (s.dim) s.dim.forEach(function (i) { if (cols[i]) cols[i].classList.add("sok-out"); });
  }
  var DIM = "color-mix(in srgb, var(--c-default) 30%, transparent)";
  // «3, 8, 12 ; 12» → [3, 8, 12, 12] (siste tall = x)
  function parseWithX(maxN) {
    return function (str) {
      var parts = String(str).split(/[;|]|x\s*=/i);
      var nums = parts[0].split(",").map(function (v) { return parseInt(v.trim(), 10); })
        .filter(function (v) { return !isNaN(v) && v >= 0; }).slice(0, maxN || 12);
      if (!nums.length) return [];
      var x = parts.length > 1 ? parseInt(parts[1].replace(/[^\d-]/g, ""), 10) : NaN;
      if (isNaN(x)) x = nums[Math.floor(nums.length / 2)];
      return nums.concat([x]);
    };
  }

  // Løkkespennene under søylene (heltrukket = for, stiplet = while, tykk = kallets område)
  var SPENN = { linearSearch: ["for"], binarySearch: ["while"], binarySearchFirst: ["while"], binarySearchRec: ["call"],
    findDupSorted: ["while"], findDupScan: ["for"], findDupHash: ["for"], findMinKSelect: ["for"], findSummandsSorted: ["while"] };
  // «Prøv selv»-lenke fra et eksamenskort til demoen i samme fane (som på 04–07)
  function demoLink(fane, demo, txt) { return '<p class="small muted">Prøv selv: <a href="#fane=' + fane + "&amp;oppg=" + demo + '">' + txt + "</a>.</p>"; }
  // Pseudokode inne i et eksamenskort (BYGGEGUIDE 5.4)
  function codeBlock(key) {
    var w = el("div", { class: "sok-sol-code" }), h = el("div");
    w.appendChild(h);
    IN.pseudo.render(h, IN.algos[key], {});
    var bo = IN.pseudo.bigO(IN.algos[key], { compact: true });
    if (bo) w.appendChild(bo);
    return w;
  }
  /* ---- WP0-eksamenskort: oppgavetekst ordrett fra eksamensarket
     (plan/gjennomgang/08-eksamenstekst-ordrett.md), perfekt svar og
     sensorveiledning i assets/js/perfekt/sok.js ---- */
  // Fyll .et-skel-plassene i rekkefølge med skjelettkoden fra arket
  function skelAll(node, algos) {
    IN.qsa(".et-skel", node).forEach(function (h, i) { if (algos[i]) IN.pseudo.render(h, algos[i], { tooltips: false }); });
    return node;
  }
  function sk(name, params, input, output) {
    return { name: name, params: params, input: input, output: output, lines: [{ code: "// · · ·", indent: 1 }] };
  }
  var SKEL = '<div class="et-skel"></div>';
  function etp(p) { return ' <span class="et-p">(' + p + "p)</span>"; }
  // Egen motor for demoene i kortene: samme tegning som demoene på siden (fast høyde på H-raden)
  IN.registerEngine("sokside", { viz: "vizBars", file: "assets/js/viz-bars.js", host: "et-bars-host",
    render: function (s, ctx) { renderSearch(s, ctx); } });
  function legOf(base, key) { return base.concat(IN.varLine ? IN.varLine.legend(SPENN[key]) : []); }
  function marksSvar(last) { return last && last.marks && last.marks.target ? [].concat(last.marks.target).join(", ") : null; }

  function solution(items) {
    var ol = el("ol");
    items.forEach(function (it) {
      var li = el("li");
      if (typeof it === "string") li.innerHTML = it;
      else { li.innerHTML = it.html || ""; (it.code || []).forEach(function (k) { li.appendChild(codeBlock(k)); }); if (it.after) li.appendChild(el("p", { html: it.after })); }
      ol.appendChild(li);
    });
    return ol;
  }
  def("H2020-5", { host: "#exam-sortersok" }, function () { return {
    key: "H2020-5", year: "H2020", oppgave_nr: "Oppgave 5", title: "Søk", points: 12,
    ark: "Søk", ordrett: true,
    oppgave: (function () {
      function P(name, body) { return { name: name, params: "A, B", lines: body.map(function (x) { return { code: x[0], indent: x[1] }; }) }; }
      var ISECT = [
        P("Intersection1", [["for x in B do", 1], ["if Search(A, x) then", 2], ["print(x)", 3]]),
        P("Intersection2", [["for x in B do", 1], ["if BinarySearch(A, x) then", 2], ["print(x)", 3]]),
        P("Intersection3", [["Sort(A)", 1], ["for x in B do", 1], ["if BinarySearch(A, x) then", 2], ["print(x)", 3]]),
        P("Intersection4", [["for x in B do", 1], ["Sort(A)", 2], ["if BinarySearch(A, x) then", 2], ["print(x)", 3]])
      ];
      return IN.oppg({
        intro: "<p>Anta at vi har tre prosedyrer:</p><ul><li>Search – som gjør et rett frem søk på lineær tid</li><li>BinarySearch – som gjør et binærsøk</li><li>Sort – sorterer i O(n · log(n))</li></ul>" +
          "<p>Prosedyrene nedenfor tar et array A med heltall av størrelse n og et array B av størrelse k som input. Alle skal printe tallene som er i både A og B.</p>",
        figs: ISECT.map(function (a) { return { cls: "code", draw: function (h) { IN.pseudo.render(h, a, { tooltips: false }); } }; }),
        parts: [
          { note: "Tre av disse prosedyrene gir alltid riktig svar, og én kan gi feil svar. Vi lurer på når man burde bruke hvilken variant av Intersection avhengig av hvor stor k (altså lengden av B) er i forhold til n (altså lengden til A). Du trenger bare å oppgi ett riktig svar hvis flere prosedyrer gir opphav til samme kjøretidskompleksitet." },
          "Hvis B inneholder ett element, altså k = 1, hvilken prosedyre gir riktig svar med minimal kjøretidskompleksitet?",
          "Hvis B inneholder log(n) elementer, altså k = log(n), hvilken prosedyre gir riktig svar med minimal kjøretidskompleksitet?",
          "Hvis B inneholder n elementer, altså k = n, hvilken prosedyre gir riktig svar med minimal kjøretidskompleksitet?",
          "Hvis B inneholder n² elementer, altså k = n², hvilken prosedyre gir riktig svar med minimal kjøretidskompleksitet?"
        ]
      });
    })(),
    losning: [
      "<b>Regn selv:</b> tabellen over kortet viser alle fire tilfellene for n = 1 000 og n = 1 000 000. Det er ingen steg-demo i dette kortet, fordi oppgaven handler om kjøretider og ikke om en kjøring.",
      "<b>Først:</b> Intersection2 kan gi feil svar, for A er ikke nødvendigvis sortert. Intersection4 er aldri best, for den gjentar en sortering som bare trengs én gang.",
      "<b>(a) k = 1:</b> Intersection1. Ett rett-frem søk er O(n), mens Intersection3 må betale O(n log n) for sorteringen.",
      "<b>(b) k = log n:</b> Intersection1 og Intersection3 godtas begge. I1 = O(n log n), I3 = O(n log n + log n · log n) = O(n log n).",
      "<b>(c) k = n:</b> Intersection3. O(n log n + n log n) = O(n log n), mot O(n²) for Intersection1.",
      "<b>(d) k = n²:</b> Intersection3. O(n log n + n² log n) = O(n² log n), mot O(n³) for Intersection1."
    ],
    kjerne: "<p>Oppgaven tester avveiningen «sorter én gang, søk mange ganger». Når k er liten, lønner rett-frem søk seg. Når k vokser, lønner det seg å betale O(n log n) én gang og deretter binærsøke. Og binærsøk forutsetter sortert input – derfor er Intersection2 ugyldig, ikke bare treg.</p>",
    tips: [
      "Skriv totalkostnaden som «forarbeid + k · kostnad per søk», og sett inn k for hvert tilfelle.",
      "Binærsøk i et usortert array er <b>feil</b>, ikke bare tregt. Si det.",
      "Å sortere inne i løkka er aldri optimalt. Nevn det kort, så sensor ser at du har vurdert det."
    ]
  }; });
  def("H2023-3", { host: "#exam-duplikat" }, function () { return {
    key: "H2023-3", year: "H2023", oppgave_nr: "Oppgave 3", title: "Finn duplikat", points: 12,
    ark: "Finn duplikat", ordrett: true, poengkilde: "sv",
    oppgave: skelAll(IN.oppg({
      intro: "<p>Du er gitt et array A med sammenlignbare elementer. Du får vite at A inneholder nøyaktig ett duplikat. Altså er alle elementer i A unike, bortsett fra ett element, som forekommer nøyaktig to ganger.</p>",
      parts: [
        { t: "Anta at du er gitt et sortert array A, og får vite at x er duplikatet i A. Skriv en effektiv prosedyre som skriver ut de to posisjonene som inneholder x. Oppgi kjøretidskompleksiteten på algoritmen." + etp(4) + SKEL },
        { t: "Anta at du er gitt et sortert array A (og nå får du ikke oppgitt elementet som er duplisert). Skriv en effektiv prosedyre som skriver ut de to posisjonene til elementet som forekommer to ganger. Oppgi kjøretidskompleksiteten på algoritmen." + etp(3) + SKEL },
        { t: "Anta at du er gitt et array A (nå kan du ikke anta at arrayet er sortert). Skriv en effektiv prosedyre som skriver ut de to posisjonene til elementet som er duplisert. Oppgi kjøretidskompleksiteten på algoritmen." + etp(5) + SKEL }
      ]
    }), [
      sk("FindSortedIndicesOfDuplicate", "A, x", "Et sortert array A med n sammenlignbare elementer, og et element x som forekommer nøyaktig to ganger", "Skriver ut de to posisjonene 0 ≤ i < j < n hvor A[i] = A[j] = x forekommer"),
      sk("FindSortedDuplicateIndices", "A", "Et sortert array A med n sammenlignbare elementer", "Skriver ut de to posisjonene 0 ≤ i < j < n hvor A[i] = A[j]"),
      sk("FindDuplicateIndices", "A", "Et array A med sammenlignbare n elementer", "Skriver ut de to posisjonene 0 ≤ i < j < n hvor A[i] = A[j]")
    ]),
    demoLabel: "Se de tre løsningene kjøre, én fane per deloppgave",
    demo: [
      { engine: "sokside", gen: "findDupSorted", input: [2, 4, 7, 11, 11, 15, 18, 21, 25, 11], inputNavn: "Sortert, x = 11",
        presets: { "Kopien til høyre": [1, 3, 5, 8, 8, 13, 20, 8], "Kopien først": [4, 4, 6, 9, 12, 14, 17, 4] },
        parseInput: parseWithX(12), inputLabel: "f.eks. 1,3,5,5,9 ; 5", pseudo: "findDupSorted",
        legend: legOf([{ cls: "compare", label: "sammenlignes nå" }, { cls: "target", label: "funnet" }, { cls: "default", label: "utenfor søkeområdet (blek)", color: DIM }], "findDupSorted"),
        label: "(a) Binærsøk og se på naboene", del: "(a)", fasit: "3, 4", svar: marksSvar },
      { engine: "sokside", gen: "findDupScan", input: [2, 5, 7, 9, 9, 12, 15, 18], inputNavn: "Sortert, duplikat i midten",
        presets: { "Duplikat bakerst": [1, 3, 4, 6, 8, 10, 13, 13], "Duplikat først": [3, 3, 5, 6, 9, 11] },
        inputLabel: "f.eks. 1,4,4,7,9", pseudo: "findDupScan",
        legend: legOf([{ cls: "compare", label: "naboparet som sammenlignes" }, { cls: "target", label: "duplikatet" }, { cls: "default", label: "ferdig sjekket (blek)", color: DIM }], "findDupScan"),
        label: "(b) Sammenlign nabopar", del: "(b)", fasit: "3, 4", svar: marksSvar },
      { engine: "sokside", gen: "findDupHash", input: [7, 3, 9, 1, 6, 3, 8], inputNavn: "Usortert",
        presets: { "Duplikat langt unna": [5, 2, 8, 4, 9, 1, 7, 5], "Duplikat bakerst": [4, 8, 1, 6, 2, 9, 2] },
        inputLabel: "f.eks. 5,2,8,2,9", countControl: { min: 3, max: 9 }, pseudo: "findDupHash",
        legend: legOf([{ cls: "compare", label: "slås opp i H" }, { cls: "min", label: "legges inn i H" }, { cls: "target", label: "duplikatet" }, { cls: "default", label: "ferdig sjekket (blek)", color: DIM }], "findDupHash"),
        label: "(c) Hashmap fra verdi til første indeks", del: "(c)", fasit: "1, 5", svar: marksSvar }
    ],
    losning: solution([
      { html: "<b>(a) O(log n).</b> Bruk et binærsøk som er endret til å returnere <i>indeksen</i> der x ligger (ikke bare true/false). Én av de to kopiene blir funnet. Fordi A er sortert, står den andre rett ved siden av: sjekk venstre nabo, ellers er det høyre.",
        code: ["findDupSorted"],
        after: "<b>Poeng:</b> opptil 4p for logaritmisk tid, 2p for lineær. −1p for feil eller manglende kjøretid, opptil −1p for ikke å si at binærsøket må endres. Over lineær tid gir 0p." },
      { html: "<b>(b) O(n).</b> Gå gjennom nabopar og stopp når to naboer er like. I et sortert array må duplikatet være et slikt par.",
        code: ["findDupScan"],
        after: "<b>Poeng:</b> opptil 3p for lineær tid. −1p for feil eller manglende kjøretid. Over lineær tid gir opptil 1p." },
      { html: "<b>(c) Forventet O(n)</b> med et hashmap fra verdi til indeks: for hvert element, sjekk om verdien er sett før. Ved treff skriver vi ut lagret og nåværende indeks.",
        code: ["findDupHash"],
        after: "Alternativ på O(n log n): sorter med en sammenligningsbasert algoritme (Merge sort eller Heapsort; Quicksort går også, men si at den er O(n²) i verste tilfelle – ikke bøttesortering eller radix sort, for bare sammenlignbarhet er gitt). Sorter en kopi, finn duplikatverdien med løsningen fra (b), og gå så gjennom det opprinnelige arrayet én gang til og skriv ut de to posisjonene der verdien står. <b>Poeng:</b> opptil 5p for lineær, opptil 4p for O(n log n), opptil 1p for dårligere. −1p for feil eller manglende kjøretid." }
    ]),
    kjerne: "<p>Oppgaven tester om du utnytter antakelsene: sortering gir binærsøk og nabosammenligning, og når sorteringen forsvinner, gir hashing lineær tid. Det sentrale er å velge riktig verktøy for hver antakelse og begrunne kjøretiden.</p>",
    tips: [
      "I (a): skriv eksplisitt at binærsøket returnerer en indeks. Ellers kan det trekkes opptil 1p.",
      "I (c): nevn hashing først (forventet O(n)). Sorterer du, begrunn hvorfor bøttesortering og radix sort ikke kan brukes.",
      "Oppgi kjøretid i <i>hver</i> deloppgave – det trekkes for hver som mangler."
    ]
  }; });
  def("H2025-6", { host: "#exam-kminste" }, function () { return {
    key: "H2025-6", year: "H2025", oppgave_nr: "Oppgave 6", title: "Finn k minste", points: 12,
    ark: "Finn k minste", ordrett: true, poengkilde: "sv",
    oppgave: skelAll(IN.oppg({
      intro: "<p>Gitt et array A med n sammenlignbare elementer, ønsker vi å finne de k minste elementene i A der 1 ≤ k ≤ n.</p>" + SKEL +
        "<p>Skriv en prosedyre som beregner FindMin(A, k) i:</p>",
      parts: [{ t: "O(k · n)", p: 3 }, { t: "O(n · log(n))", p: 4 }, { t: "O(n · log(k)) eller O(n + k · log(n))", p: 5 }]
    }), [sk("FindMin", "A, k", "Et array A av n sammenlignbare elementer, og et heltall 1 ≤ k ≤ n", "En liste med de k minste elementene fra A")]),
    demo: {
      engine: "sokside", gen: "findMinKSelect", input: [7, 2, 9, 4, 1, 8, 6, 3, 3], inputNavn: "k = 3",
      presets: { "k = 1": [5, 8, 2, 9, 4, 7, 1], "k = 2, like verdier": [6, 3, 8, 3, 5, 9, 2] }, customInput: false,
      pseudo: "findMinKSelect",
      legend: legOf([{ cls: "compare", label: "sammenlignes" }, { cls: "min", label: "minste så langt" }, { cls: "swap", label: "byttes fram" }, { cls: "sorted", label: "en av de k minste" }], "findMinKSelect"),
      label: "(a) k runder av Selection sort på 7, 2, 9, 4, 1, 8, 6, 3 med k = 3", del: "(a)", fasit: "1, 2, 3",
      svar: function (last) { return last && last.marks && last.marks.sorted ? last.marks.sorted.map(function (i) { return last.array[i]; }).join(", ") : null; }
    },
    losning: solution([
      "<b>Sammenlign selv:</b> operasjonstelleren over kortet kjører løsningene på samme input for ulike k.",
      { html: "<b>(a) O(k·n):</b> gjenta k ganger: finn minste gjenværende element og legg det til svaret. Det er de k første rundene av Selection sort. Byttet sørger for at et element ikke blir plukket på nytt, også når det finnes like verdier.", code: ["findMinKSelect"] },
      { html: "<b>(b) O(n log n):</b> sorter hele A med en sortering som er O(n log n) i verste tilfelle, for eksempel Merge sort, og ta de k første. Quicksort (O(n²) i verste tilfelle) gir inntil 3p i stedet for 4p, og en kvadratisk sortering inntil 1p.", code: ["findMinKSort"] },
      { html: "<b>(c) O(n + k log n):</b> bygg en heap av hele A med BuildMinHeap på lineær tid, og ta ut minste element k ganger.", code: ["findMinKHeap"] },
      "<b>(c) O(n log k), alternativt:</b> hold de k minste hittil i en heap av størrelse k med det største øverst. Legg inn de k første. For hvert av de resterende: er det mindre enn toppen, bytt ut toppen og reparer heapen. Til slutt inneholder heapen de k minste.",
      "<b>Merk:</b> et riktig svar på (c) er også et riktig svar på (a) og (b), fordi en raskere algoritme også oppfyller de svakere kravene. Skriver du det, gir det full uttelling for alle tre."
    ]),
    kjerne: "<p>Oppgaven tester sammenhengen mellom utvelgelse, sortering og kjøretid: de k minste kan hentes ut på flere måter med ulik kompleksitet. Hovedpoenget er at du ikke trenger å sortere hele arrayet for å hente ut bare k elementer.</p>",
    tips: [
      "Bruk Merge sort, ikke Quicksort, når oppgaven krever O(n log n) – Quicksort er O(n²) i verste tilfelle.",
      "Oppgi kjøretiden for hver løsning, og begrunn kort hvor leddene kommer fra (O(n) for BuildMinHeap, O(log n) per uttak).",
      "Prosedyrene <code>MergeSort</code> og <code>BuildMinHeap</code> er pensum og kan brukes direkte – si hva de returnerer."
    ]
  }; });
  def("H2021-10", { host: "#exam-triks" }, function () { return {
    key: "H2021-10", year: "H2021", oppgave_nr: "Oppgave 10", title: "Finn par som summerer til x", points: 10,
    ark: "Finn par som summerer til x", ordrett: true,
    oppgave: skelAll(IN.oppg({
      intro: "<p>Du er gitt et array med unike heltall A og et heltall x. Du skal skrive en prosedyre som skriver ut alle par av heltall y og z i arrayet, der y + z = x. Tallet på en gitt posisjon i arrayet kan maksimalt inngå i én utskrift. Rekkefølgen parene (y, z) skrives ut i spiller ingen rolle, og rekkefølgen innad i parene spiller heller ingen rolle.</p>" + SKEL +
        "<p>For eksempel skal et kall på FindSummands([0, 2, 4, 6, 8, 10], 10) skrive ut parene (0, 10), (2, 8) og (4, 6).</p>" +
        "<p>For begge deloppgaver: Gi pseudokode for en algoritme som løser problemet og oppgi kjøretidskompleksiteten på algoritmen (den trenger ikke begrunnes). Lavere kjøretidskompleksitet er mer poenggivende.</p>",
      parts: [
        "Skriv en prosedyre FindSummands som beskrevet over, med antagelsen om at A er sortert fra minst til størst.",
        "Skriv en prosedyre FindSummands som beskrevet over, men du kan ikke anta at A er sortert. Hint: Du kan anta O(1) for innsetting, oppslag og sletting i hashbaserte datastrukturer."
      ]
    }), [sk("FindSummands", "A, x", "Et array A av heltall, og et heltall x", "Skriver ut alle par y, z ∈ A slik at y + z = x")]),
    demo: {
      engine: "sokside", gen: "findSummandsSorted", input: [0, 2, 4, 6, 8, 10, 10], inputNavn: "Eksempelet fra arket (x = 10)",
      presets: { "x = 15": [1, 3, 5, 7, 8, 10, 12, 14, 15], "Ingen par (x = 4)": [3, 5, 6, 9, 11, 4] },
      parseInput: parseWithX(12), inputLabel: "f.eks. 0,2,4,6,8,10 ; 10", pseudo: "findSummandsSorted",
      legend: legOf([{ cls: "compare", label: "paret som summeres" }, { cls: "target", label: "funnet par" }], "findSummandsSorted"),
      label: "(a) To pekere på eksempelet fra arket", del: "(a)",
      svar: function (last) {
        var p = last && last.info ? last.info.filter(function (x) { return x[0] === "par"; })[0] : null;
        return p ? String(p[1]).replace(/,/g, ", ").replace(/\) \(/g, "), (") : null;
      }
    },
    losning: solution([
      { html: "<b>(a) O(n) med to pekere:</b> start i hver ende. Er summen for liten, flytt venstre peker inn; er den for stor, flytt høyre. Ved treff skriver vi ut og flytter videre. Det virker fordi A er sortert.", code: ["findSummandsSorted"] },
      { html: "<b>(b) Forventet O(n) med hashset:</b> for hvert y, se om komplementet x − y er sett før. Fjern det ved treff, slik løsningsforslaget gjør.", code: ["findSummandsHash"] },
      "<b>Alternativer:</b> i (b) kan du også sortere først og bruke løsningen fra (a). Tallene er heltall, så Radix sort er lov: det gir O(n) og ble godtatt som fullgod løsning. Med Merge sort blir det O(n log n), som gir opptil 8 av 10 poeng. Begge deloppgaver kan løses med en dobbel løkke på O(n²), men kvadratisk tid på begge gir opptil 3 poeng."
    ]),
    kjerne: "<p>Dette er «to-sum»-problemet: med sortert input gir to pekere O(n) uten ekstra minne. Uten sortering gir et hashset forventet O(n) ved å gjøre parsøket om til et oppslag etter komplementet x − y.</p>",
    tips: [
      "Sortert → to pekere fra hver ende som beveger seg mot midten.",
      "Usortert → hashset: let etter komplementet x − y.",
      "Fjern komplementet ved treff, slik løsningsforslaget gjør. Med unike tall er det strengt tatt ikke nødvendig, men det viser tydelig at hvert tall inngår i høyst ett par."
    ]
  }; });

  // Brukes også av demoene på temasiden
  IN.kortData.felles(SIDE, { renderSearch: renderSearch, DIM: DIM, parseWithX: parseWithX, SPENN: SPENN });
})();
