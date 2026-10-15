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
    detail: "A mintadokumentum szövege jól elkülönül.",
  },
  {
    label: "Szerkezet és teljesség",
    value: 85,
    detail: "Az alapvető szekciók megtalálhatók; néhány részlet hiányzik.",
  },
  {
    label: "Megfogalmazás",
    value: 67,
    detail: "A feladatok egy része pontosabban is leírható.",
  },
];

export const improvements = [
  {
    title: "Tedd egyértelművé a feladataidat.",
    reference: "Szakmai tapasztalat · Minta Stúdió",
    quote: "Közösségi média kezelése…",
    reason:
      "Az eszközök és a rendszeresség már szerepelnek a CV-ben. Összekapcsolva őket könnyebb megérteni, mit végeztél a mindennapokban.",
    action:
      "Nevezd meg egy mondatban a felületeket, a heti bejegyzéseket és a havi riportokat.",
  },
  {
    title: "Add meg az angoltudásod szintjét.",
    reference: "Nyelvtudás",
    quote: "Angol – kommunikációképes",
    reason:
      "A „kommunikációképes” többféle tudásszintet jelenthet. Nem derül ki, milyen helyzetben használod a nyelvet.",
    action:
      "Ha ismered, add meg a CEFR-szintedet (például B2). Csak a valós tudásodnak megfelelő szintet írd be.",
  },
  {
    title: "Pontosítsd a munkakezdés dátumát.",
    reference: "Szakmai tapasztalat · 2022 – jelenleg",
    quote: "2022 – jelenleg",
    reason:
      "Az év önmagában nem mutatja meg pontosan a tapasztalat hosszát. A hónap segít követni az időrendet.",
    action:
      "Egészítsd ki a tényleges kezdő hónappal. A hiányzó dátumot a demó nem találja ki.",
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
    text: "A fontos részletek a helyükön.",
    example: "Például: szerepel-e munkakör, dátum és nyelvtudási szint?",
  },
  {
    title: "Tapasztalatok megfogalmazása",
    text: "Érthető feladatok, konkrét mondatok.",
    example: "Például: mit takar pontosan az, hogy „közösségi média kezelése”?",
  },
  {
    title: "Álláshoz illeszkedés",
    text: "Külön nézőpont, ha van álláshirdetés.",
    example:
      "Például: megjelenik-e a CV-ben a hirdetésben kért Excel-ismeret? A demó ezt még nem értékeli.",
  },
];

export const faqs = [
  {
    question: "Mi az az ATS?",
    answer:
      "Az ATS a jelentkezések kezelésére használt rendszer. Egyes rendszerek adatokat is kiolvasnak az önéletrajzból. A CVRadar saját minőségi mutatót mutat: ez nem egy minden ATS-re érvényes pontszám.",
  },
  {
    question: "Garantálja a jó pontszám az interjút?",
    answer:
      "Nem. Egy átlátható önéletrajz segít bemutatni a tapasztalatodat, de a kiválasztás a pozíciótól, a munkáltatótól és sok más tényezőtől is függ.",
  },
  {
    question: "Magyar és angol CV-vel is használható lesz?",
    answer:
      "A tervezett szolgáltatás magyar és angol önéletrajzokat is támogat majd. Ebben a prototípusban egy magyar nyelvű, fiktív önéletrajz mintaelemzését próbálhatod ki.",
  },
  {
    question: "Mi történik a feltöltött fájlommal?",
    answer:
      "A kiválasztott fájl helyben marad a böngésződben. Nem olvassuk ki, nem küldjük szerverre és nem tároljuk tartósan. Eltávolításkor, továbblépéskor vagy az oldal elhagyásakor elengedjük a fájlt; a következő képernyő minden esetben mintaadatokat mutat.",
  },
];
