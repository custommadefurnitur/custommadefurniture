// src/app/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Initialise Component State Layers
  const [token] = useState(() => searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(() => {
    const tokenParam = searchParams.get("token");
    return tokenParam ? "" : "Critical Error: Missing or corrupted password recovery security token path link.";
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Process Change Request Pipeline Submission
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Front-end Equality Guard: Match password strings
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify characters and try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "An error occurred while resetting your password.");
        return;
      }

      setSuccessMessage(result.message || "Password reconfigured successfully!");
      
      // Route verified client back to login desk space after buffer window expires
      setTimeout(() => {
        router.push("/login");
      }, 2500);

    } catch {
      setErrorMessage("Network context latency error. Please execute connection request again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-palette-beige/10 flex items-center justify-center p-6 font-[Poppins]">
      <div className="w-full max-w-[420px] bg-white border border-palette-beige p-8 rounded-2xl shadow-sm">
        
        {/* Header Branding Panel */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-palette-brown tracking-tight">New Password</h1>
          <p className="text-xs text-gray-500 font-[Inter] mt-1.5">
            Configure a strong security string to overwrite your profile credentials.
          </p>
        </div>

        {/* Status Notification Boxes */}
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

        {/* Input Presentation Stack Blocks */}
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-palette-brown uppercase tracking-wider">New Password</label>
            <input
              type="password"
              name="password"
              required
              disabled={!token || isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-palette-beige bg-white text-sm font-[Inter] focus:outline-none focus:border-palette-brown transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-palette-brown uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              disabled={!token || isSubmitting}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-palette-beige bg-white text-sm font-[Inter] focus:outline-none focus:border-palette-brown transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !token || password.length < 6}
            className="w-full py-3 mt-2 bg-palette-brown text-white font-semibold text-sm rounded-xl hover:bg-opacity-95 transition disabled:bg-palette-brown/50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Overwriting password files..." : "Update Password"}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-palette-beige/30">
          <p className="text-xs text-gray-500 font-[Inter]">
            Need another recovery message?{" "}
            <Link href="/forgot-password" className="font-bold text-palette-brown underline hover:text-black" aria-label="Navigate to forgot password page">
              Try again
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}

// Master component boundary wrapper to safeguard Next.js router compilation
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-palette-beige/10 flex items-center justify-center font-[Poppins] text-sm text-palette-brown">
        Loading credential configuration interface...
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
