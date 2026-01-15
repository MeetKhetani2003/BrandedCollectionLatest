import AdminSidebar from "@/components/admin/SideBar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#fdf7f2] text-[#4a2e1f]">
      <AdminSidebar />

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
