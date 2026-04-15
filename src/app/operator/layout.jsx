"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/SideBar";

const OPERATOR_STORAGE_KEY = "operator-auth";

function isOperatorLoggedIn() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(OPERATOR_STORAGE_KEY) === "true";
}

export default function OperatorLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!isOperatorLoggedIn()) {
      router.replace("/operator-login?from=/operator");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#fdf7f2] text-[#4a2e1f]">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
