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
              ÖNÉLETRAJZ-ELLENŐRZÉS
            </div>
            <h1 id="hero-title">
              Küldés előtt
              <br /> nézesd át <span>a CV-det.</span>
            </h1>
            <p className="hero-description">
              Megnézzük, kiolvashatók-e az adatok az önéletrajzodból, mi
              hiányzik, és hol érdemes pontosabban fogalmaznod. Ha megadod az
              álláshirdetést is, azzal is összevetjük.
            </p>
            <div className="hero-actions">
              <Link href="/mintaelemzes" className="button button-mint">
                Megnézem a mintaelemzést <Icon name="arrow" />
              </Link>
              <Link href="/ellenorzes" className="hero-secondary">
                Kiolvasom a saját CV-m szövegét{" "}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <p className="upload-hint">
              Most szövegkinyerést és egy külön mintaelemzést tudsz kipróbálni.
            </p>
          </Entrance>
          <Entrance className="hero-visual" delay={0.12}>
            <DocumentScanner />
          </Entrance>
        </div>
        <div className="container hero-baseline">
          <span>OLVASHATÓSÁG · HIÁNYZÓ ADATOK · MEGFOGALMAZÁS</span>
          <a href="#reszletek">
            Mit nézünk az önéletrajzban? <span aria-hidden="true">↓</span>
          </a>
          <span className="hero-baseline-end">MAGYAR ÖNÉLETRAJZOKHOZ IS</span>
        </div>
      </section>
      <div id="reszletek">
        <LandingSections />
      </div>
    </main>
  );
}
