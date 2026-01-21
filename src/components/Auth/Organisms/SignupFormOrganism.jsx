"use client";
import React, { useState } from "react";
import InputGroupMolecule from "../moleules/InputGroupMolecule";
import GoogleSignupButton from "@/components/authButtons/GoogleSignup";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const SignupFormOrganism = ({ switchToLogin }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.email || !form.password) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          username: `${form.firstName} ${form.lastName}`,
          provider: "local",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed.");
      } else {
        toast.success("Signup successful 🎉");
        // router.push("/");
      }
    } catch (error) {
      toast.error("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-8 bg-gradient-to-br from-white to-[#FAF0E6] shadow-2xl rounded-lg space-y-6 border border-[#DEB887]"
    >
      <h2 className="text-2xl font-bold text-center text-[#654321]">
        Create an Account
      </h2>

      <InputGroupMolecule
        label="First Name"
        placeholder="John"
        required
        value={form.firstName}
        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
      />

      <InputGroupMolecule
        label="Last Name"
        placeholder="Doe"
        required
        value={form.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
      />

      <InputGroupMolecule
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <InputGroupMolecule
        label="Password"
        type="password"
        placeholder="••••••••"
        required
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button
        disabled={loading}
        type="submit"
        className={`w-full ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        } bg-gradient-to-r from-[#DEB887] to-[#D2B48C] hover:from-[#D2B48C] hover:to-[#654321] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95`}
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      <div className="flex items-center my-4">
        <hr className="flex-1 border-[#DEB887]" />
        <span className="px-3 text-[#654321] text-sm">or</span>
        <hr className="flex-1 border-[#DEB887]" />
      </div>

      <GoogleSignupButton
        onSuccess={() => switchToLogin()}
        onError={(err) => toast.error(err)}
      />
      <p className="text-center text-sm text-[#654321]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={switchToLogin}
          className="text-[#DEB887] hover:text-[#654321] font-medium transition-colors duration-300 underline underline-offset-4"
        >
          Login
        </button>
      </p>
    </form>
  );
};

export default SignupFormOrganism;
