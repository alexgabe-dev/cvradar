import { z } from "zod";

// Extractive fields, not generated paraphrases. Periods retain their exact wording.
const fact = z.strictObject({
  value: z.string().min(1).max(1000),
  source: z.string().min(1).max(1200),
});
const optionalFact = fact.nullable();
export const CvSchema = z.strictObject({
  name: optionalFact,
  email: optionalFact,
  phone: optionalFact,
  summary: optionalFact,
  experience: z
    .array(
      z.strictObject({
        employer: optionalFact,
        role: optionalFact,
        period: optionalFact,
        description: z.array(fact).max(15),
      }),
    )
    .max(20),
  education: z
    .array(
      z.strictObject({
        institution: optionalFact,
        qualification: optionalFact,
        period: optionalFact,
      }),
    )
    .max(15),
  skills: z.array(fact).max(60),
  languages: z
    .array(z.strictObject({ language: fact, level: optionalFact }))
    .max(20),
  otherSections: z
    .array(
      z.strictObject({ title: optionalFact, items: z.array(fact).max(15) }),
    )
    .max(15),
  uncertainties: z.array(fact).max(30),
});
export type CvData = z.infer<typeof CvSchema>;
export type VerifiedFact = z.infer<typeof fact> & {
  sourceFound: boolean;
  valueSupported: boolean;
  needsReview: boolean;
  reviewReason: string | null;
};
type Verified<T> = T extends { value: string; source: string }
  ? VerifiedFact
  : T extends Array<infer V>
    ? Verified<V>[]
    : T extends object
      ? { [K in keyof T]: Verified<T[K]> }
      : T;
export type VerifiedCv = Verified<CvData>;

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/gu, " ").trim();
export function verifyCvSources(data: CvData, input: string): VerifiedCv {
  const normalized = normalizeWhitespace(input);
  function visit(value: unknown, uncertainty = false): unknown {
    if (Array.isArray(value))
      return value.map((item) => visit(item, uncertainty));
    if (!value || typeof value !== "object") return value;
    if (
      "value" in value &&
      "source" in value &&
      typeof value.value === "string" &&
      typeof value.source === "string"
    ) {
      const source = normalizeWhitespace(value.source);
      const content = normalizeWhitespace(value.value);
      const sourceFound = source.length > 0 && normalized.includes(source);
      const valueSupported = content.length > 0 && source.includes(content);
      const needsReview = uncertainty || !sourceFound || !valueSupported;
      return {
        ...value,
        sourceFound,
        valueSupported,
        needsReview,
        reviewReason: !sourceFound
          ? "A forrásrészlet nem található a kiolvasott szövegben."
          : uncertainty
            ? "Az AI ezt a részt bizonytalannak jelölte."
            : !valueSupported
              ? "A megadott érték nem szerepel szó szerint a forrásrészletben."
              : null,
      };
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        visit(child, key === "uncertainties"),
      ]),
    );
  }
  return visit(data) as VerifiedCv;
}
