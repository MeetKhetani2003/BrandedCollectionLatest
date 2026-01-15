"use client";

import AppInitializer from "@/components/AppInitializer";
import LayoutControl from "@/app/ClientChildren";

export default function ClientBridge({ children }) {
  return (
    <>
      <AppInitializer />
      <LayoutControl>{children}</LayoutControl>
    </>
  );
}
