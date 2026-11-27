/* ============================================================
   IN2010 guide · perfekt/sok.js
   «Perfekt svar» for eksamensoppgavene om søk (lastes på 02-sok.html,
   etter data-sok.js). Format: plan/gjennomgang/wp0-format.md.
   - svar: vårt eget fullpoengssvar på kursnivå (samme på alle nivåer).
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette
     kilder (forelesning, ukesoppgaver, lærebok) hører hjemme her.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.PERFEKT = IN.PERFEKT || {};

  function L(code, indent) { return { code: code, indent: indent }; }
  // Flere prosedyrer i én blokk (som i sensorveiledningen)
  function combo(algos) {
    var a0 = algos[0], lines = a0.lines.slice();
    algos.slice(1).forEach(function (a) {
      lines.push({ code: "", indent: 0 });
      lines.push({ code: "Procedure " + a.name + "(" + (a.params || "") + ")", indent: 0 });
      lines = lines.concat(a.lines);
    });
    return { name: a0.name, params: a0.params, input: a0.input, output: a0.output, lines: lines };
  }

  /* ---------- H2020 5 · Søk (12 poeng) ---------- */
  IN.PERFEKT["H2020-5"] = {
    type: "eksamen",
    intro: "<p>Først de to som aldri er riktig valg: Intersection2 binærsøker i A uten at A er sortert, så den kan gi feil svar. Intersection4 sorterer på nytt for hver x, og det er aldri lønnsomt. Igjen står Intersection1, O(n · k), og Intersection3, O(n log n + k log n).</p>",
    svar: [
      { del: "(a)", tekst: "<p><b>Intersection1.</b> Med k = 1 er det ett rett-frem søk: O(n). Intersection3 må sortere først: O(n log n).</p>", fasitVerdi: "Intersection1" },
      { del: "(b)", tekst: "<p><b>Intersection1</b> (Intersection3 er like god). Intersection1: O(n · log n). Intersection3: O(n log n + log n · log n) = O(n log n). Samme klasse, og begge gir full uttelling.</p>", fasitVerdi: "Intersection1" },
      { del: "(c)", tekst: "<p><b>Intersection3.</b> O(n log n + n log n) = O(n log n), mot O(n²) for Intersection1.</p>", fasitVerdi: "Intersection3" },
      { del: "(d)", tekst: "<p><b>Intersection3.</b> O(n log n + n² log n) = O(n² log n), mot O(n³) for Intersection1.</p>", fasitVerdi: "Intersection3" }
    ],
    hvorfor: {
      eli5: "<p>Skal du lete etter bare ett navn i en rotete bunke, er det raskest å bla gjennom bunken én gang. Skal du lete etter mange navn, lønner det seg å rydde bunken i alfabetisk rekkefølge først, og så slå opp på midten hver gang.</p>",
      normal: "<p>Skriv kostnaden som forarbeid + k · kostnad per søk, og sett inn k. Rett-frem søk koster n per x. Sortering koster n log n én gang, og deretter log n per x. Når k er liten, vinner Intersection1. Når k vokser forbi log n, vinner Intersection3. Ved k = log n er de like.</p>",
      teknisk: "<p>Intersection1 er O(n · k) og Intersection3 er O(n log n + k log n). De er like når k = log n. For k = 1 dominerer sorteringen i Intersection3. For k = n og k = n² dominerer n · k i Intersection1, mens Intersection3 bare betaler log n per oppslag. Intersection2 er utelukket fordi binærsøk forutsetter sortert input, og Intersection4 gir k · n log n.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020 5",
      fasit: "<p>Intersection2 gir ikke nødvendigvis riktig svar, fordi man kan ikke uten videre anta at input er sortert. Intersection4 gir aldri best kjøretid, fordi å sortere for hver iterasjon er overflødig.</p>" +
        "<p>Det mest interessante tilfellet er der k = log(n). Da er Intersection1 i O(n · k) = O(n log(n)) og Intersection3 er i O(n log(n) + log(n) · k) = O(n log(n) + log(n) · log(n)) = O(n log(n)). Altså er begge svar korrekte, og gir full uttelling.</p>" +
        "<p class=\"small muted\">Vår merking av alternativene sensorveiledningen markerer med blå tekst: (a) Intersection1, (b) Intersection1 og Intersection3, (c) Intersection3, (d) Intersection3.</p>",
      merknad: "Etter analysen lister sensorveiledningen de fire svaralternativene fra Inspera for hver deloppgave og markerer de riktige med blå tekst. Fargen kommer ikke med her, så vi har skrevet de markerte svarene i en egen linje under. Svarene i vårt svar stemmer med markeringen. Poengene per deloppgave står ikke i sensorveiledningen."
    }
  };

  /* ---------- H2023 3 · Finn duplikat (12 poeng) ---------- */
  IN.PERFEKT["H2023-3"] = {
    type: "eksamen",
    svar: [
      {
        del: "(a)",
        tekst: "<p><b>O(log n).</b> Bruk binærsøk, men endret slik at det returnerer <i>indeksen</i> der x står (kursets binærsøk svarer bare true eller false). Binærsøket finner én av de to kopiene. Fordi A er sortert, står den andre rett ved siden av: sjekk venstre nabo, ellers er det høyre nabo. Skriv ut begge posisjonene.</p>",
        kode: "findDupSorted",
        kjoretid: "O(log n)",
        poeng: ["en løsning i logaritmisk tid (opptil 4p). Lineær tid gir opptil 2p", "riktig kjøretid, ellers −1p", "å si at binærsøket må endres til å returnere indeksen, ellers opptil −1p"]
      },
      {
        del: "(b)",
        tekst: "<p><b>O(n).</b> I et sortert array står de to like elementene ved siden av hverandre. Gå gjennom nabopar A[i], A[i + 1] for i fra 0 til n − 2, og skriv ut i og i + 1 ved det første like paret.</p>",
        kode: "findDupScan",
        kjoretid: "O(n)",
        poeng: ["en løsning i lineær tid (opptil 3p)", "riktig kjøretid, ellers −1p"]
      },
      {
        del: "(c)",
        tekst: "<p><b>Forventet O(n)</b> med et hashmap fra verdi til første indeks. For hvert A[i]: finnes verdien allerede som nøkkel, skriver vi ut den lagrede indeksen og i, og stopper. Ellers lagrer vi i. Oppslag og innsetting er O(1) i forventet tid.</p>" +
          "<p>Alternativ i O(n log n): sorter med Merge sort eller Heapsort (Quicksort går også, men si at den er O(n²) i verste tilfelle), finn duplikatverdien med løsningen fra (b), og gå så gjennom det opprinnelige arrayet én gang til og skriv ut de to posisjonene der verdien står. Bucket sort og Radix sort kan ikke brukes, for vi vet bare at elementene kan sammenlignes.</p>",
        kode: "findDupHash",
        kjoretid: "forventet O(n)",
        poeng: ["en løsning i lineær tid (opptil 5p). Lineæritmisk tid gir opptil 4p", "riktig kjøretid, ellers −1p"]
      }
    ],
    hvorfor: {
      eli5: "<p>I (a) vet du hvilket navn du leter etter og at lista er alfabetisk, så du slår opp på midten og ser på naboene. I (b) vet du ikke navnet, men like navn står ved siden av hverandre, så du går langs lista én gang. I (c) står alt hulter til bulter, så du skriver ned hvert navn i en notatbok og ser om du har sett det før.</p>",
      normal: "<p>Hver deloppgave tar bort en antakelse, og svaret bytter verktøy: binærsøk når A er sortert og x er kjent, nabosammenligning når A er sortert men x er ukjent, og hashmap når A er usortert. Hver løsning har kjøretiden sin oppgitt, og (a) sier at binærsøket må returnere indeksen. Det er de to trekkene sensor nevner.</p>",
      teknisk: "<p>(a) bruker at like elementer er naboer i en sortert rekke, så én binærsøkning pluss to naboer gir O(log n). (b) kan ikke binærsøke, fordi vi ikke har noe å sammenligne midten med, men nabopar-skanning gir O(n). (c) mister ordningen, og da gir hashing forventet O(n). Den beste sammenligningsbaserte løsningen er O(n log n).</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2023 3",
      deler: [
        {
          del: "(a)",
          fasit: "<p>Dette kan løses i O(log(n)) ved å bruke et binær søk. Binærsøk presentert på forelesning returnerer true/false, men kan enkelt modifiseres til å returnere indeksen elementet befinner seg på. I konteksten av denne oppgaven kan vi anta at x er i arrayet, og vi kan la algoritmen være udefinert i tilfellet der x ikke er i arrayet.</p>" +
            "<p>Studenten trenger ikke implementere det modifiserte binærsøket, men bør nevne at binærsøket må modifiseres litt.</p><p>Med dette kan algoritmen uttrykkes slik:</p>",
          kode: combo([
            { name: "BinarySearch", params: "A, x", input: "Et ordnet array A og et element x i A", output: "Returner i slik at A[i] = x",
              lines: [L("low ← 0", 1), L("high ← |A| − 1", 1), L("while low ≤ high do", 1), L("i ← ⌊(low + high)/2⌋", 2),
                L("if A[i] = x then", 2), L("return i", 3), L("else if A[i] < x then", 2), L("low ← i + 1", 3),
                L("else if A[i] > x then", 2), L("high ← i − 1", 3)] },
            { name: "FindSortedIndicesOfDuplicate", params: "A, x",
              lines: [L("i ← BinarySearch(A, x)", 1), L("print(i)", 1), L("if 0 < i and A[i - 1] = x then", 1), L("print(i − 1)", 2),
                L("if i < n − 1 and A[i + 1] = x then", 1), L("print(i + 1)", 2)] }
          ]),
          kriterier: "<p>Oppgaven kan også løses ved å løpe gjennom arrayet frem til x, og printe posisjonen og posisjonen etter.</p>" +
            "<ul><li>Opptil 4 poeng for en løsning i logaritmisk tid.</li><li>Opptil 2 poeng for en løsning i lineær tid.</li>" +
            "<li>Det trekkes 1 poeng for feil (eller ikke oppgitt) kjøretidskompleksitet.</li>" +
            "<li>Det trekkes opptil 1 poeng for å ikke nevne at binærsøket må modifiseres.</li>" +
            "<li>Det gis ingen poeng for løsninger over lineær tid.</li></ul>"
        },
        {
          del: "(b)",
          fasit: "<p>Denne oppgaven løses best på lineær tid, og bør være ganske rett frem.</p>",
          kode: { name: "FindSortedDuplicateIndices", params: "A",
            input: "Et sortert array A med n sammenlignbare elementer", output: "Skriver ut de to posisjonene 0 ≤ i < j < n hvor A[i] = A[j]",
            lines: [L("for i ← 0 to n − 2 do", 1), L("if A[i] = A[i + 1] then", 2), L("print(i)", 3), L("print(i + 1)", 3), L("return", 3)] },
          kriterier: "<ul><li>Opptil 3 poeng for en løsning i lineær tid.</li><li>Det trekkes 1 poeng for feil (eller ikke oppgitt) kjøretidskompleksitet.</li><li>Opptil 1 poeng for løsninger over lineær tid.</li></ul>"
        },
        {
          del: "(c)",
          fasit: "<p>Dette kan også løses på (amortisert og forventet) lineær tid ved å bruke et hash map eller et hash set. Studenten kan anta at disse datastrukturene har konstant tid på de relevante operasjonene (altså kreves det ingen bemerkning om amortisert eller forventet kjøretidskompleksitet).</p>",
          kode: { name: "FindSortedDuplicateIndices", params: "A",
            input: "Et sortert array A med n sammenlignbare elementer", output: "Skriver ut de to posisjonene 0 ≤ i < j < n hvor A[i] = A[j]",
            lines: [L("firstSeen ← empty hash map", 1), L("for i ← 0 to n − 1 do", 1), L("x ← A[i]", 2), L("if x is a key in firstSeen then", 2),
              L("print(firstSeen[x])", 3), L("print(i)", 3), L("return", 3), L("firstSeen[x] ← i", 2)] },
          kriterier: "<p>Den kan løses i lineæritmisk tid ved å sortere med en god sammenligningsbasert sorteringsalgoritme. Merge sort og Heapsort er gode valg. Quicksort er også et godt valg (men bør også nevnes at den strengt tatt er kvadratisk i verste tilfelle). Bucket- og Radix sort kan ikke brukes her, siden alt vi vet om elementene er at de er sammenlignbare.</p>" +
            "<p>Etter sortering kan verdien av duplikatet finnes på lineær tid ved å bruke løsningen fra forrige deloppgave. Deretter kan arrayet løpes over nok en gang, og skrive ut de posisjonene duplikatet befinner seg på.</p>" +
            "<p>Oppgaven kan også løses i kvadratisk tid ved å sammenligne hvert element med alle de andre.</p>" +
            "<ul><li>Opptil 5 poeng for en løsning på lineær tid.</li><li>Opptil 4 poeng for en løsning i lineæritmisk tid.</li><li>Opptil 1 poeng for høyere enn lineæritmisk tid.</li><li>Det trekkes 1 poeng for feil (eller ikke oppgitt) kjøretidskompleksitet.</li></ul>"
        }
      ],
      merknad: "I (a) står de to prosedyrene i én kodeblokk her, mens sensorveiledningen har teksten mellom dem. I (c) har sensors kode overskriften «Input: Et sortert array …» og navnet FindSortedDuplicateIndices (sic). Arrayet er ikke sortert i (c), og prosedyren heter FindDuplicateIndices i oppgaveteksten."
    }
  };

  /* ---------- H2025 6 · Finn k minste (12 poeng) ---------- */
  IN.PERFEKT["H2025-6"] = {
    type: "eksamen",
    intro: "<p>En løsning på (c) er også en løsning på (a) og (b), fordi en raskere algoritme oppfyller de svakere kravene. Skriver du det, får du full uttelling for alle tre.</p><p>Oppgaven ber om en liste. Koden her gir et array. Det trekker ikke alene, men sensor kan trekke for det sammen med andre unøyaktigheter. Vil du være helt trygg, start med <code>list ← an empty list</code> og bruk <code>append</code>.</p>",
    svar: [
      {
        del: "(a)",
        tekst: "<p><b>O(k · n):</b> gjør de k første rundene av Selection sort. I runde i finner vi minste element i A[i..n − 1] og bytter det fram til plass i. Byttet sørger for at et element som alt er valgt, ikke blir valgt igjen, også når to elementer er like. Svaret er A[0..k − 1].</p>",
        kode: "findMinKSelect",
        kjoretid: "O(k · n)",
        poeng: ["en løsning i O(k · n) (inntil 3p)", "å se bort fra elementer som allerede er valgt, ellers −1p", "å håndtere like elementer, ellers −1p"]
      },
      {
        del: "(b)",
        tekst: "<p><b>O(n log n):</b> sorter A med Merge sort, som er O(n log n) også i verste tilfelle, og ta de k første.</p>",
        kode: "findMinKSort",
        kjoretid: "O(n log n)",
        poeng: ["en korrekt løsning (inntil 4p)", "Quicksort gir inntil 3p, fordi den er O(n²) i verste tilfelle", "en kvadratisk sortering gir inntil 1p"]
      },
      {
        del: "(c)",
        tekst: "<p><b>O(n + k log n):</b> bygg en min-heap av hele A med BuildMinHeap på O(n), og ta ut minste element k ganger, O(log n) hver.</p>" +
          "<p>Eller <b>O(n log k):</b> hold de k minste hittil i en max-heap av størrelse k. For hvert av de resterende elementene: er det mindre enn toppen, bytter det ut toppen. Til slutt inneholder heapen de k minste.</p>",
        kode: "findMinKHeap",
        kjoretid: "O(n + k log n) eller O(n log k)",
        poeng: ["en korrekt løsning i O(n log k) eller O(n + k log n) (inntil 5p)"]
      }
    ],
    hvorfor: {
      eli5: "<p>Du kan finne den minste, så den nest minste, og så videre k ganger. Du kan stille opp alle i rekkefølge og ta de k første. Eller du kan bruke en heap, som alltid har den minste klar på toppen, og ta fra toppen k ganger.</p>",
      normal: "<p>Hver løsning treffer kravet sitt: k runder med Selection sort gir k · n, Merge sort gir n log n i verste tilfelle (Quicksort gjør ikke det), og en heap gir n + k log n. Detaljene sensor trekker for, er med: elementer som alt er valgt, velges ikke igjen, og like elementer håndteres.</p>",
      teknisk: "<p>(a) er k ytre runder à O(n). (b) er O(n log n) for sorteringen og O(k) for uttaket. (c): BuildMinHeap er O(n), og k removeMin à O(log n) gir O(n + k log n). Med en max-heap av størrelse k koster hvert av de n elementene O(log k), altså O(n log k).</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2025 6",
      deler: [
        {
          del: "(a)",
          fasit: "<p>Merk at et korrekt svar på deloppgave (c) også er et korrekt svar på (a) og (b). Dermed kan man få full uttelling dersom man oppgir at svaret på (c) også er et svar på (a) og (b).</p>" +
            "<p>Merk igjen at output for algoritmene under er en liste, men det er en liten detalj som ikke er vesentlig for algoritmene. Vi trekker ikke poeng for dette alene, men det kan være med på å trekke i samspill med andre unøyaktigheter.</p>" +
            "<p>En naturlig algoritme i O(k · n) er å finne det minste elementet, deretter finne det nest minste, og så videre, k ganger. En annen måte å se på det er å gjøre k iterasjoner av SelectionSort. Løsningen under er utledet fra SelectionSort.</p>",
          kode: { name: "FindMin", params: "A, k",
            lines: [L("list ← an empty list", 1), L("for i ← 0 to k do", 1), L("m ← i", 2), L("for j ← i + 1 to n − 1 do", 2),
              L("if A[j] < A[m] then", 3), L("m ← j", 4), L("append A[m] to list", 2), L("A[i], A[m] ← A[m], A[i]", 2), L("return list", 1)] },
          kriterier: "<ul><li>Inntil 3 poeng for en løsning i O(k · n).</li><li>Trekk 1 poeng dersom man ikke ser vekk fra elementer som allerede er lagt til i resultatet.</li><li>Trekk 1 poeng dersom man ikke håndterer at to elementer kan være like.</li></ul>"
        },
        {
          del: "(b)",
          fasit: "<p>Denne løsningen svarer til å sortere arrayet med en O(n · log(n)) sorteringsalgoritme, og plukke ut de k første.</p>",
          kode: { name: "FindMin", params: "A, k",
            lines: [L("list ← an empty list", 1), L("A ← MergeSort(A)", 1), L("for i ← 0 to k do", 1), L("append A[i] to list", 2), L("return list", 1)] },
          kriterier: "<ul><li>Inntil 4 poeng for en korrekt løsning.</li><li>Inntil 3 poeng dersom Quicksort benyttes (denne er i O(n²), men er vanligvis rask).</li><li>Inntil 1 poeng for løsninger som baserer seg på en kvadratisk sorteringsalgoritme.</li></ul>"
        },
        {
          del: "(c)",
          fasit: "<p>Problemet kan løses i O(n·log(k)) ved å bruke en max-heap til å holde på de k minste elementene.</p>",
          kode: combo([
            { name: "FindMin", params: "A, k",
              lines: [L("list ← an empty list", 1), L("heap ← an empty max-heap", 1), L("for i ← 0 to k − 1 do", 1), L("add A[i] to heap", 2),
                L("for i ← k to n − 1 do", 1), L("heap.push(min(heap.pop(), A[i]))", 2), L("for i ← 0 to k − 1 do", 1), L("prepend heap.pop () to list", 2), L("return list", 1)] },
            { name: "FindMin", params: "A, k",
              lines: [L("list ← an empty list", 1), L("heap ← BuildMinHeap(A)", 1), L("for i ← 0 to k − 1 do", 1), L("append heap.pop () to list", 2), L("return list", 1)] }
          ]),
          kriterier: "<p>Merk at man også kan anta at heapen har metode peek, og kun poppe dersom A[i] er mindre enn det største elementet på heapen.</p>" +
            "<p>Problemet kan løses i O(n + k · log(n)) ved å først bygge en min-heap i lineær tid (vi kjenner at vi kan bygge en max-heap på linær tid fra forelesning, og en min-heap er helt tilsvarende), deretter poppe de k minste elementene fra en heap med n elementer.</p>" +
            "<ul><li>Inntil 5 poeng for en korrekt løsning i O(n · log(k)) eller O(n + k · log(n)).</li></ul>"
        }
      ],
      merknad: "I (a) og (b) skriver sensor «for i ← 0 to k do» (sic). Det gir k + 1 runder, og skal være k − 1, slik som i (c). I (c) står de to prosedyrene i én kodeblokk her, og teksten mellom dem er flyttet under."
    }
  };

  /* ---------- H2021 10 · Finn par som summerer til x (10 poeng) ---------- */
  IN.PERFEKT["H2021-10"] = {
    type: "eksamen",
    svar: [
      {
        del: "(a)",
        tekst: "<p><b>O(n) med to pekere.</b> La i starte på 0 og j på n − 1. Så lenge i &lt; j: er A[i] + A[j] for stor, flytt j ett steg mot venstre. Er summen for liten, flytt i ett steg mot høyre. Er den lik x, skriv ut paret og flytt i (da blir neste sum for stor, og j flyttes i neste runde). Det virker fordi A er sortert: å flytte j gjør summen mindre, og å flytte i gjør den større.</p>" +
          "<p>En dobbel løkke som prøver alle par, virker i både (a) og (b), men den er O(n²) og gir mye mindre uttelling.</p>",
        kode: "findSummandsSorted",
        kjoretid: "O(n)",
        fasitVerdi: "(0, 10), (2, 8), (4, 6)",
        poeng: ["O(n) i (a) og (b) gir full uttelling", "kvadratisk tid på begge gir opptil 3p"]
      },
      {
        del: "(b)",
        tekst: "<p><b>Forventet O(n) med et hashset.</b> Gå gjennom A. For hvert y: ligger x − y i settet, skriv ut paret og fjern x − y. Ellers legg y i settet. Oppslag, innsetting og sletting er O(1).</p>" +
          "<p>Alternativ som også gir full uttelling: sorter med Radix sort (heltall, O(n)) og bruk løsningen fra (a). Med Merge sort blir det O(n log n), som gir opptil 8 poeng.</p>",
        kode: "findSummandsHash",
        kjoretid: "forventet O(n)",
        poeng: ["forventet O(n) gir full uttelling", "en O(n log n)-løsning gir opptil 8p"]
      }
    ],
    hvorfor: {
      eli5: "<p>I (a) står tallene i rekkefølge. Du holder en finger på det minste og en på det største. Er summen for stor, flytter du fingeren på det største ett hakk inn. Er den for liten, flytter du den andre. I (b) står tallene hulter til bulter, så du skriver hvert tall i en notatbok og spør: «har jeg sett tallet som mangler?»</p>",
      normal: "<p>Begge løsningene er lineære, og det er kravet for full uttelling. To pekere utnytter sorteringen i (a). Hashsettet i (b) gjør «har jeg sett x − y?» til et O(1)-oppslag. Kjøretiden er oppgitt for begge, slik oppgaven ber om.</p>",
      teknisk: "<p>To pekere: hvert steg flytter i eller j én plass, så det blir høyst n − 1 steg. Ingen par går tapt, fordi når summen er for stor, kan A[j] ikke danne par med noe til høyre for i (alt der er større). Hashsettet gir forventet O(1) per element, altså forventet O(n). Radix sort er mulig fordi tallene er heltall.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021 10",
      deler: [
        {
          del: "(a) og (b), kvadratisk",
          fasit: "<p>Både oppgave (a) og (b) kan enkelt løses i kvadratisk tid, slik:</p>",
          kode: { name: "FindSummands", params: "A, x",
            lines: [L("for i ← 0 to |A| − 1 do", 1), L("for j ← i + 1 to |A| − 1 do", 2), L("if A[i] + A[j] = x then", 2), L("print (A[i], A[j])", 3)] }
        },
        {
          del: "(a)",
          fasit: "<p>I oppgave (a) kan vi oppnå lineærtid ved å holde styr på to indekser i og j, der i initielt er 0 og økes, og j initielt er |A| og minkes.</p>",
          kode: { name: "FindSummands", params: "A, x",
            lines: [L("i ← 0", 1), L("j ← |A| − 1", 1), L("", 1), L("while i < j do", 1), L("y ← A[i] + A[j]", 2), L("if x < y then", 2), L("j ← j − 1", 2),
              L("else if x > y then", 2), L("i ← i + 1", 2), L("else", 2), L("print(A[i], A[j])", 2), L("i ← i + 1", 2)] }
        },
        {
          del: "(b)",
          fasit: "<p>I oppgave (b) kan vi oppnå O(n) ved å sortere med radix-sort først, og deretter bruke løsningen fra (a), eventuelt O(n · log(n)) ved merge sort eller lignende. Vi kan også oppnå forventet linærtid ved å lagre elementer vi har sett i en mengde (implementert ved hashing), og for hvert element i y ∈ A sjekke om x − y er i mengden.</p>",
          kode: { name: "FindSummands", params: "A, x",
            lines: [L("H ← new HashSet()", 1), L("for y in A do", 1), L("if x − y is in H then", 2), L("print(y, x − y)", 2), L("H.remove(x - y)", 2),
              L("else", 2), L("H.add(y)", 2)] },
          kriterier: "<p>For full uttelling forventer vi O(n) i forventet kjøretidskompleksitet for (a) og (b). Dersom noen har en O(n) algoritme i oppgave (b), med en kommentar om at den kan brukes for (a), så gir det full uttelling. Man kan også få full uttelling for a bruke løsningen fra (a) og bruke radix sort først i (b).</p>" +
            "<p>For en O(n · log n) løsning på (b) kan man få opp til 8 poeng.</p><p>For kvadratisk tid på begge løsninger kan det gis opp til 3 poeng.</p>"
        }
      ],
      merknad: "Innrykket i sensors kode er gjengitt slik det står i sensorveiledningen. Teksten sier at j starter på |A| (sic), men koden starter riktig på |A| − 1. Etter et treff flyttes bare i. Det holder fordi tallene er unike: neste sum blir for stor, og da flyttes j."
    }
  };
})();
