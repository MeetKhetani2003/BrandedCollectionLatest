"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Dashboard", href: "/admin" },
  { name: "Products", href: "/admin/products" },
  { name: "Users", href: "/admin/users" },
  { name: "Orders", href: "/admin/orders" },
  { name: "Coupons", href: "/admin/coupons" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-[#ead7c5]">
      {/* Logo */}
      <div className="px-6 py-5 text-xl font-bold text-[#4a2e1f] border-b border-[#ead7c5]">
        Admin Panel
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-1">
        {menu.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block rounded-lg px-4 py-2 text-sm font-medium transition
                ${
                  active
                    ? "bg-[#4a2e1f] text-white"
                    : "text-[#4a2e1f] hover:bg-[#fdf7f2]"
                }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
