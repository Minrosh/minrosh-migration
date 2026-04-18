export default function manifest() {
  return {
    name: "MinRosh Migration",
    short_name: "MinRosh",
    description: "Migration guidance and visa pathway support for Australia and beyond.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f4",
    theme_color: "#3d2432",
    orientation: "portrait",
    icons: [
      {
        src: "/images/minrosh-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/minrosh-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
