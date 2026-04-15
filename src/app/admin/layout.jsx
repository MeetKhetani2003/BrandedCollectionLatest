"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      router.replace(pathname.replace("/admin", "/operator"));
    }
  }, [pathname, router]);

  return <>{children}</>;
}
