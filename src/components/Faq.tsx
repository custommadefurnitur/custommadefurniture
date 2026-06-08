'use client';

import React, { useState, useEffect } from 'react';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  helpfulVotes: number;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [likedFaqIds, setLikedFaqIds] = useState<string[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);


  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/faq');
      const json = await response.json();
      if (json.data) setFaqs(json.data);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFAQs();
    const savedLikes = localStorage.getItem('user_liked_faqs');
    if (savedLikes) {
      setLikedFaqIds(JSON.parse(savedLikes));
    }
  }, []);

  const handleLike = async (id: string) => {
  if (loadingFaqs.includes(id)) return;
  const isAlreadyLiked = likedFaqIds.includes(id);
  setLoadingFaqs(prev => [...prev, id]);
  try {
    const response = await fetch(`/api/faq/${id}/like`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: isAlreadyLiked ? 'dec' : 'inc' }),
    });
    if (response.ok) {
      setFaqs(p => p.map(f => f._id === id ? { ...f, helpfulVotes: f.helpfulVotes + (isAlreadyLiked ? -1 : 1) } : f));
      setLikedFaqIds(p => {
        const next = isAlreadyLiked ? p.filter(x => x !== id) : [...p, id];
        localStorage.setItem('user_liked_faqs', JSON.stringify(next));
        return next;
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingFaqs(prev => prev.filter(x => x !== id));
  }
};


  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion }),
      });

      if (response.ok) {
        alert('Question sent! It will show up on this public page once the owner provides an answer.');
        setNewQuestion('');
      }
    } catch (err) {
      console.error('Submission processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

// 1. Filter items based on the search input
const searchedFaqs = faqs.filter(faq => {
  const query = searchQuery.toLowerCase();
  return (
    faq.question.toLowerCase().includes(query) || 
    faq.answer.toLowerCase().includes(query)
  );
});

// 2. Sort the remaining items by engagement metrics (Highest votes first)
const sortedFaqs = [...searchedFaqs].sort((a, b) => b.helpfulVotes - a.helpfulVotes);

// 3. Determine if the user is actively searching
const isSearching = searchQuery.trim() !== '';

// 4. Slice the array to 5 items ONLY IF they aren't searching AND showAll is false
const finalDisplayFaqs = (showAll || isSearching) ? sortedFaqs : sortedFaqs.slice(0, 5);


  return (
    <div className="min-h-screen bg-palette-cream text-palette-brown p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8 border-b border-palette-beige/50 pb-4">
        <h2 className="text-4xl font-extrabold text-palette-maroon tracking-wide">Customer Support Portal</h2>
      </header>

      {/* Main Wireframe Split Grid Matrix */}
      <main className="max-w-6xl mx-auto flex flex-col md:grid md:grid-cols-3 gap-8 items-start">
        
        {/* Search Engine Panel - Appears first on mobile (order-1), moved to sidebar position on desktop */}
        <section className="w-full order-1 md:order-none md:hidden bg-palette-beige p-5 rounded-xl border border-palette-brown/10 shadow-sm">
          <h2 className="text-md font-bold mb-3 text-palette-brown flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-palette-maroon" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
            </svg>
            Search System
          </h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search existing questions..."
            aria-label="Search existing frequently asked questions"
            suppressHydrationWarning
            className="w-full p-2.5 rounded-lg bg-palette-cream border border-palette-brown/20 text-palette-brown placeholder-palette-brown/50 focus:outline-none focus:ring-2 focus:ring-palette-maroon text-sm"
          />
        </section>

        {/* Left Side: List of FAQs */}
        <section className="w-full order-2 md:order-none md:col-span-2 space-y-4 max-h-screen overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-palette-brown scrollbar-track-palette-beige">
          {/* Render control bar only if total items exceed 5 AND user isn't searching */}
          {faqs.length > 5 && !isSearching && (
            <div className="flex items-center justify-between bg-palette-beige/30 px-4 py-2.5 rounded-xl border border-palette-brown/5 text-xs">
              <span className="text-palette-brown/70 font-medium">
                {showAll ? `Showing all ${faqs.length} FAQs` : 'Showing top 5 most helpful FAQs'}
              </span>
              <button
                onClick={() => setShowAll(!showAll)}
                aria-expanded={showAll}
                className="px-3 py-1 bg-palette-cream text-palette-maroon hover:bg-palette-maroon hover:text-palette-cream font-bold rounded-lg border border-palette-maroon/20 transition-all shadow-sm"
              >
                {showAll ? 'Show Top 5 Only' : `Show All (${faqs.length})`}
              </button>
            </div>
          )}

          {finalDisplayFaqs.length === 0 ? (
            <div className="bg-palette-beige/20 border border-palette-beige p-12 rounded-xl text-center text-palette-brown/70 font-medium">
              No matching frequently asked questions found.
            </div>
          ) : (
            finalDisplayFaqs.map((faq) => {
              const isLiked = likedFaqIds.includes(faq._id);
              const isThisItemLoading = loadingFaqs.includes(faq._id);

              return (
                <div 
                  key={faq._id} 
                  className="bg-palette-beige border border-palette-brown/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative group"
                >
                  <div className="pr-16">
                    <h3 className="text-lg font-bold text-palette-maroon mb-3 flex items-start gap-2">
                      <span className="bg-palette-maroon text-palette-cream text-xs px-2 py-0.5 rounded mt-0.5">Q</span>
                      {faq.question}
                    </h3>
                    <div className="text-sm leading-relaxed text-palette-brown bg-palette-cream/60 p-4 rounded-lg border border-palette-cream">
                      <span className="font-bold block text-xs text-palette-maroon tracking-wider mb-1.5 line-clamp-2">OWNER REPLY:</span>
                      {faq.answer}
                    </div>
                  </div>

                  {/* Fixed Interactive Floating Corner Heart Button */}
                  <button 
                    onClick={() => handleLike(faq._id)}
                    disabled={isThisItemLoading}
                    aria-label={`Mark as helpful. Helpful votes: ${faq.helpfulVotes}`}
                    className={`absolute bottom-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-md border border-palette-brown/20 transition-colors text-xs font-bold ${
                      isThisItemLoading ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                      isLiked 
                        ? 'bg-palette-maroon text-palette-cream' 
                        : 'bg-palette-cream text-palette-brown hover:bg-palette-maroon hover:text-palette-cream'
                    }`}
                  >
                    <span className={isLiked ? 'text-palette-cream' : 'text-palette-brown group-hover:text-palette-cream'}>
                      {isThisItemLoading ? '...' : faq.helpfulVotes}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill={isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="w-3.5 h-3.5"
                      aria-hidden="true"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </section>

        {/* Right Side: Search and Submission Widgets */}
        <div className="w-full order-3 md:order-none space-y-6 md:sticky md:top-8">
          
          {/* Search Engine Panel - Only visible on desktop (md and up) */}
          <section className="hidden md:block bg-palette-beige p-5 rounded-xl border border-palette-brown/10 shadow-sm">
            <h2 className="text-md font-bold mb-3 text-palette-brown flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-palette-maroon" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
              </svg>
              Search System
            </h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search existing questions..."
              aria-label="Search existing frequently asked questions"
              suppressHydrationWarning
              className="w-full p-2.5 rounded-lg bg-palette-cream border border-palette-brown/20 text-palette-brown placeholder-palette-brown/50 focus:outline-none focus:ring-2 focus:ring-palette-maroon text-sm"
            />
          </section>

          {/* Ask Question Form Panel */}
          <section className="bg-palette-brown text-palette-cream p-6 rounded-xl shadow-md border border-palette-brown">
            <h2 className="text-lg font-bold mb-1 tracking-tight">Have a Question?</h2>
            <p className="text-xs text-palette-beige mb-4 opacity-90">Submit your inquiry here directly to the owner.</p>
            
            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <label htmlFor="faq-new-question" className="sr-only">Type your question here</label>
              <textarea
                id="faq-new-question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Type your question safely here..."
                rows={5}
                maxLength={500}
                required
                suppressHydrationWarning
                className="w-full p-3 rounded-lg bg-palette-cream text-palette-brown placeholder-palette-brown/40 focus:outline-none focus:ring-2 focus:ring-palette-maroon text-sm resize-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                suppressHydrationWarning
                className="w-full py-2.5 px-4 bg-palette-maroon hover:bg-palette-maroon/90 text-palette-cream rounded-lg font-bold text-sm transition-all shadow focus:outline-none focus:ring-2 focus:ring-palette-cream/50 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Submit Inquiry'}
              </button>
            </form>
          </section>
          
        </div>

      </main>

    </div>

  );
}
