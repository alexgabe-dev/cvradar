# CVRadar

Magyar önéletrajz-ellenőrző webes prototípus: saját arculatú landing, helyi fájlválasztás és végigjárható mintaelemzés.

## Indítás

Node.js 20.9+ és npm szükséges (fejlesztéshez Node.js 24 LTS ajánlott).

```sh
npm ci
npm run dev
```

Megnyitás: http://localhost:3000

```sh
npm run build
npm start
```

## Oldalak és felépítés

- `/`: landing, HTML/CSS/SVG dokumentumillusztráció, összehasonlítás, működés, vizsgálati szempontok, árak, GYIK.
- `/ellenorzes`: fájlválasztás és drag-and-drop, PDF/DOCX, 10 MB limit, csere, eltávolítás, opcionális álláshirdetés.
- `/mintaelemzes`: közvetlenül is megnyitható, illusztratív eredmény.
- `src/components/`: külön landing-, feltöltés-, eredmény-, layout- és UI-komponensek.
- `src/lib/demo-data.ts`: közös, fiktív CV és elemzési adatok.
- `src/app/globals.css`: központi szín-, betű-, méret- és elrendezési tokenek; reszponzív stílusok, Tailwind CSS 4 theme.
- `src/app/landing.css`: a vizuális referenciához igazított landing, a demó és az eredményoldal stílusaitól elkülönítve.

Next.js App Router, strict TypeScript, Tailwind CSS és Motion for React. Saját gépről kiszolgált Newsreader és DM Sans betűk, magyar karakterkészlettel és rendszerbetűs fallbackkel. A mozgások végesek, a reduced-motion beállítás támogatott; a tartalom JavaScript-animáció nélkül is látható.

## Demókorlátok és adatkezelés

A kiválasztott fájlt nem olvassuk, nem küldjük szerverre és nem tároljuk. Az inputot kiválasztás után ürítjük; React state-ben csak a fájlnév és a méret marad, maga a File objektum nem. Nincs localStorage, sessionStorage, süti vagy adatbázis a demóadatok tárolására.

A típus-, MIME- és méretellenőrzés kizárólag felületi validáció, nem dokumentumbiztonsági vizsgálat. A bemásolt hirdetés a komponens memóriájában marad, továbblépéskor törlődik; az eredményoldalhoz csak egy „hirdetés megadva” jelző kerül az URL-be.

Minden pontszám, kiolvasott adat és javítási javaslat fiktív mintaadat, függetlenül a kiválasztott fájltól. Az álláshirdetés tartalmát nem értékeljük; illeszkedési pontszám nincs. A 82/100 saját CV-minőségi mutató illusztrációja, nem univerzális ATS-pontszám vagy interjúgarancia.

Nincs AI API, dokumentumfeldolgozás, adatbázis, autentikáció, export vagy fizetési integráció. Az 1 990 Ft tervezett egyszeri induló ár; a szolgáltatás még nem vásárolható meg.

## Ellenőrzés

```sh
npm run lint
npm run typecheck
npm run build
# Futtatott dev vagy production szerver mellett:
npm run test:e2e
```

Ha Chromium nincs telepítve a Playwright számára: `npx playwright install chromium`.
Más szervercímhez a `PLAYWRIGHT_BASE_URL` környezeti változó használható.

A Playwright tesztek 1440×900, 768×1024 és 390×844 nézetben vizsgálják a navigációt, mobilmenüt, GYIK-et, közvetlen eredményt, teljes demófolyamatot, hibás/üres/túlméretes fájlt, a pontos 10 MB-os határt, cserét, eltávolítást, drag-and-dropot és több fájl elutasítását. Hálózati és tárolási ellenőrzés, konzolhibák figyelése, billentyűzetes fókusz, vízszintes túlcsordulás, reduced-motion és axe WCAG A/AA ellenőrzés is szerepel bennük. Az automatizált axe-vizsgálat nem helyettesít teljes manuális akadálymentességi auditot.

Képernyőképek: `screenshots/hero-{desktop,tablet,mobile}.png`, `screenshots/landing-{desktop,tablet,mobile}.png`, `screenshots/upload-{desktop,tablet,mobile}.png`, `screenshots/report-{desktop,tablet,mobile}.png`.
Az új, referencia alapján átdolgozott változat képei a `screenshots/reference-update/` mappában találhatók. A korábbi képek összehasonlításként megmaradtak. A tesztek képmappája a `PLAYWRIGHT_SCREENSHOT_DIR` környezeti változóval állítható.
Playwright HTML-riport: `playwright-report/index.html` (tesztfuttatás után).

Átadási ellenőrzés a referenciához igazított változaton: a production build, ESLint, strict TypeScript és Prettier ellenőrzés sikeres. Mind a 18 Playwright teszt sikeres fejlesztői szerveren, a három kért méreten. Az axe vizsgálat nem jelzett WCAG A/AA szabálysértést. A production szerveren külön böngészős ellenőrzés vizsgálta a három méretet, az új mintaelemzés-CTA-t, a feltöltéshez és a kezdőlaphoz visszalépést, az oldalak közti stílusváltást, a konzolhibákat, a hiányzó asseteket és a túlcsordulást; minden ellenőrzés sikeres. A végleges képernyőképeket vizuálisan is átnéztük. A Next DevTools MCP üres konfigurációs/futási hibalistát és üres fordítási hibalistát adott.

A futó Next.js DevTools MCP diagnosztikája közvetlenül a `/_next/mcp` végponton érhető el. A fejlesztés során a `get_errors` és `get_compilation_issues` eszközökkel ellenőrizhető. Context7 MCP nem volt elérhető ebben a munkamenetben; a verziókat az npm registryből, a Next API-kat a telepített Next dokumentációjából ellenőriztük. A második körben megérkezett vizuális referencia alapján a landing új kompozíciót, mentazöld tipográfiai hangsúlyt, kétoszlopos dokumentumillusztrációt, szkennerfényt és sötét–világos szekcióváltásokat kapott. A referencia igazolatlan statisztikáit, ügyféllogóit és véleményeit nem vettük át.

Az éles függőségek auditja tiszta (`npm audit --omit=dev`). A teljes audit 5 fejlesztői függőséget érintő találatot jelez a Next ESLint → fast-glob → micromatch → braces láncban; a registryben nincs javított braces-verzió. A felkínált Next ESLint főverzió-visszaváltást nem alkalmazzuk.
