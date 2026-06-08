// components/ImageGallerySlider.tsx
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ProductGalleryItem } from '@/app/(Website)/products/page';

interface SliderProps {
  gallery: ProductGalleryItem[];
  title: string;
}

export default function ImageGallerySlider({ gallery, title }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Track swipe touch coordinates
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Minimum pixel distance swiped to trigger a page change
  const minSwipeDistance = 50;

  const hasImages = gallery && gallery.length > 0;
  
  if (!hasImages) {
    return (
      <div className="relative aspect-square w-full rounded-2xl bg-[#D4BEA9]/30 border border-[#D4BEA9] flex items-center justify-center">
        <Image src="/loading.gif" alt="Loading" width={50} height={50} unoptimized />
      </div>
    );
  }

  const activeImage = gallery[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  // Capture starting touch position
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null; // reset
    touchStartX.current = e.targetTouches[0].clientX;
  };

  // Track moving touch position
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  // Calculate distance and determine swipe direction when finger lifts off
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <div className="space-y-4">
      {/* PRIMARY IMAGE AREA WITH TOUCH LISTENERS */}
      <div 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative aspect-square w-full rounded-2xl bg-[#D4BEA9]/30 border border-[#D4BEA9] overflow-hidden group shadow-sm select-none touch-pan-y"
      >
        <Image
          src={activeImage.url}
          alt={`${title} structural view ${currentIndex + 1}`}
          fill
          priority
          unoptimized
          className="object-cover transition-all duration-300 pointer-events-none"
        />

        {/* CONTROLS (Hidden on mobile / touch screen natively by default layout styles) */}
        {gallery.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-[#4C1A17]/80 hover:bg-[#700635] text-[#F3E5D8] w-10 h-10 rounded-full items-center justify-center font-bold shadow transition-all active:scale-95"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-[#4C1A17]/80 hover:bg-[#700635] text-[#F3E5D8] w-10 h-10 rounded-full items-center justify-center font-bold shadow transition-all active:scale-95"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* TRACK DOTS / NUMERIC PAGINATION TRACK BAR */}
      {gallery.length > 1 && (
        <div className="flex items-center justify-center gap-3 py-2 bg-[#D4BEA9]/20 rounded-xl border border-[#D4BEA9]/50">
          {gallery.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-3 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-[#700635] w-8'
                  : 'bg-[#4C1A17]/40 hover:bg-[#4C1A17]/70 w-3'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
