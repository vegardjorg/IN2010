/* ============================================================
   IN2010 guide · perfekt/mock.js
   «Perfekt svar» for de 12 mock-oppgavene (IN.MOCK i data-mock.js, vises på crash.html, steg 3m).
   Lastes etter data-strategi.js og før data-mock.js. Format: plan/gjennomgang/wp0-format.md.
   - type: "mock". Oppgavene er laget for guiden. Det finnes ingen sensorveiledning, så:
     svar = vårt eget fullpoengssvar, anslag = vårt anslag over poengfordelingen.
   - Pseudokoden er kursets variant (IN.algos-nøkler), den samme som steg-demoen følger.
   - Alle sluttilstander er kontrollert ved å kjøre kursets generatorer (IN.gen) i node.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.PERFEKT = IN.PERFEKT || {};
  var P = IN.PERFEKT;

  /* ---------- Hjelpere for figurer (tegnes først når svaret åpnes) ---------- */
  function row(vals, label) {
    var th = "", td = "";
    vals.forEach(function (v, i) { th += "<th>" + i + "</th>"; td += "<td>" + (v == null ? "" : v) + "</td>"; });
    return '<div class="table-wrap"><table class="et-tab" aria-label="' + (label || "Array") + '"><tr><th>indeks</th>' + th + "</tr><tr><th>" + (label || "A") + "</th>" + td + "</tr></table></div>";
  }
  function tab(head, rows) {
    return '<div class="table-wrap"><table class="et-tab"><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</table></div>";
  }
  function heapFig(arr, cap) { return { cap: cap, draw: function (h) { if (IN.vizHeap) IN.vizHeap(h, { array: arr.slice() }); } }; }
  function nest(t) { return t ? { id: String(t[0]), k: t[0], l: nest(t[1]), r: nest(t[2]) } : null; }
  function treeFig(t, cap) { return { cap: cap, draw: function (h) { if (IN.vizTree) IN.vizTree(h, { tree: nest(t), marks: {} }); } }; }
  function hashFig(cells, cap) {
    return { cap: cap, draw: function (h) {
      if (IN.vizHash) IN.vizHash(h, { parts: [{ type: "probe", N: cells.length, cells: cells.map(function (x) { return x == null ? null : { k: x }; }), marks: {} }] }, { compact: true });
    } };
  }
  function gn(o) { return Object.keys(o).map(function (k) { return { id: k, x: o[k][0], y: o[k][1] }; }); }
  function graphFig(nodes, edges, dir, treeEdges, warnNodes, cap) {
    return { cap: cap, draw: function (h) {
      if (!IN.vizGraph) return;
      var e = {}, n = {};
      (treeEdges || []).forEach(function (x) { e[x[0] + ">" + x[1]] = "tree"; });
      (warnNodes || []).forEach(function (x) { n[x] = "warn"; });
      IN.vizGraph(h, { g: { directed: !!dir, nodes: gn(nodes), edges: edges }, edges: e, nodes: n });
    } };
  }
  var _ = null;

  /* ======================================================================
     1. RemoveMin i en min-heap
     ====================================================================== */
  P["MOCK-heap-removemin"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>Roten er A[0] = 2. Barna til indeks i ligger på 2i + 1 og 2i + 2, så treet fylles nivå for nivå fra venstre: 2 · 5, 3 · 9, 6, 4, 8 · 12, 10, 7.</p>",
        fig: heapFig([2, 5, 3, 9, 6, 4, 8, 12, 10, 7], "Heapen før RemoveMin"),
        poeng: ["riktig tre, nivå for nivå (1p)"] },
      { del: "(b)",
        tekst: "<p><b>Kall 1</b> returnerer 2. Siste element 7 flyttes til roten. 7 bytter med det minste barnet 3 (indeks 0 ↔ 2), så med 4 (2 ↔ 5):</p>" +
          row([3, 5, 4, 9, 6, 7, 8, 12, 10]) +
          "<p><b>Kall 2</b> returnerer 3. 10 flyttes til roten og bytter med 4 (0 ↔ 2), så med 7 (2 ↔ 5):</p>" +
          row([4, 5, 7, 9, 6, 10, 8, 12]) +
          "<p><b>Kall 3</b> returnerer 4. 12 flyttes til roten og bytter med 5 (0 ↔ 1), så med 6 (1 ↔ 4). Indeks 4 har ingen barn i heapen:</p>" +
          row([5, 6, 7, 9, 12, 10, 8]),
        fig: heapFig([5, 6, 7, 9, 12, 10, 8], "Heapen etter tre kall"),
        fasitVerdi: "5, 6, 7, 9, 12, 10, 8",
        poeng: ["returnert element og array etter hvert kall (ca. 1p per kall)", "byttene er vist (1p)"] },
      { del: "(c)",
        tekst: "<p>Ta vare på roten, flytt det siste elementet opp i roten, og la det boble ned mot det <i>minste</i> barnet så lenge det er større enn barnet.</p>",
        kode: "removeMin",
        etter: "<p class=\"small muted\">Etter at A[n − 1] er flyttet opp i roten, hører plass n − 1 ikke lenger til heapen. Heapen er nå plassene 0 … n − 2, og derfor står grensen n − 1 i løkka.</p>",
        poeng: ["siste element flyttes til roten (1p)", "valg av minste barn (1p)", "riktig stoppkriterium (1p)"] },
      { del: "(d)",
        tekst: "<p><b>O(log n).</b> En heap er et komplett binærtre, så høyden er ⌊log n⌋. Hver runde i løkka gjør et fast antall sammenligninger og høyst ett bytte, og flytter elementet ett nivå ned. Det blir høyst ⌊log n⌋ runder.</p>",
        kjoretid: "O(log n) per RemoveMin",
        poeng: ["O(log n) (1p)", "begrunnelse med høyden ⌊log n⌋ (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Svaret viser alle byttene, så den som retter ser at du vet hvordan tallet sklir ned. Og du forklarer at treet er lavt, så det går fort.</p>",
      normal: "<p>Hvert kall viser hva som returneres, hvilket element som flyttes opp, og byttene mot det minste barnet. Pseudokoden har de tre bitene som gir poeng: flytt siste til roten, velg minste barn, stopp riktig. Kjøretiden er begrunnet med høyden.</p>",
      teknisk: "<p>Formen (komplett tre) bevares fordi det er det siste elementet som flyttes. Heap-egenskapen kan da bare være brutt mellom i og barna, og løkka retter det ett nivå om gangen. Antall runder er begrenset av høyden ⌊log n⌋, så O(log n).</p>"
    },
    anslag: [
      "(a) 1p: riktig tre, nivå for nivå.",
      "(b) 4p: ca. 1p per kall pluss 1p for at byttene er vist. En tidlig feil som følges konsekvent videre trekkes bare én gang.",
      "(c) 3p: 1p for at siste element flyttes til roten, 1p for minste barn, 1p for stoppkriteriet. Bare en beskrivelse i ord gir rundt halvparten.",
      "(d) 2p: 1p for O(log n), 1p for begrunnelsen."
    ]
  };

  /* ======================================================================
     2. Linear probing: sletting som tetter hullet
     ====================================================================== */
  P["MOCK-probing-slett"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>Tabellen etter alle innsettingene (h(k) = k mod 10):</p>" + row([29, 31, 42, 11, 23, 51, 70, _, _, 19]) +
          "<p>Plassene som sjekkes: 11: 1, 2, 3. 23: 3, 4. 51: 1, 2, 3, 4, 5. 29: 9, 0 (rundt kanten). 70: 0, 1, 2, 3, 4, 5, 6.</p>",
        poeng: ["riktig tabell (2p)"] },
      { del: "(b)",
        tekst: "<p>Plass 1 blir et hull. Vi går videre til første tomme plass. En nøkkel på plass j flyttes inn i hullet i bare hvis hjemmeplassen ikke ligger i (i, j], regnet rundt tabellen.</p>" +
          "<ul><li>42 (hjem 2) blir stående.</li><li>11 (hjem 1) flyttes til 1. Hullet er nå på 3.</li><li>23 (hjem 3) flyttes til 3. Hull på 4.</li>" +
          "<li>51 (hjem 1) flyttes til 4. Hull på 5.</li><li>70 (hjem 0) flyttes til 5. Hull på 6.</li><li>Plass 7 er tom: stopp.</li></ul>" +
          row([29, 11, 42, 23, 51, 70, _, _, _, 19]),
        poeng: ["42 blir stående (1p)", "11, 23 og 51 flyttes (1p)", "70 flyttes også, og sluttabellen er riktig (1p)"] },
      { del: "(c)",
        tekst: "<p>Hull på 9. 29 på plass 0 har hjem 9, som ikke ligger i (9, 0], så 29 flyttes til 9, og hullet går til 0. " +
          "11, 42, 23 og 51 har hjemmeplass mellom hullet og der de står, så de blir stående. 70 på plass 5 har hjem 0 og flyttes til 0. Plass 6 er tom: stopp.</p>" +
          row([70, 11, 42, 23, 51, _, _, _, _, 29]),
        fig: hashFig([70, 11, 42, 23, 51, _, _, _, _, 29], "Tabellen etter at 31 og 19 er slettet"),
        fasitVerdi: "70, 11, 42, 23, 51, _, _, _, _, 29",
        poeng: ["29 går rundt kanten til plass 9 (1p)", "70 flyttes til plass 0 (1p)"] },
      { del: "(d)",
        tekst: "<p>Setter vi bare plass 1 til null, starter et søk etter 11 på hjemmeplassen 1, ser en tom plass og svarer at 11 ikke finnes. Men 11 ligger på plass 3. Søket stopper på første tomme plass, så hullet gjør nøklene bak det usynlige.</p>",
        poeng: ["et konkret søk som feiler (1p)"] },
      { del: "(e)",
        tekst: "<p>Finn nøkkelen, sett plassen til null, og gå videre til neste tomme plass. Hver nøkkel som ellers ville blitt gjemt, flyttes inn i hullet, og hullet flytter seg dit nøkkelen sto.</p>",
        kode: "hsProbeRemove",
        etter: "<p class=\"small muted\">«h(A[j].key, N) ∉ (i, j]» betyr at nøkkelen på plass j gikk forbi hullet da den ble satt inn. Intervallet regnes rundt tabellen.</p>",
        kjoretid: "forventet O(1) når Load factor holdes lav (korte klynger), O(n) i verste fall (hele tabellen er én klynge)",
        poeng: ["pseudokode som flytter riktig og stopper på tom plass (1p)", "kjøretid med forventet og verste tilfelle (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du viser hver eneste nøkkel som flytter seg, og hvorfor 42 får bli stående. Da ser den som retter at du skjønner regelen, ikke bare har gjettet sluttabellen.</p>",
      normal: "<p>Svaret gir hver flytting med hjemmeplass og intervallet (i, j]. Det er der poengene ligger: at 42 ikke flyttes, at hullet vandrer helt til en tom plass, og at tabellen går rundt (29 og 70).</p>",
      teknisk: "<p>Invarianten for Linear probing er at ingen nøkkel har en tom plass mellom hjemmeplassen og plassen sin. Slettingen gjenoppretter den ved å flytte nøkler hvis hjemmeplass ikke ligger i (i, j]. Kjøretiden er lengden av klyngen, forventet O(1) med lav Load factor.</p>"
    },
    anslag: [
      "(a) 2p: riktig tabell. Feil rundt kanten (29 og 70) gir typisk 1p.",
      "(b) 3p: 1p for at 42 blir stående, 1p for at 11, 23 og 51 flyttes, 1p for 70 og riktig sluttabell.",
      "(c) 2p: 1p for 29 rundt kanten, 1p for at 70 flyttes til 0.",
      "(d) 1p: et konkret søk som feiler.",
      "(e) 2p: 1p for pseudokoden, 1p for kjøretiden med forventet og verste tilfelle."
    ]
  };

  /* ======================================================================
     3. AVL-tre: innsetting og sletting
     ====================================================================== */
  P["MOCK-avl"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p><b>14:</b> kjeden 5 → 9 → 14 gir bf(5) = −2 og bf(9) = −1 (samme retning). <span class=\"mono\">LeftRotate(5)</span> gir 9 med barna 5 og 14.</p>" +
          "<p><b>3 og 7:</b> ingen rotasjon.</p>" +
          "<p><b>6:</b> 6 blir venstre barn av 7. Da får 9 bf = +2, og venstre barn 5 har bf = −1 (motsatt retning). Først <span class=\"mono\">LeftRotate(5)</span>, så <span class=\"mono\">RightRotate(9)</span>. Ny rot er 7, med 5(3, 6) til venstre og 9(_, 14) til høyre.</p>" +
          "<p><b>4:</b> 4 blir høyre barn av 3, og alle balansefaktorer er mellom −1 og 1. Ingen rotasjon.</p>" +
          "<p>Treet etter alle innsettingene, i preorder: 7, 5, 3, 4, 6, 9, 14.</p>",
        fasitVerdi: "7, 5, 3, 4, 6, 9, 14",
        poeng: ["riktig tre før og etter hver rotasjonssituasjon (1p hver)", "riktige navn på rotasjonene, med noden de gjøres på (1p hver)"] },
      { del: "(b)",
        tekst: tab(["node", "høyde", "balansefaktor"], [[7, 3, "+1"], [5, 2, "+1"], [3, 1, "−1"], [9, 1, "−1"], [4, 0, 0], [6, 0, 0], [14, 0, 0]]),
        fig: treeFig([7, [5, [3, null, [4]], [6]], [9, null, [14]]], "Det ferdige AVL-treet"),
        poeng: ["riktig tre (1p)", "høyder og balansefaktorer, med løvnode = 0 (1p)"] },
      { del: "(c)",
        tekst: "<p>7 har to barn. Den minste i høyre subtre er 9, så 9 kopieres opp i roten og slettes fra høyre subtre. Der har 9 bare barnet 14, som tar plassen. " +
          "Roten får venstre høyde 2 og høyre høyde 0, altså bf = +2. Venstre barn 5 har bf = +1, så én <span class=\"mono\">RightRotate</span> på roten holder.</p>" +
          "<p>Resultat: 5 med 3(_, 4) til venstre og 9(6, 14) til høyre. Høyden er 2.</p>",
        fig: treeFig([5, [3, null, [4]], [9, [6], [14]]], "Etter Remove(7) og RightRotate på roten"),
        poeng: ["riktig etterfølger og kopiering (1p)", "riktig rotasjon og sluttre (1p)"] },
      { del: "(d)",
        tekst: "<p><b>O(log n)</b> for begge. Et AVL-tre har høyde O(log n). Innsetting og sletting går én sti ned og én sti opp, og på hver node gjøres SetHeight og eventuelt en rotasjon, begge O(1).</p>",
        kjoretid: "O(log n) for både Insert og Remove",
        poeng: ["O(log n) (1p)", "begrunnelse med høyden (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du tegner treet før og etter hver vipp og sier hvilken vei du vipper. Da kan den som retter følge hvert steg.</p>",
      normal: "<p>For hver ubalanse oppgir svaret balansefaktoren til noden og barnet. Det avgjør om det blir én eller to rotasjoner. Rotasjonene er navngitt med noden de gjøres på, og høydene følger kursets regel (løvnode 0, null −1).</p>",
      teknisk: "<p>Den laveste noden med |bf| = 2 rettes først. Samme fortegn på barnet gir én rotasjon, motsatt fortegn gir to. Ved sletting gir et barn med bf 0 eller samme fortegn én rotasjon. Kjøretiden følger av høyden O(log n) og O(1) arbeid per node på stien.</p>"
    },
    anslag: [
      "(a) 4p: 2p per rotasjonssituasjon, 1p for riktig tre og 1p for riktig navn på rotasjonene.",
      "(b) 2p: 1p for treet, 1p for høyder og balansefaktorer (høyde i kanter, løvnode = 0).",
      "(c) 2p: 1p for etterfølger og kopiering, 1p for rotasjon og sluttre.",
      "(d) 2p: 1p for O(log n), 1p for begrunnelsen."
    ]
  };

  /* ======================================================================
     4. Binært søketre: Remove
     ====================================================================== */
  P["MOCK-bst-remove"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>Mindre går til venstre, ellers til høyre. Høyden er <b>4</b>, langs stien 50 → 80 → 60 → 70 → 65.</p>",
        fig: treeFig([50, [30, [20], [40, [35]]], [80, [60, null, [70, [65]]], [90]]], "Treet etter innsettingene"),
        poeng: ["riktig tre (1p)", "høyden 4, målt i kanter (1p)"] },
      { del: "(b)",
        tekst: "<ol><li><b>Slett 35</b> (løvnode): fjernes. Preorder: 50, 30, 20, 40, 80, 60, 70, 65, 90.</li>" +
          "<li><b>Slett 70</b> (ett barn): 65 tar plassen. Preorder: 50, 30, 20, 40, 80, 60, 65, 90.</li>" +
          "<li><b>Slett 50</b> (to barn): den minste i høyre subtre er 60. 60 kopieres opp, og 60 slettes fra høyre subtre, der barnet 65 tar plassen. Preorder: 60, 30, 20, 40, 80, 65, 90.</li>" +
          "<li><b>Slett 30</b> (to barn): den minste i høyre subtre er 40, en løvnode. 40 kopieres opp, og løvnoden fjernes. Preorder: 60, 40, 20, 80, 65, 90.</li></ol>",
        fig: treeFig([60, [40, [20]], [80, [65], [90]]], "Treet etter de fire slettingene"),
        fasitVerdi: "60, 40, 20, 80, 65, 90",
        poeng: ["1p per sletting, med riktig tilfelle", "to barn: riktig etterfølger, og at barnet til etterfølgeren (65) blir med"] },
      { del: "(c)",
        tekst: "<p>Søk ned til x. Har noden høyst ett barn, returnerer vi det andre barnet (null for en løvnode). Har den to barn, kopierer vi inn den minste i høyre subtre og sletter den derfra.</p>",
        kode: "bstRemove",
        etter: "<p class=\"small muted\">FindMin går til venstre så langt det går. Den minste i høyre subtre har aldri venstre barn, så den rekursive slettingen havner i et av de enkle tilfellene.</p>",
        poeng: ["søket ned (1p)", "null eller ett barn (1p)", "to barn med FindMin og rekursiv sletting (1p)"] },
      { del: "(d)",
        tekst: "<p><b>O(h).</b> Vi går én sti ned for å finne x, og eventuelt videre ned for å finne den minste i høyre subtre. Treet er ikke balansert, så h kan bli n − 1, og da er Remove O(n).</p>",
        kjoretid: "O(h), som er O(n) i verste fall",
        poeng: ["O(h) og O(n) for et skjevt tre (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du sier hvilken type sletting det er hver gang, og tegner treet etterpå. Da ser den som retter at du kan alle tre måtene.</p>",
      normal: "<p>Hver sletting er merket med tilfellet (løvnode, ett barn, to barn). I to-barn-tilfellene er etterfølgeren og barnet dens med. Pseudokoden er kursets Remove, og kjøretiden er gitt som O(h) med verste tilfelle O(n).</p>",
      teknisk: "<p>Den minste i høyre subtre er den neste i inorder, så søketre-egenskapen holder når den flyttes opp. Den har høyst ett barn, så den rekursive slettingen er et av de enkle tilfellene. Arbeidet er proporsjonalt med høyden, og uten balansering kan høyden bli n − 1.</p>"
    },
    anslag: [
      "(a) 2p: 1p for treet, 1p for høyden målt i kanter.",
      "(b) 4p: 1p per sletting. To-barn-tilfellene krever riktig etterfølger og at barnet til etterfølgeren blir med.",
      "(c) 3p: 1p for søket ned, 1p for null eller ett barn, 1p for to barn med FindMin.",
      "(d) 1p: O(h), og O(n) for et skjevt tre."
    ]
  };

  /* ======================================================================
     5. BuildMaxHeap og Heapsort
     ====================================================================== */
  P["MOCK-buildheap-heapsort"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>BuildMaxHeap kaller BubbleDown for i = ⌊8/2⌋ = 4 ned til 0. For i = 4, 3 og 1 endres ingenting.</p>" +
          tab(["etter", "array"], [["start", "4, 10, 3, 5, 1, 8, 9, 2"], ["i = 2: 3 ↔ 9", "4, 10, 9, 5, 1, 8, 3, 2"], ["i = 0: 4 ↔ 10, så 4 ↔ 5", "10, 5, 9, 4, 1, 8, 3, 2"]]),
        fig: heapFig([10, 5, 9, 4, 1, 8, 3, 2], "Max-heapen etter BuildMaxHeap"),
        poeng: ["riktig startindeks og retning (1p)", "riktige mellomtilstander (2p)"] },
      { del: "(b)",
        tekst: "<p>Hver runde bytter roten med A[i] og bobler den nye roten ned i plassene 0 … i − 1. Arrayet etter hver runde (sortert hale etter |):</p>" +
          tab(["runde", "array"], [
            ["i = 7", "9, 5, 8, 4, 1, 2, 3 | 10"], ["i = 6", "8, 5, 3, 4, 1, 2 | 9, 10"], ["i = 5", "5, 4, 3, 2, 1 | 8, 9, 10"],
            ["i = 4", "4, 2, 3, 1 | 5, 8, 9, 10"], ["i = 3", "3, 2, 1 | 4, 5, 8, 9, 10"], ["i = 2", "2, 1 | 3, 4, 5, 8, 9, 10"],
            ["i = 1", "1 | 2, 3, 4, 5, 8, 9, 10"], ["i = 0", "1, 2, 3, 4, 5, 8, 9, 10"]]),
        fasitVerdi: "1, 2, 3, 4, 5, 8, 9, 10",
        poeng: ["riktige runder (ca. 1p per to runder). En tidlig feil som følges konsekvent trekkes én gang"] },
      { del: "(c)",
        tekst: "<p>HeapSort bygger en max-heap, og flytter så det største bakerst, ett om gangen, mens heapen krymper:</p>",
        kode: "heapSort",
        poeng: ["BubbleDown mot det største barnet (1p)", "løkka som bytter og krymper heapen (1p)"] },
      { tekst: "<p>BuildMaxHeap og BubbleDown, som HeapSort bruker:</p>", kode: "buildMaxHeap" },
      { kode: "heapBubbleDown",
        etter: "<p class=\"small muted\">BubbleDown får i som størrelse i løkka. Plassene fra i og bakover er allerede sortert og skal ikke røres.</p>" },
      { del: "(d)",
        tekst: "<p><b>O(n log n)</b> i alle tilfeller: BuildMaxHeap er O(n), og hver av de n rundene bobler ned på O(log n). Heapsort er in-place (bare bytter i A), men ikke stabil: byttet med roten kan hoppe like elementer forbi hverandre.</p>",
        kjoretid: "O(n log n), in-place, ikke stabil",
        poeng: ["O(n log n) med riktig stabil og in-place (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du viser rekka etter hver eneste runde. Da kan den som retter se nøyaktig hvor du er, og gi poeng for alt som er riktig.</p>",
      normal: "<p>BuildMaxHeap starter på ⌊n/2⌋ og går ned til 0, som i kurset. Hver runde i (b) er vist, så en eventuell feil kan følges videre. Pseudokoden har både byttet med roten og at heapen krymper.</p>",
      teknisk: "<p>Invarianten er at A[0 … i − 1] er en max-heap og A[i … n − 1] er sortert og større eller lik alt foran. Byttet og BubbleDown(A, 0, i) bevarer den. n runder à O(log n) gir O(n log n). Langdistansebyttet gjør algoritmen ustabil.</p>"
    },
    anslag: [
      "(a) 3p: 1p for startindeks og retning, 2p for mellomtilstandene.",
      "(b) 4p: ca. 1p per to runder. En tidlig feil som følges konsekvent trekkes én gang.",
      "(c) 2p: 1p for BubbleDown mot største barn, 1p for løkka som bytter og krymper heapen.",
      "(d) 1p: O(n log n) med riktig stabil og in-place."
    ]
  };

  /* ======================================================================
     6. Linear probing med rehashing
     ====================================================================== */
  P["MOCK-rehash"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>N = 4: 6 → 2, 13 → 1, 9 → 1 er opptatt, 2 er opptatt, 3 er ledig. Nå er n/N = 3/4 = 0,75.</p>" + row([_, 13, 6, 9]),
        poeng: ["riktig tabell før rehashing (2p)"] },
      { del: "(b)",
        tekst: "<p>Før 21 er 3/4 ≥ 0,75, så N blir 8. Nøklene settes inn på nytt i gammel rekkefølge 13, 6, 9: 13 → 5, 6 → 6, 9 → 1.</p>" + row([_, 9, _, _, _, 13, 6, _]) +
          "<p>21 → 5, 6 opptatt, 7. 17 → 1 opptatt, 2. 30 → 6, 7 opptatt, 0 (rundt kanten). Load factor var under 0,75 før hver av dem.</p>" + row([30, 9, 17, _, _, 13, 6, 21]),
        poeng: ["riktig rehashet tabell (1p)", "riktige innsettinger etterpå, med 30 rundt kanten (2p)"] },
      { del: "(c)",
        tekst: "<p>Før 14 er n/N = 6/8 = 0,75, så N blir 16. Gammel rekkefølge 30, 9, 17, 13, 6, 21 gir 30 → 14, 9 → 9, 17 → 1, 13 → 13, 6 → 6, 21 → 5, uten kollisjoner.</p>" +
          row([_, 17, _, _, _, 21, 6, _, _, 9, _, _, _, 13, 30, _]) +
          "<p>14 → 14 er opptatt, 15 er ledig:</p>" + row([_, 17, _, _, _, 21, 6, _, _, 9, _, _, _, 13, 30, 14]),
        fasitVerdi: "_, 17, _, _, _, 21, 6, _, _, 9, _, _, _, 13, 30, 14",
        poeng: ["rehashing skjer før 14 (1p)", "riktig sluttabell (1p)"] },
      { del: "(d)",
        tekst: "<p>Insert sjekker Load factor først. Er den for høy, kaller den Rehash, som dobler N og setter inn alle nøklene på nytt:</p>",
        kode: "hsInsertRehash",
        poeng: ["sjekken av Load factor og doblingen (1p)", "at alle nøklene settes inn på nytt (1p)"] },
      { kode: "hsRehash",
        etter: "<p class=\"small muted\">Nøklene må hashes på nytt fordi hjemmeplassen k mod N endres når N endres. Rehash går gjennom B fra plass 0 og oppover, slik oppgaven sier.</p>" },
      { del: "(e)",
        tekst: "<p>N dobles hver gang. Etter en rehashing med n nøkler kan vi sette inn omtrent n nye før neste (her: rehashing ved n = 3 og ved n = 6). Kostnaden O(n) fordeles på disse innsettingene, så det blir O(1) ekstra per innsetting i snitt. Ellers er innsetting forventet O(1) fordi Load factor holdes under 0,75.</p>",
        kjoretid: "forventet amortisert O(1) per innsetting, O(n) i verste fall",
        poeng: ["dobling og amortisering (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du viser den store, nye tabellen hver gang den blir laget, og hvor hver nøkkel havner. Da ser den som retter at du vet at plassene endrer seg.</p>",
      normal: "<p>Svaret sjekker Load factor før hver innsetting, som oppgaven sier, og setter nøklene inn på nytt i riktig rekkefølge med ny N. Begge rehashingene og alle kollisjonene er vist. Amortiseringen er forklart med doblingen.</p>",
      teknisk: "<p>Med dobling ligger rehashingene ved n = 3 og n = 6, og flyttene summerer seg til O(n) totalt. Det gir amortisert O(1) per innsetting. Med N ← N + c ville totalarbeidet blitt kvadratisk.</p>"
    },
    anslag: [
      "(a) 2p: riktig tabell før rehashing.",
      "(b) 3p: 1p for den rehashede tabellen, 2p for innsettingene etterpå (rundt kanten for 30).",
      "(c) 2p: 1p for at rehashing skjer før 14, 1p for sluttabellen.",
      "(d) 2p: 1p for sjekken av Load factor og dobling, 1p for at alle nøklene settes inn på nytt.",
      "(e) 1p: dobling og amortisering."
    ]
  };

  /* ======================================================================
     7. Dijkstra med tabell
     ====================================================================== */
  var DN = { A: [30, 95], B: [125, 30], C: [125, 160], D: [235, 30], E: [235, 160], F: [330, 95] };
  var DE = [["A", "B", 4], ["A", "C", 1], ["B", "C", 2], ["B", "D", 5], ["C", "D", 8], ["C", "E", 10], ["D", "E", 2], ["D", "F", 6], ["E", "F", 3]];
  P["MOCK-dijkstra"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>Gamle køinnslag for en node som allerede er besøkt, hoppes over. Tabellen viser dist etter hvert uttak:</p>" +
          tab(["tatt ut", "A", "B", "C", "D", "E", "F"], [
            ["start", 0, "∞", "∞", "∞", "∞", "∞"], ["A (0)", 0, 4, 1, "∞", "∞", "∞"], ["C (1)", 0, 3, 1, 9, 11, "∞"], ["B (3)", 0, 3, 1, 8, 11, "∞"],
            ["B (4): hopp over", 0, 3, 1, 8, 11, "∞"], ["D (8)", 0, 3, 1, 8, 10, 14], ["D (9): hopp over", 0, 3, 1, 8, 10, 14], ["E (10)", 0, 3, 1, 8, 10, 13],
            ["E (11): hopp over", 0, 3, 1, 8, 10, 13], ["F (13)", 0, 3, 1, 8, 10, 13], ["F (14): hopp over", 0, 3, 1, 8, 10, 13]]) +
          "<p>Nodene blir besøkt i rekkefølgen A, C, B, D, E, F. Til slutt: A 0, B 3, C 1, D 8, E 10, F 13.</p>",
        fasitVerdi: "A 0, B 3, C 1, D 8, E 10, F 13",
        poeng: ["riktig startoppsett (1p)", "riktige oppdateringer, også B: 4 → 3 (3p)", "riktig rekkefølge nodene tas ut (1p)"] },
      { del: "(b)",
        tekst: "<p>Følg foreldrene bakover fra F: F ← E ← D ← B ← C ← A. Veien er <b>A – C – B – D – E – F</b> med lengde 1 + 2 + 5 + 2 + 3 = <b>13</b>.</p>",
        fig: graphFig(DN, DE, false, [["A", "C"], ["C", "B"], ["B", "D"], ["D", "E"], ["E", "F"]], null, "Korteste-vei-treet fra A"),
        poeng: ["vei og lengde (1p)"] },
      { del: "(c)",
        tekst: "<p>Kursets Dijkstra med prioritetskø og visited:</p>",
        kode: "dijkstra",
        etter: "<p class=\"small muted\">For å kunne svare på (b) lagrer vi i tillegg forelderen til v hver gang dist[v] blir bedre (parents[v] ← u sammen med linje 12).</p>",
        poeng: ["prioritetskø og oppdatering av dist (2p)"] },
      { del: "(d)",
        tekst: "<p><b>O((|V| + |E|) · log(|V|)).</b> Hver node tas ut og behandles én gang, og hver kant kan gi én innsetting i køen. Køen har høyst O(|E|) innslag, og hver Insert og RemoveMin koster O(log(|E|)) = O(log(|V|)).</p>",
        kjoretid: "O((|V| + |E|) · log(|V|)) med binær heap",
        poeng: ["riktig kjøretid (1p)"] },
      { del: "(e)",
        tekst: "<p>Rettet graf: (A, B) vekt 2, (A, C) vekt 4, (C, B) vekt −3, (B, D) vekt 1. Dijkstra tar ut B (2) og D (3) før C (4). Når C tas ut, blir dist[B] = 1, men B er besøkt og behandles ikke på nytt, så D blir stående med 3. Korteste vei A → C → B → D har lengde 2. Dijkstra antar at en node som er tatt ut ikke får kortere vei senere, og det holder bare uten negative vekter.</p>",
        poeng: ["et konkret moteksempel (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Tabellen viser hver gang et tall blir mindre. Da ser den som retter at du ikke glemte den lure snarveien til B.</p>",
      normal: "<p>Svaret viser hvert uttak, alle oppdateringene og de gamle innslagene som hoppes over. Oppdateringen B: 4 → 3 er med, og det er den vanligste feilen. Kjøretiden og moteksempelet er egne poengposter.</p>",
      teknisk: "<p>Når u tas ut med minst dist, finnes det ingen kortere vei til u, fordi alle vekter er ikke-negative. Det er dette som brytes med negative vekter. Kjøretiden kommer av O(|E|) køoperasjoner à O(log(|V|)).</p>"
    },
    anslag: [
      "(a) 5p: 1p for startoppsettet, 3p for oppdateringene, 1p for rekkefølgen. Å glemme B: 4 → 3 gir følgefeil.",
      "(b) 1p: vei og lengde.",
      "(c) 2p: pseudokode med prioritetskø og oppdatering. Et kall til en ukjent metode uten forklaring gir trekk.",
      "(d) 1p: kjøretid.",
      "(e) 1p: et konkret moteksempel."
    ]
  };

  /* ======================================================================
     8. Topologisk sortering
     ====================================================================== */
  P["MOCK-topsort"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>Inngrader: A 0, B 0, C 2, D 1, E 2, F 1, G 2. A og B legges på stakken, så B ligger øverst.</p>" +
          tab(["tas av", "inngrad endres", "stakk etterpå (øverst til høyre)", "output"], [
            ["B", "C 2→1, D 1→0 (push D)", "A, D", "B"], ["D", "E 2→1, F 1→0 (push F)", "A, F", "B, D"], ["F", "G 2→1", "A", "B, D, F"],
            ["A", "C 1→0 (push C)", "C", "B, D, F, A"], ["C", "E 1→0 (push E)", "E", "B, D, F, A, C"], ["E", "G 1→0 (push G)", "G", "B, D, F, A, C, E"],
            ["G", "", "tom", "B, D, F, A, C, E, G"]]) +
          "<p>Output har 7 = |V| noder, så ordningen er <b>B, D, F, A, C, E, G</b>.</p>",
        fasitVerdi: "B, D, F, A, C, E, G",
        poeng: ["riktige inngrader (1p)", "riktig kjøring med stakk og output (3p)"] },
      { del: "(b)",
        tekst: "<p>Nei. A, B, C, D, E, F, G er også gyldig, fordi hver kant (u, v) har u før v. Ordningen er unik bare hvis det hele tiden er nøyaktig én node med inngrad 0.</p>",
        poeng: ["en annen gyldig ordning (1p)"] },
      { del: "(c)",
        tekst: "<p>Nå har B inngrad 1, så bare A legges på stakken. A tas av, C får inngrad 1, og stakken er tom. Output er [A], og 1 &lt; 7 = |V|. Algoritmen melder feil: grafen har en sykel (B → D → E → G → B), og da finnes ingen topologisk ordning.</p>",
        poeng: ["algoritmen stopper med bare A (1p)", "det betyr at grafen har en sykel (1p)"] },
      { del: "(d)",
        tekst: "<p>Kursets TopSort med inngrad og stakk:</p>",
        kode: "topSort",
        poeng: ["inngrad og stakk (1p)", "sykelsjekken |output| &lt; |V| (1p)"] },
      { del: "(e)",
        tekst: "<p><b>O(|V| + |E|).</b> Hver node legges på og tas av stakken høyst én gang, og hver kant ses på én gang. Inngradene telles på O(|V| + |E|).</p>",
        kjoretid: "O(|V| + |E|)",
        poeng: ["O(|V| + |E|) (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du skriver opp stakken og tellerne hver gang noe skjer. Da kan den som retter se at du tok fra toppen av stakken, slik kurset gjør.</p>",
      normal: "<p>Tabellen viser hvert pop, hvilke inngrader som går ned, og når en node pushes. Med stakk (ikke kø) blir output B, D, F, A, C, E, G. (c) bruker sykelsjekken fra pseudokoden til å forklare hva som skjer.</p>",
      teknisk: "<p>En node kommer i output først når alle forgjengerne er der, så rekkefølgen respekterer kantene. Hvis en sykel finnes, får ingen node på den inngrad 0, og output blir kortere enn |V|. Hver node og kant behandles én gang.</p>"
    },
    anslag: [
      "(a) 4p: 1p for inngradene, 3p for kjøringen med stakk og output.",
      "(b) 1p: en annen gyldig ordning.",
      "(c) 2p: 1p for at algoritmen stopper med bare A, 1p for at det betyr sykel.",
      "(d) 2p: pseudokode med inngrad og sykelsjekk.",
      "(e) 1p: O(|V| + |E|)."
    ]
  };

  /* ======================================================================
     9. Minimalt spenntre: Kruskal og Prim
     ====================================================================== */
  var MN = { A: [30, 95], B: [130, 30], C: [130, 160], D: [240, 30], E: [240, 160], F: [340, 95] };
  var ME = [["A", "B", 6], ["A", "C", 3], ["B", "C", 4], ["B", "D", 2], ["C", "D", 5], ["C", "E", 7], ["D", "E", 8], ["D", "F", 9], ["E", "F", 1]];
  P["MOCK-mst"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>Kantene i stigende vekt. En kant tas med hvis endepunktene ikke allerede henger sammen:</p>" +
          tab(["kant", "vekt", "tatt med?", "begrunnelse"], [
            ["E–F", 1, "ja", ""], ["B–D", 2, "ja", ""], ["A–C", 3, "ja", ""], ["B–C", 4, "ja", "slår sammen {A, C} og {B, D}"],
            ["C–D", 5, "nei", "C og D henger allerede sammen"], ["A–B", 6, "nei", "A og B henger allerede sammen"], ["C–E", 7, "ja", "nå henger alt sammen"],
            ["D–E", 8, "nei", "ville gitt en sykel"], ["D–F", 9, "nei", "ville gitt en sykel"]]),
        fasitVerdi: "E–F, B–D, A–C, B–C, C–E",
        poeng: ["riktig rekkefølge og riktige valg, med begrunnelse for de forkastede kantene (3p)"] },
      { del: "(b)",
        tekst: "<p>Prim fra A tar alltid den letteste kanten i køen. Har enden alt kommet med i treet, kastes kanten. Nodene legges til i rekkefølgen:</p>" +
          tab(["node", "via kant"], [["A", "start"], ["C", "A–C 3"], ["B", "C–B 4"], ["D", "B–D 2"], ["E", "C–E 7"], ["F", "E–F 1"]]) +
          "<p>Før C–E 7 tas ut, kastes D–B 2, B–C 4, C–D 5, D–C 5, A–B 6 og B–A 6, fordi enden allerede er i treet.</p>",
        fasitVerdi: "A, C, B, D, E, F",
        poeng: ["riktig rekkefølge med kant (3p, 2p hvis bare nodene er riktige)"] },
      { del: "(c)",
        tekst: "<p>Kantene A–C, B–C, B–D, C–E og E–F. Totalvekt 3 + 4 + 2 + 7 + 1 = <b>17</b>. Prim og Kruskal gir samme tre fordi alle vektene er forskjellige.</p>",
        fig: graphFig(MN, ME, false, [["A", "C"], ["B", "C"], ["B", "D"], ["C", "E"], ["E", "F"]], null, "Det minimale spenntreet (|V| − 1 = 5 kanter)"),
        poeng: ["tre og totalvekt (1p)"] },
      { del: "(d)",
        tekst: "<p><b>t = 7</b>, den største kanten i det minimale spenntreet. Med bare kanter ≤ 6 er {E, F} skilt fra resten.</p>",
        poeng: ["7 med begrunnelse (1p)"] },
      { del: "(e)",
        tekst: "<p>Kursets Prim. Alle kantene fra den nye noden legges i køen, og kanter til noder som alt er med, kastes når de tas ut:</p>",
        kode: "prim",
        kjoretid: "O(|E| · log(|V|)): hver kant gir høyst to innsettinger i køen, og hver køoperasjon koster O(log(|E|)) = O(log(|V|))",
        poeng: ["pseudokode (1p)", "kjøretid (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>For hver tausnutt sier du om du tar den eller ikke, og hvorfor. Da ser den som retter at du aldri lager en ring.</p>",
      normal: "<p>Kruskal-tabellen begrunner hver forkastet kant. Prim-svaret gir både noden og kanten den kom via, som er det som gir full pott. Totalvekten og terskelen t henger sammen: t er den største kanten i spenntreet.</p>",
      teknisk: "<p>Begge er grådige og velger en lettest kant over et snitt, så begge gir et minimalt spenntre. Med ulike vekter er det unikt. Et minimalt spenntre minimerer også den største kanten, derfor er t = 7.</p>"
    },
    anslag: [
      "(a) 3p: riktig rekkefølge og riktige valg, med begrunnelse for forkastede kanter.",
      "(b) 3p: riktig rekkefølge med kant (2p hvis bare nodene er riktige).",
      "(c) 1p: tre og vekt.",
      "(d) 1p: 7 med begrunnelse.",
      "(e) 2p: 1p for pseudokode, 1p for kjøretid."
    ]
  };

  /* ======================================================================
     10. Quicksort med Partition
     ====================================================================== */
  P["MOCK-quicksort"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>Pivot = A[8] = 5, left = 0, right = 7.</p>" +
          tab(["hendelse", "left", "right", "array etterpå"], [
            ["7 &gt; 5 og 1 &lt; 5: bytt", 0, 7, "1, 2, 9, 4, 3, 8, 6, 7, 5"],
            ["left stopper på 9, right stopper på 3: bytt", 2, 4, "1, 2, 3, 4, 9, 8, 6, 7, 5"],
            ["left stopper på 9, right går forbi left", 4, 3, "ingen bytte, løkka slutter"],
            ["pivot på plass: bytt A[4] og A[8]", 4, "", "1, 2, 3, 4, 5, 8, 6, 7, 9"]]) +
          "<p>Partition returnerer <b>4</b>.</p>",
        poeng: ["riktig pivot (1p)", "riktige bytter (2p)", "returverdi og sluttarray (1p)"] },
      { del: "(b)",
        tekst: tab(["kall", "pivot", "returnerer", "array etterpå"], [
            ["Partition(A, 0, 3)", 4, 3, "uendret"], ["Partition(A, 0, 2)", 3, 2, "uendret"], ["Partition(A, 0, 1)", 2, 1, "uendret"],
            ["Partition(A, 5, 8)", 9, 8, "uendret"], ["Partition(A, 5, 7)", 7, 6, "bytt 8 og 6, så 8 og 7: 1, 2, 3, 4, 5, 6, 7, 8, 9"]]) +
          "<p>De andre kallene har low ≥ high og returnerer med en gang.</p>",
        fasitVerdi: "1, 2, 3, 4, 5, 6, 7, 8, 9",
        poeng: ["rekursjonen med riktige delarrayer (3p)"] },
      { del: "(c)",
        tekst: "<p>Kursets Quicksort og Partition (ChoosePivot velger her siste element):</p>",
        kode: "quickSort",
        poeng: ["Quicksort (1p)", "Partition (1p)"] },
      { kode: "partition" },
      { del: "(d)",
        tekst: "<p><b>O(n²)</b> i verste tilfelle. Med siste element som pivot skjer det når arrayet allerede er sortert (eller sortert baklengs): hver Partition skiller bare ut ett element, så det blir n nivåer med O(n) arbeid.</p>",
        kjoretid: "O(n²) i verste tilfelle, O(n log n) typisk",
        poeng: ["O(n²) med riktig verste-tilfelle-input (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du viser hvor de to pekerne stopper før hvert bytte. Da kan den som retter se at du bruker kursets måte å dele på.</p>",
      normal: "<p>Tabellen i (a) gir left og right før hvert bytte og det siste byttet som setter pivoten på plass. Det er der returverdien kommer fra. Rekursjonen i (b) viser alle kallene som gjør noe.</p>",
      teknisk: "<p>Etter Partition er alt til venstre for pivoten ≤ pivoten og alt til høyre ≥, så pivoten står på sin endelige plass. Med siste element som pivot på sortert input blir delingene n − 1 og 0, og rekursjonsdybden n gir O(n²).</p>"
    },
    anslag: [
      "(a) 4p: 1p for pivot, 2p for byttene, 1p for returverdi og sluttarray.",
      "(b) 3p: rekursjonen med riktige delarrayer.",
      "(c) 2p: 1p for Partition, 1p for Quicksort.",
      "(d) 1p: O(n²) med riktig verste-tilfelle-input."
    ]
  };

  /* ======================================================================
     11. Radix sort
     ====================================================================== */
  P["MOCK-radix"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>Hver runde legger tallene bakerst i bøtta for sifferet, i den rekkefølgen de står, og samler bøttene fra 0 til 9 (tomme bøtter er utelatt):</p>" +
          tab(["runde", "bøtter", "array etterpå"], [
            ["1: enersifferet", "0: 230 · 2: 512, 302 · 5: 415, 85 · 7: 87, 147 · 8: 98", "230, 512, 302, 415, 85, 87, 147, 98"],
            ["2: tiersifferet", "0: 302 · 1: 512, 415 · 3: 230 · 4: 147 · 8: 85, 87 · 9: 98", "302, 512, 415, 230, 147, 85, 87, 98"],
            ["3: hundresifferet", "0: 85, 87, 98 · 1: 147 · 2: 230 · 3: 302 · 4: 415 · 5: 512", "85, 87, 98, 147, 230, 302, 415, 512"]]),
        fasitVerdi: "85, 87, 98, 147, 230, 302, 415, 512",
        poeng: ["2p per runde: 1p for bøttene, 1p for arrayet"] },
      { del: "(b)",
        tekst: "<p>Hver runde må bevare rekkefølgen fra forrige runde for tall med samme siffer. Det er det som gjør at de lavere sifrene «huskes». Uten stabilitet kan 87 havne foran 85 i siste runde. " +
          "Starter vi med det mest signifikante sifferet og gjør det samme, avgjør siste runde (enersifferet) alt, og vi får 230, 302, 512, 415, 85, 147, 87, 98, som ikke er sortert.</p>",
        poeng: ["stabilitet (1p)", "moteksempelet med mest signifikant først (1p)"] },
      { del: "(c)",
        tekst: "<p>Kursets RadixSort, med siffer d − 1 som enersifferet:</p>",
        kode: "radixSort",
        etter: "<p class=\"small muted\">BucketSort på siffer i legger hvert tall bakerst i bøtta for sifferet og samler bøttene fra 0 til N − 1. Det er det som gjør den stabil.</p>",
        kjoretid: "O(d · (N + n)): hver av de d rundene fordeler n tall og går gjennom N bøtter",
        poeng: ["pseudokode (1p)", "O(d · (N + n)) (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du viser alle bøttene i hver runde, og tallene står i den rekkefølgen de kom. Da ser den som retter at du ikke har stokket om noe.</p>",
      normal: "<p>Hver runde har både bøttene og arrayet, som er to egne poeng. 85 og 87 står i riktig rekkefølge hele veien, og det viser at du forstår stabiliteten. (b) bruker samme input til moteksempelet.</p>",
      teknisk: "<p>Invarianten etter runde r er at arrayet er sortert på de r minst signifikante sifrene. En stabil fordeling på neste siffer bevarer den. Det trengs ingen sammenligninger mellom tallene, så grensen O(n log n) for sammenligningsbasert sortering gjelder ikke.</p>"
    },
    anslag: [
      "(a) 6p: 2p per runde, 1p for bøttene og 1p for arrayet. Riktig sluttsvar med feil mellomtilstander gir lite.",
      "(b) 2p: 1p for stabilitet, 1p for moteksempelet.",
      "(c) 2p: 1p for pseudokode, 1p for O(d · (N + n))."
    ]
  };

  /* ======================================================================
     12. Separasjonsnoder
     ====================================================================== */
  var SN = { A: [30, 40], B: [30, 150], C: [120, 95], D: [215, 95], E: [300, 40], F: [300, 150], G: [390, 150] };
  var SE = [["A", "B"], ["A", "C"], ["B", "C"], ["C", "D"], ["D", "E"], ["D", "F"], ["E", "F"], ["F", "G"]];
  P["MOCK-separasjonsnoder"] = {
    type: "mock",
    svar: [
      { del: "(a)",
        tekst: "<p>DFS fra A med naboene i alfabetisk rekkefølge gir stien A → B → C → D → E → F → G som DFS-tre. Kursets Visit tar med alle besøkte naboer, også forelderen, når low regnes ut.</p>" +
          tab(["node", "A", "B", "C", "D", "E", "F", "G"], [["depth", 0, 1, 2, 3, 4, 5, 6], ["low", 0, 0, 0, 2, 3, 3, 5]]),
        poeng: ["depth (2p)", "low (2p)"] },
      { del: "(b)",
        tekst: "<p>En node u som ikke er roten, er en separasjonsnode hvis den har et barn v i DFS-treet med depth[u] ≤ low[v].</p>" +
          "<ul><li>F: barnet G har low 5, og 5 ≤ 5. Ja.</li><li>E: barnet F har low 3, og 4 ≤ 3 er usant. Nei.</li><li>D: barnet E har low 3, og 3 ≤ 3. Ja.</li>" +
          "<li>C: barnet D har low 2, og 2 ≤ 2. Ja.</li><li>B: barnet C har low 0, og 1 ≤ 0 er usant. Nei.</li></ul>" +
          "<p>Roten A har bare ett barn i DFS-treet (B), så A er ikke en separasjonsnode. Svaret er <b>{C, D, F}</b>.</p>",
        fig: graphFig(SN, SE, false, [["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"], ["E", "F"], ["F", "G"]], ["C", "D", "F"], "DFS-treet og separasjonsnodene C, D og F"),
        fasitVerdi: "C, D, F",
        poeng: ["riktige noder med regelen depth[u] ≤ low[v] (2p)", "roten behandlet for seg, med antall barn (1p)"] },
      { del: "(c)",
        tekst: "<p>Med {E, G} blir low[G] = depth[E] = 4, og 5 ≤ 4 er usant, så F er ikke lenger en separasjonsnode. D og C er det fortsatt. Svaret er <b>{C, D}</b>.</p>",
        poeng: ["{C, D} (1p)"] },
      { del: "(d)",
        tekst: "<p><b>O(|V| + |E|).</b> Det er ett Dybde-først søk med et fast arbeid ekstra per kant. Å fjerne hver node og sjekke om resten henger sammen koster O(|V| + |E|) per node, altså O(|V| · (|V| + |E|)).</p>",
        kjoretid: "O(|V| + |E|), mot O(|V| · (|V| + |E|)) for den naive metoden",
        poeng: ["O(|V| + |E|) (1p)", "sammenligningen med den naive metoden (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du skriver opp to tall for hver node, hvor dypt den ligger og hvor høyt den kan klatre. Så sjekker du regelen for hver node, og roten for seg. Da kan den som retter se hele tankegangen.</p>",
      normal: "<p>Tabellen med depth og low er grunnlaget for alt. I (b) er regelen brukt på hver node med et barn, og roten er sjekket med antall barn, ikke med low. Det er der de fleste mister poeng.</p>",
      teknisk: "<p>depth[u] ≤ low[v] betyr at ingen node i subtreet til v har en kant til en forfeder av u. Da går alle stier ut av subtreet via u. For roten er testen alltid sann, derfor teller vi barna i DFS-treet i stedet. Hele algoritmen er ett DFS.</p>"
    },
    anslag: [
      "(a) 4p: 2p for depth, 2p for low.",
      "(b) 3p: 2p for riktige noder med regelen, 1p for riktig behandling av roten.",
      "(c) 1p: {C, D}.",
      "(d) 2p: 1p for O(|V| + |E|), 1p for sammenligningen."
    ]
  };
})();
