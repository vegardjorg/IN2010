/* ============================================================
   IN2010 guide · data-algos.js
   Delte algoritmedefinisjoner (pseudokode i eksamensformat,
   nivådelte linjeforklaringer, Big-O) + steggeneratorer.
   Brukes av pseudokode.html og 01-sortering.html. Klassisk script.
   Linjenummer: Procedure-linja = 1, kroppen fra 2 (genereres av
   pseudocode.js). Steg-objektenes `line` peker på disse numrene.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.algos = IN.algos || {};
  IN.gen = IN.gen || {};

  function t(eli5, normal, teknisk) { return { eli5: eli5, normal: normal, teknisk: teknisk }; }
  function clone(a) { return a.slice(); }
  function range(lo, hi) { var a = []; for (var z = lo; z <= hi; z++) a.push(z); return a; }

  /* ===================== SELECTION SORT ===================== */
  IN.algos.selectionSort = {
    title: "Selection sort (utvalgssortering)",
    name: "SelectionSort", params: "A",
    input: "Et array A med n elementer",
    output: "Et sortert array med de samme n elementene",
    lines: [
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Vi skal fylle plassene fra venstre. «i» er plassen vi jobber med akkurat nå – først plass 0, så 1, og så videre.",
        normal: "Ytre løkke: i er grensen mellom den sorterte delen (venstre) og resten.",
        teknisk: "Ytre løkke kjører n ganger; venstre del [0..i−1] er ferdig sortert (invariant)." },
      { code: "k ← i", indent: 2,
        eli5: "Vi later som plass i har det minste tallet til å begynne med. «k» husker hvor det minste vi har sett er.",
        normal: "k peker på det minste elementet funnet i resten; start med i.",
        teknisk: "Initialiser kandidat for minimum i delarrayet A[i..n−1]." },
      { code: "for j ← i + 1 to n − 1 do", indent: 2,
        eli5: "Nå ser vi på alle tallene til høyre, ett om gangen, med «j» som peker.",
        normal: "Indre løkke skanner resten av arrayet etter et mindre element.",
        teknisk: "Indre løkke er O(n−i); summert gir det O(n²) sammenligninger." },
      { code: "if A[j] < A[k] then", indent: 3,
        eli5: "Er tallet vi ser på nå mindre enn det minste vi har funnet?",
        normal: "Sammenlign kandidaten med gjeldende element.",
        teknisk: "Vi bruker streng &lt; og bytter bare kandidat når vi finner noe strengt mindre – det avgjør hvilket minimum vi velger. (Stabiliteten brytes ikke her, men av langdistanse-byttet lenger nede.)" },
      { code: "k ← j", indent: 4,
        eli5: "Ja! Da er dette det nye minste. Vi flytter «k» hit.",
        normal: "Nytt minimum funnet: oppdater k.",
        teknisk: "Oppdater indeks for minimum." },
      { code: "if i ≠ k then", indent: 2,
        eli5: "Fant vi noe mindre lenger ute enn der vi står?",
        normal: "Bare bytt hvis minimum ikke allerede ligger på plass i.",
        teknisk: "Unngå unødvendig bytte (og unngår å destabilisere når i==k)." },
      { code: "swap A[i] and A[k]", indent: 3,
        eli5: "Vi bytter det minste tallet inn på plass i. Nå er plass i ferdig!",
        normal: "Plasser minimum på sin endelige plass i.",
        teknisk: "Nøyaktig ett bytte per i → O(n) bytter totalt." }
    ],
    bigO: {
      best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", stable: false, inplace: true,
      why: t(
        "Vi må alltid se gjennom ALLE de gjenværende tallene for å finne det minste, uansett om de er sortert fra før. Derfor blir det like mange sammenligninger hver gang – massevis.",
        "Alltid O(n²) sammenligninger: ytre løkke n ganger, indre skanner i snitt n/2. Antall bytter er bare O(n). Ingen tidlig stopp hjelper, så best = verst.",
        "Selection gjør alltid like mye arbeid: for hver i skanner vi hele resten A[i..n−1] etter et minimum, og skannene summerer seg til (n−1) + (n−2) + … + 1 = n(n−1)/2 ≈ O(n²) sammenligninger – helt uavhengig av hvordan tallene lå til å begynne med (derfor best = verst). Til gjengjeld gjør vi bare ett bytte per i, altså O(n) bytter totalt. Den er in-place (O(1) ekstra minne), men ikke stabil: langdistanse-byttet kan løfte et element forbi en lik verdi og snu rekkefølgen deres."
      )
    }
  };
  IN.gen.selectionSort = function (arr) {
    var A = clone(arr), n = A.length, steps = [], i, j, k;
    function snap(line, marks, ptrs, text, tag) {
      steps.push({ line: line, array: clone(A), marks: marks, ptrs: ptrs, text: text, tag: tag });
    }
    for (i = 0; i < n; i++) {
      var sorted = []; for (var s = 0; s < i; s++) sorted.push(s);
      snap(2, { sorted: sorted, target: i }, { i: i },
        t("Nå skal vi fylle plass " + i + ". Vi leter etter det minste tallet blant dem som er igjen.",
          "i = " + i + ": finn minste i A[" + i + "..].",
          "Ytre iterasjon i = " + i + ". Sortert prefiks [0.." + (i - 1) + "]."), "Ny plass");
      k = i;
      snap(3, { sorted: sorted, target: i, min: k }, { i: i, k: k },
        t("Vi antar at det minste er her på plass " + i + " (verdi " + A[i] + ") inntil vi finner noe mindre.",
          "k = " + k + " (antatt minimum = " + A[k] + ").",
          "k ← " + k + ", kandidatminimum = " + A[k] + "."), "Antatt minste");
      for (j = i + 1; j < n; j++) {
        var less = A[j] < A[k];
        snap(5, { sorted: sorted, target: i, min: k, compare: [j] }, { i: i, k: k, j: j },
          t("Vi ser på A[" + j + "] = " + A[j] + ". Det minste vi har er A[" + k + "] = " + A[k] + ". " +
              (less ? "Oi – " + A[j] + " er mindre!" : A[j] + " er ikke mindre, så vi beholder " + A[k] + "."),
            "Sammenlign A[" + j + "]=" + A[j] + " med minste A[" + k + "]=" + A[k] + (less ? " → nytt minimum." : " → ingen endring."),
            "j=" + j + ": A[j]<A[k]? " + (less ? "ja" : "nei") + "."), less ? "Mindre funnet" : null);
        if (less) {
          k = j;
          snap(6, { sorted: sorted, target: i, min: k, compare: [j] }, { i: i, k: k, j: j },
            t("Nå husker vi plass " + j + " som det minste.",
              "k ← " + j + ".",
              "k ← " + j + " (ny minimumsindeks)."), "Nytt minste");
        }
      }
      if (i !== k) {
        snap(8, { sorted: sorted, swap: [i, k] }, { i: i, k: k },
          t("Vi bytter " + A[i] + " og " + A[k] + " slik at det minste havner på plass " + i + ".",
            "Bytt A[" + i + "] og A[" + k + "].",
            "swap A[" + i + "],A[" + k + "]."), "Bytte");
        var tmp = A[i]; A[i] = A[k]; A[k] = tmp;
      } else {
        snap(6, { sorted: sorted, target: i, min: k }, { i: i, k: k },
          t("Det minste lå allerede på plass " + i + ". Ingen bytte trengs.",
            "i = k: ingen bytte.",
            "i==k → hopp over swap."), "Ingen bytte");
      }
      var done = []; for (var d = 0; d <= i; d++) done.push(d);
      snap(2, { sorted: done }, { },
        t("Plass " + i + " er nå ferdig og grønn.",
          "A[0.." + i + "] er sortert.",
          "Prefiks [0.." + i + "] ferdig."), "Plass ferdig");
    }
    var all = []; for (var z = 0; z < n; z++) all.push(z);
    steps.push({ line: null, array: clone(A), marks: { sorted: all }, ptrs: {},
      text: t("Ferdig! Alle tallene står i rekkefølge.", "Sortert.", "Terminert. O(n²) sammenligninger brukt."), tag: "Ferdig" });
    return steps;
  };

  /* ===================== BUBBLE SORT ===================== */
  IN.algos.bubbleSort = {
    title: "Bubble sort (boblesortering)",
    name: "BubbleSort", params: "A",
    input: "Et array A med n elementer",
    output: "Et sortert array med de samme n elementene",
    lines: [
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Vi tar runde etter runde gjennom tallene. For hver runde bobler det største tallet helt til høyre.",
        normal: "Ytre løkke: én runde per i.",
        teknisk: "Etter runde i ligger de i+1 største elementene bakerst." },
      { code: "swapped ← false", indent: 2,
        eli5: "Vi starter runden med å si at vi ikke har byttet noe ennå.",
        normal: "Flagg for om vi byttet i denne runden (for tidlig stopp).",
        teknisk: "Sentinel for early-exit når arrayet er sortert." },
      { code: "for j ← 0 to n − 2 − i do", indent: 2,
        eli5: "Vi går gjennom naboparene fra venstre. Vi trenger ikke helt ut, for halen er alt sortert.",
        normal: "Indre løkke sammenligner naboer; øvre grense krymper med i.",
        teknisk: "Grensen n−2−i hopper over den ferdig-sorterte halen." },
      { code: "if A[j] > A[j+1] then", indent: 3,
        eli5: "Står det store tallet til venstre for det lille?",
        normal: "Er naboparet i feil rekkefølge?",
        teknisk: "Streng > bevarer stabilitet (like naboer byttes ikke)." },
      { code: "swap A[j] and A[j+1]", indent: 4,
        eli5: "Ja – bytt dem, så det store sklir mot høyre.",
        normal: "Bytt naboene.",
        teknisk: "Ett nabobytte." },
      { code: "swapped ← true", indent: 4,
        eli5: "Vi husker at vi byttet noe denne runden.",
        normal: "Marker at det skjedde et bytte.",
        teknisk: "Sett flagget." },
      { code: "if not swapped then", indent: 2,
        eli5: "Gikk hele runden uten et eneste bytte? Da er alt ferdig sortert.",
        normal: "Ingen bytter → allerede sortert.",
        teknisk: "Er vi her uten å ha byttet noe, er arrayet allerede sortert, og vi kan stoppe. Det er dette som gir bubble best-case O(n)." },
      { code: "break", indent: 3,
        eli5: "Vi stopper tidlig – ferdig!",
        normal: "Avslutt løkka.",
        teknisk: "Bryt ut av ytre løkke." }
    ],
    bigO: {
      best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true, inplace: true,
      why: t(
        "Hvis tallene alt er sortert, går vi én runde uten å bytte noe og stopper. Da er det raskt. Men hvis de er rotet, må vi bytte om og om igjen.",
        "Takket være swapped-flagget slipper vi unna med én runde når input alt er sortert, så best-case blir O(n). Er input rotete, må vi derimot gjøre nabobytter om og om igjen, og både snitt og verste tilfelle blir O(n²). Bubble er stabil, siden vi bare bytter når det ene elementet er strengt større enn nabo.",
        "I verste fall (omvendt sortert) er antallet inversjoner n(n−1)/2, og siden hvert nabobytte fjerner nøyaktig én inversjon, blir det O(n²) arbeid. Med swapped-flagget får vi best-case O(n): en allerede sortert liste gir én runde uten bytter. Algoritmen er in-place (O(1) ekstra minne) og stabil."
      )
    }
  };
  IN.gen.bubbleSort = function (arr) {
    var A = clone(arr), n = A.length, steps = [];
    function snap(line, marks, ptrs, text, tag) { steps.push({ line: line, array: clone(A), marks: marks, ptrs: ptrs, text: text, tag: tag }); }
    for (var i = 0; i < n; i++) {
      var tail = []; for (var s = n - i; s < n; s++) tail.push(s);
      var swapped = false;
      snap(3, { sorted: tail }, { i: i },
        t("Runde " + (i + 1) + ". Vi bobler gjennom paret for par.", "Runde i=" + i + ".", "Pass " + i + "; hale sortert."), "Ny runde");
      for (var j = 0; j < n - 1 - i; j++) {
        var gt = A[j] > A[j + 1];
        snap(4, { sorted: tail, compare: [j, j + 1] }, { j: j },
          t("Er A[" + j + "]=" + A[j] + " større enn A[" + (j + 1) + "]=" + A[j + 1] + "? " + (gt ? "Ja." : "Nei."),
            "Sammenlign naboene " + A[j] + " og " + A[j + 1] + (gt ? " → bytt." : " → ok."),
            "A[j]>A[j+1]? " + (gt ? "ja" : "nei")), gt ? "Bytter" : null);
        if (gt) {
          var tmp = A[j]; A[j] = A[j + 1]; A[j + 1] = tmp; swapped = true;
          snap(5, { sorted: tail, swap: [j, j + 1] }, { j: j },
            t("Bytt! Det store sklir til høyre.", "Bytt A[" + j + "] og A[" + (j + 1) + "].", "swap."), "Bytte");
        }
      }
      if (!swapped) {
        snap(8, { sorted: (function () { var a = []; for (var z = 0; z < n; z++) a.push(z); return a; })() }, {},
          t("Ingen bytter – alt er sortert. Vi stopper.", "Ingen bytte → ferdig.", "swapped=false → break."), "Tidlig stopp");
        break;
      }
    }
    var all = []; for (var z = 0; z < n; z++) all.push(z);
    steps.push({ line: null, array: clone(A), marks: { sorted: all }, ptrs: {}, text: t("Ferdig!", "Sortert.", "Terminert."), tag: "Ferdig" });
    return steps;
  };

  /* ===================== INSERTION SORT ===================== */
  IN.algos.insertionSort = {
    title: "Insertion sort (innsettingssortering)",
    name: "InsertionSort", params: "A",
    input: "Et array A med n elementer",
    output: "Et sortert array med de samme n elementene",
    lines: [
      { code: "for i ← 1 to n − 1 do", indent: 1,
        eli5: "Tenk på kortene i hånda: venstre del er sortert. Vi tar neste kort og skal putte det på rett plass.",
        normal: "i markerer kortet vi skal sette inn i den sorterte venstre delen.",
        teknisk: "Invariant: A[0..i−1] sortert." },
      { code: "key ← A[i]", indent: 2,
        eli5: "Vi plukker opp kortet (tallet) vi skal sette inn, og holder det i hånda.",
        normal: "Ta vare på elementet som skal plasseres.",
        teknisk: "Lagre nøkkelen (plassen i A blir «ledig»)." },
      { code: "j ← i − 1", indent: 2,
        eli5: "Vi ser på naboen til venstre.",
        normal: "j vandrer bakover i den sorterte delen.",
        teknisk: "Start sammenligning fra i−1." },
      { code: "while j ≥ 0 and A[j] > key do", indent: 2,
        eli5: "Så lenge naboen til venstre er større enn kortet vårt, må den flytte seg til høyre.",
        normal: "Skyv større elementer ett hakk til høyre.",
        teknisk: "Streng > → stabil; løkka er O(i) i verste fall." },
      { code: "A[j+1] ← A[j]", indent: 3,
        eli5: "Vi skyver det store tallet ett hakk mot høyre for å lage plass.",
        normal: "Flytt A[j] opp ett hakk.",
        teknisk: "Forskyvning, ikke bytte (billigere)." },
      { code: "j ← j − 1", indent: 3,
        eli5: "Vi ser på neste nabo til venstre.",
        normal: "Gå ett hakk bakover.",
        teknisk: "Dekrementer j." },
      { code: "A[j+1] ← key", indent: 2,
        eli5: "Nå legger vi kortet ned på den ledige plassen. Venstre del er sortert igjen.",
        normal: "Sett nøkkelen inn på rett plass.",
        teknisk: "Plasser key i hullet." }
    ],
    bigO: {
      best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true, inplace: true,
      why: t(
        "Hvis tallene alt er nesten sortert, trenger vi nesten ikke å flytte noe – kjempebra. Men hvis de er baklengs, må hvert kort skyves helt fram.",
        "Når input alt er sortert, kjører while-løkka aldri, og vi bruker bare O(n) på å gå gjennom listen én gang – derfor er insertion så god på nesten-sorterte data. I verste fall må hvert element skyves helt tilbake, og det blir O(n²). Stabil og in-place.",
        "Det fine med insertion er at arbeidet er proporsjonalt med antall inversjoner: en sortert liste har null inversjoner og gir best-case O(n), mens en omvendt liste har n(n−1)/2 og gir O(n²). Hvert element skyves bare forbi dem som faktisk er større, så like elementer beholder rekkefølgen (stabil), og alt skjer i selve arrayet (in-place)."
      )
    }
  };
  IN.gen.insertionSort = function (arr) {
    var A = clone(arr), n = A.length, steps = [];
    function sortedPrefix(upto) { var a = []; for (var z = 0; z < upto; z++) a.push(z); return a; }
    function snap(line, marks, ptrs, text, tag) { steps.push({ line: line, array: clone(A), marks: marks, ptrs: ptrs, text: text, tag: tag }); }
    for (var i = 1; i < n; i++) {
      var key = A[i];
      snap(3, { sorted: sortedPrefix(i), target: i }, { i: i },
        t("Vi plukker opp A[" + i + "] = " + key + " for å sette det inn blant de sorterte til venstre.",
          "key = " + key + " skal settes inn i A[0.." + (i - 1) + "].",
          "i=" + i + ", key=" + key + "."), "Plukk opp");
      var j = i - 1;
      while (j >= 0 && A[j] > key) {
        snap(5, { sorted: sortedPrefix(i), compare: [j], target: j + 1 }, { j: j },
          t("A[" + j + "] = " + A[j] + " er større enn " + key + ", så vi skyver det ett hakk til høyre.",
            "A[" + j + "]=" + A[j] + " > " + key + " → skyv til høyre.",
            "A[j]>key → A[j+1]←A[j]."), "Skyv");
        A[j + 1] = A[j]; j--;
      }
      A[j + 1] = key;
      snap(7, { sorted: sortedPrefix(i + 1), swap: [j + 1] }, { j: j },
        t("Vi legger " + key + " ned på plass " + (j + 1) + ". Venstre del er sortert igjen.",
          "Sett key inn på plass " + (j + 1) + ".",
          "A[" + (j + 1) + "] ← key."), "Satt inn");
    }
    var all = []; for (var z = 0; z < n; z++) all.push(z);
    steps.push({ line: null, array: clone(A), marks: { sorted: all }, ptrs: {}, text: t("Ferdig!", "Sortert.", "Terminert."), tag: "Ferdig" });
    return steps;
  };

  /* ===================== GNOME SORT (H2023, eksakt) ===================== */
  IN.algos.gnomeSort = {
    title: "Gnome sort",
    name: "GnomeSort", params: "A",
    input: "Et array A med n elementer",
    output: "Et sortert array med de samme n elementene",
    lines: [
      { code: "i ← 0", indent: 1,
        eli5: "Nissen starter helt til venstre, på plass 0.",
        normal: "Start med pekeren i på 0.",
        teknisk: "Enkelt-peker-variant (ingen indre løkke)." },
      { code: "while i < n do", indent: 1,
        eli5: "Så lenge nissen ikke har gått forbi slutten, fortsetter han.",
        normal: "Gå til i når enden av arrayet.",
        teknisk: "Løkka avsluttes når i = n." },
      { code: "if i > 0 and A[i−1] > A[i] then", indent: 2,
        eli5: "Er tallet bak nissen større enn tallet han står på? (Og han er ikke helt i starten.)",
        normal: "Er naboparet (i−1, i) i feil rekkefølge?",
        teknisk: "Streng > → stabil; i>0 hindrer utenfor-grensa." },
      { code: "A[i−1],A[i] ← A[i],A[i−1]", indent: 3,
        eli5: "Da bytter han dem, så det minste havner bakerst (til venstre).",
        normal: "Bytt A[i−1] og A[i]  (swap).",
        teknisk: "Nabobytte, som i insertion sort." },
      { code: "i ← i − 1", indent: 3,
        eli5: "Og så går nissen ETT skritt tilbake for å sjekke om det nye paret også må byttes.",
        normal: "Gå ett hakk tilbake etter bytte.",
        teknisk: "Backtracking gir insertion-lignende oppførsel." },
      { code: "else", indent: 2,
        eli5: "Hvis paret var i rett rekkefølge …",
        normal: "Ellers:",
        teknisk: "Ingen bytte." },
      { code: "i ← i + 1", indent: 3,
        eli5: "… går nissen ett skritt framover.",
        normal: "Gå ett hakk framover.",
        teknisk: "Framdrift når paret er ordnet." }
    ],
    bigO: {
      best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true, inplace: true,
      why: t(
        "Nissen går fram når alt er fint, men hver gang han bytter, må han ett skritt tilbake. Er alt rotet, blir det utrolig mye fram og tilbake.",
        "Gnome oppfører seg som insertion sort, men flytter elementer med bytter i stedet for forskyvninger: er input sortert går nissen bare framover (best-case O(n)), mens rotete input gir mye fram og tilbake og O(n²). Stabil og in-place.",
        "Antall bytter er lik antall inversjoner, så beste tilfelle (sortert) er O(n) og verste (omvendt) er O(n²). Hvert bytte følges av i ← i−1, så den samlede fremdriften er O(n + antall inversjoner) – samme idé som insertion, bare uttrykt med nabobytter."
      )
    }
  };
  IN.gen.gnomeSort = function (arr) {
    var A = clone(arr), n = A.length, steps = [], guard = 0;
    function snap(line, marks, ptrs, text, tag) { steps.push({ line: line, array: clone(A), marks: marks, ptrs: ptrs, text: text, tag: tag }); }
    var i = 0;
    while (i < n && guard++ < 400) {
      if (i > 0 && A[i - 1] > A[i]) {
        snap(3, { compare: [i - 1, i] }, { i: i },
          t("Tallet bak (A[" + (i - 1) + "]=" + A[i - 1] + ") er større enn A[" + i + "]=" + A[i] + ". Bytt!",
            "A[" + (i - 1) + "]>" + "A[" + i + "] → bytt.",
            "i=" + i + ": A[i−1]>A[i] → swap."), "Bytter");
        var tmp = A[i - 1]; A[i - 1] = A[i]; A[i] = tmp;
        snap(5, { swap: [i - 1, i] }, { i: i },
          t("Nissen går ett skritt tilbake for å dobbeltsjekke.", "Bytt gjort; i ← i−1.", "swap; i←i−1."), "Ett tilbake");
        i--;
      } else {
        snap(7, { sorted: [] }, { i: i },
          t("Paret er i orden (eller vi er helt i starten). Nissen går framover.",
            "Ordnet → i ← i+1.", "i←i+1."), "Framover");
        i++;
      }
    }
    var all = []; for (var z = 0; z < n; z++) all.push(z);
    steps.push({ line: null, array: clone(A), marks: { sorted: all }, ptrs: {}, text: t("Ferdig – nissen er i mål!", "Sortert.", "Terminert."), tag: "Ferdig" });
    return steps;
  };

  /* ===================== BINÆRSØK ===================== */
  IN.algos.binarySearch = {
    title: "Binærsøk",
    name: "BinarySearch", params: "A, x",
    input: "Et sortert array A med n elementer, og et element x",
    output: "Indeksen til x i A, eller −1 hvis x ikke finnes",
    lines: [
      { code: "low ← 0", indent: 1, eli5: "Vi ser på hele boka. «low» er første side vi vurderer.", normal: "Nedre grense for søkeintervallet.", teknisk: "Intervall [low, high]." },
      { code: "high ← n − 1", indent: 1, eli5: "«high» er siste side vi vurderer.", normal: "Øvre grense.", teknisk: "Start: hele arrayet." },
      { code: "while low ≤ high do", indent: 1, eli5: "Så lenge det er sider igjen å lete i …", normal: "Fortsett mens intervallet ikke er tomt.", teknisk: "Halverer intervallet hver runde → O(log n)." },
      { code: "mid ← ⌊(low + high) / 2⌋", indent: 2, eli5: "Vi slår opp midt i bunken.", normal: "Finn midtindeksen.", teknisk: "Heltallsdivisjon; unngå overløp med low+(high−low)/2." },
      { code: "if A[mid] = x then", indent: 2, eli5: "Er tallet i midten akkurat det vi leter etter?", normal: "Treff?", teknisk: "Likhetssjekk." },
      { code: "return mid", indent: 3, eli5: "Ja! Vi fant det. Svar med plassen.", normal: "Returner indeksen.", teknisk: "Funnet på mid." },
      { code: "else if A[mid] < x then", indent: 2, eli5: "Er midten for liten? Da ligger tallet til høyre.", normal: "For lite → søk i høyre halvdel.", teknisk: "Kast venstre halvdel." },
      { code: "low ← mid + 1", indent: 3, eli5: "Vi flytter «low» forbi midten.", normal: "Snevr inn fra venstre.", teknisk: "low ← mid+1." },
      { code: "else", indent: 2, eli5: "Ellers er midten for stor, og tallet ligger til venstre.", normal: "For stort → søk i venstre halvdel.", teknisk: "Kast høyre halvdel." },
      { code: "high ← mid − 1", indent: 3, eli5: "Vi flytter «high» forbi midten.", normal: "Snevr inn fra høyre.", teknisk: "high ← mid−1." },
      { code: "return −1", indent: 1, eli5: "Lette ferdig uten å finne det. Svar −1.", normal: "Ikke funnet.", teknisk: "Intervallet tomt → −1." }
    ],
    bigO: {
      best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)",
      why: t(
        "Hver gang halverer vi bunken vi leter i. Å halvere 1000 sider ned til 1 tar bare ca. 10 steg – derfor er det lynraskt.",
        "Intervallet halveres hvert steg, så antall steg er ca. log₂ n. Krever at arrayet er sortert på forhånd.",
        "T(n)=T(n/2)+O(1) → O(log n). Best O(1) hvis x ligger på første mid. Forutsetter sortert input."
      )
    }
  };
  // line-indeks: Procedure=1, low=2, high=3, while=4, mid=5, if=6, return mid=7, elseif=8, low←=9, else=10, high←=11, return −1=12
  IN.gen.binarySearch = function (input) {
    // input: { array:[sortert], x:target }  ELLER bare array (da velges en x)
    var A, x;
    if (Array.isArray(input)) { A = clone(input).sort(function (a, b) { return a - b; }); x = A[Math.floor(A.length / 2)]; }
    else { A = clone(input.array).sort(function (a, b) { return a - b; }); x = input.x; }
    var n = A.length, steps = [], low = 0, high = n - 1;
    function snap(line, marks, ptrs, text, tag) { steps.push({ line: line, array: clone(A), marks: marks, ptrs: ptrs, text: text, tag: tag }); }
    snap(3, {}, { low: low, high: high },
      t("Vi leter etter " + x + " i hele det sorterte arrayet.", "Søker etter x=" + x + " i [0.." + high + "].", "x=" + x + ", intervall [" + low + "," + high + "]."), "Start");
    var found = -1;
    while (low <= high) {
      var mid = Math.floor((low + high) / 2);
      snap(5, { compare: [mid] }, { low: low, mid: mid, high: high },
        t("Midten er plass " + mid + " med verdi " + A[mid] + ".",
          "mid=" + mid + ", A[mid]=" + A[mid] + ".",
          "mid=⌊(" + low + "+" + high + ")/2⌋=" + mid + "."), "Midt");
      if (A[mid] === x) {
        snap(7, { found: mid }, { low: low, mid: mid, high: high },
          t("Det er tallet vårt! Funnet på plass " + mid + ".", "Treff på indeks " + mid + ".", "return " + mid + "."), "Funnet");
        found = mid; break;
      } else if (A[mid] < x) {
        snap(8, { compare: [mid] }, { low: low, mid: mid, high: high },
          t(A[mid] + " er mindre enn " + x + ", så vi leter til høyre.", "A[mid]<x → gå høyre.", "low ← mid+1."), "Gå høyre");
        low = mid + 1;
      } else {
        snap(10, { compare: [mid] }, { low: low, mid: mid, high: high },
          t(A[mid] + " er større enn " + x + ", så vi leter til venstre.", "A[mid]>x → gå venstre.", "high ← mid−1."), "Gå venstre");
        high = mid - 1;
      }
    }
    if (found < 0) snap(12, {}, {}, t("Vi lette ferdig uten å finne " + x + ".", "Ikke funnet → −1.", "return −1."), "Ikke funnet");
    return steps;
  };

  /* ===================== HEAPINSERT (min-heap, H2023) ===================== */
  /* Kun pseudokode + forklaringer + Parsons (tre-demo kommer i 03-heap). */
  IN.algos.heapInsert = {
    title: "Innsetting i min-heap (boble opp)",
    name: "HeapInsert", params: "A, x",
    input: "Et array A som representerer en heap med n elementer, og et element x",
    output: "Et array som representerer en heap, som inneholder x",
    lines: [
      { code: "A[n] ← x", indent: 1,
        eli5: "Vi legger det nye tallet bakerst – på den første ledige plassen nederst i treet.",
        normal: "Sett x inn bakerst (bevarer komplett tre).",
        teknisk: "Innsetting på indeks n holder treet komplett." },
      { code: "i ← n", indent: 1,
        eli5: "Vi husker hvor det nye tallet står.",
        normal: "i peker på det nye elementet.",
        teknisk: "Boble-opp starter fra bladet." },
      { code: "while i > 0 and A[⌊(i−1)/2⌋] > A[i] do", indent: 1,
        eli5: "Så lenge forelderen (tallet over) er STØRRE enn vårt, er det feil i en min-heap.",
        normal: "Mens forelder > barn: heap-egenskapen er brutt.",
        teknisk: "Forelder til i er ⌊(i−1)/2⌋ (0-indeksert)." },
      { code: "swap A[i] and A[⌊(i−1)/2⌋]", indent: 2,
        eli5: "Vi bytter det lille tallet oppover, forbi den større forelderen.",
        normal: "Bytt barn og forelder.",
        teknisk: "Ett bytte per nivå." },
      { code: "i ← ⌊(i−1)/2⌋", indent: 2,
        eli5: "Nå står tallet vårt der forelderen var. Vi fortsetter å sjekke oppover.",
        normal: "Flytt i opp til forelderen.",
        teknisk: "Klatrer mot roten." }
    ],
    bigO: {
      best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)",
      why: t(
        "Treet er lavt – bare noen få «etasjer». Tallet kan maks boble opp én etasje om gangen helt til toppen, og det er få etasjer.",
        "Boble-opp går maks fra blad til rot = høyden ≈ log₂ n. Best O(1) hvis x alt er ≥ forelder.",
        "Komplett tre har høyde ⌊log₂ n⌋ → O(log n) bytter i verste fall; O(1) ekstra minne."
      )
    }
  };

  /* ===================== MERGE SORT ===================== */
  IN.algos.mergeSort = {
    title: "Merge sort (flettesortering)",
    name: "MergeSort", params: "A, lo, hi",
    input: "Et array A og et intervall [lo, hi]",
    output: "A[lo..hi] er sortert",
    lines: [
      { code: "if lo < hi then", indent: 1,
        eli5: "Hvis bunken har mer enn ett kort, deler vi den. Én ting er alltid «sortert».",
        normal: "Basis: et intervall med 0 eller 1 element er ferdig.",
        teknisk: "Rekursjonsbasis når lo ≥ hi." },
      { code: "mid ← ⌊(lo + hi) / 2⌋", indent: 2,
        eli5: "Vi finner midten og deler bunken i to.",
        normal: "Del intervallet i to like halvdeler.",
        teknisk: "mid er splittepunktet; begge halvdeler har ~n/2." },
      { code: "MergeSort(A, lo, mid)", indent: 2,
        eli5: "Vi sorterer venstre halvdel først (på samme måte).",
        normal: "Sorter venstre halvdel rekursivt.",
        teknisk: "T(n/2) for venstre deltre." },
      { code: "MergeSort(A, mid + 1, hi)", indent: 2,
        eli5: "Så sorterer vi høyre halvdel.",
        normal: "Sorter høyre halvdel rekursivt.",
        teknisk: "T(n/2) for høyre deltre." },
      { code: "Merge(A, lo, mid, hi)", indent: 2,
        eli5: "Til slutt fletter vi de to sorterte halvdelene sammen til én sortert bunke.",
        normal: "Flett de to sorterte halvdelene (O(n)).",
        teknisk: "Fletting er det lineære arbeidet per nivå." }
    ],
    bigO: {
      best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)", stable: true, inplace: false,
      why: t(
        "Vi deler bunken i to om og om igjen – det gir få «etasjer» (log n). På hver etasje fletter vi alle tallene én gang (n). Likt uansett hvordan tallene lå.",
        "log n nivåer med splitting, O(n) flettearbeid per nivå → O(n log n) alltid. Trenger et hjelpearray på O(n), så ikke in-place. Stabil.",
        "Delingen gir rekurrensen T(n) = 2T(n/2) + O(n): to halvdeler å sortere, pluss O(n) flettearbeid på hvert nivå. Mestermetoden (tilfelle 2) gir O(n log n), og siden delingen ikke bryr seg om input, er best = snitt = verst. Fletteregelen «ta fra venstre ved likhet» (≤) bevarer stabiliteten. Prisen er et hjelpearray på O(n), så merge er ikke in-place."
      )
    }
  };
  IN.algos.merge = {
    title: "Merge (fletting av to sorterte halvdeler)",
    name: "Merge", params: "A, lo, mid, hi",
    input: "A der A[lo..mid] og A[mid+1..hi] hver er sortert",
    output: "A[lo..hi] sortert",
    lines: [
      { code: "L ← A[lo..mid];  R ← A[mid+1..hi]", indent: 1,
        eli5: "Vi lager to små bunker: venstre (L) og høyre (R). Begge er alt sorterte.",
        normal: "Kopier de to halvdelene til hjelpearrayer L og R.",
        teknisk: "O(n) ekstra minne – dette er hvorfor merge ikke er in-place." },
      { code: "i ← 0;  j ← 0;  k ← lo", indent: 1,
        eli5: "Vi peker på toppen av hver bunke (i og j) og på plassen vi skal fylle (k).",
        normal: "i/j leser L/R; k skriver tilbake i A.",
        teknisk: "Tre pekere; k vandrer fra lo til hi." },
      { code: "while i < |L| and j < |R| do", indent: 1,
        eli5: "Så lenge begge bunkene har kort igjen …",
        normal: "Flett til én av halvdelene er tom.",
        teknisk: "Hver iterasjon skriver ett element → O(n)." },
      { code: "if L[i] ≤ R[j] then A[k++] ← L[i++]", indent: 2,
        eli5: "Det minste øverste kortet legges ned først. Ved likt tar vi fra venstre (det holder orden).",
        normal: "Ta minste front; ≤ fra venstre bevarer stabilitet.",
        teknisk: "≤ (ikke <) gjør flettingen stabil." },
      { code: "else A[k++] ← R[j++]", indent: 2,
        eli5: "Ellers legger vi ned det øverste høyre-kortet.",
        normal: "Ta fra høyre når det er strengt mindre.",
        teknisk: "Symmetrisk gren." },
      { code: "kopier resten av L og R", indent: 1,
        eli5: "Når den ene bunken er tom, legger vi ned resten av den andre.",
        normal: "Tøm den gjenværende halvdelen inn i A.",
        teknisk: "Maks O(n) gjenværende elementer." }
    ],
    bigO: {
      best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(n)", stable: true, inplace: false,
      why: t(
        "Vi tar nøyaktig ett kort om gangen til begge bunkene er tomme – så mange skritt som det er kort.",
        "Hvert element skrives tilbake nøyaktig én gang → O(n). Hjelpearray gjør det O(n) i minne.",
        "Hver sammenligning skriver nøyaktig ett element tilbake til A, så fletting av n elementer koster O(n) tid. ≤-regelen (ta fra venstre ved likhet) er det som gjør det stabilt. Hjelpearrayene L og R koster O(n) ekstra minne."
      )
    }
  };
  // Tracer: fletting skriver tilbake i A; vi markerer skrivecellen og rammer inn [lo,hi] med pekere.
  IN.gen.mergeSort = function (arr) {
    var A = clone(arr), n = A.length, steps = [];
    function snap(marks, ptrs, text, tag) { steps.push({ line: null, array: clone(A), marks: marks, ptrs: ptrs, text: text, tag: tag }); }
    function merge(lo, mid, hi) {
      var L = A.slice(lo, mid + 1), R = A.slice(mid + 1, hi + 1), i = 0, j = 0, k = lo;
      snap({}, { low: lo, mid: mid, high: hi },
        t("Nå fletter vi venstre (" + L.join(",") + ") og høyre (" + R.join(",") + ") sammen.",
          "Flett A[" + lo + ".." + mid + "] og A[" + (mid + 1) + ".." + hi + "].",
          "Merge: L=" + JSON.stringify(L) + ", R=" + JSON.stringify(R) + "."), "Flett");
      while (i < L.length && j < R.length) {
        var fromL = L[i] <= R[j], v = fromL ? L[i] : R[j];
        A[k] = v; if (fromL) i++; else j++;
        snap({ target: k }, { low: lo, high: hi, k: k },
          t("Minste øverste kort er " + v + " – det legges på plass " + k + ".",
            v + " (fra " + (fromL ? "venstre" : "høyre") + ") → A[" + k + "].",
            "A[" + k + "]←" + v + " (" + (fromL ? "L[i++]" : "R[j++]") + ")."), null);
        k++;
      }
      while (i < L.length) { A[k] = L[i++]; snap({ target: k }, { low: lo, high: hi, k: k }, t("Resten av venstre: " + A[k] + ".", "Tøm venstre.", "A[" + k + "]←L."), null); k++; }
      while (j < R.length) { A[k] = R[j++]; snap({ target: k }, { low: lo, high: hi, k: k }, t("Resten av høyre: " + A[k] + ".", "Tøm høyre.", "A[" + k + "]←R."), null); k++; }
      snap({ sorted: range(lo, hi) }, {}, t("Dette stykket er nå sortert.", "A[" + lo + ".." + hi + "] sortert.", "Delresultat ferdig."), "Delferdig");
    }
    function sort(lo, hi) {
      if (lo >= hi) return;
      var mid = Math.floor((lo + hi) / 2);
      snap({}, { low: lo, mid: mid, high: hi },
        t("Vi deler stykket [" + lo + ".." + hi + "] i to ved " + mid + ".",
          "Del [" + lo + ".." + hi + "] ved mid=" + mid + ".",
          "Split lo=" + lo + ", mid=" + mid + ", hi=" + hi + "."), "Del");
      sort(lo, mid); sort(mid + 1, hi); merge(lo, mid, hi);
    }
    sort(0, n - 1);
    steps.push({ line: null, array: clone(A), marks: { sorted: range(0, n - 1) }, ptrs: {}, text: t("Ferdig – alt flettet sammen!", "Sortert.", "Terminert. O(n log n)."), tag: "Ferdig" });
    return steps;
  };

  /* ===================== QUICKSORT (Lomuto) ===================== */
  IN.algos.quickSort = {
    title: "Quicksort",
    name: "QuickSort", params: "A, lo, hi",
    input: "Et array A og et intervall [lo, hi]",
    output: "A[lo..hi] er sortert",
    lines: [
      { code: "if lo < hi then", indent: 1,
        eli5: "Hvis stykket har mer enn ett tall, jobber vi videre.",
        normal: "Basis: 0/1 element er ferdig.",
        teknisk: "Rekursjonsbasis lo ≥ hi." },
      { code: "p ← Partition(A, lo, hi)", indent: 2,
        eli5: "Vi velger et «pivot»-tall og flytter alle mindre til venstre og større til høyre. p er der pivot havner.",
        normal: "Partisjonér rundt pivot; p er pivotens endelige plass.",
        teknisk: "Partition er O(n) og plasserer pivot korrekt." },
      { code: "QuickSort(A, lo, p − 1)", indent: 2,
        eli5: "Så sorterer vi venstre side (de mindre tallene).",
        normal: "Sorter venstre delarray rekursivt.",
        teknisk: "Venstre har p−lo elementer." },
      { code: "QuickSort(A, p + 1, hi)", indent: 2,
        eli5: "Og høyre side (de større).",
        normal: "Sorter høyre delarray rekursivt.",
        teknisk: "Pivot på p er alt på rett plass." }
    ],
    bigO: {
      best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)", stable: false, inplace: true,
      why: t(
        "Går det bra, deler pivot stykket omtrent i to hver gang – få etasjer. Men hvis pivot alltid er minst eller størst (f.eks. alt er sortert fra før), deler den dårlig og det blir n etasjer.",
        "Snitt O(n log n) med balanserte partisjoner. Verst O(n²) når pivot stadig er min/maks (sortert input). In-place; O(log n) stakkplass. Ikke stabil.",
        "Partisjoneringen deler i to biter av størrelse k og n−1−k, så arbeidet følger T(n) = T(k) + T(n−1−k) + O(n). Treffer pivot noenlunde midt på, får vi omtrent like halvdeler og O(n log n). Går det galt og pivot stadig blir minste eller største element (f.eks. ferdigsortert input med Lomuto), krymper biten med bare 1 hver gang, summen blir Σn = O(n²), og rekursjonen blir dyp. Forventet rekursjonsdybde er likevel O(log n). Quick er ikke stabil, fordi partisjoneringen flytter elementer over lange avstander."
      )
    }
  };
  IN.algos.partition = {
    title: "Partition (Lomuto)",
    name: "Partition", params: "A, lo, hi",
    input: "A[lo..hi]",
    output: "Pivot på rett plass; indeksen returneres",
    lines: [
      { code: "pivot ← A[hi]", indent: 1,
        eli5: "Vi velger det siste tallet som pivot – målestokken vi sammenligner mot.",
        normal: "Velg siste element som pivot.",
        teknisk: "Lomuto bruker A[hi]; valget avgjør worst case." },
      { code: "i ← lo − 1", indent: 1,
        eli5: "«i» holder styr på hvor langt de mindre tallene rekker.",
        normal: "i er grensen for «≤ pivot»-delen.",
        teknisk: "i+1 er første plass ≥ pivot." },
      { code: "for j ← lo to hi − 1 do", indent: 1,
        eli5: "Vi går gjennom alle tallene (unntatt pivot) med «j».",
        normal: "Skann resten og flytt små til venstre.",
        teknisk: "O(n) sammenligninger." },
      { code: "if A[j] ≤ pivot then", indent: 2,
        eli5: "Er tallet mindre enn eller likt pivot?",
        normal: "Hører A[j] til venstre del?",
        teknisk: "≤ (ikke stabil) men korrekt." },
      { code: "i ← i + 1;  swap A[i] and A[j]", indent: 3,
        eli5: "Da skyver vi grensen fram og bytter tallet inn i venstre del.",
        normal: "Utvid venstre del og legg A[j] dit.",
        teknisk: "Ett bytte; i følger venstre del." },
      { code: "swap A[i+1] and A[hi]", indent: 1,
        eli5: "Til slutt setter vi pivot rett bak de mindre tallene – nå står pivot helt riktig.",
        normal: "Plasser pivot mellom de to delene.",
        teknisk: "Pivot til indeks i+1 (endelig plass)." },
      { code: "return i + 1", indent: 1,
        eli5: "Vi forteller hvor pivot havnet.",
        normal: "Returner pivotindeksen.",
        teknisk: "p = i+1." }
    ],
    bigO: {
      best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)", stable: false, inplace: true,
      why: t(
        "Vi ser på hvert tall én gang og bytter litt – så mange skritt som det er tall.",
        "Én gjennomgang med O(1) arbeid per element → O(n). In-place.",
        "Løkka går gjennom A[lo..hi−1] én gang med O(1) arbeid per element, altså n−1 sammenligninger og O(n) tid. Den jobber in-place (O(1) ekstra minne). Fordi små elementer byttes forbi hverandre, er partisjoneringen ikke stabil."
      )
    }
  };
  IN.gen.quickSort = function (arr) {
    var A = clone(arr), n = A.length, steps = [];
    function snap(marks, ptrs, text, tag) { steps.push({ line: null, array: clone(A), marks: marks, ptrs: ptrs, text: text, tag: tag }); }
    function qs(lo, hi) {
      if (lo >= hi) return;
      var pivot = A[hi], i = lo - 1;
      snap({ min: hi }, { low: lo, high: hi },
        t("Vi velger A[" + hi + "] = " + pivot + " som pivot (lilla). Alt mindre skal til venstre.",
          "Pivot = A[" + hi + "] = " + pivot + "; partisjonér [" + lo + ".." + hi + "].",
          "pivot=A[" + hi + "]=" + pivot + ", i=" + (lo - 1) + "."), "Pivot");
      for (var j = lo; j < hi; j++) {
        var le = A[j] <= pivot, p = { low: lo, high: hi, j: j }; if (i >= lo) p.i = i;
        snap({ min: hi, compare: [j] }, p,
          t("A[" + j + "] = " + A[j] + (le ? " er ≤ pivot " + pivot + " – det skal til venstre." : " er > pivot " + pivot + " – det blir stående."),
            "A[" + j + "]=" + A[j] + (le ? " ≤ " : " > ") + pivot + ".",
            "j=" + j + ": A[j]≤pivot? " + (le ? "ja" : "nei") + "."), le ? "≤ pivot" : "> pivot");
        if (le) {
          i++; var tmp = A[i]; A[i] = A[j]; A[j] = tmp;
          var p2 = { low: lo, high: hi, i: i }; if (j !== i) p2.j = j;
          snap({ min: hi, swap: [i, j] }, p2,
            t("Vi utvider venstre del og bytter " + A[i] + " inn dit.",
              "i ← " + i + "; bytt A[" + i + "] og A[" + j + "].",
              "i++; swap A[" + i + "],A[" + j + "]."), "Til venstre");
        }
      }
      var pi = i + 1, tmp2 = A[pi]; A[pi] = A[hi]; A[hi] = tmp2;
      snap({ swap: [pi, hi], sorted: [pi] }, { low: lo, high: hi },
        t("Pivot " + pivot + " settes på plass " + pi + " – nå står den helt riktig (grønn).",
          "Pivot til plass " + pi + "; den er ferdig.",
          "swap A[" + pi + "],A[" + hi + "]; p=" + pi + "."), "Pivot plassert");
      qs(lo, pi - 1); qs(pi + 1, hi);
    }
    qs(0, n - 1);
    steps.push({ line: null, array: clone(A), marks: { sorted: range(0, n - 1) }, ptrs: {}, text: t("Ferdig!", "Sortert.", "Terminert."), tag: "Ferdig" });
    return steps;
  };
})();
