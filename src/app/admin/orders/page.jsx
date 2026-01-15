"use client";

import { useEffect, useState } from "react";
import { generateInvoice } from "@/utils/generateInvoice";
import CreateInvoiceForm from "./CreateAdminOrderForm";

const TABS = {
  ORDERS: "orders",
  INVOICE: "invoice",
};

export default function AdminOrders() {
  const [tab, setTab] = useState(TABS.ORDERS);
  const [orders, setOrders] = useState([]);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const res = await fetch("/api/order");
      const data = await res.json();
      setOrders(data.orders || []);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  async function downloadInvoice(order) {
    const pdfBytes = await generateInvoice(order);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${order._id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <p>Loading orders…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#4a2e1f]">Orders</h1>

      {/* TABS */}
      <div className="flex gap-3 border-b">
        <Tab active={tab === TABS.ORDERS} onClick={() => setTab(TABS.ORDERS)}>
          Orders List
        </Tab>
        <Tab active={tab === TABS.INVOICE} onClick={() => setTab(TABS.INVOICE)}>
          Invoice Create
        </Tab>
      </div>

      {/* ORDERS LIST */}
      {tab === TABS.ORDERS && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="grid grid-cols-6 px-4 py-3 bg-gray-100 text-sm font-medium">
            <div>Order ID</div>
            <div>User</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Date</div>
            <div className="text-right">View</div>
            <div className="text-right text-red-600">Delete</div>
          </div>

          {orders.map((order) => {
            const isOpen = openOrderId === order._id;

            return (
              <div key={order._id} className="border-t">
                {/* ROW */}
                <div className="grid grid-cols-7 px-4 py-3 text-sm items-center">
                  <div>#{order._id.slice(-6)}</div>
                  <div>
                    {order.user
                      ? order.user.username ||
                        `${order.user.firstName || ""} ${
                          order.user.lastName || ""
                        }`.trim()
                      : order.customerName || "Walk-in Customer"}
                  </div>

                  <div>₹{order.amount}</div>
                  <div>{order.status}</div>
                  <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                  <div className="text-right">
                    <button
                      onClick={() => setOpenOrderId(isOpen ? null : order._id)}
                      className="underline"
                    >
                      {isOpen ? "Hide" : "View"}
                    </button>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this order permanently?")) return;

                        const res = await fetch(`/api/order?id=${order._id}`, {
                          method: "DELETE",
                        });

                        if (!res.ok) {
                          alert("Failed to delete order");
                          return;
                        }

                        setOrders((prev) =>
                          prev.filter((o) => o._id !== order._id)
                        );
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* DRAWER */}
                {isOpen && (
                  <div className="bg-gray-50 px-6 py-4 space-y-4">
                    <div>
                      <p className="font-medium">
                        Payment ID: {order.paymentId}
                      </p>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Customer:</span>{" "}
                        {order.user
                          ? order.user.username ||
                            `${order.user.firstName || ""} ${
                              order.user.lastName || ""
                            }`.trim()
                          : order.customerName || "Walk-in Customer"}
                      </p>

                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {order.user?.email || order.customerEmail || "—"}
                      </p>
                    </div>

                    {/* ITEMS */}
                    <div>
                      <p className="font-semibold mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items.map((i) => (
                          <div
                            key={i._id}
                            className="flex justify-between bg-white border rounded p-2"
                          >
                            <div>
                              <p>{i.product?.name}</p>
                              <p className="text-xs text-gray-500">
                                Size: {i.size} | Qty: {i.qty}
                              </p>
                            </div>
                            <div>₹{i.product?.price?.current}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3">
                      <p className="font-semibold">Total: ₹{order.amount}</p>
                      <button
                        onClick={() => downloadInvoice(order)}
                        className="bg-[#4a2e1f] text-white px-4 py-2 rounded"
                      >
                        Download Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* INVOICE TAB */}
      {tab === TABS.INVOICE && <CreateInvoiceForm />}
    </div>
  );
}

/* ---------- UI ---------- */

function Tab({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 text-sm rounded-t ${
        active ? "bg-[#4a2e1f] text-white" : "hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
