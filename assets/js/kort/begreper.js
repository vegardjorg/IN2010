/* ============================================================
   IN2010 guide · kort/begreper.js
   Eksamenskortene for Begreper (00-begreper.html): én definisjon per kort, lest av temasiden og crash.html.
   Oppgavetekstene står ordrett med kildelinje (som før). Fullpoengssvar og sensorveiledning
   ligger i perfekt/begreper.js (og perfekt/delt.js for oppgaver som deles med andre sider).
   Lastes etter perfekt/*.js. Se IN.kortData i core.js.
   ============================================================ */
(function () {
  var IN = window.IN;
  var SIDE = "begreper";
  function def(key, meta, fn) { meta.side = SIDE; return IN.kortData.def(key, meta, fn); }

  /* ---- Eksamen: oppvarmingen (oppgave 1, lik H2020–H2025), ordrett med kildelinje.
     Vårt svar og sensorveiledningen står i assets/js/perfekt/begreper.js. ---- */
  def("H2025-1", { host: "#exam-oppvarming" }, function () { return {
    key: "H2025-1", year: "H2025", oppgave_nr: "Oppgave 1", title: "Algoritme og datastruktur", points: 2,
    kilde: "Oppgavetekst: UiO, IN2010, H2020–H2025, oppgave 1 (samme tekst alle år)",
    ark: "Oppvarming", ordrett: true,
    oppgave: IN.oppg({
      parts: [
        { t: "Hva er en algoritme? Svar kort (maks fire setninger)." },
        { t: "Hva er en datastruktur? Svar kort (maks fire setninger)." }
      ],
      outro: "<p>Vi er ikke ute etter et «fasitsvar». Vi er ute etter å høre din forståelse av begrepene, og alle rimelige svar gir full uttelling.</p>"
    }),
    avvik: "Arket gir 2 poeng for hele oppgaven og fordeler dem ikke på (a) og (b). Derfor står det ingen poeng ved deloppgavene.",
    losning: [
      "<b>(a)</b> Få med at en algoritme er en presis og entydig oppskrift med endelig mange steg, som løser et problem: fra input til riktig output. Et eksempel, som binærsøk, viser at du kan bruke begrepet.",
      "<b>(b)</b> Få med at en datastruktur er en måte å organisere data på, og at vi velger den etter hvilke operasjoner som skal gå fort. Et eksempel: en heap gir raskt det minste elementet."
    ],
    kjerne: "<p>Algoritmen er <i>hva vi gjør</i>, datastrukturen er <i>hvordan dataene ligger</i>. Et godt valg av datastruktur gjør algoritmen raskere.</p>",
    tips: [
      "Hold deg til fire setninger per deloppgave. Det er det oppgaven ber om.",
      "Ifølge sensorveiledningen gir alle rimelige svar full uttelling. Du mister poeng hvis du lar oppgaven stå tom, skriver noe som er direkte feil, eller har vesentlige feil i deler av svaret.",
      "Bland ikke datastruktur og ADT: ADT-en sier hvilke operasjoner som finnes, datastrukturen hvordan de lages. Se fanen ADT."
    ]
  }; });
})();
