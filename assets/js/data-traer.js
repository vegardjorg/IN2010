/* ============================================================
   IN2010 guide · data-traer.js  (Blokk 4 · Trær)
   Algoritmedefinisjoner (pseudokode + nivåstyrte linjeforklaringer
   + grenser + Big-O) og steggeneratorer for trær.
   Klassisk script. Lastes etter core.js og pseudocode.js.
   Registrerer på IN.algos / IN.gen uten å overskrive eksisterende nøkler,
   og legger trehjelpere på IN.traer.
   All prosa er egen formulering (parafrasert fra kursmateriale).
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.algos = IN.algos || {};
  IN.gen = IN.gen || {};
  var TR = (IN.traer = IN.traer || {});

  function t(eli5, normal, teknisk) { return { eli5: eli5, normal: normal, teknisk: teknisk }; }
  function reg(obj, key, val) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (window.console && console.warn) console.warn("data-traer.js: «" + key + "» finnes fra før og beholdes.");
      return;
    }
    obj[key] = val;
  }
  function neg(n) { return n < 0 ? "−" + (-n) : String(n); }   // ekte minustegn

  /* ---------------- Trehjelpere ----------------
     Binær node: { id, k, l, r, h }   (h = lagret høyde, løvnode 0)
     Generell node: { id, k, ch: [...] }
     Huffman-node: binær node + { sym, f } */
  function mk(k) { return { id: String(k), k: k, l: null, r: null, h: 0 }; }
  function cl(v) {
    if (!v) return null;
    var c = { id: v.id, k: v.k, l: cl(v.l), r: cl(v.r), h: v.h };
    if (v.sym !== undefined) { c.sym = v.sym; c.f = v.f; }
    if (v.ch) c.ch = v.ch.map(cl);
    return c;
  }
  function hOf(v) { return v ? v.h : -1; }
  function setH(v) { if (v) v.h = 1 + Math.max(hOf(v.l), hOf(v.r)); }
  function fixH(v) { if (!v) return -1; v.h = 1 + Math.max(fixH(v.l), fixH(v.r)); return v.h; }
  function bf(v) { return v ? hOf(v.l) - hOf(v.r) : 0; }
  function fromNested(s) {
    if (!s) return null;
    var v = mk(s[0]); v.l = fromNested(s[1]); v.r = fromNested(s[2]);
    return v;
  }
  function bstIns(v, x) {
    if (!v) return mk(x);
    if (x < v.k) v.l = bstIns(v.l, x); else if (x > v.k) v.r = bstIns(v.r, x);
    return v;
  }
  function bstFrom(keys) { var root = null; (keys || []).forEach(function (x) { root = bstIns(root, x); }); fixH(root); return root; }
  function genFrom(s) {
    var v = { id: String(s[0]), k: s[0], ch: [] };
    for (var i = 1; i < s.length; i++) v.ch.push(genFrom(s[i]));
    return v;
  }
  function inorder(v, out) { if (v) { inorder(v.l, out); out.push(v.k); inorder(v.r, out); } return out; }
  function each(v, fn) { if (v) { fn(v); each(v.l, fn); each(v.r, fn); } }
  function ids(v) { var a = []; each(v, function (n) { a.push(n.id); }); return a; }
  function norm(input) {
    if (input && input.length && input[0] !== null && typeof input[0] === "object") return input[0];
    return { keys: (input || []).slice() };
  }
  function treeOf(o) {
    if (o.tree) { var r = fromNested(o.tree); fixH(r); return r; }
    return bstFrom(o.keys || []);
  }
  function avlLabels(root) {
    var lab = {}, sup = {}, warn = [];
    each(root, function (v) {
      var b = bf(v);
      lab[v.id] = "b=" + neg(b); sup[v.id] = String(v.h);
      if (Math.abs(b) > 1) warn.push(v.id);
    });
    return { lab: lab, sup: sup, warn: warn };
  }
  function rotL(z, heights) { var y = z.r, T1 = y.l; y.l = z; z.r = T1; if (heights) { setH(z); setH(y); } return y; }
  function rotR(z, heights) { var y = z.l, T2 = y.r; y.r = z; z.l = T2; if (heights) { setH(z); setH(y); } return y; }

  TR.mk = mk; TR.clone = cl; TR.fromNested = fromNested; TR.bstFrom = bstFrom; TR.genFrom = genFrom;
  TR.fixHeights = fixH; TR.inorder = function (v) { return inorder(v, []); }; TR.balanceFactor = bf;

  /* Eksempeltrær */
  // Kurstreet: e med barna f (h, i) og g (j)
  TR.KURSTRE = ["e", ["f", ["h"], ["i"]], ["g", ["j"], null]];
  // H2024 LCA-treet: a → {b, c, d, e}; b → f; e → {g, h}; h → j
  TR.LCATRE = ["a", ["b", ["f"]], ["c"], ["d"], ["e", ["g"], ["h", ["j"]]]];

  /* Huffman-koder fra (symbol, frekvens)-par. Venstre kant = 0, høyre = 1.
     Likhet i køen avgjøres av innsettingsrekkefølge (stabilt). */
  TR.huffman = function (pairs) {
    var Q = [], seq = 0, cnt = 0;
    pairs.forEach(function (p) { Q.push({ id: "L" + p[0], k: p[0], sym: p[0], f: p[1], l: null, r: null, h: 0, seq: seq++ }); });
    function sortQ() { Q.sort(function (a, b) { return a.f - b.f || a.seq - b.seq; }); }
    sortQ();
    while (Q.length > 1) {
      var v1 = Q.shift(), v2 = Q.shift();
      Q.push({ id: "N" + (cnt++), k: v1.f + v2.f, f: v1.f + v2.f, l: v1, r: v2, h: 0, seq: seq++ });
      sortQ();
    }
    var root = Q[0] || null, codes = {};
    (function walk(v, code) {
      if (!v) return;
      if (v.sym !== undefined) { codes[v.sym] = code || "0"; return; }
      walk(v.l, code + "0"); walk(v.r, code + "1");
    })(root, "");
    return { root: root, codes: codes };
  };

  /* ============================================================
     BEGREPER: Depth og Height (generelt tre)
     ============================================================ */
  reg(IN.algos, "treDepth", {
    title: "Dybde til en node",
    name: "Depth", params: "v",
    input: "En node v i et tre (kan være null)",
    output: "Antall kanter fra roten ned til v",
    lines: [
      { code: "if v = null then return −1", indent: 1,
        eli5: "Har vi klatret forbi toppen av treet, er det ingen node igjen. Da teller vi «minus én», så toppen selv får 0.",
        normal: "Basistilfellet. Vi har gått forbi roten (roten har ingen forelder).",
        teknisk: "Basistilfellet. Verdien −1 er valgt slik at roten får dybde 1 + (−1) = 0.",
        grense: { q: "Hvorfor −1 og ikke 0?",
          a: t("Roten skal ha dybde 0. Vi legger til 1 hver gang vi går ett hakk opp, så «over roten» må være −1.",
               "Roten kaller Depth(null) og legger til 1. Skal roten få dybde 0, må null gi −1. Med 0 her ville roten fått dybde 1, og alle dybder blir én for store.",
               "Depth(rot) = 1 + Depth(null). Kurset definerer dybden til roten som 0, så Depth(null) = −1. Returnerer vi 0, teller vi noder på stien i stedet for kanter.") } },
      { code: "return 1 + Depth(v.parent)", indent: 1,
        eli5: "Vi tar ett skritt opp til forelderen og legger til én.",
        normal: "Dybden er én mer enn forelderens dybde.",
        teknisk: "Én rekursjon per kant opp til roten, så kjøretiden er O(dybde) ≤ O(h)." }
    ],
    bigO: { best: "O(1)", worst: "O(h)", space: "O(h)",
      why: t("Vi klatrer bare oppover, ett skritt per etasje. Jo dypere noden er, jo flere skritt.",
             "Vi går én kant om gangen opp til roten. Det er like mange kall som dybden til v, og den er høyst h.",
             "Antall kall er dybde(v) + 1, og dybde(v) ≤ h. Rekursjonsstakken er like dyp. For et balansert tre er h = O(log n), for en kjede h = n − 1.") }
  });

  reg(IN.algos, "treHeight", {
    title: "Høyde til en node (generelt tre)",
    name: "Height", params: "v",
    input: "En node v i et tre (kan være null)",
    output: "Antall kanter på den lengste stien fra v ned til en løvnode",
    lines: [
      { code: "h ← −1", indent: 1,
        eli5: "Vi starter på «minus én». Har noden ingen barn, ender den da på 0.",
        normal: "Startverdi for den største barnehøyden vi har sett.",
        teknisk: "Fungerer som høyden til et tomt subtre. En løvnode får dermed (−1) + 1 = 0.",
        grense: { q: "Hvorfor h ← −1 og ikke 0?",
          a: t("En node uten barn skal ha høyde 0. Vi legger til 1 helt til slutt, så vi må starte på −1.",
               "Linja «return h + 1» legger alltid til 1. For en løvnode går løkka null ganger, så h må starte på −1 for at løvnoden skal få høyde 0. Starter vi på 0, får alle løvnoder høyde 1, og hele treet blir én for høyt.",
               "Kurskonvensjonen er høyde(løvnode) = 0 og høyde(tomt tre) = −1, målt i kanter. −1 er mindre enn alle ekte høyder, så den påvirker ikke Max.") } },
      { code: "if v = null then return h", indent: 1,
        eli5: "Er det ingen node her, er høyden −1.",
        normal: "Et tomt tre har høyde −1.",
        teknisk: "Basistilfellet: høyde(null) = −1." },
      { code: "for c ∈ v.children do", indent: 1,
        eli5: "Vi spør hvert barn: hvor høy er du?",
        normal: "Gå gjennom alle barna til v.",
        teknisk: "Hver node besøkes én gang i hele rekursjonen, så totalt O(n)." },
      { code: "h ← Max(h, Height(c))", indent: 2,
        eli5: "Vi husker det høyeste svaret.",
        normal: "Behold den største høyden blant barna.",
        teknisk: "Rekursjonen er en postorder-traversering: barna regnes ut før forelderen." },
      { code: "return h + 1", indent: 1,
        eli5: "Vi er én etasje høyere enn det høyeste barnet.",
        normal: "Høyden er én mer enn den høyeste barnehøyden.",
        teknisk: "Høyde(v) = 1 + maks over barnas høyder, med −1 for ingen barn." }
    ],
    bigO: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(h)",
      why: t("Vi må spørre absolutt alle nodene, ellers kan vi gå glipp av den lengste grenen.",
             "Alle n noder besøkes nøyaktig én gang, uansett hvordan treet ser ut.",
             "Hver node gir ett kall, og arbeidet per node er proporsjonalt med antall barn. Summen av barn er n − 1, så totalt O(n). Stakken blir høyst h + 1 dyp.") }
  });

  /* ============================================================
     TRAVERSERINGER
     ============================================================ */
  var NULLGRENSE = { q: "Hvorfor stoppe på v = null og ikke når v er en løvnode?",
    a: t("Da trenger vi bare ett spørsmål: er det en node her? Det virker for alle noder.",
         "Stopper vi bare på løvnoder, krasjer vi på en node med ett barn: det andre barnet er null, og vi kaller videre på det. Med v = null som stopp dekker samme linje tomt tre, løvnoder og noder med ett barn.",
         "Stopp på null gjør rekursjonen riktig for alle former uten spesialtilfeller. Et binærtre med n noder har n + 1 null-pekere, så disse ekstra kallene koster bare O(n) totalt.") };

  function travBigO(navn) {
    return { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(h)",
      why: t("Vi hilser på hver node nøyaktig én gang. Dobbelt så mange noder tar dobbelt så lang tid.",
             navn + " besøker hver av de n nodene én gang. Rekursjonen husker veien tilbake på kallstakken, som er like dyp som treet.",
             "Hver node gir ett kall med O(1) arbeid, pluss n + 1 null-kall: O(n) totalt. Kallstakken er høyst h + 1 dyp, altså O(log n) for et balansert tre og O(n) for en kjede.") };
  }

  reg(IN.algos, "preorder", {
    title: "Preorder-traversering",
    name: "Preorder", params: "v",
    input: "Roten v til et binærtre (kan være null)",
    output: "Ingenting – hver node besøkes én gang, forelderen før barna",
    lines: [
      { code: "if v = null then return", indent: 1,
        eli5: "Er det ingen node her, er det ingenting å gjøre. Vi snur.",
        normal: "Basistilfellet: et tomt subtre har ingen noder å besøke.",
        teknisk: "Basistilfellet for rekursjonen.", grense: NULLGRENSE },
      { code: "Visit(v)", indent: 1,
        eli5: "Først hilser vi på noden selv, før vi går videre til barna.",
        normal: "Behandle noden, f.eks. skriv ut v.element. I preorder skjer det først.",
        teknisk: "«Pre» betyr før: noden behandles før begge subtrærne. Derfor kommer roten alltid først i rekkefølgen." },
      { code: "Preorder(v.left)", indent: 1,
        eli5: "Så går vi gjennom hele den venstre grenen.",
        normal: "Traverser hele venstre subtre rekursivt.",
        teknisk: "Rekursivt kall. Kallstakken husker at vi skal tilbake til v og ta høyre subtre etterpå." },
      { code: "Preorder(v.right)", indent: 1,
        eli5: "Til slutt hele den høyre grenen.",
        normal: "Traverser hele høyre subtre rekursivt.",
        teknisk: "Når dette kallet returnerer, er hele subtreet til v ferdig." }
    ],
    bigO: travBigO("Preorder")
  });

  reg(IN.algos, "inorder", {
    title: "Inorder-traversering",
    name: "Inorder", params: "v",
    input: "Roten v til et binærtre (kan være null)",
    output: "Ingenting – hver node besøkes én gang, mellom venstre og høyre subtre",
    lines: [
      { code: "if v = null then return", indent: 1,
        eli5: "Er det ingen node her, snur vi.",
        normal: "Basistilfellet: et tomt subtre har ingen noder å besøke.",
        teknisk: "Basistilfellet for rekursjonen.", grense: NULLGRENSE },
      { code: "Inorder(v.left)", indent: 1,
        eli5: "Først går vi gjennom alt til venstre.",
        normal: "Traverser hele venstre subtre først.",
        teknisk: "I et binært søketre er alt i venstre subtre mindre enn v.element, så det skal komme først." },
      { code: "Visit(v)", indent: 1,
        eli5: "Når venstre side er ferdig, hilser vi på noden selv.",
        normal: "Behandle noden mellom de to subtrærne.",
        teknisk: "For et binært søketre gir dette elementene i sortert rekkefølge. Det er grunnlaget for CheckBST og InRange." },
      { code: "Inorder(v.right)", indent: 1,
        eli5: "Til slutt alt til høyre.",
        normal: "Traverser hele høyre subtre.",
        teknisk: "Alt i høyre subtre er større enn v.element i et søketre, så det kommer etter v." }
    ],
    bigO: travBigO("Inorder")
  });

  reg(IN.algos, "postorder", {
    title: "Postorder-traversering",
    name: "Postorder", params: "v",
    input: "Roten v til et binærtre (kan være null)",
    output: "Ingenting – hver node besøkes én gang, barna før forelderen",
    lines: [
      { code: "if v = null then return", indent: 1,
        eli5: "Er det ingen node her, snur vi.",
        normal: "Basistilfellet: et tomt subtre har ingen noder å besøke.",
        teknisk: "Basistilfellet for rekursjonen.", grense: NULLGRENSE },
      { code: "Postorder(v.left)", indent: 1,
        eli5: "Først hele venstre gren.",
        normal: "Traverser venstre subtre.",
        teknisk: "Barna behandles før forelderen." },
      { code: "Postorder(v.right)", indent: 1,
        eli5: "Så hele høyre gren.",
        normal: "Traverser høyre subtre.",
        teknisk: "Etter dette kallet er begge subtrærne ferdige." },
      { code: "Visit(v)", indent: 1,
        eli5: "Helt til slutt hilser vi på noden selv.",
        normal: "Behandle noden etter begge subtrærne. Roten kommer derfor sist.",
        teknisk: "«Post» betyr etter. Mønsteret passer når svaret for v trenger svarene fra barna, som i Height og Diameter." }
    ],
    bigO: travBigO("Postorder")
  });

  reg(IN.algos, "levelOrder", {
    title: "Level-order-traversering (bredde først)",
    name: "LevelOrder", params: "v",
    input: "Roten v til et binærtre (kan være null)",
    output: "Ingenting – nodene besøkes nivå for nivå, fra venstre mot høyre",
    lines: [
      { code: "Q ← new Queue", indent: 1,
        eli5: "Vi lager en kø, som i en butikk: den som kom først, blir betjent først.",
        normal: "En tom kø holder nodene vi har oppdaget, men ikke besøkt ennå.",
        teknisk: "Køen er FIFO (først inn, først ut). Det er den som gir nivå-for-nivå-rekkefølgen." },
      { code: "if v ≠ null then Enqueue(Q, v)", indent: 1,
        eli5: "Roten stiller seg først i køen.",
        normal: "Start med roten i køen, hvis treet ikke er tomt.",
        teknisk: "Et tomt tre gir tom kø, og løkka kjører null ganger." },
      { code: "while Q is not empty do", indent: 1,
        eli5: "Så lenge noen står i køen, fortsetter vi.",
        normal: "Gjenta til køen er tom.",
        teknisk: "Hver node legges i køen nøyaktig én gang, så løkka kjører n ganger." },
      { code: "u ← Dequeue(Q)", indent: 2,
        eli5: "Den som står først i køen, får komme fram.",
        normal: "Ta ut noden som har ventet lengst.",
        teknisk: "Nodene på dybde d tas alltid ut før nodene på dybde d + 1.",
        grense: { q: "Hvorfor en kø og ikke en stakk?",
          a: t("I en kø kommer den som kom først, først. Da tar vi ett nivå om gangen. En stakk tar alltid den som kom sist, og da løper vi nedover en gren i stedet.",
               "Køen gir nodene tilbake i den rekkefølgen de ble oppdaget, altså nivå for nivå. Med en stakk tas den sist oppdagede ut først, og vi går dypt før bredt. Det blir en dybde-først-rekkefølge, ikke level-order. Sensor trakk poeng for dette i H2025.",
               "FIFO bevarer invarianten at køen inneholder nodene på dybde d foran nodene på dybde d + 1. LIFO bryter den og gir en preorder-lignende rekkefølge.") } },
      { code: "Visit(u)", indent: 2,
        eli5: "Vi hilser på noden.",
        normal: "Behandle noden, f.eks. legg u.element bakerst i resultatlista.",
        teknisk: "O(1) arbeid per node." },
      { code: "if u.left ≠ null then Enqueue(Q, u.left)", indent: 2,
        eli5: "Har noden et venstre barn, stiller barnet seg bakerst i køen.",
        normal: "Legg venstre barn bakerst i køen, hvis det finnes.",
        teknisk: "Venstre før høyre gir venstre-til-høyre innen hvert nivå. Et tre har ingen sykler, så vi trenger ingen visited-mengde.",
        grense: { q: "Hvorfor sjekke ≠ null før vi legger barnet i køen?",
          a: t("Vi vil ikke stille «ingen» i køen. Da får vi en tom plass når vi tar ut neste gang.",
               "Uten sjekken havner null i køen. Neste Dequeue gir oss da null, og u.left på linja under krasjer. Sensor ga trekk for manglende null-sjekker.",
               "Alternativet er å godta null i køen og sjekke etter Dequeue. Begge er riktige, men en av dem må være med. Ellers prøver vi å lese et felt i null.") } },
      { code: "if u.right ≠ null then Enqueue(Q, u.right)", indent: 2,
        eli5: "Det samme med det høyre barnet.",
        normal: "Legg høyre barn bakerst i køen, hvis det finnes.",
        teknisk: "Høyre barn kommer etter venstre barn i køen og blir derfor besøkt etter det." }
    ],
    bigO: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(n)",
      why: t("Hver node går inn i køen én gang og ut én gang, og vi hilser på den akkurat da. Det tar omtrent like lang tid som å telle nodene.",
             "Hver node legges i køen og tas ut nøyaktig én gang. Køen kan inneholde et helt nivå, og det nederste nivået kan ha rundt halvparten av nodene.",
             "n Enqueue og n Dequeue à O(1) gir O(n). Køen holder høyst bredden av treet. I et komplett binærtre er det nederste nivået omtrent n/2 noder, så minnet er O(n).") }
  });

  /* ============================================================
     ITERATIVE TRAVERSERINGER (egen stakk i stedet for kallstakken)
     Bygger på ukesoppgavene til Forelesning 03 («skriv om uten rekursjon»),
     med samme løsningsidé: preorder med én stakk (høyre før venstre),
     postorder med to stakker, inorder med en markør v og én stakk.
     ============================================================ */
  reg(IN.algos, "iterativePreorder", {
    title: "Preorder uten rekursjon (egen stakk)",
    name: "IterativePreorder", params: "v",
    input: "Roten v til et binærtre (kan være null)",
    output: "Ingenting – nodene besøkes i preorder, samme rekkefølge som den rekursive Preorder",
    lines: [
      { code: "S ← new Stack", indent: 1,
        eli5: "Vi lager en tom bunke med huskelapper. På hver lapp står en node vi ikke har rukket å se på ennå.",
        normal: "En tom stakk S. Den holder nodene vi har funnet, men ikke besøkt ennå.",
        teknisk: "S gjør jobben kallstakken gjorde i den rekursive versjonen: den husker hva som gjenstår. Stakken er LIFO, akkurat som prosedyrekall." },
      { code: "if v ≠ null then Push(S, v)", indent: 1,
        eli5: "Roten legges øverst i bunken, hvis treet ikke er tomt.",
        normal: "Start med roten på stakken. Et tomt tre gir tom stakk, og løkka kjører ikke.",
        teknisk: "Dette tilsvarer det første kallet Preorder(rot)." },
      { code: "while S is not empty do", indent: 1,
        eli5: "Så lenge det ligger lapper i bunken, er vi ikke ferdige.",
        normal: "Gjenta til stakken er tom. Da er alle nodene besøkt.",
        teknisk: "Hver node legges på og tas av nøyaktig én gang, så løkka går n ganger." },
      { code: "u ← Pop(S)", indent: 2,
        eli5: "Vi tar den øverste lappen, altså den vi la sist.",
        normal: "Ta ut noden som ble lagt på sist.",
        teknisk: "LIFO gir dybde først: den sist oppdagede noden behandles først, slik et rekursivt kall ville gjort." },
      { code: "Visit(u)", indent: 2,
        eli5: "Vi hilser på noden med en gang, før barna. Det er det som gjør det til preorder.",
        normal: "Behandle u før barna, som i den rekursive Preorder.",
        teknisk: "Noden besøkes idet den tas av stakken, før noe i subtreet. Det er preorder-egenskapen." },
      { code: "if u.right ≠ null then Push(S, u.right)", indent: 2,
        eli5: "Har noden et høyre barn, legger vi det i bunken først. Det skal vente lengst.",
        normal: "Legg høyre barn på stakken først, hvis det finnes.",
        teknisk: "Høyre barn må ligge under venstre barn på stakken, så det tas ut etter hele venstre subtre.",
        grense: { q: "Hvorfor høyre før venstre, og ikke omvendt?",
          a: t("Bunken gir alltid tilbake den lappen vi la sist. Vil vi ha venstre barn først, må det legges sist, altså oppå det høyre.",
               "En stakk tar ut det som ble lagt på sist. Skal venstre barn besøkes først (som i rekursiv preorder), må det pushes etter høyre barn. Bytter du rekkefølgen, får du node – høyre – venstre, altså en speilvendt preorder.",
               "Push snur rekkefølgen. Push(høyre), Push(venstre) gir Pop(venstre) først, og hele venstre subtre er ferdig før høyre barn kommer til toppen igjen. Speilvendt rekkefølge er nøyaktig det postorder-løsningen med to stakker utnytter.") } },
      { code: "if u.left ≠ null then Push(S, u.left)", indent: 2,
        eli5: "Så legger vi det venstre barnet øverst. Det er det neste vi ser på.",
        normal: "Legg venstre barn på stakken sist, så det tas ut neste gang.",
        teknisk: "Null-sjekken holder null ute av stakken, akkurat som i LevelOrder. Uten den måtte vi sjekke u ≠ null etter Pop." }
    ],
    bigO: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(h)",
      why: t("Hver node legges i bunken én gang og tas ut én gang. I bunken ligger bare de høyre barna som venter, høyst omtrent ett per etasje.",
             "Hver node pushes og poppes nøyaktig én gang, og hver av delene er O(1). Stakken holder høyst ett ventende høyre barn per nivå på veien ned, pluss noden vi står i, altså høyst h + 1 noder.",
             "n Push og n Pop à O(1) gir O(n). Stakken inneholder de ventende høyre barna langs stien fra roten, så den har høyst h + 1 elementer: O(log n) for et balansert tre og O(n) for en kjede. Samme minne i O som kallstakken, men i noen trær er S mye mindre.") }
  });

  reg(IN.algos, "iterativeInorder", {
    title: "Inorder uten rekursjon (markør og stakk)",
    name: "IterativeInorder", params: "v",
    input: "Roten v til et binærtre (kan være null)",
    output: "Ingenting – nodene besøkes i inorder, samme rekkefølge som den rekursive Inorder",
    lines: [
      { code: "S ← new Stack", indent: 1,
        eli5: "Vi lager en tom bunke. Der legger vi nodene vi må tilbake til senere.",
        normal: "En tom stakk S. Den husker nodene som venter på at venstre subtre deres skal bli ferdig.",
        teknisk: "S holder de nodene der den rekursive Inorder har et kall som venter på at Inorder(v.left) skal returnere. Kall som venter på høyre subtre trenger vi ikke huske: de har ingenting igjen å gjøre." },
      { code: "while v ≠ null or S is not empty do", indent: 1,
        eli5: "Vi fortsetter så lenge vi står på en node, eller har noen lapper igjen i bunken.",
        normal: "Gjenta så lenge det er mer å gjøre: enten står markøren v på en node, eller så venter det noder på stakken.",
        teknisk: "v er markøren: noden vi står på nå. Løkka stopper først når vi har falt av treet og ingen forfedre venter.",
        grense: { q: "Hvorfor «or», og ikke bare «while S is not empty»?",
          a: t("Helt i starten er bunken tom, men vi står på roten. Og når vi har tatt den siste lappen og gått til høyre, kan bunken være tom mens det fortsatt er noder igjen der vi står.",
               "Stakken er tom i to situasjoner der vi likevel ikke er ferdige: helt i starten (v er roten), og rett etter at roten er tatt av stakken og vi har gått til høyre (hele høyre subtre gjenstår). Med bare «S is not empty» stopper løkka med en gang, eller den hopper over høyre subtre til roten.",
               "Tilstanden er (v, S): v er subtreet vi ikke har startet på, og S er forfedrene som venter. Vi er ferdige bare når begge er tomme. Å sjekke bare S mister høyre subtre til hver node som tas av en stakk som blir tom. Å kreve begge («and») stopper i første runde.") } },
      { code: "if v ≠ null then", indent: 2,
        eli5: "Står vi på en node?",
        normal: "Står markøren på en node, går vi videre ned mot venstre.",
        teknisk: "Grenen «gå ned til venstre» tilsvarer det rekursive kallet Inorder(v.left)." },
      { code: "Push(S, v)", indent: 3,
        eli5: "Vi kan ikke hilse på noden ennå, for alt til venstre skal komme først. Vi legger den i bunken så vi finner tilbake.",
        normal: "Legg v på stakken. Vi må tilbake hit når venstre subtre er ferdig.",
        teknisk: "Stakken tar vare på v til venstre subtre er ferdig. Det er dette hintet i ukesoppgave 3 peker mot." },
      { code: "v ← v.left", indent: 3,
        eli5: "Så går vi ett steg ned til venstre.",
        normal: "Gå til venstre barn. Det kan være null.",
        teknisk: "Vi går hele venstrekanten ned, én node per runde. Alle nodene på veien havner på stakken." },
      { code: "else", indent: 2,
        eli5: "Står vi på ingenting, har vi gått så langt til venstre som det går.",
        normal: "v er null: det er ikke mer til venstre. Nå skal vi tilbake.",
        teknisk: "Venstre subtre til noden øverst på stakken er ferdig. Det er her rekursjonen ville returnert fra Inorder(v.left)." },
      { code: "v ← Pop(S)", indent: 3,
        eli5: "Vi tar den øverste lappen. Det er den nærmeste noden vi har latt vente.",
        normal: "Hent noden øverst på stakken. Hele venstre subtre til den er besøkt.",
        teknisk: "Toppen av S er den dypeste ventende forfaren, altså den neste noden i inorder." },
      { code: "Visit(v)", indent: 3,
        eli5: "Nå hilser vi på den, for alt til venstre er ferdig.",
        normal: "Besøk v, mellom venstre og høyre subtre.",
        teknisk: "I et binært søketre gir dette stigende rekkefølge, som i den rekursive Inorder." },
      { code: "v ← v.right", indent: 3,
        eli5: "Så går vi over til høyre side av noden og gjør det samme der.",
        normal: "Fortsett i høyre subtre. Er det tomt, blir v null, og neste runde tar vi en ny lapp fra bunken.",
        teknisk: "Høyre subtre behandles som et nytt tre fra start. Noden selv trenger ikke tilbake på stakken, for det gjenstår ingenting i den." }
    ],
    bigO: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(h)",
      why: t("Hver node legges i bunken én gang og tas ut én gang. I bunken ligger bare nodene på veien ned som venter på oss.",
             "Hver node pushes og poppes nøyaktig én gang, og vi følger hver kant høyst én gang nedover. Stakken holder bare forfedre som venter, altså høyst h + 1 noder.",
             "Løkka går nøyaktig 2n runder: n runder med Push og n runder med Pop, hver O(1). Det gir O(n) tid. Stakken er en del av stien fra roten, så O(h) minne, som kallstakken i den rekursive Inorder.") }
  });

  reg(IN.algos, "iterativePostorder", {
    title: "Postorder uten rekursjon (to stakker)",
    name: "IterativePostorder", params: "v",
    input: "Roten v til et binærtre (kan være null)",
    output: "Ingenting – nodene besøkes i postorder, samme rekkefølge som den rekursive Postorder",
    lines: [
      { code: "S ← new Stack", indent: 1,
        eli5: "Vi lager en bunke med noder vi skal se på.",
        normal: "Arbeidsstakken S, som i iterativ preorder.",
        teknisk: "S driver en preorder-lignende gjennomgang." },
      { code: "R ← new Stack", indent: 1,
        eli5: "Og en ekstra bunke der vi samler nodene i omvendt rekkefølge.",
        normal: "Resultatstakken R. Den snur rekkefølgen til slutt.",
        teknisk: "Kursets hint: bruk to stakker. R snur rekkefølgen fra den første løkka." },
      { code: "if v ≠ null then Push(S, v)", indent: 1,
        eli5: "Roten legges i den første bunken.",
        normal: "Start med roten på S, hvis treet ikke er tomt.",
        teknisk: "Samme start som IterativePreorder." },
      { code: "while S is not empty do", indent: 1,
        eli5: "Så lenge det er noe i den første bunken …",
        normal: "Første løkke: gå gjennom alle nodene.",
        teknisk: "Kjører n ganger." },
      { code: "u ← Pop(S)", indent: 2,
        eli5: "Vi tar den øverste noden.",
        normal: "Ta ut noden som ble lagt på sist.",
        teknisk: "Rekkefølgen nodene tas ut i her, er node – høyre – venstre: en speilvendt preorder." },
      { code: "Push(R, u)", indent: 2,
        eli5: "Vi hilser ikke ennå. Vi legger noden i den andre bunken.",
        normal: "Legg u på R i stedet for å besøke den.",
        teknisk: "R får nodene i rekkefølgen node – høyre – venstre. Tatt av fra toppen blir det venstre – høyre – node, som er postorder." },
      { code: "if u.left ≠ null then Push(S, u.left)", indent: 2,
        eli5: "Venstre barn legges i den første bunken først …",
        normal: "Legg venstre barn på S først.",
        teknisk: "Venstre under høyre på S, så høyre tas ut først.",
        grense: { q: "Hvorfor venstre før høyre her, når preorder gjorde det motsatt?",
          a: t("Her vil vi samle nodene baklengs. Da må høyre komme ut av bunken før venstre, og da må venstre legges i først.",
               "Første løkke skal gi node – høyre – venstre, som R snur til venstre – høyre – node. Høyre må derfor ut av S før venstre, og da må venstre pushes først. Med preorder-rekkefølgen her ville R gitt høyre – venstre – node, som er feil.",
               "Postorder er det speilvendte av «node – høyre – venstre». Denne preorder-varianten får vi ved å pushe venstre før høyre. R snur hele sekvensen, så resultatet blir venstre – høyre – node.") } },
      { code: "if u.right ≠ null then Push(S, u.right)", indent: 2,
        eli5: "… og høyre barn oppå, så det kommer ut først.",
        normal: "Legg høyre barn på S sist, så det tas ut neste gang.",
        teknisk: "Null-sjekk som før." },
      { code: "while R is not empty do", indent: 1,
        eli5: "Nå tømmer vi den andre bunken.",
        normal: "Andre løkke: ta nodene av R.",
        teknisk: "Kjører n ganger." },
      { code: "u ← Pop(R)", indent: 2,
        eli5: "Den som ligger øverst, la vi sist. Den tar vi først.",
        normal: "Ta øverste node fra R.",
        teknisk: "Toppen av R er den siste noden fra første løkke, altså den første i postorder." },
      { code: "Visit(u)", indent: 2,
        eli5: "Nå hilser vi, og rekkefølgen blir barna før forelderen.",
        normal: "Besøk u. Nodene kommer i postorder.",
        teknisk: "Roten ble pushet på R først og ligger nederst, så den besøkes sist, slik postorder krever." }
    ],
    bigO: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(n)",
      why: t("Hver node går gjennom begge bunkene én gang. Men den andre bunken må holde alle nodene før vi kan begynne å hilse.",
             "Hver node pushes og poppes én gang på S og én gang på R: O(n). R inneholder alle n nodene etter første løkke, så ekstra minne er O(n), mer enn O(h) for den rekursive Postorder.",
             "2n Push og 2n Pop à O(1) gir O(n). S alene er O(h), men R må holde alle n nodene før første Visit, så totalt O(n) minne. Det finnes varianter med én stakk og O(h) minne, men de er mer fiklete. To stakker er det kursets ukesoppgave foreslår.") }
  });

  /* ============================================================
     BINÆRT SØKETRE
     ============================================================ */
  var HBIGO = function (op) {
    return t("Vi går bare nedover én gren. Et lavt, bredt tre gir få skritt. Et tre som er en lang stige gir mange.",
             op + " følger én sti fra roten og nedover, så kjøretiden er O(h), der h er høyden. Er treet balansert, er h = O(log n). Er det en skjev kjede, er h = n − 1, og da blir det O(n).",
             "Ett rekursivt kall per nivå: O(h) tid og O(h) stakk. Et vanlig binært søketre gir ingen garanti for h, så verste tilfelle er O(n), f.eks. etter innsetting i sortert rekkefølge. Et AVL-tre holder h = O(log n).");
  };

  reg(IN.algos, "bstSearch", {
    title: "Søk i binært søketre",
    name: "Search", params: "v, x",
    input: "Roten v til et binært søketre og en verdi x",
    output: "Noden som inneholder x, eller null hvis x ikke finnes",
    lines: [
      { code: "if v = null then return null", indent: 1,
        eli5: "Har vi gått ut av treet uten å finne tallet, finnes det ikke.",
        normal: "Vi har falt av treet: x finnes ikke.",
        teknisk: "Basistilfellet. Søket har fulgt den eneste stien der x kunne ha ligget, og den endte i null." },
      { code: "if v.element = x then return v", indent: 1,
        eli5: "Er dette tallet vi leter etter? Da er vi ferdige!",
        normal: "Funnet: returner noden.",
        teknisk: "Beste tilfelle er når x ligger i roten: O(1)." },
      { code: "if x < v.element then return Search(v.left, x)", indent: 1,
        eli5: "Er tallet vårt mindre, må det ligge til venstre. Vi går dit.",
        normal: "x er mindre: det kan bare ligge i venstre subtre.",
        teknisk: "Søketre-egenskapen lar oss forkaste hele høyre subtre i ett skritt.",
        grense: { q: "Hvorfor streng ulikhet og ikke ≤ her?",
          a: t("Tilfellet «like» er allerede sjekket på linja over.",
               "Likhet er tatt på linja over, så her er x enten mindre eller større enn v.element. ≤ ville gitt samme svar, men streng ulikhet viser tydelig at de tre tilfellene er skilt fra hverandre.",
               "De tre tilfellene =, mindre og større utelukker hverandre og dekker alt. Dropper man likhetssjekken på linja over og bruker ≤ her, finner man aldri x. Søket går forbi noden og ender i null.") } },
      { code: "return Search(v.right, x)", indent: 1,
        eli5: "Ellers er tallet større, og vi går til høyre.",
        normal: "x er større: let videre i høyre subtre.",
        teknisk: "Halerekursjon. Den kan like gjerne skrives som en while-løkke med O(1) ekstra minne." }
    ],
    bigO: { best: "O(1)", worst: "O(n)", space: "O(h)", why: HBIGO("Search") }
  });

  reg(IN.algos, "bstInsert", {
    title: "Innsetting i binært søketre",
    name: "Insert", params: "v, x",
    input: "Roten v til et binært søketre (kan være null) og en verdi x",
    output: "Roten til treet etter at x er satt inn",
    lines: [
      { code: "if v = null then", indent: 1,
        eli5: "Har vi kommet til en tom plass?",
        normal: "Tom plass funnet: det er her x skal stå.",
        teknisk: "Nye noder settes alltid inn som løvnoder, på null-plassen der et søk etter x ville endt." },
      { code: "v ← new Node(x)", indent: 2,
        eli5: "Da lager vi en ny node med tallet vårt.",
        normal: "Lag en ny node uten barn.",
        teknisk: "Den nye noden returneres på linja nederst og kobles på av forelderen." },
      { code: "else if x < v.element then", indent: 1,
        eli5: "Er tallet mindre enn det som står her, går vi til venstre.",
        normal: "x er mindre: det hører hjemme i venstre subtre.",
        teknisk: "Søketre-egenskapen bestemmer retningen." },
      { code: "v.left ← Insert(v.left, x)", indent: 2,
        eli5: "Vi fortsetter nedover til venstre og henger den nye noden på der.",
        normal: "Sett inn i venstre subtre, og lagre den (kanskje nye) roten til subtreet i v.left.",
        teknisk: "Tilordningen henger det endrede subtreet tilbake på v.",
        grense: { q: "Hvorfor v.left ← Insert(…) og ikke bare Insert(v.left, x)?",
          a: t("Den nye noden må festes til forelderen. Ellers blir den liggende løst og forsvinner.",
               "Når v.left er null, lager kallet en ny node og returnerer den. Uten tilordningen kobles den nye noden aldri på treet, og x går tapt.",
               "Rekursjonen bygger opp en ny peker for hvert subtre. Samme mønster gjør at AVL kan bytte ut roten i et subtre etter en rotasjon.") } },
      { code: "else if x > v.element then", indent: 1,
        eli5: "Er tallet større, går vi til høyre.",
        normal: "x er større: det hører hjemme i høyre subtre.",
        teknisk: "Er x lik v.element, slår ingen av grenene til, og duplikatet ignoreres.",
        grense: { q: "Hvorfor else if x > v.element og ikke bare else?",
          a: t("Hvis tallet finnes fra før, vil vi ikke legge det inn en gang til.",
               "Med else ville like verdier havnet i høyre subtre, og treet fikk duplikater. Med else if x > v.element gjør vi ingenting når x allerede finnes. Treet oppfører seg da som en mengde.",
               "Begge valg kan forsvares, men da må Search og Remove følge samme regel. Kursets versjon ignorerer duplikater, slik at venstre < v < høyre holder strengt.") } },
      { code: "v.right ← Insert(v.right, x)", indent: 2,
        eli5: "Vi fortsetter nedover til høyre.",
        normal: "Sett inn i høyre subtre og koble resultatet på v.right.",
        teknisk: "Speilbildet av venstre-grenen." },
      { code: "return v", indent: 1,
        eli5: "Vi gir beskjed oppover om hvem som står her nå.",
        normal: "Returner roten til subtreet. Forelderen kobler den på igjen.",
        teknisk: "Returverdien er roten til subtreet etter innsetting. I et vanlig BST er det samme node, unntatt når v var null." }
    ],
    bigO: { best: "O(1)", worst: "O(n)", space: "O(h)", why: HBIGO("Insert") }
  });

  reg(IN.algos, "findMin", {
    title: "Finn minste element",
    name: "FindMin", params: "v",
    input: "Roten v til et ikke-tomt binært søketre",
    output: "Noden med minst element",
    lines: [
      { code: "if v.left = null then return v", indent: 1,
        eli5: "Finnes det ingen node til venstre, er dette den minste.",
        normal: "Ingen venstre barn: ingenting er mindre enn v.",
        teknisk: "Det minste elementet er noden lengst til venstre. Den har ikke venstre barn, men kan ha et høyre barn.",
        grense: { q: "Hvorfor sjekke v.left = null og ikke v = null?",
          a: t("Vi vil stoppe på den siste noden, ikke gå ett skritt for langt ut i ingenting.",
               "Sjekker vi v = null, går vi ett skritt for langt og returnerer null i stedet for noden. Vi må stoppe på noden som ikke har noe venstre barn.",
               "Prosedyren forutsetter et ikke-tomt tre. Kalleren (Remove) kaller den bare på v.right når v.right ≠ null.") } },
      { code: "return FindMin(v.left)", indent: 1,
        eli5: "Ellers går vi ett skritt til venstre og leter videre.",
        normal: "Alt mindre ligger til venstre: gå dit.",
        teknisk: "O(h) skritt nedover venstre kant." }
    ],
    bigO: { best: "O(1)", worst: "O(n)", space: "O(h)", why: HBIGO("FindMin") }
  });

  reg(IN.algos, "bstRemove", {
    title: "Fjerning i binært søketre",
    name: "Remove", params: "v, x",
    input: "Roten v til et binært søketre og en verdi x",
    output: "Roten til treet etter at x er fjernet",
    lines: [
      { code: "if v = null then return null", indent: 1,
        eli5: "Fant vi ikke tallet, er det ingenting å fjerne.",
        normal: "x finnes ikke: ingenting endres.",
        teknisk: "Basistilfellet. Et tomt subtre forblir tomt." },
      { code: "if x < v.element then", indent: 1,
        eli5: "Mindre tall ligger til venstre.",
        normal: "Let videre i venstre subtre.",
        teknisk: "Samme veivalg som i Search." },
      { code: "v.left ← Remove(v.left, x)", indent: 2,
        eli5: "Vi fjerner der borte og fester det som er igjen.",
        normal: "Fjern fra venstre subtre, og koble den nye roten til subtreet på v.left.",
        teknisk: "Tilordningen er det som faktisk «klipper ut» noden når den returnerer et barnebarn." },
      { code: "return v", indent: 2,
        eli5: "Denne noden blir stående.",
        normal: "v selv blir stående.",
        teknisk: "Roten i dette subtreet er uendret." },
      { code: "if x > v.element then", indent: 1,
        eli5: "Større tall ligger til høyre.",
        normal: "Let videre i høyre subtre.",
        teknisk: "Speilbildet av venstre-grenen." },
      { code: "v.right ← Remove(v.right, x)", indent: 2,
        eli5: "Vi fjerner der borte og fester det som er igjen.",
        normal: "Fjern fra høyre subtre og koble resultatet på v.right.",
        teknisk: "Som over." },
      { code: "return v", indent: 2,
        eli5: "Denne noden blir stående.",
        normal: "v selv blir stående.",
        teknisk: "Roten i dette subtreet er uendret." },
      { code: "if v.left = null then return v.right", indent: 1,
        eli5: "Vi har funnet noden! Har den ikke noe venstre barn, lar vi det høyre barnet ta plassen.",
        normal: "Funnet, med 0 eller 1 barn (høyre): erstatt v med høyre barn.",
        teknisk: "Høyre barn rykker opp og tar v sin plass. Søketre-egenskapen holder, fordi hele subtreet allerede lå på riktig side av forelderen.",
        grense: { q: "Hvordan dekker denne linja også løvnoder?",
          a: t("En løvnode har ingen barn. Da er det høyre barnet «ingenting», og noden blir bare borte.",
               "Er v en løvnode, er v.left = null og v.right = null. Linja returnerer da null, og forelderen mister barnet. Tilfellene 0 barn og 1 barn (høyre) løses av samme linje.",
               "Rekkefølgen er viktig: vi tester v.left først. Er også v.right null, er v en løvnode. Bare når begge barna finnes, går vi videre til etterfølgeren.") } },
      { code: "if v.right = null then return v.left", indent: 1,
        eli5: "Har den bare et venstre barn, får det barnet plassen.",
        normal: "Funnet, med bare venstre barn: erstatt v med venstre barn.",
        teknisk: "Speilbildet. Her vet vi allerede at v.left ≠ null." },
      { code: "u ← FindMin(v.right)", indent: 1,
        eli5: "Noden har to barn. Vi finner det minste tallet til høyre, som kan ta plassen uten å rote til rekkefølgen.",
        normal: "To barn: finn etterfølgeren, det minste elementet i høyre subtre.",
        teknisk: "Etterfølgeren er større enn alt i venstre subtre og mindre enn resten av høyre subtre. Den passer derfor på v sin plass. Den har ikke venstre barn.",
        grense: { q: "Hvorfor FindMin(v.right) og ikke FindMin(v.left)?",
          a: t("Det minste til høyre er akkurat stort nok: større enn alle til venstre, mindre enn alle andre til høyre.",
               "Det minste i venstre subtre er mindre enn alt annet til venstre, så det ville brutt ordningen der. Kurset bruker det minste i høyre subtre. Det største i venstre subtre ville også fungert.",
               "Erstatteren må ligge mellom venstre og høyre subtre i sortert rekkefølge. Det gjør de to inorder-naboene til v: forgjengeren FindMax(v.left) og etterfølgeren FindMin(v.right).") } },
      { code: "v.element ← u.element", indent: 1,
        eli5: "Vi kopierer det tallet inn i noden vår.",
        normal: "Kopier etterfølgerens verdi inn i v. Et øyeblikk står verdien to steder.",
        teknisk: "Vi bytter verdi, ikke node. Strukturen rundt v er uendret." },
      { code: "v.right ← Remove(v.right, u.element)", indent: 1,
        eli5: "Så fjerner vi den gamle kopien der nede. Den har høyst ett barn, så det er lett.",
        normal: "Fjern den gamle kopien av etterfølgeren fra høyre subtre. Den har ikke venstre barn, så det blir et enkelt tilfelle.",
        teknisk: "Det rekursive kallet ender i tilfellet «v.left = null». Totalt følger vi fortsatt bare to stier av lengde ≤ h, altså O(h)." },
      { code: "return v", indent: 1,
        eli5: "Noden står der fortsatt, nå med nytt tall.",
        normal: "Returner v, som nå har ny verdi.",
        teknisk: "Roten i subtreet er samme node." }
    ],
    bigO: { best: "O(1)", worst: "O(n)", space: "O(h)", why: HBIGO("Remove") }
  });

  reg(IN.algos, "checkBST", {
    title: "Er binærtreet et søketre? (H2022)",
    name: "CheckBST", params: "v, low, high",
    input: "Roten v til et binærtre med unike heltall, og grensene low og high (kall med −∞ og ∞)",
    output: "true hvis treet er et binært søketre, ellers false",
    lines: [
      { code: "if v = null then return true", indent: 1,
        eli5: "Et tomt tre er alltid i orden.",
        normal: "Et tomt subtre bryter ingen regler.",
        teknisk: "Basistilfellet." },
      { code: "if v.element ≤ low or v.element ≥ high then return false", indent: 1,
        eli5: "Tallet må ligge mellom grensene vi har fått ovenfra. Gjør det ikke det, er treet feil.",
        normal: "v.element må ligge strengt mellom low og high. Grensene arves fra alle forfedrene.",
        teknisk: "Invariant: alle noder i subtreet til v må ligge i det åpne intervallet (low, high).",
        grense: { q: "Hvorfor ≤ og ≥, og ikke bare streng ulikhet?",
          a: t("Treet har bare ulike tall. Er et tall likt grensen, er det et duplikat, og det er ikke lov.",
               "Tallene er unike, og et søketre krever venstre < v < høyre. En verdi lik grensen betyr at den er lik en forfeder, og det bryter regelen. Derfor regnes likhet som feil.",
               "Intervallet (low, high) er åpent. Tillater kurset duplikater på én side, må den siden ha et lukket endepunkt.") } },
      { code: "return CheckBST(v.left, low, v.element) and CheckBST(v.right, v.element, high)", indent: 1,
        eli5: "Til venstre må alt være mindre enn dette tallet, til høyre må alt være større. Vi sender med de nye grensene.",
        normal: "Venstre subtre får v.element som ny øvre grense, høyre subtre får den som ny nedre grense.",
        teknisk: "Hver node sjekkes én gang med O(1) arbeid, så totalt O(n). and stopper tidlig ved første feil.",
        grense: { q: "Hvorfor sende med grenser, og ikke bare sjekke v.left.element mindre enn v.element?",
          a: t("Det holder ikke å sjekke barnet. Et barnebarn langt nede kan også være på feil side av en node høyere opp.",
               "Søketre-kravet gjelder hele subtrær, ikke bare direkte barn. Eksempel: rot 5, venstre barn 2 med høyre barn 7. Hver forelder–barn-sjekk er grei, men 7 ligger til venstre for 5. Grensene fanger det.",
               "Barn-sjekken er en nødvendig, men ikke tilstrekkelig betingelse. Grensene koder kravet fra alle forfedrene på én gang, og gir O(n) i stedet for O(n²) med FindMax/FindMin per node.") } }
    ],
    bigO: { best: "O(1)", worst: "O(n)", space: "O(h)",
      why: t("Vi ser på hver node én gang, så tiden vokser i takt med antall noder.",
             "Hver node sjekkes én gang mot to grenser. Det er O(n). Å kalle FindMin og FindMax for hver node ville gitt O(n²).",
             "Kjøretiden er O(n): én konstant sjekk per node. Kallstakken er O(h). Alternativet med inorder til en liste og sjekk av at lista er sortert er også O(n), men bruker O(n) ekstra minne.") }
  });

  reg(IN.algos, "inRange", {
    title: "Skriv ut verdiene i [a, b] (H2021)",
    name: "InRange", params: "v, a, b",
    input: "Roten v til et binært søketre og to tall a ≤ b",
    output: "Ingenting – skriver ut alle elementer x med a ≤ x ≤ b, i stigende rekkefølge",
    lines: [
      { code: "if v = null then return", indent: 1,
        eli5: "Ingen node her: ingenting å skrive.",
        normal: "Basistilfellet.",
        teknisk: "Basistilfellet." },
      { code: "if a < v.element then InRange(v.left, a, b)", indent: 1,
        eli5: "Bare hvis det kan finnes treff til venstre, går vi dit.",
        normal: "Venstre subtre har bare mindre verdier. Det kan inneholde treff bare hvis a < v.element.",
        teknisk: "Beskjæring: er v.element ≤ a, er alt til venstre mindre enn a, og hele subtreet hoppes over.",
        grense: { q: "Hvorfor streng ulikhet og ikke a ≤ v.element?",
          a: t("Er a akkurat lik tallet her, er alt til venstre for lite. Da er det bortkastet å gå dit.",
               "Hvis a = v.element, er alt i venstre subtre mindre enn a, og ingenting der skal skrives ut. Med ≤ ville vi gått ned i et subtre uten treff. Svaret blir fortsatt riktig, men vi gjør unødvendig arbeid.",
               "Streng ulikhet sparer et besøk i et subtre uten treff. O(h + k) kommer av selve beskjæringen og gjelder med begge variantene.") } },
      { code: "if a ≤ v.element and v.element ≤ b then Print(v.element)", indent: 1,
        eli5: "Ligger tallet mellom a og b, skriver vi det ut.",
        normal: "Skriv ut v hvis den ligger i intervallet. Det skjer mellom de to rekursive kallene, altså i inorder.",
        teknisk: "Inorder-plasseringen gjør at utskriften kommer i sortert rekkefølge." },
      { code: "if v.element < b then InRange(v.right, a, b)", indent: 1,
        eli5: "Bare hvis det kan finnes treff til høyre, går vi dit.",
        normal: "Høyre subtre kan bare ha treff hvis v.element < b.",
        teknisk: "Speilbildet av beskjæringen til venstre." }
    ],
    bigO: { best: "O(1)", worst: "O(n)", space: "O(h)",
      why: t("Vi går bare ned der det kan ligge tall i intervallet, og hopper over hele grener som er for små eller for store. Tiden avhenger av hvor høyt treet er, og av hvor mange tall vi finner.",
             "Vi følger to stier nedover, én mot hvert endepunkt av intervallet (O(h)) og besøker i tillegg treffene. Er hele treet i intervallet, blir det O(n). Er a = b i et balansert tre, blir det O(log n).",
             "Kjøretiden er O(h + k), der k er antall utskrevne verdier. Uten beskjæring er det en vanlig inorder på O(n), som H2021 ga mindre uttelling for.") }
  });

  /* ============================================================
     DIAMETER (H2023)
     ============================================================ */
  reg(IN.algos, "treDiameter", {
    title: "Diameteren til et binærtre (H2023)",
    name: "Diameter", params: "v",
    input: "Roten v til et binærtre (kan være null)",
    output: "Et par (h, d): høyden h og diameteren d til treet med rot v",
    lines: [
      { code: "if v = null then return (−1, 0)", indent: 1,
        eli5: "Et tomt tre har høyde «minus én» og ingen sti.",
        normal: "Tomt tre: høyde −1 og diameter 0.",
        teknisk: "Basistilfellet. Med høyde −1 for null blir formelen på linja for d riktig også når et barn mangler.",
        grense: { q: "Hvorfor høyde −1 og ikke 0 for et tomt tre?",
          a: t("En node alene skal ha høyde 0. Den får 1 + det største barnet, så «ingen barn» må telle som −1.",
               "Høyden til en løvnode er 1 + Max(−1, −1) = 0, slik kurset definerer det. Med 0 for null blir alle høyder én for store, og hL + hR + 2 teller to kanter for mye i en løvnode.",
               "−1 er valget som gjør at h = 1 + Max(hL, hR) og stilengden hL + hR + 2 stemmer for 0, 1 og 2 barn uten spesialtilfeller.") } },
      { code: "(hL, dL) ← Diameter(v.left)", indent: 1,
        eli5: "Vi spør venstre side: hvor høy er du, og hvor lang er din lengste sti?",
        normal: "Regn ut høyde og diameter for venstre subtre.",
        teknisk: "Rekursjonen er en postorder: barna regnes ut først." },
      { code: "(hR, dR) ← Diameter(v.right)", indent: 1,
        eli5: "Det samme spør vi høyre side om.",
        normal: "Regn ut høyde og diameter for høyre subtre.",
        teknisk: "Begge svarene kommer fra samme gjennomgang, så ingen høyde regnes ut to ganger." },
      { code: "h ← 1 + Max(hL, hR)", indent: 1,
        eli5: "Denne noden er én etasje høyere enn den høyeste siden.",
        normal: "Høyden til v er én mer enn den høyeste av barnas høyder.",
        teknisk: "Samme formel som i Height. Vi får den gratis her." },
      { code: "d ← Max(hL + hR + 2, dL, dR)", indent: 1,
        eli5: "Den lengste stien er enten en som går gjennom denne noden, eller en som ligger helt inne i den ene siden.",
        normal: "Lengste sti gjennom v er hL + hR + 2. Ellers ligger den lengste stien helt inne i et av subtrærne.",
        teknisk: "Alle stier i subtreet til v går enten gjennom v, eller ligger i v.left eller v.right. Max over de tre dekker alt.",
        grense: { q: "Hvorfor + 2 og ikke + 1?",
          a: t("Vi trenger én kant ned til venstre barn og én kant ned til høyre barn. Det er to kanter.",
               "Stien går fra dypeste node til venstre, opp til v og ned til dypeste node til høyre. Høydene hL og hR teller kantene inne i subtrærne. I tillegg kommer kanten v–venstre barn og kanten v–høyre barn: + 2. Mangler et barn, er høyden −1, og −1 + 2 gir akkurat én kant.",
               "Lengden måles i kanter. Kantene v→v.left og v→v.right legges til høydene. Konvensjonen høyde(null) = −1 gjør at formelen også stemmer når ett eller begge barna mangler.") } },
      { code: "return (h, d)", indent: 1,
        eli5: "Vi gir begge svarene videre opp til forelderen.",
        normal: "Returner høyde og diameter. Svaret på oppgaven er d fra kallet på roten.",
        teknisk: "Én gjennomgang, O(1) arbeid per node: O(n). H2023-sensor ga opptil 8 poeng for lineær løsning og 5 for kvadratisk." }
    ],
    bigO: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(h)",
      why: t("Vi spør hver node bare én gang, og får både høyde og sti tilbake samtidig.",
             "Hver node besøkes én gang, og høyden regnes ut i samme gjennomgang. Det naive alternativet kaller Height på nytt for hver node og blir O(n²) for en skjev kjede.",
             "Kjøretiden er O(n): hvert kall gjør O(1) arbeid utover de to rekursive kallene, og det er O(n) kall (ett per node og ett per tomt barn). Kallstakken er O(h). Den naive versjonen bruker O(n) for hver av n noder i verste fall, altså O(n²).") }
  });

  /* ============================================================
     LAVESTE FELLES FORFEDER (H2024)
     ============================================================ */
  reg(IN.algos, "lca", {
    title: "Laveste felles forfeder (H2024 b)",
    name: "LCA", params: "u, v",
    input: "To noder u og v i samme tre. Hver node kjenner v.parent og v.depth",
    output: "Den laveste noden som har både u og v som etterkommere",
    lines: [
      { code: "if u = v then return u", indent: 1,
        eli5: "Har de to klatrerne møttes i samme node, har vi svaret.",
        normal: "Møttes de? Da er dette den laveste felles forfederen.",
        teknisk: "En node regnes som etterkommer av seg selv, så LCA(u, u) = u." },
      { code: "if u.depth < v.depth then", indent: 1,
        eli5: "Hvem står lengst nede? Den må klatre først.",
        normal: "Sammenlign dybdene. Den dypeste noden skal flyttes opp.",
        teknisk: "Den dypeste av de to kan ikke være forfederen. Å flytte den opp et hakk mister derfor ingen kandidat.",
        grense: { q: "Hvorfor streng ulikhet, og hva skjer når dybdene er like?",
          a: t("Står de like høyt, spiller det ingen rolle hvem som klatrer. Den andre tar igjen neste runde.",
               "Er dybdene like (og u ≠ v), kan ingen av dem være forfederen til den andre. Da går vi til linja nederst og flytter u. Neste runde er v dypest og flyttes. ≤ ville vært like riktig.",
               "Hvert kall senker summen av dybdene med 1. Totalt blir det høyst dybde(u) + dybde(v) ≤ 2h kall, altså O(h).") } },
      { code: "return LCA(u, v.parent)", indent: 2,
        eli5: "v står lengst nede og klatrer ett trinn opp.",
        normal: "v er dypest: flytt v opp til forelderen sin.",
        teknisk: "Rekursivt kall med v byttet ut med forelderen." },
      { code: "return LCA(u.parent, v)", indent: 1,
        eli5: "Ellers klatrer u ett trinn opp.",
        normal: "u er dypest (eller like dyp): flytt u opp.",
        teknisk: "Roten er forfeder til alle, så rekursjonen stopper senest i roten." }
    ],
    bigO: { best: "O(1)", worst: "O(n)", space: "O(h)",
      why: t("De klatrer bare oppover, ett trinn om gangen. Et høyt tre gir flere trinn.",
             "Hvert kall flytter én av nodene ett nivå opp, så det blir O(h) kall. Er treet en kjede, er h = n − 1, altså O(n). Er treet balansert, blir det O(log n).",
             "Antall kall ≤ dybde(u) + dybde(v) + 1 ≤ 2h + 1. En løsning som går gjennom hele treet (O(n)) ga færre poeng i H2024.") }
  });

  reg(IN.algos, "lcaBST", {
    title: "Laveste felles forfeder i et binært søketre (H2024 c)",
    name: "LCABST", params: "v, x, y",
    input: "Roten v til et binært søketre med unike heltall, og x < y som begge finnes i treet",
    output: "Noden som er laveste felles forfeder til nodene med x og y",
    lines: [
      { code: "if x ≤ v.element and v.element ≤ y then return v", indent: 1,
        eli5: "Ligger tallet her mellom x og y, skilles veiene til x og y her. Da er dette svaret.",
        normal: "Splittpunktet: x og y havner på hver sin side av v (eller en av dem er v). Da er v svaret.",
        teknisk: "Over splittpunktet ligger x og y i samme subtre. I splittpunktet skilles stiene.",
        grense: { q: "Hvorfor ≤ og ikke streng ulikhet?",
          a: t("Hvis x selv er forfederen til y, er svaret x. Da må vi godta at tallet er likt x.",
               "Er v.element = x, er v forfeder til y (y ligger i høyre subtre), og v er svaret. Streng ulikhet ville sendt søket forbi v og ned i et subtre som bare inneholder én av dem.",
               "Kurset definerer en node som etterkommer av seg selv. Derfor er endepunktene med i intervallet [x, y].") } },
      { code: "if y < v.element then return LCABST(v.left, x, y)", indent: 1,
        eli5: "Er begge tallene mindre, må svaret ligge til venstre.",
        normal: "Begge er mindre enn v.element (siden x < y): gå til venstre.",
        teknisk: "Holder y < v.element, holder også x < v.element." },
      { code: "return LCABST(v.right, x, y)", indent: 1,
        eli5: "Ellers er begge større, og vi går til høyre.",
        normal: "Begge er større enn v.element: gå til høyre.",
        teknisk: "Én sti fra roten: O(h)." }
    ],
    bigO: { best: "O(1)", worst: "O(n)", space: "O(h)",
      why: t("Vi går én vei nedover fra toppen, så det tar like mange skritt som treet er høyt.",
             "Vi følger én sti fra roten til splittpunktet: O(h). Det er O(n) for en kjede og O(log n) for et balansert tre.",
             "Som Search: ett kall per nivå. Halerekursjonen kan skrives som en løkke med O(1) minne.") }
  });

  /* ============================================================
     AVL
     ============================================================ */
  reg(IN.algos, "safeHeight", {
    title: "Høyde som tåler null",
    name: "SafeHeight", params: "v",
    input: "En node v i et AVL-tre (kan være null)",
    output: "Høyden lagret i v, eller −1 for et tomt tre",
    lines: [
      { code: "if v = null then return −1", indent: 1,
        eli5: "Et tomt tre har høyde −1.",
        normal: "Et tomt subtre har høyde −1.",
        teknisk: "Hindrer null-feil når et barn mangler.",
        grense: { q: "Hvorfor −1 og ikke 0?",
          a: t("En løvnode skal ha høyde 0, og den er én høyere enn de tomme barna sine.",
               "En løvnode får 1 + Max(−1, −1) = 0. Med 0 for null ville en løvnode fått høyde 1. Balansefaktoren blir riktig uansett (forskjellen endres ikke), men høydene stemmer ikke med kursets definisjon.",
               "Kurskonvensjon: høyde(null) = −1, høyde(løvnode) = 0, målt i kanter.") } },
      { code: "return v.height", indent: 1,
        eli5: "Ellers står høyden skrevet på noden.",
        normal: "Høyden er lagret i noden, så vi slipper å regne den ut.",
        teknisk: "O(1). Det er hele poenget med å lagre høyden i hver node." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("Vi bare leser en lapp på noden.", "Bare ett oppslag.", "Konstant arbeid, ingen rekursjon.") }
  });

  reg(IN.algos, "setHeight", {
    title: "Oppdater høyden i en node",
    name: "SetHeight", params: "v",
    input: "En node v der barnas høyder er riktige",
    output: "Ingenting – v.height er oppdatert",
    lines: [
      { code: "if v ≠ null then", indent: 1,
        eli5: "Bare hvis det finnes en node her.",
        normal: "Ingenting å oppdatere for et tomt tre.",
        teknisk: "Gjør at Remove kan kalle SetHeight også når subtreet ble tomt." },
      { code: "v.height ← 1 + Max(SafeHeight(v.left), SafeHeight(v.right))", indent: 2,
        eli5: "Noden er én høyere enn det høyeste barnet.",
        normal: "Ny høyde er én mer enn den største barnehøyden.",
        teknisk: "Forutsetter at barnas høyder er oppdatert først. Derfor kalles den nedenfra og opp." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("Vi ser bare på to barn.", "To oppslag og en sammenligning.", "Konstant arbeid.") }
  });

  reg(IN.algos, "balanceFactor", {
    title: "Balansefaktor",
    name: "BalanceFactor", params: "v",
    input: "En node v i et AVL-tre (kan være null)",
    output: "Høyden til venstre subtre minus høyden til høyre subtre",
    lines: [
      { code: "if v = null then return 0", indent: 1,
        eli5: "Et tomt tre er i balanse.",
        normal: "Et tomt tre er balansert.",
        teknisk: "Lar Balance kalles trygt på null." },
      { code: "return SafeHeight(v.left) − SafeHeight(v.right)", indent: 1,
        eli5: "Vi trekker høyre høyde fra venstre høyde. Positivt betyr tungt til venstre, negativt tungt til høyre.",
        normal: "Positiv: venstretung. Negativ: høyretung. 0: helt i balanse. AVL krever at den er −1, 0 eller 1.",
        teknisk: "AVL-invarianten er |BalanceFactor(v)| ≤ 1 for alle noder.",
        grense: { q: "Hvorfor venstre − høyre og ikke høyre − venstre?",
          a: t("Det er bare en avtale, men alle må følge samme avtale.",
               "Kurset bruker venstre − høyre. Da betyr under −1 «for tungt til høyre», og Balance svarer med en venstrerotasjon. Snur du fortegnet, må alle testene i Balance snus også. Ellers roterer du feil vei.",
               "Konvensjonen bestemmer fortegnet i testene i Balance. Bland aldri de to innenfor samme svar.") } }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("To lapper og et minustegn.", "To oppslag.", "Konstant arbeid.") }
  });

  function rotLines(dir) {
    var L = dir === "L";
    var side = L ? "right" : "left", other = L ? "left" : "right", Tn = L ? "T1" : "T2";
    return [
      { code: "y ← z." + side, indent: 1,
        eli5: "Barnet på " + (L ? "høyre" : "venstre") + " side skal bli den nye toppen.",
        normal: "y er " + (L ? "høyre" : "venstre") + " barn av z og blir ny rot i subtreet.",
        teknisk: "Rotasjonen løfter y ett nivå opp og senker z ett nivå ned." },
      { code: Tn + " ← y." + other, indent: 1,
        eli5: "Vi tar vare på grenen som må flytte.",
        normal: Tn + " er subtreet som må bytte forelder.",
        teknisk: "Alle verdier i " + Tn + " ligger mellom z og y, og derfor kan det henge på z sin " + (L ? "høyre" : "venstre") + " side etterpå." },
      { code: "y." + other + " ← z", indent: 1,
        eli5: "Den gamle toppen blir barnet til den nye.",
        normal: "z blir " + (L ? "venstre" : "høyre") + " barn av y.",
        teknisk: "Søketre-egenskapen holder: z " + (L ? "er mindre" : "er større") + " enn y." },
      { code: "z." + side + " ← " + Tn, indent: 1,
        eli5: "Grenen vi tok vare på, henger vi på den gamle toppen.",
        normal: Tn + " henges på den ledige plassen hos z.",
        teknisk: "Inorder-rekkefølgen er uendret, så treet er fortsatt et søketre." },
      { code: "SetHeight(z)", indent: 1,
        eli5: "Vi måler høyden på nytt, først for den som nå står lavest.",
        normal: "Oppdater høyden til z først. z er nå barn av y.",
        teknisk: "Bare z og y har fått nye subtrær, så bare de to trenger ny høyde.",
        grense: { q: "Hvorfor SetHeight(z) før SetHeight(y)?",
          a: t("Høyden til y avhenger av z. Vi må måle z først.",
               "z er nå barn av y. Høyden til y regnes ut fra barnas høyder, så z må være oppdatert først. Gjør vi y først, bruker vi den gamle (feil) høyden til z.",
               "SetHeight forutsetter riktige barnehøyder. Etter rotasjonen er z barn av y, så rekkefølgen må være nedenfra og opp.") } },
      { code: "SetHeight(y)", indent: 1,
        eli5: "Så måler vi den nye toppen.",
        normal: "Oppdater høyden til y.",
        teknisk: "O(1) totalt for hele rotasjonen." },
      { code: "return y", indent: 1,
        eli5: "Den nye toppen gis tilbake, så forelderen kan feste den.",
        normal: "Returner den nye roten i subtreet. Kalleren kobler den på.",
        teknisk: "Derfor ser kallene ut som v.right ← RightRotate(v.right)." }
    ];
  }
  var ROTBIGO = { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
    why: t("Vi flytter bare tre pekere, uansett hvor stort treet er.",
           "Fast antall pekerendringer og to høydeoppdateringer.",
           "Konstant arbeid. Subtrærne T1/T2 flyttes som helhet. Ingen noder inni dem berøres.") };

  reg(IN.algos, "leftRotate", {
    title: "Venstrerotasjon",
    name: "LeftRotate", params: "z",
    input: "En node z med høyre barn y",
    output: "y, som er ny rot i subtreet",
    lines: rotLines("L"), bigO: ROTBIGO
  });
  reg(IN.algos, "rightRotate", {
    title: "Høyrerotasjon",
    name: "RightRotate", params: "z",
    input: "En node z med venstre barn y",
    output: "y, som er ny rot i subtreet",
    lines: rotLines("R"), bigO: ROTBIGO
  });

  reg(IN.algos, "avlBalance", {
    title: "Rebalansering av én node",
    name: "Balance", params: "v",
    input: "En node v der begge subtrærne er AVL-trær (etter én innsetting i et AVL-tre er |balansefaktor| ≤ 2)",
    output: "Roten i subtreet etter eventuelle rotasjoner",
    lines: [
      { code: "if BalanceFactor(v) < −1 then", indent: 1,
        eli5: "Er treet for tungt til høyre?",
        normal: "Høyretung: høyre subtre er 2 høyere enn venstre.",
        teknisk: "Etter én innsetting eller fjerning er balansefaktoren høyst 2 i absoluttverdi.",
        grense: { q: "Hvorfor < −1 og ikke < 0?",
          a: t("Litt skjevt er lov. Bare når forskjellen blir 2, må vi rydde.",
               "AVL tillater balansefaktor −1, 0 og 1. Først når den er −2, er regelen brutt. Med < 0 ville vi rotert trær som allerede var gyldige, og kanskje gjort dem skjeve den andre veien.",
               "Invarianten er |b| ≤ 1. Den svake grensen gjør at bare O(1) rotasjoner trengs per nivå, og at høyden likevel er O(log n).") } },
      { code: "if BalanceFactor(v.right) > 0 then", indent: 2,
        eli5: "Bøyer høyre barn seg innover mot venstre? Da må vi rette det ut først.",
        normal: "Høyre barn er venstretungt (en «knekk»): da trengs en dobbelrotasjon.",
        teknisk: "Knekken (høyre–venstre) kan ikke rettes med én venstrerotasjon, for da flytter den bare over til andre siden.",
        grense: { q: "Hvorfor > 0 og ikke ≥ 0?",
          a: t("Står høyre barn rett, holder det med én rotasjon.",
               "Er balansefaktoren til v.right lik 0 (det kan skje etter fjerning), retter én venstrerotasjon opp treet. En ekstra høyrerotasjon ville da laget ny ubalanse. Bare en ekte knekk (> 0) trenger dobbelrotasjon.",
               "Ved innsetting er b(v.right) aldri 0 når v er ubalansert, men ved fjerning kan den være det. Da gir én enkel rotasjon riktig resultat.") } },
      { code: "v.right ← RightRotate(v.right)", indent: 3,
        eli5: "Vi vrir høyre barn rett først.",
        normal: "Første halvdel av dobbelrotasjonen: gjør knekken om til en rett linje.",
        teknisk: "Etter denne er v.right høyretung, så venstrerotasjonen under retter opp subtreet." },
      { code: "return LeftRotate(v)", indent: 2,
        eli5: "Så vrir vi hele greina til venstre.",
        normal: "Venstrerotasjon rundt v løfter høyre barn opp.",
        teknisk: "Høyden til subtreet går ned med 1 (ved innsetting tilbake til høyden før innsettingen)." },
      { code: "if BalanceFactor(v) > 1 then", indent: 1,
        eli5: "Er treet for tungt til venstre?",
        normal: "Venstretung: venstre subtre er 2 høyere enn høyre.",
        teknisk: "Speilbildet av tilfellet over." },
      { code: "if BalanceFactor(v.left) < 0 then", indent: 2,
        eli5: "Bøyer venstre barn seg innover mot høyre? Rett det ut først.",
        normal: "Venstre barn er høyretungt: dobbelrotasjon.",
        teknisk: "Knekken venstre–høyre." },
      { code: "v.left ← LeftRotate(v.left)", indent: 3,
        eli5: "Vri venstre barn rett.",
        normal: "Første halvdel av dobbelrotasjonen.",
        teknisk: "Gjør knekken om til en rett venstre-linje." },
      { code: "return RightRotate(v)", indent: 2,
        eli5: "Så vrir vi hele greina til høyre.",
        normal: "Høyrerotasjon rundt v.",
        teknisk: "Speilbildet av LeftRotate." },
      { code: "return v", indent: 1,
        eli5: "Alt var i orden. Ingenting å gjøre.",
        normal: "v var balansert: ingen rotasjon.",
        teknisk: "Vanligste tilfelle." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("Høyst to vridninger, uansett hvor stort treet er.",
             "Høyst to rotasjoner à O(1).",
             "Konstant arbeid. Innsetting og fjerning kaller Balance én gang per nivå på veien opp, altså O(log n) totalt.") }
  });

  reg(IN.algos, "avlInsert", {
    title: "Innsetting i AVL-tre",
    name: "Insert", params: "v, x",
    input: "Roten v til et AVL-tre (kan være null) og en verdi x",
    output: "Roten til AVL-treet etter at x er satt inn",
    lines: [
      { code: "if v = null then", indent: 1,
        eli5: "Tom plass? Da skal tallet stå her.",
        normal: "Tom plass funnet.",
        teknisk: "Som i et vanlig binært søketre." },
      { code: "v ← new Node(x)", indent: 2,
        eli5: "Lag en ny node.",
        normal: "Ny løvnode med høyde 0.",
        teknisk: "Den nye noden er alltid en løvnode." },
      { code: "else if x < v.element then", indent: 1,
        eli5: "Mindre? Gå til venstre.",
        normal: "x er mindre: sett inn til venstre.",
        teknisk: "Samme veivalg som i et BST." },
      { code: "v.left ← Insert(v.left, x)", indent: 2,
        eli5: "Fortsett nedover til venstre, og fest det som kommer tilbake.",
        normal: "Sett inn rekursivt, og koble den (kanskje roterte) nye roten til subtreet på v.left.",
        teknisk: "Tilordningen er avgjørende: etter en rotasjon er roten i subtreet en annen node." },
      { code: "else if x > v.element then", indent: 1,
        eli5: "Større? Gå til høyre.",
        normal: "x er større: sett inn til høyre.",
        teknisk: "Like verdier ignoreres." },
      { code: "v.right ← Insert(v.right, x)", indent: 2,
        eli5: "Fortsett nedover til høyre.",
        normal: "Sett inn rekursivt og koble på v.right.",
        teknisk: "Speilbildet." },
      { code: "SetHeight(v)", indent: 1,
        eli5: "På vei tilbake opp måler vi hver node på nytt.",
        normal: "Oppdater høyden til v på veien tilbake opp.",
        teknisk: "Barnas høyder er alt riktige, fordi rekursjonen har returnert fra dem." },
      { code: "return Balance(v)", indent: 1,
        eli5: "Og sjekker om noden står skjevt. Gjør den det, vrir vi.",
        normal: "Rebalanser v hvis balansefaktoren er utenfor [−1, 1], og returner roten i subtreet.",
        teknisk: "Skjer for hver node på stien opp til roten. Ved innsetting holder det med én (enkel eller dobbel) rotasjon i den laveste ubalanserte noden." }
    ],
    bigO: { best: "O(log n)", avg: "O(log n)", worst: "O(log n)", space: "O(log n)",
      why: t("Treet holder seg lavt og bredt, så det er alltid kort vei ned.",
             "AVL-regelen gjør at høyden alltid er O(log n). Vi går én sti ned og samme sti opp, med O(1) arbeid per node.",
             "h = O(log n) for AVL-trær, og hvert nivå gjør O(1) arbeid (SetHeight, BalanceFactor, høyst to rotasjoner). Rekursjonsstakken er også O(log n).") }
  });

  reg(IN.algos, "avlRemove", {
    title: "Fjerning i AVL-tre",
    name: "Remove", params: "v, x",
    input: "Roten v til et AVL-tre og en verdi x",
    output: "Roten til AVL-treet etter at x er fjernet",
    lines: [
      { code: "if v = null then return null", indent: 1,
        eli5: "Fant ikke tallet.", normal: "x finnes ikke.", teknisk: "Basistilfellet." },
      { code: "if x < v.element then", indent: 1,
        eli5: "Mindre: gå til venstre.", normal: "Let til venstre.", teknisk: "Som i BST." },
      { code: "v.left ← Remove(v.left, x)", indent: 2,
        eli5: "Fjern der og fest det som er igjen.", normal: "Fjern fra venstre subtre.", teknisk: "Subtreet kan ha blitt rotert, så vi henger på det som returneres." },
      { code: "else if x > v.element then", indent: 1,
        eli5: "Større: gå til høyre.", normal: "Let til høyre.", teknisk: "Som i BST." },
      { code: "v.right ← Remove(v.right, x)", indent: 2,
        eli5: "Fjern der og fest det som er igjen.", normal: "Fjern fra høyre subtre.", teknisk: "Som over." },
      { code: "else if v.left = null then", indent: 1,
        eli5: "Funnet! Ingen venstre barn?", normal: "Funnet, uten venstre barn.", teknisk: "0 barn eller bare høyre barn." },
      { code: "v ← v.right", indent: 2,
        eli5: "Høyre barn tar plassen.", normal: "Erstatt med høyre barn (kan være null).", teknisk: "Vi tilordner v i stedet for å returnere, så SetHeight og Balance under også kjører." },
      { code: "else if v.right = null then", indent: 1,
        eli5: "Bare venstre barn?", normal: "Funnet, bare venstre barn.", teknisk: "Speilbildet." },
      { code: "v ← v.left", indent: 2,
        eli5: "Venstre barn tar plassen.", normal: "Erstatt med venstre barn.", teknisk: "Som over." },
      { code: "else", indent: 1,
        eli5: "To barn.", normal: "Funnet, med to barn.", teknisk: "Bruker etterfølgeren, som i BST." },
      { code: "u ← FindMin(v.right)", indent: 2,
        eli5: "Finn minste til høyre.", normal: "Etterfølgeren.", teknisk: "Minste i høyre subtre." },
      { code: "v.element ← u.element", indent: 2,
        eli5: "Kopier tallet inn.", normal: "Kopier verdien inn i v.", teknisk: "Strukturen er uendret." },
      { code: "v.right ← Remove(v.right, u.element)", indent: 2,
        eli5: "Fjern den gamle kopien.", normal: "Fjern etterfølgeren fra høyre subtre.", teknisk: "Rebalanserer også på veien opp i høyre subtre." },
      { code: "SetHeight(v)", indent: 1,
        eli5: "Mål høyden på nytt.", normal: "Oppdater høyden.", teknisk: "SetHeight tåler v = null." },
      { code: "return Balance(v)", indent: 1,
        eli5: "Vri hvis det står skjevt.", normal: "Rebalanser og returner.",
        teknisk: "Ved fjerning kan det trengs rotasjoner på flere nivåer på vei opp, men fortsatt O(log n) totalt." }
    ],
    bigO: { best: "O(log n)", avg: "O(log n)", worst: "O(log n)", space: "O(log n)",
      why: t("Kort vei ned og opp igjen, fordi treet er lavt.",
             "Høyden er O(log n), og hvert nivå gjør O(1) arbeid.",
             "Én sti ned (pluss stien til etterfølgeren) og samme sti opp med Balance på hvert nivå: O(log n).") }
  });

  /* ============================================================
     ANTI-AVL (H2025)
     ============================================================ */
  reg(IN.algos, "insertAntiAVL", {
    title: "Innsetting i Anti-AVL (H2025)",
    name: "InsertAntiAVL", params: "v, x",
    input: "Roten v til et Anti-AVL-tre (kan være null) og en verdi x",
    output: "Roten til treet etter innsetting",
    lines: [
      { code: "if v = null then", indent: 1,
        eli5: "Tom plass? Her skal tallet stå.", normal: "Tom plass funnet.", teknisk: "Som i et BST." },
      { code: "return new Node(x)", indent: 2,
        eli5: "Lag en ny node.", normal: "Ny løvnode.", teknisk: "Den nye noden har ingen barn." },
      { code: "if x < v.element then", indent: 1,
        eli5: "Mindre? Til venstre.", normal: "x er mindre: sett inn til venstre.", teknisk: "Vanlig BST-veivalg." },
      { code: "v.left ← InsertAntiAVL(v.left, x)", indent: 2,
        eli5: "Fortsett til venstre.", normal: "Sett inn i venstre subtre.", teknisk: "Etter denne har v et venstre barn." },
      { code: "else if x > v.element then", indent: 1,
        eli5: "Større? Til høyre.", normal: "x er større: sett inn til høyre.", teknisk: "Duplikater ignoreres." },
      { code: "v.right ← InsertAntiAVL(v.right, x)", indent: 2,
        eli5: "Fortsett til høyre.", normal: "Sett inn i høyre subtre.", teknisk: "Det som kommer tilbake, er en høyrekjede uten venstre barn." },
      { code: "if v.left ≠ null then", indent: 1,
        eli5: "Har noden fått et barn på venstre side? Det liker ikke Anti-AVL!",
        normal: "Har v et venstre barn, skal det roteres bort.",
        teknisk: "Regelen ser bare på om det finnes et venstre barn. Høyder brukes ikke.",
        grense: { q: "Hvorfor holder det med if og ikke while?",
          a: t("Det kan bare dukke opp ett venstre barn om gangen, og etter én vridning er det borte.",
               "Før innsettingen har ingen noder venstre barn. Går x til venstre, blir v.left en ny løvnode. Etter én høyrerotasjon er den nye noden rot, og den har ikke noe venstre barn. Én rotasjon er derfor nok.",
               "Invariant: treet er en høyrekjede. Én innsetting lager høyst ett venstre barn, og RightRotate fjerner det uten å lage nye. Derfor holder if.") } },
      { code: "return RightRotate(v)", indent: 2,
        eli5: "Vi vrir til høyre, så det venstre barnet blir toppen.",
        normal: "Høyrerotasjon: venstre barn blir ny rot i subtreet, og v blir høyre barn.",
        teknisk: "Rotasjonen bevarer søketre-egenskapen. RightRotate oppdaterer høyder, men Anti-AVL bruker dem ikke." },
      { code: "return v", indent: 1,
        eli5: "Ellers blir alt stående.", normal: "Ingen rotasjon nødvendig.", teknisk: "Vanlig tilfelle når x gikk til høyre." }
    ],
    bigO: { best: "O(1)", worst: "O(n)", space: "O(n)",
      why: t("Vi går ned til riktig plass som i et vanlig søketre, og vrir høyst én gang på veien opp. Men treet er en lang stige, så skal vi helt ned, må vi forbi alle nodene.",
             "Anti-AVL-treet er alltid en høyrekjede, så høyden er n − 1. Innsetting av et stort tall går gjennom hele kjeden: O(n). Et tall mindre enn roten settes inn på ett skritt: O(1).",
             "h = n − 1 gir O(n) for innsetting og oppslag i verste fall. Rekursjonsstakken blir like dyp.") }
  });

  /* ============================================================
     HUFFMAN
     ============================================================ */
  reg(IN.algos, "huffman", {
    title: "Bygg Huffman-tre",
    name: "Huffman", params: "C",
    input: "En mengde C med par (s, f): symbol og frekvens",
    output: "Roten til Huffman-treet",
    lines: [
      { code: "Q ← new PriorityQueue", indent: 1,
        eli5: "Vi lager en kø der den med minst tall alltid står først.",
        normal: "Prioritetskø ordnet etter frekvens (minst først).",
        teknisk: "Implementeres med en min-heap: Insert og RemoveMin i O(log n)." },
      { code: "for (s, f) ∈ C do", indent: 1,
        eli5: "For hver bokstav og hvor ofte den brukes …",
        normal: "Gå gjennom alle symbolene.",
        teknisk: "n symboler." },
      { code: "Insert(Q, new Node(s, f))", indent: 2,
        eli5: "… lager vi en liten node og stiller den i køen.",
        normal: "Én løvnode per symbol, uten barn.",
        teknisk: "Løvnodene bærer symbolene. Alle interne noder får symbol null." },
      { code: "while Size(Q) > 1 do", indent: 1,
        eli5: "Så lenge det er mer enn én node igjen i køen …",
        normal: "Gjenta til bare ett tre står igjen.",
        teknisk: "Hver runde reduserer antall trær i køen med 1, så løkka kjører n − 1 ganger.",
        grense: { q: "Hvorfor Size(Q) > 1 og ikke «så lenge køen ikke er tom»?",
          a: t("Vi trenger to noder for å slå sammen. Står det bare én igjen, er vi ferdige.",
               "Hver runde tar ut to noder. Med bare én igjen har vi ikke noe å slå sammen, og den andre RemoveMin ville feilet på tom kø. Den siste noden er roten, og den hentes ut på linja nederst.",
               "Løkkebetingelsen gir nøyaktig n − 1 sammenslåinger, altså n − 1 interne noder og 2n − 1 noder totalt.") } },
      { code: "v1 ← RemoveMin(Q)", indent: 2,
        eli5: "… tar vi ut den minste …",
        normal: "Ta ut treet med lavest frekvens.",
        teknisk: "O(log n) med heap." },
      { code: "v2 ← RemoveMin(Q)", indent: 2,
        eli5: "… og den nest minste.",
        normal: "Ta ut treet med nest lavest frekvens.",
        teknisk: "Ved lik frekvens kan valget variere. Kodelengdene kan da bli ulike, men den totale kodelengden blir like god." },
      { code: "v ← new Node(null, v1.freq + v2.freq)", indent: 2,
        eli5: "Vi lager en ny node over dem, med summen av tallene deres.",
        normal: "Ny intern node uten symbol, med frekvens lik summen.",
        teknisk: "Grådig valg: de to sjeldneste symbolene havner dypest og får de lengste kodene." },
      { code: "v.left ← v1", indent: 2,
        eli5: "Den minste henger til venstre (kant 0) …",
        normal: "Venstre kant får bit 0.",
        teknisk: "Kurset merker venstre kant 0 og høyre kant 1." },
      { code: "v.right ← v2", indent: 2,
        eli5: "… og den andre til høyre (kant 1).",
        normal: "Høyre kant får bit 1.",
        teknisk: "Speilvending ville gitt andre koder, men samme lengder." },
      { code: "Insert(Q, v)", indent: 2,
        eli5: "Den nye noden stiller seg i køen igjen.",
        normal: "Legg det sammenslåtte treet tilbake i køen.",
        teknisk: "O(log n)." },
      { code: "return RemoveMin(Q)", indent: 1,
        eli5: "Den siste som står igjen, er toppen av treet.",
        normal: "Den eneste noden igjen er roten.",
        teknisk: "Kodeordet til et symbol er bitene langs stien fra roten ned til løvnoden." }
    ],
    bigO: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)",
      why: t("Vi slår sammen to og to, og hver gang må køen ordnes litt.",
             "n − 1 sammenslåinger, og hver gjør tre heap-operasjoner à O(log n). Totalt O(n log n), der n er antall ulike symboler.",
             "n Insert i starten pluss 3(n − 1) heap-operasjoner à O(log n) gir O(n log n). Treet har 2n − 1 noder, altså O(n) minne.") }
  });

  /* ============================================================
     STEGGENERATORER
     Felles stegform (leses av sidens vizTree):
       { line, text, tag, tree | forest, marks:{cur, alt, path, done, found, fresh, rot, warn, queued, dim},
         lab:{id:tekst}, sup:{id:tekst}, edges:[[a,b],…], info:[{label, items}], counter, bits }
     ============================================================ */

  /* ---------- Traverseringer ---------- */
  function travGen(kind) {
    var NAME = { pre: "Preorder", "in": "Inorder", post: "Postorder" }[kind];
    // Linjenumre: 1 = prosedyrelinja, 2 = null-sjekken. Rekkefølgen på linje 3–5 avhenger av variant.
    var ORDER = { pre: ["visit", "l", "r"], "in": ["l", "visit", "r"], post: ["l", "r", "visit"] }[kind];
    var LINE = {}; ORDER.forEach(function (a, i) { LINE[a] = 3 + i; });
    var LAST = 5;
    return function (input) {
      var o = norm(input), root = treeOf(o), steps = [], visited = [], frames = [];
      // frames: bunn → topp. { v (null for null-kall), wait: tekst | null, ret: bool }
      function call(k) { return NAME + "(" + (k == null ? "null" : k) + ")"; }
      function info() {
        return [{ label: "Kallstakk", kind: "frames", items: frames.map(function (f, i) {
                  var top = i === frames.length - 1, note;
                  if (!f.v) note = "v = null → return ↩";
                  else if (f.ret) note = "ferdig ↩";
                  else if (!top && f.wait) note = "venter på " + f.wait;
                  else note = f.note || "";
                  return { name: call(f.v ? f.v.k : null), note: note, ret: !f.v || f.ret };
                }) },
                { label: "Besøkt", items: visited.map(function (v) { return v.k; }) }];
      }
      function snap(line, cur, text, tag) {
        var onStack = frames.filter(function (f) { return f.v; }).map(function (f) { return f.v.id; });
        steps.push({ line: line, tree: cl(root), text: text, tag: tag, info: info(),
          marks: { cur: cur ? cur.id : null, path: onStack, done: visited.map(function (v) { return v.id; }) } });
      }
      function seq() { return visited.map(function (v) { return v.k; }).join(", "); }
      var SIDE = { l: "venstre", r: "høyre" }, FIELD = { l: "v.left", r: "v.right" };
      snap(null, null, t("Vi skal hilse på alle nodene i treet, i " + NAME.toLowerCase() + "-rekkefølge. Kallstakken under viser hvilke kall som er i gang.",
        "Start: " + call(root ? root.k : null) + " kalles. Kallstakken under treet viser kallene som er i gang, med toppen øverst.",
        "Vi kaller " + call(root ? root.k : null) + ". Hver ramme på kallstakken er et kall som ikke er ferdig ennå. Toppen er kallet som jobber nå."), "Start");
      function rec(v, par) {
        var fr = { v: v, wait: null, ret: false, note: "v ≠ null" };
        frames.push(fr);
        snap(2, v, t("Vi kommer til " + v.k + ". Det er en ekte node, ikke en tom plass, så vi fortsetter.",
          call(v.k) + " kalles. Linje 2: v ≠ null, så vi går videre.",
          "Ny ramme " + call(v.k) + " øverst på kallstakken. Basistilfellet slår ikke til, fordi v ≠ null."), "Kall " + call(v.k));
        ORDER.forEach(function (a) {
          if (a === "visit") {
            visited.push(v); fr.note = "besøker " + v.k;
            var e = { pre: "Vi hilser på " + v.k + " med en gang, før barna.",
                      "in": "Venstre side av " + v.k + " er ferdig. Nå hilser vi på " + v.k + ".",
                      post: "Begge sidene av " + v.k + " er ferdige. Nå hilser vi på " + v.k + "." }[kind];
            var n = { pre: "Visit(" + v.k + "): i preorder skjer besøket før begge barnekallene.",
                      "in": "Kallet på venstre subtre har returnert, så Visit(" + v.k + ").",
                      post: "Begge barnekallene har returnert, så Visit(" + v.k + ")." }[kind];
            snap(LINE.visit, v, t(e, n, "Visit(" + v.k + ") " + { pre: "før subtrærne", "in": "mellom subtrærne", post: "etter subtrærne" }[kind] + ". Rekkefølgen så langt: " + seq() + "."), "Besøk " + v.k);
            return;
          }
          var c = v[a];
          if (!c) {
            fr.wait = call(null);
            frames.push({ v: null });
            snap(2, v, t(v.k + " har ikke noe barn til " + SIDE[a] + ". Der er det tomt, så vi snur med en gang.",
              call(FIELD[a]) + " kalles med null. Linje 2: v = null, så kallet returnerer med en gang.",
              "Null-kall: rammen " + call(null) + " treffer basistilfellet og forsvinner straks. Et tre med n noder gir n + 1 slike kall."), "null-kall (" + SIDE[a] + ")");
            frames.pop();
            fr.wait = null;
            return;
          }
          fr.wait = call(c.k); fr.note = "kaller " + SIDE[a];
          snap(LINE[a], v, t(v.k + " sender oss ned til " + SIDE[a] + " barn, " + c.k + ". " + v.k + " venter så lenge.",
            call(FIELD[a]) + " = " + call(c.k) + " kalles. Rammen for " + v.k + " venter til kallet er ferdig.",
            "Rekursivt kall på " + FIELD[a] + " = " + c.k + ". Rammen " + call(v.k) + " blir liggende under og fortsetter på neste linje når kallet returnerer."), "Kall " + SIDE[a]);
          rec(c, v);
          fr.wait = null;
        });
        fr.ret = true;
        snap(LAST, v, t("Alt under " + v.k + " er ferdig. " + (par ? "Vi går tilbake opp til " + par.k + "." : "Det var det første kallet, så nå er vi helt ferdige."),
          call(v.k) + " er ferdig og returnerer" + (par ? " til " + call(par.k) + "." : ". Det var det første kallet."),
          "Rammen " + call(v.k) + " fjernes fra kallstakken." + (par ? " " + call(par.k) + " fortsetter etter kallet sitt." : " Kallstakken er tom etterpå.")), "Retur " + v.k);
        frames.pop();
      }
      if (root) rec(root, null);
      else {
        frames.push({ v: null });
        snap(2, null, t("Treet er tomt, så vi snur med en gang.", call(null) + ": v = null, så kallet returnerer med en gang.", "Tomt tre: basistilfellet, O(1)."), "null-kall");
        frames.pop();
      }
      snap(null, null, t("Ferdig! Rekkefølgen ble: " + seq() + ".", "Ferdig. " + NAME + ": " + seq() + ".",
        NAME + " = [" + seq() + "]. Hver node ga ett kall, og i tillegg kom n + 1 null-kall: O(n)."), "Ferdig");
      return steps;
    };
  }
  reg(IN.gen, "preorder", travGen("pre"));
  reg(IN.gen, "inorder", travGen("in"));
  reg(IN.gen, "postorder", travGen("post"));

  reg(IN.gen, "levelOrder", function (input) {
    var o = norm(input), root = treeOf(o), steps = [], visited = [], Q = [];
    function snap(line, cur, text, tag) {
      steps.push({ line: line, tree: cl(root), text: text, tag: tag,
        info: [{ label: "Kø (front → bak)", items: Q.map(function (v) { return v.k; }), kind: "queue" },
               { label: "Besøkt", items: visited.map(function (v) { return v.k; }) }],
        marks: { cur: cur ? cur.id : null, queued: Q.map(function (v) { return v.id; }), done: visited.map(function (v) { return v.id; }) } });
    }
    snap(2, null, t("Vi lager en tom kø.", "Tom kø Q.", "Q ← tom FIFO-kø."), "Start");
    if (root) {
      Q.push(root);
      snap(3, null, t("Roten " + root.k + " stiller seg i køen.", "Roten " + root.k + " legges i køen.", "Enqueue(rot)."), "Rot i køen");
    }
    while (Q.length) {
      var u = Q.shift();
      snap(5, u, t(u.k + " står først i køen og får komme fram.", "Dequeue: u = " + u.k + ".", "u ← " + u.k + " (dybde-orden bevares av FIFO)."), "Ta ut " + u.k);
      visited.push(u);
      var leaf = !u.l && !u.r;
      snap(6, u, t("Vi hilser på " + u.k + "." + (leaf ? " Den har ingen barn." : ""),
        "Besøk " + u.k + "." + (leaf ? " Ingen barn å legge i køen." : ""),
        "Visit(" + u.k + ")." + (leaf ? " Begge null-sjekkene feiler." : "")), "Besøk " + u.k);
      if (!leaf) {
        var add = [];
        if (u.l) { Q.push(u.l); add.push(u.l.k); }
        if (u.r) { Q.push(u.r); add.push(u.r.k); }
        snap(u.r ? 8 : 7, u, t("Barna til " + u.k + " (" + add.join(" og ") + ") stiller seg bakerst i køen.",
          "Legg " + add.join(" og ") + " bakerst i køen.",
          "Enqueue " + add.join(", ") + ". De besøkes etter alt som allerede står i køen."), "I køen");
      }
    }
    var seq = visited.map(function (v) { return v.k; }).join(", ");
    snap(null, null, t("Køen er tom. Vi tok ett nivå om gangen: " + seq + ".", "Ferdig. Level-order: " + seq + ".",
      "Level-order = [" + seq + "]. n Enqueue + n Dequeue: O(n)."), "Ferdig");
    return steps;
  });

  /* ---------- Iterative traverseringer: egen stakk ----------
     Ekstra stegfelt (tegnes av sidens renderIter):
       stacks: [{ label, items:[tekst | {t, note}], out }]   bunn → topp; out = nettopp tatt av
       vars:   [[navn, verdi]]                                statuspiller, f.eks. v = h
       visited:[k]                                            besøksrekkefølgen så langt */
  function kOf(v) { return v.k; }
  function idOf(v) { return v.id; }
  function seqOf(a) { return a.map(kOf).join(", "); }
  function topOf(S) { return S.length ? S[S.length - 1].k : null; }
  function stackTxt(S) { return S.length ? seqOf(S) + " (" + topOf(S) + " øverst)" : "tom"; }

  reg(IN.gen, "iterativePreorder", function (input) {
    var o = norm(input), root = treeOf(o), steps = [], S = [], vis = [];
    function snap(line, cur, text, tag, out) {
      steps.push({ line: line, tree: cl(root), text: text, tag: tag, visited: vis.map(kOf),
        stacks: [{ label: "Stakk S", items: S.map(kOf), out: out ? out.k : null }],
        marks: { cur: cur ? cur.id : null, queued: S.map(idOf), done: vis.map(idOf) } });
    }
    snap(2, null, t("Vi lager en tom bunke med huskelapper. Den skal huske hvilke noder som venter.",
      "S ← tom stakk.", "S ← new Stack. Den tar over jobben til kallstakken."), "Start");
    if (root) {
      S.push(root);
      snap(3, root, t("Roten " + root.k + " legges i bunken.", "Push(S, " + root.k + ").",
        "Push(S, rot). Tilsvarer det første kallet Preorder(" + root.k + ")."), "Push " + root.k);
    }
    while (S.length) {
      var u = S.pop();
      snap(5, u, t("Vi tar den øverste lappen: " + u.k + ".", "Pop(S) gir u = " + u.k + ". Stakken er nå " + stackTxt(S) + ".",
        "u ← " + u.k + ", den sist pushede noden. Stakken: " + stackTxt(S) + "."), "Pop " + u.k, u);
      vis.push(u);
      var leaf = !u.l && !u.r;
      snap(6, u, t("Vi hilser på " + u.k + " med en gang." + (leaf ? " Den har ingen barn, så ingen nye lapper." : ""),
        "Besøk " + u.k + "." + (leaf ? " Ingen barn å legge på stakken." : ""),
        "Visit(" + u.k + ") før barna: preorder." + (leaf ? " Begge null-sjekkene feiler." : "")), "Besøk " + u.k);
      if (u.r) {
        S.push(u.r);
        snap(7, u, t(u.l ? "Først legger vi det høyre barnet, " + u.r.k + ", i bunken. Det skal vente lengst." : u.k + " har bare et høyre barn, " + u.r.k + ". Det legges i bunken.",
          "u.right = " + u.r.k + " ≠ null: Push(S, " + u.r.k + ")." + (u.l ? " Høyre først, så det havner under venstre." : " u.left er null, så linje 8 pusher ingenting."),
          "Push(" + u.r.k + ")." + (u.l ? " Høyre barn må ligge under venstre på stakken." : " u.left = null, så bare dette barnet pushes.")), "Push " + u.r.k);
      }
      if (u.l) {
        S.push(u.l);
        snap(8, u, t(u.r ? "Så legger vi det venstre barnet, " + u.l.k + ", oppå. Da ligger " + u.l.k + " øverst og blir neste." : u.k + " har bare et venstre barn, " + u.l.k + ". Det legges i bunken.",
          (u.r ? "" : "u.right = null, så linje 7 pusher ingenting. ") + "u.left = " + u.l.k + " ≠ null: Push(S, " + u.l.k + ")." + (u.r ? " " + u.l.k + " ligger øverst og tas ut først." : ""),
          "Push(" + u.l.k + ")." + (u.r ? " LIFO gjør at hele venstre subtre er ferdig før " + u.r.k + " kommer til toppen." : "")), "Push " + u.l.k);
      }
    }
    var seq = seqOf(vis);
    snap(4, null, t("Bunken er tom, så vi er ferdige. Rekkefølgen ble " + seq + ", akkurat som med rekursjon.",
      "S er tom, løkka stopper. Preorder: " + seq + ".",
      "S er tom. Preorder = [" + seq + "], samme som den rekursive. n Push + n Pop: O(n)."), "Ferdig");
    return steps;
  });

  reg(IN.gen, "iterativeInorder", function (input) {
    var o = norm(input), root = treeOf(o), steps = [], S = [], vis = [], v = root;
    function snap(line, cur, text, tag, out) {
      steps.push({ line: line, tree: cl(root), text: text, tag: tag, visited: vis.map(kOf),
        stacks: [{ label: "Stakk S", items: S.map(kOf), out: out ? out.k : null }],
        vars: [["v", v ? v.k : "null"]],
        marks: { cur: cur ? cur.id : null, path: v && (!cur || v.id !== cur.id) ? [v.id] : [], queued: S.map(idOf), done: vis.map(idOf) } });
    }
    snap(2, null, t("Vi lager en tom bunke. Vi står på roten" + (root ? ", " + root.k : "") + ".",
      "S ← tom stakk. Markøren v starter i roten.", "S tom, v = rot. Tilstanden (v, S) betyr: subtreet v er ikke påbegynt, nodene på S venter."), "Start");
    while (v || S.length) {
      if (v) {
        var w = v;
        S.push(w);
        snap(5, w, t("Vi kan ikke hilse på " + w.k + " ennå, for alt til venstre skal komme først. " + w.k + " legges i bunken, så vi finner tilbake.",
          "v = " + w.k + " ≠ null: Push(S, " + w.k + ").",
          w.k + " venter på venstre subtre, så den pushes. Stakken: " + stackTxt(S) + "."), "Push " + w.k);
        v = w.l;
        snap(6, w, t("Så går vi ett steg ned til venstre" + (v ? ", til " + v.k + "." : ". Der er det tomt."),
          "v ← " + w.k + ".left = " + (v ? v.k : "null") + ".",
          "Ned venstrekanten: v = " + (v ? v.k : "null") + "." + (v ? "" : " Neste runde går til else-grenen.")), "Venstre");
      } else {
        var u = S.pop(); v = u;
        snap(8, u, t("Det er tomt her. Vi tar den øverste lappen: " + u.k + ". Alt til venstre for den er ferdig.",
          "v er null, så else: v ← Pop(S) = " + u.k + ". Venstre subtre til " + u.k + " er ferdig.",
          "v = null: venstre subtre til toppen av S er ferdig. Pop gir " + u.k + ", den neste i inorder."), "Pop " + u.k, u);
        vis.push(u);
        snap(9, u, t("Nå hilser vi på " + u.k + ".", "Besøk " + u.k + ".", "Visit(" + u.k + ") mellom subtrærne."), "Besøk " + u.k);
        v = u.r;
        snap(10, u, t(v ? "Så går vi over til høyre side, til " + v.k + ", og gjør det samme der." : u.k + " har ingen høyre side. Neste runde tar vi en ny lapp fra bunken" + (S.length ? "." : ", hvis det er noen igjen."),
          "v ← " + u.k + ".right = " + (v ? v.k : "null") + "." + (v ? " Høyre subtre startes som et nytt tre." : ""),
          "v ← " + (v ? v.k : "null") + ". " + u.k + " er ferdig og skal ikke tilbake på stakken."), "Høyre");
      }
    }
    var seq = seqOf(vis);
    snap(3, null, t("Vi står på ingenting og bunken er tom. Ferdig! Rekkefølgen ble " + seq + ".",
      "v = null og S er tom, løkka stopper. Inorder: " + seq + ".",
      "Inorder = [" + seq + "], samme som den rekursive. 2n runder med O(1) arbeid: O(n)."), "Ferdig");
    return steps;
  });

  reg(IN.gen, "iterativePostorder", function (input) {
    var o = norm(input), root = treeOf(o), steps = [], S = [], R = [], vis = [];
    function snap(line, cur, text, tag, outS, outR) {
      steps.push({ line: line, tree: cl(root), text: text, tag: tag, visited: vis.map(kOf),
        stacks: [{ label: "Stakk S", items: S.map(kOf), out: outS ? outS.k : null },
                 { label: "Stakk R", items: R.map(kOf), out: outR ? outR.k : null }],
        marks: { cur: cur ? cur.id : null, queued: S.map(idOf), path: R.map(idOf), done: vis.map(idOf) } });
    }
    snap(3, null, t("Vi lager to tomme bunker: S for nodene vi skal se på, og R der vi samler dem.",
      "S og R er tomme stakker.", "To stakker, som kursets hint foreslår. R skal snu rekkefølgen."), "Start");
    if (root) {
      S.push(root);
      snap(4, root, t("Roten " + root.k + " legges i S.", "Push(S, " + root.k + ").", "Push(S, rot)."), "Push " + root.k);
    }
    while (S.length) {
      var u = S.pop(); R.push(u);
      snap(7, u, t("Vi tar " + u.k + " fra S. Vi hilser ikke ennå, men legger den i R.",
        "Pop(S) gir " + u.k + ", og Push(R, " + u.k + ").",
        u.k + " flyttes fra S til R. R er nå " + stackTxt(R) + "."), "Til R: " + u.k, u, null);
      if (u.l) {
        S.push(u.l);
        snap(8, u, t(u.r ? "Det venstre barnet, " + u.l.k + ", legges i S først." : "Barnet " + u.l.k + " (venstre) legges i S.",
          "u.left = " + u.l.k + " ≠ null: Push(S, " + u.l.k + ")." + (u.r ? "" : " u.right er null, så linje 9 pusher ingenting."),
          "Push(" + u.l.k + ")." + (u.r ? " Venstre under høyre, så høyre tas ut først." : "")), "Push " + u.l.k);
      }
      if (u.r) {
        S.push(u.r);
        snap(9, u, t(u.l ? "Så legges det høyre barnet, " + u.r.k + ", oppå. Det tas ut først." : "Barnet " + u.r.k + " (høyre) legges i S.",
          (u.l ? "" : "u.left = null, så linje 8 pusher ingenting. ") + "u.right = " + u.r.k + " ≠ null: Push(S, " + u.r.k + ")." + (u.l ? " Høyre ligger øverst." : ""),
          "Push(" + u.r.k + "). Høyre tas ut før venstre, så R får node – høyre – venstre."), "Push " + u.r.k);
      }
    }
    if (root) {
      snap(5, null, t("S er tom, så den første løkka er ferdig. Alle nodene ligger nå i R. Den øverste er den vi la sist.",
        "S er tom, så første while-løkke stopper. R (bunn → topp): " + seqOf(R) + ".",
        "R bunn → topp = " + seqOf(R) + " (node – høyre – venstre). Tatt av fra toppen blir det postorder."), "Snu med R");
    }
    while (R.length) {
      var x = R.pop();
      snap(11, x, t("Vi tar " + x.k + " fra toppen av R.", "Pop(R) gir u = " + x.k + ".", "u ← Pop(R) = " + x.k + ". R: " + stackTxt(R) + "."), "Pop " + x.k, null, x);
      vis.push(x);
      snap(12, x, t("Nå hilser vi på " + x.k + ".", "Besøk " + x.k + ".", "Visit(" + x.k + "). Postorder så langt: " + seqOf(vis) + "."), "Besøk " + x.k);
    }
    var seq = seqOf(vis);
    snap(10, null, t("Begge bunkene er tomme. Rekkefølgen ble " + seq + ": barna før forelderen.",
      "R er tom. Postorder: " + seq + ".",
      "Postorder = [" + seq + "], samme som den rekursive. O(n) tid, men R holdt alle n nodene: O(n) minne."), "Ferdig");
    return steps;
  });

  /* Rekursjon som skjult stakk: kallstakken til Preorder og stakken S i IterativePreorder,
     side om side i hvert Visit. Besøksrekkefølgen er den samme, så stegene følger hverandre. */
  reg(IN.gen, "preorderStacks", function (input) {
    var o = norm(input), root = treeOf(o), steps = [], vis = [];
    function inSub(a, x) { var f = false; each(a, function (n) { if (n === x) f = true; }); return f; }
    // Iterativ: S rett etter Pop(x) for hver x, i besøksrekkefølge
    var Ss = [], S = root ? [root] : [];
    while (S.length) { var u = S.pop(); Ss.push(S.slice()); if (u.r) S.push(u.r); if (u.l) S.push(u.l); }
    // Rekursiv: stien fra roten til x er kallstakken (bunn → topp)
    var order = [], paths = [];
    (function rec(v, path) { if (!v) return; var p = path.concat([v]); order.push(v); paths.push(p); rec(v.l, p); rec(v.r, p); })(root, []);
    function frames(p) {
      return p.map(function (a, i) {
        var x = p[p.length - 1], note;
        if (i === p.length - 1) note = "besøker " + a.k;
        else if (a.l && inSub(a.l, x)) note = a.r ? "venter: høyre (" + a.r.k + ")" : "venter: bare retur";
        else note = "venter: bare retur";
        return { t: "Preorder(" + a.k + ")", note: note };
      });
    }
    function snap(text, tag, cur, fr, s) {
      steps.push({ line: null, tree: cl(root), text: text, tag: tag, visited: vis.map(kOf),
        stacks: [{ label: "Kallstakk (rekursiv)", items: fr, wide: true }, { label: "Stakk S (iterativ)", items: s.map(kOf) }],
        marks: { cur: cur ? cur.id : null, queued: s.map(idOf), done: vis.map(idOf) } });
    }
    snap(t("Vi kjører begge versjonene på samme tre og stopper hver gang de hilser på en node.",
      "Til venstre: kallene som står på kallstakken i rekursiv Preorder. Til høyre: stakken S i IterativePreorder. Begge stopper ved hver Visit.",
      "Vi sammenligner tilstanden i hver Visit. Kallstakken lagrer en ramme per aktivt kall (med v og hvor kallet skal fortsette). S lagrer bare nodene som ikke er påbegynt."), "Start", null, [], []);
    order.forEach(function (x, i) {
      vis.push(x);
      var fr = frames(paths[i]), s = Ss[i], waits = fr.filter(function (f) { return /høyre/.test(f.note); }).length;
      var ram = fr.length + (fr.length === 1 ? " ramme" : " rammer");
      snap(t("Begge hilser på " + x.k + " nå. Kallstakken har " + (fr.length === 1 ? "bare ett kall" : fr.length + " kall oppå hverandre") + ". " +
          (s.length ? "Bunken S har " + s.length + " " + (s.length === 1 ? "lapp" : "lapper") + ": de høyre barna som venter." : "Bunken S er tom: ingen høyre barn venter."),
        "Visit(" + x.k + "). Kallstakken: " + ram + (fr.length === 1 ? " (kallet som besøker " + x.k + ")" : ", og " + (waits === 0 ? "ingen" : waits) + " av dem venter på et høyre barn") + ". " +
          (s.length ? "S: " + seqOf(s) + ". Det er nøyaktig de samme høyre barna." : "S er tom, og det stemmer: ingen ramme venter på et høyre barn."),
        "Visit(" + x.k + "): dybde " + (fr.length - 1) + ", så " + ram + ". " +
          (s.length ? "S = [" + seqOf(s) + "] er de ventende høyre barna, altså bare den delen av rammene som har arbeid igjen." : "S er tom: ingen ramme har et høyre barn igjen, bare retur.")), "Besøk " + x.k, x, fr, s);
    });
    snap(t("Ferdig. Begge hilste i samme rekkefølge: " + seqOf(vis) + ". Kallstakken og bunken husket det samme arbeidet, bare på hver sin måte.",
      "Samme rekkefølge: " + seqOf(vis) + ". Rekursjonen bruker kallstakken. Den iterative versjonen bruker en stakk vi har laget selv.",
      "Samme preorder: [" + seqOf(vis) + "]. Begge er O(h) i verste fall. I en kjede vokser kallstakken til n, mens S holder seg på høyst ett element."), "Ferdig", null, [], []);
    return steps;
  });

  /* ---------- BST: innsetting ---------- */
  reg(IN.gen, "bstInsert", function (input) {
    var o = norm(input), root = o.base ? bstFrom(o.base) : null, steps = [];
    function snap(line, marks, text, tag) { fixH(root); steps.push({ line: line, tree: cl(root), marks: marks, text: text, tag: tag }); }
    snap(null, {}, t("Vi setter inn tallene ett og ett: " + o.keys.join(", ") + ".", "Setter inn " + o.keys.join(", ") + " i denne rekkefølgen.",
      "Innsettingsrekkefølgen bestemmer formen. Sortert input gir en kjede."), "Start");
    o.keys.forEach(function (x) {
      var path = [], v = root, par = null, dir = null;
      while (v) {
        path.push(v.id);
        if (x < v.k) {
          snap(5, { cur: v.id, path: path.slice() }, t(x + " er mindre enn " + v.k + ", så vi går til venstre.", x + " < " + v.k + ": gå til venstre.", "x = " + x + " < " + v.k + " → Insert(v.left, " + x + ")."), "Venstre");
          par = v; dir = "l"; v = v.l;
        } else if (x > v.k) {
          snap(7, { cur: v.id, path: path.slice() }, t(x + " er større enn " + v.k + ", så vi går til høyre.", x + " > " + v.k + ": gå til høyre.", "x = " + x + " > " + v.k + " → Insert(v.right, " + x + ")."), "Høyre");
          par = v; dir = "r"; v = v.r;
        } else {
          snap(8, { found: v.id, path: path.slice() }, t(x + " finnes allerede. Vi legger det ikke inn en gang til.", x + " = " + v.k + ": ingen av grenene slår til, så duplikatet ignoreres.", "Likhet: verken x < v.element eller x > v.element. Treet endres ikke."), "Duplikat");
          return;
        }
      }
      var nn = mk(x);
      if (!par) root = nn; else par[dir] = nn;
      snap(3, { fresh: nn.id, path: path.slice() }, t(par ? "Her er det tomt. " + x + " blir en ny node, festet " + (dir === "l" ? "til venstre" : "til høyre") + " for " + par.k + "." : "Treet er tomt, så " + x + " blir roten.",
        par ? "Null funnet: ny node " + x + " blir " + (dir === "l" ? "venstre" : "høyre") + " barn av " + par.k + "." : "Tomt tre: " + x + " blir rot.",
        "new Node(" + x + ") returneres og kobles på via " + (par ? par.k + (dir === "l" ? ".left" : ".right") : "roten") + ". Nye noder blir alltid løvnoder."), "Satt inn " + x);
    });
    var io = inorder(root, []).join(", ");
    snap(null, {}, t("Ferdig! Leser vi treet fra venstre mot høyre, står tallene i rekkefølge: " + io + ".",
      "Ferdig. Inorder gir sortert rekkefølge: " + io + ". Høyden er " + hOf(root) + ".",
      "Inorder = [" + io + "], h = " + hOf(root) + ". Hver innsetting kostet O(h)."), "Ferdig");
    return steps;
  });

  /* ---------- BST: søk ---------- */
  reg(IN.gen, "bstSearch", function (input) {
    var o = norm(input), x = o.x, root = bstFrom(o.keys), steps = [], path = [];
    function snap(line, marks, text, tag) { marks.path = path.slice(); steps.push({ line: line, tree: cl(root), marks: marks, text: text, tag: tag }); }
    snap(null, {}, t("Vi leter etter " + x + ".", "Search(rot, " + x + ").", "Søk etter x = " + x + ". Hver sammenligning forkaster et helt subtre."), "Start");
    var v = root;
    while (v) {
      path.push(v.id);
      if (v.k === x) {
        snap(3, { found: v.id }, t("Der er " + x + "! Vi fant det etter " + path.length + " skritt.", "Funnet " + x + " på dybde " + (path.length - 1) + ".", "v.element = x etter " + path.length + " sammenligninger (dybde " + (path.length - 1) + ")."), "Funnet");
        return steps;
      }
      if (x < v.k) {
        snap(4, { cur: v.id }, t(x + " er mindre enn " + v.k + ". Da må det ligge til venstre, så alt til høyre kan vi glemme.", x + " < " + v.k + ": gå til venstre.", x + " < " + v.k + ": høyre subtre forkastes."), "Venstre");
        v = v.l;
      } else {
        snap(5, { cur: v.id }, t(x + " er større enn " + v.k + ". Da må det ligge til høyre.", x + " > " + v.k + ": gå til høyre.", x + " > " + v.k + ": venstre subtre forkastes."), "Høyre");
        v = v.r;
      }
    }
    snap(2, {}, t("Vi kom til en tom plass. " + x + " finnes ikke i treet.", "v = null: " + x + " finnes ikke.", "Søket endte i null etter " + path.length + " sammenligninger: x finnes ikke."), "Ikke funnet");
    return steps;
  });

  /* ---------- BST: fjerning ---------- */
  reg(IN.gen, "bstRemove", function (input) {
    var o = norm(input), x0 = o.x, root = bstFrom(o.keys), steps = [], calls = [];
    // calls = nodene som har et Remove-kall i gang (stien fra roten). del = noden som skal fjernes.
    var del = [], keep = null;
    function snap(line, marks, text, tag) {
      fixH(root);
      if (!marks.path) marks.path = calls.slice();
      if (!marks.del) marks.del = del.slice();
      if (keep && marks.found === undefined) marks.found = keep;
      steps.push({ line: line, tree: cl(root), marks: marks, text: text, tag: tag });
    }
    function nk(v) { return v ? String(v.k) : "null"; }
    snap(null, {}, t("Vi skal fjerne " + x0 + ". Først må vi finne det.", "Remove(rot, " + x0 + "): finn noden først.", "Fjern x = " + x0 + ". Søkefasen er som Search: ett kall per nivå."), "Start");
    // Returnerer roten i subtreet etter fjerning. inner = kallet fra linje 13 (fjerner etterfølgerens gamle plass)
    function rem(v, x, inner) {
      if (!v) {
        snap(2, {}, t(x + " finnes ikke, så ingenting fjernes.", "Remove(null, " + x + "): v = null, så " + x + " finnes ikke. return null.", "Basistilfellet: Remove(null, x) = null. Treet er uendret."), "Ikke funnet");
        return null;
      }
      calls.push(v.id);
      var w;
      if (x < v.k) {
        snap(4, { cur: v.id }, t(x + " er mindre enn " + v.k + ", så vi leter videre til venstre.",
          "Linje 3: " + x + " < " + v.k + ". Kall Remove(v.left, " + x + ") = Remove(" + nk(v.l) + ", " + x + ").",
          x + " < v.element = " + v.k + ": rekursivt kall på venstre subtre. Svaret kobles på v.left når kallet returnerer."), "Venstre");
        w = rem(v.l, x, inner);
        var oldL = v.l; v.l = w; calls.pop();
        snap(5, { cur: v.id }, t((oldL !== w ? v.k + " fester " + (w ? w.k : "ingenting") + " til venstre, der " + oldL.k + " satt før." : "Under " + v.k + " er alt i orden.") + " " + v.k + " selv blir stående.",
          "v.left ← " + nk(w) + (oldL !== w ? " (var " + nk(oldL) + ")" : " (uendret)") + ". return " + v.k + ".",
          "Kallet returnerte " + nk(w) + ", som kobles på " + v.k + ".left. Remove(" + v.k + ", " + x + ") returnerer " + v.k + ": roten i dette subtreet er den samme."), "Retur " + v.k);
        return v;
      }
      if (x > v.k) {
        snap(7, { cur: v.id }, t(x + " er større enn " + v.k + ", så vi leter videre til høyre.",
          x + " < " + v.k + "? Nei. Linje 6: " + x + " > " + v.k + ". Kall Remove(v.right, " + x + ") = Remove(" + nk(v.r) + ", " + x + ").",
          x + " > v.element = " + v.k + ": rekursivt kall på høyre subtre. Svaret kobles på v.right når kallet returnerer."), "Høyre");
        w = rem(v.r, x, inner);
        var oldR = v.r; v.r = w; calls.pop();
        snap(8, { cur: v.id }, t((oldR !== w ? v.k + " fester " + (w ? w.k : "ingenting") + " til høyre, der " + oldR.k + " satt før." : "Under " + v.k + " er alt i orden.") + " " + v.k + " selv blir stående.",
          "v.right ← " + nk(w) + (oldR !== w ? " (var " + nk(oldR) + ")" : " (uendret)") + ". return " + v.k + ".",
          "Kallet returnerte " + nk(w) + ", som kobles på " + v.k + ".right. Remove(" + v.k + ", " + x + ") returnerer " + v.k + "."), "Retur " + v.k);
        return v;
      }
      // x = v.element
      del = [v.id];
      snap(6, { cur: v.id }, t((inner ? "Der er den gamle " + x + "-en." : "Der er " + x + "!") + " Den skal bort.",
        x + " < " + v.k + "? Nei. " + x + " > " + v.k + "? Nei. Altså x = v.element: " + (inner ? "den gamle kopien er funnet." : "noden er funnet."),
        "Begge sammenligningene er usanne, så x = v.element. Vi er i noden som skal fjernes."), "Funnet");
      if (!v.l) {
        snap(9, { cur: v.id }, t(v.r ? x + " har ikke noe barn til venstre. Da kan barnet til høyre, " + v.r.k + ", ta plassen." : x + " har ingen barn. Da kan vi bare ta den bort.",
          "v.left = null: return v.right = " + nk(v.r) + "." + (v.r ? " " + v.r.k + " rykker opp." : " Det var en løvnode."),
          v.r ? "Tilfelle 1 barn (høyre): subtreet til " + v.r.k + " returneres og tar plassen." : "Tilfelle 0 barn: v.left = null, så linja returnerer v.right = null."), v.r ? "Ett barn" : "Løvnode");
        calls.pop(); del = [];
        return v.r;
      }
      if (!v.r) {
        snap(10, { cur: v.id }, t(x + " har bare et barn til venstre, " + v.l.k + ". Det barnet tar plassen.",
          "v.left ≠ null, så linje 9 slår ikke til. v.right = null: return v.left = " + v.l.k + ".",
          "Tilfelle 1 barn (venstre): v.left ≠ null og v.right = null. Subtreet til " + v.l.k + " rykker opp."), "Ett barn");
        calls.pop(); del = [];
        return v.l;
      }
      snap(10, { cur: v.id }, t(x + " har to barn, så vi kan ikke bare ta den bort. Vi leter etter det minste tallet til høyre.",
        "v.left ≠ null og v.right ≠ null: verken linje 9 eller 10 slår til. To barn.",
        "Tilfelle 2 barn. Ingen av barna kan rykke opp alene, så vi bruker etterfølgeren."), "To barn");
      var u = v.r, p2 = calls.concat([u.id]);
      snap(11, { cur: u.id, path: p2.slice() }, t("Vi går ett steg til høyre, til " + u.k + ", og leter etter det minste der.", "FindMin(v.right) starter i " + u.k + ".", "FindMin(" + u.k + "): følg venstrekanten."), "FindMin");
      while (u.l) {
        u = u.l; p2.push(u.id);
        snap(11, { cur: u.id, path: p2.slice() }, t("Det finnes et mindre tall til venstre. Vi går videre til " + u.k + ".", "FindMin: venstre barn finnes, gå til " + u.k + ".", "FindMin går langs venstre kant: " + u.k + "."), "FindMin");
      }
      snap(11, { found: u.id, path: p2.slice() }, t(u.k + " har ingen til venstre. Det er det minste tallet til høyre.", "Etterfølger u = " + u.k + " (har ikke venstre barn).", "u = FindMin(v.right) = " + u.k + ". u.left = null."), "Etterfølger");
      var old = v.k; v.k = u.k; keep = v.id; del = [u.id];
      snap(12, { cur: u.id }, t("Vi skriver " + u.k + " inn der " + old + " stod. Nå står " + u.k + " to steder en liten stund. Den nederste skal bort.",
        "v.element ← " + u.k + ". Det står midlertidig to " + u.k + "-er.", "Verdikopi. Strukturen er uendret, og søketre-egenskapen holder rundt v."), "Kopier");
      snap(13, { cur: v.id }, t("Nå fjerner vi den gamle " + u.k + "-en til høyre. Vi leter etter den på samme måte som før.",
        "Kall Remove(v.right, " + u.k + ") = Remove(" + v.r.k + ", " + u.k + "). Den gamle kopien har ikke venstre barn.",
        "Rekursivt kall på høyre subtre. Det ender i tilfellet v.left = null, så det blir aldri et nytt to-barn-tilfelle."), "Kall Remove");
      var w2 = rem(v.r, u.k, true);
      var oldR2 = v.r; v.r = w2;
      snap(13, { cur: v.id }, t((oldR2 !== w2 ? v.k + " fester " + (w2 ? w2.k : "ingenting") + " til høyre." : "Kallet er ferdig, og den gamle " + u.k + "-en er borte."),
        "Kallet returnerte " + nk(w2) + ": v.right ← " + nk(w2) + ".",
        "v.right ← Remove(v.right, " + u.k + ") = " + nk(w2) + ". Den gamle plassen til etterfølgeren er klippet ut."), "v.right ← " + nk(w2));
      calls.pop(); keep = null;
      snap(14, { found: v.id }, t(old + " er borte, og " + u.k + " har tatt plassen. Noden står der fortsatt, nå med nytt tall.",
        "return v: noden har nå verdien " + u.k + ".", "Returner v. Roten i dette subtreet er samme node, med ny verdi."), "Retur " + v.k);
      return v;
    }
    root = rem(root, x0, false);
    del = []; keep = null;
    var io = inorder(root, []).join(", ");
    snap(null, { path: [] }, t("Ferdig! Tallene står fortsatt i riktig rekkefølge: " + (io || "treet er tomt") + ".",
      "Ferdig. Inorder: " + (io || "tomt tre") + ".", "Inorder = [" + io + "], fortsatt sortert, så treet er fortsatt et søketre. O(h)."), "Ferdig");
    return steps;
  });

  /* ---------- Diameter ---------- */
  reg(IN.gen, "treDiameter", function (input) {
    var o = norm(input), root = treeOf(o), steps = [], lab = {}, done = [], stack = [];
    var res = {};   // id → {h, d, deep:[ids ned til dypeste], best:[ids]}
    function snap(line, marks, text, tag, edges) {
      var L = {}; Object.keys(lab).forEach(function (k) { L[k] = lab[k]; });
      marks.done = done.slice(); marks.path = stack.map(function (v) { return v.id; });
      steps.push({ line: line, tree: cl(root), marks: marks, lab: L, text: text, tag: tag, edges: edges || null,
        info: [{ label: "Kallstakk", kind: "frames", items: stack.map(function (v, i) {
          var top = i === stack.length - 1;
          return { name: "Diameter(" + v.k + ")", note: top ? "har regnet ut " + (lab[v.id] || "(h, d)") : "venter på Diameter(" + stack[i + 1].k + ")", ret: false };
        }) }] });
    }
    snap(null, {}, t("Vi spør hver node om to ting: hvor høy er du, og hvor lang er den lengste stien hos deg? Svarene står under nodene som (h, d). Vi viser bare øyeblikket der hver node har fått svar fra barna sine.",
      "Postorder: hver node får (h, d) fra barna og regner ut sin egen. Merket under noden er (h, d). Forløpet er forkortet: vi viser ett steg per node, når h og d er regnet ut (linje 5–6). Kallene ned og null-kallene (som gir (−1, 0)) er hoppet over.",
      "Én gjennomgang nedenfra og opp. Etiketten under hver node er paret (h, d) som returneres. Forkortet forløp: ett steg per kall, når h og d er klare (linje 5–6), rett før return. Null-kallene returnerer (−1, 0) på linje 2 og vises ikke."), "Start");
    function rec(v) {
      if (!v) return { h: -1, d: 0, deep: [], best: [] };
      stack.push(v);
      var A = rec(v.l), B = rec(v.r);
      var h = 1 + Math.max(A.h, B.h), through = A.h + B.h + 2;
      var thrPath = A.deep.slice().reverse().concat([v.id]).concat(B.deep);
      var d = through, best = thrPath, src = "gjennom";
      if (A.d > d) { d = A.d; best = A.best; src = "venstre"; }
      if (B.d > d) { d = B.d; best = B.best; src = "høyre"; }
      var deep = [v.id].concat(A.h >= B.h ? A.deep : B.deep);
      lab[v.id] = "(" + h + ", " + d + ")"; done.push(v.id);
      var leaf = !v.l && !v.r;
      var edges = pathEdges(best);
      snap(6, { cur: v.id }, leaf
        ? t(v.k + " har ingen barn. Høyde 0, og ingen sti å gå: (0, 0).", "Løvnode " + v.k + ": begge null-kallene ga (−1, 0), så hL = hR = −1. Da blir h = 0 og d = −1 + (−1) + 2 = 0.", "Løvnode: h = 1 + Max(−1, −1) = 0, hL + hR + 2 = 0.")
        : t("Hos " + v.k + ": venstre side er " + neg(A.h) + " høy, høyre side " + neg(B.h) + ". En sti gjennom " + v.k + " blir " + through + " lang. Den lengste stien så langt er " + d + ".",
            v.k + ": hL = " + neg(A.h) + ", hR = " + neg(B.h) + ". h = " + h + ". Gjennom " + v.k + ": " + par(A.h) + " + " + par(B.h) + " + 2 = " + through + ". d = Max(" + through + ", " + A.d + ", " + B.d + ") = " + d + (src === "gjennom" ? " (gjennom " + v.k + ")." : " (ligger i " + src + " subtre)."),
            "h = 1 + Max(" + neg(A.h) + ", " + neg(B.h) + ") = " + h + ", d = Max(" + through + ", " + A.d + ", " + B.d + ") = " + d + "."), "(" + h + ", " + d + ")", edges);
      stack.pop();
      return { h: h, d: d, deep: deep, best: best };
    }
    var R = rec(root);
    var viaRoot = root && R.best.indexOf(root.id) >= 0;
    snap(7, { found: root ? root.id : null }, t("Ferdig! Den lengste stien er " + R.d + " kanter lang (markert)." + (viaRoot ? "" : " Legg merke til at den ikke går gjennom roten!"),
      "Diameter = " + R.d + ". Stien er markert." + (viaRoot ? " Her går den gjennom roten." : " Den går ikke gjennom roten (jf. H2023 b)."),
      "Diameter(rot) = (" + R.h + ", " + R.d + "). Lineær tid: hver node ga ett kall." + (viaRoot ? "" : " Den lengste stien ligger helt i et subtre.")), "Diameter " + R.d, pathEdges(R.best));
    return steps;
  });
  function par(n) { return n < 0 ? "(" + neg(n) + ")" : String(n); }   // «0 + (−1) + 2»
  function pathEdges(p) { var e = []; for (var i = 0; i + 1 < p.length; i++) e.push([p[i], p[i + 1]]); return e; }

  /* ---------- LCA (generelt tre med parent/depth) ---------- */
  reg(IN.gen, "lca", function (input) {
    var o = norm(input), root = genFrom(o.tree || TR.LCATRE), steps = [];
    var parent = {}, depth = {}, byKey = {};
    (function walk(v, p, d) { parent[v.id] = p; depth[v.id] = d; byKey[v.k] = v; v.ch.forEach(function (c) { walk(c, v, d + 1); }); })(root, null, 0);
    var lab = {}; Object.keys(depth).forEach(function (id) { lab[id] = "d=" + depth[id]; });
    var u = byKey[o.u], v = byKey[o.v];
    if (!u || !v) {
      steps.push({ line: null, tree: root, marks: {}, lab: lab, text: t("Finner ikke begge nodene i treet.", "Ukjent node. Bruk navn fra treet (a–j).", "Ukjent node."), tag: "Feil" });
      return steps;
    }
    var trail = [];
    function snap(line, marks, text, tag) { marks.path = trail.slice(); steps.push({ line: line, tree: root, marks: marks, lab: lab, text: text, tag: tag }); }
    snap(null, { cur: u.id, alt: v.id }, t("To klatrere står i " + u.k + " og " + v.k + ". De skal klatre opp til de møtes.",
      "LCA(" + u.k + ", " + v.k + "). Dybdene står under nodene.", "Hver node kjenner parent og depth. Vi løfter den dypeste til de møtes."), "Start");
    var guard = 0;
    while (u !== v && guard++ < 40) {
      if (depth[u.id] < depth[v.id]) {
        trail.push(v.id); var nv = parent[v.id];
        snap(4, { cur: u.id, alt: nv.id }, t(v.k + " står lengst nede (dybde " + depth[v.id] + "), så " + v.k + " klatrer opp til " + nv.k + ".",
          "u = " + u.k + " (d=" + depth[u.id] + "), v = " + v.k + " (d=" + depth[v.id] + "): ulike, v er dypest. v ← " + nv.k + ".",
          "depth(u) < depth(v): LCA(u, v.parent) med v.parent = " + nv.k + "."), "Løft v");
        v = nv;
      } else {
        trail.push(u.id); var nu = parent[u.id];
        snap(5, { cur: nu.id, alt: v.id }, t(u.k + " står minst like langt nede (dybde " + depth[u.id] + "), så " + u.k + " klatrer opp til " + nu.k + ".",
          "u = " + u.k + " (d=" + depth[u.id] + "), v = " + v.k + " (d=" + depth[v.id] + "): ulike, u er minst like dyp. u ← " + nu.k + ".",
          "depth(u) ≥ depth(v): LCA(u.parent, v) med u.parent = " + nu.k + "."), "Løft u");
        u = nu;
      }
    }
    snap(2, { found: u.id }, t("Klatrerne møttes i " + u.k + "! Det er den laveste felles forfederen.", "u = v = " + u.k + ": LCA = " + u.k + ".", "u = v: returner " + u.k + ". Antall kall var " + (trail.length + 1) + "."), "LCA = " + u.k);
    return steps;
  });

  /* ---------- LCA i BST ---------- */
  reg(IN.gen, "lcaBST", function (input) {
    var o = norm(input), x = Math.min(o.x, o.y), y = Math.max(o.x, o.y), root = bstFrom(o.keys), steps = [], path = [];
    var alts = [];
    each(root, function (n) { if (n.k === x || n.k === y) alts.push(n.id); });
    function snap(line, marks, text, tag) { marks.path = path.slice(); marks.alt = alts; steps.push({ line: line, tree: cl(root), marks: marks, text: text, tag: tag }); }
    snap(null, {}, t("Vi leter etter stedet der veiene til " + x + " og " + y + " skilles.", "LCABST(rot, " + x + ", " + y + "). x og y er markert.", "Følg søketre-ordningen til splittpunktet."), "Start");
    var v = root;
    while (v) {
      path.push(v.id);
      if (x <= v.k && v.k <= y) {
        snap(2, { found: v.id }, t(v.k + " ligger mellom " + x + " og " + y + ". Her skilles veiene, så " + v.k + " er svaret!",
          x + " ≤ " + v.k + " ≤ " + y + ": splittpunkt. LCA = " + v.k + ".", "Splittpunkt funnet etter " + path.length + " noder: O(h)."), "LCA = " + v.k);
        return steps;
      }
      if (y < v.k) { snap(3, { cur: v.id }, t("Begge tallene er mindre enn " + v.k + ". Svaret ligger til venstre.", y + " < " + v.k + ": begge til venstre.", "y < v.element ⇒ x < v.element."), "Venstre"); v = v.l; }
      else { snap(4, { cur: v.id }, t("Begge tallene er større enn " + v.k + ". Svaret ligger til høyre.", x + " > " + v.k + ": begge til høyre.", "x > v.element ⇒ y > v.element."), "Høyre"); v = v.r; }
    }
    snap(null, {}, t("Fant ikke tallene.", "x eller y finnes ikke i treet.", "Forutsetningen om at begge finnes er brutt."), "Feil");
    return steps;
  });

  /* ---------- AVL-innsetting ---------- */
  reg(IN.gen, "avlInsert", function (input) {
    var o = norm(input), root = o.base ? bstFrom(o.base) : null, steps = [], rots = 0;
    // pending: forfedre til den nye noden som ennå ikke har kjørt SetHeight. Høyden over dem er den gamle,
    // så b vises som «b=?» og de farges ikke røde før Balance faktisk sjekker dem.
    var pending = {};
    function snap(line, marks, text, tag) {
      var L = avlLabels(root), warn = (marks.warn || []).slice();
      Object.keys(pending).forEach(function (id) { if (L.lab[id] != null) L.lab[id] = "b=?"; });
      L.warn.forEach(function (id) { if (!pending[id] && warn.indexOf(id) < 0) warn.push(id); });
      marks.warn = warn;
      steps.push({ line: line, tree: cl(root), marks: marks, lab: L.lab, sup: L.sup, text: text, tag: tag, counter: "Rotasjoner: " + rots });
    }
    snap(null, {}, o.base
      ? t("Vi starter med et tre som er en lang stige (" + o.base.join("–") + "). Nå setter vi inn " + o.keys.join(", ") + " på AVL-måten.",
          "Starttre (ikke AVL): " + o.base.join(", ") + ". AVL-innsetting av " + o.keys.join(", ") + ". Tallet over noden er høyden, b under er balansefaktoren.",
          "Start fra et ubalansert BST. Insert kaller Balance på hver node på veien opp. Høyde h over, balansefaktor b = h(venstre) − h(høyre) under.")
      : t("Vi setter inn " + o.keys.join(", ") + ". Tallet over noden er høyden. b under noden viser hvor skjev den er.",
          "AVL-innsetting av " + o.keys.join(", ") + ". Høyde over noden, balansefaktor b under. Rød = ubalansert (|b| > 1).",
          "Høyde h over, b = h(venstre) − h(høyre) under. Invariant: |b| ≤ 1."), "Start");
    function rotateTxt(kind, z, y) {
      return kind === "L" ? "LeftRotate(" + z + "): " + y + " løftes opp, " + z + " blir venstre barn." : "RightRotate(" + z + "): " + y + " løftes opp, " + z + " blir høyre barn.";
    }
    function balance(v, attach) {
      var b = bf(v), nv;
      if (b < -1) {
        if (bf(v.r) > 0) {
          var z1 = v.r, y1 = z1.l;
          v.r = rotR(z1, true); rots++;
          snap(9, { rot: [z1.id, y1.id], cur: v.id }, t("Høyre barn bøyer seg innover. Først vrir vi det rett: " + y1.k + " opp, " + z1.k + " ned.",
            "Dobbelrotasjon, del 1: " + rotateTxt("R", z1.k, y1.k), "b(v.right) > 0: knekk. " + rotateTxt("R", z1.k, y1.k)), "Høyrerotasjon");
        }
        var y = v.r; nv = rotL(v, true); attach(nv); rots++;
        snap(9, { rot: [v.id, y.id] }, t("Nå vrir vi til venstre: " + y.k + " blir toppen, " + v.k + " går ned til venstre.",
          rotateTxt("L", v.k, y.k), rotateTxt("L", v.k, y.k) + " Subtreet er nå balansert."), "Venstrerotasjon");
        return nv;
      }
      if (b > 1) {
        if (bf(v.l) < 0) {
          var z2 = v.l, y2 = z2.r;
          v.l = rotL(z2, true); rots++;
          snap(9, { rot: [z2.id, y2.id], cur: v.id }, t("Venstre barn bøyer seg innover. Først vrir vi det rett: " + y2.k + " opp, " + z2.k + " ned.",
            "Dobbelrotasjon, del 1: " + rotateTxt("L", z2.k, y2.k), "b(v.left) < 0: knekk. " + rotateTxt("L", z2.k, y2.k)), "Venstrerotasjon");
        }
        var y3 = v.l; nv = rotR(v, true); attach(nv); rots++;
        snap(9, { rot: [v.id, y3.id] }, t("Nå vrir vi til høyre: " + y3.k + " blir toppen, " + v.k + " går ned til høyre.",
          rotateTxt("R", v.k, y3.k), rotateTxt("R", v.k, y3.k) + " Subtreet er nå balansert."), "Høyrerotasjon");
        return nv;
      }
      return v;
    }
    function ins(v, x, attach, path) {
      if (!v) {
        var nn = mk(x); attach(nn);
        path.forEach(function (id) { pending[id] = 1; });
        var up = path.length > 0;
        snap(3, { fresh: nn.id, path: path.slice() }, t("Tom plass: " + x + " blir en ny node her." + (up ? " Høydene over den er ikke oppdatert ennå (b=?). Det gjør vi på vei opp igjen." : ""),
          "Ny løvnode " + x + " (høyde 0)." + (up ? " Nodene over har fortsatt gammel høyde, så b vises som «?» til SetHeight har kjørt for dem." : " Treet var tomt, så den blir roten."),
          "new Node(" + x + "), h = 0." + (up ? " Forfedrene har utdatert h til SetHeight kjører på vei opp, så b er ukjent (?) for dem." : "")), "Ny node " + x);
        return nn;
      }
      path.push(v.id);
      if (x < v.k) {
        snap(5, { cur: v.id, path: path.slice() }, t(x + " er mindre enn " + v.k + ": til venstre.", x + " < " + v.k + ": gå til venstre.", "Insert(v.left, " + x + ")."), "Venstre");
        ins(v.l, x, function (s) { v.l = s; }, path);
      } else if (x > v.k) {
        snap(7, { cur: v.id, path: path.slice() }, t(x + " er større enn " + v.k + ": til høyre.", x + " > " + v.k + ": gå til høyre.", "Insert(v.right, " + x + ")."), "Høyre");
        ins(v.r, x, function (s) { v.r = s; }, path);
      } else {
        snap(9, { found: v.id, path: path.slice() }, t(x + " finnes alt. Ingenting skjer.", "Duplikat: ignoreres.", "Likhet: ingen endring."), "Duplikat");
        path.pop();
        return v;
      }
      path.pop();
      var oldH = v.h; setH(v); delete pending[v.id];
      var b = bf(v);
      if (Math.abs(b) <= 1) {
        snap(8, { cur: v.id, path: path.slice() }, t("Tilbake i " + v.k + ": høyden er " + v.h + ", og b = " + neg(b) + ". Det er innenfor, så vi lar den stå.",
          "SetHeight(" + v.k + "): h = " + v.h + (oldH !== v.h ? " (var " + oldH + ")" : "") + ". b = " + neg(b) + " ∈ [−1, 1]: Balance gjør ingenting.",
          "h(" + v.k + ") = " + v.h + ", b = " + neg(b) + ". Invarianten holder her."), "Sjekk " + v.k);
        return v;
      }
      var dbl = b < 0 ? bf(v.r) > 0 : bf(v.l) < 0, ch = b < 0 ? v.r : v.l;
      snap(9, { cur: v.id, warn: [v.id], path: path.slice() }, t("Oi! " + v.k + " står for skjevt (b = " + neg(b) + "). Vi må vri. " +
          (dbl ? "Barnet " + ch.k + " på den tunge siden bøyer seg innover, som en knekk. Da må vi vri to ganger: først rette ut knekken, så vri hele greina."
               : "Skjevheten går rett ut i én retning, så én vridning holder."),
        "SetHeight(" + v.k + "): h = " + v.h + ". b = " + neg(b) + ": ubalansert, Balance(" + v.k + ") roterer. " +
          (b < 0 ? "b(v.right) = b(" + ch.k + ") = " + neg(bf(ch)) + (dbl ? " > 0: høyre barn er venstretungt (en knekk), så det blir dobbelrotasjon: først RightRotate(" + ch.k + "), så LeftRotate(" + v.k + ")." : " ≤ 0: enkel LeftRotate(" + v.k + ").")
                 : "b(v.left) = b(" + ch.k + ") = " + neg(bf(ch)) + (dbl ? " < 0: venstre barn er høyretungt (en knekk), så det blir dobbelrotasjon: først LeftRotate(" + ch.k + "), så RightRotate(" + v.k + ")." : " ≥ 0: enkel RightRotate(" + v.k + ").")),
        "|b(" + v.k + ")| = " + Math.abs(b) + " > 1. " + (b < 0 ? "Høyretung" : "Venstretung") + (b < 0 ? (bf(v.r) > 0 ? ", knekk i høyre barn: dobbelrotasjon." : ": enkel venstrerotasjon.") : (bf(v.l) < 0 ? ", knekk i venstre barn: dobbelrotasjon." : ": enkel høyrerotasjon."))), "Ubalanse");
      return balance(v, attach);
    }
    o.keys.forEach(function (x) {
      snap(null, {}, t("Neste tall: " + x + ".", "Insert(rot, " + x + ").", "Sett inn " + x + "."), "Sett inn " + x);
      ins(root, x, function (s) { root = s; }, []);
    });
    snap(null, { done: ids(root) }, t("Ferdig! Treet er i balanse overalt. Vi vred " + rots + " gang" + (rots === 1 ? "" : "er") + ".",
      "Ferdig. Rot: " + (root ? root.k : "–") + ", høyde " + hOf(root) + ". " + rots + " enkle rotasjoner totalt (en dobbel teller som to).",
      "AVL-tre med h = " + hOf(root) + " og n = " + ids(root).length + ". Rotasjoner: " + rots + "."), "Ferdig");
    return steps;
  });

  /* ---------- Anti-AVL (H2025) ---------- */
  reg(IN.gen, "insertAntiAVL", function (input) {
    var o = norm(input), root = null, steps = [], rots = 0;
    function snap(line, marks, text, tag) { fixH(root); steps.push({ line: line, tree: cl(root), marks: marks, text: text, tag: tag, counter: "Rotasjoner: " + rots }); }
    snap(null, {}, t("Vi setter inn " + o.keys.join(", ") + " med Anti-AVL-regelen: dukker det opp et venstre barn, vrir vi det bort.",
      "InsertAntiAVL av " + o.keys.join(", ") + ". Høyrerotasjon hver gang en node på veien har venstre barn.",
      "Regel: etter rekursjonen, hvis v.left ≠ null, returner RightRotate(v)."), "Start");
    function ins(v, x, attach, path) {
      if (!v) {
        var nn = mk(x); attach(nn);
        snap(3, { fresh: nn.id, path: path.slice() }, t(x + " blir en ny node.", "Ny løvnode " + x + ".", "new Node(" + x + ")."), "Ny node " + x);
        return nn;
      }
      path.push(v.id);
      if (x < v.k) {
        snap(5, { cur: v.id, path: path.slice() }, t(x + " er mindre enn " + v.k + ": til venstre.", x + " < " + v.k + ": gå til venstre.", "InsertAntiAVL(v.left, " + x + ")."), "Venstre");
        ins(v.l, x, function (s) { v.l = s; }, path);
      } else if (x > v.k) {
        snap(7, { cur: v.id, path: path.slice() }, t(x + " er større enn " + v.k + ": til høyre.", x + " > " + v.k + ": gå til høyre.", "InsertAntiAVL(v.right, " + x + ")."), "Høyre");
        ins(v.r, x, function (s) { v.r = s; }, path);
      } else { path.pop(); return v; }
      path.pop();
      if (v.l) {
        var y = v.l;
        snap(8, { cur: v.id, warn: [v.id], path: path.slice() }, t(v.k + " har fått et barn til venstre (" + y.k + "). Det er ikke lov i Anti-AVL!",
          v.k + ".left = " + y.k + " ≠ null: høyrerotasjon.", "v.left ≠ null ⇒ RightRotate(" + v.k + ")."), "Venstre barn!");
        var nv = rotR(v, false); attach(nv); rots++;
        snap(9, { rot: [v.id, y.id], path: path.slice() }, t("Vi vrir til høyre: " + y.k + " blir toppen, og " + v.k + " henger til høyre for den.",
          "RightRotate(" + v.k + "): " + y.k + " opp, " + v.k + " blir høyre barn.", "Rotasjon nr. " + rots + ". Søketre-egenskapen er bevart."), "Høyrerotasjon");
        return nv;
      }
      snap(10, { cur: v.id, path: path.slice() }, t(v.k + " har ikke noe barn til venstre, så her trenger vi ikke vri. " + v.k + " blir stående.",
        v.k + ".left = null, så linje 8 slår ikke til: ingen rotasjon. return " + v.k + ".",
        "v.left = null: betingelsen på linje 8 er usann, og subtreet er allerede en høyrekjede. return v."), "Ingen rotasjon");
      return v;
    }
    o.keys.forEach(function (x) {
      snap(null, {}, t("Neste tall: " + x + ".", "InsertAntiAVL(rot, " + x + ").", "Sett inn " + x + "."), "Sett inn " + x);
      ins(root, x, function (s) { root = s; }, []);
    });
    var io = inorder(root, []).join(" → ");
    snap(null, { done: ids(root) }, t("Ferdig! Treet ble en lang stige mot høyre: " + io + ". Vi vred " + rots + " gang" + (rots === 1 ? "" : "er") + ".",
      "Ferdig. Høyrekjede " + io + ", høyde " + hOf(root) + ". Totalt " + rots + " rotasjoner.",
      "Resultatet er en sortert høyrekjede med h = n − 1 = " + hOf(root) + ". Oppslag blir derfor O(n). Rotasjoner: " + rots + "."), "Ferdig");
    return steps;
  });

  /* ---------- Huffman ---------- */
  reg(IN.gen, "huffman", function (input) {
    var o = norm(input), pairs = o.pairs || [], steps = [], Q = [], seq = 0, cnt = 0;
    // Likhet i frekvens: kurset sier ikke hvem som tas ut først. Demoen (og TR.huffman) tar den som kom først inn i køen.
    function sortQ() { Q.sort(function (a, b) { return a.f - b.f || a.seq - b.seq; }); }
    function syms(v) { return v.sym !== undefined ? [v.sym] : syms(v.l).concat(syms(v.r)); }
    function name(v) { return v.sym !== undefined ? v.sym : "(" + syms(v).join(",") + ")"; }
    function item(v) { return name(v) + ":" + v.f; }
    function labs(list) {
      var L = {};
      list.forEach(function (r) { (function w(v) { if (!v) return; if (v.sym !== undefined) L[v.id] = String(v.f); w(v.l); w(v.r); })(r); });
      return L;
    }
    function snap(line, forest, marks, text, tag, info) {
      steps.push({ line: line, forest: forest.map(cl), marks: marks, lab: labs(forest), text: text, tag: tag, bits: true,
        info: info || [{ label: "Kø (minst først)", items: Q.map(item), kind: "queue" }] });
    }
    pairs.forEach(function (p) { Q.push({ id: "L" + p[0], k: p[0], sym: p[0], f: p[1], l: null, r: null, h: 0, seq: seq++ }); });
    sortQ();
    var ties = false;
    for (var i = 0; i + 1 < Q.length; i++) if (Q[i].f === Q[i + 1].f) ties = true;
    snap(4, Q, {}, t("Hver bokstav blir en liten node med tallet for hvor ofte den brukes. Alle står i køen, minst først. Er to tall like, står den som kom først inn, foran.",
      "Én løvnode per symbol, lagt i prioritetskøen (sortert på frekvens). Ved lik frekvens tar demoen ut den som kom først inn i køen. Kurset bestemmer ikke dette. Et annet valg kan gi andre koder, men like god total lengde.",
      "n = " + pairs.length + " løvnoder i Q. Løkka vil kjøre n − 1 = " + (pairs.length - 1) + " ganger. Likhet brytes her med innsettingsrekkefølge (FIFO blant like). Kurset fastsetter ingen regel, og alle valg gir optimal total kodelengde."), "Løvnoder");
    var round = 0;
    while (Q.length > 1) {
      round++;
      var v1 = Q.shift();
      snap(6, [v1].concat(Q), { cur: v1.id }, t("Vi tar ut den minste: " + name(v1) + " (" + v1.f + ").",
        "v1 ← RemoveMin(Q) = " + item(v1) + ".",
        "RemoveMin gir minste frekvens, " + v1.f + "." + (Q.length && Q[0].f === v1.f ? " " + name(Q[0]) + " har samme frekvens, men kom senere inn i køen." : "")), "v1 = " + name(v1));
      var v2 = Q.shift();
      snap(7, [v1, v2].concat(Q), { cur: v1.id, alt: v2.id }, t("Så tar vi ut den nest minste: " + name(v2) + " (" + v2.f + ").",
        "v2 ← RemoveMin(Q) = " + item(v2) + ".",
        "Ny RemoveMin: v2 har frekvens " + v2.f + ". De to minste skal slås sammen. Det er det grådige valget."), "v2 = " + name(v2));
      var nv = { id: "N" + (cnt++), k: v1.f + v2.f, f: v1.f + v2.f, l: v1, r: v2, h: 0, seq: seq++ };
      snap(10, [nv].concat(Q), { fresh: nv.id }, t("Vi lager en ny node over dem med summen " + v1.f + " + " + v2.f + " = " + nv.f + ". " + name(v1) + " henger til venstre (0) og " + name(v2) + " til høyre (1).",
        "Linje 8–10: ny intern node " + name(nv) + " med frekvens " + v1.f + " + " + v2.f + " = " + nv.f + ". v1 til venstre (bit 0), v2 til høyre (bit 1).",
        "new Node(null, " + nv.f + ") med v.left = v1 og v.right = v2. Den er ikke i køen ennå."), "Ny node " + nv.f);
      Q.push(nv); sortQ();
      snap(11, Q, { fresh: nv.id }, t("Den nye noden stiller seg i køen igjen, på riktig plass etter tallet " + nv.f + ".",
        "Insert(Q, v): " + item(nv) + " er tilbake i køen. Nå er det " + Q.length + " " + (Q.length === 1 ? "tre" : "trær") + " i køen.",
        "Insert(Q, v) i O(log n). Q har nå " + Q.length + " " + (Q.length === 1 ? "tre" : "trær") + " etter runde " + round + " av " + (pairs.length - 1) + "."), "Insert " + nv.f);
    }
    snap(5, Q, {}, t("Nå står det bare ett tre igjen i køen, så vi er ferdige med å slå sammen.",
      "Size(Q) = " + Q.length + ", og " + Q.length + " > 1 er usant. Løkka stopper.",
      "Size(Q) = 1 etter n − 1 = " + (pairs.length - 1) + " runder: løkka stopper."), "Løkka stopper");
    var H = TR.huffman(pairs), rows = [], lens = [];
    pairs.forEach(function (p) { rows.push(p[0] + " = " + H.codes[p[0]] + " (" + H.codes[p[0]].length + ")"); lens.push(H.codes[p[0]].length); });
    var allSame = pairs.every(function (p) { return p[1] === pairs[0][1]; });
    var lmin = Math.min.apply(null, lens), lmax = Math.max.apply(null, lens);
    snap(12, Q, { done: Q.length ? ids(Q[0]) : [] }, allSame
      ? t("Bare ett tre igjen: det er Huffman-treet! Alle bokstavene var like vanlige, så ingen fortjener en kortere kode. Kodene ble " + (lmin === lmax ? "like lange" : "nesten like lange") + ".",
          "Ferdig. Kodene leses langs stien fra roten: venstre = 0, høyre = 1. Med like frekvenser blir treet så jevnt som mulig, og kodene " + (lmin === lmax ? "like lange (" + lmin + " bit)." : "får lengde " + lmin + " eller " + lmax + "."),
          "Roten returneres. Like frekvenser gir et (nesten) balansert tre: kodelengdene er ⌊log₂ n⌋ eller ⌈log₂ n⌉, som en fast lengde-koding.")
      : t("Bare ett tre igjen: det er Huffman-treet! Følg kantene fra toppen ned til en bokstav for å få koden. Bokstaver som brukes lite, havner langt nede og får lange koder.",
          "Ferdig. Kodene leses langs stien fra roten: venstre = 0, høyre = 1. Sjeldne symboler havner dypest og får lengst kode.",
          "Roten returneres. Kodelengde = dybden til løvnoden." + (ties ? " Med et annet valg ved lik frekvens kan enkelte koder bli annerledes, men den totale lengden blir den samme." : "")), "Ferdig",
      [{ label: "Koder (lengde)", items: rows }]);
    return steps;
  });
})();
