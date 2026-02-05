"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { generateInvoice } from "@/utils/generateInvoice";
import { useCartStore } from "@/store/useCartStore";
import { useAppStore } from "@/store/useAppStore";
import WishlistCard from "@/components/Layouts/WhishListCard";
import {
  Search,
  Package,
  Heart,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Plus, // Added
  MapPin, // Added
  Trash2, // Added
  Edit3, // Added
  X,
} from "lucide-react";

const PALETTE = {
  BG: "bg-[#fdf7f2]",
  CARD: "bg-white",
  TEXT: "text-[#4a2e1f]",
  MUTED: "text-gray-500",
  BORDER: "border-[#ead7c5]",
  ACCENT: "bg-[#4a2e1f] text-white",
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile"); // Default tab

  // Data for Orders Tab
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSort, setOrderSort] = useState("newest");
  const [openOrders, setOpenOrders] = useState({});

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          toast.error("Please login");
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/user/auth/logout", { method: "POST" });
    useCartStore.getState().cart = [];
    useAppStore.getState().wishlist = [];
    window.location.href = "/";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile…
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono uppercase tracking-widest text-sm">
        Session Expired. Please Login.
      </div>
    );

  const tabs = [
    { id: "profile", label: "My Profile", icon: <User size={18} /> },
    { id: "orders", label: "Order History", icon: <Package size={18} /> },
    { id: "wishlist", label: "My Wishlist", icon: <Heart size={18} /> },
  ];

  return (
    <div className={`${PALETTE.BG} min-h-fit mt-20 text-[#4a2e1f]`}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT SIDEBAR (Sticky on Desktop, Top on Mobile) */}
          <aside className="md:w-1/4 h-fit md:sticky top-28 self-start">
            <div
              className={`${PALETTE.CARD}  p-6 rounded-xl border ${PALETTE.BORDER} shadow-sm`}
            >
              <div className="mb-6">
                <p className="font-bold text-lg truncate uppercase tracking-tighter">
                  {user.firstName || "Client"} {user.lastName || ""}
                </p>
                <p className={`text-xs font-mono opacity-60`}>{user.email}</p>
              </div>

              {/* TAB NAVIGATION */}
              <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                      ${
                        activeTab === tab.id
                          ? "bg-[#4a2e1f] text-white shadow-md"
                          : "hover:bg-white border border-transparent hover:border-[#ead7c5]"
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-0 md:mt-4 border border-transparent hover:border-red-100"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* RIGHT CONTENT AREA */}
          <main className="flex-1 h-fit">
            {activeTab === "profile" && (
              <ProfileTab user={user} setUser={setUser} palette={PALETTE} />
            )}

            {activeTab === "orders" && (
              <OrdersTab
                orders={user.orderHistory}
                search={orderSearch}
                setSearch={setOrderSearch}
                sort={orderSort}
                setSort={setOrderSort}
                openOrders={openOrders}
                setOpenOrders={setOpenOrders}
                palette={PALETTE}
              />
            )}

            {activeTab === "wishlist" && (
              <WishlistTab items={user.wishlist} palette={PALETTE} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENTS                              */
/* -------------------------------------------------------------------------- */
function ProfileTab({ user, setUser, palette }) {
  const [editing, setEditing] = useState(false);

  // Initialize state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [number, setNumber] = useState(user?.number || "");
  // CRITICAL FIX: Update local state when the 'user' prop changes (after fetch)
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setNumber(user.number || "");
    }
  }, [user]);
  console.log(user);

  // Address Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);

  const saveProfile = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, number }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update the global user state so other components see the change
        setUser({ ...user, firstName, lastName, number });
        setEditing(false);
        toast.success("Profile Updated Successfully");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update Error:", err);
      toast.error("Network error. Please try again.");
    }
  };

  const handleOpenModal = (address = null) => {
    setCurrentAddress(address);
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async (index) => {
    if (!confirm("Are you sure?")) return;
    const updatedAddresses = user.addresses.filter((_, i) => i !== index);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: updatedAddresses }),
    });
    if (res.ok) {
      setUser({ ...user, addresses: updatedAddresses });
      toast.success("Address Deleted");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div
        className={`${palette.CARD} p-8 rounded-xl border ${palette.BORDER} shadow-sm`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold uppercase tracking-tight">
            Account Settings
          </h2>
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs font-bold underline uppercase tracking-widest opacity-60 hover:opacity-100"
          >
            {editing ? "Cancel" : "Edit Details"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <DetailField
            label="First Name"
            value={firstName}
            isEditing={editing}
            onChange={setFirstName}
          />
          <DetailField
            label="Last Name"
            value={lastName}
            isEditing={editing}
            onChange={setLastName}
          />
          <DetailField
            label="Phone Number"
            value={number}
            isEditing={editing}
            onChange={setNumber}
          />
        </div>

        {editing && (
          <button
            onClick={saveProfile}
            className={`mt-8 ${palette.ACCENT} px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity`}
          >
            Update Records
          </button>
        )}
      </div>

      {/* Addresses Section */}
      <div
        className={`${palette.CARD} p-8 rounded-xl border ${palette.BORDER} shadow-sm`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold uppercase tracking-tight">
            Saved Addresses
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border ${palette.BORDER} hover:bg-gray-50 transition-colors`}
          >
            <Plus size={14} /> Add New
          </button>
        </div>

        {user.addresses && user.addresses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {user.addresses.map((addr, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${palette.BORDER} relative group hover:shadow-md transition-shadow`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-[#fdf7f2] rounded-lg">
                    <MapPin size={16} className="opacity-60" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal({ ...addr, index })}
                      className="p-1.5 hover:bg-gray-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 size={14} className="opacity-60" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(index)}
                      className="p-1.5 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {addr.street}
                </p>
                <p className="text-xs opacity-60 mt-1">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-40">
                  {addr.country}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-[#ead7c5] rounded-xl opacity-40">
            <p className="text-xs italic">
              No addresses found in your records.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddressModal
          onClose={() => setIsModalOpen(false)}
          address={currentAddress}
          user={user}
          setUser={setUser}
          palette={palette}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: DETAIL FIELD ---
function DetailField({ label, value, isEditing, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase opacity-50 tracking-widest">
        {label}
      </label>
      {isEditing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-b border-[#ead7c5] bg-transparent py-2 focus:outline-none focus:border-[#4a2e1f]"
        />
      ) : (
        <p className="py-2 border-b border-transparent font-medium">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: ADDRESS MODAL ---
// --- SUB-COMPONENT: ADDRESS MODAL (Adjusted) ---
function AddressModal({ onClose, address, user, setUser, palette }) {
  // Initialize with all keys present in your DB structure
  const [formData, setFormData] = useState(
    address || {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India", // Default value
    },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    let updatedAddresses = [...user.addresses];

    if (address && address.index !== undefined) {
      // Edit mode: Replace the specific index
      const updatedEntry = { ...formData };
      delete updatedEntry.index; // Clean up the helper index before saving
      updatedAddresses[address.index] = updatedEntry;
    } else {
      // Create mode: Add to array
      updatedAddresses.push(formData);
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      if (res.ok) {
        setUser({ ...user, addresses: updatedAddresses });
        toast.success(address ? "Address Updated" : "Address Added");
        onClose();
      }
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-[#ead7c5]">
          <h3 className="font-bold uppercase tracking-tight">
            {address ? "Edit Address" : "New Address"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* STREET */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase opacity-50">
              Street / Area / Landmark
            </label>
            <input
              required
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#4a2e1f] outline-none border-[#ead7c5]"
            />
          </div>

          {/* CITY & STATE */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase opacity-50">
                City
              </label>
              <input
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#4a2e1f] outline-none border-[#ead7c5]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase opacity-50">
                State
              </label>
              <input
                required
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#4a2e1f] outline-none border-[#ead7c5]"
              />
            </div>
          </div>

          {/* POSTAL & COUNTRY */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase opacity-50">
                Postal Code
              </label>
              <input
                required
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#4a2e1f] outline-none border-[#ead7c5]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase opacity-50">
                Country
              </label>
              <input
                required
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#4a2e1f] outline-none border-[#ead7c5]"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${palette.ACCENT} py-4 rounded-xl font-bold uppercase tracking-widest text-xs mt-4 hover:opacity-90 transition-opacity`}
          >
            {address ? "Update Record" : "Save Address"}
          </button>
        </form>
      </div>
    </div>
  );
}
// --- ORDERS TAB ---
function OrdersTab({
  orders,
  search,
  setSearch,
  sort,
  setSort,
  openOrders,
  setOpenOrders,
  palette,
}) {
  const filteredOrders = useMemo(() => {
    let data = [...orders];
    if (search) {
      data = data.filter((o) =>
        o.order._id.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return data.sort((a, b) => {
      return sort === "newest"
        ? new Date(b.order.createdAt) - new Date(a.order.createdAt)
        : new Date(a.order.createdAt) - new Date(b.order.createdAt);
    });
  }, [orders, search, sort]);

  const toggle = (id) =>
    setOpenOrders((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-2">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
            size={16}
          />
          <input
            placeholder="SEARCH BY ORDER ID..."
            className="w-full bg-white border border-[#ead7c5] rounded-full py-2 pl-10 pr-4 text-[10px] font-bold tracking-widest focus:outline-none focus:border-[#4a2e1f]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
          className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase opacity-60 hover:opacity-100"
        >
          <ArrowUpDown size={14} />{" "}
          {sort === "newest" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      <div
        className={`${palette.CARD} rounded-xl border ${palette.BORDER} overflow-hidden shadow-sm`}
      >
        {filteredOrders.length === 0 ? (
          <div className="p-20 text-center opacity-40 italic">
            No corresponding records found.
          </div>
        ) : (
          <div className="divide-y divide-[#ead7c5]/50">
            {filteredOrders.map(({ order }) => (
              <div
                key={order._id}
                className="transition-colors hover:bg-gray-50/30"
              >
                <div
                  className="p-6 cursor-pointer flex flex-wrap gap-4 items-center justify-between"
                  onClick={() => toggle(order._id)}
                >
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">
                      Order Identifier
                    </p>
                    <p className="font-mono text-sm">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="w-32">
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">
                      Date
                    </p>
                    <p className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div className="w-24">
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">
                      Amount
                    </p>
                    <p className="text-sm font-bold">₹{order.amount}</p>
                  </div>
                  <div className="w-24">
                    <span
                      className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border 
                      ${order.status === "paid" ? "bg-green-50 text-green-700 border-green-100" : "bg-yellow-50 text-yellow-700 border-yellow-100"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  {openOrders[order._id] ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>

                {openOrders[order._id] && (
                  <div className="bg-[#fcfaf8] px-6 py-6 border-t border-[#ead7c5]/30 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex gap-4 items-center justify-between"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="relative w-12 h-16 rounded overflow-hidden border border-[#ead7c5]">
                              <Image
                                src={`/api/images/${item.product.imageFrontFileId}`}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase">
                                {item.product.name}
                              </p>
                              <p className="text-[10px] opacity-60">
                                SIZE: {item.size} | QTY: {item.qty}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-bold">
                            ₹{item.product.price.current}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- WISHLIST TAB ---
function WishlistTab({ items, palette }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div
        className={`${palette.CARD} p-8 rounded-xl border ${palette.BORDER} shadow-sm min-h-[40vh]`}
      >
        <h2 className="text-xl font-bold uppercase tracking-tight mb-8">
          Curated Wishlist
        </h2>
        {items.length === 0 ? (
          <div className="text-center py-20 opacity-30 italic">
            No items have been saved to your collection yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <WishlistCard key={item._id} item={item} showActions={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
