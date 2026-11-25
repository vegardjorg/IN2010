/* ============================================================
   IN2010 guide · data-crash.js
   Stegdata for crash course-løypa (crash.html): 12 etapper i eksamensrekkefølge.
   Vekt = forventede eksamenspoeng steget dekker (sum 100 over hele løypa).
   min = minstelengde: E (Ekspress ~3 t), S (Standard ~1 dag), G (Grundig ~1 uke).
   tid = anslått minutter for steget, tidG = ekstra minutter i Grundig (ekstra kort).
   Grunnlag: plan/crash-course.md, eksamensmonster.md, eksamensinnhold.md,
   foreleser-vektlegging.md. Alt er omskrevet med egne ord. Klassisk script.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  function t(e, n, k) { return { eli5: e, normal: n, teknisk: k }; }

  /* Eksamenskortene på sidene: [side, fane, år, oppgavenr., tittel, poeng, element-id]
     Samme tall og id-er som oppgavekartet på forsiden (index.html, tabellen X).
     Fremdriftsnøkkelen til et kort er kort:<side>:<element-id>. Et valgfritt 8. felt gir en annen
     nøkkel når «kortet» egentlig er en test (da teller beste resultat ≥ terskel som «ok»). */
  var KORT = {
    s20sub:  ["sortering", "bucket",     "H2020", "7d", "SortSubanagrams", 6, "exam-h2020-7d"],
    s21stab: ["sortering", "bucket",     "H2021", "2",  "Stabilitet", 3, "exam-h2021-2"],
    s21tf:   ["sortering", "test",       "H2021", "3",  "Sant/usant om Bubble, Selection og Insertion sort", 10, "eksamen-test", "tf:sortering:h2021-oppg3"],
    s23gno:  ["sortering", "gnome",      "H2023", "4",  "Gnome sort", 10, "exam-gnome"],
    s24ety:  ["sortering", "bucket",     "H2024", "3",  "Etymologisk ordliste", 10, "exam-h2024-3"],
    k20int:  ["sok",       "sortersok",  "H2020", "5",  "Søk (Intersection)", 12, "exam-sortersok"],
    k21par:  ["sok",       "triks",      "H2021", "10", "Par med sum x", 10, "exam-triks"],
    k23dup:  ["sok",       "duplikat",   "H2023", "3",  "Finn duplikat", 12, "exam-duplikat"],
    k25kmin: ["sok",       "kminste",    "H2025", "6",  "Finn k minste", 12, "exam-kminste"],
    h21bin:  ["heap",      "removemin",  "H2021", "4",  "Binære heaps", 6, "exam-removemin"],
    h22bq:   ["heap",      "pk",         "H2022", "10", "Bucket queue (bøttekø)", 10, "exam-pk"],
    h22tf:   ["heap",      "test",       "H2022", "5",  "Prioritetskøer og heaper (sant/usant)", 10, "exam-test"],
    h23ins:  ["heap",      "innsetting", "H2023", "2",  "Innsetting i heap", 10, "exam-innsetting"],
    h24med:  ["heap",      "median",     "H2024", "7",  "Mediankø", 12, "exam-median"],
    h25lvl:  ["heap",      "levelorder", "H2025", "5",  "Level-order (heap)", 12, "exam-levelorder"],
    t20bst:  ["traer",     "bst",        "H2020", "2",  "Binære søketrær", 4, "exam-h2020-2"],
    t21rng:  ["traer",     "bst",        "H2021", "8",  "Verdier i et intervall (InRange)", 10, "exam-h2021-8"],
    t22chk:  ["traer",     "bst",        "H2022", "11", "Er treet et søketre? (CheckBST)", 10, "exam-h2022-10"],
    t23dia:  ["traer",     "diameter",   "H2023", "5",  "Diameteren til et binærtre", 12, "exam-h2023-5"],
    t24lca:  ["traer",     "lca",        "H2024", "6",  "Laveste felles forfeder", 12, "exam-h2024-6"],
    t20avl:  ["traer",     "avl",        "H2020", "6",  "AVL-innsetting", 9, "exam-h2020-6"],
    t22avl:  ["traer",     "avl",        "H2022", "4",  "Balanserte søketrær (AVL)", 6, "exam-h2022-3"],
    t25anti: ["traer",     "antiavl",    "H2025", "4",  "Anti-AVL", 12, "exam-h2025-3"],
    t21huf:  ["traer",     "huffman",    "H2021", "5",  "Huffman-trær", 5, "exam-h2021-5"],
    t22auto: ["traer",     "huffman",    "H2022", "9",  "Autofullføring: prefikstre mot hashmap", 6, "exam-h2022-8"],
    t24huf:  ["traer",     "huffman",    "H2024", "2",  "Huffman-trær", 10, "exam-h2024-2"],
    t25lvl:  ["traer",     "trav",       "H2025", "5",  "Level-order (binærtre)", 12, "exam-h2025-4"],
    x20lp:   ["hashing",   "probing",    "H2020", "4",  "Linear probing", 2, "exam-h2020-4"],
    x20sub:  ["hashing",   "triks",      "H2020", "7",  "Subanagram (a–c)", 17, "exam-h2020-7"],
    x21frek: ["hashing",   "triks",      "H2021", "9",  "Flest forekomster", 8, "exam-h2021-9"],
    x22lp:   ["hashing",   "probing",    "H2022", "7",  "Linear probing", 10, "exam-h2022-7"],
    x24py:   ["hashing",   "python",     "H2024", "5",  "Python 3.6-ordbøker", 10, "exam-h2024-5"],
    x25ch:   ["hashing",   "chaining",   "H2025", "2",  "Separate chaining", 10, "exam-h2025-2"],
    g20eg:   ["grafer",    "begreper",   "H2020", "3",  "Grafegenskaper", 8, "exam-h2020-3"],
    g20t2:   ["grafer",    "mst",        "H2020", "8",  "Fire typer grafer (Kruskal, Dijkstra for hånd)", 38, "exam-h2020-8"],
    g21dij:  ["grafer",    "dijkstra",   "H2021", "7",  "Korteste avstander", 8, "exam-h2021-7"],
    g21to:   ["grafer",    "dfs",        "H2021", "11", "To-fargelegge en graf", 10, "exam-h2021-11"],
    g21opp:  ["grafer",    "sammenheng", "H2021", "12", "Whops!-oppgjør", 10, "exam-h2021-12"],
    g21log:  ["grafer",    "topologisk", "H2021", "13", "Whops!-logger", 10, "exam-h2021-13"],
    g22eg:   ["grafer",    "begreper",   "H2022", "3",  "Grafegenskaper", 10, "exam-h2022-2"],
    g22kj:   ["grafer",    "begreper",   "H2022", "6",  "Kjøretid på grafalgoritmer", 8, "exam-h2022-5"],
    g22gc:   ["grafer",    "dfs",        "H2022", "8",  "Garbage collection", 8, "exam-h2022-7"],
    g22fs:   ["grafer",    "scc",        "H2022", "12", "Minimal forside", 10, "exam-h2022-11"],
    g23bl:   ["grafer",    "mst",        "H2023", "6",  "Blindern-problemet", 10, "exam-h2023-6"],
    g23dep:  ["grafer",    "sykler",     "H2023", "7",  "Dependency hell", 12, "exam-h2023-7"],
    g24jz:   ["grafer",    "bfs",        "H2024", "4",  "Jazz eller klassisk?", 10, "exam-h2024-4"],
    g24dnt:  ["grafer",    "scc",        "H2024", "8",  "Rundtur med DNT", 12, "exam-h2024-8"],
    g25syk:  ["grafer",    "sykler",     "H2025", "3",  "Sykler i grafer", 11, "exam-h2025-2"],
    g25kol:  ["grafer",    "mst",        "H2025", "7",  "Kollektivtilbudet i Oslo", 15, "exam-h2025-6"],
    l20tag:  ["lister",    "stakk",      "H2020", "9",  "Velformaterte tagger (stakk)", 12, "exam-h2020-9"],
    p20ver:  ["strategi",  "pnp",        "H2020", "8a", "Fire typer grafer: verifikator (NP)", 10, "exam-h2020-8"],
    p21pnp:  ["strategi",  "pnp",        "H2021", "6",  "Beregnbarhet og kompleksitet (P og NP)", 8, "exam-h2021-6"],
    p22tf:   ["strategi",  "kjoretid",   "H2022", "2",  "Litt av hvert (sant/usant)", 10, "exam-h2022-2"]
  };

  var LENGDER = [
    { id: "E", navn: "Ekspress", omtrent: "~3 t", tekst: "Stegene som gir mest poeng per time. Én oppgave per mønster." },
    { id: "S", navn: "Standard", omtrent: "~1 dag", tekst: "Alle mønstrene, 1–2 eksamensoppgaver hver, og generalprøven." },
    { id: "G", navn: "Grundig", omtrent: "~1 uke", tekst: "Alt i Standard, pluss resten av eksamenskortene og sjeldne temaer. Tøm repetisjonskøen." }
  ];

  /* Lenke: [side, fane, element-id eller null, tekst] */
  var ETAPPER = [
    /* ===================== 0 · SPILLEREGLER ===================== */
    { nr: 0, navn: "Spilleregler", hvor: "Før du begynner", steg: [
      { id: "0", tittel: "Slik er eksamen bygd opp, og slik rettes den", vekt: 0, min: "E", tid: 10,
        hvorfor: "Gir ingen poeng i seg selv, men reglene bestemmer hvordan du henter poeng i alt annet. Formatet har vært det samme siden 2021: oppvarming (2 p), en automatisk rettet del 1 og en del 2 med langsvar. Siden 2021 er det ingen hjelpemidler.",
        kjerne: t(
          "Eksamen er som et brettspill med faste regler. Først et lett spørsmål. Så mange små «sant eller usant», der det lønner seg å svare på alt. Til slutt større oppgaver der du forklarer, skriver pseudokode og sier hvor lang tid løsningen tar. Den som kan reglene, taper færre poeng på dumme ting.",
          "<p>Eksamen er 100 poeng: oppvarming (2 p), del 1 med sant/usant (32, 22 og 26 p i 2023–2025) og del 2 med 6–7 langsvarsoppgaver. I del 1 teller blankt og galt likt, så svar på alle. I del 2 gir lavere kjøretid flere poeng, og du kan bruke pensumalgoritmer uten å skrive dem selv (står i oppgavesettene fra 2023). Gjør rede for antagelsene dine.</p>",
          "<p>Del 1 (2023–2025): N påstander, n riktige, poeng = 2 · max(n − N/2, 0). Ren gjetting gir i snitt 0. Del 2: sensorveiledningene gir poeng i trinn etter kjøretid (optimal løsning full pott, ett trinn dårligere omtrent halvparten, kvadratisk eller verre 0–1 p). Feil eller manglende kjøretid koster typisk 1 p. Riktig idé uten pseudokode gir opptil halv pott, og presis tekst kan gi mer enn uklar pseudokode.</p>"),
        les: [["strategi", "eksamensteknikk", "tek-typer", "Strategi → Oppgavetypene"], ["strategi", "eksamensteknikk", "tek-bygg", "Pensum som byggeklosser"]],
        oppskrift: [
          "<b>Del 1:</b> svar på alle påstandene. Blankt teller som galt.",
          "<b>Del 2:</b> idé i én–to setninger, så pseudokode, så kjøretid med begrunnelse.",
          "<b>Byggeklosser:</b> kall gjerne pensumalgoritmer, men si hva kallet gir deg, og ta kostnaden med i kjøretiden.",
          "<b>Antagelser:</b> skriv dem ned («jeg antar at BinarySearch returnerer indeksen»).",
          "<b>Står du fast:</b> gå videre og kom tilbake. Alle oppgavene gir poeng."
        ],
        eksempel: [["strategi", "eksamensteknikk", "tek-trapp", "Kjøretidstrappen: hvor mye hvert kjøretidstrinn ga"]],
        oppgaver: [],
        sjekk: [{ type: "quiz", items: [
          { q: "Del 1 har N = 26 påstander. Du svarer riktig på 20 og lar 6 stå blanke. Hvor mange poeng får du?", options: ["20", "14", "7", "26"], answer: 1,
            explain: "2 · max(20 − 13, 0) = 14. De 6 blanke teller som gale." },
          { q: "Du er usikker på én påstand i del 1. Hva lønner seg?", options: ["La den stå blank, da mister du ingenting", "Svar: blankt og galt teller likt, så et svar kan bare hjelpe", "Svar alltid «sant»", "Hopp over hele del 1"], answer: 1,
            explain: "Blankt teller som galt. Et svar har alltid en sjanse for å være riktig." },
          { q: "Hva gir typisk full pott på en algoritmeoppgave i del 2?", options: ["En lang tekst", "Riktig og raskest mulig løsning, presist skrevet, med kjøretid", "Kode i et ekte programmeringsspråk", "Bare riktig svar på eksempelet"], answer: 1,
            explain: "Sensor ser etter riktighet, kjøretid og at løsningen er lett å forstå. Kjøretiden er ofte et eget poeng." },
          { q: "Du kaller Dijkstra(G, s) i stedet for å skrive den selv. Hva må du ha med?", options: ["Ingenting, kallet holder", "Hva kallet returnerer, og kostnaden O((|V| + |E|) · log(|V|)) i kjøretiden din", "Hele pseudokoden til Dijkstra likevel", "Et bevis for at Dijkstra er riktig"], answer: 1,
            explain: "Byggeklosser er lov fra 2023, men sensor må se hva du får tilbake og hva det koster." }
        ] }],
        feller: [
          "Å la påstander i del 1 stå blanke. De teller som gale.",
          "Å glemme kjøretiden. Det koster typisk 1 poeng per deloppgave.",
          "Å kalle en pensumalgoritme når oppgaven ber deg skrive nettopp den, for eksempel HeapInsert."
        ] }
    ] },

    /* ===================== 1 · OPPVARMING ===================== */
    { nr: 1, navn: "Oppvarming", hvor: "Første oppgave, 2 p", steg: [
      { id: "1", tittel: "Algoritme og datastruktur på fire setninger", vekt: 2, min: "E", tid: 5,
        hvorfor: "2 poeng, og de samme to spørsmålene alle seks år (2020–2025): hva er en algoritme, og hva er en datastruktur? Maks fire setninger hver. Alle rimelige svar gir full pott.",
        kjerne: t(
          "En algoritme er en oppskrift: en liste med klare steg som alltid blir ferdig og gir et svar. En datastruktur er måten du rydder kjøkkenskapet på, slik at du finner det du trenger raskt.",
          "<p>En <b>algoritme</b> er en presis, trinnvis fremgangsmåte som tar et input, stopper etter endelig mange steg og gir et output som løser et problem. En <b>datastruktur</b> er en måte å organisere data på, slik at operasjonene vi trenger (for eksempel oppslag eller å finne den minste) blir effektive.</p>",
          "<p>Algoritme: endelig, entydig beskrevet prosedyre fra input til output, der hvert steg er presist og kjøringen terminerer. Datastruktur: konkret organisering av data i minnet som støtter bestemte operasjoner med gitt kjøretid. En ADT sier <i>hvilke</i> operasjoner som finnes, datastrukturen sier <i>hvordan</i> de gjøres.</p>"),
        les: [["begreper", "algoritme", null, "Begreper → Algoritme"], ["begreper", "adt", null, "Begreper → ADT"]],
        oppskrift: [
          "<b>Algoritme:</b> (1) en presis, trinnvis fremgangsmåte, (2) fra input til output, (3) stopper etter endelig mange steg, (4) eksempel: binærsøk.",
          "<b>Datastruktur:</b> (1) en måte å organisere data på, (2) slik at bestemte operasjoner blir raske, (3) eksempel: en heap gir den minste raskt, (4) valget avhenger av hvilke operasjoner du trenger.",
          "Skriv kort og gå videre. Her er det ingenting å vinne på lange svar."
        ],
        eksempel: [["begreper", "algoritme", "ex-algoritme", "Eksempelet i Begreper"]],
        oppgaver: [],
        sjekk: [{ type: "tf", fra: [["begreper", ["algoritme", "datastruktur", "ADT"]]], maks: 6 }],
        feller: [
          "Mer enn fire setninger. Oppgaven sier maks fire.",
          "Å bruke lang tid her. Det er 2 poeng, og et kort, rimelig svar gir full pott."
        ] }
    ] },

    /* ===================== 2 · DEL 1 ===================== */
    { nr: 2, navn: "Del 1: sant/usant", hvor: "Rett etter oppvarmingen, 22–32 p", steg: [
      { id: "2a", tittel: "Big-O-drill: kjøretiden til pensumoperasjonene", vekt: 8, min: "E", tid: 15, tidG: 20,
        hvorfor: "Del 1 har vært 32, 22 og 26 poeng (2023–2025). Påstandene for de årene er ikke offentlige, men 2021–2022 viser at kjøretid for pensumoperasjoner går igjen, og kjøretid er i tillegg et eget poeng i nesten hver langsvarsoppgave.",
        kjerne: t(
          "Big-O sier hvor mye lengre tid noe tar når det blir mer å gjøre. Å lete i en sortert telefonkatalog ved å slå opp på midten går fort (log n). Å lese hver side går sakte (n). Lær deg tabellen under som en gangetabell.",
          "<p>Kunne disse utenat: binærsøk O(log n) · heap insert og removeMin O(log n), BuildHeap O(n) · søk i binært søketre O(h), som er O(log n) i et AVL-tre og O(n) i verste fall ellers · hashing forventet O(1), O(n) i verste tilfelle · Merge sort og Heapsort O(n log n) · Quicksort O(n²) i verste fall · Insertion sort O(n²), men O(n) på sortert input · Bucket sort O(N + n) · BFS, DFS og topologisk sortering O(|V| + |E|) · Dijkstra O((|V| + |E|) · log(|V|)) · Prim og Kruskal O(|E| · log(|V|)) · Bellman-Ford O(|V| · |E|).</p>",
          "<p>Regnereglene: behold det største leddet og dropp konstanter. Løkker etter hverandre adderes, løkker inni hverandre multipliseres. Les alltid hvilket tilfelle påstanden gjelder (verste, forventet, amortisert) og hvilken struktur (BST eller AVL). Tabellen i Strategi → Pensum som byggeklosser samler kjøretidene.</p>"),
        les: [["begreper", "bigo", null, "Begreper → Big-O"], ["strategi", "kjoretid", null, "Strategi → Kjøretidsanalyse"], ["strategi", "eksamensteknikk", "tek-bygg", "Kjøretidstabellen (byggeklosser)"]],
        oppskrift: [
          "Les påstanden ord for ord. Hvilket tilfelle: verste, forventet eller amortisert?",
          "Hvilken struktur? Søk er O(h) i et vanlig søketre, men O(log n) i et AVL-tre.",
          "Se etter lure ord: «alltid», «i verste tilfelle», «for alle input».",
          "Er du usikker, gjør et raskt moteksempel: sortert input for Quicksort, alle nøkler i samme bøtte for hashing."
        ],
        eksempel: [["strategi", "kjoretid", "drill", "Kjøretidsdrillen i Strategi"]],
        oppgaver: ["p22tf", "g22kj"],
        sjekk: [{ type: "tf", fra: [["begreper", ["kjøretid", "O-notasjon"]], ["strategi", ["kjøretid"]]], maks: 10 }],
        feller: [
          "«Søk i et binært søketre er O(log n)» er bare sant for balanserte trær. Generelt er det O(h), som kan være O(n).",
          "«Hashing er O(1)» uten forbehold. Skriv forventet O(1) og O(n) i verste tilfelle.",
          "Quicksort er O(n²) i verste tilfelle, selv om den ofte er rask."
        ] },

      { id: "2b", tittel: "Stabil og in-place", vekt: 4, min: "S", tid: 10, tidG: 15,
        hvorfor: "Påstander om hvilke sorteringsalgoritmer som er stabile eller in-place er en fast type i del 1, og stabilitet var egen oppgave i 2021. Det er også nøkkelen til bøttesorteringsoppgavene (2020, 2024).",
        kjerne: t(
          "Stabil betyr at like elementer står i samme innbyrdes rekkefølge etter sorteringen som før, som to like gamle barn som ikke bytter plass i køen. In-place betyr at du sorterer i selve arrayet uten å trenge en ekstra hylle.",
          "<p><b>Stabil:</b> like nøkler beholder rekkefølgen fra input. Stabile i kurset: Bubble, Insertion, Gnome, Merge, Bucket og Radix sort. Ustabile: Selection sort, Quicksort og Heapsort. <b>In-place:</b> sorterer i selve arrayet uten en ekstra datastruktur. In-place: Selection, Bubble, Insertion, Gnome, Quicksort og Heapsort. Ikke in-place: Merge, Bucket og Radix sort.</p>",
          "<p>Stabilitet er det som gjør det mulig å sortere på to nøkler: sorter først på den minst viktige, så stabilt på den viktigste. Radix sort virker bare fordi hver runde er en stabil bøttesortering. Bucket sort er stabil så lenge elementene legges bakerst i bøtta og bøttene tømmes i rekkefølge.</p>"),
        les: [["begreper", "stabil", null, "Begreper → Stabil/in-place"], ["sortering", "oversikt", null, "Sortering → Oversikt (tabellen)"]],
        oppskrift: [
          "Lær tabellen i Sortering → Oversikt: kjøretid, stabil og in-place for hver algoritme.",
          "Stabil: bytter algoritmen bare naboer, og bare ved strengt større? Da er den stabil.",
          "Lange hopp (Selection sort, Quicksort, Heapsort) kan flytte et element forbi et likt element. Da er den ustabil."
        ],
        eksempel: [["begreper", "stabil", "ex-stabil", "Stabil mot ustabil, side om side"]],
        oppgaver: ["s21stab"],
        ekstra: ["s21tf"],
        sjekk: [{ type: "tf", fra: [["begreper", ["stabil", "in-place"]], ["sortering", ["stabil", "in-place"]]], maks: 8 }],
        feller: [
          "Merge sort er stabil, men ikke in-place. Heapsort er in-place, men ikke stabil.",
          "Selection sort i array-versjonen er ikke stabil, selv om den bare gjør ett bytte per runde."
        ] },

      { id: "2c", tittel: "Fakta om heap, AVL og søketrær", vekt: 6, min: "S", tid: 15, tidG: 20,
        hvorfor: "Heap og trær var egne del 1-oppgaver i 2021 (heap 6 p, Huffman 5 p) og 2022 (AVL 6 p, heap 10 p), og er sentrale i del 1 også etterpå.",
        kjerne: t(
          "En heap er en pyramide der den minste alltid står øverst, men resten ikke er sortert. Et AVL-tre er et søketre som passer på at ingen gren blir mye lengre enn den andre, så det aldri blir en lang kjede.",
          "<p><b>Min-heap:</b> komplett binærtre der hver node er større enn eller lik forelderen, så den minste er i roten. Lagres i et array: barna til i er 2i + 1 og 2i + 2, forelderen er ⌊(i − 1)/2⌋. Høyden er ⌊log n⌋. Et sortert array er en gyldig min-heap. <b>AVL-tre:</b> binært søketre der høydene til venstre og høyre deltre er ulike med høyst 1 i hver node. Da er høyden O(log n), så søk, innsetting og fjerning er O(log n).</p>",
          "<p>Høyde måles i kanter: en løvnode har høyde 0, et tomt tre høyde −1. Balansefaktor = høyde(venstre) − høyde(høyre), og AVL krever at den er −1, 0 eller 1. Inorder i et binært søketre gir verdiene sortert. En heap er bare delvis ordnet: søsken kan stå i hvilken som helst rekkefølge.</p>"),
        les: [["heap", "hva", null, "Heap → Hva er en heap"], ["traer", "avl", null, "Trær → AVL"], ["traer", "begreper", null, "Trær → Begreper (høyde og dybde)"]],
        oppskrift: [
          "Tegn et lite eksempel. De fleste heap- og trepåstander avsløres med 3–5 noder.",
          "Sjekk indeksformlene med 0-indeksering: roten er A[0].",
          "Spør: gjelder påstanden for alle heaper og trær, eller bare for eksempelet?"
        ],
        eksempel: [["heap", "hva", "ex-stage", "Heap-utforskeren"]],
        oppgaver: ["h22tf", "t22avl"],
        ekstra: ["t20bst"],
        sjekk: [{ type: "tf", fra: [["heap", ["heap-egenskap", "indekser", "struktur"]], ["traer", ["AVL", "BST"]]], maks: 10 }],
        feller: [
          "En heap er ikke sortert. Bare forelder ≤ barn gjelder.",
          "Høyde i noder i stedet for kanter. I kurset har én enkelt node høyde 0.",
          "1-indekserte formler (2i og 2i + 1). Kurset bruker 0-indeksering: 2i + 1 og 2i + 2."
        ] },

      { id: "2d", tittel: "P og NP: begrepene du må kunne", vekt: 3, min: "S", tid: 10,
        hvorfor: "P og NP var egne oppgaver bare i 2020 (verifikator, 10 p) og 2021 (8 p i del 1). Temaet kan ha flyttet til sant/usant, men det vet vi ikke sikkert. Det er likevel tyngdepunktet i foreleserens egen kompleksitetsguide.",
        kjerne: t(
          "Noen gåter er lette å løse. Andre er vanskelige å løse, men lette å sjekke når noen viser deg et svar, som en Sudoku. NP er gåtene som er lette å sjekke. Ingen vet om alle slike gåter også er lette å løse.",
          "<p>Et <b>avgjørelsesproblem</b> har svar JA eller NEI. <b>P</b> er problemene som kan løses i polynomiell tid. <b>NP</b> er problemene der et JA-svar kan <b>verifiseres</b> i polynomiell tid med et <b>sertifikat</b>. P ⊆ NP, men om P = NP er ukjent. <b>NP-hardt:</b> minst like vanskelig som alle problemer i NP. <b>NP-komplett:</b> i NP og NP-hardt.</p>",
          "<p>En <b>reduksjon</b> oversetter instanser av ett problem til et annet i polynomiell tid, slik at JA blir JA og NEI blir NEI. For å vise at X er NP-hardt, reduserer du et kjent NP-hardt problem (for eksempel SAT) til X. Stoppeproblemet (HALT) er uavgjørbart: ingen algoritme løser det for alle input.</p>"),
        les: [["strategi", "pnp", null, "Strategi → P og NP"]],
        oppskrift: [
          "Lær definisjonene ordrett med egne ord: P, NP, sertifikat, reduksjon, NP-hardt, NP-komplett.",
          "Retningen på reduksjonen: fra det kjente vanskelige problemet til det nye.",
          "«NP» betyr ikke «ikke polynomiell». P er en del av NP."
        ],
        eksempel: [["strategi", "pnp", "ham-graf", "Verifikator for Hamiltonsykel, steg for steg"]],
        oppgaver: ["p21pnp"],
        sjekk: [{ type: "quiz", items: [
          { q: "Hva betyr det at et avgjørelsesproblem er i NP?", options: ["Det kan ikke løses i polynomiell tid", "Et JA-svar kan sjekkes i polynomiell tid med et sertifikat", "Det er NP-hardt", "Det er uavgjørbart"], answer: 1,
            explain: "NP handler om å verifisere, ikke om å løse. Alle problemer i P er også i NP." },
          { q: "Du vil vise at et nytt problem X er NP-hardt. Hva gjør du?", options: ["Reduserer X til SAT", "Reduserer et kjent NP-hardt problem, for eksempel SAT, til X", "Lager en verifikator for X", "Viser at X er i P"], answer: 1,
            explain: "Kan et kjent vanskelig problem oversettes til X, er X minst like vanskelig. En verifikator viser bare at X er i NP." },
          { q: "Hvilket utsagn er riktig?", options: ["P = NP er bevist", "P ⊆ NP, men om P = NP er ukjent", "NP er problemene som ikke kan løses raskt", "Alle problemer i NP er NP-komplette"], answer: 1,
            explain: "Alt som kan løses raskt, kan også sjekkes raskt. Om det motsatte gjelder, er et åpent problem." },
          { q: "Hva er et NP-komplett problem?", options: ["Et problem som er i NP og NP-hardt", "Et problem som er NP-hardt, men ikke i NP", "Et problem som løses i polynomiell tid", "Et uavgjørbart problem"], answer: 0,
            explain: "NP-komplett = i NP og NP-hardt. Hamiltonsykel er et eksempel." }
        ] }],
        feller: [
          "Å snu reduksjonen: X til SAT viser ingenting om hvor vanskelig X er.",
          "Å tro at NP betyr «ikke polynomiell»."
        ] },

      { id: "2e", tittel: "Full del 1-øving med ekte poengregel", vekt: 5, min: "E", tid: 15, tidG: 30,
        hvorfor: "Den beste treningen på del 1 er å ta en hel runde med blandede påstander og regne poengene slik sensor gjør. Øvingen i Strategi trekker påstander fra alle blokkene og retter med regelen 2 · max(n − N/2, 0).",
        kjerne: t(
          "Ta en prøve-runde akkurat som på eksamen: mange små påstander, svar på alle, og se hvor mange poeng du hadde fått.",
          "<p>Velg 22, 26 eller 32 påstander (som H2024, H2025 og H2023), svar på alle og lever. Øvingen viser poengene etter regelen fra sensorveiledningene. Gjør den flere ganger: hver runde trekker nye påstander.</p>",
          "<p>Med N påstander gir halvparten riktig 0 poeng, og hvert riktig svar over N/2 gir 2 poeng. Målet er derfor ikke å «klare halvparten», men å være sikker på flest mulig. Steget regnes som dekket når beste runde gir minst halvparten av poengene (minst 75 % riktige).</p>"),
        les: [["strategi", "eksamensteknikk", "del1-ovelse", "Strategi → Del 1-øving"]],
        oppskrift: [
          "Svar på alle. Blankt teller som galt.",
          "Les hver påstand to ganger. Mange er usanne på grunn av ett ord.",
          "Etter rettingen: les forklaringen på hver feil, og ta gjerne steg 2a–2d på nytt for temaet du bommet på."
        ],
        eksempel: [],
        oppgaver: [],
        ekstra: ["s21tf", "h22tf", "p22tf"],
        sjekk: [{ type: "ekstern", key: "del1:strategi:del1-ovelse", terskel: 0.5, lenke: ["strategi", "eksamensteknikk", "del1-ovelse"],
          tekst: "Ta Del 1-øvingen i Strategi. Steget fullføres automatisk når en runde gir minst halvparten av poengene." }],
        feller: [
          "Å stoppe på 50 % riktig: det gir 0 poeng med denne regelen.",
          "Å la vanskelige påstander stå blanke."
        ] }
    ] },

    /* ===================== 3 · STANDARDOPPGAVEN ===================== */
    { nr: 3, navn: "Standardoppgaven", hvor: "Del 2, første oppgave, 10 p", steg: [
      { id: "3a", tittel: "Oppskriften, med heap-innsetting som eksempel", vekt: 3, min: "E", tid: 20,
        hvorfor: "Første oppgave i del 2 har vært den samme typen fire år på rad (10 p): kjør en pensumoperasjon for hånd. 2022 Linear probing, 2023 innsetting i heap, 2024 Huffman, 2025 Separate chaining. Formen er lik hver gang, så oppskriften gir poeng uansett hvilken operasjon som kommer.",
        kjerne: t(
          "Tenk deg en rekke med barn der den minste skal stå først. Et nytt barn stiller seg bakerst og bytter plass med den foran (forelderen) så lenge den foran er større. Til slutt står alle riktig igjen.",
          "<p><b>HeapInsert:</b> legg x bakerst, på indeks n. Så lenge i > 0 og forelderen A[⌊(i − 1)/2⌋] er større enn A[i], bytter du dem og går til forelderen. Kjøretid O(log n), fordi x høyst kan boble opp gjennom høyden, og et komplett binærtre har høyde ⌊log n⌋.</p>",
          "<p>Innsettingen bevarer formen (komplett binærtre) ved å bruke første ledige plass, og reparerer heap-egenskapen langs én sti fra løvnoden mot roten. Antall bytter er høyst høyden ⌊log n⌋, med O(1) arbeid per bytte: O(log n) i verste tilfelle.</p>"),
        les: [["heap", "innsetting", null, "Heap → Innsetting"]],
        oppskrift: [
          "<b>(a) Sluttilstand, 2–3 p:</b> vis tilstanden etter hver innsetting, ikke bare til slutt. Da får du delpoeng selv om ett steg blir feil.",
          "<b>(b) Forklaring og pseudokode, 5–7 p:</b> forklar idéen i én–to setninger og skriv pseudokoden. Uten pseudokode får du omtrent 3.",
          "<b>(c) Kjøretid:</b> til slutt, med begrunnelse. For hashing: både forventet og verste tilfelle.",
          "Skriv hvilken regel du bruker (bobler opp mot forelder ⌊(i − 1)/2⌋, overskriver lik nøkkel, slår sammen de to minste)."
        ],
        eksempel: [["heap", "innsetting", "tracer-ins", "HeapInsert steg for steg"]],
        oppgaver: ["h23ins"],
        ekstra: ["h21bin"],
        mangler: "Eget øvingskort for RemoveMin og BuildHeap for hånd finnes ikke ennå. Bruk RemoveMin- og BuildHeap-fanene i Heap.",
        sjekk: [
          { type: "quiz", items: [
            { q: "Sett inn 6, 4, 9, 2 og 5 i en tom min-heap (i den rekkefølgen). Hvordan ser arrayet ut?", options: ["2, 4, 9, 6, 5", "2, 4, 5, 6, 9", "2, 6, 9, 4, 5", "4, 2, 9, 6, 5"], answer: 0,
              explain: "6 → [6]. 4 bobler forbi 6 → [4, 6]. 9 → [4, 6, 9]. 2 starter på indeks 3, bobler forbi 6 og så 4 → [2, 4, 9, 6]. 5 havner på indeks 4 under 4 og blir stående → [2, 4, 9, 6, 5]." },
            { q: "Hvorfor er HeapInsert O(log n)?", options: ["Fordi arrayet er sortert", "Fordi verdien høyst bobler opp gjennom høyden, og høyden er ⌊log n⌋", "Fordi vi bruker binærsøk", "Fordi vi bare sammenligner med roten"], answer: 1,
              explain: "Ett bytte per nivå, og et komplett binærtre med n noder har ⌊log n⌋ + 1 nivåer." }
          ] },
          { type: "parsons", algo: "heapInsert", tekst: "Sett linjene i HeapInsert i riktig rekkefølge." }
        ],
        feller: [
          "1-indekserte foreldreformler. Med 0-indeksering er forelderen ⌊(i − 1)/2⌋.",
          "Å bare vise sluttilstanden. Mellomtilstandene redder delpoeng.",
          "Å kalle Insert når oppgaven ber deg forklare og skrive selve innsettingen."
        ] },

      { id: "3b", tittel: "Linear probing for hånd", vekt: 2, min: "S", tid: 15, tidG: 10,
        hvorfor: "Standardoppgaven i 2022 (10 p) og en kort oppgave i 2020 (2 p).",
        kjerne: t(
          "Som en kinorad: du går til setet på billetten. Er det tatt, tar du neste ledige sete til høyre, og fra enden fortsetter du fra starten.",
          "<p>Hjemmeplassen er i = h(k, N), for eksempel k mod N. Er plassen opptatt av en annen nøkkel, prøver du i + 1, i + 2 og så videre, alltid mod N. Finnes nøkkelen fra før, overskriver du verdien. Oppslag stopper når det treffer en ledig plass. Forventet O(1), O(n) i verste tilfelle.</p>",
          "<p>Sletting er det subtile: setter du bare plassen til null, kan oppslag stoppe for tidlig. Kurset tetter hullet (flytter nøkler som har gått forbi hullet) eller merker plassen som slettet. Lav Load factor (n/N) holder segmentene korte.</p>"),
        les: [["hashing", "probing", null, "Hashing → Linear probing"]],
        oppskrift: [
          "Tegn tabellen med _ for tomme plasser og indeksene over.",
          "For hver nøkkel: regn ut hjemmeplassen, skriv probe-sekvensen, og husk rundturen fra siste til første plass.",
          "Pseudokode: while A[i] ≠ null: hvis samme nøkkel, overskriv og returner; ellers i ← (i + 1) mod N. Sett så inn.",
          "Kjøretid: forventet O(1), O(n) i verste tilfelle."
        ],
        eksempel: [["hashing", "probing", "demo-probing", "Linear probing steg for steg"]],
        oppgaver: ["x22lp"],
        ekstra: ["x20lp"],
        sjekk: [{ type: "tf", fra: [["hashing", ["Linear probing"]]], maks: 6 }],
        feller: [
          "Å glemme mod N og gå utenfor arrayet (trekk i 2022).",
          "Å ikke overskrive en nøkkel som finnes fra før.",
          "Å slette ved å skrive null, så andre nøkler blir borte."
        ] },

      { id: "3c", tittel: "Separate chaining for hånd", vekt: 2, min: "S", tid: 15,
        hvorfor: "Standardoppgaven i 2025 (10 p).",
        kjerne: t(
          "Hver knagg i garderoben har en pose. Får flere jakker samme knaggnummer, havner de i samme pose.",
          "<p>Hver plass A[i] er null eller en <b>bøtte</b> (en liste med nøkkel-verdi-par). Innsetting: i ← h(k, N). Er A[i] null, lag en ny bøtte med (k, v). Ellers let gjennom bøtta: finnes k, overskriv verdien, ellers legg paret bakerst. Forventet O(1), O(n) i verste tilfelle.</p>",
          "<p>Med en hashfunksjon som sprer godt, er forventet bøttelengde Load factor n/N. Holdes den under en fast grense med rehash, er operasjonene forventet O(1). Hasher alle nøklene til samme bøtte, blir det O(n).</p>"),
        les: [["hashing", "chaining", null, "Hashing → Separate chaining"]],
        oppskrift: [
          "Skriv svaret som i: (k, v), (k, v) for hver ikke-tom plass.",
          "Vis at bøtta lages første gang (A[i] = null gir en ny liste med (k, v)).",
          "Lik nøkkel: overskriv verdien, ikke legg inn et nytt par.",
          "Kjøretid: forventet O(1) og O(n) i verste tilfelle. 2025 ga ett poeng for hver."
        ],
        eksempel: [["hashing", "chaining", "demo-chaining", "Separate chaining steg for steg"]],
        oppgaver: ["x25ch"],
        sjekk: [{ type: "quiz", items: [
          { q: "N = 10 og h(k) = k mod 10. Du setter inn (13, a), (23, b), (7, c) og (13, d) med Separate chaining. Hva ligger i bøtte 3?", options: ["(13, d), (23, b)", "(13, a), (23, b), (13, d)", "(23, b), (13, d)", "(13, a), (23, b)"], answer: 0,
            explain: "13 og 23 havner i bøtte 3. Den siste innsettingen har en nøkkel som finnes, så verdien til 13 overskrives der den står." },
          { q: "Hva gjør innsettingen når A[i] er null?", options: ["Ingenting", "Lager en ny bøtte (liste) med paret", "Prøver plass i + 1", "Rehasher tabellen"], answer: 1,
            explain: "Bøtta lages først når den første nøkkelen hasher dit. Å prøve neste plass er Linear probing." },
          { q: "Hvilken kjøretid skal du oppgi for innsetting?", options: ["O(1)", "O(n)", "Forventet O(1), O(n) i verste tilfelle", "O(log n)"], answer: 2,
            explain: "Begge delene, med forbehold om at hashfunksjonen sprer godt." }
        ] }],
        feller: [
          "Duplikat i bøtta i stedet for å overskrive (trekk i 2025).",
          "Å glemme å lage bøtta når A[i] er null.",
          "Bare én kjøretid."
        ] },

      { id: "3d", tittel: "Huffman for hånd", vekt: 2, min: "S", tid: 15, tidG: 20,
        hvorfor: "Standardoppgaven i 2024 (10 p), og egen del 1-oppgave i 2021 (5 p).",
        kjerne: t(
          "Lag et tre av bokstavene, der de vanligste får korte koder. Ta alltid de to sjeldneste, bind dem sammen til en ny «bokstav», og fortsett til du har ett tre.",
          "<p>Legg hvert symbol som en løvnode med frekvensen sin i en prioritetskø (min-heap). Så lenge køen har mer enn ett tre: ta ut de to med lavest frekvens, lag en forelder med summen, og sett den inn igjen. Kodelengden til et symbol er dybden til løvnoden. Med n symboler er det O(n log n).</p>",
          "<p>Løvnodene inneholder symbolene (med frekvens), de indre nodene bare summen. Koden er prefiksfri fordi bare løvnoder har symboler. Ved like frekvenser kan flere trær være riktige: kodelengdene kan bli ulike, men den totale kodelengden blir den samme.</p>"),
        les: [["traer", "huffman", null, "Trær → Huffman"]],
        oppskrift: [
          "Skriv køen etter hver sammenslåing: hvilke to som tas ut, og hvilken sum som settes inn.",
          "Tegn det ferdige treet og les av kodelengdene som dybder.",
          "Byggealgoritmen: prioritetskø på frekvens, ta ut to, sett inn summen, til ett tre er igjen. O(n log n)."
        ],
        eksempel: [["traer", "huffman", "demo-huffman", "Huffman steg for steg"]],
        oppgaver: ["t24huf"],
        ekstra: ["t21huf", "t22auto"],
        sjekk: [{ type: "quiz", items: [
          { q: "Frekvenser: A = 5, B = 1, C = 1, D = 2. Hvilke kodelengder gir Huffman?", options: ["A: 1, D: 2, B: 3, C: 3", "A: 2, B: 2, C: 2, D: 2", "A: 1, B: 2, C: 3, D: 3", "A: 3, D: 2, B: 1, C: 1"], answer: 0,
            explain: "B + C = 2. Så D (2) + BC (2) = 4. Så 4 + A (5) = 9. A ligger på dybde 1, D på dybde 2, B og C på dybde 3." },
          { q: "Hvilken datastruktur gjør byggingen O(n log n)?", options: ["Et sortert array som sorteres på nytt etter hver sammenslåing", "En prioritetskø (min-heap) på frekvens", "Et hashmap", "En stakk"], answer: 1,
            explain: "Hver av de n − 1 sammenslåingene gjør to removeMin og én insert, hver O(log n)." },
          { q: "Hva ligger i løvnodene?", options: ["Summene", "Symbolene med frekvensene sine", "Kodene", "Ingenting"], answer: 1,
            explain: "Bare løvnodene har symboler. Det er derfor ingen kode er prefiks av en annen." }
        ] }],
        feller: [
          "Å slå sammen de to første i stedet for de to minste.",
          "Å glemme at summen skal inn i køen igjen og konkurrere med de andre."
        ] },

      { id: "3m", tittel: "Mock: operasjoner som ikke har kommet ennå", vekt: 1, min: "E", tid: 10, tidG: 40, spesial: "mock",
        hvorfor: "Standardoppgaven har rullert mellom operasjonene. Disse mock-oppgavene er laget av oss i samme form, for operasjoner som ennå ikke har vært standardoppgaven. De er sortert etter hvor sannsynlige vi tror de er. Ekspress tar de mest sannsynlige, Standard også de middels sannsynlige, og Grundig alle.",
        kjerne: t(
          "Øv på oppgaver som ligner eksamen, men som ikke har vært gitt ennå. Da er du klar hvis noe nytt dukker opp.",
          "<p>Samme oppskrift som i 3a: kjør for hånd, forklar med pseudokode, og oppgi kjøretiden. Mock-oppgavene er ikke ekte eksamensoppgaver, men følger mønsteret fra 2022–2025.</p>",
          "<p>Bruk oppskriften fra 3a på hver mock-oppgave, og egenvurder med knappene nederst i kortet. Steget regnes som dekket når minst halvparten av mock-kortene i valgt lengde er merket «Fikk det til».</p>"),
        les: [],
        oppskrift: [
          "Les hele oppgaven, løs den på papir, og åpne løsningen først etterpå.",
          "Merk kortet med «Fikk det til» eller «Må øve mer»."
        ],
        eksempel: [],
        oppgaver: [],
        feller: ["Å lese løsningen før du har prøvd selv."] }
    ] },

    /* ===================== 4 · TRÆR ===================== */
    { nr: 4, navn: "Trær", hvor: "Del 2, midten, 12–24 p", steg: [
      { id: "4a", tittel: "AVL-innsetting og rotasjoner", vekt: 4, min: "E", tid: 15, tidG: 20,
        hvorfor: "Balansering kom som AVL-innsetting i 2020 (9 p) og 2022 (6 p), og som den oppgitte varianten Anti-AVL i 2025 (12 p).",
        kjerne: t(
          "Et AVL-tre er et søketre som ikke liker å henge skjevt. Blir én side mer enn ett nivå høyere enn den andre, «vipper» vi en del av treet (en rotasjon), så det blir jevnt igjen. Rekkefølgen fra venstre til høyre er den samme etterpå.",
          "<p>Sett inn som i et vanlig søketre, og gå så tilbake opp mot roten. Er balansefaktoren (høyde venstre − høyde høyre) større enn 1 eller mindre enn −1 i en node: venstre-venstre gir høyrerotasjon, venstre-høyre gir venstrerotasjon på barnet og så høyrerotasjon. Høyre-siden er speilvendt. Høyden holdes O(log n), så alle operasjoner er O(log n).</p>",
          "<p>En rotasjon er O(1) og bevarer BST-egenskapen (inorder er uendret). AVL roterer bare ved ubalanse. Anti-AVL i 2025 roterte til høyre hver gang en node fikk venstrebarn, og endte derfor som en høyregående kjede med O(n) oppslag. Les alltid oppgitt pseudokode og kjør den nøyaktig.</p>"),
        les: [["traer", "avl", null, "Trær → AVL"], ["traer", "antiavl", null, "Trær → Anti-AVL"]],
        oppskrift: [
          "Tegn treet etter hver innsetting, med høyder eller balansefaktorer.",
          "Skriv hvilken rotasjon du gjør, og i hvilken node.",
          "Sjekk etter hver rotasjon at inorder fortsatt er sortert.",
          "For en oppgitt variant (Anti-AVL): følg pseudokoden linje for linje, ikke det du vet om AVL."
        ],
        eksempel: [["traer", "avl", "demo-avl", "AVL-innsetting steg for steg"], ["traer", "avl", "rot-tre", "Prøv rotasjonene"]],
        oppgaver: ["t20avl", "t25anti"],
        ekstra: ["t22avl"],
        sjekk: [{ type: "tf", fra: [["traer", ["AVL", "rotasjon"]]], maks: 9 }],
        feller: [
          "Enkel rotasjon der det trengs dobbel (sikksakk: venstre-høyre eller høyre-venstre).",
          "Å bare vise sluttreet. Vis treet etter hver innsetting.",
          "Å svare O(log n) for Anti-AVL. Den lager en kjede, så oppslag er O(n)."
        ] },

      { id: "4b", tittel: "Rekursiv trepseudokode: CheckBST, InRange, diameter, LCA", vekt: 7, min: "E", tid: 25, tidG: 40,
        hvorfor: "En rekursiv treoppgave har kommet hvert år siden 2021 (10–12 p): intervall i søketre (2021), CheckBST (2022), diameter (2023), laveste felles forfeder (2024), level-order (2025). Poengene trappes etter kjøretid.",
        kjerne: t(
          "En treoppgave løses som en kjede av beskjeder: hver node spør barna sine, får svar tilbake, og setter sammen sitt eget svar. Tomme plasser (null) svarer med en gang.",
          "<p>Mønsteret: <b>basistilfelle</b> for null, <b>rekursjon</b> på venstre og høyre barn, og så <b>kombiner</b> svarene. Hver node besøkes én gang: O(n). Følger du bare én sti fra roten (søk i BST, LCA i BST), er det O(h), som er O(log n) i et balansert tre og O(n) i verste fall.</p>",
          "<p>CheckBST: send med et tillatt intervall (min, max) nedover, eller sjekk at inorder er sortert, O(n). InRange: beskjær, gå bare til venstre hvis det kan finnes verdier ≥ a der, og til høyre bare hvis det kan finnes verdier ≤ b. Diameter: returner høyde og diameter samtidig, diameter = max(venstre diameter, høyre diameter, høyde venstre + høyde høyre + 2), med høyde −1 for null. LCA i BST: begge mindre enn v gir venstre, begge større gir høyre, ellers er v svaret.</p>"),
        les: [["traer", "bst", null, "Trær → BST"], ["traer", "diameter", null, "Trær → Diameter"], ["traer", "lca", null, "Trær → LCA"], ["begreper", "rekursjon", null, "Begreper → Rekursjon"]],
        oppskrift: [
          "Idé i én setning: «Jeg går gjennom treet i postorder og returnerer høyde og diameter samtidig.»",
          "Pseudokode med basistilfellet først (if v = null then return …).",
          "Kjøretid for både verste tilfelle og balansert tre: O(n) eller O(h).",
          "Kjøretidstrappen: diameter O(n) 8/8, men O(n²) med Height-kall i hver node maks 5. InOrder + filtrering i stedet for beskjæring maks 8/10. CheckBST O(n²) med FindMin/FindMax i hver node 4/6. LCA O(h) 5/5, men O(n) 3."
        ],
        eksempel: [["traer", "diameter", "demo-diameter", "Diameteren steg for steg"], ["traer", "bst", "pc-check", "CheckBST med intervall"]],
        oppgaver: ["t23dia", "t24lca", "t22chk"],
        ekstra: ["t21rng", "t20bst"],
        sjekk: [{ type: "quiz", items: [
          { q: "Diameter(v) kaller Height(v.left) og Height(v.right) i hver node. Hva blir kjøretiden?", options: ["O(n)", "O(log n)", "O(n²) i verste tilfelle", "O(h)"], answer: 2,
            explain: "Height er O(n) og kalles i hver node. For en kjede gir det O(n²). Returner høyden og diameteren samtidig for O(n)." },
          { q: "LCA(x, y) i et binært søketre med x < y, og du står i v. Både x og y er mindre enn v.element. Hva gjør du?", options: ["Returnerer v", "Går til venstre barn", "Går til høyre barn", "Går til forelderen"], answer: 1,
            explain: "Begge ligger i venstre deltre, så den laveste felles forfaren ligger der også." },
          { q: "Hvorfor holder det ikke å sjekke v.left.element < v.element < v.right.element i hver node?", options: ["Det gjør det", "En node dypt nede kan bryte med en forfar lenger opp", "Fordi treet kan være tomt", "Fordi det blir O(n²)"], answer: 1,
            explain: "Hele venstre deltre må være mindre enn v. Send med et intervall nedover, eller sjekk at inorder er sortert." },
          { q: "Hva er kjøretiden for et søk langs én sti fra roten i et søketre med høyde h?", options: ["O(n) alltid", "O(h): O(log n) balansert, O(n) i verste fall", "O(1)", "O(n log n)"], answer: 1,
            explain: "Oppgi begge, slik sensor ber om." }
        ] }],
        feller: [
          "Height-kall i hver node for diameter: O(n²), maks 5 av 8 (2023).",
          "InOrder pluss filtrering i stedet for å beskjære: maks 8 av 10 (2021).",
          "Å bare oppgi O(log n). Si O(h), som er O(n) i verste fall og O(log n) balansert.",
          "Å glemme null-tilfellet (høyde −1 for et tomt tre)."
        ] },

      { id: "4c", tittel: "Traverseringer: preorder, inorder, postorder og level-order", vekt: 2, min: "S", tid: 15, tidG: 15,
        hvorfor: "Level-order var egen oppgave i 2025 (12 p, både heap-array og søketre), og traverseringene er verktøyet i alle rekursive treoppgaver.",
        kjerne: t(
          "Det finnes fire måter å gå gjennom et tre på: hils på noden før barna, mellom barna, etter barna, eller gå nivå for nivå ovenfra som når du leser en side.",
          "<p><b>Preorder:</b> noden før barna. <b>Inorder:</b> venstre, noden, høyre, som gir sortert rekkefølge i et søketre. <b>Postorder:</b> barna før noden, nyttig når noden trenger svar fra barna (høyde). <b>Level-order:</b> nivå for nivå med en kø, som BFS. Alle er O(n).</p>",
          "<p>Rekursivt bruker preorder, inorder og postorder kallstakken. Iterativt bytter du den mot en eksplisitt stakk. Level-order bruker en kø. For en heap er arrayet selv level-order (indeks 0 til n − 1).</p>"),
        les: [["traer", "trav", null, "Trær → Traversering"], ["traer", "iterativ", "trav-iterativ", "Trær → Iterativ traversering (med stakk)"]],
        oppskrift: [
          "Si hvilken traversering du bruker og hvorfor (inorder for sortert, postorder for høyde, level-order for nivåer).",
          "Level-order: kø, legg roten inn, ta ut, legg inn barna.",
          "Iterativ inorder: en eksplisitt stakk gjør jobben til kallstakken. Gå til venstre og push, pop og besøk, gå til høyre.",
          "Kjøretid: hver node én gang, O(n)."
        ],
        eksempel: [["traer", "trav", "demo-level", "Level-order steg for steg"], ["traer", "iterativ", "iter-kallstakk", "Kallstakken bak rekursjonen"], ["traer", "iterativ", "iter-demo", "Iterativ traversering steg for steg"]],
        oppgaver: ["t25lvl"],
        ekstra: ["h25lvl"],
        sjekk: [
          { type: "quiz", items: [
          { q: "Hvilken traversering gir verdiene i sortert rekkefølge i et binært søketre?", options: ["Preorder", "Inorder", "Postorder", "Level-order"], answer: 1,
            explain: "Venstre deltre (mindre), noden, høyre deltre (større)." },
          { q: "Hvilken datastruktur bruker level-order?", options: ["Stakk", "Kø", "Heap", "Hashmap"], answer: 1,
            explain: "Først inn, først ut gir nivå for nivå, akkurat som BFS." },
          { q: "Hva er level-order for en heap lagret i et array A?", options: ["A sortert", "A selv, fra indeks 0 til n − 1", "Inorder av heapen", "Det må regnes ut med BFS"], answer: 1,
            explain: "Arrayet er lagret nivå for nivå. Svaret er O(n) (H2025)." },
          { q: "Når passer postorder best?", options: ["Når noden trenger svar fra barna først, for eksempel høyde", "Når du vil ha sortert rekkefølge", "Når du vil gå nivå for nivå", "Aldri"], answer: 0,
            explain: "Høyde og diameter regnes ut etter at begge barna har svart." }
          ] },
          { type: "ekstern", key: "quiz:traer:quiz-iter", terskel: 0.7, lenke: ["traer", "iterativ", "iter-ov"],
            tekst: "Ekstra: ta quizen om iterativ traversering i Trær. Den teller også som sjekk for steget." },
          { type: "ekstern", key: "parsons:traer:parsons-iinorder", terskel: 1, lenke: ["traer", "iterativ", "iter-ov"],
            tekst: "Ekstra: pusle sammen iterativ inorder i Trær. Riktig rekkefølge teller også som sjekk." }
        ],
        feller: [
          "Å bruke stakk i level-order (det gir dybde-først).",
          "Å kjøre BFS på et heap-array, når arrayet allerede er svaret."
        ] }
    ] },

    /* ===================== 5 · HEAP SOM BYGGEKLOSS ===================== */
    { nr: 5, navn: "Heap som byggekloss", hvor: "Del 2, midten, ~10 p", steg: [
      { id: "5a", tittel: "Mediankø med to heaper", vekt: 4, min: "S", tid: 20,
        hvorfor: "Egen oppgave i 2024 (12 p). Mønsteret «bygg en ny ADT oppå heaper» går igjen.",
        kjerne: t(
          "Del tallene i to bunker: de små og de store. De små holder den største på toppen, de store holder den minste på toppen. Medianen står da alltid på toppen av en av dem.",
          "<p>Bruk en <b>max-heap</b> for nedre halvdel og en <b>min-heap</b> for øvre halvdel. Hold størrelsene like, eller la nedre ha én mer. Da er medianen (den minste av de to midterste ved partall) toppen av max-heapen. insert og removeMedian er O(log n).</p>",
          "<p>insert: legg x i riktig heap ut fra toppen av max-heapen, og flytt toppen over hvis størrelsene blir skjeve. removeMedian: ta ut toppen av max-heapen og rebalanser. Hver operasjon er et konstant antall heap-operasjoner à O(log n).</p>"),
        les: [["heap", "median", null, "Heap → Mediankø"]],
        oppskrift: [
          "Representasjon: to heaper og regelen for størrelsene. Si det i én setning.",
          "Pseudokode for insert og removeMedian, med rebalansering.",
          "Kjøretid O(log n) for begge.",
          "To heaper gir full pott (6 p). Å lete etter medianen ved behov gir maks 2."
        ],
        eksempel: [["heap", "median", "tracer-med", "Mediankøen steg for steg"]],
        oppgaver: ["h24med"],
        sjekk: [{ type: "quiz", items: [
          { q: "Nedre halvdel er en max-heap som har like mange eller ett element mer enn øvre. Hvor er medianen (den minste av de to midterste ved partall)?", options: ["Toppen av min-heapen", "Toppen av max-heapen", "Bakerst i max-heapen", "Må letes etter"], answer: 1,
            explain: "Den største av de små er den midterste, eller den minste av de to midterste." },
          { q: "Du setter inn 5, 9, 1 og 7. Hva returnerer removeMedian?", options: ["5", "7", "6", "1"], answer: 0,
            explain: "Sortert: 1, 5, 7, 9. De to midterste er 5 og 7, og den minste av dem er 5." },
          { q: "Hva er kjøretiden for insert i mediankøen?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 1,
            explain: "Høyst noen få heap-operasjoner, hver O(log n)." }
        ] }],
        feller: [
          "Å lete etter medianen ved hvert kall: maks 2 av 6.",
          "Å glemme å rebalansere etter removeMedian."
        ] },

      { id: "5b", tittel: "Bøttekø og andre køer oppå en heap", vekt: 3, min: "S", tid: 15, tidG: 15,
        hvorfor: "Bøttekø var egen oppgave i 2022 (10 p). Prioritetskøen er også motoren i Dijkstra, Prim, Huffman og k minste.",
        kjerne: t(
          "Har du bare noen få faste prioriteter, trenger du ingen pyramide. Lag én kø per prioritet, som skuffer nummerert 0, 1, 2 … og hent fra den første skuffen som ikke er tom.",
          "<p><b>Bøttekø:</b> prioritetene er heltall 0 … N − 1. Bruk et array med N køer (bøtter). insert legger elementet bakerst i bøtte[prioritet] i O(1). removeMin går til første ikke-tomme bøtte i O(N), som er O(1) når N er en konstant. En binær heap gir O(log n) på begge.</p>",
          "<p>Poenget med bøttekøen er at prioritetene ligger i et fast, lite område, så de kan brukes direkte som indeks, som i Bucket sort. Når prioritetene er vilkårlige, er den binære heapen standardvalget: insert og removeMin O(log n), BuildHeap O(n).</p>"),
        les: [["heap", "pk", null, "Heap → Prioritetskø"], ["heap", "buildheap", null, "Heap → BuildHeap"]],
        oppskrift: [
          "Begrunn valget av datastruktur: hvorfor bøtter, og hva N er.",
          "Skriv insert og removeMin hver for seg, med kjøretid.",
          "Bruker du en heap, si hvilken (min eller max) og hvorfor."
        ],
        eksempel: [["heap", "pk", "tracer-pg", "Prioritetskø-lekeplassen"]],
        oppgaver: ["h22bq"],
        ekstra: ["h21bin"],
        sjekk: [{ type: "tf", fra: [["heap", ["prioritetskø", "removeMin", "kjøretid"]]], maks: 8 }],
        feller: [
          "Binær heap der bøttene er poenget: maks 4 av 10 (2022).",
          "Å glemme at removeMin i bøttekøen må lete fram til første ikke-tomme bøtte."
        ] }
    ] },

    /* ===================== 6 · ARRAY-TRAPPA ===================== */
    { nr: 6, navn: "Array-trappa", hvor: "Del 2, midten, 10–12 p", steg: [
      { id: "6a", tittel: "Finn duplikat og «sorter én gang»", vekt: 5, min: "E", tid: 15, tidG: 15,
        hvorfor: "Arrayoppgaver med kjøretidstrapp har kommet 5 av 6 år: Intersection (2020), par med sum (2021), finn duplikat (2023), søk i etymologi (2024), k minste (2025). Poengene følger trinnene i trappa.",
        kjerne: t(
          "Har du en huskeliste du kan sjekke på et blunk (et hashset), trenger du bare gå gjennom arrayet én gang. Uten den må du sortere først, eller sammenligne alle med alle, og det tar lengre tid.",
          "<p><b>Usortert:</b> hashset, «har jeg sett denne før?», forventet O(n). Sorter og sammenlign naboer: O(n log n). Alle par: O(n²). <b>Sortert:</b> naboskann O(n), binærsøk O(log n). <b>Mange søk:</b> sorter én gang (O(n log n)) og binærsøk hvert søk (O(log n)).</p>",
          "<p>Finn duplikat (2023), usortert (c): forventet O(n) med hashset 5/5, O(n log n) med sortering 4/5, O(n²) 1. Sortert (a): binærsøk og sjekk naboene, O(log n). Bruker du BinarySearch og trenger indeksen, si at du antar at den returnerer indeksen.</p>"),
        les: [["sok", "duplikat", null, "Søk → Finn duplikat"], ["sok", "sortersok", null, "Søk → Sorter én gang"], ["sok", "binaersok", null, "Søk → Binærsøk"]],
        oppskrift: [
          "Les nøye: er arrayet sortert? Er tallene unike? Skal du returnere indeks eller verdi?",
          "Velg det laveste trinnet i trappa du får til: hashset, binærsøk eller én gjennomgang.",
          "Si fra hvis binærsøket må modifiseres eller returnerer indeks.",
          "Kjøretid til slutt, og forventet for hashing."
        ],
        eksempel: [["sok", "duplikat", "tracer-dupc", "Finn duplikat med hashset, steg for steg"]],
        oppgaver: ["k23dup", "k20int"],
        sjekk: [{ type: "tf", fra: [["sok", ["finn duplikat", "sortere først?"]]], maks: 10 }],
        feller: [
          "Sortering der hashing gir lineær tid: 4 av 5 (2023).",
          "Å ikke si at binærsøket må modifiseres: opptil 1 p trekk (2023).",
          "Manglende kjøretid: −1."
        ] },

      { id: "6b", tittel: "k minste og par med sum", vekt: 4, min: "E", tid: 15, tidG: 15,
        hvorfor: "Finn k minste (2025, 12 p) spurte etter samme problem i tre kjøretidsklasser. Par med sum x (2021, 10 p) er hashset-mønsteret.",
        kjerne: t(
          "Skal du finne de k minste, kan du ha en liten kurv med plass til k. Er et nytt tall mindre enn det største i kurven, bytter du. Da trenger du aldri sortere alt.",
          "<p><b>k minste:</b> (a) k runder «finn og fjern minste», O(k · n). (b) Merge sort og ta de k første, O(n log n). (c) Max-heap med plass til k, O(n log k), eller BuildMinHeap og k removeMin, O(n + k log n). <b>Par med sum x:</b> gå gjennom og sjekk om x − y er sett før (hashset): forventet O(n). Sortert array: to pekere fra hver ende, O(n).</p>",
          "<p>Quicksort er O(n²) i verste tilfelle, og ga maks 3 av 4 der O(n log n) var kravet (2025). En riktig løsning på (c) gir full uttelling også på (a) og (b) hvis du skriver at den gjelder.</p>"),
        les: [["sok", "kminste", null, "Søk → Finn k minste"], ["sok", "triks", null, "Søk → Array-triks"]],
        oppskrift: [
          "Skriv hvilken kjøretid hver løsning har, og hvorfor den er den raskeste du har.",
          "Bruk Merge sort eller Heapsort når du trenger garantert O(n log n).",
          "Heap-løsningen: si om det er en max- eller min-heap, og hvor stor den er."
        ],
        eksempel: [["sok", "kminste", "tracer-kmina", "k minste steg for steg"], ["sok", "triks", "tracer-tosum", "Par med sum, steg for steg"]],
        oppgaver: ["k25kmin", "k21par"],
        sjekk: [{ type: "tf", fra: [["sok", ["k minste", "to pekere", "binærsøk"]]], maks: 8 }],
        feller: [
          "Quicksort der O(n log n) kreves: maks 3 av 4 (2025).",
          "Hashset uten å si forventet O(n) og O(n²) i verste tilfelle."
        ] }
    ] },

    /* ===================== 7 · HASHING SOM VERKTØY ===================== */
    { nr: 7, navn: "Hashing som verktøy", hvor: "Del 2, midten, ~5 p", steg: [
      { id: "7a", tittel: "Frekvenstelling og subanagram", vekt: 2, min: "S", tid: 15, tidG: 20,
        hvorfor: "Flest forekomster (2021, 8 p) og Subanagram (2020, 17 p for a–c) bygger på hashmap som teller.",
        kjerne: t(
          "Et hashmap kan være en telleliste: hver gang du ser et tall, setter du en ny strek ved det. Til slutt ser du hvem som har flest streker.",
          "<p>Hashmap element ↦ antall, med 0 som startverdi. Én gjennomgang gir forventet O(n). En <b>frekvenstabell</b> for en streng teller bokstavene. W kan skrives med bokstavene i S når W ikke trenger flere av noen bokstav enn S har.</p>",
          "<p>Hashmap-operasjonene er forventet O(1), så n operasjoner er forventet O(n), men O(n²) i verste tilfelle. Er verdiene små heltall 0 … k, gir et vanlig telle-array garantert O(n + k).</p>"),
        les: [["hashing", "triks", null, "Hashing → Hashing som verktøy"]],
        oppskrift: [
          "Definer variablene (n, k, lengden på ordene) før du bruker dem i O-uttrykk.",
          "Drøfting: si når hver strategi lønner seg, ikke bare hvilken som er raskest."
        ],
        eksempel: [["hashing", "triks", "demo-mostfreq", "Telling med hashmap, steg for steg"]],
        oppgaver: ["x21frek", "x20sub"],
        sjekk: [{ type: "quiz", items: [
          { q: "Hvilket element forekommer flest ganger i et usortert array? Hva er beste forventede kjøretid?", options: ["O(n²)", "O(n log n)", "O(n) med et hashmap som teller", "O(log n)"], answer: 2,
            explain: "Én gjennomgang med forventet O(1) per oppslag." },
          { q: "Når er et telle-array bedre enn et hashmap?", options: ["Aldri", "Når verdiene er små heltall 0 … k, fordi det gir garantert O(n + k)", "Når verdiene er strenger", "Når n er liten"], answer: 1,
            explain: "Ingen hashing, ingen kollisjoner, og garantert tid." },
          { q: "Hva er en frekvenstabell for en streng?", options: ["En sortert liste med bokstavene", "Et hashmap fra bokstav til antall forekomster", "Hashverdien til strengen", "Lengden på strengen"], answer: 1,
            explain: "Med to frekvenstabeller kan du sammenligne bokstavene i to ord i lineær tid." }
        ] }],
        feller: [
          "Bare «O(n)» for en hashmap-løsning. Skriv forventet.",
          "Udefinerte variabler i drøftingen."
        ] },

      { id: "7b", tittel: "Rehash, amortisering og Python-ordbøker", vekt: 1, min: "S", tid: 10, tidG: 15,
        hvorfor: "Python 3.6-ordbøker (2024, 10 p) handlet om oppslag, rehash og fordelene med ny struktur. Rehash og amortisert tid er også del 1-stoff.",
        kjerne: t(
          "Blir garderoben for full, flytter du til en dobbelt så stor og henger opp alle jakkene på nytt. Det tar tid, men skjer så sjelden at det i snitt nesten ikke merkes.",
          "<p><b>Load factor</b> er n/N. Kurset rehasher når n/N når 0,75: lag et array med dobbel størrelse og sett inn alle parene på nytt med ny N, O(n). Fordi N dobles, blir innsetting <b>amortisert</b> O(1) (forventet). Python fra 3.6: et tett <b>entries</b>-array i innsettingsrekkefølge og et glissent <b>indices</b>-array med indekser inn i entries.</p>",
          "<p>Doblingen gjør at rehashene skjer ved n ≈ 0,75 · 1, 2, 4, 8 …, og summen av arbeidet er en geometrisk rekke, O(n) totalt. I Python 3.6-strukturen er det bare indices som må bygges på nytt ved rehash. Entries beholdes.</p>"),
        les: [["hashing", "kjoretid", null, "Hashing → Rehash og kjøretid"], ["hashing", "python", null, "Hashing → Python-ordbøker"]],
        oppskrift: [
          "Rehash: hva (nytt større array, alt settes inn på nytt), når (Load factor for høy), hvorfor (korte bøtter og prober).",
          "Python 3.6: probing i indices, sammenligning av nøkkel i entries, ny innsetting bakerst i entries.",
          "Fordeler: innsettingsrekkefølge, rask iterasjon, billigere rehash, mindre minne."
        ],
        eksempel: [["hashing", "kjoretid", "demo-rehash", "Rehash steg for steg"]],
        oppgaver: ["x24py"],
        sjekk: [{ type: "tf", fra: [["hashing", ["rehash", "Load factor"]]], maks: 6 }],
        feller: [
          "«Garantert O(1)». Det er forventet amortisert O(1).",
          "Å glemme at alle nøklene får nye plasser ved rehash, fordi h(k, N) avhenger av N."
        ] }
    ] },

    /* ===================== 8 · SORTERING ===================== */
    { nr: 8, navn: "Sortering", hvor: "Del 2, midten, 6–13 p", steg: [
      { id: "8a", tittel: "Stabil bøttesortering uten sorteringskall", vekt: 3, min: "S", tid: 20, tidG: 10,
        hvorfor: "Etymologisk ordliste (2024, 6 av 10 p) og SortSubanagrams (2020, 6 p): sorter på få kjente nøkler, stabilt, uten å kalle en ferdig sorteringsalgoritme.",
        kjerne: t(
          "Har du bare noen få kategorier, lager du én kurv per kategori. Gå gjennom tingene i rekkefølge og legg hver i sin kurv. Tøm kurvene etter hverandre. Ting i samme kurv står i samme rekkefølge som før.",
          "<p><b>Bucket sort:</b> nøklene er 0 … N − 1. Lag N tomme lister, gå gjennom A i rekkefølge og legg hvert element <b>bakerst</b> i bøtte[nøkkel], og tøm bøttene i rekkefølge. Stabil og O(N + n).</p>",
          "<p>Stabil fordi rekkefølgen fra A bevares innen hver bøtte. Skal du sortere på to nøkler: sorter først på den minst viktige, så stabilt på den viktigste. Sensormønsteret: stabil og lineær 6/6, stabil O(n log n) maks 4, ustabil −1, O(n²) maks 2.</p>"),
        les: [["sortering", "bucket", null, "Sortering → Bucket sort"], ["sortering", "radix", null, "Sortering → Radix sort"]],
        oppskrift: [
          "Les om sorteringskall er forbudt. Er det det, er Bucket sort poenget.",
          "Si hvorfor løsningen er stabil (bakerst i bøtta, bøttene i rekkefølge).",
          "Kjøretid O(N + n), med N og n definert."
        ],
        eksempel: [["sortering", "bucket", "tracer-bucket", "Bucket sort steg for steg"]],
        oppgaver: ["s24ety"],
        ekstra: ["s20sub"],
        sjekk: [{ type: "tf", fra: [["sortering", ["bøttesortering", "stabil", "Radix sort"]]], maks: 9 }],
        feller: [
          "Sorteringskall der Bucket sort er poenget: maks 4 av 6, eller ikke lov (2020, 2024).",
          "Å legge elementene først i bøtta. Det gjør sorteringen ustabil."
        ] },

      { id: "8b", tittel: "Stabilitet og å drøfte en ukjent algoritme", vekt: 2, min: "S", tid: 15, tidG: 15,
        hvorfor: "Gnome sort (2023, 10 p): en ukjent algoritme skulle drøftes mot pensum. Stabilitet (2021, 3 p): tolk et resultat.",
        kjerne: t(
          "Gnome sort er en nisse som går bortover en rad med blomsterpotter. Står to feil, bytter han dem og går ett steg tilbake. Står de riktig, går han videre. Det er nesten det samme som Insertion sort.",
          "<p>Drøft en ukjent algoritme i fire deler: hvordan den virker, kjøretid (verste, beste) med begrunnelse, hvilken pensumalgoritme den ligner, og om den er stabil og in-place. Gnome sort: O(n²) i verste tilfelle, O(n) på sortert input, stabil (bytter bare ved strengt større) og in-place, i slekt med Insertion sort.</p>",
          "<p>2023 ga 3 p for forklaringen, 2 for kjøretid, 2 for plasseringen blant pensumalgoritmene og 2 for stabil og in-place. Full pott krevde at man så slektskapet med Insertion sort. Stabilitet avgjøres av om like elementer kan bytte innbyrdes rekkefølge.</p>"),
        les: [["sortering", "gnome", null, "Sortering → Gnome sort"], ["sortering", "insertion", null, "Sortering → Insertion sort"]],
        oppskrift: [
          "Kjør algoritmen på et lite eksempel først, for eksempel [3, 1, 2].",
          "Strukturer svaret: virkemåte, kjøretid, slektskap, stabil og in-place.",
          "Begrunn kjøretiden med verste og beste input."
        ],
        eksempel: [["sortering", "gnome", "tracer-gnome", "Gnome sort steg for steg"]],
        oppgaver: ["s23gno", "s21stab"],
        ekstra: ["s21tf"],
        sjekk: [{ type: "tf", fra: [["sortering", ["Gnome sort", "Insertion sort", "Selection sort", "Quicksort", "Heapsort", "in-place"]]], maks: 9 }],
        feller: [
          "Å bare beskrive koden uten å sammenligne med pensum.",
          "Å glemme beste tilfelle (O(n) på sortert input)."
        ] }
    ] },

    /* ===================== 9 · GRAFHISTORIEN ===================== */
    { nr: 9, navn: "Grafhistorien", hvor: "Del 2, alltid sist og størst, 22–26 p", steg: [
      { id: "9a", tittel: "Fra historie til graf", vekt: 3, min: "E", tid: 10, tidG: 15,
        hvorfor: "Grafer har kommet alle seks år, og siste oppgave er alltid en grafhistorie (tunneler, venner, turstier, kollektivtrafikk). Første deloppgave er nesten alltid modellen: 1–2 p.",
        kjerne: t(
          "Gjør historien om til prikker og streker. Prikkene (nodene) er tingene, for eksempel bygninger eller personer. Strekene (kantene) er forbindelsene. Spør: går strekene begge veier? Har de en pris?",
          "<p>Si hva <b>nodene</b> og <b>kantene</b> er, om grafen er <b>rettet</b> (går forbindelsen bare én vei?) og <b>vektet</b> (har kantene kostnad, tid, avstand?). Si også om den er sammenhengende eller asyklisk hvis historien sier det.</p>",
          "<p>G = (V, E). Urettet kant {u, v}, rettet kant (u, v), vekt w(u, v). Størrelsen uttrykkes med |V| og |E|, ikke n og m. Er grafen et tre, er stien mellom to noder unik.</p>"),
        les: [["grafer", "begreper", "historie", "Grafer → Fra historie til graf"]],
        oppskrift: [
          "Én setning hver: noder, kanter, rettet eller urettet, vektet eller uvektet.",
          "Begrunn kort med historien: «vennskap er gjensidig, så grafen er urettet».",
          "Bruk |V| og |E| i alle kjøretider videre."
        ],
        eksempel: [["grafer", "begreper", "historie", "Historie-eksemplene i Grafer"]],
        oppgaver: ["g23bl", "g24jz"],
        ekstra: ["g20eg", "g22eg"],
        sjekk: [{ type: "quiz", items: [
          { q: "Vennskap på et nettverk der vennskap alltid er gjensidig. Hvilken graf?", options: ["Rettet og vektet", "Urettet og uvektet", "Rettet og uvektet", "Urettet og vektet"], answer: 1,
            explain: "Gjensidig gir urettet. Ingen kostnad nevnt gir uvektet." },
          { q: "Mulige tunneler mellom bygninger, hver med en byggekostnad. Hvilken graf?", options: ["Urettet og vektet", "Rettet og uvektet", "Rettet og vektet", "Et tre"], answer: 0,
            explain: "En tunnel kan brukes begge veier, og kostnaden er vekten (Blindern 2023)." },
          { q: "Programpakker der u → v betyr at u bruker v. Hvilken graf?", options: ["Urettet", "Rettet", "Vektet", "Komplett"], answer: 1,
            explain: "«Bruker» går én vei. En sykel betyr at avhengighetene ikke kan ordnes (Dependency hell 2023)." },
          { q: "Hva bør modellsvaret alltid inneholde?", options: ["Bare en tegning", "Hva nodene og kantene er, og om grafen er rettet og vektet", "Pseudokoden", "Kjøretiden"], answer: 1,
            explain: "Det er det sensor gir modellpoengene for." }
        ] }],
        feller: [
          "Å hoppe over modellen og gå rett på algoritmen. Modellen gir egne poeng.",
          "n og m i stedet for |V| og |E|."
        ] },

      { id: "9b", tittel: "Velg riktig algoritme", vekt: 4, min: "E", tid: 10, tidG: 15,
        hvorfor: "Hver grafoppgave spør i praksis: hvilken pensumalgoritme løser dette, og hvor rask er den? Riktig valg med kjøretid O(|V| + |E|) gir full pott der det er mulig. Feil valg gir lite selv med perfekt pseudokode.",
        kjerne: t(
          "Det er som å velge riktig verktøy fra verktøykassa: skal du skru, tar du skrutrekker, ikke hammer. Lær hvilket spørsmål hver grafalgoritme svarer på.",
          "<ul><li><b>Nås? Sammenhengende? Komponenter?</b> BFS eller DFS, O(|V| + |E|).</li><li><b>Korteste vei uten vekter, eller innen k ledd?</b> BFS (stopp på dybde k).</li><li><b>Korteste vei med ikke-negative vekter?</b> Dijkstra, O((|V| + |E|) · log(|V|)).</li><li><b>Negative vekter eller negativ sykel?</b> Bellman-Ford, O(|V| · |E|).</li><li><b>Billigst å koble alt sammen?</b> Minimalt spenntre med Prim eller Kruskal.</li><li><b>Rekkefølge med avhengigheter, eller sykel i rettet graf?</b> Topologisk sortering.</li><li><b>Rundturer, alle når alle?</b> Sterkt sammenhengende komponenter.</li><li><b>Tåler at én node faller ut?</b> 2-sammenheng og separasjonsnoder, O(|V| + |E|).</li></ul>",
          "<p>Triks som sparer en faktor |V|: mange startnoder gir en <b>superkilde</b> (ny node med kant til alle startnodene) og én traversering. «Hvem kan nå t?» gir én DFS fra t i den <b>omvendte grafen</b>. Nærmeste av mange starter til ett mål gir én Dijkstra fra t i den omvendte grafen. I et tre er stien unik, så BFS eller DFS holder.</p>"),
        les: [["strategi", "eksamensteknikk", "tek-bygg", "Pensum som byggeklosser"], ["grafer", "begreper", null, "Grafer → Begreper"]],
        oppskrift: [
          "Oversett spørsmålet til et graf-spørsmål: «billigst å koble sammen» er minimalt spenntre, «raskest fra A til B» er korteste vei.",
          "Velg den raskeste algoritmen som virker. Bellman-Ford virker nesten alltid, men er sjelden svaret.",
          "Si hva kallet returnerer, og oppgi kjøretiden i |V| og |E|.",
          "Begrunn forutsetningene: «Dijkstra kan brukes fordi ingen kanter har negativ vekt.»"
        ],
        eksempel: [["grafer", "dijkstra", null, "Grafer → Dijkstra (valg av korteste vei-algoritme)"]],
        oppgaver: ["g21dij"],
        ekstra: ["g22kj"],
        sjekk: [{ type: "quiz", items: [
          { q: "Korteste reisetid fra én holdeplass, alle reisetider positive.", options: ["BFS", "Dijkstra", "Bellman-Ford", "Prim"], answer: 1,
            explain: "Vektet med ikke-negative vekter: Dijkstra. BFS teller bare antall kanter." },
          { q: "Billettprisene kan være negative. Kan man tjene vilkårlig mye ved å reise i ring?", options: ["Dijkstra", "Bellman-Ford og se etter negativ sykel", "Topologisk sortering", "Minimalt spenntre"], answer: 1,
            explain: "Bellman-Ford oppdager negative sykler (H2025). Husk å si hvor du starter, eventuelt med en superkilde." },
          { q: "Inviter alle som er innen 2 vennskapsledd fra deg.", options: ["DFS", "BFS som stopper på dybde 2", "Dijkstra", "Full BFS og så filtrering"], answer: 1,
            explain: "BFS går lag for lag. Å traversere hele grafen og filtrere etterpå ble frarådet (H2024)." },
          { q: "Det billigste tunnelnettet som binder sammen alle bygningene.", options: ["Dijkstra fra hver bygning", "Minimalt spenntre (Prim eller Kruskal)", "BFS", "Topologisk sortering"], answer: 1,
            explain: "Urettet, vektet, og alt skal kobles sammen så billig som mulig (Blindern 2023)." },
          { q: "Korteste vei mellom to noder når grafen er et tre.", options: ["Dijkstra", "Bellman-Ford", "BFS eller DFS: stien er unik", "Prim"], answer: 2,
            explain: "I et tre finnes bare én sti. Med Dijkstra fikk løsningen her maks 1 p, mot 3 for BFS eller DFS (Blindern (c) 2023)." }
        ] }],
        feller: [
          "BFS eller DFS én gang per node når én gang holder: maks 3 av 5–6.",
          "Dijkstra én gang per startnode: maks 4 av 7 (2024).",
          "Dijkstra der grafen er et tre: maks 1 p for løsningen, mot 3 for BFS eller DFS (2023)."
        ] },

      { id: "9c", tittel: "BFS og DFS: sykler, to-fargelegging og topologisk sortering", vekt: 4, min: "S", tid: 20, tidG: 40,
        hvorfor: "En liten variant av BFS eller DFS kommer nesten hvert år: to-fargelegging (2021), garbage collection (2022), dependency hell (2023), jazz eller klassisk (2024), sykler i grafer (2025).",
        kjerne: t(
          "BFS er som ringer i vann: først de nærmeste, så de neste. DFS er som å gå i en labyrint: gå så langt du kan, og snu når det stopper. Begge husker hvor de har vært, så de ikke går i ring.",
          "<p><b>BFS</b> bruker en kø og gir avstand i antall kanter. <b>DFS</b> bruker en stakk eller rekursjon. Begge er O(|V| + |E|). <b>Sykel i urettet graf:</b> DFS som møter en besøkt nabo som ikke er forelderen, eller |E| ≠ |V| − antall komponenter. <b>Sykel i rettet graf:</b> topologisk sortering får med færre enn |V| noder. <b>To-fargelegging:</b> BFS, farge etter partall eller oddetall avstand, og sjekk at ingen kant går mellom like farger.</p>",
          "<p>Topologisk sortering med DFS: legg en node på en stakk når alle naboene er ferdige. Stakken er da en topologisk sortering (bare for asykliske grafer). Trenger du en bestemt rekkefølge blant noder som er klare samtidig, bytt køen ut med en heap (Whops-logger 2021). Mange startnoder: superkilde eller én DFS med alle startnodene i stakken, ikke én DFS per startnode.</p>"),
        les: [["grafer", "bfs", null, "Grafer → BFS"], ["grafer", "dfs", null, "Grafer → DFS"], ["grafer", "sykler", null, "Grafer → Sykler"], ["grafer", "topologisk", null, "Grafer → Topologisk sortering"]],
        oppskrift: [
          "Skriv varianten som en liten endring av BFS eller DFS, og si hva som er endret.",
          "Hver node og kant håndteres én gang: O(|V| + |E|). Si det.",
          "Bruker du TopSort som byggekloss, redegjør kort: den får med alle nodene hvis og bare hvis grafen er asyklisk."
        ],
        eksempel: [["grafer", "dfs", "demo-dfs", "DFS steg for steg"], ["grafer", "topologisk", "demo-topsort", "Topologisk sortering steg for steg"]],
        oppgaver: ["g25syk", "g23dep", "g21to"],
        ekstra: ["g22gc", "g21log", "g21opp", "g24jz"],
        sjekk: [{ type: "tf", fra: [["grafer", ["traversering", "sykler", "topologisk sortering"]]], maks: 10 }],
        feller: [
          "DFS eller BFS én gang per node: maks 3 av 5 og 3 av 6 (sykler 2023 og 2025).",
          "DFS én gang per startnode: −2 p (garbage collection 2022). Bruk en superkilde.",
          "Umodifisert topologisk sortering der rekkefølgen blant ledige noder betyr noe: maks 5 av 10 (2021)."
        ] },

      { id: "9d", tittel: "Dijkstra for hånd, med tabell", vekt: 3, min: "E", tid: 15, tidG: 20,
        mangler: "Eget kort «kjør Dijkstra og vis tabellen» finnes ikke ennå. Nærmest er H2020-8 (Dijkstra for hånd i en deloppgave) og demoen i Dijkstra-fanen.",
        hvorfor: "Dijkstra for hånd var 8 p i 2020, og Dijkstra er svaret på korteste vei med vekter i flere oppgaver (2021, 2024). Én Dijkstra på den omvendte grafen ga 7 p i 2024.",
        kjerne: t(
          "Tenk deg at du sender ut løpere fra start. Den løperen som er nærmest, er alltid først framme. Hver gang en løper kommer fram til en node, sjekker hun om veien videre gjør noen andre noder raskere å nå.",
          "<p>Sett avstanden til start til 0 og til alle andre til ∞. Ta hele tiden ut noden med minst avstand fra prioritetskøen. For hver kant (u, v): er d[u] + w(u, v) < d[v], oppdater d[v] og forrige[v], og legg v i køen (edge relaxation). En node som er tatt ut, er ferdig. Krever at ingen kanter har negativ vekt. O((|V| + |E|) · log(|V|)).</p>",
          "<p>Tabellen: én rad per uttak, én kolonne per node med (avstand, forrige). Kurset viser også en versjon uten DecreasePriority: legg noden inn på nytt med ny prioritet og hopp over noder som allerede er ferdige. Køen kan da ha opptil |E| elementer, men siden log(|E|) ≤ 2 · log(|V|), er kjøretiden fortsatt O((|V| + |E|) · log(|V|)).</p>"),
        les: [["grafer", "dijkstra", null, "Grafer → Dijkstra"]],
        oppskrift: [
          "Tegn tabellen før du begynner: kolonner for hver node, rad for hvert uttak.",
          "Skriv hvilken node du tar ut og hvilke avstander som oppdateres.",
          "Til slutt: avstandene og stien, funnet ved å følge forrige[] baklengs.",
          "Si at Dijkstra kan brukes fordi ingen kanter har negativ vekt."
        ],
        eksempel: [["grafer", "dijkstra", "demo-dijkstra", "Dijkstra steg for steg"]],
        oppgaver: ["g20t2", "g24dnt"],
        ekstra: ["g21dij"],
        sjekk: [{ type: "quiz", items: [
          { q: "Urettet graf med kantene A–B 4, A–C 1, C–B 2, B–D 1 og C–D 5. Dijkstra fra A: i hvilken rekkefølge blir nodene ferdige?", options: ["A, C, B, D", "A, B, C, D", "A, C, D, B", "A, B, D, C"], answer: 0,
            explain: "A (0) gir C = 1 og B = 4. C (1) gir B = 3 og D = 6. B (3) gir D = 4. Så D (4)." },
          { q: "Samme graf: hva er den korteste avstanden fra A til D?", options: ["4", "5", "6", "3"], answer: 0,
            explain: "A → C → B → D: 1 + 2 + 1 = 4." },
          { q: "Hvorfor tåler ikke Dijkstra negative kanter?", options: ["Prioritetskøen kan ikke lagre negative tall", "En node som er tatt ut, regnes som ferdig, men en negativ kant senere kunne gitt en kortere vei", "Den blir O(n²)", "Den gjør det"], answer: 1,
            explain: "Med negative kanter brukes Bellman-Ford." },
          { q: "Hvilket av mange utfartssteder er nærmest målet t i en rettet, vektet graf?", options: ["Dijkstra fra hvert utfartssted", "Én Dijkstra fra t i den omvendte grafen", "BFS fra t", "Prim"], answer: 1,
            explain: "Ett kall ga 7 p, ett kall per startnode maks 4 av 7 (DNT 2024)." }
        ] }],
        feller: [
          "Å oppdatere en node som allerede er ferdig.",
          "Dijkstra én gang per startnode i stedet for én gang i den omvendte grafen: maks 4 av 7.",
          "Dijkstra der grafen er et tre: maks 1 p for løsningen, mot 3 for BFS eller DFS (2023)."
        ] },

      { id: "9e", tittel: "Minimalt spenntre: Prim, Kruskal og minste terskel", vekt: 3, min: "E", tid: 15, tidG: 25,
        mangler: "Eget kort for «minste terskel = største kant i et minimalt spenntre» finnes ikke ennå (bare som deloppgave i H2025-7).",
        hvorfor: "Blindern-problemet (2023, 10 p), Kruskal i 2020, og flaskehals-spørsmålet i Kollektivtilbudet i Oslo (2025).",
        kjerne: t(
          "Alle husene skal få strøm, og hver kabel har en pris. Prim starter i ett hus og kobler alltid på den billigste kabelen til et nytt hus. Kruskal kjøper de billigste kablene først, men aldri en som bare lager en ring.",
          "<p>Et <b>minimalt spenntre</b> binder sammen alle nodene i en urettet, vektet, sammenhengende graf med lavest mulig sum av vekter, og har |V| − 1 kanter. <b>Prim</b> lar ett tre vokse og tar alltid den letteste kanten ut av treet (prioritetskø). <b>Kruskal</b> tar kantene sortert på vekt og hopper over dem som lager en sykel. Begge er grådige og O(|E| · log(|V|)).</p>",
          "<p>Minste terskel k slik at grafen fortsatt er sammenhengende når alle kanter med vekt større enn k fjernes, er den største kantvekten i et minimalt spenntre (H2025 (c)). Et minimalt spenntre er ikke det samme som korteste vei: stien mellom to noder i spenntreet trenger ikke være den korteste i grafen.</p>"),
        les: [["grafer", "mst", null, "Grafer → Minimalt spenntre"]],
        oppskrift: [
          "Si at grafen er urettet, vektet og sammenhengende, og at du derfor kan bruke Prim eller Kruskal.",
          "Kjør for hånd: skriv kanten du legger til i hvert steg, og totalvekten til slutt.",
          "Kjøretid O(|E| · log(|V|)), og nevn prioritetskøen (Prim) eller sorteringen (Kruskal)."
        ],
        eksempel: [["grafer", "mst", "demo-prim", "Prim steg for steg"], ["grafer", "mst", "demo-kruskal", "Kruskal steg for steg"]],
        oppgaver: ["g23bl", "g25kol"],
        ekstra: ["g20t2"],
        sjekk: [{ type: "tf", fra: [["grafer", ["minimalt spenntre"]]], maks: 6 }],
        feller: [
          "Dijkstra der et minimalt spenntre er spurt etter, eller omvendt.",
          "Korteste vei i et tre med Dijkstra: maks 1 p for løsningen, mot 3 for BFS eller DFS (2023). Stien er unik, så BFS eller DFS holder."
        ] },

      { id: "9f", tittel: "Sterke komponenter, superkilde og omvendt graf", vekt: 4, min: "S", tid: 20, tidG: 20,
        hvorfor: "Minimal forside (2022, 10 p) og Rundtur med DNT (2024, 12 p) handlet om sterkt sammenhengende komponenter. Superkilde og omvendt graf er triksene som gjør én traversering nok.",
        kjerne: t(
          "En sterk komponent er en gjeng der alle kan gå til alle, selv om veiene er enveiskjørte. Finner du gjengene, ser du hvor rundturene er.",
          "<p>En <b>sterkt sammenhengende komponent</b> er en største mulig mengde noder i en rettet graf der alle når alle. Kurset finner dem med <b>Kosaraju</b>: DFS som legger nodene på en stakk når de er ferdige, så den omvendte grafen, så DFS i rekkefølgen fra stakken. O(|V| + |E|). Rundturer finnes i komponenter med mer enn én node.</p>",
          "<p>Komponentgrafen (hver komponent slått sammen til én node) er alltid asyklisk. Sterke komponenter i G og i den omvendte grafen er de samme. <b>Superkilde:</b> legg til en ny node med kant til alle startnodene, og traverser én gang. <b>Omvendt graf:</b> «hvem kan nå t?» er DFS fra t når alle kantene er snudd.</p>"),
        les: [["grafer", "scc", null, "Grafer → Sterke komponenter"]],
        oppskrift: [
          "Kall gjerne StronglyConnectedComponents(G) som byggekloss: si at den gir komponentene i O(|V| + |E|).",
          "Mange starter eller mange mål: superkilde eller omvendt graf, ikke én traversering per node.",
          "Kjøretid til slutt, i |V| og |E|."
        ],
        eksempel: [["grafer", "scc", "demo-scc", "Kosaraju steg for steg"]],
        oppgaver: ["g24dnt", "g22fs"],
        ekstra: ["g21opp"],
        sjekk: [{ type: "tf", fra: [["grafer", ["SCC"]]], maks: 6 }],
        feller: [
          "Én DFS per node for å se hvem som når hvem: O(|V| · (|V| + |E|)).",
          "Å glemme at komponentene gjelder rettede grafer. I en urettet graf holder vanlige komponenter."
        ] },

      { id: "9g", tittel: "2-sammenheng, separasjonsnoder og Bellman-Ford", vekt: 2, min: "S", tid: 20, tidG: 20,
        mangler: "Egne kort for separasjonsnoder og Bellman-Ford finnes ikke ennå. Bare som deloppgaver i H2025-7 (Kollektivtilbudet i Oslo).",
        hvorfor: "Kollektivtilbudet i Oslo (2025, 15 p) spurte både etter en garanti når én holdeplass stenges (2-sammenheng) og om negative billettpriser (Bellman-Ford). 2-sammenheng var også med i 2020.",
        kjerne: t(
          "En separasjonsnode er en by som alle veiene mellom to deler av landet går gjennom. Stenger du den, blir landet delt i to. Et nett uten slike byer tåler at hvilken som helst by stenges.",
          "<p>En <b>separasjonsnode</b> gjør grafen usammenhengende hvis den fjernes. En sammenhengende graf er <b>2-sammenhengende</b> hvis den ikke har noen. Brute force (fjern hver node og kjør DFS) er O(|V| · (|V| + |E|)). Med én DFS og tallene depth og low finner du alle separasjonsnodene i O(|V| + |E|). <b>Bellman-Ford</b> finner korteste vei med negative kanter og oppdager negative sykler, O(|V| · |E|).</p>",
          "<p>low[u] er den laveste dybden vi kan nå fra subtreet til u med én kant utenfor DFS-treet. Roten er separasjonsnode hvis den har mer enn ett barn i DFS-treet. En annen node u er det hvis et barn v har low[v] ≥ depth[u]. Bellman-Ford: si hvilken node du starter fra, eller bruk en superkilde (ellers −1 p i 2025).</p>"),
        les: [["grafer", "sammenheng", null, "Grafer → Sammenheng"], ["grafer", "dijkstra", "pc-bellman", "Bellman-Ford (i Dijkstra-fanen)"]],
        oppskrift: [
          "Oversett «tåler at én holdeplass stenges» til «2-sammenhengende» og «ingen separasjonsnoder».",
          "Kall gjerne IsBiconnected(G) eller SeparationVertices(G) som byggekloss: O(|V| + |E|).",
          "Negative vekter: Bellman-Ford fra en bestemt node eller en superkilde, og sjekk etter negativ sykel."
        ],
        eksempel: [["grafer", "sammenheng", "sep-fig", "Fjern en node og se hva som skjer"]],
        oppgaver: ["g25kol"],
        ekstra: ["g20t2"],
        sjekk: [{ type: "tf", fra: [["grafer", ["separasjonsnoder"]]], maks: 6 }],
        feller: [
          "Brute force (fjern hver node) når én DFS holder.",
          "Bellman-Ford uten å si hvor du starter: −1 p (2025)."
        ] }
    ] },

    /* ===================== 10 · LISTER, STAKK, P/NP ===================== */
    { nr: 10, navn: "Lister, stakk og P/NP", hvor: "Sjelden, ~3 p", steg: [
      { id: "10a", tittel: "Stakk og lister: velformaterte tagger", vekt: 1, min: "G", tid: 20, tidG: 15,
        hvorfor: "Stakk kom bare i 2020 (HTML-tagger, 12 p), så temaet er sjeldent. Det er raskt å lære, og stakken er også motoren i iterativ DFS.",
        kjerne: t(
          "En stakk er en tallerkenstabel: du legger på og tar av øverst. Åpner du en tagg, legger du den på stabelen. Lukker du en, må den øverste være samme tagg.",
          "<p>En <b>stakk</b> (sist inn, først ut) har push og pop i O(1). Velformaterte tagger: gå gjennom taggene. En åpningstagg pushes. En lukketagg krever at stakken ikke er tom og at toppen er samme tagg, som da poppes. Til slutt må stakken være tom. O(n) for n tagger.</p>",
          "<p>Stakken løser alle problemer med nøstede par (parenteser, tagger, rekursjon). En lenket liste gir push og pop i O(1) i starten av lista. Et dynamisk array gir amortisert O(1) bakerst.</p>"),
        les: [["lister", "stakk", null, "Lister og stakk → Stakk"], ["lister", "lru", null, "Lister og stakk → Nylige søk (LRU)"]],
        oppskrift: [
          "Si hvilken datastruktur du bruker og hvorfor (nøstede par gir stakk).",
          "Husk begge feiltilfellene: feil tagg på toppen, og tagger igjen på stakken til slutt.",
          "Kjøretid O(n)."
        ],
        eksempel: [["lister", "stakk", "parsons-tags", "Pusle sammen tagg-sjekken"]],
        oppgaver: ["l20tag"],
        sjekk: [{ type: "quiz", items: [
          { q: "Taggene er &lt;a&gt; &lt;b&gt; &lt;/a&gt; &lt;/b&gt;. Hva skjer i stakkalgoritmen?", options: ["Alt er i orden", "Ved &lt;/a&gt; ligger b øverst, så stakkalgoritmen svarer false", "Stakken er tom til slutt, så algoritmen svarer true", "Algoritmen stopper ved &lt;b&gt;"], answer: 1,
            explain: "Stakkalgoritmen krever at den sist åpnede taggen lukkes først. Det var den tiltenkte tolkningen, men oppgaveteksten i H2020 tillot også at kryssende tagger regnes som velformaterte, og sensor ga full uttelling for begge." },
          { q: "Hva må gjelde når alle taggene er lest?", options: ["Stakken er tom", "Stakken har én tagg", "Ingenting", "Stakken er sortert"], answer: 0,
            explain: "Ligger det tagger igjen, ble de aldri lukket." },
          { q: "Hva er kjøretiden for n tagger?", options: ["O(n)", "O(n²)", "O(log n)", "O(n log n)"], answer: 0,
            explain: "Hver tagg gir én push eller én pop, O(1) hver." }
        ] }],
        feller: ["Å glemme sjekken av at stakken er tom til slutt."] },

      { id: "10b", tittel: "Verifikator og sertifikat", vekt: 1, min: "G", tid: 15,
        hvorfor: "Verifikator for et grafproblem var 10 p i 2020. Å lete etter en løsning i stedet for å sjekke sertifikatet ga 0 p.",
        kjerne: t(
          "Noen gir deg et forslag til løsning. Jobben din er bare å sjekke om forslaget stemmer, ikke å finne en løsning selv.",
          "<p>En <b>verifikator</b> tar en instans og et <b>sertifikat</b> (et løsningsforslag) og sjekker i polynomiell tid om sertifikatet viser at svaret er JA. For Hamiltonsykel: sjekk at sertifikatet inneholder hver node nøyaktig én gang, og at hvert nabopar, også fra den siste til den første, er en kant.</p>",
          "<p>Verifikatoren viser at problemet er i NP. Den skal aldri søke gjennom mulige løsninger: da er den ikke lenger en verifikator, og kjøretiden blir eksponentiell.</p>"),
        les: [["strategi", "pnp", null, "Strategi → P og NP"]],
        oppskrift: [
          "Skriv hva sertifikatet er (for eksempel en rekkefølge av nodene).",
          "Sjekk hver betingelse i problemet med en løkke.",
          "Oppgi kjøretiden og at den er polynomiell."
        ],
        eksempel: [["strategi", "pnp", "ham-graf", "Verifikator for Hamiltonsykel"]],
        oppgaver: ["p20ver"],
        sjekk: [{ type: "quiz", items: [
          { q: "Hva gjør en verifikator for Hamiltonsykel?", options: ["Leter etter en Hamiltonsykel", "Sjekker at sertifikatet faktisk er en Hamiltonsykel", "Teller syklene i grafen", "Kjører Dijkstra"], answer: 1,
            explain: "Å lete ga 0 p i 2020." },
          { q: "Hva må sjekkes?", options: ["At sertifikatet er sortert", "At hver node er med nøyaktig én gang, og at hvert nabopar, også siste til første, er en kant", "At grafen er sammenhengende", "At grafen er rettet"], answer: 1,
            explain: "Det er definisjonen av en Hamiltonsykel." },
          { q: "Hvor rask må en verifikator være?", options: ["Polynomiell", "Eksponentiell er greit", "O(1)", "O(log n)"], answer: 0,
            explain: "Polynomiell verifisering er definisjonen av NP." }
        ] }],
        feller: ["Å søke etter en løsning i stedet for å verifisere: 0 p (2020)."] }
    ] },

    /* ===================== 11 · GENERALPRØVE ===================== */
    { nr: 11, navn: "Generalprøve", hvor: "En hel eksamen i rekkefølge", steg: [
      { id: "11", tittel: "Generalprøve: hele H2024 i eksamensrekkefølge", vekt: 0, min: "S", tid: 220, spesial: "generalprove",
        hvorfor: "Alt på én gang, i samme rekkefølge som på eksamen. H2024 er valgt fordi alle oppgavene finnes som kort i guiden. Generalprøven gir ingen egne poeng i løypa, men viser hvor du står.",
        kjerne: t(
          "Lat som det er eksamensdagen. Start klokka, gjør oppgavene i rekkefølge, og sjekk løsningen først når du er ferdig med hver.",
          "<p>Løs oppgavene på papir i rekkefølge. Den anbefalte tiden er fordelt etter poeng. Åpne løsningen i kortet etterpå og merk med «Fikk det til» eller «Må øve mer».</p>",
          "<p>Varigheten står ikke i kildene våre. Tallene under fordeler en tid du selv velger (forslag: 2 minutter per poeng) etter poengene. Sjekk den faktiske varigheten i eksamensinformasjonen.</p>"),
        les: [],
        oppskrift: [
          "Les gjennom hele settet først (2–3 minutter).",
          "Hold deg til tiden per oppgave. Står du fast, gå videre.",
          "Etterpå: merk hvert kort. Det du merker «Må øve mer», havner i repetisjonskøen."
        ],
        eksempel: [],
        oppgaver: ["t24huf", "s24ety", "g24jz", "x24py", "t24lca", "h24med", "g24dnt"],
        feller: [
          "Å åpne løsningen underveis.",
          "Å bruke for lang tid på del 1. Hold tempoet."
        ] }
    ] }
  ];

  /* Generalprøven: H2024 i rekkefølge (sum 100 p). kort = nøkkel i KORT, ellers lenke. */
  var GENERALPROVE = {
    eksamen: "H2024",
    rader: [
      { nr: "1", tittel: "Oppvarming", p: 2, lenke: ["begreper", "algoritme", null] },
      { nr: "Del 1", tittel: "Sant/usant (velg 22 påstander i øvingen)", p: 22, lenke: ["strategi", "eksamensteknikk", "del1-ovelse"] },
      { nr: "2", tittel: "Huffman-trær", p: 10, kort: "t24huf" },
      { nr: "3", tittel: "Etymologisk ordliste", p: 10, kort: "s24ety" },
      { nr: "4", tittel: "Jazz eller klassisk?", p: 10, kort: "g24jz" },
      { nr: "5", tittel: "Python 3.6-ordbøker", p: 10, kort: "x24py" },
      { nr: "6", tittel: "Laveste felles forfeder", p: 12, kort: "t24lca" },
      { nr: "7", tittel: "Mediankø", p: 12, kort: "h24med" },
      { nr: "8", tittel: "Rundtur med DNT", p: 12, kort: "g24dnt" }
    ],
    minPerPoeng: 2
  };

  IN.CRASH = {
    versjon: 1,
    terskel: 0.7,          // andel riktige på stegets egen sjekk for å regnes som dekket
    lengder: LENGDER,
    kort: KORT,
    etapper: ETAPPER,
    generalprove: GENERALPROVE,
    mockAndel: 0.5          // andel mock-kort i valgt lengde som må være «ok»
  };

  /* ============================================================
     Fremdrift for løypa: IN.crashProgress(L?)
     Felles for crash.html og forsiden. Trenger bare core.js (IN.progress),
     valgfritt data-mock.js (IN.MOCK) og denne fila. Sjekkene leses via
     nøklene sine i registeret, aldri via innholdet (TF_GEN, algos osv.).
     ============================================================ */
  var C = IN.CRASH, RANK = { E: 0, S: 1, G: 2 }, LEN = {}, STEPS = [], BYID = {};
  LENGDER.forEach(function (L) { LEN[L.id] = L; });
  ETAPPER.forEach(function (e) { e.steg.forEach(function (s) { s.etappe = e; STEPS.push(s); BYID[s.id] = s; }); });
  var SANN = { "høy": 0, "middels": 1, "lav": 2 };

  function allRecs() { return (IN.progress && IN.progress.all()) || {}; }
  function state() {
    var r = (IN.progress && IN.progress.get("crash:state")) || {};
    return { lengde: LEN[r.lengde] ? r.lengde : "S", sist: BYID[r.sist] ? r.sist : null };
  }
  function inLen(s, L) { return RANK[s.min] <= RANK[L]; }
  function stepsIn(L) { return STEPS.filter(function (s) { return inLen(s, L); }); }
  function minutes(s, L) { return (s.tid || 0) + (L === "G" ? (s.tidG || 0) : 0); }
  function ratio(rec) {
    if (!rec || !rec.max) return 0;
    return (rec.best != null ? rec.best : (rec.score || 0)) / rec.max;
  }
  function checkKey(s, i, c) { return c.type === "ekstern" ? c.key : c.type + ":crash:sjekk-" + s.id + "-" + i; }
  function kortKey(k) { var c = KORT[k]; return c ? (c[7] || "kort:" + c[0] + ":" + c[6]) : null; }
  function kortStatus(rec) {
    if (!rec) return null;
    if (rec.status) return rec.status;
    if (rec.max) return ratio(rec) >= C.terskel ? "ok" : null;
    return null;
  }
  function mockList() { return (IN.MOCK && IN.MOCK.length) ? IN.MOCK.slice() : []; }
  function mockInLen(m, L) {
    var r = SANN[m.sannsynlighet] != null ? SANN[m.sannsynlighet] : 2;
    return L === "G" ? true : L === "S" ? r <= 1 : r === 0;
  }

  /* Status for ett steg: { done, queue, started, via } */
  function stepStatus(s, all, L) {
    var okT = 0, ovT = 0, started = false, via = null;
    var self = all["crash:steg:" + s.id];
    if (self && self.status === "ok") { okT = self.t || 1; via = "egenvurdering"; }
    if (self && self.status === "ovmer") ovT = self.t || 1;
    if (self && self.status) started = true;
    (s.sjekk || []).forEach(function (c, i) {
      var rec = all[checkKey(s, i, c)];
      if (!rec) return;
      started = true;
      if (ratio(rec) >= (c.terskel || C.terskel)) { okT = Math.max(okT, rec.t || 1); via = via || "sjekk"; }
    });
    var cards = (s.oppgaver || []).map(kortKey).filter(Boolean);
    var extra = (s.ekstra || []).map(kortKey).filter(Boolean);
    var allOk = cards.length > 0, cardOkT = 0;
    cards.forEach(function (k) {
      var r = all[k];
      if (kortStatus(r) === "ok") { cardOkT = Math.max(cardOkT, r.t || 1); started = true; }
      else allOk = false;
    });
    if (allOk) { okT = Math.max(okT, cardOkT); via = via || "kort"; }
    cards.concat(extra).forEach(function (k) {
      var r = all[k];
      if (kortStatus(r) === "ovmer") { ovT = Math.max(ovT, r.t || 1); started = true; }
    });
    if (s.spesial === "mock") {
      var ms = mockList().filter(function (m) { return mockInLen(m, L); }), n = 0, last = 0;
      ms.forEach(function (m) {
        var r = all["kort:crash:" + m.id];
        if (r && r.status === "ok") { n++; last = Math.max(last, r.t || 1); started = true; }
        if (r && r.status === "ovmer") { ovT = Math.max(ovT, r.t || 1); started = true; }
      });
      if (ms.length && n >= Math.ceil(ms.length * C.mockAndel)) { okT = Math.max(okT, last); via = via || "kort"; }
    }
    return { done: okT > 0, queue: ovT > okT, started: started, via: via };
  }
  function statusAll(L, all) {
    all = all || allRecs();
    var out = {};
    STEPS.forEach(function (s) { out[s.id] = stepStatus(s, all, L); });
    return out;
  }
  function fortsettTarget(L, st, sist) {
    if (sist && BYID[sist] && inLen(BYID[sist], L) && !st[sist].done) return sist;
    var list = stepsIn(L);
    for (var i = 0; i < list.length; i++) if (!st[list[i].id].done) return list[i].id;
    return null;
  }

  /* Sammendrag for valgt lengde (L, ellers crash:state.lengde, ellers "S").
     dekket/total er poeng (vekt). Etapper uten poeng (0 og 11): bruk ferdigeSteg/antallSteg. */
  IN.crashProgress = function (L) {
    var stt = state();
    L = LEN[L] ? L : stt.lengde;
    var st = statusAll(L), list = stepsIn(L);
    var total = 0, dekket = 0, ferdige = 0, alle100 = 0, tid = 0;
    STEPS.forEach(function (s) { if (st[s.id].done) alle100 += s.vekt; });
    list.forEach(function (s) {
      total += s.vekt; tid += minutes(s, L);
      if (st[s.id].done) { dekket += s.vekt; ferdige++; }
    });
    var f = fortsettTarget(L, st, stt.sist), fs = f ? BYID[f] : null;
    var ko = STEPS.filter(function (s) { return st[s.id].queue; })
      .sort(function (a, b) { return b.vekt - a.vekt; }).map(function (s) { return s.id; });
    return {
      lengde: L, lengdeNavn: LEN[L].navn, sist: stt.sist,
      dekket: dekket, total: total, prosent: total ? Math.round(100 * dekket / total) : 0,
      alle100: alle100,                       // poeng dekket over hele løypa (alle lengder), av 100
      ferdigeSteg: ferdige, antallSteg: list.length, minutter: tid,
      fortsett: fs ? { id: fs.id, tittel: fs.tittel, etappe: fs.etappe.nr, etappeNavn: fs.etappe.navn, href: "crash.html#steg=" + fs.id } : null,
      etapper: ETAPPER.map(function (e) {
        var inL = e.steg.filter(function (s) { return inLen(s, L); }), d = 0, t = 0, n = 0;
        inL.forEach(function (s) { t += s.vekt; if (st[s.id].done) { d += s.vekt; n++; } });
        return { id: e.nr, tittel: e.navn, dekket: d, total: t, ferdigeSteg: n, antallSteg: inL.length };
      }),
      ovmer: ko.length, ko: ko,
      status: st
    };
  };
  /* Hjelpere for crash.html (samme regler overalt) */
  IN.crashProgress.state = state;
  IN.crashProgress.statusAll = statusAll;
  IN.crashProgress.fortsettTarget = fortsettTarget;
  IN.crashProgress.inLen = inLen;
  IN.crashProgress.stepsIn = stepsIn;
  IN.crashProgress.minutes = minutes;
  IN.crashProgress.ratio = ratio;
  IN.crashProgress.checkKey = checkKey;
  IN.crashProgress.kortKey = kortKey;
  IN.crashProgress.kortStatus = kortStatus;
  IN.crashProgress.mockList = mockList;
  IN.crashProgress.mockInLen = mockInLen;
  IN.crashProgress.steps = STEPS;
  IN.crashProgress.byId = BYID;
})();
