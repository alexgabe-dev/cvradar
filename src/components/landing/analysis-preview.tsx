import Link from "next/link";
import { subscores } from "@/lib/demo-data";
import { Icon } from "@/components/ui/icon";

export function AnalysisPreview() {
  return (
    <section
      className="analysis-preview section"
      aria-labelledby="analysis-preview-title"
    >
      <div className="container analysis-preview-layout">
        <div
          className="analysis-dial"
          role="img"
          aria-label="Minta CV-minőségi pontszám: 82 a 100-ból."
        >
          <div className="dial-halo" />
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <circle
              cx="150"
              cy="150"
              r="125"
              fill="none"
              stroke="#1c3235"
              strokeWidth="5"
            />
            <circle
              className="dial-arc"
              cx="150"
              cy="150"
              r="125"
              fill="none"
              stroke="#a6e0cb"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="644 786"
              transform="rotate(-90 150 150)"
            />
          </svg>
          <div className="dial-value">
            <strong>82</strong>
            <span>/100</span>
          </div>
          <span className="dial-caption">Van mire építened.</span>
          <span className="dial-sample">MINTAELEMZÉS</span>
        </div>
        <div className="analysis-preview-copy">
          <span className="eyebrow">A SZÁMOK MÖGÖTT IS LÁTUNK</span>
          <h2 id="analysis-preview-title">
            Részletesebb kép.
            <br />
            Érthetőbb következő lépés.
          </h2>
          <p>
            Külön nézzük a dokumentum olvashatóságát, szerkezetét és a
            tapasztalatok megfogalmazását. Így azt is látod, hol érdemes
            kezdened.
          </p>
          <div className="preview-subscores">
            {subscores.map((score, index) => (
              <div key={score.label}>
                <span className="preview-score-icon">
                  <Icon
                    name={
                      index === 0 ? "file" : index === 1 ? "shield" : "check"
                    }
                  />
                </span>
                <h3>{score.label}</h3>
                <span className="preview-score-value">
                  {score.value}
                  <span>/100</span>
                </span>
              </div>
            ))}
          </div>
          <Link className="text-link" href="/mintaelemzes">
            Megnézem a teljes mintaelemzést <Icon name="arrow" />
          </Link>
          <p className="score-disclaimer">
            Illusztratív, saját CV-minőségi mutató. Nem univerzális ATS-pontszám
            és nem interjúgarancia.
          </p>
        </div>
      </div>
    </section>
  );
}
