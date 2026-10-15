import { Brand } from "./header";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Brand />
          <p>Egy tisztább kép az önéletrajzodról.</p>
        </div>
        <Link href="/ellenorzes">
          Próbáld ki a demót <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CVRadar</span>
        <span>Korai prototípus · Valódi kérdések, mintaadatok.</span>
        <Link href="/#gyik">Adatkezelés a demóban</Link>
      </div>
    </footer>
  );
}
