"use client";

import { useEffect, useState } from "react";

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [openUserId, setOpenUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  function toggleUser(userId) {
    setOpenUserId((prev) => (prev === userId ? null : userId));
  }

  if (loading) return <p>Loading users…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        {/* HEADER */}
        <div className="grid grid-cols-6 px-4 py-3 bg-gray-100 text-sm font-medium">
          <div>User</div>
          <div>Email</div>
          <div>Orders</div>
          <div>Wishlist</div>
          <div>Cart</div>
          <div className="text-right">Action</div>
        </div>

        {users.map((user) => {
          const isOpen = openUserId === user._id;

          return (
            <div key={user._id} className="border-t">
              {/* ROW */}
              <div className="grid grid-cols-6 px-4 py-3 text-sm">
                <div>{user.name}</div>
                <div>{user.email}</div>
                <div>{user.orders.length}</div>
                <div>{user.wishlist.length}</div>
                <div>{user.cart.length}</div>
                <div className="text-right">
                  <button
                    onClick={() => toggleUser(user._id)}
                    className="underline"
                  >
                    {isOpen ? "Hide" : "View"}
                  </button>
                </div>
              </div>

              {/* EXPANDED DETAILS */}
              {isOpen && (
                <div className="bg-gray-50 p-6 grid md:grid-cols-3 gap-6 text-sm">
                  {/* ORDERS */}
                  <div>
                    <h3 className="font-semibold mb-2">Orders</h3>

                    {user.orders.length === 0 && (
                      <p className="text-gray-500">No orders</p>
                    )}

                    {user.orders.map((o) => (
                      <div
                        key={o.order._id}
                        className="border bg-white rounded p-3 mb-3"
                      >
                        <div className="font-medium">
                          Order #{o.order._id.slice(-6)}
                        </div>
                        <div>Status: {o.order.status}</div>
                        <div>Total: ₹{o.order.amount}</div>

                        <div className="mt-2">
                          <p className="font-medium">Items:</p>
                          <ul className="ml-4 list-disc">
                            {o.order.items.map((i) => (
                              <li key={i._id}>
                                {i.product?.name} — ₹{i.product?.price?.current}{" "}
                                × {i.qty} ({i.size})
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* WISHLIST */}
                  <div>
                    <h3 className="font-semibold mb-2">Wishlist</h3>

                    {user.wishlist.length === 0 && (
                      <p className="text-gray-500">Wishlist empty</p>
                    )}

                    {user.wishlist.map((p) => (
                      <div
                        key={p._id}
                        className="border bg-white rounded p-2 mb-2 flex gap-3"
                      >
                        {p.image && (
                          <img
                            src={p.image}
                            className="h-12 w-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div>{p.name}</div>
                          <div className="text-gray-500">
                            ₹{p.price?.current}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CART */}
                  <div>
                    <h3 className="font-semibold mb-2">Cart</h3>

                    {user.cart.length === 0 && (
                      <p className="text-gray-500">Cart empty</p>
                    )}

                    {user.cart.map((c) => (
                      <div
                        key={c._id}
                        className="border bg-white rounded p-2 mb-2 flex gap-3"
                      >
                        {c.image && (
                          <img
                            src={c.image}
                            className="h-12 w-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div>{c.name}</div>
                          <div className="text-gray-500">
                            ₹{c.price?.current}
                          </div>
                          <div className="text-xs">
                            Qty: {c.qty} | Size: {c.selectedSize}
                          </div>
                        </div>
                      </div>
                    ))}
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
