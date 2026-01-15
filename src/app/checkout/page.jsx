"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import { Trash2, Plus, Minus, X } from "lucide-react";
import toast from "react-hot-toast";
import gsap from "gsap";

const PALETTE = {
  BG: "bg-[#fff9f4]",
  BORDER: "border-[#deb887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321] text-white hover:bg-[#7a4a27]",
};

export default function CheckoutPage() {
  const { user, getUser, setUser } = useUserStore();
  const { cart, fetchCart, updateQty, removeFromCart } = useCartStore();

  const [addressModal, setAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(0);

  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  useEffect(() => {
    fetchCart();
    getUser();
    gsap.from(".checkout-wrapper", { opacity: 0, y: 20, duration: 0.35 });

    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
    }
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.qty,
    0
  );

  const delivery = subtotal > 999 ? 0 : 69;
  const total = subtotal + delivery;

  const saveAddress = async () => {
    if (!newAddress.street || !newAddress.city)
      return toast.error("Enter full address!");

    const updatedAddresses = [...(user?.addresses || []), newAddress];

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addresses: updatedAddresses,
        defaultAddress: updatedAddresses.length - 1,
      }),
    });

    if (!res.ok) return toast.error("Failed saving address");

    setUser({
      ...user,
      addresses: updatedAddresses,
      defaultAddress: updatedAddresses.length - 1,
    });

    setSelectedAddress(updatedAddresses.length - 1);
    setAddressModal(false);
    toast.success("Address Saved 🎉");
  };

  const handlePayment = async () => {
    if (!user) return toast.error("Login Required!");

    if (!user.addresses || user.addresses.length === 0)
      return toast.error("Add an address first!");

    const selected = user.addresses[selectedAddress];

    const orderRes = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    });

    const order = await orderRes.json();

    if (!order.id) return toast.error("Payment gateway error!");

    const razor = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      name: "Branded Collection",
      description: "Order Payment",
      prefill: {
        name: `${user?.firstName || ""} ${user?.lastName || ""}`,
        email: user?.email,
      },
      notes: {
        userId: user._id,
        address: `${selected.street}, ${selected.city}, ${selected.state} - ${selected.postalCode}`,
      },

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

        if (verifyData.success) {
          toast.success("Payment Successful 🎉");
          window.location.href = "/checkout/success";
        } else {
          toast.error("Payment Failed");
        }
      },
    });

    razor.open();
  };

  if (!cart.length)
    return (
      <div className="text-center py-20 text-lg">🛒 Your cart is empty.</div>
    );

  return (
    <>
      <div className={`checkout-wrapper max-w-6xl mx-auto p-6 ${PALETTE.BG}`}>
        <h1 className={`text-3xl font-bold mb-4 ${PALETTE.TEXT}`}>Checkout</h1>

        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          <div className="space-y-5">
            {cart.map((item) => (
              <div
                key={item.productId + item.size}
                className={`border ${PALETTE.BORDER} bg-white p-4 rounded-xl shadow-sm flex justify-between items-center`}
              >
                <div className="flex items-center gap-3">
                  <Image src={item.image} width={90} height={90} alt="" />
                  <div>
                    <p className={`font-semibold ${PALETTE.TEXT}`}>
                      {item.name}
                    </p>
                    <p className="text-xs opacity-60">Size: {item.size}</p>
                    <p className="font-semibold mt-1">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Minus
                    className="cursor-pointer"
                    onClick={() =>
                      updateQty(
                        item.productId,
                        item.size,
                        Math.max(1, item.qty - 1)
                      )
                    }
                  />
                  <span>{item.qty}</span>
                  <Plus
                    className="cursor-pointer"
                    onClick={() =>
                      updateQty(item.productId, item.size, item.qty + 1)
                    }
                  />
                  <Trash2
                    className="text-red-500 cursor-pointer"
                    onClick={() => removeFromCart(item.productId, item.size)}
                  />
                </div>
              </div>
            ))}

            <div className={`border rounded-xl p-5 bg-white ${PALETTE.BORDER}`}>
              <div className="flex justify-between items-center mb-2">
                <h2 className={`font-semibold ${PALETTE.TEXT}`}>
                  Delivery Address
                </h2>
                <button
                  className="underline text-sm"
                  onClick={() => setAddressModal(true)}
                >
                  + Add New
                </button>
              </div>

              {user?.addresses?.length ? (
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full border p-2 rounded-md"
                >
                  {user.addresses.map((addr, index) => (
                    <option key={index} value={index}>
                      {addr.street}, {addr.city}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  className={`${PALETTE.ACCENT} px-4 py-2 rounded-md`}
                  onClick={() => setAddressModal(true)}
                >
                  Add Address
                </button>
              )}
            </div>
          </div>

          <div
            className={`border rounded-xl shadow-md p-6 bg-white ${PALETTE.BORDER}`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${PALETTE.TEXT}`}>
              Order Summary
            </h2>

            <p className="flex justify-between">
              <span>Subtotal</span> ₹{subtotal}
            </p>
            <p className="flex justify-between">
              <span>Delivery</span> {delivery === 0 ? "Free" : `₹${delivery}`}
            </p>

            <hr className="my-3" />

            <p className="flex justify-between text-xl font-bold">
              <span>Total</span> ₹{total}
            </p>

            <button
              onClick={handlePayment}
              className={`${PALETTE.ACCENT} w-full mt-6 py-3 rounded-lg font-semibold`}
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>

      {addressModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-5 w-[380px] rounded-xl shadow-xl relative">
            <X
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setAddressModal(false)}
            />
            <h3 className="font-semibold text-lg mb-4">Add Address</h3>

            {["street", "city", "state", "postalCode"].map((field) => (
              <input
                key={field}
                placeholder={field.toUpperCase()}
                className="border p-2 rounded-md w-full mb-2"
                onChange={(e) =>
                  setNewAddress({ ...newAddress, [field]: e.target.value })
                }
              />
            ))}

            <button
              onClick={saveAddress}
              className={`${PALETTE.ACCENT} w-full py-2 rounded-md`}
            >
              Save Address
            </button>
          </div>
        </div>
      )}
    </>
  );
}
