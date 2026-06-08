'use client';

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";   
import ShareButton from "@/components/ShareButton";
import WishlistButton from "@/components/WishlistButton";

interface Post {
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
  uploadedDate: string;
  mainImage: unknown;
}

interface BlogContentProps {
  posts: Post[];
  siteUrl: string;
}
// ... Keep your interfaces matching your project as defined previously ...

export default function BlogContent({ posts, siteUrl }: BlogContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const unique = new Set(posts.map((post) => post.category).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    /* MAIN CONTAINER: Use flexible display layout side-by-side */
    <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto gap-8 px-4 py-8 mt-10 items-start bg-palette-cream">
      
      {/* LEFT SIDEBAR: Navigation, Search, and Categories */}
      <aside className="w-full md:w-[280px] md:sticky md:top-24 flex flex-col gap-6 p-4 bg-palette-beige border-palette-cream border-2 rounded-lg shadow-md">
        
        {/* Search Field */}
        <div className="w-full">
          <label className="block text-xs font-bold text-palette-brown uppercase tracking-wider mb-2">Search Feed</label>
          <input 
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-palette-cream rounded bg-white text-palette-brown focus:outline-none focus:ring-2 focus:ring-palette-cream"
          />
        </div>

        {/* Category List */}
        <div className="flex flex-col gap-1 w-full">
          <p className="text-xs font-bold text-palette-brown uppercase tracking-wider mb-2">Categories</p>
          <div className="flex flex-row flex-wrap md:flex-col gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-label={`Filter by category: ${cat}`}
                className={`text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-palette-cream text-palette-brown font-semibold' 
                    : 'text-gray-700 hover:bg-palette-cream/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT STREAM: Main Blog Grid matching your layout picture */}
      <main className="flex-1 flex flex-col gap-2 items-center w-full">
        {filteredPosts.length === 0 ? (
          <p className="text-gray-500 mt-10">No matches found.</p>
        ) : (
          filteredPosts.map((post) => {
            const postUrl = `${siteUrl}/blog/${post.slug}`;
            const imageUrl = post.mainImage ? urlFor(post.mainImage).auto('format').dpr(2).quality(75).url() : '/loading.gif';

            return (
              /* CARD CONTAINER: Matching the wireframe card dimensions */
              <article key={post.slug} className="relative bg-palette-beige border border-palette-cream rounded-lg overflow-hidden w-full max-w-[550px] shadow-sm">
                
                {/* Image Wrap & Interactions */}
                <div className="relative aspect-square w-full bg-gray-100">
                  <Link href={`/blog/${post.slug}`} className="block w-full h-full">
                    <Image 
                      src={imageUrl} 
                      fill
                      alt={post.title} 
                      loading='eager' 
                      className="object-cover cursor-pointer"
                      unoptimized
                    />
                  </Link>
                  
                  {/* Floating Client Interaction Button (Like your wireframe icons) */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <ShareButton title={post.title} text={post.description} url={postUrl} aria-label="Share this blog post" />
                  </div>
                   <div className="absolute top-4 right-4 z-10">
                    <WishlistButton itemType="post" slug={post.slug} aria-label="Add to wishlist" />
                   </div>

                  {/* Absolute Category Badge */}
                  <span className="absolute top-3 left-3 px-3 py-1 bg-palette-cream text-palette-brown text-xs uppercase font-bold rounded shadow-sm">
                    {post.category}
                  </span>
                </div>
                
                {/* Text Content Block Below Image */}
                <div className="p-5 flex flex-col gap-2">
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-palette-brown font-bold text-lg sm:text-xl hover:underline line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 my-1">
                    {post.tags?.map((tag, i) => (
                      <span key={i} className="bg-palette-cream/40 px-2 py-0.5 rounded text-xs text-palette-brown font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">{post.description}</p>
                  
                  <div className="border-t border-palette-cream/50 pt-3 mt-2 flex justify-between items-center text-xs text-gray-500" suppressHydrationWarning>
                    <span>Published: {new Date(post.uploadedDate).toLocaleDateString()}</span>
                  </div>
                </div>

              </article>
            );
          })
        )}
      </main>

    </div>
  );
}
