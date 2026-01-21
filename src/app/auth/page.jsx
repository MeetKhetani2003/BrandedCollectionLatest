"use client";
import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import LoginFormOrganism from "@/components/Auth/Organisms/LoginFormOrganism";
import SignupFormOrganism from "@/components/Auth/Organisms/SignupFormOrganism";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const tabRef = useRef(null);

  useEffect(() => {
    // Initial load animation: Subtle wave effect on background
    gsap.fromTo(
      containerRef.current,
      { backgroundPosition: "0% 50%" },
      {
        backgroundPosition: "100% 50%",
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      },
    );

    // Tab switch animation with Timeline for fluidity
    const tl = gsap.timeline();
    tl.to(containerRef.current, {
      background:
        activeTab === "login"
          ? "linear-gradient(135deg, #F5F5DC 0%, #FAF0E6 100%)"
          : "linear-gradient(135deg, #FAF0E6 0%, #F5F5DC 100%)",
      duration: 0.8,
      ease: "power2.out",
    })
      .to(
        tabRef.current.children,
        {
          scale: 0.95,
          duration: 0.2,
          ease: "power2.inOut",
        },
        "-=0.6",
      )
      .to(
        tabRef.current.children,
        {
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)",
        },
        "-=0.4",
      )
      .fromTo(
        formRef.current,
        { opacity: 0, x: activeTab === "login" ? -100 : 100, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "power2.out" },
        "-=0.5",
      );
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5DC] to-[#FAF0E6] transition-all duration-800"
      style={{ backgroundSize: "200% 200%" }} // For wave effect
    >
      <div className="w-full max-w-lg">
        <div
          ref={tabRef}
          className="flex mb-6 bg-gradient-to-r from-white to-[#FAF0E6] rounded-lg shadow-lg border border-[#DEB887] overflow-hidden"
        >
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-all duration-500 ${
              activeTab === "login"
                ? "bg-gradient-to-r from-[#DEB887] to-[#D2B48C] text-white shadow-md"
                : "bg-white text-[#654321] hover:bg-[#FAF0E6] hover:scale-105"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-all duration-500 ${
              activeTab === "signup"
                ? "bg-gradient-to-r from-[#DEB887] to-[#D2B48C] text-white shadow-md"
                : "bg-white text-[#654321] hover:bg-[#FAF0E6] hover:scale-105"
            }`}
          >
            Sign Up
          </button>
        </div>
        <div ref={formRef}>
          {activeTab === "login" ? (
            <LoginFormOrganism switchToSignup={() => setActiveTab("signup")} />
          ) : (
            <SignupFormOrganism switchToLogin={() => setActiveTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
