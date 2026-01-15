"use client";
import { useEffect } from "react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { cookies } from "next/headers";

export default async function ProtectedPage({ children }) {
  const router = useRouter();
  const cookieStore = await cookies(); // <-- NEW REQUIRED
  const token = cookieStore.get("auth")?.value;
  useEffect(() => {
    if (!token) {
      router.push("/auth");
    }
  }, []);

  return children;
}
