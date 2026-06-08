'use client';

import React, { useState, useEffect } from 'react';

// Data Structures mapping database fields exactly
interface FAQItem { _id: string; question: string; answer?: string; isPublished: boolean; createdAt: string; }
interface ReviewItem { _id: string; reviewerName: string; rating: number; comment: string; createdAt: string; }
interface ContactItem { _id: string; name: string; email: string; subject: string; message: string; createdAt: string; }
interface UserItem { _id: string; name: string; email: string; role?: string; createdAt: string; }

type TabType = 'faqs' | 'reviews' | 'contacts' | 'users';

export default function MasterAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('faqs');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const headerClass = mounted 
    ? "max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[var(--color-palette-beige)]/40 pb-6 pt-15" 
    : "max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[var(--color-palette-beige)]/40 pb-6 pt-15" ;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'faqs') {
          const res = await fetch('/api/faq');
          const json = await res.json();
          if (json.data) setFaqs(json.data); 
        } else if (activeTab === 'reviews') {
          const res = await fetch('/api/reviews');
          const json = await res.json();
          if (json.success && json.data) setReviews(json.data);
        } else if (activeTab === 'contacts') {
          const res = await fetch('/api/contact');
          const json = await res.json();
          if (json.success && json.data) setContacts(json.data);
        } else if (activeTab === 'users') {
          const res = await fetch('/api/users');
          const json = await res.json();
          if (json.success && json.data) setUsers(json.data);
        }
      } catch (err) {
        console.error(`Failed loading dynamic datasets for tab: ${activeTab}`, err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  // Answer Execution Process
  const handlePublishAnswer = async (id: string) => {
    const answerText = answers[id];
    if (!answerText?.trim()) return alert('Please input reply text.');

    setSubmittingId(id);
    try {
      const response = await fetch(`/api/faq/${id}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answerText }),
      });

      if (response.ok) {
        alert('Answer applied live!');
        setFaqs(prev => prev.map(f => f._id === id ? { ...f, answer: answerText, isPublished: true } : f));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

return (
  <div className="min-h-screen bg-[var(--color-palette-cream)]/20 p-6 md:p-10 font-sans text-[var(--color-palette-brown)]">
    {/* Structural Master Console Header */}
    <header className={headerClass}>
      <div>
        <h1 className="text-3xl font-black text-[var(--color-palette-maroon)] tracking-tight sm:text-4xl">
          Studios Management Console
        </h1>
        <p className="text-sm text-[var(--color-palette-brown)]/70 mt-1.5 font-medium">
          Manage feedback, incoming inquiries, and user configurations securely.
        </p>
      </div>
      
      {/* Dynamic Responsive Tab Controls */}
      <nav className="flex flex-wrap gap-2 bg-[var(--color-palette-beige)]/20 p-1.5 rounded-xl border border-[var(--color-palette-beige)]/40 backdrop-blur-sm">
        {(['faqs', 'reviews', 'contacts', 'users'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all tracking-wider uppercase ${
              activeTab === tab
                ? 'bg-[var(--color-palette-maroon)] text-[var(--color-palette-cream)] shadow-md shadow-[var(--color-palette-maroon)]/10 scale-[1.02]'
                : 'text-[var(--color-palette-brown)]/80 hover:text-[var(--color-palette-maroon)] hover:bg-[var(--color-palette-beige)]/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </header>

    {/* Primary View Switching Section */}
    <main className="max-w-7xl mx-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="w-8 h-8 border-4 border-[var(--color-palette-maroon)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-[var(--color-palette-maroon)] animate-pulse uppercase">
            Loading datasets...
          </p>
        </div>
      ) : (
        <div className="bg-white/80 border border-[var(--color-palette-beige)]/30 rounded-2xl shadow-xl shadow-[var(--color-palette-brown)]/[0.02] backdrop-blur-md p-6 md:p-8">
                    {/* VIEW A: FAQs Panel Layout */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="border-b border-[var(--color-palette-beige)]/30 pb-3">
                <h2 className="text-xl font-bold text-[var(--color-palette-maroon)]">FAQ Response Matrix</h2>
                <p className="text-xs text-[var(--color-palette-brown)]/60 mt-0.5">Publish or adjust external documentation entries.</p>
              </div>
              
              {faqs.length === 0 ? (
                <p className="text-sm text-center py-12 text-[var(--color-palette-brown)]/50 italic bg-[var(--color-palette-beige)]/10 rounded-xl border border-dashed border-[var(--color-palette-beige)]/40">No FAQ items found.</p>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq._id} className="bg-[var(--color-palette-cream)]/15 p-6 rounded-2xl border border-[var(--color-palette-beige)]/30 flex flex-col md:flex-row gap-6 items-start hover:border-[var(--color-palette-beige)] transition-colors">
                      <div className="flex-1 space-y-3">
                        <div>
                          <span className="text-[10px] font-extrabold tracking-wider text-[var(--color-palette-maroon)] uppercase bg-[var(--color-palette-maroon)]/5 px-2 py-0.5 rounded">Question Reference</span>
                          <p className="text-base font-semibold text-[var(--color-palette-brown)] mt-1.5 leading-relaxed">&ldquo;{faq.question}&rdquo;</p>
                        </div>
                        {faq.answer && (
                          <div className="text-xs bg-[var(--color-palette-cream)]/40 p-4 rounded-xl border border-[var(--color-palette-beige)]/40 leading-relaxed shadow-sm">
                            <span className="font-extrabold text-[var(--color-palette-maroon)] block mb-1 uppercase tracking-wider text-[10px]">Current Public Answer</span>
                            <p className="text-[var(--color-palette-brown)]/90 font-medium">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full md:w-80 flex flex-col gap-2.5">
                        <textarea
                          placeholder="Type answer text to post live..."
                          rows={3}
                          value={answers[faq._id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [faq._id]: e.target.value })}
                          className="w-full p-3 text-xs font-medium rounded-xl bg-white text-[var(--color-palette-brown)] border border-[var(--color-palette-beige)]/60 placeholder-[var(--color-palette-brown)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-palette-maroon)]/20 focus:border-[var(--color-palette-maroon)] transition-all resize-none shadow-inner"
                        />
                        <button
                          onClick={() => handlePublishAnswer(faq._id)}
                          disabled={submittingId === faq._id}
                          className="bg-[var(--color-palette-maroon)] text-[var(--color-palette-cream)] py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md shadow-[var(--color-palette-maroon)]/10 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none uppercase"
                        >
                          {faq.answer ? 'Update Answer' : 'Publish Answer'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
                    {/* VIEW B: Client Product/Service Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="border-b border-[var(--color-palette-beige)]/30 pb-3">
                <h2 className="text-xl font-bold text-[var(--color-palette-maroon)]">Client Feedback & Ratings</h2>
                <p className="text-xs text-[var(--color-palette-brown)]/60 mt-0.5">Historical verification of satisfaction metrics.</p>
              </div>

              {reviews.length === 0 ? (
                <p className="text-sm text-center py-12 text-[var(--color-palette-brown)]/50 italic bg-[var(--color-palette-beige)]/10 rounded-xl border border-dashed border-[var(--color-palette-beige)]/40">No client reviews processed.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-[var(--color-palette-cream)]/10 p-5 rounded-2xl border border-[var(--color-palette-beige)]/30 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-center justify-between mb-3 border-b border-[var(--color-palette-beige)]/20 pb-2">
                          <span className="text-xs font-bold text-[var(--color-palette-maroon)] tracking-wide">{review.reviewerName}</span>
                          <span className="text-xs text-amber-600 font-black tracking-widest bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </span>
                        </div>
                        <p className="text-xs font-medium italic text-[var(--color-palette-brown)]/90 bg-white/60 p-3 rounded-xl border border-[var(--color-palette-beige)]/20 leading-relaxed">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      </div>
                      <span className="text-[10px] text-[var(--color-palette-brown)]/50 block mt-4 text-right font-semibold">
                        Posted: {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
                    {/* VIEW C: Client Contact Submissions */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="border-b border-[var(--color-palette-beige)]/30 pb-3">
                <h2 className="text-xl font-bold text-[var(--color-palette-maroon)]">Incoming Contact Submissions</h2>
                <p className="text-xs text-[var(--color-palette-brown)]/60 mt-0.5">Direct communication entries submitted via public channels.</p>
              </div>

              {contacts.length === 0 ? (
                <p className="text-sm text-center py-12 text-[var(--color-palette-brown)]/50 italic bg-[var(--color-palette-beige)]/10 rounded-xl border border-dashed border-[var(--color-palette-beige)]/40">No contact requests present.</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((msg) => (
                    <div key={msg._id} className="bg-[var(--color-palette-cream)]/10 p-5 rounded-2xl border border-[var(--color-palette-beige)]/30 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-palette-beige)]/20 pb-2.5">
                        <div>
                          <h4 className="text-sm font-bold text-[var(--color-palette-maroon)] tracking-wide">{msg.subject}</h4>
                          <p className="text-xs text-[var(--color-palette-brown)]/70 mt-0.5 font-medium">
                            By <span className="font-semibold text-[var(--color-palette-brown)]">{msg.name}</span> &middot; <span className="underline decoration-[var(--color-palette-beige)]">{msg.email}</span>
                          </p>
                        </div>
                        <span className="text-[10px] text-[var(--color-palette-brown)]/50 font-bold bg-[var(--color-palette-beige)]/20 px-2 py-0.5 rounded-md">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-palette-brown)]/90 leading-relaxed bg-white/50 p-4 rounded-xl border border-[var(--color-palette-beige)]/20 shadow-inner whitespace-pre-line font-medium">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
                    {/* VIEW D: Master System Accounts Panel */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="border-b border-[var(--color-palette-beige)]/30 pb-3">
                <h2 className="text-xl font-bold text-[var(--color-palette-maroon)]">Master Accounts Registry</h2>
                <p className="text-xs text-[var(--color-palette-brown)]/60 mt-0.5">System access logs and structural privileges control.</p>
              </div>

              {users.length === 0 ? (
                <p className="text-sm text-center py-12 text-[var(--color-palette-brown)]/50 italic bg-[var(--color-palette-beige)]/10 rounded-xl border border-dashed border-[var(--color-palette-beige)]/40">No user metrics gathered.</p>
              ) : (
                <div className="overflow-hidden border border-[var(--color-palette-beige)]/30 rounded-xl bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[var(--color-palette-cream)]/30 border-b border-[var(--color-palette-beige)]/40 text-[var(--color-palette-maroon)] font-bold uppercase tracking-wider">
                          <th className="py-3.5 px-4 font-extrabold">Name</th>
                          <th className="py-3.5 px-4 font-extrabold">Email Address</th>
                          <th className="py-3.5 px-4 font-extrabold">Authorization Role</th>
                          <th className="py-3.5 px-4 font-extrabold">Created On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-palette-beige)]/20 font-medium text-[var(--color-palette-brown)]/90">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-[var(--color-palette-cream)]/10 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-[var(--color-palette-brown)]">{u.name}</td>
                            <td className="py-3.5 px-4 tracking-wide font-mono text-[var(--color-palette-brown)]/80">{u.email}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                u.role === 'admin'
                                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                                  : 'bg-stone-50 text-stone-600 border-stone-200'
                              }`}>
                                {u.role || 'customer'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[var(--color-palette-brown)]/60 font-semibold">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  </div>
);

        }