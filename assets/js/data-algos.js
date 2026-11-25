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
  /* Variabellinja (varline.js): ix = variabel som peker på en plass (får prikk i fargen til
     søyla/cella), vv = ren verdi. undefined vises som «–»: ikke satt ennå i denne runden, eller
     en for-løkkevariabel utenfor løkka si. Navnene er nøyaktig som i pseudokoden. */
  function ix(name, v, row) { var o = { name: name, value: v, idx: v }; if (row) o.row = row; return o; }
  function vv(name, v) { return { name: name, value: v }; }

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
        teknisk: "Står minimum allerede på plass i, er byttet unødvendig og hoppes over." },
      { code: "swap A[i] and A[k]", indent: 3,
        eli5: "Vi bytter det minste tallet inn på plass i. Nå er plass i ferdig!",
        normal: "Plasser minimum på sin endelige plass i.",
        teknisk: "Høyst ett bytte per i → O(n) bytter totalt." }
    ],
    bigO: {
      best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", stable: false, inplace: true,
      why: t(
        "Vi må alltid se gjennom ALLE de gjenværende tallene for å finne det minste, uansett om de er sortert fra før. Derfor blir det like mange sammenligninger hver gang – massevis.",
        "Alltid O(n²) sammenligninger: ytre løkke n ganger, indre skanner i snitt n/2. Antall bytter er bare O(n). Ingen tidlig stopp hjelper, så best = verst.",
        "Selection gjør alltid like mye arbeid: for hver i skanner vi hele resten A[i..n−1] etter et minimum, og skannene summerer seg til (n−1) + (n−2) + … + 1 = n(n−1)/2 ≈ O(n²) sammenligninger (første runde sammenligner A[0] med de n−1 andre – ikke n, for et element sammenlignes aldri med seg selv – neste runde med n−2, og så videre) – helt uavhengig av hvordan tallene lå til å begynne med (derfor best = verst). Til gjengjeld gjør vi høyst ett bytte per i, altså O(n) bytter totalt. Den er in-place (ingen ekstra datastruktur), men ikke stabil: langdistanse-byttet kan løfte et element forbi en lik verdi og snu rekkefølgen deres."
      )
    }
  };
  IN.gen.selectionSort = function (arr) {
    var A = clone(arr), n = A.length, steps = [], i, j, k, cmp = 0;
    // Variablene følger pekerne: k og j er «–» til de settes i runden (k på linje 3, j i den indre løkka).
    function snap(line, marks, ptrs, text, tag) {
      steps.push({ line: line, array: clone(A), marks: marks, ptrs: ptrs, text: text, tag: tag,
        vars: [ix("i", ptrs.i), ix("k", ptrs.k), ix("j", ptrs.j), vv("n", n)] });
    }
    snap(null, {}, {},
      t("Her er tallene vi skal sortere: " + A.join(", ") + ". Vi fyller plassene fra venstre, én om gangen, med det minste tallet som er igjen.",
        "Input: [" + A.join(", ") + "], n = " + n + ". Selection sort fyller plass 0, 1, … med det minste av dem som er igjen.",
        "Input A = [" + A.join(", ") + "], n = " + n + ". Invariant: før runde i er A[0..i − 1] de i minste, på endelig plass."), "Start");
    for (i = 0; i < n; i++) {
      var sorted = range(0, i - 1);
      snap(2, { sorted: sorted, target: i }, { i: i },
        t("Nå skal vi fylle plass " + i + ". Vi leter etter det minste tallet blant dem som er igjen.",
          "i = " + i + ": finn minste i A[" + i + ".." + (n - 1) + "].",
          "Ytre iterasjon i = " + i + ". " + (i === 0 ? "Sortert prefiks: tomt (ingen elementer er plassert ennå)." : "A[0.." + (i - 1) + "] er ferdig (grønt).")), "Ny plass");
      k = i;
      snap(3, { sorted: sorted, target: i, min: k }, { i: i, k: k },
        t("Vi antar at det minste er her på plass " + i + " (verdi " + A[i] + ") inntil vi finner noe mindre.",
          "k ← " + k + " (antatt minste = " + A[k] + ").",
          "k ← " + k + ", kandidatminimum = " + A[k] + "."), "Antatt minste");
      for (j = i + 1; j < n; j++) {
        var less = A[j] < A[k]; cmp++;
        snap(5, { sorted: sorted, target: i, min: k, compare: [j] }, { i: i, k: k, j: j },
          t("Vi ser på tallet " + A[j] + " (det står på plass " + j + "). Det minste vi har sett så langt er " + A[k] + " (det står på plass " + k + "). " +
              (less ? "Oi – " + A[j] + " er mindre!" : A[j] + " er ikke mindre, så vi beholder " + A[k] + "."),
            "Sammenlign A[" + j + "] = " + A[j] + " med minste A[" + k + "] = " + A[k] + (less ? ": mindre, nytt minste." : ": ikke mindre, ingen endring."),
            "j = " + j + ": A[j] &lt; A[k]? " + A[j] + " &lt; " + A[k] + " er " + (less ? "sant." : "usant.")), less ? "Mindre funnet" : "Ingen ny minste");
        if (less) {
          k = j;
          snap(6, { sorted: sorted, target: i, min: k }, { i: i, k: k, j: j },
            t("Nå husker vi plass " + j + " (tallet " + A[j] + ") som det minste.",
              "k ← " + j + " (nytt minste = " + A[k] + ").",
              "k ← " + j + " (ny minimumsindeks)."), "Nytt minste");
        }
      }
      var scanned = i + 1 < n ? "j har gått gjennom hele resten" : "Det er ingen tall etter plass " + i + ", så den indre løkka kjørte ikke";
      snap(7, { sorted: sorted, target: i, min: k }, { i: i, k: k },
        t((i + 1 < n ? "Vi har sett på alle tallene som er igjen. Det minste er " + A[k] + " på plass " + k + ". "
              : "Det er bare ett tall igjen, " + A[i] + ". ") +
            (i !== k ? "Det står ikke på plass " + i + ", så vi må bytte." : "Det står allerede på plass " + i + ", så vi trenger ikke bytte."),
          scanned + ". Minste er A[" + k + "] = " + A[k] + ". i ≠ k? " + (i !== k ? "Ja (" + i + " ≠ " + k + "), så vi bytter." : "Nei, i = k = " + i + ": ingen bytte."),
          scanned + "; k = " + k + ". Testen i ≠ k er " + (i !== k ? "sann → swap." : "usann → byttet hoppes over.") + (i !== k ? "" : " A[" + i + "] er på endelig plass.")),
        i !== k ? "Bytte trengs" : "Ingen bytte");
      if (i !== k) {
        var a = A[i], b = A[k];
        A[i] = b; A[k] = a;
        snap(8, { sorted: sorted, swap: [i, k] }, { i: i, k: k },
          t("Byttet! " + b + " står nå på plass " + i + ", og " + a + " flyttet bakover til plass " + k + ". Plass " + i + " er ferdig.",
            "Byttet A[" + i + "] og A[" + k + "]: nå er A[" + i + "] = " + b + " og A[" + k + "] = " + a + ". Plass " + i + " er på endelig plass.",
            "Etter swap A[" + i + "], A[" + k + "]: A[0.." + i + "] er de " + (i + 1) + " minste, i sortert rekkefølge."), "Byttet");
      }
    }
    steps.push({ line: null, array: clone(A), marks: { sorted: range(0, n - 1) }, ptrs: {},
      vars: [ix("i"), ix("k", k), ix("j"), vv("n", n)],
      text: t("Ferdig! Alle tallene står i rekkefølge: " + A.join(", ") + ".",
        "Sortert: [" + A.join(", ") + "]. Selection gjorde " + cmp + " sammenligninger.",
        "Terminert: [" + A.join(", ") + "]. " + cmp + " sammenligninger = n(n − 1)/2 for n = " + n + ", uansett input: O(n²)."), tag: "Ferdig" });
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
        teknisk: "Flagget lar oss stoppe tidlig når arrayet er sortert." },
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
        teknisk: "Er vi her uten å ha byttet noe, er arrayet allerede sortert, og vi kan stoppe. Det er dette som gir bubble O(n) i beste tilfelle." },
      { code: "break", indent: 3,
        eli5: "Vi stopper tidlig – ferdig!",
        normal: "Avslutt løkka.",
        teknisk: "Bryt ut av ytre løkke." }
    ],
    bigO: {
      best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true, inplace: true,
      why: t(
        "Hvis tallene alt er sortert, går vi én runde uten å bytte noe og stopper. Da er det raskt. Men hvis de er rotet, må vi bytte om og om igjen.",
        "Takket være swapped-flagget slipper vi unna med én runde når input alt er sortert, så beste tilfelle blir O(n). Er input rotete, må vi derimot gjøre nabobytter om og om igjen, og både snitt og verste tilfelle blir O(n²). Bubble er stabil, siden vi bare bytter når det ene elementet er strengt større enn nabo.",
        "I verste fall (omvendt sortert) står hvert eneste par i feil rekkefølge, så antallet inversjoner er antall par: n(n−1)/2 (hvert av de n elementene kan pares med de n−1 andre, og vi deler på 2 fordi hvert par ellers telles to ganger). Og siden hvert nabobytte fjerner nøyaktig én inversjon, blir det O(n²) arbeid. Med swapped-flagget får vi O(n) i beste tilfelle: en allerede sortert liste gir én runde uten bytter. Algoritmen er in-place (ingen ekstra datastruktur) og stabil."
      )
    }
  };
  IN.gen.bubbleSort = function (arr) {
    var A = clone(arr), n = A.length, steps = [], swaps = 0, lastSwapped;
    // i er en rundeteller, ikke en plass i arrayet: den vises som en pille over søylene (vars), ikke som peker.
    // vars: [i, swapped] fra kallet; j følger pekeren (bare i den indre løkka).
    function snap(line, marks, ptrs, text, tag, vars) {
      var m = {}; (vars || []).forEach(function (p) { m[p[0]] = p[1]; });
      steps.push({ line: line, array: clone(A), marks: marks, ptrs: ptrs, text: text, tag: tag,
        vars: [vv("i", m.i), vv("swapped", m.swapped), ix("j", ptrs.j), vv("n", n)] });
    }
    snap(null, {}, {},
      t("Her er tallene vi skal sortere: " + A.join(", ") + ". Vi tar runde etter runde og bytter naboer som står feil vei.",
        "Input: [" + A.join(", ") + "], n = " + n + ". Hver runde bobler det største gjenværende tallet bakerst.",
        "Input A = [" + A.join(", ") + "], n = " + n + ". Etter runde i står de i + 1 største bakerst på endelig plass."), "Start");
    for (var i = 0; i < n; i++) {
      var tail = range(n - i, n - 1);
      var swapped = false; lastSwapped = "false";
      snap(3, { sorted: tail }, {},
        t("Runde " + (i + 1) + " (i = " + i + "). Vi har ikke byttet noe i denne runden ennå.",
          "Runde i = " + i + ": swapped ← false." + (i ? " De " + i + " bakerste står ferdig." : ""),
          "Ytre iterasjon i = " + i + "; swapped ← false. " + (i ? "Halen A[" + (n - i) + ".." + (n - 1) + "] er ferdig sortert." : "Ingen hale ennå.")), "Ny runde",
        [["i", i], ["swapped", "false"]]);
      for (var j = 0; j < n - 1 - i; j++) {
        var gt = A[j] > A[j + 1];
        snap(5, { sorted: tail, compare: [j, j + 1] }, { j: j },
          t("Er " + A[j] + " større enn naboen sin til høyre, " + A[j + 1] + "? " + (gt ? "Ja, da står de feil vei." : "Nei, da får de stå."),
            "Sammenlign naboene A[" + j + "] = " + A[j] + " og A[" + (j + 1) + "] = " + A[j + 1] + (gt ? ": feil rekkefølge, bytt." : ": i orden."),
            "j = " + j + ": A[j] &gt; A[j + 1]? " + A[j] + " &gt; " + A[j + 1] + " er " + (gt ? "sant." : "usant.")), gt ? "Feil vei" : "I orden",
          [["i", i], ["swapped", String(swapped)]]);
        if (gt) {
          var a = A[j], b = A[j + 1];
          A[j] = b; A[j + 1] = a; swapped = true; lastSwapped = "true"; swaps++;
          snap(6, { sorted: tail, swap: [j, j + 1] }, { j: j },
            t("Byttet! " + a + " sklir ett hakk til høyre, og " + b + " flytter til venstre. Vi husker at vi har byttet noe i denne runden.",
              "Byttet A[" + j + "] og A[" + (j + 1) + "]: nå " + b + ", " + a + ". swapped ← true (linje 7).",
              "swap A[" + j + "], A[" + (j + 1) + "]; swapped ← true (linje 7). Ett nabobytte fjerner nøyaktig én inversjon."), "Byttet",
            [["i", i], ["swapped", "true"]]);
        }
      }
      var newTail = range(n - 1 - i, n - 1);
      if (!swapped) {
        var none = n - 1 - i <= 0;
        snap(9, { sorted: range(0, n - 1) }, {},
          t(none ? "Det er ingen nabopar igjen å sjekke, så runden byttet ingenting. Vi stopper."
                 : "Hele runden gikk uten et eneste bytte. Da står alt riktig, og vi kan stoppe tidlig!",
            (none ? "Runden hadde ingen par igjen å sjekke, så" : "Ingen bytter i runde i = " + i + ", så") + " swapped = false: break.",
            "if not swapped er sann: break. " + (none ? "(Siste runde har tom indre løkke.)" : "Tidlig stopp etter " + (i + 1) + " runde" + (i ? "r" : "") + " – dette gir O(n) på sortert input.")),
          none ? "Ingen par igjen" : "Tidlig stopp", [["i", i], ["swapped", "false"]]);
        break;
      }
      snap(8, { sorted: newTail }, {},
        t("Runden er ferdig. Vi byttet noe, så vi tar en runde til. " + A[n - 1 - i] + " har boblet helt fram til plass " + (n - 1 - i) + " og står ferdig.",
          "Slutt på runde i = " + i + ": swapped = true, så vi fortsetter. A[" + (n - 1 - i) + "] = " + A[n - 1 - i] + " er på endelig plass.",
          "if not swapped er usann. A[" + (n - 1 - i) + ".." + (n - 1) + "] er de " + (i + 1) + " største, på endelig plass."), "Runde ferdig",
        [["i", i], ["swapped", "true"]]);
    }
    steps.push({ line: null, array: clone(A), marks: { sorted: range(0, n - 1) }, ptrs: {},
      vars: [vv("i"), vv("swapped", lastSwapped), ix("j"), vv("n", n)],
      text: t("Ferdig! Tallene står i rekkefølge: " + A.join(", ") + ".",
        "Sortert: [" + A.join(", ") + "] etter " + swaps + " bytte" + (swaps === 1 ? "" : "r") + ".",
        "Terminert: [" + A.join(", ") + "]. " + swaps + " nabobytter = antall inversjoner i input."), tag: "Ferdig" });
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
        teknisk: "Gå ett hakk til venstre." },
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
        "Det fine med insertion er at arbeidet er proporsjonalt med antall inversjoner: en sortert liste har null inversjoner og gir O(n) i beste tilfelle, mens en omvendt liste har n(n−1)/2 – alle par står feil – og gir O(n²). Hvert element skyves bare forbi dem som faktisk er større, så like elementer beholder rekkefølgen (stabil), og alt skjer i selve arrayet (in-place)."
      )
    }
  };
  IN.gen.insertionSort = function (arr) {
    /* Kursversjonen forskyver (ingen bytter): key holdes til side, større tall kopieres ett hakk
       til høyre, og key skrives inn i hullet til slutt. Hullet (plassen key skal inn på hvis løkka
       stopper nå) vises som en tom, stiplet søyle – den gamle verdien står igjen der til den overskrives. */
    var A = clone(arr), n = A.length, steps = [], shifts = 0, key, j;
    function prefixBut(upto, hole) { return range(0, upto).filter(function (z) { return z !== hole; }); }
    // vars-par [i, j] fra kallet; key er verdien i hånda (fra hold, eller keyVal når boksen er lagt ned).
    function snap(line, marks, ptrs, text, tag, hold, vars, keyVal) {
      var m = {}; (vars || []).forEach(function (p) { m[p[0]] = p[1]; });
      steps.push({ line: line, array: clone(A), marks: marks, ptrs: ptrs, text: text, tag: tag, hold: hold || null,
        vars: [ix("i", m.i), vv("key", hold ? hold.v : keyVal), ix("j", m.j), vv("n", n)] });
    }
    snap(null, {}, {},
      t("Her er tallene vi skal sortere: " + A.join(", ") + ". Det første tallet alene regnes som sortert. Så setter vi inn ett tall om gangen på rett plass blant dem til venstre.",
        "Input: [" + A.join(", ") + "], n = " + n + ". A[0..0] er sortert seg imellom fra start.",
        "Input A = [" + A.join(", ") + "], n = " + n + ". Invariant: før runde i er A[0..i − 1] sortert seg imellom (men ikke nødvendigvis på endelig plass)."), "Start");
    for (var i = 1; i < n; i++) {
      snap(2, { part: range(0, i - 1), target: i }, { i: i },
        t("Tallene på plass 0 til " + (i - 1) + " er sortert seg imellom (skravert). Nå skal tallet på plass " + i + ", " + A[i] + ", settes inn blant dem.",
          "i = " + i + ": A[0.." + (i - 1) + "] er sortert seg imellom. Neste tall: A[" + i + "] = " + A[i] + ".",
          "Ytre iterasjon i = " + i + ". Invariant: A[0.." + (i - 1) + "] sortert seg imellom."), "Ny runde", null, [["i", i]]);
      key = A[i];
      snap(3, { part: range(0, i - 1), stale: [i] }, { i: i },
        t("Vi plukker opp " + key + " og holder det i hånda (key). Plass " + i + " er nå ledig – vi trenger ikke tallet som står igjen der.",
          "key ← A[" + i + "] = " + key + ". Plass " + i + " regnes som ledig (et «hull»).",
          "key ← " + key + ". A[" + i + "] kan nå overskrives; hullet er på j + 1 = " + i + "."), "Ta ut key", { label: "key", v: key }, [["i", i]]);
      j = i - 1;
      snap(4, { part: range(0, i - 1), stale: [i] }, { i: i, j: j },
        t("Vi begynner å sammenligne med naboen til venstre, på plass " + j + ".",
          "j ← i − 1 = " + j + ".",
          "j ← " + j + ". Hullet ligger alltid på j + 1."), "Start j", { label: "key", v: key }, [["i", i], ["j", j]]);
      while (true) {
        var go = j >= 0 && A[j] > key;
        var jp = {}; if (j >= 0) jp.j = j; jp.i = i;
        snap(5, { part: prefixBut(i, j + 1), compare: j >= 0 ? [j] : [], stale: [j + 1] }, jp,
          t(j < 0 ? "Det er ingen flere tall til venstre. Da skal " + key + " helt først, og vi slutter å lete."
                  : go ? A[j] + " er større enn " + key + ", så " + A[j] + " må flytte seg ett hakk til høyre."
                       : A[j] + " er ikke større enn " + key + ". Da skal " + key + " stå rett etter " + A[j] + ", og vi slutter å lete.",
            j < 0 ? "j = −1: j ≥ 0 er usann, så løkka stopper. key skal inn på plass 0."
                  : "A[" + j + "] = " + A[j] + " &gt; key = " + key + "? " + (go ? "Ja: skyv." : "Nei: løkka stopper, key skal inn på plass " + (j + 1) + "."),
            j < 0 ? "j ≥ 0 er usann (j = −1): løkka terminerer; hullet er på 0."
                  : "Testen A[j] &gt; key er " + (go ? "sann." : "usann (" + A[j] + " ≤ " + key + "): løkka terminerer. Streng &gt; gjør at et likt tall ikke passeres – derfor stabil.")),
          go ? "Større: skyv" : "Løkka stopper", { label: "key", v: key, cls: j >= 0 ? "compare" : null }, [["i", i], ["j", j]]);
        if (!go) break;
        var mv = A[j];
        A[j + 1] = mv; shifts++;
        snap(6, { part: prefixBut(i, j), target: j + 1, stale: [j] }, { i: i, j: j },
          t(mv + " kopieres ett hakk til høyre, til plass " + (j + 1) + ". Den gamle " + mv + " på plass " + j + " står igjen til den blir overskrevet – nå er det den plassen som er ledig.",
            "A[" + (j + 1) + "] ← A[" + j + "] = " + mv + ". Hullet flytter seg til plass " + j + ".",
            "Forskyvning nr. " + shifts + ": A[" + (j + 1) + "] ← A[" + j + "]. Én forskyvning per inversjon key danner med prefikset."), "Forskyv",
          { label: "key", v: key }, [["i", i], ["j", j]]);
        j--;
        var jp2 = {}; if (j >= 0) jp2.j = j; jp2.i = i;
        snap(7, { part: prefixBut(i, j + 1), stale: [j + 1] }, jp2,
          t(j >= 0 ? "Vi går ett hakk til venstre og ser på plass " + j + "." : "Vi går ett hakk til venstre – men nå er vi forbi starten av arrayet.",
            "j ← j − 1 = " + j + ".",
            "j ← " + j + "."), "Ett steg ned", { label: "key", v: key }, [["i", i], ["j", j]]);
      }
      A[j + 1] = key;
      var jp3 = { i: i }; if (j >= 0) jp3.j = j;
      snap(8, { part: range(0, i), target: j + 1 }, jp3,
        t("Vi legger " + key + " ned i det ledige hullet på plass " + (j + 1) + ". Nå er tallene på plass 0 til " + i + " sortert seg imellom.",
          "A[j + 1] = A[" + (j + 1) + "] ← key = " + key + ". A[0.." + i + "] er sortert seg imellom.",
          "A[" + (j + 1) + "] ← key. Invarianten gjelder nå for A[0.." + i + "]."), "Satt inn", null, [["i", i], ["j", j]], key);
    }
    steps.push({ line: null, array: clone(A), marks: { sorted: range(0, n - 1) }, ptrs: {},
      vars: [ix("i"), vv("key", key), ix("j", j), vv("n", n)],
      text: t("Ferdig! Alle tallene står i rekkefølge: " + A.join(", ") + ". Først nå vet vi at hvert tall står på sin endelige plass.",
        "Sortert: [" + A.join(", ") + "] med " + shifts + " forskyvning" + (shifts === 1 ? "" : "er") + ".",
        "Terminert: [" + A.join(", ") + "]. " + shifts + " forskyvninger = antall inversjoner i input."), tag: "Ferdig" });
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
        teknisk: "Bare én peker og ingen indre løkke." },
      { code: "while i < n do", indent: 1,
        eli5: "Så lenge nissen ikke har gått forbi slutten, fortsetter han.",
        normal: "Fortsett til i når enden av arrayet.",
        teknisk: "Løkka avsluttes når i = n." },
      { code: "if i > 0 and A[i−1] > A[i] then", indent: 2,
        eli5: "Er tallet bak nissen større enn tallet han står på? (Og han er ikke helt i starten.)",
        normal: "Er naboparet (i−1, i) i feil rekkefølge?",
        teknisk: "Streng &gt; gjør den stabil; i &gt; 0 hindrer at vi leser A[−1]." },
      { code: "A[i−1],A[i] ← A[i],A[i−1]", indent: 3,
        eli5: "Da bytter han dem, så det minste havner til venstre.",
        normal: "Bytt A[i−1] og A[i]  (swap).",
        teknisk: "Nabobytte, som i insertion sort." },
      { code: "i ← i − 1", indent: 3,
        eli5: "Og så går nissen ETT skritt tilbake for å sjekke om det nye paret også må byttes.",
        normal: "Gå ett hakk tilbake etter bytte.",
        teknisk: "Steget tilbake gir samme oppførsel som insertion sort." },
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
        "Gnome oppfører seg som insertion sort, men flytter elementer med bytter i stedet for forskyvninger: er input sortert, går nissen bare framover (O(n) i beste tilfelle), mens rotete input gir mye fram og tilbake og O(n²). Stabil og in-place.",
        "Antall bytter er lik antall inversjoner, så beste tilfelle (sortert) er O(n) og verste (omvendt) er O(n²). Hvert bytte følges av i ← i−1, så den samlede fremdriften er O(n + antall inversjoner) – samme idé som insertion, bare uttrykt med nabobytter."
      )
    }
  };
  IN.gen.gnomeSort = function (arr) {
    /* Invariant (vises skravert): A[0..i − 1] er alltid sortert seg imellom. i vises både som peker
       og som pille, så i = n (forbi siste plass) også synes. Pekeren flyttes i samme steg som i ← i ± 1. */
    var A = clone(arr), n = A.length, steps = [], guard = 0, swaps = 0;
    function snap(line, marks, i, text, tag) {
      var p = {}; if (i < n) p.i = i;
      steps.push({ line: line, array: clone(A), marks: marks, ptrs: p, text: text, tag: tag, vars: [ix("i", i), vv("n", n)] });
    }
    var i = 0;
    snap(2, {}, i,
      t("Her er tallene: " + A.join(", ") + ". Nissen starter helt til venstre, på plass 0.",
        "Input: [" + A.join(", ") + "], n = " + n + ". i ← 0.",
        "Input A = [" + A.join(", ") + "]. i ← 0; invariant: A[0..i − 1] er sortert seg imellom."), "Start");
    while (i < n && guard++ < 400) {
      var part = range(0, i - 1);
      if (i === 0) {
        snap(4, { part: part }, i,
          t("Nissen står helt først. Det er ingen potte bak ham å sammenligne med.",
            "i = 0: i &gt; 0 er usann, så testen er usann og vi går til else.",
            "i &gt; 0 er usann; «and» kortslutter, så A[−1] leses aldri. Gå til else."), "Ingen nabo bak");
        i++;
        snap(8, { part: range(0, i - 1) }, i,
          t("Han går ett skritt fram, til plass " + i + ".", "i ← i + 1 = " + i + ".", "i ← " + i + "."), "Framover");
        continue;
      }
      var a = A[i - 1], b = A[i], wrong = a > b;
      snap(4, { part: part, compare: [i - 1, i] }, i,
        t("Nissen ser på potten bak seg (" + a + ") og potten han står ved (" + b + "). " + (wrong ? a + " er større enn " + b + ", så de står feil." : a + " er ikke større enn " + b + ", så de står riktig."),
          "A[" + (i - 1) + "] = " + a + " &gt; A[" + i + "] = " + b + "? " + (wrong ? "Ja: bytt og gå tilbake." : "Nei: paret er i orden, gå fram."),
          "i = " + i + ": A[i − 1] &gt; A[i] er " + (wrong ? "sann." : "usann (" + a + " ≤ " + b + "), så A[0.." + i + "] er sortert seg imellom.")), wrong ? "Feil vei" : "I orden");
      if (wrong) {
        A[i - 1] = b; A[i] = a; swaps++;
        snap(5, { part: range(0, i - 2), swap: [i - 1, i] }, i,
          t("Byttet! Nå står " + b + " foran " + a + ".",
            "Byttet A[" + (i - 1) + "] og A[" + i + "]: nå " + b + ", " + a + ".",
            "swap A[" + (i - 1) + "], A[" + i + "] (bytte nr. " + swaps + ")."), "Byttet");
        i--;
        snap(6, { part: range(0, i - 1) }, i,
          t("Nissen går ett skritt tilbake, til plass " + i + ", for å sjekke om " + b + " også står feil i forhold til potten bak.",
            "i ← i − 1 = " + i + ".",
            "i ← " + i + ". Det nye paret (i − 1, i) kan nå stå feil, så det må sjekkes."), "Ett tilbake");
      } else {
        i++;
        snap(8, { part: range(0, i - 1) }, i,
          t("Han går ett skritt fram" + (i < n ? ", til plass " + i + "." : " – forbi den siste potten."),
            "else: i ← i + 1 = " + i + ".",
            "i ← " + i + "."), "Framover");
      }
    }
    snap(3, { sorted: range(0, n - 1) }, i,
      t("Nissen har gått forbi den siste potten. Alt står i rekkefølge: " + A.join(", ") + ".",
        "i = n = " + n + ": while i &lt; n er usann, og løkka stopper. Sortert: [" + A.join(", ") + "].",
        "i = n: løkka terminerer. A[0..n − 1] er sortert (invarianten med i = n). " + swaps + " bytter = antall inversjoner."), "Ferdig");
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
      { code: "mid ← ⌊(low + high) / 2⌋", indent: 2, eli5: "Vi slår opp midt i bunken.", normal: "Finn midtindeksen.", teknisk: "Heltallsdivisjon rundet ned. Siden low ≤ high, ligger mid alltid i intervallet [low, high]." },
      { code: "if A[mid] = x then", indent: 2, eli5: "Er tallet i midten akkurat det vi leter etter?", normal: "Treff?", teknisk: "Likhetssjekk." },
      { code: "return mid", indent: 3, eli5: "Ja! Vi fant det. Svar med plassen.", normal: "Returner indeksen.", teknisk: "Funnet på mid." },
      { code: "else if A[mid] < x then", indent: 2, eli5: "Er midten for liten? Da ligger tallet til høyre.", normal: "For lite → søk i høyre halvdel.", teknisk: "Kast venstre halvdel." },
      { code: "low ← mid + 1", indent: 3, eli5: "Vi flytter «low» forbi midten.", normal: "Snevr inn fra venstre.", teknisk: "A[mid] &lt; x og A er sortert, så alt i A[low..mid] er for lite. Den nye nedre grensen er mid + 1." },
      { code: "else", indent: 2, eli5: "Ellers er midten for stor, og tallet ligger til venstre.", normal: "For stort → søk i venstre halvdel.", teknisk: "Kast høyre halvdel." },
      { code: "high ← mid − 1", indent: 3, eli5: "Vi flytter «high» forbi midten.", normal: "Snevr inn fra høyre.", teknisk: "A[mid] &gt; x, så alt i A[mid..high] er for stort. Den nye øvre grensen er mid − 1." },
      { code: "return −1", indent: 1, eli5: "Lette ferdig uten å finne det. Svar −1.", normal: "Ikke funnet.", teknisk: "Intervallet tomt → −1." }
    ],
    bigO: {
      best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)",
      why: t(
        "Hver gang halverer vi bunken vi leter i. Å halvere 1000 sider ned til 1 tar bare ca. 10 steg – derfor er det lynraskt.",
        "Intervallet halveres hver runde, så det blir høyst ⌊log n⌋ + 1 runder, altså O(log n). Krever at arrayet er sortert på forhånd.",
        "Hver runde gjør konstant arbeid og halverer intervallet, så O(log n) runder. Best O(1) hvis x ligger på første mid. Kursets versjon svarer true/false; returnerer du indeksen, si at du har endret den."
      )
    }
  };
  // line-indeks: Procedure=1, low=2, high=3, while=4, mid=5, if=6, return mid=7, elseif=8, low←=9, else=10, high←=11, return −1=12
  // Brukes ikke av sidene i dag (02-sok har IN.gen.binarySearchTrace), men holdes riktig.
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
      snap(4, {}, { low: low, high: high },
        t("Det er fortsatt plasser igjen å lete i, fra " + low + " til " + high + ".", "low ≤ high (" + low + " ≤ " + high + ") → ny runde.", "Intervallet [" + low + ", " + high + "] er ikke tomt."), "Løkke");
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
        snap(9, { compare: [mid] }, { low: low, mid: mid, high: high },
          t(A[mid] + " er mindre enn " + x + ", så vi leter til høyre.", "A[mid]<x → gå høyre.", "low ← mid+1."), "Gå høyre");
        low = mid + 1;
      } else {
        snap(11, { compare: [mid] }, { low: low, mid: mid, high: high },
          t(A[mid] + " er større enn " + x + ", så vi leter til venstre.", "A[mid]>x → gå venstre.", "high ← mid−1."), "Gå venstre");
        high = mid - 1;
      }
    }
    if (found < 0) snap(4, {}, {}, t("Nå er low større enn high, så det er ingen plasser igjen å lete i.", "low &gt; high → intervallet er tomt.", "low = " + low + " &gt; high = " + high + ": løkka stopper."), "Tomt");
    if (found < 0) snap(12, {}, {}, t("Vi lette ferdig uten å finne " + x + ".", "Ikke funnet → −1.", "return −1."), "Ikke funnet");
    return steps;
  };

  /* ===================== HEAPINSERT (min-heap, H2023) ===================== */
  /* Kun pseudokode + forklaringer + Parsons (tre-demo kommer i 03-heap). */
  IN.algos.heapInsert = {
    title: "HeapInsert – sett inn i heap (boble opp)",
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
        teknisk: "Boble opp starter i den nye løvnoden." },
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
        "Boble opp går høyst fra løvnoden til roten, altså høyden – omtrent log n. Best O(1) hvis x allerede er ≥ forelderen.",
        "Et komplett tre har høyde ⌊log n⌋, så det blir O(log n) bytter i verste tilfelle, og O(1) ekstra minne."
      )
    }
  };

  /* ===================== MERGE SORT ===================== */
  IN.algos.mergeSort = {
    title: "Merge sort",
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
        teknisk: "Samme problem, halvparten så stort." },
      { code: "MergeSort(A, mid + 1, hi)", indent: 2,
        eli5: "Så sorterer vi høyre halvdel.",
        normal: "Sorter høyre halvdel rekursivt.",
        teknisk: "Samme problem, halvparten så stort." },
      { code: "Merge(A, lo, mid, hi)", indent: 2,
        eli5: "Til slutt fletter vi de to sorterte halvdelene sammen til én sortert bunke.",
        normal: "Flett de to sorterte halvdelene (O(n)).",
        teknisk: "Fletting er det lineære arbeidet per nivå." }
    ],
    bigO: {
      best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)", stable: true, inplace: false,
      why: t(
        "Vi deler i to helt til hver bunke har ett kort. Det blir ikke mange delinger: selv 1000 kort trenger bare omtrent 10 runder. I hver runde ser vi på hvert kort én gang når vi fletter. Det er like mye jobb uansett hvordan kortene lå fra før.",
        "log n nivåer med splitting, O(n) flettearbeid per nivå → O(n log n) alltid. Trenger et hjelpearray på O(n), så ikke in-place. Stabil.",
        "Vi halverer til bitene har ett element, så det blir log n nivåer. På hvert nivå flettes alle n elementene én gang, O(n) per nivå, til sammen O(n log n). Delingen bryr seg ikke om input, så best = snitt = verst. Fletteregelen «ta fra venstre ved likhet» (≤) bevarer stabiliteten. Prisen er et hjelpearray, en ekstra datastruktur, så merge er ikke in-place."
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
        teknisk: "L og R er en ekstra datastruktur – det er derfor merge ikke er in-place." },
      { code: "i ← 0;  j ← 0;  k ← lo", indent: 1,
        eli5: "Vi peker på toppen av hver bunke (i og j) og på plassen vi skal fylle (k).",
        normal: "i/j leser L/R; k skriver tilbake i A.",
        teknisk: "Tre pekere; k vandrer fra lo til hi." },
      { code: "while i < |L| and j < |R| do", indent: 1,
        eli5: "Så lenge begge bunkene har kort igjen …",
        normal: "Flett til én av halvdelene er tom.",
        teknisk: "Hver iterasjon skriver ett element → O(n)." },
      { code: "if L[i] ≤ R[j] then", indent: 2,
        eli5: "Det minste øverste kortet legges ned først. Ved likt tar vi fra venstre (det holder orden).",
        normal: "Ta det minste av de to forreste; ≤ tar fra venstre ved likhet og bevarer stabiliteten.",
        teknisk: "≤ (ikke &lt;) gjør flettingen stabil." },
      { code: "A[k] ← L[i];  i ← i + 1", indent: 3,
        eli5: "Kortet fra venstre bunke legges ned.",
        normal: "Skriv L[i] til A og gå videre i L.",
        teknisk: "Ett element skrives tilbake; i flyttes." },
      { code: "else", indent: 2,
        eli5: "Ellers legger vi ned det øverste høyre-kortet.",
        normal: "Høyre front er strengt mindre.",
        teknisk: "Symmetrisk gren." },
      { code: "A[k] ← R[j];  j ← j + 1", indent: 3,
        eli5: "Kortet fra høyre bunke legges ned.",
        normal: "Skriv R[j] til A og gå videre i R.",
        teknisk: "Ett element skrives tilbake; j flyttes." },
      { code: "k ← k + 1", indent: 2,
        eli5: "Vi går videre til neste plass i arrayet, der neste kort skal legges ned.",
        normal: "Neste skriveplass i A.",
        teknisk: "k øker med én per iterasjon." },
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
        "Hver sammenligning skriver nøyaktig ett element tilbake til A, så fletting av n elementer koster O(n) tid. ≤-regelen (ta fra venstre ved likhet) er det som gjør det stabilt. Hjelpearrayene L og R gjør at merge ikke er in-place."
      )
    }
  };
  /* Tracer for MergeSort + Merge. Linjekoder for IN.pseudoGroup([MergeSort, Merge]):
     MergeSort-linje n → n; Merge-linje n → 6000 + 100 + n (Merge kalt fra linje 6 i MergeSort).
     L og R vises som egne rader under arrayet, så hver verdi alltid synes et sted:
     plassene i A[lo..hi] som ennå ikke er skrevet, er stiplet («ledig, kopiert til L/R»).
     Ferdig flettede delstykker er skravert (delsortert), ikke grønne – grønt kommer først til slutt. */
  IN.gen.mergeSort = function (arr) {
    var A = clone(arr), n = A.length, steps = [], runs = [];
    function M(line) { return 6100 + line; }
    function runIdx(skipLo, skipHi) {
      var out = [];
      runs.forEach(function (r) { for (var z = r[0]; z <= r[1]; z++) if (z < skipLo || z > skipHi) out.push(z); });
      return out;
    }
    function snap(line, marks, ptrs, text, tag, extra) {
      var s = { line: line, array: clone(A), marks: marks, ptrs: ptrs, ptrCls: { k: "target" }, text: text, tag: tag,
        vars: [ix("lo"), ix("hi"), ix("mid")] };
      for (var key in extra) s[key] = extra[key];
      steps.push(s);
    }
    function cells(X, used, cur, curCls, ptrName) {
      return X.map(function (v, z) {
        return { v: v, cls: z === cur ? curCls : (z < used ? "used" : null), ptr: z === used ? ptrName : "" };
      });
    }
    function rows(L, R, i, j, cmpOn, took) {
      // took: { side: "L"|"R", idx } – elementet som nettopp ble skrevet til A[k]
      var lc = cells(L, i, cmpOn ? i : (took && took.side === "L" ? took.idx : -1), cmpOn ? "compare" : "target", "i");
      var rc = cells(R, j, cmpOn ? j : (took && took.side === "R" ? took.idx : -1), cmpOn ? "compare" : "target", "j");
      return [
        { label: "L", cells: lc, note: i >= L.length ? "i = |L| = " + L.length + ": tom" : "" },
        { label: "R", cells: rc, note: j >= R.length ? "j = |R| = " + R.length + ": tom" : "" }
      ];
    }
    function callName(lo, hi) { return "MergeSort(A, " + lo + ", " + hi + ")"; }

    snap(null, {}, {},
      t("Her er tallene vi skal sortere: " + A.join(", ") + ". Vi deler i to igjen og igjen, og fletter så bitene sammen.",
        "Input: [" + A.join(", ") + "], n = " + n + ". Vi kaller MergeSort(A, 0, " + (n - 1) + ").",
        "Input A = [" + A.join(", ") + "]. Kall MergeSort(A, 0, n − 1) = MergeSort(A, 0, " + (n - 1) + ")."), "Start");

    function merge(lo, mid, hi) {
      var L = A.slice(lo, mid + 1), R = A.slice(mid + 1, hi + 1), i = 0, j = 0, k = lo;
      // Merge-rammen: i og j peker inn i radene L og R, k inn i A. Første steg dekker linje 2 og 3.
      function vars() { return [ix("lo", lo), ix("mid", mid), ix("hi", hi), ix("i", i, "L"), ix("j", j, "R"), ix("k", k)]; }
      var outside = function () { return runIdx(lo, hi); };
      function aMarks(extra) {
        var m = { part: outside().concat(range(lo, k - 1)), stale: range(k, hi) };
        for (var key in extra) m[key] = extra[key];
        return m;
      }
      snap(M(2), aMarks({}), { lo: lo, hi: hi, k: k },
        t("Vi kopierer de to sorterte halvdelene over i to små bunker: L = " + L.join(", ") + " og R = " + R.join(", ") + ". Plassene " + lo + " til " + hi + " i arrayet er nå ledige (stiplet), og vi fyller dem på nytt fra venstre.",
          "L ← A[" + lo + ".." + mid + "] = [" + L.join(", ") + "], R ← A[" + (mid + 1) + ".." + hi + "] = [" + R.join(", ") + "]. Så i ← 0, j ← 0, k ← " + lo + " (linje 3).",
          "Kopier til hjelpearrayene L og R (det er derfor merge ikke er in-place). i = j = 0, k = lo = " + lo + " (linje 3)."), "Kopier til L og R",
        { frame: "Merge", vars: vars(), rows: rows(L, R, i, j, false, null) });
      while (i < L.length && j < R.length) {
        var fromL = L[i] <= R[j];
        snap(M(5), aMarks({}), { lo: lo, hi: hi, k: k },
          t("Begge bunkene har kort igjen. Vi ser på de to øverste: " + L[i] + " fra L og " + R[j] + " fra R. " +
              (fromL ? L[i] + " er minst" + (L[i] === R[j] ? " (like store – da tar vi fra venstre)" : "") + ", så det tas fra L." : R[j] + " er minst, så det tas fra R."),
            "i &lt; |L| og j &lt; |R| (linje 4). L[" + i + "] = " + L[i] + " ≤ R[" + j + "] = " + R[j] + "? " + (fromL ? "Ja: ta fra L." : "Nei: ta fra R (else)."),
            "Testen L[i] ≤ R[j] er " + (fromL ? "sann" : "usann") + " (" + L[i] + (fromL ? " ≤ " : " &gt; ") + R[j] + ")." + (L[i] === R[j] ? " Ved likhet tar ≤ fra L – det bevarer stabiliteten." : "")),
          "Sammenlign", { frame: "Merge", vars: vars(), rows: rows(L, R, i, j, true, null) });
        var v = fromL ? L[i] : R[j], took = fromL ? { side: "L", idx: i } : { side: "R", idx: j };
        A[k] = v;
        if (fromL) i++; else j++;
        snap(M(fromL ? 6 : 8), aMarks({ target: k, stale: range(k + 1, hi) }), { lo: lo, hi: hi, k: k },
          t(v + " legges på plass " + k + " i arrayet. Så går vi videre til neste plass.",
            "A[" + k + "] ← " + (fromL ? "L[" + (i - 1) + "]" : "R[" + (j - 1) + "]") + " = " + v + "; " + (fromL ? "i ← " + i : "j ← " + j) + ". Deretter k ← " + (k + 1) + " (linje 9).",
            "A[" + k + "] ← " + v + "; " + (fromL ? "i" : "j") + " og k øker med 1 (linje 9). A[" + lo + ".." + k + "] er nå de " + (k - lo + 1) + " minste av L og R, i sortert rekkefølge."),
          "Skriv minste", { frame: "Merge", vars: vars(), rows: rows(L, R, i, j, false, took) });
        k++;
      }
      var lEmpty = i >= L.length;
      snap(M(4), aMarks({}), { lo: lo, hi: hi, k: k },
        t((lEmpty ? "L" : "R") + " er tom. Da kan vi ikke sammenligne mer, så resten av " + (lEmpty ? "R" : "L") + " legges rett inn – de er alt sortert og større enn alt vi har skrevet.",
          "while-testen er usann: " + (lEmpty ? "i = |L| = " + L.length : "j = |R| = " + R.length) + ". Resten av " + (lEmpty ? "R" : "L") + " kopieres inn (linje 10).",
          "Løkka terminerer fordi " + (lEmpty ? "i = |L|" : "j = |R|") + ". Elementene igjen i " + (lEmpty ? "R" : "L") + " er ≥ alt som er skrevet."), "Én bunke tom",
        { frame: "Merge", vars: vars(), rows: rows(L, R, i, j, false, null) });
      while (i < L.length || j < R.length) {
        var restL = i < L.length, val = restL ? L[i] : R[j], tk = restL ? { side: "L", idx: i } : { side: "R", idx: j };
        A[k] = val; if (restL) i++; else j++;
        snap(M(10), aMarks({ target: k, stale: range(k + 1, hi) }), { lo: lo, hi: hi, k: k },
          t("Resten av " + (restL ? "L" : "R") + ": " + val + " legges på plass " + k + ".",
            "A[" + k + "] ← " + (restL ? "L" : "R") + "[" + (restL ? i - 1 : j - 1) + "] = " + val + " (rest).",
            "Rest-kopiering: A[" + k + "] ← " + val + "."), "Kopier rest", { frame: "Merge", vars: vars(), rows: rows(L, R, i, j, false, tk) });
        k++;
      }
      runs = runs.filter(function (r) { return r[1] < lo || r[0] > hi; });
      runs.push([lo, hi]);
      var last = lo === 0 && hi === n - 1;
      snap(6, last ? { sorted: range(0, n - 1) } : { part: runIdx(-1, -1) }, { lo: lo, hi: hi },
        t(last ? "Den siste flettingen er ferdig. Nå er hele arrayet sortert: " + A.join(", ") + "."
               : "Stykket fra plass " + lo + " til " + hi + " er nå sortert seg imellom (skravert): " + A.slice(lo, hi + 1).join(", ") + ". Det er ikke ferdig ennå – det skal flettes med naboen sin senere.",
          last ? "Merge(A, 0, " + mid + ", " + (n - 1) + ") er ferdig: A er sortert."
               : "Merge ferdig: A[" + lo + ".." + hi + "] = [" + A.slice(lo, hi + 1).join(", ") + "] er sortert seg imellom. " + callName(lo, hi) + " returnerer.",
          last ? "Øverste Merge returnerer; A[0..n − 1] er sortert."
               : callName(lo, hi) + " returnerer med A[" + lo + ".." + hi + "] sortert (delsortert – ikke nødvendigvis endelig plass)."),
        last ? "Ferdig" : "Delsortert", { frame: "MergeSort", vars: [ix("lo", lo), ix("hi", hi), ix("mid", mid)] });
    }
    function sort(lo, hi, from) {
      function vars(mid) { return [ix("lo", lo), ix("hi", hi), ix("mid", mid)]; }
      var fromTxt = from === 4 ? " (kalt fra linje 4: venstre halvdel)" : from === 5 ? " (kalt fra linje 5: høyre halvdel)" : "";
      if (lo >= hi) {
        runs.push([lo, lo]);
        snap(2, { part: runIdx(-1, -1) }, { lo: lo, hi: hi },
          t("Bunken på plass " + lo + " har bare ett kort (" + A[lo] + "). Ett kort er alltid sortert, så her er det ingenting å gjøre.",
            callName(lo, hi) + fromTxt + ": lo &lt; hi er usann (lo = hi = " + lo + "). Basistilfellet: ett element er sortert.",
            "Basis: lo = hi = " + lo + ", intervallet har ett element. Kallet returnerer uten arbeid."), "Basis", { frame: "MergeSort", vars: vars() });
        return;
      }
      snap(2, { part: runIdx(-1, -1) }, { lo: lo, hi: hi },
        t("Nå skal vi sortere plass " + lo + " til " + hi + " (" + (hi - lo + 1) + " tall). Det er mer enn ett, så vi må dele.",
          callName(lo, hi) + fromTxt + ": lo &lt; hi (" + lo + " &lt; " + hi + "), så vi deler.",
          callName(lo, hi) + fromTxt + ": " + (hi - lo + 1) + " elementer, lo &lt; hi er sann."), "Kall", { frame: "MergeSort", vars: vars() });
      var mid = Math.floor((lo + hi) / 2);
      snap(3, { part: runIdx(-1, -1) }, { lo: lo, mid: mid, hi: hi },
        t("Vi deler på midten: venstre del er plass " + lo + " til " + mid + ", høyre del er plass " + (mid + 1) + " til " + hi + ".",
          "mid ← ⌊(" + lo + " + " + hi + ") / 2⌋ = " + mid + ". Venstre A[" + lo + ".." + mid + "], høyre A[" + (mid + 1) + ".." + hi + "].",
          "mid = " + mid + "; halvdelene har " + (mid - lo + 1) + " og " + (hi - mid) + " elementer."), "Del", { frame: "MergeSort", vars: vars(mid) });
      sort(lo, mid, 4); sort(mid + 1, hi, 5); merge(lo, mid, hi);
    }
    sort(0, n - 1, 0);
    // Med n ≥ 2 er siste fletting selve sluttsteget (grønt, med svaret). Med ett element trengs et eget.
    if (n < 2) steps.push({ line: null, array: clone(A), marks: { sorted: range(0, n - 1) }, ptrs: {}, vars: [ix("lo"), ix("hi"), ix("mid")],
      text: t("Ferdig! Ett tall er allerede sortert: " + A.join(", ") + ".", "Sortert: [" + A.join(", ") + "].", "Terminert uten fletting: basistilfellet."), tag: "Ferdig" });
    return steps;
  };

  /* ===================== QUICKSORT (kursets versjon) =====================
     Følger forelesningen (09 · litt mer sortering): Partition med ChoosePivot,
     pivot parkert på high, og to pekere left/right som går mot hverandre. */
  IN.algos.quickSort = {
    title: "Quicksort",
    name: "Quicksort", params: "A, low, high",
    input: "Et array A og indeksene low og high (hele arrayet: low = 0, high = n − 1)",
    output: "A[low..high] er sortert",
    lines: [
      { code: "if low ≥ high then", indent: 1,
        eli5: "Er stykket vi skal sortere tomt, eller bare ett tall? Da er det allerede sortert.",
        normal: "Basistilfelle: 0 eller 1 element er alltid sortert.",
        teknisk: "Basistilfellet: intervallet har høyst ett element." },
      { code: "return A", indent: 2,
        eli5: "Da er vi ferdige med dette stykket.",
        normal: "Ingenting å gjøre – returner.",
        teknisk: "Avslutt rekursjonen her." },
      { code: "p ← Partition(A, low, high)", indent: 1,
        eli5: "Vi velger et «pivot»-tall og flytter alle mindre til venstre og større til høyre. p er der pivoten havner.",
        normal: "Partisjonér rundt en pivot; p er pivotens endelige plass.",
        teknisk: "Partition er O(n) og setter pivoten på sin endelige plass p." },
      { code: "Quicksort(A, low, p − 1)", indent: 1,
        eli5: "Så sorterer vi venstre side – de mindre tallene.",
        normal: "Sorter venstre del rekursivt.",
        teknisk: "Venstre del har p − low elementer." },
      { code: "Quicksort(A, p + 1, high)", indent: 1,
        eli5: "Og høyre side – de større tallene.",
        normal: "Sorter høyre del rekursivt.",
        teknisk: "Høyre del har high − p elementer; pivoten på p er ferdig." },
      { code: "return A", indent: 1,
        eli5: "Nå er hele stykket sortert.",
        normal: "Returner det sorterte arrayet.",
        teknisk: "A[low..high] er sortert." }
    ],
    bigO: {
      best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)", stable: false, inplace: true,
      why: t(
        "Går det bra, deler pivoten stykket omtrent i to hver gang – få etasjer. Men hvis pivoten alltid er minst eller størst (f.eks. når vi tar siste tall og alt er sortert fra før), deler den dårlig, og det blir n etasjer.",
        "Snitt O(n log n) med balanserte partisjoner. Verst O(n²) når pivoten stadig er minst eller størst – derfor velger ChoosePivot tilfeldig eller median-av-tre. In-place. Ikke stabil.",
        "Partition deler i to biter av størrelse k og n − 1 − k, og hvert nivå koster O(n). Treffer pivoten noenlunde midt på, får vi omtrent like halvdeler og O(n log n). Blir pivoten stadig minste eller største element (f.eks. siste element som pivot på sortert input), krymper biten bare med 1 hver gang, summen blir (n − 1) + (n − 2) + … = O(n²), og rekursjonen blir n dyp. Tilfeldig pivot eller median-av-tre gjør det svært usannsynlig. Quicksort er ikke stabil, fordi Partition bytter elementer over lange avstander."
      )
    }
  };
  IN.algos.partition = {
    title: "Partition",
    name: "Partition", params: "A, low, high",
    input: "Et array A og indeksene low og high",
    output: "Mindre elementer til venstre og større til høyre for en indeks; indeksen returneres",
    lines: [
      { code: "p ← ChoosePivot(A, low, high)", indent: 1,
        eli5: "Vi velger hvilket tall som skal være «målestokken» (pivot).",
        normal: "Velg en pivot. Kurset anbefaler tilfeldig valg eller median-av-tre.",
        teknisk: "Pivotvalget avgjør om vi treffer verste tilfelle. Første/siste element gir O(n²) på sortert input." },
      { code: "swap A[p] and A[high]", indent: 1,
        eli5: "Vi parkerer pivoten helt bakerst, så den ikke er i veien.",
        normal: "Flytt pivoten til siste plass i intervallet.",
        teknisk: "Pivoten parkeres på high mens resten partisjoneres." },
      { code: "pivot ← A[high]", indent: 1,
        eli5: "Vi husker hvilket tall pivoten er.",
        normal: "Ta vare på pivotverdien.",
        teknisk: "Pivotverdien vi sammenligner mot." },
      { code: "left ← low", indent: 1,
        eli5: "«left» starter helt til venstre og leter etter tall som er for store.",
        normal: "left leter fra venstre etter et element > pivot.",
        teknisk: "Alt til venstre for left er ≤ pivot (invariant)." },
      { code: "right ← high − 1", indent: 1,
        eli5: "«right» starter rett før pivoten og leter etter tall som er for små.",
        normal: "right leter fra høyre etter et element < pivot.",
        teknisk: "Alt til høyre for right (fram til high) er ≥ pivot (invariant)." },
      { code: "while left ≤ right do", indent: 1,
        eli5: "Vi fortsetter så lenge pekerne ikke har gått forbi hverandre.",
        normal: "Gjenta til pekerne krysser.",
        teknisk: "Hver runde flytter pekerne mot hverandre – til sammen O(n) steg." },
      { code: "while left ≤ right and A[left] ≤ pivot do", indent: 2,
        eli5: "Så lenge tallet ved left er lite nok, står det riktig – gå videre.",
        normal: "Hopp over elementer som alt hører til venstre.",
        teknisk: "left stopper på første element > pivot." },
      { code: "left ← left + 1", indent: 3,
        eli5: "«left» tar ett skritt til høyre og ser på neste tall.",
        normal: "Flytt left mot høyre.",
        teknisk: "left ← left + 1." },
      { code: "while right ≥ left and A[right] ≥ pivot do", indent: 2,
        eli5: "Så lenge tallet ved right er stort nok, står det riktig – gå videre mot venstre.",
        normal: "Hopp over elementer som alt hører til høyre.",
        teknisk: "right stopper på første element < pivot." },
      { code: "right ← right − 1", indent: 3,
        eli5: "«right» tar ett skritt til venstre og ser på neste tall.",
        normal: "Flytt right mot venstre.",
        teknisk: "right ← right − 1." },
      { code: "if left < right then", indent: 2,
        eli5: "Har begge pekerne stoppet på et tall som står på feil side?",
        normal: "Står begge feil (og har ikke krysset)?",
        teknisk: "Da er A[left] > pivot og A[right] < pivot." },
      { code: "swap A[left] and A[right]", indent: 3,
        eli5: "Da bytter de plass – nå står begge riktig.",
        normal: "Bytt dem, så begge havner på riktig side.",
        teknisk: "Ett bytte retter opp to feilplasserte elementer." },
      { code: "swap A[left] and A[high]", indent: 1,
        eli5: "Til slutt flytter vi pivoten inn der pekerne møttes – nå står den helt riktig.",
        normal: "Sett pivoten mellom de to delene.",
        teknisk: "Pivoten til sin endelige plass left." },
      { code: "return left", indent: 1,
        eli5: "Vi forteller hvor pivoten havnet.",
        normal: "Returner pivotens plass.",
        teknisk: "p = left." }
    ],
    bigO: {
      best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)", stable: false, inplace: true,
      why: t(
        "De to pekerne går mot hverandre og møtes – hvert tall blir sett på omtrent én gang.",
        "left og right går til sammen gjennom intervallet én gang, med O(1) arbeid per steg → O(n). In-place.",
        "left går bare mot høyre og right bare mot venstre, og de stopper når de krysser, så de besøker til sammen hvert element i A[low..high − 1] omtrent én gang: O(n). Alt skjer i selve arrayet. Partition er ikke stabil: et bytte over lang avstand kan hoppe et element forbi et likt element."
      )
    }
  };
  IN.gen.quickSort = function (arr) {
    /* Linjekoder for IN.pseudoGroup([Quicksort, Partition]): Quicksort-linje n → n;
       Partition-linje n → 4000 + 100 + n (Partition kalt fra linje 4 i Quicksort). */
    var A = clone(arr), n = A.length, steps = [], done = [];
    /* Variabellinja: fv = { frame, vars }. Quicksort-rammen: low, high, p (p settes først når
       Partition returnerer). Partition-rammen har sin egen p (pivotens indeks fra ChoosePivot),
       pivot (verdien), left og right. */
    var cur = { frame: null, vars: [ix("low"), ix("high"), ix("p")] };
    function push(code, marks, ptrs, text, tag) {
      marks = marks || {};
      marks.sorted = (marks.sorted || []).concat(done);
      steps.push({ line: code, array: clone(A), marks: marks, ptrs: ptrs || {}, text: text, tag: tag, frame: cur.frame, vars: cur.vars });
    }
    function qsFrame(low, high) { cur = { frame: "Quicksort", vars: [ix("low", low), ix("high", high), ix("p")] }; }
    function partFrame(low, high, p, pivot, left, right) {
      cur = { frame: "Partition", vars: [ix("low", low), ix("high", high), ix("p", p), vv("pivot", pivot), ix("left", left), ix("right", right)] };
    }
    function snap(line, marks, ptrs, text, tag) { push(line == null ? null : 4100 + line, marks, ptrs, text, tag); }
    function swap(a, b) { var tmp = A[a]; A[a] = A[b]; A[b] = tmp; }
    function lr(l, r) { var p = {}; if (l >= 0 && l < n) p.left = l; if (r >= 0 && r < n) p.right = r; return p; }
    push(null, {}, {},
      t("Her er tallene vi skal sortere: " + A.join(", ") + ". Vi kaller Quicksort på hele arrayet.",
        "Input: [" + A.join(", ") + "]. Kall Quicksort(A, 0, " + (n - 1) + ").",
        "Input A = [" + A.join(", ") + "], low = 0, high = n − 1 = " + (n - 1) + "."), "Start");
    function qs(low, high) {
      qsFrame(low, high);
      if (low >= high) {
        var bp = {}; if (low < n) bp.low = low; if (high >= 0) bp.high = high;
        if (low === high) done.push(low);
        push(3, {}, bp,
          low === high
            ? t("Stykket har bare ett tall (" + A[low] + ") – det er allerede sortert, og det står på endelig plass.",
                "Quicksort(A, " + low + ", " + high + "): low ≥ high (ett element) – basistilfelle, return.",
                "low = high = " + low + ": basistilfellet. Elementet står på endelig plass.")
            : t("Stykket fra plass " + low + " til " + high + " er tomt. Her er det ingenting å gjøre.",
                "Quicksort(A, " + low + ", " + high + "): low &gt; high, tomt område – basistilfelle, return.",
                "low = " + low + " &gt; high = " + high + ": tomt intervall (pivoten havnet i kanten). Basistilfellet fanger det med ≥."),
          low === high ? "Basistilfelle" : "Tomt stykke");
        return;
      }
      push(2, {}, { low: low, high: high },
        t("Nå sorterer vi stykket fra plass " + low + " til " + high + ". Det har mer enn ett tall, så vi må partisjonere.",
          "Quicksort(A, " + low + ", " + high + "): low ≥ high er usann, så vi kaller Partition.",
          "Kall på A[" + low + ".." + high + "] (" + (high - low + 1) + " elementer)."), "Kall");
      partFrame(low, high, high);
      snap(2, { min: high }, { low: low, high: high },
        t("Vi velger pivot. Her tar vi bare det siste tallet (" + A[high] + "), så du kan se hva som skjer i verste fall. Kurset anbefaler å velge tilfeldig eller median-av-tre.",
          "ChoosePivot: demoen bruker siste element, A[" + high + "] = " + A[high] + ". (Kurset: tilfeldig eller median-av-tre.)",
          "p ← " + high + " (siste element; gir O(n²) på sortert input)."), "Velg pivot");
      snap(3, { min: high }, { low: low, high: high },
        t("Pivoten ligger allerede bakerst, så byttet gjør ingenting her.",
          "p = high, så byttet med A[high] endrer ingenting.",
          "swap A[" + high + "], A[" + high + "] – bytter med seg selv (ingen endring)."), "Pivot til high");
      var pivot = A[high], left = low, right = high - 1;
      partFrame(low, high, high, pivot, left, right);
      snap(6, { min: high }, lr(left, right),
        t("«left» starter på " + left + ", «right» rett før pivoten, på " + right + ". Pivoten er " + pivot + ".",
          "pivot = " + pivot + "; left ← " + left + ", right ← " + right + ".",
          "left=" + left + ", right=" + right + ", pivot=" + pivot + "."), "Pekere");
      function pf() { partFrame(low, high, high, pivot, left, right); }
      while (left <= right) {
        while (left <= right && A[left] <= pivot) {
          pf();
          snap(9, { min: high, compare: [left] }, lr(left, right),
            t(A[left] + " er ikke større enn pivoten " + pivot + ", så det står riktig. left går ett skritt videre.",
              "A[" + left + "] = " + A[left] + " ≤ " + pivot + " → left ← " + (left + 1) + ".",
              "A[left]≤pivot → left++."), "left →");
          left++;
        }
        pf();
        if (left <= right) snap(8, { min: high, compare: [left] }, lr(left, right),
          t(A[left] + " er større enn pivoten – det hører til høyre. left stopper her.",
            "A[" + left + "] = " + A[left] + " > " + pivot + ": left stopper.",
            "left stopper på " + left + "."), "left stopper");
        while (right >= left && A[right] >= pivot) {
          pf();
          snap(11, { min: high, compare: [right] }, lr(left, right),
            t(A[right] + " er ikke mindre enn pivoten " + pivot + ", så det står riktig. right går ett skritt mot venstre.",
              "A[" + right + "] = " + A[right] + " ≥ " + pivot + " → right ← " + (right - 1) + ".",
              "A[right]≥pivot → right−−."), "← right");
          right--;
        }
        pf();
        if (right >= left) snap(10, { min: high, compare: [right] }, lr(left, right),
          t(A[right] + " er mindre enn pivoten – det hører til venstre. right stopper her.",
            "A[" + right + "] = " + A[right] + " < " + pivot + ": right stopper.",
            "right stopper på " + right + "."), "right stopper");
        if (left < right) {
          swap(left, right);
          snap(13, { min: high, swap: [left, right] }, lr(left, right),
            t("Begge står på feil side – de bytter plass. Nå står begge riktig.",
              "Bytt A[" + left + "] og A[" + right + "].",
              "swap A[" + left + "], A[" + right + "]."), "Bytt");
        } else {
          snap(12, { min: high }, lr(left, right),
            t("Pekerne har gått forbi hverandre: alt til venstre for left er lite, alt fra left og utover er stort.",
              "left > right: pekerne har krysset – ingen bytte.",
              "left=" + left + " > right=" + right + "; løkka avsluttes."), "Krysset");
        }
      }
      snap(7, { min: high }, lr(left, right),
        t("Letingen er over. Nå skal pivoten inn på plass " + left + ", der left står.",
          "while left ≤ right: " + left + " ≤ " + right + " er usann, så den ytre løkka er ferdig.",
          "Løkkevilkåret left ≤ right er usant (left = " + left + ", right = " + right + "). Invariant: A[low..left−1] ≤ pivot og A[right+1..high−1] ≥ pivot."), "Løkka ferdig");
      swap(left, high);
      done.push(left);
      pf();
      snap(14, { swap: [left, high] }, { left: left },
        t("Pivoten " + pivot + " flyttes inn på plass " + left + " – nå står den helt riktig (grønn). Partition forteller at pivoten havnet på plass " + left + ".",
          "Pivot til plass " + left + "; den er ferdig. Partition returnerer " + left + " (linje 15), så p = " + left + ".",
          "swap A[" + left + "], A[" + high + "]; return left gir p = " + left + ". Så Quicksort(A, " + low + ", " + (left - 1) + ") og Quicksort(A, " + (left + 1) + ", " + high + ")."), "Pivot plassert");
      qs(low, left - 1); qs(left + 1, high);
    }
    qs(0, n - 1);
    cur = { frame: null, vars: [ix("low"), ix("high"), ix("p")] };
    steps.push({ line: null, array: clone(A), marks: { sorted: range(0, n - 1) }, ptrs: {}, vars: cur.vars,
      text: t("Ferdig! Tallene står i rekkefølge: " + A.join(", ") + ".", "Sortert: [" + A.join(", ") + "].", "Terminert: [" + A.join(", ") + "]."), tag: "Ferdig" });
    return steps;
  };

  /* ===================== BØTTESORTERING + RADIX =====================
     Kursets versjon (09 · litt mer sortering): nøkler 0..N − 1, legg hvert
     element bakerst i sin bøtte, samle bøttene i rekkefølge. Ingen
     sammenligninger, ingen sortering inne i bøttene. Radix = stabil
     bøttesortering per siffer, minst betydningsfulle siffer først. */
  IN.algos.bucketSort = {
    title: "BucketSort",
    name: "BucketSort", params: "A, N",
    input: "Et array A med n elementer, der hver nøkkel er et heltall fra 0 til N − 1",
    output: "A er sortert (stabilt)",
    lines: [
      { code: "B ← array of N empty lists", indent: 1,
        eli5: "Vi setter fram én tom bøtte for hver mulige verdi – bøtte 0, bøtte 1, og så videre.",
        normal: "Lag N tomme lister, én per mulig nøkkel.",
        teknisk: "O(N) for å opprette bøttene." },
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Så går vi gjennom tallene ett for ett.",
        normal: "Fordelingsfasen: gå gjennom A fra venstre.",
        teknisk: "n iterasjoner, O(1) hver." },
      { code: "append A[i] to B[A[i]]", indent: 2,
        eli5: "Hvert tall legges bakerst i bøtta med sitt eget nummer.",
        normal: "Legg elementet bakerst i bøtta til nøkkelen sin. (Er elementene objekter, bruker vi nøkkelen deres som indeks.)",
        teknisk: "Nøkkelen brukes direkte som indeks – ingen sammenligninger. Å legge bakerst er det som gjør algoritmen stabil." },
      { code: "j ← 0", indent: 1,
        eli5: "Nå skal vi helle tallene tilbake. j er plassen vi fyller neste gang.",
        normal: "Samlefasen: j er neste ledige plass i A.",
        teknisk: "Skriveindeks for samlingen." },
      { code: "for k ← 0 to N − 1 do", indent: 1,
        eli5: "Vi tar bøttene i rekkefølge, fra bøtte 0 og oppover.",
        normal: "Gå gjennom bøttene i stigende rekkefølge.",
        teknisk: "N iterasjoner – også de tomme bøttene koster. Derfor O(N)-leddet." },
      { code: "for x in B[k] do", indent: 2,
        eli5: "I hver bøtte tar vi tallene ut forfra, i samme rekkefølge som de kom inn.",
        normal: "Ta ut elementene i bøtta forfra.",
        teknisk: "Til sammen n elementer over alle bøttene." },
      { code: "A[j] ← x", indent: 3,
        eli5: "Tallet legges tilbake i arrayet.",
        normal: "Skriv elementet tilbake i A.",
        teknisk: "O(1)." },
      { code: "j ← j + 1", indent: 3,
        eli5: "Og vi går til neste ledige plass.",
        normal: "Neste ledige plass.",
        teknisk: "j ender på n." },
      { code: "return A", indent: 1,
        eli5: "Nå ligger alle tallene i riktig rekkefølge.",
        normal: "A er sortert.",
        teknisk: "Sortert og stabil." }
    ],
    bigO: {
      best: "O(N + n)", avg: "O(N + n)", worst: "O(N + n)", space: "O(N + n)", stable: true, inplace: false,
      why: t(
        "Hvert tall legges rett i bøtta si én gang, og så går vi gjennom alle bøttene én gang. Vi sammenligner aldri to tall med hverandre.",
        "Fordelingen er O(n) og gjennomgangen av bøttene O(N), så O(N + n) i alle tilfeller. Er N en konstant (f.eks. 10 siffer), blir det O(n). Stabil fordi vi legger bakerst og tar ut forfra. Ikke in-place: bøttene er en ekstra datastruktur.",
        "Fordelingen gjør O(1) arbeid per element: O(n). Samlingen besøker alle N bøttene og flytter hvert element én gang: O(N + n). Ingen sammenligninger, så grensen O(n log n) for sammenligningsbaserte algoritmer gjelder ikke. Bøttene tar O(N + n) plass, så algoritmen er ikke in-place. Den er stabil: to elementer med samme nøkkel havner i samme bøtte i input-rekkefølge og tas ut i samme rekkefølge."
      )
    }
  };
  IN.algos.radixSort = {
    title: "RadixSort",
    name: "RadixSort", params: "A, d",
    input: "Et array A med n tall som alle har d siffer (fyll ut med 0 foran ved behov)",
    output: "A er sortert",
    lines: [
      { code: "for i ← d − 1 downto 0 do", indent: 1,
        eli5: "Vi tar ett siffer om gangen – og vi starter bakerst, med enerplassen.",
        normal: "Sifrene er nummerert fra venstre (0 til d − 1), så vi starter med det bakerste sifferet og jobber oss mot det første.",
        teknisk: "d runder. Minst betydningsfulle siffer først." },
      { code: "A ← BucketSort(A, i)", indent: 2,
        eli5: "Vi bøttesorterer tallene på dette ene sifferet. Tallene som har samme siffer, beholder rekkefølgen de hadde.",
        normal: "Bøttesorter på siffer nummer i, med 10 bøtter (sifrene 0–9). Bøttesorteringen må være stabil. (Her betyr andre argument hvilket siffer som er nøkkel, ikke antall bøtter.)",
        teknisk: "Én stabil BucketSort per siffer: O(N + n), der N er antall mulige sifferverdier (10 i titallsystemet)." },
      { code: "return A", indent: 1,
        eli5: "Etter siste siffer er alt sortert.",
        normal: "A er sortert.",
        teknisk: "Sortert etter alle d siffer." }
    ],
    bigO: {
      best: "O(d·(N + n))", avg: "O(d·(N + n))", worst: "O(d·(N + n))", space: "O(N + n)", stable: true, inplace: false,
      why: t(
        "Vi gjør én bøttesortering per siffer. Har tallene d siffer, blir det d bøttesorteringer.",
        "d runder med bøttesortering à O(N + n) gir O(d·(N + n)). Med tall i titallsystemet er N = 10, og er d også fast, blir det O(n). Stabil og ikke in-place, som bøttesortering.",
        "Hver runde er en stabil BucketSort på ett siffer: O(N + n), der N er antall mulige sifferverdier. Med d runder blir det O(d·(N + n)). Korrektheten hviler på stabiliteten: etter runden for siffer i er tallene sortert på sifrene fra i og bakover, fordi like siffer beholder rekkefølgen fra forrige runde."
      )
    }
  };

  function bucketItems(vals) {
    var count = {}, seen = {};
    vals.forEach(function (v) { count[v] = (count[v] || 0) + 1; });
    return vals.map(function (v) {
      seen[v] = (seen[v] || 0) + 1;
      return { v: v, key: v, tag: count[v] > 1 ? "abcdefghij".charAt(seen[v] - 1) : undefined };
    });
  }
  function copyB(B) { return B.map(function (b) { return b.slice(); }); }
  function itemTxt(it) { return it.v + (it.tag || ""); }

  IN.gen.bucketSort = function (arr) {
    var vals = arr.map(function (v) { return Math.max(0, Math.min(9, Math.round(v))); });
    var A = bucketItems(vals), n = A.length;
    var N = 1; vals.forEach(function (v) { N = Math.max(N, v + 1); });
    var B = [], steps = [], done = [];
    for (var k0 = 0; k0 < N; k0++) B.push([]);
    // Variabellinja: i (fordeling), j, k og x (samling). where sier om indeksen peker i A eller på en bøtte.
    var st = {};
    function snap(line, extra, text, tag) {
      var s = { line: line, A: A.slice(), B: copyB(B), done: done.slice(), text: text, tag: tag,
        vars: [{ name: "i", value: st.i, idx: st.i, where: "A" }, { name: "j", value: st.j, idx: st.j, where: "A" },
               { name: "k", value: st.k, idx: st.k, where: "B" }, vv("x", st.x), vv("n", n), vv("N", N)] };
      for (var key in extra) s[key] = extra[key];
      steps.push(s);
    }
    snap(2, {},
      t("Vi setter fram " + N + " tomme bøtter, nummerert 0 til " + (N - 1) + " – én for hver mulig verdi.",
        "N = " + N + " (nøklene er 0 … " + (N - 1) + "). Lag " + N + " tomme bøtter.",
        "B ← " + N + " tomme lister. O(N)."), "Lag bøtter");
    for (var i = 0; i < n; i++) {
      var it = A[i];
      B[it.key].push(it);
      done.push(i); st.i = i;
      snap(4, { active: { where: "B", k: it.key, i: B[it.key].length - 1 }, bucket: it.key, src: i },
        t("Tallet " + it.v + " legges bakerst i bøtte " + it.key + "." + (it.tag ? " Bokstaven viser hvilken " + it.v + "-er det var først i input." : ""),
          "A[" + i + "] = " + itemTxt(it) + " → bakerst i B[" + it.key + "].",
          "append A[" + i + "] to B[" + it.key + "]."), "Fordel");
    }
    var j = 0, written = [];
    st = { j: 0 };
    snap(5, { hideUnwritten: true, done: [] },
      t("Alle tallene ligger i bøttene. Nå heller vi dem tilbake, bøtte for bøtte.",
        "Fordelingen er ferdig. Samlefasen: j ← 0.",
        "Fordeling O(n) ferdig; samling starter."), "Samle");
    for (var k = 0; k < N; k++) {
      done = range(j, n - 1);
      st.k = k; st.j = j; st.x = undefined;
      if (!B[k].length) {
        snap(6, { bucket: k, written: written.slice(), hideUnwritten: true, done: [] },
          t("Bøtte " + k + " er tom – ingenting å hente, men vi må likevel sjekke den.",
            "B[" + k + "] er tom. (Tomme bøtter koster også – det er N-leddet.)",
            "k = " + k + ": tom bøtte, O(1)."), "Tom bøtte");
        continue;
      }
      while (B[k].length) {
        var x = B[k].shift();
        A[j] = x; written.push(j); done = range(j + 1, n - 1); st.j = j; st.x = itemTxt(x);
        snap(8, { active: { where: "A", i: j }, bucket: k, written: written.slice(), hideUnwritten: true, done: [] },
          t("Vi tar " + x.v + " ut forfra i bøtte " + k + " og legger det på plass " + j + ".",
            "A[" + j + "] ← " + itemTxt(x) + " (forrest i B[" + k + "]).",
            "A[" + j + "] ← " + itemTxt(x) + "; j ← " + (j + 1) + "."), "Samle");
        j++;
      }
    }
    st = { j: j };
    snap(10, { written: range(0, n - 1), done: [] },
      t("Ferdig! Tallene er sortert – og like tall står i samme rekkefølge som før (a før b).",
        "Sortert. Like nøkler har beholdt rekkefølgen sin: stabil.",
        "Terminert. O(N + n), stabil."), "Ferdig");
    return steps;
  };

  IN.gen.radixSort = function (arr) {
    var vals = arr.map(function (v) { return Math.max(0, Math.round(v)); });
    var A = bucketItems(vals), n = A.length, d = 1, steps = [];
    vals.forEach(function (v) { d = Math.max(d, String(v).length); });
    var labels = []; for (var z = 0; z < 10; z++) labels.push(String(z));
    function empty() { var B = []; for (var q = 0; q < 10; q++) B.push([]); return B; }
    function digitOf(v, p) { return Math.floor(v / Math.pow(10, p)) % 10; }
    var names = ["enerplassen", "tierplassen", "hundrerplassen", "tusenplassen"];
    steps.push({ line: null, A: A.slice(), B: empty(), labels: labels, vars: [vv("i"), vv("d", d)], text:
      t("Tallene har opptil " + d + " siffer. Vi sorterer på ett siffer om gangen, bakerst først.",
        "d = " + d + ". Kortere tall fylles ut med 0 foran. Ti bøtter: sifrene 0–9.",
        "d = " + d + ", N = 10."), tag: "Start" });
    for (var i = d - 1; i >= 0; i--) {
      var p = d - 1 - i, B = empty(), done = [];
      var pname = names[p] || ("siffer " + i);
      steps.push({ line: 2, A: A.slice(), B: copyB(B), labels: labels, digit: p, vars: [vv("i", i), vv("d", d)], text:
        t("Nå ser vi bare på " + pname + " (det understrekte sifferet).",
          "i = " + i + ": sorter på " + pname + " (siffer " + i + " fra venstre).",
          "i = " + i + " → siffer " + i + " (" + pname + ")."), tag: "Siffer " + i + " · " + pname });
      for (var a = 0; a < n; a++) {
        var it = A[a], dg = digitOf(it.v, p);
        B[dg].push(it); done.push(a);
        steps.push({ line: 3, A: A.slice(), B: copyB(B), labels: labels, digit: p, done: done.slice(), vars: [vv("i", i), vv("d", d)],
          active: { where: "B", k: dg, i: B[dg].length - 1 }, bucket: dg, src: a, text:
          t(it.v + " har sifferet " + dg + " her, så det legges bakerst i bøtte " + dg + ".",
            itemTxt(it) + ": siffer " + dg + " → bakerst i B[" + dg + "].",
            "append " + itemTxt(it) + " to B[" + dg + "]."), tag: "Fordel" });
      }
      var next = []; B.forEach(function (b) { next = next.concat(b); });
      A = next;
      steps.push({ line: 3, A: A.slice(), B: empty(), labels: labels, digit: p, written: range(0, n - 1), vars: [vv("i", i), vv("d", d)], text:
        t("Vi heller bøttene tilbake, fra 0 til 9. Nå er tallene sortert på " + pname + (p > 0 ? " – og tall med likt siffer her står fortsatt i rekkefølgen fra forrige runde." : "."),
          "Samlet: sortert på siffer " + i + " og bakover. Stabilitet holder på rekkefølgen fra forrige runde der sifferet er likt.",
          "Etter runden: sortert på sifrene " + i + " … " + (d - 1) + "."), tag: "Samle" });
    }
    steps.push({ line: 4, A: A.slice(), B: empty(), labels: labels, written: range(0, n - 1), vars: [vv("i"), vv("d", d)], text:
      t("Ferdig! Etter siste runde, med det første (mest betydningsfulle) sifferet, er alle tallene sortert.",
        "Sortert etter alle " + d + " siffer.",
        "Terminert etter d = " + d + " runder: O(d·(N + n))."), tag: "Ferdig" });
    return steps;
  };

  /* ===================== EKSAMENSLØSNINGER (bøttesortering) =====================
     Pseudokode til løsningsforslagene i Sortering → Bøtte. Ingen steggenerator. */
  IN.algos.etymologySort = {
    title: "EtymologySort (H2024)",
    name: "EtymologySort", params: "A",
    input: "Et array A med n ordobjekter, sortert alfabetisk; færre enn 100 kategorier i en fast rekkefølge",
    output: "A sortert etter kategori, alfabetisk innen hver kategori",
    lines: [
      { code: "B ← ordered map with an empty list as default value", indent: 1,
        eli5: "Én bøtte per kategori, i den faste rekkefølgen kategoriene har.",
        normal: "Bøttene: en ordnet ordbok fra kategori til liste.",
        teknisk: "Høyst N < 100 bøtter – en konstant." },
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Vi går gjennom ordene i alfabetisk rekkefølge.",
        normal: "Fordel ordene.",
        teknisk: "n iterasjoner." },
      { code: "append A[i] to B[A[i].category]", indent: 2,
        eli5: "Hvert ord legges bakerst i bøtta til kategorien sin.",
        normal: "Bakerst i bøtta – da holder ordene i bøtta seg alfabetiske.",
        teknisk: "Å legge bakerst gjør sorteringen stabil." },
      { code: "j ← 0", indent: 1,
        eli5: "Nå heller vi ordene tilbake.",
        normal: "Neste ledige plass i A.",
        teknisk: "Skriveindeks." },
      { code: "for each category c in B, in order do", indent: 1,
        eli5: "Bøttene tas i kategori-rekkefølge.",
        normal: "Gå gjennom kategoriene i rekkefølge.",
        teknisk: "N runder." },
      { code: "for v in B[c] do", indent: 2,
        eli5: "Vi tar ordene ut av bøtta forfra, i samme rekkefølge som vi la dem inn. Da står de fortsatt alfabetisk.",
        normal: "Ta ut ordene i den rekkefølgen de kom inn.",
        teknisk: "Til sammen n ord." },
      { code: "A[j] ← v", indent: 3,
        eli5: "Ordet legges tilbake i arrayet.", normal: "Skriv tilbake.", teknisk: "O(1)." },
      { code: "j ← j + 1", indent: 3,
        eli5: "Vi flytter oss til neste ledige plass i arrayet, så neste ord ikke skriver over dette.", normal: "Neste ledige plass.", teknisk: "j ender på n." },
      { code: "return A", indent: 1,
        eli5: "Ferdig – gruppert etter kategori, alfabetisk i hver gruppe.",
        normal: "Sortert etter kategori, stabilt.",
        teknisk: "O(N + n) = O(n), siden N < 100 er en konstant." }
    ]
  };
  IN.algos.sortSubanagrams = {
    title: "SortSubanagrams (H2020)",
    name: "SortSubanagrams", params: "A",
    input: "Et array A med n ord, sortert alfabetisk",
    output: "A sortert etter lengde, lengst først, alfabetisk innen lik lengde",
    lines: [
      { code: "B ← empty hashmap", indent: 1,
        eli5: "Bøttene: én per ordlengde vi møter.",
        normal: "Et hashmap fra lengde til liste.",
        teknisk: "Bare lengder som faktisk finnes, får en bøtte." },
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Vi går gjennom ordene i alfabetisk rekkefølge.",
        normal: "Fordel ordene.",
        teknisk: "n iterasjoner, O(1) hver." },
      { code: "k ← |A[i]|", indent: 2,
        eli5: "Hvor mange bokstaver har ordet?",
        normal: "Nøkkelen er ordlengden.",
        teknisk: "Lengden som nøkkel." },
      { code: "if k ∉ B then", indent: 2,
        eli5: "Har vi ikke en bøtte for denne lengden ennå?",
        normal: "Ny lengde?",
        teknisk: "Oppslag i hashmap: O(1)." },
      { code: "B[k] ← empty list", indent: 3,
        eli5: "Da setter vi fram en ny, tom bøtte for denne lengden.", normal: "Lag en tom bøtte.", teknisk: "O(1)." },
      { code: "append A[i] to B[k]", indent: 2,
        eli5: "Ordet legges bakerst i bøtta.",
        normal: "Bakerst – da holder bøtta seg alfabetisk.",
        teknisk: "Stabilt." },
      { code: "j ← 0", indent: 1,
        eli5: "Nå heller vi ordene tilbake.", normal: "Neste ledige plass i A.", teknisk: "Skriveindeks." },
      { code: "for each k in B, in decreasing order do", indent: 1,
        eli5: "De lengste ordene først.",
        normal: "Sorter de N ulike lengdene synkende, og gå gjennom dem.",
        teknisk: "Å sortere de N nøklene koster O(N log N)." },
      { code: "for w in B[k] do", indent: 2,
        eli5: "Vi tar ordene ut av bøtta forfra. Siden de ble lagt inn alfabetisk, kommer de ut alfabetisk.", normal: "I den rekkefølgen de kom inn.", teknisk: "Til sammen n ord." },
      { code: "A[j] ← w", indent: 3,
        eli5: "Ordet legges tilbake i arrayet, på neste ledige plass.", normal: "Skriv tilbake.", teknisk: "O(1)." },
      { code: "j ← j + 1", indent: 3,
        eli5: "Vi flytter oss til neste ledige plass, så neste ord ikke skriver over dette.", normal: "Neste ledige plass.", teknisk: "j ender på n." },
      { code: "return A", indent: 1,
        eli5: "Ferdig! De lengste ordene står først, og ord med like mange bokstaver står fortsatt alfabetisk.", normal: "Sortert etter lengde, stabilt.",
        teknisk: "O(N log N + n), der N ≤ n er antall ulike lengder." }
    ]
  };

  /* ===================== GRENSEFORKLARINGER =====================
     «Hvorfor n − 1 og ikke n?» – bare på linjer der grensen er en naturlig
     felle (±1, < vs ≤, start på 0 vs 1). Kobles på via kodeteksten, så
     linjene over kan endres uten at forklaringene havner på feil linje.
     Husk: «to» i pseudokoden tar med sluttverdien, og arrayene er 0-indeksert. */
  function g(q, a) { return { q: q, a: a }; }
  var GRENSER = {
    selectionSort: {
      "for i ← 0 to n − 1 do": g("Hvorfor «to n − 1» og ikke «to n»?",
        "Arrayet har n plasser, men vi teller fra 0, så den siste er A[n − 1]. «to» tar med sluttverdien – «to n» ville gått én plass forbi enden. (Den aller siste runden gjør faktisk ingenting: når alle andre står riktig, må det siste elementet være størst. Man kunne stoppet på n − 2, men det endrer ikke kjøretiden.)"),
      "for j ← i + 1 to n − 1 do": g("Hvorfor starter j på i + 1?",
        "A[i] er kandidaten vi starter med (k ← i), og det er ingen vits å sammenligne den med seg selv. Vi leter bare blant elementene etter den – derfor i + 1. Sluttverdien n − 1 er siste indeks, som i ytre løkke.")
    },
    bubbleSort: {
      "for j ← 0 to n − 2 − i do": g("Hvorfor n − 2 − i og ikke n − 1?",
        "Linja under sammenligner A[j] med naboen A[j+1]. Den siste naboen som finnes er A[n − 1], så j kan høyst være n − 2 – ellers peker j + 1 utenfor arrayet. «− i» kommer av at hver runde bobler det største gjenværende elementet helt bakerst: etter i runder står de i bakerste plassene allerede riktig og trenger ikke sjekkes igjen.")
    },
    insertionSort: {
      "for i ← 1 to n − 1 do": g("Hvorfor starter i på 1 og ikke 0?",
        "Ett element alene er alltid sortert. Vi lar A[0] være den sorterte delen fra start, og setter inn elementene ett for ett fra indeks 1. Å starte på 0 ville bare gitt en tom runde."),
      "while j ≥ 0 and A[j] > key do": g("Hvorfor j ≥ 0, og hvorfor «>» og ikke «≥»?",
        "j ≥ 0 hindrer oss i å lese A[−1] når key er minst av alle og skal helt fram. Streng > betyr at vi stopper ved et likt element i stedet for å skyve forbi det – da beholder like verdier rekkefølgen, og det er det som gjør insertion sort stabil."),
      "A[j+1] ← key": g("Hvorfor j + 1 og ikke j?",
        "Løkka stopper når A[j] ≤ key (eller når j = −1). A[j] er altså et element som skal stå foran key, og hullet vi har laget ved å skyve ligger rett til høyre for det – på plass j + 1.")
    },
    gnomeSort: {
      "while i < n do": g("Hvorfor i < n og ikke i ≤ n?",
        "Siste gyldige indeks er n − 1. Når i blir n, har nissen gått forbi siste element uten å finne noe i feil rekkefølge – da er alt sortert, og vi er ferdige."),
      "if i > 0 and A[i−1] > A[i] then": g("Hvorfor sjekke i > 0 først?",
        "Vi sammenligner med naboen til venstre, A[i − 1]. Står vi på i = 0, finnes ingen slik nabo – A[−1] er utenfor arrayet. Derfor sjekkes i > 0 først; er den usann, ser vi ikke på resten av betingelsen.")
    },
    binarySearch: {
      "high ← n − 1": g("Hvorfor n − 1 og ikke n?",
        "high er den siste indeksen vi fortsatt vurderer, og den må være en gyldig plass i arrayet. Med n elementer og telling fra 0 er siste indeks n − 1."),
      "while low ≤ high do": g("Hvorfor ≤ og ikke <?",
        "Når low = high er det fortsatt ett element igjen å sjekke. Med < ville vi gitt opp før vi så på det, og svart «ikke funnet» selv om x lå akkurat der."),
      "low ← mid + 1": g("Hvorfor mid + 1 og ikke mid?",
        "A[mid] er allerede sjekket – den var for liten – så den skal ikke være med videre. Med low ← mid kan intervallet slutte å krympe (når low og high står rett ved siden av hverandre, blir mid = low), og løkka går evig."),
      "high ← mid − 1": g("Hvorfor mid − 1 og ikke mid?",
        "Samme grunn som for low: A[mid] er sjekket og var for stor, så vi fjerner den fra intervallet. Ellers risikerer vi at intervallet aldri blir tomt.")
    },
    heapInsert: {
      "while i > 0 and A[⌊(i−1)/2⌋] > A[i] do": g("Hvorfor ⌊(i − 1)/2⌋ og ikke ⌊i/2⌋?",
        "Heapen vår er 0-indeksert: roten ligger på plass 0, og barna til node i ligger på 2i + 1 og 2i + 2. Regner vi baklengs fra et barn, blir forelderen ⌊(i − 1)/2⌋. Formelen ⌊i/2⌋ hører til heaper som starter på plass 1 – blander du dem, havner du på feil node. i > 0 stopper oss ved roten, som ikke har noen forelder.")
    },
    mergeSort: {
      "if lo < hi then": g("Hvorfor lo < hi?",
        "Delarrayet A[lo..hi] har hi − lo + 1 elementer. Er lo = hi, er det bare ett element igjen – og det er allerede sortert. Da er vi i basistilfellet og gjør ingenting."),
      "MergeSort(A, mid + 1, hi)": g("Hvorfor mid + 1 og ikke mid?",
        "Venstre halvdel er A[lo..mid], så mid er allerede med der. Høyre halvdel starter derfor på mid + 1 – ellers ville elementet på mid blitt med i begge halvdelene.")
    },
    merge: {
      "while i < |L| and j < |R| do": g("Hvorfor < og ikke ≤?",
        "L har |L| elementer med indeksene 0 til |L| − 1. Når i = |L|, er alle elementene i L brukt opp, og det finnes ingen L[i] å sammenligne med. Det samme gjelder j og R.")
    },
    quickSort: {
      "if low ≥ high then": g("Hvorfor ≥ og ikke bare =?",
        "Er low = high, har stykket ett element. Men stykket kan også være tomt: havner pivoten helt til venstre (p = low), blir det venstre kallet Quicksort(A, low, low − 1), der high er mindre enn low. Begge deler er allerede sortert, og ≥ fanger opp begge."),
      "Quicksort(A, low, p − 1)": g("Hvorfor p − 1 og p + 1, og ikke p?",
        "Etter Partition står pivoten på plass p – akkurat der den skal stå i det ferdige arrayet. Den skal ikke røres igjen, så vi sorterer bare delen til venstre (low..p − 1) og delen til høyre (p + 1..high). Tok vi med p, kunne et kall få like mange elementer som før og aldri bli ferdig.")
    },
    partition: {
      "right ← high − 1": g("Hvorfor high − 1 og ikke high?",
        "Pivoten er parkert på A[high]. Den skal ikke sammenlignes med seg selv, så right starter på plassen rett før. Pivoten flyttes inn på riktig plass helt til slutt."),
      "while left ≤ right do": g("Hvorfor ≤ og ikke <?",
        "Når left = right, er det fortsatt ett element vi ikke har sjekket. Ta A = [1, 3] med pivot 3: da starter left og right begge på 0. Med < ville vi hoppet over løkka, byttet A[0] med pivoten og fått [3, 1] – feil. Med ≤ ser left at 1 ≤ 3 og går videre, og pivoten blir stående riktig."),
      "while left ≤ right and A[left] ≤ pivot do": g("Hvorfor sjekke left ≤ right her også?",
        "Er alle tallene ≤ pivot, ville left ellers fortsatt forbi right, inn på pivoten (som også er ≤ pivot) og ut av stykket. Sjekken stopper left så snart pekerne har krysset."),
      "while right ≥ left and A[right] ≥ pivot do": g("Hvorfor sjekke right ≥ left her også?",
        "Er alle tallene ≥ pivot, ville right ellers gått forbi low og ut av stykket – helt ned til A[−1] hvis low = 0. Sjekken stopper right når den møter left."),
      "if left < right then": g("Hvorfor bare bytte når left < right?",
        "Har pekerne krysset (left > right), står alt allerede riktig: alt før left er ≤ pivot, og alt etter right er ≥ pivot. Et bytte da ville flyttet et stort tall til venstre side og ødelagt det vi har bygget opp."),
      "swap A[left] and A[high]": g("Hvorfor left og ikke right?",
        "Tallet som byttes inn på pivotens gamle plass (helt bakerst) havner på høyre side, så det må være ≥ pivot. A[left] er det første tallet som er større enn pivoten (eller pivoten selv, hvis left kom helt fram til high). A[right] er derimot et tall som er mindre – det hører ikke til bakerst.")
    },
    bucketSort: {
      "append A[i] to B[A[i]]": g("Hvorfor bakerst i bøtta, og ikke forrest?",
        "Elementer med samme nøkkel havner i samme bøtte. Legger vi bakerst og tar ut forfra, kommer de ut i samme rekkefølge som de kom inn – algoritmen er stabil. Legger vi forrest, snus rekkefølgen innen hver bøtte, og stabiliteten ryker. (Det er nettopp stabiliteten radix sort trenger.)"),
      "for k ← 0 to N − 1 do": g("Hvorfor N − 1 og ikke N?",
        "Nøklene er 0, 1, …, N − 1 – det er N bøtter, og den siste heter B[N − 1]. «to» tar med sluttverdien, så «to N» ville spurt etter en bøtte som ikke finnes. (Teller du feil her når du lager bøttene, f.eks. for ordlengder 0 … N, trenger du N + 1 bøtter.)")
    },
    radixSort: {
      "for i ← d − 1 downto 0 do": g("Hvorfor baklengs, fra d − 1 ned til 0?",
        "Sifrene nummereres fra venstre, så siffer d − 1 er enerplassen – det minst betydningsfulle. Vi må starte der: den siste runden (det første sifferet) bestemmer rekkefølgen til slutt, og stabiliteten sørger for at like førstesiffer beholder rekkefølgen fra rundene før. Starter vi med det første sifferet, ødelegger de senere rundene den rekkefølgen.")
    }
  };
  Object.keys(GRENSER).forEach(function (key) {
    var algo = IN.algos[key], map = GRENSER[key], hit = {};
    if (!algo) return;
    algo.lines.forEach(function (l) { if (map[l.code]) { l.grense = map[l.code]; hit[l.code] = 1; } });
    Object.keys(map).forEach(function (c) {
      if (!hit[c] && window.console) console.warn("Grenseforklaring uten treff i " + key + ": " + c);
    });
  });

  /* ===================== PARSONS: BYTTBARE LINJER =====================
     Linjer (indekser i lines[]) som står rett etter hverandre og er uavhengige av hverandre,
     så begge rekkefølgene er riktige. Parsons-sjekken (pseudocode.js) godtar alle rekkefølger
     innen en gruppe. Like kodelinjer godtas uansett. */
  var BYTTBARE = {
    insertionSort: [[1, 2]],   // key ← A[i]  /  j ← i − 1
    binarySearch: [[0, 1]],    // low ← 0  /  high ← n − 1
    heapInsert: [[0, 1]]       // A[n] ← x  /  i ← n
  };
  Object.keys(BYTTBARE).forEach(function (key) { if (IN.algos[key]) IN.algos[key].parsonsSwap = BYTTBARE[key]; });

  /* Løkkespenn (step.ranges, tegnes av viz-bars.js under søylene). Regnes ut fra variablene i
     steget, med grensene nøyaktig som i pseudokoden (inklusive):
       for-løkke  → heltrukket spenn over verdiene løkkevariabelen tar i denne runden,
                    bare mens løkka går (variabelen er «–» utenfor løkka)
       while-løkke → stiplet: området betingelsen holder variabelen innenfor (den kan stoppe før)
       kall        → tykt spenn «lo..hi» / «low..high» over delområdet kallet vi står i jobber på
     Rekkefølge: kallet først, så ytre løkke, så indre (nærmest søylene først). */
  function val(s, name) {
    var vs = s.vars || [];
    for (var z = 0; z < vs.length; z++) if (vs[z] && vs[z].name === name && !vs[z].row) return typeof vs[z].value === "number" ? vs[z].value : null;
    return null;
  }
  function F(name, from, to) { return { name: name, from: from, to: to }; }
  function W(name, from, to, row) { var o = { name: name, from: from, to: to, dashed: true }; if (row) o.row = row; return o; }
  function C(name, from, to) { return { name: name, from: from, to: to, call: true }; }
  var RANGES = {
    // for i ← 0 to n − 1 / for j ← i + 1 to n − 1
    selectionSort: function (s, n) {
      var r = [], i = val(s, "i"), j = val(s, "j");
      if (i != null) r.push(F("i", 0, n - 1));
      if (i != null && j != null) r.push(F("j", i + 1, n - 1));
      return r;
    },
    // for j ← 0 to n − 2 − i. Den ytre i er en rundeteller, ikke en plass i A, så den får ikke spenn.
    bubbleSort: function (s, n) {
      var i = val(s, "i"), j = val(s, "j");
      return i != null && j != null ? [F("j", 0, n - 2 - i)] : [];
    },
    // for i ← 1 to n − 1; while j ≥ 0 and A[j] > key (linje 5–7): j holder seg i [0, i − 1]
    insertionSort: function (s, n) {
      var r = [], i = val(s, "i"), j = val(s, "j");
      if (i != null) r.push(F("i", 1, n - 1));
      if (i != null && j != null && s.line >= 5 && s.line <= 7) r.push(W("j", 0, i - 1));
      return r;
    },
    // while i < n (linje 3–8)
    gnomeSort: function (s, n) {
      return s.line != null && s.line >= 3 && val(s, "i") != null ? [W("i", 0, n - 1)] : [];
    },
    // MergeSort(A, lo, hi) og Merge(A, lo, mid, hi): kallets [lo, hi].
    // Merge linje 4–9: while i < |L| and j < |R| – i går i L[0..|L| − 1], j i R[0..|R| − 1].
    mergeSort: function (s) {
      var r = [], lo = val(s, "lo"), hi = val(s, "hi");
      if (!s.frame || lo == null || hi == null) return r;
      r.push(C("lo..hi", lo, hi));
      if (s.frame === "Merge" && s.line >= 6104 && s.line <= 6109 && s.rows) {
        r.push(W("i", 0, s.rows[0].cells.length - 1, "L"));
        r.push(W("j", 0, s.rows[1].cells.length - 1, "R"));
      }
      return r;
    },
    // Quicksort(A, low, high) og Partition(A, low, high): kallets [low, high].
    // Partition linje 7–13: while left ≤ right – området [left, right] som ennå ikke er avgjort.
    quickSort: function (s) {
      var r = [], lo = val(s, "low"), hi = val(s, "high");
      if (!s.frame || lo == null || hi == null) return r;
      r.push(C("low..high", lo, hi));
      var L = val(s, "left"), R = val(s, "right");
      if (s.frame === "Partition" && s.line >= 4107 && s.line <= 4113 && L != null && R != null && L <= R) r.push(W("left..right", L, R));
      return r;
    }
  };

  /* Variabellinja: hvert steg får varsPrev (variablene i steget før), så endrede verdier kan utheves.
     Samtidig får stegene ranges (løkkespenn) for algoritmene i RANGES. */
  ["selectionSort", "bubbleSort", "insertionSort", "gnomeSort", "mergeSort", "quickSort", "bucketSort", "radixSort"].forEach(function (key) {
    var g = IN.gen[key];
    if (!g || g.__vlLinked) return;
    var R = RANGES[key];
    var w = function (input) {
      var steps = g(input) || [];
      for (var z = 0; z < steps.length; z++) {
        steps[z].varsPrev = z ? (steps[z - 1].vars || null) : null;
        if (R) steps[z].ranges = R(steps[z], (steps[z].array || []).length);
      }
      return steps;
    };
    w.__vlLinked = true;
    IN.gen[key] = w;
  });
})();
