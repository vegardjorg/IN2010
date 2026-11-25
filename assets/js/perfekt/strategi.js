/* ============================================================
   IN2010 guide · perfekt/strategi.js
   «Perfekt svar» for eksamenskortene på 07-strategi.html (lastes etter data-strategi.js).
   Format: plan/gjennomgang/wp0-format.md.
   - svar: vårt eget fullpoengssvar på kursnivå.
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette kilder her.
   - H2020-7 og H2020-8 er delte nøkler (kortene finnes også på 05-hashing, 01-sortering og 06-grafer).
     De settes bare hvis ingen annen perfekt-fil har satt dem først. 07 viser bare sine deler via `deler`.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.PERFEKT = IN.PERFEKT || {};
  var P = IN.PERFEKT;

  function L(code, indent) { return { code: code, indent: indent }; }
  function tf(rows) {
    return rows.map(function (r) { return { del: r[0], tekst: "<p><b>" + (r[1] ? "Sant." : "Usant.") + "</b> " + r[2] + "</p>" }; });
  }
  function tfSensor(rows) {
    return rows.map(function (r) { return { del: r[0], fasit: "<p>" + (r[1] ? "Sant." : "Usant.") + "</p>" }; });
  }

  /* ---------- H2021 · Oppgave 6 · Litt om beregnbarhet og kompleksitet (8 poeng) ---------- */
  var H21_6 = [
    ["(a)", false, "P mot NP er et åpent problem. Ingen har bevist noen av retningene."],
    ["(b)", false, "Heller ikke det er bevist. De fleste tror at P ≠ NP, men det er ikke et bevis."],
    ["(c)", true, "Et NP-komplett problem er i NP og NP-hardt. Alt i NP kan derfor reduseres til det i polynomiell tid, også de andre NP-komplette problemene."],
    ["(d)", true, "Kan vi løse problemet i polynomiell tid, kan vi også sjekke et JA-svar i polynomiell tid, bare ved å løse det. Altså er P ⊆ NP."],
    ["(e)", false, "Siden P ⊆ NP, sier påstanden at alle avgjørelsesproblemer er i NP. Men det finnes problemer utenfor NP, for eksempel det uløselige HALT (stoppeproblemet)."],
    ["(f)", true, "Det er definisjonen av NP: JA-instanser kan verifiseres i polynomiell tid med et sertifikat."],
    ["(g)", true, "Alle tre er NP-komplette (Knapsack som avgjørelsesproblem, Sudoku på generelle n × n-brett). En polynomiell algoritme for ett NP-komplett problem gir en polynomiell algoritme for alt i NP, og da er P = NP."],
    ["(h)", false, "HALT er uløselig: ingen algoritme gir riktig svar på alle instanser, uansett hvor rask maskinen er."]
  ];
  P["H2021-6"] = {
    type: "eksamen",
    svar: tf(H21_6),
    hvorfor: {
      eli5: "<p>Her teller bare «sant» eller «usant». Et galt eller tomt svar trekker ett poeng, så det er viktig å svare på alle åtte. Forklaringene er med for at du skal kunne sjekke deg selv.</p>",
      normal: "<p>Alle åtte svarene er de samme som i sensorveiledningen. Fire fakta dekker hele oppgaven: P ⊆ NP, P mot NP er åpent, NP-komplett betyr i NP og NP-hardt, og uløselige problemer som HALT ligger utenfor NP.</p>",
      teknisk: "<p>Påstandene tester definisjonene: NP er problemene med polynomielle verifikatorer, P ⊆ NP, og et NP-komplett problem er det vanskeligste i NP i den forstand at alt i NP kan reduseres til det. Det som er «bevist», er nesten alltid usant her, fordi P mot NP er åpent.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021, oppgave 6",
      deler: tfSensor(H21_6).concat([{ kriterier: "<p>Det gis 1 poeng for riktig svar og −1 for feil eller ubesvart. Maksimalt får man 8 poeng og minimalt 0 poeng.</p>" }]),
      merknad: "I sensorveiledningen står påstandene og svarene etter hverandre. Her står bare svarene, fordi påstandene står i oppgaven over."
    }
  };

  /* ---------- H2022 · Oppgave 2 · Litt av hvert (10 poeng) ---------- */
  var H22_2 = [
    ["(a)", true, "Det er definisjonen av et binærtre: hver node har høyst to barn."],
    ["(b)", true, "O(n) er den lineære klassen. (Strengt tatt er O en øvre grense, men «bruker O(n) steg» leses her som lineær kjøretid.)"],
    ["(c)", true, "Merge sort er O(n log n) i alle tilfeller: log n nivåer med O(n) fletting per nivå."],
    ["(d)", false, "Gå gjennom arrayet én gang og sjekk at A[i] ≤ A[i + 1] for alle nabopar. Det er O(n)."],
    ["(e)", true, "Binærsøk hopper til midten. I et array er det O(1), men i en lenket liste må vi gå dit steg for steg, så hvert hopp koster O(n)."],
    ["(f)", true, "Det er det kjøretidskompleksitet måler: hvordan antall steg vokser når input blir større."],
    ["(g)", false, "O sier noe om veksten når n blir stor. For små input kan konstantene gjøre at algoritmen med «dårligere» kompleksitet bruker færre steg."],
    ["(h)", true, "Vanlige tegn får korte koder, så teksten tar mindre plass."],
    ["(i)", true, "Alle andre noder i et tre har nøyaktig én forelder."],
    ["(j)", false, "En urettet graf med n noder kan ha opptil n(n − 1)/2 kanter, langt flere enn n når n er stor."]
  ];
  P["H2022-2"] = {
    type: "eksamen",
    svar: tf(H22_2),
    hvorfor: {
      eli5: "<p>Her teller bare «sant» eller «usant». Begrunnelsene er med for at du skal kunne sjekke deg selv: finner du et moteksempel, er påstanden usann.</p>",
      normal: "<p>Hvert svar er det samme som i sensorveiledningen. Begrunnelsene er ikke en del av svaret på eksamen, men de viser hvordan du kommer fram til det.</p>",
      teknisk: "<p>Påstandene skiller mellom veksttakt (O) og faktisk antall steg, og tester grunnbegreper om trær og grafer. For de usanne holder ett moteksempel. For de sanne trengs et argument som gjelder alle input.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 2",
      deler: tfSensor(H22_2),
      merknad: "Sensorveiledningen sier ikke hvordan poengene fordeles på påstandene."
    }
  };

  /* ---------- H2020 · Oppgave 8 · Fire typer grafer (her bare (a) og (b)) ---------- */
  if (!P["H2020-8"]) P["H2020-8"] = {
    type: "eksamen",
    svar: [
      { del: "(a)",
        tekst: "<p>Sertifikatet C er en foreslått rekkefølge av nodene. Vi sjekker at hvert par av noder som står etter hverandre i C, har en kant i G, også paret fra den siste noden tilbake til den første. Mangler én kant, svarer vi NEI. Finnes alle, svarer vi JA.</p>",
        kode: "stType2Verifier",
        etter: "<p class=\"small muted\">(i + 1) mod N gir 0 når i = N − 1, så den siste runden sjekker kanten fra C[N − 1] tilbake til C[0]. Det er den kanten som skiller en sykel fra en sti. Verifikatoren leter aldri etter en sykel selv, den sjekker bare forslaget.</p>",
        kjoretid: "N = |V| runder med ett kantoppslag hver. Med nabomatrise er det O(|V|), med naboliste O(|V| + |E|). Begge er polynomielle.",
        fasitVerdi: "JA",
        poeng: ["sjekke at hver kant i C er en kant i G (5p, −1 hvis kanten tilbake til start mangler)", "signatur og oversiktlig svar (2p)"] },
      { del: "(b)",
        tekst: "<p>Type2Verifier går i polynomiell tid. Får vi en JA-instans av Type2 og et sertifikat, kan vi altså verifisere JA-svaret i polynomiell tid. Det er definisjonen av at et avgjørelsesproblem er i NP.</p>",
        poeng: ["koble den polynomielle verifikatoren til definisjonen av NP (3p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du sjekker bare at forslaget henger sammen, steg for steg, og at du kommer hjem igjen til slutt. Du prøver ikke selv å finne en rundtur. Det er nøyaktig det oppgaven ber om.</p>",
      normal: "<p>Svaret i (a) sjekker alle N kantene i forslaget, også den siste tilbake til start, som var der det ble trukket poeng. (b) bruker verifikatoren direkte: polynomiell verifikator betyr at problemet er i NP.</p>",
      teknisk: "<p>NP er avgjørelsesproblemene der JA-instanser har et sertifikat som kan sjekkes i polynomiell tid. Type2Verifier er en slik sjekk med N kantoppslag. Et forsøk på å finne en sykel med BFS eller DFS svarer på et annet spørsmål og ga ingen poeng.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020, oppgave 8",
      deler: [
        { del: "(a)",
          kode: {
            name: "Type2Verifier", params: "G, C",
            input: "En graf G og et array av noder C",
            output: "Returner JA hvis C viser at G er av type 2, NEI ellers",
            lines: [L("(V, E) ← G", 1), L("N ←|C|", 1), L("for i ← 0 to N − 1 do", 1), L("if (C[i], C[(i + 1) mod N]) ∉ E then", 2), L("return NEI", 3), L("return JA", 1)]
          },
          etter: "<p>Det viktige i denne oppgaven er at man sjekker at etterfølgende par av noder i C svarer til kanter i G. " +
            "Det er også nødvendig å sjekke at siste og første node i C utgjør en kant i G; dette gjør vi i siste iterasjon av loopen, der i = N − 1, hvor vi da sjekker om (C[N - 1], C[0]) er en kant i G (fordi N mod N = 0).</p>",
          kriterier: "<p>Veiledende poengfordeling:</p><ul>" +
            "<li>5 poeng for å sjekke om e ∈ E(C) ⇒ e ∈ E(G); minus 1 poeng om de glemmer siste kant</li>" +
            "<li>2 poeng for signatur og generell oversiktlig besvarelse</li>" +
            "<li>Ingen poeng for å finne en generell sykel, f.eks. ved hjelp av BFS/DFS</li></ul>" },
        { del: "(b)",
          fasit: "<p>Type2Verifier kjører i polynomiell tid. Derfor kan JA-instanser av Type2 verifiseres i polynomiell tid. Dette er kravet for å være i NP.</p>" }
      ],
      merknad: "Sensor skriver kanten som et par (C[i], C[(i + 1) mod N]). Grafen er urettet, og kurset skriver en urettet kant som en mengde {u, v}, slik pseudokoden i vårt svar gjør. Det betyr det samme her."
    }
  };

  /* ---------- H2020 · Oppgave 7 · Subanagram (her bare (a) og (c)) ---------- */
  if (!P["H2020-7"]) P["H2020-7"] = {
    type: "eksamen",
    svar: [
      { del: "(a)",
        tekst: "<p><b>O(s · w).</b> Kopien av W i linje 2 er O(w). Løkka i linje 3 går s ganger, én gang per bokstav i S. " +
          "I hver runde sjekker linje 4 om c er i r, og linje 5 fjerner kanskje en forekomst. r har høyst w bokstaver, så hver runde er O(w). " +
          "Totalt O(w + s · w) = O(s · w).</p>",
        kjoretid: "O(s · w)",
        poeng: ["riktig svaralternativ (4p)"] },
      { del: "(c)",
        tekst: "<ul>" +
          "<li><b>Hva de avhenger av.</b> Strategi 1 er O(d · (w + s)) og avhenger av d, w og s. Strategi 2 er O(2ˢ) og avhenger bare av s, men eksponentielt.</li>" +
          "<li><b>Rimelige antagelser.</b> Ordene i en ordbok er korte, og ordboka er stor, så d er mye større enn w. Bokstavene S en Scrabble-spiller har, er også få, så s er liten.</li>" +
          "<li><b>Strategi 1.</b> Med disse antagelsene dominerer d: hver spørring går gjennom hele ordboka. Til gjengjeld påvirkes kjøretiden lite av hvor lang S er.</li>" +
          "<li><b>Strategi 2.</b> 2ˢ vokser svært raskt med s, men slipper å gå gjennom ordboka. Så lenge S er kort og D er stor, lønner Strategi 2 seg. Hvor grensen går, avhenger av d og w og avgjøres best ved å måle.</li>" +
          "<li><b>Forarbeidet.</b> Build sorterer hvert ord, så den er litt dyrere enn én kjøring av Strategi 1. Men den kjøres bare én gang, og kostnaden fordeles på alle spørringene.</li>" +
          "<li><b>Konklusjon.</b> Strategi 2 for korte S, Strategi 1 for lange S.</li></ul>",
        poeng: ["at Strategi 2 lønner seg når S er liten og D er stor (3p)", "velskrevet tekst (1p)", "drøfting med argumenter (1p)", "rimelige antagelser (1p)", "bruk O-notasjon og definer variablene (−1 uten O, −3 for n uten definisjon)"] }
    ],
    hvorfor: {
      eli5: "<p>I (a) teller du hvor mange runder løkka går, og hvor mye hver runde koster. I (c) sier du hva hver strategi er bra og dårlig til, og når du ville valgt hver av dem.</p>",
      normal: "<p>(a) er et flervalg, og riktig valg gir hele poengsummen. I (c) er hovedpoenget (3 av 6) å si at Strategi 2 lønner seg når S er liten og ordboka stor. Resten kommer av god tekst, argumenter og antagelser som står skrevet.</p>",
      teknisk: "<p>(a): kostnaden er skjult i hjelpeoperasjonene. «c is in r» og «remove» er lineære i |r| ≤ w, og de kalles s ganger. (c): O(d · (w + s)) mot O(2ˢ) er en avveining mellom lineær avhengighet av ordboka og eksponentiell avhengighet av s. Med d stor og s liten vinner den eksponentielle, og det er det sensor ser etter.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020, oppgave 7",
      deler: [
        { del: "(a)",
          fasit: "<ul><li>O(w + s)</li><li>O(s²)</li><li>O(w log(s))</li><li>O(s · w)</li><li>O(w²)</li></ul>" },
        { del: "(c)",
          fasit: "<p>Dette er en oppgave som går ut på å gjøre rimelige antagelser og anvende dem til å si noe fornuftig om hvilken fremgangsmåte man bør bruke. Dette er den oppgaven fra eksamenssettet hvor sensoren er nødt til å anvende mest skjønn i poengsettingen. Tanken bak oppgaven er å få studenten til å reflektere over hvilken fremgangsmåte man bør velge i lys av kjøretidskarakteristikkene til de to strategiene. Det bør legges vekt på at teksten er godt skrevet (dette betyr ikke at det skal trekkes poeng for enkle skrivefeil, men at teksten må være tydelig og enkel å forstå; en fin tommelfingerregel er at en setning man ikke forstår etter to gjennomlesninger ignoreres). Under lister vi noen refleksjoner vi ønsker å se.</p>" +
            "<p>En viktig observasjon er at SubanagramsOf1 er avhengig av både d, w og s, men SubanagramsOf2 kun er avhengig av s.</p>" +
            "<p>Man kan forvente at ord i en ordliste er forholdsvis korte, mens ordlisten selv er stor til sammenligning. Strengen S (som er bokstavene man har tilgjengelig til å forme ord fra) kan man også forvente er forholdsvis kort. Da vil d være det dominerende leddet for SubanagramsOf1, fordi at man for et enkelt oppslag er nødt til å søke gjennom hele ordlisten. En fordel med SubanagramsOf1 er at kjøretiden påvirkes i liten grad av størrelsen på inputstrengen S; altså vil ikke kjøretiden påvirkes dramatisk dersom en bruker skriver inn en kort tekststreng S, til sammenligning med en lang tekststreng.</p>" +
            "<p>Prosedyren SubanagramsOf2 er kun avhengig av størrelsen på S, men til gjengjeld er kjøretiden eksponensiell med hensyn til s. Vi vet at eksponensiell tid sjeldent er en god ting. Men det er viktig å huske på at S antageligvis er ganske liten, og ordboken er veldig stor til sammenligning. Dersom vi setter en fast størrelse for d og w (altså størrelsen på ordlista og det lengste ordet i ordlista), så er spørsmålet hvor stor s må bli før det lønner seg å gå gjennom hele ordboken. Dette besvares enklest eksperimentelt (og våre eksperimenter tilsier at for ordboken sowpods så går denne grensen rundt s = 17). Det vi uansett kan si sikkert er at kjøretiden til SubanagramsOf2 vil vokse dramatisk, men dersom vi antar at størrelsen på S holder seg rimelig liten, så kan dette fremdeles være en god strategi.</p>" +
            "<p>For å kunne bruke SubanagramsOf2 må vi først bygge en datastruktur som har litt verre kjøretid enn SubanagramsOf1 (fordi vi sorterer ordene). Et fint pragmatisk argument er at dette vil kun gjøres en gang (når serveren starter opp), og under antagelsen om at ordene er korte, er denne kostnaden neglisjerbar.</p>" +
            "<p>Merk at dette er en drøftningsoppgave av en grunn: det finnes ikke et enkelt fasitsvar. Dersom man skal implementere dette vil man måtte avgjøre strategi eksperimentelt; dersom man ikke setter noen begrensninger på bokstavene brukeren har tilgjengelig S, så vil man kanskje ønske å benytte strategi 2 dersom s &lt; 17 og strategi 1 ellers.</p>",
          kriterier: "<p>Veiledende poengfordeling:</p><ul>" +
            "<li>3 poeng for å nevne at strategi 2 lønner seg hvis S er liten og D er stor</li>" +
            "<li>1 poeng for en velskreven teskt</li>" +
            "<li>1 poeng for å drøfte og argumentere for påstandene</li>" +
            "<li>1 poeng for å gjøre rimelige antagelser</li>" +
            "<li>Minus 1 poeng for å ikke ha noen referanse til O-notasjonen (men snakker generelt om at «når ordboka er stor» og «ordene korte»).</li>" +
            "<li>Minus 3 poeng for å snakke om n uten definisjon; her er jo det hele poenget</li></ul>" }
      ],
      merknad: "For (a) gjentar sensorveiledningen bare de fem svaralternativene og sier ikke hvilket som er riktig. Svaret O(s · w) i vårt svar er regnet ut av oss. Deloppgave (c) vurderes etter skjønn: det finnes ikke ett fasitsvar, og vårt svar er ett eksempel som dekker kriteriene."
    }
  };
})();
