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
  const [showAll, setShowAll] = useState(false); 
  const [newQuestion, setNewQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [likedFaqIds, setLikedFaqIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const savedLikes = localStorage.getItem('user_liked_faqs');
    return savedLikes ? JSON.parse(savedLikes) : [];
  });
  const [loadingFaqs, setLoadingFaqs] = useState<string[]>([]);

  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const response = await fetch('/api/faq');
        const json = await response.json();
        if (json.data) setFaqs(json.data);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      }
    };

    void loadFaqs();
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

  const searchedFaqs = faqs.filter(faq => {
    const query = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query)
    );
  });

  const sortedFaqs = [...searchedFaqs].sort((a, b) => b.helpfulVotes - a.helpfulVotes);
  const isSearching = searchQuery.trim() !== '';
  const finalDisplayFaqs = (showAll || isSearching) ? sortedFaqs : sortedFaqs.slice(0, 5);

  // 2. Generate dynamic JSON-LD containing only published, answered QAs
  const activeFaqsForSchema = faqs.filter(faq => faq.question && faq.answer);
  
  const faqJsonLd = activeFaqsForSchema.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": activeFaqsForSchema.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <div className="min-h-screen bg-palette-cream text-palette-brown p-8 font-sans mt-13">
      {/* 3. Inject Client-Side Dynamic Script Block */}
      {faqJsonLd && (
        <script
          id="dynamic-public-faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <header className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold text-palette-maroon tracking-wide">FAQs</h1>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        <section className="md:col-span-2 space-y-4">
          {/* Interactive Search Bar Element */}
          <div className="relative mb-4">
            <input
              type="text"
              suppressHydrationWarning
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search frequently asked questions..."
              aria-label="Search frequently asked questions"
              className="w-full p-3 pl-10 rounded-xl bg-palette-beige/60 text-palette-brown placeholder-palette-brown/50 focus:outline-none focus:ring-2 focus:ring-palette-maroon/50 border border-palette-brown/10 text-sm shadow-sm transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-palette-brown/50 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
              </svg>
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-palette-brown/40 hover:text-palette-maroon p-1 text-xs transition-colors"
                aria-label="Clear search"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Visibility Info & Toggle Button (Hidden while user searches) */}
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

          {/* Conditional Empty States and List Output */}
          {faqs.length === 0 ? (
            <div className="bg-palette-beige/40 border border-palette-brown/10 p-8 rounded-xl text-center text-palette-brown/80">
              No frequently asked questions listed yet.
            </div>
          ) : finalDisplayFaqs.length === 0 ? (
            <div className="bg-palette-beige/20 border border-dashed border-palette-brown/20 p-8 rounded-xl text-center text-palette-brown/60 text-sm italic">
              No matches found for &ldquo;{searchQuery}&rdquo;. Try a different keyword.
            </div>
          ) : (
            finalDisplayFaqs.map((faq) => {
              const isLiked = likedFaqIds.includes(faq._id);
              const isThisItemLoading = loadingFaqs.includes(faq._id);

              return (
                <div 
                  key={faq._id} 
                  className="bg-palette-beige border border-palette-brown/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  <div className="pr-16">
                    <h3 className="text-lg font-bold text-palette-maroon mb-2">
                      Q: {faq.question}
                    </h3>
                    <div className="text-sm leading-relaxed text-palette-brown/90 bg-palette-cream/50 p-3 rounded border border-palette-cream/80">
                      <span className="font-semibold block text-xs text-palette-maroon mb-1">OWNER REPLY:</span>
                      {faq.answer}
                    </div>
                  </div>

                  {/* Wireframe Floating Corner Heart Button */}
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
                      strokeWidth="2"
                      aria-label={isLiked ? 'You have marked this FAQ as helpful' : 'Mark this FAQ as helpful'}
                      className={`w-4 h-4 ${isLiked ? 'text-palette-cream' : 'text-palette-maroon group-hover:text-palette-cream'}`}
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
        {/* Right Sidebar Form Panel */}
        <aside className="bg-palette-brown text-palette-cream p-6 rounded-xl shadow-lg md:sticky md:top-20 border border-palette-brown">
          <h2 className="text-xl font-bold mb-1 text-palette-cream tracking-tight">Have a Question?</h2>
          <p className="text-xs text-palette-beige mb-4 opacity-90">Submit your inquiry here directly to the owner.</p>
          
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <label htmlFor="faq-page-textarea" className="sr-only">Type your question here</label>
            <textarea
              id="faq-page-textarea"
              suppressHydrationWarning
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask away..."
              rows={4}
              maxLength={500}
              required
              className="w-full p-3 rounded bg-palette-cream text-palette-brown placeholder-palette-brown/40 focus:outline-none focus:ring-2 focus:ring-palette-maroon text-sm resize-none border border-palette-beige/20"
            />
            <button
              type="submit"
              disabled={isLoading}
              aria-label="Submit your question to the owner"
              className="w-full py-2 px-4 bg-palette-maroon hover:bg-palette-maroon/90 text-palette-cream rounded font-bold text-sm transition-all shadow focus:outline-none focus:ring-2 focus:ring-palette-cream/50 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Submit'}
            </button>
          </form>
        </aside>
      </main>
    </div>
  );
}