/* ============================================================
   IN2010 guide · data-sok.js
   Algoritmer og steg-generatorer for Blokk 2 · Søk.
   Lastes ETTER data-algos.js. Gjenbruker IN.algos.binarySearch
   (pseudokoden) og legger bare til nye nøkler – overskriver aldri.
   Klassisk script, ingen moduler.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.algos = IN.algos || {};
  IN.gen = IN.gen || {};
  IN.sok = IN.sok || {};

  function t(e, n, te) { return { eli5: e, normal: n, teknisk: te }; }
  function nn(c, ent, fl) { return c + " " + (c === 1 ? ent : fl); }
  function clone(a) { return a.slice(); }
  function range(lo, hi) { var r = []; for (var z = lo; z <= hi; z++) r.push(z); return r; }
  function num(a, b) { return a - b; }
  function reg(ns, nsName, key, val) {
    if (Object.prototype.hasOwnProperty.call(ns, key)) {
      if (window.console) console.warn("data-sok.js: IN." + nsName + "." + key + " finnes fra før – beholder den gamle.");
      return;
    }
    ns[key] = val;
  }
  // Input-format for søke-demoene: et vanlig array der de siste `tail` tallene er
  // parametre (x, eventuelt low/high). Da virker stepPlayer sin inp.slice().
  function split(input, tail) {
    return { A: input.slice(0, Math.max(0, input.length - tail)), p: input.slice(input.length - tail) };
  }
  function maxRounds(n) { return n > 0 ? Math.floor(Math.log(n) / Math.LN2) + 1 : 0; }

  /* ===================== RETT-FREM SØK ===================== */
  reg(IN.algos, "algos", "linearSearch", {
    title: "Rett-frem søk",
    name: "Search", params: "A, x",
    input: "Et array A med n elementer (trenger ikke være sortert), og et element x",
    output: "Indeksen til x i A, eller −1 hvis x ikke finnes",
    lines: [
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Vi ser på tallene ett og ett, fra venstre mot høyre – som å lete etter en sokk ved å løfte opp ett plagg om gangen.",
        normal: "Gå gjennom hver posisjon i arrayet, fra første til siste.",
        teknisk: "Løkka besøker posisjonene 0, 1, …, n − 1 i rekkefølge. Vi antar ingenting om rekkefølgen på verdiene, så vi kan ikke hoppe over noe.",
        grense: { q: "Hvorfor n − 1 og ikke n?", a: t("Vi teller plassene fra 0. Med n tall er den siste plassen nummer n − 1. Plass n finnes ikke.", "Indeksene går fra 0 til n − 1, og «to» tar med sluttverdien. Med «to n» ville vi lest A[n], som ligger utenfor arrayet.", "0-indeksering: n elementer har indeksene 0..n − 1. «for i ← 0 to n − 1» gir nøyaktig n runder. Øvre grense n gir én runde for mye og en lesing utenfor arrayet.") } },
      { code: "if A[i] = x then", indent: 2,
        eli5: "Er dette tallet det vi leter etter?",
        normal: "Sammenlign elementet på plass i med x.",
        teknisk: "Én sammenligning per runde. Det er disse sammenligningene vi teller når vi snakker om kjøretiden." },
      { code: "return i", indent: 3,
        eli5: "Ja! Vi sier hvor vi fant det og slutter å lete.",
        normal: "Treff: returner indeksen med en gang.",
        teknisk: "Tidlig retur. Ligger x først, er vi ferdige etter én sammenligning – det er beste tilfelle, O(1)." },
      { code: "return −1", indent: 1,
        eli5: "Vi har sett på alle tallene uten å finne det. Da svarer vi −1, som betyr «finnes ikke».",
        normal: "Hele arrayet er sjekket uten treff: returner −1.",
        teknisk: "Vi kommer hit bare etter n mislykte sammenligninger. Verste tilfelle er altså n sammenligninger, O(n)." }
    ],
    bigO: {
      best: "O(1)", avg: "O(n)", worst: "O(n)", space: "O(1)",
      why: t(
        "Er vi heldige, ligger tallet helt først. Er vi uheldige, må vi se på alle tallene. Dobbelt så mange tall betyr dobbelt så mye leting.",
        "I verste fall (x ligger sist eller finnes ikke) sammenligner vi med alle n elementene, så tiden vokser lineært med n. Fordelen er at arrayet ikke trenger å være sortert.",
        "Hver runde gjør konstant arbeid, og i verste tilfelle kjører løkka n runder, altså O(n). Ligger x på første plass, stopper vi etter én runde: O(1). Algoritmen bruker bare telleren i, så ekstra minne er O(1)."
      )
    }
  });

  IN.gen.linearSearch = IN.gen.linearSearch || function (input) {
    var s = split(input, 1), A = s.A, x = s.p[0], n = A.length, steps = [], cmp = 0;
    function snap(line, marks, ptrs, dim, text, tag) {
      steps.push({ line: line, array: clone(A), marks: marks, ptrs: ptrs, dim: dim,
        info: [["x", x], ["sammenligninger", cmp]], text: text, tag: tag });
    }
    snap(2, {}, { i: 0 }, [], t("Vi leter etter " + x + ". Vi starter helt til venstre.",
      "Søker etter x = " + x + ". Starter med i = 0.",
      "x = " + x + ". Ingen antakelse om rekkefølge, så vi må starte forfra og gå gjennom én og én posisjon."), "Start");
    for (var i = 0; i < n; i++) {
      cmp++;
      if (A[i] === x) {
        snap(3, { compare: [i] }, { i: i }, range(0, i - 1), t("Er " + A[i] + " lik " + x + "? Ja!", "A[" + i + "] = " + A[i] + " = x.", "Sammenligning nr. " + cmp + ": A[" + i + "] = x."), "Sammenlign");
        snap(4, { found: i }, { i: i }, range(0, i - 1), t("Funnet på plass " + i + " etter " + nn(cmp, "forsøk", "forsøk") + ".", "Treff på indeks " + i + " etter " + nn(cmp, "sammenligning", "sammenligninger") + ".", "return " + i + ". Vi brukte " + nn(cmp, "sammenligning", "sammenligninger") + "; verste tilfelle ville vært n = " + n + "."), "Funnet");
        return steps;
      }
      snap(3, { compare: [i] }, { i: i }, range(0, i - 1), t("Er " + A[i] + " lik " + x + "? Nei, vi går videre.", "A[" + i + "] = " + A[i] + " ≠ x → neste.", "Sammenligning nr. " + cmp + ": A[" + i + "] ≠ x, så i øker."), "Sammenlign");
    }
    snap(5, {}, {}, range(0, n - 1), t("Vi har sett på alle " + n + " tallene. " + x + " finnes ikke.", "Ikke funnet etter " + nn(cmp, "sammenligning", "sammenligninger") + " → −1.", "Alle n = " + n + " posisjoner er sjekket: dette er verste tilfelle, n sammenligninger."), "Ikke funnet");
    return steps;
  };

  /* ===================== BINÆRSØK – nøyaktig sporing =====================
     Pseudokoden er IN.algos.binarySearch fra data-algos.js (gjenbrukt).
     Linjer: Procedure=1, low=2, high=3, while=4, mid=5, if=6, return mid=7,
             else if=8, low←=9, else=10, high←=11, return −1=12 */
  IN.gen.binarySearchTrace = IN.gen.binarySearchTrace || function (input) {
    var s = split(input, 1), raw = s.A, x = s.p[0];
    var A = clone(raw).sort(num), n = A.length, steps = [];
    var sortedNote = raw.join(",") !== A.join(",");
    var low = 0, high = n - 1, mid = null, round = 0, cmp = 0, M = maxRounds(n);
    function info() { return [["x", x], ["runde", round + " av maks " + M], ["sammenligninger", cmp]]; }
    function ptrs() { var p = {}; if (low < n) p.low = low; if (high >= 0) p.high = high; if (mid != null) p.mid = mid; return p; }
    function snap(line, marks, text, tag, noRange) {
      steps.push({ line: line, array: clone(A), marks: marks, ptrs: ptrs(), range: noRange ? null : [low, high],
        info: info(), text: text, tag: tag });
    }
    var pre = sortedNote ? " (Vi sorterte arrayet først – binærsøk virker bare på sortert input.)" : "";
    snap(2, {}, t("Vi leter etter " + x + ". «low» er den første plassen vi fortsatt kan finne det på." + pre,
      "x = " + x + ". low ← 0: venstre kant av søkeområdet." + pre,
      "x = " + x + ". Vi holder et intervall [low, high] der x må ligge hvis det finnes. Start: low ← 0." + pre), "Start", true);
    snap(3, {}, t("«high» er den siste plassen. Nå er hele arrayet med i letingen.",
      "high ← n − 1 = " + high + ". Søkeområdet er [" + low + ", " + high + "].",
      "high ← " + high + ". Intervallet [0, n − 1] dekker hele arrayet. Maks antall runder er ⌊log n⌋ + 1 = " + M + "."), "Start");
    while (true) {
      if (!(low <= high)) break;
      round++; mid = null;
      snap(4, {}, t("Er det fortsatt plasser igjen å lete på? Ja, fra " + low + " til " + high + ".",
        "low ≤ high (" + low + " ≤ " + high + "): runde " + round + ".",
        "Intervallet er ikke tomt (" + nn(high - low + 1, "element", "elementer") + " igjen), så vi tar runde " + round + "."), "Runde " + round);
      mid = Math.floor((low + high) / 2);
      snap(5, { compare: [mid] }, t("Vi slår opp i midten: plass " + mid + ", der det står " + A[mid] + ".",
        "mid ← ⌊(" + low + " + " + high + ") / 2⌋ = " + mid + ", A[mid] = " + A[mid] + ".",
        "mid ← ⌊(" + low + " + " + high + ") / 2⌋ = " + mid + ". Midten deler intervallet i to nesten like store halvdeler."), "Midten");
      cmp++;
      if (A[mid] === x) {
        snap(6, { compare: [mid] }, t("Er " + A[mid] + " det tallet vi leter etter? Ja!", "A[mid] = x? Ja.", "Sammenligning nr. " + cmp + ": A[" + mid + "] = x."), "Sammenlign");
        snap(7, { found: mid }, t("Funnet på plass " + mid + " etter bare " + nn(round, "runde", "runder") + ".",
          "return " + mid + " (etter " + nn(round, "runde", "runder") + ").",
          "return " + mid + ". Vi brukte " + round + " av maks " + M + " runder – rett-frem søk kunne trengt opptil " + n + " sammenligninger."), "Funnet");
        return steps;
      }
      snap(6, { compare: [mid] }, t(A[mid] + " er ikke tallet vårt.", "A[mid] = x? Nei (" + A[mid] + " ≠ " + x + ").", "Sammenligning nr. " + cmp + ": A[" + mid + "] ≠ x."), "Sammenlign");
      cmp++;
      if (A[mid] < x) {
        snap(8, { compare: [mid] }, t(A[mid] + " er mindre enn " + x + ". Siden alt er sortert, må " + x + " ligge til høyre.",
          "A[mid] &lt; x? Ja (" + A[mid] + " &lt; " + x + ") → x må ligge til høyre.",
          "A[mid] &lt; x, og arrayet er sortert, så alt i A[low..mid] er også mindre enn x. Hele venstre del kan kastes."), "Sammenlign");
        low = mid + 1;
        snap(9, {}, t("Vi glemmer hele venstre del, også midten. Nå leter vi bare fra plass " + low + ".",
          "low ← mid + 1 = " + low + ". Nytt søkeområde [" + low + ", " + high + "].",
          "low ← mid + 1 = " + low + ". Intervallet er omtrent halvert: " + nn(Math.max(0, high - low + 1), "element", "elementer") + " igjen."), "Gå høyre");
      } else {
        snap(8, { compare: [mid] }, t(A[mid] + " er større enn " + x + ". Da må " + x + " ligge til venstre.",
          "A[mid] &lt; x? Nei (" + A[mid] + " &gt; " + x + ") → x må ligge til venstre.",
          "A[mid] &gt; x, så alt i A[mid..high] er større enn x. Vi går til else-grenen og kaster høyre del."), "Sammenlign");
        high = mid - 1;
        snap(11, {}, t("Vi glemmer hele høyre del, også midten. Nå leter vi bare til og med plass " + high + ".",
          "high ← mid − 1 = " + high + ". Nytt søkeområde [" + low + ", " + high + "].",
          "high ← mid − 1 = " + high + ". Intervallet er omtrent halvert: " + nn(Math.max(0, high - low + 1), "element", "elementer") + " igjen."), "Gå venstre");
      }
    }
    mid = null;
    snap(4, {}, t("Nå har «low» gått forbi «high». Det er ingen plasser igjen å lete på.",
      "low &gt; high (" + low + " &gt; " + high + ") → løkka stopper.",
      "low &gt; high: intervallet er tomt. Siden vi bare har kastet deler der x umulig kunne ligge, vet vi nå at x ikke finnes."), "Tomt");
    snap(12, {}, t("Vi fant ikke " + x + ". Svaret er −1, som betyr «finnes ikke».",
      "return −1 etter " + nn(round, "runde", "runder") + ".",
      "return −1. Vi brukte " + nn(round, "runde", "runder") + "; mer enn ⌊log n⌋ + 1 = " + M + " runder kan det aldri bli."), "Ikke funnet");
    return steps;
  };

  /* ===================== BINÆRSØK – FØRSTE FOREKOMST ===================== */
  reg(IN.algos, "algos", "binarySearchFirst", {
    title: "Binærsøk – første forekomst",
    name: "BinarySearchFirst", params: "A, x",
    input: "Et sortert array A med n elementer (kan ha like verdier), og et element x",
    output: "Den minste indeksen i der A[i] = x, eller −1 hvis x ikke finnes",
    lines: [
      { code: "low ← 0", indent: 1, eli5: "Vi starter med hele bunken: «low» er første plass.", normal: "Nedre grense for søkeområdet.", teknisk: "Som i vanlig binærsøk holder vi et intervall [low, high]." },
      { code: "high ← n − 1", indent: 1, eli5: "«high» er siste plass.", normal: "Øvre grense: hele arrayet.", teknisk: "Start med hele arrayet, [0, n − 1]." },
      { code: "ans ← −1", indent: 1, eli5: "Vi har ikke funnet noe ennå. Vi skriver −1 på en lapp.", normal: "Beste svar så langt: ingen treff.", teknisk: "ans husker det minste treffet vi har sett. Den nye ideen er at vi ikke stopper ved første treff." },
      { code: "while low ≤ high do", indent: 1, eli5: "Så lenge det er plasser igjen å lete på …", normal: "Fortsett mens søkeområdet ikke er tomt.", teknisk: "Intervallet halveres hver runde, så vi får fortsatt O(log n) runder.",
        grense: { q: "Hvorfor low ≤ high og ikke low < high?", a: t("Når «low» og «high» peker på samme plass, er det fortsatt ett tall igjen å se på.", "Når low = high er det ett element igjen. Med &lt; ville vi stoppet uten å sjekke det.", "Intervallet [low, high] er ikke tomt når low = high. Med low &lt; high ville vi hoppet over det siste kandidatelementet og kunne mistet x.") } },
      { code: "mid ← ⌊(low + high) / 2⌋", indent: 2, eli5: "Vi ser i midten.", normal: "Finn midtindeksen.", teknisk: "Rund ned med ⌊ ⌋ for å få en heltallsindeks." },
      { code: "if A[mid] = x then", indent: 2, eli5: "Er det tallet vårt?", normal: "Treff i midten?", teknisk: "Treff betyr bare at x finnes. Det kan fortsatt finnes en tidligere kopi til venstre." },
      { code: "ans ← mid", indent: 3, eli5: "Ja! Vi skriver ned plassen på lappen …", normal: "Husk dette treffet.", teknisk: "mid er det beste kandidatsvaret vi har så langt." },
      { code: "high ← mid − 1", indent: 3, eli5: "… men vi leter videre til venstre, i tilfelle det finnes en tidligere kopi.", normal: "Fortsett å lete til venstre for treffet.", teknisk: "Dette er hele forskjellen fra vanlig binærsøk: ved treff kaster vi høyre halvdel i stedet for å returnere.",
        grense: { q: "Hvorfor mid − 1 og ikke mid?", a: t("Midten har vi allerede skrevet ned på lappen. Tar vi den med igjen, kan vi bli stående og se på samme plass for alltid.", "mid er allerede lagret i ans. Med high ← mid kan intervallet slutte å krympe (når low = high = mid), og løkka går evig.", "Vi leter etter en tidligere forekomst, altså i [low, mid − 1]. Med high ← mid krymper ikke intervallet når low = mid, og løkka terminerer aldri. ans husker treffet, så vi mister ingenting.") } },
      { code: "else if A[mid] < x then", indent: 2, eli5: "Er midten for liten? Da ligger tallet til høyre.", normal: "For lite → søk i høyre halvdel.", teknisk: "Alt i A[low..mid] er mindre enn x." },
      { code: "low ← mid + 1", indent: 3, eli5: "Vi flytter «low» forbi midten.", normal: "Snevr inn fra venstre.", teknisk: "Kast venstre del inkludert mid." },
      { code: "else", indent: 2, eli5: "Ellers er midten for stor.", normal: "For stort → søk i venstre halvdel.", teknisk: "Her er A[mid] &gt; x. Siden A er sortert, er alt fra mid og utover for stort, så vi kan kaste høyre del." },
      { code: "high ← mid − 1", indent: 3, eli5: "Vi flytter «high» forbi midten.", normal: "Snevr inn fra høyre.", teknisk: "Kast høyre del inkludert mid." },
      { code: "return ans", indent: 1, eli5: "Lappen viser den første plassen tallet står på (eller −1).", normal: "Returner det minste treffet, eller −1.", teknisk: "Når intervallet er tomt, er ans den første forekomsten: alle posisjoner til venstre for ans er utelukket." }
    ],
    bigO: {
      best: "O(log n)", avg: "O(log n)", worst: "O(log n)", space: "O(1)",
      why: t(
        "Vi halverer fortsatt bunken hver gang, så det går like fort som vanlig binærsøk. Vi stopper bare ikke før bunken er tom.",
        "Samme halvering som vanlig binærsøk, så ca. log n runder. Fordi vi ikke stopper ved første treff, er også beste tilfelle O(log n).",
        "Hver runde halverer intervallet uansett om vi treffer eller ikke, så antall runder er alltid omtrent log n. Det er derfor beste tilfelle også blir O(log n), i motsetning til vanlig binærsøk der et heldig treff gir O(1)."
      )
    }
  });

  IN.gen.binarySearchFirst = IN.gen.binarySearchFirst || function (input) {
    var s = split(input, 1), A = clone(s.A).sort(num), x = s.p[0], n = A.length, steps = [];
    var low = 0, high = n - 1, mid = null, ans = -1, round = 0;
    function ptrs() { var p = {}; if (low < n) p.low = low; if (high >= 0) p.high = high; if (mid != null) p.mid = mid; return p; }
    function snap(line, marks, text, tag, noRange) {
      var m = marks || {}; if (ans >= 0 && m.found == null) m.found = ans;
      steps.push({ line: line, array: clone(A), marks: m, ptrs: ptrs(), range: noRange ? null : [low, high],
        info: [["x", x], ["ans", ans], ["runde", round]], text: text, tag: tag });
    }
    snap(2, {}, t("Vi leter etter den FØRSTE plassen der " + x + " står.", "x = " + x + ", low ← 0.", "x = " + x + ". Mål: minste indeks med A[i] = x."), "Start", true);
    snap(3, {}, t("Hele arrayet er med.", "high ← " + high + ".", "Intervall [0, " + high + "]."), "Start");
    snap(4, {}, t("Vi har ikke funnet noe ennå.", "ans ← −1.", "ans ← −1 (ingen kandidat ennå)."), "Start");
    while (low <= high) {
      round++; mid = null;
      snap(5, {}, t("Det er fortsatt plasser igjen.", "low ≤ high: runde " + round + ".", "Intervall [" + low + ", " + high + "], runde " + round + "."), "Runde " + round);
      mid = Math.floor((low + high) / 2);
      snap(6, { compare: [mid] }, t("Midten er plass " + mid + " med " + A[mid] + ".", "mid = " + mid + ", A[mid] = " + A[mid] + ".", "mid ← ⌊(" + low + " + " + high + ") / 2⌋ = " + mid + "."), "Midten");
      if (A[mid] === x) {
        snap(7, { compare: [mid] }, t("Treff!", "A[mid] = x.", "Treff på " + mid + ", men kanskje ikke det første."), "Treff");
        ans = mid;
        snap(8, {}, t("Vi skriver " + mid + " på lappen.", "ans ← " + mid + ".", "ans ← " + mid + "."), "Husk");
        high = mid - 1;
        snap(9, {}, t("Vi leter videre til venstre, i tilfelle det finnes en tidligere kopi.", "high ← mid − 1 = " + high + ".", "Fortsett i [" + low + ", " + high + "] for å se etter en tidligere forekomst."), "Gå venstre");
      } else if (A[mid] < x) {
        snap(10, { compare: [mid] }, t(A[mid] + " er for lite, så vi går til høyre.", "A[mid] &lt; x.", "A[mid] &lt; x."), "Sammenlign");
        low = mid + 1;
        snap(11, {}, t("Nå leter vi fra plass " + low + ".", "low ← " + low + ".", "low ← mid + 1 = " + low + "."), "Gå høyre");
      } else {
        snap(10, { compare: [mid] }, t(A[mid] + " er for stort, så vi går til venstre.", "A[mid] &gt; x.", "A[mid] &gt; x → else."), "Sammenlign");
        high = mid - 1;
        snap(13, {}, t("Nå leter vi til og med plass " + high + ".", "high ← " + high + ".", "high ← mid − 1 = " + high + "."), "Gå venstre");
      }
    }
    mid = null;
    snap(5, {}, t("Ingen plasser igjen å lete på.", "low &gt; high → stopp.", "Intervallet er tomt."), "Tomt");
    snap(14, {}, ans >= 0
      ? t("Den første " + x + "-en står på plass " + ans + ".", "return " + ans + ".", "return " + ans + ": ingen posisjon til venstre for " + ans + " kan ha x, for den delen er utelukket.")
      : t(x + " finnes ikke.", "return −1.", "return −1: x finnes ikke."), ans >= 0 ? "Første" : "Ikke funnet", true);
    return steps;
  };

  /* ===================== BINÆRSØK – REKURSIVT, I ET DELINTERVALL ===================== */
  reg(IN.algos, "algos", "binarySearchRec", {
    title: "Binærsøk – rekursivt i [low, high]",
    name: "BinarySearchRec", params: "A, x, low, high",
    input: "Et array A der delen A[low..high] er sortert, et element x, og grensene low og high",
    output: "En indeks i med low ≤ i ≤ high og A[i] = x, eller −1",
    lines: [
      { code: "if low > high then", indent: 1, eli5: "Er bunken vi skal lete i tom?", normal: "Basistilfelle: tomt intervall.", teknisk: "Basistilfellet. Hvert kall krymper intervallet, så vi kommer garantert hit hvis x ikke finnes.",
        grense: { q: "Hvorfor low > high og ikke low ≥ high?", a: t("Hvis «low» og «high» er like, er det fortsatt ett tall igjen å se på. Bunken er bare tom når «low» har gått forbi «high».", "low = high betyr ett element igjen. Bare low &gt; high betyr tomt intervall.", "Basistilfellet er det tomme intervallet, low &gt; high. Med low ≥ high ville vi returnert −1 for et intervall med ett element, selv om det kunne vært x.") } },
      { code: "return −1", indent: 2, eli5: "Da finnes ikke tallet her.", normal: "Ikke funnet.", teknisk: "Tomt intervall betyr at x ikke finnes i A[low..high]." },
      { code: "mid ← ⌊(low + high) / 2⌋", indent: 1, eli5: "Vi ser i midten av bunken vår.", normal: "Midtindeksen i det gitte intervallet.", teknisk: "Midten av [low, high] – ikke av hele arrayet. Det er derfor vi kan søke i en del av A." },
      { code: "if A[mid] = x then", indent: 1, eli5: "Er det tallet vårt?", normal: "Treff?", teknisk: "Én sammenligning: er midtelementet akkurat x, er vi ferdige med dette kallet." },
      { code: "return mid", indent: 2, eli5: "Ja! Vi sier fra hvor det var.", normal: "Returner indeksen.", teknisk: "Svaret sendes tilbake opp gjennom alle kallene." },
      { code: "else if A[mid] < x then", indent: 1, eli5: "Er midten for liten? Da ligger tallet til høyre.", normal: "For lite → høyre halvdel.", teknisk: "Venstre del kan utelukkes fordi A[low..high] er sortert." },
      { code: "return BinarySearchRec(A, x, mid + 1, high)", indent: 2, eli5: "Vi ber en «hjelper» lete i høyre halvdel, og sier videre det hjelperen svarer.", normal: "Rekursivt kall på høyre halvdel.", teknisk: "Et nytt kall med halvparten så stort intervall. Vi returnerer svaret direkte, så ingenting gjøres etter kallet.",
        grense: { q: "Hvorfor mid + 1 og ikke mid?", a: t("Midten har vi allerede sjekket, så den trenger vi ikke se på igjen.", "A[mid] er allerede sjekket. Med mid i stedet for mid + 1 kan samme kall gjentas for alltid når intervallet har to elementer.", "Vi vet at A[mid] ≠ x, så mid kan utelukkes. Med mid som ny nedre grense krymper ikke [mid, high] når low = mid, og rekursjonen stopper aldri.") } },
      { code: "else", indent: 1, eli5: "Ellers er midten for stor.", normal: "For stort → venstre halvdel.", teknisk: "Her er A[mid] &gt; x. Siden A[low..high] er sortert, kan x bare ligge til venstre for mid." },
      { code: "return BinarySearchRec(A, x, low, mid − 1)", indent: 2, eli5: "Vi ber en hjelper lete i venstre halvdel.", normal: "Rekursivt kall på venstre halvdel.", teknisk: "Samme idé som til høyre: halvert intervall, svaret sendes rett tilbake." }
    ],
    bigO: {
      best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(log n)",
      why: t(
        "Akkurat som vanlig binærsøk halverer vi bunken hver gang. Men hvert nytt «hjelper-kall» må huskes til svaret kommer tilbake, og det tar litt plass.",
        "Hvert kall halverer intervallet, så det blir ca. log n kall. Kallene ligger på kallstakken samtidig, derfor O(log n) ekstra minne (den iterative versjonen bruker O(1)).",
        "Hvert kall gjør konstant arbeid og sender et intervall som er høyst halvparten så stort videre. Fra n ned til ett element med halvering tar omtrent log n kall, så kjøretiden er O(log n). (Kortversjonen er T(n) = T(n/2) + O(1). Den trenger du ikke regne på; det er argumentet om antall halveringer som teller på eksamen.) Kallstakken blir like dyp som antall halveringer, så minnebruken er O(log n). Kaller du med low og high fra et kjent delintervall, er n her lengden av intervallet."
      )
    }
  });

  // input: [...A, x, low, high]. Sorterer IKKE (for å kunne vise at et usortert område gir feil svar).
  IN.gen.binarySearchRec = IN.gen.binarySearchRec || function (input) {
    var s = split(input, 3), A = s.A, x = s.p[0], L0 = s.p[1], H0 = s.p[2], n = A.length, steps = [];
    var calls = 0, depth = 0;
    function snap(line, marks, p, rg, text, tag) {
      steps.push({ line: line, array: clone(A), marks: marks, ptrs: p, range: rg,
        info: [["x", x], ["kalldybde", depth], ["kall totalt", calls]], text: text, tag: tag });
    }
    function call(low, high) {
      calls++; depth++;
      var p = {}; if (low >= 0 && low < n) p.low = low; if (high >= 0 && high < n) p.high = high;
      var head = "BinarySearchRec(A, " + x + ", " + low + ", " + high + ")";
      if (low > high) {
        snap(2, {}, p, null, t("Bunken er tom. Hjelperen svarer «finnes ikke».", head + ": low &gt; high.", head + ": tomt intervall, basistilfellet."), "Kall " + calls);
        snap(3, {}, p, null, t("Svaret −1 sendes tilbake.", "return −1.", "return −1, som sendes uendret opp gjennom kallene."), "Tomt");
        depth--; return -1;
      }
      snap(2, {}, p, [low, high], t("Nytt kall: vi leter fra plass " + low + " til " + high + ".", head + ": low ≤ high.", head + ": intervallet har " + nn(high - low + 1, "element", "elementer") + "."), "Kall " + calls);
      var mid = Math.floor((low + high) / 2); p.mid = mid;
      snap(4, { compare: [mid] }, p, [low, high], t("Midten er plass " + mid + " med " + A[mid] + ".", "mid = " + mid + ", A[mid] = " + A[mid] + ".", "mid ← ⌊(" + low + " + " + high + ") / 2⌋ = " + mid + "."), "Midten");
      if (A[mid] === x) {
        snap(6, { found: mid }, p, [low, high], t("Funnet på plass " + mid + "!", "return " + mid + ".", "Treff: return " + mid + "."), "Funnet");
        depth--; return mid;
      }
      var r;
      if (A[mid] < x) {
        snap(7, { compare: [mid] }, p, [low, high], t(A[mid] + " er mindre enn " + x + ", så vi leter til høyre.", "A[mid] &lt; x → høyre.", "A[mid] &lt; x: kall på [" + (mid + 1) + ", " + high + "]."), "Gå høyre");
        snap(8, { compare: [mid] }, p, [low, high], t("Vi ber en hjelper lete fra " + (mid + 1) + " til " + high + ".", "Kall på [" + (mid + 1) + ", " + high + "].", "return BinarySearchRec(A, x, " + (mid + 1) + ", " + high + ")."), "Rekursjon");
        r = call(mid + 1, high);
      } else {
        snap(9, { compare: [mid] }, p, [low, high], t(A[mid] + " er større enn " + x + ", så vi leter til venstre.", "A[mid] &gt; x → venstre.", "A[mid] &gt; x: kall på [" + low + ", " + (mid - 1) + "]."), "Gå venstre");
        snap(10, { compare: [mid] }, p, [low, high], t("Vi ber en hjelper lete fra " + low + " til " + (mid - 1) + ".", "Kall på [" + low + ", " + (mid - 1) + "].", "return BinarySearchRec(A, x, " + low + ", " + (mid - 1) + ")."), "Rekursjon");
        r = call(low, mid - 1);
      }
      depth--; return r;
    }
    var res = call(L0, H0);
    var mk = {}; if (res >= 0) mk.found = res;
    var inRange = []; for (var z = L0; z <= H0; z++) if (A[z] === x) inRange.push(z);
    var miss = res < 0 && inRange.length > 0;
    steps.push({ line: null, array: clone(A), marks: mk, ptrs: {}, range: [L0, H0],
      info: [["x", x], ["svar", res], ["kall totalt", calls]],
      text: miss
        ? t("Oi! " + x + " står faktisk på plass " + inRange[0] + ", men vi fant det ikke. Området vi lette i var ikke sortert, så halveringen kastet feil halvdel.",
            "Feil svar: x finnes på indeks " + inRange[0] + ", men søket returnerte −1. Området var ikke sortert.",
            "Feil svar. Binærsøk forutsetter at A[low..high] er sortert. Her var det ikke det, så en «kast halvparten»-beslutning utelukket området der x faktisk lå.")
        : t("Ferdig etter " + calls + " kall. Svaret er " + res + ".", "Resultat: " + res + " etter " + calls + " kall.", "Svaret " + res + " er sendt tilbake gjennom " + calls + " kall. Kalldybden blir høyst omtrent log av intervallengden."),
      tag: miss ? "Feil svar!" : "Ferdig" });
    return steps;
  };

  /* ===================== FINN DUPLIKAT (H2023) ===================== */
  reg(IN.algos, "algos", "findDupSorted", {
    title: "Finn duplikat (a): sortert, x er gitt",
    name: "FindSortedIndicesOfDuplicate", params: "A, x",
    input: "Et sortert array A med n elementer der nøyaktig ett element, x, forekommer to ganger",
    output: "Skriver ut de to indeksene der x står",
    lines: [
      { code: "i ← BinarySearch(A, x)", indent: 1,
        eli5: "Vi bruker binærsøk for å finne én av de to kopiene av x.",
        normal: "Binærsøk som returnerer en indeks (ikke bare true/false). Gir én av de to plassene.",
        teknisk: "Kursets BinarySearch returnerer true/false. Her må den være litt endret så den returnerer indeksen – si det eksplisitt på eksamen, ellers trekkes 1p. O(log n)." },
      { code: "if i > 0 and A[i − 1] = x then", indent: 1,
        eli5: "Fordi arrayet er sortert, står den andre kopien rett ved siden av. Står den til venstre?",
        normal: "Sjekk naboen til venstre (pass på at i − 1 er en gyldig indeks).",
        teknisk: "Sortert ⇒ like elementer ligger inntil hverandre. i &gt; 0 hindrer at vi leser utenfor arrayet.",
        grense: { q: "Hvorfor i > 0 og ikke i ≥ 0?", a: t("Står vi helt først, finnes det ingen nabo til venstre å se på.", "Vi leser A[i − 1]. Det finnes bare når i − 1 ≥ 0, altså i &gt; 0.", "Testen beskytter lesingen A[i − 1]: med i ≥ 0 ville i = 0 gitt A[−1], utenfor arrayet. Fordi and stopper ved første usanne ledd, leses A[i − 1] aldri når i = 0.") } },
      { code: "print(i − 1, i)", indent: 2,
        eli5: "Ja: da er plassene i − 1 og i.",
        normal: "Skriv ut naboen og treffet.",
        teknisk: "Én utskrift, konstant arbeid. Hele kostnaden ligger altså i binærsøket på linja over." },
      { code: "else", indent: 1,
        eli5: "Hvis ikke står den til høyre.",
        normal: "Ellers må kopien ligge til høyre.",
        teknisk: "Siden x garantert forekommer to ganger og ikke står på i − 1, må den stå på i + 1. Da er i + 1 også en gyldig indeks." },
      { code: "print(i, i + 1)", indent: 2,
        eli5: "Da er plassene i og i + 1.",
        normal: "Skriv ut treffet og naboen.",
        teknisk: "Konstant arbeid. Totalt: O(log n) for søket + O(1) for nabosjekken = O(log n)." }
    ],
    bigO: {
      best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)",
      why: t(
        "Binærsøket finner den ene kopien kjapt. Den andre står rett ved siden av, så det tar bare et lite blikk til.",
        "Binærsøket koster O(log n), og nabosjekken er konstant. Totalt O(log n). Rett-frem søk ville gitt O(n) og bare halv uttelling.",
        "Total kjøretid er binærsøket pluss konstant arbeid: O(log n) + O(1) = O(log n). Logaritmisk tid ga full uttelling (4p) i 2023, mens en lineær løsning ga 2p."
      )
    }
  });

  IN.gen.findDupSorted = IN.gen.findDupSorted || function (input) {
    var s = split(input, 1), A = clone(s.A).sort(num), x = s.p[0], n = A.length, steps = [];
    var low = 0, high = n - 1, round = 0, i = -1;
    function snap(line, marks, p, rg, text, tag) {
      steps.push({ line: line, array: clone(A), marks: marks, ptrs: p, range: rg, info: [["x", x], ["runde i søket", round]], text: text, tag: tag });
    }
    snap(2, {}, { low: low, high: high }, [low, high], t("Vi binærsøker etter " + x + " i hele arrayet.", "Binærsøk etter x = " + x + ".", "BinarySearch(A, " + x + ") med indeks som svar."), "Binærsøk");
    while (low <= high) {
      round++;
      var mid = Math.floor((low + high) / 2);
      if (A[mid] === x) {
        snap(2, { found: mid }, { low: low, mid: mid, high: high }, [low, high], t("Midten (plass " + mid + ") er " + x + ". Der har vi én kopi!", "A[" + mid + "] = x → i = " + mid + ".", "Treff etter " + nn(round, "runde", "runder") + ": i ← " + mid + "."), "Treff");
        i = mid; break;
      }
      snap(2, { compare: [mid] }, { low: low, mid: mid, high: high }, [low, high],
        t("Midten er " + A[mid] + ", så vi leter " + (A[mid] < x ? "til høyre." : "til venstre."), "A[" + mid + "] = " + A[mid] + (A[mid] < x ? " &lt; x → høyre." : " &gt; x → venstre."), "mid = " + mid + "; halverer intervallet."), "Binærsøk");
      if (A[mid] < x) low = mid + 1; else high = mid - 1;
    }
    if (i < 0) {
      steps.push({ line: null, array: clone(A), marks: {}, ptrs: {}, info: [["x", x]], text: t(x + " finnes ikke her – oppgaven lover at det gjør det.", "x finnes ikke (bryter forutsetningen).", "Forutsetningen i oppgaven er brutt: x finnes ikke."), tag: "Ikke funnet" });
      return steps;
    }
    var left = i > 0 && A[i - 1] === x;
    snap(3, { found: i, compare: i > 0 ? [i - 1] : [] }, { i: i }, null, t("Står det en " + x + " rett til venstre?" + (left ? " Ja!" : " Nei."), "i &gt; 0 og A[i − 1] = x? " + (left ? "Ja." : "Nei."), "Sjekker A[" + (i - 1) + "]" + (i > 0 ? " = " + A[i - 1] : " (finnes ikke, i = 0)") + "."), "Nabo");
    if (left) snap(4, { sorted: [i - 1, i] }, { i: i }, null, t("Kopiene står på plass " + (i - 1) + " og " + i + ".", "print(" + (i - 1) + ", " + i + ").", "Utskrift (" + (i - 1) + ", " + i + "). Totalt O(log n)."), "Ferdig");
    else {
      snap(5, { found: i, compare: [i + 1] }, { i: i }, null, t("Da må den andre kopien stå til høyre.", "else: kopien står på i + 1.", "Forutsetningen sier x forekommer to ganger, så A[i + 1] = x."), "Nabo");
      snap(6, { sorted: [i, i + 1] }, { i: i }, null, t("Kopiene står på plass " + i + " og " + (i + 1) + ".", "print(" + i + ", " + (i + 1) + ").", "Utskrift (" + i + ", " + (i + 1) + "). Totalt O(log n)."), "Ferdig");
    }
    return steps;
  };

  reg(IN.algos, "algos", "findDupScan", {
    title: "Finn duplikat (b): sortert, x er ukjent",
    name: "FindSortedDuplicateIndices", params: "A",
    input: "Et sortert array A med n elementer der nøyaktig ett element forekommer to ganger",
    output: "Skriver ut de to indeksene der duplikatet står",
    lines: [
      { code: "for i ← 0 to n − 2 do", indent: 1,
        eli5: "Vi går bortover og ser på to og to naboer.",
        normal: "Gå gjennom alle nabopar (i, i + 1).",
        teknisk: "Vi stopper på n − 2 fordi vi også leser A[i + 1]. Det gir n − 1 nabopar.",
        grense: { q: "Hvorfor n − 2 og ikke n − 1?", a: t("Vi ser på et tall og naboen til høyre. Det siste tallet har ingen nabo til høyre.", "Vi leser A[i + 1]. Den siste gyldige verdien for i er derfor n − 2.", "Med i = n − 1 ville A[i + 1] = A[n] ligget utenfor arrayet. n − 2 gir nøyaktig de n − 1 naboparene (0, 1), …, (n − 2, n − 1).") } },
      { code: "if A[i] = A[i + 1] then", indent: 2,
        eli5: "Er de to naboene like?",
        normal: "Like naboer = duplikatet (fordi A er sortert).",
        teknisk: "I et sortert array ligger like elementer inntil hverandre, så duplikatet må være et likt nabopar." },
      { code: "print(i, i + 1)", indent: 3,
        eli5: "Da har vi funnet de to plassene!",
        normal: "Skriv ut de to indeksene.",
        teknisk: "Utskriften er konstant arbeid. Kjøretiden bestemmes av hvor mange nabopar løkka måtte se på før den fant dette." },
      { code: "return", indent: 3,
        eli5: "Og så er vi ferdige. Det finnes bare ett tall som står to ganger, så vi trenger ikke lete videre.",
        normal: "Stopp – det finnes bare ett duplikat.",
        teknisk: "Tidlig retur. I verste fall ligger duplikatet helt bakerst, og da har vi sjekket alle n − 1 parene: O(n)." }
    ],
    bigO: {
      best: "O(1)", avg: "O(n)", worst: "O(n)", space: "O(1)",
      why: t(
        "Vi vet ikke hvilket tall som er dobbelt, så vi må se oss rundt. Men vi trenger bare å gå bortover én gang.",
        "Én gjennomgang av n − 1 nabopar gir O(n). Uten å vite x har vi ikke noe å binærsøke etter.",
        "Løkka kjører høyst n − 1 ganger med konstant arbeid, altså O(n). Lineær tid ga full uttelling (3p) i 2023. Vi kan ikke binærsøke her, for når vi ser på en midtverdi, forteller den ikke hvilken side duplikatet ligger på."
      )
    }
  });

  IN.gen.findDupScan = IN.gen.findDupScan || function (arr) {
    var A = clone(arr).sort(num), n = A.length, steps = [], cmp = 0;
    function snap(line, marks, p, text, tag) { steps.push({ line: line, array: clone(A), marks: marks, ptrs: p, dim: range(0, (p.i == null ? n : p.i) - 1), info: [["sammenligninger", cmp]], text: text, tag: tag }); }
    for (var i = 0; i <= n - 2; i++) {
      cmp++;
      var eq = A[i] === A[i + 1];
      snap(3, { compare: [i, i + 1] }, { i: i, j: i + 1 }, t("Er " + A[i] + " og " + A[i + 1] + " like?" + (eq ? " Ja!" : " Nei."), "A[" + i + "] = A[" + (i + 1) + "]? " + (eq ? "Ja." : "Nei."), "Nabopar nr. " + cmp + ": (" + i + ", " + (i + 1) + ")."), "Naboer");
      if (eq) {
        snap(4, { sorted: [i, i + 1] }, { i: i, j: i + 1 }, t("Duplikatet står på plass " + i + " og " + (i + 1) + ".", "print(" + i + ", " + (i + 1) + ").", "Funnet etter " + cmp + " av maks " + (n - 1) + " sammenligninger."), "Funnet");
        return steps;
      }
    }
    steps.push({ line: null, array: clone(A), marks: {}, ptrs: {}, info: [["sammenligninger", cmp]], text: t("Ingen like naboer – da finnes det ikke noe duplikat.", "Ingen duplikat funnet.", "Ingen like nabopar: forutsetningen i oppgaven gjelder ikke for dette arrayet."), tag: "Ingen" });
    return steps;
  };

  reg(IN.algos, "algos", "findDupHash", {
    title: "Finn duplikat (c): usortert, med hashmap",
    name: "FindDuplicateIndices", params: "A",
    input: "Et array A med n elementer (ikke sortert) der nøyaktig ett element forekommer to ganger",
    output: "Skriver ut de to indeksene der duplikatet står",
    lines: [
      { code: "H ← new HashMap", indent: 1,
        eli5: "Vi tar fram en tom notatbok der vi skriver opp hvert tall vi har sett, og hvor vi så det.",
        normal: "Et tomt hashmap fra verdi til indeks.",
        teknisk: "Nøkkel = verdien A[i], verdi = indeksen der vi så den. Innsetting og oppslag er forventet O(1)." },
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Vi ser på tallene ett og ett.",
        normal: "Én gjennomgang av arrayet.",
        teknisk: "Løkka går høyst n runder, én per element, og hver runde gjør forventet konstant arbeid." },
      { code: "if A[i] ∈ H then", indent: 2,
        eli5: "Har jeg sett dette tallet før? Vi slår opp i notatboka.",
        normal: "Er verdien allerede en nøkkel i H?",
        teknisk: "Oppslag, forventet O(1). Dette er kjernen: «har jeg sett denne før?»." },
      { code: "print(H[A[i]], i)", indent: 3,
        eli5: "Ja! Vi skriver ut hvor vi så det først, og hvor vi er nå.",
        normal: "Skriv ut lagret indeks og nåværende indeks.",
        teknisk: "H[A[i]] er indeksen til første forekomst." },
      { code: "return", indent: 3,
        eli5: "Ferdig! Det finnes bare ett tall som står to ganger, så resten trenger vi ikke se på.",
        normal: "Stopp – det finnes bare ett duplikat.",
        teknisk: "Vi returnerer med en gang. Oppgaven lover nøyaktig ett duplikat, så det er ingenting mer å lete etter." },
      { code: "H[A[i]] ← i", indent: 2,
        eli5: "Nei: vi skriver tallet og plassen inn i notatboka og går videre.",
        normal: "Lagre verdien med indeksen sin.",
        teknisk: "Innsetting, forventet O(1)." }
    ],
    bigO: {
      best: "O(1)", avg: "forventet O(n)", worst: "O(n²)", space: "O(n)",
      why: t(
        "Vi går gjennom tallene bare én gang, og notatboka svarer nesten med en gang. Til gjengjeld må vi ha plass til notatboka.",
        "n runder med forventet O(1) oppslag og innsetting gir forventet O(n). Prisen er O(n) ekstra minne til hashmapet.",
        "Med n operasjoner som hver er forventet O(1), blir totalen forventet O(n). Hvis alt havner i samme bøtte, kan én operasjon koste O(n), og totalen O(n²), men det regner vi ikke med i praksis. På eksamen: skriv «jeg antar forventet konstant tid for innsetting og oppslag i hashbaserte datastrukturer»."
      )
    }
  });

  IN.gen.findDupHash = IN.gen.findDupHash || function (arr) {
    var A = clone(arr), n = A.length, steps = [], H = {}, order = [], ops = 0;
    function mapView() { return order.map(function (v) { return [v, H[v]]; }); }
    function snap(line, marks, p, text, tag, newKey) {
      steps.push({ line: line, array: clone(A), marks: marks, ptrs: p, dim: range(0, (p.i == null ? n : p.i) - 1),
        map: mapView(), mapNew: newKey, info: [["oppslag + innsettinger", ops]], text: text, tag: tag });
    }
    snap(2, {}, {}, t("Notatboka er tom.", "H er tomt.", "H ← tomt hashmap."), "Start");
    for (var i = 0; i < n; i++) {
      var v = A[i]; ops++;
      var seen = Object.prototype.hasOwnProperty.call(H, v);
      snap(4, { compare: [i] }, { i: i }, t("Har vi sett " + v + " før?" + (seen ? " Ja!" : " Nei."), v + " ∈ H? " + (seen ? "Ja." : "Nei."), "Oppslag på nøkkel " + v + ": " + (seen ? "finnes, på indeks " + H[v] + "." : "finnes ikke.")), "Har jeg sett den?");
      if (seen) {
        snap(5, { sorted: [H[v], i] }, { i: i }, t("Vi så " + v + " på plass " + H[v] + ", og nå igjen på plass " + i + ".", "print(" + H[v] + ", " + i + ").", "Utskrift (" + H[v] + ", " + i + ") etter " + (i + 1) + " av " + n + " elementer."), "Funnet");
        return steps;
      }
      ops++; H[v] = i; order.push(v);
      snap(7, { target: i }, { i: i }, t("Vi skriver «" + v + " → plass " + i + "» i notatboka.", "H[" + v + "] ← " + i + ".", "Innsetting " + v + " → " + i + "."), "Husk", v);
    }
    steps.push({ line: null, array: clone(A), marks: {}, ptrs: {}, map: mapView(), info: [["oppslag + innsettinger", ops]], text: t("Ingen tall kom igjen.", "Ingen duplikat.", "Ingen duplikat: forutsetningen gjelder ikke."), tag: "Ingen" });
    return steps;
  };

  /* ===================== FINN k MINSTE (H2025) ===================== */
  reg(IN.algos, "algos", "findMinKSelect", {
    title: "Finn k minste (a): k runder med «finn minste»",
    name: "FindMin", params: "A, k",
    input: "Et array A med n sammenlignbare elementer og et heltall k med 1 ≤ k ≤ n",
    output: "De k minste elementene, som A[0..k − 1]",
    lines: [
      { code: "for i ← 0 to k − 1 do", indent: 1,
        eli5: "Vi gjør det samme k ganger: plukker det minste tallet som er igjen.",
        normal: "k runder – én for hvert av de k minste.",
        teknisk: "Som Selection sort, men vi stopper etter k runder i stedet for n − 1. Invariant: A[0..i − 1] er de i minste, i sortert rekkefølge.",
        grense: { q: "Hvorfor k − 1 og ikke k?", a: t("Vi teller rundene fra 0. Da er runde 0, 1, …, k − 1 akkurat k runder.", "0 to k − 1 gir nøyaktig k runder, én per element vi skal finne.", "Med «to k» ville vi tatt k + 1 runder og hentet ett element for mye (og lest utenfor arrayet når k = n).") } },
      { code: "m ← i", indent: 2,
        eli5: "Vi later som det første tallet som er igjen, er det minste.",
        normal: "Kandidat for minste i resten.",
        teknisk: "m er indeksen til minste element sett så langt i A[i..n − 1]." },
      { code: "for j ← i + 1 to n − 1 do", indent: 2,
        eli5: "Så ser vi på alle de andre tallene som er igjen.",
        normal: "Skann resten av arrayet.",
        teknisk: "n − 1 − i sammenligninger i runde i. Over k runder blir det omtrent k·n.",
        grense: { q: "Hvorfor starte på i + 1?", a: t("Tallet på plass i er allerede kandidaten vår. Vi sammenligner med dem etter det.", "A[i] er startkandidaten (m = i). Å sammenligne den med seg selv er unødvendig.", "Plassene 0..i − 1 er alt plukket ut, og A[i] er kandidaten. Start på i + 1 gir n − 1 − i sammenligninger i runde i.") } },
      { code: "if A[j] < A[m] then", indent: 3,
        eli5: "Er dette tallet enda mindre?",
        normal: "Fant vi et mindre element?",
        teknisk: "Én sammenligning – det er disse vi teller." },
      { code: "m ← j", indent: 4,
        eli5: "Da husker vi det i stedet.",
        normal: "Oppdater kandidaten.",
        teknisk: "Vi har funnet et mindre element, så m peker nå på den minste vi har sett i denne runden." },
      { code: "swap A[i] and A[m]", indent: 2,
        eli5: "Vi flytter det minste tallet fram til plass i, så vi ikke plukker det igjen.",
        normal: "Flytt minste fram, så det ikke velges på nytt.",
        teknisk: "Byttet sørger for at elementer vi alt har plukket, aldri blir med i neste skann. Det håndterer også like verdier riktig." },
      { code: "return A[0..k − 1]", indent: 1,
        eli5: "De k første plassene inneholder nå de k minste tallene.",
        normal: "Returner de k første.",
        teknisk: "Totalt O(k·n). For k = 1 er dette O(n), for k = n er det O(n²)." }
    ],
    bigO: {
      best: "O(k·n)", avg: "O(k·n)", worst: "O(k·n)", space: "O(1)",
      why: t(
        "For hvert av de k tallene må vi lete gjennom alle som er igjen. Mange tall og stor k gir mye leting.",
        "k runder, og hver runde skanner opptil n elementer: O(k·n). Arbeidet er det samme uansett input.",
        "Runde i gjør n − 1 − i sammenligninger, så totalen er (n − 1) + (n − 2) + … + (n − k). Summen starter på n − 1 og ikke n fordi første runde sammenligner kandidaten med de n − 1 andre. Hvert ledd er høyst n, og det er k ledd, så totalen er høyst k·n. Det avhenger ikke av hvordan input ser ut, derfor er best, snitt og verst like. Bra når k er liten, dårlig når k nærmer seg n."
      )
    }
  });

  IN.gen.findMinKSelect = IN.gen.findMinKSelect || function (input) {
    var s = split(input, 1), A = clone(s.A), n = A.length, k = Math.max(1, Math.min(n, s.p[0])), steps = [], cmp = 0;
    function snap(line, marks, p, text, tag, rnd) { steps.push({ line: line, array: clone(A), marks: marks, ptrs: p, info: [["k", k], ["runde", rnd], ["sammenligninger", cmp]], text: text, tag: tag }); }
    for (var i = 0; i < k; i++) {
      var m = i, done = range(0, i - 1);
      snap(3, { sorted: done, min: m }, { i: i }, t("Runde " + (i + 1) + ": vi later som " + A[i] + " er minst av dem som er igjen.", "m ← " + i + " (A[m] = " + A[m] + ").", "Runde " + (i + 1) + " av " + k + ": skann A[" + i + ".." + (n - 1) + "]."), "Runde " + (i + 1), i + 1);
      for (var j = i + 1; j < n; j++) {
        cmp++;
        var less = A[j] < A[m];
        snap(5, { sorted: done, min: m, compare: [j] }, { i: i, j: j }, t("Er " + A[j] + " mindre enn " + A[m] + "?" + (less ? " Ja." : " Nei."), "A[" + j + "] &lt; A[m]? " + (less ? "Ja." : "Nei."), "Sammenligning nr. " + cmp + "."), "Sammenlign", i + 1);
        if (less) { m = j; snap(6, { sorted: done, min: m }, { i: i, j: j }, t("Nå er " + A[m] + " det minste vi har sett.", "m ← " + j + ".", "Ny kandidat m = " + j + "."), "Ny minste", i + 1); }
      }
      snap(7, { sorted: done, swap: [i, m] }, { i: i }, t("Vi flytter " + A[m] + " fram til plass " + i + ".", "swap A[" + i + "] and A[" + m + "].", "A[" + i + "] blir det " + (i + 1) + ". minste."), "Bytte", i + 1);
      var tmp = A[i]; A[i] = A[m]; A[m] = tmp;
    }
    steps.push({ line: 8, array: clone(A), marks: { sorted: range(0, k - 1) }, ptrs: {}, info: [["k", k], ["sammenligninger", cmp]],
      text: t("De " + k + " minste tallene står nå først: " + A.slice(0, k).join(", ") + ".", "return A[0.." + (k - 1) + "] = " + A.slice(0, k).join(", ") + ".", "Ferdig etter " + nn(cmp, "sammenligning", "sammenligninger") + ", omtrent k·n = " + (k * n) + "."), tag: "Ferdig" });
    return steps;
  };

  reg(IN.algos, "algos", "findMinKSort", {
    title: "Finn k minste (b): sorter alt",
    name: "FindMin", params: "A, k",
    input: "Et array A med n sammenlignbare elementer og et heltall k med 1 ≤ k ≤ n",
    output: "En liste med de k minste elementene",
    lines: [
      { code: "B ← MergeSort(A)", indent: 1,
        eli5: "Vi stiller alle tallene i rekkefølge fra minst til størst.",
        normal: "Sorter hele arrayet med Merge sort.",
        teknisk: "Merge sort er O(n log n) også i verste tilfelle. Quicksort kan bli O(n²) i verste tilfelle, og ga derfor lavere uttelling i 2025." },
      { code: "return B[0..k − 1]", indent: 1,
        eli5: "Så tar vi de k første – de er de minste.",
        normal: "De k første i sortert rekkefølge er de k minste.",
        teknisk: "Å kopiere ut k elementer er O(k), som forsvinner i O(n log n).",
        grense: { q: "Hvorfor k − 1 og ikke k?", a: t("De k første plassene er 0, 1, …, k − 1.", "B[0..k − 1] inneholder nøyaktig k elementer.", "Med 0-indeksering er de k første B[0], …, B[k − 1]. B[0..k] ville vært k + 1 elementer.") } }
    ],
    bigO: {
      best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)",
      why: t(
        "Vi sorterer alle tallene, selv om vi bare trenger noen få. Det er litt bortkastet, men enkelt.",
        "Sorteringen dominerer: O(n log n) + O(k) = O(n log n). Merge sort bruker O(n) ekstra minne.",
        "Det tregeste leddet styrer veksten: O(n log n) for sorteringen pluss O(k) for å plukke ut er O(n log n). Vi gjør mer enn nødvendig, fordi vi også sorterer de n − k elementene vi ikke trenger."
      )
    }
  });

  reg(IN.algos, "algos", "findMinKHeap", {
    title: "Finn k minste (c): BuildMinHeap + k × removeMin",
    name: "FindMin", params: "A, k",
    input: "Et array A med n sammenlignbare elementer og et heltall k med 1 ≤ k ≤ n",
    output: "Et array R med de k minste elementene, i stigende rekkefølge",
    lines: [
      { code: "H ← BuildMinHeap(A)", indent: 1,
        eli5: "Vi bygger en «hvem er minst?»-pyramide av alle tallene. Det minste havner alltid på toppen.",
        normal: "Bygg en heap av hele A på lineær tid.",
        teknisk: "BuildMinHeap bygger heapen nedenfra i O(n), raskere enn n innsettinger på O(log n) hver." },
      { code: "R ← new Array(k)", indent: 1,
        eli5: "Vi lager en tom rad med k plasser til svaret.",
        normal: "Plass til k svar.",
        teknisk: "O(k) ekstra minne til resultatet." },
      { code: "for i ← 0 to k − 1 do", indent: 1,
        eli5: "Vi gjør det samme k ganger.",
        normal: "k runder.",
        teknisk: "Én runde per element vi skal hente ut, altså k uttak fra heapen." },
      { code: "R[i] ← removeMin(H)", indent: 2,
        eli5: "Vi tar tallet på toppen (det minste). Pyramiden rydder seg selv så et nytt minste kommer på toppen.",
        normal: "Ta ut minste element og legg det i svaret.",
        teknisk: "removeMin koster O(log n) fordi heapen må repareres nedover høyden. k uttak gir O(k log n)." },
      { code: "return R", indent: 1,
        eli5: "Nå har vi de k minste tallene, i rekkefølge.",
        normal: "Returner de k minste.",
        teknisk: "Totalt O(n + k log n). Når k er liten sammenlignet med n, er dette nesten lineært." }
    ],
    bigO: {
      best: "O(n + k log n)", avg: "O(n + k log n)", worst: "O(n + k log n)", space: "O(n)",
      why: t(
        "Å bygge pyramiden går ganske fort, og å plukke de k minste fra toppen tar bare litt tid for hvert tall.",
        "BuildMinHeap er O(n), og hvert av de k uttakene er O(log n). Til sammen O(n + k log n).",
        "Summen av to ledd: O(n) for byggingen og k ganger O(log n) for uttakene. For liten k dominerer n-leddet. For k = n blir det O(n log n), altså Heapsort. Heapen trenger O(n) plass (eller kan bygges i selve A)."
      )
    }
  });

  /* Operasjonsteller: sammenligninger for alle tre tilnærmingene på samme input. */
  IN.sok.countKSmallest = function (arr, k) {
    var n = arr.length, c;
    // (a) k × finn minste
    var A = arr.slice(); c = 0;
    for (var i = 0; i < k; i++) { var m = i; for (var j = i + 1; j < n; j++) { c++; if (A[j] < A[m]) m = j; } var tp = A[i]; A[i] = A[m]; A[m] = tp; }
    var a = c;
    // (b) Merge sort
    c = 0;
    (function ms(X) {
      if (X.length <= 1) return X;
      var h = X.length >> 1, L = ms(X.slice(0, h)), R = ms(X.slice(h)), out = [], p = 0, q = 0;
      while (p < L.length && q < R.length) { c++; if (L[p] <= R[q]) out.push(L[p++]); else out.push(R[q++]); }
      while (p < L.length) out.push(L[p++]); while (q < R.length) out.push(R[q++]);
      return out;
    })(arr.slice());
    var b = c;
    // (c1) heap av størrelse k med største øverst
    c = 0; var H = [];
    function upMax(x) { while (x > 0) { var p = (x - 1) >> 1; c++; if (H[x] > H[p]) { var s = H[x]; H[x] = H[p]; H[p] = s; x = p; } else break; } }
    function downMax(x, size) { while (true) { var l = 2 * x + 1, r = l + 1, g = x; if (l < size) { c++; if (H[l] > H[g]) g = l; } if (r < size) { c++; if (H[r] > H[g]) g = r; } if (g === x) break; var s = H[x]; H[x] = H[g]; H[g] = s; x = g; } }
    for (i = 0; i < n; i++) {
      if (H.length < k) { H.push(arr[i]); upMax(H.length - 1); }
      else { c++; if (arr[i] < H[0]) { H[0] = arr[i]; downMax(0, H.length); } }
    }
    var c1 = c;
    // (c2) BuildMinHeap + k × removeMin
    c = 0; var B = arr.slice(), size = n;
    function downMin(x) { while (true) { var l = 2 * x + 1, r = l + 1, g = x; if (l < size) { c++; if (B[l] < B[g]) g = l; } if (r < size) { c++; if (B[r] < B[g]) g = r; } if (g === x) break; var s = B[x]; B[x] = B[g]; B[g] = s; x = g; } }
    for (i = (n >> 1) - 1; i >= 0; i--) downMin(i);
    var build = c;
    for (i = 0; i < k; i++) { B[0] = B[size - 1]; size--; downMin(0); }
    return { select: a, merge: b, heapK: c1, buildHeap: c, buildOnly: build };
  };

  /* ===================== ARRAY-TRIKS ===================== */
  reg(IN.algos, "algos", "findSummandsSorted", {
    title: "Par med sum x – sortert (to pekere)",
    name: "FindSummands", params: "A, x",
    input: "Et sortert array A med n unike heltall, og et heltall x",
    output: "Skriver ut alle par (A[i], A[j]) med A[i] + A[j] = x",
    lines: [
      { code: "i ← 0", indent: 1, eli5: "Én finger på det minste tallet …", normal: "Venstre peker på minste element.", teknisk: "i starter i venstre ende." },
      { code: "j ← n − 1", indent: 1, eli5: "… og én finger på det største.", normal: "Høyre peker på største element.", teknisk: "j starter i høyre ende." },
      { code: "while i < j do", indent: 1, eli5: "Så lenge fingrene ikke har møttes …", normal: "Fortsett til pekerne møtes.", teknisk: "Hver runde flytter minst én peker, så løkka kjører høyst n − 1 ganger: O(n).",
        grense: { q: "Hvorfor i < j og ikke i ≤ j?", a: t("Når fingrene peker på samme tall, kan vi ikke lage et par – vi ville brukt samme tall to ganger.", "i = j betyr samme element. Et par krever to ulike posisjoner.", "Med i ≤ j ville vi testet A[i] + A[i], altså brukt samme posisjon to ganger. Et par består av to ulike posisjoner, så det ville vært feil å skrive ut samme tall som begge halvdelene av et par.") } },
      { code: "y ← A[i] + A[j]", indent: 2, eli5: "Vi legger sammen de to tallene.", normal: "Summen av paret.", teknisk: "Summen avgjør hvilken peker vi flytter: for liten → i fram, for stor → j tilbake." },
      { code: "if y < x then", indent: 2, eli5: "Er summen for liten?", normal: "For liten sum?", teknisk: "Da kan A[i] ikke inngå i noe par med noen A[j′] ≤ A[j], så A[i] kan forkastes." },
      { code: "i ← i + 1", indent: 3, eli5: "Da flytter vi venstre finger til et større tall.", normal: "Øk summen: flytt i til høyre.", teknisk: "Neste A[i] er større (sortert), så summen øker." },
      { code: "else if y > x then", indent: 2, eli5: "Er summen for stor?", normal: "For stor sum?", teknisk: "Da kan A[j] ikke inngå i noe par med en A[i′] ≥ A[i]." },
      { code: "j ← j − 1", indent: 3, eli5: "Da flytter vi høyre finger til et mindre tall.", normal: "Minsk summen: flytt j til venstre.", teknisk: "Neste A[j] er mindre, så summen synker." },
      { code: "else", indent: 2, eli5: "Ellers er summen akkurat riktig!", normal: "y = x: treff.", teknisk: "Summen er akkurat x, så A[i] og A[j] er et par. Begge kan nå flyttes innover." },
      { code: "print(A[i], A[j])", indent: 3, eli5: "Vi roper ut paret.", normal: "Skriv ut paret.", teknisk: "Hvert tall brukes i høyst ett par fordi tallene er unike." },
      { code: "i ← i + 1", indent: 3, eli5: "Og flytter videre for å se etter flere par.", normal: "Gå videre.", teknisk: "Vi må flytte en peker for å komme videre. Neste runde vil da senke j." }
    ],
    bigO: {
      best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)",
      why: t(
        "Fingrene går bare mot hverandre, aldri tilbake. Da tar det høyst like mange steg som det er tall.",
        "Hver runde flytter en peker ett hakk innover, så det blir høyst n − 1 runder: O(n). Dette virker bare fordi A er sortert.",
        "Avstanden j − i starter på n − 1 og minker med 1 hver runde, så løkka har O(n) runder med konstant arbeid. Sorteringen er det som gjør det trygt å forkaste et element: vi vet hvilken vei summen går når en peker flyttes."
      )
    }
  });

  IN.gen.findSummandsSorted = IN.gen.findSummandsSorted || function (input) {
    var s = split(input, 1), x = s.p[0];
    var A = clone(s.A).sort(num).filter(function (v, z, a) { return z === 0 || v !== a[z - 1]; });
    var n = A.length, steps = [], pairs = [], found = [], rounds = 0;
    function snap(line, marks, p, text, tag) {
      var m = marks || {}; m.sorted = found.slice();
      steps.push({ line: line, array: clone(A), marks: m, ptrs: p, info: [["x", x], ["runder", rounds], ["par", pairs.length ? pairs.join(" ") : "–"]], text: text, tag: tag });
    }
    var i = 0, j = n - 1;
    snap(3, {}, { i: i, j: j }, t("Én finger på hver ende. Vi leter etter par som blir " + x + " til sammen.", "i ← 0, j ← " + j + ". Mål: sum x = " + x + ".", "To pekere i hver sin ende av det sorterte arrayet. x = " + x + "."), "Start");
    while (i < j) {
      rounds++;
      var y = A[i] + A[j];
      snap(5, { compare: [i, j] }, { i: i, j: j }, t(A[i] + " + " + A[j] + " = " + y + ".", "y = " + A[i] + " + " + A[j] + " = " + y + ".", "Runde " + rounds + ": y = " + y + (y < x ? " &lt; " : y > x ? " &gt; " : " = ") + "x."), "Sum");
      if (y < x) { i++; snap(7, {}, { i: i, j: j }, t("For lite! Venstre finger flytter til et større tall.", "y &lt; x → i ← " + i + ".", "y &lt; x: A[" + (i - 1) + "] kan ikke inngå i noe par, så i øker."), "For lite"); }
      else if (y > x) { j--; snap(9, {}, { i: i, j: j }, t("For mye! Høyre finger flytter til et mindre tall.", "y &gt; x → j ← " + j + ".", "y &gt; x: A[" + (j + 1) + "] kan ikke inngå i noe par, så j minker."), "For mye"); }
      else {
        found.push(i, j); pairs.push("(" + A[i] + "," + A[j] + ")");
        snap(11, {}, { i: i, j: j }, t("Akkurat " + x + "! Paret er (" + A[i] + ", " + A[j] + ").", "print(" + A[i] + ", " + A[j] + ").", "Treff: (" + A[i] + ", " + A[j] + ")."), "Par!");
        i++;
        snap(12, {}, { i: i, j: j }, t("Vi går videre for å se etter flere par.", "i ← " + i + ".", "Flytter i for å fortsette."), "Videre");
      }
    }
    snap(4, {}, {}, t("Fingrene har møttes. Vi fant " + pairs.length + " par.", "i ≥ j → ferdig. " + pairs.length + " par.", "Ferdig etter " + nn(rounds, "runde", "runder") + " (høyst n − 1 = " + (n - 1) + ")."), "Ferdig");
    return steps;
  };

  reg(IN.algos, "algos", "findSummandsHash", {
    title: "Par med sum x – usortert (hashset)",
    name: "FindSummands", params: "A, x",
    input: "Et array A med n unike heltall (ikke sortert), og et heltall x",
    output: "Skriver ut alle par (y, x − y) fra A",
    lines: [
      { code: "S ← new HashSet", indent: 1, eli5: "En tom pose for tallene vi har sett.", normal: "Tomt hashset.", teknisk: "Innsetting, oppslag og sletting er forventet O(1)." },
      { code: "for each y in A do", indent: 1, eli5: "Vi ser på tallene ett og ett.", normal: "Én gjennomgang.", teknisk: "Løkka går n runder, og hver runde gjør forventet konstant arbeid i settet." },
      { code: "if x − y ∈ S then", indent: 2, eli5: "Har vi allerede sett «makkeren» som gjør summen riktig?", normal: "Finnes komplementet x − y blant dem vi har sett?", teknisk: "Komplement-trikset: y + z = x ⇔ z = x − y. Oppslag, forventet O(1)." },
      { code: "print(y, x − y)", indent: 3, eli5: "Ja! Da har vi et par.", normal: "Skriv ut paret.", teknisk: "Komplementet er sett før, så y og x − y er et par." },
      { code: "S.remove(x − y)", indent: 3, eli5: "Vi tar makkeren ut av posen, så den ikke brukes to ganger.", normal: "Fjern komplementet, slik løsningsforslaget gjør.", teknisk: "Med unike tall i A kan x − y uansett bare matches én gang, så fjerningen er strengt tatt ikke nødvendig. Den gjør det tydelig at hvert tall inngår i høyst ett par, og den holder settet lite." },
      { code: "else", indent: 2, eli5: "Ellers har tallet ingen makker ennå. Da …", normal: "Ingen makker ennå:", teknisk: "x − y er ikke i S ennå, så y kan selv bli makker for et senere tall." },
      { code: "S.add(y)", indent: 3, eli5: "… legger vi tallet i posen og går videre.", normal: "Husk y til senere.", teknisk: "Innsetting, forventet O(1)." }
    ],
    bigO: {
      best: "forventet O(n)", avg: "forventet O(n)", worst: "O(n²)", space: "O(n)",
      why: t(
        "Vi går gjennom tallene én gang, og posen svarer nesten med en gang.",
        "n runder med forventet O(1) arbeid gir forventet O(n), uten å sortere.",
        "n hashoperasjoner som hver er forventet O(1) gir forventet O(n). Verste tilfelle (alt i samme bøtte) er O(n²). Vi trenger O(n) minne til settet."
      )
    }
  });

  reg(IN.algos, "algos", "mostFrequent", {
    title: "Mest frekvente element",
    name: "MostFrequent", params: "A",
    input: "Et ikke-tomt array A med n elementer",
    output: "Et element som forekommer flest ganger",
    lines: [
      { code: "C ← new HashMap", indent: 1, eli5: "En tom tellebok. Alle tall starter på 0.", normal: "Hashmap fra verdi til antall, med standardverdi 0.", teknisk: "Standardverdi 0 betyr at C[y] er 0 for en nøkkel vi ikke har sett." },
      { code: "best ← A[0]", indent: 1, eli5: "Vi gjetter at det første tallet er vinneren.", normal: "Foreløpig vinner.", teknisk: "Hvilket som helst element fungerer som startverdi." },
      { code: "for each y in A do", indent: 1, eli5: "Vi går gjennom alle tallene.", normal: "Én gjennomgang.", teknisk: "Løkka går n runder, og hver runde gjør forventet konstant arbeid i hashmapet." },
      { code: "C[y] ← C[y] + 1", indent: 2, eli5: "Vi setter en ny strek for tallet.", normal: "Tell opp.", teknisk: "Oppslag + innsetting, forventet O(1)." },
      { code: "if C[y] > C[best] then", indent: 2, eli5: "Har dette tallet nå flere streker enn vinneren?", normal: "Ny leder?", teknisk: "Vi holder styr på maksimum underveis, så vi slipper en ekstra gjennomgang." },
      { code: "best ← y", indent: 3, eli5: "Da er det den nye vinneren.", normal: "Oppdater vinneren.", teknisk: "y er nå talt flere ganger enn den forrige vinneren, så y tar over." },
      { code: "return best", indent: 1, eli5: "Vinneren er tallet med flest streker.", normal: "Returner vinneren.", teknisk: "Totalt forventet O(n)." }
    ],
    bigO: {
      best: "forventet O(n)", avg: "forventet O(n)", worst: "O(n²)", space: "O(n)",
      why: t(
        "Vi ser på hvert tall én gang og setter en strek i telleboka.",
        "Én gjennomgang med forventet O(1) per telling: forventet O(n). Alternativet er å sortere (O(n log n)) og telle like naboer.",
        "n hashoperasjoner à forventet O(1) gir forventet O(n). Sorter-så-skann gir O(n log n). Begge er bedre enn å telle hvert element med en ny gjennomgang, som blir O(n²)."
      )
    }
  });

  reg(IN.algos, "algos", "commonElements", {
    title: "Felles elementer",
    name: "Common", params: "A, B",
    input: "To arrayer A og B",
    output: "Skriver ut hvert element som finnes i begge (én gang per element)",
    lines: [
      { code: "S ← new HashSet", indent: 1, eli5: "Vi tar fram en tom pose. I den skal vi legge tallene fra A, så vi raskt kan sjekke om et tall er der.", normal: "Tomt hashset.", teknisk: "Forventet O(1) per operasjon." },
      { code: "for each y in A do", indent: 1, eli5: "Alle tallene fra A …", normal: "Gå gjennom A.", teknisk: "|A| runder." },
      { code: "S.add(y)", indent: 2, eli5: "… legger vi i posen.", normal: "Legg y i settet.", teknisk: "Innsetting." },
      { code: "for each z in B do", indent: 1, eli5: "Så ser vi på tallene i B.", normal: "Gå gjennom B.", teknisk: "|B| runder." },
      { code: "if z ∈ S then", indent: 2, eli5: "Ligger tallet også i posen?", normal: "Finnes z i A?", teknisk: "Oppslag, forventet O(1)." },
      { code: "print(z)", indent: 3, eli5: "Ja – da er det felles!", normal: "Skriv ut.", teknisk: "z finnes i A og i B. Vi fjerner z fra settet på neste linje, så et felles tall skrives ut bare én gang." },
      { code: "S.remove(z)", indent: 3, eli5: "Vi tar det ut av posen, så vi ikke roper det ut to ganger.", normal: "Unngå dobbel utskrift.", teknisk: "Fjerner z så duplikater i B ikke skrives ut igjen." }
    ],
    bigO: {
      best: "forventet O(|A| + |B|)", avg: "forventet O(|A| + |B|)", worst: "O(|A|·(|A| + |B|))", space: "O(|A|)",
      why: t(
        "Vi ser på hvert tall én gang i hver liste.",
        "Én gjennomgang av hver: forventet O(|A| + |B|). Med to nøstede løkker ville det blitt O(|A|·|B|).",
        "Alle operasjonene på settet er forventet O(1), så vi får forventet lineær tid i den samlede størrelsen. I verste fall (alt i samme bøtte) koster hver operasjon lineær tid i settets størrelse, altså O(|A|·(|A| + |B|)) totalt. Alternativ uten hashing: sorter begge og gå gjennom dem med to pekere, O(|A| log |A| + |B| log |B|)."
      )
    }
  });

  reg(IN.algos, "algos", "isPermutation", {
    title: "Er B en permutasjon av A?",
    name: "IsPermutation", params: "A, B",
    input: "To arrayer A og B",
    output: "true hvis B inneholder nøyaktig de samme elementene som A (like mange av hvert), ellers false",
    lines: [
      { code: "if |A| ≠ |B| then", indent: 1, eli5: "Er listene like lange?", normal: "Ulik lengde kan ikke være en permutasjon.", teknisk: "Rask utsjekk, O(1)." },
      { code: "return false", indent: 2, eli5: "Nei – da er svaret nei.", normal: "Returner false.", teknisk: "Ulik lengde kan aldri være en permutasjon, så vi svarer med en gang." },
      { code: "C ← new HashMap", indent: 1, eli5: "En tom tellebok der alle starter på 0.", normal: "Frekvenstabell med standardverdi 0.", teknisk: "C[y] = (antall y i A) − (antall y i B) så langt." },
      { code: "for each y in A do", indent: 1, eli5: "For hvert tall i A …", normal: "Tell opp elementene i A.", teknisk: "Løkka går n runder og øker en teller i hashmapet hver gang, forventet O(1) per runde." },
      { code: "C[y] ← C[y] + 1", indent: 2, eli5: "… setter vi en strek.", normal: "Øk telleren.", teknisk: "Forventet O(1)." },
      { code: "for each z in B do", indent: 1, eli5: "For hvert tall i B …", normal: "Tell ned for B.", teknisk: "Løkka går n runder. Er B en permutasjon av A, ender alle tellerne på 0." },
      { code: "C[z] ← C[z] − 1", indent: 2, eli5: "… visker vi ut en strek.", normal: "Minsk telleren.", teknisk: "Forventet O(1)." },
      { code: "if C[z] < 0 then", indent: 2, eli5: "Visket vi ut flere streker enn det fantes?", normal: "B har flere z-er enn A?", teknisk: "Siden lengdene er like, må alt gå i null til slutt. Blir noe negativt, er svaret nei.",
        grense: { q: "Hvorfor C[z] < 0 og ikke C[z] ≠ 0?", a: t("Midt i tellingen kan det fortsatt være streker igjen som visker seg ut senere. Bare når vi har visket ut for mange, vet vi at det er feil.", "Underveis kan C[z] være positiv uten at noe er galt. Negativ betyr at B har flere z-er enn A.", "En positiv teller midt i andre løkke kan gå i null senere. Bare en negativ teller er et sikkert brudd. Siden |A| = |B|, er alle tellere 0 hvis ingen blir negative.") } },
      { code: "return false", indent: 3, eli5: "Da er det ikke de samme tallene.", normal: "Returner false.", teknisk: "B har flere z-er enn A. Da kan svaret aldri bli ja, så vi stopper med en gang." },
      { code: "return true", indent: 1, eli5: "Alle strekene gikk opp – samme tall!", normal: "Returner true.", teknisk: "Like lengder og ingen negative tellere ⇒ alle tellere er 0." }
    ],
    bigO: {
      best: "O(1)", avg: "forventet O(n)", worst: "O(n²)", space: "O(n)",
      why: t(
        "Vi teller tallene i den ene lista og «teller ned» med den andre. Hvert tall ser vi på én gang.",
        "To gjennomganger med forventet O(1) per telling: forventet O(n). Alternativ: sorter begge (O(n log n)) og sammenlign plass for plass.",
        "2n hashoperasjoner gir forventet O(n). Best O(1) når lengdene er ulike. Sorter-begge-varianten er O(n log n) og trenger ikke hashing."
      )
    }
  });
})();
