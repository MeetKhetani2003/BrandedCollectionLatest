"use client";

import { useEffect, useState } from "react";
import { generateInvoice } from "@/utils/generateInvoice";
import CreateInvoiceForm from "./CreateAdminOrderForm";
import { useRouter } from "next/navigation";

const TABS = {
  ORDERS: "orders",
  INVOICE: "invoice",
};

export default function AdminOrders() {
  const [tab, setTab] = useState(TABS.ORDERS);
  const [orders, setOrders] = useState([]);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(null);
  const router = useRouter();

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
          <div className="grid grid-cols-[1.2fr_1.5fr_1fr_2fr_1fr_0.7fr_0.7fr] px-6 py-3 bg-gray-100 text-sm font-semibold text-gray-700">
            <div>Order ID</div>
            <div>User</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Date</div>
            <div className="text-right">View</div>
            <div className="text-right text-red-600">Delete</div>
          </div>

          {orders.map((order) => {
            console.log(order);

            const isOpen = openOrderId === order._id;

            return (
              <div key={order._id} className="border-t">
                {/* ROW */}
                <div className="grid grid-cols-[1.2fr_1.5fr_1fr_2fr_1fr_0.7fr_0.7fr] px-6 py-4 text-sm items-start hover:bg-gray-50 transition">
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
                  <div className="space-y-2">
                    {/* TRACKING STATUS */}
                    {order.tracking?.status ? (
                      <span
                        className={`text-xs font-medium ${
                          order.tracking.raw?.OpStatus?.startsWith("FAILED")
                            ? "text-red-600"
                            : "text-green-700"
                        }`}
                      >
                        {order.tracking.status}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">No tracking</span>
                    )}

                    {/* AWB INPUT + FETCH */}
                    <div className="flex gap-1 mt-1">
                      <input
                        type="text"
                        defaultValue={order.awbNumber || ""}
                        placeholder="Scan AWB"
                        className="w-28 border px-1 py-0.5 text-xs rounded"
                        onKeyDown={async (e) => {
                          if (e.key !== "Enter") return;

                          const awb = e.target.value.trim();
                          if (!awb) return;

                          // 1️⃣ Save AWB
                          await fetch("/api/order/awb", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              orderId: order._id,
                              awbNumber: awb,
                            }),
                          });

                          // 2️⃣ Fetch tracking
                          setTrackingLoading(order._id);

                          const res = await fetch(
                            `/api/order/tracking?orderId=${order._id}`,
                          );
                          const data = await res.json();

                          setOrders((prev) =>
                            prev.map((o) =>
                              o._id === order._id
                                ? {
                                    ...o,
                                    awbNumber: awb,
                                    tracking: data.tracking,
                                  }
                                : o,
                            ),
                          );

                          setTrackingLoading(null);
                        }}
                      />

                      <button
                        disabled={trackingLoading === order._id}
                        onClick={async () => {
                          setTrackingLoading(order._id);

                          const res = await fetch(
                            `/api/order/tracking?orderId=${order._id}`,
                          );
                          const data = await res.json();

                          setOrders((prev) =>
                            prev.map((o) =>
                              o._id === order._id
                                ? { ...o, tracking: data.tracking }
                                : o,
                            ),
                          );

                          setTrackingLoading(null);
                        }}
                        className="bg-blue-600 text-white text-xs px-2 rounded disabled:opacity-50"
                      >
                        {trackingLoading === order._id ? "…" : "Fetch"}
                      </button>
                    </div>
                  </div>

                  <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                  <div className="text-right">
                    <button
                      onClick={() => setOpenOrderId(isOpen ? null : order._id)}
                      className="text-blue-600 hover:underline"
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
                          prev.filter((o) => o._id !== order._id),
                        );
                      }}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* DRAWER */}
                {isOpen && (
                  <div className="bg-gray-50 px-6 py-5 space-y-5 border-t">
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
                            onClick={() => {
                              if (!i.product?.slug) return;
                              router.push(`/products/${i.product.slug}`);
                            }}
                            className="flex justify-between bg-white border rounded-lg p-3 text-sm cursor-pointer hover:bg-gray-50 hover:border-[#4a2e1f] transition"
                          >
                            <div>
                              <p
                                onClick={() => {
                                  if (!i.product?.slug) return;
                                  router.push(`/product/${i.product.slug}`);
                                }}
                                className="font-medium text-[#4a2e1f] hover:underline cursor-pointer"
                              >
                                {i.product?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Size: {i.size} | Qty: {i.qty}
                              </p>
                            </div>
                            <div>₹{i.product?.price?.current}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* TRACKING SECTION */}
                    {/* <div className="border-t pt-3 space-y-2">
                      <p className="font-medium">Tracking</p>

                      <div className="flex items-center gap-3">
                        <button
                          disabled={trackingLoading === order._id}
                          onClick={async () => {
                            setTrackingLoading(order._id);

                            const res = await fetch(
                              `/api/order/tracking?orderId=${order._id}`,
                            );
                            const data = await res.json();

                            setOrders((prev) =>
                              prev.map((o) =>
                                o._id === order._id
                                  ? {
                                      ...o,
                                      tracking: data.tracking,
                                    }
                                  : o,
                              ),
                            );

                            setTrackingLoading(null);
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        >
                          {trackingLoading === order._id
                            ? "Fetching…"
                            : "Fetch Tracking"}
                        </button>

                        <span className="text-sm">
                          {order.tracking?.raw?.OpStatus?.startsWith(
                            "FAILED",
                          ) && (
                            <span className="text-red-600">
                              Unauthorized / Invalid AWB
                            </span>
                          )}

                          {order.tracking?.status && (
                            <span className="text-green-700">
                              {order.tracking.status}
                            </span>
                          )}

                          {!order.tracking && (
                            <span className="text-gray-500">
                              No tracking fetched
                            </span>
                          )}
                        </span>
                      </div>
                    </div> */}

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
