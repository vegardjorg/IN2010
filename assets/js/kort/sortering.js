/* ============================================================
   IN2010 guide · kort/sortering.js
   Eksamenskortene for Sortering (01-sortering.html): én definisjon per kort, lest av temasiden og crash.html.
   Oppgavetekstene står ordrett med kildelinje (som før). Fullpoengssvar og sensorveiledning
   ligger i perfekt/sortering.js (og perfekt/delt.js for oppgaver som deles med andre sider).
   Lastes etter perfekt/*.js. Se IN.kortData i core.js.
   ============================================================ */
(function () {
  var IN = window.IN, qs = IN.qs;
  var SIDE = "sortering";
  function def(key, meta, fn) { meta.side = SIDE; return IN.kortData.def(key, meta, fn); }

  /* ---- Faktiske eksamensoppgaver (WP0-format) ----
     Oppgaveteksten står ordrett fra eksamensarket (plan/gjennomgang/08-eksamenstekst-ordrett.md),
     perfekt svar og sensorveiledningen ligger i assets/js/perfekt/sortering.js. */
  var SW_PART = "repeating-linear-gradient(135deg, var(--c-sorted) 0 4px, color-mix(in srgb, var(--c-sorted) 35%, var(--color-surface)) 4px 8px)";
  var LEG_GNOME = [
    { cls: "compare", label: "naboparet som sammenlignes" },
    { cls: "swap", label: "byttet" },
    { cls: "part", label: "sortert seg imellom", color: SW_PART },
    { cls: "sorted", label: "ferdig (til slutt)" }
  ];
  function losningMedKode(items, algoKey, lead) {
    var box = document.createElement("div");
    box.innerHTML = "<ol>" + items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>" +
      (lead ? '<p class="small muted" style="margin:.6rem 0 .3rem">' + lead + "</p>" : "");
    var pc = document.createElement("div");
    box.appendChild(pc);
    IN.pseudo.render(pc, IN.algos[algoKey], {});
    return box;
  }
  function skel(node, algo) { IN.pseudo.render(node.querySelector(".et-skel"), algo, { tooltips: false }); return node; }
  function itemTxt(it) { return it.v + (it.tag || ""); }
  var LEG_BK = [
    { cls: "compare", label: "elementet vi jobber med" },
    { cls: "sorted", label: "skrevet tilbake i A" }
  ];

  // H2023 4: pseudokoden står som på arket (arket bruker A[i-1] og en kommentar)
  var GNOME_ARK = {
    name: "GnomeSort", params: "A",
    input: "Et array A med n elementer",
    output: "Et sortert array med de samme n elementene",
    lines: [
      { code: "i ← 0", indent: 1 },
      { code: "while i < n do", indent: 1 },
      { code: "if i > 0 and A[i-1] > A[i] then", indent: 2 },
      { code: "A[i-1], A[i] ← A[i], A[i-1] // swap A[i] and A[i - 1]", indent: 3 },
      { code: "i ← i − 1", indent: 3 },
      { code: "else", indent: 2 },
      { code: "i ← i + 1", indent: 3 }
    ]
  };
  def("H2023-4", { host: "#exam-gnome" }, function () { return {
    key: "H2023-4", year: "H2023", oppgave_nr: "Oppgave 4", title: "Gnome sort", points: 10,
    ark: "Gnome sort", ordrett: true,
    oppgave: IN.oppg({
      intro: "<p>Gnome sort er en enkel sorteringsalgoritme som ikke er kjent fra pensum. Illustrasjonen ovenfor er generert fra en kjøring av Gnome sort. Pseudokode for algoritmen er gitt nedenfor.</p>",
      figs: [{ cls: "code", draw: function (h) { IN.pseudo.render(h, GNOME_ARK, { tooltips: false }); } }],
      outro: "<p>I denne oppgaven skal du drøfte fordeler og ulemper ved Gnome sort sammenlignet med andre sorteringsalgoritmer kjent fra pensum. Teksten din bør inneholde:</p><ul><li>en kort forklaring på hvordan Gnome sort fungerer (med naturlig språk),</li><li>kjøretidskompleksiteten til Gnome sort (sammen med en kort begrunnelse),</li><li>en sammenligning av Gnome sort med sorteringsalgoritmer fra pensum, og</li><li>en kort redegjørelse for hvorvidt Gnome sort er stabil og/eller in-place.</li></ul>"
    }),
    avvik: "Illustrasjonen øverst på arket (et linjediagram fra en kjøring av Gnome sort) er utelatt fordi den bare viser én kjøring og ikke trengs for å svare. Steg-demoen i dette kortet viser en kjøring i stedet. Derfor viser «Illustrasjonen ovenfor» ikke til noe her.",
    demo: {
      engine: "bars", gen: "gnomeSort", input: [5, 2, 4, 1, 3], inputNavn: "Eksempel",
      presets: { "Sortert (beste tilfelle)": [1, 2, 3, 4, 5], "Omvendt (verste tilfelle)": [5, 4, 3, 2, 1] },
      pseudo: "gnomeSort", legend: LEG_GNOME, countControl: { min: 3, max: 9 }, inputLabel: "f.eks. 5,2,4,1,3",
      label: "Se nissen sortere 5, 2, 4, 1, 3", fasit: "1, 2, 3, 4, 5"
    },
    losning: [
      "<b>Virkemåte:</b> algoritmen vandrer over elementene. Møter den et element som er mindre enn det foran, bytter den dem og går ett steg tilbake, og slik flyttes elementet bakover med nabobytter. Nesten identisk med insertion sort, men den holder styr på bare én indeks.",
      "<b>Kjøretid:</b> kvadratisk, O(n²) (som bubble og selection). Best O(n) når alt allerede er sortert. Nøyaktig like mange bytter som insertion sort, men omtrent dobbelt så mange sammenligninger.",
      "<b>Sammenligning:</b> på grunn av den kvadratiske tiden langt dårligere for store arrayer enn de raskeste i pensum (merge, heap, quick). Den er sammenligningsbasert, så den er vanskelig å måle direkte mot bøtte og radix.",
      "<b>Egenskaper:</b> stabil (bytter bare naboer) og in-place (ingen ekstra datastruktur).",
      "<b>Poenggiving:</b> opptil 3 for god forklaring, 2 for riktig kompleksitet, 2 for riktig plassering mot de andre, 2 for stabilitet og in-place. For full uttelling må du se slektskapet med insertion sort."
    ],
    kjerne: "<p>Oppgaven tester om du kan analysere en ukjent, sammenligningsbasert algoritme: lese kjøretiden ut av løkkestrukturen, kjenne igjen at den i praksis er en insertion-sort-variant, og resonnere om stabilitet og in-place.</p>",
    tips: [
      "Knytt den eksplisitt til insertion sort. Det kreves for full uttelling: «samme antall bytter, flere sammenligninger».",
      "Ikke bland in-place og stabil: argumentér for stabilitet ut fra at bare naboer byttes, og for in-place ut fra at ingen ekstra struktur brukes.",
      "Begrunn O(n²) kort: hvert bytte flytter indeksen ett steg tilbake, og det kan trengs kvadratisk mange bytter."
    ]
  }; });

  // H2024 3
  function etyOppg() { return skel(IN.oppg({
    intro: "<p>En etymologisk ordliste er et oppslagsverk for et ords opphav. Her er et eksempel fra kategorien Matematikk:</p>" +
      "<blockquote><p>heksagon: seksvinklet figur. Av gresk hex «seks» + gonía «vinkel».</p><p class=\"small\">(Kilde: Norsk etymologisk ordbok – tematisk ordnet, Yann De Caprona)</p></blockquote>" +
      "<p>Anta at et ordobjekt <code>v</code> kun har følgende felter:</p><ul><li><code>v.string</code> – Ordet representert som en streng</li><li><code>v.category</code> – En streng som angir kategorien ordet tilhører</li></ul>" +
      "<p>Du kan anta at kategorien til et ord er en av N kategorier, der N &lt; 100.</p>",
    parts: [
      { t: "Arrayet A inneholder hele den etymologiske ordlisten ordnet alfabetisk (altså ordnet etter string). Skriv en prosedyre som stabilt sorterer arrayet A tematisk (altså ordnet etter category). Prosedyren skal ikke inneholde kall på sorteringsalgoritmer. <span class=\"et-p\">(6p)</span><div class=\"et-skel\"></div>" },
      { t: "Anta nå at du har en ordbok K, som assosierer hver kategori til et intervall som angir hvor kategorien starter og slutter i arrayet. For hvert ordobjekt v vil K[v.category] = [low, high], der low og high gir indeksen til henholdsvis det første, og det siste, ordobjektet som tilhører kategorien til v. Du skal nå søke etter et gitt ordobjekt i arrayet A slik det blir returnert fra EtymologySort.<br>Oppgi hvordan du kan bruke en algoritme, kjent fra pensum, til å sjekke om et ordobjekt v finnes i arrayet A. Oppgi også kjøretidskompleksiteten til algoritmen.", p: 4 }
    ]
  }), {
    name: "EtymologySort", params: "A",
    input: "Et array A med n ordobjekter",
    output: "Et array A med de samme n ordobjektene som er ordnet etter category",
    lines: [{ code: "// · · ·", indent: 1 }]
  }); }
  var ETY_INPUT = [["arm", "Kropp"], ["banan", "Mat"], ["fiolin", "Musikk"], ["hals", "Kropp"], ["kanel", "Mat"], ["sonate", "Musikk"], ["tå", "Kropp"]];
  def("H2024-3", { host: "#exam-bucket", id: "exam-h2024-3" }, function () { return {
    id: "exam-h2024-3", key: "H2024-3", year: "H2024", oppgave_nr: "Oppgave 3", title: "Etymologisk ordliste", points: 10,
    ark: "Etymologisk ordliste", ordrett: true, poengkilde: "sv",
    oppgave: etyOppg(),
    demo: {
      engine: "buckets", gen: "etymologySort", input: ETY_INPUT, inputNavn: "Sju ord, tre kategorier",
      presets: false, customInput: false, pseudo: "etymologySort", legend: LEG_BK,
      label: "Se EtymologySort på sju ord i tre kategorier", del: "(a)",
      fasit: "arm, hals, tå, banan, kanel, fiolin, sonate",
      svar: function (last) { return last && last.A ? last.A.map(function (it) { return it.v; }).join(", ") : null; }
    },
    losning: losningMedKode([
      "<b>(a)</b> Tilpasset bøttesortering: lag en ordnet ordbok <code>B</code> med tom liste som standardverdi. Løp gjennom <code>A</code> og legg hvert element bakerst i bøtta <code>B[A[i].category]</code>. Løp så gjennom kategoriene i fast rekkefølge og skriv elementene tilbake i <code>A</code> i samme rekkefølge som de lå. Det er O(n) fordi antall kategorier er begrenset av konstanten <code>N &lt; 100</code>, og stabilt fordi hver bøtte beholder den alfabetiske rekkefølgen. Steg-demoen i dette kortet viser det på et lite eksempel.",
      "<b>(a) poeng:</b> full uttelling for bøttesortering (6p). En stabil O(n log n)-sortering gir opptil 4p (−1p hvis den ikke er stabil). En O(n²)-sortering gir opptil 2p. Husk kravet om ikke å kalle en sorteringsalgoritme.",
      "<b>(b)</b> Siden (a) er stabil, er elementene fortsatt alfabetisk ordnet innenfor hver kategori. Dermed kan du binærsøke i O(log n): start binærsøket med <code>low</code> og <code>high</code> fra <code>K[v.category]</code> og søk etter <code>v.string</code> i det intervallet. Lineære løsninger gir 2p."
    ], "etymologySort", "Slik kan (a) skrives i pseudokode:"),
    kjerne: "<p>Oppgaven tester bøttesortering når nøkkeldomenet er lite og begrenset av en konstant (det gir lineær tid), og at <b>stabilitet</b> bevarer en sekundær ordning. Det er nettopp stabiliteten fra (a) som gjør binærsøket innenfor hver kategori i (b) mulig.</p>",
    tips: [
      "Full uttelling i (a): se at <code>N &lt; 100</code> gjør antall bøtter konstant, og dermed lineær tid. Kaller du en sammenligningssortering, gir det høyst 4p.",
      "Hold sorteringen stabil (behold rekkefølgen fra input i hver bøtte). Mister du stabiliteten, mister du et poeng og ødelegger forutsetningen for (b).",
      "I (b): utnytt at hvert kategorisegment er alfabetisk sortert, og binærsøk i <code>[low, high]</code>: O(log n). Ikke løp lineært gjennom segmentet (det gir bare 2p)."
    ]
  }; });
  def("H2021-2", { host: "#exam-bucket", id: "exam-h2021-2" }, function () { return {
    id: "exam-h2021-2", key: "H2021-2", year: "H2021", oppgave_nr: "Oppgave 2", title: "Stabilitet", points: 3,
    ark: "Stabilitet", ordrett: true,
    oppgave: IN.oppg({
      intro: "<p>Anta at arrayet A er usortert og inneholder personobjekter som alle har et felt for alder. Anta videre at personobjektene som ligger på A[3] og A[42] begge er 22 år gamle.</p>" +
        "<p>Arrayet A blir sortert etter alder. Etter sorteringen får du vite at:</p><ul><li>Personobjektet som lå på A[3] før sorterting, ligger nå på A[9]</li><li>Personobjektet som lå på A[42] før sorterting, ligger nå på A[7]</li></ul>",
      parts: [
        { t: "Var sorteringen stabil?" },
        { t: "Hva er alderen til personobjektet som ligger på A[8] etter sortering?" },
        { t: "Dersom du får vite at ingen personer i A er eldre enn 100 år gammel. Hvilken sorteringsalgoritme bør da benyttes, med hensyn til kjøretidseffektivitet?" }
      ]
    }),
    demo: {
      engine: "buckets", gen: "bucketSort", input: [4, 2, 4, 1, 3], inputNavn: "Små aldre, to like",
      presets: { "Tre like": [3, 1, 3, 0, 3], "Mange like": [2, 0, 2, 1, 0, 1] }, countControl: { min: 3, max: 10 },
      parseInput: function (s) { return s.split(",").map(function (x) { return parseInt(x.trim(), 10); }).filter(function (x) { return !isNaN(x) && x >= 0 && x <= 9; }).slice(0, 10); },
      inputLabel: "tall 0–9, f.eks. 4,2,4,1,3", pseudo: "bucketSort", legend: LEG_BK,
      label: "Se at bøttesortering holder like aldre i samme rekkefølge (a før b)", del: "(c)",
      fasit: "1, 2, 3, 4a, 4b",
      svar: function (last) { return last && last.A ? last.A.map(itemTxt).join(", ") : null; }
    },
    losning: [
      "<b>(a) Nei.</b> De to 22-åringene har byttet rekkefølge: den som lå først (indeks 3), ligger nå sist (indeks 9). En stabil sortering ville holdt dem i samme innbyrdes rekkefølge.",
      "<b>(b) 22.</b> Etter sortering ligger like aldre samlet. Indeks 7 og 9 er begge 22, så indeks 8 må også være 22.",
      "<b>(c) Bøttesortering.</b> Alderen er et heltall 0–100, så vi kan bruke 101 bøtter. Det gir O(N + n) med N = 101, altså O(n), uten en eneste sammenligning. Steg-demoen i dette kortet bruker små tall, og bokstavene a og b viser at like aldre beholder rekkefølgen."
    ],
    kjerne: "<p>Stabilitet handler bare om elementer med <b>lik</b> nøkkel: beholder de rekkefølgen sin? Og når nøklene er små heltall, slår bøttesortering de sammenligningsbaserte.</p>",
    tips: [
      "Se bare på elementene med samme nøkkel når du skal avgjøre stabilitet.",
      "Alder 0–100 betyr 101 mulige verdier. Tell med 0 når du lager bøttene.",
      "Like nøkler ligger samlet etter sortering. Det kan du bruke til å si noe om plassene mellom dem."
    ]
  }; });
  def("H2020-7", { host: "#exam-bucket", id: "exam-h2020-7d" }, function () { return {
    id: "exam-h2020-7d", key: "H2020-7", deler: ["(d)"], year: "H2020", oppgave_nr: "Oppgave 7 (d)", title: "Sortering av subanagrammer", points: 6,
    ark: "Subanagram", ordrett: true,
    oppgave: skel(IN.oppg({
      intro: "<p>Vi ønsker å lage en nettside for å hjelpe sleipe Scrabble-spillere. En Scrabble-spiller har noen bokstaver som de skal prøve å forme ord fra, og disse ordene må stå i en ordbok. I denne oppgaven ignorerer alle andre Scrabble-regler, og fokuserer på det vi skal kalle subanagrammer.</p>" +
        "<p>La oss anta at bokstavene man har tilgjengelig er gitt som en streng S, og at et ord W også er gitt som en streng. Vi sier at W er et subanagram av S, dersom W kan skrives ved å kun bruke bokstaver fra S. Merk at vi ikke tillater gjenbruk av bokstaver fra S. For eksempel er \"hole\" et subanagram av \"ehlo\". Derimot er \"hello\" ikke et subanagram av \"ehlo\", fordi det ikke er to \"l\"-er i \"ehlo\". Både \"hole\" og \"hello\" er subanagrammer av \"hheelloo\".</p>" +
        "<p>Her er noen eksempler på subanagramer av \"aghilmort\":</p><ul><li>\"algorithm\"</li><li>\"logarithm\"</li><li>\"alright\"</li><li>\"right\"</li><li>\"math\"</li><li>\"git\"</li></ul>" +
        "<p>I oppgavene som følger ser vi på ulike måter å finne subanagrammer fra en gitt ordbok.</p>",
      parts: [
        { note: "(a)–(c) handler om kjøretid og hashing. De står på Hashing- og Strategi-sidene." },
        { t: "Nå som nettsiden vår har funksjonalitet for å finne subanagrammer av en streng S, gjenstår det bare å presentere resultatene for brukeren. Anta at subanagrammene som blir returnert av SubanagramsOf2 er gitt som et array, sortert alfabetisk. Vi ønsker at subanagrammene skal vises sortert etter lengde, og at ord av samme lengde sorteres alfabetisk, slik som i følgende eksempel:" +
            "<p class=\"mono small\">Input: \"algorithm\", \"alright\", \"git\", \"logarithm\", \"math\", \"right\"<br>Output: \"algorithm\", \"logarithm\", \"alright\", \"right\", \"math\", \"git\"</p>" +
            "Fyll ut pseudokode nedenfor med så lav kjøretidskompleksitet som mulig. <span class=\"et-p\">(6p)</span><p class=\"et-lbl-sm\">ALGORITHM: SORTERING AV SUBANAGRAMMER</p><div class=\"et-skel\"></div>" }
      ]
    }), {
      name: "SortSubanagrams", params: "A",
      input: "Et array A av størrelse n som inneholder strenger",
      output: "Et array med de samme n strengene sortert etter lengde der ord av samme lengde er sortert alfabetisk",
      lines: [{ code: "// Fyll ut", indent: 1 }]
    }),
    avvik: "Bare innledningen og deloppgave (d) står her, fordi (a)–(c) handler om kjøretid og hashing og har egne kort på Hashing- og Strategi-sidene.",
    demo: {
      engine: "buckets", gen: "sortSubanagrams", input: ["algorithm", "alright", "git", "logarithm", "math", "right"], inputNavn: "Eksempelet fra arket",
      presets: false, customInput: false, pseudo: "sortSubanagrams", legend: LEG_BK,
      label: "Kjør SortSubanagrams på eksempelet fra arket", del: "(d)",
      svar: function (last) { return last && last.A ? last.A.map(function (it) { return it.v; }).join(", ") : null; }
    },
    losning: losningMedKode([
      "Kjenn igjen mønsteret: data som alt er sortert på det sekundære kriteriet (alfabetisk), skal sorteres på et primært kriterium (lengde). Da trenger vi en <b>stabil</b> sortering på lengde, og lengden er et lite heltall, så bøttesortering passer.",
      "Fordel: legg hvert ord bakerst i bøtta for lengden sin. Løsningsforslaget bruker et hashmap, så bare lengder som faktisk finnes, får en bøtte.",
      "Samle: gå gjennom lengdene i <b>synkende</b> rekkefølge og skriv ordene tilbake i A. Siden vi la bakerst og tar ut forfra, står ord med lik lengde fortsatt alfabetisk. Steg-demoen i dette kortet kjører eksempelet fra arket.",
      "Kjøretid: O(N log N + n), der N er antall ulike lengder (vi sorterer de N nøklene). Siden N ≤ n, er dette aldri verre enn O(n log n), og i praksis mye bedre."
    ], "sortSubanagrams", "Løsningen i pseudokode:"),
    kjerne: "<p>To sorteringskriterier, der dataene alt er sortert på det minst viktige: sorter <b>stabilt</b> på det viktigste. Det er samme idé som i radix sort.</p>",
    tips: [
      "Lengst først: gå gjennom bøttene baklengs. Ikke snu hver bøtte, da ryker den alfabetiske rekkefølgen.",
      "Bruker du et array av bøtter i stedet for hashmap, trenger du én bøtte per lengde fra 0 til maks lengde L, altså L + 1 bøtter. Da blir kjøretiden O(N + n) med N = L + 1.",
      "En sammenligningsbasert sortering gir O(n log n), og bare hvis du velger en stabil algoritme (for eksempel merge sort), blir den alfabetiske rekkefølgen bevart."
    ]
  }; });


  // Brukes også av demoene på temasiden
  IN.kortData.felles(SIDE, { SW_PART: SW_PART, LEG_GNOME: LEG_GNOME });
})();
