import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/frontend/components/layout/Header";
import { Footer } from "@/frontend/components/layout/Footer";
import { CookieBanner } from "@/frontend/components/layout/CookieBanner";
import { QueryProvider } from "@/frontend/providers/QueryProvider";
import { AuthSyncProvider } from "@/frontend/providers/AuthSyncProvider";

export const metadata: Metadata = {
  title: "GuidAssur - Comprenez vos contrats d'assurance en 30 secondes",
  description:
    "Analysez vos contrats d'assurance. Obtenez un résumé clair de vos garanties, exclusions et points d'attention.",
  icons: {
    icon: "/assets/favicon.png",
  },
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
          <AuthSyncProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieBanner />
          </AuthSyncProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
