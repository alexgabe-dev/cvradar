"use client";

import { useEffect, useRef, useState } from "react";
import type { VerifiedCv, VerifiedFact } from "@/lib/cv-schema";
import { MAX_CV_CHARS, recognitionMessages } from "@/lib/recognition";
import { Icon } from "@/components/ui/icon";

function Fact({ label, fact }: { label?: string; fact: VerifiedFact | null }) {
  return (
    <div className="recognized-fact">
      {label && <strong>{label}</strong>}
      {fact ? (
        <>
          <p>{fact.value}</p>
          {fact.needsReview && (
            <p className="review-notice">
              Ezt érdemes ellenőrizned. {fact.reviewReason}
            </p>
          )}
          <details className="source-excerpt">
            <summary>
              Forrásrészlet{fact.sourceFound ? "" : " — nem igazolt"}
            </summary>
            <blockquote>{fact.source}</blockquote>
            <p className="field-note">
              {fact.sourceFound
                ? "A részlet megtalálható a kiolvasott szövegben."
                : "Ezt a részletet nem találtuk meg a kiolvasott szövegben."}
            </p>
          </details>
        </>
      ) : (
        <p className="field-note">
          Nincs megadva vagy nem sikerült felismerni.
        </p>
      )}
    </div>
  );
}

export function RecognitionPanel({ text }: { text: string }) {
  const pending = useRef<AbortController | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<VerifiedCv | null>(null);
  const [error, setError] = useState("");
  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => {
    if (data) heading.current?.focus();
  }, [data]);

  async function recognize() {
    if (pending.current || data) return;
    if (text.length > MAX_CV_CHARS) {
      setError(recognitionMessages.too_long);
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError("");
    const timer = setTimeout(() => controller.abort(), 40_000);
    try {
      const response = await fetch("/api/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        setError(recognitionMessages.provider);
        return;
      }
      const payload = await response.json();
      if (!response.ok) {
        const code = payload.error as keyof typeof recognitionMessages;
        setError(recognitionMessages[code] ?? recognitionMessages.provider);
        return;
      }
      if (!payload.data || typeof payload.data !== "object") {
        setError(recognitionMessages.invalid_response);
        return;
      }
      setData(payload.data);
    } catch {
      setError(
        controller.signal.aborted
          ? recognitionMessages.timeout
          : recognitionMessages.network,
      );
    } finally {
      clearTimeout(timer);
      pending.current = null;
      setBusy(false);
    }
  }

  if (data)
    return (
      <section className="recognized-cv" aria-labelledby="recognized-title">
        <h2 id="recognized-title" ref={heading} tabIndex={-1}>
          Ezeket találtuk a CV-dben
        </h2>
        <p>
          A felismerés tévedhet. Nyisd meg a forrásrészleteket, és ellenőrizd a
          besorolást is. A megtalált idézet önmagában nem garantálja, hogy az
          adatot jól értettük.
        </p>
        <section aria-labelledby="contact-title">
          <h3 id="contact-title">Név és elérhetőség</h3>
          <Fact label="Név" fact={data.name} />
          <Fact label="E-mail" fact={data.email} />
          <Fact label="Telefonszám" fact={data.phone} />
        </section>
        <section aria-labelledby="summary-title">
          <h3 id="summary-title">Szakmai összefoglaló</h3>
          <Fact fact={data.summary} />
        </section>
        <section aria-labelledby="experience-title">
          <h3 id="experience-title">Munkatapasztalatok</h3>
          {!data.experience.length && <p>Nincs felismert munkatapasztalat.</p>}
          {data.experience.map((item, index) => (
            <article className="recognized-entry" key={index}>
              <h4>Munkahely {index + 1}</h4>
              <Fact label="Munkáltató" fact={item.employer} />
              <Fact label="Munkakör" fact={item.role} />
              <Fact
                label="Időszak — az eredeti megfogalmazással"
                fact={item.period}
              />
              {item.description.map((fact, index) => (
                <Fact key={index} label="Leírás" fact={fact} />
              ))}
            </article>
          ))}
        </section>
        <section aria-labelledby="education-title">
          <h3 id="education-title">Tanulmányok</h3>
          {!data.education.length && <p>Nincs felismert tanulmány.</p>}
          {data.education.map((item, index) => (
            <article className="recognized-entry" key={index}>
              <h4>Tanulmány {index + 1}</h4>
              <Fact label="Intézmény" fact={item.institution} />
              <Fact label="Képzés" fact={item.qualification} />
              <Fact
                label="Időszak — az eredeti megfogalmazással"
                fact={item.period}
              />
            </article>
          ))}
        </section>
        <section aria-labelledby="skills-title">
          <h3 id="skills-title">Készségek</h3>
          {!data.skills.length && <p>Nincs felismert készség.</p>}
          {data.skills.map((fact, index) => (
            <Fact key={index} fact={fact} />
          ))}
        </section>
        <section aria-labelledby="languages-title">
          <h3 id="languages-title">Nyelvtudás</h3>
          {!data.languages.length && <p>Nincs felismert nyelvtudás.</p>}
          {data.languages.map((item, index) => (
            <article className="recognized-entry" key={index}>
              <Fact label="Nyelv" fact={item.language} />
              <Fact label="Szint" fact={item.level} />
            </article>
          ))}
        </section>
        <section aria-labelledby="other-title">
          <h3 id="other-title">Egyéb szakaszok</h3>
          {!data.otherSections.length && <p>Nincs egyéb felismert szakasz.</p>}
          {data.otherSections.map((item, index) => (
            <article className="recognized-entry" key={index}>
              <Fact label="Szakasz" fact={item.title} />
              {item.items.map((fact, index) => (
                <Fact key={index} fact={fact} />
              ))}
            </article>
          ))}
        </section>
        <section aria-labelledby="uncertainties-title">
          <h3 id="uncertainties-title">Feldolgozási bizonytalanságok</h3>
          <p>
            Az ellenőrizendő adatokat a helyükön is külön jelöljük. Ez nem
            teljes hibajegyzék.
          </p>
          {!data.uncertainties.length && (
            <p>
              Az AI nem jelzett külön bizonytalanságot. Ettől még lehetnek hibák
              vagy kimaradt adatok.
            </p>
          )}
          {data.uncertainties.map((fact, index) => (
            <Fact key={index} fact={fact} />
          ))}
        </section>
      </section>
    );

  return (
    <section
      className="recognition-start"
      aria-labelledby="recognition-start-title"
      aria-busy={busy}
    >
      <h3 id="recognition-start-title">Rendezzük a CV adatait?</h3>
      <p>
        A kiolvasott szöveget AI segítségével rendezzük. Ehhez elküldjük az
        AI-szolgáltatónak.
      </p>
      <p className="field-note">
        Csak a szöveget küldjük az OpenAI-nak, a dokumentumfájlt és az
        álláshirdetést nem. Nem készül pontozás vagy CV-értékelés.
      </p>
      <p className="field-note">
        Mi nem tároljuk tartósan a szöveget vagy az eredményt. Az OpenAI saját
        adatmegőrzési szabályai érvényesek: alapesetben legfeljebb 30 napos
        biztonsági naplózás és ideiglenes prompt-gyorsítótárazás is lehet. A
        kikapcsolt választárolás nem jelent nulla adatmegőrzést.{" "}
        <a
          href="https://developers.openai.com/api/docs/guides/your-data"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenAI adatkezelési tájékoztató
        </a>
      </p>
      {text.length > MAX_CV_CHARS && (
        <p className="review-notice">{recognitionMessages.too_long}</p>
      )}
      <button
        type="button"
        className="button button-dark"
        disabled={busy || text.length > MAX_CV_CHARS}
        onClick={recognize}
      >
        CV adatainak felismerése <Icon name="arrow" />
      </button>
      {busy && <p role="status">A CV adatait rendezzük. Kérjük, várj.</p>}
      {error && (
        <p className="form-error" role="alert" id="recognition-error">
          {error}
        </p>
      )}
    </section>
  );
}
