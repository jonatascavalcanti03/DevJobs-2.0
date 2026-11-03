import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SkipLink } from "@/components/landing/SkipLink";

export const metadata: Metadata = {
  title: "TechLink — Plataforma Inteligente de Recrutamento Tech",
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

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('techlink-theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      document.documentElement.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
    }
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
