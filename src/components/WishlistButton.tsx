"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  itemType: "product" | "post";
  slug: string;
}

export default function WishlistButton({ itemType, slug }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchWishlistState() {
      try {
        const response = await fetch("/api/user/wishlist", {
          method: "GET",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const json = await response.json().catch(() => ({}));
          if (json?.message) {
            setMessage(json.message === "Unauthorized." ? "Please sign in to save items." : json.message);
          }
          return;
        }

        const json = await response.json();
        if (isMounted && json.success) {
          const products: string[] = json.data?.wishlistProducts || [];
          const posts: string[] = json.data?.wishlistPosts || [];
          setWishlisted(itemType === "product" ? products.includes(slug) : posts.includes(slug));
        }
      } catch {
        if (isMounted) {
          setMessage("Unable to load wishlist state.");
        }
      }
    }

    fetchWishlistState();

    return () => {
      isMounted = false;
    };
  }, [itemType, slug]);
  const router = useRouter();
  const toggleWishlist = async () => {
    setLoading(true);
    setMessage(null);
    let shouldRedirect = false;
    try {
      const response = await fetch("/api/user/wishlist", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "toggle", itemType, slug }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        if (response.status === 401) {
          shouldRedirect = true;
        }
        setMessage(json?.message || "Unable to update wishlist.");
        return;
      }

      const products: string[] = json.data?.wishlistProducts || [];
      const posts: string[] = json.data?.wishlistPosts || [];
      const updated = itemType === "product" ? products.includes(slug) : posts.includes(slug);
      setWishlisted(updated);
      setMessage(json.message ?? (updated ? "Added to wishlist." : "Removed from wishlist."));
    } catch {
      setMessage("Unable to update wishlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={toggleWishlist}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${wishlisted ? "bg-[#700635] text-white border-transparent" : "bg-white text-[#4C1A17] border-[#D4BEA9] hover:border-[#700635]"}`}
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {wishlisted ? "♥" : "♡"}
        </span>
        {wishlisted ? "Liked" : "Like"}
      </button>
    </div>
  );
}
