"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { generateInvoice } from "@/utils/generateInvoice";
import { useCartStore } from "@/store/useCartStore";
import { useAppStore } from "@/store/useAppStore";
import WishlistCard from "@/components/Layouts/WhishListCard";

const PALETTE = {
  BG: "bg-[#fdf7f2]",
  CARD: "bg-white",
  TEXT: "text-[#4a2e1f]",
  MUTED: "text-gray-500",
  BORDER: "border-[#ead7c5]",
  ACCENT: "bg-[#4a2e1f] text-white",
};

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openOrders, setOpenOrders] = useState({});

  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const toggleOrder = (id) => {
    setOpenOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const saveName = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Update failed");
        return;
      }

      setUser((prev) => ({
        ...prev,
        firstName,
        lastName,
      }));

      setEditingName(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const downloadInvoice = async (order) => {
    try {
      const pdfBytes = await generateInvoice(order);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${order._id}.pdf`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to generate invoice");
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();

        if (!data.success) {
          toast.error("Please login");
          return;
        }

        setUser(data.user);
        setFirstName(data.user.firstName || "");
        setLastName(data.user.lastName || "");
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    // window.location.reload();
    fetchProfile();
  }, []);
  // useEffect()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        User not found
      </div>
    );
  }

  return (
    <div className={`${PALETTE.BG} min-h-screen`}>
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          Loading profile…
        </div>
      ) : !user ? (
        <div className="flex items-center justify-center h-[60vh]">
          User not found
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <aside className="md:col-span-1 space-y-4">
            <div className={`${PALETTE.CARD} p-5 rounded-lg shadow`}>
              <p className="font-semibold">{user.email}</p>
              <p className={`text-sm ${PALETTE.MUTED}`}>My Account</p>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="md:col-span-3 space-y-8">
            {/* ACCOUNT DETAILS */}
            <section className={`${PALETTE.CARD} p-6 rounded-lg shadow`}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Account Details</h2>
                <button
                  onClick={() => setEditingName(!editingName)}
                  className="text-sm underline"
                >
                  {editingName ? "Cancel" : "Edit"}
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {editingName ? (
                  <>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="border p-2 rounded w-full"
                    />
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="border p-2 rounded w-full"
                    />
                    <button
                      className={`${PALETTE.ACCENT} px-4 py-2 rounded`}
                      onClick={saveName}
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                )}
              </div>
            </section>

            {/* ADDRESSES */}
            <section className={`${PALETTE.CARD} p-6 rounded-lg shadow`}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Saved Addresses</h3>
                <button className="text-sm underline">Add Address</button>
              </div>

              {user.addresses.length === 0 && (
                <p className="text-sm text-gray-500 mt-3">
                  No addresses saved.
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {user.addresses.map((addr, i) => (
                  <div
                    key={i}
                    className={`border p-4 rounded ${
                      user.defaultAddress === i ? "ring-2 ring-[#ead7c5]" : ""
                    }`}
                  >
                    <p className="font-medium">{addr.street}</p>
                    <p className="text-sm text-gray-600">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <button className="text-xs underline mt-2">Edit</button>
                  </div>
                ))}
              </div>
            </section>

            {/* ORDERS */}
            <section className={`${PALETTE.CARD} p-6 rounded-lg shadow`}>
              <h3 className="text-lg font-semibold mb-4">My Orders</h3>
              {user.orderHistory.length === 0 && (
                <p className="text-sm text-gray-500">No orders yet.</p>
              )}
              {/* Scrollable Orders Container */}
              <div className="max-h-[420px] overflow-y-auto  rounded-lg">
                {user.orderHistory.map(({ order }) => {
                  const isOpen = openOrders[order._id];

                  return (
                    <div key={order._id} className="border-b last:border-b-0">
                      {/* ORDER ROW */}
                      <div className="grid grid-cols-5 gap-4 items-center px-4 py-3 text-sm">
                        <span className="truncate font-medium">
                          {order._id}
                        </span>

                        <span className="text-gray-600">
                          {formatDate(order.createdAt)}
                        </span>

                        <span className="font-semibold">₹{order.amount}</span>

                        <span
                          className={`text-xs px-2 py-1 rounded-full w-fit ${
                            order.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>

                        <button
                          onClick={() => toggleOrder(order._id)}
                          className="justify-self-end underline"
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </div>

                      {/* EXPANDED ORDER */}
                      {isOpen && (
                        <div className="bg-[#faf6f2] px-4 py-4 space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item._id}
                              className="flex gap-4 items-center"
                            >
                              <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden">
                                <Image
                                  src={`/api/images/${item.product.imageFrontFileId}`}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              <div className="flex-1">
                                <p className="font-medium">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Size {item.size} · Qty {item.qty}
                                </p>
                              </div>

                              <p className="text-sm font-semibold">
                                ₹{item.product.price.current}
                              </p>

                              <button
                                onClick={() => downloadInvoice(order)}
                                className="text-xs underline"
                              >
                                Invoice
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* WISHLIST */}
            {/* WISHLIST */}
            <section className={`${PALETTE.CARD} p-6 rounded-lg shadow`}>
              <h3 className="text-lg font-semibold mb-4">Wishlist</h3>

              {user.wishlist.length === 0 && (
                <p className="text-sm text-gray-500">Wishlist empty.</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {user.wishlist.map((item) => (
                  <WishlistCard
                    key={item._id}
                    item={item}
                    showActions={false}
                  />
                ))}
              </div>
            </section>
            <button
              onClick={async () => {
                await fetch("/api/user/auth/logout", {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                });

                // 🔥 clear client-side state
                useCartStore.getState().cart = [];
                useAppStore.getState().wishlist = [];

                window.location.href = "/";
              }}
              className="text-sm text-red-600 underline mt-4"
            >
              Logout
            </button>
          </main>
        </div>
      )}
    </div>
  );
}
