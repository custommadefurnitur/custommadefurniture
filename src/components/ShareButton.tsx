"use client";

import { FiShare2 } from "react-icons/fi";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url, // Shares the precise dynamic route URL targeting this post
        });
      } catch (error) {
        console.error("Error sharing post:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Direct post link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="absolute bottom-4 right-5 bg-palette-beige text-2xl p-2 rounded cursor-pointer hover:opacity-80 transition-opacity z-10"
      aria-label={`Share ${title}`}
    >
      <FiShare2 />
    </button>
  );
}
