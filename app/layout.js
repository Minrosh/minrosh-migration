import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
});

export const metadata = {
  metadataBase: new URL("https://minroshmigration.com.au"),
  title: "MinRosh Migration | Premium Australian Migration Guidance",
  description:
    "MinRosh Migration helps skilled workers, families, and students understand Australian migration pathways with calm, structured guidance.",
  keywords: [
    "MinRosh Migration",
    "Australian migration",
    "Skilled migration",
    "Subclass 189",
    "Subclass 190",
    "Visa eligibility quiz",
  ],
  openGraph: {
    title: "MinRosh Migration | Premium Australian Migration Guidance",
    description:
      "Preliminary visa guidance, points estimation, pathway planning, and clear next steps for Australian migration.",
    url: "https://minroshmigration.com.au",
    siteName: "MinRosh Migration",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MinRosh Migration",
    description:
      "Calm, structured guidance for skilled, student, employer-sponsored, and family migration pathways.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>{children}</body>
    </html>
  );
}
