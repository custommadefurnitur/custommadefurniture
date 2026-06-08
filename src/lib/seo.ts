import type { Metadata } from "next";

export const SITE_NAME = "Custom Made Furniture";
export const SITE_URL =
<<<<<<< HEAD
  process.env.NEXT_PUBLIC_SITE_URL || "https://custommadefurniture.vercel.app/";
=======
  process.env.NEXT_PUBLIC_SITE_URL || "https://custommadefurniture.vercel.com";
>>>>>>> 5b9a440870071c150f48cf0664556db1e409bffd
export const DEFAULT_OG_IMAGE = "/og-image.svg";

const defaultDescription =
  "Custom Made Furniture designs and builds luxury sofas, wardrobes, tables, beds, chairs, and storage pieces tailored for your space.";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path, SITE_URL).toString();
}

export function truncateMeta(text: string | undefined, maxLength = 160) {
  if (!text) return defaultDescription;
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

interface SeoMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

export function createSeoMetadata({
  title,
  description = defaultDescription,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
}: SeoMetadataOptions): Metadata {
  const metaDescription = truncateMeta(description);
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description: metaDescription,
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description: metaDescription,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${title} preview`,
        },
      ],
      locale: "en_IN",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [imageUrl],
    },
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}
