/* ============================================================
   IN2010 guide · data-dra.js
   Dra-og-plasser-øvinger (motor: dra.js, portert fra IN2090-guiden).
   Én øving per tema, under «Test deg selv». Verten er <div id="dra-<tema>"> i temaets testfane;
   finnes den ikke på siden, hoppes øvingen over.
   Kjøretider og stabil/ikke stabil skal stemme med bigO i data-*.js.
   ============================================================ */
(function () {
  "use strict";
  var IN = window.IN;
  if (!IN || !IN.dragTask) return;
  function o(s) { return '<span class="mono">' + s + "</span>"; }

  var DRA = {
    sortering: {
      id: "stabil", mode: "bucket",
      prompt: "<p>Hvilke sorteringsalgoritmer er <b>stabile</b>? Stabil betyr at like nøkler beholder rekkefølgen de hadde før sorteringen.</p>",
      zones: [{ id: "ja", label: "Stabil" }, { id: "nei", label: "Ikke stabil" }],
      items: [
        { id: "selection", html: "Selection sort", explain: "Byttet flytter elementet som sto på plass i langt bakover, og det kan da hoppe forbi et likt element." },
        { id: "bubble", html: "Bubble sort", explain: "Bytter bare naboer, og bare når den venstre er strengt større. Like elementer bytter aldri plass." },
        { id: "insertion", html: "Insertion sort", explain: "Flytter et element bare forbi elementer som er strengt større, så like elementer beholder rekkefølgen." },
        { id: "merge", html: "Merge sort", explain: "Når to elementer er like, tar fletten først fra venstre halvdel. Da beholdes rekkefølgen." },
        { id: "quick", html: "Quicksort", explain: "Partisjoneringen bytter elementer over lange avstander, så like elementer kan bytte rekkefølge." },
        { id: "heap", html: "Heapsort", explain: "Roten byttes med det siste elementet i heapen. Det flytter elementer langt og kan stokke om like nøkler." },
        { id: "bucket", html: "Bucket sort", explain: "Elementene legges i bøttene i rekkefølge og hentes ut i samme rekkefølge." },
        { id: "radix", html: "Radix sort", explain: "Hver runde sorterer på ett siffer med en stabil bøttesortering. Radix sort virker bare fordi hver runde er stabil." }
      ],
      answer: { selection: "nei", bubble: "ja", insertion: "ja", merge: "ja", quick: "nei", heap: "nei", bucket: "ja", radix: "ja" }
    },

    lister: {
      id: "kjoretid", mode: "bucket",
      prompt: "<p>Plasser operasjonene etter kjøretid i <b>verste tilfelle</b>. n er antall elementer i lista.</p>",
      zones: [{ id: "o1", label: o("O(1)") }, { id: "on", label: o("O(n)") }],
      items: [
        { id: "get", html: "Get(i) i et dynamisk array", explain: "Adressen til plass i regnes ut direkte, uansett hvor stort arrayet er." },
        { id: "popback", html: "PopBack i et dynamisk array", explain: "Siste plass fjernes uten at noe annet flyttes." },
        { id: "pushback", html: "PushBack i et dynamisk array", explain: "Er arrayet fullt, må alt kopieres over i et større array. Det tar O(n), selv om det skjer sjelden." },
        { id: "add", html: "Add på plass i i et dynamisk array", explain: "Alt fra plass i og ut til slutten må flyttes én plass mot høyre." },
        { id: "nodeat", html: "NodeAt(i) i en lenket liste", explain: "Man må følge pekerne fra starten, node for node, fram til plass i." },
        { id: "insertafter", html: "InsertAfter når noden er gitt", explain: "Bare noen få pekere endres. Ingen andre noder flyttes." },
        { id: "removeafter", html: "RemoveAfter når noden er gitt", explain: "Pekeren hoppes forbi den fjernede noden. Ingen andre noder flyttes." }
      ],
      answer: { get: "o1", popback: "o1", pushback: "on", add: "on", nodeat: "on", insertafter: "o1", removeafter: "o1" }
    },

    heap: {
      id: "removemin", mode: "sort",
      prompt: "<p>Sett stegene i <b>RemoveMin</b> i en min-heap (lagret i et array) i riktig rekkefølge.</p>",
      items: [
        { id: "a", html: "Ta vare på roten. Den er det minste elementet." },
        { id: "b", html: "Flytt det siste elementet opp i roten, og gjør heapen ett element mindre." },
        { id: "c", html: "Sammenlign elementet med det minste av barna." },
        { id: "d", html: "Er elementet større enn dette barnet, bytt plass med det." },
        { id: "e", html: "Gjenta nedover til elementet ikke har noe mindre barn." },
        { id: "f", html: "Returner det minste elementet du tok vare på." }
      ],
      answer: ["a", "b", "c", "d", "e", "f"],
      oppsummering: "<p>Bytt alltid med det <b>minste</b> barnet. Ellers kan det minste barnet havne under et større element.</p>"
    },

    traer: {
      id: "traversering", mode: "match",
      prompt: "<p>Koble hver traversering til rekkefølgen den besøker nodene i.</p>",
      zones: [
        { id: "pre", label: "Preorder" }, { id: "in", label: "Inorder" },
        { id: "post", label: "Postorder" }, { id: "level", label: "Level-order" }
      ],
      items: [
        { id: "a", html: "Noden først, så venstre og høyre subtre", explain: "Pre = før: noden besøkes før barna." },
        { id: "b", html: "Venstre subtre, så noden, så høyre subtre", explain: "In = i midten. I et binært søketre gir det nøklene i sortert rekkefølge." },
        { id: "c", html: "Venstre og høyre subtre, noden til slutt", explain: "Post = etter: noden besøkes etter barna." },
        { id: "d", html: "Nivå for nivå fra roten, med en kø", explain: "Som bredde-først søk: alle noder på ett nivå før neste nivå." }
      ],
      answer: { a: "pre", b: "in", c: "post", d: "level" }
    },

    hashing: {
      id: "kollisjoner", mode: "bucket",
      prompt: "<p>Hvilken måte å løse kollisjoner på passer beskrivelsen?</p>",
      zones: [{ id: "chain", label: "Separate chaining" }, { id: "probe", label: "Linear probing" }],
      items: [
        { id: "a", html: "Hver plass i arrayet har en liste med par", explain: "Alle par med samme hashverdi ligger i lista på den plassen." },
        { id: "b", html: "Ved kollisjon prøves neste plass, så den etter, osv.", explain: "Man leter videre i arrayet til man finner en ledig plass." },
        { id: "c", html: "Load factor kan bli større enn 1", explain: "Listene kan bli lange, så det kan ligge flere par enn det finnes plasser." },
        { id: "d", html: "Alle par ligger direkte i arrayet", explain: "Det finnes ingen lister. Hvert par har sin egen plass i arrayet." },
        { id: "e", html: "Arrayet må gjøres større før det blir fullt", explain: "Med en plass per par er det ikke plass til flere par enn det finnes plasser." }
      ],
      answer: { a: "chain", b: "probe", c: "chain", d: "probe", e: "probe" }
    },

    grafer: {
      id: "problem", mode: "bucket",
      prompt: "<p>Hvilket problem løser algoritmen?</p>",
      zones: [
        { id: "uvektet", label: "Korteste vei, uvektet graf" },
        { id: "pos", label: "Korteste vei, ingen negative vekter" },
        { id: "neg", label: "Korteste vei, negative vekter tillatt" },
        { id: "mst", label: "Minimalt spenntre" },
        { id: "topo", label: "Rekkefølge der alle kanter peker framover" },
        { id: "scc", label: "Sterkt sammenhengende komponenter" }
      ],
      items: [
        { id: "bfs", html: "Bredde-først søk (BFS)", explain: "Uten vekter er korteste vei færrest kanter, og BFS finner nodene i økende avstand fra start." },
        { id: "dijkstra", html: "Dijkstra", explain: "Tar alltid den nærmeste ubesøkte noden. Det holder bare når ingen kanter er negative." },
        { id: "bellman", html: "Bellman-Ford", explain: "Relakserer alle kanter |V| − 1 ganger, så den tåler negative kanter. En runde til avslører negative sykler." },
        { id: "prim", html: "Prim", explain: "Vokser ett tre fra en startnode med den billigste kanten ut av treet." },
        { id: "kruskal", html: "Kruskal", explain: "Tar kantene fra billigst til dyrest og hopper over dem som ville lage en sykel." },
        { id: "topo", html: "Topologisk sortering", explain: "Virker bare på en rettet graf uten sykler (DAG)." },
        { id: "kosaraju", html: "Kosaraju", explain: "To dybde-først søk: først på grafen, så på den reverserte grafen i rekkefølgen fra stakken etter det første søket." }
      ],
      answer: { bfs: "uvektet", dijkstra: "pos", bellman: "neg", prim: "mst", kruskal: "mst", topo: "topo", kosaraju: "scc" }
    },

    strategi: {
      id: "vekst", mode: "sort",
      prompt: "<p>Sorter kjøretidene fra den som vokser <b>saktest</b> til den som vokser <b>raskest</b> når n blir stor.</p>",
      items: [
        { id: "c", html: o("O(1)") }, { id: "log", html: o("O(log n)") }, { id: "n", html: o("O(n)") },
        { id: "nlog", html: o("O(n log n)") }, { id: "n2", html: o("O(n²)") }, { id: "n3", html: o("O(n³)") },
        { id: "exp", html: o("O(2ⁿ)") }, { id: "fak", html: o("O(n!)") }
      ],
      answer: ["c", "log", "n", "nlog", "n2", "n3", "exp", "fak"],
      oppsummering: "<p>Polynomiske kjøretider, som " + o("O(n³)") + ", regnes som effektive. " + o("O(2ⁿ)") + " og " + o("O(n!)") + " vokser så fort at de bare går for små n.</p>"
    }
  };
  IN.DRA = DRA;

  Object.keys(DRA).forEach(function (tema) {
    var host = document.getElementById("dra-" + tema);
    if (!host) return;
    try { IN.dragTask(host, DRA[tema], { side: IN.pageId ? IN.pageId() : tema }); }
    catch (e) { if (window.console) console.error("[dra] " + tema, e); }
  });
})();
