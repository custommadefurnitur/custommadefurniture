"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa6";
import { useRouter } from "next/navigation"; // Changed from redirect

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const router = useRouter(); // Initialize the router

  // 1. Core State Triggers (Added proper type inference and defaults)
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 2. Submit Execution Pipeline handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    // Simple Front-End Validation Guard Check
    if (rating === 0) {
      setGeneralError("Please select a star rating evaluation before submitting.");
      setIsSubmitting(false);
      return;
    }

    // Flag to handle programmatic redirection outside the try/catch block
    let shouldRedirect = false;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setGeneralError("You must be logged in and verified via OTP to submit a product review.");
          shouldRedirect = true;
        } else if (result.errors) {
          setFieldErrors(result.errors);
        } else {
          setGeneralError(result.message || "An unexpected processing error surfaced.");
        }
        setIsSubmitting(false);
        return;
      }

      // 3. Clear form workspace inputs on database success write loop
      // Inside your catch response conditional branch:
        setSuccessMessage(result.message || "Thank you! Your feedback has been recorded.");
        setRating(0);
        setComment("");

        router.refresh(); // 👈 Add this line to force server state sync

    } catch (error) {
      setGeneralError("Network connection latency error. Please execute submission again.");
    } finally {
      setIsSubmitting(false);
      
      // Execute the redirect safely after the try/catch block completes
      if (shouldRedirect) {
        setTimeout(() => router.push("/login"), 1000);
      }
    }
  };

  return (
    <div className="w-full bg-white border border-[#D4BEA9] p-5 sm:p-7 rounded-2xl shadow-sm">
      <h3 className="text-lg font-bold text-[#4C1A17] font-[Poppins] mb-1">
        Customer Review
      </h3>
      <p className="text-xs text-gray-500 font-[Inter] mb-5">
        Share your evaluation regarding material craft profile specs and alignment.
      </p>

      {/* State Notification Banners */}
      {generalError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl font-[Inter]">
          ⚠️ {generalError}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-[#700635] text-xs font-semibold rounded-xl font-[Inter]">
          ✅ {successMessage}
        </div>
      )}

      <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 font-[Poppins]">
        
        {/* Interactive Star Selection Vector Nodes row */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#4C1A17] uppercase tracking-wider mb-1">
            Product Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isActive = starValue <= (hoverRating || rating);
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => {
                    setRating(starValue);
                    setGeneralError("");
                  }}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-xl sm:text-2xl transition-transform duration-100 hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${starValue} out of 5 stars`}
                >
                  <FaStar 
                    className={`transition-colors duration-150 ${
                      isActive ? "text-amber-400" : "text-gray-200"
                    }`} 
                  />
                </button>
              );
            })}
            {rating > 0 && (
              <span className="text-xs text-gray-500 font-[Inter] font-medium ml-2">
                ({rating} / 5 Stars)
              </span>
            )}
          </div>
          {fieldErrors.rating && (
            <span className="text-[11px] text-red-600 font-[Inter] mt-0.5">{fieldErrors.rating}</span>
          )}
        </div>

        {/* Text Area Evaluation Block */}
        <div className="flex flex-col gap-1">
          <label htmlFor="review-comment" className="text-xs font-bold text-[#4C1A17] uppercase tracking-wider">
            Review Details
          </label>
          <textarea
            id="review-comment"
            name="comment"
            rows={4}
            required
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (fieldErrors.comment) setFieldErrors({ ...fieldErrors, comment: [] });
            }}
            placeholder="How did the layout profiling turn out? Mention wood density, sizing accuracy..."
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#D4BEA9] bg-white text-sm font-[Inter] focus:outline-none focus:border-[#700635] transition resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            {fieldErrors.comment ? (
              <span className="text-[11px] text-red-600 font-[Inter]">{fieldErrors.comment}</span>
            ) : (
              <span className="text-[10px] text-gray-400 font-[Inter] ml-auto">
                {comment.length} / 1000 characters
              </span>
            )}
          </div>
        </div>

        {/* Action Submit Node */}
        <button
          type="submit"
          disabled={isSubmitting || comment.length < 10}
          className="w-full py-3 bg-[#700635] text-white font-semibold text-sm rounded-xl hover:bg-[#4C1A17] transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm mt-1"
        >
          {isSubmitting ? "Publishing Feed Details..." : "Post Review"}
        </button>
      </form>
    </div>
  );
}
