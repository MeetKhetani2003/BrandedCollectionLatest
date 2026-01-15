"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/Layouts/NavBar";
import Footer from "@/components/Layouts/Footer";

export default function LayoutControl({ children }) {
  const pathname = usePathname();

  // Hide Layout on matching paths
  const hideLayout = pathname.startsWith("/auth");

  return (
    <>
      {!hideLayout && <NavBar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
