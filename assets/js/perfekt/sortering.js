/* ============================================================
   IN2010 guide · perfekt/sortering.js
   «Perfekt svar» for eksamensoppgavene om sortering (lastes på 01-sortering.html,
   etter data-algos.js). Format: plan/gjennomgang/wp0-format.md.
   - svar: vårt eget fullpoengssvar på kursnivå (samme på alle nivåer).
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette
     kilder (forelesning, ukesoppgaver, lærebok) hører hjemme her.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.PERFEKT = IN.PERFEKT || {};

  function L(code, indent) { return { code: code, indent: indent }; }
  // H2020-7 deles med andre temaer (hashing/strategi har andre deloppgaver): slå sammen i stedet for å overskrive
  function merge(key, obj) {
    var ex = IN.PERFEKT[key];
    if (!ex) { IN.PERFEKT[key] = obj; return; }
    ex.svar = (ex.svar || []).concat(obj.svar || []);
    if (obj.sensor && obj.sensor.deler) {
      ex.sensor = ex.sensor || { deler: [] };
      ex.sensor.deler = (ex.sensor.deler || []).concat(obj.sensor.deler);
    }
    if (!ex.hvorfor) ex.hvorfor = obj.hvorfor;
  }

  /* ---------- H2023 · Oppgave 4 · Gnome sort (10 poeng) ---------- */
  IN.PERFEKT["H2023-4"] = {
    type: "eksamen",
    intro: "<p>En drøftingsoppgave uten én fasit. Svaret under dekker de fire punktene oppgaven ber om, og knytter Gnome sort tett til Insertion sort. Det er det sensor krever for full uttelling.</p>",
    svar: [
      {
        del: "Virkemåte",
        tekst: "<p>Gnome sort går gjennom arrayet fra venstre med én indeks <span class=\"mono\">i</span>. Står elementet på plass i riktig i forhold til naboen foran (eller står vi helt først), går vi ett steg fram. Er det mindre enn naboen foran, bytter vi de to og går ett steg tilbake. Slik flyttes et element som står for langt bak, bakover med nabobytter til det står riktig, og så går vi fram igjen.</p>" +
          "<p>Det er nesten nøyaktig det Insertion sort gjør. Forskjellen er at Insertion sort har to indekser: den ytre husker hvor vi var, så den kan hoppe rett tilbake etter en innsetting. Gnome sort har bare én indeks og må gå hele veien fram igjen, ett steg om gangen, og sammenligne på nytt underveis.</p>",
        poeng: ["en god forklaring med vanlige ord (opptil 3p)", "at den er nær i slekt med Insertion sort. Det kreves for full uttelling"]
      },
      {
        del: "Kjøretid",
        tekst: "<p><b>O(n²)</b> i verste tilfelle. Hvert bytte retter opp nøyaktig ett par som står i feil rekkefølge (en inversjon), og et array kan ha opptil n(n − 1)/2 slike par, for eksempel når det er sortert baklengs. For hvert bytte går indeksen ett steg tilbake og senere ett steg fram igjen. Det gir kvadratisk mange steg. Beste tilfelle er <b>O(n)</b>: er arrayet allerede sortert, går indeksen rett gjennom uten bytter.</p>" +
          "<p>Gnome sort gjør like mange bytter som Insertion sort, men omtrent dobbelt så mange sammenligninger, fordi den sammenligner på nytt når den går fram igjen.</p>",
        kjoretid: "O(n²) verst, O(n) best",
        poeng: ["riktig kjøretid med en kort begrunnelse (opptil 2p)"]
      },
      {
        del: "Sammenligning",
        tekst: "<p>Gnome sort hører til i gruppen med Bubble, Selection og Insertion sort: enkle, sammenligningsbaserte og kvadratiske. Mot Merge sort, Heapsort og Quicksort (O(n log n)) taper den klart på store arrayer. Den har ingen fordel over Insertion sort, som gjør samme bytter med færre sammenligninger. Fordelen er at koden er svært kort, med bare én løkke og én indeks.</p>" +
          "<p>Bucket sort og Radix sort sammenligner ikke elementer i det hele tatt. De forutsetter noe om nøklene, så de er vanskelige å sammenligne direkte med Gnome sort.</p>",
        poeng: ["riktig plassering mot sorteringsalgoritmene i pensum (opptil 2p)"]
      },
      {
        del: "Stabil og in-place",
        tekst: "<p><b>Stabil:</b> den bytter bare naboer, og bare når den foran er strengt større. To like elementer bytter derfor aldri plass. <b>In-place:</b> den bruker bare arrayet den får inn, pluss én indeks.</p>",
        poeng: ["stabil og in-place med en kort begrunnelse (opptil 2p)"]
      }
    ],
    hvorfor: {
      eli5: "<p>Sensor vil se at du forstår nissen: han går fram når alt er i orden, og bytter og går tilbake når noe står feil. Det er det samme som når du sorterer kort på hånda ved å skyve et kort bakover til det passer. Si det, si at det tar lang tid med mange kort, og si at like kort aldri bytter plass.</p>",
      normal: "<p>Alle fire punktene er med, og hvert har en kort begrunnelse: virkemåten med vanlige ord, O(n²) begrunnet med bytter tilbake og fram, plasseringen blant de kvadratiske algoritmene, og stabil og in-place begrunnet med nabobytter og ingen ekstra struktur. Slektskapet med Insertion sort er nevnt eksplisitt. Det er kravet for full uttelling.</p>",
      teknisk: "<p>Svaret binder analysen til inversjoner: hvert nabobytte fjerner nøyaktig én inversjon, så antall bytter er det samme som i Insertion sort, og O(n²) følger av at det kan være n(n − 1)/2 inversjoner. Forskjellen ligger i sammenligningene, fordi Gnome sort ikke husker hvor den var og må sammenligne seg fram igjen etter hver innsetting. Stabiliteten følger av at bare naboer med streng ulikhet byttes.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2023, oppgave 4",
      fasit: "<p>Gnome sort fungerer ved å løpe over elementene, og når den finner et element som er større enn det foregående elementet skal et flyttes bakover i arrayet. Oppførselen til Gnome sort er nesten helt lik Insertion sort, men den gjør dette med å kun vedlikeholde én indeks. Den mest vesentlige forskjellen fra Insertion sort er at den vil gjøre dobbelt så mange sammenligninger i det som svarer til én innsetting i Insertion sort.</p>" +
        "<p>Det er altså en sorteringsalgoritme med kvadratisk kjøretidskompleksitet (i likhet med bubble sort og selection sort). Den gjør akkurat like mange bytter som Insertion sort, men en god del flere sammenligninger.</p>" +
        "<p>På grunn av kjøretidskompleksiteten vil den være langt mindre egnet for store arrayer enn de raskeste sammenligningsbaserte sorteringsalgoritmene vi kjenner fra pensum (Merge, Heap og Quick). Den er sammenligningsbasert, og er derfor vanskelig å sammenligne direkte mot Bucket- og Radix sort.</p>" +
        "<p>Algoritmen er (i likhet med Insertion sort) stabil, som er enkelt å se fordi den kun bytter elementer som står direkte ved siden av hverandre. Den er også in-place, fordi den ikke bruker andre datastrukturer enn arrayet som er gitt som input.</p>",
      kriterier: "<p>Dette er en litt friere oppgave, som gjør at sensor må yte eget skjønn. Her er noen veiledende kommentarer om poenggivning:</p>" +
        "<ul><li>Opptil 3 poeng for en god forklaring.</li><li>Opptil 2 poeng for riktig kjøretidskompleksitet.</li>" +
        "<li>Opptil 2 poeng for å «plassere» Gnome sort riktig i forhold til andre sorteringsalgoritmer.</li>" +
        "<li>Opptil 2 poeng for en redegjørelse om stabilitet og in-place (disse krever lite forklaring).</li>" +
        "<li>For full uttelling må studenten identifisere det svært nære beslektskapet med Insertion sort.</li></ul>" +
        "<p>Det vektlegges at studenten viser god vurderingsevne med tanke på å trekke frem viktige momenter for å tegne et godt bilde av sorteringsalgoritmen sammenlignet med andre sorteringsalgoritmer. Lykkes de med det kan det gis noe mer uttelling enn hva punktene over foreslår.</p>",
      merknad: "Første setning i sensorteksten har to skrivefeil (sic). Det skal stå «mindre enn det foregående elementet»: et element flyttes bakover når det er mindre enn naboen foran, se linje 4 i pseudokoden. «et flyttes» skal være «det flyttes». Poengene i punktlista summerer til 9 av 10. Resten gis etter skjønn, slik sensor skriver."
    }
  };

  /* ---------- H2024 · Oppgave 3 · Etymologisk ordliste (10 poeng) ---------- */
  IN.PERFEKT["H2024-3"] = {
    type: "eksamen",
    svar: [
      {
        del: "(a)",
        tekst: "<p>Dette er bøttesortering med én bøtte per kategori. Vi går gjennom A i alfabetisk rekkefølge og legger hvert ordobjekt <b>bakerst</b> i bøtta til kategorien sin. Så går vi gjennom kategoriene i fast rekkefølge og skriver ordene tilbake i A, forfra i hver bøtte.</p>" +
          "<p><b>Stabil:</b> innenfor en bøtte ligger ordene i den rekkefølgen de ble lagt inn, altså alfabetisk. <b>Kjøretid O(n):</b> fordelingen er O(n), og samlingen er O(N + n). Siden N &lt; 100 er en konstant, blir det O(n). Ingen sorteringsalgoritme kalles.</p>",
        kode: "etymologySort",
        kjoretid: "O(N + n) = O(n)",
        poeng: ["bøttesortering tilpasset oppgaven (6p)", "en annen stabil O(n log n)-sortering gir opptil 4p, og 1p trekkes hvis den ikke er stabil", "en O(n²)-sortering gir opptil 2p"]
      },
      {
        del: "(b)",
        tekst: "<p><b>Binærsøk, O(log n).</b> Fordi sorteringen i (a) er stabil, er ordene fortsatt alfabetiske innenfor hver kategori. Slå opp <span class=\"mono\">[low, high] = K[v.category]</span> og binærsøk etter <span class=\"mono\">v.string</span> i A[low..high], i stedet for å starte med low = 0 og high = n − 1. Finner vi ordet, finnes v i A.</p>",
        kjoretid: "O(log n)",
        poeng: ["binærsøk i intervallet fra K med O(log n) (4p)", "en lineær løsning gir 2p"]
      }
    ],
    hvorfor: {
      eli5: "<p>Ordene ligger i alfabetisk rekkefølge. Vi legger dem i én kasse per tema, alltid bakerst i kassa. Da ligger ordene i hver kasse fortsatt i alfabetisk rekkefølge, og vi tømmer kassene tilbake én etter én. Etterpå kan vi slå opp et ord ved å gå rett til temaet og bla på midten, slik som i en ordbok.</p>",
      normal: "<p>(a) er bøttesortering, som er det sensor ber om for 6 poeng: lineær tid fordi antall bøtter er en konstant, og stabil fordi vi legger bakerst og tar ut forfra. (b) bygger på (a): stabiliteten gjør hvert kategoriintervall alfabetisk, og da kan vi binærsøke i intervallet fra K. Lineært søk gir bare 2 av 4 poeng.</p>",
      teknisk: "<p>Bøttesortering er O(N + n), og her er N &lt; 100 en konstant. Det er kjernen i (a). Stabiliteten er ikke pynt: den gjør at alfabetisk orden overlever som sekundær nøkkel, og det er akkurat den egenskapen (b) trenger. Binærsøket starter med low og high fra K[v.category] og halverer et intervall som høyst har n elementer, altså O(log n).</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2024, oppgave 3",
      deler: [
        {
          del: "(a)",
          fasit: "<p>Denne oppgaven løses best med bucket sort, og en rimelig gjengiving av bucket sort tilpasset oppgaven gir 6 poeng.</p>",
          kode: {
            name: "EtymologySort", params: "A",
            input: "Et array A med n ordobjekter",
            output: "Et array A med de samme n ordobjektene som er ordnet etter category",
            lines: [
              L("B ← ordered dictionary with an empty list as default value", 1),
              L("for i ← 0 to n − 1 do", 1),
              L("k ← A[i].category", 2),
              L("Append A[i] to the list B[k]", 2),
              L("j ← 0", 1),
              L("for k in keys of B do", 1),
              L("for x in B[k] do", 2),
              L("A[j] ← x", 3),
              L("j ← j + 1", 3),
              L("return A", 1)
            ]
          },
          kriterier: "<p>Maksimalt 6 poeng.</p><p>En annen stabil sorteringsalgoritme i O(n · log(n)) gir opptil 4 poeng. Det trekkes 1 poeng dersom algoritmen ikke er stabil. En sorteringsalgoritme i O(n²) gir opp til 2 poeng.</p>"
        },
        {
          del: "(b)",
          fasit: "<p>Siden sorteringen ovenfor er stabil, vil ordene være ordnet alfabetisk innenfor hvert tema, så vi kan bruke binærsøk og gjøre dette i O(log(n)). I stedet for et binærsøk som starter med low = 0 og high = n − 1, så vil vi heller starte med low og high som gitt av K[v.category] og søke etter v.string.</p>",
          kriterier: "<p>Maksimalt 4 poeng.</p><p>Det gis 2 poeng for lineærtidsløsninger.</p>"
        }
      ]
    }
  };

  /* ---------- H2021 · Oppgave 2 · Stabilitet (3 poeng) ---------- */
  IN.PERFEKT["H2021-2"] = {
    type: "eksamen",
    svar: [
      {
        del: "(a)",
        tekst: "<p><b>Nei.</b> De to 22-åringene har byttet innbyrdes rekkefølge. Den som lå først (A[3]), ligger nå sist (A[9]), og den som lå sist (A[42]), ligger nå først (A[7]). En stabil sortering beholder rekkefølgen mellom like nøkler.</p>",
        fasitVerdi: "Nei"
      },
      {
        del: "(b)",
        tekst: "<p><b>22.</b> Etter sortering på alder ligger alle med samme alder samlet. A[7] og A[9] er begge 22, så alt mellom dem, også A[8], er 22.</p>",
        fasitVerdi: "22"
      },
      {
        del: "(c)",
        tekst: "<p><b>Bøttesortering (Bucket sort).</b> Alderen er et heltall fra 0 til 100, så vi kan bruke N = 101 bøtter. Det gir O(N + n) = O(n), som slår alle sammenligningsbaserte sorteringer (O(n log n) i beste fall).</p>",
        fasitVerdi: "Bucket sort"
      }
    ],
    hvorfor: {
      eli5: "<p>To like gamle personer bytter plass, så sorteringen passet ikke på rekkefølgen deres. Den var altså ikke stabil. Alle som er 22 står ved siden av hverandre, så den i midten er også 22. Og når ingen er over 100, kan vi lage én kasse per alder og slippe å sammenligne.</p>",
      normal: "<p>Stabilitet handler bare om elementer med lik nøkkel. Her har de byttet rekkefølge, så svaret er nei. Like nøkler ligger samlet etter sortering, og det gir 22 i (b). Med få mulige heltallsnøkler er bøttesortering lineær, og det er svaret sensor gir.</p>",
      teknisk: "<p>(a) følger direkte av definisjonen: et par med lik nøkkel har snudd. (b) følger av at et sortert array er ikke-synkende, så A[7] = A[9] = 22 gir A[8] = 22. (c): nøkkeldomenet {0, …, 100} er konstant stort, så Bucket sort er O(N + n) = O(n).</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021, oppgave 2",
      deler: [
        { del: "(a)", fasit: "<p>Nei.</p>" },
        { del: "(b)", fasit: "<p>22.</p>" },
        { del: "(c)", fasit: "<p>Bucket sort.</p>" }
      ],
      merknad: "Sensorveiledningen gir bare svarene og ingen poengfordeling for de tre deloppgavene. Oppgaven gir 3 poeng til sammen."
    }
  };

  /* ---------- H2020 · Oppgave 7 (d) · Sortering av subanagrammer (6 poeng) ---------- */
  merge("H2020-7", {
    type: "eksamen",
    svar: [
      {
        del: "(d)",
        tekst: "<p>Ordene er allerede sortert alfabetisk. Det er det minst viktige kriteriet. Nå skal de sorteres på det viktigste, lengden, med en <b>stabil</b> sortering, så ord med lik lengde forblir alfabetiske. Lengden er et lite heltall, så bøttesortering passer.</p>" +
          "<p>Bøttene ligger i et hashmap fra lengde til liste, så bare lengder som faktisk finnes, får en bøtte. Hvert ord legges <b>bakerst</b> i bøtta for sin lengde. Så går vi gjennom lengdene i <b>synkende</b> rekkefølge og skriver ordene tilbake, forfra i hver bøtte.</p>" +
          "<p><b>Kjøretid:</b> O(N log N + n), der N er antall ulike lengder. Vi sorterer bare de N nøklene. Siden N ≤ n, er dette aldri verre enn O(n log n), og for ord fra en ordbok er N lite.</p>",
        kode: "sortSubanagrams",
        fasitVerdi: "algorithm, logarithm, alright, right, math, git",
        kjoretid: "O(N log N + n), N ≤ n",
        poeng: ["en god løsning med bøttesortering gir full uttelling (6p)", "uspesifiserte kategorier (bøtter) kan koste opptil 3p", "sortert fra kortest til lengst koster 1p", "en stabil O(n log n)-sortering på lengde gir opptil 4p, og en stabil O(n²)-sortering opptil 2p"]
      }
    ],
    hvorfor: {
      eli5: "<p>Ordene står alfabetisk. Vi legger dem i én kasse per ordlengde, alltid bakerst. Så tømmer vi kassene fra den med de lengste ordene til den med de korteste. Siden vi la ordene bakerst og tar dem ut forfra, står ord med like mange bokstaver fortsatt alfabetisk.</p>",
      normal: "<p>Svaret kjenner igjen mønsteret «sortert på det minst viktige, sorter stabilt på det viktigste», velger bøttesortering på lengde og passer på de to tingene sensor trekker for: bøttene er spesifisert (lengden er nøkkelen), og rekkefølgen er lengst først. Kjøretiden er begrunnet med at bare de N ulike lengdene sorteres.</p>",
      teknisk: "<p>Med hashmap som bøtter slipper vi å lage én bøtte for hver lengde opp til den lengste (den kan i prinsippet være lenger enn n). Prisen er at nøklene må sorteres: O(N log N) for N ≤ n nøkler. Fordelingen og samlingen er O(n). Stabiliteten gjør at den alfabetiske rekkefølgen overlever som sekundær orden, slik som i radix sort.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020, oppgave 7",
      deler: [
        {
          del: "(d)",
          fasit: "<p>Dette lukter bucket sort!</p>",
          kode: {
            name: "SortSubanagrams", params: "A",
            input: "Et array A av størrelse n som inneholder strenger",
            output: "Et array med de samme n strengene sortert etter lengde der ord av samme lengde er sortert alfabetisk",
            lines: [
              L("B ← empty hashmap", 1),
              L("for i ← 0 to n − 1 do", 1),
              L("k ← A[i].length", 2),
              L("if B[k] = null then", 2),
              L("B[k] ← empty list", 3),
              L("append A[i] to B[k]", 2),
              L("", 1),
              L("j ← 0", 1),
              L("for keys k of B in descending order do", 1),
              L("for x in B[k] do", 2),
              L("A[j] ← x", 3),
              L("j ← j + 1", 3),
              L("return A", 1)
            ]
          },
          kriterier: "<p>Denne løsningen er en tilpasset bucket sort, der vi bruker et hashmap for å oppbevare bøttene. Dette fordi den lengste strengen i arrayet kan være lenger enn størrelsen av arrayet selv (selv om dette ikke er sannsynlig gitt konteksten). Siden vi traverserer nøklene i hashmapet i avtagende rekkefølge gir dette O(N log(N) + n) kjøretid, der N er antall nøkler. Merk at N ≤ n fordi vi ikke kan ha flere ulike lengder enn vi har strenger. Denne løsningen er minst like bra som en n log(n) algoritme, og i konteksten av strenger i en ordbok vil det være langt raskere enn en n log(n) algoritme.</p>" +
            "<ul><li>En god løsning med bucket sort gir full uttelling.<ul><li>Vi trekker opptil 3 poeng dersom kategoriene er uspesifisert.</li><li>Vi trekker 1 poeng dersom strengene er sortert fra kortest til lengst.</li><li>Vi trekker ikke for bruk av arrays som bøtter.</li></ul></li>" +
            "<li>Vi gir opptil 4 poeng for en stabil sorteringsalgoritme i O(n log(n)) med sortering på lengde.</li>" +
            "<li>Vi gir opptil 2 poeng for en stabil sorteringsalgoritme i O(n²).</li>" +
            "<li>Vi gir opptil 2 poeng for andre løsninger som vil fungere og er godt presentert.<ul><li>Dette gjelder ikke dersom noen finner på en god løsning som vi ikke har tenkt på ennå.</li></ul></li></ul>"
        }
      ],
      merknad: "Linje 8 i sensors kode er tom i originalen. Den er tatt med, så linjenumrene stemmer med sensorveiledningen."
    }
  });
})();
