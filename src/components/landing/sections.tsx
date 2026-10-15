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
            <span className="eyebrow">TERVEZETT CSOMAGOK</span>
            <h2 id="pricing-title">Az alapellenőrzés ingyenes lesz.</h2>
            <p>
              Most a mintaelemzést nézheted meg ingyen. A saját CV-d ellenőrzése
              és a fizetős csomag még nem érhető el.
            </p>
          </div>
          <div className="pricing-options">
            <div className="price-option free-option">
              <span className="price-index">01 / ALAPELLENŐRZÉS</span>
              <h3>Alapellenőrzés</h3>
              <div className="price">
                Ingyenes<span>Most mintaelemzéssel kipróbálható</span>
              </div>
              <ul>
                <li>
                  <Icon name="check" />
                  Olvashatóság, hiányzó adatok és megfogalmazás
                </li>
                <li>
                  <Icon name="check" />3 fontos javítási javaslat
                </li>
                <li>
                  <Icon name="check" />
                  Példák arra, hogyan javítsd a hibákat
                </li>
              </ul>
              <Link href="/mintaelemzes" className="button button-dark">
                Megnézem a mintaelemzést <Icon name="arrow" />
              </Link>
            </div>
            <div className="price-option paid-option">
              <span className="price-index">02 / RÉSZLETES JAVÍTÁS</span>
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
                  Segítség a mondatok átírásához, új tények nélkül
                </li>
                <li>
                  <Icon name="plus" />
                  Tervezett PDF- és DOCX-letöltés
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
            <span className="eyebrow">
              A DEMÓRÓL ÉS A TERVEZETT SZOLGÁLTATÁSRÓL
            </span>
            <h2 id="faq-title">Gyakori kérdések</h2>
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
          <span className="eyebrow">NÉZD MEG EGY PÉLDÁN</span>
          <h2>Milyen visszajelzést kapsz majd?</h2>
          <Link href="/mintaelemzes" className="button button-mint">
            Megnézem a mintaelemzést <Icon name="arrow" />
          </Link>
          <p>A mintaelemzéshez nem kell fájlt kiválasztanod.</p>
        </div>
      </section>
    </>
  );
}
