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
            <span className="eyebrow">MIT ELLENŐRZÜNK MAJD?</span>
            <h2 id="checks-title">Mi hiányzik, és min érdemes javítani?</h2>
            <p className="inspection-intro">
              A tervezett ellenőrzés ezeket a szempontokat nézi majd. A demóban
              egy fiktív önéletrajz példáján mutatjuk meg a visszajelzéseket.
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
            <span className="eyebrow">PÉLDA EGY MONDAT JAVÍTÁSÁRA</span>
            <h2 id="comparison-title">Írd le pontosan, mi volt a feladatod.</h2>
            <p>
              A mintában a felületek, a heti bejegyzések és a havi riportok is
              szerepelnek. Egy mondatba rendezve könnyebb követni a feladatokat.
            </p>
            <p className="honest-note">
              <Icon name="shield" />A példában csak a megfogalmazás változik. Új
              feladatot vagy eredményt nem adunk hozzá.
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
            <h2 id="process-title">Hogyan működik?</h2>
            <p>
              A saját fájlodból már ki tudjuk olvasni a szöveget. Értékelés még
              nem készül; azt külön mintaelemzésen mutatjuk be.
            </p>
          </div>
          <ol className="process-steps">
            <li>
              <span className="step-number">
                <Icon name="upload" />
              </span>
              <div>
                <span className="step-eyebrow">01 / FÁJLVÁLASZTÁS</span>
                <h3>Válaszd ki az önéletrajzodat.</h3>
                <p>
                  Válassz egy legfeljebb 10 MB-os PDF- vagy DOCX-fájlt. A
                  szövegkinyerés indításakor a fájl a szerverre kerül.
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
                <span className="step-eyebrow">02 / SZÖVEGKINYERÉS</span>
                <h3>Nézd meg a kiolvasott szöveget.</h3>
                <p>
                  A dokumentumból ténylegesen kiolvasott szöveget mutatjuk. Nem
                  tároljuk tartósan, és nem küldjük AI-szolgáltatónak.
                </p>
                <span className="step-detail">
                  Értékelés és pontszám nélkül
                </span>
              </div>
            </li>
            <li>
              <span className="step-number">
                <Icon name="check" />
              </span>
              <div>
                <span className="step-eyebrow">03 / KÜLÖN MINTAELEMZÉS</span>
                <h3>Nézd végig a javítási példákat.</h3>
                <p>
                  A külön elérhető mintaelemzés egy fiktív CV javítási példáit
                  mutatja. Ezek nem a feltöltött fájlodhoz tartoznak.
                </p>
                <span className="step-detail">
                  Csak olyan adatot írj a CV-dbe, ami igaz rád.
                </span>
              </div>
            </li>
          </ol>
          <Link className="text-link" href="/ellenorzes">
            Kiolvasom a saját CV-m szövegét <Icon name="arrow" />
          </Link>
        </div>
      </section>
    </>
  );
}
