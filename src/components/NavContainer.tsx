//src/components/NavContainer.tsx
"use client";

import { useState, useEffect } from "react";

export default function NavContainer({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger the effect once user scrolls down past 20 pixels
      if (window.scrollY > 1) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-1/2 top-0 z-100 -translate-x-1/2 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "top-3  w-[98%] rounded-full border border-gray-200/80 shadow-lg backdrop-blur-md "
          : "w-screen border-b border-gray-200  "
      }`}
    >
      <div 
        className={`mx-auto  flex items-center bg-palette-beige justify-between transition-all p-2 xs:px-6 duration-300 ${
          isScrolled ? "h-14 rounded-full " : " h-16"
        }`}
      >
        {children}
      </div>
    </header>
  );
}
