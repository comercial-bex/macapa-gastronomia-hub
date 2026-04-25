import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
}

/**
 * Lightweight SEO helper. Updates document.title and the relevant meta /
 * OpenGraph / Twitter / canonical tags on mount and whenever props change.
 */
const DEFAULT_OG_IMAGE = "https://restaurantemacapaba.com.br/og-image.jpg";

const SEO = ({ title, description, canonical, image }: SEOProps) => {
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
    }
  }, [title, description, canonical]);

  return null;
};

export default SEO;