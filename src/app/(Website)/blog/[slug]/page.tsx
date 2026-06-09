import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import ShareButton from "@/components/ShareButton";
import WishlistButton from "@/components/WishlistButton";
import { SITE_NAME, SITE_URL, createSeoMetadata, jsonLd } from "@/lib/seo";

// 1. Updated Props interface to treat params as a Promise
interface Props {
  params: Promise<{ slug: string }>;
}

const SINGLE_POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  title,
  description,
  "slug": slug.current,
  category,
  tags,
  uploadedDate,
  mainImage
}`;

// 2. Updated to properly await the asynchronous params object
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(SINGLE_POST_QUERY, { slug });
  if (!post) return {};

  const imageUrl = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).auto('format').quality(75).url() : undefined;

  return {
    ...createSeoMetadata({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      image: imageUrl,
      type: "article",
    }),
    title: post.title,
    openGraph: {
      ...createSeoMetadata({
        title: post.title,
        description: post.description,
        path: `/blog/${post.slug}`,
        image: imageUrl,
        type: "article",
      }).openGraph,
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
    },
  };
}

export async function generateStaticParams() {
  const SLUGS_QUERY = `*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`;
  const posts = await client.fetch<{ slug: string }[]>(SLUGS_QUERY);

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  // 3. Awaiting params correctly matches the updated Props definition
  const { slug } = await params;
  const post = await client.fetch(SINGLE_POST_QUERY, { slug });

  if (!post) {
    notFound();
  }

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = post.mainImage ? urlFor(post.mainImage).auto('format').dpr(2).quality(75).url() : '/loading.gif';
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": post.mainImage ? [urlFor(post.mainImage).width(1200).height(630).auto('format').quality(75).url()] : undefined,
    "datePublished": post.uploadedDate,
    "dateModified": post._updatedAt || post.uploadedDate,
    "mainEntityOfPage": postUrl,
    "author": {
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL
    },
    "publisher": {
    "@type": "Organization",
    "name": SITE_NAME,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_URL}/favicon.ico` 
      }
    },
    "keywords": post.tags ? post.tags.join(", ") : undefined
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }} className="mt-10 items-center">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(articleJsonLd)} />
      <div style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }} className="relative bg-palette-beige w-[clamp(280px,90%,560px)]">
        
        <div className="relative">
          <Image 
            src={imageUrl} 
            width={400} // Changed from string "400" to number 400 for strict Next.js Image compliance
            height={400} 
            alt={post.title + "image"} 
            loading='eager' 
            style={{ aspectRatio: '1/1' }} 
            unoptimized
            className="w-[98%] h-auto border-palette-cream object-cover rounded mx-auto mb-5"
          />
          <ShareButton title={post.title} text={post.description} url={postUrl} aria-label="Share this blog post" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-palette-brown font-semibold text-[15px] xs:text-[18px] sm:text-[20px]">{post.title}</h2>
          <WishlistButton itemType="post" slug={post.slug} aria-label="Add to wishlist" />
        </div>
        
        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }} className="px-3 py-1 bg-palette-cream text-palette-brown rounded-bl rounded-tr absolute top-1 right-1">
          {post.category}
        </span>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0.5rem 0' }}>
          {post.tags?.map((tag: string, tagIndex: number) => (
            <span 
              key={tagIndex} 
              style={{ backgroundColor: '#f0f0f0', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <p className="text-slate-700 font-[inter] text-sm xs:text-[16px] sm:text-[18px]">{post.description}</p>
        
        <small className="text-gray-800">
          Published on: {new Date(post.uploadedDate).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
}
