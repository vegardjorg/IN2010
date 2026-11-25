/* ============================================================
   IN2010 guide · kort/heap.js
   Eksamenskortene for Heap (03-heap.html): én definisjon per kort, lest av temasiden og crash.html.
   Oppgavetekstene står ordrett med kildelinje (som før). Fullpoengssvar og sensorveiledning
   ligger i perfekt/heap.js (og perfekt/delt.js for oppgaver som deles med andre sider).
   Lastes etter perfekt/*.js. Se IN.kortData i core.js.
   ============================================================ */
(function () {
  var IN = window.IN, qs = IN.qs, el = IN.el;
  var SIDE = "heap";
  function def(key, meta, fn) { meta.side = SIDE; return IN.kortData.def(key, meta, fn); }

  var LEG_INS = [
    { cls: "target", label: "elementet vi følger (i)" },
    { cls: "compare", label: "barn og forelder sammenlignes" },
    { cls: "swap", label: "byttes" },
    { cls: "sorted", label: "ferdig" }
  ];
  var LEG_RM = [
    { cls: "min", label: "minste (roten, x)" },
    { color: "var(--vf-teal)", label: "kopieres (siste → roten)" },
    { cls: "target", label: "elementet som synker (i)" },
    { cls: "compare", label: "barna som sammenlignes" },
    { cls: "swap", label: "byttes" }
  ];
  var LEG_LO = [0, 1, 2, 3].map(function (d) { return { color: "var(--lv" + d + ")", label: "dybde " + d }; })
    .concat([{ color: "var(--color-on-surface)", label: "plassen vi leser (i), tykk ring" }])
    .concat(IN.varLine ? IN.varLine.legend(["for"]) : []);


  /* Hjelper: løsning med pseudokode (BYGGEGUIDE 5.4) */
  function solution(items, keys) {
    var sol = el("div");
    var ol = el("ol");
    items.forEach(function (h) { ol.appendChild(el("li", { html: h })); });
    sol.appendChild(ol);
    var hosts = (keys || []).map(function (k) { var h = el("div", { class: "et-pc" }); sol.appendChild(h); return { h: h, k: k }; });
    return { node: sol, mount: function () { hosts.forEach(function (x) { IN.pseudo.render(x.h, IN.algos[x.k], {}); }); } };
  }
  // Kortdata med løsningen som DOM-node; pseudokoden monteres når kortet er satt inn (spec._mount)
  function exam(data, keys) {
    var s = solution(data.losning, keys);
    var d = {}; for (var k in data) d[k] = data[k];
    d.losning = s.node;
    d._mount = s.mount;
    return d;
  }

  def("H2023-2", { host: "#exam-innsetting" }, function () {
    // Pilot (WP0): ordrett oppgavetekst, kildelinje, innebygd demo og perfekt svar (assets/js/perfekt/heap.js)
    var insOppg = IN.oppg({ parts: [
      { t: "<p>Du er gitt et tomt array på størrelse 7.</p>" +
           "<table class=\"et-tab\" aria-label=\"Tomt array med plass 0 til 6\"><tr><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr>" +
           "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>" +
           "<p>Sett inn de følgende tallene med min-heap innsetting:</p><p class=\"mono\">3, 5, 10, 8, 4, 2, 7</p>" +
           "Fyll ut tabellen slik den ser ut etter alle tallene er satt inn. Skriv svaret som en kommaseparert liste.", p: 2 },
      // Poengmerket står før skjelettet, så det havner på samme linje som teksten
      { t: "Forklar kort hvordan algoritmen for innsetting i en min-heap fungerer, og skisser algoritmen med pseudokode. Du kan anta at arrayet i input ikke er fullt. <span class=\"et-p\">(6p)</span><div class=\"et-skel\"></div>" },
      { t: "Redgjør for kjøretidskompleksiteten til algoritmen.", p: 2 }
    ] });
    IN.pseudo.render(qs(".et-skel", insOppg), {
      name: "HeapInsert", params: "A, x",
      input: "Et array A som representerer en heap med n elementer, og et element x",
      output: "Et array som representerer en heap, som inneholder x",
      lines: [{ code: "// . . .", indent: 1 }]
    }, { tooltips: false });
    return exam({
      key: "H2023-2", year: "H2023", oppgave_nr: "Oppgave 2", title: "Innsetting i heap", points: 10,
      ark: "Innsetting i heap", ordrett: true, poengkilde: "sv",
      oppgave: insOppg,
      demo: {
        engine: "heap", gen: "heapInsert", input: [3, 5, 10, 8, 4, 2, 7], inputNavn: "H2023 (a)",
        presets: { "Stigende (ingen bytter)": [1, 2, 3, 4, 5, 6], "Synkende (mange bytter)": [7, 6, 5, 4, 3, 2, 1] },
        pseudo: "heapInsert", legend: LEG_INS, countControl: { min: 3, max: 12 }, inputLabel: "f.eks. 3,5,10,8",
        label: "Kjør HeapInsert for 3, 5, 10, 8, 4, 2, 7", del: "(a)"
      },
      losning: [
        "<b>(a)</b> <span class=\"mono\">2, 4, 3, 8, 5, 10, 7</span>. Bare sluttraden teller. Steg deg gjennom innsettingene i steg-demoen i dette kortet for å se hvert bytte. 2p for riktig svar, 1p for nesten riktig (for eksempel en gyldig heap som ikke er den denne rekkefølgen gir).",
        "<b>(b)</b> Legg x på første ledige plass, <span class=\"mono\">A[n]</span>, så treet forblir komplett. Så lenge x er mindre enn foreldernoden <span class=\"mono\">⌊(i − 1)/2⌋</span>, bytter vi dem og fortsetter fra forelderens plass. Poeng: 1 for riktig plassering, 2 for bytte med forelder, 3 for en godt skissert algoritme (opptil 6). Pseudokoden under er én god løsning.",
        "<b>(c)</b> <b>O(log n)</b>, ikke O(n log n). Elementet flytter seg høyst ett nivå per runde, og det starter på plass n, på dybde ⌊log(n + 1)⌋ (indeksen halveres for hvert steg opp). Det er høyden til treet, O(log n). 1p for riktig kjøretid, 1p for begrunnelsen."
      ],
      kjerne: "<p>Oppgaven tester array-representasjonen (forelder- og barneindekser), boble opp ved innsetting, og at høyden til en heap er O(log n).</p>",
      tips: ["Legg alltid nytt element bakerst og boble <b>opp</b>. Ikke start i roten.", "Skriv bare sluttraden i (a), ingen mellomtilstander.", "Begrunn O(log n) med høyden til treet. En påstand uten begrunnelse gir halv uttelling."]
    }, ["heapInsert"]);
  });

  def("H2021-4", { host: "#exam-removemin" }, function () {
    // H2021 oppg. 4: ordrett oppgavetekst (plan/gjennomgang/08-eksamenstekst-ordrett.md), demo per deloppgave, perfekt svar i perfekt/heap.js
    var H1 = [4, 28, 11, 43, 32, 27, 55, 59, 66];
    var h21Oppg = IN.oppg({
      intro: "<p>Du skal ta utgangspunkt i følgende binære heap H₁, hvor både tre-representasjonen og array-representasjonen er gitt:</p>",
      figs: [{ cls: "lg", draw: function (h) { IN.vizHeap(h, { array: H1 }, { arrName: "H₁" }); } }],
      parts: [
        { note: "Du skal fylle inn tabellene som svarer til hver deloppgave i Inspera. Hver tabell svarer til array-representasjonen av H₁ etter de oppgitte operasjonene. Deloppgavene er uavhengig av hverandre, altså refererer H₁ til heapen som er gitt ovenfor, og endringer vi gjør i en deloppgave følger ikke med til neste deloppgave." },
        { t: "Hvordan ser heapen ut etter ett kall på <span class=\"mono\">H₁.RemoveMin()</span>?", p: 2 },
        { t: "Hvordan ser heapen ut etter ett kall <span class=\"mono\">H₁.Insert(7)</span>?", p: 2 },
        { note: "I en annen binær min-heap H₂ får du kun gitt verdiene på dybde 3:" +
            "<div class=\"exam-figs\"><figure class=\"exam-fig lg\"><div class=\"exam-fig-h h21-h2\"></div><figcaption>H₂</figcaption></figure></div>" },
        { t: "Hva er den minste verdien som kan ligge på dybde 4 av H₂?", p: 2 }
      ]
    });
    IN.vizHeap(qs(".h21-h2", h21Oppg), { array: ["?", "?", "?", "?", "?", "?", "?", 59, 66, 83, 52, 82, 27, 97, 75].concat(Array(16).fill("?")) }, { hideArray: true, noIdx: true });
    return exam({
      key: "H2021-4", year: "H2021", oppgave_nr: "Oppgave 4", title: "Binære heaps", points: 6,
      ark: "Binære heaps", ordrett: true, poengkilde: "sv",
      oppgave: h21Oppg,
      avvik: [
        "Figurene er tegnet på nytt med guidens heap-tegning, fordi arket bare har dem som bilde. Verdiene og plasseringen er de samme som på arket.",
        "Tabellene fra Inspera er ikke med, fordi du her skriver svaret som en kommaseparert liste med plass 0 først."
      ],
      demo: [
        { tab: "(a) RemoveMin", engine: "heap", gen: function (v) { return IN.heapGen.removeMin(v, 1); }, input: H1.slice(), inputNavn: "H₁",
          presets: { "Liten heap": [1, 3, 2, 7, 4, 5, 6], "Like verdier": [2, 2, 3, 2, 5, 4] },
          pseudo: "removeMin", legend: LEG_RM, countControl: { min: 3, max: 12 }, inputLabel: "f.eks. 1,3,2,7,4",
          label: "Kjør RemoveMin én gang på H₁", del: "(a)" },
        { tab: "(b) Insert(7)", engine: "heap", gen: function (v) { return IN.heapGen.insert([7], v); }, input: H1.slice(), inputNavn: "H₁",
          presets: { "Liten heap": [1, 3, 2, 7, 4, 5, 6], "7 blir ny rot": [9, 12, 10, 15, 13] },
          pseudo: "heapInsert", legend: LEG_INS, countControl: { min: 3, max: 12 }, inputLabel: "f.eks. 1,3,2,7,4",
          label: "Kjør Insert(7) på H₁", del: "(b)" }
      ],
      losning: [
        "<b>(a)</b> <span class=\"mono\">11, 28, 27, 43, 32, 66, 55, 59</span>. 4 tas ut, og det siste elementet, 66, flyttes til roten. Minste barn er 11: bytt. Så er barna 27 og 55, og minste er 27: bytt. 66 har ingen barn igjen. Steg deg gjennom det i demoen «(a) RemoveMin» i dette kortet.",
        "<b>(b)</b> <span class=\"mono\">4, 7, 11, 43, 28, 27, 55, 59, 66, 32</span>. 7 legges på plass 9 og bobler opp forbi 32 (plass 4) og 28 (plass 1). 4 i roten er mindre, så den stopper der. Se demoen «(b) Insert(7)».",
        "<b>(c)</b> <b>27</b>. En node på dybde 4 har en forelder på dybde 3, og barnet må bare være <i>større enn eller lik</i> forelderen. Den minste forelderen er 27, og like verdier er lov, så 27 er mulig.",
        "<b>Poeng:</b> 2 per deloppgave, og 0 for feil svar. På (c) ga svaret 28 1 poeng."
      ],
      kjerne: "<p>RemoveMin flytter siste element til roten og lar det boble ned mot det minste barnet. Insert legger bakerst og bobler opp. Heap-egenskapen er «forelder ≤ barn», så et barn kan være lik forelderen.</p>",
      tips: ["RemoveMin: siste element til roten, så boble ned mot <b>minste</b> barn.", "Insert: legg bakerst, boble opp så lenge det nye er mindre enn foreldernoden.", "Like verdier er lov i en heap. Det er hele poenget i (c)."]
    }, ["removeMin", "heapInsert"]);
  });

  def("H2025-5", { host: "#exam-levelorder", progressKey: "kort:traer:exam-h2025-4" }, function () {
    // H2025 oppg. 5: ordrett oppgavetekst med skjelettene fra arket, tre demoer, perfekt svar i perfekt/heap.js
    var LO_FIG = { id: "f10", k: 10,
      l: { id: "f15", k: 15, l: { id: "f12", k: 12, l: null, r: null }, r: { id: "f17", k: 17, l: null, r: null } },
      r: { id: "f5", k: 5, l: { id: "f7", k: 7, l: null, r: null }, r: { id: "f2", k: 2, l: null, r: null } } };
    var LO_BST = [10, 5, 15, 2, 7, 12, 17];
    var loOppg = IN.oppg({
      intro: "<p>En level-order-traversering besøker nodene i et tre etter dybde. Det vil si at roten besøkes først, så alle barna til roten, så alle barna til rotens barn, og så videre.</p>" +
        "<p>En level-order-traversering av følgende tre kan, for eksempel, besøke nodene i rekkefølgen 10, 15, 5, 12, 17, 7, 2.</p>",
      figs: [{ cls: "lg", draw: function (h) { IN.vizTree(h, { tree: LO_FIG }, { ariaLabel: "Binærtre med 10 i roten, barna 15 og 5, og barnebarna 12, 17, 7 og 2 fra venstre mot høyre" }); } }],
      parts: [
        { t: "Anta at treet er en binær heap, representert ved et array A med n elementer. Gi en algoritme som returnerer en liste med elementene fra A i level-order. <span class=\"et-p\">(2p)</span><div class=\"et-skel lo-skel-a\"></div>" },
        { t: "Anta at treet er et binært søketre med n noder, der hver node v har følgende felter:" +
            "<ul><li><span class=\"mono\">v.element</span> — verdien som er lagret i noden</li><li><span class=\"mono\">v.left</span> — venstre barn av v</li><li><span class=\"mono\">v.right</span> — høyre barn av v</li></ul>" +
            "Gi en algoritme som returnerer en liste med elementene fra treet i level-order. <span class=\"et-p\">(6p)</span><div class=\"et-skel lo-skel-b\"></div>" },
        { t: "Oppgi kjøretidskompleksiteten for algoritmene dine i (a) og (b).", p: 1 },
        { t: "Se på følgende algoritme: <span class=\"et-p\">(3p)</span><div class=\"et-skel lo-skel-d\"></div><p>Hva kan du si om relasjonen mellom input-treet og output-treet?</p>" }
      ]
    });
    function loSkel(cls, algo) { IN.pseudo.render(qs("." + cls, loOppg), algo, { tooltips: false }); }
    loSkel("lo-skel-a", { name: "LevelOrderHeap", params: "A", input: "En binær heap, representert ved et array A med n elementer",
      output: "En liste med elementene i heapen i level-order", lines: [{ code: "// · · ·", indent: 1 }] });
    loSkel("lo-skel-b", { name: "LevelOrderBST", params: "v", input: "Roten v av et binært søketre med n noder",
      output: "En liste med elementene i søketreet i level-order", lines: [{ code: "// · · ·", indent: 1 }] });
    loSkel("lo-skel-d", { name: "ConstructBST", params: "v", input: "Roten v av et binært søketre", output: "Et nytt binært søketre", lines: [
      { code: "B ← empty binary search tree", indent: 1 }, { code: "nodes ← LevelOrderBST(v)", indent: 1 }, { code: "for u in nodes do", indent: 1 },
      { code: "B ← Insert(B, u)", indent: 2 }, { code: "return B", indent: 1 }] });
    var LEG_TREE = [{ cls: "compare", label: "noden vi ser på (u)" }, { color: "transparent;border:2px dashed var(--c-compare)", label: "står i køen Q" }, { cls: "sorted", label: "skrevet i lista L" }];
    var LEG_CB = [{ cls: "compare", label: "u i input-treet v" }, { color: "transparent;border:3px solid var(--c-target)", label: "søkestien i B" }, { cls: "min", label: "nysatt node i B" }, { cls: "sorted", label: "allerede satt inn i B" }];
    return exam({
      key: "H2025-5", year: "H2025", oppgave_nr: "Oppgave 5", title: "Level-order", points: 12,
      ark: "Level-order", ordrett: true, poengkilde: "sv",
      oppgave: loOppg,
      avvik: [
        "Treet i figuren er tegnet på nytt, fordi arket bare har det som bilde. Det er verken en heap eller et søketre: arket bruker det bare for å vise rekkefølgen.",
        "Demoen for (a) kjører LevelOrderHeap på arrayet 10, 15, 5, 12, 17, 7, 2 fra figuren, fordi algoritmen bare bruker formen. Det arrayet er ikke en gyldig heap.",
        "Demoene for (b) og (d) bruker et søketre vi har laget selv, med de samme tallene (satt inn i rekkefølgen 10, 5, 15, 2, 7, 12, 17), fordi arket ikke gir noe søketre."
      ],
      demo: [
        { tab: "(a) LevelOrderHeap", engine: "heap", gen: "levelOrderArray", input: [10, 15, 5, 12, 17, 7, 2], inputNavn: "Figuren som array",
          presets: { "H2023-heapen": [2, 4, 3, 8, 5, 10, 7] }, pseudo: "levelOrderHeap", legend: LEG_LO, countControl: { min: 3, max: 15 },
          fasit: "10, 15, 5, 12, 17, 7, 2", label: "Kjør LevelOrderHeap på figuren lagret som array", del: "(a)" },
        { tab: "(b) LevelOrderBST", engine: "tree", gen: "levelOrderBSTExam", input: LO_BST, inputNavn: "Søketre med figurens tall",
          presets: { "Skjevt søketre": [5, 3, 8, 1, 4, 9], "Bare høyre barn": [1, 2, 3, 4] }, customInput: true, inputLabel: "f.eks. 5,3,8,1",
          pseudo: "levelOrderBSTExam", legend: LEG_TREE, fasit: "10, 5, 15, 2, 7, 12, 17", label: "Kjør LevelOrderBST på søketreet", del: "(b)" },
        { tab: "(d) ConstructBST", engine: "tree", gen: "constructBSTExam", input: LO_BST, inputNavn: "Søketre med figurens tall",
          presets: { "Skjevt søketre": [5, 3, 8, 1, 4, 9], "Bare høyre barn": [1, 2, 3, 4] }, customInput: true, inputLabel: "f.eks. 5,3,8,1",
          pseudo: "constructBSTExam", legend: LEG_CB, fasit: "like trær", label: "Kjør ConstructBST og sammenlign v og B", del: "(d)" }
      ],
      losning: [
        "<b>(a)</b> En heap er allerede lagret i level-order, så det holder å returnere arrayet som en liste. Se pseudokoden under.",
        "<b>(b)</b> Bredde-først søk med en <b>kø</b>: legg roten i køen hvis den finnes. Så lenge køen ikke er tom: ta ut u, legg <span class=\"mono\">u.element</span> i lista, og legg <span class=\"mono\">u.left</span> og <span class=\"mono\">u.right</span> bakerst i køen hvis de ikke er null. Et tre har ingen sykler, så vi trenger ingen mengde med besøkte noder. Se pseudokoden under og demoen «(b) LevelOrderBST».",
        "<b>(c)</b> Begge er <b>O(n)</b>: hvert element flyttes til lista nøyaktig én gang.",
        "<b>(d)</b> De blir <b>like</b>. Roten settes inn først, så barna, så barnebarna. Hvert element havner da på samme plass som i input-treet. Oppgaven krever ingen begrunnelse."
      ],
      kjerne: "<p>En heap i array-form ER level-order. For et vanlig tre gir et bredde-først søk med kø level-order, og et dybde-først søk med stakk gjør det ikke.</p>",
      tips: ["Level-order = bredde-først = <b>kø</b>, ikke stakk. Stakk i stedet for kø kostet 3 poeng.", "En heap i array-form er allerede i level-order: bare returner arrayet.", "Husk null-sjekk på roten og barna i (b). Manglende null-sjekker kostet opptil 2 poeng.", "Sensorveiledningen: oppgaven krever ikke begrunnelse i (d)."]
    }, ["levelOrderHeap", "levelOrderBSTExam"]);
  });

  def("H2024-7", { host: "#exam-median" }, function () {
    // H2024 oppg. 7: ordrett oppgavetekst («elmentet» står slik på arket), demo for (a), perfekt svar i perfekt/heap.js
    return exam({
      key: "H2024-7", year: "H2024", oppgave_nr: "Oppgave 7", title: "Mediankø", points: 12,
      ark: "Mediankø", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>En mediankø er en abstrakt datatype for en samling som støtter følgende operasjoner:</p>" +
          "<ul><li><span class=\"mono\">insert(Q, x)</span> – plasserer et element x på køen</li><li><span class=\"mono\">removeMedian(Q)</span> – fjerner og returnerer median-elementet fra køen</li></ul>" +
          "<p>Medianen er det «midterste» elmentet i samlingen, dersom elementene ordnes fra minst til størst. Dersom vi setter inn tallene 8, 3, 1, 5 og 7 i en mediankø, så vil:</p>" +
          "<ul><li>første kall på removeMedian gi 5</li><li>andre kall på removeMedian gi 3</li><li>tredje kall på removeMedian gi 7</li><li>fjerde kall på removeMedian gi 1</li><li>femte kall på removeMedian gi 8</li></ul>" +
          "<p>Merk at vi velger det minste av de to midterste elementene når køen inneholder et partall antall elementer, som vist i eksempelet ovenfor.</p>",
        parts: [
          { t: "Hvis vi setter inn tallene 4, 1, 8, 3, 2 på en mediankø, hva vil de tre første kallene på removeMedian gi? Oppgi svaret som en kommaseparert liste med tall.", p: 1 },
          { t: "Forklar kort hvordan du vil representere en mediankø.", p: 1 },
          { t: "Forklar hvordan du ville ha implementert operasjonene insert og removeMedian. Du kan bruke pseudokode som en del av forklaringen din, men det er ikke et krav. Alle datastrukturer nevnt i pensum er tilgjengelige for deg.", p: 6 },
          { t: "Basert på forklaringen din i (c), hva kan du si om kjøretidskompleksiteten til insert og removeMedian?", p: 2 },
          { t: "Hvis vi tar n elementer fra en mediankø ved hjelp av removeMedian, og setter dem inn i et binært søketre, én etter én, hvordan vil det resulterende binære søketreet se ut? Forklar kort.", p: 2 }
        ]
      }),
      demo: {
        engine: "median", gen: function (v) { return IN.heapGen.median(v, Math.min(3, v.length)); }, input: [4, 1, 8, 3, 2], inputNavn: "H2024 (a)",
        presets: { "Eksempelet 8, 3, 1, 5, 7": [8, 3, 1, 5, 7] }, customInput: true, inputLabel: "f.eks. 4,1,8,3,2", countControl: { min: 3, max: 9 },
        svar: function (last) { return last && last.out ? last.out.join(", ") : null; },
        pseudo: ["medianInsert", "medianBalance", "removeMedian"],
        label: "Sett inn 4, 1, 8, 3, 2 og kall removeMedian tre ganger", del: "(a)"
      },
      losning: [
        "<b>(a)</b> <span class=\"mono\">3, 2, 4</span> (1p). Steg deg gjennom det i demoen i dette kortet.",
        "<b>(b)</b> To heaper: <span class=\"mono\">Q.small</span> er en max-heap med den nedre halvdelen, og <span class=\"mono\">Q.large</span> er en min-heap med den øvre. De holdes balansert, så toppen av Q.small alltid er medianen (1p).",
        "<b>(c)</b> Se pseudokoden under (opptil 6p). <b>insert:</b> legg x i Q.small hvis den er tom eller x er mindre enn toppen der, ellers i Q.large. Kall så Balance. <b>Balance:</b> har Q.small mer enn ett element for mye, flytt det største over til Q.large. Har Q.large flere enn Q.small, flytt det minste over til Q.small. <b>removeMedian:</b> ta ut det største fra Q.small, kall Balance, og returner det. En sortert dobbeltlenket liste med midtpeker gir opptil 4p. En usortert struktur som sorteres ved behov gir opptil 2p.",
        "<b>(d)</b> Begge <b>O(log n)</b>: et konstant antall heap-operasjoner à O(log n) (1p per operasjon).",
        "<b>(e)</b> Første median blir roten. Hver ny median er mindre eller større enn alt som er satt inn før, så treet blir to kjeder: til venstre for roten har alle noder bare venstre barn, og til høyre bare høyre barn (2p). Se figuren i «Perfekt svar» lenger ned i kortet."
      ],
      kjerne: "<p>En max-heap og en min-heap kombineres til en mediankø med O(log n) på begge operasjoner. Rekkefølgen fra removeMedian gir et søketre formet som en «Λ».</p>",
      tips: ["Si tydelig hvilken heap som er max-heap og hvilken som er min-heap, og hva som skjer i Balance.", "Knytt O(log n) i (d) til din egen løsning i (c).", "(a) er gratispoeng. Skriv opp de sorterte tallene og ta midten hver gang."]
    }, ["medianInsert", "medianBalance", "removeMedian"]);
  });

  def("H2022-10", { host: "#exam-pk" }, function () {
    // H2022 oppg. 10: ordrett oppgavetekst med skjelettene fra arket, egen demo-input, perfekt svar i perfekt/heap.js
    var BQ_IN = "En bucket queue Q med prioriteter fra 0 til N − 1";
    var bqOppg = IN.oppg({
      intro: "<p>En bucket queue (eller en bøttekø) er en datastruktur som er inspirert av bucket sort og kan brukes som en prioritetskø.</p>" +
        "<p>I en bucket queue kan elementer bli lagt til med en prioritet mellom 0 og N − 1, der N er et positivt heltall som fastsettes når køen opprettes. Ved et kall på RemoveMin, så vil et element med lavest mulig prioritet fjernes og returneres; dersom det er flere elementer med samme prioritet spiller det ikke noen rolle hvilket element som fjernes og returneres.</p>",
      parts: [
        { t: "Forklar kort hvilken datastruktur som passer godt for en bucket queue.", p: 1 },
        { t: "Gi en algoritme for Insert for en bucket queue. <span class=\"et-p\">(3p)</span><div class=\"et-skel bq-skel-b\"></div>" },
        { t: "Gi en algoritme for RemoveMin for en bucket queue. Du kan anta at køen ikke er tom. <span class=\"et-p\">(4p)</span><div class=\"et-skel bq-skel-c\"></div>" },
        { t: "Anta at N = 100. Oppgi kjøretidskompleksiteten på Insert og RemoveMin for en kø med n elementer.", p: 2 }
      ]
    });
    IN.pseudo.render(qs(".bq-skel-b", bqOppg), { name: "Insert", params: "Q, x, p", input: BQ_IN + ", og et element x med prioritet p",
      output: "Q med x satt inn med prioritet p", lines: [{ code: "// · · ·", indent: 1 }] }, { tooltips: false });
    IN.pseudo.render(qs(".bq-skel-c", bqOppg), { name: "RemoveMin", params: "Q", input: BQ_IN,
      output: "En x med lavest mulig prioritet, som er fjernet fra Q", lines: [{ code: "// · · ·", indent: 1 }] }, { tooltips: false });
    return exam({
      key: "H2022-10", year: "H2022", oppgave_nr: "Oppgave 10", title: "Bucket queue (bøttekø)", points: 10,
      ark: "Bucket queue", ordrett: true, poengkilde: "sv",
      oppgave: bqOppg,
      avvik: [
        "Demoen bruker en kø med N = 4 og en rekke operasjoner vi har valgt selv, fordi arket ikke gir noen konkrete operasjoner. Med N = 100 ville 96 av bøttene bare vært tomme. I «Eget:» skriver du <span class=\"mono\">navn:prioritet</span> (prioritet 0–3) for Insert og <span class=\"mono\">-</span> for RemoveMin.",
        "I demoen legger Insert det nye elementet først i bøtta, og RemoveMin tar det første. Det er ett av mange gyldige valg, fordi oppgaven sier at det ikke spiller noen rolle hvilket element med lavest prioritet som returneres."
      ],
      demo: {
        engine: "bucketq", gen: "bucketQueueOps", input: ["A:2", "B:0", "C:2", "D:3", "-", "E:0", "-", "-"], inputNavn: "Eksempel med N = 4",
        presets: { "Alt i én bøtte": ["A:1", "B:1", "C:1", "-", "-"], "Lav prioritet sist": ["A:3", "B:2", "-", "C:0", "-"] },
        pseudo: ["bucketQueueInsert", "bucketQueueRemoveMin"], fasit: "B, E, C",
        inputLabel: "f.eks. A:2, -, B:0",
        label: "Kjør Insert og RemoveMin på en bøttekø med N = 4", del: "(c)"
      },
      losning: [
        "<b>(a)</b> Et <b>array med N bøtter</b>, der bøtte p er en liste (for eksempel enkeltlenket) med elementene som har prioritet p. Akkurat som bøttene i bucket sort.",
        "<b>(b)</b> Legg x i bøtta <span class=\"mono\">Q[p]</span>. Se Insert under.",
        "<b>(c)</b> Gå gjennom bøttene fra 0 til N − 1, og ta ut et element fra den første som ikke er tom. Se RemoveMin under, og kjør den i demoen.",
        "<b>(d)</b> Med N = 100 er begge <b>O(1)</b>. Insert er alltid O(1), og RemoveMin ser i høyst 100 bøtter, som er en konstant. (Generelt er RemoveMin O(N).) 1 poeng per algoritme."
      ],
      kjerne: "<p>Når prioritetene er heltall i et fast, kjent område, kan et array med bøtter gi konstant tid på operasjonene. En binær heap gir O(log n).</p>",
      tips: ["Se etter «fast område 0 … N − 1». Da er bøtter svaret.", "RemoveMin skanner fra laveste prioritet. Med konstant N er det O(1).", "En binær heap virker, men ga høyst 4 av 10 poeng."]
    }, ["bucketQueueInsert", "bucketQueueRemoveMin"]);
  });

  def("H2022-5", { host: "#exam-test" }, function () {
    // H2022 oppg. 5: ordrett oppgavetekst, ingen demo (sant/usant), perfekt svar i perfekt/heap.js
    return exam({
      key: "H2022-5", year: "H2022", oppgave_nr: "Oppgave 5", title: "Prioritetskøer og binære heaps (sant/usant)", points: 10,
      ark: "Litt om prioritetskøer og binære heaps", ordrett: true,
      oppgave: IN.oppg({
        intro: "<p>Med heap mener vi arrayer som representerer binære min-heaps.</p>",
        parts: [
          "En array med n elementer kan gjøres om til en heap i O(n).",
          "En min-heap blir en max-heap ved å reversere arrayet.",
          "Alle elementer på dybde d i en heap er mindre enn alle elementer på dybde d + 1.",
          "Innsetting i en heap med n elementer er O(log(n)) i verste tilfelle.",
          "Et AVL-tre kan brukes som en prioritetskø med samme kjøretidskompleksitet som en heap.",
          "Nodene langs en sti fra rotnoden til en løvnode i en heap er ordnet fra minst til størst.",
          "Dersom vi bytter plass på to søskennoder i en heap, er det fremdeles en heap.",
          "En prioritetskø med konstant tid på alle operasjoner ville gjort at Dijkstra hadde kjøretidskompleksitet O(|V| + |E|).",
          "Man kan finne det største elementet i en min-heap i O(log(n)).",
          "I en heap ligger over halvparten av elementene på de to dypeste nivåene."
        ]
      }),
      avvik: "Arket sier ikke hvordan de 10 poengene fordeles på påstandene, og det gjør heller ikke sensorveiledningen. Derfor står det ingen poeng ved hver påstand her.",
      losning: [
        "(a) Sant · (b) Usant · (c) Usant · (d) Sant · (e) Sant",
        "(f) Sant · (g) Usant (sensor kalte den litt tvetydig, men begge tolkningene gir Usant) · (h) Sant · (i) Usant · (j) Sant",
        "Påstandene (a)–(j) er også de ti første i sant/usant-testen under kortet (med litt andre ord). Der får du en begrunnelse ved hver påstand når du trykker «Sjekk»."
      ],
      kjerne: "<p>Tester heap-egenskapen (bare forelder mot barn), BuildMinHeap i lineær tid, AVL-tre som alternativ prioritetskø, og hvordan køen påvirker Dijkstra.</p>",
      tips: ["Heap-egenskapen gjelder bare forelder mot barn, ikke hele nivåer eller søsken.", "BuildMinHeap er O(n), ikke O(n log n).", "Det største elementet ligger blant løvnodene og tar O(n) å finne."]
    }, []);
  });

  // Brukes også av demoene på temasiden
  IN.kortData.felles(SIDE, { LEG_INS: LEG_INS, LEG_RM: LEG_RM, LEG_LO: LEG_LO });
})();
