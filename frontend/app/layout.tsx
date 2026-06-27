import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "FinFlow AI — Capital Routing Engine",
  description: "O'zbekiston kichik bizneslar uchun AI moliyaviy audit va kapital yo'naltirish tizimi",
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('ff_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className="h-full" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700,800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full" style={{ background: "var(--ff-bg)", color: "var(--ff-text)" }}>
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
