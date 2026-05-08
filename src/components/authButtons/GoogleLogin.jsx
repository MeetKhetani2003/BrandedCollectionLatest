"use client";

import { useUserStore } from "@/store/useUserStore";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

export default function GoogleLoginButton({
  onSuccess,
  onError,
  className = "",
}) {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        toast.error("No credential received.");
        onError?.("No credential received.");
        return;
      }

      const googleUser = jwtDecode(credentialResponse.credential);

      const res = await fetch("/api/user/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: googleUser.email,
          googleId: googleUser.sub,
          provider: "google",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Google login failed.");
        onError?.(data.message || "Google login failed.");
        return;
      }

      // Refresh user store
      await useUserStore.getState().getUser();

      toast.success("Logged in successfully 🎉");

      onSuccess?.();

      // Redirect
      window.location.assign("/");
    } catch (error) {
      console.error("Google Login Error:", error);

      toast.error(
        error?.message || "Something went wrong during Google login.",
      );

      onError?.(error?.message || "Something went wrong during Google login.");
    }
  };

  return (
    <div className={`flex justify-center w-full ${className}`}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => {
          toast.error("Google login failed.");
          onError?.("Google login failed.");
        }}
        useOneTap={false}
        theme="outline"
        size="large"
        text="signin_with"
        shape="pill"
      />
    </div>
  );
}
