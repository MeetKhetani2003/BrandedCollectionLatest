"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

/* --------------------------------- */
/* -------- DASHBOARD -------------- */
/* --------------------------------- */

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState("weekly");

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    async function load() {
      try {
        // Change this line in your AdminPage useEffect
        const [u, p, o] = await Promise.all([
          fetch("/api/user?limit=1000").then((r) => r.json()), // Add a high limit
          fetch("/api/products?limit=10000").then((r) => r.json()),
          fetch("/api/order?limit=1000").then((r) => r.json()),
        ]);

        setUsers(Array.isArray(u) ? u : u.users || []);
        setProducts(Array.isArray(p) ? p : p.products || []);
        setOrders(Array.isArray(o) ? o : o.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ---------- FILTER ORDERS BY TIMELINE ---------- */
  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((o) => {
      const d = new Date(o.createdAt);

      if (timeline === "weekly") {
        return d >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }
      if (timeline === "monthly") {
        return d >= new Date(now.setMonth(now.getMonth() - 1));
      }
      if (timeline === "yearly") {
        return d >= new Date(now.setFullYear(now.getFullYear() - 1));
      }
      return true; // all
    });
  }, [orders, timeline]);

  /* ---------- METRICS ---------- */
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.amount || 0), 0),
    [orders],
  );

  /* ---------- SALES TIMELINE ---------- */
  const salesTimeline = useMemo(() => {
    const map = {};

    filteredOrders.forEach((o) => {
      const date = new Date(o.createdAt).toISOString().split("T")[0];
      map[date] = (map[date] || 0) + o.amount;
    });

    return Object.entries(map).map(([date, value]) => ({
      date,
      value,
    }));
  }, [filteredOrders]);

  /* ---------- TOP SELLING ---------- */
  const topSelling = useMemo(() => {
    const map = {};

    orders.forEach((o) =>
      o.items?.forEach((i) => {
        const product = i.product;
        if (!product) return;

        const id = typeof product === "object" ? product._id : product;

        const name =
          typeof product === "object" ? product.name : "Unknown Product";

        map[id] ??= { name, qty: 0 };
        map[id].qty += i.qty;
      }),
    );

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  /* ---------- MOST WISHLISTED ---------- */
  const mostWishlisted = useMemo(() => {
    const map = {};

    users.forEach((u) =>
      u.wishlist?.forEach((p) => {
        if (!p) return;

        const id = p._id;
        const name = p.name || "Unknown Product";

        map[id] ??= { name, count: 0 };
        map[id].count += 1;
      }),
    );

    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [users]);

  if (loading) return <p>Loading dashboard…</p>;
  console.log();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Stat title="Users" value={users.length} />
        <Stat title="Products" value={products.length} />
        <Stat title="Orders" value={orders.length} />
        <Stat title="Revenue" value={`₹${totalRevenue}`} />
      </div>

      {/* ---------- TIMELINE FILTER ---------- */}
      <div className="flex gap-2">
        {["weekly", "monthly", "yearly", "all"].map((t) => (
          <button
            key={t}
            onClick={() => setTimeline(t)}
            className={`px-4 py-2 text-sm rounded-full border transition
              ${
                timeline === t
                  ? "bg-[#4a2e1f] text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ---------- CHART ---------- */}
      <SalesLineChart data={salesTimeline} />

      {/* ---------- MAIN GRID ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ORDERS TABLE */}
        <div className="lg:col-span-2 bg-white border rounded-xl">
          <div className="p-4 font-semibold border-b">All Orders</div>

          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="text-left p-3">Order</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t">
                    <td className="p-3">#{o._id.slice(-6)}</td>
                    <td>
                      {o.user?.username ||
                        o.user?.firstName ||
                        o.user?.email ||
                        "Offline"}
                    </td>
                    <td>₹{o.amount}</td>
                    <td>{o.status}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="text-right pr-4">
                      <button
                        onClick={() => setOpenOrder(o)}
                        className="underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="space-y-6">
          <Insight
            title="Top Selling Products"
            rows={topSelling}
            keyName="qty"
          />
          <Insight
            title="Most Wishlisted Products"
            rows={mostWishlisted}
            keyName="count"
          />
        </div>
      </div>

      {/* ---------- ORDER DRAWER ---------- */}
      {openOrder && (
        <OrderDrawer order={openOrder} onClose={() => setOpenOrder(null)} />
      )}
    </div>
  );
}

/* --------------------------------- */
/* -------- COMPONENTS ------------- */
/* --------------------------------- */

function Stat({ title, value }) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

/* ---------- LINE CHART ---------- */
function SalesLineChart({ data }) {
  const lineRef = useRef(null);
  const [hover, setHover] = useState(null);

  const WIDTH = 700;
  const HEIGHT = 280;
  const PAD = 50;

  const max = Math.max(...data.map((d) => d.value), 1);

  const points = data.map((d, i) => ({
    ...d,
    x: PAD + (i / Math.max(data.length - 1, 1)) * (WIDTH - PAD * 2),
    y: HEIGHT - PAD - (d.value / max) * (HEIGHT - PAD * 2),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  useEffect(() => {
    if (!lineRef.current) return;
    const len = lineRef.current.getTotalLength();
    gsap.fromTo(
      lineRef.current,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 1.4, ease: "power2.out" },
    );
  }, [data]);

  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="font-semibold mb-4">Sales Over Time</h3>

      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {/* AXES */}
        <line x1={PAD} x2={PAD} y1={PAD} y2={HEIGHT - PAD} stroke="#ccc" />
        <line
          x1={PAD}
          x2={WIDTH - PAD}
          y1={HEIGHT - PAD}
          y2={HEIGHT - PAD}
          stroke="#ccc"
        />

        {/* GRID */}
        {[0.25, 0.5, 0.75].map((g) => {
          const y = HEIGHT - PAD - g * (HEIGHT - PAD * 2);
          return (
            <line
              key={g}
              x1={PAD}
              x2={WIDTH - PAD}
              y1={y}
              y2={y}
              stroke="#eee"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* LINE */}
        <path
          ref={lineRef}
          d={pathD}
          fill="none"
          stroke="#4a2e1f"
          strokeWidth="3"
        />

        {/* POINTS */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#4a2e1f"
            onMouseEnter={() => setHover(p)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {hover && (
        <div className="text-sm mt-2">
          {hover.date} → <strong>₹{hover.value}</strong>
        </div>
      )}
    </div>
  );
}

/* ---------- INSIGHTS ---------- */
function Insight({ title, rows, keyName }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <h4 className="font-semibold mb-3">{title}</h4>
      <div className="space-y-2 text-sm">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between">
            <span>{r.name}</span>
            <span className="text-gray-500">{r[keyName]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- ORDER DRAWER ---------- */
function OrderDrawer({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto">
        <button onClick={onClose} className="mb-4 underline">
          Close
        </button>

        <h3 className="font-semibold mb-2">Order #{order._id.slice(-6)}</h3>

        <p className="text-sm mb-2">
          Customer:{" "}
          {order.user?.username ||
            order.user?.firstName ||
            order.user?.email ||
            "Offline"}
        </p>

        <p className="text-sm mb-4">Payment: {order.paymentId}</p>

        <div className="space-y-2">
          {order.items.map((i) => (
            <div key={i._id} className="border rounded p-2 text-sm">
              <p className="font-medium">{i.product?.name || "Product"}</p>

              <p>₹{i.product?.price?.current || 0}</p>

              <p className="text-gray-500">
                Size: {i.size} | Qty: {i.qty}
              </p>
              <p>₹{i.product?.price?.current}</p>
            </div>
          ))}
        </div>

        <p className="font-semibold mt-4">Total: ₹{order.amount}</p>
      </div>
    </div>
  );
}
