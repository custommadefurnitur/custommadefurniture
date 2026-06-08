// src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  // 1. Initialize State Vectors
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Submit Request Payload to Backend Handler
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "An expected error surfaced. Please try again.");
        return;
      }

      // 3. Inform User and Clear Entry Channels
      setSuccessMessage(result.message || "Recovery path processed successfully!");
      setEmail("");

    } catch (error) {
      setErrorMessage("Network interface timeout error. Please execute request again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-palette-beige/10 flex items-center justify-center p-6 font-[Poppins]">
      <div className="w-full max-w-[420px] bg-white border border-palette-beige p-8 rounded-2xl shadow-sm">
        
        {/* Header Block Content */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-palette-brown tracking-tight">Recover Password</h1>
          <p className="text-xs text-gray-500 font-[Inter] mt-1.5">
            Provide your registered email. If it exists in our system, we will send a time-sensitive recovery link.
          </p>
        </div>

        {/* Informative Action Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl font-[Inter]">
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl font-[Inter]">
            ✅ {successMessage}
          </div>
        )}

        {/* Input Pipeline Layout Elements */}
        <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-palette-brown uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-palette-beige bg-white text-sm font-[Inter] focus:outline-none focus:border-palette-brown transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full py-3 mt-2 bg-palette-brown text-white font-semibold text-sm rounded-xl hover:bg-opacity-95 transition disabled:bg-palette-brown/50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Generating configuration link..." : "Send Reset Link"}
          </button>
        </form>

        {/* Bottom Navigation Fallbacks */}
        <div className="text-center mt-6 pt-4 border-t border-palette-beige/30">
          <p className="text-xs text-gray-500 font-[Inter]">
            Remember your access string?{" "}
            <Link href="/login" className="font-bold text-palette-brown underline hover:text-black" aria-label="navigate back to login page">
              Back to login
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
