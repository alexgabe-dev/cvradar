export const demoCv = {
  name: "Kovács Anna",
  role: "Marketingkoordinátor",
  email: "anna.kovacs@example.com",
  location: "Budapest",
  employer: "Minta Stúdió",
  period: "2022 – jelenleg",
  education: "Budapesti Gazdasági Egyetem",
  degree: "Kereskedelem és marketing BA · 2018–2022",
  skills: ["Google Analytics", "Excel", "Meta Business Suite"],
  original:
    "Közösségi média kezelése, heti posztok készítése Facebookra és Instagramra. Havi riportok készítése a kampányok eredményeiről Excelben.",
  suggestedParts: [
    { text: "Facebook- és Instagram-felületek kezelése:", highlighted: true },
    {
      text: " heti bejegyzések készítése, valamint a kampányok eredményeinek ",
      highlighted: false,
    },
    { text: "összefoglalása havi Excel-riportokban.", highlighted: true },
  ],
};

export const subscores = [
  {
    label: "Olvashatóság",
    value: 94,
    detail: "A mintában a szöveg és a szekciók jól elkülönülnek.",
  },
  {
    label: "Szerkezet és hiányzó adatok",
    value: 85,
    detail: "A munkakezdés hónapja és a pontos nyelvi szint hiányzik.",
  },
  {
    label: "Megfogalmazás",
    value: 67,
    detail: "A közösségi médiás feladatokat érdemes egy mondatba rendezni.",
  },
];

export const improvements = [
  {
    title: "Kapcsold össze a feladatot, a felületeket és a gyakoriságot.",
    reference: "Szakmai tapasztalat · Minta Stúdió",
    quote: "Közösségi média kezelése…",
    reason:
      "A „közösségi média kezelése” önmagában nem mondja el, mit csináltál. A következő sorokban már ott vannak a részletek: Facebook, Instagram, heti bejegyzések és havi Excel-riportok.",
    action:
      "Írd ezeket egy mondatba, ahogy a lenti példában látod. Új feladatot vagy eredményt csak akkor adj hozzá, ha valóban a munkád része volt.",
  },
  {
    title: "Add meg az angoltudásod szintjét.",
    reference: "Nyelvtudás",
    quote: "Angol – kommunikációképes",
    reason:
      "A „kommunikációképes” nem mondja el, hogy például levelezni, telefonálni vagy megbeszélésen részt venni tudsz angolul.",
    action:
      "Ha ismered a nyelvi szintedet, add meg, például B2. Azt is leírhatod, milyen helyzetekben használod az angolt. Csak olyat írj, ami igaz rád.",
  },
  {
    title: "Pontosítsd a munkakezdés dátumát.",
    reference: "Szakmai tapasztalat · 2022 – jelenleg",
    quote: "2022 – jelenleg",
    reason:
      "A „2022 – jelenleg” mellől hiányzik a kezdő hónap. Így nem derül ki pontosan, mióta dolgozol ennél a cégnél.",
    action:
      "Írd az év mellé a tényleges kezdő hónapot is. Ha nem emlékszel rá, ellenőrizd a munkaszerződésedben.",
  },
];

export const checks = [
  {
    title: "Dokumentum olvashatósága",
    text: "Látható szöveg, követhető sorrend.",
    example:
      "Például: kiolvasható-e a tapasztalat egy kétoszlopos elrendezésből?",
  },
  {
    title: "Szerkezet és hiányzó információk",
    text: "Munkakör, munkahely, dátumok és nyelvtudás.",
    example: "Például: szerepel-e munkakör, dátum és nyelvtudási szint?",
  },
  {
    title: "Tapasztalatok megfogalmazása",
    text: "Érthető feladatok, konkrét mondatok.",
    example: "Például: mit takar pontosan az, hogy „közösségi média kezelése”?",
  },
  {
    title: "Álláshoz illeszkedés",
    text: "A CV és a hirdetésben kért tapasztalat összevetése.",
    example:
      "Például: megjelenik-e a CV-ben a hirdetésben kért Excel-ismeret? A demó ezt még nem értékeli.",
  },
];

export const faqs = [
  {
    question: "Használhatom már a saját önéletrajzommal?",
    answer:
      "A PDF- vagy DOCX-fájlod szövegét már ki tudjuk olvasni és megmutatni. A kiolvasott szöveget külön indítható AI-lépéssel adatokba is rendezheted. Értékelés és pontozás még nincs; ezekhez külön, fiktív mintaeredményt nézhetsz meg. A CV-javítás tervezett egyszeri induló ára 1 990 Ft; a csomag még nem vásárolható meg, és letöltés sem érhető el.",
  },
  {
    question: "Mi az az ATS?",
    answer:
      "Az ATS egy jelentkezéskezelő rendszer, amelyet a munkáltatók használnak. Egyes rendszerek adatokat is kiolvasnak a CV-ből. A demó pontszáma csak példa: nem jelzi, hogyan értékelne egy adott munkáltató rendszere.",
  },
  {
    question: "Mit jelent a 82/100 pont?",
    answer:
      "Ez egy előre megadott mintaérték, nem a saját CV-d eredménye. A tervezett szolgáltatás az olvashatóságról, a hiányzó adatokról és a megfogalmazásról ad majd visszajelzést. A pontszám nem ígér interjút vagy sikeres jelentkezést.",
  },
  {
    question: "Magyar és angol CV-vel is használható lesz?",
    answer:
      "A tervezett szolgáltatás magyar és angol önéletrajzokat is támogat majd. Ebben a demóban egy magyar nyelvű, fiktív önéletrajz mintaelemzését próbálhatod ki.",
  },
  {
    question: "Mi történik a kiválasztott fájlommal?",
    answer:
      "A szövegkinyerés indításakor a fájl a szerverre kerül. A feldolgozáshoz memóriában tartjuk, majd elengedjük. Mi sem a fájlt, sem a kiolvasott szöveget nem tároljuk tartósan. AI-szolgáltatónak csak akkor küldjük el a szöveget, ha külön elindítod a CV adatainak felismerését. Az OpenAI saját adatmegőrzési szabályairól az indítás előtt tájékoztatunk. A megjelenített szöveg az oldal elhagyásakor vagy másik fájl választásakor eltűnik. A bemásolt álláshirdetést nem küldjük el.",
  },
];
