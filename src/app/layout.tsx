import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/frontend/components/layout/Header";
import { Footer } from "@/frontend/components/layout/Footer";
import { CookieBanner } from "@/frontend/components/layout/CookieBanner";
import { QueryProvider } from "@/frontend/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Guidassur - Comprenez vos contrats d'assurance en 30 secondes",
  description:
    "Analysez vos contrats d'assurance. Obtenez un résumé clair de vos garanties, exclusions et points d'attention.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col antialiased">
        <QueryProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </QueryProvider>
      </body>
    </html>
  );
}
