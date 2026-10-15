import { demoCv } from "@/lib/demo-data";
import { Icon } from "@/components/ui/icon";

export function Comparison({
  compact = false,
  documentStyle = false,
}: {
  compact?: boolean;
  documentStyle?: boolean;
}) {
  return (
    <div
      className={`comparison ${compact ? "comparison-compact" : ""} ${documentStyle ? "comparison-documents" : ""}`}
    >
      <div className="comparison-original">
        <div className="comparison-label">
          <span className="label-dash" />
          EREDETI MEGFOGALMAZÁS
        </div>
        {documentStyle && (
          <div className="comparison-document-heading" aria-hidden="true">
            <strong>{demoCv.name}</strong>
            <span>{demoCv.role}</span>
            <i />
            <i />
          </div>
        )}
        <p>{demoCv.original}</p>
        <span className="comparison-source">
          Szakmai tapasztalat · Minta Stúdió
        </span>
      </div>
      <div className="comparison-divider">
        <Icon name="arrow" />
      </div>
      <div className="comparison-suggested">
        <div className="comparison-label">
          <Icon name="check" />
          JAVASOLT MEGFOGALMAZÁS
        </div>
        {documentStyle && (
          <div className="comparison-document-heading" aria-hidden="true">
            <strong>{demoCv.name}</strong>
            <span>{demoCv.role}</span>
            <i />
            <i />
          </div>
        )}
        <p>
          {demoCv.suggestedParts.map((part) =>
            part.highlighted ? (
              <mark key={part.text}>{part.text}</mark>
            ) : (
              part.text
            ),
          )}
        </p>
        <span className="comparison-source">
          A mintában szereplő feladatok, egy mondatba rendezve.
        </span>
      </div>
    </div>
  );
}
