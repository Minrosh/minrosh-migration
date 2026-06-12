import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import siteDataStatic from "../data/site.json";
import { warnHcaptchaEnvIfMisconfigured } from "../lib/config";
import { assertEnvValidForRuntime } from "../lib/env-validation";
import { getRootLayoutPreparedData } from "../lib/home-site-data";
import { ScrollRestorer } from "../components/scroll-restorer";
import { PWARegister } from "../components/pwa-register";
import { RuntimeChunkRecovery } from "../components/runtime-chunk-recovery";
import { GlobalClientWidgetsLazy } from "../components/global-client-widgets-lazy";
import { FooterDockGuard } from "../components/footer-dock-guard";
import { RouteLoadingDismiss } from "../components/route-loading-dismiss";

const { publicSiteData } = getRootLayoutPreparedData(siteDataStatic);
assertEnvValidForRuntime();
warnHcaptchaEnvIfMisconfigured();

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  preload: false,
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
    "migration consultant Brisbane",
    "Brisbane CBD migration pathways",
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
        url: "/images/hero-brisbane-river-cbd.jpg",
        width: 1800,
        height: 1200,
        alt:
          "Brisbane River and Brisbane CBD skyline at dusk — MinRosh Migration is Brisbane-based pathways guidance for Australia, Canada, UK and NZ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Migration Agent Brisbane | Australia, Canada, UK & NZ Visa Guidance | MinRosh Migration",
    description:
      "Brisbane-based consultants helping students, skilled workers and families plan pathways to Australia, Canada, the UK and New Zealand.",
    images: ["/images/hero-brisbane-river-cbd.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  icons: {
    icon: "/images/minrosh-logo.v2.webp",
    shortcut: "/images/minrosh-logo.v2.webp",
    apple: "/images/minrosh-logo.v2.webp",
  },
  appleWebApp: {
    capable: true,
    title: "MinRosh",
    statusBarStyle: "black-translucent",
  },
};

export const revalidate = 3600;

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://minroshmigration.com.au" />
        <script src="/scripts/theme-light.js" defer />
      </head>
      <body className={`${inter.variable} ${playfair.variable} immersive-theme`}>
        <ScrollRestorer />
        <RouteLoadingDismiss />
        <RuntimeChunkRecovery />
        <PWARegister />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
        <FooterDockGuard />
        <GlobalClientWidgetsLazy siteData={publicSiteData} />
      </body>
    </html>
  );
}
