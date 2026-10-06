import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SkipLink } from "@/components/landing/SkipLink";

export const metadata: Metadata = {
  title: "DevJobs 2.0 — Plataforma Inteligente de Recrutamento Tech",
  description:
    "Conectando talentos da tecnologia às oportunidades certas. Matching orientado por competências reais, processos seletivos transparentes e foco exclusivo no ecossistema tech.",
  keywords: [
    "vagas tecnologia",
    "emprego desenvolvedor",
    "recrutamento tech",
    "matching de competências",
    "carreira de programação",
  ],
};

export const viewport: Viewport = {
  themeColor: "#07122E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
