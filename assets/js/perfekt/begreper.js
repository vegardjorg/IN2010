/* ============================================================
   IN2010 guide · perfekt/begreper.js
   «Perfekt svar» for oppvarmingsoppgaven (algoritme og datastruktur), som
   står likt på eksamen H2020–H2025. Lastes på 00-begreper.html.
   Format: plan/gjennomgang/wp0-format.md.
   - svar: vårt eget forslag til fullpoengssvar på kursnivå.
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette
     kilder (forelesning, ukesoppgaver, lærebok) hører hjemme her.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.PERFEKT = IN.PERFEKT || {};

  /* ---------- Oppvarming · Oppgave 1 (2 poeng), lik H2020–H2025 ---------- */
  IN.PERFEKT["H2025-1"] = {
    type: "skjonn",
    svar: [
      {
        del: "(a)",
        tekst: "<p>«En algoritme er en presis og entydig oppskrift, med endelig mange steg, som løser et bestemt problem. Den tar et input og gir et output, og følger vi stegene, får vi riktig svar etter endelig tid. " +
          "Et eksempel er binærsøk, som finner et tall i et sortert array.»</p>",
        poeng: ["at den er presis og entydig", "at den består av steg og tar slutt", "at den løser et problem (input til output)"]
      },
      {
        del: "(b)",
        tekst: "<p>«En datastruktur er en måte å organisere og lagre data på, slik at operasjonene vi trenger oftest, blir effektive. " +
          "For eksempel gir en heap rask tilgang til det minste elementet, og et hashmap gir raske oppslag på nøkkel.»</p>",
        poeng: ["organisering av data", "at valget henger sammen med hvilke operasjoner som skal gå fort"]
      }
    ],
    hvorfor: {
      eli5: "<p>Her finnes det ikke ett riktig svar. Sensor vil bare se at du skjønner hva ordene betyr: en algoritme er en oppskrift som alltid virker, og en datastruktur er en smart måte å rydde tingene sine på, så du finner dem fort.</p>",
      normal: "<p>Begge svarene er korte, holder seg innenfor fire setninger og har et eksempel. Algoritmesvaret får med at stegene er presise, at de tar slutt, og at de løser et problem. Datastruktursvaret knytter organiseringen til hvilke operasjoner som skal være effektive. Det er nok, fordi alle rimelige svar gir full uttelling.</p>",
      teknisk: "<p>Ifølge sensorveiledningen mister du poeng hvis du lar oppgaven stå tom, skriver noe som er direkte feil, eller har vesentlige feil i deler av svaret. Vårt råd er derfor å unngå å blande begrepene, for eksempel å skrive at en algoritme «er et program i et bestemt språk», eller at en datastruktur «er det samme som en ADT». Algoritmen er idéen bak programmet, og en ADT sier hvilke operasjoner som finnes, mens datastrukturen sier hvordan de lages. Et eksempel i hvert svar viser at du kan bruke begrepet, ikke bare gjengi det.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010, oppvarmingsoppgaven (samme tekst H2020–H2025)",
      deler: [
        {
          kriterier: "<p>Her finnes det utrolig mange riktige svar! Vi er ikke ute etter en formell definisjon (selv om det selvfølgelig vil være poenggivende), men vil bare få studentene i gang med å tenke på algoritmer og datastrukturer. " +
            "Her er mitt svar (som på ingen måte bør være førende for hvordan vi tildeler poeng):</p>" +
            "<ul><li>Algoritmer er idéene bak de programmene vi skriver. De angir hva som må gjøres for å løse et gitt problem på en presis og entydig måte. Følger du en algoritme for å løse et problem så skal du også få riktig svar til slutt, og helst på rimelig tid.</li>" +
            "<li>Datastrukturer er måter å organisere data på. Stort sett vil vi organisere dataene etter hva vi oftest ønsker å gripe tak i, slik at vi kan få mer effektive algoritmer.</li></ul>" +
            "<p>Vi gir full uttelling for alle rimelige svar. For å ikke få full uttelling må man enten la oppgaven stå ubesvart, eller skrive noe som er direkte feil. Det kan trekkes poeng dersom deler av svaret inneholder vesentlige feil.</p>"
        }
      ]
    }
  };
})();
