import { client } from "@/sanity/lib/client"; 
import BlogContent from "@/components/BlogContent"; // Adjust path to where you saved Step 1
import { SITE_URL, createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
    title: 'Custom Furniture Blog',
    description: 'Read design ideas, furniture customization tips, material guides, and space planning inspiration from Custom Made Furniture.',
    path: '/blog',
    type: 'article',
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
    // Fetch data safely on the server side
    const posts: Post[] = await client.fetch(ALL_POSTS_QUERY, {}, { next: { revalidate: 60 } });
    const siteUrl = SITE_URL;

    // Pass data directly down to the interactive client layout
    return <div className="bg-palette-cream"><BlogContent posts={posts} siteUrl={siteUrl} /></div>;
}
