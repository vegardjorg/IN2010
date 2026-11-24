/* Genererte sant/usant-påstander per seksjon – laget ut fra hva eksamenene og sensorveiledningene
   tester (H2020–H2025). Ikke ekte eksamensoppgaver; egne formuleringer for å teste egen kunnskap.
   GENERERT fra plan/tf-generert/ med bygg-data-tf.js – rediger kildene der, ikke denne fila. */
(function () {
  var IN = window.IN = window.IN || {};
  IN.TF_GEN = {
  "begreper": [
    {
      "s": "En algoritme må stoppe etter et endelig antall steg.",
      "answer": true,
      "explain": "Kurset krever at en algoritme terminerer, at hvert steg er presist og at den gir et output. Oppvarmingen spør om dette hvert år, og alle rimelige svar gir full pott.",
      "tema": "algoritme",
      "kilde": false
    },
    {
      "s": "En datastruktur er en måte å organisere data på, slik at operasjonene vi trenger blir effektive.",
      "answer": true,
      "explain": "Vi organiserer dataene etter hva vi oftest vil gjøre med dem. Eksempelsvaret i oppvarmingen (H2020–H2025) sier det samme, men alle rimelige svar gir full pott.",
      "tema": "datastruktur",
      "kilde": false
    },
    {
      "s": "To løkker over arrayet etter hverandre, med konstant arbeid i hver runde, gir O(n²).",
      "answer": false,
      "explain": "To lineære gjennomløp etter hverandre gir O(n + n) = O(n). Bare løkker inni hverandre multipliseres.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "Ordnet etter vekst kommer O(1), O(log n), O(n), O(n log n) og O(n²) i denne rekkefølgen.",
      "answer": true,
      "explain": "Rekken går fra langsomst til raskest vekst. I sensorveiledningene gir en løsning som regel flere poeng jo lenger til venstre i rekken den havner.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "Stabilitet har bare noe å si når flere elementer kan ha samme nøkkel.",
      "answer": true,
      "explain": "Stabil betyr at like nøkler beholder innbyrdes rekkefølge. Er alle nøklene ulike, er det ingen slik rekkefølge å bevare.",
      "tema": "stabil",
      "kilde": false
    },
    {
      "s": "En rekursiv prosedyre på et binærtre trenger et basistilfelle, typisk når noden er null.",
      "answer": true,
      "explain": "Uten basistilfelle stopper ikke rekursjonen. De fleste løsningsforslagene for treoppgavene, for eksempel CheckBST (H2022) og diameter (H2023), starter med en sjekk for null.",
      "tema": "rekursjon",
      "kilde": false
    },
    {
      "s": "En algoritme må alltid ta minst ett input.",
      "answer": false,
      "explain": "Kursets definisjon tillater null eller flere input. Det som kreves, er presise steg, at den stopper, og et output som henger sammen med input.",
      "tema": "algoritme",
      "kilde": false
    },
    {
      "s": "O(n² + n + 1) og O(n²) er samme kjøretidsklasse.",
      "answer": true,
      "explain": "I O-notasjon stryker vi konstanter og lavere ledd, og beholder bare det leddet som vokser raskest.",
      "tema": "O-notasjon",
      "kilde": false
    },
    {
      "s": "En O(n log n)-algoritme bruker færre steg enn en O(n²)-algoritme for alle n.",
      "answer": false,
      "explain": "O-notasjon sier noe om veksten når n blir stor. For små n kan konstantfaktorer gjøre den «dårligere» algoritmen raskere (H2022 del 1).",
      "tema": "O-notasjon",
      "kilde": false
    },
    {
      "s": "En algoritme som er i O(log n), er også i O(n).",
      "answer": true,
      "explain": "O er en øvre grense. Det som vokser høyst logaritmisk, vokser også høyst lineært.",
      "tema": "O-notasjon",
      "kilde": false
    },
    {
      "s": "Vet vi at en algoritme er i O(n²), kan den ikke samtidig være i O(n).",
      "answer": false,
      "explain": "O er bare en øvre grense: en lineær algoritme er både i O(n) og i O(n²). Sensor vil derfor ha den laveste grensen du kan begrunne.",
      "tema": "O-notasjon",
      "kilde": false
    },
    {
      "s": "En løkke inni en annen løkke gir alltid O(n²).",
      "answer": false,
      "explain": "Det avhenger av hvor mange ganger den indre løkka går. Går den et fast antall ganger, blir det O(n); halveres telleren i hver runde, blir det O(n log n).",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "Sorterer vi personer etter alder og to 22-åringer bytter innbyrdes rekkefølge, var sorteringen ikke stabil.",
      "answer": true,
      "explain": "Like nøkler skal komme ut i samme rekkefølge som de kom inn i. H2021 testet nettopp dette med to personer med samme alder.",
      "tema": "stabil",
      "kilde": false
    },
    {
      "s": "En algoritme som mellomlagrer elementene i et ekstra array, er ikke in-place.",
      "answer": true,
      "explain": "In-place betyr at algoritmen ikke bruker ekstra datastrukturer. Merge sort og bøttesortering er eksempler som ikke er in-place.",
      "tema": "in-place",
      "kilde": false
    },
    {
      "s": "En abstrakt datatype bestemmer hvordan operasjonene skal implementeres.",
      "answer": false,
      "explain": "En ADT sier bare hvilke operasjoner som finnes og hva de gjør. Hvordan de lages, er et valg av datastruktur (mediankø H2024, bøttekø H2022).",
      "tema": "ADT",
      "kilde": false
    },
    {
      "s": "Prioritetskø og binær heap er to navn på det samme.",
      "answer": false,
      "explain": "Prioritetskø er en ADT med insert og removeMin. En heap er én måte å lage den på; et AVL-tre eller en bøttekø kan også brukes.",
      "tema": "ADT",
      "kilde": false
    },
    {
      "s": "En rekursiv prosedyre som kaller seg selv på venstre og høyre barn, får alltid eksponentiell kjøretid.",
      "answer": false,
      "explain": "Hver node besøkes én gang, så med konstant arbeid per node blir det O(n). Det er slik traverseringer, CheckBST og diameter får lineær tid.",
      "tema": "rekursjon",
      "kilde": false
    },
    {
      "s": "Kjøretiden O(2ⁿ) er polynomiell.",
      "answer": false,
      "explain": "2ⁿ er eksponensiell, fordi n står i eksponenten. Polynomiell betyr n opphøyd i en konstant (H2020 drøftet en eksponensiell strategi).",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "En stakk gir elementene ut i motsatt rekkefølge av den de ble lagt inn i.",
      "answer": true,
      "explain": "En stakk er LIFO: sist inn, først ut. Det er derfor den passer til å matche åpne- og lukketagger (H2020).",
      "tema": "ADT",
      "kilde": false
    },
    {
      "s": "Innsetting bakerst i et dynamisk array er O(1) i verste tilfelle.",
      "answer": false,
      "explain": "Når arrayet er fullt, må alt kopieres over i et dobbelt så stort array, som er O(n). Det er O(1) amortisert, ikke i verste tilfelle.",
      "tema": "amortisert",
      "kilde": false
    },
    {
      "s": "Et avgjørelsesproblem er i NP hvis JA-instanser kan verifiseres i polynomiell tid.",
      "answer": true,
      "explain": "Det er definisjonen. H2020 ba om en verifikator som sjekker et sertifikat, og H2021 testet definisjonen i del 1.",
      "tema": "P/NP",
      "kilde": false
    },
    {
      "s": "Det er bevist at alle problemer i NP er vanskeligere enn problemene i P.",
      "answer": false,
      "explain": "Alle problemer i P er også i NP, og om P = NP er ikke avgjort. H2021 del 1 testet begge disse punktene.",
      "tema": "P/NP",
      "kilde": false
    }
  ],
  "sortering": [
    {
      "s": "Bøttesortering av n elementer med N mulige nøkler er O(N + n).",
      "answer": true,
      "explain": "Vi går gjennom alle n elementene og deretter alle N bøttene. Sensor gir full pott for denne løsningen når nøklene ligger i et lite, kjent område (H2020, H2021, H2024).",
      "tema": "bøttesortering",
      "kilde": false
    },
    {
      "s": "Bøttesortering der vi legger hvert element bakerst i bøtta si, er stabil.",
      "answer": true,
      "explain": "Elementer med lik nøkkel havner i samme bøtte i den rekkefølgen de kom. H2024 krevde stabil sortering og trakk 1 poeng for ustabile løsninger.",
      "tema": "bøttesortering",
      "kilde": false
    },
    {
      "s": "Bøttesortering er O(n) uansett hvor mange mulige nøkler det finnes.",
      "answer": false,
      "explain": "Kjøretiden er O(N + n), så den blir treg når N er mye større enn n. H2021 ville at du skulle se akkurat denne svakheten ved et tellearray.",
      "tema": "bøttesortering",
      "kilde": false
    },
    {
      "s": "Sorterer vi en alfabetisk ordliste stabilt etter kategori, er ordene fortsatt alfabetiske innen hver kategori.",
      "answer": true,
      "explain": "Stabiliteten bevarer den gamle rekkefølgen blant like nøkler. H2024 brukte dette til å binærsøke inne i hver kategori.",
      "tema": "stabil",
      "kilde": false
    },
    {
      "s": "En stabil sortering flytter aldri elementer som allerede står på riktig plass.",
      "answer": false,
      "explain": "Stabil handler bare om at like nøkler beholder innbyrdes rekkefølge. Om andre elementer flyttes underveis, har ingenting med stabilitet å gjøre.",
      "tema": "stabil",
      "kilde": false
    },
    {
      "s": "Er nøklene alder fra 0 til 100, har bøttesortering lavere kjøretidskompleksitet enn Merge sort.",
      "answer": true,
      "explain": "Med fast N blir bøttesortering O(n), mens Merge sort er O(n log n). H2021 spurte hvilken sortering som passer når ingen er eldre enn 100.",
      "tema": "velge sortering",
      "kilde": false
    },
    {
      "s": "Bøttesortering kan slå O(n log n) fordi den ikke sammenligner elementene med hverandre.",
      "answer": true,
      "explain": "Grensen O(n log n) gjelder bare sammenligningsbaserte algoritmer. Bøttesortering bruker i stedet at nøklene ligger i et kjent område.",
      "tema": "bøttesortering",
      "kilde": false
    },
    {
      "s": "Velger vi pivot tilfeldig, er Quicksort garantert O(n log n).",
      "answer": false,
      "explain": "Tilfeldig pivot gjør dårlige delinger usannsynlige, men verste tilfelle er fortsatt O(n²). Sensor vil se at du nevner dette (H2023, H2025).",
      "tema": "Quicksort",
      "kilde": false
    },
    {
      "s": "Merge sort er in-place.",
      "answer": false,
      "explain": "Merge sort fletter inn i ekstra arrayer, så den er ikke in-place. Forelesningen bruker den som eksempel på det.",
      "tema": "in-place",
      "kilde": false
    },
    {
      "s": "Heapsort er in-place.",
      "answer": true,
      "explain": "Heapen bygges i selve arrayet, og største element byttes bakerst i hver runde. Det trengs ingen ekstra datastruktur.",
      "tema": "in-place",
      "kilde": false
    },
    {
      "s": "Heapsort er O(n log n) også i verste tilfelle.",
      "answer": true,
      "explain": "Heapen har høyde O(log n), så hver av de n bobleringene ned er O(log n). Det skiller den fra Quicksort, som er O(n²) i verste tilfelle.",
      "tema": "Heapsort",
      "kilde": false
    },
    {
      "s": "Insertion sort er O(n²) i verste tilfelle, for eksempel når arrayet er sortert baklengs.",
      "answer": true,
      "explain": "Da må hvert nytt element flyttes helt fremst, så antall bytter blir 1 + 2 + … + (n − 1).",
      "tema": "Insertion sort",
      "kilde": false
    },
    {
      "s": "Selection sort er O(n) når arrayet allerede er sortert.",
      "answer": false,
      "explain": "Selection sort må alltid lete gjennom hele resten for å finne det minste. Den kan ikke stoppe tidlig, så den er O(n²) også her.",
      "tema": "Selection sort",
      "kilde": false
    },
    {
      "s": "Radix sort på heltall, slik kurset viser den, begynner med det mest signifikante sifferet.",
      "answer": false,
      "explain": "Kursets Radix sort tar det minst signifikante sifferet først og det mest signifikante sist. Da avgjør det viktigste sifferet til slutt.",
      "tema": "Radix sort",
      "kilde": false
    },
    {
      "s": "Radix sort er avhengig av at bøttesorteringen for hvert siffer er stabil.",
      "answer": true,
      "explain": "Uten stabilitet ville et senere gjennomløp ødelegge ordningen fra de tidligere sifrene.",
      "tema": "Radix sort",
      "kilde": false
    },
    {
      "s": "Radix sort med d siffer og N mulige sifferverdier er O(d·(N + n)).",
      "answer": true,
      "explain": "Den gjør d runder med bøttesortering, og hver runde er O(N + n). H2021 godtok Radix sort først for å få lineær tid på «finn par».",
      "tema": "Radix sort",
      "kilde": false
    },
    {
      "s": "Heapsort sorterer stigende ved å bygge en min-heap og flytte roten bakerst.",
      "answer": false,
      "explain": "Kurset bygger en max-heap: det største elementet flyttes bakerst i hver runde. Med en min-heap og samme fremgangsmåte blir resultatet synkende.",
      "tema": "Heapsort",
      "kilde": false
    },
    {
      "s": "Merge sort blir O(n) når arrayet allerede er sortert.",
      "answer": false,
      "explain": "Merge sort deler og fletter like mye uansett input, så den er O(n log n) hver gang.",
      "tema": "Merge sort",
      "kilde": false
    },
    {
      "s": "Gnome sort gjør like mange bytter som Insertion sort.",
      "answer": true,
      "explain": "Gnome sort flytter elementene bakover på samme måte som Insertion sort, men med flere sammenligninger. For full pott i H2023 måtte du se dette slektskapet.",
      "tema": "Gnome sort",
      "kilde": false
    },
    {
      "s": "Gnome sort passer like godt som Merge sort til store arrayer.",
      "answer": false,
      "explain": "Gnome sort er O(n²) i verste tilfelle, som Insertion sort. H2023 spurte om nettopp kjøretiden, og O(n log n)-algoritmer som Merge sort er langt bedre på store arrayer.",
      "tema": "Gnome sort",
      "kilde": false
    }
  ],
  "sok": [
    {
      "s": "Skal vi bare gjøre ett oppslag i et usortert array, er rett-frem søk bedre enn å sortere først, med tanke på kjøretid.",
      "answer": true,
      "explain": "Rett-frem søk er O(n), mens sortering alene er O(n log n). H2020 ville at du skulle se at sortering bare lønner seg ved mange oppslag.",
      "tema": "sortere først?",
      "kilde": false
    },
    {
      "s": "Å sortere én gang og så gjøre k binærsøk er O(n log n + k log n).",
      "answer": true,
      "explain": "Sorteringen gjøres bare én gang, og hvert binærsøk er O(log n). Begge leddene må med i svaret.",
      "tema": "sortere først?",
      "kilde": false
    },
    {
      "s": "Å sortere arrayet på nytt før hvert binærsøk koster like mye som å sortere én gang.",
      "answer": false,
      "explain": "Sortering inne i løkka gir O(k · n log n). H2020 påpekte at det aldri er det beste valget.",
      "tema": "sortere først?",
      "kilde": false
    },
    {
      "s": "k rett-frem søk i et array med n elementer er O(n + k).",
      "answer": false,
      "explain": "Hvert søk kan gå gjennom hele arrayet, så det blir O(k·n). Løkker etter hverandre legges sammen, men her gjentas et O(n)-søk k ganger.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "Står x nøyaktig to ganger i et sortert array, finner vi begge posisjonene i O(log n).",
      "answer": true,
      "explain": "Binærsøk finner én forekomst, og den andre står rett ved siden av. H2023 ga full pott for O(log n) og færre poeng for lineært søk.",
      "tema": "finn duplikat",
      "kilde": false
    },
    {
      "s": "Har binærsøket funnet x på indeks i, og x står nøyaktig to ganger, holder det å sjekke A[i − 1] og A[i + 1].",
      "answer": true,
      "explain": "I et sortert array står like verdier ved siden av hverandre. Husk å sjekke at i − 1 og i + 1 ligger innenfor arrayet.",
      "tema": "finn duplikat",
      "kilde": false
    },
    {
      "s": "Binærsøk finner alltid den første forekomsten når x står flere ganger.",
      "answer": false,
      "explain": "Vanlig binærsøk stopper ved den forekomsten midtpunktet tilfeldigvis treffer. Vil du ha den første, må binærsøket endres. I H2023 holdt det å sjekke naboene til treffet.",
      "tema": "binærsøk",
      "kilde": false
    },
    {
      "s": "Vi vet ikke hvilket tall som er duplikat i et sortert array, men vanlig binærsøk finner det i O(log n).",
      "answer": false,
      "explain": "Binærsøk trenger en verdi å lete etter. Uten den må vi sammenligne naboer i ett lineært gjennomløp, som H2023 forventet.",
      "tema": "finn duplikat",
      "kilde": false
    },
    {
      "s": "Med et hashset finner vi et duplikat i et usortert array i forventet O(n).",
      "answer": true,
      "explain": "Vi går gjennom arrayet og sjekker om hvert element allerede er i settet. H2023 ga mest uttelling for dette, foran sortering i O(n log n).",
      "tema": "finn duplikat",
      "kilde": false
    },
    {
      "s": "Hashset-løsningen for å finne duplikat er O(n) også i verste tilfelle.",
      "answer": false,
      "explain": "Ved mange kollisjoner kan hvert oppslag bli O(n), så verste tilfelle er O(n²). Det er lurt å skille forventet og verste tilfelle, selv om H2023 lot deg anta konstant tid for hashing.",
      "tema": "finn duplikat",
      "kilde": false
    },
    {
      "s": "Å sammenligne hvert element med alle de andre for å finne duplikat er O(n log n).",
      "answer": false,
      "explain": "Det gir n · (n − 1) / 2 sammenligninger, altså O(n²). Det er den naive løsningen som gir minst uttelling.",
      "tema": "finn duplikat",
      "kilde": false
    },
    {
      "s": "Med to pekere fra hver sin ende finner vi et par med sum x i et sortert array i O(n).",
      "answer": true,
      "explain": "Er summen for liten, flytter vi venstre peker; er den for stor, flytter vi høyre. Hvert element passeres høyst én gang (H2021).",
      "tema": "to pekere",
      "kilde": false
    },
    {
      "s": "Med log n oppslag i et usortert array er både rett-frem søk og «sorter først» O(n log n).",
      "answer": true,
      "explain": "Rett-frem gir log n · n, og sortering pluss binærsøk gir n log n + log n · log n. Begge er O(n log n), som H2020 testet.",
      "tema": "sortere først?",
      "kilde": false
    },
    {
      "s": "Med n² oppslag i et usortert array lønner det seg å sortere først og så binærsøke.",
      "answer": true,
      "explain": "Rett-frem gir O(n³), mens sortering pluss binærsøk gir O(n² log n). H2020 spurte om nettopp dette for k = 1, log n, n og n².",
      "tema": "sortere først?",
      "kilde": false
    },
    {
      "s": "I binærsøk med high ← n − 1 må løkka gå så lenge low ≤ high; med low &lt; high kan siste kandidat bli oversett.",
      "answer": true,
      "explain": "Når low = high, er det fortsatt ett element igjen å sjekke. Med streng ulikhet stopper løkka før det elementet blir sammenlignet.",
      "tema": "binærsøk",
      "kilde": false
    },
    {
      "s": "Kan elementene bare sammenlignes, kan vi bruke bøttesortering for å finne duplikat i lineær tid.",
      "answer": false,
      "explain": "Bøttesortering og Radix sort krever nøkler fra et kjent område, ikke bare sammenligning. H2023 påpekte at de ikke kunne brukes der.",
      "tema": "finn duplikat",
      "kilde": false
    },
    {
      "s": "Med to pekere må begge pekerne flyttes i hver runde.",
      "answer": false,
      "explain": "Er summen for liten, flytter vi bare venstre peker; er den for stor, bare høyre. Først når vi har funnet et par, kan begge flyttes.",
      "tema": "to pekere",
      "kilde": false
    },
    {
      "s": "Å finne det minste elementet med rett-frem søk k ganger gir O(k·n).",
      "answer": true,
      "explain": "Hver runde går gjennom opptil n elementer. H2025 ga noe uttelling for dette, men mer for løsninger med heap.",
      "tema": "k minste",
      "kilde": false
    },
    {
      "s": "Holder vi de k minste i en max-heap av størrelse k mens vi går gjennom arrayet, blir det O(n log k).",
      "answer": true,
      "explain": "Roten er den største av de k beste, og den byttes ut når vi finner noe mindre. H2025 ga full pott for dette.",
      "tema": "k minste",
      "kilde": false
    },
    {
      "s": "Holder vi de k minste i en heap av størrelse k mens vi går gjennom arrayet, bør det være en min-heap.",
      "answer": false,
      "explain": "Vi må raskt finne og kaste ut den største av de k vi holder på, og det gir en max-heap. En min-heap har den minste i roten.",
      "tema": "k minste",
      "kilde": false
    }
  ],
  "heap": [
    {
      "s": "Ved innsetting i en heap med n elementer legges det nye elementet på indeks n før det bobles opp.",
      "answer": true,
      "explain": "Indeks n er første ledige plass, så treet forblir komplett. H2023 ville se nettopp dette: plasser bakerst, og bytt med forelderen så lenge den er større.",
      "tema": "insert",
      "kilde": false
    },
    {
      "s": "Ved innsetting legges det nye elementet i roten og bobles ned.",
      "answer": false,
      "explain": "Insert legger elementet bakerst og bobler opp. Det er removeMin som flytter et element til roten og bobler ned.",
      "tema": "insert",
      "kilde": false
    },
    {
      "s": "I en 0-indeksert heap ligger venstre barn til indeks i på indeks 2i + 1.",
      "answer": true,
      "explain": "Høyre barn er på 2i + 2, og forelderen er på ⌊(i − 1)/2⌋. Ikke bland inn formlene fra 1-indeksering.",
      "tema": "indekser",
      "kilde": false
    },
    {
      "s": "I en 0-indeksert heap ligger barna til indeks i på 2i og 2i + 1.",
      "answer": false,
      "explain": "Det er formlene for 1-indeksering. Med roten på indeks 0 ville roten fått seg selv som barn.",
      "tema": "indekser",
      "kilde": false
    },
    {
      "s": "Ved removeMin flyttes det siste elementet i arrayet opp til roten før det bobles ned.",
      "answer": true,
      "explain": "Slik forblir treet komplett. Deretter byttes elementet med det minste barnet så lenge det er større (H2021).",
      "tema": "removeMin",
      "kilde": false
    },
    {
      "s": "removeMin er O(1) fordi det minste elementet alltid ligger i roten.",
      "answer": false,
      "explain": "Å lese minimum er O(1), men etter fjerningen må heapen repareres ved å boble ned, som er O(log n).",
      "tema": "removeMin",
      "kilde": false
    },
    {
      "s": "Det minste elementet i en min-heap kan leses i O(1).",
      "answer": true,
      "explain": "Det ligger alltid på indeks 0. Det er dette som gjør heapen til en god prioritetskø.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "Å finne et vilkårlig element i en heap er O(log n).",
      "answer": false,
      "explain": "En heap har ingen venstre–høyre-ordning som et søketre, så vi må i verste tilfelle se på alle n elementene.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "Setter vi inn n elementer ett og ett i en tom heap, er det O(n log n) totalt.",
      "answer": true,
      "explain": "Hver innsetting bobler høyst opp høyden til treet, som er O(log n).",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "En min-heap er et binært søketre med det minste elementet i roten.",
      "answer": false,
      "explain": "I en heap er begge barna større enn eller lik forelderen; det finnes ingen regel om venstre mot høyre.",
      "tema": "heap-egenskap",
      "kilde": false
    },
    {
      "s": "Arrayet [1, 3, 2, 7, 4, 9, 5] er en gyldig min-heap.",
      "answer": true,
      "explain": "Sjekk hver indeks i mot 2i + 1 og 2i + 2: 1 ≤ 3, 2; 3 ≤ 7, 4; 2 ≤ 9, 5. Alle foreldre er mindre enn eller like barna.",
      "tema": "heap-egenskap",
      "kilde": false
    },
    {
      "s": "Arrayet [1, 4, 2, 3, 5] er en gyldig min-heap.",
      "answer": false,
      "explain": "Indeks 1 har verdien 4, men barnet på indeks 3 har verdien 3. En forelder kan ikke være større enn barnet sitt.",
      "tema": "heap-egenskap",
      "kilde": false
    },
    {
      "s": "Bruker vi et usortert array som prioritetskø, blir insert O(1) og removeMin O(n).",
      "answer": true,
      "explain": "Vi kan legge til bakerst, men må lete gjennom alt for å finne minimum. En heap gir O(log n) for begge.",
      "tema": "prioritetskø",
      "kilde": false
    },
    {
      "s": "I en min-heap kan et barn ha samme verdi som forelderen sin.",
      "answer": true,
      "explain": "Kravet er bare at hver node er større enn eller lik forelderen. H2021 hadde en oppgave der like verdier måtte håndteres.",
      "tema": "heap-egenskap",
      "kilde": false
    },
    {
      "s": "Det nest minste elementet i en min-heap ligger alltid på indeks 1.",
      "answer": false,
      "explain": "Det er et av barna til roten, så det ligger på indeks 1 eller 2. Heapen sier ingenting om hvilket barn som er minst.",
      "tema": "heap-egenskap",
      "kilde": false
    },
    {
      "s": "Er alle verdiene ulike, ligger den største verdien i en min-heap i en løvnode.",
      "answer": true,
      "explain": "En node med barn har alltid et barn som er større. Derfor kan bare en løvnode inneholde den største verdien.",
      "tema": "heap-egenskap",
      "kilde": false
    },
    {
      "s": "En heap trenger aldri rotasjoner for å holde seg balansert.",
      "answer": true,
      "explain": "Heapen er komplett fordi vi alltid setter inn og fjerner bakerst i arrayet. Rotasjoner hører til AVL-trær.",
      "tema": "struktur",
      "kilde": false
    },
    {
      "s": "At en heap er komplett, betyr at alle nivåene er helt fulle, også det nederste.",
      "answer": false,
      "explain": "Bare det nederste nivået kan mangle noder, og det fylles fra venstre. Ellers kunne en heap bare ha 1, 3, 7, … elementer.",
      "tema": "struktur",
      "kilde": false
    },
    {
      "s": "Leser vi heap-arrayet fra indeks 0 til n − 1, får vi nodene i level-order.",
      "answer": true,
      "explain": "Arrayet lagrer treet nivå for nivå, fra venstre mot høyre. H2025 brukte dette: å skrive ut arrayet i rekkefølge er hele løsningen.",
      "tema": "struktur",
      "kilde": false
    },
    {
      "s": "Med et fast, lite antall heltallsprioriteter N gir en bøttekø O(1) for både insert og removeMin.",
      "answer": true,
      "explain": "Hver prioritet får sin egen kø, og vi leter gjennom høyst N bøtter. Med konstant N er det O(1), som H2022 ville ha.",
      "tema": "prioritetskø",
      "kilde": false
    },
    {
      "s": "Når prioritetene er små heltall fra et fast område, gir en binær heap bedre kjøretid enn en bøttekø.",
      "answer": false,
      "explain": "Heapen gir O(log n), mens bøttekøen gir O(1) når antall prioriteter er konstant. H2022 ga færre poeng for heap her.",
      "tema": "prioritetskø",
      "kilde": false
    },
    {
      "s": "En mediankø kan lages med en max-heap for den minste halvdelen og en min-heap for den største.",
      "answer": true,
      "explain": "Medianen ligger da i roten av en av heapene, og hver operasjon er O(log n). Dette var løsningen med full pott i H2024.",
      "tema": "mediankø",
      "kilde": false
    },
    {
      "s": "I en mediankø med to heaper er det O(n) å fjerne medianen.",
      "answer": false,
      "explain": "Medianen er en rot, så vi gjør en removeMin eller removeMax og eventuelt én flytting til den andre heapen. Det blir O(log n).",
      "tema": "mediankø",
      "kilde": false
    }
  ],
  "traer": [
    {
      "s": "Et binærtre med unike verdier er et binært søketre hvis og bare hvis inorder gir stigende rekkefølge.",
      "answer": true,
      "explain": "Inorder besøker venstre subtre, noden og så høyre subtre. Derfor er sortert inorder både nødvendig og nok, og det gir CheckBST i O(n) (H2022).",
      "tema": "CheckBST",
      "kilde": false
    },
    {
      "s": "Er hver node større enn venstre barn og mindre enn høyre barn, er treet et binært søketre.",
      "answer": false,
      "explain": "En node dypt nede i venstre subtre kan være større enn roten uten at noen forelder–barn-sjekk oppdager det (tema i H2022).",
      "tema": "CheckBST",
      "kilde": false
    },
    {
      "s": "Sender vi en nedre og øvre grense nedover i rekursjonen, kan CheckBST gjøres i O(n).",
      "answer": true,
      "explain": "Hver node sjekkes mot grensene den arver fra forfedrene, og besøkes én gang. Dette var en av løsningene med full pott i H2022.",
      "tema": "CheckBST",
      "kilde": false
    },
    {
      "s": "CheckBST som kaller FindMin og FindMax på subtrærne for hver node, er O(n).",
      "answer": false,
      "explain": "Treet er ikke garantert et søketre, så FindMin og FindMax må se gjennom hele subtreet. Gjøres det for hver node, blir det O(n²) i verste tilfelle; H2022 ga delvis uttelling for dette.",
      "tema": "CheckBST",
      "kilde": false
    },
    {
      "s": "Oppslag i et binært søketre er O(h): O(n) i verste tilfelle og O(log n) når treet er balansert.",
      "answer": true,
      "explain": "Vi går én vei nedover fra roten. Hvor dypt vi kan havne, avhenger av høyden h.",
      "tema": "BST",
      "kilde": false
    },
    {
      "s": "Setter vi inn 1, 2, …, n i denne rekkefølgen i et vanlig binært søketre, blir oppslag O(n) i verste tilfelle.",
      "answer": true,
      "explain": "Hver ny verdi blir høyre barn av den forrige, så treet blir en lang liste med høyde n − 1.",
      "tema": "BST",
      "kilde": false
    },
    {
      "s": "Alle binære søketrær er AVL-trær.",
      "answer": false,
      "explain": "Det er omvendt: alle AVL-trær er binære søketrær, men et BST kan være så skjevt som det vil. H2020 testet denne retningen.",
      "tema": "AVL",
      "kilde": false
    },
    {
      "s": "En høyrerotasjon i et binært søketre bevarer søketre-egenskapen.",
      "answer": true,
      "explain": "Inorder-rekkefølgen er den samme før og etter rotasjonen. H2025 bygget en hel oppgave på dette.",
      "tema": "rotasjon",
      "kilde": false
    },
    {
      "s": "Er et AVL-tre skjevt fordi venstre barns venstre subtre er for høyt, retter vi det med en venstrerotasjon.",
      "answer": false,
      "explain": "Venstre–venstre rettes med en høyrerotasjon av noden som er i ubalanse. En venstrerotasjon ville gjort ubalansen verre.",
      "tema": "rotasjon",
      "kilde": false
    },
    {
      "s": "Et Huffman-tre med n løvnoder har 2n − 1 noder.",
      "answer": true,
      "explain": "Hver sammenslåing lager én ny indre node, og det skjer n − 1 ganger. H2021 spurte om antall noder med 8 symboler.",
      "tema": "Huffman",
      "kilde": false
    },
    {
      "s": "Huffman slår sammen de to trærne med lavest frekvens og stopper når bare ett tre er igjen.",
      "answer": true,
      "explain": "En prioritetskø ordnet etter frekvens gir de to minste raskt. H2024 ville se både prioritetskøen og stoppkriteriet.",
      "tema": "Huffman",
      "kilde": false
    },
    {
      "s": "Antall bit i en Huffman-kodet tekst er summen av frekvens ganger kodelengde for hvert symbol.",
      "answer": true,
      "explain": "Hver forekomst av et symbol koster like mange bit som koden er lang. H2021 lot deg regne ut dette.",
      "tema": "Huffman",
      "kilde": false
    },
    {
      "s": "Med 8 ulike symboler kan ingen Huffman-kode bli lengre enn 3 bit.",
      "answer": false,
      "explain": "Svært skjeve frekvenser gir et skjevt tre, der lengste kode kan bli 7 bit. Tre bit er bare grensen for et helt balansert tre.",
      "tema": "Huffman",
      "kilde": false
    },
    {
      "s": "Den største verdien i et binært søketre ligger alltid i en løvnode.",
      "answer": false,
      "explain": "Den største noden har ikke høyre barn, men den kan ha et venstre barn. Vi finner den ved å gå til høyre så lenge det går.",
      "tema": "BST",
      "kilde": false
    },
    {
      "s": "For å finne alle verdier i [a, b] i et balansert binært søketre må vi alltid besøke alle nodene.",
      "answer": false,
      "explain": "Vi kan hoppe over subtrær som ligger helt utenfor intervallet. H2021 ga mest uttelling for dette og mindre for inorder pluss filtrering.",
      "tema": "BST",
      "kilde": false
    },
    {
      "s": "Ligger x ≤ y i et binært søketre, er laveste felles forfeder første node fra roten med x ≤ verdi ≤ y.",
      "answer": true,
      "explain": "Over den noden ligger x og y i samme subtre, og der skilles de. Det gir O(h), som H2024 ville ha; lineære løsninger ga færre poeng.",
      "tema": "LCA",
      "kilde": false
    },
    {
      "s": "Laveste felles forfeder til to noder kan ligge dypere i treet enn begge nodene.",
      "answer": false,
      "explain": "En forfeder ligger alltid over eller på nodene selv. Laveste felles forfeder har derfor dybde høyst lik den grunneste av de to.",
      "tema": "LCA",
      "kilde": false
    },
    {
      "s": "Én innsetting i et AVL-tre trenger aldri mer enn to enkeltrotasjoner.",
      "answer": true,
      "explain": "Det holder å rette opp den laveste noden som kom i ubalanse, med én enkel- eller dobbeltrotasjon. Da får subtreet tilbake samme høyde som før.",
      "tema": "rotasjon",
      "kilde": false
    },
    {
      "s": "Med tomt tre som høyde −1 er lengste sti gjennom en node høyde(venstre) + høyde(høyre) + 2 kanter.",
      "answer": true,
      "explain": "Vi går ned til dypeste node på hver side og bruker én kant til hvert barn. Det er samme formel som i løsningsforslaget til diameteroppgaven i H2023.",
      "tema": "diameter",
      "kilde": false
    },
    {
      "s": "Diameteren til et binærtre kan finnes i O(n) med én rekursjon som returnerer høyden.",
      "answer": true,
      "explain": "Hver node besøkes én gang, og vi oppdaterer beste diameter underveis. H2023 ga full pott for lineær tid og delvis for kvadratisk.",
      "tema": "diameter",
      "kilde": false
    },
    {
      "s": "To symboler med lik frekvens får alltid like lange Huffman-koder.",
      "answer": false,
      "explain": "Ved likhet avgjør valget av hvem som slås sammen først. Med frekvensene 1, 1, 2, 2 kan de to 2-erne få kodelengde 1 og 2.",
      "tema": "Huffman",
      "kilde": false
    },
    {
      "s": "Huffman gir de vanligste symbolene de lengste kodene.",
      "answer": false,
      "explain": "Det er omvendt: sjeldne symboler slås sammen først og havner dypest. Derfor sparer Huffman bit.",
      "tema": "Huffman",
      "kilde": false
    }
  ],
  "hashing": [
    {
      "s": "Med N = 10 og h(k) = k mod 10 havner 15, 25 og 35 på indeks 5, 6 og 7 med Linear probing.",
      "answer": true,
      "explain": "Alle tre hasher til 5, så hver ny nøkkel går ett steg videre til neste ledige plass. Slike innsettinger for hånd kommer igjen ofte.",
      "tema": "Linear probing",
      "kilde": false
    },
    {
      "s": "Med N = 10, h(k) = k mod 10 og Linear probing får vi ikke plass til 29 etter 19 uten å utvide arrayet.",
      "answer": false,
      "explain": "Etter indeks 9 går vi rundt til indeks 0, så 29 havner der. H2020 testet dette, og H2022 trakk poeng for å gå utenfor arrayet.",
      "tema": "Linear probing",
      "kilde": false
    },
    {
      "s": "Med god hashfunksjon og lav lastfaktor er oppslag med Separate chaining forventet O(1), men O(n) i verste tilfelle.",
      "answer": true,
      "explain": "I verste tilfelle havner alt i samme bøtte. H2025 ga eget poeng for hvert av de to svarene.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "Setter vi inn en nøkkel som finnes fra før med Separate chaining, legges et nytt par alltid bakerst i bøtta.",
      "answer": false,
      "explain": "I en hashmap skal den gamle verdien overskrives. H2025 trakk poeng for løsninger som ikke gjorde det.",
      "tema": "Separate chaining",
      "kilde": false
    },
    {
      "s": "Ved innsetting med Linear probing leter vi til vi finner en ledig plass eller en plass med samme nøkkel.",
      "answer": true,
      "explain": "Finner vi samme nøkkel, skal verdien overskrives. H2022 trakk poeng for å glemme overskrivingen.",
      "tema": "Linear probing",
      "kilde": false
    },
    {
      "s": "Et oppslag med Linear probing kan stoppe når det treffer en tom plass.",
      "answer": true,
      "explain": "Hadde nøkkelen vært der, ville den ligget før den første tomme plassen i letesekvensen.",
      "tema": "Linear probing",
      "kilde": false
    },
    {
      "s": "Med Linear probing kan lastfaktoren bli større enn 1.",
      "answer": false,
      "explain": "Hver plass har høyst ett element, så n kan ikke bli større enn N. Med Separate chaining går det derimot an.",
      "tema": "lastfaktor",
      "kilde": false
    },
    {
      "s": "Lastfaktoren til en hashtabell er antall elementer delt på arraystørrelsen.",
      "answer": true,
      "explain": "Lastfaktoren er n/N. Blir den for høy, rehasher vi til et større array, slik H2024 beskrev for Python-ordbøker.",
      "tema": "lastfaktor",
      "kilde": false
    },
    {
      "s": "Forventet O(1) for oppslag gjelder uansett hvor full tabellen er.",
      "answer": false,
      "explain": "Forventet O(1) krever en god hashfunksjon og lav lastfaktor. Med full tabell blir letesekvensene lange.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "n innsettinger i en hashmap kan i verste tilfelle ta O(n²) totalt.",
      "answer": true,
      "explain": "Kolliderer alle nøklene, blir hver innsetting O(n). H2021 ville at du skulle se dette når du sammenlignet hashmap med tellearray.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "Ved rehash lager vi et større array og setter inn alle elementene på nytt.",
      "answer": true,
      "explain": "Indeksene avhenger av N, så alt må hashes på nytt. Det kan ikke bare kopieres over.",
      "tema": "rehash",
      "kilde": false
    },
    {
      "s": "Etter en rehash har hvert element samme indeks som før.",
      "answer": false,
      "explain": "Indeksen er h(k) mod N, og N har endret seg. Derfor må hvert element settes inn på nytt.",
      "tema": "rehash",
      "kilde": false
    },
    {
      "s": "Ved sletting med Linear probing holder det å sette plassen til null.",
      "answer": false,
      "explain": "Da kan senere oppslag stoppe for tidlig ved hullet. Kurset fyller derfor hullet ved å flytte elementer, eller markerer plassen som slettet.",
      "tema": "Linear probing",
      "kilde": false
    },
    {
      "s": "Linear probing lagrer en lenket liste på hver plass i arrayet.",
      "answer": false,
      "explain": "Det er Separate chaining. Linear probing lagrer høyst ett element per plass og leter videre ved kollisjon.",
      "tema": "Linear probing",
      "kilde": false
    },
    {
      "s": "Med Separate chaining kan lastfaktoren bli større enn 1.",
      "answer": true,
      "explain": "Hver bøtte er en liste som kan holde mange elementer, så n kan bli større enn N. Det gjør likevel bøttene lange og oppslagene trege.",
      "tema": "lastfaktor",
      "kilde": false
    },
    {
      "s": "Et tellearray er alltid raskere enn en hashmap.",
      "answer": false,
      "explain": "Tellearrayet gir O(n + k), der k er antall mulige verdier. Er k mye større enn n, kan hashmapen være bedre (H2021).",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "En rehash er O(n), men innsetting er likevel O(1) amortisert (forventet) når arrayet dobles.",
      "answer": true,
      "explain": "Dyre rehasher skjer så sjelden at kostnaden fordelt på alle innsettingene blir konstant.",
      "tema": "rehash",
      "kilde": false
    },
    {
      "s": "Ved innsetting med Separate chaining må vi håndtere at bøtta ikke er opprettet ennå.",
      "answer": true,
      "explain": "Er bøtta null, må vi lage en tom liste før vi legger til. H2025 trakk poeng for å glemme dette.",
      "tema": "Separate chaining",
      "kilde": false
    },
    {
      "s": "En hashfunksjon kan gjerne returnere en tilfeldig indeks.",
      "answer": false,
      "explain": "Hashfunksjonen må være deterministisk: samme nøkkel må alltid gi samme indeks, ellers finner vi ikke igjen elementet.",
      "tema": "hashfunksjon",
      "kilde": false
    },
    {
      "s": "Med en god hashfunksjon får Linear probing aldri kollisjoner.",
      "answer": false,
      "explain": "Det finnes langt flere mulige nøkler enn plasser i arrayet, så noen nøkler må dele indeks. En god hashfunksjon sprer nøklene jevnt, men den kan ikke fjerne kollisjoner.",
      "tema": "hashfunksjon",
      "kilde": false
    }
  ],
  "grafer": [
    {
      "s": "BFS og DFS med nabolister er O(|V| + |E|).",
      "answer": true,
      "explain": "Hver node besøkes én gang, og hver kant ses på et konstant antall ganger. Svært mange oppgaver forventer denne kjøretiden (H2021–H2025).",
      "tema": "traversering",
      "kilde": false
    },
    {
      "s": "Et fullt DFS over hele grafen med nabolister er O(|V| · |E|).",
      "answer": false,
      "explain": "Med en felles besøkt-mengde går vi bare én gang over hver node og kant, så det blir O(|V| + |E|). H2022 ville ha denne kjøretiden for DFSFull.",
      "tema": "traversering",
      "kilde": false
    },
    {
      "s": "Komponentene i en urettet graf kan finnes med ett fullt DFS i O(|V| + |E|).",
      "answer": true,
      "explain": "Hver gang vi starter et nytt søk fra en ubesøkt node, har vi funnet en ny komponent (H2021, H2022).",
      "tema": "traversering",
      "kilde": false
    },
    {
      "s": "Får topologisk sortering ikke med alle nodene, har den rettede grafen en sykel.",
      "answer": true,
      "explain": "Noder på en sykel får aldri inngrad 0, så de blir aldri plukket ut. H2023 og H2025 ga full pott for denne sykeltesten i O(|V| + |E|).",
      "tema": "topologisk sortering",
      "kilde": false
    },
    {
      "s": "I en uvektet graf finner BFS stier med færrest mulig kanter fra startnoden.",
      "answer": true,
      "explain": "BFS går lag for lag, så den første veien til en node er en korteste vei. BFS var fasitsvaret for uvektede grafer i H2021, og på et tre ga BFS langt mer enn Dijkstra i H2023.",
      "tema": "korteste vei",
      "kilde": false
    },
    {
      "s": "Dijkstra kan gi feil svar når grafen har negative kanter.",
      "answer": true,
      "explain": "Dijkstra antar at en node er ferdig når den tas ut av køen, og det stemmer ikke med negative kanter. Velg Bellman-Ford da (H2021).",
      "tema": "korteste vei",
      "kilde": false
    },
    {
      "s": "Dijkstra gir alltid riktig svar så lenge grafen ikke har negative sykler.",
      "answer": false,
      "explain": "Negative kanter er nok til å gi feil svar, selv uten negative sykler. Det er Bellman-Ford som tåler negative kanter.",
      "tema": "korteste vei",
      "kilde": false
    },
    {
      "s": "Dijkstra med en heap som prioritetskø er O((|V| + |E|) log |V|).",
      "answer": true,
      "explain": "Hver node og kant kan gi en køoperasjon, og hver av dem er O(log |V|). I H2023 måtte en Dijkstra-løsning ha riktig kjøretid for å gi uttelling.",
      "tema": "korteste vei",
      "kilde": false
    },
    {
      "s": "For å finne alt som kan nås fra en mengde startnoder R, må vi kjøre et DFS med ny besøkt-mengde fra hver startnode.",
      "answer": false,
      "explain": "Det holder at søkene fra nodene i R deler én besøkt-mengde, så hver node og kant behandles én gang. H2022 trakk poeng for løsninger tregere enn O(|V| + |E|).",
      "tema": "traversering",
      "kilde": false
    },
    {
      "s": "I en urettet graf betyr enhver kant til en besøkt node under DFS at grafen har en sykel.",
      "answer": false,
      "explain": "Kanten tilbake til forelderen er bare den samme kanten i motsatt retning. H2025 trakk poeng for å glemme å hoppe over den.",
      "tema": "sykler",
      "kilde": false
    },
    {
      "s": "Topologisk sortering må bruke en kø for nodene med inngrad 0.",
      "answer": false,
      "explain": "En stakk fungerer like godt; vi får bare en annen gyldig rekkefølge. H2021 påpekte at valget ikke spiller noen rolle for riktigheten.",
      "tema": "topologisk sortering",
      "kilde": false
    },
    {
      "s": "Bellman-Ford er O(|V| · |E|).",
      "answer": true,
      "explain": "Den går gjennom alle kantene |V| − 1 ganger, og én gang til for å oppdage negative sykler (H2022).",
      "tema": "korteste vei",
      "kilde": false
    },
    {
      "s": "Bellman-Ford kan oppdage negative sykler som kan nås fra startnoden.",
      "answer": true,
      "explain": "Blir en avstand mindre i runden etter de |V| − 1 rundene, finnes det en negativ sykel. H2025 trakk poeng for å ikke angi startnode.",
      "tema": "korteste vei",
      "kilde": false
    },
    {
      "s": "For en vektet DAG med negative kanter er Bellman-Ford den raskeste måten å finne korteste veier på.",
      "answer": false,
      "explain": "Går vi gjennom nodene i topologisk rekkefølge og relakserer kantene, blir det O(|V| + |E|), også med negative kanter.",
      "tema": "korteste vei",
      "kilde": false
    },
    {
      "s": "Har en sammenhengende graf bare ulike kantvekter, finnes det nøyaktig ett minimalt spenntre.",
      "answer": true,
      "explain": "Et unikt minimalt spenntre er garantert når ingen kanter har lik vekt. H2020 ville at du skulle se at like vekter kan gi flere trær.",
      "tema": "minimalt spenntre",
      "kilde": false
    },
    {
      "s": "Har en graf flere kanter med lik vekt, finnes det garantert flere minimale spenntrær.",
      "answer": false,
      "explain": "Lik vekt gjør det bare mulig. Er grafen selv et tre, finnes det for eksempel bare ett spenntre uansett vekter.",
      "tema": "minimalt spenntre",
      "kilde": false
    },
    {
      "s": "Et minimalt spenntre inneholder korteste vei mellom alle par av noder.",
      "answer": false,
      "explain": "Spenntreet minimerer totalvekten, ikke avstanden mellom to bestemte noder. Det er derfor Dijkstra og Prim løser ulike problemer.",
      "tema": "minimalt spenntre",
      "kilde": false
    },
    {
      "s": "Prim og Dijkstra har samme kjøretidskompleksitet når de bruker samme prioritetskø.",
      "answer": true,
      "explain": "Begge er O((|V| + |E|) log |V|) med heap, fordi de bruker prioritetskøen på samme måte. H2022 spurte om kjøretiden til Prim.",
      "tema": "minimalt spenntre",
      "kilde": false
    },
    {
      "s": "En sterkt sammenhengende komponent med mer enn én node inneholder en sykel.",
      "answer": true,
      "explain": "To noder i komponenten kan nå hverandre begge veier, og de to stiene sammen gir en sykel. H2023 og H2024 brukte dette.",
      "tema": "SCC",
      "kilde": false
    },
    {
      "s": "I en rettet graf uten kanter fra en node til seg selv inneholder hver sterkt sammenhengende komponent en sykel.",
      "answer": false,
      "explain": "En komponent med én node har ingen sykel. H2024 trakk poeng for å telle med komponenter av størrelse 1.",
      "tema": "SCC",
      "kilde": false
    },
    {
      "s": "En urettet graf med |V| noder og |V| − 1 kanter er alltid et tre.",
      "answer": false,
      "explain": "Den må også være sammenhengende. En trekant pluss en løs node har fire noder og tre kanter, men er ikke et tre.",
      "tema": "sykler",
      "kilde": false
    },
    {
      "s": "Topologisk sortering kan brukes på urettede grafer uten sykler.",
      "answer": false,
      "explain": "Topologisk sortering krever en rettet graf, siden kantene må si hva som kommer før hva.",
      "tema": "topologisk sortering",
      "kilde": false
    },
    {
      "s": "Kjører vi Prim på en graf som ikke er sammenhengende, får vi et minimalt spenntre for hver komponent.",
      "answer": false,
      "explain": "Prim vokser fra én startnode og når bare den komponenten. Andre komponenter blir aldri med.",
      "tema": "minimalt spenntre",
      "kilde": false
    },
    {
      "s": "Minste k slik at kantene med vekt ≤ k holder en sammenhengende graf sammenhengende, er tyngste kant i et minimalt spenntre.",
      "answer": true,
      "explain": "Spenntreet bruker de letteste kantene som binder alt sammen, så den tyngste av dem er flaskehalsen. Dette var nøkkelen i H2025.",
      "tema": "minimalt spenntre",
      "kilde": false
    },
    {
      "s": "Alle separasjonsnoder i en sammenhengende graf kan finnes med ett DFS i O(|V| + |E|).",
      "answer": true,
      "explain": "Kursets algoritme gjør dette i ett dybde-først-søk. H2025 knyttet 2-sammenheng til at grafen ikke har separasjonsnoder; per-node-søk blir tregere.",
      "tema": "separasjonsnoder",
      "kilde": false
    }
  ],
  "strategi": [
    {
      "s": "I del 1 (H2023–H2025) teller et blankt svar like mye som et galt, så det lønner seg å svare på alt.",
      "answer": true,
      "explain": "Poengene regnes ut fra antall riktige over halvparten, og blankt og galt gir begge null riktige. Gjetting kan derfor bare hjelpe.",
      "tema": "del 1",
      "kilde": false
    },
    {
      "s": "Et galt svar i del 1 (H2023–H2025) gir minuspoeng, mens et blankt gir null.",
      "answer": false,
      "explain": "Det finnes ingen egne minuspoeng; galt og blankt teller likt. Derfor er det feil å la oppgaver stå tomme.",
      "tema": "del 1",
      "kilde": false
    },
    {
      "s": "Oppvarmingsoppgavene krever en formell definisjon for å gi full pott.",
      "answer": false,
      "explain": "Sensor godtar alle rimelige forklaringer med egne ord. Bruk liten tid her og spar den til oppgavene som teller mer.",
      "tema": "oppvarming",
      "kilde": false
    },
    {
      "s": "Lavere kjøretidskompleksitet gir som regel flere poeng på implementasjonsoppgaver.",
      "answer": true,
      "explain": "Sensorveiledningene har en trapp der hver forbedring i kjøretid gir flere poeng, for eksempel O(n²), O(n log n) og O(n).",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "En riktig O(n²)-løsning gir full pott selv om oppgaven har en løsning i O(n).",
      "answer": false,
      "explain": "Riktige, men trege løsninger gir delvis uttelling. Diameter og CheckBST (H2022, H2023) er typiske eksempler.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "Å glemme å oppgi kjøretiden kan koste poeng, selv om algoritmen er riktig.",
      "answer": true,
      "explain": "Mange oppgaver ber eksplisitt om kjøretid, og sensor trekker for å utelate den. Skriv den alltid, med forklaring.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "På en uvektet graf eller et tre er BFS et bedre svar enn Dijkstra for korteste vei.",
      "answer": true,
      "explain": "BFS er O(|V| + |E|) og trenger ingen prioritetskø. H2023 ga langt mer for BFS eller DFS enn for Dijkstra på et tre.",
      "tema": "grafstrategi",
      "kilde": false
    },
    {
      "s": "Å bruke n i kjøretiden uten å si hva n er, er greit så lenge O-uttrykket stemmer.",
      "answer": false,
      "explain": "Sensor må vite hva du måler. H2020 trakk flere poeng for kjøretid med n som ikke var definert.",
      "tema": "kjøretid",
      "kilde": false
    },
    {
      "s": "En løsning som kjører et nytt søk fra hver node, får som regel bare delvis uttelling når en lineær løsning finnes.",
      "answer": true,
      "explain": "Et søk per node gir O(|V| · (|V| + |E|)). I sykeloppgavene i H2023 og H2025 ga det bare delvis uttelling.",
      "tema": "grafstrategi",
      "kilde": false
    },
    {
      "s": "Fra H2023 kan du bruke algoritmer fra pensum uten å skrive pseudokoden for dem, med mindre oppgaven sier noe annet.",
      "answer": true,
      "explain": "Du kan kalle for eksempel Dijkstra eller Merge sort som ferdige byggeklosser. Les likevel oppgaven nøye: i «Dependency hell» (H2023) måtte du kort forklare hvordan de virker.",
      "tema": "pseudokode",
      "kilde": false
    },
    {
      "s": "Du må alltid skrive full pseudokode for pensumalgoritmer som BFS og Dijkstra.",
      "answer": false,
      "explain": "Fra H2023 er det lov å bruke dem direkte, med mindre oppgaven sier noe annet. Bruk tiden på det som er nytt i oppgaven.",
      "tema": "pseudokode",
      "kilde": false
    },
    {
      "s": "Pseudokoden kan gjerne ligne Java eller Python, så lenge den er entydig og lett å forstå.",
      "answer": true,
      "explain": "Eksamensteksten (blant annet H2020) sier at både forelesningsstil og mer Java- eller Python-aktig syntaks er greit. Det som teller, er at den er klar.",
      "tema": "pseudokode",
      "kilde": false
    },
    {
      "s": "Sensor trekker poeng for uklare og upresise svar, selv om ideen bak er riktig.",
      "answer": true,
      "explain": "Sensorveiledningene sier dette rett ut (blant annet H2020). Navngi variabler, definer input og skriv kort hva hver del gjør.",
      "tema": "pseudokode",
      "kilde": false
    },
    {
      "s": "Krever oppgaven stabil sortering, mister en ellers riktig, ustabil løsning poeng.",
      "answer": true,
      "explain": "H2024 trakk for ustabil sortering. Skriv alltid hvorfor algoritmen du velger, er stabil.",
      "tema": "sortering",
      "kilde": false
    },
    {
      "s": "Kan hashing gi forventet O(n), gir sortering i O(n log n) like mye uttelling.",
      "answer": false,
      "explain": "I H2023 ga hashset-løsningen mest, og sortering litt mindre. Nevn gjerne verste tilfelle for hashing også.",
      "tema": "hashing",
      "kilde": false
    },
    {
      "s": "Svar som bruker hashing, bør oppgi både forventet og verste kjøretid.",
      "answer": true,
      "explain": "H2025 ga eget poeng for hvert. Forventet O(1) forutsetter god hashfunksjon og lav lastfaktor; verste tilfelle er O(n).",
      "tema": "hashing",
      "kilde": false
    },
    {
      "s": "I drøftingsoppgaver gir det uttelling å si når hver strategi er best, ikke bare hvilken som er raskest generelt.",
      "answer": true,
      "explain": "H2020 lot svaret avhenge av hvor mange oppslag det var. Sensor ville se at du skifter strategi når forholdene endrer seg.",
      "tema": "drøfting",
      "kilde": false
    },
    {
      "s": "På et tre gir Dijkstra like mye uttelling som BFS for korteste vei.",
      "answer": false,
      "explain": "Dijkstra er riktig, men unødvendig treg her. H2023 ga bare en brøkdel av poengene for den.",
      "tema": "grafstrategi",
      "kilde": false
    },
    {
      "s": "Å kjøre Dijkstra fra hver startnode gir like mye uttelling som én Dijkstra fra målet i den reverserte grafen.",
      "answer": false,
      "explain": "Én kjøring i den reverserte grafen finner avstanden fra alle noder til målet på én gang. H2024 ga klart mest for det.",
      "tema": "grafstrategi",
      "kilde": false
    }
  ]
};
})();
