# CVRadar

Magyar önéletrajz-ellenőrző alkalmazás fejlesztés alatt. A PDF/DOCX szövegkinyerés már valódi; külön lépésben OpenAI segítségével strukturált adatokká is rendezhető a kiolvasott szöveg. CV-értékelés, pontozás, átírás és fizetés még nincs. A külön mintaelemzés minden adata fiktív.

## Indítás

Node.js 22.13+ szükséges a PDF.js miatt; fejlesztéshez Node.js 24 ajánlott. A lockfile npm-hez tartozik. A `.nvmrc` Node 24-et választ; nvm nélkül használj ennek megfelelő Node-verziót. Nem támogatott Node-verzióval az indítás azonnal, egyértelmű hibaüzenettel leáll.

```sh
nvm install
nvm use
npm ci
npm run dev
```

Megnyitás: http://localhost:3000

```sh
npm run build
npm start
```

A PDF/DOCX szövegkinyeréshez nem kell API-kulcs; az opcionális AI-adatfelismeréshez igen (lásd alább). Adatbázis nem kell. A futtatási környezetnek támogatnia kell a Node.js worker threadeket és a helyi npm-csomagok betöltését. Edge runtime és statikus export nem támogatott. A `src/lib/server/extract-worker.mjs` fájlnak a telepítésben is jelen kell lennie; a route file tracing konfigurációja ezt és a parsercsomagokat hozzáadja a buildhez. A projekt gyökere legyen a munkakönyvtár.

## Oldalak és felépítés

- `/`: a meglévő landing és saját HTML/CSS/SVG dokumentumillusztráció.
- `/ellenorzes`: PDF/DOCX kiválasztása vagy behúzása, valódi szövegkinyerés indítása, majd a fájlnév és a kiolvasott szöveg megjelenítése. A „Másik fájlt választok” törli az eredményt a felületről.
- `/api/extract`: csak POST, multipart `file` mezővel, Node.js runtime. A válasz `{ text }` vagy stabil hibakód és magyar üzenet. Minden válasz `Cache-Control: no-store, private, max-age=0` fejlécet kap.
- `/mintaelemzes`: változatlanul külön megnyitható, fiktív 82/100 pontszám és javítási példák. Valódi feltöltésből soha nem irányítunk ide és nem mutatunk demópontszámot.
- `src/lib/server/extract.ts`: megszakítható worker és erőforráskorlátok.
- `src/lib/server/extract-worker.mjs`: valódi PDF/DOCX feldolgozás, Next.js-bundling nélkül, natív Node-modulként.
- `src/lib/extraction.ts`: közös korlátok és felhasználói hibaüzenetek.
- `src/lib/demo-data.ts`: kizárólag a landing és a külön mintaelemzés fiktív adatai.
- `src/components/`: landing-, feltöltés-, eredmény-, layout- és UI-komponensek.
- `src/app/globals.css`, `src/app/landing.css`: a megtartott arculat, reszponzív stílusok és Tailwind 4 theme.

Next.js 16.4.1 App Router, strict TypeScript, React, Tailwind és Motion. Helyben kiszolgált DM Sans és Newsreader betűk. A csökkentett mozgás beállítása támogatott.

## Feldolgozás és korlátok

Rögzített parserverziók:

- [Mozilla PDF.js / pdfjs-dist](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html): szövegréteggel rendelkező PDF-ek, oldalanként és szövegfolyamból. A JavaScript-eval és az XFA tiltva van; nem adunk URL-t a parsernek.
- [Mammoth](https://github.com/mwilliamson/mammoth.js): DOCX nyersszöveg-kinyerés, HTML-konverzió nélkül. A bekezdések közötti sortörések megmaradnak. A raw-text API nem dolgozza fel a külső erőforrásokat.
- [yauzl](https://github.com/thejoshwolfe/yauzl): a DOCX ZIP-bejegyzéseinek soros ellenőrzése, deklarált és tényleges kibontott méretek figyelésével.
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser): a DOCX XML-jeinek ellenőrzése; DTD és entitásdeklaráció nem engedélyezett.

Korlátok:

- Fájlonként maximum **10 MiB** (a felületen 10 MB). A ténylegesen olvasott teljes HTTP-body legfeljebb 10 MiB + 64 KiB multipart-többlet, Content-Length hiányában is.
- A fájlkiterjesztés mellett a PDF fejlécét és parszerrel a szerkezetét, DOCX-nél a ZIP-et, a kötelező csomagrészeket, a Word content type-ot és a dokumentum XML-névterét is ellenőrizzük. A kliens MIME-típusa nem szerveroldali bizonyíték.
- A worker legfeljebb **15 másodpercig**, a kérés olvasással együtt legfeljebb **20 másodpercig** futhat. Időtúllépéskor vagy kérésmegszakításkor a worker ténylegesen leáll; nem csak egy Promise-t hagyunk abba.
- Maximum **200 000 karakter**, PDF-nél legfeljebb **200 oldal**; nincs csendes levágás.
- DOCX: legfeljebb **1000 ZIP-bejegyzés**, bejegyzésenként **10 MiB**, összesen **30 MiB** kibontott tartalom. Duplikált bejegyzések, titkosított ZIP és DTD elutasítva.
- Worker: 128 MiB old-generation és 16 MiB young-generation V8 heap keret. Ez **nem teljes process/RSS-memóriakorlát**, a natív és ArrayBuffer-memóriát nem fedi le.
- Egy Node-processben legfeljebb két párhuzamos feltöltés/feldolgozás engedélyezett.

Nincs OCR. A csak képet tartalmazó/beszkennelt PDF nem kap mintaeredményt: érthető hibát mutatunk. A jelszóval védett PDF-ekhez nem kérünk jelszót. Sérült, üres, nem támogatott, túl nagy, túl összetett, túl hosszú és időtúllépést okozó dokumentumokhoz külön üzenet tartozik.

A szövegkinyerés nem ígéri az eredeti tördelés vagy a többoszlopos olvasási sorrend pontos visszaadását, illetve azt, hogy minden ATS ugyanezt látná. DOCX-nél a fő dokumentumtörzs szövegét nyerjük ki; fejlécek, láblécek, képek szövege és összetett dokumentumrészek hiányozhatnak. A jelenlegi DOCX-ellenőrzés a szokásos UTF-8, transitional WordprocessingML dokumentumokra készült; strict OOXML és alternatív névtérprefixek nem támogatottak.

## Adatkezelés

A fájl a kiválasztáskor a böngésző memóriájában marad; csak a „Szöveg kiolvasása” indítja a feltöltést. A szerveren a fájl és a szöveg a kérés és a worker futásához szükséges ideig memóriában él. Nem írunk ideiglenes fájlt, adatbázist vagy publikus fájl-URL-t. A memóriát a futtatókörnyezet szabadítja fel; nem ígérünk biztonságos memóriatörlést.

Nem naplózunk fájlnevet, dokumentumtartalmat, parserhiba-részleteket, API-kulcsot vagy kinyert személyes adatokat. A worker diagnosztikai kimenetét nem továbbítjuk. A szövegkinyerés nem küld adatot AI-szolgáltatónak. A külön, tájékoztatás után indítható „CV adatainak felismerése” a kiolvasott szöveget elküldi az OpenAI-nak; a dokumentumfájlt, a fájlnevet és az álláshirdetést nem. A felismerési eredmény is csak memóriában marad, nem naplózzuk és nem tároljuk tartósan.

A szöveg React szövegként, sortöréseket megtartó nézetben jelenik meg, nem HTML-ként. Nincs dokumentumból származó kódvégrehajtás vagy linkmegnyitás. Nincs helyi/session storage, süti vagy tartós eredménytárolás. A feltöltött fájlt siker után elengedjük; az eredmény másik fájl választásakor vagy az oldal elhagyásakor eltűnik. Hiba után a fájl a böngészőben marad az újrapróbáláshoz vagy eltávolításig.

Az álláshirdetés mezője csak a böngésző memóriájában marad, **nem kerül a kérésbe**, és nem értékeljük. Az összevetés később lesz elérhető. A mintaelemzés régi `?hirdetes=megadva` állapota továbbra is megnyitható, de a valódi feltöltés nem használja.

## Nyilvános üzemeltetés

**A végpont jelenleg nem kész korlátlan nyilvános üzemeltetésre.** A processenkénti párhuzamossági korlát és az Origin-ellenőrzés nem helyettesít elosztott/IP-alapú rate limitet vagy visszaélésvédelmet. Nincs autentikáció, kvóta, külön OS/container sandbox és teljes RSS/CPU-korlát a parserhez. A worker thread nem biztonsági sandbox.

Nyilvános kihelyezés előtt szükséges a rate limit, a feltöltési és időkorlátok beállítása a proxy/hoszting rétegen, a memóriakapacitás és Node-worker támogatás ellenőrzése, valamint annak biztosítása, hogy a hoszting/proxy/APM ne naplózzon vagy tároljon request/response bodyt. Egyes hosztok saját, 10 MiB-nál kisebb bodylimitje külön konfigurációt vagy más futtatási környezetet igényel. Jelenleg lokális `next dev` és `next start` futtatásra ellenőrizzük.

Az npm audit a Mammoth CLI-függőségláncában (`argparse` → `sprintf-js`) három közepes besorolású találatot jelez; a használt raw-text könyvtári útvonal nem tölti be ezt a CLI-t. Emellett a meglévő fejlesztői ESLint-láncban öt magas besorolású találat maradt. A felkínált visszaváltásokat nem alkalmaztuk; nyilvános üzemeltetés előtt ezek követése is szükséges.

## Ellenőrzés

```sh
npm run lint
npm run typecheck
npm run format:check
npm run build
# Futtatott dev vagy production szerver mellett:
npm run test:e2e
```

Ha nincs Chromium: `npx playwright install chromium`.

A Playwright három nézeten fut: 1440×900, 768×1024 és 390×844. A tesztek valódi PDF/DOCX feltöltést, magyar ékezeteket, sortöréseket, hibás/üres/hamis fájlokat, pontos 10 MiB-os határt, túlméretes fájlt, képes PDF-et, jelszóvédelmet, DOCX-kibontási és szövegkimeneti korlátot, tényleges workermegszakítást, hálózati/szerverhibát, HTML-szöveg ártalmatlan megjelenítését, álláshirdetés ki nem küldését és a változatlan mintaelemzés elérését ellenőrzik. A korábbi navigációs, fájlcsere-, drag-and-drop-, billentyűzetes, overflow-, reduced-motion- és axe WCAG A/AA ellenőrzések megmaradtak.

Minden tesztdokumentum fiktív, a `tests/fixtures/` mappában található. Generátoruk `generate.py` (Python: reportlab, pypdf, pillow; a magyar betűkhöz `CVRADAR_TEST_FONT` TTF-útvonal). A tesztfuttatáshoz Python nem szükséges, a kis fixture-fájlok a repositoryban vannak.

A `PLAYWRIGHT_BASE_URL` más szervercímet, a `PLAYWRIGHT_SCREENSHOT_DIR` más képmappát ad meg. A meglévő referenciaképek felülírásának elkerüléséhez például:

```sh
PLAYWRIGHT_SCREENSHOT_DIR=/tmp/cvradar-screenshots npm run test:e2e
```

A riport a `playwright-report/index.html` fájlba készül. Az automatizált axe nem helyettesít teljes manuális akadálymentességi auditot.

## AI-adatfelismerés

A szövegkinyerés után a „CV adatainak felismerése” külön indítja a `/api/recognize` POST JSON `{ text }` kérését. Ez a meglévő feltöltési folyamat következő lépése, nem második feltöltési rendszer. Az eredmény címe „Ezeket találtuk a CV-dben”; az eredeti kinyert szöveg megmarad. A „Másik fájlt választok” az AI-eredményt is eltávolítja.

### Konfiguráció

```sh
cp .env.example .env.local
# A .env.local fájlban add meg a saját API-kulcsot, majd indítsd újra a szervert.
```

- `OPENAI_API_KEY`: szerveroldali OpenAI API-kulcs. Üres értéknél beállítási hiba jelenik meg; a parser és a nyers szöveg tovább működik.
- `OPENAI_MODEL`: Responses API-t és szigorú Structured Outputs kimenetet támogató modell. Alapértelmezés és példa: `gpt-4.1-mini`. A fióknak hozzáféréssel kell rendelkeznie a választott modellhez; ezt mock nem igazolja.

A `.env*` gitignore-ban van, csak a titok nélküli `.env.example` kivétel. Ne használj `NEXT_PUBLIC_` előtagot a kulcshoz. A modell/kulcs nem adható meg a kérésben. Nincs publikus mock-mód, alternatív szolgáltatói API-cím vagy automatikus mintaadat-fallback.

A hivatalos OpenAI SDK `responses.parse` metódusát és a [Zod / Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) szigorú sémáját használjuk. Egy kérés indul SDK-retry nélkül (`maxRetries: 0`), eszközhívás, beszélgetéstároló és háttérfeldolgozás nélkül. A dokumentum külön, nem megbízható user-tartalom; a rendszerutasítás tiltja a benne található utasítások követését és új tények kitalálását. A séma nem enged pontozási/értékelési vagy más plusz mezőt.

### Adatmodell és forrásellenőrzés

A `src/lib/cv-schema.ts` tartalmazza a szigorú sémát: név, e-mail, telefon, meglévő szakmai összefoglaló; munkahelyek munkáltatóval, munkakörrel, eredeti időszakkal és leírásrészletekkel; tanulmányok; készségek; nyelvek és szintek; egyéb szakaszok; bizonytalanságok. Minden nem null tartalmi mező `{ value, source }`, hiány esetén null vagy üres lista. A dátumot nem alakítjuk át és nem egészítjük ki.

A backend minden forrásrészletet kizárólag whitespace-normalizálás után keres a kinyert szövegben. Kisbetűsítés, ékezetcsere, írásjelcsere és fuzzy matching nincs. A mező értékét is keressük a saját forrásidézetében. A nem igazolható elemek megmaradnak, de ellenőrizendő jelzést kapnak. Az AI által jelzett bizonytalanság akkor is ellenőrizendő, ha az idézete megtalálható. Minden idézet megnyitható a felületen.

A forrás egyezése nem bizonyítja a helyes személyhez, munkahelyhez vagy szakaszhoz rendelést, nem helyettesít szemantikai ellenőrzést, és nem mutatja meg az összes kihagyott adatot. A prompt-injection elleni utasítás és a séma nem teljes szemantikai védelem; emberi ellenőrzés szükséges. A felismerés nem jelöltértékelés.

### AI-korlátok és hibakezelés

- Bemenet: **30 000 karakter**, csendes csonkítás nélkül.
- Kimenet: **8000 output token**, **64 KiB** feldolgozott JSON, **256 KiB** szolgáltatói HTTP-válasz.
- AI-hívás: **30 másodperc**, kérés olvasással együtt **35 másodperc**, kliensoldali megszakítás **40 másodperc** után.
- Processenként legfeljebb két AI-kérés; dupla kattintást kliensoldali ref és tiltott gomb is véd.
- Hiányzó kulcs, szolgáltatói hiba, időtúllépés, elutasítás, hiányos és sémahibás válasz külön hibát ad. A nyers szöveg megmarad, újrapróbálkozás csak felhasználói művelettel indul.
- A válaszok `Cache-Control: no-store, private, max-age=0` fejlécet kapnak. Nincs tartós AI-eredménytárolás a CVRadarban.

### OpenAI-adatmegőrzés

A kérés `store: false`, `background: false` beállítással megy. Ez kikapcsolja a válasz szokásos alkalmazásállapotként való tárolását, **nem jelent Zero Data Retentiont**. A [hivatalos adatkezelési dokumentáció](https://developers.openai.com/api/docs/guides/your-data) szerint alapesetben legfeljebb 30 napos visszaélés-megelőzési naplózás és ideiglenes prompt-gyorsítótárazás is lehet. A szolgáltatói/fiókszintű beállítások és modellek eltérhetnek; ZDR-jogosultságot nem feltételezünk. Az API-adatokat alapértelmezés szerint nem használják modelltréningre, kivéve kifejezett adatmegosztási hozzájárulás esetén. A küldés előtt a felületen külön tájékoztatás és hivatkozás jelenik meg.

### Mock és valódi API

Az AI-integrációt ebben a munkamenetben **nem teszteltük valódi OpenAI API-hívással**, mert nem volt konfigurált kulcs. A SDK-tesztek valódi SDK-t és sémagenerátort használnak mock HTTP-transporttal. A route-tesztek függőséginjektálással, a böngészős AI-eredmények Playwright-hálózatmockkal futnak. A PDF/DOCX parser a böngészős folyamatban ténylegesen lefut. Nincs tesztkódhoz vezető publikus végpont vagy éles mock-kapcsoló.

A fiktív magyar/angol teszt-CV-k hiányzó mezőket, több és átfedő munkahelyet, bizonytalan dátumot, dokumentumba rejtett utasítás elkülönítését, hamis idézetet, nem alátámasztott értéket, szolgáltatói hibát, elutasítást, időtúllépést, hibás/hiányos sémát és kimeneti korlátot fednek le. A böngészős teszt külön indítást, egyetlen kérést dupla kattintáskor, forrásokat, ellenőrizendő jelzést, nyers szöveg megőrzését, reszponzív nézetet és axe WCAG A/AA-t vizsgál. Ezek **nem bizonyítják a valódi modell pontosságát vagy prompt-injection ellenállását**.

Nyilvános üzem előtt valódi kulccsal és modell-hozzáféréssel fiktív CV-ken végzett tényhűségi evalok szükségesek. Az AI-végponthoz sincs IP/felhasználó alapú rate limit vagy költségkvóta. Szükséges a rate limit, költséglimit, hozzáférésvédelem, az adatkezelési feltételek és a szolgáltatói régió/megőrzési beállítások rendezése is. A hoszting/APM ne naplózzon CV-t tartalmazó request/response bodyt.
