import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/newsreader";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MotionProvider } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: {
    default: "CVRadar — Önéletrajz-ellenőrzés, konkrét javaslatokkal",
    template: "%s | CVRadar",
  },
  description:
    "Nézd meg a CVRadar mintaelemzését: olvashatóság, hiányzó adatok és javítási példák egy fiktív önéletrajzon.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu">
      <body>
        <MotionProvider>
          <a href="#tartalom" className="skip-link">
            Ugrás a tartalomra
          </a>
          <Header />
          {children}
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
