// src/app/verify-otp/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Next.js requires useSearchParams hooks to be wrapped inside a Suspense perimeter
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Initialize Contextual Forms & Feedback Metrics State
  const [email] = useState(() => searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // 2. Submit Transactional Data to Verification API Route
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Invalid or expired security code.");
        setIsSubmitting(false);
        return;
      }

      // 3. Execution Pipeline Transition: Clear states and redirect user to log in
      setSuccessMessage(result.message || "Verification successful!");
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 2000);

    } catch {
      setErrorMessage("Network interface timeout error. Please attempt submission again.");
      setIsSubmitting(false);
    }
  };

  // 4. Resend OTP Handler: Request a fresh verification code
  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Failed to resend verification code. Please try again.");
        setIsResending(false);
        return;
      }

      setSuccessMessage(result.message || "Verification code has been resent to your email.");
      setOtp(""); // Clear the input field
      setIsResending(false);

    } catch {
      setErrorMessage("Network error while resending code. Please try again.");
      setIsResending(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-palette-beige/10 flex items-center justify-center p-6 font-[Poppins]">
      <div className="w-full max-w-[420px] bg-white border border-palette-beige p-8 rounded-2xl shadow-sm">
        
        {/* Header Content Blocks */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-palette-brown tracking-tight">Verify Account</h1>
          <p className="text-xs text-gray-500 font-[Inter] mt-1.5">
            We have transmitted a secure 6-digit access code to <span className="font-semibold text-palette-brown break-all">{email || "your inbox"} </span>.
          </p>
          <p className="text-xs text-gray-600 font-[Inter]">
            Click menu in gmail ,then click spam to check otp
          </p>
        </div>

        {/* Dynamic Alert Banner Blocks */}
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

        {/* Input Interactive Execution Nodes */}
        <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-palette-brown uppercase tracking-wider text-center mb-1">
              6-Digit Security PIN Code
            </label>
            <input
              type="text"
              name="otp"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Filter numerical string digits exclusively
              placeholder="000000"
              className="w-full px-4 py-3 text-center rounded-xl border-2 border-palette-beige bg-white text-lg font-bold font-[Inter] tracking-[0.5em] placeholder:tracking-normal focus:outline-none focus:border-palette-brown transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="w-full py-3 mt-2 bg-palette-brown text-white font-semibold text-sm rounded-xl hover:bg-opacity-95 transition disabled:bg-palette-brown/40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Validating security sequence..." : "Activate Account"}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="mt-6 pt-4 border-t border-palette-beige/30 flex flex-col gap-3">
          <p className="text-xs text-gray-500 font-[Inter] text-center">
            Didn't receive the code?
          </p>
          <button
            type="button"
            disabled={isResending}
            onClick={handleResendOtp}
            className="w-full py-2.5 bg-palette-beige/20 text-palette-brown font-semibold text-sm rounded-xl hover:bg-palette-beige/40 transition disabled:bg-palette-beige/10 disabled:cursor-not-allowed"
          >
            {isResending ? "Sending new code..." : "Resend Verification Code"}
          </button>

          <p className="text-xs text-gray-500 font-[Inter] text-center mt-2">
            Need a different email account address?{" "}
            <a href="/signup" className="font-bold text-palette-brown underline hover:text-black">
              Sign up again
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}

// Master component boundary wrapper to safeguard Next.js router compilation
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-palette-beige/10 flex items-center justify-center font-[Poppins] text-sm text-palette-brown">
        Loading verification workspace layout details...
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
