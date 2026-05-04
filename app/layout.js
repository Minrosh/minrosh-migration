import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import siteDataStatic from "../data/site.json";
import { warnHcaptchaEnvIfMisconfigured } from "../lib/config";
import { assertEnvValidForRuntime } from "../lib/env-validation";
import { getRootLayoutPreparedData } from "../lib/home-site-data";
import { StructuredData } from "../components/structured-data";
import { GlobalClientWidgets } from "../components/global-client-widgets";
import { GoogleAnalytics } from "../components/google-analytics";
import { businessJsonLd } from "../lib/seo";
import { ScrollRestorer } from "../components/scroll-restorer";
import { PWARegister } from "../components/pwa-register";
import { RuntimeChunkRecovery } from "../components/runtime-chunk-recovery";

const { siteData, publicSiteData } = getRootLayoutPreparedData(siteDataStatic);
assertEnvValidForRuntime();
warnHcaptchaEnvIfMisconfigured();

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  preload: true,
  display: "swap",
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
    default:
      "Migration Agent Brisbane | Australia, Canada, UK & New Zealand Visa Guidance | MinRosh Migration",
    template: "%s | MinRosh Migration",
  },
  description:
    "Brisbane-based migration and education consultants helping clients plan pathways to Australia, Canada, the UK and New Zealand — skilled, partner, student and employer-sponsored visas in plain English before you lodge.",
  keywords: [
    "MinRosh Migration",
    "Australian migration guidance",
    "Brisbane migration",
    "Canada UK New Zealand visa guidance",
    "student visa Australia",
    "skilled migration Australia",
  ],
  openGraph: {
    title:
      "Migration Agent Brisbane | Australia, Canada, UK & New Zealand Visa Guidance | MinRosh Migration",
    description:
      "Brisbane-based migration guidance for Australia, Canada, the UK and New Zealand — skilled, partner, student and employer-sponsored pathways explained clearly before you lodge.",
    url: "https://minroshmigration.com.au",
    siteName: "MinRosh Migration",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "/images/hero-sydney-real.v2.webp",
        width: 1800,
        height: 1200,
        alt: "Sydney Harbour with ferries on the water and the Opera House",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Migration Agent Brisbane | Australia, Canada, UK & NZ Visa Guidance | MinRosh Migration",
    description:
      "Brisbane-based consultants helping students, skilled workers and families plan pathways to Australia, Canada, the UK and New Zealand.",
    images: ["/images/hero-sydney-real.v2.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/minrosh-logo.v2.webp",
    shortcut: "/images/minrosh-logo.v2.webp",
    apple: "/images/minrosh-logo.v2.webp",
  },
};

export default async function RootLayout({ children }) {
  const h = await headers();
  const nonce = String(h.get("x-csp-nonce") || "").trim();

  return (
    <html lang="en-AU">
      <body className={`${inter.variable} ${playfair.variable} immersive-theme`}>
        <ScrollRestorer />
        <RuntimeChunkRecovery />
        <PWARegister />
        <GoogleAnalytics nonce={nonce} />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <StructuredData data={businessJsonLd(siteData)} nonce={nonce} />
        {children}
        <GlobalClientWidgets siteData={publicSiteData} />
      </body>
    </html>
  );
}
