import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import siteDataStatic from "../data/site.json";
import { getHomeSiteData } from "../lib/home-site-data";
import { StructuredData } from "../components/structured-data";
import { GlobalClientWidgets } from "../components/global-client-widgets";
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
  preload: false,
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
    default: "Migration Agent Brisbane | Skilled, Partner & Student Visa Help | MinRosh Migration",
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
    icon: "/images/minrosh-logo.png",
    shortcut: "/images/minrosh-logo.png",
    apple: "/images/minrosh-logo.png",
  },
};

export default async function RootLayout({ children }) {
  const h = await headers();
  const nonce = String(h.get("x-csp-nonce") || "").trim();
  const publicSiteData = {
    ...siteData,
    brand: {
      ...siteData.brand,
      email: "",
    },
  };

  return (
    <html lang="en-AU">
      <body className={`${inter.variable} ${playfair.variable} immersive-theme`}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var raw=localStorage.getItem('minrosh_accessibility_preferences_v1');if(!raw)return;var p=JSON.parse(raw)||{};var d=document.documentElement;d.setAttribute('data-font-scale',p.fontScale||'medium');d.setAttribute('data-contrast',p.contrast||'normal');d.setAttribute('data-theme',p.theme||'light');}catch(_e){}})();",
          }}
        />
        <ScrollRestorer />
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
