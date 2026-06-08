// src/components/ContactForm.tsx
"use client";

import { useState } from "react";

export default function ContactForm() {
  // 1. Manage Form Values & Processing State States
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: [] });
    }
    setGeneralError("");
    setSuccessMessage("");
  };

  // 2. Transmit Form Objects out to backend Node Server endpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setFieldErrors(result.errors);
        } else {
          setGeneralError(result.message || "Something went wrong. Please try again.");
        }
        return;
      }

      // 3. Clear Input Values on database success
      setSuccessMessage(result.message || "Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });

    } catch (error) {
      setGeneralError("Network connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white border border-[#D4BEA9] p-6 sm:p-8 rounded-2xl shadow-sm">
      <h3 className="text-xl font-bold text-[#4C1A17] font-[Poppins] mb-1">Send a Message</h3>
      <p className="text-xs text-gray-500 font-[Inter] mb-6">Describe your design specs or sizing requirements.</p>

      {/* Dynamic System Notifications alerts */}
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-[Poppins]">
        
        {/* Name Fields */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#4C1A17] uppercase tracking-wider">Your Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            suppressHydrationWarning
            placeholder="John Doe"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#D4BEA9] bg-white text-sm font-[Inter] focus:outline-none focus:border-[#700635] transition"
          />
          {fieldErrors.name && (
            <span className="text-[11px] text-red-600 font-[Inter] mt-0.5">{fieldErrors.name[0]}</span>
          )}
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#4C1A17] uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#D4BEA9] bg-white text-sm font-[Inter] focus:outline-none focus:border-[#700635] transition"
          />
          {fieldErrors.email && (
            <span className="text-[11px] text-red-600 font-[Inter] mt-0.5">{fieldErrors.email[0]}</span>
          )}
        </div>

        {/* Topic Subject */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#4C1A17] uppercase tracking-wider">Subject</label>
          <input
            type="text"
            name="subject"
            required
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Dining Table Custom Order Sizing"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#D4BEA9] bg-white text-sm font-[Inter] focus:outline-none focus:border-[#700635] transition"
          />
          {fieldErrors.subject && (
            <span className="text-[11px] text-red-600 font-[Inter] mt-0.5">{fieldErrors.subject[0]}</span>
          )}
        </div>

        {/* Message Input Box */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-[#4C1A17] uppercase tracking-wider">Project Details</label>
          <textarea
            name="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Provide dimensions, preferred timber, and showroom custom requirements..."
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#D4BEA9] bg-white text-sm font-[Inter] focus:outline-none focus:border-[#700635] transition resize-none"
          />
          {fieldErrors.message && (
            <span className="text-[11px] text-red-600 font-[Inter] mt-0.5">{fieldErrors.message[0]}</span>
          )}
        </div>

        {/* Submit Interaction Node */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 mt-2 bg-[#700635] text-white font-semibold text-sm rounded-xl hover:bg-[#4C1A17] transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
        >
          {isSubmitting ? "Transmitting Specification Details..." : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}
