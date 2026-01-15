"use client";
import React, { useState } from "react";
import InputGroupMolecule from "../moleules/InputGroupMolecule";
import GoogleLoginButton from "@/components/authButtons/GoogleLogin";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/useUserStore";

const LoginFormOrganism = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { getUser } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, provider: "local" }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed.");
      } else {
        // 🔥 THIS LINE FIXES EVERYTHING
        await getUser();

        router.push("/");
        window.location.reload();
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  const handleGoogleSuccess = () => router.push("/");

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-8 bg-gradient-to-br from-white to-[#FAF0E6] shadow-2xl rounded-lg space-y-6 border border-[#DEB887]"
    >
      <h2 className="text-2xl font-bold text-center text-[#654321]">
        Sign In to Store
      </h2>

      <InputGroupMolecule
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <InputGroupMolecule
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        disabled={loading}
        type="submit"
        className={`w-full ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        } bg-gradient-to-r from-[#DEB887] to-[#D2B48C] hover:from-[#D2B48C] hover:to-[#654321] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="flex items-center my-4">
        <hr className="flex-1 border-[#DEB887]" />
        <span className="px-3 text-[#654321] text-sm">or</span>
        <hr className="flex-1 border-[#DEB887]" />
      </div>

      <GoogleLoginButton onSuccess={handleGoogleSuccess} />

      <p className="text-center text-sm text-[#654321]">
        Don’t have an account?{" "}
        <a
          href="#"
          className="text-[#DEB887] hover:text-[#654321] font-medium transition-colors duration-300"
        >
          Sign Up
        </a>
      </p>
    </form>
  );
};

export default LoginFormOrganism;
