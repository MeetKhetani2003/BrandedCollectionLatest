"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const OPERATOR_STORAGE_KEY = "operator-auth";
const OPERATOR_USERNAME =
  process.env.NEXT_PUBLIC_OPERATOR_USERNAME ||
  process.env.NEXT_PUBLIC_ADMIN_USERNAME;
const OPERATOR_PASSWORD =
  process.env.NEXT_PUBLIC_OPERATOR_PASSWORD ||
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function OperatorLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/operator";

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    const valid =
      username === OPERATOR_USERNAME && password === OPERATOR_PASSWORD;

    if (!valid) {
      toast.error("Invalid operator credentials.");
      setLoading(false);
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(OPERATOR_STORAGE_KEY, "true");
    }

    toast.success("Operator login successful.");
    router.replace(redirectTo);
  };

  return (
    <div className="min-h-screen bg-[#fdf7f2] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#d3b88d] bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-[#4a2e1f] mb-2">
          Operator Login
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Sign in with the operator username and password stored in env.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#d3b88d] px-4 py-3 focus:border-[#4a2e1f] focus:outline-none"
              placeholder="operator username"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#d3b88d] px-4 py-3 focus:border-[#4a2e1f] focus:outline-none"
              placeholder="operator password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#4a2e1f] px-4 py-3 text-white transition hover:bg-[#3d2417] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
