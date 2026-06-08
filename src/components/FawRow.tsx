// src/components/FaqRow.tsx
"use client";
import { useState } from 'react';

interface FaqRowProps {
  question: string;
  answer: string;
}

export default function FaqRow({ question, answer }: FaqRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-white border border-palette-beige rounded-xl overflow-hidden transition-all shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left font-[Poppins] hover:bg-palette-beige/5 transition"
      >
        <span className="font-semibold text-palette-brown text-sm sm:text-base pr-4">
          {question}
        </span>
        <span className={`text-xl font-bold text-palette-brown transition-transform duration-200 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
          +
        </span>
      </button>

      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] border-t border-palette-beige/30' : 'max-h-0'
        }`}
      >
        <p className="p-5 font-[Inter] text-xs sm:text-sm text-gray-600 leading-relaxed bg-palette-beige/5">
          {answer}
        </p>
      </div>
    </div>
  );
}
