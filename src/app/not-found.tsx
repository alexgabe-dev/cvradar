import Link from "next/link";
export default function NotFound() {
  return (
    <main id="tartalom" className="not-found container">
      <span className="eyebrow">404 · EZ AZ OLDAL NEM TALÁLHATÓ</span>
      <h1>Keressünk egy jobb irányt.</h1>
      <p>A keresett oldal nem létezik. A demót a kezdőlapról eléred.</p>
      <Link href="/" className="button button-dark">
        Vissza a kezdőlapra
      </Link>
    </main>
  );
}
