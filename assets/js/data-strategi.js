/* ============================================================
   IN2010 guide · data-strategi.js  (Blokk 7 · Strategi)
   Pseudokode med nivåstyrte linjeforklaringer (kodearketyper,
   SumTo i tre varianter, verifikator, reduksjon, subanagram)
   og drilloppgavene «Hva er kjøretiden?» på IN.strategi.DRILL.
   Klassisk script. Lastes etter core.js og pseudocode.js.
   Registrerer på IN.algos uten å overskrive eksisterende nøkler.
   All prosa er egen formulering (parafrasert fra kursmateriale).
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.algos = IN.algos || {};
  var ST = (IN.strategi = IN.strategi || {});

  function t(eli5, normal, teknisk) { return { eli5: eli5, normal: normal, teknisk: teknisk }; }
  function reg(obj, key, val) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (window.console && console.warn) console.warn("data-strategi.js: «" + key + "» finnes fra før og beholdes.");
      return;
    }
    obj[key] = val;
  }

  /* Felles grenseforklaring for halveringsløkka */
  var HALVGRENSE = { q: "Hvorfor i > 0 og ikke i ≥ 0?",
    a: t("Når i har blitt 0, blir halvparten fortsatt 0. Hadde vi fortsatt så lenge i er 0 eller mer, hadde vi halvert null for alltid.",
         "⌊0/2⌋ = 0, så i blir aldri negativ. Med i ≥ 0 er betingelsen alltid sann, og løkka stopper aldri. Med i > 0 stopper den rett etter at i har nådd 0.",
         "Løkka må ha en betingelse som faktisk blir usann. i synker strengt så lenge i > 0, og ⌊i/2⌋ = 0 når i = 1, så løkka går ⌊log n⌋ + 1 ganger for n ≥ 1. Med ≥ ville 0 vært et fast punkt, og løkka ville gått evig.") };

  /* ============================================================
     KODEARKETYPER – én per kompleksitetsklasse
     ============================================================ */
  reg(IN.algos, "stConstant", {
    title: "Konstant tid", name: "Constant", params: "n",
    input: "Et heltall n", output: "3 · n",
    lines: [
      { code: "return n · 3", indent: 1,
        eli5: "Ett regnestykke, uansett hvor stort tallet er. Like raskt for 2 som for to millioner.",
        normal: "Én multiplikasjon og én retur. Antall steg avhenger ikke av n.",
        teknisk: "Kurset regner aritmetikk på tall som ett steg. Et fast antall steg gir O(1)." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("Det er like mye arbeid hver gang.", "Et fast antall steg, uavhengig av n.", "Antall primitive steg er en konstant c, og c ≤ c · 1 for alle n.") }
  });

  reg(IN.algos, "stLog", {
    title: "Logaritmisk tid", name: "Logarithmic", params: "n",
    input: "Et heltall n ≥ 1", output: "Ingenting (vi teller bare runder)",
    lines: [
      { code: "i ← n", indent: 1,
        eli5: "Vi begynner med hele tallet.",
        normal: "Startverdi for telleren.",
        teknisk: "i halveres hver runde, og det er det som gir log n." },
      { code: "while i > 0 do", indent: 1,
        eli5: "Vi fortsetter så lenge det er noe igjen å halvere.",
        normal: "Løkka går til i har blitt 0.",
        teknisk: "Etter r runder er i ≤ n / 2ʳ. Løkka stopper når n / 2ʳ < 1, altså etter omtrent log n runder.",
        grense: HALVGRENSE },
      { code: "i ← ⌊i/2⌋", indent: 2,
        eli5: "Del i to og kast resten, som når du bretter et papir på midten.",
        normal: "Halver i og rund ned.",
        teknisk: "Halvering er nøkkelen: å doble n gir bare én runde ekstra." }
    ],
    bigO: { best: "O(log n)", avg: "O(log n)", worst: "O(log n)", space: "O(1)",
      why: t("Hver runde halverer det som er igjen. Selv en million blir til ingenting på rundt 20 runder.",
             "i halveres hver runde, så løkka går omtrent log n ganger.",
             "Antall runder r er det minste tallet med n / 2ʳ < 1, som er ⌊log n⌋ + 1. Det er O(log n).") }
  });

  reg(IN.algos, "stLinear", {
    title: "Lineær tid", name: "Linear", params: "n",
    input: "Et heltall n", output: "Ingenting",
    lines: [
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Vi tar én runde for hvert tall fra 0 opp til n − 1.",
        normal: "Løkka går n ganger.",
        teknisk: "i tar verdiene 0, 1, …, n − 1: n runder." },
      { code: "Constant(i)", indent: 2,
        eli5: "I hver runde gjør vi bare én liten ting.",
        normal: "O(1) arbeid per runde.",
        teknisk: "n runder · O(1) = O(n)." }
    ],
    bigO: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)",
      why: t("Dobbelt så mange tall gir dobbelt så mange runder.", "n runder med konstant arbeid.", "Σ fra i = 0 til n − 1 av O(1) = O(n).") }
  });

  reg(IN.algos, "stLinLog", {
    title: "Lineæritmisk tid", name: "Linearithmic", params: "n",
    input: "Et heltall n ≥ 1", output: "Ingenting",
    lines: [
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Vi tar én runde for hvert tall.",
        normal: "Ytre løkke: n runder.",
        teknisk: "n runder." },
      { code: "Logarithmic(n)", indent: 2,
        eli5: "I hver runde halverer vi n helt ned til null.",
        normal: "Hver runde kaller en prosedyre som tar O(log n).",
        teknisk: "Et kall koster det prosedyren koster. n · O(log n) = O(n log n)." }
    ],
    bigO: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)",
      why: t("n runder, og hver runde er en liten halveringslek.", "n runder ganger log n arbeid per runde.", "Kostnaden for et kall er kjøretiden til prosedyren som kalles. Her: n · O(log n).") }
  });

  reg(IN.algos, "stQuadratic", {
    title: "Kvadratisk tid", name: "Quadratic", params: "n",
    input: "Et heltall n", output: "Ingenting",
    lines: [
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Én runde for hvert tall …",
        normal: "Ytre løkke: n runder.",
        teknisk: "n runder." },
      { code: "for j ← 0 to n − 1 do", indent: 2,
        eli5: "… og inni hver runde én runde til for hvert tall.",
        normal: "Indre løkke: n runder for hver verdi av i.",
        teknisk: "Den indre løkka avhenger ikke av i, så den går n ganger hver gang." },
      { code: "Constant(i + j)", indent: 3,
        eli5: "Det blir n ganger n små ting.",
        normal: "Kjøres n · n = n² ganger.",
        teknisk: "Nøstede løkker multipliseres: n · n · O(1) = O(n²)." }
    ],
    bigO: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
      why: t("Tenk på et rutenett med n rader og n kolonner. Vi besøker hver rute.", "n runder i ytre løkke, n i indre: n².", "k nøstede løkker som hver går n ganger gir O(nᵏ). Det er polynomiell tid.") }
  });

  reg(IN.algos, "stExp", {
    title: "Eksponentiell tid", name: "Exponential", params: "n",
    input: "Et heltall n ≥ 0", output: "2ⁿ",
    lines: [
      { code: "if n = 0 then return 1", indent: 1,
        eli5: "Er tallet null, svarer vi med en gang.",
        normal: "Basistilfellet stopper rekursjonen.",
        teknisk: "Basistilfellet. Uten det ville kallene aldri stoppe." },
      { code: "return Exponential(n − 1) + Exponential(n − 1)", indent: 1,
        eli5: "Ellers spør vi to hjelpere med et tall som er én mindre. Hver av dem spør to nye hjelpere, og slik fortsetter det.",
        normal: "To rekursive kall på n − 1. Antall kall dobles for hvert nivå.",
        teknisk: "Kalltreet har dybde n og to barn per kall, altså 1 + 2 + 4 + … + 2ⁿ = 2ⁿ⁺¹ − 1 kall. Med O(1) arbeid per kall blir det O(2ⁿ)." }
    ],
    bigO: { best: "O(2ⁿ)", avg: "O(2ⁿ)", worst: "O(2ⁿ)", space: "O(n)",
      why: t("Hver gang n blir én større, dobles arbeidet. Det eksploderer fort.",
             "To kall på n − 1 dobler antall kall for hvert nivå, og det er n nivåer.",
             "Antall kall er 2ⁿ⁺¹ − 1. Kallstakken er bare n + 1 dyp, fordi kallene kjøres ett om gangen, så minnet er O(n).") }
  });

  /* ============================================================
     SUMTO – samme problem, tre algoritmer (O(n²), O(n), O(1))
     ============================================================ */
  var SUMGRENSE = { q: "Hvorfor 1 to n og ikke 0 to n − 1?",
    a: t("Vi skal legge sammen 1, 2, 3 og helt opp til n. Da starter vi på 1 og stopper på n.",
         "Her teller vi tall, ikke array-plasser. «to» tar med sluttverdien, så 1 to n gir nøyaktig tallene 1, 2, …, n. Med 0 to n − 1 ville vi tatt med 0 (som ikke gjør noe) og mistet n.",
         "0-indeksering gjelder arrayer. Når løkkevariabelen er selve tallet som summeres, er 1 to n den naturlige grensen. Begge varianter gir n runder, så kjøretiden er den samme; det er svaret som blir feil.") };

  reg(IN.algos, "stSumTo1", {
    title: "SumTo med dobbel løkke", name: "SumTo1", params: "n",
    input: "Et heltall n ≥ 0", output: "1 + 2 + … + n",
    lines: [
      { code: "s ← 0", indent: 1,
        eli5: "Vi starter med en tom krukke.",
        normal: "Summen starter på 0.",
        teknisk: "O(1)." },
      { code: "for i ← 1 to n do", indent: 1,
        eli5: "For hvert tall fra 1 til n …",
        normal: "Ytre løkke: n runder.",
        teknisk: "i = 1, …, n.",
        grense: SUMGRENSE },
      { code: "for j ← 1 to i do", indent: 2,
        eli5: "… legger vi én klinkekule i krukka, i ganger.",
        normal: "Indre løkke: i runder. Den blir lengre og lengre.",
        teknisk: "Totalt 1 + 2 + … + n = n(n + 1)/2 runder." },
      { code: "s ← s + 1", indent: 3,
        eli5: "Én kule til.",
        normal: "Øk summen med 1.",
        teknisk: "Kjøres n(n + 1)/2 ganger, altså O(n²)." },
      { code: "return s", indent: 1,
        eli5: "Tell kulene i krukka.",
        normal: "Returner summen.",
        teknisk: "O(1)." }
    ],
    bigO: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
      why: t("Vi legger én kule om gangen. Det blir veldig mange kuler.",
             "Den indre løkka går 1, 2, …, n ganger. Summen er n(n + 1)/2, som er O(n²).",
             "1 + 2 + … + n = n(n + 1)/2 (Gauss: par første og siste ledd, hvert par summerer til n + 1). Høyeste ledd er n²/2, og konstanten 1/2 forsvinner i O.") }
  });

  reg(IN.algos, "stSumTo2", {
    title: "SumTo med én løkke", name: "SumTo2", params: "n",
    input: "Et heltall n ≥ 0", output: "1 + 2 + … + n",
    lines: [
      { code: "s ← 0", indent: 1,
        eli5: "Tom krukke igjen.",
        normal: "Summen starter på 0.",
        teknisk: "O(1)." },
      { code: "for i ← 1 to n do", indent: 1,
        eli5: "For hvert tall fra 1 til n …",
        normal: "n runder.",
        teknisk: "n runder.",
        grense: SUMGRENSE },
      { code: "s ← s + i", indent: 2,
        eli5: "… heller vi i hele i kuler på én gang.",
        normal: "Legg til hele i, ikke 1 om gangen.",
        teknisk: "Ett steg per runde: O(n) totalt." },
      { code: "return s", indent: 1,
        eli5: "Ferdig.",
        normal: "Returner summen.",
        teknisk: "O(1)." }
    ],
    bigO: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)",
      why: t("Én runde per tall.", "Én løkke med n runder og O(1) arbeid.", "Vi fjernet den indre løkka ved å legge til i direkte. Samme svar, én faktor n mindre arbeid.") }
  });

  reg(IN.algos, "stSumTo3", {
    title: "SumTo med formel", name: "SumTo3", params: "n",
    input: "Et heltall n ≥ 0", output: "1 + 2 + … + n",
    lines: [
      { code: "return n · (n + 1) / 2", indent: 1,
        eli5: "En lur regel gir svaret med en gang, uten å telle i det hele tatt.",
        normal: "Gauss-formelen gir summen direkte.",
        teknisk: "Tre aritmetiske operasjoner: O(1). Problemet var det samme, men algoritmen er mye bedre." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("Ett regnestykke, uansett hvor stor n er.", "Et fast antall regneoperasjoner.", "Aritmetikk regnes som O(1) i kurset. Moralen: kjøretid hører til algoritmen, ikke problemet.") }
  });

  /* ============================================================
     VERIFIKATOR – Hamiltonsykel (H2020 Oppgave 8a)
     ============================================================ */
  reg(IN.algos, "stType2Verifier", {
    title: "Verifikator for hamiltonsk sykel", name: "Type2Verifier", params: "G, C",
    input: "En urettet graf G = (V, E) og et sertifikat C: et array der hver node i V står nøyaktig én gang",
    output: "JA hvis C er en hamiltonsk sykel i G, ellers NEI",
    lines: [
      { code: "N ← |C|", indent: 1,
        eli5: "Vi teller hvor mange steg det er i forslaget.",
        normal: "N er antall noder i sertifikatet.",
        teknisk: "Oppgaven lover at C inneholder hver node nøyaktig én gang, så N = |V|, og det trenger vi ikke sjekke." },
      { code: "for i ← 0 to N − 1 do", indent: 1,
        eli5: "Vi går gjennom forslaget, ett steg om gangen.",
        normal: "Én runde for hvert par av naboer i sertifikatet, også paret fra siste til første node.",
        teknisk: "N runder, én per kant i den foreslåtte sykelen.",
        grense: { q: "Hvorfor N − 1 og ikke N − 2?",
          a: t("En sykel har like mange kanter som noder. Den siste kanten går tilbake til start, så vi må ta med den også.",
               "En sti gjennom N noder har N − 1 kanter, men en sykel har N. Runden med i = N − 1 sjekker kanten fra den siste noden tilbake til den første. Stopper vi på N − 2, godtar vi en hamiltonsk sti som ikke er en sykel.",
               "Løkka sjekker N kanter: C[0]C[1], …, C[N − 2]C[N − 1] og C[N − 1]C[0]. H2020 trakk 1 poeng for å glemme den lukkende kanten.") } },
      { code: "if {C[i], C[(i + 1) mod N]} ∉ E then", indent: 2,
        eli5: "Finnes det en vei mellom denne byen og den neste i forslaget? Hvis ikke, er forslaget feil.",
        normal: "Sjekk at to nabonoder i sertifikatet har en kant i G. mod N gjør at nabo til den siste er den første.",
        teknisk: "Et kantoppslag er O(1) med nabomatrise og O(grad) med naboliste. mod N lukker sykelen uten et eget spesialtilfelle.",
        grense: { q: "Hvorfor (i + 1) mod N og ikke bare i + 1?",
          a: t("Når vi står på den siste byen, finnes det ingen «neste». Da hopper vi tilbake til den første.",
               "For i = N − 1 er i + 1 = N, som er utenfor arrayet. mod N gjør N til 0, så vi sjekker kanten tilbake til C[0].",
               "(i + 1) mod N er i + 1 for i < N − 1 og 0 for i = N − 1. Det gir alle N kantene i sykelen med én og samme linje.") } },
      { code: "return NEI", indent: 3,
        eli5: "Én manglende vei holder for å si at forslaget ikke virker.",
        normal: "En manglende kant betyr at C ikke er en sykel i G.",
        teknisk: "Verifikatoren svarer bare om dette sertifikatet holder. Den leter aldri etter en annen sykel." },
      { code: "return JA", indent: 1,
        eli5: "Alle veiene fantes. Forslaget er en tur innom alle byene og hjem igjen.",
        normal: "Alle N kantene finnes, og hver node er med én gang: C er en hamiltonsk sykel.",
        teknisk: "Vi har sjekket alle kantene i polynomiell tid. Det er det som viser at problemet er i NP." }
    ],
    bigO: { best: "O(1)", worst: "O(|V| + |E|)", space: "O(1)",
      why: t("Vi sjekker hvert steg i forslaget én gang. Det går fort, selv om det kan være vanskelig å finne et slikt forslag.",
             "N = |V| runder med ett kantoppslag hver. Med naboliste koster oppslaget O(grad), og summen av gradene er 2|E|. Med nabomatrise er det O(|V|).",
             "Hver node står én gang i C, så hver naboliste leses høyst én gang: O(|V| + |E|) med naboliste, O(|V|) med nabomatrise. Begge er polynomielle, og det er alt NP-argumentet trenger.") }
  });

  /* ============================================================
     REDUKSJON – EVEN til ODD
     ============================================================ */
  reg(IN.algos, "stEvenViaOdd", {
    title: "Løs EVEN med en løser for ODD", name: "Even", params: "n",
    input: "Et heltall n (en instans av EVEN)", output: "JA hvis n er et partall, ellers NEI",
    lines: [
      { code: "m ← n + 1", indent: 1,
        eli5: "Vi gjør spørsmålet om: i stedet for «er n et partall?» spør vi «er tallet etter n et oddetall?».",
        normal: "Oversett instansen av EVEN til en instans av ODD. Det tar O(1).",
        teknisk: "Oversettelsen må gå i polynomiell tid og bevare svaret: n er et partall nøyaktig når n + 1 er et oddetall." },
      { code: "return Odd(m)", indent: 1,
        eli5: "Vi spør en venn som bare kan svare på oddetall, og bruker svaret hans direkte.",
        normal: "Svaret på ODD for m er svaret på EVEN for n. JA blir JA, NEI blir NEI.",
        teknisk: "Dette er en reduksjon fra EVEN til ODD: ODD er minst like vanskelig som EVEN. Den motsatte reduksjonen (n ↦ n + 1 igjen) viser at de er like vanskelige." }
    ],
    bigO: { best: "O(1) + Odd", worst: "O(1) + Odd",
      why: t("Omskrivingen er gratis. Resten er jobben til vennen.",
             "Reduksjonen koster O(1). Totalt blir det O(1) pluss det Odd koster.",
             "Generelt: kan A reduseres til B i polynomiell tid, og B løses i polynomiell tid, så løses A i polynomiell tid.") }
  });

  /* ============================================================
     SUBANAGRAM (H2020 Oppgave 7a)
     ============================================================ */
  reg(IN.algos, "stSubanagram1", {
    title: "Subanagram, første forsøk", name: "IsSubanagramOf1", params: "W, S",
    input: "To strenger W og S, med w = |W| og s = |S|",
    output: "true hvis W kan skrives med bokstavene i S (uten å bruke noen to ganger)",
    lines: [
      { code: "r ← copy of W", indent: 1,
        eli5: "Vi tar en kopi av ordet vi skal lage, så vi kan krysse ut bokstaver.",
        normal: "Kopier W. Det koster O(w).",
        teknisk: "Kopiering er lineær i lengden: O(w), én gang." },
      { code: "for c in S do", indent: 1,
        eli5: "Vi går gjennom bokstavene vi har tilgjengelig, én om gangen.",
        normal: "s runder, én per bokstav i S.",
        teknisk: "s runder. Kostnaden per runde avgjør alt." },
      { code: "if c is in r then", indent: 2,
        eli5: "Vi leter gjennom kopien etter den bokstaven. Det kan ta lang tid hvis kopien er lang.",
        normal: "Å sjekke om c er i r betyr å lete gjennom r, som har opptil w tegn: O(w).",
        teknisk: "Oppgaven sier at å sjekke om et element er i et array er lineært. r krymper, men i verste fall (ingen treff) har den fortsatt w tegn." },
      { code: "remove an occurrence of c from r", indent: 3,
        eli5: "Fant vi den, krysser vi den ut.",
        normal: "Fjern én forekomst: også O(w).",
        teknisk: "O(w) per kall, høyst s kall." },
      { code: "return r.length = 0", indent: 1,
        eli5: "Er alle bokstavene krysset ut, kunne vi lage ordet.",
        normal: "W er et subanagram hvis alt i kopien ble brukt opp. Lengden er O(1).",
        teknisk: "O(1)." }
    ],
    bigO: { worst: "O(s · w)", space: "O(w)",
      why: t("For hver bokstav i S leter vi gjennom hele kopien av W.",
             "s runder, og hver runde leter i og fjerner fra r, som har opptil w tegn: O(s · w). Det er verste tilfelle, og det er det oppgaven spør etter.",
             "O(w) for kopien pluss s · O(w) for løkka gir O(w + s · w) = O(s · w) i verste tilfelle. Den lineære kostnaden ligger skjult i hjelpeprosedyrene. (Blir r tom tidlig, går resten av rundene fort, så beste tilfelle er lavere. Sensor spurte bare om verste tilfelle.)") }
  });

  /* ============================================================
     DRILL: «Hva er kjøretiden?»
     Hver oppgave: { id, tag, q, name, params, input, lines:[{code, indent}],
                     answer, options?, why: {eli5, normal, teknisk} }
     ============================================================ */
  ST.OPTIONS = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)"];

  ST.DRILL = [
    { id: "en-lokke", tag: "Løkke", name: "Sum", params: "A", input: "Et array A med n elementer",
      lines: [{ code: "s ← 0", indent: 1 }, { code: "for i ← 0 to |A| − 1 do", indent: 1 }, { code: "s ← s + A[i]", indent: 2 }, { code: "return s", indent: 1 }],
      answer: "O(n)",
      why: t("Vi ser på hvert tall i arrayet én gang og legger det til. Dobbelt så mange tall, dobbelt så mye arbeid.",
             "Løkka går n ganger, og hver runde er ett steg. n · O(1) = O(n).",
             "Antall runder er n, og kroppen er O(1). Linjene utenfor løkka bidrar med O(1). Totalt O(n).") },

    { id: "etter-hverandre", tag: "Sekvens", name: "PrintTwice", params: "A", input: "Et array A med n elementer",
      lines: [{ code: "for i ← 0 to |A| − 1 do", indent: 1 }, { code: "Print(A[i])", indent: 2 }, { code: "for j ← 0 to |A| − 1 do", indent: 1 }, { code: "Print(A[j])", indent: 2 }],
      answer: "O(n)",
      why: t("Først går vi gjennom alle tallene, og så gjør vi det én gang til. To turer er fortsatt bare «gå gjennom alle», ikke «alle mot alle».",
             "Løkkene står etter hverandre, ikke inni hverandre. Da legger vi sammen: n + n = 2n, som er O(n).",
             "Sekvens gir sum, nøsting gir produkt. O(n) + O(n) = O(n), fordi konstanten 2 forsvinner. Se på innrykket før du ganger.") },

    { id: "nostet", tag: "Nøsting", name: "AllPairs", params: "A", input: "Et array A med n elementer",
      lines: [{ code: "for i ← 0 to |A| − 1 do", indent: 1 }, { code: "for j ← 0 to |A| − 1 do", indent: 2 }, { code: "Print(A[i], A[j])", indent: 3 }],
      answer: "O(n²)",
      why: t("Hvert tall skal hilse på hvert tall. Med n tall blir det n ganger n håndtrykk.",
             "Den indre løkka går n ganger for hver av de n rundene i den ytre: n · n = n².",
             "Nøstede løkker multipliseres når den indre ikke avhenger av den ytre: n · n · O(1) = O(n²).") },

    { id: "trekant", tag: "Nøsting", name: "HasDuplicate", params: "A", input: "Et array A med n elementer", q: "Hva er kjøretiden i verste tilfelle?",
      lines: [{ code: "for i ← 0 to |A| − 1 do", indent: 1 }, { code: "for j ← i + 1 to |A| − 1 do", indent: 2 }, { code: "if A[i] = A[j] then return true", indent: 3 }, { code: "return false", indent: 1 }],
      answer: "O(n²)",
      why: t("Hvert tall sammenlignes bare med dem som kommer etter. Det blir omtrent halvparten av alle par, men halvparten av veldig mange er fortsatt veldig mange.",
             "Verste tilfelle er at det ikke finnes duplikater. Da går den indre løkka n − 1, n − 2, …, 1, 0 ganger. Summen er n(n − 1)/2, som er O(n²).",
             "Summen starter på n − 1 (ikke n) fordi j starter på i + 1: for i = 0 er det n − 1 verdier av j. (n − 1) + (n − 2) + … + 0 = n(n − 1)/2. Halveringen er bare en konstant, så det er fortsatt O(n²). I beste tilfelle (like naboer først) er det O(1).") },

    { id: "halvering", tag: "Halvering", name: "Halve", params: "n", input: "Et heltall n ≥ 1", q: "Hva er kjøretiden, uttrykt i n?",
      lines: [{ code: "i ← n", indent: 1 }, { code: "c ← 0", indent: 1 }, { code: "while i > 1 do", indent: 1 }, { code: "i ← ⌊i/2⌋", indent: 2 }, { code: "c ← c + 1", indent: 2 }, { code: "return c", indent: 1 }],
      answer: "O(log n)",
      why: t("Vi deler tallet i to igjen og igjen. 1000 blir 500, 250, 125 … og er nede på 1 etter bare ti runder.",
             "i halveres hver runde, så løkka går omtrent log n ganger. Faktisk returnerer prosedyren nettopp ⌊log n⌋.",
             "Etter r runder er i ≤ n / 2ʳ, og løkka stopper når i ≤ 1. Da er r = ⌊log n⌋. Logaritmen kommer alltid fra at noe halveres (eller dobles) hver runde.") },

    { id: "fast-indre", tag: "Nøsting", name: "AddSmall", params: "A", input: "Et array A med n elementer",
      lines: [{ code: "for i ← 0 to |A| − 1 do", indent: 1 }, { code: "for j ← 0 to 9 do", indent: 2 }, { code: "Print(A[i] + j)", indent: 3 }],
      answer: "O(n)",
      why: t("Inni hver runde gjør vi alltid ti ting, uansett hvor langt arrayet er. Ti er ikke et stort tall som vokser.",
             "Den indre løkka går 10 ganger, ikke n ganger. 10 · n = O(n). To løkker inni hverandre betyr ikke automatisk n².",
             "Den indre løkka har en konstant grense, så kroppen til den ytre løkka er O(1). n · O(1) = O(n). Spør alltid: hva avhenger grensen av?") },

    { id: "lokke-halvering", tag: "Kombinert", name: "LoopHalve", params: "A", input: "Et array A med n elementer",
      lines: [{ code: "for i ← 0 to |A| − 1 do", indent: 1 }, { code: "j ← |A|", indent: 2 }, { code: "while j > 1 do", indent: 2 }, { code: "j ← ⌊j/2⌋", indent: 3 }],
      answer: "O(n log n)",
      why: t("For hvert tall i arrayet halverer vi n ned til 1. Det er n små halveringsleker.",
             "Ytre løkke: n runder. Indre while: log n runder, fordi j halveres. n · log n.",
             "Den indre løkka avhenger ikke av i, så hver ytre runde koster O(log n). n · O(log n) = O(n log n), samme klasse som Merge sort.") },

    { id: "dobling", tag: "Halvering", name: "Double", params: "n", input: "Et heltall n ≥ 1", q: "Hva er kjøretiden, uttrykt i n?",
      lines: [{ code: "i ← 1", indent: 1 }, { code: "while i < n do", indent: 1 }, { code: "i ← 2 · i", indent: 2 }],
      answer: "O(log n)",
      why: t("Vi dobler i hver runde: 1, 2, 4, 8, 16 … Den når en million etter bare 20 runder.",
             "Dobling er halvering baklengs. i er 2ʳ etter r runder, og løkka stopper når 2ʳ ≥ n, altså etter omtrent log n runder.",
             "Løkka stopper ved første r med 2ʳ ≥ n, det vil si r = ⌈log n⌉. Om i dobles eller n halveres, gir det samme O(log n).") },

    { id: "skjult-kall", tag: "Hjelpekall", name: "Common", params: "A, B", input: "To arrayer A og B med n elementer hver. Search(B, x) er rett-frem søk (lineært) i B",
      lines: [{ code: "for x ∈ A do", indent: 1 }, { code: "if Search(B, x) then", indent: 2 }, { code: "Print(x)", indent: 3 }],
      answer: "O(n²)",
      why: t("Det ser ut som én løkke, men Search må lete gjennom hele B hver gang. Det er en gjemt løkke inni.",
             "Løkka går n ganger, og hvert Search-kall er O(n). n · O(n) = O(n²).",
             "Et kall koster det prosedyren koster. Søk, Contains, Remove og kopiering på arrayer og lister er lineære. Bytt B ut med et hashset, så blir oppslaget forventet O(1) og totalen forventet O(n).") },

    { id: "to-storrelser", tag: "To variabler", name: "Lookup", params: "A, B", input: "Et sortert array A med n elementer og et array B med k elementer",
      lines: [{ code: "for x ∈ B do", indent: 1 }, { code: "if BinarySearch(A, x) then", indent: 2 }, { code: "Print(x)", indent: 3 }],
      options: ["O(log n)", "O(k + n)", "O(k log n)", "O(n log n)", "O(k · n)"],
      answer: "O(k log n)",
      why: t("Vi slår opp hvert av de k tallene i B. Hvert oppslag i det sorterte A går fort, fordi vi halverer hver gang.",
             "k runder, og hvert binærsøk i A er O(log n). k · O(log n) = O(k log n). Her må svaret ha med begge variablene.",
             "Når input har to størrelser, skal kjøretiden uttrykkes i begge. Å kalle alt n gir feil svar, og H2020 trakk poeng for variabler som ikke var definert.") },

    { id: "sorter-forst", tag: "Kombinert", name: "HasDuplicateSorted", params: "A", input: "Et array A med n elementer. Sort er Merge sort",
      lines: [{ code: "Sort(A)", indent: 1 }, { code: "for i ← 0 to |A| − 2 do", indent: 1 }, { code: "if A[i] = A[i + 1] then return true", indent: 2 }, { code: "return false", indent: 1 }],
      answer: "O(n log n)",
      why: t("Først rydder vi tallene i rekkefølge. Det er den tunge jobben. Etterpå holder det å se på naboer, og det går fort.",
             "Merge sort er O(n log n). Løkka etterpå er O(n). O(n log n) + O(n) = O(n log n), fordi det største leddet vinner.",
             "Sekvens gir sum, og summen domineres av det største leddet. Løkka går til |A| − 2 fordi den ser på A[i + 1]; med |A| − 1 ville siste runde lest utenfor arrayet.") },

    { id: "tidlig-retur", tag: "Tilfelle", name: "Find", params: "A, x", input: "Et array A med n elementer og et tall x", q: "Hva er kjøretiden i verste tilfelle?",
      lines: [{ code: "for i ← 0 to |A| − 1 do", indent: 1 }, { code: "if A[i] = x then return i", indent: 2 }, { code: "return −1", indent: 1 }],
      answer: "O(n)",
      why: t("Er vi uheldige, ligger tallet helt bakerst eller ikke i det hele tatt. Da må vi se på alle.",
             "Verste tilfelle er at x ikke finnes: n runder, O(n). Beste tilfelle er at x ligger først: O(1).",
             "Tilfelle og veksttakt er to akser: verste tilfelle er O(n), beste tilfelle O(1). Begge skrives med O. «O betyr verste tilfelle» er feil.") },

    { id: "rek-ett", tag: "Rekursjon", name: "R", params: "n", input: "Et heltall n ≥ 0", q: "Hva er kjøretiden, uttrykt i n?",
      lines: [{ code: "if n ≤ 0 then return 0", indent: 1 }, { code: "return n + R(n − 1)", indent: 1 }],
      answer: "O(n)",
      why: t("Hvert kall ber om hjelp fra ett nytt kall med et tall som er én mindre, helt ned til 0. Det blir n + 1 kall i en kø.",
             "Ett kall per verdi n, n − 1, …, 0: n + 1 kall med O(1) arbeid hver. O(n).",
             "Antall kall ganger arbeid per kall: (n + 1) · O(1) = O(n). Kallstakken blir n + 1 dyp, så minnet er også O(n).") },

    { id: "rek-to", tag: "Rekursjon", name: "F", params: "n", input: "Et heltall n ≥ 0", q: "Hva er kjøretiden, uttrykt i n?",
      lines: [{ code: "if n = 0 then return 1", indent: 1 }, { code: "return F(n − 1) + F(n − 1)", indent: 1 }],
      answer: "O(2ⁿ)",
      why: t("Hvert kall ber om hjelp fra to nye kall. De ber hver om to til … Antall hjelpere dobles for hvert trinn ned.",
             "To kall på n − 1 dobler antall kall for hvert nivå. Med n nivåer blir det omtrent 2ⁿ kall. Eksponentiell tid.",
             "Kalltreet har 2ᵈ kall på dybde d, for d = 0, …, n. Totalt 2ⁿ⁺¹ − 1 kall à O(1): O(2ⁿ). Ett kall og lagre svaret (2 · F(n − 1)) ville gitt O(n).") },

    { id: "rek-halv", tag: "Rekursjon", name: "H", params: "n", input: "Et heltall n ≥ 1", q: "Hva er kjøretiden, uttrykt i n?",
      lines: [{ code: "if n ≤ 1 then return 0", indent: 1 }, { code: "return 1 + H(⌊n/2⌋)", indent: 1 }],
      answer: "O(log n)",
      why: t("Hvert kall gir oppgaven videre med halvparten så stort tall. Det tar ikke mange halveringer før vi er nede på 1.",
             "Ett kall, og tallet halveres hver gang: omtrent log n kall. Samme mønster som rekursivt binærsøk.",
             "Antall kall er dybden i rekursjonen, ⌊log n⌋ + 1, med O(1) arbeid hver: O(log n).") },

    { id: "rek-merge", tag: "Rekursjon", name: "Split", params: "A, low, high", input: "Et array A. Første kall er Split(A, 0, n − 1)",
      lines: [{ code: "if low ≥ high then return", indent: 1 }, { code: "mid ← ⌊(low + high)/2⌋", indent: 1 }, { code: "Split(A, low, mid)", indent: 1 }, { code: "Split(A, mid + 1, high)", indent: 1 }, { code: "for i ← low to high do", indent: 1 }, { code: "Print(A[i])", indent: 2 }],
      answer: "O(n log n)",
      why: t("Vi deler arrayet i to, så hver halvdel i to, og så videre. På hvert trinn ser vi til sammen på alle tallene én gang. Det er log n trinn.",
             "Halvering gir log n nivåer. På hvert nivå dekker kallene til sammen hele arrayet, så løkkene koster O(n) per nivå. O(n) · log n.",
             "Dette er mønsteret til Merge sort: to kall på halvparten pluss lineært arbeid. Nivåer ganger arbeid per nivå: O(log n) · O(n) = O(n log n).") },

    { id: "tre-lokker", tag: "Nøsting", name: "Triples", params: "A", input: "Et array A med n elementer",
      lines: [{ code: "for i ← 0 to |A| − 1 do", indent: 1 }, { code: "for j ← 0 to |A| − 1 do", indent: 2 }, { code: "for k ← 0 to |A| − 1 do", indent: 3 }, { code: "Print(A[i] + A[j] + A[k])", indent: 4 }],
      answer: "O(n³)",
      why: t("Alle mulige trioer av tall. Med n tall blir det n · n · n trioer.",
             "Tre nøstede løkker som hver går n ganger: n³.",
             "k nøstede løkker gir O(nᵏ). Det er fortsatt polynomiell tid, altså en polynomiell algoritme, selv om den er treg.") }
  ];
})();
