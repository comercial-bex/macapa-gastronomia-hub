import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  /** Optional JSON-LD structured-data object(s). Replaces any previous SEO-managed script. */
  jsonLd?: Record<string, any> | Record<string, any>[];
  /** When true, adds <meta name="robots" content="noindex,nofollow"> for this route. */
  noindex?: boolean;
  /** When true (default), emits hreflang alternates for pt-BR / en / es / x-default based on canonical. */
  hreflang?: boolean;
}

/**
 * Lightweight SEO helper. Updates document.title and the relevant meta /
 * OpenGraph / Twitter / canonical tags on mount and whenever props change.
 */
const DEFAULT_OG_IMAGE = "https://restaurantemacapaba.com.br/og-image.jpg";
const SITE_ORIGIN = "https://restaurantemacapaba.com.br";

const SEO = ({ title, description, canonical, image, jsonLd, noindex, hreflang = true }: SEOProps) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (
      attr: "name" | "property",
      key: string,
      content: string,
    ) => {
      let el = document.head.querySelector<HTMLMetaElement>(
        `meta[${attr}="${key}"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image ?? DEFAULT_OG_IMAGE);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:image", image ?? DEFAULT_OG_IMAGE);

    // Robots directive (per-route)
    let robots = document.head.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    if (noindex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.appendChild(robots);
      }
      robots.setAttribute("content", "noindex,nofollow");
    } else if (robots) {
      robots.setAttribute("content", "index,follow");
    }

    const href =
      canonical ??
      (typeof window !== "undefined"
        ? window.location.origin + window.location.pathname
        : undefined);

    if (href) {
      let link = document.head.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      );
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
      setMeta("property", "og:url", href);
    }

    // hreflang alternates — same URL for all locales (client-side i18n).
    // Cleans any previous SEO-owned hreflang links first.
    document.head
      .querySelectorAll('link[rel="alternate"][data-seo-hreflang="true"]')
      .forEach((n) => n.remove());
    if (hreflang && href) {
      const path = href.startsWith("http")
        ? new URL(href).pathname + new URL(href).search
        : href;
      const fullUrl = href.startsWith("http") ? href : `${SITE_ORIGIN}${path}`;
      (["pt-BR", "en", "es", "x-default"] as const).forEach((lang) => {
        const l = document.createElement("link");
        l.setAttribute("rel", "alternate");
        l.setAttribute("hreflang", lang);
        l.setAttribute("href", fullUrl);
        l.dataset.seoHreflang = "true";
        document.head.appendChild(l);
      });
    }

    // Structured data (JSON-LD): keep a single SEO-owned <script> per page.
    const existing = document.head.querySelector<HTMLScriptElement>(
      'script[data-seo-jsonld="true"]',
    );
    if (jsonLd) {
      const node = existing ?? document.createElement("script");
      node.type = "application/ld+json";
      node.dataset.seoJsonld = "true";
      node.textContent = JSON.stringify(jsonLd);
      if (!existing) document.head.appendChild(node);
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, canonical, image, jsonLd, noindex, hreflang]);

  return null;
};

export default SEO;