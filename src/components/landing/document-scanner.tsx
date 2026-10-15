import { Icon } from "@/components/ui/icon";
import { SampleDocument } from "./sample-document";
import { ScannerTerrain } from "./scanner-terrain";

export function DocumentScanner() {
  return (
    <div
      className="scanner"
      role="img"
      aria-label="Mintaelemzés: Kovács Anna fiktív önéletrajza, 82 a 100-ból, 3 javítási javaslat."
    >
      <div className="scanner-atmosphere" aria-hidden="true" />
      <ScannerTerrain />
      <div className="scanner-top">
        <span className="status-dot" />
        MINTAELEMZÉS<span className="scanner-code">CV / 001</span>
      </div>
      <div className="paper-stack">
        <div className="paper-layer layer-back" />
        <div className="paper-layer layer-middle" />
        <SampleDocument scan />
      </div>
      <div className="scanner-beam" aria-hidden="true">
        <span />
      </div>
      <div className="recognition-label">
        <span className="small-check">
          <Icon name="check" />
        </span>
        <div>
          <strong>Tapasztalatok felismerve</strong>
          <span>Követhető szakmai út</span>
        </div>
      </div>
      <div className="scanner-format">
        <Icon name="file" />
        <div>
          <strong>Olvasható dokumentum</strong>
          <span>Struktúra felismerve</span>
        </div>
      </div>
      <div className="scanner-result">
        <div className="mini-score">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#3b454b"
              strokeWidth="3"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#a6e0cb"
              strokeWidth="3"
              strokeDasharray="144 176"
              transform="rotate(-90 32 32)"
            />
          </svg>
          <strong>
            82<span>/100</span>
          </strong>
        </div>
        <div>
          <span className="result-eyebrow">MINTAEREDMÉNY</span>
          <strong>Van mire építened.</strong>
          <span className="result-suggestions">
            <span />3 javítási javaslat <Icon name="arrow" />
          </span>
        </div>
      </div>
      <div className="scanner-caption">
        <span className="crosshair">+</span> A RÉSZLETEKBŐL ÁLL ÖSSZE A KÉP.
      </div>
    </div>
  );
}
