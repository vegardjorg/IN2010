/* ============================================================
   IN2010 guide · kort/traer.js
   Eksamenskortene for Trær (04-traer.html): én definisjon per kort, lest av temasiden og crash.html.
   Oppgavetekstene står ordrett med kildelinje (som før). Fullpoengssvar og sensorveiledning
   ligger i perfekt/traer.js (og perfekt/delt.js for oppgaver som deles med andre sider).
   Lastes etter perfekt/*.js. Se IN.kortData i core.js.
   ============================================================ */
(function () {
  "use strict";
  var IN = window.IN, qs = IN.qs, qsa = IN.qsa, el = IN.el, A = IN.algos, G = IN.gen, TR = IN.traer;
  var vizTree = IN.vizTree;
  var SIDE = "traer";
  function def(key, meta, fn) { meta.side = SIDE; return IN.kortData.def(key, meta, fn); }

  var PATHC = "color-mix(in srgb, var(--c-target) 22%, transparent);border:3px solid var(--c-target)";
  var ALTC = "transparent;border:3px dashed var(--color-on-surface)";
  var LEG_LCA = [{ cls: "compare", label: "u (klatrer)" }, { color: ALTC, label: "v (den andre noden)" }, { color: PATHC, label: "Sti de har klatret" }, { cls: "target", label: "LCA (svaret)" }];
  var LEG_LCABST = [{ cls: "compare", label: "Gjeldende node" }, { color: ALTC, label: "Søker etter (x, y)" }, { color: PATHC, label: "Sti" }, { cls: "target", label: "LCA (svaret)" }];
  var LEG_AVL = [{ cls: "compare", label: "Gjeldende node" }, { color: PATHC, label: "Sti / kall i gang" }, { cls: "min", label: "Ny node" }, { cls: "swap", label: "Roteres / ubalansert" }, { cls: "sorted", label: "Ferdig" }];
  var LEG_DIAM = [{ cls: "compare", label: "Kallet som regner nå" }, { color: PATHC, label: "Har en ramme på kallstakken" }, { cls: "min", label: "Lengste sti så langt (kanter)" }, { cls: "sorted", label: "Ferdig (h, d)" }, { cls: "target", label: "Roten (svaret)" }];
  var BST7 = [50, 30, 70, 20, 40, 60, 80];

  /* ===================== EKSAMEN (ordrett fra eksamensarkene, med kildelinje) ===================== */
  // Løsning som DOM-node: nummerert liste + pseudokode rendret med IN.pseudo (BYGGEGUIDE 5.4)
  // Punktene merkes (a), (b), … som deloppgavene. o.intro: innledende avsnitt, o.figs: figurer (IN.oppg).
  function sol(items, algos, o) {
    o = o || {};
    var d = el("div");
    if (o.intro) d.appendChild(el("p", { html: o.intro }));
    var ol = el(o.plain ? "ul" : "ol", o.plain ? {} : { class: "et-parts" }); items.forEach(function (x) { ol.appendChild(el("li", { html: x })); }); d.appendChild(ol);
    if (o.figs) d.appendChild(IN.oppg({ figs: o.figs }));
    (algos || []).forEach(function (key) {
      d.appendChild(el("h5", { style: "margin:.8rem 0 .3rem", text: "Pseudokode: " + A[key].name }));
      var h = el("div"); d.appendChild(h); IN.pseudo.render(h, A[key], {});
    });
    return d;
  }
  // Figur til IN.oppg: et tre (binært fra fromNested eller generelt fra genFrom), med valgfrie marks/sup/lab
  function treFig(tree, cap, extra) {
    return { cap: cap, draw: function (h) {
      var s = { tree: tree }; for (var k in (extra || {})) s[k] = extra[k];
      vizTree(h, s, { ariaLabel: (cap ? cap.replace(/<[^>]+>/g, "") + ": " : "") + "tre" });
      fastSkala(h, 0.95);
    } };
  }
  // Fast målestokk: små trær skal ikke blåses opp til full bredde
  function fastSkala(h, f) {
    var svg = h.querySelector("svg"), vb = svg && svg.getAttribute("viewBox");
    if (vb) { svg.style.width = Math.round(+vb.split(" ")[2] * f) + "px"; svg.style.maxWidth = "100%"; }
  }
  // H2025: ConstructBST, ordrett fra eksamensarket (oppgave 5 (d))
  var CONSTRUCTBST = { name: "ConstructBST", params: "v", input: "Roten v av et binært søketre", output: "Et nytt binært søketre", lines: [
    { code: "B ← empty binary search tree", indent: 1 },
    { code: "nodes ← LevelOrderBST(v)", indent: 1 },
    { code: "for u in nodes do", indent: 1 },
    { code: "B ← Insert(B, u)", indent: 2 },
    { code: "return B", indent: 1 }] };
  function pcFig(algo, head) { return { cls: "code", draw: function (h) { IN.pseudo.render(h, algo, { head: !!head, tooltips: false }); } }; }
  // Tomt prosedyreskjelett som på arket (Input/Output + «// · · ·»), rendret i .et-skel nr. i i oppgaveteksten
  function skel(node, specs) {
    var hosts = qsa(".et-skel", node);
    specs.forEach(function (sp, i) {
      if (!hosts[i]) return;
      IN.pseudo.render(hosts[i], { name: sp.name, params: sp.params, input: sp.input, output: sp.output, lines: [{ code: "// · · ·", indent: 1 }] }, { tooltips: false });
    });
    return node;
  }
  var SKEL = '<div class="et-skel"></div>';
  function demoLink(fane, demo, txt) { return '<p class="small muted">Prøv selv: <a href="#fane=' + fane + "&amp;oppg=" + demo + '">' + txt + "</a>.</p>"; }
  function freqTab(pairs) {
    return '<table class="et-tab"><tr><th>Tegn</th>' + pairs.map(function (p) { return "<td><b>" + p[0] + "</b></td>"; }).join("") +
      "</tr><tr><th>Frekvens</th>" + pairs.map(function (p) { return "<td>" + p[1] + "</td>"; }).join("") + "</tr></table>";
  }
  // Prefikstre (trie) som generelt tre; terminalnoder markeres. Unike id-er, siden bokstavene gjentas.
  function trie(words) {
    var n = 0, root = { id: "t0", k: "root", ch: [] }, ends = [];
    words.forEach(function (w) {
      var v = root;
      for (var i = 0; i < w.length; i++) {
        var c = null; v.ch.forEach(function (u) { if (u.k === w[i]) c = u; });
        if (!c) { c = { id: "t" + (++n), k: w[i], ch: [] }; v.ch.push(c); }
        v = c;
      }
      ends.push(v.id);
    });
    return { tree: root, ends: ends };
  }
  var AVVIK_PLASS = "Figurene står over eller under teksten, ikke ved siden av, fordi siden også skal fungere på en smal mobilskjerm. Der arket sier «til høyre» eller «ved siden av», menes figuren som hører til.";
  var LEG_RANGE = [{ cls: "compare", label: "Kallet som jobber nå (v)" }, { color: PATHC, label: "Har en ramme på kallstakken" }, { cls: "sorted", label: "Skrevet ut" },
    { color: "transparent;border:2px dashed var(--color-on-surface);opacity:.45", label: "Hoppes over (ingen treff mulig)" }];
  var LEG_CHK = [{ cls: "compare", label: "Kallet som jobber nå (v)" }, { color: PATHC, label: "Har en ramme på kallstakken" }, { cls: "sorted", label: "Subtreet er sjekket og i orden" },
    { cls: "swap", label: "Ligger utenfor grensene (low, high)" }, { cls: "target", label: "Roten: svaret er true" }];
  var LEG_HUFF = [{ cls: "compare", label: "v1 (minst)" }, { color: ALTC, label: "v2 (nest minst)" }, { cls: "min", label: "Ny intern node" }, { cls: "sorted", label: "Ferdig tre" }];
  var AVL6 = [[4, [2, [1], [3]], [5]], [2, [1], [4, [3], [5]]], [3, [2, [1], null], [5, [4], null]],
              [3, [1, null, [2]], [4, null, [5]]], [3, [2, [1], null], [4, null, [5]]], [3, [1, null, [2]], [5, [4], null]]];
  function formSig(v) { return v ? "(" + formSig(v.l) + v.k + formSig(v.r) + ")" : ""; }
  var AVL6SIG = AVL6.map(function (n) { return formSig(TR.fromNested(n)); });
  var HASHTAB = [['""', '"bin", ..., "sleepy"'], ['"b"', '"bin", "binary", "bind"'], ['"bi"', '"bin", "binary", "bind"'], ['"bin"', '"bin", "binary", "bind"'],
    ['"bina"', '"binary"'], ['"binar"', '"binary"'], ['"binary"', '"binary"'], ['"bind"', '"bind"'], ['"h"', '"head", ... "help"'], ['"he"', '"head", ... "help"'],
    ['"hea"', '"head", "headache"'], ['"head"', '"head", "headache"'], ['"heada"', '"headache"'], ['"headac"', '"headache"'], ['"headach"', '"headache"'],
    ['"headache"', '"headache"'], ['"hel"', '"hello", "help"'], ['"hell"', '"hello"'], ['"hello"', '"hello"'], ['"help"', '"help"'],
    ['"s"', '"slack", "sleep", "sleepy"'], ['"sl"', '"slack", "sleep", "sleepy"'], ['"sla"', '"slack"'], ['"slac"', '"slack"'], ['"slack"', '"slack"'],
    ['"sle"', '"sleep", "sleepy"'], ['"slee"', '"sleep", "sleepy"'], ['"sleep"', '"sleep", "sleepy"'], ['"sleepy"', '"sleepy"']];

    def("H2020-2", { host: "#exam-h2020-2" }, function () { return { key: "H2020-2", year: "H2020", title: "Binære søketrær", oppgave_nr: "Oppgave 2", points: 4,
      kilde: "Oppgavetekst: UiO, IN2010, H2020 2", ark: "Binære søketrær", ordrett: true,
      oppgave: IN.oppg({
        figs: [treFig(TR.genFrom(["A", ["B", ["E"], ["F"]], ["C"], ["D", ["G"], ["H"]]]), "Treet til (a)"),
               treFig(TR.fromNested([4, [2, [5], [3]], [6, null, [8]]]), "Treet til (b)")],
        parts: [{ t: "Treet til høyre er ikke et binærtre. Hvilken node må fjernes for at det skal bli et binærtre?", p: 1 },
          { t: "Treet til høyre er ikke et binært søketre. Hvilken node må fjernes for at treet skal bli et binært søketre?", p: 1 },
          { t: "Er hvert binært søketre et AVL tre?", p: 1 }, { t: "Er hvert AVL tre et binært søketre?", p: 1 }]
      }),
      avvik: [AVVIK_PLASS + " Her står treet til (a) først og treet til (b) etter.", "Trærne er tegnet på nytt med guidens tretegning, fordi arket bare har dem som bilde. Nodene og plasseringen er de samme."],
      losning: sol(["<b>C</b>. Roten har tre barn, men et binærtre tillater høyst to. C er en løvnode, så den kan fjernes uten å miste andre noder.",
        "<b>5</b>. Den står som venstre barn av 2, men er større enn både 2 og 4. Fjernes den, oppfyller resten søketre-egenskapen.",
        "<b>Nei.</b> En skjev kjede (f.eks. 1, 2, 3 satt inn sortert) er et søketre, men roten har balansefaktor −2.",
        "<b>Ja.</b> Et AVL-tre er et binært søketre med et ekstra balansekrav."]),
      kjerne: "<p>Søketre-egenskapen gjelder <b>hele subtrær</b>. AVL er et strengere krav oppå BST.</p>",
      tips: ["Skriv gjerne én setning som begrunnelse. Det viser at du forstår, og ikke bare har gjettet riktig bokstav."]
    }; });

    def("H2021-8", { host: "#exam-h2021-8" }, function () { return { key: "H2021-8", year: "H2021", title: "Verdier i et intervall (InRange)", oppgave_nr: "Oppgave 8", points: 10,
      kilde: "Oppgavetekst: UiO, IN2010, H2021 8", ark: "Intervall i et binært søketre", ordrett: true,
      oppgave: skel(IN.oppg({
        intro: "<p>Du er gitt et binært søketre B og to heltall a og b der a ≤ b. Du skal gi en algoritme som skriver ut verdiene innenfor intervallet [a, b] i sortert rekkefølge (fra minst til størst). Det vil si at hvis x er verdien i en node, så skal denne noden skrives ut hvis og bare hvis a ≤ x ≤ b.</p>" + SKEL,
        figs: [treFig(TR.fromNested([10, [5, [2], [7]], [15, [12], [17]]]), "B₁")],
        parts: [{ note: "For det binære søketreet B₁ (vist i eksempelet ovenfor) skal for eksempel InRange(B₁, 2, 7) skrive ut 2, 5 og 7, og InRange(B₁, 10, 20) skrive ut 10, 12, 15 og 17." },
          { t: "Oppgi algoritmen din (med psuedokode). Du kan gjøre rimelige antagelser om representasjonen av B. En mer effektiv algoritme er mer poenggivende. Du trenger ikke tenke på formateringen på utskriften." },
          { note: "I de neste deloppgavene skal du anta at B har n noder, er balansert og ikke inneholder noen duplikater." },
          { t: "Anta at a er den minste verdien i B og b er den største verdien i B. Oppgi kjøretidskompleksiteten på algoritmen din med hensyn til n." },
          { t: "Anta at a = b. Oppgi kjøretidskompleksiteten på algoritmen din med hensyn til n." }]
      }), [{ name: "InRange", params: "B, a, b", input: "Et binært søketre B og to heltall a og b der a ≤ b", output: "Skriver ut verdiene innenfor intervallet [a, b] i sortert rekkefølge" }]),
      avvik: ["B₁ står under prosedyreskjelettet, ikke ved siden av, fordi siden også skal fungere på en smal mobilskjerm.", "Arket fordeler ikke de 10 poengene på deloppgavene, og det gjør heller ikke sensorveiledningen. Derfor står det ingen poeng ved deloppgavene."],
      demo: { engine: "tree", gen: "inRange", input: [{ tree: [10, [5, [2], [7]], [15, [12], [17]]], a: 2, b: 7 }], inputNavn: "InRange(B₁, 2, 7)",
        presets: { "InRange(B₁, 10, 20)": [{ tree: [10, [5, [2], [7]], [15, [12], [17]]], a: 10, b: 20 }], "a = b = 12": [{ tree: [10, [5, [2], [7]], [15, [12], [17]]], a: 12, b: 12 }] },
        pseudo: "inRange", legend: LEG_RANGE, label: "Kjør InRange(B₁, 2, 7)", del: "(a)", fasit: "2, 5, 7" },
      losning: sol(["Inorder gir stigende rekkefølge. Legg til <b>beskjæring</b>: gå til venstre bare hvis a &lt; v.element, skriv ut hvis a ≤ v.element ≤ b, og gå til høyre bare hvis v.element &lt; b. Kjøretiden er O(h + k), der k er antall treff, altså O(log n + k) i et balansert tre.",
        "Alle n verdier skal skrives ut, så O(n).", "Bare én sti fra roten: O(log n) i et balansert tre."], ["inRange"]),
      kjerne: "<p>InRange = inorder + beskjæring. Uten beskjæring er løsningen O(n) uansett intervall.</p>",
      tips: ["Sensorveiledningen gir full uttelling bare for en løsning som er O(log n) når a = b. En O(n)-løsning kan få opp til 8 poeng, O(n log n) opp til 5 og O(n²) opp til 2.", "Tips: oppgi kjøretiden med k (antall treff). Det viser at du har forstått hvorfor beskjæringen hjelper."]
    }; });

    def("H2022-11", { host: "#exam-h2022-10" }, function () { return { key: "H2022-11", year: "H2022", title: "Er treet et søketre? (CheckBST)", oppgave_nr: "Oppgave 11", points: 10,
      kilde: "Oppgavetekst: UiO, IN2010, H2022 11", ark: "Er binærtreet et søketre?", ordrett: true, poengkilde: "sv",
      oppgave: skel(IN.oppg({
        intro: "<p>Anta at du er gitt et binærtre B med unike heltall. Hvis v er en node i det binære treet, så gir</p><ul><li><code>v.element</code> heltallet som er lagret i noden</li><li><code>v.left</code> venstre barn av v</li><li><code>v.right</code> høyre barn av v</li></ul>" +
          "<p>Vi ønsker å sjekke om det binære treet også er et binært søketre. Under finner du spesifikasjonen for algoritmen, og to eksempler på trær som henholdsvis bør gi true og false.</p>" + SKEL,
        figs: [treFig(TR.fromNested([5, [2, [1], [4]], [7, [6], null]]), "true"), treFig(TR.fromNested([5, [2, [1], [9]], [7, [6], null]]), "false")],
        parts: [{ note: "Det finnes flere gode løsninger på dette problemet. Følgende kan være behjelpelig når du tenker på en løsning:<ul><li>Du kan anta at du har prosedyrer FindMin og FindMax som henholdsvis finner minste og største tall i det binære treet. Siden treet ikke er garantert å være et binært søketre (eller balansert) så vil disse prosedyrene ha lineær tid.</li><li>Det kan være lurt å dele algoritmen opp ved å lage en hjelpeprosedyre.</li></ul>" },
          { t: "Skriv ned egenskapen et binærtre må ha for å kunne kalles et binært søketre.", p: 2 },
          { t: "Fullfør prosedyren over. Lavere kjøretidskompleksitet er mer poenggivende.", p: "inntil 6" },
          { t: "Oppgi kjøretidskompleksiteten på algoritmen din med hensyn til antall noder i binærtreet.", p: 2 }]
      }), [{ name: "CheckBST", params: "v", input: "Rotnoden v av et binærtre B", output: "Returnerer true hvis binærtreet er et binært søketre, false ellers" }]),
      avvik: ["Arket viser de to eksempeltrærne ved siden av spesifikasjonen. Her står de under, fordi siden også skal fungere på en smal mobilskjerm.", "Arket har ikke poeng ved deloppgavene. Poengene er hentet fra sensorveiledningen."],
      demoLabel: "Kjør CheckBST på de to eksempeltrærne",
      demo: [
        { tab: "true-treet", engine: "tree", gen: "checkBSTArk", input: [{ tree: [5, [2, [1], [4]], [7, [6], null]] }], inputNavn: "true-treet",
          presets: { "false-treet": [{ tree: [5, [2, [1], [9]], [7, [6], null]] }] }, pseudo: "checkBSTArk", legend: LEG_CHK, label: "Kjør CheckBST på true-treet", del: "(b)", fasit: "true" },
        { tab: "false-treet", engine: "tree", gen: "checkBSTArk", input: [{ tree: [5, [2, [1], [9]], [7, [6], null]] }], inputNavn: "false-treet",
          presets: { "true-treet": [{ tree: [5, [2, [1], [4]], [7, [6], null]] }] }, pseudo: "checkBSTArk", legend: LEG_CHK, label: "Kjør CheckBST på false-treet", del: "(b)", fasit: "false" }],
      losning: sol(["Hver node er større enn alt i venstre subtre og mindre enn alt i høyre subtre.",
        "Den naive løsningen sammenligner v.element med FindMax(v.left) og FindMin(v.right) i hver node. Det er riktig, men O(n²). Bedre: send med grensene (low, high) som under. Et like godt alternativ er å gjøre en inorder og sjekke at lista er strengt stigende.",
        "Grensemetoden og inorder-metoden er begge O(n)."], ["checkBSTArk"]),
      kjerne: "<p>Kravet gjelder hele subtrær. Grensene koder kravet fra alle forfedrene, så hver node sjekkes én gang.</p>",
      tips: ["Sensorveiledningen viser inorder + sjekk av sortert rekkefølge som en av tre naturlige løsninger. Den er lineær og kan gi opp til 6 poeng på (b).", "En kvadratisk løsning med FindMin/FindMax i hver node kan gi opp til 4 poeng på (b).", "Å bare sjekke direkte barn er feil. I false-treet er 9 et gyldig høyre barn av 2, men ligger i venstre subtre til 5."]
    }; });

    def("H2023-5", { host: "#exam-h2023-5" }, function () { return { key: "H2023-5", year: "H2023", title: "Diameteren til et tre", oppgave_nr: "Oppgave 5", points: 12,
      kilde: "Oppgavetekst: UiO, IN2010, H2023 5", ark: "Diameteren til et tre", ordrett: true, poengkilde: "sv",
      oppgave: skel(IN.oppg({
        intro: "<p>Vi definerer diameteren til et tre som lengden til den lengste stien mellom to noder.</p>",
        figs: [treFig(TR.genFrom(["a", ["b", ["c"]]]), "T₁"),
               treFig(TR.genFrom(["a", ["b", ["d"], ["e"]], ["c", ["f"]]]), "T₂"),
               treFig(TR.genFrom(["a", ["b"], ["c", ["e"], ["f"]], ["d"]]), "T₃"),
               treFig(TR.genFrom(["a", ["b", ["f"]], ["c"], ["d"], ["e", ["g"], ["h", ["i"]]]]), "T₄")],
        parts: [{ note: "I eksemplene over har T₁ diameter 2, T₂ diameter 4 og T₃ diameter 3." },
          { t: "Hva er diameteren til T₄?", p: 1 },
          { note: "I de neste deloppgavene begrenser vi oss til binære trær. Hvis v er en node, så er:<ul><li><code>v.left</code> venstre barn av v</li><li><code>v.right</code> høyre barn av v</li></ul>" },
          { t: "Vil den lengste stien i et binært tre alltid gå gjennom rotnoden? Begrunn svaret.", p: 2 },
          { t: "Skriv en prosedyre som finner diameteren til et gitt binærtre." + SKEL + "Lavere kjøretidskompleksitet er mer poenggivende.", p: 8 },
          { t: "Oppgi kjøretidskompleksiteten på algoritmen din for et binærtre med n noder.", p: 1 }]
      }), [{ name: "Diameter", params: "v", input: "Rotnoden v av et binærtre", output: "Returnerer diameteren til treet" }]),
      avvik: ["Nodene har bokstaver her, men ikke på arket. Bokstavene gjør det lettere å snakke om stier, og formen på trærne er den samme.", "Arket har ikke poeng ved deloppgavene. Poengene er hentet fra sensorveiledningen."],
      demo: { engine: "tree", gen: "diameterArk", input: [{ tree: ["a", ["b", ["d"], ["e"]], ["c", ["f"], null]] }], inputNavn: "T₂",
        presets: { "Kjede": [1, 2, 3, 4], "Ikke gjennom roten": [{ tree: ["r", ["a", ["b", ["d"]], ["c", null, ["e"]]]] }] },
        pseudo: "diameterArk", legend: LEG_DIAM, label: "Kjør Diameter på T₂ (svaret skal bli 4)", del: "(c)", fasit: "4" },
      losning: sol(["<b>5</b>. Stien f – b – a – e – h – i går fra en løvnode under b, via roten, ned til den dypeste løvnoden under e.",
        "<b>Nei.</b> Sett en ny rot over et gammelt tre. Den lengste stien i det gamle treet er der fortsatt, og den går ikke gjennom den nye roten. Se eksempelet «Ikke gjennom roten» i steg-demoen i dette kortet.",
        "Én postorder-rekursjon som returnerer (høyde, diameter). Høyde −1 for null. Stien gjennom v er hL + hR + 2.",
        "O(n): hver node besøkes én gang med O(1) arbeid."], ["diameterArk"]),
      kjerne: "<p>Lineær tid krever at høyden regnes ut <b>samtidig</b> med diameteren. Et nytt Height-kall per node gjør løsningen kvadratisk.</p>",
      tips: ["(c): sensorveiledningen gir opptil 8 poeng for en lineær løsning, opptil 5 for en kvadratisk og opptil 3 for et godt forsøk som ikke virker.", "(d) vurderes ut fra løsningen din i (c).", "(b): 1 poeng for svaret og 1 for begrunnelsen. Et moteksempel er en god begrunnelse."]
    }; });

    def("H2024-6", { host: "#exam-h2024-6" }, function () { return { key: "H2024-6", year: "H2024", title: "Laveste felles forfeder", oppgave_nr: "Oppgave 6", points: 12,
      kilde: "Oppgavetekst: UiO, IN2010, H2024 6", ark: "Laveste felles forfeder", ordrett: true, poengkilde: "sv",
      oppgave: skel(IN.oppg({
        intro: "<p>Den laveste felles forfederen av to noder u og v i et tre T er den laveste (altså noden med høyest dybde) som har både u og v som en etterkommer.</p>" +
          "<p>Her er noen eksempler fra treet ved siden av:</p><ul><li>Laveste felles forfeder av a og a er a</li><li>Laveste felles forfeder av b og e er a</li><li>Laveste felles forfeder av g og j er e</li><li>Laveste felles forfeder av e og j er e</li></ul>",
        figs: [treFig(TR.genFrom(TR.LCATRE), "Treet")],
        parts: [{ t: "Forklar kort hvorfor det for hvert par av noder må eksistere en felles forfeder.", p: 1 },
          { t: "Anta at hvis v er en node, har v kun følgende felter:<ul><li><code>v.parent</code> – foreldernoden til v</li><li><code>v.children</code> – barnenodene til v</li><li><code>v.depth</code> – dybden til v</li></ul>Gi en algoritme som, gitt to noder u og v, finner og returnerer deres laveste felles forfeder." + SKEL, p: 5 },
          { t: "Anta nå at treet er et binært søketre av unike heltall. Hvis v er en node, så har v kun følgende felter:<ul><li><code>v.element</code> – heltallet som er lagret i noden</li><li><code>v.left</code> – venstre barn av v</li><li><code>v.right</code> – høyre barn av v</li></ul>Gi en algoritme som, gitt roten av treet og elementene x og y, returnerer den laveste felles forfeder av nodene som henholdsvis har elementene x og y der x &lt; y. Du kan anta at begge elementene x og y finnes i treet." + SKEL, p: 5 },
          { t: "Hva er kjøretidskompleksiteten til algoritmen din fra (c) for et tre med n noder i verste tilfelle? Hva er kjøretidskompleksiteten dersom du antar at treet er balansert?<br>Hvis du ikke har svart på (c) kan du oppgi svaret for din løsning på (b) i stedet.", p: 1 }]
      }), [{ name: "LowestCommonAncestor", params: "u, v", input: "To noder u of v", output: "Laveste felles forfeder av u og v" },
           { name: "LowestCommonAncestorBST", params: "v, x, y", input: "En node v, og to verdier x og y der x < y", output: "Laveste felles forfeder av nodene som har elementene x og y" }]),
      avvik: [AVVIK_PLASS, "Arket har ikke poeng ved deloppgavene. Poengene er hentet fra sensorveiledningen.", "Arket gir ikke noe eksempeltre til (c). Steg-demoen for (c) bruker derfor vårt eget søketre 50, 30, 70, 20, 40, 60, 80."],
      demoLabel: "Kjør algoritmene for (b) og (c)",
      demo: [
        { tab: "(b) LowestCommonAncestor", engine: "tree", gen: "lowestCommonAncestor", input: [{ u: "g", v: "j" }], inputNavn: "g og j",
          presets: { "e og j": [{ u: "e", v: "j" }], "b og e": [{ u: "b", v: "e" }], "a og a": [{ u: "a", v: "a" }] },
          pseudo: "lowestCommonAncestor", legend: LEG_LCA, label: "Kjør LowestCommonAncestor(g, j)", del: "(b)", fasit: "e" },
        { tab: "(c) LowestCommonAncestorBST", engine: "tree", gen: "lowestCommonAncestorBST", input: [{ keys: BST7.slice(), x: 20, y: 40 }], inputNavn: "x = 20, y = 40",
          presets: { "x = 60, y = 80": [{ keys: BST7.slice(), x: 60, y: 80 }], "x = 30, y = 40 (forfeder)": [{ keys: BST7.slice(), x: 30, y: 40 }], "x = 20, y = 80": [{ keys: BST7.slice(), x: 20, y: 80 }] },
          pseudo: "lowestCommonAncestorBST", legend: LEG_LCABST, label: "Kjør LowestCommonAncestorBST på vårt eget søketre", del: "(c)", fasit: "30" }],
      losning: sol(["Roten er forfeder til alle noder.",
        "Er u = v, er svaret u. Ellers løfter vi den dypeste av de to ett nivå, og prøver igjen. Eksempler fra treet: g og j gir e, og e og j gir e.",
        "Start i roten. Ligger v.element mellom x og y (med ≤), er v svaret. Er y &lt; v.element, gå til venstre, ellers til høyre.",
        "O(h): O(n) i verste fall og O(log n) når treet er balansert. Løsningen på (b) er også O(h)."], ["lowestCommonAncestor", "lowestCommonAncestorBST"]),
      kjerne: "<p>Bruk strukturen du får: parent og depth i (b), søketre-ordningen i (c). Da holder det å følge én sti.</p>",
      tips: ["Sensorveiledningen sier at en god løsning er O(h), og gir høyst 3 av 5 poeng for en lineær løsning i (b) og (c).", "Tips: husk tilfellet der den ene noden er forfeder til den andre (e og j)."]
    }; });

    def("H2020-6", { host: "#exam-h2020-6" }, function () { return { key: "H2020-6", year: "H2020", title: "AVL-innsetting", oppgave_nr: "Oppgave 6", points: 9,
      kilde: "Oppgavetekst: UiO, IN2010, H2020 6", ark: "AVL", ordrett: true,
      oppgave: IN.oppg({
        intro: "<p>Vanligvis gjør vi AVL-innsetting på AVL-trær, men vi kan bruke samme prosedyre på et ordinært binært søketre (gitt at hver node inneholder høyden for sitt subtre). Til høyre ser du et binært søketre, som ikke er et AVL-tre. Sett inn 5 i treet ved bruk av AVL-innsetting.</p>",
        figs: [treFig(TR.fromNested([1, null, [2, null, [3, null, [4]]]]), "Det binære søketreet")],
        parts: [{ t: "Hvordan ser treet ut etter den første rotasjonen i innsettingen?", p: 2 },
          { t: "Merk at en dobbelrotasjon telles som to enkle rotasjoner.<br>Hvor mange enkle rotasjoner blir utført under innsetting?", p: 4 },
          { t: "Er det resulterende treet et AVL-tre?", p: 1 },
          { t: "Hva er verdien i rotnoden etter innsetting?", p: 2 }]
      }),
      avvik: [AVVIK_PLASS, "Treet er tegnet på nytt med guidens tretegning, fordi arket bare har det som bilde."],
      demo: { engine: "tree", gen: "avlInsert", input: [{ base: [1, 2, 3, 4], keys: [5] }], inputNavn: "Kjeden 1–4, sett inn 5",
        presets: { "2, 4, 3, 1, 5": [2, 4, 3, 1, 5], "Dobbel (30, 10, 20)": [30, 10, 20] },
        pseudo: ["avlInsert", "avlBalance"], legend: LEG_AVL, label: "Kjør AVL-innsetting av 5 i kjeden 1 → 2 → 3 → 4", fasit: "rot 2, 4 rotasjoner" },
      losning: sol(["<b>Venstrerotasjon på 3.</b> Treet blir 1 → 2 → 4, der 4 har barna 3 og 5.",
        "<b>4.</b> Videre opp har 2 b = −2, og høyre barn 4 er i balanse (b = 0), så det blir en enkel venstrerotasjon på 2. Da står 4 under 1, med 2 (og 3) til venstre. 1 har nå b = −3, og høyre barn 4 er venstretungt (en knekk). Derfor blir det en <b>dobbel rotasjon</b>: høyrerotasjon på 4, så venstrerotasjon på 1. Totalt tre venstrerotasjoner og én høyrerotasjon.",
        "<b>Ja.</b> Alle nodene har balansefaktor −1, 0 eller 1.",
        "<b>2</b>, med venstre barn 1 og høyre barn 4, som har barna 3 og 5."], ["avlInsert", "avlBalance"],
        { intro: "5 settes inn som høyre barn av 4. På veien opp har 4 b = −1, som er lov, men 3 har b = −2." }),
      kjerne: "<p>Balance kalles på <b>hver</b> node på veien opp. Starter du fra et ubalansert tre, kan det derfor bli rotasjoner på flere nivåer.</p>",
      tips: ["Tegn treet etter hver rotasjon. Da er det lett å telle.", "Sjekk om det er en knekk før du roterer. Det avgjør om det blir enkel eller dobbel rotasjon."]
    }; });

    def("H2022-4", { host: "#exam-h2022-3" }, function () { return { key: "H2022-4", year: "H2022", title: "Balanserte søketrær (AVL)", oppgave_nr: "Oppgave 4", points: 6,
      kilde: "Oppgavetekst: UiO, IN2010, H2022 4", ark: "Balanserte søketrær", ordrett: true,
      oppgave: IN.oppg({
        intro: "<p>Følgende er alle AVL-trær som inneholder tallene 1 til 5.</p>",
        figs: AVL6.map(function (n, i) { return treFig(TR.fromNested(n), "(" + (i + 1) + ")"); }),
        parts: [{ t: "Hvilket av AVL-trærne ovenfor får man hvis man legger inn tallene 1 til 5 i rekkefølgen 2, 4, 3, 1, 5? Oppgi svaret som et tall mellom 1 og 6." },
          { t: "Hvor mange av trærne ovenfor kan fargelegges som et rød-svart tre?" },
          { t: "Hvis vi legger til 6 i alle AVL-trærne ovenfor, i hvilke trær vil det forekomme rotasjoner? Oppgi svaret som summen av alle trærne det gjelder. Altså, hvis det kun forekommer rotasjoner i det første treet, er svaret 1, og hvis det forekommer rotasjoner i alle trærne, er svaret 21 (fordi 1 + 2 + 3 + 4 + 5 + 6 = 21)." }]
      }),
      avvik: ["Arket fordeler ikke de 6 poengene på deloppgavene, og det gjør heller ikke sensorveiledningen. Derfor står det ingen poeng ved deloppgavene.", "Trærne er tegnet på nytt med guidens tretegning, fordi arket bare har dem som bilde."],
      demo: { engine: "tree", gen: "avlInsert", input: [2, 4, 3, 1, 5], inputNavn: "2, 4, 3, 1, 5",
        presets: { "1–5 sortert": [1, 2, 3, 4, 5], "Tre (2) + 6": [2, 1, 4, 3, 5, 6] },
        pseudo: ["avlInsert", "avlBalance"], legend: LEG_AVL, label: "Kjør AVL-innsetting av 2, 4, 3, 1, 5", del: "(a)",
        svar: function (last) { var i = last && last.tree ? AVL6SIG.indexOf(formSig(last.tree)) : -1; return i >= 0 ? String(i + 1) : "(ikke et av de seks trærne)"; } },
      losning: sol(["<b>5.</b> Innsetting av 2, 4, 3 gir en knekk i 2, og en dobbel rotasjon gjør 3 til rot. Så kommer 1 til venstre for 2 og 5 til høyre for 4. Sluttreet er 3 med barna 2 (venstre barn 1) og 4 (høyre barn 5), altså tre (5).",
        "<b>Alle 6.</b> Ethvert AVL-tre kan fargelegges som et rød-svart tre.",
        "<b>11.</b> 6 havner under 5. I tre (2) får roten 2 balansefaktor −2, og i tre (4) og (5) får noden 4 balansefaktor −2. I tre (1), (3) og (6) holder alle seg innenfor −1, 0 og 1. 2 + 4 + 5 = 11."]),
      kjerne: "<p>Spor innsettingen steg for steg, med høyder og balansefaktorer, i stedet for å gjette ut fra formen.</p>",
      tips: ["Skriv høyden ved hver node før du setter inn 6. Da ser du raskt hvor balansefaktoren blir 2 eller −2."]
    }; });

    def("H2025-4", { host: "#exam-h2025-3" }, function () { return { key: "H2025-4", year: "H2025", title: "Anti-AVL", oppgave_nr: "Oppgave 4", points: 12,
      kilde: "Oppgavetekst: UiO, IN2010, H2025 4", ark: "Anti-AVL", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>AVL-trær bruker venstre- og høyrerotasjoner for å sørge for at det binære søketreet ender opp balansert etter innsetting og sletting. Her er innsetting for en variant av AVL-trær som vi kaller Anti-AVL.</p>",
        figs: [pcFig(A.insertAntiAVL, true), pcFig(A.rightRotateAntiAVL, true)],
        parts: [{ t: "Sett inn tallene 3, 1, 4, 2, 5 med InsertAntiAVL.<ul><li>Beskriv kort hvordan det resulterende Anti-AVL-treet ser ut.</li><li>Angi det totale antallet rotasjoner som forekommer i løpet av innsettingene.</li></ul>", p: 2 },
          { t: "Beskriv mer generelt hvordan Anti-AVL-trær ser ut.", p: 2 },
          { t: "Et binært søketre er et binærtre der elementet i hver node er:<ul><li>større enn alle elementer i venstre subtre, og</li><li>mindre enn alle elementer i høyre subtre.</li></ul>Har Anti-AVL-trær den samme egenskapen? Forklar.", p: 3 },
          { t: "Hva er kjøretidskompleksiteten på oppslag i Anti-AVL-trær? Du kan anta at oppslag er implementert identisk som ordinære binære søketrær og AVL-trær. Begrunn svaret kort.", p: 2 },
          { t: "Beskriv kort hvordan innsetting i Anti-AVL-trær skiller seg fra innsetting i AVL-trær.", p: 3 }]
      }),
      avvik: ["På arket står de to prosedyrene i to kolonner. Her står de etter hverandre, fordi siden også skal fungere på en smal mobilskjerm.", "Arket har ikke poeng ved deloppgavene. Poengene er hentet fra sensorveiledningen."],
      demo: { engine: "tree", gen: "insertAntiAVL", input: [3, 1, 4, 2, 5], inputNavn: "3, 1, 4, 2, 5",
        presets: { "Stigende 1–5": [1, 2, 3, 4, 5], "Synkende 5–1": [5, 4, 3, 2, 1] },
        pseudo: ["insertAntiAVL", "rightRotateAntiAVL"], legend: LEG_AVL, label: "Kjør InsertAntiAVL for 3, 1, 4, 2, 5", del: "(a)" },
      losning: sol(["Resultatet er høyrekjeden 1 → 2 → 3 → 4 → 5, etter <b>2 rotasjoner</b> (ved innsetting av 1 og av 2). Se steg-demoen i dette kortet.",
        "Hver node har høyst et høyre barn. Treet er en høyrekjede, altså en sortert lenket liste.",
        "<b>Ja.</b> Innsettingen er vanlig BST-innsetting, og en høyrerotasjon bevarer søketre-egenskapen.",
        "<b>O(n).</b> Høyden er n − 1: for å finne den største verdien må vi følge n − 1 høyrepekere.",
        "AVL bygger et så balansert tre som mulig. Det lagrer høyder og roterer når høydene til to subtrær er mer enn 1 fra hverandre. Anti-AVL ser bare på om det finnes et venstre barn, og bygger et så ubalansert tre som mulig."]),
      kjerne: "<p>Invarianten «ingen venstre barn» gir høyst én rotasjon per innsetting og en kjede som resultat.</p>",
      tips: ["Følg kallene nedenfra og opp. Rotasjonen skjer etter det rekursive kallet."]
    }; });

    def("H2025-5", { host: "#exam-h2025-4" }, function () { return { key: "H2025-5", year: "H2025", title: "Level-order", oppgave_nr: "Oppgave 5", points: 12,
      kilde: "Oppgavetekst: UiO, IN2010, H2025 5", ark: "Level-order", ordrett: true, poengkilde: "sv",
      oppgave: (function (n) { IN.pseudo.render(qs(".et-cbst", n), CONSTRUCTBST, { tooltips: false }); return n; })(skel(IN.oppg({
        intro: "<p>En level-order-traversering besøker nodene i et tre etter dybde. Det vil si at roten besøkes først, så alle barna til roten, så alle barna til rotens barn, og så videre.</p><p>En level-order-traversering av følgende tre kan, for eksempel, besøke nodene i rekkefølgen 10, 15, 5, 12, 17, 7, 2.</p>",
        figs: [treFig(TR.fromNested([10, [15, [12], [17]], [5, [7], [2]]]), "Treet")],
        parts: [{ t: "Anta at treet er en binær heap, representert ved et array A med n elementer. Gi en algoritme som returnerer en liste med elementene fra A i level-order." + SKEL, p: 2 },
          { t: "Anta at treet er et binært søketre med n noder, der hver node v har følgende felter:<ul><li><code>v.element</code> — verdien som er lagret i noden</li><li><code>v.left</code> — venstre barn av v</li><li><code>v.right</code> — høyre barn av v</li></ul>Gi en algoritme som returnerer en liste med elementene fra treet i level-order." + SKEL, p: 6 },
          { t: "Oppgi kjøretidskompleksiteten for algoritmene dine i (a) og (b).", p: 1 },
          { t: "Se på følgende algoritme:<div class=\"et-cbst\"></div>Hva kan du si om relasjonen mellom input-treet og output-treet?", p: 3 }]
      }), [{ name: "LevelOrderHeap", params: "A", input: "En binær heap, representert ved et array A med n elementer", output: "En liste med elementene i heapen i level-order" },
           { name: "LevelOrderBST", params: "v", input: "Roten v av et binært søketre med n noder", output: "En liste med elementene i søketreet i level-order" }])),
      avvik: ["Arket har ikke poeng ved deloppgavene. Poengene er hentet fra sensorveiledningen.", "Steg-demoen viser bare (b). Treet i oppgaven er ikke et søketre, men LevelOrderBST bruker aldri søketre-egenskapen, så den virker på alle binærtrær."],
      demo: { engine: "tree", gen: "levelOrderBST", input: [{ tree: [10, [15, [12], [17]], [5, [7], [2]]] }], inputNavn: "Treet fra oppgaven",
        presets: { "Søketreet 50…80": BST7.slice(), "Ujevnt søketre": [4, 2, 6, 1, 3, 5] },
        pseudo: "levelOrderBST", label: "Kjør LevelOrderBST på treet fra oppgaven", del: "(b)" },
      losning: sol(["Heap-arrayet er allerede i level-order. Kopier A over i en liste.",
        "Bredde først med en kø: legg inn roten, ta ut én node om gangen, legg elementet bakerst i lista, og legg inn barna som ikke er null. Et tre har ingen sykler, så vi trenger ingen visited-mengde.",
        "Begge er O(n). Hver node behandles én gang.", "Nøyaktig samme tre. Hver node settes inn etter forfedrene sine og havner på samme plass. Se demoen «Samme tre fra level-order» under Binært søketre."], ["levelOrderBST"]),
      kjerne: "<p>Level-order = kø. Heap-arrayet er level-order «gratis».</p>",
      tips: ["Sensorveiledningen trekker 3 poeng for stakk i stedet for kø (det gir dybde først).", "Den trekker inntil 2 poeng for manglende null-sjekk av barna."]
    }; });

    def("H2024-2", { host: "#exam-h2024-2" }, function () { return { key: "H2024-2", year: "H2024", title: "Huffman", oppgave_nr: "Oppgave 2", points: 10,
      kilde: "Oppgavetekst: UiO, IN2010, H2024 2", ark: "Huffman-trær", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>Vi vil komprimere tekststrenger som består av symbolene A, B, C og D ved hjelp av Huffman-koding. De relative frekvensene er gitt av følgende frekvenstabell:</p>" + freqTab([["A", 1], ["B", 3], ["C", 7], ["D", 2]]),
        parts: [{ t: "Hva blir kodelengdene for de ulike symbolene i det tilhørende Huffman-treet?", p: 2 },
          { t: "Hva inneholder løvnodene i det resulterende treet?", p: 1 },
          { note: "Generelt i et Huffman-tre har hver node v:<ul><li><code>v.symbol</code> – Symbolet til noden (eller null)</li><li><code>v.freq</code> – Frekvensen til noden</li><li><code>v.left</code> – Venstre barn av noden (eller null)</li><li><code>v.right</code> – Høyre barn av noden (eller null)</li></ul>Et Huffman-tre bygges fra en mengde med par (s, f) der s er et symbol og f er en frekvens." },
          { t: "Beskriv algoritmen for å bygge et Huffman-tre. Du kan skissere den med pseudokode, men en god beskrivelse med naturlig språk gir like god uttelling.", p: 7 }]
      }),
      avvik: "Arket har ikke poeng ved deloppgavene. Poengene er hentet fra sensorveiledningen.",
      demo: { engine: "tree", gen: "huffman", input: [{ pairs: [["A", 1], ["B", 3], ["C", 7], ["D", 2]] }], inputNavn: "A1 B3 C7 D2",
        presets: { "H2021: a2 b1 c12 d1 e4": [{ pairs: [["a", 2], ["b", 1], ["c", 12], ["d", 1], ["e", 4]] }], "Like frekvenser": [{ pairs: [["w", 1], ["x", 1], ["y", 1], ["z", 1]] }] },
        pseudo: "huffman", legend: LEG_HUFF, label: "Bygg Huffman-treet for A1 B3 C7 D2", del: "(a)" },
      losning: sol(["A og D slås sammen (3), så B og den nye noden (6), så 6 og C (13). Kodelengder: <b>A = 3, B = 2, C = 1, D = 3</b>.",
        "Symbolene og frekvensene deres.",
        "Legg alle symbolene i en prioritetskø ordnet på frekvens. Så lenge køen har mer enn én node: ta ut de to minste, lag en forelder med summen som frekvens, og legg den tilbake. Returner den siste noden, som er roten."], ["huffman"]),
      kjerne: "<p>Grådig: slå alltid sammen de to sjeldneste. Med en prioritetskø blir det O(n log n).</p>",
      tips: ["(c): sensorveiledningen gir 2,5 poeng for prioritetskøen, 2,5 for sammenslåingen, 1 for stoppbetingelsen og 1 for returverdien.", "Tips: skriv stoppbetingelsen eksplisitt, for eksempel Size(Q) > 1.", "B og den nye noden har begge frekvens 3. Velger du dem i en annen rekkefølge, kan treet se annerledes ut, men kodelengdene blir de samme."]
    }; });

    def("H2021-5", { host: "#exam-h2021-5" }, function () { return { key: "H2021-5", year: "H2021", title: "Huffman-trær", oppgave_nr: "Oppgave 5", points: 5,
      kilde: "Oppgavetekst: UiO, IN2010, H2021 5", ark: "Huffmantrær", ordrett: true, poengkilde: "sv",
      oppgave: IN.oppg({
        intro: "<p>En tekststreng vi vil komprimere består av 5 ulike tegn a,b,c,d og e. De relative frekvensene er gitt av følgende frekvenstabell:</p>" + freqTab([["a", 2], ["b", 1], ["c", 12], ["d", 1], ["e", 4]]),
        parts: [{ t: "Hva er den lengste kodelengden for et symbol i det tilhørende huffmantreet?", p: 1 }, { t: "Hvor mange bits blir koden for tegnet e?", p: 1 },
          { t: "Hvor mange bits brukes for å kode strengen aaabbcdee?", p: 1 },
          { note: "Nå skal vi ikke jobbe med noe konkret huffmantre for et en gitt frekvenstabell, men heller tenke på generelle huffmantrær." },
          { t: "Hvis en frekvenstabell består av 8 forskjellige tegn, hvor mange noder har det tilhørende huffmantreet?", p: 1 },
          { t: "I et huffmantre som har 8 løvnoder, hva er den lengste kodelengden et symbol kan ha?", p: 1 }],
        outro: demoLink("huffman", "demo-huffman", "Kode-/dekodeboksen under Huffman-demoen").replace("Prøv selv:", "Sjekk (c):")
      }),
      avvik: "Arket har ikke poeng ved deloppgavene. Poengene er hentet fra sensorveiledningen.",
      demo: { engine: "tree", gen: "huffman", input: [{ pairs: [["a", 2], ["b", 1], ["c", 12], ["d", 1], ["e", 4]] }], inputNavn: "a2 b1 c12 d1 e4",
        presets: { "H2024: A1 B3 C7 D2": [{ pairs: [["A", 1], ["B", 3], ["C", 7], ["D", 2]] }], "Skjevt: 1, 1, 2, 4, 8": [{ pairs: [["p", 1], ["q", 1], ["r", 2], ["s", 4], ["t", 8]] }] },
        pseudo: "huffman", legend: LEG_HUFF, label: "Bygg Huffman-treet for a2 b1 c12 d1 e4", fasit: "a = 3, b = 4, c = 1, d = 4, e = 2" },
      losning: sol(["Kodelengdene blir c = 1, e = 2, a = 3, b = 4, d = 4. Den lengste er <b>4</b>.", "<b>2</b>.",
        "3 · 3 (a) + 2 · 4 (b) + 1 (c) + 4 (d) + 2 · 2 (e) = <b>26</b>.",
        "<b>15</b>: 8 løvnoder og 7 interne noder (n − 1 sammenslåinger).", "<b>7</b>, når treet er helt skjevt (f.eks. frekvenser 1, 1, 2, 4, 8, …)."]),
      kjerne: "<p>n symboler gir 2n − 1 noder. Den lengste mulige koden er n − 1.</p>",
      tips: ["Sensorveiledningen gir 1 poeng per deloppgave. Regn raskt, men sjekk summen i (c)."]
    }; });

    def("H2022-9", { host: "#exam-h2022-8" }, function () { return { key: "H2022-9", year: "H2022", title: "Autofullføring: prefikstre mot hashmap", oppgave_nr: "Oppgave 9", points: 6,
      kilde: "Oppgavetekst: UiO, IN2010, H2022 9", ark: "Auto complete", ordrett: true,
      oppgave: IN.oppg({
        intro: "<p>De fleste teksteditorer har funksjonalitet for «auto completion», altså der det dukker opp en liten boks med mulige måter å fullføre et påbegynt ord. Nedenfor gir vi to mulige datastrukturer som kan brukes for å implementere en enkel mekanisme for å fullføre et påbegynt ord.</p>" +
          "<p>Vi viser eksempler på hvordan datastrukturene ser ut dersom de lagrer ordene: bin, binary, bind, head, headache, hello, help, slack, sleep, sleepy.</p>" +
          "<h4>Strategi 1</h4><p>Den første strategien er å bruke et prefiks-tre som holder på strenger. Et prefiks-tre har en rot. Hvis en streng s er lagt inn i treet, har rotnoden et barn med s sin første bokstav. Den noden har igjen en peker til s sin andre bokstav, og så videre. Den siste bokstaven i s er markert som en terminal node (terminalnodene er fargelagt blå i eksempelet). Det vil si at hvis du følger en sti fra rotnoden til en terminalnode, så har du stavet et ord som er lagt inn i treet.</p>" +
          "<p>Fra et prefiks-tre er det enkelt å finne alle måter å fullføre et påbegynt ord. Det gjøres ved å returnere alle stier fra rotnoden som begynner med bokstavene fra et gitt ord og ender i en terminalnode.</p>",
        figs: [(function () { var T = trie(["bin", "binary", "bind", "head", "headache", "hello", "help", "slack", "sleep", "sleepy"]);
            return { cls: "lg", cap: "Strategi 1: prefikstreet. Terminalnodene er grønne her", draw: function (h) { vizTree(h, { tree: T.tree, marks: { done: T.ends } }, { ariaLabel: "Prefikstre for de ti ordene. Terminalnodene er siste bokstav i hvert ord." }); fastSkala(h, 0.7); } }; })()],
        parts: [{ note: "<h4>Strategi 2</h4><p>Den andre strategien er å bruke et hashmap, der vi lar hver prefiks av et ord mappe til en liste av alle mulige måter å fullføre ordet. Hvis H er et hashmap, og s er en streng som skal legges til, ser vi på hver prefiks p av s og legger s til i listen H[p]. I eksempelet ved siden av ser dere hvordan hashmapet kan se ut dersom alle eksempelordene er lagt (merk at noen av listene er kortet ned, indikert ved «...»).</p>" +
            "<p>Fra et slikt hashmap er det svært enkelt å finne alle måter å fullføre et påbegynt ord. Det gjøres ved å slå opp det påbegynte ordet i hashmapet og returnere listen.</p>" }],
        figsAfter: [{ cls: "lg", cap: "Strategi 2: hashmapet", draw: function (h) {
            h.innerHTML = '<div class="tr-hashtab"><table class="et-tab"><tr><th>Nøkkel</th><th>Verdi</th></tr>' +
              HASHTAB.map(function (r) { return '<tr><td class="mono">' + r[0] + '</td><td class="mono" style="text-align:left">' + r[1] + "</td></tr>"; }).join("") + "</table></div>"; } }],
        outro: "<p><b>Drøft fordeler og ulemper ved de to ulike strategiene både med tanke på kjøretid og minnebruk</b></p>"
      }),
      avvik: [AVVIK_PLASS, "Terminalnodene er grønne her, ikke blå som på arket, fordi blått allerede betyr «gjeldende node» i guidens tretegninger.", "Arket har ikke poeng ved noen deloppgaver. Hele oppgaven er 6 poeng og vurderes etter skjønn."],
      losning: sol(["<b>Prefikstre:</b> felles prefikser deles (bin-, hea-, hel-, sle-), så minnet blir lavt. Innsetting tar tid lik ordlengden. Fullføringer finnes ved å gå ned til prefikset og traversere subtreet, lineært i størrelsen på subtreet.",
        "<b>Hashmap:</b> hvert prefiks peker til en liste med alle ord som starter slik. Den tomme strengen peker til hele ordlista, og korte prefikser gir lange lister, så minnet blir stort. Innsetting tar tid lik ordlengden (ett prefiks per tegn). Oppslag er forventet O(1), men forslagene må også vises, og det tar tid lineært i antall forslag.",
        "Konklusjon: en avveining mellom tid og minne. Prefikstreet sparer minne, hashmapet gir raskere oppslag."], null, { plain: true }),
      kjerne: "<p>En drøfting må dekke begge datastrukturene, og både tid og minne.</p>",
      tips: ["Tips: bruk eksempelordene konkret, og vis hvilke prefikser som deles.", "Sensorveiledningen legger vekt på at teksten er tydelig og enkel å forstå."]
    }; });

  // Brukes også av demoene på temasiden
  IN.kortData.felles(SIDE, { PATHC: PATHC, ALTC: ALTC, LEG_LCA: LEG_LCA, LEG_LCABST: LEG_LCABST, LEG_AVL: LEG_AVL, LEG_DIAM: LEG_DIAM, BST7: BST7 });
})();
