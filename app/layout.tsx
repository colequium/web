import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Fuente global: Outfit (limpia, geométrica). Una sola familia para títulos y texto.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="es" className={`${outfit.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
