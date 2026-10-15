import Link from "next/link";
import { demoCv, improvements, subscores } from "@/lib/demo-data";
import { Comparison } from "@/components/landing/comparison";
import { Icon } from "@/components/ui/icon";
import { Entrance } from "@/components/ui/motion";

export function ResultReport({ hasJob }: { hasJob: boolean }) {
  return (
    <>
      <div className="report-notice">
        <span className="sample-badge">
          <span className="status-dot" />
          Mintaelemzés
        </span>
        <p>
          Fiktív önéletrajz, illusztratív pontszámok. Ez az eredmény nem a
          kiválasztott fájlodból készült.
        </p>
      </div>
      <Entrance className="report-title">
        <span className="eyebrow">KOVÁCS ANNA · FIKTÍV MINTA-CV</span>
        <h1>Van mire építened.</h1>
        <p>
          A tapasztalatod jól kirajzolódik. Néhány pontosabb részlettel
          <br className="desktop-break" /> még könnyebb lesz megérteni, mit
          hozol magaddal.
        </p>
      </Entrance>
      <section className="score-overview" aria-labelledby="score-title">
        <div className="main-score">
          <div className="score-ring">
            <svg viewBox="0 0 180 180" aria-hidden="true">
              <circle
                cx="90"
                cy="90"
                r="80"
                stroke="#dce2df"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="90"
                cy="90"
                r="80"
                stroke="#365f50"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="412 503"
                transform="rotate(-90 90 90)"
              />
            </svg>
            <strong>
              82<span>/ 100</span>
            </strong>
          </div>
          <div>
            <h2 id="score-title">Általános CV-minőség</h2>
            <p>
              A CVRadar saját minőségi mutatója.
              <br />
              Nem univerzális ATS-pontszám,
              <br />
              és nem interjúgarancia.
            </p>
          </div>
        </div>
        <div className="subscores">
          {subscores.map((score) => (
            <div className="subscore" key={score.label}>
              <div>
                <span>{score.label}</span>
                <strong>
                  {score.value}
                  <span>/100</span>
                </strong>
              </div>
              <div
                className="score-track"
                role="meter"
                aria-label={score.label}
                aria-valuenow={score.value}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${score.value}%` }} />
              </div>
              <p>{score.detail}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="job-match" aria-labelledby="match-title">
        <div className="match-icon">
          <Icon name="file" />
        </div>
        <div>
          <h2 id="match-title">Álláshoz illeszkedés</h2>
          <p>
            {hasJob
              ? "Álláshirdetést is megadtál. A demó nem értékeli ki a bemásolt tartalmat, ezért illeszkedési pontszámot nem mutatunk."
              : "Nincs megadott álláshirdetés. Az illeszkedés külön mutató lesz; hirdetés nélkül nem adunk hozzá pontszámot."}
          </p>
        </div>
        <span className="neutral-badge">Még nincs kiértékelés</span>
      </section>
      <section
        className="improvements-section"
        aria-labelledby="improvements-title"
      >
        <div className="report-section-heading">
          <span className="eyebrow">ITT ÉRDEMES KEZDENED</span>
          <h2 id="improvements-title">3 részlet, amin javíthatsz.</h2>
          <p>A javaslatok a fiktív minta-CV konkrét soraira hivatkoznak.</p>
        </div>
        <div className="improvement-list">
          {improvements.map((item, index) => (
            <article className="improvement" key={item.title}>
              <span className="improvement-number">0{index + 1}</span>
              <div>
                <span className="improvement-ref">{item.reference}</span>
                <h3>{item.title}</h3>
                <blockquote>„{item.quote}”</blockquote>
                <p>{item.reason}</p>
                <div className="improvement-action">
                  <Icon name="arrow" />
                  <p>{item.action}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="extracted-section" aria-labelledby="extracted-title">
        <div>
          <span className="eyebrow">A DOKUMENTUM MÖGÖTT</span>
          <h2 id="extracted-title">Mit sikerült kiolvasni?</h2>
          <p>
            Így rendeződhetnek áttekinthető adatokká
            <br className="desktop-break" /> a CV-ben szereplő információk.
          </p>
          <span className="neutral-badge">Fiktív, strukturált mintaadatok</span>
        </div>
        <dl className="extracted-data">
          <div>
            <dt>Név és elérhetőség</dt>
            <dd>
              <strong>{demoCv.name}</strong>
              <span>
                {demoCv.email} · {demoCv.location}
              </span>
            </dd>
          </div>
          <div>
            <dt>Szakmai tapasztalat</dt>
            <dd>
              <strong>{demoCv.role}</strong>
              <span>
                {demoCv.employer} · {demoCv.period}
              </span>
            </dd>
          </div>
          <div>
            <dt>Tanulmányok</dt>
            <dd>
              <strong>{demoCv.education}</strong>
              <span>{demoCv.degree}</span>
            </dd>
          </div>
          <div>
            <dt>Ismeretek</dt>
            <dd>
              <span>{demoCv.skills.join(" · ")}</span>
            </dd>
          </div>
          <div>
            <dt>Nyelvtudás</dt>
            <dd>
              <strong>Angol – kommunikációképes</strong>
              <span className="missing-detail">
                Pontos tudásszint nincs megadva
              </span>
            </dd>
          </div>
        </dl>
      </section>
      <section className="report-comparison" aria-labelledby="rewrite-title">
        <span className="eyebrow">EGY JAVÍTÁS KÖZELEBBRŐL</span>
        <h2 id="rewrite-title">
          Ugyanaz a tapasztalat.
          <br />
          Pontosabb megfogalmazás.
        </h2>
        <Comparison compact />
        <p className="honest-note">
          <Icon name="shield" />A javaslat nem ad hozzá új feladatot,
          felelősséget vagy számszerű eredményt.
        </p>
      </section>
      <div className="report-end">
        <div>
          <h2>A következő lépés a tiéd.</h2>
          <p>
            A demó eredményeit szabadon végignézheted, fájl feltöltése nélkül
            is.
          </p>
        </div>
        <Link href="/ellenorzes" className="button button-dark">
          Vissza a feltöltéshez <Icon name="arrow" />
        </Link>
      </div>
    </>
  );
}
