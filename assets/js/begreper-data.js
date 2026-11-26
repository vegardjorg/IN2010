/* ============================================================
   IN2010 guide · begreper-data.js
   Ordlista for begreper og forkortelser (IN.BEGREPER). Én kilde for både
   verktøytipsene i løpende tekst (begrep-tips.js) og ordlista på
   00-begreper.html (fanen «Ordliste»). Symboler (⌊x⌋, ∈, |V| …) står i symboler.js.
   Lastes rett etter symboler.js.

   Skrivemåten følger kurset (plan/symbolbank.md, plan/gjennomgang/begreper-tooltips.md):
   «Load factor», «Linear probing», «Separate chaining», «inngrad», «stor O»,
   «bredde-først søk», «minimalt spenntre», «sterkt sammenhengende komponent».
   Kun stor O, aldri Θ/Ω. Alle tekster er våre egne ord, ikke sitater fra kildene.

   Felt per begrep:
     ord   – oppslagsordet slik det vises i tipset og i ordlista
     full  – engelsk fullform for en forkortelse (vises først: «DAG – directed acyclic graph»)
     navn  – kursets norske navn når det er en forkortelse (vises foran teksten)
     txt   – én til to setninger på kursnivå
     tema  – gruppe i ordlista: grunn, sortering, lister, traer, heap, hashing, grafer, strategi
     se    – [lenke, tekst]: der begrepet forklares grundig (brukes i ordlista)
     m     – mønstre (RegExp-kilde, uten forskjell på store/små bokstaver) som skal få tipset
     mc    – mønstre der store/små bokstaver teller (forkortelser som DAG, BFS)
             Bare første treff per seksjon/kort markeres.
     ikke  – sider (body[data-page]) der begrepet er selve temaet og ikke skal markeres
     vis   – "treff": overskriften viser teksten som ble truffet (brukes for O(…))
     forveks – valgfri, én–to setninger: «Må ikke forveksles med …» der to begreper ofte blandes.
             Vises som egen dempet linje i tipset og i ordlista.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});

  var B = {
    /* ---------- Grunnbegreper ---------- */
    ostor: { ord: "stor O", forveks: "Må ikke forveksles med det nøyaktige antallet steg: O sier hvor fort kjøretiden vokser, og konstanter og mindre ledd tas bort.", full: "Big O", navn: "stor O-notasjon", tema: "grunn", vis: "treff",
      txt: "Stor O sier hvor fort kjøretiden vokser når input n blir stor. Vi stryker konstanter og mindre ledd, så 3n + 5 blir O(n).",
      se: ["00-begreper.html#fane=bigo", "Begreper → Kjøretid & stor O"],
      m: ["O\\((?:[^()\\n]|\\([^()\\n]*\\)){1,30}\\)", "Big[- ]O", "stor O(?:-notasjon(?:en)?)?"] },
    adt: { ord: "ADT", full: "abstract data type", navn: "abstrakt datatype", tema: "grunn",
      txt: "Sier hvilke operasjoner som finnes og hva de gjør, men ikke hvordan de er laget. Stakk og kø er ADT-er; array og lenket liste er måter å lage dem på.",
      se: ["00-begreper.html#fane=adt", "Begreper → ADT vs. datastruktur"],
      mc: ["ADT(?:-en|-er|-ene)?"], m: ["abstrakte? datatyper?"] },
    lifo: { ord: "LIFO", forveks: "Må ikke forveksles med FIFO (kø), der det som kom inn først, også går ut først.", full: "last in, first out", navn: "sist inn, først ut", tema: "lister",
      txt: "Det som ble lagt inn sist, tas ut først. Slik virker en stakk.",
      se: ["lister.html#fane=stakk", "Lister → Stakk og kø"], mc: ["LIFO"] },
    fifo: { ord: "FIFO", forveks: "Må ikke forveksles med LIFO (stakk), der det som kom inn sist, går ut først.", full: "first in, first out", navn: "først inn, først ut", tema: "lister",
      txt: "Det som kom først, tas ut først. Slik virker en kø.",
      se: ["lister.html#fane=stakk", "Lister → Stakk og kø"], mc: ["FIFO(?:-kø(?:en)?)?"] },
    amortisert: { ord: "amortisert", tema: "grunn",
      txt: "Vi ser på mange operasjoner under ett. Én operasjon kan av og til være dyr (når et dynamisk array dobles), men fordelt på alle blir det lite per operasjon, for eksempel O(1).",
      se: ["lister.html#fane=dynamisk", "Lister → Dynamisk array"], m: ["amortisert(?:e)?"] },
    basistilfelle: { ord: "basistilfelle", tema: "grunn",
      txt: "Det enkle tilfellet der en rekursiv prosedyre svarer med en gang, uten å kalle seg selv igjen. Uten basistilfelle stopper rekursjonen aldri.",
      se: ["00-begreper.html#fane=rekursjon", "Begreper → Rekursjon"], m: ["basistilfeller?(?:et|ene)?"] },
    kallstakk: { ord: "kallstakk", tema: "grunn",
      txt: "Hvert kall som venter på svar, ligger som en ramme med sine egne variabler på kallstakken (engelsk: call stack). Kallet øverst blir ferdig først.",
      se: ["00-begreper.html#fane=rekursjon", "Begreper → Rekursjon"], m: ["kallstakk(?:en|er|ene)?"] },

    /* ---------- Sortering ---------- */
    stabil: { ord: "stabil", forveks: "Må ikke forveksles med in-place. Stabil handler om rekkefølgen til like nøkler, in-place om ekstra datastrukturer.", tema: "sortering",
      txt: "En sortering er stabil når like nøkler står i samme innbyrdes rekkefølge etter sorteringen som før.",
      se: ["00-begreper.html#fane=stabil", "Begreper → Stabil & in-place"], m: ["u?stabil(?:e|t)?"] },
    inplace: { ord: "in-place", forveks: "Må ikke forveksles med stabil. In-place handler om ekstra datastrukturer, stabil om rekkefølgen til like nøkler.", tema: "sortering",
      txt: "Algoritmen sorterer i selve arrayet og mellomlagrer ikke elementene i en ekstra datastruktur. Merge sort (hjelpearray) og Bucket sort (bøtter) er ikke in-place.",
      se: ["00-begreper.html#fane=stabil", "Begreper → Stabil & in-place"], m: ["in-place"] },
    pivot: { ord: "pivot", tema: "sortering",
      txt: "Elementet Quicksort deler arrayet rundt: de mindre havner på den ene siden, de større på den andre. Et dårlig valg av pivot gir O(n²).",
      se: ["01-sortering.html#fane=quick", "Sortering → Quicksort"], m: ["pivot(?:en|er|ene|element(?:et)?)?"] },
    sammenligning: { ord: "sammenligningsbasert", tema: "sortering",
      txt: "Sorteringen finner rekkefølgen bare ved å sammenligne to og to elementer. I verste tilfelle trenger en slik sortering et antall sammenligninger som vokser som n log n, så den kan ikke bli bedre enn O(n log n).",
      se: ["01-sortering.html#fane=oversikt", "Sortering → Oversikt"], m: ["sammenligningsbaserte?"] },

    /* ---------- Lister ---------- */
    dynarray: { ord: "dynamisk array", tema: "lister",
      txt: "Et array som vokser ved behov: når det er fullt, lages et nytt med dobbelt så mange plasser, og alt kopieres over. Innsetting bakerst blir da amortisert O(1).",
      se: ["lister.html#fane=dynamisk", "Lister → Dynamisk array"], m: ["dynamiske? array(?:et|er|ene)?"], ikke: ["lister"] },
    lenket: { ord: "lenket liste", tema: "lister",
      txt: "En kjede av noder der hver node peker til den neste (i en dobbeltlenket liste også til den forrige). Innsetting fremst er O(1), men å finne plass i tar O(n).",
      se: ["lister.html#fane=lenket", "Lister → Lenket liste"], m: ["(?:dobbelt|enkelt)?lenkede? list(?:e|en|er|ene)"], ikke: ["lister"] },
    deque: { ord: "deque", full: "double-ended queue", navn: "kø med to ender", tema: "lister",
      txt: "Vi kan sette inn og ta ut i begge ender, så den kan brukes både som stakk og som kø.",
      se: ["lister.html#fane=stakk", "Lister → Stakk og kø"], m: ["deque(?:n|r)?"] },

    /* ---------- Trær ---------- */
    bst: { ord: "BST", forveks: "Må ikke forveksles med en heap. I et BST er venstre subtre mindre og høyre større enn noden. I en min-heap er bare hver forelder mindre enn eller lik barna.", full: "binary search tree", navn: "binært søketre", tema: "traer",
      txt: "Et binærtre der alt i venstre subtre er mindre enn noden og alt i høyre subtre er større. Søk, innsetting og fjerning koster O(h), der h er høyden.",
      se: ["04-traer.html#fane=bst", "Trær → Binære søketrær"], mc: ["BST(?:-en|-er|-ene)?"], m: ["binær(?:t|e) søketr(?:e|eet|ær|ærne)"] },
    avl: { ord: "AVL-tre", tema: "traer",
      txt: "Et binært søketre som holder seg balansert: i hver node skiller høydene til venstre og høyre subtre seg med høyst 1, så høyden er O(log n). AVL er initialene til Adelson-Velsky og Landis.",
      se: ["04-traer.html#fane=avl", "Trær → AVL"], mc: ["AVL(?:-tre(?:et)?|-trær(?:ne)?)?"] },
    balansefaktor: { ord: "balansefaktor", tema: "traer",
      txt: "Høyden til venstre subtre minus høyden til høyre subtre. I et AVL-tre er den alltid −1, 0 eller 1.",
      se: ["04-traer.html#fane=avl", "Trær → AVL"], m: ["balansefaktor(?:en|er|ene)?"] },
    rotasjon: { ord: "rotasjon", tema: "traer",
      txt: "En liten omkobling av noen få noder som gjør treet mer balansert, men beholder søketre-egenskapen. Den koster O(1).",
      se: ["04-traer.html#fane=avl", "Trær → AVL"], m: ["(?:venstre|høyre|dobbel)?rotasjon(?:en|er|ene)?"] },
    lovnode: { ord: "løvnode", tema: "traer",
      txt: "En node uten barn (også kalt ekstern node). En løvnode har høyde 0.",
      se: ["04-traer.html#fane=begreper", "Trær → Begreper"], m: ["løvnode(?:n|r|ne)?"] },
    komplett: { ord: "komplett binærtre", forveks: "Må ikke forveksles med AVL-treet. Et komplett tre er fylt nivå for nivå fra venstre. Et AVL-tre er et binært søketre der høydene til venstre og høyre subtre skiller seg med høyst 1 i hver node, men det trenger ikke være komplett.", tema: "heap",
      txt: "Alle nivåer er fulle, unntatt kanskje det nederste, som fylles fra venstre. Det er formen en heap alltid har.",
      se: ["03-heap.html#fane=hva", "Heap → Hva er en heap"], m: ["komplett(?:e)? binærtr(?:e|eet|ær)"] },
    preorder: { ord: "preorder", tema: "traer",
      txt: "Traversering der noden besøkes før barna: først noden, så venstre subtre, så høyre subtre.",
      se: ["04-traer.html#fane=trav", "Trær → Traversering"], m: ["preorder"] },
    inorder: { ord: "inorder", tema: "traer",
      txt: "Traversering i rekkefølgen venstre subtre, noden, høyre subtre. I et binært søketre gir den elementene sortert.",
      se: ["04-traer.html#fane=trav", "Trær → Traversering"], m: ["inorder"] },
    postorder: { ord: "postorder", tema: "traer",
      txt: "Traversering der barna besøkes før noden: først venstre og høyre subtre, så noden selv.",
      se: ["04-traer.html#fane=trav", "Trær → Traversering"], m: ["postorder"] },
    levelorder: { ord: "level-order", tema: "traer",
      txt: "Nivå for nivå fra roten, fra venstre mot høyre på hvert nivå. Det gjøres med en kø, akkurat som bredde-først søk.",
      se: ["04-traer.html#fane=trav", "Trær → Traversering"], m: ["level-order"] },
    lca: { ord: "LCA", full: "lowest common ancestor", navn: "laveste felles forfeder", tema: "traer",
      txt: "Den dypeste noden som har både u og v under seg. En node regnes som forfeder til seg selv.",
      se: ["04-traer.html#fane=lca", "Trær → Laveste felles forfeder"], mc: ["LCA"], m: ["laveste felles forfeder(?:en)?"] },
    prefikstre: { ord: "prefikstre", tema: "traer",
      txt: "Et tre (også kalt trie) som lagrer strenger tegn for tegn langs stier fra roten, så strenger med felles start deler sti.",
      se: ["04-traer.html#fane=huffman", "Trær → Huffman"], m: ["prefikstr(?:e|eet|ær)", "trie"] },

    /* ---------- Heap ---------- */
    heap: { ord: "heap", forveks: "Må ikke forveksles med «heapen» i minnet der et program lagrer objekter. Det er noe helt annet enn datastrukturen her.", tema: "heap",
      txt: "Et komplett binærtre der hver node står i fast rekkefølge til forelderen. I en min-heap er hver node større enn eller lik forelderen, så det minste elementet ligger i roten. I en max-heap er det motsatt, og det største ligger i roten.",
      se: ["03-heap.html#fane=hva", "Heap → Hva er en heap"], m: ["(?:binær |min-|max-)?heap(?:en|er|ene)?"], ikke: ["heap"] },
    prioritetsko: { ord: "prioritetskø", forveks: "Må ikke forveksles med heap. Prioritetskøen er ADT-en (hva man kan gjøre), heapen er en datastruktur som implementerer den.", tema: "heap",
      txt: "En ADT der vi setter inn elementer og alltid tar ut det minste først (removeMin). Den lages vanligvis med en heap.",
      se: ["03-heap.html#fane=pk", "Heap → Prioritetskø"], m: ["prioritetskø(?:en|er|ene)?"], ikke: ["heap"] },

    /* ---------- Hashing ---------- */
    hashfunksjon: { ord: "hashfunksjon", tema: "hashing",
      txt: "Gjør en nøkkel om til en plass i arrayet, et tall fra 0 til N − 1. Samme nøkkel må alltid gi samme plass.",
      se: ["05-hashing.html#fane=begreper", "Hashing → Begreper"], m: ["hashfunksjon(?:en|er|ene)?"] },
    hashmap: { ord: "hashmap", forveks: "Må ikke forveksles med hashset. Et hashmap lagrer par av nøkkel og verdi, et hashset bare nøkler.", tema: "hashing",
      txt: "Lagrer par av nøkkel og verdi. Innsetting, oppslag og sletting er forventet O(1).",
      se: ["05-hashing.html#fane=begreper", "Hashing → Begreper"], m: ["hashmap(?:et|pet|s|ene)?"], ikke: ["hashing"] },
    hashset: { ord: "hashset", forveks: "Må ikke forveksles med hashmap. Et hashset lagrer bare nøkler, et hashmap lagrer par av nøkkel og verdi.", tema: "hashing",
      txt: "Som et hashmap, men bare med nøkler. Svarer på om en nøkkel finnes i forventet O(1).",
      se: ["05-hashing.html#fane=begreper", "Hashing → Begreper"], m: ["hashset(?:et|tet|s|ene)?"], ikke: ["hashing"] },
    kollisjon: { ord: "kollisjon", tema: "hashing",
      txt: "To ulike nøkler hasher til samme plass. Separate chaining og Linear probing er to måter å løse det på.",
      se: ["05-hashing.html#fane=begreper", "Hashing → Begreper"], m: ["kollisjon(?:en|er|ene)?"] },
    loadfactor: { ord: "Load factor", tema: "hashing",
      txt: "n/N: antall elementer delt på antall plasser i arrayet. Kurset rehasher når den når 0,75.",
      se: ["05-hashing.html#fane=begreper", "Hashing → Begreper"], m: ["load factor(?:en)?"] },
    linprob: { ord: "Linear probing", tema: "hashing",
      txt: "Ved kollisjon prøver vi neste plass, i + 1, i + 2 og så videre (mod N), til vi finner en ledig. Alle parene ligger i selve arrayet.",
      se: ["05-hashing.html#fane=probing", "Hashing → Linear probing"], m: ["linear probing", "lineær probing"] },
    chaining: { ord: "Separate chaining", tema: "hashing",
      txt: "Hver plass i arrayet har en bøtte, en liste med alle parene som hasher dit.",
      se: ["05-hashing.html#fane=chaining", "Hashing → Separate chaining"], m: ["separate chaining"] },
    rehash: { ord: "rehash", forveks: "Må ikke forveksles med å bytte hashfunksjon. Det er arrayet som får ny størrelse (vanligvis større), og plassene regnes ut på nytt.", tema: "hashing",
      txt: "Lag et større array (kurset dobler N) og sett inn alle parene på nytt, siden plassen h(k, N) avhenger av N. Én rehash koster O(n).",
      se: ["05-hashing.html#fane=kjoretid", "Hashing → Rehash & kjøretid"], m: ["rehash(?:en|ing(?:en)?|er|es)?"] },

    /* ---------- Grafer ---------- */
    dag: { ord: "DAG", full: "directed acyclic graph", navn: "rettet asyklisk graf", tema: "grafer",
      txt: "En rettet graf uten sykler. Bare en DAG kan sorteres topologisk.",
      se: ["06-grafer.html#fane=topologisk", "Grafer → Topologisk sortering"], mc: ["DAG(?:-en|-er|-ene|s)?"], m: ["rett(?:et|ede) asykliske? graf(?:en|er|ene)?"] },
    bfs: { ord: "BFS", forveks: "Må ikke forveksles med DFS, som går så dypt som mulig før den snur. BFS går lag for lag ut fra starten, med en kø.", full: "breadth-first search", navn: "bredde-først søk", tema: "grafer",
      txt: "Besøker grafen lag for lag fra startnoden, med en kø. I en uvektet graf gir det korteste vei målt i antall kanter.",
      se: ["06-grafer.html#fane=bfs", "Grafer → Bredde-først søk"], mc: ["BFS(?:-en|-treet)?"], m: ["bredde-først(?:-| )søk(?:et)?"] },
    dfs: { ord: "DFS", forveks: "Må ikke forveksles med BFS, som går lag for lag med en kø. DFS går så dypt som mulig før den snur, med en stakk eller rekursjon.", full: "depth-first search", navn: "dybde-først søk", tema: "grafer",
      txt: "Går så langt som mulig langs én sti før det går tilbake og prøver neste nabo. Skrives naturlig rekursivt, eller med en stakk.",
      se: ["06-grafer.html#fane=dfs", "Grafer → Dybde-først søk"], mc: ["DFS(?:-en|-treet)?"], m: ["dybde-først(?:-| )søk(?:et)?"] },
    inngrad: { ord: "inngrad", tema: "grafer",
      txt: "Antall kanter som går inn til en node i en rettet graf. En node med inngrad 0 kan stå først i en topologisk sortering.",
      se: ["06-grafer.html#fane=topologisk", "Grafer → Topologisk sortering"], m: ["inngrad(?:en|er|ene)?", "in-grad(?:en)?"] },
    utgrad: { ord: "utgrad", tema: "grafer",
      txt: "Antall kanter som går ut fra en node i en rettet graf.",
      se: ["06-grafer.html#fane=begreper", "Grafer → Begreper"], m: ["ut-?grad(?:en|er|ene)?"] },
    topologisk: { ord: "topologisk sortering", tema: "grafer",
      txt: "En rekkefølge av alle nodene i en rettet graf der u kommer før v for hver kant (u, v). Den finnes bare når grafen er en DAG, og det kan finnes flere.",
      se: ["06-grafer.html#fane=topologisk", "Grafer → Topologisk sortering"], m: ["topologiske? (?:sortering(?:en|er)?|ordning(?:en|er)?|rekkefølge(?:n)?)"] },
    sykel: { ord: "sykel", tema: "grafer",
      txt: "En sti som kommer tilbake til der den startet. I en urettet graf trengs minst tre noder; i en rettet graf holder u → v → u.",
      se: ["06-grafer.html#fane=sykler", "Grafer → Sykler"], m: ["sykel(?:en)?", "sykler(?:ne)?"] },
    asyklisk: { ord: "asyklisk", tema: "grafer",
      txt: "Uten sykler. En rettet asyklisk graf kalles en DAG.",
      se: ["06-grafer.html#fane=begreper", "Grafer → Begreper"], m: ["asykliske?"] },
    naboliste: { ord: "naboliste", forveks: "Må ikke forveksles med nabomatrise, en |V| × |V|-tabell som bruker O(|V|²) plass uansett hvor mange kanter grafen har.", tema: "grafer",
      txt: "For hver node lagrer vi en liste over naboene. Det tar O(|V| + |E|) plass, og kjøretidene i kurset regner med den.",
      se: ["06-grafer.html#fane=begreper", "Grafer → Begreper"], m: ["naboliste(?:n|r|ne)?"] },
    nabomatrise: { ord: "nabomatrise", forveks: "Må ikke forveksles med naboliste, der hver node bare lagrer naboene sine, så plassen blir O(|V| + |E|).", tema: "grafer",
      txt: "En |V| × |V|-tabell der plass [u][v] sier om det går en kant fra u til v. Det tar O(|V|²) plass.",
      se: ["06-grafer.html#fane=begreper", "Grafer → Begreper"], m: ["nabomatrise(?:n|r|ne)?"] },
    relaksere: { ord: "relaksere en kant", tema: "grafer",
      txt: "Er dist[u] + w(u, v) < dist[v], har vi funnet en kortere vei til v via u, og vi oppdaterer dist[v]. Forelesningsnotatet om grafalgoritmer kaller det edge relaxation.",
      se: ["06-grafer.html#fane=dijkstra", "Grafer → Dijkstra"], m: ["relakser(?:e|er|es|ing(?:en)?|t)"] },
    spenntre: { ord: "spenntre", tema: "grafer",
      txt: "Et tre med alle nodene i en sammenhengende, urettet graf og bare kanter fra grafen. Det har |V| − 1 kanter.",
      se: ["06-grafer.html#fane=mst", "Grafer → Minimalt spenntre"], m: ["spenntr(?:e|eet|ær|ærne)"] },
    mst: { ord: "MST", forveks: "Må ikke forveksles med korteste vei. Et minimalt spenntre har minst mulig total vekt, men veien mellom to noder i treet er ikke alltid den korteste.", full: "minimum spanning tree", navn: "minimalt spenntre", tema: "grafer",
      txt: "Et spenntre der summen av kantvektene er så liten som mulig. Prim og Kruskal finner det.",
      se: ["06-grafer.html#fane=mst", "Grafer → Minimalt spenntre"], mc: ["MST(?!-k)(?:-et)?"], m: ["minimal(?:t|e) spenntr(?:e|eet|ær|ærne)"] },
    scc: { ord: "SCC", full: "strongly connected component", navn: "sterkt sammenhengende komponent", tema: "grafer",
      txt: "En størst mulig gruppe noder i en rettet graf der alle kan nå alle. Kosaraju finner alle i O(|V| + |E|).",
      se: ["06-grafer.html#fane=scc", "Grafer → Sterke komponenter"], mc: ["SCC(?!-k)(?:-er|-ene)?"], m: ["sterkt sammenhengende komponent(?:en|er|ene)?"] },
    tilbakekant: { ord: "tilbakekant", tema: "grafer",
      txt: "I et dybde-først søk i en urettet graf: en kant til en node som allerede ligger i DFS-treet, altså en kant som peker tilbake opp i treet.",
      se: ["06-grafer.html#fane=sammenheng", "Grafer → Sammenheng"], m: ["tilbakekant(?:en|er|ene)?"] },
    separasjonsnode: { ord: "separasjonsnode", tema: "grafer",
      txt: "En node som gjør grafen usammenhengende hvis vi fjerner den (sammen med kantene dens).",
      se: ["06-grafer.html#fane=sammenheng", "Grafer → Sammenheng"], m: ["separasjonsnode(?:n|r|ne)?"] },
    tosammen: { ord: "2-sammenhengende", tema: "grafer",
      txt: "En sammenhengende graf er 2-sammenhengende når den henger sammen uansett hvilken node vi fjerner, altså når den ikke har noen separasjonsnoder.",
      se: ["06-grafer.html#fane=sammenheng", "Grafer → Sammenheng"], m: ["[2k]-sammenhengende"] },
    gradig: { ord: "grådig", tema: "strategi",
      txt: "En grådig algoritme tar det valget som ser best ut akkurat nå, og angrer det aldri. Dijkstra, Prim og Kruskal er grådige.",
      se: ["07-strategi.html#fane=strategier", "Strategi → Strategier"], m: ["grådige?"] },

    /* ---------- Strategi og kompleksitet ---------- */
    avgjorelse: { ord: "avgjørelsesproblem", tema: "strategi",
      txt: "Et problem der svaret på hver instans er JA eller NEI.",
      se: ["07-strategi.html#fane=pnp", "Strategi → P og NP"], m: ["avgjørelsesproblem(?:et|er|ene)?"] },
    polynomiell: { ord: "polynomiell tid", tema: "strategi",
      txt: "Kjøretid O(nᵏ) for en fast k, for eksempel O(n) eller O(n³). O(2ⁿ) er ikke polynomiell.",
      se: ["07-strategi.html#fane=pnp", "Strategi → P og NP"], m: ["polynomiel(?:l|t|le) tid"] },
    sertifikat: { ord: "sertifikat", tema: "strategi",
      txt: "Et løsningsforslag som viser at svaret er JA, og som kan sjekkes i polynomiell tid.",
      se: ["07-strategi.html#fane=pnp", "Strategi → P og NP"], m: ["sertifikat(?:et|er|ene)?"] },
    reduksjon: { ord: "reduksjon", forveks: "Må ikke forveksles med motsatt retning. Reduserer man A til B, er B minst like vanskelig som A.", tema: "strategi",
      txt: "En oversettelse i polynomiell tid fra instanser av A til instanser av B, der JA blir JA og NEI blir NEI. Da er B minst like vanskelig som A.",
      se: ["07-strategi.html#fane=pnp", "Strategi → P og NP"], m: ["reduksjon(?:en|er|ene)?"] },
    np: { ord: "NP", forveks: "Må ikke forveksles med «ikke polynomiell». NP står for nondeterministic polynomial time, og alle problemer i P er også i NP.", tema: "strategi",
      txt: "Avgjørelsesproblemene der et JA-svar kan sjekkes i polynomiell tid når vi får et sertifikat.",
      se: ["07-strategi.html#fane=pnp", "Strategi → P og NP"], mc: ["NP(?!-)"] },
    nphardt: { ord: "NP-hardt", forveks: "Må ikke forveksles med NP-komplett. Et NP-hardt problem trenger ikke selv å være i NP.", tema: "strategi",
      txt: "Minst like vanskelig som alle problemer i NP: alt i NP kan reduseres til det. Problemet trenger ikke selv ligge i NP.",
      se: ["07-strategi.html#fane=pnp", "Strategi → P og NP"], mc: ["NP-hard(?:t|e)"] },
    npkomplett: { ord: "NP-komplett", forveks: "Må ikke forveksles med NP-hardt. Et NP-komplett problem er NP-hardt og i tillegg selv i NP.", tema: "strategi",
      txt: "Både i NP og NP-hardt: de vanskeligste problemene i NP, for eksempel SAT.",
      se: ["07-strategi.html#fane=pnp", "Strategi → P og NP"], mc: ["NP-komplett(?:e)?"] }
  };

  var TEMA = [
    ["grunn", "Grunnbegreper"], ["sortering", "Sortering"], ["lister", "Lister, stakk og kø"],
    ["traer", "Trær"], ["heap", "Heap og prioritetskø"], ["hashing", "Hashing"],
    ["grafer", "Grafer"], ["strategi", "Strategi og kompleksitet"]
  ];

  IN.BEGREPER = { list: B, TEMA: TEMA };
})();
