import { Icon } from "@/components/ui/icon";
import { SampleDocument } from "./sample-document";

export function DocumentReview() {
  return (
    <div
      className="document-review"
      role="img"
      aria-label="Fiktív CV három megjegyzéssel: pontosabb feladatleírás, hiányzó kezdő hónap és pontosítandó nyelvi szint."
    >
      <div className="review-shadow" />
      <div className="review-sheet sheet-third" />
      <div className="review-sheet sheet-second" />
      <div className="review-document">
        <SampleDocument />
      </div>
      <div className="review-note note-experience">
        <Icon name="plus" />
        <span>Feladatok, világosabban</span>
      </div>
      <div className="review-note note-date">
        <Icon name="plus" />
        <span>A kezdő hónap hiányzik</span>
      </div>
      <div className="review-note note-language">
        <Icon name="plus" />
        <span>Pontosítsd a nyelvi szintet</span>
      </div>
      <span className="review-caption">FIKTÍV CV · SZEMLÉLTETŐ JELÖLÉSEK</span>
    </div>
  );
}
