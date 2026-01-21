"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Trash2, Plus, Minus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import gsap from "gsap";

const PALETTE = {
  BG: "bg-[#fff9f4]",
  BORDER: "border-[#deb887]",
  TEXT: "text-[#654321]",
  ACCENT_BG: "bg-[#654321] text-white",
  ACCENT_BORDER: "border-[#654321]",
};

export default function CartPage() {
  const { cart, fetchCart, updateQty, removeFromCart } = useCartStore();
  const { user, getUser, setUser } = useUserStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(
    user?.defaultAddress ?? 0,
  );
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    fetchCart();
    getUser();
    if (typeof window !== "undefined" && !window.Razorpay) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(s);
    }
  }, []);

  useEffect(() => {
    gsap.fromTo(
      ".step-content",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3 },
    );
  }, [step]);

  const subtotal = useMemo(
    () => cart.reduce((acc, it) => acc + Number(it.price) * it.qty, 0),
    [cart],
  );
  const delivery = subtotal > 999 || subtotal === 0 ? 0 : 69;
  const discount = couponData?.discount || 0;
  const total = Math.max(0, subtotal + delivery - discount);

  const applyCoupon = async () => {
    if (!couponCode) return toast.error("Enter coupon code");
    try {
      setCouponLoading(true);
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal }),
      });
      const data = await res.json();
      setCouponLoading(false);
      if (!res.ok) {
        setCouponData(null);
        return toast.error(data.message || "Invalid coupon");
      }
      setCouponData(data.coupon);
      toast.success(`Coupon ${data.coupon.code} applied`);
    } catch {
      setCouponLoading(false);
      toast.error("Failed to apply coupon");
    }
  };

  const saveAddress = async () => {
    if (!newAddress.street || !newAddress.city)
      return toast.error("Please enter a valid address");
    const updated = [...(user?.addresses || []), newAddress];
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addresses: updated,
          defaultAddress: updated.length - 1,
        }),
      });
      if (!res.ok) throw new Error("Failed to save address");
      setUser({
        ...user,
        addresses: updated,
        defaultAddress: updated.length - 1,
      });
      setSelectedAddressIndex(updated.length - 1);
      setAddressModalOpen(false);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
      });
      toast.success("Address saved");
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  const handlePayment = async () => {
    if (!user) return toast.error("Please login to continue");
    if (!user.addresses || user.addresses.length === 0)
      return toast.error("Add an address first");
    const selected = user.addresses[selectedAddressIndex];
    try {
      setLoadingPayment(true);
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const order = await orderRes.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Branded Collection",
        handler: async function (response) {
          const verifyRes = await fetch("/api/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              cart,
              amount: total,
              address: selected,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) window.location.href = "/checkout/success";
          else toast.error("Payment verification failed");
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setLoadingPayment(false);
      toast.error("Payment failed");
    }
  };

  // Reusable Coupon Section Component
  const CouponSection = () => (
    <div className="mt-4">
      {couponData ? (
        <div className="flex justify-between items-center bg-green-50 p-3 rounded text-sm">
          <div>
            <div className="font-medium text-green-700">
              Coupon Applied: {couponData.code}
            </div>
            <div className="text-xs text-green-600">
              You saved ₹{couponData.discount}
            </div>
          </div>
          <button
            onClick={() => {
              setCouponData(null);
              setCouponCode("");
            }}
            className="text-red-500 text-xs"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Coupon code"
            className="flex-1 border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={applyCoupon}
            disabled={couponLoading}
            className={`px-3 py-1 rounded ${PALETTE.ACCENT_BG} text-sm`}
          >
            {couponLoading ? "Applying..." : "Apply"}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`cart-page-wrap min-h-screen py-10 ${PALETTE.BG}`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Stepper (Restored Style) */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1">
              <ol className="flex items-center justify-center md:justify-start gap-8 text-sm">
                <li
                  className={`flex items-center gap-3 ${step >= 1 ? PALETTE.TEXT : "text-gray-400"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === 1 ? PALETTE.ACCENT_BG : "bg-white"}`}
                  >
                    1
                  </div>
                  <div>
                    <div className="font-semibold">My Bag</div>
                    <div className="text-xs opacity-60">Items in your bag</div>
                  </div>
                </li>
                <li
                  className={`hidden md:flex h-0.5 bg-gray-200 flex-1 mx-4 ${step > 1 ? "bg-[#654321]" : ""}`}
                ></li>
                <li
                  className={`flex items-center gap-3 ${step >= 2 ? PALETTE.TEXT : "text-gray-400"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === 2 ? PALETTE.ACCENT_BG : "bg-white"}`}
                  >
                    2
                  </div>
                  <div>
                    <div className="font-semibold">Address</div>
                    <div className="text-xs opacity-60">Select or add</div>
                  </div>
                </li>
                <li
                  className={`hidden md:flex h-0.5 bg-gray-200 flex-1 mx-4 ${step > 2 ? "bg-[#654321]" : ""}`}
                ></li>
                <li
                  className={`flex items-center gap-3 ${step >= 3 ? PALETTE.TEXT : "text-gray-400"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === 3 ? PALETTE.ACCENT_BG : "bg-white"}`}
                  >
                    3
                  </div>
                  <div>
                    <div className="font-semibold">Payment</div>
                    <div className="text-xs opacity-60">Pay securely</div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
          <div className="step-content space-y-6">
            {/* STEP 1: BAG */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-4">My Bag</h2>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    🛒 Your bag is empty.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={`${item._id}-${item.selectedSize}`}
                        className="flex items-center gap-4 p-3 rounded-md border"
                      >
                        <div className="w-28 h-28 relative overflow-hidden rounded-md bg-[#f4efe8]">
                          <Image
                            src={
                              item.imageFront?.startsWith("/api")
                                ? item.imageFront
                                : `/api/images/${item.imageFront}`
                            }
                            alt={item.name}
                            width={112}
                            height={112}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-sm">
                                {item.name}
                              </p>
                              {item.selectedSize !== "General" && (
                                <p className="text-xs text-gray-600">
                                  Size: {item.selectedSize}
                                </p>
                              )}
                              <p className="mt-2 font-bold">₹{item.price}</p>
                            </div>
                            <button
                              onClick={() =>
                                removeFromCart(item._id, item.selectedSize)
                              }
                              className="text-red-500"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              onClick={() =>
                                updateQty(
                                  item._id,
                                  item.selectedSize,
                                  Math.max(1, item.qty - 1),
                                )
                              }
                              className="px-2 py-1 border rounded"
                            >
                              <Minus size={14} />
                            </button>
                            <div className="px-3">{item.qty}</div>
                            <button
                              onClick={() =>
                                updateQty(
                                  item._id,
                                  item.selectedSize,
                                  item.qty + 1,
                                )
                              }
                              className="px-2 py-1 border rounded"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <CouponSection />
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: ADDRESS */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
                {user?.addresses?.length ? (
                  <div className="space-y-3">
                    {user.addresses.map((addr, i) => (
                      <label
                        key={i}
                        className={`block border p-3 rounded cursor-pointer flex items-start gap-3 ${selectedAddressIndex == i ? `ring-2 ${PALETTE.BORDER}` : ""}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressIndex == i}
                          onChange={() => setSelectedAddressIndex(i)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{addr.street}</div>
                          <div className="text-xs text-gray-600">
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    No saved addresses.
                  </div>
                )}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setAddressModalOpen(true)}
                    className="px-4 py-2 rounded border"
                  >
                    + Add New Address
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded border"
                  >
                    Back to Bag
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-4">
                  Payment & Finalize
                </h2>
                <div className="p-4 border rounded bg-gray-50 mb-4">
                  <p className="text-sm font-bold">Shipping to:</p>
                  <p className="text-xs text-gray-600">
                    {user?.addresses[selectedAddressIndex]?.street},{" "}
                    {user?.addresses[selectedAddressIndex]?.city}
                  </p>
                </div>

                {/* Coupon input added here as requested */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Have a coupon?</p>
                  <CouponSection />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded border"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loadingPayment}
                    className={`px-6 py-2 rounded ${PALETTE.ACCENT_BG}`}
                  >
                    {loadingPayment ? "Processing..." : `Pay ₹${total}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right column: STICKY SUMMARY */}
          <aside className="order-summary-stick">
            <div className="bg-white p-4 rounded-lg shadow-sm sticky top-6">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{delivery === 0 ? "Free" : `₹${delivery}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <div className="mt-4">
                {step === 1 && (
                  <button
                    onClick={() =>
                      cart.length > 0 ? setStep(2) : toast.error("Bag is empty")
                    }
                    className={`w-full px-4 py-2 rounded ${PALETTE.ACCENT_BG}`}
                  >
                    Continue to Address
                  </button>
                )}
                {step === 2 && (
                  <button
                    onClick={() =>
                      user?.addresses?.length > 0
                        ? setStep(3)
                        : toast.error("Add address")
                    }
                    className={`w-full px-4 py-2 rounded ${PALETTE.ACCENT_BG}`}
                  >
                    Continue to Payment
                  </button>
                )}
                {step === 3 && (
                  <button
                    onClick={handlePayment}
                    disabled={loadingPayment}
                    className={`w-full px-4 py-2 rounded ${PALETTE.ACCENT_BG}`}
                  >
                    {loadingPayment ? "Processing..." : `Pay ₹${total}`}
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Address Modal (Styles preserved) */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add Address</h3>
              <button onClick={() => setAddressModalOpen(false)}>
                <X />
              </button>
            </div>
            <div className="space-y-2">
              <input
                className="w-full border p-2 rounded"
                placeholder="Street"
                value={newAddress.street}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, street: e.target.value })
                }
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Postal Code"
                value={newAddress.postalCode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, postalCode: e.target.value })
                }
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setAddressModalOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={saveAddress}
                className={`px-4 py-2 rounded ${PALETTE.ACCENT_BG}`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
