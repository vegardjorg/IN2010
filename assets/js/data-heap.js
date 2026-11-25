/* ============================================================
   IN2010 guide · data-heap.js
   Blokk 3 · Heap: tre + array-visualisering (IN.vizHeap),
   algoritmedefinisjoner (RemoveMin, BubbleDown, BuildMinHeap,
   heapsort-delene) og steggeneratorer. Klassisk script.
   Lastes ETTER data-algos.js. Overskriver aldri nøkler som alt
   finnes (HeapInsert ligger i data-algos.js og gjenbrukes).
   Linjenummer: Procedure-linja = 1, kroppen fra 2.
   ============================================================ */
(function () {
  "use strict";
  var IN = (window.IN = window.IN || {});
  IN.algos = IN.algos || {};
  IN.gen = IN.gen || {};

  function t(eli5, normal, teknisk) { return { eli5: eli5, normal: normal, teknisk: teknisk }; }
  function clone(a) { return a.slice(); }
  function def(obj, key, val) { if (!Object.prototype.hasOwnProperty.call(obj, key)) obj[key] = val; }
  function parent(i) { return Math.floor((i - 1) / 2); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* =====================================================================
     IN.vizHeap(stage, step, opts) – tre (SVG) og array side om side.
     step: {
       array: [...],            // hele arrayet
       size:  n,                // hvor mange av cellene som er heap (resten = sortert hale)
       marks: { compare:[], swap:[], moved:[], active: i, sorted:[], target: i, ghost: true,
                vars: [[navn, verdi]] },   // moved = kopieres/flyttes (ikke bytte); vars = piller (i, j, x …)
       edge:  [a, b],           // kant som utheves (forelder–barn som sammenlignes)
       out:   [...],            // verdier som er tatt ut (prioritetskø-rekkefølge)
       outLabel: "Tatt ut"
     }
     opts: { onNode(i),         // klikk på node/celle (indeksutforsker)
             hideArray, noIdx,  // bare treet / ingen indekser ved nodene (eksamensfigurer)
             label, arrName }
     Midlertidig sidelokal komponent – foreslått flyttet til felles
     assets/js/viz-tree.js (se plan/foresporsler/heap/).
     ===================================================================== */
  function inArr(a, i) { return Array.isArray(a) && a.indexOf(i) >= 0; }
  function cls(marks, i, size) {
    var c = "";
    if (i >= size || inArr(marks.sorted, i)) c += " is-sorted";
    if (inArr(marks.compare, i)) c += " is-compare";
    if (marks.min === i) c += " is-min";
    if (inArr(marks.swap, i)) c += " is-swap";
    if (inArr(marks.moved, i)) c += " is-moved";
    if (marks.active === i || marks.target === i) c += " is-target";
    if (marks.sel === i) c += " is-sel";
    if (inArr(marks.rel, i)) c += " is-rel";
    if (marks.levels) c += " lv" + Math.min(4, Math.floor(Math.log2(i + 1)));
    return c;
  }

  IN.vizHeap = function (stage, step, opts) {
    opts = opts || {};
    var A = step.array || [];
    var size = step.size != null ? step.size : A.length;
    var marks = step.marks || {};
    var levels = size > 0 ? Math.floor(Math.log2(size)) + 1 : 1;
    var R = 17, LH = 62, PAD = 28;
    var W = Math.max(420, Math.pow(2, levels - 1) * 46);
    var H = PAD + (levels - 1) * LH + R + 22;

    function pos(i) {
      var d = Math.floor(Math.log2(i + 1)), p = i - (Math.pow(2, d) - 1), cnt = Math.pow(2, d);
      return { x: (p + 0.5) * W / cnt, y: PAD + d * LH };
    }

    var svg = '<svg class="hv-tree viz-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' +
      esc(size ? "Heap som tre: " + A.slice(0, size).join(", ") : "Tom heap") + '">';
    // Kanter først (under nodene)
    for (var i = 1; i < size; i++) {
      var a = pos(parent(i)), b = pos(i);
      var on = step.edge && ((step.edge[0] === i && step.edge[1] === parent(i)) || (step.edge[1] === i && step.edge[0] === parent(i)));
      svg += '<line class="edge' + (on ? " active" : "") + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"/>';
    }
    // Spøkelsesplass: neste ledige plass (for innsetting)
    if (marks.ghost && size < 64) {
      var g = pos(size);
      if (size > 0) { var gp = pos(parent(size)); svg += '<line class="edge hv-ghost-edge" x1="' + gp.x + '" y1="' + gp.y + '" x2="' + g.x + '" y2="' + g.y + '"/>'; }
      svg += '<g class="hv-ghost"><circle cx="' + g.x + '" cy="' + g.y + '" r="' + R + '"/></g>';
    }
    for (var k = 0; k < size; k++) {
      var p = pos(k);
      svg += '<g class="hv-node node' + cls(marks, k, size) + '" data-i="' + k + '"' +
        (opts.onNode ? ' tabindex="0" role="button" aria-label="Node ' + k + ', verdi ' + esc(A[k]) + '"' : "") + ">" +
        '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + R + '"/>' +
        '<text class="hv-val" x="' + p.x + '" y="' + (p.y + 5) + '" text-anchor="middle">' + esc(A[k]) + "</text>" +
        (opts.noIdx ? "" : '<text class="hv-idx" x="' + (p.x + R + 3) + '" y="' + (p.y - R + 4) + '">' + k + "</text>") + "</g>";
    }
    if (!size) svg += '<text class="hv-empty" x="' + (W / 2) + '" y="' + (PAD + 6) + '" text-anchor="middle">(tom heap)</text>';
    svg += "</svg>";

    // Array-rad
    var cells = "";
    for (var c = 0; c < A.length; c++) {
      cells += '<div class="hv-cell' + cls(marks, c, size) + '" data-i="' + c + '"' +
        (opts.onNode ? ' tabindex="0" role="button" aria-label="Indeks ' + c + ', verdi ' + esc(A[c]) + '"' : "") + ">" +
        '<span class="v">' + esc(A[c]) + '</span><span class="ix">' + c + "</span></div>";
    }
    if (marks.ghost) cells += '<div class="hv-cell hv-ghostcell"><span class="v">&nbsp;</span><span class="ix">' + A.length + "</span></div>";
    if (!A.length && !marks.ghost) cells = '<span class="muted small">(tomt array)</span>';

    var vars = step.vars || marks.vars, varsHtml = "";
    if (vars && vars.length) varsHtml = '<div class="hv-vars" aria-label="Variabler">' + vars.map(function (p) {
      return '<span class="hv-var"><span class="lbl">' + esc(p[0]) + '</span><span class="val">' + esc(p[1]) + "</span></span>"; }).join("") + "</div>";
    var html = '<div class="hv">' + (opts.label ? '<div class="hv-lbl small">' + opts.label + "</div>" : "") + svg + varsHtml +
      (opts.hideArray ? "" : '<div class="hv-arr-wrap"><div class="hv-arr-lbl muted small">' + esc(opts.arrName || "Array A") +
      (size < A.length ? ' · heap = A[0..' + (size - 1) + '], sortert hale = A[' + size + '..' + (A.length - 1) + ']' : "") +
      '</div><div class="hv-arr">' + cells + "</div></div>");
    if (step.out) {
      html += '<div class="hv-out small"><span class="muted">' + esc(step.outLabel || "Tatt ut") + ':</span> ' +
        (step.out.length ? step.out.map(function (v) { return '<b class="hv-outv">' + esc(v) + "</b>"; }).join(" ") : '<span class="muted">ingen ennå</span>') + "</div>";
    }
    html += "</div>";
    stage.innerHTML = html;   // all verdi-tekst er escapet (esc) over

    if (opts.onNode) {
      IN.qsa("[data-i]", stage).forEach(function (n) {
        var idx = +n.getAttribute("data-i");
        n.addEventListener("click", function () { opts.onNode(idx); });
        n.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); opts.onNode(idx); } });
      });
    }
  };
  /* =====================================================================
     IN.pseudoGroup([h0, h1, ...], calls) – flere pseudokodeblokker som én
     handle for stepPlayer. Linjekode = 100·k + n: k = blokk, n = linje.
     Kall-linje: enten fast via calls[k] = kode (f.eks. 3 for «BubbleDownMin(...)»
     i blokk 0), eller per steg ved å legge 1000·kallkode oppå koden
     (f.eks. 5000 + 203 = linje 3 i blokk 2, kalt fra linje 5 i blokk 0).
     Kall-linja må ligge i en annen blokk enn linja som kjører.
     ===================================================================== */
  IN.pseudoGroup = function (handles, calls) {
    calls = calls || {};
    function clearAll() { handles.forEach(function (h) { if (h) h.clear(); }); }
    function on(c) { var k = Math.floor(c / 100); if (handles[k]) handles[k].highlight(c % 100); return k; }
    return {
      highlight: function (code) {
        clearAll();
        var caller = Math.floor(code / 1000), k = on(code % 1000);
        if (caller) on(caller);
        else if (calls[k] != null) on(calls[k]);
      },
      clear: clearAll
    };
  };

  /* ===================== Hjelpere ===================== */
  function isMinHeap(A) { for (var i = 1; i < A.length; i++) if (A[parent(i)] > A[i]) return false; return true; }
  function siftDownMin(A, i, n) {
    while (2 * i + 1 < n) {
      var j = 2 * i + 1;
      if (j + 1 < n && A[j + 1] < A[j]) j++;
      if (A[i] <= A[j]) return;
      var tmp = A[i]; A[i] = A[j]; A[j] = tmp; i = j;
    }
  }
  function buildMin(A) { for (var i = Math.floor(A.length / 2) - 1; i >= 0; i--) siftDownMin(A, i, A.length); return A; }
  function subtree(i, n) { var out = [], q = [i]; while (q.length) { var v = q.shift(); if (v < n) { out.push(v); q.push(2 * v + 1, 2 * v + 2); } } return out; }
  function list(a) { return "[" + a.join(", ") + "]"; }
  function maxPush(H, x) { H.push(x); var i = H.length - 1; while (i > 0 && H[parent(i)] < H[i]) { var p = parent(i), tm = H[p]; H[p] = H[i]; H[i] = tm; i = p; } }
  function maxPop(H) {
    var x = H[0], last = H.pop(); if (!H.length) return x; H[0] = last; var i = 0, n = H.length;
    while (2 * i + 1 < n) { var j = 2 * i + 1; if (j + 1 < n && H[j + 1] > H[j]) j++; if (H[i] >= H[j]) break; var tm = H[i]; H[i] = H[j]; H[j] = tm; i = j; }
    return x;
  }
  function minPush(H, x) { H.push(x); var i = H.length - 1; while (i > 0 && H[parent(i)] > H[i]) { var p = parent(i), tm = H[p]; H[p] = H[i]; H[i] = tm; i = p; } }
  function minPop(H) { var x = H[0], last = H.pop(); if (!H.length) return x; H[0] = last; siftDownMin(H, 0, H.length); return x; }
  IN.heapUtil = { parent: parent, isMinHeap: isMinHeap, buildMin: buildMin, siftDownMin: siftDownMin, subtree: subtree,
                  maxPush: maxPush, maxPop: maxPop, minPush: minPush, minPop: minPop };

  /* Grenseforklaringer. Kurset (forelesning 4 og 9) skriver RemoveMin med
     «< n − 1» uten å endre n, og BuildMaxHeap fra ⌊n/2⌋. Vi følger det. */
  function g(q, a) { return { q: q, a: a }; }

  /* ===================== REMOVEMIN (boble ned) – som i forelesningen ===================== */
  def(IN.algos, "removeMin", {
    title: "RemoveMin – ta ut minste (boble ned)",
    name: "RemoveMin", params: "A",
    input: "Et array A som representerer en heap med n ≥ 1 elementer",
    output: "Det minste elementet. Etterpå er A[0..n − 2] en heap med n − 1 elementer",
    lines: [
      { code: "x ← A[0]", indent: 1,
        eli5: "Det minste tallet ligger alltid helt på toppen. Vi tar vare på det, for det er det vi skal gi fra oss.",
        normal: "Roten er minimum – husk den, den skal returneres.",
        teknisk: "Heap-egenskapen gir at minimum alltid ligger i roten, A[0], så vi finner det på O(1). Jobben er å reparere heapen etterpå." },
      { code: "A[0] ← A[n − 1]", indent: 1,
        eli5: "Nå er toppen tom. Vi tar det aller siste tallet (nederst til høyre) og setter det på toppen.",
        normal: "Flytt siste element opp i roten. Heapen har nå ett element mindre.",
        teknisk: "Vi fyller hullet i roten med siste element. Siste node er den eneste vi kan fjerne og fortsatt ha et komplett tre. Heap-egenskapen kan nå være brutt i roten.",
        grense: g("Hvorfor A[n − 1] og ikke A[n]?",
          t("Vi teller plassene fra 0. Med n tall er den siste plassen derfor n − 1. Plass n er tom.",
            "Med n elementer og 0-indeksering er siste element A[n − 1]. A[n] er første ledige plass, der Insert legger nye elementer. Det er lett å blande de to.",
            "Heapen er A[0..n − 1]. A[n] er neste ledige plass (der Insert skriver), så A[n] ville hentet en verdi som ikke er med i heapen.")) },
      { code: "i ← 0", indent: 1,
        eli5: "Vi følger tallet som nettopp kom på toppen. «i» sier hvor det står.",
        normal: "i følger elementet som skal boble ned.",
        teknisk: "Boble ned starter i roten og vandrer nedover ett nivå per runde." },
      { code: "while 2i + 1 < n − 1 do", indent: 1,
        eli5: "Så lenge tallet vårt har minst ett barn under seg, må vi sjekke om det står riktig.",
        normal: "Fortsett så lenge i har et venstre barn i den krympede heapen.",
        teknisk: "Venstre barn ligger på 2i + 1. Heapen har nå bare n − 1 elementer, så barnet finnes bare hvis 2i + 1 < n − 1. Ellers er i en løvnode, og vi er ferdige.",
        grense: g("Hvorfor «< n − 1» og ikke «< n»?",
          t("Vi flyttet det siste tallet opp på toppen, så heapen har nå ett tall mindre. Den siste plassen hører ikke med lenger.",
            "Etter linje 3 består heapen av n − 1 elementer, A[0..n − 2]. Plass n − 1 hører ikke lenger til heapen, selv om den gamle kopien står der. Prosedyren endrer ikke n, så grensen må skrives n − 1. Mange bøker gjør «n ← n − 1» først og skriver «< n» etterpå. Det er det samme.",
            "Etter flyttingen er heapen A[0..n − 2]. Siden prosedyren lar n stå urørt, finnes venstre barn (2i + 1) bare når 2i + 1 < n − 1. Med «< n» ville vi kunne sammenligne med A[n − 1], en gammel kopi som ikke er med i heapen. 2i + 1 (ikke 2i) er formelen for heaper som starter på plass 0. 2i / 2i + 1 hører til 1-indekserte heaper.")) },
      { code: "j ← 2i + 1", indent: 2,
        eli5: "Vi ser først på barnet til venstre.",
        normal: "j peker på venstre barn.",
        teknisk: "j er kandidaten for det minste barnet; vi starter med venstre." },
      { code: "if j + 1 < n − 1 and A[j + 1] < A[j] then", indent: 2,
        eli5: "Finnes det et høyre barn, og er det enda mindre? Vi vil alltid bytte med det MINSTE barnet.",
        normal: "Har i et høyre barn som er mindre, velg det i stedet.",
        teknisk: "Vi må velge det minste barnet. Bytter vi med det største, havner en større verdi over en mindre søsken, og heap-egenskapen brytes.",
        grense: g("Hvorfor sjekke j + 1 < n − 1, og hvorfor «<» mellom barna?",
          t("Ikke alle har to barn. Før vi ser på høyre barn, sjekker vi at det finnes. Er barna like store, spiller det ingen rolle hvem vi velger.",
            "j + 1 er høyre barn (2i + 2), og det må også ligge innenfor den krympede heapen. Ved likhet beholder vi venstre (streng <). Det er like riktig å velge høyre ved likhet, så lenge vi velger et minste barn.",
            "Høyst én node i heapen har bare ett barn, så vi må sjekke at høyre barn finnes før vi leser det. Streng < gjør at vi velger venstre ved likhet. Det er et fritt valg. Å velge det største barnet er derimot feil.")) },
      { code: "j ← j + 1", indent: 3,
        eli5: "Ja, høyre barn er minst – det er det vi sammenligner med.",
        normal: "Høyre barn (2i + 2) er det minste barnet.",
        teknisk: "j = 2i + 2, høyre barn." },
      { code: "if A[i] ≤ A[j] then", indent: 2,
        eli5: "Er tallet vårt mindre enn eller likt det minste barnet? Da står det riktig!",
        normal: "Står i riktig i forhold til barna? Da er vi ferdige.",
        teknisk: "Er A[i] ≤ det minste barnet, er den ≤ begge barna, og heap-egenskapen holder i hele treet.",
        grense: g("Hvorfor ≤ og ikke <?",
          t("Er tallet vårt likt barnet, står det allerede riktig. Da er det ingen grunn til å bytte.",
            "Heap-egenskapen er «barn ≥ forelder», så likhet er lov. Med < ville vi byttet like verdier unødvendig. Det er fortsatt riktig, men gir ekstra bytter.",
            "Heapen tillater like verdier, så vi kan stoppe straks A[i] ≤ A[j]. Med streng < blir resultatet fortsatt en heap, men like verdier byttes unødig, og vi kan gå helt til bunnen der vi kunne stoppet.")) },
      { code: "return x", indent: 3,
        eli5: "Vi stopper og gir fra oss det minste tallet.",
        normal: "Ferdig: returner det gamle minimumet.",
        teknisk: "Tidlig stopp: resten av heapen var aldri ødelagt." },
      { code: "swap A[i] and A[j]", indent: 2,
        eli5: "Barnet er mindre, så de bytter plass. Det store tallet synker én etasje.",
        normal: "Bytt med det minste barnet.",
        teknisk: "Etter byttet er det minste av de tre øverst, så heap-egenskapen holder lokalt. Feilen kan bare ha flyttet seg ett nivå ned." },
      { code: "i ← j", indent: 2,
        eli5: "Vi følger tallet videre ned dit det havnet.",
        normal: "Følg elementet ned.",
        teknisk: "Fortsett fra barnets plass; høyst én runde per nivå." },
      { code: "return x", indent: 1,
        eli5: "Tallet sank helt til bunnen. Vi gir fra oss det minste tallet vi tok vare på.",
        normal: "Løkka stoppet fordi i ble en løvnode. Returner minimumet.",
        teknisk: "Vi når hit når elementet har sunket helt ned til en løvnode." }
    ],
    bigO: {
      best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)",
      why: t(
        "Treet har bare noen få etasjer, fordi hver etasje har dobbelt så mange plasser som den over. Tallet vi flytter til toppen synker høyst én etasje om gangen.",
        "Elementet som flyttes til roten synker høyst fra roten til en løvnode, altså høyden til treet. Et komplett binærtre med n noder har høyde ⌊log n⌋, så det blir O(log n). Best O(1) hvis elementet står riktig med en gang.",
        "Hver runde gjør konstant arbeid (to sammenligninger og kanskje ett bytte) og flytter i ett nivå ned. Indeksen går fra i til 2i + 1 eller 2i + 2, så i + 1 minst dobles per runde, så det blir høyst ⌊log n⌋ runder. Verste tilfelle er O(log n). Det siste elementet er gjerne stort, så i praksis synker det ofte nesten helt ned. Alt skjer inne i arrayet, så ekstra minne er O(1)."
      )
    }
  });

  /* Felles grense-tekster for BubbleDown (min- og max-versjon) */
  var G_LEFT = g("Hvorfor «left < n» og ikke «≤ n»?",
    t("Vi teller plassene fra 0, så siste plass i heapen er n − 1. Barnet finnes bare hvis plassen er mindre enn n.",
      "n er størrelsen på heapen, og siste gyldige indeks er n − 1. «left < n» betyr altså «venstre barn finnes». Med ≤ ville vi lest A[n], utenfor heapen.",
      "Gyldige indekser er 0 … n − 1. Med ≤ n ville vi lest A[n]. I Heapsort ligger det sortert hale der, så å lese den er en ekte feil, ikke bare en formalitet. 2i + 1 og 2i + 2 er formlene når roten står på 0."));
  var G_RIGHT = g("Hvorfor sjekke høyre barn for seg?",
    "Det kan finnes et venstre barn uten et høyre (den siste interne noden når n er partall). Derfor må «right < n» sjekkes for seg selv før vi leser A[right].");

  /* ===================== BUBBLEDOWN, min-versjon (for BuildMinHeap) ===================== */
  def(IN.algos, "bubbleDownMin", {
    title: "BubbleDown for heap – boble ned fra indeks i",
    name: "BubbleDownMin", params: "A, i, n",
    input: "Et array A, en indeks i og heapstørrelsen n, der begge subtrærne til i allerede er heaper",
    output: "Subtreet med rot i er en heap",
    lines: [
      { code: "smallest ← i", indent: 1,
        eli5: "Vi later først som om tallet vårt er det minste av seg selv og barna.",
        normal: "Anta at i er minst.",
        teknisk: "smallest skal ende opp som indeksen til det minste av A[i] og barna." },
      { code: "left ← 2i + 1", indent: 1,
        eli5: "Barnet til venstre står på plass 2i + 1.",
        normal: "Indeksen til venstre barn.",
        teknisk: "0-indeksert: venstre barn er 2i + 1." },
      { code: "right ← 2i + 2", indent: 1,
        eli5: "Barnet til høyre står rett etter, på 2i + 2.",
        normal: "Indeksen til høyre barn.",
        teknisk: "Høyre barn er 2i + 2." },
      { code: "if left < n and A[left] < A[smallest] then", indent: 1,
        eli5: "Finnes venstre barn, og er det mindre? Da er det det minste så langt.",
        normal: "Er venstre barn mindre enn det minste hittil?",
        teknisk: "Streng < gjør at vi ikke bytter når verdiene er like.",
        grense: G_LEFT },
      { code: "smallest ← left", indent: 2,
        eli5: "Venstre barn er minst så langt.",
        normal: "Venstre barn er minst hittil.",
        teknisk: "Oppdater kandidaten." },
      { code: "if right < n and A[right] < A[smallest] then", indent: 1,
        eli5: "Finnes høyre barn, og er det enda mindre?",
        normal: "Er høyre barn mindre enn det minste hittil?",
        teknisk: "Sammenlign med det beste hittil, ikke med A[i]: slik finner vi minimum av alle tre.",
        grense: G_RIGHT },
      { code: "smallest ← right", indent: 2,
        eli5: "Høyre barn er det minste av alle tre, mindre enn både tallet vårt og venstre barn. Det er det tallet vårt skal bytte plass med.",
        normal: "Høyre barn er minst.",
        teknisk: "Oppdater kandidaten." },
      { code: "if i ≠ smallest then", indent: 1,
        eli5: "Er et av barna mindre enn tallet vårt? Da står det feil.",
        normal: "Står i feil? (Et barn er mindre.)",
        teknisk: "Er i fortsatt minst, holder heap-egenskapen her. Begge subtrærne var allerede heaper, så vi er ferdige." },
      { code: "swap A[i] and A[smallest]", indent: 2,
        eli5: "Tallet bytter plass med det minste barnet og synker én etasje.",
        normal: "Bytt med det minste barnet.",
        teknisk: "Nå er det minste av de tre øverst. Feilen kan bare ha flyttet seg ned i subtreet til smallest." },
      { code: "BubbleDownMin(A, smallest, n)", indent: 2,
        eli5: "Vi gjør det samme på nytt der tallet havnet.",
        normal: "Fortsett nedover (rekursivt).",
        teknisk: "Rekursjonen går ett nivå ned per kall, så dybden er høyst høyden til i." }
    ],
    bigO: {
      best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(log n)",
      why: t(
        "Tallet synker én etasje om gangen, og treet har få etasjer.",
        "Høyst like mange kall som høyden til noden i, altså høyst O(log n) fra roten.",
        "Hvert kall flytter i til 2i + 1 eller 2i + 2, så i + 1 minst dobles. Da blir det høyst ⌊log n⌋ kall fra roten, og bare noen få nær bunnen. Det er nettopp derfor BuildMinHeap blir lineær. Rekursjonen bruker O(log n) plass på kallstakken. En løkke-versjon klarer seg med O(1)."
      )
    }
  });

  /* ===================== BUILDMINHEAP ===================== */
  var G_BUILD = g("Hvorfor starte på ⌊n/2⌋, og hvorfor baklengs?",
    t("Tallene i den bakerste halvdelen har ingen barn, så de kan ikke synke. Vi starter rundt midten og går baklengs mot toppen. En node kan nemlig bare synke riktig når alt under den allerede er i orden.",
      "Siste element står på n − 1, og forelderen er ⌊(n − 2)/2⌋ = ⌊n/2⌋ − 1. Det er den siste noden med barn. Forelesningen starter på ⌊n/2⌋, som alltid er en løvnode, så det gir ett ekstra kall som ikke gjør noe. Begge er riktige. Å starte lavere enn ⌊n/2⌋ − 1 er feil, fordi da hopper vi over noder med barn. Vi går nedover (downto) fordi BubbleDown krever at begge subtrærne allerede er heaper.",
      "Indeksene ⌊n/2⌋ … n − 1 er løvnoder, og hver løvnode er alene en heap. Den siste interne noden er ⌊n/2⌋ − 1. Å starte på ⌊n/2⌋ (som forelesningen) eller høyere er korrekt, bare litt sløsete. Å starte lavere enn ⌊n/2⌋ − 1 er feil. Retningen er viktig. Går vi oppover fra 0, kaller vi BubbleDown på roten før subtrærne er heaper, og da holder ikke forutsetningen. En liten verdi langt nede kan da bli liggende under en større."));
  def(IN.algos, "buildMinHeap", {
    title: "BuildMinHeap – lag en heap av et array på lineær tid",
    name: "BuildMinHeap", params: "A, n",
    input: "Et array A med n elementer i vilkårlig rekkefølge",
    output: "A er omorganisert til en heap",
    lines: [
      { code: "for i ← ⌊n/2⌋ downto 0 do", indent: 1,
        eli5: "Vi starter rundt midten og jobber oss baklengs mot toppen. Tallene bakerst har ingen barn, så de er allerede i orden.",
        normal: "Gå baklengs fra midten til roten. Løvnodene bakerst er allerede heaper.",
        teknisk: "Vi går nedenfra og opp. Når vi kommer til i, er begge subtrærne under i allerede heaper. Det er nettopp forutsetningen BubbleDown trenger.",
        grense: G_BUILD },
      { code: "BubbleDownMin(A, i, n)", indent: 2,
        eli5: "Vi lar tallet på plass i synke ned til det står riktig.",
        normal: "Reparer subtreet med rot i ved å boble ned.",
        teknisk: "Etter kallet er subtreet med rot i en heap (invariant). Når i = 0 er hele arrayet en heap." }
    ],
    bigO: {
      best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(log n)",
      why: t(
        "De fleste tallene ligger nederst og trenger nesten ikke synke. Bare noen få ligger høyt oppe og kan synke langt. Til sammen blir det omtrent ett lite skritt per tall.",
        "Det ser ut som n/2 kall à O(log n) = O(n log n), men det er for grovt. Halvparten av nodene er løvnoder og koster ingenting. En fjerdedel kan synke 1 nivå, en åttendedel 2 nivåer, og så videre. Bare roten kan synke hele veien. Til sammen blir det O(n). Å sette inn n elementer ett og ett koster derimot O(n log n).",
        "Beviset er utenfor pensum, men intuisjonen er en sum. BubbleDown fra i koster høyst like mye som høyden til i. Det er om lag n/4 noder med høyde 1, n/8 med høyde 2, n/16 med høyde 3, og så videre. Løvnodene (n/2 stykker) har høyde 0 og koster ingenting, og derfor starter summen på n/4. Totalarbeidet er høyst n · (1/4 + 2/8 + 3/16 + …). Hvert ledd er høyden ganger andelen noder med den høyden. Leddene krymper raskt fordi nevneren dobles mens telleren bare øker med 1, og summen i parentesen er nøyaktig 1. Totalen er altså høyst n = O(n). Poenget er at de mange nodene nederst er billige, og de få dyre ligger øverst. Med n innsettinger er det motsatt: de mange nye elementene nederst kan måtte boble helt opp, og det gir O(n log n). Plassen er O(log n) fordi BubbleDownMin er rekursiv."
      )
    }
  });

  /* ===================== HEAPSORT (forelesning 9: max-heap, in-place) ===================== */
  def(IN.algos, "heapBubbleDown", {
    title: "BubbleDown for max-heap (hjelpeprosedyre i Heapsort)",
    name: "BubbleDown", params: "A, i, n",
    input: "Et array A, en indeks i og heapstørrelsen n, der begge subtrærne til i allerede er max-heaper",
    output: "Subtreet med rot i er en max-heap",
    lines: [
      { code: "largest ← i", indent: 1,
        eli5: "Vi later først som om tallet vårt er det største av seg selv og barna.",
        normal: "Anta at i er størst.",
        teknisk: "largest skal ende opp som indeksen til det største av A[i] og barna." },
      { code: "left ← 2i + 1", indent: 1,
        eli5: "Venstre barn står på 2i + 1.", normal: "Venstre barn.", teknisk: "0-indeksert venstre barn." },
      { code: "right ← 2i + 2", indent: 1,
        eli5: "Høyre barn står på 2i + 2.", normal: "Høyre barn.", teknisk: "0-indeksert høyre barn." },
      { code: "if left < n and A[largest] < A[left] then", indent: 1,
        eli5: "Finnes venstre barn, og er det større?",
        normal: "Er venstre barn større enn det største hittil?",
        teknisk: "I en max-heap skal forelderen være størst. Vi leter etter det største av de tre.",
        grense: G_LEFT },
      { code: "largest ← left", indent: 2,
        eli5: "Venstre barn er størst så langt.", normal: "Venstre er størst hittil.", teknisk: "Oppdater kandidaten." },
      { code: "if right < n and A[largest] < A[right] then", indent: 1,
        eli5: "Finnes høyre barn, og er det enda større?",
        normal: "Er høyre barn større enn det største hittil?",
        teknisk: "Sammenlign med det beste hittil, så finner vi maksimum av alle tre.",
        grense: G_RIGHT },
      { code: "largest ← right", indent: 2,
        eli5: "Høyre barn er det største av alle tre, større enn både tallet vårt og venstre barn. Det er det tallet vårt skal bytte plass med.", normal: "Høyre er størst.", teknisk: "Oppdater kandidaten." },
      { code: "if i ≠ largest then", indent: 1,
        eli5: "Er et av barna større? Da står tallet vårt feil.",
        normal: "Står i feil?",
        teknisk: "Er i størst, holder max-heap-egenskapen her, og vi er ferdige." },
      { code: "swap A[i] and A[largest]", indent: 2,
        eli5: "Tallet bytter plass med det største barnet og synker én etasje. Nå står det største av de tre øverst.",
        normal: "Bytt med det største barnet.",
        teknisk: "Feilen flytter seg ned i subtreet til largest." },
      { code: "BubbleDown(A, largest, n)", indent: 2,
        eli5: "Fortsett der tallet havnet.",
        normal: "Fortsett nedover (rekursivt).",
        teknisk: "Én rekursjon per nivå: O(log n)." }
    ],
    bigO: {
      best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(log n)",
      why: t("Tallet synker én etasje om gangen, og treet har få etasjer.",
        "Høyst ett kall per nivå: O(log n).",
        "i + 1 minst dobles per kall, så det blir høyst ⌊log n⌋ kall. Rekursjonen bruker O(log n) plass på kallstakken.")
    }
  });
  def(IN.algos, "buildMaxHeap", {
    title: "BuildMaxHeap",
    name: "BuildMaxHeap", params: "A, n",
    input: "Et array A med n elementer",
    output: "A er en max-heap (største element i A[0])",
    lines: [
      { code: "for i ← ⌊n/2⌋ downto 0 do", indent: 1,
        eli5: "Start rundt midten og jobb baklengs mot toppen.",
        normal: "Bygg nedenfra og opp; løvnodene er allerede max-heaper.",
        teknisk: "Samme idé som BuildMinHeap, bare med motsatt sammenligning i BubbleDown.",
        grense: G_BUILD },
      { code: "BubbleDown(A, i, n)", indent: 2,
        eli5: "La tallet på plass i synke til det står riktig.",
        normal: "Reparer subtreet med rot i.",
        teknisk: "Etter kallet er subtreet med rot i en max-heap." }
    ],
    bigO: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(log n)",
      why: t("De fleste tallene trenger nesten ikke synke.", "Samme argument som for BuildMinHeap: O(n).", "Samme sum som for BuildMinHeap: n · (1/4 + 2/8 + 3/16 + …) = n, altså O(n). Beviset er utenfor pensum.") }
  });
  def(IN.algos, "heapSort", {
    title: "Heapsort – sorter med en max-heap, rett i arrayet",
    name: "HeapSort", params: "A",
    input: "Et array A med n elementer",
    output: "A sortert stigende",
    lines: [
      { code: "BuildMaxHeap(A, n)", indent: 1,
        eli5: "Først ordner vi tallene slik at det største ligger på toppen.",
        normal: "Gjør arrayet om til en max-heap på O(n).",
        teknisk: "Etter dette er A[0] det største elementet." },
      { code: "for i ← n − 1 downto 0 do", indent: 1,
        eli5: "Så fyller vi arrayet bakfra: den bakerste plassen først.",
        normal: "i er plassen det neste største elementet skal på.",
        teknisk: "Invariant: A[i + 1..n − 1] er sortert og inneholder de største elementene. A[0..i] er en max-heap.",
        grense: g("Hvorfor n − 1, og hvorfor helt ned til 0?",
          t("Den bakerste plassen er n − 1, fordi vi teller fra 0. Det største tallet skal stå der. Den siste runden (i = 0) bytter tallet med seg selv, så den gjør ingenting, men den skader heller ikke.",
            "Det største elementet hører hjemme på siste plass, A[n − 1]. Forelesningen går ned til 0. Den siste runden bytter A[0] med seg selv og er ufarlig, så «downto 1» er like riktig.",
            "i er neste plass i den sorterte halen, og den første er A[n − 1]. Ved i = 0 er det ett element igjen, og det er det minste, så runden er en ufarlig «swap med seg selv». «downto 1» sparer den runden. Å starte på n ville vært feil, fordi A[n] ikke finnes.")) },
      { code: "swap A[0] and A[i]", indent: 2,
        eli5: "Det største tallet på toppen bytter plass med tallet bakerst. Nå står det største riktig.",
        normal: "Flytt maksimum til plass i.",
        teknisk: "Det tilsvarer en removeMax der det fjernede elementet lagres i plassen som ble ledig." },
      { code: "BubbleDown(A, 0, i)", indent: 2,
        eli5: "Tallet som kom på toppen, synker ned. Men vi rører ikke de tallene som allerede står riktig bakerst.",
        normal: "Reparer heapen A[0..i − 1]. Halen fra i og ut er ferdig.",
        teknisk: "Heapen har nå størrelse i, så vi gir BubbleDown n = i.",
        grense: g("Hvorfor «i» og ikke «n» som størrelse?",
          t("Tallene bakerst står allerede riktig. Gir vi «n», kan BubbleDown dra dem tilbake inn i heapen og ødelegge sorteringen.",
            "Heapen er nå bare A[0..i − 1], altså i elementer. Plassene i, …, n − 1 er den sorterte halen. Med n som størrelse ville BubbleDown sett halen som barn og byttet de største tilbake opp.",
            "Etter byttet hører A[i] til den sorterte halen. Størrelsesparameteren i gjør at «left < i» og «right < i» stenger halen ute. Med n ville en ferdig plassert maksverdi blitt sett på som et barn og boblet tilbake.")) },
      { code: "return A", indent: 1,
        eli5: "Nå står alle tallene i stigende rekkefølge.",
        normal: "A er sortert stigende.",
        teknisk: "Sortert in-place, uten ekstra array." }
    ],
    bigO: {
      best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(log n)", stable: false, inplace: true,
      why: t(
        "Først lager vi heapen ganske raskt. Så tar vi ut det største tallet n ganger, og hver gang går fort fordi treet har få etasjer.",
        "BuildMaxHeap er O(n). Deretter n runder med BubbleDown fra roten, hver O(log n). Totalt O(n log n). Ingen ekstra array, så in-place.",
        "O(n) for BuildMaxHeap pluss n · O(log n) for løkka gir O(n log n), også i verste tilfelle, i motsetning til Quicksort. Den sorterer in-place (bare O(log n) til rekursjonen i BubbleDown; en løkke-versjon klarer O(1)). Den er ikke stabil: byttene over lange avstander kan stokke om like verdier. Prøv for eksempel [1a, 1b]: første runde bytter A[0] og A[1], så 1b havner foran 1a."
      )
    }
  });

  /* ===================== LEVELORDERHEAP (H2025 a) ===================== */
  def(IN.algos, "levelOrderHeap", {
    title: "LevelOrderHeap – en heap er allerede i level-order",
    name: "LevelOrderHeap", params: "A",
    input: "Et array A med n elementer som representerer en binær heap",
    output: "En liste med elementene i level-order",
    lines: [
      { code: "L ← empty list", indent: 1,
        eli5: "Vi lager en tom liste vi skal fylle.",
        normal: "Start med en tom resultatliste.",
        teknisk: "Resultatliste L." },
      { code: "for i ← 0 to n − 1 do", indent: 1,
        eli5: "Vi går gjennom arrayet fra venstre mot høyre.",
        normal: "Gå gjennom arrayet i indeksrekkefølge.",
        teknisk: "Indeksrekkefølgen 0, 1, 2, … er nøyaktig level-order: først roten (nivå 0), så nivå 1 fra venstre, så nivå 2, og så videre.",
        grense: g("Hvorfor «to n − 1» og ikke «to n»?",
          "Vi teller fra 0, så de n elementene ligger på 0 … n − 1. «to» tar med sluttverdien, så «to n» ville lest én plass forbi siste node.") },
      { code: "append A[i] to L", indent: 2,
        eli5: "Vi legger tallet bakerst i lista.",
        normal: "Legg A[i] bakerst i lista.",
        teknisk: "O(1) per element." },
      { code: "return L", indent: 1,
        eli5: "Lista er ferdig – og den er helt lik arrayet!",
        normal: "L er identisk med A.",
        teknisk: "Heapen fylles nivå for nivå fra venstre, så arrayet er i seg selv svaret. Total O(n)." }
    ],
    bigO: {
      best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(n)",
      why: t(
        "Vi ser på hvert tall nøyaktig én gang.",
        "Én gjennomgang av n elementer: O(n). Lista vi returnerer tar O(n) plass.",
        "Hvert element kopieres nøyaktig én gang, så tiden er O(n). Den nye lista tar O(n) plass. Å returnere A direkte gir samme svar uten kopi."
      )
    }
  });

  /* ===================== MEDIANKØ (H2024) ===================== */
  def(IN.algos, "medianInsert", {
    title: "Mediankø: insert",
    name: "MedianInsert", params: "Q, x",
    input: "En mediankø Q med en max-heap Q.small (nedre halvdel), en heap Q.large (øvre halvdel) og et element x",
    output: "x er satt inn, og Q er balansert",
    lines: [
      { code: "if |Q.small| = 0 or x < Peek(Q.small) then", indent: 1,
        eli5: "Er x mindre enn det største tallet i den nedre bunken? Da hører det hjemme der.",
        normal: "Hører x til nedre halvdel? Sammenlign med toppen av Q.small (største i nedre halvdel).",
        teknisk: "Peek gir roten i O(1). Alt i Q.small skal være ≤ alt i Q.large." },
      { code: "Insert(Q.small, x)", indent: 2,
        eli5: "Legg x i den nedre bunken.",
        normal: "Sett x inn i max-heapen for nedre halvdel.",
        teknisk: "O(log n) med boble opp (speilvendt sammenligning)." },
      { code: "else Insert(Q.large, x)", indent: 1,
        eli5: "Ellers legger vi x i den øvre bunken.",
        normal: "Ellers: sett x inn i heapen for øvre halvdel.",
        teknisk: "O(log n)." },
      { code: "Balance(Q)", indent: 1,
        eli5: "Til slutt passer vi på at bunkene er like store, eller at den nedre har ett ekstra.",
        normal: "Gjenopprett størrelsesregelen.",
        teknisk: "Invariant: |Q.small| = |Q.large| eller |Q.small| = |Q.large| + 1. Da er toppen av Q.small medianen." }
    ],
    bigO: {
      best: "O(log n)", avg: "O(log n)", worst: "O(log n)", space: "O(1)",
      why: t(
        "Vi legger tallet i én av to bunker og flytter kanskje ett tall over. Begge delene går fort.",
        "Én innsetting pluss høyst én flytting mellom heapene, alle O(log n).",
        "Konstant mange heap-operasjoner (Insert, og i Balance høyst én Remove og én Insert), hver O(log n). Totalt O(log n)."
      )
    }
  });
  def(IN.algos, "medianBalance", {
    title: "Mediankø: balance",
    name: "Balance", params: "Q",
    input: "En mediankø Q der størrelsene kan være skjeve med ett element",
    output: "|Q.small| = |Q.large| eller |Q.small| = |Q.large| + 1",
    lines: [
      { code: "if |Q.small| > |Q.large| + 1 then", indent: 1,
        eli5: "Har den nedre bunken blitt for stor?",
        normal: "Har nedre halvdel to flere enn øvre?",
        teknisk: "Skjevhet etter innsetting i Q.small.",
        grense: g("Hvorfor «+ 1»?",
          t("Den nedre bunken får lov å ha ett ekstra tall. Det er det ekstra tallet som er medianen når antallet er oddetall.",
            "Q.small får ha ett element mer enn Q.large, så medianen ligger på toppen av Q.small også ved oddetall. Uten + 1 ville vi flyttet frem og tilbake hver gang antallet er oddetall.",
            "Invarianten er |Q.small| − |Q.large| ∈ {0, 1}. Ved oddetall må det midterste elementet ligge et sted, og vi har valgt Q.small. Da er roten der medianen i begge tilfeller, og ved partall er den automatisk den minste av de to midterste, som oppgaven krever.")) },
      { code: "Insert(Q.large, RemoveMax(Q.small))", indent: 2,
        eli5: "Flytt det største tallet fra den nedre bunken over til den øvre.",
        normal: "Flytt største fra nedre til øvre halvdel.",
        teknisk: "Største i nedre halvdel er ≤ alt i øvre, så ordningen bevares." },
      { code: "if |Q.small| < |Q.large| then", indent: 1,
        eli5: "Har den øvre bunken blitt større enn den nedre?",
        normal: "Har øvre halvdel for mange?",
        teknisk: "Skjevhet etter innsetting i Q.large eller etter removeMedian." },
      { code: "Insert(Q.small, RemoveMin(Q.large))", indent: 2,
        eli5: "Flytt det minste tallet fra den øvre bunken ned til den nedre.",
        normal: "Flytt minste fra øvre til nedre halvdel.",
        teknisk: "Minste i øvre halvdel er ≥ alt i nedre, så ordningen bevares." }
    ],
    bigO: {
      best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)",
      why: t("Høyst ett tall flyttes.", "Høyst én flytting à O(log n).", "Høyst ett RemoveMax/RemoveMin og ett Insert, hver O(log n). Er størrelsene allerede i orden, er det O(1).")
    }
  });
  def(IN.algos, "removeMedian", {
    title: "Mediankø: removeMedian",
    name: "RemoveMedian", params: "Q",
    input: "En ikke-tom, balansert mediankø Q",
    output: "Medianen (ved partall antall: den minste av de to midterste)",
    lines: [
      { code: "x ← RemoveMax(Q.small)", indent: 1,
        eli5: "Medianen ligger alltid på toppen av den nedre bunken. Vi tar den.",
        normal: "Toppen av Q.small er medianen.",
        teknisk: "Med invarianten fra Balance er roten i Q.small det midterste elementet. Ved partall er den det minste av de to midterste, akkurat slik oppgaven krever." },
      { code: "Balance(Q)", indent: 1,
        eli5: "Nå kan den øvre bunken ha blitt for stor, så vi passer på størrelsene igjen.",
        normal: "Gjenopprett størrelsesregelen.",
        teknisk: "Etter uttaket kan |Q.small| < |Q.large|." },
      { code: "return x", indent: 1,
        eli5: "Vi gir fra oss medianen.",
        normal: "Returner medianen.",
        teknisk: "O(log n) totalt." }
    ],
    bigO: {
      best: "O(log n)", avg: "O(log n)", worst: "O(log n)", space: "O(1)",
      why: t("Ett uttak og kanskje én flytting – begge går fort.", "RemoveMax pluss Balance: O(log n).", "Ett RemoveMax på O(log n) og en Balance som også er O(log n).")
    }
  });

  /* =====================================================================
     STEGGENERATORER
     Steg: { line, array, size, marks, edge, out, text, tag }
     ===================================================================== */

  /* --- HeapInsert: setter inn tallene ett og ett (gjentatt HeapInsert) ---
     Linjer (data-algos.js): 2 A[n] ← x · 3 i ← n · 4 while … · 5 swap · 6 i ← forelder */
  function genInsert(vals, start, opts) {
    opts = opts || {};
    var A = start ? clone(start) : [], steps = [];
    function snap(line, marks, text, tag, edge, vars) {
      marks = marks || {};
      if (vars) marks.vars = vars;
      steps.push({ line: line, array: clone(A), size: A.length, marks: marks, edge: edge || null, text: text, tag: tag });
    }
    if (!opts.quiet) {
      snap(null, { ghost: true },
        A.length
          ? t("Her er heapen vi starter med. Nå skal " + vals.join(", ") + " inn. Den stiplede ringen viser første ledige plass.",
              "Start: heap " + list(A) + ". Setter inn " + vals.join(", ") + ".",
              "Utgangspunkt: en gyldig heap med n = " + A.length + ". Vi kaller HeapInsert(A, x) for x = " + vals.join(", ") + ".")
          : t("Vi starter med en tom heap. Tallene " + vals.join(", ") + " skal inn ett og ett. Den stiplede ringen viser hvor neste tall havner.",
              "Tom heap. Setter inn " + vals.join(", ") + " ett om gangen med HeapInsert.",
              "Utgangspunkt: tom heap (n = 0). Vi kaller HeapInsert(A, x) for hvert tall i rekkefølge: " + vals.join(", ") + "."),
        "Start");
    }
    vals.forEach(function (x, vi) {
      var n = A.length;
      A.push(x);
      snap(2, { target: n },
        t(x + " legges på første ledige plass nederst i treet (plass " + n + "). Da er treet fortsatt fylt opp fra venstre.",
          "A[" + n + "] ← " + x + ": legg " + x + " bakerst.",
          "Vi plasserer " + x + " på indeks n = " + n + ". Treet er fortsatt komplett, men heap-egenskapen kan være brutt mellom " + x + " og forelderen."),
        "Sett inn " + x, null, [["x", x], ["n", n]]);
      var i = n;
      snap(3, { target: i },
        t("Vi følger " + x + " med «i» = " + i + ".", "i ← " + i + ".", "i ← " + i + ": boble opp starter i den nye løvnoden."), null, null, [["x", x], ["i", i]]);
      while (true) {
        if (i === 0) {
          snap(4, { target: 0 },
            n === 0
              ? t(x + " er det første tallet, så det står allerede i roten. Ingenting å gjøre.",
                  "i = 0: heapen var tom, og " + x + " står i roten. Løkka stopper med en gang.",
                  "i = 0, så løkkevilkåret er usant. Heapen hadde bare dette ene elementet.")
              : t(x + " har klatret helt til toppen. Nå er det det minste tallet i hele heapen.",
              "i = 0: roten er nådd, løkka stopper.",
              "i = 0, så løkkevilkåret er usant. " + x + " er nytt minimum i roten."), n === 0 ? "Første element" : "Roten nådd", null,
            [["x", x], ["i", 0], ["i > 0?", "nei"]]);
          break;
        }
        var p = parent(i);
        if (A[p] > A[i]) {
          snap(4, { compare: [p, i] },
            t("Forelderen " + A[p] + " er større enn " + A[i] + ". Det minste skal stå øverst, så de må bytte.",
              "Forelder A[" + p + "] = " + A[p] + " > A[" + i + "] = " + A[i] + ": heap-egenskapen er brutt.",
              "Forelderen til " + i + " er ⌊(" + i + " − 1)/2⌋ = " + p + ". Siden " + A[p] + " > " + A[i] + " holder løkkevilkåret, og vi må boble opp."),
            "Sammenlign", [p, i], [["x", x], ["i", i], ["forelder", p], ["A[" + p + "] > A[" + i + "]?", A[p] + " > " + A[i] + ": ja"]]);
          var tmp = A[p]; A[p] = A[i]; A[i] = tmp;
          snap(5, { swap: [p, i] },
            t(A[p] + " og " + A[i] + " bytter plass. Det lille tallet flytter én etasje opp.",
              "Bytt A[" + i + "] og A[" + p + "].",
              "Etter byttet holder heap-egenskapen mellom " + p + " og barna. En eventuell feil finnes nå bare mellom " + p + " og forelderen dens."),
            "Bytt", [p, i], [["x", x], ["i", i], ["forelder", p]]);
          i = p;
          snap(6, { target: i },
            t("Vi følger " + A[i] + " opp til plass " + i + " og sjekker igjen.", "i ← " + i + ".", "i ← ⌊(i − 1)/2⌋ = " + i + "."), null, null, [["x", x], ["i", i]]);
        } else {
          snap(4, { compare: [p, i] },
            t("Forelderen " + A[p] + " er ikke større enn " + A[i] + ". Da står " + A[i] + " riktig, og vi er ferdige med dette tallet.",
              "A[" + p + "] = " + A[p] + " ≤ " + A[i] + ": heap-egenskapen holder, stopp.",
              "Vilkåret A[" + p + "] > A[" + i + "] er usant, så " + A[i] + " står riktig og løkka avslutter."),
            "Stopp", [p, i], [["x", x], ["i", i], ["forelder", p], ["A[" + p + "] > A[" + i + "]?", A[p] + " > " + A[i] + ": nei"]]);
          break;
        }
      }
      // «Heap nå» etter siste tall ville vært nesten likt «Ferdig»-steget under, så det hoppes over
      if (!opts.quiet && vi < vals.length - 1) snap(null, { ghost: true },
        t("Heapen nå: " + list(A) + ".", "A = " + list(A) + ".", "Etter HeapInsert(A, " + x + "): A = " + list(A) + ", n = " + A.length + "."), "Heap nå");
    });
    if (!opts.quiet) {
      var last = vals[vals.length - 1];
      steps.push({ line: null, array: clone(A), size: A.length, marks: { sorted: A.map(function (_, k) { return k; }) },
        text: t("Ferdig! Heapen er " + list(A) + ". Det minste tallet ligger på toppen.",
                "Ferdig etter HeapInsert(A, " + last + "). Sluttilstand: " + A.join(", ") + ".",
                "Ferdig. Sluttilstand: " + A.join(", ") + " (n = " + A.length + "). Hver innsetting kostet O(log n), så " + vals.length + " innsettinger koster O(n log n) til sammen."),
        tag: "Ferdig" });
    }
    return steps;
  }
  def(IN.gen, "heapInsert", function (vals) { return genInsert(vals, null); });
  IN.gen.heapInsertInto = IN.gen.heapInsertInto || genInsert;

  /* --- RemoveMin, gjentatt (standard: 3 uttak) ---
     Linjer: 2 x←A[0] · 3 A[0]←A[n−1] · 4 i←0 · 5 while 2i+1 < n−1 · 6 j←2i+1 · 7 if høyre · 8 j←j+1
             9 if A[i]≤A[j] · 10 return x (tidlig) · 11 swap · 12 i←j · 13 return x */
  function genRemoveMin(arr, count, opts) {
    opts = opts || {};
    var A = clone(arr), steps = [], out = clone(opts.out || []);
    var wasHeap = isMinHeap(A);
    if (!wasHeap) buildMin(A);
    var reps = Math.min(count == null ? 3 : count, A.length);
    function snap(line, marks, size, text, tag, edge, vars) {
      marks = marks || {};
      if (vars) marks.vars = vars;
      steps.push({ line: line, array: clone(A), size: size, marks: marks, edge: edge || null, out: clone(out), outLabel: "Tatt ut (i rekkefølge)", text: text, tag: tag });
    }
    function ganger(k) { return k + (k === 1 ? " gang" : " ganger"); }
    if (!opts.quiet) {
      snap(null, {}, A.length,
        wasHeap
          ? t("Her er heapen. Vi skal ta ut det minste tallet " + ganger(reps) + ".",
              "Heap " + list(A) + ". Kaller RemoveMin " + ganger(reps) + ".",
              "Utgangspunkt: gyldig heap med n = " + A.length + ". Vi kaller RemoveMin(A) " + ganger(reps) + ".")
          : t("Tallene du ga var ikke en heap, så vi gjorde dem om til en heap først (med BuildMinHeap). Nå tar vi ut det minste " + ganger(reps) + ".",
              "Input var ikke en heap – laget heap først: " + list(A) + ".",
              "Input brøt heap-egenskapen, så vi kjørte BuildMinHeap først (O(n)). Heap: " + list(A) + "."),
        "Start");
    }
    for (var r = 0; r < reps; r++) {
      var n = A.length, x = A[0], m = n - 1, X = ["x (tas ut)", x];
      snap(2, { min: 0 }, n,
        t("Det minste tallet, " + x + ", ligger alltid på toppen. Vi tar vare på det.", "x ← A[0] = " + x + ".", "Minimum ligger i roten: x ← A[0] = " + x + ". Her er n = " + n + "."), "Minste = " + x, null, [X]);
      A[0] = A[n - 1];
      snap(3, n > 1 ? { moved: [0, n - 1] } : { min: 0 }, n,
        n > 1
          ? t("Det siste tallet, " + A[0] + ", kopieres opp på toppen for å fylle hullet. Det er en flytting, ikke et bytte: " + x + " ligger trygt i x. Den bakerste plassen hører ikke med lenger.",
              "A[0] ← A[" + (n - 1) + "] = " + A[0] + " (en kopi, ikke et bytte). Heapen har nå n − 1 = " + m + " elementer.",
              "Hullet i roten fylles med en kopi av siste element, A[" + (n - 1) + "] = " + A[0] + ". Heapen er nå A[0.." + (m - 1) + "], altså n − 1 = " + m + " elementer.")
          : t("Det var bare ett tall, så toppen er også det siste. Nå er heapen tom.", "n = 1: heapen blir tom.", "n = 1: n − 1 = 0, heapen er tom etterpå."),
        n > 1 ? "Siste kopieres til roten" : "Siste til roten", null, [X]);
      A.pop();
      var i = 0, stopped = false;
      if (m > 0) snap(4, { target: 0 }, m,
        t("Nå følger vi " + A[0] + " fra toppen. (Den gamle bakerste plassen er fjernet fra tegningen.)", "i ← 0. Grensen i løkka er n − 1 = " + m + ".", "Boble ned starter i roten. Heapen har n − 1 = " + m + " elementer, og det er grensen løkka bruker."), null, null, [X, ["i", 0]]);
      while (2 * i + 1 < m) {
        var j = 2 * i + 1;
        snap(5, { target: i }, m,
          t(A[i] + " har barn under seg, så vi må sjekke om det står riktig.", "2i + 1 = " + j + " < n − 1 = " + m + ": i har minst ett barn.", "Venstre barn 2·" + i + " + 1 = " + j + " ligger innenfor heapen (< n − 1 = " + m + "), så " + i + " er ikke en løvnode."), null, null,
          [X, ["i", i], ["2i + 1 < n − 1?", j + " < " + m + ": ja"]]);
        snap(6, { target: i, compare: [j] }, m, t("Vi ser først på barnet til venstre: " + A[j] + ".", "j ← " + j + " (venstre barn).", "j ← 2i + 1 = " + j + "."), null, null, [X, ["i", i], ["j", j]]);
        if (j + 1 < m) {
          var right = A[j + 1] < A[j];
          snap(7, { target: i, compare: [j, j + 1] }, m,
            t("Hvilket barn er minst: " + A[j] + " eller " + A[j + 1] + "? " + (right ? "Høyre (" + A[j + 1] + ")." : "Venstre (" + A[j] + ")."),
              "Barn: A[" + j + "] = " + A[j] + ", A[" + (j + 1) + "] = " + A[j + 1] + " → minste er " + (right ? "høyre" : "venstre") + ".",
              "Vi må velge det minste barnet: min(" + A[j] + ", " + A[j + 1] + ") = " + Math.min(A[j], A[j + 1]) + (right ? "" : ". Ved likhet beholder vi venstre") + "."),
            "Minste barn", null, [X, ["i", i], ["j", j], ["A[j + 1] < A[j]?", A[j + 1] + " < " + A[j] + ": " + (right ? "ja" : "nei")]]);
          if (right) { j = j + 1; snap(8, { target: i, compare: [j] }, m, t("Vi går videre med høyre barn.", "j ← " + j + ".", "j ← j + 1 = " + j + " (høyre barn)."), null, null, [X, ["i", i], ["j", j]]); }
        } else {
          snap(7, { target: i, compare: [j] }, m,
            t(A[i] + " har bare ett barn: " + A[j] + ".", "Ingen høyre barn (j + 1 = " + (j + 1) + " er ikke < " + m + ").", "j + 1 = " + (j + 1) + " er ikke < n − 1 = " + m + ", så bare venstre barn finnes."), null, null,
            [X, ["i", i], ["j", j], ["j + 1 < n − 1?", (j + 1) + " < " + m + ": nei"]]);
        }
        if (A[i] <= A[j]) {
          snap(9, { target: i, compare: [j] }, m,
            t(A[i] + " er ikke større enn " + A[j] + ", så det står riktig. Vi stopper.", "A[i] = " + A[i] + " ≤ A[j] = " + A[j] + ": heap-egenskapen holder.", A[i] + " ≤ " + A[j] + ", så heap-egenskapen holder, og vi er ferdige."), "Står riktig", [i, j],
            [X, ["i", i], ["j", j], ["A[i] ≤ A[j]?", A[i] + " ≤ " + A[j] + ": ja"]]);
          out.push(x);
          snap(10, {}, m,
            t("Vi gir fra oss " + x + ". Heapen er i orden igjen: " + list(A) + ".", "return " + x + ". Heap nå: " + list(A) + ".", "return " + x + " (tidlig stopp). Heapen er gyldig igjen: " + list(A) + "."), "Returner " + x);
          stopped = true;
          break;
        }
        snap(9, { target: i, compare: [j] }, m,
          t(A[i] + " er større enn barnet " + A[j] + ". Det er feil, så de må bytte.", "A[i] = " + A[i] + " > A[j] = " + A[j] + ": må bytte.", A[i] + " > " + A[j] + ", så heap-egenskapen er brutt mellom " + i + " og " + j + "."), "Sammenlign", [i, j],
          [X, ["i", i], ["j", j], ["A[i] ≤ A[j]?", A[i] + " ≤ " + A[j] + ": nei"]]);
        var tmp = A[i]; A[i] = A[j]; A[j] = tmp;
        snap(11, { swap: [i, j] }, m,
          t(A[i] + " og " + A[j] + " bytter plass. Det store tallet synker én etasje.", "Bytt A[" + i + "] og A[" + j + "].", "Etter byttet er det minste av de tre øverst. Feilen kan bare ha flyttet seg ned til " + j + "."), "Bytt", [i, j], [X, ["i", i], ["j", j]]);
        i = j;
        snap(12, { target: i }, m, t("Vi følger " + A[i] + " videre ned.", "i ← " + i + ".", "i ← j = " + i + "."), null, null, [X, ["i", i]]);
      }
      if (!stopped) {
        if (m > 0) snap(5, { target: i }, m,
          t(A[i] + " har ingen barn under seg, så det kan ikke synke mer.", "2i + 1 = " + (2 * i + 1) + " er ikke < n − 1 = " + m + ": i er en løvnode.", "2·" + i + " + 1 = " + (2 * i + 1) + " ≥ n − 1 = " + m + ", så " + i + " er en løvnode og løkka stopper."), null, null,
          [X, ["i", i], ["2i + 1 < n − 1?", (2 * i + 1) + " < " + m + ": nei"]]);
        out.push(x);
        snap(13, {}, m,
          t("Vi gir fra oss " + x + ". Heapen er i orden igjen: " + list(A) + ".",
            "return " + x + ". Heap nå: " + list(A) + ".",
            "return " + x + ". Heapen er gyldig igjen: " + list(A) + "."), "Returner " + x);
      }
    }
    if (!opts.quiet) steps.push({ line: null, array: clone(A), size: A.length, marks: {}, out: clone(out), outLabel: "Tatt ut (i rekkefølge)",
      text: out.length > 1
        ? t("Ferdig! Legg merke til at tallene kom ut i stigende rekkefølge: " + out.join(", ") + ". Det er dette som gjør heapen til en prioritetskø.",
            "Tatt ut: " + out.join(", ") + " – alltid minste først. Heap igjen: " + list(A) + ".",
            "Tatt ut i stigende rekkefølge: " + out.join(", ") + ". Gjentatte RemoveMin gir sortert rekkefølge. Det er ideen bak Heapsort.")
        : t("Ferdig! Vi tok ut det minste tallet, " + out[0] + ". Neste gang ligger det nye minste tallet klart på toppen.",
            "Tatt ut: " + out[0] + ". Heap igjen: " + list(A) + ".",
            "RemoveMin ga " + out[0] + ", og heapen " + list(A) + " er gyldig igjen. O(log n)."),
      tag: "Ferdig" });
    return steps;
  }
  def(IN.gen, "removeMin", function (arr) { return genRemoveMin(arr, 3); });
  // Parsons: «x ← A[0]» må stå først (før roten overskrives). «A[0] ← A[n − 1]» og «i ← 0» er uavhengige og kan byttes.
  if (IN.algos.removeMin) IN.algos.removeMin.parsonsSwap = [[1, 2]];

  /* --- Felles: rekursiv BubbleDown som steg (min eller max) ---
     base = linjekode for linje 0 i BubbleDown-blokka (100 eller 200), så +2 … +11.
     caller = linjekode (i en annen blokk) som skal lyse samtidig. */
  function bubbleSteps(A, i0, n, isMax, base, caller, snap, counter) {
    var better = isMax ? function (a, b) { return a > b; } : function (a, b) { return a < b; };
    var word = isMax ? "største" : "minste", bigW = isMax ? "størst" : "minst", key = isMax ? "largest" : "smallest";
    var code = function (l) { return (caller ? caller * 1000 : 0) + base + l; };
    var i = i0;
    function V(s, l, r, extra) { var v = [["i", i], [key, s], ["left", l], ["right", r]]; if (extra) v.push(extra); return v; }
    function M(m, vars) { m.vars = vars; return m; }
    while (true) {
      var s = i, l = 2 * i + 1, r = 2 * i + 2;
      snap(code(2), M({ target: i }, V(s, l, r)),
        t("Vi ser på " + A[i] + " (plass " + i + ") og barna under.", key + " ← " + i + ", left = " + l + ", right = " + r + ".", key + " ← " + i + "; barna har indeks 2i + 1 = " + l + " og 2i + 2 = " + r + "."), null);
      if (l < n) {
        var bl = better(A[l], A[s]);
        snap(code(5), M({ target: i, compare: [l] }, V(s, l, r, ["left < n og A[left] " + (isMax ? ">" : "<") + " A[" + key + "]?", A[l] + (isMax ? " > " : " < ") + A[s] + ": " + (bl ? "ja" : "nei")])),
          t("Venstre barn er " + A[l] + ". Er det " + bigW + " så langt? " + (bl ? "Ja." : "Nei."), "A[left] = " + A[l] + " mot A[" + key + "] = " + A[s] + ": " + (bl ? "ja" : "nei") + ".", "left = " + l + " < n = " + n + ". " + A[l] + (bl ? (isMax ? " > " : " < ") : (isMax ? " ≤ " : " ≥ ")) + A[s] + "."), null, [i, l]);
        if (bl) { s = l; snap(code(6), M({ target: i, compare: [l] }, V(s, l, r)), t("Venstre barn er " + bigW + " hittil.", key + " ← " + l + ".", key + " ← left = " + l + "."), null); }
      } else {
        snap(code(5), M({ target: i }, V(s, l, r, ["left < n?", l + " < " + n + ": nei"])), t(A[i] + " har ingen barn.", "left = " + l + " er ikke < n = " + n + ".", "left = " + l + " ≥ n = " + n + ": løvnode."), null);
      }
      if (r < n) {
        var br = better(A[r], A[s]);
        snap(code(7), M({ target: i, compare: s === i ? [r] : [s, r] }, V(s, l, r, ["right < n og A[right] " + (isMax ? ">" : "<") + " A[" + key + "]?", A[r] + (isMax ? " > " : " < ") + A[s] + ": " + (br ? "ja" : "nei")])),
          t("Høyre barn er " + A[r] + ". Er det enda " + (isMax ? "større" : "mindre") + "? " + (br ? "Ja." : "Nei."), "A[right] = " + A[r] + " mot A[" + key + "] = " + A[s] + ": " + (br ? "ja" : "nei") + ".", "right = " + r + " < n. Sammenlign med beste hittil, A[" + s + "] = " + A[s] + "."), null, [i, r]);
        if (br) { s = r; snap(code(8), M({ target: i, compare: [r] }, V(s, l, r)), t("Høyre barn er " + bigW + ".", key + " ← " + r + ".", key + " ← right = " + r + "."), null); }
      } else if (l < n) {
        snap(code(7), M({ target: i }, V(s, l, r, ["right < n?", r + " < " + n + ": nei"])), t("Det finnes ikke noe høyre barn.", "right = " + r + " er ikke < n.", "right = " + r + " ≥ n = " + n + ": bare venstre barn."), null);
      }
      if (s === i) {
        snap(code(9), M({ target: i }, V(s, l, r, ["i ≠ " + key + "?", i + " ≠ " + s + ": nei"])),
          t(A[i] + " står riktig. Ferdig med dette tallet.", "i = " + key + ": ferdig.", "i = " + key + ", så subtreet med rot " + i + " er en " + (isMax ? "max-heap" : "heap") + "."), "Står riktig");
        return;
      }
      snap(code(9), M({ target: i, compare: [s] }, V(s, l, r, ["i ≠ " + key + "?", i + " ≠ " + s + ": ja"])), t("Barnet " + A[s] + " er " + word + ", så tallet står feil.", "i ≠ " + key + " (" + s + ").", "i ≠ " + key + " = " + s + ": må bytte."), null, [i, s]);
      var tmp = A[i]; A[i] = A[s]; A[s] = tmp;
      if (counter) counter.swaps++;
      snap(code(10), M({ swap: [i, s] }, V(s, l, r)),
        t(A[s] + " og " + A[i] + " bytter plass." + (counter ? " (Bytter så langt: " + counter.swaps + ".)" : ""), "Bytt A[" + i + "] og A[" + s + "].", "Bytt: " + A[i] + " opp, " + A[s] + " ned ett nivå." + (counter ? " Bytter totalt: " + counter.swaps + "." : "")), "Bytt", [i, s]);
      snap(code(11), M({ target: s }, [["kall", (isMax ? "BubbleDown" : "BubbleDownMin") + "(A, " + s + ", " + n + ")"]]), t("Vi fortsetter der " + A[s] + " havnet.", "Rekursivt kall fra " + s + ".", "Rekursjon: " + (isMax ? "BubbleDown" : "BubbleDownMin") + "(A, " + s + ", " + n + ")."), null);
      i = s;
    }
  }

  /* --- BuildMinHeap (0xx) med BubbleDownMin (1xx) ---
     BuildMinHeap: 2 for · 3 BubbleDownMin(A, i, n) */
  function genBuildMin(arr) {
    var A = clone(arr), n = A.length, steps = [], counter = { swaps: 0 }, done = [];
    for (var z = Math.floor(n / 2); z < n; z++) done.push(z);
    function snap(line, marks, text, tag, edge) {
      marks = marks || {};
      marks.sorted = clone(done);
      steps.push({ line: line, array: clone(A), size: n, marks: marks, edge: edge || null, text: text, tag: tag });
    }
    snap(null, {},
      t("Her er tallene, lagt inn i treet akkurat slik de står i arrayet. Det er ikke en heap ennå. De grønne bakerst har ingen barn, så de er allerede i orden.",
        "Arrayet " + list(A) + " sett som et komplett tre. Løvnodene (grønne, indeks " + Math.floor(n / 2) + "–" + (n - 1) + ") er allerede heaper.",
        "Utgangspunkt: et vilkårlig array. Hver løvnode (indeks ≥ ⌊n/2⌋ = " + Math.floor(n / 2) + ") er alene en heap. Vi jobber nedenfra og opp, så begge subtrærne er ferdige heaper når vi kommer til en node."),
      "Start");
    for (var i0 = Math.floor(n / 2); i0 >= 0; i0--) {
      var leaf = 2 * i0 + 1 >= n;
      snap(2, { target: i0 },
        leaf
          ? t("Vi starter på plass " + i0 + ". Den har ingen barn, så her skjer det ingenting. Kurset starter likevel her, og det er helt greit.",
              "i = ⌊n/2⌋ = " + i0 + ": en løvnode, så kallet gjør ingenting.",
              "i = ⌊n/2⌋ = " + i0 + " er alltid en løvnode. Forelesningen starter her; ⌊n/2⌋ − 1 hadde spart dette ene, tomme kallet.")
          : t("Neste plass: " + i0 + " (" + A[i0] + "). Vi lar tallet synke til det står riktig.",
              "i = " + i0 + ": BubbleDownMin fra " + i0 + ".",
              "i = " + i0 + ". Begge subtrærne under " + i0 + " er allerede heaper, så BubbleDownMin(A, " + i0 + ", n) gjør hele subtreet til en heap."),
        "i = " + i0);
      if (leaf) continue;
      snap(3, { target: i0 }, t("Vi kaller BubbleDownMin på plass " + i0 + ".", "BubbleDownMin(A, " + i0 + ", " + n + ").", "Kall: BubbleDownMin(A, " + i0 + ", " + n + ")."), null);
      bubbleSteps(A, i0, n, false, 100, 3, snap, counter);
      subtree(i0, n).forEach(function (v) { if (done.indexOf(v) < 0) done.push(v); });
      snap(3, {},
        t("Nå er hele grenen under plass " + i0 + " i orden (grønn).", "Subtreet med rot " + i0 + " er en heap.", "Invariant: alle subtrær med rot ≥ " + i0 + " er heaper."), null);
    }
    snap(2, { vars: [["i", -1], ["i ≥ 0?", "nei"]] },
      t("Vi har vært innom alle plassene fra " + Math.floor(n / 2) + " og ned til 0. Da er løkka ferdig.",
        "i = −1: for-løkka (ned til 0) er ferdig.",
        "Etter i = 0 blir i = −1, og løkka stopper. Invarianten gjelder nå for roten, så hele arrayet er en heap."), "Løkka stopper");
    steps.push({ line: null, array: clone(A), size: n, marks: { sorted: A.map(function (_, k) { return k; }) },
      text: t("Ferdig! Hele treet er en heap: " + list(A) + ". Vi trengte bare " + counter.swaps + " bytter.",
              "Heap: " + list(A) + ". Totalt " + counter.swaps + " bytter (n = " + n + ").",
              "Ferdig: " + list(A) + ". " + counter.swaps + " bytter for n = " + n + ". Antall bytter er alltid under n, og det er derfor BuildMinHeap er O(n)."),
      tag: "Ferdig" });
    return steps;
  }
  def(IN.gen, "buildMinHeap", genBuildMin);

  /* --- Heapsort (forelesning 9): 0xx HeapSort · 1xx BuildMaxHeap · 2xx BubbleDown (max) ---
     HeapSort: 2 BuildMaxHeap · 3 for · 4 swap · 5 BubbleDown(A, 0, i) · 6 return A
     BuildMaxHeap: 2 for · 3 BubbleDown(A, i, n) */
  function genHeapSort(arr) {
    var A = clone(arr), n = A.length, steps = [], size = n;
    function snap(line, marks, text, tag, edge) {
      steps.push({ line: line, array: clone(A), size: size, marks: marks || {}, edge: edge || null, text: text, tag: tag });
    }
    snap(null, {}, t("Vi skal sortere " + list(A) + ". Først lager vi en max-heap, der det STØRSTE tallet ligger øverst.",
      "Input " + list(A) + ". Fase 1: BuildMaxHeap. Fase 2: flytt maks bakerst, n ganger.",
      "Heapsort fra forelesningen: in-place med en max-heap. Treet viser heapdelen A[0..i − 1]; den sorterte halen står bare i arrayet."), "Start");
    snap(2, {}, t("Fase 1: gjør arrayet om til en max-heap.", "BuildMaxHeap(A, " + n + ").", "BuildMaxHeap(A, n) på O(n)."), "Bygg");
    for (var i0 = Math.floor(n / 2); i0 >= 0; i0--) {
      if (2 * i0 + 1 >= n) {
        snap(2102, { target: i0 }, t("Plass " + i0 + " har ingen barn – ingenting å gjøre.", "i = " + i0 + ": løvnode.", "i = ⌊n/2⌋ = " + i0 + " er en løvnode; kallet er tomt."), null);
        continue;
      }
      snap(2102, { target: i0 }, t("La " + A[i0] + " (plass " + i0 + ") synke til det står riktig.", "i = " + i0 + ".", "i = " + i0 + ": BubbleDown(A, " + i0 + ", n)."), null);
      bubbleSteps(A, i0, n, true, 200, 103, snap, null);
    }
    snap(2, {}, t("Max-heapen er klar. Det største tallet, " + A[0] + ", ligger øverst.", "Max-heap: " + list(A) + ".", "A er en max-heap: " + list(A) + "."), "Max-heap");
    for (var i = n - 1; i >= 0; i--) {
      snap(3, { target: i }, t("Neste plass bakfra som skal fylles: " + i + ".", "i = " + i + ".", "i = " + i + ": heapen er A[0.." + i + "], halen A[" + (i + 1) + "..] er sortert."), null);
      var tmp = A[0]; A[0] = A[i]; A[i] = tmp;
      size = i;
      snap(4, { swap: i > 0 ? [0, i] : [0] },
        i > 0
          ? t("Det største tallet, " + A[i] + ", bytter plass med det bakerste. Nå står " + A[i] + " på riktig plass for godt.",
              "swap A[0] og A[" + i + "]: " + A[i] + " er på plass.",
              "Maks " + A[i] + " flyttes til A[" + i + "]. Heapen krymper til størrelse " + i + ".")
          : t("Bare ett tall igjen, og det er det minste. Det bytter plass med seg selv.", "i = 0: swap med seg selv.", "i = 0: swap A[0] med seg selv. Ufarlig, og «downto 1» ville spart den."), "På plass: " + A[i]);
      if (i > 0) {
        snap(5, {}, t("Tallet som kom på toppen må synke, men bare innenfor de " + i + " første plassene.", "BubbleDown(A, 0, " + i + ").", "BubbleDown(A, 0, i = " + i + "): størrelsen i stenger halen ute."), null);
        bubbleSteps(A, 0, i, true, 200, 5, snap, null);
      }
    }
    snap(6, {}, t("Ferdig! Arrayet er sortert: " + list(A) + ".", "Sortert: " + list(A) + ".", "return A = " + list(A) + ". O(n) + n · O(log n) = O(n log n)."), "Ferdig");
    return steps;
  }
  def(IN.gen, "heapSort", genHeapSort);

  /* --- LevelOrderHeap: 2 L ← tom · 3 for · 4 append · 5 return --- */
  function genLevelOrder(arr, asShape) {
    var A = clone(arr), n = A.length, steps = [], L = [];
    var wasHeap = isMinHeap(A);
    if (!wasHeap && !asShape) buildMin(A);
    function snap(line, marks, text, tag) {
      marks = marks || {}; marks.levels = true;
      steps.push({ line: line, array: clone(A), size: n, marks: marks, out: clone(L), outLabel: "L (level-order)", text: text, tag: tag });
    }
    // asShape: arrayet tolkes bare som et komplett tre (eksamensfiguren i H2025 er ikke en heap)
    if (asShape) snap(null, {},
      t("Her er treet, lagret i et array nivå for nivå: " + list(A) + ". Hvert nivå har sin egen farge." + (wasHeap ? "" : " Tallene er ikke i heap-orden, men det gjør ingenting. Algoritmen bruker bare at treet ligger nivå for nivå i arrayet."),
        "Input: A = " + list(A) + ", n = " + n + ". Nivåene er fargelagt." + (wasHeap ? "" : " (Ikke heap-ordnet, men LevelOrderHeap bruker bare formen.)"),
        "Input: A = " + list(A) + ", n = " + n + ". LevelOrderHeap bruker bare at treet er komplett og lagret i level-order i arrayet. Heap-egenskapen (forelder ≤ barn) brukes ikke" + (wasHeap ? "" : ", så vi kan like gjerne kjøre den på figurtreet, som ikke er heap-ordnet") + "."),
      "Input");
    snap(2, {}, asShape
      ? t("Vi lager en tom liste L.", "L ← empty list.", "L ← tom liste.")
      : t("Hvert nivå i treet har sin egen farge. Vi lager en tom liste L." + (wasHeap ? "" : " (Tallene var ikke en heap, så vi laget en heap av dem først.)"),
        "Nivåene er fargelagt. L ← empty list." + (wasHeap ? "" : " (Input gjort om til heap først.)"),
        "Fargene viser dybden: roten har dybde 0, barna dybde 1, og så videre. Vi starter med tom L."), asShape ? null : "Start");
    for (var i = 0; i < n; i++) {
      var d = Math.floor(Math.log2(i + 1));
      snap(3, { target: i }, t("Neste plass i arrayet er " + i + ".", "i = " + i + " (dybde " + d + ").", "i = " + i + " ligger på dybde ⌊log(" + (i + 1) + ")⌋ = " + d + "."), null);
      L.push(A[i]);
      snap(4, { target: i }, t("Vi legger " + A[i] + " bakerst i lista.", "L får " + A[i] + ".", "append A[" + i + "] = " + A[i] + "."), "Dybde " + d);
    }
    snap(5, {}, t("Ferdig! Lista er nøyaktig lik arrayet. Arrayet var i level-order hele tiden.", "L = A: arrayet er allerede i level-order.", "L = " + list(L) + " = A. Heapen fylles nivå for nivå fra venstre, så indeksrekkefølgen er level-order. O(n)."), "Ferdig");
    steps[steps.length - 1].svar = L.join(", ");
    return steps;
  }
  def(IN.gen, "levelOrderHeap", function (arr) { return genLevelOrder(arr, false); });
  def(IN.gen, "levelOrderArray", function (arr) { return genLevelOrder(arr, true); });

  /* --- Mediankø (H2024): sett inn alle, så removeMedian ×k ---
     Linjekoder: 0xx MedianInsert (2 if · 3 small · 4 else large · 5 Balance)
                 1xx Balance (2 if · 3 flytt nedre→øvre · 4 if · 5 flytt øvre→nedre)
                 2xx RemoveMedian (2 x ← RemoveMax · 3 Balance · 4 return) */
  function genMedian(vals, removes) {
    var S = [], L = [], out = [], steps = [];
    removes = Math.min(removes == null ? 3 : removes, vals.length);
    function snap(line, mk, text, tag) {
      steps.push({ line: line, small: clone(S), large: clone(L), mk: mk || {}, out: clone(out), text: text, tag: tag });
    }
    function sorted() { return S.concat(L).sort(function (a, b) { return a - b; }); }
    snap(null, {}, t("To tomme bunker: den nedre (største øverst) og den øvre (minste øverst). Vi setter inn " + vals.join(", ") + ", og tar så ut medianen " + removes + " ganger.",
      "Q.small (max-heap, nedre halvdel) og Q.large (heap, øvre halvdel) er tomme. Insert " + vals.join(", ") + ", så removeMedian ×" + removes + ".",
      "Input: " + vals.join(", ") + " settes inn, så " + removes + " × removeMedian. Invariant: alt i Q.small ≤ alt i Q.large, og |Q.small| − |Q.large| er 0 eller 1. Da ligger medianen alltid i roten av Q.small."), "Start");
    function balance(callLine) {
      var c1 = S.length > L.length + 1;
      snap(callLine * 1000 + 102, c1 ? { s: [0], check: "|Q.small| > |Q.large| + 1? " + S.length + " > " + (L.length + 1) + ": ja" } : { check: "|Q.small| > |Q.large| + 1? " + S.length + " > " + (L.length + 1) + ": nei" },
        c1 ? t("Den nedre bunken har blitt for stor (" + S.length + " mot " + L.length + ").", "|Q.small| = " + S.length + " > |Q.large| + 1 = " + (L.length + 1) + ".", "Skjevhet: flytt største fra Q.small.")
           : t("Er den nedre bunken mer enn én større enn den øvre? Nei (" + S.length + " mot " + L.length + ").", "|Q.small| = " + S.length + " > |Q.large| + 1 = " + (L.length + 1) + "? Nei.", "Første sjekk er usann: Q.small har ikke for mange."),
        c1 ? "For skjev" : "Sjekk 1");
      if (c1) {
        var v = maxPop(S); minPush(L, v);
        snap(callLine * 1000 + 103, { l: [L.indexOf(v)] }, t(v + " flytter fra den nedre til den øvre bunken.", "Flytt " + v + " til Q.large.", "Insert(Q.large, RemoveMax(Q.small)) = " + v + ", O(log n)."), "Flytt " + v + " opp");
      }
      var c2 = S.length < L.length;
      snap(callLine * 1000 + 104, c2 ? { l: [0], check: "|Q.small| < |Q.large|? " + S.length + " < " + L.length + ": ja" } : { check: "|Q.small| < |Q.large|? " + S.length + " < " + L.length + ": nei" },
        c2 ? t("Den øvre bunken har flere enn den nedre (" + L.length + " mot " + S.length + ").", "|Q.small| = " + S.length + " < |Q.large| = " + L.length + ".", "Skjevhet: flytt minste fra Q.large.")
           : t("Har den øvre bunken flere enn den nedre? Nei (" + L.length + " mot " + S.length + "). Da er bunkene i balanse, og ingenting mer skal flyttes.", "|Q.small| = " + S.length + " < |Q.large| = " + L.length + "? Nei. Størrelsene er i orden.", "Andre sjekk er usann: |Q.small| − |Q.large| = " + (S.length - L.length) + " ∈ {0, 1}, så invarianten holder."),
        c2 ? "For skjev" : "Balansert");
      if (c2) {
        var w = minPop(L); maxPush(S, w);
        snap(callLine * 1000 + 105, { s: [S.indexOf(w)] }, t(w + " flytter fra den øvre ned til den nedre bunken.", "Flytt " + w + " til Q.small.", "Insert(Q.small, RemoveMin(Q.large)) = " + w + ", O(log n)."), "Flytt " + w + " ned");
      }
    }
    vals.forEach(function (x) {
      var toSmall = !S.length || x < S[0];
      snap(2, { s: S.length ? [0] : [] }, t(S.length ? "Skal " + x + " i den nedre bunken? Vi sammenligner med toppen der, " + S[0] + "." : "Den nedre bunken er tom, så " + x + " går dit.",
        S.length ? x + " < Peek(Q.small) = " + S[0] + "? " + (toSmall ? "Ja." : "Nei.") : "Q.small er tom.",
        S.length ? "Sammenlign " + x + " med største i nedre halvdel, " + S[0] + ": " + (toSmall ? "x er mindre." : "x er ikke mindre.") : "|Q.small| = 0."), "Sett inn " + x);
      if (toSmall) { maxPush(S, x); snap(3, { s: [S.indexOf(x)] }, t(x + " legges i den nedre bunken.", "Insert(Q.small, " + x + ").", "Insert i max-heapen Q.small, O(log n)."), null); }
      else { minPush(L, x); snap(4, { l: [L.indexOf(x)] }, t(x + " legges i den øvre bunken.", "Insert(Q.large, " + x + ").", "Insert i heapen Q.large, O(log n)."), null); }
      balance(5);
      snap(5, { s: [0] }, t("Alle tallene i rekkefølge: " + sorted().join(", ") + ". Medianen ligger på toppen av den nedre bunken: " + S[0] + ".",
        "Sortert: " + sorted().join(", ") + " → median = " + S[0] + ".", "Balansen holder. Median = roten i Q.small = " + S[0] + "."), "Median " + S[0]);
    });
    for (var r = 0; r < removes; r++) {
      var m = maxPop(S);
      out.push(m);
      snap(202, { s: S.length ? [0] : [] }, t("Vi tar ut toppen av den nedre bunken: " + m + ". Det er medianen.", "x ← RemoveMax(Q.small) = " + m + ".", "Medianen er roten i Q.small: " + m + "."), "Median ut: " + m);
      balance(203);
      snap(204, {}, t("Medianen " + m + " er gitt fra oss. Hittil: " + out.join(", ") + ".", "return " + m + ". Hittil: " + out.join(", ") + ".", "return " + m + "; sekvens så langt: " + out.join(", ") + "."), null);
    }
    snap(null, {}, t("Ferdig! Medianene kom ut i denne rekkefølgen: " + out.join(", ") + ".", "removeMedian ga: " + out.join(", ") + ".", "Svar: " + out.join(", ") + ". Både insert og removeMedian er O(log n)."), "Ferdig");
    return steps;
  }
  def(IN.gen, "medianQueue", function (vals) { return genMedian(vals, 3); });

  /* IN.vizMedian(stage, step) – to «tårn»: Q.small (max-heap) og Q.large (heap) */
  IN.vizMedian = function (stage, step) {
    IN.clear(stage);
    var row = IN.el("div", { class: "hv-median" });
    var a = IN.el("div", { class: "hv-tower" }), b = IN.el("div", { class: "hv-tower" });
    row.appendChild(a); row.appendChild(b);
    var mk = step.mk || {};
    IN.vizHeap(a, { array: step.small, marks: { target: (mk.s || [])[0] } }, { label: "<b>Q.small</b> · nedre halvdel · max-heap (største øverst)", arrName: "Q.small" });
    IN.vizHeap(b, { array: step.large, marks: { target: (mk.l || [])[0] } }, { label: "<b>Q.large</b> · øvre halvdel · heap (minste øverst)", arrName: "Q.large" });
    var all = step.small.concat(step.large).sort(function (x, y) { return x - y; });
    var med = step.small.length ? step.small[0] : null, medShown = false;
    var info = IN.el("div", { class: "hv-out small" });
    var chk = null;
    if (mk.check) chk = IN.el("div", { class: "hv-vars" }, [IN.el("span", { class: "hv-var" }, [IN.el("span", { class: "lbl", text: "Sjekk" }), IN.el("span", { class: "val", text: mk.check })])]);
    info.innerHTML = '<span class="muted">Alle, sortert:</span> ' +
      (all.length ? all.map(function (v) { if (v === med && !medShown) { medShown = true; return '<b class="hv-outv hv-med" title="median">' + esc(v) + "</b>"; } return '<span class="hv-plain">' + esc(v) + "</span>"; }).join(" ") : '<span class="muted">tom</span>') +
      ' <span class="hv-sep">·</span> <span class="muted">removeMedian ga:</span> ' +
      (step.out.length ? step.out.map(function (v) { return '<b class="hv-outv">' + esc(v) + "</b>"; }).join(" ") : '<span class="muted">ingen ennå</span>');
    var wrap = IN.el("div", { class: "hv" });
    wrap.appendChild(row); if (chk) wrap.appendChild(chk); wrap.appendChild(info);
    stage.appendChild(wrap);
  };

  IN.heapGen = { insert: genInsert, removeMin: genRemoveMin, buildMin: genBuildMin, heapSort: genHeapSort, median: genMedian };
  /* ===================== BØTTEKØ / BUCKET QUEUE (H2022 oppg. 10) =====================
     Navn, input og output som på eksamensarket; linjene følger løsningen i sensorveiledningen. */
  var BQ_IN = "En bucket queue Q med prioriteter fra 0 til N − 1";
  def(IN.algos, "bucketQueueInsert", {
    title: "Bøttekø: Insert",
    name: "Insert", params: "Q, x, p",
    input: BQ_IN + ", og et element x med prioritet p",
    output: "Q med x satt inn med prioritet p",
    lines: [
      { code: "B ← Q[p]", indent: 1,
        eli5: "Finn skuffen som har samme nummer som prioriteten.",
        normal: "Bøtta for prioritet p ligger på plass p i arrayet Q.",
        teknisk: "Prioriteten brukes direkte som indeks, akkurat som i bucket sort. Vi trenger ingen sammenligninger, og oppslaget er O(1)." },
      { code: "add x to B", indent: 1,
        eli5: "Legg elementet oppi skuffen.",
        normal: "Legg x inn i bøtta. Rekkefølgen inni bøtta spiller ingen rolle.",
        teknisk: "Med en enkeltlenket liste legger vi x først i lista, O(1). Oppgaven sier at det ikke spiller noen rolle hvilket av elementene med lavest prioritet som tas ut, så bøtta trenger ingen indre orden." }
    ],
    bigO: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)",
      why: t("Vi går rett til riktig skuff og legger elementet oppi.", "Ett oppslag i arrayet og én innsetting først i en liste: O(1).", "Indeksering i arrayet er O(1), og å legge først i en lenket liste er O(1). Ingen av delene avhenger av n eller N.") }
  });
  def(IN.algos, "bucketQueueRemoveMin", {
    title: "Bøttekø: RemoveMin",
    name: "RemoveMin", params: "Q",
    input: BQ_IN,
    output: "En x med lavest mulig prioritet, som er fjernet fra Q",
    lines: [
      { code: "for i ← 0 to N − 1 do", indent: 1,
        eli5: "Se i skuffene én etter én, og start med skuff 0.",
        normal: "Gå gjennom bøttene fra lavest prioritet og oppover.",
        teknisk: "Vi leter etter den første ikke-tomme bøtta. Den inneholder elementene med lavest prioritet.",
        grense: g("Hvorfor «to N − 1»?", "Prioritetene er 0, 1, …, N − 1, altså N bøtter. «to» tar med sluttverdien, så «to N» ville sett etter en bøtte som ikke finnes.") },
      { code: "B ← Q[i]", indent: 2,
        eli5: "Se på skuff nummer i.",
        normal: "B er bøtta for prioritet i.",
        teknisk: "Oppslag i arrayet, O(1)." },
      { code: "if B is not empty then", indent: 2,
        eli5: "Ligger det noe i denne skuffen?",
        normal: "Finnes det et element med prioritet i?",
        teknisk: "Alle bøttene før i var tomme. Er B ikke tom, finnes det altså ingen elementer med lavere prioritet enn i." },
      { code: "return B.pop()", indent: 3,
        eli5: "Ta ut ett element fra skuffen og gi det fra deg.",
        normal: "Fjern og returner ett element fra bøtta.",
        teknisk: "pop tar ut det første elementet i lista, O(1) i en lenket liste. Alle elementene i B har samme prioritet, så det spiller ingen rolle hvilket vi tar." }
    ],
    bigO: { best: "O(1)", avg: "O(N)", worst: "O(N)", space: "O(1)",
      why: t("Vi ser høyst i alle skuffene, og antallet skuffer er fast.",
        "Høyst N bøtter sjekkes. Med N = 100, en konstant, blir det O(1).",
        "Løkka går høyst N ganger, uansett hvor mange elementer n køen har. Generelt er RemoveMin O(N), og med en fast N = 100 er det O(1). En binær heap ville gitt O(log n).") }
  });

  /* --- Bøttekø som steg-demo (motor «bucketq»)
     Input: liste av operasjoner, «navn:p» = Insert(Q, navn, p), «-» = RemoveMin(Q). N = 4.
     Linjekoder (gruppe): 0xx Insert (2 B ← Q[p] · 3 add) · 1xx RemoveMin (2 for · 3 B ← Q[i] · 4 if · 5 return) */
  var BQ_N = 4;
  function bqOp(s) {
    s = String(s).trim();
    if (s === "-" || s === "−") return { rm: true };
    var m = s.match(/^([A-Za-zÆØÅæøå0-9]{1,3})\s*:\s*(\d+)$/);
    return m && +m[2] < BQ_N ? { x: m[1], p: +m[2] } : null;
  }
  function parseBQ(s) {
    return String(s).split(",").filter(function (x) { return bqOp(x); }).map(function (x) { return String(x).trim().replace("−", "-").replace(/\s+/g, ""); }).slice(0, 12);
  }
  function opName(o) { return o.rm ? "RemoveMin(Q)" : "Insert(Q, " + o.x + ", " + o.p + ")"; }
  function genBucketQueue(ops) {
    var N = BQ_N, Q = [], out = [], steps = [], k;
    for (k = 0; k < N; k++) Q.push([]);
    var list0 = ops.map(bqOp).filter(Boolean);
    function snap(line, mk, text, tag) {
      steps.push({ line: line, Q: Q.map(clone), N: N, mk: mk || {}, out: clone(out), text: text, tag: tag });
    }
    snap(null, {}, t("Bøttekøen har N = " + N + " skuffer, Q[0] til Q[" + (N - 1) + "], én for hver prioritet. Alle er tomme. Nå gjør vi disse operasjonene: " + list0.map(opName).join(", ") + ".",
      "Q er et array med N = " + N + " tomme bøtter. Operasjoner: " + list0.map(opName).join(", ") + ".",
      "Q er et array av N = " + N + " enkeltlenkede lister, indeksert med prioriteten. Vi kjører operasjonene " + list0.map(opName).join(", ") + " i rekkefølge."), "Input");
    list0.forEach(function (o) {
      var op = opName(o);
      if (!o.rm) {
        snap(2, { op: op, focus: o.p, vars: [["x", o.x], ["p", o.p]] },
          t(o.x + " har prioritet " + o.p + ", så det skal i skuff " + o.p + ".", "B ← Q[" + o.p + "].", "Prioriteten p = " + o.p + " er indeksen: B ← Q[" + o.p + "], O(1)."), op);
        Q[o.p].unshift(o.x);
        snap(3, { op: op, focus: o.p, active: o.x, vars: [["x", o.x], ["p", o.p]] },
          t(o.x + " ligger nå i skuff " + o.p + ".", "add " + o.x + " to B: " + o.x + " legges først i Q[" + o.p + "].", o.x + " legges først i lista Q[" + o.p + "], O(1). Insert er ferdig."), null);
        return;
      }
      for (var i = 0; i < N; i++) {
        snap(102, { op: op, focus: i, vars: [["i", i]] },
          t(i === 0 ? "Vi leter etter det med lavest prioritet. Vi starter med skuff 0." : "Vi går videre til skuff " + i + ".", "i = " + i + ".", "i = " + i + (i ? ": bøttene 0 … " + (i - 1) + " var tomme." : ": vi starter med lavest prioritet.")), i === 0 ? op : null);
        snap(103, { op: op, focus: i, vars: [["i", i]] }, t("Vi ser i skuff " + i + ".", "B ← Q[" + i + "].", "B ← Q[" + i + "], O(1)."), null);
        var has = Q[i].length > 0;
        snap(104, { op: op, focus: i, vars: [["i", i], ["B is not empty?", has ? "ja" : "nei"]] },
          has ? t("Det ligger noe i skuff " + i + ": " + Q[i].join(", ") + ".", "Q[" + i + "] er ikke tom.", "Q[" + i + "] er ikke tom. Alle bøttene før var tomme, så prioritet " + i + " er den laveste i køen.")
              : t("Skuff " + i + " er tom.", "Q[" + i + "] er tom.", "Q[" + i + "] er tom, så løkka fortsetter."), null);
        if (has) {
          var x = Q[i].shift();
          out.push(x);
          snap(105, { op: op, focus: i, vars: [["i", i], ["returnerer", x]] },
            t("Vi tar ut " + x + " og gir det fra oss." + (Q[i].length ? " (Det ligger mer i skuffen, men alle der har samme prioritet, så det spiller ingen rolle hvem vi tar.)" : ""),
              "return B.pop() = " + x + "." + (Q[i].length ? " Flere i bøtta har prioritet " + i + "; hvem vi tar er likegyldig." : ""),
              "pop tar ut det første elementet i lista, O(1): " + x + "." + (Q[i].length ? " Oppgaven sier at det ikke spiller noen rolle hvilket element med samme prioritet som tas ut." : "")), "RemoveMin ga " + x);
          return;
        }
      }
      snap(null, { op: op },
        t("Alle skuffene var tomme, så det fantes ingenting å ta ut. Oppgaven sier at vi kan anta at dette ikke skjer.", "Køen var tom: løkka fant ingen ikke-tom bøtte.", "Løkka gikk gjennom alle N bøttene uten treff. Oppgaven lar oss anta at køen ikke er tom."), "Tom kø");
    });
    snap(null, {}, t("Ferdig! RemoveMin ga " + (out.length ? out.join(", ") : "ingenting") + ". Det som er igjen, ligger fortsatt i skuffene sine.",
      "Ferdig. RemoveMin ga: " + (out.join(", ") || "ingen") + ".",
      "Ferdig. RemoveMin ga " + (out.join(", ") || "ingen") + ". Insert var O(1) hver gang, og hver RemoveMin sjekket høyst N = " + N + " bøtter, så O(N), og O(1) når N er en konstant."), "Ferdig");
    steps[steps.length - 1].svar = out.join(", ");
    return steps;
  }
  IN.gen.bucketQueueOps = genBucketQueue;

  IN.vizBucketQueue = function (stage, s) {
    IN.clear(stage);
    var el = IN.el, mk = s.mk || {};
    var wrap = el("div", { class: "bk" });
    var pills = [];
    if (mk.op) pills.push(["Operasjon", mk.op]);
    (mk.vars || []).forEach(function (v) { pills.push(v); });
    if (pills.length) wrap.appendChild(el("div", { class: "hv-vars", "aria-label": "Variabler" }, pills.map(function (p) {
      return el("span", { class: "hv-var" }, [el("span", { class: "lbl", text: p[0] }), el("span", { class: "val", text: String(p[1]) })]);
    })));
    var zone = el("div", { class: "bk-zone" }, [el("span", { class: "bk-cap", text: "Bøttekøen Q (N = " + s.N + "), første element i hver bøtte øverst" })]);
    var bs = el("div", { class: "bk-buckets" });
    s.Q.forEach(function (b, k) {
      var col = el("div", { class: "bk-bucket" + (mk.focus === k ? " is-focus" : "") + (b.length ? "" : " is-emptyb") });
      col.appendChild(el("span", { class: "bk-blbl", text: "Q[" + k + "]" }));
      var st = el("div", { class: "bk-stack" });
      b.forEach(function (x) {
        st.appendChild(el("span", { class: "bk-chip" + (mk.active === x ? " is-active" : ""), style: "--bk-h:" + (200 + 45 * k), html: "<b>" + esc(x) + "</b>" }));
      });
      col.appendChild(st);
      bs.appendChild(col);
    });
    zone.appendChild(bs);
    wrap.appendChild(zone);
    wrap.appendChild(el("div", { class: "hv-out small", html: '<span class="muted">RemoveMin ga:</span> ' +
      (s.out.length ? s.out.map(function (v) { return '<b class="hv-outv">' + esc(v) + "</b>"; }).join(" ") : '<span class="muted">ingenting ennå</span>') }));
    stage.appendChild(wrap);
  };
  if (IN.registerEngine) IN.registerEngine("bucketq", {
    viz: "vizBucketQueue", file: "assets/js/data-heap.js", host: "et-bars-host", scheme: "group", parseInput: parseBQ,
    answer: function (s) { return s && s.out ? s.out.join(", ") : null; }
  });

  /* ===================== H2025 oppg. 5 (b) og (d): søketre i level-order =====================
     Input til demoene: tallene som settes inn i et tomt søketre, i rekkefølge (gir treet v).
     Noder { id, k, l, r } som i viz-tree.js. */
  function bstAdd(root, k, pre) {
    var node = { id: pre + k, k: k, l: null, r: null }, path = [];
    if (!root) return { root: node, path: path, node: node, parent: null };
    var v = root;
    while (true) {
      path.push(v);
      if (k === v.k) return { root: root, path: path, node: null, dup: true };
      if (k < v.k) { if (!v.l) { v.l = node; break; } v = v.l; }
      else { if (!v.r) { v.r = node; break; } v = v.r; }
    }
    return { root: root, path: path, node: node, parent: v };
  }
  function bstFrom(keys, pre) {
    var r = null, used = [];
    keys.forEach(function (k) { var o = bstAdd(r, k, pre); r = o.root; if (!o.dup) used.push(k); });
    return { root: r, keys: used };
  }
  function treeClone(v) { return v ? { id: v.id, k: v.k, l: treeClone(v.l), r: treeClone(v.r) } : null; }
  function treeSer(v) { return v ? (v.l || v.r ? v.k + "(" + treeSer(v.l) + ", " + treeSer(v.r) + ")" : String(v.k)) : "–"; }
  function bfsNodes(root) { var out = [], q = root ? [root] : []; while (q.length) { var u = q.shift(); out.push(u); if (u.l) q.push(u.l); if (u.r) q.push(u.r); } return out; }
  function byIds(a) { return a.map(function (v) { return v.id; }); }
  function byKeys(a) { return a.map(function (v) { return v.k; }); }

  def(IN.algos, "levelOrderBSTExam", {
    title: "LevelOrderBST – bredde-først med en kø",
    name: "LevelOrderBST", params: "v",
    input: "Roten v av et binært søketre med n noder",
    output: "En liste med elementene i søketreet i level-order",
    lines: [
      { code: "L ← empty list", indent: 1,
        eli5: "Vi lager en tom liste som vi skal fylle med tallene.",
        normal: "Start med en tom resultatliste L.",
        teknisk: "L samler elementene i den rekkefølgen nodene besøkes." },
      { code: "Q ← new Queue", indent: 1,
        eli5: "Vi lager en tom kø, som køen i kantina: den som kom først, får gå først.",
        normal: "Lag en tom kø Q for nodene som venter på å bli besøkt.",
        teknisk: "Køen (FIFO) er det som gir level-order: alle nodene på dybde d legges i køen før noen node på dybde d + 1. Med en stakk (LIFO) blir det dybde-først i stedet." },
      { code: "if v ≠ null then Enqueue(Q, v)", indent: 1,
        eli5: "Finnes det et tre i det hele tatt, stiller roten seg først i køen.",
        normal: "Legg roten i køen, hvis treet ikke er tomt.",
        teknisk: "Null-sjekken gjør at et tomt tre gir en tom liste i stedet for å krasje.",
        grense: g("Hvorfor sjekke v ≠ null?", "Et tomt søketre har ingen rot. Uten sjekken ville vi lagt null i køen og senere prøvd å lese null.element.") },
      { code: "while Q is not empty do", indent: 1,
        eli5: "Så lenge noen står i kø, fortsetter vi.",
        normal: "Fortsett til køen er tom.",
        teknisk: "Hver node legges i køen nøyaktig én gang, så løkka går n ganger." },
      { code: "u ← Dequeue(Q)", indent: 2,
        eli5: "Den som står først i køen, får komme fram.",
        normal: "Ta ut noden som har ventet lengst.",
        teknisk: "Dequeue tar fra fronten, O(1)." },
      { code: "append u.element to L", indent: 2,
        eli5: "Vi skriver tallet i noden bakerst i lista.",
        normal: "Legg verdien til u bakerst i L.",
        teknisk: "Det er elementet som skal i lista, ikke selve noden. O(1)." },
      { code: "if u.left ≠ null then Enqueue(Q, u.left)", indent: 2,
        eli5: "Har noden et barn til venstre, stiller det seg bakerst i køen.",
        normal: "Legg venstre barn bakerst i køen, hvis det finnes.",
        teknisk: "Venstre før høyre gir venstre-til-høyre innen hvert nivå.",
        grense: g("Hvorfor sjekke u.left ≠ null?", "Mange noder mangler et barn. Uten sjekken havner null i køen, og neste runde prøver å lese null.element.") },
      { code: "if u.right ≠ null then Enqueue(Q, u.right)", indent: 2,
        eli5: "Har noden et barn til høyre, stiller det seg også bakerst i køen.",
        normal: "Legg høyre barn bakerst i køen, hvis det finnes.",
        teknisk: "Samme null-sjekk som for venstre barn." },
      { code: "return L", indent: 1,
        eli5: "Køen er tom, og lista har alle tallene, nivå for nivå.",
        normal: "Returner lista med elementene i level-order.",
        teknisk: "n Enqueue og n Dequeue à O(1) gir O(n) totalt. Et tre har ingen sykler, så vi trenger ingen mengde med besøkte noder." }
    ],
    bigO: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(n)",
      why: t("Hver node står i køen én gang og blir skrevet i lista én gang.",
        "Hver av de n nodene legges i køen og tas ut nøyaktig én gang: O(n).",
        "n Enqueue, n Dequeue og n append, alle O(1): O(n). Køen og lista tar O(n) plass.") }
  });

  def(IN.gen, "levelOrderBSTExam", function (keys) {
    var b = bstFrom(keys, "v"), root = b.root, L = [], Q = [], done = [], steps = [];
    function snap(line, cur, text, tag) {
      steps.push({ line: line, tree: treeClone(root), text: text, tag: tag,
        info: [{ label: "Q (front → bak)", items: byKeys(Q), kind: "queue" }, { label: "L", items: clone(L) }],
        marks: { cur: cur ? cur.id : null, queued: byIds(Q), done: clone(done) } });
    }
    snap(null, null, root
      ? t("Her er søketreet v. Vi lagde det ved å sette inn " + b.keys.join(", ") + " i den rekkefølgen. Nå skal vi lese det nivå for nivå.",
          "Input: søketreet v (satt inn i rekkefølgen " + b.keys.join(", ") + ").",
          "Input: roten v av et søketre med n = " + b.keys.length + " noder (bygd ved å sette inn " + b.keys.join(", ") + "). Søketre-egenskapen brukes ikke. Algoritmen virker på et hvilket som helst binærtre.")
      : t("Treet er tomt.", "Input: tomt tre (v = null).", "Input: v = null."), "Input");
    snap(2, null, t("Vi lager en tom liste L.", "L ← empty list.", "L ← tom liste."), null);
    snap(3, null, t("Vi lager en tom kø Q.", "Q ← new Queue.", "Q ← tom FIFO-kø."), null);
    if (root) {
      Q.push(root);
      snap(4, null, t("Treet er ikke tomt, så roten " + root.k + " stiller seg i køen.", "v ≠ null: Enqueue(Q, " + root.k + ").", "v ≠ null, så roten legges i køen."), "Rot i køen");
    } else snap(4, null, t("Treet er tomt, så ingen stiller seg i køen.", "v = null: køen forblir tom.", "v = null: null-sjekken hindrer at null havner i køen."), null);
    while (true) {
      var go = Q.length > 0;
      snap(5, null, go ? t("Det står noen i køen, så vi fortsetter.", "Q er ikke tom.", "Q har " + Q.length + " node" + (Q.length > 1 ? "r" : "") + ": løkka fortsetter.")
        : t("Køen er tom. Da har vi vært innom alle nodene.", "Q er tom: løkka stopper.", "Q er tom, så alle n nodene er besøkt."), go ? null : "Kø tom");
      if (!go) break;
      var u = Q.shift();
      snap(6, u, t(u.k + " står først i køen og får komme fram.", "u ← Dequeue(Q) = " + u.k + ".", "u ← " + u.k + " fra fronten av køen."), "Ta ut " + u.k);
      L.push(u.k); done.push(u.id);
      snap(7, u, t("Vi skriver " + u.k + " bakerst i lista.", "append " + u.k + " to L.", "L = [" + L.join(", ") + "]."), null);
      if (u.l) { Q.push(u.l); snap(8, u, t("Venstre barn " + u.l.k + " stiller seg bakerst i køen.", "u.left = " + u.l.k + " ≠ null: Enqueue.", "Enqueue(Q, " + u.l.k + ")."), null); }
      else snap(8, u, t(u.k + " har ikke noe venstre barn.", "u.left = null: ingenting legges i køen.", "u.left = null, så null-sjekken hopper over Enqueue."), null);
      if (u.r) { Q.push(u.r); snap(9, u, t("Høyre barn " + u.r.k + " stiller seg bakerst i køen.", "u.right = " + u.r.k + " ≠ null: Enqueue.", "Enqueue(Q, " + u.r.k + ")."), null); }
      else snap(9, u, t(u.k + " har ikke noe høyre barn.", "u.right = null: ingenting legges i køen.", "u.right = null, så null-sjekken hopper over Enqueue."), null);
    }
    snap(10, null, t("Ferdig! Lista er " + L.join(", ") + ": først roten, så nivået under, og så videre.",
      "return L = " + L.join(", ") + ".",
      "return L = [" + L.join(", ") + "]. Hver node gikk inn og ut av køen én gang: O(n)."), "Ferdig");
    steps[steps.length - 1].svar = L.join(", ");
    return steps;
  });

  /* ConstructBST (ordrett fra eksamensarket H2025 5 (d)), med våre forklaringer */
  def(IN.algos, "constructBSTExam", {
    title: "ConstructBST – sett inn i level-order",
    name: "ConstructBST", params: "v",
    input: "Roten v av et binært søketre",
    output: "Et nytt binært søketre",
    lines: [
      { code: "B ← empty binary search tree", indent: 1,
        eli5: "Vi starter med et nytt, tomt søketre B.",
        normal: "B er et nytt, tomt søketre.",
        teknisk: "B bygges opp ved vanlig innsetting i søketre." },
      { code: "nodes ← LevelOrderBST(v)", indent: 1,
        eli5: "Vi leser tallene i input-treet nivå for nivå, med algoritmen fra (b).",
        normal: "Hent elementene til v i level-order (algoritmen fra (b)).",
        teknisk: "Lista har roten først, og hver node kommer etter forelderen sin." },
      { code: "for u in nodes do", indent: 1,
        eli5: "Vi tar tallene ett og ett, i den rekkefølgen.",
        normal: "Gå gjennom lista i level-order.",
        teknisk: "n runder." },
      { code: "B ← Insert(B, u)", indent: 2,
        eli5: "Vi setter tallet inn i det nye treet på vanlig måte: mindre går til venstre, større til høyre.",
        normal: "Sett u inn i søketreet B.",
        teknisk: "Vanlig innsetting i søketre: følg søkestien fra roten og heng u på der stien slutter." },
      { code: "return B", indent: 1,
        eli5: "Det nye treet er ferdig.",
        normal: "Returner det nye søketreet.",
        teknisk: "B har samme form og samme element i hver posisjon som v." }
    ],
    bigO: { best: "O(n)", avg: "O(n log n)", worst: "O(n²)", space: "O(n)",
      why: t("Hvert tall settes inn én gang, og hver innsetting går så langt ned som treet er høyt.",
        "n innsettinger, hver O(h), der h er høyden. Balansert tre: O(n log n). Skjevt tre: O(n²).",
        "LevelOrderBST er O(n), og hver av de n innsettingene koster O(h). Totalt O(n · h): O(n log n) når v er balansert, O(n²) når v er en lang kjede. (Oppgaven spør ikke om dette.)") }
  });

  def(IN.gen, "constructBSTExam", function (keys) {
    var V = bstFrom(keys, "v").root, B = null, nodes = null, done = [], steps = [];
    var order = bfsNodes(V);
    function snap(line, mk, text, tag, extra) {
      mk = mk || {};
      var forest = B ? [treeClone(V), treeClone(B)] : [treeClone(V)], sup = {};
      if (V) sup[V.id] = "v";
      if (B) sup[B.id] = "B";
      var s = { line: line, forest: forest, sup: sup, text: text, tag: tag,
        info: [{ label: "nodes", items: nodes ? clone(nodes) : [] }, { label: "satt inn i B", items: clone(done) }],
        marks: { cur: mk.cur || null, done: done.map(function (k) { return "v" + k; }), fresh: mk.fresh || null, path: mk.path || [] } };
      if (extra) for (var e in extra) s[e] = extra[e];
      steps.push(s);
    }
    snap(null, {}, t("Til venstre er input-treet v. Vi skal bygge et nytt søketre B ved å sette inn tallene fra v i level-order.",
      "Input: søketreet v (merket «v»). B tegnes til høyre når det får noder.",
      "Input: roten v av et søketre med n = " + order.length + " noder. Spørsmålet er hvordan B forholder seg til v."), "Input");
    snap(2, {}, t("B er tomt foreløpig.", "B ← tomt søketre.", "B ← tomt søketre."), null);
    nodes = byKeys(order);
    snap(3, {}, t("Vi leser v nivå for nivå: " + nodes.join(", ") + ". Roten kommer først, og hvert tall kommer etter tallet over seg.",
      "nodes = " + nodes.join(", ") + " (LevelOrderBST fra (b)).",
      "nodes = [" + nodes.join(", ") + "]. I level-order kommer hver node etter forelderen sin, så alle forfedrene til u er allerede i B når u settes inn."), null);
    order.forEach(function (u) {
      snap(4, { cur: u.id }, t("Neste tall er " + u.k + ".", "u = " + u.k + ".", "u = " + u.k + "."), null);
      var o = bstAdd(B, u.k, "b");
      B = o.root;
      done.push(u.k);
      var pathTxt = o.path.map(function (p) { return u.k < p.k ? u.k + " < " + p.k + ": venstre" : u.k + " > " + p.k + ": høyre"; });
      snap(5, { cur: u.id, fresh: o.node.id, path: byIds(o.path).concat([o.node.id]) },
        o.parent
          ? t(u.k + " går ned fra roten i B: " + pathTxt.join(", så ") + ". Det havner under " + o.parent.k + ", akkurat der det står i v.",
              "Insert(B, " + u.k + "): " + pathTxt.join(", ") + ". Samme plass som i v.",
              "Søkestien i B er " + byKeys(o.path).join(" → ") + ", som er nøyaktig forfedrene til " + u.k + " i v. Plassen under " + o.parent.k + " er ledig, fordi bare " + u.k + " står der i v.")
          : t("B er tomt, så " + u.k + " blir roten i B, slik det er roten i v.", "Insert(B, " + u.k + "): B var tomt, så " + u.k + " blir roten.", u.k + " blir roten i B. Det er også roten i v."),
        "Sett inn " + u.k);
    });
    var same = treeSer(B) === treeSer(V);
    snap(6, {}, same
      ? t("Ferdig! B er helt likt v: samme form og samme tall på samme plass.",
          "return B. B og v er like trær.",
          "return B. B = v: hver node fikk samme forelder og samme side som i v. Grunnen er at forfedrene alltid settes inn før etterkommerne i level-order.")
      : t("Ferdig. B ble ikke likt v.", "return B. B og v er ulike.", "return B. B ≠ v."), "Ferdig", { svar: same ? "like trær" : "ulike trær" });
    return steps;
  });

})();
