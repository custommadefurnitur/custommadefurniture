// src/app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Initialise State Fields
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(() => {
    const errorParam = searchParams.get("error");
    if (errorParam?.includes("UNVERIFIED_ACCOUNT")) {
      return "Your account is not verified yet. Redirecting you to the verification screen...";
    }
    return errorParam ?? "";
  });
  const [infoMessage, setInfoMessage] = useState(() => {
    return searchParams.get("verified") === "true"
      ? "Account successfully activated! Please fill in your password to log in."
      : "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
    setInfoMessage("");
  };

  // 2. Submit Input Metadata via NextAuth Sign-In Methods
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      // 1. Check account verification status before signing in
      const preCheckResponse = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const preCheckResult = await preCheckResponse.json();
      console.log("🔍 Pre-check response:", preCheckResult);

      if (preCheckResponse.ok) {
        setErrorMessage("Your account is not verified. Verification code sent to your email.");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
        return;
      }

      if (preCheckResult.message?.includes("already verified")) {
        console.log("✅ Account already verified, now signing in");
      } else if (preCheckResponse.status === 404) {
        setErrorMessage("No account found with this email address.");
        setIsSubmitting(false);
        return;
      } else {
        setErrorMessage(preCheckResult.message || "Unable to verify account status. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // 2. Verified account path: proceed with regular sign-in
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      console.log("🔑 SignIn Result:", JSON.stringify(result, null, 2));

      if (!result?.ok) {
        console.error("❌ Login error result:", result);

        let errorMsg = "Invalid email or password. Please try again.";
        if (result?.error) {
          errorMsg = result.error;
        } else if (result?.status === 401) {
          errorMsg = "Invalid email or password. Please try again.";
        } else if (result?.status === 404) {
          errorMsg = "Account not found.";
        }

        if (errorMsg.includes("No account found")) {
          errorMsg = "No account found with this email address.";
        } else if (errorMsg.includes("Invalid credentials")) {
          errorMsg = "Invalid email or password.";
        } else if (errorMsg === "CredentialsSignin") {
          errorMsg = "Invalid email or password. Please try again.";
        } else if (errorMsg === "Malformed email or password structure") {
          errorMsg = "Please enter a valid email and password.";
        }

        setErrorMessage(errorMsg);
        setIsSubmitting(false);
        return;
      }

      if (result?.ok) {
        console.log("✅ Login successful! Redirecting to dashboard...");
        router.push("/");
        router.refresh();
      }
    } catch (loginError) {
      console.error("❌ Login exception:", loginError);
      setErrorMessage("System error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-palette-beige/10 flex items-center justify-center p-6 font-[Poppins]">
      <div className="w-full max-w-[420px] bg-white border border-palette-beige p-8 rounded-2xl shadow-sm">
        
        {/* Header Block Typography */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-palette-brown tracking-tight">Sign In</h1>
          <p className="text-xs text-gray-500 font-[Inter] mt-1">
            Access your profile workspace to leave review evaluations and message custom design details.
          </p>
        </div>

        {/* Informative Visual Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl font-[Inter]">
            ⚠️ {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-xl font-[Inter]">
            ℹ️ {infoMessage}
          </div>
        )}

        {/* Interactive Authentication Form Stack */}
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          
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
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center mb-0.5">
              <label className="text-xs font-bold text-palette-brown uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-palette-brown font-semibold underline hover:text-black font-[Inter]">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-palette-beige bg-white text-sm font-[Inter] focus:outline-none focus:border-palette-brown transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-2 bg-palette-brown text-white font-semibold text-sm rounded-xl hover:bg-opacity-95 transition disabled:bg-palette-brown/50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Authenticating Session..." : "Login"}
          </button>
        </form>

        {/* Footer Trailing Interlinks */}
        <div className="text-center mt-6 pt-4 border-t border-palette-beige/30">
          <p className="text-xs text-gray-500 font-[Inter]">
            New to our studio workspace?{" "}
            <Link href="/signup" className="font-bold text-palette-brown underline hover:text-black">
              Register here
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}

// Master component boundary wrapper to safeguard Next.js router compilation
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-palette-beige/10 flex items-center justify-center font-[Poppins] text-sm text-palette-brown">
        Loading login portal layout details...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
