import type { Metadata } from "next";
import { UploadForm } from "@/components/upload/upload-form";
import { Entrance } from "@/components/ui/motion";
import Link from "next/link";

export const metadata: Metadata = { title: "Önéletrajz ellenőrzése" };

export default function UploadPage() {
  return (
    <main id="tartalom" className="upload-page">
      <div className="container">
        <Link className="back-link" href="/">
          ← Vissza a kezdőlapra
        </Link>
        <Entrance className="upload-heading">
          <span className="eyebrow">AZ ELSŐ LÉPÉS</span>
          <h1>Nézz a sorok mögé.</h1>
          <p>
            Válaszd ki az önéletrajzodat, és ismerd meg,
            <br className="desktop-break" /> hogyan épül fel egy
            CVRadar-elemzés.
          </p>
        </Entrance>
        <UploadForm />
      </div>
    </main>
  );
}
