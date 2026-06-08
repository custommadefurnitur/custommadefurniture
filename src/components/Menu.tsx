'use client';
import { useState,useEffect } from "react";
import Image from "next/image";

export default function Menu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((open) => !open);
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
    <>
      {/* 1. Toggle Button (Always visible on page, changes icon based on state) */}
      <button 
        onClick={toggleMenu}
        className=""
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
      >
        <Image 
          src={isOpen ? "/closethemenu.jpg" : "/openthemenu.png"} 
          width={32} 
          height={32} 
          quality={50}
          alt="Menu" 
          aria-hidden="true"
          loading="eager" 
          className="rounded-full w-8 h-8"
          unoptimized 
        />
      </button>

      {/* 2. Backdrop Overlay (Closes sidebar when clicking outside on mobile) */}
      {isOpen && (
        <div 
          className={`fixed h-screen w-dvw  bg-black/30 z-49 transition-opacity duration-300 top-0 left-0 ${isScrolled ? '-mt-3 -ml-1' : ''}`}
          onClick={toggleMenu}
        />
      )}

      {/* 3. Sliding Wrapper for your Sidebar Child */}
      <div 
  className={`fixed top-0 h-dvh z-50 transition-all duration-300 ease-in-out translate-x-0 
    ${isOpen ? 'left-0 ' : '-left-full'} 
    ${isScrolled ? '-mt-4 -ml-2' : ''}`}
>
  {children}
</div>


    </>
  );
}
