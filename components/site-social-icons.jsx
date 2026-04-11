import { listPublicSocialIcons } from "../lib/social-public";

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M13.5 22v-8h2.7l.4-3h-3.1V9c0-.9.3-1.5 1.6-1.5H17V4.4c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8V11H7v3h2.5v8h4z"
      />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2A3.4 3.4 0 0 0 4 7.4v9.1A3.4 3.4 0 0 0 7.4 20h9.1a3.4 3.4 0 0 0 3.4-3.4V7.4A3.4 3.4 0 0 0 16.6 4H7.6zm4.6 3.8A4.2 4.2 0 1 1 8 12a4.2 4.2 0 0 1 4-4.2zm0 1.7a2.5 2.5 0 1 0 2.5 2.5 2.5 2.5 0 0 0-2.5-2.5zm4.9-3.3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"
      />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1 31.5 31.5 0 0 0 .5-5.8 31.5 31.5 0 0 0-.5-5.8zM9.5 15.5v-7l6 3.5-6 3.5z"
      />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M18.22 3h3.22l-7.04 8.04L22 21h-6.45l-5.05-6.6L5.5 21H2.26l7.53-8.6L2 3h6.6l4.57 6.05L18.22 3zm-1.13 16.2h1.78L7.04 4.73H5.1l11.99 14.47z"
      />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.18V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64v-3.5a6.33 6.33 0 0 0-1-.1A6.34 6.34 0 0 0 5 16.33a6.34 6.34 0 0 0 10.14 5.1v-7a8.16 8.16 0 0 0 4.45 1.33V11.4a4.77 4.77 0 0 1-3-.83v-3.9z"
      />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

function SocialGlyph({ id }) {
  switch (id) {
    case "facebook":
      return <IconFacebook />;
    case "instagram":
      return <IconInstagram />;
    case "linkedin":
      return <IconLinkedIn />;
    case "youtube":
      return <IconYouTube />;
    case "x":
      return <IconX />;
    case "tiktok":
      return <IconTikTok />;
    case "whatsapp":
    case "whatsapp-secondary":
      return <IconWhatsApp />;
    default:
      return null;
  }
}

/**
 * @param {{ brand: object, variant?: "footer" | "topbar" | "contact", includeWhatsApp?: boolean, className?: string }} props
 */
export function SiteSocialIcons({ brand, variant = "footer", includeWhatsApp = true, className = "" }) {
  const items = listPublicSocialIcons(brand, { includeWhatsApp });
  if (!items.length) return null;

  const rootClass = ["site-social-icons", `site-social-icons--${variant}`, className].filter(Boolean).join(" ");

  return (
    <nav className={rootClass} aria-label="Social media and messaging">
      {items.map((item) => (
        <a
          key={item.id}
          className="site-social-icons__link"
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
        >
          <SocialGlyph id={item.id} />
        </a>
      ))}
    </nav>
  );
}
