import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { client } from "@/sanity/lib/client";

interface UserQuestion {
  _id: string;
  question: string;
  answer?: string;
  isPublished: boolean;
  createdAt: string;
}

interface WishlistProductItem {
  title: string;
  slug: string;
  price?: number;
}

interface WishlistPostItem {
  title: string;
  slug: string;
  category?: string;
}

async function getUserActivity(): Promise<UserQuestion[]> {
  try {
    const headersList = await import("next/headers").then(mod => mod.headers());
    const cookieHeader = headersList.get("cookie") || "";

    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/user/activity`, {
      headers: {
        Cookie: cookieHeader,
      },
      next: { revalidate: 0 }
    });
    
    const json = await res.json();
    return json.success && json.data ? json.data : [];
  } catch (err) {
    console.error("Dashboard dataset connection error:", err);
    return [];
  }
}

async function getUserWishlist(userId: string) {
  await connectDB();
  const user = await User.findById(userId).lean();

  return {
    wishlistProducts: user?.wishlistProducts || [],
    wishlistPosts: user?.wishlistPosts || [],
  };
}

async function getWishlistItems(wishlistProducts: string[], wishlistPosts: string[]) {
  const [productItems, postItems] = await Promise.all([
    wishlistProducts.length
      ? client.fetch(`*[_type == "product" && slug.current in $slugs] { title, price, "slug": slug.current }`, {
          slugs: wishlistProducts,
        })
      : [],
    wishlistPosts.length
      ? client.fetch(`*[_type == "post" && slug.current in $slugs] { title, "slug": slug.current, category }`, {
          slugs: wishlistPosts,
        })
      : [],
  ]);

  return {
    productItems: productItems as WishlistProductItem[],
    postItems: postItems as WishlistPostItem[],
  };
}

export default async function UserDashboardPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const activities = await getUserActivity();
  const { wishlistProducts, wishlistPosts } = await getUserWishlist(session.user.id);
  const { productItems, postItems } = await getWishlistItems(wishlistProducts, wishlistPosts);

  return (
    <div className="min-h-screen bg-palette-cream text-palette-brown py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto pt-12">
        
        {/* REFINED HEADER WORKSPACE */}
        <header className="border-b border-palette-beige/60 pb-6 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-palette-brown">
              Welcome back, {session.user.name}
            </h1>
            <p className="text-sm text-palette-brown/70 mt-1">
              Manage your submitted custom design inquiries and studio history.
            </p>
          </div>
          
          <form 
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button
              type="submit"
              className="w-full sm:w-auto bg-palette-maroon text-palette-cream text-xs font-bold px-4 py-2.5 rounded-xl transition-colors hover:bg-palette-maroon/90 shadow-sm flex items-center justify-center gap-2"
            >
              <span>Log Out</span>
              <svg 
                xmlns="http://w3.org" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2.5} 
                stroke="currentColor" 
                className="w-3.5 h-3.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12" />
              </svg>
            </button>
          </form>
        </header>

        {/* WORKSPACE DISPLAY BODY */}
        <main>
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-palette-maroon">
                Submitted Questions
              </h2>
              <span className="bg-palette-maroon text-palette-cream text-xs font-bold px-3 py-0.5 rounded-full">
                {activities.length} entries
              </span>
            </div>

            {activities.length === 0 ? (
              <div className="text-center py-16 bg-white/40 border border-palette-beige/60 rounded-2xl shadow-sm">
                <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-palette-brown/40 mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm font-medium text-palette-brown/60">You haven&apos;t submitted any questions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((item) => (
                  <div key={item._id} className="bg-white/50 border border-palette-beige/60 rounded-2xl p-6 shadow-sm relative flex flex-col gap-4">
                    
                    {/* TOP STATS STRIP */}
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-base font-bold text-palette-brown pr-24 leading-snug">
                        Q: {item.question}
                      </h4>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider absolute top-6 right-6 border ${
                        item.isPublished 
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {item.isPublished ? 'Answered' : 'Pending'}
                      </span>
                    </div>

                    {/* DYNAMIC FEEDBACK CONDITIONAL FRAME */}
                    {item.answer ? (
                      <div className="text-sm text-palette-brown bg-palette-cream/60 p-4 rounded-xl border border-palette-beige/40">
                        <span className="font-bold text-xs text-palette-maroon block mb-1.5 uppercase tracking-wider">
                          Studio Answer
                        </span>
                        <p className="leading-relaxed font-medium opacity-90">{item.answer}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-palette-brown/60 italic bg-palette-cream/20 p-3 rounded-xl border border-dashed border-palette-beige/60">
                        Our design studio team is currently reviewing your submission.
                      </p>
                    )}

                    {/* CHRONOLOGICAL FOOTER TIMESTAMP */}
                    <div className="text-[10px] text-palette-brown/50 font-bold tracking-wide">
                      Submitted: {new Date(item.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-palette-maroon">
                  Wishlist Products
                </h2>
                <p className="text-sm text-palette-brown/70 mt-1">
                  Tap any item to navigate to its product page.
                </p>
              </div>
              <span className="bg-palette-maroon text-palette-cream text-xs font-bold px-3 py-0.5 rounded-full">
                {productItems.length} saved
              </span>
            </div>

            {productItems.length === 0 ? (
              <div className="rounded-2xl border border-palette-beige/60 bg-white/50 p-6 text-center text-sm text-palette-brown/70">
                No products saved yet. Open a product and tap the heart to save it.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {productItems.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    aria-label={`View details for ${product.title}`}
                    className="group rounded-3xl border border-palette-beige/60 bg-white/70 p-4 transition hover:border-palette-maroon hover:shadow-lg"
                  >
                    <p className="text-base font-semibold text-palette-brown group-hover:text-palette-maroon">
                      {product.title}
                    </p>
                    {typeof product.price === "number" ? (
                      <p className="mt-2 text-sm text-emerald-900">${product.price.toLocaleString()}</p>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-palette-maroon">
                  Wishlist Blog Posts
                </h2>
                <p className="text-sm text-palette-brown/70 mt-1">
                  Saved reading for later. Tap any card to open the post.
                </p>
              </div>
              <span className="bg-palette-maroon text-palette-cream text-xs font-bold px-3 py-0.5 rounded-full">
                {postItems.length} saved
              </span>
            </div>

            {postItems.length === 0 ? (
              <div className="rounded-2xl border border-palette-beige/60 bg-white/50 p-6 text-center text-sm text-palette-brown/70">
                No blog posts saved yet. Open a post and tap the heart to add it.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {postItems.map((post) => (
                  <Link
                  
                    key={post.slug}
                    aria-label={`Read blog post titled ${post.title} in category ${post.category || 'Uncategorized'}`}
                    href={`/blog/${post.slug}`}
                    className="group rounded-3xl border border-palette-beige/60 bg-white/70 p-4 transition hover:border-palette-maroon hover:shadow-lg"
                  >
                    <p className="text-base font-semibold text-palette-brown group-hover:text-palette-maroon">
                      {post.title}
                    </p>
                    {post.category ? (
                      <p className="mt-2 text-xs uppercase tracking-wider text-palette-brown/50">
                        {post.category}
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>

      </div>
    </div>
  );
}
