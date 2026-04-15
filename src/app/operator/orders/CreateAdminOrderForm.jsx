"use client";

import { useEffect, useState } from "react";

export default function CreateInvoiceForm() {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  /* LOAD PRODUCTS */
  useEffect(() => {
    async function loadProducts() {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    }
    loadProducts();
  }, []);

  /* ADD ONLINE PRODUCT */
  function addProduct(productId) {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    setItems((prev) => [
      ...prev,
      {
        product: product._id,
        productName: product.name,
        price: product.price.current,
        qty: 1,
        size: "M",
        isCustom: false,
      },
    ]);
  }

  /* ADD MANUAL PRODUCT */
  function addManualItem() {
    setItems((prev) => [
      ...prev,
      {
        product: null,
        productName: "",
        price: 0,
        qty: 1,
        size: "",
        isCustom: true,
      },
    ]);
  }

  function updateItem(index, key, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const total = items.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.qty),
    0
  );

  /* SUBMIT */
  async function submitInvoice() {
    if (!customerName || items.length === 0) {
      alert("Customer name & at least one item required");
      return;
    }

    const payload = {
      customerName,
      customerEmail,
      items: items.map((i) => ({
        product: i.product,
        productName: i.productName,
        qty: i.qty,
        size: i.size,
        price: i.price,
      })),
      amount: total,
      status: "paid",
    };

    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Failed to create invoice");
      return;
    }

    alert("Invoice created");
    setItems([]);
    setCustomerName("");
    setCustomerEmail("");
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl border">
      <h2 className="text-lg font-semibold">Create Offline Invoice</h2>

      {/* CUSTOMER */}
      <div className="grid md:grid-cols-2 gap-4">
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer Name"
          className="border px-3 py-2 rounded"
        />
        <input
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Customer Email (optional)"
          className="border px-3 py-2 rounded"
        />
      </div>

      {/* ADD PRODUCT */}
      <select
        onChange={(e) => addProduct(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Add Product from Store</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} — ₹{p.price.current}
          </option>
        ))}
      </select>

      {/* ADD MANUAL */}
      <button
        onClick={addManualItem}
        className="border px-4 py-2 rounded text-sm"
      >
        + Add Custom Item
      </button>

      {/* ITEMS */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-2 items-center border p-3 rounded"
          >
            {/* NAME */}
            <input
              value={item.productName}
              onChange={(e) => updateItem(i, "productName", e.target.value)}
              placeholder="Product name"
              disabled={!item.isCustom}
              className={`border px-2 py-1 col-span-2 rounded ${
                !item.isCustom && "bg-gray-100"
              }`}
            />

            {/* SIZE */}
            <input
              value={item.size}
              onChange={(e) => updateItem(i, "size", e.target.value)}
              placeholder="Size"
              className="border px-2 py-1 rounded"
            />

            {/* PRICE (EDITABLE) */}
            <input
              type="number"
              value={item.price}
              onChange={(e) => updateItem(i, "price", Number(e.target.value))}
              className="border px-2 py-1 rounded"
            />

            {/* QTY */}
            <input
              type="number"
              min={1}
              value={item.qty}
              onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
              className="border px-2 py-1 rounded"
            />

            {/* REMOVE */}
            <button onClick={() => removeItem(i)} className="text-red-600">
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span>₹{total}</span>
      </div>

      <button
        onClick={submitInvoice}
        className="bg-[#4a2e1f] text-white px-6 py-2 rounded"
      >
        Create Invoice
      </button>
    </div>
  );
}
