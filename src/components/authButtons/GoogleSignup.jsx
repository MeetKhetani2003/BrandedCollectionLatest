"use client";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

export default function GoogleSignupButton({ onSuccess, onError, className }) {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        toast.error("No credential received.");
        onError?.("No credential received.");
        return;
      }

      const googleUser = jwtDecode(credentialResponse.credential);

      const userData = {
        email: googleUser.email,
        firstName: googleUser.given_name || "",
        lastName: googleUser.family_name || "",
        googleId: googleUser.sub,
        provider: "google",
      };

      const res = await fetch("/api/user/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Signup successful 🎉");
        onSuccess?.(data);
      } else {
        toast.error(data.message || "Signup failed.");
        onError?.(data.message || "Signup failed.");
      }
    } catch (error) {
      toast.error(error.message);
      onError?.(error.message);
    }
  };

  return (
    <button className={`flex items-center justify-center w-full  ${className}`}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => {
          toast.error("Google sign-in failed.");
          onError?.("Google sign-in failed.");
        }}
        style={{ display: "none" }}
      />
    </button>
  );
}
