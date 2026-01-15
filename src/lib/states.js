"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function States() {
  const [auth, setAuth] = useState(false);

  return { auth, setAuth };
}

export const pathData = usePathname();

