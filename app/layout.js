import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import siteData from "../data/site.json";
import { StructuredData } from "../components/structured-data";
import { AIConcierge } from "../components/ai-concierge";
import { businessJsonLd } from "../lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata = {
  metadataBase: new URL("https://minroshmigration.com.au"),
  title: "MinRosh Migration",
  description:
    "Brisbane-based migration guidance for skilled migration, partner visas, student visas, and employer-sponsored pathways.",
  keywords: [
    "MinRosh Migration",
    "Australian migration guidance",
    "Brisbane migration",
  ],
  openGraph: {
    title: "MinRosh Migration",
    description:
      "Brisbane-based migration guidance for skilled migration, student visas, partner visas, and employer-sponsored pathways.",
    url: "https://minroshmigration.com.au",
    siteName: "MinRosh Migration",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "/images/hero-sydney-real.jpg",
        width: 1800,
        height: 1200,
        alt: "Sydney Harbour with ferries on the water and the Opera House",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Migration Agent Brisbane | MinRosh Migration",
    description:
      "Expert visa help in Brisbane for skilled migration, partner visas, student visas, and employer-sponsored pathways.",
    images: ["/images/hero-sydney-real.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/minrosh-logo.svg",
    shortcut: "/images/minrosh-logo.svg",
    apple: "/images/minrosh-logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <StructuredData data={businessJsonLd(siteData)} />
        {children}
        <AIConcierge siteData={siteData} />
      </body>
    </html>
  );
}
