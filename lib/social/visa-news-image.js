import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { countryDisplayName } from "@/lib/social/meta-caption";

const W = 1080;
const H = 1350;

let fontCache = null;

function loadInterFonts() {
  if (fontCache) return fontCache;
  const base = path.join(process.cwd(), "node_modules", "@fontsource", "inter", "files");
  fontCache = {
    w400: fs.readFileSync(path.join(base, "inter-latin-400-normal.woff2")),
    w700: fs.readFileSync(path.join(base, "inter-latin-700-normal.woff2")),
  };
  return fontCache;
}

function compactLine(s, max) {
  const t = String(s || "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function template({ headline, country, summary }) {
  const place = countryDisplayName(country);
  const dateStr = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const head = compactLine(headline, 140);
  const sum = compactLine(summary, 220);

  return {
    type: "div",
    props: {
      style: {
        width: W,
        height: H,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#050A18",
        color: "#ffffff",
        fontFamily: "Inter",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#D4AF37",
              color: "#050A18",
              paddingLeft: 48,
              paddingRight: 48,
              paddingTop: 28,
              paddingBottom: 28,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 34,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  },
                  children: "Visa alert",
                },
              },
              {
                type: "div",
                props: {
                  style: { fontSize: 28, fontWeight: 700 },
                  children: dateStr,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: 56,
              paddingRight: 56,
              paddingTop: 48,
              paddingBottom: 48,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 36,
                    fontWeight: 700,
                    color: "#D4AF37",
                    textTransform: "uppercase",
                    letterSpacing: 3,
                    marginBottom: 28,
                  },
                  children: place,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 68,
                    fontWeight: 700,
                    lineHeight: 1.08,
                    letterSpacing: -1,
                    marginBottom: 32,
                  },
                  children: head,
                },
              },
              sum
                ? {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 30,
                        color: "#94a3b8",
                        lineHeight: 1.35,
                        maxWidth: 920,
                      },
                      children: sum,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingLeft: 48,
              paddingRight: 48,
              paddingTop: 36,
              paddingBottom: 36,
              backgroundColor: "rgba(255,255,255,0.04)",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 20,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: 3,
                          marginBottom: 6,
                        },
                        children: "Official portal",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 28, fontWeight: 700, fontStyle: "italic" },
                        children: "minroshmigration.com.au",
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    backgroundColor: "#D4AF37",
                    color: "#050A18",
                    paddingLeft: 22,
                    paddingRight: 22,
                    paddingTop: 14,
                    paddingBottom: 14,
                    borderRadius: 999,
                    fontSize: 22,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  },
                  children: "Read more",
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/**
 * @param {{ headline: string, country?: string, summary?: string }} input
 * @returns {Promise<Buffer>}
 */
export async function generateVisaNewsPng(input) {
  const fonts = loadInterFonts();
  const svg = await satori(template(input), {
    width: W,
    height: H,
    fonts: [
      { name: "Inter", data: fonts.w400, weight: 400, style: "normal" },
      { name: "Inter", data: fonts.w700, weight: 700, style: "normal" },
    ],
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
  });
  return Buffer.from(resvg.render().asPng());
}
