import Link from "next/link";
import { DocumentScanner } from "@/components/landing/document-scanner";
import { LandingSections } from "@/components/landing/sections";
import { Entrance } from "@/components/ui/motion";
import { Icon } from "@/components/ui/icon";
import "./landing.css";

export default function Home() {
  return (
    <main id="tartalom" className="landing-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-layout">
          <Entrance className="hero-copy">
            <div className="hero-eyebrow">
              <span className="status-dot" />
              EGY TISZTÁBB KÉP A CV-DRŐL
            </div>
            <h1 id="hero-title">
              Ne csak elküldd.
              <br />
              Tudd, mit látnak
              <br />
              <span>belőle.</span>
            </h1>
            <p className="hero-description">
              Nézd meg, mi olvasható ki az önéletrajzodból, mi hiányzik belőle,
              és min érdemes javítani.
            </p>
            <div className="hero-actions">
              <Link href="/ellenorzes" className="button button-mint">
                Önéletrajz feltöltése <Icon name="arrow" />
              </Link>
              <Link href="/mintaelemzes" className="hero-secondary">
                Megnézem egy példán <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <p className="upload-hint">
              PDF vagy DOCX <span>·</span> Ingyenes alapellenőrzés
            </p>
          </Entrance>
          <Entrance className="hero-visual" delay={0.12}>
            <DocumentScanner />
          </Entrance>
        </div>
        <div className="container hero-baseline">
          <span>KEVESEBB TALÁLGATÁS. TÖBB KONKRÉTUM.</span>
          <a href="#reszletek">
            Nézz a sorok mögé <span aria-hidden="true">↓</span>
          </a>
          <span className="hero-baseline-end">MAGYAR CV-KRE IS TERVEZVE</span>
        </div>
      </section>
      <div id="reszletek">
        <LandingSections />
      </div>
    </main>
  );
}
