"use client";
import { useState } from "react";

const PALETTE = {
  BACKGROUND: "bg-[#fff9f4]",
  BORDER: "border-[#deb887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321]",
  HOVER: "hover:bg-[#deb887]",
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${PALETTE.BACKGROUND} px-4`}
    >
      <div
        className={`max-w-md w-full space-y-8 p-8 bg-white border ${PALETTE.BORDER} rounded-2xl shadow-sm`}
      >
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${PALETTE.TEXT}`}>
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm opacity-80">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              required
              className={`w-full px-4 py-3 border ${PALETTE.BORDER} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#deb887] bg-transparent`}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-semibold text-white ${PALETTE.ACCENT} ${PALETTE.HOVER} transition-colors duration-200 disabled:bg-gray-400`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 border ${PALETTE.BORDER} bg-[#fffdfa] ${PALETTE.TEXT} text-sm rounded-md text-center`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
