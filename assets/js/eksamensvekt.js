/* ============================================================
   IN2010 guide · eksamensvekt.js
   Eksamensvekt øverst på temasidene: snittandel av poengene per eksamen H2020–H2025
   og en stolpe per år (portert fra IN2120-guiden, blokkvekt.js).
   Tallene er poeng per tema per eksamen, fra oppgavelista i data-crash.js (KORT),
   kontrollert mot eksamenssettene og sensorveiledningene.
   - H2020 har 110 poeng totalt; andelene regnes av årets totalsum.
   - H2022 «Litt av hvert» (10 × 1 p) er fordelt på temaene påstandene handler om.
   - Sant/usant-delen fra H2023 (32, 22, 26 p) er ikke fordelt, fordi påstandene ikke står i kildene.
   Stolpehøyden er andel av eksamen, i samme skala på alle sider.
   ============================================================ */
(function () {
  "use strict";
  var IN = window.IN;
  if (!IN || !IN.el || !IN.pageId) return;

  var AAR = ["H2020", "H2021", "H2022", "H2023", "H2024", "H2025"];
  var TOTAL = { H2020: 110, H2021: 100, H2022: 100, H2023: 100, H2024: 100, H2025: 100 };
  var POENG = {
    begreper:  [2, 2, 2, 2, 2, 2],
    sortering: [6, 13, 2, 10, 10, 0],
    sok:       [12, 10, 1, 12, 0, 12],
    heap:      [0, 6, 20, 10, 12, 0],
    traer:     [13, 15, 25, 12, 22, 24],
    hashing:   [19, 8, 10, 0, 10, 10],
    grafer:    [46, 38, 37, 22, 22, 26],
    strategi:  [0, 8, 3, 0, 0, 0],
    lister:    [12, 0, 0, 0, 0, 0]
  };
  var EKSTRA = {
    begreper: "Oppvarmingen gir 2 poeng hvert år, og begrepene brukes i alle oppgavene.",
    strategi: "Tallet gjelder rene strategioppgaver. Kjøretid og pseudokode gir poeng i nesten alle oppgavene.",
    lister: "Bare H2020 hadde en egen oppgave om lister (stakk), men lister brukes i mange andre oppgaver."
  };

  function andel(side, i) { return POENG[side][i] / TOTAL[AAR[i]] * 100; }

  function bygg() {
    var side = IN.pageId(), mine = POENG[side];
    var lead = document.querySelector(".pagehead .lead");
    if (!mine || !lead) return;
    var maks = 0;
    Object.keys(POENG).forEach(function (s) { AAR.forEach(function (y, i) { maks = Math.max(maks, andel(s, i)); }); });
    var snitt = 0;
    AAR.forEach(function (y, i) { snitt += andel(side, i); });
    snitt = Math.round(snitt / AAR.length);

    var tekst = IN.el("span", { class: "bv-tekst", html:
      "<b>Eksamensvekt " + AAR[0] + "–" + AAR[AAR.length - 1] + ":</b> i snitt " + snitt +
      " % av poengene per eksamen. " + (EKSTRA[side] ? EKSTRA[side] + " " : "") +
      "Stolpene viser poeng per år. Sant/usant-delen er holdt utenfor (fra 2023, 22–32 poeng per eksamen), " +
      "fordi påstandene ikke er kjent og ikke kan fordeles på tema." });
    var spark = IN.el("span", { class: "bv-spark", role: "img",
      "aria-label": "Poeng per år: " + AAR.map(function (y, i) {
        return y + " " + mine[i] + " p (" + Math.round(andel(side, i)) + " %)";
      }).join(", ") });
    AAR.forEach(function (y, i) {
      var v = mine[i], p = andel(side, i);
      var bar = IN.el("i", { title: y + ": " + v + " av " + TOTAL[y] + " p, " + Math.round(p) + " % av eksamen" });
      bar.style.height = Math.max(v ? 8 : 0, Math.round(p / (maks || 1) * 100)) + "%";
      spark.appendChild(IN.el("span", { class: "bv-sparkc" }, [bar, IN.el("b", { text: y.slice(3), "aria-hidden": "true" })]));
    });
    var host = IN.el("p", { class: "blokk-vekt" }, [tekst, spark]);
    lead.parentNode.insertBefore(host, lead.nextSibling);
  }
  /* Merke øverst i hver fane, ut fra eksamensmerkene under sidetittelen (.badges .badge[data-go]):
     spurt i flere år → «kommer ofte», ett år → «eksamensbasert». Faner uten eksamensoppgave får ikke merke,
     fordi sant/usant-delen kan ha spurt om dem uten at vi vet det. Faste merker: se .merke i styles.css. */
  function merkFaner() {
    var per = {};
    document.querySelectorAll(".pagehead .badges .badge[data-go]").forEach(function (b) {
      var fane = b.getAttribute("data-go"), aar = b.querySelector("b");
      if (!fane || !aar) return;
      (per[fane] = per[fane] || []).push({ aar: aar.textContent.trim(), tekst: b.textContent.replace(/\s+/g, " ").trim() });
    });
    Object.keys(per).forEach(function (fane) {
      var sec = document.querySelector('section[data-panel="' + fane + '"]');
      if (!sec || sec.querySelector(":scope > .fane-eks")) return;
      var liste = per[fane], aar = {};
      liste.forEach(function (x) { aar[x.aar] = 1; });
      var ofte = Object.keys(aar).length > 1;
      var rad = IN.el("p", { class: "fane-eks small" }, [
        IN.el("span", { class: "tag merke " + (ofte ? "kjerne" : "eksbas"), text: ofte ? "kommer ofte" : "eksamensbasert" }),
        " " + liste.map(function (x) { return x.tekst; }).join("; ")
      ]);
      var h = sec.querySelector(":scope > h3");
      if (h) h.parentNode.insertBefore(rad, h.nextSibling); else sec.insertBefore(rad, sec.firstChild);
    });
  }
  function start() { bygg(); merkFaner(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
