import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import I18nProvider from "@/providers/I18nProvider";

export const metadata: Metadata = {
  title: {
    default: "MaRnime - Discover & Track Anime",
    template: "%s | MaRnime",
  },
  description: "Discover trending anime, track your watchlist, and explore seasonal anime with MaRnime. Powered by AniList.",
  keywords: ["anime", "manga", "watchlist", "anilist", "streaming", "tracker", "seasonal anime"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "MaRnime - Discover & Track Anime",
    description: "Discover trending anime, track your watchlist, and explore seasonal anime with MaRnime.",
    type: "website",
    siteName: "MaRnime",
  },
  twitter: {
    card: "summary_large_image",
    title: "MaRnime - Discover & Track Anime",
    description: "Discover trending anime, track your watchlist, and explore seasonal anime.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <I18nProvider>
          <AuthProvider>
            <QueryProvider>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
            </QueryProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
