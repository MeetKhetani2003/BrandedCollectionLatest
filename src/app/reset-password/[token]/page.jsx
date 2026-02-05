"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const PALETTE = {
  BACKGROUND: "bg-[#fff9f4]",
  BORDER: "border-[#deb887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321]",
  HOVER: "hover:bg-[#deb887]",
};

export default function ResetPassword() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ type: "error", msg: "Passwords do not match" });
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", msg: "Success! Redirecting to login..." });
        setTimeout(() => router.push("/auth"), 3000);
      } else {
        setStatus({ type: "error", msg: data.message });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${PALETTE.BACKGROUND} px-4`}
    >
      <div
        className={`max-w-md w-full p-8 bg-white border ${PALETTE.BORDER} rounded-2xl shadow-sm`}
      >
        <h2 className={`text-2xl font-bold text-center ${PALETTE.TEXT} mb-6`}>
          Set New Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${PALETTE.TEXT} mb-1`}>
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              className={`w-full px-4 py-2 border ${PALETTE.BORDER} rounded-lg focus:ring-2 focus:ring-[#deb887] outline-none bg-transparent`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${PALETTE.TEXT} mb-1`}>
              Confirm Password
            </label>
            <input
              type="password"
              required
              className={`w-full px-4 py-2 border ${PALETTE.BORDER} rounded-lg focus:ring-2 focus:ring-[#deb887] outline-none bg-transparent`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 ${PALETTE.ACCENT} text-white rounded-lg font-semibold ${PALETTE.HOVER} transition-colors duration-200 disabled:bg-gray-400 mt-2`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {status.msg && (
          <div
            className={`mt-4 p-3 rounded-md text-sm text-center  ${
              status.type === "success"
                ? "bg-green-50 text-green-700 "
                : "bg-red-50 text-red-700 "
            }`}
          >
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}
