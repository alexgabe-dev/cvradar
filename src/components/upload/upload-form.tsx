"use client";

import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import { MAX_FILE_BYTES, extractionMessages } from "@/lib/extraction";
import { RecognitionPanel } from "@/components/recognition/recognition-panel";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const MAX_BYTES = MAX_FILE_BYTES;
const TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatSize(bytes: number) {
  const formatter = new Intl.NumberFormat("hu-HU", {
    maximumFractionDigits: 2,
  });
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${formatter.format(bytes / 1024)} KB`;
  return `${formatter.format(bytes / (1024 * 1024))} MB`;
}

export function UploadForm() {
  const request = useRef<AbortController | null>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ name: string; text: string } | null>(
    null,
  );
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (result) resultHeading.current?.focus();
  }, [result]);
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [job, setJob] = useState("");
  const dragDepth = useRef(0);

  function select(files: FileList | null) {
    if (busy) return;
    setError("");
    if (!files?.length) return;
    if (files.length > 1) {
      setError("Egyszerre egy fájlt válassz ki.");
      return;
    }
    const next = files[0];
    const extension = next.name.split(".").pop()?.toLowerCase();
    if (
      !["pdf", "docx"].includes(extension ?? "") ||
      (next.type && !TYPES.includes(next.type))
    ) {
      setError(
        "Ezt a fájltípust nem tudod kiválasztani. PDF- vagy DOCX-fájlt válassz.",
      );
    } else if (next.size > MAX_BYTES) {
      setError(
        "A fájl nagyobb 10 MB-nál. Válassz kisebb fájlt; a határ 10 MB.",
      );
    } else if (next.size === 0) {
      setError(
        "A kiválasztott fájl üres. Válassz egy másik PDF- vagy DOCX-fájlt.",
      );
    } else {
      setFile(next);
    }
    if (input.current) input.current.value = "";
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    select(event.dataTransfer.files);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (request.current) return;
    if (!file) {
      setError(
        "Először válassz egy PDF- vagy DOCX-fájlt. A mintaelemzést fájl nélkül is megnézheted.",
      );
      input.current?.focus();
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 25_000);
    setBusy(true);
    setError("");
    const name = file.name;
    try {
      const data = new FormData();
      data.append("file", file);
      // The job description stays in browser memory; only the file is sent.
      const response = await fetch("/api/extract", {
        method: "POST",
        body: data,
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        setError(extractionMessages.server);
        return;
      }
      const payload = await response.json();
      if (!response.ok) {
        const code = payload.error as keyof typeof extractionMessages;
        setError(extractionMessages[code] ?? extractionMessages.server);
        return;
      }
      if (typeof payload.text !== "string") {
        setError(extractionMessages.server);
        return;
      }
      setResult({ name, text: payload.text });
      setFile(null);
      setJob("");
    } catch {
      setError(
        controller.signal.aborted
          ? extractionMessages.timeout
          : extractionMessages.network,
      );
    } finally {
      clearTimeout(timer);
      request.current = null;
      setBusy(false);
    }
  }

  if (result)
    return (
      <section
        className="upload-form extraction-result"
        aria-labelledby="extraction-title"
      >
        <h2 id="extraction-title" ref={resultHeading} tabIndex={-1}>
          Ezt a szöveget sikerült kiolvasnunk a dokumentumból.
        </h2>
        <p className="selected-filename">{result.name}</p>
        <p>
          Ez szövegkinyerés, még nem CV-értékelés. Nem adunk pontszámot vagy
          javítási javaslatot. Az elrendezés és az olvasási sorrend eltérhet az
          eredeti dokumentumtól.
        </p>
        <RecognitionPanel text={result.text} />
        <h3>Eredeti kinyert szöveg</h3>
        <pre className="extracted-text">{result.text}</pre>
        <button
          type="button"
          className="button button-dark"
          onClick={() => {
            setResult(null);
            setError("");
          }}
        >
          Másik fájlt választok <Icon name="arrow" />
        </button>
        <p className="field-note">
          Mi nem tároljuk tartósan a fájlt, a szöveget vagy a felismert
          adatokat. Az AI-felismerés csak a külön gombbal indul. A megjelenített
          adatok az oldal elhagyásakor vagy másik fájl választásakor eltűnnek.
        </p>
      </section>
    );

  return (
    <form onSubmit={submit} className="upload-form" noValidate aria-busy={busy}>
      <fieldset disabled={busy} className="extraction-fields">
        <div className="demo-notice">
          <Icon name="shield" />
          <p>
            <strong>Valódi szövegkinyerés, értékelés nélkül.</strong> Indításkor
            a fájl a szerverre kerül. Csak a feldolgozáshoz tartjuk memóriában;
            nem tároljuk tartósan és nem küldjük AI-szolgáltatónak.
          </p>
        </div>
        <div className="field-heading">
          <h2>
            <span>01</span>Az önéletrajzod
          </h2>
          <span>PDF vagy DOCX · max. 10 MB</span>
        </div>
        <div
          className={`dropzone ${dragging ? "is-dragging" : ""} ${file ? "has-file" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            dragDepth.current++;
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            event.preventDefault();
            if (--dragDepth.current === 0) setDragging(false);
          }}
          onDrop={drop}
        >
          <input
            ref={input}
            id="cv-file"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="visually-hidden file-input"
            aria-describedby={`file-help${error ? " file-error" : ""}`}
            aria-invalid={!!error}
            onChange={(event) => select(event.currentTarget.files)}
          />
          <div className="upload-symbol">
            <Icon name={file ? "file" : "upload"} />
          </div>
          {file ? (
            <>
              <p className="selected-filename" role="status">
                {file.name}
              </p>
              <p className="file-size">
                {formatSize(file.size)} · Indításkor a szerverre kerül
              </p>
              <div className="file-actions">
                <label className="file-picker small-picker" htmlFor="cv-file">
                  Fájl cseréje
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setError("");
                    if (input.current) input.current.value = "";
                  }}
                >
                  Eltávolítás <Icon name="close" />
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>Húzz ide egy PDF- vagy DOCX-fájlt.</h3>
              <p>Vagy válaszd ki a gépedről.</p>
              <label htmlFor="cv-file" className="file-picker">
                Fájl kiválasztása <Icon name="plus" />
              </label>
            </>
          )}
        </div>
        {busy && (
          <p role="status" className="field-note">
            A dokumentum szövegét olvassuk ki. Kérjük, várj.
          </p>
        )}
        <div className="upload-feedback" aria-live="polite">
          {error && (
            <p id="file-error" role="alert" className="form-error">
              {error}
            </p>
          )}
        </div>
        <p className="field-note" id="file-help">
          PDF vagy DOCX, legfeljebb 10 MB. A szerver a tényleges formátumot is
          ellenőrzi. Beszkennelt, csak képet tartalmazó PDF-hez jelenleg nincs
          OCR.
        </p>
        <div className="job-field">
          <div className="field-heading">
            <label htmlFor="job-description">
              <span>02</span>Álláshirdetés
            </label>
            <span>Opcionális</span>
          </div>
          <textarea
            id="job-description"
            value={job}
            onChange={(event) => setJob(event.target.value)}
            rows={5}
            maxLength={20000}
            placeholder="Másold ide az álláshirdetés szövegét…"
            aria-describedby="job-help"
          />
          <p id="job-help" className="field-note">
            Az álláshirdetéssel való összevetés később lesz elérhető. Ezt a
            mezőt most nem küldjük el és nem dolgozzuk fel.
          </p>
        </div>
        <div className="form-bottom">
          <button type="submit" className="button button-dark">
            {busy ? "Szöveg kiolvasása folyamatban…" : "Szöveg kiolvasása"}{" "}
            <Icon name="arrow" />
          </button>
          <Link href="/mintaelemzes">
            Megnézem a mintaelemzést <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <p className="form-privacy">
          <Icon name="shield" />
          Nincs tartós tárolás és nincs AI-feldolgozás.
        </p>
      </fieldset>
    </form>
  );
}
