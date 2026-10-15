import type { Metadata } from "next";
import { UploadForm } from "@/components/upload/upload-form";
import { Entrance } from "@/components/ui/motion";
import Link from "next/link";

export const metadata: Metadata = { title: "Önéletrajz szövegének kiolvasása" };

export default function UploadPage() {
  return (
    <main id="tartalom" className="upload-page">
      <div className="container">
        <Link className="back-link" href="/">
          ← Vissza a kezdőlapra
        </Link>
        <Entrance className="upload-heading">
          <span className="eyebrow">PDF- ÉS DOCX-SZÖVEGKINYERÉS</span>
          <h1>Nézd meg, mi olvasható ki a CV-dből.</h1>
          <p>
            Válassz egy PDF- vagy DOCX-fájlt. Kiolvassuk és megmutatjuk a
            szövegét. Ezután külön lépésben kérheted az adatok AI-felismerését.
            Értékelés és pontozás még nincs.
          </p>
        </Entrance>
        <UploadForm />
      </div>
    </main>
  );
}
