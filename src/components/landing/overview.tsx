import Link from "next/link";
import { checks } from "@/lib/demo-data";
import { Icon } from "@/components/ui/icon";
import { AnalysisPreview } from "./analysis-preview";
import { Comparison } from "./comparison";
import { DocumentReview } from "./document-review";

export function LandingOverview() {
  return (
    <>
      <section
        className="checks-section section"
        id="mit-vizsgalunk"
        aria-labelledby="checks-title"
      >
        <div className="container inspection-layout">
          <div className="inspection-copy">
            <span className="eyebrow">MIT VIZSGÁLUNK?</span>
            <h2 id="checks-title">
              A jó tapasztalat is
              <br />
              elveszhet a sorok között.
            </h2>
            <p className="inspection-intro">
              Egy CV-ben a részletek is számítanak. Megmutatjuk, mi érthető
              belőle, és hol maradhat kérdés az olvasóban.
            </p>
            <div className="check-list">
              {checks.map((check, index) => (
                <div className="check-row" key={check.title}>
                  <span className="inspection-icon">
                    <Icon
                      name={
                        index === 0
                          ? "file"
                          : index === 1
                            ? "plus"
                            : index === 2
                              ? "check"
                              : "shield"
                      }
                    />
                  </span>
                  <div>
                    <h3>{check.title}</h3>
                    <p>{check.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DocumentReview />
        </div>
      </section>
      <AnalysisPreview />
      <section
        className="comparison-section section"
        aria-labelledby="comparison-title"
      >
        <div className="container rewrite-layout">
          <div className="rewrite-copy">
            <span className="eyebrow">UGYANAZ A TAPASZTALAT. TISZTÁBBAN.</span>
            <h2 id="comparison-title">
              A pontszám mögött konkrét válaszok vannak.
            </h2>
            <p>
              Nem csak azt mutatjuk meg, hol érdemes javítani. Azt is, hogyan
              hangozhat pontosabban.
            </p>
            <p className="honest-note">
              <Icon name="shield" />A javaslat a meglévő tényekre épül. Nem
              talál ki eredményeket vagy számokat.
            </p>
            <Link className="button button-dark" href="/mintaelemzes">
              Megnézem a javaslatokat <Icon name="arrow" />
            </Link>
          </div>
          <Comparison documentStyle />
        </div>
      </section>
      <section
        className="process-section section"
        id="igy-mukodik"
        aria-labelledby="process-title"
      >
        <div className="container">
          <div className="process-intro">
            <span className="eyebrow">ÍGY MŰKÖDIK</span>
            <h2 id="process-title">Egy új nézőpont. Három egyszerű lépés.</h2>
            <p>
              A saját tempódban, az önéletrajzod fontos részleteire figyelve.
            </p>
          </div>
          <ol className="process-steps">
            <li>
              <span className="step-number">
                <Icon name="upload" />
              </span>
              <div>
                <span className="step-eyebrow">01 / FELTÖLTÉS</span>
                <h3>Töltsd fel az önéletrajzodat.</h3>
                <p>
                  Válassz egy PDF- vagy DOCX-fájlt. Ha van álláshirdetésed, azt
                  is bemásolhatod.
                </p>
                <span className="step-detail">
                  PDF / DOCX · legfeljebb 10 MB
                </span>
              </div>
            </li>
            <li>
              <span className="step-number">
                <Icon name="file" />
              </span>
              <div>
                <span className="step-eyebrow">02 / ELEMZÉS</span>
                <h3>Nézd meg az elemzést.</h3>
                <p>
                  Külön szempontok és konkrét CV-részletek segítenek megérteni
                  az összképet.
                </p>
                <span className="step-detail">
                  Ebben a demóban: mintaelemzés
                </span>
              </div>
            </li>
            <li>
              <span className="step-number">
                <Icon name="check" />
              </span>
              <div>
                <span className="step-eyebrow">03 / PONTOSÍTÁS</span>
                <h3>Javítsd a fontos részleteket.</h3>
                <p>
                  Használd a javaslatokat, és fogalmazd meg világosabban a saját
                  tapasztalatodat.
                </p>
                <span className="step-detail">
                  A tények maradnak. A megfogalmazás tisztul.
                </span>
              </div>
            </li>
          </ol>
          <Link className="text-link" href="/ellenorzes">
            Kipróbálom a demót <Icon name="arrow" />
          </Link>
        </div>
      </section>
    </>
  );
}
