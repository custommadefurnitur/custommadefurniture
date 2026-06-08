// src/app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  
  // 1. Core State Handlers
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update localized field changes instantly
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Wipe validation error traces when user adjusts typing path
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: [] });
    }
    setGeneralError("");
  };

  // 2. Submit Request Payload to Backend Handler
  const handleFormSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          // Map backend structural Zod validation error matrices down to input slots
          setFieldErrors(result.errors);
        } else {
          setGeneralError(result.message || "An expected error occurred.");
        }
        return;
      }

      // 3. Success Redirection Route: Route directly into OTP Verification Interface
      // We pass the email identifier inside search parameters to make input verification seamless
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);

    } catch (error) {
      setGeneralError("Network latency breakdown encountered. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-palette-beige/10 flex items-center justify-center p-6 font-[Poppins]">
      <div className="w-full max-w-105 bg-white border border-palette-beige p-8 rounded-2xl shadow-sm">
        
        {/* Header Block Typography Elements */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-palette-brown tracking-tight">Create Account</h1>
          <p className="text-xs text-gray-500 font-[Inter] mt-1">
            Unlock credentials to submit design feedback and project specifications.
          </p>
        </div>

        {/* Universal Feedback Error Alert Banners */}
        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl font-[Inter]">
            ⚠️ {generalError}
          </div>
        )}

        {/* Input Form Submission Pipeline */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          
          {/* Field: Client Username */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-palette-brown uppercase tracking-wider">Your Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-palette-beige bg-white text-sm font-[Inter] focus:outline-none focus:border-palette-brown transition"
            />
            {fieldErrors.name && (
              <span className="text-[11px] text-red-600 font-[Inter] mt-0.5">{fieldErrors.name[0]}</span>
            )}
          </div>

          {/* Field: Electronic Mail Identification String */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-palette-brown uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-palette-beige bg-white text-sm font-[Inter] focus:outline-none focus:border-palette-brown transition"
            />
            {fieldErrors.email && (
              <span className="text-[11px] text-red-600 font-[Inter] mt-0.5">{fieldErrors.email[0]}</span>
            )}
          </div>

          {/* Field: Passphrase Token String */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-palette-brown uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-palette-beige bg-white text-sm font-[Inter] focus:outline-none focus:border-palette-brown transition"
            />
            {fieldErrors.password && (
              <span className="text-[11px] text-red-600 font-[Inter] mt-0.5">{fieldErrors.password[0]}</span>
            )}
          </div>

          {/* Submission Execution Node */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-2 bg-palette-brown text-white font-semibold text-sm rounded-xl hover:bg-opacity-95 transition disabled:bg-palette-brown/50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Initiating Registration..." : "Sign Up"}
          </button>
        </form>

        {/* Footer Navigation Interlinks Contexts */}
        <div className="text-center mt-6 pt-4 border-t border-palette-beige/30">
          <p className="text-xs text-gray-500 font-[Inter]">
            Already have an active profile?{" "}
            <Link href="/login" className="font-bold text-palette-brown underline hover:text-black" aria-label="Login button">
              Login here
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
