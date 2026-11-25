/* ============================================================
   IN2010 guide · perfekt/heap.js
   «Perfekt svar» for eksamensoppgavene om heap (lastes på 03-heap.html,
   etter data-heap.js). Format: plan/gjennomgang/wp0-format.md.
   - svar: vårt eget fullpoengssvar på kursnivå (samme på alle nivåer).
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette
     kilder (forelesning, ukesoppgaver, lærebok) hører hjemme her.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.PERFEKT = IN.PERFEKT || {};

  function tab(vals, label) {
    var th = "", td = "";
    vals.forEach(function (v, i) { th += "<th>" + i + "</th>"; td += "<td>" + v + "</td>"; });
    // Egen scrollboks: et array med 10 plasser er bredere enn kortet på 375 px
    return '<div style="overflow-x:auto;max-width:100%"><table class="et-tab" aria-label="' + (label || "Arrayet etter innsettingene") + '"><tr>' + th + "</tr><tr>" + td + "</tr></table></div>";
  }
  // Flere prosedyrer i én blokk med fortløpende linjenumre (som i sensorveiledningen)
  function combo(algos) {
    var a0 = algos[0], lines = a0.lines.slice();
    algos.slice(1).forEach(function (a) {
      lines.push({ code: "", indent: 0 });
      lines.push({ code: "Procedure " + a.name + "(" + (a.params || "") + ")", indent: 0 });
      lines = lines.concat(a.lines);
    });
    return { name: a0.name, params: a0.params, lines: lines };
  }
  function L(code, indent) { return { code: code, indent: indent }; }
  // Binært søketre fra innsettingsrekkefølge → noder for IN.vizTree
  function bstTree(keys, pre) {
    var root = null;
    keys.forEach(function (k) {
      var n = { id: pre + k, k: k, l: null, r: null };
      if (!root) { root = n; return; }
      for (var v = root; ;) {
        if (k < v.k) { if (!v.l) { v.l = n; break; } v = v.l; }
        else { if (!v.r) { v.r = n; break; } v = v.r; }
      }
    });
    return root;
  }
  // Λ-formen fra sensorveiledningen H2024 (e), tegnet på nytt: roten øverst, en kjede mot venstre og en mot høyre
  var LAMBDA_SVG = (function () {
    var pts = [[110, 14], [82, 40], [56, 66], [30, 92]], s = "";
    function line(a, b, dash) { s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"' + (dash ? ' stroke-dasharray="2 4"' : "") + "/>"; }
    [1, -1].forEach(function (side) {
      var P = pts.map(function (p) { return [110 + side * (p[0] - 110), p[1]]; });
      for (var i = 1; i < P.length; i++) line(P[i - 1], P[i]);
      line(P[P.length - 1], [110 + side * (14 - 110), 108], true);
      P.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5"/>'; });
    });
    return '<svg viewBox="0 0 220 118" width="220" style="max-width:100%;height:auto;display:block;margin:.4rem 0" role="img" aria-label="Roten øverst. Fra roten går en kjede av venstre barn skrått ned mot venstre og en kjede av høyre barn skrått ned mot høyre. Stiplede linjer viser at kjedene fortsetter." stroke="currentColor" stroke-width="1.6" fill="currentColor">' + s + "</svg>";
  })();

  /* ---------- H2023 · Oppgave 2 · Innsetting i heap (10 poeng) ---------- */
  IN.PERFEKT["H2023-2"] = {
    type: "eksamen",
    svar: [
      {
        del: "(a)",
        tekst: "<p><b>Svar: 2, 4, 3, 8, 5, 10, 7</b></p>" + tab([2, 4, 3, 8, 5, 10, 7]) +
          "<p class=\"small muted\">Mellomstegene trengs ikke i svaret, men slik kommer du dit (forelderen til plass i er ⌊(i − 1)/2⌋):</p>" +
          "<ol class=\"small\">" +
          "<li>3 blir roten: <span class=\"mono\">3</span></li>" +
          "<li>5 på plass 1. Forelderen 3 er mindre, ingen bytte: <span class=\"mono\">3, 5</span></li>" +
          "<li>10 på plass 2. Forelderen 3 er mindre: <span class=\"mono\">3, 5, 10</span></li>" +
          "<li>8 på plass 3. Forelderen 5 (plass 1) er mindre: <span class=\"mono\">3, 5, 10, 8</span></li>" +
          "<li>4 på plass 4. Forelderen 5 er større, så de bytter. Ny forelder 3 er mindre: <span class=\"mono\">3, 4, 10, 8, 5</span></li>" +
          "<li>2 på plass 5. Bytter med 10 (plass 2), så med 3 (plass 0): <span class=\"mono\">2, 4, 3, 8, 5, 10</span></li>" +
          "<li>7 på plass 6. Forelderen 3 (plass 2) er mindre: <span class=\"mono\">2, 4, 3, 8, 5, 10, 7</span></li>" +
          "</ol>",
        fig: {
          cap: "Sluttilstanden som tre og array",
          draw: function (h) { if (IN.vizHeap) IN.vizHeap(h, { array: [2, 4, 3, 8, 5, 10, 7] }); }
        },
        fasitVerdi: "2, 4, 3, 8, 5, 10, 7",
        poeng: ["riktig sluttrad (2p). Det holder å skrive den, uten mellomsteg"]
      },
      {
        del: "(b)",
        tekst: "<p>Det nye elementet x legges på første ledige plass, <span class=\"mono\">A[n]</span>. Det er den eneste plassen som holder treet komplett. " +
          "Så sammenligner vi x med foreldernoden på plass <span class=\"mono\">⌊(i − 1)/2⌋</span>. Er x mindre, bytter de plass, og vi fortsetter fra forelderens plass. " +
          "Vi stopper når forelderen er mindre enn eller lik x, eller når x står i roten (i = 0). Dette kalles å boble opp.</p>",
        kode: "heapInsert",
        etter: "<p class=\"small muted\">Betingelsen <span class=\"mono\">i &gt; 0</span> står først, så vi aldri spør etter forelderen til roten.</p>",
        poeng: ["hvor x plasseres: bakerst, på A[n] (1p)", "at x bytter med foreldernoden så lenge x er mindre (2p)", "en godt skissert algoritme (3p)"]
      },
      {
        del: "(c)",
        tekst: "<p><b>O(log n)</b> i verste tilfelle. Hver runde i løkka gjør et fast antall operasjoner og flytter x ett nivå opp, fordi i blir til ⌊(i − 1)/2⌋, altså omtrent halvert. " +
          "x starter på plass n, og etter innsettingen er heapen et komplett binærtre med n + 1 elementer og høyde ⌊log(n + 1)⌋. Så x kan flytte seg høyst ⌊log(n + 1)⌋ ganger før det står i roten, og det er O(log n).</p>" +
          "<p>Beste tilfelle er O(1): x er allerede større enn eller lik forelderen, og løkka kjører ikke.</p>",
        kjoretid: "O(log n) per innsetting (ikke O(n log n), det er for n innsettinger)",
        poeng: ["riktig kjøretid, O(log n) (1p)", "begrunnelsen: høyden til treet er O(log n), eller at i halveres hver runde (1p)"]
      }
    ],
    hvorfor: {
      eli5: "<p>Sensor vil se tre ting: at du setter det nye tallet bakerst, at det bytter plass med «sjefen» over seg så lenge det er minst, og at du vet hvorfor det går fort. Treet er lavt, så tallet trenger bare noen få bytter for å komme seg helt til toppen.</p>",
      normal: "<p>Svaret dekker hvert poengkriterium: riktig sluttrad i (a), plassering på A[n] og bytte med forelderen i (b), en pseudokode som stopper riktig, og O(log n) med begrunnelse i høyden til treet i (c).</p>",
      teknisk: "<p>Skrivingen til A[n] bevarer formen (komplett tre). Etter hvert bytte kan heap-egenskapen bare være brutt mellom i og foreldernoden, og løkka slutter når den er i orden eller i = 0. Antall runder er begrenset av høyden, ⌊log(n + 1)⌋ etter innsettingen, så O(log n). Det er akkurat den sammenhengen (form → høyde → kjøretid) sensor gir poeng for.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2023, oppgave 2",
      deler: [
        {
          del: "(a)",
          fasit: "<p>Tallene settes inn slik:</p>" +
            "<div class=\"et-sv-seq\">3\n3 5\n3 5 10\n3 5 10 8\n3 5 10 8 4\n3 4 10 8 5\n3 4 10 8 5 2\n3 4 2 8 5 10\n2 4 3 8 5 10 7</div>" +
            "<p>Det er kun den siste linjen 2, 4, 3, 8, 5, 10, 7 som trenger inngå i svaret.</p>",
          kriterier: "<p>2 poeng for riktig svar. 1 poeng for nesten riktige svar, som vil si dersom</p>" +
            "<ul><li>svaret er en min-heap, men ikke den samme heapen som den gitte rekkefølgen vil gi opphav til, eller</li>" +
            "<li>svaret er ett bytte unna løsningensforslaget.</li></ul>"
        },
        {
          del: "(b)",
          fasit: "<p>Hovedidéen er å alltid legge til på neste ledige plass, det vil si indeks n. Det er der neste node må være for at treet fortsatt skal være komplett. " +
            "Hvis noden på den nye plassen er mindre enn foreldrenoden så må de bytte plass. Dette gjøres iterativt (eller rekursivt).</p>" +
            "<p>I arrayrepresentasjonen av en heap ligger alltid roten på indeks 0. Foreldrenoden til en gitt indeks i ligger på ParentOf(i) = ⌊(i − 1)/2⌋ for en gitt indeks i.</p>" +
            "<p>Her er algoritmen presentert med pseudokode:</p>",
          kode: {
            name: "HeapInsert", params: "A, x",
            input: "Et array A som representerer en heap med n elementer, og et element x",
            output: "Et array som representerer en heap, som inneholder x",
            lines: [
              { code: "A[n] ← x", indent: 1 },
              { code: "i ← n", indent: 1 },
              { code: "while 0 < i and A[i] < A[ParentOf(i)] do", indent: 1 },
              { code: "A[i], A[ParentOf(i)] ← A[ParentOf(i)], A[i]", indent: 2 },
              { code: "i ← ParentOf(i)", indent: 2 },
              { code: "return A", indent: 1 }
            ]
          },
          kriterier: "<p>Det gis opptil 6 poeng for et godt svar på oppgaven.</p>" +
            "<ul><li>Opptil 1 poeng for å gi hvor elementet skal plasseres.</li>" +
            "<li>Opptil 2 poeng for å få frem at noden skal bytte plass med foreldernoden dersom den er mindre.</li>" +
            "<li>Opptil 3 poeng for en godt skissert algoritme.</li></ul>"
        },
        {
          del: "(c)",
          fasit: "<p>Algoritmen for innsetting i heap er O(log(n)). Det er fordi n halveres i hver iterasjon.</p>",
          kriterier: "<p>Det gis 1 poeng for riktig kjøretidskompleksitet og 1 poeng for redegjørelsen.</p>"
        }
      ],
      merknad: "Sensor skriver <span class=\"mono\">ParentOf(i)</span> og <span class=\"mono\">0 &lt; i and A[i] &lt; A[ParentOf(i)]</span>. Det er det samme som kursets <span class=\"mono\">⌊(i − 1)/2⌋</span> og <span class=\"mono\">i &gt; 0 and A[⌊(i − 1)/2⌋] &gt; A[i]</span>, bare skrevet i motsatt rekkefølge."
    }
  };

  /* ---------- H2021 · Oppgave 4 · Binære heaps (6 poeng) ---------- */
  IN.PERFEKT["H2021-4"] = {
    type: "eksamen",
    svar: [
      {
        del: "(a)",
        tekst: "<p><b>Svar: 11, 28, 27, 43, 32, 66, 55, 59</b></p>" + tab([11, 28, 27, 43, 32, 66, 55, 59], "Arrayet etter RemoveMin") +
          "<ol class=\"small\">" +
          "<li>4 i roten tas ut. Det siste elementet, 66 (plass 8), kopieres til roten, og heapen har nå 8 elementer.</li>" +
          "<li>Barna til roten er 28 og 11. Minste barn er 11, og 66 &gt; 11, så de bytter.</li>" +
          "<li>66 står på plass 2. Barna er 27 (plass 5) og 55 (plass 6). Minste er 27, så de bytter.</li>" +
          "<li>66 står på plass 5. Barna ville stått på plass 11 og 12, som ikke finnes. Ferdig.</li></ol>",
        fig: { cap: "H₁ etter RemoveMin", draw: function (h) { if (IN.vizHeap) IN.vizHeap(h, { array: [11, 28, 27, 43, 32, 66, 55, 59] }, { arrName: "H₁" }); } },
        fasitVerdi: "11, 28, 27, 43, 32, 66, 55, 59",
        poeng: ["riktig array (2p, 0 for feil svar)"]
      },
      {
        del: "(b)",
        tekst: "<p><b>Svar: 4, 7, 11, 43, 28, 27, 55, 59, 66, 32</b></p>" + tab([4, 7, 11, 43, 28, 27, 55, 59, 66, 32], "Arrayet etter Insert(7)") +
          "<ol class=\"small\">" +
          "<li>7 legges på første ledige plass, plass 9. Forelderen er ⌊(9 − 1)/2⌋ = 4, med verdi 32. 7 &lt; 32, så de bytter.</li>" +
          "<li>7 står på plass 4. Forelderen er plass 1, med verdi 28. 7 &lt; 28, så de bytter.</li>" +
          "<li>7 står på plass 1. Forelderen er roten, 4. 4 er mindre, så vi stopper.</li></ol>",
        fig: { cap: "H₁ etter Insert(7)", draw: function (h) { if (IN.vizHeap) IN.vizHeap(h, { array: [4, 7, 11, 43, 28, 27, 55, 59, 66, 32] }, { arrName: "H₁" }); } },
        fasitVerdi: "4, 7, 11, 43, 28, 27, 55, 59, 66, 32",
        poeng: ["riktig array (2p, 0 for feil svar)"]
      },
      {
        del: "(c)",
        tekst: "<p><b>Svar: 27.</b></p><p>Hver node på dybde 4 har en forelder på dybde 3. Heap-egenskapen krever bare at barnet er <i>større enn eller lik</i> forelderen. " +
          "Den minste verdien på dybde 3 er 27, og en heap kan ha like verdier, så 27 kan ligge som barn av 27. Mindre enn 27 går ikke, for da ville barnet vært mindre enn forelderen sin.</p>",
        poeng: ["svaret 27 (2p). Svaret 28 ga 1p, fordi det overser at like verdier er lov"]
      }
    ],
    hvorfor: {
      eli5: "<p>I (a) og (b) teller bare tallrekka, så det viktigste er å gjøre byttene riktig. I (a) bytter det store tallet alltid med det <i>minste</i> barnet. I (b) klatrer det nye tallet opp så lenge det er mindre enn tallet over seg. I (c) er knepet at to like tall godt kan stå over hverandre.</p>",
      normal: "<p>Svarene i (a) og (b) er de eneste riktige arrayene, og hvert gir 2 poeng. I (c) gir 27 full uttelling fordi heap-egenskapen er «forelder ≤ barn», ikke «forelder &lt; barn».</p>",
      teknisk: "<p>RemoveMin bevarer formen ved å flytte siste element til roten, og reparerer ordenen med boble ned mot det minste barnet. Insert bevarer formen ved å skrive til A[n], og reparerer med boble opp. I (c) er den nedre grensen den minste verdien på dybde 3, 27, og den kan nås fordi heapen tillater duplikater. 28 ville vært svaret bare hvis alle verdiene måtte være ulike.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021, oppgave 4",
      deler: [
        { del: "(a)", fasit: tab([11, 28, 27, 43, 32, 66, 55, 59], "Arrayet i sensorveiledningen for (a)") },
        { del: "(b)", fasit: tab([4, 7, 11, 43, 28, 27, 55, 59, 66, 32], "Arrayet i sensorveiledningen for (b)") },
        { del: "(c)", fasit: "<p>27. En heap tillater duplikater, og det ligger en node med verdi 27 på nivå 3 kan den noden ha et barn med samme verdi, altså 27.</p>" },
        { kriterier: "<p>Det gis 2 poeng per riktig svar (og 0 for feil svar). På oppgave (c) gis det 1 poeng for svaret 28.</p>" }
      ],
      merknad: "Sensorveiledningen viser svarene i (a) og (b) også som trær. Her står bare arrayene, som er det tabellene i Inspera spør etter."
    }
  };

  /* ---------- H2022 · Oppgave 5 · Litt om prioritetskøer og binære heaps (10 poeng) ---------- */
  var H22_5 = [
    ["(a)", true, "BuildMinHeap lar nodene boble ned nedenfra og opp. De fleste nodene er lave og billige, og summen av høydene er O(n)."],
    ["(b)", false, "Moteksempel: <span class=\"mono\">[1, 2, 5, 3, 4]</span> er en min-heap. Reversert blir den <span class=\"mono\">[4, 3, 5, 2, 1]</span>, og der er 5 barn av 4, så det er ikke en max-heap."],
    ["(c)", false, "Heap-egenskapen gjelder bare forelder mot barn. I <span class=\"mono\">[1, 2, 9, 3]</span> ligger 9 på dybde 1 og 3 på dybde 2."],
    ["(d)", true, "Boble opp går høyst fra den nye løvnoden til roten, altså høyden til treet, og den er O(log n)."],
    ["(e)", true, "Et AVL-tre er balansert, så innsetting er O(log n), og det minste elementet (lengst til venstre) finnes og fjernes i O(log n). Det er de samme kjøretidene som for en heap."],
    ["(f)", true, "Hver node er større enn eller lik foreldernoden, så verdiene vokser (eller står stille) nedover en sti."],
    ["(g)", false, "Bytter vi bare elementene i to søskennoder, kan heap-egenskapen brytes lenger ned. I <span class=\"mono\">[1, 2, 5, 3]</span> gir bytte av 2 og 5 arrayet <span class=\"mono\">[1, 5, 2, 3]</span>, der 3 er barn av 5. Tar vi med subtrærne, er treet ikke lenger sikkert komplett."],
    ["(h)", true, "Utenom køen gjør Dijkstra bare O(1) arbeid per node og per kant. Med O(1) på alle køoperasjoner blir totalen O(|V| + |E|)."],
    ["(i)", false, "Det største elementet kan ligge i en hvilken som helst løvnode, og omtrent halvparten av nodene er løvnoder. Vi må se på alle, så det er O(n)."],
    ["(j)", true, "Det nest dypeste nivået d er fullt, med 2<sup>d</sup> noder. Alle nivåene over har til sammen 2<sup>d</sup> − 1 noder, altså færre. Da ligger over halvparten på de to dypeste nivåene."]
  ];
  IN.PERFEKT["H2022-5"] = {
    type: "eksamen",
    svar: H22_5.map(function (r) {
      return { del: r[0], tekst: "<p><b>" + (r[1] ? "Sant." : "Usant.") + "</b> " + r[2] + "</p>" };
    }),
    hvorfor: {
      eli5: "<p>Her teller bare «sant» eller «usant». Begrunnelsene er med for at du skal kunne sjekke deg selv: finner du et moteksempel, er påstanden usann.</p>",
      normal: "<p>Hvert svar er det samme som i sensorveiledningen. Begrunnelsene er ikke en del av svaret på eksamen, men de viser hvordan du kommer fram til det.</p>",
      teknisk: "<p>Påstandene tester hva heap-egenskapen faktisk sier (bare forelder mot barn), formen (komplett tre, så mange noder nederst) og kjøretidene til køoperasjonene. For de usanne holder ett moteksempel. For de sanne trengs et argument som gjelder alle heaper.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 5",
      deler: H22_5.map(function (r) {
        var p = { del: r[0], fasit: "<p>" + (r[1] ? "Sant." : "Usant.") + "</p>" };
        if (r[0] === "(g)") p.etter = "<p>Oppgaven er litt tvetydig om hvorvidt man skal ta med seg subtrærne eller ikke. Tanken var å kun bytte om elementene i nodene. " +
          "Selv hvis man tar med seg subtrærne har man ingen garanti for at det resulterende treet er komplett, og dermed er det heller ikke en heap. " +
          "Siden begge tolkninger gir opphav til samme svar lar vi oppgaven stå.</p>";
        return p;
      }),
      merknad: "Sensorveiledningen sier ikke hvordan poengene fordeles på påstandene."
    }
  };

  /* ---------- H2022 · Oppgave 10 · Bucket queue (10 poeng) ---------- */
  var BQ_IN = "En bucket queue Q med prioriteter fra 0 til N − 1";
  IN.PERFEKT["H2022-10"] = {
    type: "eksamen",
    svar: [
      {
        del: "(a)",
        tekst: "<p>Et <b>array Q med N bøtter</b>, én for hver prioritet 0, …, N − 1. Bøtte p er en enkeltlenket liste med elementene som har prioritet p. " +
          "Prioriteten brukes direkte som indeks, akkurat som i bucket sort.</p>",
        poeng: ["array av bøtter, indeksert med prioriteten (1p)"]
      },
      {
        del: "(b)",
        tekst: "<p>Legg x i bøtta på plass p.</p>",
        kode: "bucketQueueInsert",
        poeng: ["finne bøtta Q[p] direkte og legge x inn i den (3p)"]
      },
      {
        del: "(c)",
        tekst: "<p>Gå gjennom bøttene fra prioritet 0 og oppover. Den første bøtta som ikke er tom, inneholder elementene med lavest prioritet. Fjern og returner ett av dem.</p>",
        kode: "bucketQueueRemoveMin",
        etter: "<p class=\"small muted\">Vi trenger ikke sjekke om hele køen er tom, for oppgaven lar oss anta at den ikke er det.</p>",
        poeng: ["lete fra lavest prioritet og stoppe ved første ikke-tomme bøtte (4p)"]
      },
      {
        del: "(d)",
        tekst: "<p><b>Insert er O(1)</b>: ett oppslag i arrayet og én innsetting først i en lenket liste. " +
          "<b>RemoveMin er O(1)</b> når N = 100: løkka sjekker høyst 100 bøtter, og det er en konstant som ikke avhenger av n. (Generelt er RemoveMin O(N).)</p>",
        kjoretid: "Insert O(1), RemoveMin O(1) med N = 100",
        poeng: ["Insert O(1) (1p)", "RemoveMin O(1) fordi N er konstant (1p)"]
      }
    ],
    hvorfor: {
      eli5: "<p>Sensor vil se at du bruker én skuff per prioritet. Da kan du legge noe i riktig skuff med en gang. Når du skal ta ut, ser du bare i skuffene fra 0 og oppover. Det er bare 100 skuffer, så det går alltid like fort.</p>",
      normal: "<p>Svaret bruker datastrukturen sensor ser etter, et array av bøtter, og begge algoritmene er korte og riktige. Kjøretiden er begrunnet med at N er en konstant. En løsning med binær heap kunne bare gitt 4 poeng.</p>",
      teknisk: "<p>Når prioritetene er heltall i et kjent, fast område, kan prioriteten brukes som indeks. Insert blir O(1), og RemoveMin koster O(N) uavhengig av n. Med N = 100 er det O(1). En binær heap gir O(log n) og utnytter ikke at prioritetene er små heltall.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 10",
      deler: [
        { del: "(a)", fasit: "<p>1 poeng. Siden vi har prioriteter fra 0 til et kjent maksimum N , passer et enkelt array av bøtter perfekt. Bøttene kan for eksempel være en enkeltlenket liste. Dette er helt tilsvarende bucket sort.</p>" },
        { del: "(b)", fasit: "<p>Opp til 3 poeng. Legg til x i bøtta på plass p i Q.</p>",
          kode: { name: "Insert", params: "Q, x, p", input: BQ_IN + ", og et element x med prioritet p", output: "Q med x satt inn med prioritet p",
            lines: [L("B ← Q[p]", 1), L("add x to B", 1)] } },
        { del: "(c)", fasit: "<p>Opp til 4 poeng. Finn det den første ikke-tomme bøtta, og fjern og returner det første i den bøtta.</p>",
          kode: { name: "RemoveMin", params: "Q", input: BQ_IN, output: "En x med lavest mulig prioritet, som er fjernet fra Q",
            lines: [L("for i ← 0 to N − 1 do", 1), L("B ← Q[i]", 2), L("if B is not empty then", 2), L("return B.pop()", 3)] } },
        { del: "(d)", fasit: "<p>1 poeng for hver av algoritmene. Siden N er konstant så er begge algoritmene O(1).</p>" },
        { kriterier: "<p>En besvarelse som tar utgangspunkt i en binær heap (eller andre mindre egnede strukturer) kan få maksimalt 4 poeng.</p>" }
      ]
    }
  };

  /* ---------- H2024 · Oppgave 7 · Mediankø (12 poeng) ---------- */
  IN.PERFEKT["H2024-7"] = {
    type: "eksamen",
    svar: [
      {
        del: "(a)",
        tekst: "<p><b>Svar: 3, 2, 4</b></p><ol class=\"small\">" +
          "<li>Sortert: 1, 2, 3, 4, 8. Den midterste er 3.</li>" +
          "<li>Igjen: 1, 2, 4, 8. De to midterste er 2 og 4, og vi velger den minste: 2.</li>" +
          "<li>Igjen: 1, 4, 8. Den midterste er 4.</li></ol>",
        fasitVerdi: "3, 2, 4",
        poeng: ["3, 2, 4 (1p)"]
      },
      {
        del: "(b)",
        tekst: "<p>Mediankøen Q består av to heaper. <span class=\"mono\">Q.small</span> er en <b>max-heap</b> med den minste halvdelen av elementene, og " +
          "<span class=\"mono\">Q.large</span> er en <b>min-heap</b> med den største halvdelen. Vi holder dem slik at Q.small har like mange elementer som Q.large, eller ett mer. " +
          "Da er toppen av Q.small alltid medianen.</p>",
        poeng: ["en forståelig representasjon som passer med (c) (1p)"]
      },
      {
        del: "(c)",
        tekst: "<p><b>insert(Q, x):</b> Er Q.small tom, eller er x mindre enn toppen av Q.small, setter vi x inn i Q.small. Ellers setter vi x inn i Q.large. Så kaller vi Balance.</p>" +
          "<p><b>Balance(Q):</b> Har Q.small mer enn ett element mer enn Q.large, flytter vi det største i Q.small over til Q.large. Har Q.large flere elementer enn Q.small, flytter vi det minste i Q.large over til Q.small.</p>" +
          "<p><b>removeMedian(Q):</b> Medianen er toppen av Q.small. Vi tar den ut med RemoveMax, kaller Balance og returnerer den.</p>",
        kode: combo([IN.algos.medianInsert, IN.algos.medianBalance, IN.algos.removeMedian].filter(Boolean)),
        etter: "<p class=\"small muted\">Begge invariantene holder etter hver operasjon: alt i Q.small er ≤ alt i Q.large, og |Q.small| − |Q.large| er 0 eller 1. Ved et partall antall er toppen av Q.small da den minste av de to midterste, slik oppgaven krever.</p>",
        poeng: ["to heaper, en max-heap og en min-heap: den beste løsningen (opptil 6p)", "en forklaring som er god nok til at man kan implementere den"]
      },
      {
        del: "(d)",
        tekst: "<p>Begge er <b>O(log n)</b>. insert gjør én heap-innsetting, og Balance gjør høyst én flytting (ett uttak og én innsetting). removeMedian gjør ett RemoveMax og én Balance. Hver heap-operasjon er O(log n), og det er et konstant antall av dem.</p>",
        kjoretid: "insert O(log n), removeMedian O(log n)",
        poeng: ["insert O(log n) (1p)", "removeMedian O(log n) (1p)"]
      },
      {
        del: "(e)",
        tekst: "<p>Den første medianen blir roten. Hver ny median er enten mindre enn alle som er satt inn før, eller større enn alle. " +
          "Derfor havner den alltid lengst ute til venstre eller lengst ute til høyre. I venstre subtre av roten har alle nodene bare venstre barn, og i høyre subtre har alle nodene bare høyre barn. Treet får form som en «Λ».</p>",
        fig: { cap: "Eksempel: 4, 1, 8, 3, 2 gir medianene 3, 2, 4, 1, 8. Her er de satt inn i et søketre i den rekkefølgen.",
          draw: function (h) { if (IN.vizTree) IN.vizTree(h, { tree: bstTree([3, 2, 4, 1, 8], "e") }, { ariaLabel: "Søketre med 3 i roten, 2 og 1 som en kjede til venstre, 4 og 8 som en kjede til høyre" }); } },
        poeng: ["at venstre subtre bare har venstre barn og høyre subtre bare høyre barn (2p)"]
      }
    ],
    hvorfor: {
      eli5: "<p>Sensor vil se den raske løsningen med to bunker: én for den minste halvdelen og én for den største. Da ligger midten alltid på toppen av den første bunken, og alt går fort. Til slutt vil sensor se at du skjønner hvorfor treet i (e) blir så skjevt.</p>",
      normal: "<p>Svaret bruker løsningen sensorveiledningen kaller den beste, med en max-heap og en min-heap. Den gir O(log n) på begge operasjonene. En sortert liste eller sortering ved behov kunne bare gitt 4 eller 2 av 6 poeng i (c).</p>",
      teknisk: "<p>Invariantene max(Q.small) ≤ min(Q.large) og |Q.small| − |Q.large| ∈ {0, 1} gir medianen i roten av Q.small. Hver operasjon gjør O(1) heap-operasjoner à O(log n). I (e) gir removeMedian en rekkefølge der hvert nytt element er et nytt minimum eller maksimum blant dem som allerede er satt inn, og da blir søketreet to kjeder.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2024, oppgave 7",
      deler: [
        { del: "(a)", fasit: "<p>1 poeng for 3, 2, 4.</p>" },
        { del: "(b)", fasit: "<p>1 poeng for en forståelig forklaring. Må ses i sammenheng med neste deloppgave.</p>" },
        { del: "(c)",
          fasit: "<p>Maksimalt 6 poeng.</p>" +
            "<p>Det finnes mange måter å gå løs på dette problemet. En naiv løsning er å sette elementene inn i en usortert struktur (liste eller dynamisk array), og sortere med en effektiv sorteringsalgoritme for å finne medianen ved behov. Maksimalt 2 poeng for slike løsninger.</p>" +
            "<p>En løsning som bruker sortert innsetting i en liste får lineær tid på innsetting, og det vil være mulig å holde styr på hvor medianen er, slik at den kan finnes i konstant tid. Hvis man holder styr på hvor midten er, og bruker en dobbeltlenket liste, så kan man fjerne det minste elementet i konstant tid. Maksimalt 4 poeng for en slik løsning.</p>" +
            "<p>Den beste løsningen (vi har funnet) er å bruke to prioritetskøer (eller binære heaps); en max-heap og en min-heap, som lar oss få logaritmisk tid på begge operasjoner. Vi lar Q.small være en max-heap og Q.large være en min-heap. Hvis vi sørger for at Q.small inneholder den minste halvparten av elementene og Q.large inneholder den største halvparten, vil toppen av Q.small alltid være medianen.</p>" +
            "<p>Merk at denne løsningen, som involverer å holde to datastrukturer like store, ligner på oppgaven Teque, som er blitt gitt som en innleveringsoppgave.</p>",
          kode: { name: "balance", params: "Q", lines: [
            L("if |Q.large| + 1 < |Q.small| then", 1), L("x ← removeMax(Q.small)", 2), L("insert(Q.large, x)", 2),
            L("if |Q.small| < |Q.large| then", 1), L("x ← removeMin(Q.large)", 2), L("insert(Q.small, x)", 2),
            L("", 0), L("Procedure insert(Q, x)", 0),
            L("if Q.small is empty or x < peek(Q.small) then", 1), L("insert(Q.small, x)", 2), L("else", 1), L("insert(Q.large, x)", 2), L("balance(Q)", 1),
            L("", 0), L("Procedure removeMedian(Q)", 0),
            L("x ← removeMax(Q.small)", 1), L("balance(Q)", 1), L("return x", 1)] },
          etter: "<p>For full uttelling må forklaringen være dekkende nok til at man kan implementere algoritmene med utgangspunkt i forklaringen.</p>" },
        { del: "(d)", fasit: "<p>Maksimalt 2 poeng, der det gis 1 poeng for hver prosedyre. For løsningen ovenfor er begge prosedyrer i O(log(n)).</p>" },
        { del: "(e)", fasit: "<p>Maksimalt 2 poeng.</p><p>I venstre subtre fra roten vil alle noder kun ha venstre barn, og i høyre subtre fra roten vil alle noder kun ha høyre barn. Det vil altså se slik ut:</p>" + LAMBDA_SVG }
      ],
      merknad: "Figuren i (e) er tegnet på nytt etter figuren i sensorveiledningen. Sensor kaller prosedyrene <span class=\"mono\">balance</span>, <span class=\"mono\">insert</span> og <span class=\"mono\">removeMedian</span>. I vårt svar heter de MedianInsert, Balance og RemoveMedian, og heap-operasjonene skrives med stor forbokstav (Insert, RemoveMax, Peek)."
    }
  };
})();
