// src/app/contact/page.tsx
"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    
    // Simulate sending (replace with actual API call)
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900">Get in Touch</h1>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mt-4"></div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
        {/* Contact Form */}
        <div className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                placeholder="Tell us how we can help..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {status === "sending" ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : status === "success" ? (
                <span className="inline-flex items-center gap-2">
                  ✓ Sent Successfully!
                </span>
              ) : (
                "Send Message"
              )}
            </button>

            {status === "success" && (
              <div className="bg-green-50 border-2 border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm">
                Thank you! We'll get back to you soon.
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-xl text-sm">
                Something went wrong. Please try again.
              </div>
            )}
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Thanks for contacting */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-md">
                ✉️
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Thanks for Reaching Out!</h2>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                We appreciate you taking the time to contact us. Please use this form to tell us about mistakes/updates in the data or to add new family members. Please include the following in your message:
              </p>

              <ul className="space-y-2 text-sm">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span><strong>Person's full name or record number</strong> if your inquiry is about a specific individual</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span><strong>Type of correction or addition</strong> (name, date, relationship, etc.)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span><strong>Your relationship to the person</strong> (optional but helpful for context)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Additional info card */}
          <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-6 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Before You Send
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span>•</span>
                <span>Check if the person already exists using the Search feature</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Review the existing data to avoid duplicate submissions</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Have specific dates and names ready for accurate record keeping</span>
              </li>
            </ul>
          </div>

          {/* Privacy note */}
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-xs text-gray-600">
            <p>
              <strong>Privacy:</strong> Your contact information will only be used to respond to your inquiry and will not be shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}