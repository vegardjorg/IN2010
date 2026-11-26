/* ============================================================
   IN2010 guide · data-pugg.js
   Kortstokkene til puggekortene (IN.PUGG), bygget når siden lastes.
   Kjøretider, stabil og in-place hentes fra bigO i data-*.js, og begrepene
   fra IN.BEGREPER (begreper-data.js). Rettes noe der, følger kortene med,
   og pugg.js tar kortet inn i bunken igjen fordi innholdet er endret.
   Krever: data-algos, data-heap, data-grafer, data-hashing, data-traer,
   data-lister, data-sok og begreper-data lastet før denne fila.
   ============================================================ */
(function () {
  "use strict";
  var IN = window.IN;
  if (!IN || !IN.algos) return;
  var A = IN.algos;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function o(v) { return '<span class="mono">' + esc(v) + "</span>"; }
  function rad(lbl, v) { return v ? "<p><b>" + lbl + ":</b> " + o(v) + "</p>" : ""; }

  /* [nøkkel i IN.algos, navn på kortet] – bare algoritmer kurset bruker som egne punkter */
  var SORT = [
    ["selectionSort", "Selection sort"], ["bubbleSort", "Bubble sort"], ["insertionSort", "Insertion sort"],
    ["mergeSort", "Merge sort"], ["quickSort", "Quicksort"], ["heapSort", "Heapsort"],
    ["bucketSort", "Bucket sort"], ["radixSort", "Radix sort"]
  ];
  var OPS = [
    ["linearSearch", "Rett-frem søk i et array"], ["binarySearch", "Binærsøk i et sortert array"],
    ["lsPushBack", "PushBack i et dynamisk array"], ["lsAdd", "Add på plass i i et dynamisk array"],
    ["lsNodeAt", "NodeAt i en lenket liste"], ["lsInsertAfter", "InsertAfter i en lenket liste"],
    ["heapInsert", "Insert i en heap"], ["buildMinHeap", "BuildMinHeap (heap av et helt array)"],
    ["bstSearch", "Søk i et binært søketre"], ["bstInsert", "Innsetting i et binært søketre"],
    ["bstRemove", "Fjerning i et binært søketre"], ["avlInsert", "Innsetting i et AVL-tre"],
    ["avlRemove", "Fjerning i et AVL-tre"], ["inorder", "Inorder-traversering"],
    ["hsChainGet", "Oppslag med Separate chaining"], ["hsProbeInsert", "Innsetting med Linear probing"],
    ["hsRehash", "Rehash"]
  ];
  var GRAF = [
    ["bfsFull", "Bredde-først søk (BFS)"], ["dfsFull", "Dybde-først søk (DFS)"],
    ["topSort", "Topologisk sortering"], ["dijkstra", "Dijkstra"], ["bellmanFord", "Bellman-Ford"],
    ["prim", "Prim"], ["kruskal", "Kruskal"], ["scc", "Sterkt sammenhengende komponenter (Kosaraju)"],
    ["hasCycle", "Har en urettet graf en sykel?"], ["sepVertices", "Separasjonsnoder"]
  ];

  function finnes(par) { return A[par[0]] && A[par[0]].bigO; }

  var sortTid = SORT.filter(finnes).map(function (p) {
    var b = A[p[0]].bigO;
    return { id: p[0], navn: p[1], a: "<b>" + p[1] + "</b><p class=\"muted\">Best, snitt og verst?</p>",
      b: rad("Best", b.best) + rad("Snitt", b.avg) + rad("Verst", b.worst) };
  });
  var opsTid = OPS.filter(finnes).map(function (p) {
    var b = A[p[0]].bigO;
    return { id: p[0], navn: p[1], a: "<b>" + p[1] + "</b><p class=\"muted\">Kjøretid?</p>",
      b: rad("Best", b.best) + rad("Snitt", b.avg) + rad("Verst", b.worst) };
  });
  var grafTid = GRAF.filter(finnes).map(function (p) {
    var b = A[p[0]].bigO;
    return { id: p[0], navn: p[1], a: "<b>" + p[1] + "</b><p class=\"muted\">Kjøretid i verste tilfelle?</p>",
      b: rad("Verst", b.worst) };
  });
  var stabil = SORT.filter(function (p) { return finnes(p) && typeof A[p[0]].bigO.stable === "boolean"; }).map(function (p) {
    var b = A[p[0]].bigO;
    return { id: p[0], navn: p[1], a: "<b>" + p[1] + "</b><p class=\"muted\">Stabil? In-place?</p>",
      b: "<p><b>Stabil:</b> " + (b.stable ? "ja" : "nei") + "</p><p><b>In-place:</b> " + (b.inplace ? "ja" : "nei") + "</p>" };
  });

  /* Begreper: ord → forklaring, og omvendt. I spørsmålet skjules ordet i forklaringen. */
  var begreper = [];
  var BG = (IN.BEGREPER && IN.BEGREPER.list) || {};
  Object.keys(BG).forEach(function (key) {
    var g = BG[key];
    if (!g || !g.ord || !g.txt) return;
    var maske = g.txt, mønstre = [];
    function legg(src, flagg) { try { mønstre.push(new RegExp(src, flagg)); } catch (e) { /* hopp over */ } }
    legg(g.ord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    (g.m || []).forEach(function (s) { if (!/^O\\\(/.test(s)) legg(s, "gi"); });
    (g.mc || []).forEach(function (s) { legg(s, "g"); });
    mønstre.forEach(function (re) { maske = maske.replace(re, "…"); });
    var tittel = "<b>" + esc(g.ord) + "</b>" + (g.full ? ' <span class="muted">(' + esc(g.full) + ")</span>" : "");
    var svar = (g.navn ? "<p><i>" + esc(g.navn) + "</i></p>" : "") + "<p>" + esc(g.txt) + "</p>";
    begreper.push({ id: key, navn: g.ord, a: tittel, b: { html: svar, foran: "<p>" + esc(maske) + "</p>" } });
  });

  IN.PUGG = [
    { id: "sortering-tid", tittel: "Kjøretid: sortering",
      intro: "<p>Best, snitt og verst for sorteringsalgoritmene i pensum. Tallene hentes fra sorteringssiden, så kortene følger med hvis noe rettes der.</p>",
      kort: sortTid },
    { id: "stabil", tittel: "Stabil og in-place",
      intro: "<p>Stabil: like nøkler beholder rekkefølgen. In-place: sorterer i selve arrayet uten en ekstra datastruktur.</p>",
      kort: stabil },
    { id: "operasjoner", tittel: "Kjøretid: operasjoner",
      intro: "<p>Søk, lister, heap, søketrær og hashing. Ved hashing betyr «forventet» snittet med en god hashfunksjon.</p>",
      kort: opsTid },
    { id: "grafer-tid", tittel: "Kjøretid: grafer",
      intro: "<p>Verste tilfelle med naboliste. |V| er antall noder og |E| antall kanter.</p>",
      kort: grafTid },
    { id: "begreper", tittel: "Begreper", vend: true, retning: ["Ord → forklaring", "Forklaring → ord"],
      intro: "<p>Samme forklaringer som i ordlista på Begreper-siden. Øv begge veier.</p>",
      kort: begreper }
  ];
})();
