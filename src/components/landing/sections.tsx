import Link from "next/link";
import { faqs } from "@/lib/demo-data";
import { Icon } from "@/components/ui/icon";
import { LandingOverview } from "./overview";

export function LandingSections() {
  return (
    <>
      <LandingOverview />
      <section
        className="pricing-section section"
        id="arak"
        aria-labelledby="pricing-title"
      >
        <div className="container">
          <div className="pricing-intro">
            <span className="eyebrow">EGYSZERŰ, ÁTLÁTHATÓ</span>
            <h2 id="pricing-title">Kezdd egy tisztább képpel.</h2>
            <p>
              Az alapellenőrzés ingyenes lesz. A részletes javítást akkor
              választhatod, ha többre van szükséged.
            </p>
          </div>
          <div className="pricing-options">
            <div className="price-option free-option">
              <span className="price-index">01 / AZ ELSŐ LÉPÉS</span>
              <h3>Alapellenőrzés</h3>
              <div className="price">
                Ingyenes<span>Most mintaelemzéssel kipróbálható</span>
              </div>
              <ul>
                <li>
                  <Icon name="check" />
                  Általános minőségi kép és részpontszámok
                </li>
                <li>
                  <Icon name="check" />3 fontos javítási javaslat
                </li>
                <li>
                  <Icon name="check" />
                  Átlátható, konkrét visszajelzés
                </li>
              </ul>
              <Link href="/ellenorzes" className="button button-dark">
                Megnézem a demót <Icon name="arrow" />
              </Link>
            </div>
            <div className="price-option paid-option">
              <span className="price-index">02 / A KÖVETKEZŐ LÉPÉS</span>
              <span className="soon-badge">TERVEZETT</span>
              <h3>CV-javítás</h3>
              <div className="price">
                1 990 <span className="currency">Ft</span>
                <span>Tervezett egyszeri induló ár</span>
              </div>
              <ul>
                <li>
                  <Icon name="plus" />
                  Részletes elemzés
                </li>
                <li>
                  <Icon name="plus" />
                  Vezetett átírás, a saját tényeidre építve
                </li>
                <li>
                  <Icon name="plus" />
                  Később PDF / DOCX export
                </li>
              </ul>
              <div className="coming-notice">
                Fejlesztés alatt · Még nem vásárolható meg
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        className="faq-section section"
        id="gyik"
        aria-labelledby="faq-title"
      >
        <div className="container faq-layout">
          <div>
            <span className="eyebrow">JÓ, HA TUDOD</span>
            <h2 id="faq-title">
              Néhány kérdés,
              <br />
              őszinte válaszok.
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <Icon name="plus" />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="closing-section">
        <div className="container">
          <span className="eyebrow">A KÖVETKEZŐ JELENTKEZÉSED ELŐTT</span>
          <h2>Nézd meg, mit mesél rólad a CV-d.</h2>
          <Link href="/ellenorzes" className="button button-mint">
            Önéletrajz feltöltése <Icon name="arrow" />
          </Link>
          <p>Kipróbálható demó. A fájlod a böngésződben marad.</p>
        </div>
      </section>
    </>
  );
}
