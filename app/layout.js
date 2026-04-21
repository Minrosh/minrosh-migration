import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import siteDataStatic from "../data/site.json";
import { getHomeSiteData } from "../lib/home-site-data";
import { StructuredData } from "../components/structured-data";
import { AIConciergeLazy } from "../components/ai-concierge-lazy";
import { GoogleAnalytics } from "../components/google-analytics";
import { businessJsonLd } from "../lib/seo";
import { ScrollRestorer } from "../components/scroll-restorer";
import { PWARegister } from "../components/pwa-register";

const siteData = getHomeSiteData(siteDataStatic);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const viewport = {
  themeColor: "#fbf8f4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  metadataBase: new URL("https://minroshmigration.com.au"),
  title: {
    default: "MinRosh Migration",
    template: "%s | MinRosh Migration",
  },
  description:
    "Migration Agent in Australia for skilled migration, partner visas, student visas, and employer-sponsored pathways.",
  keywords: [
    "MinRosh Migration",
    "Australian migration guidance",
    "Brisbane migration",
  ],
  openGraph: {
    title: "MinRosh Migration",
    description:
      "Migration Agent in Australia for skilled migration, student visas, partner visas, and employer-sponsored pathways.",
    url: "https://minroshmigration.com.au",
    siteName: "MinRosh Migration",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "/images/brisbane-riverwalk.png",
        width: 1800,
        height: 1200,
        alt: "Brisbane riverwalk with skyline and bridge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Migration Agent Brisbane | MinRosh Migration",
    description:
      "Expert visa help in Brisbane for skilled migration, partner visas, student visas, and employer-sponsored pathways.",
    images: ["/images/brisbane-riverwalk.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/minrosh-logo.png",
    shortcut: "/images/minrosh-logo.png",
    apple: "/images/minrosh-logo.png",
  },
};

export default async function RootLayout({ children }) {
  const h = await headers();
  const nonce = String(h.get("x-csp-nonce") || "").trim();

  return (
    <html lang="en-AU">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <ScrollRestorer />
        <PWARegister />
        <GoogleAnalytics nonce={nonce} />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <StructuredData data={businessJsonLd(siteData)} nonce={nonce} />
        {children}
        <AIConciergeLazy siteData={siteData} />
      </body>
    </html>
  );
}
