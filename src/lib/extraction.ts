export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TEXT_CHARS = 200_000;
export const EXTRACTION_TIMEOUT_MS = 15_000;
export const extractionMessages = {
  unsupported:
    "Ez nem támogatott fájlformátum. Valódi PDF- vagy DOCX-fájlt válassz.",
  too_large: "A fájl nagyobb 10 MB-nál. Válassz legfeljebb 10 MB méretű fájlt.",
  corrupt:
    "A dokumentum sérült vagy hiányos, ezért nem tudtuk feldolgozni. Próbáld újra elmenteni PDF- vagy DOCX-formátumban.",
  password:
    "A PDF jelszóval védett. Válassz egy jelszóvédelem nélküli példányt.",
  empty: "A dokumentum üres, vagy nem tartalmaz kinyerhető szöveget.",
  no_text_pdf:
    "A PDF-ből nem sikerült szöveget kiolvasni. Ha beszkennelt, csak képet tartalmazó dokumentum, jelenleg nincs OCR, ezért ebből nem tudunk szöveget kiolvasni.",
  timeout:
    "A feldolgozás túl sokáig tartott, ezért leállítottuk. Próbálj kisebb vagy egyszerűbb dokumentumot.",
  output_limit:
    "A dokumentum meghaladja a feldolgozási korlátot: legfeljebb 200 000 karaktert és PDF esetén 200 oldalt tudunk kezelni. Válassz rövidebb dokumentumot.",
  archive_limit:
    "A DOCX kibontott tartalma túl nagy vagy túl összetett. Mentsd el egyszerűbb dokumentumként, és próbáld újra.",
  server: "A szerver most nem tudta feldolgozni a fájlt. Próbáld újra később.",
  network:
    "Nem sikerült elérni a szervert. Ellenőrizd a kapcsolatot, és próbáld újra.",
} as const;
export type ExtractionErrorCode = keyof typeof extractionMessages;
