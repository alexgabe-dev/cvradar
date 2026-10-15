import type { Metadata } from "next";
import Link from "next/link";
import { ResultReport } from "@/components/results/result-report";

export const metadata: Metadata = { title: "Mintaelemzés — 82/100" };

export default async function SamplePage({
  searchParams,
}: {
  searchParams: Promise<{ hirdetes?: string }>;
}) {
  const params = await searchParams;
  return (
    <main id="tartalom" className="report-page">
      <div className="container">
        <Link className="back-link" href="/ellenorzes">
          ← Saját CV szövegének kiolvasása
        </Link>
        <ResultReport hasJob={params.hirdetes === "megadva"} />
      </div>
    </main>
  );
}
