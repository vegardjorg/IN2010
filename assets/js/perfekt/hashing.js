/* ============================================================
   IN2010 guide · perfekt/hashing.js
   «Perfekt svar» for eksamensoppgavene om hashing (lastes på 05-hashing.html,
   etter data-hashing.js). Format: plan/gjennomgang/wp0-format.md.
   - svar: vårt eget fullpoengssvar på kursnivå.
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette
     kilder (forelesning, ukesoppgaver, lærebok) hører hjemme her.
   - H2020-7 er en delt nøkkel: kortene finnes også på 07-strategi.html ((a) og (c)).
     Denne fila eier oppføringen og må lastes FØR perfekt/strategi.js der begge lastes.
     Figurer tegnes bare når viz-hash.js er lastet (ikke på 07).
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.PERFEKT = IN.PERFEKT || {};
  var P = IN.PERFEKT;

  function L(code, indent) { return { code: code, indent: indent }; }
  function tab(vals, label) {
    var th = "", td = "";
    vals.forEach(function (v, i) { th += "<th>" + i + "</th>"; td += "<td>" + v + "</td>"; });
    // Egen scrollboks: et array med 10 plasser er bredere enn kortet på 375 px
    return '<div style="overflow-x:auto;max-width:100%"><table class="et-tab" aria-label="' + (label || "Arrayet etter innsettingene") + '"><tr>' + th + "</tr><tr>" + td + "</tr></table></div>";
  }
  function ins(keys) { return keys.map(function (k) { return { op: "ins", k: k }; }); }
  function insKV(pairs) { return pairs.map(function (p) { return { op: "ins", k: p[0], v: p[1] }; }); }
  function last(gen, input) { var s = IN.gen[gen](input); return s[s.length - 1]; }
  // Figur fra generatorens sluttilstand. Uten viz-hash.js (andre sider) blir figuren tom.
  function hashFig(cap, step) {
    return { cap: cap, draw: function (h) { if (IN.vizHash && IN.gen) IN.vizHash(h, step(), { compact: true }); } };
  }

  /* ---------- H2025 · Oppgave 2 · Separate chaining (10 poeng) ---------- */
  var CH25 = [[21, "a"], [54, "b"], [82, "c"], [10, "d"], [20, "e"], [44, "f"], [10, "g"]];
  P["H2025-2"] = {
    type: "eksamen",
    svar: [
      { del: "(a)",
        tekst: "<p class=\"mono\">0: (10, g), (20, e)<br>1: (21, a)<br>2: (82, c)<br>3:<br>4: (54, b), (44, f)<br>5:<br>6:<br>7:<br>8:<br>9:</p>" +
          "<p>(10, d) havner først i bøtte 0, og (20, e) legges bakerst i samme bøtte. Den siste innsettingen, (10, g), har en nøkkel som finnes fra før, så den <b>overskriver</b> (10, d) der paret står. Den legges ikke til på nytt.</p>",
        fig: hashFig("Tabellen etter siste innsetting", function () { return { parts: [last("hsChainOps", [{ N: 10, ops: insKV(CH25) }]).parts[0]] }; }),
        fasitVerdi: "0: (10, g), (20, e); 1: (21, a); 2: (82, c); 4: (54, b), (44, f)",
        poeng: ["riktig tabell (3p)", "(10, g) overskriver (10, d) (ellers −1,5)"] },
      { del: "(b)",
        tekst: "<p>Vi regner ut i = h(k, N) og bruker i som indeks i A. Hver plass i A er en bøtte: en liste med nøkkel-verdi-par, eller null hvis ingen nøkkel har hashet dit ennå. " +
          "Er bøtta null, lager vi en ny liste som bare inneholder (k, v). Ellers går vi gjennom bøtta. Finner vi et par med nøkkelen k, erstatter vi paret med (k, v), for hver nøkkel skal bare finnes én gang. " +
          "Finner vi den ikke, legger vi (k, v) bakerst i bøtta.</p>",
        kode: "hsChainInsert",
        poeng: ["god forklaring med pseudokode (5p)", "lik nøkkel overskrives (ellers −1)", "tydelig hvordan bøtta lages første gang (ellers −1)"] },
      { del: "(c)",
        tekst: "<p><b>Verste tilfelle O(n):</b> alle n nøklene kan hashe til samme bøtte, og innsettingen må gå gjennom hele bøtta for å se om k finnes fra før. " +
          "<b>Forventet O(1):</b> med en god hashfunksjon og en tilstrekkelig lav Load factor n/N er lengden på hver liste begrenset av en konstant.</p>",
        kjoretid: "O(n) i verste tilfelle, forventet O(1)",
        poeng: ["verste tilfelle (1p)", "forventet tilfelle (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>I (a) passer du på at nøkkelen 10 bare står én gang. I (b) forklarer du hele veien: finn bøtta, lag den hvis den mangler, let, bytt ut eller legg bakerst. I (c) sier du både hvordan det går vanligvis, og hvordan det går med uflaks.</p>",
      normal: "<p>Svaret dekker alle punktene sensor trekker for: overskriving av lik nøkkel i både (a) og (b), hvordan bøtta initialiseres (null → ny liste), og både verste og forventet kjøretid i (c).</p>",
      teknisk: "<p>Innsetting koster O(1 + |B|) for bøtta B = A[h(k, N)], fordi vi må lete etter k for å unngå duplikater. Med god spredning og lav Load factor er |B| begrenset av en konstant, så forventet O(1). Verste tilfelle er at alle n nøklene ligger i samme bøtte: O(n).</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2025, oppgave 2",
      deler: [
        { del: "(a)",
          fasit: "<p>Resultatet av innsettingen ser slik ut:</p><p class=\"mono\">0 : (10, g), (20, e)<br>1 : (21, a)<br>2 : (82, c)<br>3:<br>4 : (54, b), (44, f )<br>5:<br>6:<br>7:<br>8:<br>9:</p>",
          kriterier: ["3 poeng for riktig svar.", "Det trekkes 1.5 poeng for å ikke overskrive en lik nøkkel med ny verdi."] },
        { del: "(b)",
          fasit: "<p>Det viktigste er at studenten formidler en god forståelse av hvordan separate chaining fungerer. Innsetting med separate chaining tar utgangspunkt i å bruke hashen av nøkkelen som indeks, og plassere nøkkel-/verdi-paret i en bøtte (som regel implementert som en lenket liste). Dersom nøkkel-/verdi-paret allerede finnes i listen, skal verdien erstattes.</p><p>I implementasjonen under antar vi lister som er implementert som dynamiske arrayer.</p>",
          kode: { name: "SeparateChainingInsert", params: "A, k, v",
            input: "Et array A av størrelse N , en nøkkel k og verdi v", output: "Et array der (k, v) er satt inn med separate chaining",
            lines: [L("i ← h(k, N )", 1), L("B ← A[i]", 1), L("if B = null then", 1), L("A[i] ← a list containing the element (k, v)", 2), L("return A", 2),
              L("for j ← 0 to |B| − 1 do", 1), L("if key of B[j] is k then", 2), L("B[j] ← (k, v)", 3), L("return A", 3), L("append (k, v) to B", 1), L("return A", 1)] },
          kriterier: ["5 poeng for en god forklaring med pseudokode.", "Det gis full uttelling for selvforklarende eller godt kommentert pseudokode.", "Det gis inntil 3 poeng dersom pseudokoden mangler.",
            "Det trekkes 1 poeng for å ikke overskrive en lik nøkkel med ny verdi.", "Det trekkes 1 poeng dersom det ikke kommer klart frem hvordan bøttene initialiseres."] },
        { del: "(c)",
          fasit: "<p>Kjøretiden til separate chaining er O(n) i verste tilfelle, men under antagelsen av en god hashfunksjon og en tilstrekkelig lav load factor vil lengden på hver liste være begrenset av en konstant, som gir forventet O(1).</p>",
          kriterier: ["2 poeng.", "1 poeng for kun verste tilfelle.", "1 poeng for kun forventet kjøretidskompleksitet."] }
      ]
    }
  };

  /* ---------- H2020 · Oppgave 4 · Linear probing (2 poeng) ---------- */
  var H20_4 = [29, "_", "_", 93, 74, 13, 45, "_", 48, 99];
  P["H2020-4"] = {
    type: "eksamen",
    svar: [
      { tekst: tab(H20_4) +
          "<p>93, 48, 74 og 99 havner rett på hjemmeplassen. 29 hører hjemme på plass 9, som er opptatt av 99, så proben går rundt til plass 0. " +
          "13 hører hjemme på plass 3, men 3 og 4 er opptatt, så den havner på 5. 45 hører hjemme på plass 5, som nå er opptatt av 13, og havner på 6.</p>",
        fasitVerdi: "29, _, _, 93, 74, 13, 45, _, 48, 99",
        poeng: ["riktig utfylt tabell (2p)"] }
    ],
    hvorfor: {
      eli5: "<p>Hvert tall prøver plassen som er lik siste siffer. Er den tatt, går det ett hakk til høyre, og fra den siste plassen tilbake til den første.</p>",
      normal: "<p>Hele poenget er riktig tabell. Nøkkelen 29 tester at du går rundt fra plass 9 til plass 0, og 13 og 45 tester at du fortsetter forbi flere opptatte plasser.</p>",
      teknisk: "<p>Linear probing prøver h(k, N), så (h(k, N) + 1) mod N og så videre, til første ledige plass. mod N gjør arrayet til en ring, og det er det 29 sjekker.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020, oppgave 4",
      fasit: "<p>Det resulterende arrayet ser slik ut:</p>" + tab([29, "", "", 93, 74, 13, 45, "", 48, 99], "Det resulterende arrayet fra sensorveiledningen"),
      merknad: "Sensorveiledningen viser bare den ferdige tabellen og sier ikke noe om poengfordelingen. Oppgaven er på 2 poeng i eksamensarket. Tomme plasser står tomme hos sensor, mens vi skriver _."
    }
  };

  /* ---------- H2022 · Oppgave 7 · Linear probing (10 poeng) ---------- */
  var H22_7 = [10, 21, 82, 20, 54, 44, "_", "_", "_", "_"];
  P["H2022-7"] = {
    type: "eksamen",
    svar: [
      { del: "(a)",
        tekst: "<p class=\"mono\">10, 21, 82, 20, 54, 44, _, _, _, _</p>" + tab(H22_7) +
          "<p>21, 54 og 82 havner på hjemmeplassen. 10 hører hjemme på 0, som er ledig. 20 hører hjemme på 0, men 0, 1 og 2 er opptatt, så den havner på 3. 44 hører hjemme på 4 og havner på 5.</p>",
        fasitVerdi: "10, 21, 82, 20, 54, 44, _, _, _, _",
        poeng: ["riktig liste (2p, alt eller ingenting)"] },
      { del: "(b)",
        tekst: "<p>Vi starter på plassen i = h(k, N). Er A[i] ledig (null), setter vi inn (k, v) der, og vi er ferdige. Er plassen opptatt, er det to muligheter: " +
          "ligger nøkkelen k der fra før, skal paret overskrives med den nye verdien, så vi stopper der. Ligger det en annen nøkkel der, prøver vi neste plass, i ← (i + 1) mod N. " +
          "mod N gjør at vi går rundt til plass 0 etter plass N − 1, så vi aldri går utenfor arrayet. Fordi arrayet ikke er fullt, finner vi alltid enten k eller en ledig plass.</p>",
        kode: "hsProbeInsert",
        poeng: ["god forklaring (opptil 5p)", "korrekt pseudokode (full uttelling)", "lik nøkkel overskrives (ellers −1)", "(i + 1) mod N, ingen indekser utenfor arrayet (ellers −2)", "h brukes bare på nøkkelen (ellers −1)"] }
    ],
    hvorfor: {
      eli5: "<p>I (a) setter du inn ett tall om gangen og går til høyre når plassen er tatt. I (b) forteller du først med ord hva som skjer, og skriver så de samme stegene som kode.</p>",
      normal: "<p>(a) er alt eller ingenting, så det lønner seg å skrive opp probene for hver kollisjon. I (b) gir forklaringen opptil 5 poeng, og pseudokoden resten. Koden over har de tre tingene sensor trekker for: overskriving av lik nøkkel, mod N og riktig bruk av h.</p>",
      teknisk: "<p>Løkka stopper fordi arrayet ikke er fullt. Invarianten er at alle plassene fra h(k, N) fram til i er opptatt av andre nøkler. Derfor er første null eller første plass med nøkkelen k riktig sted å skrive.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 7",
      deler: [
        { del: "(a)",
          fasit: "<p>Det resulterende arrayet ser slik ut:</p>" + tab([10, 21, 82, 20, 54, 44, "", "", "", ""], "Det resulterende arrayet fra sensorveiledningen"),
          kriterier: "<p>2 poeng for riktig svar, ingen poeng for feil. Vi trekker ikke for unøyaktigheter rundt antall tomme plasser.</p>" },
        { del: "(b)",
          fasit: "<p>Linear probing fungerer ved å prøve å plassere nøkkel/verdi-paret på posisjonen som svarer til hashen av nøkkelen (h(k, N )). Dersom posisjonen er ledig kan vi sette inn nøkkel/verdi-paret og algoritmen er ferdig.</p>" +
            "<p>Dersom posisjonen er opptatt må vi:</p><ul><li>dersom nøkkelen på posisjonen er lik k må vi overskrive verdien;</li><li>dersom nøkkelen på posisjonen er ulik må vi prøve neste posisjon.</li></ul>",
          kode: { name: "LinearProbingInsert", params: "A, k, v",
            input: "Et array A av størrelse N , en nøkkel k og verdi v", output: "Et array som inneholder (k, v)",
            lines: [L("i ← h(k, N )", 1), L("", 1), L("while A[i] ≠ null do", 1), L("if key at A[i] is k then", 2), L("break // Overskriv med ny verdi", 3), L("i ← i + 1 mod N", 2), L("", 1), L("A[i] ← (k, v)", 1)] },
          kriterier: "<p>Det viktigste er at studenten formidler en god forståelse av hvordan linear probing fungerer. Opp til 5 poeng kan tildeles for en god forklaring; for full uttelling må også korrekt pseudokode være på plass. Et par ting å være oppmerksom på:</p>" +
            "<ul><li>Det trekkes 1 poeng for å ikke overskrive en lik nøkkel med ny verdi.</li><li>Det trekkes 2 poeng dersom prosedyren vil aksessere indekser utenfor området 1 . . . N − 1.</li><li>Det trekkes 1 poeng for feil bruk av hash-funksjonen (for eksempel i ← h(i + 1, N ) og lignende).</li></ul>" }
      ],
      merknad: "Sensor skriver «i ← i + 1 mod N». Det betyr i ← (i + 1) mod N, slik vi skriver det. Området «1 . . . N − 1» står slik i sensorveiledningen. Gyldige indekser er 0 til N − 1. Sensorveiledningen gir 2 poeng for (a), så (b) har de resterende 8."
    }
  };

  /* ---------- H2024 · Oppgave 5 · Python 3.6 (10 poeng) ---------- */
  var PYFIX = { timmy: 13, barry: 9, guido: 7 };   // gir plass 5, 1 og 7 med N = 8, som i oppgaven
  var PY3 = [{ op: "ins", k: "timmy", v: "red" }, { op: "ins", k: "barry", v: "green" }, { op: "ins", k: "guido", v: "blue" }];
  P["H2024-5"] = {
    type: "eksamen",
    svar: [
      { del: "(a)",
        tekst: "<p>Probingen skjer nå i <code>indices</code>, så N er størrelsen på indices.</p>" +
          "<p><b>Oppslag:</b> regn ut i = h(k, N). Er indices[i] tom, finnes ikke k. Ellers står det en indeks j der, og paret ligger i entries[j]. Er nøkkelen i entries[j] lik k, returnerer vi verdien. Ellers går vi videre til i ← (i + 1) mod N og prøver igjen. Vi slår altså alltid opp i entries via indices.</p>" +
          "<p><b>Innsetting:</b> let på samme måte. Finner vi k, overskriver vi verdien i entries[j]. Finner vi en tom plass i indices, setter vi indices[i] til størrelsen av entries (den neste ledige indeksen der), og legger (k, v) bakerst i entries.</p>",
        kode: "hsPyInsert",
        etter: "<p class=\"small muted\">Pseudokoden er bare til hjelp. Oppgaven ber om naturlig språk.</p>",
        poeng: ["oppslag via indices inn i entries (2p)", "innsetting: indices[i] ← størrelsen av entries, så legg paret bakerst (2p)"] },
      { del: "(b)",
        tekst: "<p>En rehash lager et større underliggende array og setter inn alle elementene på nytt med innsettingsalgoritmen til Linear probing, fordi hjemmeplassen h(k, N) avhenger av N. " +
          "Den utløses når Load factor n/N blir for høy, altså når det er lite ledig plass igjen og probingen blir lang. (Kurset dobler N.)</p>",
        poeng: ["hva en rehash er (1p)", "at høy Load factor n/N utløser den (1p)"] },
      { del: "(c)",
        tekst: "<p><code>entries</code> forblir uendret. Vi lager et større <code>indices</code> og setter inn hver indeks j på nytt med h(entries[j].key, N) og Linear probing. Vi legger ikke noe til i entries.</p>",
        fig: hashFig("Etter rehash: indices med N = 16, entries uendret", function () {
          var s = last("hsPyOps", [{ N: 8, fixed: PYFIX, ops: PY3.concat([{ op: "rehash" }]) }]);
          return { parts: [s.parts[0], s.parts[1]].map(function (p) { var c = {}; for (var k in p) c[k] = p[k]; c.marks = {}; return c; }) };
        }),
        poeng: ["entries uendret, bare indices bygges på nytt (2p)"] },
      { del: "(d)",
        tekst: "<ul><li>Elementene kan hentes ut i innsettingsrekkefølge, fordi nye par alltid legges bakerst i entries.</li>" +
          "<li>Å iterere over ordboka tar n steg i stedet for N.</li>" +
          "<li>Rehash rører ikke parene i entries.</li>" +
          "<li>Mindre minne: de ledige plassene finnes bare i indices, og der er hver plass bare en liten indeks, ikke et helt par.</li></ul>",
        poeng: ["to fordeler gir full uttelling (2p)"] }
    ],
    hvorfor: {
      eli5: "<p>Du sier at lista med hull (indices) bare forteller hvor parene ligger, og at selve parene ligger tett i en annen liste (entries). Da følger alt annet: hvordan vi leter, hvordan vi legger til, og hvorfor det er lurt.</p>",
      normal: "<p>(a) får ett poengpar for oppslag og ett for innsetting, og det viktigste er at oppslaget går via indices til entries. (b) og (c) er korte definisjoner. I (d) holder to fordeler, så fire er god margin.</p>",
      teknisk: "<p>indices er tabellen vi prober i, med Load factor n/N. entries er et dynamisk array med n par. Hver probe koster ett ekstra arrayoppslag, men iterasjon blir O(n) i stedet for O(N), og rehash bygger bare indices på nytt.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2024, oppgave 5",
      deler: [
        { del: "(a)",
          kriterier: "<p>Maksimalt 4 poeng. Omtrent 2 poeng for oppslag og 2 poeng for innsetting.</p>" +
            "<p>I den nye strukturen vil oppslaget fremdeles starte med å beregne hashen i = h(k, N ) av nøkkelen k, der N er størrelsen av indices. Vi vil så slå opp indices[i], og dersom den ikke er tom, så vil vi sammenligne nøkkelen i entries, som da kan finnes på entries[indices[i]]. Dersom nøkkelen ikke stemmer overens med nøkkelen k, vil vi øke i med 1 (modulo N ), og slå opp på nytt. Dersom vi treffer en tom plass avsluttes søket.</p>" +
            "<p>Det viktigste poenget for oppslag er at vi slår opp i entries via indices.</p>" +
            "<p>For innsetting finner vi første ledige plass i indices med samme teknikk som ved oppslag. Hvis den første ledige plassen er j, så settes indices[j] til størrelsen av entries. Til slutt legger vi til nøkkel-verdi-paret på slutten av entries.</p>" },
        { del: "(b)",
          kriterier: "<p>Maksimalt 2 poeng.</p><p>En rehash forårsakes av at load faktoren n/N er for høy, altså at det ikke er så mye ledig plass. Da øker vi størrelsen på det underliggende arrayet (som var av størrelse N ), og setter inn alle elementene på nytt (med innsettingsalgoritmen til linear probing).</p>" },
        { del: "(c)",
          kriterier: "<p>Maksimalt 2 poeng.</p><p>I den nye strukturen vil entries kunne forbli uendret. Vi vil heller øke størrelsen på indices, og gjøre innsetting på alle elementene som beskrevet ovenfor (med unntak av å legge til i entries).</p>" },
        { del: "(d)",
          kriterier: "<p>Maksimalt 2 poeng.</p><p>Her er det flere fordeler:</p><ul>" +
            "<li>Elementene kan hentes ut i en forutsigbar rekkefølge (altså, rekkefølgen de ble satt inn i).</li>" +
            "<li>Iterering krever n steg i stedet for N steg (og N er alltid større enn n).</li>" +
            "<li>Rehashing påvirker ikke entries.</li>" +
            "<li>Lavere minnebruk, som følge av at det største arrayet indices kun trenger å inneholde indekser. I praksis bruker den 20% til 25% mindre minne. Disse tallene tallene er ikke mulig å forutsi fra beskrivelsen over, men man kan kanskje se at det vil resultere i lavere minnebruk.</li></ul>" +
            "<p>Det gis full uttelling hvis to av momentene ovenfor blir nevnt. Listen over er ikke nødvendigvis komplett, så andre gode poenger kan også gi uttelling.</p>" }
      ],
      merknad: "I sensorveiledningen står load faktoren som en brøk, n over N. Her er den skrevet n/N."
    }
  };

  /* ---------- H2021 · Oppgave 9 · Flest forekomster (8 poeng, skjønn) ---------- */
  P["H2021-9"] = {
    type: "skjonn",
    svar: [
      { tekst: "<ul>" +
          "<li><b>Antagelser.</b> Hashmapet er implementert med Linear probing eller Separate chaining slik i kurset, og hashfunksjonen sprer tallene godt. A har n ≥ 1 positive heltall, og k er det største tallet i A.</li>" +
          "<li><b>Strategi 1 (hashmap).</b> To løkker med n runder, og hver runde gjør et par put og get. Hver av dem er forventet O(1), så forventet kjøretid er <b>O(n)</b>. I verste tilfelle kan alle tallene havne på samme plass, så hver operasjon blir O(n), og totalt <b>O(n²)</b>. Kjøretiden avhenger ikke av k.</li>" +
          "<li><b>Strategi 2 (telle-array).</b> Å finne k er O(n), å lage og nullstille B er O(k), og den siste løkka er O(n). Totalt <b>O(n + k)</b>, både i verste og forventet tilfelle, fordi det ikke er noen hashing. Den bruker O(k) ekstra minne.</li>" +
          "<li><b>Når Strategi 2?</b> Når k ikke er stor, for eksempel k &lt; n. Da er begge lineære, men arrayoperasjonene har lavere konstantfaktorer enn hashing, som må regne hashverdier, håndtere kollisjoner og rehashe. Strategi 2 har heller ingen dårlig verste tilfelle.</li>" +
          "<li><b>Når Strategi 1?</b> Når k er mye større enn n, for eksempel k = n² eller ett enkelt svært stort tall i A. Da bruker Strategi 2 mye tid og minne på B, mens Strategi 1 fortsatt er forventet O(n).</li></ul>",
        kjoretid: "Strategi 1: O(n²) verste, O(n) forventet. Strategi 2: O(n + k) i begge.",
        poeng: ["verste og forventet tid for begge, begrunnet", "konkrete situasjoner for hver strategi (stor og liten k)", "antagelser skrevet ned", "tydelig tekst"] }
    ],
    hvorfor: {
      eli5: "<p>Du sier hvor raskt hver strategi er, både vanligvis og med uflaks, og når du ville valgt hver av dem. Og du skriver tydelig, så sensor forstår deg med en gang.</p>",
      normal: "<p>Sensor vurderer etter skjønn og ser etter de samme refleksjonene som svaret over har: O(n²) og O(n) for Strategi 1, O(n + k) for Strategi 2, at Strategi 2 er treg når k er stor, og at hashing har høyere konstantfaktorer.</p>",
      teknisk: "<p>Hashingen gir en forventet grense som er uavhengig av k, men ingen garanti. Telle-arrayet gir en garanti, men betaler O(k) for et array som kan være nesten tomt. Valget avhenger av forholdet mellom k og n, og av konstantene.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021, oppgave 9",
      kriterier: "<p>Dette er en oppgave som går ut på å gjøre rimelige antagelser og anvende dem til å si noe fornuftig om hvilken fremgangsmåte man bør bruke. Dette er den oppgaven fra eksamenssettet hvor sensoren er nødt til å anvende mest skjønn i poengsettingen. Tanken bak oppgaven er å få studenten til å reflektere over hvilken fremgangsmåte man bør velge i lys av kjøretidskarakteristikkene til de to strategiene. Det bør legges vekt på at teksten er godt skrevet (dette betyr ikke at det skal trekkes poeng for enkle skrivefeil, men at teksten må være tydelig og enkel å forstå; en fin tommelfingerregel er at en setning man ikke forstår etter to gjennomlesninger ignoreres). Under lister vi noen refleksjoner vi ønsker å se.</p>" +
        "<p>Strategi 1 benytter seg av et hashmap, som i verste tilfelle har lineærtid på innsetting og oppslag. Den gjør O(n) innsettinger og oppslag i H, som tilsammen utgjør O(n²) kjøretidskompleksitet i verste tilfelle. (Merk at vi her antar et hashmap implementert med linear probing eller separate chaining, slik vi har sett i kurset, og ikke for eksempel Java sine hashmaps, som bruker separate chaining, hvor hver «bøtte» er et rød-svart tre og gir logaritmisk tid på alle operasjoner i verste tilfelle.) Hashmaps har derimot forventet konstant tid på innsetting og oppslag, og dermed får O(n) forventet kjøretidskompleksitet.</p>" +
        "<p>Strategi 2 bruker kun arrayer, som har konstant tid på alle operasjoner. I motsetning til Strategi 1 finner vi det største elementet k, og lager et array B med plass til k elementer, og initialiserer det med verdien 0. Å finne det største elementet er i O(n), og opprettelsen og initialiseringen av B er i O(k). Den siste løkken er også i O(n). Tilsammen gir dette O(n + k) i både verste og forventet kjøretidskompleksitet (fordi vi ikke benytter oss av hashing).</p>" +
        "<p>Den mest vesentlige forskjellen mellom Strategi 1 og Strategi 2 er at Strategi 2 er treg dersom k er stor. Men hvis dette ikke er tilfelle (som for eksempel kan bety at k &lt; n) så vil Strategi 2 være mer effektiv enn Strategi 1, fordi en hashing har en del høyere konstantfaktorer som følge av rehashing og kollisjonshåndtering. I tillegg er det alltid en (svært liten) sjanse for at vi får mange kollisjoner, som gjenspeiles i analysen for verste tilfelle.</p>" +
        "<p>Merk: Det var en liten feil i Strategi 2, der vi lot størrelsen på B må være k, snarere enn k + 1.</p>",
      merknad: "Sensorveiledningen gir ingen poengfordeling for denne oppgaven. Eksamensarket slik det er gjengitt her, har «array of size k + 1», altså den rettede versjonen."
    }
  };

  /* ---------- H2020 · Oppgave 7 · Subanagram (a)–(c) ----------
     Delt nøkkel: 07-strategi.html viser (a) og (c) med deler. (d) hører til sorteringsblokken. */
  P["H2020-7"] = {
    type: "eksamen",
    svar: [
      { del: "(a)",
        tekst: "<p><b>O(s · w).</b> Kopien av W i linje 2 er O(w). Løkka i linje 3 går s ganger, én gang per bokstav i S. " +
          "I hver runde sjekker linje 4 om c er i r, og linje 5 fjerner kanskje en forekomst. r har høyst w bokstaver, så hver runde er O(w). " +
          "Totalt O(w + s · w) = O(s · w).</p>",
        kjoretid: "O(s · w)",
        poeng: ["riktig svaralternativ (4p)"] },
      { del: "(b)",
        tekst: "<p>Vi lager en frekvenstabell for S også, og sjekker at S har minst like mange av hver bokstav som W trenger. Har S for få av én bokstav, er W ikke et subanagram.</p>",
        kode: "hsSubanagram",
        etter: "<p>FreqTable(W) er O(w) og FreqTable(S) er O(s). Løkka går w ganger med to O(1)-oppslag. Totalt O(w + s).</p>",
        kjoretid: "O(w + s)",
        poeng: ["to frekvenstabeller brukt på fornuftig vis, i O(w + s)", "F.get(c) > G.get(c), ikke snudd (ellers −2)", "W og S ikke byttet om (ellers −2)", "sjekker subanagram, ikke anagram (ellers bare 2p totalt)"] },
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
      eli5: "<p>I (a) teller du hvor mange runder løkka går, og hvor mye hver runde koster. I (b) teller du bokstavene i begge ordene og sjekker at du har nok av hver. I (c) sier du hva hver strategi er bra og dårlig til, og når du ville valgt hver av dem.</p>",
      normal: "<p>(a) er et flervalg, og riktig valg gir hele poengsummen. I (b) gir to frekvenstabeller og én løkke full uttelling, så lenge sammenligningen går riktig vei. I (c) er hovedpoenget (3 av 6) å si at Strategi 2 lønner seg når S er liten og ordboka stor.</p>",
      teknisk: "<p>(a): kostnaden er skjult i hjelpeoperasjonene. «c is in r» og «remove» er lineære i |r| ≤ w, og de kalles s ganger. (b): to lineære tellinger og w oppslag i O(1) gir O(w + s). (c): O(d · (w + s)) mot O(2ˢ) er en avveining mellom lineær avhengighet av ordboka og eksponentiell avhengighet av s. Med d stor og s liten vinner den eksponentielle.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020, oppgave 7",
      deler: [
        { del: "(a)",
          fasit: "<ul><li>O(w + s)</li><li>O(s²)</li><li>O(w log(s))</li><li>O(s · w)</li><li>O(w²)</li></ul>" },
        { del: "(b)",
          fasit: "<p>Å bygge en frekvenstabell gjøres på lineær tid. En fin måte å løse denne oppgaven er å lage en frekvenstabell for begge strengene (som kan gjøres i O(w + s)) og sjekke at det for hver bokstav i W er minst like mange av den bokstaven i S:</p>",
          kode: { name: "IsSubanagramOf2", params: "W, S",
            lines: [L("Fw ← FreqTable(W)", 1), L("Fs ← FreqTable(S)", 1), L("for c ∈ W do", 1), L("if Fw.get(c) > Fs.get(c) then", 2), L("return false", 3), L("return true", 1)] },
          etter: "<p>Det finnes mange andre fremgangsmåter her, der man for eksempel heller dekrementerer hver bokstav i S fra frekvenstabellen til W, og sjekker at summen ender opp med å bli 0 eller mindre. Første linje i prosedyren IsSubanagramOf2 er veiledene, men den kan godt fjernes (hvis de for eksempel heller belager seg på en frekvenstabell for S).</p>" +
            "<p>Alle varianter av denne fremgangsmåten (altså benytter seg av en eller to frekvenstabeller på fornuftig vis) kan gi full uttelling dersom pseudokoden er lett forståelig og presis.</p>" +
            "<p>Vi trekker poeng for uklarheter og upresise svar. Dersom koden ikke kjører i O(w + s) får man ingen poeng.</p>",
          kriterier: "<p>Veiledende poengfordeling:</p><ul>" +
            "<li>Minus 2 poeng for å bytte om &lt; og &gt; (altså sjekke om Fw.get(c) &lt; Fs.get(c))</li>" +
            "<li>Minus 2 poeng for å bytte om S og W (ett sted)</li>" +
            "<li>Totalt 2 poeng for å sjekke om frekvensene er like/ulike, altså sjekke for anagram istedenfor subanagram</li></ul>" },
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
      merknad: "For (a) gjentar sensorveiledningen bare de fem svaralternativene og sier ikke hvilket som er riktig. Svaret O(s · w) i vårt svar er regnet ut av oss. I (b) kaller vi tabellene F og G (F er gitt i oppgaven), mens sensor kaller dem Fw og Fs. Deloppgave (c) vurderes etter skjønn: det finnes ikke ett fasitsvar, og vårt svar er ett eksempel som dekker kriteriene."
    }
  };
})();
