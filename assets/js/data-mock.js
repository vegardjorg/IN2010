/* data-mock.js: mock-standardoppgaver (Del 2, oppgave 1, 10 p) for crash-løypa.
   window.IN.MOCK = [ { id, tema, operasjon, sannsynlighet, begrunnelse, year: "Mock", title,
                        points: 10, oppgave_nr, oppgave, losning, kjerne, tips, eli5, side } ]
   Hvert objekt kan sendes rett til IN.examTask(host, data).
   Felter:
   - oppgave: html med deloppgaver i <ol class="et-parts"> (poengene summerer til 10).
   - losning: array med steg (html), vises som nummerert liste.
   - kjerne: kjernepoenget, kjøretid og «Slik ville poengene trolig blitt gitt (vårt anslag)» (callout.sensor).
   - tips: «Feller», én felle per element.
   - eli5: «5-åring: …» (egen linje; vises ikke av IN.examTask, løypa viser den selv).
   - side: { page, fane } for dyplenke til fanen som forklarer operasjonen.
   - sannsynlighet: høy | middels | lav, begrunnelse: hvorfor (kilder og eksamenshistorikk).
   Alle løsninger er kjørt med et kontrollskript etter kursets egne varianter
   (se plan/gjennomgang/mock-standardoppgaver.md). Filen bygger statisk html ved lasting
   og avhenger ikke av andre skript eller lasterekkefølge. */
(function () {
  var IN = (window.IN = window.IN || {});

  /* ---------- Hjelpere (bare strenger, ingen DOM) ---------- */
  var KW = {
    Procedure: 1, Function: 1, "for": 1, to: 1, down: 1, downto: 1, "do": 1, "while": 1, "if": 1, then: 1,
    "else": 1, elseif: 1, "return": 1, and: 1, or: 1, not: 1, "new": 1, swap: 1, "true": 1, "false": 1,
    "null": 1, "break": 1, "continue": 1, append: 1, "in": 1, is: 1, mod: 1, repeat: 1, until: 1,
    each: 1, of: 1, error: 1, yield: 1
  };
  var RE = /(\/\/[^\n]*)|([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9']*|\[[^\]\n]*\])+)|(\d+)|([A-Za-z_][A-Za-z0-9_']*)|(\s+)|([\s\S])/g;
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function tok(code) {
    var out = "", m;
    RE.lastIndex = 0;
    while ((m = RE.exec(code)) !== null) {
      if (m[1] != null) out += '<span class="cmt">' + esc(m[1]) + "</span>";
      else if (m[2] != null) out += '<span class="mono">' + esc(m[2]) + "</span>";
      else if (m[3] != null) out += esc(m[3]);
      else if (m[4] != null) {
        var w = m[4];
        if (KW[w]) out += '<span class="kw">' + esc(w) + "</span>";
        else if (/^[A-Z]/.test(w)) out += '<span class="mono">' + esc(w) + "</span>";
        else out += '<span class="var">' + esc(w) + "</span>";
      }
      else if (m[5] != null) out += m[5];
      else out += esc(m[6]);
    }
    return out;
  }
  /* pc(signatur, input, output, linjer): linjene rykkes inn med to mellomrom per nivå. */
  function pc(sig, input, output, lines) {
    var h = '<div class="pseudo">';
    if (input || output) {
      h += '<div class="pc-head">';
      if (input) h += '<span class="pc-io"><b>Input:</b> ' + esc(input) + "</span>";
      if (output) h += '<span class="pc-io"><b>Output:</b> ' + esc(output) + "</span>";
      h += "</div>";
    }
    var all = ["Procedure " + sig].concat(lines);
    for (var i = 0; i < all.length; i++) {
      var raw = all[i], sp = raw.match(/^ */)[0].length, ind = Math.floor(sp / 2), g = "";
      for (var k = 0; k < ind; k++) g += '<span class="indent">│  </span>';
      h += '<div class="pc-line" data-line="' + (i + 1) + '"><span class="ln">' + (i + 1) +
        '</span><span class="code">' + g + tok(raw.slice(sp)) + "</span></div>";
    }
    return h + "</div>";
  }
  var HL = ' style="background:var(--color-tone-caution);color:var(--color-on-tone-caution);font-weight:700"';
  function cell(v, hl, th) {
    var t = th ? "th" : "td";
    return "<" + t + (hl ? HL : "") + ">" + (v == null ? "" : v) + "</" + t + ">";
  }
  /* states(rader, hjørne): rader = [[etikett, array, [uthevede indekser]]], kolonner = indekser. */
  function states(rows, corner) {
    var w = 0, i, j;
    for (i = 0; i < rows.length; i++) w = Math.max(w, rows[i][1].length);
    var h = '<div class="table-wrap"><table class="et-tab"><tr><th>' + (corner || "indeks") + "</th>";
    for (j = 0; j < w; j++) h += "<th>" + j + "</th>";
    h += "</tr>";
    for (i = 0; i < rows.length; i++) {
      var r = rows[i], hl = r[2] || [];
      h += '<tr><th style="text-align:left;white-space:nowrap">' + r[0] + "</th>";
      for (j = 0; j < w; j++) h += cell(j < r[1].length ? r[1][j] : "", hl.indexOf(j) >= 0);
      h += "</tr>";
    }
    return h + "</table></div>";
  }
  /* tab(overskrifter, rader): vanlig tabell; en celle kan være {v, hl}. */
  function tab(head, rows) {
    var h = '<div class="table-wrap"><table class="et-tab"><tr>';
    for (var i = 0; i < head.length; i++) h += "<th>" + head[i] + "</th>";
    h += "</tr>";
    for (var r = 0; r < rows.length; r++) {
      h += "<tr>";
      for (var c = 0; c < rows[r].length; c++) {
        var x = rows[r][c];
        h += (x && typeof x === "object") ? cell(x.v, x.hl) : cell(x);
      }
      h += "</tr>";
    }
    return h + "</table></div>";
  }
  function svgOpen(w, h, label) {
    return '<svg class="viz-svg" viewBox="0 0 ' + w + " " + h + '" style="max-width:' + w +
      'px" role="img" aria-label="' + esc(label) + '">';
  }
  var TXT = ' text-anchor="middle" dominant-baseline="central"';
  function nodeSvg(x, y, v, mark) {
    return '<g class="node' + (mark ? " done" : "") + '"><circle cx="' + x + '" cy="' + y + '" r="15"></circle>' +
      '<text x="' + x + '" y="' + y + '"' + TXT + ' style="font-size:12px;font-weight:600">' + v + "</text></g>";
  }
  /* tree(t, merk, etikett): t = [verdi, venstre, høyre] eller null. merk = liste med verdier som utheves. */
  function tree(t, mark, label) {
    var idx = 0, maxd = 0, nodes = [];
    mark = mark || [];
    function walk(n, d) {
      if (!n) return null;
      var L = walk(n[1], d + 1), me = { v: n[0], x: idx++, d: d, m: n[3] || mark.indexOf(n[0]) >= 0 };
      var R = walk(n[2], d + 1);
      me.L = L; me.R = R; if (d > maxd) maxd = d; nodes.push(me);
      return me;
    }
    walk(t, 0);
    var dx = 36, dy = 48, pad = 20, W = Math.max(60, pad * 2 + (idx - 1) * dx), H = pad * 2 + maxd * dy;
    function X(n) { return pad + n.x * dx; }
    function Y(n) { return pad + n.d * dy; }
    var s = svgOpen(W, H, label || "Binærtre"), i;
    for (i = 0; i < nodes.length; i++) {
      var n = nodes[i], cs = [n.L, n.R];
      for (var c = 0; c < 2; c++) if (cs[c]) s += '<line class="edge" x1="' + X(n) + '" y1="' + Y(n) + '" x2="' + X(cs[c]) + '" y2="' + Y(cs[c]) + '"></line>';
    }
    for (i = 0; i < nodes.length; i++) s += nodeSvg(X(nodes[i]), Y(nodes[i]), nodes[i].v, nodes[i].m);
    return s + "</svg>";
  }
  /* heapTree(A, uthevede indekser): tegner arrayet som komplett binærtre. */
  function heapTree(A, hl, label) {
    hl = hl || [];
    function b(i) { return i < A.length ? [A[i], b(2 * i + 1), b(2 * i + 2), hl.indexOf(i) >= 0] : null; }
    return tree(b(0), [], label || "Heap tegnet som binærtre");
  }
  var mk = 0;
  /* graph({w, h, nodes: {A: [x, y]}, edges: [[u, v, vekt]], dir, hl: ["A-C"], label}) */
  function graph(o) {
    var id = "mockmk" + (++mk), s = svgOpen(o.w, o.h, o.label || "Graf"), hl = o.hl || [];
    if (o.dir) s += '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-outline)"></path></marker></defs>';
    for (var i = 0; i < o.edges.length; i++) {
      var e = o.edges[i], a = o.nodes[e[0]], b = o.nodes[e[1]];
      var vx = b[0] - a[0], vy = b[1] - a[1], len = Math.sqrt(vx * vx + vy * vy), ux = vx / len, uy = vy / len;
      var r2 = o.dir ? 18 : 15;
      var x1 = a[0] + ux * 15, y1 = a[1] + uy * 15, x2 = b[0] - ux * r2, y2 = b[1] - uy * r2;
      var on = hl.indexOf(e[0] + "-" + e[1]) >= 0 || hl.indexOf(e[1] + "-" + e[0]) >= 0;
      s += '<line class="edge' + (on ? " active" : "") + '" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) +
        '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"' + (o.dir ? ' marker-end="url(#' + id + ')"' : "") + "></line>";
      if (e[2] != null) {
        var mx = (a[0] + b[0]) / 2 - uy * 9, my = (a[1] + b[1]) / 2 + ux * 9;
        s += '<text x="' + mx.toFixed(1) + '" y="' + my.toFixed(1) + '"' + TXT +
          ' style="font-size:12px;font-weight:700;paint-order:stroke;stroke:var(--color-surface);stroke-width:4px">' + e[2] + "</text>";
      }
    }
    for (var k in o.nodes) if (Object.prototype.hasOwnProperty.call(o.nodes, k)) s += nodeSvg(o.nodes[k][0], o.nodes[k][1], k, (o.hn || []).indexOf(k) >= 0);
    return s + "</svg>";
  }
  function parts(list) {
    return '<ol class="et-parts">' + list.map(function (x) {
      return "<li>" + x[0] + ' <span class="et-p">(' + x[1] + "p)</span></li>";
    }).join("") + "</ol>";
  }
  function sensor(items) {
    return '<div class="callout sensor"><div class="lbl">Slik ville poengene trolig blitt gitt (vårt anslag)</div><ul>' +
      items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>";
  }
  function fig(html, cap) {
    return '<div class="exam-fig">' + html + (cap ? '<div class="muted small">' + cap + "</div>" : "") + "</div>";
  }
  var _ = "";

  /* ======================================================================
     1. Heap: RemoveMin for hånd
     ====================================================================== */
  var H0 = [2, 5, 3, 9, 6, 4, 8, 12, 10, 7];
  var mHeap = {
    id: "mock-heap-removemin", tema: "heap", operasjon: "RemoveMin i min-heap (array)",
    sannsynlighet: "høy",
    begrunnelse: "RemoveMin står i forelesning 04_prioritetskoer, ukesoppgaver 04_prioritetskoeer (bubbleDown) og innlevering 3, og foreleseren gjennomgår boblingen nedover i detalj. Den ble spurt i Del 1 H2021 (6p), men aldri som standardoppgave. Heap-innsetting var standardoppgaven H2023, så speilbildet er et naturlig neste valg.",
    year: "Mock", title: "RemoveMin i en min-heap", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>En min-heap med n = 10 elementer er lagret i et array (0-indeksert):</p>" +
      states([["A", H0]]) +
      parts([
        ["Tegn heapen som et binærtre.", 1],
        ["Utfør <span class=\"mono\">RemoveMin</span> tre ganger etter hverandre. Oppgi hvilket element som returneres, hvilke bytter som gjøres, og hvordan arrayet ser ut etter hvert kall.", 4],
        ["Skriv pseudokode for <span class=\"mono\">RemoveMin</span> på array-representasjonen. Bruk 2i + 1 og 2i + 2 for barna til indeks i.", 3],
        ["Oppgi kjøretiden til <span class=\"mono\">RemoveMin</span> i O-notasjon, og begrunn svaret.", 2]
      ]),
    losning: [
      "<b>(a)</b> Rot er A[0]. Barna til indeks i ligger på 2i + 1 og 2i + 2, så vi fyller nivå for nivå fra venstre:" +
        fig(heapTree(H0, [], "Min-heapen før RemoveMin")),
      "<b>(b) Kall 1.</b> Returner x = 2. Flytt det siste elementet (7) opp i roten, så heapen har 9 elementer: [7, 5, 3, 9, 6, 4, 8, 12, 10]. " +
        "Bobl nedover: barna til 7 er 5 og 3, minste er 3, bytt (indeks 0 ↔ 2). Barna til 7 på indeks 2 er 4 og 8, minste er 4, bytt (2 ↔ 5). Indeks 5 har ingen barn innenfor heapen, så vi stopper." +
        states([["etter kall 1", [3, 5, 4, 9, 6, 7, 8, 12, 10], [0, 2, 5]]]),
      "<b>Kall 2.</b> Returner x = 3. Siste element 10 flyttes til roten: [10, 5, 4, 9, 6, 7, 8, 12]. Barna er 5 og 4, bytt med 4 (0 ↔ 2). Barna til indeks 2 er 7 og 8, bytt med 7 (2 ↔ 5). Ferdig." +
        states([["etter kall 2", [4, 5, 7, 9, 6, 10, 8, 12], [0, 2, 5]]]),
      "<b>Kall 3.</b> Returner x = 4. Siste element 12 flyttes til roten: [12, 5, 7, 9, 6, 10, 8]. Barna er 5 og 7, bytt med 5 (0 ↔ 1). Barna til indeks 1 er 9 og 6, bytt med 6 (1 ↔ 4). Indeks 4 har ingen barn (2·4 + 1 = 9 ≥ 6). Ferdig." +
        states([["etter kall 3", [5, 6, 7, 9, 12, 10, 8], [0, 1, 4]]]) +
        fig(heapTree([5, 6, 7, 9, 12, 10, 8], [0, 1, 4], "Heapen etter tre RemoveMin"), "Uthevet: stien 12 boblet ned langs."),
      "<b>(c)</b> Pseudokode. Vi tar ut roten, flytter siste element opp og bobler det ned mot det <i>minste</i> barnet så lenge det er større enn barnet:" +
        pc("RemoveMin(A)", "En min-heap A med n ≥ 1 elementer", "Det minste elementet; A er en heap med n − 1 elementer", [
          "x ← A[0]",
          "A[0] ← A[n − 1]",
          "i ← 0",
          "while 2i + 1 < n − 1 do",
          "  j ← 2i + 1",
          "  if j + 1 < n − 1 and A[j + 1] < A[j] then",
          "    j ← j + 1",
          "  if A[i] ≤ A[j] then",
          "    return x",
          "  swap A[i] and A[j]",
          "  i ← j",
          "return x"
        ]) +
        "<p class=\"small muted\">Grensen er n − 1 og ikke n fordi plassen A[n − 1] nettopp er tømt: heapen har nå bare indeksene 0 … n − 2.</p>",
      "<b>(d)</b> O(log n). En heap er et komplett binærtre, så høyden er ⌊log n⌋. Hver runde i løkka gjør konstant arbeid (to sammenligninger og ett bytte) og flytter i ett nivå ned, så det blir høyst ⌊log n⌋ runder."
    ],
    kjerne:
      "<p><b>Kjernen:</b> ta ut roten, flytt det <i>siste</i> elementet opp, og bobl det ned mot det <i>minste</i> barnet til begge barna er større eller like. Kjøretiden er O(log n) fordi treet er komplett.</p>" +
      sensor([
        "(a) 1p for riktig tre (rekkefølge nivå for nivå).",
        "(b) Ca. 1p per kall pluss 1p for at byttene er vist. Én feil i et tidlig kall som følges konsekvent videre trekkes bare én gang.",
        "(c) 1p for at siste element flyttes til roten, 1p for valg av minste barn, 1p for stoppkriteriet. Bare en beskrivelse i ord gir typisk rundt halvparten.",
        "(d) 1p for O(log n), 1p for begrunnelsen med høyden. Mangler kjøretid helt, trekkes det."
      ]),
    tips: [
      "<b>Felle:</b> å bytte med det første barnet du ser i stedet for det minste. Da kan et større element havne over et mindre, og heap-egenskapen brytes.",
      "<b>Felle:</b> å flytte opp et av barna til roten i stedet for det siste elementet. Da blir treet ikke lenger komplett.",
      "<b>Felle:</b> å glemme at heapen krymper. Etter første kall har arrayet 9 plasser, ikke 10.",
      "<b>Variant:</b> sensor kan blande inn <span class=\"mono\">Insert</span>. Setter du inn 1 i heapen etter kall 3, bobler 1 opp fra indeks 7 via 3 og 1 til roten: [1, 5, 7, 6, 12, 10, 8, 9]."
    ],
    eli5: "5-åring: Den minste står øverst. Når den går, hopper den nederste opp på toppen og sklir ned forbi de som er mindre, til den står riktig.",
    side: { page: "03-heap.html", fane: "removemin" }
  };

  /* ======================================================================
     2. Linear probing: sletting med «tett hullet»
     ====================================================================== */
  var P0 = [29, 31, 42, 11, 23, 51, 70, _, _, 19];
  var mProbe = {
    id: "mock-probing-slett", tema: "hashing", operasjon: "Linear probing: sletting som tetter hullet",
    sannsynlighet: "høy",
    begrunnelse: "Begge slettestrategiene (markér som slettet, og tett hullet) står i forelesning 08_hashing og notatet Hashing.html, og innlevering 3 ber om Linear probing. Innsetting med probing var standardoppgaven H2022, og H2025 tok Separate chaining. Sletting er den delen som ennå ikke er spurt, og den er lett å lage poeng av.",
    year: "Mock", title: "Linear probing: sletting", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>En hashtabell bruker Linear probing med N = 10 plasser og hashfunksjon h(k) = k mod 10. Tabellen er tom, og vi setter inn nøklene 31, 42, 11, 23, 51, 19, 29, 70 i denne rekkefølgen (ingen rehashing).</p>" +
      parts([
        ["Vis tabellen etter alle innsettingene, og oppgi hvilke plasser hver av nøklene 11, 23, 51, 29 og 70 sjekker.", 2],
        ["Slett 31 med strategien som tetter hullet (ingen merker). Vis hvilke nøkler som flyttes, og tabellen etterpå.", 3],
        ["Slett deretter 19 på samme måte. Vis tabellen etterpå.", 2],
        ["Forklar med et konkret søk hvorfor det er feil å bare sette plassen til 31 tilbake til null.", 1],
        ["Skriv pseudokode for slettingen, og oppgi kjøretiden.", 2]
      ]),
    losning: [
      "<b>(a)</b> 31 → 1, 42 → 2. 11 har hjemmeplass 1: sjekker 1, 2, 3 og lander på 3. 23: sjekker 3, 4 → 4. 51: sjekker 1, 2, 3, 4, 5 → 5. 19 → 9. 29: sjekker 9, 0 → 0 (rundt kanten). 70: sjekker 0, 1, 2, 3, 4, 5, 6 → 6." +
        states([["tabell", P0]]) +
        "<p class=\"small muted\">Hjemmeplasser: 29→9, 31→1, 42→2, 11→1, 23→3, 51→1, 70→0, 19→9.</p>",
      "<b>(b) Slett 31.</b> Plass 1 blir et hull. Vi går videre fra hullet og ser på hver nøkkel til vi treffer en tom plass. En nøkkel på plass j kan flyttes inn i hullet i bare hvis hjemmeplassen dens <i>ikke</i> ligger mellom i (ikke med) og j (med), regnet rundt tabellen." +
        tab(["plass", "nøkkel", "hjem", "hull i", "flytt?"], [
          [2, 42, 2, "1", "nei, hjem 2 ligger i (1, 2]"],
          [3, 11, 1, "1", { v: "ja → plass 1, hull på 3", hl: true }],
          [4, 23, 3, "3", { v: "ja → plass 3, hull på 4", hl: true }],
          [5, 51, 1, "4", { v: "ja → plass 4, hull på 5", hl: true }],
          [6, 70, 0, "5", { v: "ja → plass 5, hull på 6", hl: true }],
          [7, "tom", "", "6", "stopp"]
        ]) +
        states([["etter slett 31", [29, 11, 42, 23, 51, 70, _, _, _, 19], [1, 3, 4, 5]]]),
      "<b>(c) Slett 19.</b> Hull på 9. Plass 0: 29 har hjem 9, som ikke ligger i (9, 0], så 29 flyttes til 9 og hullet går til 0. Fra hull 0: 11 (hjem 1), 42 (hjem 2), 23 (hjem 3) og 51 (hjem 1) har alle hjemmeplass i (0, j], så de blir stående. 70 på plass 5 har hjem 0, som ikke ligger i (0, 5], så 70 flyttes til 0. Plass 6 er tom: stopp." +
        states([["etter slett 19", [70, 11, 42, 23, 51, _, _, _, _, 29], [0, 5, 9]]]) +
        "<p>Kontroll: søk etter 70 starter på 0 og finner den med én sammenligning. Søk etter 51 sjekker 1, 2, 3, 4 og finner den på plass 4.</p>",
      "<b>(d)</b> Setter vi bare plass 1 til null etter (a), stopper søket etter 11 med en gang: det starter på hjemmeplassen 1, ser en tom plass og svarer «finnes ikke», selv om 11 ligger på plass 3. Det samme skjer med 51. Søk stopper på første tomme plass, så et hull midt i en klynge gjør nøklene bak hullet usynlige.",
      "<b>(e)</b> Pseudokode for sletting med «tett hullet»:" +
        pc("Remove(A, k)", "En tabell A med N plasser (Linear probing) og en nøkkel k", "k er fjernet, og alle andre nøkler kan fortsatt finnes", [
          "i ← Hash(k) mod N",
          "while A[i] ≠ null do",
          "  if A[i].key = k then",
          "    n ← n − 1",
          "    A[i] ← null",
          "    FillHole(A, i)",
          "    return",
          "  i ← (i + 1) mod N"
        ]) +
        pc("FillHole(A, i)", "", "", [
          "s ← 1",
          "while A[(i + s) mod N] ≠ null do",
          "  j ← (i + s) mod N",
          "  h ← Hash(A[j].key) mod N",
          "  if not (0 < (h − i) mod N ≤ s) then   // hjem ligger ikke i (i, j]",
          "    A[i] ← A[j]",
          "    A[j] ← null",
          "    FillHole(A, j)",
          "    return",
          "  s ← s + 1"
        ]) +
        "<p>Kjøretid: forventet O(1) når Load factor n/N holdes lav, fordi klyngene da er korte. I verste fall er hele tabellen én klynge, og da blir det O(n).</p>"
    ],
    kjerne:
      "<p><b>Kjernen:</b> et søk stopper på første tomme plass. Når du sletter, må du derfor fylle hullet med en nøkkel lenger ut i klyngen som ellers ville blitt «gjemt», og fortsette til klyngen slutter. En nøkkel blir stående hvis hjemmeplassen dens ligger mellom hullet og der den står.</p>" +
      sensor([
        "(a) 2p for riktig tabell. Feil rundt kanten (29 og 70) gir typisk 1p.",
        "(b) 1p for at 42 blir stående, 1p for at 11, 23 og 51 flyttes, 1p for at 70 også flyttes og sluttabellen er riktig.",
        "(c) 1p for at 29 går rundt kanten til plass 9, 1p for at 70 flyttes til 0.",
        "(d) 1p for et konkret søk som feiler.",
        "(e) 1p for pseudokode som flytter riktig og stopper på tom plass, 1p for kjøretiden med forventet/verste tilfelle."
      ]),
    tips: [
      "<b>Felle:</b> å flytte <i>alle</i> nøklene ett hakk tilbake. 42 står på hjemmeplassen sin og må ikke flyttes.",
      "<b>Felle:</b> å stoppe etter første flytting. Hullet vandrer videre, og du må fortsette til en tom plass.",
      "<b>Felle:</b> å glemme at tabellen går rundt. 29 står på plass 0, men hører hjemme på 9.",
      "<b>Husk:</b> kurset har også strategien «markér plassen som slettet». Står det ikke hvilken strategi du skal bruke, si hvilken du velger. Kvadratisk probing og dobbel hashing er ikke pensum."
    ],
    eli5: "5-åring: Når en går ut av køen, må de som sto bak og egentlig ville stå lenger fram, rykke opp, ellers tror vakta at køen er slutt.",
    side: { page: "05-hashing.html", fane: "probing" }
  };

  /* ======================================================================
     3. AVL: innsetting med rotasjoner og sletting
     ====================================================================== */
  var mAvl = {
    id: "mock-avl", tema: "traer", operasjon: "AVL-tre: innsetting og sletting med rotasjoner",
    sannsynlighet: "høy",
    begrunnelse: "AVL er hovedtemaet i forelesning 03_balanserte_soketraer og ukesoppgaver 03_balanserte_soeketraer, og innlevering 3 bruker det. Det har kommet hvert år (H2020 9p innsetting, H2022 Del 1 6p, H2025 Anti-AVL), men aldri som standardoppgaven. Sletting med rebalansering er ikke spurt.",
    year: "Mock", title: "AVL-tre: innsetting og sletting", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>Sett inn 5, 9, 14, 3, 7, 6, 4 i denne rekkefølgen i et tomt AVL-tre. Bruk kursets definisjoner: høyden til en løvnode er 0, høyden til null er −1, og balansefaktoren er høyden til venstre subtre minus høyden til høyre subtre.</p>" +
      parts([
        ["Vis treet hver gang en innsetting fører til rotasjon, før og etter, og navngi rotasjonene (LeftRotate/RightRotate og hvilken node de gjøres på).", 4],
        ["Tegn det ferdige treet, og oppgi høyde og balansefaktor for hver node.", 2],
        ["Slett 7 med kursets Remove (en node med to barn erstattes med den minste i høyre subtre). Vis treet etter slettingen og eventuell rebalansering.", 2],
        ["Oppgi kjøretiden for innsetting og sletting i et AVL-tre med n noder, og begrunn.", 2]
      ]),
    losning: [
      "<b>Innsetting av 14.</b> Etter 5 og 9 har vi en kjede 5 → 9. Med 14 blir balansefaktoren til 5 lik −2, og høyre barn 9 har −1 (samme retning). Det er et høyre-høyre-tilfelle: én <span class=\"mono\">LeftRotate(5)</span>." +
        '<div class="exam-figs">' + fig(tree([5, null, [9, null, [14]]], [5]), "før: bf(5) = −2") + fig(tree([9, [5], [14]], [9]), "etter LeftRotate(5)") + "</div>",
      "<b>3 og 7</b> gir ingen rotasjon: 9(5(3, 7), 14) har balansefaktor +1 i roten.",
      "<b>Innsetting av 6.</b> 6 havner som venstre barn av 7. Da får 5 balansefaktor −1 og høyde 2, og roten 9 får +2. Venstre barn 5 heller mot høyre (bf −1), så det er et venstre-høyre-tilfelle: først <span class=\"mono\">LeftRotate(5)</span>, så <span class=\"mono\">RightRotate(9)</span>." +
        '<div class="exam-figs">' +
        fig(tree([9, [5, [3], [7, [6]]], [14]], [9]), "før: bf(9) = +2, bf(5) = −1") +
        fig(tree([9, [7, [5, [3], [6]]], [14]], [7]), "etter LeftRotate(5)") +
        fig(tree([7, [5, [3], [6]], [9, null, [14]]], [7]), "etter RightRotate(9)") + "</div>",
      "<b>Innsetting av 4</b> gir ingen rotasjon: 4 blir høyre barn av 3, og alle balansefaktorer holder seg mellom −1 og 1. Totalt ble det tre enkle rotasjoner (én for 14, to for 6).",
      "<b>(b)</b> Det ferdige treet:" +
        fig(tree([7, [5, [3, null, [4]], [6]], [9, null, [14]]])) +
        tab(["node", "høyde", "balansefaktor"], [
          [7, 3, "+1"], [5, 2, "+1"], [3, 1, "−1"], [9, 1, "−1"], [4, 0, 0], [6, 0, 0], [14, 0, 0]
        ]),
      "<b>(c) Slett 7.</b> 7 har to barn. Den minste i høyre subtre er 9, så 9 kopieres opp i roten, og 9 slettes fra høyre subtre. Der har 9 bare ett barn (14), så 14 tar plassen. Nå har roten venstre høyde 2 og høyre høyde 0, altså balansefaktor +2. Venstre barn 5 har +1 (ikke under 0), så én <span class=\"mono\">RightRotate</span> på roten holder." +
        '<div class="exam-figs">' +
        fig(tree([9, [5, [3, null, [4]], [6]], [14]], [9]), "etter kopiering: bf(9) = +2") +
        fig(tree([5, [3, null, [4]], [9, [6], [14]]], [5]), "etter RightRotate(9)") + "</div>" +
        "<p>Nå er alle balansefaktorer 0, bortsett fra 3 med −1, og høyden er 2.</p>" +
        pc("Balance(v)", "En node v der subtrærne er AVL-trær og høyden er oppdatert", "Roten i det balanserte subtreet", [
          "if BalanceFactor(v) < −1 then",
          "  if BalanceFactor(v.right) > 0 then",
          "    v.right ← RightRotate(v.right)",
          "  return LeftRotate(v)",
          "if BalanceFactor(v) > 1 then",
          "  if BalanceFactor(v.left) < 0 then",
          "    v.left ← LeftRotate(v.left)",
          "  return RightRotate(v)",
          "return v"
        ]) +
        "<p class=\"small muted\">Insert og Remove gjør først vanlig BST-arbeid rekursivt, og på vei opp kaller hver node SetHeight(v) og return Balance(v).</p>",
      "<b>(d)</b> Begge er O(log n). Et AVL-tre har høyde O(log n). Innsetting og sletting går én sti ned og én sti opp, og på hver node gjøres SetHeight og eventuelt en rotasjon, som begge er O(1)."
    ],
    kjerne:
      "<p><b>Kjernen:</b> finn den laveste noden med balansefaktor +2 eller −2, og se hvilken vei barnet heller. Samme retning gir én rotasjon, motsatt retning gir to. Ved sletting gir et barn med balansefaktor 0 én rotasjon.</p>" +
      sensor([
        "(a) 2p per rotasjonssituasjon: 1p for riktig tre, 1p for riktig navn på rotasjonene.",
        "(b) 1p for treet, 1p for høyder og balansefaktorer (høyde i kanter, løvnode = 0).",
        "(c) 1p for riktig etterfølger og kopiering, 1p for riktig rotasjon og sluttre.",
        "(d) 1p for O(log n), 1p for begrunnelsen med høyden."
      ]),
    tips: [
      "<b>Felle:</b> å telle høyde i noder (løvnode = 1). Kurset teller kanter: løvnode 0, null −1.",
      "<b>Felle:</b> å rotere på roten når det er en lavere node som er ubalansert. Gå nedenfra og opp, og rett den første du møter.",
      "<b>Felle:</b> å gjøre én rotasjon i et sikksakk-tilfelle (som med 6). Da blir treet bare speilvendt og fortsatt ubalansert.",
      "<b>Husk:</b> bruker du den største i venstre subtre (forgjengeren) ved sletting, får du et annet, også gyldig tre: 6(4(3, 5), 9(_, 14)) etter LeftRotate(3) og RightRotate(5). Si i så fall hvilken variant du bruker; kursets Remove tar den minste i høyre."
    ],
    eli5: "5-åring: Når treet blir for tungt på én side, vipper vi det rundt et punkt så det blir like høyt på begge sider igjen.",
    side: { page: "04-traer.html", fane: "avl" }
  };

  /* ======================================================================
     4. BST: Remove i alle tre tilfeller
     ====================================================================== */
  var mBst = {
    id: "mock-bst-remove", tema: "traer", operasjon: "Binært søketre: Remove (løvnode, ett barn, to barn)",
    sannsynlighet: "høy",
    begrunnelse: "Remove med de tre tilfellene gjennomgås i forelesning 03_balanserte_soketraer, og ukesoppgaver 03_balanserte_soeketraer ber om sletting. Det er grunnlaget for AVL-sletting og har aldri vært standardoppgave. Rekursiv trepseudokode gir poeng hvert år.",
    year: "Mock", title: "Sletting i binært søketre", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>Sett inn 50, 30, 80, 20, 40, 60, 90, 35, 70, 65 i denne rekkefølgen i et tomt binært søketre (uten balansering).</p>" +
      parts([
        ["Tegn treet, og oppgi høyden.", 2],
        ["Slett 35, så 70, så 50, så 30 med kursets Remove (to barn: erstatt med den minste i høyre subtre). Tegn treet etter hver sletting, og si hvilket tilfelle det er.", 4],
        ["Skriv pseudokode for <span class=\"mono\">Remove(v, x)</span>.", 3],
        ["Oppgi kjøretiden til Remove uttrykt med høyden h, og i verste fall med n.", 1]
      ]),
    losning: [
      "<b>(a)</b> Hver nøkkel går til venstre hvis den er mindre, ellers til høyre. Høyden er 4 (stien 50 → 80 → 60 → 70 → 65)." +
        fig(tree([50, [30, [20], [40, [35]]], [80, [60, null, [70, [65]]], [90]]])),
      "<b>Slett 35</b>, en løvnode: den fjernes bare. Høyden er fortsatt 4." +
        fig(tree([50, [30, [20], [40]], [80, [60, null, [70, [65]]], [90]]])),
      "<b>Slett 70</b>, ett barn: barnet 65 tar plassen, så 60 får 65 som høyre barn. Høyden blir 3." +
        fig(tree([50, [30, [20], [40]], [80, [60, null, [65]], [90]]], [65])),
      "<b>Slett 50</b>, to barn: den minste i høyre subtre er 60 (gå til høyre én gang, så til venstre så langt det går). 60 kopieres opp i roten. Så slettes 60 fra høyre subtre, og der har den ett barn, så 65 tar plassen. Høyden blir 2." +
        fig(tree([60, [30, [20], [40]], [80, [65], [90]]], [60, 65])),
      "<b>Slett 30</b>, to barn: den minste i høyre subtre er 40, som er en løvnode. 40 kopieres opp og den gamle løvnoden fjernes." +
        fig(tree([60, [40, [20]], [80, [65], [90]]], [40])) +
        "<p>Kontroll med preorder: 60, 40, 20, 80, 65, 90.</p>",
      "<b>(c)</b> Pseudokode (returnerer roten i det nye subtreet):" +
        pc("Remove(v, x)", "Roten v i et binært søketre og en verdi x", "Roten i treet der x er fjernet", [
          "if v = null then",
          "  return null",
          "if x < v.element then",
          "  v.left ← Remove(v.left, x)",
          "  return v",
          "if x > v.element then",
          "  v.right ← Remove(v.right, x)",
          "  return v",
          "if v.left = null then",
          "  return v.right",
          "if v.right = null then",
          "  return v.left",
          "u ← FindMin(v.right)",
          "v.element ← u.element",
          "v.right ← Remove(v.right, u.element)",
          "return v"
        ]) +
        pc("FindMin(v)", "", "", [
          "while v.left ≠ null do",
          "  v ← v.left",
          "return v"
        ]) +
        "<p class=\"small muted\">Linjene 10–13 dekker både løvnoden (begge barn null, returnerer null) og ett barn.</p>",
      "<b>(d)</b> O(h): vi går én sti ned for å finne x, og eventuelt én sti videre ned for å finne den minste i høyre subtre. Treet er ubalansert, så h kan bli n − 1, og da er Remove O(n)."
    ],
    kjerne:
      "<p><b>Kjernen:</b> tre tilfeller. Løvnode: fjern. Ett barn: barnet tar plassen. To barn: kopier inn den minste i høyre subtre og slett den derfra (den har høyst ett barn). Kjøretiden er O(h).</p>" +
      sensor([
        "(a) 1p for treet, 1p for høyden målt i kanter.",
        "(b) 1p per sletting. To-barn-tilfellene krever riktig etterfølger og at etterfølgerens eget barn (65) blir med.",
        "(c) 1p for søket ned, 1p for null/ett barn, 1p for to barn med FindMin og rekursiv sletting.",
        "(d) 1p for O(h) og at det blir O(n) for et skjevt tre."
      ]),
    tips: [
      "<b>Felle:</b> å glemme barnet til etterfølgeren. Når 60 flyttes opp, må 65 henges på der 60 var.",
      "<b>Felle:</b> å velge en vilkårlig node i høyre subtre. Det må være den minste, ellers brytes søketre-egenskapen.",
      "<b>Felle:</b> å svare O(log n). Treet er ikke balansert, så det er O(h), som kan bli O(n).",
      "<b>Husk:</b> det er lov å bruke den største i venstre subtre, men si det. Kursets versjon tar den minste i høyre."
    ],
    eli5: "5-åring: Når noen i midten går ut av rekka, henter vi den neste i størrelse og setter den på plassen, så rekkefølgen fortsatt stemmer.",
    side: { page: "04-traer.html", fane: "bst" }
  };

  /* ======================================================================
     5. BuildMaxHeap og Heapsort
     ====================================================================== */
  var mHs = {
    id: "mock-buildheap-heapsort", tema: "heap", operasjon: "BuildMaxHeap og Heapsort for hånd",
    sannsynlighet: "middels",
    begrunnelse: "BubbleDown, BuildMaxHeap og HeapSort er pensum med egen pseudokode i forelesning 09_litt_mer_sortering. Heapsort har bare kommet som sant/usant og kjøretidsspørsmål, aldri som håndkjøring. Det kombinerer heap og sortering i én oppgave, men den finnes ikke i ukesoppgavene, så den står svakere enn RemoveMin.",
    year: "Mock", title: "BuildMaxHeap og Heapsort", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>Vi skal sortere arrayet A = [4, 10, 3, 5, 1, 8, 9, 2] (n = 8) stigende med kursets Heapsort, som først bygger en max-heap.</p>" +
      parts([
        ["Kjør <span class=\"mono\">BuildMaxHeap(A, n)</span>. Vis arrayet etter hvert kall på BubbleDown som endrer noe.", 3],
        ["Kjør resten av Heapsort. Vis arrayet etter hver runde i løkka.", 4],
        ["Skriv pseudokode for HeapSort, med BubbleDown og BuildMaxHeap.", 2],
        ["Oppgi kjøretiden, og si om Heapsort er stabil og in-place.", 1]
      ]),
    losning: [
      "<b>(a)</b> BuildMaxHeap kaller BubbleDown for i = ⌊8/2⌋ = 4 ned til 0. For i = 4 og i = 3 skjer ingenting (indeks 4 har ingen barn, og 5 på indeks 3 er større enn barnet 2). For i = 1 er 10 større enn barna 5 og 1." +
        states([
          ["start", [4, 10, 3, 5, 1, 8, 9, 2]],
          ["i = 2: 3 ↔ 9", [4, 10, 9, 5, 1, 8, 3, 2], [2, 6]],
          ["i = 0: 4 ↔ 10, 4 ↔ 5", [10, 5, 9, 4, 1, 8, 3, 2], [0, 1, 3]]
        ]) +
        fig(heapTree([10, 5, 9, 4, 1, 8, 3, 2], [], "Max-heapen etter BuildMaxHeap")),
      "<b>(b)</b> Hver runde bytter roten (det største) med A[i], og bobler den nye roten ned i de i første plassene. Den sorterte delen bakerst er uthevet." +
        states([
          ["i = 7", [9, 5, 8, 4, 1, 2, 3, 10], [7]],
          ["i = 6", [8, 5, 3, 4, 1, 2, 9, 10], [6, 7]],
          ["i = 5", [5, 4, 3, 2, 1, 8, 9, 10], [5, 6, 7]],
          ["i = 4", [4, 2, 3, 1, 5, 8, 9, 10], [4, 5, 6, 7]],
          ["i = 3", [3, 2, 1, 4, 5, 8, 9, 10], [3, 4, 5, 6, 7]],
          ["i = 2", [2, 1, 3, 4, 5, 8, 9, 10], [2, 3, 4, 5, 6, 7]],
          ["i = 1", [1, 2, 3, 4, 5, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7]],
          ["i = 0", [1, 2, 3, 4, 5, 8, 9, 10], [0, 1, 2, 3, 4, 5, 6, 7]]
        ]) +
        "<p>Eksempel på én runde, i = 7: bytt 10 og 2 → [2, 5, 9, 4, 1, 8, 3 | 10]. Bobl 2 ned: større barn er 9 (bytt), så 8 (bytt) → [9, 5, 8, 4, 1, 2, 3 | 10].</p>",
      "<b>(c)</b> Pseudokode:" +
        pc("BubbleDown(A, i, n)", "", "", [
          "largest ← i",
          "if 2i + 1 < n and A[2i + 1] > A[largest] then",
          "  largest ← 2i + 1",
          "if 2i + 2 < n and A[2i + 2] > A[largest] then",
          "  largest ← 2i + 2",
          "if i ≠ largest then",
          "  swap A[i] and A[largest]",
          "  BubbleDown(A, largest, n)"
        ]) +
        pc("BuildMaxHeap(A, n)", "", "", [
          "for i ← ⌊n/2⌋ down to 0 do",
          "  BubbleDown(A, i, n)"
        ]) +
        pc("HeapSort(A)", "Et array A med n elementer", "A sortert stigende", [
          "n ← |A|",
          "BuildMaxHeap(A, n)",
          "for i ← n − 1 down to 0 do",
          "  swap A[0] and A[i]",
          "  BubbleDown(A, 0, i)",
          "return A"
        ]) +
        "<p class=\"small muted\">BubbleDown får i som størrelse: plassene fra i og bakover er allerede sortert og skal ikke røres.</p>",
      "<b>(d)</b> BuildMaxHeap er O(n), og hver av de n rundene bobler ned på O(log n), så Heapsort er O(n log n) i alle tilfeller. Den er in-place (bare bytter i A), men ikke stabil: byttet med roten kan hoppe like elementer forbi hverandre."
    ],
    kjerne:
      "<p><b>Kjernen:</b> bygg en max-heap nedenfra (fra ⌊n/2⌋ ned til 0), og flytt så det største bakerst, ett om gangen, mens heapen krymper. Kjøretiden er O(n log n), in-place og ikke stabil.</p>" +
      sensor([
        "(a) 1p for riktig startindeks og retning, 2p for riktige mellomtilstander.",
        "(b) 4p for rundene, ca. 1p per to runder. En tidlig feil som følges konsekvent trekkes én gang.",
        "(c) 1p for BubbleDown mot største barn, 1p for løkka som bytter og krymper heapen.",
        "(d) 1p for O(n log n) med riktig stabil/in-place."
      ]),
    tips: [
      "<b>Felle:</b> å bygge heapen ved å sette inn ett og ett element. Det gir riktig svar på størrelse, men andre mellomtilstander enn BuildMaxHeap, og sensor ser etter kursets metode.",
      "<b>Felle:</b> å boble ned i hele arrayet i stedet for bare de i første plassene. Da drar du de sorterte elementene tilbake inn i heapen.",
      "<b>Felle:</b> å bruke min-heap. For stigende sortering med denne metoden trenger du en max-heap.",
      "<b>Husk:</b> at BuildMaxHeap er O(n), kan du bare oppgi; beviset er ikke pensum."
    ],
    eli5: "5-åring: Først stiller vi den største øverst. Så setter vi den bakerst i rekka, finner den nest største, og sånn fortsetter vi.",
    side: { page: "03-heap.html", fane: "heapsort" }
  };

  /* ======================================================================
     6. Rehashing med Linear probing
     ====================================================================== */
  var mRehash = {
    id: "mock-rehash", tema: "hashing", operasjon: "Innsetting med rehashing (Load factor)",
    sannsynlighet: "middels",
    begrunnelse: "Rehashing og Load factor står i forelesning 08_hashing, notatet Hashing.html (ensurecapacity) og ukesoppgaver 08_hashing. H2024 spurte om rehashing som begrep (Python-ordbok), men aldri som håndkjøring. Kombinert med probing er det en naturlig utvidelse av standardoppgaven fra H2022.",
    year: "Mock", title: "Linear probing med rehashing", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>En hashtabell bruker Linear probing og h(k) = k mod N. Tabellen starter med N = 4 plasser. <i>Før</i> hver innsetting sjekkes Load factor n/N: er den 0,75 eller mer, dobles N, og alle nøklene settes inn på nytt i den nye tabellen i rekkefølgen de står i den gamle (fra plass 0 og oppover).</p>" +
      "<p>Sett inn 6, 13, 9, 21, 17, 30, 14 i denne rekkefølgen.</p>" +
      parts([
        ["Vis tabellen rett før første rehashing.", 2],
        ["Vis tabellen etter første rehashing, og etter at 21, 17 og 30 er satt inn.", 3],
        ["Vis andre rehashing og tabellen etter at 14 er satt inn.", 2],
        ["Skriv pseudokode for Insert med sjekken av Load factor.", 2],
        ["Hvorfor er innsetting likevel forventet amortisert O(1), selv om én rehashing koster O(n)?", 1]
      ]),
    losning: [
      "<b>(a)</b> N = 4: 6 → 2, 13 → 1, 9 → 1 er opptatt, 2 er opptatt, 3 er ledig. Nå er n = 3 og n/N = 0,75." +
        states([["N = 4", [_, 13, 6, 9]]]),
      "<b>(b)</b> Før 21: 3/4 ≥ 0,75, så N blir 8. Gammel rekkefølge er 13, 6, 9: 13 mod 8 = 5, 6 mod 8 = 6, 9 mod 8 = 1." +
        states([["rehashet, N = 8", [_, 9, _, _, _, 13, 6, _], [1, 5, 6]]]) +
        "<p>21 mod 8 = 5: opptatt, 6 opptatt, 7 ledig. 17 mod 8 = 1: opptatt, 2 ledig. Load factor er nå 5/8, under 0,75. 30 mod 8 = 6: opptatt, 7 opptatt, 0 ledig (rundt kanten).</p>" +
        states([["N = 8", [30, 9, 17, _, _, 13, 6, 21], [0, 2, 7]]]),
      "<b>(c)</b> Før 14: n/N = 6/8 = 0,75, så N blir 16. Gammel rekkefølge er 30, 9, 17, 13, 6, 21, som gir 30 → 14, 9 → 9, 17 → 1, 13 → 13, 6 → 6, 21 → 5. Så kommer 14 mod 16 = 14, som er opptatt, og 14 havner på 15." +
        states([["N = 16", [_, 17, _, _, _, 21, 6, _, _, 9, _, _, _, 13, 30, 14], [15]]]) +
        "<p>Til slutt er n = 7 og N = 16.</p>",
      "<b>(d)</b> Pseudokode:" +
        pc("Insert(A, k, v)", "En tabell A med N plasser og n nøkler, og et par (k, v)", "(k, v) ligger i A", [
          "EnsureCapacity(A)",
          "i ← Hash(k) mod N",
          "while A[i] ≠ null do",
          "  if A[i].key = k then",
          "    A[i] ← (k, v)",
          "    return",
          "  i ← (i + 1) mod N",
          "A[i] ← (k, v)",
          "n ← n + 1"
        ]) +
        pc("EnsureCapacity(A)", "", "", [
          "if n / N < 0.75 then",
          "  return",
          "B ← A",
          "N ← 2 · N",
          "A ← new array of size N   // alle plasser er null",
          "n ← 0",
          "for each (k, v) in B do   // fra plass 0 og oppover, tomme plasser hoppes over",
          "  Insert(A, k, v)"
        ]),
      "<b>(e)</b> N dobles hver gang, så etter en rehashing med n nøkler kan vi sette inn omtrent n nye før neste (her: rehashing ved n = 3, så tre nye, så neste rehashing ved n = 6). Kostnaden O(n) fordeles på disse innsettingene, og det blir O(1) ekstra per innsetting i snitt. Søk og innsetting ellers er forventet O(1) fordi Load factor holdes under 0,75. Verste tilfelle er fortsatt O(n)."
    ],
    kjerne:
      "<p><b>Kjernen:</b> ved rehashing får alle nøklene ny hjemmeplass, fordi N i k mod N endres. Sett dem inn på nytt én og én, i den rekkefølgen oppgaven sier, med vanlig probing.</p>" +
      sensor([
        "(a) 2p for riktig tabell før rehashing.",
        "(b) 1p for riktig rehashet tabell, 2p for riktige innsettinger etterpå (rundt kanten for 30).",
        "(c) 1p for at rehashing skjer før 14, 1p for sluttabellen.",
        "(d) 1p for sjekken av Load factor og dobling, 1p for at alle nøkler settes inn på nytt.",
        "(e) 1p for dobling og amortisering."
      ]),
    tips: [
      "<b>Felle:</b> å kopiere nøklene til samme indeks i den nye tabellen. Hjemmeplassen endres når N endres.",
      "<b>Felle:</b> å rehashe etter innsettingen i stedet for før, når oppgaven sier før. Les hvordan grensen er definert.",
      "<b>Felle:</b> å øke N med en fast mengde. Da blir rehashing for hyppig, og amortisert O(1) gjelder ikke lenger.",
      "<b>Husk:</b> kurset sier at en god Load factor for hashmaps antagelig ligger mellom 1/2 og 3/4, men at den bør finnes ved å prøve ut."
    ],
    eli5: "5-åring: Når skapet er nesten fullt, kjøper vi et dobbelt så stort skap og legger alt inn på nytt, hver ting på sin nye hylle.",
    side: { page: "05-hashing.html", fane: "kjoretid" }
  };

  /* ======================================================================
     7. Dijkstra med tabell
     ====================================================================== */
  var DN = { A: [30, 95], B: [125, 30], C: [125, 160], D: [235, 30], E: [235, 160], F: [330, 95] };
  var DE = [["A", "B", 4], ["A", "C", 1], ["B", "C", 2], ["B", "D", 5], ["C", "D", 8], ["C", "E", 10], ["D", "E", 2], ["D", "F", 6], ["E", "F", 3]];
  var mDijk = {
    id: "mock-dijkstra", tema: "grafer", operasjon: "Dijkstra for hånd med tabell",
    sannsynlighet: "middels",
    begrunnelse: "Dijkstra er hovedalgoritmen i forelesning 06_vektede_grafer, notatet Utvalgte_grafalgoritmer og ukesoppgaver 06_vektede_grafer. Den ble kjørt for hånd i H2020 (8p) og valgt som riktig algoritme i et avkryssingsspørsmål i H2021, men siden bare brukt som verktøy i grafoppgaven. Som standardoppgave er den mulig, men grafhistorien tar som regel Dijkstra.",
    year: "Mock", title: "Dijkstra med tabell", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>Gitt den urettede, vektede grafen under. Naboene behandles i alfabetisk rekkefølge.</p>" +
      fig(graph({ w: 360, h: 190, nodes: DN, edges: DE, label: "Urettet vektet graf med nodene A til F" })) +
      parts([
        ["Kjør Dijkstra fra A med prioritetskø. Lag en tabell som viser hvilken node som tas ut i hvert steg, og dist for alle nodene etter steget.", 5],
        ["Oppgi den korteste veien fra A til F og lengden.", 1],
        ["Skriv pseudokode for Dijkstra.", 2],
        ["Oppgi kjøretiden med en binær heap som prioritetskø.", 1],
        ["Gi et eksempel på hvorfor Dijkstra kan gi feil svar med negative vekter.", 1]
      ]),
    losning: [
      "<b>(a)</b> dist starter som ∞ for alle unntatt A. I kursets variant legges en node inn i køen på nytt hver gang avstanden blir bedre, og gamle innslag hoppes over når de tas ut (noden er allerede besøkt). Uthevet = avstanden ble oppdatert i dette steget." +
        tab(["tatt ut", "A", "B", "C", "D", "E", "F", "kø etterpå"], [
          ["start", 0, "∞", "∞", "∞", "∞", "∞", "(0, A)"],
          ["(0, A)", 0, { v: 4, hl: true }, { v: 1, hl: true }, "∞", "∞", "∞", "(1, C) (4, B)"],
          ["(1, C)", 0, { v: 3, hl: true }, 1, { v: 9, hl: true }, { v: 11, hl: true }, "∞", "(3, B) (4, B) (9, D) (11, E)"],
          ["(3, B)", 0, 3, 1, { v: 8, hl: true }, 11, "∞", "(4, B) (8, D) (9, D) (11, E)"],
          ["(4, B) hopp over", 0, 3, 1, 8, 11, "∞", "(8, D) (9, D) (11, E)"],
          ["(8, D)", 0, 3, 1, 8, { v: 10, hl: true }, { v: 14, hl: true }, "(9, D) (10, E) (11, E) (14, F)"],
          ["(9, D) hopp over", 0, 3, 1, 8, 10, 14, "(10, E) (11, E) (14, F)"],
          ["(10, E)", 0, 3, 1, 8, 10, { v: 13, hl: true }, "(11, E) (13, F) (14, F)"],
          ["(11, E) hopp over", 0, 3, 1, 8, 10, 13, "(13, F) (14, F)"],
          ["(13, F)", 0, 3, 1, 8, 10, 13, "(14, F)"],
          ["(14, F) hopp over", 0, 3, 1, 8, 10, 13, "tom"]
        ]) +
        "<p>Rekkefølgen nodene blir besøkt i: A, C, B, D, E, F. Foreldre: B ← C, C ← A, D ← B, E ← D, F ← E.</p>",
      "<b>(b)</b> Følg foreldrene bakover fra F: F ← E ← D ← B ← C ← A. Veien er A – C – B – D – E – F med lengde 1 + 2 + 5 + 2 + 3 = 13." +
        fig(graph({ w: 360, h: 190, nodes: DN, edges: DE, hl: ["A-C", "C-B", "B-D", "D-E", "E-F"], label: "Korteste-vei-treet fra A" }), "Uthevet: korteste-vei-treet fra A."),
      "<b>(c)</b> Pseudokode (kursets variant med besøkt-mengde):" +
        pc("Dijkstra(G, s)", "En vektet graf G = (V, E) uten negative vekter og en startnode s", "Avstandene dist og foreldrene parents", [
          "Q ← new PriorityQueue",
          "dist ← new Map   // ukjent node har avstand ∞",
          "parents ← new Map",
          "visited ← new Set",
          "dist[s] ← 0",
          "Insert(Q, s, 0)",
          "while Q is not empty do",
          "  u ← RemoveMin(Q)",
          "  if u ∈ visited then",
          "    continue",
          "  add u to visited",
          "  for each (u, v) ∈ E do",
          "    c ← dist[u] + w(u, v)",
          "    if c < dist[v] then",
          "      dist[v] ← c",
          "      parents[v] ← u",
          "      Insert(Q, v, c)",
          "return dist, parents"
        ]),
      "<b>(d)</b> O((|V| + |E|) · log(|V|)). Hver node tas ut og behandles én gang, og hver kant kan gi én innsetting i køen. Køen har derfor høyst O(|E|) innslag, og hver Insert og RemoveMin koster O(log(|E|)) = O(log(|V|)).",
      "<b>(e)</b> Ta den rettede grafen med kantene (A, B) vekt 2, (A, C) vekt 4, (C, B) vekt −3 og (B, D) vekt 1. Dijkstra tar ut B med avstand 2 og D med avstand 3 før C. Når C tas ut, blir dist[B] = 1, men B er allerede besøkt og behandles ikke på nytt, så D blir stående med 3. Den korteste veien A → C → B → D har lengde 2. Dijkstra antar at en node som er tatt ut ikke kan få kortere vei senere, og det holder bare uten negative vekter. Med negative vekter bruker vi Bellman-Ford."
    ],
    kjerne:
      "<p><b>Kjernen:</b> ta alltid ut noden med minst kjent avstand. Den er da ferdig, og du oppdaterer naboene med dist[u] + w(u, v) hvis det er bedre. Gamle køinnslag hoppes over.</p>" +
      sensor([
        "(a) 5p: 1p for riktig startoppsett, 3p for riktige oppdateringer i tabellen, 1p for riktig rekkefølge nodene tas ut. Å glemme oppdateringen B: 4 → 3 er den vanligste feilen og gir følgefeil.",
        "(b) 1p for vei og lengde.",
        "(c) 2p for pseudokode med prioritetskø og oppdatering. Et kall til en ukjent metode uten forklaring gir trekk.",
        "(d) 1p for kjøretid.",
        "(e) 1p for et konkret moteksempel."
      ]),
    tips: [
      "<b>Felle:</b> å låse en node når den <i>legges inn</i> i køen. Den er ferdig først når den <i>tas ut</i>; B legges inn med 4, men får 3.",
      "<b>Felle:</b> å svare med færrest kanter (som BFS ville gitt: A – B – D – F). Dijkstra minimerer summen av vekter.",
      "<b>Felle:</b> å glemme å oppgi kjøretid. Den er en egen poengpost nesten hver gang.",
      "<b>Husk:</b> skriv hvilken tie-break du bruker (her alfabetisk) hvis to noder har samme avstand."
    ],
    eli5: "5-åring: Vi går alltid videre fra det stedet som er nærmest hjemme av dem vi kjenner, og skriver ned hvor langt det er til naboene.",
    side: { page: "06-grafer.html", fane: "dijkstra" }
  };

  /* ======================================================================
     8. Topologisk sortering (kursets TopSort med stakk)
     ====================================================================== */
  var TN = { A: [30, 40], B: [30, 150], C: [135, 40], D: [135, 150], E: [240, 40], F: [240, 150], G: [340, 95] };
  var TE = [["A", "C"], ["B", "C"], ["B", "D"], ["C", "E"], ["D", "E"], ["D", "F"], ["E", "G"], ["F", "G"]];
  var mTop = {
    id: "mock-topsort", tema: "grafer", operasjon: "Topologisk sortering (TopSort med inngrad og stakk)",
    sannsynlighet: "middels",
    begrunnelse: "TopSort med inngrad og stakk står i forelesning 05_grafer, og ukesoppgaver 05_grafer og 07_sammenhengende_grafer bruker den. Den har kommet som del av grafoppgaven (avhengigheter), men aldri som ren håndkjøring. Den er kort og passer godt som standardoppgave.",
    year: "Mock", title: "Topologisk sortering", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>Gitt den rettede grafen under med V = {A, B, C, D, E, F, G}. Nodene gås gjennom i alfabetisk rekkefølge.</p>" +
      fig(graph({ w: 370, h: 190, nodes: TN, edges: TE, dir: true, label: "Rettet graf med nodene A til G" })) +
      parts([
        ["Kjør kursets TopSort (inngrad og stakk). Vis stakken, inngradene som endres og output etter hver gang en node tas av stakken.", 4],
        ["Er den topologiske ordningen unik? Gi en annen gyldig ordning, eller forklar hvorfor ikke.", 1],
        ["Vi legger til kanten (G, B). Hva gjør algoritmen nå, og hva forteller det oss?", 2],
        ["Skriv pseudokode for TopSort.", 2],
        ["Oppgi kjøretiden.", 1]
      ]),
    losning: [
      "<b>(a)</b> Inngrader: A 0, B 0, C 2, D 1, E 2, F 1, G 2. A og B har inngrad 0 og legges på stakken i den rekkefølgen, så B ligger øverst." +
        tab(["tas av", "inngrad endres", "stakk etterpå (øverst til høyre)", "output"], [
          ["start", "", "A, B", ""],
          ["B", "C 2→1, D 1→0 (push D)", "A, D", "B"],
          ["D", "E 2→1, F 1→0 (push F)", "A, F", "B, D"],
          ["F", "G 2→1", "A", "B, D, F"],
          ["A", "C 1→0 (push C)", "C", "B, D, F, A"],
          ["C", "E 1→0 (push E)", "E", "B, D, F, A, C"],
          ["E", "G 1→0 (push G)", "G", "B, D, F, A, C, E"],
          ["G", "", "tom", "B, D, F, A, C, E, G"]
        ]) +
        "<p>Output har 7 = |V| noder, så grafen er asyklisk og ordningen er B, D, F, A, C, E, G.</p>",
      "<b>(b)</b> Nei. For eksempel er A, B, C, D, E, F, G også gyldig: hver kant (u, v) har u før v. Ordningen er unik bare når det til enhver tid er nøyaktig én node med inngrad 0.",
      "<b>(c)</b> Med (G, B) har B inngrad 1, så bare A legges på stakken. A tas av, og C får inngrad 1. Stakken er tom, og output er bare [A]. Siden 1 &lt; |V| = 7, melder algoritmen feil: grafen har en sykel (for eksempel B → D → E → G → B), og da finnes ingen topologisk ordning.",
      "<b>(d)</b> Pseudokode:" +
        pc("TopSort(G)", "En rettet graf G = (V, E)", "En topologisk ordning av V, eller feil hvis G har en sykel", [
          "S ← new Stack",
          "output ← new List",
          "for each v ∈ V do",
          "  inDeg[v] ← InDegree(G, v)",
          "  if inDeg[v] = 0 then",
          "    Push(S, v)",
          "while S is not empty do",
          "  u ← Pop(S)",
          "  append u to output",
          "  for each (u, v) ∈ E do",
          "    inDeg[v] ← inDeg[v] − 1",
          "    if inDeg[v] = 0 then",
          "      Push(S, v)",
          "if |output| < |V| then",
          "  error \"G har en sykel\"",
          "return output"
        ]),
      "<b>(e)</b> O(|V| + |E|): hver node legges på og tas av stakken høyst én gang, og hver kant ses på én gang når startnoden tas av. Inngradene kan telles på O(|V| + |E|) ved å gå gjennom alle kantene."
    ],
    kjerne:
      "<p><b>Kjernen:</b> en node kan komme ut når alt som peker inn på den allerede er ute (inngrad 0). Kommer ikke alle nodene ut, finnes det en sykel.</p>" +
      sensor([
        "(a) 1p for riktige inngrader, 3p for riktig kjøring med stakk og output.",
        "(b) 1p for en annen gyldig ordning.",
        "(c) 1p for at algoritmen stopper med bare A, 1p for at det betyr sykel.",
        "(d) 2p for pseudokode med inngrad og sykelsjekk.",
        "(e) 1p for O(|V| + |E|)."
      ]),
    tips: [
      "<b>Felle:</b> å bruke kø i stedet for stakk. Det gir også en gyldig ordning, men ikke den samme som kursets TopSort, så tabellen blir feil.",
      "<b>Felle:</b> å glemme sykelsjekken |output| &lt; |V|. Uten den returnerer algoritmen en halv liste uten å si fra.",
      "<b>Felle:</b> å kalle topologisk sortering en grådig algoritme. Det gjør ikke kurset; grådig brukes om Dijkstra, Prim og Kruskal.",
      "<b>Husk:</b> kurset har også en DFS-variant som legger en node på stakken etter at alle naboene er ferdige."
    ],
    eli5: "5-åring: Du kan ikke ta på deg skoene før sokkene. Vi tar alltid noe som ikke venter på noe annet.",
    side: { page: "06-grafer.html", fane: "topologisk" }
  };

  /* ======================================================================
     9. Minimalt spenntre: Kruskal og Prim
     ====================================================================== */
  var MN = { A: [30, 95], B: [130, 30], C: [130, 160], D: [240, 30], E: [240, 160], F: [340, 95] };
  var ME = [["A", "B", 6], ["A", "C", 3], ["B", "C", 4], ["B", "D", 2], ["C", "D", 5], ["C", "E", 7], ["D", "E", 8], ["D", "F", 9], ["E", "F", 1]];
  var mMst = {
    id: "mock-mst", tema: "grafer", operasjon: "Minimalt spenntre: Kruskal og Prim for hånd",
    sannsynlighet: "middels",
    begrunnelse: "Prim (med pseudokode) og Kruskal (idé) står i forelesning 06_vektede_grafer og ukesoppgaver 06_vektede_grafer. H2020 spurte om Kruskal (vekten til siste kant, 4p), og «minste terskel = største kant i spenntreet» har kommet i grafoppgavene. Det er sjelden standardoppgave, men en sterk kandidat i grafdelen.",
    year: "Mock", title: "Minimalt spenntre: Kruskal og Prim", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>Gitt den urettede, vektede grafen under.</p>" +
      fig(graph({ w: 370, h: 190, nodes: MN, edges: ME, label: "Urettet vektet graf med nodene A til F" })) +
      parts([
        ["Kjør Kruskal. Vis i hvilken rekkefølge kantene vurderes, og om hver kant tas med eller forkastes, med begrunnelse.", 3],
        ["Kjør Prim fra A. Vis i hvilken rekkefølge nodene legges til, og via hvilken kant.", 3],
        ["Tegn det minimale spenntreet, og oppgi totalvekten.", 1],
        ["Hva er den minste verdien t slik at alle nodene henger sammen hvis vi bare bruker kanter med vekt ≤ t?", 1],
        ["Skriv pseudokode for Prim, og oppgi kjøretiden med prioritetskø.", 2]
      ]),
    losning: [
      "<b>(a)</b> Kruskal sorterer kantene på vekt og tar med en kant hvis det ikke allerede finnes en vei mellom endepunktene i det vi har valgt." +
        tab(["kant", "vekt", "tatt med?", "begrunnelse"], [
          ["E–F", 1, { v: "ja", hl: true }, "{E, F}"],
          ["B–D", 2, { v: "ja", hl: true }, "{B, D}"],
          ["A–C", 3, { v: "ja", hl: true }, "{A, C}"],
          ["B–C", 4, { v: "ja", hl: true }, "slår sammen til {A, B, C, D}"],
          ["C–D", 5, "nei", "C og D henger allerede sammen"],
          ["A–B", 6, "nei", "A og B henger allerede sammen"],
          ["C–E", 7, { v: "ja", hl: true }, "alt henger sammen"],
          ["D–E", 8, "nei", "sykel"],
          ["D–F", 9, "nei", "sykel"]
        ]),
      "<b>(b)</b> Prim fra A legger alltid til den letteste kanten fra treet til en node utenfor." +
        tab(["steg", "node lagt til", "via kant", "nye kanter i køen"], [
          [1, "A", "start", "A–B 6, A–C 3"],
          [2, "C", "A–C 3", "C–B 4, C–D 5, C–E 7"],
          [3, "B", "C–B 4", "B–D 2"],
          [4, "D", "B–D 2", "D–E 8, D–F 9"],
          [5, "E", "C–E 7", "E–F 1 (C–D 5 og A–B 6 hoppes over)"],
          [6, "F", "E–F 1", ""]
        ]) +
        "<p>Prim og Kruskal gir samme tre her, fordi alle vektene er forskjellige.</p>",
      "<b>(c)</b> Kantene er A–C, B–C, B–D, C–E og E–F, med totalvekt 3 + 4 + 2 + 7 + 1 = 17." +
        fig(graph({ w: 370, h: 190, nodes: MN, edges: ME, hl: ["A-C", "B-C", "B-D", "C-E", "E-F"], label: "Det minimale spenntreet" }), "Uthevet: det minimale spenntreet (5 = |V| − 1 kanter)."),
      "<b>(d)</b> t = 7, som er den største kanten i det minimale spenntreet. Med bare kanter ≤ 6 er {E, F} skilt fra resten. Et minimalt spenntre minimerer også den største kanten.",
      "<b>(e)</b> Pseudokode for Prim:" +
        pc("Prim(G, s)", "En sammenhengende, urettet, vektet graf G = (V, E) og en startnode s", "Et minimalt spenntre gitt ved foreldrene parents", [
          "Q ← new PriorityQueue",
          "parents ← new Map",
          "Insert(Q, (null, s), 0)",
          "while Q is not empty do",
          "  (p, u) ← RemoveMin(Q)",
          "  if u ∈ parents then",
          "    continue",
          "  parents[u] ← p",
          "  for each (u, v) ∈ E do",
          "    if v ∉ parents then",
          "      Insert(Q, (u, v), w(u, v))",
          "return parents"
        ]) +
        "<p>Kjøretid: O(|E| · log(|V|)). Hver kant gir høyst to innsettinger i køen, og hver køoperasjon koster O(log(|E|)) = O(log(|V|)), fordi |E| ≤ |V|².</p>"
    ],
    kjerne:
      "<p><b>Kjernen:</b> Kruskal tar den letteste kanten i hele grafen som ikke lager sykel. Prim vokser ett tre fra en startnode og tar den letteste kanten ut av treet. Begge er grådige og gir et spenntre med |V| − 1 kanter.</p>" +
      sensor([
        "(a) 3p for riktig rekkefølge og riktige valg, med begrunnelse for forkastede kanter.",
        "(b) 3p for riktig rekkefølge med kant (2p hvis bare nodene er riktige).",
        "(c) 1p for tre og vekt.",
        "(d) 1p for 7 med begrunnelse.",
        "(e) 1p for pseudokode, 1p for kjøretid."
      ]),
    tips: [
      "<b>Felle:</b> å bruke Dijkstra-avstand i Prim. Prim ser bare på vekten til selve kanten, ikke avstanden fra starten.",
      "<b>Felle:</b> å forkaste en kant fordi en av nodene allerede er med. Det er bare galt når <i>begge</i> allerede henger sammen.",
      "<b>Felle:</b> å kalle det et minimalt spenntre for en rettet graf. Prim og Kruskal er for urettede grafer.",
      "<b>Husk:</b> Kruskal er bare pensum som idé. Du trenger ikke union-find; si at du sjekker om det finnes en vei mellom endepunktene."
    ],
    eli5: "5-åring: Vi skal koble alle husene med så lite tau som mulig, så vi bruker alltid den korteste tausnutten som ikke lager en ring.",
    side: { page: "06-grafer.html", fane: "mst" }
  };

  /* ======================================================================
     10. Quicksort: Partition for hånd
     ====================================================================== */
  var mQs = {
    id: "mock-quicksort", tema: "sortering", operasjon: "Quicksort: Partition og rekursjon for hånd",
    sannsynlighet: "middels",
    begrunnelse: "Partition med to pekere og ChoosePivot står i forelesning 09_litt_mer_sortering, og ukesoppgaver 09_litt_mer_sortering bruker den. Quicksort er spurt som sant/usant og kjøretid (verste tilfelle), aldri som håndkjøring. Sortering har tapt plass på de siste eksamenene, så sannsynligheten er middels.",
    year: "Mock", title: "Quicksort med Partition", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>Sorter A = [7, 2, 9, 4, 3, 8, 6, 1, 5] med kursets Quicksort. ChoosePivot velger alltid siste element i delen som sorteres (indeks high).</p>" +
      parts([
        ["Kjør <span class=\"mono\">Partition(A, 0, 8)</span> steg for steg. Vis left og right før hvert bytte og arrayet etter byttet, og oppgi hva Partition returnerer.", 4],
        ["Vis arrayet etter hvert videre Partition-kall i rekursjonen.", 3],
        ["Skriv pseudokode for Quicksort og Partition.", 2],
        ["Oppgi kjøretiden i verste tilfelle, og si hvilken input som gir det med denne pivoten.", 1]
      ]),
    losning: [
      "<b>(a)</b> Pivot = A[8] = 5. left = 0, right = 7. left går fram så lenge A[left] ≤ 5, og right går tilbake så lenge A[right] ≥ 5." +
        tab(["hendelse", "left", "right", "array etterpå"], [
          ["A[0] = 7 > 5, A[7] = 1 &lt; 5: bytt", 0, 7, "[1, 2, 9, 4, 3, 8, 6, 7, 5]"],
          ["left over 1, 2; stopper på 9. right over 7, 6, 8; stopper på 3: bytt", 2, 4, "[1, 2, 3, 4, 9, 8, 6, 7, 5]"],
          ["left over 3, 4; stopper på 9. right går forbi left", 4, 3, "ingen bytte, løkka slutter"],
          ["pivot på plass: bytt A[4] og A[8]", 4, "", "[1, 2, 3, 4, 5, 8, 6, 7, 9]"]
        ]) +
        "<p>Partition returnerer 4. Alt til venstre er mindre enn 5, alt til høyre er større.</p>",
      "<b>(b)</b> Rekursjonen:" +
        tab(["kall", "pivot", "returnerer", "array etterpå"], [
          ["Partition(A, 0, 3)", 4, 3, "[1, 2, 3, 4 | 5 | 8, 6, 7, 9] (ingen bytter)"],
          ["Partition(A, 0, 2)", 3, 2, "uendret"],
          ["Partition(A, 0, 1)", 2, 1, "uendret"],
          ["Partition(A, 5, 8)", 9, 8, "uendret"],
          ["Partition(A, 5, 7)", 7, 6, "bytt 8 og 6, så 8 og 7: [1, 2, 3, 4, 5, 6, 7, 8, 9]"]
        ]) +
        "<p>De andre kallene har low ≥ high og returnerer med en gang. Venstre del var allerede sortert, og da deler Partition skjevt: ett element av gangen.</p>",
      "<b>(c)</b> Pseudokode:" +
        pc("Partition(A, low, high)", "", "Indeksen der pivoten havner", [
          "p ← ChoosePivot(A, low, high)",
          "swap A[p] and A[high]",
          "pivot ← A[high]",
          "left ← low",
          "right ← high − 1",
          "while left ≤ right do",
          "  while left ≤ right and A[left] ≤ pivot do",
          "    left ← left + 1",
          "  while right ≥ left and A[right] ≥ pivot do",
          "    right ← right − 1",
          "  if left < right then",
          "    swap A[left] and A[right]",
          "swap A[left] and A[high]",
          "return left"
        ]) +
        pc("Quicksort(A, low, high)", "Et array A og grensene low og high", "A[low..high] sortert", [
          "if low ≥ high then",
          "  return A",
          "p ← Partition(A, low, high)",
          "Quicksort(A, low, p − 1)",
          "Quicksort(A, p + 1, high)",
          "return A"
        ]),
      "<b>(d)</b> O(n²) i verste tilfelle. Med siste element som pivot skjer det når arrayet allerede er sortert (eller sortert baklengs): hver Partition skiller bare ut ett element, så det blir n nivåer med O(n) arbeid. Typisk kjøretid er O(n log n). Derfor velger ChoosePivot i kurset tilfeldig eller medianen av første, midterste og siste."
    ],
    kjerne:
      "<p><b>Kjernen:</b> Partition flytter pivoten bakerst, lar left og right møtes mens små og store elementer byttes, og setter pivoten på plass der left stoppet. Etter ett kall står pivoten på sin endelige plass.</p>" +
      sensor([
        "(a) 1p for riktig pivot, 2p for riktige bytter, 1p for returverdi og sluttarray.",
        "(b) 3p for rekursjonen med riktige delarrayer.",
        "(c) 2p for pseudokode (Partition 1p, Quicksort 1p).",
        "(d) 1p for O(n²) med riktig verste-tilfelle-input."
      ]),
    tips: [
      "<b>Felle:</b> å glemme det siste byttet som setter pivoten på plass. Det er der returverdien kommer fra.",
      "<b>Felle:</b> å bruke Lomuto-varianten fra andre kilder. Kurset bruker to pekere som går mot hverandre, og mellomtilstandene blir forskjellige.",
      "<b>Felle:</b> å si at Quicksort er stabil. Den er in-place, men ikke stabil.",
      "<b>Husk:</b> si hvilken pivotstrategi du bruker hvis oppgaven ikke sier det."
    ],
    eli5: "5-åring: Vi velger én klosse, legger alle mindre til venstre og alle større til høyre, og gjør det samme med hver bunke.",
    side: { page: "01-sortering.html", fane: "quick" }
  };

  /* ======================================================================
     11. Radix sort med Bucket sort per siffer
     ====================================================================== */
  function buckets(list) {
    return tab(["bøtte", "innhold (i rekkefølge)"], list);
  }
  var mRadix = {
    id: "mock-radix", tema: "sortering", operasjon: "Radix sort (minst signifikante siffer først)",
    sannsynlighet: "middels",
    begrunnelse: "BucketSort og RadixSort med pseudokode står i forelesning 09_litt_mer_sortering. Stabil bøttesortering har kommet flere ganger (H2020 og som «sorter uten sort-kall»), men Radix sort for hånd er aldri spurt. Kjøretiden O(d·(N + n)) er typisk sant/usant-stoff.",
    year: "Mock", title: "Radix sort for hånd", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>Sorter A = [512, 87, 230, 415, 98, 302, 147, 85] stigende med kursets Radix sort, som bruker Bucket sort med N = 10 bøtter på ett siffer av gangen. Tall med færre enn tre sifre fylles ut med ledende nuller (87 = 087).</p>" +
      parts([
        ["Vis innholdet i bøttene og arrayet etter hver av de tre rundene.", 6],
        ["Hvorfor må Bucket sort være stabil her? Hva blir resultatet hvis du i stedet starter med det mest signifikante sifferet og gjør det samme?", 2],
        ["Skriv pseudokode for Radix sort, og oppgi kjøretiden med d sifre, n tall og N bøtter.", 2]
      ]),
    losning: [
      "<b>Runde 1: enersifferet.</b> Tallene legges bakerst i bøtta for sifferet sitt, i den rekkefølgen de står." +
        buckets([[0, "230"], [2, "512, 302"], [5, "415, 85"], [7, "87, 147"], [8, "98"]]) +
        "<p class=\"small muted\">Tomme bøtter er utelatt.</p>" +
        states([["etter runde 1", [230, 512, 302, 415, 85, 87, 147, 98]]]),
      "<b>Runde 2: tiersifferet.</b>" +
        buckets([[0, "302"], [1, "512, 415"], [3, "230"], [4, "147"], [8, "85, 87"], [9, "98"]]) +
        states([["etter runde 2", [302, 512, 415, 230, 147, 85, 87, 98]]]) +
        "<p>Legg merke til 85 og 87: de har samme tiersiffer og står i den rekkefølgen runde 1 ga dem.</p>",
      "<b>Runde 3: hundresifferet.</b>" +
        buckets([[0, "85, 87, 98"], [1, "147"], [2, "230"], [3, "302"], [4, "415"], [5, "512"]]) +
        states([["etter runde 3", [85, 87, 98, 147, 230, 302, 415, 512]]]),
      "<b>(b)</b> Hver runde skal bevare rekkefølgen fra forrige runde for tall med samme siffer. Det er det som gjør at de lavere sifrene «huskes». Er Bucket sort ikke stabil, kan 87 havne foran 85 i siste runde. Starter du med det mest signifikante sifferet og gjør det samme, avgjør siste runde (enersifferet) alt, og du får [230, 302, 512, 415, 85, 147, 87, 98], som ikke er sortert.",
      "<b>(c)</b> Pseudokode (siffer 0 er det mest signifikante, siffer d − 1 enersifferet):" +
        pc("RadixSort(A, d)", "Et array A med ikke-negative heltall med høyst d sifre", "A sortert stigende", [
          "for i ← d − 1 down to 0 do",
          "  A ← BucketSort(A, i)   // stabil, på siffer nr. i",
          "return A"
        ]) +
        pc("BucketSort(A, i)", "", "", [
          "B ← new array of N empty lists",
          "for each x in A do",
          "  append x to B[Digit(x, i)]",
          "R ← new List",
          "for k ← 0 to N − 1 do",
          "  for each x in B[k] do",
          "    append x to R",
          "return R"
        ]) +
        "<p>Kjøretid: O(d·(N + n)). Hver av de d rundene legger n tall i bøtter og går gjennom N bøtter. Her er d = 3 og N = 10.</p>"
    ],
    kjerne:
      "<p><b>Kjernen:</b> sorter på ett siffer av gangen fra det minst signifikante, med en stabil Bucket sort. Etter siste runde er alt sortert, uten en eneste sammenligning mellom tallene.</p>" +
      sensor([
        "(a) 2p per runde: 1p for bøttene, 1p for arrayet. Riktig sluttsvar med feil mellomtilstander gir lite.",
        "(b) 1p for stabilitet, 1p for moteksempelet med mest signifikant først.",
        "(c) 1p for pseudokode, 1p for O(d·(N + n))."
      ]),
    tips: [
      "<b>Felle:</b> å sortere innholdet i hver bøtte. Tallene skal ligge i den rekkefølgen de kom inn.",
      "<b>Felle:</b> å glemme ledende nuller. 85 hører hjemme i bøtte 0 i siste runde.",
      "<b>Felle:</b> å oppgi O(n log n). Radix sort er ikke sammenligningsbasert, så den grensen gjelder ikke.",
      "<b>Husk:</b> Bucket sort alene er O(N + n). Kurset har ingen egen «tellesortering»."
    ],
    eli5: "5-åring: Først sorterer vi brevene etter siste siffer i husnummeret, så nest siste, og til slutt første, uten å stokke om de som er like.",
    side: { page: "01-sortering.html", fane: "radix" }
  };

  /* ======================================================================
     12. Separasjonsnoder med depth og low
     ====================================================================== */
  var SN = { A: [30, 40], B: [30, 150], C: [120, 95], D: [215, 95], E: [300, 40], F: [300, 150], G: [390, 150] };
  var SE = [["A", "B"], ["A", "C"], ["B", "C"], ["C", "D"], ["D", "E"], ["D", "F"], ["E", "F"], ["F", "G"]];
  var mSep = {
    id: "mock-separasjonsnoder", tema: "grafer", operasjon: "Separasjonsnoder med depth og low (DFS)",
    sannsynlighet: "lav",
    begrunnelse: "SeparationVertices med depth og low står i forelesning 07_sammenhengende_grafer og notatet Utvalgte_grafalgoritmer, og ukesoppgaver 07_sammenhengende_grafer bruker den. H2025 spurte om separasjonsnoder som bruk i grafoppgaven, ikke som håndkjøring. Den er krevende å rette, så den er lite sannsynlig som standardoppgave, men nyttig øving for grafdelen.",
    year: "Mock", title: "Separasjonsnoder", points: 10, oppgave_nr: "Oppgave 1 (mock)",
    oppgave:
      "<p>Gitt den urettede grafen under. Naboene behandles i alfabetisk rekkefølge.</p>" +
      fig(graph({ w: 420, h: 190, nodes: SN, edges: SE, label: "Urettet graf med nodene A til G" })) +
      parts([
        ["Kjør kursets algoritme for separasjonsnoder med Dybde-først søk (DFS) fra A. Oppgi depth og low for hver node.", 4],
        ["Hvilke noder er separasjonsnoder? Begrunn med regelen for depth og low, og behandle roten for seg.", 3],
        ["Vi legger til kanten {E, G}. Hvilke noder er separasjonsnoder nå?", 1],
        ["Oppgi kjøretiden, og sammenlign med å fjerne hver node og sjekke om grafen henger sammen.", 2]
      ]),
    losning: [
      "<b>(a)</b> DFS-treet blir en sti, fordi hver node finner en ubesøkt nabo: A → B → C → D → E → F → G. depth er avstanden i DFS-treet. low[u] er den minste depth u kan nå via subtreet sitt og én kant tilbake." +
        tab(["node", "depth", "low", "hvorfor low"], [
          ["A", 0, 0, "roten"],
          ["B", 1, 0, "kant til A"],
          ["C", 2, 0, "kant til A"],
          ["D", 3, 2, "kant til C"],
          ["E", 4, 3, "kant til D"],
          ["F", 5, 3, "kant til D"],
          ["G", 6, 5, "bare kanten til F"]
        ]) +
        "<p>Rekkefølgen low blir ferdig i: G (5), F (min av 3 og 5 = 3), E (3), D (2), C (0), B (0), A (0).</p>",
      "<b>(b)</b> En node u som ikke er roten, er en separasjonsnode hvis den har et barn v i DFS-treet med depth[u] ≤ low[v]. Da kan ikke subtreet til v nå forbi u." +
        tab(["u", "barn v", "depth[u] ≤ low[v]?", "separasjonsnode?"], [
          ["F", "G", "5 ≤ 5", { v: "ja", hl: true }],
          ["E", "F", "4 ≤ 3: nei", "nei"],
          ["D", "E", "3 ≤ 3", { v: "ja", hl: true }],
          ["C", "D", "2 ≤ 2", { v: "ja", hl: true }],
          ["B", "C", "1 ≤ 0: nei", "nei"]
        ]) +
        "<p>Roten A er en separasjonsnode bare hvis den har mer enn ett barn i DFS-treet. A har bare B (C ble nådd via B), så A er ikke en separasjonsnode. Svaret er {C, D, F}, funnet i rekkefølgen F, D, C.</p>" +
        fig(graph({ w: 420, h: 190, nodes: SN, edges: SE, hn: ["C", "D", "F"], label: "Separasjonsnodene C, D og F er uthevet" }), "Uthevet: separasjonsnodene."),
      "<b>(c)</b> Med {E, G} blir low[G] = depth[E] = 4, så 5 ≤ 4 er usant og F er ikke lenger en separasjonsnode. D og C er fortsatt separasjonsnoder (low[E] = 3, low[D] = 2). Svaret er {C, D}.",
      "<b>Pseudokode</b> (kursets variant, til referanse; depth og low er ordbøker, seps er felles for begge prosedyrene):" +
        pc("SeparationVertices(G, s)", "En sammenhengende, urettet graf G = (V, E) og en startnode s", "Mengden av separasjonsnoder", [
          "seps ← new Set",
          "depth[s] ← 0",
          "Visit(G, s)",
          "if s har mer enn ett barn i DFS-treet then",
          "  add s to seps",
          "return seps"
        ]) +
        pc("Visit(G, u)", "", "", [
          "low[u] ← depth[u]",
          "for each (u, v) ∈ E do",
          "  if v ∈ depth then",
          "    low[u] ← min(low[u], depth[v])",
          "  else",
          "    depth[v] ← depth[u] + 1",
          "    Visit(G, v)",
          "    low[u] ← min(low[u], low[v])",
          "    if depth[u] ≠ 0 and depth[u] ≤ low[v] then",
          "      add u to seps"
        ]),
      "<b>(d)</b> O(|V| + |E|): det er ett Dybde-først søk, med konstant ekstra arbeid per kant. Å fjerne hver node og kjøre et nytt søk for å sjekke sammenheng koster O(|V| + |E|) per node, altså O(|V| · (|V| + |E|))."
    ],
    kjerne:
      "<p><b>Kjernen:</b> low[v] sier hvor høyt opp i DFS-treet subtreet til v kan nå med én kant tilbake. Kommer ikke v høyere enn u (depth[u] ≤ low[v]), henger v bare fast i resten av grafen via u. Roten sjekkes for seg: den er en separasjonsnode hvis den har flere barn.</p>" +
      sensor([
        "(a) 2p for depth, 2p for low.",
        "(b) 2p for riktige noder med regelen, 1p for riktig behandling av roten.",
        "(c) 1p for {C, D}.",
        "(d) 1p for O(|V| + |E|), 1p for sammenligningen."
      ]),
    tips: [
      "<b>Felle:</b> å bruke regelen depth[u] ≤ low[v] på roten. Roten har depth 0, og 0 ≤ low[v] er alltid sant; den må sjekkes ved å telle barn.",
      "<b>Felle:</b> å oppdatere low via low[v] for en nabo som allerede er besøkt. For en besøkt nabo brukes depth[v].",
      "<b>Felle:</b> å blande sammen DFS-treet og grafen. C er nabo til A, men barn av B i DFS-treet.",
      "<b>Husk:</b> en graf uten separasjonsnoder er 2-sammenhengende."
    ],
    eli5: "5-åring: En separasjonsnode er en bro alle må gå over. Fjerner vi den, kommer ikke de på andre siden hjem lenger.",
    side: { page: "06-grafer.html", fane: "sammenheng" }
  };

  IN.MOCK = [mHeap, mProbe, mAvl, mBst, mHs, mRehash, mDijk, mTop, mMst, mQs, mRadix, mSep];
})();
