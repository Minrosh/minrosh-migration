import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["tesseract.js", "@resvg/resvg-js"],
  // Avoid wrong root when a package-lock.json exists above the app (e.g. in $HOME).
  outputFileTracingRoot: path.join(__dirname),
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.minroshmigration.com.au" }],
        destination: "https://minroshmigration.com.au/:path*",
        permanent: true,
      },
      {
        source: "/migration-from-sri-lanka",
        destination: "/migration-sri-lanka-to-australia",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          /* CSP is set per-request in middleware (nonces + strict-dynamic). See lib/csp/build-csp-header.js */
        ],
      },
    ];
  },
};

export default nextConfig;
