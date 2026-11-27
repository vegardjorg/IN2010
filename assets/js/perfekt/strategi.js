/* ============================================================
   IN2010 guide · perfekt/strategi.js
   «Perfekt svar» for eksamenskortene på 07-strategi.html (lastes etter data-strategi.js).
   Format: plan/gjennomgang/wp0-format.md.
   - svar: vårt eget fullpoengssvar på kursnivå.
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette kilder her.
   - H2020-7 og H2020-8 er delte oppgaver (også på 05-hashing, 01-sortering og 06-grafer) og står i
     perfekt/delt.js. 07 viser bare sine deler via `deler`.
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

  /* ---------- H2021 6 · Litt om beregnbarhet og kompleksitet (8 poeng) ---------- */
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
      kilde: "Kilde: sensorveiledning IN2010 H2021 6",
      deler: tfSensor(H21_6).concat([{ kriterier: "<p>Det gis 1 poeng for riktig svar og −1 for feil eller ubesvart. Maksimalt får man 8 poeng og minimalt 0 poeng.</p>" }]),
      merknad: "I sensorveiledningen står påstandene og svarene etter hverandre. Her står bare svarene, fordi påstandene står i oppgaven over."
    }
  };

  /* ---------- H2022 2 · Litt av hvert (10 poeng) ---------- */
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
      kilde: "Kilde: sensorveiledning IN2010 H2022 2",
      deler: tfSensor(H22_2),
      merknad: "Sensorveiledningen sier ikke hvordan poengene fordeles på påstandene."
    }
  };
})();
