export const MAX_CV_CHARS = 30_000;
export const AI_TIMEOUT_MS = 30_000;
export const MAX_AI_OUTPUT_BYTES = 64 * 1024;
export const recognitionMessages = {
  invalid:
    "A felismeréshez a már kiolvasott, nem üres CV-szövegre van szükség.",
  too_long:
    "A CV szövege túl hosszú az AI-felismeréshez. Legfeljebb 30 000 karaktert tudunk elküldeni; nem vágtunk le belőle. Az eredeti szöveg továbbra is elérhető.",
  not_configured:
    "Az AI-felismerés még nincs beállítva ezen a szerveren. A kiolvasott szöveget továbbra is megnézheted.",
  busy: "A felismerés most foglalt. Próbáld újra később.",
  timeout:
    "Az AI-felismerés túllépte az időkorlátot. A kiolvasott szöveg megmaradt; később újra próbálhatod.",
  refused:
    "Az AI-szolgáltató elutasította a felismerést. A kiolvasott szöveg továbbra is elérhető.",
  invalid_response:
    "Nem kaptunk teljes, megfelelő formátumú választ. Nem jelenítünk meg részleges vagy mintaeredményt. A kiolvasott szöveg megmaradt.",
  provider:
    "Az AI-szolgáltató most nem tudta feldolgozni a kérést. A kiolvasott szöveg megmaradt; próbáld újra később.",
  network:
    "Nem sikerült elérni a szervert. A kiolvasott szöveg megmaradt; ellenőrizd a kapcsolatot.",
} as const;
export type RecognitionErrorCode = keyof typeof recognitionMessages;
