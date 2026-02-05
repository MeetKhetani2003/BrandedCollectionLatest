"use client";

import { useEffect, useState } from "react";

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [openUserId, setOpenUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/user");
      const data = await res.json();
      const fetchedUsers = data.users || [];
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  // Filter Logic: Stays in sync with your selections
  useEffect(() => {
    let result = [...users];

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      result = result.filter((u) => {
        if (!u.createdAt) return false;
        const userTime = new Date(u.createdAt).getTime();
        if (start && userTime < start) return false;
        if (end && userTime > end) return false;
        return true;
      });
    }

    setFilteredUsers(result.slice(0, itemsPerPage));
  }, [startDate, endDate, itemsPerPage, users]);

  function toggleUser(userId) {
    setOpenUserId((prev) => (prev === userId ? null : userId));
  }

  // Robust PDF Export
  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.text("User Report", 14, 15);

    const tableRows = filteredUsers.map((u) => [
      u.name,
      u.email,
      u.phoneNumber || "-",
      u.orders.length,
      u.wishlist.length,
      u.cart.length,
    ]);

    autoTable(doc, {
      head: [["User", "Email", "Phone", "Orders", "Wishlist", "Cart"]],
      body: tableRows,
      startY: 20,
    });

    doc.save(`User_Report_${new Date().toLocaleDateString()}.pdf`);
  };

  if (loading) return <p className="p-10 text-gray-500">Loading users…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Users</h1>
        <button
          onClick={exportPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Export User Data (PDF)
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 items-end shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            Start Date
          </label>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            End Date
          </label>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
            Show Count
          </label>
          <select
            className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={10}>10 Users</option>
            <option value={25}>25 Users</option>
            <option value={50}>50 Users</option>
            <option value={100}>100 Users</option>
          </select>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {/* HEADER - Restored 7-column grid to include Phone */}
        <div className="grid grid-cols-8 px-4 py-3 bg-gray-100 text-sm font-medium border-b text-gray-700">
          <div>User</div>
          <div>Email</div>
          <div>Phone</div>
          <div>CreatedAt</div>
          <div>Orders</div>
          <div>Wishlist</div>
          <div>Cart</div>
          <div className="text-right">Action</div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No users found for this selection.
          </div>
        )}

        {filteredUsers.map((user) => {
          const isOpen = openUserId === user._id;

          return (
            <div key={user._id} className="border-t first:border-t-0">
              {/* ROW */}
              <div className="grid grid-cols-8 px-4 py-3 text-sm items-center hover:bg-gray-50 transition">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-gray-600 truncate pr-2">{user.email}</div>
                <div className="text-gray-600">{user.phoneNumber || "-"}</div>
                <div className="text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="text-gray-600">{user.orders.length}</div>
                <div className="text-gray-600">{user.wishlist.length}</div>
                <div className="text-gray-600">{user.cart.length}</div>
                <div className="text-right">
                  <button
                    onClick={() => toggleUser(user._id)}
                    className="underline text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {isOpen ? "Hide" : "View"}
                  </button>
                </div>
              </div>

              {/* EXPANDED DETAILS (Your exact original styling) */}
              {isOpen && (
                <div className="bg-gray-50 p-6 grid md:grid-cols-3 gap-6 text-sm border-t border-b animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* ORDERS */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-800 uppercase text-xs tracking-wider">
                      Orders
                    </h3>
                    {user.orders.length === 0 ? (
                      <p className="text-gray-400 italic">No orders yet</p>
                    ) : (
                      user.orders.map((o) => (
                        <div
                          key={o.order._id}
                          className="border bg-white rounded-lg p-3 mb-3 shadow-sm"
                        >
                          <div className="font-bold text-blue-600">
                            Order #{o.order._id.slice(-6)}
                          </div>
                          <div className="capitalize">
                            Status:{" "}
                            <span className="font-medium">
                              {o.order.status}
                            </span>
                          </div>
                          <div className="text-green-700 font-semibold">
                            Total: ₹{o.order.amount}
                          </div>
                          <div className="mt-2 pt-2 border-t text-xs">
                            <p className="font-semibold text-gray-700 mb-1">
                              Items:
                            </p>
                            <ul className="ml-4 list-disc text-gray-600 space-y-1">
                              {o.order.items.map((i) => (
                                <li key={i._id}>
                                  {i.product?.name} — ₹
                                  {i.product?.price?.current} × {i.qty}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* WISHLIST */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-800 uppercase text-xs tracking-wider">
                      Wishlist
                    </h3>
                    {user.wishlist.length === 0 ? (
                      <p className="text-gray-400 italic">Wishlist empty</p>
                    ) : (
                      user.wishlist.map((p) => (
                        <div
                          key={p._id}
                          className="border bg-white rounded-lg p-2 mb-2 flex gap-3 items-center shadow-sm"
                        >
                          {p.image && (
                            <img
                              src={p.image}
                              className="h-10 w-10 object-cover rounded shadow-inner"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-800">
                              {p.name}
                            </div>
                            <div className="text-blue-600 font-semibold text-xs">
                              ₹{p.price?.current}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* CART */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-800 uppercase text-xs tracking-wider">
                      Cart
                    </h3>
                    {user.cart.length === 0 ? (
                      <p className="text-gray-400 italic">Cart empty</p>
                    ) : (
                      user.cart.map((c) => (
                        <div
                          key={c._id}
                          className="border bg-white rounded-lg p-2 mb-2 flex gap-3 items-center shadow-sm"
                        >
                          {c.image && (
                            <img
                              src={c.image}
                              className="h-10 w-10 object-cover rounded shadow-inner"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {c.name}
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-blue-600 font-semibold">
                                ₹{c.price?.current}
                              </span>
                              <span className="text-gray-500 italic">
                                Qty: {c.qty} | Sz: {c.selectedSize}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
