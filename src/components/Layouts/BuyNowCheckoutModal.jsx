"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";

export default function BuyNowCheckoutModal({ item, onClose }) {
  const { user, getUser, setUser } = useUserStore();
  const { fetchCart } = useCartStore();

  // steps: 1 = address, 2 = payment
  const [step, setStep] = useState(1);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // new address state
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  // Check stock availability
  const totalStock =
    item.sizes?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;
  const isOutOfStock = totalStock === 0;

  const price = Number(item.price);
  const delivery = price > 999 ? 0 : 69;
  const total = price + delivery;

  // fetch user + load razorpay
  useEffect(() => {
    getUser();

    if (typeof window !== "undefined" && !window.Razorpay) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(s);
    }
  }, []);

  // sync default address when user loads
  useEffect(() => {
    if (user?.defaultAddress !== undefined) {
      setSelectedAddressIndex(user.defaultAddress || 0);
    }
  }, [user]);

  // save address (same logic as cart page)
  const saveAddress = async () => {
    if (!newAddress.street || !newAddress.city) {
      toast.error("Please enter a valid address");
      return;
    }

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
      console.error(err);
      toast.error("Failed to save address");
    }
  };

  // payment
  const handlePayment = async () => {
    if (!user) return toast.error("Please login");
    if (!user.addresses?.length) return toast.error("Add address first");

    const address = user.addresses[selectedAddressIndex];

    try {
      setLoadingPayment(true);

      // ✅ STEP 1: Create reservation (locks stock for 15 minutes)
      const reservationRes = await fetch("/api/reservation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: [item],
          amount: total,
          address: {
            ...address,
            phone: user.number || "",
          },
        }),
      });

      const reservationData = await reservationRes.json();

      if (!reservationData.success) {
        toast.error(reservationData.message || "Failed to reserve items");
        setLoadingPayment(false);
        return;
      }

      // ✅ STEP 2: Open Razorpay with reservation ID
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: reservationData.amount * 100, // Convert to paise
        currency: "INR",
        order_id: reservationData.razorpayOrderId,
        name: "Branded Collection",
        description: "Buy Now",
        handler: async function (response) {
          // ✅ STEP 3: Verify payment with reservation ID
          const verify = await fetch("/api/checkout/verify-payment", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              reservationId: reservationData.reservationId,
            }),
          });

          const data = await verify.json();
          setLoadingPayment(false);

          if (data.success) {
            toast.success("Order placed 🎉");
            window.location.href = "/checkout/success";
          } else {
            // ✅ Payment failed - cancel reservation and restore stock
            await fetch(
              `/api/reservation?id=${reservationData.reservationId}`,
              {
                method: "DELETE",
                credentials: "include",
              },
            );
            toast.error(data.message || "Payment failed. Stock restored.");
            await fetchCart(); // Refresh cart if available
            setLoadingPayment(false);
          }
        },

        modal: {
          ondismiss: async function () {
            // ✅ User closed payment modal - cancel reservation
            await fetch(
              `/api/reservation?id=${reservationData.reservationId}`,
              {
                method: "DELETE",
                credentials: "include",
              },
            );
            toast.error("Payment cancelled. Stock restored.");
            setLoadingPayment(false);
          },
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      // ✅ Error occurred - cancel reservation
      if (reservationData?.reservationId) {
        await fetch(
          `/api/reservation?id=${reservationData.reservationId}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
      }
      toast.error("Payment failed. Stock restored.");
      setLoadingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-lg p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X />
        </button>

        {/* Product */}
        <div className="flex gap-4 border-b pb-4">
          {item.image ? (
            <Image
              src={item.image}
              width={90}
              height={90}
              alt={item.name}
              className="rounded object-cover"
            />
          ) : (
            <div className="w-[90px] h-[90px] bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              No Image
            </div>
          )}

          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-600">Size: {item.size}</p>
            <p className="font-bold mt-1">₹{price}</p>
          </div>
        </div>

        {/* ADDRESS STEP */}
        {step === 1 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Delivery Address</h3>

            {!user ? (
              <div className="text-sm text-gray-500">Loading address…</div>
            ) : user.addresses?.length > 0 ? (
              <div className="space-y-2">
                {user.addresses.map((addr, i) => (
                  <label
                    key={i}
                    className={`block border p-3 rounded cursor-pointer flex gap-3 ${
                      selectedAddressIndex === i ? "ring-2 ring-[#654321]" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressIndex === i}
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
              <div className="text-sm text-gray-600">No saved addresses.</div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setAddressModalOpen(true)}
                className="px-4 py-2 rounded border"
              >
                + Add New Address
              </button>

              {user?.addresses?.length > 0 && (
                <button
                  onClick={() => setStep(2)}
                  className="ml-auto px-4 py-2 rounded bg-[#654321] text-white"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}

        {/* PAYMENT STEP */}
        {step === 2 && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{price}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{delivery === 0 ? "Free" : `₹${delivery}`}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={loadingPayment}
              className="w-full bg-[#654321] text-white py-2 rounded"
            >
              {loadingPayment ? "Processing..." : `Pay ₹${total}`}
            </button>
          </div>
        )}
      </div>

      {/* ADD ADDRESS MODAL */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
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
                  setNewAddress({
                    ...newAddress,
                    postalCode: e.target.value,
                  })
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
                className="px-4 py-2 rounded bg-[#654321] text-white"
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
