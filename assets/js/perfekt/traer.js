/* ============================================================
   IN2010 guide · perfekt/traer.js
   «Perfekt svar» for eksamensoppgavene om trær (lastes på 04-traer.html,
   etter data-traer.js). Format: plan/gjennomgang/wp0-format.md.
   - svar: vårt eget fullpoengssvar på kursnivå (samme på alle nivåer).
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette
     kilder (forelesning, ukesoppgaver, lærebok) hører hjemme her.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.PERFEKT = IN.PERFEKT || {};
  var TR = IN.traer || {};

  function L(code, indent) { return { code: code, indent: indent }; }
  // Binærtre fra nøstet [k, venstre, høyre] med unike id-er (pre + k), så flere trær kan stå i samme skog
  function nest(s, pre) {
    if (!s) return null;
    return { id: pre + s[0], k: s[0], l: nest(s[1], pre), r: nest(s[2], pre), h: 0 };
  }
  function gen(s, pre) {
    var v = { id: pre + s[0], k: s[0], ch: [] };
    for (var i = 1; i < s.length; i++) v.ch.push(gen(s[i], pre));
    return v;
  }
  function scale(h, f) {
    var svg = h.querySelector("svg"), vb = svg && svg.getAttribute("viewBox");
    if (vb) { svg.style.width = Math.round(+vb.split(" ")[2] * f) + "px"; svg.style.maxWidth = "100%"; }
  }
  function tree(h, step, aria, f) {
    if (!IN.vizTree) return;
    IN.vizTree(h, step, { ariaLabel: aria });
    scale(h, f || 0.9);
  }
  // En rekke små trær med en tekst over hvert (f.eks. rotasjonssekvenser)
  function rekke(h, items, aria) {
    var row = document.createElement("div");
    row.className = "tr-rekke";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", aria);
    items.forEach(function (it, i) {
      var cell = document.createElement("div");
      cell.className = "tr-rekke-celle";
      var lbl = document.createElement("div");
      lbl.className = "tr-rekke-lbl small";
      lbl.textContent = it.lbl;
      var th = document.createElement("div");
      cell.appendChild(lbl); cell.appendChild(th);
      row.appendChild(cell);
      if (IN.vizTree) { IN.vizTree(th, { tree: nest(it.t, "s" + i + "-"), marks: it.marks || {} }, { ariaLabel: it.lbl + ": " + it.aria }); scale(th, 0.7); }
    });
    h.appendChild(row);
  }
  function seq(lines) { return '<div class="et-sv-seq">' + lines.join("\n") + "</div>"; }

  /* ---------- H2020 · Oppgave 2 · Binære søketrær (4 poeng) ---------- */
  IN.PERFEKT["H2020-2"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p><b>C.</b> Roten A har tre barn (B, C og D), men i et binærtre har hver node høyst to barn. C er en løvnode, så vi kan fjerne den uten å miste andre noder. (Å fjerne B eller D ville også gitt et binærtre, men da forsvinner barna deres også. Sensors svar er C.)</p>",
        poeng: ["noden C (1p)"] },
      { del: "(b)", tekst: "<p><b>5.</b> 5 står i venstre subtre til 4, men 5 &gt; 4. Fjerner vi 5, er resten et binært søketre: 2 &lt; 3 &lt; 4 &lt; 6 &lt; 8, og inorder blir 2, 3, 4, 6, 8.</p>",
        poeng: ["noden 5 (1p)"] },
      { del: "(c)", tekst: "<p><b>Nei.</b> Setter vi inn 1, 2, 3 i et vanlig binært søketre, får vi en kjede. Roten har da balansefaktor −2, så det er ikke et AVL-tre.</p>",
        poeng: ["nei (1p)"] },
      { del: "(d)", tekst: "<p><b>Ja.</b> Et AVL-tre er et binært søketre med et ekstra krav om balanse.</p>",
        poeng: ["ja (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Hver deloppgave har ett riktig svar. En kort begrunnelse viser at du ikke har gjettet.</p>",
      normal: "<p>Svarene er de samme som i sensorveiledningen. Begrunnelsene er med for å vise forståelse, men det er svaret som gir poenget.</p>",
      teknisk: "<p>(a) og (b) tester definisjonene: høyst to barn, og søketre-egenskapen for hele subtrær. (c) og (d) tester at AVL er et strengere krav enn BST: hvert AVL-tre er et BST, men ikke omvendt.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020, oppgave 2",
      deler: [
        { del: "(a)", fasit: "<p>Noden som inneholder C.</p>" },
        { del: "(b)", fasit: "<p>Noden som inneholder 5.</p>" },
        { del: "(c)", fasit: "<p>Nei.</p>" },
        { del: "(d)", fasit: "<p>Ja.</p>" }
      ],
      merknad: "Poengene (1 per deloppgave) står på eksamensarket."
    }
  };

  /* ---------- H2021 · Oppgave 8 · Intervall i et binært søketre (10 poeng) ---------- */
  IN.PERFEKT["H2021-8"] = {
    type: "eksamen",
    intro: "<p>Vi antar at B er gitt ved rotnoden, at hver node har feltene <span class=\"mono\">v.element</span>, <span class=\"mono\">v.left</span> og <span class=\"mono\">v.right</span>, og at det tomme treet er <span class=\"mono\">null</span>. Kallet blir <span class=\"mono\">InRange(rot, a, b)</span>.</p>",
    svar: [
      { del: "(a)",
        tekst: "<p>En inorder-traversering gir verdiene i stigende rekkefølge. Vi skriver ut bare de som ligger i [a, b], og vi <b>hopper over</b> subtrær som ikke kan ha treff:</p>" +
          "<ul><li>Venstre subtre har bare verdier mindre enn v.element. Vi går dit bare hvis a &lt; v.element.</li>" +
          "<li>Høyre subtre har bare verdier større enn v.element. Vi går dit bare hvis v.element &lt; b.</li></ul>",
        kode: "inRange",
        etter: "<p>For B₁ gir InRange(B₁, 2, 7) utskriften 2, 5, 7. Hele høyre subtre til 10 hoppes over, fordi 10 &lt; 7 er usant. Se steg-demoen i dette kortet.</p>",
        kjoretid: "O(h + k), der h er høyden og k er antall verdier som skrives ut. I et balansert tre er det O(log n + k)",
        poeng: ["en riktig algoritme med god fremstilling", "at den er O(log n) når a = b. Det er det som gir full uttelling"] },
      { del: "(b)", tekst: "<p><b>O(n).</b> Alle n verdier ligger i intervallet og skal skrives ut, så hver node besøkes.</p>", poeng: ["riktig kjøretid"] },
      { del: "(c)", tekst: "<p><b>O(log n).</b> Med a = b går vi i hver node til høyst én side (eller ingen), så vi følger én sti fra roten. Treet er balansert, så stien har lengde O(log n).</p>", poeng: ["riktig kjøretid"] }
    ],
    hvorfor: {
      eli5: "<p>Vi går bare dit tallene kan være. Da slipper vi å se på hele treet når intervallet er lite.</p>",
      normal: "<p>Sensor gir poeng etter kjøretiden: en løsning som er O(log n) når a = b, gir full uttelling. Beskjæringen er det som gir det. En vanlig inorder uten beskjæring er O(n) og gir høyst 8 poeng.</p>",
      teknisk: "<p>Hver node vi besøker, ligger enten på en av de to stiene mot a og b (O(h)), eller er et treff (k stykker). Det gir O(h + k). Med a = b er k ≤ 1, så O(log n) i et balansert tre.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021, oppgave 8",
      deler: [
        { fasit: "<p>Vi gir ingen føringer på hvordan det binære treet skal være implementert. Studenten må selv gjøre rimelige antagelser her (som at det en node har et element x en venstre- og en høyrepeker). Her antar vi at B er representert ved rotnoden, og tar denne noden som input. Hver node har en venstre, høyre og en x. Vi representerer det tomme treet ved null.</p>" },
        { del: "(a)",
          kode: { name: "InRange", params: "v, a, b",
            input: "Et balansert binært søketre B og to heltall a og b der a ≤ b",
            output: "Skriver ut verdiene innenfor intervallet [a, b] i sortert rekkefølge",
            lines: [L("if v = null then", 1), L("return null", 2), L("if a < v.x then", 1), L("InRange(v.left, a, b)", 2),
              L("if a ≤ v.x ≤ b then", 1), L("print(v.x)", 2), L("if v.x < b then", 1), L("InRange(v.right, a, b)", 2)] },
          etter: "<p>Denne algoritmen har kjøretidskompleksitet O(log n+min(n, (b−a))), men dette trenger ikke studenten å oppgi.</p>" },
        { del: "(b)", fasit: "<p>Algoritmen kjører i O(n) dersom a og b er henholdsvis det største og minste tallet i B.</p>" },
        { del: "(c)", fasit: "<p>Dersom a = b er kjøretidskompleksiteten O(log n).</p>" },
        { kriterier: "<p>For full uttelling må studenten ha en god fremstilling av en algoritme som har O(log n) når a = b, og oppgi riktig kjøretidskompleksitet. En O(n) algoritme kan få opp til 8 poeng. En O(n · log n) algoritme kan få opp til 5 poeng. En O(n<sup>2</sup>) algoritme kan få opp til 2 poeng.</p>" }
      ],
      merknad: "Sensor skriver <span class=\"mono\">v.x</span> der vi skriver <span class=\"mono\">v.element</span>. I (b) har sensor byttet om «største» og «minste» i forhold til oppgaveteksten. Meningen er den samme: hele treet ligger i intervallet."
    }
  };

  /* ---------- H2022 · Oppgave 11 · Er binærtreet et søketre? (10 poeng) ---------- */
  IN.PERFEKT["H2022-11"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p>For hver node v gjelder: alle verdier i venstre subtre til v er mindre enn v.element, og alle verdier i høyre subtre er større enn v.element.</p><p class=\"small muted\">Det holder ikke at hvert barn står riktig i forhold til forelderen sin. Kravet gjelder hele subtrær.</p>",
        poeng: ["riktig egenskap, for hele subtrær (2p)"] },
      { del: "(b)",
        tekst: "<p>Vi sender med et intervall (low, high) som alle nodene i subtreet må ligge strengt innenfor. Roten får (−∞, ∞). Går vi til venstre, blir v.element ny øvre grense. Går vi til høyre, blir v.element ny nedre grense. Da sjekkes hver node bare én gang.</p>",
        kode: "checkBSTArk",
        etter: "<p>For false-treet stopper algoritmen i 9: den ligger i venstre subtre til 5 og høyre subtre til 2, så intervallet er (2, 5), og 9 er ikke innenfor. Se steg-demoen i dette kortet.</p>",
        kjoretid: "O(n)",
        poeng: ["en lineær løsning (opptil 6p). En kvadratisk løsning med FindMin/FindMax i hver node gir opptil 4p"] },
      { del: "(c)", tekst: "<p><b>O(n)</b>, der n er antall noder. Hver node får ett kall med et fast antall sammenligninger, og i tillegg kommer høyst n + 1 kall på null.</p>",
        poeng: ["riktig kjøretid for løsningen din (2p)"] }
    ],
    hvorfor: {
      eli5: "<p>Hvert tall får vite hvilke tall som er lov for det, ut fra alle tallene over seg. Da trenger vi bare å se på hvert tall én gang.</p>",
      normal: "<p>Sensor gir opptil 6 poeng i (b) for en lineær løsning og opptil 4 for en kvadratisk. Grensemetoden er lineær. Inorder-metoden (sjekk at inorder-lista er sortert) er like god.</p>",
      teknisk: "<p>Invariant: CheckBSTHelper(v, low, high) er true hvis og bare hvis subtreet til v er et søketre med alle verdier i (low, high). Hver node gir O(1) arbeid, så O(n). Sensor starter med FindMin(v) og FindMax(v) og lukkede grenser, vi starter med −∞ og ∞ og åpne grenser. Med unike tall er det samme svar.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 11",
      deler: [
        { del: "(a)", fasit: "<p>Verdien i hver node må være større enn alle verdier i venstre subtre og mindre enn alle verdier i høyre subtre.</p>",
          kriterier: "<p>Det gis 2 poeng for å oppgi riktig egenskap. Spørsmålet er gitt mest for å sørge for at studenten har dette klart for seg før neste deloppgave.</p>" },
        { del: "(b)", fasit: "<p>Her er tre «naturlige» løsninger på problemet.</p><p>En O(n<sup>2</sup>) løsning som følger definisjonen av binære søketre godt kan se slik ut:</p>",
          kode: { name: "CheckBST", params: "v", lines: [L("if v = null then", 1), L("return true", 2), L("if v.element < FindMax(v.left) then", 1), L("return false", 2),
            L("if v.element > FindMin(v.right) then", 1), L("return false", 2), L("return CheckBST(v.left) and CheckBST(v.right)", 1)] } },
        { fasit: "<p>Ved å regne ut minste og største noder i treet først får vi en fin O(n) løsning:</p>",
          kode: { name: "CheckBST", params: "v", lines: [L("return CheckBSTHelper(v, FindMin(v), FindMax(v))", 1), L("", 0),
            L("Procedure CheckBSTHelper(v, low, high)", 0), L("if v = null then", 1), L("return true", 2), L("", 1),
            L("if v.element < low or v.element > high then", 1), L("return false", 2), L("", 1),
            L("checkLeft ← CheckBSTHelper(v.left, low, v.element)", 1), L("checkRight ← CheckBSTHelper(v.right, v.element, high)", 1), L("", 1),
            L("return checkLeft and checkRight", 1)] } },
        { fasit: "<p>En annen O(n) løsning er å gjøre en in-order traversering av det binære treet, og legge nodene i en liste. Dersom den resulterende listen er sortert, så er treet også et binært søketre.</p>",
          kode: { name: "CheckBST", params: "v", lines: [L("inorder_list ← InOrder(v, empty list)", 1), L("for consecutive pairs (x, y) in inorder_list do", 1),
            L("if x > y then", 2), L("return false", 3), L("return true", 1), L("", 0), L("Procedure InOrder(v, list)", 0), L("if v = null then", 1), L("return list", 2), L("", 1),
            L("InOrder(v.left, list)", 1), L("append v.element to list", 1), L("InOrder(v.right, list)", 1), L("", 1), L("return list", 1)] },
          kriterier: "<p>Det gis opp til 4 poeng for en kvadratisk løsning, og opp til 6 poeng for en lineær løsning.</p>" },
        { del: "(c)", kriterier: "<p>Det gis 2 poeng for riktig kjøretidskompleksitet.</p>" }
      ],
      merknad: "Linjene 3, 7, 10 og 13 i sensorens andre løsning og linjene 7, 11 og 15 i den tredje er tomme i sensorveiledningen. I den tredje løsningen står <span class=\"mono\">return false</span> rykket inn under <span class=\"mono\">if x &gt; y then</span>, slik som på arket."
    }
  };

  /* ---------- H2023 · Oppgave 5 · Diameteren til et tre (12 poeng) ---------- */
  IN.PERFEKT["H2023-5"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p><b>5.</b> Den lengste stien går fra løvnoden under det første barnet, opp til roten, og ned til den dypeste løvnoden under det fjerde barnet: f – b – a – e – h – i, som har 5 kanter.</p>",
        fig: { cap: "T₄ med den lengste stien markert (bokstavene er våre navn på nodene)", draw: function (h) {
          var t = gen(["a", ["b", ["f"]], ["c"], ["d"], ["e", ["g"], ["h", ["i"]]]], "d4-");
          tree(h, { tree: t, edges: [["d4-f", "d4-b"], ["d4-b", "d4-a"], ["d4-a", "d4-e"], ["d4-e", "d4-h"], ["d4-h", "d4-i"]] }, "T4 med lengste sti f, b, a, e, h, i", 0.85);
        } },
        fasitVerdi: "5", poeng: ["riktig svar (1p)"] },
      { del: "(b)", tekst: "<p><b>Nei.</b> Ta et binærtre der den lengste stien går gjennom roten, og lag en ny rot som har hele treet som venstre subtre. Den lengste stien er fortsatt den samme, og den går ikke gjennom den nye roten. Den nye roten har jo bare ett barn, så en sti gjennom den kan bare gå ned på én side.</p>",
        poeng: ["riktig svar (1p)", "en god begrunnelse, for eksempel et moteksempel (1p)"] },
      { del: "(c)",
        tekst: "<p>Den lengste stien som går gjennom en node v, går fra den dypeste noden i venstre subtre, via v, til den dypeste noden i høyre subtre. Lengden er hL + hR + 2, der hL og hR er høydene til subtrærne (høyden til et tomt tre er −1). Diameteren er den største slike verdien over alle noder.</p>" +
          "<p>For å få lineær tid regner vi ut høyden og diameteren i <b>samme</b> rekursjon. Hjelpeprosedyren returnerer paret (h, d) for subtreet:</p>",
        kode: "diameterArk",
        etter: "<p>For T₂ fra oppgaveteksten gir dette 4, som oppgaven sier. Se steg-demoen i dette kortet.</p>",
        poeng: ["en løsning i lineær tid (opptil 8p). Kvadratisk tid gir opptil 5p"] },
      { del: "(d)", tekst: "<p><b>O(n).</b> DiameterPair kalles én gang for hver node og én gang for hvert tomt barn (høyst n + 1), og hvert kall gjør et fast antall operasjoner.</p>",
        kjoretid: "O(n)", poeng: ["riktig kjøretid for løsningen din (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Hver node spør barna sine to ting: «Hvor høye er dere, og hvor lang er den lengste stien hos dere?» Da trenger vi bare å gå gjennom treet én gang.</p>",
      normal: "<p>(c) gir 8 poeng bare for en lineær løsning. Det vanlige fallet er å kalle Height på nytt i hver node, som gir O(n<sup>2</sup>) for en kjede. Ved å returnere høyden sammen med diameteren unngår vi det.</p>",
      teknisk: "<p>Alle stier i subtreet til v går enten gjennom v, eller ligger helt i v.left eller v.right. Derfor er d(v) = Max(hL + hR + 2, dL, dR). Sensorløsningen holder i stedet en største d utenfor rekursjonen. Begge er O(n) og gir full uttelling.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2023, oppgave 5",
      deler: [
        { del: "(a)", fasit: "<p>Svaret er 5. Det gis 1 poeng for riktig svar.</p>" },
        { del: "(b)", fasit: "<p>Nei. Se for deg et komplett binærtre med mange noder; der vil den lengste stien gå gjennom rotnoden. Hvis du lager en ny rotnode som har det komplette binærtreet som sitt venstre subtre, så vil den lengste stien gå gjennom de samme nodene, og ikke gjennom den nye rotnoden.</p>",
          kriterier: ["Opptil 2 poeng for hele deloppgaven.", "Det gis 1 poeng for riktig svar.", "Det gis 1 poeng for en god begrunnelse."] },
        { del: "(c)",
          fasit: "<p>Hvis vi først antar at rotnoden er med i den lengste stien, så vil den lengste stien gå fra den dypeste noden i det venstre subtreet, via rotnoden, og ned til den dypeste noden i det høyre subtreet. Høyden av et subtre angir antall kanter til den dypeste noden i treet.</p>" +
            "<p>Hvis vi antar at hL og hR er høydene til venstre og høyre subtre av rotnoden, så vil diameteren være gitt av hL + hR + 2.</p>" +
            "<p>Mer generelt vil den lengste stien som går gjennom en node være gitt av hL + hR + 2 gi (der vi antar at hL og hR er høydene av den aktuelle noden).</p>" +
            "<p>Altså kan problemet løses ved å for hver node beregne lengden på den lengste stien den inngår i, og til slutt returnere den lengste av disse lengdene. Dette kan gjøres i lineær tid.</p>",
          kode: { name: "Diameter", params: "v", lines: [L("d←0", 1), L("", 1), L("Procedure DiameterRec(v)", 1), L("if v = null then", 2), L("return −1", 3),
            L("hL ← DiameterRec(v.left)", 2), L("hR ← DiameterRec(v.right)", 2), L("d ← max(d, hL + hR + 2)", 2), L("return 1 + max(hL, hR)", 2), L("", 1),
            L("DiameterRec(v)", 1), L("return d", 1)] },
          etter: "<p>Her er problemet løst ved å gå gjennom treet én gang. Den definerer en indre prosedyre for å unngå å bruke en global variabel, men dette er helt uvesentlig med tanke på vurdering av oppgaven.</p>" +
            "<p>Det er muligens enklere å løse dette ved å dele opp problemet i flere steg. For eksempel kan høyden i hver node beregnes først, deretter en lokal diameter for hver node, og til slutt løpe over alle nodene og finne den største diameteren. Ingen slike avveininger har noen påvirkning på poenggivningen.</p>" +
            "<p>Det kan være fort gjort å ende opp med en kvadratisk løsning.</p>",
          kriterier: ["Opptil 8 poeng for en løsning i lineær tid.", "Opptil 5 poeng for en løsning i kvadratisk tid.", "Opptil 3 poeng for gode forsøk, men som ikke vil fungere."] },
        { del: "(d)", kriterier: "<p>1 poeng for riktig kjøretidskompleksitet avhengig av svaret som ble gitt i forrige deloppgave. Det kan gis poeng selv hvis det er store mangler i forrige deloppgave.</p>" }
      ]
    }
  };

  /* ---------- H2024 · Oppgave 6 · Laveste felles forfeder (12 poeng) ---------- */
  IN.PERFEKT["H2024-6"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p>Roten er en forfeder av alle nodene i treet. Derfor har hvert par av noder minst én felles forfeder, nemlig roten.</p>", poeng: ["at roten er forfeder av alle noder (1p)"] },
      { del: "(b)",
        tekst: "<p>Er u = v, er svaret u (en node regnes som etterkommer av seg selv). Ellers kan ikke den dypeste av de to være svaret, så vi flytter den ett nivå opp til forelderen og prøver igjen. Er dybdene like, flytter vi u.</p>",
        kode: "lowestCommonAncestor",
        etter: "<p>For g og j: j (dybde 3) går opp til h, så går g og h (begge dybde 2) opp, og begge ender i e. Svaret er e. Se steg-demoen i dette kortet.</p>",
        kjoretid: "O(h), der h er høyden til treet. Hvert kall flytter en av nodene ett nivå opp",
        poeng: ["en løsning i O(h) (opptil 5p). En løsning i lineær tid gir høyst 3p"] },
      { del: "(c)",
        tekst: "<p>Start i roten. Ligger v.element mellom x og y (med ≤ i begge ender), skilles veiene til x og y her, eller v er en av dem. Da er v svaret. Er y &lt; v.element, ligger begge til venstre. Ellers ligger begge til høyre.</p>",
        kode: "lowestCommonAncestorBST",
        etter: "<p>Arket gir ikke noe eksempeltre her. I steg-demoen bruker vi søketreet 50, 30, 70, 20, 40, 60, 80: for x = 20 og y = 40 er svaret 30.</p>",
        poeng: ["en løsning i O(h) (opptil 5p). En løsning i lineær tid gir høyst 3p"] },
      { del: "(d)", tekst: "<p><b>O(n)</b> i verste tilfelle, fordi treet kan være en kjede med høyde n − 1. <b>O(log n)</b> når treet er balansert. Algoritmen følger én sti fra roten, så den er O(h). (Løsningen på (b) har samme kjøretider.)</p>",
        kjoretid: "O(h): O(n) i verste tilfelle, O(log n) når treet er balansert", poeng: ["riktig kjøretid (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Vi bruker det vi får vite om treet. Kjenner vi foreldrene og dybden, klatrer vi oppover. Er det et søketre, går vi rett ned mot tallene.</p>",
      normal: "<p>Både (b) og (c) gir full uttelling bare for O(h). Løsningene følger én sti, så de er O(h). En løsning som går gjennom hele treet, gir høyst 3 av 5 poeng.</p>",
      teknisk: "<p>(b): summen av dybdene synker med 1 per kall, så det blir høyst dybde(u) + dybde(v) + 1 kall. (c): over splittpunktet ligger x og y i samme subtre. I splittpunktet skilles stiene, eller en av dem er noden selv. Derfor er det første v med x ≤ v.element ≤ y den laveste felles forfederen.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2024, oppgave 6",
      deler: [
        { del: "(a)", fasit: "<p>Maksimalt 1 poeng. Hvert par av noder vil ha en felles forfeder, fordi rotnoden er en forfeder av alle noder i treet.</p>" },
        { del: "(b)", fasit: "<p>Maksimalt 5 poeng.</p>",
          kode: { name: "LowestCommonAncestor", params: "u, v", input: "To noder u of v", output: "Returnerer laveste felles forfeder av u og v",
            lines: [L("if u = v then", 1), L("return u", 2), L("if u.depth < v.depth then", 1), L("return LowestCommonAncestor(u, v.parent)", 2), L("return LowestCommonAncestor(u.parent, v)", 1)] },
          etter: "<p>En god løsning vil være i O(h) der h er høyden til treet (slik som den over). Maksimalt 3 poeng for løsninger i lineær tid.</p>" },
        { del: "(c)", fasit: "<p>Maksimalt 5 poeng.</p>",
          kode: { name: "LowestCommonAncestorBST", params: "v, x, y", input: "En node v og to verdier x og y der x < y", output: "Returnerer laveste felles forfeder nodene som har elementene x og y",
            lines: [L("if x ≤ v.element ≤ y then", 1), L("return v", 2), L("if y < v.element then", 1), L("return LowestCommonAncestorBST(v.left, x, y)", 2), L("return LowestCommonAncestorBST(v.right, x, y)", 1)] },
          etter: "<p>En god løsning vil være i O(h) der h er høyden til treet (slik som den over). Maksimalt 3 poeng for løsninger i lineær tid.</p>" },
        { del: "(d)", kriterier: "<p>Maksimalt 1 poeng for riktig kjøretidskompleksitet.</p>" }
      ],
      merknad: "«u of v» er en skrivefeil for «u og v», både på eksamensarket og i sensorveiledningen."
    }
  };

  /* ---------- H2020 · Oppgave 6 · AVL (9 poeng) ---------- */
  var AVLSEQ = [
    { lbl: "Etter innsetting av 5", t: [1, null, [2, null, [3, null, [4, null, [5]]]]], aria: "høyrekjeden 1, 2, 3, 4, 5" },
    { lbl: "L(3)", t: [1, null, [2, null, [4, [3], [5]]]], aria: "1, 2, og 4 med barna 3 og 5" },
    { lbl: "L(2)", t: [1, null, [4, [2, null, [3]], [5]]], aria: "1 med høyre barn 4; 4 har barna 2 og 5; 2 har høyre barn 3" },
    { lbl: "R(4)", t: [1, null, [2, null, [4, [3], [5]]]], aria: "1, 2, og 4 med barna 3 og 5" },
    { lbl: "L(1)", t: [2, [1], [4, [3], [5]]], aria: "2 med barna 1 og 4; 4 har barna 3 og 5" }
  ];
  IN.PERFEKT["H2020-6"] = {
    type: "eksamen",
    intro: "<p>5 settes inn som høyre barn av 4. Så kjører Balance på hver node på veien opp mot roten: 4, 3, 2 og 1.</p>",
    svar: [
      { del: "(a)", tekst: "<p>Den første noden på veien opp med |balansefaktor| &gt; 1 er 3 (b = −2). Høyre barn 4 har b = −1, så det er ingen knekk, og vi gjør en <b>venstrerotasjon på 3</b>. Treet blir 1 → 2 → 4, der 4 har barna 3 og 5.</p>",
        fig: { cap: "Treet etter den første rotasjonen, L(3)", draw: function (h) { tree(h, { tree: nest([1, null, [2, null, [4, [3], [5]]]], "a1-"), marks: { rot: ["a1-3", "a1-4"] } }, "Treet etter første rotasjon: 1, 2, og 4 med barna 3 og 5"); } },
        poeng: ["riktig tre (2p)"] },
      { del: "(b)", tekst: "<p><b>4 rotasjoner.</b></p><ol class=\"small\">" +
          "<li>L(3): 3 har b = −2 og høyre barn 4 har b = −1.</li>" +
          "<li>L(2): 2 har b = −2. Høyre barn 4 har b = 0, så det blir en enkel venstrerotasjon.</li>" +
          "<li>R(4) og L(1): 1 har b = −3. Høyre barn 4 har b = +1 (subtreet 2–3 er høyere enn 5). Det er en knekk, så det blir en dobbel rotasjon. Den teller som to.</li></ol>",
        fig: { cap: "Alle rotasjonene, fra venstre mot høyre", draw: function (h) { rekke(h, AVLSEQ, "Rotasjonssekvensen L(3), L(2), R(4), L(1)"); } },
        poeng: ["riktig antall, 4 (4p)"] },
      { del: "(c)", tekst: "<p><b>Ja.</b> I sluttreet har alle nodene balansefaktor −1, 0 eller 1: 2 har b = −1, 4 har b = 0, og 1, 3 og 5 er løvnoder.</p>", poeng: ["ja (1p)"] },
      { del: "(d)", tekst: "<p><b>2.</b> Sluttreet har 2 i roten, 1 som venstre barn og 4 som høyre barn med barna 3 og 5.</p>", poeng: ["2 (2p)"] }
    ],
    hvorfor: {
      eli5: "<p>Vi sjekker hver node på veien opp og vrir der det er for skjevt. Tegn treet etter hver vridning, så er det lett å telle.</p>",
      normal: "<p>Svarene er de samme som i sensorveiledningen. Det vanskelige er den siste noden, 1: barnet 4 er venstretungt, så det blir to rotasjoner der, ikke én.</p>",
      teknisk: "<p>Startreet er ikke et AVL-tre, så Balance kan finne ubalanse på flere nivåer etter én innsetting. Det skjer ikke når vi starter med et AVL-tre. Hver Balance-sjekk bruker høydene etter rotasjonene lenger ned.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020, oppgave 6",
      deler: [
        { fasit: "<p class=\"muted\">[Vår beskrivelse av illustrasjonen: fem trær etter hverandre, med L(3), L(2), R(4) og L(1) på pilene mellom dem. Trærne er de samme som i vårt svar på (b).]</p>" },
        { del: "(a)", fasit: "<p>Se det andre treet i illustrasjonen.</p>" },
        { del: "(b)", fasit: "<p>Det blir gjort 4 rotasjoner.</p>" },
        { del: "(c)", fasit: "<p>Ja, det blir et AVL-tre</p>" },
        { del: "(d)", fasit: "<p>Verdien i rotnoden er 2.</p>" }
      ],
      merknad: "Sensorveiledningen viser trærne som en tegning. Den er beskrevet med ord her og tegnet på nytt i vårt svar. Poengene står på eksamensarket."
    }
  };

  /* ---------- H2022 · Oppgave 4 · Balanserte søketrær (6 poeng) ---------- */
  IN.PERFEKT["H2022-4"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p><b>5.</b> Etter 2, 4, 3 er det en knekk i 2 (4 er høyre barn, 3 er venstre barn av 4). En dobbel rotasjon, R(4) og så L(2), gjør 3 til rot med barna 2 og 4. Så havner 1 til venstre for 2 og 5 til høyre for 4, uten nye rotasjoner. Det er tre (5).</p>",
        fig: { cap: "Tre (5): sluttreet etter 2, 4, 3, 1, 5", draw: function (h) { tree(h, { tree: nest([3, [2, [1], null], [4, null, [5]]], "b5-") }, "Tre 5: 3 med barna 2 og 4; 2 har venstre barn 1; 4 har høyre barn 5"); } },
        fasitVerdi: "5", poeng: ["riktig tall"] },
      { del: "(b)", tekst: "<p><b>6.</b> Alle AVL-trær kan fargelegges som rød-svarte trær.</p>", poeng: ["riktig tall"] },
      { del: "(c)", tekst: "<p><b>11.</b> 6 havner alltid til høyre for 5. Det gir rotasjon i tre (2), der roten 2 får b = −2, og i tre (4) og (5), der noden 4 får b = −2. I tre (1), (3) og (6) holder alle nodene seg innenfor −1, 0 og 1. 2 + 4 + 5 = 11.</p>", poeng: ["riktig sum"] }
    ],
    hvorfor: {
      eli5: "<p>Spor hver innsetting, og skriv høyden ved nodene. Da ser du hvor treet blir for skjevt.</p>",
      normal: "<p>Hver deloppgave har ett riktig tall, og svarene er de samme som i sensorveiledningen. Poengene per deloppgave står ikke i sensorveiledningen.</p>",
      teknisk: "<p>I (c) er det nok å se på stien fra roten ned til 5: en rotasjon skjer der en node på stien får høyre subtre to høyere enn venstre etter at 6 er satt inn.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 4",
      deler: [
        { del: "(a)", fasit: "<p>5.</p>" },
        { del: "(b)", fasit: "<p>6. Alle AVL-trær kan fargelegges som et rød-svart tre.</p>" },
        { del: "(c)", fasit: "<p>2 + 4 + 5 = 11.</p>" }
      ]
    }
  };

  /* ---------- H2025 · Oppgave 4 · Anti-AVL (12 poeng) ---------- */
  var ANTISEQ = [
    { lbl: "Sett inn 3", t: [3], aria: "bare 3" },
    { lbl: "Sett inn 1", t: [3, [1], null], aria: "3 med venstre barn 1" },
    { lbl: "↷ etter høyrerotasjon", t: [1, null, [3]], aria: "1 med høyre barn 3" },
    { lbl: "Sett inn 4", t: [1, null, [3, null, [4]]], aria: "kjeden 1, 3, 4" },
    { lbl: "Sett inn 2", t: [1, null, [3, [2], [4]]], aria: "1, og 3 med barna 2 og 4" },
    { lbl: "↷ etter høyrerotasjon", t: [1, null, [2, null, [3, null, [4]]]], aria: "kjeden 1, 2, 3, 4" },
    { lbl: "Sett inn 5", t: [1, null, [2, null, [3, null, [4, null, [5]]]]], aria: "kjeden 1, 2, 3, 4, 5" }
  ];
  IN.PERFEKT["H2025-4"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p>Treet blir en <b>høyrekjede</b>: 1 er roten, 2 er høyre barn av 1, 3 er høyre barn av 2, og så videre til 5. Ingen noder har venstre barn. Det skjer <b>2 rotasjoner</b> totalt: én når 1 settes inn (1 blir venstre barn av 3), og én når 2 settes inn (2 blir venstre barn av 3).</p>",
        fig: { cap: "Innsettingene 3, 1, 4, 2, 5. ↷ er en høyrerotasjon", draw: function (h) { rekke(h, ANTISEQ, "Anti-AVL-innsettingene steg for steg"); } },
        fasitVerdi: "1 → 2 → 3 → 4 → 5 (2 rotasjoner)", poeng: ["beskrivelsen av treet (1p)", "antall rotasjoner, 2 (1p)"] },
      { del: "(b)", tekst: "<p>Et Anti-AVL-tre er et binært søketre der ingen node har venstre barn. Hver node har høyst et høyre barn, så treet er en kjede av høyrepekere: en sortert lenket liste.</p>", poeng: ["at hver node bare har et høyre barn (opptil 2p)"] },
      { del: "(c)", tekst: "<p><b>Ja.</b> Innsettingen er vanlig BST-innsetting, og den eneste endringen er en høyrerotasjon når en node har et venstre barn. En høyrerotasjon bevarer søketre-egenskapen: y = z.left er mindre enn z, og subtreet T2 = y.right ligger mellom y og z både før og etter rotasjonen.</p>", poeng: ["en god forklaring (opptil 3p)"] },
      { del: "(d)", tekst: "<p><b>O(n)</b>, der n er antall noder. Treet er en kjede med høyde n − 1. Slår vi opp det største elementet, må vi følge n − 1 høyrepekere.</p>", kjoretid: "O(n)", poeng: ["O(n) (1p)", "begrunnelsen: kjede med høyde n − 1 (1p)"] },
      { del: "(e)", tekst: "<p>AVL-innsetting holder treet så balansert som mulig: hver node lagrer høyden sin, og vi roterer når høydene til de to subtrærne er mer enn 1 fra hverandre. Anti-AVL bygger et så <b>ubalansert</b> tre som mulig: den ser bare på om det finnes et venstre barn, og bruker ikke høydene.</p>", poeng: ["balansert mot ubalansert (2p)", "at AVL roterer ut fra høydene (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Anti-AVL vrir bort alle venstre barn. Da blir treet en lang stige mot høyre.</p>",
      normal: "<p>Svaret dekker punktene i sensorveiledningen: formen og antall rotasjoner i (a), «bare høyre barn» i (b), at rotasjonen bevarer søketre-egenskapen i (c), O(n) med begrunnelse i (d), og balansert mot ubalansert og høyder i (e).</p>",
      teknisk: "<p>Invariant: etter hver innsetting har ingen node venstre barn. En ny node havner da enten bakerst i kjeden, eller som venstre barn av en node. Da roterer den noden én gang, og kjeden er hel igjen. Det gir høyst én rotasjon per innsetting.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2025, oppgave 4",
      deler: [
        { del: "(a)", fasit: "<p class=\"muted\">[Vår beskrivelse av illustrasjonen: trærne etter hver innsetting, med ↷ der det skjer en høyrerotasjon. Det siste treet er kjeden 1, 2, 3, 4, 5.]</p>" +
            "<p>Treet har 1 som rot, 2 som høyre-barn av roten, 3 som høyre barn av 2, og så videre. Altså er det en sortert lenket liste hvis du anser right som en neste-peker.</p><p>Det gjøres 2 rotasjoner total.</p>",
          kriterier: ["Inntil 2 poeng.", "1 poeng for beskrivelsen og 1 poeng for antall rotasjoner."] },
        { del: "(b)", fasit: "<p>Et Anti-AVL-tre er et binært søketre der hver node kun har et høyre-barn. Det vil se ut som en sortert lenket liste av høyre-pekere.</p>", kriterier: ["Inntil 2 poeng."] },
        { del: "(c)", fasit: "<p>Ja, Anti-AVL er binære søketrær. En høyre-rotasjon bevarer BST-egenskapen. Siden innsetting i Anti-AVL-trær er identisk med ordinære binære søketrær, bortsett fra at det gjør en høyre-rotasjon i tilfellet der noden har et venstre barn, så vil innsetting fremdeles respektere BST-egenskapen.</p>", kriterier: ["Inntil 3 poeng for en god forklaring."] },
        { del: "(d)", fasit: "<p>Oppslag i et Anti-AVL-tre er i O(n), der n er antall noder i treet. Hvis vi skal slå opp det største elementet i treet, vil vi følge n − 1 høyre-barn, som er O(n).</p>", kriterier: ["Inntil 2 poeng.", "1 poeng for riktig svar og 1 poeng for begrunnelsen."] },
        { del: "(e)", fasit: "<p>Den viktigste, og klareste forskjellen, er at AVL-trær bygger et svært balansert binært søketre, men Anti-AVL-trær bygger et svært ubalansert binært søketre.</p><p>AVL-trær er avhengig av at hver node lagrer høyden til sitt subtre, foretar rotasjoner dersom høydeforskjellen mellom to subtrær overstiger 1. Anti-AVL-trær sjekker kun om det venstre subtre er tomt.</p>",
          kriterier: ["Inntil 3 poeng.", "2 poeng for å peke ut den veldig tydelige forskjellen, og 1 poeng for å peke ut at AVL-trær gjør rotasjoner basert på høyden."] }
      ],
      merknad: "Sensorveiledningen viser innsettingene som en tegning. Den er beskrevet med ord her og tegnet på nytt i vårt svar på (a)."
    }
  };

  /* ---------- H2024 · Oppgave 2 · Huffman-trær (10 poeng) ---------- */
  IN.PERFEKT["H2024-2"] = {
    type: "eksamen",
    svar: [
      { del: "(a)", tekst: "<p><b>A = 3, B = 2, C = 1, D = 3</b> (antall bit).</p><ol class=\"small\">" +
          "<li>De to minste er A (1) og D (2). De slås sammen til en node med frekvens 3.</li>" +
          "<li>Nå er de to minste B (3) og den nye noden (3). De slås sammen til 6.</li>" +
          "<li>Til slutt slås 6 og C (7) sammen til roten, 13.</li></ol>" +
          "<p class=\"small muted\">I steg 2 har B og den nye noden samme frekvens. Velger vi i en annen rekkefølge, kan treet speiles annerledes og bitene i kodene bli andre, men kodelengdene blir de samme.</p>",
        fig: { cap: "Huffman-treet (venstre kant = 0, høyre = 1). Tallet under en løvnode er frekvensen", draw: function (h) {
          var H = TR.huffman ? TR.huffman([["A", 1], ["B", 3], ["C", 7], ["D", 2]]) : null;
          if (!H) return;
          var lab = {};
          (function w(v) { if (!v) return; if (v.sym !== undefined) lab[v.id] = String(v.f); w(v.l); w(v.r); })(H.root);
          tree(h, { tree: H.root, lab: lab, bits: true }, "Huffman-tre: roten 13 har venstre barn 6 og høyre barn C. 6 har venstre barn B og høyre barn 3. 3 har barna A og D.");
        } },
        fasitVerdi: "A = 3, B = 2, C = 1, D = 3", poeng: ["riktige kodelengder (2p)"] },
      { del: "(b)", tekst: "<p>Løvnodene inneholder <b>symbolene og frekvensene</b> deres. De indre nodene har bare en frekvens (summen av barna), og symbolet er null.</p>", poeng: ["symbol og frekvens (1p)"] },
      { del: "(c)", tekst: "<p>Lag en prioritetskø Q ordnet etter frekvens, og legg inn én node uten barn for hvert par (s, f). Så lenge Q har mer enn én node: ta ut de to nodene med minst frekvens, v1 og v2. Lag en ny node uten symbol, med v1 og v2 som barn og frekvens v1.freq + v2.freq, og legg den inn i Q. Når det bare er én node igjen, er den roten i Huffman-treet, og vi returnerer den.</p>",
        kode: "huffman",
        poeng: ["prioritetskø ordnet etter frekvens (2,5p)", "sammenslåingen av de to minste (2,5p)", "stopp når det er én node igjen (1p)", "returner roten (1p)"] }
    ],
    hvorfor: {
      eli5: "<p>Vi slår alltid sammen de to minste. Bokstaver som brukes lite, havner langt nede og får lange koder.</p>",
      normal: "<p>(c) gir poeng for fire ting: prioritetskøen, sammenslåingen, stoppbetingelsen og returverdien. Beskrivelsen nevner alle fire.</p>",
      teknisk: "<p>Kodelengden til et symbol er dybden til løvnoden. Ved lik frekvens kan valget gi et annet tre, men den totale lengden Σ f · lengde blir den samme. Her blir også hver kodelengde den samme.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2024, oppgave 2",
      deler: [
        { del: "(a)", fasit: "<p>2 poeng for riktig svar.</p><p>Kodelengdene for de ulike symbolene er:</p><table class=\"et-tab\"><tr><th>A</th><th>B</th><th>C</th><th>D</th></tr><tr><td>3</td><td>2</td><td>1</td><td>3</td></tr></table>" },
        { del: "(b)", fasit: "<p>1 poeng for riktig svar.</p><p>De vil inneholde symbolene og de relative frekvensene.</p>" },
        { del: "(c)", fasit: "<p>Maksimalt 7 poeng.</p><p>Algoritmen består av å opprette en prioritetskø som ordnes etter frekvensen til noden. Vi oppretter en node for hvert symbol- og frekvens par (uten barn) og plasserer disse på køen. Vi vil så ta ut to noder u og v fra prioritetskøen, og lage en ny node w (uten noe satt symbol) som har u og v som barn, og frekvens som svarer til summen av frekvensene til u og v. Den nye noden plasseres på prioritetskøen. Algoritmen terminerer når det kun er én node igjen på prioritetskøen, og den noden vil være rotnoden for Huffman-treet, som returneres som siste steg av algoritmen.</p>",
          kode: { name: "Huffman", params: "C", input: "En mengde C med par (s, f) der s er et symbol og f er en frekvens", output: "Et Huffman-tre",
            lines: [L("Q ← new PriorityQueue", 1), L("for (s, f) ∈ C do", 1), L("Insert(Q, new Node(s, f, null, null))", 2), L("while Size(Q) > 1 do", 1),
              L("v1 ← RemoveMin(Q)", 2), L("v2 ← RemoveMin(Q)", 2), L("f ← v1.freq + v2.freq", 2), L("Insert(Q, new Node(null, f, v1, v2))", 2), L("return RemoveMin(Q)", 1)] },
          kriterier: ["2.5 poeng for å få frem at det brukes en prioritetskø ordnet etter frekvens.", "2.5 poeng for hvordan to noder slås sammen.", "1 poeng for termineringskriterie.", "1 poeng for returverdien.",
            "En student som viser god forståelse for algoritmen kan få full uttelling selv hvis noen av momentene ovenfor ikke blir nevnt eksplisitt."] }
      ],
      merknad: "I sensorveiledningen står «RemoveM in» på linje 6 og 7. Det er en setteteknisk feil for RemoveMin, og er rettet her."
    }
  };

  /* ---------- H2021 · Oppgave 5 · Huffmantrær (5 poeng) ---------- */
  IN.PERFEKT["H2021-5"] = {
    type: "eksamen",
    intro: "<p>Kodelengdene i Huffman-treet blir a = 3, b = 4, c = 1, d = 4, e = 2. b og d (1 og 1) slås sammen først, så den nye noden (2) med a (2), så resultatet (4) med e (4), og til slutt med c (12).</p>",
    svar: [
      { del: "(a)", tekst: "<p><b>4.</b> b og d havner dypest, på dybde 4.</p>", poeng: ["1p"] },
      { del: "(b)", tekst: "<p><b>2.</b></p>", poeng: ["1p"] },
      { del: "(c)", tekst: "<p><b>26.</b> Strengen har 3 a, 2 b, 1 c, 1 d og 2 e: 3 · 3 + 2 · 4 + 1 · 1 + 1 · 4 + 2 · 2 = 9 + 8 + 1 + 4 + 4 = 26.</p>", poeng: ["1p"] },
      { del: "(d)", tekst: "<p><b>15.</b> Treet har 8 løvnoder, og hver av de 7 sammenslåingene lager én indre node: 8 + 7 = 15.</p>", poeng: ["1p"] },
      { del: "(e)", tekst: "<p><b>7.</b> Det lengste mulige er når treet er en kjede av indre noder, for eksempel med frekvensene 1, 1, 2, 4, 8, 16, 32, 64. Da har de to dypeste løvnodene 7 kanter opp til roten.</p>", poeng: ["1p"] }
    ],
    hvorfor: {
      eli5: "<p>Hver deloppgave har ett tall som svar. Regn nøye, og sjekk summen i (c) en gang til.</p>",
      normal: "<p>Svarene er de samme som i sensorveiledningen, og hver deloppgave gir 1 poeng.</p>",
      teknisk: "<p>n symboler gir n − 1 sammenslåinger, altså 2n − 1 noder. Den lengste koden er n − 1, når hver sammenslåing tar med den forrige noden.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2021, oppgave 5",
      deler: [
        { del: "(a)", fasit: "<p>4.</p>" },
        { del: "(b)", fasit: "<p>2.</p>" },
        { del: "(c)", fasit: "<p>26.</p><p>Kodelengdene for de ulike symbolene er:</p><table class=\"et-tab\"><tr><th>a</th><th>b</th><th>c</th><th>d</th><th>e</th></tr><tr><td>3</td><td>4</td><td>1</td><td>4</td><td>2</td></tr></table>" +
            "<p>Vi har 3 a-er, 2 b-er, 1 c, 1 d og 2 e-er, som gir 3 · 3 + 2 · 4 + 1 + 4 + 2 · 2 = 9 + 8 + 1 + 4 + 4 = 26.</p>" },
        { del: "(d)", fasit: "<p>15. Det vil ha 8 løvnoder og 7 interne noder.</p>" },
        { del: "(e)", fasit: "<p>7.</p>" },
        { kriterier: "<p>Det gis 1 poeng per deloppgave.</p>" }
      ]
    }
  };

  /* ---------- H2022 · Oppgave 9 · Auto complete (6 poeng, skjønn) ---------- */
  IN.PERFEKT["H2022-9"] = {
    type: "skjonn",
    svar: [
      { del: "Prefikstre (strategi 1)", tekst: "<p><b>Minne:</b> felles prefikser lagres bare én gang. I eksempelet deler bin, binary og bind stien b–i–n, og head og headache deler h–e–a–d. Jo flere ord som deler prefiks, desto mer sparer vi, og treet kan bli mindre enn en vanlig liste med alle ordene.</p>" +
          "<p><b>Innsetting:</b> vi går ned bokstav for bokstav og lager noder som mangler. Tiden er proporsjonal med lengden på ordet.</p>" +
          "<p><b>Oppslag:</b> vi følger prefikset ned (tid lik lengden på prefikset), og samler så alle ordene i subtreet under. Det tar tid lineært i størrelsen på subtreet. For den tomme strengen er det hele treet, men for hver bokstav brukeren skriver, blir subtreet mye mindre.</p>" },
      { del: "Hashmap (strategi 2)", tekst: "<p><b>Minne:</b> mye. Hvert ord ligger i lista til hvert av prefiksene sine, og den tomme strengen peker på hele ordlista. Plassen blir proporsjonal med summen av lengdene til alle ordene.</p>" +
          "<p><b>Innsetting:</b> ett ord med lengde k har k + 1 prefikser (med den tomme strengen), og vi legger ordet til i lista for hvert av dem. Tiden er proporsjonal med lengden på ordet, hvis rekkefølgen i listene ikke betyr noe.</p>" +
          "<p><b>Oppslag:</b> ett oppslag i hashmapet, forventet O(1), og lista er ferdig. Men forslagene skal vises, og det tar tid lineært i antall forslag.</p>" },
      { del: "Konklusjon", tekst: "<p>Det er en avveining mellom tid og minne. Hashmapet gir raskest oppslag, men bruker mye mer minne. Siden vi uansett må vise alle forslagene, er det lite tid å spare på det raske oppslaget. Prefikstreet er derfor et godt valg, særlig hvis forslagene først vises etter noen få bokstaver.</p>" }
    ],
    hvorfor: {
      eli5: "<p>Sensor vil se at du tenker over begge løsningene, både hvor mye plass de tar og hvor raske de er, og at du skriver tydelig.</p>",
      normal: "<p>Oppgaven vurderes etter skjønn. Svaret dekker minne, innsetting og oppslag for begge strategiene, bruker eksempelordene, og ender i en tydelig avveining.</p>",
      teknisk: "<p>Hovedpoenget er at oppslaget i hashmapet er O(1), men at resultatet uansett må skrives ut i tid lineært i antall forslag. Da forsvinner mye av fordelen, mens minnekostnaden er der hele tiden.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2022, oppgave 9",
      kriterier: "<p>Dette er en oppgave som går ut på å gjøre rimelige antagelser og anvende dem til å si noe fornuftig om hvilken fremgangsmåte man bør bruke. Dette er den oppgaven fra eksamenssettet hvor sensoren er nødt til å anvende mest skjønn i poengsettingen. Tanken bak oppgaven er å få studenten til å reflektere over hvilken fremgangsmåte man bør velge i lys av kjøretidskarakteristikkene til de to strategiene. Det bør legges vekt på at teksten er godt skrevet (dette betyr ikke at det skal trekkes poeng for enkle skrivefeil, men at teksten må være tydelig og enkel å forstå; en fin tommelfingerregel er at en setning man ikke forstår etter to gjennomlesninger ignoreres). Under er et eksempel på et svar som inneholder mange refleksjoner vi ønsker å se.</p>" +
        "<p>Strategi 1 bruker et prefiks-tre, som er en minneeffektiv representasjon av ordlisten. Det er viktig å merke seg at denne representasjonen kan være mer plassbesparende enn å kun lagre ordlisten som en liste av strenger. Desto flere ord som deler prefiks, desto mer plassbesparende er representasjonen i forhold til en ordliste.</p>" +
        "<p>Å legge til et nytt ord i prefiks-treet er veldig effektivt, med tidsbruk proporsjonalt med antall bokstaver i det nye ordet.</p>" +
        "<p>I tillegg gir prefiks-treet opphav til en veldig naturlig algoritme for å finne måter å fullføre et påbegynt ord. Vi kan følge stien som er diktert av det påbegynte ordet, og fra subtreet til noden kan ordene samles. Dette tar lineær tid med hensyn til størrelsen av subtreet. Det vil si at dersom det på begynte ordet er den tomme strengen, så må hele ordlisten genereres, som tar lineær tid med hensyn til hele treet. Dersom vi antar at treet har høy forgrening (for eksempel 26, en for hver bokstav i det engelske alfabetet), og at størrelsen på hvert subtre er ca. like stort (som ikke er en helt rimelig antagelse), så vil hver bokstav som legges til i det påbegynte ordet korte ned antall måter å fullføre det på med 26. Det vil altså si at antall måter å fullføre ordet på minker drastisk for hver bokstav som legges til, og som gjør at det etter all sannsynlighet vil være veldig effektivt dersom vi kun lar «auto-completion»-mekanismen til å slå til dersom vi har skrevet noen få bokstaver.</p>" +
        "<p>Strategi 2 bruker et hashmap fra prefikser til ordlister. Dette er en veldig lite minneeffektiv representasjon. Den tomme strengen vil mappe til hele ordlisten, mens lenger ord vil mappe til kortere lister. Plassbruken vil være proporsjonalt med summen av antall bokstaver av alle ord i ordlisten.</p>" +
        "<p>Å legge til et nytt ord i hashmapet er veldig effektivt, med tidsbruk proporsjonalt med antall bokstaver i det nye ordet. Dette er under antagelsen om at rekkefølgen på ordlistene ikke spiller noen rolle (ofte vil man kanskje ha de sortert eller prioritert etter frekvens).</p>" +
        "<p>Å hente ut alle måter å fullføre et påbegynt ord er forventet konstant tid, ettersom vi kan returnere en liste som allerede er lagret. Dette er altså mer effektivt enn prefiks-trevarianten. Det sagt vil forslagene vises frem, og det krever lineær tid med hensyn til antall «completions».</p>" +
        "<p>Til slutt ender dette med å være hovedsakelig en avveining mellom tidsbruk og minnebruk. Hvis vi tar det å vise ordene med i betraktningen, så virker det som at det er lite tid å spare på det raske oppslaget i hashmapet.</p>"
    }
  };

  // Disse brukes også av siden (tegning av sekvensene i oppgaveteksten er ikke nødvendig, men eksporteres for gjenbruk)
  IN.PERFEKT.__traer = { nest: nest, rekke: rekke, seq: seq };
})();
