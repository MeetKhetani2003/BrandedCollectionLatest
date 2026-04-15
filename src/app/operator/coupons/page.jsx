"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AdminCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "flat", // flat | percent
    value: "",
    minOrderValue: "",
    maxDiscount: "",
    expiryDate: "",
    usageLimit: "",
    isActive: true,
  });

  /* ---------------- FETCH ---------------- */
  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      toast.error("Failed to load coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* ---------------- CREATE ---------------- */
  const createCoupon = async (e) => {
    e.preventDefault();

    if (!form.code || !form.value || !form.expiryDate) {
      return toast.error("Code, value & expiry required");
    }

    if (form.type === "percent" && form.value > 100) {
      return toast.error("Percent discount cannot exceed 100%");
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value: Number(form.value),
          minOrderValue: Number(form.minOrderValue || 0),
          maxDiscount:
            form.type === "percent" ? Number(form.maxDiscount || 0) : null,
          expiryDate: form.expiryDate,
          usageLimit: Number(form.usageLimit || 0) || null,
          isActive: form.isActive,
        }),
      });

      setLoading(false);

      if (!res.ok) {
        const err = await res.json();
        return toast.error(err.message || "Failed to create coupon");
      }

      toast.success("Coupon created");
      setForm({
        code: "",
        type: "flat",
        value: "",
        minOrderValue: "",
        maxDiscount: "",
        expiryDate: "",
        usageLimit: "",
        isActive: true,
      });

      fetchCoupons();
    } catch {
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  /* ---------------- DELETE ---------------- */
  const deleteCoupon = async (id) => {
    if (!confirm("Delete this coupon?")) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[#4a2e1f]">
        Coupon Management
      </h1>

      {/* ---------------- CREATE COUPON ---------------- */}
      <form
        onSubmit={createCoupon}
        className="bg-white border rounded-lg p-6 space-y-4 max-w-xl"
      >
        <h2 className="font-semibold">Create New Coupon</h2>

        <input
          placeholder="Coupon Code (SAVE100)"
          className="w-full border px-3 py-2 rounded"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />

        {/* TYPE */}
        <select
          className="w-full border px-3 py-2 rounded"
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value, maxDiscount: "" })
          }
        >
          <option value="flat">Flat Discount (₹)</option>
          <option value="percent">Percentage Discount (%)</option>
        </select>

        {/* VALUE */}
        <input
          type="number"
          placeholder={form.type === "flat" ? "₹ Discount" : "% Discount"}
          className="w-full border px-3 py-2 rounded"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
        />

        {/* MAX DISCOUNT (ONLY % ) */}
        {form.type === "percent" && (
          <input
            type="number"
            placeholder="Max Discount Cap (₹)"
            className="w-full border px-3 py-2 rounded"
            value={form.maxDiscount}
            onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
          />
        )}

        <input
          type="number"
          placeholder="Minimum Order Value (₹)"
          className="w-full border px-3 py-2 rounded"
          value={form.minOrderValue}
          onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
        />

        <input
          type="number"
          placeholder="Usage Limit (optional)"
          className="w-full border px-3 py-2 rounded"
          value={form.usageLimit}
          onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
        />

        <input
          type="date"
          className="w-full border px-3 py-2 rounded"
          value={form.expiryDate}
          onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>

        <button
          disabled={loading}
          className="bg-[#4a2e1f] text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Create Coupon"}
        </button>
      </form>

      {/* ---------------- COUPON LIST ---------------- */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-[#fdf7f2] px-4 py-3 text-sm font-medium">
          <div>Code</div>
          <div>Type</div>
          <div>Value</div>
          <div>Min Order</div>
          <div>Usage</div>
          <div>Expiry</div>
          <div className="text-right">Action</div>
        </div>

        {coupons.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No coupons found.</div>
        )}

        {coupons.map((c) => (
          <div
            key={c._id}
            className="grid grid-cols-7 px-4 py-3 text-sm border-t items-center"
          >
            <div className="font-medium">{c.code}</div>
            <div className="capitalize">{c.type}</div>
            <div>{c.type === "flat" ? `₹${c.value}` : `${c.value}%`}</div>
            <div>₹{c.minOrderValue || 0}</div>
            <div>
              {c.usedCount}/{c.usageLimit || "∞"}
            </div>
            <div>{new Date(c.expiryDate).toLocaleDateString()}</div>
            <div className="text-right">
              <button
                onClick={() => deleteCoupon(c._id)}
                className="text-red-500 underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCoupon;
