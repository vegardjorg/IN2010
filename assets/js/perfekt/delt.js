/* ============================================================
   IN2010 guide · perfekt/delt.js
   Fullpoengssvar for eksamensoppgaver som vises på mer enn én temaside. Én definisjon per
   oppgave, i stedet for én kopi per side. Lastes etter data-*.js og før kort/*.js.
   - H2020-7 (Subanagram): (a)–(c) på 05-hashing og 07-strategi, (d) på 01-sortering.
   - H2020-8 (Fire typer grafer): (a)–(h) på 06-grafer, (a) og (b) på 07-strategi.
   - H2025-5 (Level-order): 03-heap og 04-traer.
   utsnitt: [{ deler, hvorfor, merknad, intro }] gir egne tekster når et kort bare viser de delene
   (core.js, pfUtsnitt). kode kan være en liste: den første algoritmen som finnes på siden brukes.
   - svar: vårt eget fullpoengssvar på kursnivå (samme på alle nivåer).
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette
     kilder (forelesning, ukesoppgaver, lærebok) hører hjemme her.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.PERFEKT = IN.PERFEKT || {};
  var P = IN.PERFEKT;

  function L(code, indent) { return { code: code, indent: indent }; }
  // Pseudokode-objekt: lines = [[innrykk, kode], …]
  function PC(name, params, input, output, lines) {
    var o = { name: name, params: params, lines: lines.map(function (l) { return L(l[1], l[0]); }) };
    if (input) o.input = input;
    if (output) o.output = output;
    return o;
  }
  function N(id, x, y) { return { id: id, x: x, y: y }; }
  // Figur: en graf tegnet med guidens graftegning
  function gfig(g, cap, extra, scale) {
    return { cap: cap, draw: function (h) {
      if (!IN.vizGraph) return;
      var st = { g: g }; for (var k in (extra || {})) st[k] = extra[k];
      IN.vizGraph(h, st, { scale: scale || 0.8, ariaLabel: cap.replace(/<[^>]+>/g, "") });
    } };
  }
  function tab(head, rows) {
    return '<div class="gr-pf-tab"><table class="et-tab"><tr>' + head.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return i ? "<td>" + c + "</td>" : '<th style="text-align:left">' + c + "</th>"; }).join("") + "</tr>"; }).join("") + "</table></div>";
  }
  // Flere deloppgaver av samme oppgave fra en annen temaside: svar og sensor legges til, og de egne
  // tekstene (hvorfor, merknad) blir et utsnitt som brukes når kortet bare viser disse delene.
  function utvid(key, deler, obj) {
    var p = P[key];
    p.svar = p.svar.concat(obj.svar || []);
    if (obj.sensor && obj.sensor.deler) p.sensor.deler = p.sensor.deler.concat(obj.sensor.deler);
    p.utsnitt = (p.utsnitt || []).concat([{ deler: deler, hvorfor: obj.hvorfor, merknad: obj.sensor && obj.sensor.merknad }]);
  }

  /* ---------- H2025 5 · Level-order (12 poeng) ----------
     03-heap.html og 04-traer.html. (a) og (b) viser sidens egen pseudokode når den finnes. */
  P["H2025-5"] = {
    type: "eksamen",
    svar: [
      {
        del: "(a)",
        tekst: "<p>En heap er et komplett binærtre som er lagret nivå for nivå, fra venstre mot høyre, i arrayet: roten på plass 0, barna på plass 1 og 2, barnebarna på plass 3–6, og så videre. Arrayet er altså allerede i level-order, så vi kopierer det over i en liste.</p>",
        kode: ["levelOrderHeap", { name: "LevelOrderHeap", params: "A", input: "En binær heap, representert ved et array A med n elementer", output: "En liste med elementene i heapen i level-order",
          lines: [L("L ← empty list", 1), L("for i ← 0 to n − 1 do", 1), L("append A[i] to L", 2), L("return L", 1)] }],
        poeng: ["at arrayet allerede er i level-order, og en algoritme som returnerer det som en liste (2p)"]
      },
      {
        del: "(b)",
        tekst: "<p>Bredde-først fra roten med en <b>kø</b>. Vi legger roten i køen. Så lenge køen ikke er tom, tar vi ut den første noden u, legger <span class=\"mono\">u.element</span> bakerst i lista, og legger barna til u bakerst i køen hvis de finnes. " +
          "Et tre har ingen sykler, så vi trenger ingen mengde med besøkte noder.</p>" +
          "<p>For treet på arket gir dette 10, 15, 5, 12, 17, 7, 2. Se steg-demoen i dette kortet.</p>",
        kode: ["levelOrderBSTExam", "levelOrderBST"],
        fasitVerdi: "10, 15, 5, 12, 17, 7, 2",
        poeng: ["bredde-først med kø, ikke stakk (en stakk gir dybde-først, −3p)", "null-sjekk på roten og på begge barna (mangler de, opptil −2p)", "at det er elementene, ikke nodene, som havner i lista", "en riktig algoritme (opptil 6p)"]
      },
      {
        del: "(c)",
        tekst: "<p>Begge er <b>O(n)</b>. I (a) kopieres hvert av de n elementene én gang. I (b) går hver node inn og ut av køen nøyaktig én gang, og det er O(1) hver gang.</p>",
        kjoretid: "(a) O(n), (b) O(n)",
        poeng: ["O(n) for begge (1p)"]
      },
      {
        del: "(d)",
        tekst: "<p>Input-treet og output-treet er <b>like</b>: samme form og samme element på hver plass.</p>" +
          "<p class=\"small muted\">Begrunnelse (kreves ikke): i level-order kommer roten først og hver node etter forelderen sin. Når u settes inn i B, ligger alle forfedrene til u allerede i B, på samme plass som i v. Da følger søkestien i B den samme veien som i v, og u havner på samme plass.</p>",
        poeng: ["«de er like» (3p). Oppgaven krever ingen begrunnelse"]
      }
    ],
    hvorfor: {
      eli5: "<p>I (a) er knepet at heapen allerede står nivå for nivå i arrayet. I (b) vil sensor se en kø, for en kø tar nodene i den rekkefølgen de kom, nivå for nivå. Du må også passe på noder som mangler barn. I (d) holder det å si at trærne blir like.</p>",
      normal: "<p>Svaret treffer det sensor gir poeng for: (a) bruker at arrayet er i level-order, (b) er bredde-først med kø og null-sjekker, (c) gir O(n) for begge, og (d) sier at trærne er like.</p>",
      teknisk: "<p>Level-order er bredde-først rekkefølge. FIFO-køen sørger for at alle nodene på dybde d tas ut før noen på dybde d + 1. For en heap er dette indeksrekkefølgen. I (d) kommer hver forelder før barna sine i level-order, så innsetting i den rekkefølgen gjenskaper nøyaktig det samme søketreet.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2025 5",
      deler: [
        { fasit: "<p>Merk at output for algoritmene under er en liste, men det er en liten detalj som ikke er vesentlig for algoritmene. Vi trekker ikke poeng for dette alene, men det kan være med på å trekke i samspill med andre unøyaktigheter.</p>" },
        { del: "(a)", fasit: "<p>En heap er allerede i level-order, så det er tilstrekkelig å returnere heapen som en liste.</p>",
          kode: { name: "LevelOrderHeap", params: "A", lines: [L("list ← an empty list", 1), L("for i ← 0 to n − 1 do", 1), L("append A[i] to list", 2), L("return list", 1)] },
          kriterier: ["Inntil 2 poeng."] },
        { del: "(b)", fasit: "<p>Dette gjøres enklest ved hjelp av et bredde-først søk fra rotnoden. Siden input er et tre er det ikke nødvendig å bruke et visited-set.</p>",
          kode: { name: "LevelOrderBST", params: "v", lines: [
            L("list ← an empty list", 1), L("queue ← an empty queue", 1), L("if v ≠ null then", 1), L("queue.enqueue(v)", 2),
            L("while queue is not empty do", 1), L("u ← queue.dequeue()", 2), L("append u.element to list", 2),
            L("if u.left ≠ null then", 2), L("queue.enqueue(u.left)", 3), L("if u.right ≠ null then", 2), L("queue.enqueue(u.right)", 3),
            L("return list", 1)] },
          kriterier: ["Inntil 6 poeng.",
            "Inntil 2 poeng trekk for manglende null-sjekker (altså, ikke ta høyde for at en node mangler venstre/høyre barn).",
            "Trekk 3 poeng for bruk av stack i stedet for kø (som gir dybde først, i stedet for bredde først).",
            "Vi trekker ikke for overflødig bruk av visited-set (men det trekker litt ned på helhetsinntrykket)."] },
        { del: "(c)", fasit: "<p>Begge er O(n), siden de flytter elementene over i en liste.</p>",
          kriterier: ["Inntil 1 poeng for riktig kjørekompleksitet på begge algoritmer."] },
        { del: "(d)", fasit: "<p>Input-treet og output-treet er like. Roten vil plasseres først, så vil dens to barn plasseres, og deretter deres barn og så videre.</p>",
          kriterier: ["Inntil 3 poeng for riktig svar.", "Oppgaven krever ikke en begrunnelse."] }
      ],
      merknad: "Sensor skriver <span class=\"mono\">list</span>, <span class=\"mono\">queue.enqueue(v)</span> og <span class=\"mono\">queue.dequeue()</span>. Vårt svar bruker kursets skrivemåte fra forelesningen om trær, <span class=\"mono\">Enqueue(Q, v)</span> og <span class=\"mono\">Dequeue(Q)</span>. Det er de samme operasjonene."
    }
  };

  /* ---------- H2020 8 · Fire typer grafer (38 poeng) ----------
     06-grafer.html viser (a)–(h), 07-strategi.html (a) og (b). */
  function sq(edges) {
    return { directed: false, nodes: [N("A", 0, 0), N("B", 90, 0), N("C", 0, 90), N("D", 90, 90)],
      edges: edges.map(function (e) { var diag = e[0] + e[1] === "AD" || e[0] + e[1] === "BC"; return [e[0], e[1], e[2], diag ? { t: 0.3 } : null]; }) };
  }
  var S20 = sq([["A", "B", 8], ["C", "D", 8], ["A", "C", 3], ["B", "D", 3], ["A", "D", 1], ["B", "C", 1]]);
  P["H2020-8"] = {
    type: "eksamen",
    intro: "<p>Grafene er urettede, og en kant skrives {u, v}. Sertifikatet C er et array med indeksene 0, …, N − 1.</p>",
    svar: [
      { del: "(a)",
        tekst: "<p>Sertifikatet C er en foreslått rekkefølge av husene. Vi sjekker at hvert par av noder som står etter hverandre i C, har en kant i G, <b>også paret fra den siste noden tilbake til den første</b>. Mangler én kant, svarer vi NEI. Finnes alle, svarer vi JA. Oppgaven lover at hver node står nøyaktig én gang i C, så det trenger vi ikke sjekke.</p>",
        kode: ["type2Verifier", "stType2Verifier"],
        etter: "<p>(i + 1) mod N gir 0 når i = N − 1. Da sjekker den siste runden kanten fra C[N − 1] tilbake til C[0], og det er den som skiller en sykel fra en sti. Verifikatoren leter aldri etter en sykel selv. Den sjekker bare forslaget.</p>",
        kjoretid: "N = |V| runder med ett kantoppslag hver: O(|V|) med nabomatrise, O(|V| + |E|) med naboliste. Begge er polynomielle",
        fasitVerdi: "JA",
        poeng: ["sjekke at hver kant i C er en kant i G, også den siste tilbake til start (5p, −1 hvis kanten tilbake til start mangler)", "signatur og oversiktlig svar (2p)"] },
      { del: "(b)",
        tekst: "<p>Type2Verifier kjører i polynomiell tid. Får vi en JA-instans av Type2 sammen med et sertifikat C, kan vi altså verifisere JA-svaret i polynomiell tid. Det er definisjonen av at et avgjørelsesproblem er i NP.</p>",
        poeng: ["koble den polynomielle verifikatoren til definisjonen av NP (3p)"] },
      { del: "(c)",
        tekst: "<p>En hamiltonsk sykel går innom alle nodene. Fjerner vi én node v, blir resten av sykelen en sti som fortsatt går innom alle de andre nodene, så grafen er fortsatt sammenhengende. Med andre ord kan to noder alltid nå hverandre på to måter: hver sin vei rundt sykelen, og bare den ene av dem kan gå gjennom v. Det bruker at grafen er urettet. Da finnes det ingen separasjonsnode, og grafen er 2-sammenhengende.</p>",
        poeng: ["sykelen gir to veier mellom alle par av noder (én hver vei rundt)", "nevne at grafen er urettet"] },
      { del: "(d)",
        tekst: "<p>C er en sykel som inneholder alle nodene, også s og t. Vi finner plassen til s i C, og går så rundt sykelen den ene veien til vi treffer t. Etterpå går vi den andre veien. De to stiene bruker hver sin bue av sykelen, så de deler bare s og t.</p>",
        kode: "twoPaths",
        etter: "<p>Eksempel (steg-demoen i dette kortet): C = [A, B, C, D, E, F], s = B og t = E gir stiene B, C, D, E og B, A, F, E.</p>",
        kjoretid: "O(|V|). Hver løkke går høyst N = |V| runder",
        fasitVerdi: "B, C, D, E og B, A, F, E",
        poeng: ["sti én vei", "sti motsatt vei", "modulo (eller lignende) for å gå syklisk", "ryddig oppsett og signatur"] },
      { del: "(e)",
        tekst: "<p>For hvert par av noder beholder vi den letteste av kantene fra T1–T4:</p>" +
          tab(["Kant", "Fra", "Vekt i S"], [["{A, B}", "T1 (10), T2 (8)", "<b>8</b>"], ["{A, C}", "T1, T2, T3 (3)", "<b>3</b>"], ["{A, D}", "T1, T3, T4 (1)", "<b>1</b>"],
            ["{B, C}", "T1, T2, T4 (1)", "<b>1</b>"], ["{B, D}", "T1, T2, T3 (3)", "<b>3</b>"], ["{C, D}", "T1 (10), T2 (8)", "<b>8</b>"]]),
        fig: gfig(S20, "S: den sammenslåtte grafen", {}, 0.9),
        poeng: ["riktig vekt på alle seks kantene"] },
      { del: "(f)",
        tekst: "<ul>" +
          "<li><b>Nei, ikke nødvendigvis.</b> Mange kanter har samme vekt. Et minimalt spenntre er bare garantert unikt når alle kantvektene er forskjellige, og her kan for eksempel to kanter med vekt 3 være like gode valg.</li>" +
          "<li><b>Nei.</b> G4 er av type 4, altså ikke sammenhengende. Et spenntre må nå alle nodene, så vi trenger minst én kant som ikke er fra G4.</li>" +
          "<li><b>Ja.</b> G3 er et tre som når alle nodene. Uten G4 er kantene fra G3 (vekt 3) de billigste i G. Kruskal tar dem først, og de lager aldri en sykel fordi G3 er et tre. Etter dem er treet ferdig, så det minimale spenntreet er nøyaktig G3. (Hver kant med høyere vekt ville lukket en sykel, så den er ikke med.)</li>" +
          "<li><b>3.</b> Kruskal stopper når siste kant er valgt. Den kanten kobler sammen de to siste trærne. Den kan ikke være fra G4, fordi G4 ikke er sammenhengende og alle G4-kantene tas først. G3 er et spenntre, så for enhver todeling av nodene finnes det en G3-kant (vekt 3) mellom de to delene. Den siste kanten er derfor billigst mulig blant kantene mellom de to siste trærne, altså vekt 3.</li></ul>",
        fasitVerdi: "3",
        poeng: ["riktig svar med en kort, generell begrunnelse på hvert punkt (ikke bare ut fra eksempelgrafene)"] },
      { del: "(g)",
        tekst: "<ul><li><b>Type 1 med vekt 10: en algoritme som bare returnerer 10.</b> Grafen er komplett, så det går en kant direkte fra s til t. Den korteste stien er alltid den ene kanten. O(1).</li>" +
          "<li><b>Type 2 med vekt 8: BFS.</b> Alle kantene har samme vekt, så den korteste stien er den med færrest kanter. BFS finner den i O(|V| + |E|), og lengden er 8 · antall kanter. Dijkstra gir også riktig svar, men er tregere.</li></ul>" +
          "<p class=\"small muted\">Vi antar at s ≠ t.</p>",
        poeng: ["riktig algoritme for type 1", "riktig algoritme for type 2"] },
      { del: "(h)",
        tekst: "<p>Først slår vi sammen kantmengdene og beholder den letteste kanten for hvert par. Så kjører vi Dijkstra fra A:</p>" +
          tab(["Node", "A", "B", "C", "D", "E", "F", "G", "H"], [["Avstand fra A", "0", "2", "2", "1", "4", "7", "8", "10"]]) +
          "<ul><li>D: A–D (1)</li><li>B: A–D–B (1 + 1)</li><li>C: A–D–C (1 + 1). Kanten A–C har vekt 3, så den er dårligere.</li><li>E: A–D–E (1 + 3)</li>" +
          "<li>F: A–D–E–F (4 + 3). Kanten A–F har vekt 8.</li><li>G: A–D–E–F–G (7 + 1)</li><li>H: A–H (10). Via G blir det 8 + 3 = 11, og via E 4 + 8 = 12.</li></ul>" +
          "<p>Kjøretid: Dijkstra er O((|V| + |E|) · log(|V|)). E1 gir alle par en kant med vekt 10, så den sammenslåtte grafen er komplett med |E| = |V| · (|V| − 1) / 2 (28 kanter her). I det generelle tilfellet blir det O(|V|² · log(|V|)).</p>",
        fasitVerdi: "A 0, B 2, C 2, D 1, E 4, F 7, G 8, H 10",
        poeng: ["riktig avstand til alle åtte nodene"] }
    ],
    hvorfor: {
      eli5: "<p>Oppgaven er lang, men hver del spør om én ting. Svar kort på det den spør om, og begrunn med én eller to setninger.</p>",
      normal: "<p>Svarene er de samme som i sensorveiledningen. I (a) og (d) er det modulo-regningen som gir de siste poengene, og i (f) må begrunnelsene gjelde generelle grafer, ikke bare eksempelgrafene fra (e). Ellers gir sensor bare halv uttelling.</p>",
      teknisk: "<p>(a)–(b) tester hva en verifikator er og hvorfor den viser at Type2 er i NP. (c)–(d) bruker at en hamiltonsk sykel gir to veier mellom alle par. (e)–(h) tester minimale spenntrær (unikhet, kuttegenskapen) og korteste stier (BFS når alle vekter er like, Dijkstra ellers).</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020 8",
      deler: [
        { del: "(a)",
          kode: PC("Type2Verifier", "G, C", "En graf G og et array av noder C", "Returner JA hvis C viser at G er av type 2, NEI ellers",
            [[1, "(V, E) ← G"], [1, "N ← |C|"], [1, "for i ← 0 to N − 1 do"], [2, "if (C[i], C[(i + 1) mod N]) ∉ E then"], [3, "return NEI"], [1, "return JA"]]),
          etter: "<p>Det viktige i denne oppgaven er at man sjekker at etterfølgende par av noder i C svarer til kanter i G. Det er også nødvendig å sjekke at siste og første node i C utgjør en kant i G; dette gjør vi i siste iterasjon av loopen, der i = N − 1, hvor vi da sjekker om (C[N - 1], C[0]) er en kant i G (fordi N mod N = 0).</p>",
          kriterier: "<p>Veiledende poengfordeling:</p><ul><li>5 poeng for å sjekke om e ∈ E(C) ⇒ e ∈ E(G); minus 1 poeng om de glemmer siste kant</li><li>2 poeng for signatur og generell oversiktlig besvarelse</li><li>Ingen poeng for å finne en generell sykel, f.eks. ved hjelp av BFS/DFS</li></ul>" },
        { del: "(b)", fasit: "<p>Type2Verifier kjører i polynomiell tid. Derfor kan JA-instanser av Type2 verifiseres i polynomiell tid. Dette er kravet for å være i NP.</p>" },
        { del: "(c)", fasit: "<p>Hvis grafen inneholder en hamiltonsk sykel kan alle noder nå alle andre på minst to måter. Dette er ved å følge sykelen «den ene eller den andre» veien. Her bruker vi at grafen er urettet.</p>" },
        { del: "(d)",
          fasit: "<p>Siden C er et sertifikat for at G inneholder en hamiltonsk sykel, så utgjør C en sykel som inneholder alle noder i G. Det vil si at vi har en sykel som nødvendigvis inneholder både s og t. Alt vi trenger å gjøre er å finne s og så følge sykelen i begge retninger til vi finner t, hvor hver retning svarer til en distinkt sti mellom s og t.</p>",
          kode: PC("TwoPaths", "G, C, s, t", null, null,
            [[1, "N ← |C|"], [1, "si ← 0"], [1, "while C[si] ≠ s do"], [2, "si ← si + 1"], [1, "i ← si"], [1, "while C[i] ≠ t do"], [2, "print(C[i])"], [2, "i ← (i + 1) mod N"],
             [1, "print(C[i])"], [1, "i ← si"], [1, "while C[i] ≠ t do"], [2, "print(C[i])"], [2, "i ← (i − 1) mod N"], [1, "print(C[i])"]]),
          kriterier: "<p>Veiledene poengfordeling:</p><ul><li>2 poeng for sti en vei</li><li>2 poeng for sti motsatt vei</li><li>2 poeng for å huske modulo-operator eller lignende for å få til syklisk iterasjon</li><li>2 poeng for riktig oppsett (signatur/ryddig svar)</li><li>Ingen poeng for å finne alle stier i G ved hjelp av DFS</li><li>1-2 poeng hvis de finner 2 mulige distinkte stier og stopper etter det.</li></ul>" },
        { del: "(e)", fasit: "<p>[Figur i sensorveiledningen: grafen S med vektene A–B 8, C–D 8, A–C 3, B–D 3, A–D 1 og B–C 1.]</p>" },
        { del: "(f)",
          fasit: "<ul><li>Nei, det er ikke garantert fordi flere kantar kan ha samme vekt. Et unikt minimalt spenntre er bare garantert når ingen kanter har samme vekt.</li>" +
            "<li>Nei, fordi G4 ikke er sammenhengende. Poenget med spenntreet er at det skal spenne ut grafen, vi må derfor bruke andre kanter enn kun de fra G4.</li>" +
            "<li>Ja. Dette er fordi G3 er av type 3 og derfor er et tre. Hvis G4 ikke inneholder noen kanter, vil alle de billigste kantene være i G3 så spenntreet er derfor også minimalt.</li>" +
            "<li>3. Kruskal terminerer når siste kant er valgt, og det er den billigste kanten som forbinder de to siste spenntrærne (T1 og T2). Denne kanten kan ikke være i G4 som forklart i punkt 2 over. Siden G3 er et spenntre, som forklart i punkt 3, må det finnes en kant som forbinder enhver ikke-triviell todeling av nodene. Dette er fordi hvis det var mulig å lage T1 og T2 uten at det fantes en slik kant i G3 så hadde ikke G3 vært et spenntre.</li></ul>",
          kriterier: "<p>Kun halv uttelling hvis studenten forklarer ut fra grafene fra forrige deloppgave istedenfor for en generell graf. Manglende begrunnelse gir ikke uttelling.</p>" },
        { del: "(g)",
          fasit: "<ul><li>Type 1, vekt 10: En algoritme som bare returnerer 10</li><li>Type 2, vekt 8: BFS</li></ul>" +
            "<p>Merk at det er en liten svakhet i oppgaven her, hvor vi burde spesifisert at s ≠ t. Det er allikevel ikke direkte feil, fordi en sti ikke kan inneholde samme node flere ganger; altså er det å gå fra s til s ikke en sti.</p>" },
        { del: "(h)", fasit: "<p>A 0 · B 2 · C 2 · D 1 · E 4 · F 7 · G 8 · H 10</p>" }
      ],
      merknad: "Poengene står på eksamensarket. Sensor skriver kanten som et par (C[i], C[(i + 1) mod N]); vi skriver {…}, slik kurset skriver en urettet kant. I (d) skriver sensor (i − 1) mod N og mener matematisk modulo (resultatet er alltid mellom 0 og N − 1); vi skriver (i − 1 + N) mod N for å gjøre det entydig. I (e) er svaret en figur og i (g) avkryssede alternativer i sensorveiledningen. Her står de som tekst."
    }
  };
  // 07-strategi.html viser bare (a) og (b): egne tekster for det utsnittet
  P["H2020-8"].utsnitt = [{
    deler: ["(a)", "(b)"],
    intro: null,
    hvorfor: {
      eli5: "<p>Du sjekker bare at forslaget henger sammen, steg for steg, og at du kommer hjem igjen til slutt. Du prøver ikke selv å finne en rundtur. Det er nøyaktig det oppgaven ber om.</p>",
      normal: "<p>Svaret i (a) sjekker alle N kantene i forslaget, også den siste tilbake til start, som var der det ble trukket poeng. (b) bruker verifikatoren direkte: polynomiell verifikator betyr at problemet er i NP.</p>",
      teknisk: "<p>NP er avgjørelsesproblemene der JA-instanser har et sertifikat som kan sjekkes i polynomiell tid. Type2Verifier er en slik sjekk med N kantoppslag. Et forsøk på å finne en sykel med BFS eller DFS svarer på et annet spørsmål og ga ingen poeng.</p>"
    },
    merknad: "Sensor skriver kanten som et par (C[i], C[(i + 1) mod N]). Grafen er urettet, og kurset skriver en urettet kant som en mengde {u, v}, slik pseudokoden i vårt svar gjør. Det betyr det samme her."
  }];

  /* ---------- H2020 7 · Subanagram (a)–(c) ----------
     05-hashing.html viser (a)–(c), 07-strategi.html (a) og (c). */
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
      kilde: "Kilde: sensorveiledning IN2010 H2020 7",
      deler: [
        { del: "(a)",
          fasit: "<ul><li>O(w + s)</li><li>O(s²)</li><li>O(w log(s))</li><li><b>O(s · w)</b> <span class=\"small muted\">(vår merking: sensorveiledningen markerer dette alternativet med blå tekst som riktig)</span></li><li>O(w²)</li></ul>" },
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
      merknad: "For (a) gjentar sensorveiledningen de fem svaralternativene og markerer det riktige, O(s · w), med blå tekst. Fargen kommer ikke med her, så vi har merket det selv. I (b) kaller vi tabellene F og G (F er gitt i oppgaven), mens sensor kaller dem Fw og Fs. Deloppgave (c) vurderes etter skjønn: det finnes ikke ett fasitsvar, og vårt svar er ett eksempel som dekker kriteriene."
    }
  };

  /* ---------- H2020 7d · Sortering av subanagrammer (6 poeng) ----------
     01-sortering.html viser bare (d). */
  utvid("H2020-7", ["(d)"], {
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
      kilde: "Kilde: sensorveiledning IN2010 H2020 7",
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
