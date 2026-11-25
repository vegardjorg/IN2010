/* ============================================================
   IN2010 guide · data-lister.js  (Lister & stakk)
   Pseudokode (IN.algos) og steg-generatorer (IN.gen) for
   dynamisk array (PushBack, EnsureCapacity, PopBack, Add, Remove),
   enkelt- og dobbeltlenket liste (NodeAt, InsertAfter, RemoveAfter,
   RemoveNode), velformaterte tagger (H2020 oppgave 9) og «nylige søk»
   (ukesoppgave 08, ofte kalt LRU-cache).
   Alle nøkler har prefikset «ls». Steg tegnes av viz-list.js.
   Demoer med flere pseudokoder bruker linjenummer 100·a + linje.
   Pseudokoden følger notasjonen i forelesning 1 (D.A, D.n, |D.A|, L.first).
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.algos = IN.algos || {};
  IN.gen = IN.gen || {};

  function t(eli5, normal, teknisk) { return { eli5: eli5, normal: normal, teknisk: teknisk }; }
  function reg(obj, key, val) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (window.console && console.warn) console.warn("data-lister.js: «" + key + "» finnes fra før og beholdes.");
      return;
    }
    obj[key] = val;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function cfgOf(input) { var c = Array.isArray(input) ? input[0] : input; return c || {}; }
  var LS = (IN.ls = IN.ls || {});
  LS.esc = esc;

  /* Variabellinja (varline.js): navnene er de samme som i pseudokoden.
     idx = plass i et array / en tagg, eller id-en til en node (prikken får fargen til cella/noden). */
  function sv(name, v) { return { name: name, value: v }; }
  function iv(name, i, part) { return i == null ? { name: name, value: null } : { name: name, value: i, idx: i, part: part || 0 }; }
  function ndv(name, id, label, part) { return id == null ? { name: name, value: null } : { name: name, value: label, idx: id, part: part || 0 }; }
  function frameOf(line, names) { return line == null ? null : names[Math.floor(line / 100)] || names[0]; }
  function linkVars(steps) { for (var z = 1; z < steps.length; z++) if (steps[z].vars) steps[z].varsPrev = steps[z - 1].vars || []; return steps; }

  /* ================================================================
     PSEUDOKODE
     ================================================================ */

  /* ---------- Dynamisk array ---------- */
  reg(IN.algos, "lsPushBack", {
    title: "PushBack: legg til bakerst", name: "PushBack", params: "D, e",
    input: "Et dynamisk array D (arrayet D.A og antallet D.n) og et element e",
    output: "D, med e lagt til bakerst",
    lines: [
      { code: "EnsureCapacity(D)", indent: 1,
        eli5: "Sjekk at det er en ledig plass. Er det fullt, flytter vi til en større hylle først.",
        normal: "Sørg for at D.A har minst én ledig plass. Er arrayet fullt, lages et dobbelt så stort array.",
        teknisk: "O(1) hvis det er plass, O(D.n) hvis alt må kopieres. Det er dette kallet som gjør PushBack O(n) i verste tilfelle." },
      { code: "D.A[D.n] ← e", indent: 1,
        eli5: "Legg e på den første ledige plassen.",
        normal: "Elementene ligger på plass 0 til D.n − 1, så første ledige plass er D.n.",
        teknisk: "Direkte skriving i et array, O(1)." },
      { code: "D.n ← D.n + 1", indent: 1,
        eli5: "Nå er det ett element mer.",
        normal: "Øk antallet, så neste PushBack skriver på plassen etter.",
        teknisk: "D.n er både antall elementer og indeksen til første ledige plass." }
    ],
    bigO: { best: "O(1)", avg: "O(1) amortisert", worst: "O(n)", space: "O(1) ekstra (O(n) når vi kopierer)",
      why: t("Som oftest er det plass, og da går det fort. Av og til må alt flyttes til en større hylle, men det skjer sjelden.",
        "Er det plass, er PushBack O(1). Er arrayet fullt, kopierer EnsureCapacity alle n elementene: O(n). Fordi størrelsen dobles, skjer det så sjelden at snittet blir O(1).",
        "Verste tilfelle O(n) for ett kall. n kall koster til sammen O(n), fordi kopieringene blir 1 + 2 + 4 + … < 2n. Det kalles amortisert O(1). Du trenger ikke kunne utlede dette selv, bare forstå begrepet.") }
  });

  reg(IN.algos, "lsEnsureCapacity", {
    title: "EnsureCapacity: doble når det er fullt", name: "EnsureCapacity", params: "D",
    input: "Et dynamisk array D", output: "D, med minst én ledig plass i D.A",
    lines: [
      { code: "if D.n < |D.A| then", indent: 1,
        eli5: "Er det fortsatt ledig plass?",
        normal: "|D.A| er hvor mange plasser arrayet har. Er D.n mindre, finnes det en ledig plass.",
        teknisk: "Kapasiteten |D.A| og antallet D.n er to ulike ting. Bare når D.n = |D.A| må vi gjøre noe." },
      { code: "return", indent: 2,
        eli5: "Ja! Da er vi ferdige, ingenting å gjøre.", normal: "Det er plass, så vi er ferdige. O(1).", teknisk: "Det vanlige tilfellet: O(1)." },
      { code: "A ← new array of size |D.A| · 2", indent: 1,
        eli5: "Fullt! Lag en ny hylle som er dobbelt så lang.",
        normal: "Lag et nytt array med dobbelt så mange plasser.",
        teknisk: "Dobling (ikke «+1») er hele poenget: da blir kopieringene sjeldne nok til at snittet per PushBack blir O(1)." },
      { code: "for i ← 0 to D.n − 1 do", indent: 1,
        eli5: "Gå gjennom alle tingene på den gamle hylla, én etter én.",
        normal: "Gå gjennom alle de D.n elementene.",
        teknisk: "D.n runder, så O(D.n). Her ligger kostnaden.",
        grense: { q: "Hvorfor D.n − 1 og ikke D.n?", a: t(
          "Vi teller fra 0. Har vi 4 ting, ligger de på plass 0, 1, 2 og 3.",
          "Elementene ligger på plass 0 til D.n − 1. Plass D.n er den første ledige, så den er det ingenting å kopiere fra.",
          "0-indeksert: D.n elementer har indeksene 0, …, D.n − 1. Løkka gjør dermed nøyaktig D.n kopieringer.") } },
      { code: "A[i] ← D.A[i]", indent: 2,
        eli5: "Flytt tingen til samme plass på den nye hylla.",
        normal: "Kopier elementet til samme indeks i det nye arrayet.",
        teknisk: "Rekkefølgen og indeksene er de samme etterpå. Bare kapasiteten er endret." },
      { code: "D.A ← A", indent: 1,
        eli5: "Nå bruker vi den nye, lange hylla.",
        normal: "D bruker nå det nye arrayet. Det gamle kastes.",
        teknisk: "Etterpå er |D.A| = 2 · D.n, så de neste D.n PushBack-ene er O(1)." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(n)", space: "O(n) for det nye arrayet",
      why: t("Er det plass, skjer ingenting. Er det fullt, må alt flyttes.",
        "O(1) hvis det er plass. Ellers kopieres alle n elementene: O(n).",
        "O(1) når D.n < |D.A|, ellers O(D.n) for kopieringen pluss det nye arrayet.") }
  });

  reg(IN.algos, "lsPopBack", {
    title: "PopBack: fjern bakerst", name: "PopBack", params: "D",
    input: "Et dynamisk array D som ikke er tomt", output: "Det siste elementet, som fjernes fra D",
    lines: [
      { code: "e ← D.A[D.n − 1]", indent: 1,
        eli5: "Ta den siste tingen på hylla.",
        normal: "Det siste elementet ligger på plass D.n − 1.",
        teknisk: "Direkte oppslag, O(1). Forutsetter at D ikke er tomt (D.n ≥ 1)." },
      { code: "D.A[D.n − 1] ← null", indent: 1,
        eli5: "Nå er den plassen tom.", normal: "Tøm plassen.", teknisk: "Ikke strengt nødvendig for korrektheten, men det slipper referansen til elementet." },
      { code: "D.n ← D.n − 1", indent: 1,
        eli5: "Én ting mindre.", normal: "Ett element færre.", teknisk: "Ingen flytting og ingen krymping: O(1)." },
      { code: "return e", indent: 1,
        eli5: "Gi tilbake tingen vi tok.", normal: "Returner elementet.", teknisk: "O(1) totalt." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("Vi tar bare den siste. Ingen andre ting må flyttes.", "Bakerste plass er D.n − 1, og ingen andre elementer flyttes.", "Konstant antall operasjoner uansett n.") }
  });

  reg(IN.algos, "lsAdd", {
    title: "Add: sett inn på plass i", name: "Add", params: "D, i, e",
    input: "Et dynamisk array D, en indeks i med 0 ≤ i ≤ D.n og et element e",
    output: "D, med e på plass i og alle elementer fra i og utover flyttet én plass til høyre",
    lines: [
      { code: "EnsureCapacity(D)", indent: 1,
        eli5: "Sørg for at det er plass til én til.", normal: "Samme som i PushBack: det må finnes en ledig plass.", teknisk: "O(1) eller O(D.n)." },
      { code: "for j ← D.n − 1 downto i do", indent: 1,
        eli5: "Begynn bakerst og flytt hver ting ett hakk til høyre, helt til vi kommer til plass i.",
        normal: "Gå baklengs fra det siste elementet ned til plass i.",
        teknisk: "D.n − i runder. Verst for i = 0: O(D.n). Kurset skriver «down to»; her står det downto.",
        grense: { q: "Hvorfor baklengs, og hvorfor fra D.n − 1?", a: t(
          "Hvis vi flytter forfra, skubber vi en ting oppå naboen før naboen er flyttet. Da blir den borte. Derfor begynner vi bakerst.",
          "D.n − 1 er det siste elementet. Går vi forlengs, overskriver D.A[j + 1] ← D.A[j] et element vi ikke har flyttet ennå. Baklengs flyttes hvert element før plassen det står på, blir skrevet over.",
          "Baklengs garanterer at D.A[j + 1] er ledig eller allerede kopiert når vi skriver dit. Løkka går fra siste brukte indeks D.n − 1 ned til i, altså D.n − i runder (null runder når i = D.n).") } },
      { code: "D.A[j + 1] ← D.A[j]", indent: 2,
        eli5: "Flytt tingen ett hakk til høyre.", normal: "Kopier elementet én plass til høyre.", teknisk: "Etter steget står elementet på både j og j + 1, til plass j blir skrevet over." },
      { code: "D.A[i] ← e", indent: 1,
        eli5: "Nå er plass i ledig. Legg e der.", normal: "Plass i er frigjort, så e kan settes inn.", teknisk: "O(1)." },
      { code: "D.n ← D.n + 1", indent: 1,
        eli5: "Én ting mer.", normal: "Øk antallet.", teknisk: "Totalt O(D.n − i), altså O(n) i verste tilfelle." }
    ],
    bigO: { best: "O(1) (i = D.n)", avg: "O(n)", worst: "O(n)", space: "O(1) ekstra",
      why: t("Alt som står etter plass i, må flyttes ett hakk. Setter vi inn helt foran, må alt flyttes.",
        "Vi flytter D.n − i elementer. For i = 0 er det alle n, så O(n). Bakerst (i = D.n) er det ingen, og da er det som PushBack.",
        "O(D.n − i) for flyttingen pluss EnsureCapacity. Verste tilfelle O(n).") }
  });

  reg(IN.algos, "lsRemove", {
    title: "Remove: fjern plass i", name: "Remove", params: "D, i",
    input: "Et dynamisk array D og en indeks i med 0 ≤ i < D.n",
    output: "D, uten elementet på plass i, og med alt etter i flyttet én plass til venstre",
    lines: [
      { code: "for j ← i to D.n − 2 do", indent: 1,
        eli5: "Fra plass i og bakover: flytt hver ting ett hakk til venstre, så hullet blir tettet.",
        normal: "Gå forlengs fra i og flytt elementene etter i én plass til venstre.",
        teknisk: "D.n − 1 − i runder. Verst for i = 0: O(D.n).",
        grense: { q: "Hvorfor D.n − 2 og ikke D.n − 1?", a: t(
          "Vi henter alltid tingen til høyre for oss. Den siste tingen har ingen til høyre, så vi stopper én plass før.",
          "Kroppen leser D.A[j + 1]. Den siste lovlige indeksen er D.n − 1, så j kan høyst være D.n − 2. Den siste plassen tømmes etter løkka.",
          "j + 1 ≤ D.n − 1 gir j ≤ D.n − 2. Er i = D.n − 1 (fjern den siste), kjører løkka null ganger.") } },
      { code: "D.A[j] ← D.A[j + 1]", indent: 2,
        eli5: "Flytt naboen til høyre inn på plassen.", normal: "Kopier elementet til høyre én plass til venstre.", teknisk: "Forlengs er trygt her: vi skriver over plassen vi nettopp har kopiert fra." },
      { code: "D.A[D.n − 1] ← null", indent: 1,
        eli5: "Den siste plassen er nå dobbel, så vi tømmer den.", normal: "Det siste elementet står nå to steder. Tøm den bakerste plassen.", teknisk: "Rydder den gamle bakerste plassen." },
      { code: "D.n ← D.n − 1", indent: 1,
        eli5: "Én ting mindre.", normal: "Ett element færre.", teknisk: "Totalt O(D.n − i), O(n) i verste tilfelle." }
    ],
    bigO: { best: "O(1) (i = D.n − 1)", avg: "O(n)", worst: "O(n)", space: "O(1)",
      why: t("Alt bak hullet må flyttes ett hakk fram. Fjerner vi den første, må alt flyttes.",
        "Vi flytter D.n − 1 − i elementer: alle når i = 0, ingen når vi fjerner det siste.",
        "O(D.n − i). Verste tilfelle O(n), beste O(1).") }
  });

  /* ---------- Enkeltlenket liste ---------- */
  reg(IN.algos, "lsNodeAt", {
    title: "NodeAt: finn noden på plass i", name: "NodeAt", params: "L, i",
    input: "En lenket liste L og en indeks i med 0 ≤ i < n", output: "Noden på plass i",
    lines: [
      { code: "it ← L.first", indent: 1,
        eli5: "Start ved den første vogna i toget.",
        normal: "Vi kan bare komme inn i lista forfra, via L.first.",
        teknisk: "En lenket liste har ingen indekser. Vi har bare en peker til første node." },
      { code: "for j ← 0 to i − 1 do", indent: 1,
        eli5: "Gå én vogn fram, så mange ganger som plassnummeret sier.",
        normal: "Gå i steg fram. Etter j steg står vi på node nummer j.",
        teknisk: "i runder, så O(i) og O(n) i verste tilfelle.",
        grense: { q: "Hvorfor i − 1 og ikke i?", a: t(
          "Vi står allerede på vogn 0. For å komme til vogn 3 må vi gå 3 ganger: 0, 1, 2. Da er vi framme.",
          "Løkka går for j = 0, 1, …, i − 1. Det er i runder, og hver runde flytter oss én node. Fra node 0 kommer vi da til node i.",
          "Etter k runder peker it på node k (invariant). Løkka gjør i runder og stopper på node i. Med i = 0 kjører den null ganger, og vi returnerer L.first.") } },
      { code: "it ← it.next", indent: 2,
        eli5: "Hopp til neste vogn.", normal: "Følg next-pekeren til neste node.", teknisk: "O(1) per steg." },
      { code: "return it", indent: 1,
        eli5: "Her er vogna vi lette etter.", normal: "it er noden på plass i.", teknisk: "Get, Set, Add og Remove på lenket liste bruker NodeAt og arver derfor O(n)." }
    ],
    bigO: { best: "O(1) (i = 0)", avg: "O(n)", worst: "O(n)", space: "O(1)",
      why: t("Vi må gå vogn for vogn. Ligger vogna langt bak, tar det lang tid.",
        "Vi følger i pekere. For i = n − 1 er det n − 1 steg, altså O(n).",
        "i iterasjoner med O(1) arbeid hver. Ingen direkte adressering som i et array.") }
  });

  reg(IN.algos, "lsInsertAfter", {
    title: "InsertAfter: sett inn etter v (enkeltlenket)", name: "InsertAfter", params: "v, e",
    input: "En node v i en enkeltlenket liste og et element e", output: "Lista, med en ny node med e rett etter v",
    lines: [
      { code: "u ← new Node(e)", indent: 1,
        eli5: "Lag en ny vogn med e i.", normal: "Lag en ny node u som inneholder e.", teknisk: "u.next er null til vi setter den." },
      { code: "u.next ← v.next", indent: 1,
        eli5: "Fest den nye vogna til den som før kom etter v.",
        normal: "u skal peke på det som før kom etter v.",
        teknisk: "Denne må komme først. Setter vi v.next ← u før, mister vi pekeren til resten av lista." },
      { code: "v.next ← u", indent: 1,
        eli5: "Fest v til den nye vogna. Nå henger alt sammen igjen.", normal: "v peker nå på u, og u er satt inn.", teknisk: "To pekerendringer: O(1), uansett hvor lang lista er." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("Vi bare kobler om to pekere. Det tar like kort tid uansett hvor langt toget er.",
        "Et fast antall pekerendringer. Men å finne v (med NodeAt) kan koste O(n).",
        "O(1) gitt v. Add(L, i, e) blir O(n) fordi den må finne noden med NodeAt først.") }
  });

  reg(IN.algos, "lsRemoveAfter", {
    title: "RemoveAfter: fjern noden etter v", name: "RemoveAfter", params: "v",
    input: "En node v der v.next ≠ null", output: "Elementet i noden etter v, som fjernes",
    lines: [
      { code: "e ← v.next.elem", indent: 1,
        eli5: "Se hva som ligger i vogna etter v.", normal: "Ta vare på elementet vi fjerner.", teknisk: "Forutsetter v.next ≠ null." },
      { code: "v.next ← v.next.next", indent: 1,
        eli5: "La v hoppe over den vogna. Da er den ikke lenger med i toget.",
        normal: "v peker forbi noden, så den ikke lenger er med i lista.",
        teknisk: "Én pekerendring. Ingen peker lenger på den gamle noden." },
      { code: "return e", indent: 1,
        eli5: "Gi tilbake det som lå i vogna.", normal: "Returner elementet.", teknisk: "O(1)." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("Bare én peker endres.", "Én pekerendring, uansett lengde. Å finne v kan koste O(n).",
        "O(1) gitt v. Merk at vi trenger noden <i>foran</i> den vi fjerner, fordi det bare finnes next-pekere.") }
  });

  /* ---------- Dobbeltlenket liste (med hode og hale) ---------- */
  reg(IN.algos, "lsDInsertAfter", {
    title: "InsertAfter: sett inn etter v (dobbeltlenket)", name: "InsertAfter", params: "v, e",
    input: "En node v i en dobbeltlenket liste der v.next ≠ null, og et element e",
    output: "Lista, med en ny node med e rett etter v",
    lines: [
      { code: "u ← new Node(e)", indent: 1,
        eli5: "Lag en ny vogn med e i.", normal: "Lag en ny node u.", teknisk: "u har både next og prev." },
      { code: "u.prev ← v", indent: 1,
        eli5: "Den nye vogna skal vite at v står foran den.", normal: "Noden foran u er v.", teknisk: "Først setter vi begge pekerne i u. Det ødelegger ingenting." },
      { code: "u.next ← v.next", indent: 1,
        eli5: "… og hvem som står bak den.", normal: "Noden etter u er den som før kom etter v.", teknisk: "Nå peker u riktig begge veier, men ingen peker på u ennå." },
      { code: "v.next.prev ← u", indent: 1,
        eli5: "Vogna bak skal nå vite at u står foran den.", normal: "Noden etter v skal ha u som forgjenger.",
        teknisk: "Bruker v.next før vi endrer den. Det er derfor denne linja kommer før den siste." },
      { code: "v.next ← u", indent: 1,
        eli5: "Og v skal ha u bak seg. Ferdig!", normal: "Til slutt peker v på u.", teknisk: "Fire pekerendringer: O(1), omtrent dobbelt så mye arbeid som i enkeltlenket liste." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("Vi kobler om fire pekere. Det tar like kort tid uansett lengde.", "Fire pekerendringer, uansett hvor lang lista er.",
        "O(1). Med hode- og halenode er v.next aldri null, så vi slipper spesialtilfeller.") }
  });

  reg(IN.algos, "lsRemoveNode", {
    title: "RemoveNode: fjern v (dobbeltlenket)", name: "RemoveNode", params: "v",
    input: "En node v i en dobbeltlenket liste med hode og hale (v er ikke hode eller hale)",
    output: "Elementet i v, som fjernes fra lista",
    lines: [
      { code: "v.prev.next ← v.next", indent: 1,
        eli5: "Vogna foran v skal hoppe over v.", normal: "Forgjengeren til v peker forbi v.", teknisk: "Med hode foran v er v.prev aldri null." },
      { code: "v.next.prev ← v.prev", indent: 1,
        eli5: "Vogna bak v skal også hoppe over v. Nå er v koblet løs.", normal: "Etterfølgeren til v peker tilbake forbi v.", teknisk: "Med hale bak v er v.next aldri null." },
      { code: "return v.elem", indent: 1,
        eli5: "Gi tilbake det som lå i v.", normal: "Returner elementet.", teknisk: "O(1): vi trenger ikke lete etter noden foran, fordi v.prev finnes." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("To pekere kobles om.", "To pekerendringer. Vi har både noden foran og bak via prev og next.",
        "O(1) gitt v. Derfor kan en dobbeltlenket liste fjerne bakerst på O(1), og det kan ikke en enkeltlenket.") }
  });

  /* ---------- H2020 oppgave 9: velformaterte tagger ---------- */
  reg(IN.algos, "lsGoodDivs", {
    title: "GoodDivs (H2020 9a)", name: "GoodDivs", params: "A",
    input: "Et array A med n strenger, der hver er \"<div>\" eller \"</div>\"",
    output: "true hvis taggene er velformaterte, ellers false",
    lines: [
      { code: "i ← 0", indent: 1,
        eli5: "Tell hvor mange bokser som står åpne. Ingen ennå.", normal: "i er antall åpne div-er som ikke er lukket ennå.", teknisk: "i er dybden: hvor mange åpne tagger som venter på å bli lukket." },
      { code: "for tag in A do", indent: 1,
        eli5: "Se på hver tagg, fra venstre mot høyre.", normal: "Gå gjennom taggene i rekkefølge.", teknisk: "n runder." },
      { code: "if tag = \"<div>\" then", indent: 2,
        eli5: "Åpner taggen en ny boks?", normal: "Er det en åpnetagg?", teknisk: "Bare to mulige strenger, så else betyr lukketagg." },
      { code: "i ← i + 1", indent: 3,
        eli5: "Én boks mer står åpen.", normal: "Én flere åpne.", teknisk: "Dybden øker." },
      { code: "else", indent: 2,
        eli5: "Ellers lukker taggen en boks.", normal: "Ellers er det en lukketagg.", teknisk: "tag = \"&lt;/div&gt;\"." },
      { code: "i ← i − 1", indent: 3,
        eli5: "Én boks mindre står åpen.", normal: "Den lukker den sist åpnede.", teknisk: "Dybden minker." },
      { code: "if i < 0 then", indent: 3,
        eli5: "Lukket vi en boks som aldri ble åpnet?", normal: "Ble det lukket flere enn det var åpnet, så langt?",
        teknisk: "Må sjekkes underveis, ikke bare til slutt. Sensor trakk 2 poeng for å glemme det." },
      { code: "return false", indent: 4,
        eli5: "Da er det feil!", normal: "Ikke velformatert.", teknisk: "Tidlig retur." },
      { code: "return i = 0", indent: 1,
        eli5: "Til slutt: er alle boksene lukket?", normal: "Velformatert bare hvis ingen står åpne til slutt.",
        teknisk: "Glemt sluttsjekk ga 1 poengs trekk i H2020." }
    ],
    bigO: { best: "O(1)", avg: "O(n)", worst: "O(n)", space: "O(1)",
      why: t("Vi ser på hver tagg én gang og teller.", "Én gjennomgang av n tagger, O(1) per tagg.",
        "O(n) tid og O(1) minne: telleren er en stakk der vi bare trenger høyden, fordi alle taggene er av samme type.") }
  });

  reg(IN.algos, "lsGoodTags", {
    title: "GoodTags (H2020 9b)", name: "GoodTags", params: "A",
    input: "Et array A med n tagger. isOpen(tag) sier om taggen åpner, og TagType(tag) gir typen, for eksempel \"div\" eller \"p\"",
    output: "true hvis taggene er velformaterte, ellers false",
    lines: [
      { code: "s ← empty stack", indent: 1,
        eli5: "Lag en tom stabel. Her legger vi hver boks vi åpner.", normal: "Stakken holder de åpne taggene, den sist åpnede øverst.",
        teknisk: "Stakken er det smarte valget hintet peker på: den sist åpnede taggen er den som må lukkes først (LIFO)." },
      { code: "for tag in A do", indent: 1,
        eli5: "Se på hver tagg, fra venstre mot høyre.", normal: "Gå gjennom taggene i rekkefølge.", teknisk: "n runder." },
      { code: "if isOpen(tag) then", indent: 2,
        eli5: "Åpner taggen en boks?", normal: "Er det en åpnetagg?", teknisk: "isOpen er gitt i oppgaven og er O(1)." },
      { code: "s.push(tag)", indent: 3,
        eli5: "Legg den øverst på stabelen.", normal: "Legg den åpne taggen øverst på stakken.", teknisk: "push er O(1)." },
      { code: "else if s is empty or TagType(s.pop()) ≠ TagType(tag) then", indent: 2,
        eli5: "Det er en lukketagg. Er stabelen tom, eller er den øverste av en annen type? Da passer den ikke.",
        normal: "En lukketagg må lukke den sist åpnede. Er stakken tom, eller er typen på toppen en annen, er det feil.",
        teknisk: "«or» kortslutter: er stakken tom, kalles ikke s.pop(). Ellers tar vi ut toppen og sammenligner typene." },
      { code: "return false", indent: 3,
        eli5: "Da er det feil!", normal: "Ikke velformatert.", teknisk: "Tidlig retur, tilsvarer i &lt; 0 i GoodDivs." },
      { code: "return s is empty", indent: 1,
        eli5: "Til slutt: er alle boksene lukket?", normal: "Velformatert bare hvis ingen åpne tagger er igjen.",
        teknisk: "Tilsvarer i = 0 i GoodDivs. Glemt sluttsjekk gir trekk." }
    ],
    bigO: { best: "O(1)", avg: "O(n)", worst: "O(n)", space: "O(n)",
      why: t("Vi ser på hver tagg én gang, og å legge på og ta av stabelen går fort.",
        "Én gjennomgang av n tagger. push og pop er O(1), så totalt O(n). Stakken kan bli opptil n høy.",
        "O(n) tid: n runder med O(1)-operasjoner (push, pop, isOpen, TagType). O(n) ekstra minne i verste tilfelle (bare åpnetagger).") }
  });

  /* ---------- Nylige søk (ukesoppgave 08, «LRU-cache») ---------- */
  reg(IN.algos, "lsUpdate", {
    title: "Update: nylige søk med kapasitet N", name: "Update", params: "key",
    input: "En nøkkel key. M er et hashmap fra nøkkel til node i L, L er en dobbeltlenket liste med hode og hale (nyeste først), og N er kapasiteten",
    output: "L og M, der key ligger fremst, og der det ligger høyst N nøkler",
    lines: [
      { code: "if M.get(key) ≠ null then", indent: 1,
        eli5: "Har vi søkt på dette før? Hashmapet svarer med en gang.",
        normal: "Slå opp i hashmapet. Det gir oss noden direkte, uten å lete i lista.",
        teknisk: "Forventet O(1). Uten M måtte vi brukt rett-frem søk gjennom L, O(N)." },
      { code: "RemoveNode(M.get(key))", indent: 2,
        eli5: "Ta den ut der den står, så vi kan legge den fremst.",
        normal: "Ta noden ut av lista. Den settes inn fremst under.",
        teknisk: "RemoveNode er O(1) fordi lista er dobbeltlenket. Det er derfor vi trenger prev." },
      { code: "else if |M| = N then", indent: 1,
        eli5: "Ny nøkkel, men lista er full?", normal: "Ny nøkkel og full kapasitet: den eldste må ut.", teknisk: "|M| = antall nøkler, O(1)." },
      { code: "w ← L.tail.prev", indent: 2,
        eli5: "Den eldste står helt bakerst, rett foran halen.", normal: "Den eldste ligger sist, rett før halenoden.", teknisk: "Halenoden gir O(1)-tilgang til siste node." },
      { code: "RemoveNode(w)", indent: 2,
        eli5: "Ta den ut.", normal: "Fjern den eldste fra lista.", teknisk: "O(1)." },
      { code: "M.remove(w.elem)", indent: 2,
        eli5: "Og stryk den fra hashmapet.", normal: "Fjern den også fra hashmapet, ellers peker M på en node som ikke er i lista.",
        teknisk: "Forventet O(1). Glemmer vi dette, blir L og M usynkroniserte." },
      { code: "InsertAfter(L.head, key)", indent: 1,
        eli5: "Legg nøkkelen helt fremst.", normal: "Sett inn en ny node med key rett etter hodet, altså fremst.", teknisk: "O(1)." },
      { code: "M.put(key, L.head.next)", indent: 1,
        eli5: "Skriv i hashmapet hvor den nye noden er.", normal: "M skal peke på den nye noden.", teknisk: "Overskriver den gamle noden hvis key fantes. Forventet O(1)." }
    ],
    bigO: { best: "O(1)", avg: "O(1) forventet", worst: "O(N)", space: "O(N)",
      why: t("Hashmapet finner nøkkelen med en gang, og å flytte en node i lista går fort.",
        "Alle hashmap-operasjonene er forventet O(1), og RemoveNode og InsertAfter er O(1). Totalt forventet O(1).",
        "Forventet O(1) fra hashingen. Verste tilfelle styres også av hashmapet (O(N) ved mange kollisjoner). I løsningen på ukesoppgaven gis hashmapet startstørrelse 2N, så det aldri trenger rehash.") }
  });

  /* ================================================================
     GENERATORER
     ================================================================ */

  /* ---------- Dynamisk array: PushBack / PopBack ----------
     input: [{ cap, ops:[{op:"push", v} | {op:"pop"}] }]   pseudokoder: PushBack (1), EnsureCapacity (2), PopBack (3) */
  reg(IN.gen, "lsDynPush", function (input) {
    var cfg = cfgOf(input), A = [], c = Math.max(1, cfg.cap || 1), n = 0, steps = [], copies = 0, pushes = 0;
    for (var z = 0; z < c; z++) A.push(null);
    function arrPart(label, cells, nn, marks, ptrs, dim) { return { type: "array", label: label, cells: cells.slice(), n: nn, marks: marks || {}, ptrs: ptrs || {}, dim: dim }; }
    function info() {
      return [{ label: "D.n", html: String(n) }, { label: "|D.A|", html: String(A.length) },
        { label: "PushBack-er", html: String(pushes) }, { label: "kopieringer totalt", html: String(copies) }, { label: "2 · PushBack-er", html: String(2 * pushes) }];
    }
    var E = null, CI = null, PE = null;   // e i PushBack, i i EnsureCapacity, e i PopBack
    function dpVars(line) {
      if (line == null) return [];
      var a = Math.floor(line / 100);
      if (a === 1) return [sv("e", E)];
      if (a === 2) return [line === 206 ? iv("i", CI) : line === 205 ? sv("i", "0 … " + (n - 1)) : sv("i", null)];
      return [sv("e", PE)];
    }
    function snap(line, parts, text, tag) {
      steps.push({ line: line, parts: parts, info: info(), text: text, tag: tag,
        vars: dpVars(line), frame: frameOf(line, [null, "PushBack", "EnsureCapacity", "PopBack"]) });
    }
    function main(marks, ptrs) { return [arrPart("D.A", A, n, marks, ptrs)]; }
    snap(null, main(), t("En tom hylle med " + c + (c === 1 ? " plass" : " plasser") + ". Ingenting ligger der ennå.",
      "Tomt dynamisk array: D.n = 0 og |D.A| = " + c + ".", "D.n = 0, |D.A| = " + c + "."), "Start");
    (cfg.ops || []).forEach(function (o) {
      if (o.op === "push") {
        var e = o.v; E = e; CI = null;
        snap(102, main(), t("Vi skal legge " + e + " bakerst. Først: er det plass?", "PushBack(D, " + e + "): kall EnsureCapacity først.", "PushBack(D, " + e + ")."), "PushBack " + e);
        if (n < A.length) {
          snap(202, main(), t("Det er " + (A.length - n) + " ledig" + (A.length - n === 1 ? "" : "e") + " plass" + (A.length - n === 1 ? "" : "er") + ". Fint!",
            "D.n = " + n + " < |D.A| = " + A.length + ": det er plass.", n + " < " + A.length + ": return, O(1)."), "Plass");
        } else {
          var full = []; for (var f = 0; f < n; f++) full.push(f);
          snap(202, main({ cur: full }), t("Hylla er full! " + (n === 1 ? "Den ene plassen er i bruk." : "Alle " + n + " plassene er i bruk."), "D.n = " + n + " = |D.A|: arrayet er fullt.", "D.n = |D.A| = " + n + ": må utvide."), "Fullt");
          var B = []; for (var q = 0; q < 2 * A.length; q++) B.push(null);
          snap(204, [arrPart("D.A (gammelt)", A, n, {}, {}, true), arrPart("A (nytt, |A| = " + B.length + ")", B, 0)],
            t("Vi lager en ny hylle med " + B.length + " plasser, dobbelt så lang.", "Nytt array med |D.A| · 2 = " + B.length + " plasser.", "Nytt array, kapasitet " + B.length + "."), "Doble");
          if (n <= 4) {
            for (var i = 0; i < n; i++) {
              B[i] = A[i]; copies++; CI = i;
              var pi = {}; pi[i] = "i";
              snap(206, [arrPart("D.A (gammelt)", A, n, { cur: i }, pi, true), arrPart("A (nytt)", B, i + 1, { fresh: i }, pi)],
                t("Kopier " + A[i] + " over til plass " + i + " på den nye hylla.", "i = " + i + ": A[" + i + "] ← D.A[" + i + "] = " + A[i] + ".", "Kopi " + (i + 1) + " av " + n + "."), "Kopier");
            }
          } else {
            for (var k = 0; k < n; k++) B[k] = A[k];
            copies += n;
            var all = []; for (var m = 0; m < n; m++) all.push(m);
            snap(205, [arrPart("D.A (gammelt)", A, n, { cur: all }, {}, true), arrPart("A (nytt)", B, n, { fresh: all })],
              t("Alle " + n + " tingene flyttes over, én etter én.", "Løkka går for i = 0 til D.n − 1 = " + (n - 1) + ": " + n + " kopieringer.", n + " kopieringer, O(D.n)."), "Kopier alle " + n);
          }
          A = B; CI = null;
          snap(207, main(), t("Nå bruker vi den nye hylla. Det er god plass igjen.", "D.A er nå det nye arrayet med " + A.length + " plasser.", "|D.A| = " + A.length + ". " + (A.length - n === 1 ? "Den neste PushBack-en er O(1)." : "De neste " + (A.length - n) + " PushBack-ene er O(1).")), "Byttet array");
        }
        A[n] = e;
        snap(103, main({ fresh: n }), t("Legg " + e + " på plass " + n + ", den første ledige.", "D.A[D.n] = D.A[" + n + "] ← " + e + ".", "Skriv på indeks D.n = " + n + "."), "Skriv");
        n++; pushes++;
        snap(104, main(), t("Nå ligger det " + n + (n === 1 ? " ting" : " ting") + " på hylla.", "D.n ← " + n + ".", "D.n = " + n + "."), "D.n + 1");
      } else if (o.op === "pop") {
        if (!n) { snap(null, main(), t("Hylla er tom, så det er ingenting å ta.", "PopBack krever at D ikke er tomt.", "Forutsetning brutt: D.n = 0."), "Tomt"); return; }
        var val = A[n - 1]; PE = val;
        snap(302, main({ cur: n - 1 }), t("Ta den siste tingen, " + val + ".", "e ← D.A[" + (n - 1) + "] = " + val + ".", "Les indeks D.n − 1 = " + (n - 1) + "."), "PopBack");
        A[n - 1] = null;
        snap(303, main({ hole: n - 1 }), t("Plassen er tom nå.", "D.A[" + (n - 1) + "] ← null.", "Tøm plassen."), "Tøm");
        n--;
        snap(305, main(), t("Vi fikk " + val + ". Ingen andre ting måtte flyttes.", "D.n ← " + n + ", returner " + val + ". O(1).", "O(1). Arrayet krymper ikke."), "Returner " + val);
      }
    });
    snap(null, main(), t("Ferdig! Hylla ble større bare noen få ganger.",
      "Ferdig. " + pushes + " PushBack-er ga " + copies + " kopieringer. Med dobling er det alltid færre enn 2 · " + pushes + " = " + 2 * pushes + ".",
      "Ferdig. Totalt " + copies + " kopieringer for " + pushes + " PushBack-er: O(1) amortisert per innsetting."), "Ferdig");
    return linkVars(steps);
  });

  /* ---------- Dynamisk array: Add / Remove ----------
     input: [{ items, cap, ops:[{op:"add", i, v} | {op:"rem", i}] }]   pseudokoder: Add (1), Remove (2) */
  reg(IN.gen, "lsDynAddRem", function (input) {
    var cfg = cfgOf(input), items = (cfg.items || []).slice(), c = Math.max(items.length, cfg.cap || items.length + 2);
    var A = [], n = items.length, steps = [], moves = 0;
    for (var z = 0; z < c; z++) A.push(z < n ? items[z] : null);
    function ptr(map) { return map || {}; }
    var VI = null, VE = null, VJ = null;   // i, e og j i Add / Remove
    function snap(line, marks, ptrs, text, tag) {
      var add = line != null && line < 200;
      steps.push({ line: line, parts: [{ type: "array", label: "D.A", cells: A.slice(), n: n, marks: marks || {}, ptrs: ptr(ptrs) }],
        info: [{ label: "D.n", html: String(n) }, { label: "|D.A|", html: String(A.length) }, { label: "flyttinger", html: String(moves) }], text: text, tag: tag,
        vars: line == null ? [] : add ? [iv("i", VI), sv("e", VE), iv("j", VJ)] : [iv("i", VI), iv("j", VJ)],
        frame: frameOf(line, [null, "Add", "Remove"]) });
    }
    function one(k, s) { var p = {}; p[k] = s; return p; }
    snap(null, {}, null, t("Hylla har " + n + " ting.", "D.n = " + n + ", |D.A| = " + A.length + ".", "D.n = " + n + "."), "Start");
    (cfg.ops || []).forEach(function (o) {
      var moved = [];
      if (o.op === "add") {
        var i = Math.max(0, Math.min(n, o.i)), e = o.v;
        VI = i; VE = e; VJ = null;
        snap(102, {}, one(i, "i"), t("Vi skal sette " + e + " inn på plass " + i + ". Først: er det plass?", "Add(D, " + i + ", " + e + "). EnsureCapacity sørger for en ledig plass.", "Add(D, " + i + ", " + e + ")."), "Add på " + i);
        if (n === A.length) {
          var B = []; for (var q = 0; q < 2 * A.length; q++) B.push(q < n ? A[q] : null);
          A = B;
          snap(102, {}, one(i, "i"), t("Det var fullt, så hylla ble doblet (se demoen over).", "Fullt: EnsureCapacity doblet til " + A.length + " plasser og kopierte alt.", "Doblet til |D.A| = " + A.length + "."), "Doblet");
        }
        if (n - 1 < i) snap(103, {}, one(i, "i"), t("Det er ingen ting etter plass " + i + ", så ingenting må flyttes.", "j starter på D.n − 1 = " + (n - 1) + ", som er mindre enn i = " + i + ": null runder.", "Null runder (i = D.n)."), "Ingen flytting");
        for (var j = n - 1; j >= i; j--) {
          A[j + 1] = A[j]; moves++; moved.push(j + 1); VJ = j;
          var pp = one(j, "j"); if (j !== i) pp[i] = "i"; else pp[j] = "j = i";
          snap(104, { moved: [j + 1], cur: j }, pp, t("Kopier " + A[j] + " ett hakk til høyre, til plass " + (j + 1) + ".", "j = " + j + ": D.A[" + (j + 1) + "] ← D.A[" + j + "] = " + A[j] + ".", "Flytting " + (n - j) + " av " + (n - i) + "."), "Flytt høyre");
        }
        A[i] = e; VJ = null;
        snap(105, { fresh: i }, one(i, "i"), t((i < n ? "Det som stod på plass " + i + ", er allerede kopiert ett hakk til høyre, så vi kan skrive over det." : "Plass " + i + " er ledig.") + " Legg " + e + " der.", "D.A[" + i + "] ← " + e + ".", "Skriv e."), "Sett inn");
        n++;
        snap(106, {}, null, t("Innsatt. Vi måtte flytte " + (n - 1 - i) + " ting.", "D.n ← " + n + ". " + (n - 1 - i) + (n - 1 - i === 1 ? " element ble flyttet." : " elementer ble flyttet."), "O(D.n − i) = " + (n - 1 - i) + " flyttinger."), "D.n + 1");
      } else if (o.op === "rem") {
        if (!n) return;
        var r = Math.max(0, Math.min(n - 1, o.i)), old = A[r];
        VI = r; VE = null; VJ = null;
        snap(202, { hole: r }, one(r, "i"), t("Vi skal fjerne " + old + " på plass " + r + ". Tingene bak må tette hullet.", "Remove(D, " + r + "): løkka går for j = " + r + " til D.n − 2 = " + (n - 2) + ".", "Remove(D, " + r + ")."), "Remove på " + r);
        if (r > n - 2) snap(202, { hole: r }, one(r, "i"), t("Det er ingen ting bak, så ingenting må flyttes.", "i = D.n − 1, så løkka kjører null ganger.", "Null runder."), "Ingen flytting");
        for (var jj = r; jj <= n - 2; jj++) {
          A[jj] = A[jj + 1]; moves++; VJ = jj;
          snap(203, { moved: [jj], cur: jj + 1 }, one(jj, "j"), t("Kopier " + A[jj] + " ett hakk til venstre, til plass " + jj + ".", "j = " + jj + ": D.A[" + jj + "] ← D.A[" + (jj + 1) + "] = " + A[jj] + ".", "Flytting " + (jj - r + 1) + " av " + (n - 1 - r) + "."), "Flytt venstre");
        }
        A[n - 1] = null; VJ = null;
        snap(204, { hole: n - 1 }, null, t("Den siste plassen tømmes.", "D.A[" + (n - 1) + "] ← null.", "Rydd bakerste plass."), "Tøm siste");
        n--;
        snap(205, {}, null, t("Fjernet. " + old + " er borte.", "D.n ← " + n + ". " + (n - r) + (n - r === 1 ? " element ble flyttet." : " elementer ble flyttet."), "O(D.n − i)."), "D.n − 1");
      }
    });
    snap(null, {}, null, t("Ferdig!", "Ferdig. Jo nærmere starten vi setter inn eller fjerner, jo flere elementer må flyttes.", "Totalt " + moves + " flyttinger. Add og Remove er O(n) i verste tilfelle."), "Ferdig");
    return linkVars(steps);
  });

  /* ---------- Enkeltlenket liste ----------
     input: [{ items, ops:[{op:"get", i} | {op:"insAfter", i, v} | {op:"remAfter", i}] }]
     pseudokoder: NodeAt (1), InsertAfter (2), RemoveAfter (3) */
  reg(IN.gen, "lsSingly", function (input) {
    var cfg = cfgOf(input), steps = [], nodes = {}, first = null, idc = 0, extra = null, gone = null, steps0 = 0;
    function mk(v) { var id = "n" + (idc++); nodes[id] = { id: id, v: v, next: null }; return id; }
    (cfg.items || []).forEach(function (v) { var id = mk(v); if (first == null) first = id; else { var x = first; while (nodes[x].next) x = nodes[x].next; nodes[x].next = id; } });
    function order() {
      var out = [], x = first, guard = 0;
      while (x != null && guard++ < 50) { out.push(x); if (extra && extra.after === x) out.push(extra.id); x = nodes[x].next; if (extra && x === extra.id) x = nodes[x].next; }
      if (gone) { var k = out.indexOf(gone.after); if (k >= 0 && out.indexOf(gone.id) < 0) out.splice(k + 1, 0, gone.id); }
      return out;
    }
    function snap(line, mk2, text, tag) {
      mk2 = mk2 || {};
      var ord = order();
      var list = ord.map(function (id) {
        var nd = nodes[id];
        return { id: id, v: nd.v, next: nd.next, cur: mk2.cur === id, fresh: (extra && extra.id === id) || mk2.fresh === id, found: mk2.found === id, gone: gone && gone.id === id };
      });
      var inf = [{ label: "n", html: String(ord.length - (gone ? 1 : 0) - (extra && !reach(extra.id) ? 1 : 0)) }];
      if (mk2.j != null) inf.push({ label: "j", html: String(mk2.j) });
      if (mk2.ret != null) inf.push({ label: "returnert", html: esc(mk2.ret) });
      inf.push({ label: "pekersteg", html: String(steps0) });
      var a = line == null ? 0 : Math.floor(line / 100);
      steps.push({ line: line, parts: [{ type: "linked", label: "L", fields: true, nodes: list, first: "L.first", ptrs: mk2.ptrs || {}, hl: mk2.hl || {} }], info: inf, text: text, tag: tag,
        vars: a === 1 ? [sv("i", V.i), ndv("it", V.it, lab(V.it)), sv("j", V.j)]
          : a === 2 ? [ndv("v", V.v, lab(V.v)), sv("e", V.e), ndv("u", V.u, lab(V.u))]
          : a === 3 ? [ndv("v", V.v, lab(V.v)), sv("e", V.e)] : [],
        frame: frameOf(line, [null, "NodeAt", "InsertAfter", "RemoveAfter"]) });
    }
    var V = {};   // variablene i rammen som kjører nå
    function lab(id) { return id == null || !nodes[id] ? null : "Node(" + nodes[id].v + ")"; }
    function reach(id) { var x = first; while (x != null) { if (x === id) return true; x = nodes[x].next; } return false; }
    function nodeAt(i, L) {
      var it = first; steps0 = 0;
      V = { i: i, it: it, j: null };
      var p = {}; p[it] = "it";
      snap(L + 2, { cur: it, ptrs: p, j: null }, t("Vi starter ved den første vogna.", "it ← L.first (elementet " + nodes[it].v + ").", "Start på node 0."), "NodeAt(L, " + i + ")");
      if (i === 0) snap(L + 3, { cur: it, ptrs: p }, t("Vi skal til plass 0, og der står vi allerede.", "i − 1 = −1, så løkka kjører null ganger.", "Null runder."), "Ingen steg");
      for (var j = 0; j <= i - 1; j++) {
        V.j = j;
        snap(L + 3, { cur: it, ptrs: p, j: j }, t("Ett steg til (vi skal gå " + i + " steg totalt).", "j = " + j + " (løkka går til i − 1 = " + (i - 1) + ").", "Runde " + (j + 1) + " av " + i + "."), "j = " + j);
        it = nodes[it].next; steps0++; p = {}; p[it] = "it"; V.it = it;
        snap(L + 4, { cur: it, ptrs: p, j: j }, t("Hopp til neste vogn: " + nodes[it].v + ".", "it ← it.next. Nå står vi på node " + (j + 1) + " (" + nodes[it].v + ").", "Node " + (j + 1) + "."), "Følg next");
      }
      V.j = null;
      snap(L + 5, { found: it, ptrs: p }, t("Her er vogn nummer " + i + ": " + nodes[it].v + ".", "return it: noden på plass " + i + " har elementet " + nodes[it].v + ". Det tok " + i + " pekersteg.", i + " steg: O(i)."), "Funnet");
      return it;
    }
    snap(null, {}, t("Et tog med vogner. Hver vogn vet bare hvem som kommer etter.", "En enkeltlenket liste. Hver node har elem og next, og vi har bare L.first.", "Enkeltlenket liste, n = " + order().length + "."), "Start");
    (cfg.ops || []).forEach(function (o) {
      gone = null; extra = null;
      if (o.op === "get") {
        var v = nodeAt(o.i, 100);
        snap(null, { found: v, ret: nodes[v].v }, t("Get gir oss det som ligger i vogna: " + nodes[v].v + ".", "Get(L, " + o.i + ") = NodeAt(L, " + o.i + ").elem = " + nodes[v].v + ".", "Get er O(n) på grunn av NodeAt."), "Get(L, " + o.i + ")");
      } else if (o.op === "insAfter") {
        var vv = nodeAt(o.i, 100), pv = {}; pv[vv] = "v";
        var u = mk(o.v); extra = { id: u, after: vv };
        V = { v: vv, e: o.v, u: u };
        var pu = {}; pu[vv] = "v"; pu[u] = "u";
        snap(202, { ptrs: pu }, t("Lag en ny vogn med " + o.v + " i. Den er ikke koblet på ennå.", "u ← new Node(" + o.v + "). u.next er null.", "Ny node, ikke i lista ennå."), "Ny node");
        nodes[u].next = nodes[vv].next;
        var hl = {}; hl[u] = "next";
        snap(203, { ptrs: pu, hl: hl }, t("Fest den nye vogna til " + (nodes[u].next ? nodes[nodes[u].next].v : "ingenting (v var sist)") + ".", "u.next ← v.next (" + (nodes[u].next ? nodes[nodes[u].next].v : "null") + ").",
          nodes[u].next ? "Nå peker både v.next og u.next på samme node (" + nodes[nodes[u].next].v + ")." : "v var siste node, så v.next er null, og u.next blir også null. Ingen node å dele ennå."), "u.next");
        nodes[vv].next = u; extra = null;
        var hl2 = {}; hl2[vv] = "next";
        snap(204, { ptrs: pu, hl: hl2, fresh: u }, t("Fest " + nodes[vv].v + " til den nye vogna. Ferdig!", "v.next ← u. " + o.v + " står nå rett etter " + nodes[vv].v + ".", "To pekerendringer, O(1). Selve innsettingen kostet ingenting ekstra etter NodeAt."), "v.next");
      } else if (o.op === "remAfter") {
        var w = nodeAt(o.i, 100);
        if (nodes[w].next == null) { snap(null, {}, t("Det er ingen vogn etter denne.", "v.next = null, så RemoveAfter kan ikke brukes.", "Forutsetning brutt."), "Ingen å fjerne"); return; }
        var pw = {}; pw[w] = "v";
        var x = nodes[w].next, hlx = {}; pw[x] = "v.next";
        V = { v: w, e: nodes[x].v };
        snap(302, { ptrs: pw, cur: x }, t("Vogna etter " + nodes[w].v + " har " + nodes[x].v + " i.", "e ← v.next.elem = " + nodes[x].v + ".", "Les elementet."), "RemoveAfter");
        nodes[w].next = nodes[x].next; gone = { id: x, after: w };
        hlx[w] = "next";
        snap(303, { ptrs: pw, hl: hlx }, t("La " + nodes[w].v + " hoppe over " + nodes[x].v + ". Nå er den ikke med i toget.", "v.next ← v.next.next. Ingen node peker lenger på " + nodes[x].v + ".", "Én pekerendring."), "Hopp over");
        snap(304, { ptrs: {}, ret: nodes[x].v }, t("Vi fikk " + nodes[x].v + " tilbake.", "return " + nodes[x].v + ".", "O(1) etter NodeAt."), "Returner");
        gone = null;
      }
    });
    snap(null, {}, t("Ferdig! Å koble om vogner går fort, men å finne riktig vogn tar tid.",
      "Ferdig. Innsetting og fjerning er O(1) når vi har noden, men å finne den med NodeAt er O(n).",
      "Ferdig. Get, Set, Add og Remove er O(n) på lenket liste, fordi de bruker NodeAt."), "Ferdig");
    return linkVars(steps);
  });

  /* ---------- Dobbeltlenket liste med hode og hale ----------
     input: [{ items, ops:[{op:"ins", after:i (−1 = hode), v} | {op:"del", i}] }]
     pseudokoder: InsertAfter (1), RemoveNode (2) */
  reg(IN.gen, "lsDoubly", function (input) {
    var cfg = cfgOf(input), steps = [], nodes = {}, idc = 0, row = [];
    function mk(v, s) { var id = "d" + (idc++); nodes[id] = { id: id, v: v, next: null, prev: null, sentinel: !!s }; return id; }
    var H = mk("hode", true), T = mk("hale", true);
    nodes[H].next = T; nodes[T].prev = H;
    (cfg.items || []).forEach(function (v) { var id = mk(v), p = nodes[T].prev; nodes[id].prev = p; nodes[id].next = T; nodes[p].next = id; nodes[T].prev = id; });
    function listOrder() { var out = [], x = H; while (x != null) { out.push(x); x = nodes[x].next; } return out; }
    row = listOrder();
    function snap(line, m, text, tag) {
      m = m || {};
      var list = row.map(function (id) { var nd = nodes[id]; return { id: id, v: nd.v, next: nd.next, prev: nd.prev, sentinel: nd.sentinel, fresh: m.fresh === id, cur: m.cur === id, gone: m.gone === id }; });
      var n = listOrder().length - 2;
      var inf = [{ label: "n", html: String(n) }];
      if (m.ret != null) inf.push({ label: "returnert", html: esc(m.ret) });
      var a = line == null ? 0 : Math.floor(line / 100);
      steps.push({ line: line, parts: [{ type: "linked", label: "L (med hode og hale)", double: true, fields: true, nodes: list, ptrs: m.ptrs || {}, hl: m.hl || {} }], info: inf, text: text, tag: tag,
        vars: a === 1 ? [ndv("v", V.v, lab(V.v)), sv("e", V.e), ndv("u", V.u, lab(V.u))] : a === 2 ? [ndv("v", V.v, lab(V.v))] : [],
        frame: frameOf(line, [null, "InsertAfter", "RemoveNode"]) });
    }
    var V = {};
    function lab(id) { return id == null ? null : nodes[id].sentinel ? nodes[id].v : "Node(" + nodes[id].v + ")"; }
    function at(i) { var x = nodes[H].next, k = 0; while (x !== T && k < i) { x = nodes[x].next; k++; } return x; }
    function nm(id) { return nodes[id].sentinel ? nodes[id].v + "noden" : String(nodes[id].v); }
    snap(null, {}, t("Et tog der hver vogn vet både hvem som er foran og bak. Hode og hale er tomme endevogner som alltid er der.",
      "Dobbeltlenket liste med hode- og halenode. Første element er L.head.next, siste er L.tail.prev.",
      "Hode- og halenodene er tomme og blir liggende hele tiden. Derfor har hver node med et element alltid både prev og next."), "Start");
    (cfg.ops || []).forEach(function (o) {
      if (o.op === "ins") {
        var v = o.after < 0 ? H : at(o.after);
        if (v === T) v = nodes[T].prev;
        var u = mk(o.v), pv = {}; pv[v] = "v"; pv[u] = "u";
        V = { v: v, e: o.v, u: u };
        row.splice(row.indexOf(v) + 1, 0, u);
        snap(102, { ptrs: pv, fresh: u }, t("Vi har en peker til " + nm(v) + ". Lag en ny vogn med " + o.v + " i.",
          "u ← new Node(" + o.v + "). Den står ved siden av v, men ingen pekere er satt ennå.", "Ny node, alle pekere null."), "Ny node etter " + nm(v));
        nodes[u].prev = v; var h1 = {}; h1[u] = "prev";
        snap(103, { ptrs: pv, hl: h1, fresh: u }, t("Den nye vogna vet nå at " + nm(v) + " står foran.", "u.prev ← v.", "1 av 4 pekere."), "u.prev");
        nodes[u].next = nodes[v].next; var h2 = {}; h2[u] = "next";
        snap(104, { ptrs: pv, hl: h2, fresh: u }, t("… og at " + nm(nodes[u].next) + " står bak.", "u.next ← v.next (" + nm(nodes[u].next) + ").", "2 av 4. u er ferdig, men lista vet ikke om u ennå."), "u.next");
        var w = nodes[v].next; nodes[w].prev = u; var h3 = {}; h3[w] = "prev";
        snap(105, { ptrs: pv, hl: h3, fresh: u }, t(nm(w) + " vet nå at den nye vogna står foran.", "v.next.prev ← u: " + nm(w) + ".prev peker på u.", "3 av 4. Bruker v.next før den endres."), "v.next.prev");
        nodes[v].next = u; var h4 = {}; h4[v] = "next";
        snap(106, { ptrs: pv, hl: h4, fresh: u }, t("Og " + nm(v) + " har den nye vogna bak seg. Ferdig!", "v.next ← u. Alle fire pekerne stemmer.", "4 pekerendringer, O(1)."), "v.next");
      } else if (o.op === "del") {
        var x = o.last ? nodes[T].prev : at(o.i);
        if (x === T || x === H) return;
        var px = {}; px[x] = "v";
        V = { v: x };
        snap(null, { ptrs: px, cur: x }, t(o.last ? "Vi vil fjerne den siste vogna. Den står rett foran halen, så vi finner den med en gang." : "Vi har en peker til vogna med " + nodes[x].v + ", og vil ta den ut.",
          o.last ? "v ← L.tail.prev (" + nodes[x].v + "). Det er O(1) takket være halenoden." : "RemoveNode(v) for noden med " + nodes[x].v + ".",
          o.last ? "Siste node via L.tail.prev, O(1)." : "RemoveNode(v)."), o.last ? "Fjern siste" : "RemoveNode");
        var a = nodes[x].prev, b = nodes[x].next;
        nodes[a].next = b; var g1 = {}; g1[a] = "next";
        snap(202, { ptrs: px, hl: g1, cur: x }, t(nm(a) + " hopper nå over " + nodes[x].v + ".", "v.prev.next ← v.next: " + nm(a) + ".next peker på " + nm(b) + ".", "1 av 2."), "v.prev.next");
        nodes[b].prev = a; var g2 = {}; g2[b] = "prev";
        snap(203, { ptrs: px, hl: g2, gone: x }, t("Og " + nm(b) + " hopper bakover over " + nodes[x].v + ". Nå er den koblet løs.", "v.next.prev ← v.prev: " + nm(b) + ".prev peker på " + nm(a) + ".", "2 av 2. Ingen node peker på v lenger."), "v.next.prev");
        snap(204, { ret: nodes[x].v, gone: x }, t("Vi fikk " + nodes[x].v + " tilbake.", "return v.elem = " + nodes[x].v + ".", "O(1). I en enkeltlenket liste måtte vi lett etter noden foran, O(n)."), "Returner");
        row.splice(row.indexOf(x), 1);
      }
    });
    snap(null, {}, t("Ferdig! Fordi hver vogn kjenner begge naboene, går det fort å sette inn og ta ut hvor som helst.",
      "Ferdig. Med prev-pekere er både InsertAfter, InsertBefore og RemoveNode O(1) når vi har noden.",
      "Ferdig. Prisen er én ekstra peker per node og omtrent dobbelt så mange pekerendringer."), "Ferdig");
    return linkVars(steps);
  });

  /* ---------- Tagger: hjelpere ---------- */
  function normTag(raw) {
    var x = String(raw).trim().replace(/[<>]/g, "").trim();
    if (!x) return null;
    var close = x[0] === "/"; if (close) x = x.slice(1).trim();
    if (!/^[a-z][a-z0-9]*$/i.test(x)) return null;
    return (close ? "</" : "<") + x.toLowerCase() + ">";
  }
  function isOpen(tg) { return !/^<\//.test(tg); }
  function tagType(tg) { return tg.replace(/[<\/>]/g, ""); }
  LS.normTag = normTag; LS.isOpen = isOpen; LS.tagType = tagType;
  LS.parseTags = function (s, onlyDiv) {
    var out = String(s).split(/[,\s]+/).map(normTag).filter(Boolean);
    if (onlyDiv) out = out.filter(function (x) { return tagType(x) === "div"; });
    out = out.slice(0, 14);
    return out.length ? [{ tags: out }] : [];
  };
  function tagStr(tg) { return "\"" + esc(tg) + "\""; }
  function tagVar(A, k) { return k == null ? { name: "tag", value: null } : { name: "tag", value: "\"" + A[k] + "\"", idx: k }; }

  /* ---------- GoodDivs: teller ---------- */
  reg(IN.gen, "lsDivs", function (input) {
    var A = cfgOf(input).tags || [], steps = [], i = 0;
    function snap(line, cur, text, tag, bad, ret) {
      var inf = [{ label: "i (åpne nå)", html: String(i), bad: i < 0 }];
      if (ret != null) inf.push({ label: "returnert", html: String(ret), bad: ret === false });
      steps.push({ line: line, parts: [{ type: "tags", label: "A", items: A, cur: cur, bad: bad, allDone: cur == null && ret === true }], info: inf, text: text, tag: tag,
        vars: [sv("i", i), tagVar(A, cur)], frame: "GoodDivs" });
    }
    snap(2, null, t("Ingen bokser er åpne ennå.", "i ← 0.", "Dybde 0."), "Start");
    for (var k = 0; k < A.length; k++) {
      var tg = A[k];
      snap(3, k, t("Neste tagg: " + esc(tg) + ".", "tag = " + tagStr(tg) + ".", "Tagg " + k + "."), "Tagg " + k);
      var opens = tg === "<div>";
      snap(4, k, t(opens ? "Er det en åpnetagg? Ja." : "Er det en åpnetagg? Nei, det er en lukketagg.",
        "tag = \"&lt;div&gt;\"? " + (opens ? "Ja." : "Nei, så vi går til else."), opens ? "Åpnetagg." : "Lukketagg: else-grenen."), opens ? "Åpner" : "Lukker");
      if (opens) {
        i++;
        snap(5, k, t("Den åpner en boks. " + (i === 1 ? "Nå er 1 boks åpen." : "Nå er " + i + " bokser åpne."), "Åpnetagg: i ← " + i + ".", "i = " + i + "."), "i + 1");
      } else {
        i--;
        snap(7, k, t(i < 0 ? "Den lukker en boks, men ingen var åpne! Telleren går ned til −1: vi har lukket én for mye."
            : "Den lukker en boks. " + (i === 1 ? "Nå er 1 boks åpen." : "Nå er " + i + " bokser åpne."),
          "Lukketagg: i ← " + i + ".", "i = " + i + "."), "i − 1", i < 0);
        snap(8, k, t(i < 0 ? "Vi har lukket flere enn vi åpnet." : "Ikke lukket for mange så langt.", "i < 0? " + (i < 0 ? "Ja." : "Nei."), i < 0 ? "i = " + i + " < 0." : "i ≥ 0."), "Sjekk i < 0", i < 0);
        if (i < 0) {
          snap(9, k, t("Feil! En boks ble lukket uten å være åpnet.", "return false: " + tagStr(tg) + " på plass " + k + " lukker noe som ikke er åpent.", "Tidlig retur på plass " + k + "."), "false", true, false);
          return linkVars(steps);
        }
      }
    }
    var ok = i === 0;
    snap(10, null, t(ok ? "Alle boksene er lukket. Riktig!" : (i === 1 ? "1 boks står fortsatt åpen. Feil!" : i + " bokser står fortsatt åpne. Feil!"),
      "return i = 0: i = " + i + ", så svaret er " + ok + ".", ok ? "Velformatert." : (i === 1 ? "1 åpen tagg er aldri lukket." : i + " åpne tagger er aldri lukket.")), String(ok), !ok, ok);
    return linkVars(steps);
  });

  /* ---------- GoodTags: stakk ---------- */
  reg(IN.gen, "lsTags", function (input) {
    var A = cfgOf(input).tags || [], steps = [], s = [];
    function snap(line, cur, text, tag, o) {
      o = o || {};
      var inf = [{ label: "høyde", html: String(s.length) }];
      if (o.cmp) inf.push({ label: "sammenligning", html: o.cmp, bad: o.bad });
      if (o.ret != null) inf.push({ label: "returnert", html: String(o.ret), bad: o.ret === false });
      steps.push({ line: line, parts: [{ type: "tags", label: "A", items: A, cur: cur, bad: o.bad, allDone: cur == null && o.ret === true },
        { type: "stack", label: "s (stakken)", items: s.slice(), mark: { top: o.top }, out: o.out, outBad: o.bad, outLabel: "s.pop()" }], info: inf, text: text, tag: tag,
        vars: [tagVar(A, cur)], frame: "GoodTags" });
    }
    snap(2, null, t("En tom stabel. Her legger vi hver boks som åpnes.", "s ← tom stakk.", "Tom stakk."), "Start");
    for (var k = 0; k < A.length; k++) {
      var tg = A[k];
      snap(3, k, t("Neste tagg: " + esc(tg) + ".", "tag = " + tagStr(tg) + ".", "Tagg " + k + "."), "Tagg " + k);
      if (isOpen(tg)) {
        s.push(tg);
        snap(5, k, t("Den åpner. Legg den øverst på stabelen.", "isOpen: s.push(" + tagStr(tg) + ").", "push, O(1). Høyde " + s.length + "."), "push", { top: "push" });
      } else if (!s.length) {
        snap(6, k, t("Den lukker, men stabelen er tom. Det finnes ingenting å lukke!", "Lukketagg og s er tom: betingelsen er sann (pop kalles ikke).", "Tom stakk, kortslutning i «or»."), "Tom stakk", { bad: true });
        snap(7, k, t("Feil!", "return false.", "Tidlig retur."), "false", { bad: true, ret: false });
        return linkVars(steps);
      } else {
        var top = s.pop(), same = tagType(top) === tagType(tg);
        snap(6, k, t(same ? "Den lukker. Øverst lå " + esc(top) + ", og det passer!" : "Den lukker en " + tagType(tg) + ", men øverst lå " + esc(top) + ". Det passer ikke!",
          "s.pop() = " + tagStr(top) + ". TagType: \"" + tagType(top) + "\" " + (same ? "=" : "≠") + " \"" + tagType(tg) + "\".",
          "pop, O(1). Typene er " + (same ? "like: fortsett." : "ulike: feil nøsting.")), same ? "pop, lik type" : "pop, ulik type",
          { out: top, bad: !same, cmp: esc(tagType(top)) + (same ? " = " : " ≠ ") + esc(tagType(tg)) });
        if (!same) { snap(7, k, t("Feil! Taggene krysser hverandre.", "return false.", "Tidlig retur."), "false", { bad: true, ret: false, out: top }); return linkVars(steps); }
      }
    }
    var ok = !s.length;
    snap(8, null, t(ok ? "Stabelen er tom: alt som ble åpnet, ble lukket. Riktig!" : "Det ligger " + s.length + " igjen på stabelen. De ble aldri lukket. Feil!",
      "return s is empty: " + ok + ".", ok ? "Velformatert." : (s.length === 1 ? "1 åpen tagg igjen." : s.length + " åpne tagger igjen.")), String(ok), { ret: ok, bad: !ok });
    return linkVars(steps);
  });

  /* ---------- Nylige søk (LRU) ----------
     input: [{ N, keys:[…] }] */
  reg(IN.gen, "lsRecent", function (input) {
    var cfg = cfgOf(input), N = Math.max(1, cfg.N || 3), keys = cfg.keys || [], steps = [];
    var order = [], M = {}, ops = 0;   // order: nyeste først
    function snap(line, m, text, tag) {
      m = m || {};
      var nodes = [{ id: "H", v: "hode", sentinel: true, next: order.length ? "k:" + order[0] : "T" }];
      var all = order.slice(); if (m.goneKey && all.indexOf(m.goneKey) < 0) all.splice(m.goneAt != null ? m.goneAt : all.length, 0, m.goneKey);
      var live = order;
      all.forEach(function (k) {
        var gone = k === m.goneKey;
        var li = live.indexOf(k);
        nodes.push({ id: "k:" + k, v: k, gone: gone, cur: m.cur === k, fresh: m.fresh === k,
          next: gone ? null : (li + 1 < live.length ? "k:" + live[li + 1] : "T"),
          prev: gone ? null : (li > 0 ? "k:" + live[li - 1] : "H") });
      });
      nodes.push({ id: "T", v: "hale", sentinel: true, prev: order.length ? "k:" + order[order.length - 1] : "H" });
      nodes[0].next = order.length ? "k:" + order[0] : "T";
      var ents = Object.keys(M).map(function (k) { return [k, "node"]; });
      if (m.chipGone) ents.push([m.chipGone, "node"]);
      steps.push({ line: line, parts: [{ type: "linked", label: "L (nyeste først)", double: true, nodes: nodes }, { type: "map", label: "M (nøkkel ↦ node i L)", entries: ents, cur: m.cur, fresh: m.fresh, gone: m.chipGone }],
        info: [{ label: "|M|", html: String(Object.keys(M).length) }, { label: "N", html: String(N) }, { label: "nylige søk", html: order.length ? esc(order.join(", ")) : "(ingen)" }], text: text, tag: tag,
        vars: line == null ? [] : [sv("key", "\"" + KEY + "\""), ndv("w", W == null ? null : "k:" + W, W == null ? null : "Node(\"" + W + "\")")], frame: line == null ? null : "Update" });
    }
    var KEY = null, W = null;
    snap(null, {}, t("Vi skal huske de " + N + " siste søkene, med det nyeste først.",
      "Kapasitet N = " + N + ". L holder nøklene med nyeste først, og M finner noden til en nøkkel på forventet O(1).",
      "N = " + N + ". Invariant: nøklene i L og M er de samme, og L er sortert etter siste bruk."), "Start");
    keys.forEach(function (key) {
      key = String(key); KEY = key; W = null;
      var hit = Object.prototype.hasOwnProperty.call(M, key);
      snap(2, { cur: hit ? key : null }, t("Noen søker på «" + esc(key) + "». Har vi det fra før? " + (hit ? "Ja!" : "Nei."),
        "M.get(«" + esc(key) + "») " + (hit ? "gir noden." : "= null."), "Oppslag i M, forventet O(1)."), "Update(" + esc(key) + ")");
      if (hit) {
        var at = order.indexOf(key); order.splice(at, 1);
        snap(3, { goneKey: key, goneAt: at, cur: key }, t("Vi tar «" + esc(key) + "» ut der den sto.", "RemoveNode: noden kobles ut av L. M peker fortsatt på den, men det retter vi under.", "O(1) med prev-pekere."), "RemoveNode");
      } else {
        snap(4, {}, t(Object.keys(M).length === N ? "Lista er full." : "Det er fortsatt plass.", "|M| = " + Object.keys(M).length + (Object.keys(M).length === N ? " = N." : " < N."), "|M| = " + Object.keys(M).length + "."), "Full?");
        if (Object.keys(M).length === N) {
          var w = order[order.length - 1]; W = w;
          snap(5, { cur: w }, t("Den eldste er «" + esc(w) + "», helt bakerst.", "w ← L.tail.prev («" + esc(w) + "»).", "Eldste via halenoden, O(1)."), "Eldste");
          order.pop();
          snap(6, { goneKey: w, goneAt: order.length, cur: w }, t("Ut med «" + esc(w) + "».", "RemoveNode(w).", "O(1)."), "RemoveNode(w)");
          delete M[w];
          snap(7, { goneKey: w, goneAt: order.length, chipGone: w }, t("Og vi stryker den fra hashmapet også.", "M.remove(«" + esc(w) + "»).", "Forventet O(1). Holder M og L i takt."), "M.remove");
        }
      }
      order.unshift(key);
      snap(8, { fresh: key }, t("Legg «" + esc(key) + "» fremst.", "InsertAfter(L.head, «" + esc(key) + "»): ny node fremst.", "O(1)."), "Fremst");
      M[key] = true; ops++;
      snap(9, { fresh: key }, t("Og skriv i hashmapet hvor den er.", "M.put(«" + esc(key) + "», L.head.next)" + (hit ? ": overskriver den gamle noden." : "."), "Forventet O(1). Totalt forventet O(1) per Update."), "M.put");
    });
    snap(null, {}, t("Ferdig! De nyeste søkene står først, og det eldste faller ut når det blir fullt.",
      "Ferdig. " + ops + " kall på Update, hvert forventet O(1).",
      "Ferdig. Hashmap + dobbeltlenket liste: hvert kall er forventet O(1), uavhengig av N."), "Ferdig");
    return linkVars(steps);
  });
})();
