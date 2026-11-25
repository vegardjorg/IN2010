/* ============================================================
   IN2010 guide · perfekt/lister.js
   «Perfekt svar» for eksamensoppgavene om lister og stakk (lastes på
   lister.html, etter data-lister.js). Format: plan/gjennomgang/wp0-format.md.
   - svar: vårt eget fullpoengssvar på kursnivå.
   - sensor: sensorveiledningen ORDRETT, med kildelinje. Ingen andre ordrette
     kilder (forelesning, ukesoppgaver, lærebok) hører hjemme her.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.PERFEKT = IN.PERFEKT || {};
  function L(code, indent) { return { code: code, indent: indent }; }

  /* ---------- H2020 · Oppgave 9 · HTML (4 + 8 poeng) ---------- */
  IN.PERFEKT["H2020-9"] = {
    type: "eksamen",
    svar: [
      {
        del: "(a)",
        tekst: "<p>Vi går gjennom taggene én gang og teller hvor mange <code>&lt;div&gt;</code> som står åpne akkurat nå, i en teller <span class=\"mono\">i</span>. " +
          "Ved <code>\"&lt;div&gt;\"</code> øker vi <span class=\"mono\">i</span>, ellers (<code>\"&lt;/div&gt;\"</code>) senker vi den.</p>" +
          "<p>To sjekker gjør svaret riktig:</p>" +
          "<ul><li><b>Underveis:</b> blir <span class=\"mono\">i</span> negativ, har vi lukket en tagg som aldri ble åpnet. Da returnerer vi false med en gang.</li>" +
          "<li><b>Til slutt:</b> taggene er velformaterte bare hvis <span class=\"mono\">i = 0</span>, altså at alt som ble åpnet, også ble lukket.</li></ul>",
        kode: "lsGoodDivs",
        etter: "<p class=\"small muted\">Eksempelfila i oppgaven har fire <code>&lt;div&gt;</code> og bare to <code>&lt;/div&gt;</code>. Telleren blir aldri negativ, men ender på 2, så GoodDivs gir <b>false</b>. Steg-demoen «(a) GoodDivs» viser nettopp dette.</p>",
        fasitVerdi: "false, i = 2",
        poeng: ["en teller som øker ved <code>&lt;div&gt;</code> og minker ved <code>&lt;/div&gt;</code>",
          "sjekken underveis: return false hvis telleren blir negativ (å glemme den trekker 2p)",
          "sjekken til slutt: return i = 0 (å glemme den trekker 1p)"]
      },
      {
        del: "(b)",
        tekst: "<p>Nå holder det ikke å telle. Vi må vite <i>hvilken</i> tagg som sist ble åpnet, for det er den neste lukketagg må passe med. Den sist åpnede skal lukkes først: det er LIFO, så vi bruker en <b>stakk</b>.</p>" +
          "<ul><li>Er taggen en åpnetagg (<span class=\"mono\">isOpen(tag)</span>), legger vi den på stakken med push.</li>" +
          "<li>Er den en lukketagg, må stakken ikke være tom, og taggen vi popper, må ha samme type: <span class=\"mono\">TagType(s.pop()) = TagType(tag)</span>. Ellers returnerer vi false.</li>" +
          "<li>Til slutt er taggene velformaterte bare hvis stakken er tom.</li></ul>" +
          "<p>Stakken gjør samme jobb som telleren i (a): høyden på stakken er telleren, og «tom stakk ved lukketagg» tilsvarer at telleren blir negativ.</p>",
        kode: "lsGoodTags",
        etter: "<p class=\"small muted\">Med <code>&lt;div&gt; &lt;p&gt; &lt;/div&gt; &lt;/p&gt;</code> ligger <code>&lt;p&gt;</code> øverst når <code>&lt;/div&gt;</code> kommer. Typene er ulike, så GoodTags gir false på plass 2. Det er eksempelet sensorveiledningen nevner, og det viser steg-demoen «(b) GoodTags».</p>",
        fasitVerdi: "false ved plass 2, p ≠ div",
        poeng: ["en stakk: push ved åpnetagg",
          "ved lukketagg: sjekk at stakken ikke er tom, og at typen på toppen er lik (det svarer til sjekken underveis i (a))",
          "til slutt: return «s er tom» (det svarer til sluttsjekken i (a))"]
      }
    ],
    hvorfor: {
      eli5: "<p>Tenk på bokser i bokser. Den siste boksen du åpnet, er den du må lukke først. I (a) er alle boksene like, så det holder å telle hvor mange som står åpne. I (b) har boksene forskjellige farger, så vi legger dem i en stabel og sjekker at fargen stemmer hver gang vi lukker.</p>",
      normal: "<p>Svaret dekker det poengene er knyttet til: en teller i (a) og en stakk i (b), en sjekk underveis (lukker vi noe som ikke er åpent, eller feil type?) og en sjekk til slutt (står noe fortsatt åpent?). Begge prosedyrene går gjennom A én gang og bruker O(1) arbeid per tagg, så de er O(n). Oppgaven spør ikke etter kjøretid, men det er greit å vite.</p>",
      teknisk: "<p>Invarianten er at stakken (i (a): telleren) holder akkurat de åpnetaggene som ennå ikke er lukket, med den sist åpnede øverst. En lukketagg er bare lov hvis den passer med toppen. Når løkka er ferdig, betyr «tom stakk» at alt som ble åpnet, også ble lukket. Med push, pop, isOpen og TagType på O(1) blir det O(n) tid og O(n) ekstra minne i (b), mens (a) klarer seg med O(1) minne fordi alle taggene har samme type.</p>"
    },
    sensor: {
      kilde: "Kilde: sensorveiledning IN2010 H2020, oppgave 9",
      deler: [
        {
          del: "(a)",
          fasit: "<p>Dette er en forholdsvis enkel oppgave, som først og fremst var ment som en oppvarming til oppgave (b). Merk at et (riktig) svar på (b) også egentlig er et riktig svar på denne oppgaven. " +
            "Den enkleste måten å gå frem på her er å løpe gjennom alle tagene og øke en teller ved \"&lt;div&gt;\" og senkes ved \"&lt;/div&gt;\". Dersom telleren på noe tidspunkt blir negativ kan vi returnere false. " +
            "Etter alle tag-ene er løpt gjennom må vi sjekke at telleren er 0.</p>",
          kode: { name: "GoodDivs", params: "A", lines: [
            L("i ← 0", 1), L("for tag in A do", 1), L("if tag = \"<div>\" then", 2), L("i ← i + 1", 3), L("else", 2), L("i ← i − 1", 3),
            L("if i < 0 then", 2), L("return false", 3), L("return i = 0", 1)] },
          kriterier: "<p>Veiledende poengfordeling:</p>" +
            "<ul><li>Totalt 1 poeng for løsninger som sjekker direkte at antall &lt;div&gt; == antall &lt;/div&gt;</li>" +
            "<li>Totalt 1 poeng for løsninger som sjekker at alle &lt;div&gt; etterfølges av en &lt;/div&gt; direkte</li>" +
            "<li>Minus 2 poeng for å glemme å sjekke om antall &lt;/div&gt; noen gang overstiger antall &lt;div&gt;</li>" +
            "<li>Minus 1 poeng for å glemme å sjekke om vi ender opp med likt til slutt</li></ul>"
        },
        {
          del: "(b)",
          fasit: "<p>Oppgaveteksten åpner for at [\"&lt;div&gt;\", \"&lt;p&gt;\", \"&lt;/div&gt;\", \"&lt;/p&gt;\"] teller som velformatert. Dette var ikke intensjonen. Løsninger som teller dette som velformatert vil også kunne gi full uttelling. " +
            "Det kan enkelt gjøres ved å ha et map fra tag-type til en teller, som brukes på samme måte som forrige deloppgave. " +
            "Løsningen som følger intensjonen (som faktisk vil validere balanserte HTML-filer) kan se slik ut:</p>",
          kode: { name: "GoodDivs", params: "A", lines: [
            L("s ← empty stack", 1), L("for tag ∈ A do", 1), L("if isOpen(tag) then", 2), L("s.push(tag)", 3), L("continue", 3),
            L("if s is empty or TagType(s.pop()) ≠ TagType(tag) then", 2), L("return false", 3), L("return s is empty", 1)] },
          kriterier: "<p>Her vektes poeng og trekk vanligvis på samme måte som i (a).</p>"
        }
      ],
      merknad: "I (b) heter prosedyren GoodDivs i sensorveiledningen, men det er GoodTags fra oppgaven som menes. Sensor bruker <span class=\"mono\">continue</span> etter push. I vårt svar står lukketagg-sjekken i en <span class=\"mono\">else if</span> i stedet, og det gjør det samme. " +
        "I (a) står sjekken <span class=\"mono\">if i &lt; 0</span> hos sensor etter if/else, mens vår står inne i else-grenen. Det gir samme svar, fordi i bare kan bli negativ rett etter at den er senket."
    }
  };
})();
