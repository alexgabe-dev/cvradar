import { Brand } from "./header";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Brand />
          <p>Nézd meg, mit érdemes javítani az önéletrajzodon.</p>
        </div>
        <Link href="/mintaelemzes">
          Megnézem a mintaelemzést <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CVRadar</span>
        <span>Szövegkinyerés · Külön, fiktív mintaértékelés.</span>
        <Link href="/#gyik">Mi történik a fájloddal?</Link>
      </div>
    </footer>
  );
}
