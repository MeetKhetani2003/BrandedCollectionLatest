"use client";
import { useUserStore } from "@/store/useUserStore";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

export default function GoogleLoginButton({ onSuccess, onError, className }) {
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: googleUser.email,
          googleId: googleUser.sub,
          provider: "google",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed.");
        onError?.(data.message || "Login failed.");
        return;
      }

      if (res.ok) {
        await useUserStore.getState().getUser();
        toast.success("Logged in successfully 🎉");
        onSuccess?.();
        // window.location.reload();
      }
    } catch (error) {
      toast.error(error.message);
      onError?.(error.message);
    }
  };

  return (
    <button className={`flex items-center justify-center  w-full ${className}`}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => {
          toast.error("Google login failed.");
          onError?.("Google login failed.");
        }}
        style={{ display: "none" }}
      />
    </button>
  );
}
