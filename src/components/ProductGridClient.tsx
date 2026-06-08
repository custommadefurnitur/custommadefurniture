// components/ProductGridClient.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductItem } from '@/app/(Website)/products/page';

const shuffleArray = (array: ProductItem[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface Props {
  initialProducts: ProductItem[];
}

export default function ProductGridClient({ initialProducts }: Props) {
  const [shuffledProducts] = useState<ProductItem[]>(() => shuffleArray(initialProducts));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isMounted, setIsMounted] = useState(false);
  

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Extract all unique categories dynamically from the products list
  const categories = useMemo(() => {
    const unique = new Set(shuffledProducts.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [shuffledProducts]);

  // Filter products based on search input and selected category
  const filteredProducts = useMemo(() => {
    return shuffledProducts.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.shortdescription?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [shuffledProducts, searchQuery, selectedCategory]);
  

  // Math variables for 9-item segments
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (shuffledProducts.length === 0) {
    return <div className="text-center py-20 text-neutral-500">Loading your collection...</div>;
  }

  const gridSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (gridSectionRef.current && currentPage !== 1) {
      gridSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

      useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="p-8 text-center">Loading products...</div>;
  }

  return (
    <div ref={gridSectionRef} className="max-w-6xl mx-auto flex flex-col justify-between min-h-[80vh] px-4">
      
      {/* FILTER BAR CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-palette-brown/20">
        
        {/* Search Input */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-palette-brown rounded-lg bg-palette-beige text-palette-brown placeholder-palette-brown/50 focus:outline-none focus:ring-2 focus:ring-palette-brown"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-palette-brown/60 hover:text-palette-brown"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Dropdown Select */}
        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-palette-brown rounded-lg bg-palette-beige text-palette-brown focus:outline-none focus:ring-2 focus:ring-palette-brown cursor-pointer"
          >
            {categories.map((category) => (
              <option key={category} value={category} suppressHydrationWarning>
                {category === 'All' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3x3 PRODUCT GRID */}
      {currentProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {currentProducts.map((product) => {
            const hasImage = product.gallery && product.gallery.length > 0;
            const imageSrc = hasImage ? product.gallery[0].url : '/loading.gif';

            return (
              <Link 
                key={product._id} 
                href={`/products/${product.slug}`}
                className="group border border-palette-brown bg-palette-beige rounded-lg p-4 flex flex-col justify-between hover:border-neutral-700 transition-all duration-300"
              >
                <div className="relative w-full aspect-square border-palette-cream rounded mb-4 overflow-hidden">
                  <Image 
                    src={imageSrc} 
                    alt={product.title}
                    width={400}
                    height={400}
                    unoptimized
                    className="object-cover aspect-square w-full h-auto group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-palette-brown text-xs px-2 py-1 rounded text-neutral-300" suppressHydrationWarning>
                    {product.category}
                  </span>
                </div>

                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1 text-palette-brown group-hover:text-palette-maroon transition-colors">
                    {product.title}
                  </h3>
                  <span className="text-emerald-700 font-medium">${product.price}</span>
                </div>

                <p className="text-sm text-palette-brown line-clamp-2 mt-auto">
                  {product.shortdescription}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-neutral-500 flex-1">
          No products found matching your criteria.
        </div>
      )}

      {/* WIREFRAME CONTROLS BAR */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 border-t border-palette-brown mt-auto">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 bg-palette-brown text-white hover:bg-neutral-700 disabled:opacity-30 rounded-full transition-all"
          >
            ←
          </button>

          <div className="flex items-center gap-2 bg-palette-brown px-4 py-2 rounded-full">
            {Array.from({ length: totalPages }, (_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    currentPage === pageNum 
                      ? 'bg-white text-black font-bold scale-110' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 bg-palette-brown text-white hover:bg-neutral-700 disabled:opacity-30 rounded-full transition-all"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
