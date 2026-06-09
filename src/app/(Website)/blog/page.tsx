import { client } from "@/sanity/lib/client"; 
import BlogContent from "@/components/BlogContent";
import { SITE_NAME, SITE_URL, createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
    title: 'Custom Furniture Blog',
    description: 'Read design ideas, furniture customization tips, material guides, and space planning inspiration from Custom Made Furniture.',
    path: '/blog',
    type: 'website', // Changed to website since this is a listing index, not a single article
});

const ALL_POSTS_QUERY = `*[_type == "post"] | order(uploadedDate desc){
  title,
  description,
  "slug": slug.current,
  category,
  tags,
  uploadedDate,
  mainImage
}`;

interface Post {
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
  uploadedDate: string;
  mainImage: unknown;
}

export default async function Blog() {
    const posts: Post[] = await client.fetch(ALL_POSTS_QUERY, {}, { next: { revalidate: 60 } });
    const siteUrl = SITE_URL;

    // 2. Generate structured data representing the blog and its post entries
    const listingJsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Blog",
          "@id": `${SITE_URL}/blog/#blog-archive`,
          "url": `${SITE_URL}/blog`,
          "name": `Design Insights Blog | ${SITE_NAME}`,
          "description": "Read design ideas, furniture customization tips, material guides, and space planning inspiration.",
          "publisher": {
            "@type": "Organization",
            "name": SITE_NAME,
            "url": SITE_URL
          }
        },
        {
          "@type": "ItemList",
          "name": "Latest Furniture Design Articles",
          "url": `${SITE_URL}/blog`,
          "numberOfItems": posts.length,
          "itemListElement": posts.map((post, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${SITE_URL}/blog/${post.slug}`
          }))
        }
      ]
    };

    return (
      <div className="bg-palette-cream">
        {/* 3. Render schema structure directly onto page context */}
        <script
          id="blog-archive-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }}
        />
        <BlogContent posts={posts} siteUrl={siteUrl} />
      </div>
    );
}
