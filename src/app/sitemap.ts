import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { SITE_URL } from "@/lib/seo";

interface SitemapEntry {
  slug: string;
  updatedAt?: string;
}

const staticRoutes: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const query = `{
    "products": *[_type == "product" && defined(slug.current)]{
      "slug": slug.current,
      "updatedAt": _updatedAt
    },
    "posts": *[_type == "post" && defined(slug.current)]{
      "slug": slug.current,
      "updatedAt": _updatedAt
    }
  }`;

  const data = await client.fetch<{ products: SitemapEntry[]; posts: SitemapEntry[] }>(
    query,
    {},
    { next: { revalidate: 3600 } }
  );

  const productRoutes = (data.products || []).map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const postRoutes = (data.posts || []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}
