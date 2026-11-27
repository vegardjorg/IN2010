/* ============================================================
   IN2010 guide · kort/lister.js
   Eksamenskortene for Lister (lister.html): én definisjon per kort, lest av temasiden og crash.html.
   Oppgavetekstene står ordrett med kildelinje (som før). Fullpoengssvar og sensorveiledning
   ligger i perfekt/lister.js (og perfekt/delt.js for oppgaver som deles med andre sider).
   Lastes etter perfekt/*.js. Se IN.kortData i core.js.
   ============================================================ */
(function () {
  "use strict";
  var IN = window.IN, qs = IN.qs, LS = IN.ls;
  var SIDE = "lister";
  function def(key, meta, fn) { meta.side = SIDE; return IN.kortData.def(key, meta, fn); }

  var LEGEND = [
    { cls: "compare", label: "Ser på nå" },
    { cls: "min", label: "Skrevet / flyttet / ny" },
    { cls: "sorted", label: "I bruk" },
    { cls: "target", label: "Funnet / endret peker" },
    { cls: "swap", label: "Tømt / feil" }
  ];
  function tags(s) { return LS.parseTags(s); }
  /* ---------- Eksamen: H2020 9, ordrett oppgavetekst med kildelinje.
     Perfekt svar og sensorveiledningen står i assets/js/perfekt/lister.js. ---------- */
  var HTML_FIL = "&lt;div&gt;\n  &lt;div&gt;\n    Velkommen til nettsiden vår!\n  &lt;div&gt;\n   Se våre nyeste saker!\n    &lt;div&gt;\n    Vi har ansatt en ung person! Kanskje blir nettsiden oppdatert nå?\n    FØLG MED PÅ UTVIKLINGEN. Hilsen Kåre.\n    &lt;/div&gt;\n&lt;/div&gt;";
  function h20Oppg() {
  var o = IN.oppg({
    intro: "<p>Du har tatt på deg en jobb hos en bedrift som har en eldre nettside skrevet i ren HTML. Nylig har de fått nyss om at nettsiden fungerer svært dårlig, og de (som har lite intern kompetanse på slikt) har gitt opp og håper at den unge lovende informatikeren skal finne ut av hva i all verden som foregår. " +
        "Nettsiden består av flere tusen håndskrevne HTML-sider; all snakk om å «lage noe nytt og fresht» blir møtt med spørrende blikk.</p>" +
      "<p>Det tar ikke spesielt lang tid før du finner en feil som gjentar seg i mange av sidene det er rapportert feil på. Mange av de håndskrevne HTML-filene er feilformaterte! " +
        "Du merker deg at det mange steder åpnes en &lt;div&gt;-tag, som aldri lukkes med en &lt;/div&gt;. Andre steder lukkes det en &lt;/div&gt;-tag, der den aldri har blitt åpnet.</p>" +
      "<p>Her er et eksempel på en feilformatert HTML-fil:</p>" +
      "<pre class=\"ls-htmlfil\" aria-label=\"Eksempel på en feilformatert HTML-fil\">" + HTML_FIL + "</pre>",
    parts: [
      { t: "<p>Du innser at det første du må gjøre er å finne alle filene som inneholder feil. Etter litt Unix-magi sitter du igjen med filer der all tekst bortsett fra &lt;div&gt; og &lt;/div&gt; er fjernet. Alt går på skinner frem til du må løse en liten nøtt:</p>" +
          "<p><i>Hvordan sjekker man at det for hver tag som åpnes med &lt;div&gt; også lukkes med &lt;/div&gt;, og at ingen tag lukkes før den er åpnet?</i></p>" +
          "<p>Du må skrive en prosedyre GoodDivs som sjekker dette, med andre ord, at &lt;div&gt;-tagene er velformaterte. Den tar et array A som argument, der hvert element enten er strengen \"&lt;div&gt;\" eller strengen \"&lt;/div&gt;\". <span class=\"et-p\">(4p)</span></p>" +
          "<p class=\"small\"><b>ALGORITHM: AVGJØRE OM &lt;div&gt;-TAGENE ER VELFORMATERTE</b></p><div class=\"et-skel ls-skel-a\"></div>" },
      { t: "<p>GoodDivs fungerer som den skal og finner mange filer som inneholder feilformatert HTML. Dessverre oppdager den ikke alle filene det er rapportert feil på. Du observerer at de inneholder samme feil, men med andre type tag-er! " +
          "Altså er det ikke bare &lt;div&gt;-tagene som fører til problemer, men også andre tag-er som &lt;head&gt;, &lt;body&gt;, &lt;p&gt; og flere andre. Du finner ut at prosedyren GoodDivs må generaliseres til en prosedyre GoodTags.</p>" +
          "<p><i>Hvordan sjekker man at det for hver tag som åpnes også lukkes med en tag av samme type, og at ingen tag lukkes før den er åpnet?</i></p>" +
          "<p>Du har allerede en enkel prosedyre isOpen, som tar en streng og returnerer true hvis det er en åpne-tag og false hvis det er en lukke-tag. Altså vil isOpen(\"&lt;tag&gt;\") returnere true og isOpen(\"&lt;/tag&gt;\") returnere false. " +
          "I tillegg har du en prosedyre som gir deg hvilken type en tag har; for eksempel vil TagType(\"&lt;div&gt;\") gi \"div\", og TagType(\"&lt;/p&gt;\") gir \"p\". <span class=\"et-p\">(8p)</span></p>" +
          "<p class=\"small\"><b>ALGORITHM: AVGJØRE OM TAG-ENE ER VELFORMATERTE</b></p><div class=\"et-skel ls-skel-b\"></div>" +
          "<p>Hint: Her kan et lurt valg av datastruktur være til stor hjelp.</p>" }
    ]
  });
  IN.pseudo.render(qs(".ls-skel-a", o), {
    name: "GoodDivs", params: "A",
    input: "Et array med \"<div>\" og \"</div>\" av lengde n",
    output: "Returner true hvis tag-ene er velformaterte, false ellers",
    lines: [{ code: "// Fyll ut", indent: 1 }]
  }, { tooltips: false });
  IN.pseudo.render(qs(".ls-skel-b", o), {
    name: "GoodTags", params: "A",
    input: "Et array A med tag-er av lengde n",
    output: "Returner true hvis tag-ene er velformaterte, false ellers",
    lines: [{ code: "// Fyll ut", indent: 1 }]
  }, { tooltips: false });
  return o;
  }
  // Taggene fra eksempelfila (all tekst fjernet, som i (a)), og kryssingseksempelet fra sensorveiledningen til (b)
  var H20_FIL = tags("<div> <div> <div> <div> </div> </div>");
  var H20_KRYSS = tags("<div> <p> </div> </p>");
  def("H2020-9", { host: "#exam-h2020-9" }, function () { return {
    key: "H2020-9", year: "H2020", oppgave_nr: "Oppgave 9", title: "Velformaterte tagger", points: 12,
    ark: "HTML", ordrett: true,
    oppgave: h20Oppg(),
    avvik: [
      "Arket viser bare «poeng» i overskriften, uten total. De 12 poengene her er summen av deloppgavene (4 + 8), som arket oppgir.",
      "Skjelettene med «// Fyll ut» er satt med guidens pseudokodestil. Tittel, Input, Output og prosedyrenavn er de samme som på arket.",
      "Eksempelfila er satt med samme innrykk som på arket, men i guidens skrift.",
      "Steg-demoene bruker taggene fra eksempelfila i (a) og kryssingseksempelet fra sensorveiledningen i (b). Oppgaven selv gir ingen input å kjøre."
    ],
    demo: [
      { tab: "(a) GoodDivs", engine: "list", gen: "lsDivs", input: H20_FIL, inputNavn: "Taggene i eksempelfila",
        presets: { "Nøstet, riktig": tags("<div> <div> </div> <div> </div> </div>"), "Lukker for tidlig": tags("<div> </div> </div> <div>") },
        pseudo: "lsGoodDivs", legend: LEGEND, parseInput: function (s) { return LS.parseTags(s, true); }, inputLabel: "f.eks. div div /div /div",
        label: "Kjør GoodDivs på taggene i eksempelfila", del: "(a)" },
      { tab: "(b) GoodTags", engine: "list", gen: "lsTags", input: H20_KRYSS, inputNavn: "Kryssende tagger (sensorveiledningen)",
        presets: { "Riktig nøstet": tags("<html> <div> <p> </p> </div> <p> </p> </html>"), "Lukker uten å åpne": tags("<p> </p> </div>"), "Ikke lukket": tags("<div> <p> </p>") },
        pseudo: "lsGoodTags", legend: LEGEND, parseInput: function (s) { return LS.parseTags(s); }, inputLabel: "f.eks. div p /p /div",
        label: "Kjør GoodTags på kryssende tagger", del: "(b)" }
    ],
    losning: [
      "<b>(a)</b> Tell hvor mange div-er som står åpne. Øk telleren ved <code>&lt;div&gt;</code> og senk den ved <code>&lt;/div&gt;</code>. " +
        "Blir telleren negativ underveis, har vi lukket noe som ikke var åpent: returner false. Til slutt er taggene velformaterte bare hvis telleren er 0. " +
        "Eksempelfila gir false: fire åpnes og bare to lukkes, så telleren ender på 2. Se demoen «(a) GoodDivs» i dette kortet.",
      "<b>(b)</b> Med flere typer holder ikke én felles teller: da ville <code>&lt;div&gt;&lt;/p&gt;</code> sluppet gjennom. Vi må huske <i>hvilke</i> tagger som står åpne, og den sist åpnede må lukkes først. " +
        "Det er en <b>stakk</b>: push hver åpnetagg. Ved en lukketagg må stakken ikke være tom, og toppen må ha samme type (vi popper og sammenligner med TagType). Til slutt må stakken være tom. " +
        "Se demoen «(b) GoodTags», der <code>&lt;div&gt; &lt;p&gt; &lt;/div&gt; &lt;/p&gt;</code> gir false."
    ],
    kjerne: "<p>Den sist åpnede taggen må lukkes først: det er LIFO, altså en stakk. Telleren i (a) er egentlig en stakk der bare høyden betyr noe, fordi alle taggene er av samme type.</p>",
    tips: [
      "Sensorveiledningen gir totalt 1 poeng for bare å sjekke at det er like mange <code>&lt;div&gt;</code> som <code>&lt;/div&gt;</code>, og det samme for bare å sjekke at hver <code>&lt;div&gt;</code> følges rett etter av en <code>&lt;/div&gt;</code>.",
      "Den trekker 2 poeng for å glemme sjekken underveis og 1 poeng for å glemme sjekken til slutt. (b) vektes vanligvis på samme måte.",
      "Oppgaveteksten åpner for at kryssende tagger regnes som velformaterte, og sensorveiledningen sier at en løsning med en teller per taggtype også kan gi full uttelling. Stakken er den tiltenkte løsningen, og den vi anbefaler.",
      "Oppgaven spør ikke etter kjøretid. Vil du likevel nevne den, er begge O(n): én gjennomgang med O(1) arbeid per tagg."
    ]
  }; });

  // Brukes også av demoene på temasiden
  IN.kortData.felles(SIDE, { LEGEND: LEGEND, tags: tags });
})();
