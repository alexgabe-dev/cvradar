import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/newsreader";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MotionProvider } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: {
    default: "CVRadar — Tudd, mit látnak a CV-dből.",
    template: "%s | CVRadar",
  },
  description:
    "Egy tisztább kép az önéletrajzodról. Olvashatóság, szerkezet és pontosabb megfogalmazás — próbáld ki a CVRadar mintaelemzését.",
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
