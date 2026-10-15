"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const MAX_BYTES = 10 * 1024 * 1024;
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
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [job, setJob] = useState("");
  const dragDepth = useRef(0);

  function select(files: FileList | null) {
    setError("");
    if (!files?.length) return;
    if (files.length > 1) {
      setError("Egyszerre egy önéletrajzot válassz ki.");
      return;
    }
    const next = files[0];
    const extension = next.name.split(".").pop()?.toLowerCase();
    if (
      !["pdf", "docx"].includes(extension ?? "") ||
      (next.type && !TYPES.includes(next.type))
    ) {
      setError("Ez a fájltípus nem támogatott. PDF- vagy DOCX-fájlt válassz.");
    } else if (next.size > MAX_BYTES) {
      setError(
        "A fájl nagyobb 10 MB-nál. Válassz egy legfeljebb 10 MB méretű fájlt.",
      );
    } else if (next.size === 0) {
      setError(
        "A kiválasztott fájl üres. Válassz egy másik PDF- vagy DOCX-fájlt.",
      );
    } else {
      setFile({ name: next.name, size: next.size });
    }
    if (input.current) input.current.value = "";
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    select(event.dataTransfer.files);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError(
        "Először válassz egy PDF- vagy DOCX-fájlt, vagy nyisd meg a példát fájl nélkül.",
      );
      input.current?.focus();
      return;
    }
    const hasJob = job.trim().length > 0;
    setFile(null);
    setJob("");
    if (input.current) input.current.value = "";
    router.push(`/mintaelemzes${hasJob ? "?hirdetes=megadva" : ""}`);
  }

  return (
    <form onSubmit={submit} className="upload-form" noValidate>
      <div className="demo-notice">
        <Icon name="shield" />
        <p>
          <strong>Ez egy kipróbálható demó.</strong> A fájlodat nem küldjük el;
          a következő képernyőn mintaelemzést mutatunk.
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
              {formatSize(file.size)} · Csak a böngésződben
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
            <h3>Húzd ide az önéletrajzodat.</h3>
            <p>Vagy válaszd ki a gépedről.</p>
            <label htmlFor="cv-file" className="file-picker">
              Fájl kiválasztása <Icon name="plus" />
            </label>
          </>
        )}
      </div>
      <div className="upload-feedback" aria-live="polite">
        {error && (
          <p id="file-error" role="alert" className="form-error">
            {error}
          </p>
        )}
      </div>
      <p className="field-note" id="file-help">
        Csak a fájl típusát és méretét ellenőrizzük a felületen. Ez nem
        dokumentumbiztonsági vizsgálat; a fájl tartalmát nem olvassuk ki.
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
          A demó nem értékeli ki a bemásolt tartalmat. Az álláshoz
          illeszkedéshez még nem ad pontszámot.
        </p>
      </div>
      <div className="form-bottom">
        <button type="submit" className="button button-dark">
          Mintaelemzés megnyitása <Icon name="arrow" />
        </button>
        <Link href="/mintaelemzes">
          Megnézem fájl nélkül <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <p className="form-privacy">
        <Icon name="shield" />
        Nincs feltöltés. Nincs tartós tárolás.
      </p>
    </form>
  );
}
