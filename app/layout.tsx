import type { Metadata } from "next";
import { Outfit, Caveat } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

// ID de Google Analytics (configurable por env; default al de Colequium).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-HR68KHV4PH";

// Fuente global: Outfit (limpia, geométrica). Una sola familia para títulos y texto.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Fuente manuscrita para palabras destacadas (en el espíritu del logo).
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Colequium — La comunidad escolar, conectada",
  description:
    "Plataforma de comunicación entre el colegio, las familias y los docentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} ${caveat.variable} h-full`}>
      <body className="min-h-full">{children}</body>
      {process.env.NODE_ENV === "production" ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
