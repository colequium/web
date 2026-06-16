import { Outfit } from "next/font/google";

/**
 * LAB — zona de pruebas de diseño, aislada. No afecta a la app ni a la landing actual.
 * Fuente Outfit (limpia, geométrica, como las referencias). Se aplica solo acá:
 * los componentes del lab NO usan `font-display`/`font-sans`, heredan Outfit del wrapper.
 */
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={outfit.variable}
      style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
