/* ============================================================
   IN2010 guide · perfekt/grafer.js
   «Perfekt svar» for eksamensoppgavene om grafer (lastes på 06-grafer.html,
   etter data-grafer.js). Samme format som de andre perfekt-filene.
   - svar: vårt eget fullpoengssvar på kursnivå (samme på alle nivåer).
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette
     kilder (forelesning, ukesoppgaver, lærebok) hører hjemme her.
   - H2020-8 (Fire typer grafer) vises også på 07-strategi.html og står i perfekt/delt.js.
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
  // Ekstra prosedyre under hovedkoden (hjelpeprosedyre)
  function pfig(algo) { return { draw: function (h) { if (IN.pseudo) IN.pseudo.render(h, algo, { tooltips: false }); } }; }
  function tab(head, rows) {
    return '<div class="gr-pf-tab"><table class="et-tab"><tr>' + head.map(function (x) { return "<th>" + x + "</th>"; }).join("") + "</tr>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return i ? "<td>" + c + "</td>" : '<th style="text-align:left">' + c + "</th>"; }).join("") + "</tr>"; }).join("") + "</table></div>";
  }

  /* ---------- H2020 · Oppgave 3 · Grafegenskaper (8 poeng) ---------- */
  var H20_3 = [
    ["G sammenhengende", "den er allerede sammenhengende, så ingenting", "Alle de seks nodene henger sammen."],
    ["G ikke sammenhengende", "fjerne kanter", "Vi må kutte kanter til en node eller en del faller av."],
    ["G et tre", "fjerne kanter", "G har 6 noder og 7 kanter. Et tre med 6 noder har 5, så vi må fjerne to kanter (og bryte sykler)."],
    ["G ikke et tre", "den er allerede ikke et tre, så ingenting", "G har sykler, så den er ikke et tre."],
    ["H en DAG", "den er en allerede en DAG, så ingenting", "Ingen rettet sykel: alle pilene går «framover»."],
    ["H ikke en DAG", "legge til kanter", "Vi må legge til en kant bakover, for eksempel fra en node tilbake til en forgjenger, for å lage en sykel."],
    ["H sterkt sammenhengende", "legge til kanter", "Ingen kan nå startnoden (den har inngrad 0), og ingenting kommer ut av sluttnodene. Det trengs flere kanter."],
    ["H ikke sterkt sammenhengende", "den er allerede ikke sterkt sammenhengende, så ingenting", "En DAG med mer enn én node er aldri sterkt sammenhengende."]
  ];
  P["H2020-3"] = {
    type: "eksamen",
    svar: H20_3.map(function (r, i) { return { del: String(i + 1), tekst: "<p><b>" + r[1].charAt(0).toUpperCase() + r[1].slice(1) + ".</b> " + r[2] + "</p>" }; }),
    hvorfor: {
      eli5: "<p>Se først hva grafen er nå. Er den det spørsmålet spør om, er svaret «ingenting». Ellers: trenger du flere streker eller færre?</p>",
      normal: "<p>Svarene er de samme som i sensorveiledningen. Nøkkelen er tre fakta: et tre med n noder har nøyaktig n − 1 kanter, å legge til kanter kan aldri fjerne en sykel, og å fjerne kanter kan aldri gjøre en graf mer sammenhengende.</p>",
      teknisk: "<p>Egenskapene er monotone: sammenheng og «har en sykel» bevares når vi legger til kanter, og «er en DAG» bevares når vi fjerner kanter. Derfor er det bare én av «legge til» og «fjerne» som kan hjelpe i hvert spørsmål.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020, oppgave 3",
      deler: H20_3.map(function (r, i) { return { del: String(i + 1), fasit: "<p>" + r[1] + "</p>" }; }),
      merknad: "Sensorveiledningen viser alternativene til hvert spørsmål og markerer det riktige. Her står bare det riktige alternativet. Sensorveiledningen sier ikke hvordan de 8 poengene fordeles."
    }
  };

  /* ---------- H2021 · Oppgave 7 · Korteste avstander i grafer (8 poeng) ---------- */
  var H21_7 = [["Ingen negative kanter", "Dijkstra", "Dijkstra er raskest når ingen vekter er negative: O((|V| + |E|) · log(|V|))."],
    ["Vektet DAG", "Topologisk sortering", "Relakser kantene i topologisk rekkefølge. Det virker også med negative vekter, siden en DAG ikke har sykler: O(|V| + |E|)."],
    ["Uvektet", "Bredde-først søk", "BFS gir korteste vei målt i antall kanter: O(|V| + |E|)."],
    ["Ingen negative sykler", "Bellman-Ford", "Negative kanter er lov, men grafen kan ha sykler. Da trengs Bellman-Ford: O(|V| · |E|)."]];
  P["H2021-7"] = {
    type: "eksamen",
    svar: H21_7.map(function (r) { return { del: r[0], tekst: "<p><b>" + r[1] + ".</b> " + r[2] + "</p>", poeng: ["2 poeng"] }; }),
    hvorfor: {
      eli5: "<p>Bruk den enkleste metoden som fortsatt gir riktig svar. Jo mer «rotete» grafen kan være, desto kraftigere (og tregere) metode trengs.</p>",
      normal: "<p>De fire typene er sortert fra snill til vrien: uvektet (BFS), DAG (topologisk sortering), ikke-negative vekter (Dijkstra) og bare «ingen negative sykler» (Bellman-Ford).</p>",
      teknisk: "<p>«Raskest» betyr den med lavest kjøretid som fortsatt er korrekt. BFS og DAG-metoden er O(|V| + |E|), Dijkstra O((|V| + |E|) · log(|V|)) og Bellman-Ford O(|V| · |E|). Merk: en «urettet» graf med en negativ kant har alltid en negativ sykel (gå fram og tilbake), så Bellman-Ford-raden gjelder i praksis rettede grafer når det finnes negative kanter.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021, oppgave 7",
      deler: H21_7.map(function (r) { return { del: r[0], fasit: "<p>" + r[1] + "</p>" }; }).concat([{ kriterier: "<p>Det gis 2 poeng per riktig svar.</p>" }]),
      merknad: "I sensorveiledningen er svarene kryss i en tabell. Her står de som tekst."
    }
  };

  /* ---------- H2021 · Oppgave 11 · To-fargelegge en graf (10 poeng) ---------- */
  P["H2021-11"] = {
    type: "eksamen",
    svar: [{
      tekst: "<p>Vi gjør et dybde-først søk fra en vilkårlig node, som blir rød. Hver gang vi finner en nabo uten farge, får den motsatt farge av noden vi kom fra. Finner vi en nabo som alt har <b>samme</b> farge, er det umulig, og vi sier fra. Grafen er sammenhengende, så ett søk når alle nodene.</p>",
      kode: "twoColor",
      etter: "<p>Det virker fordi alle fargevalgene er tvunget: startfargen er fri, men deretter bestemmer hver node fargen til naboene sine. Ser vi to naboer med samme tvungne farge, finnes det en sykel med odde antall noder, og den kan ikke fargelegges med to farger.</p>",
      kjoretid: "O(|V| + |E|), som et vanlig dybde-først søk",
      fasitVerdi: "A R, B B, C B, D R, E B, F R",
      poeng: ["DFS eller BFS som flipper fargen", "sjekk av naboer med samme farge, med melding om at det ikke er mulig", "godt presentert pseudokode"] }],
    hvorfor: {
      eli5: "<p>Den første får rød. Alle vennene dens må være blå, alle vennene deres røde, og så videre. Møter vi noen som allerede har feil farge, går det ikke.</p>",
      normal: "<p>Sensorveiledningen gir full uttelling for en godt presentert løsning med dybde- eller bredde-først søk. Den lineære kjøretiden kommer gratis med søket.</p>",
      teknisk: "<p>Tofarging er det samme som å sjekke om grafen er todelt (bipartitt). Søket gir hver node farge etter avstanden fra start (partall eller oddetall i DFS-treet), og en kant mellom to noder med samme farge lukker en odde sykel.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021, oppgave 11",
      deler: [
        { fasit: "<p>Å fargelegge en graf med to farger kan gjøres enkelt med et dybde-først (eller bredde-først) søk, der vi flipper fargen mellom hvert rekursive kall i søket. Dersom vi når en node, som allerede har en satt farge, som er ulik den som skal settes, så kan vi avbryte med melding om at det ikke er mulig å fargelegge grafen med to farger. Grunnen til at denne strategien fungerer (riktig nok bare for to farger), er at hvert valg av farge tvinges av foreldrenoden i DFS-spenntreet.</p>",
          kode: PC("TwoColor", "G", "En sammenhengende graf G = (V, E)", "En graf der nodene er fargelagt hvis det er mulig", [[1, "v ← arbitrary v ∈ V"], [1, "TwoColorDFS(G, v, R)"]]) },
        { kode: PC("TwoColorDFS", "G, u, C", null, null, [[1, "if u.color = null then"], [2, "u.color ← C"], [2, "for (u, v) ∈ E do"], [3, "TwoColorDFS(G, v, FlipColor(C))"], [1, "else if C ≠ u.color then"], [2, "Abort with message “impossible”"]]),
          kriterier: "<p>For full uttelling må det gis en godt presentert løsning med dybde- eller bredde først søk (eller en annen god løsning vi ikke har tenkt på enda). For en god beskrivelse av idéen kan det gis full uttelling, hvis den er svært presist formulert (altså, like presist som pseudokode).</p><p>Det gis opp til 7 poeng for riktig idé, men med vesentlige feil i pseudokoden.</p><p>Det gis ingen poeng for idéer som ikke vil lede til et korrekt svar. For idéer som gir riktig svar, men som vil ha veldig dårlig kjøretid kan det gis opp til 3 poeng.</p>" }
      ],
      merknad: "Sensors løsning er rekursiv; vår bruker en eksplisitt stakk. Begge er dybde-først søk med samme kjøretid."
    }
  };

  /* ---------- H2021 · Oppgave 12 · Whops!-oppgjør (10 poeng) ---------- */
  P["H2021-12"] = {
    type: "eksamen",
    svar: [{
      tekst: "<p>Penger kan bare sendes langs kanter, så de kan aldri forlate en sammenhengende komponent. Oppgjøret går derfor opp hvis og bare hvis <b>summen av T i hver komponent er 0</b>. Vi finner komponentene med dybde-først søk (som i DFSFull) og summerer T for hver av dem.</p>",
      kode: "canSettle",
      etter: "<p>G₁ har komponentene {0, 1, 2} med sum 500 − 200 − 300 = 0 og {3, 4} med sum −50 + 50 = 0, så svaret er true. I G₂ har {0, 2} summen 300 + 0 = 300 ≠ 0, så svaret er false.</p>",
      kjoretid: "O(|V| + |E|): ett søk gjennom hele grafen, og hver T[v] summeres én gang",
      fasitVerdi: "true",
      poeng: ["innsikten: sjekk at hver komponent summerer til 0", "presis beskrivelse av hvordan DFS finner komponentene og hvordan summene sjekkes"] }],
    hvorfor: {
      eli5: "<p>De som kan sende penger til hverandre, er én gruppe. Pengene i en gruppe blir i gruppa. Da går det opp bare hvis hver gruppe går i null.</p>",
      normal: "<p>Sensorveiledningen gir opp til 5 poeng for selve innsikten og 5 for en presis beskrivelse av komponentsøket og summene. Svaret over har begge.</p>",
      teknisk: "<p>Summen per komponent er invariant: en overføring endrer to tall i samme komponent med +x og −x. Sum 0 er derfor nødvendig. Den er også nok: i en sammenhengende komponent kan alle sende til én node langs stier, og den noden kan så betale ut.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021, oppgave 12",
      deler: [
        { fasit: "<p>Innsikten som trengs for å løse denne oppgaven er at dersom summen (med hensyn til T) i hver av komponentene av grafen G er 0, så går oppgjøret opp med Whops!. Vi kan samle komponenten som tilhører en node v, ved å gjøre et dybde-først (eller bredde-først) fra v. Ved et fullt dybde-først søk samler vi komponentene for hver node v ∈ V. Til slutt kan vi gå gjennom hver komponent, og sjekke at summen av T[v] for alle v i komponenten er 0.</p>" +
            "<p>I denne oppgaven er det viktigere at studenten klarer å kommunisere idéen bak algoritmen godt, enn å skrive pseudokode som veldig enkelt lar seg oversette til et konkret programmeringsspråk. Det er helt greit om studenten gjør antagelser om representasjonen av grafen (for eksempel en nabomatrise, nabolister eller en mer objekt-orientert stil). Løsningsforslaget nedenfor er ganske detaljert, men binder seg ikke til noen spesifikk representasjon av grafen.</p>",
          kode: PC("ComponentOf", "s, G", "En graf G = (V, E) og en tabell av heltall T", "true hvis oppgjøret går opp i Whops!, false ellers.",
            [[1, "component ← empty set"], [1, "stack ← [s]"], [1, "while stack is not empty do"], [2, "v ← pop stack"], [2, "add v to component"], [2, "for (v, u) ∈ E do"], [3, "if u ∉ component then"], [4, "add u to stack"], [1, "return component"]]) },
        { kode: PC("ComponentsOf", "G", null, null, [[1, "components ← empty set"], [1, "visited ← empty set"], [1, "for v ∈ V do"], [2, "if v ∉ visited then"], [3, "C ← ComponentOf(v, G)"], [3, "add C to components"], [3, "add every c ∈ C to visited"], [1, "return components"]]) },
        { kode: PC("Settleable", "G, T", null, null, [[1, "for C in ComponentsOf(G) do"], [2, "if Σ_{v∈C} T[v] ≠ 0 then"], [3, "return false"], [1, "return true"]]),
          kriterier: "<p>En setning som tilsvarer «Sjekk at alle komponenter summerer til 0 med hensyn til T» gir opp til 5 poeng. De resterende 5 poengene fordeles etter hvor gode og presise beskrivelser studenten gir av hvordan dette skal beregnes (altså, hvordan DFS kan brukes for å beregne komponentene, og hvordan vi sjekker summene med hensyn på T).</p>" }
      ],
      merknad: "Input og Output står over den første prosedyren i sensorveiledningen og gjelder hele løsningen (Settleable)."
    }
  };

  /* ---------- H2021 · Oppgave 13 · Whops!-logger (10 poeng) ---------- */
  P["H2021-13"] = {
    type: "eksamen",
    svar: [{
      tekst: "<p>Det første kravet er en topologisk ordning, så vi bruker kursets topologiske sortering med inngrader. Det andre kravet løser vi ved å bytte ut stakken med en <b>prioritetskø ordnet på v.ts</b>. Blant nodene som er klare (alle forgjengerne er skrevet ut), tar vi alltid den med minst tidsstempel. Da brytes aldri det første kravet, og tidsstemplene kommer så tidlig som mulig.</p>",
      kode: "logSort",
      etter: "<p>For eksempelet blir utskriften A1, B2, A4, C3, C5, B6, altså «A sent 50 to B at 1», «B received 50 from A at 2», «A sent 100 to C at 4», «C received 100 from A at 3», «C sent 200 to B at 5», «B received 200 from C at 6». C3 må vente på A4 på grunn av kanten A4 → C3, selv om tidsstempelet er lavere.</p>",
      kjoretid: "O((|V| + |E|) · log(|V|)): hver node settes inn og tas ut av heapen én gang, O(log |V|) hver, og hver kant telles ned én gang",
      fasitVerdi: "A1, B2, A4, C3, C5, B6",
      poeng: ["topologisk sortering (krav 1)", "heap ordnet på ts i stedet for stakk (krav 2)", "kjøretid O((|V| + |E|) · log(|V|))"] }],
    hvorfor: {
      eli5: "<p>En hendelse kan skrives når alt som må skje før den, er skrevet. Av alle som er klare, tar vi den som har lavest klokkeslett.</p>",
      normal: "<p>Sensorveiledningen gir full uttelling bare for O((|V| + |E|) log |V|). En vanlig topologisk sortering gir opp til 5 poeng, og en modifisert som er kvadratisk, opp til 8. Heapen er det som gir de siste poengene.</p>",
      teknisk: "<p>Topologisk sortering er korrekt uansett hvilken struktur som holder de klare nodene. Med en min-heap på ts blir den grådige regelen «minst ts blant de klare» oppfylt i hvert steg. Grafen er en DAG (hendelser i en logg kan ikke gå i ring), så alle nodene blir skrevet ut.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021, oppgave 13",
      deler: [{
        fasit: "<p>Denne oppgaven kan løses med en litt modifisert topologisk sortering. I en standard topologisk sortering av nodene plasserer alle noder med inngrad 0 på en stack. For hver node u som besøkes, så fjerner vi alle kanter (u, v), og plasserer v på stacken dersom den får inngrad 0 som en konsekvens av å ha besøkt u. Dette er tilstrekkelig for å garantere at dersom det er en sti fra u til v, så skrives u ut før v. Merk at det ikke spiller noen rolle for den topologiske sorteringen om vi bruker en stack, en kø, eller en annen datastruktur med konstant tid på innsetting og uttak.</p>" +
          "<p>Det andre kravet sier at dersom det ikke er en sti fra u til v, så skal u skrives ut før v hvis u.ts &lt; v.ts; med andre ord vil vi sortere nodene etter tidsstempelet, enn så lenge det ikke bryter med det første kravet.</p>" +
          "<p>Som allerede nevnt, er det ikke viktig hva slags datastruktur vi bruker for å lagre nodene som er klare for å bli besøkt for at den topologiske sorteringen skal være korrekt. Dermed kan vi bruke en heap som ordnes etter tidsstemplene, og dermed garantere at vi hele tiden besøker den noden med det minste tidsstempelet, uten å bryte med den topologiske ordningen.</p>",
        kode: PC("TopSortLogs", "G = (V, E)", "En rettet graf G = (V, E)", "Skriv ut nodene i V slik kantene i grafen respekteres, og tidsstemplene minimeres.",
          [[1, "H ← empty heap, ordered by ts"], [1, "for v ∈ V do"], [2, "if indegree of v is 0 then"], [3, "add v to H"], [1, "while H is not empty do"], [2, "u ← pop smallest from H"], [2, "print(u)"],
           [2, "for (u, v) ∈ E do"], [3, "remove u from the incoming edges of v"], [3, "if indegree of v is 0 then"], [4, "add v to H"]]),
        kriterier: "<p>En umodifisert topologisk sortering gir opp til 5 poeng. Sortering etter tidsstemplene, uten å ta høyde for kantene i grafen gis opp til 2 trøstepoeng.</p><p>En modifisert topologisk sortering, som løser problemet i kvadratisk tid gis opp til 8 poeng. For full uttelling må algoritmen kjøre i O((|V| + |E|) log |V|).</p>" }],
      merknad: "Sensor fjerner kanter fra grafen; vi teller ned en inngrad i stedet. Det er det samme, men koster bare O(1) per kant."
    }
  };

  /* ---------- H2022 · Oppgave 3 · Grafegenskaper (10 poeng) ---------- */
  var H22_3 = [["Grafen er sammenhengende", "Begge", "Alle nodene henger sammen i begge grafene."],
    ["Grafen er 2-sammenhengende", "Ingen", "G1 er et tre, og G2 har separasjonsnodene C og E."],
    ["Grafen er et tre", "G1", "G1 har 6 noder, 5 kanter og er sammenhengende. G2 har 6 kanter og en sykel."],
    ["Grafen har mer enn to seprasjonsnoder", "G1", "G1 har B, C og F. G2 har bare C og E."],
    ["Grafen har to (forskjellige) stier fra B til F", "G2", "G2: B – C – F og B – C – E – F. I et tre (G1) finnes bare én sti."],
    ["Grafen har to komponenter", "Ingen", "Begge er sammenhengende, altså én komponent."],
    ["Grafen er rettet", "Ingen", "Ingen av grafene har piler."],
    ["Grafen inneholder en sykel", "G2", "C – E – F – C."],
    ["Grafen blir ett tre hvis vi fjerner én kant", "G2", "Fjerner vi en kant fra sykelen C – E – F, blir G2 et tre. (Tatt ut av vurderingen.)"],
    ["Grafen er en enkel graf", "Begge", "Ingen løkker og ingen parallelle kanter."]];
  P["H2022-3"] = {
    type: "eksamen",
    svar: H22_3.map(function (r) { return { del: r[0], tekst: "<p><b>" + r[1] + ".</b> " + r[2] + "</p>" }; }),
    hvorfor: {
      eli5: "<p>Tegn grafene for deg selv, og sjekk én påstand om gangen på begge.</p>",
      normal: "<p>Svarene er de samme som i sensorveiledningen. G1 er et tre, og G2 er et tre pluss én kant (som gir sykelen C – E – F). Nesten alle påstandene følger av det.</p>",
      teknisk: "<p>Et tre med n noder har n − 1 kanter, og hver node med grad ≥ 2 er en separasjonsnode. Én ekstra kant lager nøyaktig én sykel, og nodene på sykelen kan ikke lenger skille resten fra hverandre langs sykelen.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 3",
      deler: H22_3.map(function (r) { return { del: r[0], fasit: "<p>" + r[1] + "</p>" }; }).concat([{ kriterier: "<p>Det gis 1 poeng per riktig svar. Spørsmålet som er uthevet i rødt er uklart, og tas ut av vurderingen.</p>" }]),
      merknad: "I sensorveiledningen er svarene kryss i en tabell. Påstanden som er uthevet i rødt, er «Grafen blir ett tre hvis vi fjerner én kant»."
    }
  };

  /* ---------- H2022 · Oppgave 6 · Kjøretid på grafalgoritmer (8 poeng) ---------- */
  var H22_6 = [["DFSFull", "O(|V| + |E|)", "Hver node besøkes én gang, og hver kant sjekkes fra hver ende."],
    ["Prim", "O((|V| + |E|) · log(|V|))", "Hver kant går inn og ut av en prioritetskø à O(log |V|)."],
    ["TopSort", "O(|V| + |E|)", "Hver node og hver kant behandles én gang."],
    ["BellmanFord", "O(|V| · |E|)", "|V| − 1 runder over alle kantene."]];
  P["H2022-6"] = {
    type: "eksamen",
    svar: H22_6.map(function (r) { return { del: r[0], tekst: "<p><b>" + r[1] + ".</b> " + r[2] + "</p>", poeng: ["2 poeng"] }; }),
    hvorfor: {
      eli5: "<p>Søk og topologisk sortering ser på alt én gang. Prim må i tillegg holde en kø i orden, og Bellman-Ford går over alle kantene mange ganger.</p>",
      normal: "<p>Svarene er de samme som i sensorveiledningen. «Laveste korrekte» betyr den minste av kolonnene som fortsatt er en riktig øvre grense.</p>",
      teknisk: "<p>Lineært er O(|V| + |E|). Prim (og Dijkstra) med binær heap gir en ekstra faktor log(|V|). Bellman-Ford er O(|V| · |E|) fordi den gjør |V| − 1 runder med O(|E|) arbeid.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 6",
      deler: H22_6.map(function (r) { return { del: r[0], fasit: "<p>" + r[1] + "</p>" }; }).concat([{ kriterier: "<p>Det gis 2 poeng per riktig svar.</p>" }]),
      merknad: "I sensorveiledningen er svarene kryss i en tabell. Her står de som tekst."
    }
  };

  /* ---------- H2022 · Oppgave 8 · Garbage collection (8 poeng) ---------- */
  P["H2022-8"] = {
    type: "eksamen",
    svar: [{
      tekst: "<p>Et objekt skal beholdes hvis og bare hvis det kan nås fra et objekt i R. Vi kjører derfor kursets <b>DFSVisit</b> fra hvert objekt i R, med én felles visited. Etterpå inneholder visited nøyaktig de objektene som kan nås fra R. Så går vi gjennom V og kaller Free på alle som ikke er i visited.</p>",
      kode: "garbageCollect",
      etter: "<p>Objekter som peker på hverandre i ring, men som ingen rot når, blir også frigjort. Det er et poeng med å merke det som kan nås, i stedet for å telle referanser.</p>",
      kjoretid: "O(|V| + |E|): søkene deler visited, så hver node og kant behandles høyst én gang, og løkka over V er O(|V|)",
      fasitVerdi: "D, F, G, H",
      poeng: ["riktig idé: søk fra R og frigjør det som ikke ble besøkt", "tydelig hvorfor DFSVisit kalles og hva resultatet er", "O(|V| + |E|)"] }],
    hvorfor: {
      eli5: "<p>Følg alle pilene fra det programmet bruker, og sett kryss. Det som ikke fikk kryss, kan ingen nå, så det kan kastes.</p>",
      normal: "<p>Sensorveiledningen godtar at vi kaller DFSVisit, men krever at det kommer tydelig fram hvorfor vi kaller den og hva resultatet er. Svaret sier begge deler. Den trekker 2 poeng for løsninger som er tregere enn O(|V| + |E|), for eksempel et nytt visited for hver rot.</p>",
      teknisk: "<p>Felles visited er det som gir lineær tid: et objekt som nås fra flere røtter, besøkes bare første gang. Med et nytt visited per rot blir det O(|R| · (|V| + |E|)).</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 8",
      deler: [{
        fasit: "<p>Oppgaven løses enklest ved å gjøre et dybde-først søk (DFSVisit) fra hver node i R, og deretter frigjøre alle noder i V som ikke er blitt besøkt.</p>",
        kode: PC("GarbageCollect", "G, R", "En objektgraf G = (V, E) og en mengde R med objekter", "Frigjør alle objekter det ikke finnes en referanse til",
          [[1, "stack ← stack initialized with elements from R"], [1, "visited ← empty set"], [1, "while stack is not empty do"], [2, "u ← stack.pop()"], [2, "if u not in visited then"], [3, "add u to visited"], [3, "for (u, v) in E do"], [4, "add v to stack"],
           [1, "// Free all unvisited vertices"], [1, "for v in V do"], [2, "if v not in visited then"], [3, "Free(v)"]]),
        kriterier: "<p>Riktig idé gir opptil 4 poeng. For full uttelling må også prosedyren være beskrevet tilstrekkelig detaljert (helst med pseudokode), ikke være unødvendig komplisert og være uten feil. De kan godt anta at de har DFSVisit tilgjengelig, men må også komme tydelig frem hvorfor de kaller på den, og hva resultatet av kallet er.</p><p>Det trekkes to poeng for løsninger som har høyere kjøretidskompleksitet enn O(|V| + |E|).</p>" }],
      merknad: "Tomme linjer i sensors pseudokode er utelatt."
    }
  };

  /* ---------- H2022 · Oppgave 12 · Minimal forside (10 poeng) ---------- */
  P["H2022-12"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p><b>Antall sammenhengende komponenter.</b> I en urettet graf når én link inn i en komponent hele komponenten, og ingen link kan nå to komponenter. Vi teller komponentene med DFSFull: hver gang den ytre løkka starter et nytt søk, har vi funnet en ny komponent. O(|V| + |E|).</p>", poeng: ["returner antall komponenter"] },
      { del: "(b)", tekst: "<p><b>Antall noder med inngrad 0.</b> I en DAG kan alle noder nås fra en node med inngrad 0 (gå bakover langs kantene til du ikke kommer lenger). En node med inngrad 0 kan bare nås fra forsiden, så den må ha en egen link. Vi teller inngrader som i topologisk sortering. O(|V| + |E|).</p>", poeng: ["returner antall noder med inngrad 0"] },
      { del: "(c)", tekst: "<p><b>Antall komponenter med inngrad 0 i komponentgrafen.</b> Finn de sterkt sammenhengende komponentene (Kosaraju). Slå hver komponent sammen til én node. Da blir grafen en DAG, og svaret fra (b) gjelder: én link til en vilkårlig node i hver komponent som ingen kant går inn til fra en annen komponent. O(|V| + |E|).</p>", poeng: ["sterkt sammenhengende komponenter", "tell komponentene med inngrad 0 i komponentgrafen"] }
    ],
    hvorfor: {
      eli5: "<p>Forsiden må ha en vei inn til hver «øy» som ingen andre fører til. Oppgaven er å telle de øyene.</p>",
      normal: "<p>Svarene er de samme som i sensorveiledningen. (c) kombinerer (b) med sterkt sammenhengende komponenter: inne i en komponent når alle hverandre, så én link per «startkomponent» holder.</p>",
      teknisk: "<p>Komponentgrafen til en rettet graf er alltid en DAG. Derfor reduseres (c) til (b). Alle tre delene er lineære.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 12",
      deler: [
        { del: "(a)", fasit: "<p>Opp til 3 poeng. Returner antall komponenter grafen består av.</p>" },
        { del: "(b)", fasit: "<p>Opp til 3 poeng. Returner antall noder med inngrad 0.</p>" },
        { del: "(c)", fasit: "<p>Opp til 4 poeng. Finn de sterkt sammenhengende komponentene av grafen; returner antall noder med inngrad 0 i komponentgrafen.</p>" }
      ]
    }
  };

  /* ---------- H2023 · Oppgave 6 · Blindern-problemet (10 poeng) ---------- */
  P["H2023-6"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<ul><li><b>Urettet og vektet.</b> En tunnel kan gås begge veier, og hver har en kostnad. Siden alle par er kartlagt, er grafen komplett.</li><li><b>Nodene</b> er bygningene.</li><li><b>Kantene</b> er mulige tunneler mellom to bygninger, med kostnaden for å grave som vekt.</li></ul>", poeng: ["urettet, vektet (komplett) graf", "noder = bygninger, kanter = tunneler med kostnad"] },
      { del: "(b)", tekst: "<p>Vi vil ha billigst mulig kantmengde som kobler sammen alle nodene: et <b>minimalt spenntre</b>. Vi bruker <b>Prims algoritme</b>.</p>" +
          "<ul><li><b>Datastrukturer:</b> en prioritetskø (min-heap) med kanter ordnet på vekt, og en ordbok parents som sier hvilke noder som er med i treet (og via hvilken kant).</li>" +
          "<li><b>Slik virker den:</b> start i en vilkårlig bygning. Legg kantene ut fra den i køen. Ta ut den billigste kanten. Går den til en bygning som ikke er med i treet, tar vi den med og legger kantene ut fra den nye bygningen i køen. Går den til en bygning som alt er med, kaster vi den. Når køen er tom, er alle med.</li>" +
          "<li><b>Kjøretid:</b> O((|V| + |E|) · log(|V|)) = O(|E| · log(|V|)). Grafen er komplett, så det er O(|V|² · log(|V|)).</li></ul>",
        kode: "prim", fasitVerdi: "13",
        poeng: ["en algoritme for minimale spenntrær", "datastrukturene", "forklaringen", "riktig kjøretid"] },
      { del: "(c)", tekst: "<p>Tunnelsystemet er et tre, så det finnes nøyaktig én sti mellom to bygninger. Vi kan finne den med <b>BFS</b> (eller DFS) fra startbygningen, og så følge forelderpekerne bakover fra målet. Vektene spiller ingen rolle, siden det bare finnes én sti. Kjøretiden er O(|V| + |E|), og i et tre er |E| = |V| − 1, så O(|V|).</p>", poeng: ["BFS eller DFS i treet", "riktig kjøretid"] }
    ],
    hvorfor: {
      eli5: "<p>Først: koble alle husene billigst mulig (minimalt spenntre). Etterpå finnes det bare én vei mellom to hus, så du trenger bare å lete den opp.</p>",
      normal: "<p>Sensorveiledningen gir opp til 3 poeng for BFS eller DFS i (c), men bare opp til 1 poeng for Dijkstra. Det er fordi tunnelsystemet er et tre, så et vanlig søk er nok.</p>",
      teknisk: "<p>(b): Prim med binær heap er O(|E| · log(|V|)), og for en komplett graf er |E| = |V| · (|V| − 1) / 2. (c): i et tre er stien unik, så BFS gir den i lineær tid. Vektene i oppgaven er kostnader for å grave, ikke gangtid.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2023, oppgave 6",
      deler: [
        { del: "(a)", fasit: "<p>Problemet bør tenkes på som en komplett, vektet og urettet graf, der hver node i representerer en bygning og hver kant representerer en tunnel som kan bygninges ut. Kantene er vektet etter hvor mye det koster å grave tunnelen.</p>",
          kriterier: "<p>Opptil 2 poeng for en god forklaring av hva slags graf oppgaven handler om.</p>" },
        { del: "(b)", fasit: "<p>Vi kan løse problemet ved å finne et minimalt spenntre over G. Algoritmen vi kjenner best fra kurset er Prim sin algoritme for minimale spenntrær.</p>" +
            "<p>Den fungerer ved å bygge et tre fra en vilkårlig valgt startnode. Naboene av startnoden plasseres på en prioritetskø, der vekten på kanten utgjør prioriteten. Grafen traverseres videre ved å plukke noder fra prioritetskøen, og legge dem til i treet dersom noden ikke allerede er i treet. Når alle noder er i treet vil vi ha bygninget et minimalt spenntre for G.</p>" +
            "<p>Algoritmen er i O((|V| + |E|) · log(|V|)), som kan forenkles til O(|E| · log(|V|)) fordi grafen er sammenhengende. Siden grafen er komplett kan kjøretidskompleksiteten også uttrykkes som O(|V|<sup>2</sup> · log(|V|)). Alle disse gir like god uttelling.</p>",
          kriterier: ["Opptil 5 poeng på deloppgaven for en god forklaring av en effektiv forklaring av en algoritme for minimale spenntrær.", "Opptil 2 poeng for datastrukturene.", "Opptil 2 poeng for forklaringen.", "1 poeng for riktig kjøretidskompleksitet."] },
        { del: "(c)", fasit: "<p>Det resulterende tunnelsystemet er et tre, som betyr at det kun finnes én sti mellom hvert par av noder. Derfor kan du finne stien i O(|V| + |E|), med en hvilken som helst traversering, for eksempel BFS eller DFS.</p>" +
            "<p>Å bruke Dijkjstra her er ikke helt veldefinert, fordi vektene på kantene som er beskrevet i oppgaven har med kostnaden av å bygninge tunnelene, ikke hvor lang tid det tar å gå i dem. Det vil riktignok gi riktig svar, fordi vektene ikke spiller noen rolle når det kun finnes én sti mellom hvert par av noder.</p>",
          kriterier: ["Opptil 3 poeng for en løsning med BFS eller DFS.", "Opptil 1 poeng for en løsning med Dijkstra.", "1 poeng for riktig kjøretidskompleksitet (for en løsning med Dijkstra må man ha riktig kjøretidskompleksitet for å få uttelling for deloppgaven)."] }
      ],
      merknad: "Sensorveiledningen gir ikke en fast poengsum per deloppgave, bare øvre grenser per kriterium. Steg-demoen kjører Prim på guidens egen eksempelgraf (totalvekt 13), siden arket ikke har noen graf."
    }
  };

  /* ---------- H2023 · Oppgave 7 · Dependency hell (12 poeng) ---------- */
  P["H2023-7"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p>Vi bruker kursets topologiske sortering med inngrader, men teller bare hvor mange noder som blir behandlet. Først legges alle noder med inngrad 0 på en stakk. Så tar vi ut én node om gangen og teller ned inngraden til naboene. En nabo som får inngrad 0, legges på stakken. Noder på en sykel får aldri inngrad 0, så hvis ikke alle nodene blir behandlet, finnes det en sykel.</p>",
        kode: "hasCycleDirected", fasitVerdi: "true",
        kjoretid: "O(|V| + |E|): hver node og hver kant behandles høyst én gang",
        poeng: ["en godt beskrevet algoritme i O(|V| + |E|), med forklaring av topologisk sortering"] },
      { del: "(b)", tekst: "<p>Grafen er asyklisk. Fra hver node med inngrad 0 gjør vi et søk der vi legger <b>alle</b> naboene på stakken, også de vi har sett før. Kommer en node ut av stakken for andre gang i samme søk, har den blitt nådd fra to ulike forgjengere, altså finnes det to ulike stier dit. Der de to stiene skilles og møtes første gang, har vi to distinkte stier: en diamant. Alle noder kan nås fra en node med inngrad 0, så det holder å starte der.</p>",
        kode: "isDiamond", fasitVerdi: "true",
        kjoretid: "O(|VS| · (|V| + |E|)), der VS er nodene med inngrad 0. I verste fall O(|V| · (|V| + |E|)), men med én startnode bare O(|V| + |E|)",
        poeng: ["søk bare fra noder med inngrad 0", "oppdage en node som nås to ganger i samme søk"] }
    ],
    hvorfor: {
      eli5: "<p>(a): Hvis noen venter på hverandre i ring, blir de aldri klare. (b): Hvis du kan gå to forskjellige veier fra ett bibliotek til et annet, har du en diamant.</p>",
      normal: "<p>(a) gir opp til 5 poeng bare for en lineær løsning; en løsning i O(|V| · (|V| + |E|)) gir opp til 3. I (b) gir sensorveiledningen opp til 7 poeng for en løsning som søker fra nodene med inngrad 0, men opp til 5 for ett søk per node i grafen.</p>",
      teknisk: "<p>(a): G er en DAG hvis og bare hvis topologisk sortering behandler alle |V| nodene. (b): i en DAG betyr «nådd to ganger fra s» to ulike stier, ikke en sykel. Fordi visited nullstilles per startnode, teller ikke det at to startnoder når samme node.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2023, oppgave 7",
      deler: [
        { del: "(a)", fasit: "<p>Dette bør løses på lineær tid. Mest naturlig er å bruke topologisk sortering (som oppdager sykler). Algoritmen for topologisk sortering plasserer først alle noder med inngrad 0 på en stack. Noder plukkes av stacken så lenge den ikke er tom, og for hver node som plukkes av fjernes alle dens utgående kanter (som fører til at dens naboer får lavere inngrad). Hvis en node får inngrad 0 plasseres den på stacken. Grafen er asyklisk hvis og bare hvis alle nodene blir prosessert.</p>",
          kode: PC("isCyclic", "G", null, null, [[1, "stack ← empty stack"], [1, "processed ← 0"], [1, "for v ∈ V do"], [2, "if indegree of v is 0 then"], [3, "stack.push(v)"], [1, "while stack is not empty do"], [2, "u ← stack.pop()"], [2, "processed ← processed + 1"],
            [2, "for (u, v) ∈ E do"], [3, "remove u from the incoming edges of v"], [3, "if indegree of v is 0 then"], [4, "add v to stack"], [1, "return processed < |V|"]]),
          etter: "<p>En annen mulighet er å finne de sterkt sammenhengende komponentene av grafen, og sjekke om det finnes komponenter av størrelse større enn én.</p><p>Det er også fullt mulig å skrive et modifisert dybde-først søk som oppdager sykler. I en slik løsning vil man typisk skille mellom en node er uoppdaget, under prosessering eller ferdig prosessert. Dersom man under et søk finner en kant til en node som er under prosessering kan man konkludere med at grafen inneholder en sykel. En annen lignende (og nærliggende) løsning er å sjekke om en node er på stacken (fordi da er den under prosessering); med en vanlig stack vil dette gi O(|V| · (|V| + |E|)).</p>",
          kriterier: ["Opptil 5 poeng for en godt beskrevet algoritme som løser problemet i O(|V| + |E|).", "Opptil 3 poeng dersom løsningen er i O(|V| · (|V| + |E|))."] },
        { del: "(b)", fasit: "<p>Det er tilstrekkelig å gjøre en traversering for hver node med inngrad null. Hvis vi sier at VS er nodene i V som har inngrad null vil algoritmen være i O(|VS| · (|V| + |E|)). Hvis vi antar at det kun er én node med inngrad null, så er algoritmen i O(|V| + |E|). Hvis vi antar at alle nodene har inngrad null, så algoritmen i O(|V|) (fordi alle søk vil starte og stoppe i samme node). Verste tilfelle må ligge et sted mellom disse ytterkantene, og være begrenset til O(|V| · (|V| + |E|)). Det er allikevel en betydelig forbedring fra å søke fra alle nodene.</p>",
          kode: PC("isDiamond", "G", null, null, [[1, "VS ← the empty set"], [1, "for v ∈ V do"], [2, "if indegree of v is 0 then"], [3, "add v to VS"], [1, "for s ∈ VS do"], [2, "stack ← stack containing s"], [2, "visited ← empty set"],
            [2, "while stack is not empty do"], [3, "u ← stack.pop()"], [3, "if u ∈ visited then"], [4, "return true"], [3, "add u to visited"], [3, "for (u, v) ∈ E do"], [4, "add v to stack"], [1, "return false"]]),
          etter: "<p>En lignende løsning er å ta utgangspunkt i alle noder som har inngrad større eller lik to, og søke i den reverserte grafen.</p><p>Uten disse forbedringene vil en løsning typisk gjøre én traversering for hver node, som er i O(|V| · (|V| + |E|)).</p>",
          kriterier: ["Opptil 7 poeng for en god løsning som er omtrent like effektiv som forslaget ovenfor.", "Opptil 5 poeng for en god løsning som gjør en traversering per node i grafen.", "Opptil 4 poeng for en god løsning som ikke er i O(|V| · (|V| + |E|)).", "Generelt bør det gis noe uttelling for de som viser god forståelse for problemet, og skisserer en løsning som kunne fungert."] }
      ],
      merknad: "Tomme linjer i sensors pseudokode er utelatt. Kursets HasCycleDirected teller ned en inngrad i stedet for å fjerne kanter, men gjør det samme."
    }
  };

  /* ---------- H2024 · Oppgave 4 · Jazz eller klassisk? (10 poeng) ---------- */
  P["H2024-4"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p>En <b>urettet graf</b> G = (V, E): <b>nodene</b> er personene i nettverket (du selv er s), og det går en <b>kant</b> {u, v} mellom to personer som er venner. Musikksmaken ligger ikke i grafen, men i ordboka M.</p>", poeng: ["noder = personer, kanter = vennskap"] },
      { del: "(b)", tekst: "<p>Vi gjør et <b>bredde-først søk</b> fra s og stopper ved dybde k. BFS tar nodene lag for lag, så avstanden dist[v] er antall venneledd. Fra noder på avstand k går vi ikke videre. Underveis teller vi hvor mange som liker jazz og hvor mange som liker klassisk.</p>",
        kode: "jazzOrClassical", fasitVerdi: "jazz",
        etter: "<p class=\"small muted\">Tips: bruk BFS her. Et dybde-først søk med en felles visited kan i noen grafer merke en venn som besøkt via en lang vei, og så ikke gå videre fra den når den senere kunne vært nådd med færre ledd.</p>",
        kjoretid: "O(|V| + |E|) i verste fall, men bare delen av grafen innen k ledd blir sett på",
        poeng: ["traversering fra s som stopper ved dybde k", "tell jazz og klassisk", "ikke en full traversering"] },
      { del: "(c)", tekst: "<p><b>Bredde-først søk (BFS).</b> Det besøker nodene lag for lag: først alle på avstand 1 (dine venner), så alle på avstand 2, og så videre.</p>", poeng: ["BFS"] }
    ],
    hvorfor: {
      eli5: "<p>Spør først vennene dine, så vennene deres, og stopp når du har gått k ledd. Tell hvem som liker hva.</p>",
      normal: "<p>Sensorveiledningen trekker 3 poeng hvis k ikke tas høyde for i det hele tatt, og 1–2 poeng hvis k ikke håndteres riktig. BFS med dist gjør grensen enkel å få riktig.</p>",
      teknisk: "<p>BFS gir korteste avstand (i antall kanter) første gang en node oppdages. Derfor er det trygt å merke noden med en gang, og testen dist[u] &lt; k stopper søket nøyaktig ved dybde k.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2024, oppgave 4",
      deler: [
        { del: "(a)", fasit: "<p>Maksimalt 1 poeng.</p><p>Dette er en urettet graf G = (V, E), der nodene er personer i nettkverket og kantene er vennskap. Det er også mulig å tenke at vennskap er asymmetrisk, som gjør grafen rettet; det gjør ingen forskjell for algoritmen under, og gir like mye uttelling.</p><p>Oppgaveteksten er litt uklar (selv om den blir klarere sett i sammenheng med resten av oppgaveteksten). Derfor er vi svært snille i poenggivningen på denne.</p>" },
        { del: "(b)", fasit: "<p>Maksimalt 7 poeng.</p><p>Dette kan løses med en traversering fra s som stopper ved dybde k, der vi teller opp antall jazz og klassisk. Det bør ikke gjøres en full traversering.</p>",
          kode: PC("JazzOrClassicalVisit", "G, u, k, visited", null, null, [[1, "add u to visited"], [1, "if k = 0 then"], [2, "return"], [1, "for (u, v) ∈ E do"], [2, "if v ∉ visited then"], [3, "JazzOrClassicalVisit(G, v, k − 1, visited)"]]) },
        { del: "(b)", kode: PC("JazzOrClassical", "G, M, s, k", null, null, [[1, "visited ← empty set"], [1, "JazzOrClassicalVisit(G, s, k, visited)"], [1, "jazz ← 0"], [1, "classiscal ← 0"], [1, "for v ∈ visited do"], [2, "if \"jazz\" ∈ M[v] then"], [3, "jazz ← jazz + 1"],
            [2, "if \"klassisk\" ∈ M[v] then"], [3, "classical ← classical + 1"], [1, "if jazz > classical then"], [2, "return \"jazz\""], [1, "return \"klassisk\""]]),
          kriterier: "<p>Det trekkes 3 poeng dersom k ikke tas høyde for i det hele tatt. Det trekkes 1–2 poeng dersom k ikke håndteres riktig avhengig av hvor godt forsøket er.</p>" },
        { del: "(c)", fasit: "<p>Maksimalt 2 poeng.</p><p>Her ønsker vi å gå lagvis gjennom grafen, som oppnås enkelt ved hjelp av et bredde-først søk.</p>" }
      ],
      merknad: "«classiscal» står slik i sensors kode. Sensors kode teller også s selv; vår teller bare vennene."
    }
  };

  /* ---------- H2024 · Oppgave 8 · Rundtur med DNT (12 poeng) ---------- */
  P["H2024-8"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p>Finn de <b>sterkt sammenhengende komponentene</b> (Kosaraju). Hver node er med i høyst én sykel, så en komponent med mer enn én node er nøyaktig én rundtur. En komponent med bare én node er ingen rundtur (ingen node har kant til seg selv), så den tas ikke med.</p>",
        kode: PC("RoundTrips", "G", "En graf G = (V, E)", "En mengde av mengder av noder (rundturene)",
          [[1, "roundtrips ← empty set"], [1, "for C ∈ StronglyConnectedComponents(G) do"], [2, "if |C| > 1 then"], [3, "add C to roundtrips"], [1, "return roundtrips"]]),
        fasitVerdi: "{A, B, C}, {D, E, F}",
        kjoretid: "O(|V| + |E|), samme som å finne de sterkt sammenhengende komponentene",
        poeng: ["sterkt sammenhengende komponenter", "utelate komponenter med én node", "riktig kjøretid"] },
      { del: "(b)", tekst: "<p>Vi vil ha avstanden fra hver s ∈ U <b>til</b> t. Snur vi alle kantene, blir det avstanden <b>fra</b> t til hver s, og den gir Dijkstra fra t i én kjøring. Vektene er positive, så Dijkstra virker. Til slutt velger vi s ∈ U med minst dist[s].</p>",
        kode: PC("BestStart", "G, U, t", "En rettet graf G = (V, E) med vektfunksjon w, en mengde utfartssteder U og en node t", "Utfartsstedet s ∈ U med lavest avstand til t",
          [[1, "Gr ← ReverseGraph(G)   // w(v, u) i Gr = w(u, v) i G"], [1, "dist ← Dijkstra(Gr, t)"], [1, "best ← null"], [1, "for s ∈ U do"], [2, "if best = null or dist[s] < dist[best] then"], [3, "best ← s"], [1, "return best"]]),
        kjoretid: "O((|V| + |E|) · log(|V|)) for Dijkstra, pluss O(|V| + |E|) for å snu grafen og O(|U|) for løkka",
        poeng: ["snu grafen og kjør Dijkstra én gang fra t", "velg s ∈ U med minst avstand", "riktig kjøretid"] }
    ],
    hvorfor: {
      eli5: "<p>(a): En rundtur er en gruppe steder der du kan gå fra alle til alle og komme tilbake. (b): I stedet for å gå fra hvert startsted til målet, går vi baklengs fra målet én gang.</p>",
      normal: "<p>(a): sensorveiledningen trekker 1 poeng for å ta med komponenter med bare én node. (b): Dijkstra fra hver s ∈ U gir opp til 4 poeng; å snu grafen og kjøre Dijkstra én gang fra t gir opp til 7.</p>",
      teknisk: "<p>(a): med «høyst én sykel per node» er hver ikke-triviell sterkt sammenhengende komponent nøyaktig én sykel. (b): en sti s → … → t i G er en sti t → … → s i Gr med samme vekt. Én Dijkstra gir alle avstandene vi trenger, i stedet for |U| kjøringer.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2024, oppgave 8",
      deler: [
        { del: "(a)", fasit: "<p>Maksimalt 5 poeng.</p><p>Her er det tilstrekkelig å svare at vi finner de sterkt sammenhengende komponentene av G og returnerer alle komponenter som har størrelse større enn én. Dette er i O(|V| + |E|).</p>",
          kode: PC("RoundTrip", "G", "En graf G = (V, E)", "En mengde av mengder av noder",
            [[1, "roundtrips ← empty set"], [1, "components ← StronglyConnectedComponents(G)"], [1, "for component ∈ components do"], [2, "if 1 < |component| then"], [3, "add component to roundtrips"], [1, "return roundtrips"]]),
          kriterier: "<p>Det trekkes 1 poeng for å ikke utelukke komponenter som kun inneholder én node.</p>" },
        { del: "(b)", fasit: "<p>Maksimalt 7 poeng.</p><p>En mulig løsning er å bruke Dijkstra sin algoritme for korteste stier fra hver node s ∈ U, og velge noden som har kortest avstand til t. Dette er i O(|U| · (|V| + |E|) · log(|V|)). En beskrivelse av en slik løsning kan få opp til 4 poeng.</p>" +
            "<p>En bedre løsning er å heller finne korteste avstander (med Dijkstra) fra t i den reverserte grafen Gr, altså grafen der alle kanter er snudd. I en slik løsning kan man først beregne avstander fra t til alle noder, og deretter gå gjennom alle noder i U og finne ut hvilken som er nærmest t. Dette er i O((|V| + |E|) · log(|V|)), altså samme kjøretidskompleksitet som Dijkstra. En slik løsning kan få opp til 7 poeng.</p>",
          kode: PC("BestStartLocation", "G, U, t", "En graf G = (V, E) med vektfunksjon w, en mengde med noder U og en node t", "En node s ∈ U som minimerer avstanden til t",
            [[1, "Gr ← ReverseGraph(G) // Anta at vektfunksjonen også reverseres"], [1, "dist ← Dijkstra(Gr, t)"], [1, "s ← arbitrary node in U"], [1, "for u ∈ U do"], [2, "if dist[u] < dist[s] then"], [3, "s←u"], [1, "return s"]]),
          etter: "<p>En alternativ løsning er å legge til en ny node a i grafen, og legge til en kant (a, s) med w(a, s) = 0 for alle noder s ∈ U. Hvis vi gjør Dijkstra med a som startnode, så kan man finne det beste utfartsstedet ved å finne den andre noden i den korteste stien fra a til t, som er garantert å være et utfartssted. Den vil være like effektiv som løsningen over og kan også få opp til 7 poeng.</p>" }
      ],
      merknad: "Steg-demoen for (a) bruker guidens egen eksempelgraf, siden arket ikke har noen graf."
    }
  };

  /* ---------- H2025 · Oppgave 3 · Sykler i grafer (11 poeng) ---------- */
  var CYC_U = PC("isCyclicUndirected", "G", "En urettet graf G = (V, E)", "Returnerer true hvis grafen inneholder en sykel, og false ellers",
    [[1, "visited ← empty set"], [1, "for u ∈ V do"], [2, "if u ∉ visited then"], [3, "if HasCycleFrom(G, null, u, visited) then return true"], [1, "return false"]]);
  var CYC_F = PC("HasCycleFrom", "G, p, u, visited", null, null,
    [[1, "add u to visited"], [1, "for (u, v) ∈ E do"], [2, "if v = p then continue"], [2, "if v ∈ visited then return true"], [2, "if HasCycleFrom(G, u, v, visited) then return true"], [1, "return false"]]);
  var CYC_D = PC("isCyclicDirected", "G", "En rettet graf G = (V, E)", "Returnerer true hvis grafen inneholder en sykel, og false ellers",
    [[1, "stack ← empty stack"], [1, "processed ← 0"], [1, "for v ∈ V do"], [2, "inDeg[v] ← indegree(v)"], [2, "if inDeg[v] = 0 then stack.push(v)"], [1, "while stack is not empty do"], [2, "u ← stack.pop()"], [2, "processed ← processed + 1"],
     [2, "for (u, v) ∈ E do"], [3, "inDeg[v] ← inDeg[v] − 1"], [3, "if inDeg[v] = 0 then stack.push(v)"], [1, "return processed < |V|"]]);
  P["H2025-3"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p>Dybde-først søk fra hver node vi ikke har besøkt (grafen kan ha flere komponenter). Finner vi en nabo som alt er besøkt, og som <b>ikke er forelderen</b> vi kom fra, har vi funnet en sykel. Forelderen må hoppes over, fordi kanten {p, u} står i nabolista til u i en urettet graf.</p>",
        kode: CYC_U, fig: pfig(CYC_F), fasitVerdi: "true",
        kjoretid: "O(|V| + |E|), som DFSFull",
        poeng: ["DFS som oppdager en besøkt nabo", "unntaket for forelderen", "O(|V| + |E|), godt formidlet med pseudokode"] },
      { del: "(b)", tekst: "<p>Topologisk sortering med inngrader, der vi bare teller hvor mange noder som blir behandlet. Noder på en sykel får aldri inngrad 0. Blir ikke alle nodene behandlet, finnes det en sykel.</p>",
        kode: CYC_D, fasitVerdi: "true",
        kjoretid: "O(|V| + |E|)",
        poeng: ["topologisk sortering som oppdager sykler", "O(|V| + |E|), godt formidlet med pseudokode"] }
    ],
    hvorfor: {
      eli5: "<p>(a): Kommer du til et sted du har vært, uten å snu, har du gått i ring. (b): Hvis noen venter på hverandre i ring, blir de aldri ferdige.</p>",
      normal: "<p>Sensorveiledningen trekker 2 poeng i (a) hvis forelderen ikke hoppes over. Løsninger i O(|V| · (|V| + |E|)) gir opp til 3 poeng i begge deloppgavene.</p>",
      teknisk: "<p>(a): i et DFS-tre for en urettet graf er hver kant enten en trekant eller en tilbakekant. En tilbakekant (til en besøkt node som ikke er forelderen) lukker en sykel. (b): G er en DAG hvis og bare hvis topologisk sortering behandler alle |V| nodene.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2025, oppgave 3",
      deler: [
        { del: "(a)", fasit: "<p>Det finnes flere gode løsninger i O(|V| + |E|). Den mest nærliggende er kanskje et dybde-først søk.</p>",
          kode: PC("isCyclicUndirected", "G", "En urettet graf G = (V, E)", "Returnerer true hvis grafen inneholder en sykel, og false ellers",
            [[1, "visited ← empty set"], [1, "for u ∈ V do"], [2, "if u ∈ visited then"], [3, "continue"], [2, "if isCyclicComponent(G, null, u, visited) then"], [3, "return true"], [1, "return false"]]) },
        { del: "(a)", kode: PC("isCyclicComponent", "G, p, u, visited", null, null,
            [[1, "add u to visited"], [1, "for (u, v) ∈ E do"], [2, "if v = p then"], [3, "continue"], [2, "if v ∈ visited then"], [3, "return true"], [2, "if isCyclicComponent(G, u, v, visited) then"], [3, "return true"], [1, "return false"]]),
          etter: "<p>I løsningen over fastslår vi at det finnes en sykel dersom dybde-først søket har en kant til en node som allerede er besøkt, med mindre dette er den samme noden som DFS ble kalt fra (altså foreldrenoden i spenntreet). Uten denne begrensningen ville isCyclicUndirected svart true på alle grafer som inneholder en kant.</p>" +
            "<p>En annen løsning er å finne komponentene til grafen, og sjekke at hver av komponentene inneholder nøyaktig |E<sub>c</sub>| = |V<sub>c</sub>| − 1, der V<sub>c</sub> og E<sub>c</sub> henholdsvis er nodene og kantene i komponenten c.</p>" +
            "<p>En noe mer innsiktsfull løsning er å se at grafen ikke inneholder sykler hvis og bare hvis |E| = |V| − |C|, der C er mengden av komponenter. Altså inneholder grafen ingen sykler hvis antall kanter svarer til antall noder minus antall komponenter.</p>",
          kriterier: ["Inntil 5 poeng for en korrekt løsning i O(|V| + |E|) som er godt formidlet med pseudokode.", "Trekk 2 poeng hvis man ikke tar høyde for at noden må være ulik foreldrenoden i spenntreet.", "Inntil 3 poeng dersom løsningen er i O(|V| · (|V| + |E|))."] },
        { del: "(b)", fasit: "<p>Dette bør løses på lineær tid. Mest naturlig er å bruke topologisk sortering (som oppdager sykler). Algoritmen for topologisk sortering plasserer først alle noder med inngrad 0 på en stack. Noder plukkes av stacken så lenge den ikke er tom, og for hver node som plukkes av fjernes alle dens utgående kanter (som fører til at dens naboer får lavere inngrad). Hvis en node får inngrad 0 plasseres den på stacken. Grafen er asyklisk hvis og bare hvis alle nodene blir prosessert.</p>",
          kode: PC("isCyclicDirected", "G", null, null, [[1, "stack ← empty stack"], [1, "processed ← 0"], [1, "for v ∈ V do"], [2, "if indegree of v is 0 then"], [3, "stack.push(v)"], [1, "while stack is not empty do"], [2, "u ← stack.pop()"], [2, "processed ← processed + 1"],
            [2, "for (u, v) ∈ E do"], [3, "remove u from the incoming edges of v"], [3, "if indegree of v is 0 then"], [4, "add v to stack"], [1, "return processed < |V|"]]),
          etter: "<p>En annen mulighet er å finne de sterkt sammenhengende komponentene av grafen, og sjekke om det finnes komponenter av størrelse større enn én.</p><p>Det er også fullt mulig å skrive et modifisert dybde-først søk som oppdager sykler. I en slik løsning vil man typisk skille mellom en node er uoppdaget, under prosessering eller ferdig prosessert. Dersom man under et søk finner en kant til en node som er under prosessering kan man konkludere med at grafen inneholder en sykel. En annen lignende (og nærliggende) løsning er å sjekke om en node er på stacken (fordi da er den under prosessering); med en vanlig stack vil dette gi O(|V| · (|V| + |E|)).</p>",
          kriterier: ["Inntil 6 poeng for en korrekt løsning i O(|V| + |E|) som er godt formidlet med pseudokode.", "Inntil 3 poeng dersom løsningen er i O(|V| · (|V| + |E|))."] }
      ],
      merknad: "Vår HasCycleFrom er sensors isCyclicComponent med samme parametre. I (b) teller vi ned en inngrad i stedet for å fjerne kanter."
    }
  };

  /* ---------- H2025 · Oppgave 7 · Kollektivtilbudet i Oslo (15 poeng) ---------- */
  P["H2025-7"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<ul><li><b>Sammenhengende:</b> du kan reise mellom to vilkårlige holdeplasser med kollektivtilbudet.</li><li><b>Urettet:</b> har du reist en strekning, kan du alltid reise samme strekning tilbake.</li></ul>", poeng: ["begge egenskapene forklart for en reisende"] },
      { del: "(b)", tekst: "<p>Strekninger med reisetid <b>over</b> k er stengt. Vi gjør et dybde-først søk fra en vilkårlig holdeplass og bruker bare kanter med w(u, v) ≤ k. Når alle holdeplassene nås, er det mulig å reise mellom alle par.</p>",
        kode: PC("CheckConnected", "G, k", "En sammenhengende, urettet og vektet graf G = (V, E) og en grense k", "true hvis alle holdeplassene henger sammen uten strekningene med vekt over k",
          [[1, "s ← an arbitrary node in V"], [1, "visited ← empty set"], [1, "add s to visited"], [1, "stack ← stack containing only s"], [1, "while stack is not empty do"], [2, "u ← stack.pop()"], [2, "for (u, v) ∈ E do"],
           [3, "if w(u, v) ≤ k and v ∉ visited then"], [4, "add v to visited"], [4, "stack.push(v)"], [1, "return |visited| = |V|"]]),
        kjoretid: "O(|V| + |E|), og siden G er sammenhengende er |V| ≤ |E| + 1, så O(|E|)",
        poeng: ["DFS som ignorerer kanter med vekt over k", "sjekk at alle nodene ble nådd", "O(|E|)"] },
      { del: "(c)", tekst: "<p>Den minste k som virker, er den <b>største kantvekten i et minimalt spenntre</b>. Et minimalt spenntre minimerer også den tyngste kanten som trengs for å holde grafen sammen. Vi finner treet med Prim og tar den største vekten blant kantene.</p>",
        kode: PC("FindMinimalK", "G", "En sammenhengende, urettet og vektet graf G = (V, E)", "Den minste k som gjør at CheckConnected(G, k) svarer true",
          [[1, "parents ← Prim(G)"], [1, "k ← 0"], [1, "for v ∈ V do"], [2, "if parents[v] ≠ null then"], [3, "k ← Max(k, w(parents[v], v))"], [1, "return k"]]),
        kjoretid: "O(|E| · log(|V|)) for Prim, pluss O(|V|) for løkka",
        poeng: ["minimalt spenntre", "største vekt i treet", "O(|E| · log(|V|))"] },
      { del: "(d)", tekst: "<p>Garantien betyr at grafen fortsatt er sammenhengende om vi fjerner én vilkårlig holdeplass, altså at grafen er <b>2-sammenhengende</b>. Vi bruker kursets algoritme for separasjonsnoder (ett dybde-først søk med depth og low). Garantien holder hvis og bare hvis det ikke finnes noen separasjonsnoder. O(|V| + |E|).</p>", kode: "sepVertices", poeng: ["2-sammenhengende", "separasjonsnoder i O(|V| + |E|)"] },
      { del: "(e)", tekst: "<p>Å tjene vilkårlig mye ved å reise rundt og rundt betyr en <b>negativ sykel</b>. Siden c(u, v) kan være ulik c(v, u), lar vi hver strekning {u, v} bli to rettede kanter (u, v) og (v, u) med hver sin pris. Så kjører vi <b>Bellman-Ford</b> med vektfunksjonen c fra en vilkårlig holdeplass s. Grafen er sammenhengende, så alle sykler kan nås fra s. Rapporterer Bellman-Ford en negativ sykel, går det an å tjene vilkårlig mye.</p>",
        kode: "bellmanFord", kjoretid: "O(|V| · |E|)",
        poeng: ["negativ sykel med Bellman-Ford", "oppgi startnode"] }
    ],
    hvorfor: {
      eli5: "<p>Hver deloppgave er en kjent algoritme i forkledning: søk, minimalt spenntre, separasjonsnoder og Bellman-Ford.</p>",
      normal: "<p>Sensorveiledningen gir uttelling etter kjøretid: O(|E|) i (b), O(|E| · log(|V|)) i (c) og O(|V| + |E|) i (d). I (e) trekkes 1 poeng hvis det ikke står hvilken node Bellman-Ford starter fra, så det står i svaret.</p>",
      teknisk: "<p>(c) bruker at et minimalt spenntre også minimerer den største kanten (det er et «flaskehals-spenntre»): for hver kant med vekt større enn treets største, finnes det et kutt der en lettere kant i treet holder. (e): en negativ toveis-strekning med c(u, v) + c(v, u) &lt; 0 er også en negativ sykel.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2025, oppgave 7",
      deler: [
        { del: "(a)", fasit: "<p>At grafen er sammenhengende vil si at en reisende kan reise mellom to vilkårlige holdeplasser ved å bruke kollektivtilbudet.</p><p>At grafen er urettet vil si at en som har reist en strekning alltid kan reise den samme strekningen tilbake.</p>", kriterier: ["Inntil 1 poeng."] },
        { del: "(b)", fasit: "<p>Her kan vi gjøre et dybde-først søk, der kanter med vekt som overstiger k ignoreres, og sjekke om alle noder nås gjennom én traversering.</p>",
          kode: PC("CheckConnected", "G, k", null, null, [[1, "stack ← stack initialized with an arbitrary vertex u ∈ V"], [1, "visited ← empty set"], [1, "while stack is not empty do"], [2, "u ← stack.pop()"], [2, "if u not in visited then"], [3, "add u to visited"], [3, "for (u, v) in E do"], [4, "if w(u, v) < k then"], [5, "add v to stack"], [1, "return visited = V"]]),
          kriterier: ["Inntil 4 poeng for en løsning i O(|E|).", "Inntil 1 poeng dersom kanter med vekt som overstiger k benyttes."] },
        { del: "(c)", fasit: "<p>En naturlig løsning er å beregne det minimale spenntreet for grafen, og finne verdien til den kanten med høyest vekt.</p>",
          kode: PC("FindMinimalK", "G", null, null, [[1, "T ← Prim(G)"], [1, "k←0"], [1, "for (u, v) in edges of T do"], [2, "k ← max(k, w(u, v))"], [1, "return k"]]),
          kriterier: ["Inntil 4 poeng for en løsning i O(|E| · log(|V|))."] },
        { del: "(d)", fasit: "<p>Her ønsker vi å sjekke om grafen er 2-sammenhengende; altså skal grafen forbli sammenhengende hvis vi fjerner en vilkårlig node (sammen med dens tilhørende kanter). Fra pensum kjenner vi en algoritme som finner alle separasjonsnoder i lineær tid, og algoritmen IsBiconnected sjekker at det ikke finnes noen separasjonsnoder i grafen. Dette er det samme som å sjekke at garantien holdes for alle holdeplasser.</p>",
          kriterier: ["Inntil 3 poeng for en løsning i O(|V| + |E|)."] },
        { del: "(e)", fasit: "<p>Her ønsker vi å finne negative sykler i en graf. Algoritmen BellmanFord finner korteste stier i en rettet graf og identifiserer negative sykler. Dermed kan vi kalle på BellmanFord med grafen G fra en vilkårlig node u ∈ V og vektfunksjonen c og returnere false dersom den ikke rapporterer at det finnes negative sykler.</p><p>Merk at BellmanFord finner avstanden fra én node til alle andre noder, derfor er input både grafen og en startnode. Siden grafen er urettet spiller det ingen rolle hvilken node vi starter fra.</p>",
          kriterier: ["Inntil 3 poeng.", "Trekk 1 poeng dersom det ikke er spesifisert hvilken node algoritmen skal starte fra."] }
      ],
      merknad: "I (b) bruker sensor w(u, v) &lt; k. Oppgaven stenger strekninger som <i>overstiger</i> k minutter, så strekninger på nøyaktig k er åpne; derfor skriver vi ≤ k. Med ≤ k er svaret i (c) nøyaktig den største vekten i spenntreet. Tomme linjer i sensors pseudokode er utelatt."
    }
  };
})();
