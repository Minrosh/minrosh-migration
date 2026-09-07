import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import siteDataStatic from "../data/site.json";
import { warnHcaptchaEnvIfMisconfigured } from "../lib/config";
import { assertEnvValidForRuntime } from "../lib/env-validation";
import { getRootLayoutPreparedData } from "../lib/home-site-data";
import { ScrollRestorer } from "../components/scroll-restorer";
import { PWARegister } from "../components/pwa-register";
import { RuntimeChunkRecovery } from "../components/runtime-chunk-recovery";
import { PublicSiteWidgetsGate } from "../components/public-site-widgets-gate";
import { getDeployBuildId } from "../lib/deploy-build-id";
import { buildRouteLoadingBootstrapScript } from "../lib/route-loading-bootstrap-script";
import { rootRobotsMetadata } from "../lib/seo-robots";

const deployBuildId = getDeployBuildId();

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
    default: "MinRosh Migration | General Migration Information & Education Support",
    template: "%s | MinRosh Migration",
  },
  description:
    "Explore general Australian migration information from publicly available sources and receive education-course enquiry support. MinRosh does not provide immigration assistance or legal advice.",
  keywords: [
    "MinRosh Migration",
    "Australian migration information",
    "official visa information",
    "education course support",
    "study in Australia information",
    "Home Affairs visa information",
    "Brisbane migration information",
  ],
  openGraph: {
    title: "MinRosh Migration | General Migration Information & Education Support",
    description:
      "Explore general Australian migration information from publicly available sources and receive education-course enquiry support. MinRosh does not provide immigration assistance or legal advice.",
    url: "https://minroshmigration.com.au",
    siteName: "MinRosh Migration",
    locale: "en_AU",
    type: "website",
    images: [
      {
        url: "/images/hero-brisbane-river-cbd.jpg",
        width: 1800,
        height: 1200,
        alt: "Brisbane River and Brisbane CBD skyline — MinRosh Migration general information and education support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MinRosh Migration | General Migration Information & Education Support",
    description:
      "Independent migration information and education support using publicly available sources. Not immigration assistance or legal advice.",
    images: ["/images/hero-brisbane-river-cbd.jpg"],
  },
  robots: rootRobotsMetadata(),
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

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const nonce = headersList.get("x-csp-nonce") || undefined;

  return (
    <html lang="en-AU" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://minroshmigration.com.au" />
        <meta name="minrosh-build-id" content={deployBuildId} />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- pre-hydration deploy cache bust + loader dismiss */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: buildRouteLoadingBootstrapScript(deployBuildId),
          }}
        />
        <script src="/scripts/theme-light.js" defer nonce={nonce} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} immersive-theme`}>
        <ScrollRestorer />
        <RuntimeChunkRecovery />
        <PWARegister />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
        <PublicSiteWidgetsGate siteData={publicSiteData} />
      </body>
    </html>
  );
}
